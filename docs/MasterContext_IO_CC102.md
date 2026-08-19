# Refueler Master Context — IO CC-102
*Updated: 2026-08-19 (CC-102 — numo-fork build fix partial. S-NumoC-2 open. Owner tab enrichment not started.)*
*Supersedes: MasterContext_IO_CC101*

---

## Session allocation
500 primary + 50 buffer = 550 total. Planning/Opus sessions uncounted.
Sessions used to CC-102: ~98 counted + uncounted planning sessions.

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
| G-2 | **Menu Management v1** | Hard blocker | Queued after CC-103 |
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

## Terminal design — current state (post CC-97)

**Sidebar:** removed. **Horizon strip:** slot-based, `HORIZON_TENANTS = ['rail']`, mirrored to Owner tab.
**Status colours (protected):** Pending `#C8A96E` · In Prep `#7899D4` · Ready `#3DCA7A`.

---

## Darwin strip — FULLY DIAGNOSED (CC-102). Do not re-diagnose in CC-103.

**Root cause of `—` display:**
`rail_signal_current` has RLS enabled with `authenticated`-only SELECT policy. No `anon` policy exists. `pollDarwin()` uses `SB_KEY` (anon) as fallback when no session token — anon role returns empty set → offline branch → `—` displayed.

**Live data confirmed present:** 8 uncancelled services with `atd` values as of 2026-08-19. `updated_at` column is misleading (cron doesn't bump it) — data IS current.

**JS field mapping** (`s.etd || s.atd || s.std`) is correct. Not the bug.

**Fix (CC-103 Item 0):** `apply_migration` — add anon SELECT policy on `rail_signal_current`.

```sql
CREATE POLICY "anon can read rail_signal_current"
ON rail_signal_current FOR SELECT TO anon USING (true);
```

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

## Supabase — schema state (post CC-102)

**merchant_orders:** `origin` column (`text not null default 'preorder'`). Values: `'preorder'` · `'floor'`.
**venue_partners:** authenticated UPDATE on `active`, `pause_reason` only (S-27). `active` column writable by authenticated directly via PostgREST — no EF needed for venue status toggle.
**rail_signal_current:** authenticated SELECT only. **Anon SELECT policy missing — CC-103 Item 0 adds it.**
**merchant_users:** bcrypt PIN columns service_role-only.
**JWT session lifetime:** 43200s (12h).

---

## NumoPay fork — build state (CC-102)

**Latest commit on main:** `ad5405e` — fix: rewrite themes.xml (remove all duplicates, single clean alias block)

**Build status: FAILING — S-NumoC-2**

Error: `parseDebugLocalResources FAILED — Duplicate symbol in table with resource type 'style' and symbol name 'Theme_Numo'`

**Diagnosis:**
- Source files: one `Theme_Numo` definition at `values/themes.xml:112`. Clean.
- Merged packaged_res: one entry. Clean.
- Gradle modules cache: no `Theme_Numo` found in AARs.
- `app/build` deleted. `build-cache-*` deleted. Transforms cache (`~/.gradle/caches/transforms-*`) **not yet cleared**.

**CC-103 first action:**
```bash
cd /Users/rajeshtaylor/Documents/refueler.io/terminals/numo-fork && rm -rf ~/.gradle/caches/transforms-* && rm -rf app/build && ./gradlew assembleDebug 2>&1 | tail -5
```

If still failing after transforms cleared → rename `Theme_Numo` alias to `Theme_NumoPay` in `themes.xml`, grep and update all Kotlin references, commit, rebuild. Max 2 prompts on build fix before escalating to rename.

**numo-fork resource fix commits (CC-102):**
| Commit | Fix |
|---|---|
| `9cf1eab` | Missing numo color aliases + Widget.Numo.BottomSheet |
| `d763c80` | Remove orphaned `activity_withdraw_melt_quote.xml` (Cashu) |
| `5818058` | Add `color_primary` alias for legacy drawable/layout refs |
| `b31f8af` | Remove duplicate `color_primary_purple` |
| `7e18337` | Remove `values-night/themes.xml` (Carbon always-on) |
| `a830b22` | Add Theme.Numo dot-notation aliases + Theme_Numo_BottomSheet |
| `ad5405e` | Rewrite `themes.xml` — single clean alias block, no duplicates |

**NumoPay-C new classes (CC-101, all committed at `def2883`):**
- `core/network/SupabaseClient` — OkHttp singleton
- `core/data/repository/MerchantOrdersRepository` — `merchant_orders` queries
- `feature/order/FloorOrderActivity` — floor order payment screen

**Known pending after BUILD SUCCESSFUL:**
- `item_history_entry.xml` layout — needed by InsightsActivity + PaymentsHistoryActivity
- `item_category_chip.xml` layout — needed by ItemListActivity
- `R.id.loading_view`, `R.id.empty_text_view`, `R.id.category_strip` in `activity_item_list.xml`
- `InsightsRepository` (Cashu) dead code — delete at next touch

---

## Owner tab enrichment — NOT STARTED (deferred to CC-103)

**Items 0–4 all execute in one CC-103 session.** Do not split.

| Item | Scope | Notes |
|---|---|---|
| 0 | Supabase anon SELECT on `rail_signal_current` | `apply_migration` only |
| 1 | All-time stats row (total orders + total sats) | New DOM ids: `owner-stat-alltime-orders`, `owner-stat-alltime-sats` |
| 2 | Last order timestamp | DOM id: `owner-last-order-ts` |
| 3 | Venue status toggle (active/paused) | Authenticated PostgREST PATCH — no new EF. S-27 already grants UPDATE on `active`. |
| 4 | Darwin/fixtures UI toggle | localStorage `refueler_horizon_visible`. Stops/starts `_darwinTimer`. |

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
| S-Darwin | Darwin strip `—` — anon RLS missing on `rail_signal_current` | Medium | CC-103 Item 0 |
| S-NumoC-2 | numo-fork `parseDebugLocalResources FAILED` — Duplicate symbol `Theme_Numo`. Transforms cache not yet cleared. | **High** | CC-103 first action |
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

---

## Queued sessions — forward plan

| # | Session | Scope | Type | Status |
|---|---|---|---|---|
| 1 | **CC-103** | numo build fix (S-NumoC-2) + Owner tab enrichment Items 0–4 | Sonnet counted | **Next** |
| 2 | **Menu Management v1** | `merchant_menu_items` DDL · CSV import · terminal UI | Sonnet counted | After CC-103 |
| — | **CA-1** | Consumer App Track. Prerequisite: dev branch push. | Opus uncounted | After CC-103 |
| — | **Block 8** | Fiat → sats rewards | Sonnet counted | After Menu Management v1 |
| — | **Pass-A** | Proxy pickup credential, credential structure | Opus uncounted | After CC-103 |
| — | **Events intelligence layer** | Football fixtures, Darwin toggle, horizon strip tenants | Sonnet counted | Gap |
| — | **Staff Management v1** | Per-staff accounts, AM Blink wallet, ops monitoring | Sonnet counted | Gap |
| — | **Commission planning** | Rate / double-ask model | Opus uncounted | Before first real merchant |
| — | **Privacy page update** | Sections 7, 8, 10 + merchant GDPR + Resend Article 30 | Sonnet counted | Gap |
| — | **Share API planning** | Pay-per-use API v1 | Opus uncounted | Before AD-2 |
| — | **AD-2** | Share admin dashboard | Sonnet counted | After Share API planning |
| — | **Session A (CDK mint)** | CDK mint architecture | Opus uncounted | After Block 8 |
| — | **Status page** | `refueler.io/status/` | Sonnet counted | After first real merchant |
| — | **September User Guide update** | LN address change section, anti-phishing, AM checklist | Sonnet counted | September |
