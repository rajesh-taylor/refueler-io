# SESSIONS — refueler-io
*Canonical session log for `rajesh-taylor/refueler-io`.*
*Last updated: CC-84 · 2026-08-13 (Sonnet counted. Portrait layout S-16, walk-in order overlay, New Order bar, S-15 sub-labels, S-17 breakpoint architecture. Migration cc84_walkin_schema. Commit d0defcc.)*

---

## Session allocation

Primary: 500 · Buffer: 50 · Total: 550
Planning/Opus sessions: uncounted. Buffer untouchable until a block overruns.
**Block review sessions** — standing uncounted Opus at end of each block. Recalibrate priorities and allocation.

Sessions used to CC-84: ~85 counted + uncounted planning sessions.

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
| **Block 5** | Merchant onboarding + simulation discipline | 🔵 In progress — CC-85 next |
| **Block 8** | Fiat → sats rewards | 🟡 Promoted — next after Block 5 |
| Pass-A/B | Pass planning sessions | 🟡 After Events × Pass × Merchant scoping session |
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

### CC-84 — date: 2026-08-13
**Scope:** Block 5 continued. Portrait layout (S-16), walk-in order overlay, New Order bar, S-15 sub-label audit, S-17 breakpoint architecture. Sonnet counted.

**Commit:** `d0defcc` — 3 files changed, 534 insertions(+), 11 deletions(-)

**Migration applied — `cc84_walkin_schema`:**
- `merchant_orders.order_id` → nullable (walk-ins have no parent orders row)
- `merchant_orders.identifier TEXT` — table number, counter name, free text
- `merchant_orders.item_name TEXT` — free-text item from staff
- `merchant_orders.order_source TEXT DEFAULT 'lightning'` — `'lightning'` | `'walkin'`
- INSERT policy `merchant_orders_insert_own_venue` — independent_owner/merchant/franchise_branch may insert walk-in rows for own venue_id
- Steakhouse coordinates: `coords_lat = 51.5104`, `coords_lng = -0.0784`

**PIN hash status confirmed:** SHA-256 (64-char hex, browser-native). Not plaintext, but not bcrypt/argon2. Logged as S-18. Dedicated session before first real merchant goes live.

**Portrait layout A/B/C design exploration:**
Three options visualised as artifacts. Option A selected (Refueler, Darwin-first, horizontal-scroll sidebar strip). Option B (Square/Toast thinking) reference only. Option C (no Darwin, non-rail venues) defines the degraded state — Darwin toggle in Owner screen queued.

**Design decisions locked CC-84:**
- "DARWIN · LIVE" label removed from horizon strip (CC-84 lock) — `display: none` by default; retained in HTML for DARWIN · OFFLINE JS state
- Active site card address line hidden in portrait — staff know where they are
- New Order bar: gold-outlined CTA between sidebar strip and queue header; hidden until signed in; hidden in OPS view
- Walk-in overlay: ← Back button (not Cancel), backdrop tap closes, validation on identifier + item required, inserts `merchant_orders` with `order_source: 'walkin'`

**S-15 sub-labels closed:**
- `queue-stat-label`: 8px → 9px
- `queue-stat-sub`: 9px → 10px
- `owner-stat-label`: 8px → 9px
- `owner-stat-sub`: 9px → 10px

**S-16 portrait layout:** CSS-only, `@media (orientation: portrait), (max-width: 820px)`. Sidebar → horizontal-scroll card strip. Single-column queue. Map hidden. Address line hidden.

**S-17 breakpoint architecture:** Documented in CSS comment block. Three targets: landscape tablet (default), portrait tablet (CC-84), NumoPay phone (NumoPay-A, not built here).

**Football-data.org confirmed:** Free tier subscribed (PL + Championship + others). Events intelligence layer and Darwin toggle queued as dedicated planning session after Onboarding-A.

**Pass × Events × Merchant arc logged:** Post-event offer integration concept. Must inform Pass credential scoping. Dedicated Opus session with extended thinking required before Pass-A.

**Mapbox coordinate email drafted:** Systematic 10–20m POI offsets in dense City of London lanes. Saved to Rajesh's drafts. To be sent to Mapbox support and posted to community forum.

**Files delivered:**
- `src/merchant/merchant-tablet-styles.css` (2076 lines)
- `src/merchant/merchant-tablet-logic.js` (1114 lines)
- `src/merchant/index.html` (533 lines)

**Snags closed:** S-15 (sub-labels), S-16 (portrait layout), S-17 (breakpoint architecture)
**Snag added:** S-18 (PIN hash upgrade — SHA-256 → bcrypt/argon2, dedicated session)

