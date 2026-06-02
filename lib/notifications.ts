/**
 * Refueler — Push Notification Service
 * Session 17 · lib/notifications.ts
 *
 * Handles all push notification logic for the ambient ordering feature:
 *   - Category + action button registration (Confirm / Not now)
 *   - Notification payload construction
 *   - Permission request flow
 *   - Response handler (routes Confirm → NUT-18, Not now → dismiss)
 *   - Notification identifier tracking (cancel stale notifications)
 *
 * Depends on: expo-notifications
 * Called by: tasks/ambientBackgroundTask.ts (fire)
 *            app entry point / App.tsx (register, permission, response handler)
 *
 * Platform notes:
 *   iOS  — action buttons require notification categories registered before
 *           the app requests permission. Call registerNotificationCategories()
 *           then requestNotificationPermission() in that order.
 *   Android — action buttons work on API 26+ (Oreo). On older devices the
 *           notification fires without buttons; Confirm tap opens the app.
 *           Channel must be created before scheduling (handled here).
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { AmbientTriggerPayload } from './ambientAwareness';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Notification category identifier — must match categoryIdentifier in payload */
export const CATEGORY_AMBIENT_CONFIRM = 'AMBIENT_ORDER_CONFIRM';

/** Action identifiers — matched in the response handler */
export const ACTION_CONFIRM  = 'CONFIRM';
export const ACTION_NOT_NOW  = 'NOT_NOW';

/** Android notification channel */
export const CHANNEL_AMBIENT = 'refueler_ambient';

/**
 * Storage key for the current ambient notification identifier.
 * Used to cancel a stale notification if the order is confirmed via in-app
 * before the user taps the notification.
 */
export const NOTIF_ID_STORAGE_KEY = 'refueler-ambient-notif-id';

// ---------------------------------------------------------------------------
// Android channel setup
// ---------------------------------------------------------------------------

/**
 * Creates the Android notification channel for ambient ordering.
 * Safe to call multiple times — no-op if channel already exists.
 * Must be called before scheduling any notification on Android.
 */
export async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(CHANNEL_AMBIENT, {
    name: 'Ambient ordering',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 150, 250],
    sound: 'default',
    // Subtle — not a marketing push. No LED colour override.
    showBadge: false,
    description: 'Notifies you when your train is approaching so your order can be confirmed.',
  });
}

// ---------------------------------------------------------------------------
// Category + action button registration
// ---------------------------------------------------------------------------

/**
 * Registers the AMBIENT_ORDER_CONFIRM notification category with
 * Confirm and Not now action buttons.
 *
 * Call ONCE at app startup, before requesting notification permission.
 * Safe to call on every launch — expo-notifications deduplicates.
 *
 * iOS: buttons appear in the notification banner and lock screen.
 * Android: buttons appear as notification actions in the expanded view.
 */
export async function registerNotificationCategories(): Promise<void> {
  await Notifications.setNotificationCategoryAsync(CATEGORY_AMBIENT_CONFIRM, [
    {
      identifier: ACTION_CONFIRM,
      buttonTitle: 'Confirm',
      options: {
        // Opens app to order confirmation screen via deep-link
        opensAppToForeground: true,
        // iOS: show in both banner and lock screen
        isDestructive: false,
        isAuthenticationRequired: false,
      },
    },
    {
      identifier: ACTION_NOT_NOW,
      buttonTitle: 'Not now',
      options: {
        opensAppToForeground: false,
        isDestructive: false,
        isAuthenticationRequired: false,
      },
    },
  ]);
}

// ---------------------------------------------------------------------------
// Permission request
// ---------------------------------------------------------------------------

export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

/**
 * Requests notification permission from the user.
 *
 * Returns the resulting status. Callers should:
 *   - 'granted'       → proceed to start ambient watcher
 *   - 'denied'        → surface settings nudge (never re-prompt automatically)
 *   - 'undetermined'  → should not occur after this call; treat as denied
 *
 * iOS: shows the system permission dialog once. Subsequent calls return
 *      the stored decision — never re-prompt the OS dialog programmatically.
 * Android API 33+: POST_NOTIFICATIONS runtime permission required.
 */
