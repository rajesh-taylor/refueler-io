# Numo Terminal Hardening Spec — Event/Pop-up Scope (CC-53)

> Spec only. No code changes. Target: one-night, single-handheld deployment supporting the Fountain-adjacent gig-venue concept. Franchise-grade hardening is explicitly out of scope and is called out wherever the two diverge.

> **Addendum:** Gap 3 (webhook auth) was originally specced from memory of the `blink-webhook` pattern, referencing a `webhookSecurity.ts` module that does not exist. After the real `blink-webhook/index.ts` source was provided post-session, Gap 3 below was corrected to mirror the actual verified implementation exactly. No other gaps changed.

## Fork status check (prerequisite, completed this session)

`refueler.io/terminals/numo/` has no code yet — only `TERMINAL-ADAPTER-SPEC.md` exists locally. No fork divergence to account for. This spec is grounded directly against upstream `cashubtc/Numo` (cloned and read this session) rather than against local changes, since none exist.

This also means the fork can start clean with the hardening built in from file one, rather than retrofitted — cheaper than fixing it after the fact.

## Source-grounded findings

Read directly from upstream before speccing, per session instructions. All three CC-19 gaps confirmed in code:

**1. Credential storage.** `core/prefs/PreferenceStore.kt` wraps `SharedPreferences` (`MODE_PRIVATE`) with a thread-safety layer — no encryption, no Keystore. `core/cashu/CashuWalletManager.kt:602-610` stores the wallet **mnemonic** (`KEY_MNEMONIC`) through this store. This is the actual root key controlling all wallet funds — not a minor credential, the most important secret in the app — sitting in cleartext-on-disk SharedPreferences. Confirms CC-19's "primary security gap" framing.

**2. Nostr mint backup.** `nostr/NostrMintBackup.kt` triggers from `MintManager.kt:525` (`publishMintBackup`) on every mint list change. Broadcasts to four hardcoded public relays (`relay.primal.net`, `relay.damus.io`, `nos.lol`, `nostr.mom`). Payload itself is NIP-44 encrypted with a key derived from the wallet mnemonic via domain separation — so the mint list contents are not exposed in plaintext. The real exposure is **metadata**: event timing and a derived pubkey become publicly linkable on those relays every time the mint list changes, which for a one-night pop-up could fingerprint the device/session to anyone watching those relays. Worth correcting: this is a privacy/linkability risk, not a credential leak — softer than the README's gap-in-documentation framing implied, but still real for event mode.

