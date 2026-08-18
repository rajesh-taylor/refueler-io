# Refueler Master Context — IO CC-96
*Updated: 2026-08-18 (TDP-philosophy — Opus uncounted. Terminal design philosophy settled. Keystone definition locked. Horizon strip promoted to slot-based arrival-intelligence primitive. Sidebar removed. Ops card grid and single honest toggle locked. Accessibility principles locked. Luxury-calm register locked. Stamp placement and plumbing-agnostic architecture locked. Proxy pickup credential logged for Pass-A. TDP-B scope and gate list finalised.)*
*Supersedes: MasterContext_IO_CC95*

---

## Session allocation
500 primary + 50 buffer = 550 total. Planning/Opus sessions uncounted.
**Block review sessions** — standing uncounted Opus at end of each block. Recalibrate priorities and session allocation.
Sessions used to CC-96: ~94 counted + uncounted planning sessions.

---

## Project overview

Refueler is a Bitcoin-native privacy ecosystem. Products: Share (anonymous encrypted file transfer, live at `refueler.io/share/`), Legend (privacy-first block explorer, post-B9), consumer pre-order app (Fenchurch St line), merchant terminal (cafés and restaurants near stations — tablet, counter/kitchen), Pass (Lightning-native ticketing and venue access — own repo and Claude project), NumoPay fork (in-house order taking, Android, waiter/floor staff).

**Mission:** A Bitcoin-native privacy layer operating within UK jurisdictional law. Not a fintech product. Not a loyalty app. A Bitcoin world that works quietly, legally, and without surveillance.

**North star (internal only):** Come for privacy, stay for Bitcoin.

**Merchant profile (locked TDP-A):** Small, family-run independent businesses — cafés, coffee shops, delis, local restaurants. Known customers, community relationships, care over throughput. Not multi-national franchises. Not high-volume kitchens. Not transient-footfall retail. Refueler is not competing with Square/Toast/Lightspeed for that market and does not want to.

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

## Sim-Close — DECLARED COMPLETE (2026-08-17)

All four stages complete or non-blocking:

- Stage 1: ✅ CLOSED CC-91. `merchant-onboarding-process-v1.html`, commit `a5cc342`.
- Stage 2: ✅ PASSED CC-85 (browser). iPad check non-blocking — do before first real merchant.
- Stage 3: ✅ PASSED CC-92. Full payment rail confirmed.
- Stage 4: Non-blocking. Print when design is stable.

**Sim-Close deliverable:** `INCIDENT-PROTOCOL.md` produced. Placed in `refueler-io/docs/`.

---

## Pre-merchant gate list (updated CC-96)

| # | Gate | Severity | Notes |
|---|---|---|---|
| G-1 | **Merchant settlement wiring** | **Hard blocker** | `create-order` must invoice to `venue_partners.lightning_address`. Named TDP-B gate item. |
| G-2 | **Menu Management v1** | Hard blocker | Queued after TDP-B. |
| G-3 | **iPad physical check** | Should-do | Non-blocking for the declaration. Do before first real merchant. |
| G-4 | **Hardening-A** | ✅ CLEARED CC-94 | |
| G-5 | S-26 (orders→venue_partners FK) | ✅ CLEARED CC-94 | |

---

## Three-wallet simulation setup (confirmed Sim-Close)

- **WoS** (`trickdraw318@walletofsatoshi.com`) — merchant wallet. Invoice destination once G-1 is resolved.
- **Blink** (`fd2357fe-24ec-4173-8441-fc0f05722e9a`) — Refueler treasury. Currently the invoice destination (to change at G-1).
- **Minibits** — customer wallet. BOLT11-capable; correct test payer once WoS is the invoice destination.

---

## Stage 3 sim record (CC-92 — 2026-08-17)

Migration: `cc92_steakhouse_activate_lightning_address`
Order `baa8d71a`, merchant order `43e63ac5`, 21 sats, WoS paid, `blink-webhook` v15 fired, both rows updated `2026-08-17 10:16:18 UTC`. Terminal queue tile appeared within 15s poll. ✅

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
**Edge Function files** download as `[name]-index.ts` — always `mv` to `index.ts` before deploying.

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
**Abolished:** `localStorage` for theme · `rfTheme` · `html.carbon-mode` · `--accent-action` · `backdrop-filter` · `#F5820A` orange · `#F7F4EF` (stale Paper) · `#1E1F22` (stale Carbon)

---

## Magic link email — locked CC-85

