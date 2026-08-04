# SESSIONS — refueler-io
*Canonical session log for `rajesh-taylor/refueler-io`.*
*Each entry: session ID · date · what shipped · carry-forward.*
*Last updated: CC-78 · 2026-08-04*

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

### CC-78 — date: 2026-08-04
**Scope:** Homepage technical implementation + copy finalisation. Planning session (uncounted for copy discussion; one counted session for implementation).

**Shipped:**

**`src/assets/css/home.css` — created:**
- Homepage layout only. No `:root` token block.
- Headline: `clamp(40px, 5.5vw, 72px)`, DM Sans 300, `var(--fg)`
- Subhead: `clamp(18px, 2vw, 24px)`, DM Sans 300, `var(--fg)` — elevated from muted caption to full foreground
- Capability block: three-column grid, `0.5px` border separators
- Capability descriptors: DM Sans 400 / 17px — was 300 / 15px, was unreadable on a sparse page
- Responsive: single column below 900px, horizontal borders become vertical separators

**`src/index.njk` — rewritten:**
- `:root` token block removed
- `html.carbon-mode` pattern removed
- `backdrop-filter` removed
- `localStorage`/`rfTheme`/`THEME_KEY` script removed
- Sign-in panel, magic link form, Supabase client script removed
- `extraHead` Supabase CDN removed
- `head.njk` + `home.css` link in place
- Mobile auth deep-link handler (`?mobileAuth=1`) retained — PKCE callback for consumer app
- CC-78 copy live: headline stripped to one line, subhead elevated, capability block finalised

**Copy locked CC-78 (extended from CC-77):**
- "Two rails. One principle." dropped — headline stands alone, lands harder
- "Chain queries" → "Bitcoin explorer"
- "Encrypted transfer" → "Encrypted transfers"
- Capability descriptors: all three finalised
- Bitcoin explorer descriptor: *Your search history is showing.*
- Legend index page opening line locked: *Buys non-KYC Bitcoin, then logs every address ever searched...*

**BRIDGE v1.9 — produced and committed to all three repos:**
- Coldcard corrected: entropy bug on MK3, not shipping leak
- Legend copy fully locked — homepage descriptor + index page opener
- Discarded candidates logged and closed
- Three Notes article seeds added: browsing history problem / family offices and UK merchants / Coldcard entropy bug
- Committed: `77f509a` (refueler-io), `5ecf1ab` (refueler-share), `0ce888f` (refueler-legend)

**Commits:** `f267602` (initial homepage), `77f509a` (copy finalised + BRIDGE)

**Carry-forward:**
- CC-79: strip `:root` token blocks from `the-city-worker` and `nothing-to-collect`
- Notes article seeds to be added to `notes-articles-list.md` in refueler-share at next Share session

---

### CC-77 — date: 2026-08-04
**Scope:** Homepage copy — discussion and lock. No code. Planning session (uncounted).

**Shipped:**

**Homepage copy locked:**
- Headline: *Two rails. One principle. / Your transaction is nobody else's business.*
- Subhead: *Fiat or Bitcoin — privacy included.*
- Capability block: Encrypted transfer / Chain queries / Lightning payments — all three labels and descriptors locked.
- No sign-in panel. No email form. No carbon block. Paper default. Then nothing.

**Copy assigned to other pages (locked, do not reassign):**
- *"Bitcoin, privately."* → Legend index page headline
- *"Built for jurisdictions that have laws. And lawyers."* → Share API / paid plans page
- *"Lightning payments — Tap and go. Sats or card, your call."* → Share upgrade / paid plans page

**North star locked (internal):**
*"They come for privacy, they stay and then fall in love with Bitcoin."*
Every product decision tested against this. Never homepage copy.

**Key decisions:**
- Homepage is Paper default (public-facing). No carbon block.
- Sign-in panel removed entirely. Option A confirmed.
- "Refueler Pass" agreed as working name for ticketing product (Cashu NUT primitives, no repo yet, name may change).
- Capability block reads top to bottom as a complete thought. Order locked.
- REFUELER-BRIDGE.md updated with all locked copy lines. Drop into refueler-io/docs/, refueler-share/, and refueler-legend/ repos.

