# SESSIONS — refueler-io
*Last updated: CC-103 · 2026-08-20 (numo-fork build fix closed. Darwin RLS applied. Owner tab enrichment complete. All items 0–4 done.)*

---

## Session allocation

Primary: 500 · Buffer: 50 · Total: 550
Planning/Opus sessions: uncounted. Buffer untouchable until a block overruns.

Sessions used to CC-103: ~99 counted + uncounted planning sessions.

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
| **CC-102** | numo-fork build fix attempt (partial) | ✅ Superseded by CC-103 |
| **CC-103** | numo-fork build fix + Darwin RLS + Owner tab enrichment | ✅ CLOSED |
| **CC-104 — Menu Management v1** | `merchant_menu_items` DDL · CSV import · terminal UI | 🟡 Next |
| **Block 8** | Fiat → sats rewards | 🟡 After Menu Management v1 |
| Pass-A/B | Pass planning sessions | 🟡 After CC-104 |
| Block 9 | LNBits integration | ⚪ Deferred post Block 8 |

---

## CSS rationalisation track — complete

CSS-1 through CSS-7b all closed.

---

## Session log

### CC-103 — date: 2026-08-20
**Type:** Sonnet counted. **Status: ✅ CLOSED.**

**Commits:**
| Repo | Commit | What |
|---|---|---|
| `numo-fork` | `54b15de` | fix: resolve Theme_Numo symbol collision — dot-notation aliases only, no underscore duplicates |
| `refueler-io` | `9a2ea73` | feat: Owner tab enrichment — all-time stats, last order, venue status toggle, Darwin toggle, Darwin RLS fix |
| `refueler-io` | `01cebc2` | feat: Owner tab enrichment CSS — toggle, all-time stats, last order |

**Part A — Build fix:**
- Root cause: `values/themes.xml` had both `<style name="Theme.Numo">` (dot-notation) and `<style name="Theme_Numo">` (underscore-notation) — Android's ResourceValuesXmlParser treats these as the same symbol, raises duplicate error.
- Fix: dot-notation aliases only in `values/themes.xml`. Kotlin `R.style.Theme_Numo` resolves to `Theme.Numo` automatically.
- Confirmed BUILD SUCCESSFUL. Installed on Pixel 9a — `RefuelerAuthActivity` launches correctly.

**Part B — Owner tab enrichment:**
- Item 0: Migration `cc103_rail_signal_anon_read` — anon SELECT on `rail_signal_current`. S-Darwin closed.
- Item 1: All-time stats row — total orders + total sats (status IN confirmed/fulfilled).
- Item 2: Last order timestamp — "Last order: HH:MM" or "DD Mon".
- Item 3: Venue status toggle — authenticated PostgREST PATCH on `venue_partners.active`. No new EF needed (S-27 grants already in place).
- Item 4: Darwin/fixtures toggle — `localStorage` key `refueler_horizon_visible`. Stops/starts `_darwinTimer`. `initHorizonToggle()` called from `onStaffAuthenticated()`.

**Pending (non-blocking):**
- `values-v31/themes.xml` + `values-night-v31/themes.xml` reference `@color/numo_navy` — clean up at next numo-fork session (S-numo-v31).

---

### CC-102 — date: 2026-08-19
**Type:** Sonnet counted. **Status: ✅ Superseded by CC-103.**
Build fix attempt — resolved resource linking errors but `Theme_Numo` symbol collision remained. Owner tab enrichment not started.

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

---

## Opening prompt for CC-104

```
CC-104 — Menu Management v1
Type: Sonnet counted
Context files: refueler-io/docs/MasterContext_IO_CC103.md · SESSIONS-refueler-io-CC103.md

Scope: merchant_menu_items — DDL, CSV import path, terminal UI integration.

Read MasterContext in full before starting.
numo-fork is green at 54b15de — no build work this session.
Present full plan before writing any code.

Key constraints:
- All DDL via apply_migration only
- merchant_menu_items is read-only on floor device (NumoPay) — write side is terminal only
- Menu items need: id, venue_id, name, description, price_gbp, category, available (bool), position (int)
- CSV import: owner uploads CSV via terminal Owner tab — parse client-side, POST to Supabase via service_role EF or direct insert
- Terminal UI: item list grouped by category, available toggle per item, drag-to-reorder deferred
- NumoPay reads merchant_menu_items via PostgREST (already wired in NumoPay-C catalogue screen)
```
