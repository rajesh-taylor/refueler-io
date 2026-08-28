# Silent Inbox, Nutroot & the Standing Channel — Locked Strategy Decisions
> **Session type:** Architecture & product strategy (no code, no build sequencing)
> **Date:** 27 August 2026 · London
> **Inputs (authoritative):** REFUELER-BRIDGE.md v5.1 · Share-Master-Context.md v5.4 · CLAUDE.md v1.6 · share-sessions.md
> **Scope rule honoured:** Every decision in the input files is treated as locked unless a section below explicitly supersedes it with a stated reason. Session sequencing and code outlines are deliberately left to the Opus-2 session.

This document is the locked decision record from the 27 Aug ad-hoc material. Hand it to Opus-2 and the build sessions.

---

## 1. Silent Inbox and the two-axis category definition

**Decision. Silent Inbox is *not* promoted to a co-equal third axis. The two-axis category definition (recipient problem + compulsion problem) stays intact, canonical, and unchanged. The new gap is real and worth naming internally — but as *the correlation problem*, not *the discovery problem* — and it is framed externally as the two axes carried into a standing inbound channel: the sharpest, most legible expression of the existing category, never a new pillar.**

Reasoning.

The test for a genuine third axis is threefold: is it independent of the other two, is it a dimension along which competitors independently fail, and does Share solve it. The proposed gap passes all three — but "the discovery problem" as posed captures only half of it. Publishing a receive-address without publishing identity is the *directionality* half. The harder, more valuable half is *open-set unlinkability*: many senders, none linkable to each other, to the recipient, or across their own repeat uploads. That property does **not** fall out of the compulsion axis for free — a naïve inbox could satisfy "nothing to hand over per transfer" while still correlating senders via a recipient account, a logged IP, or a reused credential. The spec's own line — "No sender names. No file names. No sender IP. Nothing that links two transfers to the same sender" — is a *deliberately additional* guarantee. So the full dimension is:

> **The correlation problem:** can a recipient maintain a permanent, publicly-shareable way to receive files from an open and unknown set of senders, such that the recipient's identity is never bound to the address, senders need no account and reveal nothing, and no two transfers — same sender or different — can be linked to each other or to the recipient?

Every existing "receive files" mechanism fails a clause: email (recipient identity *is* the address; senders attached; fully linkable); WeTransfer/Dropbox file-request portals (recipient account = identity; provider sees all; senders linkable); SecureDrop (solves it, but demands Tor and institutional sophistication on *both* sides — which violates our own "only one side needs to be sophisticated" positioning).

Why not a third axis, then, despite passing the test? Two reasons, and they are decisive:

1. **The twoness is the rhetoric.** "The only architecture that solves both of these at once" is memorable *because* it is two. A three-axis claim slides toward a feature list — precisely the failure mode the OEM positioning paragraph is written to avoid ("I'd rather have that conversation than hand you a feature list").
2. **The category is defined by the base product; Silent Inbox is a tier feature.** The two axes describe what every transfer *is*, free tier included. Elevating a paid, Lightning-only Production Max feature to a category-defining pillar mismatches the level of abstraction. Categories are defined by architecture, not by premium add-ons.

The founder's own instinct already points here: the journalist inbox is logged as "the cleanest public articulation of the two-axis category definition applied to a real workflow." That is the correct read. Silent Inbox does not add a third thing; it is the *proof* that makes the existing two things visceral — async delivery (sources drop files anytime; the journalist collects later) plus nothing to hand over (subpoena the inbox and there is no sender list, no correlation, no identities).

**Unresolved / for later.** Whether the correlation property eventually earns a *named* third axis *specifically within the journalist/source-protection segment* — where it genuinely is the whole point — even while the general category definition stays two-axis. Answer this once there is a real journalist user (article 7, post-Susie intro), not before.

---

## 2. What Production Max becomes; tier name; the Creative/Max boundary; the Lightning-only fork

**Decision. Production Max is upgraded from a *quantity* tier to a *capability* tier — its defining feature becomes Silent Inbox (a standing private inbound channel), not merely 250 GB / 90 days. The Creative/Max boundary is now in a *better* place because it is qualitative (send-focused vs. standing-receive), not merely "more GB." The tier *name* mismatch is flagged but **not** resolved this session — no Stripe objects are touched. The tier architecture *does* change, in a principled direction: adopt the two-dimensional model — Tier sets capacity, Rail sets the privacy/feature profile — and lock the rule that any feature requiring the no-identity property is Lightning-only by architectural necessity.**

