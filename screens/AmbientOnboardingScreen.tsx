/**
 * Refueler — Ambient Ordering Opt-In Onboarding Screen
 * Session 17 · screens/AmbientOnboardingScreen.tsx
 *
 * Shown during initial app onboarding flow, after account creation.
 * Explains ambient ordering, requests notification permission, then
 * background location permission.
 *
 * GDPR REQUIREMENT (locked Session 17):
 *   Privacy disclosure copy must match privacy.html §03 Location Architecture exactly:
 *   "Refueler knows your train is moving. Your phone works it out locally.
 *    We never see where you are."
 *
 * DESIGN SYSTEM (locked):
 *   Carbon default on all app screens.
 *   Token colours only — no hardcoded hex except Carbon bg (#1E1F22) for
 *   StatusBar and Android foreground service notification (already in ambientBackgroundTask.ts).
 *   Source Serif 4 weight 300 for body. Satoshi for headings.
 *   Orange #F5820A used once only — opt-in CTA. Never dominant.
 *   No all-caps. No neon. Suave, discreet.
 *
 * PERMISSION FLOW:
 *   Screen renders → user reads copy → taps "Turn on" →
 *     1. Request notification permission
 *     2. If granted → request background location permission
 *     3. If granted → start ambient background task → navigate forward
 *   "Not now" → skip, navigate forward, ambient remains off.
 *   User can enable later: Settings → Notifications → Ambient ordering.
 *
 * PLACEMENT IN ONBOARDING FLOW:
 *   After: account creation, wallet selection
 *   Before: first order / home screen
 *   Route: /onboarding/ambient  (Expo Router)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { router } from 'expo-router';

import {
  requestNotificationPermission,
  requestBackgroundLocationPermission,
  startAmbientBackgroundTask,
} from '../tasks/ambientBackgroundTask';

import { setAmbientEnabled } from '../lib/ambientAwareness';

// ---------------------------------------------------------------------------
// Design tokens — Carbon (app default)
// Keep in sync with design system. Single source of truth is complaints_v6.html.
// ---------------------------------------------------------------------------

const T = {
  bg:            '#1E1F22',
  surface:       '#26282C',
  textPrimary:   '#E4E2DC',
  textSecondary: '#8A8680',
  textTertiary:  '#5A5751',
  border:        '#35373B',
  accentCarbon:  '#C8A96E',  // gold — inset rules and accents only
  orange:        '#F5820A',  // reserved — CTA only, never dominant
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ScreenState = 'idle' | 'requesting' | 'denied_notifications' | 'denied_location';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface AmbientOnboardingScreenProps {
  /** Called when user completes or skips this screen. Navigate forward. */
  onComplete: () => void;
}

