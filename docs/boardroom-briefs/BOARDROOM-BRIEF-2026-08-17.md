# Boardroom Brief — 2026-08-17

**Week 1 · Q Branch**

The room is underground, as it always is on a Monday. Someone has laid four items on the table like disassembled devices, and the table regards them the way Q regards a returned Aston Martin — with the weary certainty that something has been misused. The CTO has already read three of the four. The Head of Security read all four over the weekend, for pleasure. Nobody is impressed by any of it, which is exactly how Q Branch prefers to operate: the gadget either works or it doesn't, and admiration is for people who don't have to maintain it. "Right," says the Head of Product, sitting down. "What's leaking this week."

---

## Item 1 — Trezor email breach (~14,000 customers)

**Relevance: high, and uncomfortably close to home.**

The CPO/DPO speaks first, which is unusual, because this is her exact territory. "Note what actually leaked. Not seeds. Not funds. *Email addresses of people known to hold Bitcoin.* That is the whole payload. A hardware-wallet customer list is a phishing target list and a physical-risk list, and it didn't require breaking any cryptography to produce — it required a support vendor with a database." She lets that sit. "This is the argument I make every time someone proposes we collect something. The safest field is the one that isn't there."

The Head of Security is enjoying himself in his specific way. "It's almost always the support portal. Not the vault, not the firmware — the ticketing system, the mailing tool, the thing nobody threat-models because it's 'just email.'" He turns to the actual question Rajesh put on the table, which is the good one: *what happens if our merchant or user emails leak, and what can we do about it in the first hour.*

Here the CTO takes it, because the answer is mostly architecture and the news is she likes the answer. "An email address on its own does not open a terminal, an app, or an account. Magic links are single-use and expire. PINs are bcrypt, work factor 12, rate-limited five per five minutes. Session JWTs die at twelve hours. So a leaked address is not a key — it's a *lure*. The threat isn't 'they log in.' The threat is 'they send a merchant a convincing fake sign-in link, the merchant clicks, and the attacker rides the real session.'"

"Which means," says the Head of Product, "the mitigation is partly technical and partly a sentence we say to merchants before it happens."

The table assembles the technical half quickly, and it's mostly things already on the queue that this news *promotes*:

- **`venue_partners.active` toggle** — the kill switch. Currently a dashboard-only `[R]` operation. If a terminal is compromised, we need to disable that venue in seconds, not open the Supabase console and hunt. This is already logged for TDP-B and the Owner/Command Centre; **Trezor is the reason it stops being a nicety.**
- **Session revocation** — Supabase Auth → Users, already in INCIDENT-PROTOCOL under consumer app SEV-1/2. Confirm the operator can revoke *all* sessions for a venue fast.
- **Owner-tab PIN reset UI** — already queued, must route through a server-side bcrypt Edge Function. This news moves it up the list.

Then the CPO/DPO drops the finding the table didn't expect. "We keep telling ourselves we abandoned the email list. We didn't. **Resend sees every address.** Magic links go out over Resend SMTP — that's a sub-processor holding, and logging, every merchant and user email in transit. If Resend has a Trezor week, our 'non-existent list' leaks anyway, and it leaks with the metadata 'this address receives Refueler sign-in emails.'" General Counsel, quietly: "That's a processor we need on the Article 30 record and a retention question we need answered. What does Resend keep, and for how long."

Now the part Rajesh actually asked — *how do we help merchants who are now, by association, known to hold Bitcoin?* The CRO has sat across the table from these people at 7am in Basildon and he's protective of them. "The Trezor list tells an attacker 'this person owns crypto.' A *Refueler merchant* list would tell an attacker 'this venue takes Bitcoin and the owner may hold it on the books or personally.' That's not a phishing risk, that's a walk-into-the-café risk. We owe them inoculation."

