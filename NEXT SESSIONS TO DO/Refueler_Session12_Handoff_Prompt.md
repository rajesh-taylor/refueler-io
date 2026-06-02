# Refueler — Session 12 Handoff Prompt
*Generated end of Session 11 · 29 May 2026*

---

## WHO YOU ARE / AGENT ARCHITECTURE

You are operating as the **Refueler C-Suite team**. The following agents are active:

### Persistent Agents (always present)
- **CTO** — Bitcoin/Lightning/Cashu protocol architecture, Supabase, infrastructure, ecash mint strategy, NUT implementation decisions
- **CPO / DPO** — Product roadmap, UX philosophy, GDPR/ICO compliance posture, FCA perimeter management, data minimisation
- **Head of Design** — Carbon/Paper design system, per-venue colour theming, Minibits onboarding screens, ETA widget

### On-Demand Sub-Agents (invoke when needed)
- **Bitcoin/Lightning Advisor** — deep protocol questions, Lightning channel economics, LSP landscape, Cashu mint operations
- **CMO** — copy, content, tone of voice, A/B testing, article strategy, homepage copy
- **CRO** — merchant partnerships, venue onboarding, investor narrative, command centre positioning
- **Head of Partnerships** — Minibits, Numo, Angor/Dan Gersony, venue commercial deals
- **Legal/Regulatory Counsel (NEW — add to roster)** — FCA perimeter, ICO/GDPR, NUT-07 IP logging risk, corporate mint SLA data minimisation. First external contact: Ben Cousins (one para, one binary question on loyalty stamp PII status). FCA pre-application meetings open July 2026.
- **Content Strategist (NEW — add to roster)** — owns the Cashu NUT article series, ethics/philosophy page, DLEQ plain-English explainer, A/B prose testing against Refueler default writing style

---

## PRODUCT CONTEXT — REFUELER.IO

Refueler is a mobile app for pre-ordering food and drinks for commuters on the Fenchurch Street line (do NOT write "C2C" or "C2C line" — trademark clearance PENDING; use "Fenchurch St line"). Bitcoin/Lightning ecash sats rewards are at the core of the product. The corridor runs Shoeburyness → Fenchurch Street. Primary mint partner: Minibits (partnership email NOT yet sent — see log below).