**3. Webhook auth.** `core/util/WebhookSettingsManager.kt` stores `WebhookEndpointConfig(url, authKey)` as a JSON blob in plain `SharedPreferences`, no encryption. Auth is a bare `authKey` string sent presumably as a static bearer token (matches numo-README's "Authorization: <bearer-key>" description) — no HMAC, no per-request signing, no timestamp/replay protection.

## Gap 1 — Credential storage

**What "good enough for one-night event/pop-up" looks like:**
Wrap `PreferenceStore`'s wallet instance with `EncryptedSharedPreferences` (Jetpack Security `androidx.security:security-crypto`, AES256-GCM, key held in Android Keystore). This is a drop-in replacement at the `ThreadSafePreferences` layer — same get/put interface, so `CashuWalletManager` doesn't need to change at all, only the backing store construction in `PreferenceStore.wallet()`. No custom key management, no biometric gating, no Keystore attestation — just the standard Jetpack wrapper.

**What franchise-grade would require, deferred:** hardware-backed StrongBox preference where available, key rotation policy, possibly biometric/PIN-gated unlock before wallet operations, audit logging of credential access, remote wipe capability for lost/stolen franchise terminals. None of this is proportionate for a borrowed handheld used for one set at one venue.

**Why this is proportionate for event mode:** the device is in Rajesh's physical custody for a single session, not left unattended in a franchise location. The threat model is "phone gets lost/stolen/compromised between events," not "rogue staff member at a fixed install." `EncryptedSharedPreferences` defeats casual disk extraction (ADB pull, backup extraction) which is the realistic event-mode threat — it doesn't need to defeat a determined attacker with physical access and time, which franchise-grade would.

## Gap 2 — Nostr mint backup broadcast

**What "good enough" looks like:** disable mint backup broadcasting entirely for event/pop-up mode. This can be solved, not deferred — it's a single boolean gate. Add an `eventMode` flag (tied to the same venue_type distinction already used elsewhere) that short-circuits the `publishMintBackup` call in `MintManager.kt:525` before it reaches `NostrMintBackup`.

**Justification for disabling rather than fixing:** mint backup exists to let a user restore their wallet later from a new device using the same seed. For a one-night pop-up terminal, the mint list is static (pre-configured to the Refueler/Minibits-compatible mint before the event) and the device returns to Rajesh's custody afterward — there's no real restore scenario this protects against in event mode. The metadata leak (pubkey + timing on public relays) has a cost and effectively zero benefit at this scope, so disabling is correct rather than under-engineering a fix.

**What franchise-grade would require, deferred:** if mint backup matters for franchise terminals (devices left at fixed venues, more plausible restore scenarios), the real fix would be relay selection (private/paid relay instead of four public ones) or NIP-65 relay list customization — not in scope here.

## Gap 3 — Webhook auth: bearer → HMAC-SHA256

**What "good enough" looks like:** implement the upgrade now rather than defer — it's the integration point with `webhook-handler.ts` and `TERMINAL-ADAPTER-SPEC.md` already specifies `terminalVendor: 'numo'` adapters must support HMAC-SHA256, and Numo's own README target state already says HMAC, not bearer. So this isn't an event-mode-only relaxation — it's just closing the gap between current Numo behavior and the adapter contract Refueler already committed to.

**Correction (post-spec, grounded against real `blink-webhook/index.ts` source):** there is no separate `webhookSecurity.ts` module — that was an assumption carried from memory notes, not confirmed against code. The actual verification logic lives inline in `blink-webhook/index.ts` as a single self-contained `verifySvixSignature()` function. There's nothing to import; the Numo-side implementation needs to replicate the same construction, not reference a shared utility.

Concretely, mirroring the confirmed `blink-webhook` implementation exactly:
- Secret format: `whsec_<base64>` — strip the `whsec_` prefix, base64-decode to raw key bytes, then `crypto.subtle.importKey('raw', keyBytes, {name:'HMAC', hash:'SHA-256'}, false, ['sign'])`. The secret is never used as a literal string key.
- Signed content: `{svix-id}.{svix-timestamp}.{rawBody}` — exact dot-joined concatenation, not a JSON envelope.
- Signature header format: `v1,<base64sig>`, space-separated if multiple values are present (covers secret rotation) — verification must check the candidate against *any* of them, not just the first.
- Timestamp tolerance: reject anything more than 300 seconds (5 min) out of sync with server time, checked *before* signature verification runs — cheap rejection of stale/replayed payloads without doing the HMAC compute.
- Comparison: timing-safe equality check (`timingSafeEqual`), not `===`, to avoid timing side-channels on the signature compare.

For the Numo adapter, `PaymentWebhookDispatcher.kt` would need to construct and send `svix-id` / `svix-timestamp` / `svix-signature` headers in this exact shape when firing `payment.received`, and `WebhookSettingsManager`'s `authKey` field becomes the `whsec_`-prefixed HMAC secret rather than a static bearer token. The Refueler-side `webhook-handler.ts` for the Numo adapter should implement the identical `verifySvixSignature` logic (same secret format, same signed-content construction, same timestamp tolerance, same timing-safe compare) so both adapters behave consistently per the adapter contract — this is the one piece of the spec that should be copied near-verbatim from `blink-webhook/index.ts` rather than reinvented.

Store `hmacSecret` itself via the same `EncryptedSharedPreferences` wrapper from Gap 1 — `WebhookSettingsManager`'s backing prefs should move off raw `SharedPreferences` at the same time, it's the same fix applied to a second call site.

**Separate from idempotency:** note `blink-webhook` handles idempotency at the DB layer (`payment_status === 'paid'` check on `merchant_orders`), entirely separate from signature verification. This is a different concern from `TerminalPaymentEvent.eventId`-based idempotency already specified for Numo in `TERMINAL-ADAPTER-SPEC.md` — don't conflate the two when building the Numo-side handler.

**What franchise-grade would require, deferred:** per-venue secret rotation schedule (though the multi-candidate signature check above already supports rotation without downtime), replay-window enforcement beyond the 300s tolerance, webhook delivery retry/backoff with signature re-verification. Not needed for a single pop-up terminal hitting one edge function once per gig.

## Integration shape (per TERMINAL-ADAPTER-SPEC.md)

No new pattern invented. The Numo adapter still exports `normalise()` and `verifyAuth()` per the existing contract; this spec only changes what's inside `verifyAuth()` (bearer-string compare → HMAC verify) and where credentials live on the terminal side before they're ever sent. `TerminalPaymentEvent.terminalVendor` stays `'numo'`; `rawPayload` audit storage is unaffected. The `eventMode` flag for Gap 2 is local to the Numo app, not part of the canonical event shape — it doesn't need to flow through to Supabase.

## Open item carried forward

NUT-14 HTLC (numo-README open question 1) is confirmed still unconfirmed upstream — not blocking any of the three gaps above, so left out of scope here per the session brief.

## Next steps

1. Update `terminals/numo/README.md`: resolve open questions 1-3 with the findings above, move the hardening table from requirement-only to event/pop-up implementation status (with franchise-grade deferred items marked explicitly).
2. When the fork session opens, Gaps 1 and 3 share one underlying change (`EncryptedSharedPreferences` wrapper) — sequence them together rather than as separate passes.
3. Gap 2 is a config flag, can land independently and early.
