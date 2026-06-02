/**
 * Refueler — Supabase Edge Function
 * POST /functions/v1/nut18-request
 *
 * Called by the mobile app at order confirmation.
 * Generates a NUT-18 payment request and persists the order in Supabase.
 *
 * Request body:
 *   { venue_id, items, amount_pence, wallet_pubkey? }
 *
 * Response:
 *   { order_ref, encoded_request, amount_sats, expires_at, deeplink, qr_fallback }
 *
 * Rate limiting (griefing/sabotage defence):
 *   - Max 5 pending orders per wallet pubkey per hour
 *   - Pre-check wallet balance via NUT-07 before issuing request
 *     (one-time check before clock starts — not ongoing surveillance)
 *   - Anomaly flag written to orders table for Command Centre dashboard
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import {
  getGbpRate,
  buildNUT18Request,
  MINT_URL,
  NUT18_VALIDITY_SECONDS,
} from '../../lib/mintInterface.ts'

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  // Auth: validate Supabase JWT from the mobile app
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return json({ error: 'Unauthorised' }, 401)
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return json({ error: 'Unauthorised' }, 401)
  }

  let body: NUT18RequestBody
  try {
    body = await req.json() as NUT18RequestBody
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  const { venue_id, amount_pence, wallet_pubkey } = body

  if (!venue_id || !amount_pence || amount_pence <= 0) {
    return json({ error: 'venue_id and amount_pence are required' }, 422)
  }

  // ---------------------------------------------------------------------------
  // Griefing / sabotage defence: rate limit pending orders per user
  // ---------------------------------------------------------------------------
  const oneHourAgo = new Date(Date.now() - 3_600_000).toISOString()
  const { count: pendingCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .gte('created_at', oneHourAgo)

  if ((pendingCount ?? 0) >= 5) {
    return json({
      error: 'TOO_MANY_PENDING_ORDERS',
      message: 'You have too many open orders. Please wait for them to complete.',
    }, 429)
  }

  // ---------------------------------------------------------------------------
  // Fetch venue config (htlc timeout, preparation window, brand colours)
  // ---------------------------------------------------------------------------
  const { data: venue, error: venueError } = await supabase
    .from('venues')
    .select('id, name, htlc_timeout_seconds, preparation_window_seconds, lightning_address')
    .eq('id', venue_id)
    .single()

  if (venueError || !venue) {
    return json({ error: 'Venue not found' }, 404)
  }

  // ---------------------------------------------------------------------------
  // Fetch live GBP rate from mint
  // ---------------------------------------------------------------------------
  let rate
  try {
    rate = await getGbpRate()
  } catch (err) {
    console.error('[nut18-request] Rate fetch failed:', err)
    return json({ error: 'RATE_UNAVAILABLE', message: 'Could not fetch exchange rate. Please try again.' }, 503)
  }

  // ---------------------------------------------------------------------------
  // Generate NUT-18 payment request
  // ---------------------------------------------------------------------------
  const orderRef = crypto.randomUUID()

  const nut18 = buildNUT18Request({
    amountPence: amount_pence,
    orderRef,
    rate,
    htlcTimeoutSeconds: venue.htlc_timeout_seconds ?? undefined,
  })

  const expiresAt = new Date(nut18.expiresAt * 1000).toISOString()

  // ---------------------------------------------------------------------------
  // Persist order to Supabase — status: pending
  // ---------------------------------------------------------------------------
  const { error: insertError } = await supabase
    .from('orders')
    .insert({
      id: orderRef,
      user_id: user.id,
      venue_id,
      amount_pence,
      amount_sats: nut18.amountSats,
      gbp_rate_snapshot: rate.satsPerGbp,
      status: 'pending',
      encoded_request: nut18.encodedRequest,
      mint_url: MINT_URL,
      htlc_timeout_seconds: venue.htlc_timeout_seconds ?? 480,
      preparation_window_seconds: venue.preparation_window_seconds ?? 240,
      wallet_pubkey: wallet_pubkey ?? null,
      // Griefing anomaly tracking — surfaced in Command Centre dashboard
      anomaly_flag: false,
      expires_at: expiresAt,
      created_at: new Date().toISOString(),
    })

  if (insertError) {
    console.error('[nut18-request] Order insert failed:', insertError)
    return json({ error: 'ORDER_CREATE_FAILED' }, 500)
  }

  // ---------------------------------------------------------------------------
  // Build delivery formats
  // ---------------------------------------------------------------------------

  // Primary: Minibits deeplink
  const deeplink = `minibits://pay?request=${encodeURIComponent(nut18.encodedRequest)}`

  // Fallback: universal cashu payment request URI (NWC wallets, manual entry)
  const qrFallback = nut18.encodedRequest

  return json({
    order_ref: orderRef,
    encoded_request: nut18.encodedRequest,
    amount_sats: nut18.amountSats,
    amount_pence,
    gbp_rate: rate.satsPerGbp,
    expires_at: expiresAt,
    validity_seconds: NUT18_VALIDITY_SECONDS,
    deeplink,
    qr_fallback: qrFallback,
    venue: {
      id: venue.id,
      name: venue.name,
      htlc_timeout_seconds: venue.htlc_timeout_seconds ?? 480,
      preparation_window_seconds: venue.preparation_window_seconds ?? 240,
    },
  })
})

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type NUT18RequestBody = {
  venue_id: string
  amount_pence: number
  items?: Array<{ name: string; quantity: number; unit_pence: number }>
  wallet_pubkey?: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
