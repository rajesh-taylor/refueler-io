# SECURITY-RESEARCH-LOG.md — Refueler security research and incident lessons
> **Created:** 2026-08-12 · ad-hoc uncounted session
> **Lives in:** `refueler-io/docs/`
> **Purpose:** Running log of external incident analysis, security research findings, and the sessions they feed. Not a spec. Not a MasterContext substitute. The "where did that decision come from" paper trail.
> **Sync rule:** At each block close, relevant entries are pulled into MasterContext (Session A notes, Legend S-4 notes), BRIDGE, and session queue entries receive one line: *"informed by SECURITY-RESEARCH-LOG.md [date]"*

---

## 2026-08-12 — Harmony ONE exploit (2026) + CipherStash/Supabase + Ordercli

**Session type:** Ad-hoc research — uncounted. C-suite simulation format (CTO, CSO, Senior Mint/Lightning engineer, Privacy Officer, Marketing Officer, Revenue Officer).

**Sources reviewed:**
- Binance Square post — Harmony ONE August 2026 exploit summary
- Harmony @harmonyprotocol tweet (5:26 AM, 12 Aug 2026) — official response
- Juiceberg @the_juice_berg — on-chain discovery tweet
- Supabase blog — "Searchable field-level encryption on Supabase with CipherStash" (9 Jul 2026)
- Hacker News thread #48920328 — CipherStash founder (dandraper) + principal engineer (cipherjim) long-form responses
- Ordercli skill.md — MCPMarket listing for Foodora CLI order manager

---

### Finding 1 — Harmony ONE 2022 bridge hack (Lazarus Group / multisig threshold)

**Mechanism:** 2-of-5 multisig on Horizon Bridge. Lazarus Group compromised the Key Management Service, obtained 2 private keys, drained $100M.

**Applicable to:** Legend S-4 (FROST enterprise multi-sig spec)

**Lesson:** Threshold *and* share custody geography are the whole game. A 2-of-5 scheme where all keys sit behind one KMS is a 1-of-1 scheme in practice. FROST shares for Legend Enterprise must span different providers and jurisdictions — the same "two providers, two jurisdictions" principle already in the PIR sharding design. No single-KMS quorum. Ever.

**Target session:** Legend S-4 (dedicated Opus). Log this as the motivating case study.

---

### Finding 2 — Harmony ONE 2026 empty-block mint (replay + signature check failure)

**Mechanism:** Attacker forged cross-shard receipt proofs with blank signatures. Validator checked `committee_size >= 4` rather than `signatures_present >= threshold` — blank signatures passed. Replay protection relied on attacker-controllable fields in old epochs, so the same forged receipt could be reused indefinitely. Result: ~3 trillion ONE tokens minted across 6 abnormal blocks. Harmony's own `totalSupply` API endpoint failed to reflect the minting because the exploit occurred below the layer the API trusted.

**Applicable to:** `refueler-mint` (CDK Rust mint, stamp issuance), `ecash-lab`

**Lessons:**

**2a — NUT-07 replay hardening is explicit, not implied.**
NUT-07 (Cashu state check / double-spend prevention) is our replay protection. It must be verified on *every* redemption path, including retry flows on network timeout. A client that retries after a timeout must not be able to spend a token twice if the server already processed the first attempt. The Harmony replay exploited exactly this class of untested edge case. Test this path explicitly in Session A.

**2b — Independent supply reconciliation reads from issuance log directly.**
Total tokens issued vs total float debited must be computed by something that is not the mint's own summary or API endpoint. Harmony's API was blind to the exploit because both the minting and the reporting shared the same compromised layer. The reconciliation job must read directly from the mint's raw issuance log. Alarm on discrepancy to `dev@refueler.io` — same alerting rail as the low-water float alert (ADR-MS-18).

**2c — Blast radius is already bounded by design.**
Stamps are closed-loop goods/services only, no ecash→sats path (lock 4p). Float is Refueler's own sats revenue, manually topped up. Worst case of a Harmony-style over-issuance bug: someone claims stamps they didn't earn and gets a free coffee. No customer funds sit in the mint. This is a margin leak, not a solvency event. The design decision that made this true (lock 4p) was correct and should be cited as such in Session A.

