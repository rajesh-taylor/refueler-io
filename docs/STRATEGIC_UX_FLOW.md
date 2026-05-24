# REFUELER — Strategic UX Flow
**Version:** 0.2 (Post Session 10 — full flow from app open)
**Status:** Working document — arc treatment under review, payment flow TBD in Session 10B
**Scope:** All user-facing surfaces — web, mobile, Command Centre, watch, partner tablet

---

> You are the Full Stack Lead Website Developer, Lead UX Design Director, and Website Brand Lead Designer for Refueler. This document maps every user journey from first contact to habitual daily use. The golden rule: design starts at app open, not at the post-order screen. Every screen must exist in context of what comes before and after it.

---

## Core UX principles

1. **Start from the beginning.** Every design session starts at app open. No retrofitting individual screens without the full flow context.
2. **One task, one screen.** Never ask the user to do two things at once.
3. **Earn trust before asking for anything.** Especially location, notifications, wallet details.
4. **Fail gracefully.** A missed order is recovered, not punished.
5. **Privacy by default.** The user should never have to opt out of something they didn't know was on.
6. **Concierge register.** Every message, every status phrase, every notification should feel like The Connaught. Never a logistics tracker.
7. **Paper everywhere.** All screens default to Paper theme. Carbon is a settings toggle. Never the default.

---

## User archetypes

| Archetype | Journey | Key friction points |
|---|---|---|
| **The Daily Commuter** | Essex Thameside line → Fenchurch Street, same order every morning | First-time geofence setup; notification fatigue |
| **The EV Driver** | Plugs in at Lakeside, 25-min dwell, wants coffee + snack from M&S | Discovery at charging bay; walk distance |
| **The Bitcoin Newbie** | Joined for convenience, curious about sats | Minibits wallet setup — must be guided, not assumed |
| **The Bitcoin Native** | Came via Nostr/Fountain, wants Lightning control | Advanced wallet linking, self-custody routing |
| **The Match Day Fan** | England home or away, Refueler for travel + stadium food | England skin, Duffel integration (future) |
| **The Walk-In** | Already at the venue with friends, orders at the counter | Walk-in mode, group ordering, no pre-order needed |
| **The Walk-Past** | Passes a venue, nudged by proximity reward prompt | Discovery moment, low-friction impulse order |
| **The Collector (non-payer)** | Received a shared collection link from payer (e.g. family member) | No account needed, youth onboarding moment |

---

## Screen inventory — full flow from app open

*This is the definitive screen order. All design work starts here.*

```
01  App open — cold (first time)
02  App open — returning (Passkey / Face ID)
03  Landing / discovery
04  Sign up / sign in
05  Onboarding checklist
06  Venue discovery / browse
07  Item selection
08  Order confirmation
09  Payment ← NOT YET DESIGNED — dedicate Session 10B time
10  ETA screen (Liquid Glass venue strip + carbon base)
11  Collection (NFC tap / QR show)
12  Reward confirmation (sats whisper or loyalty stamp update)
13  Wallet / balance overview
14  Settings
```

Screens 01–09 and 13–14 are to be designed in Session 10B.
Screens 10–12 are prototyped (ETA widget v4, locate_v2.html) — not production-ready.

---

## Journey 01 — New user, cold open

```
DISCOVERY
  Organic: word of mouth, Nostr, Fountain, venue QR code
  Future paid: TfL digital panels near Fenchurch Street

  ↓

SCREEN 01 — App open (cold)
  Paper theme. Refueler wordmark. Brief single-line proposition.
  Two options: "Sign in" or "See how it works"
  No friction. No cookie banner. No permissions asked yet.

  ↓

SCREEN 03 — Landing / discovery
  What Refueler does, for whom, in three visible statements
  Non-bitcoiner first: "Order ahead. Skip the queue. Earn a reward."
  Bitcoin-native secondary: sats visible but not leading
  CTA: "Get started"

  ↓

SCREEN 04 — Sign up / sign in
  Email field → magic link
  "We've sent a link to your email" confirmation
  Passkey prompt on first successful login (shown once only)

  ↓

SCREEN 05 — Onboarding checklist (dismissible)
  ☑ Sign in
  ☐ Allow notifications
  ☐ Enable order-ahead (geofence opt-in — explained clearly before asking)
  ☐ Place your first order
  ☐ Set up your reward (sats wallet OR loyalty stamps — user chooses)

  ↓

SCREEN 06 — Venue discovery
  Map or list view. Nearby venues. Active venues highlighted.
  Walk-in and walk-past modes visible here.
  Venue tile shows: name, distance, current wait time (future), open/closed.
```