Delivered via Resend SMTP. Subject: `Your sign-in link — Refueler`.
Future upgrade path (Route B): Auth Hook Edge Function when Supabase Pro activated.

---

## Merchant handover documents — locked Design-A, updated CC-91

**Files in `docs/`:**
- `merchant-onboarding-v1.html` — User Guide, 6 A4 pages, print-ready standalone (commit `f0157ef`)
- `merchant-venue-keys-v1.html` — Venue Keys card, 1 A4 page, print-ready standalone (commit `f0157ef`)
- `merchant-onboarding-process-v1.html` — Internal onboarding process doc (commit `a5cc342`)
- `INCIDENT-PROTOCOL.md` — Ecosystem-wide incident response protocol (Sim-Close)

**Design rules:**
- Standalone HTML files. Each prints independently as its own PDF.
- Gold on h2 top-borders only. Warn callouts use gold-wash left-border.
- All sensitive values (Owner PIN, wallet addresses) handwritten at handover — never typed.
- Staff PIN told verbally at handover — owner writes it in the User Guide venue details box.
- Open in Chrome for cleanest PDF output.
- "Nothing stops this train." removed from all merchant-facing docs — internal signature only.
- Docs will iterate. Do not print full runs until design is stable.

**Docs ↔ UI sync rule (active):** At close of every block touching merchant terminal UI — confirm handover doc currency.

---

## Merchant terminal — design philosophy locked (TDP-philosophy, CC-96)

### The keystone definition (locked CC-96)

The Refueler terminal is an *arrival instrument*, not an order-management system. Its one irreducible job is to tell a craftsperson that a particular customer is about to walk in, early enough to time the work to the moment. It does not manage the merchant's pace; it gives them the single piece of information they cannot get any other way — *when* — and then gets out of the way. If a surface does not help the merchant know who is coming, serve them well, or run their own shop on their own terms, it does not belong on this terminal.

### File locations (corrected TDP-A)
**HTML:** `src/merchant/index.html` (plain `.html`, not `.njk`)
**JS:** `src/merchant/merchant-tablet-logic.js`
**CSS:** `src/merchant/merchant-tablet-styles.css`
**Inline styles:** Darwin-row styles live in a `<style>` block in `index.html` `<head>`

*All previous references to `merchant-tablet.html` are incorrect. Do not restore that name.*

### Merchant profile (locked TDP-A)
Small, family-run independents. The cook is often the owner. The terminal is read at two feet. Design for care and craft, not throughput anxiety. The horizon strip is the moat — no KDS competitor has it. The terminal should feel like it is *with* the merchant, not driving them.

### Sidebar — removed (locked CC-96)
The sidebar is abolished. Its components are disposed of as follows:
- **Mapbox mini-map:** cut entirely
- **Active Site card:** cut from permanent chrome; owner context only if needed later
- **Queue Summary card:** cut — duplication of tile information
- **Darwin feed:** promoted fully into the horizon strip
- 340px reclaimed for the queue: larger tiles, bigger type, more air

### Horizon strip — slot-based arrival-intelligence primitive (locked CC-96)
- Always dark `#1A1A1A` · 64px height · both themes
- **Architecture:** slot-based primitive, not a Darwin component. Tenants provisioned at venue setup by `mapbox_place_id` proximity:
  - **Darwin/rail** — venues near a station
  - **Fixtures** (football-data.org, subscribed) — venues near stadia or sports centres
  - **Both** — venues in both catchments carry two rows or two segments
  - **Pass** (future) — stub only, pending dedicated Opus design session(s)
- Station name: IBM Plex Mono 15px `#E4E2DC` · ETA: gold `#C8A96E` · counts: `#A8A4A0`
- In Ops Mode the strip dims or minimises — merchant configuring, not watching arrivals
- **Philosophy:** provides information; lets the merchant choose their own response. Never creates urgency.

### Nav
- Default: Refueler wordmark (Satoshi 700, 16px, `#E4E2DC`) · divider · "MERCHANT TERMINAL" (IBM Plex Mono, 12px, `#C8C9CB`)
- Right: QUEUE·OPS·OWNER merged pill (42px, OWNER gold tint) · separator · PAPER·CARBON pill
- Portrait: nav-terminal-lbl and nav-divider hidden

