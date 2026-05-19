# REFUELER — Session 4 Handoff Prompt
---

We're building REFUELER, a coffee-delivery-to-EV-charging-bay service. Session 1 built the Field Log App. Session 2 built the Command Centre + Supabase schema. Session 3 wrote the Mapbox guide, dial thresholds, and Watch UI spec. This is Session 4.

## What exists (do not rebuild)

**Field Log App** — mobile HTML, bottom tab nav: Timer / Observe / Notes / Log / Export.
- Route timers (WALK_TESLA_TO_MAS etc.), queue/production/handover timers
- Abort/void button (red, always visible)
- JSON + Markdown export matching the locked schema below

**Command Centre** (`refueler_command_centre.html`) — standalone HTML, no build step:
- Carbon (dark) default. Paper (light) toggle. Map style switches live with theme.
- Boot sequence telemetry console
- Verify Dial → animated arc → 4:22 ETA locked on verify
- Sidebar: Active Site card (Tesla red chip + M&S green/gold chip), Session Verification, M&S ETA Audit, Partner card, Supabase config, JSON import
- Mapbox map: live, dark-v11 Carbon / light-v11 Paper. flyTo 51.489452°N 0.286680°E zoom 17. 15m green geofence ring, 5m amber dashed ring. Tesla red marker + M&S green chip marker at 51.488777°N 0.283615°E.
- Stats bar: Best-case ETA 4:22, Active Bays 16, Sessions Logged (live Supabase), Walk Samples (live Supabase)
- Brand chip system: `.brand-chip` CSS class — 28×28px rounded square, mono font 9px bold

**Supabase schema** (`refueler_schema.sql`) — three tables: `sessions`, `log_entries`, `walk_stats` (auto-updated via INSERT trigger). RLS commented out pending end-to-end test.
**Supabase auth:** Email provider confirmed enabled. Ready for magic link build.

## Active site
- Lakeside Shopping Centre, Car Park G — Tesla Superchargers (16 V3 bays, CCS)
- Primary partner: M&S Café, Level 2
- Geofence centre: 51.489452°N, 0.286680°E
- Investor Stat: 4:22 (Queue 0:20 + Production 1:30 + Walk 2:32, Bay 1A off-peak)

## Locked JSON export shape
```json
{
  "session": { "session_id": "S4F2A", "site_name": "Lakeside — Tesla Superchargers, Car Park G", "notes": "..." },
  "entries": [{
    "session_id": "S4F2A", "entry_type": "WALK_TIMER", "log_key": "WALK_TESLA_TO_MAS",
    "label": "Bay → M&S Café", "duration_ms": 192000, "duration_fmt": "3:12",
    "ts": "2026-05-16T14:32:00", "voided": false, "void_reason": null,
    "tags": ["off_peak", "clear_crossing"], "notes": ""
  }]
}
```

## Session 4 tasks (priority order)

### 1. End-to-end Supabase pipeline test
- Generate a test session JSON (or construct one manually matching the locked schema above)
- Drag into Command Centre JSON import zone
- Confirm: session row in `sessions`, entries in `log_entries`, `walk_stats` auto-updates
- Fix any import POST errors in `refueler_command_centre.html`
- Once confirmed working: uncomment RLS policies in `refueler_schema.sql`

### 2. Client login — magic link auth
- **Placement:** Top-right nav bar, beside PAPER/CARBON toggle
- **Method:** Supabase magic link — `supabase.auth.signInWithOtp()`, email only, no password
- **CDN:** `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2`
- **Logged-in state:** Partner brand chip in nav + display name. Logout option.
- **Data scope:** Supabase RLS `auth.uid()` — partner sees only their `site_name` sessions
- **Admin vs partner:** Admin sees all data + revenue counters (Session 5 build). Partner sees their site only.
- **Inline modal** — no separate login page

### 3. User profile schema
Add to Supabase alongside login build:
```sql
CREATE TABLE user_profiles (
  id uuid REFERENCES auth.users(id) PRIMARY KEY,
  display_name text,
  payment_preference text DEFAULT 'fiat', -- 'fiat' | 'sats' | 'hybrid'
  lightning_address text,
  minibits_wallet_id text,
  created_at timestamptz DEFAULT now()
);
```
`payment_preference` drives handover screen colour and sats routing in Session 5. Schema only in Session 4 — do not build the handover screen yet.

### 4. Watch UI — `refueler_watch.html`
Standalone mobile-first file. Watch is secondary surface; mobile is primary (most EV drivers won't wear a smartwatch). Build both experiences in this file — a watch-sized view and a mobile view.

**Countdown logic:**
- Trigger: geofence EXIT from 15m ring at 51.489452°N, 0.286680°E
- Start: 180s (3:00)
- Display above 60s: "X mins Y secs of shopping left"
- Display below 60s: "XX secs — head back now" in red
- Re-entry: cancel countdown → "Back at bay" → reset to 180s on next exit
- GPS dropout: pause → "Signal lost — timer paused" → resume from paused value

**Haptic milestones:**
| Time | Haptic | Colour |
|---|---|---|
| 2:00 | Single tap | White |
| 1:00 | Double tap | Amber |
| 0:30 | Triple tap | Red |
| 0:00 | Full alert | Red, full screen |

**Battery awareness (`navigator.getBattery()`):**
- Battery < 10%: suppress all haptics to conserve power
- Show persistent notice: "Low battery — haptics off"
- Flash mode also suppressed (see Session 5 locate screen)

**Design:** Large text (min 48px), high contrast, sunlight-readable, one-handed operation, minimal chrome.

### 5. ETA dial recalibration (Field Log App)
Apply Session 3 thresholds:
- Green: 0–270000ms (0:00–4:30)
- Amber: 270001–330000ms (4:31–5:30)
- Red: 330001ms+ (5:31+)
- Investor Stat marker at 262000ms (4:22)

Constants: `GREEN_MAX_MS = 270000`, `AMBER_MAX_MS = 330000`, `INVESTOR_STAT_MS = 262000`

### 6. Black Sheep Coffee — route activation prep
- Field Log App: "Opening soon" → toggleable INACTIVE state (greyed, tap to activate)
- Command Centre partner card: Black Sheep row, greyed, "PENDING" badge
- Brand chip: `#1A1A1A bg / #FFFFFF text / BS`

## Design system — locked
- `.brand-chip` — 28×28px, border-radius 5px, mono 9px bold, 1px rgba white border
- Tesla: `#E82127 / #FFFFFF / T`
- M&S: `#006B3C / #FFD700 / M&S`
- Black Sheep: `#1A1A1A / #FFFFFF / BS`
- Costa: `#6F1A07 / #FFFFFF / CC`
- Café Nero: `#1C1C1C / #C8A96E / CN`
- Pret: `#8B0000 / #FFCC00 / PA`
- Greggs: `#003DA5 / #FFFFFF / GG`
- Bitcoin orange: `#F7931A` — sats-user locate screen + revenue counters (Session 5)

## Decisions locked
- Carbon default. Paper toggle only.
- M&S Café primary partner. Investor Stat 4:22.
- NFC tap = primary handover. QR = fallback, always visible.
- Mobile = primary locate surface. Watch = secondary countdown surface.
- Battery < 10%: solid colour (no flash) + no haptics + "wave your screen" message.
- Fiat users: M&S green locate. Sats users: Bitcoin orange locate.
- JSON export shape locked. Bus station not primary use case. West-side Tier 2.

## Supabase
Free tier. Paste Project URL + anon key when needed. Email auth enabled.
