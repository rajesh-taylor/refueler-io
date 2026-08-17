# SESSIONS — refueler-io
*Last updated: CC-92 · 2026-08-17 (Sonnet counted. Stage 3 payment simulation PASSED. Migration cc92_steakhouse_activate_lightning_address. No code commits.)*

---

## Session allocation

Primary: 500 · Buffer: 50 · Total: 550
Planning/Opus sessions: uncounted. Buffer untouchable until a block overruns.

Sessions used to CC-92: ~92 counted + uncounted planning sessions.

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
| **Block 5** | Merchant onboarding + simulation discipline | ✅ Block-5 Close — capability complete |
| **Block 8** | Fiat → sats rewards | 🟡 After Menu Management v1 |
| Pass-A/B | Pass planning sessions | 🟡 After Bitcoin Events × Pass × Merchant |
| Block 9 | LNBits integration | ⚪ Deferred post Block 8 |

---

## CSS rationalisation track — complete

CSS-1 through CSS-7b all closed.

---

## Session log

### CC-92 — date: 2026-08-17
**Scope:** Stage 3 payment simulation. Sonnet counted.
**Migration:** `cc92_steakhouse_activate_lightning_address`
**Commits:** none (DB migration only)

**Prerequisites confirmed:**
- JWT expiry 43200s — confirmed in Supabase dashboard (screenshot)
- `blink-webhook` v15, `verify_jwt: false` ✓
- `create-order` v9 active ✓
- Schema columns (`settled_sats`, `routing_fee_sats`, `payment_status`, `status`) all present ✓
- Queue filter `status=in.(pending,in_prep,ready)` correct ✓

**Blocker resolved:**
- `venue_partners.active = false` — fixed via migration to `true`
- `venue_partners.lightning_address = null` — set to `trickdraw318@walletofsatoshi.com` (WoS sim wallet)

**Sim run — step by step:**
1. JWT extracted from live `steakhouse@rajeshtaylor.com` browser session via `getSbClient().auth.getSession()`
2. `create-order` called via curl — returned BOLT11 invoice, 21 sats, clean response ✓
3. Invoice paid from WoS wallet (`trickdraw318@walletofsatoshi.com`) — 21 sats + 3 sat WoS fee ✓
4. `blink-webhook` v15 fired — confirmed via DB state ✓
5. `merchant_orders`: `status=pending`, `payment_status=paid`, `paid_at=2026-08-17 10:16:18 UTC` ✓
6. `orders`: `status=confirmed`, `payment_status=paid`, `settled_sats=21`, `routing_fee_sats=0` ✓
7. Terminal Queue: tile `#43E63A · Order`, `PENDING` badge gold, appeared within 15s poll ✓

**All 7 pass criteria met. Stage 3 PASSED.**

**Snag logged:**
- S-25: Order tile background hardcoded `#26282C` — does not adapt to Paper theme. Fix: use `--surface`/`--surface-raised` tokens. Target: next terminal CSS touch.

**Architectural note confirmed:**
- `create-order` invoices on Refueler Blink wallet — merchant `lightning_address` stored but not yet in invoice path. Post-TDP decision.

**Stage 3 decision — sim method:**
- curl preferred over consumer app for Stage 3 (app E2E is CA-1 scope, not Stage 3)
- WoS wallet correct test payer — proves real Lightning payment, not circular self-payment
- Invoice pasting from curl response is friction; noted for CA-1 (app removes this entirely)

---

### CC-91 — date: 2026-08-16
Stage 1 sim deliverable complete. `merchant-onboarding-process-v1.html`. Commit `a5cc342`. **CLOSED.**

### CC-90 — date: 2026-08-16
S-18 PIN auth fully closed. Commits `af679f6`, `0903ad6`. **CLOSED.**

### CC-89 — date: 2026-08-16
bcrypt columns migration `cc89_pin_bcrypt`. **CLOSED.**

### CC-88 — date: 2026-08-16
S-23 + S-24 bundle. Commit `083f2a2`. **CLOSED.**

### CC-87 — date: 2026-08-16
Schema migration `cc87_venue_partners_wallet_addresses`. **CLOSED.**

