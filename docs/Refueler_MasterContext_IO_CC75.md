# Refueler Master Context — IO CC-75
*Updated: 2026-08-04 (CC-74 close)*
*Supersedes: Refueler_MasterContext_IO_CC74.md*
*Sync log: MasterContext_IO_CC75 — CC-74: page CSS extracted to external files; legend.css stripped to layout only; body theme scripts removed; notes.js migrated to rs-theme cookie; carbon bg standardised to #1A1A1A; upgrade.css selector fixed; Share index.html theme unified; Share wordmark href fixed; backdrop-filter removed from global.css (nav solid); legend cred dot green; notes.css card border-only in Carbon. Carry: Share theme toggle broken on upgrade/status — CC-75.*

---

## Project overview

Refueler is a Bitcoin-native mobile pre-order platform for commuters on the Fenchurch St line (Shoeburyness → Fenchurch Street corridor), targeting independent cafés and franchise venues near stations.

**Mission:** Build a parallel payment rail introducing Bitcoin-native payments to merchants via POS terminal systems, without taking custody of BTC.

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

**File naming rule (locked CC-74):** All `index.njk` files produced by Claude must be named with a section prefix — e.g. `legend-index.njk`, `editorial-index.njk`. Prevents upload collisions. Rajesh renames back to `index.njk` on placement. This rule applies to `index.njk` files only — other files (`nav.njk`, `head.njk`, `notes.js` etc) use their real names.

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

## CSS architecture — refueler.io (locked CC-74)

**The rule:** Every page on refueler.io needs only `{% include "head.njk" %}` and one `<link>` to its page-specific CSS. No page may define its own `:root` token block. No page may have a body-level theme `<script>`.

| File | Owns | Loaded by |
|---|---|---|
| `src/assets/css/global.css` | All tokens, reset, nav, footer | `head.njk` — every page |
| `src/assets/css/legend.css` | Legend layout only | `legend/index.njk` |
| `src/assets/css/editorial.css` | Editorial index layout only | `editorial/index.njk` |
| `src/assets/css/support.css` | Support page layout only | `support/index.njk` |
| `src/assets/css/privacy.css` | Privacy policy layout only | `privacy/index.njk` |
| `src/notes/notes.css` | Notes layout + tokens | `notes/index.njk` and article pages |

**global.css owns:** `--bg`, `--fg`, `--fg-muted`, `--fg-subtle`, `--border`, `--nav-bg`, `--surface`, `--surface-raised`, `--accent`, `--accent-hover`, `--accent-action`, `--paper`, `--carbon`, all structural vars, body reset, nav, footer, theme-pill, responsive nav.

**Page CSS files may only define:** tokens not present in `global.css` (e.g. `--border-mid`, `--inset-rule`, `--font-serif`) and page-specific layout classes.

**Theme script:** `head.njk` only. Single script. `rs-theme` cookie, `.refueler.io` scoped, `dataset.theme` attribute. No page may have its own theme script.

---

## CSS architecture — share.refueler.io (BROKEN — CC-75 target)

**Current state (broken):**
- `frontend/index.html` has its own inline `<style>` block with full token definitions
- `frontend/share-tokens.css` exists but is NOT loaded by `frontend/index.html`
- `upgrade.njk` loads only `upgrade.css` — no token file
- `status.njk` has inline `<style>` block — no token file
- Theme toggle does not work on upgrade or status pages
- Theme toggle works on index.html (fixed CC-74) but only because the inline style now uses `[data-theme="carbon"]`

**Target state (CC-75):**
- `share-tokens.css` is the single token source for all Share pages — equivalent of `global.css`
- `head.njk` loads `share-tokens.css` via `<link>` on every Eleventy Share page
- `frontend/index.html` links `share-tokens.css` externally, inline `<style>` block removed
- `upgrade.css` stripped to layout only — no `:root` token block
- `status.njk` inline `<style>` extracted to `status.css`
- No Share page may define its own `:root` token block

---

## Locked decisions (always apply)

- Blink BOLT11 only. BOLT12 parked.
- Carbon dark everywhere (default). Paper is user toggle only. Orange (#F5820A) abolished.
- Brand: suave, discreet, refined — "James Bond, not fintech neon."
- Privacy first: geofence processed on-device only, never transmitted.
- `verify_jwt` must be set explicitly on every Edge Function deploy.
- curl commands: always single-line, real key inlined — never placeholder, never backslash continuations.
- "Fenchurch St line" only — never "C2C".
- Merchant data isolation: merchants read from `merchant_orders` only, never `orders` directly.
- Venue resolution: always `auth.users.id → merchant_users.user_id → venue_id → venue_partners`.
- **Theme detection (locked CC-72):** Always `document.documentElement.dataset.theme === 'carbon'`. Never `classList.contains('carbon-mode')`. CSS selector: `[data-theme="carbon"]` — never `html.carbon-mode`.
- **Theme persistence (locked CC-72):** Cookie `rs-theme` scoped to `.refueler.io` (30-day rolling). `localStorage` and `rfTheme` fully removed from all surfaces.
- **Paper colour (locked CC-74):** `#F5F0E8` is canonical across ALL Refueler surfaces. `#F7F4EF` is wrong.
- **Carbon colour (locked CC-74):** `#1A1A1A` is canonical across ALL Refueler surfaces. `#1E1F22` is wrong.
- **global.css ownership (locked CC-74):** No page on refueler.io may redefine tokens present in `global.css`.
- **share-tokens.css ownership (target CC-75):** No page on share.refueler.io may define its own `:root` token block once CC-75 is complete.
- **No backdrop-filter (locked CC-74):** Banned on all Refueler surfaces permanently. Nav backgrounds are solid. `global.css` must never include `backdrop-filter` or `-webkit-backdrop-filter`.
- **Note cards in Carbon (locked CC-74):** Border-only, transparent background. Paper retains surface tint. Matches Editorial typographic treatment in dark mode.
- **Legend credential dot (locked CC-74):** Green (`#1E8A4A`), not gold. Indicates operational status. Gold is earned/premium — not applicable until credentials are implemented.
- **Body theme scripts banned (locked CC-74):** No page may have a theme script in `<body>`. `head.njk` is the single theme script owner on each domain.
- **BLAKE3 / Cashu lock:** BLAKE3 = chunk indexing. Cashu blind signatures = anonymous authentication. Distinct layers. Never conflate.
- **Ecash boundary:** `refueler-ecash-lab/` local only, never pushed. `refueler-mint` is production path.
- **CDK version pinning:** All three layers pin to same CDK version (`cdk = "0.17.2"`).
- **LNBits decision (CC-70):** Deferred until 1–2 merchants live. Hetzner CX22 ~€4.50/month costed.
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

**Wordmark breadcrumb rule (locked CC-73):** `wordmarkSection` frontmatter controls `/ SECTION`. Only set on pages where meaningful. All others render plain `REFUELER`.

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

## Session queue

**CC-75** — Share CSS architecture: single token source, upgrade/status theme fix
→ **Block 3** (franchise dashboard)
→ **Block 5** (merchant onboarding)
→ **Block 8** (fiat → sats rewards)
→ **Session A** (CDK mint)
→ **Block 9** (LNBits)

---

## DB Maintenance note
`rail_signal_history` accumulates every 2 min. Repeat export + truncate every 3–4 weeks before hitting 500MB. psql password in Apple Notes.

---

*"Nothing stops this train."*
