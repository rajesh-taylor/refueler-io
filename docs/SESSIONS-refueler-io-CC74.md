# SESSIONS — refueler-io
*Canonical session log for `rajesh-taylor/refueler-io`.*
*Each entry: session ID · date · what shipped · carry-forward.*
*Last updated: CC-74 · 2026-08-04*

---

## Session allocation

Primary: 100 · Buffer: 25 · Total: 125
Planning sessions: uncounted by convention.
Buffer is untouchable until a block overruns.

---

## Block map

| Block | Scope | Status |
|---|---|---|
| Block 0 | Theme default fix, footer stamp, CC-25 banner removal, duplicate sessions query | ✅ Closed CC-65 (commit 2f5895d) |
| Block 1 | Schema hardening: RLS scoping, opsTogglePause write, PIN RLS verify | ✅ Closed CC-66 (commit d145e48) |
| Block 2 | Consumer app ↔ merchant tablet live connection | ✅ Closed CC-69 — all 8 steps E2E confirmed |
| Block 3 | Franchise dashboard completion | 🟡 Next after CC-74 |
| Block 4 | Dev console hardening + investor telemetry | ✅ Closed CC-65 |
| Block 5 | Merchant onboarding flow | 🟡 Queued |
| Block 6 | Darwin Push Port upgrade | ⚪ Deferred |
| Block 7 | Passenger count join (CC-48) | ⚪ Deferred |
| Block 8 | Fiat → sats rewards (pay by card, earn Bitcoin) | 🟡 Queued — high priority for traction |
| Block 9 | LNBits integration | ⚪ Deferred — post merchant onboarding |
| Block 10+ | Editorial, iOS/Android beta prep, Darwin bridge deploy, Ticketing MVP | ⚪ Future |

---

## Session log

### CC-74 — date: 2026-08-04
**Scope:** AP-9 — global.css migration completion. Theme carry fix across all nav pages. Legend white-in-Paper fix.

**Opening prompt for this session:**

*CC-74 — global.css migration completion. The goal is a single session that permanently ends per-page token drift: any new page added to refueler.io should need only `{% include "head.njk" %}` and a `<link>` to `global.css` — no per-page token work ever again.*

*Problem: `global.css` is the canonical token file but several pages still carry inline `<style>` blocks with their own `:root` definitions that override it. Legend is showing white in Paper mode despite a clean `legend.css` — suspect `global.css` isn't resolving at `/assets/css/global.css` on that route, or a residual inline block is overriding `--bg`. Theme state is not carrying between nav page clicks on the main domain.*

*Work:*
*1. Confirm `global.css` is loading correctly on Legend — check the path resolves from `/legend/` via browser devtools network tab*
*2. Audit every page's inline `<style>` block — strip any `:root` token that duplicates `global.css`. Only page-specific layout tokens not in `global.css` may remain*
*3. Confirm theme cookie `rs-theme` is read on every page load via `head.njk` — no page should have its own theme script*
*4. Clean `upgrade.css` on Share — still has `html.carbon-mode` pattern*
*5. Verify Paper `#F5F0E8` consistent across all pages after deploy*

*Files to attach: `global.css`, `head.njk`, `legend.css`, `legend-index.njk` (rename `src/legend/index.njk` before attaching), `editorial-index.njk` (rename `src/editorial/index.njk`), `privacy-index.njk`, `support-index.njk`, `upgrade.css` (from refueler-share/frontend/). Also attach `SESSIONS-refueler-io-CC74.md` and `Refueler_MasterContext_IO_CC74.md`.*

*File naming rule: all `index.njk` files must be renamed with section prefix before attaching (e.g. `legend-index.njk`) to prevent upload collisions. Rename back to `index.njk` when placing in destination folder.*

**Shipped:** (to be filled at session close)

**Carry-forward:** (to be filled at session close)

---

