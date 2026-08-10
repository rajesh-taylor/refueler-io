# Refueler Master Context — IO CC-80
*Updated: 2026-08-10 (CSS-7b closed — QR removed, colophon readable, /share/plans/ live, nav reordered)*
*Supersedes: previous CC-80 version*
*Sync log: MasterContext_IO_CC80 — M-3: Block M closed. Upload E2E verified. blake3 moved to src/share/assets/blake3/. Turnstile widget updated to 2 hostnames (refueler.io + share.refueler.io). Worker Stripe return URLs updated to refueler.io/share/upgrade/. _headers added to src/. Signoff copy and CSS updated. share.refueler.io subdomain to be retired in Cloudflare dashboard.*

---

## Project overview

Refueler is a Bitcoin-native privacy ecosystem. Products: Share (anonymous encrypted file transfer), Legend (privacy-first block explorer), consumer pre-order app (Fenchurch St line), merchant terminal (cafés and restaurants near stations).

**Mission:** A Bitcoin-native privacy layer operating within UK jurisdictional law. Not a fintech product. Not a loyalty app. The big idea: a Bitcoin world that works quietly, legally, and without surveillance.

**Homepage positioning (locked CC-79):** Privacy infrastructure brand. No Fenchurch St line. No product-specific copy. No sign-in panel. Paper default on load; Carbon on toggle. Banded layout. Copy locked:

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

`share.refueler.io` migrated to `refueler.io/share/` — Block M complete. **Action required:** disconnect `share.refueler.io` custom domain from `refueler-share` Cloudflare Pages project in dashboard, then delete or disable the Pages project.

**No future product gets a subdomain** without a documented technical constraint that cannot be resolved within the main repo.

**Cloudflare infrastructure (Share):**
- `refueler-share` Pages project — still serving `share.refueler.io`. **Retire now** — disconnect custom domain in dashboard.
- `refueler-share` Worker — `refueler-share.rt-fc4.workers.dev` (version `7a0183e1`). CORS accepts `https://refueler.io`, `https://share.refueler.io`, `https://upgrade.refueler.io`. Do not remove `https://share.refueler.io` until Pages project is fully retired.
- Turnstile widget `refueler-share` — 2 hostnames: `refueler.io` + `share.refueler.io`.

**Legend:** Stays at `refueler.io/legend/`. No subdomain. Locked.

---

## Share — current URLs (canonical)

| Page | URL |
|---|---|
| Upload | `https://refueler.io/share/` |
| Plans | `https://refueler.io/share/upgrade/` |
| Status | `https://refueler.io/share/status/` |

`share.refueler.io` still resolves until Pages project is retired in Cloudflare dashboard.

---

## Share — include architecture (locked M-2)

Share pages use two dedicated includes living in `src/_includes/`:
- `share-nav.njk` — Share nav (Refueler/Share wordmark, Plans, Notes, Support, Privacy, theme pill)
- `share-footer.njk` — Share footer (© 2026 Refueler · refueler.io/share/, Status, Plans)

Share pages reference them as `{% include "share-nav.njk" %}` and `{% include "share-footer.njk" %}`.

---

## Share — asset architecture (locked M-3)

- BLAKE3 WASM lives at `src/share/assets/blake3/` — builds to `_site/share/assets/blake3/`
- `share.js` imports via `./blake3/browser-async.js` (relative from `/share/assets/`)
- `src/_headers` passes through to `_site/_headers` via `eleventyConfig.addPassthroughCopy("src/_headers")`
- `src/share/blake3` passthrough rule removed from `eleventy.config.js` (stale — blake3 now under assets)
- Cloudflare Workers Paid plan required for production KV volume ($5/month, 1M writes/day)

---

## Share — signoff copy (locked M-3)

Post-download colophon (shown to recipient after download completes):
> Encrypted in your browser.
> Deleted when it expires.
> refueler.io

Three lines. Source Serif 4 weight 300. `--text-tertiary`. No ecosystem pitch. No salesy copy.

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

**Note:** `REFUELER-WEBSITE-DESIGN-REFERENCE.md` §2 (colour token values) is superseded by CSS-1a token lock (Paper now `#E8E2D8`, orange abolished). §9 (Legend layout) is superseded by the CSS-1a layout lock and CSS-5 removal of credential dot and below-fold block. The document remains useful for competitive/structural notes but do not copy token values from it.

**The rule:** Every page needs only `{% include "head.njk" %}` and one `<link>` to its page-specific CSS. No page may define its own `:root` token block. No page may have a body-level theme `<script>`.

**Font loading rule (locked CC-79):** Page-specific display fonts loaded via `<link>` in that page's `.njk` file only.

**Cascade rule (locked CC-79):** `global.css` body sets `color: var(--fg)` which cascades into all `p` tags. Any page-level `p` colour override needs `!important` or a prefixed class. CSS rationalisation track will fix this properly.

**`var(--accent)` warning:** Use hardcoded `#C8A96E !important` for gold on `p` tags until CSS rationalisation is complete.

