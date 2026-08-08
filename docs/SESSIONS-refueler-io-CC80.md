# SESSIONS — refueler-io
*Canonical session log for `rajesh-taylor/refueler-io`.*
*Last updated: M-1 · 2026-08-08 (M-1 closed — Share migration plan complete, Option A confirmed, M-2/M-3 prompts written, all CSS prompts written)*

---

## Session allocation

Primary: 100 · Buffer: 25 · Total: 125
Planning/Opus sessions: uncounted by convention.
Block M: 1 uncounted (M-1 ✅) + 2 counted (M-2, M-3).
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
| Block M | Share migration — `share.refueler.io` → `refueler.io/share/` | 🟡 In progress — M-1 closed |
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

### M-1 — date: 2026-08-08
**Scope:** Share migration planning. Live files read from `rajesh-taylor/refueler-share`. Complete migration plan produced.
**Type:** Planning — uncounted.

**Key findings from live files:**
- Three Eleventy pages: `index.njk` → `/`, `upgrade.njk` → `/upgrade.html`, `status.njk` → `/status.html`
- No `notes.njk` in Share — nav already links to `https://refueler.io/notes/` (absolute, correct)
- `support` nav link already absolute to `https://refueler.io/support/` (correct)
- `WORKER_URL = 'https://refueler-share.rt-fc4.workers.dev'` hardcoded in `share.js` line 8, `upgrade.njk` inline JS (×2), `status.njk` inline JS — **does not change** post-migration (Worker URL is not the page URL)
- CSS asset paths all root-relative (`/share.css`, `/share-tokens.css`, etc.) — need path prefix update
- Internal page links root-relative (`/index.html`, `/status.html`, `/upgrade.html`) — need updating
- Turnstile sitekey `0x4AAAAAAD0N7GlHlCRuWITr` registered against `share.refueler.io` — add `refueler.io` to allowlist in Cloudflare dashboard
- Theme cookie already scoped to `.refueler.io` — works at new path without change
- `stripeThemeRemount` Nunjucks flag in `upgrade.njk` — must be ported into main `head.njk`
- BLAKE3 WASM in `src/blake3/` via passthrough copy — moves to `src/share/blake3/`, relative import in `share.js` resolves correctly
- `share-tokens.css` is in `frontend/` (build output), not `src/` — carried as temporary file during migration, merged properly in CSS-4
- `src/assets/js/` in `refueler-io` confirmed to contain `legend-spa.js` — `share.js` lands alongside it without collision

**Option A confirmed:** Share pages live at `src/share/` in `refueler-io`, built to `_site/share/`.

**Migration plan summary (12 steps):** Full detail in M-1 session output. File mapping, head.njk merge strategy, BLAKE3 passthrough, Turnstile allowlist, Worker CORS, Pages project retirement, redirect rules, and nav changes all planned.

---

### CSS-1a — date: 2026-08-08
**Scope:** Visual review artifact. Conflict resolution. Block M planned. Subdomain policy locked.
**Type:** Planning — uncounted.

**Decisions locked:**

**C-1 — Orange abolished:** `#F5820A` and `#D4690A` do not exist in this codebase. `--accent-action` deleted from `global.css`. CTAs use gold or `--fg`.

**C-2 — Paper default confirmed:** Paper is default on page load across all web surfaces. No code change required — `head.njk` already correct.

**C-3 — `notes.css` cleanup confirmed:** Full `:root` block, duplicate nav/footer/reset to be stripped in CSS-6. Body text migrated from `--text-primary` to `--fg`.

**C-4 — Token naming: `--fg*` wins:** `--text-primary/secondary/tertiary` become aliases. Font aliases and `--border-mid`/`--inset-rule` promoted into `global.css`. `legend.css` reduced to layout only in CSS-6.

**Paper hex updated:** `#E8E2D8`. Surface tokens: `--surface: #DAD4CA`, `--surface-raised: #D0C9BE`. Input field Paper: `#CCC7BE`.

