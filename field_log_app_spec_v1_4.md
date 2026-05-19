# REFUELER | Field Log App — Spec & Requirements
**Version:** v1.4 — Session 3 complete. Mapbox guide written. Dial recalibrated. Watch UI countdown specced.
**Status:** ✅ Session 1 complete — Field Log App built and live. ✅ Session 2 complete — Command Centre dashboard + Supabase schema built. ✅ Session 3 complete — Mapbox activation guide, ETA dial thresholds, Watch UI countdown spec.
**Next Action:** Session 4 — Mapbox token activation (user action), Black Sheep Coffee partner outreach when open, return visit data entry (evening lighting, Bay 4 speed test, zebra crossing peak-time data).

---

## Geography — Ground Truth (Post-Visit 1)

**The Lake bisects Lakeside.** West-side coffee (Costa/Next, Starbucks, Greggs near Next) requires navigating around it. Do not use these as primary runner routes for Tesla bays.

**Primary axis:** Tesla Superchargers (Car Park G, north-east) ↔ M&S Café (Level 2, east end).

**Confirmed active EV charging only:**
- Tesla Superchargers, Car Park G: 16 V3 bays, CCS compatible (May 2026). Only confirmed active charging in the complex. All other marked bays on Google/Apple Maps are inactive or removed.

---

## Coffeeshop Priority Tiers — Corrected

### Tier 1 — Walk-and-collect viable (east side)
| Vendor | Floor | Est. walk from Bay 4D | Notes |
|---|---|---|---|
| M&S Café | Level 2 (same level as car park entry) | 3:12 (furthest), 2:32 (nearest) | Primary. Order screens. 5 staff at 2:40pm. |
| Costa Coffee (near M&S) | Level 2 | ~3:42 est. | 60 seats, 2 staff. Near bus station. |
| Café Nero | Level 1 (east) | ~4:00 est. | 3 staff, mezzanine. College demographic. |
| Pret A Manger (near M&S) | Level 1 | ~4:30 est. | Small unit, 1 staff. Bus station delivery viable. |
| Greggs (near M&S) | Level 2 | ~4:00–4:30 est. | 3 staff. Bus station adjacent. |
| Black Sheep Coffee | Level 1 (next to Café Nero) | ~4:00 est. | Not yet open. Flag for partner outreach. |

### Tier 2 — West side (lake routing, not viable as primary)
Costa (inside Next), Starbucks, Greggs (near Next), Pret (near Next). Retain for future activation if west-side EV bays return.

### Tier 3 — Perimeter / separate geofence
Tim Hortons, McDonald's (Tesco retail park, 4 InstaVolt bays), IKEA (1 Gridserve bay).

---

## Walk Times — Confirmed Field Data

| Route | Pace | Time | Notes |
|---|---|---|---|
| Bay 4D → Bay 2 cluster | Normal | 0:22 | Within cluster |
| Bay 2 cluster → Bay 1A | Normal | 0:18 | Nearest bay |
| Bay 1A → zebra crossing | Normal | ~0:05 | Variable wait: 0:05–2:00 peak |
| Crossing → M&S entrance (Level 2) | Normal | ~2:00 | Same level entry, no stairs |
| M&S entrance → café till | Normal | ~0:30 | Through food court |
| **Bay 4D → M&S café till (best case)** | **Normal** | **3:12** | |
| **Bay 4D → M&S café till (peak crossing)** | **Normal** | **~4:52** | |
| M&S café till → furthest bus station bay | Normal | 3:10 | |

**Zebra crossing is the primary ETA variable.** Time-of-day heuristic needed in the app.

---

## Route Timer Buttons — Named (Session 1 Build)

### Tesla Bay ↔ Vendor Routes
| Button label | Log key | Status |
|---|---|---|
| Bay → M&S Café | WALK_TESLA_TO_MAS | ✅ Active |
| M&S Café → Bay | WALK_MAS_TO_TESLA | ✅ Active |
| Bay → Costa (Level 2) | WALK_TESLA_TO_COSTA_L2 | ✅ Active |
| Costa (Level 2) → Bay | WALK_COSTA_L2_TO_TESLA | ✅ Active |
| Bay → Café Nero | WALK_TESLA_TO_NERO | ✅ Active |
| Café Nero → Bay | WALK_NERO_TO_TESLA | ✅ Active |
| Bay → Pret / Greggs | WALK_TESLA_TO_PRET_GREGGS | ✅ Active |
| Pret / Greggs → Bay | WALK_PRET_GREGGS_TO_TESLA | ✅ Active |
| Bay → Black Sheep Coffee | WALK_TESLA_TO_BLACK_SHEEP | ✅ Flagged "Opening soon" |
| Black Sheep → Bay | WALK_BLACK_SHEEP_TO_TESLA | ✅ Flagged "Opening soon" |

