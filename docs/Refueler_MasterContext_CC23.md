# Refueler Master Context — CC-23
*Updated: 2026-06-17 (CC-23)*

---

## Project overview

Refueler is a Bitcoin-native mobile pre-order platform for commuters on the Fenchurch St line (Shoeburyness → Fenchurch Street corridor), targeting independent cafés and franchise venues near stations.

**Supabase project:** `tihgvdokeofnjxjkenmm`
**Webhook URL:** `https://tihgvdokeofnjxjkenmm.supabase.co/functions/v1/blink-webhook`
**Transactional email:** `noreply@refueler.io`
**GitHub:** `rajesh-taylor/refueler-io` (hyphen, not underscore). Large HTML files committed via Terminal git, not GitHub MCP.
**Latest commits:** `d975093` (CC-23 — Command Centre files moved to repo root) + anon key fix commit (CC-23 close)

---

## Payment architecture (locked)

- **Provider:** Blink / BOLT11 only (`api.blink.sv/graphql`)
- ZBD: permanently replaced CC-11 — do not reopen
- BOLT12: assessed, abandoned for beta — do not reopen
- Refueler role: order coordination layer only — never holds funds
- Webhook security: Svix HMAC-SHA256 verification live (CC-22) ✅

---

## Supabase edge functions

| Function | Status | Notes |
|---|---|---|
| `bolt11-create-invoice` | ACTIVE | Blink `lnInvoiceCreate` GraphQL mutation |
| `blink-webhook` | ACTIVE | ✅ CC-22 — HMAC-SHA256 verification live (v4) |

## Supabase secrets

| Key | Status |
|---|---|
| `BLINK_API_KEY` | ✅ (`refueler-beta`) |
| `BLINK_GRAPHQL_URL` | ✅ |
| `BLINK_WEBHOOK_SECRET` | ✅ (whsec_ format) |
| `bolt11_encryption_key` | ✅ REPLACED CC-22 — openssl rand -base64 32 |
| `SUPABASE_URL` | Auto-injected |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-injected |

---

## Supabase Auth configuration (verified CC-23)

| Setting | Value |
|---|---|
| Site URL | `https://refueler.io` |
| Redirect URLs | `http://localhost:*`, `https://refueler.io/merchant-tablet.html`, `https://refueler.io/command-centre.html` |
| Flow | Implicit (web). Switch to PKCE when React Native build starts. |
| Magic link sender | `noreply@refueler.io` |

---

## Cloudflare Pages — file serving (locked CC-23)

Cloudflare Pages serves from the **repo root**. All operator-facing HTML files must live at root level.

**Files now at repo root (confirmed CC-23):**
- `command-centre.html`
- `merchant-tablet.html`
- `merchant-tablet-styles.css`
- `merchant-tablet-logic.js`
- `dev-console.html`
- `franchise-dashboard.html`
- `index.html` (homepage)
- `analytics.js`

**Archived in `07_App_Specs/Command_Center/`** (reference/docs only — not served):
- `CC-06-README.md`
- `command-ce...on5_patch.md`
- `magic-link-e...l-template.html`
- `refueler_csuit...briefing.html`

`wrangler.toml` at root is invalid for Pages (missing `pages_build_output_dir`) — non-blocking warning, queued for fix.

---

## Auth flow (verified E2E CC-23) ✅

1. User visits `https://refueler.io/command-centre.html`
2. Enters email → `signInWithOtp()` fires with `emailRedirectTo: 'https://refueler.io/command-centre.html'`
3. Magic link email received → click → lands on `command-centre.html#access_token=...`
4. `onAuthStateChange` fires → `resolveSession()` looks up `merchant_users` by `user_id`
5. Role resolved → redirect to destination:
   - `admin` → `dev-console.html`
   - `merchant` / `franchise_branch` / `independent_owner` → `merchant-tablet.html`
   - `franchise_hq` → `franchise-dashboard.html`

**Bug fixed CC-23:** `emailRedirectTo` was `'https://refueler.io/command-centre'` (no `.html`) — corrected.
**Bug fixed CC-23:** `SUPABASE_ANON_KEY` was placeholder `'REPLACE_BEFORE_DEPLOY'` — replaced with live anon key.
**Bug fixed CC-23:** Files were in `07_App_Specs/Command_Center/` — moved to repo root.