### Block-5 Close — date: 2026-08-16
Opus uncounted. Block 5 verdict: capability complete, no go-live date. **CLOSED.**

### Design-A — date: 2026-08-15
User Guide (6pp) + Venue Keys card (1pp). Commit `f0157ef`. **CLOSED.**

---

## Session queue — forward plan (post-CC-92)

| # | Session | Scope | Type | Status |
|---|---|---|---|---|
| 1 | **Sim-Close** | Formal sign-off all 4 stages + INCIDENT-PROTOCOL.md | Opus uncounted (≤2) | **Next** |
| 2 | **TDP-A** | Terminal Design Philosophy — audit, comparators, primitives | Opus uncounted | After Sim-Close |
| 3 | **TDP-B** | Terminal redesign — menu, events, NumoPay | Opus uncounted | After TDP-A |
| 4 | **TDP-C** | NumoPay fork alignment | Opus uncounted | After TDP-B |
| — | **Menu Management v1** | CSV import, time-based menus | Sonnet counted | After TDP-B |
| — | **CA-1** | Consumer App Track. **Prerequisite: dev branch push.** | Opus uncounted | After TDP-C |
| — | **NumoPay-A** | Fork review, API contract | Opus uncounted | After TDP-C |
| — | **Block 8** | Fiat → sats rewards | Sonnet counted | After Menu Management v1 |
| — | **Events intelligence layer** | Football fixtures, Darwin toggle | Sonnet counted | Gap |
| — | **Privacy page update** | Sections 7, 8, 10 + merchant + Legend | Sonnet counted | Gap |
| — | **Hardening-A** | Supabase-wide RLS + anon grant audit | Opus uncounted | After Sim-Close |
| — | **Share API planning** | Pay-per-use API v1 | Opus uncounted | Before AD-2 |
| — | **AD-2** | Share admin dashboard | Sonnet counted | After Share API planning |
| — | **Session A (CDK mint)** | CDK mint architecture | Opus uncounted | After Block 8 |

---

## CC-92 — CLOSED

Stage 3 PASSED 2026-08-17. Migration `cc92_steakhouse_activate_lightning_address`.
Next session: **Sim-Close** — Opus uncounted (≤2 sessions). Formal sign-off all 4 stages + INCIDENT-PROTOCOL.md.

---

## Opening prompt for Sim-Close

```
Sim-Close — Stage sign-off and INCIDENT-PROTOCOL.md
Type: Opus uncounted (≤2 sessions)
Context files: docs/MasterContext_IO_CC92.md · docs/SESSIONS-refueler-io-CC92.md

All four Sim-Close stages are now complete or non-blocking:
- Stage 1: CLOSED CC-91 (merchant-onboarding-process-v1.html)
- Stage 2: PASSED CC-85 (browser sim). iPad check non-blocking.
- Stage 3: PASSED CC-92 (full payment rail — WoS → Blink → webhook → terminal queue)
- Stage 4: Physical handover — non-blocking (print when stable)

Objectives:
1. Formal Sim-Close sign-off — review all four stages, confirm pass criteria, declare
   Sim-Close complete. Identify any open items that must be resolved before first real merchant.
2. Produce INCIDENT-PROTOCOL.md in refueler-io/docs/ — ecosystem-wide incident response
   protocol covering all product surfaces. Base on legend-incident-protocol.md (if it exists)
   or produce fresh. Informed by SECURITY-RESEARCH-LOG.md 2026-08-12 Finding 3.
3. Review and confirm the forward queue: TDP-A → TDP-B → TDP-C → Menu Management v1 → CA-1.
   Any sequencing changes? Any new items to insert?
4. Update MasterContext, SESSIONS, BRIDGE at close.

Known open items at Sim-Close:
- S-25: Order tile Paper mode colour (cosmetic, not blocking)
- S-22: Email fallback link spacing (low, not blocking)
- S-doc-1: Process doc footer wrap (low, not blocking)
- Post-Sim-Close: Remove old SHA-256 PIN columns from merchant_users
- Post-Sim-Close: venue_partners.active toggle in Owner tab / Command Centre
- Hardening-A: anon role blanket grants on merchant_users (first agenda item)
```