### Order tiles
- `[ID] · [items]` single line · status badge right only
- PENDING gold · IN PREP `#7899D4` · READY `#3DCA7A`
- Status always doubled by word and position — never colour alone
- Tile: `background #26282C` · `border 0.5px solid #35373B` · `border-radius: 7px`
- **S-25:** Tile background hardcoded — resolves automatically with TDP-B token migration
- **Type sizing (locked CC-96):** Order identifier ≥18px, item name 14–16px minimum

### Stamp glyph (locked CC-96)
- **Trigger: FULFILLED (READY status).** Not paid.
- **Issuance: silent, passive.** Calm glyph settles onto tile on READY. No merchant action required.
- **Plumbing-agnostic:** identical visual regardless of LNURL-withdraw (v1) or Cashu NUT-00 (v2). The mint swap is a backend event; must never surface as a merchant-facing change.
- No animation that demands attention. No badge, no confetti.

### Ops panel — card grid (locked CC-96)
- **Single honest toggle:** Open / Closed. `active = false` stops new orders; queue always drains.
- **Honest copy:** "Closed — no new orders. Your current queue is unaffected."
- **Layout:** calm card grid, not toggle rows. Cards: Trading status, Lightning address, Staff access (placeholder), Menu (placeholder).
- No ghost copy on placeholder tiles. The grid grows as features land.
- `is_paused` column: not added until a real "pause queue, finish current" need is confirmed by live merchants.

### Accessibility principles (locked CC-96)
1. Legible at two feet without spectacles. Identifier ≥18px, item name 14–16px is the floor, not the target.
2. Status is never colour alone. Always doubled by word and position.
3. Nothing critical depends on hearing. Sound is a courtesy, never a channel.
4. No motion that demands. No flashing, no urgency timers.
5. Generous targets, forgiving taps. Big zones, confirmation before irreversible actions.
6. The terminal never implies the merchant is late. It informs; it does not judge.

### Luxury-calm register (locked CC-96)
- Restraint over density. The reclaimed 340px becomes air.
- Anticipation, not instruction. No coach-marks or persistent tooltips.
- Gold worn once, precisely, on pending status — never spread across chrome.
- **The terminal gets quieter and clearer under load, not louder.**
- It honours the craft. Information given; trust extended; merchant acts.
- **Register test:** It should behave like a good maître d' — present when needed, invisible when not, never flustered, always a half-step ahead, and unmistakably working for you rather than the other way round.

### Stamp metrics — reserved, not built (CC-96)
Privacy-preserving aggregate metrics possible from mint keyset state (stamps issued/redeemed/outstanding, customers near reward threshold) without individual tracking. Housed in Owner tab. Space reserved in TDP-B; data wired at Block 8 or post-mint. Not built now.

### Portrait layout — S-16 (CC-84, locked)
- Sidebar collapses to horizontal-scroll card strip above main (now moot — sidebar removed in TDP-B)
- `@media (orientation: portrait), (max-width: 820px)`

### TDP-B agenda items (finalised CC-96)
1. G-1 — Settlement wiring (hard blocker)
2. S-27 — Column restriction (security, pre-merchant)
3. Token migration (D-1, D-2, D-3 — includes S-25 fix)
4. Ops toggle model: single honest toggle, card-grid layout
5. Menu-item primitive spec
6. First-login welcome (venue name, merchant-identity copy, one-time)
7. Change Lightning address flow in Owner tab
8. Stamp glyph primitive (plumbing-agnostic, READY trigger)
9. Stamp metric space reserved (placeholder tile, no data)
10. Horizon strip slot primitive (Darwin + Fixtures + Pass stub)

---

## Terminal token drift — TDP-A findings (all fix in TDP-B)

| Finding | Live value | Canonical | Fix |
|---|---|---|---|
| Paper `--bg` | `#F7F4EF` | `#E8E2D8` | Token migration |
| Paper `--surface` | `#EDEAE4` | `#DAD4CA` | Token migration |
| Carbon `--bg` | `#1E1F22` | `#1A1A1A` | Token migration |
| Carbon `--surface` | `#26282C` | `#242424` | Token migration |
| Carbon `--inset-rule` | `#C8A96E` (gold) | `var(--border)` | Token migration |
| Flash-guard / theme-color | `#1A1A1A` | `#1A1A1A` | ✅ Already correct |
| `backdrop-filter` on `.view-confirm-overlay` (L382) | present | abolished | Drop; delete dead block |
| `backdrop-filter` on `.owner-overlay` (L1239) | present | abolished | Replace with solid scrim |
| Token vocabulary | `--text-*` + `--c-text-*` aliases | `--text-*` survivor (terminal-native) | Drop `--c-text-*` aliases |
| Font alias prefix | `--mono/--sans/--serif/--heading` | `--font-mono` etc. on web | Document as known divergence; align later |
| `SB_KEY` hardcoded in `logic.js` | line 2 | Should rotate cleanly | Document: key rotation requires manual edit |

