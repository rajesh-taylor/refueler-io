# SESSIONS — refueler-io
*Canonical session log for `rajesh-taylor/refueler-io`.*
*Last updated: M-2 · 2026-08-08 (M-2 closed — Share live at refueler.io/share/)*

---

## Session allocation

Primary: 100 · Buffer: 25 · Total: 125
Planning/Opus sessions: uncounted by convention.
Block M: 1 uncounted (M-1 ✅) + 2 counted (M-2 ✅, M-3 pending).
CSS rationalisation: 3 uncounted (CSS-1b, CSS-2, CSS-3) + 3 counted (CSS-4, CSS-5, CSS-6).
Buffer untouchable until a block overruns.

---

## Block map

| Block | Scope | Status |
|---|---|---|
| Block 0 | Theme default fix, footer stamp, CC-25 banner, duplicate sessions query | ✅ Closed CC-65 |
| Block 1 | Schema hardening: RLS, opsTogglePause, PIN RLS | ✅ Closed CC-66 |
| Block 2 | Consumer app ↔ merchant tablet live connection | ✅ Closed CC-69 |
| Block 4 | Dev console hardening + investor telemetry | ✅ Closed CC-65 |
| Block M | Share migration — `share.refueler.io` → `refueler.io/share/` | 🟡 M-2 closed — M-3 pending |
| Block 3 | Franchise dashboard | 🟡 After CSS track |
| Block 5 | Merchant onboarding flow | 🟡 Queued after Block 3 |
| Block 6 | Darwin Push Port upgrade | ⚪ Deferred |
| Block 7 | Passenger count join | ⚪ Deferred |
| Block 8 | Fiat → sats rewards | 🟡 Gated on Block 5 |
| Block 9 | LNBits integration | ⚪ Deferred post merchant onboarding |
| Block 10+ | iOS/Android beta prep, Darwin bridge, Ticketing MVP | ⚪ Future |

---

## CSS rationalisation track (runs after Block M)

| Session | Scope | Type | Status |
|---|---|---|---|
| CSS-1 | Design reference document — cross-reference all locked decisions | ✅ Closed — uncounted | |
| CSS-1a | Visual review + conflict resolution. All four conflicts settled | ✅ Closed — uncounted | |
| CSS-1b | Cross-product nav architecture — one domain, one nav system | Opus — uncounted | 🟡 After M-3 |
| CSS-2 | global.css full audit post-migration — all CSS files in context, findings only | Opus — uncounted | 🟡 After CSS-1b |
| CSS-3 | New CSS architecture blueprint — token naming, cascade, reset, page responsibilities | Opus — uncounted | 🟡 After CSS-2 |
| CSS-4 | Implement new global.css — `#E8E2D8`, surface tokens, input recess, `--inset-rule` fix, orange removal, share-tokens merge | Sonnet — counted | 🟡 After CSS-3 |
| CSS-5 | Full site verification — every page, every theme, every nav. Legend simplified. Fix anything. | Sonnet — counted | 🟡 After CSS-4 |
| CSS-6 | Page CSS rationalisation — `notes.css` and `legend.css` `:root` migration, `--text-*` → `--fg*`, strip `!important` | Sonnet — counted | 🟡 After CSS-5 |

---

## Session log

### M-2 — date: 2026-08-08
**Scope:** Share migration execution. Counted session.
**Type:** Counted.

**Commits:**
- `213798d` — Commit 1: Share pages migrated to `src/share/`, `eleventy.config.js` passthrough rules added, `stripeThemeRemount` ported to `head.njk`, assets and BLAKE3 copied
- `8abf0c5` — Commit 2: Share link added to main site nav, `_redirects` subdomain rule added
- `e577379` — Fix: restore main site `nav.njk` (accidentally overwritten during file placement), create `src/_includes/share-nav.njk` and `src/_includes/share-footer.njk`, fix Eleventy include paths in all three Share pages

**Worker:** `refueler-share` redeployed as version `af37c80b` — CORS `allowed` array updated to include `https://refueler.io` alongside existing `https://share.refueler.io` and `https://upgrade.refueler.io`.

**Cloudflare dashboard:**
- Turnstile: `refueler.io` confirmed present in allowed hostnames for sitekey `0x4AAAAAAD0N7GlHlCRuWITr`
- Worker CORS: updated and redeployed
- Pages: `refueler-io` build succeeded on `e577379`

**Status:** `refueler.io/share/`, `refueler.io/share/upgrade/`, `refueler.io/share/status/` all live and verified in Safari and Chrome. `share.refueler.io` still running — not retired until M-3 signs off.

