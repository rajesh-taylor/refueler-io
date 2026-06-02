// =============================================================
// Refueler · Match Day Mode — Session 21
// lib/matchDaySkin.ts
// =============================================================
// Manages the data-skin="england" CSS overlay on the app root.
//
// Responsibilities:
//   - Read match_day_state from Supabase on app launch + foreground
//   - Apply / remove overlay within the T−3h → T+2h window
//   - Schedule auto-revert at window_end
//   - Expose matchDayState to the rest of the app via Zustand slice
//
// The skin layer ONLY modifies CSS custom properties.
// Carbon is the base — the overlay is thin, reversible, not a
// full theme swap. Paper mode is unaffected (no match day skin
// in Paper; most users on Paper are on the homepage/editorial).
// =============================================================

import { createClient } from '@supabase/supabase-js'
import { AppState } from 'react-native'
import type { AppStateStatus } from 'react-native'

// ─── Types ───────────────────────────────────────────────────

export interface MatchDayState {
  groundId:                string
  teamName:                string
  stadiumName:             string
  interchangeTip:          string
  kickoffUtc:              Date
  windowStart:             Date
  windowEnd:               Date
  surgeCopy:               string | null    // null = feature off (MVF)
  isNationalTeamFixture:   boolean
  // Skin rule (enforced in apply()):
  //   true  + en-GB locale → England skin (#CF3030) activated
  //   false (club match)   → copy variants only, Carbon skin unchanged
}

export type MatchDayStatus =
  | { active: false }
  | { active: true; state: MatchDayState }

// ─── Locale gate ─────────────────────────────────────────────
// England skin activates on en-GB locale devices only.
// Any other locale → skin never applies, regardless of match day state.
// Evaluated once at init and cached — never re-evaluated mid-session.
//
// Covers:
//   'en-GB'        — standard UK English
//   'en-GB-*'      — regional variants (e.g. en-GB-u-ca-gregory)
//
// Does NOT cover:
//   'en-US', 'en-AU', 'fr-FR' etc. — no skin, ever.
// Non-UK Bitcoin stackers travelling through Fenchurch St corridor
// see standard Carbon. Correct behaviour — this is a local skin.

const ENGLAND_SKIN_LOCALE = 'en-GB'

function isEnglandLocale(): boolean {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale
    return locale === ENGLAND_SKIN_LOCALE || locale.startsWith('en-GB')
  } catch {
    // Intl unavailable — fail safe, no skin applied
    return false
  }
}

// ─── England skin token overrides ────────────────────────────
// Applied to :root when match day is active in Carbon mode.
// St George red: #CF3030 (approved Session 21).
// Only accent-layer tokens are overridden — layout, type,
// surfaces remain Carbon-identical.

export const ENGLAND_SKIN_TOKENS = {
  '--accent-carbon':          '#CF3030',    // was #C8A96E gold
  '--accent-carbon-subtle':   'rgba(207, 48, 48, 0.12)',
  '--accent-carbon-border':   'rgba(207, 48, 48, 0.35)',
  '--eta-arc-color':          '#CF3030',
  '--reward-badge-bg':        'rgba(207, 48, 48, 0.15)',
  '--reward-badge-border':    '#CF3030',
} as const

// ─── Supabase query ──────────────────────────────────────────

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
)

async function fetchMatchDayState(): Promise<MatchDayStatus> {
  const { data, error } = await supabase
    .from('match_day_state')
    .select(`
      ground_id,
      team_name,
      stadium_name,
      interchange_tip,
      kickoff_utc,
      window_start,
      window_end,
      match_day_surge!inner ( surge_copy )
    `)
    .eq('id', 1)
    .maybeSingle()

  if (error || !data) {
    return { active: false }
  }

  const now         = new Date()
  const windowStart = new Date(data.window_start)
  const windowEnd   = new Date(data.window_end)

  // State row exists but we're outside the window
  // (detector writes ahead of time; app checks the window itself)
  if (now < windowStart || now > windowEnd) {
    return { active: false }
  }

  return {
    active: true,
    state: {
      groundId:               data.ground_id,
      teamName:               data.team_name,
      stadiumName:            data.stadium_name,
      interchangeTip:         data.interchange_tip,
      kickoffUtc:             new Date(data.kickoff_utc),
      windowStart,
      windowEnd,
      surgeCopy:              data.match_day_surge?.surge_copy ?? null,
      isNationalTeamFixture:  data.is_national_team_fixture ?? false,
    },
  }
}

