# SESSIONS — refueler-io
*Last updated: Sim-Close · 2026-08-17 (Opus uncounted. Sim-Close formally declared complete. INCIDENT-PROTOCOL.md produced. Pre-merchant gate list confirmed. Forward queue adjusted — Hardening-A slotted immediately post-Sim-Close, G-1 named as TDP-B gate item.)*

---

## Session allocation

Primary: 500 · Buffer: 50 · Total: 550
Planning/Opus sessions: uncounted. Buffer untouchable until a block overruns.

Sessions used to CC-93: ~92 counted + uncounted planning sessions.

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
| **Sim-Close** | Formal simulation sign-off | ✅ **DECLARED COMPLETE 2026-08-17** |
| **Block 8** | Fiat → sats rewards | 🟡 After Menu Management v1 |
| Pass-A/B | Pass planning sessions | 🟡 After Bitcoin Events × Pass × Merchant |
| Block 9 | LNBits integration | ⚪ Deferred post Block 8 |

---

## CSS rationalisation track — complete

CSS-1 through CSS-7b all closed.

---

## Session log

### Sim-Close — date: 2026-08-17
**Type:** Opus uncounted.
**Scope:** Formal sign-off all 4 stages + INCIDENT-PROTOCOL.md + forward queue review.
**Commits:** none (document deliverable only — Rajesh places INCIDENT-PROTOCOL.md in `docs/` and commits).

**Sim-Close declared complete.** All four stages confirmed:
- Stage 1: ✅ CLOSED CC-91
- Stage 2: ✅ PASSED CC-85 (iPad check non-blocking, do before first real merchant)
- Stage 3: ✅ PASSED CC-92
- Stage 4: Non-blocking

**Deliverable produced:** `INCIDENT-PROTOCOL.md` — ecosystem-wide incident response protocol. Placed in `refueler-io/docs/`. Supersedes `legend-incident-protocol.md` for ecosystem-wide matters.

**Pre-merchant gate list confirmed (G-1 through G-5):**
- G-1: Merchant settlement wiring — **hard blocker**, named TDP-B gate item
- G-2: Menu Management v1 — hard blocker, queued after TDP-B
- G-3: iPad physical check — should-do before first real merchant
- G-4: Hardening-A — should-do, Hardening-A slotted immediately post-Sim-Close
- G-5: S-26 orders→venue_partners FK — low, fold into Hardening-A

**Three-wallet sim setup confirmed:**
- WoS = merchant wallet (invoice destination once G-1 resolved)
- Blink = Refueler treasury (current invoice destination — to change)
- Minibits = customer wallet (test payer once WoS is invoice destination)

**Forward queue adjustments:**
- Hardening-A moved to immediately post-Sim-Close (was "floating")
- G-1 settlement wiring named as explicit TDP-B gate item (was "post-TDP, implied")
- Status page (`refueler.io/status/`) scoped as a future Sonnet session, low priority until first real merchant

**Status page direction (deferred):** Global `refueler.io/status/` page — product-row format, static-first, manually updated during incidents. Small coloured dot in homepage nav linking to it. Not a modal. Scope separately after first merchant.

---

### CC-92 — date: 2026-08-17
Stage 3 payment simulation PASSED. Migration `cc92_steakhouse_activate_lightning_address`. **CLOSED.**

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

## Session queue — forward plan (post-Sim-Close)

| # | Session | Scope | Type | Status |
|---|---|---|---|---|
| 1 | **Hardening-A** | Supabase-wide RLS + anon grant audit. First item: anon blanket grants on `merchant_users`. Remove old SHA-256 PIN columns. S-26 FK. | Opus uncounted | **Next** |
| 2 | **TDP-A** | Terminal Design Philosophy — audit, comparators, primitives | Opus uncounted | After Hardening-A |
| 3 | **TDP-B** | Terminal redesign — menu, events, NumoPay. G-1 settlement wiring is a named gate item. | Opus uncounted | After TDP-A |
| 4 | **TDP-C** | NumoPay fork alignment | Opus uncounted | After TDP-B |
| — | **Menu Management v1** | CSV import, time-based menus | Sonnet counted | After TDP-B |
| — | **CA-1** | Consumer App Track. **Prerequisite: dev branch push.** | Opus uncounted | After TDP-C |
| — | **NumoPay-A** | Fork review, API contract, noun/verb/handle taxonomy | Opus uncounted | After TDP-C |
| — | **Block 8** | Fiat → sats rewards | Sonnet counted | After Menu Management v1 |
| — | **Events intelligence layer** | Football fixtures, Darwin toggle | Sonnet counted | Gap |
| — | **Privacy page update** | Sections 7, 8, 10 + merchant + Legend | Sonnet counted | Gap |
| — | **Share API planning** | Pay-per-use API v1 | Opus uncounted | Before AD-2 |
| — | **AD-2** | Share admin dashboard | Sonnet counted | After Share API planning |
| — | **Session A (CDK mint)** | CDK mint architecture | Opus uncounted | After Block 8 |
| — | **Status page** | `refueler.io/status/` global page + nav dot | Sonnet counted | After first real merchant |

---

## Sim-Close — CLOSED

Declared complete 2026-08-17. INCIDENT-PROTOCOL.md produced.
Next session: **Hardening-A** — Opus uncounted. Supabase-wide security hardening. First agenda item: anon role blanket grants on `merchant_users`.

---

## Opening prompt for Hardening-A

```
Hardening-A — Supabase-wide security hardening pass
Type: Opus uncounted
Context files: docs/MasterContext_IO_CC93.md · docs/SESSIONS-refueler-io-CC93.md

Sim-Close is complete. Hardening-A is the next session — slotted immediately because it is
a pre-merchant gate (G-4): real PINs and real merchant data go behind this surface.

Agenda (in order):
1. Audit anon role grants on merchant_users — first flagged SECURITY-RESEARCH-LOG.md 2026-08-12.
   The blanket SELECT grant on merchant_users is the primary concern. merchant_users_safe view
   and column-level grants exist (CC-90) but the underlying table-level anon grant may persist.
   Verify via information_schema.column_privileges and role_table_grants. Tighten to minimum
   necessary.
2. Remove old SHA-256 PIN columns (staff_pin_hash, owner_pin_hash) from merchant_users.
   bcrypt columns are live and tested. The old columns are dead weight with a misleading name.
   Migration: cc[N]_remove_sha256_pin_columns.
3. S-26: Add orders→venue_partners FK if missing. One-line migration or fold into item 2.
4. Broader RLS audit — any other tables with overly permissive grants? Pull the full
   information_schema picture before touching anything.
5. Produce a short findings log entry for SECURITY-RESEARCH-LOG.md.

Known context:
- merchant_users_safe view: id, user_id, venue_id, role, created_at (no PIN columns)
- Column-level grants applied CC-90 via information_schema.column_privileges
- verify-pin v2 never returns PIN hashes — reads only via bcrypt comparison
- Hardening-A first agenda item was flagged at CC-90 and carried forward explicitly
```
