# Refueler Master Context — CC-18
*Updated: 2026-06-12 (CC-18 planning)**

---

## Project overview

Refueler is a Bitcoin-native mobile pre-order platform for commuters on the Fenchurch St line (Shoeburyness → Fenchurch Street corridor), targeting independent cafés and franchise venues near stations.

**Supabase project:** `tihgvdokeofnjxjkenmm`
**Webhook URL:** `https://tihgvdokeofnjxjkenmm.supabase.co/functions/v1/blink-webhook`
**Transactional email:** `noreply@refueler.io`
**GitHub:** `rajesh-taylor/refueler-io` (note: hyphen, not underscore). Large HTML files committed via Terminal git, not GitHub MCP.

---

## Payment architecture (locked)

- **Provider:** Blink / BOLT11 only (`api.blink.sv/graphql`)
- ZBD: permanently replaced CC-11 — do not reopen
- BOLT12: assessed, abandoned for beta — do not reopen
- Refueler role: order coordination layer only — never holds funds
- Webhook security: **Svix signature verification** (whsec_ secret, HMAC-SHA256, signed payload = `{svix-id}.{svix-timestamp}.{raw-body}`)

---

## Supabase edge functions

| Function | Status | Notes |
|---|---|---|
| `bolt11-create-invoice` | ACTIVE | Blink `lnInvoiceCreate` GraphQL mutation |
| `blink-webhook` | ACTIVE | Svix verification — updated CC-12 |

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

## Database schema — live state (verified CC-17)

### `venue_partners` (14 rows live)
| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `merchant_id` | text | NO | — | **No default. Must be supplied on insert.** Convention: `'{brand}-hq'` for HQ rows, `'{brand}-{location}'` for branches |
| `name` | text | NO | — | |
| `category` | text | NO | — | **No default. Must be supplied.** Use `'franchise_hq'` for HQ rows; `'café'`/`'coffee'`/etc. for operating venues |
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
| `contact_email` | text | YES | — | Not used for venue resolution |
| `venue_type` | text | NO | `'independent'` | Values: `'independent'`, `'franchise_branch'`, `'franchise_hq'` |
| `franchise_group_id` | uuid | YES | — | FK → `franchise_groups.id` |
| `brand_primary` | text | YES | — | Hex colour for ETA widget |
| `brand_secondary` | text | YES | — | Hex colour for ETA widget |
| `max_concurrent_orders` | integer | YES | — | |

**Known venue rows (key entries):**
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
| `hq_venue_id` | uuid | FK → `venue_partners.id` — wired to Costa HQ row (CC-16) |
| `created_at` | timestamptz | |

### `merchant_users` (0 rows — no live auth users yet)
| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `user_id` | uuid | FK → `auth.users` — **blocks test inserts without real auth entry** |
| `email` | text | |
| `role` | text | Values: `merchant`, `franchise_branch`, `franchise_hq`, `admin`, `independent_owner` |
| `venue_id` | uuid | |
| `franchise_group_id` | uuid | |
| `created_at` | timestamptz | |

**Deferred item:** Test HQ row for merchant_users cannot be inserted without a real `auth.users` entry. Parked — revisit at auth flow revision.

### `merchant_orders` (0 rows)
| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | uuid | gen_random_uuid() | |
| `order_id` | uuid | | FK → `orders.id` |
| `venue_id` | uuid | | |
| `status` | text | `'awaiting_payment'` | |
| `item_summary` | text | | |
| `sats_amount` | bigint | | |
| `created_at` / `updated_at` | timestamptz | now() | |
| `bolt11_payment_hash` | text | | |
| `paid_at` | timestamptz | | |

