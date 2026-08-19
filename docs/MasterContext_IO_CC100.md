# Refueler Master Context — IO CC-100
*Updated: 2026-08-19 (NumoPay-B — auth scaffold, CDK removed, Theme.Refueler Carbon. Commit 8b217d1 on numo-fork main.)*
*Supersedes: MasterContext_IO_CC99*

---

## Session allocation
500 primary + 50 buffer = 550 total. Planning/Opus sessions uncounted.
Sessions used to CC-100: ~96 counted + uncounted planning sessions.

---

## Project overview

Refueler is a Bitcoin-native privacy ecosystem. Products: Share (live at `refueler.io/share/`), Legend (post-B9), consumer pre-order app (Fenchurch St line), merchant terminal (tablet, counter/kitchen), Pass (own repo), NumoPay fork (Android, waiter/floor staff).

**Supabase project:** `tihgvdokeofnjxjkenmm`
**Webhook URL:** `https://tihgvdokeofnjxjkenmm.supabase.co/functions/v1/blink-webhook`

**GitHub repos:**
| Repo | Local path |
|---|---|
| `rajesh-taylor/refueler-io` | `/Users/rajeshtaylor/Documents/refueler.io/` |
| `rajesh-taylor/refueler-app` | `/Users/rajeshtaylor/Documents/refueler.io/refueler-app/` — dev branch local, push pending |
| `rajesh-taylor/numo-fork` | `/Users/rajeshtaylor/Documents/refueler.io/terminals/numo-fork/` |
| `rajesh-taylor/refueler-share` | `/Users/rajeshtaylor/Documents/refueler-share/` |
| `rajesh-taylor/refueler-legend` | `/Users/rajeshtaylor/Documents/refueler-legend/` |
| `rajesh-taylor/refueler-mint` | `/Users/rajeshtaylor/Documents/refueler-mint/` |
| `rajesh-taylor/refueler-pass` | Own repo + Claude project |
| `refueler-ecash-lab` | **Local only — never push** |

---

## Sim-Close — DECLARED COMPLETE (2026-08-17)

All four stages complete or non-blocking. `INCIDENT-PROTOCOL.md` in `refueler-io/docs/`.

---

## Pre-merchant gate list (current)

| # | Gate | Severity | Notes |
|---|---|---|---|
| G-1 | **Merchant settlement wiring** | ✅ CLEARED CC-97 | `create-order` v10 — LNURL-pay |
| G-2 | **Menu Management v1** | Hard blocker | Queued after NumoPay-B |
| G-3 | **iPad physical check** | Should-do | Non-blocking. Do before first real merchant. |
| G-4 | **Hardening-A** | ✅ CLEARED CC-94 | |
| G-5 | S-26 (orders→venue_partners FK) | ✅ CLEARED CC-94 | |

---

## Payment architecture — locked CC-97

**Consumer → Merchant:** LNURL-pay. `create-order` v10 fetches `venue_partners.lightning_address`, resolves BOLT11 via LNURL-pay. Sats go direct to merchant's wallet. Refueler's Blink account is never in the consumer→merchant path.

**NumoPay floor → Merchant:** same LNURL-pay rail via `create-order` EF. Floor device holds no funds, custodies nothing. Cash/card walk-in: record-only insert to `merchant_orders`, no invoice.

**Refueler's Blink float:** Holds only Refueler's own operating sats. Used exclusively for LNURL-withdraw sats reward payouts (ADR-MS-11).

**Blink ops wallet ("Refueler Ops"):** Second BTC wallet under same Blink account. Used for onboarding test payments, 21-sat Lightning address confirmations, support call testing. Top-ups logged as business expense in Refueler Crypto Ops Ledger (sats + GBP equivalent). AM requests top-up from Rajesh; internal Blink transfer (instant, no fee). Long-term: separate Blink account per AM (Staff Management v1).

**Fiat commission:** Stripe off-session PaymentIntent (4–8% of order value). Settles to bank account — Revolut Business recommended. **Commission rate/model is an open strategic question — not to be assumed in any architecture until a dedicated planning conversation.**

**`payment_processor` field:** records `'lnurl'` from v10 onwards.

---

## Three-wallet simulation setup

- **WoS** (`trickdraw318@walletofsatoshi.com`) — merchant wallet, live invoice destination
- **Blink** (`fd2357fe-24ec-4173-8441-fc0f05722e9a`) — Refueler treasury only
- **Minibits** — customer wallet, BOLT11-capable payer

---

## Merchant terminal — file locations (locked TDP-A)

