# Refueler Master Context — IO Block-5 Close
*Updated: 2026-08-16 (Block-5 Close — Opus uncounted. Block 5 formally reviewed. Go-live pressure removed. Sim-Close stages redefined. Session queue reordered. S-12 and S-14 permanently closed. BRIDGE v4.2 additions logged.)*
*Supersedes: MasterContext_IO_Design-A*

---

## Session allocation
500 primary + 50 buffer = 550 total. Planning/Opus sessions uncounted.
**Block review sessions** — standing uncounted Opus at end of each block. Recalibrate priorities and session allocation.
Sessions used to Block-5 Close: ~86 counted + uncounted planning sessions.

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

London merchants are experienced operators with expensive overheads. They will not give time to a startup unless the product is polished. Gaps in design, UX, payments depth, and menu management are too significant to gloss over. Foundational work comes first.

**What shipped:** Terminal nav/UI, portrait layout, walk-in overlay, New Order bar, magic-link email (Resend SMTP), first passing browser sim (CC-85), Stages 0–7 onboarding flow, User Guide (6pp), Venue Keys card (1pp).

**What didn't ship (moved to queue):** Internal onboarding process doc (new Stage 1 sim deliverable), PIN auth server-side (S-18), Queue sign-out (S-23), touch icons (S-24), schema migration (4 cols on `venue_partners`), payment sim (Stage 3), physical print test (Stage 4 — non-blocking).

---

## Sim-Close — redefined stages (Block-5 Close)

Sim-Close is not a pre-go-live gate. It is a quality checkpoint. Go-live is a separate, later decision that happens when the product is genuinely ready.

**Stage 1 — Internal onboarding process doc.**
A third internal document (not merchant-facing) covering the exact steps to add a new venue partner and verify the merchant user is on the DB. Lives alongside User Guide and Venue Keys but is for Rajesh and future staff only. To be produced in a dedicated short session or bundled with the schema migration session.

**Stage 2 — Operational sim.**
PASSED (CC-85, browser). Physical iPad check (Apple Store visit) is a non-blocking verification — Rajesh will report back if anything is bad. Not a gate.

**Stage 3 — Payment sim.**
FAILED — not yet run inside the Block 5 terminal build. Standalone session. Rajesh to provide a Lightning address for Raj's Steakhouse. Full cycle: Blink BOLT11 invoice → settlement → webhook → `merchant_orders` → terminal. Gated on schema migration landing first (`lightning_address` column required).

**Stage 4 — Physical handover.**
Non-blocking. Rajesh will print when ready. HTML/PDF files are the deliverable. Docs will iterate several times before warranting a print run.

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

## Supabase — schema state (post-CC-84)

**Migration cc84_walkin_schema applied 2026-08-13:**
- `merchant_orders.order_id` → nullable
- `merchant_orders.identifier TEXT`
- `merchant_orders.item_name TEXT`
- `merchant_orders.order_source TEXT DEFAULT 'lightning'`
- INSERT policy `merchant_orders_insert_own_venue`
- Steakhouse coords: `coords_lat = 51.5104`, `coords_lng = -0.0784`

**Pending migration (next Sonnet session — highest priority):** `venue_partners` additions:
- `lightning_address TEXT`
- `onchain_address TEXT`
- `silent_payment_address TEXT`
- `mapbox_place_id TEXT`

Also to bundle in same session: confirm default Supabase session lifetime (one-line query).

**Onboarding pre-flight:** 21-sat test payment to `lightning_address` required. Gated on schema migration. 1 sat will fail (fee > amount) — 21 sats confirmed minimum.

---

## PIN hash status — S-18

PINs in `merchant_users` are SHA-256 hashed (64-char hex, browser-native `crypto.subtle`). Not plaintext, but SHA-256 is a fast hash — wrong for PIN storage.

**Architecture note (Block-5 Close):** This is not just a hash swap. PIN verification is currently client-side. Moving to bcrypt/argon2 done correctly means verification moves server-side to an Edge Function (`verify_jwt: false`, external-facing), introducing a round-trip and requiring rate-limiting. **Scope S-18 as "move PIN auth server-side" — not "swap the hash function."** Dedicated Sonnet session before first real merchant.

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
| S-23 | Staff have no sign-out path from queue view | **High** | Bundle with S-24 — next small-touches Sonnet session |
| S-24 | apple-touch-icon + favicon missing — needed for tablet home screen bookmark | High | Bundle with S-23 |

**Permanently closed (Block-5 Close):**
- ~~S-12~~ `car_park_occupancy` — permanently removed. Strip from FEEDS array on next `rail-signal-poll` touch and never re-add.
- ~~S-14~~ `Costa Coffee HQ` category label — permanently closed. Fix on next `rail-signal-poll` touch.

**Note on S-22b** (button top-border missing on iOS Mail): was present in earlier logs, absent from Design-A active list. Confirm resolved or reinstate.

---

## Share — platform notes (logged Block-5 Close)

**Pay-per-use API (planning — pre-AD-2):**
A metered pay-per-use Share API is scoped ahead of AD-2. Initial v1 segments: **professional photographers** (deliver large shoots to clients who needn't hold an account) and **legal** (transfer survives sender closing laptop; recipient needn't be sophisticated — the two-axis category, AP-7). Staging: v1 metered API for these segments → v2 broaden → v3 white-label option (partner-branded Share). **Recipient flywheel:** every anonymous recipient is a latent sender — the download page is a growth asset, not a dead end. Full plan belongs in a dedicated Share API planning session (queue after foundational terminal work).