### CC-73 — date: 2026-08-04
**Scope:** AP-8 — nav/theme/support fixes across `refueler-io` and `refueler-share`. Bridge v1.4 distributed. Repo rename confirmed.

**Shipped:**

**Item 1 — Main site `src/_includes/nav.njk` — wordmark breadcrumb fix:**
- `{{ wordmarkSection or "Legend" }}` default hardcoded "Legend" on every page omitting `wordmarkSection` frontmatter
- Fixed: breadcrumb section only renders when `wordmarkSection` explicitly set
- Commit `9f7f33d`

**Item 2 — Main site `src/support/index.njk` — email, copy, theme script:**
- `privacy@refueler.io` → `support@refueler.io` in all user-facing positions
- Inset blockquote and "What can I raise?" list items genericised across all Refueler products
- Inline theme script updated: `localStorage` + `classList.add('carbon-mode')` → `rs-theme` cookie + `dataset.theme`
- Commit `9f7f33d`

**Item 3 — Share `src/_includes/nav.njk` — new link set:**
- Removed: App, Editorial, Privacy
- Added: Notes (`refueler.io/notes/`), Support (`refueler.io/support/`)
- Kept: Upgrade, theme pill
- Commit `8a67ef0` on `refueler-share`

**Item 4 — Share `src/_includes/head.njk` — theme script migration:**
- `localStorage` + `rfTheme` removed; `rs-theme` cookie, `.refueler.io` scoped
- `dataset.theme` only — no `classList` pattern remaining
- Commit `8a67ef0` on `refueler-share`

**Item 5 — REFUELER-BRIDGE.md v1.4:**
- AP-8 session log added
- `refueler-multi-core` removed, `refueler-legend` added
- Committed to `refueler-share` (a13fd37), `refueler-io` docs/ (62ffd2c), `refueler-legend` (5099206)

**Item 6 — `refueler-multi-core` → `refueler-legend` rename confirmed**

**Carry-forward:** (absorbed into CC-74)

---

### CC-72 (AP-7 follow-up) — date: 2026-08-04
**Scope:** AP-9 — Paper colour canonical fix + global.css migration partial. Theme script cleanup.

**Shipped:**

**Item 1 — Paper colour `#F5F0E8` canonical (commits `9b1d672`, `91535f5`):**
- `src/editorial/index.njk` — `#F7F4EF` → `#F5F0E8`; old `rfTheme`/`localStorage`/`carbon-mode` theme script replaced with clean rs-theme cookie pattern
- `src/privacy/index.njk` — same fixes
- `src/support/index.njk` — `#F7F4EF` → `#F5F0E8` (theme script already clean from CC-73)
- `src/notes/notes.css` — `#F7F4EF` → `#F5F0E8` (commit `91535f5` after path fix)
- `src/assets/css/legend.css` — stripped all tokens duplicating `global.css`; kept only `--border-mid`, `--inset-rule`, font aliases; Carbon override uses `[data-theme="carbon"]`
- `src/_includes/nav.njk` — Share link added

**Item 2 — Share tokens extracted (commit `db227aa`):**
- `frontend/share-tokens.css` — new file; all tokens, reset, nav, footer, components extracted from `index.html` inline `<style>` block; `html.carbon-mode` → `[data-theme="carbon"]`
- `frontend/index.html` — inline `<style>` block removed; both old theme scripts removed; single clean theme script (rs-theme cookie); `<link>` to `share-tokens.css` added; nav updated (Notes/Upgrade/Support)

**Outstanding after deploy:**
- Legend still white in Paper mode — carry to CC-74
- Theme not carrying between main domain nav pages — carry to CC-74
- `upgrade.css` on Share still has `html.carbon-mode` — carry to CC-74

**File naming convention locked:** All `index.njk` files produced by Claude named with section prefix (e.g. `legend-index.njk`). Rajesh renames to `index.njk` on placement.

---

