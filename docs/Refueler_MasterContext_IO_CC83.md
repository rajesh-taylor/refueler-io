# Refueler Master Context — IO CC-83
*Updated: 2026-08-11 (Merchant-Sats-B — Opus uncounted. Reward flow locked. ADR-MS-11 through ADR-MS-18. Block 8 pre-req schema locked. Multi-programme stamps locked. Walk-in commission trigger locked. Stripe integration shape locked.)*
*Supersedes: Merchant-Sats-A*
*Sync log: MasterContext_IO_CC83 — no schema changes this session. Planning session only.*

---

## Session allocation
500 primary + 50 buffer = 550 total. Planning/Opus sessions uncounted.
**Block review sessions** — standing uncounted Opus at end of each block. Recalibrate priorities and session allocation.
Sessions used to CC-83 (Merchant-Sats-B): ~83 counted + uncounted planning sessions.

---

## Project overview

Refueler is a Bitcoin-native privacy ecosystem. Products: Share (anonymous encrypted file transfer, live at `refueler.io/share/`), Legend (privacy-first block explorer, post-B9), consumer pre-order app (Fenchurch St line), merchant terminal (cafés and restaurants near stations), Pass (Lightning-native ticketing and venue access — own repo and Claude project), Numo (in-venue Lightning + fiat terminal, fork of Numo hardware).

**Mission:** A Bitcoin-native privacy layer operating within UK jurisdictional law. Not a fintech product. Not a loyalty app. A Bitcoin world that works quietly, legally, and without surveillance.

**North star (internal only):** Come for privacy, stay for Bitcoin.

**Supabase project:** `tihgvdokeofnjxjkenmm`
**Webhook URL:** `https://tihgvdokeofnjxjkenmm.supabase.co/functions/v1/blink-webhook`

**GitHub repos:**
| Repo | Status | Local path |
|---|---|---|
| `rajesh-taylor/refueler-io` | Public — web/Command Centre/Supabase | `/Users/rajeshtaylor/Documents/refueler.io/` |
| `rajesh-taylor/refueler-app` | Public — React Native consumer app | `/Users/rajeshtaylor/Documents/refueler.io/refueler-app/` |
| `rajesh-taylor/numo-fork` | Public — Android POS terminal | `/Users/rajeshtaylor/Documents/refueler.io/terminals/numo-fork/` |
| `rajesh-taylor/refueler-share` | Public — BLAKE3 + Cashu file transfer | `/Users/rajeshtaylor/Documents/refueler-share/` |
| `rajesh-taylor/refueler-legend` | Public — Legend chain explorer + ARM Bitcoin indexer | `/Users/rajeshtaylor/Documents/refueler-legend/` |
| `rajesh-taylor/refueler-mint` | Public — CDK Rust loyalty stamp mint | `/Users/rajeshtaylor/Documents/refueler-mint/` |
| `rajesh-taylor/refueler-pass` | Public — Pass ticketing + venue access | Own repo + Claude project — Pass-A/B sessions |
| `refueler-ecash-lab` | **Local only — never push** | `/Users/rajeshtaylor/Documents/refueler-ecash-lab/` |

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

**Editorial articles:** all four migrated — `the-city-worker`, `nothing-to-collect-nothing-to-hide`, `looks-done-isnt-done`, `the-float` ✅ CC-79/CC-80.

---

## Global CSS — canonical token values (CSS-1a locked)

**Paper:** `--bg: #E8E2D8` · `--fg: #1A1A1A` · `--fg-muted: #5A5550` · `--fg-subtle: #9A9590` · `--border: rgba(26,26,26,0.12)` · `--surface: #DAD4CA` · `--surface-raised: #D0C9BE` · input: `#CCC7BE`
**Carbon:** `--bg: #1A1A1A` · `--fg: #F5F0E8` · `--fg-muted: #B0AAA2` · `--fg-subtle: #6A6560` · `--border: rgba(245,240,232,0.10)` · `--surface: #26282C` · `--surface-raised: #2E3035` · input: `#252525`
**Accent:** `--accent: #C8A96E` · `--accent-hover: #E0C48A`
**Warn/Danger:** `--warn: #B87333` (Paper) / `#C8943A` (Carbon) · `--danger: #E05252`
**`--text-*` aliases** → `--fg*` (C-4 transition). `--inset-rule: var(--border)` neutral in both themes.
**Abolished — never use:** `#1E1F22` · `#F7F4EF` · `#F5F0E8` (old Paper) · `#F5820A` · `#D4690A` · `--accent-action`

---

## Locked decisions

- **Legend layout (CSS-1a):** Wordmark + input + tagline only. No credential dot, Silent Payments card, or below-fold block.
- **Legend theme default (CSS-1a):** `getCookie('rs-theme') || 'carbon'` on Legend template only.
- **Card body text (CSS-1a):** DM Sans 400, `line-height: 1.7`, `color: var(--fg)`.
- **`--inset-rule` gold scope (CSS-1a):** Gold only on `h2` dividers and blockquotes inside article body. Never on chrome.
- **"Bitcoin, privately."** Reserved for Legend index exclusively.
- **"Built for jurisdictions that have laws. And lawyers."** Reserved for Share page.
- **Anthropic API key (CC-72):** Disabled. New key needed before csuite briefing reuse.
- **Share signoff copy (M-3):** Three lines locked — no pitch, no ecosystem copy.
- **CSS track:** Complete CSS-2 through CSS-7b. All page CSS clean. `global.css` canonical.