**`--inset-rule` gold scope reduced:** Gold valid only on `h2` dividers and blockquotes inside article body content. Never chrome. CC-74 global gold lock superseded.

**Legend page simplified:** Green dot removed. Silent Payments card removed. Below-fold three-column block removed. Page at rest: wordmark, input, tagline only. Legend theme fallback: `getCookie('rs-theme') || 'carbon'`.

**Card body text spec:** DM Sans 400, `line-height: 1.7`, `color: var(--fg)`.

**Subdomain policy locked:** `refueler.io` canonical for all products. No new subdomains without documented technical constraint.

---

### CSS-1 — date: 2026-08-08
**Scope:** Design context cross-reference. Six live CSS files pulled and audited.
**Type:** Planning — uncounted.
**Output:** `REFUELER-WEBSITE-DESIGN-REFERENCE.md`

**Key findings:** `notes.css` carries full `:root` block. `legend.css` has `:root` font alias block. `global.css` has dual token naming systems. `share-tokens.css` at `frontend/` not `src/assets/css/`. `backdrop-filter` survivor in `notes.css` modal overlay (D-3, fix in CSS-5).

---

### CC-80 — date: 2026-08-08
**Scope:** Part 1 — nav destination pages restored. Part 2 — editorial `:root` strip.
**Commits:** `ee3584b` (nav pages), `2566bbf` (editorial `:root` strip)

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

### CC-77 — date: 2026-08-04 (planning — uncounted)
**Scope:** Homepage copy lock.

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

### CC-70 — date: 2026-07-25 (planning — uncounted)
**Scope:** Fiat→sats primary traction lever confirmed. LNBits deferred. VPS costed.

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

## Opening prompt — M-2

**Attach:** `Refueler_MasterContext_IO_CC80.md`, `SESSIONS-refueler-io-CC80.md`, `REFUELER-BRIDGE.md`

M-2 open. Share migration execution. Counted session.

M-1 plan is complete and confirmed. Option A: Share pages live at `src/share/` in `refueler-io`, built to `_site/share/`. Read the M-1 session log in SESSIONS for the full plan before starting.

**Before writing a single line, read these live files:**
- `https://raw.githubusercontent.com/rajesh-taylor/refueler-io/main/.eleventy.js` — current passthrough rules and dir config
- `https://raw.githubusercontent.com/rajesh-taylor/refueler-io/main/src/_includes/head.njk` — current head include, theme script, and font loading
- `https://raw.githubusercontent.com/rajesh-taylor/refueler-io/main/src/_includes/nav.njk` — or equivalent main site nav file
- `https://raw.githubusercontent.com/rajesh-taylor/refueler-share/main/src/index.njk` — full file (all inline JS and Turnstile wiring)
- `https://raw.githubusercontent.com/rajesh-taylor/refueler-share/main/src/upgrade.njk` — full file (Stripe + stripeThemeRemount flag)
- `https://raw.githubusercontent.com/rajesh-taylor/refueler-share/main/src/status.njk` — full file
- `https://raw.githubusercontent.com/rajesh-taylor/refueler-share/main/src/_includes/nav.njk` — Share nav
- `https://raw.githubusercontent.com/rajesh-taylor/refueler-share/main/frontend/share-tokens.css` — full token file (staging for CSS-4 merge)
- `https://raw.githubusercontent.com/rajesh-taylor/refueler-share/main/src/_includes/shared-styles.njk` — shared inline styles across Share pages; check whether content belongs in share.css or global.css
- `https://raw.githubusercontent.com/rajesh-taylor/refueler-share/main/src/_includes/footer.njk` — Share footer; check for hardcoded domain refs or links needing update

**Session scope — two commits:**

