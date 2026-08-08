# SESSIONS — refueler-io
*Canonical session log for `rajesh-taylor/refueler-io`.*
*Last updated: CSS-1a · 2026-08-08 (CSS-1a closed — visual review complete, all conflicts resolved, Block M planned, Share migration sequenced before CSS track)*

---

## Session allocation

Primary: 100 · Buffer: 25 · Total: 125
Planning/Opus sessions: uncounted by convention.
Buffer untouchable until a block overruns.
Block M (Share migration) added — 1 uncounted planning + 2 counted implementation sessions.
CSS rationalisation sessions follow Block M.

---

## Block map

| Block | Scope | Status |
|---|---|---|
| Block 0 | Theme default fix, footer stamp, CC-25 banner, duplicate sessions query | ✅ Closed CC-65 |
| Block 1 | Schema hardening: RLS, opsTogglePause, PIN RLS | ✅ Closed CC-66 |
| Block 2 | Consumer app ↔ merchant tablet live connection | ✅ Closed CC-69 |
| Block M | Share migration — `share.refueler.io` → `refueler.io/share/` | 🟡 Next — before CSS track |
| Block 3 | Franchise dashboard | 🟡 After CSS track |
| Block 4 | Dev console hardening + investor telemetry | ✅ Closed CC-65 |
| Block 5 | Merchant onboarding flow | 🟡 Queued after Block 3 |
| Block 6 | Darwin Push Port upgrade | ⚪ Deferred |
| Block 7 | Passenger count join | ⚪ Deferred |
| Block 8 | Fiat → sats rewards | 🟡 Gated on Block 5 |
| Block 9 | LNBits integration | ⚪ Deferred post merchant onboarding |
| Block 10+ | iOS/Android beta prep, Darwin bridge, Ticketing MVP | ⚪ Future |

---

## CSS rationalisation track (runs after Block M)

| Session | Scope | Type |
|---|---|---|
| CSS-1 | Design reference document — cross-reference all locked decisions. | ✅ Closed — uncounted |
| CSS-1a | Visual review + conflict resolution. All four conflicts settled. Paper `#E8E2D8`. Orange abolished. `--inset-rule` scope reduced. Block M sequenced. | ✅ Closed — uncounted |
| CSS-1b | Cross-product nav architecture — what links where from where. Share "Plans" label. Capability block links. One domain. | Opus — uncounted |
| CSS-2 | global.css full audit post-migration — all CSS files in context. Findings only. | Opus — uncounted |
| CSS-3 | New CSS architecture blueprint — token naming, cascade, reset, page responsibilities. Plan only. | Opus — uncounted |
| CSS-4 | Implement new global.css — Paper `#E8E2D8`, surface tokens, input recess, `--inset-rule` fix, orange removal. Single commit. | Opus — counted |
| CSS-5 | Full site verification — every page, theme, nav. Legend simplified. Fix anything. | Opus — counted |
| CSS-6 | Page CSS rationalisation — `notes.css` and `legend.css` `:root` migration, `--text-*` → `--fg*`, strip `!important`. Per-file commits. | Opus — counted |

---

## Session log

### CSS-1a — date: 2026-08-08
**Scope:** Visual review artifact. Conflict resolution. Block M planned. Subdomain policy locked.
**Type:** Planning — uncounted.

**Decisions locked:**

**C-1 — Orange abolished:**
`#F5820A` and `#D4690A` do not exist in this codebase. `--accent-action` token deleted from `global.css` (both Paper and Carbon). Removed from BRIDGE token table and MasterContext. Neither is replaced — CTAs use gold or `--fg`.

**C-2 — Paper default confirmed:**
Paper is default on page load across all web surfaces. MasterContext "Carbon default" homepage reference was the error — corrected. No code change required. `head.njk` already correct.

**C-3 — `notes.css` cleanup confirmed:**
Full `:root` block, duplicate nav/footer/reset to be stripped in CSS-6. Body text migrated from `--text-primary` to `--fg`. Visual re-verification in Paper and Carbon required after.

**C-4 — Token naming: `--fg*` wins:**
`--fg/--fg-muted/--fg-subtle` is the surviving primary system. `--text-primary/secondary/tertiary` become aliases pointing to `--fg*`. Font aliases (`--font-heading`, `--font-sans`, `--font-mono`, `--font-serif`) and `--border-mid`/`--inset-rule` promoted into `global.css`. `legend.css` reduced to layout only in CSS-6.

