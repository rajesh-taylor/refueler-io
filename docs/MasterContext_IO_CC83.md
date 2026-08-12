# Refueler Master Context — IO CC-83
*Updated: 2026-08-12 (CC-83 — Sonnet counted. Design-only session. Merchant terminal nav, horizon strip, order tiles, portrait layout, product architecture locked. No code written. CC-83b is next for production code.)*
*Supersedes: Merchant-Sats-C*
*Sync log: MasterContext_IO_CC83 — no schema changes this session. Nav and UI decisions locked. NumoPay fork scoped. refueler-app dev branch push pending.*

---

## Session allocation
500 primary + 50 buffer = 550 total. Planning/Opus sessions uncounted.
**Block review sessions** — standing uncounted Opus at end of each block. Recalibrate priorities and session allocation.
Sessions used to CC-83: ~84 counted + uncounted planning sessions.

---

## Project overview

Refueler is a Bitcoin-native privacy ecosystem. Products: Share (anonymous encrypted file transfer, live at `refueler.io/share/`), Legend (privacy-first block explorer, post-B9), consumer pre-order app (Fenchurch St line), merchant terminal (cafés and restaurants near stations), Pass (Lightning-native ticketing and venue access — own repo and Claude project), NumoPay fork (in-house order taking, Android, waiter/floor use).

**Mission:** A Bitcoin-native privacy layer operating within UK jurisdictional law. Not a fintech product. Not a loyalty app. A Bitcoin world that works quietly, legally, and without surveillance.

**North star (internal only):** Come for privacy, stay for Bitcoin.

**Supabase project:** `tihgvdokeofnjxjkenmm`
**Webhook URL:** `https://tihgvdokeofnjxjkenmm.supabase.co/functions/v1/blink-webhook`

**GitHub repos:**
| Repo | Status | Local path |
|---|---|---|
| `rajesh-taylor/refueler-io` | Public — web/Command Centre/Supabase | `/Users/rajeshtaylor/Documents/refueler.io/` |
| `rajesh-taylor/refueler-app` | Public — React Native consumer app | `/Users/rajeshtaylor/Documents/refueler.io/refueler-app/` · **dev branch local only — push pending** |
| `rajesh-taylor/numo-fork` | Public — NumoPay fork v1.6 (cashubtc/Numo v1.8 base) | `/Users/rajeshtaylor/Documents/refueler.io/terminals/numo-fork/` |
| `rajesh-taylor/refueler-share` | Public — BLAKE3 + Cashu file transfer | `/Users/rajeshtaylor/Documents/refueler-share/` |
| `rajesh-taylor/refueler-legend` | Public — Legend chain explorer + ARM Bitcoin indexer | `/Users/rajeshtaylor/Documents/refueler-legend/` |
| `rajesh-taylor/refueler-mint` | Public — CDK Rust loyalty stamp mint | `/Users/rajeshtaylor/Documents/refueler-mint/` |
| `rajesh-taylor/refueler-pass` | Public — Pass ticketing + venue access | Own repo + Claude project — Pass-A/B sessions |
| `refueler-ecash-lab` | **Local only — never push** | `/Users/rajeshtaylor/Documents/refueler-ecash-lab/` |

**Product architecture (confirmed CC-83):**
- **Refueler consumer app** — customer-facing. Pre-orders, walk-in orders via app, Legend block explorer, Pass ticketing. Customer's primary touchpoint.
- **Merchant terminal** (`refueler-io/src/merchant/`) — counter/kitchen tablet. Receives and manages orders, Darwin intelligence, owner controls.
- **NumoPay fork** (`rajesh-taylor/numo-fork`) — waiter/floor-staff Android phone app. In-house order taking and payment. Lightning/Cashu native. Talks to terminal.
- **Flow:** consumer app places order → merchant terminal receives → NumoPay handles in-venue fulfilment.
- Mobile terminal: out of scope. NumoPay fork is the mobile/waiter solution.

---

## Homepage positioning — locked CC-79

Privacy infrastructure brand. No Fenchurch St line. No product-specific copy. No sign-in panel. Paper default on load; Carbon on toggle. Copy locked for one month from CC-79.

