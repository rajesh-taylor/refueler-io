# REFUELER — Brand Session v1.1 Addendum
**Addendum to:** Refueler_Brand_Session_v1.0.docx
**Session:** Session 10 + Session 10 feedback (May 2026)
**Status:** All items below are RATIFIED unless marked [OPEN]

---

> This document records all decisions made in Session 10 and the feedback rounds that followed. It updates and extends Brand Session v1.0. Where this document conflicts with v1.0, this document takes precedence.

---

## Section A — Theme defaults (supersedes v1.0)

**Ratified:** Paper is the default theme on ALL surfaces — website, mobile app, Command Centre, all screens on first load.

Carbon is a user toggle only:
- Website: toggle top-right of every page
- Mobile: Settings menu
- Command Centre: Settings menu

**Standing flag:** If any screen — especially Command Centre — ships Carbon-first, this must be flagged as a build error and corrected before release.

England skin activates automatically on match days for English-locale devices. It does not override Paper/Carbon user preference — it is a third skin applied contextually.

---

## Section B — Colour system updates (extends v1.0)

### Orange restraint rule (new — supersedes any prior liberal use of orange)
`#F5820A` (Carbon) / `#D4690A` (Paper) appears **once per screen** on the single element most deserving attention. On venue-branded screens (ETA, locate), that is the sats/reward figure only. On Paper screens, that is the primary CTA only.

### Venue brand colour schema (new)
Three columns per venue in Supabase `venues` table:

| Column | Role |
|---|---|
| `brand_colour_primary` | Full-screen background (ETA, locate flash bg) |
| `brand_colour_secondary` | Arc fill, logo chip, qty badges, flash layer |
| `brand_colour_tertiary` | Outline/stroke accent (e.g. Nero espresso brown letterform outline) |

**CTO action required:** Add `brand_colour_tertiary` column in next migration.

Ratified franchise colours:

| Venue | Primary | Secondary | Tertiary |
|---|---|---|---|
| Costa Coffee | `#C8102E` | `#F2E0C8` | `#8B0000` |
| M&S Café | `#006B38` | `#F0C040` | `#004a27` |
| Pret a Manger | `#73222E` | `#E8D5B0` | `#4d1520` |
| Caffè Nero | `#165485` | `#F9EAD7` | `#422A1D` |

Note: Caffè Nero primary is cobalt blue `#165485` — NOT near-black. Previous sessions had an incorrect dark background for Nero. This is now corrected and ratified.

### ETA screen colour logic (new)
- Full-colour venue hex bleed on entire screen: **REJECTED**
- Apple Liquid Glass venue strip (venue name + items) over carbon base: **RATIFIED**
- Venue `brand_colour_primary` bleeds through the Liquid Glass surface only
- Carbon remains the base for arc, status, reward section

---

## Section C — ETA screen design (partial ratification)

### Ratified
- Liquid Glass venue strip at top: venue logo chip, name, address, order items
- Carbon base below: arc section, status phrase, sats whisper
- Status phrases: *Being prepared for you / A moment longer than expected / Waiting at the counter*
- Arc fill: venue `brand_colour_secondary`. Delay state: `#0EA5C9` overrides
- Sats whisper treatment: no pill, no border, no badge. DM Mono 12px at ~40% opacity. `⚡` at 28–30% opacity
- Collect button (ready state): "Tap to collect · or show QR" in `#2ECC71`
- Multi-item orders: stacked vertically in Liquid Glass strip, one item per row

### [OPEN] — Arc treatment
**Not yet ratified.** The arc device is under review. Open question: does the arc add information, or does it fill space? Alternative: typographic ETA (large DM Mono numeral, status phrase below, no arc — venue colour carries the screen). CMO + Head of Design to review and recommend before build.

### [OPEN] — Arc timer font sizing
Current prototype: numerals are too large, overflow the arc boundary. To be corrected when arc treatment is finalised.

---

## Section D — Reward model (supersedes v1.0 sats-only position)

**Ratified: Dual-track reward model**