**Commit 1 — File moves and config:**
1. Add `src/share/` directory to `refueler-io`. Create `src/share/_includes/` for Share-specific nav.
2. Migrate `src/index.njk`, `src/upgrade.njk`, `src/status.njk` from `refueler-share` into `src/share/`. Update all permalinks: `/` → `/share/`, `/upgrade.html` → `/share/upgrade/`, `/status.html` → `/share/status/`.
3. Update all root-relative internal links in migrated pages: `/index.html` → `/share/`, `/status.html` → `/share/status/`, `/upgrade.html` → `/share/upgrade/`.
4. Update CSS asset paths in migrated pages: `/share.css` → `/share/assets/share.css`, etc.
5. Create `src/share/_includes/nav.njk` from `refueler-share` nav. Update label `Upgrade` → `Plans`. Update href to `/share/upgrade/`. Update status link to `/share/status/`. Keep Notes and Support as absolute links (already correct).
6. Port `stripeThemeRemount` Nunjucks conditional from Share's `head.njk` into `refueler-io`'s `src/_includes/head.njk`. It is a variable check — harmless as falsy on all non-upgrade pages.
7. Copy `share-tokens.css` into `refueler-io` as `src/assets/css/share-tokens.css` (temporary — will be merged into `global.css` in CSS-4). Have Share pages load it via `extraHead` block.
8. Add passthrough copy rules to `refueler-io`'s `.eleventy.js`: `src/share/blake3` and `src/share/assets`.
9. Create `src/share/assets/` and copy `share.js`, `share.css`, `upgrade.css`, `status.css` from `refueler-share/frontend/`.
10. Copy `src/blake3/` directory from `refueler-share` into `src/share/blake3/` in `refueler-io`.

