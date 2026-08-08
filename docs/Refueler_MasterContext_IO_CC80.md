# Refueler Master Context — IO CC-80
*Updated: 2026-08-08 (M-2 closed — Share live at refueler.io/share/)*
*Supersedes: previous CC-80 version*
*Sync log: MasterContext_IO_CC80 — M-2: Share migrated to refueler.io/share/; Worker CORS updated; Turnstile allowlist updated; share-nav.njk and share-footer.njk added to src/_includes/; main nav updated with Share link.*

---

## Project overview

Refueler is a Bitcoin-native privacy ecosystem. Products: Share (anonymous encrypted file transfer), Legend (privacy-first block explorer), consumer pre-order app (Fenchurch St line), merchant terminal (cafés and restaurants near stations).

**Mission:** A Bitcoin-native privacy layer operating within UK jurisdictional law. Not a fintech product. Not a loyalty app. The big idea: a Bitcoin world that works quietly, legally, and without surveillance.

**Homepage positioning (locked CC-79):** Privacy infrastructure brand. No Fenchurch St line. No product-specific copy. No sign-in panel. Carbon default on toggle; Paper default on load. Banded layout. Copy locked:

**Overline:** Privacy Infrastructure · London *(gold, `#C8A96E` hardcoded with `!important`)*
**Headline:** Your transaction / is nobody else's / business. *(three forced `<br>` lines)*
**Subhead:** Privacy isn't a feature. It's the architecture. *(DM Sans 300, full `--fg`, wrapped in `.home-subhead-band` div)*
**Capability block:**
- Encrypted transfers — The server is blind, so is the till.
- Bitcoin explorer — Your search history is showing.
- Lightning payments — Tap and go. Sats or card, your call.

**Homepage font stack (locked CC-79):**
- Headline: Cormorant Garamond 600 — loaded in `src/index.njk` only, not global
- Overline / cap labels: Satoshi (global)
- Subhead / cap descriptors: DM Sans 300/400 (global)

**Homepage CSS (locked CC-79):** All classes prefixed `home-` to prevent global.css cascade collisions. Gold hardcoded as `#C8A96E !important` on `<p>` tags. Subhead wrapped in `div.home-subhead-band`.

**Homepage accent column:** Removed CC-79. Revisit on Companies House registration.

**"Fiat or Bitcoin — privacy included."** retired from homepage CC-79. Product pages only.

**North star (internal):** They come for privacy, they stay and then fall in love with Bitcoin.

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

---

## Subdomain policy — locked CSS-1a

**`refueler.io` is the canonical domain for all products.** Every product lives at `refueler.io/[product]/` unless a specific technical constraint makes a subdomain genuinely necessary.

`share.refueler.io` migrated to `refueler.io/share/` in M-2. Subdomain still live until M-3 signs off and `refueler-share` Pages project is formally retired.

**No future product gets a subdomain** without a documented technical constraint that cannot be resolved within the main repo.

**Cloudflare infrastructure (Share):**
- `refueler-share` Pages project — still serving `share.refueler.io`. Retire after M-3 verification.
- `refueler-share` Worker — `refueler-share.rt-fc4.workers.dev` (version `af37c80b`). CORS updated M-2 to accept `https://refueler.io`. Do not remove `https://share.refueler.io` from allowed origins until M-3 closes.
- Turnstile widget `refueler-share` — `refueler.io` added to allowed hostnames M-2.

**Legend:** Stays at `refueler.io/legend/`. No subdomain. Locked.

---

## Share — current URLs

| Page | URL |
|---|---|
| Upload | `https://refueler.io/share/` |
| Plans | `https://refueler.io/share/upgrade/` |
| Status | `https://refueler.io/share/status/` |

`share.refueler.io` still resolves until M-3 retires the Pages project.

**Outstanding for M-3 (Worker):** Stripe return URLs on lines 1052, 1053, 1117 of `refueler-share/worker/src/index.js` still point to `share.refueler.io/upgrade`. Fix in M-3.

