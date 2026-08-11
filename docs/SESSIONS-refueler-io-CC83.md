# SESSIONS — refueler-io
*Canonical session log for `rajesh-taylor/refueler-io`.*
*Last updated: Merchant-Sats-B · 2026-08-11 (Opus uncounted — reward flow locked, ADR-MS-11 through ADR-MS-18, multi-programme stamps, commission schema, Stripe shape, Block 8 pre-req schema, walk-in trigger, float mechanics)*

---

## Session allocation

Primary: 500 · Buffer: 50 · Total: 550
Planning/Opus sessions: uncounted. Buffer untouchable until a block overruns.
**Block review sessions** — standing uncounted Opus at end of each block. Recalibrate priorities and allocation.

Sessions used to Merchant-Sats-B: ~83 counted + uncounted planning sessions.

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
| **Block 5** | Merchant onboarding + simulation discipline | 🔵 In progress — CC-83/84/85 |
| **Block 8** | Fiat → sats rewards | 🟡 **Promoted** — next after Block 5 |
| Pass-A/B | Pass planning sessions | 🟡 After Block 8 |
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
| CSS-6 | Page CSS rationalisation — `:root` strip, analytics rfTheme, legend tagline | ✅ Closed |
| CSS-7 | Share design — upload complete, download page, progress states | ✅ Closed |
| CSS-7b | Share fixes + nav reorder | ✅ Closed |

---

## Session log

### Merchant-Sats-B — date: 2026-08-11
**Scope:** Reward flow, stamp lifecycle, commission schema, Stripe shape, Block 8 pre-req schema, walk-in commission trigger, float mechanics, multi-programme stamps. Opus — uncounted.
**No commits this session.**

**Decisions locked:**

- **ADR-MS-11 — LNURL-withdraw pull model:** Sats reward is a PULL. On Lightning settlement, Refueler creates a one-time LNURL-withdraw token via Blink API. Customer claims from their own wallet at any time until expiry. Float debited only on successful claim. Failed claim leaves token in `claimable` state. ADR-4b honoured — no Lightning address ever stored. `reward_payouts` table: token string + lifecycle state only, never an address.

- **ADR-MS-12 — Stamp track scaffolded, live pending mint:** Sats reward track fully live Block 8. Stamp track (`stamp_programmes`, `stamp_events`, mint issuance/redemption) scaffolded in Block 8 but dark until `refueler-mint` is deployed. No interim identity-linked DB stamp counter — contradicts IP honesty standard (Adversarial-1).

- **ADR-MS-13 — Multi-programme stamps:** Max 3 active stamp programmes per venue. Programme selection: pre-order = customer selects in app; walk-in fallback cascade = time-window auto-assign → staff select → category tag (long-term). Time windows configured per programme (`start_time`/`end_time`). Max 3 active enforced via DB trigger + application layer. Merchant toggle: `venue_partners.stamp_feature_enabled boolean DEFAULT false`. Stamp feature in onboarding pitch and handover doc. Competitive check item: does Square/Toast/KDS offer this? If not, it's a differentiator.

- **ADR-MS-14 — Walk-in commission trigger:** Primary trigger = staff Accept action on tablet (`merchant_orders.status` → `accepted`) → `commission_charges` row inserted. Nightly pg_cron reconciliation (02:00 UTC) surfaces attributed orders with no `commission_charges` row within 24h. Gaming risk managed by merchant agreement, not plumbing.

- **ADR-MS-15 — Commission rate variability:** 4–8% range, varies by merchant and franchise. `merchant_billing.commission_rate` with `rate_effective_from` for annual renewals. `create-order` stamps rate onto `orders.commission_pct` — historical orders retain original rate permanently.

- **ADR-MS-16 — Merchant billing separation:** `merchant_billing` table keyed by `venue_id`, separate from `venue_partners`. Stores `stripe_customer_id` + `has_default_pm` + `billing_status` + `delinquent_since` + `commission_rate` + `rate_effective_from`. Card data never in Supabase.

- **ADR-MS-17 — Commission retry and delinquency:** `charge-commission` Edge Function, per-minute pg_cron. Up to 3 attempts, exponential backoff. After 3 fails: `commission_charges.status = delinquent`, `merchant_billing.delinquent_since` stamped, dev console alert + email.

