# Refueler Master Context — IO CC-85
*Updated: 2026-08-15 (Onboarding-A — Opus uncounted. Merchant onboarding flow designed end-to-end. Handover document copy v3 produced. Schema additions logged. TDP track established. Support model confirmed.)*
*Supersedes: MasterContext_IO_CC85*

---

## Session allocation
500 primary + 50 buffer = 550 total. Planning/Opus sessions uncounted.
**Block review sessions** — standing uncounted Opus at end of each block. Recalibrate priorities and session allocation.
Sessions used to CC-85: ~86 counted + uncounted planning sessions.

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
| `src/merchant/merchant-tablet-styles.css` | Merchant terminal styles | ✅ CC-85 |
| `src/merchant/index.html` | Merchant terminal HTML | ✅ CC-85 |
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

## Magic link email — locked CC-85

Delivered via Resend SMTP relay. Supabase Auth → SMTP Settings configured:
- Host: `smtp.resend.com` · Port: `465` · Username: `resend` · Sender: `Refueler <noreply@refueler.io>`
- Template: Auth → Email Templates → Magic Link — branded HTML (Carbon, gold Refueler wordmark, muted body text and button, generous footer spacing)
- Subject: `Your sign-in link — Refueler`

**Future upgrade path (Route B — Pro plan):** When Supabase Pro is activated, replace SMTP override with an Auth Hook Edge Function (`send-magic-link`), wired as custom email hook. Template moves into repo at `supabase/functions/send-magic-link/index.ts`. Log as Onboarding-A or Block 5 Close follow-up.

---

## Supabase — auth redirect URLs (post-CC-85)

Current allowed list (5 entries):
- `http://localhost:*`
- `refuelerapp://login-callback`
- `https://refueler.io/auth/callback`
- `https://refueler.io?mobileAuth=1`
- `https://refueler.io/merchant/`

Removed CC-85: `https://refueler.io/merchant-tablet.html` (dead pre-Eleventy path) · `https://refueler.io/command-centre.html` (wrong destination for merchant links)

---

## Supabase — quota and egress (CC-85 check)

- **DB size:** 19 MB / 500 MB free limit (4%) — safe
- **Egress current cycle:** 0.008 / 5 GB (<1%) — safe
- **Previous cycle breach:** Egress exceeded — likely caused by sustained `rail_signal_poll` Darwin data volume + realtime subscriptions. Grace period expires 23 Aug 2026.
- **Action:** No immediate action required. **When real merchants go live, steady realtime order polling will push egress up — that is the correct trigger to upgrade to Supabase Pro.** Do not upgrade before first live merchant.

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
- Active site card: address line hidden in portrait
- Map: hidden in portrait
- Single-column order queue in portrait

### New Order bar (CC-84)
- Full-width gold-outlined CTA between sidebar strip and queue header
- Hidden until staff sign in; hidden in OPS view
- Free-text overlay — deliberately not a pre-programmed item grid (KDS incumbents use grids; our approach is more flexible for independent operators)

### Walk-in order overlay (CC-84)
- Fields: Identifier (datalist: Table 1–10, Counter), Item(s), Notes (optional)
- Validation: identifier and item required
- Inserts `merchant_orders` with `order_source: 'walkin'`, `payment_status: 'walkin'`, nullable `order_id`

### Sign-out buttons (CC-85)
- OPS and Owner sign-out both use `btn-owner-signout` — red border + red text, fills red on hover. Consistent across both views.
- Cancel on PIN modal: 13px `--text-secondary`, hover `--fg-muted` (was 10px `--text-tertiary`)

### Darwin toggle (queued — Onboarding-A)
- Owner screen toggle: rail/tube arrivals on/off
- Default on at onboarding. When off: horizon strip hidden, Darwin card replaced by events/fixtures card

### S-17 breakpoint architecture (CC-84, documented)
- Landscape tablet (≥820px, default): existing layout
- Portrait tablet (`@media (orientation: portrait), (max-width: 820px)`): CC-84 implementation
- NumoPay phone (~390px portrait): documented, not built — NumoPay-A session

---

## Supabase — schema state (post-CC-84)

**Migration cc84_walkin_schema applied 2026-08-13:**
- `merchant_orders.order_id` → nullable
- `merchant_orders.identifier TEXT`
- `merchant_orders.item_name TEXT`
- `merchant_orders.order_source TEXT DEFAULT 'lightning'`
- INSERT policy `merchant_orders_insert_own_venue`
- Steakhouse coords: `coords_lat = 51.5104`, `coords_lng = -0.0784`