---

## Journey 02 — Returning user (Passkey registered)

```
SCREEN 02 — App open (returning)
  Face ID / Touch ID prompt immediately on open
  < 1 second to authenticated state
  Active order banner if order in progress
  Sats balance visible. No friction.
```

---

## Journey 03 — Pre-order (geofence active, commuter)

```
User boards Essex Thameside train at any station
  ↓
Train departs — on-device geofence detects movement
  ↓
Push notification: "Your flat white — confirm for Fenchurch Street?"
  [Confirm] [Dismiss]
  NOTE: User can order 2, 3, 4+ stops before arrival.
  The app calculates when to start the order based on the vendor's prep time
  and the remaining journey time. The user does not need to think about this.
  ↓
SCREEN 09 — Payment
  (Not yet designed — Session 10B priority)
  ↓
SCREEN 10 — ETA screen
  Liquid Glass venue strip: venue logo, name, address, order items
  Carbon base below: arc (under review), status phrase, reward whisper
  Status phrases: "Being prepared for you" / "A moment longer than expected" / "Waiting at the counter"
  ↓
Push notification: "Waiting at the counter"
  ↓
SCREEN 11 — Collection
  NFC tap or QR show
  Button: "Tap to collect · or show QR"
  ↓
SCREEN 12 — Reward confirmation
  Sats track: whisper — "⚡ 186 sats added"
  Loyalty track: stamp update — "3 / 9 · £1.20 saved toward your free coffee"
              + sats nudge: "⚡ You'd have earned 186 sats — switch in settings"
```

---

## Journey 04 — Walk-in (at the venue, ordering with friends)

```
User arrives at venue (no pre-order)
  ↓
Opens Refueler app → taps venue (QR scan at counter OR map selection)
  ↓
SCREEN 07 — Item selection (same flow as pre-order from this point)
  ↓
SCREEN 08 — Order confirmation
  ↓
SCREEN 09 — Payment
  ↓
Joins the queue OR staff acknowledges order on Command Centre tablet
  ↓
SCREEN 10 — ETA screen (same as pre-order)
  ↓
Collection and reward as above
```

---

## Journey 05 — Walk-past (proximity nudge)

```
User passes a Refueler venue (geofence or Bluetooth proximity)
  ↓
Push notification: "Earn 500 sats — visit M&S next?"
  [Order now] [Dismiss]
  ↓
If tapped: SCREEN 07 — Item selection
  ↓
Continues as walk-in journey from there
```

---

## Journey 06 — Order handoff to non-payer (shared collection link)

```
Payer places order and taps "Share collection link"
  ↓
Link sent to collector (SMS, WhatsApp, AirDrop, watch notification)
  ↓
Collector opens link → SCREEN 11 directly (no auth required)
  Collection screen shows: venue, items, QR, NFC prompt
  ↓
Collection confirmed
  ↓
If collector has no Refueler account:
  "Want to earn next time? It takes 30 seconds."
  [Create account] [Not now]
  → Youth onboarding moment. Light. Never pressured.
  ↓
Reward (sats or loyalty stamp) goes to PAYER's account
```

---

## Journey 07 — EV charging order

```
User arrives at charging bay
  ↓
Plugs in → app detects EV geofence OR user opens app manually
  ↓
"You're charging. Want to order from M&S while you wait?"
  [Order now] [Not now]
  ↓
Walk-in flow from SCREEN 07
  ↓
Order ready before charging completes
  ↓
SCREEN 11 — Collection
  EV flash screen (locate_v2.html) available if runner cannot find user:
  Full-screen venue secondary colour pulse (M&S gold, Costa cream, etc.)
  Activated by user tapping "Flash screen" on collection page
```

---

## Journey 08 — Wallet setup (non-bitcoiner, first sats earned)

