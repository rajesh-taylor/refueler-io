# SESSIONS — refueler-io
*Last updated: CC-98 · 2026-08-18 (TDP-C — Opus uncounted. `update-lightning-address` v1 deployed. NumoPay fork alignment. BRIDGE v4.7. Session closed.)*

---

## Session allocation

Primary: 500 · Buffer: 50 · Total: 550
Planning/Opus sessions: uncounted. Buffer untouchable until a block overruns.

Sessions used to CC-98: ~95 counted + uncounted planning sessions.

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
| **Block 8** | Fiat → sats rewards | 🟡 After Menu Management v1 |
| Pass-A/B | Pass planning sessions | 🟡 After NumoPay-A |
| Block 9 | LNBits integration | ⚪ Deferred post Block 8 |

---

## CSS rationalisation track — complete

CSS-1 through CSS-7b all closed.

---

## Session log

### CC-98 — date: 2026-08-18
**Type:** Opus uncounted (TDP-C — NumoPay fork alignment + `update-lightning-address` EF).
**Commits:** `790e2f6` (refueler-io — `update-lightning-address` v1) · `be2e106` (numo-fork — BRIDGE v4.7, rebase pending).

**Delivered:**

**Phase 1 — `update-lightning-address` v1 Edge Function:**
- S-LN-1 ✅ CLOSED.
- Deployed to Supabase: `update-lightning-address` v1, ACTIVE, `verify_jwt: true`.
- Security model: JWT via `getUser()` · Owner PIN bcrypt server-side (not browser-only) · `venue_id` derived from auth chain (never from request body) · LNURL step-1 reachability check, 5s timeout, fail-closed · service_role write (authenticated blocked by S-27) · post-write re-select verification (rule 4j) · rate limit 5/5min in-memory.
- Responses: `{ ok: true, lightning_address }` · `{ ok: false, error: 'invalid_pin' }` · `{ ok: false, error: 'unresolvable_address', detail }`.
- Owner tab Change flow is now live. Previously gracefully failing with contact-support message.

**Ops wallet decisions (logged):**
- Blink ops wallet ("Refueler Ops"): second BTC wallet under existing Blink account. Created via Blink mobile app. Rajesh action item.
- Purpose: 21-sat Lightning address confirmations, onboarding test payments, support call testing.
- AM access model: request-and-transfer until Staff Management v1.
- Refueler Crypto Ops Ledger: separate doc, columns sats + GBP equivalent at time of transfer. Logged as business expense.
- Single-provider risk (Blink down = both wallets affected): accepted pre-merchant, review at Block 8.
- Staff Management v1 items logged: separate AM Blink account; ops wallet monitoring via `blink-balance` EF (add ops wallet ID when volume justifies).

**September User Guide update flagged:**
- Lightning address change section: after any change, AM sends 21 sats from Blink ops wallet, logs in crypto ops ledger.
- Anti-phishing panel: "Refueler will never send a link you didn't request."
- On-chain address: support-only (`[R]`).
- AM onboarding checklist: 21-sat confirmation send logged.

**Drift noted (not actioned):**
- `create-order` v10 `commissionPct = 15.0` is Model-A legacy. Commission rate/model not yet finalised. Flagged for dedicated planning session — commission rates and double-ask (POS cut + fiat commission) need a standalone conversation before first real merchant.

**Phase 2 — NumoPay fork alignment:**
- Fork state confirmed: clean Numo v1.8 base, package `io.refueler.merchant`, hardening phases 1–3 complete, no Supabase integration yet.
- BRIDGE v4.7 committed to numo-fork (`be2e106`) — rebase onto `origin/main` pending (remote had `de93e42` EventModeManager commit ahead).
- Key capabilities confirmed in fork: native PIN activities, item catalogue + basket system, webhook settings UI, insights/history, auto-withdraw.
- Stack: OkHttp3 + Jackson + Gson. `cdk-android:0.17.2-rc.1` — confirm -rc.1 vs stable before Cashu work.
- NumoPay-A agenda locked (see MasterContext).
- Three source files to manually attach at NumoPay-A open: `OnboardingActivity.kt`, `ModernPOSActivity.kt`, `WebhookSettingsActivity.kt`.
- Android theming: Carbon token set maps to `themes.xml`/`colors.xml`/`dimens.xml` — not CSS.
- Auth model: Supabase magic link once (AM-assisted), then screen-on flag, staff PIN only during shift, 12h JWT, no mid-shift re-auth.