**Safari upload ceiling (constraint):**
Safari imposes an effective ~1.5 GB real-world ceiling on the current in-memory upload path, well below the advertised 4 GB free-tier figure. **Fix:** chunked streaming encryption (encrypt-and-upload per chunk rather than whole-file in memory) lifts the ceiling toward the true tier limit. **Copy implication:** do not headline large-file capability on Safari; the "4 GB free" claim must not imply a 4 GB Safari upload works today. Reconcile tier figure with Safari reality in any Share marketing copy — honesty-scope rule applies.

---

## Queued sessions — forward plan (reordered Block-5 Close)

| Session | Scope | Type | Status |
|---|---|---|---|
| ~~Block-5 Close~~ | Block 5 review and recalibration | Opus uncounted | ✅ Closed |
| **1. Schema migration** | 4 cols on `venue_partners` + session-lifetime check | Sonnet counted | **Next** |
| **2. S-23 + S-24 bundle** | Queue sign-out button + apple-touch-icon + favicon | Sonnet counted | Queued |
| **3. S-18 — PIN auth server-side** | Move PIN verification to Edge Function, bcrypt/argon2 | Sonnet counted | Queued |
| **4. Internal onboarding process doc** | Stage 1 sim deliverable — internal staff doc for adding a venue partner | Sonnet counted | Bundle with schema or own short session |
| **5. Payment sim — Stage 3** | Full Blink invoice → settlement → webhook → terminal cycle | Sonnet counted | After schema migration lands |
| **6. TDP-A** | Terminal Design Philosophy — audit, comparators, Refueler primitives | Opus uncounted | After Stage 3 sim |
| **7. TDP-B** | Terminal redesign — absorbs menu, events, NumoPay cleanly | Opus uncounted | After TDP-A |
| **8. TDP-C** | NumoPay fork design alignment | Opus uncounted | After TDP-B |
| **Menu Management v1** | CSV import, time-based menus | Sonnet counted | After TDP-B |
| **NumoPay-A** | Fork review, API contract, BitChat research | Opus uncounted | After TDP-C |
| **Block 8** | Fiat → sats rewards | Sonnet counted | After Menu Management v1 |
| **Events intelligence layer** | Football fixtures sidebar card, Darwin toggle, owner-selectable horizon strips | Sonnet counted | After Block-5 Close (can run in parallel with TDP track) |
| **Privacy page update** | Sections 7, 8, 10 + merchant section + Legend free-tier | Sonnet counted | Any gap — no dependencies |
| **Sim-Close** | Formal sign-off all 4 sim stages | Opus uncounted (≤2) | After Stage 3 sim passes + internal doc produced |
| **Share API planning** | Pay-per-use API design, photographer/legal v1 segments, v1/v2/v3 staging | Opus uncounted | Before AD-2 |
| **AD-2** | Share admin dashboard | Sonnet counted | After Share API planning |
| **Owner tab doc tiles** | Amber/green download indicator for User Guide + Venue Keys | Sonnet counted | Post Sim-Close |
| **Changelog panel** | Reverse-chronological change list in Owner tab | Sonnet counted | Post Sim-Close |
| **Design-A2** | Terminal screenshots in User Guide (post TDP-B) | Opus uncounted | ~3–4 weeks after TDP-B |
| **Bitcoin Events × Pass × Merchant** | Scoping — GDPR, privacy pitch, credential design, Madeira angle | Opus uncounted, extended thinking | Before Pass-A |
| **Pass-A** | Full Pass scope + Pass Wallet card | Opus uncounted | After Block 8 + Events session |
| **Session A (CDK mint)** | CDK mint architecture | Opus uncounted | After Block 8 |

---

## Ongoing action items

- **Action required (Rajesh):** Disconnect `share.refueler.io` from Cloudflare Pages
- **Action required (Rajesh):** Push `refueler-app` dev branch
- **Action required (Rajesh):** Send Mapbox coordinate accuracy email (drafted CC-84, in drafts)
- **Action required (Rajesh):** Provide Lightning address for Raj's Steakhouse for payment sim (Stage 3)
- **Action required (Rajesh):** Visit Apple Store — iPad 10.9″ portrait layout check (non-blocking, best effort)
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

---

## Block-5 Close — session notes

**Date:** 2026-08-16 · Opus uncounted

**Key decisions:**
- Go-live pressure permanently removed. Block 5 closed as "capability complete." First real merchant goes live when the product is ready — no schedule.
- Sim-Close is a quality checkpoint, not a go-live gate. Four stages redefined (see above).
- Stage 2 (operational) passes browser. iPad is a check, not a gate.
- Stage 3 (payment) is a standalone Sonnet session after schema migration. Rajesh to provide Lightning address.
- Stage 4 (physical handover) is non-blocking — print when stable.
- S-12 (`car_park_occupancy`) permanently closed. Strip on next `rail-signal-poll` touch.
- S-14 (Costa label) permanently closed. Fix on next `rail-signal-poll` touch.
- S-18 scoped as architecture move: PIN auth server-side, not just a hash swap.
- S-23 and S-24 bundled into one Sonnet session.
- Schema migration promoted to next session (highest priority — unblocks Stage 3 and onboarding data capture).
- TDP track moved after Stage 3 sim, not before. Go live on current terminal design; TDP refines it.
- Share API planning session added to queue (pre-AD-2). Safari ceiling constraint logged.
- Internal onboarding process doc added as Stage 1 sim deliverable (third internal document).
- BRIDGE bumped to v4.2 with Share platform notes added.
