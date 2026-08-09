# CSS-3 Blueprint — Refueler web CSS architecture
> **Session:** CSS-3 — new CSS architecture blueprint · Opus — uncounted
> **Date:** 2026-08-09
> **Status:** Planning only. No code, no commits. This is the last planning session before CSS-4 (Sonnet execution).
> **Baseline:** `CSS-2-AUDIT-FINDINGS.md` (findings) + `Refueler_MasterContext_IO_CC80.md` + `REFUELER-BRIDGE.md` v2.7 + `REFUELER-WEBSITE-DESIGN-REFERENCE.md`.
> **Precedence rule:** Where CSS-2 (live pull) and the design reference (pre-CSS-1a) disagree, CSS-2 wins. Token *values* are sourced from MasterContext CC-80 / BRIDGE v2.7 — **never** from the live files or design-reference §2.
> **Scope:** The three web surfaces — `refueler.io` (main site + editorial + notes + legend shell) and `refueler.io/share/`. Does **not** cover the React Native app, the Numo terminal, or the Command Centre HTML tools; those keep their own convention (Carbon always default, not togglable).
> **Handoff:** Attach to CSS-4. CSS-4 re-pulls live before acting, then implements Part E in order.

---

## Part A — The ten rulings (decision record)

| # | Item | Ruling |
|---|---|---|
| C-1 | Orange `--accent-action` | **Abolished.** Strip both tokens (`#D4690A` Paper, `#F5820A` Carbon) in CSS-4. Both are unused. No CTA orange anywhere. |
| C-2 | Homepage default theme | **Paper.** Live `head.njk`, BRIDGE and claude.md agree. Correct the stray "Carbon default" line in MasterContext. No code change. |
| C-4 | Token naming winner | **`--fg*` wins.** `--text-*` become aliases to `--fg*` at CSS-4; `notes.css` migrates its body off `--text-*` in CSS-6. |
| 4 | `--inset-rule` canonical value | **`var(--border)` in both themes.** Neutral structural hairline, never gold. Carbon `#C8A96E` overrides removed. Gold moves to explicit `var(--accent)` on a closed consumer list (see §A.4). |
| 5 | `--surface` merge type | **Solid hex wins.** Canonical BRIDGE values. Share adopts solid `--surface`/`--surface-raised`/`--border-mid` at the CSS-4 merge; translucent rgba dropped. |
| 6 | Privacy bespoke footer | **CSS-5 verification item.** Confirm rendered stamp before CSS-6 migrates it to global `.site-footer`. Not a CSS-3 code decision. |
| 7 | `notes.css` h2 gold | **Both themes.** Gold applied consistently in Paper and Carbon. Asymmetry removed. |
| 8 | `backdrop-filter` on notes modal | **Strip.** Replace with solid semi-opaque scrim in CSS-6. No §6.4 exemptions. |
| 9 | Mobile nav | **Unify.** One breakpoint (640px), one selector, applied everywhere in CSS-4. Disclosure control (hamburger) deferred to a dedicated nav session. |
| 10 | Legend green dot + below-fold block | **CSS-5 removes both** (plus Silent Payments card). Design-reference §9 superseded. Above-results layout = wordmark + input + tagline only. |

### A.4 — Gold (`--accent` `#C8A96E`) permitted-consumer list — CLOSED

Gold is applied via **`var(--accent)`** directly on these selectors only, in **both themes**:

1. Article-body `h2` divider (`border-top`) — `/notes/` and `/editorial/` article content.
2. Article-body blockquote left-border — `/notes/`, `/editorial/`, and privacy `.pull-quote` (blockquote-equivalent).

**Forbidden — must use `var(--border)`** (i.e. `--inset-rule`):
- All nav / header / footer borders, including Share header and footer.
- All card and panel components: `.inset-card` (support, privacy), `.contact-highlight`, `.notice-block`, `.ico-block`.
- Any chrome of any kind.

