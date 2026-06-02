# Refueler — Master Context File
*Load this into any new chat alongside your session-specific work prompt.*
*Last updated: Session 13 · 30 May 2026*

---

## PRODUCT IN ONE SENTENCE

Refueler is a mobile app for pre-ordering food and drinks for commuters on the Fenchurch Street line, with Bitcoin/Lightning ecash sats rewards at its core. The corridor runs Shoeburyness → Fenchurch Street. Website: refueler.io

---

## C-SUITE AGENT ROSTER

### Persistent (always active)
- **CTO** — Bitcoin/Lightning/Cashu protocol, Supabase, infrastructure, NUT implementation, mint strategy
- **CPO / DPO** — Product roadmap, UX philosophy, GDPR/ICO compliance, FCA perimeter, data minimisation
- **Head of Design** — Carbon/Paper design system, per-venue colour theming, Minibits onboarding, ETA widget

### On-Demand Sub-Agents
- **Bitcoin/Lightning Advisor** — deep protocol, Lightning economics, LSP landscape, Cashu mint ops
- **CMO** — copy, tone of voice, A/B testing, article strategy, homepage copy, content calendar
- **CRO** — merchant partnerships, venue onboarding, investor narrative, Command Centre positioning
- **Head of Partnerships** — Minibits, Numo, Angor/Dan Gersony, venue commercial deals
- **Legal/Regulatory Counsel** *(added Session 11)* — FCA perimeter, ICO/GDPR, NUT-07 IP logging risk, corporate mint SLA data minimisation. First external contact: Ben Cousins.
- **Content Strategist** *(added Session 11)* — NUT article series, ethics/philosophy page, DLEQ plain-English explainer, A/B prose testing

---

## DESIGN SYSTEM (LOCKED)

### Theme tokens

| Token | Paper | Carbon |
|---|---|---|
| `--bg` | `#F7F4EF` | `#1E1F22` |
| `--surface` | `#EDEAE4` | `#26282C` |
| `--text-primary` | `#3D3A36` | `#E4E2DC` |
| `--text-secondary` | `#5A5751` | `#8A8680` |
| `--text-tertiary` | `#9A948D` | `#5A5751` |
| `--border` | `#D6D1C8` | `#35373B` |
| `--inset-rule` | `var(--border)` | `#C8A96E` |
| `--accent-carbon` | — | `#C8A96E` aged gold |

### Carbon accent `#C8A96E` — applied to:
- Blockquote `border-left`
- Widget / inset card `border-left: 2px solid`
- Widget expand button border + text colour
- Modal panel `border-top: 2px solid`
- Hover: `#E0C48A`

### Font stack (all pages — locked Session 13)
- **Headings / UI / labels:** `'Satoshi', 'DM Sans', sans-serif`
- **Body / standfirst / intro:** `'Source Serif 4', Georgia, serif`
- **Small UI chrome / footer:** `'DM Sans', system-ui, sans-serif`

### Theme toggle (all pages — locked Session 13)
- Single outlined pill: `PAPER / CARBON`
- Carbon active: label swaps to `CARBON / PAPER`
- `localStorage` key: `refueler-theme`
- `data-theme=""` = Paper (default), `data-theme="carbon"` = Carbon

### Other design locks
- **Default theme:** Carbon (dark) — app, mobile, all app screens
- **Paper (light):** user toggle. Homepage and editorial default to Paper.
- **England skin:** activates on match days, English-locale devices
- **Orange `#F5820A`:** reserved, used sparingly — NEVER dominant on any screen
- **Venue theming:** primary + secondary brand colours in Supabase venues table drive per-screen theming
  - Costa: cream on red · M&S: gold on green
- **ETA widget:** Apple Liquid Glass venue/item strip atop carbon-base arc
- **Brand ethos:** suave, discreet, refined — James Bond, not fintech neon

---

## COPY & TRADEMARK RULES (LOCKED)