### CC-72 — date: 2026-08-04
**Scope:** Infrastructure housekeeping — global CSS extraction, theme fix, API key rotation, Cloudflare build fix, /legend/ routing fix.

**Shipped:**
- `src/assets/css/global.css` — new shared file (commit `49e3551`)
- `src/_includes/head.njk` — theme script to rs-theme cookie pattern
- `_redirects` SPA catch-all removed (commit `f968b8e`)
- Submodule registrations purged — `refueler-app` and `terminals/numo-fork` (commits `5dd3001`, `a5e4eb5`)
- Cloudflare build command updated to `npm install && npx eleventy`
- `refueler_csuite_briefing_v2_4.html` cleaned — API key replaced with placeholder (commit `562166c`)
- Result: `a5e4eb5` deployed successfully. `/legend/` routing fixed.

---

### CC-71 — date: 2026-07-29
**Scope:** Repo hygiene — pre-pivot file purge. ~15,000 deletions across 4 commits.

---

### CC-70 — date: 2026-07-25 (planning)
**Decisions:** Fiat→sats rewards primary traction lever (Block 8). LNBits deferred (Block 9). Ticketing proto-concept confirmed. VPS costed: Hetzner CX22 ~€4.50/month.

---

### CC-69 — date: 2026-07-20
**Scope:** Block 2 final close. NativeTabs routing incompatibility confirmed. Inline `setView('settled')` fix. Three-layer settlement detection locked.

---

### CC-68 — date: 2026-07-20
**Scope:** Blink API key rotation. blink-webhook v12. PreOrderScreen polling fallback.

---

### CC-67 — date: 2026-07-19
**Scope:** Block 2 E2E test. blink-webhook v10→v12. 7/8 steps confirmed.

---

### CC-66 Block 1 — date: 2026-07-16
**Scope:** Schema hardening — RLS, opsTogglePause, franchise-dashboard auth gate. Commit `d145e48`.

---

### CC-65 Block 4 — date: 2026-07-15
**Scope:** Dev console hardening + investor telemetry. `blink-webhook` v8, telemetry grid, `investor-snapshot.html`.

---

## Complete session plan — remaining work

### CC-74 — global.css migration completion
See opening prompt above. First action: browser devtools on Legend to confirm whether `global.css` loads. Then audit and strip all remaining inline `:root` blocks across the main domain. Clean `upgrade.css` on Share.

### Block 3 — Franchise dashboard completion (5–8 sessions)
1. Per-venue commission breakdown wired to real `orders` data scoped to `franchise_group_id`
2. Operator Controls: `toggleVenueActive` and `saveEmail` — verify RLS, implement writes
3. KPI strip: live order counts, revenue, commission

### Block 5 — Merchant onboarding flow (8–12 sessions)
1. Magic link sign-in → role assignment → PIN set → first login confirmed
2. `merchant_users` row creation provisioning mechanism
3. PIN set screen, staff PIN distribution, venue association confirmation

### Block 8 — Fiat → sats rewards (queued, high priority)
Gate: Block 5 must be live first.

### Block 9 — LNBits integration (deferred)
Gate: 1–2 merchants live and generating real volume.

### Ongoing / bundled
- Strip inline `<style>` from `src/index.njk` (safe, deferred)
- New Anthropic API key for csuite briefing
- `car_park_occupancy` strip from FEEDS array
- `blink-webhook_index.ts` delete or replace with v12 source
- `bsc-dev` Dev Test item remove before TestFlight
- `Costa Coffee HQ` category label fix
- GitHub Actions red X on `9b9655d`
- One Blink-to-Blink E2E test
- LNBits webhook payload shape confirm with Ben Arc
- `refueler_eta_widget.html`, `refueler_england_skin.html` review
- Remaining hygiene folders: `06_Benchmarks`, `07_App_Specs`, `C-Suite`, `Session prompts`, `UK Banks`

---

*"Nothing stops this train."*
