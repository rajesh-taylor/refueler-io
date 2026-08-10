# Refueler Master Context — IO CC-82
*Updated: 2026-08-10 (CC-82 closed — Block 5 merchant onboarding flow. Test venue, auth wiring, PIN gate flash fix, full E2E confirmed.)*
*Supersedes: CC-81*
*Sync log: MasterContext_IO_CC82 — schema: block5_test_venue (venue_partners: Raj's Steakhouse, merchant_id rajs-steakhouse, c476df85-5572-49bd-a476-a908519a9a23), block5_steakhouse_merchant_user (merchant_users: steakhouse@rajeshtaylor.com, independent_owner, user_id 4153cee2-15af-4b14-bdb7-4f4465458017), block5_steakhouse_pins (staff SHA-256 of 1234, owner SHA-256 of 8888). command-centre/index.html: ROLE_DESTINATIONS updated to Eleventy paths (/merchant/, /franchise/, /dev/, /investor/), user_id lookup replacing deprecated email lookup. merchant-tablet-logic.js: emailRedirectTo → /merchant/, signOut redirects → /command-centre/. merchant/index.html: tablet-ui wrapper hidden until PIN accepted, lightning emoji removed from wordmark instances.*

---

## Session allocation
500 primary + 50 buffer = 550 total. Planning sessions uncounted.
**Block review sessions** added as standing uncounted Opus sessions at end of each block — recalibrate priorities and session allocation.

---

## Project overview

Refueler is a Bitcoin-native privacy ecosystem. Products: Share (anonymous encrypted file transfer, live), Legend (privacy-first block explorer, post-B9), consumer pre-order app (Fenchurch St line), merchant terminal (cafés and restaurants near stations).

**Mission:** A Bitcoin-native privacy layer operating within UK jurisdictional law. Not a fintech product. Not a loyalty app. A Bitcoin world that works quietly, legally, and without surveillance.

**North star (internal only):** They come for privacy, they stay and then fall in love with Bitcoin.

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

**Share canonical URLs:** Upload `https://refueler.io/share/` · Plans `https://refueler.io/share/plans/` · Status `https://refueler.io/share/status/`

---

## Share — architecture (locked)

- Share pages use `share-nav.njk` and `share-footer.njk` in `src/_includes/`
- BLAKE3 WASM: `src/share/assets/blake3/` → `_site/share/assets/blake3/`; `share.js` imports via `./blake3/browser-async.js`
- `src/_headers` passes through via `eleventyConfig.addPassthroughCopy`
- Post-download colophon (locked M-3): "Encrypted in your browser. / Deleted when it expires. / refueler.io" — Source Serif 4 300, `--text-tertiary`

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

## Merchant terminal — locked decisions

**Auth:** Magic link → `/command-centre/` → role resolved via `merchant_users.user_id` (email lookup deprecated) → redirect to role destination.

**ROLE_DESTINATIONS (locked CC-82):**
- `merchant` / `franchise_branch` / `independent_owner` → `/merchant/`
- `franchise_hq` → `/franchise/`
- `admin` → `/dev/`
- `investor` → `/investor/`

**PIN gate (CC-82):** `tablet-ui` div hidden (`display:none`) until staff PIN accepted. Revealed by `onStaffAuthenticated()`, hidden by `signOut()` and `ownerSignOut()`. Known flash (~1 frame) — deferred fix (inline gate CSS in `<head>`).

**Merchant nav (queued CC-83):** STEAKHOUSE badge is currently merchant_id slug — should display `venue_partners.name`. Queue/Ops mode switch to become explicit two-state pill (replacing STEAKHOUSE toggle). Venue name or logo centred in nav. `venue_partners.logo_url` column to be added.

**Merchant tablet UX (queued CC-83):** Horizon strip stat values need ~20% size increase for kitchen readability. Sidebar needs `min-height: 100%` to fill full column. "Accepting orders" toggle defaults to off — training implication for Onboarding-A.

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
*(logo_url column to be added CC-83)*

### `merchant_orders`
`id, order_id, venue_id, status, item_summary, sats_amount, created_at, updated_at, bolt11_payment_hash, paid_at, payment_status, amount_gbp, bolt11_invoice, bolt11_expires_at`

### `franchise_groups`
`id, name, hq_venue_id, created_at`

---

## Test accounts (Block 5)

| Email | Role | Venue | Notes |
|---|---|---|---|
| `steakhouse@rajeshtaylor.com` | `independent_owner` | Raj's Steakhouse, 10 Trinity Square EC3N 4AJ | Staff PIN: 1234 · Owner PIN: 8888 · venue_id: c476df85 |
| `moniker@rajeshtaylor.com` | `franchise_hq` | Costa Coffee group | Real Moniker is a franchise — kept as franchise_hq test only |
| `independent_owner@rajeshtaylor.com` | `independent_owner` | null — venue_id not set | Incomplete row — do not use until venue assigned |
| `dev@refueler.io` | `admin` | Costa Coffee Fenchurch St | Admin / dev console |

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
| `car_park_occupancy` | ❌ Dead — strip next touch |

---

## Session queue — forward plan

| Session | Scope | Type | Status |
|---|---|---|---|
| ~~CC-81~~ | Block 3 — Franchise dashboard | Sonnet counted | ✅ Closed |
| ~~CC-82~~ | Block 5 — Merchant onboarding (pre-work + test env + E2E) | Sonnet counted | ✅ Closed |
| **Block-5 Review** | Recalibrate Block 5 remaining scope, session allocation, block priorities | Opus uncounted | **Next** |
| **CC-83** | Block 5 continued — venue RLS fix, nav redesign, horizon strip, sidebar height, logo_url migration | Sonnet counted | Queued |
| **Onboarding-A** | Merchant onboarding flow design + printed handover document (leather-feel, for manager/owner training) | Opus uncounted | Queued |
| **CC-84** | Block 5 continued — onboarding flow build, PIN self-service, magic link email branding | Sonnet counted | Queued |
| **Block-5 Close** | Block 5 review, first real merchant live | Opus uncounted | Queued |
| **Block 8** | Fiat → sats rewards | Sonnet counted | Gated on Block 5 |
| **Pass-A** | Pass/Events concept for franchise dashboard — greyed stub, activation model | Opus uncounted | Queued |
| **Pass-B** | Venue hire, Fountain livestream, sats-on-first-drink | Opus uncounted | Queued after Pass-A |
| **Block 9** | LNBits integration | Sonnet counted | Deferred post merchant onboarding |

---

## Snag list — active

| ID | Item | Priority | Target |
|---|---|---|---|
| S-1 | PIN flash — ~1 frame of tablet-ui visible before gate renders. Fix: inline gate CSS in `<head>`, gates at `z-index:9999/position:fixed/inset:0` from first paint | Medium | Dedicated session |
| S-2 | "Loading venue…" in Active Site sidebar — `venue_partners` RLS likely blocking `independent_owner` read | High | CC-83 |
| S-3 | STEAKHOUSE nav badge pulls merchant_id slug not venue name — should display `venue_partners.name` | High | CC-83 |
| S-4 | Queue/Ops mode switch not obvious — STEAKHOUSE label doubles as toggle with no affordance. Replace with explicit two-state pill | High | CC-83 |
| S-5 | Venue name (or logo) should be centred/prominent in merchant nav — vanity play for merchants, differentiator | Medium | CC-83 |
| S-6 | Horizon strip stat values — ~20% size increase needed for kitchen readability at distance | Medium | CC-83 |
| S-7 | Sidebar height — doesn't fill full column. `min-height: 100%` fix | Low | CC-83 |
| S-8 | Owner/Staff PIN reset + Menu management — stubs in Owner View ("Beta — coming soon") | High | Onboarding-A / CC-84 |
| S-9 | Magic link email bare Supabase template — needs branded HTML before real merchant onboard | High | CC-84 |
| S-10 | Export-1: PDF/print icon on Revenue + Orders panels in franchise dashboard | Low | Future |
| S-11 | Dash-1: Orders over time + peak hours heatmap on franchise dashboard Overview | Low | Post volume |
| S-12 | `car_park_occupancy` strip from FEEDS array | Low | Next rail-signal-poll touch |
| S-13 | `independent_owner@rajeshtaylor.com` has no venue_id — incomplete row | Low | Assign venue or delete |
| S-14 | `Costa Coffee HQ` category label — `franchise_hq` should display as proper name | Low | Future |

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
