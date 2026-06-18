# Refueler

> Bitcoin-native pre-order for Fenchurch Street line commuters.  
> Your order is ready. So is your train.

---

## What it is

Refueler times café and food orders to a commuter's train arrival on the Fenchurch Street line (Shoeburyness → Fenchurch Street). The commuter orders on the app, the venue gets the order at the right moment, and the item is ready at the counter when they walk in — no queue, no wait.

Payment is settled over the Lightning Network. The app is designed for both Bitcoin-native users (sats rewards) and everyday commuters (loyalty stamp bridge).

**Status:** Infrastructure live. Pre-TestFlight. Beta target: July 2026.

---

## Stack

| Layer | Technology |
|---|---|
| Mobile app | React Native (iOS-first) |
| Backend / DB | Supabase (`tihgvdokeofnjxjkenmm`) |
| Auth | Supabase magic link (email) |
| Payments | Lightning BOLT11 via Blink (`api.blink.sv/graphql`) |
| Hosting | Cloudflare Pages ← GitHub `main` |
| Analytics | Cloudflare Analytics Engine |
| Email | Tuta Business + Resend SMTP |
| Ecash (future) | Cashu / NUT-18 via `mintInterface.ts` abstraction |

---

## Command Centre

Four operator-facing interfaces, all served from repo root via Cloudflare Pages:

| File | Role | Access |
|---|---|---|
| `command-centre.html` | Auth entry point — role-based routing | All operator roles |
| `merchant-tablet.html` | Live order queue + Darwin departure feed | Venue staff / owners |
| `dev-console.html` | Platform telemetry, Blink wallet, error stack | Admin only |
| `franchise-dashboard.html` | Franchise HQ reporting | Franchise HQ role |

Supporting files: `merchant-tablet-styles.css`, `merchant-tablet-logic.js`, `analytics.js`.

Auth flow: magic link email → `command-centre.html` → role resolved from `merchant_users` → redirect to appropriate interface.

---

## Supabase edge functions

| Function | Purpose | Status |
|---|---|---|
| `bolt11-create-invoice` | Generate Blink BOLT11 invoice at order confirm | ACTIVE |
| `blink-webhook` | Receive Blink payment settlement, update `merchant_orders` | ACTIVE |
| `blink-balance` | Return Blink wallet balance (sats + GBP) for dev console tile | ACTIVE |

---

## Key architecture decisions

- **Merchants read from `merchant_orders` only** — never `orders` directly (data isolation, locked)
- **Geofence is on-device only** — no location data ever transmitted (GDPR, locked)
- **Lightning address is transient** — never persisted to database, logs, or backups
- **`mintInterface.ts`** is the payment provider abstraction — Cashu/NUT-18 and BOLT12 slot in behind it without touching the order layer
- **Blink only for beta** — BOLT12 assessed and abandoned; ZBD permanently replaced

---

## Ecash / NUT-18 (future)

Research and implementation specs for Cashu NUT-18 integration live in the adjacent `refueler-ecash-lab/` directory (not in this repo). NUT-18 send is not yet live in the Minibits mint as of June 2026. Integration is gated on Minibits shipping the send endpoint — tracked via Cashu dev calls.

The `mintInterface.ts` abstraction means zero changes to edge functions or the order layer when NUT-18 ships.

---

## Corridor

**Fenchurch Street line only.** Never "C2C" (trademark clearance pending).  
37.3M annual journeys · ~29,760 daily passengers · 45th most used UK station (ORR 2025).

---

## Contacts

| Role | Address |
|---|---|
| General | hello@refueler.io |
| Privacy | privacy@refueler.io |
| Support | support@refueler.io |

---

*"Nothing stops this train."*
