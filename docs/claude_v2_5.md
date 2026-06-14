# claude.md — Refueler Project DNA
> **Version:** 2.5 | **Last updated:** CC-17 · 12 June 2026 | **Status:** Pre-TestFlight / Infrastructure Live
> This file is the single source of truth for Claude session context. Read it in full before any session begins.
> **Operational detail** (DNS, file registry, session history, SMTP config, full schema) lives in `Refueler_MasterContext_CC17.md` — load that file alongside this one every session.

---

## 1. Vision & Mission

Refueler is a Bitcoin-native mobile ordering app for London commuters on the Fenchurch Street line (Shoeburyness → Fenchurch Street). It times pre-orders to the train's arrival so food and drink are ready the moment the commuter walks in — no queue. Payment is settled via the Lightning Network (BOLT11 beta). A loyalty stamp bridge onboards non-Bitcoin users. The broader mission: a parallel payment rail introducing a Bitcoin-native, high-value demographic to merchants who have never had commercial access to them.

**Domain:** refueler.io (LIVE) · **GitHub:** `rajesh-taylor/refueler-io` (main) · **Legal:** Refueler (trading name; no registered company)

---

## 2. Brand Tokens — LOCKED

Do not deviate. No new palette colours without a formal session decision.

### Colour
| Token | Hex | Usage |
|---|---|---|
| Carbon | `#1A1A1A` | Default — app/mobile, all screens |
| Paper | `#F5F0E8` | Light mode; homepage + editorial default |
| Orange | **ABOLISHED** | `#F5820A` does not exist in this codebase. Do not use. Do not propose. |
| Warn (Paper) | `#B87333` | Status indicators, warm CTAs |
| Warn (Carbon) | `#C8943A` | Status indicators, warm CTAs |
| Gold | `#C8A96E` | Carbon inset-rule / blockquote / divider / internal tool auth buttons |
| Danger | `#E05252` | Destructive actions only |

**Rules:**
- Carbon default everywhere except public-facing website/editorial (Paper default).
- ETA widget: venue secondary brand colour as accent — e.g. Costa: cream (`#F5F0D0`) on red (`#C8312A`); M&S: gold on green.
- England skin `#CF3030`: national team fixtures ONLY + `en-GB` locale. Both gates required.
- Internal tool auth gate buttons: outlined, `#C8A96E` border + text, transparent background. Locked CC-06. Confirmed clean on all four Command Centre pages CC-12.
- Pre-auth theme toggle: does not appear on `command-centre.html`. Locked CC-09a.

### Typography
| Role | Value |
|---|---|
| Heading | Satoshi (Google Fonts), 600 |
| Body | DM Sans, 300 default / 400/600 for hierarchy |
| Serif (editorial body, table cells, inset card body) | Source Serif 4, weight 300 |
| Telemetry / financial values | IBM Plex Mono |

### Brand Ethos
> **James Bond, not fintech neon.** Suave. Discreet. Refined. If it feels garish, loud, or startup-frantic, it is wrong.

---

## 3. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Mobile app | React Native | iOS-first; Android parity to follow |
| Backend / DB | Supabase (`tihgvdokeofnjxjkenmm`) | Schema active; PKCE required for React Native build |
| Auth | Supabase magic link (email only) | No Apple Sign-in, no password. Switch to PKCE for mobile. |
| Email | Tuta Business Essential + Resend SMTP | `noreply@` for transactional; `hello@`, `privacy@`, `support@` on Tuta. |
| Analytics | Cloudflare Analytics Engine | Worker `refueler-analytics`, endpoint `analytics.refueler.io/event` |
| Hosting | Cloudflare Pages ← GitHub main | Static pages only. |
| Bitcoin payments | Lightning BOLT11 via **Blink** (`api.blink.sv/graphql`) | ZBD permanently replaced CC-11. BOLT12 abandoned. |
| Ecash (future) | Cashu / Minibits (NUT-18 not yet live) | Behind `mintInterface.ts` abstraction |
| Invoice encryption | pgcrypto (`pgp_sym_encrypt`) + Supabase Vault | Key: `bolt11_encryption_key` in Vault. Never in source. |
| Cron jobs | pg_cron (enabled CC-09b) | Expiry sweep + orphan reconciliation — migration written, deploy when pg_cron confirmed enabled |
| Confidential compute | Enclavia — NOT on critical path | Revisit when trigger conditions met (see §4e) |
| Webhook security | Svix (whsec_ HMAC-SHA256) | `blink-webhook` edge function — verified CC-12 |