**Overline:** Privacy Infrastructure · London *(gold, `#C8A96E !important`)*
**Headline:** Your transaction / is nobody else's / business. *(Cormorant Garamond 600, three forced `<br>` lines — loaded in `src/index.njk` only)*
**Subhead:** Privacy isn't a feature. It's the architecture. *(DM Sans 300, full `--fg`, `.home-subhead-band` div)*
**Capability block:** Encrypted transfers — The server is blind, so is the till. / Bitcoin explorer — Your search history is showing. / Lightning payments — Tap and go. Sats or card, your call.

Accent column removed CC-79 — revisit on Companies House registration. "Fiat or Bitcoin — privacy included." retired from homepage CC-79 — product pages only.

---

## Subdomain policy — locked CSS-1a

All products on `refueler.io/[product]/`. No new subdomains without documented technical constraint.

`share.refueler.io` migrated → `refueler.io/share/`. **Action required (Rajesh):** disconnect `share.refueler.io` custom domain from `refueler-share` Cloudflare Pages project, then delete/disable the project.

**Cloudflare Share infrastructure:**
- Worker: `refueler-share.rt-fc4.workers.dev` (version `7a0183e1`). CORS: `https://refueler.io` + `https://share.refueler.io` (keep until Pages project retired).
- Turnstile widget: 2 hostnames — `refueler.io` + `share.refueler.io`.
- KV free tier (1,000 writes/day) — upgrade to Paid ($5/month) before production volume.

**Share canonical URLs:** Upload `https://refueler.io/share/` · Plans `https://refueler.io/share/plans/` · Status `https://refueler.io/share/status/` · Admin `https://refueler.io/share/admin/dashboard`

---

## Share — architecture (locked)

- Share pages use `share-nav.njk` and `share-footer.njk` in `src/_includes/`
- BLAKE3 WASM: `src/share/assets/blake3/` → `_site/share/assets/blake3/`; `share.js` imports via `./blake3/browser-async.js`
- `src/_headers` passes through via `eleventyConfig.addPassthroughCopy`
- Post-download colophon (locked M-3): "Encrypted in your browser. / Deleted when it expires. / refueler.io" — Source Serif 4 300, `--text-tertiary`

**Share admin dashboard:** Live at `refueler.io/share/admin/dashboard`. Migration from subdomain complete (AD-1 ✅). Left-hand panel wiring and card drill-downs are stub build work — tracked as AD-2.

---

## Workflow — file delivery

Rajesh moves files into place manually. Claude never includes `cp` steps — git commands only after files placed.

**File naming rule (locked CC-74):** All `index.njk` files produced by Claude use a section prefix (e.g. `home-index.njk`). Rename to `index.njk` via `mv` before committing.

---

## Cloudflare Pages — build config

| Setting | Value |
|---|---|
| Build command | `npm install && npx eleventy` |
| Build output | `_site` |
| Build system | Version 3 |
| Branch | main |

**Submodule rule (locked CC-72):** `refueler-app` and `terminals/numo-fork` must NEVER be git submodules inside `refueler-io`.

---

## CSS architecture — locked

Single token source: `global.css`. No page defines its own `:root`. No body-level theme scripts. No `backdrop-filter`. Page CSS is layout-only.

**Font loading:** Page-specific display fonts in that page's `.njk` only. Homepage headline: Cormorant Garamond 600 in `src/index.njk` only.

**Cascade rule:** `global.css` body sets `color: var(--fg)` — cascades to all `p` tags. Use `#C8A96E !important` for gold on `<p>` until rationalisation.

| File | Owns | Status |
|---|---|---|
| `src/assets/css/global.css` | All tokens, reset, nav, footer | ✅ Clean |
| `src/assets/css/home.css` | Homepage — `home-` prefixed | ✅ Clean |
| `src/assets/css/legend.css` | Legend layout only | ✅ Clean — CSS-6 |
| `src/assets/css/editorial.css` | Editorial index layout only | ✅ Clean — CSS-6 |
| `src/assets/css/support.css` | Support layout only | ✅ Clean — CSS-6 |
| `src/assets/css/privacy.css` | Privacy layout only | ✅ Clean — CSS-6 |
| `src/notes/notes.css` | Notes layout | ✅ Clean — CSS-6 |
| `src/share/assets/share-tokens.css` | Share-only component tokens | ✅ CSS-4 merge |
| `src/share/assets/share.css` | Share upload/download layout | ✅ CSS-7b |
| `src/share/assets/plans.css` | Plans page layout | ✅ CSS-7b |
| `src/share/assets/status.css` | Status page layout | ✅ |
| `src/_headers` | Cloudflare Pages headers | ✅ M-3 |
| `src/merchant/merchant-tablet-styles.css` | Merchant terminal styles | 🔵 CC-83b — nav/horizon/tile redesign pending |
| `src/merchant/index.html` | Merchant terminal HTML | 🔵 CC-83b — nav restructure + S-1 PIN flash pending |
| `src/merchant/merchant-tablet-logic.js` | Merchant terminal JS | 🔵 CC-83b — view switch JS update pending |