- **"Fenchurch St line"** = correct. NEVER "C2C" or "C2C line" — registered trademark, clearance PENDING
- **Eyebrow label:** stays "Limehouse → Fenchurch Street" until CMO homepage session, then update to "Shoeburyness → Fenchurch Street" — do NOT amend until that session
- **ETA status copy:** personalised to item — "Your flat white medium is being prepared"
- **Homepage hero metric:** time NOT spent waiting in line. Subhead: "We get your order started at the right time so it's ready when you arrive."
- **Merchant value prop:** "New foot flow: Bitcoin stackers — a high-spending, loyalty-averse demographic concentrated in the City of London." Remove "and they tip in sats."
- **Investor closer:** Lyn Alden "Nothing Stops This Train" — dry-wit British closer, one line, end of document

---

## REWARDS MODEL (LOCKED)

Dual-track:
1. **Sats** — default, Bitcoin-native users
2. **Loyalty stamp scheme** — non-bitcoiners, mirrors franchise's own

Refueler takes larger commission on stamp track. ETA widget bottom-left: stamp progress + sats foregone as migration nudge. A/B test at Go Expo beta: Track A = stamps + sats; Track B = sats-only. Stamp track dropped entirely if FCA/ICO confirms locally stored stamp = PII.

---

## WALLET SELECTION UX (LOCKED — 3 OPTIONS ONLY)

1. Minibits ecash — recommended, set up in-app
2. Connect existing Lightning wallet via NWC
3. Enter wallet manually (non-NWC users, e.g. Kraken holders)

Remove: Lightning invoice receive, Macadamia, Sovran, Cashu.me.

---

## INVESTOR STATS (LOCKED, SOURCED)

- 37.3M annual corridor journeys (2025)
- Fenchurch Street: 10,862,630 entries/exits · ~29,760 daily passengers · 45th most used UK station
- 2,189 scheduled services/week · Morning peak 07:00–08:30, 17–20% standing by terminus
- Sources: ORR, railwaydata.co.uk, c2c-online.co.uk
- **All stat cards flagged †** until queue wait times field-validated

---

## REGULATORY / LEGAL STATUS

- **FCA perimeter:** No formal counsel engaged. First contact = Ben Cousins. FCA pre-application meetings open July 2026.
- **GDPR privacy framing (locked):** "Refueler knows your train is moving. Your phone works it out locally. We never see where you are." Geofence on-device only, never transmitted, opt-in at onboarding, toggle off in settings, zero data retained.
- **ICO escalation:** removed from public complaints page. Must remain in privacy policy.

---

## CASHU / NUT ARCHITECTURE (LOCKED ROADMAP)

### NUT-18 Payment Requests *(Immediate Priority)*
Refueler generates NUT-18 requests on behalf of venues at order confirmation. Customer's Minibits wallet resolves. Mint settles. Refueler receives fulfilment webhook. v1: single Minibits mint. Multi-mint whitelist = roadmap. **NUT-18 not yet live in ippon — critical path question for Minibits.**

### NUT-14 HTLC Order Escrow *(Medium Priority)*
Token HTLC-locked: if venue misses fulfilment window, auto-refund. Both terminal tracks.

### NUT-10/11 P2PK Locked Token Handoff *(v2)*
Dad orders, locks token to son's pubkey. Son collects via QR. Cryptographically bound, invisible to user.

### Merchant Terminal — Two-Track
- **Track 1:** Branded "Refueler Merchant" Android APK (Numo-fork), NUT-18, auto-sweep to Lightning address
- **Track 2:** Command Centre API/webhook for franchise head offices

### NUT-17 WebSocket *(ETA widget)*
Venue taps "Ready" → push → Refueler notification. **Likely polling not WebSocket — confirm with Minibits.** Frame: "your order is almost ready — you're nearly there." (not "ready now" if 1+ min away)

