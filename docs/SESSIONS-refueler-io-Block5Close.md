# SESSIONS — refueler-io
*Canonical session log for `rajesh-taylor/refueler-io`.*
*Last updated: Block-5 Close · 2026-08-16 (Opus uncounted. Block 5 formally reviewed. Go-live pressure removed. Sim-Close stages redefined. Session queue reordered. S-12 and S-14 permanently closed.)*

---

## Session allocation

Primary: 500 · Buffer: 50 · Total: 550
Planning/Opus sessions: uncounted. Buffer untouchable until a block overruns.
**Block review sessions** — standing uncounted Opus at end of each block. Recalibrate priorities and allocation.

Sessions used to Block-5 Close: ~86 counted + uncounted planning sessions.

---

## Block map

| Block | Scope | Status |
|---|---|---|
| Block 0 | Theme default, footer stamp, CC-25 banner, sessions query fix | ✅ CC-65 |
| Block 1 | Schema hardening: RLS, opsTogglePause, PIN RLS | ✅ CC-66 |
| Block 2 | Consumer app ↔ merchant tablet live connection | ✅ CC-69 |
| Block 4 | Dev console hardening + investor telemetry | ✅ CC-65 |
| Block M | Share migration — `share.refueler.io` → `refueler.io/share/` | ✅ M-3 |
| Block 3 | Franchise dashboard | ✅ CC-81 |
| **Block 5** | Merchant onboarding + simulation discipline | ✅ Block-5 Close — capability complete, no go-live date set |
| **Block 8** | Fiat → sats rewards | 🟡 After Menu Management v1 |
| Pass-A/B | Pass planning sessions | 🟡 After Bitcoin Events × Pass × Merchant scoping |
| Block 9 | LNBits integration | ⚪ Deferred post Block 8 |
| Block 6 | Darwin Push Port upgrade | ⚪ Deferred — non-gating |
| Block 7 | Passenger count join | ⚪ Deferred — non-gating |
| Block 10+ | iOS/Android beta prep, Darwin bridge, Ticketing MVP | ⚪ Future |

---

## CSS rationalisation track — complete

| Session | Scope | Status |
|---|---|---|
| CSS-1 through CSS-3 | Design reference, audit, blueprint | ✅ Closed — uncounted |
| CSS-4 | Implement new global.css | ✅ commit 2cbc496 |
| CSS-5 | Full site verification + Legend layout removal | ✅ commits 9f44d3b, 7fb04de, 83c9fa9, 7ed7ac3 |
| CSS-6 | Page CSS rationalisation | ✅ Closed |
| CSS-7 | Share design — upload complete, download page, progress states | ✅ Closed |
| CSS-7b | Share fixes + nav reorder | ✅ Closed |

---

## Session log

### Block-5 Close — date: 2026-08-16
**Scope:** Block 5 formal review and recalibration. Opus uncounted.

**Block 5 verdict:** Capability complete. No go-live date. First real merchant when the product is genuinely ready.

**Sim-Close stages ratified:**
- Stage 1: Internal onboarding process doc (to produce — third internal doc, staff use only)
- Stage 2: Operational sim — PASSED (browser, CC-85). iPad check non-blocking.
- Stage 3: Payment sim — FAILED/not yet run. Standalone Sonnet session after schema migration.
- Stage 4: Physical handover — non-blocking. Print when stable.

**Permanently closed:**
- S-12 `car_park_occupancy` — strip from FEEDS array on next `rail-signal-poll` touch. Never re-add.
- S-14 Costa label — fix on next `rail-signal-poll` touch. Off snag list permanently.

**Key decisions:**
- Go-live pressure removed permanently. Block 5 is "capability complete."
- S-18 scoped as architecture move: PIN verification server-side (Edge Function), not just a hash swap.
- S-23 + S-24 bundled into one Sonnet session.
- Schema migration is the next session — highest priority, unblocks Stage 3 and onboarding data capture.
- TDP track moves after Stage 3 sim — go live on current terminal design, TDP refines it afterwards.
- Share API planning session added (pre-AD-2): pay-per-use API, photographer/legal v1 segments, recipient flywheel.
- Safari upload ceiling (~1.5 GB) logged as constraint. Chunked streaming encryption is the fix.
- BRIDGE bumped to v4.2 with Share platform notes.

---

### Design-A — date: 2026-08-15
**Scope:** Block 5 continued. Merchant handover documents — layout + styled HTML. Opus uncounted.
**Commit:** `f0157ef` — 2 files created, 821 insertions(+)

**Outputs:**
- `docs/merchant-onboarding-v1.html` — User Guide, 6 A4 pages, print-ready
- `docs/merchant-venue-keys-v1.html` — Venue Keys card, 1 A4 page, print-ready

**Design decisions locked:** "The Manual" layout — single column, gold hairlines above each h2. Two standalone files. Gold on h2 dividers and warn-banner only. Arrivals strip IBM Plex Mono single line. Warning banner above card at full width. Version in masthead only. No print footer on final page. "Nothing stops this train." removed from merchant-facing docs.