| Track | For | Reward |
|---|---|---|
| Sats | Users with a wallet configured | Real Bitcoin (sats) via Cashu/Minibits or Lightning |
| Loyalty stamps | Non-Bitcoin users | Free item after N purchases, mirroring franchise scheme |

**Commission structure:** Loyalty track carries higher Refueler commission than sats track. Merchant value prop: guaranteed return visits, new user acquisition, perishable goods clearance, zero loyalty tech overhead.

**ETA widget bottom-left by track:**
- Sats: `⚡ 186 sats` (whisper)
- Loyalty: `☕ 3 / 9 · £1.20 saved` + below in lighter opacity: `⚡ 186 sats you could be earning`

The sats nudge is the migration mechanism. Never intrusive. Always present.

**GDPR flag (CPO/DPO):** Loyalty stamp progress toward a free item may constitute a "benefit account" record. Recommend: free item redeemed directly at venue (merchant absorbs, Refueler is introducer) — keeps Refueler outside financial instrument definition. CPO/DPO to confirm before build.

---

## Section E — Homepage hero (supersedes v1.0 spec)

### Removed
- 4:22 metric — this was a Lakeside-to-M&S walking time. Wrong context for a train ordering app. Removed permanently.
- "c2c" brand name — trademark of c2c Railway Limited. IP risk without written consent. Do not use in public-facing copy.
- Carbon-first hero — superseded by Paper default.

### Ratified
- Paper default with Carbon toggle top-right
- Hero headline: "Order on the train. Collect at the platform. Earn real Bitcoin with every purchase — no card, no queue, no waiting."
- Metric direction: time NOT spent waiting in a queue. Placeholder: "Under 2 minutes at the counter." To be replaced with validated field data.
- Subhead direction: "We start your order at the right time so it's ready when you arrive."
- "Fenchurch Street" — safe to use. Public street/station name, not c2c IP.
- Sign-in component: identical to Command Centre sign-in. Shared component.

---

## Section F — UX flow principles (new)

**Ratified:** All design work starts from app open. No individual screens designed without the full flow context. Retrofitting is prohibited.

**Ratified UX modes (beyond pre-order):**
- Walk-in (at venue, orders with friends)
- Walk-past (proximity nudge, impulse order)
- Shared collection (payer shares link with non-payer — no auth required for collector)

**Shared collection — youth onboarding vector:**
When a first-time user collects via a shared link, the app prompts: "Want to earn next time? It takes 30 seconds." This is the primary introduction of the under-25 cohort to Refueler. Light. Never pressured.

---

## Section G — Copy updates

| Element | Old | New (ratified) |
|---|---|---|
| Collect button (ready state) | "Collect order" | "Tap to collect · or show QR" |
| Locate screen NFC instruction | "Tap your phone at the collection point, or show your QR code." | "Tap your mobile at collection, or show the QR code." |
| locate.html confirm headline | "Order delivered!" | "Collected." |

---

## Section H — C-suite briefing service [OPEN — to build in Session 10B]

Proposal: one MCP briefing artifact per C-suite role. Weekly trigger. Surfaces top 3 trends, 1 competitor move, 1 question for C-suite meeting. CMO briefing includes youth/teen design trends (Nike, Adidas, McDonald's kiosk UX). Rajesh willing to pay Pro plan. Build CMO template in Session 10B, replicate for all 7 roles.

---

## Section I — Deferred items

| Item | Status | Target session |
|---|---|---|
| Payment flow (Screen 09) | Not designed | Session 10B priority |
| Arc vs typographic ETA | Open question | Session 10B — CMO + Head of Design |
| Toggle slider vs mode button | On hold | After payment flow designed |
| Minibits wallet onboarding flow | Not designed | Session 10B priority |
| QR code centred on locate screen | Minor update | Session 10B |
| Duffel integration | On hold | Post-Services Agreement |
| Physical NFC disc design | Not started | Future |
| Newsletter template (Buttondown) | Not started | Future |
| England skin | Not designed | Phase 2 |
