# Refueler Master Context — IO CC-84
*Updated: 2026-08-13 (CC-84 — Sonnet counted. Portrait layout S-16, walk-in order overlay, New Order bar, S-15 sub-labels, S-17 breakpoint architecture. Migration cc84_walkin_schema applied. Commit d0defcc.)*
*Supersedes: MasterContext_IO_CC83b*

---

## Session allocation
500 primary + 50 buffer = 550 total. Planning/Opus sessions uncounted.
**Block review sessions** — standing uncounted Opus at end of each block. Recalibrate priorities and session allocation.
Sessions used to CC-84: ~85 counted + uncounted planning sessions.

---

## Project overview

Refueler is a Bitcoin-native privacy ecosystem. Products: Share (anonymous encrypted file transfer, live at `refueler.io/share/`), Legend (privacy-first block explorer, post-B9), consumer pre-order app (Fenchurch St line), merchant terminal (cafés and restaurants near stations), Pass (Lightning-native ticketing and venue access — own repo and Claude project), NumoPay fork (in-house order taking, Android, waiter/floor use).

**Mission:** A Bitcoin-native privacy layer operating within UK jurisdictional law. Not a fintech product. Not a loyalty app. A Bitcoin world that works quietly, legally, and without surveillance.

**North star (internal only):** Come for privacy, stay for Bitcoin.

**Supabase project:** `tihgvdokeofnjxjkenmm`
**Webhook URL:** `https://tihgvdokeofnjxjkenmm.supabase.co/functions/v1/blink-webhook`

**GitHub repos:**
| Repo | Status | Local path |
|---|---|---|
| `rajesh-taylor/refueler-io` | Public — web/Command Centre/Supabase | `/Users/rajeshtaylor/Documents/refueler.io/` |
| `rajesh-taylor/refueler-app` | Public — React Native consumer app | `/Users/rajeshtaylor/Documents/refueler.io/refueler-app/` · dev branch local only — push pending |
| `rajesh-taylor/numo-fork` | Public — NumoPay fork v1.6 (cashubtc/Numo v1.8 base) | `/Users/rajeshtaylor/Documents/refueler.io/terminals/numo-fork/` |
| `rajesh-taylor/refueler-share` | Public — BLAKE3 + Cashu file transfer | `/Users/rajeshtaylor/Documents/refueler-share/` |
| `rajesh-taylor/refueler-legend` | Public — Legend chain explorer + ARM Bitcoin indexer | `/Users/rajeshtaylor/Documents/refueler-legend/` |
| `rajesh-taylor/refueler-mint` | Public — CDK Rust loyalty stamp mint | `/Users/rajeshtaylor/Documents/refueler-mint/` |
| `rajesh-taylor/refueler-pass` | Public — Pass ticketing + venue access | Own repo + Claude project — Pass scoping session first |
| `refueler-ecash-lab` | **Local only — never push** | `/Users/rajeshtaylor/Documents/refueler-ecash-lab/` |

**Product architecture (confirmed CC-83):**
- **Refueler consumer app** — customer-facing. Pre-orders, walk-in orders via app, Legend block explorer, Pass ticketing. Customer's primary touchpoint.
- **Merchant terminal** (`refueler-io/src/merchant/`) — counter/kitchen tablet. Receives and manages orders, Darwin intelligence, owner controls.
- **NumoPay fork** (`rajesh-taylor/numo-fork`) — waiter/floor-staff Android phone app. In-house order taking and payment. Lightning/Cashu native. Talks to terminal.
- **Flow:** consumer app places order → merchant terminal receives → NumoPay handles in-venue fulfilment.
- Mobile terminal: out of scope. NumoPay fork is the mobile/waiter solution.

---

## Homepage positioning — locked CC-79

Privacy infrastructure brand. No Fenchurch St line. No product-specific copy. No sign-in panel. Paper default on load; Carbon on toggle. Copy locked for one month from CC-79.

**Overline:** Privacy Infrastructure · London *(gold, `#C8A96E !important`)*
**Headline:** Your transaction / is nobody else's / business. *(Cormorant Garamond 600, three forced `<br>` lines — loaded in `src/index.njk` only)*
**Subhead:** Privacy isn't a feature. It's the architecture. *(DM Sans 300, full `--fg`, `.home-subhead-band` div)*
**Capability block:** Encrypted transfers — The server is blind, so is the till. / Bitcoin explorer — Your search history is showing. / Lightning payments — Tap and go. Sats or card, your call.