- **ADR-MS-18 — Float mechanics:** Float = Refueler's own sats revenue only. Manual top-up by Rajesh. Pre-load TBD-Rajesh based on sim volume data. Low-water alert: pg_cron every 5 min vs `float_config.low_water_sats`; alert fires to dev console + `dev@refueler.io`. `float_config` (single-row config) + `float_ledger` (credit/debit audit) both admin-only RLS.

- **Block 8 pre-req schema locked:** 7 new tables (`merchant_billing`, `commission_charges`, `reward_payouts`, `float_config`, `float_ledger`, `stamp_programmes`, `stamp_events`). 2 modified tables (`orders` + `commission_status`; `venue_partners` + `stamp_feature_enabled`). 4 new Edge Functions (`charge-commission`, `issue-reward`, `stripe-webhook`, `claim-reward`). 3 new pg_cron jobs (`charge-commission-job`, `float-monitor`, `commission-reconciliation`). Full spec in MasterContext CC83.

- **Reward choice UI:** presented inline on settlement screen — "Claim [X] sats" / "[Programme Name] stamp card" / "Skip". Edge cases: no wallet = token stays claimable until expiry; decline both = reward_payouts status `declined`, no float impact; connection failure = retry later; float zero at claim = LNURL-withdraw endpoint returns error, token stays open. Merchant sees nothing for sats reward (Refueler's money); sees tablet notification for stamp redemption only.

- **Stripe integration shape:** no Stripe Connect. Refueler bills its own customer. `merchant_billing.stripe_customer_id` → Stripe Customer + PaymentMethod (Stripe-side). Webhook chain: settlement → `blink-webhook` → `issue-reward` + `commission_charges(pending)` → `charge-commission-job` → `charge-commission` → Stripe PaymentIntent → `stripe-webhook` → status update. Fiat walk-in: staff Accept → `commission_charges(pending)` → same charge job.

- **Multi-franchise mint concept noted:** Each franchise could have its own CDK mint keyset — Moniker stamps cryptographically isolated from competitor chains. Could be offered as standalone "Refueler Mint as a Service." Scoped for Session A (CDK mint architecture) in `refueler-mint`/`refueler-ecash-lab`.

- **AI helper queued:** Owner tab only. Swipe-up panel. Cloudflare AI Worker for quick queries. Serious issues → `support@refueler.io` + helpline. Not Block 8.

- **ecash-lab scoped:** CDK Rust mint + Orchard GUI (github.com/cashubtc/orchard). Reference use case: café-by-day / wine-bar-at-night running concurrent stamp programmes. No README this session — queue Session A when ready to sit down and run a mint.

---

### Merchant-Sats-A — date: 2026-08-11
**Scope:** Payment architecture, flows, flywheel, node purpose, Pass initial scope, legal caveat. Opus — uncounted.
**No commits this session.**

**Decisions locked:** ADR-MS-1 through ADR-MS-10. Seven payment flows. Node three-way lock. Pass initial scope. Flywheel confirmed. Legal caveat permanently logged. See MasterContext for full detail.

---

### Block-5 Review — date: 2026-08-11
**Scope:** Planning and recalibration. Opus — uncounted.
**No commits this session.**

**Decisions locked:** 550 session allocation confirmed. Block 5 split into CC-83/84/85. Block 8 promoted. Simulation discipline locked (4 stages). AD-1 complete; AD-2 added. S-13 deleted. S-1 formally queued.

---

### CC-82 — date: 2026-08-10
**Scope:** Block 5 — Merchant onboarding flow (pre-work + test environment + E2E). Counted.
**Commits:** `cac6f38` (pre-work paths) · `b981ffb` (PIN flash fix)

**Pre-work fixes (cac6f38):**
- `src/command-centre/index.html` — ROLE_DESTINATIONS updated to Eleventy paths. Role lookup changed from `.eq('email', userEmail)` to `.eq('user_id', session.user.id)` — email lookup deprecated.
- `src/merchant/merchant-tablet-logic.js` — `emailRedirectTo` updated to `/merchant/`. Sign-out redirects updated to `/command-centre/`.

**PIN flash fix (b981ffb):**
- `src/merchant/index.html` — all tablet UI wrapped in `<div id="tablet-ui" style="display:none;">`. Three ⚡ emoji removed from wordmark instances (queue empty-state icon retained).
- `src/merchant/merchant-tablet-logic.js` — `onStaffAuthenticated()` sets `tablet-ui` display to `''`. Sign-out sets it to `none`.
- Known residual flash (~1 frame) — S-1, deferred.

**DB migrations:**
- `block5_test_venue` — Raj's Steakhouse: `c476df85-5572-49bd-a476-a908519a9a23`
- `block5_steakhouse_merchant_user` — user_id `4153cee2-15af-4b14-bdb7-4f4465458017`, role `independent_owner`, venue_id `c476df85`
- `block5_steakhouse_pins` — staff 1234 · owner 8888

**E2E verified:** Command-centre → /merchant/ · PIN gate · Staff queue + Darwin · OPS view · Owner View KPI strip · Paper/Carbon toggle ✅

---

### CC-81 — date: 2026-08-10
**Scope:** Block 3 — Franchise dashboard. Counted.
**Commits:** `cd9c288` · `4f343d8` · `b891e83` · `f7b7260` · `9dcc2ad`

Migrations: `franchise_dashboard_summary` SECURITY DEFINER RPC · `venue_partners_franchise_hq_update` RLS · `franchise_hq_venue_update_guard` BEFORE UPDATE trigger.

Key changes: All five operator tools moved from repo root → `src/[slug]/index.html`. Franchise dashboard: single RPC data layer, topbar controls, sidebar reorder, cross-browser magic link auth. moniker@rajeshtaylor.com → franchise_hq.

---

### Earlier sessions (CC-68 to CC-80)
- CC-68/69: Blink webhook v12, consumer app Block 2 closed, settlement detection locked
- CC-70: Planning — LNBits deferred, fiat→sats rewards scoped (Block 8)
- CC-71 to CC-76: Schema hardening, Share CSS, Legend copy
- CC-77/78: Legend + homepage copy locked
- CC-79/79b: Homepage redesign live, Cormorant Garamond, home- prefix
- CC-80: Nav fix, editorial :root strip, all four articles migrated

---

## Opening prompt — CC-83 (Sonnet — counted)

**Attach:** `Refueler_MasterContext_IO_CC83.md`, `SESSIONS-refueler-io-CC83.md`, `REFUELER-BRIDGE.md`

CC-83 open. Block 5 continued — merchant tablet snag fixes and nav redesign. Counted session.

**Before doing anything, read these live:**
```
https://raw.githubusercontent.com/rajesh-taylor/refueler-io/main/src/merchant/index.html
https://raw.githubusercontent.com/rajesh-taylor/refueler-io/main/src/merchant/merchant-tablet-logic.js
https://raw.githubusercontent.com/rajesh-taylor/refueler-io/main/src/merchant/merchant-tablet-styles.css
```

**Also check live RLS policies before writing any migration:**
Use `execute_sql` to read `pg_policies` for `venue_partners` — do not assume current policy state.

**Tasks in priority order:**

1. **S-2 — venue RLS fix:** `independent_owner` role cannot read `venue_partners`. Read live `pg_policies` first. Add SELECT policy scoped to `merchant_users.venue_id` for `independent_owner` role via `apply_migration`. Verify "Loading venue…" resolves to "Raj's Steakhouse" after migration.

2. **S-3/S-4/S-5 — nav redesign:**
   - Replace STEAKHOUSE toggle with explicit Queue/Ops two-state pill (same pattern as Paper/Carbon pill)
   - Venue name centred in nav, pulling from `venue_partners.name` (not merchant_id slug)
   - Owner button stays PIN-gated, right side
   - Logo placeholder space for future upload — layout allocation only, no upload UI

3. **S-6 — horizon strip:** Increase stat value font size ~20%. Give columns more breathing room. Labels stay small.

4. **S-7 — sidebar height:** `min-height: 100%` or `align-self: stretch` on sidebar element.

5. **logo_url and stamp_feature_enabled migration:** Add `logo_url text` column and `stamp_feature_enabled boolean DEFAULT false` column to `venue_partners` via single `apply_migration`. Also add `commission_status text` column to `orders`.

6. **S-13 cleanup:** Delete `independent_owner@rajeshtaylor.com` row from `merchant_users` via `apply_migration`.

7. **S-1 (PIN flash):** If time permits — inline gate CSS in `<head>` of `src/merchant/index.html`: auth-gate and PIN-gate divs get `position:fixed; inset:0; z-index:9999; background:var(--bg)` in a `<style>` block before any external stylesheet loads.

8. **MasterContext + SESSIONS + BRIDGE update** at close.

Standing rules: Read live files from GitHub before touching anything. DDL via `apply_migration` only. `execute_sql` read-only. One terminal command at a time. Files manually placed — git commands only. Present full plan before writing any code.

---

## Opening prompt — Merchant-Sats-C (Opus — uncounted)

**Attach:** `Refueler_MasterContext_IO_CC83.md`, `SESSIONS-refueler-io-CC83.md`, `REFUELER-BRIDGE.md`

Merchant-Sats-C open. Reward choice UI spec for the consumer app. Opus — uncounted.

**Baseline:** ADR-MS-11 through ADR-MS-18 locked (Merchant-Sats-B). LNURL-withdraw pull model locked. Stamp track scaffolded pending mint.

**Scope:**
1. Reward choice screen state machine — exactly when it appears in the app settlement flow, what states it has, what triggers transitions. Pre-order Lightning (Flow 1) and pre-order fiat (Flow 2) may need different timing.
2. Sats path: LNURL-withdraw claim UX — what the customer sees, what happens if their wallet app isn't open, how expiry is communicated, what "try again" looks like. NativeTabs constraint applies (no `router.replace` to sibling routes — settled view must remain inline state changes).
3. Stamp path (scaffolded only — UI to exist Block 8, but dark until mint): what the programme picker looks like when there are 1 / 2 / 3 active programmes. Venue name and programme name displayed. "Buy 9 get 1 free" mechanic clearly communicated without being wordy.
4. Edge case specs: float zero → sats option greyed / removed; no active programmes → stamp option absent; customer declines both → Skip confirmation; connection failure → token retained server-side, in-app recovery prompt on next app open.
5. What Realtime events or polling the app needs to support the reward flow — is there a new Supabase channel needed beyond the existing settlement subscription?

**Output:** Reward choice screen spec (state machine + annotated wireframe descriptions), NativeTabs-compatible implementation notes, new Realtime/polling requirements. Updated MasterContext and SESSIONS.

---

## Opening prompt — Onboarding-A (Opus — uncounted)

**Attach:** `Refueler_MasterContext_IO_CC83.md`, `SESSIONS-refueler-io-CC83.md`, `REFUELER-BRIDGE.md`

Onboarding-A open. Merchant onboarding flow design + printed handover document. Opus — uncounted.

**Scope:**
1. Self-service onboarding flow — magic-link invite → command-centre → first-run venue confirmation → PIN setup → stamp programme setup → "Accepting orders" activation. Map every screen state and edge case.
2. PIN self-service UX — how an owner sets and resets staff/owner PINs without Rajesh touching the database. RLS consequences (scoped write path to `merchant_users` PIN columns) — flag design constraints for CC-84.
3. Stamp programme setup — owner configures up to 3 programmes at onboarding or later in owner view. Time-window fields, reward description, target count. Stamp feature toggle (`venue_partners.stamp_feature_enabled`).
4. Branded magic-link email — content and layout outline only. Suave, discreet, on-brand. Build is CC-85.
5. Printed handover document — format (A5 or A4, stock, feel), audience split (floor manager / owner / regional manager), full content outline. Key items: "Accepting orders" toggle default-off, PIN setup, stamp programme configuration, escalation path (`support@refueler.io`).

**Multi-programme stamp as a pitch point:** this is part of the sales conversation. The handover document and onboarding flow both need to communicate the value — café-by-day / wine bar-by-night use case as the reference example.

**Timebox printed document work to 40% of session time.** Flow design and PIN self-service UX unblock CC-84.

**Output:** Flow diagram or structured description, PIN self-service UX spec, stamp programme setup flow, email outline, printed document content outline and structure.

---

*"Nothing stops this train."*