export async function requestNotificationPermission(): Promise<PermissionStatus> {
  const { status: existing } = await Notifications.getPermissionsAsync();

  if (existing === 'granted') return 'granted';

  // Only request if not already permanently denied
  if (existing === 'undetermined') {
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: false,    // Refueler does not use badge counts
        allowSound: true,
        allowAnnouncements: false,
      },
    });
    return status as PermissionStatus;
  }

  // 'denied' — cannot re-prompt. Caller must direct user to Settings.
  return 'denied';
}

// ---------------------------------------------------------------------------
// Notification payload builder
// ---------------------------------------------------------------------------

export interface AmbientNotificationContent {
  /** expo-notifications content object */
  content: Notifications.NotificationContentInput;
  /** Android channel ID */
  channelId?: string;
}

/**
 * Builds the notification content from an ambient trigger payload.
 *
 * Copy locked: "Your [item] will be ready in [N] mins, confirm?"
 * Title: "Refueler" — plain, no emoji.
 *
 * etaSeconds is rounded up to the nearest minute, minimum 1.
 * Edge case: if Darwin returns a very short ETA (< 60s), show "1 min"
 * rather than "0 mins" — better to slightly overstate than understate.
 */
export function buildAmbientNotificationContent(
  payload: AmbientTriggerPayload
): AmbientNotificationContent {
  const etaMins = Math.max(1, Math.round(payload.etaSeconds / 60));
  const etaLabel = etaMins === 1 ? '1 min' : `${etaMins} mins`;

  const content: Notifications.NotificationContentInput = {
    title: 'Refueler',
    body: `Your ${payload.itemLabel} will be ready in ${etaLabel}, confirm?`,
    categoryIdentifier: CATEGORY_AMBIENT_CONFIRM,
    // Notification data payload — available in response handler
    data: {
      type:       'ambient_confirm',
      orderId:    payload.orderId,
      venueId:    payload.venueId,
      itemLabel:  payload.itemLabel,
      etaSeconds: payload.etaSeconds,
      etaSource:  payload.etaSource,
      triggeredAt: payload.triggeredAt.toISOString(),
    } satisfies AmbientNotificationData,
    sound: 'default',
    // No badge increment — Refueler is transactional, not a feed
    badge: undefined,
  };

  return {
    content,
    ...(Platform.OS === 'android' ? { channelId: CHANNEL_AMBIENT } : {}),
  };
}

// ---------------------------------------------------------------------------
// Notification data type (attached to every ambient notification)
// ---------------------------------------------------------------------------

export interface AmbientNotificationData {
  type:        'ambient_confirm';
  orderId:     string;
  venueId:     string;
  itemLabel:   string;
  etaSeconds:  number;
  etaSource:   'darwin' | 'fallback_segment';
  triggeredAt: string; // ISO 8601
}

/** Type guard — narrows unknown notification data to AmbientNotificationData */
export function isAmbientNotificationData(data: unknown): data is AmbientNotificationData {
  return (
    typeof data === 'object' &&
    data !== null &&
    (data as any).type === 'ambient_confirm' &&
    typeof (data as any).orderId === 'string'
  );
}

// ---------------------------------------------------------------------------
// Schedule + track
// ---------------------------------------------------------------------------

/**
 * Schedules the ambient push notification and stores its identifier
 * so it can be cancelled later (e.g. user confirms in-app before tapping).
 *
 * Returns the notification identifier.
 */
export async function scheduleAmbientNotification(
  payload: AmbientTriggerPayload
): Promise<string> {
  const { content, channelId } = buildAmbientNotificationContent(payload);

  const notifId = await Notifications.scheduleNotificationAsync({
    content,
    trigger: null, // immediate
    ...(channelId ? { channelId } : {}),
  } as any);

  // Store so we can cancel if order confirmed in-app
  try {
    localStorage.setItem(NOTIF_ID_STORAGE_KEY, notifId);
  } catch {
    // non-fatal — worst case a stale notification lingers
  }

  return notifId;
}

/**
 * Cancels the tracked ambient notification if still pending.
 * Call this when the user confirms their order through the in-app flow
 * rather than via the notification button.
 */
export async function cancelPendingAmbientNotification(): Promise<void> {
  try {
    const notifId = localStorage.getItem(NOTIF_ID_STORAGE_KEY);
    if (!notifId) return;
    await Notifications.cancelScheduledNotificationAsync(notifId);
    localStorage.removeItem(NOTIF_ID_STORAGE_KEY);
  } catch {
    // non-fatal
  }
}

