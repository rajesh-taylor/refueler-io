# SESSIONS — refueler-io
*Last updated: CC-94 · 2026-08-17 (Hardening-A — Sonnet counted. Six migrations applied. G-4 + G-5 cleared. anon grant surface eliminated across merchant_users and venue_partners. SHA-256 PIN columns dropped. Deprecated telemetry tables purged. orders→venue_partners FK added. Next: TDP-A.)*

---

## Session allocation

Primary: 500 · Buffer: 50 · Total: 550
Planning/Opus sessions: uncounted. Buffer untouchable until a block overruns.

Sessions used to CC-94: ~93 counted + uncounted planning sessions.

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
| **Sim-Close** | Formal simulation sign-off | ✅ DECLARED COMPLETE 2026-08-17 |
| **Hardening-A** | Supabase-wide security hardening | ✅ CC-94 |
| **Block 8** | Fiat → sats rewards | 🟡 After Menu Management v1 |
| Pass-A/B | Pass planning sessions | 🟡 After Bitcoin Events × Pass × Merchant |
| Block 9 | LNBits integration | ⚪ Deferred post Block 8 |

---

## CSS rationalisation track — complete

CSS-1 through CSS-7b all closed.

---

## Session log

### CC-94 — date: 2026-08-17
**Type:** Sonnet counted (Hardening-A execution).
**Scope:** Supabase-wide RLS and grant audit. Six migrations. G-4 + G-5 cleared.

**Migrations applied:**
- `hardening_a_merchant_users_grants` — revoked anon/authenticated write grants on `merchant_users`; dropped duplicate SELECT policy `merchant_users_safe_select_own`
- `hardening_a_venue_partners_revoke_anon_addresses` — initial column revoke (superseded by grants_clean)
- `hardening_a_venue_partners_grants_clean` — `REVOKE ALL ON venue_partners FROM anon` + `FROM authenticated`; re-granted `SELECT, UPDATE TO authenticated` only. anon: zero grants at table and column level.
- `hardening_a_orders_venue_fk` — `orders_venue_id_fkey` added. 21 rows, 0 orphans.
- `hardening_a_remove_sha256_pin_columns` — `staff_pin_hash`, `owner_pin_hash` dropped. Confirmed clean against live `verify-pin` source before dropping.
- `hardening_a_drop_deprecated_telemetry` — `log_entries`, `live_transactions`, `sessions` dropped (CASCADE). Pre-pivot field-research tables; zero live code references confirmed across all HTML, JS, and Edge Function sources.

**Key findings:**
- Flagged anon blanket SELECT on `merchant_users` (SECURITY-RESEARCH-LOG 2026-08-12) was not present — CC-90 held. The live risk was inert write grants; revoked.
- `venue_partners` had 120+ column-level grants to anon including all three payment-address columns — same latent-enumeration class as former `partners_public_read`. Eliminated.
- `merchant_users_safe` view confirmed `security_invoker=true` — anon query returns zero rows regardless of grant.
- `subscribers` confirmed sealed: `deny_all_anon_subscribers` RESTRICTIVE policy, `qual=false`.
- Dev console telemetry tables were world-readable via `qual=true` anon policies. Dropped by mutual agreement; dev console to be re-scoped in TDP-A around real operational metrics.

**SECURITY-RESEARCH-LOG.md:** Hardening-A findings entry produced and placed by Rajesh (above 2026-08-12 entry).
**Commits:** MasterContext_IO_CC94.md + SESSIONS-refueler-io-CC94.md + SECURITY-RESEARCH-LOG.md

---

### Sim-Close — date: 2026-08-17
Opus uncounted. Sim-Close formally declared complete. INCIDENT-PROTOCOL.md produced. **CLOSED.**

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

## Session queue — forward plan (post-Hardening-A)

| # | Session | Scope | Type | Status |
|---|---|---|---|---|
| 1 | **TDP-A** | Terminal Design Philosophy — audit, comparators, primitives. Dev console re-scope to incorporate. | Opus uncounted | **Next** |
| 2 | **TDP-B** | Terminal redesign — menu, events, NumoPay. G-1 settlement wiring is a named gate item. | Opus uncounted | After TDP-A |
| 3 | **TDP-C** | NumoPay fork alignment | Opus uncounted | After TDP-B |
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

## Opening prompt for TDP-A

```
TDP-A — Terminal Design Philosophy
Type: Opus uncounted
Context files: docs/MasterContext_IO_CC94.md · docs/SESSIONS-refueler-io-CC94.md

Hardening-A is complete (CC-94). TDP-A is next.

TDP-A is the first of three Terminal Design Philosophy sessions (TDP-A → TDP-B → TDP-C).
It is a planning and audit session only — no code, no commits.

Agenda:

1. Audit the current merchant terminal (merchant-tablet.html + merchant-tablet-logic.js +
   merchant-tablet-styles.css) against the locked design decisions in MasterContext.
   What is built, what is specified but not built, what has drifted.

2. Comparators — identify 2–3 reference-class terminals or order-management interfaces
   (physical or software) worth learning from. Not to copy — to understand the design
   language of the category and where Refueler departs from it deliberately.

3. Primitives — define the atomic design components the terminal needs:
   order tile, status badge, horizon strip, nav pill, owner panel, ops panel, menu item.
   Establish interaction and visual rules for each before TDP-B touches code.

4. Dev console re-scope — the pre-pivot telemetry tables (log_entries, live_transactions,
   sessions) were dropped at Hardening-A. Agree on the replacement metric set for the
   dev console: orders placed/confirmed/settled, Blink balance, active venue count,
   Edge Function invocations, and future product telemetry placeholders.

5. TDP-B gate items — produce a clear list of what TDP-B must deliver, in order,
   including G-1 (settlement wiring: create-order → venue_partners.lightning_address)
   as the hard blocker before any real merchant goes live.

Known context:
- Merchant terminal: merchant-tablet.html, merchant-tablet-logic.js, merchant-tablet-styles.css
- Design decisions locked in MasterContext: nav, horizon strip, order tiles, portrait layout
- G-1 (settlement wiring) is the named hard-blocker gate item for TDP-B
- S-25: order tile background hardcoded #26282C — does not adapt to Paper theme (fix in TDP-B)
- Dev console data sources are now null — re-scope needed
- Brand voice: James Bond, not fintech neon. Suave, discreet, refined.
```