**Commit 2 — Nav and redirect:**
11. Add Share link to main site `src/_includes/nav.njk` — label `Share`, href `/share/`. Position: after Notes, before Privacy. (CSS-1b will refine this — stub is sufficient for now.)
12. Add `_redirects` file to `refueler-io` repo root (or `public/` if that's how the project is structured) with: `https://share.refueler.io/* https://refueler.io/share/:splat 301`

**Cloudflare dashboard steps (not code — Rajesh does these after commit 2 is deployed):**
- Turnstile: add `refueler.io` to allowed hostnames for sitekey `0x4AAAAAAD0N7GlHlCRuWITr`
- Worker CORS: add `https://refueler.io` to allowed origins in `refueler-share` Worker (alongside existing `share.refueler.io` — do not remove the old one yet)
- Cloudflare Pages: confirm `refueler-io` Pages project is building and serving `/share/` correctly before touching `refueler-share` Pages project

Present each file in full. One file at a time. No placeholders. Separate commit commands for commit 1 and commit 2.

---

## Opening prompt — M-3

**Attach:** `Refueler_MasterContext_IO_CC80.md`, `SESSIONS-refueler-io-CC80.md`, `REFUELER-BRIDGE.md`

M-3 open. Share migration verification. Counted session.

M-2 is deployed. `refueler.io/share/` is live. This session is verification and fix — no planned code changes, but fix anything that's broken.

**Verification checklist — work through this in order:**

1. `https://refueler.io/share/` loads. Paper default. Theme pill toggles to Carbon and back. No flash of unstyled content.
2. `https://refueler.io/share/` in Carbon. Toggle to Paper. Reload. Stays Paper. Toggle back. Reload. Stays Carbon. (Cookie persistence working.)
3. Drop a small test file on the upload zone. Turnstile widget renders after file selection. (Turnstile allowlist is working.)
4. Complete a test upload. Share link generated. Link contains `uuid=` and `key=` in the fragment. Open link in a new tab — file downloads correctly. (BLAKE3 WASM loaded, Worker calls succeeding, CORS working.)
5. `https://refueler.io/share/status/` loads. Status card renders. Ops layer populates from Worker. Paper and Carbon.
6. `https://refueler.io/share/upgrade/` loads. Plan cards render. Stripe JS loads. `stripeThemeRemount` fires on theme toggle (no console error). Paper and Carbon.
7. Nav on all three Share pages: `Notes` → `https://refueler.io/notes/`. `Plans` → `/share/upgrade/`. `Support` → `https://refueler.io/support/`. Theme pill works.
8. `https://share.refueler.io/` redirects to `https://refueler.io/share/` (301). Check in browser and confirm no redirect loop.
9. Main site nav at `https://refueler.io/` includes Share link. Clicking it reaches `/share/`.
10. No console errors on any page. No 404s on assets (CSS, JS, BLAKE3 WASM files).

**For each issue found:** state the symptom, diagnose the cause, produce the fix, give the exact commit command.

**At session close:**
- Log all issues found and fixes applied in this SESSIONS file
- If the `refueler-share` Cloudflare Pages project is confirmed safe to retire, note the instruction for Rajesh to disconnect it from the `share.refueler.io` custom domain in the Cloudflare dashboard
- Update MasterContext: mark Block M closed, update Share URL from `share.refueler.io` to `refueler.io/share/` throughout
- Update BRIDGE: same URL update

---

## Opening prompt — CSS-1b (Opus — uncounted)

**Attach:** `Refueler_MasterContext_IO_CC80.md`, `SESSIONS-refueler-io-CC80.md`, `REFUELER-BRIDGE.md`

CSS-1b open. Cross-product navigation architecture. Planning session — uncounted. No code, no commits.

Block M is complete. All products now live on `refueler.io`: Share at `/share/`, Legend at `/legend/`, Notes at `/notes/`, Editorial at `/editorial/`. One domain. One nav system to lock.

**Before planning, read these live:**
- `https://raw.githubusercontent.com/rajesh-taylor/refueler-io/main/src/_includes/nav.njk` — current main site nav
- `https://raw.githubusercontent.com/rajesh-taylor/refueler-io/main/src/share/_includes/nav.njk` — Share nav as migrated in M-2
- `https://raw.githubusercontent.com/rajesh-taylor/refueler-io/main/src/legend/index.njk` (or equivalent) — Legend template nav wiring

**Task:** Produce a locked nav specification covering:
1. Main site nav (`refueler.io`): links, order, labels. Does Share belong here? Where does it sit relative to Notes and Editorial?
2. Share nav (`/share/`): `Plans` label confirmed. What else — is `Notes` the right cross-link, or should it be `refueler.io` home?
3. Legend nav (`/legend/`): Carbon default. Theme pill. Anything beyond that?
4. Footer link sets for each surface: what goes in the footer that doesn't belong in the header nav?
5. Homepage capability block: should the three capability descriptors (Encrypted transfers, Bitcoin explorer, Lightning payments) become clickable links, and if so to where?
6. How a new product (e.g. Refueler Pass) slots into the nav when it arrives — what's the pattern?

Output: a locked nav spec table for each surface. Label copy decisions included. No ambiguity — each entry specifies label, href, and which nav it appears in. This becomes the implementation spec for CSS-5.

---

## Opening prompt — CSS-2 (Opus — uncounted)

**Attach:** `Refueler_MasterContext_IO_CC80.md`, `SESSIONS-refueler-io-CC80.md`, `REFUELER-BRIDGE.md`, `REFUELER-WEBSITE-DESIGN-REFERENCE.md`

CSS-2 open. Full CSS audit post-migration. Findings only — no changes this session.

Block M is complete. `share-tokens.css` is now living in `refueler-io` as a temporary file at `src/assets/css/share-tokens.css`. The CSS rationalisation track now has a complete picture of every CSS file in the ecosystem.

**Before auditing, read every CSS file live:**
- `https://raw.githubusercontent.com/rajesh-taylor/refueler-io/main/src/assets/css/global.css`
- `https://raw.githubusercontent.com/rajesh-taylor/refueler-io/main/src/assets/css/home.css`
- `https://raw.githubusercontent.com/rajesh-taylor/refueler-io/main/src/assets/css/legend.css`
- `https://raw.githubusercontent.com/rajesh-taylor/refueler-io/main/src/assets/css/share-tokens.css` (migrated from refueler-share)
- `https://raw.githubusercontent.com/rajesh-taylor/refueler-io/main/src/notes/notes.css`
- `https://raw.githubusercontent.com/rajesh-taylor/refueler-io/main/src/share/assets/share.css`
- `https://raw.githubusercontent.com/rajesh-taylor/refueler-io/main/src/share/assets/upgrade.css`
- `https://raw.githubusercontent.com/rajesh-taylor/refueler-io/main/src/share/assets/status.css`
- `https://raw.githubusercontent.com/rajesh-taylor/refueler-io/main/src/assets/css/editorial.css`
- `https://raw.githubusercontent.com/rajesh-taylor/refueler-io/main/src/assets/css/support.css`
- `https://raw.githubusercontent.com/rajesh-taylor/refueler-io/main/src/assets/css/privacy.css`

**Audit each file against these questions:**
1. Does it contain a `:root` token block? (Should not — only `global.css` and temporary `share-tokens.css` should)
2. Does it reference `--text-*` tokens? (These are being aliased to `--fg*` — catalogue every instance)
3. Does it use `!important`? (Catalogue — most will be stripped in CSS-6)
4. Does it reference `#F5820A`, `#D4690A`, `#F5F0E8`, `#1E1F22`, `#F7F4EF`, or any other stale/abolished hex? (These must all go)
5. Does it contain `backdrop-filter`? (One known survivor in `notes.css` modal — confirm and find any others)
6. Does it contain duplicate nav/footer/reset CSS that belongs in `global.css`?
7. Does it have font-loading or font-alias tokens that belong in `global.css`?

**Output:** A findings table per file. Not a fix list — just a clear audit so CSS-3 can write the blueprint from facts, not assumptions. Flag anything that contradicts CSS-1a locked decisions. Note the approximate line numbers for each finding so CSS-4/CSS-6 can target them precisely.

---

## Opening prompt — CSS-3 (Opus — uncounted)

**Attach:** `Refueler_MasterContext_IO_CC80.md`, `SESSIONS-refueler-io-CC80.md`, `REFUELER-BRIDGE.md`, `REFUELER-WEBSITE-DESIGN-REFERENCE.md`

CSS-3 open. New CSS architecture blueprint. Planning only — no code, no commits.

CSS-2 audit is complete. All findings are in the session log above. This session produces the blueprint that CSS-4, CSS-5, and CSS-6 implement.

**Blueprint must specify:**

1. **`global.css` final structure** — in order: reset, token `:root` (Paper), `[data-theme="carbon"]` override, font aliases, structural tokens (`--radius-*`, `--border-weight`, `--theme-transition`), border tokens (`--border`, `--border-mid`, `--inset-rule`), surface tokens, nav styles, footer styles, shared component styles. List every token that belongs here and what its value is.

2. **`share-tokens.css` → `global.css` merge plan** — token by token. For each Share token: does it merge verbatim, does it need a value change to match the canonical palette, or is it Share-specific and stays in `share.css`? The Share structural divergences (1px borders, 6px radius) need a ruling: adopt them site-wide, keep them Share-local, or bring Share into line with BRIDGE.

3. **Page CSS responsibility matrix** — for every page CSS file, what it is and is not allowed to contain after rationalisation. Table format: file | allowed content | forbidden content.

4. **`--text-*` alias strategy** — exact CSS to add to `global.css` so that existing references to `--text-primary` etc. don't break during the transition. When do the aliases get removed?

5. **`!important` removal plan** — which instances in `home.css` can be removed once the cascade is fixed in `global.css`, and what cascade fix makes them unnecessary?

6. **Commit sequence for CSS-4, CSS-5, CSS-6** — ordered list of every commit, what file it touches, and what it does. CSS-4 is a single commit (new `global.css`). CSS-5 is verification with fixes. CSS-6 is per-file commits for `notes.css` and `legend.css`.

Output: the blueprint document. Precise enough that CSS-4 can execute it without ambiguity.

---

## Opening prompt — CSS-4 (Sonnet — counted)

**Attach:** `Refueler_MasterContext_IO_CC80.md`, `SESSIONS-refueler-io-CC80.md`, `REFUELER-BRIDGE.md`, `REFUELER-WEBSITE-DESIGN-REFERENCE.md`

CSS-4 open. Implement new `global.css`. Single commit.

CSS-3 blueprint is complete and is in the session log above. Execute it exactly.

**Before writing anything, read live:**
- `https://raw.githubusercontent.com/rajesh-taylor/refueler-io/main/src/assets/css/global.css` — current file in full
- `https://raw.githubusercontent.com/rajesh-taylor/refueler-io/main/src/assets/css/share-tokens.css` — tokens to be merged in

**Session scope:**
- Produce the complete new `global.css` per the CSS-3 blueprint
- Merge `share-tokens.css` tokens into it per the CSS-3 merge plan
- Remove `--accent-action` entirely (both Paper and Carbon) — orange is abolished
- Update Paper `--bg` to `#E8E2D8`, surface tokens to `#DAD4CA`/`#D0C9BE`, input field Paper to `#CCC7BE`
- Set `--inset-rule` to `var(--border)` in both Paper and Carbon `:root` blocks (gold inset-rule is an inline element style only, not a token)
- Add `--text-primary/secondary/tertiary` aliases pointing to `--fg*` values (transition aliases — flagged for removal in CSS-6)
- Add font aliases: `--font-heading`, `--font-sans`, `--font-mono`, `--font-serif`
- Add `--border-mid` to both Paper and Carbon

Present the complete new `global.css` in full — no truncation, no placeholders. Then give the single commit command:

```
cd /Users/rajeshtaylor/Documents/refueler.io && git add src/assets/css/global.css && git commit -m "CSS-4: new global.css — token rationalisation, share-tokens merge, Paper #E8E2D8"
```

After committing, note that `src/assets/css/share-tokens.css` can now be deleted (Share pages load `global.css` via the standard `head.njk`). Give the delete + commit command separately.

---

## Opening prompt — CSS-5 (Sonnet — counted)

**Attach:** `Refueler_MasterContext_IO_CC80.md`, `SESSIONS-refueler-io-CC80.md`, `REFUELER-BRIDGE.md`

CSS-5 open. Full site verification. Fix anything broken.

CSS-4 is deployed. The new `global.css` is live. This session verifies every page renders correctly in both themes, fixes anything broken, and applies the Legend page simplification locked in CSS-1a.

**Verification order:**

1. `https://refueler.io/` — Paper default. Headline Cormorant Garamond. Gold overline. Subhead DM Sans 300. Capability block. Theme toggle. Carbon. Back to Paper.
2. `https://refueler.io/notes/` — Paper default. Source Serif 4 body. Note cards with DM Sans 400 body text. Theme toggle.
3. Each published Notes article — body type, `h2` dividers (gold inset-rule on article body only, not chrome). Paper and Carbon.
4. `https://refueler.io/editorial/` — and each editorial article.
5. `https://refueler.io/legend/` — Carbon default. Wordmark, input, tagline only. No green dot. No Silent Payments card. No below-fold block. Theme pill present. Toggle to Paper and back.
6. `https://refueler.io/share/` — Paper default. Upload zone. Turnstile. Theme toggle.
7. `https://refueler.io/share/upgrade/` — Plan cards. Stripe. Theme toggle including `stripeThemeRemount`.
8. `https://refueler.io/share/status/` — Status card. Worker data. Theme toggle.
9. `https://refueler.io/support/` and `https://refueler.io/privacy/` — both themes.
10. Nav on every surface: links correct, theme pill works, no broken links.

**Legend page simplification (CSS-1a locked — implement in this session):**
Read `https://raw.githubusercontent.com/rajesh-taylor/refueler-io/main/src/legend/index.njk` live. Remove: green credential dot, Silent Payments card, below-fold three-column block. Page at rest: wordmark, input, tagline only. Results render below input. One commit for this change.

**For each visual issue found:** diagnose, fix, commit. Per-issue commits — not one large fix commit.

At session close, update SESSIONS log with all issues found and commits made.

---

## Opening prompt — CSS-6 (Sonnet — counted)

**Attach:** `Refueler_MasterContext_IO_CC80.md`, `SESSIONS-refueler-io-CC80.md`, `REFUELER-BRIDGE.md`

CSS-6 open. Page CSS rationalisation. Per-file commits.

CSS-5 is complete. The site renders correctly. This session strips the remaining legacy cruft from `notes.css` and `legend.css`, and removes `!important` guards from `home.css` now that the cascade is fixed.

**Before touching anything, read live:**
- `https://raw.githubusercontent.com/rajesh-taylor/refueler-io/main/src/notes/notes.css`
- `https://raw.githubusercontent.com/rajesh-taylor/refueler-io/main/src/assets/css/legend.css`
- `https://raw.githubusercontent.com/rajesh-taylor/refueler-io/main/src/assets/css/home.css`

**Commit 1 — `notes.css` `:root` strip:**
- Remove the entire `:root` block (all token definitions — these are now in `global.css`)
- Remove duplicate nav, footer, and reset CSS (these are in `global.css`)
- Replace every `--text-primary`, `--text-secondary`, `--text-tertiary` reference with `--fg`, `--fg-muted`, `--fg-subtle`
- Replace solid-hex border values (`#D6D1C8`, `#35373B`) with `var(--border)` and `var(--border-mid)`
- Fix `backdrop-filter: blur(4px)` on `.modal-overlay` (D-3) — replace with solid `var(--bg)` at appropriate opacity, or remove if the modal scrim is not needed
- Visual re-verify notes pages in Paper and Carbon before committing
- Commit: `CSS-6a: notes.css — strip :root block, remove duplicate nav/footer, migrate to --fg* tokens`

**Commit 2 — `legend.css` `:root` strip:**
- Remove the `:root` block (font aliases `--font-heading/-sans/-mono`, `--border-mid`, `--inset-rule`, and `[data-theme="carbon"]` override of same)
- These tokens now live in `global.css` — no replacement needed, the cascade handles it
- Confirm legend page still renders correctly (wordmark, input, tagline, results)
- Commit: `CSS-6b: legend.css — strip :root block, font aliases now in global.css`

**Commit 3 — `home.css` `!important` strip:**
- Per the CSS-3 blueprint, identify which `!important` guards are now unnecessary because the cascade is fixed in the new `global.css`
- Exception: `#C8A96E !important` on the gold overline `<p>` stays until the cascade is definitively clean — do not remove this one without confirming it renders correctly first
- Commit: `CSS-6c: home.css — strip unnecessary !important guards`

**Commit 4 — alias cleanup:**
- Remove `--text-primary/secondary/tertiary` aliases from `global.css` (these were transition aliases — by this point nothing should reference them)
- Confirm with a grep across all CSS files before removing: `grep -r "text-primary\|text-secondary\|text-tertiary" /Users/rajeshtaylor/Documents/refueler.io/src/`
- Commit: `CSS-6d: global.css — remove --text-* transition aliases`

At session close, the CSS rationalisation track is complete. Update SESSIONS, MasterContext, and BRIDGE. CSS track status: all closed. Block 3 (franchise dashboard) is next.

---

*"Nothing stops this train."*