### `orders` (1 test row)
| Column | Type | Default / Notes |
|---|---|---|
| `id` | uuid | gen_random_uuid() |
| `session_id` | text | |
| `user_id` | uuid | Not `auth.uid()` directly — uses `pseudonym_id` model |
| `partner` | text | |
| `bay_label` | text | |
| `order_value_gbp` | numeric | |
| `commission_pct` | numeric | Default `15.0` |
| `commission_gbp`, `commission_sats`, `sats_rate` | numeric/bigint | |
| `reward_type` | text | Default `'sats'` |
| `reward_sats`, `reward_giftcard_value_gbp` | bigint/numeric | |
| `handover_method` | text | |
| `payment_processor` | text | Default `'zebedee'` ⚠️ **DRIFT: should be updated to `'blink'`** |
| `payment_ref` | text | |
| `zebedee_charge_id` | text | Legacy column — do not remove yet |
| `settled_at` | timestamptz | |
| `created_at` | timestamptz | now() |
| `venue_id` | uuid | |
| `item_name` | text | |
| `status` | text | Default `'pending'` |
| `updated_at` | timestamptz | now() |
| `payment_status` | text | `'unpaid'` default |
| `bolt11_invoice` | text | Encrypted at rest (pgcrypto). Cleared on settlement/expiry. |
| `invoice_expires_at` | timestamptz | |
| `pseudonym_id` | uuid | User pseudonym — never `auth.uid()` directly |

---

## Schema drift flags (identified CC-17 verification)

| Flag | Detail | Priority |
|---|---|---|
| `orders.payment_processor` default | Still `'zebedee'` — should be `'blink'` | 🟡 Future migration |
| `M&S Café Lakeside` `franchise_group_id` | NULL — wire when M&S franchise_groups row created | ⚪ |

---

## Command Centre pages

| File | Role | Status |
|---|---|---|
| `command-centre.html` | Routing entry, role-based redirect | Stable |
| `merchant-tablet.html` | Merchant/independent_owner POS + OPS/QUEUE switcher | CC-11 updated |
| `dev-console.html` | Admin telemetry + JSON import | Stable |
| `franchise-dashboard.html` | Franchise HQ analytics | Stable |

**Orange abolition:** `#F5820A` confirmed absent from all four pages as of CC-12 audit.
Auth gate buttons: outlined gold (`#C8A96E`, transparent background) on all pages.

---

## Auth

- Magic link via `noreply@refueler.io` (Resend/Tuta)
- Template: `magic-link-email-template.html` — paste into Supabase Dashboard → Auth → Email Templates → Magic Link
- Subject: `Your Refueler sign-in link`
- Flow: implicit (web). Switch to PKCE when React Native build starts.
- `merchant_users.user_id` has FK → `auth.users` — any test row requires a real auth entry first.

---

## Brand & design tokens

| Token | Hex | Usage |
|---|---|---|
| Carbon | `#1A1A1A` | Default theme (app, Command Centre) |
| Paper | `#F5F0E8` | Light mode; homepage + editorial default |
| Gold (accent) | `#C8A96E` | Auth buttons, borders, dividers |
| Warn (Paper) | `#B87333` | Status indicators |
| Warn (Carbon) | `#C8943A` | Status indicators |
| Danger | `#E05252` | Destructive actions |
| **Orange** | **ABOLISHED** | `#F5820A` — does not exist, no exceptions |

Typography: Source Serif 4 (editorial body), Satoshi (headings), DM Sans (UI chrome), IBM Plex Mono (telemetry/financials).
Register: "James Bond, not fintech neon."

---

## Regulatory position

- Refueler = order coordination and BI layer only
- FCA pre-application: July 2026 (not critical path)
- ICO registration: submit when first merchant confirmed (£40/year)
- Self-operating a UK Cashu mint: ruled out (£1.6M+ safeguarding, MLR overhead)

---

## Ecash lab structure

`refueler-ecash-lab/` sits adjacent to `refueler.io/` at `/Users/rajeshtaylor/Documents/`.
Contains `mint/` and `wallet/` subdirs with isolated `.env`s.
Context file: `refueler-ecash-lab/docs/ecash-lab.md`.
Terminal adapters live inside `refueler.io/terminals/` (numo/, future Block etc + `TERMINAL-ADAPTER-SPEC.md`).

---

## Supabase MCP patterns

- Project ID `tihgvdokeofnjxjkenmm` required on every call.
- `apply_migration` for all DDL schema changes.
- `execute_sql` for read-only verification only.
- `vault.decrypted_secrets` view (not `vault.secrets`) required inside SECURITY DEFINER functions.
- Cron: `cron.schedule()` without `extensions.` prefix on this project.

---

## Session history