---

## Pass — proxy pickup credential (logged CC-96, Pass-A scope)

The 6-digit code / NFC tap is a **proxy pickup credential**: payer authorises a named or bearer pickup; the person at the counter presents the code or tap to claim the order. Three confirmed use cases:

1. **Gift / refer-a-friend:** Purchaser buys a coffee for a friend; friend presents code to collect.
2. **Delegated pickup:** Father pays via app; son presents code at counter.
3. **Pub rounds:** One person orders and pays for a round; designated collector presents code at bar.

This is a Pass primitive, not a stamp primitive. First non-commuter use case demonstrably better than cash or card. Log against Pass-A scope and Bitcoin Events × Pass × Merchant arc.

---

## Supabase — schema state (post-CC-94, confirmed TDP-A)

**venue_partners RLS policies (confirmed live TDP-A):**

| Policy | Cmd | Scope |
|---|---|---|
| `admin_full_access_venue_partners` | ALL | authenticated where role = admin |
| `partners_service_write` | ALL | service_role only |
| `franchise_hq_select_own_group_venues` | SELECT | franchise_hq, own franchise_group_id |
| `merchant_select_own_venue` | SELECT | merchant/franchise_branch/independent_owner, own venue_id |
| `deny_non_admin_update_protected_columns` | UPDATE | admin only — PERMISSIVE, not RESTRICTIVE (naming misleading) |
| `venue_partners_franchise_hq_update` | UPDATE | franchise_hq, own franchise_group_id |
| `venue_partners_merchant_pause_update` | UPDATE | merchant/franchise_branch/independent_owner, own venue_id |

**Security note (S-27):** `venue_partners_merchant_pause_update` has no column-level restriction — it permits writing wallet address columns on own venue row. TDP-B must add column-level UPDATE grant restriction: only `active` and `pause_reason` writable via merchant auth path.

**`deny_non_admin_update_protected_columns` policy note:** PERMISSIVE — grants admins UPDATE, does not deny others via RLS. Wallet address write protection for non-admins rests on Hardening-A grant restrictions only.

**Confirmed post-CC-94 state (unchanged):**
- `merchant_users`: anon holds zero grants. authenticated holds column-level SELECT on 6 safe columns only. bcrypt columns service_role-only.
- `venue_partners`: anon holds zero grants. authenticated holds SELECT + UPDATE only (table level). Column restriction is TDP-B item S-27.
- `orders_venue_id_fkey` FK present.
- Deprecated tables (`log_entries`, `live_transactions`, `sessions`) purged.
- Raj's Steakhouse: staff PIN 1234, owner PIN 8888, active true, `lightning_address = 'trickdraw318@walletofsatoshi.com'`
- JWT session lifetime: 43200s (12h)

**Columns confirmed present on `venue_partners`:** `active` (boolean), `pause_reason` (text), `lightning_address` (text), `onchain_address` (text), `silent_payment_address` (text)

---

## PIN auth — S-18 (CLOSED CC-90)

Architecture locked. `verify-pin` v2, bcryptjs, rate limit 5/5min.
SHA-256 legacy columns dropped CC-94. ✅

---

## Dev console — re-scope pending

Pre-pivot telemetry tables dropped CC-94. Re-scope around real operational metrics: orders, Blink balance, active venue count, Edge Function invocations, future product telemetry placeholders.

---

## Incident response — locked Sim-Close

**Protocol:** `INCIDENT-PROTOCOL.md` in `refueler-io/docs/`.
**Internal channel:** Signal. **External:** Tuta `hello@refueler.io`. **Public:** `refueler.io/status/` only.
**Core rule:** Internal → contain → public.

---

## Test accounts

| Email | Role | Notes |
|---|---|---|
| `steakhouse@rajeshtaylor.com` | `independent_owner` | Raj's Steakhouse · venue_id `c476df85` · staff PIN 1234 · owner PIN 8888 · active · lightning_address: trickdraw318@walletofsatoshi.com |
| `moniker@rajeshtaylor.com` | `franchise_hq` | Moniker franchise |
| `dev@refueler.io` | `admin` | Admin / dev console |

