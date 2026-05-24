# REFUELER — Session 7 Planning Document
**Status:** Pre-session. Open after Session 6a infrastructure is complete.
**Version:** v1.3
**Focus:** Costco Bulk Verification. IKEA + M&S Sparks extension. Retailer rewards framework. Sats-first, giftcard secondary.
**Updated:** 2026-05-19 — pre-session actions clarified, Costco visit added to checklist.

---

## Session 7 Objective

Build the bulk purchase verification layer. User scans their Costco membership barcode and receipt barcode. Refueler cross-references them, verifies the purchase, and issues a sats rebate via Minibits ecash. The same infrastructure extends to IKEA and M&S Sparks with minimal additional build.

---

## Core Principle — Sats Earned by Buying, Not by Existing

Users earn sats because they made a purchase and used Refueler to verify it. There is no passive earning. The rebate is a reward for a commercial transaction, not for presence or behaviour. This keeps Bitcoin meaningful in the receiver's mind.

---

## The Verification Flow

```
User completes Costco purchase
        ↓
Opens Refueler Scan tab at Costco exit
        ↓
Step 1: Scans Costco membership barcode → membership number extracted
Step 2: Scans receipt barcode (Code 128) → transaction ID + store + date + value extracted
        ↓
Refueler verifies:
  ✓ Membership number matches receipt
  ✓ Receipt date within 24 hours
  ✓ Store number in registered Refueler locations
  ✓ Transaction ID not already claimed (unique index)
        ↓
All pass → rebate calculated
        ↓
Rewards screen: ⚡ Stack sats (default, prominent)
                "Prefer Costco credit instead?" (secondary, small, grey)
        ↓
Sats: Minibits MCP server issues ecash token to user wallet
Giftcard: queued for partner API or manual fulfilment (MVP)
        ↓
Supabase bulk_purchases updated → Command Centre Bulk view
```

---

## Barcode Technical Detail

**Costco receipt:** Code 128 barcode. Encodes transaction ID, store number, membership number, date, total value. **Verify exact encoding on a live Costco Lakeside receipt before Session 7 build — this is a hard pre-session requirement.**

**Costco membership card:** Code 39 or PDF417. Encodes membership number.

**Barcode library:** `zxing-js/browser` — supports Code 128, Code 39, PDF417, QR. MIT licence, CDN importable.

**iOS Safari note:** `zxing-js` has known quirks on iOS Safari. **Test on a real iPhone with a Costco receipt before the session.** If issues arise, fallback is `quagga2` library.

---

## Fraud Resistance

| Check | Method |
|---|---|
| Membership tie | Membership number must match the number embedded in receipt barcode |
| Single-use | Unique index on `(retailer, transaction_id)` — second scan rejected |
| Time window | Receipt date must be within 24 hours of scan |
| Store list | Store number must be in `retailer_locations` table |
| Value floor | Purchase must meet minimum (£50 default) to be eligible |

**Phase 2 — Costco API partnership:** Costco provides a receipt verification endpoint. Eliminates all barcode parsing edge cases. Requires commercial agreement. Approach after demonstrating volume data.

---

## Giftcard vs Sats — Commercial Strategy

### What retailers want
Costco, IKEA, and M&S all prefer giftcard rebates — keeps spend inside their ecosystem. Lead with giftcard in commercial conversations. It removes their Bitcoin friction entirely.

**How to frame it to retailers:**
- "You don't touch Bitcoin. Your credit stays on your platform."
- "We handle the sats layer — it's our cost, not yours."
- "Phase 2: your marketing budget funds the giftcard rebate (0.5%). We fund the sats layer separately."

### What Refueler controls — sats-first UX
The UI always defaults to sats regardless of what the retailer prefers:
- **Primary CTA:** "⚡ Stack sats" — large, orange `#F7931A`, prominent
- **Secondary:** "Prefer [Retailer] credit instead?" — small, grey, deliberate tap required
- **Progress messaging:** "You've stacked 4,200 sats this month" — accumulation framing, never "you saved £0.97"
- Giftcard option is never proactively surfaced — only when user opts in

---

## Retailer Extension — Built Once, Config After

