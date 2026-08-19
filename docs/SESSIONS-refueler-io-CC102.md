# SESSIONS — refueler-io
*Last updated: CC-102 · 2026-08-19 (numo-fork build fix attempt — resource linking errors resolved to S-NumoC-2. CC-102 Owner tab enrichment not yet started. Sonnet counted.)*

---

## Session allocation

Primary: 500 · Buffer: 50 · Total: 550
Planning/Opus sessions: uncounted. Buffer untouchable until a block overruns.

Sessions used to CC-102: ~98 counted + uncounted planning sessions.

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
| **Block 5** | Merchant onboarding + simulation discipline | ✅ Block-5 Close |
| **Sim-Close** | Formal simulation sign-off | ✅ DECLARED COMPLETE 2026-08-17 |
| **Hardening-A** | Supabase-wide security hardening | ✅ CC-94 |
| **TDP-A** | Terminal audit + design philosophy framing | ✅ CC-95 |
| **TDP-philosophy** | Terminal design philosophy deep-dive | ✅ CC-96 |
| **TDP-B** | Terminal redesign execution | ✅ CC-97 |
| **TDP-C** | `update-lightning-address` EF + NumoPay alignment | ✅ CC-98 |
| **NumoPay-A** | Fork architecture decisions record | ✅ CC-99 |
| **NumoPay-B** | Auth scaffold, CDK removal, theming | ✅ CC-100 |
| **NumoPay-C** | Catalogue, payment flows, history, strings | ✅ CC-101 |
| **CC-102** | numo-fork build fix (S-NumoC-2) — partial | 🔴 Blocked |
| **CC-103 / Owner tab enrichment** | Darwin RLS fix + all-time stats + last order + venue status toggle + Darwin/fixtures toggle | 🟡 Next |
| **Menu Management v1** | Menu-item DDL, CSV import, terminal UI | 🟡 After CC-103 |
| **Block 8** | Fiat → sats rewards | 🟡 After Menu Management v1 |
| Pass-A/B | Pass planning sessions | 🟡 After CC-103 |
| Block 9 | LNBits integration | ⚪ Deferred post Block 8 |

---

## CSS rationalisation track — complete

CSS-1 through CSS-7b all closed.

---

## Session log

### CC-102 — date: 2026-08-19
**Type:** Sonnet counted. **Status: BLOCKED on S-NumoC-2.**

**Objective:** Confirm numo-fork BUILD SUCCESSFUL, then execute Owner tab enrichment (Items 0–4).

**Build fix work completed (numo-fork commits on main):**

| Commit | What |
|---|---|
| `9cf1eab` | fix: add missing numo color aliases and Widget.Numo.BottomSheet style |
| `d763c80` | fix: remove orphaned withdraw_melt_quote layout (Cashu activity deleted NumoPay-B) |
| `5818058` | fix: add color_primary alias to satisfy legacy drawable and layout refs |
| `b31f8af` | fix: remove duplicate color_primary_purple |
| `7e18337` | fix: remove values-night/themes.xml — Carbon always-on, no night mode toggle |
| `a830b22` | fix: add Theme.Numo dot-notation aliases and Theme_Numo_BottomSheet |
| `ad5405e` | fix: rewrite themes.xml — remove all duplicates, single clean alias block |

**Current build state:** `parseDebugLocalResources FAILED` — `Duplicate symbol 'Theme_Numo'`.
- Source files: ONE definition at `values/themes.xml:112`. Clean.
- Merged `packaged_res/debug/packageDebugResources/values/values.xml`: ONE entry. Clean.
- `~/.gradle/caches/modules-*/`: no `Theme_Numo` found.
- Gradle transform cache (`~/.gradle/caches/transforms-*`) not yet cleared — **this is the most likely remaining cause.**
- `app/build` deleted. `build-cache-*` deleted. Still failing.

**S-NumoC-2 — first action of CC-103:**
```bash
cd /Users/rajeshtaylor/Documents/refueler.io/terminals/numo-fork && rm -rf ~/.gradle/caches/transforms-* && rm -rf app/build && ./gradlew assembleDebug 2>&1 | tail -5
```
If still failing after that: rename `Theme_Numo` alias in `themes.xml` to `Theme_NumoPay` (avoids any residual conflict), update the three referencing Kotlin files, commit, rebuild.

**Owner tab enrichment (Items 0–4) — NOT STARTED. Full scope deferred to CC-103.**

---

### Darwin/Supabase diagnosis completed this session (do not repeat):

**Root cause of Darwin strip showing `—`:**
- `rail_signal_current` has RLS with `authenticated`-only SELECT. No `anon` policy.
- `pollDarwin()` fallback sends anon key when session token absent → empty result → offline branch → `—`.
- Live data confirmed present and current: 8 uncancelled services, `atd` values populated today.
- JS field mapping (`s.etd || s.atd || s.std`) is correct — not the bug.
- Fix: add anon SELECT policy via `apply_migration`.

