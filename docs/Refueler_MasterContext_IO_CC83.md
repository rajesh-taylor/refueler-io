# Refueler Master Context — IO CC-83
*Updated: 2026-08-11 (Block-5 Review — Opus uncounted. Sim discipline formalised. AD-1 complete. AD-2 added. S-13 deleted. Session allocation confirmed 550. Block 8 promoted above Blocks 6/7. Sim Stage gate defined.)*
*Supersedes: CC-82*
*Sync log: MasterContext_IO_CC83 — no schema changes this session. Planning session only.*

---

## Session allocation
500 primary + 50 buffer = 550 total. Planning/Opus sessions uncounted.
**Block review sessions** — standing uncounted Opus at end of each block. Recalibrate priorities and session allocation.
Sessions used to CC-83 (Block-5 Review): ~83 counted + uncounted planning sessions.

---

## Project overview

Refueler is a Bitcoin-native privacy ecosystem. Products: Share (anonymous encrypted file transfer, live at `refueler.io/share/`), Legend (privacy-first block explorer, post-B9), consumer pre-order app (Fenchurch St line), merchant terminal (cafés and restaurants near stations), Pass (Lightning-native ticketing and venue access, early-stage research).

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

## Simulation discipline — locked Block-5 Review

**No real merchant clients until all four sim stages pass.** Raj's Steakhouse (`steakhouse@rajeshtaylor.com`, `independent_owner`, venue_id `c476df85`) is the primary simulation entity. Build, test, and break things there first.

### Sim Stage 1 — Merchant tablet fully wired (independent owner)
Raj's Steakhouse tablet receives live consumer app orders end-to-end. Full order state machine. Darwin feed live. PINs working. Order correction flow (wrong drink/size ordered in error) and refund handling with correct DB and financial-screen repercussions defined and tested.
**Evaluate:** Can a fake staff member run a complete shift on the tablet without Rajesh touching the database?

### Sim Stage 2 — Franchise screen wired alongside
A second sim entity under `franchise_hq` (Moniker, already exists as franchise_hq test) with franchise dashboard showing real KPI data flowing from sim orders. Milestone: migrate Raj's Steakhouse from `independent_owner` to a franchise entity — simulating a venue expanding thanks to the Refueler customer acquisition funnel.
**Evaluate:** Does the franchise view reconcile with what the tablet shows? Does the independent→franchise migration path work cleanly?

### Sim Stage 3 — Node in the loop *(deferred — B9-gated)*
Replace Blink custodial wallet with self-custodial Lightning node for consumer payment settlement. This is the same node Legend depends on (full Bitcoin node + indexer). Commission from merchants arrives in fiat (6–10% GBP) — that is separate. This stage is about consumer sats settlement becoming self-custodial. Merchants who wish to receive revenue in sats would follow a separate product decision downstream of Block 8.
**Gate:** B9 must be live before Stage 3 sim can complete.

### Sim Stage 4 — Training document in hand
Printed handover document physically produced (designed in Onboarding-A, printed by Rajesh). Sim includes the complete experience a real merchant would receive, paper included.
**Evaluate:** Can a venue manager onboard, set PINs, and run the tablet using only the printed document and the magic-link email — without any verbal guidance from Rajesh?

**Sim-Close (Opus, uncounted):** Dedicated review session(s) — up to two — that formally sign off all four stages before any real merchant is onboarded. The go-live decision is made here, not assumed.

---

## Merchant terminal — locked decisions

**Auth:** Magic link → `/command-centre/` → role resolved via `merchant_users.user_id` (email lookup deprecated CC-82) → redirect to role destination.

**ROLE_DESTINATIONS (locked CC-82):**
- `merchant` / `franchise_branch` / `independent_owner` → `/merchant/`
- `franchise_hq` → `/franchise/`
- `admin` → `/dev/`
- `investor` → `/investor/`

**PIN gate (CC-82):** `tablet-ui` div hidden (`display:none`) until staff PIN accepted. Revealed by `onStaffAuthenticated()`, hidden by `signOut()` and `ownerSignOut()`. Known flash (~1 frame) — S-1, fix queued (dedicated session, inline gate CSS in `<head>`).

**Merchant nav (queued CC-83):** STEAKHOUSE badge is currently merchant_id slug — should display `venue_partners.name`. Queue/Ops mode switch to become explicit two-state pill (replacing STEAKHOUSE toggle). Venue name or logo centred in nav. `venue_partners.logo_url` column to be added.

**Merchant tablet UX (queued CC-83):** Horizon strip stat values need ~20% size increase for kitchen readability. Sidebar needs `min-height: 100%` to fill full column. "Accepting orders" toggle defaults to off — training implication documented in printed handover.

**Order correction and refunds (Sim Stage 1 scope):** Flow for correcting orders placed in error (wrong drink/size) and refund handling — DB repercussions and financial screen consequences — to be defined and built in Sim Stage 1 work.

---

## Stack

| Layer | Technology |
|---|---|
| Mobile app | React Native / Expo, Expo Router |
| Backend | Supabase (Postgres, Edge Functions, Realtime, RLS) |
| Payments | Blink BOLT11 (`api.blink.sv/graphql`) |
| Webhook | `blink-webhook` v12, direct Blink callback |
| Web/CDN | Cloudflare Pages + Workers |
| Auth | PKCE via `refueler-auth-proxy` Cloudflare Worker |
| Merchant terminal | Numo fork (Android, `io.refueler.merchant`) |
| Mapbox | Franchise dashboard venue map only (not merchant tablet) |

---

## Database schema — key tables