---

## Edge Functions (deployed)

| Function | Version | Purpose | verify_jwt |
|---|---|---|---|
| `blink-webhook` | v15 | Blink direct callback | `false` (explicit) |
| `create-order` | v9 | Consumer app → Blink BOLT11 invoice | `true` |
| `blink-balance` | v5 | Proxies Blink GraphQL balance | `true` |
| `rail-signal-poll` | v10 | Darwin feed poller, pg_cron triggered | `true` |
| `verify-pin` | v2 | bcrypt PIN verification, rate-limit 5/5min | `false` (explicit) |

**Blink:** Active API key `refueler-cc68` · BTC wallet: `fd2357fe-24ec-4173-8441-fc0f05722e9a`

---

## Snag list — active

| ID | Item | Priority | Target |
|---|---|---|---|
| S-22 | Email fallback link block — drop one more line above "Button not working…" text | Low | Future email touch session |
| S-25 | Order tile Paper mode — tile background hardcoded `#26282C`. Resolves with TDP-B token migration. | Low | TDP-B |
| S-27 | `venue_partners_merchant_pause_update` — no column restriction. Add column-level UPDATE grant: `active` + `pause_reason` only. | **Medium** | TDP-B (pre-merchant) |
| S-doc-1 | Process doc footer wraps to two lines in Chrome PDF | Low | Next process doc iteration |

**Permanently closed:**
~~S-12~~ · ~~S-14~~ · ~~S-18~~ · ~~S-23~~ · ~~S-24~~ · ~~S-26~~

---

## Queued sessions — forward plan (post-TDP-philosophy)

| # | Session | Scope | Type | Status |
|---|---|---|---|---|
| 1 | **TDP-B** | Terminal redesign execution — all 10 gate items | Sonnet counted | **Next** |
| 2 | **TDP-C** | NumoPay fork alignment | Opus uncounted | After TDP-B |
| — | **Horizon strip / Pass tenant Opus** | Slot architecture + Pass-as-tenant design if needed before TDP-B | Opus uncounted | Flag at TDP-B open |
| — | **Menu Management v1** | CSV import, time-based menus | Sonnet counted | After TDP-B |
| — | **CA-1** | Consumer App Track. **Prerequisite: dev branch push.** | Opus uncounted | After TDP-C |
| — | **NumoPay-A** | Fork review, API contract | Opus uncounted | After TDP-C |
| — | **Block 8** | Fiat → sats rewards | Sonnet counted | After Menu Management v1 |
| — | **Pass-A** | Proxy pickup credential, Bitcoin Events × Pass × Merchant, credential structure | Opus uncounted | After TDP-C |
| — | **Events intelligence layer** | Football fixtures, Darwin toggle, horizon strip tenants | Sonnet counted | Gap |
| — | **Privacy page update** | Sections 7, 8, 10 + merchant GDPR + Resend Article 30 | Sonnet counted | Gap |
| — | **Share API planning** | Pay-per-use API v1 | Opus uncounted | Before AD-2 |
| — | **AD-2** | Share admin dashboard | Sonnet counted | After Share API planning |
| — | **Session A (CDK mint)** | CDK mint architecture | Opus uncounted | After Block 8 |
| — | **Status page** | `refueler.io/status/` | Sonnet counted | After first real merchant |

---

## Ongoing action items

- **Action required (Rajesh):** Disconnect `share.refueler.io` from Cloudflare Pages
- **Action required (Rajesh):** Push `refueler-app` dev branch ← CA-1 prerequisite
- **Action required (Rajesh):** Send Mapbox coordinate accuracy email (drafted CC-84, in drafts)
- **Action required (Rajesh):** Visit Apple Store — iPad 10.9″ portrait layout check (G-3, before first real merchant)
- Upgrade Supabase to Pro when first real merchant goes live
- Upgrade Cloudflare Workers to Paid ($5/month) before production volume
- New Anthropic API key → rotate before csuite briefing reuse
- Magic link email Route B upgrade: when Supabase Pro activated
- Lawyer briefing: draft written brief before appointment
- football-data.org API key: held by Rajesh, ready for Events intelligence layer session
- LNBits webhook payload shape → confirm with Ben Arc before Block 9
- Est. 2026 accent column → replace with Companies House reg on incorporation
- Docs ↔ UI sync rule: active
- `venue_partners.active` toggle — live in OPS panel via `venue_partners_merchant_pause_update` policy (S-27 column restriction TDP-B)