---

## Nav architecture — locked CSS-7b

**Main site:** Share · Legend · Notes · Editorial · Support · Privacy · pill
**Share nav:** Plans · Notes · Support · Privacy · pill. Status footer-only.
**Legend nav:** Carbon default. Theme pill. No link list.
**Support:** `support@refueler.io`. GDPR only: `privacy@refueler.io`.

---

## Merchant payment architecture — locked Merchant-Sats-A · 2026-08-11

### ADR-MS-1 — Refueler is never in the payment flow
Refueler is an orchestrator and attribution layer, never a custodian or intermediary between consumer payment and merchant receipt. Consumer sats settle directly to the merchant's own wallet. Consumer fiat is processed by a licensed third party (Stripe for card; merchant's own acquirer for Numo walk-in terminal). Refueler's own revenue is collected separately as a B2B platform fee charged to the merchant. The Blink float (`fd2357fe…`) holds only Refueler's own received revenue — never consumer funds in transit.

Model A (consumer funds routed through Refueler wallet then forwarded to merchant) is permanently excluded. Any future feature that routes consumer payment through a Refueler-controlled wallet requires a new FCA/PSR review before implementation.

*Note: the beta uses one Blink wallet because it has no real merchant. Sim money has no regulator. At real-merchant go-live, `create-order` must issue against the merchant's own credentials.*

### ADR-MS-2 — Commission liability trigger
Commission liability is created **only by Refueler-originated, app-attributed orders.** Walk-in transactions on Numo that are not attributed to a Refueler app session generate no commission. This framing positions the fee as a marketing platform fee (Refueler demonstrably drove the foot-flow), not merchant acquiring.

Commission is collected in **fiat, in real time, off the sats flow.** On Lightning settlement confirmation, a GBP charge fires to the merchant's stored card at the sats→GBP rate recorded in `orders.sats_rate`. Instrument: Stripe saved `PaymentMethod` + off-session `PaymentIntent`. No Stripe Connect — Refueler is billing its own customer, not splitting a payment it processed.

### ADR-MS-3 — Loyalty stamps: closed loop, no FCA grey area
Digital stamps for fiat-paying app users are a closed-loop promotional instrument. Buy 9, get the 10th free. Cannot be converted to sats or fiat. Cashu ecash tokens are strictly non-monetary and closed-loop in the UK. No e-money classification risk. No regulatory treatment required.

### ADR-MS-4 — Numo's role
Numo is the standard merchant hardware recommendation, installed at onboarding. NFC + Lightning + fiat. It extends the Refueler merchant surface to walk-in customers without requiring the Refueler app on the consumer side.

**Scenario A (Refueler app present):** customer has the app → Numo detects or customer presents → order flow continues → commission attributable → reward offered.

**Scenario B (no Refueler app):** Numo defaults to the merchant's own flow. Lightning payment goes directly to the merchant's Lightning address or Silent Payments setup, configured in the owner-only terminal view. No Refueler commission. No Refueler custody. Refueler is invisible to this transaction entirely.

Scenario B is anticipated to become the dominant walk-in pattern as Bitcoin adoption grows. The architecture is designed to be comfortable with this — Refueler's value in Scenario B is the merchant infrastructure and dataset, not transaction revenue.

### ADR-MS-5 — The seven payment flows (locked)

**Flow 1 — App pre-order, Lightning**
Consumer app → `create-order` issues BOLT11 against merchant's credentials → consumer pays → Lightning settles to merchant's wallet → Refueler captures attribution → real-time fiat commission charge to merchant's stored card.

**Flow 2 — App pre-order, fiat (Block 8)**
Consumer pays by card via Stripe → Stripe processes directly (Stripe holds the licence, Refueler calls the API) → settlement to merchant via Stripe → real-time commission charge. Stamp reward issued from closed-loop pool if customer selects it. Block 8 scopes the reward mechanic in detail (Merchant-Sats-B).

**Flow 3 — App walk-in, fiat**
Customer uses the Refueler app as an ordering reference handed to staff. Payment is fiat on the merchant's own terminal. App attribution is present → commission applies → real-time charge fires on staff order confirmation, not on payment settlement (no payment event visible to Refueler on fiat walk-in). Commission trigger event confirmed ADR-MS-14.

**Flow 4 — App walk-in, Lightning**
Customer uses the Refueler app to present a Lightning payment. Merchant's own Lightning address or Silent Payments setup receives directly. App attribution present → same commission logic as Flow 3. Commission trigger event confirmed ADR-MS-14.

**Flow 5 — Numo walk-in, no app (fiat)**
Consumer pays fiat on Numo → merchant's own acquirer → no Refueler attribution → no commission → no reward offered. Refueler invisible.

**Flow 6 — Numo walk-in, no app (Lightning)**
Consumer pays Lightning → merchant's own wallet directly → no attribution → no commission → no reward. Refueler invisible.

