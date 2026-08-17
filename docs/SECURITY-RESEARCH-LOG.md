# SECURITY-RESEARCH-LOG.md — Refueler security research and incident lessons
> **Created:** 2026-08-12 · ad-hoc uncounted session
> **Lives in:** `refueler-io/docs/`
> **Purpose:** Running log of external incident analysis, security research findings, and the sessions they feed. Not a spec. Not a MasterContext substitute. The "where did that decision come from" paper trail.
> **Sync rule:** At each block close, relevant entries are pulled into MasterContext (Session A notes, Legend S-4 notes), BRIDGE, and session queue entries receive one line: *"informed by SECURITY-RESEARCH-LOG.md [date]"*

---

## 2026-08-17 — Trezor breach / Payjoin 1.0 / rbitcoin / BIP461

**Session type:** Weekly Boardroom Brief — ad-hoc uncounted. Week 1 (Q Branch lens).
**Informed by:** BOARDROOM-BRIEF-2026-08-17.md

> **Standing note on this log:**
> Entries here are dated and immutable. Making an entry out of date is a sign of
> progress. Update entries only by appending — never by editing existing text.
> Reference and update this log when a session is materially about one of its findings.
> Do not action these items outside their named sessions.

**Sources reviewed:**
- BleepingComputer — Trezor data breach (~14,000 customers, email addresses via support vendor)
- BIP461 PR (`bitcoin/bips#2224`) — deterministic ECDSA low-r grinding via RFC 6979
- payjoin.org — Payjoin 1.0 stable release announcement (2026-08-12)
- rbitcoin — Rust Bitcoin node by reardencode; GitHub `reardencode/rbitcoin`, `rbitcoin.org`

---

### Finding 1 — Trezor: the breach surface is always the sub-processor

**Mechanism:** ~14,000 customer email addresses leaked via a third-party support vendor. No seed phrases, no funds. The payload is: a list of people known to hold Bitcoin, with their contact addresses. Sufficient for targeted phishing and physical-risk profiling.

**Applicable to:** All Refueler products. Magic link email delivery (Resend SMTP). Merchant onboarding docs. INCIDENT-PROTOCOL.md.

**Lessons:**

**1a — Resend is a sub-processor holding our de facto user list.**
Magic links go out via Resend SMTP. Resend sees every merchant and user email address in transit. The "we have no email list" posture is technically true for Refueler's own storage; it is not true for Resend's logs. If Resend has a Trezor week, the leak metadata is "this address receives Refueler sign-in emails" — i.e., a list of Bitcoin-adjacent merchants and users. Action: audit Resend's data retention policy and add Resend as a sub-processor on the Article 30 processing record. Target: Privacy page update session.

**1b — An email address is a lure, not a key — but merchants need to know that.**
Refueler's auth architecture (single-use magic links, bcrypt PINs WF12, 12h JWT expiry) means a leaked email cannot directly compromise an account. The threat is social engineering: a convincing fake sign-in link. Merchants who know "Refueler will never send you a link you didn't request" are inoculated. Action: one-panel anti-phishing section in `merchant-onboarding-v1.html`. CMO to draft.

**1c — The kill switch must be fast.**
A compromised merchant terminal requires `venue_partners.active = false` in seconds. Currently a dashboard-only `[R]` operation. This is a named TDP-B item that this finding promotes to incident-critical. Action: TDP-B.

**1d — No mass broadcast channel is a security posture.**
The absence of a newsletter, forum, or social presence means there is no mass list to leak and no broadcast surface to hijack. For the current scale (testing, no live merchants), one-to-one Tuta + status page is correct, not primitive. Do not build a broadcast channel to solve a reach problem that does not yet exist.

**Target sessions:** Privacy page update (Resend Article 30), TDP-B (kill switch), next merchant-docs iteration (anti-phishing panel), INCIDENT-PROTOCOL review (session-revocation runbook verification).

---

### Finding 2 — Payjoin 1.0: Legend's second differentiator leg

**Mechanism:** Payjoin has the receiver contribute an input to the sender's transaction, breaking the common-input-ownership heuristic. A chain-analysis tool that assumes all inputs share an owner will actively mislabel Payjoin transactions. The Rust `payjoin` crate reached stable 1.0 in August 2026 — consumable in a Rust-heavy stack.

**Applicable to:** Legend (primary), treasury/on-chain settlement tooling (secondary, unscoped).

**Lessons:**

