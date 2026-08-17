# Refueler Master Context — IO CC-92
*Updated: 2026-08-17 (CC-92 — Sonnet counted. Stage 3 payment simulation PASSED. Migration cc92_steakhouse_activate_lightning_address applied. No code commits.)*
*Supersedes: MasterContext_IO_CC91*

---

## Session allocation
500 primary + 50 buffer = 550 total. Planning/Opus sessions uncounted.
**Block review sessions** — standing uncounted Opus at end of each block. Recalibrate priorities and session allocation.
Sessions used to CC-92: ~92 counted + uncounted planning sessions.

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

**Shipped post-close:** Queue sign-out S-23 (CC-88) ✅ · favicon/apple-touch-icon/PWA metas S-24 (CC-88) ✅ · S-18 PIN auth server-side (CC-89/CC-90) ✅ · Internal onboarding process doc (CC-91) ✅

---

## Sim-Close — stages

- Stage 1: Internal onboarding process doc — ✅ **CLOSED CC-91.** `merchant-onboarding-process-v1.html`, commit `a5cc342`.
- Stage 2: Operational sim — ✅ PASSED CC-85 (browser). iPad check non-blocking.
- Stage 3: Payment sim — ✅ **PASSED CC-92.** Full run 2026-08-17. All 7 criteria met. See sim record below.
- Stage 4: Physical handover — non-blocking. Print when stable.

**All four stages complete or non-blocking. Sim-Close Opus session to follow.**

---

## Stage 3 sim record (CC-92 — 2026-08-17)

