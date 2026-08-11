# SESSIONS — refueler-io
*Canonical session log for `rajesh-taylor/refueler-io`.*
*Last updated: Merchant-Sats-A · 2026-08-11 (Opus uncounted — payment architecture locked, ADR-MS-1 through ADR-MS-10, seven flows, Pass initial scope, flywheel confirmed, legal caveat permanently logged)*

---

## Session allocation

Primary: 500 · Buffer: 50 · Total: 550
Planning/Opus sessions: uncounted. Buffer untouchable until a block overruns.
**Block review sessions** — standing uncounted Opus at end of each block. Recalibrate priorities and allocation.

Sessions used to Merchant-Sats-A: ~83 counted + uncounted planning sessions.

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

### Merchant-Sats-A — date: 2026-08-11
**Scope:** Payment architecture, flows, flywheel, node purpose, Pass initial scope, legal caveat. Opus — uncounted.
**No commits this session.**

**Decisions locked:**

- **ADR-MS-1:** Refueler is never in the payment flow. Consumer sats settle directly to merchant's own wallet. Consumer fiat processed by licensed third party (Stripe / merchant's own acquirer). Blink float holds only Refueler's own received revenue. Model A permanently excluded.
- **ADR-MS-2:** Commission liability trigger = Refueler-originated, app-attributed orders only. Collected fiat, real-time, off the sats flow. Stripe off-session PaymentIntent (stored card) on Lightning settlement confirmation. No Stripe Connect.
- **ADR-MS-3:** Loyalty stamps confirmed closed-loop, non-monetary, no FCA grey area. Buy 9 get 10th free — cannot convert to sats or fiat.
- **ADR-MS-4:** Numo role locked. Scenario A (app present): attribution + commission + reward. Scenario B (no app): merchant's own flow, Lightning direct to merchant wallet (Silent Payments / own Lightning address in owner-only terminal view). Scenario B anticipated to become dominant — architecture is comfortable with this.
- **ADR-MS-5:** Seven payment flows locked. Five flows from Merchant-Sats-A scope extended to seven: added Flow 3 (app walk-in fiat) and Flow 4 (app walk-in Lightning). Commission trigger event for walk-in flows (no payment event visible to Refueler on fiat) to be confirmed in Merchant-Sats-B.
- **ADR-MS-6:** Node three-way lock confirmed. Legend indexer (post-B9) / Merchant settlement (long-term optional, merchant's own) / Refueler treasury sweep (own operating capital). Forbidden fourth (Refueler between consumer and merchant) permanently excluded. Stage 3 sim node = Legend node — same box, two purposes.
- **ADR-MS-7:** Pass initial scope locked. Own repo (`rajesh-taylor/refueler-pass`) and own Claude project. QR/NFC credential (app or Apple/Google Wallet). Conditional entitlement post-scan. Fountain/LNURL streaming opt-in. Apple/Google Wallet path for non-app users. Privacy layer in Pass-A/B.
- **ADR-MS-8:** BOLT12 roadmap position — not in scope for beta or Block 9. Three conditions before adoption. Numo as client to merchant node, not as node itself.
- **ADR-MS-9:** Flywheel locked. Share + Pass + Legend → Legend on desktop. App + Pass → Legend on mobile (same app, separate tabs). Numo → merchant dashboard → Legend in-venue. Three surfaces, one destination.
- **ADR-MS-10:** Legal caveat permanently logged. Four points requiring UK payments solicitor sign-off before real-merchant go-live. Approach lawyer as confirmation of architecture, not open risk assessment.
- **Payment initiation clarified:** Stripe payment screen handoff does not constitute payment initiation (Stripe processes, not Refueler). Numo fiat on merchant's own acquirer — clean. Lightning on merchant's own wallet — clean. Risk is assessed as low across all seven flows. Confirm with solicitor.
- **Merchant-Sats-B confirmed warranted:** Blink float mechanics, Cashu stamp lifecycle, commission schema, walk-in flow attribution trigger, and Block 8 pre-reqs all require a dedicated session.

---

### Block-5 Review — date: 2026-08-11
**Scope:** Planning and recalibration. Opus — uncounted.
**No commits this session.**

**Decisions locked:**

- **Session allocation confirmed:** 550 total (500 primary + 50 buffer).
- **Block 5 split into CC-83, CC-84, CC-85.**
- **Block 8 promoted** above Blocks 6 and 7. New post-Block-5 order: Block 8 → Pass-A/B → Block 9 → Block 6/7.
- **Simulation discipline locked.** Four sim stages defined. Sim-Close gates real merchant go-live.
- **Order correction and refunds** added to Sim Stage 1 scope.
- **AD-1 complete.** AD-2 added.
- **S-13 deleted.** `independent_owner@rajeshtaylor.com` orphan row removed in CC-83 migration.
- **S-1 (PIN flash fix):** Formally queued — bundle into CC-83 if room.

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

5. **logo_url migration:** Add `logo_url text` column to `venue_partners` via `apply_migration`.

6. **S-13 cleanup:** Delete `independent_owner@rajeshtaylor.com` row from `merchant_users` via `apply_migration`.

7. **S-1 (PIN flash):** If time permits — inline gate CSS in `<head>` of `src/merchant/index.html`: auth-gate and PIN-gate divs get `position:fixed; inset:0; z-index:9999; background:var(--bg)` in a `<style>` block before any external stylesheet loads.

8. **MasterContext + SESSIONS + BRIDGE update** at close.

Standing rules: Read live files from GitHub before touching anything. DDL via `apply_migration` only. `execute_sql` read-only. One terminal command at a time. Files manually placed — git commands only. Present full plan before writing any code.

---

## Opening prompt — Merchant-Sats-B (Opus — uncounted)

**Attach:** `Refueler_MasterContext_IO_CC83.md`, `SESSIONS-refueler-io-CC83.md`, `REFUELER-BRIDGE.md`

Merchant-Sats-B open. Rewards backend design — Blink float mechanics, Cashu stamp lifecycle, commission schema, Block 8 pre-requisites. Opus — uncounted.

**Baseline:** ADR-MS-1 through ADR-MS-10 are locked (Merchant-Sats-A). Read MasterContext in full before starting. All design here must be consistent with ADR-MS-1 (Refueler never in the payment flow) and ADR-MS-2 (commission = attributed orders only, real-time fiat off-session Stripe charge).

**Scope in priority order:**

1. **Blink float mechanics:**
   - What is the float actually for? (Refueler's own sats revenue — Share Lightning payments, Legend subscriptions — not consumer funds in transit)
   - Pre-load amount: what figure, how determined, how topped up
   - Low-water mark threshold: what monitoring data from Q1 informs the decision, what the alert looks like (dev console tile + email)
   - Top-up flow: manual Rajesh action or automated
   - Webhook chain for sats reward payout: on Lightning settlement confirmation, what fires, in what order

2. **Reward choice flow:**
   - When and how is the choice presented in the app (sats vs stamp — not both, customer selects)
   - What if the customer has no Lightning wallet? What if they decline both? What if the connection fails during reward payout?
   - What does the merchant see (if anything) when a reward is issued?
   - Edge case: customer selects sats reward but the float hits zero mid-payout

3. **Cashu stamp lifecycle:**
   - Mint issues stamp → customer holds in app → stamp redeemed at venue
   - What happens in the DB at each stage
   - What the merchant sees on the tablet
   - What prevents double-spend (NUT-07 state check is the mechanism — confirm)
   - Which NUTs are in scope for Block 8 vs later:
     - Block 8: NUT-00 (blind auth), NUT-07 (state check)
     - Later: NUT-11 (P2PK binding if stamps are customer-identity-linked), NUT-13+09 (deterministic restore), NUT-14 (HTLC for receiver-pays)

4. **Commission tracking schema:**
   - DB schema for recording GBP-equivalent at time of payment (`sats_rate` already exists in `orders` — confirm it's sufficient or extend)
   - Walk-in flow commission trigger event: for Flows 3 and 4 (app walk-in, fiat and Lightning), no payment event is visible to Refueler — define what event creates the commission liability and how it's recorded (staff confirmation action? App order-complete event?)
   - Off-session Stripe charge mechanics: stored PaymentMethod on `merchant_users` or separate `merchant_billing` table? Retry logic on failure?

5. **Stripe integration shape:**
   - Where is the merchant's stored card held (Stripe Customer object, Stripe-side — Refueler stores only `stripe_customer_id`)
   - Webhook chain: Lightning settlement → `blink-webhook` fires → what edge function or pg_cron job triggers the Stripe charge?
   - How fiat walk-in commission (Flow 3) is captured in real-time vs reconciled later

6. **Block 8 schema pre-requisite list:**
   - Every table addition or column addition needed before the first Block 8 counted session opens
   - Flag any RLS implications

**Output:** Reward flow spec, Cashu stamp lifecycle spec (with NUT selection), commission tracking schema, Stripe integration shape, walk-in commission trigger decision, Block 8 pre-requisite migration list. Updated MasterContext and SESSIONS.

---

## Opening prompt — Onboarding-A (Opus — uncounted)

**Attach:** `Refueler_MasterContext_IO_CC83.md`, `SESSIONS-refueler-io-CC83.md`, `REFUELER-BRIDGE.md`

Onboarding-A open. Merchant onboarding flow design + printed handover document. Opus — uncounted.

**Scope:**
1. Self-service onboarding flow — magic-link invite → command-centre → first-run venue confirmation → PIN setup → "Accepting orders" activation. Map every screen state and edge case.
2. PIN self-service UX — how an owner sets and resets staff/owner PINs without Rajesh touching the database. RLS consequences (scoped write path to `merchant_users` PIN columns) — flag design constraints for CC-84.
3. Branded magic-link email — content and layout outline only. Suave, discreet, on-brand. Build is CC-85.
4. Printed handover document — format (A5 or A4, stock, feel), audience split (floor manager / owner / regional manager), full content outline. "Accepting orders" toggle default-off is a critical training item.

**Timebox printed document work to 40% of session time.** Flow design and PIN self-service UX unblock CC-84.

**Output:** Flow diagram or structured description, PIN self-service UX spec, email outline, printed document content outline and structure.

---

*"Nothing stops this train."*
