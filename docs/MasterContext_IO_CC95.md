# Refueler Master Context — IO CC-95
*Updated: 2026-08-18 (TDP-A — Sonnet counted. Terminal audit against live src/merchant/ files. Eight drift findings catalogued. One security gap (S-27) added. TDP-B gate list produced. Opus design-philosophy session queued.)*
*Supersedes: MasterContext_IO_CC94*

---

## Session allocation
500 primary + 50 buffer = 550 total. Planning/Opus sessions uncounted.
**Block review sessions** — standing uncounted Opus at end of each block. Recalibrate priorities and session allocation.
Sessions used to CC-95: ~94 counted + uncounted planning sessions.

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
- Stage 3: ✅ PASSED CC-92. Full payment rail confirmed. See Stage 3 sim record below.
- Stage 4: Non-blocking. Print when design is stable.

**Sim-Close deliverable:** `INCIDENT-PROTOCOL.md` produced. Placed in `refueler-io/docs/`. Supersedes `legend-incident-protocol.md` for ecosystem-wide matters.

---

## Pre-merchant gate list (updated CC-95)

| # | Gate | Severity | Notes |
|---|---|---|---|
| G-1 | **Merchant settlement wiring** | **Hard blocker** | `create-order` invoices to Refueler's Blink wallet. For a real merchant this is Model A — forbidden by architecture. `venue_partners.lightning_address` is stored but not yet in the invoice path. `create-order` must invoice to the merchant's address before any real merchant takes a real order. Named TDP-B gate item. |
| G-2 | **Menu Management v1** | Hard blocker | Real venues need real menus. Queued after TDP-B. |
| G-3 | **iPad physical check** | Should-do | Non-blocking for the declaration. Do before first real merchant. |
| G-4 | **Hardening-A** | ✅ CLEARED CC-94 | Six migrations applied. |
| G-5 | S-26 (orders→venue_partners FK) | ✅ CLEARED CC-94 | FK added. |

---

## Three-wallet simulation setup (confirmed Sim-Close)

- **WoS** (`trickdraw318@walletofsatoshi.com`) — merchant wallet. Invoice destination once G-1 is resolved.
- **Blink** (`fd2357fe-24ec-4173-8441-fc0f05722e9a`) — Refueler treasury. Currently the invoice destination (to change at G-1).
- **Minibits** — customer wallet. BOLT11-capable; correct test payer once WoS is the invoice destination.

---

## Stage 3 sim record (CC-92 — 2026-08-17)

Migration: `cc92_steakhouse_activate_lightning_address`
Order `baa8d71a`, merchant order `43e63ac5`, 21 sats, WoS paid, `blink-webhook` v15 fired, both rows updated `2026-08-17 10:16:18 UTC`. Terminal queue tile appeared within 15s poll. ✅

**Architectural note:** `create-order` uses Refueler Blink wallet. Merchant `lightning_address` stored but not yet in invoice path. Post-TDP decision (G-1).

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

## Merchant terminal — design decisions locked

### File locations (corrected TDP-A)
**HTML:** `src/merchant/index.html` (plain `.html`, not `.njk`)
**JS:** `src/merchant/merchant-tablet-logic.js`
**CSS:** `src/merchant/merchant-tablet-styles.css`
**Inline styles:** Darwin-row styles live in a `<style>` block in `index.html` `<head>` — third style location, uses `--text-primary/secondary/tertiary` vocabulary consistently.

*All previous references to `merchant-tablet.html` are incorrect. Do not restore that name.*

### Merchant profile (locked TDP-A)
Small, family-run independents. The cook is often the owner. The "kitchen" may be four feet from the counter. The terminal is read at two feet, not eight. Design for care and craft, not throughput anxiety. The horizon strip is the moat — no KDS competitor has it. The terminal should feel like it is *with* the merchant, not driving them.

### Nav
- Default (no logo): Refueler wordmark (Satoshi 700, 16px, `#E4E2DC`) · divider · "MERCHANT TERMINAL" (IBM Plex Mono, 12px, `#C8C9CB`)
- Right: QUEUE·OPS·OWNER merged pill (42px) · separator · PAPER·CARBON pill
- Portrait: nav-terminal-lbl and nav-divider hidden to save space