---

### CC-83b — date: 2026-08-12
**Scope:** Block 5 production code. Sonnet counted. Commit: [hash after placement].

*(Full notes in MasterContext_IO_CC83b.md)*

---

### CC-83 — date: 2026-08-12
**Scope:** Block 5 design session. Design-only, no code. Merchant terminal nav, horizon strip, order tiles, portrait layout, product architecture locked.

*(Full notes in MasterContext_IO_CC83b.md)*

---

## Session queue — forward plan

| Session | Scope | Type | Status |
|---|---|---|---|
| ~~CC-83~~ | Terminal design — nav, horizon, tiles | Sonnet counted | ✅ Closed |
| ~~CC-83b~~ | Block 5 production code, migrations | Sonnet counted | ✅ Closed |
| ~~CC-84~~ | Portrait layout, walk-in overlay, New Order bar | Sonnet counted | ✅ Closed |
| **CC-85** | Branded magic link email, first full sim run | Sonnet counted | **Next** |
| **Onboarding-A** | Merchant onboarding flow + printed handover doc | Opus uncounted | Queued |
| **Block-5 Close** | Block 5 review and recalibration | Opus uncounted | Queued |
| **Sim-Close** | Formal sign-off all 4 sim stages | Opus uncounted (up to 2) | Queued |
| **PIN upgrade** | SHA-256 → bcrypt/argon2, migrate existing hashes | Sonnet counted | Before first live merchant |
| **Bitcoin Events × Pass × Merchant** | Scoping — GDPR, privacy pitch, credential design, Madeira angle. No code. | Opus uncounted, extended thinking on | **Before Pass-A** |
| **Pass-A** | Full Pass scope + Pass Wallet card | Opus uncounted | After Block 8 + Events session |
| **NumoPay-A** | Fork review, API contract, BitChat research | Opus uncounted | After Block 5 sim-close |
| **Block 8** | Fiat → sats rewards | Sonnet counted | After Block 5 |
| **Events intelligence layer** | Football fixtures card, Darwin toggle, owner-selectable horizon strips | Sonnet counted | After Onboarding-A |
| **Session A (CDK mint)** | CDK mint architecture | Opus uncounted | After Block 8 |
| **AD-2** | Share admin dashboard | Sonnet counted | Queued |

---

## CC-85 opening prompt

CC-85 open. Block 5 continued — production code session. Sonnet counted.

Read these files in full before doing anything else:
- `docs/MasterContext_IO_CC84.md` (live: https://raw.githubusercontent.com/rajesh-taylor/refueler-io/main/docs/MasterContext_IO_CC84.md)
- `docs/SESSIONS-refueler-io-CC84.md` (live: https://raw.githubusercontent.com/rajesh-taylor/refueler-io/main/docs/SESSIONS-refueler-io-CC84.md)

Then read live merchant terminal files before touching anything:
- https://raw.githubusercontent.com/rajesh-taylor/refueler-io/main/src/merchant/index.html
- https://raw.githubusercontent.com/rajesh-taylor/refueler-io/main/src/merchant/merchant-tablet-logic.js
- https://raw.githubusercontent.com/rajesh-taylor/refueler-io/main/src/merchant/merchant-tablet-styles.css

Session scope in priority order:
1. Branded magic link email — replace bare Supabase template with Refueler-branded HTML. Carbon background, Refueler wordmark, gold accent, DM Sans. Sent via Resend. Test delivery to steakhouse@rajeshtaylor.com before closing.
2. First full simulation run — sign in as steakhouse@rajeshtaylor.com on the merchant tablet, place a walk-in order via the New Order overlay, verify it appears in the queue, mark it ready, dismiss it. Confirm portrait layout renders correctly on the test device. Log any new snag items.
3. Confirm `merchant_users` PIN columns are SHA-256 (already confirmed CC-84) — note S-18 in sim run notes, do not fix this session.

Standing rules:
- Read live file state from GitHub before any edits
- DDL via apply_migration only — execute_sql read-only
- One terminal command at a time — wait for output
- Files manually placed by Rajesh — git commands only after placement
- Present full plan before writing any code — wait for confirmation
- No unrequested documentation

Test account: steakhouse@rajeshtaylor.com — independent_owner — Raj's Steakhouse — venue_id c476df85 — staff PIN 1234 — owner PIN 8888.

MasterContext + SESSIONS + BRIDGE updated at session close. Increment MasterContext to CC-85.
