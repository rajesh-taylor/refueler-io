# SESSIONS — refueler-io
*Last updated: CC-90 · 2026-08-16 (Sonnet counted. S-18 CLOSED. verify-pin Edge Function v2 (bcryptjs). merchant_users_safe view. Column-level grants. Full sim passed: staff PIN, owner PIN, wrong-PIN ×5 lockout.)*

---

## Session allocation

Primary: 500 · Buffer: 50 · Total: 550
Planning/Opus sessions: uncounted. Buffer untouchable until a block overruns.
**Block review sessions** — standing uncounted Opus at end of each block.

Sessions used to CC-90: ~90 counted + uncounted planning sessions.

---

## Block map

| Block | Scope | Status |
|---|---|---|
| Block 0 | Theme default, footer stamp, CC-25 banner, sessions query fix | ✅ CC-65 |
| Block 1 | Schema hardening: RLS, opsTogglePause, PIN RLS | ✅ CC-66 |
| Block 2 | Consumer app ↔ merchant tablet live connection | ✅ CC-69 |
| Block 4 | Dev console hardening + investor telemetry | ✅ CC-65 |
| Block M | Share migration — `share.refueler.io` → `refueler.io/share/` | ✅ M-3 |
| Block 3 | Franchise dashboard | ✅ CC-81 |
| **Block 5** | Merchant onboarding + simulation discipline | ✅ Block-5 Close — capability complete, no go-live date set |
| **Block 8** | Fiat → sats rewards | 🟡 After Menu Management v1 |
| Pass-A/B | Pass planning sessions | 🟡 After Bitcoin Events × Pass × Merchant scoping |
| Block 9 | LNBits integration | ⚪ Deferred post Block 8 |
| Block 6 | Darwin Push Port upgrade | ⚪ Deferred — non-gating |
| Block 7 | Passenger count join | ⚪ Deferred — non-gating |
| Block 10+ | iOS/Android beta prep, Darwin bridge, Ticketing MVP | ⚪ Future |

---

## CSS rationalisation track — complete

CSS-1 through CSS-7b all closed.

---

## Session log

### CC-90 — date: 2026-08-16
**Scope:** S-18 Steps 2–6. Sonnet counted.
**Commits:** `af679f6` (JS cutover + verify-pin v1), `0903ad6` (verify-pin v2 bcryptjs + RLS fix)

**What landed:**

**Step 2 — Migration `cc90_merchant_users_safe_view`:**
- `merchant_users_safe` view: `id, user_id, venue_id, role, created_at` — all hash/bcrypt columns excluded. `SECURITY INVOKER`.
- `anon` + `authenticated` blanket SELECT on `merchant_users` revoked.
- `authenticated` granted SELECT on `merchant_users_safe`.

**Step 3/4 — `verify-pin` Edge Function v1 → v2:**
- v1 deployed with `deno.land/x/bcrypt@v0.4.1` — failed at runtime (subprocess spawning blocked in Supabase Edge Functions).
- v2 redeployed with `npm:bcryptjs@2.4.3` (pure JS, no subprocess) — resolved.
- JWT validation via `anonClient.auth.getUser(token)`. Rate limit: 5 attempts/5min per `user_id` (in-memory Map). Returns `{ valid: bool }` only. `verify_jwt: false`.

**Step 5 — `merchant-tablet-logic.js` cutover:**
- `sha256()` function deleted.
- `_staffPinHash`, `_ownerPinHash` state variables deleted.
- `resolveVenueAndPins` → fetches `merchant_users_safe` view, `select=venue_id,role` only.
- `verifyStaffPin` / `verifyOwnerPin` → async fetch to `${SB_URL}/functions/v1/verify-pin`.
- Client-side lockout: `_pinAttempts` + `_pinLocked` per type, `_startPinLockout()` with 30s countdown on error element. 429 → immediate lockout.
- Network error → "Connection error — try again" (no lockout).

**Complications resolved:**
- `merchant_users_safe` view returned 403 → missing RLS policy on underlying table. Fixed: migration `cc90b_merchant_users_safe_rls_policy` added `merchant_users_safe_select_own` policy (`user_id = auth.uid()`).
- venue_partners RLS subqueries broke after blanket REVOKE — subqueries reference `merchant_users` directly and `authenticated` lost access. Fixed: migration `cc90c_merchant_users_column_grants` — column-level SELECT grant on safe cols (`id, user_id, venue_id, role, created_at, franchise_group_id`). Hash columns confirmed NO SELECT via `information_schema.column_privileges`.
- Safari incognito blocked cross-origin fetch to Supabase (aggressive ITP). Chrome confirmed as correct sim browser.
- Edge Function downloaded as `verify-pin-index.ts` (section-prefix naming). Requires `mv` to `index.ts` before deploy. **Logged as standing note for all future Edge Functions.**