### NUT-22/21 Auth
Consumer: blind auth (NUT-22), anonymous. Corporate: clear auth (NUT-21), separate mint/keyset, SLA, VAT invoicing.

### NUT-12 DLEQ Proofs *(Ethics page)*
"Your rewards are cryptographically verifiable. Your wallet can prove the mint issued your sats correctly — without us knowing who you are or what you bought."

### NUT-07 ICO Question *(Minibits email — unresolved)*
Do Minibits mint NUT-07 endpoints log IPs? Any profiling risk?

### Offline UX Double-Order Risk
On-device optimistic confirmation before mint sync. Copy: "Order queued — confirming when signal returns."

---

## MINIBITS IPPON — ARCHITECTURE NOTES

ippon = self-hostable custodial wallet-as-a-service API. Candidate infrastructure for "Refueler Encash".

NUT STATUS:
- NUT-11 P2PK: LIVE
- NUT-18 pay: NOT YET LIVE (decode only) — **critical path**
- NUT-17 WebSocket: NOT FOUND — likely polling
- NUT-22 blind auth: NOT LIVE

RATE: `/v1/rate/gbp` confirmed. CoinGecko primary, 2-min cache. No separate integration needed.
CONTACT: Cashu dev call warm intro (last Thursday monthly, Calle moderates). Not cold email.

---

## SESSION 9 — PASSIVE AMBIENT AWARENESS (LOCKED, DEFERRED)

Silent geofence at Limehouse detects boarding via velocity + location. Fires "your flat white will be ready in 4 mins, confirm?" — no app open needed. No sats for travel (Transit Mining lock stands). Requires: explicit opt-in, on-device geofence logic only, no location data leaves device, GDPR disclosure. Full session to be scheduled.

---

## MINIBITS PARTNERSHIP EMAIL — QUESTION LOG *(Do not send yet)*

1. NUT-07 IP logging — do endpoints log IPs on state check requests?
2. NUT-18 integration — payment request generation? Commercial terms?
3. NUT-17 WebSocket — custom metadata fields (order ref, venue ID)?
4. Multi-mint roadmap — timeline?
5. White-label/co-branded mint — "Refueler Encash" under Minibits infrastructure?
6. NUT-22 blind auth — supported? Roadmap?

---

## SESSION 10C — MINIBITS UX FLOW (HALTED)

Resume after NUT-18 venue side locked.

Pending: M·01–M·06 accent colour rebuild (`#C8A96E` gold, `#8FA68C` sage, M·03+ HoD chooses). No caps in light boxes. Remove M·03. 3-option wallet screen. Merge M·04+M·05 if space. Safari encoding fix. Value prop v1.2: remove "and they tip in sats".

---

## DUFFEL (PAUSED)

Pitch v1.3 locked. Not sending — pending Services Agreement and fee rate review. World Cup deprioritised. Test scenarios: UK Bitcoiner to USA; family of 4. BA + AA full support. Virgin Atlantic excluded.

---

## COMPLAINTS PAGE (DONE — Session 13)

`complaints_v6.html` — locked. Tone softened, ICO Step 3 removed from public page, warmth pass complete, full editorial design system aligned. ICO right preserved in privacy policy.

---

## FINANCIAL MODEL NOTE

Lightning routing fee / channel liquidity lines to be revised downward for FY26–27. LSP commoditisation underway (B HODL Plc, May 2026). Add footnote at next model review.

---

## ANGOR / DAN GERSONY

Met at Crypto Monday / Antidote 26 May 2026. NUT-10/11 P2PK + NUT-14 HTLC relevant. Small Lightning-speed tranches via ecash; large investor tranches on-chain. Head of Partnerships to scope follow-up.

---

## DATA INTELLIGENCE POLICY

Aggregate, anonymised order patterns kept in-house only. Not for sale. Competitive moat vs well-funded entrants. Feeds own analysis and Command Centre merchant dashboards.

---
*End of Master Context File — Session 13*
