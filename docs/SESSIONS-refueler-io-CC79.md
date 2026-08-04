# SESSIONS — refueler-io
*Canonical session log for `rajesh-taylor/refueler-io`.*
*Each entry: session ID · date · what shipped · carry-forward.*
*Last updated: CC-79 · 2026-08-05*

---

## Session allocation

Primary: 100 · Buffer: 25 · Total: 125
Planning sessions: uncounted by convention.
Buffer is untouchable until a block overruns.
Note: session count can be increased — thoroughness over speed.

---

## Block map

| Block | Scope | Status |
|---|---|---|
| Block 0 | Theme default fix, footer stamp, CC-25 banner removal, duplicate sessions query | ✅ Closed CC-65 |
| Block 1 | Schema hardening: RLS scoping, opsTogglePause write, PIN RLS verify | ✅ Closed CC-66 |
| Block 2 | Consumer app ↔ merchant tablet live connection | ✅ Closed CC-69 |
| Block 3 | Franchise dashboard completion | 🟡 Starts CC-81 |
| Block 4 | Dev console hardening + investor telemetry | ✅ Closed CC-65 |
| Block 5 | Merchant onboarding flow | 🟡 Queued after Block 3 |
| Block 6 | Darwin Push Port upgrade | ⚪ Deferred |
| Block 7 | Passenger count join | ⚪ Deferred |
| Block 8 | Fiat → sats rewards | 🟡 Queued — gated on Block 5 |
| Block 9 | LNBits integration | ⚪ Deferred — post merchant onboarding |
| Block 10+ | iOS/Android beta prep, Darwin bridge, Ticketing MVP | ⚪ Future |

---

## Session log

### CC-79 — date: 2026-08-05
**Scope:** Editorial articles Part 1 (`:root` strip) + homepage full redesign. Three counted commits.

**Shipped:**

**Editorial — `the-city-worker` and `nothing-to-collect` (commit `553313f`):**
- Both files read live from GitHub before touching anything.
- `:root` token block removed from both — wrong hex values (`#1E1F22`, `#F7F4EF`) from stale EDITORIAL-MASTER.md.
- Mobile `@media` `:root { --gutter }` override also removed from `the-city-worker`.
- All widget CSS, layout CSS, `[data-theme="carbon"]` overrides, and modal JS untouched.
- Comments updated: "Widget and layout CSS only — tokens from global.css via head.njk."
- 2 files changed, 4 insertions, 71 deletions.

**Homepage typography pass (commit `08b7b95`):**
- `src/assets/css/home.css` — subhead `clamp(18px→22px, 2→2.5vw, 24→32px)`, cap labels `fg-subtle→fg-muted`, cap descriptors `17→20px` and `fg-muted→fg`.
- Identified as insufficient on visual review — led to full redesign below.

**Homepage full redesign (commit `f34a944`):**

*Design decisions made during session:*
- DM Sans 300 at display size reads as "sports kit" — replaced with Cormorant Garamond 600.
- Full-width headline with no right-side structure wasted space — replaced with banded layout.
- "Fiat or Bitcoin — privacy included." retired from homepage — doesn't represent Share or Legend. Belongs on product pages.
- Subhead italic in Cormorant was jarring at subhead size — replaced with DM Sans 300 roman, full `--fg`.
- Hairline between headline and subhead removed — subhead is the next sentence, not a new section.
- "Privacy isn't a feature. It's the architecture." chosen as subhead — covers all three products simultaneously.
- Overline "Privacy Infrastructure · London" and accent column (Est. 2026 / rule / REFUELER) added — structured use of right-side space.
- Three fonts tested via A/B artifact: Playfair Display, Cormorant Garamond, DM Serif Display. Cormorant selected.
- Multiple layout A/B tests run: two-column editorial, oversized headline band. Banded layout selected.

*`src/index.njk` — rewritten:*
- Cormorant Garamond 600 loaded via Google Fonts `<link>` in `index.njk` — not global, not `head.njk`.
- `head.njk` + `home.css` retained.
- New structure: `.overline` → `.headline-wrap` (headline + `.accent-col`) → `.subhead` → `.capability-block`.
- Forced `<br>` tags in headline: "Your transaction / is nobody else's / business." — "business." alone on line 3.
- Mobile auth deep-link handler (`?mobileAuth=1`, PKCE callback) retained verbatim.
- `analytics.js` retained.

