# Refueler Master Context — IO CC-91
*Updated: 2026-08-16 (CC-91 — Sonnet counted. Stage 1 sim deliverable complete. `merchant-onboarding-process-v1.html` produced and committed. Commit `a5cc342`.)*
*Supersedes: MasterContext_IO_CC90*

---

## Session allocation
500 primary + 50 buffer = 550 total. Planning/Opus sessions uncounted.
**Block review sessions** — standing uncounted Opus at end of each block. Recalibrate priorities and session allocation.
Sessions used to CC-91: ~91 counted + uncounted planning sessions.

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

## Sim-Close — stages (Block-5 Close)

- Stage 1: Internal onboarding process doc — ✅ **CLOSED CC-91.** `merchant-onboarding-process-v1.html`, commit `a5cc342`.
- Stage 2: Operational sim — PASSED (CC-85, browser). iPad check non-blocking.
- Stage 3: Payment sim — not yet run. Standalone session. Rajesh to provide Lightning address for Raj's Steakhouse. **Unblocked — schema migration landed CC-87, S-18 closed CC-90.**
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

**Process doc specifics (CC-91):**
- [R] / [AM] role tags throughout — Rajesh-only steps clearly marked
- Pre-qualification gate: venue type, location (rail/tube/stadium), owner meeting, Lightning wallet
- Data collection form with ruled lines — venue name, address, email, Lightning address (mandatory), on-chain (optional), Silent Payment (optional), Mapbox note
- Wallet recommendations table: Phoenix (recommended), Wallet of Satoshi (beginners, flag custodial), Zeus/Mutiny (technical)
- Rotating wallets: update `venue_partners.lightning_address`, print new Venue Keys card
- Provisioning sequence locked: `venue_partners` → auth user → `merchant_users` — never out of order
- `venue_partners.active` go-live switch: [R] dashboard-only, currently no UI toggle
- Pre-flight: AM sends 21 sats manually from Blink wallet; owner confirms receipt; [R] confirms in Supabase; no merchant-facing test button
- 21-sat test is always an AM/Rajesh action — never a merchant control
- Magic link resend: Supabase dashboard → Authentication → Users → [email] → Send magic link
- JWT session lifetime: 12 hours — noted for AM context
- Notes lines on page 1 (below pre-qual checklist) for handwritten AM notes
- Hard page break: Section 2 opens on page 2

**S-doc-1 (next iteration):** Footer closing line wraps in Chrome PDF — fix to one line. Remove "Not for merchant distribution." (redundant), tighten separators.

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

### TDP-B agenda items (logged CC-88, CC-91)
- Manager role: Staff → Queue SIGN OUT · Manager → OPS panel · Owner → Owner tab
- First-login welcome screen: venue name + brief orientation, one-time only, shown on first successful login
- "Change Lightning address" flow in Owner tab with Venue Keys reprint prompt

---

## Supabase — schema state (post-CC-91, no new migrations this session)

*(Schema unchanged from CC-90. See CC-90 entry for full migration log.)*

**Key state:**
- `merchant_users_safe` view: `id, user_id, venue_id, role, created_at` — hash/bcrypt columns excluded
- `merchant_users`: `staff_pin_bcrypt` + `owner_pin_bcrypt` (bcrypt wf12) live; old SHA-256 cols retained pending Sim-Close cleanup
- `venue_partners`: `lightning_address`, `onchain_address`, `silent_payment_address`, `mapbox_place_id` columns live (CC-87)
- `merchant_orders`: `order_id` nullable, `identifier`, `item_name`, `order_source` live (CC-84)
- Raj's Steakhouse: staff PIN 1234, owner PIN 8888, bcrypt seeded, coords live

**Supabase session lifetime (CC-87):** Access token 12 hours (43200s). Set in dashboard → Authentication → JWT Settings. **Action required (Rajesh)** before Stage 3 sim.

---

## PIN auth — S-18 (CLOSED CC-90)

**Architecture (locked):**
- `verify-pin` Edge Function v2 (bcryptjs, pure JS, no subprocess)
- `merchant_users_safe` view — no hash columns exposed to client
- Column-level SELECT grants on safe cols only
- Rate limit: 5 attempts/5min per user_id (in-memory Map — replace with KV post-Sim-Close)
- Client-side lockout: 5 failures → 30s countdown; 429 → immediate lockout

**Cleanup pending (post-Sim-Close):** Remove `staff_pin_hash` + `owner_pin_hash` columns.
**PIN reset UI (future):** Server-side Edge Function — never client-side bcrypt.
**Hardening-A (post-Sim-Close):** Full `anon` grant surface audit.

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
| `verify-pin` | v2 | bcrypt PIN verification, rate-limit 5/5min | `false` (explicit) |

**Blink:** Active API key `refueler-cc68` · BTC wallet: `fd2357fe-24ec-4173-8441-fc0f05722e9a`

---

## Snag list — active