### `orders`
`id, session_id, user_id, partner, bay_label, order_value_gbp, commission_pct, commission_gbp, commission_sats, sats_rate, reward_type, reward_sats, handover_method, payment_processor, payment_ref, zebedee_charge_id, settled_at, created_at, venue_id, item_name, status, updated_at, payment_status, bolt11_invoice, invoice_expires_at, pseudonym_id, routing_fee_sats, settled_sats`

### `merchant_users`
`id, user_id, email, role, venue_id, franchise_group_id, staff_pin_hash, owner_pin_hash, created_at`
Role CHECK: `merchant | franchise_branch | franchise_hq | admin | independent_owner | investor`

### `venue_partners`
`id, merchant_id, name, category, site, coords_lat, coords_lng, location, address_line1, city, country, pickup_note, exclusivity_radius_m, active, pause_reason, session_added, created_at, contact_email, venue_type, franchise_group_id, brand_primary, brand_secondary, max_concurrent_orders`
*(logo_url text column to be added CC-83)*

### `merchant_orders`
`id, order_id, venue_id, status, item_summary, sats_amount, created_at, updated_at, bolt11_payment_hash, paid_at, payment_status, amount_gbp, bolt11_invoice, bolt11_expires_at`

### `franchise_groups`
`id, name, hq_venue_id, created_at`

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

**Blink:** Active API key `refueler-cc68` (id: `b98cf536-ac9e-484b-bab2-14f1a181a12e`) · BTC wallet: `fd2357fe-24ec-4173-8441-fc0f05722e9a`

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
| ~~Block-5 Review~~ | Recalibrate Block 5 scope, sim discipline, priorities | Opus uncounted | ✅ This session |
| **CC-83** | Block 5 — venue RLS fix, nav redesign, horizon strip, sidebar, logo_url, delete S-13 orphan row | Sonnet counted | **Next** |
| **Onboarding-A** | Merchant onboarding flow design + printed handover document | Opus uncounted | Queued after CC-83 |
| **CC-84** | Block 5 — onboarding flow build, PIN self-service UX and RLS design | Sonnet counted | Queued |
| **CC-85** | Block 5 — branded magic link email, first full sim run, any fallout | Sonnet counted | Queued |
| **S-1 fix** | PIN flash — inline gate CSS in `<head>` | Sonnet counted | Queued (small — bundle into CC-83 if room, else standalone) |
| **Block-5 Close** | Block 5 review and recalibration | Opus uncounted | Queued |
| **Sim-Close** | Formal sign-off of all 4 sim stages before real merchant go-live | Opus uncounted (up to 2) | Queued — after Stage 4 complete |
| **Block 8** | Fiat → sats rewards | Sonnet counted | **Promoted** — next after Block 5 |
| **Pass-A** | Pass/Events concept for franchise dashboard — greyed stub, activation model | Opus uncounted | After Block 8 |
| **Pass-B** | Venue hire, Fountain livestream, sats-on-first-drink | Opus uncounted | After Pass-A |
| **Block 9** | LNBits integration | Sonnet counted | Deferred post Block 8 |
| **Onboarding-B** | Printed handover doc (if timeboxed out of Onboarding-A) | Opus uncounted | Placeholder — may not be needed |
| **AD-2** | Share admin dashboard — left-hand panel wiring + card drill-downs | Sonnet counted | Queued |
| **Block 6** | Darwin Push Port upgrade | Sonnet counted | Deferred — non-gating |
| **Block 7** | Passenger count join | Sonnet counted | Deferred — non-gating |

---

## Snag list — active

| ID | Item | Priority | Target |
|---|---|---|---|
| S-1 | PIN flash — ~1 frame of tablet-ui visible before gate renders. Fix: inline gate CSS in `<head>`, gates at `z-index:9999/position:fixed/inset:0` from first paint | Medium | Dedicated session or bundle into CC-83 |
| S-2 | "Loading venue…" in Active Site sidebar — `venue_partners` RLS likely blocking `independent_owner` read | High | CC-83 |
| S-3 | STEAKHOUSE nav badge pulls merchant_id slug not venue name — should display `venue_partners.name` | High | CC-83 |
| S-4 | Queue/Ops mode switch not obvious — STEAKHOUSE label doubles as toggle with no affordance. Replace with explicit two-state pill | High | CC-83 |
| S-5 | Venue name (or logo) should be centred/prominent in merchant nav — vanity play for merchants, differentiator | Medium | CC-83 |
| S-6 | Horizon strip stat values — ~20% size increase needed for kitchen readability at distance | Medium | CC-83 |
| S-7 | Sidebar height — doesn't fill full column. `min-height: 100%` fix | Low | CC-83 |
| S-8 | Owner/Staff PIN reset + Menu management — stubs in Owner View ("Beta — coming soon") | High | Onboarding-A / CC-84 |
| S-9 | Magic link email bare Supabase template — needs branded HTML before real merchant onboard | High | CC-85 |
| S-10 | Export-1: PDF/print icon on Revenue + Orders panels in franchise dashboard | Low | Future |
| S-11 | Dash-1: Orders over time + peak hours heatmap on franchise dashboard Overview | Low | Post volume |
| S-12 | `car_park_occupancy` strip from FEEDS array | Low | Next rail-signal-poll touch |
| S-14 | `Costa Coffee HQ` category label — `franchise_hq` should display as proper name | Low | Future |

*S-13 deleted — `independent_owner@rajeshtaylor.com` orphan row to be removed in CC-83 migration.*

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

---

*"Nothing stops this train."*