**RLS policy state (merchant_orders):**
- `merchant_orders_insert_service_role`
- `merchant_orders_insert_own_venue` (CC-84)
- `merchant_orders_select_own_venue`
- `merchant_orders_update_service_role`

**RLS policy state (venue_partners):**
- `merchant_select_own_venue`
- `franchise_hq_select_own_group_venues`
- `admin_full_access_venue_partners`
- `partners_public_read` — DROPPED CC-83b

---

## PIN hash status — S-18 (security, pre-Block 5 Close)

PINs in `merchant_users` are SHA-256 hashed (64-char hex, browser-native `crypto.subtle`). Not plaintext, but SHA-256 is a fast hash — wrong for PIN storage. 4-digit PIN has only 10,000 combinations; SHA-256 brutable in milliseconds. Correct solution: bcrypt/argon2 server-side via Edge Function. **Dedicated session required before first real merchant goes live.** Queued as S-18.

---

## Football / events intelligence layer (queued — planning session)

**football-data.org** API subscribed (free tier: Premier League `PL` + Championship `ELC`). Events intelligence sidebar card spec to be designed in Onboarding-A or dedicated session. Darwin toggle in Owner screen enables/disables rail vs events horizon strip.

---

## Pass × Events × Merchant (queued — dedicated Opus planning session before Pass-A)

Dedicated scoping session required. See CC-84 notes for full agenda. Must run before Pass-A.

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

**Block 8 (to be deployed):** `charge-commission` · `issue-reward` · `stripe-webhook` · `claim-reward`

**Blink:** Active API key `refueler-cc68` (id: `b98cf536-ac9e-484b-bab2-14f1a181a12e`) · BTC wallet: `fd2357fe-24ec-4173-8441-fc0f05722e9a`

---

## Schema additions — pending migration (Onboarding-A)

Columns to add to `venue_partners` in next counted Sonnet session:

| Column | Type | Purpose |
|---|---|---|
| `lightning_address` | `TEXT` | Merchant Lightning address — onboarding + payment routing |
| `onchain_address` | `TEXT` | Merchant on-chain Bitcoin address (optional) |
| `silent_payment_address` | `TEXT` | Merchant Silent Payment static address (optional) |
| `mapbox_place_id` | `TEXT` | Stable Mapbox UUID anchor — persists through map data updates |

**Onboarding pre-flight:** 21-sat test payment to `lightning_address` required. Merchant confirms receipt before go-live. 1 sat will fail (fee > amount) — 21 sats is the confirmed minimum.

---

## Snag list — active

| ID | Item | Priority | Target |
|---|---|---|---|
| S-8 | Owner/Staff PIN reset + Menu management — stubs in Owner View | High | Onboarding-A |
| S-10 | Export-1: PDF/print icon on Revenue + Orders panels | Low | Future |
| S-11 | Dash-1: Orders over time + peak hours heatmap on franchise dashboard | Low | Post volume |
| S-12 | `car_park_occupancy` strip from FEEDS array | Low | Next rail-signal-poll touch |
| S-14 | `Costa Coffee HQ` category label fix | Low | Future |
| S-18 | PIN hash upgrade: SHA-256 → bcrypt/argon2 server-side | High | Before first live merchant |
| S-19 | Cancel button on PIN modal — 10px tertiary → 13px secondary | ✅ CC-85 | — |
| S-20 | Magic link redirect URL cleaned — stale `.html` paths removed | ✅ CC-85 | — |
| S-21 | OPS sign-out button — match owner red styling | ✅ CC-85 | — |
| S-22 | Email fallback link block — drop one more line above "Button not working…" text | Low | Future |
| S-23 | Staff have no sign-out path from queue view — OPS only | **High** | Next Sonnet session — pre-go-live |
| S-24 | apple-touch-icon + favicon missing — needed for tablet home screen bookmark | Medium | Go-live prep |

---

## Queued sessions — forward plan

