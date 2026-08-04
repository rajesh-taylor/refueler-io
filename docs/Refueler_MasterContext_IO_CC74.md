# Refueler Master Context — IO CC-74
*Updated: 2026-08-04 (CC-74)*
*Supersedes: Refueler_MasterContext_IO_CC73.md*
*Sync log: MasterContext_IO_CC74 — Paper colour #F5F0E8 canonical across all pages; legend.css stripped of duplicate global tokens; theme scripts cleaned (carbon-mode + rfTheme + localStorage removed) from editorial and privacy; Share tokens extracted to share-tokens.css; Share index.html theme script unified to rs-theme cookie; Share nav in main site nav.njk; notes.css paper fix; Legend white-in-Paper bug outstanding — carry to CC-74. File naming convention locked: all index.njk files produced with section prefix (e.g. legend-index.njk) to prevent upload collisions.*

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

**Consumer app bundle ID:** `io.refueler.app`
**Merchant terminal package:** `io.refueler.merchant`

---

## Workflow — file delivery

Rajesh moves produced files into place manually. Claude never includes a file copy step in deploy commands. Provide only `git add/commit/push` commands after files are in place. Never give instructions referencing `~/Downloads/` — Rajesh moves files himself.

**File naming rule (locked CC-74):** All `index.njk` files produced by Claude must be named with a section prefix — e.g. `legend-index.njk`, `editorial-index.njk`, `privacy-index.njk`, `support-index.njk`. This prevents upload collisions when multiple files share the same name. Rajesh renames them back to `index.njk` when placing them in their destination folder.

---

## Cloudflare Pages — build configuration (updated CC-72)

| Setting | Value |
|---|---|
| Build command | `npm install && npx eleventy` |
| Build output directory | `_site` |
| Build system version | Version 3 |
| Branch | main |

**Submodule rule (locked CC-72):** `refueler-app` and `terminals/numo-fork` must NEVER be registered as git submodules inside `refueler-io`. Both have been removed (`git rm --cached`). If either folder ever shows as a submodule again (`git submodule status` returns output), remove immediately before pushing.

---

## Locked decisions (always apply)

