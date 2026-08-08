# Refueler Master Context — IO CC-79b
*Updated: 2026-08-05 (CC-79 post-session update)*
*Supersedes: Refueler_MasterContext_IO_CC79.md*
*Sync log: MasterContext_IO_CC79b — CC-79: homepage redesigned, nav fix committed, CSS rationalisation track added, session queue expanded.*

---

## Project overview

Refueler is a Bitcoin-native privacy ecosystem. Products: Share (anonymous encrypted file transfer), Legend (privacy-first block explorer), consumer pre-order app (Fenchurch St line), merchant terminal (cafés and restaurants near stations).

**Mission:** A Bitcoin-native privacy layer operating within UK jurisdictional law. Not a fintech product. Not a loyalty app. The big idea: a Bitcoin world that works quietly, legally, and without surveillance.

**Homepage positioning (locked CC-79):** Privacy infrastructure brand. No Fenchurch St line. No product-specific copy. No sign-in panel. Carbon default. Banded layout. Copy locked:

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

**Homepage CSS (locked CC-79):** All classes prefixed `home-` to prevent global.css cascade collisions. Gold hardcoded as `#C8A96E !important` on `<p>` tags — `var(--accent)` is overridden by body colour cascade on `p` elements. Subhead wrapped in `div.home-subhead-band` — padding-bottom on `<p>` is zeroed by global reset; the div wrapper owns the spacing and border-bottom instead.

**Homepage accent column:** Removed CC-79 — grid layout broke on live site due to global.css conflict. Will revisit when Companies House registration number is available. Est. 2026 placeholder removed entirely.

**"Fiat or Bitcoin — privacy included."** retired from homepage CC-79. Product pages only.

**North star (internal):** They come for privacy, they stay and then fall in love with Bitcoin.

**Known CSS root cause (diagnosed CC-79):** `global.css` body rule sets `color: var(--fg)` which cascades into every `p`, `h1`, `span`. Page-level CSS targeting `p` tags must use `!important` or prefixed class names to win. All future homepage CSS uses `home-` prefix. This is the core issue driving the CSS rationalisation track below.

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

## Workflow — file delivery

Rajesh moves produced files into place manually. Claude never includes a file copy step in deploy commands. Provide only `git add/commit/push` commands after files are in place.

**File naming rule (locked CC-74):** All `index.njk` files produced by Claude must be named with a section prefix — e.g. `home-index.njk`. Applies to `index.njk` files only.

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

**Font loading rule (locked CC-79):** Page-specific display fonts loaded via `<link>` in that page's `.njk` file only. Not in `head.njk`, not in `global.css`.

**Cascade rule (locked CC-79):** `global.css` body sets `color: var(--fg)` which cascades into all `p` tags. Any page-level `p` colour override needs `!important` or a prefixed class. All homepage classes prefixed `home-` for this reason. CSS rationalisation track will fix this properly.

**`var(--accent)` warning:** Can fail to override body cascade on `p` elements. Use hardcoded `#C8A96E !important` for gold on `p` tags until CSS rationalisation is complete.

| File | Owns | Status |
|---|---|---|
| `src/assets/css/global.css` | All tokens, reset, nav, footer | ✅ Clean — rationalisation pending |
| `src/assets/css/home.css` | Homepage — all classes `home-` prefixed | ✅ Live CC-79 |
| `src/assets/css/legend.css` | Legend layout only | ✅ Clean |
| `src/assets/css/editorial.css` | Editorial index layout only | ✅ Clean |
| `src/assets/css/support.css` | Support page layout only | ✅ Clean |
| `src/assets/css/privacy.css` | Privacy policy layout only | ✅ Clean |
| `src/notes/notes.css` | Notes layout | ✅ Clean |

**Editorial articles — migration status:**
- `src/editorial/the-city-worker/index.njk` — ✅ Migrated CC-79
- `src/editorial/nothing-to-collect-nothing-to-hide/index.njk` — ✅ Migrated CC-79
- `src/editorial/looks-done-isnt-done/index.njk` — ⚠️ CC-80
- `src/editorial/the-float/index.njk` — ⚠️ CC-80

**EDITORIAL-MASTER.md token values are WRONG.** Never use `#1E1F22` or `#F7F4EF`. Canonical: Carbon `#1A1A1A`, Paper `#F5F0E8`.

---

## CSS architecture — share.refueler.io (✅ Complete CC-75)

`share-tokens.css` single token source. Theme toggle confirmed working on all three pages.

---

## Known issues — active

| Issue | Status |
|---|---|
| Nav links broken on refueler.io — Legend, Editorial, Privacy, footer links | 🔴 CC-80 Part 1 |
| Share nav — Support link broken | 🔴 CC-80 Part 1 |
| `looks-done-isnt-done` + `the-float` `:root` blocks | ⚠️ CC-80 Part 2 |
| `global.css` cascade / token duplication | 🟡 CSS rationalisation track |