| Session | Scope | Type | Status |
|---|---|---|---|
| ~~CC-85~~ | Branded magic link email, first full sim run | Sonnet counted | ✅ Closed |
| ~~Onboarding-A~~ | Merchant onboarding flow + printed handover doc | Opus uncounted | ✅ Closed |
| **Design-A** | Merchant handover document — layout + styled HTML | Opus uncounted | **Next** |
| **Block-5 Close** | Block 5 review and recalibration | Opus uncounted | After Design-A |
| **Sim-Close** | Formal sign-off all 4 sim stages | Opus uncounted (up to 2) | Queued |
| **TDP-A** | Terminal Design Philosophy — audit, comparators, Refueler primitives | Opus uncounted | After Sim-Close, before Menu Mgmt v1 |
| **TDP-B** | Terminal redesign — absorbs menu, events, NumoPay cleanly | Opus uncounted | After TDP-A |
| **TDP-C** | NumoPay fork design alignment | Opus uncounted | After TDP-B |
| **Privacy page update** | Sections 7, 8, 10 + merchant section + Legend free-tier + product header | Sonnet counted | Queued |
| **AI support (Option 2) — cost check** | Cloudflare Workers AI pricing pre-condition before design session | Sonnet counted | Pre-condition for Option 2 design |
| **Menu Management v1** | CSV import, time-based menus, account manager setup flow | Sonnet counted | After TDP-B |
| **PIN upgrade** | SHA-256 → bcrypt/argon2 server-side, migrate existing hashes | Sonnet counted | Before first live merchant |
| **Bitcoin Events × Pass × Merchant** | Scoping — GDPR, privacy pitch, credential design, Madeira angle | Opus uncounted, extended thinking | Before Pass-A |
| **Pass-A** | Full Pass scope + Pass Wallet card | Opus uncounted | After Block 8 + Events session |
| **NumoPay-A** | Fork review, API contract, BitChat research | Opus uncounted | After Block 5 sim-close |
| **Block 8** | Fiat → sats rewards | Sonnet counted | After Block 5 |
| **Events intelligence layer** | Football fixtures sidebar card, Darwin toggle, owner-selectable horizon strips | Sonnet counted | After Onboarding-A |
| **Session A (CDK mint)** | CDK mint architecture | Opus uncounted | After Block 8 |
| **AD-2** | Share admin dashboard | Sonnet counted | Queued |

---

## Ongoing / bundled action items

- **Action required (Rajesh):** Disconnect `share.refueler.io` from Cloudflare Pages, delete/disable project
- **Action required (Rajesh):** Push `refueler-app` dev branch
- **Action required (Rajesh):** Send Mapbox coordinate accuracy email (drafted CC-84, saved to drafts)
- Upgrade Supabase to Pro when first real merchant goes live (egress will increase with realtime order polling)
- Upgrade Cloudflare Workers to Paid ($5/month) before production volume
- New Anthropic API key → rotate before csuite briefing reuse
- `blink-webhook_index.ts` → hygiene pass
- `bsc-dev` Dev Test item → remove before TestFlight
- GitHub Actions red X on `9b9655d`
- LNBits webhook payload shape → confirm with Ben Arc before Block 9
- Est. 2026 accent column → replace with Companies House reg on incorporation
- Lawyer briefing: draft written brief before appointment
- Float pre-load amount: TBD-Rajesh
- football-data.org API key: held by Rajesh, ready for Events intelligence layer session
- Magic link email Route B upgrade: when Supabase Pro activated, replace SMTP override with Auth Hook Edge Function (`send-magic-link`) — template into repo at `supabase/functions/send-magic-link/index.ts`
- **Docs ↔ UI sync rule (active from Onboarding-A):** At close of every block touching merchant terminal UI — "Does the handover document need updating?" If yes, item in next Onboarding session. Document target path: `docs/merchant-onboarding-v1.html`
- **Session lifetime check:** Confirm default Supabase session lifetime (one-line query) in next Sonnet session. Custom per-merchant session config queued — tied to account manager review cadence
- **Cloudflare Workers AI pricing:** Pull before Option 2 (AI support) design session is scoped — pre-condition gate
- **Mapbox Contribute:** Submit corrected coords for pilot venue POIs as background task. `mapbox_place_id` column queued (schema above)
- **Auto-wake feature (queued):** Terminal awakens 30 min before configured opening time; staff PIN only for normal shift. Requires tablet on charge overnight

---

## CC-85 — session notes

**Commits:** `17ecb40` (S-19: Cancel button), `306a587` (S-21: OPS sign-out button)

