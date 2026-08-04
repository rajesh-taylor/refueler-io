# SESSIONS — refueler-io
*Canonical session log for `rajesh-taylor/refueler-io`.*
*Each entry: session ID · date · what shipped · carry-forward.*

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
| Block 3 | Franchise dashboard completion | 🟡 Next |
| Block 4 | Dev console hardening + investor telemetry | ✅ Closed CC-65 |
| Block 5 | Merchant onboarding flow | 🟡 Queued |
| Block 6 | Darwin Push Port upgrade | ⚪ Deferred |
| Block 7 | Passenger count join (CC-48) | ⚪ Deferred |
| Block 8 | Fiat → sats rewards (pay by card, earn Bitcoin) | 🟡 Queued — high priority for traction |
| Block 9 | LNBits integration | ⚪ Deferred — post merchant onboarding |
| Block 10+ | Editorial, iOS/Android beta prep, Darwin bridge deploy, Ticketing MVP | ⚪ Future |

---

## Session log

### CC-72 — date: 2026-08-04
**Scope:** Infrastructure housekeeping — global CSS extraction, theme fix, API key rotation, Cloudflare build fix, /legend/ routing fix.

**Shipped:**

**Item 1 — Global CSS + theme fix:**
- Extracted nav, footer, brand tokens, reset from `src/index.njk` inline `<style>` block into new `src/assets/css/global.css` (commit `49e3551`)
- `[data-theme="carbon"]` selector throughout — replaces `html.carbon-mode` everywhere
- `src/_includes/head.njk` rewritten: loads `global.css` via `<link>`; theme script switched from `classList`/`localStorage` to `document.documentElement.dataset.theme` + `rs-theme` cookie scoped to `.refueler.io` (30-day rolling)
- `toggleTheme()` remains a global function for the pill button in `nav.njk`

**Item 2 — Anthropic API key rotation:**
- Key `sk-ant-api03-oRMzj1Z...` was hardcoded in `refueler_csuite_briefing_v2_4.html` line 358, in public GitHub repo
- Unexpected API charges confirmed — key was scraped and used by third party
- Key disabled in Anthropic console. Hard spend limit set
- `refueler_csuite_briefing_v2_4.html` cleaned: key replaced with placeholder comment (commit `562166c`)
- New key not yet generated — deferred, low urgency with spend limit active

**Item 3 — _redirects SPA catch-all removed:**
- `_redirects` had `/* /index.html 200` — was silently rewriting all routes to homepage
- Root cause of `/legend/` serving homepage content despite correct Eleventy output
- Removed. Two rules remain: `/auth/v1/*` proxy and `/.well-known/*` passthrough (commit `f968b8e`)

**Item 4 — Submodule registrations purged (root cause of all Cloudflare build failures since AP-7):**
- `refueler-app` was registered as a git submodule in `refueler-io` with no URL in `.gitmodules`
- `terminals/numo-fork` was also registered as a submodule with no URL
- Cloudflare Pages Build System v3 attempts to clone all submodules at the clone stage — both caused fatal errors before the build even started
- Both removed via `git rm --cached` (commits `5dd3001`, `a5e4eb5`)
- `git submodule status` confirmed clean — no submodules remaining
- This was the root cause of every "No deployment available" failure since commit `be0e536` (AP-7 Legend work, ~10 hours before this session)

**Item 5 — Cloudflare build command updated:**
- Changed from `npx @11ty/eleventy` to `npm install && npx eleventy`
- Build System v3 was not reliably installing dependencies before running the build command
- Updated in Cloudflare Pages dashboard Settings → Build configuration

**Result:** `a5e4eb5` deployed successfully — all four build stages green. `/legend/` now routes correctly and renders with styled nav and footer. Theme follows visitor's `rs-theme` cookie, defaulting to Paper.

**Carry-forward:**
- Inline `<style>` block in `src/index.njk` still contains old nav/footer/token CSS with `html.carbon-mode` selector — redundant now `global.css` is live. Strip in a future session (safe to defer — no conflict, just dead code)
- New Anthropic API key needed for `refueler_csuite_briefing_v2_4.html` — generate fresh key, store securely outside repo. Do not hardcode in any file
- `blink-webhook_index.ts` in repo: stale Svix version — delete or replace with v12 source
- GitHub Actions red X on commit `9b9655d` — non-fatal, fix when convenient
- `car_park_occupancy` strip from FEEDS array — bundle with next rail-signal-poll touch
- `bsc-dev` Dev Test item in `PreOrderScreen.tsx` — remove before TestFlight
- `Costa Coffee HQ` category label: `Franchise_hq` → proper display name in venue list
- One Blink-to-Blink E2E pay to confirm settled view fires end-to-end
- `refueler_eta_widget.html`, `refueler_england_skin.html`: review active status next hygiene pass
- Remaining folders to review: `06_Benchmarks`, `07_App_Specs`, `C-Suite`, `Session prompts`, `UK Banks Crisis Management Re...`

**Next session:** Share nav update (`share.refueler.io`) — update nav links (drop APP, add LEGEND, keep UPGRADE), wire `rs-theme` cookie cross-domain theme persistence. Use `REFUELER-BRIDGE.md` as shared context.

---

### CC-71 — date: 2026-07-29
**Scope:** Repo hygiene — pre-pivot file purge across `rajesh-taylor/refueler-io`.

