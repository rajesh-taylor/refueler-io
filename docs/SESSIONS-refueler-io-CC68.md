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
| Block 1 | Schema hardening: RLS scoping, opsTogglePause write, PIN RLS verify | ✅ Closed CC-66 (commit d145e48) |
| Block 2 | Consumer app ↔ merchant tablet live connection | ✅ Closed CC-67 — all 8 steps pass (Step 7 polling fallback closed CC-68) |
| Block 3 | Franchise dashboard completion | 🟡 Queued |
| Block 4 | Dev console hardening + investor telemetry | ✅ Closed CC-65 |
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

---

### CC-65 Block 4 — date: 2026-07-15
**Scope:** Dev console instrumentation hardening + investor-ready telemetry.
**Shipped:** `blink-webhook` v8, `dev-console.html` 3×3 telemetry grid, `investor-snapshot.html`, `command-centre.html` investor routing.

---

### CC-66 Block 1 (commit d145e48) — date: 2026-07-16
**Scope:** Schema hardening — RLS policies, opsTogglePause write, franchise-dashboard auth gate.
**Shipped:** `block1_rls_hardening` migration, `merchant-tablet-logic.js` opsTogglePause, `franchise-dashboard.html` role gate fix.

---

### CC-67 Block 2 — date: 2026-07-19
**Scope:** Block 2 E2E test — consumer app ↔ webhook ↔ Supabase full flow.
**Shipped:** blink-webhook rewritten v10→v12. Blink callback endpoint registered. Full E2E confirmed 7/8 steps. Step 7 (nav to order-status) outstanding — timing race identified.

---

### CC-68 — date: 2026-07-20
**Scope:** Security: Blink API key rotation. Step 7 fix: PreOrderScreen polling fallback.

**Blink API key rotation:**
- Old key `refueler-beta` (`098b29ce-...`) revoked — had been exposed in terminal screenshots CC-67.
- New key `refueler-cc68` (`b98cf536-...`) created in Blink dashboard, scopes READ/RECEIVE/WRITE, never expires.
- New key set in Supabase Edge Function secrets via dashboard.
- `blink-webhook` v12 redeployed with correct source (previous local file was stale Svix version). Commit `44f2620` on `refueler-io`.
- `blink-webhook_index.ts` stale file remains in repo — still to be updated or removed.

**Step 7 fix — PreOrderScreen polling fallback:**
- Added `setInterval` poll (3s, 5 min window) alongside existing Realtime subscription in `PreOrderScreen.tsx`.
- `navigatedRef` guards against double-navigation if both Realtime and poll fire simultaneously.
- Commit `84e1c91` on `refueler-app`.
- Block 2 now fully closed — all 8 E2E steps covered.

**Carry-forward:**
- E2E retest needed: place order → pay → confirm nav to order-status (Step 7 now has polling backstop).
- `blink-webhook_index.ts` in `refueler-io` repo: still stale Svix version — delete or replace with v12 source next touch.
- GitHub Actions red X on commit `9b9655d` — non-fatal, fix when convenient.
- `car_park_occupancy` strip from FEEDS array — bundle with next rail-signal-poll touch.
- `bsc-dev` item (£0.01 Dev Test) in `PreOrderScreen.tsx` — remove before TestFlight.

---

## Complete session plan — remaining work

### Block 3 — Franchise dashboard completion (5–8 sessions)
1. Per-venue commission breakdown wired to real data.
2. Operator Controls: `toggleVenueActive` and `saveEmail` — verify RLS policies, implement writes.
3. KPI strip: pull from real `orders` data scoped to `franchise_group_id`.

### Block 5 — Merchant onboarding flow (8–12 sessions)
1. Magic link sign-in → role assignment → PIN set → first login confirmed.
2. `merchant_users` row creation provisioning mechanism.
3. PIN set screen — web page for owner PIN setup post-first-login.
4. Staff PIN distribution flow.
5. Venue association confirmation screen.

### Block 4 carry — Dev console (1–2 sessions)
1. `payment_processor` display: flag legacy `zebedee` rows with warning pill.
2. Log Stream: add `session_id` column to `log_entries` display rows.

### Block 6 — Darwin Push Port upgrade (deferred)
- Railway.app deploy locked. Real STOMP replaces mock timestamps.

### Block 7 — Passenger count join (deferred)
- CC-48: join key problem unresolved.

### Ongoing / bundled
- `car_park_occupancy`: strip from FEEDS array.
- `.well-known/assetlinks.json` SHA256: replace at first signed Android build.
- `CONTRIBUTING.md`: end of August, all three open-source repos.
- CC-60 partnerships outreach (Aaron): held pending call.
- `blink-webhook_index.ts` in repo: delete or replace with v12 source.
- `bsc-dev` Dev Test item: remove from `PreOrderScreen.tsx` before TestFlight.

---

*"Nothing stops this train."*