---

## Subdomain policy — locked CSS-1a

All products on `refueler.io/[product]/`. No new subdomains without documented technical constraint.

`share.refueler.io` migrated → `refueler.io/share/`. **Action required (Rajesh):** disconnect `share.refueler.io` from Cloudflare Pages, delete/disable project.

**Share canonical URLs:** Upload `https://refueler.io/share/` · Plans `https://refueler.io/share/plans/` · Status `https://refueler.io/share/status/` · Admin `https://refueler.io/share/admin/dashboard`

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
| `src/merchant/merchant-tablet-styles.css` | Merchant terminal styles | ✅ CC-84 |
| `src/merchant/index.html` | Merchant terminal HTML | ✅ CC-84 |
| `src/merchant/merchant-tablet-logic.js` | Merchant terminal JS | ✅ CC-84 |

---

## Global CSS — canonical token values (CSS-1a locked)

**Paper:** `--bg: #E8E2D8` · `--fg: #1A1A1A` · `--fg-muted: #5A5550` · `--fg-subtle: #9A9590` · `--border: rgba(26,26,26,0.12)` · `--surface: #DAD4CA` · `--surface-raised: #D0C9BE` · input: `#CCC7BE`

**Carbon:** `--bg: #1A1A1A` · `--fg: #E8E2D8` · `--fg-muted: #9A9590` · `--fg-subtle: #5A5550` · `--border: rgba(232,226,216,0.12)` · `--surface: #242424` · `--surface-raised: #2E2E2E`

**Shared:** `--gold: #C8A96E` · `--success: #27AE60` · `--font-heading: 'Satoshi'` · `--font-sans: 'DM Sans'` · `--font-mono: 'IBM Plex Mono'` · `--font-serif: 'Source Serif 4'`

**Theme persistence:** `rs-theme` cookie, scoped to `.refueler.io`, 30-day rolling.
**Theme default:** Paper on all public surfaces. Carbon default on Legend template. Carbon hardcoded on merchant terminal.
**Abolished:** `localStorage` for theme · `rfTheme` · `html.carbon-mode` · `--accent-action` · `backdrop-filter` · `#F5820A` orange

---

## Merchant terminal — design decisions locked

### Nav
- Default (no logo): Refueler wordmark (Satoshi 700, 16px, `#E4E2DC`) · divider · "MERCHANT TERMINAL" (IBM Plex Mono, 12px, `#C8C9CB`)
- Logo state: 32×32px square logo · divider · "MERCHANT TERMINAL"
- Right: QUEUE·OPS·OWNER merged pill (42px) · separator · PAPER·CARBON pill
- Portrait: nav-terminal-lbl and nav-divider hidden to save space

### Horizon strip
- Height: 64px · background `#1A1A1A` hardcoded (always dark, both themes)
- Station name: IBM Plex Mono 15px `#E4E2DC` · ETA: IBM Plex Mono 14px `#C8A96E`
- "DARWIN · LIVE" label: **hidden by default (CC-84)** — strip height and ETA are the implicit liveness signal. Label retained in HTML for DARWIN · OFFLINE JS state only.
- All arrival counts: `#A8A4A0` uniform — no gold on any count
- Window urgency backgrounds: 0–3 min `rgba(255,255,255,0.07)` · 3–7 min `rgba(255,255,255,0.03)` · 7–15 min transparent

### Order tiles
- `[ID] · [items]` single line · status badge right only
- PENDING gold · IN PREP `#7899D4` · READY `#3DCA7A`
- Tile: `background #26282C` · `border 0.5px solid #35373B` · `border-radius: 7px`

### Portrait layout — S-16 (CC-84, locked)
- Option A: sidebar collapses to horizontal-scroll card strip above main
- CSS-only, `@media (orientation: portrait), (max-width: 820px)`
- Layout: nav → horizon band → sidebar card strip (horizontal scroll) → New Order bar → queue header → stats row → order queue
- Cards: `min-width: 200px`, height auto, `scroll-snap-align: start`
- Active site card: address line hidden in portrait (`.site-address { display: none }`)
- Map: hidden in portrait (`#venue-map { display: none }`)
- Single-column order queue in portrait

