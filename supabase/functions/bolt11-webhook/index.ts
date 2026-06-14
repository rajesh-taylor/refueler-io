// supabase/functions/bolt11-webhook/index.ts
// Refueler — BOLT11 settlement webhook handler
// CC-08 · Session 16 · 9 June 2026
//
// Flow:
//   1. Verify HMAC-SHA256 signature from Zebedee (x-zebedee-signature header)
//   2. Parse ZBD webhook payload
//   3. Idempotency check — if orders.payment_status already = 'paid', return 200 immediately
//   4. Update orders: payment_status='paid', settled_at=now(), bolt11_invoice=NULL
//   5. Update merchant_orders: status='pending' (surfaces to merchant queue)
//   6. Return 200
//
// Secrets required:
//   ZEBEDEE_WEBHOOK_SECRET
//   SUPABASE_URL           (auto-injected)
//   SUPABASE_SERVICE_ROLE_KEY (auto-injected)

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { hmac } from 'https://deno.land/x/hmac@v2.0.1/mod.ts';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-zebedee-signature',
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ZbdWebhookPayload {
  id: string;           // ZBD charge ID — maps to orders.zebedee_charge_id
  internalId?: string;  // our order_id, set at charge creation
  status: string;       // 'completed' = paid; 'expired' = expired; others = ignore
  amount: string;       // millisatoshis as string
  settledAt?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

/**
 * Verify Zebedee HMAC-SHA256 signature.
 * Zebedee signs the raw request body with ZEBEDEE_WEBHOOK_SECRET.
 * Header: x-zebedee-signature = hex(HMAC-SHA256(secret, rawBody))
 */
async function verifySignature(rawBody: string, signature: string, secret: string): Promise<boolean> {
  try {
    const expected = hmac('sha256', secret, rawBody, 'utf8', 'hex');
    // Constant-time comparison to prevent timing attacks
    if (typeof expected !== 'string' || expected.length !== signature.length) return false;
    let diff = 0;
    for (let i = 0; i < expected.length; i++) {
      diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
    }
    return diff === 0;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'hmac error';
    console.error('Signature verification error:', message);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  // --- Read raw body (required for HMAC verification before JSON parse) ---
  const rawBody = await req.text();

  // --- Verify signature ---
  const webhookSecret = Deno.env.get('ZEBEDEE_WEBHOOK_SECRET');
  if (!webhookSecret) {
    console.error('ZEBEDEE_WEBHOOK_SECRET not configured');
    return jsonResponse({ error: 'Webhook not configured' }, 500);
  }

  const incomingSignature = req.headers.get('x-zebedee-signature') ?? '';
  if (!incomingSignature) {
    console.warn('bolt11-webhook: missing x-zebedee-signature header');
    return jsonResponse({ error: 'Missing signature' }, 401);
  }

  const valid = await verifySignature(rawBody, incomingSignature, webhookSecret);
  if (!valid) {
    console.warn('bolt11-webhook: invalid signature');
    return jsonResponse({ error: 'Invalid signature' }, 401);
  }

  // --- Parse payload ---
  let payload: ZbdWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as ZbdWebhookPayload;
  } catch {
    return jsonResponse({ error: 'Invalid JSON payload' }, 400);
  }

  const { id: zebedeChargeId, internalId: orderId, status } = payload;

  // --- Only process 'completed' status; ack others silently ---
  if (status !== 'completed') {
    console.log(`bolt11-webhook: ignoring status '${status}' for charge ${zebedeChargeId}`);
    return jsonResponse({ received: true, action: 'ignored', status });
  }

  if (!zebedeChargeId) {
    return jsonResponse({ error: 'Missing charge id in payload' }, 400);
  }

  // --- Supabase client ---
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );

  // --- Resolve order_id from zebedee_charge_id (internalId should match, but verify) ---
  const { data: order, error: lookupError } = await supabase
    .from('orders')
    .select('id, payment_status')
    .eq('zebedee_charge_id', zebedeChargeId)
    .maybeSingle();

  if (lookupError) {
    console.error('bolt11-webhook: order lookup failed:', lookupError.message);
    return jsonResponse({ error: 'Database lookup failed' }, 500);
  }

  if (!order) {
    // ZBD may send webhooks for charges created outside Refueler (test charges etc.)
    console.warn(`bolt11-webhook: no order found for charge ${zebedeChargeId}`);
    return jsonResponse({ received: true, action: 'not_found' });
  }

  // --- Idempotency check ---
  if (order.payment_status === 'paid') {
    console.log(`bolt11-webhook: order ${order.id} already marked paid — idempotent ack`);
    return jsonResponse({ received: true, action: 'already_settled' });
  }

  const resolvedOrderId = order.id as string;

  // --- Update orders ---
  const { error: ordersUpdateError } = await supabase
    .from('orders')
    .update({
      payment_status: 'paid',
      settled_at: new Date().toISOString(),
      bolt11_invoice: null, // clear invoice from DB on settlement — data minimisation
    })
    .eq('id', resolvedOrderId);

  if (ordersUpdateError) {
    console.error('bolt11-webhook: orders update failed:', ordersUpdateError.message);
    return jsonResponse({ error: 'Failed to update order payment status' }, 500);
  }

  // --- Update merchant_orders: awaiting_payment → pending ---
  const { error: merchantOrdersUpdateError } = await supabase
    .from('merchant_orders')
    .update({ status: 'pending' })
    .eq('order_id', resolvedOrderId)
    .eq('status', 'awaiting_payment'); // defensive: only transition from awaiting_payment

  if (merchantOrdersUpdateError) {
    // Log but do not fail — orders table is source of truth
    console.error('bolt11-webhook: merchant_orders update failed:', merchantOrdersUpdateError.message);
  }

  console.log(`bolt11-webhook: settled order ${resolvedOrderId} (ZBD charge ${zebedeChargeId})`);

  return jsonResponse({ received: true, action: 'settled', order_id: resolvedOrderId });
});
