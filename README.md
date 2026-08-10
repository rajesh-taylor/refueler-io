# Refueler

> Bitcoin-native privacy infrastructure. London.

---

## Products

**Share** — Anonymous encrypted file transfer. No account. No identity. The server stores encrypted noise and cannot read file content or identify users. Live at [refueler.io/share](https://refueler.io/share/).

**Legend** — Privacy-first Bitcoin block explorer. Designed for users who need to query addresses without broadcasting what they own or what they're watching. In development.

**Consumer app** — Lightning-native pre-order for commuters. Orders timed to train arrivals; payment settled via the Lightning Network. End-to-end flow verified on GrapheneOS.

---

## Stack

| Layer | Technology |
|---|---|
| Mobile app | React Native (Expo Router) |
| Backend / DB | Supabase |
| Auth | Supabase magic link (PKCE) |
| Payments | Lightning BOLT11 via Blink |
| File transfer | AES-GCM client-side + BLAKE3 chunk verification |
| Anonymous auth | Cashu blind signatures (NUT-00) |
| Hosting | Cloudflare Pages ← GitHub `main` |
| Workers | Cloudflare Workers |
| Email | Tuta Business + Resend SMTP |

---

## Operator interfaces

Five internal tools, served at `refueler.io/[slug]/`:

| URL | Role |
|---|---|
| `/command-centre/` | Auth entry point — role-based routing |
| `/merchant/` | Live order queue + departure feed |
| `/franchise/` | Franchise HQ reporting |
| `/dev/` | Platform telemetry and diagnostics |
| `/investor/` | Read-only platform KPIs |

---

## Supabase edge functions

| Function | Purpose |
|---|---|
| `create-order` | Generate Blink BOLT11 invoice at order confirm |
| `blink-webhook` | Receive Blink payment settlement |
| `blink-balance` | Blink wallet balance for internal tooling |
| `rail-signal-poll` | Live departure feed poller |

---

## Architecture principles

- Merchants read from `merchant_orders` only — never `orders` directly
- Geofence is on-device only — no location data transmitted
- Lightning address is transient — never persisted to database or logs
- No new subdomains — all products live at `refueler.io/[product]/`
- No external mint — ecash is closed-loop, non-monetary

---

## Contact

hello@refueler.io

---

*"Nothing stops this train."*
