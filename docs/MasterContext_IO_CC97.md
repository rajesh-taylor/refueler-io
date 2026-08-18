# Refueler Master Context — IO CC-97
*Updated: 2026-08-18 (TDP-B — Sonnet counted. Terminal redesign execution complete. S-27 deployed. create-order v10 LNURL-pay. Token migration. Ops card grid. Owner tab: lightning address, on-chain address, privacy nudge, horizon strip mirrored. First-login welcome. Stamp glyph. Horizon slot primitive. Three commit rounds. Session closed.)*
*Supersedes: MasterContext_IO_CC96*

---

## Session allocation
500 primary + 50 buffer = 550 total. Planning/Opus sessions uncounted.
Sessions used to CC-97: ~95 counted + uncounted planning sessions.

---

## Project overview

Refueler is a Bitcoin-native privacy ecosystem. Products: Share (live at `refueler.io/share/`), Legend (post-B9), consumer pre-order app (Fenchurch St line), merchant terminal (tablet, counter/kitchen), Pass (own repo), NumoPay fork (Android, waiter/floor staff).

**Supabase project:** `tihgvdokeofnjxjkenmm`
**Webhook URL:** `https://tihgvdokeofnjxjkenmm.supabase.co/functions/v1/blink-webhook`

**GitHub repos:**
| Repo | Local path |
|---|---|
| `rajesh-taylor/refueler-io` | `/Users/rajeshtaylor/Documents/refueler.io/` |
| `rajesh-taylor/refueler-app` | `/Users/rajeshtaylor/Documents/refueler.io/refueler-app/` — dev branch local, push pending |
| `rajesh-taylor/numo-fork` | `/Users/rajeshtaylor/Documents/refueler.io/terminals/numo-fork/` |
| `rajesh-taylor/refueler-share` | `/Users/rajeshtaylor/Documents/refueler-share/` |
| `rajesh-taylor/refueler-legend` | `/Users/rajeshtaylor/Documents/refueler-legend/` |
| `rajesh-taylor/refueler-mint` | `/Users/rajeshtaylor/Documents/refueler-mint/` |
| `rajesh-taylor/refueler-pass` | Own repo + Claude project |
| `refueler-ecash-lab` | **Local only — never push** |

---

## Sim-Close — DECLARED COMPLETE (2026-08-17)

All four stages complete or non-blocking. `INCIDENT-PROTOCOL.md` in `refueler-io/docs/`.

---

## Pre-merchant gate list (updated CC-97)

| # | Gate | Severity | Notes |
|---|---|---|---|
| G-1 | **Merchant settlement wiring** | ✅ CLEARED CC-97 | `create-order` v10 — LNURL-pay, invoices to `venue_partners.lightning_address` directly |
| G-2 | **Menu Management v1** | Hard blocker | Queued after TDP-C |
| G-3 | **iPad physical check** | Should-do | Non-blocking. Do before first real merchant. |
| G-4 | **Hardening-A** | ✅ CLEARED CC-94 | |
| G-5 | S-26 (orders→venue_partners FK) | ✅ CLEARED CC-94 | |

---

## Payment architecture — locked CC-97

**Consumer → Merchant:** LNURL-pay flow. `create-order` v10 fetches `venue_partners.lightning_address`, resolves BOLT11 via standard LNURL-pay protocol (`.well-known/lnurlp/[user]` GET → callback POST). Sats go direct to merchant's wallet (WoS, own node, etc.). Refueler's Blink account is never in the customer→merchant path.

**Refueler's Blink float:** Holds only Refueler's own operating sats. Used exclusively for LNURL-withdraw sats reward payouts (ADR-MS-11). Never custodian between consumer and merchant.

**Fiat commission:** Stripe off-session PaymentIntent (4–8% of order value). Settles to a bank account — **Revolut Business recommended** (open before first real merchant goes live). Not to Blink.

**`payment_processor` field:** records `'lnurl'` from v10 onwards (was `'blink'`).

---

## Three-wallet simulation setup (confirmed Sim-Close)

- **WoS** (`trickdraw318@walletofsatoshi.com`) — merchant wallet, now the live invoice destination via LNURL-pay
- **Blink** (`fd2357fe-24ec-4173-8441-fc0f05722e9a`) — Refueler treasury only
- **Minibits** — customer wallet, BOLT11-capable payer

---

## Merchant terminal — file locations (locked TDP-A)

**HTML:** `src/merchant/index.html`
**JS:** `src/merchant/merchant-tablet-logic.js`
**CSS:** `src/merchant/merchant-tablet-styles.css`

*All previous references to `merchant-tablet.html` are incorrect.*

---

## Terminal design — current state (post CC-97)

**Sidebar:** removed. `display:none`. 340px returned to queue. Mapbox dependency removal deferred TDP-C.

