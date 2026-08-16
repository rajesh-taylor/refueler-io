# Refueler Master Context — IO CC-88
*Updated: 2026-08-16 (CC-88 — Sonnet counted. S-23 queue sign-out shipped. S-24 favicon/apple-touch-icon/PWA metas shipped. Manager role architecture logged for TDP-B. Design-A2 note logged.)*
*Supersedes: MasterContext_IO_CC87*

---

## Session allocation
500 primary + 50 buffer = 550 total. Planning/Opus sessions uncounted.
**Block review sessions** — standing uncounted Opus at end of each block. Recalibrate priorities and session allocation.
Sessions used to CC-88: ~88 counted + uncounted planning sessions.

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
| `rajesh-taylor/refueler-pass` | Public — Pass ticketing + venue access | Own repo + Claude project |
| `refueler-ecash-lab` | **Local only — never push** | `/Users/rajeshtaylor/Documents/refueler-ecash-lab/` |

---

## Block 5 — status (Block-5 Close)

**Closed as: capability complete.** No go-live date set. First real merchant happens when the product is ready — not on a schedule.

**What shipped:** Terminal nav/UI, portrait layout, walk-in overlay, New Order bar, magic-link email (Resend SMTP), first passing browser sim (CC-85), Stages 0–7 onboarding flow, User Guide (6pp), Venue Keys card (1pp).

**What didn't ship (moved to queue):** Internal onboarding process doc (Stage 1 sim deliverable), PIN auth server-side (S-18), payment sim (Stage 3), physical print test (Stage 4 — non-blocking).

**Shipped post-close (CC-88):** Queue sign-out (S-23) ✅ · favicon/apple-touch-icon/PWA metas (S-24) ✅

---

## Sim-Close — stages (Block-5 Close)

- Stage 1: Internal onboarding process doc — to produce.
- Stage 2: Operational sim — PASSED (CC-85, browser). iPad check non-blocking.
- Stage 3: Payment sim — not yet run. Standalone session. Rajesh to provide Lightning address for Raj's Steakhouse. **Now unblocked — schema migration landed CC-87.**
- Stage 4: Physical handover — non-blocking. Print when stable.

---

## Homepage positioning — locked CC-79

Privacy infrastructure brand. Paper default on load; Carbon on toggle. Copy locked for one month from CC-79.

**Overline:** Privacy Infrastructure · London
**Headline:** Your transaction / is nobody else's / business.
**Subhead:** Privacy isn't a feature. It's the architecture.
**Capability block:** Encrypted transfers — The server is blind, so is the till. / Bitcoin explorer — Your search history is showing. / Lightning payments — Tap and go. Sats or card, your call.

---

## Subdomain policy — locked CSS-1a

All products on `refueler.io/[product]/`. No new subdomains without documented technical constraint.
`share.refueler.io` migrated → `refueler.io/share/`. **Action required (Rajesh):** disconnect `share.refueler.io` from Cloudflare Pages.

---

## Workflow — file delivery

Rajesh moves files into place manually. Claude never includes `cp` steps — git commands only after files placed.
**File naming rule:** All `index.njk` files produced by Claude use a section prefix. Rename via `mv` before committing.

---

## Cloudflare Pages — build config

| Setting | Value |
|---|---|
| Build command | `npm install && npx eleventy` |
| Build output | `_site` |
| Build system | Version 3 |
| Branch | main |

---

## CSS architecture — locked

Single token source: `global.css`. No page defines its own `:root`. No `backdrop-filter`. Page CSS is layout-only.
All CSS rationalisation sessions CSS-1 through CSS-7b closed.

**Global CSS — canonical token values (CSS-1a locked):**

**Paper:** `--bg: #E8E2D8` · `--fg: #1A1A1A` · `--fg-muted: #5A5550` · `--fg-subtle: #9A9590` · `--border: rgba(26,26,26,0.12)` · `--surface: #DAD4CA` · `--surface-raised: #D0C9BE` · input: `#CCC7BE`

