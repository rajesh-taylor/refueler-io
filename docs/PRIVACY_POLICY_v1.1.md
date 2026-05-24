# REFUELER — Privacy Policy
**Version:** 1.1
**Last updated:** May 2026
**Controller:** Refueler (incorporating as Refueler Ltd, England & Wales)
**Contact:** privacy@refueler.io
**ICO registration:** Pending — this policy will not be published publicly until ICO registration is confirmed and a registration number can be displayed here.

---

> **Pre-publication note (internal):** This document is complete in substance but must not go live at refueler.io/privacy until three conditions are met: (1) ICO registration number obtained; (2) registered address confirmed at incorporation; (3) controller name updated to "Refueler Ltd" once incorporated. Remove this note block before publishing.

---

## Plain English first

We built Refueler to get your coffee ready before you arrive — not to harvest your data.
The minimum we need to run the service is the minimum we collect.
Your location never leaves your device.
Your rewards are yours from the moment they are issued.

---

## 01 · Who we are

Refueler (incorporating as Refueler Ltd, England & Wales) is the data controller for all personal data processed through the Refueler platform (refueler.io, the mobile app, and the Command Centre dashboard).

Third-party processors used:
- **Supabase** (database infrastructure and authentication) — EU region — governed by DPA
- **Cloudflare** (content delivery, DNS, Pages hosting, and Workers API layer) — governed by DPA

Both processors operate under signed Data Processing Agreements. No other third-party processors handle personal data at this time.

---

## 02 · What we process

| Data | Purpose | Stored | Shared with |
|---|---|---|---|
| Email address | Magic link authentication only | Supabase (EU) | Nobody |
| Order content (item, vendor, timestamp) | Fulfilment, vendor queue, reward calculation | Supabase (EU) | Named vendor only |
| Ecash reward amount | Issuance record | Supabase (EU) | Nobody |
| Push subscription token | Order-ready notification | Supabase (EU) | Nobody |
| Passkey credential (WebAuthn public key) | Biometric re-authentication | Supabase (EU) | Nobody |
| **Location data** | **On-device geofence only — never transmitted** | **Your device only** | **Nobody** |

We do not process: name, phone number, age, gender, payment card details, IP address, browsing behaviour beyond the order flow, or biometric data beyond the Passkey public key (which cannot reconstruct a biometric).

---

## 03 · Location architecture

The Passive Ambient Awareness feature runs entirely on-device using iOS Core Location or Android Geofence API.

**What happens:**
1. Geofence boundaries are registered locally on your phone's OS — no coordinates are sent to our servers
2. Your phone's OS detects train movement locally (velocity + location) — no data leaves the device at this step
3. A local prompt fires — e.g. *"Your flat white will be ready in 4 mins, confirm?"*
4. If you confirm, your phone sends: item + vendor ID + session token — **no location data**
5. Our Supabase `orders` table has no location column — this is an architectural guarantee, not a policy promise

> "Refueler knows your train is moving. Your phone works it out locally. We never see where you are."

**Opt-in required.** Toggle off anytime in Settings → Location. Disabling has no effect on ordering or reward earning.

---

## 04 · Legal basis (UK GDPR Article 6)

| When you do this | Legal basis |
|---|---|
| Place an order | Art. 6(1)(b) — performance of contract |
| Sign in via magic link | Art. 6(1)(b) — performance of contract |
| Earn a reward | Art. 6(1)(b) — performance of contract |
| Allow push notifications | Art. 6(1)(a) — consent |
| Enable train geofence | Art. 6(1)(a) — explicit consent, withdrawable anytime |
| Register a Passkey | Art. 6(1)(a) — consent |
| Security / fraud prevention | Art. 6(1)(f) — legitimate interests |
| Newsletter (opt-in only) | Art. 6(1)(a) — consent |

---

## 05 · Data retention

| Data | Retention period | Reason |
|---|---|---|
| Order records | 13 months from order date | Dispute resolution window |
| Email address | Duration of account | Authentication |
| Push subscription token | Until withdrawn or 90 days inactive | Notification delivery |
| Ecash reward records | 6 years | HMRC financial compliance |
| Passkey public key | Duration of account | Authentication |

