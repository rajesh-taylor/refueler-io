// =============================================================
// Refueler · Match Day Mode — Session 21
// lib/matchDayDetector.ts
// =============================================================
// Runs as a Supabase Edge Function (scheduled: 06:00 UTC daily).
//
// Logic:
//   1. Fetch today's PL fixtures from football-data.org
//   2. Check each tracked ground for a home match
//   3. If found: upsert match_day_state with window T−3h → T+2h
//   4. If none:  delete match_day_state (restores default Carbon)
//
// Env vars required (Supabase Vault):
//   FOOTBALL_DATA_API_KEY   — football-data.org token
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
// =============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ─── Types ───────────────────────────────────────────────────

interface FDFixture {
  id: number
  utcDate: string                         // ISO 8601
  status: 'SCHEDULED' | 'TIMED' | 'IN_PLAY' | 'PAUSED' | 'FINISHED' | 'POSTPONED' | 'CANCELLED' | 'SUSPENDED'
  homeTeam: { id: number; name: string }
  awayTeam: { id: number; name: string }
  competition: { id: number; name: string }
}

interface FDResponse {
  matches: FDFixture[]
}

interface Ground {
  id: string
  team_name: string
  stadium_name: string
  interchange_tip: string
  football_data_team_id: number
  active: boolean
}

interface MatchDayState {
  id: 1
  ground_id: string
  team_name: string
  stadium_name: string
  interchange_tip: string
  kickoff_utc: string
  window_start: string
  window_end: string
  is_national_team_fixture: boolean   // true = England skin eligible; false = copy variants only
}

// ─── Constants ───────────────────────────────────────────────

const FD_BASE         = 'https://api.football-data.org/v4'
const PL_COMPETITION  = 2021    // Premier League
const ENGLAND_TEAM_ID = 66      // football-data.org England national team ID

// Competitions in which an England fixture triggers the skin.
// Club matches never trigger the skin — no assumption about supporter allegiance.
const NATIONAL_TEAM_COMPETITIONS = new Set([
  2072,   // UEFA European Championship (Euros)
  2000,   // FIFA World Cup
  2019,   // UEFA Nations League
  2077,   // FIFA World Cup Qualification — Europe
])

const WINDOW_PRE_H    = 3       // hours before kick-off
const WINDOW_POST_H   = 2       // hours after kick-off

// ─── Helpers ─────────────────────────────────────────────────

function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000)
}

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10)               // 'YYYY-MM-DD'
}

// ─── Main handler ────────────────────────────────────────────

Deno.serve(async (_req: Request): Promise<Response> => {
  const apiKey    = Deno.env.get('FOOTBALL_DATA_API_KEY')
  const supaUrl   = Deno.env.get('SUPABASE_URL')
  const supaKey   = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!apiKey || !supaUrl || !supaKey) {
    return new Response(
      JSON.stringify({ error: 'Missing required env vars' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const supabase = createClient(supaUrl, supaKey)

  // 1. Load tracked grounds
  const { data: grounds, error: groundsErr } = await supabase
    .from('match_day_grounds')
    .select('*')
    .eq('active', true)

  if (groundsErr || !grounds?.length) {
    return new Response(
      JSON.stringify({ error: 'Failed to load grounds', detail: groundsErr }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const trackedTeamIds = new Set(
    (grounds as Ground[]).map(g => g.football_data_team_id)
  )

  // 2. Fetch today's PL fixtures
  const today = todayUTC()
  const fdRes = await fetch(
    `${FD_BASE}/competitions/${PL_COMPETITION}/matches?dateFrom=${today}&dateTo=${today}&status=SCHEDULED,TIMED`,
    { headers: { 'X-Auth-Token': apiKey } }
  )

  if (!fdRes.ok) {
    console.error(`football-data.org error: ${fdRes.status}`)
    return new Response(
      JSON.stringify({ error: `football-data.org ${fdRes.status}` }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const { matches }: FDResponse = await fdRes.json()

  // 3a. Check for an England national team fixture today (any competition).
  //     These are the ONLY fixtures that make the England skin eligible.
  //     Club matches never trigger the skin — we cannot know supporter allegiance.
  let isNationalTeamFixture = false
  for (const compId of NATIONAL_TEAM_COMPETITIONS) {
    const ntRes = await fetch(
      `${FD_BASE}/competitions/${compId}/matches?dateFrom=${today}&dateTo=${today}&status=SCHEDULED,TIMED`,
      { headers: { 'X-Auth-Token': apiKey } }
    )
    if (ntRes.ok) {
      const { matches: ntMatches }: FDResponse = await ntRes.json()
      const englandPlaying = ntMatches.some(
        m => m.homeTeam.id === ENGLAND_TEAM_ID || m.awayTeam.id === ENGLAND_TEAM_ID
      )
      if (englandPlaying) {
        isNationalTeamFixture = true
        break
      }
    }
    // Non-200 from a competition endpoint is non-fatal — England may simply
    // not be in that competition. Log and continue.
    else {
      console.warn(`[matchDayDetector] competition ${compId} returned ${ntRes.status} — skipped`)
    }
  }

  // 3b. Find first home match for a tracked club ground (PL fixtures already fetched)
  const homeMatches = matches
    .filter(m => trackedTeamIds.has(m.homeTeam.id))
    .sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime())

  if (!homeMatches.length) {
    // No match today — clear the flag → app reverts to default Carbon
    await supabase.from('match_day_state').delete().eq('id', 1)
    console.log(`[matchDayDetector] ${today}: no home match → state cleared`)
    return new Response(
      JSON.stringify({ matchDay: false, date: today }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // 4. Build state row for the first home match
  const match  = homeMatches[0]
  const ground = (grounds as Ground[]).find(
    g => g.football_data_team_id === match.homeTeam.id
  )!

  const kickoff     = new Date(match.utcDate)
  const windowStart = addHours(kickoff, -WINDOW_PRE_H)
  const windowEnd   = addHours(kickoff, WINDOW_POST_H)

  const stateRow: MatchDayState = {
    id:                       1,
    ground_id:                ground.id,
    team_name:                ground.team_name,
    stadium_name:             ground.stadium_name,
    interchange_tip:          ground.interchange_tip,
    kickoff_utc:              kickoff.toISOString(),
    window_start:             windowStart.toISOString(),
    window_end:               windowEnd.toISOString(),
    is_national_team_fixture: isNationalTeamFixture,
    // Skin note: England skin (#CF3030) activates in matchDaySkin.ts
    // ONLY when is_national_team_fixture = true AND locale = en-GB.
    // Club matches: copy variants only, Carbon skin unchanged.
  }

  // 5. Upsert (singleton row — id = 1 always)
  const { error: upsertErr } = await supabase
    .from('match_day_state')
    .upsert(stateRow, { onConflict: 'id' })

  if (upsertErr) {
    return new Response(
      JSON.stringify({ error: 'Upsert failed', detail: upsertErr }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  console.log(
    `[matchDayDetector] ${today}: ${ground.team_name} home · ` +
    `kick-off ${kickoff.toISOString()} · ` +
    `window ${windowStart.toISOString()} → ${windowEnd.toISOString()} · ` +
    `national team fixture: ${isNationalTeamFixture}`
  )

  return new Response(
    JSON.stringify({
      matchDay:               true,
      ground:                 ground.id,
      team:                   ground.team_name,
      kickoff:                kickoff.toISOString(),
      windowStart:            windowStart.toISOString(),
      windowEnd:              windowEnd.toISOString(),
      isNationalTeamFixture,
      skinEligible:           isNationalTeamFixture,   // convenience flag for debugging
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
})