Enforcement: after CSS-6, `var(--accent)` used as a border/rule colour anywhere outside the two permitted selectors is a violation on sight. `--inset-rule` is neutral (`var(--border)`); it can appear anywhere.

### A.4a — Consequences of ruling 4 for each file
- `support.css` `.inset-card` gold → `var(--border)`.
- `privacy.css` `.inset-card`, `.contact-highlight`, `.notice-block` → `var(--border)`. `.pull-quote` → `var(--accent)` (retained, now both themes). `.ico-block` stays `var(--border)` — resolves the identical-blocks inconsistency (cards neutral, quotes gold).
- `notes.css` `.article-body h2` and blockquotes → `var(--accent)` explicitly (can no longer rely on `--inset-rule` being gold-in-Carbon).
- `share-tokens.css` header/footer border gold → resolves automatically once Share consumes global `--inset-rule` (= `var(--border)`).

---

## Part B — Canonical token table for `global.css` `:root`

Values sourced from MasterContext CC-80 / BRIDGE v2.7. CSS-4 confirms secondary tokens (marked †) against the live file at implementation; primaries below are authoritative.

### Paper (default — `:root`)
| Token | Value | Note |
|---|---|---|
| `--carbon` | `#1A1A1A` | raw brand constant |
| `--paper` | `#E8E2D8` | raw brand constant (CSS-1a) |
| `--bg` | `#E8E2D8` | |
| `--fg` | `#1A1A1A` | canonical primary text |
| `--fg-muted` | `#5A5550` | |
| `--fg-subtle` | `#9A9590` | |
| `--surface` | `#DAD4CA` | solid — ruling 5 |
| `--surface-raised` | `#D0C9BE` | solid |
| `--border` | `rgba(26,26,26,0.12)` | |
| `--border-mid` | `#B8B2A8` | solid |
| `--inset-rule` | `var(--border)` | neutral, both themes (ruling 4) |
| `--input-bg` | `#CCC7BE` | recessed well (CSS-1a) |
| `--input-border` † | `rgba(26,26,26,0.18)` | retained from CSS-1 |
| `--nav-bg` | `#E8E2D8` | solid, = bg (stale `#F5F0E8` removed) |
| `--divider-color` † | `rgba(26,26,26,0.14)` | retained |
| `--metric-block-bg` † | `rgba(26,26,26,0.04)` | retained |
| `--submit-bg` / `--submit-fg` † | `var(--carbon)` / `var(--paper)` | retained |
| `--accent` | `#C8A96E` | gold — restricted consumers only |
| `--accent-hover` | `#E0C48A` | |
| `--warn` | `#B87333` | brand Warn (Paper) — newly tokenised on web |
| `--danger` | `#E05252` | brand Danger — newly tokenised on web |
| `--text-primary` | `var(--fg)` | alias (C-4 transition) |
| `--text-secondary` | `var(--fg-muted)` | alias |
| `--text-tertiary` | `var(--fg-subtle)` | alias — closes Share colophon gap |

### Carbon (override — `[data-theme="carbon"]`)
| Token | Value | Note |
|---|---|---|
| `--bg` | `#1A1A1A` | |
| `--fg` | `#F5F0E8` | text on dark (canonical) |
| `--fg-muted` | `#B0AAA2` | |
| `--fg-subtle` | `#6A6560` | |
| `--surface` | `#26282C` | solid |
| `--surface-raised` | `#2E3035` | solid |
| `--border` | `rgba(245,240,232,0.10)` | |
| `--border-mid` | `#4A4D52` | solid |
| `--inset-rule` | `var(--border)` | **neutral — NOT `#C8A96E`** (ruling 4) |
| `--input-bg` | `#252525` | |
| `--input-border` † | `rgba(245,240,232,0.18)` | retained |
| `--nav-bg` | `#1A1A1A` | solid |
| `--accent` | `#C8A96E` | |
| `--accent-hover` | `#E0C48A` | |
| `--warn` | `#C8943A` | brand Warn (Carbon) |
| `--danger` | `#E05252` | |
| `--text-primary` | `var(--fg)` | alias |
| `--text-secondary` | `var(--fg-muted)` | alias |
| `--text-tertiary` | `var(--fg-subtle)` | alias |