- Blink BOLT11 only. BOLT12 parked until mainstream wallet support matures (~August revisit).
- Carbon dark everywhere (default). Paper is user toggle only. Orange (#F5820A) abolished.
- Brand: suave, discreet, refined — "James Bond, not fintech neon."
- Consumer app is NOT a Numo fork — no number pad UI.
- Privacy first: geofence processed on-device only, never transmitted, opt-in at onboarding.
- `verify_jwt` must be set explicitly on every Edge Function deploy.
- curl commands: always single-line, real key inlined — never placeholder, never backslash continuations.
- "Fenchurch St line" only — never "C2C" (trademark).
- Merchant data isolation: merchants read from `merchant_orders` only, never `orders` directly.
- Venue resolution via `merchant_users` first; always `auth.users.id → merchant_users.user_id → venue_id → venue_partners`. Never email-based lookup.
- Blink is non-custodial — onboarding copy must reflect seed backup responsibility.
- **BLAKE3 / Cashu lock:** BLAKE3 = chunk indexing and verification. Cashu blind signatures = anonymous authentication. Distinct layers. Never conflate.
- **Ecash boundary:** `refueler-ecash-lab/` is testing only, local, never pushed. `refueler-mint` is production path — not live until Session A + B complete. No external mint ever. No ecash-to-sats path. `REFUELER_INTERNAL_MINT_URL_PENDING` — do not populate.
- **CDK version pinning (refueler-mint):** All three layers must pin to the same CDK version — `refueler-mint` Cargo.toml (`cdk = "0.17.2"`, `cdk-sqlite = "0.17.2"`), `tests/go/` cdk-go harness (CDK 0.17.x tag), cdk-dart TurboModule (CDK 0.17.x tag). Never bump without updating all three simultaneously.
- **Investor role:** `investor` is a valid role in `merchant_users`. Routes to `investor-snapshot.html` via command-centre. No console access.
- **Blink webhook:** No Svix. Blink uses `callbackEndpointAdd` GraphQL mutation. Payload shape: `{ accountId, eventType: "receive.lightning", transaction: { settlementAmount, settlementFee, initiationVia: { paymentHash } } }`. Endpoint registered: `ep_3GjzbOPsVG9fCrEdg8pu2lImBfD`.
- **Blink dashboard:** IP-blocked from UK. All Blink config must be done via GraphQL API with API key, or via a non-UK connection.
- **Blink API key:** Active key is `refueler-cc68` (id: `b98cf536-ac9e-484b-bab2-14f1a181a12e`), scopes READ/RECEIVE/WRITE, never expires. Old key `refueler-beta` revoked CC-68.
- **merchant_orders.status valid values:** `awaiting_payment | pending | preparing | ready | collected | cancelled`. `confirmed` is NOT valid — use `pending` on settlement.
- **Dev test item:** `bsc-dev` (£0.01 / ~21 sats) in Black Sheep Coffee menu in `PreOrderScreen.tsx`. Remove before TestFlight.
- **PreOrderScreen settlement:** Three-layer detection — Realtime subscription + poll (3s, 5 min, skipped when backgrounded) + AppState.addEventListener foreground guard. On payment confirmed: fetches `payment_status, settled_sats, routing_fee_sats, item_name` from `orders`, calls `setView('settled')` inline. No routing — `NativeTabs` (expo-router/unstable-native-tabs) is incompatible with `router.replace`/`router.push` to sibling routes. `navigatedRef` prevents double-execution. `AppState.addEventListener` returns subscription object — use `.remove()` not deprecated `removeEventListener`.
- **Routing fee display rule:** `routing_fee_sats = 0` or `null` → show "fee: pending". Blink reports zero on receive side; actual sender fee not visible to us.
- **NativeTabs routing constraint (locked CC-69):** Cannot navigate from within NativeTabs to a sibling route (`order-status.tsx`). All post-payment UI must be inline state changes within the tab screen, not router navigation.
- **LNBits decision (CC-70):** Deferred until 1–2 merchants are live and generating real volume. Not economically viable before that. Prep work only: document webhook swap points. No VPS provisioned. Hetzner CX22 ~€4.50/month costed for when the time comes.
- **Fiat → sats rewards (CC-70):** Primary traction lever. Commuter pays by contactless card, Refueler captures commission, slice converts to sats and sends to user's Lightning address. User earns Bitcoin without touching Bitcoin. Gated on Block 5 (merchant onboarding) being live first.
- **Theme detection (locked CC-72):** Always `document.documentElement.dataset.theme === 'carbon'`. Never `classList.contains('carbon-mode')`. CSS selector is `[data-theme="carbon"]` — never `html.carbon-mode`.
- **Theme persistence (locked CC-72):** Cookie `rs-theme` scoped to `.refueler.io` (30-day rolling). Applies cross-domain between `refueler.io` and `share.refueler.io`. `localStorage` and `rfTheme` key fully removed from all public-facing pages.
- **Anthropic API key (CC-72):** Previous key exposed in `refueler_csuite_briefing_v2_4.html`. Key disabled. File cleaned. New key must be generated and stored securely outside any repo before csuite briefing is used again.
- **Paper colour (locked CC-74):** `#F5F0E8` is the canonical Paper background across ALL Refueler surfaces — refueler.io, share.refueler.io, and any future subdomain. `#F7F4EF` is wrong and must never appear in any `:root` block.
- **global.css ownership (locked CC-74):** `src/assets/css/global.css` is the single source of truth for `--bg`, `--paper`, `--carbon`, `--fg`, `--fg-muted`, `--fg-subtle`, `--nav-bg`, `--surface`, `--accent`, `--accent-hover`, `--accent-action`, body reset, nav, and footer. No page-level file may redefine these. Page CSS files may only define tokens not present in `global.css`.
- **share-tokens.css ownership (locked CC-74):** `frontend/share-tokens.css` is the Share equivalent of `global.css` — single source of truth for all Share tokens, reset, nav, footer, shared components, and status banner styles. The inline `<style>` block has been removed from `frontend/index.html`. No page on share.refueler.io may redefine base tokens inline.

---

## Global CSS — refueler.io (CC-72, updated CC-74)

`src/assets/css/global.css` — shared across all refueler.io pages via `src/_includes/head.njk`.

Contains: brand tokens (`#F5F0E8` Paper default, `[data-theme="carbon"]` override), reset, nav, footer, responsive nav.

`src/assets/css/legend.css` — Legend-specific layout and tokens only. As of CC-74: stripped of all tokens duplicating `global.css`. Only defines `--border-mid`, `--inset-rule`, font aliases, and Legend layout classes. Carbon override uses `[data-theme="carbon"]`.

**Outstanding (carry to CC-74):** Legend page still rendering white in Paper mode after deploy. Suspect `global.css` path not resolving from `/legend/` route, or a Cloudflare cache issue. First action of CC-74: verify `global.css` loads on Legend via browser devtools network tab.

**`_redirects` rule (locked CC-72):** Catch-all SPA redirect permanently removed. Two rules only:
```
/auth/v1/*    https://tihgvdokeofnjxjkenmm.supabase.co/auth/v1/:splat    200
/.well-known/*  /.well-known/:splat  200
```

---

## Share CSS architecture (CC-74)

`frontend/share-tokens.css` — new file (commit `db227aa`). Extracted from `frontend/index.html` inline `<style>` block. Contains all Share tokens, reset, nav, footer, shared components, status banner. Carbon override uses `[data-theme="carbon"]` throughout — `html.carbon-mode` fully removed.

`frontend/share.css` — component styles only. No token definitions.

`frontend/upgrade.css` — **still has `html.carbon-mode` pattern** — carry to CC-74 for cleanup.

---

## Stack

| Layer | Technology |
|---|---|
| Mobile app | React Native / Expo, Expo Router, routes under `src/app/` |
| Backend | Supabase (Postgres, Edge Functions, Realtime, RLS) |
| Payments | Blink BOLT11 (`api.blink.sv/graphql`) |
| Webhook | `blink-webhook` v12, no Svix — direct Blink callback |
| Web/CDN | Cloudflare Pages + Workers |
| Auth | PKCE via `refueler-auth-proxy` Cloudflare Worker |
| Merchant terminal | Numo fork (Android, `io.refueler.merchant`) |
| Ecash testing | `refueler-ecash-lab/` — local only, `@cashu/coco-core` installed |
| Ecash production | `refueler-mint` — CDK Rust + Orchard GUI (not live yet) |
| Payment layer (future) | LNBits self-hosted — deferred, see Block 9 |

---

## Database schema — key tables

### `orders`
`id, session_id, user_id, partner, bay_label, order_value_gbp, commission_pct, commission_gbp, commission_sats, sats_rate, reward_type, reward_sats, handover_method, payment_processor, payment_ref, zebedee_charge_id, settled_at, created_at, venue_id, item_name, status, updated_at, payment_status, bolt11_invoice, invoice_expires_at, pseudonym_id, routing_fee_sats, settled_sats`

### `merchant_users`
`id, user_id, email, role, venue_id, franchise_group_id, staff_pin_hash, owner_pin_hash, created_at`

Role CHECK constraint: `merchant | franchise_branch | franchise_hq | admin | independent_owner | investor`

### `venue_partners`
`id, merchant_id, name, category, site, coords_lat, coords_lng, location, address_line1, city, country, pickup_note, exclusivity_radius_m, active, pause_reason, session_added, created_at, contact_email, venue_type, franchise_group_id, brand_primary, brand_secondary, max_concurrent_orders`

### `merchant_orders`
`id, order_id, venue_id, status, item_summary, sats_amount, created_at, updated_at, bolt11_payment_hash, paid_at, payment_status, amount_gbp, bolt11_invoice, bolt11_expires_at`

**`merchant_orders.status` CHECK constraint:** `awaiting_payment | pending | preparing | ready | collected | cancelled`

### `franchise_groups`
`id, name, hq_venue_id, created_at`

---

## Edge Functions (deployed)

| Function | Version | Purpose | verify_jwt |
|---|---|---|---|
| `blink-webhook` | v12 | Blink direct callback. eventType=receive.lightning. Updates merchant_orders (status→pending, payment_status→paid) then orders (status→confirmed, payment_status→paid, settled_sats, routing_fee_sats). Duplicate webhook delivery handled gracefully. | `false` (explicit) |
| `create-order` | — | Consumer app → Blink BOLT11 invoice | explicit |
| `blink-balance` | — | Proxies Blink GraphQL balance | explicit |
| `rail-signal-poll` | — | Fenchurch St line Darwin feed poller, pg_cron triggered | explicit |

---

## Blink callback endpoint

- **Endpoint ID:** `ep_3GjzbOPsVG9fCrEdg8pu2lImBfD`
- **URL:** `https://tihgvdokeofnjxjkenmm.supabase.co/functions/v1/blink-webhook`
- **No signing secret** — verification via payment hash lookup against `merchant_orders.bolt11_payment_hash`.
- **Duplicate delivery:** Blink fires webhook twice per payment. v12 handles gracefully.

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

## Dev Console — telemetry tiles (CC-65: 3×3)

| Tile | ID | Source |
|---|---|---|
| Blink Wallet | `tile-zbd` | `blink-balance` Edge Function |
| BTC/GBP | `tile-btc` | CoinGecko |
| Geofence Hits | `tile-geo` | Always 0 — on-device by design |
| Auth Events | `tile-auth` | `sessions` count |
| Refueler Earnings | `tile-earn` | `orders.commission_gbp` sum |
| Error Stack | `tile-err` | `log_entries` voided count |
| Lightning Volume | `tile-vol` | `orders.settled_sats` sum |
| Routing Fees | `tile-fee` | `orders.routing_fee_sats` sum |
| Orders / Hour | `tile-spark` | SVG sparkline, last 12h |

---

## Consumer app — current screen inventory

| Screen | File | Status |
|---|---|---|
| Login | `src/app/login-test.tsx` | ✅ Working |
| Pre-order | `src/screens/PreOrderScreen.tsx` | ✅ Working — Realtime + polling fallback (CC-68). E2E retest outstanding. |
| Wallet setup | `src/screens/WalletSetupScreen.tsx` | ✅ Working |
| Order status | `src/app/order-status.tsx` | ✅ Built CC-63 |
| Tab bar | `src/app/(tabs)/app-tabs.tsx` | ✅ Working |

---

## Rail demand intelligence

| Feed | Status |
|---|---|
| `departure_board_staff` (FST) | ✅ Live, pg_cron jobid 3, every 2 min |
| `incidents` | ✅ Live |
| `car_park_occupancy` | ❌ Dead — strip from FEEDS array next touch |
| `rail_reference_stations` | ✅ 25/25 stations |
| `rail_reference_loadings` | ✅ 17,296 rows |

---

## Numo fork — hardening status

| Phase | Status |
|---|---|
| Phase 1 — EventModeManager | ✅ Closed — commit `15bebd0` |
| Phase 2 — EncryptedSharedPreferences | ✅ Closed |
| Phase 3 — Svix HMAC-SHA256 webhook | ✅ Closed |

---

## Sats display rule (locked CC-63)

Always `sats.toLocaleString()` — `5,284 sats` never `5.2k sats`.

## Fee display rule (locked CC-63)

Every transaction log: `gross sats | routing fee | net sats`. Fee unknown → `fee: pending`.

---

## Android dev build workflow

```bash
export JAVA_HOME=/Applications/Android\ Studio.app/Contents/jbr/Contents/Home
cd /Users/rajeshtaylor/Documents/refueler.io/refueler-app
npx expo run:android
adb reverse tcp:8081 tcp:8081
```

---

## RLS policies — active (CC-66)

| Table | Policy | Roles | CMD | Notes |
|---|---|---|---|---|
| `merchant_orders` | `merchant_orders_select_own_venue` | authenticated | SELECT | venue_id scoped to merchant_users.venue_id; role IN (merchant, franchise_branch, independent_owner) |
| `merchant_orders` | `merchant_orders_insert_service_role` | public | INSERT | service_role only |
| `merchant_orders` | `merchant_orders_update_service_role` | public | UPDATE | service_role only |
| `merchant_users` | `merchant_users_self_read` | authenticated | SELECT | auth.uid() = user_id |
| `orders` | `order_read_own` | public | SELECT | auth.uid() = user_id |
| `orders` | `orders_franchise_hq_select` | authenticated | SELECT | via franchise_group_id join |
| `orders` | `orders_admin_select` | authenticated | SELECT | admin role only |
| `orders` | `anon_insert_orders` | public | INSERT | consumer app order creation |
| `orders` | `auth_update_own_orders` | public | UPDATE | auth.uid() = user_id |
| `venue_partners` | `partners_public_read` | public | SELECT | fully public |
| `venue_partners` | `partners_service_write` | public | ALL | service_role only |
| `venue_partners` | `admin_full_access_venue_partners` | authenticated | ALL | admin role |
| `venue_partners` | `merchant_select_own_venue` | authenticated | SELECT | merchant/branch/owner own venue |
| `venue_partners` | `franchise_hq_select_own_group_venues` | public | SELECT | franchise_group_id match |
| `venue_partners` | `venue_partners_merchant_pause_update` | authenticated | UPDATE | merchant/branch/owner, own venue, active + pause_reason |

---

## Nav architecture — locked CC-73/74

**Main site (`refueler.io`):** Legend, Editorial, Notes, Share, Privacy, theme pill.

**Share (`share.refueler.io`):** Notes, Upgrade, Support, theme pill. Privacy footer-only.

**Wordmark breadcrumb rule (locked CC-73):** `wordmarkSection` frontmatter controls `/ SECTION`. Only set on pages where meaningful. All others render plain `REFUELER`.

**Support email (locked CC-73):** `support@refueler.io` user-facing. `privacy@refueler.io` GDPR only.

**`refueler-multi-core` renamed to `refueler-legend` (CC-73):** Local path `/Users/rajeshtaylor/Documents/refueler-legend/`. All bridge copies clean.

---

## Session queue (post CC-74)

**CC-74** (next) — global.css migration completion: Legend white-in-Paper fix; theme carry between nav pages; upgrade.css carbon-mode cleanup on Share → **Block 3** (franchise dashboard) → **Block 5** (merchant onboarding) → **Block 8** (fiat → sats rewards) → **Session A** (CDK mint) → **Session B** (stamp lifecycle + FCA) → **Block 9** (LNBits) → **Ticketing MVP**

---

## LNBits — deferred roadmap note (CC-70)

- **What:** Self-hosted LNBits on Hetzner CX22 ~€4.50/month.
- **Why deferred:** Not economically viable until 1–2 merchants are live.
- **Prep work approved:** Document the ~20 lines in `blink-webhook` that would change. No VPS until volume justifies it.
- **Key unknown:** LNBits webhook payload shape — confirm payment hash field with Ben Arc before Block 9 starts.

---

## GitHub Actions error

Red X on commit `9b9655d` — non-fatal. Fix when convenient.

---

## spatial_ref_sys advisory (flagged CC-65)

`spatial_ref_sys` (PostGIS system table) has RLS disabled. No user data. Assessed low risk. No action taken.

---

## DB Maintenance — rail_signal_history bloat (21 Jul 2026)

Root cause: `rail_signal_history` accumulates Darwin poll data every 2 min, producing catastrophic index bloat over 30 days. Full export to `/Volumes/Portable 001/refueler.io_Backup/` as five CSV part files (32,310 rows). All three bloat tables truncated. DB reduced to 32MB.

**Recurring maintenance:** Repeat every 3–4 weeks before hitting 500MB. psql: `postgresql://postgres.tihgvdokeofnjxjkenmm:[PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:5432/postgres`. Password in Apple Notes.

---

*"Nothing stops this train."*
