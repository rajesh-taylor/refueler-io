# SESSIONS — refueler-io
*Last updated: CC-96 · 2026-08-18 (TDP-philosophy — Opus uncounted. Terminal design philosophy settled across six agenda items. TDP-B scope and gate list finalised. Next: TDP-B.)*

---

## Session allocation

Primary: 500 · Buffer: 50 · Total: 550
Planning/Opus sessions: uncounted. Buffer untouchable until a block overruns.

Sessions used to CC-96: ~94 counted + uncounted planning sessions.

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
| **TDP-A** | Terminal audit + design philosophy framing | ✅ CC-95 |
| **TDP-philosophy** | Terminal design philosophy deep-dive | ✅ CC-96 |
| **Block 8** | Fiat → sats rewards | 🟡 After Menu Management v1 |
| Pass-A/B | Pass planning sessions | 🟡 After Bitcoin Events × Pass × Merchant |
| Block 9 | LNBits integration | ⚪ Deferred post Block 8 |

---

## CSS rationalisation track — complete

CSS-1 through CSS-7b all closed.

---

## Session log

### CC-96 — date: 2026-08-18
**Type:** Opus uncounted (TDP-philosophy — Terminal Design Philosophy deep-dive).
**Scope:** Six agenda items. All philosophy settled. TDP-B scope finalised. Three new product architecture decisions locked.

---

**KEYSTONE — first-principles definition (locked):**

The Refueler terminal is an *arrival instrument*, not an order-management system. Its one irreducible job is to tell a craftsperson that a particular customer is about to walk in, early enough to time the work to the moment. It does not manage the merchant's pace; it gives them the single piece of information they cannot get any other way — *when* — and then gets out of the way. If a surface does not help the merchant know who is coming, serve them well, or run their own shop on their own terms, it does not belong on this terminal.

This definition settles future design disputes by reference.

---

**1 — SIDEBAR: removed. Horizon strip promoted.**

- Mapbox mini-map: **cut entirely.** A merchant knows where their own café is.
- Active Site card: **cut from permanent chrome.** Owner context only, if anywhere. Single-venue independent has no use for it in permanent furniture.
- Queue Summary card: **cut.** Duplication — pending/prep/ready is legible from tiles; arrival counts are in the strip.
- Darwin feed: **promoted fully into the horizon strip** as the primary intelligence rail.
- 340px reclaimed for the queue: larger tiles, bigger type, more air. Directly pays the accessibility mandate.
- In Ops Mode the strip may dim or minimise — the merchant in Ops is configuring, not watching arrivals.

---

**2 — HORIZON STRIP: slot-based arrival-intelligence primitive (locked architecture).**

The strip is not a Darwin component. It is a **slot-based arrival-intelligence primitive**. Its tenants are provisioned at venue setup based on `mapbox_place_id` proximity:

- **Darwin/rail** — venues near a station (Fenchurch St corridor primary)
- **Fixtures** (football-data.org API, already subscribed) — venues near stadia or sports centres
- **Both** — venues in both catchments carry two rows or two segments
- **Pass** (future, unscoped) — queued for its own Opus design session(s) before integration

The merchant does not configure the strip. The strip renders whatever is relevant to their location. This is the architecture that makes the terminal portable beyond the Fenchurch St corridor with zero UI complexity added.

**TDP-B builds the slot primitive, not a Darwin widget.** Refueler Pass as a strip tenant requires dedicated design sessions before it plugs in — logged in the queue below.

---

**3 — OPS PANEL: card grid, single honest toggle.**

- **One boolean, one control: Open / Closed.** `active = false` stops new orders; the current queue always drains. The two-toggle model is dishonest and abolished.
- **Honest copy locked:** "Closed — no new orders. Your current queue is unaffected."
- **Layout: calm card grid.** Not a settings list. Owner visits Ops rarely; it should feel like a dashboard tile surface, not a toggle bank. Cards: Trading status (the toggle), Lightning address, Staff access (PIN reset, when built), Menu (when built).
- **No ghost cards for unbuilt features.** The grid holds what exists and grows as features land.
- **`is_paused` column:** not added now. If a real "pause queue, finish current" need surfaces from live merchants, add the column honestly then. Do not pre-empt it.

---

**4 — ACCESSIBILITY PRINCIPLES (six sentences, not a WCAG checklist):**

