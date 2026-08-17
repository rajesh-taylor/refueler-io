# INCIDENT-PROTOCOL.md — Refueler incident response protocol
> **Version:** 1.0 | **Created:** Sim-Close · 2026-08-17
> **Lives in:** `refueler-io/docs/`
> **Scope:** All Refueler product surfaces — Share, merchant terminal, consumer app, Pass (when live), Legend (post-B9).
> **Relationship to legend-incident-protocol.md:** This document governs ecosystem-wide response. `legend-incident-protocol.md` in `refueler-io/docs/` is the Legend-specific child document covering FROST, canary operations, node seizure, and DKG procedures. Where this document and the Legend document conflict on a Legend-specific matter, the Legend document governs. Where they conflict on ecosystem-wide matters (communication channels, severity tiers, holding-statement discipline), this document governs.
> **Informed by:** SECURITY-RESEARCH-LOG.md 2026-08-12 Finding 3 (Harmony ONE incident communications). Companion documents: `MasterContext_IO_CC[N].md`, `REFUELER-BRIDGE.md`.

---

## The one rule that overrides everything else

**Never announce on the same channel your attackers and the market are watching.**

The Harmony ONE response was three sentences on X — the same platform that is the price discovery mechanism for the asset they had just inflated by 26%. The tweet that first exposed the exploit was retweeted by the official account before the situation was contained.

Refueler is not a token. But the principle applies regardless. If an incident involves our products, our merchants, or our users' privacy, the first place it must not appear is a public channel. The order is always:

1. **Internal** — Signal group. Assess before anything else.
2. **Contain** — patch, suspend, notify affected providers (Blink, Supabase, Cloudflare, per product). Notify affected merchants or users directly where required. Do this before any public statement.
3. **Public** — only once step 2 is underway and the situation is understood. Not before.

A statement that comes before containment is not communication — it is noise that helps the attacker and no one else.

---

## Operator and communications structure

**Operator:** Rajesh Taylor (sole operator, London, UK)

**Internal incident channel:** Signal. When staff are onboarded, this moves to a self-hosted SimpleX server — the channel used for internal communications shifts to SimpleX at that point. Until then, Signal is the canonical internal incident channel. Do not use Tuta, SMS, or any other channel for incident communications.

**External communications:**
- **Merchants:** Tuta Mail (`hello@refueler.io`) — direct email. No mass-broadcast tooling at v1; this is a one-to-one notification.
- **Users (Share):** Status page only. No account means no email list. The status page is the only channel.
- **Enterprise clients (Legend, post-B9):** Direct email per `legend-incident-protocol.md` SLA windows.
- **Public statement:** `refueler.io/status/` page — the canonical public incident surface. Do not post to X, LinkedIn, or any social channel until the status page has already been updated.

---

## Severity tiers

| Tier | Definition | First-action target | Examples |
|---|---|---|---|
| **SEV-1** | Active compromise of keys, credentials, or user data. Live exploit in progress or confirmed post-exploitation. | Immediate — suspend affected surface, internal Signal, then contain before anything else. | Supabase RLS bypass; Blink API key compromised; Cloudflare Worker serving malicious responses; Share encryption key exposed; merchant PIN store breach. |
| **SEV-2** | Data exposure (no active exploit). Privacy breach. Significant service degradation affecting real users or merchants. | Within 1 hour — assess, contain, notify affected parties before public statement. | `venue_partners` table publicly readable; merchant order data visible cross-venue; user payment data exposed; Share upload accessible without token. |
| **SEV-3** | Service unavailability. No data exposure confirmed. Payment rail down. | Within 4 hours — diagnose, post status page update, work toward restoration. | Blink API down; Supabase Edge Function failing; Cloudflare Pages build broken; Darwin feed stale. |
| **SEV-4** | Cosmetic or low-impact. No data, privacy, or payments concern. | Next working session — log, fix in normal flow. | CSS rendering error; status badge wrong colour; non-functional dev console widget. |

When in doubt, start one tier higher. You can always downgrade once the situation is understood. You cannot un-publish a premature statement.

---

## Product-surface containment playbooks

### Share (`refueler.io/share/`)

**Providers involved:** Cloudflare Pages (frontend), Cloudflare Worker (`worker/src/index.js`, `wrangler.toml` in `refueler-share`), Supabase (file metadata, token state)

