# Refueler Master Context — IO CC-103
*Updated: 2026-08-20 (CC-103 — build fix, Darwin RLS, Owner tab enrichment, warm carbon, product naming, Owner tab redesign spec locked)*
*Supersedes: MasterContext_IO_CC102*

---

## Session allocation
500 primary + 50 buffer = 550 total. Planning/Opus sessions uncounted.
Sessions used to CC-103: ~99 counted + uncounted planning sessions.

---

## Project overview

Refueler is a Bitcoin-native privacy ecosystem. Products: Share (live at `refueler.io/share/`), Legend (post-B9), consumer pre-order app (Fenchurch St line), merchant terminal (tablet, counter/kitchen, landscape), Pass (own repo), Relay (Android, waiter/floor staff — formerly NumoPay fork).

**Product names (locked CC-103):**
- Floor staff Android app: **Relay** (`io.refueler.merchant`) — "Relay by Refueler". Waiter/floor staff relay orders back to the terminal. Pass integration future scope.
- Consumer app: **Refill** — React Native, Blink Lightning, commuter pre-orders. Name ties to Refueler, describes what a commuter does at a café.

**Supabase project:** `tihgvdokeofnjxjkenmm`
**Webhook URL:** `https://tihgvdokeofnjxjkenmm.supabase.co/functions/v1/blink-webhook`

**GitHub repos:**
| Repo | Local path |
|---|---|
| `rajesh-taylor/refueler-io` | `/Users/rajeshtaylor/Documents/refueler.io/` |
| `rajesh-taylor/refueler-app` | `/Users/rajeshtaylor/Documents/refueler.io/refueler-app/` — dev branch local, push pending |
| `rajesh-taylor/numo-fork` (Relay) | `/Users/rajeshtaylor/Documents/refueler.io/terminals/numo-fork/` |
| `rajesh-taylor/refueler-share` | `/Users/rajeshtaylor/Documents/refueler-share/` |
| `rajesh-taylor/refueler-legend` | `/Users/rajeshtaylor/Documents/refueler-legend/` |
| `rajesh-taylor/refueler-mint` | `/Users/rajeshtaylor/Documents/refueler-mint/` |
| `rajesh-taylor/refueler-pass` | Own repo + Claude project |
| `refueler-ecash-lab` | **Local only — never push** |

---

## Sim-Close — DECLARED COMPLETE (2026-08-17)

All four stages complete. `INCIDENT-PROTOCOL.md` in `refueler-io/docs/`.

---

## Pre-merchant gate list

| # | Gate | Severity | Notes |
|---|---|---|---|
| G-1 | **Merchant settlement wiring** | ✅ CLEARED CC-97 | `create-order` v10 — LNURL-pay |
| G-2 | **Menu Management v1** | Hard blocker | **Next session (CC-104)** |
| G-3 | **iPad physical check** | ✅ CLEARED CC-103 | Website looks great portrait on iPad and iPad mini |
| G-4 | **Hardening-A** | ✅ CLEARED CC-94 | |
| G-5 | S-26 (orders→venue_partners FK) | ✅ CLEARED CC-94 | |

---

## Payment architecture — locked CC-97

**Consumer → Merchant:** LNURL-pay. `create-order` v10. Sats direct to merchant wallet.
**Relay floor → Merchant:** same rail via `create-order` EF. `origin:'floor'` on `merchant_orders`. Cash/card: record-only insert, `status:'confirmed'` immediately.
**Refueler's Blink float:** Holds only Refueler's own operating sats (reward payouts, ADR-MS-11).
**Fiat commission:** Stripe → Revolut Business (before first real merchant). Commission rate: dedicated planning session required.

---

## Merchant terminal — file locations (locked TDP-A)

**HTML:** `src/merchant/index.html`
**JS:** `src/merchant/merchant-tablet-logic.js`
**CSS:** `src/merchant/merchant-tablet-styles.css`

**Terminal orientation (confirmed CC-103):** Landscape. All café counter tablets are landscape. Relay (portrait, handheld) is the correct split for floor staff.

---

## Terminal design — current state (post CC-103)

**Status colours (protected):** Pending `#C8A96E` · In Prep `#7899D4` · Ready `#3DCA7A`.

**Owner tab — redesign locked CC-103 (S-32, builds in Web-Touch-1):**

Nav right: `← Back to Queue` · `PAPER / CARBON` pill. Pill always far right, same position as queue view.

Full-width above hairline: today stats (3-col) · all-time stats (2-col) · last order timestamp.

Two-column split below "Settings" divider label, vertical hairline centre:

Left column:
- Lightning address — single line, ellipsis truncation, gold `ti-lock` icon flush right. Tap → owner PIN re-auth → change flow. Never wraps.
- On-chain address — display only.
- Venue status toggle: green on = "Open — accepting orders", amber off = "Paused — not accepting orders".
- Arrival strip toggle: green on = "Show Darwin departure board", amber off = "Arrival strip hidden".