**HTML:** `src/merchant/index.html`
**JS:** `src/merchant/merchant-tablet-logic.js`
**CSS:** `src/merchant/merchant-tablet-styles.css`

---

## Terminal design — current state (post CC-97)

**Sidebar:** removed. 340px returned to queue. Mapbox dependency removal deferred.
**Horizon strip:** slot-based. `HORIZON_TENANTS = ['rail']`. Mirrored to Owner tab.
**Ops panel:** Open/Closed toggle. Card grid: Trading status, Staff access, Menu, Stamp programme (all placeholders except Trading status).
**Owner tab:** Stats · Horizon strip · Lightning address (display + Change via `update-lightning-address` v1) · On-chain address (display + privacy nudge, `[R]` to change) · Sign out.
**First-login welcome:** fires once for `independent_owner`.
**Stamp glyph:** `✦` on READY status.
**Status colours (protected):** Pending `#C8A96E` · In Prep `#7899D4` · Ready `#3DCA7A`.

---

## Edge Functions (deployed)

| Function | Version | Purpose | verify_jwt |
|---|---|---|---|
| `blink-webhook` | v15 | Blink direct callback | `false` (explicit) |
| `create-order` | v10 | Consumer app + NumoPay floor → LNURL-pay invoice to merchant LN address | `true` |
| `blink-balance` | v5 | Proxies Blink GraphQL balance | `true` |
| `rail-signal-poll` | v10 | Darwin feed poller, pg_cron triggered | `true` |
| `verify-pin` | v2 | bcrypt PIN verification, rate-limit 5/5min | `false` (explicit) |
| `update-lightning-address` | v1 | Owner tab LN address change — Owner PIN bcrypt, LNURL check, service_role write | `true` |

**`update-lightning-address` v1 — security model:**
- JWT validated via `getUser()`. Owner PIN verified server-side via bcrypt.
- `venue_id` derived from auth chain — never accepted from request body.
- LNURL step-1 reachability check, 5s timeout, fail-closed.
- Writes via service_role (authenticated blocked by S-27).
- Post-write re-select confirms stored value (rule 4j).
- Rate limit: 5/5min in-memory. Commit: `790e2f6`.

**After any Lightning address change:** AM or Rajesh sends 21 sats from Blink ops wallet to confirm. Log in Refueler Crypto Ops Ledger.

**Blink:** Active API key `refueler-cc68` · BTC wallet: `fd2357fe-24ec-4173-8441-fc0f05722e9a` (treasury only)

---

## CSS architecture — locked

Single token source: `global.css` (web), `merchant-tablet-styles.css` (terminal). No page defines its own `:root`. No `backdrop-filter`. CSS-1 through CSS-7b closed.

**Paper:** `--bg: #E8E2D8` · `--fg: #1A1A1A` · `--surface: #DAD4CA` · `--surface-raised: #D0C9BE`
**Carbon:** `--bg: #1A1A1A` · `--fg: #E8E2D8` · `--surface: #242424` · `--surface-raised: #2E2E2E`
**Shared:** `--gold: #C8A96E` · `--success: #27AE60`

---

## Supabase — schema state (post CC-100 / NumoPay-B)

**venue_partners:** authenticated SELECT all columns · UPDATE `active`, `pause_reason` only (S-27) · `lightning_address` write via service_role only (`update-lightning-address` EF).
**merchant_users:** anon zero grants · authenticated column-level SELECT on 6 safe columns · bcrypt columns service_role-only.
**merchant_orders:** `origin` column (`text not null default 'preorder'`) — **ADDED CC-100** (migration `numo_b_merchant_orders_origin`). Values: `'preorder'` (consumer app) · `'floor'` (NumoPay).
**Raj's Steakhouse:** staff PIN 1234, owner PIN 8888, active true, `lightning_address = 'trickdraw318@walletofsatoshi.com'`, `onchain_address` not yet set.
**JWT session lifetime:** 43200s (12h).

---

## Menu-item primitive spec (agreed CC-97, not yet built)

```
merchant_menu_items:
  id, venue_id, name, description (nullable), price_gbp,
  available (boolean), category (nullable), display_order, created_at
```
Scoped for Menu Management v1. NumoPay reads this table (read-only on floor device). Write side stays on tablet terminal / Menu Management v1.

---

## NumoPay fork — architecture decisions (NumoPay-A, CLOSED)

**ADR file:** `numo-fork/NUMO-PAY-A-ADR.md` and `refueler-io/docs/NUMO-PAY-A-ADR.md`

