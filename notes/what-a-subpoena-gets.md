# What a subpoena gets from seven file transfer services

*Published: [date] · 6 min read*

---

Most privacy policies are written by lawyers to protect the company, not you. They're long, reassuring, and structurally designed to be unread. This piece skips the policy and goes straight to the question that matters: if someone served a valid legal order to your file transfer provider tomorrow, what would they actually hand over?

Seven services. One table. No marketing copy.

---

## The table

| Service | Your content | Your identity | Metadata | Notes |
|---------|-------------|---------------|----------|-------|
| **WeTransfer** | Yes | Yes | Yes | Operator holds the keys. TLS in transit, at rest on their servers. |
| **Smash** | Yes | IPs; email if provided | Yes | Same model. Content is readable by design. |
| **SwissTransfer** | Yes | IPs | Yes | Infomaniak holds the keys. The flag is not the architecture. |
| **Wormhole** | Probably not | No account; IPs yes | Yes | PAKE-based. Closed source — claim unverifiable. US jurisdiction. |
| **Tresorit** | No | Yes — name, email, org | Yes, extensive | Client-side E2EE, genuine. Identity is a feature for their buyers. |
| **Proton Drive** | No | Yes — account + payment | Yes, incl. IPs on order | Proven: Swiss court order, 2021. Content stayed protected; metadata did not. |
| **Refueler Share** | No — encrypted noise | None exists | Sizes, timestamps, edge IPs | UK jurisdiction. No account, no identity to produce. |

The rightmost column is the honest one. Take your time with it.

---

## What "encrypted" actually means

Three of these services describe themselves as encrypted. All of them are, technically speaking, correct. The question is: encrypted with whose key?

WeTransfer, Smash, and SwissTransfer encrypt your file in transit (TLS) and at rest on their servers. They hold the keys. A valid court order, a motivated employee, or a sufficiently thorough breach can produce your file in plaintext. This is not a flaw in their implementation — it is their architecture. They built a system where they can read your files, and they did so deliberately, because useful features like link previews, virus scanning, and thumbnail generation require it.

Tresorit and Proton Drive are different. Both encrypt client-side — your device does the encryption before anything leaves it, and the key never reaches their servers. A subpoena against Proton's infrastructure yields account metadata and IP addresses (as Swiss courts demonstrated in 2021) but not file content. The architecture earns the claim.

Wormhole states a similar property via PAKE — Password Authenticated Key Exchange, where the decryption key derives from a code shared out-of-band and never transmitted to the server. The claim is architecturally sound. The problem is that Wormhole is closed source and unaudited, so you cannot verify it. The gap between "they say so" and "we can check" is where legal risk lives.

---

## The metadata problem

Client-side encryption solves one problem and leaves another standing.

Even when a provider cannot read your files, they know you have files. They know how large they are, when you uploaded them, when they were downloaded, and — increasingly, under legal pressure — who was at the keyboard when both events happened. IP address logs are metadata. Account identity is metadata. The graph of who sent what to whom, without a single readable byte of content, can be legally and journalistically significant.

Proton published a transparency report after their 2021 case. It confirmed what their architecture already implied: the content of a ProtonMail user's emails was never produced. The user's IP address was. Content protection and identity protection are not the same property, and privacy-focused providers vary considerably in which one they offer.

The honest position is to be specific about each: *this* is protected by mathematics, *that* is visible to the operator and therefore reachable by legal process.

---

## What jurisdiction actually buys you

SwissTransfer's homepage prominently features Switzerland. The implication is that Swiss privacy law protects your files. This is partially true and mostly irrelevant.

Swiss law does require a valid Swiss court order to compel disclosure — a higher bar than a US subpoena or UK production order in some respects. But if the company holds your encryption keys, jurisdiction determines the *process* for getting your files, not whether they're gettable. A sufficiently motivated court in any jurisdiction that can reach the company will eventually produce a valid order. The flag on the website describes the legal process surface, not the cryptographic one.

Architecture protects your content. Jurisdiction shapes the paperwork required to ask for it.

---

## The identity question

Most services in this table require an account to send. An account is a persistent identity anchor — every file, every access event, every IP address hangs off it and can be correlated. Even Proton, whose encryption is genuinely strong, ties your files to an account identity. A subpoena that cannot read your files can still prove you sent them.

WeTransfer's free tier accepts a sender email address. That email is logged. Smash logs the address you provide, or your IP if you don't provide one. SwissTransfer logs your IP.

Wormhole and OnionShare (not in the table above, because it's software rather than a service) require no account. Neither does Refueler Share. For services without accounts, the subpoena has no identity to request — because none was collected.

This is a design choice, not an accident. It has costs: no account means no recovery, no history, no admin console. Some buyers want those things. For buyers to whom identity linkage is the risk, the absence of an account is the feature.

---

## What a subpoena gets from Refueler Share

Encrypted ciphertext the operator cannot decrypt. File sizes and chunk counts. Upload and download timestamps. Cloudflare edge IP addresses — the IP addresses of connections to Cloudflare's network, logged at the infrastructure level. No account. No identity. No payment record for the free tier; a Lightning payment hash (pseudonymous) or a Stripe record (identified) for paid tiers.

We publish this list voluntarily because the alternative — making you guess — is the pattern that produces the surprises in other providers' terms updates.

The encryption key for every file lives in the URL fragment. Fragments are not transmitted in HTTP requests and are not logged by servers. Whoever has the link has the key. Whoever doesn't, doesn't.

If you sent a file yesterday and deleted the link, the file is still in our storage until its expiry date — but it is, practically speaking, unreadable by anyone without the fragment. Including us.

---

## The one thing this table doesn't tell you

None of these services protect against endpoint compromise. If the device you're using is already compromised, the file was readable before it was encrypted. Client-side encryption is not a substitute for device security; it's a protection against server-side failure. Every provider in this table, including us, has the same answer to that threat: we cannot help you.

OnionShare's documentation is the most honest in the industry on this point. They publish a specific list of what their software does not protect against. We're working on a similar document for Refueler Share, because our buyers — lawyers, journalists, accountants — deserve the same precision.

Until then: this table is the version we can stand behind today.

---

*Refueler Share is anonymous encrypted file transfer. No account required. Free for transfers up to 4 GB. [Try it →](https://share.refueler.io)*
