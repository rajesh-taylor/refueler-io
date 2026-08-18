# SESSIONS — refueler-io
*Last updated: CC-97 · 2026-08-18 (TDP-B — Sonnet counted. Terminal redesign execution. All 10 gate items delivered. S-27 deployed. create-order v10 (LNURL-pay). Three commit rounds of UI fixes. Session closed.)*

---

## Session allocation

Primary: 500 · Buffer: 50 · Total: 550
Planning/Opus sessions: uncounted. Buffer untouchable until a block overruns.

Sessions used to CC-97: ~95 counted + uncounted planning sessions.

---

## Block map

| Block | Scope | Status |
|---|---|---|
| Block 0 | Theme default, footer stamp, banner fixes | ✅ CC-65 |
| Block 1 | Schema hardening: RLS, PIN RLS | ✅ CC-66 |
| Block 2 | Consumer app ↔ merchant tablet live connection | ✅ CC-69 |
| Block 4 | Dev console hardening + investor telemetry | ✅ CC-65 |
| Block M | Share migration → `refueler.io/share/` | ✅ M-3 |
| Block 3 | Franchise dashboard | ✅ CC-81 |
| **Block 5** | Merchant onboarding + simulation discipline | ✅ Block-5 Close — capability complete |
| **Sim-Close** | Formal simulation sign-off | ✅ DECLARED COMPLETE 2026-08-17 |
| **Hardening-A** | Supabase-wide security hardening | ✅ CC-94 |
| **TDP-A** | Terminal audit + design philosophy framing | ✅ CC-95 |
| **TDP-philosophy** | Terminal design philosophy deep-dive | ✅ CC-96 |
| **TDP-B** | Terminal redesign execution | ✅ CC-97 |
| **Block 8** | Fiat → sats rewards | 🟡 After Menu Management v1 |
| Pass-A/B | Pass planning sessions | 🟡 After Bitcoin Events × Pass × Merchant |
| Block 9 | LNBits integration | ⚪ Deferred post Block 8 |

---

## CSS rationalisation track — complete

CSS-1 through CSS-7b all closed.

---

## Session log

### CC-97 — date: 2026-08-18
**Type:** Sonnet counted (TDP-B — Terminal redesign execution).
**Commits:** `92c1ee0` (TDP-B main), `2cde0e3` (Owner tab fixes), `557849f` (horizon strip in Owner tab).
**Scope:** All 10 TDP-B gate items delivered plus three post-deploy fix rounds.

**Delivered:**

**Infrastructure:**
- S-27 ✅ — `authenticated` UPDATE on `venue_partners` restricted to `active` + `pause_reason` columns only. Migration `cc97_s27_venue_partners_column_restrict`. Verified via `information_schema.column_privileges`.
- G-1 ✅ — `create-order` v10 deployed. LNURL-pay flow: invoice created against `venue_partners.lightning_address` via standard LNURL-pay protocol (HTTP GET `.well-known/lnurlp/[user]` → callback POST). Refueler's Blink account is completely out of the customer→merchant payment path. `payment_processor` field now records `'lnurl'`. `BLINK_API_KEY` no longer required by this function.

**Terminal files (3 files, 3 commits):**
- Token migration (D-1/D-2/D-3): canonical CSS-1a values throughout — Paper `#E8E2D8`/`#DAD4CA`, Carbon `#1A1A1A`/`#242424`. `--inset-rule` neutral both themes. `--fg*` aliases added. `--c-text-*` dropped. Both `backdrop-filter` instances removed.
- Ops panel: single honest Open/Closed toggle with honest copy. Calm card grid (Trading status, Staff access placeholder, Menu placeholder, Stamp programme placeholder). Lightning address removed from Ops — staff cannot see or change it.
- Owner tab: Lightning address (behind Owner PIN gate). On-chain address display with persistent privacy nudge ("each payment should use a fresh address"). Horizon strip mirrored from queue — same Darwin poll, no extra fetch, `_mirrorHorizonToOwner()` fires on each Darwin tick. Darwin/fixtures toggle logged for CC-98.
- First-login welcome: centre-aligned, single paragraph body, `rfFirstLogin_[venueId]` localStorage key. Fires once for `independent_owner` only.
- Stamp glyph: `✦` settles on tile via `.tile-stamp-issued` CSS transition on READY status. Plumbing-agnostic.
- Owner PIN dots: `justify-content: center`. "owner" → "Owner" in heading.
- Lightning address text: `var(--text-primary)` 13px — contrast-safe in both themes.
- Sidebar: zeroed and hidden (340px returned to queue). Mapbox dependency removal deferred to TDP-C.
- Horizon strip: slot-based primitive with `HORIZON_TENANTS` array. Darwin (`renderRailTenant()`), Fixtures (stub), Pass (comment only).
- Change Lightning address flow: Owner PIN re-auth → overlay → save. Gracefully fails with explanation until `update-lightning-address` Edge Function is built (S-27 restricts the column — one-function job).

