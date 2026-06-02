/**
 * Refueler — Ambient Background Task (React Native)
 * Session 17 · tasks/ambientBackgroundTask.ts
 *
 * React Native integration layer — registers the background location task,
 * wires the ambient trigger engine to the notification service, and exposes
 * start/stop helpers called from the onboarding opt-in screen and settings toggle.
 *
 * Uses expo-task-manager + expo-location for background geofence monitoring.
 * Replace with react-native-background-geolocation if switching to bare RN.
 *
 * On iOS: Background location requires "Always" permission + background mode in Info.plist.
 *         Add UIBackgroundModes → location to Info.plist.
 * On Android: ACCESS_BACKGROUND_LOCATION permission required (API 29+).
 *             Foreground service notification handled by startLocationUpdatesAsync options below.
 *
 * IMPORTANT: TaskManager.defineTask MUST be called at module level (not inside a hook),
 * and this file MUST be imported in the root entry file (App.tsx / index.js) so the
 * task definition is registered before the OS tries to wake it.
 */

import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';

import {
  evaluateAmbientTrigger,
  type AmbientTriggerPayload,
  type DarwinConfig,
} from '../lib/ambientAwareness';

import {
  scheduleAmbientNotification,
  registerNotificationCategories,
  ensureAndroidChannel,
  configureForegroundBehaviour,
  requestNotificationPermission,
  registerAmbientResponseListener,
  type PermissionStatus,
} from '../lib/notifications';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const AMBIENT_BACKGROUND_TASK = 'REFUELER_AMBIENT_AWARENESS';

/**
 * Darwin config — read from expo-constants / environment at runtime.
 * NEVER hardcode credentials here.
 * Set in .env.local (dev) and Supabase Vault / EAS Secrets (production).
 */
function getDarwinConfig(): DarwinConfig {
  return {
    stompBrokerUrl: process.env.EXPO_PUBLIC_DARWIN_STOMP_URL ?? '',
    username:       process.env.EXPO_PUBLIC_DARWIN_USERNAME   ?? '',
    passcode:       process.env.EXPO_PUBLIC_DARWIN_PASSCODE   ?? '',
    limehouseCRS:   'LHS',
    fenchurchCRS:   'FST',
  };
}

// ---------------------------------------------------------------------------
// Background task definition
// ---------------------------------------------------------------------------

/**
 * The background task fires on every significant location update.
 * Hands the snapshot to evaluateAmbientTrigger — all trigger logic
 * (geofence, velocity, cooldown, opt-in check) lives there.
 * If trigger conditions are met, schedules the push notification via
 * notifications.ts.
 */
TaskManager.defineTask(AMBIENT_BACKGROUND_TASK, async ({ data, error }: any) => {
  if (error) {
    console.error('[Refueler] Ambient background task error:', error.message);
    return;
  }

  if (!data?.locations?.length) return;

  const location: Location.LocationObject = data.locations[0];

  const snapshot = {
    coords: {
      latitude:  location.coords.latitude,
      longitude: location.coords.longitude,
      speed:     location.coords.speed,
      heading:   location.coords.heading,
      accuracy:  location.coords.accuracy,
    },
    timestamp: location.timestamp,
  };

  await evaluateAmbientTrigger(
    snapshot,
    getDarwinConfig(),
    async (triggerPayload: AmbientTriggerPayload) => {
      await scheduleAmbientNotification(triggerPayload);
    }
  );
});

// ---------------------------------------------------------------------------
// App startup — call once in App.tsx before rendering navigation
// ---------------------------------------------------------------------------

/**
 * Performs all one-time notification setup required at app launch:
 *   1. Foreground notification display behaviour
 *   2. Android channel creation
 *   3. Notification category + action button registration (Confirm / Not now)
 *
 * Safe to call on every launch — all operations are idempotent.
 * Must be called BEFORE requestNotificationPermission().
 */
export async function initialiseNotifications(): Promise<void> {
  configureForegroundBehaviour();
  await ensureAndroidChannel();
  await registerNotificationCategories();
}

/**
 * Requests notification permission.
 * Call after initialiseNotifications() and after the user has seen enough
 * of the app to understand why permission is needed (post-onboarding).
 *
 * Returns 'granted' | 'denied' | 'undetermined'.
 * On 'denied': surface a Settings nudge — never re-prompt automatically.
 */
export { requestNotificationPermission };
export type { PermissionStatus };

// ---------------------------------------------------------------------------
// Background location task — start/stop
// ---------------------------------------------------------------------------

