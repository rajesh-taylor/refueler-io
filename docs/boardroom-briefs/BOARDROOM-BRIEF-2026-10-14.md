# Boardroom Brief — 2026-10-14

**Week 2 · Lord of the Pings** · planned for Wed 14 Oct, run Thu 15 Oct 2026 · uncounted · run from `refueler-share`

> **Template is stale — read before the next run.** Flagged, not silently fixed; the template rewrite is action 14.
> - **Stack line says "Blink BOLT11"** and the consumer app "Lightning via Blink". Blink ended UK custodial accounts on 31 Aug 2026. Share's rail is self-hosted **phoenixd**, one node per product (Research-Review-2, 11 Oct).
> - **The mythology has LNbits as "Gondor" and the node at B9 ("Mount Doom").** LNbits is off Share's path; the node is **B7**, not B9.
> - **"Brand: James Bond — suave."** The brand voice moved to **calm and considered** at Article-Rewrite-1 (10 Oct). Bond survives only as a Week 1 lens.
> - **Share is described as "anonymous".** Since B12-4a (13 Oct) Share has a **Registered rail** (Citizen sign-in, held emails, Stripe). Anonymous is one rail, not the product.
> - **The reference session `BOARDROOM-BRIEF-2026-08-12.md` doesn't exist** in `boardroom-briefs/`. The 12 Aug material lives only in `SECURITY-RESEARCH-LOG.md`, and Week 1 (17 Aug) is the real calibration point. The template also says to save to `docs/`; briefs now live in `docs/boardroom-briefs/`.
> - **INCIDENT-PROTOCOL v1.0 is stale for Share.** It names Blink as a provider and says "Users (Share): status page only, no email list". Citizen emails now exist. This is already queued as **Incident-Protocol-2**.

---

The fellowship meets in a long room with a map on the wall. Since Week 1 someone has redrawn the map. Gondor's beacon is no longer LNbits, Mount Doom has moved from B9 to B7, and the road to it runs through a hosting company whose ARM boxes have been out of stock for weeks. Two items are on the table. One is a story about other people's file-transfer servers being robbed, again and again, over three years. The other is a question about whether a small server in France could carry two burdens at once and pay its own way. The CTO has read everything. The Head of Security read the CVE first because he always does. "Two items," says the Head of Product. "One is a warning and one is a temptation. Let's take the warning first."

---

## Item 1 — Finastra SFTP breach, the MFT pattern, CVE-2023-4528

**Relevance: high. Share *is* a file-transfer service. The difference is what's in the vault.**

The Head of Security starts with dates, because people forget them. "None of this is new. The BankInfoSecurity piece is from **October 2023**. Finastra is **November 2024**: suspicious activity found on 7 November, a threat actor calling themselves *abyss0* claiming 400 GB, and the access came through **compromised credentials** on an internally hosted SFTP platform. No zero-day. A login. The CVE is **JSCAPE MFT, September 2023**: Java deserialization on the **management port** (TCP 10880), found by Rapid7, fixed in 2023.1.9, and it gives you root. In between there's MOVEit, GoAnywhere, Accellion, Serv-U, ShareFile and WS_FTP. Clop worked through the whole category. Emsisoft counted more than 2,550 organisations from MOVEit alone." He puts the papers down. "Read this as a pattern, not a news story. **Anything that collects other people's files in one place is a target**, and the attacker comes in through one of three doors: a stolen login, an admin interface that faces the internet, or a parsing bug in old code."

The CTO takes the obvious question before anyone asks it. "What do they get if they get into us? Ciphertext. The Worker stores encrypted noise and never sees the key. The key is in the link fragment. A Clop-style raid on R2 gives them nothing to extort a customer with." She waits a beat. "That's the true answer. It's also the dangerous one, because it tempts us to stop there."

The CPO/DPO doesn't let her stop there, and the CTO didn't expect her to. "Here's what they *would* get. Citizen email addresses and Stripe customer IDs in Supabase, since B12-4a. Manifests with timing. R2 object sizes, which give the **exact** plaintext size: we wrote that down ourselves. And the `subscribers` table from before the portal fix. Small, but not nothing. Our safest field is still the one that isn't there. We just have more fields than we did in August."

