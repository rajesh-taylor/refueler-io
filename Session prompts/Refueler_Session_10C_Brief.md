# Refueler — Session 10C Brief
## Minibits Wallet Onboarding: M·01–M·06 Round 2

**Prepared end of Session 10B**
**Next session: Thursday**
**Scope: Round-2 amends across all six screens, plus open decisions requiring CPO/DPO and Head of Design input before render**

---

## Design Constants (do not change)

- Default theme: Carbon (dark) — base `#0D0D0D`
- Display font: Cormorant Garamond (light, italic for emotional words)
- Data/label font: DM Mono (light/regular)
- Accent: `#F5820A` orange — one use per screen maximum, never dominant
- Brand ethos: suave, discreet, refined — James Bond, not fintech neon
- Button copy register: lowercase throughout, no block capitals
- Mobile viewport: 320px wide render

---

## M·01 — Welcome to Rewards

### Amends
- [ ] Remove fiat equivalent line (`≈ £0.03 at today's rate`) entirely — too small to entice, risks deflating enthusiasm
- [ ] Order item strip (venue + items + price): implement horizontal marquee scroll for long product names and multiple items — elegant overflow, not truncation
- [ ] CTA buttons: ensure fully lowercase register — `· collect ·` / `prefer stamps` — no block caps

### Open decisions
- None outstanding

---

## M·02 — What are sats?

### Amends
- [ ] Fix copy: "A satoshi — short for sat" (not "sat for short")
- [ ] Remove double "think": replace "Think of it the way you'd think of a penny to a pound" → `"Like a penny to a pound, but for Bitcoin"`
- [ ] CTA buttons: lowercase throughout

### Open decisions
- [ ] **Head of Design:** BTC denomination row (`100,000,000 sats = 1 Bitcoin`) — decide: soften number format to `100 million` to reduce intimidation, OR replace row entirely with behavioural copy e.g. `"Small amounts, real value — they add up"`. Current row may alienate fiat-first new users.

---

## M·03 — Your two paths

### Amends
- [ ] Stamps card: "item" → "coffee" throughout
- [ ] Stamp count (9, 6 etc.) must be dynamic — pull from Supabase `venues` table per merchant loyalty scheme, not hardcoded
- [ ] CTA: `· continue ·` lowercase confirmed — carry through

### Open decisions
- [ ] **Head of Design + CPO/DPO:** Venue with no loyalty scheme (independent café, pop-up) — what does the stamps card show? Options: (a) blank/disabled card with explanatory micro-copy, (b) preview of M·04 sats nudge in its place, (c) stamps track hidden entirely, sats track auto-selected. Decision needed before TestFlight build.

---

## M·04 — The nudge (loyalty-track users)

### Amends
- [ ] Stamp card label: replace "Costa · stamp progress" with warmer, more considered language — copy pass needed. Avoid "stamp card" (too utilitarian)
- [ ] Stamp grid: replace linear row with **3×3 grid** (9 stamps + 10th = free) — more visual satisfaction, more presence
- [ ] Sats nudge card: remove sentence copy entirely. Replace with:
  - Label: `sats foregone`
  - Amount: `42` (large, DM Mono)
  - Unit: `sats` (orange, restrained)
  - No explanatory sentence — number speaks for itself
- [ ] Sats amount: dynamic from current order, not hardcoded

### Open decisions
- [ ] **Head of Design:** Stamp emoji (☕) as filled stamp — refined enough for brand? Alternatives: monogram dot, brand-coloured circle, venue initial
- [ ] **CPO/DPO:** Confirm "sats foregone" language is accurate and compliant — does foregone imply a right that wasn't granted?

---

## M·05 — Set up your wallet

### Amends
- [ ] Feature line 1: `"You hold your own sats. No middleman."` — drop "no third party" (redundant). CPO/DPO to confirm final wording
- [ ] Feature line 3: "two minutes" → "one minute" — verify against actual Minibits onboarding time in field before publishing
- [ ] Action card text: centre-align on both cards
- [ ] "Connect my wallet" → `"Connect to my own wallet"`
- [ ] Remove "Open-source" from Minibits descriptor strip

