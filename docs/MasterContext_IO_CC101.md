# Refueler Master Context — IO CC-101
*Updated: 2026-08-19 (NumoPay-C — Supabase catalogue, floor order payment, history repoint, offline banner. Commit def2883 on numo-fork main.)*
*Supersedes: MasterContext_IO_CC100*

---

## Session allocation
500 primary + 50 buffer = 550 total. Planning/Opus sessions uncounted.
Sessions used to CC-101: ~97 counted + uncounted planning sessions.

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

All four stages complete. `INCIDENT-PROTOCOL.md` in `refueler-io/docs/`.

---

## Pre-merchant gate list

| # | Gate | Severity | Notes |
|---|---|---|---|
| G-1 | **Merchant settlement wiring** | ✅ CLEARED CC-97 | `create-order` v10 — LNURL-pay |
| G-2 | **Menu Management v1** | Hard blocker | Queued after CC-102 |
| G-3 | **iPad physical check** | Should-do | Non-blocking. Before first real merchant. |
| G-4 | **Hardening-A** | ✅ CLEARED CC-94 | |
| G-5 | S-26 (orders→venue_partners FK) | ✅ CLEARED CC-94 | |

---

## Payment architecture — locked CC-97

**Consumer → Merchant:** LNURL-pay. `create-order` v10. Sats direct to merchant wallet.
**NumoPay floor → Merchant:** same rail via `create-order` EF. `origin:'floor'` on `merchant_orders`. Cash/card: record-only insert, `status:'confirmed'` immediately.
**Refueler's Blink float:** Holds only Refueler's own operating sats (reward payouts, ADR-MS-11).
**Fiat commission:** Stripe → Revolut Business (before first real merchant). Commission rate is an open strategic question — dedicated planning session required before first merchant.

---

## Merchant terminal — file locations (locked TDP-A)

**HTML:** `src/merchant/index.html`
**JS:** `src/merchant/merchant-tablet-logic.js`
**CSS:** `src/merchant/merchant-tablet-styles.css`

---

## Terminal design — current state (post CC-97)

**Sidebar:** removed. **Horizon strip:** slot-based, `HORIZON_TENANTS = ['rail']`, mirrored to Owner tab.
**Known issue:** Darwin strip showing `—` on left side — `renderRailTenant()` reads `etd` but field name in `rail_signal_current.details` JSON may differ. Fix target: CC-102.
**Owner tab enrichment deferred to CC-102:** all-time stats, last order timestamp, venue status toggle, Darwin/fixtures UI toggle.
**Status colours (protected):** Pending `#C8A96E` · In Prep `#7899D4` · Ready `#3DCA7A`.

---

## Edge Functions (deployed)

| Function | Version | Purpose | verify_jwt |
|---|---|---|---|
| `blink-webhook` | v15 | Blink direct callback | `false` |
| `create-order` | v10 | LNURL-pay invoice | `true` |
| `blink-balance` | v5 | Blink wallet balance | `true` |
| `rail-signal-poll` | v10 | Darwin feed poller | `true` |
| `verify-pin` | v2 | bcrypt PIN, rate-limit 5/5min | `false` |
| `update-lightning-address` | v1 | Owner tab LN address change | `true` |

---

## CSS architecture — locked

Single token source: `global.css` (web), `merchant-tablet-styles.css` (terminal). CSS-1 through CSS-7b closed.

**Paper:** `--bg: #E8E2D8` · `--fg: #1A1A1A` · `--surface: #DAD4CA`
**Carbon:** `--bg: #1A1A1A` · `--fg: #E8E2D8` · `--surface: #242424`

---

## Supabase — schema state (post CC-101)

**merchant_orders:** `origin` column (`text not null default 'preorder'`). Values: `'preorder'` · `'floor'`.
**venue_partners:** authenticated UPDATE on `active`, `pause_reason` only (S-27).
**merchant_users:** bcrypt PIN columns service_role-only. Authenticated column-level SELECT on 6 safe columns.
**JWT session lifetime:** 43200s (12h).

---

## NumoPay fork — architecture (NumoPay-A locked, B + C complete)

**ADR:** `numo-fork/NUMO-PAY-A-ADR.md` · `refueler-io/docs/NUMO-PAY-A-ADR.md`
**Commit history:** NumoPay-B `8b217d1` · NumoPay-C `def2883` (strings `76b01d3`)

**EncryptedSharedPreferences keys:**
`refueler_session_enc` / `refueler_session_key` · `refueler_supabase_url` · `refueler_session_jwt` · `refueler_venue_id` · `refueler_local_grant_until`