### Horizon strip
- Height: 64px · background `#1A1A1A` hardcoded (always dark, both themes) ✅
- Station name: IBM Plex Mono 15px `#E4E2DC` · ETA: IBM Plex Mono 14px `#C8A96E`
- "DARWIN · LIVE" label removed CC-84 ✅
- All arrival counts: `#A8A4A0` uniform — no gold on any count
- **Philosophy:** provides information; lets the merchant choose their own response. Never creates urgency.

### Order tiles
- `[ID] · [items]` single line · status badge right only
- PENDING gold · IN PREP `#7899D4` · READY `#3DCA7A`
- Tile: `background #26282C` · `border 0.5px solid #35373B` · `border-radius: 7px`
- **S-25 (logged CC-92):** Tile background hardcoded — does not adapt to Paper theme. Resolves when token migration (TDP-B) brings `--surface` to canonical value.
- **Type sizing (TDP-A guidance):** Learn sizing from KDS incumbents (Square/Toast). Order identifier north of 18px, item name 14–16px. Status colour must be instantly readable at two feet. Pending-gold is deliberate and unusual — protect it.

### Ops panel — toggle model (under review, TDP-B decision)
Current state: two toggles ("Accepting orders" / "Pause new orders") both write `venue_partners.active`, coupled via JS state machine. Sub-label copy ("Existing queue continues") is inaccurate — `active = false` is a full close. TDP-B decision: either introduce real `is_paused` boolean column, or collapse to single honest open/close toggle. Lean toward single toggle for this merchant profile.

### Portrait layout — S-16 (CC-84, locked)
- Option A: sidebar collapses to horizontal-scroll card strip above main. CSS-only.
- `@media (orientation: portrait), (max-width: 820px)`

### TDP-B agenda items
- First-login welcome screen: venue name + brief orientation, one-time only — **copy must speak to the merchant's identity, not Refueler's onboarding checklist**
- "Change Lightning address" flow in Owner tab with Venue Keys reprint prompt
- **G-1 settlement wiring** — hard gate item: wire `create-order` to invoice to `venue_partners.lightning_address`
- Ops toggle model decision (see above)
- Digital stamp display location — where stamps live on terminal (TDP-philosophy session to inform)
- Sidebar necessity question — TDP-philosophy session to inform
- Ops panel layout — horizontal rows vs card/grid (TDP-philosophy session to inform)

---

## Terminal token drift — TDP-A findings (all fix in TDP-B)

The terminal runs a pre-CSS-1a token set. Confirmed drift against canonical:

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

**Security note (S-27):** `venue_partners_merchant_pause_update` has no column-level restriction — it permits writing `lightning_address`, `onchain_address`, `silent_payment_address` on own venue row. Hardening-A table-level grant is the current control. TDP-B must add column-level UPDATE grant restriction: only `active` and `pause_reason` writable via merchant auth path. Wallet address changes require owner magic-link re-auth or the "Change Lightning address" Edge Function (TDP-B agenda item).

**`deny_non_admin_update_protected_columns` policy note:** Named as a deny policy but is PERMISSIVE — it grants admins UPDATE, it does not deny others via RLS. Wallet address write protection for non-admins currently rests on Hardening-A grant restrictions only.

**Confirmed post-CC-94 state (unchanged):**
- `merchant_users`: anon holds zero grants. authenticated holds column-level SELECT on 6 safe columns only. bcrypt columns service_role-only.
- `venue_partners`: anon holds zero grants. authenticated holds SELECT + UPDATE only (table level). Wallet columns reachable by authenticated UPDATE — column restriction is TDP-B item S-27.
- `orders_venue_id_fkey` FK present.
- Deprecated tables (`log_entries`, `live_transactions`, `sessions`) purged.
- Raj's Steakhouse: staff PIN 1234, owner PIN 8888, active true, `lightning_address = 'trickdraw318@walletofsatoshi.com'`
- JWT session lifetime: 43200s (12h)

**Columns confirmed present on `venue_partners`:** `active` (boolean), `pause_reason` (text), `lightning_address` (text), `onchain_address` (text), `silent_payment_address` (text)

