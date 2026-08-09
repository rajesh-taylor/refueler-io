# SESSIONS — refueler-io
*Canonical session log for `rajesh-taylor/refueler-io`.*
*Last updated: M-3 · 2026-08-08 (M-3 closed — Block M complete. Share canonical at refueler.io/share/)*

---

## Session allocation

Primary: 100 · Buffer: 25 · Total: 125
Planning/Opus sessions: uncounted by convention.
Block M: 1 uncounted (M-1 ✅) + 3 counted (M-2 ✅, M-3 ✅).
CSS rationalisation: 3 uncounted (CSS-1b, CSS-2, CSS-3) + 4 counted (CSS-4, CSS-5, CSS-6, CSS-7).
Buffer untouchable until a block overruns.

---

## Block map

| Block | Scope | Status |
|---|---|---|
| Block 0 | Theme default fix, footer stamp, CC-25 banner, duplicate sessions query | ✅ Closed CC-65 |
| Block 1 | Schema hardening: RLS, opsTogglePause, PIN RLS | ✅ Closed CC-66 |
| Block 2 | Consumer app ↔ merchant tablet live connection | ✅ Closed CC-69 |
| Block 4 | Dev console hardening + investor telemetry | ✅ Closed CC-65 |
| Block M | Share migration — `share.refueler.io` → `refueler.io/share/` | ✅ Closed M-3 |
| Block 3 | Franchise dashboard | 🟡 After CSS track |
| Block 5 | Merchant onboarding flow | 🟡 Queued after Block 3 |
| Block 6 | Darwin Push Port upgrade | ⚪ Deferred |
| Block 7 | Passenger count join | ⚪ Deferred |
| Block 8 | Fiat → sats rewards | 🟡 Gated on Block 5 |
| Block 9 | LNBits integration | ⚪ Deferred post merchant onboarding |
| Block 10+ | iOS/Android beta prep, Darwin bridge, Ticketing MVP | ⚪ Future |

---

## CSS rationalisation track

| Session | Scope | Type | Status |
|---|---|---|---|
| CSS-1 | Design reference document | ✅ Closed — uncounted | |
| CSS-1a | Visual review + conflict resolution | ✅ Closed — uncounted | |
| CSS-1b | Cross-product nav architecture | Opus — uncounted | ✅ Closed — uncounted |
| CSS-2 | global.css full audit post-migration | Opus — uncounted | ✅ Closed — uncounted |
| CSS-3 | New CSS architecture blueprint | Opus — uncounted | ✅ Closed — uncounted |
| CSS-4 | Implement new global.css | Sonnet — counted | ✅ Closed — commit 2cbc496 |
| CSS-5 | Full site verification + Legend layout removal | Sonnet — counted | 🟡 This session |
| CSS-6 | Page CSS rationalisation — `notes.css` and `legend.css` `:root` migration | Sonnet — counted | 🟡 After CSS-5 |
| CSS-7 | Share design session — upload complete, download page, progress states | Sonnet — counted | 🟡 After CSS-6 |

---

## Session log

### CSS-5 — date: 2026-08-09
**Scope:** Full-site verification + Legend layout removal. Counted session.
**Type:** Counted.

**Legend layout removal (CSS-1a lock):**

Three elements removed per the CSS-1a locked spec (wordmark + input + tagline only):

1. **Credential dot** — removed from both files:
   - `legend.css` L131–148: `.legend-cred-icon` and `.legend-cred-icon:focus-visible` blocks deleted.
   - `legend-spa.js` L54–64: `credIcon` createElement block deleted.
   - `legend-spa.js` L97–103: `credIconEl` click listener deleted.
2. **Below-fold three-column block** — removed from both files:
   - `legend.css` L150–187: `.legend-below`, `.legend-below-inner`, `.legend-below-heading`, `.legend-below-body`, responsive grid media query — all deleted.
   - `legend/index.njk` L24–44: `<section class="legend-below">` block and its three column divs deleted.
3. **Silent Payments card** — not present in either file (not yet built). No action required.

**Abolished value audit (grep across `src/`):**

| Pattern | Hits | Verdict |
|---|---|---|
| `#F5820A` | 0 | ✅ Clean |
| `#D4690A` | 0 | ✅ Clean |
| `#1E1F22` | 0 | ✅ Clean |
| `#F7F4EF` | 0 | ✅ Clean |
| `#F5F0E8` | 4 | ⚠️ See notes |
| `accent-action` | 1 | ⚠️ See notes |
| `rfTheme` | 3 | ⚠️ See notes |
| `html.carbon-mode` / `carbon-mode` | 3 | ✅ Comments only |
| `setTheme(` | 2 | ✅ Comments only |