**SEV-1/SEV-2 — containment actions:**
1. Suspend the Cloudflare Worker immediately — set a maintenance response in the Worker, or disable the route in the Cloudflare dashboard. This takes the upload and download paths offline.
2. Rotate any compromised Supabase service-role keys in the Supabase dashboard (Settings → API).
3. If a Share token or encryption key is compromised: the key lives in the URL fragment — it was never transmitted to the server. The breach is on the client side (URL leakage, browser history). Assess how the key was exposed before communicating.
4. Contact: Cloudflare support if the incident involves a Cloudflare-layer compromise. Supabase support if the incident involves database or auth.

**SEV-3 — service down:**
1. Check Cloudflare status (`cloudflarestatus.com`) and Supabase status (`status.supabase.com`) before assuming it is a Refueler-code issue.
2. Update `refueler.io/status/` immediately with the current state — even if the cause is unknown.
3. Roll back the last Worker deployment if the outage followed a deploy.

**What Share does not hold:** Share holds no plaintext file content. Chunk hashes and access tokens live in Supabase. Encryption keys live in URL fragments only. A Supabase breach exposes token state and chunk metadata, not file content.

---

### Merchant terminal (`refueler.io/merchant/`)

**Providers involved:** Supabase (auth, `merchant_orders`, `venue_partners`, `merchant_users`), Cloudflare Pages (serving), Blink (payment rail)

**SEV-1/SEV-2 — containment actions:**
1. If `merchant_users` PIN data is suspected exposed: the `staff_pin_bcrypt` and `owner_pin_bcrypt` columns store bcrypt hashes (work factor 12). Raw PINs are never stored. Containment is: notify affected merchants directly via Tuta (`hello@refueler.io`), instruct PIN reset. The `verify-pin` Edge Function can be suspended in the Supabase dashboard to block all PIN auth while the situation is assessed.
2. If `merchant_orders` or `orders` data is exposed cross-venue: the RLS policies on both tables are the first thing to audit. Check `information_schema.column_privileges` and RLS policy definitions via `execute_sql`. Suspend the affected Edge Function if an active exploit is in progress.
3. If a merchant's Lightning address is exposed: per architecture lock 4b, Lightning addresses are stored in `venue_partners.lightning_address` — they are not transient. Notify the affected merchant and advise address rotation.
4. If the Blink API key is compromised: rotate immediately via the Blink dashboard. Active key is `refueler-cc68`. Deploying a new key requires updating the Supabase Vault secret and redeploying affected Edge Functions.

**SEV-3 — payment rail down:**
1. Check Blink status. If Blink is the issue, the merchant terminal queue still functions — only new order creation (`create-order` Edge Function) is affected.
2. Update status page. Merchants are not on a notification list at v1 — direct email if a specific merchant is affected.

**Merchant data isolation reminder (hard rule — do not route around in incident response):** `merchant_orders` only. Merchant-role users never get access to `orders` directly, even during an incident investigation.

---

### Consumer app (`refueler-app`)

**Providers involved:** Supabase (auth, `orders`), Blink (invoice creation and settlement), Cloudflare (auth proxy at `refueler.io/auth/v1/`)

**SEV-1/SEV-2 — containment actions:**
1. If the Blink API key is compromised: rotate immediately (see merchant terminal section above — same key).
2. If Supabase auth is compromised: revoke affected sessions via the Supabase dashboard (Auth → Users). Magic-link tokens are single-use and expire; session JWTs expire at 43200s (12h).
3. No user financial data is held by Refueler — sats settle peer-to-peer via Lightning. A breach of the consumer app's Supabase data exposes order history and email addresses, not payment credentials.

**SEV-3 — app non-functional:**
1. The consumer app is pre-TestFlight at v1. "Users affected" at this stage means test users only.
2. Check Blink and Supabase status before assuming app-code fault.

---

### Pass (`refueler-pass`)

**Status:** Pre-build. Architecture locked in Pass-0/Pass-1. No production surface exists yet.

When Pass reaches production: extend this section with Pass-specific containment actions covering the Cashu credential store, LNURL-withdraw token lifecycle, and the NUT-29 cross-merchant unlinkability guarantee. This is a placeholder — do not fill it until Pass-A/Pass-B planning sessions are complete and the production architecture is confirmed.

---

### Legend (post-B9)

**Refer to `legend-incident-protocol.md` for all Legend-specific incident procedures** — FROST key management, canary failure modes, node seizure, DKG ceremony, AI-assisted attack response, and the warrant canary statement bank. That document is the authoritative Legend runbook.

