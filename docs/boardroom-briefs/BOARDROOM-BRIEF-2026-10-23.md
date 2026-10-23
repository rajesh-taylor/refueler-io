# Boardroom Brief — 2026-10-23

**Week 3 · Harry Potter** · Fri 23 Oct 2026 · uncounted · run from `refueler.io`

> **Carried in from Week 2, checked before the table sat:** Vuln-Watch-1 shipped in `refueler-share` (`.github/dependabot.yml`, the scan step in `ci.yml`, `frontend/VENDORED.md`, `bin/route-inventory.mjs` + `docs/ROUTES.md`). Share-Release-1b shipped the watchdog and `/verify/`. A credential inventory exists in `refueler-share-private`; its contents weren't read for this brief. The admin surface still shares a hostname with public uploads: `ROUTES.md` says moving it behind Cloudflare Access is B12-Audit.

---

The castle runs on Cloudflare, and tonight the staircases are behaving. Two items are on the table. One is a page from someone else's library: a short FAQ on what happens when a file-transfer service is broken into before it can be patched. The other is the question every old house faces eventually: how do you let more people through the door without turning the Great Hall into a station concourse? The CTO has read the article twice, mostly to make sure there was nothing more to read. The Head of Security read the framework table at the bottom first, because that is where such pages usually go wrong. "One item is a revision lesson," says the Head of Product. "The other is a real question. Revision first, quickly."

---

## Item 1 — NHIMG: "What happens when attackers exploit a file transfer vulnerability before organisations can patch it?"

**Relevance: medium. It's the same subject as Week 2 item 1, written as a generic FAQ. Two of its points are worth our time. The rest we've already done.**

The Head of Security sets the page in context before anyone gets excited. "This is an FAQ from NHI Mgmt Group, updated 19 September 2026. No named incident, no CVE, no dates. It's a revision guide for the MOVEit lesson we went through last week: anything that holds other people's files is a target, and the way in is the internet-facing part. The useful thing is who wrote it. They're a non-human-identity shop. Read with that in mind, the article's real point is one paragraph long: **the damage depends on what secrets and access the transfer service holds**, not on the bug that let someone in."

The CTO takes that paragraph and makes it about us. "Our transfer service is the Worker. Here's what it holds: the R2 S3 key pair for presigning, the Stripe secret, the Supabase service role, two Turnstile secrets, the seal keys `SHARE_SEAL_KEY_<n>`, and the admin key. The file contents aren't on the list. The keys to the files are in the link fragment, and we never see them. But that list *is* the blast radius of a Worker compromise. None of those secrets decrypts a file. Several of them can delete one, bill someone or read a Citizen's email address." She lets that settle. "The article's advice is 'restrict the service to only the data and systems it truly needs'. For us that comes down to one question for each secret: **is its scope as narrow as the job?**" The Head of Product asks what that means in practice. "Three checks. The R2 token is limited to the Share bucket and to object read and write, not account-wide. Stripe uses a restricted key with only the permissions the Worker actually calls, not the full secret key. The service-role key is used only where row-level security can't do the job. If the credential inventory already records scope against each secret, this is ten minutes. If not, it's the column to add."

The Head of Security goes straight to the newest thing in the codebase. "Since 22 October we have a take-down. It's one admin action, and it 'deletes the file for good'. That's the right tool for the Online Safety Act. It also means **the admin key can now destroy data**, not just read numbers. A long-lived shared key that can make deletions nobody can undo is precisely what this article is about: a non-human identity with more power than its job needs. Cloudflare Access on a separate admin hostname was a week-2 nice-to-have. It's now the main protection for an irreversible action." The CPO/DPO adds the obvious companion. "And every take-down is already a case with a record. A deletion without a matching case, logged anywhere, is the alarm." The CTO: "That's a check for B12-Audit: compare deletions against case records. I'm not deciding the design here."

On **integrity**, the article's second point, the room is calmer. It warns that attackers "alter transferred files" and tamper with records. The Bitcoin & Lightning Advisor answers for the cryptography. "Stored ciphertext can't be changed without detection. AES-GCM fails on a single flipped bit. The part scheme numbers each chunk and marks the last one, so a part that's reordered, dropped or added fails too. Rajesh's encryption rule of 7 October is written into exactly that. And the BLAKE3 root ties the whole thing together." The Head of Security finishes the thought, because it's his favourite. "Which leaves the integrity of the **served code**, as last week. The watchdog and `/verify/` are the answer to this article, already shipped. Someone who changes `upload.js` doesn't alter your files. They read the next ones."

General Counsel has one note, on sources. "The framework table maps controls to 'NIST CSF 2.0' using IDs like **PR.IP-12**. That ID belongs to CSF 1.1. CSF 2.0 reorganised that category away. It's a small error, but it tells you the table was put together, not checked. Fine as background reading. **Never cite it** in a notes article, a security page or a grant application. Go to the primary source: CISA KEV, NVD, NIST itself."