---

## Share — include architecture (locked M-2)

Share pages use two dedicated includes living in `src/_includes/`:
- `share-nav.njk` — Share nav (Refueler/Share wordmark, Notes, Plans, Support, theme pill)
- `share-footer.njk` — Share footer (© 2026 Refueler · refueler.io/share/, Status, Plans)

Share pages reference them as `{% include "share-nav.njk" %}` and `{% include "share-footer.njk" %}`.

**Known issue (M-3):** Plans nav link shows as active on Share index page — not correct. Fix in M-3.

---

## Workflow — file delivery

Rajesh moves produced files into place manually. Claude never includes a file copy step in deploy commands. Provide only `git add/commit/push` commands after files are in place.

**File naming rule (locked CC-74):** All `index.njk` files produced by Claude must be named with a section prefix — e.g. `home-index.njk`. When uploading multiple prefixed files for review, upload one at a time. Rename to `index.njk` via `mv` before committing.

---

## Cloudflare Pages — build configuration

| Setting | Value |
|---|---|
| Build command | `npm install && npx eleventy` |
| Build output directory | `_site` |
| Build system version | Version 3 |
| Branch | main |

**Submodule rule (locked CC-72):** `refueler-app` and `terminals/numo-fork` must NEVER be registered as git submodules inside `refueler-io`.

---

## CSS architecture — refueler.io

**The rule:** Every page needs only `{% include "head.njk" %}` and one `<link>` to its page-specific CSS. No page may define its own `:root` token block. No page may have a body-level theme `<script>`.

**Font loading rule (locked CC-79):** Page-specific display fonts loaded via `<link>` in that page's `.njk` file only.

**Cascade rule (locked CC-79):** `global.css` body sets `color: var(--fg)` which cascades into all `p` tags. Any page-level `p` colour override needs `!important` or a prefixed class. CSS rationalisation track will fix this properly.

**`var(--accent)` warning:** Use hardcoded `#C8A96E !important` for gold on `p` tags until CSS rationalisation is complete.

| File | Owns | Status |
|---|---|---|
| `src/assets/css/global.css` | All tokens, reset, nav, footer | ✅ Clean — rationalisation pending |
| `src/assets/css/home.css` | Homepage — all classes `home-` prefixed | ✅ Live CC-79 |
| `src/assets/css/legend.css` | Legend layout only | 🟡 Has `:root` block — migrate in CSS-6 |
| `src/assets/css/editorial.css` | Editorial index layout only | ✅ Clean |
| `src/assets/css/support.css` | Support page layout only | ✅ Clean |
| `src/assets/css/privacy.css` | Privacy policy layout only | ✅ Clean |
| `src/notes/notes.css` | Notes layout | 🟡 Has `:root` block + duplicate nav/footer — CSS-6 |
| `src/share/assets/share-tokens.css` | Share token staging file | 🟡 Temporary — merges into global.css in CSS-4 |
| `src/share/assets/share.css` | Share upload page layout | ✅ Passthrough |
| `src/share/assets/upgrade.css` | Plans page layout | ✅ Passthrough |
| `src/share/assets/status.css` | Status page layout | ✅ Passthrough |

**Editorial articles — migration status:**
- `src/editorial/the-city-worker/index.njk` — ✅ Migrated CC-79
- `src/editorial/nothing-to-collect-nothing-to-hide/index.njk` — ✅ Migrated CC-79
- `src/editorial/looks-done-isnt-done/index.njk` — ✅ Migrated CC-80
- `src/editorial/the-float/index.njk` — ✅ Migrated CC-80

---

## Global CSS — canonical token values (CSS-1a locked)