**Session split decision:** Items 0–4 are all executable in ONE session (CC-103). They are:
- Item 0: one `apply_migration` call (anon SELECT on `rail_signal_current`)
- Items 1–4: JS + HTML edits to `merchant-tablet-logic.js` and `index.html`

All five items touch the same two files plus one migration. One session is correct. Do NOT split.

**CC-103 must NOT read Darwin data or diagnose the RLS issue again** — it is fully diagnosed. Go straight to the migration and code.

---

### CC-101 — date: 2026-08-19
**Type:** Sonnet counted (NumoPay-C). **CLOSED.** Commit `def2883`.

### CC-100 — date: 2026-08-19
**Type:** Sonnet counted (NumoPay-B). **CLOSED.** Commit `8b217d1`.

### CC-99 — date: 2026-08-18
**Type:** Opus uncounted (NumoPay-A). **CLOSED.**

---

## Session queue — forward plan

| # | Session | Scope | Type | Status |
|---|---|---|---|---|
| 1 | **CC-103 (part A) — numo build fix** | Clear transforms cache OR rename `Theme_Numo` alias → confirm BUILD SUCCESSFUL → run on Pixel 9a | Sonnet counted | **Next — do first** |
| 2 | **CC-103 (part B) — Owner tab enrichment** | Items 0–4 all in one pass (see opening prompt below) | Sonnet counted | Same session as part A if build clears quickly |
| 3 | **Menu Management v1** | `merchant_menu_items` DDL · CSV import · terminal UI | Sonnet counted | After CC-103 |
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

---

## Opening prompt for CC-103

```
CC-103 — numo-fork build fix + Owner tab enrichment (Items 0–4)
Type: Sonnet counted
Context files: refueler-io/docs/MasterContext_IO_CC102.md · SESSIONS-refueler-io-CC102.md

PART A — BUILD FIX (do first, before any other work)

numo-fork is at commit ad5405e on main. Build is failing:
  parseDebugLocalResources FAILED — Duplicate symbol 'Theme_Numo'

Source is clean (one definition). Gradle transforms cache not yet cleared.

Step 1 — clear transforms cache and rebuild:
  cd /Users/rajeshtaylor/Documents/refueler.io/terminals/numo-fork && rm -rf ~/.gradle/caches/transforms-* && rm -rf app/build && ./gradlew assembleDebug 2>&1 | tail -5

If BUILD SUCCESSFUL → run on Pixel 9a (USB debugging on). Confirm RefuelerAuthActivity launches.

If still failing → rename the alias in themes.xml from Theme_Numo to Theme_NumoPay,
grep for all Kotlin files referencing R.style.Theme_Numo and update them, commit, rebuild.
Do NOT spend more than 2 prompts on the build fix before escalating the rename approach.

PART B — OWNER TAB ENRICHMENT (only after BUILD SUCCESSFUL confirmed)

All 5 items in one pass. Read live merchant-tablet-logic.js and index.html from GitHub first.
Do NOT re-diagnose Darwin — it is fully diagnosed (see MasterContext S-Darwin section).

Item 0 — Supabase migration (apply_migration, not execute_sql):
  Add anon SELECT policy on rail_signal_current.
  Name: cc103_rail_signal_anon_read
  SQL: CREATE POLICY "anon can read rail_signal_current"
       ON rail_signal_current FOR SELECT TO anon USING (true);
  Verify immediately with execute_sql checking pg_policies.

Item 1 — All-time stats row in Owner tab:
  Two new stat cards below existing today-row: total orders (all time) and
  total sats received (all time). Query merchant_orders WHERE venue_id,
  status IN ('confirmed','fulfilled'). New DOM ids: owner-stat-alltime-orders,
  owner-stat-alltime-sats. Load in loadOwnerStats() alongside today stats.

Item 2 — Last order timestamp:
  One line under stats grid: "Last order: HH:MM" or "DD Mon" if not today.
  Query: SELECT created_at FROM merchant_orders WHERE venue_id = ?
  ORDER BY created_at DESC LIMIT 1.
  DOM id: owner-last-order-ts.

Item 3 — Venue status toggle (active/paused):
  New owner-section. Toggle calls authenticated PostgREST PATCH on
  venue_partners SET active = true/false WHERE id = venue_id.
  S-27 grants authenticated UPDATE on active column — no new EF needed.
  Reflect current state on load. DOM id: owner-venue-status-toggle.

Item 4 — Darwin/fixtures UI toggle:
  New owner-section. Labelled toggle: "Show arrival strip".
  Persists to localStorage key refueler_horizon_visible.
  On hide: sets #horizon-band and #owner-horizon-band display:none,
  clears _darwinTimer. On show: restores display, restarts timer, calls pollDarwin().
  Default: visible (true). DOM id: owner-horizon-toggle.

After all items: present updated merchant-tablet-logic.js and index.html.
Commit message: "feat: Owner tab enrichment — all-time stats, last order,
venue status toggle, Darwin toggle, Darwin RLS fix (CC-103)"
```
