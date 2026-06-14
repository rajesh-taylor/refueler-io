// supabase/functions/bolt11-create-invoice/index.ts
// Refueler — BOLT11 invoice creation edge function
// CC-08 · Session 16 · 9 June 2026
//
// Flow:
//   1. Validate request body
//   2. Check no duplicate order_id in orders table
//   3. Call Zebedee POST /v0/charges
//   4. Write invoice data to orders (bolt11_invoice, zebedee_charge_id, invoice_expires_at, sats_amount, payment_status='unpaid')
//   5. Insert merchant_orders row with status='awaiting_payment'
//   6. Return { bolt11, zebedee_charge_id, expires_at }
//
// Secrets required (set via `supabase secrets set`):
//   ZEBEDEE_API_KEY
//   SUPABASE_URL           (auto-injected)
//   SUPABASE_SERVICE_ROLE_KEY (auto-injected)

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const INVOICE_TTL_SECONDS = 600; // 10 minutes — align with mintInterface.ts
const ZBD_CHARGES_URL = 'https://api.zebedee.io/v0/charges';
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RequestBody {
  order_id: string;
  venue_id: string;
  pseudonym_id: string;
  items: unknown[];
  sats_amount: number;
}

interface ZbdChargeResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    invoice: {
      request: string; // the BOLT11 payment request string
      uri: string;
    };
    expiresAt: string;
  };
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

function buildExpiresAt(ttlSeconds = INVOICE_TTL_SECONDS): string {
  return new Date(Date.now() + ttlSeconds * 1000).toISOString();
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

  // --- Parse body ---
  let body: RequestBody;
  try {
    body = await req.json() as RequestBody;
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const { order_id, venue_id, pseudonym_id, items, sats_amount } = body;

  // --- Validate required fields ---
  if (!order_id || !venue_id || !pseudonym_id || !Array.isArray(items) || typeof sats_amount !== 'number') {
    return jsonResponse({ error: 'Missing required fields: order_id, venue_id, pseudonym_id, items, sats_amount' }, 400);
  }

  if (sats_amount < 1) {
    return jsonResponse({ error: 'sats_amount must be at least 1' }, 400);
  }

  // --- Supabase client (service role — bypasses RLS for authoritative writes) ---
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );

  // --- Duplicate check ---
  const { data: existing, error: fetchError } = await supabase
    .from('orders')
    .select('id')
    .eq('id', order_id)
    .maybeSingle();

  if (fetchError) {
    console.error('Duplicate check failed:', fetchError.message);
    return jsonResponse({ error: 'Database error during duplicate check' }, 500);
  }

  if (existing) {
    return jsonResponse({ error: 'Order already exists' }, 409);
  }

  // --- Call Zebedee API ---
  const zbdApiKey = Deno.env.get('ZEBEDEE_API_KEY');
  if (!zbdApiKey) {
    console.error('ZEBEDEE_API_KEY not set');
    return jsonResponse({ error: 'Payment provider not configured' }, 503);
  }

  const expiresAt = buildExpiresAt();

  let zbdResponse: ZbdChargeResponse;
  try {
    const zbdRes = await fetch(ZBD_CHARGES_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': zbdApiKey,
      },
      body: JSON.stringify({
        amount: String(sats_amount * 1000), // ZBD uses millisatoshis
        expiresIn: INVOICE_TTL_SECONDS,
        description: `Refueler order ${order_id}`,
        internalId: order_id,
      }),
    });

    if (!zbdRes.ok) {
      const errText = await zbdRes.text();
      console.error('ZBD API error:', zbdRes.status, errText);
      return jsonResponse({ error: 'Payment provider unavailable' }, 503);
    }

    zbdResponse = await zbdRes.json() as ZbdChargeResponse;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Network error';
    console.error('ZBD fetch failed:', message);
    return jsonResponse({ error: 'Payment provider unreachable' }, 503);
  }

  if (!zbdResponse.success || !zbdResponse.data?.invoice?.request) {
    console.error('ZBD returned unexpected payload:', JSON.stringify(zbdResponse));
    return jsonResponse({ error: 'Unexpected response from payment provider' }, 503);
  }

  const { id: zebedeChargeId, invoice: { request: bolt11Invoice } } = zbdResponse.data;

  // --- Write to orders ---
  // NOTE: bolt11_invoice should be stored encrypted in production via pgcrypto/Vault.
  // For CC-08 dev iteration, stored as plain text — encrypt before production.
  const { error: ordersInsertError } = await supabase
    .from('orders')
    .insert({
      id: order_id,
      pseudonym_id,
      venue_id,
      bolt11_invoice: bolt11Invoice,
      zebedee_charge_id: zebedeChargeId,
      invoice_expires_at: expiresAt,
      sats_amount,
      payment_status: 'unpaid',
      settled_at: null,
    });

  if (ordersInsertError) {
    console.error('orders insert failed:', ordersInsertError.message);
    return jsonResponse({ error: 'Failed to persist order' }, 500);
  }

  // --- Write to merchant_orders ---
  const { error: merchantOrdersInsertError } = await supabase
    .from('merchant_orders')
    .insert({
      order_id,
      venue_id,
      pseudonym_id,
      items,
      status: 'awaiting_payment',
    });

  if (merchantOrdersInsertError) {
    console.error('merchant_orders insert failed:', merchantOrdersInsertError.message);
    // Non-fatal for payment flow — log and continue. Merchant queue will miss this row
    // until a reconciliation sweep is implemented (CC-09 candidate).
  }

  // --- Return invoice to client ---
  return jsonResponse({
    bolt11: bolt11Invoice,
    zebedee_charge_id: zebedeChargeId,
    expires_at: expiresAt,
  });
});