**No `--accent-action` in either theme** (ruling C-1).

**Theme mechanism (unchanged, restated to prevent drift):** persistence is cookie **`rs-theme`** scoped to `.refueler.io` (30-day rolling, `SameSite=Lax`), applied before first paint in `head.njk`; detection is `document.documentElement.dataset.theme === 'carbon'` only. Web default is **Paper** (`getCookie('rs-theme') || 'paper'`); **Legend template only** defaults Carbon (`|| 'carbon'`). `rfTheme`, `html.carbon-mode`, `setTheme()` and `localStorage` for theme are **abolished** on all web surfaces.

**Stale / abolished — must not appear post-CSS-4:** `#1E1F22` · `#F7F4EF` · `#F5F0E8` (old Paper) · `#F5820A` · `#D4690A` · off-palette Share status colours (see §E Pass 2).

---

## Part C — Single font-alias vocabulary

Four aliases for the four global faces, defined **once** in `global.css` `:root` (tokens are permitted in the domain owner). Applied everywhere; all other vocabularies deleted.

| Alias | Value | Faces it covers |
|---|---|---|
| `--font-heading` | `'Satoshi', 'DM Sans', sans-serif` | wordmark, labels, metric values (600/700) |
| `--font-sans` | `'DM Sans', sans-serif` | UI, body (300/400/500) |
| `--font-serif` | `'Source Serif 4', Georgia, serif` | editorial / notes body, table cells |
| `--font-mono` | `'IBM Plex Mono', monospace` | timestamps, codes, data (400/500) |

**Homepage headline is NOT tokenised.** `'Cormorant Garamond', Georgia, serif` 600 loads in `src/index.njk` only, never global.

**Vocabularies to delete at CSS-6:**
- `share-tokens.css`: `--display`, `--heading`, `--sans`, `--serif`, `--mono` (and the redundant `--display`/`--heading` identical pair — collapse both to `--font-heading`).
- `legend.css`, `notes.css`: local `--font-heading/-sans/-mono` (+ notes `--font-serif`).
- `editorial.css`, `support.css`, `privacy.css`: local `--font-serif`.
- Non-standard fallbacks in `notes.css` (`system-ui` on sans, `'Courier New'` on mono) — removed; use the canonical values above.

---

## Part D — File ownership & load order

**Load order (every page):** `head.njk` links the domain token owner (`global.css`) first, before any page CSS. Page CSS is layout-only. `head.njk` remains the single theme-script owner.

| File | Owns after rationalisation | `:root` allowed? |
|---|---|---|
| `global.css` | All tokens (incl. font aliases, warn/danger), reset, nav, footer, theme pill, canonical mobile-nav collapse | **Yes — sole owner** |
| `home.css` | Homepage layout, `home-` prefixed | No |
| `legend.css` | Legend layout only | No (strip in CSS-6) |
| `editorial.css` | Editorial index layout only | No (strip in CSS-6) |
| `support.css` | Support layout only | No (strip in CSS-6) |
| `privacy.css` | Privacy layout only | No (strip in CSS-6) |
| `notes.css` | Notes/article layout only | No (strip in CSS-6) |
| `share-tokens.css` | — merged into `global.css` at CSS-4, then retired | n/a |
| `share.css` | Share upload/download layout only | No |
| `plans.css` / `status.css` | Share plans / status layout only | No |

Target definition of "clean": a page CSS file contains **no `:root` block of any kind** — not base tokens, not font aliases, not border/inset helpers. Under this definition, `home.css` is the only file currently compliant; the rest are brought into line by CSS-4 (share) and CSS-6 (the rest).

---

## Part E — CSS-4 implementation sequence (Sonnet execution)