**Paper:** `--bg: #E8E2D8` *(updated CSS-1a — was `#F5F0E8`)* · `--fg: #1A1A1A` · `--fg-muted: #5A5550` · `--fg-subtle: #9A9590` · `--border: rgba(26,26,26,0.12)`
**Carbon:** `--bg: #1A1A1A` · `--fg: #F5F0E8` · `--fg-muted: #B0AAA2` · `--fg-subtle: #6A6560` · `--border: rgba(245,240,232,0.10)`
**Accent:** `--accent: #C8A96E` · `--accent-hover: #E0C48A`
**No CTA orange token.** `--accent-action` abolished. `#F5820A` and `#D4690A` do not exist in this codebase.

**Surface tokens (proportional to new Paper — CSS-1a):**
- Paper: `--surface: #DAD4CA` · `--surface-raised: #D0C9BE`
- Carbon: `--surface: #26282C` · `--surface-raised: #2E3035` *(unchanged)*

**Input field (CSS-1a):**
- Paper: `#CCC7BE` (recessed well)
- Carbon: `#252525` (unchanged)

**Stale/abolished values — never use:**
- `#1E1F22` / `#F7F4EF` — wrong hex, predates token lock
- `#F5F0E8` — old Paper bg, replaced by `#E8E2D8`
- `#F5820A` / `#D4690A` — orange, abolished

---

## Locked decisions

- **Legend page layout (locked CSS-1a):** Wordmark, input field, tagline only above results. No green credential dot. No Silent Payments card. No below-fold three-column block. These are removed in CSS-5.
- **Legend theme default (locked CSS-1a):** `getCookie('rs-theme') || 'carbon'` on Legend template only. All other pages default Paper.
- **Card body text spec (locked CSS-1a):** DM Sans 400, `line-height: 1.7`, `color: var(--fg)`. Not muted, not 300 weight. Card surface provides visual softening — text inside does not retreat.
- **`--inset-rule` gold scope (locked CSS-1a):** Gold only on `h2` dividers and blockquotes inside article body content. Not in chrome. CC-74 global gold lock superseded.
- **Subdomain policy (locked CSS-1a):** All products on `refueler.io/[product]/`. No new subdomains without documented technical constraint.
- **North star (locked CC-77):** "They come for privacy, they stay and then fall in love with Bitcoin." Internal only.
- **"Bitcoin, privately."** Reserved for Legend index exclusively.
- **"Built for jurisdictions that have laws. And lawyers."** Reserved for Share page.
- **Anthropic API key (CC-72):** Disabled. New key needed before csuite briefing reuse.

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

---

## Database schema — key tables

### `orders`
`id, session_id, user_id, partner, bay_label, order_value_gbp, commission_pct, commission_gbp, commission_sats, sats_rate, reward_type, reward_sats, handover_method, payment_processor, payment_ref, zebedee_charge_id, settled_at, created_at, venue_id, item_name, status, updated_at, payment_status, bolt11_invoice, invoice_expires_at, pseudonym_id, routing_fee_sats, settled_sats`

### `merchant_users`
`id, user_id, email, role, venue_id, franchise_group_id, staff_pin_hash, owner_pin_hash, created_at`
Role CHECK: `merchant | franchise_branch | franchise_hq | admin | independent_owner | investor`

### `venue_partners`
`id, merchant_id, name, category, site, coords_lat, coords_lng, location, address_line1, city, country, pickup_note, exclusivity_radius_m, active, pause_reason, session_added, created_at, contact_email, venue_type, franchise_group_id, brand_primary, brand_secondary, max_concurrent_orders`

### `merchant_orders`
`id, order_id, venue_id, status, item_summary, sats_amount, created_at, updated_at, bolt11_payment_hash, paid_at, payment_status, amount_gbp, bolt11_invoice, bolt11_expires_at`

### `franchise_groups`
`id, name, hq_venue_id, created_at`

---

## Edge Functions (deployed)

| Function | Version | Purpose | verify_jwt |
|---|---|---|---|
| `blink-webhook` | v12 | Blink direct callback | `false` (explicit) |
| `create-order` | — | Consumer app → Blink BOLT11 invoice | explicit |
| `blink-balance` | — | Proxies Blink GraphQL balance | explicit |
| `rail-signal-poll` | — | Darwin feed poller, pg_cron triggered | explicit |

