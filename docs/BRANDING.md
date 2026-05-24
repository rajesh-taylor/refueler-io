# REFUELER — Branding
**Version:** 0.2 (Post Brand Session v1.0 + Session 10 feedback)
**Status:** Decisions marked ✅ LOCKED are ratified and not to be reopened without a specific new reason.
**Owner:** Head of Design
**Last updated:** May 2026

---

> You are the Full Stack Lead Website Developer, Lead UX Design Director, and Website Brand Lead Designer for Refueler. This document governs all visual identity, tone, and brand decisions across every surface: website, mobile app, Command Centre, partner tablet, watch UI, and physical touchpoints. Everything here exists to serve one brief: a brand that earns trust before it asks for anything.

---

## Brand essence

**One sentence:** Refueler is the platform that knows you're coming.

**The register:** James Bond, not fintech neon. Suave, discreet, refined. The product does the work quietly. Nothing shouts.

---

## Brand personality

| Attribute | In practice |
|---|---|
| **Precise** | 4:22 is a measured metric, not a marketing claim. Everything we say is that concrete. |
| **Understated** | If something can be implied, it is not stated. If it must be stated, once is enough. |
| **Trustworthy** | Privacy is an architectural fact, not a feature we campaign about. |
| **Bitcoin-native** | Not crypto-bro. The Bitcoin ethos — self-custody, open protocols, no middlemen — is in the DNA. Sats are the reward. No fiat rewards layer. |
| **British** | Built in London. Dry wit allowed. Comedy is not the brand. |

---

## Tone of voice ✅ LOCKED

### Principles
1. Say it once, clearly. Repetition is insecurity.
2. Be specific. "4:22" not "fast". "186 sats" not "a little Bitcoin".
3. Dry, not try-hard.
4. Privacy without preaching. State the fact.
5. Bitcoin without gatekeeping. A newcomer and a native should both feel at home.
6. **Concierge register throughout** — The Connaught butler who understands Bitcoin. This applies to every in-app message, every status phrase, every notification. Never logistics copy.

### Status phrase register (ETA screen) ✅ LOCKED
These are the ratified in-app status messages. They are not logistics copy. They do not sound like a delivery tracker.

| State | Phrase |
|---|---|
| In progress | *Being prepared for you* |
| Slight delay | *A moment longer than expected* |
| Ready | *Waiting at the counter* (arc shows "Ready" in DM Sans 300 italic — never a numeral) |

CMO to review: open question whether a typographic glyph (✦) is more refined than the word "Ready" for international users. Async review requested before build.

### Tone examples

| ❌ Don't | ✅ Do |
|---|---|
| "We take your privacy seriously!" | "Your phone works it out locally. We never see where you are." |
| "Earn amazing Bitcoin rewards!" | "Every purchase earns sats. Real Bitcoin. Not points." |
| "We're revolutionising the commuter experience" | "Your flat white is ready in 4:22." |
| "Our cutting-edge geofencing technology" | "Your phone detects your train is moving." |
| "ORDER DISPENSED" | "Waiting at the counter" |
| "You're in a crowd!" | "In a crowd" |
| "Collected!" | "Collected." |

---

## Colour system ✅ LOCKED

### Refueler system colours
These are global. They never change per venue or per theme.

| Token | Value | Usage |
|---|---|---|
| `--orange` | `#F5820A` | **Used sparingly — once per screen, on the single element most deserving attention.** Sats reward figures. Primary CTA on Paper theme only. Never dominant on venue-branded screens. |
| `--green` | `#2ECC71` | Success, connected states, Collect button (ready state) |
| `--calm-blue` | `#0EA5C9` | Delay/calm-warning state only. Overrides venue secondary on arc when delay. |

### Orange restraint rule ✅ LOCKED
Orange (`#F5820A`) must not be the dominant colour on any screen that has a venue brand background. It appears **once** — on the sats reward figure. Nowhere else. This is the James Bond principle: one thing draws the eye. One.

### Carbon theme (dark) ✅ LOCKED

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#0D0D0B` | Page background |
| `--bg2` | `#141412` | Card backgrounds |
| `--bg3` | `#1C1C19` | Elevated surfaces, nav |
| `--text` | `#F0EDE8` | Primary text |
| `--text-muted` | `rgba(240,237,232,0.55)` | Secondary text |
| `--text-dim` | `rgba(240,237,232,0.28)` | Labels, metadata |
| `--border` | `rgba(255,255,255,0.08)` | Dividers |

### Paper theme (light) ✅ LOCKED — DEFAULT EVERYWHERE
Paper is the default for **all surfaces**: web, mobile app, all screens on first load.
Carbon is a user toggle in Settings. It is never the default.

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#F5F2ED` | Page background |
| `--bg2` | `#EDEAE4` | Cards |
| `--bg3` | `#E4E1DB` | Elevated surfaces |
| `--text` | `#1A1A18` | Primary text |
| `--orange` | `#D4690A` | CTA (slightly deeper for Paper legibility) |
| `--green` | `#1E8A4A` | Success states |