Reasoning.

*Production Max as a capability tier.* Today the Creative→Max step is essentially "pay more for more" — bigger cap, longer expiry, plus light API. That is a weak boundary. Silent Inbox gives Max a *reason to exist beyond volume*: a persistent, identity-free presence on the network. Creative Premium becomes "send big files privately, receive occasionally"; Production Max becomes "run a standing private receiving operation." The line is now real.

*The name.* "Production Max" and "Creative Premium" are creative-segment names (film, ProRes, R3D — deliberately so, per the B13 notes). But the flagship feature — a permanent private inbox — is squarely a *professional/journalist* feature, and the locked market sequencing is legal/professional **first**, creatives second. So the killer feature points at priority-one buyers while the tier name points at priority-two buyers. This tension pre-existed Silent Inbox; Silent Inbox sharpens it. It is nonetheless **not** a decision to force now:

- Renaming is not free — Stripe products, price lookup keys (`share-max-monthly` et al.), upgrade copy, dashboard, context files.
- The names are generic enough to survive: "Production Max" can mean maximum production capability for a law firm as readily as a studio. Not optimal; not wrong.
- The correct decision point is the **paid-tier re-enable gate** (B7 close, when the Creative/Max cards are un-greyed) or **B13 go-to-market**, when names must be finalised for launch and there is real user signal. Lean: keep the names unless launch positioning demands otherwise. **Do not touch Stripe objects in the interim.**

*The Lightning-only fork — the substantive part.* The 27 Aug lock makes a tier's contents depend on the payment rail: a Stripe Production Max and a Lightning Production Max are different products at the same price. This is coherent, and in fact elegant, for a precise reason: Silent Inbox's promise is "no identity attached to the inbox." A Stripe account carries name, email, card — Refueler *could*, under compulsion, link an inbox to a person. A Lightning-paid tier carries none, so the inbox genuinely has nothing linking it to anyone. Silent Inbox on the Stripe rail cannot make its promise; withholding it there is **architectural honesty, not a commercial upsell**. That is exactly the "structural, not a line in a privacy policy" standard the whole product rests on.

Lock the model that this implies, because it generalises cleanly:

> **Tier = capacity (Free → Creative → Max → Business → Enterprise). Rail = privacy/feature profile (Stripe carries identity → refunds + recovery; Lightning carries none → identity-free features).** Every future privacy feature is classified once: does it require the no-identity property? Yes → Lightning-only. No → both rails. Silent Inbox is the first Lightning-only feature under this rule.

Two consequences to carry forward:

- **The fork segments the market correctly rather than damaging the Stripe path.** The institutional professional (law firm buying on a company card, needs VAT invoice, refunds, account recovery) generally does *not* want a no-recovery pseudonymous inbox anyway. The individual privacy-critical professional / journalist *does*, and accepts Lightning + no recovery. The fork maps onto two genuine sub-segments — a feature, not a bug.
- **The Lightning-side recovery cliff is real and needs an honest answer before ship.** No account means no recovery for a lost inbox ID / lost dashboard access. This is a design item (likely: the inbox ID + a local secret is the sole credential; losing it loses the inbox; state it plainly). Not a blocker; must not be discovered late.

**Unresolved / for later.** (a) Final tier naming — decide at paid-tier re-enable or B13. (b) The Lightning recovery-cliff UX — a design item for the Silent Inbox block, not this session.

---

## 3. Does Silent Inbox belong in B7? What is the minimum B7 must deliver?

**Decision. Silent Inbox does *not* belong in B7. It gets its own dedicated block/series, not smuggled into B8 (NUT-11 Mode 2) or B9 (node/whitepaper). B7's job is to make Silent Inbox *buildable later*, and the minimum it must deliver is: a working Lightning credential path that issues a tier-bearing Cashu credential on settlement with zero identity artefacts (no email, no Supabase row, no payment↔anything correlation), plus a tier model framed as capacity × rail rather than as identical Stripe/Lightning bundles. Exact session-level placement of the Silent Inbox block is Opus-2's call.**

Reasoning.

B7 is already 25 core + 5 buffer. Silent Inbox is architecturally heavy — opaque inbox IDs, byte counters, pause/rotation, R2 lifecycle per key prefix, a full holder dashboard, *and* the BOLT12-inspired blinded-relay primitive (secp256k1 blinded paths, genuinely novel crypto). Cramming it into B7 would violate the founder's own governing discipline: "split early, never overload," "no architecturally complex work bundled into single sessions," "context drift from long sessions is a known risk." It earns its own block.