---

## 4. Architecture Decisions — LOCKED

### 4a. Payment Layer
- **Beta:** BOLT11 Lightning invoices via **Blink** (`api.blink.sv/graphql`). ZBD permanently replaced.
- **BOLT12: ABANDONED** — locked CC-07. Do not reopen.
- **`mintInterface.ts`:** Abstraction layer. JSDoc applied CC-08. File: `src/lib/mintInterface_session18.ts`. Draft JSDoc locked (see master context).
- **Invoice encryption:** `bolt11_invoice` stored as pgp_sym_encrypt ciphertext. Decrypted only by `blink-webhook` at settlement. Cleared to NULL after settlement or expiry.

### 4b. Lightning Address — Transient Memory Model
Lightning addresses held in transient server memory only. Never persisted to any database, log, or backup.

**Five column categories permanently prohibited from orders table:**
location data · Lightning address · Cashu proof/token · device identifiers · geofence trigger timing

### 4c. On-Device Geofence — Passive Ambient Awareness
Processed entirely on-device. No location data ever transmitted. GDPR-locked.

### 4d. Merchant Terminal Two-Track
- Track 1 (Numo-fork APK): independents + events.
- Track 2 (Command Centre API): franchise head offices.

### 4e. Enclavia / Confidential Compute — NOT ON CRITICAL PATH
Decision locked Session 14. Code-for-privacy on Supabase satisfies GDPR at zero marginal cost for months 0–12.

Trigger conditions: (a) Product 2 requiring confidential compute; (b) commercial counterparty requiring cryptographic data isolation proof; (c) post-revenue behavioural data monetisation confirmed.

### 4f. Merchant Data Isolation — LOCKED CC-06
Merchants read exclusively from `merchant_orders`. They never query `orders` directly.

### 4g. Venue Resolution — LOCKED CC-06
`resolveMerchantVenue()` resolves from `merchant_users` first, then joins `venue_partners`. Direct `venue_partners.contact_email` lookup deprecated.

### 4h. Franchise Architecture — LOCKED CC-13
- `franchise_groups` table: `id`, `name`, `hq_venue_id` (FK → `venue_partners.id`, now non-null for Costa Coffee group)
- `venue_partners.venue_type`: `'independent'` (default) | `'franchise_branch'` | `'franchise_hq'`
- `venue_partners.franchise_group_id`: FK → `franchise_groups.id`
- **`merchant_id` (TEXT NOT NULL):** Unique slug per venue. No default — must be supplied on insert. Convention: `'{brand}-hq'` for HQ rows (e.g. `'costa-hq'`), `'{brand}-{location}'` for branches.
- **`category` (TEXT NOT NULL):** Venue category. No default — must be supplied. Use `'franchise_hq'` for HQ rows, `'café'` / `'coffee'` / etc. for operating venues.

---

## 5. GDPR Position — LOCKED

**Locked public privacy copy:**
> *"Refueler knows your train is moving. Your phone works it out locally. We never see where you are."*

| Element | Position |
|---|---|
| Geofence | On-device only; never transmitted; opt-in; zero data retained |
| Lightning address | Personal data under UK GDPR — Art. 6(1)(b) only; transient server memory |
| bolt11_invoice | Encrypted at rest; cleared on settlement/expiry; never logged |
| Legal basis | Art. 6(1)(b) contract performance |
| ICO registration | Deferred to pre-launch; submit when first merchant confirmed (£40/year) |

---

## 6. Copy & Trademark Rules — LOCKED

- **"Fenchurch St line" only** — NEVER "C2C" (trademark PENDING)
- Hero headline: `"Your order is ready. So is your train."`
- Hero subhead: `"We get your order started at the right time so it's ready when you arrive."`
- Merchant value prop: `"New foot flow: Bitcoin stackers — a high-spending, loyalty-averse demographic concentrated in the City of London."`
- Eyebrow label: "Limehouse → Fenchurch Street" until CMO homepage session — do not update before that session.
- **"Nothing stops this train."** — Investor doc closer ONLY. One line. End of document.

---

## 7. C-Suite & Design Leadership Roster

