# Refueler Master Context — CC-21
*Updated: 2026-06-15 (CC-21c)*

---

## Project overview

Refueler is a Bitcoin-native mobile pre-order platform for commuters on the Fenchurch St line (Shoeburyness → Fenchurch Street corridor), targeting independent cafés and franchise venues near stations.

**Supabase project:** `tihgvdokeofnjxjkenmm`
**Webhook URL:** `https://tihgvdokeofnjxjkenmm.supabase.co/functions/v1/blink-webhook`
**Transactional email:** `noreply@refueler.io`
**GitHub:** `rajesh-taylor/refueler-io` (note: hyphen, not underscore). Large HTML files committed via Terminal git, not GitHub MCP.
**Latest commit:** `3df6771` (CC-21c — merchant_orders migration)

---

## Payment architecture (locked)

- **Provider:** Blink / BOLT11 only (`api.blink.sv/graphql`)
- ZBD: permanently replaced CC-11 — do not reopen
- BOLT12: assessed, abandoned for beta — do not reopen
- Refueler role: order coordination layer only — never holds funds
- Webhook security: **Svix signature verification** (whsec_ secret, HMAC-SHA256) — outstanding fix

---

## Supabase edge functions

| Function | Status | Notes |
|---|---|---|
| `bolt11-create-invoice` | ACTIVE | Blink `lnInvoiceCreate` GraphQL mutation |
| `blink-webhook` | ACTIVE | Svix verification outstanding — known fix needed |

## Supabase secrets

| Key | Status |
|---|---|
| `BLINK_API_KEY` | ✅ (`refueler-beta`) |
| `BLINK_GRAPHQL_URL` | ✅ |
| `BLINK_WEBHOOK_SECRET` | ✅ (whsec_ format) |
| `BLINK_SANDBOX_GRAPHQL_URL` | Not added — non-critical |
| `bolt11_encryption_key` | ⚠️ PLACEHOLDER — replace via Dashboard before any live invoice processing |
| `SUPABASE_URL` | Auto-injected |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-injected |

---

## Supabase Auth configuration (verified CC-21c)

| Setting | Value |
|---|---|
| Site URL | `https://refueler.io` |
| Redirect URLs | `http://localhost:*`, `https://refueler.io/merchant-tablet.html`, `https://refueler.io/command-centre.html` |
| Flow | Implicit (web). Switch to PKCE when React Native build starts. |
| Magic link sender | `noreply@refueler.io` (Resend/Tuta) |

---

## Database schema — live state (verified CC-21c)

### `venue_partners` (14 rows live)
| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `merchant_id` | text | NO | — | Must be supplied. Convention: `'{brand}-hq'` for HQ, `'{brand}-{location}'` for branches |
| `name` | text | NO | — | |
| `category` | text | NO | — | Must be supplied. `'franchise_hq'` for HQ; `'café'`/`'coffee'`/etc. for operating venues |
| `site` | text | YES | — | |
| `coords_lat/lng` | numeric | YES | — | |
| `location` | USER-DEFINED | YES | — | PostGIS geometry |
| `address_line1`, `city` | text | YES | — | |
| `country` | text | YES | `'GB'` | |
| `pickup_note` | text | YES | — | |
| `exclusivity_radius_m` | integer | YES | 500 | |
| `active` | boolean | YES | true | |
| `session_added` | integer | YES | — | |
| `created_at` | timestamptz | YES | now() | |
| `contact_email` | text | YES | — | Not used for venue resolution (deprecated path) |
| `venue_type` | text | NO | `'independent'` | Values: `'independent'`, `'franchise_branch'`, `'franchise_hq'` |
| `franchise_group_id` | uuid | YES | — | FK → `franchise_groups.id` |
| `brand_primary` | text | YES | — | Hex colour for ETA widget |
| `brand_secondary` | text | YES | — | Hex colour for ETA widget |
| `max_concurrent_orders` | integer | YES | — | |

**Known venue rows:**
| merchant_id | name | venue_type | franchise_group_id | brand_primary | brand_secondary |
|---|---|---|---|---|---|
| `costa-hq` | Costa Coffee HQ | `franchise_hq` | c2d1f205-… (Costa) | `#C8312A` | `#F5F0D0` |
| `costa-fenchurch-st` | Costa Coffee Fenchurch Street | `franchise_branch` | c2d1f205-… (Costa) | `#C8312A` | `#F5F0D0` |
| `ms-cafe-lakeside` | M&S Café Lakeside | `franchise_branch` | NULL ⚠️ | `#2E6B3E` | `#C8A96E` |