### New Order bar (CC-84)
- Full-width CTA between sidebar strip and queue header
- Gold-outlined, not gold-filled — Refueler brand, not Square
- Hidden until staff sign in; hidden in OPS view; restored on return to queue view
- `onclick="openWalkinOverlay()"` — opens walk-in overlay

### Walk-in order overlay (CC-84)
- Lightweight overlay, dismissable via ← Back button or backdrop tap
- Fields: Identifier (datalist: Table 1–10, Counter), Item(s), Notes (optional)
- Validation: identifier and item required before submit
- Inserts into `merchant_orders` with `order_source: 'walkin'`, `payment_status: 'walkin'`, nullable `order_id`
- No Lightning invoice — payment via NumoPay fork or cash

### Darwin toggle (queued — CC-85 or Onboarding-A)
- Owner screen toggle: "Rail/tube arrivals" on/off
- Default on at onboarding. When off: horizon strip hidden, Darwin sidebar card replaced by local events / football fixtures card (see Events intelligence layer below)
- Enables non-rail venues (out of city, town centres) to use the terminal without dead UI

### S-17 breakpoint architecture (CC-84, documented)
- Landscape tablet (≥820px, default): existing layout, no changes
- Portrait tablet (`@media (orientation: portrait), (max-width: 820px)`): CC-84 implementation
- NumoPay phone (~390px portrait): documented, not built — belongs in numo-fork repo, NumoPay-A session

---

## Supabase — schema state (post-CC-84)

**Migration cc84_walkin_schema applied 2026-08-13:**
- `merchant_orders.order_id` → nullable (walk-ins have no parent orders row)
- `merchant_orders.identifier TEXT` — table number, counter name, free text
- `merchant_orders.item_name TEXT` — free-text staff entry
- `merchant_orders.order_source TEXT DEFAULT 'lightning'` — `'lightning'` | `'walkin'`
- INSERT policy `merchant_orders_insert_own_venue` — independent_owner / merchant / franchise_branch may insert walk-in rows for own venue_id
- Steakhouse coords: `coords_lat = 51.5104`, `coords_lng = -0.0784` (10 Trinity Square, EC3N 4AJ)

**RLS policy state (merchant_orders):**
- `merchant_orders_insert_service_role` — service role insert (existing)
- `merchant_orders_insert_own_venue` — authenticated staff insert own venue (CC-84)
- `merchant_orders_select_own_venue` — merchant/independent_owner/franchise_branch select
- `merchant_orders_update_service_role` — service role update only

**RLS policy state (venue_partners):**
- `merchant_select_own_venue` — merchant/franchise_branch/independent_owner
- `franchise_hq_select_own_group_venues` — franchise HQ
- `admin_full_access_venue_partners` — admin
- `partners_public_read` — **DROPPED CC-83b** (qual:true security fix)

---

## PIN hash status — S-18 (security, pre-Block 5 Close)

PINs in `merchant_users` are SHA-256 hashed (64-char hex, browser-native `crypto.subtle`). Not plaintext, but SHA-256 is a fast hash — wrong for PIN storage. 4-digit PIN has only 10,000 combinations; SHA-256 brutable in milliseconds. Correct solution: bcrypt/argon2 server-side via Edge Function, not browser. **Dedicated session required before first real merchant goes live.** Queued as S-18, target Block 5 Close or Sim-Close.

---

## Football / events intelligence layer (queued — planning session)

**football-data.org** API subscribed (free tier: Premier League `PL` + Championship `ELC` + others). API key held by Rajesh. Data shape: `GET /v4/matches?competitions=PL&dateFrom=today&dateTo=today` returns fixtures with kick-off times, venue names, team names.

**Design decision (CC-84):** Darwin is not permanently load-bearing — it is the default intelligence layer for rail-adjacent venues, toggleable off by the owner. When off, the sidebar Darwin card is replaced by an events/fixtures card. This is the vehicle for football intelligence and future event integrations.

**Events intelligence sidebar card spec (to be designed — Onboarding-A or dedicated session):**
- Shows today's local fixtures filtered by proximity to merchant's `coords_lat/coords_lng`
- Source: football-data.org for Premier League / Championship initially; scope to expand
- Owner-selectable: rail intelligence OR events intelligence OR both (future)
- "DARWIN · LIVE" strip becomes swappable: rail strip OR events strip depending on owner setting
- Interchangeable horizon strips per day/event type is a key product differentiator