1. **Legible at two feet without spectacles.** Identifier ≥18px, item name 14–16px is the floor, not the target.
2. **Status is never colour alone.** Pending-gold / prep-blue / ready-green always doubled by the word and the position. Glare and colour-blindness must lose nothing.
3. **Nothing critical depends on hearing.** No arrival, order, or state change is announced by sound alone. Sound is a courtesy, never a channel.
4. **No motion that demands.** No flashing, no pulsing urgency, no count-up timers. A tile appears; a number changes.
5. **Generous targets, forgiving taps.** Big zones, confirmation before anything irreversible, no tiny corner-X.
6. **The terminal never implies the merchant is late.** It informs; it does not judge. This principle is not in any accessibility standard and is the one that matters most.

---

**5 — LUXURY-CALM REGISTER (the Aman translation, locked):**

- **Restraint over density.** The reclaimed 340px becomes air, not more widgets.
- **Anticipation, not instruction.** The strip surfaces the customer before the merchant asks. No coach-marks, no tooltips after first run.
- **Materials that reward attention.** Type, spacing, alignment, palette exactness are the materials. Gold worn once, precisely, on pending status — never spread across chrome.
- **Calmest when busiest.** The terminal gets quieter and clearer under load, not louder. This is the line that separates it from every KDS on the market.
- **It honours the craft.** The terminal gives information and trusts the merchant to act.

**Register test sentence (to settle future disputes):** It should behave like a good maître d' — present when needed, invisible when not, never flustered, always a half-step ahead, and unmistakably working for you rather than the other way round.

---

**6 — DIGITAL STAMPS: placement, trigger, and merchant relationship (locked).**

- **Issuance: silent, passive.** No "confirm stamp?" dialog. No merchant action required. The stamp is issued automatically on fulfilment.
- **Trigger: FULFILLED (READY status).** Not paid. The stamp is earned for the coffee actually received.
- **Visual: a calm stamp glyph settling onto the tile as it completes.** Glanceable, never celebratory. No badge, no confetti.
- **Plumbing-agnostic architecture (locked):** The terminal's stamp UI must not change when the backend moves from LNURL-withdraw (v1) to Cashu NUT-00 (v2, post-mint). The mint swap is a backend event; it must never surface as a merchant-facing change. This scopes refueler-mint integration: the terminal stamp primitive is plumbing-neutral.
- **Human gesture (cut):** The "this one's on me" model is cut. It creates ambiguity about whether the 10th-stamp reward is still available; the customer's app handles the reward moment. No merchant action, no counter negotiation.
- **Consumer redemption:** Customer app notifies the user they've earned a free drink. No NFC tap or scan required at point of redemption for the standard stamp flow.
- **Merchant stamp metrics (reserved, not built):** Privacy-preserving aggregate metrics (stamps issued, stamps redeemed, outstanding, "X customers within 2 of a reward") are architecturally possible from mint keyset state without individual tracking. Housed in Owner tab / Ops. Not built now — reserve the space in TDP-B, drop real data in at Block 8 or post-mint.

---

**NEW — PROXY PICKUP CREDENTIAL (logged for Pass-A scope):**

The 6-digit code / NFC tap is a **proxy pickup credential**: the payer authorises a named or bearer pickup, and the person at the counter presents the code or tap to claim the order. This is a Pass primitive, not a stamp primitive. Three confirmed use cases:

1. **Gift / refer-a-friend:** Purchaser buys a coffee for a friend; friend presents code to collect.
2. **Delegated pickup:** Father pays via app; son presents code at counter to collect the order.
3. **Pub rounds:** One person orders and pays for a round; designated collector presents code at the bar without the payer leaving their seat.

This is the first non-commuter use case demonstrably better than cash or card. Log against Pass-A scope and the Bitcoin Events × Pass × Merchant arc. Not a stamp feature; not Block 8.

---

**TDP-B gate list (finalised CC-96):**