### `franchise_groups` (1 row live)
| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK — `c2d1f205-18ec-410d-ab06-5950d8497856` |
| `name` | text | `'Costa Coffee'` |
| `hq_venue_id` | uuid | FK → `venue_partners.id` — wired to Costa HQ row |
| `created_at` | timestamptz | |

### `merchant_users` (live — `dev@refueler.io` row active)
| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `user_id` | uuid | FK → `auth.users` |
| `email` | text | |
| `role` | text | Values: `merchant`, `franchise_branch`, `franchise_hq`, `admin`, `independent_owner` |
| `venue_id` | uuid | |
| `franchise_group_id` | uuid | |
| `owner_pin_hash` | text | SHA-256 no salt. `dev@refueler.io`: hash of `8888` set CC-21b |
| `staff_pin_hash` | text | Not yet set for `dev@refueler.io` |
| `created_at` | timestamptz | |

**Live row:**
| user_id | email | role | owner_pin_hash |
|---|---|---|---|
| `e8d39365-bed4-4f53-8746-7b170a4b0ef8` | `dev@refueler.io` | `admin` | `2926a2731f4b312c08982cacf8061eb14bf65c1a87cc5d70e864e079c6220731` (SHA-256 of `8888`) |

### `merchant_orders`
| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | uuid | gen_random_uuid() | |
| `order_id` | uuid | | FK → `orders.id` |
| `venue_id` | uuid | | |
| `status` | text | `'awaiting_payment'` | Values: `pending`, `ready`, `collected`, `expired` |
| `item_summary` | text | | |
| `sats_amount` | bigint | | |
| `created_at` / `updated_at` | timestamptz | now() | |
| `bolt11_payment_hash` | text | | |
| `paid_at` | timestamptz | | |
| `payment_status` | text | | |
| `amount_gbp` | numeric | | |

**CC-21c:** All merchant queue reads/writes confirmed on `merchant_orders`. Zero direct `orders` table access in `merchant-tablet-logic.js`.

### `orders` (1 test row)
| Column | Type | Default / Notes |
|---|---|---|
| `id` | uuid | gen_random_uuid() |
| `pseudonym_id` | uuid | User pseudonym — never `auth.uid()` directly |
| `venue_id` | uuid | |
| `item_name` | text | |
| `status` | text | Default `'pending'` |
| `payment_status` | text | `'unpaid'` default |
| `payment_processor` | text | Default `'zebedee'` ⚠️ DRIFT — should be `'blink'` |
| `bolt11_invoice` | text | Encrypted at rest (pgcrypto). Cleared on settlement/expiry. |
| `invoice_expires_at` | timestamptz | |
| `order_value_gbp` | numeric | |
| `commission_pct` | numeric | Default `15.0` |
| `reward_type` | text | Default `'sats'` |
| `created_at` / `updated_at` | timestamptz | now() |

---

## Schema drift flags

| Flag | Detail | Priority |
|---|---|---|
| `orders.payment_processor` default | Still `'zebedee'` — should be `'blink'` | 🟡 Future migration |
| `M&S Café Lakeside` `franchise_group_id` | NULL — wire when M&S franchise_groups row created | ⚪ |

---

## Command Centre — File Registry (CC-21c)

| File | Path | Status |
|---|---|---|
| `command-centre.html` | `07_App_Specs/Command_Center/` | Stable |
| `merchant-tablet.html` | `07_App_Specs/Command_Center/` | CC-21 updated — Horizon Strip, landscape CSS |
| `merchant-tablet-styles.css` | `07_App_Specs/Command_Center/` | CC-21 updated |
| `merchant-tablet-logic.js` | `07_App_Specs/Command_Center/` | CC-21c — merchant_orders migration complete |
| `dev-console.html` | `07_App_Specs/Command_Center/` | Auth gate buttons orange ⚠️ — fix queued |
| `franchise-dashboard.html` | `07_App_Specs/Command_Center/` | Auth gate buttons orange ⚠️ — fix queued |

---

## Merchant PIN auth — state (CC-21b/c)

- SHA-256, no salt, raw string — `crypto.subtle` browser native
- `dev@refueler.io` `owner_pin_hash`: SHA-256 of `8888` = `2926a2731f4b312c08982cacf8061eb14bf65c1a87cc5d70e864e079c6220731`
- Client-side hash in `merchant-tablet-logic.js` confirmed aligned
- `staff_pin_hash` not yet set — staff PIN flow untested
- Full end-to-end browser test (magic link → PIN gate → queue) still outstanding