**Horizon strip:** slot-based primitive. `HORIZON_TENANTS = ['rail']`. Darwin (`renderRailTenant()`), Fixtures (stub), Pass (comment only). Strip mirrored to Owner tab via `_mirrorHorizonToOwner()` — no extra fetch.

**Ops panel:** single honest Open/Closed toggle. Card grid: Trading status, Staff access (placeholder), Menu (placeholder), Stamp programme (placeholder). Lightning address removed from Ops.

**Owner tab (behind Owner PIN gate):**
- Stats: Orders Today, Revenue Today, AOV
- Horizon strip: mirrored from queue, same Darwin poll
- Lightning address: display + Change button (Change flow requires `update-lightning-address` Edge Function — outstanding)
- On-chain address: display only (`[R]` to change), persistent privacy nudge
- Account: sign out

**First-login welcome:** centre-aligned, fires once for `independent_owner`, `rfFirstLogin_[venueId]` localStorage key.

**Stamp glyph:** `✦` settles on tile via `.tile-stamp-issued` on READY status. Plumbing-agnostic.

**Status colours (protected):** Pending gold `#C8A96E` · In Prep `#7899D4` · Ready `#3DCA7A`.

---

## Terminal token drift — all fixed CC-97

All D-1/D-2/D-3 findings resolved. Canonical values now live in terminal CSS.

| Finding | Was | Now |
|---|---|---|
| Paper `--bg` | `#F7F4EF` | `#E8E2D8` ✅ |
| Paper `--surface` | `#EDEAE4` | `#DAD4CA` ✅ |
| Carbon `--bg` | `#1E1F22` | `#1A1A1A` ✅ |
| Carbon `--surface` | `#26282C` | `#242424` ✅ |
| Carbon `--inset-rule` | `#C8A96E` (gold) | `var(--border)` ✅ |
| `backdrop-filter` | present (×2) | removed ✅ |
| S-25 tile bg | hardcoded `#26282C` | resolved via `var(--surface)` ✅ |

---

## Outstanding one-function job

**`update-lightning-address` Edge Function:** service_role PATCH to `venue_partners.lightning_address`. S-27 (CC-97) restricts `authenticated` to `active` + `pause_reason` only, so the terminal's Change flow gracefully fails until this is deployed. UI is complete. Bundle at start of TDP-C.

---

## CSS architecture — locked

Single token source: `global.css` (web), `merchant-tablet-styles.css` (terminal). No page defines its own `:root`. No `backdrop-filter`. All CSS rationalisation sessions CSS-1 through CSS-7b closed.

**Global CSS — canonical token values (CSS-1a locked):**

**Paper:** `--bg: #E8E2D8` · `--fg: #1A1A1A` · `--fg-muted: #5A5550` · `--fg-subtle: #9A9590` · `--surface: #DAD4CA` · `--surface-raised: #D0C9BE`

**Carbon:** `--bg: #1A1A1A` · `--fg: #E8E2D8` · `--fg-muted: #9A9590` · `--fg-subtle: #5A5550` · `--surface: #242424` · `--surface-raised: #2E2E2E`

**Shared:** `--gold: #C8A96E` · `--success: #27AE60`

**Theme persistence:** `rs-theme` cookie (web) · `rfTheme` localStorage (terminal).
**Abolished:** `localStorage` for web theme · `rfTheme` on web · `backdrop-filter` · `#F5820A` orange · `#F7F4EF` · `#1E1F22` · `--accent-action`

---

## Supabase — schema state (post-CC-97)

**venue_partners column grants (authenticated role):**
- SELECT: all columns (table level)
- UPDATE: `active`, `pause_reason` only (column level — S-27, CC-97)
- `lightning_address`, `onchain_address`, `silent_payment_address`: no write path for authenticated. Service_role only.

**venue_partners columns confirmed present:** `active`, `pause_reason`, `lightning_address`, `onchain_address`, `silent_payment_address`, `mapbox_place_id`

**merchant_users:** anon holds zero grants. authenticated holds column-level SELECT on 6 safe columns only. bcrypt columns service_role-only.

**Raj's Steakhouse:** staff PIN 1234, owner PIN 8888, active true, `lightning_address = 'trickdraw318@walletofsatoshi.com'`, `onchain_address` not yet set (shows `—` in Owner tab — add test address via Supabase dashboard to verify display).

**JWT session lifetime:** 43200s (12h)

---

## Edge Functions (deployed)

| Function | Version | Purpose | verify_jwt |
|---|---|---|---|
| `blink-webhook` | v15 | Blink direct callback | `false` (explicit) |
| `create-order` | v10 | Consumer app → LNURL-pay invoice to merchant LN address | `true` |
| `blink-balance` | v5 | Proxies Blink GraphQL balance | `true` |
| `rail-signal-poll` | v10 | Darwin feed poller, pg_cron triggered | `true` |
| `verify-pin` | v2 | bcrypt PIN verification, rate-limit 5/5min | `false` (explicit) |