**Paper hex updated:**
Canonical Paper: `#E8E2D8` (Candidate B — "quality laid paper / Middle Temple ivory"). Replaces `#F5F0E8`. Surface tokens adjusted proportionally: `--surface: #DAD4CA`, `--surface-raised: #D0C9BE`. Input field Paper: `#CCC7BE`.

**`--inset-rule` gold scope reduced (CC-74 lock superseded):**
Gold `--inset-rule` (`#C8A96E`) valid only on `h2` dividers and blockquotes inside article body content. Never in chrome (nav, footer, card borders). Carbon `--inset-rule` reverts to `var(--border)` (`rgba(245,240,232,0.10)`) site-wide. Share nav gold border corrected.

**Legend page simplified (locked):**
Green credential dot removed. Silent Payments card removed. Below-fold three-column block removed. Page at rest: wordmark, input, tagline only. Results render below input. Legend theme fallback: `getCookie('rs-theme') || 'carbon'` on Legend template only.

**Card body text spec (locked):**
DM Sans 400, `line-height: 1.7`, `color: var(--fg)`. Canonical for all card body text across the ecosystem. Reference: Share status page card treatment.

**Block M — Share migration planned:**
Share is already Eleventy (`@11ty/eleventy ^3.0.0`). Original subdomain assumption was wrong. Three sessions: M-1 planning (uncounted), M-2 execution (counted), M-3 verification (counted). Runs before CSS-2 through CSS-6. Cloudflare: `refueler-share` Pages project moves to `refueler-io`. `refueler-share` Worker stays, CORS updated.

**Subdomain policy locked:**
`refueler.io` is canonical for all products. No new subdomains without documented technical constraint. Legend stays at `refueler.io/legend/`. Share migrates to `refueler.io/share/`.

**Paper input field review:**
`#CCC7BE` logged as the new Paper input surface. Full visual assessment deferred one month — not urgent, but tracked.

**Files produced this session (not yet committed):**
- `REFUELER-WEBSITE-DESIGN-REFERENCE.md` — commit to all three repos
- `Refueler_MasterContext_IO_CC80.md` — updated version
- `SESSIONS-refueler-io-CC80.md` — this file
- `REFUELER-BRIDGE.md` — updated version

---

### CSS-1 — date: 2026-08-08
**Scope:** Design context cross-reference. Six live CSS files pulled and audited. Unified design reference document produced.
**Type:** Planning — uncounted.

**Output:** `REFUELER-WEBSITE-DESIGN-REFERENCE.md`

**Key findings:**
- `notes.css` carries full `:root` block — not clean despite MasterContext marking
- `legend.css` has `:root` font alias block — needs migration
- `global.css` has dual token naming systems (`--fg*` and `--text-*`)
- `share-tokens.css` at `frontend/share-tokens.css` (not `src/assets/css/`)
- Four conflicts identified (C-1 through C-4) — resolved in CSS-1a
- `backdrop-filter` survivor in `notes.css` modal overlay — D-3, fix in CSS-5

---

### CC-80 — date: 2026-08-08
**Scope:** Part 1 — nav destination pages. Part 2 — editorial `:root` strip.

**Commits:**
- `ee3584b` — Part 1: restored four missing nav destination pages
- `2566bbf` — Part 2: stripped `:root` blocks from `looks-done-isnt-done` and `the-float`

---

### CC-79b — date: 2026-08-05
**Scope:** Nav fix committed. Session queue expanded. Files updated.
**Commits:** `2ac19ea`, `17f69d6`

---

### CC-79 — date: 2026-08-05
**Scope:** Editorial Part 1 + homepage full redesign.
**Commits:** `553313f`, `08b7b95`, `f34a944`, `5e251c2`, `2ac19ea`, `17f69d6`

---

### CC-78 — date: 2026-08-04
**Scope:** Homepage technical implementation + copy finalisation.
**Commits:** `f267602`, `77f509a`

---

### CC-77 — date: 2026-08-04
**Scope:** Homepage copy lock. Planning session (uncounted).

---

### CC-76 — date: 2026-08-04
**Scope:** Live verification. Colour divergence root cause identified.

---

### CC-75 — date: 2026-08-04
**Scope:** Share CSS architecture complete.