| Retailer | Receipt type | Membership | Rebate rate | Priority |
|---|---|---|---|---|
| Costco | Code 128 | Membership card barcode | 1.0% | Session 7 MVP |
| IKEA | QR code | IKEA Family card QR | 1.0% | Session 7 extension |
| M&S | QR (Sparks app) | Sparks QR | 0.5% | Session 7 extension |
| Sainsbury's | QR / barcode | Nectar card | TBC | Session 9+ |
| Tesco | QR | Clubcard | TBC | Session 9+ |

---

## Supabase Schema

```sql
CREATE TABLE retailer_locations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  retailer text NOT NULL,
  store_identifier text NOT NULL,
  name text NOT NULL,
  lat numeric(9,6),
  lng numeric(9,6),
  active bool DEFAULT true,
  partner_tier text DEFAULT 'standard',
  giftcard_enabled bool DEFAULT false,
  giftcard_api_endpoint text,
  UNIQUE(retailer, store_identifier)
);

CREATE TABLE bulk_purchases (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  retailer text NOT NULL,
  transaction_id text NOT NULL,
  store_identifier text,
  membership_number text NOT NULL,
  purchase_value_gbp numeric(10,2),
  rebate_pct numeric(4,2),
  rebate_gbp numeric(10,2),
  rebate_sats bigint,
  sats_rate numeric(12,2),
  reward_type text DEFAULT 'sats',
  ecash_token_ref text,
  giftcard_ref text,
  verified bool DEFAULT false,
  verification_method text DEFAULT 'barcode_mvp',
  redeemed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(retailer, transaction_id)
);

CREATE TABLE bulk_config (
  key text PRIMARY KEY,
  value text,
  updated_at timestamptz DEFAULT now()
);

INSERT INTO bulk_config VALUES
  ('costco_rebate_pct', '1.0', now()),
  ('ikea_rebate_pct', '1.0', now()),
  ('ms_sparks_rebate_pct', '0.5', now()),
  ('min_purchase_gbp', '50', now()),
  ('max_rebate_sats', '50000', now()),
  ('sweep_threshold_sats', '10000', now()),
  ('redemption_window_hours', '24', now());
```

---

## Pre-session actions (MUST complete before Session 7 build)

1. **Visit Costco Lakeside** — capture store number from a live receipt, photograph the barcodes, test `zxing-js` scan on iPhone Safari with real receipt
2. **Note membership card format** — is it physical card barcode or digital app QR?
3. **Confirm Minibits MCP server actions** — `issue_token`, `get_balance`, `trigger_sweep`
4. **Decision needed:** build IKEA + M&S Sparks in same session as Costco, or Costco MVP first?
5. **Decision needed:** giftcard manual fulfilment MVP, or defer giftcard entirely to when API partnership exists?

---

## Session 7 Build Checklist

- [ ] `zxing-js` scanner — iOS Safari tested with real Costco receipt
- [ ] Supabase: `retailer_locations`, `bulk_purchases`, `bulk_config` tables
- [ ] Costco Lakeside seeded in `retailer_locations` (store number from live receipt)
- [ ] Verification logic: membership + receipt cross-reference, all four checks
- [ ] Double-claim prevention (unique index)
- [ ] 24h window check
- [ ] `refueler_scan.html`: step-by-step scanner UI
- [ ] Sats-first / giftcard-secondary rewards screen
- [ ] Minibits MCP: ecash issuance on verified purchase
- [ ] Command Centre: Bulk Verification view
- [ ] Mapbox: retailer store markers
- [ ] IKEA config row (inactive until confirmed)
- [ ] M&S Sparks config row (inactive until confirmed)

---

## Version history
| Version | Date | Notes |
|---|---|---|
| v1.0 | 2026-05-17 | Initial plan |
| v1.1 | 2026-05-17 | Giftcard vs sats strategy, IKEA + M&S Sparks, multi-retailer schema |
| v1.2 | 2026-05-17 | Aligned with no-Transit-Mining decision. Sats earned by buying only. |
| v1.3 | 2026-05-19 | Pre-session actions clarified. Costco receipt capture flagged as hard requirement before build. |