**Hit notes (do not fix this session — log for CSS-6):**
- `#F5F0E8` at `global.css:83` — this is `--fg` in Carbon theme. **Correct usage.** The value is the Carbon foreground colour; it happens to match the old Paper bg hex. Not a bug.
- `#F5F0E8` at `src/index.njk:77` — noscript fallback inline style, Carbon fg. Acceptable.
- `#F5F0E8` at `src/share/upgrade.njk:516` — Stripe colorText for dark mode. Acceptable; it is the fg colour.
- `#F5F0E8` at `src/notes/notes.css:9` — stale `--paper` token in  block. **CSS-6 target** (notes.css  strip).
- `#F7F4EF` at `src/share/assets/share.js:649,650` — QR code dark-mode bg/fill. Stale value. **CSS-6 or CSS-7 target.**
- `accent-action` at `src/share/assets/share.css:192` — `.upgrade-nudge-link { color: var(--accent-action) }`. Token is abolished in `share-tokens.css` after CSS-4 merge. Link will render with no colour. **Fix in CSS-7** (Share design session).
- `rfTheme` at `src/analytics.js:15,18` — **live read** of abolished key via `localStorage.getItem("rfTheme")`. Theme analytics are returning stale/wrong values. **Fix in CSS-6** — update to read `document.documentElement.dataset.theme`.

**MasterContext corrections applied (Task 4):**
- C-2: Homepage phrasing corrected to "Paper default on load; Carbon on toggle."
- CSS status: `editorial.css` 🟡, `support.css` 🟡, `privacy.css` 🔴
- Design-reference §2 and §9 noted as superseded.

**Visual verification checklist:** *(Rajesh confirms after browser check — see Task 3 below)*

| # | Item | Status |
|---|---|---|
| 1 | Homepage Paper default load | — |
| 2 | Homepage Carbon toggle | — |
| 3 | Homepage ≤640px | — |
| 4 | Legend Carbon default | — |
| 5 | Legend: only wordmark + input + tagline visible | — |
| 6 | Legend: no green dot top-right | — |
| 7 | Legend: no below-fold three-column block | — |
| 8 | Share upload page Paper/Carbon | — |
| 9 | Share drop zone renders | — |
| 10 | Share plans page renders | — |
| 11 | Share status page renders | — |
| 12 | Notes index page | — |
| 13 | Editorial index page | — |
| 14 | Privacy page | — |
| 15 | Nav links correct all surfaces | — |
| 16 | Footer stamp present all surfaces | — |
| 17 | Theme pill works all surfaces | — |

**Commit:** `[hash — fill after push]` — fix(css): CSS-5 — Legend layout removal, abolished value audit

### M-3 — date: 2026-08-08
**Scope:** Share migration verification and close. Counted session.
**Type:** Counted.

**Issues found and fixed:**

1. **Worker Stripe return URLs** — lines 1052, 1053, 1117 of `refueler-share/worker/src/index.js` updated from `share.refueler.io/upgrade` to `refueler.io/share/upgrade/`. CORS `refueler.io` already present in source from M-2 local edit — committed in same pass. Worker redeployed as version `7a0183e1`.

2. **Plans active state bug** — `activePage: ""` already correct in `src/share/index.njk`. No fix needed — was a non-issue.

3. **Turnstile widget hostname** — widget had only 1 hostname (`share.refueler.io`). `refueler.io` added in Cloudflare dashboard → widget now shows 2 hostnames. This was blocking all uploads on `refueler.io/share/`.

4. **BLAKE3 path mismatch** — `share.js` imports `./blake3/browser-async.js` (relative from `/share/assets/`), resolving to `/share/assets/blake3/`. Blake3 was at `src/share/blake3/` (building to `/share/blake3/`). Moved entire blake3 directory to `src/share/assets/blake3/`. Stale `src/share/blake3` passthrough rule removed from `eleventy.config.js`.

5. **`_headers` file** — added to `src/_headers` with passthrough rule in `eleventy.config.js` to unblock blake3 subdirectory on Cloudflare Pages.