**Governing decision (locked):** NumoPay is a Supabase-backed order-entry terminal. It holds no funds and processes no payments of its own. It is a permanent hard fork of cashubtc/Numo v1.8 — no merge path back to upstream.

**Auth model (locked NumoPay-A):**
- First-time: Supabase magic link (AM-assisted, once). **Q1 resolved CC-100: service-role bootstrap JWT in QR, 5-min TTL, discarded after first use.** Session JWT stored in EncryptedSharedPreferences.
- Shift-start: `verify-pin` v2 EF (server-side bcrypt). On success: local grant written to EncryptedSharedPreferences, valid 30 minutes.
- Offline resilience: if server unreachable and local grant valid → proceed with "offline — limited mode" banner. No hard lock-out on network blip.
- `FLAG_KEEP_SCREEN_ON` on POS activity — no mid-shift re-auth while screen is on.
- Session expiry (12h): "Session expired — contact your manager." No self-service re-auth on device.

**Q2 resolved CC-100:** Same `create-order` EF for floor orders. `origin` field distinguishes (`'floor'` vs `'preorder'`).

**Q3 resolved CC-100:** Custom fonts deferred. System Roboto in v1; revisit at design pass.

**EncryptedSharedPreferences keys (locked CC-100):**
- File: `refueler_session_enc` · Key alias: `refueler_session_key`
- `refueler_supabase_url` · `refueler_session_jwt` · `refueler_venue_id` · `refueler_local_grant_until`

**Activity routing (locked CC-100):**
- LAUNCHER: `RefuelerAuthActivity` — routing only, no UI. Routes to provisioning / PIN / POS.
- `RefuelerProvisioningActivity` — QR scan → EncryptedSharedPreferences → PinEntryActivity.
- `PinEntryActivity` — repointed to `verify-pin` v2 EF. Local 30-min grant on success.
- `ModernPOSActivity` — shell only. CDK, NFC HCE, AutoWithdrawManager, BTCMap banner, setupThemeSettings() all removed.

**Deleted in NumoPay-B (commit 8b217d1):**
- `OnboardingActivity.kt` — 1,805 lines gone.
- `CashuWalletManager`, `AutoWithdrawManager`, NFC HCE activation, BTCMap banner from `ModernPOSActivity`.
- `setupThemeSettings()` / `AppCompatDelegate` night-mode toggle.
- CDK dependency (`cdk-android:0.17.2-rc.1`) commented out in `build.gradle.kts`.

**CDK return condition:** Block 8 / Pass floor-device redemption only. Must pin to stable `cdk-android:0.17.2` matching `refueler-mint` (lock 4s). `-rc.1` must never ship to a real merchant device.

**Theme (locked CC-100):** `Theme.Refueler` replaces `Theme.Numo`. Carbon always-on. `android:theme="@style/Theme.Refueler"` on `<application>` in manifest. NFC `android:required` softened to `false` on both `uses-feature` entries.

**Pending for NumoPay-C:**
- `ItemListActivity` Supabase PostgREST repoint (`merchant_menu_items`)
- `create-order` floor call + Realtime poll + LNURL QR display
- Cash/card record-only flow
- `InsightsActivity` / `PaymentsHistoryActivity` repoint to `merchant_orders`
- `offline_mode_banner` view added to `activity_modern_pos.xml`
- String resources: `pin_entry_shift_start_title/subtitle`, `pin_entry_wrong_pin_attempts`, `pin_entry_wrong_pin`, `pin_entry_session_expired`, `pin_entry_network_error`, `provisioning_error_empty_qr`, `provisioning_error_invalid_qr`
- NFC HCE class + manifest entry full removal (clean-up)
- WebhookSettingsActivity + AutoWithdrawSettingsActivity removal from settings

---

## PIN auth — S-18 (CLOSED CC-90)

`verify-pin` v2, bcryptjs, rate limit 5/5min. SHA-256 legacy columns dropped CC-94. ✅
NumoPay floor device uses the same EF for shift-start PIN verification (wired CC-100).

---

## Merchant handover documents

Files in `refueler-io/docs/`: `merchant-onboarding-v1.html`, `merchant-venue-keys-v1.html`, `merchant-onboarding-process-v1.html`, `INCIDENT-PROTOCOL.md`, `NUMO-PAY-A-ADR.md`.

**September User Guide update (flagged CC-98):**
- Lightning address change section + 21-sat AM confirmation process
- Anti-phishing panel ("Refueler will never send a link you didn't request")
- On-chain address: support-only note
- AM onboarding checklist: log 21-sat send in crypto ops ledger