**2a — Legend must handle Payjoin correctly to be honest about its own claim.**
Silent Payments (BIP-352) is already a planned differentiator: Legend is the explorer that correctly displays SP static addresses and derived outputs. Payjoin is the second leg: Legend is the explorer that does not apply the naive common-input-ownership heuristic to Payjoin transactions. Most explorers do apply it — which means they actively lie about who owns what. Correct Payjoin handling is a v1+ feature, not a v1 claim. Feature before copy. Action: log against `legend-design-spec.md` as a v1+ item.

**2b — The copy seed is "the explorer that doesn't lie about your privacy."**
CMO spotted it. Silent Payments + Payjoin = two transaction types that existing explorers misrepresent. Legend's claim is that it does not misrepresent them. This is a factual architectural claim, not a marketing promise. CMO to produce three line options. Not in copy until the feature is implemented and tested.

**2c — Payjoin as a treasury sweep privacy option.**
The stable Rust crate is a consumable component for any future on-chain signing tooling. When the treasury sweep node is scoped (currently an architectural intention only, not yet a named session), Payjoin is in the toolkit. Log this against that planning session when it opens.

**Target sessions:** Legend node-planning (feature scope), legend-design-spec.md update (v1+ item), CMO brief (copy seeds → notes-articles-list.md), treasury sweep node planning (when scoped).

---

### Finding 3 — rbitcoin: a watch-line against the electrs fork decision

**Mechanism:** reardencode (high-signal Bitcoin contributor) is building a Rust full node exposing Electrum, Esplora, and Core RPC interfaces simultaneously. Not production-ready. Author uses Silent Payments on his own site — SP-sympathetic build.

**Applicable to:** `refueler-multi-core` (BLAKE3-accelerated electrs fork), Legend node stack.

**Lessons:**

**3a — The electrs fork assumption is worth watching, not abandoning.**
refueler-multi-core's niche is BLAKE3 + ARM. rbitcoin would not have BLAKE3 out of the box — the niche may hold. But a production-grade multi-interface Rust node could make maintaining the electrs fork not worth the candle. The question to hand to the Legend node-planning session: *maintain the BLAKE3 electrs fork vs. contribute BLAKE3 acceleration to / wrap rbitcoin?* Do not decide this at Boardroom Brief level.

**3b — Licence is the first gate.**
MIT or Apache 2.0: candidate. Copyleft: calculus changes entirely. Check before any further consideration.

**3c — SP support trajectory is the second gate.**
An SP-aware rbitcoin would be directly relevant to Legend's full-block scanning requirement. Monitor SP support progress in the repo; do not assume it will arrive on any timeline.

**3d — External node is never a Legend trust root.**
Whatever Legend runs as its indexer, Legend verifies the chain itself. No external node is inherited as gospel. This is the Harmony supply-API lesson applied to infrastructure.

**Watch-line note:** The talent cohort building Rust-Bitcoin nodes (reardencode and adjacent engineers) is the profile Legend's indexer and refueler-mint will need in approximately two quarters. Role does not exist yet. Cohort is visible now in public repos. No action — awareness only.

**Target sessions:** Legend node-planning (electrs fork decision question), rbitcoin licence + SP-support check (Bitcoin Advisor action before that session).

---

### Finding 4 — BIP461 / low-r ECDSA: watch-line only

**Mechanism:** Standardises deterministic low-r grinding of ECDSA signatures via RFC 6979. Prevents the optional null-byte padding on `r` values with MSB set, producing uniform 71-byte DER signatures. Uniform signature size aids fee determinism and removes one fingerprinting bit from on-chain transactions.

**Applicable to:** Treasury sweep / on-chain settlement tooling (unscoped). Irrelevant to Lightning (Blink signs), refueler-mint (BDHKE, not ECDSA), Legend FROST (Schnorr/BIP340, fixed 64 bytes).

**Lesson:** Table-stakes wallet hygiene for whoever builds on-chain signing. Not a Refueler differentiator — it is the thing every competent wallet already does. One watch-line against the treasury/settlement node plan. No dedicated session.

**Target sessions:** Treasury sweep node planning (when scoped) — one-line mention only.

---

## Action item summary — tied to session queue