**2d — Keyset-per-franchise is a security property, not just a billing tier.**
Each franchise on its own keyset means compromise of one keyset cannot forge another franchise's stamps. Harmony had one failure domain for the whole chain. Refueler can offer one per franchise. This reframes "Refueler Mint as a Service" from a revenue line into a compartmentalisation guarantee — and makes it a legitimate pitch point in partner-facing materials.

**Target sessions:** Session A (CDK mint architecture — NUT-07 hardening, reconciliation job, blast radius framing), partner-facing materials session.

---

### Finding 3 — Harmony incident communications (what not to do)

**Observation:** Harmony's official response was three sentences posted to X (Twitter) — the same platform that is the price discovery mechanism for the token they had just inflated by 26%. The Juiceberg tweet that first exposed the exploit was *retweeted* by the official account before the situation was contained. 134 likes, 55 replies, -38% price.

**Applicable to:** All Refueler products — incident protocol

**Lesson:** Never announce on the same channel your attackers and the market are watching. The incident response order is: (1) internal Signal/SimpleX, (2) contain/patch/contact affected parties (Blink, Supabase, Cloudflare as appropriate per product), (3) public statement only after (2) is underway.

**Action:** Extend `legend-incident-protocol.md` (already exists in `refueler-legend`) to a single `INCIDENT-PROTOCOL.md` in `refueler-io/docs/` covering all product surfaces. Include: notification chain, approved channels, holding statement template, product-specific containment actions. Produce in Sim-Close Opus session — not a dedicated session, bundle it.

**Target session:** Sim-Close Opus (bundle).

---

### Finding 4 — Legend differentiator: independent chain verification

**Observation:** Harmony's `totalSupply` API lied because it trusted the node's self-report. Legend does full-block scanning (required for Silent Payments). An explorer that computes chain state independently — rather than parroting node RPC — would have caught an inflation event the native API missed.

**Applicable to:** Legend — editorial/marketing, notes article seed

**Lesson / copy seed:** "We verify the chain ourselves. We don't trust the endpoint." This is a real technical differentiator and it is exactly Bitcoin's founding premise — supply is auditable because independent nodes verify issuance. A notes article on this, tied (without naming Harmony by name at launch) to the general class of "API reported X, chain said Y" incidents, reinforces Legend's positioning.

**Target:** Notes article seed — log in `notes-articles-list.md` at next Share session. Marketing: restrained, un-gloating, factual.

---

### Finding 5 — CipherStash: legitimate tool, wrong problem for most of Refueler

**Verdict:** Not snake oil. Legitimate searchable encryption (AES-GCM-SIV for equality, ORE/Lewi-Wu 2016 for range, encrypted bloom filters for text). Two-party key derivation via ZeroKMS — CipherStash cannot decrypt your data. Per-value audit trail of decryptions. Edge worker / Supabase Edge Function decryption path available (plaintext never touches app server).

**Why it doesn't apply ecosystem-wide:** We hold almost no sensitive PII. Lightning addresses are transient (lock 4b). Email list abandoned (privacy attack vector). `venue_partners` is near-public business data. `merchant_billing` holds a Stripe token, not card data. PINs want hashing (argon2/bcrypt), not searchable encryption. Privacy-by-minimisation beats field-level encryption — the safest field is the one that isn't there. Adding CipherStash ecosystem-wide would add a third-party dependency to our trust chain on data that either isn't sensitive or should be hashed. That cuts against our own positioning.

**The one narrow exception — Legend Enterprise v2+:**
If a family-office or HNW client wants server-persisted saved watchlists / estate snapshots where even Refueler staff cannot read the contents, the edge-worker decryption path (plaintext derived at Cloudflare Worker / Supabase Edge Function, never on app server) is architecturally similar to what Share already does. The "trusting a third-party KMS" objection is weaker here because decryption happens at the edge, not in a server process. The audit trail (table/column/row-id + user identity + timestamp, joinable for forensic investigation) directly answers the compliance question: "Can you prove nobody at Refueler read my estate data?" with evidence rather than a promise.