**Issues found and fixed:**
- Eleventy `_includes` resolution: Share nav/footer placed as `src/share/_includes/` but Eleventy resolves includes relative to `src/_includes/` only. Fixed by moving to `src/_includes/share-nav.njk` and `src/_includes/share-footer.njk` and updating include statements in all three Share pages via `sed`.
- `nav.njk` overwritten: the downloaded `nav.njk` from the output bundle was the Share nav, not the main site nav. Restored main site nav via `cat > ...` in terminal.
- `src/share/_includes/` folder: never physically created during file placement — files weren't landing there. Resolved by writing directly to `src/_includes/` with `share-` prefix.

**Outstanding for M-3:**
- Stripe return URLs in Worker still point to `share.refueler.io/upgrade` (lines 1052, 1053, 1117 of `refueler-share/worker/src/index.js`)
- Plans nav link incorrectly shows as active on Share index page
- Full M-3 verification checklist below

---

### M-1 — date: 2026-08-08
**Scope:** Share migration planning. Live files read from `rajesh-taylor/refueler-share`. Complete migration plan produced.
**Type:** Planning — uncounted.

**Key findings from live files:**
- Three Eleventy pages: `index.njk` → `/`, `upgrade.njk` → `/upgrade.html`, `status.njk` → `/status.html`
- No `notes.njk` in Share — nav already links to `https://refueler.io/notes/` (absolute, correct)
- `WORKER_URL = 'https://refueler-share.rt-fc4.workers.dev'` hardcoded in `share.js` line 8, `upgrade.njk` inline JS (×2), `status.njk` inline JS — does not change post-migration
- CSS asset paths all root-relative — need path prefix update
- Turnstile sitekey `0x4AAAAAAD0N7GlHlCRuWITr` registered against `share.refueler.io` — add `refueler.io` to allowlist
- Theme cookie already scoped to `.refueler.io` — works at new path without change
- `stripeThemeRemount` Nunjucks flag in `upgrade.njk` — must be ported into main `head.njk`
- BLAKE3 WASM in `src/blake3/` via passthrough copy
- `shared-styles.njk` is a comment-only stub — nothing to migrate

**Option A confirmed:** Share pages live at `src/share/` in `refueler-io`, built to `_site/share/`.

---

### CSS-1a — date: 2026-08-08
**Scope:** Visual review artifact. Conflict resolution. Block M planned. Subdomain policy locked.
**Type:** Planning — uncounted.

**Decisions locked:** C-1 orange abolished. C-2 Paper default confirmed. C-3 notes.css cleanup confirmed. C-4 `--fg*` wins. Paper hex `#E8E2D8`. `--inset-rule` gold scope reduced. Legend page simplified. Card body text DM Sans 400 / 1.7. Subdomain policy locked.

---

### CSS-1 — date: 2026-08-08
**Scope:** Design context cross-reference. Six live CSS files pulled and audited.
**Type:** Planning — uncounted.
**Output:** `REFUELER-WEBSITE-DESIGN-REFERENCE.md`

---

### CC-80 — date: 2026-08-08
**Scope:** Part 1 — nav destination pages restored. Part 2 — editorial `:root` strip.
**Commits:** `ee3584b` (nav pages), `2566bbf` (editorial `:root` strip)

---

### CC-79b — date: 2026-08-05
**Commits:** `2ac19ea`, `17f69d6`

### CC-79 — date: 2026-08-05
**Commits:** `553313f`, `08b7b95`, `f34a944`, `5e251c2`, `2ac19ea`, `17f69d6`

### CC-78 — date: 2026-08-04
**Commits:** `f267602`, `77f509a`

### CC-77 — date: 2026-08-04 (planning — uncounted)
### CC-76 — date: 2026-08-04
### CC-75 — date: 2026-08-04
### CC-74 — date: 2026-08-04
### CC-73 — date: 2026-08-04
### CC-72 — date: 2026-08-04
### CC-71 — date: 2026-07-29
### CC-70 — date: 2026-07-25 (planning — uncounted)
### CC-69 — date: 2026-07-20
### CC-68 — date: 2026-07-20

---

## Ongoing / bundled items