export default function AmbientOnboardingScreen({ onComplete }: AmbientOnboardingScreenProps) {
  const [state, setState] = useState<ScreenState>('idle');

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  async function handleTurnOn(): Promise<void> {
    setState('requesting');

    // Step 1 — Notification permission
    const notifStatus = await requestNotificationPermission();

    if (notifStatus !== 'granted') {
      setState('denied_notifications');
      return;
    }

    // Step 2 — Background location permission
    const locationStatus = await requestBackgroundLocationPermission();

    if (locationStatus !== 'granted') {
      setState('denied_location');
      return;
    }

    // Step 3 — Enable flag + start background task
    setAmbientEnabled(true);
    await startAmbientBackgroundTask();

    // Step 4 — Navigate forward
    onComplete();
  }

  function handleNotNow(): void {
    // Ambient stays disabled. User can enable in Settings later.
    setAmbientEnabled(false);
    onComplete();
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={T.bg} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Icon / illustration placeholder ─────────────────────────────
            Head of Design: place the train + notification spot illustration here.
            SVG or PNG. Dark background — light linework preferred.
        ──────────────────────────────────────────────────────────────────── */}
        <View style={styles.illustrationSlot} accessibilityLabel="Train approaching station">
          {/* Illustration goes here */}
        </View>

        {/* ── Heading ──────────────────────────────────────────────────── */}
        <Text style={styles.heading}>
          Your order, timed to your train
        </Text>

        {/* ── Subhead ──────────────────────────────────────────────────── */}
        <Text style={styles.subhead}>
          We start your order the moment your train leaves Limehouse —
          so it's ready when you walk through the door.
        </Text>

        {/* ── Privacy inset card ───────────────────────────────────────── */}
        {/* Wording locked — must match privacy.html §03 Location Architecture exactly */}
        <View style={styles.privacyCard}>
          <View style={styles.privacyRule} />
          <Text style={styles.privacyBody}>
            Refueler knows your train is moving. Your phone works it out
            locally. We never see where you are.
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/privacy#location-architecture')}
            accessibilityRole="link"
            accessibilityLabel="Read our full privacy policy"
          >
            <Text style={styles.privacyLink}>
              How this works →
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── How it works — three steps ───────────────────────────────── */}
        <View style={styles.steps}>
          <Step
            number="1"
            text="Save an order before you board"
          />
          <Step
            number="2"
            text="Your phone detects when you leave Limehouse"
          />
          <Step
            number="3"
            text="You get a nudge — one tap to confirm"
          />
        </View>

        {/* ── Permission denied states ─────────────────────────────────── */}
        {state === 'denied_notifications' && (
          <View style={styles.deniedCard}>
            <Text style={styles.deniedText}>
              Notifications are turned off. To use ambient ordering, enable
              notifications for Refueler in your device settings, then return here.
            </Text>
          </View>
        )}

        {state === 'denied_location' && (
          <View style={styles.deniedCard}>
            <Text style={styles.deniedText}>
              Background location access is needed to detect your station
              approach. Enable "Always" location access for Refueler in
              your device settings, then return here.
            </Text>
          </View>
        )}

        {/* ── CTAs ─────────────────────────────────────────────────────── */}
        <View style={styles.ctaGroup}>
          {state === 'requesting' ? (
            <ActivityIndicator
              color={T.orange}
              style={styles.spinner}
              accessibilityLabel="Requesting permissions"
            />
          ) : (
            <TouchableOpacity
              style={styles.ctaPrimary}
              onPress={handleTurnOn}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Turn on ambient ordering"
            >
              <Text style={styles.ctaPrimaryLabel}>Turn on</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.ctaSecondary}
            onPress={handleNotNow}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Skip ambient ordering for now"
            disabled={state === 'requesting'}
          >
            <Text style={styles.ctaSecondaryLabel}>Not now</Text>
          </TouchableOpacity>
        </View>

        {/* ── Settings note ────────────────────────────────────────────── */}
        <Text style={styles.settingsNote}>
          You can turn this on or off at any time in Settings.
        </Text>

      </ScrollView>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Step sub-component
// ---------------------------------------------------------------------------

function Step({ number, text }: { number: string; text: string }) {
  return (
    <View style={styles.step}>
      <Text style={styles.stepNumber}>{number}</Text>
      <Text style={styles.stepText}>{text}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: T.bg,
  },

  scroll: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 64 : 48,
    paddingBottom: 48,
  },

  // ── Illustration slot ──────────────────────────────────────────────────────
  illustrationSlot: {
    width: '100%',
    height: 180,
    marginBottom: 40,
    // Head of Design: replace with Image component once asset is supplied
  },

  // ── Text ───────────────────────────────────────────────────────────────────
  heading: {
    fontFamily: 'Satoshi',
    fontSize: 28,
    fontWeight: '700',
    color: T.textPrimary,
    marginBottom: 12,
    letterSpacing: -0.3,
  },

  subhead: {
    fontFamily: 'DM Sans',
    fontSize: 16,
    lineHeight: 24,
    color: T.textSecondary,
    marginBottom: 32,
  },

  // ── Privacy inset card ─────────────────────────────────────────────────────
  privacyCard: {
    backgroundColor: T.surface,
    borderRadius: 8,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: T.border,
  },

  privacyRule: {
    width: 2,
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: T.accentCarbon, // gold inset rule — Carbon only, locked
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },

  privacyBody: {
    fontFamily: 'Source Serif 4',
    fontSize: 15,
    fontWeight: '300',
    fontStyle: 'italic',
    lineHeight: 22,
    color: T.textPrimary,
    marginBottom: 12,
    paddingLeft: 12, // clear of the gold rule
  },

  privacyLink: {
    fontFamily: 'DM Sans',
    fontSize: 13,
    color: T.textSecondary,
    textDecorationLine: 'underline',
    paddingLeft: 12,
  },

  // ── Steps ──────────────────────────────────────────────────────────────────
  steps: {
    marginBottom: 32,
    gap: 16,
  },

  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },

  stepNumber: {
    fontFamily: 'Satoshi',
    fontSize: 13,
    fontWeight: '600',
    color: T.textTertiary,
    width: 20,
    lineHeight: 22,
  },

  stepText: {
    fontFamily: 'DM Sans',
    fontSize: 15,
    lineHeight: 22,
    color: T.textPrimary,
    flex: 1,
  },

  // ── Denied states ──────────────────────────────────────────────────────────
  deniedCard: {
    backgroundColor: T.surface,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: T.border,
  },

  deniedText: {
    fontFamily: 'DM Sans',
    fontSize: 14,
    lineHeight: 21,
    color: T.textSecondary,
  },

  // ── CTAs ───────────────────────────────────────────────────────────────────
  ctaGroup: {
    gap: 12,
    marginBottom: 20,
  },

  ctaPrimary: {
    backgroundColor: T.orange, // orange — CTA only, never dominant, locked
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },

  ctaPrimaryLabel: {
    fontFamily: 'Satoshi',
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.1,
  },

  ctaSecondary: {
    paddingVertical: 14,
    alignItems: 'center',
  },

  ctaSecondaryLabel: {
    fontFamily: 'DM Sans',
    fontSize: 15,
    color: T.textSecondary,
  },

  spinner: {
    paddingVertical: 18,
  },

  // ── Settings note ──────────────────────────────────────────────────────────
  settingsNote: {
    fontFamily: 'DM Sans',
    fontSize: 12,
    color: T.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
