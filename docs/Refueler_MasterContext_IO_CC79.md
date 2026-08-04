# Refueler Master Context — IO CC-79
*Updated: 2026-08-05 (CC-79 close)*
*Supersedes: Refueler_MasterContext_IO_CC78.md*
*Sync log: MasterContext_IO_CC79 — CC-79: homepage redesigned (Cormorant Garamond, banded layout, new copy). Two editorial articles migrated. No schema changes. No Edge Function changes.*

---

## Project overview

Refueler is a Bitcoin-native privacy ecosystem. Products: Share (anonymous encrypted file transfer), Legend (privacy-first block explorer), consumer pre-order app (Fenchurch St line), merchant terminal (cafés and restaurants near stations).

**Mission:** A Bitcoin-native privacy layer operating within UK jurisdictional law. Not a fintech product. Not a loyalty app. The big idea: a Bitcoin world that works quietly, legally, and without surveillance.

**Homepage positioning (locked CC-79):** Privacy infrastructure brand. No Fenchurch St line. No product-specific copy. No sign-in panel. Carbon default. Banded layout with overline, Cormorant Garamond headline, DM Sans subhead, accent column. Copy locked:

**Overline:** Privacy Infrastructure · London
**Headline:** Your transaction / is nobody else's / business. *(three forced lines)*
**Accent column:** Est. 2026 · vertical rule · REFUELER *(gold, right of headline)*
**Subhead:** Privacy isn't a feature. It's the architecture. *(DM Sans 300, full --fg, no hairline above)*
**Capability block:**
- Encrypted transfers — The server is blind, so is the till.
- Bitcoin explorer — Your search history is showing.
- Lightning payments — Tap and go. Sats or card, your call.

**Homepage font stack (locked CC-79):**
- Headline: Cormorant Garamond 600 — loaded in `src/index.njk` only, not global
- Overline / accent / cap labels: Satoshi (global)
- Subhead / cap descriptors: DM Sans 300/400 (global)

**Homepage CSS classes (locked CC-79):** `.overline`, `.overline-rule`, `.headline-wrap`, `.headline`, `.accent-col`, `.accent-year`, `.accent-line`, `.accent-mark`, `.subhead`, `.capability-block`, `.capability-item`, `.cap-label`, `.cap-descriptor`

**"Fiat or Bitcoin — privacy included."** retired from homepage CC-79. Belongs on product pages only — Share, app pre-order screen. Not homepage.

**North star (internal, not copy):** They come for privacy, they stay and then fall in love with Bitcoin.

**Supabase project:** `tihgvdokeofnjxjkenmm`
**Webhook URL:** `https://tihgvdokeofnjxjkenmm.supabase.co/functions/v1/blink-webhook`

**GitHub repos:**
| Repo | Status | Local path |
|---|---|---|
| `rajesh-taylor/refueler-io` | Public — web/Command Centre/Supabase | `/Users/rajeshtaylor/Documents/refueler.io/` |
| `rajesh-taylor/refueler-app` | Public — React Native consumer app | `/Users/rajeshtaylor/Documents/refueler.io/refueler-app/` |
| `rajesh-taylor/numo-fork` | Public — Android POS terminal fork | `/Users/rajeshtaylor/Documents/refueler.io/terminals/numo-fork/` |
| `rajesh-taylor/refueler-share` | Public — BLAKE3 + Cashu file transfer | `/Users/rajeshtaylor/Documents/refueler-share/` |
| `rajesh-taylor/refueler-legend` | Public — Legend chain explorer + ARM Bitcoin indexer | `/Users/rajeshtaylor/Documents/refueler-legend/` |
| `rajesh-taylor/refueler-mint` | Public — CDK Rust loyalty stamp mint | `/Users/rajeshtaylor/Documents/refueler-mint/` |
| `refueler-ecash-lab` | **Local only — never push** | `/Users/rajeshtaylor/Documents/refueler-ecash-lab/` |

---

## Workflow — file delivery

Rajesh moves produced files into place manually. Claude never includes a file copy step in deploy commands. Provide only `git add/commit/push` commands after files are in place.

**File naming rule (locked CC-74):** All `index.njk` files produced by Claude must be named with a section prefix — e.g. `home-index.njk`, `legend-index.njk`. Prevents upload collisions. Rajesh renames back to `index.njk` on placement. This rule applies to `index.njk` files only.

---

## Cloudflare Pages — build configuration

| Setting | Value |
|---|---|
| Build command | `npm install && npx eleventy` |
| Build output directory | `_site` |
| Build system version | Version 3 |
| Branch | main |

**Submodule rule (locked CC-72):** `refueler-app` and `terminals/numo-fork` must NEVER be registered as git submodules inside `refueler-io`.

---