| # | Action | Target session | Status |
|---|---|---|---|
| 1 | Audit Resend data retention; add to Article 30 processing record | Privacy page update session | Queued |
| 2 | Promote `venue_partners.active` kill-switch to incident-critical TDP-B item | TDP-B | Queued |
| 3 | Anti-phishing panel in `merchant-onboarding-v1.html` — CMO draft | Next merchant-docs iteration | Queued |
| 4 | Confirm session-revocation runbook vs INCIDENT-PROTOCOL merchant SEV-1/2 | INCIDENT-PROTOCOL review | Queued |
| 5 | Log Payjoin as Legend v1+ feature against `legend-design-spec.md` | Legend node-planning / next legend-design-spec touch | Queued |
| 6 | Log Payjoin as treasury sweep privacy option (when that session is scoped) | Treasury sweep node planning | Watch |
| 7 | CMO copy seed: "the explorer that doesn't lie about your privacy" → notes-articles-list.md | CMO brief | Queued |
| 8 | rbitcoin licence + SP-support check | Bitcoin Advisor → before Legend node-planning | Queued |
| 9 | Frame electrs fork vs rbitcoin question for Legend node-planning session | Legend node-planning | Queued |
| 10 | BIP461 watch-line against treasury/settlement on-chain signing plan | Treasury sweep node planning (when scoped) | Watch |

## 2026-08-17 — Hardening-A: Supabase-wide RLS and grant audit

**Session type:** Hardening-A — Sonnet counted (execution only; plan from Sim-Close Opus).

**Scope:** Full `information_schema` + `pg_policies` sweep across all 25 public tables prior to first real merchant go-live.

---

### Finding H-1 — merchant_users: inert write grants on credentials table

`anon` and `authenticated` held INSERT/UPDATE/DELETE/TRUNCATE/TRIGGER/REFERENCES on `merchant_users` — the stock Supabase default pattern, never explicitly revoked. Inert because RLS is enabled and no permissive write policy exists for either role. Wrong posture for a table holding bcrypt PIN hashes regardless. Revoked in full. `authenticated` retains only the column-level SELECT grants applied at CC-90 (6 safe columns, no PIN columns). Duplicate SELECT policy (`merchant_users_safe_select_own`) dropped — identical to surviving `merchant_users_self_read`.

**Confirmed safe before change:** No write path exists to `merchant_users` as `authenticated` or `anon`. Provisioning is dashboard/service_role. PIN reset routes through a dedicated Edge Function (future, per TDP-B).

---

### Finding H-2 — venue_partners: broad anon grant surface including wallet address columns

`anon` held SELECT, INSERT, UPDATE, REFERENCES on every column of `venue_partners` — including `lightning_address`, `onchain_address`, `silent_payment_address`. This is the same latent-enumeration class as the former `partners_public_read` incident (dropped at an earlier session). Today it is masked by the absence of any anon SELECT row policy; it would become a full wallet-address leak the moment any anon read policy is added. Confirmed by reading the full `information_schema.column_privileges` output — 120+ column-level grant rows for `anon`.

**Fix:** Table-level `REVOKE ALL ON venue_partners FROM anon` + `FROM authenticated`, then re-granted `SELECT, UPDATE TO authenticated` only. `anon` now holds zero grants on `venue_partners` at both table and column level. INSERT and DELETE remain `service_role` only.

---

### Finding H-3 — Deprecated telemetry tables: world-readable business data

`log_entries` (site names, coordinates, vendor names, field-research notes), `live_transactions` (merchant names, order totals), and `sessions` (site names) all carried unconditional anon SELECT policies (`qual=true`). These were pre-pivot field-research and dev-console tables. Zero live code references confirmed across all HTML, JS, and Edge Function sources before dropping.

**Fix:** All three tables dropped (`CASCADE` removed the orphaned `orders.session_id` FK). Dev console to be re-scoped around real operational metrics in a future session.

---

### Finding H-4 — SHA-256 PIN columns: dead weight on credentials table

`staff_pin_hash` and `owner_pin_hash` (legacy PBKDF2/SHA-256 columns) still present alongside live `staff_pin_bcrypt` / `owner_pin_bcrypt`. `verify-pin` v2 confirmed (GitHub source read) to reference bcrypt columns only. Both legacy columns dropped.

---

### Finding H-5 — S-26: orders→venue_partners FK confirmed missing, added

21 orders, 0 orphans. `orders_venue_id_fkey` constraint added. Dev-console relationship error resolved.

---

### Finding H-6 — subscribers table: confirmed sealed

`deny_all_anon_subscribers` RESTRICTIVE policy with `qual=false` — the abandoned email list is fully blocked to anon and authenticated. No action required.

**Migrations applied:** `hardening_a_merchant_users_grants` · `hardening_a_venue_partners_revoke_anon_addresses` (superseded by `hardening_a_venue_partners_grants_clean`) · `hardening_a_orders_venue_fk` · `hardening_a_remove_sha256_pin_columns` · `hardening_a_drop_deprecated_telemetry` · `hardening_a_venue_partners_grants_clean`

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