Then the Head of Security makes the point the room came for. "Ciphertext-only storage protects the files people have **already sent**. It does nothing for the files they send **after** the break-in. Someone who takes over our Cloudflare account doesn't need R2. They change `upload.js`, and from then on every new link sends its key to them. **For us, the MOVEit-scale breach is a served-code breach.** That's why Block A exists, and why Share-Release-1 and its watchdog matter more than any scanner we could add." The CTO nods once, which counts as strong agreement from her.

The three doors, mapped against us:

- **Stolen credentials (Finastra).** Our keys to the kingdom are the Cloudflare account (Worker, Pages, DNS, R2), GitHub (the code), Supabase (service role), Stripe, the R2 S3 keys inside the Worker, and soon the phoenixd passwords and a VPS console. The Head of Security asks for a written **credential inventory**: who holds each one, its scope, how it's protected (hardware-key 2FA where offered), and when it's next rotated. General Counsel adds a condition. "The inventory lives in `refueler-share-private`. The public log only records that it exists."
- **An admin interface facing the internet (JSCAPE).** The CTO counts out loud: about twenty `/admin/*` and `/api/v1/admin/*` routes on `api.share.refueler.io`, the same hostname as public uploads, each gated by a token check in Worker code. "That's our version of port 10880. It's gated, but it's reachable. The fix is defence in depth, not panic: put the admin surface behind an edge identity check, Cloudflare Access on a separate admin hostname, so a token bug can't be reached from the open internet." The Head of Product asks where that goes. "B12-Audit. It already covers the new origin and the CSP. Admin exposure belongs in the same pass."
- **Parsing bugs in other people's code (MOVEit, JSCAPE).** We pin `@cashu/cashu-ts` 4.11.0, `blake3-wasm` 2.1.5, and caret ranges on `@noble/*`. We vendor `frontend/cashu-crypto.js` and the BLAKE3 WASM into the browser. "Here's the uncomfortable part," says the Head of Security. "**Nothing watches any of it.** No Dependabot config. No audit step in `ci.yml`. And vendored files are invisible to Dependabot anyway, because they're bytes in `frontend/`, not entries in a lockfile."

This is where Rajesh's request, a *schedule* for finding vulnerabilities, lands. The Head of Product turns it into a routine with one owner per row:

| Cadence | What | How | Cost |
|---|---|---|---|
| **On every push** | Known vulnerabilities in `worker/` dependencies | `osv-scanner` (or `npm audit --omit=dev`) step in `.github/workflows/ci.yml`; fails on high/critical | £0 |
| **Weekly** | New advisories for direct deps + GitHub Actions | `.github/dependabot.yml` (npm `worker/`, `github-actions`); alerts on, auto-PRs grouped weekly | £0 |
| **Weekly** | Vendored browser libraries | `frontend/VENDORED.md`: library, exact version, source hash. A CI step checks each against OSV by name and version | £0 |
| **Weekly** | Our suppliers' advisories | One watch list: workerd/wrangler, Supabase, Stripe, cashu-ts, noble, blake3, nostr-tools (when vendored), phoenixd, strfry (if ever run). Feeds: GitHub Security Advisories, CISA KEV, ACINQ releases. A scheduled Claude routine reads them and writes a short note; it changes nothing | £0 |
| **Monthly** | Route inventory | `bin/route-inventory.mjs` lists every Worker route and its gate (public / HMAC / session / admin token) against a committed `docs/ROUTES.md`; CI fails when a route appears without a row. The 13 Oct Stripe-portal finding was exactly this: **a route nobody had looked at since it was written** | £0 |
| **Quarterly** | Credentials | Walk the private inventory: rotate, re-scope, confirm hardware-key 2FA, revoke anything unused | 1 hr |
| **At each release** | Gate | Share-Release-1 refuses to tag with an open high/critical in the scan | £0 |
| **Funded** | External audit | Already the plan: tidy → internal review → OpenSats-funded audit | grant |

The Bitcoin & Lightning Advisor adds one row from his side. "When phoenixd arrives, ACINQ's release notes go on the weekly watch. A Lightning node that's two security releases behind isn't self-custody. It's a liability you happen to hold the keys to."

The CMO has found her line, in the margin of the FS-ISAC advice. That advice is *minimise what's stored, delete it quickly, encrypt it*. "That's a description of Share. Expiry, destroy-after-download, ciphertext only. It's the honest version of what every MFT vendor's marketing claims after the breach." General Counsel heads it off before it reaches a page. "Then the copy states the limit next to the strength: what we *do* hold (sizes, timing, Citizen emails) and that served code is the open gap until Block B. And never 'breach-proof'." The CMO, who would never have written "breach-proof", lets that pass without comment.