## CSS architecture — refueler.io (locked CC-74, extended CC-76, updated CC-79)

**The rule:** Every page on refueler.io needs only `{% include "head.njk" %}` and one `<link>` to its page-specific CSS. No page may define its own `:root` token block. No page may have a body-level theme `<script>`.

**Standing rule (locked CC-76):** Every new page must start from `{% include "head.njk" %}` + one external CSS file. No inline `<style>` token blocks. Ever.

**Font loading rule (locked CC-79):** Page-specific display fonts (e.g. Cormorant Garamond on homepage) are loaded via `<link>` in that page's `.njk` file — not in `head.njk` and not in `global.css`. Only fonts used site-wide belong in `head.njk`.

| File | Owns | Loaded by | Status |
|---|---|---|---|
| `src/assets/css/global.css` | All tokens, reset, nav, footer | `head.njk` — every page | ✅ Clean |
| `src/assets/css/home.css` | Homepage layout — overline, headline-wrap, accent-col, subhead, capability block | `src/index.njk` | ✅ Clean — redesigned CC-79 |
| `src/assets/css/legend.css` | Legend layout only | `legend/index.njk` | ✅ Clean |
| `src/assets/css/editorial.css` | Editorial index layout only | `editorial/index.njk` | ✅ Clean |
| `src/assets/css/support.css` | Support page layout only | `support/index.njk` | ✅ Clean |
| `src/assets/css/privacy.css` | Privacy policy layout only | `privacy/index.njk` | ✅ Clean |
| `src/notes/notes.css` | Notes layout + tokens | `notes/index.njk` and article pages | ✅ Clean |

**Editorial articles — migration status:**
- `src/editorial/the-city-worker/index.njk` — ✅ `:root` block stripped CC-79. Commit `553313f`.
- `src/editorial/nothing-to-collect-nothing-to-hide/index.njk` — ✅ `:root` block stripped CC-79. Commit `553313f`.
- `src/editorial/looks-done-isnt-done/index.njk` — ⚠️ Still has wrong `:root` block. CC-80.
- `src/editorial/the-float/index.njk` — ⚠️ Still has wrong `:root` block. CC-80.

**After CC-80:** All pages on refueler.io share a single token system. Colour divergence permanently resolved.

**Editorial article rule (locked CC-76):** Editorial articles may keep article-specific widget and layout CSS in an inline `<style>` block. They must NEVER define a `:root` token block.

**global.css owns:** `--bg`, `--fg`, `--fg-muted`, `--fg-subtle`, `--border`, `--nav-bg`, `--surface`, `--surface-raised`, `--accent`, `--accent-hover`, `--accent-action`, `--paper`, `--carbon`, all structural vars, body reset, nav, footer, theme-pill, responsive nav.

**Theme script:** `head.njk` only. Single script. `rs-theme` cookie, `.refueler.io` scoped, `dataset.theme` attribute.

---

## CSS architecture — share.refueler.io (✅ Complete CC-75)

- `share-tokens.css` is single token source for all Share pages
- `head.njk` loads `share-tokens.css` on every Eleventy Share page
- `frontend/index.html` links `share-tokens.css` externally
- `upgrade.css` and `status.css` — layout only, no `:root` blocks
- Theme toggle confirmed working live on index, upgrade, status (CC-76 verification)

---

## Colour divergence — status

Root cause diagnosed CC-76. Three token systems were coexisting. Fix sequence:
- CC-78: homepage migrated ✅
- CC-79: `the-city-worker` + `nothing-to-collect` migrated ✅
- CC-80: `looks-done-isnt-done` + `the-float` — **pending**

**EDITORIAL-MASTER.md token values are WRONG and must never be used.** Predates CC-74 hex lock. Canonical values: Carbon `#1A1A1A`, Paper `#F5F0E8`.

---

## Locked decisions (always apply)