1. **G-1 — Settlement wiring** (hard blocker): `create-order` must invoice to `venue_partners.lightning_address`
2. **S-27 — Column restriction** (security, pre-merchant): column-level UPDATE grant on `venue_partners` — `active` + `pause_reason` only
3. **Token migration** (D-1, D-2, D-3): canonical hex set, abolish pre-CSS-1a values, strip `backdrop-filter`, drop `--c-text-*` aliases, S-25 resolves
4. **Ops toggle model**: single honest Open/Closed toggle, card-grid layout, honest copy
5. **Menu-item primitive spec**
6. **First-login welcome**: venue name + orientation, one-time; copy speaks to merchant identity
7. **Change Lightning address flow** in Owner tab with Venue Keys reprint prompt
8. **Stamp glyph primitive**: calm settle animation on tile completion, plumbing-agnostic
9. **Stamp metric space reserved** in Owner tab (empty tile placeholder, no data wired)
10. **Horizon strip slot primitive**: Darwin + Fixtures + (future Pass) as pluggable tenants, not a Darwin widget

**Additional Opus sessions before TDP-B executes if needed:** Horizon strip slot architecture and Pass-as-tenant scoping may warrant a dedicated half-session. Flag at TDP-B open.

---

### CC-95 — date: 2026-08-18
**Type:** Sonnet counted (TDP-A — Terminal Design Philosophy audit).
Eight drift findings. RLS verification. Design philosophy thread. TDP-B gate list produced. **CLOSED.**

### CC-94 — date: 2026-08-17
Sonnet counted. Hardening-A execution. Six migrations. G-4 + G-5 cleared. **CLOSED.**

### Sim-Close — date: 2026-08-17
Opus uncounted. Sim-Close formally declared complete. INCIDENT-PROTOCOL.md produced. **CLOSED.**

### CC-92 — date: 2026-08-17
Stage 3 payment simulation PASSED. **CLOSED.**

### CC-91 — date: 2026-08-16
Stage 1 sim deliverable complete. `merchant-onboarding-process-v1.html`. **CLOSED.**

### CC-90 — date: 2026-08-16
S-18 PIN auth fully closed. **CLOSED.**

### CC-89 — date: 2026-08-16
bcrypt columns migration. **CLOSED.**

### CC-88 — date: 2026-08-16
S-23 + S-24 bundle. **CLOSED.**

### CC-87 — date: 2026-08-16
Schema migration `cc87_venue_partners_wallet_addresses`. **CLOSED.**

### Block-5 Close — date: 2026-08-16
Opus uncounted. Block 5 verdict: capability complete, no go-live date. **CLOSED.**

### Design-A — date: 2026-08-15
User Guide (6pp) + Venue Keys card (1pp). Commit `f0157ef`. **CLOSED.**

---

## Session queue — forward plan

| # | Session | Scope | Type | Status |
|---|---|---|---|---|
| 1 | **TDP-B** | Terminal redesign execution — token migration, G-1, S-27, ops toggle (card grid), menu-item primitive, first-login welcome, Lightning address flow, stamp glyph primitive, stamp metric space, horizon strip slot primitive | Sonnet counted | **Next** |
| 2 | **TDP-C** | NumoPay fork alignment | Opus uncounted | After TDP-B |
| — | **Horizon strip / Pass tenant Opus** | Slot architecture deep-dive if needed before TDP-B executes | Opus uncounted | Flag at TDP-B open |
| — | **Menu Management v1** | CSV import, time-based menus | Sonnet counted | After TDP-B |
| — | **CA-1** | Consumer App Track. **Prerequisite: dev branch push.** | Opus uncounted | After TDP-C |
| — | **NumoPay-A** | Fork review, API contract, noun/verb/handle taxonomy | Opus uncounted | After TDP-C |
| — | **Block 8** | Fiat → sats rewards | Sonnet counted | After Menu Management v1 |
| — | **Pass-A** | Pass planning — proxy pickup credential, Bitcoin Events × Pass × Merchant arc, credential structure | Opus uncounted | After TDP-C |
| — | **Events intelligence layer** | Football fixtures, Darwin toggle, horizon strip tenants | Sonnet counted | Gap |
| — | **Privacy page update** | Sections 7, 8, 10 + merchant GDPR + Resend Article 30 | Sonnet counted | Gap |
| — | **Share API planning** | Pay-per-use API v1 | Opus uncounted | Before AD-2 |
| — | **AD-2** | Share admin dashboard | Sonnet counted | After Share API planning |
| — | **Session A (CDK mint)** | CDK mint architecture | Opus uncounted | After Block 8 |
| — | **Status page** | `refueler.io/status/` — global product-row, static-first | Sonnet counted | After first real merchant |

