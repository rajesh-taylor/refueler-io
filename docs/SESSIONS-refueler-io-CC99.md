# SESSIONS — refueler-io
*Last updated: CC-99 · 2026-08-18 (NumoPay-A — Opus uncounted. Architecture decisions record produced. NUMO-PAY-A-ADR.md delivered. Session closed.)*

---

## Session allocation

Primary: 500 · Buffer: 50 · Total: 550
Planning/Opus sessions: uncounted. Buffer untouchable until a block overruns.

Sessions used to CC-99: ~95 counted + uncounted planning sessions.

---

## Block map

| Block | Scope | Status |
|---|---|---|
| Block 0 | Theme default, footer stamp, banner fixes | ✅ CC-65 |
| Block 1 | Schema hardening: RLS, PIN RLS | ✅ CC-66 |
| Block 2 | Consumer app ↔ merchant tablet live connection | ✅ CC-69 |
| Block 4 | Dev console hardening + investor telemetry | ✅ CC-65 |
| Block M | Share migration → `refueler.io/share/` | ✅ M-3 |
| Block 3 | Franchise dashboard | ✅ CC-81 |
| **Block 5** | Merchant onboarding + simulation discipline | ✅ Block-5 Close |
| **Sim-Close** | Formal simulation sign-off | ✅ DECLARED COMPLETE 2026-08-17 |
| **Hardening-A** | Supabase-wide security hardening | ✅ CC-94 |
| **TDP-A** | Terminal audit + design philosophy framing | ✅ CC-95 |
| **TDP-philosophy** | Terminal design philosophy deep-dive | ✅ CC-96 |
| **TDP-B** | Terminal redesign execution | ✅ CC-97 |
| **TDP-C** | `update-lightning-address` EF + NumoPay alignment | ✅ CC-98 |
| **NumoPay-A** | Fork architecture decisions record | ✅ CC-99 |
| **NumoPay-B** | Auth scaffold, CDK removal, theming | 🟡 Next |
| **NumoPay-C** | Catalogue, payment flows, history | 🟡 After NumoPay-B |
| **Block 8** | Fiat → sats rewards | 🟡 After Menu Management v1 |
| Pass-A/B | Pass planning sessions | 🟡 After NumoPay-B |
| Block 9 | LNBits integration | ⚪ Deferred post Block 8 |

---

## CSS rationalisation track — complete

CSS-1 through CSS-7b all closed.

---

## Session log

### CC-99 — date: 2026-08-18
**Type:** Opus uncounted (NumoPay-A — fork architecture decisions record).
**Deliverable:** `NUMO-PAY-A-ADR.md` — place at `numo-fork/NUMO-PAY-A-ADR.md` and `refueler-io/docs/NUMO-PAY-A-ADR.md`.

**Source files reviewed:**
- `OnboardingActivity.kt` (1,805 lines) — full Cashu wallet ceremony; BIP-39, 4 default mints, Nostr backup, per-mint restore. Deleted wholesale.
- `ModernPOSActivity.kt` — thin controller over CashuWalletManager, AutoWithdrawManager, PaymentMethodHandler, NFC HCE. Shell + lifecycle survives; wallet/payment/NFC logic deleted.
- `WebhookSettingsActivity.kt` — QR-provisioned endpoint store with auth key + health check + sync-all. Outbound dispatch deleted; QR provisioning mechanism repurposed as `RefuelerProvisioningActivity`.

**External references reviewed:**
- BTCPay PoS plugin — invoice metadata structure (`orderId`, `itemCode`, `posData`) and two-status settlement model (`Processing` / `Settled`) borrowed.
- LNbits TPoS — offline PIN grant pattern confirmed (server-verify at shift-start, 30-min local grant). Repo extracted from LNbits monorepo — not a buildable dependency.
- Square KotlinPoet / Mobile Payments SDK / Web Payments SDK — not applicable.
- WoS POS mode — confirms minimum viable floor-payment UX (amount → QR → paid). StableSats noted for Block 8 context only.

**Decisions locked (see ADR for full detail):**
1. **Governing decision:** NumoPay holds no funds. Permanent hard fork — no merge path to upstream.
2. **Auth:** Magic link once (AM) → EncryptedSharedPreferences JWT → verify-pin EF at shift-start → 30-min local grant. `FLAG_KEEP_SCREEN_ON`. No mid-shift re-auth.
3. **Payment routing:** LNURL-pay via `create-order` EF (Lightning) + record-only (cash/card). Realtime poll for confirmation. No Cashu melt.
4. **Item catalogue:** `merchant_menu_items` via PostgREST. `BitcoinPriceWorker` retained for GBP→sats display. Write side stays on tablet terminal.
5. **Noun/verb/handle:** `order` / `history`. `list` / `show` / `watch` / `create`. `origin` field on `merchant_orders` (`'preorder'` / `'floor'`). `RF-XXXX` order code.
6. **Theming:** `Theme.Refueler` replaces `Theme.Numo`. Carbon always-on. Canonical token set in `colors.xml`.
7. **CDK:** Removed entirely in NumoPay-B. Returns only at Block 8 / Pass floor-device redemption, pinned to stable `0.17.2`.
8. **WebhookSettings:** Repurposed as provisioning QR scan. Outbound dispatch deleted.

**Pending DDL (NumoPay-B):**
- `ALTER TABLE merchant_orders ADD COLUMN origin text NOT NULL DEFAULT 'preorder'` — apply via `apply_migration`, naming `numo_b_merchant_orders_origin`.

