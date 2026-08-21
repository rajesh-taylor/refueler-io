# Refueler Master Context — IO CC-104
*Updated: 2026-08-21 (CC-104 — Menu Management v1, G-2 cleared, Darwin fixed, toggle colours, nav fixes, finger-friendly sizing, station labels)*
*Supersedes: MasterContext_IO_CC103*

---

## Session allocation
500 primary + 50 buffer = 550 total. Planning/Opus sessions uncounted.
Sessions used to CC-104: ~100 counted + uncounted planning sessions.

---

## Project overview

Refueler is a Bitcoin-native privacy ecosystem. Products: Share (live at `refueler.io/share/`), Legend (post-B9), consumer pre-order app (Fenchurch St line), merchant terminal (tablet, counter/kitchen, landscape), Pass (own repo), Relay (Android, waiter/floor staff).

**Product names (locked CC-103):**
- Floor staff Android app: **Relay** (`io.refueler.merchant`) — "Relay by Refueler"
- Consumer app: **Refill** — React Native, Blink Lightning, commuter pre-orders

**Supabase project:** `tihgvdokeofnjxjkenmm`
**Webhook URL:** `https://tihgvdokeofnjxjkenmm.supabase.co/functions/v1/blink-webhook`

**GitHub repos:**
| Repo | Local path |
|---|---|
| `rajesh-taylor/refueler-io` | `/Users/rajeshtaylor/Documents/refueler.io/` |
| `rajesh-taylor/refueler-app` | `/Users/rajeshtaylor/Documents/refueler.io/refueler-app/` — dev branch local, push pending |
| `rajesh-taylor/numo-fork` (Relay) | `/Users/rajeshtaylor/Documents/refueler.io/terminals/numo-fork/` |
| `rajesh-taylor/refueler-share` | `/Users/rajeshtaylor/Documents/refueler-share/` |
| `rajesh-taylor/refueler-legend` | `/Users/rajeshtaylor/Documents/refueler-legend/` |
| `rajesh-taylor/refueler-mint` | `/Users/rajeshtaylor/Documents/refueler-mint/` |
| `rajesh-taylor/refueler-pass` | Own repo + Claude project |
| `refueler-ecash-lab` | **Local only — never push** |

---

## Sim-Close — DECLARED COMPLETE (2026-08-17)

All four stages complete. `INCIDENT-PROTOCOL.md` in `refueler-io/docs/`.

---

## Pre-merchant gate list

| # | Gate | Status | Notes |
|---|---|---|---|
| G-1 | Merchant settlement wiring | ✅ CC-97 | `create-order` v10 — LNURL-pay |
| G-2 | Menu Management v1 | ✅ CC-104 | `merchant_menu_items`, CSV import, chip panel, overlay |
| G-3 | iPad physical check | ✅ CC-103 | Website confirmed on iPad and iPad mini |
| G-4 | Hardening-A | ✅ CC-94 | |
| G-5 | orders→venue_partners FK | ✅ CC-94 | |

**All gates cleared. First real merchant pending commission rate planning and Revolut Business account.**

---

## Payment architecture — locked CC-97

Consumer → Merchant: LNURL-pay via `create-order` v10. Sats direct to merchant wallet.
Relay floor → Merchant: same rail, `origin:'floor'` on `merchant_orders`. Cash/card: record-only, `status:'confirmed'` immediately.
Refueler Blink float: Refueler operating sats only (reward payouts). Never in consumer→merchant path.
Fiat commission: Stripe → Revolut Business. Rate: planning session required before first merchant.

---

## Merchant terminal — file locations (locked TDP-A)

**HTML:** `src/merchant/index.html` · **JS:** `src/merchant/merchant-tablet-logic.js` · **CSS:** `src/merchant/merchant-tablet-styles.css`
**Orientation:** Landscape. Relay is portrait handheld.

---

## Terminal design — current state (post CC-104)

