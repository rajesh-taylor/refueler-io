/**
 * Refueler — NUT-18 Request Edge Function (NUT-14 HTLC extension)
 * Session 18 · supabase/functions/nut18-request/index.ts
 *
 * Extends Session 14 nut18-request with NUT-14 HTLC escrow.
 * Wallet-side enforcement: generates HTLC secret + expiry, stores in
 * nut18_orders, includes lock_hash in the NUT-18 payload to the mint.
 * Preimage is NOT stored — it travels to the client for the wallet layer.
 *
 * Response now includes htlcPreimage for the client to pass to Minibits
 * wallet. The wallet monitors the HTLC and claims refund on expiry.
 *
 * Open: NUT-18 send endpoint path pending Minibits confirmation.
 * Update MINT_SEND_PATH constant below when confirmed.
 */

import { serve }        from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const MINT_URL       = Deno.env.get('MINT_URL')!;
const MINT_SEND_PATH = '/v1/nut18/request'; // ← confirm with Minibits
const SUPABASE_URL   = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_KEY   = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const DEFAULT_HTLC_TIMEOUT_SECONDS = 480;

// ---------------------------------------------------------------------------
// Helpers (duplicated from mintInterface.ts — Edge Functions are isolated)
// ---------------------------------------------------------------------------

async function generatePreimage(): Promise<string> {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function sha256Hex(hexInput: string): Promise<string> {
  const bytes  = hexInput.match(/.{2}/g)!.map(h => parseInt(h, 16));
  const buffer = new Uint8Array(bytes);
  const hash   = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  let body: {
    orderId:    string;
    venueId:    string;
    amountSats: number;
    itemLabel:  string;
  };

  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const { orderId, venueId, amountSats, itemLabel } = body;
  if (!orderId || !venueId || !amountSats || !itemLabel) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
  }

  // -------------------------------------------------------------------------
  // Griefing guard (Session 14 — unchanged)
  // -------------------------------------------------------------------------

  const oneHourAgo = new Date(Date.now() - 3_600_000).toISOString();
  const { count } = await supabase
    .from('nut18_orders')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', /* from JWT */ 'TODO') // replace with auth.uid() in RLS
    .in('status', ['pending', 'paid'])
    .gte('created_at', oneHourAgo);

  if ((count ?? 0) >= 5) {
    return new Response(
      JSON.stringify({ error: 'Too many pending orders — max 5 per hour' }),
      { status: 429 }
    );
  }

  // -------------------------------------------------------------------------
  // NUT-14 HTLC — generate secret and expiry
  // -------------------------------------------------------------------------

  // Fetch venue's HTLC timeout (fallback to default)
  const { data: venue } = await supabase
    .from('venues')
    .select('htlc_timeout_seconds')
    .eq('id', venueId)
    .single();

  const htlcTimeoutSeconds: number =
    venue?.htlc_timeout_seconds ?? DEFAULT_HTLC_TIMEOUT_SECONDS;

  const preimage   = await generatePreimage();
  const lockHash   = await sha256Hex(preimage);
  const nowUnix    = Math.floor(Date.now() / 1000);
  const expiryUnix = nowUnix + htlcTimeoutSeconds;
  const expiryISO  = new Date(expiryUnix * 1000).toISOString();

  // -------------------------------------------------------------------------
  // Insert order record (pending) with HTLC columns
  // -------------------------------------------------------------------------

  const { error: insertError } = await supabase
    .from('nut18_orders')
    .insert({
      order_ref:        orderId,
      venue_id:         venueId,
      amount_sats:      amountSats,
      item_label:       itemLabel,
      status:           'pending',
      htlc_lock_secret: lockHash,   // hash only — preimage never stored
      htlc_expiry:      expiryISO,
      htlc_status:      'locked',
    });

  if (insertError) {
    console.error('[nut18-request] insert failed', insertError);
    return new Response(
      JSON.stringify({ error: 'Order creation failed' }),
      { status: 500 }
    );
  }

  // -------------------------------------------------------------------------
  // Build NUT-18 payload (with NUT-14 lock)
  // -------------------------------------------------------------------------

  const mintPayload = {
    order_ref:   orderId,
    venue_id:    venueId,
    amount:      amountSats,
    unit:        'sat',
    description: itemLabel,
    htlc_lock: {
      lock_hash: lockHash,
      expiry:    expiryUnix,
    },
  };

  // -------------------------------------------------------------------------
  // Send to mint
  // -------------------------------------------------------------------------

  let mintResponse: Response;
  try {
    mintResponse = await fetch(`${MINT_URL}${MINT_SEND_PATH}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(mintPayload),
    });
  } catch (err) {
    console.error('[nut18-request] mint unreachable', err);
    return new Response(
      JSON.stringify({ error: 'Mint unreachable' }),
      { status: 503 }
    );
  }

  if (!mintResponse.ok) {
    const detail = await mintResponse.text().catch(() => '');
    return new Response(
      JSON.stringify({ error: 'Mint rejected request', detail }),
      { status: mintResponse.status }
    );
  }

  const mintData = await mintResponse.json();

  // -------------------------------------------------------------------------
  // Return to client — include preimage for wallet layer
  // Wallet needs preimage to monitor HTLC and claim refund on expiry.
  // -------------------------------------------------------------------------

  return new Response(
    JSON.stringify({
      success:      true,
      orderId,
      mintResponse: mintData,
      htlc: {
        preimage,       // client passes this to Minibits wallet layer
        lockHash,
        expiryUnix,
        expiryISO,
        timeoutSeconds: htlcTimeoutSeconds,
      },
    }),
    {
      status:  200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
});
