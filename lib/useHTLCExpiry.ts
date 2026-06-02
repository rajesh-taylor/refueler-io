/**
 * Refueler — useHTLCExpiry Hook
 * Session 18 · lib/useHTLCExpiry.ts
 *
 * UI layer for wallet-side HTLC expiry.
 *
 * The hook receives the HTLC expiry timestamp from the order response
 * and fires a local timer. When the timer triggers:
 *   1. Calls markOrderExpired() in Supabase (status → expired)
 *   2. Surfaces the expired state to the UI
 *   3. Shows the "Sats returning to your wallet" message
 *
 * No server polling. No mint queries. Refueler stays passive.
 * The Minibits wallet monitors the HTLC and claims the refund independently.
 *
 * Copy locked:
 *   Expired:   "Sats returning to your wallet."
 *   Fulfilled: "Order confirmed — see you at the counter."
 */

import { useEffect, useRef, useState } from 'react';
import { markOrderExpired }            from './mintInterface';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type HTLCExpiryStatus =
  | 'active'      // within window — HTLC locked
  | 'fulfilled'   // venue claimed — order confirmed
  | 'expired'     // timeout fired — wallet-side refund claimable
  | 'error';      // markOrderExpired failed

export interface HTLCExpiryState {
  status:        HTLCExpiryStatus;
  secondsLeft:   number | null;   // null when fulfilled or expired
  copyLine:      string;
}

/** Copy locked Session 18 */
export const HTLC_COPY: Record<HTLCExpiryStatus, string> = {
  active:    '',   // no copy shown during active window
  fulfilled: 'Order confirmed — see you at the counter.',
  expired:   'Sats returning to your wallet.',
  error:     'Something went wrong — your sats are safe. Tap to retry.',
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * @param orderId       - Supabase order_ref
 * @param expiryUnix    - UNIX timestamp (seconds) from nut18-request response
 * @param isFulfilled   - pass true when webhook confirms htlc.fulfilled
 */
export function useHTLCExpiry(
  orderId:     string | null,
  expiryUnix:  number | null,
  isFulfilled: boolean
): HTLCExpiryState {
  const [status, setStatus] = useState<HTLCExpiryStatus>('active');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  const [secondsLeft, setSecondsLeft] = useState<number | null>(() => {
    if (!expiryUnix) return null;
    return Math.max(0, expiryUnix - Math.floor(Date.now() / 1000));
  });

  // Fulfilled takes priority — clear timers immediately
  useEffect(() => {
    if (!isFulfilled) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    if (tickRef.current)  clearInterval(tickRef.current);
    setStatus('fulfilled');
    setSecondsLeft(null);
  }, [isFulfilled]);

  // Countdown tick
  useEffect(() => {
    if (!expiryUnix || isFulfilled) return;

    tickRef.current = setInterval(() => {
      const remaining = Math.max(0, expiryUnix - Math.floor(Date.now() / 1000));
      setSecondsLeft(remaining);
    }, 1_000);

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [expiryUnix, isFulfilled]);

  // Expiry timer
  useEffect(() => {
    if (!expiryUnix || !orderId || isFulfilled) return;

    const delayMs = Math.max(0, (expiryUnix - Math.floor(Date.now() / 1000)) * 1000);

    timerRef.current = setTimeout(async () => {
      if (tickRef.current) clearInterval(tickRef.current);
      setSecondsLeft(null);

      try {
        await markOrderExpired(orderId);
        setStatus('expired');
      } catch {
        setStatus('error');
      }
    }, delayMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [orderId, expiryUnix, isFulfilled]);

  return {
    status,
    secondsLeft,
    copyLine: HTLC_COPY[status],
  };
}