---

## Supabase MCP patterns

- Project ID `tihgvdokeofnjxjkenmm` required on every call.
- `apply_migration` for all DDL schema changes.
- `execute_sql` for read-only verification only.
- `vault.decrypted_secrets` view (not `vault.secrets`) required inside SECURITY DEFINER functions.
- Cron: `cron.schedule()` without `extensions.` prefix on this project.

---

## Ecash lab structure

`refueler-ecash-lab/` sits adjacent to `refueler.io/` at `/Users/rajeshtaylor/Documents/`.
Contains `mint/` and `wallet/` subdirs with isolated `.env`s.
Context file: `refueler-ecash-lab/docs/ecash-lab.md`.
Terminal adapters live inside `refueler.io/terminals/` (numo/, future Block etc + `TERMINAL-ADAPTER-SPEC.md`).

---

## Session history

| Session | Key outcome |
|---|---|
| CC-02 → CC-08 | Command Centre built; Supabase tables; magic link auth; BOLT11/ZBD integration |
| CC-09 | Orange abolition; browser test framework |
| CC-10 | ZBD → Blink; edge functions; Svix; Blink secrets |
| CC-11 | Blink permanent; `independent_owner` role; OPS/QUEUE switcher; magic link template |
| CC-12 | Svix verification corrected; pg_cron migration; orange audit clean |
| CC-13 | Franchise architecture: `franchise_groups`, `venue_type`, brand colours |
| CC-14 | Costa franchise_groups row; branches wired |
| CC-15 | M&S brand colours wired |
| CC-16 | Legacy Costa rows deleted; Costa HQ inserted; `hq_venue_id` wired |
| CC-17 | Live schema verification; drift flagged; context updated |
| CC-18 | KDS benchmark; Beck motif approved; Horizon Strip Option A; landscape scoped |
| CC-19 | Orange purge Groups A/B/C; CSS custom properties for responsive layout |
| CC-20 | CSS Grid queue; Blink migration; edge functions deployed; `merchant_orders` created |
| CC-20b/c | `merchant-tablet.html` split to three sibling files; auth flow browser verification begun |
| CC-21a | Horizon Strip built (persistent header); Darwin live feed; Beck motif; landscape CSS |
| CC-21b | `owner_pin_hash` set for `dev@refueler.io`; `merchant_users` SQL fixes; 62 files committed (`8c36b03`) |
| CC-21c | PIN hash confirmed aligned; `contact_email` path confirmed clean; redirect URLs confirmed; `merchant_orders` migration complete; commit `3df6771` |

---

## Standing items — carry to CC-22

| Item | Priority | Notes |
|---|---|---|
| **Vault key replacement** | 🔴 | Replace `bolt11_encryption_key` via Dashboard before any live invoice processing |
| **Svix webhook verification** | 🔴 | `blink-webhook` signature verification — outstanding fix |
| **Browser E2E PIN test** | 🟡 | Magic link → PIN gate → queue, live `dev@refueler.io` session |
| **`dev-console.html` / `franchise-dashboard.html` auth buttons** | 🟡 | Replace orange fill with outlined `#C8A96E` gold |
| **ICO registration** | 🟡 | Must complete before beta (£40/year) |
| **`orders.payment_processor` default** | 🟡 | Change `'zebedee'` → `'blink'` via migration |
| **JSDoc on `mintInterface.ts`** | 🟡 | Draft locked — add on next touch |
| **Ben Cousins message** | 🟡 | Cleared to send from `hello@refueler.io` |
| **Costa Coffee partnership** | 🟡 | Head of Partnerships to initiate |
| **pg_cron deployment** | 🟡 | Migration written — deploy when pg_cron confirmed |
| **`merchant_users` HQ test row** | 🟡 | FK → auth.users blocks insert — revisit at auth revision |
| **M&S `franchise_group_id`** | ⚪ | Wire when M&S group row created |
| **Supabase PKCE** | ⚪ | React Native build start |
| **Minibits dev call** | ⚪ | NUT-18 send = critical path |
| **NUT-28** | ⚪ | Pending Minibits P2BK confirmation |
| **React Native shell** | ⚪ | July 2026 |
| **Analytics verification** | ⚪ | POST to `analytics.refueler.io/event` → 204 |
| **Cashu ecash test deployment** | ⚪ | Standalone mint (Nutshell or CDK) |
| **Numo terminal review** | ⚪ | Pixel 9a / GrapheneOS, split-screen SumUp |
