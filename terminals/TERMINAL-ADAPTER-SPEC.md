# TERMINAL-ADAPTER-SPEC.md
> Refueler terminal adapter interface — authoritative spec for all POS integrations.
> Version: 1.0 | Created: CC-09 architecture session, 11 June 2026

---

## Purpose

All payment terminals (Numo, Block, BTCPay, future) must normalise their payment events
into the `TerminalPaymentEvent` shape before anything touches `merchant_orders` in Supabase.
The order processing pipeline is terminal-agnostic. Adapters live in subfolders here.

---

## TerminalPaymentEvent (canonical shape)

```typescript
interface TerminalPaymentEvent {
  eventId: string;              // terminal-generated unique ID (idempotency key)
  basketId: string | null;      // maps to merchant_orders.numo_basket_id (null = ad-hoc)
  amountSats: number;
  paymentType: 'cashu' | 'lightning' | string;
  status: 'completed' | 'pending' | 'cancelled' | string;
  terminalId: string;           // device identifier
  terminalVendor: 'numo' | 'block' | 'btcpay' | string;
  timestampMs: number;
  lineItems: TerminalLineItem[] | null;  // null if ad-hoc payment
  bitcoinPriceGbp: number | null;       // sats/GBP rate at time of payment
  rawPayload: unknown;          // original webhook body, stored for audit
}

interface TerminalLineItem {
  itemId: string;
  name: string;
  quantity: number;
  grossTotalCents: number;
  vatRate: number;
  priceSats: number;
}
```

---

## Adapter contract

Each adapter folder must export:
- `normalise(rawPayload: unknown): TerminalPaymentEvent` — maps raw webhook to canonical shape
- `verifyAuth(request: Request, secret: string): boolean` — validates terminal auth (bearer/HMAC)
- `README.md` — documents the terminal's webhook schema version and any known gaps

---

## Adapter Profile 2 — Handheld Terminal (Seated / Dine-in)

**Status:** Not on critical path — scoped CC-19, build session TBD.

**Target venues:** Hospitality venues operating dual-mode (daytime café + evening wine bar /
restaurant), e.g. Comptoir Café & Wine model.

**Device class:** Numo-class handheld (same hardware as counter adapter).

**Order type:** `seated` (distinct from `collection`).

**Trigger:** Refueler user checks in at table / has active reservation.
Not triggered by train arrival wave.

**Queue routing:** Separate from counter queue. `merchant_orders.order_type = 'seated'`.
Offloaded to handheld device; does not appear in `merchant-tablet.html` counter view.

**Architecture note:** `merchant-tablet.html` handles `collection` queue only.
Handheld surface handles `seated` / reservation queue.
Two surfaces, same `merchant_orders` table, filtered by `order_type`.

**CPO session required** before build opens:
- Reservation check-in UX flow
- Table assignment model
- Whether seated orders share the BOLT11 payment flow or defer to tab settlement

---

## Current adapters

| Folder | Terminal | Webhook schema | Status |
|--------|----------|---------------|--------|
| `numo/` | Numo 1.6 Android POS | `payment.received` payloadVersion 2 | Stub — Session TBD |
| `block/` | Block/Square Terminal | TBD | Future |

---

## Correlation policy

- **Basket payment (pre-order):** use `basketId` → `merchant_orders.numo_basket_id`
- **Lightning fallback:** use `lightningQuoteId` → match against invoice created by `bolt11-create-invoice`
- **Ad-hoc tap (no basket):** log as revenue, no order correlation; store in `ad_hoc_payments` table

---

## Auth pattern

All adapters use bearer token auth. Secret stored in Supabase edge function env vars.
Never hardcoded. HMAC-SHA256 for Numo (per `webhookSecurity.ts`).
