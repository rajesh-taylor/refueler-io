# Refueler Master Context — IO Design-A
*Updated: 2026-08-15 (Design-A — Opus uncounted. Two merchant handover documents built and committed: User Guide 6pp + Venue Keys 1pp. Commit f0157ef.)*
*Supersedes: MasterContext_IO_Onboarding-A*

---

## Session allocation
500 primary + 50 buffer = 550 total. Planning/Opus sessions uncounted.
**Block review sessions** — standing uncounted Opus at end of each block. Recalibrate priorities and session allocation.
Sessions used to Design-A: ~86 counted + uncounted planning sessions.

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
All CSS rationalisation sessions CSS-1 through CSS-7b closed. See SESSIONS for file status table.

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

**Files (committed f0157ef):**
- `docs/merchant-onboarding-v1.html` — User Guide, 6 A4 pages
- `docs/merchant-venue-keys-v1.html` — Venue Keys card, 1 A4 page

**Design rules:**
- Two standalone HTML files. Each prints as its own PDF independently.
- Gold on h2 top-borders (guide) and warn-banner left-border (keys) only
- Arrivals strip: single line, IBM Plex Mono, eyebrow 7pt / arrivals 9.5pt
- Warning banner on Venue Keys: full-width above the card, not inside it
- Version number in masthead body text only — never in footer
- Print footer removed from last page. Open in Chrome for cleanest PDF output (Safari injects decorations CSS cannot suppress).
- "Nothing stops this train." removed from all merchant-facing docs
- Per-merchant swap points: venue name, owner email (guide only), date. All sensitive values handwritten at handover.

**Page break structure (User Guide):**
- p.1: masthead + What Refueler is + What the terminal does
- p.2: Signing in + Your two PINs
- p.3: Opening your venue + End of day
- p.4: Taking a walk-in order + The arrivals strip
- p.5: The three views + Signing out + Support
- p.6: Venue details box + Get in Touch + incorporation stamp

**Docs ↔ UI sync rule (active):** At close of every block touching merchant terminal UI — "Does the handover document need updating?" If yes, queue an update session.

**S-23 dependency:** Signing Out section states sign-out in Queue + OPS views. If S-23 slips before first real handover, trim "Queue view" reference to OPS-only.

---

## Merchant terminal — design decisions locked

### Nav
- Default (no logo): Refueler wordmark (Satoshi 700, 16px, `#E4E2DC`) · divider · "MERCHANT TERMINAL" (IBM Plex Mono, 12px, `#C8C9CB`)
- Right: QUEUE·OPS·OWNER merged pill (42px) · separator · PAPER·CARBON pill

### Horizon strip
- Height: 64px · background `#1A1A1A` hardcoded (always dark, both themes)
- Station name: IBM Plex Mono 15px `#E4E2DC` · ETA: IBM Plex Mono 14px `#C8A96E`
- "DARWIN · LIVE" label hidden by default (CC-84)

### Order tiles
- `[ID] · [items]` single line · status badge right only
- PENDING gold · IN PREP `#7899D4` · READY `#3DCA7A`

### Portrait layout — S-16 (CC-84, locked)
- Option A: sidebar collapses to horizontal-scroll card strip above main. CSS-only.

### Sign-out buttons (CC-85)
- OPS and Owner sign-out: `btn-owner-signout` — red border + red text, fills red on hover.

---

## Supabase — schema state (post-CC-84)

**Migration cc84_walkin_schema applied 2026-08-13:**
- `merchant_orders.order_id` → nullable
- `merchant_orders.identifier TEXT`
- `merchant_orders.item_name TEXT`
- `merchant_orders.order_source TEXT DEFAULT 'lightning'`
- INSERT policy `merchant_orders_insert_own_venue`
- Steakhouse coords: `coords_lat = 51.5104`, `coords_lng = -0.0784`

**Pending migration (Onboarding-A):** `venue_partners` additions:
- `lightning_address TEXT`
- `onchain_address TEXT`
- `silent_payment_address TEXT`
- `mapbox_place_id TEXT`

**Onboarding pre-flight:** 21-sat test payment to `lightning_address` required. Merchant confirms receipt before go-live.

---

## PIN hash status — S-18 (security, pre-Block 5 Close)

PINs in `merchant_users` are SHA-256 hashed. Must upgrade to bcrypt/argon2 server-side via Edge Function before first real merchant goes live. Queued as S-18.

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
| S-18 | PIN hash upgrade: SHA-256 → bcrypt/argon2 server-side | High | Before first live merchant |
| S-22 | Email fallback link block — drop one more line above "Button not working…" text | Low | Future |
| S-23 | Staff have no sign-out path from queue view — OPS only | **High** | Next Sonnet session — pre-go-live |
| S-24 | apple-touch-icon + favicon missing — needed for tablet home screen bookmark | Medium | Go-live prep |