---

## Pass × Events × Merchant (queued — dedicated Opus planning session before Pass-A)

**The integration arc:**
Event finishes → Pass knows attendees → merchant near venue gets signal → merchant opts into Pass-linked offer ("first drink for Pass holders") → attendee taps Pass credential at bar → Refueler commission on redemption.

**Why this shapes Pass-A:**
Pass credential scope and structure must be designed to support post-event merchant redemption from the start. Retrofitting this later is expensive.

**Dedicated scoping session agenda (no code):**
- UK GDPR constraints on gig/event attendee data — what we can and cannot hold
- How Ticketmaster and Luma track and monetise user data — our privacy advantages
- What "privacy-first ticketing" means in practice for the attendee and the merchant
- Bitcoin Events × Merchant pre-planned offer mechanics (e.g. Madeira 2028 style)
- Fedimint community mint model — temporary vs permanent merchant relationships
- Pitch angle for Bitcoin event organisers (Madeira 2028, Baltic Honeybadger etc.)
- Pass credential scoping: what data is on the credential, what stays off it
- Ticketmaster / Luma competitive positioning

**Madeira 2028 angle:** Community Fedimint with local merchants tears down post-event. Refueler can offer a permanent layer: merchant relationships persist beyond the event via Pass credentials and ongoing Lightning-native offers. Pitch opportunity for event organisers.

**Log:** Bitcoin Events × Pass × Merchant planning session — must run before Pass-A. Opus, extended thinking on.

---

## Test accounts

| Email | Role | Notes |
|---|---|---|
| `steakhouse@rajeshtaylor.com` | `independent_owner` | Raj's Steakhouse · venue_id `c476df85` · staff PIN 1234 · owner PIN 8888 · coords now live |
| `moniker@rajeshtaylor.com` | `franchise_hq` | Moniker franchise |
| `dev@refueler.io` | `admin` | Admin / dev console |

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

## Snag list — active

| ID | Item | Priority | Target |
|---|---|---|---|
| S-8 | Owner/Staff PIN reset + Menu management — stubs in Owner View | High | Onboarding-A / CC-85 |
| S-9 | Magic link email bare Supabase template — needs branded HTML | High | CC-85 |
| S-10 | Export-1: PDF/print icon on Revenue + Orders panels | Low | Future |
| S-11 | Dash-1: Orders over time + peak hours heatmap on franchise dashboard | Low | Post volume |
| S-12 | `car_park_occupancy` strip from FEEDS array | Low | Next rail-signal-poll touch |
| S-14 | `Costa Coffee HQ` category label fix | Low | Future |
| S-15 | Sub-labels: queue-stat-label 9px, queue-stat-sub 10px, owner-stat-label 9px, owner-stat-sub 10px | ✅ CC-84 | — |
| S-16 | Portrait layout: Option A CSS-only sidebar stack | ✅ CC-84 | — |
| S-17 | Landscape/portrait/NumoPay breakpoint architecture documented | ✅ CC-84 | — |
| S-18 | PIN hash upgrade: SHA-256 → bcrypt/argon2 server-side Edge Function | High | Dedicated session — before first real merchant goes live |

---

## Queued sessions — forward plan

| Session | Scope | Type | Status |
|---|---|---|---|
| ~~CC-83~~ | Terminal design decisions | Sonnet counted | ✅ Closed |
| ~~CC-83b~~ | Block 5 production code, migrations | Sonnet counted | ✅ Closed |
| ~~CC-84~~ | Portrait layout, walk-in overlay, New Order bar, sub-labels | Sonnet counted | ✅ Closed |
| **CC-85** | Branded magic link email, first full sim run | Sonnet counted | **Next** |
| **Onboarding-A** | Merchant onboarding flow + printed handover doc | Opus uncounted | Queued |
| **Block-5 Close** | Block 5 review and recalibration | Opus uncounted | Queued |
| **Sim-Close** | Formal sign-off all 4 sim stages | Opus uncounted (up to 2) | Queued |
| **PIN upgrade** | SHA-256 → bcrypt/argon2 server-side, migrate existing hashes | Sonnet counted | Before first live merchant |
| **Bitcoin Events × Pass × Merchant** | Scoping session — GDPR, privacy pitch, credential design, Madeira angle | Opus uncounted, extended thinking | **Before Pass-A** |
| **Pass-A** | Full Pass scope + Pass Wallet card | Opus uncounted | After Block 8 + Events session |
| **NumoPay-A** | Fork review, API contract, BitChat research | Opus uncounted | After Block 5 sim-close |
| **Block 8** | Fiat → sats rewards | Sonnet counted | After Block 5 |
| **Events intelligence layer** | Football fixtures sidebar card, Darwin toggle, owner-selectable horizon strips | Sonnet counted | After Onboarding-A |
| **Session A (CDK mint)** | CDK mint architecture | Opus uncounted | After Block 8 |
| **AD-2** | Share admin dashboard | Sonnet counted | Queued |