---

## Supabase anon key (public — safe in client HTML)

`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpaGd2ZG9rZW9mbmp4amtlbm1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MTY2NDksImV4cCI6MjA5NDE5MjY0OX0.cRb94WeIP8yRfWd9s2XKmq2nqm1ov-sK1df6u8LNUbo`

This key is hardcoded in `command-centre.html`, `merchant-tablet.html`, `dev-console.html`, `franchise-dashboard.html`. If any of these files still contain `REPLACE_BEFORE_DEPLOY` they must be patched before deployment.

---

## Database schema — live state (verified CC-23)

### `merchant_users` (live)
| user_id | email | role | owner_pin_hash |
|---|---|---|---|
| `e8d39365-bed4-4f53-8746-7b170a4b0ef8` | `dev@refueler.io` | `admin` | SHA-256 of `8888` |

**Role fixed CC-23:** Was `independent_owner` → corrected to `admin` via migration.

### `merchant_orders` — column verification (CC-23)
`bolt11_payment_hash` column confirmed present (`text`, nullable). No migration required.

**Schema drift confirmed CC-23:** `payment_status` and `amount_gbp` listed in previous master context do NOT exist in live `merchant_orders` table. Queued for reconciliation before live payment processing.

### All other tables
See CC-22 master context — no changes in CC-23.

---

## Schema drift flags

| Flag | Detail | Priority |
|---|---|---|
| `orders.payment_processor` default | Still `'zebedee'` — should be `'blink'` | 🟡 Future migration |
| `merchant_orders.payment_status` | Listed in context, does not exist in live table | 🟡 Reconcile before live payments |
| `merchant_orders.amount_gbp` | Listed in context, does not exist in live table | 🟡 Reconcile before live payments |
| `M&S Café Lakeside` `franchise_group_id` | NULL — wire when M&S franchise_groups row created | ⚪ |

---

## Command Centre — File Registry (CC-23)

| File | Location | Status |
|---|---|---|
| `command-centre.html` | **repo root** ✅ | CC-23 — anon key fixed, emailRedirectTo fixed |
| `merchant-tablet.html` | **repo root** ✅ | CC-21 — Horizon Strip, landscape CSS |
| `merchant-tablet-styles.css` | **repo root** ✅ | CC-21 |
| `merchant-tablet-logic.js` | **repo root** ✅ | CC-21c — merchant_orders migration complete |
| `dev-console.html` | **repo root** ✅ | Auth gate buttons orange ⚠️ — fix queued. ZBD tile label stale ⚠️ — CC-24 |
| `franchise-dashboard.html` | **repo root** ✅ | Auth gate buttons orange ⚠️ — fix queued |

---

## Dev console — telemetry tile state (CC-23)

Current 2×3 grid:

| Tile | Status | Notes |
|---|---|---|
| ZBD WALLET | ⚠️ STALE | Rename to BLINK WALLET. Remove ZBD CONFIG button. Wire Blink balance. CC-24 scope. |
| BTC / GBP | 🟡 PARTIAL | Live price ✅. Remove `$` value. Reformat as `£1 = x,xxx sats` (Clark Moody style). Add `sat/vB` fee rate. CC-24 scope. |
| GEOFENCE HITS | ✅ | On-device only — correct |
| AUTH EVENTS | ✅ | Active sessions count |
| REFUELER EARNINGS | ✅ | PRE-REV — correct for beta |
| ERROR STACK | ✅ | CLEAN |

**CC-24 BTC tile spec (locked):**
- Primary: `£48,417` (large)
- Secondary: `Sats per £  2,066` (Clark Moody style — clean label, right-aligned value)
- Tertiary micro: `sat/vB  4` (mempool.space API: `https://mempool.space/api/v1/fees/recommended` → `fastestFee`)
- Remove: `$64,364` dollar value entirely

---

## Merchant PIN auth — state (CC-21b/c, unchanged)

