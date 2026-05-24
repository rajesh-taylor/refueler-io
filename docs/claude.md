# claude.md — Refueler Project DNA
> **Version:** 1.0 | **Last updated:** May 2026 | **Status:** Pre-prototype / Active UX Build
> This file is the single source of truth for all Claude sessions working on Refueler. Read it in full before any session begins. Do not carry forward assumptions from prior sessions unless they are logged here.

---

## 1. Vision & Mission

Refueler is a Bitcoin-native mobile ordering app for London commuters on the C2C rail corridor (Shoeburyness → Fenchurch Street). It solves a simple, daily friction: commuters waste time queuing for coffee and food at stations — time they have already paid for in their ticket. Refueler times the order to the train's arrival so the drink is ready the moment the commuter walks in, no queue, no waiting. Payment is settled in Bitcoin via the Lightning Network, with a loyalty stamp bridge for users not yet on Bitcoin. The broader mission is to build a parallel payment rail — one that introduces a new, high-value demographic (Bitcoin-native City workers) to franchise and independent merchants who have never had commercial access to them before. Refueler is not a fintech loyalty app. It is quiet infrastructure — suave, discreet, and refined — that happens to run on the hardest money in the world.

**Domain:** refueler.io
**Legal entity:** Refueler (trading name; no registered company at this stage)

---

## 2. Brand Tokens

These are locked. Do not deviate. Do not introduce new palette colours without a formal session decision.

### Colour
| Token | Hex | Usage |
|---|---|---|
| Carbon | `#1A1A1A` | Default background — web, mobile, all screens |
| Paper | `#F5F0E8` | Light mode toggle (user-controlled in settings); homepage default |
| Orange | `#F5820A` | Accent — used sparingly; never dominant on any screen |

**Rules:**
- Carbon is the default everywhere except the public-facing homepage, which defaults to Paper.
- Orange is a signal colour only — CTAs, progress indicators, and select highlights. It must never flood a screen.
- The ETA widget uses venue secondary brand colour (not orange) as the accent — e.g. Costa: cream on red; M&S: gold on green.
- The England skin activates on match days on English-locale devices only.

### Typography
| Token | Value |
|---|---|
| Primary font | DM Sans |
| Weight | 300 (Light) as default; 400/600 for hierarchy |
| No other typefaces | — |

### Brand Ethos
> **James Bond, not fintech neon.**
Suave. Discreet. Refined. Every design decision should pass this test: would this feel at home in a first-class carriage or in a City of London espresso bar? If it feels garish, loud, or startup-frantic, it is wrong.

---

## 3. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Mobile app | React Native | iOS-first for launch; Android parity to follow |
| Backend / DB | Supabase | Schema exists and is actively being updated |
| API layer | Node.js | REST API; server-side order logic and venue routing |
| Bitcoin wallet | Minibits / Cashu | ecash on-device; Lightning address for receive |
| AI advisory | Claude API — Sonnet 4 (`claude-sonnet-4-20250514`) | Used for C-suite sub-agents and in-session product decisions |
| Version control | GitHub | Repo exists; pre-prototype stage |
| Domain | refueler.io | Purchased and held by Founder |

### Supabase Schema (key tables — update this list as schema evolves)
- `venues` — franchise and independent partner data, including `primary_colour` (hex) and `secondary_colour` (hex) for ETA widget theming
- (Further tables to be logged here as schema is formalised)

---

## 4. Architecture Decisions — Locked by CTO

The following decisions are locked. They may only be revisited by the CTO sub-agent in a dedicated architecture session, with explicit Founder sign-off.

### 4a. Lightning Address — Transient Memory Model
Lightning addresses are held in transient memory only. No Lightning address is persisted to the database. This eliminates a class of regulatory and custodial risk at the pre-seed stage. Any proposal to persist Lightning addresses must be escalated to the CTO and flagged in the session log.