**Carbon:** `--bg: #1A1A1A` · `--fg: #E8E2D8` · `--fg-muted: #9A9590` · `--fg-subtle: #5A5550` · `--border: rgba(232,226,216,0.12)` · `--surface: #242424` · `--surface-raised: #2E2E2E`

**Shared:** `--gold: #C8A96E` · `--success: #27AE60` · `--font-heading: 'Satoshi'` · `--font-sans: 'DM Sans'` · `--font-mono: 'IBM Plex Mono'` · `--font-serif: 'Source Serif 4'`

**Theme persistence:** `rs-theme` cookie, scoped to `.refueler.io`, 30-day rolling.
**Abolished:** `localStorage` for theme · `rfTheme` · `html.carbon-mode` · `--accent-action` · `backdrop-filter` · `#F5820A` orange

---

## Magic link email — locked CC-85

Delivered via Resend SMTP. Subject: `Your sign-in link — Refueler`.
Future upgrade path (Route B): Auth Hook Edge Function when Supabase Pro activated.

---

## Merchant handover documents — locked Design-A

**Files (committed f0157ef to `docs/`):**
- `merchant-onboarding-v1.html` — User Guide, 6 A4 pages, print-ready standalone
- `merchant-venue-keys-v1.html` — Venue Keys card, 1 A4 page, print-ready standalone
- `merchant-onboarding-process-v1.html` — Internal onboarding process doc (to be produced — Stage 1 sim deliverable)

**Design rules:**
- Standalone HTML files. Each prints independently as its own PDF.
- Gold on h2 top-borders (guide) and warn-banner left-border (keys) only.
- All sensitive values (Owner PIN, wallet addresses, Staff PIN) handwritten at handover — never typed.
- Open in Chrome for cleanest PDF output.
- "Nothing stops this train." removed from all merchant-facing docs — internal signature only.
- Docs will iterate several times. Do not print full runs until design is stable.

**S-23 dependency:** Signing Out section states sign-out in Queue + OPS views. If S-23 slips before first real handover, trim "Queue view" reference to OPS-only.

**Docs ↔ UI sync rule (active):** At close of every block touching merchant terminal UI — "Does the handover document need updating?" If yes, queue an update session.

**Future Owner tab integration (queued post Sim-Close):**
- Two downloadable document tiles in Owner tab.
- Amber dot: new version available. Green: current version downloaded.
- Venue Keys printable independently (wallet address or PIN change without reprinting full guide).

---

## Merchant terminal — design decisions locked

### Nav
- Default (no logo): Refueler wordmark (Satoshi 700, 16px, `#E4E2DC`) · divider · "MERCHANT TERMINAL" (IBM Plex Mono, 12px, `#C8C9CB`)
- Right: QUEUE·OPS·OWNER merged pill (42px) · separator · PAPER·CARBON pill
- Portrait: nav-terminal-lbl and nav-divider hidden to save space

### Horizon strip
- Height: 64px · background `#1A1A1A` hardcoded (always dark, both themes)
- Station name: IBM Plex Mono 15px `#E4E2DC` · ETA: IBM Plex Mono 14px `#C8A96E`
- "DARWIN · LIVE" label hidden by default (CC-84) — strip height and ETA are the implicit liveness signal
- All arrival counts: `#A8A4A0` uniform — no gold on any count

### Order tiles
- `[ID] · [items]` single line · status badge right only
- PENDING gold · IN PREP `#7899D4` · READY `#3DCA7A`
- Tile: `background #26282C` · `border 0.5px solid #35373B` · `border-radius: 7px`

### Portrait layout — S-16 (CC-84, locked)
- Option A: sidebar collapses to horizontal-scroll card strip above main. CSS-only.
- `@media (orientation: portrait), (max-width: 820px)`

### Sign-out buttons (CC-85)
- OPS and Owner sign-out: `btn-owner-signout` — red border + red text, fills red on hover.

### Darwin toggle (queued — TDP scope)
- Owner screen toggle: rail/tube arrivals on/off
- Default on at onboarding. When off: horizon strip hidden, Darwin card replaced by events/fixtures card.