On communications, General Counsel has one point from Finastra. "Their customers heard about it from **Krebs**, who was quoting one of their own breach notices. A direct notice is a public statement with a short delay. Incident-Protocol-2 should say so: write every direct notice as if it will be quoted." The Head of Security files the "limited-scope security incident" phrasing under *things to say only once you know the scope*.

**The lesson:** File-transfer services get breached through a stolen login, an exposed admin interface, or an old parsing bug, almost never through their cryptography. Ciphertext-only storage puts Share ahead on the first count. On all three we're as exposed as anyone, and for us the worst case is served code, not stored files.

**What not to copy:** Don't buy a scanner subscription or a "vulnerability management platform". Everything above is free and fits in one Sonnet session. Don't publish the credential inventory or open findings (security-log policy, 13 Oct). Don't build an "alternative platform for continuity" like Finastra did. At our size, offline with an honest status page is the correct incident posture.

---

## Item 2 — An OVH VPS for phoenixd *and* a Nostr relay that pays for itself

**Relevance: high, and it pushes on two locked decisions at once. The table takes it slowly.**

The CTO starts with the numbers, because the screenshots got them wrong. "OVH's own UK page today: **VPS-1** is 2 vCores, 4 GB, 40 GB NVMe, 500 Mbps, **£3.31** ex VAT. The 4-core, 8 GB, 75 GB box at **£6.29** is **VPS-2**, and it has 1 Gbps, not 400 Mbps. The AI summary mislabelled the tiers, same as on the 14th. The '100 Mbit/s cap' line contradicts its own table. And phoenixd's API is **9740 on 127.0.0.1**. Port 9735 is Lightning peer traffic, and phoenixd doesn't take inbound peers anyway: it dials ACINQ." The Advisor, quietly: "Small errors. But it was a summary about running a hot wallet, and it got the wallet's port wrong."

**Can one box run both without hurting the service?** "On resources, easily," says the CTO. "phoenixd idles in a few hundred MB. strfry is famously light. Either box would cope."

"On security, no," says the Head of Security, and the room goes still. "That box holds a **hot seed**. The whole design is that it has **no public listener**: tunnel in, allowlist proxy, two endpoints. A public relay is a WebSocket server that parses untrusted input from anyone on the internet, all day. That's the JSCAPE lesson from twenty minutes ago. Docker shares the kernel. It's packaging, not a wall. **Never put a public parser on the same machine as a hot wallet.**" The IR/CFO does the sum before anyone asks. "Two VPS-1s cost £6.62. That's the price of the one VPS-2 in the screenshot, with a real boundary between the two. If we ever run a relay, it gets its own box. Same money."

Then the Head of Product puts the bigger issue on the table. "Row 19 is locked: **third-party relays only, never our own.** We didn't choose that for cost. We chose it for the split. A relay sees the reader's IP but not the content. We see the transfer but not the reader's IP. If we run the relay that carries Share notices, **we hold both halves**, and the whole reason for dropping OHTTP was that an operator holding both halves breaks the promise. Same reason, same answer." The CPO/DPO: "So the idea that Share and Legend users won't need a VPN *because we run the relay* is backwards. Our relay is the one relay that shouldn't carry their traffic."

**"Nobody offers real IP blocking."** The Advisor corrects this gently, because the research behind it was honest but read the wrong way. "*Blocking* IPs is common. strfry has write-policy plugins: Damus's noteguard does per-IP rate limits, the Soapbox policies do IP rate limits plus pubkey bans and proof-of-work, and rnostr has IP blacklists. What Research-Review-3 found is the opposite, and it's real: **no relay publishes a policy of not *keeping* IPs.** That's the gap. But a no-IP-log promise is still a promise. The user can't check it, and a UK operator can be served a notice. It reduces the need for a VPN. It doesn't remove it." General Counsel: "And the copy could only ever say *we don't keep IP addresses*. It could never say *you don't need a VPN*."

**Could a relay replace OpenTimestamps?** The Advisor shakes his head before the question is finished. "`created_at` is set by whoever signs the event. A relay's 'received at' is the operator's word, and relays don't sign receipts. Five relays agreeing an event existed by noon is gossip with good manners, not proof. Nostr already knows this: **NIP-03 attaches OpenTimestamps proofs to events.** The protocol reached for Bitcoin itself." The Head of Product finds the honest use: relays as **fast, wide mirrors** of things already anchored, like the `.ots` file, the signed release manifest, or the Raven. Row 19 already lists Raven mirrors on Nostr. "Relays spread the proof. Bitcoin is the proof."