*(Full briefing prompts in master context)*

| Role | File | Focus |
|---|---|---|
| CMO | `cmo.html` | Growth, editorial, youth onboarding, arc/ETA design review |
| CTO | `cto.html` | Stack, migrations, Supabase, terminal adapters |
| CPO | `cpo.html` | Product flow, UX, rewards model |
| CRO | `cro.html` | Revenue, commission structure, partnerships |
| CFO | `cfo.html` | Financial model, unit economics |
| CLO | `clo.html` | GDPR, FCA, ICO, trademark |
| Head of Design | `hod.html` | Visual identity, ETA screen, arc decision, physical touchpoints |
| Head of Brand | `hob.html` | Tone of voice, copy register, brand consistency across surfaces |

C-suite briefing artifact runs on **Haiku, no web search** to minimise token cost.

---

## 8. Product — Core Concepts

### How It Works
1. User boards the Fenchurch Street line.
2. On-device geofence detects boarding.
3. App fires prompt: *"Your flat white will be ready in 4 mins, confirm?"*
4. User confirms; BOLT11 invoice generated via Blink; Lightning payment settled; `merchant_orders` row → `pending`.
5. User walks in. Order ready. No queue.

### Order State Machine (CC-09b)
`awaiting_payment` → `pending` (on payment) → `preparing` → `ready` → `collected`
Parallel expiry path: `unpaid` → `expired` (pg_cron sweep, every minute)
Orphan healing: orders without `merchant_orders` row healed or flagged (every 5 minutes)

---

## 9. Rewards Model — LOCKED

Dual-track: Sats (default) + Loyalty stamps (non-Bitcoiners, higher commission). Stamp track dropped if FCA/ICO confirms stamp = PII.

A/B test plan: Track A = stamps + sats; Track B = sats-only.

---

## 10. Regulatory & Compliance — LOCKED

- **ICO registration:** Deferred — submit when first merchant confirmed (£40/year, ICO online form).
- **FCA pre-application:** July 2026 — not on critical path. Ben Cousins (Antidote) first contact on loyalty stamp PII question.
- **C2C trademark:** PENDING. Never in public copy.
- **Self-operating a UK Cashu mint:** Ruled out (£1.6M+ safeguarding, MLR overhead).

---

## 11. Investor Stats — LOCKED & SOURCED

| Metric | Figure |
|---|---|
| Annual journeys (Fenchurch St line) | 37.3M (ORR 2025) |
| Daily passengers | ~29,760 |
| UK station ranking | 45th |
| Commission benchmark | 8–12% |
| Unit economics | £4.50 AOV × 10% = £0.45/tx |
| Year 1 single-station single-partner revenue | ~£167k (conservative) |

Stat cards marked † = unvalidated. Do not use in investor materials until field-measured.
Investor closer: *"Nothing stops this train."* — Lyn Alden thesis reference, one line, end of document, understated.

---

## 12. Command Centre — File Registry (updated CC-12)

| File | Role | Status |
|---|---|---|
| `command-centre.html` | Auth routing index | Stable · pre-auth toggle removed · Darwin hidden pre-auth |
| `merchant-tablet.html` | Queue view / independent_owner OPS+QUEUE switcher | CC-11 updated |
| `dev-console.html` | Admin tooling | Stable · gold auth button |
| `franchise-dashboard.html` | Franchise HQ | Stable · gold auth button |

All four pages: `#F5820A` confirmed absent (CC-12 audit). Auth gate buttons: outlined gold `#C8A96E`, transparent background.

---

## 13. Standing Items — Current

