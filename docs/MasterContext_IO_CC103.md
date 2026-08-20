# Refueler Master Context — IO CC-103
*Updated: 2026-08-20 (CC-103 — numo-fork build fix closed. Darwin RLS fix applied. Owner tab enrichment complete. CSS committed.)*
*Supersedes: MasterContext_IO_CC102*

---

## Session allocation
500 primary + 50 buffer = 550 total. Planning/Opus sessions uncounted.
Sessions used to CC-103: ~99 counted + uncounted planning sessions.

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
| G-2 | **Menu Management v1** | Hard blocker | **Next session (CC-104)** |
| G-3 | **iPad physical check** | Should-do | Non-blocking. Before first real merchant. |
| G-4 | **Hardening-A** | ✅ CLEARED CC-94 | |
| G-5 | S-26 (orders→venue_partners FK) | ✅ CLEARED CC-94 | |

---

## Payment architecture — locked CC-97

**Consumer → Merchant:** LNURL-pay. `create-order` v10. Sats direct to merchant wallet.
**NumoPay floor → Merchant:** same rail via `create-order` EF. `origin:'floor'` on `merchant_orders`. Cash/card: record-only insert, `status:'confirmed'` immediately.
**Refueler's Blink float:** Holds only Refueler's own operating sats (reward payouts, ADR-MS-11).
**Fiat commission:** Stripe → Revolut Business (before first real merchant). Commission rate is an open strategic question — dedicated planning session required.

---

## Merchant terminal — file locations (locked TDP-A)

**HTML:** `src/merchant/index.html`
**JS:** `src/merchant/merchant-tablet-logic.js`
**CSS:** `src/merchant/merchant-tablet-styles.css`

---

## Terminal design — current state (post CC-103)

**Sidebar:** removed. **Horizon strip:** slot-based, `HORIZON_TENANTS = ['rail']`, mirrored to Owner tab.
**Status colours (protected):** Pending `#C8A96E` · In Prep `#7899D4` · Ready `#3DCA7A`.

**Owner tab (post CC-103):**
- Today stats (orders, revenue, AOV) ✅
- All-time stats row (total orders, total sats) — `owner-stat-alltime-orders`, `owner-stat-alltime-sats` ✅
- Last order timestamp — `owner-last-order-ts` ✅
- Venue status toggle — PATCH to `venue_partners.active` via authenticated PostgREST, `owner-venue-status-toggle` ✅
- Darwin/fixtures horizon toggle — `localStorage` key `refueler_horizon_visible`, `owner-horizon-toggle` ✅
- Lightning address (display + change via `update-lightning-address` EF v1) ✅
- On-chain address (display only, `[R]` to change) ✅
- Sign out ✅

---

## Darwin strip — FIXED (CC-103)

Anon SELECT policy applied to `rail_signal_current` via migration `cc103_rail_signal_anon_read`. Darwin strip will now show live departures without requiring a session token. S-Darwin closed.

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

## Supabase — schema state (post CC-103)

**merchant_orders:** `origin` column (`text not null default 'preorder'`). Values: `'preorder'` · `'floor'`.
**venue_partners:** authenticated UPDATE on `active`, `pause_reason` only (S-27). `active` column writable by authenticated directly via PostgREST.
**rail_signal_current:** authenticated SELECT + anon SELECT (both policies live). Darwin strip now works without session token.
**merchant_users:** bcrypt PIN columns service_role-only.
**JWT session lifetime:** 43200s (12h).

---

## NumoPay fork — build state (post CC-103)

**Latest commit on main:** `54b15de` — fix: resolve Theme_Numo symbol collision — dot-notation aliases only, no underscore duplicates (CC-103)

**Build status: ✅ BUILD SUCCESSFUL**