### 4b. On-Device Geofence — Passive Ambient Awareness
The silent geofence trigger (detecting train boarding via velocity + location, e.g. at Limehouse) is processed entirely on-device. No location data ever leaves the device. The geofence logic fires a contextual prompt — e.g. *"Your flat white will be ready in 4 mins, confirm?"* — without the user needing to open the app. This is a UX acceleration feature only. It requires:
- Explicit opt-in at onboarding
- A visible toggle in Settings to disable at any time
- Zero data transmitted to Refueler servers
- No satellite credits used; this is not a travel intelligence feature

This decision is **GDPR-locked** (see Section 5).

---

## 5. GDPR Position — Locked by CPO / DPO

### Locked Privacy Copy
The following wording is approved for public-facing use and must not be altered without a dedicated privacy/legal session:

> *"Refueler knows your train is moving. Your phone works it out locally. We never see where you are."*

This is positioned explicitly as a contrast to ad-tech loyalty apps that harvest and sell location data.

### GDPR Compliance Position
| Element | Position |
|---|---|
| Geofence processing | On-device only; never transmitted |
| Purpose of geofence | Purchase prompt trigger only — no analytics, no profiling |
| Legal basis | Explicit consent (opt-in at onboarding) |
| Withdrawal | Toggle in Settings; zero data retained on withdrawal |
| Data retained | None from geofence activity |
| ICO escalation | Documented in Privacy Policy; not surfaced on public complaints page |

### Complaints Page (v2 — scheduled before football API work)
- Tone: concierge / kind startup energy — warm, human, not legalistic
- Remove Step 3 ICO escalation from public-facing page
- Intro ending: *"please contact us, we are here to help you"*
- General warmth pass across all copy
- **Note:** The user's right to escalate to the ICO must remain in the Privacy Policy even if removed from the complaints page

---

## 6. C-Suite Roster

| Role | Status | Notes |
|---|---|---|
| **Founder / CEO** | Rajesh (human) | Product vision, investor relations, all final decisions |
| **CTO** | AI sub-agent (persistent, first) | Architecture decisions, Lightning/ecash stack, Supabase schema |
| **CPO / DPO** | AI sub-agent (persistent, second) | Product strategy, GDPR compliance, privacy framing |
| **Head of Design** | AI sub-agent (persistent) | UX flows, brand tokens, screen design, ETA widget theming |
| **Bitcoin / Lightning Advisor** | AI sub-agent (on-demand) | Lightning Network specifics, Cashu/Minibits integration, wallet UX |
| **CMO** | AI sub-agent (on-demand) | Marketing strategy, demographic positioning, youth/teen design trends |
| **CRO** | AI sub-agent (on-demand) | Revenue model, commission structure, merchant conversion |
| **Head of Partnerships** | AI sub-agent (on-demand) | Franchise outreach, venue onboarding, independent merchant strategy |

### Agent Architecture
- **Prompt caching** is active on the system block
- **$5 API credit** loaded; expenditure to be tracked per session
- Persistent agents (CTO, CPO/DPO, Head of Design) are active in every relevant session
- On-demand agents are invoked only when their domain is the session focus

---

## 7. Product — Core Concepts

### The Core Problem
C2C commuters travelling into Fenchurch Street spend 2–5 minutes queuing for coffee and food at station venues — after already spending 45–90 minutes on the train. That queue time is dead time. Refueler eliminates it.

### How It Works
1. User boards the train at any C2C station (Shoeburyness → Fenchurch Street corridor)
2. On-device geofence detects boarding via velocity + location (e.g. Limehouse trigger)
3. App fires a contextual prompt: *"Your flat white will be ready in 4 mins, confirm?"*
4. User confirms; order is sent to venue; payment settled via Lightning / ecash
5. User walks in. Order is ready. No queue.

Users may also order 2, 3, or 4+ stops before Fenchurch Street — not only from the Limehouse trigger.

### Walk-in and Walk-past Use Cases
These are confirmed revenue opportunities, not edge cases. Some users will open the app inside the venue with friends. The full UX flow must support: pre-order (train), walk-in (at venue), and walk-past (passing by). The app is not solely a pre-order tool.