6. **Signoff copy** — "Part of the Refueler ecosystem · Your data. Your rules." replaced with three-line colophon: "Encrypted in your browser. / Deleted when it expires. / refueler.io". CSS updated to match: Source Serif 4 weight 300, `--text-tertiary`, tighter type scale, more breathing room.

**Commits (refueler-share):**
- `cd5fb6d` — fix: Stripe return URLs → refueler.io/share/upgrade/, CORS refueler.io committed to source

**Commits (refueler-io):**
- `4e326bb` — fix: move blake3 into share/assets/ so relative import resolves correctly
- `3d9658c` — fix: _headers to unblock blake3 assets on Cloudflare Pages
- `ae0b981` — fix: move _headers to src/, add passthrough, remove stale blake3 passthrough rule
- `[pending]` — fix: Share signoff copy and CSS (place share-index.njk → src/share/index.njk, share.css → src/share/assets/share.css)

**Verification results:**
- ✅ `refueler.io/share/` loads, Paper default, upload zone renders
- ✅ Theme toggle Carbon ↔ Paper, cookie persistence confirmed
- ✅ Turnstile widget completes
- ✅ Upload completes end-to-end — share link generated with `uuid=` and `key=` in fragment
- ✅ Download page renders correctly — file name, size, expiry, Download button
- ✅ `refueler.io/share/status/` loads
- ✅ `refueler.io/share/upgrade/` loads (Plans)
- ✅ Share nav: Notes, Plans, Support all correct
- ✅ Main site Share link present and correct
- ⚠️ `share.refueler.io` not redirecting — still serving old Pages project (expected; requires manual Cloudflare dashboard action to retire)

**Action required (Rajesh — Cloudflare dashboard):**
1. Go to Cloudflare Pages → `refueler-share` project → Custom domains
2. Disconnect `share.refueler.io` custom domain
3. Delete or disable the `refueler-share` Pages project

**Known limitations logged:**
- Safari large file limitation (~1.5 GB+) — client-side AES-GCM memory constraint. Fix: chunked streaming encryption (Share B-series roadmap).
- Cloudflare Workers KV free tier (1,000 writes/day) sufficient for testing but upgrade to Paid ($5/month) before production.

---

### M-2 — date: 2026-08-08
**Scope:** Share migration execution. Counted session.
**Commits:** `213798d`, `8abf0c5`, `e577379`
**Status:** `refueler.io/share/` live.

---

### M-1 — date: 2026-08-08
**Scope:** Share migration planning. Uncounted.

---

### CSS-1a — date: 2026-08-08
**Scope:** Visual review + conflict resolution. Uncounted.

---

### CSS-1 — date: 2026-08-08
**Scope:** Design context cross-reference. Uncounted.
**Output:** `REFUELER-WEBSITE-DESIGN-REFERENCE.md`

---

### CC-80 — date: 2026-08-08
**Commits:** `ee3584b`, `2566bbf`

### CC-79b — date: 2026-08-05
### CC-79 — date: 2026-08-05
### CC-78 — date: 2026-08-04
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

- **Action required:** Disconnect `share.refueler.io` custom domain from `refueler-share` Pages project in Cloudflare dashboard, then delete or disable the project
- Upgrade Cloudflare Workers to Paid plan ($5/month) before production volume
- New Anthropic API key → before csuite briefing reuse
- `car_park_occupancy` strip → next rail-signal-poll touch
- `blink-webhook_index.ts` → hygiene pass
- `bsc-dev` Dev Test item → remove before TestFlight
- `Costa Coffee HQ` category label fix
- GitHub Actions red X on `9b9655d`
- LNBits webhook payload shape → confirm with Ben Arc before Block 9
- Notes article seeds → `notes-articles-list.md` in refueler-share at next Share session
- Est. 2026 accent column → replace with Companies House reg on incorporation
- Paper input field recess → review after one month in production
- Share streaming encryption → B-series Share roadmap item
- Safari >1.5 GB file limit → document in Share FAQ

---

## Opening prompt — CSS-1b (Opus — uncounted)

**Attach:** `Refueler_MasterContext_IO_CC80.md`, `SESSIONS-refueler-io-CC80.md`, `REFUELER-BRIDGE.md`

CSS-1b open. Cross-product navigation architecture. Planning session — uncounted. No code, no commits.

**Context:** All products now live on `refueler.io`. Share at `/share/`, Legend at `/legend/`, Notes at `/notes/`, Editorial at `/editorial/`. One domain. One nav system to lock. Block M complete.

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
