# SESSIONS — refueler-io
*Canonical session log for `rajesh-taylor/refueler-io`.*
*Last updated: CC-80 · 2026-08-08 (CC-80 closed — nav pages restored, editorial :root migration complete)*

---

## Session allocation

Primary: 100 · Buffer: 25 · Total: 125
Planning/Opus sessions: uncounted by convention.
Buffer untouchable until a block overruns.
CSS rationalisation sessions added — uncounted planning + counted implementation.

---

## Block map

| Block | Scope | Status |
|---|---|---|
| Block 0 | Theme default fix, footer stamp, CC-25 banner, duplicate sessions query | ✅ Closed CC-65 |
| Block 1 | Schema hardening: RLS, opsTogglePause, PIN RLS | ✅ Closed CC-66 |
| Block 2 | Consumer app ↔ merchant tablet live connection | ✅ Closed CC-69 |
| Block 3 | Franchise dashboard | 🟡 Starts after CSS track |
| Block 4 | Dev console hardening + investor telemetry | ✅ Closed CC-65 |
| Block 5 | Merchant onboarding flow | 🟡 Queued after Block 3 |
| Block 6 | Darwin Push Port upgrade | ⚪ Deferred |
| Block 7 | Passenger count join | ⚪ Deferred |
| Block 8 | Fiat → sats rewards | 🟡 Gated on Block 5 |
| Block 9 | LNBits integration | ⚪ Deferred post merchant onboarding |
| Block 10+ | iOS/Android beta prep, Darwin bridge, Ticketing MVP | ⚪ Future |

---

## CSS rationalisation track (new — inserted before Block 3)

| Session | Scope | Type |
|---|---|---|
| CSS-1 | Design context cross-reference — BRIDGE + MasterContext + legend/share design files. Unified design reference doc produced. | Opus — uncounted |
| CSS-2 | global.css full audit — all CSS files in context. Findings report only, no changes. | Opus — uncounted |
| CSS-3 | New CSS architecture blueprint — token naming, cascade rules, reset strategy, page responsibilities. Plan only. | Opus — uncounted |
| CSS-4 | Implement new global.css against blueprint. Single commit. | Opus — counted |
| CSS-5 | Full site verification — every page, theme, nav, Paper/Carbon. Fix anything. | Opus — counted |
| CSS-6 | Page CSS rationalisation — strip `!important`, rename prefixes, clean home/notes/legend CSS. Per-file commits. | Opus — counted |

---

## Session log


### CC-80 — date: 2026-08-08
**Scope:** Part 1 — nav destination pages. Part 2 — editorial `:root` strip.

**Commits:**
- `ee3584b` — Part 1: restored four missing nav destination pages (`editorial/index.njk`, `legend/index.njk`, `support/index.njk`, `privacy/index.njk`). Root cause: pages never existed as Eleventy source files — lost at some point, not a nav bug.
- `2566bbf` — Part 2: stripped stale `:root` token blocks from `looks-done-isnt-done` and `the-float`. Also removed stale inline `localStorage`/`rfTheme` theme script from `looks-done-isnt-done`.

**All four editorial articles now fully migrated.** No remaining `:root` blocks in any editorial article.

**File naming rule clarified (CC-80):** When uploading multiple prefixed `index.njk` files for review, upload one at a time. Claude only sees the last file if all share the same name. Rename via `mv` before committing — directory provides uniqueness.

---

### CC-79b — date: 2026-08-05 (post-session update)
**Scope:** Nav fix committed. Session queue expanded. Files updated.

**Shipped:**

**Nav/homepage fix commits (CC-79 continuation):**
- `2ac19ea` — accent column removed from homepage (grid broke on live site)
- `17f69d6` — all CSS classes prefixed `home-`, overline gold hardcoded `#C8A96E !important`, subhead wrapped in `div.home-subhead-band` to own spacing independently of `p` tag reset
- Safari cache issue confirmed — Chrome shows correct render. Safari requires Develop → Empty Caches.

**Root cause documented:**
- `global.css` body sets `color: var(--fg)` which cascades into all `p` tags
- Page-level `p` colour overrides require `!important` or prefixed class names
- `var(--accent)` fails on `p` tags for same reason — hardcode `#C8A96E !important` until rationalisation
- `global.css` has duplicate token naming: `--fg/--fg-muted/--fg-subtle` AND `--text-primary/--text-secondary/--text-tertiary` — two parallel systems
- These issues will be resolved in CSS rationalisation track before Block 3

**Session queue expanded:**
- CSS rationalisation track (CSS-1 through CSS-6) inserted before Block 3
- CSS-1 is a design context cross-reference session to ensure Opus has full picture of all locked design decisions across refueler-io, refueler-share, and refueler-legend before touching any CSS

**Carry-forward:**
- ~~CC-80 Part 1: nav links~~ — ✅ Fixed `ee3584b`
- ~~CC-80 Part 2: editorial :root strip~~ — ✅ Fixed `2566bbf`
- CSS-1 through CSS-6: full rationalisation track
- Block 3 after CSS track complete

---

### CC-79 — date: 2026-08-05
**Scope:** Editorial Part 1 + homepage full redesign.