**Migration:** `cc92_steakhouse_activate_lightning_address`
- `venue_partners`: `active = true`, `lightning_address = 'trickdraw318@walletofsatoshi.com'`
- venue_id: `c476df85-5572-49bd-a476-a908519a9a23` (Raj's Steakhouse)

**Run:**
- Order placed via curl with `steakhouse@rajeshtaylor.com` session JWT
- `order_id`: `baa8d71a-7326-4f24-8773-48e919a870af`
- `merchant_order_id`: `43e63ac5-bbc8-47c4-8bdc-4475c3a79826`
- Invoice: 21 sats, BOLT11 returned clean from `create-order` v9
- Payment: WoS wallet (`trickdraw318@walletofsatoshi.com`), 21 sats sent
- `blink-webhook` v15 fired, both rows updated at `2026-08-17 10:16:18 UTC`
- `merchant_orders`: `status=pending`, `payment_status=paid`, `paid_at` set ✓
- `orders`: `status=confirmed`, `payment_status=paid`, `settled_sats=21`, `routing_fee_sats=0` ✓
- Terminal Queue: order tile `#43E63A · Order`, `PENDING` badge gold, appeared within 15s poll window ✓
- Pending orders: 1 · Orders today: 1 · counters correct ✓
- Paper and Carbon themes both rendered tile correctly (S-25 noted for Paper tile colour)

**Architectural note:** `create-order` uses Refueler Blink wallet for invoice generation. `lightning_address` on `venue_partners` is stored but not yet wired into invoice creation — merchant settlement address is a post-TDP architectural decision. Stage 3 correctly scoped as backend payment rail proof.

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
**Abolished:** `localStorage` for theme · `rfTheme` · `html.carbon-mode` · `--accent-action` · `backdrop-filter` · `#F5820A` orange

---

## Magic link email — locked CC-85

Delivered via Resend SMTP. Subject: `Your sign-in link — Refueler`.
Future upgrade path (Route B): Auth Hook Edge Function when Supabase Pro activated.

---

## Merchant handover documents — locked Design-A, updated CC-91

**Files in `docs/`:**
- `merchant-onboarding-v1.html` — User Guide, 6 A4 pages, print-ready standalone (commit `f0157ef`)
- `merchant-venue-keys-v1.html` — Venue Keys card, 1 A4 page, print-ready standalone (commit `f0157ef`)
- `merchant-onboarding-process-v1.html` — Internal onboarding process doc, 8 sections, [R]/[AM] role tags (commit `a5cc342`) ✅

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

## Merchant terminal — design decisions locked

### Nav
- Default (no logo): Refueler wordmark (Satoshi 700, 16px, `#E4E2DC`) · divider · "MERCHANT TERMINAL" (IBM Plex Mono, 12px, `#C8C9CB`)
- Right: QUEUE·OPS·OWNER merged pill (42px) · separator · PAPER·CARBON pill
- Portrait: nav-terminal-lbl and nav-divider hidden to save space

### Horizon strip
- Height: 64px · background `#1A1A1A` hardcoded (always dark, both themes)
- Station name: IBM Plex Mono 15px `#E4E2DC` · ETA: IBM Plex Mono 14px `#C8A96E`
- "DARWIN · LIVE" label hidden by default (CC-84)
- All arrival counts: `#A8A4A0` uniform — no gold on any count

### Order tiles
- `[ID] · [items]` single line · status badge right only
- PENDING gold · IN PREP `#7899D4` · READY `#3DCA7A`
- Tile: `background #26282C` · `border 0.5px solid #35373B` · `border-radius: 7px`
- **S-25 (logged CC-92):** Tile background hardcoded — does not adapt to Paper theme. Fix pending.

### Portrait layout — S-16 (CC-84, locked)
- Option A: sidebar collapses to horizontal-scroll card strip above main. CSS-only.
- `@media (orientation: portrait), (max-width: 820px)`

### TDP-B agenda items
- First-login welcome screen: venue name + brief orientation, one-time only
- "Change Lightning address" flow in Owner tab with Venue Keys reprint prompt

---

## Supabase — schema state (post-CC-92)

**Migration CC-92:** `cc92_steakhouse_activate_lightning_address`
- Raj's Steakhouse: `active = true`, `lightning_address = 'trickdraw318@walletofsatoshi.com'`

**Key state (unchanged from CC-90/CC-91 except above):**
- `merchant_users_safe` view: `id, user_id, venue_id, role, created_at`
- `merchant_users`: `staff_pin_bcrypt` + `owner_pin_bcrypt` (bcrypt wf12) live
- `venue_partners`: `lightning_address`, `onchain_address`, `silent_payment_address`, `mapbox_place_id` columns live
- Raj's Steakhouse: staff PIN 1234, owner PIN 8888, coords live, active true

**JWT session lifetime:** 43200s (12h) — confirmed set in Supabase dashboard CC-92.

---

## PIN auth — S-18 (CLOSED CC-90)

Architecture locked. `verify-pin` v2, bcryptjs, rate limit 5/5min.
**Cleanup pending (post-Sim-Close):** Remove `staff_pin_hash` + `owner_pin_hash` columns.

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
| S-25 | Order tile Paper mode — tile background hardcoded `#26282C`, does not adapt to Paper theme. Use `--surface`/`--surface-raised` tokens. Carbon: correct. Paper: dark tile on light bg. | Low | Next merchant terminal CSS touch |
| S-doc-1 | Process doc footer wraps to two lines in Chrome PDF | Low | Next process doc iteration |

**Permanently closed:**
- ~~S-12~~ `car_park_occupancy` strip · ~~S-14~~ Costa label · ~~S-18~~ PIN auth · ~~S-23~~ Queue sign-out · ~~S-24~~ favicon/PWA metas

**Note on S-22b** (button top-border missing on iOS Mail): confirm resolved or reinstate.

---

## Queued sessions — forward plan (post-CC-92)

| # | Session | Scope | Type | Status |
|---|---|---|---|---|
| 1 | **Sim-Close** | Formal sign-off all 4 stages + INCIDENT-PROTOCOL.md | Opus uncounted (≤2) | **Next** |
| 2 | **TDP-A** | Terminal Design Philosophy — audit, comparators, primitives | Opus uncounted | After Sim-Close |
| 3 | **TDP-B** | Terminal redesign — menu, events, NumoPay | Opus uncounted | After TDP-A |
| 4 | **TDP-C** | NumoPay fork alignment | Opus uncounted | After TDP-B |
| — | **Menu Management v1** | CSV import, time-based menus | Sonnet counted | After TDP-B |
| — | **CA-1 — Consumer App Track** | Opus scoping — end-to-end commuter flow. **Prerequisite: dev branch push.** | Opus uncounted | After TDP-C |
| — | **NumoPay-A** | Fork review, API contract, BitChat research | Opus uncounted | After TDP-C |
| — | **Block 8** | Fiat → sats rewards | Sonnet counted | After Menu Management v1 |
| — | **Events intelligence layer** | Football fixtures, Darwin toggle, horizon strips | Sonnet counted | Gap — no hard dependency |
| — | **Privacy page update** | Sections 7, 8, 10 + merchant + Legend free-tier | Sonnet counted | Gap — no dependencies |
| — | **Hardening-A** | Supabase-wide RLS + anon grant surface audit | Opus uncounted | After Sim-Close |
| — | **Share API planning** | Pay-per-use API, photographer/legal v1 | Opus uncounted | Before AD-2 |
| — | **AD-2** | Share admin dashboard | Sonnet counted | After Share API planning |
| — | **Session A (CDK mint)** | CDK mint architecture | Opus uncounted | After Block 8 |

---

## Ongoing action items

- **Action required (Rajesh):** Disconnect `share.refueler.io` from Cloudflare Pages
- **Action required (Rajesh):** Push `refueler-app` dev branch ← CA-1 prerequisite
- **Action required (Rajesh):** Send Mapbox coordinate accuracy email (drafted CC-84, in drafts)
- **Action required (Rajesh):** Visit Apple Store — iPad 10.9″ portrait layout check (non-blocking)
- Upgrade Supabase to Pro when first real merchant goes live
- Upgrade Cloudflare Workers to Paid ($5/month) before production volume
- New Anthropic API key → rotate before csuite briefing reuse
- Magic link email Route B upgrade: when Supabase Pro activated
- Lawyer briefing: draft written brief before appointment
- football-data.org API key: held by Rajesh, ready for Events intelligence layer session
- LNBits webhook payload shape → confirm with Ben Arc before Block 9
- Est. 2026 accent column → replace with Companies House reg on incorporation
- Docs ↔ UI sync rule: active
- **Post-Sim-Close:** Remove `staff_pin_hash` + `owner_pin_hash` columns
- **Post-Sim-Close:** `venue_partners.active` toggle — add to Command Centre or Owner tab