Not B8, not B9, for symmetrical reasons: B8 (NUT-11 Mode 2) is a different concern and bundling overloads it; B9 (node + LNbits + whitepaper + staging + incident response) is already vast, and — per §4 below — Silent Inbox does **not** need the node. Making a flagship product differentiator wait for B9 delays it for no architectural reason. Treat it as a product block in its own right; because it is a flagship *feature*, it deserves a block designation, not an infrastructure footnote.

The minimum B7 must deliver, stated as prerequisites Silent Inbox will inherit:

1. **A no-identity Lightning credential path.** Credential to KV keyed by payment hash, **no Supabase row, no email** — already in the B7 plan (S75/S75a). This invariant is now load-bearing for Silent Inbox: lock it so no one later "helpfully" adds a Lightning email field. If Silent Inbox's promise is to hold, the Lightning path must never create an identity record.
2. **Clean tier resolution on settlement.** The path must resolve `{tier, period}` and make "is this a Max credential?" legible — Silent Inbox reads this to grant the full inbox (Max) vs. the lighter version (Creative). Already in the B7 plan (S75).
3. **Tier model expressed as capacity × rail, not as identical bundles.** B7 does not build Silent Inbox, but the payment-privacy table (S79) and the tier re-enable (S82) must present Stripe and Lightning as carrying *different feature profiles*, not the same bundle. Small framing change; prevents a baked-in "both rails are identical" assumption that Silent Inbox would then have to unpick.
4. **Modular credential issuance with a legible KV entitlement.** So a later block can mint an opaque inbox ID against a settled Max/Creative credential without refactoring B7's issuance code.

Explicitly **out of B7 scope:** the BOLT12-inspired blinded relay. That is part of the Silent Inbox block itself and must not leak into B7. Stated here so it does not.

---

## 4. Sequencing between Silent Inbox and the B9 node

**Decision. Silent Inbox ships *before* B9. The B9 Hetzner node unlocks nothing architecturally necessary for it. This is the direct payoff of the Option A decision (blinded relay over HTTPS, no Lightning node). The pre-B9 privacy claim must be honestly scoped — application/credential-layer unlinkability is structural; network-layer anonymity depends on a sender-side VPN. Option B (real BOLT12 over the node) remains a documented future option, not a migration commitment. The Silent Inbox block must include a dedicated review of the blinded-relay crypto, and the strength of any public claim is gated on that review.**

Reasoning.

The node handles Lightning *payment signalling* only — "file bytes travel Cloudflare edge; only Lightning payment signals touch the node." Silent Inbox needs none of the node's outputs:

- Buying the tier → Blink (B7 backend), not the node.
- The blinded static offer / inbox address → Option A: CF Worker + secp256k1 over HTTPS. No node.
- Storage / TTL / byte counter / pause / rotation → R2 + KV. No node.
- Holder dashboard → CF Pages/Worker. No node.

So the node and Silent Inbox are orthogonal. Silent Inbox can be built the moment B7's Lightning credential path is live — subject to one hard ordering constraint from outside this question: the **CRITICAL R-series (resumable uploads) must not be leapfrogged.** It is the single biggest reliability gap before alpha and was triggered by a real client-delivery failure (1.51 GB folder stalling at 80%). Shipping a flagship inbox on top of an upload path that drops large transfers would be self-defeating. Silent Inbox slots *after* R-series; the precise position relative to SW/HQ is Opus-2's.

Two honesty flags that must travel with the feature:

- **Scope the claim.** Option A borrows the *cryptography* (blinded paths, offer→credential unlinkability) but runs it over HTTPS on Cloudflare's edge. Application-layer unlinkability is real; the sender's network metadata (IP → Cloudflare) is not hidden unless they use a VPN. The honest public claim is therefore: *"we cannot link senders to each other or to you at the credential layer; for network-layer anonymity, use a VPN"* — the Mullvad recommendation, cross-referenced to §Threat model. This is the same discipline as "pseudonymous is not unlinkable." Do not claim network-layer anonymity Option A does not provide.
- **Review the crypto before the claim.** Rolling a blinded-path implementation — even one borrowing BOLT12's design — is exactly the kind of thing that must be reviewed before it carries a *source-protection* promise, where a flaw can de-anonymise a real person with real consequences. Gate the strength of the public claim on this review passing, precisely as "audit-certified" is gated on the B9 whitepaper + audit. The claim-gating discipline applies here with more weight, not less.