CSS-4 rewrites **`global.css` only** plus the Share token merge. It does **not** touch `legend.css`, `notes.css`, `editorial.css`, `support.css`, `privacy.css` layout (those are CSS-6). Re-pull live before starting.

**Pass 1 — `global.css` `:root` rewrite.**
- Replace Paper + Carbon token blocks with Part B verbatim.
- Add the four font aliases (Part C).
- Add `--warn` / `--danger` (both themes).
- Add `--text-*` aliases → `--fg*`.
- Set `--inset-rule: var(--border)` in **both** themes.
- Strip both `--accent-action` tokens.
- Remove any surviving `#F5F0E8` / stale surface / stale input values.

**Pass 2 — merge `share-tokens.css` into `global.css`.**
- Adopt solid `--surface` / `--surface-raised` / `--border-mid` (ruling 5) — drop Share's translucent rgba.
- Point Share status classes at canonical tokens: `.cap-warn`/maintenance banner → `--warn`; `.danger-txt`/degraded banner → `--danger`. Delete `#D97706`, `#C0392B`, `#9E8050`, `#C8A951`.
- **Success-green `#27AE60` — DECISION NEEDED (see Part H).** Until ruled, keep it as a single Share-scoped `--success` token; do not promote to canonical.
- Reconcile Share structural tokens to canonical: border weight `0.5px` (from `1px`), radii `--radius-card:10px` / `--radius-btn:8px` / `--radius-modal:12px` (from single `6px`). **Highest visual-risk change — CSS-5 sign-off required** (see Part F). If the founder elects a formal Share exemption instead, skip this bullet and keep Share's 1px/6px, documented as an exemption.
- Collapse redundant Share font pair `--display`/`--heading` → `--font-heading`; map `--sans/--serif/--mono` → `--font-*`.
- Keep Share-only component tokens (`--card-bg`, `--drop-border`, `--tag-bg`, `--link-box-bg`, etc.) scoped for now; rename/promote decision logged for CSS-6.
- Gold-on-chrome (Share header/footer border) resolves automatically via the now-neutral `--inset-rule`.

**Pass 3 — canonical mobile-nav collapse.**
- Add to `global.css`: `@media (max-width:640px){ .site-nav a:not(.active){display:none} }` (theme pill and wordmark remain visible).
- Divergent collapse rules in `notes.css` (640px) and `share-tokens.css`/Share (600px) are removed at CSS-6 so global governs.

CSS-4 does **not** strip `!important`, migrate notes body, remove duplicate nav/footer, or touch Legend layout — those are CSS-5/CSS-6.

---

## Part F — CSS-5 verification checklist (full-site, Paper + Carbon)

Verify every surface in **both** themes on desktop and at ≤640px.

- [ ] Homepage: Paper default on load; overline gold; Cormorant headline; subhead band; capability block. No orange.
- [ ] Theme toggle works and `rs-theme` cookie persists across `refueler.io` ↔ `refueler.io/share/`.
- [ ] Legend: Carbon default; **green credential dot removed**; **below-fold three-column block removed**; **Silent Payments card removed**; layout = wordmark + input + tagline only above results. *(This removal is executed as part of CSS-5.)*
- [ ] Notes body colour shift (`#3D3A36` → `#1A1A1A` Paper) reads correctly for long-form — deliberate consequence of C-4; eyeball it.
- [ ] Notes h2 divider + blockquotes render gold in **both** themes (ruling 7).
- [ ] Cards everywhere render neutral `--border` left-rules (support/privacy `.inset-card`, `.contact-highlight`, `.notice-block`, `.ico-block`) — no gold on any card.
- [ ] **Privacy footer carries the exact stamp** `© 2026 Refueler Ltd (incorporating) · refueler.io` (ruling 6) — record result; feeds CSS-6 footer migration.
- [ ] **Share visual regression pass** (highest risk): cards, drop zone, plans, status render acceptably with solid surfaces + 0.5px borders + 10/8/12 radii. If regressed, invoke the Share-exemption fallback (Part H) rather than shipping.
- [ ] Share status page: warn/degraded states show canonical `--warn`/`--danger`; success state renders (per Part H decision).
- [ ] Mobile ≤640px: single collapse behaviour on all navs; active link + wordmark + pill visible; note (do not fix) the absent disclosure control.
- [ ] No `#F5820A` / `#D4690A` / `#F5F0E8` anywhere (grep the built `_site`).

