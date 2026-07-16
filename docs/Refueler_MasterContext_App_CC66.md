# Refueler Master Context — IO CC-66
*Updated: 2026-07-16 (CC-66)*
*Supersedes: Refueler_MasterContext_IO_CC65.md*
*Sync log: MasterContext_IO_CC66 — schema: venue_partners.pause_reason (text) added; policies added: orders_franchise_hq_select, orders_admin_select, venue_partners_merchant_pause_update; merchant_orders_select_own_venue tightened to authenticated + role filter.*

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
| `rajesh-taylor/refueler-multi-core` | Public — ARM Bitcoin indexer | `/Users/rajeshtaylor/Documents/refueler-multi-core/` |
| `rajesh-taylor/refueler-mint` | Public — CDK Rust loyalty stamp mint | `/Users/rajeshtaylor/Documents/refueler-mint/` |
| `refueler-ecash-lab` | **Local only — never push** | `/Users/rajeshtaylor/Documents/refueler-ecash-lab/` |

**Consumer app bundle ID:** `io.refueler.app`
**Merchant terminal package:** `io.refueler.merchant`

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

---

## Stack

| Layer | Technology |
|---|---|
| Mobile app | React Native / Expo, Expo Router, routes under `src/app/` |
| Backend | Supabase (Postgres, Edge Functions, Realtime, RLS) |
| Payments | Blink BOLT11 (`api.blink.sv/graphql`) |
| Webhook | `blink-webhook` v8, Svix HMAC-SHA256 |
| Web/CDN | Cloudflare Pages + Workers |
| Auth | PKCE via `refueler-auth-proxy` Cloudflare Worker |
| Merchant terminal | Numo fork (Android, `io.refueler.merchant`) |
| Ecash testing | `refueler-ecash-lab/` — local only, `@cashu/coco-core` installed |
| Ecash production | `refueler-mint` — CDK Rust + Orchard GUI (not live yet) |

---

## Database schema — key tables

### `orders`
`id, session_id, user_id, partner, bay_label, order_value_gbp, commission_pct, commission_gbp, commission_sats, sats_rate, reward_type, reward_sats, handover_method, payment_processor, payment_ref, zebedee_charge_id, settled_at, created_at, venue_id, item_name, status, updated_at, payment_status, bolt11_invoice, invoice_expires_at, pseudonym_id, routing_fee_sats, settled_sats`

**CC-65 addition:** `settled_sats bigint` — gross sats written by `blink-webhook` at settlement.

### `merchant_users`
`id, user_id, email, role, venue_id, franchise_group_id, staff_pin_hash, owner_pin_hash, created_at`

Role CHECK constraint (CC-65 updated):
`merchant | franchise_branch | franchise_hq | admin | independent_owner | investor`

### `venue_partners`
`id, merchant_id, name, category, site, coords_lat, coords_lng, location, address_line1, city, country, pickup_note, exclusivity_radius_m, active, pause_reason, session_added, created_at, contact_email, venue_type, franchise_group_id, brand_primary, brand_secondary, max_concurrent_orders`

Note: `franchise_group_id` already present on `venue_partners` (confirmed CC-65 schema inspection — Block 1 migration listed in CC-65 project prompt is already done).

### `merchant_orders`
`id, order_id, venue_id, status, item_summary, sats_amount, created_at, updated_at, bolt11_payment_hash, paid_at, payment_status, amount_gbp, bolt11_invoice, bolt11_expires_at`

### `franchise_groups`
`id, name, hq_venue_id, created_at`

---

## Edge Functions (deployed)

| Function | Version | Purpose | verify_jwt |
|---|---|---|---|
| `blink-webhook` | v8 | Svix HMAC-SHA256 payment settlement. v8: writes `settled_sats` + `routing_fee_sats` to `orders` at settlement. | `false` (explicit) |
| `create-order` | — | Consumer app → Blink BOLT11 invoice | explicit |
| `blink-balance` | — | Proxies Blink GraphQL balance | explicit |
| `rail-signal-poll` | — | Fenchurch St line Darwin feed poller, pg_cron triggered | explicit |

---

## Command Centre — role routing

| Role | Destination |
|---|---|
| `merchant` | `merchant-tablet.html` |
| `franchise_branch` | `merchant-tablet.html` |
| `independent_owner` | `merchant-tablet.html` |
| `franchise_hq` | `franchise-dashboard.html` |
| `admin` | `dev-console.html` |
| `investor` | `investor-snapshot.html` ← added CC-65 |

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
| Lightning Volume | `tile-vol` | `orders.settled_sats` sum — **new CC-65** |
| Routing Fees | `tile-fee` | `orders.routing_fee_sats` sum — **new CC-65** |
| Orders / Hour | `tile-spark` | SVG sparkline, last 12h — **new CC-65** |

Plus: First Order Per Venue table below the telemetry grid — **new CC-65**.

---

## Investor Snapshot page — CC-65

`investor-snapshot.html` — magic-link-gated, `investor` role only.

KPIs: Lightning Volume (settled_sats sum) · Paid Orders · Active Venues · Commuter Wallets (lightning_address set).

Charts: Orders/hour sparkline (last 12h).

Sections: Venue Traction (first paid order per venue) · Context block.

No raw data. No console access. No DB admin. Role verified against `merchant_users` on every session load.

To provision investor access: insert a row into `merchant_users` with `role = 'investor'` and the investor's `user_id` (obtained after their first magic-link sign-in via `auth.users`). No `venue_id` required for investor role.

---

## Consumer app — current screen inventory

| Screen | File | Status |
|---|---|---|
| Login | `src/app/login-test.tsx` | ✅ Working |
| Pre-order | `src/screens/PreOrderScreen.tsx` | ✅ Working |
| Wallet setup | `src/screens/WalletSetupScreen.tsx` | ✅ Working |
| Order status | `src/app/order-status.tsx` | ✅ Built CC-63 — navigation wiring pending |
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
| `orders` | `orders_franchise_hq_select` | authenticated | SELECT | via franchise_group_id join — added CC-66 |
| `orders` | `orders_admin_select` | authenticated | SELECT | admin role only — added CC-66 |
| `orders` | `anon_insert_orders` | public | INSERT | consumer app order creation |
| `orders` | `auth_update_own_orders` | public | UPDATE | auth.uid() = user_id |
| `venue_partners` | `partners_public_read` | public | SELECT | fully public |
| `venue_partners` | `partners_service_write` | public | ALL | service_role only |
| `venue_partners` | `admin_full_access_venue_partners` | authenticated | ALL | admin role |
| `venue_partners` | `merchant_select_own_venue` | authenticated | SELECT | merchant/branch/owner own venue |
| `venue_partners` | `franchise_hq_select_own_group_venues` | public | SELECT | franchise_group_id match |
| `venue_partners` | `venue_partners_merchant_pause_update` | authenticated | UPDATE | merchant/branch/owner, own venue, active + pause_reason — added CC-66 |

---

## Session queue (post CC-65)

**Block 2** (consumer app ↔ merchant tablet connection) → Block 3 (franchise dashboard completion) → Block 5 (merchant onboarding flow) → Session A (CDK mint architecture) → Session B (stamp lifecycle + FCA) → CC-67 (Ticketing MVP)

---

## spatial_ref_sys advisory (flagged CC-65)

`spatial_ref_sys` (PostGIS system table) has RLS disabled. No user data. Assessed low risk — PostGIS geodata only. No action taken. Owner aware.

---

*"Nothing stops this train."*