---

## Queued sessions — forward plan

| Session | Scope | Type | Status |
|---|---|---|---|
| ~~Design-A~~ | Merchant handover documents | Opus uncounted | ✅ Closed — f0157ef |
| **Block-5 Close** | Block 5 review and recalibration | Opus uncounted | **Next** |
| **Sim-Close** | Formal sign-off all 4 sim stages | Opus uncounted (up to 2) | Queued |
| **TDP-A** | Terminal Design Philosophy — audit, comparators, primitives | Opus uncounted | After Sim-Close |
| **TDP-B** | Terminal redesign — absorbs menu, events, NumoPay | Opus uncounted | After TDP-A |
| **TDP-C** | NumoPay fork alignment | Opus uncounted | After TDP-B |
| **S-23** | Queue view sign-out button | Sonnet counted | High — pre-go-live |
| **Privacy page update** | Sections 7, 8, 10 + merchant section + Legend free-tier | Sonnet counted | Queued |
| **Menu Management v1** | CSV import, time-based menus | Sonnet counted | After TDP-B |
| **PIN upgrade** | SHA-256 → bcrypt/argon2 | Sonnet counted | Before first live merchant |
| **Bitcoin Events × Pass × Merchant** | Scoping session | Opus uncounted, extended thinking | Before Pass-A |
| **Pass-A** | Full Pass scope + Pass Wallet card | Opus uncounted | After Block 8 + Events session |
| **NumoPay-A** | Fork review, API contract, BitChat research | Opus uncounted | After Block 5 sim-close |
| **Block 8** | Fiat → sats rewards | Sonnet counted | After Block 5 |
| **Events intelligence layer** | Football fixtures sidebar card, Darwin toggle | Sonnet counted | After Block-5 Close |
| **Owner tab doc tiles** | Amber/green download indicator for User Guide + Venue Keys | Sonnet counted | Post Sim-Close |
| **Changelog panel** | Reverse-chronological change list in Owner tab | Sonnet counted | Post Block-5 Close |
| **Design-A2** | Terminal screenshots in User Guide | Opus uncounted | After TDP-B (~3–4 weeks) |
| **Session A (CDK mint)** | CDK mint architecture | Opus uncounted | After Block 8 |
| **AD-2** | Share admin dashboard | Sonnet counted | Queued |

---

## Ongoing action items

- **Action required (Rajesh):** Disconnect `share.refueler.io` from Cloudflare Pages
- **Action required (Rajesh):** Push `refueler-app` dev branch
- **Action required (Rajesh):** Send Mapbox coordinate accuracy email (drafted CC-84)
- Upgrade Supabase to Pro when first real merchant goes live
- Upgrade Cloudflare Workers to Paid ($5/month) before production volume
- New Anthropic API key → rotate before csuite briefing reuse
- Magic link email Route B upgrade: when Supabase Pro activated, replace SMTP with Auth Hook Edge Function
- Lawyer briefing: draft written brief before appointment
- Float pre-load amount: TBD-Rajesh
- football-data.org API key: held by Rajesh, ready for Events intelligence layer session
- LNBits webhook payload shape → confirm with Ben Arc before Block 9
- Est. 2026 accent column → replace with Companies House reg on incorporation
- Docs ↔ UI sync rule: active from Design-A — at every block close touching merchant terminal UI, confirm handover doc currency
- Session lifetime check: confirm default Supabase session lifetime in next Sonnet session
- Mapbox Contribute: submit corrected coords for pilot venue POIs
- Auto-wake feature (queued): terminal awakens 30 min before configured opening time

---

## Design-A — session notes

**Date:** 2026-08-15 · Opus uncounted
**Commit:** `f0157ef` — 2 files, 821 insertions

**Two standalone print-ready HTML files produced:**

`docs/merchant-onboarding-v1.html` — User Guide
- 6 A4 pages in Chrome print
- Page breaks forced via `sec--newpage` class on Signing in (p.2), Opening your venue (p.3), Taking a walk-in order (p.4), The three views (p.5), Venue details box (p.6)
- Arrivals strip: single-line display, eyebrow 7pt, arrivals 9.5pt, vertical divider separator
- Gold on section h2 top-borders only — no other uses
- No print footer on final page
- Control bar hint: open in Chrome for cleanest PDF output

`docs/merchant-venue-keys-v1.html` — Venue Keys card
- 1 A4 page
- Warning banner full-width above card (not inside)
- Four handwriting fields with ruled lines (10mm single, 10mm double for long addresses)
- Closing: single line — `Support: support@refueler.io · Mon–Fri 7 am–6 pm · 2-hour reply`
- No version line in footer (version is in masthead body)

**Docs ↔ UI sync rule activated.** Next session: Block-5 Close (Opus uncounted).