Auto-purge is automated for expired categories. You will not need to request it.

---

## 06 · Authentication & session security

- **Magic link** — passwordless, single-use, expires after 10 minutes
- **Passkey (WebAuthn)** — biometric re-authentication for returning users; public key only stored; private key never leaves your device
- **Sessions** — short-lived JWT (1 hour); stored in memory only, never localStorage or persistent cookies
- **Sensitive actions** (linking a new wallet, account deletion) — require a fresh magic link confirmation regardless of active session
- **AES-256 encryption at rest** — all data in Supabase encrypted at rest; in transit via TLS 1.3

---

## 07 · Bitcoin, ecash & rewards

Refueler issues rewards as **ecash tokens denominated in sats**, via the Cashu protocol (Minibits wallet). These tokens are bearer instruments — they live on your device, not on our servers.

- We record: reward amount in sats, timestamp, and vendor per transaction (financial record only)
- We do **not** record: Lightning address, Minibits wallet ID, node pubkey, or on-chain address after payment is sent
- Lightning addresses are held in transient memory for the duration of the payment push only — they are never written to our database
- The Cashu ecash balance lives on your device. When you redeem tokens, they settle as sats on the Lightning Network
- **You own your rewards from the moment they are issued.** We cannot freeze, reverse, or access them.

---

## 08 · Cookies

We use one strictly necessary cookie:
- **Supabase session token** — short-lived JWT, expires on tab close or within 1 hour

No advertising cookies. No analytics cookies. No third-party cookies.
No cookie banner needed — nothing here requires separate consent beyond what you agreed to in the terms of service.

> Verify this yourself: browser dev tools → Application → Cookies. One token. Nothing else.

---

## 09 · Newsletter

We send a weekly or fortnightly newsletter — Bitcoin news, platform updates, event announcements.
**Opt-in only.** Separate consent from account creation.
Unsubscribe at any time via the footer link in any newsletter or by emailing privacy@refueler.io.

We do not sell your email address to third-party marketing companies.

---

## 10 · Your rights (UK GDPR Articles 15–22)

| Right | What it means | How to exercise |
|---|---|---|
| Access (Art. 15) | Copy of all data we hold on you | Email privacy@refueler.io |
| Rectification (Art. 16) | Correct inaccurate data | Email privacy@refueler.io |
| Erasure (Art. 17) | Delete your account and data (subject to 6-year reward retention for HMRC) | Settings → Delete account |
| Restriction (Art. 18) | Pause processing during a dispute | Email privacy@refueler.io |
| Portability (Art. 20) | JSON export of orders and reward history | Settings → Privacy & data → Export |
| Object (Art. 21) | Object to legitimate interest processing | Email privacy@refueler.io |
| Automated decisions (Art. 22) | No automated decisions with significant effects on you | N/A — human confirms all orders |
| Withdraw consent | Geofence, push notifications, newsletter | Settings or email |

We will acknowledge your request within 24 hours and respond in full within 30 days.

If you believe we have handled your data unlawfully, you have the right to lodge a complaint with the Information Commissioner's Office: **ico.org.uk**
We would always prefer to hear from you first — email privacy@refueler.io and we will do our best to put it right.

---

## 11 · Changes to this policy

We will notify you of any material changes by email before they take effect.
Version history is maintained in a private Git repository.
The current version is always available at: refueler.io/privacy

Material changes include: new categories of data collected, new processors, new legal bases, or changes to retention periods.
Minor corrections (wording, address updates) increment the minor version number only.

**Versioning:** MAJOR.MINOR — e.g. 1.0 (launch) → 1.1 (minor correction) → 2.0 (material change)

---

## 12 · Contact

**Email:** privacy@refueler.io
**Post:** [Registered address — to be confirmed at incorporation]
**ICO registration:** [To be added prior to publication]

---

*Version 1.1 · May 2026 · Refueler (incorporating as Refueler Ltd, England & Wales)*