**Private messaging across products?** "Already decided, and it's the right instinct," says the CTO. Row 19's six features, the Gallery (row 23), send-to-an-npub and agent notifications are all on third-party relays, with one key per job, gift-wrapped. Nostr-Opus is where they get specified. Running our own relay adds nothing to any of them.

**The screenshots on NIP-17 and gift wraps** are broadly right. The Advisor adds two corrections for the record. For kind-15 file messages, the *file* lives on a file server and the relay holds the wrapped message with the key, so "the relay stores and forwards ciphertext" is true of the message, not the file. And a gift wrap hides the sender, but the relay still sees the recipient's pubkey and the IP of whoever connects. **Buzz** is real: Block announced it on 21 July 2026, Apache 2.0, at v0.4.21, every person and agent gets their own keypair, and each workspace runs on **a single relay** as its source of truth. The Headhunter, speaking for the first time: "Note that last part. Even Block centralised the relay when it needed something to work. And the people building Buzz are the agent-on-Nostr cohort our MCP direction will want to talk to. I'd watch them, not copy them."

**Making the server earn its keep.** The CRO takes the commercial question seriously, because Rajesh asked it seriously. "Paid relays exist. nostr.wine charges 18,888 sats once for write access and 10,000 sats a month for its filter relay. The nostr.land relays are a one-off few thousand sats. The market is real but thin. The best-known essay on it says most relays can't cover their costs. A good paid relay could cover a £3.31 box with a handful of members." The IR/CFO turns it around. "But that's the wrong sum. **The box already earns. phoenixd sells Share credits.** One Citizen month covers years of a VPS-1. Building a second business to save £40 a year is a poor trade."

General Counsel names the real cost, and it isn't the hosting bill. "A public relay is a **user-to-user service** under the Online Safety Act, run by a UK operator: illegal-content risk assessment, reporting duties, and the moderation queue. That's the reason Blossom is parked behind the solicitor. Paid write and a web of trust lower the risk. They don't lift the duties."

Rajesh asked for creative answers. So the table gives the version that *could* be a product one day, kept apart from the locks:

- **A separate, privacy-first paid relay as its own product.** Its own origin and brand, its own box, never carrying Share, Legend or Gallery traffic. Pitch: **published no-IP-log policy + a Tor onion address + paid write with no account** (Lightning or Cashu). The `.onion` address is the honest answer to "no VPN needed": Tor users connect without exposing their IP to anyone, us included. Strongest audience: the agent builders Buzz is drawing in, who need a relay with stated rules and a bill they can pay without an account. **Gate:** solicitor (OSA) + B7 live + a Pricing-v2 decision on whether a non-Share product takes Share credits. Parked, not dropped.
- **An internal ops bus** (screenshot 4): a NIP-42 allowlisted relay carrying only *our own* operational events, like phoenixd sweep alerts or watchdog failures, to Rajesh's phone without Google. No user data ever. Signal already covers this at one operator. Revisit at Block B, where the Android app's background listener makes it natural.
- **Lending our weight instead of our box:** become a **paying member of the partner relays** Share already plans to use. A paid membership buys a contact, and a contact might one day sign a written no-IP-log commitment. That costs sats, not liability.

The Head of Design says one thing all session, and it's about naming. "If the relay ever exists, it doesn't get the Refueler mark. A product that carries other people's content shouldn't look like the product that promises not to see it."

**The lesson:** An OVH VPS-1 is enough for phoenixd. A relay never shares its box. Running our own relay for our own users joins the two halves of the IP/content split that row 19 keeps apart. Relays spread proof but don't make it, so OpenTimestamps stays. The money question answers itself: phoenixd is already the earner.

**What not to copy:** Don't run phoenixd and a public relay on one machine, Docker or not. Don't route any Refueler user traffic through a relay we operate. Don't claim "IP blocking nobody else offers": it isn't true, and the true claim (no IP logs) needs a policy and a solicitor first. Don't buy anything before B7-Opus. Our standing rule is no additive infrastructure without a live consumer.

---

## Action items

The Head of Product reads them back. Each one names its session.