---

## Part G — CSS-6 migration scope (page CSS rationalisation)

- **Strip `:root` from** `legend.css`, `notes.css`, `editorial.css`, `support.css`, `privacy.css`. All tokens/font-aliases now come from `global.css`.
- **`notes.css`:** migrate body and all colour refs `--text-*` → `--fg*` (~40 references, ~587 lines); delete duplicate nav/footer/theme-pill chrome (7+ selectors); delete duplicate `--gold`/`--gold-hover` (unused); delete non-standard font fallbacks; set `.article-body h2` + blockquotes to `var(--accent)` explicitly (both themes); **strip `backdrop-filter` on `.modal-overlay`, replace with a solid semi-opaque scrim** (ruling 8); solid-hex borders (`#D6D1C8`/`#35373B`) → canonical `--border`.
- **`legend.css`:** move font aliases + `--border-mid`/`--inset-rule` to global (done in CSS-4 tokens); remove local `:root`; `--inset-rule` now neutral.
- **`support.css` / `privacy.css`:** drop gold from card components → `var(--border)` (§A.4a); `.pull-quote` → `var(--accent)`; remove local `:root` + `--font-serif`; **migrate privacy bespoke footer to global `.site-footer` component** (only after CSS-5 confirms the stamp), resolving the `.footer-links` class collision; remove bare-element overrides (`body`, `html`, unscoped `a`).
- **`home.css`:** strip `!important` (cascade defence no longer needed once tokens are canonical); replace literal `0.5px solid` with `var(--border-weight) solid`; confirm `.home-cap-desc` `line-height` (1.45) intent — not a card, likely out of card-body lock.
- **Cross-file:** remove divergent mobile-nav collapse rules from `notes.css`/Share so global (640px) governs; unify remaining `--font-serif` redefinitions.
- **Naming cleanup:** resolve `.data-table` collision (defined differently in `notes.css` and `privacy.css`).

---

## Part H — Deferred beyond CSS-6 (with reason)

| Item | Reason for deferral |
|---|---|
| **Success-green `#27AE60` → `--success`** | Adding a success colour is a formal palette addition; brand lock (claude.md) requires a founder decision. Kept Share-scoped until ruled. **Blocks nothing except the Share status success state.** |
| **Share structural exemption (fallback to 1px/6px)** | Only invoked if CSS-5 finds the solid-surface + 0.5px + 10/8/12 adoption regresses Share visually. Documented as the rollback path for the highest-risk change. |
| **Mobile-nav disclosure control (hamburger)** | Unifying the collapse mechanism is rationalisation; adding a disclosure control is a build/design task. Dedicated nav session. |
| **Share sub-nav strip (SN-1/SN-2)** | Separate block of work, already queued after the CSS track. |
| **Est. 2026 / accent column** | Blocked on Companies House incorporation (reg number). |
| **Paper input recess review** | Scheduled after one month in production. |
| **Legend account link / query logic** | Post-B9. Out of CSS scope entirely. |
| **Share colophon `--text-tertiary` confirm** | Gap closes at CSS-4 (alias added); final verification belongs to CSS-7 when the colophon is touched. |

---

## MasterContext corrections this session feeds back
- C-2: correct any "Carbon default" homepage phrasing → "Paper default on load; Carbon on toggle."
- CSS status table: `editorial.css` 🟡, `support.css` 🟡, `privacy.css` 🔴 (all currently mismarked "✅ Clean").
- Design-reference §2 and §9 flagged superseded (values pre-CSS-1a; Legend layout pre-removal-lock).

---

*"Nothing stops this train."*