### England skin
Activates automatically on match days for English-locale devices. Red + white palette. Orange used sparingly. To be designed as a dedicated skin — not a colour override on existing screens.

### Venue brand colour system ✅ LOCKED
Every venue in Supabase has three brand colour columns. These drive: ETA screen background, arc accent, logo chip, qty badges, locate.html flash layer, and EV collection flash screen.

| Supabase column | Role | Example (Costa) |
|---|---|---|
| `brand_colour_primary` | Full-screen background | `#C8102E` red |
| `brand_colour_secondary` | Arc fill, logo accent, qty badges, flash layer | `#F2E0C8` cream |
| `brand_colour_tertiary` | Outline/stroke colour, future typographic accent | `#8B0000` dark red |

**Ratified franchise colours:**

| Venue | Primary | Secondary | Tertiary | Notes |
|---|---|---|---|---|
| Costa Coffee | `#C8102E` | `#F2E0C8` | `#8B0000` | Red bg, cream accent |
| M&S Café | `#006B38` | `#F0C040` | `#004a27` | Green bg, gold accent |
| Pret a Manger | `#73222E` | `#E8D5B0` | `#4d1520` | Dark red bg, warm tan accent |
| Caffè Nero | `#165485` | `#F9EAD7` | `#422A1D` | **Cobalt blue** bg, cream accent, espresso brown tertiary |

CTO to add `brand_colour_tertiary` column to Supabase `venues` table in next migration.
All new franchise partners: colours required before venue can go live on the ETA screen.

---

## Typography ✅ LOCKED (Phase 1)

| Role | Font | Weight | Usage |
|---|---|---|---|
| Display / hero | DM Sans | 300, letter-spacing −0.025em | Hero headlines, page titles |
| Body | DM Sans | 400–500 | All body copy, UI labels |
| Data / mono | DM Mono | 400–500 | Sats figures, timestamps, arc timer numerals, session data |
| Editorial | Lora | 400 | Newsletter and long-form only — never product UI |

**Arc timer rule:** Numerals (e.g. 4:22) render in DM Mono. State words (e.g. "Ready") render in DM Sans 300 italic at smaller size — never in DM Mono, never at the same size as the numerals. They are different categories of information and must read that way.

**Phase 2 target:** Neue Haas Grotesk Display (budgeted, not yet licensed, ~£300–500/yr).

---

## Sats display — whisper principle ✅ LOCKED

Sats reward figures must never shout. No pill, no badge, no border, no large orange block. The treatment:
- DM Mono, ~12px, colour `rgba(255,255,255,0.40)` on dark / `rgba(0,0,0,0.35)` on Paper
- Lightning bolt `⚡` at 28–30% opacity
- Label text ("on collection") at 22–24% opacity
- No enclosing element of any kind

**Rationale:** A sats figure that whispers gets noticed, remembered, and visited later in private. A figure that shouts gets glanced at and ignored. Users discover their accumulated balance in their wallet section, alone, away from a crowd. That moment of discovery is worth more than any in-your-face reward notification.

---

## Arc design — open question for CMO + Head of Design

The arc as a device is under review. Current implementation works functionally but raises questions:
- Does the arc add information, or does it just fill space?
- Is a simpler, more typographic treatment of the ETA time more consistent with the "precision instrument" brand?
- Alternative: large mono time value, status phrase below, no arc — letting the venue colour carry the screen.

**This is not a ratified decision.** CMO and Head of Design to review. Do not build the arc into production until this question is resolved. The current widget is a prototype only.

---

## Motion language ✅ LOCKED

- Button hover: `0.15s ease`
- Theme toggle: `0.35s` simultaneous token transition
- Scroll reveal: `fadeUp` — 16px translate, 500ms
- ETA countdown: **no animation, ever** — precision over decoration
- Session dot: slow pulse only — never draws eye more than once

---

## Iconography

- Line icons, 1.5px stroke, rounded caps
- Set: Lucide Icons
- `⚡` for sats — at reduced opacity in whisper contexts
- Custom ETA dial mark: under review (see arc question above)

---

## Physical touchpoints

- **NFC collection disc** — small, branded, minimal. Design pending Head of Design.
- **Venue signage** — "Refueler pick-up point". Directional only.
- **EV flash screen** — full-screen venue secondary colour pulse on locate.html. Used when runner cannot visually locate the customer at a charging bay. Zero data processing. Purely display.
- **Partner tablet (Command Centre)** — professional tool aesthetic. Not a consumer app.

---

## Files relationship

```
BRANDING.md              ← This file — visual identity, tone, all colour decisions
WEBSITE_DESIGN_SPEC.md  ← Technical implementation
STRATEGIC_UX_FLOW.md    ← Full user journeys from app open to order completion
PRIVACY_POLICY.md        ← Tone applied to legal context
SESSION_10B_PROMPT.md   ← Next session brief
```