/**
 * Starts background location monitoring.
 *
 * Requires:
 *   - Notification permission granted (initialiseNotifications + requestNotificationPermission)
 *   - Background location permission granted (prompted separately — see requestBackgroundLocationPermission)
 *
 * Uses significant-change monitoring (distanceInterval: 100m) rather than
 * continuous GPS to conserve battery. The OS wakes the task when the device
 * has moved ~100m or changed cell towers.
 *
 * Call this after the user completes the ambient onboarding opt-in screen.
 */
export async function startAmbientBackgroundTask(): Promise<void> {
  const { status } = await Location.getBackgroundPermissionsAsync();

  if (status !== 'granted') {
    console.warn('[Refueler] Background location permission not granted. Ambient awareness inactive.');
    return;
  }

  const isAlreadyRunning = await TaskManager.isTaskRegisteredAsync(AMBIENT_BACKGROUND_TASK);
  if (isAlreadyRunning) return;

  await Location.startLocationUpdatesAsync(AMBIENT_BACKGROUND_TASK, {
    accuracy:                       Location.Accuracy.High,
    distanceInterval:               100,        // update every 100m of movement
    timeInterval:                   30_000,     // or every 30s (Android minimum)
    showsBackgroundLocationIndicator: false,    // iOS — suppress status bar indicator
    pausesUpdatesAutomatically:     true,       // iOS — OS pauses when stationary (battery saving)
    activityType:                   Location.ActivityType.OtherNavigation, // train travel
    foregroundService: {
      // Android API 26+ requires a visible foreground service when using background location.
      // Keep copy minimal and non-alarming.
      notificationTitle: 'Refueler',
      notificationBody:  'Ready to confirm your order when you approach the station',
      notificationColor: '#1E1F22',  // Carbon bg — matches app brand
    },
  });
}

/**
 * Stops ambient background monitoring.
 * Call when user toggles off in Settings → Notifications → Ambient ordering,
 * or when the user has no pending orders (optional optimisation).
 */
export async function stopAmbientBackgroundTask(): Promise<void> {
  const isRunning = await TaskManager.isTaskRegisteredAsync(AMBIENT_BACKGROUND_TASK);
  if (!isRunning) return;
  await Location.stopLocationUpdatesAsync(AMBIENT_BACKGROUND_TASK);
}

// ---------------------------------------------------------------------------
// Background location permission request
// ---------------------------------------------------------------------------

/**
 * Requests background location permission.
 *
 * On iOS: the system shows a two-step dialog —
 *   1. Foreground permission ("While Using the App")
 *   2. Upgrade to "Always" — must be requested after foreground is granted.
 *   Apple guidance: explain the use case clearly before requesting "Always".
 *   Present the ambient onboarding screen copy before calling this.
 *
 * On Android API 29+: must request ACCESS_BACKGROUND_LOCATION separately
 *   after foreground location is already granted. The OS shows a dialog
 *   directing the user to Settings on API 30+.
 *
 * Returns 'granted' | 'denied'.
 */
export async function requestBackgroundLocationPermission(): Promise<'granted' | 'denied'> {
  // Foreground permission must exist first
  const { status: fg } = await Location.requestForegroundPermissionsAsync();
  if (fg !== 'granted') return 'denied';

  const { status: bg } = await Location.requestBackgroundPermissionsAsync();
  return bg === 'granted' ? 'granted' : 'denied';
}

// ---------------------------------------------------------------------------
// Notification response listener — wire in App.tsx
// ---------------------------------------------------------------------------

/**
 * Registers the ambient notification response listener.
 * Returns a cleanup function (call on app unmount — typically never needed
 * for a root-level listener, but include for completeness).
 *
 * Usage in App.tsx:
 *
 *   import { registerAmbientResponseListener } from '../lib/notifications';
 *   import { router } from 'expo-router';
 *
 *   useEffect(() => {
 *     const cleanup = registerAmbientResponseListener({
 *       onConfirm: ({ orderId, venueId, etaSeconds }) => {
 *         // Navigate to order confirmation screen — NUT-18 payment fires there
 *         router.push(`/order/confirm?id=${orderId}&venue=${venueId}&eta=${etaSeconds}`);
 *       },
 *       onNotNow: ({ orderId }) => {
 *         // No action needed — order remains pending for next trigger opportunity
 *         console.log('[Refueler] Ambient dismissed for order', orderId);
 *       },
 *     });
 *     return cleanup;
 *   }, []);
 */
export { registerAmbientResponseListener };
