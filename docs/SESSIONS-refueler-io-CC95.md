# SESSIONS — refueler-io
*Last updated: CC-95 · 2026-08-18 (TDP-A — Sonnet counted. Terminal audit against live src/merchant/ files. Eight drift findings. S-27 added. TDP-B gate list complete. Opus design-philosophy session queued. Next: TDP-philosophy.)*

---

## Session allocation

Primary: 500 · Buffer: 50 · Total: 550
Planning/Opus sessions: uncounted. Buffer untouchable until a block overruns.

Sessions used to CC-95: ~94 counted + uncounted planning sessions.

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
| **Block 8** | Fiat → sats rewards | 🟡 After Menu Management v1 |
| Pass-A/B | Pass planning sessions | 🟡 After Bitcoin Events × Pass × Merchant |
| Block 9 | LNBits integration | ⚪ Deferred post Block 8 |

---

## CSS rationalisation track — complete

CSS-1 through CSS-7b all closed.

---

## Session log

### CC-95 — date: 2026-08-18
**Type:** Sonnet counted (TDP-A — Terminal Design Philosophy audit).
**Scope:** Live audit of `src/merchant/` against MasterContext. Eight drift findings. RLS verification. Design philosophy thread. TDP-B gate list produced.

**Key findings:**

**D-1 — Token set pre-CSS-1a.** Terminal runs abolished hexes: Paper `--bg: #F7F4EF` (canonical `#E8E2D8`), Paper `--surface: #EDEAE4` (canonical `#DAD4CA`), Carbon `--bg: #1E1F22` (canonical `#1A1A1A`), Carbon `--surface: #26282C` (canonical `#242424`). Carbon `--inset-rule: #C8A96E` (canonical `var(--border)`). Flash-guard and `theme-color` meta already use correct `#1A1A1A`, creating a visible colour-shift on load. All fix in TDP-B token migration. S-25 resolves automatically.

**D-2 — Two backdrop-filter survivors.** `.view-confirm-overlay` (L382, dead code — delete block entirely) and `.owner-overlay` (L1239 — replace with solid semi-opaque scrim).

**D-3 — Triple token vocabulary.** `--text-*`, `--c-text-*`, and (prospectively) `--fg*` all alias the same three text colours. Drop `--c-text-*` aliases in TDP-B. Keep `--text-*` as terminal-native. Add `--fg*` aliases for cross-surface consistency.

**D-4 — SB_KEY hardcoded in logic.js L2.** Safe (anon key), but key rotation requires manual edit. Document; consider meta-tag injection at build time as a future improvement.

**D-5 — Ops toggle model is dishonest.** Two toggles, both write `active` boolean, coupled via JS (L1048 forces other toggle). "Pause" sub-label copy inaccurate — `active = false` is a full close. TDP-B decision: single honest toggle or real `is_paused` column. Lean single toggle for this merchant profile.

**D-6 / S-27 — venue_partners UPDATE policy has no column restriction.** `venue_partners_merchant_pause_update` permits authenticated merchant to write wallet address columns on own venue row. Hardening-A grant restriction is current control; not enforced at RLS level. TDP-B: column-level UPDATE grant for merchant auth path — `active` + `pause_reason` only.

**D-7 — Doc name drift.** Terminal HTML is `src/merchant/index.html` (plain `.html`), not `merchant-tablet.html`. All docs corrected.

**D-8 — Font alias prefix divergence.** Terminal uses `--mono/--sans/--serif/--heading` (no `--font-` prefix). Web uses `--font-mono` etc. Document as known divergence; align later.

**RLS confirmed safe (read-only query):** `venue_partners_merchant_pause_update` is venue-scoped — cross-venue write blocked. `deny_non_admin_update_protected_columns` is PERMISSIVE not RESTRICTIVE — naming misleading; wallet protection rests on grant level.

**Design philosophy thread (TDP-A):**
Merchant profile locked: small family-run independents, community relationships, care over throughput. Not competing with Square/Toast/Lightspeed for the franchise/volume market. Terminal should feel ambient and calm, not urgency-driven. Learn text sizing from KDS incumbents (identifier north of 18px, item name 14–16px); take almost nothing else from them. Horizon strip is the moat — no competitor has it. Pending-gold status colour is deliberate and unusual; protect it. Full design philosophy deferred to dedicated Opus session (TDP-philosophy).

