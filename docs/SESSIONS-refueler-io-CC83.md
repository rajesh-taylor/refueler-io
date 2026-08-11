# SESSIONS — refueler-io
*Canonical session log for `rajesh-taylor/refueler-io`.*
*Last updated: Block-5 Review · 2026-08-11 (Opus uncounted — sim discipline locked, AD-1 complete, AD-2 added, S-13 deleted, Block 8 promoted, session allocation confirmed 550)*

---

## Session allocation

Primary: 500 · Buffer: 50 · Total: 550
Planning/Opus sessions: uncounted. Buffer untouchable until a block overruns.
**Block review sessions** — standing uncounted Opus at end of each block. Recalibrate priorities and allocation.

Sessions used to Block-5 Review: ~83 counted + uncounted planning sessions.

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

### Block-5 Review — date: 2026-08-11
**Scope:** Planning and recalibration. Opus — uncounted.
**No commits this session.**

**Decisions locked:**

- **Session allocation confirmed:** 550 total (500 primary + 50 buffer). 125 was stale project-instruction figure — corrected.
- **Block 5 split into CC-83, CC-84, CC-85.** CC-84 carries onboarding flow build + PIN self-service (with its own RLS design); CC-85 carries branded magic link email + first full sim run.
- **Block 8 promoted** above Blocks 6 and 7 (both non-gating infrastructure). New post-Block-5 order: Block 8 → Pass-A/B → Block 9 → Block 6/7.
- **Simulation discipline locked.** No real merchant clients until all four sim stages pass Sim-Close review. Raj's Steakhouse is the primary sim entity.
- **Four sim stages defined:** Stage 1 (tablet fully wired, order correction + refunds), Stage 2 (franchise screen wired, independent→franchise migration), Stage 3 (node settlement — B9-gated, deferred), Stage 4 (training document in hand). Sim-Close = up to two Opus sessions formally signing off all stages.
- **Order correction and refunds** added to Sim Stage 1 scope — wrong drink/size correction flow, refund DB repercussions, financial screen consequences.
- **AD-1 complete.** Share admin dashboard migration to `refueler.io/share/admin/dashboard` is done. Left-hand panel wiring and card drill-downs are a separate build item — **AD-2** added to session queue.
- **S-13 deleted.** `independent_owner@rajeshtaylor.com` orphan row (no venue_id) to be removed in CC-83 migration. New independent owner sim accounts created only when a venue is attached.
- **Onboarding-B marker added** — placeholder Opus session for printed handover doc if it gets timeboxed out of Onboarding-A. May not be needed.
- **Sim-Close** added as standing up-to-two Opus uncounted session(s) gating real merchant go-live.
- **Lightning node clarification locked:** Stage 3 node is for self-custodial consumer payment settlement (replacing Blink custodial). Merchant commission arrives in fiat (GBP). Merchant sats-withdrawal is a separate product decision downstream of Block 8. The Stage 3 node is the same node Legend depends on.
- **S-1 (PIN flash fix):** Formally queued — bundle into CC-83 if room, else standalone counted session.
- **"Accepting orders" toggle** default-off training implication confirmed as Onboarding-A document item and Stage 1 evaluation criterion.

---

### CC-82 — date: 2026-08-10
**Scope:** Block 5 — Merchant onboarding flow (pre-work + test environment + E2E). Counted.
**Commits:** `cac6f38` (pre-work paths) · `b981ffb` (PIN flash fix)

**Pre-work fixes (cac6f38):**
- `src/command-centre/index.html` — ROLE_DESTINATIONS updated to Eleventy paths: merchant/franchise_branch/independent_owner → `/merchant/`, franchise_hq → `/franchise/`, admin → `/dev/`, investor → `/investor/`. Role lookup changed from `.eq('email', userEmail)` to `.eq('user_id', session.user.id)` — email lookup deprecated.
- `src/merchant/merchant-tablet-logic.js` — `emailRedirectTo` updated from `/merchant-tablet.html` → `/merchant/`. Both `ownerSignOut()` and `signOut()` redirect updated from `command-centre.html` → `/command-centre/`.

**PIN flash fix (b981ffb):**
- `src/merchant/index.html` — all tablet UI (btn-back-queue, nav, app div) wrapped in `<div id="tablet-ui" style="display:none;">`. Three ⚡ emoji removed from wordmark instances (queue empty-state icon retained).
- `src/merchant/merchant-tablet-logic.js` — `onStaffAuthenticated()` sets `tablet-ui` display to `''`. Both sign-out functions set it to `none`.
- Known residual flash (~1 frame) — S-1, deferred.

