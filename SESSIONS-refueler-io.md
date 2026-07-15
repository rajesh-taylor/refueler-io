# SESSIONS — refueler-io
*Canonical session log for `rajesh-taylor/refueler-io`.*
*Each entry: session ID · date · what shipped · carry-forward.*

---

## Session allocation

Primary: 100 · Buffer: 25 · Total: 125
Planning sessions: uncounted by convention.
Buffer is untouchable until a block overruns.

---

## Block map

| Block | Scope | Status |
|---|---|---|
| Block 0 | Theme default fix, footer stamp, CC-25 banner removal, duplicate sessions query | ✅ Closed CC-65 (commit 2f5895d) |
| Block 1 | Schema hardening: RLS scoping, opsTogglePause write, PIN RLS verify | 🟡 Queued |
| Block 2 | Consumer app ↔ merchant tablet live connection | 🟡 Queued |
| Block 3 | Franchise dashboard completion | 🟡 Queued |
| Block 4 | Dev console hardening + investor telemetry | ✅ Closed CC-65 (this session) |
| Block 5 | Merchant onboarding flow | 🟡 Queued |
| Block 6 | Darwin Push Port upgrade | ⚪ Deferred |
| Block 7 | Passenger count join (CC-48) | ⚪ Deferred |
| Block 8+ | Editorial, iOS/Android beta prep, Darwin bridge deploy, Ticketing MVP | ⚪ Future |

---

## Session log

### CC-65 Block 0 (commit 2f5895d) — date: ~2026-07-08
**Scope:** Immediate housekeeping pass.
**Shipped:**
- `command-centre.html`: flipped default theme — `:root` is now Carbon, `[data-theme="paper"]` is the override. Footer version stamp updated.
- `dev-console.html`: removed stale CC-25 standing banner. Fixed duplicate `sessions` query in `loadTelemetry`.

**Carry-forward:** Block 1 (schema hardening) queued.

---

### CC-65 Block 4 (this session) — date: 2026-07-15
**Scope:** Dev console instrumentation hardening + investor-ready telemetry.

**Schema changes (migration: `add_settled_sats_and_investor_role`):**
- `orders`: added `settled_sats bigint` column — gross sats written at Lightning settlement.
- `merchant_users`: added `investor` to role CHECK constraint.

**Edge Function:**
- `blink-webhook` v8 deployed (`verify_jwt: false` confirmed). At settlement now writes `settled_sats` and `routing_fee_sats` to `orders` table via `order_id` FK. Also writes `settled_at`. Invoice cleared for privacy. Non-fatal if `orders` update fails — `merchant_orders` settlement already confirmed first.

**Schema observation (no action taken):**
- `franchise_group_id` already present on `venue_partners` — Block 1 migration item is done.
- `spatial_ref_sys` RLS disabled — PostGIS system table, low risk, flagged to owner.

**Files shipped:**
- `dev-console.html` — telemetry grid extended 2×3 → 3×3. Three new tiles: Lightning Volume (`settled_sats` sum), Routing Fees (`routing_fee_sats` sum), Orders/Hour SVG sparkline (last 12h, hourly buckets). First Order Per Venue table added below grid. Log Stream section now has Live Order Feed (venue, gross/fee/net sats, payment status, timestamp) above the `log_entries` stream.
- `investor-snapshot.html` — new file. Magic-link auth, `investor` role gate (verified against `merchant_users` on every session). KPIs: Lightning Volume, Paid Orders, Active Venues, Commuter Wallets. Orders/hour sparkline. Venue traction list (first paid order per venue). Context block. No raw data. No console access.
- `command-centre.html` — added `investor` → `investor-snapshot.html` to `ROLE_DESTINATIONS` and `ROLE_LABELS`.

**To provision an investor account:**
1. Investor signs in via magic link at `command-centre.html` (or any Supabase auth flow) to create their `auth.users` record.
2. Look up their UUID in Supabase Auth.
3. Insert into `merchant_users`: `{ user_id: <uuid>, email: <email>, role: 'investor' }`. No `venue_id` needed.
4. Next sign-in routes them to `investor-snapshot.html` automatically.