---

## Locked decisions (always apply)

- Blink BOLT11 only. BOLT12 parked.
- Carbon dark everywhere (default). Paper is user toggle only. Orange (#F5820A) abolished.
- Brand: suave, discreet, refined — "James Bond, not fintech neon."
- `verify_jwt` must be set explicitly on every Edge Function deploy.
- curl commands: always single-line, real key inlined — never placeholder, never backslash continuations.
- "Fenchurch St line" only — never "C2C". Not mentioned on homepage.
- Merchant data isolation: merchants read from `merchant_orders` only.
- **Theme detection:** `document.documentElement.dataset.theme === 'carbon'` only.
- **Theme persistence:** Cookie `rs-theme` scoped to `.refueler.io`.
- **Paper:** `#F5F0E8`. **Carbon:** `#1A1A1A`. All other values wrong.
- **No backdrop-filter** on any surface.
- **No body theme scripts** — `head.njk` only.
- **No inline `:root` blocks** on any page.
- **Homepage locked one month (CC-79):** No iteration without formal session decision.
- **Legend index copy (locked CC-78):** Headline: "Bitcoin, privately." Opening: "Buys non-KYC Bitcoin, then logs every address ever searched..."
- **North star (locked CC-77):** "They come for privacy, they stay and then fall in love with Bitcoin." Internal only.
- **"Bitcoin, privately."** Reserved for Legend index exclusively.
- **"Built for jurisdictions that have laws. And lawyers."** Reserved for Share API / paid plans.
- **Anthropic API key (CC-72):** Disabled. New key needed before csuite briefing reuse.

---

## Global CSS — canonical token values

**Paper:** `--bg: #F5F0E8` · `--fg: #1A1A1A` · `--fg-muted: #5A5550` · `--fg-subtle: #9A9590` · `--border: rgba(26,26,26,0.12)`
**Carbon:** `--bg: #1A1A1A` · `--fg: #F5F0E8` · `--fg-muted: #B0AAA2` · `--fg-subtle: #6A6560` · `--border: rgba(245,240,232,0.10)`
**Accent:** `--accent: #C8A96E` · `--accent-hover: #E0C48A`
**CTA:** Paper `--accent-action: #D4690A` · Carbon `--accent-action: #F5820A`

**Duplicate token issue (fix in CSS rationalisation):** `global.css` has both `--fg/--fg-muted/--fg-subtle` AND `--text-primary/--text-secondary/--text-tertiary` — two parallel naming systems. Only one should survive rationalisation.

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

## Nav architecture — locked

**Main site:** Legend, Editorial, Notes, Privacy, theme pill. Support and Share footer-only.
**Share:** Notes (→ refueler.io/notes/), Upgrade, Support (→ refueler.io/support/), theme pill. Privacy footer-only.
**Support email:** `support@refueler.io`. `privacy@refueler.io` GDPR only.

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
| **CC-80 Part 1** | Nav fix — refueler.io + share | Sonnet — counted | Read nav.njk, footer.njk, head.njk live. Diagnose broken links. Fix and commit per repo. |
| **CC-80 Part 2** | Editorial articles — `looks-done-isnt-done` + `the-float` | Sonnet — counted | Strip `:root` blocks. Read live first. |
| **CSS-1** | Design context cross-reference | Opus — uncounted | Read BRIDGE, MasterContext, and any legend/share design files. Produce unified design reference document covering all locked decisions across all three products before any CSS is touched. |
| **CSS-2** | global.css full audit | Opus — uncounted | Feed all CSS files. Identify every conflict, duplicate token, cascade risk, `!important` need, class collision. Output findings report only — no changes. |
| **CSS-3** | New CSS architecture design | Opus — uncounted | Blueprint session. Token naming convention. Cascade rules. Reset strategy. Page CSS responsibilities. Nothing written — plan only. |
| **CSS-4** | Implement new global.css | Opus — counted | Write against blueprint. Verify no page breaks. Single commit. |
| **CSS-5** | Full site verification | Opus — counted | Every page, every theme, every nav link, Paper and Carbon. Fix anything that surfaces. |
| **CSS-6** | Page CSS rationalisation | Opus — counted | Strip `!important` guards, rename defensive prefixes, clean up home.css, notes.css, legend.css. Per-file commits. |
| **CC-81** | Block 3 — Franchise dashboard | Sonnet — counted | Starts after CSS track complete. KPI strip, per-venue commission, operator controls. |
| **CC-82+** | Block 3 continues, then Block 5 | Sonnet — counted | As scoped. |

**CSS track runs before Block 3.** Block 3 on a broken CSS foundation will create more debt. One week of CSS work saves months of firefighting.

---

## DB Maintenance note
`rail_signal_history` — export + truncate every 3–4 weeks before hitting 500MB. psql password in Apple Notes.

---

*"Nothing stops this train."*