**DB migrations:**
- `block5_test_venue` — Raj's Steakhouse: merchant_id `rajs-steakhouse`, 10 Trinity Square, London EC3N 4AJ, active, independent, contact_email steakhouse@rajeshtaylor.com. ID: `c476df85-5572-49bd-a476-a908519a9a23`
- `block5_steakhouse_merchant_user` — merchant_users: user_id `4153cee2-15af-4b14-bdb7-4f4465458017`, email steakhouse@rajeshtaylor.com, role `independent_owner`, venue_id `c476df85`
- `block5_steakhouse_pins` — staff_pin_hash (SHA-256: 1234), owner_pin_hash (SHA-256: 8888)

**E2E verified:**
- ✅ Command-centre → INDEPENDENT OWNER chip → redirects to /merchant/
- ✅ PIN gate visible on load, tablet UI hidden behind it
- ✅ Staff PIN 1234 → order queue, Darwin live, Fenchurch St Line, bridge connected
- ✅ OPS view — Accepting orders toggle + Pause new orders toggle both work
- ✅ Owner PIN 8888 → Owner View, KPI strip
- ✅ Paper/Carbon toggle working in all views
- ✅ STEAKHOUSE badge in nav

---

### CC-81 — date: 2026-08-10
**Scope:** Block 3 — Franchise dashboard. Counted.
**Commits:** `cd9c288` · `4f343d8` · `b891e83` · `f7b7260` · `9dcc2ad`

Migrations: `franchise_dashboard_summary` SECURITY DEFINER RPC · `venue_partners_franchise_hq_update` RLS policy · `franchise_hq_venue_update_guard` BEFORE UPDATE trigger.

Key changes: All five operator tools moved from repo root → `src/[slug]/index.html` (Eleventy). Franchise dashboard: single RPC data layer, topbar controls, sidebar reorder, franchise group name, cross-browser magic link auth (hash token exchange). moniker@rajeshtaylor.com updated to franchise_hq.

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

6. **S-13 cleanup:** Delete `independent_owner@rajeshtaylor.com` row from `merchant_users` via `apply_migration` (DDL rule applies — use migration not raw execute_sql for data changes).

7. **S-1 (PIN flash):** If time permits — inline gate CSS in `<head>` of `src/merchant/index.html`: auth-gate and PIN-gate divs get `position:fixed; inset:0; z-index:9999; background:var(--bg)` in a `<style>` block before any external stylesheet loads. If session runs long, defer to standalone.

8. **MasterContext + SESSIONS + BRIDGE update** at close.

Standing rules: Read live files from GitHub before touching anything. DDL via `apply_migration` only. `execute_sql` read-only. One terminal command at a time. Files manually placed — git commands only. Present full plan before writing any code.

---

## Opening prompt — Onboarding-A (Opus — uncounted)

**Attach:** `Refueler_MasterContext_IO_CC83.md`, `SESSIONS-refueler-io-CC83.md`, `REFUELER-BRIDGE.md`

Onboarding-A open. Merchant onboarding flow design + printed handover document. Opus — uncounted.

**Scope:**
1. Self-service onboarding flow — the path from "merchant has agreed" to "tablet is live in the venue." Magic-link invite → command-centre → first-run venue confirmation → PIN setup → "Accepting orders" activation. Map every screen state and edge case.
2. PIN self-service UX — how an owner sets and resets staff/owner PINs without Rajesh touching the database. This has RLS consequences (scoped write path to `merchant_users` PIN columns) — flag the design constraints for CC-84 build.
3. Branded magic-link email — content and layout outline only. Suave, discreet, on-brand. Not a bare Supabase template. Build is CC-85.
4. Printed handover document — format (A5 or A4, stock, feel), audience split (floor manager / owner / regional manager), and full content outline. Content includes: what the tablet does, daily open/close ritual, "Accepting orders" toggle (must be turned on at shift start — default is off), staff PIN vs owner PIN, who to call. Research and print-spec sourced by Rajesh — this session produces the content and structure only.

**Timebox the printed document work to 40% of session time.** Flow design and PIN self-service UX are the items that unblock CC-84.

**Output:** Flow diagram (or structured description), PIN self-service UX spec, email outline, printed document content outline and structure.

---

*"Nothing stops this train."*