- Blink BOLT11 only. BOLT12 parked.
- Carbon dark everywhere (default). Paper is user toggle only. Orange (#F5820A) abolished.
- Brand: suave, discreet, refined — "James Bond, not fintech neon."
- Privacy first: geofence processed on-device only, never transmitted.
- `verify_jwt` must be set explicitly on every Edge Function deploy.
- curl commands: always single-line, real key inlined — never placeholder, never backslash continuations.
- "Fenchurch St line" only — never "C2C". Not mentioned on homepage.
- Merchant data isolation: merchants read from `merchant_orders` only, never `orders` directly.
- Venue resolution: always `auth.users.id → merchant_users.user_id → venue_id → venue_partners`.
- **Theme detection (locked CC-72):** Always `document.documentElement.dataset.theme === 'carbon'`. Never `classList.contains('carbon-mode')`. CSS selector: `[data-theme="carbon"]` — never `html.carbon-mode`.
- **Theme persistence (locked CC-72):** Cookie `rs-theme` scoped to `.refueler.io` (30-day rolling). `localStorage` and `rfTheme` fully removed from all surfaces.
- **Paper colour (locked CC-74):** `#F5F0E8` canonical. `#F7F4EF` is wrong.
- **Carbon colour (locked CC-74):** `#1A1A1A` canonical. `#1E1F22` is wrong.
- **No backdrop-filter (locked CC-74):** Banned on all surfaces. Nav backgrounds solid.
- **No body theme scripts (locked CC-74):** `head.njk` is the single theme script owner.
- **No inline `:root` blocks (locked CC-74):** Page CSS files define layout only. Token file owns all tokens.
- **No inline `:root` blocks in editorial articles (locked CC-76):** Widget/layout CSS may be inline. Token block never.
- **Every new page loads head.njk (locked CC-76):** No exceptions.
- **Homepage positioning (locked CC-79):** Privacy infrastructure brand. No Fenchurch St line. No product copy. No sign-in. Banded layout. Carbon default. Do not iterate without a formal session.
- **Homepage headline font (locked CC-79):** Cormorant Garamond 600. Loaded in `src/index.njk` only. Not global. Not in `head.njk`.
- **Homepage copy (locked CC-79):** Overline: "Privacy Infrastructure · London". Headline: "Your transaction / is nobody else's / business." Subhead: "Privacy isn't a feature. It's the architecture." Capability block labels and descriptors: all final. Do not iterate without a formal copy session.
- **"Fiat or Bitcoin — privacy included." (retired CC-79):** Removed from homepage. Belongs on product pages (Share, app). Not homepage.
- **Homepage accent column (locked CC-79):** Est. 2026 · vertical rule · REFUELER in gold. When company incorporates, replace with Companies House registration number and year.
- **Legend index page copy (locked CC-78):** Headline: "Bitcoin, privately." Opening line: "Buys non-KYC Bitcoin, then logs every address ever searched..." Do not reassign or alter.
- **North star (locked CC-77):** "They come for privacy, they stay and then fall in love with Bitcoin." Internal only — never homepage copy.
- **"Bitcoin, privately." (locked CC-77):** Reserved for Legend index page headline exclusively.
- **"Built for jurisdictions that have laws. And lawyers." (locked CC-77):** Reserved for Share API / paid plans page exclusively.
- **"Lightning payments — Tap and go. Sats or card, your call." (locked CC-77):** Reserved for Share upgrade / paid plans page.
- **BLAKE3 / Cashu lock:** BLAKE3 = chunk indexing. Cashu blind signatures = anonymous authentication. Distinct layers.
- **Ecash boundary:** `refueler-ecash-lab/` local only, never pushed.
- **CDK version pinning:** All three layers pin to `cdk = "0.17.2"`.
- **LNBits decision (CC-70):** Deferred until 1–2 merchants live.
- **Fiat → sats rewards (CC-70):** Primary traction lever. Gated on Block 5.
- **Anthropic API key (CC-72):** Previous key disabled. New key needed before csuite briefing reuse.

---

## Global CSS — canonical token values

**Paper (light mode default):**
- `--bg: #F5F0E8` · `--surface: #EDEAE4` · `--surface-raised: #E4E1DA`
- `--fg: #1A1A1A` · `--fg-muted: #5A5550` · `--fg-subtle: #9A9590`

**Carbon (dark mode):**
- `--bg: #1A1A1A` · `--surface: #26282C` · `--surface-raised: #2E3035`
- `--fg: #F5F0E8` · `--fg-muted: #B0AAA2` · `--fg-subtle: #6A6560`

**Accent:** `--accent: #C8A96E` · `--accent-hover: #E0C48A`
**CTA (consumer):** Paper `--accent-action: #D4690A` · Carbon `--accent-action: #F5820A`

---

## Stack

| Layer | Technology |
|---|---|
| Mobile app | React Native / Expo, Expo Router |
| Backend | Supabase (Postgres, Edge Functions, Realtime, RLS) |
| Payments | Blink BOLT11 (`api.blink.sv/graphql`) |
| Webhook | `blink-webhook` v12, no Svix — direct Blink callback |
| Web/CDN | Cloudflare Pages + Workers |
| Auth | PKCE via `refueler-auth-proxy` Cloudflare Worker |
| Merchant terminal | Numo fork (Android, `io.refueler.merchant`) |

---

## Database schema — key tables

### `orders`
`id, session_id, user_id, partner, bay_label, order_value_gbp, commission_pct, commission_gbp, commission_sats, sats_rate, reward_type, reward_sats, handover_method, payment_processor, payment_ref, zebedee_charge_id, settled_at, created_at, venue_id, item_name, status, updated_at, payment_status, bolt11_invoice, invoice_expires_at, pseudonym_id, routing_fee_sats, settled_sats`

### `merchant_users`
`id, user_id, email, role, venue_id, franchise_group_id, staff_pin_hash, owner_pin_hash, created_at`
Role CHECK: `merchant | franchise_branch | franchise_hq | admin | independent_owner | investor`

### `venue_partners`
`id, merchant_id, name, category, site, coords_lat, coords_lng, location, address_line1, city, country, pickup_note, exclusivity_radius_m, active, pause_reason, session_added, created_at, contact_email, venue_type, franchise_group_id, brand_primary, brand_secondary, max_concurrent_orders`

### `merchant_orders`
`id, order_id, venue_id, status, item_summary, sats_amount, created_at, updated_at, bolt11_payment_hash, paid_at, payment_status, amount_gbp, bolt11_invoice, bolt11_expires_at`
Status CHECK: `awaiting_payment | pending | preparing | ready | collected | cancelled`

### `franchise_groups`
`id, name, hq_venue_id, created_at`

---

## Edge Functions (deployed)

| Function | Version | Purpose | verify_jwt |
|---|---|---|---|
| `blink-webhook` | v12 | Blink direct callback. Updates merchant_orders then orders on settlement. | `false` (explicit) |
| `create-order` | — | Consumer app → Blink BOLT11 invoice | explicit |
| `blink-balance` | — | Proxies Blink GraphQL balance | explicit |
| `rail-signal-poll` | — | Darwin feed poller, pg_cron triggered | explicit |

---

## Blink callback endpoint
- **Endpoint ID:** `ep_3GjzbOPsVG9fCrEdg8pu2lImBfD`
- **URL:** `https://tihgvdokeofnjxjkenmm.supabase.co/functions/v1/blink-webhook`
- **Active API key:** `refueler-cc68` (id: `b98cf536-ac9e-484b-bab2-14f1a181a12e`)

---

## Command Centre — role routing

| Role | Destination |
|---|---|
| `merchant` | `merchant-tablet.html` |
| `franchise_branch` | `merchant-tablet.html` |
| `independent_owner` | `merchant-tablet.html` |
| `franchise_hq` | `franchise-dashboard.html` |
| `admin` | `dev-console.html` |
| `investor` | `investor-snapshot.html` |

---

## Nav architecture — locked

**Main site (`refueler.io`):** Legend, Editorial, Notes, Privacy, theme pill. No Support in nav (footer only). No Share in nav (footer only).

**Share (`share.refueler.io`):** Notes (→ refueler.io/notes/), Upgrade, Support (→ refueler.io/support/), theme pill. Privacy footer-only.

**Wordmark breadcrumb rule (locked CC-73):** `wordmarkSection` frontmatter controls `/ SECTION`. Only set on pages where meaningful. Plain `REFUELER` otherwise.

**Support email:** `support@refueler.io` user-facing. `privacy@refueler.io` GDPR only.

---

## Consumer app — settlement detection (locked CC-69)

Three-layer: Realtime subscription + poll (3s, 5 min, skipped when backgrounded) + AppState foreground guard. On payment confirmed: `setView('settled')` inline — no routing. NativeTabs incompatible with `router.replace` to sibling routes.

**Routing fee display:** `routing_fee_sats = 0` or `null` → show "fee: pending".
**Sats display:** always `toLocaleString()` — `5,284 sats` never `5.2k`.

---

## Rail demand intelligence

| Feed | Status |
|---|---|
| `departure_board_staff` (FST) | ✅ Live, pg_cron jobid 3, every 2 min |
| `incidents` | ✅ Live |
| `car_park_occupancy` | ❌ Dead — strip from FEEDS array next touch |

---

## Session queue — next sessions

| Session | Scope | Notes |
|---|---|---|
| **CC-79** | Editorial Part 1 + homepage redesign — ✅ Closed. | `the-city-worker` + `nothing-to-collect` `:root` blocks stripped. Homepage: Cormorant Garamond, banded layout, new copy. Commits `553313f`, `08b7b95`, `f34a944`. |
| **CC-80** | Editorial articles Part 2. | Strip `:root` blocks from `looks-done-isnt-done` and `the-float`. Read live files first. Colour divergence permanently resolved after this. |
| **CC-81** | Block 3 — Franchise dashboard. | KPI strip, per-venue commission, operator controls. |
| **CC-82+** | Block 3 continues, then Block 5. | As scoped. |

---

## DB Maintenance note
`rail_signal_history` accumulates every 2 min. Export + truncate every 3–4 weeks before hitting 500MB. psql password in Apple Notes.

---

*"Nothing stops this train."*