- New Anthropic API key → before csuite briefing reuse
- `car_park_occupancy` strip → next rail-signal-poll touch
- `blink-webhook_index.ts` → hygiene pass
- `bsc-dev` Dev Test item → remove before TestFlight
- `Costa Coffee HQ` category label fix
- GitHub Actions red X on `9b9655d`
- LNBits webhook payload shape → confirm with Ben Arc before Block 9
- Notes article seeds → `notes-articles-list.md` at next Share session
- Est. 2026 accent column → replace with Companies House reg on incorporation
- Paper input field recess → review after one month in production
- Worker Stripe return URLs → M-3 (lines 1052, 1053, 1117 of `refueler-share/worker/src/index.js`)
- `refueler-share` Pages project retirement → after M-3 signs off
- Plans active state bug on Share index nav → M-3

---

## Opening prompt — M-3

**Attach:** `Refueler_MasterContext_IO_CC80.md`, `SESSIONS-refueler-io-CC80.md`, `REFUELER-BRIDGE.md`

M-3 open. Share migration verification. Counted session.

M-2 is deployed. `refueler.io/share/` is live. This session verifies every page, fixes two known issues, and closes Block M.

**Known issues to fix first:**

1. **Stripe return URLs in Worker** — `refueler-share/worker/src/index.js` lines 1052, 1053, 1117 still point to `share.refueler.io/upgrade`. Update to `refueler.io/share/upgrade/` and redeploy Worker via `cd /Users/rajeshtaylor/Documents/refueler-share/worker && npx wrangler deploy`.

2. **Plans active state bug** — Share nav shows Plans as active on the index page. Check `activePage` frontmatter in `src/share/index.njk` — should be empty string, not `upgrade`.

**Verification checklist — work through in order:**

1. `https://refueler.io/share/` loads. Paper default. Upload zone renders. Theme pill toggles. Carbon and back. No console errors.
2. `https://refueler.io/share/` in Carbon — toggle to Paper — reload — stays Paper. Toggle back — reload — stays Carbon. (Cookie persistence.)
3. Drop a small test file on the upload zone. Turnstile widget renders after file selection.
4. Complete a test upload. Share link generated with `uuid=` and `key=` in fragment. Open in new tab — file downloads correctly.
5. `https://refueler.io/share/status/` loads. State card renders. Incidents section populated. Paper and Carbon.
6. `https://refueler.io/share/upgrade/` loads. Plan cards render. Stripe JS loads. `stripeThemeRemount` fires on theme toggle (no console error). Paper and Carbon.
7. Nav on all three Share pages: Notes → `https://refueler.io/notes/`. Plans → `/share/upgrade/`. Support → `https://refueler.io/support/`. Plans not active on index page.
8. `https://share.refueler.io/` redirects to `https://refueler.io/share/` (301). No redirect loop.
9. Main site `https://refueler.io/` — Share link in nav present. Clicking reaches `/share/`. All other nav links intact.
10. No console errors on any page. No 404s on assets (CSS, JS, BLAKE3 WASM).

**At session close:**
- Log all issues found and fixes applied
- Update MasterContext: mark Block M closed, confirm Share URL canonical
- Update BRIDGE: same
- Instruction for Rajesh: disconnect `share.refueler.io` custom domain from `refueler-share` Cloudflare Pages project in dashboard, then delete or disable the Pages project

---

## Opening prompt — CSS-1b (Opus — uncounted)

**Attach:** `Refueler_MasterContext_IO_CC80.md`, `SESSIONS-refueler-io-CC80.md`, `REFUELER-BRIDGE.md`

CSS-1b open. Cross-product navigation architecture. Planning session — uncounted. No code, no commits. Runs after M-3 is complete.

**Context:** All products now live on `refueler.io`. Share at `/share/`, Legend at `/legend/`, Notes at `/notes/`, Editorial at `/editorial/`. One domain. One nav system to lock.

A paid member dashboard for Share is on the horizon — nav placement of Plans/Upgrade should account for that. Do not design the paid dashboard here, but note the dependency.

**Before planning, read these live:**
- `https://raw.githubusercontent.com/rajesh-taylor/refueler-io/main/src/_includes/nav.njk`
- `https://raw.githubusercontent.com/rajesh-taylor/refueler-io/main/src/_includes/share-nav.njk`
- `https://raw.githubusercontent.com/rajesh-taylor/refueler-io/main/src/_includes/share-footer.njk`

**Task:** Produce a locked nav specification covering:
1. Main site nav: links, order, labels
2. Share nav: Plans label confirmed. What else?
3. Legend nav: Carbon default. Theme pill. Anything beyond?
4. Footer link sets for each surface
5. Homepage capability block: should descriptors become links, and to where?
6. How a new product (e.g. Refueler Pass) slots in when it arrives

Output: a locked nav spec table for each surface. Label copy decisions included. No ambiguity — each entry specifies label, href, and which nav it appears in.

---

*"Nothing stops this train."*