**Commits:**
- `553313f` — `:root` stripped from `the-city-worker` + `nothing-to-collect`
- `08b7b95` — homepage typography pass
- `f34a944` — homepage redesign: Cormorant Garamond, banded layout, new copy
- `5e251c2` — MasterContext CC-79, SESSIONS CC-79, BRIDGE v2.0
- `2ac19ea` — accent column removed
- `17f69d6` — home- prefixed classes, gold hardcoded, subhead band wrapper

**Design decisions locked:**
- Cormorant Garamond 600 for homepage headline
- "Privacy isn't a feature. It's the architecture." as subhead
- "Fiat or Bitcoin — privacy included." retired from homepage
- All homepage classes prefixed `home-` — global.css cascade defence
- Accent column deferred until Companies House registration

---

### CC-78 — date: 2026-08-04
**Scope:** Homepage technical implementation + copy finalisation.
**Commits:** `f267602`, `77f509a`

---

### CC-77 — date: 2026-08-04
**Scope:** Homepage copy lock. Planning session (uncounted).

---

### CC-76 — date: 2026-08-04
**Scope:** Live verification. Colour divergence root cause identified. Session plan locked.

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
**Scope:** Infrastructure housekeeping — global CSS, theme fix, API key rotation, Cloudflare build fix.

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
- Notes article seeds → `notes-articles-list.md` in refueler-share at next Share session
- Est. 2026 accent column → replace with Companies House reg on incorporation

---

## Opening prompt for CC-80

**Attach:** `Refueler_MasterContext_IO_CC79b.md`, `SESSIONS-refueler-io-CC79b.md`, `REFUELER-BRIDGE.md`

CC-80 open. Two parts.

**Part 1 — Nav fix (priority):**
Nav and footer links broken on refueler.io — Legend, Editorial, Privacy in nav do nothing. Privacy, Editorial, Support in footer do nothing. Notes works. Paper/Carbon toggle works. On share.refueler.io — Support in nav broken, Notes and Upgrade work.

Read these live before touching anything:
- `https://raw.githubusercontent.com/rajesh-taylor/refueler-io/main/src/_includes/nav.njk`
- `https://raw.githubusercontent.com/rajesh-taylor/refueler-io/main/src/_includes/footer.njk`
- `https://raw.githubusercontent.com/rajesh-taylor/refueler-io/main/src/_includes/head.njk`
- `https://raw.githubusercontent.com/rajesh-taylor/refueler-io/main/src/index.njk`
- `https://raw.githubusercontent.com/rajesh-taylor/refueler-share/main/src/_includes/nav.njk`
- `https://raw.githubusercontent.com/rajesh-taylor/refueler-share/main/src/_includes/footer.njk`

Diagnose first. Present findings. Then fix. Separate commits per repo.

**Part 2 — Editorial articles:**
Strip `:root` blocks from `looks-done-isnt-done` and `the-float`. Read live files first. Widget and layout CSS stays. Single commit.

**Standing rules:** Read every live file before writing. Present session plan before code. Separate commits per logical change. `home-` prefixed classes in home.css are locked — do not touch. Gold on `p` tags: hardcode `#C8A96E !important` — `var(--accent)` cannot override body cascade on `p` elements.

---

## Opening prompt for CSS-1 (Opus)

**Attach:** `Refueler_MasterContext_IO_CC80.md`, `SESSIONS-refueler-io-CC80.md`, `REFUELER-BRIDGE.md`

CSS-1 open. Design context cross-reference. Planning session — uncounted.

This is a read-only session. No code. No commits. Output is a unified design reference document only.

**Task:** Cross-reference all locked design decisions across the three active repos — refueler-io, refueler-share, refueler-legend — and produce a single reference document that captures:

1. Every locked font decision (typeface, weight, size, where used, which page, which product)
2. Every locked colour decision (token name, hex value, usage rule, which surfaces)
3. Every locked copy line and which page/product it belongs to
4. Every CSS architectural rule (cascade rules, token ownership, page CSS responsibilities, class naming conventions)
5. Legend-specific design decisions from BRIDGE (enterprise pricing, query credential UI, PIR sharding display, Silent Payments treatment)
6. Share-specific design decisions from BRIDGE (anonymity spectrum positioning, capability display, upgrade page treatment)
7. Any conflicts or gaps between what BRIDGE says and what MasterContext says

Read these live files as part of the session:
- `https://raw.githubusercontent.com/rajesh-taylor/refueler-io/main/src/assets/css/global.css`
- `https://raw.githubusercontent.com/rajesh-taylor/refueler-io/main/src/assets/css/home.css`
- `https://raw.githubusercontent.com/rajesh-taylor/refueler-io/main/src/assets/css/legend.css`
- `https://raw.githubusercontent.com/rajesh-taylor/refueler-io/main/src/assets/css/notes.css` *(if accessible)*
- `https://raw.githubusercontent.com/rajesh-taylor/refueler-share/main/src/assets/css/share-tokens.css`
- `https://raw.githubusercontent.com/rajesh-taylor/refueler-io/main/src/_includes/head.njk`

Output: one clean markdown document — `REFUELER-DESIGN-REFERENCE.md` — to be committed to all three repos and used as the source of truth for CSS-2 through CSS-6.

---

*"Nothing stops this train."*