### Queue & Production Timers
| Button label | Log key |
|---|---|
| Queue wait (join → order placed) | QUEUE_WAIT |
| Production (order placed → name called) | PRODUCTION_TIME |
| Handover (name called → drink in hand) | HANDOVER_TIME |
| Full coffee gap (join queue → in hand) | COFFEE_GAP_TOTAL |

---

## Abort / Void Button

- Red, always visible.
- On tap: shows reason selector (Interrupted / Wrong route / False start / Obstruction / Other).
- Voided entries remain in log marked VOIDED + reason. Patterns are data.

---

## Observation Capture — Session 1 Build

The app includes an Observe tab with:
- **Conditions tags** (charger status, footfall, weather, roadworks, events, staffing) — multi-select.
- **Order timing capture** — vendor selector, queue/production/handover fields, staff count. Saved as ORDER_OBSERVATION log entry.
- **Site/vendor profile** — name, floor/location, coordinates, Refueler potential. Saved as SITE_PROFILE log entry.

---

## Notes & Voice Memo

- Free-text notes field (large, multi-line).
- Voice memo: tap mic → Web Speech API transcription → text appended to notes field automatically. Uses en-GB language model. Requires Chrome or Safari iOS 15+.
- Session notes included in all exports.

---

## Export Formats

| Format | Use |
|---|---|
| JSON | Supabase import (Session 2). Full structured data including all fields. |
| Markdown table | Paste into audit .md files. Human-readable. |

### JSON Export Shape (for Supabase import)
The Field Log App JSON export must match this structure for the Command Centre importer:
```json
{
  "session": {
    "session_id": "S4F2A",
    "site_name": "Lakeside — Tesla Superchargers, Car Park G",
    "notes": "..."
  },
  "entries": [
    {
      "session_id": "S4F2A",
      "entry_type": "WALK_TIMER",
      "log_key": "WALK_TESLA_TO_MAS",
      "label": "Bay → M&S Café",
      "duration_ms": 192000,
      "duration_fmt": "3:12",
      "ts": "2026-05-16T14:32:00",
      "voided": false,
      "void_reason": null,
      "tags": ["off_peak", "clear_crossing"],
      "notes": ""
    }
  ]
}
```

---

## Session 1 UI Decisions (Locked)

- White background default (outdoor legibility confirmed).
- Large touch targets throughout (minimum 44px).
- No complex dial — removed per spec update.
- Voice transcription: tap-to-record, text appended to notes.
- Abort always visible and clearly red.
- Bottom tab navigation: Timer / Observe / Notes / Log / Export.
- Session ID auto-generated (e.g. S4F2A) displayed in header.

---

## Wizard of Oz — Revised Approach

No need to buy multiple coffees. Protocol:

1. Record real customer order times in-store using the Queue/Production/Handover timers.
2. Separately record walk times Bay → Vendor using the route timer buttons.
3. Total = queue time + production time + walk time from bay.
4. Apply conditions tags to both observations to flag variables (crossing wait, footfall, staffing).

**Current best-case Investor Stat (M&S Café, Bay 1A, off-peak crossing):**
Queue 0:20 + Production 1:30 + Walk 2:32 = **4:22 total from join-queue to drink at bay.**

---

## Coordinates Registry — Lakeside

| Location | Latitude | Longitude | Source | Notes |
|---|---|---|---|---|
| Tesla cluster mid-point | 51.489452 N | 0.286680 E | Sun Seeker | Primary geofence centre |
| Tesla Bay 1A (nearest M&S) | 51.489433 N | 0.286634 E | Sun Seeker | |
| Tesla Bay 4D (furthest) | 51.489616 N | 0.286950 E | Sun Seeker | |
| IKEA Gridserve charger | 51.480259 N | 0.284511 E | Sun Seeker | 1 bay, screen + QR present |
| mer chargers (IKEA corner) | 51.480949 N | 0.283582 E | Sun Seeker | 8 bays, likely IKEA fleet |
| B&Q RAW Rapid (inactive) | 51.481388 N | 0.282375 E | Sun Seeker | Covered/not live May 2026 |
| Café Nero (Level 1) | 51.489998 N | 0.282871 E | Sun Seeker | |
| Costa Coffee (Level 2, near M&S) | 51.488777 N | 0.283615 E | Sun Seeker | |
| Greggs (Level 1, near Next) | 51.485851 N | 0.283683 E | Sun Seeker | |
| Pret A Manger (near Next) | 51.485798 N | 0.283794 E | Sun Seeker | |

*Note: Coordinates marked as potentially imprecise. Cross-reference with shopping centre floor plan for secondary markers.*

---

## Session 2 — Command Centre Build (Complete)

