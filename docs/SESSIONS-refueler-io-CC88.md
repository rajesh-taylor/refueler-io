# SESSIONS — refueler-io
*Canonical session log for `rajesh-taylor/refueler-io`.*
*Last updated: CC-88 · 2026-08-16 (Sonnet counted. S-23 queue sign-out shipped. S-24 favicon/apple-touch-icon/PWA metas shipped. Manager role architecture logged for TDP-B.)*

---

## Session allocation

Primary: 500 · Buffer: 50 · Total: 550
Planning/Opus sessions: uncounted. Buffer untouchable until a block overruns.
**Block review sessions** — standing uncounted Opus at end of each block. Recalibrate priorities and allocation.

Sessions used to CC-88: ~88 counted + uncounted planning sessions.

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

| Session | Scope | Status |
|---|---|---|
| CSS-1 through CSS-3 | Design reference, audit, blueprint | ✅ Closed — uncounted |
| CSS-4 | Implement new global.css | ✅ commit 2cbc496 |
| CSS-5 | Full site verification + Legend layout removal | ✅ commits 9f44d3b, 7fb04de, 83c9fa9, 7ed7ac3 |
| CSS-6 | Page CSS rationalisation | ✅ Closed |
| CSS-7 | Share design — upload complete, download page, progress states | ✅ Closed |
| CSS-7b | Share fixes + nav reorder | ✅ Closed |

---

## Session log

### CC-88 — date: 2026-08-16
**Scope:** S-23 + S-24 bundle. Queue sign-out button. Favicon/apple-touch-icon/PWA metas. Manager role architecture discussion. Sonnet counted.
**Commit:** `083f2a2`

**S-23 — Queue sign-out (closed):**
`btn-owner-signout` button added to queue header right cluster, alongside REFRESH. Calls `signOut()`. Visible to all authenticated staff (queue header is already shown/hidden by `showSignedInState()` / `showSignedOutState()`). No JS changes needed — inherits existing gating.

**S-24 — Icons and PWA metas (closed):**
- `src/assets/images/favicon.svg` — Carbon `#1A1A1A` rounded background, gold `#C8A96E` R
- `src/assets/images/apple-touch-icon.png` — 180×180px rasterised
- `src/assets/images/favicon-32.png` — 32×32px rasterised
- `src/assets/manifest.json` — PWA manifest (standalone, Carbon theme)
- `src/_includes/head.njk` — global icon links + `theme-color` meta
- `src/merchant/index.html` — manifest link, `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style: black-translucent`, `apple-mobile-web-app-title: Refueler`, `theme-color`

**Manager role architecture — logged for TDP-B:**
OPS panel maps naturally to a Manager/duty-manager role. Most owners stop working behind the till within 6 months. Current two owner sign-out paths (OPS + Owner tab) will collapse cleanly when Staff Management v1 introduces a Manager tier: Manager exits via OPS, Owner exits via Owner tab, Staff exit via queue header. Option A confirmed for now — OPS stays owner-PIN-gated.

**Design-A2 note logged:** User Guide "bookmark this page" instruction should include a screenshot of the home screen icon so staff can confirm the bookmark was created correctly.

---

### CC-87 — date: 2026-08-16
**Scope:** Schema migration — 4 cols on `venue_partners`. Session lifetime check. CA-1 placeholder. Sonnet counted.

**Migration applied:** `cc87_venue_partners_wallet_addresses`
- `venue_partners.lightning_address TEXT` (nullable)
- `venue_partners.onchain_address TEXT` (nullable)
- `venue_partners.silent_payment_address TEXT` (nullable)
- `venue_partners.mapbox_place_id TEXT` (nullable)

All four columns verified present via `information_schema.columns`.

**Session lifetime:** JWT expiry not SQL-queryable (GoTrue config). `auth.sessions.not_after` is NULL on all existing sessions — magic link sessions on free plan don't populate it without custom config. Supabase platform default: access token 3600s (1h), refresh token 7 days. Action logged for Rajesh: confirm/adjust in dashboard before Stage 3 sim. Merchant terminal sessions may benefit from 8h access token.

**CA-1 added:** Consumer App Track — Opus scoping session. Opens after TDP-C, parallel with or immediately after Menu Management v1. Prerequisite: dev branch push (open Rajesh action item).

**Stage 3 unblocked:** Schema migration landing means `lightning_address` column now exists. Stage 3 payment sim can proceed after S-18.

---

### Block-5 Close — date: 2026-08-16
**Scope:** Block 5 formal review and recalibration. Opus uncounted.

**Block 5 verdict:** Capability complete. No go-live date. First real merchant when the product is genuinely ready.

**Sim-Close stages ratified:**
- Stage 1: Internal onboarding process doc (to produce — third internal doc, staff use only)
- Stage 2: Operational sim — PASSED (browser, CC-85). iPad check non-blocking.
- Stage 3: Payment sim — FAILED/not yet run. Standalone Sonnet session after schema migration.
- Stage 4: Physical handover — non-blocking. Print when stable.

**Permanently closed:**
- S-12 `car_park_occupancy` — strip from FEEDS array on next `rail-signal-poll` touch. Never re-add.
- S-14 Costa label — fix on next `rail-signal-poll` touch. Off snag list permanently.