- SHA-256, no salt, raw string — `crypto.subtle` browser native
- `dev@refueler.io` `owner_pin_hash`: SHA-256 of `8888`
- `staff_pin_hash` not yet set — staff PIN flow untested
- Full end-to-end browser test (magic link → PIN gate → queue) still outstanding for merchant role

---

## Supabase MCP patterns (locked)

- Project ID `tihgvdokeofnjxjkenmm` required on every call
- `apply_migration` for all DDL schema changes
- `execute_sql` for read-only verification only
- `spatial_ref_sys` — PostGIS system table, known false positive in Supabase security alerts, no action needed
- `auth.config` not accessible via SQL — use Dashboard → Authentication → URL Configuration

---

## Session history

| Session | Key outcome |
|---|---|
| CC-02 → CC-08 | Command Centre built; Supabase tables; magic link auth; BOLT11/ZBD integration |
| CC-09 | Orange abolition; browser test framework |
| CC-10 | ZBD → Blink; edge functions; Svix; Blink secrets |
| CC-11 | Blink permanent; `independent_owner` role; magic link template |
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
| CC-21b | `owner_pin_hash` set for `dev@refueler.io`; `merchant_users` SQL fixes; 62 files committed |
| CC-21c | PIN hash confirmed aligned; `merchant_orders` migration complete; commit `3df6771` |
| CC-22 | Security closure. `bolt11_encryption_key` replaced. `blink-webhook` v4 HMAC-SHA256 live. |
| CC-23 | E2E auth flow fixed and verified. Three root causes resolved: wrong `emailRedirectTo`, placeholder anon key, files not at repo root. `dev@refueler.io` role fixed to `admin`. Full magic link → `dev-console.html` flow confirmed working. `bolt11_payment_hash` column verified on `merchant_orders`. |

---

## Standing items — carry to CC-24

| Item | Priority | Notes |
|---|---|---|
| **Dev console BTC tile redesign** | 🔴 CC-24 | Remove `$`, format `Sats per £ x,xxx`, add `sat/vB` from mempool.space |
| **Dev console Blink wallet tile** | 🔴 CC-24 | Replace ZBD tile — rename, wire Blink balance via `api.blink.sv/graphql` |
| **Horizon Strip Darwin live feed** | 🔴 CC-24 | Confirm mock vs live; integrate `huxley2.unop.uk` for FST departures if mock |
| **`merchant_orders` schema drift** | 🟡 | `payment_status` + `amount_gbp` missing from live table — reconcile before live payments |
| **Browser E2E merchant PIN test** | 🟡 | Needs merchant-role account; `dev@refueler.io` is admin, routes to dev-console not tablet |
| **`blink-webhook` DB fetch on settlement** | 🟡 | CC-22 test returned `DB fetch error` — verify with real payment hash |
| **`dev-console.html` / `franchise-dashboard.html` auth buttons** | 🟡 | Replace orange fill with outlined `#C8A96E` gold |
| **ICO registration** | 🟡 | Must complete before beta (£40/year) |
| **`orders.payment_processor` default** | 🟡 | Change `'zebedee'` → `'blink'` via migration |
| **`wrangler.toml` fix** | 🟡 | Add `pages_build_output_dir` to silence Cloudflare warning |
| **JSDoc on `mintInterface.ts`** | 🟡 | Add on next touch |
| **Ben Cousins message** | 🟡 | Cleared to send from `hello@refueler.io` |
| **Costa Coffee partnership** | 🟡 | Head of Partnerships to initiate |
| **`merchant_users` HQ test row** | 🟡 | FK → auth.users blocks insert — revisit at auth revision |
| **M&S `franchise_group_id`** | ⚪ | Wire when M&S group row created |
| **Supabase PKCE** | ⚪ | React Native build start |
| **React Native shell** | ⚪ | July 2026 |
| **pg_cron deployment** | ⚪ | Migration written — deploy when pg_cron confirmed |
| **Minibits dev call** | ⚪ | NUT-18 send = critical path |
| **Cashu ecash test deployment** | ⚪ | Standalone mint (Nutshell or CDK) |
| **Numo terminal review** | ⚪ | Pixel 9a / GrapheneOS, split-screen SumUp |
