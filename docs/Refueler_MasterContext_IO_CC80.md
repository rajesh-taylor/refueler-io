# Refueler Master Context — IO CC-80
*Updated: 2026-08-08 (CSS-1a decisions locked; Block M planned; Share migration sequenced before CSS track)*
*Supersedes: previous CC-80 version*
*Sync log: MasterContext_IO_CC80 — CSS-1a: Paper hex updated; orange abolished; inset-rule gold scope reduced; Legend page simplified; card body text locked; Share migration (Block M) sequenced before CSS track; subdomain consolidation decision recorded.*

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

`share.refueler.io` exists for historical reasons — it predates the Eleventy build and was assumed to be incompatible. That assumption was wrong. Share has been running Eleventy (`@11ty/eleventy ^3.0.0`) the entire time. Migration to `refueler.io/share/` is planned as Block M.

**No future product gets a subdomain** without a documented technical constraint that cannot be resolved within the main repo. "Feels like a different product" is not sufficient reason. Domain authority consolidates on `refueler.io`.

**Cloudflare infrastructure (Share):** Two separate entries —
- `refueler-share` Pages project — connected to `rajesh-taylor/refueler-share`, serves `share.refueler.io`. Moves to `refueler-io` Pages project post-migration.
- `refueler-share` Worker — `refueler-share.rt-fc4.workers.dev`, handles backend (file ops, Cashu credentials, BLAKE3). Stays as-is; CORS/allowed-origins updated to accept `refueler.io/share/` post-migration.

**Legend:** Stays at `refueler.io/legend/`. No subdomain. Locked.

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

**Editorial articles — migration status:**
- `src/editorial/the-city-worker/index.njk` — ✅ Migrated CC-79
- `src/editorial/nothing-to-collect-nothing-to-hide/index.njk` — ✅ Migrated CC-79
- `src/editorial/looks-done-isnt-done/index.njk` — ✅ Migrated CC-80
- `src/editorial/the-float/index.njk` — ✅ Migrated CC-80

---

## CSS architecture — share.refueler.io (pre-migration)

`share-tokens.css` at `frontend/share-tokens.css` is the current single token source. Post Block M migration, this merges into `global.css` and Share pages load `global.css` via the shared `head.njk`.

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
- Paper: `#CCC7BE` (recessed well — cooler and slightly more grey than background)
- Carbon: `#252525` *(unchanged — correct as-is)*

**`--inset-rule` (CSS-1a — CC-74 lock superseded):**
- Paper: `var(--border)` — same as border, no gold in chrome
- Carbon: `var(--border)` — `rgba(245,240,232,0.10)` — **not gold**
- Gold `--inset-rule` (`#C8A96E`) is valid **only** as an inline element style on `h2` dividers and blockquotes inside editorial and Notes article body content. Never as a token applied to nav, footer, card borders, or any chrome.
- This supersedes the CC-74 decision which set `--inset-rule: #C8A96E` in Carbon globally. Rationale: gold trim in nav chrome was confirmed visually as overdone (CSS-1a review).

**Duplicate token issue (fix in CSS rationalisation):** `global.css` has both `--fg/--fg-muted/--fg-subtle` AND `--text-primary/--text-secondary/--text-tertiary`. Decision (CSS-1a): `--fg*` wins as primary system. `--text-*` becomes aliases pointing to `--fg*` values. `notes.css` body text migrated from `--text-primary` to `--fg` in CSS-6.

---

## Known issues — active

| Issue | Status |
|---|---|
| Nav links broken on refueler.io | ✅ Fixed CC-80 |
| Share nav — Support link broken | ✅ Fixed CC-80 |
| Editorial `:root` blocks | ✅ Fixed CC-80 |
| `global.css` cascade / token duplication | 🟡 CSS rationalisation track (post Block M) |
| Share on subdomain | 🟡 Block M — migration to `refueler.io/share/` |
| Legend page has green dot + below-fold block | 🟡 CSS-5 / Block M — remove both |
| Paper input field recess | 🟡 Noted for review after one month in production |
| Share nav gold border in Paper mode | 🟡 Block M / CSS-4 |
| `notes.css` `:root` block | 🟡 CSS-6 |
| `legend.css` `:root` block | 🟡 CSS-6 |

---

## Locked decisions (always apply)