Option B (real BOLT12 zero-amount invoices over the node) was already assessed as "architecturally cleaner but gated on node provisioning and introduces user-facing complexity not justified for Share's professional audience." Affirmed: Option A ships pre-B9; Option B lives in the whitepaper §Future work as a possibility, **not** a planned migration. Do not create a migration obligation.

---

## 5. Nutroot supersedes NUT-29 in the whitepaper §Future work

**Decision. Replace every NUT-29 reference in the B9 whitepaper §Future work with NUT-10 v3 Nutroot secrets as the stated direction. Nutroot subsumes NUT-29's intended use (spending conditions: time-locks, payment-conditioned release, threshold co-signing) with a cleaner Taproot-style design that is key-path private by default. §Future work is restructured around a single thesis — "the policy is the credential" — with FROST, the recovery window, and Silent Inbox advanced policies as instances. Nutroot is presented honestly as an *unmerged draft* we intend to adopt, with a bespoke fallback; NUT-00 v3 (BLS batch verification) stays a separate B10+ scaling note.**

Reasoning.

NUT-29 was going to carry the spending-condition machinery in the whitepaper — time-locked credentials (validity windows) and payment-conditioned release (a BOLT11 payment hash as the unlock). Nutroot's three leaf types cover the same ground more cleanly: `after(timestamp)` is the timelock; `hashlock(preimage_hash)` is the payment-conditioned release; `threshold(k, [pubkeys])` is the co-signing primitive — all inside a Merkle tree where key-path spends are indistinguishable from ordinary presentation and script-path spends reveal only the satisfied leaf. That last property matters for a privacy product: the policy tree is not exposed by using it.

The correct §Future work structure:

1. **FROST chain-of-custody (B12), built on Nutroot `threshold` leaves** — not a bespoke bolt-on. This is the HIGH-priority assessment: FROST co-signing gets an interoperable Cashu-native foundation. Law-firm partner sign-off, music-masters delivery, VFX chain-of-custody all sit here.
2. **Recovery window via Nutroot `after` + `hashlock`** — a validity window plus a payment-preimage unlock. **The AP-7 publication restriction stands unchanged: §Future-work mention only, no product copy, no marketing, before it ships.**
3. **Silent Inbox advanced inbound policies via Nutroot conditions** — e.g. an inbox that only accepts uploads after a time (`after`), or whose upload credential needs a two-editor threshold (`threshold`). This is where Silent Inbox and Nutroot meet as a roadmap direction; basic Silent Inbox needs neither.
4. **Unifying thesis: "the policy is the credential."** Access and custody conditions expressed cryptographically rather than enforced by a server that could be compelled. This is simply the *compulsion axis followed to its conclusion* — there is nothing server-side to compel because the policy lives in the credential. Carry the Pass framing into the Share whitepaper; it is a cross-product thesis.

Two honesty constraints:

- **Nutroot (NUT-10 v3) is a draft PR, not merged** (author robwoodgate, reviewer calle). §Future work must present it as *intended direction, contingent on maturation*, with a bespoke fallback if it does not merge — never as a shipped dependency. Whitepapers age badly when they lean on unmerged upstream as if settled.
- **NUT-00 v3 (BLS12-381 batch verification) stays separate.** It is a B10+ scaling optimisation; existing NUT-00 BDHKE is correct and sufficient through B9. Do not couple it to the Nutroot/FROST narrative — different concern, different timeline.

Actual whitepaper drafting is a B9 planning task, not this session.

---

## 6. Competitive positioning and the index hero

**Decision. The one-line positioning — "professional-grade anonymity where only one side needs to be sophisticated" — is *unchanged and reinforced*; Silent Inbox is its cleanest instance, not a revision. The two-axis framing remains the *primary* index hero. The journalist inbox is adopted as the canonical concrete *illustration* of the two axes — the grounding image beneath the category headline, the spine of article 7, and the anchor of the Silent Inbox / Production Max page — but it does not replace the category claim as the top-line promise. Any public journalist/source-protection-forward copy is gated on: Silent Inbox shipped + blinded-relay crypto reviewed + honest network-layer (VPN) scoping.**

Reasoning.