| ID | Item | Priority | Target |
|---|---|---|---|
| S-22 | Email fallback link block — drop one more line above "Button not working…" text | Low | Future email touch session |
| S-doc-1 | Process doc footer wraps to two lines in Chrome PDF — remove "Not for merchant distribution.", tighten separators, confirm one line | Low | Next process doc iteration |

**Permanently closed:**
- ~~S-12~~ `car_park_occupancy` — strip from FEEDS array on next `rail-signal-poll` touch.
- ~~S-14~~ `Costa Coffee HQ` category label — fix on next `rail-signal-poll` touch.
- ~~S-18~~ PIN auth server-side — **CLOSED CC-90**.
- ~~S-23~~ Queue sign-out button — shipped CC-88 commit `083f2a2`.
- ~~S-24~~ favicon/apple-touch-icon — shipped CC-88 commit `083f2a2`.

**Note on S-22b** (button top-border missing on iOS Mail): confirm resolved or reinstate.

---

## Staff Management v1 — future product arc (logged CC-87)

**Current model:** One staff PIN, one owner PIN per venue. Shared with floor staff by the owner. Role gate only — not an identity gate. If a staff member leaves, owner changes the staff PIN via support.

**Per-staff PINs — explicitly deferred.** Not appropriate before a first paying merchant exists.

**Future arc:** Per-staff accounts with individual session tokens and shift-aware token expiry. Square charges ~$35/month per location for equivalent (Square Team Management). Real monetisation lever post-PMF.

**When to build:** Post Block 8. Not before.

---

## 21-sat test payment — architecture decision (locked CC-91)

The 21-sat pre-flight test is always an AM/Rajesh action — never a merchant-facing control. AM sends manually from the Blink wallet before the handover meeting; owner confirms receipt in their Lightning wallet; [R] confirms `payment_status = 'paid'` in Supabase. No test button on the terminal now or post-TDP-B. If a merchant reports payment issues, AM/Rajesh sends 21 sats manually as a live rail proof-of-life. No gaming surface, no UI to build or roll back.

---

## Share — platform notes (logged Block-5 Close)

**Pay-per-use API (planning — pre-AD-2):**
v1 segments: professional photographers and legal. Staging: v1 metered → v2 broaden → v3 white-label. Recipient flywheel: every anonymous recipient is a latent sender. Full plan in dedicated Share API planning session.

**Safari upload ceiling:** ~1.5 GB real-world ceiling on current in-memory upload path. Fix: chunked streaming encryption. Do not headline large-file capability on Safari; "4 GB free" must not imply a 4 GB Safari upload works today.

---

## Queued sessions — forward plan (post-CC-91)

| # | Session | Scope | Type | Status |
|---|---|---|---|---|
| 1 | **Payment sim — Stage 3** | Full Blink invoice → settlement → webhook → terminal | Sonnet counted | **Next** |
| 2 | **TDP-A** | Terminal Design Philosophy — audit, comparators, primitives | Opus uncounted | After Stage 3 sim |
| 3 | **TDP-B** | Terminal redesign — menu, events, NumoPay | Opus uncounted | After TDP-A |
| 4 | **TDP-C** | NumoPay fork alignment | Opus uncounted | After TDP-B |
| — | **Menu Management v1** | CSV import, time-based menus | Sonnet counted | After TDP-B |
| — | **CA-1 — Consumer App Track** | Opus scoping — end-to-end commuter order flow, frictionless UX, app state audit from CC-69 | Opus uncounted | After TDP-C; parallel with or immediately after Menu Management v1. **Prerequisite: dev branch push.** |
| — | **NumoPay-A** | Fork review, API contract, BitChat research | Opus uncounted | After TDP-C |
| — | **Block 8** | Fiat → sats rewards | Sonnet counted | After Menu Management v1 |
| — | **Events intelligence layer** | Football fixtures, Darwin toggle, horizon strips | Sonnet counted | Can run in gap — no hard dependency |
| — | **Privacy page update** | Sections 7, 8, 10 + merchant + Legend free-tier | Sonnet counted | Any gap — no dependencies |
| — | **Sim-Close** | Formal sign-off all 4 stages | Opus uncounted (≤2) | After Stage 3 sim |
| — | **Hardening-A** | Supabase-wide RLS + anon grant surface audit | Opus uncounted | After Sim-Close |
| — | **Share API planning** | Pay-per-use API, photographer/legal v1, v1/v2/v3 staging | Opus uncounted | Before AD-2 |
| — | **AD-2** | Share admin dashboard | Sonnet counted | After Share API planning |
| — | **Owner tab doc tiles** | Amber/green download indicators | Sonnet counted | Post Sim-Close |
| — | **Changelog panel** | Reverse-chronological change list in Owner tab | Sonnet counted | Post Sim-Close |
| — | **Design-A2** | Terminal screenshots in User Guide — incl. home screen icon screenshot | Opus uncounted | After TDP-B (~3–4 weeks) |
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
- **Post-Sim-Close:** Remove `staff_pin_hash` + `owner_pin_hash` columns from `merchant_users` in cleanup migration
- **Post-Sim-Close:** `venue_partners.active` toggle — add to Command Centre or Owner tab (currently [R] dashboard-only)