**Status colours (protected):** Pending `#C8A96E` · In Prep `#7899D4` · Ready `#3DCA7A`
**Owner toggles (fixed CC-104):** On = solid `#3DCA7A`, Off = solid `#C8943A`, white knob. Both themes.
**Nav pill:** QUEUE · OPS · OWNER. `pillQueue()`/`pillOps()` call `closeOwnerPanel()` first — fixed CC-104.
**Menu overlay:** has full nav bar with `← Back`, PAPER/CARBON pill. No dead-end states.

**Owner tab — S-32 redesign spec (Web-Touch-1):**
Two-column split below stats row. Left: Lightning address (ellipsis, gold lock → change flow) · On-chain address · Venue status toggle · Arrival strip toggle. Right: Shutdown terminal toggle · Reserved (stamps/Legend post-B9). Toggle spec: green on, amber off, both themes.

**Known snag S-33:** "Sign out to return to the Command Centre." second instance still in OPS view. Fix at Web-Touch-1 open.

---

## Darwin strip — architecture (locked CC-104 planning)

**Current data:** `rail_signal_current`, feed `departure_board_staff`, `feed_key=FST`. 10 outbound services from FST, platform numbers, destination CRS, actual/scheduled times. Polled every 2 min (`rail-signal-poll` v10). Column is `source_updated_at` (stale `fetched_at` ref fixed CC-104).

**Station labels:** Full Fenchurch St line CRS map in JS — FST, LIM, WHA, BFR, UPM, GRY, TIL, EBD, SOR, PFL, BAS, LES, SOC, SRY, CHF, OCK, LEI, CHO, SOB, PRI, ROC.

**Venue type / data need (locked CC-104):**
- End-of-line (FST, SRY, SOC): need **arrivals** feed — trains arriving carrying customers. No departures needed, they're the terminus.
- Mid-line (Leigh-on-Sea, Grays, Pitsea etc.): need **departures from FST** + calling point data to calculate ETA at their station.

**Darwin session plan (locked CC-104):**
- Darwin-A (Sonnet): arrivals feed for FST/SRY/SOC, strip redesign showing up to 4 arrival tiles (platform, origin, ETA).
- Darwin-B/C (2-3 Opus): mid-line ETA architecture — calling points, timetable mapping, per-station venue context. Darwin service detail endpoint has calling points.
- Darwin-D (Sonnet): mid-line strip build and test.
- Strip-Design (Opus): dedicated design session after Darwin-B/C. Straight-line tube-map aesthetic. St Pancras multi-platform scale in mind.

---

## Menu Management v1 — locked CC-104

**Table:** `merchant_menu_items` — id, venue_id (FK), name, description, price_gbp, category, available (bool default true), unavailable_since (set by trigger on available→false), position, created_at, updated_at. RLS: authenticated SELECT/INSERT/UPDATE/DELETE own venue.

**CSV import:** replace flow (truncate + batch INSERT). Max 100 rows. Columns: name, description, price_gbp, category. Numbers: File → Export To → CSV (not Save).

**UI:** MENU ▾ chip panel in queue header (collapsible). Ops card shows count + Manage button (full-width, 44px). Menu overlay: 40% left (CSV upload + item list, toggles immediate-save), 60% right (2×2 grid: Top items today, Last import, Currently unavailable with since-timestamp, Reserved placeholder). Last import metadata in localStorage keyed to venue_id.

**Deferred to Menu v2:** images per item, stock counts, supplier ordering, previous menu versions, table/seat layout.

---

## Edge Functions (deployed)

| Function | Version | verify_jwt |
|---|---|---|
| `blink-webhook` | v15 | `false` |
| `create-order` | v10 | `true` |
| `blink-balance` | v5 | `true` |
| `rail-signal-poll` | v10 | `true` |
| `verify-pin` | v2 | `false` |
| `update-lightning-address` | v1 | `true` |

---

## Supabase — schema state (post CC-104)