**TDP-B gate list confirmed:**
1. G-1 settlement wiring (hard blocker)
2. S-27 column restriction (security, pre-merchant)
3. Token migration (D-1, D-2, D-3 — includes S-25 fix)
4. Ops toggle model decision
5. Menu-item primitive spec
6. First-login welcome (copy must speak to merchant identity, not onboarding process)
7. Change Lightning address flow

**Commits this session:** MasterContext_IO_CC95.md + SESSIONS-refueler-io-CC95.md + REFUELER-BRIDGE.md (v4.4)

---

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
| 1 | **TDP-philosophy** | Design philosophy — sidebar, Ops layout, accessibility, stamp placement, luxury-calm reference, family merchant context, Bitcoin-native 10yr horizon | Opus uncounted + extended thinking | **Next** |
| 2 | **TDP-B** | Terminal redesign execution — token migration, G-1, S-27, ops toggle, menu-item primitive, first-login welcome, Lightning address flow | Sonnet counted | After TDP-philosophy |
| 3 | **TDP-C** | NumoPay fork alignment | Opus uncounted | After TDP-B |
| — | **Menu Management v1** | CSV import, time-based menus | Sonnet counted | After TDP-B |
| — | **CA-1** | Consumer App Track. **Prerequisite: dev branch push.** | Opus uncounted | After TDP-C |
| — | **NumoPay-A** | Fork review, API contract | Opus uncounted | After TDP-C |
| — | **Block 8** | Fiat → sats rewards | Sonnet counted | After Menu Management v1 |
| — | **Events intelligence layer** | Football fixtures, Darwin toggle | Sonnet counted | Gap |
| — | **Privacy page update** | Sections 7, 8, 10 + merchant + Resend Article 30 | Sonnet counted | Gap |
| — | **Share API planning** | Pay-per-use API v1 | Opus uncounted | Before AD-2 |
| — | **AD-2** | Share admin dashboard | Sonnet counted | After Share API planning |
| — | **Session A (CDK mint)** | CDK mint architecture | Opus uncounted | After Block 8 |
| — | **Status page** | `refueler.io/status/` | Sonnet counted | After first real merchant |

---

## Opening prompt for TDP-philosophy

