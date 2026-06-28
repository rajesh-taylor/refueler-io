# CC-32 — Horizon Strip Audit
*Demand-intelligence Session A · Audit only, no code changes · 20 June 2026*

Scope confirmed: audit-only, no PKCE/RN files touched, no wiring of new data sources — that's Session B.

---

## 1. Current Darwin polling mechanism — as built

**Source of truth is NOT a direct Huxley2 call from the browser.** The client never touches `huxley2.unop.uk` directly. It polls a Supabase table:

```
GET {SB_URL}/rest/v1/rail_movement_log
    ?select=crs,event_type,actual_timestamp,planned_timestamp,delay_minutes
    &order=actual_timestamp.desc
    &limit=6
```

So there's already a clean separation: something upstream (an edge function or scheduled job — not present in these two files) is responsible for hitting Huxley2/Darwin and writing rows into `rail_movement_log`. The merchant tablet only ever reads Supabase via PostgREST, same pattern as `merchant_orders`. This matters a lot for Session B — see §3.

**One discrepancy worth flagging:** master context (CC-24/CC-31) describes "30-second polling." The actual constant in code is:

```js
const POLL_INTERVAL_MS   = 15000;  // order queue poll
const DARWIN_INTERVAL_MS = 15000;  // Darwin poll
```

Both are 15 seconds, not 30. Not a bug — just means the documented interval is stale. Worth a one-line correction in the next master context pass; no action needed this session.

**Interval lifecycle:**
- `_orderPollTimer` and `_darwinTimer` are both set up in `onStaffAuthenticated()` — Darwin polling only starts once staff PIN is entered, not at page load.
- `startOrderPoll()` has a counterpart `stopOrderPoll()` that's called on sign-out / queue teardown, with `clearInterval`.
- **Darwin has no counterpart.** There is no `stopDarwinPoll()` anywhere in the file, and `_darwinTimer` is never cleared. If a staff member signs out and a different staff member signs back in without a full page reload, the `if (!_darwinTimer)` guard at line 174 will correctly prevent a duplicate timer — so this isn't a leak in practice — but it does mean Darwin polling silently keeps running in the background even while signed out, which a second data source would inherit. Flagging for Session B; doesn't need fixing in this audit.

**Fetch/render cycle** (`pollDarwin()` → `renderDarwinRows()` → `updateHorizonBand()`):
1. `pollDarwin()` fetches the latest 6 rows from `rail_movement_log`, takes the most recent 3 (`rows.slice(0, 3)`), calls `renderDarwinRows(rows)`.
2. `renderDarwinRows()` writes those 3 rows into the **sidebar Darwin card** (`#darwin-rows`), updates the next-train summary tile (`#qs-next-train` / `#qs-next-station`), caches the rows in `_darwinRowsCache`, then calls `updateHorizonBand()`.
3. `updateHorizonBand()` reads `_darwinRowsCache` (no second network call) and updates the **Horizon Band** strip: primary/secondary station name+ETA, the offline-dim state, and which of the three passenger windows (0–3 / 3–7 / 7–15 min) gets the gold active highlight.

So there are two visual surfaces fed by one poll: the sidebar Darwin card (always visible, all 3 of the latest movements) and the Horizon Band strip (top of page, primary + secondary arrival only). They're kept in sync deliberately — `updateHorizonBand()`'s docstring even says "no second Darwin poll."

**Passenger counts are mocked, not real.** `updateHorizonBand()` hardcodes `{ w0: 12, w3: 34, w7: 67 }` on every call — this is explicitly flagged in the existing code comments as "mock values until real aggregation is wired in a future session." This is exactly the gap demand-intelligence Session B is meant to fill — the Horizon Strip already has the UI and the highlight logic built, it's just waiting on a real number.

---

## 2. Where the Horizon Band physically lives

`horizon-band` is a fixed top-of-page strip — defined in the HTML as a sibling positioned before `.app`, not inside the sidebar or queue area. Two halves:

- **Left (`hb-darwin`)** — Darwin section. Station name + ETA, primary always visible, secondary visible in landscape only (per the inline CSS comment). Has its own offline-dim state class (`hb-darwin-offline`) independent of the sidebar card's offline state.
- **Right (`hb-horizon`)** — three passenger-count windows (0–3, 3–7, 7–15 min), each a `div.hb-window` with count/label/unit, separated by `hb-window-sep` dividers, with `.hb-active` toggled by JS to gold-highlight whichever window is "now."

This is a distinct, deliberately separate surface from the sidebar's "Card 1: Darwin" — which shows the raw last-3-movements list and connection status dot. The Horizon Band is the glanceable summary; the sidebar card is the detail view. Both are driven by the same single poll.

---

## 3. Where National Rail Data Marketplace + TfL slot in

Five things to wire eventually: c2c Passenger Loadings, c2c Live Station Car Park Occupancy, Knowledgebase Incidents, Knowledgebase Stations, Live Departure Board Staff Version, plus TfL Unified API. Findings on placement:

**a) Existing pattern is already the right shape for this.** Because Darwin data is staged through a Supabase table (`rail_movement_log`) rather than fetched live in-browser, the precedent for "new external API → background job writes to a Supabase table → client reads via PostgREST on its existing poll" is already established. The cleanest path is almost certainly: each new source gets its own staging table (or a few share one if shapes overlap), populated by a separate scheduled job/edge function, and the merchant tablet just adds a second `fetch()` inside (or alongside) the existing Darwin poll cycle.

**b) Piggyback vs. own interval — leans piggyback, with one caveat.** `pollDarwin()` already runs every 15s and the staging-table pattern means the *client-side* read is cheap (it's just a PostgREST query, not a live external API call) — so there's no rate-limit reason for the client to poll a second staging table on a separate interval. The real constraint is on the *write* side: car park occupancy and incidents data don't need 15-second freshness the way live train movements do (passenger loadings, in particular, is presumably a much slower-changing figure). That's a backend scheduling decision, not a frontend one — the frontend can keep reading on the same 15s cycle even if the table underneath it is only refreshed every few minutes; PostgREST will just return the same row until it changes.

**c) A caching layer is not needed client-side**, given (a) and (b) — the "cache" already exists in the form of the Supabase staging table itself, refreshed at whatever cadence each upstream source's job dictates. What *would* need a small addition is something like `_demandRowsCache` (mirroring `_darwinRowsCache`) per new source, so `updateHorizonBand()` (or whatever replaces it) doesn't need to re-fetch on every render — same pattern as today.

**d) Five sources is a real complexity jump for one function.** Today, one `pollDarwin()` → one `renderDarwinRows()` → one `updateHorizonBand()` chain. Adding five more sources into that same chain risks turning `updateHorizonBand()` into an unmaintainable god-function. Worth considering in Session B: one poll function per source (or per logical group — e.g. "rail movements" vs. "venue-relevant demand signals"), each writing to its own cache variable, with a single lightweight `updateHorizonBand()` that just reads from whichever caches are populated and renders. Keeps each source's failure mode isolated — if TfL's feed goes down, Darwin's offline-dimming logic shouldn't be affected, and vice versa.

---

## 4. UI placement — design decision, not just technical

Two real options, both technically buildable on the current architecture:

**Option A — extend the existing Horizon Band.** Add the new sources as additional context within the same top strip — e.g. a small icon/badge system per window (car park near-full warning, incident alert) rather than new full windows. Pro: keeps the "one glance, top of screen" promise intact; the merchant never has to look elsewhere. Con: the strip is already doing two jobs (Darwin arrival + passenger windows) — a third and fourth signal type risks visual crowding, especially in portrait where only the primary station shows (secondary is landscape-only already, per the CSS comment at line 252–253 of the HTML).

**Option B — separate tile/card.** A new sidebar card (alongside "Card 1: Darwin," "Card 2: Active Site") for the demand-intelligence sources, or a dedicated panel reachable from Owner View. Pro: room to actually show car park occupancy %, incident text, TfL status without cramming it into a 3-window strip. Con: breaks the "always-on, no-tap-required" glanceability that's the entire point of the Horizon Band per the existing code comments ("Always-on operational instrument").

**Recommendation for Session B framing, not a decision made here:** given the brand ethos ("suave, discreet, refined" — not a dashboard wall of tiles) and the fact the Horizon Band's whole reason for existing is glanceable urgency (is a train arriving *now*), the strongest case is Option A for anything time-critical (incidents, car park near-full) and a sidebar card (Option B) for anything that's reference-grade rather than urgent (station info, scheduled loadings). That split — urgent-and-glanceable vs. reference-and-on-demand — maps reasonably well onto the five sources, but this should be confirmed as a deliberate design call in Session B rather than inherited silently from this audit.

---

## 5. Summary for Session B

- Staging-table pattern (Supabase table per source, written by a backend job, read by the existing 15s client poll) is the path of least resistance and matches what's already built for Darwin.
- No caching layer needed beyond per-source cache variables mirroring `_darwinRowsCache`.
- Recommend splitting poll/render functions per source rather than overloading `updateHorizonBand()`, so a single source's outage doesn't cascade.
- UI placement is a real open design decision (urgent-and-glanceable → Horizon Band; reference-grade → sidebar card) — flag for design pass before Session B starts wiring.
- Minor housekeeping, not urgent: master context's "30-second polling" claim should be corrected to 15 seconds next full doc revision; Darwin timer has no teardown function (`stopDarwinPoll()` doesn't exist) — harmless today due to the `if (!_darwinTimer)` guard, but worth a note if Session B adds more timers following the same pattern.

---

*No code touched this session. PKCE/RN track untouched. Next: Session B wires the first real source per whichever placement decision comes out of design.*