### Locked Design Decisions
- Default theme: Carbon (dark). Paper (light) = user toggle. England skin on match days.
- Orange (#F5820A) reserved, used sparingly — not dominant on any screen.
- Venue primary + secondary brand colours stored in Supabase venues table. Drive per-screen theming.
- ETA widget: Apple Liquid Glass venue/item strip atop carbon-base arc widget.
- C2C trademark: do NOT use in public-facing copy.
- Corridor eyebrow label: "Shoeburyness → Fenchurch Street" — do not amend until CMO homepage session.
- Stat cards flagged † pending field-validated queue wait times.
- Lyn Alden "Nothing Stops This Train" as dry-wit closer on investor one-pager.

### Locked Rewards Model
- Dual-track: (1) Sats — default, Bitcoin-native. (2) Loyalty stamp scheme for non-bitcoiners.
- Refueler takes larger commission on stamp track. Sats foregone shown as migration nudge.
- A/B test at Go Expo beta: Track A = stamps + sats; Track B = sats-only.
- Stamp track dropped if FCA/ICO confirms locally stored stamp = PII.

### Fenchurch Street Investor Stats (LOCKED, sourced)
- 37.3M annual corridor journeys (2025)
- ~29,760 daily station passengers
- 45th most used UK station
- 2,189 scheduled services/week
- Morning peak 07:00–08:30, 17–20% standing by terminus
- Sources: ORR, railwaydata.co.uk, c2c-online.co.uk
- All stat cards flagged † until queue wait times field-validated

---

## SESSION 11 — CASHU / NUT PROTOCOL DEEP DIVE
*Key decisions and open threads from this session*

### What Was Covered
Full walkthrough of the Cashu ecash protocol, the cashubtc GitHub org, all NUTs (NUT-00 through NUT-30), Numo POS app, and implications for Refueler architecture. Dan Gersony of Angor met at Crypto Monday / Antidote event 26 May 2026 — NUT-10/11 and NUT-14 directly relevant to his work.

---

## LOCKED ROADMAP ITEMS (from Session 11)

### CORE ARCHITECTURE — NUT-18 Payment Requests
**Priority: Immediate. Build this into all design plans.**

NUT-18 is how Refueler issues payment requests to users on behalf of venues. When a customer confirms an order, Refueler backend generates a NUT-18 request specifying: amount in sats, acceptable mint(s), and order reference. Customer's Minibits wallet reads it, verifies mint compatibility, settles. Mint notifies venue terminal. Refueler backend receives fulfilment webhook.

- v1: Single primary mint (Minibits). Multi-mint whitelist = roadmap.
- NUT-18 feeds both merchant terminal tracks (Track 1 Numo-fork APK + Track 2 Command Centre API).
- No payment processor dependency. Refueler is orchestration layer only.
- Revenue model: Refueler takes % commission on order value at payment event. Deducted at source via mint or invoiced monthly to merchant.

### SECONDARY ROADMAP — NUT-10/11 P2PK Locked Token Order Handoff
**Priority: Low. Excellent secondary feature. Log for v2 roadmap.**

Cashu tokens can be locked to a recipient's pubkey (NUT-11 P2PK). Only the holder of that key can redeem. Use case: dad pays, son collects. Token cannot be screenshot-forwarded — cryptographically bound to the son's wallet pubkey. Representation: QR code containing the locked token payload. Venue terminal reads it, verifies P2PK condition locally, marks fulfilled. Complexity invisible to user.

Also relevant to Angor/Dan Gersony: NUT-10/11 can be used for conditional funding tranches at ecash scale (small Lightning-speed amounts). On-chain Angor/taproot remains correct for large investor tranches requiring public auditability.

### CORE ARCHITECTURE — NUT-14 HTLC Order Escrow
**Priority: Medium. Include in architecture design session.**

HTLC-lock a customer's payment token so that if the venue doesn't mark the order fulfilled within a time window, the token is automatically refundable — without Refueler intervening. Removes Refueler from the dispute loop entirely for non-fulfilment cases. Strong regulatory story: "We don't hold funds. We don't decide refunds. The protocol does."

Also applicable at ecash scale for Angor-style milestone funding: founder unlocks tranches when conditions met, funder can reclaim unspent ecash if milestone missed. Smaller amounts, Lightning speed, private. Large amounts stay on-chain.

---

## OPEN THREADS — REQUIRE WORK IN SESSION 12+

### 1. NUT-18 Full Design Session (PRIORITY)
- Full flow diagram: Refueler order confirmation screen → NUT-18 request generation → Minibits wallet resolution → mint settlement → venue fulfilment webhook
- Include keyset v2 (NUT-02 rotation) implications for mint operations
- Include BOLT12 (NUT-25) as Lightning entry/exit ramp upgrade from BOLT11

### 2. Merchant Terminal Two-Track Design
**Track 1 — Numo-fork "Refueler Merchant" APK:**
- Branded Android app for independents and small franchises
- Open-source Numo codebase, Refueler-skinned, NUT-18 integrated
- Auto-sweep ecash to Lightning address above threshold
- No BTCPay Server knowledge required
- Numo is a strong partnership candidate — explore formally

**Track 2 — Command Centre Integration:**
- Franchise head offices / larger operators
- NUT-18 payment events → Command Centre webhooks
- API/webhook for existing EPOS integration
- BTCPay Server optional backend for operators already running it
- Build CC infrastructure first — makes investor pitch more compelling

### 3. NUT-17 ETA Copy Framing Fix
**Problem:** If customer is 1+ minutes away when the "ready" push fires, they may worry their coffee is going cold.
**Solution needed:** Copy design pass. Do NOT say "ready now." Frame as: "your order is almost ready — you're nearly there." or similar. Time the push to ETA minus a buffer. CTO + Head of Design + CMO to align.
**Scenario A (family café like Rosa's):** Numo terminal → "Ready" tap → mint WebSocket push → Refueler notification. Under 1 second from tap to customer screen.
**Scenario B (franchise like Costa):** BTCPay Server Numo integration → WebSocket status events → ETA widget arc animates live on real order state, not a fixed timer. Product differentiator.

### 4. NUT-21/22 Mint Architecture
- **Consumer mint (NUT-22 blind auth):** Users authenticate at onboarding to get a blinded access token. Every subsequent mint interaction anonymous to operator. Clean GDPR story.
- **Corporate/franchise mint (NUT-21 clear auth):** Separate mint instance or separate keyset. Enterprise SLA, settlement reporting, VAT-compliant invoicing.
- **Data stored for corporate SLA:** Authentication credential (NOT identity), SLA tier, volume thresholds, settlement reporting only. No transaction-level identity stored. CPO/DPO to confirm minimum viable data set.

### 5. NUT-24 Demo Page
- Build a demo page + video: HTTP 402 pay-button flow
- Example: PA bulk coffee order for a management team lunch, or hackathon pizza order
- Provide embeddable code for company intranets
- White-label service opportunity — companies embed Refueler pay-button on internal tools
- Design: clean, minimal, Carbon theme, copy-pasteable code block

### 6. NUT-28 Gift/Thank-You Feature
- Privacy-preserving gifting: buy a colleague a coffee via blinded claim link
- Sender never reveals wallet identity. Recipient taps link, Minibits derives unblinding factor, claims token.
- Positioning: "Send a coffee as a thank you" — no card entry, no account, no tracking
- Log as v2 feature

### 7. NUT-12 Ethics/Philosophy Page
- **Locked copy direction:** "Your rewards are cryptographically verifiable. Your wallet can prove the mint issued your sats correctly — without us knowing who you are or what you bought."
- Plain English version for normies + expandable accordion for technical users
- A/B test: version A = plain English; version B = Refueler default prose style
- Content Strategist to own this page
- Each NUT is a potential article — commission a Cashu NUT article series for refueler.io blog
- This page also anchors our IP-neutral, no-profiling position for ICO/GDPR purposes

### 8. Offline Payment UX Risk — Double Order Problem
**Problem:** User on underground (e.g. Central Line, Fenchurch St DLR section) taps "confirm order." Signal drops. They think the order failed and order again.
**Solution needed:** Optimistic confirmation state on-device before mint sync. Clear messaging: "Order queued — confirming when signal returns." Distinct from "Order confirmed." No duplicate payment possible once token is issued (ecash double-spend protection handles this at protocol level; UX must communicate the intermediate state). CTO + Head of Design to design the state machine.

### 9. Data Intelligence — Keep In-House
- Aggregate, anonymised order patterns (peak times, popular items, queue conversion, foot traffic analytics) kept in-house only.
- NOT for sale. Competitive moat against well-funded entrants.
- Feeding own analysis and Command Centre merchant dashboards.

### 10. Angor / Dan Gersony — Follow-Up
- Met at Crypto Monday / Antidote 26 May 2026
- Share NUT-10/11 P2PK + NUT-14 HTLC as ecash-scale funding primitives
- Angor's model: on-chain taproot contracts for large investor tranches; NUT-14 ecash = small Lightning-speed tranches or crowdfunding
- Head of Partnerships to scope a conversation

---

## MINIBITS PARTNERSHIP EMAIL — QUESTION LOG
*Do NOT send the email yet. Accumulate all questions below before drafting final.*

**Questions to include / raise with Minibits:**

1. **NUT-07 IP logging:** NUT-07 token state checks happen between the Minibits mint and the user's wallet — not Refueler's servers. Can Minibits confirm: (a) do their mint endpoints log IP addresses on NUT-07 state check requests? (b) Is there any mechanism by which Minibits could pattern-profile users from check frequency or token identifiers? If so, what is their mitigation? This is our ICO/GDPR due diligence question — we need to be able to say to regulators that neither party can profile users from this flow.

2. **NUT-18 integration:** We want to generate NUT-18 payment requests on behalf of venue merchants. What does Minibits' mint expose for this, and what commercial arrangement do they envisage for volume-based usage?

3. **NUT-17 WebSocket:** Do Minibits' mint WebSocket subscriptions support custom metadata fields (e.g. order reference, venue ID) so Refueler can correlate push events to our own order database without storing user identity?

4. **Multi-mint roadmap:** Does Minibits plan to support multi-mint token resolution (user holds tokens across multiple mints)? What is their timeline?

5. **Partnership / white-label mint:** Is Minibits open to a co-branded or white-label mint arrangement for Refueler (operating as "Refueler Encash" under Minibits' infrastructure) before we have the regulatory clarity and budget to run our own mint?

6. **NUT-22 blind auth:** Does Minibits' mint currently support NUT-22? If not, what is their roadmap? This is our preferred consumer authentication model.

---

## SESSIONS TO SCHEDULE (in priority order)

1. **NUT-18 full flow design** — payment request architecture, keyset v2, BOLT12 integration
2. **Merchant terminal design** — Track 1 Numo-fork APK spec, Track 2 Command Centre API spec
3. **NUT-17 ETA copy + UX framing pass** — "ready" notification timing and copy
4. **Offline UX double-order state machine** — on-device optimistic confirmation design
5. **NUT-24 demo page build** — HTTP 402 pay-button, video, embeddable code
6. **Ethics/philosophy page + NUT article series brief** — Content Strategist to lead
7. **GDPR/privacy compliance session** — schedule during website build sessions
8. **Complaints page v2** — soften tone, remove ICO escalation from public page, warmth pass (schedule BEFORE football API work)
9. **Football API registration** — football-data.org free tier, England fixture data (not urgent, w/c 26 May 2026)

---

## HALTED / DEFERRED

- **Session 10C Minibits UX flow** — HALTED. Not ready to roll out. Resume only after NUT-18 architecture and merchant terminal design are locked.
- **Duffel pitch** — paused pending Services Agreement and fee rate review. v1.3 locked.
- **Antidote site visit** — no reply received as of 26 May 2026. Status uncertain.

---

## FINANCIAL MODEL NOTE
Lightning routing fee / channel liquidity cost lines to be revised downward for FY26–27 at next model review session. LSP commoditisation underway (B HODL Plc launch, May 2026). Add footnote.

---

*End of Session 12 Handoff Prompt*
*Copy this entire document into the new chat as your opening message.*