**Key decisions:**
- Go-live pressure removed permanently.
- S-18 scoped as architecture move: PIN verification server-side (Edge Function), not just a hash swap.
- S-23 + S-24 bundled into one Sonnet session.
- Schema migration promoted to next session (CC-87 — done).
- TDP track moves after Stage 3 sim.
- Share API planning session added (pre-AD-2).
- Safari upload ceiling (~1.5 GB) logged as constraint.
- BRIDGE bumped to v4.2.

---

### Design-A — date: 2026-08-15
**Scope:** Block 5 continued. Merchant handover documents. Opus uncounted.
**Commit:** `f0157ef`

**Outputs:**
- `docs/merchant-onboarding-v1.html` — User Guide, 6 A4 pages
- `docs/merchant-venue-keys-v1.html` — Venue Keys card, 1 A4 page

---

### Onboarding-A — date: 2026-08-15
**Scope:** Block 5 continued. Merchant onboarding flow + handover copy v3. Opus uncounted.

---

### CC-85 — date: 2026-08-14
**Scope:** Block 5. Branded magic link email. First full sim run. OPS sign-out button. Sonnet counted.
**Commits:** `17ecb40`, `306a587`
**Snags closed:** S-9, S-19, S-20, S-21. **Added:** S-22 (low), S-23 (High).

---

### CC-84 — date: 2026-08-13
**Scope:** Block 5. Portrait layout (S-16), walk-in overlay, New Order bar. Sonnet counted.
**Commit:** `d0defcc`

---

### CC-83b — date: 2026-08-12
**Scope:** Block 5 production code. Sonnet counted.

---

### CC-83 — date: 2026-08-12
**Scope:** Block 5 design session. Design-only, no code.

---

## Session queue — forward plan (post-CC-87)

| # | Session | Scope | Type | Status |
|---|---|---|---|---|
| ~~1~~ | ~~S-23 + S-24 bundle~~ | ~~Queue sign-out button + apple-touch-icon + favicon~~ | ~~Sonnet counted~~ | ✅ **CC-88 — done** |
| 1 | **S-18 — PIN auth server-side** | Move PIN verification to Edge Function, bcrypt/argon2, rate-limit | Sonnet counted | **Next** |
| 2 | **Internal onboarding process doc** | Stage 1 sim deliverable — staff doc for adding a venue partner | Sonnet counted | Queued |
| 4 | **Payment sim — Stage 3** | Full Blink invoice → settlement → webhook → terminal | Sonnet counted | Unblocked (schema landed) — after S-18 |
| 5 | **TDP-A** | Terminal Design Philosophy — audit, comparators, primitives | Opus uncounted | After Stage 3 sim |
| 6 | **TDP-B** | Terminal redesign — menu, events, NumoPay | Opus uncounted | After TDP-A |
| 7 | **TDP-C** | NumoPay fork alignment | Opus uncounted | After TDP-B |
| — | **Menu Management v1** | CSV import, time-based menus | Sonnet counted | After TDP-B |
| — | **CA-1 — Consumer App Track** | Opus scoping — end-to-end commuter order flow, frictionless UX, app state audit from CC-69 | Opus uncounted | After TDP-C; parallel with or immediately after Menu Management v1. **Prerequisite: dev branch push.** |
| — | **NumoPay-A** | Fork review, API contract, BitChat research | Opus uncounted | After TDP-C |
| — | **Block 8** | Fiat → sats rewards | Sonnet counted | After Menu Management v1 |
| — | **Events intelligence layer** | Football fixtures, Darwin toggle, horizon strips | Sonnet counted | Can run in gap — no hard dependency |
| — | **Privacy page update** | Sections 7, 8, 10 + merchant + Legend free-tier | Sonnet counted | Any gap — no dependencies |
| — | **Sim-Close** | Formal sign-off all 4 stages | Opus uncounted (≤2) | After Stage 3 sim + internal doc |
| — | **Share API planning** | Pay-per-use API, photographer/legal v1, v1/v2/v3 staging | Opus uncounted | Before AD-2 |
| — | **AD-2** | Share admin dashboard | Sonnet counted | After Share API planning |
| — | **Owner tab doc tiles** | Amber/green download indicators | Sonnet counted | Post Sim-Close |
| — | **Changelog panel** | Reverse-chronological change list in Owner tab | Sonnet counted | Post Sim-Close |
| — | **Design-A2** | Terminal screenshots in User Guide — incl. home screen icon screenshot for "bookmark this page" instruction (logged CC-88) | Opus uncounted | After TDP-B (~3–4 weeks) |
| — | **Bitcoin Events × Pass × Merchant** | Scoping — GDPR, credential design, Madeira | Opus uncounted, extended thinking | Before Pass-A |
| — | **Pass-A** | Full Pass scope + Pass Wallet card | Opus uncounted | After Block 8 + Events session |
| — | **Session A (CDK mint)** | CDK mint architecture | Opus uncounted | After Block 8 |

---

## CC-88 — CLOSED

Session closed 2026-08-16. S-23 and S-24 shipped. Manager role architecture logged for TDP-B. Commit `083f2a2`.
Next session: **S-18 — PIN auth server-side** — Move PIN verification to Edge Function, bcrypt/argon2, rate-limit. Sonnet counted.

---

## CC-87 — CLOSED

Session closed 2026-08-16. Migration applied and verified. Session lifetime logged.
Next session: ~~S-23 + S-24 bundle~~ → shipped CC-88.
