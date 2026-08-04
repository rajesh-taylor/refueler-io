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
| Block 3 | Franchise dashboard completion | 🟡 Next after CC-75 |
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
**Scope:** AP-9 — global.css migration completion. Theme carry fix across all nav pages. Legend white-in-Paper fix. Carbon background standardisation to #1A1A1A.

**Shipped:**

**Item 1 — legend.css stripped to layout only (commit 32ccb92):**
- All `:root` token blocks removed — were overriding `global.css` and setting `--bg: #F7F4EF` (wrong colour, wrong pattern)
- Full reset and `html, body` block removed — global.css owns these
- Retained: Legend-specific layout classes, `--border-mid`, `--inset-rule`, font aliases
- Carbon override uses `[data-theme="carbon"]` only

**Item 2 — Page CSS extracted to external files (commit 32ccb92):**
- `src/assets/css/editorial.css` — new file, all editorial index layout
- `src/assets/css/support.css` — new file, all support page layout
- `src/assets/css/privacy.css` — new file, all privacy policy layout
- `editorial/index.njk`, `support/index.njk`, `privacy/index.njk` — inline `<style>` blocks and body-level `<script>` theme blocks stripped entirely
- Each page now: `{% include "head.njk" %}` + one `<link>` to its page CSS + nothing else

**Item 3 — Body theme scripts stripped (commit 32ccb92):**
- `editorial/index.njk`, `privacy/index.njk`, `support/index.njk` all had duplicate `<script>` theme blocks at bottom of `<body>`. Removed from all three. `head.njk` is the single theme script owner on the main domain.

**Item 4 — notes.js theme migrated to rs-theme cookie (commit 09ee8ee):**
- `localStorage` + `rfTheme` → `rs-theme` cookie, `.refueler.io` scoped
- `const` → `var` throughout (matches rest of codebase)
- Modal logic unchanged

**Item 5 — Carbon background standardised to #1A1A1A (commits 64172e6, b19530c, 5d0e832):**
- `src/notes/notes.css` — `#1E1F22` → `#1A1A1A` (two occurrences: `--carbon` and `--bg` in Carbon block)
- `docs/REFUELER-BRIDGE.md` — Carbon `--bg` token updated
- `REFUELER-BRIDGE.md` in `refueler-share` — same
- `REFUELER-BRIDGE.md` in `refueler-legend` — same

**Item 6 — upgrade.css carbon-mode selector fixed (commit 0f09d62 on refueler-share):**
- `html.carbon-mode` → `[data-theme="carbon"]`

**Item 7 — Share frontend/index.html theme unified (commit 7f6b0ff on refueler-share):**
- Three conflicting theme scripts replaced with one clean rs-theme cookie script
- Inline `<style>` Carbon selector: `html.carbon-mode` → `[data-theme="carbon"]`
- Wordmark `href` fixed: `https://refueler.io/` → `/` (stays on share.refueler.io)

**Item 8 — Share nav.njk wordmark href fixed (commit 7f6b0ff on refueler-share):**
- Eleventy-built pages (upgrade, status) wordmark now stays on share.refueler.io

**Item 9 — Backdrop-filter removed (global.css):**
- `backdrop-filter: blur(16px)` and `-webkit-backdrop-filter: blur(16px)` removed
- `--nav-bg` made solid: `#F5F0E8` Paper, `#1A1A1A` Carbon
- No frosted glass on any Refueler surface — locked permanently

**Item 10 — Legend credential dot green (legend.css):**
- `.legend-cred-icon` background: `var(--accent)` → `#1E8A4A`
- Gold indicates earned/premium; green indicates operational status

**Item 11 — Notes card border-only in Carbon (notes.css):**
- `[data-theme="carbon"] .note-card` — `background: transparent`
- `[data-theme="carbon"] .note-card:hover` — `background: transparent`, border lifts to `var(--border-mid)`
- Paper retains `var(--surface)` tint — correct for light mode
- Matches Editorial typographic treatment in dark mode

**Carry-forward → CC-75 (Share CSS architecture):**
- Share theme toggle still not working on `upgrade.html` and `status.html` — root cause: those pages do not load `share-tokens.css`. `upgrade.njk` loads only `upgrade.css`; `status.njk` has an inline `<style>` block. Neither has the token definitions needed for `[data-theme="carbon"]` to take effect.
- `frontend/index.html` still has a large inline `<style>` block — should be extracted to `share-tokens.css` and linked externally, same pattern as `global.css` on the main site.
- Rule to lock in CC-75: `share-tokens.css` must be loaded via `head.njk` on every Eleventy Share page, and linked in `frontend/index.html`. No Share page may define its own `:root` token block.

---

### CC-73 — date: 2026-08-04
**Scope:** AP-8 — nav/theme/support fixes across `refueler-io` and `refueler-share`. Bridge v1.4 distributed. Repo rename confirmed.

**Shipped:** (see SESSIONS-refueler-io-CC74.md for full log)

---

### CC-72 — date: 2026-08-04
**Scope:** Infrastructure housekeeping — global CSS extraction, theme fix, API key rotation, Cloudflare build fix, /legend/ routing fix. Commit `49e3551`, `f968b8e`, `5dd3001`, `a5e4eb5`, `562166c`.

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

## Complete session plan — remaining work

### CC-75 — Share CSS architecture (dedicated session)
**Goal:** Single token source for all Share pages. Same pattern as global.css on main site.

**Work:**
1. Move all token definitions from `frontend/index.html` inline `<style>` into `share-tokens.css`
2. Load `share-tokens.css` via `head.njk` `<link>` on every Eleventy Share page
3. Link `share-tokens.css` from `frontend/index.html` as external file, remove inline `<style>` block
4. Strip `upgrade.css` `:root` token block — page-specific layout only
5. Strip `status.njk` inline `<style>` token block — extract to `status.css`
6. Verify theme toggle works on all three pages: index, upgrade, status
7. Lock rule: no Share page may define its own `:root` token block

### Block 3 — Franchise dashboard completion (5–8 sessions)
After CC-75.

### Block 5 — Merchant onboarding flow (8–12 sessions)

### Block 8 — Fiat → sats rewards
Gate: Block 5 live.

### Ongoing / bundled
- Strip inline `<style>` from `src/index.njk`
- New Anthropic API key for csuite briefing
- `car_park_occupancy` strip from FEEDS array
- `blink-webhook_index.ts` delete or replace with v12 source
- `bsc-dev` Dev Test item remove before TestFlight
- `Costa Coffee HQ` category label fix
- GitHub Actions red X on `9b9655d`
- LNBits webhook payload shape confirm with Ben Arc
- Remaining hygiene folders: `06_Benchmarks`, `07_App_Specs`, `C-Suite`, `Session prompts`, `UK Banks`

---

*"Nothing stops this train."*
