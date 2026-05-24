# REFUELER — Website & Mobile Master Design Spec
**Version:** 0.2 (Post Session 10 updates)
**Status:** Working document — arc treatment and payment flow TBD in Session 10B
**Scope:** refueler.io · Mobile web app · Command Centre

---

> You are the Full Stack Lead Website Developer, Lead UX Design Director, and Website Brand Lead Designer for Refueler. This document governs all technical and design decisions across every surface. Paper is the default everywhere. Nothing shouts. Everything earns its place.

---

## Role definitions

| Role | Owns |
|---|---|
| **Lead Website Developer** | Architecture, performance, Cloudflare, Supabase, auth flows |
| **Lead UX Design Director** | User journeys (starting from app open), onboarding, friction reduction, accessibility |
| **Brand Lead Designer** | Visual identity, typography, colour system, motion, tone |

---

## Brand principles ✅ LOCKED

**Suave · Discreet · Refined — James Bond, not fintech neon.**

- One thing draws the eye per screen. One.
- Orange appears once. On the element most deserving attention.
- The venue brand colour bleeds through a Liquid Glass surface — it does not own the screen.
- Paper is the default. Always. Flag any deviation.

---

## Theme defaults ✅ LOCKED

| Surface | Default | Toggle |
|---|---|---|
| Website (all pages) | Paper | Carbon — top-right toggle |
| Mobile app (all screens) | Paper | Carbon — Settings |
| Command Centre | Paper | Carbon — Settings. **LOG IF CC SHIPS CARBON-FIRST.** |
| ETA screen | Carbon base + Liquid Glass venue strip | N/A — venue-branded surface |
| England skin | Auto on match days (English locale) | Off in Settings |

---

## Colour system ✅ LOCKED

### System colours (never overridden)

| Token | Value | Rule |
|---|---|---|
| `--orange` | `#F5820A` (Carbon) / `#D4690A` (Paper) | Once per screen. Sats/reward figures only on venue-branded screens. |
| `--green` | `#2ECC71` (Carbon) / `#1E8A4A` (Paper) | Success, connected, Collect button (ready state) |
| `--calm-blue` | `#0EA5C9` | Delay state only. Overrides venue secondary on arc. |

### Carbon theme

| Token | Value |
|---|---|
| `--bg` | `#0D0D0B` |
| `--bg2` | `#141412` |
| `--bg3` | `#1C1C19` |
| `--text` | `#F0EDE8` |
| `--text-muted` | `rgba(240,237,232,0.55)` |
| `--text-dim` | `rgba(240,237,232,0.28)` |
| `--border` | `rgba(255,255,255,0.08)` |

### Paper theme (DEFAULT)

| Token | Value |
|---|---|
| `--bg` | `#F5F2ED` |
| `--bg2` | `#EDEAE4` |
| `--bg3` | `#E4E1DB` |
| `--text` | `#1A1A18` |
| `--text-muted` | `rgba(26,26,24,0.55)` |
| `--text-dim` | `rgba(26,26,24,0.32)` |
| `--border` | `rgba(0,0,0,0.08)` |

### Venue brand colour schema (Supabase `venues` table)

| Column | Role |
|---|---|
| `brand_colour_primary` | Screen background (ETA, locate flash bg) |
| `brand_colour_secondary` | Arc fill, logo chip, qty badges, flash layer (locate.html) |
| `brand_colour_tertiary` | Outline/stroke accent, future typographic use |

**CTO action:** Add `brand_colour_tertiary` column in next migration.

| Venue | Primary | Secondary | Tertiary |
|---|---|---|---|
| Costa Coffee | `#C8102E` | `#F2E0C8` | `#8B0000` |
| M&S Café | `#006B38` | `#F0C040` | `#004a27` |
| Pret a Manger | `#73222E` | `#E8D5B0` | `#4d1520` |
| Caffè Nero | `#165485` | `#F9EAD7` | `#422A1D` |

---

## Typography ✅ LOCKED (Phase 1)

| Role | Font | Weight | Notes |
|---|---|---|---|
| Display / hero | DM Sans | 300, −0.025em | Hero headlines, page titles |
| Body | DM Sans | 400–500 | All UI text |
| Data / mono | DM Mono | 400–500 | Sats, timestamps, arc numerals |
| Editorial | Lora | 400 | Newsletter only — never product UI |

**Arc numerals:** DM Mono only. "Ready" state: DM Sans 300 italic — visually distinct from numerals.

Phase 2: Neue Haas Grotesk Display (~£300–500/yr). Budget line logged.

---

## Spacing & layout

- Base unit: 8px
- Content max-width: 960px (account), 900px (marketing)
- Section padding: 6rem 2rem desktop, 4rem 1.25rem mobile
- Card border radius: 10px · Input: 6px · Button/chip: 4–6px
- Border weight: 0.5px throughout

---

## Motion language ✅ LOCKED

| Element | Duration | Easing |
|---|---|---|
| Button hover | 0.15s | ease |
| Theme toggle | 0.35s | simultaneous all tokens |
| Scroll reveal | 500ms | fadeUp 16px |
| ETA countdown | **None. Ever.** | N/A |
| Session dot pulse | Slow, ~2.4s | ease-in-out |

---

## ETA screen — current spec (prototype, not production)