| Item | Priority |
|---|---|
| **Vault key replacement** | 🔴 Replace `bolt11_encryption_key` placeholder via Dashboard before any invoice processing |
| **`orders.payment_processor` default** | 🟡 Still `'zebedee'` — update default to `'blink'` in a future migration |
| **Ben Cousins message** | 🟡 Cleared to send from `hello@refueler.io` |
| **Costa Coffee partnership** | 🟡 Head of Partnerships to initiate |
| **pg_cron deployment** | 🟡 Migration written — confirm pg_cron enabled, then deploy |
| **pgcrypto column-level encryption audit** | 🟡 Assess `bolt11_invoice` encryption post-AES-GCM edge function review |
| **`merchant_users` test HQ row** | 🟡 Deferred — FK → `auth.users` blocks test insert without real auth entry. Revisit at auth flow revision. |
| **Supabase PKCE** | ⚪ When React Native build starts |
| **Minibits dev call** | ⚪ NUT-18 send = critical path |
| **NUT-28** | ⚪ Pending Minibits P2BK confirmation |
| **React Native shell** | ⚪ July 2026 |
| **M&S franchise_group_id** | ⚪ M&S Café Lakeside currently `franchise_group_id = NULL` — wire when M&S group row created |
| **Analytics verification** | ⚪ DevTools → POST to `analytics.refueler.io/event` returns 204 |
| **Cashu ecash test deployment** | ⚪ Standalone mint (Nutshell or CDK), no app dependency |
| **Numo terminal review** | ⚪ Pixel 9a / GrapheneOS, split-screen with SumUp |
| **ICO registration** | ⚪ Submit when first merchant confirmed (£40/year) |

---

## 14. Session Order — Locked CC-18 Planning

### Orange Purge File Groups (grep verified CC-18 planning)

**Group C — Internal docs (do first, lowest risk)**
- `./07_App_Specs/Command_Center/CC-06_README.md`
- `./C-Suite/ROLE_HEAD_OF_DESIGN.md`
- `./docs/BRAND_SESSION_v1_1_ADDENDUM.md`
- `./docs/BRANDING.md`
- `./docs/CC12_browser_test_checklist.md`
- `./docs/claude_v2_4.md`
- `./docs/claude_v2_5.md`
- `./docs/EDITORIAL-MASTER.md`
- `./docs/Refueler_MasterContext_CC12.md`
- `./docs/Refueler_MasterContext_CC17.md`
- `./docs/WEBSITE_DESIGN_SPEC.md`
- `./editorial/EDITORIAL-MASTER.md`
- `./NEXT SESSIONS TO DO/Refueler_Session12_Handoff_Prompt.md`
- `./Session prompts/Refueler_Session_10C_Brief.md`
- `./refueler_csuite_briefing_v2_4.html` ← internal reference, not user-facing
- `./refueler_typography_comparison.html` ← internal reference, not user-facing

**Group B — Onboarding screens (user-facing, not yet live)**
- `./refueler_M01_welcome_to_rewards.html`
- `./refueler_M02_what_are_sats.html`
- `./refueler_M03_your_two_paths.html`
- `./refueler_M04_sats_nudge.html`
- `./refueler_M05_wallet_setup.html`
- `./refueler_M06_youre_in.html`
- `./refueler_minibits_onboarding.html`

**Group A — User-facing app screens (highest design sensitivity, do last)**
- `./refueler_eta_widget.html`
- `./refueler_locate_v2.html`
- `./refueler_cashu_gdpr_briefing.html`
- `./refueler_defensibility_document.html`

### Planned Session Order

| Session | Work |
|---|---|
| **CC-18** | Orange purge Group C + Group B |
| **CC-19** | Orange purge Group A (design-sensitive — ETA widget, locate screen) |
| **CC-20** | `orders.payment_processor` default migration (zebedee → blink) + Vault key replacement |
| **CC-21** | Horizon Strip build on `merchant-tablet.html` — **two prerequisites must be resolved before this session opens:** (1) Head of Design confirms strip position (Option A / persistent header is Rajesh's preferred position); (2) landscape mode scoping confirmed — tablet may be used horizontally, tile grid and Horizon Strip must support both portrait and landscape orientations |
| **CC-22** | Merchant PIN build |

### CC-21 Design Decisions Required (do not open build without these)

| Decision | Status | Owner |
|---|---|---|
| Horizon Strip position | Option A (persistent header) preferred — Head of Design to confirm | Head of Design |
| Landscape mode support | Not yet scoped — tablet may be horizontal on counter; tile grid (2-col portrait → 3-4-col landscape) and Horizon Strip full-width behaviour must be designed | Head of Design + CTO |
| Darwin Card placement | Beta, ambient header — confirmed this session, no third voice needed | Locked |
| Beck motif (gold node markers) | Approved — within brand register | Locked |

---

## 15. What This File Is Not

- Not a PRD. Context for Claude sessions only.
- Not a pitch deck.
- Not a legal document.
- Must be updated at the end of every session. A stale `claude.md` is worse than none.

---

*"Nothing stops this train."*