---

## Global CSS — canonical token values (CSS-1a locked)

**Paper:** `--bg: #E8E2D8` · `--fg: #1A1A1A` · `--fg-muted: #5A5550` · `--fg-subtle: #9A9590` · `--border: rgba(26,26,26,0.12)` · `--surface: #DAD4CA` · `--surface-raised: #D0C9BE` · input: `#CCC7BE`

**Carbon:** `--bg: #1A1A1A` · `--fg: #E8E2D8` · `--fg-muted: #9A9590` · `--fg-subtle: #5A5550` · `--border: rgba(232,226,216,0.12)` · `--surface: #242424` · `--surface-raised: #2E2E2E`

**Shared:** `--gold: #C8A96E` · `--success: #27AE60` · `--font-heading: 'Satoshi'` · `--font-sans: 'DM Sans'` · `--font-mono: 'IBM Plex Mono'` · `--font-serif: 'Source Serif 4'`

**Theme persistence:** `rs-theme` cookie, scoped to `.refueler.io`, 30-day rolling.
**Theme default:** Paper on all public surfaces. Carbon default on Legend template (`getCookie('rs-theme') || 'carbon'`). Carbon hardcoded on merchant terminal (app surface).
**Abolished:** `localStorage` for theme · `rfTheme` · `html.carbon-mode` · `--accent-action` · `backdrop-filter` · `#F5820A` orange

---

## Merchant terminal — design decisions (locked CC-83)

### Nav — default (no merchant logo)
- Left: Refueler wordmark (Satoshi 700, 16px, `#E4E2DC` — matches website) · `0.5px solid #4A4D52` divider · "MERCHANT TERMINAL" (IBM Plex Mono, 12px, `#C8C9CB`)
- "Powered by Refueler" dropped entirely
- Centre: empty
- Right: merged pill (QUEUE·OPS·OWNER) · `0.5px solid #4A4D52` separator (20px gap each side) · theme pill (PAPER·CARBON)

### Nav — merchant has logo
- Left: 32×32px square logo (5px radius, `background #35373B` fallback showing initials in gold) · divider · "MERCHANT TERMINAL"
- Merchant name never appears as text in nav — either logo or Refueler wordmark

### Merged pill — QUEUE · OPS · OWNER
- Height: 42px · padding: `0 20px` · border-radius: 24px · border: `0.5px solid #4A4D52`
- Segment dividers: `0.5px solid #35373B`
- QUEUE/OPS active: `background #35373B`, text `#E4E2DC`
- OWNER active: `background rgba(200,169,110,0.14)`, text `#C8A96E`, subtle gold border
- Inactive: text `#5A5751`

### Theme pill — PAPER · CARBON
- Same 42px height · border-radius: 24px · pushed to far right
- Staff choose per shift — not locked to owner

### Horizon strip
- Height: 64px (up from 52px) · background: `#1A1A1A` hardcoded (always dark, both themes)
- Station name: IBM Plex Mono, 15px, `#E4E2DC`
- ETA: IBM Plex Mono, 14px, `#C8A96E`
- "DARWIN · LIVE": IBM Plex Mono, 10px, `#5A5751`
- "ARRIVALS": IBM Plex Mono, 10px, `#8A8680`
- All arrival counts: `#A8A4A0` uniform — no gold on any count
- Window urgency backgrounds: 0–3 min `rgba(255,255,255,0.07)` · 3–7 min `rgba(255,255,255,0.03)` · 7–15 min transparent
- Window labels: IBM Plex Mono, 10px, `#5A5751`

