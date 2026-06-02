// =============================================================
// Refueler · Match Day Mode — Session 21
// lib/matchDayCopy.ts
// =============================================================
// All copy variants for Match Day Mode.
//
// Tone: understated, knowing — the same register as the rest of
// Refueler. Not a football chant. Not a pub announcement.
// The app knows where you're going. It's got your order ready.
//
// Sections:
//   - Push notification variants (ambient trigger)
//   - ETA widget copy variants
//   - Surge awareness slot (null copy = off at MVF; slot ready)
//   - Helper: getMatchDayCopy() — single call, all copy in one object
// =============================================================

import type { MatchDayState } from './matchDaySkin'

// ─── Types ───────────────────────────────────────────────────

export interface PushCopy {
  title: string
  body:  string
}

export interface ETACopy {
  statusPhrase:   string     // replaces "Being prepared for you" / order-specific
  interchangeTip: string     // shown below ETA arc
  surgeLine:      string | null  // null = not shown (MVF default)
}

export interface MatchDayCopyBundle {
  push:           PushCopy
  eta:            ETACopy
  screenTitle:    string     // used in order confirmation header
  rewardLabel:    string     // sats reward badge label (unchanged, but here for completeness)
}

// ─── Push notification copy ───────────────────────────────────
// Triggered by the ambient geofence at Limehouse (same as standard
// push — matchDay flag gates the copy variant selection).

export function getMatchDayPushCopy(state: MatchDayState): PushCopy {
  const { teamName, stadiumName } = state

  return {
    title: `${teamName} day. Order ahead.`,
    body:  `Beat the crowd at Fenchurch St. `
         + `Your order will be ready before you reach the interchange. `
         + `${stadiumName} via ${routeHint(state.groundId)}.`,
  }
}

// ─── ETA widget copy ─────────────────────────────────────────

export function getMatchDayETACopy(
  state:      MatchDayState,
  orderItem:  string               // e.g. "flat white medium"
): ETACopy {
  return {
    // Order-specific status phrase (same pattern as standard mode)
    statusPhrase: `Your ${orderItem} is being prepared.`,

    // Interchange tip — sourced from match_day_grounds.interchange_tip
    interchangeTip: state.interchangeTip,

    // Surge copy: null = not shown.
    // To activate for a ground: set match_day_surge.surge_copy in Supabase.
    // This field propagates automatically via fetchMatchDayState().
    surgeLine: state.surgeCopy ?? null,
  }
}

// ─── Screen title (order confirmation) ───────────────────────

export function getMatchDayScreenTitle(state: MatchDayState): string {
  return `On your way to ${state.stadiumName}.`
}

// ─── Full copy bundle (single call) ──────────────────────────
// Use this in the order flow — one import, all copy.

export function getMatchDayCopy(
  state:      MatchDayState,
  orderItem:  string
): MatchDayCopyBundle {
  return {
    push:        getMatchDayPushCopy(state),
    eta:         getMatchDayETACopy(state, orderItem),
    screenTitle: getMatchDayScreenTitle(state),
    rewardLabel: 'Sats earned',                   // unchanged from standard
  }
}

// ─── Standard (non-match-day) copy bundle ────────────────────
// Exported so callers have a single import for both branches.

export function getStandardCopy(orderItem: string): MatchDayCopyBundle {
  return {
    push: {
      title: 'Your train is approaching.',
      body:  'Order ahead — your coffee will be ready when you arrive.',
    },
    eta: {
      statusPhrase:   `Your ${orderItem} is being prepared.`,
      interchangeTip: '',
      surgeLine:      null,
    },
    screenTitle: 'Order confirmed.',
    rewardLabel: 'Sats earned',
  }
}

// ─── Copy selector (use this in components) ──────────────────
// Pass matchDayStatus from useMatchDayStatus() hook.

import type { MatchDayStatus } from './matchDaySkin'

export function selectCopy(
  matchDayStatus: MatchDayStatus,
  orderItem:      string
): MatchDayCopyBundle {
  if (matchDayStatus.active) {
    return getMatchDayCopy(matchDayStatus.state, orderItem)
  }
  return getStandardCopy(orderItem)
}

// ─── Route hint (internal) ────────────────────────────────────
// Short interchange summary for push body.

function routeHint(groundId: string): string {
  switch (groundId) {
    case 'west_ham': return 'Stratford'
    case 'spurs':    return 'Seven Sisters'
    case 'arsenal':  return 'Arsenal'
    default:         return 'the ground'
  }
}