**Flow 7 — Legend merchant add-on**
£250/mo per entity, invoiced as part of terminal fee. No payment flow. Pure SaaS. Price held — free tier available as goodwill but never discounted from list. Enterprise and family office price-point credibility requires holding the number.

### ADR-MS-6 — Node purpose (three-way lock)
These three are permanently distinct and must never be described together:

**1. Legend indexer node (post-B9):** Full node + BLAKE3-accelerated esplora fork. Indexes the chain for Legend queries. Handles no one's payment. Refueler's own infrastructure.

**2. Merchant settlement node (long-term, optional):** A merchant's *own* self-custodial node receiving *their own* sales. Refueler may assist setup. Not between parties. Merchant's money throughout.

**3. Refueler treasury:** Blink float (Refueler's own received revenue: platform fees, Share/Legend subscriptions) → Silent Payment sweep → cold storage. Operating-capital treasury management. Not a "Bitcoin treasury" strategy. Not consumer funds. Not merchant funds.

The forbidden fourth — a Refueler node between consumer payment and merchant receipt — is Model A. Permanently excluded.

The Stage 3 sim node and the Legend node are the same physical box. One box, two purposes (both purpose 1 until a merchant opts into self-custodial settlement on their own infrastructure).

### ADR-MS-7 — Pass: initial scope (locked)
Pass is a Lightning-native competitor to Ticketmaster/Eventbrite. It has its own repo (`rajesh-taylor/refueler-pass`) and its own Claude project. Pass-A and Pass-B sessions scope the full product. This record locks the principle and initial feature set only.

**The ticket credential:** QR code living in the Refueler app *or* in Apple/Google Wallet for non-app users. Proves ticket purchase. Standard venue scanning at the door. Inherits ADR-MS-1 — ticket sats settle to venue, Refueler bills platform fee.

**Conditional entitlement:** Ticket conditions change post-scan. Example: free first drink costed into the ticket price, entitlement unlocks once the customer has passed front-door security. The QR/NFC credential carries the state; the venue terminal reads it.

**Fountain/LNURL streaming (opt-in):** After entry, an LNURL address appears in-app. Customer can stream sats to the performing artist's Fountain profile Lightning address during the gig, or accumulate them in their own Lightning wallet. Opt-in. Artist must have a Fountain profile or any LNURL-compatible wallet.

**Apple/Google Wallet path for non-app users:** PKPass / Google Wallet pass. No Refueler app required for entry. LNURL streaming opt-in requires the Refueler app — graceful skip if absent.

**Privacy layer:** to be specified in Pass-A/Pass-B. Minimum identifying information on the credential. Streaming payments pseudonymous.

### ADR-MS-8 — BOLT12 position
On the roadmap, not in scope for beta or Block 9. Three conditions before adoption: (a) receive-side wallet support is mainstream; (b) `create-order`'s invoice layer is abstracted for clean swap-in; (c) merchant has a persistent always-on node (LNbits/phoenixd/Greenlight) — a tablet cannot serve this role. Numo's BOLT12 viability is as a client to the merchant node, not as the node itself.

### ADR-MS-9 — Flywheel (locked)

```
Desktop:  Share ──────────────────────────────────► Legend
          Pass  ──────────────────────────────────► Legend
                                                       │
Mobile:   App + Pass ───────────────────────────────► Legend
          (same app, separate tabs)                    │
                                                       │
In-venue: Numo ──► Merchant dashboard ──────────────► Legend
                                                       │
                                         "Come for privacy,
                                          stay for Bitcoin"
```

### ADR-MS-10 — Legal caveat (permanently logged)
*Not legal advice. Points requiring UK payments solicitor sign-off before real-merchant go-live:*

1. Whether generating a Lightning invoice on a merchant's behalf constitutes payment initiation under PSR 2017 Schedule 1 Part 2. Assessment: Lightning wallets are not PSR-regulated payment accounts; risk is assessed as low.
2. Whether commission-on-attributed-transaction pricing could be construed as merchant acquiring rather than a platform fee. Assessment: ADR-MS-2 attribution framing is the defence.
3. The fiat walk-in leg on Numo — confirm routing via the merchant's own acquirer is sufficient to exclude Refueler from PSR scope.
4. Cashu ecash stamp tokens — confirm non-monetary, closed-loop classification holds under UK e-money regulations. (Self-researched by Rajesh — confirm with solicitor.)

*Lawyer briefing note: approach as confirmation of a designed architecture, not an open risk assessment. Present the ADRs above and ask for written confirmation that the described flows are outside PSR / EMR / FCA payment services scope.*

---

## Reward and commission architecture — locked Merchant-Sats-B · 2026-08-11

### ADR-MS-11 — Sats reward: LNURL-withdraw pull model (locked)
Sats reward is a **PULL, not a push.** On Lightning settlement, Refueler creates a one-time LNURL-withdraw token via Blink API. The customer claims it from their own wallet at any time until expiry. Refueler never learns or stores a destination Lightning address — ADR-4b honoured.

The float is debited **only on a successful claim.** Failed claim leaves the token in `claimable` state; customer retries later. Float hitting zero at claim time returns an error from the LNURL-withdraw endpoint; the token stays open; the low-water alert fires. No half-paid or inconsistent state ever exists.

`reward_payouts` stores the token string and lifecycle state only. No address. No customer identifier.

Claim status tracking: Blink webhook on successful LNURL-withdraw (if available) or periodic poll job. Status is eventually consistent — acceptable for a reward, not a settlement.

### ADR-MS-12 — Stamp track: scaffolded Block 8, live pending mint (locked)
**Sats reward track (Flow 1 + Flow 2):** fully live in Block 8. LNURL-withdraw flow, float mechanic, `reward_payouts` table, reward choice UI in app.

**Stamp track:** DB schema (`stamp_programmes`, `stamp_events`) and merchant tablet UI scaffolded in Block 8. Issuance and redemption remain **dark until `refueler-mint` is live.** Toggle present in owner view but disabled until mint is deployed.

**No interim identity-linked DB stamp counter.** A buy-9 counter that knows who you are is a surveillance feature and contradicts the IP honesty standard (Adversarial-1). Better to ship sats now and light up stamps when the mint lands.

### ADR-MS-13 — Multi-programme stamps (locked)
Venues may run **up to 3 active stamp programmes** simultaneously. This enables establishments with distinct trading periods (e.g. café by day, wine bar by evening) to offer separate promotions from one terminal.

**Programme selection — pre-order:** Customer selects active programme in the Refueler app at order placement. App fetches active programmes for the venue and displays them. First-class UX: the reward feels deliberate.

**Programme selection — walk-in fallback cascade:**
1. **Time-window auto-assign** (Phase 1 walk-in): `stamp_programmes.start_time`/`end_time` config; system assigns silently at order-accept time.
2. **Staff selects on tablet** (fallback if no window match or ambiguous): queue card shows programme selector before Accept tap.
3. **Category tag on order item** (long-term): menu item carries programme membership. Dependent on menu structure not yet built.

**Max 3 active constraint:** enforced at application layer + DB trigger. `stamp_programmes.active` boolean; trigger prevents a fourth concurrent `active = true` row per venue.

**Merchant toggle:** `venue_partners.stamp_feature_enabled boolean DEFAULT false`. Owner view toggle controls visibility of stamp UI across tablet and app. Feature off = no programme selector shown, no stamps issued.

**Stamp feature in onboarding pitch and handover document:** included in Onboarding-A scope (Rajesh configures programmes during onboarding; self-service owner UI to follow).

**Competitive context (research item):** verify whether Square, Toast, or KDS terminal companies offer multi-programme concurrent loyalty stamps. If not, lead with this as a differentiator.

### ADR-MS-14 — Walk-in commission trigger (locked)
**Primary trigger (Flows 3 & 4):** Staff taps Accept/Complete on the tablet → `merchant_orders.status = 'accepted'` → trigger or edge function inserts `commission_charges` row (status: `pending`).

**Nightly reconciliation:** pg_cron job at 02:00 UTC flags attributed orders (`orders.session_id` is not null) where no corresponding `commission_charges` row exists within 24 hours of order creation. Surfaces as "unconfirmed attributed orders" tile in dev console.

**Gaming risk:** managed via merchant agreement terms, not DB plumbing. Reconciliation provides visibility; the contract provides recourse.

### ADR-MS-15 — Commission rate variability (locked)
Range: **4–8% of order value in GBP.** Varies by merchant and franchise. Annual agreement renewals may alter the rate.

`merchant_billing.commission_rate` (numeric, stored as decimal e.g. `0.06`) with `rate_effective_from timestamptz`. `create-order` reads the current rate and stamps it onto `orders.commission_pct` at order creation — historical orders retain their original rate permanently. No retroactive rate changes.

### ADR-MS-16 — Merchant billing separation (locked)
Dedicated `merchant_billing` table, keyed by `venue_id`. Not on `venue_partners` — keeps payment state out of the hot, frequently-read venue row and gives billing its own RLS surface.

Refueler stores only: `stripe_customer_id`, `has_default_pm`, `billing_status`, `delinquent_since`, `commission_rate`, `rate_effective_from`. Card data never touches Supabase — Stripe holds the Customer object and PaymentMethod.

### ADR-MS-17 — Commission charge retry and delinquency (locked)
`charge-commission` Edge Function triggered by per-minute pg_cron. Picks up `commission_charges` rows with `status = 'pending'`.

Retry: up to 3 attempts, exponential backoff. After 3 failures:
- `commission_charges.status = 'delinquent'`
- `merchant_billing.delinquent_since` stamped
- Dev console alert tile
- Email to `dev@refueler.io`

Delinquent merchants: `billing_status = 'delinquent'` on `merchant_billing`. App and tablet continue to function (Refueler bears the credit risk in sim; real-merchant policy to be set in merchant agreement).

### ADR-MS-18 — Float mechanics (locked)
**What the float is for:** Refueler's own sats revenue — Share Lightning payments, Legend subscriptions. Never consumer funds in transit (ADR-MS-1).

**Pre-load:** Manual — Rajesh sends sats to the Blink wallet. Amount: TBD-Rajesh based on attributed order volume once sim data exists. Target pre-load recorded in `float_config.pre_load_target_sats` as a planning reference, not an automated trigger.

**Low-water alert:** pg_cron every 5 minutes checks `float_ledger` running balance against `float_config.low_water_sats`. Alert fires: dev console tile updates + email to `float_config.alert_email` (default `dev@refueler.io`).

**Top-up:** Manual. Rajesh top-ups appear as `credit` entries in `float_ledger`. No automated top-up in Block 8.

**Float ledger:** `float_ledger` records every debit (reward claimed) and credit (Rajesh top-up) with running balance. Admin-only RLS. Float debit rows reference `reward_payouts.id`.

---

## Block 8 pre-requisite schema (locked Merchant-Sats-B)

All migrations via `apply_migration` only. RLS on every table. No exceptions.

### New tables

**`merchant_billing`**
`id uuid PK · venue_id uuid FK venue_partners(id) UNIQUE · stripe_customer_id text · has_default_pm boolean DEFAULT false · billing_status text CHECK(active|delinquent|suspended) DEFAULT active · delinquent_since timestamptz · commission_rate numeric(5,4) DEFAULT 0.06 · rate_effective_from timestamptz DEFAULT now() · created_at timestamptz · updated_at timestamptz`

RLS: `independent_owner`/`merchant`/`franchise_branch` SELECT own venue row. Service-role INSERT/UPDATE. Admin SELECT all.

**`commission_charges`**
`id uuid PK · order_id uuid FK orders(id) · venue_id uuid FK venue_partners(id) · amount_gbp numeric(10,2) · sats_rate_snapshot numeric(20,8) · stripe_payment_intent_id text · status text CHECK(pending|processing|succeeded|failed|delinquent) DEFAULT pending · attempt_count integer DEFAULT 0 · last_error text · created_at timestamptz · updated_at timestamptz`

RLS: `independent_owner`/`franchise_branch` SELECT own venue. Service-role INSERT/UPDATE. Admin SELECT all.

**`reward_payouts`**
`id uuid PK · order_id uuid FK orders(id) · lnurl_withdraw_token text NOT NULL UNIQUE · amount_sats integer NOT NULL · status text CHECK(claimable|claimed|expired|declined) DEFAULT claimable · claimed_at timestamptz · expires_at timestamptz NOT NULL · created_at timestamptz`

RLS: Service-role only (token is bearer credential — no customer identity to scope on). Admin SELECT all. Public claim endpoint via Edge Function validates token string directly.

**`float_config`** (single row)
`id integer PK DEFAULT 1 · low_water_sats integer DEFAULT 50000 · pre_load_target_sats integer DEFAULT 500000 · alert_email text DEFAULT dev@refueler.io · updated_at timestamptz · CONSTRAINT single_row CHECK(id = 1)`

RLS: Admin only.

**`float_ledger`**
`id uuid PK · entry_type text CHECK(credit|debit) · amount_sats integer NOT NULL · reference text · balance_after integer NOT NULL · created_at timestamptz`

RLS: Admin only.

**`stamp_programmes`**
`id uuid PK · venue_id uuid FK venue_partners(id) ON DELETE CASCADE · name text NOT NULL · target_count integer DEFAULT 9 · reward_description text NOT NULL · active boolean DEFAULT false · start_time time · end_time time · display_order integer DEFAULT 0 · created_at timestamptz · updated_at timestamptz`

RLS: `independent_owner` SELECT/UPDATE own venue (self-service in owner view). Service-role INSERT. Admin all.
Max 3 active constraint: enforced via DB trigger + application layer.

**`stamp_events`** (anonymous — no customer link)
`id uuid PK · venue_id uuid FK venue_partners(id) · programme_id uuid FK stamp_programmes(id) · event_type text CHECK(issued|redeemed) · created_at timestamptz`

RLS: Service-role INSERT. `independent_owner` SELECT own venue (aggregate counts only). Admin all.

### Modified tables

**`orders`**: add `commission_status text` (mirror of corresponding `commission_charges.status` for hot-path reads without a join).

**`venue_partners`**: add `stamp_feature_enabled boolean DEFAULT false` (merchant toggles stamp programme visibility across tablet and app). Note: `logo_url text` column already queued for CC-83.

### New Edge Functions (Block 8)

| Function | Purpose | verify_jwt |
|---|---|---|
| `charge-commission` | Reads pending `commission_charges`, fires Stripe off-session PaymentIntent | explicit |
| `issue-reward` | On settlement: creates Blink LNURL-withdraw token, inserts `reward_payouts`, debits `float_ledger` | explicit |
| `stripe-webhook` | Receives Stripe payment confirmation, updates `commission_charges.status` | `false` (external) |
| `claim-reward` | Validates LNURL-withdraw token state, proxies claim confirmation, stamps `claimed_at` | explicit |

### New pg_cron jobs (Block 8)

| Job | Schedule | Purpose |
|---|---|---|
| `charge-commission-job` | Every 1 min | Picks up `commission_charges` rows with `status = pending`, invokes `charge-commission` |
| `float-monitor` | Every 5 min | Checks `float_ledger` running balance vs `float_config.low_water_sats`; fires alert if below |
| `commission-reconciliation` | Nightly 02:00 UTC | Surfaces attributed orders (`session_id IS NOT NULL`) with no `commission_charges` row within 24h |

### Stripe integration shape

`create-order` reads `merchant_billing.commission_rate` at order time → stamps `orders.commission_pct`.

On Lightning settlement: `blink-webhook` → marks payment settled → calls `issue-reward` (mints LNURL-withdraw token) → inserts `commission_charges` (status: `pending`) → sets `orders.commission_status = pending`.

`charge-commission-job` (pg_cron, 1 min): picks up pending rows → `charge-commission` Edge Function → reads `merchant_billing.stripe_customer_id` → creates Stripe off-session `PaymentIntent` → updates `commission_charges`.

Stripe fires payment event → `stripe-webhook` → updates `commission_charges.status` to `succeeded` or `failed` → mirrors to `orders.commission_status`.

On failure (3 attempts): `delinquent` flag on `commission_charges` + `merchant_billing` + dev console alert.

Fiat walk-in (Flows 3 & 4): staff Accept action on tablet → `commission_charges` row inserted (status: `pending`) → same `charge-commission-job` picks it up → same charge flow.

**`stripe_customer_id` setup:** merchant billing Stripe Customer created at onboarding (Onboarding-A / CC-84). Card added via Stripe hosted page or Elements (never transmitted through Refueler backend). `merchant_billing` row inserted after Stripe Customer confirmed.

---

## Simulation discipline — locked Block-5 Review

**No real merchant clients until all four sim stages pass.** Raj's Steakhouse (`steakhouse@rajeshtaylor.com`, `independent_owner`, venue_id `c476df85`) is the primary simulation entity. Build, test, and break things there first.

### Sim Stage 1 — Merchant tablet fully wired (independent owner)
Raj's Steakhouse tablet receives live consumer app orders end-to-end. Full order state machine. Darwin feed live. PINs working. Order correction flow (wrong drink/size ordered in error) and refund handling with correct DB and financial-screen repercussions defined and tested.
**Evaluate:** Can a fake staff member run a complete shift on the tablet without Rajesh touching the database?

### Sim Stage 2 — Franchise screen wired alongside
A second sim entity under `franchise_hq` (Moniker) with franchise dashboard showing real KPI data flowing from sim orders. Milestone: migrate Raj's Steakhouse from `independent_owner` to a franchise entity — simulating a venue expanding via the Refueler funnel.
**Evaluate:** Does the franchise view reconcile with what the tablet shows? Does the independent→franchise migration path work cleanly?

### Sim Stage 3 — Node in the loop *(deferred — B9-gated)*
Replace Blink custodial with self-custodial Lightning node for consumer payment settlement. Same node as Legend. Commission from merchants arrives in fiat (GBP) — separate. Stage 3 is about consumer sats settlement becoming self-custodial.
**Gate:** B9 must be live before Stage 3 sim can complete.

### Sim Stage 4 — Training document in hand
Printed handover document physically produced (designed in Onboarding-A, printed by Rajesh). Sim includes the complete experience a real merchant would receive.
**Evaluate:** Can a venue manager onboard, set PINs, activate stamp programmes, and run the tablet using only the printed document and magic-link email — without verbal guidance?

**Sim-Close (Opus, uncounted):** Up to two dedicated sessions formally signing off all four stages before any real merchant is onboarded. Go-live decision made here.

---

## Merchant terminal — locked decisions

**Auth:** Magic link → `/command-centre/` → role resolved via `merchant_users.user_id` (email lookup deprecated CC-82) → redirect to role destination.

**ROLE_DESTINATIONS (locked CC-82):**
- `merchant` / `franchise_branch` / `independent_owner` → `/merchant/`
- `franchise_hq` → `/franchise/`
- `admin` → `/dev/`
- `investor` → `/investor/`

**PIN gate (CC-82):** `tablet-ui` div hidden (`display:none`) until staff PIN accepted. Revealed by `onStaffAuthenticated()`, hidden by `signOut()` and `ownerSignOut()`. Known flash (~1 frame) — S-1, fix queued.

**Merchant nav (queued CC-83):** STEAKHOUSE badge displays `venue_partners.name`. Queue/Ops mode switch → explicit two-state pill. Venue name or logo centred in nav. `venue_partners.logo_url` column to be added.

**Merchant tablet UX (queued CC-83):** Horizon strip stat values ~20% size increase. Sidebar `min-height: 100%`. "Accepting orders" toggle defaults to off — training implication in printed handover.

**Stamp programme toggle (owner view):** `venue_partners.stamp_feature_enabled` toggle in owner view. When off: no stamp UI shown anywhere. Programmes configured in owner view. Self-service programme creation deferred to post-Block-8 owner view iteration.

**Order correction and refunds (Sim Stage 1):** Flow for correcting orders in error and refund handling — DB repercussions and financial screen consequences — to be defined and built in Sim Stage 1 work.

**AI helper (queued — future session):** Owner tab only. Swipe-up panel or dedicated Help section. Quick queries → Cloudflare AI Worker. Serious issues → `support@refueler.io` + helpline number. Virtual keyboard: swipe-up triangle icon, bottom-centre of owner tab screen. Not Block 8.

---

## Stack

| Layer | Technology |
|---|---|
| Mobile app | React Native / Expo, Expo Router |
| Backend | Supabase (Postgres, Edge Functions, Realtime, RLS) |
| Payments | Blink BOLT11 (`api.blink.sv/graphql`) — beta/sim only |
| Commission collection | Stripe off-session PaymentIntent (stored card) — Block 8 |
| Reward payout | Blink LNURL-withdraw — Block 8 |
| Webhook | `blink-webhook` v12 direct Blink callback · `stripe-webhook` Block 8 |
| Web/CDN | Cloudflare Pages + Workers |
| Auth | PKCE via `refueler-auth-proxy` Cloudflare Worker |
| Merchant terminal | Numo fork (Android, `io.refueler.merchant`) |
| Mapbox | Franchise dashboard venue map only (not merchant tablet) |

---

## Database schema — key tables

### `orders`
`id, session_id, user_id, partner, bay_label, order_value_gbp, commission_pct, commission_gbp, commission_sats, sats_rate, reward_type, reward_sats, handover_method, payment_processor, payment_ref, zebedee_charge_id, settled_at, created_at, venue_id, item_name, status, updated_at, payment_status, bolt11_invoice, invoice_expires_at, pseudonym_id, routing_fee_sats, settled_sats, commission_status`
*(commission_status added Block 8 pre-req)*

### `merchant_users`
`id, user_id, email, role, venue_id, franchise_group_id, staff_pin_hash, owner_pin_hash, created_at`
Role CHECK: `merchant | franchise_branch | franchise_hq | admin | independent_owner | investor`

### `venue_partners`
`id, merchant_id, name, category, site, coords_lat, coords_lng, location, address_line1, city, country, pickup_note, exclusivity_radius_m, active, pause_reason, session_added, created_at, contact_email, venue_type, franchise_group_id, brand_primary, brand_secondary, max_concurrent_orders, logo_url, stamp_feature_enabled`
*(logo_url added CC-83; stamp_feature_enabled added Block 8 pre-req)*

### `merchant_orders`
`id, order_id, venue_id, status, item_summary, sats_amount, created_at, updated_at, bolt11_payment_hash, paid_at, payment_status, amount_gbp, bolt11_invoice, bolt11_expires_at`

### `franchise_groups`
`id, name, hq_venue_id, created_at`

### `merchant_billing` *(Block 8 pre-req)*
`id, venue_id, stripe_customer_id, has_default_pm, billing_status, delinquent_since, commission_rate, rate_effective_from, created_at, updated_at`

### `commission_charges` *(Block 8 pre-req)*
`id, order_id, venue_id, amount_gbp, sats_rate_snapshot, stripe_payment_intent_id, status, attempt_count, last_error, created_at, updated_at`

### `reward_payouts` *(Block 8 pre-req)*
`id, order_id, lnurl_withdraw_token, amount_sats, status, claimed_at, expires_at, created_at`

### `float_config` *(Block 8 pre-req, single row)*
`id, low_water_sats, pre_load_target_sats, alert_email, updated_at`

### `float_ledger` *(Block 8 pre-req)*
`id, entry_type, amount_sats, reference, balance_after, created_at`

### `stamp_programmes` *(Block 8 pre-req — scaffolded, dark until mint live)*
`id, venue_id, name, target_count, reward_description, active, start_time, end_time, display_order, created_at, updated_at`

### `stamp_events` *(Block 8 pre-req — scaffolded, dark until mint live)*
`id, venue_id, programme_id, event_type, created_at`

---

## Test accounts

| Email | Role | Venue | Notes |
|---|---|---|---|
| `steakhouse@rajeshtaylor.com` | `independent_owner` | Raj's Steakhouse, 10 Trinity Square EC3N 4AJ | Staff PIN: 1234 · Owner PIN: 8888 · venue_id: c476df85 · **Primary sim entity** |
| `moniker@rajeshtaylor.com` | `franchise_hq` | Costa Coffee group | Franchise HQ sim — used for franchise dashboard testing |
| `dev@refueler.io` | `admin` | Costa Coffee Fenchurch St | Admin / dev console |

*Note: `independent_owner@rajeshtaylor.com` row deleted — orphan with no venue_id. New independent owner sim accounts created only when a venue exists to attach them to.*

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
| ~~Block-5 Review~~ | Recalibrate Block 5 scope, sim discipline, priorities | Opus uncounted | ✅ Closed |
| ~~Merchant-Sats-A~~ | Payment architecture, flows, flywheel, node purpose | Opus uncounted | ✅ Closed |
| ~~Merchant-Sats-B~~ | Reward flow, stamp lifecycle, commission schema, Stripe shape, Block 8 pre-req | Opus uncounted | ✅ This session |
| **CC-83** | Block 5 — venue RLS fix, nav redesign, horizon strip, sidebar, logo_url, commission_status, stamp_feature_enabled | Sonnet counted | **Next** |
| **Merchant-Sats-C** | Reward choice UI spec for consumer app — sats vs stamp picker, edge cases, app state machine | Opus uncounted | Queued — after CC-83 |
| **Onboarding-A** | Merchant onboarding flow design + printed handover document (includes stamp programme setup) | Opus uncounted | Queued |
| **CC-84** | Block 5 — onboarding flow build, PIN self-service UX and RLS design | Sonnet counted | Queued |
| **CC-85** | Block 5 — branded magic link email, first full sim run | Sonnet counted | Queued |
| **S-1 fix** | PIN flash — inline gate CSS in `<head>` | Sonnet counted | Queued (bundle into CC-83 if room) |
| **Block-5 Close** | Block 5 review and recalibration | Opus uncounted | Queued |
| **Sim-Close** | Formal sign-off all 4 sim stages | Opus uncounted (up to 2) | Queued |
| **Block 8** | Fiat → sats rewards — pre-req schema migrations + reward flow build | Sonnet counted | **Promoted** — next after Block 5 |
| **Session A (CDK mint)** | CDK mint architecture — multi-franchise keyset partitioning, Orchard GUI, ecash-lab setup | Opus uncounted | After Block 8 |
| **Session B (stamp lifecycle)** | Stamp lifecycle + FCA compliance check | Opus uncounted | After Session A |
| **Pass-A** | Full Pass scope — inherits ADR-MS-7 as baseline | Opus uncounted | After Block 8 |
| **Pass-B** | Venue hire, Fountain detail, sats-on-first-drink | Opus uncounted | After Pass-A |
| **Block 9** | LNBits integration | Sonnet counted | Deferred post Block 8 |
| **AD-2** | Share admin dashboard — panel wiring + card drill-downs | Sonnet counted | Queued |
| **Block 6** | Darwin Push Port upgrade | Sonnet counted | Deferred — non-gating |
| **Block 7** | Passenger count join | Sonnet counted | Deferred — non-gating |

---

## Snag list — active

| ID | Item | Priority | Target |
|---|---|---|---|
| S-1 | PIN flash — ~1 frame of tablet-ui visible before gate renders | Medium | Bundle into CC-83 or standalone |
| S-2 | "Loading venue…" in Active Site sidebar — `venue_partners` RLS blocking `independent_owner` read | High | CC-83 |
| S-3 | STEAKHOUSE nav badge pulls merchant_id slug — should display `venue_partners.name` | High | CC-83 |
| S-4 | Queue/Ops mode switch not obvious — replace STEAKHOUSE toggle with explicit two-state pill | High | CC-83 |
| S-5 | Venue name (or logo) should be centred/prominent in merchant nav | Medium | CC-83 |
| S-6 | Horizon strip stat values — ~20% size increase for kitchen readability | Medium | CC-83 |
| S-7 | Sidebar height — doesn't fill full column | Low | CC-83 |
| S-8 | Owner/Staff PIN reset + Menu management — stubs in Owner View | High | Onboarding-A / CC-84 |
| S-9 | Magic link email bare Supabase template — needs branded HTML | High | CC-85 |
| S-10 | Export-1: PDF/print icon on Revenue + Orders panels | Low | Future |
| S-11 | Dash-1: Orders over time + peak hours heatmap on franchise dashboard | Low | Post volume |
| S-12 | `car_park_occupancy` strip from FEEDS array | Low | Next rail-signal-poll touch |
| S-14 | `Costa Coffee HQ` category label fix | Low | Future |

*S-13 deleted — `independent_owner@rajeshtaylor.com` orphan row removed in CC-83 migration.*

---

## Ongoing / bundled items

- **Action required (Rajesh):** Disconnect `share.refueler.io` from Cloudflare Pages, delete/disable project
- Upgrade Cloudflare Workers to Paid ($5/month) before production volume
- New Anthropic API key → before csuite briefing reuse
- `blink-webhook_index.ts` → hygiene pass
- `bsc-dev` Dev Test item → remove before TestFlight
- GitHub Actions red X on `9b9655d`
- LNBits webhook payload shape → confirm with Ben Arc before Block 9
- Notes article seeds → `notes-articles-list.md` in refueler-share at next Share session
- Est. 2026 accent column → replace with Companies House reg on incorporation
- Paper input field recess → review after one month in production
- Share streaming encryption → B-series roadmap (post-MVP)
- Safari >1.5 GB file limit → document in Share FAQ, fix in streaming session
- `venue_partners.logo_url` column → add in CC-83 migration
- **Lawyer briefing:** draft written brief before appointment — can be a short Opus session
- **Competitive check:** Square / Toast / KDS on multi-programme concurrent loyalty stamps — if absent, lead with it in pitch
- **ecash-lab:** queue Session A for CDK Rust mint + Orchard GUI setup; reference use case = café-by-day/wine-bar-at-night multi-programme venue; multi-franchise keyset partitioning to scope; potential standalone "Refueler Mint as a Service" offering
- **Float pre-load amount:** TBD-Rajesh — set after first sim attributed-order volume data available
- **AI helper on owner tab:** queued future session — Cloudflare AI Worker, swipe-up keyboard panel

---

*"Nothing stops this train."*
