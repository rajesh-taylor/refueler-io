# Numo Terminal Hardening — Task List (CC-54)
> Build session. Spec source: `terminals/numo/numo-hardening-spec-CC53.md` (spec-only, no code — confirmed CC-54).
> Scope: event/pop-up terminal use only (Track 1 — independents + events, §4d). Franchise-grade hardening explicitly deferred, see bottom.
> This doc is the working checklist for the fork. Update status inline as tasks close.

---

## Why Numo, in one line

Numo is the merchant-side NFC tap-to-pay handheld (Cashu via NFC, BOLT11 via QR) — the physical device for Track 1 venues (independents, pop-ups, the Fountain gig-venue concept) that don't have a fixed till. It is unrelated to the sats/loyalty-stamp reward payout to the commuter, which is a separate Blink-side flow. Numo's only job is: take payment → fire `payment.received` webhook → normalise into `TerminalPaymentEvent` → land in `merchant_orders`, same table every other payment path writes to.

---

## Status snapshot (confirmed CC-54, before any code written)

- `terminals/numo/numo-types.ts` — 0 bytes, empty stub
- `terminals/numo/webhook-handler.ts` — 0 bytes, empty stub
- No Numo-related Supabase Edge Function deployed (`list_edge_functions` checked directly — only `blink-webhook`, `blink-balance`, `bolt11-create-invoice`, `rail-signal-*`, `match-day-detector` exist)
- No local fork checkout yet — `refueler.io/terminals/numo/` has spec docs only
- CC-53's Gap 3 correction (HMAC construction mirrors `blink-webhook/index.ts` exactly, no separate `webhookSecurity.ts`) verified CC-54 against the live deployed source (v6) — confirmed accurate, safe to build against as-is

---

## Task sequence

### Phase 0 — Fork + scaffold (prerequisite, no hardening content)
- [ ] Clone `cashubtc/Numo` upstream
- [ ] Rename package `com.electricdreams.numo` → `io.refueler.merchant`
- [ ] Confirm local build runs unmodified before any hardening changes land (clean baseline to diff against)
- [ ] Do NOT touch UI/theme/branding this session — out of scope, separate pass per `numo-README.md`'s fork table

### Phase 1 — Gap 2: Nostr mint backup (do first — no dependency, cheapest item)
- [ ] Add `eventMode: Boolean` flag (app-level config, tied to the same venue_type distinction used elsewhere)
- [ ] Gate `MintManager.kt:525` (`publishMintBackup` call) behind `!eventMode` — short-circuit before it reaches `NostrMintBackup`
- [ ] This is a deliberate disable, not a fix — no restore scenario applies to a one-night device in Rajesh's custody. Do not attempt to "fix" the relay metadata exposure (private relay, NIP-65) — that's franchise-grade, deferred.
- [ ] Verify: trigger a mint list change in event mode, confirm zero Nostr relay traffic (network log / relay connection check)

### Phase 2 — Gap 1 + Gap 3 shared foundation: `EncryptedSharedPreferences` wrapper
- [ ] Add `androidx.security:security-crypto` dependency (Jetpack Security)
- [ ] Build the `EncryptedSharedPreferences` wrapper (AES256-GCM, Keystore-backed key) — construct once, reusable
- [ ] Apply wrapper at `PreferenceStore.wallet()` construction — same get/put interface, so `CashuWalletManager` (incl. `KEY_MNEMONIC` handling at `CashuWalletManager.kt:602-610`) needs **zero changes**
- [ ] Verify: confirm `KEY_MNEMONIC` is no longer readable via plain ADB pull / backup extraction of `SharedPreferences` XML

### Phase 3 — Gap 3: Webhook auth, bearer → HMAC-SHA256
- [ ] Apply the same `EncryptedSharedPreferences` wrapper to `WebhookSettingsManager`'s backing store (second call site, same fix)
- [ ] `WebhookEndpointConfig.authKey` becomes a `whsec_`-prefixed HMAC secret, not a static bearer token
- [ ] Kotlin side — `PaymentWebhookDispatcher.kt`: construct and send `svix-id` / `svix-timestamp` / `svix-signature` headers on `payment.received`, mirroring the confirmed `blink-webhook` construction exactly:
  - Secret: strip `whsec_` prefix, base64-decode to raw key bytes, `HMAC-SHA256` key import (never used as literal string)
  - Signed content: `{svix-id}.{svix-timestamp}.{rawBody}` — dot-joined, not JSON envelope
  - Signature header: `v1,<base64sig>`
- [ ] TS side — replace the empty `terminals/numo/webhook-handler.ts` stub with a real implementation:
  - Implement `verifySvixSignature()` — copy near-verbatim from `blink-webhook/index.ts` (same secret format, signed-content construction, timing-safe compare)
  - Timestamp tolerance: reject >300s out of sync, checked **before** HMAC compute (cheap rejection)
  - Multi-candidate check: verification must check signature against *any* space-separated `v1,` value in the header (covers rotation)
  - Export `normalise()` and `verifyAuth()` per `TERMINAL-ADAPTER-SPEC.md`'s adapter contract — `verifyAuth()` is the only piece Gap 3 actually changes (bearer-string compare → HMAC verify)
  - Keep `TerminalPaymentEvent.eventId`-based idempotency separate from signature verification — don't conflate with `blink-webhook`'s DB-layer idempotency (`payment_status === 'paid'` check), that pattern doesn't transfer 1:1
- [ ] Deploy `webhook-handler.ts` as a Supabase Edge Function, `verify_jwt: false` (same reasoning as `blink-webhook` — Numo has no Supabase JWT to send, only its own HMAC headers; standing rule §4j / CC-46 applies here too — must pass `false` explicitly or delivery silently 401s at the gateway before the function runs)
- [ ] Verify: fire a real signed test webhook from the modified Numo build, confirm `200` from the deployed function, confirm a deliberately-mis-signed payload gets rejected `401`

### Explicitly not this session (franchise-grade, deferred)
- Hardware-backed StrongBox keys, key rotation policy, biometric/PIN gating, remote wipe
- Private/paid Nostr relay or NIP-65 customization (only relevant if backup is ever needed for franchise devices)
- Per-venue secret rotation schedule, webhook replay-window enforcement beyond 300s, delivery retry/backoff
- Certificate pinning — not assessed for event/pop-up necessity yet, carried over unassessed from CC-53
- Token logging — carried over unassessed from CC-53, applies regardless of scope, not actioned here

### Also explicitly not this session (unrelated open questions, don't block hardening)
- NUT-14 HTLC — Phase 2 only, unconfirmed upstream
- NUT-17 WebSocket vs polling-only redemption confirmation
- Payment history storage (Room/SQLite vs in-memory)

---

## Definition of done for CC-54

All three gaps (1, 2, 3) have working code in the local fork, not just spec. Verification steps above pass. `numo-README.md`'s hardening table status column updates from "Spec'd — not yet built" to built/verified per item. Franchise-grade deferred items remain explicitly out of scope, not silently dropped.

---

*Task list only — implementation happens in-session below, status updated as tasks close.*
