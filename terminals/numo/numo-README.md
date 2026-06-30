# terminals/numo/README.md
> Numo 1.6 terminal adapter — Refueler integration spec
> Derived from: Numo_Fork_Plan_Session19.md + CC-09 architecture session
> Version: 1.0 | 11 June 2026

---

## What Numo is

Android-only NFC POS terminal (HCE tap-to-pay). Accepts Cashu ecash via NFC and
BOLT11 Lightning via QR. Built by Electric Dreams. Current version: 1.6.
Package: `com.electricdreams.numo`. Refueler fork target: `io.refueler.merchant`.

Numo emits `payment.received` webhooks at `payloadVersion: 2`.
The Cashu token is **never included** in the webhook — Numo redeems it before firing.

---

## Webhook auth

Numo sends `Authorization: <configured-bearer-key>` on every webhook.
Secret configured client-side on the device. Stored in Supabase edge function env as
`NUMO_WEBHOOK_SECRET`. Validated in `webhook-handler.ts` before any processing.

---

## NUT coverage (Numo 1.6)

| NUT | Status | Notes |
|-----|--------|-------|
| NUT-00 to 06 | ✅ Live | Basic protocol |
| NUT-11 P2PK | ✅ Likely present | Used for NDEF-write token receipt |
| NUT-18 | ✅ Live (receive side) | `creqA...` payload in NDEF Text record |
| NUT-14 HTLC | ⚠️ Unknown | Not confirmed in 1.6 — defer to Phase 2 |
| NUT-17 WebSocket | ⚠️ Unknown | Likely polling-based |

---

## Payment flow (Numo HCE tap-to-pay)

```
1. Merchant presses "Charge" → amount set
2. HCE activates → NdefHostCardEmulationService emulates Type 4 NDEF tag
3. NDEF file: Text record with NUT-18 creqA... payment request
   (in Refueler fork: fetched from Supabase nut18-request edge fn, not keyed manually)
4. Customer wallet taps → reads NDEF via APDU sequence
5. Customer wallet writes cashuB token back via UPDATE BINARY
6. Numo: CashuPaymentHelper.extractCashuToken() → validate → redeem on mint
7. On success: fires payment.received webhook to Refueler Supabase edge fn
8. Merchant sees confirmation
```

---

## Refueler fork — what changes

| Module | Action | Detail |
|--------|--------|--------|
| `NdefMessageBuilder` | Modify | Accept pre-built `creqA...` from Supabase instead of manual entry |
| `MintManager` | Modify | Whitelist Minibits mint URL; add Refueler mint when live |
| Payment callback | Modify | Route `onCashuTokenReceived` to Supabase `numo/webhook-handler.ts` |
| `AndroidManifest.xml` | Modify | Rename package → `io.refueler.merchant` |
| All UI layouts | Replace | Refueler Carbon theme, Satoshi/DM Sans, `#1E1F22` bg, `#C8A96E` accent |
| `colors.xml` / `strings.xml` | Replace | Full Refueler design token set + brand copy |
| Onboarding | Replace | Venue PIN login (no seed phrase — merchants don't need a wallet) |
| Catalogue/basket UI | Replace | Sync from `venues` table menu items via Command Centre |
| App icon | Replace | Refueler brand |

**MVF scope: ~5 files modified, ~3 replaced. No new NUT implementation required.**

---

## Webhook handler location

`refueler.io/terminals/numo/webhook-handler.ts`

Maps `NumoPaymentReceivedWebhookV2` → `TerminalPaymentEvent` (see TERMINAL-ADAPTER-SPEC.md).
Deployed as Supabase edge function. Idempotency key = `eventId`.

---

## Security hardening — event/pop-up scope (CC-53 spec)

Status as of CC-53 spec session. Franchise terminals are NOT covered — separate future session.

| Item | Event/pop-up status | Detail |
|------|---------------------|--------|
| Mint credentials (mnemonic) | Spec'd — not yet built | `EncryptedSharedPreferences` (Jetpack Security, AES256-GCM, Keystore-backed key) wraps `PreferenceStore.wallet()`. Drop-in at the store layer; `CashuWalletManager` untouched. |
| Nostr mint backup broadcast | Spec'd — disable for event mode | `eventMode` flag short-circuits `MintManager.kt:525` before `NostrMintBackup.publishMintBackup` fires. Not a "fix," a deliberate disable — no restore scenario justifies the relay metadata exposure for a one-night device. |
| Webhook auth (bearer → HMAC) | Spec'd — not yet built | `WebhookEndpointConfig.authKey` becomes an HMAC-SHA256 secret (`whsec_`-prefixed). Verification logic mirrors `blink-webhook/index.ts`'s `verifySvixSignature()` exactly (confirmed against real source, not a shared module — there is no separate `webhookSecurity.ts`). Secret stored via the same `EncryptedSharedPreferences` wrapper as mint credentials. |
| Certificate pinning | Not covered this session | Franchise-grade item, not assessed for event/pop-up necessity yet. |
| Token logging | Not covered this session | Carried over from original table, unchanged — still applies regardless of scope. |

Full detail: `numo-hardening-spec-CC53.md`.

### Deferred to franchise-grade (explicitly out of scope here)
- Hardware-backed StrongBox keys, key rotation policy, biometric/PIN gating, remote wipe
- Private/paid Nostr relay or NIP-65 customization (if backup is ever needed for franchise devices)
- Per-venue secret rotation schedule, webhook replay-window enforcement, delivery retry/backoff

---

## NUT-14 HTLC — Phase 2 only

Numo 1.6: receive token → redeem immediately. No HTLC escrow.
Refueler Phase 2: terminal must claim HTLC preimage to release funds.
Preimage delivered to terminal via webhook response or polling endpoint.
Blocked on: `cdk-kotlin` NUT-14 support confirmation (open question to Numo maintainers).

---

## Open questions

1. Does `cdk-kotlin` expose NUT-14 HTLC claim methods on the merchant/receiver side?
   *Still unresolved — not assessed in CC-53 (out of scope, didn't block any of the three hardening gaps).*
2. Is NUT-17 WebSocket implemented, or redemption confirmation polling-only?
   *Still unresolved — not assessed in CC-53.*
3. ~~How are mint credentials stored?~~ **Resolved (CC-53):** plain `SharedPreferences` (`MODE_PRIVATE`) via `core/prefs/PreferenceStore.kt`, no encryption. The wallet mnemonic (`KEY_MNEMONIC` in `CashuWalletManager.kt:602-610`) is stored this way — confirmed in upstream source. Fix spec'd: `EncryptedSharedPreferences` wrapper, see hardening table above.
4. Is payment history in Room/SQLite or in-memory only?
   *Still unresolved — not assessed in CC-53.*
5. Block/Square Terminal Bitcoin support — monitor for BOLT11/ecash webhook compatibility.

---

## Files needed from Numo source (when fork session begins)

```
app/src/main/java/com/electricdreams/numo/core/
app/src/main/java/com/electricdreams/numo/ndef/
app/src/main/java/com/electricdreams/numo/ui/payment/
app/build.gradle.kts
app/src/main/AndroidManifest.xml
```

---

## Related sessions

- Session 19 (31 May 2026): Initial fork plan — `Numo_Fork_Plan_Session19.md`
- CC-09 (11 June 2026): Terminal adapter architecture, folder structure
- Fork session: TBD (2+ weeks out — not on critical path)