---

## PIN auth — S-18 (CLOSED CC-90)

Architecture locked. `verify-pin` v2, bcryptjs, rate limit 5/5min.
SHA-256 legacy columns (`staff_pin_hash`, `owner_pin_hash`) dropped CC-94. ✅

---

## Dev console — re-scope pending (TDP-A or dedicated session)

Pre-pivot telemetry tables dropped CC-94. Dev console data sources are now null. Re-scope around real operational metrics: orders placed/confirmed/settled (`orders` + `merchant_orders`), Blink wallet balance (`blink-balance` Edge Function), active venue count (`venue_partners.active`), Edge Function invocation counts, and future product telemetry placeholders (sats rewarded, stamp issuances, Legend queries). Scope within TDP-A or as a lightweight standalone session after TDP-A.

---

## Incident response — locked Sim-Close

**Protocol:** `INCIDENT-PROTOCOL.md` in `refueler-io/docs/`. Ecosystem-wide.
**Internal channel:** Signal (moves to self-hosted SimpleX when staff are onboarded).
**External (merchants):** Tuta Mail `hello@refueler.io` — direct, one-to-one.
**Public statements:** `refueler.io/status/` only. Never social media before status page is updated.
**Core rule:** Never announce on the channel attackers and the market are watching. Internal → contain → public.

---

## Status page — scoped item (post-Sim-Close)

Static-first `refueler.io/status/` — product-row format. Small nav dot on homepage. Scope separately. Low priority until first real merchant.

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
| S-25 | Order tile Paper mode — tile background hardcoded `#26282C`. Resolves automatically with TDP-B token migration. | Low | TDP-B token migration |
| S-27 | `venue_partners_merchant_pause_update` — no column restriction. Authenticated merchant can write wallet address columns on own venue row. Add column-level UPDATE grant: `active` + `pause_reason` only. | **Medium** | TDP-B (pre-merchant) |
| S-doc-1 | Process doc footer wraps to two lines in Chrome PDF | Low | Next process doc iteration |

**Permanently closed:**
~~S-12~~ · ~~S-14~~ · ~~S-18~~ · ~~S-23~~ · ~~S-24~~ · ~~S-26~~

---

## Queued sessions — forward plan (post-TDP-A)

| # | Session | Scope | Type | Status |
|---|---|---|---|---|
| 1 | **TDP-philosophy** | Design philosophy deep-dive — sidebar necessity, Ops layout, accessibility (partial sight, hearing), stamp placement on terminal, Aman/luxury-calm reference, family merchant context, Bitcoin-native world 10yr horizon | Opus uncounted + extended thinking | **Next** |
| 2 | **TDP-B** | Terminal redesign execution — token migration, G-1 settlement wiring, S-27 column restriction, ops toggle model, menu-item primitive, first-login welcome, Change Lightning address flow | Sonnet counted | After TDP-philosophy |
| 3 | **TDP-C** | NumoPay fork alignment | Opus uncounted | After TDP-B |
| — | **Menu Management v1** | CSV import, time-based menus | Sonnet counted | After TDP-B |
| — | **CA-1 — Consumer App Track** | Opus scoping. **Prerequisite: dev branch push.** | Opus uncounted | After TDP-C |
| — | **NumoPay-A** | Fork review, API contract, noun/verb/handle taxonomy | Opus uncounted | After TDP-C |
| — | **Block 8** | Fiat → sats rewards | Sonnet counted | After Menu Management v1 |
| — | **Events intelligence layer** | Football fixtures, Darwin toggle, horizon strips | Sonnet counted | Gap |
| — | **Privacy page update** | Sections 7, 8, 10 + merchant GDPR + Resend Article 30 | Sonnet counted | Gap |
| — | **Share API planning** | Pay-per-use API, photographer/legal v1 | Opus uncounted | Before AD-2 |
| — | **AD-2** | Share admin dashboard | Sonnet counted | After Share API planning |
| — | **Session A (CDK mint)** | CDK mint architecture | Opus uncounted | After Block 8 |
| — | **Status page** | `refueler.io/status/` — global product-row, static-first | Sonnet counted | After first real merchant |

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