1. **Vuln-Watch-1 (new, one Sonnet session, £0).** Adds `.github/dependabot.yml` (npm `worker/` + `github-actions`, weekly, grouped), an `osv-scanner` step in `ci.yml` (fail on high/critical), `frontend/VENDORED.md` with a CI check, and `bin/route-inventory.mjs` + `docs/ROUTES.md` (fail on an unlisted route). Slot: after X5-2, before B12-4b. *(refueler-share.)*
2. **Weekly advisory watch** as a scheduled Claude routine: supplier list from item 1, read-only, writes one note per week, changes nothing. Set up at Vuln-Watch-1 close. *(scheduled task.)*
3. **Credential inventory + quarterly rotation** in `refueler-share-private`: every account and secret, its scope, 2FA type, and next rotation date. Confirm hardware-key 2FA on Cloudflare, GitHub, Supabase and Stripe. *(Private; first pass at Vuln-Watch-1.)*
4. **B12-Audit scope adds the admin surface:** move `/admin/*` + `/api/v1/admin/*` behind Cloudflare Access on a separate admin hostname, defence in depth over the token gate. *(B12-Audit; Master Context row for B12-Audit.)*
5. **Share-Release-1:** refuse to tag a release with an open high/critical scan result. *(Share-Release-1 spec in `docs/X5-plan-v1.md` follow-on.)*
6. **Incident-Protocol-2 additions:** (a) a direct notice is a public statement with a short delay, so write it to be quoted (Finastra/Krebs); (b) say "limited scope" only after scoping; (c) providers: Blink out, phoenixd/OVH in when live; (d) served-code compromise (Cloudflare account takeover) as a named SEV-1 Share playbook: rotate, redeploy from a known-good release hash, status page. *(Incident-Protocol-2, refueler.io repo.)*
7. **B7-Opus input:** OVH VPS-1 (2 vCores / 4 GB / 40 GB / 500 Mbps / £3.31 ex VAT, per OVH's UK page 15 Oct) is enough for phoenixd + tunnel + allowlist proxy; VPS-2 is not needed. Decide provider there (jurisdiction, backups vs hot seed, shared vCPU). **Rule to record: no public-facing service on the node box, ever.** *(Master Context row 13a.)*
8. **Nostr-Opus input:** row 19 "never our own relay" **stands**, now with a second reason on record: our relay + our Worker = both halves of the IP/content split. *(Master Context row 19, one line.)*
9. **Nostr-Opus agenda item:** paid membership of the 2–3 planned partner relays (sats, not contracts) as the route to written no-IP-log commitments. *(Row 19.)*
10. **Correct the record:** IP *blocking* on relays is common (noteguard, soapbox strfry-policies, rnostr). The real gap is *no published no-IP-log policy* (RR-3). Use only the second phrasing anywhere. *(Row 19 note + `docs/research/research-nostr-groundwork-2026-10.md` review box.)*
11. **OpenTimestamps stays.** Relays are mirrors for anchored proofs (NIP-03 precedent), never the timestamp. One line in row 19 beside the Raven-mirror note. *(Row 19.)*
12. **Parked idea, new Master Context row: "Refueler relay as a separate product".** No-IP-log policy + onion address + paid write, own origin/brand/box, never carrying Refueler user traffic. Gates: solicitor (Online Safety Act), B7 live, Pricing-v2. *(Master Context, parked rows.)*
13. **Buzz watch-line:** Block's Nostr agent workspace (21 Jul 2026, Apache 2.0, single relay per workspace). Relevant to MCP/agent notifications and the agent-to-agent route. *(Agents & pricing direction; SECURITY-RESEARCH-LOG watch-line.)*
14. **Rewrite `BOARDROOM-BRIEF-TEMPLATE.md`:** phoenixd not Blink/LNbits; node at B7; calm brand voice; Share has two rails; Week 1 as reference; save path `docs/boardroom-briefs/`. *(refueler.io repo, next small website session.)*
15. **SECURITY-RESEARCH-LOG entry** for this session: research notes only, no open findings in public. *(Appended today; informed by BOARDROOM-BRIEF-2026-10-14.md.)*

The Headhunter's note, for the record: **item 12 implies a role that doesn't exist yet**, a relay operator with moderation experience. Nobody at the table wants it. That's the best argument for keeping it parked.

---

*The road goes ever on. But you don't carry the Ring and a market stall in the same pack.*