### Order Handoff
Dad pays; son picks up via shared link on mobile or Apple Watch. This introduces younger users to the app and broadens the addressable cohort. The CMO must track youth/teen design trends (Nike, Adidas, McDonald's order flow) to ensure the handoff experience resonates.

---

## 8. Rewards Model

Refueler operates a dual-track rewards model. Sats are primary; stamps are the migration bridge.

### Track 1 — Sats (Primary)
- Default for Bitcoin-native users
- Earned on every purchase
- Displayed in the ETA widget bottom-left: e.g. *"£0.40 saved"* in sats equivalent
- Lower commission rate to Refueler; higher margin for merchant and user

### Track 2 — Loyalty Stamps (Bridge)
- Mirrors the franchise's own scheme (e.g. free coffee on 9th purchase)
- For non-Bitcoin users who want a familiar mechanic
- Higher commission rate to Refueler on this track
- Stamp progress shown alongside sats equivalent as a nudge to migrate: *"1/9 · £0.40 saved — or earn sats instead"*
- Goal: onboard non-bitcoiners, then migrate them to sats over time

### Investor Framing
Lead with sats. The Bitcoin-native demographic is the product's strategic moat. Stamps exist to widen the funnel, not to define the identity.

### Merchant Framing
Lead with *new foot flow and zero card fees*. The Bitcoin mechanism is the how, not the headline. The value proposition is: *"A high-spending, loyalty-averse demographic concentrated in the City of London — one you've never had a commercial relationship with before."*

---

## 9. Venue & Corridor Scope

### Launch Corridor
C2C rail line — Shoeburyness → Fenchurch Street

### Target Launch Venues (Franchise — TBC)
- Costa Coffee
- M&S Food (secondary colour: gold / yellow)
- Pret A Manger
- Caffe Nero

All franchise brand colours (primary + secondary) are stored in the Supabase `venues` table for ETA widget theming and collection visibility (flashing mobile screen for EV charging-style pickup signal).

### Independent Venue — Under Consideration
An independent operator owns 2–3 coffee shops inside stations on the same C2C corridor. If a collaboration can be established via the Merchant Command Centre, this becomes the first testable independent partner — including a shop past the paying gate inside Grays station. This is a significant UX and commercial unlock if achievable.

### Secondary Testing Site
Lakeside Shopping Centre (Essex) — confirmed as a secondary site to test franchise partnerships in a non-station retail environment. No build work is scoped here until the station corridor is live.

---

## 10. ETA Widget — Design Spec

The ETA widget is the hero UI element of the app. Its design is locked as follows:

- **Top strip:** Order item detail (venue name + items) — Apple Liquid Glass format
- **Base:** Carbon background (dark) ETA widget — arc, status phrase, reward indicator
- **Status phrase:** Order-specific copy, not generic — e.g. *"Your flat white medium is being prepared"*
- **Venue theming:** Venue secondary colour used as accent (NOT orange) — e.g. Costa: cream on red; M&S: gold on green
- **Bottom-left:** Reward progress — e.g. *"1/9 · £0.40 saved"* plus sats nudge
- **NOT:** Full-colour venue hex bleed across the whole screen — Carbon base is non-negotiable

---

## 11. Homepage — Design Spec

- **Default theme:** Paper (light) — not Carbon
- **Carbon toggle:** Top-right of homepage
- **Hero metric:** Time NOT spent waiting in line — not the ETA time itself (the 4:22 figure was a Limehouse walking time and is incorrect in this context)
- **Hero subhead direction:** *"We get your order started at the right time so it's ready when you arrive."*
- **Sign-in component:** Identical across homepage and Command Centre — a merchant user may also be a general user
- **Fenchurch Street / C2C references:** Check copyright status before using in public-facing copy

---

## 12. Merchant Value Proposition

> *"New foot flow: Bitcoin stackers — a high-spending, loyalty-averse demographic concentrated in the City of London."*

**Stat cards requiring real field data before investor use (flagged †):**
- † 60,000+ daily C2C passengers (Fenchurch Street corridor — pull current annual stats from C2C / National Rail)
- † Sub-2-minute counter time (requires field measurement at venues inside and near Fenchurch Street station)

Both data points must be validated before the value prop is used in investor materials.

### Dry-Wit Investor Closer
Lyn Alden's *"Nothing Stops This Train"* thesis — fiscal deficits, Bitcoin as the ultimate mirror — is approved for use as a one-line closer on the investor value prop one-pager. Tone: understated, knowing, not preachy. One line. End of document.

---

## 13. Active Session Log

This section tracks what has been decided and what is next. Update it at the end of every session.

### Locked Decisions (do not re-litigate)
- Brand tokens: Carbon / Paper / Orange / DM Sans 300 ✓
- ETA widget: Liquid Glass strip + Carbon base + venue secondary colour ✓
- Rewards: Sats primary / stamps bridge ✓
- Architecture: Lightning address transient; geofence on-device only ✓
- GDPR copy: locked wording approved ✓
- Merchant value prop: locked wording (Bitcoin-native foot flow) ✓
- Investor closer: Lyn Alden "Nothing Stops This Train" — one line, end of doc ✓
- Duffel pitch v1.3: locked; not to be sent pending Services Agreement and fee rate analysis ✓
- Homepage: Paper default, Carbon toggle top-right ✓
- Agent architecture: CTO persistent first; CPO/DPO persistent second ✓

### Pending — Next Sessions (w/c 2 June 2026)

**Session 10B Evaluations:**
1. Homepage hero — Paper theme, new metric, Fenchurch St copy review, sign-in component
2. Minibits wallet onboarding flow (screens M·01–M·06)
3. Full UX sign-up flow (14 screens, cold open → wallet overview)

**Scheduled (before football API work):**
- Complaints page v2 — tone softening, ICO step removal, warmth pass
- Privacy + GDPR compliance session (dedicated, during website build phase)
- Refueler website build sessions (domain: refueler.io)

**Research Required (before investor materials):**
1. Pull current C2C annual passenger statistics for Fenchurch Street corridor
2. Field-measure queue wait times at coffee shops inside and near Fenchurch Street station
3. Register at football-data.org (free tier) for England fixture data — not urgent until mid w/c 26 May 2026

**Under Review:**
- Toggle slider vs. button on ETA screen — revisit in dedicated session
- Independent operator (Grays station) — viability pending Merchant Command Centre assessment
- World Cup integration — deprioritised; too close to launch window
- Virgin Atlantic for Duffel — bags not supported; likely excluded

### Session History
| Session | Focus | Status |
|---|---|---|
| Session 9 | Passive Ambient Awareness / geofence UX | Complete — locked |
| Session 10A | ETA widget design, rewards dual-track, brand tokens | Complete — locked |
| Session 10B | Homepage, Minibits onboarding, full UX sign-up flow | Scheduled |
| Privacy + GDPR Session | Policy audit (6 flags), v1.1 redraft, page build prompt locked | Complete |
| Privacy Page Build | Public-facing /privacy page — privacy.html delivered, Cloudflare Pages ready | Complete |
| Complaints Page v2 | Public-facing /complaints — HTML delivered. Warm concierge tone, no ICO escalation, Paper theme, all v2 brief items applied. | Complete |
| Session 10B-i | Homepage hero evaluation — typography (migrated to DM Sans 300), metric (replaced with behavioural statement, no invented figure), headline (locked: "Your order is ready. So is your train."), sign-in panel (in-hero, self-contained component, extraction-ready), Carbon toggle (functional), copyright flag retained | Complete |
---

## 14. What This File Is Not

- It is not a PRD. It is context for Claude sessions.
- It is not a pitch deck. Investor materials are separate documents.
- It is not a legal document. GDPR positions here are working positions, not legal advice.
- It must be updated at the end of every session. A stale `claude.md` is worse than none.

---

*"Nothing stops this train."*