---

## Blink callback endpoint
- **Active API key:** `refueler-cc68` (id: `b98cf536-ac9e-484b-bab2-14f1a181a12e`)
- **URL:** `https://tihgvdokeofnjxjkenmm.supabase.co/functions/v1/blink-webhook`

---

## Nav architecture — locked CSS-1a / updated M-2

**Main site (`refueler.io`):** Legend, Editorial, Notes, Share, Privacy, theme pill. Share link added M-2.
**Share (`refueler.io/share/`):** Notes, Plans, Support, theme pill. Privacy and Status footer-only.
**Legend (`refueler.io/legend/`):** Carbon default (`|| 'carbon'`). Theme pill present. No green dot. No below-fold block.
**Support email:** `support@refueler.io`. `privacy@refueler.io` GDPR only.
**Cross-product linking architecture:** To be resolved in CSS-1b (Opus, uncounted). Paid member dashboard will inform Plans/Upgrade nav placement — defer nav design decisions until CSS-1b.

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

## Session queue — full forward plan

| Session | Scope | Type | Notes |
|---|---|---|---|
| ~~CC-80~~ | Nav fix + editorial `:root` strip | ✅ Closed | |
| ~~CSS-1~~ | Design reference document | ✅ Closed (uncounted) | `REFUELER-WEBSITE-DESIGN-REFERENCE.md` produced |
| ~~CSS-1a~~ | Visual review + conflict resolution | ✅ Closed (uncounted) | All four conflicts resolved |
| ~~M-1~~ | Share migration planning | ✅ Closed (uncounted) | Option A confirmed, full plan produced |
| ~~M-2~~ | Share migration execution | ✅ Closed (counted) | `refueler.io/share/` live |
| **M-3** | Share migration verification | Sonnet — counted | Full checklist in SESSIONS. Fix Stripe return URLs in Worker. Fix Plans active state bug. |
| **CSS-1b** | Cross-product nav architecture | Opus — uncounted | After M-3. One domain, one nav system. |
| **CSS-2** | global.css full audit | Opus — uncounted | All CSS files in context post-migration. Findings report only. |
| **CSS-3** | CSS architecture blueprint | Opus — uncounted | Token naming, cascade rules, reset strategy, page responsibilities. Plan only. |
| **CSS-4** | Implement new global.css | Opus — counted | Against blueprint. Single commit. |
| **CSS-5** | Full site verification | Opus — counted | Every page, every theme, every nav. Legend simplified. |
| **CSS-6** | Page CSS rationalisation | Opus — counted | Strip `!important`, migrate `notes.css` and `legend.css` `:root` blocks. |
| **CC-81** | Block 3 — Franchise dashboard | Sonnet — counted | Starts after CSS track complete. |

---

## DB Maintenance note
`rail_signal_history` — export + truncate every 3–4 weeks before hitting 500MB. psql password in Apple Notes.

---

## Ongoing / bundled items

- New Anthropic API key → before csuite briefing reuse
- `car_park_occupancy` strip → next rail-signal-poll touch
- `blink-webhook_index.ts` → hygiene pass
- `bsc-dev` Dev Test item → remove before TestFlight
- `Costa Coffee HQ` category label fix
- GitHub Actions red X on `9b9655d`
- LNBits webhook payload shape → confirm with Ben Arc before Block 9
- Notes article seeds → `notes-articles-list.md` in refueler-share at next Share session
- Est. 2026 accent column → replace with Companies House reg on incorporation
- Paper input field recess → review after one month in production
- Worker Stripe return URLs → fix in M-3 (lines 1052, 1053, 1117 of `refueler-share/worker/src/index.js`)
- `refueler-share` Pages project retirement → after M-3 signs off
- Plans active state bug on Share index nav → fix in M-3

---

*"Nothing stops this train."*