**Page breaks (User Guide):** p.1 masthead+overview / p.2 signing in+PINs / p.3 opening+end-of-day / p.4 walk-in+arrivals / p.5 views+signout+support / p.6 venue details+get in touch+stamp.

**Docs ↔ UI sync rule:** active. Confirm currency at every block close touching terminal UI.

---

### Onboarding-A — date: 2026-08-15
**Scope:** Block 5 continued. Merchant onboarding flow end-to-end. Handover document copy v3. Opus uncounted.

**Outputs:** Copy v3 signed off → `docs/merchant-onboarding-copy-v3-final.md`. Internal AM briefing notes drafted.

**Flow confirmed (Stages 0–7):** Gates → data capture (Lightning/on-chain/SP addresses) → coord verification → provisioning → pre-flight 21-sat test payment → physical handover → go-live → staged rollout.

**Key decisions:** Support: support@refueler.io, 2-hour SLA, Mon–Fri 7am–6pm. Tear strip: Owner PIN + 3 wallet addresses (never digital). TDP-A/B/C track established. Owner-away policy logged.

**Schema pending:** `lightning_address`, `onchain_address`, `silent_payment_address`, `mapbox_place_id` on `venue_partners`.

---

### CC-85 — date: 2026-08-14
**Scope:** Block 5 continued. Branded magic link email. First full simulation run. OPS sign-out button. Redirect URL cleanup. Sonnet counted.
**Commits:** `17ecb40` (S-19 Cancel button), `306a587` (S-21 OPS sign-out)
**Snags closed:** S-9, S-19, S-20, S-21. **Added:** S-22 (low), S-23 (High).

---

### CC-84 — date: 2026-08-13
**Scope:** Block 5 continued. Portrait layout (S-16), walk-in order overlay, New Order bar, S-17 breakpoint architecture. Sonnet counted.
**Commit:** `d0defcc`

---

### CC-83b — date: 2026-08-12
**Scope:** Block 5 production code. Sonnet counted.

---

### CC-83 — date: 2026-08-12
**Scope:** Block 5 design session. Design-only, no code.

---

## Session queue — forward plan (reordered Block-5 Close)

| # | Session | Scope | Type | Status |
|---|---|---|---|---|
| 1 | **Schema migration** | 4 cols on `venue_partners` + session-lifetime check | Sonnet counted | **Next** |
| 2 | **S-23 + S-24 bundle** | Queue sign-out button + touch icons + favicon | Sonnet counted | Queued |
| 3 | **S-18 — PIN auth server-side** | Move PIN verification to Edge Function, bcrypt/argon2, rate-limit | Sonnet counted | Queued |
| 4 | **Internal onboarding process doc** | Stage 1 sim deliverable — staff doc for adding a venue partner | Sonnet counted | Bundle with schema or own short session |
| 5 | **Payment sim — Stage 3** | Full Blink invoice → settlement → webhook → terminal | Sonnet counted | After schema migration |
| 6 | **TDP-A** | Terminal Design Philosophy — audit, comparators, primitives | Opus uncounted | After Stage 3 sim |
| 7 | **TDP-B** | Terminal redesign — menu, events, NumoPay | Opus uncounted | After TDP-A |
| 8 | **TDP-C** | NumoPay fork alignment | Opus uncounted | After TDP-B |
| — | **Menu Management v1** | CSV import, time-based menus | Sonnet counted | After TDP-B |
| — | **NumoPay-A** | Fork review, API contract, BitChat research | Opus uncounted | After TDP-C |
| — | **Block 8** | Fiat → sats rewards | Sonnet counted | After Menu Management v1 |
| — | **Events intelligence layer** | Football fixtures, Darwin toggle, horizon strips | Sonnet counted | Can run in gap — no hard dependency |
| — | **Privacy page update** | Sections 7, 8, 10 + merchant + Legend free-tier | Sonnet counted | Any gap — no dependencies |
| — | **Sim-Close** | Formal sign-off all 4 stages | Opus uncounted (≤2) | After Stage 3 sim + internal doc |
| — | **Share API planning** | Pay-per-use API, photographer/legal v1, v1/v2/v3 staging | Opus uncounted | Before AD-2 |
| — | **AD-2** | Share admin dashboard | Sonnet counted | After Share API planning |
| — | **Owner tab doc tiles** | Amber/green download indicators | Sonnet counted | Post Sim-Close |
| — | **Changelog panel** | Reverse-chronological change list in Owner tab | Sonnet counted | Post Sim-Close |
| — | **Design-A2** | Terminal screenshots in User Guide | Opus uncounted | After TDP-B (~3–4 weeks) |
| — | **Bitcoin Events × Pass × Merchant** | Scoping — GDPR, credential design, Madeira | Opus uncounted, extended thinking | Before Pass-A |
| — | **Pass-A** | Full Pass scope + Pass Wallet card | Opus uncounted | After Block 8 + Events session |
| — | **Session A (CDK mint)** | CDK mint architecture | Opus uncounted | After Block 8 |

---

## Block-5 Close — CLOSED

Session closed 2026-08-16. Block 5 capability complete. No go-live date.
Next session: **Schema migration** — 4 columns on `venue_partners` + session-lifetime check. Sonnet counted.