### What was built
- `refueler_command_centre.html` — standalone HTML dashboard, no build step needed. Open in any browser.
- `refueler_schema.sql` — run in Supabase SQL Editor to create all three tables + trigger.

### Command Centre features (Session 2)
- **Light mode default** (Paper). Dark mode (Carbon) via PAPER / CARBON toggle in nav.
- **Boot sequence** on load: 3 system lines at 0/400/800ms stagger, then site identity lines, ready state at ~4s.
- **Telemetry console** — full-height, monospaced, timestamped log lines. Tags: [SYS], [OK], [WARN], [ERR], [INFO].
- **Verify Dial** — dashed ring pre-verify → animated arc fill → solid green on verify. Centre shows ETA (4:22) post-verify.
- **VERIFY SESSION button** — triggers dial animation, locks investor stat into console and stats bar.
- **Partner card** — hardcoded field data (Bay 1A 2:32, Bay 4D 3:12, crossing variable). Live Supabase walk_stats rows appear below once connected.
- **Supabase config panel** — paste Project URL + anon key → connect → fetches session count and walk_stats live.
- **JSON import** — drag-and-drop or file picker. POSTs session row then log_entries batch to Supabase REST API. Requires Supabase connection first.
- **Geofence strip** — shows outer (15m, green) and inner (5m, amber dashed) ring identifiers + centre coordinates.
- **Stats bar** — Best-case ETA (4:22), Active Bays (16), Sessions logged (live from Supabase), Walk samples (live).
- **Status pill** — STANDBY pre-verify → LIVE post-verify.
- **Mapbox** — code written and commented out. To activate: see Session 3 Mapbox Activation Guide below.

### Supabase schema (Session 2)
Three tables created by `refueler_schema.sql`:
- `sessions` — one row per field visit
- `log_entries` — one row per log entry (walk timer, order observation, site profile, voided)
- `walk_stats` — auto-updated derived summary per route key via INSERT trigger

**To run:** Supabase Dashboard → SQL Editor → New query → paste `refueler_schema.sql` → Run.

**RLS:** commented out by default. Uncomment the policy block after confirming anon read/write works.

### Decisions locked in Session 2
- Light (Paper) is default. Dark (Carbon) is toggle only. ✅
- M&S Café is primary partner. ✅
- West-side vendors are Tier 2. ✅
- Zebra crossing treated as variable input, not constant. ✅
- Investor Stat: 4:22 (Queue 0:20 + Production 1:30 + Walk 2:32, Bay 1A off-peak). ✅
- JSON export shape defined for Field Log App → Supabase import. ✅

---

## Session 3 — Complete

### 3a. Mapbox Activation Guide

**Step 1 — Get a free Mapbox token**

Go to mapbox.com → Create account (free) → Dashboard → Access tokens → copy the default public token (starts with `pk.`).

**Step 2 — Paste token into `refueler_command_centre.html`**

Find near the top of the `<script>` block:
```javascript
const MAPBOX_TOKEN = ''; // ← paste your token here
```
Replace with:
```javascript
const MAPBOX_TOKEN = 'pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6...';
```

**Step 3 — Uncomment the map init call**

Find:
```javascript
// initMap();
```
Change to:
```javascript
initMap();
```

Save and open in Chrome or Safari. The map activates immediately.

**What loads on activation:**
- flyTo: 51.489452°N, 0.286680°E, zoom 17
- Outer geofence ring: 15m radius, solid green fill, low opacity
- Inner geofence ring: 5m radius, amber dashed stroke
- Bay marker: pin at cluster mid-point labelled "Tesla Superchargers — Car Park G"

**Troubleshooting:** `401` in DevTools Console = token not saved. `422` = GeoJSON polygon malformed, check the circle coordinates haven't been edited.

---

### 3b. ETA Dial — Recalibrated Thresholds (Session 3)

The dial represents total time from joining the queue to drink in hand at the bay. Investor Stat reference: **4:22**.

| Zone | Colour | Threshold | Meaning |
|---|---|---|---|
| **Green** | #22C55E | 0:00 – 4:30 | On or better than Investor Stat. Delivery viable. |
| **Amber** | #F59E0B | 4:31 – 5:30 | Marginal. Peak crossing or slow production. Still completable. |
| **Red** | #EF4444 | 5:31+ | Exceeds worst-case field time. Abort/void likely. |

**Hard-coded constants for timer app build:**

```
GREEN_MAX_MS    = 270000    // 4:30
AMBER_MAX_MS    = 330000    // 5:30
RED_START_MS    = 330001    // 5:30+
INVESTOR_STAT_MS = 262000   // 4:22 — marker line on dial face
```

**Threshold rationale:**
- Green ceiling 4:30: 8-second buffer above Investor Stat. Rounds to "under 4:30" in copy.
- Amber ceiling 5:30: covers worst-case crossing (4:52) + realistic production overrun (~0:38).
- Red at 5:31+: beyond compounded delays (crossing + queue + slow production simultaneously).