"Only one side needs to be sophisticated" is a usability claim about asymmetric sophistication: the professional sets it up; the other party just clicks. Silent Inbox is a *perfect* instance — the journalist (sophisticated) publishes one link; the source (possibly a frightened person with zero technical ability) visits and uploads, no account, no Bitcoin, no software. The line does not change; it gets its sharpest illustration yet.

On the hero, there is a genuine pull and a genuine risk, and the resolution threads them:

- *The pull.* The journalist inbox is logged as "the clearest public articulation yet of what Share actually does." A visceral, concrete story ("publish one link, receive documents from any source, forever, untraceable") outperforms an abstract category claim emotionally, even though the two-axis framing is intellectually the stronger spear.
- *The risk.* (a) It is a paid, Lightning-only, tier-gated feature — leading with it over-promises to the free/first-run visitor, who can actually use the *base* product (send a file, link survives, nothing to hand over). (b) Source protection is life-adjacent; making it the top-line promise raises the stakes on every claim and invites adversarial attention before the crypto is reviewed. (c) It over-indexes on one narrow, high-risk segment as the face of the whole product.

The resolution: **category claim as the headline; journalist inbox as the grounding image and example beneath it.** The abstract claim (recipient + compulsion) stays the primary hero because it describes what every visitor can do and defines the category; the journalist inbox concretises it without becoming the entire promise. Its full power is then expressed where it belongs — article 7, the Silent Inbox page, the Susie conversation — without the exposure of a life-adjacent claim carrying the front door.

The gating is not optional. Until Silent Inbox has shipped, the blinded-relay crypto has been reviewed, and the network-layer scope is stated honestly (VPN caveat), journalist-forward framing stays in planning, whitepaper, and article drafts — never live hero copy. Same pattern as "audit-certified" being blocked until B9; here the reason is sharper, because a source's safety can depend on the promise being literally true.

("The server is blind and so is the till" has an obvious third-clause temptation — *"...and so is the inbox."* Hold it. Three-part slogans dilute; log it as a copy option for the Silent Inbox page, not a lock.)

**Unresolved / for later.** Whether, once shipped and reviewed, the journalist inbox earns a *dedicated* landing page or lives on the Production Max / Silent Inbox page. Decide at build time, with real copy in front of you.

---

## Open items carried to the next session(s)

Not session plans — genuinely unresolved questions flagged per the brief:

1. **Tier naming** (Q2) — decide "Production Max" / "Creative Premium" at the paid-tier re-enable gate or B13. Do not touch Stripe objects before then.
2. **Lightning recovery-cliff UX** (Q2) — honest answer to "no account = no recovery for a lost inbox," a design item inside the Silent Inbox block.
3. **Silent Inbox block placement** (Q3/Q4) — its own block, after R-series, position relative to SW/HQ is Opus-2's to sequence.
4. **Blinded-relay crypto review** (Q4/Q6) — a mandatory review inside the Silent Inbox block; the public claim's strength is gated on it.
5. **Segment-specific third-axis question** (Q1) — revisit only with a real journalist user.
6. **Dedicated journalist landing page vs. shared page** (Q6) — decide at build time.

---

## What Share is — updated internal framing

*(Suitable for CLAUDE.md and Share-Master-Context.md.)*

> Refueler Share is anonymous, encrypted, asynchronous file transfer whose architecture solves two problems no competitor solves at once: the **recipient problem** — a transfer survives either party going offline — and the **compulsion problem** — there is nothing to hand over, because the server only ever holds encrypted noise and never held a key or an identity. **Silent Inbox is the sharpest expression of that architecture, not a new pillar of it**: point the same blind-signature, client-encrypted, server-blind machinery at a standing inbound channel and a recipient can publish one permanent link that any sender can use — no account, no software, no Bitcoin knowledge — while Refueler can link no sender to the recipient, to another sender, or to another transfer. This is why only one side ever needs to be sophisticated. Tiers now resolve on two independent dimensions: **capacity** (Free → Creative Premium → Production Max → Business → Enterprise) and **payment rail** (Stripe, which carries identity and so supports refunds and recovery; Lightning, which carries none and so unlocks the identity-free features Silent Inbox depends on). The architectural direction is **"the policy is the credential"** — access and custody conditions (thresholds, timelocks, payment-conditioned release) expressed cryptographically via NUT-10 Nutroot secrets and FROST, rather than enforced by a server that could be compelled — which is simply the compulsion axis followed to its conclusion. Faster than email; slower than services that can read your files; and the only one where the inbox is as blind as the server.

*"Nothing stops this train."*