---

## Opening prompt for TDP-B

```
TDP-B — Terminal redesign execution
Type: Sonnet counted
Context files: docs/MasterContext_IO_CC96.md · docs/SESSIONS-refueler-io-CC96.md

TDP-philosophy is complete (CC-96). This is the execution session.
Read live file state from GitHub before any edit. Present full plan before writing code.
One step at a time; confirm output before proceeding.

Gate list for this session (in order):

1. G-1 — Settlement wiring
   `create-order` Edge Function must invoice to `venue_partners.lightning_address`,
   not Refueler's own Blink wallet. This is the hard blocker on any real merchant
   taking a real order. Read the live `create-order` source first.

2. S-27 — Column restriction
   `venue_partners_merchant_pause_update` RLS policy has no column restriction.
   Authenticated merchant can write wallet address columns on own row.
   Fix: column-level UPDATE grant restricted to `active` and `pause_reason` only.
   DDL via apply_migration. Naming convention: cc96_s27_venue_partners_column_restrict.

3. Token migration (D-1, D-2, D-3)
   Terminal CSS runs pre-CSS-1a token set. Canonical values in MasterContext CC-96.
   Also: drop `--c-text-*` aliases, keep `--text-*` as terminal-native, add `--fg*`
   aliases. Strip two backdrop-filter survivors:
   - .view-confirm-overlay (L382) — dead code, delete block entirely
   - .owner-overlay (L1239) — replace with solid semi-opaque scrim
   S-25 resolves automatically when --surface hits canonical value.

4. Ops toggle model
   Replace two dishonest toggles with single Open/Closed toggle.
   Honest copy: "Closed — no new orders. Your current queue is unaffected."
   Layout: calm card grid. Cards: Trading status, Lightning address,
   Staff access (placeholder tile, no wiring), Menu (placeholder tile, no wiring).
   No ghost copy ("coming soon") on placeholder tiles — empty space is fine.

5. Menu-item primitive spec
   Agree the data shape and tile layout for a menu item before Menu Management v1
   builds the import. This may be a brief planning exchange rather than a code step.

6. First-login welcome
   One-time screen on first terminal load post-provisioning.
   Shows venue name. Brief orientation. Dismissed and never shown again.
   Copy must speak to the merchant's identity, not Refueler's onboarding checklist.
   Draft copy before building.

7. Change Lightning address flow
   Owner tab action. Prompts re-auth (owner PIN). Updates venue_partners.lightning_address.
   On save: prompt to reprint Venue Keys card.

8. Stamp glyph primitive
   Calm glyph settles onto tile when status moves to READY.
   Plumbing-agnostic: same visual regardless of LNURL-withdraw or Cashu NUT-00 backend.
   No animation that demands attention. Glanceable.

9. Stamp metric space reserved
   Owner tab: one placeholder tile for stamp programme metrics.
   No data wired. No "coming soon" copy. Clean empty tile with a label.

10. Horizon strip slot primitive
    Refactor Darwin-specific strip code into a slot-based primitive.
    Tenants: Darwin (rail), Fixtures (football-data.org), Pass (future — stub only).
    Tenant provisioned at venue setup via mapbox_place_id proximity field.
    A venue can carry one or two tenants (two rows or two segments).
    Do not build fixture logic now — build the slot; stub the fixture tenant.
    Pass tenant is a stub comment only — no code, no design, pending its own Opus session.

Known drift context (do not design around bugs — design correctly, let this session fix):
- Terminal HTML: src/merchant/index.html (not merchant-tablet.html)
- Terminal JS: src/merchant/merchant-tablet-logic.js
- Terminal CSS: src/merchant/merchant-tablet-styles.css
- Inline Darwin styles in <style> block in index.html <head>
- SB_KEY hardcoded in logic.js L2 — safe, document, no change needed this session
- Font alias prefix divergence (--mono vs --font-mono) — document as known, align later

Architecture rules:
- Merchant profile: small family-run independents. Calm, not urgent. Ambient, not driving.
- Horizon strip: always dark #1A1A1A background, both themes
- Pending: gold. In Prep: #7899D4. Ready: #3DCA7A. These are protected.
- Status always doubled by word and position — never colour alone.
- No motion that demands. No count-up timers. No urgency.
- The terminal never implies the merchant is late.
```