### Order tiles
- Layout: `[ID] · [items]` on one line. Separator `·` gold `#C8A96E`, IBM Plex Mono 14px, padding `0 10px`
- Identifier: IBM Plex Mono, 15px, `#E4E2DC`. App ref (e.g. `246800`) or table (e.g. `Table 4`) or free text
- Items: DM Sans, 14px, `#C8C9CB`
- Status badge: right side only (left colour bar dropped — colour-blind concern)
- Badge: IBM Plex Mono 10px, `padding: 6px 14px`, `border-radius: 4px`, tint background + border
- PENDING: gold · IN PREP: `#7899D4` blue · READY: `#3DCA7A` green
- Tile: `background #26282C` · `border 0.5px solid #35373B` · `border-radius: 7px` · `padding: 12px 16px`

### Portrait layout (CC-84 build)
- Option 2: sidebar stacks above main as horizontally-scrolling card strip
- Portrait: nav → horizon band → sidebar strip (horizontal scroll) → stats row → order queue
- CSS-only, media query `@media (orientation: portrait)` or `max-width: 820px`

### Order identifier types (CC-84 + Onboarding-A scope)
- Refueler app pre-order: 6–8 digit ref, auto-populated from order
- Walk-in table service: table number (staff entry)
- Walk-in counter: staff-assigned (name, number, position)
- Lightning wallet direct: TBD — research item
- Walk-in order entry flow: staff tap "New order", select/type identifier, add items — CC-84

### Onboarding-A doc specs (logged)
- Venue logo: PNG or SVG, max 512×512px, max 200KB, transparent background preferred. Renders 32×32px in nav
- PIN screen background: portrait strip layout (image top 55%, PIN panel bottom). Portrait 1080×1200px, max 1MB, subject in upper half
- Tablet: portrait-first for counter. Landscape supported. Both designed in CSS.
- NumoPay fork for floor/waiter use — Android phone, portrait-only

---

## Supabase — security alert (09 Aug 2026)

**Issue:** `partners_public_read` policy on `venue_partners` has `qual: true` — entire table readable by anyone with project URL.
**Fix (CC-83b Migration 1):** Drop `partners_public_read`. `merchant_select_own_venue` already covers `independent_owner`, `merchant`, `franchise_branch`. `franchise_hq_select_own_group_venues` covers franchise HQ. `admin_full_access_venue_partners` covers admin. Pass door-entry scenarios use service-role Edge Function — no public read needed.

---

## Snag list — active

| ID | Item | Priority | Target |
|---|---|---|---|
| S-1 | PIN flash — ~1 frame of tablet-ui visible before gate renders | Medium | CC-83b |
| S-2 | "Loading venue…" — investigate JS fetch/auth token passing for `independent_owner` | High | CC-83b |
| S-3 | STEAKHOUSE nav badge → venue name from `venue_partners.name` | High | CC-83b |
| S-4 | Queue/Ops mode switch → merged QUEUE·OPS·OWNER pill | High | CC-83b |
| S-5 | Venue name/logo in nav — layout confirmed CC-83 | Medium | CC-83b |
| S-6 | Horizon strip stat values ~20% size increase | Medium | CC-83b |
| S-7 | Sidebar height — doesn't fill full column | Low | CC-83b |
| S-8 | Owner/Staff PIN reset + Menu management — stubs in Owner View | High | Onboarding-A / CC-84 |
| S-9 | Magic link email bare Supabase template — needs branded HTML | High | CC-85 |
| S-10 | Export-1: PDF/print icon on Revenue + Orders panels | Low | Future |
| S-11 | Dash-1: Orders over time + peak hours heatmap on franchise dashboard | Low | Post volume |
| S-12 | `car_park_occupancy` strip from FEEDS array | Low | Next rail-signal-poll touch |
| S-14 | `Costa Coffee HQ` category label fix | Low | Future |
| S-15 | Small text audit: horizon band labels, mono labels, card sub-labels | Medium | CC-83b start, continue CC-84 |
| S-16 | Portrait layout: Option 2 CSS-only sidebar stack | High | CC-84 |
| S-17 | Landscape/portrait responsive system: single CSS breakpoint for tablet + NumoPay phone | High | CC-84, inform NumoPay fork |

*S-13 deleted — `independent_owner@rajeshtaylor.com` orphan row removed in CC-83b Migration 1.*

---

## CC-83b — production code scope (next session)

**Migration 1 — single apply_migration:**
- Drop `partners_public_read` (security fix)
- Add `venue_partners.logo_url TEXT`
- Add `venue_partners.pin_bg_url TEXT` (PIN screen background — scoped, not wired until CC-84)
- Add `venue_partners.stamp_feature_enabled BOOLEAN DEFAULT false`
- Add `orders.commission_status TEXT`
- Add `orders.reward_status TEXT`
- Delete orphan `merchant_users` row where `venue_id IS NULL AND role = 'independent_owner'` (S-13)