---

## Test accounts

| Email | Role | Notes |
|---|---|---|
| `steakhouse@rajeshtaylor.com` | `independent_owner` | Raj's Steakhouse · venue_id `c476df85` · staff PIN 1234 · owner PIN 8888 |
| `moniker@rajeshtaylor.com` | `franchise_hq` | Moniker franchise |
| `dev@refueler.io` | `admin` | Admin / dev console |

---

## Snag list — active

| ID | Item | Priority | Target |
|---|---|---|---|
| S-22 | Email fallback link block — spacing | Low | Future email session |
| S-doc-1 | Process doc footer wraps in Chrome PDF | Low | Next process doc iteration |

**Permanently closed:** ~~S-LN-1~~ · ~~S-12~~ · ~~S-14~~ · ~~S-18~~ · ~~S-23~~ · ~~S-24~~ · ~~S-25~~ · ~~S-26~~ · ~~S-27~~

---

## Ongoing action items (Rajesh)

- **Open Revolut Business account** ← Stripe fiat commission payout destination
- **Open Blink ops wallet ("Refueler Ops")** ← Blink mobile app, second BTC wallet
- **Create Refueler Crypto Ops Ledger** ← sats + GBP equivalent columns, separate doc
- Push BRIDGE v4.8 to `numo-fork/`, `refueler-share/`, `refueler-legend/`, `refueler-pass/`, `refueler-io/docs/`
- Place `NUMO-PAY-A-ADR.md` at `numo-fork/NUMO-PAY-A-ADR.md` and `refueler-io/docs/NUMO-PAY-A-ADR.md`
- Add test `onchain_address` to Raj's Steakhouse in Supabase dashboard
- Push `refueler-app` dev branch ← CA-1 prerequisite
- Disconnect `share.refueler.io` from Cloudflare Pages
- Upgrade Supabase to Pro when first real merchant goes live
- Upgrade Cloudflare Workers to Paid ($5/month) before production volume
- Send Mapbox coordinate accuracy email (in drafts)
- Visit Apple Store — iPad 10.9″ portrait layout check (G-3)
- New Anthropic API key → rotate before csuite briefing reuse
- football-data.org API key ready for Events intelligence layer session
- Lawyer briefing: draft written brief before Pass appointment
- Commission rate / double-ask planning conversation — before first real merchant

---

## Queued sessions — forward plan

| # | Session | Scope | Type | Status |
|---|---|---|---|---|
| ✅ | **NumoPay-A** | Architecture decisions record | Opus uncounted | CLOSED CC-99 |
| ✅ | **NumoPay-B** | Auth scaffold, CDK removal, theming | Sonnet counted | **CLOSED CC-100** |
| 1 | **NumoPay-C** | Catalogue Supabase repoint · payment flows · history · strings | Sonnet counted | **Next** |
| 2 | **CC-101 / Owner tab enrichment** | Darwin/fixtures toggle, all-time stats, last order, venue status | Sonnet counted | After NumoPay-C |
| — | **Menu Management v1** | CSV import, time-based menus, menu-item primitive | Sonnet counted | After NumoPay-C |
| — | **CA-1** | Consumer App Track. Prerequisite: dev branch push. | Opus uncounted | After NumoPay-C |
| — | **Block 8** | Fiat → sats rewards | Sonnet counted | After Menu Management v1 |
| — | **Pass-A** | Proxy pickup credential, credential structure | Opus uncounted | After NumoPay-C |
| — | **Events intelligence layer** | Football fixtures, Darwin toggle, horizon strip tenants | Sonnet counted | Gap |
| — | **Staff Management v1** | Per-staff accounts, AM Blink wallet, ops monitoring | Sonnet counted | Gap |
| — | **Commission planning** | Rate / double-ask model — before first real merchant | Opus uncounted | Gap |
| — | **Legend Owner tab integration** | Embedded balance/tx via Legend API | Dedicated session | Post-B9 |
| — | **Privacy page update** | Sections 7, 8, 10 + merchant GDPR + Resend Article 30 | Sonnet counted | Gap |
| — | **Share API planning** | Pay-per-use API v1 | Opus uncounted | Before AD-2 |
| — | **AD-2** | Share admin dashboard | Sonnet counted | After Share API planning |
| — | **Session A (CDK mint)** | CDK mint architecture | Opus uncounted | After Block 8 |
| — | **Status page** | `refueler.io/status/` | Sonnet counted | After first real merchant |
| — | **September User Guide update** | LN address change section, anti-phishing, AM checklist | Sonnet counted | September |