The answer, and the CMO is already writing it in the margin: **an anti-phishing panel in the onboarding User Guide** — restrained, one panel, "How Refueler will and will never contact you." *We never send you a sign-in link you didn't ask for. Sign-in always starts from you. We contact you about incidents by direct email from hello@refueler.io and by the status page — never by SMS, never by social, never with a link that asks for your PIN.* That single panel turns every future phishing attempt into a merchant thinking *"that's not how they said they'd contact me."* The CMO: "It's the most useful copy we'll write all quarter and it has no exclamation marks in it."

On the no-newsletter/no-Twitter/no-forum point — the table sees both faces of it at once. The IR/CFO frames it: "It's a shield and a constraint in the same breath. We have **no mass list to leak** — that's genuinely a security posture, not a gap. But we also have **no fast broadcast** if we need to reach every merchant at once." The resolution is already written into INCIDENT-PROTOCOL: one-to-one Tuta (template H-4) plus the status page as the canonical public surface. The Head of Security's verdict: "For fourteen merchants, one-to-one is *correct*, not primitive. The day one-to-one stops scaling is the day we've succeeded enough to afford the problem."

**The lesson:** Third-party PII custody is the breach surface even for companies whose core cryptography is flawless. Refueler's privacy-by-minimisation already wins here — but "minimisation" has to include the *processors*, and Resend is the one hiding in plain sight.

**What not to copy:** Do not build a broadcast channel *because* of this. The absence of a list is the win. Don't solve a reach problem by manufacturing a leak surface.

---

## Item 2 — BIP461 / deterministic ECDSA low-r grinding

**Relevance: low today. One thin thread for later.**

The Bitcoin & Lightning Advisor takes this one and is careful, because the room has learned to let him be careful. "First, honesty on the citation — the *technique* is well established. Low-r grinding: DER-encoded ECDSA gives you `r` and `s` as signed big-endian integers, and when the top bit is set you pay a padding byte to keep it positive. Grind the nonce, per RFC 6979 determinism, until `r` is low, and your signatures are consistently the shorter length. Core has done a form of this for years. A BIP to *standardise* the deterministic version is sensible housekeeping — uniform signature size means deterministic fee estimation and one less fingerprinting bit. The *exact BIP number and its precise scope* I'd confirm against the PR before anyone quotes it; I don't want to be the man who put the wrong number in a notes article."

The CTO wants to know the only thing that matters here: "Do we sign raw ECDSA anywhere?"

The answer walks the stack and comes back nearly empty:

- **Consumer app** — Lightning via Blink. Blink signs. Not us.
- **refueler-mint** — Cashu blind signatures are BDHKE, not transaction ECDSA. Irrelevant.
- **Legend FROST (S-4)** — Schnorr (BIP340), fixed 64 bytes. Low-r ECDSA grinding is *meaningless* for Schnorr. As the Advisor notes: "Anything new we build signs Schnorr anyway."
- **The one thread:** the **treasury sweep node** and any **on-chain settlement tooling** (`venue_partners.onchain_address`, the SP address, a future merchant self-custodial node). *If and when* we build a component that constructs and signs on-chain transactions, uniform signature size is a small privacy-plus-fee-determinism win — one fewer way our treasury transactions stand out in a block.

The Head of Security, mildly: "Uniform tx size shaves a fingerprinting bit off the treasury. That's real but it's a rounding error against the heuristic problem — which is the *next* item's territory."

**The lesson:** Wallet hygiene, not a Refueler capability. Table-stakes for whoever builds our on-chain signing path, whenever that is.

**What not to copy:** Do not open a session for this. Do not put it in copy as a differentiator — it is the opposite of a differentiator, it's the thing every competent wallet already does. One watch-line against the treasury/settlement node plan and nothing more.

---

## Item 3 — Payjoin 1.0 stable

**Relevance: the strongest fit of the four — and it points straight at Legend.**

The Advisor sits up. "This is the one that's ours." Then, the honesty caveat: "Release specifics from the blog I can't verify — but the *shape* is clear. Payjoin has the receiver contribute an input to the sender's transaction. It breaks the common-input-ownership heuristic — chain analysis can no longer assume all inputs share an owner — and it muddies change detection. And the Rust crate reaching a stable 1.0 matters *specifically to us* because our stack is Rust-heavy: refueler-mint, refueler-multi-core, whatever tooling touches the treasury. A stable, consumable `payjoin` crate is a component we could actually pick up."