// ─── Skin controller class ────────────────────────────────────

class MatchDaySkinController {
  private status: MatchDayStatus       = { active: false }
  private revertTimer: ReturnType<typeof setTimeout> | null = null
  private appStateSubscription: { remove: () => void } | null = null
  private listeners: Set<(s: MatchDayStatus) => void> = new Set()

  // ── Public API ──────────────────────────────────────────────

  /** Call once on app mount. */
  async init(): Promise<void> {
    await this.refresh()
    this.subscribeAppState()
  }

  /** Tear down on unmount (rare — controller lives for app lifetime). */
  destroy(): void {
    this.clearRevertTimer()
    this.appStateSubscription?.remove()
    this.listeners.clear()
  }

  /** Subscribe to status changes. Returns unsubscribe fn. */
  subscribe(fn: (s: MatchDayStatus) => void): () => void {
    this.listeners.add(fn)
    fn(this.status)                                          // emit current immediately
    return () => this.listeners.delete(fn)
  }

  get current(): MatchDayStatus {
    return this.status
  }

  // ── Internal ────────────────────────────────────────────────

  private async refresh(): Promise<void> {
    const next = await fetchMatchDayState()
    this.apply(next)
  }

  private apply(next: MatchDayStatus): void {
    const wasActive = this.status.active

    // Gate 1 — locale: en-GB only
    const skinEligible = isEnglandLocale()

    // Gate 2 — national team fixture only.
    // Club matches (West Ham, Spurs, Arsenal) deliver copy variants
    // but never activate the skin. We cannot know supporter allegiance.
    const skinRequested = next.active && next.state.isNationalTeamFixture

    this.status = next

    if (skinRequested && skinEligible) {
      this.activateSkin()
      this.scheduleRevert(next.state.windowEnd)
    } else if (wasActive) {
      // Was active (skin may have been on) — always deactivate cleanly
      this.deactivateSkin()
      this.clearRevertTimer()
    } else {
      // Non-en-GB or club match — ensure skin is always off
      this.deactivateSkin()
      this.clearRevertTimer()
    }

    this.emit()
  }

  private activateSkin(): void {
    // In a React Native / web hybrid, this targets the CSS root.
    // On native, CSS vars are simulated via a ThemeContext value.
    if (typeof document !== 'undefined') {
      const root = document.documentElement
      root.setAttribute('data-skin', 'england')
      for (const [prop, val] of Object.entries(ENGLAND_SKIN_TOKENS)) {
        root.style.setProperty(prop, val)
      }
    }
    // Native: dispatch to ThemeContext via listeners (see matchDayCopy.ts)
  }

  private deactivateSkin(): void {
    if (typeof document !== 'undefined') {
      const root = document.documentElement
      root.removeAttribute('data-skin')
      for (const prop of Object.keys(ENGLAND_SKIN_TOKENS)) {
        root.style.removeProperty(prop)
      }
    }
  }

  private scheduleRevert(windowEnd: Date): void {
    this.clearRevertTimer()
    const msUntilEnd = windowEnd.getTime() - Date.now()
    if (msUntilEnd <= 0) {
      this.apply({ active: false })
      return
    }
    this.revertTimer = setTimeout(() => {
      this.apply({ active: false })
    }, msUntilEnd)
  }

  private clearRevertTimer(): void {
    if (this.revertTimer !== null) {
      clearTimeout(this.revertTimer)
      this.revertTimer = null
    }
  }

  private subscribeAppState(): void {
    this.appStateSubscription = AppState.addEventListener(
      'change',
      (state: AppStateStatus) => {
        if (state === 'active') {
          // Re-check on every foreground return (catches day rollover,
          // mid-session match start, and window expiry while backgrounded)
          this.refresh()
        }
      }
    )
  }

  private emit(): void {
    for (const fn of this.listeners) fn(this.status)
  }
}

// ─── Singleton export ─────────────────────────────────────────
// Import this wherever match day state is needed.

export const matchDaySkin = new MatchDaySkinController()

// ─── React hook ───────────────────────────────────────────────

import { useState, useEffect } from 'react'

export function useMatchDayStatus(): MatchDayStatus {
  const [status, setStatus] = useState<MatchDayStatus>(matchDaySkin.current)

  useEffect(() => {
    const unsub = matchDaySkin.subscribe(setStatus)
    return unsub
  }, [])

  return status
}