**Step 6 — Full sim (Chrome, Raj's Steakhouse):**
- Magic link → `steakhouse@rajeshtaylor.com` → PIN gate
- Staff PIN `1234` → bcrypt verify → queue loads, Raj's Steakhouse, 10 Trinity Square ✓
- OWNER pill → owner overlay → PIN `8888` → bcrypt verify → Owner panel, RAJ'S STEAKHOUSE badge ✓
- Wrong PIN ×5 → 30-second countdown lockout fires ✓
- OPS tab → venue status, pause orders, sign out ✓

**S-18 — CLOSED.**

**Hardening notes logged:**
- Rate limit Map is in-memory — resets on cold start. Replace with Redis/Supabase KV post-Sim-Close.
- PIN reset UI must route through a dedicated Edge Function (server-side bcrypt) when Owner tab PIN reset is built.
- Hardening-A (post-Sim-Close, Opus uncounted): full `anon` grant surface audit across all tables.

---

### CC-89 — date: 2026-08-16
**Scope:** S-18 Step 1. bcrypt columns migration. Sonnet counted.
**Migration:** `cc89_pin_bcrypt`
- `staff_pin_bcrypt TEXT` and `owner_pin_bcrypt TEXT` added to `merchant_users`
- Raj's Steakhouse seeded wf12. Old SHA-256 cols retained.

---

### CC-88 — date: 2026-08-16
**Scope:** S-23 + S-24 bundle. Sonnet counted. Commit `083f2a2`.
- Queue sign-out (S-23) ✅
- favicon/apple-touch-icon/PWA metas (S-24) ✅
- Manager role architecture logged for TDP-B.

---

### CC-87 — date: 2026-08-16
**Scope:** Schema migration — 4 cols on `venue_partners`. Sonnet counted.
**Migration:** `cc87_venue_partners_wallet_addresses`

---

### Block-5 Close — date: 2026-08-16
Opus uncounted. Block 5 verdict: capability complete, no go-live date.

---

### Design-A — date: 2026-08-15
Opus uncounted. Commit `f0157ef`. User Guide (6pp) + Venue Keys card (1pp).

---

### Onboarding-A — date: 2026-08-15
Opus uncounted. Merchant onboarding flow + handover copy v3.

---

### CC-85 — date: 2026-08-14
Sonnet counted. Commits `17ecb40`, `306a587`. Magic link email, first full sim run, OPS sign-out.

---

### CC-84 — date: 2026-08-13
Sonnet counted. Commit `d0defcc`. Portrait layout, walk-in overlay, New Order bar.

---

### CC-83b — date: 2026-08-12
Sonnet counted. Block 5 production code.

---

## Session queue — forward plan (post-CC-90)

| # | Session | Scope | Type | Status |
|---|---|---|---|---|
| 1 | **Internal onboarding process doc** | Stage 1 sim deliverable — staff doc for adding a venue partner | Sonnet counted | **Next** |
| 2 | **Payment sim — Stage 3** | Full Blink invoice → settlement → webhook → terminal | Sonnet counted | Unblocked — after internal doc |
| 3 | **TDP-A** | Terminal Design Philosophy — audit, comparators, primitives | Opus uncounted | After Stage 3 sim |
| 4 | **TDP-B** | Terminal redesign — menu, events, NumoPay | Opus uncounted | After TDP-A |
| 5 | **TDP-C** | NumoPay fork alignment | Opus uncounted | After TDP-B |
| — | **Menu Management v1** | CSV import, time-based menus | Sonnet counted | After TDP-B |
| — | **CA-1 — Consumer App Track** | Opus scoping — end-to-end commuter order flow, frictionless UX, app state audit from CC-69 | Opus uncounted | After TDP-C; parallel with or immediately after Menu Management v1. **Prerequisite: dev branch push.** |
| — | **NumoPay-A** | Fork review, API contract, BitChat research | Opus uncounted | After TDP-C |
| — | **Block 8** | Fiat → sats rewards | Sonnet counted | After Menu Management v1 |
| — | **Events intelligence layer** | Football fixtures, Darwin toggle, horizon strips | Sonnet counted | Can run in gap — no hard dependency |
| — | **Privacy page update** | Sections 7, 8, 10 + merchant + Legend free-tier | Sonnet counted | Any gap — no dependencies |
| — | **Sim-Close** | Formal sign-off all 4 stages | Opus uncounted (≤2) | After Stage 3 sim + internal doc |
| — | **Hardening-A** | Supabase-wide RLS + anon grant surface audit | Opus uncounted | After Sim-Close |
| — | **Share API planning** | Pay-per-use API, photographer/legal v1, v1/v2/v3 staging | Opus uncounted | Before AD-2 |
| — | **AD-2** | Share admin dashboard | Sonnet counted | After Share API planning |
| — | **Owner tab doc tiles** | Amber/green download indicators | Sonnet counted | Post Sim-Close |
| — | **Changelog panel** | Reverse-chronological change list in Owner tab | Sonnet counted | Post Sim-Close |
| — | **Design-A2** | Terminal screenshots in User Guide — incl. home screen icon screenshot | Opus uncounted | After TDP-B (~3–4 weeks) |
| — | **Bitcoin Events × Pass × Merchant** | Scoping — GDPR, credential design, Madeira | Opus uncounted, extended thinking | Before Pass-A |
| — | **Pass-A** | Full Pass scope + Pass Wallet card | Opus uncounted | After Block 8 + Events session |
| — | **Session A (CDK mint)** | CDK mint architecture | Opus uncounted | After Block 8 |

---

## CC-90 — CLOSED

Session closed 2026-08-16. S-18 fully closed. Commits `af679f6`, `0903ad6`.
Next session: **Internal onboarding process doc** — Stage 1 sim deliverable. Sonnet counted.

---

## CC-89 — CLOSED

Migration applied and verified. bcrypt columns live.
Next session: CC-90 — S-18 Steps 2–6 → DONE.