### Open decisions
- [ ] **CPO/DPO:** Subtitle line — decide between:
  - Option A (current): `"a lightweight Bitcoin wallet, on your phone"`
  - Option B (Rajesh preference): `"A non-custodial lightning wallet with privacy powers"` — one line, no open-source mention
  - Option C: explicitly name ecash — `"A non-custodial ecash and Lightning wallet"` — CPO/DPO to assess whether ecash mention aids or confuses new users at this stage
- [ ] **CPO/DPO:** Brand/licensing permission to display Minibits logo on the "Create a wallet" action card — confirm with Minibits team before implementing
- [ ] **Head of Design:** Primary action card colour — white/inverted feels garish against Carbon theme. Propose alternative: dark-lifted card (`#1e1e1e`) with subtle orange hairline top edge, or a warm off-white (`#E8E0D5`). Bring 2–3 options to Session 10C
- [ ] **Head of Design:** Feature row font treatment — Cormorant Garamond at 14px feels inconsistent with the label/data mono elsewhere. Review and decide on a consistent typographic rule for descriptive body copy across all screens

---

## M·06 — You're in

### Amends
- [ ] Balance card typography: single font (DM Mono, smaller size) for all text below the sats amount — no mixed fonts
- [ ] Venue location: move to **top-right of balance card** (beside sats amount row), freeing lower area for order item list
- [ ] Multi-item order treatment: balance card needs scroll or condensed list for multiple items — Head of Design to solve
- [ ] Closing CTA `"· enter refueler ·"`: full rework — copy, colour, and font treatment all feel off at current size and colour

### Open decisions
- [ ] **CPO/DPO — URGENT:** Third status pill currently reads `"Track · sats"`. "Track" implies surveillance/data recording. GDPR exposure risk. Options:
  - `"earning · sats"` — describes behaviour, not storage
  - `"mode · sats"` — neutral, technical
  - `"sats"` alone — simplest, no implied tracking
  - CPO/DPO to confirm: are we permitted to display/retain sat balance amounts? Under what basis? For how long? Is 30-day retention compliant or do we need explicit consent language at this point in the flow?
- [ ] **Head of Design:** `"· enter refueler ·"` — bring 3 options for copy, colour, and font pairing. Current render: too recessive, font feels wrong at that weight/size. Consider: a warmer entry point that feels like arrival, not an afterthought.

---

## Structural / Flow Questions (deferred to 10C)

- [ ] Does the no-loyalty-scheme venue state reduce the 6-screen flow to 5? (M·03 and M·04 may collapse for those users)
- [ ] TestFlight dual-track default (sats pre-selected) — validate in field after launch. Log conversion rate: how many loyalty-track users migrate to sats after seeing M·04 nudge?
- [ ] Toggle slider on M·03 (currently tappable cards) — revisit in future session whether cards become a single toggle. Deferred from Session 9.

---

## Session 10C Prompt (paste into new chat)

```
We are continuing work on the Refueler app — a pre-order coffee and rewards platform built on Bitcoin's Lightning/ecash layer for commuters on the Fenchurch Street corridor.

This is Session 10C. We are doing round-2 renders of the Minibits wallet onboarding flow, screens M·01 through M·06.

Design constants:
- Carbon (dark) theme — base #0D0D0D
- Cormorant Garamond (display), DM Mono (data/labels)
- Orange #F5820A — one use per screen, never dominant
- Brand ethos: suave, discreet, refined — James Bond, not fintech neon
- All button/CTA copy: lowercase only

Dual-track reward model:
- Track 1: Loyalty stamps (non-Bitcoiners) — stamp count dynamic per venue from Supabase
- Track 2: Sats (Bitcoin-native and migrating users) — Minibits ecash/Lightning wallet

Please load the file Refueler_Session_10C_Brief.md which contains the full round-2 amends and all open decisions flagged by owner (CPO/DPO, Head of Design). Begin with M·01 and walk through each screen in sequence, confirming each before proceeding. Apply all [Amends] immediately. Surface all [Open decisions] for discussion before rendering that screen.

CPO/DPO and Head of Design sub-agents should be invoked as needed per screen.
```

---

*Prepared: Session 10B close*
*Next session: Thursday*