**Immediate action item:** Confirm PINs in `merchant_users` are hashed (argon2/bcrypt), not stored plaintext. Check in next session that opens `merchant_users`. Two-minute query, non-negotiable.

**Target sessions:** PIN check — next `merchant_users` session (CC-84 or earlier). CipherStash — watch-line only against Legend Enterprise v2+ spec. Not before B9. Not ecosystem-wide.

---

### Finding 6 — Ordercli: architecture to note, auth gymnastics to ignore

**Source:** MCPMarket skill.md listing. Not installed — correct decision for a privacy company.

**What's worth taking:**

**6a — Noun/verb/handle taxonomy for the NumoPay API contract.**
Ordercli reduces to two nouns (`order`, `history`) and four verbs (`list`, `show`, `watch`, `reorder`) with the order code as the universal handle. Apply this structure when defining the consumer app → merchant terminal → NumoPay API contract in NumoPay-A. Validates the CC-84 decision to make the order identifier the join key across the full flow.

**6b — Preview → confirm → act on every payment mutation.**
"Confirm before any reorder or cart-changing action." Verify this discipline exists on the consumer app's pre-order flow — no one-tap money out the door.

**6c — "The usual" reorder.**
One-tap reorder of last/habitual order, timed to the train. A commuter on the 07:42 who has ordered the same flat white every working day for nine years is exactly the user Refueler is built for. Ordercli handed us the interaction model. Log against consumer app backlog for post-Block 5 scoping — not to build now.

**What to ignore:** All of Ordercli's auth complexity (browser login, Chrome cookie import, Cloudflare bot-bypass, session refresh). That entire codebase exists because Foodora has no API and doesn't want Ordercli there. We own our rails end to end. Copying any of that would be solving a problem we're privileged not to have.

**Contrast line (marketing):** Delivery apps track the driver. We track the train. The horizon strip is a sales asset — feature it in partner-facing materials.

**Target sessions:** NumoPay-A (API contract taxonomy), consumer app backlog (reorder feature), partner-facing materials session (horizon strip positioning).

---

## Action item summary — tied to session queue

| # | Action | Target session | Status |
|---|---|---|---|
| 1 | Session A: NUT-07 replay hardening — test retry/timeout paths explicitly | Session A (CDK mint) | Queued |
| 2 | Session A: supply reconciliation reads issuance log directly, not API/summary | Session A (CDK mint) | Queued |
| 3 | Session A: document blast-radius bound (lock 4p) as a design rationale | Session A (CDK mint) | Queued |
| 4 | Session A / partner materials: reframe keyset-per-franchise as compartmentalisation guarantee | Session A + partner materials | Queued |
| 5 | Legend S-4: FROST shares must span providers/jurisdictions — no single-KMS quorum | Legend S-4 (Opus) | Queued |
| 6 | Sim-Close: produce ecosystem-wide `INCIDENT-PROTOCOL.md` from `legend-incident-protocol.md` base | Sim-Close Opus | Queued |
| 7 | Notes article seed: independent chain verification vs API self-report | Next Share session → notes-articles-list.md | Queued |
| 8 | CC-84 or next `merchant_users` session: confirm PINs are hashed, not plaintext | CC-84 (earliest opportunity) | **Immediate** |
| 9 | Legend Enterprise v2+ watch-line: CipherStash edge-worker path for persisted client data with audit trail | Legend S-4 adjacent | Watch |
| 10 | NumoPay-A: apply noun/verb/handle taxonomy to API contract design | NumoPay-A (Opus) | Queued |
| 11 | Consumer app backlog: "the usual" habitual reorder feature | Post-Block 5 scoping | Backlog |
| 12 | Partner materials: horizon strip as arrival-intelligence differentiator vs delivery apps | Partner materials session | Queued |

---

*"Nothing stops this train."*