**Carry-forward:**
- CC-78: Homepage technical implementation — `home.css`, `home-index.njk`, locked copy dropped in, token migration, backdrop-filter removal.

---

### CC-76 — date: 2026-08-04
**Scope:** Live verification across share.refueler.io and refueler.io. Colour divergence diagnosed. Session plan CC-77–82 locked.

**Shipped:**

**Item 1 — Live verification (share.refueler.io):**
- index: theme toggle confirmed working. `rs-theme` cookie present. `share-tokens.css` loading.
- upgrade: theme toggle confirmed working. `share-tokens.css` loading via `head.njk`.
- status: theme toggle confirmed working. `share-tokens.css` loading via `head.njk`.
- Console error on upgrade: `Uncaught ReferenceError: share is not defined` — pre-existing, not introduced this session. Carry to refueler-share project.

**Item 2 — Live verification (refueler.io):**
- editorial index: Carbon rendering. No console errors.
- notes index: Carbon rendering. No console errors.
- Source audit confirmed: `editorial/index.njk`, `support/index.njk`, `privacy/index.njk` all clean — no inline style blocks, no body theme scripts.
- `notes.js` confirmed: `rs-theme` cookie only, no `localStorage`.
- `global.css` confirmed: no `backdrop-filter`, solid `--nav-bg`, correct hex values.

**Item 3 — Colour divergence root cause identified:**
- Homepage (`src/index.njk`): inline `<style>` with own token block, `html.carbon-mode`, `localStorage`/`rfTheme`. Not yet migrated.
- Editorial articles (all four): inline `<style>` with `--carbon: #1E1F22` and `--paper: #F7F4EF` — wrong hex values from stale EDITORIAL-MASTER.md.
- Notes/support/privacy/editorial index: correct — `global.css` via `head.njk`.
- This is why three pages looked three different shades. Not a new bug — pre-existing unmigrated files.

**Item 4 — Locks added:**
- Every new page must load `head.njk` before any other code.
- Editorial articles may keep widget/layout CSS inline. Never a `:root` token block.
- `EDITORIAL-MASTER.md` token values are wrong — file predates CC-74 hex lock. Never use its CSS values.
- Homepage positioning: mission-led, then ecosystem. No Fenchurch St line on homepage. Copy agreed CC-77.

**Item 5 — Session plan locked (CC-77–82):**
- CC-77: Homepage copy — discussion and lock. No code.
- CC-78: Homepage technical fix — `home.css`, token migration, `rs-theme`, backdrop-filter removal, CC-77 copy.
- CC-79: Notes colour confirm + editorial articles Part 1 (the-city-worker, nothing-to-collect).
- CC-80: Editorial articles Part 2 (looks-done-isnt-done, the-float). Colour divergence permanently resolved.
- CC-81: Block 3 begins — franchise dashboard.
- CC-82+: Block 3 continues, then Block 5.

**Carry-forward:**
- `Uncaught ReferenceError: share is not defined` on upgrade page — carry to refueler-share project log.
- Homepage copy: agreed CC-77.
- All five unmigrated files: addressed CC-78/79/80.

---

### CC-75 — date: 2026-08-04
**Scope:** Share CSS architecture — single token source, upgrade/status theme fix.

*(Full log in SESSIONS-refueler-io-CC75.md)*

---

### CC-74 — date: 2026-08-04
**Scope:** AP-9 — global.css migration completion. Legend white-in-Paper fix. Carbon background standardisation.

*(Full log in SESSIONS-refueler-io-CC75.md)*

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

- Strip inline `<style>` from `src/index.njk` → ✅ Done CC-78
- New Anthropic API key for csuite briefing → before csuite briefing reuse
- `car_park_occupancy` strip from FEEDS array → bundle with next rail-signal-poll touch
- `blink-webhook_index.ts` delete or replace with v12 source → hygiene pass
- `bsc-dev` Dev Test item remove before TestFlight
- `Costa Coffee HQ` category label fix
- GitHub Actions red X on `9b9655d`
- LNBits webhook payload shape confirm with Ben Arc before Block 9
- Remaining hygiene folders: `06_Benchmarks`, `07_App_Specs`, `C-Suite`, `Session prompts`, `UK Banks`

---

*"Nothing stops this train."*
