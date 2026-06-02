/**
 * Refueler — Ambient Ordering Settings Toggle
 * Session 17 · components/AmbientOrderingToggle.tsx
 *
 * Drop-in toggle row for Settings → Notifications → Ambient ordering.
 *
 * Label:     "Ambient ordering"
 * Sub-label: "Get a heads-up when your train approaches — we never see your location"
 * (Both locked Session 17.)
 *
 * Behaviour:
 *   ON  → setAmbientEnabled(true)  + startAmbientBackgroundTask()
 *   OFF → setAmbientEnabled(false) + stopAmbientBackgroundTask()
 *
 * If the user enables from settings without background location permission,
 * we surface an inline nudge to open device settings — no re-prompt of the
 * OS dialog (Apple/Google policy: never re-prompt after denial).
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Platform,
} from 'react-native';
import * as Location from 'expo-location';
import * as ExpoNotifications from 'expo-notifications';

import { isAmbientEnabled, setAmbientEnabled } from '../lib/ambientAwareness';
import {
  startAmbientBackgroundTask,
  stopAmbientBackgroundTask,
} from '../tasks/ambientBackgroundTask';

// ---------------------------------------------------------------------------
// Design tokens — Carbon (app default)
// ---------------------------------------------------------------------------

const T = {
  bg:            '#1E1F22',
  surface:       '#26282C',
  textPrimary:   '#E4E2DC',
  textSecondary: '#8A8680',
  textTertiary:  '#5A5751',
  border:        '#35373B',
  accentCarbon:  '#C8A96E',
  orange:        '#F5820A',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AmbientOrderingToggle() {
  const [enabled, setEnabled]           = useState(false);
  const [permissionNudge, setPermissionNudge] = useState<
    'none' | 'notifications' | 'location'
  >('none');
  const [toggling, setToggling]         = useState(false);

  // Sync enabled state from storage on mount
  useEffect(() => {
    setEnabled(isAmbientEnabled());
  }, []);

  // ---------------------------------------------------------------------------
  // Toggle handler
  // ---------------------------------------------------------------------------

  async function handleToggle(value: boolean): Promise<void> {
    if (toggling) return;
    setToggling(true);
    setPermissionNudge('none');

    if (value) {
      // Enabling — check permissions before starting task

      const { status: notifStatus } = await ExpoNotifications.getPermissionsAsync();
      if (notifStatus !== 'granted') {
        setPermissionNudge('notifications');
        setToggling(false);
        return; // do not enable — nudge user to Settings
      }

      const { status: locationStatus } = await Location.getBackgroundPermissionsAsync();
      if (locationStatus !== 'granted') {
        setPermissionNudge('location');
        setToggling(false);
        return; // do not enable — nudge user to Settings
      }

      setAmbientEnabled(true);
      setEnabled(true);
      await startAmbientBackgroundTask();

    } else {
      // Disabling
      setAmbientEnabled(false);
      setEnabled(false);
      await stopAmbientBackgroundTask();
    }

    setToggling(false);
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <View>
      {/* ── Toggle row ───────────────────────────────────────────────────── */}
      <View style={styles.row}>
        <View style={styles.labelGroup}>
          <Text style={styles.label}>Ambient ordering</Text>
          <Text style={styles.sublabel}>
            Get a heads-up when your train approaches — we never see your location
          </Text>
        </View>

        <Switch
          value={enabled}
          onValueChange={handleToggle}
          disabled={toggling}
          trackColor={{ false: T.border, true: T.orange }}
          thumbColor={Platform.OS === 'android' ? T.textPrimary : undefined}
          ios_backgroundColor={T.border}
          accessibilityLabel="Ambient ordering"
          accessibilityRole="switch"
          accessibilityState={{ checked: enabled }}
        />
      </View>

      {/* ── Permission nudges ────────────────────────────────────────────── */}
      {permissionNudge === 'notifications' && (
        <PermissionNudge
          message="Notifications are turned off for Refueler. Enable them in device settings to use ambient ordering."
          onOpenSettings={() => Linking.openSettings()}
        />
      )}

      {permissionNudge === 'location' && (
        <PermissionNudge
          message={
            Platform.OS === 'ios'
              ? 'Set location access to "Always" for Refueler in device settings.'
              : 'Enable background location access for Refueler in device settings.'
          }
          onOpenSettings={() => Linking.openSettings()}
        />
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Permission nudge sub-component
// ---------------------------------------------------------------------------

function PermissionNudge({
  message,
  onOpenSettings,
}: {
  message: string;
  onOpenSettings: () => void;
}) {
  return (
    <View style={styles.nudgeCard}>
      <Text style={styles.nudgeText}>{message}</Text>
      <TouchableOpacity
        onPress={onOpenSettings}
        accessibilityRole="button"
        accessibilityLabel="Open device settings"
      >
        <Text style={styles.nudgeLink}>Open settings →</Text>
      </TouchableOpacity>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  row: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-between',
    paddingVertical: 14,
    paddingHorizontal: 0,
    gap: 16,
  },

  labelGroup: {
    flex: 1,
  },

  label: {
    fontFamily:  'DM Sans',
    fontSize:    15,
    fontWeight:  '500',
    color:       T.textPrimary,
    marginBottom: 3,
  },

  sublabel: {
    fontFamily: 'DM Sans',
    fontSize:   13,
    lineHeight: 18,
    color:      T.textSecondary,
  },

  // ── Nudge card ─────────────────────────────────────────────────────────────
  nudgeCard: {
    backgroundColor:  T.surface,
    borderRadius:     8,
    padding:          14,
    marginTop:        4,
    borderWidth:      1,
    borderColor:      T.border,
    gap:              8,
  },

  nudgeText: {
    fontFamily: 'DM Sans',
    fontSize:   13,
    lineHeight: 19,
    color:      T.textSecondary,
  },

  nudgeLink: {
    fontFamily:      'DM Sans',
    fontSize:        13,
    color:           T.textPrimary,
    textDecorationLine: 'underline',
  },
});