**Blink:** Active API key `refueler-cc68` · BTC wallet: `fd2357fe-24ec-4173-8441-fc0f05722e9a` (Refueler treasury only — not in consumer→merchant path)

---

## Menu-item primitive spec (agreed CC-97, not yet built)

```
merchant_menu_items:
  id           uuid
  venue_id     uuid → venue_partners
  name         text
  description  text nullable
  price_gbp    numeric(6,2)
  available    boolean
  category     text nullable
  display_order int
  created_at   timestamptz
```
Tile: full-width (`grid-column: 1/-1`), name DM Sans 14px, price IBM Plex Mono 13px gold, availability toggle, category as eyebrow. Scoped for Menu Management v1.

---

## PIN auth — S-18 (CLOSED CC-90)

`verify-pin` v2, bcryptjs, rate limit 5/5min. SHA-256 legacy columns dropped CC-94. ✅

---

## Merchant handover documents — locked Design-A, updated CC-91

Files in `refueler-io/docs/`: `merchant-onboarding-v1.html`, `merchant-venue-keys-v1.html`, `merchant-onboarding-process-v1.html`, `INCIDENT-PROTOCOL.md`.

**Docs ↔ UI sync rule (active):** confirm currency at every block close touching terminal UI.

---

## Test accounts

| Email | Role | Notes |
|---|---|---|
| `steakhouse@rajeshtaylor.com` | `independent_owner` | Raj's Steakhouse · venue_id `c476df85` · staff PIN 1234 · owner PIN 8888 |
| `moniker@rajeshtaylor.com` | `franchise_hq` | Moniker franchise |
| `dev@refueler.io` | `admin` | Admin / dev console |

---

## Snag list — active

| ID | Item | Priority | Target |
|---|---|---|---|
| S-22 | Email fallback link block — spacing | Low | Future email session |
| S-doc-1 | Process doc footer wraps in Chrome PDF | Low | Next process doc iteration |
| S-LN-1 | `update-lightning-address` Edge Function needed for Owner tab change flow | Medium | Bundle at TDP-C open |

**Permanently closed:** ~~S-12~~ · ~~S-14~~ · ~~S-18~~ · ~~S-23~~ · ~~S-24~~ · ~~S-25~~ · ~~S-26~~ · ~~S-27~~

---

## Ongoing action items (Rajesh)

- **Open Revolut Business account** ← Stripe fiat commission payout destination (before first real merchant)
- Add test `onchain_address` to Raj's Steakhouse in Supabase dashboard (to verify Owner tab display)
- Disconnect `share.refueler.io` from Cloudflare Pages
- Push `refueler-app` dev branch ← CA-1 prerequisite
- Send Mapbox coordinate accuracy email (drafted CC-84, in drafts)
- Visit Apple Store — iPad 10.9″ portrait layout check (G-3, before first real merchant)
- Upgrade Supabase to Pro when first real merchant goes live
- Upgrade Cloudflare Workers to Paid ($5/month) before production volume
- New Anthropic API key → rotate before csuite briefing reuse
- football-data.org API key: held by Rajesh, ready for Events intelligence layer session
- Lawyer briefing: draft written brief before Pass appointment
- Docs ↔ UI sync rule: active

---

## Queued sessions — forward plan

| # | Session | Scope | Type | Status |
|---|---|---|---|---|
| 1 | **`update-lightning-address` EF** | service_role write for LN address change | Sonnet (short) | Bundle at TDP-C open |
| 2 | **TDP-C** | NumoPay fork alignment | Opus uncounted | **Next** |
| 3 | **CC-98 / Owner tab enrichment** | Darwin/fixtures toggle, all-time stats, last order, venue status | Sonnet counted | After TDP-C |
| — | **Menu Management v1** | CSV import, time-based menus | Sonnet counted | After TDP-C |
| — | **CA-1** | Consumer App Track | Opus uncounted | After TDP-C |
| — | **NumoPay-A** | Fork review, API contract | Opus uncounted | After TDP-C |
| — | **Block 8** | Fiat → sats rewards | Sonnet counted | After Menu Management v1 |
| — | **Pass-A** | Proxy pickup credential, credential structure | Opus uncounted | After TDP-C |
| — | **Events intelligence layer** | Football fixtures, horizon strip tenants | Sonnet counted | Gap |
| — | **Legend Owner tab integration** | Option B: embedded balance/tx via Legend API | Dedicated session | Post-B9 |
| — | **Privacy page update** | Sections 7, 8, 10 + merchant GDPR + Resend Article 30 | Sonnet counted | Gap |
| — | **Share API planning** | Pay-per-use API v1 | Opus uncounted | Before AD-2 |
| — | **AD-2** | Share admin dashboard | Sonnet counted | After Share API planning |
| — | **Session A (CDK mint)** | CDK mint architecture | Opus uncounted | After Block 8 |
| — | **Status page** | `refueler.io/status/` | Sonnet counted | After first real merchant |