The CMO has found her line, as always, at the end. The article closes by saying the real question is whether the exploited service "had enough trust and access" to turn one missed patch into a broader breach. "That's the question a customer should ask any file-transfer company. And we're one of the few that can answer it in a table." She doesn't propose an article. She proposes a section: **"If someone broke into Share"** inside the existing *What Share keeps* note, beside *What a subpoena gets*. It would list what's held, what each secret could do, and what no secret can do. General Counsel's condition is the usual one: state the limit beside the strength, and served code stays named as the open gap until Block B.

**The lesson:** For a file-transfer service, the harm comes from what the service is trusted with, not from the bug. Share's files are out of reach by design. Our exposure is the Worker's secrets and the admin key, and since 22 October the admin key can delete files for good.

**What not to copy:** Don't adopt the article's framework table or cite NHIMG as an authority. Don't buy an NHI governance product: our non-human identities fit on one page. Don't treat "patch faster" as our lesson. On Workers the patch window is our dependency tree, and Vuln-Watch-1 already watches it.

---

## Item 2 — Taking Refueler to family businesses, the self-employed and students, while staying premium

**Relevance: high. It decides who Share is for after Citizen launches. Today the plans page reads "Pro Bono open · Citizen and Sovereign coming soon", at £24 a month or £288 a year for either paid plan.**

The CMO opens, because this is hers, and she starts by saying what premium is *not*. "Premium isn't a price. It's what you refuse to do. Fifteen years in luxury travel taught me the one rule that survives every downturn: **you never discount the flagship. You build a door.**" She taps the plans page. "And we already have the door. It's called Pro Bono. It's free, it needs no account, it carries 4 GB, and the name says we're doing this for the public good, not running a trial. A student doesn't need a student discount on Citizen. A student needs Pro Bono, and to be treated as a client while using it." The Head of Design agrees, which she rarely does out loud. "The worst thing we could build is a cheaper-looking page for cheaper customers. One brand, one Carbon, one serif. **Audience pages, not audience brands.** No stock photos of smiling families at a kitchen table. The calm is the premium."

The CRO makes it commercial, three audiences, one sentence each. "**Family businesses** send the files that matter most to the people they trust most: year-end accounts to the accountant, the lease to the solicitor, the payroll file to the bookkeeper. **The self-employed** send work to clients: the final cut, the RAW set, the signed-off drawings. Citizen's 100 GB per transfer is built for video. **Students** send dissertations, portfolios and application documents, and in five years they're the self-employed." Then the line the table came for. "We don't reach family businesses through ads. We reach them through **the professional who receives their files**. One accountancy practice that tells its clients 'send your records by Share' is two hundred family businesses with a reason to trust us. Selling one-to-many is how a premium brand grows without shouting."

The Head of Partnerships takes that and makes it operational. "Then Phase 0 for this is **one practice**: a small accountant or solicitor, ideally one Rajesh already knows, receiving client files through Share for one quarter. Nothing signed, nothing paid. We learn what their clients get stuck on. If the clients come back, Chartered (API) is the conversation for the second quarter." The CRO, carefully: "And we don't promise them anything about compliance. We can't."

General Counsel picks that up immediately. "Correct. Not 'GDPR-compliant', not 'approved for HMRC records', not 'meets professional obligations'. Those are representations about *their* duties, and we don't know their duties. We can say what Share does: encrypted in your browser, we can't read it, it expires. Then they decide." She has two more. "**OpenTimestamps** will tempt the CMO for freelancers and students, 'proof you delivered', 'proof it was yours first'. It proves a record that **this exact file existed by this date**. It doesn't prove delivery, authorship or originality, and the copy says only what it proves. Second, **students means 18 and over**. University, not school. If we ever market to under-18s, the Online Safety Act's duties to children apply to the service, and Pro Bono can't age-check anyone because it has no accounts. So: universities, postgraduates, art and film schools. Never sixth forms." The CMO says nothing, which means she'd already written "existed by this date" in the margin.

The CPO/DPO ends the student discount idea politely. "A student price means verifying student status, through a third-party verifier or a university email. Either way we'd collect a fact about a person in order to charge them less. Do we need this data at all? We don't, because Pro Bono exists. If a student needs more than 4 GB, the conversation is about Pro Bono's limits, not about collecting their enrolment." The IR/CFO agrees, with numbers. "A discount also pulls the anchor down for everyone. The yearly plan is £288, exactly twelve months: **there's no annual saving at all**. I'd keep it that way. Price is price, and that's a premium signal. If we ever give something to students or charities, it's *more* on Pro Bono, never *less* on Citizen."

The Bitcoin & Lightning Advisor keeps the north star where it belongs. "None of these audiences comes for Bitcoin. Family businesses come to keep their accounts private, freelancers for big files and a dated record, students because it's free and doesn't ask for an email. Sovereign is there for whoever discovers they want it. **Come for privacy, stay for Bitcoin**, in that order, and the second half is never in the headline." The Head of Design adds one word about names. "'Sovereign' will read as a crypto word to a family business. Fine. They'll be on Citizen. Don't rename the tiers per audience."

The CMO gives the channel plan as seeds, not copy, as she always does:

- **Notes as the engine.** One plain-English scenario note per audience, written like the help notes, not a landing page: *Sending your year-end accounts to your accountant*; *Sending a 60 GB final cut to a client*; *Sending dissertation drafts, and keeping a dated record*. Each states what Share keeps and links to *What Share keeps*. Honest search pages, not ads.
- **One adviser page:** *For accountants and solicitors who receive client files*. It's the only page aimed at a business buyer. It points to Chartered and to an email address, not a checkout.
- **Student reach without incentives.** No ambassadors paid in credits, no referral codes, no freebies. Those look cheap and they create data. A talk at one university's computing or film society, and a Pro Bono line on the plans page that says plainly who it's for.
- **Things we never do:** discount codes, "limited time", countdowns, influencer bundles, exclamation marks, "military-grade", "bank-level", photos of laptops on beaches.

The Head of Product brings it back to the queue. "Timing. Citizen is 'coming soon'. Pushing an audience at a plan you can't buy yet spends attention we can't get back. So: notes and the adviser page **after Citizen goes live**, and the one-practice pilot can start now on Pro Bono, because that's already open."

The Headhunter speaks once, at the end. "The adviser channel implies a person we don't have: someone who's worked inside a small accountancy or law practice and can sit with a practice manager for an hour. Not a salesperson. I know the type. Freelance, two days a month, after the pilot proves the clients come back. Not before."

**The lesson:** Grow through the door you already have (Pro Bono) and through the professionals who receive the files. Never through a cheaper version of the flagship. Premium is what you refuse: discounts, verification data, borrowed compliance claims, loud channels.

**What not to copy:** Don't offer a student discount or student verification. Don't make an annual "save x%" offer. Don't create audience sub-brands or rename tiers per audience. Don't make compliance claims on anyone's behalf. Don't market to under-18s. Don't launch audience pages before Citizen can be bought.

---

## Action items

The Head of Product reads them back. Each one names its session.

1. **Secret scope check (B12-Audit input).** For each Worker secret (R2 S3 pair, Stripe, Supabase service role, Turnstile ×2, `SHARE_SEAL_KEY_<n>`, admin key), record its scope in the credential inventory and confirm it's as narrow as the job: R2 token limited to the Share bucket with object read/write only; Stripe as a restricted key; service role only where row-level security can't do the job. *(refueler-share-private `credential-inventory.md`; B12-Audit.)*
2. **B12-Audit priority raised:** the admin surface behind Cloudflare Access on its own hostname is now the main protection for take-down, an irreversible delete (since 22 Oct). *(B12-Audit row, one line.)*
3. **B12-Audit question (not a decision):** alert when a delete has no matching case record. *(B12-Audit agenda.)*
4. **Notes seed:** a section **"If someone broke into Share"** in `src/notes/what-share-keeps/`: what's held, what each secret could do, what no secret can do, served code named as the open gap until Block B. *(Next notes session; CMO brief, General Counsel review.)*
5. **Source rule:** NHIMG pages aren't cited anywhere public. Use CISA KEV, NVD or NIST primary sources. *(SECURITY-RESEARCH-LOG watch-line.)*
6. **Positioning decision to record:** Pro Bono is the student and starter product. No student discount, no status verification, no annual-saving offer. Any future generosity is more on Pro Bono, never less on Citizen. *(Pricing-v2 input; Master Context pricing row.)*
7. **One-practice pilot (Head of Partnerships):** one small accountancy or law practice receives client files by Share on Pro Bono for a quarter. Nothing signed, nothing paid. Note where their clients get stuck. Can start now. *(Partnerships log; Chartered conversation only after.)*
8. **Three scenario notes** (accounts to an accountant · a large final cut to a client · dissertation drafts with a dated record), written in the help-note register, each linking *What Share keeps*. **Gate: Citizen live.** *(Notes queue; CMO three options each.)*
9. **One adviser page** for accountants and solicitors who receive client files, pointing to Chartered and an email address. **Gate: Citizen live.** *(refueler.io Share pages; Head of Design.)*
10. **Copy rules added to the brand voice notes:** OpenTimestamps = "a record that this exact file existed by this date", never delivery, authorship or originality. No compliance claims on a customer's behalf. Students = 18+, universities only. The never-list from item 2. *(Brand voice doc / CMO brief.)*
11. **General Counsel check before Citizen launch:** UK subscription-contract rules for reminders and easy cancellation, and whether they're in force yet. *(Legal queue, before Citizen goes live.)*
12. **Headhunter note:** a freelance practice-side adviser, two days a month, **only after** the pilot shows clients come back. *(Talent notes; no action now.)*
13. **SECURITY-RESEARCH-LOG entry** for item 1: research note only, no open findings. *(Informed by BOARDROOM-BRIEF-2026-10-23.md.)*

The Headhunter, for the record: **item 7 implies the capability gap in item 12.** Nobody hires for it until item 7 answers.

---

*Help will always be given at Refueler to those who ask for it. We just don't keep a list of who asked.*

---

**Carried to Week 4 (The Beatles, 30 Oct), agreed by Rajesh:** three items: (1) UK subscription-contract rules under the DMCC Act 2024 (reminders, easy cancel, in force or not) ahead of Citizen; (2) a Stripe / payments item, alongside the Stripe-Account move; (3) one security item.