---

### 3c. Watch UI — "Shopping Time Remaining" Countdown (Session 3)

**Purpose:** Shows driver how much usable shopping time remains after leaving the bay cluster.

**Start value:** 180 seconds (3:00). Based on confirmed Bay 4D → Lakeside main entrance walk time (conservative, furthest bay).

**Trigger:** Geofence EXIT from 15m outer ring at 51.489452°N, 0.286680°E.

**Display format:**
- Above 60s: `"X mins Y secs of shopping left"`
- Below 60s: `"XX secs — head back now"` (red text)

**Milestone alerts:**

| Time remaining | Watch haptic + display |
|---|---|
| 3:00 (start) | Countdown begins, no alert |
| 2:00 | Single tap haptic |
| 1:00 | Double tap haptic + amber colour |
| 0:30 | Triple tap haptic + red colour |
| 0:00 | "Return to bay now" full-screen alert |

**Edge cases:**

| Scenario | Behaviour |
|---|---|
| Re-enters geofence before 0:00 | Cancel countdown. Display "Back at bay." No alert. |
| Re-enters then exits again | Restart from 180s on each EXIT event. |
| Screen locked during countdown | Continue in background. Deliver haptics regardless of screen state. |
| Countdown reaches 0:00, driver still absent | Hold alert until geofence re-entry. Do not loop or repeat. |
| GPS dropout | Pause countdown. Display "Signal lost — timer paused." Resume from paused value on restore. |

**Future calibration note:** Bay 1A walk to entrance is ~2:32. Bay 4D is ~3:12. v1 uses 3:00 (conservative). Future build: detect nearest bay cluster on exit, set start value dynamically (2:32 or 3:12).

---

### Decisions locked in Session 3
- Dial zones: Green 0–4:30, Amber 4:31–5:30, Red 5:31+. ✅
- Investor Stat marker at 4:22 on dial face. ✅
- Watch countdown start value: 180s (3:00), triggered on geofence EXIT. ✅
- Re-entry cancels countdown and resets to 180s on next exit. ✅
- Mapbox activation requires user to paste token — no token stored in spec or code. ✅

---

## Session 4 — What Remains

| Item | Notes |
|---|---|
| Mapbox token activation | User action: paste `pk.` token into dashboard, uncomment `initMap()`. Test flyTo + geofence rings. |
| Black Sheep Coffee | Partner outreach when open. Add to active routes. |
| Return visit data | Evening lighting check, Bay 4 connectivity speed test, zebra crossing peak-time data. |
| RLS policies | Uncomment in schema after confirming anon key works end-to-end. |
| Watch UI build | Implement 3c spec. Wire to geofence EXIT event. Test haptic alerts. |
| Watch UI dynamic bay detection | Detect Bay 1A vs Bay 4D cluster on exit → set start value 152s or 192s. Session 5+. |
| Exit vector geofence | 15mph trigger calibration. Roundabout dwell < 1 min confirmed. |

---

## Post-Visit 1 Status

- [x] Field Log App built (Session 1)
- [x] Route logic corrected to M&S-primary
- [x] Walk times confirmed and documented
- [x] Command Centre dashboard built (Session 2)
- [x] Supabase schema built (Session 2)
- [x] JSON import shape defined (Session 2)
- [x] Mapbox activation guide written (Session 3)
- [x] ETA dial thresholds defined (Session 3)
- [x] Watch UI countdown spec written (Session 3)
- [ ] Mapbox token — user action: activate in dashboard
- [ ] Watch UI — build from 3c spec
- [ ] Black Sheep Coffee: partner outreach when open
- [ ] Return visit: connectivity speed test at Bay 4, evening lighting check, zebra crossing peak-time data

---

## Version History

| Version | Date | Notes |
|---|---|---|
| v1.0 | 2026-05-14 | Initial spec, pre-Lakeside Visit 1 |
| v1.1 | 2026-05-15 | Coordinate capture fields added, ad hoc EV site log added |
| v1.2 | 2026-05-16 | Route logic corrected to M&S-primary. West-side routes demoted. Session 1 Field Log App built. Wizard of Oz approach revised. Coordinates registry added. |
| v1.3 | 2026-05-16 | Session 2 complete. Command Centre dashboard built. Supabase schema + trigger built. JSON import shape defined. Mapbox ready (commented out, token needed). Session 3 scope defined. |
| v1.4 | 2026-05-16 | Session 3 complete. Mapbox activation guide written. ETA dial thresholds specced (Green 0–4:30, Amber 4:31–5:30, Red 5:31+). Watch UI countdown spec written (180s, geofence EXIT trigger, 5 haptic milestones, edge cases). Session 4 scope defined. |