---

### CC-97 — date: 2026-08-18
**Type:** Sonnet counted (TDP-B). All 10 gate items. S-27. create-order v10. Three commit rounds. **CLOSED.**

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
| 1 | **NumoPay-A** | Fork review, auth model, API contract, noun/verb/handle taxonomy. Attach 3 source files. | Opus uncounted | **Next** |
| 2 | **CC-99 / Owner tab enrichment** | Darwin/fixtures toggle, all-time stats, last order, venue status | Sonnet counted | After NumoPay-A |
| — | **Menu Management v1** | CSV import, time-based menus | Sonnet counted | After NumoPay-A |
| — | **CA-1** | Consumer App Track. Prerequisite: dev branch push. | Opus uncounted | After NumoPay-A |
| — | **Block 8** | Fiat → sats rewards | Sonnet counted | After Menu Management v1 |
| — | **Pass-A** | Proxy pickup credential, credential structure | Opus uncounted | After NumoPay-A |
| — | **Events intelligence layer** | Football fixtures, Darwin toggle, horizon strip tenants | Sonnet counted | Gap |
| — | **Staff Management v1** | Per-staff accounts, AM Blink wallet, ops monitoring | Sonnet counted | Gap |
| — | **September User Guide update** | LN address change section, anti-phishing, AM checklist | Sonnet counted | September |
| — | **Privacy page update** | Sections 7, 8, 10 + merchant GDPR + Resend Article 30 | Sonnet counted | Gap |
| — | **Share API planning** | Pay-per-use API v1 | Opus uncounted | Before AD-2 |
| — | **AD-2** | Share admin dashboard | Sonnet counted | After Share API planning |
| — | **Session A (CDK mint)** | CDK mint architecture | Opus uncounted | After Block 8 |
| — | **Status page** | `refueler.io/status/` | Sonnet counted | After first real merchant |

---

## Opening prompt for NumoPay-A

```
NumoPay-A — Fork review, auth model, API contract
Type: Opus uncounted
Context files: docs/MasterContext_IO_CC98.md · docs/SESSIONS-refueler-io-CC98.md

TDP-C is complete (CC-98). This is the NumoPay-A fork review session.

Manually attach before opening:
  - OnboardingActivity.kt
  - ModernPOSActivity.kt
  - WebhookSettingsActivity.kt
(Find at: /Users/rajeshtaylor/Documents/refueler.io/terminals/numo-fork/app/src/main/java/io/refueler/merchant/)

Agenda:
1. Auth model — replace/wrap OnboardingActivity with Supabase magic link + staff PIN.
   Screen-on flag. No mid-shift re-auth. 12h JWT.
2. Payment routing — order entry → merchant_orders via Supabase. Not Cashu melt.
3. Item catalogue — Supabase merchant_menu_items as single source. Study NumoPay's
   native catalogue UI/UX before deciding what to keep vs replace.
4. Noun/verb/handle taxonomy — order code as universal join key across the full flow.
5. Android theming — map Refueler Carbon token set to themes.xml / colors.xml / dimens.xml.
6. CDK — confirm cdk-android:0.17.2-rc.1 vs stable before any Cashu work.

Note: commission rate/model needs a dedicated planning conversation before first real
merchant — the double-ask (POS cut + fiat commission) is an open strategic question.
Do not assume 6-8% in any NumoPay-A architecture decisions.
```