*`src/assets/css/home.css` — rewritten:*
- New classes: `.overline`, `.overline-rule`, `.headline-wrap`, `.accent-col`, `.accent-year`, `.accent-line`, `.accent-mark`, `.subhead`.
- Headline: Cormorant Garamond 600, `clamp(3.5rem, 7vw, 6.5rem)`, line-height 0.98.
- Subhead: DM Sans 300, `clamp(1.125rem, 1.75vw, 1.5rem)`, full `var(--fg)`, no hairline above.
- Accent column hidden on mobile (`display:none` below 900px).
- Responsive: single column below 900px, cap block stacks vertically.
- 2 files changed, 113 insertions, 35 deletions.

**Carry-forward:**
- CC-80: strip `:root` blocks from `looks-done-isnt-done` and `the-float`. Read live files first. Colour divergence permanently resolved after this.
- CC-81: Block 3 — franchise dashboard.
- Homepage locked for one month — no further iteration without a formal session decision.
- Notes article seeds (browsing history / family offices / Coldcard) to be added to `notes-articles-list.md` in refueler-share at next Share session.
- "Est. 2026" in accent column: when company incorporates, replace with Companies House registration number and year.

---

### CC-78 — date: 2026-08-04
**Scope:** Homepage technical implementation + copy finalisation.

**Shipped:**

**`src/assets/css/home.css` — created:**
- Homepage layout only. No `:root` token block.
- Headline: `clamp(40px, 5.5vw, 72px)`, DM Sans 300, `var(--fg)`
- Subhead elevated to full `var(--fg)`, `clamp(18px, 2vw, 24px)`
- Capability block: three-column grid, `0.5px` border separators
- Capability descriptors: DM Sans 400 / 17px

**`src/index.njk` — rewritten:**
- `:root` token block removed. `html.carbon-mode` removed. `backdrop-filter` removed.
- `localStorage`/`rfTheme`/`THEME_KEY` script removed.
- Sign-in panel, magic link form, Supabase client script removed.
- `head.njk` + `home.css` in place. Mobile auth deep-link handler retained.
- CC-78 copy live.

**BRIDGE v1.9 — committed to all three repos:** `77f509a` (refueler-io), `5ecf1ab` (refueler-share), `0ce888f` (refueler-legend)

**Commits:** `f267602`, `77f509a`

---

### CC-77 — date: 2026-08-04
**Scope:** Homepage copy lock. No code. Planning session (uncounted).

**Decisions:** Headline / subhead / capability block copy locked. Sign-in panel removed. "Refueler Pass" as working name for ticketing. North star locked. BRIDGE updated.

---

### CC-76 — date: 2026-08-04
**Scope:** Live verification. Colour divergence root cause identified. Session plan CC-77–82 locked.

---

### CC-75 — date: 2026-08-04
**Scope:** Share CSS architecture — single token source, upgrade/status theme fix.

---

### CC-74 — date: 2026-08-04
**Scope:** AP-9 — global.css migration completion. Legend white-in-Paper fix. Carbon background standardisation.

---

### CC-73 — date: 2026-08-04
**Scope:** AP-8 — nav/theme/support fixes across refueler-io and refueler-share.

---

### CC-72 — date: 2026-08-04
**Scope:** Infrastructure housekeeping — global CSS extraction, theme fix, API key rotation, Cloudflare build fix, /legend/ routing fix.

---

### CC-71 — date: 2026-07-29
**Scope:** Repo hygiene — pre-pivot file purge. ~15,000 deletions.

---

### CC-70 — date: 2026-07-25 (planning)
**Decisions:** Fiat→sats rewards primary traction lever. LNBits deferred. VPS costed.

---

### CC-69 — date: 2026-07-20
**Scope:** Block 2 final close. NativeTabs routing incompatibility. Inline settled view. Three-layer settlement detection.

---

### CC-68 — date: 2026-07-20
**Scope:** Blink API key rotation. blink-webhook v12. PreOrderScreen polling fallback.

---

## Ongoing / bundled items

- New Anthropic API key for csuite briefing → before csuite briefing reuse
- `car_park_occupancy` strip from FEEDS array → bundle with next rail-signal-poll touch
- `blink-webhook_index.ts` delete or replace with v12 source → hygiene pass
- `bsc-dev` Dev Test item remove before TestFlight
- `Costa Coffee HQ` category label fix
- GitHub Actions red X on `9b9655d`
- LNBits webhook payload shape confirm with Ben Arc before Block 9
- Remaining hygiene folders: `06_Benchmarks`, `07_App_Specs`, `C-Suite`, `Session prompts`, `UK Banks`
- Notes article seeds → `notes-articles-list.md` in refueler-share at next Share session
- Est. 2026 in homepage accent column → replace with Companies House reg number on incorporation

---

*"Nothing stops this train."*