- Blink BOLT11 only. BOLT12 parked.
- Carbon dark everywhere as user toggle. **Paper is default on page load** across all web surfaces including Share post-migration.
- Orange `#F5820A` and `#D4690A` **abolished**. Do not use. Do not define as tokens. Do not propose.
- Brand: suave, discreet, refined — "James Bond, not fintech neon."
- `verify_jwt` must be set explicitly on every Edge Function deploy.
- curl commands: always single-line, real key inlined.
- "Fenchurch St line" only — never "C2C".
- Merchant data isolation: merchants read from `merchant_orders` only.
- **Theme detection:** `document.documentElement.dataset.theme === 'carbon'` only.
- **Theme persistence:** Cookie `rs-theme` scoped to `.refueler.io`.
- **Paper:** `#E8E2D8`. **Carbon:** `#1A1A1A`. All other values wrong.
- **No backdrop-filter** on any surface.
- **No body theme scripts** — `head.njk` only.
- **No inline `:root` blocks** on any page.
- **Homepage locked one month (CC-79):** No iteration without formal session decision.
- **Legend index copy (locked CC-78):** Headline: "Bitcoin, privately." Opening: "Buys non-KYC Bitcoin, then logs every address ever searched..."
- **Legend page layout (locked CSS-1a):** Wordmark, input field, tagline only above results. No green credential dot. No Silent Payments card. No below-fold three-column block. These are removed in Block M / CSS-5.
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

## Nav architecture — locked CSS-1a

**Main site (`refueler.io`):** Legend, Editorial, Notes, Privacy, theme pill. Share link needed — to be added as capability block links (homepage descriptors become links) and/or nav entry. Resolved in CSS-1b nav architecture session.
**Share (`refueler.io/share/` post-migration):** Notes, Plans (was Upgrade), Support, theme pill. Privacy footer-only.
**Legend (`refueler.io/legend/`):** Carbon default (`|| 'carbon'`). Theme pill present. No green dot. No below-fold block.
**Support email:** `support@refueler.io`. `privacy@refueler.io` GDPR only.
**Cross-product linking architecture:** To be resolved in CSS-1b (Opus, uncounted).

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
| ~~CSS-1a~~ | Visual review + conflict resolution | ✅ Closed (uncounted) | All four conflicts resolved. Paper `#E8E2D8`. Orange abolished. `--inset-rule` scope reduced. Block M sequenced. |
| **CSS-1b** | Cross-product nav architecture | Opus — uncounted | One domain, one nav system. What links where, from where, with what labels. Share's "Plans" label. Capability block links on homepage. Runs after Block M planning is confirmed. |
| **M-1** | Share migration planning | Sonnet — uncounted | Map every Share asset, URL, JS dependency (Cashu, BLAKE3, Turnstile), Cloudflare Pages config. No code. Output: migration plan. |
| **M-2** | Share migration execution | Sonnet — counted | Move Share pages into `refueler.io/src/share/`. Merge `share-tokens.css` into `global.css`. Update nav both sides. Update Cloudflare Pages. Update Worker CORS. `share.refueler.io` → `refueler.io/share/` redirect. |
| **M-3** | Share migration verification | Sonnet — counted | Every page, every theme, every Share JS function. Fix anything. Update `refueler-share` repo status. |
| **CSS-2** | global.css full audit | Opus — uncounted | All CSS files in context post-migration. Findings report only. |
| **CSS-3** | CSS architecture blueprint | Opus — uncounted | Token naming, cascade rules, reset strategy, page responsibilities. Plan only. |
| **CSS-4** | Implement new global.css | Opus — counted | Against blueprint. Single commit. Includes Paper `#E8E2D8`, surface tokens, input field, `--inset-rule` correction, orange removal. |
| **CSS-5** | Full site verification | Opus — counted | Every page, every theme, every nav. Legend page simplified (dot + block removed). Fix anything. |
| **CSS-6** | Page CSS rationalisation | Opus — counted | Strip `!important`, migrate `notes.css` and `legend.css` `:root` blocks, unify token naming. Per-file commits. |
| **CC-81** | Block 3 — Franchise dashboard | Sonnet — counted | Starts after CSS track complete. |

**Block M runs before CSS track.** Rationalising two separate CSS systems and two deployment pipelines is double work. Merge first, rationalise once.

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

---

*"Nothing stops this train."*