**Root cause resolved:** `values/themes.xml` had both dot-notation (`Theme.Numo`) and underscore-notation (`Theme_Numo`) aliases for the same style — Android's `ResourceValuesXmlParser` treats these as the same symbol and raises a duplicate error. Fix: dot-notation only in `values/themes.xml`; underscore references in Kotlin (`R.style.Theme_Numo`) resolve to the dot-notation style automatically.

**Confirmed on device:** Installed on Pixel 9a (GrapheneOS). `RefuelerAuthActivity` launches — magic link / email screen, Carbon theme, gold accent. Auth flow working as designed.

**Known pending (non-blocking for build):**
- `item_history_entry.xml` layout — needed by InsightsActivity + PaymentsHistoryActivity
- `item_category_chip.xml` layout — needed by ItemListActivity
- `R.id.loading_view`, `R.id.empty_text_view`, `R.id.category_strip` in `activity_item_list.xml`
- `InsightsRepository` (Cashu) dead code — delete at next touch
- `values-v31/themes.xml` and `values-night-v31/themes.xml` still reference `@color/numo_navy` — old Numo colour. Non-blocking for debug build; clean up at next numo-fork session.

**NumoPay-C new classes (CC-101, committed `def2883`):**
- `core/network/SupabaseClient` — OkHttp singleton
- `core/data/repository/MerchantOrdersRepository` — `merchant_orders` queries
- `feature/order/FloorOrderActivity` — floor order payment screen

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
| S-numo-v31 | `values-v31/themes.xml` + `values-night-v31/themes.xml` reference `@color/numo_navy` | Low | Next numo-fork session |

---

## Ongoing action items (Rajesh)

- **Open Revolut Business account** ← Stripe fiat commission payout destination
- **Open Blink ops wallet ("Refueler Ops")** ← second BTC wallet in Blink mobile app
- **Create Refueler Crypto Ops Ledger** ← sats + GBP equivalent columns
- Push BRIDGE v4.9 to `numo-fork/`, `refueler-share/`, `refueler-legend/`, `refueler-pass/`, `refueler-io/docs/`
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

---

## Queued sessions — forward plan

| # | Session | Scope | Type | Status |
|---|---|---|---|---|
| 1 | **CC-104 — Menu Management v1** | `merchant_menu_items` DDL · CSV import · terminal UI | Sonnet counted | **Next** |
| — | **CA-1** | Consumer App Track. Prerequisite: dev branch push. | Opus uncounted | After CC-104 |
| — | **Block 8** | Fiat → sats rewards | Sonnet counted | After Menu Management v1 |
| — | **Pass-A** | Proxy pickup credential, credential structure | Opus uncounted | After CC-104 |
| — | **Events intelligence layer** | Football fixtures, Darwin toggle, horizon strip tenants | Sonnet counted | Gap |
| — | **Staff Management v1** | Per-staff accounts, AM Blink wallet, ops monitoring | Sonnet counted | Gap |
| — | **Commission planning** | Rate / double-ask model | Opus uncounted | Before first real merchant |
| — | **Privacy page update** | Sections 7, 8, 10 + merchant GDPR + Resend Article 30 | Sonnet counted | Gap |
| — | **Share API planning** | Pay-per-use API v1 | Opus uncounted | Before AD-2 |
| — | **AD-2** | Share admin dashboard | Sonnet counted | After Share API planning |
| — | **Session A (CDK mint)** | CDK mint architecture | Opus uncounted | After Block 8 |
| — | **Status page** | `refueler.io/status/` | Sonnet counted | After first real merchant |
| — | **September User Guide update** | LN address change section, anti-phishing, AM checklist | Sonnet counted | September |

## NFC — deferred capabilities (logged CC-102)
1. NumoPay NFC payment acceptance — floor staff tap customer device at table. NFC HCE class deleted NumoPay-B (softened to android:required=false). Re-introduce at NumoPay-D or dedicated session post-stable build.
2. Pass NFC credential — tap to enter venue/event. Pass-A scope. Separate credential class from payment NFC. Do not conflate.