```
User earns first reward on loyalty track
  ↓
SCREEN 12 shows: loyalty stamp update + sats nudge
  ↓
User taps sats nudge
  ↓
"What are sats?" — one sentence, no jargon
  "Sats are tiny fractions of Bitcoin. Real money, yours to keep."
  ↓
"Create a Minibits wallet — takes 30 seconds. No bank details needed."
  Step 1: [Create wallet] → hands off to Minibits or in-app guided flow
  Step 2: Wallet created → sats from previous purchases transferred
  Step 3: "⚡ Your sats are here" — confirmation in whisper style
  ↓
User is now on sats track (can toggle back to loyalty in settings)
```

---

## Journey 09 — Wallet linking (Bitcoin native, Lightning address)

```
Settings → Wallet → Lightning address → [+ Add]
  ↓
Drawer: paste or scan QR
  ↓
Fresh magic link sent for confirmation (sensitive action)
  ↓
"⚡ Lightning address linked. Sats will route here."
  Note: "Address used to push payment only. Not stored after sending."
```

---

## Journey 10 — Something goes wrong

### Order not ready on arrival
```
Locate screen shows: "Still being prepared — a moment longer"
  Venue updates to READY → notification fires
  No penalty. "These things happen — we're sorry for the wait."
```

### Missing reward
```
Account → "Missing a reward?" link
  Simple form: order date, venue
  Response within 1 hour during operating hours
  Manual credit if confirmed
```

### Magic link expired
```
"This link has expired — shall we send a new one?"
  One tap → new link
  Passkey users bypass entirely
```

---

## Information architecture

```
refueler.io/
├── /                      ← Landing (Paper default, Carbon toggle top-right)
├── /account               ← Auth-gated (Paper default)
│   ├── Overview (balance, recent orders)
│   ├── Order history
│   ├── Wallet (Minibits, Lightning, Zebedee)
│   ├── Rewards (sats track vs loyalty track — user choice)
│   ├── Settings (notifications, geofence, theme, Passkey)
│   ├── Privacy & data (export, delete)
│   └── Session info
├── /privacy               ← Public
├── /terms                 ← Public (to draft)
├── /contact               ← Public
├── /partner               ← Auth-gated — vendor tablet (Command Centre, Paper default)
├── /command               ← Auth-gated — Command Centre (Paper default — LOG IF NOT)
└── /locate                ← No auth — NFC/QR collection screen
```

---

## Permission / data request sequence

| Permission | When | Why then |
|---|---|---|
| Email | Sign-in | Required to use the service |
| Push notifications | After first login, onboarding step 2 | User has seen the product |
| Geofence | After first order OR onboarding step 3 | User understands the value |
| Passkey | After first magic link login | Trust established |
| Reward track choice | Onboarding step 5 | Before first order — sets expectations |
| Lightning wallet | User-initiated only | Pull, not push |
| Newsletter | Alongside waitlist, optional checkbox | Never pre-ticked |

---

## Onboarding — non-bitcoiner to sats migration path

```
Sign up
  ↓
Choose reward track (step 5 of onboarding checklist):
  "Loyalty stamps" (default for users with no wallet)
  OR "Bitcoin rewards" (if user selects / has wallet)
  ↓
First order → loyalty stamp + sats nudge shown on reward screen
  ↓
Each subsequent order: nudge persists, never intrusive
  ↓
User curious → taps nudge → guided Minibits wallet creation
  ↓
Switches to sats track → all future orders earn sats
  ↓
Accumulated loyalty stamps optionally converted (policy TBD with CPO/DPO)
```

---

## Command Centre — design notes

- Paper default on all CC screens — flag if any screen ships Carbon-first
- CC sign-in component identical to website sign-in (shared component)
- A merchant user may also be a general Refueler user — the app should serve both
- The CC should feel like a professional tool, not a consumer app
- But it must be visually consistent with the consumer-facing product

---

## Deferred

- Payment flow (Screen 09) — dedicated Session 10B time
- Arc vs typographic ETA treatment — awaiting CMO + Head of Design
- Toggle slider vs mode button — revisit after payment flow is designed
- England skin activation — Phase 2
- Watch UI — existing prototype sufficient for now