| File | Owns | Status |
|---|---|---|
| `src/assets/css/global.css` | All tokens, reset, nav, footer | ✅ Clean — CSS track complete |
| `src/assets/css/home.css` | Homepage — all classes `home-` prefixed | ✅ Live CC-79 |
| `src/assets/css/legend.css` | Legend layout only | ✅ Clean — CSS-6 |
| `src/assets/css/editorial.css` | Editorial index layout only | ✅ Clean — CSS-6 |
| `src/assets/css/support.css` | Support page layout only | ✅ Clean — CSS-6 |
| `src/assets/css/privacy.css` | Privacy policy layout only | ✅ Clean — CSS-6 |
| `src/notes/notes.css` | Notes layout | ✅ Clean — CSS-6 |
| `src/share/assets/share-tokens.css` | Share-only component tokens (drop/card/tag/link-box) | ✅ Clean — CSS-4 merge complete |
| `src/share/assets/share.css` | Share upload/download page layout | ✅ Updated CSS-7b — QR removed, colophon --fg-muted |
| `src/share/assets/plans.css` | Plans page layout (renamed from upgrade.css) | ✅ Added CSS-7b |
| `src/share/assets/upgrade.css` | Plans page layout | ✅ Passthrough |
| `src/share/assets/status.css` | Status page layout | ✅ Passthrough |
| `src/_headers` | Cloudflare Pages headers — blake3 path unblock | ✅ Added M-3 |

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
- **Card body text spec (locked CSS-1a):** DM Sans 400, `line-height: 1.7`, `color: var(--fg)`. Not muted, not 300 weight.
- **`--inset-rule` gold scope (locked CSS-1a):** Gold only on `h2` dividers and blockquotes inside article body content. Not in chrome.
- **Subdomain policy (locked CSS-1a):** All products on `refueler.io/[product]/`. No new subdomains without documented technical constraint.
- **North star (locked CC-77):** "They come for privacy, they stay and then fall in love with Bitcoin." Internal only.
- **"Bitcoin, privately."** Reserved for Legend index exclusively.
- **"Built for jurisdictions that have laws. And lawyers."** Reserved for Share page.
- **Anthropic API key (CC-72):** Disabled. New key needed before csuite briefing reuse.
- **Share signoff copy (locked M-3):** Three lines — "Encrypted in your browser. / Deleted when it expires. / refueler.io" — no ecosystem pitch.
- **Share design session (CSS-7):** ✅ Closed. Upload complete hierarchy, download trust line, colophon border fixed (gold→border), download detail label added, font alias migration to canonical `--font-*`, `/share/plans/` nudge href. CSS rationalisation track complete.
- **CSS-7b:** ✅ Closed. QR removed (product decision — professional buyers prohibited from scanning QR by security policy). Colophon `--fg-subtle` → `--fg-muted` (was too recessive). `/share/plans/` page now live at correct permalink. Main site nav reordered: Share · Legend · Notes · Editorial · Support · Privacy. Share nav reordered: Plans · Notes · Support · Privacy. `_headers` redirect `/share/upgrade/` → `/share/plans/` 301.

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

## Nav architecture — locked CSS-7b / 10 Aug 2026

**Main site (`refueler.io`):** Share · Legend · Notes · Editorial · Support · Privacy · pill.
**Share (`refueler.io/share/`):** Plans · Notes · Support · Privacy · pill. Status footer-only.
**Legend (`refueler.io/legend/`):** Carbon default (`|| 'carbon'`). Theme pill present.
**Support email:** `support@refueler.io`. `privacy@refueler.io` GDPR only.

Nav order rationale: products first (Share live, Legend next), then content (Notes, Editorial), then Support (more frequently visited than Privacy), Privacy last. Plans first on Share nav — highest commercial priority on that surface.

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
| ~~CSS-1~~ | Design reference document | ✅ Closed (uncounted) | |
| ~~CSS-1a~~ | Visual review + conflict resolution | ✅ Closed (uncounted) | |
| ~~M-1~~ | Share migration planning | ✅ Closed (uncounted) | |
| ~~M-2~~ | Share migration execution | ✅ Closed (counted) | |
| ~~M-3~~ | Share migration verification | ✅ Closed (counted) | Block M complete |
| ~~CSS-1b~~ | Cross-product nav architecture | ✅ Closed (uncounted) | |
| ~~CSS-2~~ | global.css full audit | ✅ Closed (uncounted) | |
| ~~CSS-3~~ | CSS architecture blueprint | ✅ Closed (uncounted) | |
| ~~CSS-4~~ | Implement new global.css | ✅ Closed (counted) | commit 2cbc496 |
| ~~CSS-5~~ | Full site verification | ✅ Closed (counted) | commits 9f44d3b, 7fb04de, 83c9fa9, 7ed7ac3 |
| ~~CSS-6~~ | Page CSS rationalisation | ✅ Closed (counted) | `:root` strip, analytics rfTheme, share.js QR, legend tagline |
| ~~CSS-7~~ | Share design session | ✅ Closed (counted) | Success hierarchy, colophon, progress, font aliases |
| ~~CSS-7b~~ | Share fixes + nav reorder | ✅ Closed (counted) | QR removed, colophon readable, /share/plans/ live, nav reordered |
| **CC-81** | Block 3 — Franchise dashboard | Sonnet — counted | **Next** |

---

## Ongoing / bundled items

- **Action required:** Disconnect `share.refueler.io` custom domain from `refueler-share` Cloudflare Pages project, then delete or disable the project
- Upgrade Cloudflare Workers to Paid plan ($5/month) before production volume
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
- Share streaming encryption (chunked) → B-series Share roadmap item (post-MVP)
- Safari large file limitation (>~1.5 GB) → known, document in Share FAQ, fix in streaming session

---

*"Nothing stops this train."*