**`src/merchant/index.html`:**
- S-1: inline `<style>` in `<head>` — auth-gate and pin-gate get `position:fixed; inset:0; z-index:9999; background:#1A1A1A` before any external stylesheet
- Nav HTML restructure: left identity block + merged pill + separator + theme pill
- Remove `#venue-badge-slot` and `role-chip` pattern — merged pill handles view switching

**`src/merchant/merchant-tablet-styles.css`:**
- Nav: `.nav-terminal-lbl` — IBM Plex Mono, 12px, `#C8C9CB`
- Merged pill styles: `.merged-pill`, `.mp-seg`, `.mp-queue`, `.mp-ops`, `.mp-owner`
- Separator: `.nav-pill-sep`
- Horizon: height 64px, station name IBM Plex Mono 15px `#E4E2DC`, all count sizes/colours per spec
- Window urgency backgrounds per spec
- Order tile: new layout, badge right, sizes per spec
- S-7: sidebar `min-height: 100%`
- S-6/S-15: queue-stat-value up to ~22px, horizon label sizes up

**`src/merchant/merchant-tablet-logic.js`:**
- View switching: update to use merged pill (QUEUE/OPS segments), OWNER segment triggers owner overlay
- `renderNavBadge()`: update to populate left identity block from `_venueName` and `_venueData.logo_url`
- Remove old `role-chip` render path

---

## Test accounts

| Email | Role | Notes |
|---|---|---|
| `steakhouse@rajeshtaylor.com` | `independent_owner` | Raj's Steakhouse · venue_id `c476df85-5572-49bd-a476-a908519a9a23` · staff PIN 1234 · owner PIN 8888 |
| `moniker@rajeshtaylor.com` | `franchise_hq` | Moniker franchise · Costa Coffee `franchise_group_id` |
| `dev@refueler.io` | `admin` | Admin / dev console |

*`independent_owner@rajeshtaylor.com` orphan row (venue_id NULL) — to be deleted in CC-83b Migration 1.*

---

## Edge Functions (deployed)

| Function | Version | Purpose | verify_jwt |
|---|---|---|---|
| `blink-webhook` | v12 | Blink direct callback | `false` (explicit) |
| `create-order` | — | Consumer app → Blink BOLT11 invoice | explicit |
| `blink-balance` | — | Proxies Blink GraphQL balance | explicit |
| `rail-signal-poll` | — | Darwin feed poller, pg_cron triggered | explicit |

**Block 8 (to be deployed):** `charge-commission` · `issue-reward` · `stripe-webhook` · `claim-reward`

**Blink:** Active API key `refueler-cc68` (id: `b98cf536-ac9e-484b-bab2-14f1a181a12e`) · BTC wallet: `fd2357fe-24ec-4173-8441-fc0f05722e9a`

---

## NumoPay fork — scope and context

**Original:** `cashubtc/Numo` v1.8 — Lightning/Cashu integration, menu download, webhooks, Minibits wallet compatible. Android phone app.
**Fork:** `rajesh-taylor/numo-fork` v1.6 — clean base, no changes. Local path: `/Users/rajeshtaylor/Documents/refueler.io/terminals/numo-fork/`
**Use case:** In-house order taking and payment for waiter/floor staff. Android phone, portrait-only. Complements merchant terminal (which is tablet/counter).
**Timing:** Start NumoPay fork session after Block 5 sim-close — terminal design must be locked and API contract clear first.
**BitChat research:** Bluetooth mesh sync for offline resilience. Log for NumoPay-A planning session.
**BRIDGE:** Add `refueler-numo-fork` at next block close.

---

## Cashu NUTs in scope

| NUT | Purpose | Scope |
|---|---|---|
| NUT-00 | Blind issuance — stamp token creation | Block 8 (scaffolded; live when mint deployed) |
| NUT-07 | State check — double-spend prevention | Block 8 (scaffolded; live when mint deployed) |
| NUT-13+09 | Deterministic restore — device-loss recovery | Post-mint |
| NUT-14 | HTLC — receiver-pays (conditional stamp unlock) | Post-mint |
| NUT-11 | P2PK — identity binding | Probably never — contradicts IP honesty standard |
| NUT-29 | Parked | — |