---

## Supabase — schema state (post-CC-87)

**Migration cc87_venue_partners_wallet_addresses applied 2026-08-16:**
- `venue_partners.lightning_address TEXT` (nullable)
- `venue_partners.onchain_address TEXT` (nullable)
- `venue_partners.silent_payment_address TEXT` (nullable)
- `venue_partners.mapbox_place_id TEXT` (nullable)

All four confirmed present via `information_schema.columns` verification query.

**Previous migration cc84_walkin_schema (2026-08-13):**
- `merchant_orders.order_id` → nullable
- `merchant_orders.identifier TEXT`
- `merchant_orders.item_name TEXT`
- `merchant_orders.order_source TEXT DEFAULT 'lightning'`
- INSERT policy `merchant_orders_insert_own_venue`
- Steakhouse coords: `coords_lat = 51.5104`, `coords_lng = -0.0784`

---

## Supabase session lifetime — CC-87

The JWT expiry config is a GoTrue setting, not surfaced as a SQL-queryable row. `auth.sessions.not_after` is NULL on all existing sessions in this project (magic link sessions on the free plan don't populate it unless a custom expiry is configured in the dashboard).

**Supabase platform default (free plan):** access token 3600s (1 hour) · refresh token 7 days · refresh token rotation: off by default on free plan.

**Decision (CC-87):** Access token extended to **12 hours**. Rationale: covers a standard shift plus realistic overtime, including sick-day coverage where an on-shift staff member is asked to stay on. 12h eliminates any mid-service bounce without introducing meaningful security regression (staff PIN remains the role gate). Per-staff individual tokens explicitly deferred — see Staff Management v1 note below.

**Action required (Rajesh):** Set JWT expiry to 43200s in Supabase dashboard → Authentication → JWT Settings before Stage 3 sim.

---

## PIN hash status — S-18

PINs in `merchant_users` are SHA-256 hashed (64-char hex, browser-native `crypto.subtle`). Not plaintext, but SHA-256 is a fast hash — wrong for PIN storage.

**Architecture note (Block-5 Close):** S-18 is scoped as "move PIN auth server-side" — not just a hash swap. PIN verification moves to an Edge Function (`verify_jwt: false`, external-facing), introducing a round-trip and requiring rate-limiting. Dedicated Sonnet session before first real merchant.

Only two known test PINs exist (1234 / 8888). Migration of existing hashes is trivial (plaintext known).

---

## Test accounts

| Email | Role | Notes |
|---|---|---|
| `steakhouse@rajeshtaylor.com` | `independent_owner` | Raj's Steakhouse · venue_id `c476df85` · staff PIN 1234 · owner PIN 8888 · coords live |
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

**Blink:** Active API key `refueler-cc68` · BTC wallet: `fd2357fe-24ec-4173-8441-fc0f05722e9a`

---

## Snag list — active

| ID | Item | Priority | Target |
|---|---|---|---|
| S-18 | PIN auth server-side: SHA-256 → bcrypt/argon2, verify in Edge Function | High | Dedicated Sonnet session — before first live merchant |
| S-22 | Email fallback link block — drop one more line above "Button not working…" text | Low | Future |

**Permanently closed:**
- ~~S-12~~ `car_park_occupancy` — strip from FEEDS array on next `rail-signal-poll` touch.
- ~~S-14~~ `Costa Coffee HQ` category label — fix on next `rail-signal-poll` touch.
- ~~S-23~~ Queue sign-out button — shipped CC-88 commit `083f2a2`. All authenticated staff now have a sign-out path from the queue header (`btn-owner-signout`, calls `signOut()`).
- ~~S-24~~ favicon/apple-touch-icon — shipped CC-88 commit `083f2a2`. SVG favicon, 32px PNG, 180px apple-touch-icon, manifest.json, full PWA metas (standalone mode, status bar, theme-color) in merchant `index.html`.

**Note on S-22b** (button top-border missing on iOS Mail): confirm resolved or reinstate.

---

## Staff Management v1 — future product arc (logged CC-87)

**Current model:** One staff PIN, one owner PIN per venue. Shared with floor staff by the owner. Role gate only — not an identity gate. If a staff member leaves, owner changes the staff PIN via support. This is the correct model for the current scale.

**Per-staff PINs — explicitly deferred.** Individual PIN issuance per staff member requires a staff management table, a PIN issuance/rotation flow, and effectively a mini HR system. Not appropriate before a first paying merchant exists.

**Future arc:** Per-staff accounts with individual session tokens and shift-aware token expiry is a genuine product line. Square charges ~$35/month per location for their equivalent (Square Team Management). Toast, Lightspeed similar. This is a real monetisation lever for Refueler post-product-market-fit.

**Prerequisites for Staff Management v1:** staff table with individual auth records, per-staff PIN issuance flow in the Owner tab, shift scheduling logic that drives token lifetime, overtime/absence extension flow.

**When to build:** Post Block 8. Not before. Log against Owner tab roadmap.

**Onboarding guide note (active):** AM and owner to discuss current PIN model at handover. One sentence in the User Guide: "Your Staff PIN is shared with all floor staff. If a staff member leaves, contact support to rotate it."

**Manager role — TDP-B agenda item (logged CC-88):**
Real-world pattern: most owners stop working behind the till within 6 months. A duty manager or senior shift worker runs the venue day-to-day on the owner's behalf. The OPS panel (venue open/close, pause orders) maps naturally to this role — these are operational controls, not owner-level decisions.

Current sign-out architecture (post CC-88):
- Plain staff → queue header SIGN OUT → `signOut()` → `/command-centre/`
- Owner (OPS panel) → OPS Account section SIGN OUT → `signOut()` → `/command-centre/`
- Owner (Owner tab) → Owner tab Account section Sign Out → `ownerSignOut()` → `/command-centre/`

Target architecture when Staff Management v1 introduces a Manager tier:
- Staff → queue header (unchanged)
- Manager → OPS panel (gated on Manager PIN, not Owner PIN)
- Owner → Owner tab (unchanged)

At that point the two current owner sign-out paths collapse cleanly: OPS becomes manager territory, Owner tab remains owner-only. No redundancy.

---

## Share — platform notes (logged Block-5 Close)

**Pay-per-use API (planning — pre-AD-2):**
v1 segments: professional photographers and legal. Staging: v1 metered → v2 broaden → v3 white-label. Recipient flywheel: every anonymous recipient is a latent sender. Full plan in dedicated Share API planning session.

**Safari upload ceiling:** ~1.5 GB real-world ceiling on current in-memory upload path. Fix: chunked streaming encryption. Do not headline large-file capability on Safari; "4 GB free" must not imply a 4 GB Safari upload works today.

---

## Queued sessions — forward plan (reordered CC-87)

| # | Session | Scope | Type | Status |
|---|---|---|---|---|
| ~~1~~ | ~~Schema migration~~ | ~~4 cols on `venue_partners` + session-lifetime check~~ | ~~Sonnet counted~~ | ✅ **CC-87 — done** |
| ~~2~~ | ~~S-23 + S-24 bundle~~ | ~~Queue sign-out button + apple-touch-icon + favicon~~ | ~~Sonnet counted~~ | ✅ **CC-88 — done** |
| 1 | **S-18 — PIN auth server-side** | Move PIN verification to Edge Function, bcrypt/argon2, rate-limit | Sonnet counted | **Next** |
| 2 | **Internal onboarding process doc** | Stage 1 sim deliverable — staff doc for adding a venue partner | Sonnet counted | Queued |
| 4 | **Payment sim — Stage 3** | Full Blink invoice → settlement → webhook → terminal | Sonnet counted | Now unblocked (schema landed) — after S-18 |
| 5 | **TDP-A** | Terminal Design Philosophy — audit, comparators, primitives | Opus uncounted | After Stage 3 sim |
| 6 | **TDP-B** | Terminal redesign — menu, events, NumoPay | Opus uncounted | After TDP-A |
| 7 | **TDP-C** | NumoPay fork alignment | Opus uncounted | After TDP-B |
| — | **Menu Management v1** | CSV import, time-based menus | Sonnet counted | After TDP-B |
| — | **CA-1 — Consumer App Track** | Opus scoping session — end-to-end commuter order flow, frictionless UX, app state audit from CC-69 | Opus uncounted | Opens after TDP-C; parallel with or immediately after Menu Management v1. **Prerequisite: dev branch push (open Rajesh action item).** |
| — | **NumoPay-A** | Fork review, API contract, BitChat research | Opus uncounted | After TDP-C |
| — | **Block 8** | Fiat → sats rewards | Sonnet counted | After Menu Management v1 |
| — | **Events intelligence layer** | Football fixtures, Darwin toggle, horizon strips | Sonnet counted | Can run in gap — no hard dependency |
| — | **Privacy page update** | Sections 7, 8, 10 + merchant + Legend free-tier | Sonnet counted | Any gap — no dependencies |
| — | **Sim-Close** | Formal sign-off all 4 stages | Opus uncounted (≤2) | After Stage 3 sim + internal doc |
| — | **Share API planning** | Pay-per-use API, photographer/legal v1, v1/v2/v3 staging | Opus uncounted | Before AD-2 |
| — | **AD-2** | Share admin dashboard | Sonnet counted | After Share API planning |
| — | **Owner tab doc tiles** | Amber/green download indicators | Sonnet counted | Post Sim-Close |
| — | **Changelog panel** | Reverse-chronological change list in Owner tab | Sonnet counted | Post Sim-Close |
| — | **Design-A2** | Terminal screenshots in User Guide — incl. home screen icon screenshot for "bookmark this page" instruction (logged CC-88) | Opus uncounted | After TDP-B (~3–4 weeks) |
| — | **Bitcoin Events × Pass × Merchant** | Scoping — GDPR, credential design, Madeira | Opus uncounted, extended thinking | Before Pass-A |
| — | **Pass-A** | Full Pass scope + Pass Wallet card | Opus uncounted | After Block 8 + Events session |
| — | **Session A (CDK mint)** | CDK mint architecture | Opus uncounted | After Block 8 |

---

## Ongoing action items

- **Action required (Rajesh):** Disconnect `share.refueler.io` from Cloudflare Pages
- **Action required (Rajesh):** Push `refueler-app` dev branch ← **CA-1 prerequisite**
- **Action required (Rajesh):** Send Mapbox coordinate accuracy email (drafted CC-84, in drafts)
- **Action required (Rajesh):** Provide Lightning address for Raj's Steakhouse for payment sim (Stage 3)
- **Action required (Rajesh):** Visit Apple Store — iPad 10.9″ portrait layout check (non-blocking, best effort)
- **Action required (Rajesh):** Set JWT expiry to **43200s (12h)** in Supabase dashboard → Authentication → JWT Settings before Stage 3 sim
- Upgrade Supabase to Pro when first real merchant goes live
- Upgrade Cloudflare Workers to Paid ($5/month) before production volume
- New Anthropic API key → rotate before csuite briefing reuse
- Magic link email Route B upgrade: when Supabase Pro activated, replace SMTP with Auth Hook Edge Function (`send-magic-link`)
- Lawyer briefing: draft written brief before appointment
- Float pre-load amount: TBD-Rajesh
- football-data.org API key: held by Rajesh, ready for Events intelligence layer session
- LNBits webhook payload shape → confirm with Ben Arc before Block 9
- Est. 2026 accent column → replace with Companies House reg on incorporation
- Docs ↔ UI sync rule: active — at every block close touching merchant terminal UI, confirm handover doc currency
- Mapbox Contribute: submit corrected coords for pilot venue POIs
- Auto-wake feature (queued): terminal awakens 30 min before configured opening time
- S-22b: confirm resolved or reinstate to snag list
