# Refueler — NUT-18 Implementation
*Session 14 · 30 May 2026*

## What's in this package

```
refueler-nut18/
├── lib/
│   ├── mintInterface.ts        NUT abstraction layer — swap mint via MINT_URL only
│   └── webhookSecurity.ts      HMAC-SHA256 signing + verification utilities
├── supabase/
│   ├── functions/
│   │   ├── nut18-request/      Edge function: generate NUT-18 request at order confirm
│   │   └── nut18-webhook/      Edge function: receive mint settlement webhook
│   └── migrations/
│       └── 20260530_nut18_orders.sql   Full schema: orders, notifications, audit logs
└── README.md                   This file
```

---

## Order state machine

```
pending → paid → fulfilled → collected
                           ↘ expired (HTLC auto-refund)
         ↘ error
         ↘ keyset_error  (NUT-02 rotation — token safe, retry)
```

**Transitions:**
- `pending → paid` — webhook received (primary) or NUT-07 fallback (emergency only)
- `paid → fulfilled` — venue terminal taps "ready"
- `fulfilled → collected` — ETA widget arc → Collected state (customer at venue)
- `pending → expired` — HTLC timeout elapsed, token auto-refunded by protocol

---

## Environment variables required

| Variable | Purpose |
|---|---|
| `MINT_URL` | Mint base URL — `https://mint.minibits.cash/Bitcoin` for v1 |
| `WEBHOOK_SIGNING_SECRET` | Shared secret for HMAC-SHA256 webhook verification |
| `SUPABASE_URL` | Injected automatically in edge functions |
| `SUPABASE_ANON_KEY` | Injected automatically |
| `SUPABASE_SERVICE_ROLE_KEY` | Injected automatically (webhook function only) |

Store `WEBHOOK_SIGNING_SECRET` in Supabase Vault, not in `.env`.

---

## Mint portability

Every mint interaction is isolated in `lib/mintInterface.ts`.
To swap from Minibits to a self-hosted ippon ("Refueler Encash") or any other
NUT-00 compliant mint:

1. Change `MINT_URL` in Supabase environment variables.
2. Confirm the NUT-18 send endpoint path with the new mint operator.
3. Update `buildNUT18Request()` if the new mint uses a different encoding.
4. Zero changes to edge functions, schema, or mobile app code.

---

## Critical path: NUT-18 send not yet live in ippon

As of Session 13 (30 May 2026), the Minibits mint decodes NUT-18 requests
but `send` throws "not yet supported".

**Current state of `buildNUT18Request()`:**
- Encodes the NUT-18 request locally (cashu-ts PaymentRequest format)
- Returns it ready for deeplink/QR delivery to the customer wallet
- The customer wallet (Minibits) resolves the request against the mint

**What changes when Minibits ship NUT-18 send:**
1. Confirm the endpoint path from Minibits (raise in Cashu dev call)
2. Add a `mintGenerateRequest()` call in `mintInterface.ts` that proxies to the mint
3. Update `buildNUT18Request()` to call it — callers (edge function) need no changes
4. Ship the updated `mintInterface.ts` only

**Question for Minibits partnership email / dev call:**
> "When NUT-18 send ships, what will the endpoint path be? Will it return an
> encoded creqA/creqB string, or a different format? Do you support custom
> metadata fields (order_ref, venue_id) in the transport identifier?"

---

## No-show / griefing defence — locked design

### Honest no-show (customer pays, doesn't arrive)
- **Primary defence:** preparation gate — `preparation_window_seconds` per venue
- Terminal shows "make now" ONLY when customer ETA ≤ preparation window
- ETA signal comes from Session 9 geofence (Limehouse velocity trigger)
- Default: 240s (4 min) preparation window inside 480s (8 min) HTLC window
- If HTLC expires before customer arrives: auto-refund, venue should not have started yet

### Competitor griefing attack (place + abandon orders at scale)
- **Rate limit:** max 5 pending orders per user per hour (enforced in `nut18-request`)
- **Anomaly flag:** high-refund-rate wallets flagged in `orders.anomaly_flag`
- **Preparation gate:** attacker must physically be on the train to pass ETA check
- **Cost to attacker:** sats returned (zero cost) vs. preparation gate raising bar significantly
- Anomaly dashboard in Command Centre surfaces patterns. Aggregate, no identity. GDPR-clean.

---

## GDPR / ICO compliance notes

### Webhook primary, NUT-07 fallback only
- Webhook: mint pushes server-to-server. No user identity. Clean.
- NUT-07: `@gdpr-flag` in code. Server-side only. Last resort.
  Emergency trigger: webhook fails 3× + 2-min timeout.
  Logged to `webhook_failures.nut07_fallback_triggered` for ICO audit trail.

### Data stored in `orders` table
- No wallet address, no payment history, no profiling data
- `user_id` = Supabase auth UUID only (not linked to real identity)
- `wallet_pubkey` = optional, stored only for NUT-11 P2PK handoff
- `gbp_rate_snapshot` = audit requirement for FCA/financial record-keeping only

### `webhook_security_log.source_ip`
- Stored for 90 days, security audit only
- Not linked to user identity, not used for profiling
- Add to ICO/GDPR disclosure: "We log IP addresses of requests to payment
  security endpoints for 90 days to detect and prevent unauthorised access attempts."

---

## BOLT12 / NUT-25 upgrade path

Current: BOLT11 Lightning invoices for venue sweep.
Future: NUT-25 BOLT12 offers — removes expiry friction, better privacy.

How to upgrade per venue when Minibits ship NUT-25:
1. Set `venues.lightning_ramp_version = 'bolt12'` for that venue
2. `mintInterface.ts` reads this field and switches sweep mode
3. All other code unchanged

Zero-migration design: `lightning_ramp_version` column already in schema.

---

## NUT-02 keyset rotation

When Minibits rotates their keyset:
- Old keysets remain valid for existing proofs
- New proofs must use the new active keyset
- If a proof arrives mid-rotation, mint returns error code 11001 or 11002
- `isKeysetRotationError()` in `mintInterface.ts` catches these
- Maps to **Error B**: "Sats safe, try again" — token not burned
- Customer wallet auto-syncs new keyset on next startup

**No action required from Refueler backend** — the error classification
surfaces cleanly to the customer as a recoverable retry state.

---

## NUT-14 HTLC escrow — regulatory story

> "We don't hold funds. We don't arbitrate disputes.
> If the venue doesn't mark the order fulfilled within the agreed window,
> the protocol refunds the customer automatically."

Config: `venues.htlc_timeout_seconds` (default 480s / 8 min).
Overridable per venue. Passed through to the terminal in `venue_notifications`.
The terminal is responsible for enforcing the HTLC lock at settlement.

**For investor materials and FCA pre-application:** this is the architecture
that keeps Refueler outside the payment chain. Refueler is the orchestration
layer. The Cashu protocol handles custody and refunds.

---

## Session 14 open questions (carry to Minibits dev call)

1. NUT-18 send endpoint path and response format when shipped
2. Custom metadata fields in transport identifier (order_ref, venue_id)
3. NUT-07 IP logging — do endpoints log IPs on state check requests?
4. NUT-17 WebSocket or polling — custom metadata fields for order correlation?
5. NUT-14 HTLC — does ippon enforce the timeout server-side or is it wallet-side?
6. Multi-mint whitelist — timeline for user-dynamic multi-mint resolution?

---

*End of README — Session 14*