Ecosystem-wide principles in this document (communication order, severity tiers, holding-statement discipline, Signal as internal channel) apply to Legend incidents as they do to all other surfaces. Where the Legend document specifies a more detailed or more stringent procedure for a Legend-specific scenario, the Legend document governs.

---

## Holding-statement templates

These are pre-written for the situations where a statement is needed before full diagnosis is complete. They are factual, scope-limited, and make no claims that cannot be verified. They do not promise a timeline unless one is known. They do not minimise the incident.

**Do not post a holding statement to X, social media, or any channel other than `refueler.io/status/` until containment is underway.**

### H-1 — Service unavailability (cause under investigation)

```
Refueler [product] is currently unavailable. We are investigating the cause.

The issue began at approximately [time UTC].
No [user data / merchant data / payment credentials] has been affected — [confirm or remove this line once known].

We will post an update by [time UTC].
```

### H-2 — Service unavailability (cause known, no data exposure)

```
Refueler [product] is currently unavailable due to [brief factual cause — e.g. "a Cloudflare infrastructure issue" / "a Supabase maintenance window" / "a deployment error"].

This is a service availability issue. No [user data / merchant data / payment information] is affected.

Estimated restoration: [time UTC / "we will update by [time UTC] if restoration is delayed"].
```

### H-3 — Data or privacy incident (active)

```
We have identified an issue affecting [product] that may have exposed [brief, factual scope — e.g. "merchant order metadata" / "Share token state"]. We are investigating and have suspended [affected surface] while we assess the full scope.

We will notify affected [merchants / users] directly once the scope is confirmed.

No further details are available at this time. The next update will be published by [time UTC].
```

*Note on H-3:* Do not speculate about the number of affected users or the severity of data exposed until confirmed. "May have exposed" is the correct framing until scope is known. Do not use "breach" unless confirmed — it carries regulatory implications.

### H-4 — Merchant-specific direct notification (Tuta, one-to-one)

```
Subject: Refueler — action required / service notice

[Merchant name],

[Brief factual statement of what happened and what it affects for this merchant specifically.]

[What you need to do: e.g. "Please reset your owner PIN at your next login. Your old PIN will not be accepted from [time UTC]."]

[What we have done: e.g. "We have suspended PIN authentication on your terminal while we resolve the underlying issue."]

We will follow up once the issue is fully resolved.

Rajesh
hello@refueler.io
```

---

## Post-incident procedure

After any SEV-1 or SEV-2 incident, and after any SEV-3 that affected real merchants or users:

1. **Timeline reconstruction.** Write a factual chronology of the incident — when first detected, what was done and when, when containment was achieved, when public statement was posted. Record this in `SECURITY-RESEARCH-LOG.md` under a new dated entry.
2. **Root cause.** What actually happened. Not what was suspected in the first hour — what was confirmed.
3. **What changes.** One or more concrete actions. These go into the session queue with an explicit session assignment, not into a backlog to be lost.
4. **Update this document** if the incident revealed a gap in this protocol. Increment the version number.

Post-incident notes in `SECURITY-RESEARCH-LOG.md` are the paper trail. They do not belong in `MasterContext` or `BRIDGE` unless they produce a permanent architectural change.

---

## What this document does not cover

- FROST key management, canary operations, DKG ceremonies — see `legend-incident-protocol.md`
- CDK Rust mint supply reconciliation alarms — see Session A notes (queued)
- UK IPA 2016 legal questions — see `legend-incident-protocol.md` Opus-A notes + solicitor briefing
- Stripe payment disputes or chargebacks — these are not incidents in this protocol's scope; handle via normal Stripe support channels
- GitHub repository incidents (leaked secrets in commits) — standard GitHub secret-scanning, rotate the affected credential immediately, then follow this protocol's SEV-1 flow if any live system was using it

---

## Revision schedule

Review this document:
- After any incident, regardless of severity
- At each block close where a new product surface goes live
- When staff are onboarded (internal channel section changes to SimpleX)
- When Legend reaches B9 (Pass-specific and Legend-specific sections require expansion)

### Revision log

| Version | Date | Reviewer | Change |
|---|---|---|---|
| 1.0 | 2026-08-17 | Operator | Initial document. Sim-Close deliverable. Supersedes `legend-incident-protocol.md` for ecosystem-wide matters. Informed by SECURITY-RESEARCH-LOG.md 2026-08-12 Finding 3. |

---

*"Nothing stops this train."*