**Commission rate/model flagged:** `create-order` v10 `commissionPct = 15.0` is Model-A legacy. Commission rate / double-ask is an open strategic question requiring a dedicated planning conversation before first real merchant. No commission logic in NumoPay-B or NumoPay-C.

**Action items (Rajesh):**
- Place `NUMO-PAY-A-ADR.md` at `numo-fork/NUMO-PAY-A-ADR.md` and `refueler-io/docs/NUMO-PAY-A-ADR.md`
- Push BRIDGE v4.8 to all repos (BRIDGE bump needed — NumoPay hard-fork status and ADR reference)

---

### CC-98 — date: 2026-08-18
**Type:** Opus uncounted (TDP-C). `update-lightning-address` v1 deployed. NumoPay fork alignment. BRIDGE v4.7. **CLOSED.**

### CC-97 — date: 2026-08-18
**Type:** Sonnet counted (TDP-B). All 10 gate items. S-27. create-order v10. **CLOSED.**

### CC-96 — date: 2026-08-18
**Type:** Opus uncounted (TDP-philosophy). **CLOSED.**

### CC-95 — date: 2026-08-18
**Type:** Sonnet counted (TDP-A). **CLOSED.**

### CC-94 — date: 2026-08-17
Hardening-A. Six migrations. G-4 + G-5 cleared. **CLOSED.**

### Sim-Close — date: 2026-08-17
Sim-Close formally declared complete. INCIDENT-PROTOCOL.md produced. **CLOSED.**

---

## Session queue — forward plan

| # | Session | Scope | Type | Status |
|---|---|---|---|---|
| 1 | **NumoPay-B** | `origin` migration · `RefuelerProvisioningActivity` · `RefuelerAuthActivity` · PIN repoint to `verify-pin` EF · `ModernPOSActivity` gutted · CDK removed · `colors.xml`/`themes.xml`/`dimens.xml` rewrite | Sonnet counted | **Next** |
| 2 | **NumoPay-C** | `ItemListActivity` Supabase repoint · `create-order` floor call + Realtime poll · LNURL QR display · cash record-only · history repoint to `merchant_orders` | Sonnet counted | After NumoPay-B |
| 3 | **CC-100 / Owner tab enrichment** | Darwin/fixtures toggle, all-time stats, last order, venue status | Sonnet counted | After NumoPay-B |
| — | **Menu Management v1** | CSV import, time-based menus, menu-item primitive (DDL + terminal UI) | Sonnet counted | After NumoPay-B |
| — | **CA-1** | Consumer App Track. Prerequisite: dev branch push. | Opus uncounted | After NumoPay-B |
| — | **Block 8** | Fiat → sats rewards | Sonnet counted | After Menu Management v1 |
| — | **Pass-A** | Proxy pickup credential, credential structure | Opus uncounted | After NumoPay-B |
| — | **Events intelligence layer** | Football fixtures, Darwin toggle, horizon strip tenants | Sonnet counted | Gap |
| — | **Staff Management v1** | Per-staff accounts, AM Blink wallet, ops monitoring | Sonnet counted | Gap — informed by NumoPay-A |
| — | **Commission planning** | Rate / double-ask model | Opus uncounted | Before first real merchant |
| — | **September User Guide update** | LN address change section, anti-phishing, AM checklist | Sonnet counted | September |
| — | **Privacy page update** | Sections 7, 8, 10 + merchant GDPR + Resend Article 30 | Sonnet counted | Gap |
| — | **Share API planning** | Pay-per-use API v1 | Opus uncounted | Before AD-2 |
| — | **AD-2** | Share admin dashboard | Sonnet counted | After Share API planning |
| — | **Session A (CDK mint)** | CDK mint architecture | Opus uncounted | After Block 8 |
| — | **Status page** | `refueler.io/status/` | Sonnet counted | After first real merchant |
| — | **Legend Owner tab integration** | Embedded balance/tx via Legend API | Dedicated session | Post-B9 |

---

## Opening prompt for NumoPay-B

```
NumoPay-B — Auth scaffold, CDK removal, Android theming
Type: Sonnet counted
Context files: refueler-io/docs/MasterContext_IO_CC99.md · SESSIONS-refueler-io-CC99.md · numo-fork/NUMO-PAY-A-ADR.md

NumoPay-A is complete (CC-99). ADR is locked. This is the first execution session.

Scope (this session only — do not bleed into NumoPay-C):
1. Apply migration: merchant_orders origin column
   → apply_migration, name: numo_b_merchant_orders_origin
   → ALTER TABLE merchant_orders ADD COLUMN origin text NOT NULL DEFAULT 'preorder'
2. RefuelerProvisioningActivity — QR scan → EncryptedSharedPreferences
   → payload: {url, token, venue_id}
   → on success: launch RefuelerAuthActivity → PinEntryActivity → ModernPOSActivity
3. RefuelerAuthActivity — no-JWT landing screen
   → single screen: wordmark + "Ask your manager to link this device" + [Scan setup QR]
4. PinEntryActivity — repoint to verify-pin v2 EF + local grant (30 min)
   → server verify at shift-start; EncryptedSharedPreferences KEY_LOCAL_GRANT_UNTIL
   → offline fallback: proceed with banner if grant valid and server unreachable
5. ModernPOSActivity — remove CashuWalletManager, AutoWithdrawManager, NFC HCE,
   BTCMap banner, setupThemeSettings() dark-mode toggle
6. build.gradle — remove cdk-android dependency
7. colors.xml / themes.xml / dimens.xml — Theme.Refueler, Carbon token set

Read NUMO-PAY-A-ADR.md in full before writing any code.
Confirm open questions Q1 and Q2 before starting step 2.
One step at a time. Confirm output before proceeding.
```
