# Refueler Master Context — CC-12
*Updated: 2026-06-11*

---

## Project overview

Refueler is a Bitcoin-native mobile pre-order platform for commuters on the Fenchurch St line (Shoeburyness → Fenchurch Street corridor), targeting independent cafés and franchise venues near stations.

**Supabase project:** `tihgvdokeofnjxjkenmm`
**Webhook URL:** `https://tihgvdokeofnjxjkenmm.supabase.co/functions/v1/blink-webhook`
**Transactional email:** `noreply@refueler.io`

---

## Payment architecture (locked)

- **Provider:** Blink / BOLT11 only
- ZBD: permanently replaced — do not reopen
- BOLT12: assessed, abandoned for beta — do not reopen
- Refueler role: order coordination layer only — never holds funds
- Webhook security: **Svix signature verification** (whsec_ secret, HMAC-SHA256, signed payload = `{svix-id}.{svix-timestamp}.{raw-body}`)

---

## Supabase edge functions

| Function | Status | Notes |
|---|---|---|
| `bolt11-create-invoice` | ACTIVE | Blink `lnInvoiceCreate` GraphQL mutation |
| `blink-webhook` | ACTIVE | Svix verification — **updated CC-12** |

## Supabase secrets

| Key | Status |
|---|---|
| `BLINK_API_KEY` | ✅ |
| `BLINK_GRAPHQL_URL` | ✅ |
| `BLINK_WEBHOOK_SECRET` | ✅ (whsec_ format) |
| `BLINK_SANDBOX_GRAPHQL_URL` | Not added — non-critical |
| `SUPABASE_URL` | Auto-injected |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-injected |

---

## Database schema — key tables

### `merchant_users`
- `role` enum includes: `merchant`, `franchise_branch`, `franchise_hq`, `admin`, `independent_owner`
- Role-based routing: merchant/franchise_branch → merchant-tablet, franchise_hq → franchise-dashboard, admin → dev-console

### `merchant_orders`
- `bolt11_payment_hash` TEXT
- `bolt11_expires_at` TIMESTAMPTZ
- `payment_status` TEXT — values: `awaiting_payment`, `paid`, `expired`
- `paid_at` TIMESTAMPTZ

### `venues` (planned)
- `venue_type` TEXT
- `franchise_group_id` UUID
- Franchise brand colours (primary + secondary)

---

## Command Centre pages

| File | Role | Status |
|---|---|---|
| `command-centre.html` | Routing entry, role-based redirect | Stable |
| `merchant-tablet.html` | Merchant/independent_owner POS | CC-11 updated |
| `dev-console.html` | Admin telemetry + JSON import | Stable |
| `franchise-dashboard.html` | Franchise HQ analytics | Stable |

**Orange abolition:** `#F5820A` confirmed absent from all four pages as of CC-12 audit.
Auth gate buttons: outlined gold (`var(--accent)`, transparent background) on all pages.

---

## Auth

- Magic link via `noreply@refueler.io` (Resend/Tuta)
- Template: `magic-link-email-template.html` — paste into Supabase Dashboard → Auth → Email Templates → Magic Link
- Subject: `Your Refueler sign-in link`
- Flow: implicit (web). Switch to PKCE when React Native build starts.

---

## Brand & design

- **Default theme:** Carbon (dark)
- **User toggle:** Paper (light)
- **Accent:** `#C8A96E` (gold) — used for borders, CTAs, accents
- **Danger:** `#E05252`
- **Orange `#F5820A`:** abolished — does not exist in this codebase, no exceptions
- **Typography:** Source Serif 4 (editorial), Satoshi (headings), system UI (interface)
- **Register:** "James Bond, not fintech neon"

---

## Corridor copy rules

- Use **"Fenchurch St line"** only — never "C2C" (trademark, clearance PENDING)
- Eyebrow label: "Limehouse → Fenchurch Street" (update to full corridor at CMO homepage session)

---

## Regulatory position

- Refueler = order coordination and BI layer only
- FCA pre-application: July 2026 (not critical path)
- ICO exemption form: deferred to pre-launch (submit when first merchant confirmed, £40 fee)
- Self-operating a UK Cashu mint: ruled out (£1.6M+ safeguarding, MLR overhead)

---

## Deferred items (carry forward from CC-12)

| Item | Priority |
|---|---|
| `pg_cron` invoice expiry sweep | Migration written — deploy when pg_cron enabled |
| `pgcrypto` column-level encryption for `bolt11_invoice` | Assess post-AES-GCM edge function audit |
| `merchant_orders` reconciliation sweep | Post-beta |
| `BLINK_SANDBOX_GRAPHQL_URL` secret | Add if sandbox testing needed |

---

## Upcoming separate sessions

- **Cashu ecash test deployment** — standalone mint (Nutshell or CDK), no app dependency
- **Numo terminal review** — Pixel 9a / GrapheneOS, split-screen with SumUp, assess as independent_owner POS companion

---

## Session history

| Session | Key outcome |
|---|---|
| CC-02 → CC-08 | Command Centre pages built; Supabase tables; magic link auth; BOLT11/ZBD integration |
| CC-09 | Orange abolition pass; browser test framework |
| CC-10 | (see prior context) |
| CC-11 | Blink replaces ZBD permanently; Svix webhook (initial); `independent_owner` role; OPS/QUEUE switcher |
| CC-12 | blink-webhook updated to correct Svix verification; pg_cron migration written; orange audit clean across all pages; context files updated |