**merchant_menu_items:** live. Trigger `set_menu_item_updated_at()` manages `updated_at` and `unavailable_since`.
**merchant_orders:** `origin` column — `'preorder'` · `'floor'`.
**venue_partners:** authenticated UPDATE on `active`, `pause_reason` only.
**rail_signal_current:** authenticated + anon SELECT. Column: `source_updated_at`.
**merchant_users:** bcrypt PIN columns service_role-only.
**JWT session lifetime:** 43200s (12h).

---

## Design system — warm carbon (CC-103, 2-week trial)

**Paper:** `--bg: #E8E2D8` · `--fg: #1A1A1A` · `--surface: #DAD4CA`
**Carbon:** `--bg: #1A1917` · `--fg: #E8E2D8` · `--surface: #242424`
Gold `#C8A96E` · Fonts: Satoshi / DM Sans / IBM Plex Mono / Source Serif 4

---

## Relay (numo-fork) — build state

Latest commit `54b15de`. BUILD SUCCESSFUL. Installed on Pixel 9a.
Pending: S-numo-v31 (numo_navy refs), app display name ("Relay"), Icon-B.

---

## Test accounts

| Email | Role | Notes |
|---|---|---|
| `steakhouse@rajeshtaylor.com` | `independent_owner` | venue_id `c476df85` · staff PIN 1234 · owner PIN 8888 |
| `moniker@rajeshtaylor.com` | `franchise_hq` | Moniker |
| `dev@refueler.io` | `admin` | |

---

## Snag list — active

| ID | Item | Priority | Target |
|---|---|---|---|
| S-22 | Email fallback link block spacing | Low | Future |
| S-doc-1 | Process doc footer wraps in Chrome PDF | Low | Future |
| S-numo-v31 | numo_navy refs in values-v31/values-night-v31 | Low | Next Relay session |
| S-28 | Privacy page right-edge padding narrow/portrait | Medium | Web-Touch-1 |
| S-29 | Share nav wordmark/breadcrumb no separator | Low | Web-Touch-1 |
| S-32 | Owner tab full redesign | Medium | Web-Touch-1 |
| S-33 | "Sign out" second instance in OPS view | Low | Web-Touch-1 open |

---

## Ongoing action items (Rajesh)

- Open Revolut Business account (before first real merchant)
- Open Blink ops wallet "Refueler Ops" (second BTC wallet in Blink)
- Create Refueler Crypto Ops Ledger
- Push BRIDGE v4.9 to all repos
- Push `refueler-app` dev branch (CA-1 prerequisite)
- Disconnect `share.refueler.io` from Cloudflare Pages
- Upgrade Supabase to Pro at first real merchant
- Upgrade Cloudflare Workers to Paid ($5/month) before production volume
- Commission rate planning conversation before first real merchant

---

## Queued sessions

| # | Session | Type | Status |
|---|---|---|---|
| 1 | **Web-Touch-1** — S-33, S-28, S-29, S-32 | Sonnet | **Next** |
| 2 | **Darwin-A** — arrivals feed FST/SRY/SOC, 4-tile strip redesign | Sonnet | After Web-Touch-1 |
| 3 | **Darwin-B** — mid-line ETA architecture | Opus | After Darwin-A |
| 4 | **Darwin-C** — mid-line ETA architecture (cont.) | Opus | After Darwin-B |
| 5 | **Strip-Design** — Opus design, tube-map aesthetic | Opus | After Darwin-B/C |
| 6 | **Darwin-D** — mid-line strip build | Sonnet | After Strip-Design |
| 7 | **Icon-A** — Refill app icon | Opus | After Web-Touch-1 |
| 8 | **Icon-B** — Relay app icon | Opus | After Icon-A |
| — | CA-1 · Block 8 · Pass-A · Events intelligence · Staff Management v1 | Mixed | Queued |
| — | Commission planning · Privacy page · Share API · AD-2 | Mixed | Gap |
| — | Session A (CDK mint) · Status page · September User Guide | Mixed | Later |