```
TDP-philosophy — Terminal Design Philosophy (deep-dive)
Type: Opus uncounted + extended thinking
Context files: docs/MasterContext_IO_CC95.md · docs/SESSIONS-refueler-io-CC95.md

TDP-A is complete (CC-95). This is the design philosophy session before TDP-B executes.
It is planning only — no code, no commits. Extended thinking on.

Background you must hold throughout:

Refueler's merchant profile is locked: small, family-run independent businesses.
A Turkish café, a third-wave coffee bar, a deli that makes its own bread. The person
reading the terminal is often the same person who made the item on the order tile.
The "kitchen" may be four feet from the counter. The iPad sits above the espresso machine.

These are not travellers, students, or transient customers. These are merchants who know
their regulars by name. The Refueler customer arriving on the 07:42 is the Bitcoin stacker
who has ordered the same flat white every working day — and the merchant knows it's him
before he walks in, because the horizon strip told them a train just arrived.

We are not competing with Square, Toast, or Lightspeed. We do not want their market.
Our market will likely begin not even in London or on the Fenchurch St corridor, but in
Essex — Southend, Leigh-on-Sea, Westcliff, Benfleet. Family businesses that have traded
in those towns for decades. The terminal must earn a place in that environment.

We build for humans. Some of our merchants will be hard of hearing. Some will not have
their reading spectacles. Some will be in their sixties running a business their parents
started. The terminal must be legible, calm, and dignified — never demanding, never
alarming, never making anyone feel like they need to keep up.

The 10-year horizon: Bitcoin is not experimental. It is infrastructure. The Lightning
Network is as unremarkable as card payments are today. Sats are a denomination, not a
novelty. Our merchants onboarded early and stayed. Their customers are loyal not because
of a loyalty scheme but because the experience of paying — instantly, privately, without
a receipt nobody asked for — is simply better. The terminal the merchant looks at every
day is part of that story. It should age well.

Agenda:

1. THE SIDEBAR — is it needed?
   The current terminal has a persistent sidebar: Darwin feed, Active Site card (with
   Mapbox mini-map), Queue Summary card, Help card. On a 10.9" iPad in landscape this
   takes 340px — roughly 30% of the screen — permanently. Question: does the sidebar
   earn that space? Is the Darwin intelligence better placed in the horizon strip (where
   it partially already lives)? Is the Mapbox mini-map adding anything to a merchant who
   knows exactly where their venue is? Could the sidebar collapse to a contextual drawer,
   surfaced on demand? Go first principles. Do not preserve the sidebar because it exists.

2. OPS PANEL — card grid vs horizontal rows
   The current OPS panel uses horizontal toggle rows. Two findings from TDP-A: (a) the
   two toggles are both writing the same column in opposite directions, coupled via JS —
   dishonest; (b) the layout is generic. For a merchant who visits OPS rarely (owners,
   not staff), what should it feel like? Consider a small card-grid layout. Consider
   what a merchant actually needs in OPS: open/close, Lightning address, staff PIN reset
   (coming), menu management (coming). Are horizontal rows the right grammar for a surface
   that isn't a settings page but an owner's dashboard?

3. ACCESSIBILITY — partial sight, hearing, spectacles, age
   Design for the merchant who does not have their reading glasses. Design for the merchant
   who is hard of hearing and cannot hear a notification. Design for the merchant who is
   65 and has been running this business for 30 years and does not need software to make
   them feel slow. What does that imply for type sizes, contrast ratios, status signalling
   (can status be communicated without colour alone?), motion, and notification design?
   The terminal should make people feel better for looking at it, not anxious.

4. LUXURY CALM — the Aman reference
   Aman resorts are the benchmark for a certain kind of hospitality design: extraordinary
   calm, materials that reward touch, no unnecessary signage, staff who anticipate needs
   without being asked. What does that design philosophy translate to in a software terminal?
   This is not about making the terminal look like a hotel. It is about the emotional
   register — what does it feel like to use it on a Tuesday morning when you have twelve
   orders and a train arriving in four minutes? It should feel like the terminal is on
   your side. Not driving you. Not demanding. On your side.
   Reference also: the physical craft of the merchants themselves — a barista who cares
   about their pour, a baker who cares about their crust. The terminal is a professional
   tool for a craftsperson. It should honour that.

5. DIGITAL STAMPS — where do they live on the terminal?
   The consumer-facing app will show stamp balances and earn events. But the terminal is
   the point of fulfilment — the merchant confirms the order, and the stamp is issued.
   Where does stamp issuance live in the terminal's UI? Does the merchant see it? Should
   they? Is it a passive event (happens silently on READY status) or an active confirmation?
   What does the merchant's relationship with the stamp programme look like from their side
   of the counter? Consider both the current LNURL-withdraw flow and the future Cashu
   NUT-00 token flow. The answer informs refueler-mint integration scope.

6. FIRST PRINCIPLES — what is this terminal, actually?
   Not a KDS. Not a POS. Not a loyalty dashboard. The horizon strip makes it something
   that does not exist in this category: a tool that tells a craftsperson when their
   customer is arriving, so they can time their work to the moment. Go first principles
   on what that means for every surface — queue, ops, owner, sidebar (or not), stamps.
   If you were designing this from a blank canvas in a world where Bitcoin payments are
   normal, what would you build?

Known drift to inform the philosophy (do not design around bugs, design correctly and
let TDP-B fix the bugs):
- Sidebar is 340px, permanently on. Portrait collapses it to a card strip.
- Ops panel: two dishonest toggles writing the same column.
- Token set pre-CSS-1a — TDP-B will fix. Design with canonical values in mind.
- Type sizes on order tiles not yet specified beyond the tile height (180px).
- Stamp placement: undefined.

Produce:
- A clear recommendation on the sidebar question with reasoning.
- A proposal for the OPS panel layout and the honest single toggle model.
- Accessibility principles for the terminal — a short list, not a WCAG checklist.
- A statement of the luxury-calm design register — what it means in practice for
  this surface, this merchant, this moment.
- A recommendation on stamp placement and the merchant's relationship to the programme.
- A first-principles definition of what the terminal is — one paragraph, precise enough
  to settle future design disputes by reference.

This session's output feeds TDP-B's build scope directly.
Brand voice throughout: James Bond, not fintech neon. Suave, discreet, refined.
```
