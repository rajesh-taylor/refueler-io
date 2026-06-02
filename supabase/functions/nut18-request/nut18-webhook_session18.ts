/**
 * Refueler — NUT-18 Webhook Edge Function (NUT-14 HTLC extension)
 * Session 18 · supabase/functions/nut18-webhook/index.ts
 *
 * Extends Session 14 webhook handler with NUT-14 HTLC event types.
 *
 * Wallet-side enforcement model — webhook behaviour:
 *   htlc_fulfilled → venue claimed the token; transition to fulfilled
 *   htlc_expired   → NOT expected from mint in wallet-side model.
 *                    If received (defensive), log only — do not act.
 *                    UI layer drives expired transition via local timer.
 *
 * HMAC-SHA256 verification unchanged from Session 14.
 * Replay window: ±5 minutes.
 * Silent reject → webhook_security_log (no 4xx to avoid retry storms).
 */

import { serve }        from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const SIGNING_SECRET = Deno.env.get('WEBHOOK_SIGNING_SECRET')!; // Supabase Vault
const SUPABASE_URL   = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_KEY   = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const REPLAY_WINDOW  = 5 * 60; // seconds

// ---------------------------------------------------------------------------
// HMAC verification (unchanged from Session 14)
// ---------------------------------------------------------------------------

async function verifyHMAC(
  payload:   string,
  timestamp: string,
  orderRef:  string,
  amount:    string,
  signature: string
): Promise<boolean> {
  const message     = `${timestamp}.${orderRef}.${amount}`;
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(SIGNING_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sigBytes = await crypto.subtle.sign(
    'HMAC',
    keyMaterial,
    new TextEncoder().encode(message)
  );
  const expected = Array.from(new Uint8Array(sigBytes))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return expected === signature;
}

// ---------------------------------------------------------------------------
// Event types
// ---------------------------------------------------------------------------

type WebhookEvent =
  | 'order.paid'
  | 'order.fulfilled'
  | 'order.collected'
  | 'htlc.fulfilled'    // NUT-14: venue claimed the locked token
  | 'htlc.expired';     // NUT-14: defensive — should not arrive in wallet-side model

interface WebhookPayload {
  event:       WebhookEvent;
  order_ref:   string;
  venue_id:    string;
  amount_sats: number;
  timestamp:   string;
  signature:   string;
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const sourceIP = req.headers.get('x-forwarded-for') ?? 'unknown';

  let body: WebhookPayload;
  let rawBody: string;

  try {
    rawBody = await req.text();
    body    = JSON.parse(rawBody);
  } catch {
    return new Response('Bad request', { status: 400 });
  }

  const { event, order_ref, venue_id, amount_sats, timestamp, signature } = body;

  // -------------------------------------------------------------------------
  // Replay window check
  // -------------------------------------------------------------------------

  const eventTime = new Date(timestamp).getTime() / 1000;
  const now       = Date.now() / 1000;

  if (Math.abs(now - eventTime) > REPLAY_WINDOW) {
    await supabase.from('webhook_security_log').insert({
      order_ref,
      reason:    'replay_window_exceeded',
      source_ip: sourceIP,
    });
    // Silent 200 — no retry storm
    return new Response('OK', { status: 200 });
  }

  // -------------------------------------------------------------------------
  // HMAC verification
  // -------------------------------------------------------------------------

  const valid = await verifyHMAC(
    rawBody,
    timestamp,
    order_ref,
    String(amount_sats),
    signature
  ).catch(() => false);

  if (!valid) {
    await supabase.from('webhook_security_log').insert({
      order_ref,
      reason:    'hmac_invalid',
      source_ip: sourceIP,
    });
    return new Response('OK', { status: 200 });
  }

  // -------------------------------------------------------------------------
  // Event routing
  // -------------------------------------------------------------------------

  switch (event) {

    // -----------------------------------------------------------------------
    // Session 14 events — unchanged
    // -----------------------------------------------------------------------

    case 'order.paid': {
      await supabase
        .from('nut18_orders')
        .update({ status: 'paid' })
        .eq('order_ref', order_ref)
        .eq('status', 'pending');
      break;
    }

    case 'order.fulfilled': {
      await supabase
        .from('nut18_orders')
        .update({ status: 'fulfilled' })
        .eq('order_ref', order_ref)
        .eq('status', 'paid');
      break;
    }

    case 'order.collected': {
      await supabase
        .from('nut18_orders')
        .update({ status: 'collected' })
        .eq('order_ref', order_ref)
        .eq('status', 'fulfilled');
      break;
    }

    // -----------------------------------------------------------------------
    // NUT-14: venue claimed the HTLC token — fulfilment confirmed
    // -----------------------------------------------------------------------

    case 'htlc.fulfilled': {
      await supabase
        .from('nut18_orders')
        .update({
          status:      'fulfilled',
          htlc_status: 'fulfilled',
        })
        .eq('order_ref', order_ref)
        .in('status', ['pending', 'paid']); // guard
      break;
    }

    // -----------------------------------------------------------------------
    // NUT-14: expiry signal from mint — defensive only.
    // Wallet-side model: we do not expect this. Log and take no action.
    // UI drives expired transition via local HTLC timer in useHTLCExpiry hook.
    // -----------------------------------------------------------------------

    case 'htlc.expired': {
      console.warn('[nut18-webhook] htlc.expired received — unexpected in wallet-side model', {
        order_ref,
        venue_id,
      });
      await supabase.from('webhook_security_log').insert({
        order_ref,
        reason:    'htlc_expired_unexpected',
        source_ip: sourceIP,
      });
      // No state transition — wallet handles refund claim
      break;
    }

    default: {
      console.warn('[nut18-webhook] unknown event', event);
      break;
    }
  }

  return new Response('OK', { status: 200 });
});
