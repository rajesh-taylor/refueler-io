/**
 * Refueler — Offline Order Queue State Machine
 * Session 17 · lib/offlineQueue.ts
 *
 * Handles the case where the user taps "Confirm" on the ambient notification
 * but has no signal (tunnel exit, poor coverage between stations).
 *
 * State machine: queued → syncing → confirmed | failed
 *
 * Copy locked:
 *   Queued:  "Order queued — confirming when signal returns."
 *   Syncing: "Connecting…"
 *   Failed:  "Couldn't confirm — tap to retry."
 *
 * Storage: AsyncStorage (React Native) — device-local, never Supabase until confirmed.
 * Retry: exponential backoff, max 3 attempts, then surfaces manual retry CTA.
 * Network detection: NetInfo (@react-native-community/netinfo).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type QueuedOrderStatus = 'queued' | 'syncing' | 'confirmed' | 'failed';

export interface QueuedOrder {
  orderId:      string;
  venueId:      string;
  itemLabel:    string;
  etaSeconds:   number;
  queuedAt:     string;   // ISO 8601
  attempts:     number;
  status:       QueuedOrderStatus;
  lastError?:   string;
}

export type QueueStateChangeCallback = (order: QueuedOrder) => void;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY        = 'refueler-offline-queue';
const MAX_ATTEMPTS       = 3;
const BACKOFF_BASE_MS    = 3_000;   // 3s, 6s, 12s

/** Copy locked Session 17 */
export const QUEUE_COPY: Record<QueuedOrderStatus, string> = {
  queued:    'Order queued — confirming when signal returns.',
  syncing:   'Connecting…',
  confirmed: 'Order confirmed.',
  failed:    'Couldn\'t confirm — tap to retry.',
};

// ---------------------------------------------------------------------------
// Storage helpers
// ---------------------------------------------------------------------------

async function readQueue(): Promise<QueuedOrder | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as QueuedOrder) : null;
  } catch {
    return null;
  }
}

async function writeQueue(order: QueuedOrder): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(order));
}

async function clearQueue(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

// ---------------------------------------------------------------------------
// Enqueue — call when Confirm tapped with no signal
// ---------------------------------------------------------------------------

/**
 * Saves the order to the local queue and returns the queued order object.
 * Call this instead of the NUT-18 request when NetInfo reports no connection.
 */
export async function enqueueOrder(args: {
  orderId:    string;
  venueId:    string;
  itemLabel:  string;
  etaSeconds: number;
}): Promise<QueuedOrder> {
  const order: QueuedOrder = {
    ...args,
    queuedAt:  new Date().toISOString(),
    attempts:  0,
    status:    'queued',
  };
  await writeQueue(order);
  return order;
}

// ---------------------------------------------------------------------------
// Sync attempt — try to fire the NUT-18 request
// ---------------------------------------------------------------------------

/**
 * Attempts to confirm the queued order via NUT-18.
 * Injected `confirmOrderFn` keeps this module decoupled from mintInterface.ts.
 *
 * Returns the updated QueuedOrder with new status.
 * Caller is responsible for updating UI via the onStateChange callback.
 */
export async function attemptSync(
  confirmOrderFn: (orderId: string, venueId: string) => Promise<void>,
  onStateChange: QueueStateChangeCallback
): Promise<QueuedOrder | null> {
  const order = await readQueue();
  if (!order || order.status === 'confirmed') return order;

  // Mark as syncing
  const syncing: QueuedOrder = { ...order, status: 'syncing' };
  await writeQueue(syncing);
  onStateChange(syncing);

  try {
    await confirmOrderFn(order.orderId, order.venueId);

    const confirmed: QueuedOrder = {
      ...syncing,
      status:   'confirmed',
      attempts: syncing.attempts + 1,
    };
    await writeQueue(confirmed);
    onStateChange(confirmed);

    // Clean up after a short delay — confirmed orders don't need to persist
    setTimeout(() => clearQueue(), 5_000);
    return confirmed;

  } catch (err) {
    const attempts = syncing.attempts + 1;
    const failed: QueuedOrder = {
      ...syncing,
      status:    attempts >= MAX_ATTEMPTS ? 'failed' : 'queued',
      attempts,
      lastError: err instanceof Error ? err.message : 'Unknown error',
    };
    await writeQueue(failed);
    onStateChange(failed);
    return failed;
  }
}

// ---------------------------------------------------------------------------
// Network listener — auto-retry when signal returns
// ---------------------------------------------------------------------------

/**
 * Subscribes to network state changes.
 * When connectivity is restored and a queued order exists, fires attemptSync
 * with exponential backoff.
 *
 * Returns an unsubscribe function — call on screen unmount.
 */
export function startNetworkListener(
  confirmOrderFn: (orderId: string, venueId: string) => Promise<void>,
  onStateChange: QueueStateChangeCallback
): () => void {
  let retryTimer: ReturnType<typeof setTimeout> | null = null;

  const unsubscribe = NetInfo.addEventListener(async (state) => {
    if (!state.isConnected) return;

    const order = await readQueue();
    if (!order || order.status === 'confirmed' || order.status === 'syncing') return;
    if (order.attempts >= MAX_ATTEMPTS) return; // exhausted — wait for manual retry

    // Exponential backoff: 3s → 6s → 12s
    const delayMs = BACKOFF_BASE_MS * Math.pow(2, order.attempts);

    if (retryTimer) clearTimeout(retryTimer);
    retryTimer = setTimeout(() => {
      attemptSync(confirmOrderFn, onStateChange).catch(() => {});
    }, delayMs);
  });

  return () => {
    unsubscribe();
    if (retryTimer) clearTimeout(retryTimer);
  };
}

// ---------------------------------------------------------------------------
// Manual retry — called when user taps "Couldn't confirm — tap to retry."
// ---------------------------------------------------------------------------

export async function manualRetry(
  confirmOrderFn: (orderId: string, venueId: string) => Promise<void>,
  onStateChange: QueueStateChangeCallback
): Promise<QueuedOrder | null> {
  // Reset attempt count so retry is permitted even after MAX_ATTEMPTS
  const order = await readQueue();
  if (!order) return null;

  const reset: QueuedOrder = { ...order, status: 'queued', attempts: 0 };
  await writeQueue(reset);

  return attemptSync(confirmOrderFn, onStateChange);
}

// ---------------------------------------------------------------------------
// Read current queue state — for UI initialisation
// ---------------------------------------------------------------------------

export { readQueue as getQueuedOrder };