Right column:
- Shutdown merchant terminal toggle: green on = "Terminal active — tap to shut down", amber off (warm text) = "Terminal shut down — no orders accepted". Sets local `_terminalShutdown` flag, locks screen to "Terminal closed" overlay, blocks order queue. Owner PIN to reopen. Distinct from venue pause — physical terminal lock only.
- Below shutdown: reserved for stamp metrics, Legend panel (post-B9).

Toggle spec: green `#3DCA7A` on (border + knob right), amber `#C8943A` off (knob left). Both themes identical.

---

## Darwin strip

Anon SELECT policy live (`cc103_rail_signal_anon_read`). S-Darwin closed.
**Still showing offline on live terminal.** Diagnose with `execute_sql` at CC-104 open — check row count and `fetched_at` in `rail_signal_current` before starting Menu Management work.

---

## Design system — warm carbon (locked CC-103, 2-week trial)

Carbon bg: `#1A1A1A` → `#1A1917`. Only `--bg` and `--nav-bg` in carbon override updated. `--carbon` constant and Paper `--fg` stay `#1A1A1A`. Share CSS not yet updated (known divergence). Committed `67afc2e`.

**Paper:** `--bg: #E8E2D8` · `--fg: #1A1A1A` · `--surface: #DAD4CA`
**Carbon:** `--bg: #1A1917` · `--fg: #E8E2D8` · `--surface: #242424`

---

## Edge Functions (deployed)

| Function | Version | verify_jwt |
|---|---|---|
| `blink-webhook` | v15 | `false` |
| `create-order` | v10 | `true` |
| `blink-balance` | v5 | `true` |
| `rail-signal-poll` | v10 | `true` |
| `verify-pin` | v2 | `false` |
| `update-lightning-address` | v1 | `true` |

---

## Supabase — schema state (post CC-103)

**merchant_orders:** `origin` column. Values: `'preorder'` · `'floor'`.
**venue_partners:** authenticated UPDATE on `active`, `pause_reason` only (S-27).
**rail_signal_current:** authenticated SELECT + anon SELECT (both live).
**merchant_users:** bcrypt PIN columns service_role-only.
**JWT session lifetime:** 43200s (12h).

---

## Relay (numo-fork) — build state

**Latest commit:** `54b15de`. **BUILD SUCCESSFUL.** Installed on Pixel 9a.
**Pending:** S-numo-v31 (numo_navy refs in values-v31), pending layouts, app display name ("Relay"), Icon-B session.

---

## App icons — queued

| Session | Scope |
|---|---|
| **Icon-A** | Refill consumer app — 1024×1024, iOS + Android |
| **Icon-B** | Relay floor staff app — 1024×1024, Android only |

Both after Web-Touch-1.

---

## Test accounts

| Email | Role | Notes |
|---|---|---|
| `steakhouse@rajeshtaylor.com` | `independent_owner` | venue_id `c476df85` · staff PIN 1234 · owner PIN 8888 |
| `moniker@rajeshtaylor.com` | `franchise_hq` | Moniker |
| `dev@refueler.io` | `admin` | |

---

## Snag list — active

| ID | Item | Priority | Target |
|---|---|---|---|
| S-22 | Email fallback link block spacing | Low | Future |
| S-doc-1 | Process doc footer wraps in Chrome PDF | Low | Future |
| S-numo-v31 | numo_navy refs in values-v31/values-night-v31 | Low | Next Relay session |
| S-28 | Privacy page right-edge padding narrow/portrait | Medium | Web-Touch-1 |
| S-29 | Share nav wordmark/breadcrumb no separator | Low | Web-Touch-1 |
| S-32 | Owner tab full redesign (spec above) | Medium | Web-Touch-1 |

---

## Ongoing action items (Rajesh)

- Open Revolut Business account (before first real merchant)
- Open Blink ops wallet "Refueler Ops" (second BTC wallet in Blink)
- Create Refueler Crypto Ops Ledger
- Push BRIDGE v4.9 to all repos
- Push `refueler-app` dev branch (CA-1 prerequisite)
- Disconnect `share.refueler.io` from Cloudflare Pages
- Upgrade Supabase to Pro at first real merchant
- Upgrade Cloudflare Workers to Paid ($5/month) before production volume
- Send Mapbox coordinate accuracy email
- Rotate Anthropic API key before csuite briefing reuse
- Commission rate planning conversation before first real merchant

---

## Queued sessions

| # | Session | Type | Status |
|---|---|---|---|
| 1 | **CC-104 — Menu Management v1** (Darwin diagnosis first) | Sonnet counted | **Next** |
| 2 | **Web-Touch-1** — S-28, S-29, S-32 | Sonnet counted | After CC-104 |
| 3 | **Icon-A** — Refill app icon | Opus uncounted | After Web-Touch-1 |
| 4 | **Icon-B** — Relay app icon | Opus uncounted | After Icon-A |
| — | CA-1 · Block 8 · Pass-A · Events intelligence · Staff Management v1 | Mixed | Queued |
| — | Commission planning · Privacy page · Share API planning · AD-2 | Mixed | Gap |
| — | Session A (CDK mint) · Status page · September User Guide | Mixed | Later |