**Shipped:**
- Removed 9 CC-18 legacy onboarding/pre-pivot HTML files: `refueler_M01`–`M06`, `refueler-magic-link-email.html`, `refueler_cashu_gdpr_briefing.html`, `refueler_defensibility_document.html` (commit `6914188`)
- Removed `01_Prototypes/` folder — Costco/CarPlay/EV era, 8 files (commit `2d062d3`)
- Removed `02_B2C_Markets/` folder — Notting Hill concierge/Hamptons era (commit `2d062d3`)
- Removed `05_Field_Notes/README.md` and `05_Field_Notes/04_Costa-Coffee_Lakeside/Costa_Coffee_app_UX.md` — pre-pivot UX research (commit `d5cfc19`)
- Removed 10 pre-pivot root files: `c2c_Route_Map.pdf`, `field_log_app_spec_v1_4.md`, `mcp-connected.md`, `refueler_field_log_v2.html`, `refueler_locate_v2.html`, `refueler_minibits_onboarding.html`, `refueler_scan.html`, `refueler_typography_comparison.html`, `refueler_ux_flow_all_screens_v2.html`, `refueler_value_proposition_v1_1.html` (commit `e977bb3`)
- Total: ~15,000 deletions across 4 commits. Repo significantly cleaner.

**Kept (pending review):**
- `refueler_csuite_briefing_v2_4.html` — active, used with Claude API for weekly market analysis report
- `refueler_eta_widget.html` — potentially still active, review deferred
- `refueler_england_skin.html` — potentially still active, review deferred
- `App.tsx` — not found in `refueler-app` repo (HTTP 404 confirmed), keeping until located
- `05_Field_Notes/Lakeside_Audit/lakeside_audit.md` — real field timing data, relevant to pre-order flow

**Remaining folders to review (next hygiene pass):**
- `06_Benchmarks`, `07_App_Specs`, `C-Suite`, `Session prompts`, `UK Banks Crisis Management Re...`

**Carry-forward:** (absorbed into CC-72 carry-forward above)

---

### CC-70 — date: 2026-07-25 (planning)
**Scope:** Planning session — CypherMunk House / Ben Arc (LNBits) context. No code shipped.

**Decisions logged:**
- Fiat → sats rewards confirmed as primary traction lever (Block 8)
- LNBits deferred until post merchant onboarding (Block 9)
- LNBits prep work approved — document webhook swap points only
- Ticketing proto-concept confirmed (8-char reference → one-time token via BoltCard/LNURL-withdraw)
- VPS costed: Hetzner CX22 ~€4.50/month

---

### CC-69 — date: 2026-07-20
**Scope:** Block 2 final close — E2E Step 7 fix (settled view). PreOrderScreen UX polish.

**Shipped:**
- NativeTabs routing incompatibility confirmed — `router.replace`/`router.push` to sibling routes not supported
- Fix: inline `setView('settled')` — `SettledView` renders within PreOrderScreen
- Three-layer settlement detection: Realtime + 3s poll + AppState foreground guard
- BOLT11 invoice string removed from UI. Button order swapped. Routing fee display rule locked
- Commits `b539b7d` through fee display fix on `refueler-app`

---

### CC-68 — date: 2026-07-20
**Scope:** Security: Blink API key rotation. Step 7 fix: PreOrderScreen polling fallback.

**Shipped:**
- `refueler-beta` key revoked, `refueler-cc68` active
- `blink-webhook` v12 redeployed (commit `44f2620`)
- PreOrderScreen 3s polling fallback added (commit `84e1c91`)

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

### Share nav update (next session — separate Share project)
- Update `share.refueler.io` nav: drop APP link, add LEGEND link, keep UPGRADE
- Wire `rs-theme` cookie for cross-domain theme persistence with `refueler.io`
- Use `REFUELER-BRIDGE.md` as shared context file

### Block 3 — Franchise dashboard completion (5–8 sessions)
1. Per-venue commission breakdown wired to real `orders` data scoped to `franchise_group_id`
2. Operator Controls: `toggleVenueActive` and `saveEmail` — verify RLS policies, implement writes
3. KPI strip: live order counts, revenue, commission — real data not stubs

### Block 5 — Merchant onboarding flow (8–12 sessions)
1. Magic link sign-in → role assignment → PIN set → first login confirmed
2. `merchant_users` row creation provisioning mechanism
3. PIN set screen — web page for owner PIN setup post-first-login
4. Staff PIN distribution flow
5. Venue association confirmation screen

### Block 8 — Fiat → sats rewards (queued, high priority)
- Gate: Block 5 must be live first

### Block 9 — LNBits integration (deferred — post merchant onboarding)
- Gate: 1–2 merchants live and generating real volume

### Ongoing / bundled
- Strip inline `<style>` from `src/index.njk` (safe, deferred)
- New Anthropic API key for csuite briefing — generate fresh, store outside repo
- `car_park_occupancy`: strip from FEEDS array
- `blink-webhook_index.ts`: delete or replace with v12 source
- `bsc-dev` Dev Test item: remove from `PreOrderScreen.tsx` before TestFlight
- `Costa Coffee HQ` category label fix
- GitHub Actions red X on `9b9655d`: fix when convenient
- One Blink-to-Blink E2E test
- LNBits webhook payload shape: confirm with Ben Arc before Block 9
- `refueler_eta_widget.html`, `refueler_england_skin.html`: review active status
- Remaining hygiene folders: `06_Benchmarks`, `07_App_Specs`, `C-Suite`, `Session prompts`, `UK Banks`

---

*"Nothing stops this train."*