**Menu-item primitive spec (agreed, not yet built):**
```
merchant_menu_items:
  id, venue_id, name, description (nullable), price_gbp,
  available (boolean), category (nullable), display_order, created_at
```
Menu tile: full-width (`grid-column: 1/-1`), item name DM Sans 14px, price IBM Plex Mono 13px gold, availability toggle, category as eyebrow. Scoped for Menu Management v1.

**Fiat commission / Revolut noted:** Stripe fiat commission settles to a bank account, not Blink. Revolut Business is the recommended payout destination. Open as Rajesh action item.

**Owner tab — deferred scope (logged for future sessions):**
- Darwin/fixtures strip toggle — CC-98 or Events intelligence layer session
- All-time stats row (total orders, total revenue) — CC-98
- Last order timestamp — CC-98
- Venue open/closed status in Owner tab — CC-98
- Legend Owner tab integration (Option B: embedded balance/tx panel via Legend API) — dedicated session post-B9 when Legend has a live API

**Lightning address change — outstanding one-function job:**
`update-lightning-address` Edge Function (service_role write to `lightning_address` column). The UI and flow are complete; save gracefully fails with contact-support message until this is deployed. Short session or bundle at start of TDP-C.

---

### CC-96 — date: 2026-08-18
**Type:** Opus uncounted (TDP-philosophy). All philosophy settled. TDP-B scope finalised. **CLOSED.**

### CC-95 — date: 2026-08-18
**Type:** Sonnet counted (TDP-A). Eight drift findings. S-27 added. **CLOSED.**

### CC-94 — date: 2026-08-17
Sonnet counted. Hardening-A execution. Six migrations. G-4 + G-5 cleared. **CLOSED.**

### Sim-Close — date: 2026-08-17
Opus uncounted. Sim-Close formally declared complete. INCIDENT-PROTOCOL.md produced. **CLOSED.**

### CC-92 — date: 2026-08-17
Stage 3 payment simulation PASSED. **CLOSED.**

---

## Session queue — forward plan

| # | Session | Scope | Type | Status |
|---|---|---|---|---|
| 1 | **`update-lightning-address` Edge Function** | service_role write for Lightning address change from Owner tab | Sonnet counted (short) | Bundle at TDP-C open or standalone |
| 2 | **TDP-C** | NumoPay fork alignment | Opus uncounted | Next |
| — | **CC-98 / Owner tab enrichment** | Darwin/fixtures toggle, all-time stats, last order timestamp, venue status in Owner tab | Sonnet counted | After TDP-C |
| — | **Menu Management v1** | CSV import, time-based menus, menu-item primitive | Sonnet counted | After TDP-C |
| — | **CA-1** | Consumer App Track. **Prerequisite: dev branch push.** | Opus uncounted | After TDP-C |
| — | **NumoPay-A** | Fork review, API contract | Opus uncounted | After TDP-C |
| — | **Block 8** | Fiat → sats rewards | Sonnet counted | After Menu Management v1 |
| — | **Pass-A** | Proxy pickup credential, Bitcoin Events × Pass × Merchant, credential structure | Opus uncounted | After TDP-C |
| — | **Events intelligence layer** | Football fixtures, Darwin toggle, horizon strip tenants | Sonnet counted | Gap |
| — | **Legend Owner tab integration** | Option B: embedded balance/tx panel via Legend API | Dedicated session | Post-B9 |
| — | **Privacy page update** | Sections 7, 8, 10 + merchant GDPR + Resend Article 30 | Sonnet counted | Gap |
| — | **Share API planning** | Pay-per-use API v1 | Opus uncounted | Before AD-2 |
| — | **AD-2** | Share admin dashboard | Sonnet counted | After Share API planning |
| — | **Session A (CDK mint)** | CDK mint architecture | Opus uncounted | After Block 8 |
| — | **Status page** | `refueler.io/status/` | Sonnet counted | After first real merchant |

---

## Opening prompt for TDP-C

```
TDP-C — NumoPay fork alignment
Type: Opus uncounted
Context files: docs/MasterContext_IO_CC97.md · docs/SESSIONS-refueler-io-CC97.md

TDP-B is complete (CC-97). This is the NumoPay fork alignment session.
Read live file state from GitHub before any edit. Present full plan before writing code.

Note: bundle the update-lightning-address Edge Function at the start of this session
before moving to NumoPay scope — it is a short one-function job (service_role PATCH
to venue_partners.lightning_address) and clears the outstanding UI flow in the Owner tab.

NumoPay fork: rajesh-taylor/numo-fork (cashubtc/Numo v1.8 base, v1.6 fork, no changes yet).
Local: /Users/rajeshtaylor/Documents/refueler.io/terminals/numo-fork/
Timing: NumoPay-A (fork review, API contract, noun/verb/handle taxonomy) follows this session.
```
