# README — CC-02: merchant-tablet.html

**Session:** CC-02  
**Built:** June 2026  
**Status:** Complete (v1) — production-ready pending Mapbox token + venue data

---

## What was built

`merchant-tablet.html` — standalone venue staff page, extracted and rebuilt from `refueler_command_centre_v7.html`. Designed for a wall-mounted iPad or tablet; requires no training beyond a 2-minute briefing.

---

## Page structure

### Nav
- Refueler wordmark + "Merchant Tablet" page label
- Venue badge (gold pill, `--accent-carbon`) appears post-auth showing venue name
- `PAPER / CARBON` outlined pill toggle (Paper default on load, persisted via `rfTheme` localStorage)
- Auth slot: `⬡ SIGN IN` button pre-auth → user name chip with SIGN OUT post-auth

### Sidebar (left, 340px)
1. **Darwin card** — always first. "Fenchurch St Line — Darwin" label. Shows last 3 movement events from `rail_movement_log`: CRS code, station name, time, on-time / delay indicator. Green/red connection dot.
2. **Active Site card** — venue name, address, open/closed status dot. Small Mapbox map locked to venue coords (no pan/zoom, `interactive: false`). Single gold marker.
3. **Queue Summary card** — pending count, ready count, orders today, last refresh time. Hidden until signed in.
4. **Help card** — always visible. `support@refueler.io` contact.

### Main area
- **Queue stats strip** — 4 tiles: Pending / Ready / Today / Next train. Hidden until signed in.
- **Queue header** — "Order Queue" title with live poll dot + last polled time + ↻ REFRESH button.
- **Order queue** — scrollable area. Each tile shows: item name, modifiers/notes, anonymous ref (first 8 chars of UUID, `#XXXXXXXX` format), time since order placed with urgency colouring (normal → amber at 4min → red at 8min), status badge (PENDING / READY / URGENT), Mark Ready button.

### Auth gate
Full-screen overlay shown on load if no Supabase session. Magic link form. Dismisses automatically on session establishment.

---

## Auth flow

1. Page loads → Supabase `getSession()` checked
2. No session → full-screen auth gate shown with magic link form
3. Magic link → `signInWithOtp()` → redirect back → `onAuthStateChange` fires
4. PKCE `?code=` param handled at boot (`exchangeCodeForSession`)
5. Post-auth: gate hides, venue resolved, order poll starts, Darwin poll starts
6. Merchant users do **not** require `@refueler.io` — no `isAdmin()` check applied

---

## Venue resolution (two-path)

**Path 1 (production):** Query `merchant_users` table by `email` → get `venue_id` → load full venue row from `venue_partners`.

**Path 2 (fallback):** Query `venue_partners` by `contact_email` → use directly. Maintains compatibility with existing venue data before `merchant_users` is populated.

If neither returns a venue: graceful error shown in site card. No queue shown. `support@refueler.io` surfaced.

---

## Order queue

- Polls `orders` table every **15 seconds** (`POLL_INTERVAL_MS`)
- Filters: `venue_id=eq.{_venueId}` + `status=in.(pending,ready)`
- Sorted: pending first, then ready
- Today count: separate query filtered by `created_at >= today midnight`
- **Mark Ready**: PATCH `orders` → `status: ready` + `updated_at`. Tile updated optimistically then refreshed.
- **Dismiss**: PATCH `orders` → `status: collected`. Tile fades out and removed.
- Poll dot (green pulsing) visible when poll is active

---

## Darwin feed

- Polls `rail_movement_log` every **15 seconds** (`DARWIN_INTERVAL_MS`)
- Shows last 3 rows ordered by `actual_timestamp desc`
- Station labels: FST / LIM / WHA / BFR / UPM / SHO / PFL / GRY
- Delay threshold: ≤1 min = ON TIME (green); >1 min = +Xm (amber)
- "Next train" tile in stats strip reflects most recent movement event

---

## Supabase tables touched

| Table | Operation | Notes |
|---|---|---|
| `merchant_users` | SELECT | New table — see migration SQL |
| `venue_partners` | SELECT | Auth fallback + venue details |
| `orders` | SELECT, PATCH | Queue fetch + Mark Ready + Dismiss |
| `rail_movement_log` | SELECT | Darwin feed |

---

## Supabase migration

`merchant_users_migration.sql` — run in Supabase SQL Editor.

Schema:
```sql
id          uuid PK
venue_id    uuid FK → venue_partners.id
email       text UNIQUE
role        text  -- 'staff' | 'manager' | 'owner'
created_at  timestamptz
updated_at  timestamptz
```

RLS policies:
- Authenticated users can read only their own row
- `@refueler.io` accounts can read/write all rows

---

## Design system compliance

| Element | Value |
|---|---|
| Carbon theme | `data-theme="carbon"` on `<html>` |
| Paper theme | `data-theme=""` (default on load) |
| Default | Paper (per editorial/web standard) |
| Headings | `'Satoshi', 'DM Sans', sans-serif` |
| Body | `'Source Serif 4', Georgia, serif` |
| UI chrome | `'DM Sans', system-ui, sans-serif` |
| Mono / telemetry | `'IBM Plex Mono', monospace` |
| Accent | `--accent-carbon: #C8A96E` |
| Mark Ready button | Gold fill, `#1A1200` text (Carbon: `#0D0D0B`) |
| Orange `#F5820A` | Not used |
| Border weight | `0.5px` throughout |
| Card radius | `10px` (order tiles); `8px` (map) |
| Button min-height | `48px` (accessible tap targets) |

---

## Deferred to later sessions

| Item | Session |
|---|---|
| Event / pop-up onboarding flow (no venue pre-assigned) | CC-05 or later |
| Numo APK integration (Track 1 terminal) | TBD |
| NFC collection confirmation tap | TBD |
| Watch UI | TBD |
| NUT-17 WebSocket push (replace polling) | After Minibits NUT-17 confirmed |
| Per-order item detail (quantity, seat/bay number) | Schema extension needed |
| Manager view: daily revenue summary | CC-04 franchise dashboard |
| Multi-venue staff (remove UNIQUE constraint on email) | Schema decision pending |
| Mapbox token: replace `PLACEHOLDER` in token string | Pre-deploy task |

---

## Pre-deploy checklist

- [ ] Replace Mapbox token placeholder in `merchant-tablet.html` with live public token
- [ ] Run `merchant_users_migration.sql` in Supabase SQL Editor
- [ ] Seed at least one `merchant_users` row per pilot venue
- [ ] Confirm `venue_partners` has `lat`, `lng`, `address`, `active` columns populated
- [ ] Confirm `orders` table has `venue_id`, `item_name`, `status`, `created_at`, `updated_at` columns
- [ ] Test magic link auth end-to-end on a physical tablet
- [ ] Confirm `rfTheme` localStorage persists across sessions on target device

---

*CC-02 complete — Session D continued in CC-03 (dev-console.html)*