**Magic link email (S-9 closed):**
- Resend SMTP configured: `smtp.resend.com:465`, username `resend`, sender `Refueler <noreply@refueler.io>`
- Template v3: single paragraph body, muted button (no gold — only Refueler wordmark stays gold), 80px margin before footer hairline, footer 12.5px `#6A6560`
- Delivered to `steakhouse@rajeshtaylor.com` in Apple Mail — confirmed correct rendering

**First full simulation run — PASSED:**
- Magic link to `steakhouse@rajeshtaylor.com` → email delivered via Resend → link opened → landed at `refueler.io/merchant/` → auth resolved → staff PIN (1234) entered → queue view loaded → New Order overlay opened → walk-in order submitted → appeared in queue → OPS and Owner views verified in Paper and Carbon
- All views confirmed: Queue (Carbon), OPS (Carbon + Paper), Owner (Paper + Carbon), New Order overlay (Paper + Carbon)
- Portrait/resized window tested in browser — sidebar card strip and single-column queue holding up

**Supabase redirect URLs cleaned:**
- Removed: `https://refueler.io/merchant-tablet.html`, `https://refueler.io/command-centre.html`
- Added: `https://refueler.io/merchant/`
- Total: 5 entries

**Supabase quota check:**
- DB: 19 MB (4% of free 500 MB limit) — safe
- Egress current cycle: <1% — safe
- Previous cycle breach was Darwin/realtime volume. Grace period 23 Aug. No action needed.

**New Order overlay observation:**
Free-text approach deliberately retained over pre-programmed item grid. KDS incumbents (Square, Toast, Lightspeed) use large button grids for fixed menus. Refueler's approach better suits independent operators with varied orders. Iterate only if merchants request it.

---

## Onboarding-A — session notes

**Date:** 2026-08-15 · Opus uncounted

**Outputs:**
- Merchant onboarding flow designed end-to-end (Stages 0–7)
- Handover document copy v3 produced and signed off — ready for Design-A
- Internal Account Manager Briefing Notes drafted (owner-away policy, site visit cadence)
- `docs/merchant-onboarding-copy-v3-final.md` — copy file in repo at session close

**Flow confirmed (Stages 0–7):**
- Stage 0: Hard gates — S-18 (PIN hashing) + Sim-Close sign-off before any real merchant
- Stage 1: Data capture — legal/trading name, address, owner email, PINs, logo, coords, Lightning address, on-chain address (opt), Silent Payment address (opt), Darwin on/off, stamp on/off
- Stage 2: Coords manually verified on-site (Mapbox offset known — override in DB)
- Stage 3: Provisioning order locked — venue_partners → auth user → merchant_users
- Stage 4: Pre-flight — Rajesh signs in as merchant, 21-sat test payment to Lightning address, all views confirmed
- Stage 5: Physical handover — printed doc, tear strip separated, tablet bookmarked
- Stage 6: Go-live — first order
- Stage 7: Hands-on staged rollout — quiet venue, physically present, one hour

**Key decisions locked:**
- Support: support@refueler.io, 2-hour SLA, Mon–Fri 7am–6pm (Fenchurch St corridor)
- Tear strip: Owner PIN + Lightning + on-chain + Silent Payment address. Physically separated at handover. Never in digital copy.
- Staff PIN: In main body details box (operational shift code, not a vault secret)
- Handwritten update space on tear strip and staff PIN box — ruled lines in Design-A
- Account manager direct contact (Signal etc.) on private setup sheet only — not in printed guide
- Sign-out: both Queue and OPS views (assumes S-23 landed — memory log active)
- Bookmark tip: added to doc. Requires apple-touch-icon + favicon (S-24, queued)
- Menu Management: noted as "coming soon" in doc. Build gated behind TDP-B.
- SLA escalation path for urgent issues: account manager via setup sheet
- Owner-away policy: session lifetime agreed at onboarding, cc preference captured, staff emergency contact (personal email acceptable), reviewed at every site visit

**Gaps identified and logged:**
- G-1: lightning_address missing from venue_partners — schema addition logged above
- G-2: open/close control confirmed in OPS view — exact UI labels verified from live files
- G-3: PIN reset and menu management stubbed — S-8, "contact support" for now
- G-4: Darwin + events simultaneous display — TDP scope, not go-live blocker
- G-5 (S-23): Staff sign-out from queue view — promoted to High, next Sonnet session

---

*"Nothing stops this train."*