---

## Ongoing / bundled action items

- **Action required (Rajesh):** Disconnect `share.refueler.io` from Cloudflare Pages, delete/disable project
- **Action required (Rajesh):** Push `refueler-app` dev branch — fix PAT in remote URL, push dev branch
- **Action required (Rajesh):** Test portrait layout on physical tablet and at Apple Store (iPad 10.9" primary target; mini through Pro range)
- **Action required (Rajesh):** Send Mapbox coordinate accuracy email (drafted CC-84, saved to drafts)
- Upgrade Cloudflare Workers to Paid ($5/month) before production volume
- New Anthropic API key → rotate before csuite briefing reuse
- `blink-webhook_index.ts` → hygiene pass
- `bsc-dev` Dev Test item → remove before TestFlight
- GitHub Actions red X on `9b9655d`
- LNBits webhook payload shape → confirm with Ben Arc before Block 9
- Est. 2026 accent column → replace with Companies House reg on incorporation
- Lawyer briefing: draft written brief before appointment
- Competitive check: Square / Toast / KDS on multi-programme concurrent loyalty stamps
- Float pre-load amount: TBD-Rajesh
- AI helper on owner tab: queued future session
- Pass Wallet card: scoped in Pass-A
- Cashu token expiry sweep: mandatory before Cashu reward issuance
- Legend mobile: scope deliberately in first Legend build session
- `pin_bg_url` column: added CC-83b, wired in CC-84 onboarding — pending Onboarding-A
- Partner-facing materials session: NumoPay competitive angle vs Square KDS, portrait+landscape, horizon strip as differentiator
- football-data.org API key: held by Rajesh, ready for Events intelligence layer session

---

## CC-84 — session notes

**Commit:** `d0defcc` · 3 files changed, 534 insertions, 11 deletions

**Migration cc84_walkin_schema:** order_id nullable, identifier/item_name/order_source columns added, INSERT policy for staff walk-in orders, steakhouse coordinates applied.

**Portrait A/B/C design exploration:**
- Option A (Refueler, Darwin-first) selected — locked
- Option B (Square/Toast thinking, collapsible Darwin) — useful reference, solid gold CTA button noted for future consideration
- Option C (no Darwin, non-rail venues) — defines the degraded state; Darwin toggle in Owner screen queued for Onboarding-A

**Key design decisions locked CC-84:**
- "DARWIN · LIVE" label removed from horizon strip — height and ETA are the implicit liveness signal
- Active site card address line hidden in portrait — staff know where they are
- New Order bar: gold-outlined (not filled), between sidebar strip and queue header, hidden until signed in
- Walk-in overlay: ← Back button (not Cancel), backdrop tap closes, validation on identifier + item

**Mapbox coordinate discussion:** Systematic 10–20m offsets on POI coordinates in dense City of London streets. Email drafted to Mapbox (saved to Rajesh's drafts). Root cause: geocoder snaps to building centroid or street-level address range rather than unit entrance. Affects all small units in narrow Victorian-era lanes around Fenchurch Street.

**football-data.org confirmed:** Free tier covers PL + ELC (Championship) + others. Fixtures data shape suitable for sidebar card. Events intelligence layer and Darwin toggle queued for planning session.

**Pass × Events × Merchant arc logged:** Integration concept from event-end signal through Pass credential to merchant post-event offer and Refueler commission. Must inform Pass credential scoping — dedicated Opus session required before Pass-A.

---

*"Nothing stops this train."*