---

## Consumer app — settlement detection (locked CC-69)

Three-layer: Realtime + poll (3s, 5 min) + AppState foreground guard. Settled view inline — NativeTabs incompatible with `router.replace`. Routing fee 0/null → "fee: pending". Sats always `toLocaleString()`.

---

## Rail demand intelligence

| Feed | Status |
|---|---|
| `departure_board_staff` (FST) | ✅ Live |
| `incidents` | ✅ Live |
| `car_park_occupancy` | ❌ Dead — strip next rail-signal-poll touch |

---

## Session queue — forward plan

| Session | Scope | Type | Status |
|---|---|---|---|
| ~~CC-82~~ | Block 5 pre-work + test env + E2E | Sonnet counted | ✅ Closed |
| ~~Block-5 Review~~ | Recalibrate Block 5 scope | Opus uncounted | ✅ Closed |
| ~~Merchant-Sats-A/B/C~~ | Payment architecture, reward flow, UI spec | Opus uncounted | ✅ Closed |
| ~~CC-83~~ | Terminal design decisions — nav, horizon, tiles, portrait | Sonnet counted | ✅ Closed — design only |
| **CC-83b** | Block 5 production code — migrations, nav HTML/CSS/JS, S-1/S-6/S-7/S-15 | Sonnet counted | **Next** |
| **CC-83b-app** | Opus — refueler-app dev branch review, divergence analysis | Opus uncounted | After dev branch pushed |
| **Onboarding-A** | Merchant onboarding flow + printed handover doc | Opus uncounted | Queued |
| **CC-84** | Portrait layout, walk-in order entry, PIN self-service | Sonnet counted | Queued |
| **CC-85** | Branded magic link email, first full sim run | Sonnet counted | Queued |
| **Block-5 Close** | Block 5 review and recalibration | Opus uncounted | Queued |
| **Sim-Close** | Formal sign-off all 4 sim stages | Opus uncounted (up to 2) | Queued |
| **NumoPay-A** | Fork review, API contract, BitChat research | Opus uncounted | After Block 5 sim-close |
| **Block 8** | Fiat → sats rewards | Sonnet counted | After Block 5 |
| **Session A (CDK mint)** | CDK mint architecture | Opus uncounted | After Block 8 |
| **Pass-A** | Full Pass scope + Pass Wallet card | Opus uncounted | After Block 8 |
| **AD-2** | Share admin dashboard | Sonnet counted | Queued |

---

## Ongoing / bundled items

- **Action required (Rajesh):** Disconnect `share.refueler.io` from Cloudflare Pages, delete/disable project
- **Action required (Rajesh):** Push `refueler-app` dev branch — `git remote set-url origin https://rajesh-taylor:REAL_TOKEN@github.com/rajesh-taylor/refueler-app.git && git push origin dev`
- Upgrade Cloudflare Workers to Paid ($5/month) before production volume
- New Anthropic API key → before csuite briefing reuse
- `blink-webhook_index.ts` → hygiene pass
- `bsc-dev` Dev Test item → remove before TestFlight
- GitHub Actions red X on `9b9655d`
- LNBits webhook payload shape → confirm with Ben Arc before Block 9
- Notes article seeds → `notes-articles-list.md` in refueler-share at next Share session
- Est. 2026 accent column → replace with Companies House reg on incorporation
- Share streaming encryption → B-series roadmap
- Safari >1.5 GB file limit → document in Share FAQ
- **Lawyer briefing:** draft written brief before appointment
- **Competitive check:** Square / Toast / KDS on multi-programme concurrent loyalty stamps
- **ecash-lab:** Session A for CDK Rust mint + Orchard GUI
- **Float pre-load amount:** TBD-Rajesh
- **AI helper on owner tab:** queued future session
- **Stamp read path RLS:** bundle into CC-84 pre-req migrations
- **Pass Wallet card:** scoped in Pass-A. No stub Pass tab in Block 8.
- **Cashu token expiry sweep:** mandatory before Cashu reward issuance goes live
- **Legend mobile:** scope mobile experience deliberately in first Legend build session
- **Partner-facing materials session:** include NumoPay fork competitive angle, no-hardware pitch vs Square KDS, portrait+landscape flexibility, family-run business positioning
- **`pin_bg_url` column:** added in CC-83b Migration 1, wired in CC-84 onboarding flow

---

*"Nothing stops this train."*