**Carry-forward:**
- Block 1 (RLS hardening, opsTogglePause write) — next priority.
- Block 2 (consumer app ↔ merchant tablet) — after Block 1.
- `order-status.tsx` nav patch (refueler-app project, coordinate MasterContext).
- `car_park_occupancy` strip from FEEDS array — bundle with next rail-signal-poll touch.

---

## Complete session plan — all remaining work

Session counts are estimates. Planning sessions uncounted.

### Block 1 — Schema hardening (3–5 sessions)
1. RLS policy: `merchant_orders` scoped to `venue_id` from `merchant_users` (merchant/branch roles).
2. RLS policy: franchise_hq reads only `orders` for venues in their `franchise_group_id`.
3. `opsTogglePause`: implement Supabase write — `venue_partners.active` toggle. Add `pause_reason` text column if needed.
4. Verify `staff_pin_hash` + `owner_pin_hash` RLS read policy on `merchant_users`.
5. Fix `franchise-dashboard.html` `loadOrders`: change from `orders` direct query to RLS-scoped query or view.

### Block 2 — Consumer app ↔ merchant tablet connection (5–8 sessions)
1. Confirm `create-order` Edge Function writes correctly to both `orders` and `merchant_orders`.
2. Verify `bolt11_payment_hash` is written to `merchant_orders` at order creation (needed for webhook matching).
3. E2E test: place consumer app order → row appears in `merchant_orders` → merchant tablet picks it up on 15s poll.
4. Verify webhook: settlement → `merchant_orders.payment_status = 'paid'`, `orders.settled_sats` populated.
5. Confirm `order-status.tsx` nav patch (coordinate with refueler-app MasterContext).

### Block 3 — Franchise dashboard completion (5–8 sessions)
1. Post-Block-1 RLS: wire `franchise-dashboard.html` `loadOrders` to scoped query.
2. Auth gate: replace `@refueler.io` domain check with `franchise_hq` role check from `merchant_users`.
3. Per-venue commission breakdown wired to real data.
4. Operator Controls: `toggleVenueActive` and `saveEmail` — verify RLS policies, implement writes.
5. KPI strip: pull from real `orders` data scoped to `franchise_group_id`.

### Block 5 — Merchant onboarding flow (8–12 sessions)
1. Design the onboarding path: magic link sign-in → role assignment → PIN set → first login confirmed.
2. `merchant_users` row creation: needs a provisioning mechanism (admin UI, Edge Function, or Supabase dashboard workflow).
3. PIN set screen — web page for owner PIN setup post-first-login.
4. Staff PIN distribution flow.
5. Venue association confirmation screen.

### Block 4 carry — Dev console (1–2 sessions)
1. `payment_processor` display in Orders table: flag any legacy `zebedee` rows with a warning pill.
2. Log Stream: add `session_id` column to `log_entries` display rows.

### Block 6 — Darwin Push Port upgrade (deferred — dedicated session)
- `refueler-darwin-bridge` repo ready (Railway.app deploy locked).
- Real STOMP integration replaces current mock timestamps in all three Command Centre files.
- Do not start until Blocks 1–4 closed.

### Block 7 — Passenger count join (deferred)
- CC-48: `rail_reference_loadings` cannot be joined to live Darwin feed.
- Deferred until a clean join key solution is identified.

### Block 8 — Ticketing MVP (CC-66)
- Apple Developer Program required for PassKit.
- Scope TBD in dedicated planning session.

### Block 9 — Gate plugin (CC-67)
- Scoped after CC-66.

### Ongoing / bundled
- `car_park_occupancy`: strip from FEEDS array — bundle with next `rail-signal-poll` Edge Function touch.
- `.well-known/assetlinks.json` SHA256 fingerprint: replace placeholder at first signed Android build.
- `refueler-darwin-bridge` licence decision: bundle with Darwin Push Port session.
- `CONTRIBUTING.md`: deferred — end of August, all three open-source repos simultaneously.
- CC-60 partnerships outreach (Aaron): held pending call.

---

*"Nothing stops this train."*