| Session | Key outcome |
|---|---|
| CC-02 → CC-08 | Command Centre pages built; Supabase tables; magic link auth; BOLT11/ZBD integration |
| CC-09 | Orange abolition pass; browser test framework |
| CC-10 | ZBD → Blink switch; edge functions `bolt11-create-invoice` + `bolt11-webhook` written; Svix webhook registered; Blink secrets stored |
| CC-11 | Blink confirmed permanent; `independent_owner` role; OPS/QUEUE switcher on `merchant-tablet.html`; magic link email template branded |
| CC-12 | `blink-webhook` Svix verification corrected; pg_cron migration written; orange audit clean across all pages; context files updated |
| CC-13 | Franchise architecture established: `franchise_groups` table created; `venue_partners` extended with `venue_type`, `franchise_group_id`, `brand_primary`, `brand_secondary`, `max_concurrent_orders`; `merchant_id` (TEXT NOT NULL) and `category` (TEXT NOT NULL) documented as undocumented NOT NULL columns |
| CC-14 | Costa Coffee franchise_groups row inserted; venue_partners branch rows wired to franchise_group_id |
| CC-15 | M&S Café Lakeside `venue_type` updated to `franchise_branch`; brand colours wired (`#2E6B3E` / `#C8A96E`) |
| CC-16 | Legacy Costa rows (independent, no brand colours) deleted; Costa Coffee HQ row inserted (`merchant_id = 'costa-hq'`, `category = 'franchise_hq'`, `venue_type = 'franchise_hq'`); `franchise_groups.hq_venue_id` wired to Costa HQ row; `merchant_users` test HQ row deferred (FK → auth.users constraint) |
| CC-17 | Live schema verification pass; schema drift flagged (`orders.payment_processor` default still `'zebedee'`); master context files updated (claude_v2_5.md + this file) |
| CC-18 planning | C-suite findings reviewed (CTO + CPO KDS benchmark outputs). Agreed: purge-first before Horizon Strip build. Beck motif approved for brand register. Darwin Card confirmed beta (ambient header). Horizon Strip position: Option A (persistent header) preferred by Rajesh — Head of Design to confirm. Landscape mode identified as unscoped — added as CC-21 prerequisite. Orange purge file list grep-verified: 16 files Group C, 7 files Group B, 4 files Group A. Session order locked CC-18 through CC-22. |

---

## Deferred items — carry to CC-18

| Item | Priority | Notes |
|---|---|---|
| `orders.payment_processor` default | 🟡 | Change default from `'zebedee'` to `'blink'` via migration — scheduled CC-20 |
| `bolt11_encryption_key` Vault replacement | 🔴 | Replace placeholder via Dashboard before any live invoice processing |
| `merchant_users` test HQ row | 🟡 | FK → auth.users blocks insert without real auth entry |
| pg_cron deployment | 🟡 | Migration written — confirm pg_cron enabled, then deploy |
| pgcrypto `bolt11_invoice` encryption audit | 🟡 | Post-AES-GCM edge function review |
| Ben Cousins outreach | 🟡 | FCA pre-application / loyalty stamp PII question |
| Costa Coffee partnership | 🟡 | Head of Partnerships to initiate |
| **CC-21 prereq: Horizon Strip position** | 🟡 | Option A (persistent header) is Rajesh's preferred position — Head of Design must confirm before CC-21 build opens |
| **CC-21 prereq: Landscape mode scoping** | 🟡 | Tablet may be used horizontally on counter — tile grid (2-col portrait → 3–4-col landscape) and full-width Horizon Strip behaviour must be designed before CC-21 build opens |
| M&S `franchise_group_id` | ⚪ | Wire when M&S franchise_groups row created |
| Supabase PKCE | ⚪ | React Native build start |
| Minibits NUT-18 dev call | ⚪ | Critical path for ecash send |
| React Native shell | ⚪ | July 2026 |
| Analytics verification | ⚪ | DevTools POST to analytics.refueler.io/event → 204 |
| Cashu ecash test deployment | ⚪ | Standalone mint (Nutshell or CDK) |
| Numo terminal review | ⚪ | Pixel 9a / GrapheneOS, split-screen SumUp |
| ICO registration | ⚪ | Submit when first merchant confirmed (£40/year) |