---

### CC-74 — date: 2026-08-04
**Scope:** global.css migration completion. Legend Paper fix. Carbon standardisation.

---

### CC-73 — date: 2026-08-04
**Scope:** Nav/theme/support fixes across refueler-io and refueler-share.

---

### CC-72 — date: 2026-08-04
**Scope:** Infrastructure housekeeping — global CSS, theme fix, API key rotation.

---

### CC-71 — date: 2026-07-29
**Scope:** Repo hygiene — ~15,000 deletions.

---

### CC-70 — date: 2026-07-25 (planning)
**Decisions:** Fiat→sats primary traction lever. LNBits deferred. VPS costed.

---

### CC-69 — date: 2026-07-20
**Scope:** Block 2 final close.

---

### CC-68 — date: 2026-07-20
**Scope:** Blink API key rotation. blink-webhook v12.

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

---

## Opening prompt for M-1

**Attach:** `Refueler_MasterContext_IO_CC80.md`, `SESSIONS-refueler-io-CC80.md`, `REFUELER-BRIDGE.md`

M-1 open. Share migration planning. Uncounted session — no code, no commits.

Share is confirmed Eleventy (`@11ty/eleventy ^3.0.0`). It runs on a separate Cloudflare Pages project (`refueler-share`) connected to `rajesh-taylor/refueler-share`. A separate Worker (`refueler-share.rt-fc4.workers.dev`) handles backend operations. Both confirmed in Cloudflare dashboard.

**Task:** Produce a complete migration plan covering:
1. Every file in `refueler-share` that moves into `refueler-io` and where it lands
2. How `share-tokens.css` merges into or coexists with `global.css`
3. How `share.js` and `share.css` are served post-migration
4. BLAKE3 WASM and any other binary assets — passthrough copy config
5. Cashu credential flow — any hardcoded domain references to find and update
6. Turnstile — any domain allowlist changes needed in Cloudflare dashboard
7. Cloudflare Pages — how to retire `refueler-share` Pages project and serve Share from `refueler-io` Pages project
8. Worker CORS — what changes in `refueler-share` Worker to accept `refueler.io/share/`
9. `share.refueler.io` redirect — `_redirects` file or Cloudflare redirect rule
10. Nav changes on both the migrated Share pages and on `refueler.io` main nav

Read these live before planning:
- `https://raw.githubusercontent.com/rajesh-taylor/refueler-share/main/.eleventy.js`
- `https://raw.githubusercontent.com/rajesh-taylor/refueler-share/main/src/index.njk`
- `https://raw.githubusercontent.com/rajesh-taylor/refueler-share/main/src/upgrade.njk`
- `https://raw.githubusercontent.com/rajesh-taylor/refueler-share/main/src/status.njk`
- `https://raw.githubusercontent.com/rajesh-taylor/refueler-share/main/src/_includes/head.njk`
- `https://raw.githubusercontent.com/rajesh-taylor/refueler-share/main/src/_includes/nav.njk`
- `https://raw.githubusercontent.com/rajesh-taylor/refueler-share/main/frontend/share.js` (first 100 lines — check for hardcoded domain refs)

Output: numbered migration plan, ordered by execution sequence. No code this session.

---

## Opening prompt for CSS-1b (Opus)

**Attach:** `Refueler_MasterContext_IO_CC80.md`, `SESSIONS-refueler-io-CC80.md`, `REFUELER-BRIDGE.md`

CSS-1b open. Cross-product navigation architecture. Planning session — uncounted. Runs after Block M is complete.

**Context:** All products now live on `refueler.io`. Share at `/share/`, Legend at `/legend/`, Notes at `/notes/`, Editorial at `/editorial/`. One domain, one nav system to design.

**Task:** Produce a locked nav specification covering:
1. Main site nav (`refueler.io`): which links, in what order, with what labels
2. Share nav (`refueler.io/share/`): which links — "Plans" replacing "Upgrade"?
3. Legend nav (`refueler.io/legend/`): Carbon default, theme pill present. Anything else?
4. Whether the homepage capability block descriptors should become links, and to where
5. Footer link sets for each surface
6. How a new product (e.g. Refueler Pass) slots in when it arrives

No code. Output: a locked nav spec table for each surface, plus any copy decisions on labels.

---

*"Nothing stops this train."*