**New classes (CC-101):**
- `core/network/SupabaseClient` — OkHttp singleton, reads credentials from prefs at call time. `postgrestGet`, `postgrestPost`, `edgeFunctionPost`, `isServerReachable`.
- `core/data/repository/MerchantOrdersRepository` — `MerchantOrder` model + `fetchConfirmed`, `fetchConfirmedInRange`, `fetchTodaySummary`.
- `feature/order/FloorOrderActivity` — floor order payment screen. Lightning: `create-order` EF, QR, 2s/90s poll. Cash/card: direct insert, immediate confirm.

**Replaced classes (CC-101):**
- `feature/items/ItemListActivity` — now reads `merchant_menu_items` via PostgREST. `BitcoinPriceWorker` retained for sats display. Write paths stubbed.
- `feature/insights/InsightsActivity` — now reads `MerchantOrdersRepository`. Cashu layer removed. Bar chart hidden.
- `feature/history/PaymentsHistoryActivity` — now reads `MerchantOrdersRepository`. CSV export retained.

**Known pending (first build verification):**
- `item_history_entry.xml` layout may not exist — needed by InsightsActivity + PaymentsHistoryActivity adapters. Fields: `entry_label`, `entry_amount`, `entry_date`, `entry_secondary`.
- `item_category_chip.xml` layout — needed by ItemListActivity category strip.
- `R.id.loading_view`, `R.id.empty_text_view`, `R.id.category_strip` — must exist in `activity_item_list.xml`.
- `InsightsRepository` (Cashu) is now dead code — can be deleted at next numo-fork touch.

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
| S-Darwin | Darwin strip ETD field name mismatch — `renderRailTenant()` reads wrong field | Medium | CC-102 |
| S-doc-1 | Process doc footer wraps in Chrome PDF | Low | Next process doc iteration |

---

## Ongoing action items (Rajesh)

- **Open Revolut Business account** ← Stripe fiat commission payout destination
- **Open Blink ops wallet ("Refueler Ops")** ← second BTC wallet in Blink mobile app
- **Create Refueler Crypto Ops Ledger** ← sats + GBP equivalent columns
- Push BRIDGE v4.8 to `numo-fork/`, `refueler-share/`, `refueler-legend/`, `refueler-pass/`, `refueler-io/docs/`
- Add test `onchain_address` to Raj's Steakhouse in Supabase dashboard
- Push `refueler-app` dev branch ← CA-1 prerequisite
- Disconnect `share.refueler.io` from Cloudflare Pages
- Upgrade Supabase to Pro when first real merchant goes live
- Upgrade Cloudflare Workers to Paid ($5/month) before production volume
- Send Mapbox coordinate accuracy email (in drafts)
- Visit Apple Store — iPad 10.9″ portrait layout check (G-3)
- New Anthropic API key → rotate before csuite briefing reuse
- Football-data.org API key ready for Events intelligence layer session
- Lawyer briefing: draft written brief before Pass appointment
- Commission rate / double-ask planning conversation — before first real merchant
- **First build of numo-fork** — verify missing layouts (`item_history_entry.xml`, `item_category_chip.xml`) and IDs in `activity_item_list.xml`

---

## Queued sessions — forward plan

| # | Session | Scope | Type | Status |
|---|---|---|---|---|
| ✅ | **NumoPay-C** | Catalogue, payment flows, history | Sonnet counted | **CLOSED CC-101** |
| 1 | **CC-102 / Owner tab enrichment** | Darwin ETD fix · all-time stats · last order · venue status toggle · Darwin/fixtures toggle | Sonnet counted | **Next** |
| 2 | **Menu Management v1** | `merchant_menu_items` DDL · CSV import · terminal UI | Sonnet counted | After CC-102 |
| — | **CA-1** | Consumer App Track. Prerequisite: dev branch push. | Opus uncounted | After CC-102 |
| — | **Block 8** | Fiat → sats rewards | Sonnet counted | After Menu Management v1 |
| — | **Pass-A** | Proxy pickup credential, credential structure | Opus uncounted | After CC-102 |
| — | **Events intelligence layer** | Football fixtures, Darwin toggle, horizon strip tenants | Sonnet counted | Gap |
| — | **Staff Management v1** | Per-staff accounts, AM Blink wallet, ops monitoring | Sonnet counted | Gap |
| — | **Commission planning** | Rate / double-ask model | Opus uncounted | Before first real merchant |
| — | **Legend Owner tab integration** | Embedded balance/tx via Legend API | Dedicated session | Post-B9 |
| — | **Privacy page update** | Sections 7, 8, 10 + merchant GDPR + Resend Article 30 | Sonnet counted | Gap |
| — | **Share API planning** | Pay-per-use API v1 | Opus uncounted | Before AD-2 |
| — | **AD-2** | Share admin dashboard | Sonnet counted | After Share API planning |
| — | **Session A (CDK mint)** | CDK mint architecture | Opus uncounted | After Block 8 |
| — | **Status page** | `refueler.io/status/` | Sonnet counted | After first real merchant |
| — | **September User Guide update** | LN address change section, anti-phishing, AM checklist | Sonnet counted | September |