The Head of Product wants the map. Where does it touch?

- **Consumer → merchant flow: no.** That's Lightning. Payjoin is on-chain only. Don't muddle the two.
- **Treasury sweep / on-chain settlement: yes, genuinely.** When Refueler or a merchant settles or sweeps on-chain, Payjoin breaks the link between the treasury and merchant addresses. A real privacy win for the one place we do touch the chain.
- **Legend: this is the prize.** The CMO has already found the line. Legend's thesis is *independent chain verification — we verify the chain ourselves, we don't trust the endpoint* (Finding 4, the Harmony lesson). Most explorers apply common-input-ownership naively and therefore **actively mislabel Payjoin transactions** — they tell you inputs share an owner when they don't. "So the Legend claim writes itself," she says. "*The explorer that doesn't lie about your privacy.* It already handles Silent Payments correctly — Payjoin-aware is the second leg of the same stool." She's not proposing the copy in the room. She'll bring three lines tomorrow.

The Head of Security adds the guardrail: "Legend handling Payjoin *correctly* is a claim we can only make if we've actually implemented and tested it. Until then it's a roadmap item, not a homepage sentence. Same rule as always — the feature exists before the copy does."

General Counsel, one word of caution: "'Privacy' claims about an explorer are safer than 'anonymity' claims about a payment. Keep it descriptive — *we don't apply the common-input heuristic* — not promissory."

**The lesson:** Payjoin is the modern on-chain privacy toolkit alongside Silent Payments, and Legend's entire differentiation is being the explorer that *understands* modern privacy tech instead of flattening it. Log it against `legend-design-spec.md` as a v1+ feature and against the treasury/settlement node plan as a real privacy option.

**What not to copy:** Don't retrofit Payjoin onto the Lightning consumer flow — wrong layer. Don't ship the copy before the implementation.

---

## Item 4 — rbitcoin (reardencode's Rust node)

**Relevance: high watch-line — this bears directly on how Legend's node layer gets built.**

The CTO reads the description twice. Rust full node, exposing **Electrum, Esplora, and Core RPC** interfaces, not production-ready, author known in the space. "That is *exactly* the problem shape as refueler-multi-core and the Legend indexer. Multi-core is our BLAKE3-accelerated esplora-electrs fork. Legend needs an indexer that does full-block scanning for Silent Payments and runs across the PIR sharding design. A single clean Rust binary that speaks all three interfaces is either a gift or a competitor to our own fork, and I'd like to know which before we sink more sessions into maintaining electrs."

The Advisor knows the author. "Rearden is high-signal — CTV, timelock work, ships real things. The side-note that he runs Silent Payments on his own site isn't decoration: it tells you the node is being built by someone SP-sympathetic, which raises the odds it'll grow SP-aware indexing — the exact capability Legend differentiates on. Worth checking directly."

The Head of Security applies the brake, hard and brief. "'Not production ready' means it is not Legend's trust root today. And Legend is post-B9 regardless — we have time. But that's the point: we should be *watching this mature*, not committing to the electrs fork as if it's the only road. And whatever we run, Legend verifies the chain itself — we don't inherit anyone's node as gospel. That's the whole Harmony lesson."

The strategic fork-in-the-road — and the Head of Product names it precisely so it doesn't float — is this: **does refueler-multi-core keep maintaining a BLAKE3-accelerated electrs fork, or does its BLAKE3 acceleration become a contribution to / wrapper around rbitcoin?** Multi-core's niche is ARM/Pi + BLAKE3; rbitcoin wouldn't have BLAKE3, so the niche may hold. But a clean multi-interface Rust node could make fork-maintenance not worth the candle. "That is a Legend node-planning decision," he says, "not a Boardroom Brief decision. We log it and we hand it to that session with the question already sharp." Licence check is the first gate — MIT/Apache and it's a candidate; anything copyleft and the calculus changes.