**Structure:**
1. **Liquid Glass venue strip** — venue logo chip, venue name, address. Background: venue `brand_colour_primary` bleeding through frosted glass. `backdrop-filter: blur()`.
2. **Order items** — inside or below the Liquid Glass surface. Each item on own line. Qty badge in venue secondary colour.
3. **Arc section** — carbon base. Arc fill in venue secondary. Delay state overrides to `--calm-blue`. **Arc treatment under review** — may be replaced by typographic ETA display. Do not build to production until CMO + Head of Design sign off.
4. **Status phrase** — DM Sans 400, small, `rgba(255,255,255,0.32)`. Phrases: *Being prepared for you / A moment longer than expected / Waiting at the counter*
5. **Sats whisper** — `⚡` at 28–30% opacity. DM Mono 12px at 40% opacity. No pill, no border, no badge.
6. **Collect button** (ready state only) — "Tap to collect · or show QR". `#2ECC71` green.

---

## Reward display on ETA screen

| User track | Bottom-left display |
|---|---|
| Sats | `⚡ 186 sats` — whisper treatment |
| Loyalty | `☕ 3 / 9 · £1.20 saved` — same whisper size and opacity |
| Loyalty (with nudge) | Above + below in lighter opacity: `⚡ 186 sats you could be earning` |

---

## Homepage hero spec (to be rebuilt in Session 10B)

**Theme:** Paper default. Carbon toggle top-right.

**Removed:**
- 4:22 metric (was Lakeside walking time — not relevant to train ordering)
- "c2c" brand name (IP risk — use "Fenchurch Street" instead)
- Carbon-first treatment

**Hero headline:** "Order on the train. Collect at the platform. Earn real Bitcoin with every purchase — no card, no queue, no waiting."

**New metric:** Time saved not waiting in a queue. Placeholder until field data available. Direction: "Under 2 minutes at the counter."

**Subhead:** Direction — "We start your order at the right time so it's ready when you arrive." (Refueler handles the timing — user does not need to order at a specific stop.)

**CTA:** "Get early access" (Paper, orange)
**Secondary:** "See how it works"

**Sign-in component:** Identical to Command Centre sign-in. Shared component — merchant users and general users use the same sign-in surface.

**Bottom 4 metrics:** Retain for now. Remove C2C-specific language. Adapt with field data.

**Copyright note:** "Fenchurch Street" — safe (public street/station name). "c2c" — do NOT use without written consent from c2c Railway Limited.

---

## Authentication flow ✅ LOCKED

```
NEW USER
  Email → magic link (10 min expiry) → JWT in memory → Passkey prompt (once)

RETURNING (Passkey)
  Face ID / Touch ID → JWT → Account page

SENSITIVE ACTIONS
  Fresh magic link required regardless of active session
```

---

## Command Centre — design constraints

- **Paper default.** Log if any CC screen ships Carbon-first.
- Sign-in component shared with main website — identical visually and functionally.
- A merchant may also be a general Refueler user — the app serves both without mode-switching friction.
- CC should feel like a professional tool. But visually consistent with the consumer product.

---

## Page inventory

| Page | Route | Auth | Status |
|---|---|---|---|
| Landing | `/` | Public | Rebuild in Session 10B (Paper default) |
| Account | `/account` | Magic link + Passkey | UI built |
| Auth callback | `/auth/callback` | System | To build |
| Command Centre | `/command` | Magic link | Built — confirm Paper default |
| Partner tablet | `/partner` | PIN / magic link | Built |
| Watch | `/watch` | None (proximity) | Built |
| Locate / collection | `/locate` | None | v2 built (locate_v2.html) |
| Privacy | `/privacy` | Public | Standalone page needed |
| Terms | `/terms` | Public | To draft |
| Contact | `/contact` | Public | To build |
| 404 | `/404` | Public | To build |

---

## locate_v2.html — design system alignment notes

- Typography: updated to DM Sans + DM Mono (was IBM Plex Mono)
- Flash layer: pulses venue `brand_colour_secondary` (not primary) — creates greater visual contrast
- QR code: **to be centered on screen** (currently in bottom panel) — update in Session 10B
- All functional logic unchanged: flash cycles, crowd mode, battery API, NFC, WakeLock, triple-tap dev sim
- Sats display: whisper treatment (no badge, no pill)
- Confirm screen: sats in whisper style, concierge copy register

---

## Performance targets

| Metric | Target |
|---|---|
| LCP | < 1.5s |
| FID / INP | < 100ms |
| CLS | < 0.1 |
| Bundle (landing) | < 50kb JS |
| Font payload | < 120kb total |

---

## Accessibility

- WCAG 2.1 AA minimum
- All interactive elements keyboard navigable
- ARIA labels on icon-only controls
- Focus rings visible in both themes
- Contrast: 4.5:1 body, 3:1 large text
- `prefers-reduced-motion` respected

---

## Weekly update workflow

Monday (or Wednesday if blocked):
1. Review new vendor integrations or feature flags
2. Update copy for newly activated venues
3. GDPR policy check for new data categories
4. Push to GitHub → Cloudflare Pages auto-deploys
5. Log in CHANGELOG.md

---

## Files relationship

```
WEBSITE_DESIGN_SPEC.md   ← This file
BRANDING.md              ← Visual identity source of truth
STRATEGIC_UX_FLOW.md     ← All user journeys from app open
PRIVACY_POLICY.md        ← GDPR source of truth
SESSION_10B_PROMPT.md    ← Next session brief
```
