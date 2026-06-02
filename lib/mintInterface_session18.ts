/**
 * Refueler — Mint Interface (NUT-14 HTLC extension)
 * Session 18 · lib/mintInterface.ts
 *
 * Extends Session 14 mintInterface.ts with NUT-14 HTLC support.
 * Wallet-side enforcement model: the user's Minibits wallet monitors
 * the HTLC and claims the refund after expiry. Refueler is passive.
 *
 * Changes from Session 14:
 *   - buildNUT18Request() now accepts optional htlcParams
 *   - generateHTLCSecret() — cryptographically secure preimage
 *   - buildNUT14HTLCParams() — constructs the NUT-14 lock conditions
 *   - markOrderExpired() — transitions order to expired in Supabase
 *
 * Open: confirm with Minibits:
 *   1. Does ippon NUT-14 support wallet-side refund claiming post-expiry?
 *   2. What is the claim window after HTLC timeout fires?
 *   3. NUT-18 send endpoint path + response format (existing open question)
 */

import 'react-native-get-random-values'; // must be first for crypto.getRandomValues
import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Types (NUT-14 additions)
// ---------------------------------------------------------------------------

export interface NUT14HTLCParams {
  /** SHA-256 preimage hash — this is what goes in the token lock */
  lockHash:        string;
  /** UNIX timestamp (seconds) when the HTLC expires */
  expiryUnix:      number;
  /** ISO 8601 — stored in Supabase for readability */
  expiryISO:       string;
  /** Raw preimage (hex) — kept in memory only, never persisted by Refueler */
  preimage:        string;
}

export interface NUT18RequestParams {
  orderId:      string;
  venueId:      string;
  amountSats:   number;
  itemLabel:    string;
  /** Provide to enable NUT-14 HTLC escrow */
  htlc?:        NUT14HTLCParams;
}

export interface NUT18RequestPayload {
  // Session 14 fields — unchanged
  order_ref:    string;
  venue_id:     string;
  amount:       number;
  unit:         'sat';
  description:  string;
  // NUT-14 extension — present only when htlc provided
  htlc_lock?:   {
    lock_hash:  string;
    expiry:     number;   // UNIX seconds
  };
}

// ---------------------------------------------------------------------------
// HTLC helpers
// ---------------------------------------------------------------------------

/**
 * Generates a cryptographically secure 32-byte preimage.
 * The preimage is held in memory only.
 * The SHA-256 hash of this value is sent to the mint as the lock condition.
 */
export async function generateHTLCPreimage(): Promise<string> {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * SHA-256 of a hex string, returned as hex.
 * Used to derive the lock_hash from the preimage.
 */
export async function sha256Hex(hexInput: string): Promise<string> {
  const bytes = hexInput.match(/.{2}/g)!.map(h => parseInt(h, 16));
  const buffer = new Uint8Array(bytes);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Builds NUT-14 HTLC parameters for a given venue.
 * htlcTimeoutSeconds sourced from venues.htlc_timeout_seconds (default 480).
 *
 * Returns the full NUT14HTLCParams — caller stores lockHash + expiry in
 * Supabase; preimage is returned for in-memory use by the wallet layer only.
 */
export async function buildNUT14HTLCParams(
  htlcTimeoutSeconds: number = 480
): Promise<NUT14HTLCParams> {
  const preimage   = await generateHTLCPreimage();
  const lockHash   = await sha256Hex(preimage);
  const nowUnix    = Math.floor(Date.now() / 1000);
  const expiryUnix = nowUnix + htlcTimeoutSeconds;
  const expiryISO  = new Date(expiryUnix * 1000).toISOString();

  return { lockHash, expiryUnix, expiryISO, preimage };
}

// ---------------------------------------------------------------------------
// NUT-18 request builder (extended)
// ---------------------------------------------------------------------------

/**
 * Builds the NUT-18 payment request payload.
 * Unchanged from Session 14 when htlc is omitted.
 * Adds htlc_lock when NUT-14 params are provided.
 *
 * NOTE: The actual send endpoint path is pending Minibits confirmation.
 * Update MINT_URL + endpoint path in nut18-request Edge Function only.
 */
export function buildNUT18Request(params: NUT18RequestParams): NUT18RequestPayload {
  const payload: NUT18RequestPayload = {
    order_ref:   params.orderId,
    venue_id:    params.venueId,
    amount:      params.amountSats,
    unit:        'sat',
    description: params.itemLabel,
  };

  if (params.htlc) {
    payload.htlc_lock = {
      lock_hash: params.htlc.lockHash,
      expiry:    params.htlc.expiryUnix,
    };
  }

  return payload;
}

// ---------------------------------------------------------------------------
// NUT-02 keyset rotation guard (unchanged from Session 14)
// ---------------------------------------------------------------------------

export function isKeysetRotationError(err: unknown): boolean {
  if (err instanceof Error) {
    return err.message.includes('keyset') || err.message.includes('NUT-02');
  }
  return false;
}

// ---------------------------------------------------------------------------
// Order expiry — Supabase transition (wallet-side model)
// ---------------------------------------------------------------------------

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Transitions an order to expired status.
 *
 * Called from the UI layer when the local HTLC expiry timestamp passes
 * and fulfilment has not been confirmed. Refueler does not arbitrate —
 * this is a UI state transition only. The actual sats refund is claimed
 * wallet-side by Minibits.
 *
 * Does NOT fire if order is already fulfilled or collected.
 */
export async function markOrderExpired(orderId: string): Promise<void> {
  const { error } = await supabase
    .from('nut18_orders')
    .update({
      status:      'expired',
      htlc_status: 'expired',
    })
    .eq('order_ref', orderId)
    .in('status', ['pending', 'paid']); // guard — never overwrite fulfilled/collected

  if (error) {
    console.error('[mintInterface] markOrderExpired failed', { orderId, error });
    throw new Error(`Failed to mark order expired: ${error.message}`);
  }
}

/**
 * Marks an order as refunded — optional signal.
 * Only relevant if Minibits provides a callback confirming wallet-side
 * refund claim. Currently unused pending Minibits dev call confirmation.
 */
export async function markOrderRefunded(orderId: string): Promise<void> {
  const { error } = await supabase
    .from('nut18_orders')
    .update({ htlc_status: 'refunded' })
    .eq('order_ref', orderId)
    .eq('htlc_status', 'expired'); // only transition from expired

  if (error) {
    throw new Error(`Failed to mark order refunded: ${error.message}`);
  }
}