The Headhunter has been silent all session, which the table now knows how to read. She speaks once. "I'm not flagging a hire. I'm flagging a *pattern*. The ecosystem is currently producing independent Rust-Bitcoin node engineers — reardencode is one, there are others in his orbit — and that is precisely the profile Legend's indexer and refueler-mint will need in about six months. The gap isn't open yet. But the people who could fill it are visible *now*, they ship in public, and they care about Silent Payments and privacy unprompted. When that role crystallises, I'd rather have been watching this cohort for two quarters than start cold. I know two of them already."

**The lesson:** Legend's node stack is not a settled build. A production-grade multi-interface Rust node would materially change the "maintain our own electrs fork" assumption. Track rbitcoin's maturity and SP support; keep multi-core's BLAKE3 niche under review against it.

**What not to copy:** Do not adopt a pre-production node as infrastructure. Do not abandon the multi-core fork on the strength of one announcement. And do not — the CTO is firm — let any external node become a trust root without our own verification on top.

---

## Action items

The Head of Product reads these back; the room confirms each one is tied to something real.

1. **Promote `venue_partners.active` kill-switch** from dashboard-only `[R]` to an operator-fast control. Named TDP-B item — flag it as **incident-critical**, not cosmetic. *(TDP-B / MasterContext terminal design section.)*
2. **Owner-tab PIN reset UI** — move up the queue; server-side bcrypt Edge Function as already scoped. *(Queued session — re-prioritise.)*
3. **CPO/DPO — audit Resend as a sub-processor:** what email data it retains, for how long, and add it to the Article 30 processing record. *(Privacy page update session + Hardening-A adjacent.)*
4. **Anti-phishing panel in `merchant-onboarding-v1.html`:** "How Refueler will and will never contact you." CMO to draft, one panel, no links-you-didn't-request. *(Next merchant-docs iteration — respects Docs↔UI sync rule.)*
5. **Confirm session-revocation runbook** for a compromised venue is executable fast; cross-check against INCIDENT-PROTOCOL merchant SEV-1/2. *(INCIDENT-PROTOCOL.md — no version bump unless a gap is found.)*
6. **BIP461 / low-r grinding:** single watch-line against the treasury/settlement on-chain-signing plan. No session. *(SECURITY-RESEARCH-LOG.md watch-line.)*
7. **Payjoin as a Legend v1+ feature:** log "correct Payjoin handling — no naive common-input-ownership heuristic" against `legend-design-spec.md`. Feature before copy. *(refueler-legend.)*
8. **Payjoin as a treasury/settlement privacy option:** log against the treasury sweep node plan; note the stable Rust `payjoin` crate as consumable. *(legend-node-plan.md / treasury node planning.)*
9. **CMO Legend copy seed** (not copy): "the explorer that doesn't lie about your privacy" — Payjoin + Silent Payments as the two legs. Three options to follow. *(CMO brief — notes-articles-list.md seed.)*
10. **rbitcoin licence + SP-support check** — first gate before any Legend node-stack reconsideration. *(Bitcoin Advisor → legend-node-plan.md.)*
11. **Frame the multi-core decision** for the Legend node-planning session: maintain the BLAKE3 electrs fork vs. contribute-to/wrap rbitcoin. Hand it over with the question sharp, don't decide it here. *(refueler-multi-core / Legend node planning.)*
12. **SECURITY-RESEARCH-LOG.md entry** for this session — Trezor processor-custody lesson; Payjoin/Legend; rbitcoin watch-line. *(See appended entry — informed by BOARDROOM-BRIEF-2026-08-17.md.)*

The Headhunter's note, for the record: **item 11 implies a capability gap** — a Rust-Bitcoin indexer engineer for Legend, roughly two quarters out. Role doesn't exist yet. The people who'd fill it are shipping in public today. She's watching the cohort.

---

*Q Branch signs off. The kill switch was always in the pen — we simply hadn't wired it to anything. This week, we wire it.*