// ---------------------------------------------------------------------------
// Response handler
// ---------------------------------------------------------------------------

export type NotificationResponseAction =
  | { action: 'confirm';  orderId: string; venueId: string; etaSeconds: number }
  | { action: 'not_now';  orderId: string }
  | { action: 'tap';      orderId: string }   // bare tap (no action button)
  | { action: 'unknown' };

/**
 * Parses a raw Notifications.NotificationResponse into a typed action.
 *
 * Wire this into Notifications.addNotificationResponseReceivedListener()
 * in your app entry point. The listener fires regardless of whether the
 * app is in foreground, background, or killed (cold launch).
 *
 * Returns a discriminated union — callers switch on `action`:
 *   'confirm'  → proceed to NUT-18 payment flow
 *   'not_now'  → do nothing, order remains pending for next journey
 *   'tap'      → same as confirm (bare notification tap = intent to confirm)
 *   'unknown'  → unrecognised — log and ignore
 */
export function parseNotificationResponse(
  response: Notifications.NotificationResponse
): NotificationResponseAction {
  const data = response.notification.request.content.data;
  const actionId = response.actionIdentifier;

  if (!isAmbientNotificationData(data)) {
    return { action: 'unknown' };
  }

  // Bare tap on the notification body (no action button pressed)
  if (
    actionId === Notifications.DEFAULT_ACTION_IDENTIFIER ||
    actionId === undefined
  ) {
    return {
      action:     'tap',
      orderId:    data.orderId,
    };
  }

  if (actionId === ACTION_CONFIRM) {
    return {
      action:     'confirm',
      orderId:    data.orderId,
      venueId:    data.venueId,
      etaSeconds: data.etaSeconds,
    };
  }

  if (actionId === ACTION_NOT_NOW) {
    return {
      action:  'not_now',
      orderId: data.orderId,
    };
  }

  return { action: 'unknown' };
}

// ---------------------------------------------------------------------------
// Listener registration — call once in App.tsx
// ---------------------------------------------------------------------------

/**
 * Registers the notification response listener and returns a cleanup function.
 *
 * onConfirm: called for both 'confirm' and 'tap' actions — both mean proceed.
 * onNotNow:  called for 'not_now' — no action needed from caller.
 *
 * Usage in App.tsx:
 *
 *   const cleanup = registerAmbientResponseListener({
 *     onConfirm: ({ orderId, venueId, etaSeconds }) => {
 *       router.push(`/order/confirm?id=${orderId}`);
 *     },
 *     onNotNow: ({ orderId }) => {
 *       console.log('User dismissed ambient for order', orderId);
 *     },
 *   });
 *   // Call cleanup() on app unmount if needed (typically never for root listener)
 */
export function registerAmbientResponseListener(handlers: {
  onConfirm: (args: { orderId: string; venueId: string; etaSeconds: number }) => void;
  onNotNow:  (args: { orderId: string }) => void;
}): () => void {
  const subscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      const parsed = parseNotificationResponse(response);

      switch (parsed.action) {
        case 'confirm':
        case 'tap':
          // Cancel the notification (removes it from notification tray)
          cancelPendingAmbientNotification().catch(() => {});
          handlers.onConfirm({
            orderId:    parsed.orderId,
            venueId:    'venueId' in parsed ? parsed.venueId : '',
            etaSeconds: 'etaSeconds' in parsed ? parsed.etaSeconds : 0,
          });
          break;

        case 'not_now':
          handlers.onNotNow({ orderId: parsed.orderId });
          break;

        case 'unknown':
          // Not an ambient notification — ignore silently
          break;
      }
    }
  );

  return () => subscription.remove();
}

// ---------------------------------------------------------------------------
// Foreground notification behaviour
// ---------------------------------------------------------------------------

/**
 * Configures how notifications behave when the app is in the foreground.
 *
 * For ambient ordering: show the banner even in foreground so the user
 * sees the confirmation prompt regardless of app state.
 *
 * Call once before registering categories / requesting permission.
 */
export function configureForegroundBehaviour(): void {
  Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
      const data = notification.request.content.data;
      // Only show ambient notifications as banners in foreground
      const isAmbient = isAmbientNotificationData(data);
      return {
        shouldShowAlert: isAmbient,
        shouldPlaySound: isAmbient,
        shouldSetBadge:  false,
      };
    },
  });
}
