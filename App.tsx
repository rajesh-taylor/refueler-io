/**
 * Refueler — App Entry Point
 * Session 17 · App.tsx
 *
 * Root component. Handles the correct startup sequence for:
 *   1. Notification infrastructure (categories, channel, foreground behaviour)
 *   2. Ambient notification response listener (fires on Confirm / Not now tap)
 *   3. Ambient background task registration (if permission already granted)
 *
 * STARTUP ORDER MATTERS:
 *   configureForegroundBehaviour  — must be set before any notification fires
 *   ensureAndroidChannel          — must exist before scheduling on Android
 *   registerNotificationCategories — must be registered before permission request
 *   registerAmbientResponseListener — must be live before app renders (cold launch)
 *
 * The onboarding screen handles permission requests — not this file.
 * This file only resumes the ambient task if permission was already granted
 * in a prior session (returning user).
 */

import React, { useEffect } from 'react';
import { router } from 'expo-router';

import {
  initialiseNotifications,
  registerAmbientResponseListener,
} from './tasks/ambientBackgroundTask';

import {
  startAmbientBackgroundTask,
} from './tasks/ambientBackgroundTask';

import * as Location from 'expo-location';

// ---------------------------------------------------------------------------
// Root App component
// ---------------------------------------------------------------------------

export default function App() {

  useEffect(() => {
    bootstrap();
  }, []);

  return (
    // Your navigation container / Expo Router slot goes here.
    // Omitted — this file shows only the ambient awareness wiring.
    null
  );
}

// ---------------------------------------------------------------------------
// Bootstrap sequence
// ---------------------------------------------------------------------------

async function bootstrap(): Promise<void> {

  // Step 1 — Notification infrastructure (idempotent, safe every launch)
  await initialiseNotifications();

  // Step 2 — Ambient response listener
  // Must be registered before navigation renders so cold-launch taps are caught.
  // The listener fires even if the app was killed — OS relaunches it on tap.
  registerAmbientResponseListener({
    onConfirm: ({ orderId, venueId, etaSeconds }) => {
      // Navigate to order confirmation screen.
      // NUT-18 payment is initiated there, not here.
      router.push(
        `/order/confirm?id=${orderId}&venue=${venueId}&eta=${etaSeconds}`
      );
    },
    onNotNow: ({ orderId }) => {
      // User dismissed — order stays pending for next trigger opportunity.
      // No navigation. No state change needed here.
      console.log('[Refueler] Ambient dismissed, order still pending:', orderId);
    },
  });

  // Step 3 — Resume ambient background task for returning users
  // Only starts if background location permission is already granted.
  // New users: permission is requested in the onboarding opt-in screen instead.
  await resumeAmbientTaskIfPermitted();
}

async function resumeAmbientTaskIfPermitted(): Promise<void> {
  try {
    const { status } = await Location.getBackgroundPermissionsAsync();
    if (status === 'granted') {
      await startAmbientBackgroundTask();
    }
    // If not granted — onboarding screen will handle it when user reaches it.
  } catch (err) {
    // Non-fatal — ambient awareness degrades gracefully.
    console.warn('[Refueler] Could not resume ambient task:', err);
  }
}
