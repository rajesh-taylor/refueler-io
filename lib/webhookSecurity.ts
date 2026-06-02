/**
 * Refueler — Webhook security utilities
 *
 * HMAC-SHA256 over `order_ref + amount_sats + timestamp`
 * Shared secret stored in Supabase vault as WEBHOOK_SIGNING_SECRET.
 *
 * Verification flow:
 *   1. Mint signs payload with shared secret before sending webhook
 *   2. Refueler edge function recomputes signature on receipt
 *   3. Constant-time comparison prevents timing attacks
 *   4. Timestamp window (±5 min) prevents replay attacks
 */

const SIGNATURE_HEADER = 'x-refueler-signature'
const TIMESTAMP_HEADER = 'x-refueler-timestamp'
const REPLAY_WINDOW_SECONDS = 300 // 5 minutes

// ---------------------------------------------------------------------------
// Signing (used by mint / test harness)
// ---------------------------------------------------------------------------

/**
 * Build the canonical string that gets signed.
 * Format: `{timestamp}.{order_ref}.{amount_sats}`
 */
export function buildSigningPayload(
  timestamp: number,
  orderRef: string,
  amountSats: number,
): string {
  return `${timestamp}.${orderRef}.${amountSats}`
}

/**
 * Compute HMAC-SHA256 signature over the canonical payload.
 * Returns hex string.
 */
export async function computeSignature(
  signingPayload: string,
  secret: string,
): Promise<string> {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)
  const msgData = encoder.encode(signingPayload)

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, msgData)
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Build headers for an outgoing signed webhook (used in test harness / mint adapter).
 */
export async function buildSignedHeaders(
  orderRef: string,
  amountSats: number,
  secret: string,
): Promise<Record<string, string>> {
  const timestamp = Math.floor(Date.now() / 1000)
  const payload = buildSigningPayload(timestamp, orderRef, amountSats)
  const signature = await computeSignature(payload, secret)
  return {
    [SIGNATURE_HEADER]: signature,
    [TIMESTAMP_HEADER]: String(timestamp),
    'Content-Type': 'application/json',
  }
}

// ---------------------------------------------------------------------------
// Verification (used by Supabase edge function)
// ---------------------------------------------------------------------------

export type VerifyResult =
  | { ok: true }
  | { ok: false; reason: 'missing_headers' | 'replay_attack' | 'signature_mismatch' }

/**
 * Verify an incoming webhook request.
 *
 * @param request   Raw Deno Request object from the edge function
 * @param body      Already-parsed body (so we don't consume the stream twice)
 * @param secret    WEBHOOK_SIGNING_SECRET from Supabase vault
 */
export async function verifyWebhookSignature(
  request: Request,
  body: FulfilmentWebhookBody,
  secret: string,
): Promise<VerifyResult> {
  const receivedSig = request.headers.get(SIGNATURE_HEADER)
  const receivedTs = request.headers.get(TIMESTAMP_HEADER)

  if (!receivedSig || !receivedTs) {
    return { ok: false, reason: 'missing_headers' }
  }

  // Replay attack check
  const timestamp = parseInt(receivedTs, 10)
  const now = Math.floor(Date.now() / 1000)
  if (Math.abs(now - timestamp) > REPLAY_WINDOW_SECONDS) {
    return { ok: false, reason: 'replay_attack' }
  }

  // Recompute expected signature
  const payload = buildSigningPayload(timestamp, body.order_ref, body.amount_sats)
  const expectedSig = await computeSignature(payload, secret)

  // Constant-time comparison — prevents timing oracle attacks
  if (!constantTimeEqual(receivedSig, expectedSig)) {
    return { ok: false, reason: 'signature_mismatch' }
  }

  return { ok: true }
}

/**
 * Constant-time string comparison.
 * Never short-circuits — prevents timing side-channel attacks.
 */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

// ---------------------------------------------------------------------------
// Webhook body type
// ---------------------------------------------------------------------------

/**
 * Shape of the fulfilment webhook body sent by the mint to Refueler.
 * Refueler verifies order_ref + amount_sats match the stored order before
 * advancing the order state machine.
 */
export type FulfilmentWebhookBody = {
  /** Refueler internal order reference — UUIDv4 */
  order_ref: string
  /** Amount settled in sats */
  amount_sats: number
  /** Unix timestamp of settlement at the mint */
  settled_at: number
  /** Mint-assigned quote ID for audit trail */
  mint_quote_id: string
  /** NUT-18 encoded request that was settled (for verification) */
  encoded_request?: string
}
