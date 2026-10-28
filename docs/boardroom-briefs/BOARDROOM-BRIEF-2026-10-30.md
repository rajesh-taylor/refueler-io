# Boardroom Brief — 2026-10-30

**Week 4 · The Beatles** · for Fri 30 Oct 2026 (run Wed 28 Oct) · uncounted · run from `refueler.io`

> **Carried in from Week 3, checked before the table sat:** Stripe-Account-Opus, -1 and -2 are done against the **sandbox**; the deploy sitting (Deploy-Sitting-1, 28 Oct) shipped Worker `6aa58ea3`, app `app-028a5f8f13` and merged Plans into refueler.io `main` (Citizen still "Coming soon"). The hardening plan gained a v1.1 note the same day. Week 3's item 11 (General Counsel's subscription-rules check) is item 1 tonight. Week 3 promised a Stripe item and a security item: they arrive as items 2 and 3, and both turned out to be about the same thing, which is what happens when nobody is watching.

---

Four people who changed everything did it by being very good at one specific thing and refusing to be anything else. The table has taken the hint. Tonight's agenda is three items, all of them about the unglamorous middle of a song: the bit after the hook where the band either keeps time or doesn't. A law that says how you must treat people who pay you every month. Two small objects on a keyring that decide whether an attacker with your password still gets nothing. And a week in which a webhook knocked on the door 401 times, figuratively, and nobody answered. The CTO has the deploy-sitting log open. The CPO/DPO has the Act open at Chapter 2. "We are not from Liverpool," says the Head of Product, "but we can count to three. Law first."

---

## Item 1 — UK subscription rules under the DMCC Act 2024

**Relevance: high, and sooner than we thought. It decides what Plans, the Stripe settings, the Worker and the emails must do before the first paid Citizen.**

General Counsel opens with the facts, in order, because she has read them in order. "Part 4, Chapter 2 of the Digital Markets, Competition and Consumers Act 2024. It is **not in force yet**: legislation.gov.uk marks the Chapter prospective, with a handful of sections live only to allow regulations to be made. The date has moved three times: spring 2026, autumn 2026, spring 2027. On 10 August the Prime Minister brought it **forward to January 2027**. On 19 October the government laid the draft **Consumer Subscription Contracts (Cancellation and Information) Regulations 2026**, and on 21 October published draft guidance. The drafts come into force on **1 January 2027** and apply to subscription contracts **entered into on or after that date**. They still need Parliament's approval, and the final guidance follows only when the Regulations are made. So: settled in shape, not in every detail."

The Head of Product does the arithmetic the room was waiting for. "Our Beta gate includes old-link removal on **12 January 2027**. Beta is the first paid Citizen. So **every Citizen contract we ever sign is inside the regime from day one**. There is no 'before the rules' cohort to grandfather. Week 3 asked whether the rules were in force. The useful answer is that it doesn't matter: we build to them."

The CPO/DPO notes, drily, that the table had already half-done this. "Row 26 decided on 18 October: our own renewal emails, annual reminders 30 days ahead, monthly one per six months, one-click cancel, no retention hoops, a voluntary 14-day refund after an annual renewal. We were right in principle. Now we check it against the text." General Counsel walks the Act's sections, and the table converts each into what it means for Share:

- **Key information before the contract (s.254, Schedule 20).** Shown separately and prominently, near the button: price per payment, how often, that it renews, the minimum total, how to cancel, **and when we will send reminders**. The final step needs an express acknowledgement that the customer is agreeing to pay. *Plans:* a small block above "Continue to payment", and the button wording does the acknowledging. The Head of Design: "One block, same serif, no grey small print. The law wants it prominent and so do we."
- **Reminder notices (ss.258–259).** Monthly Citizen: one reminder per six-month period. Yearly Citizen: one before each renewal payment. Timing is ours to state in the key information, as long as it is a reasonable time before the last date to cancel. Content as Schedule 23 Part 3, given all together, more prominent than anything else in the message. **Writing, on a durable medium: an email counts; an in-app banner doesn't.** *Worker:* Stripe's `invoice.upcoming` event set to fire 30 days ahead (a Stripe Billing setting; confirm the allowed range in the dashboard), and the Worker decides which upcoming invoice earns a reminder.
- **Ending the contract (ss.260–261).** Signed up online, so the customer must be able to **end it online**, in straightforward steps, with the instructions where they would look. An email address alone isn't enough; asking someone to cancel at their bank isn't a mechanism. We must then send an **end-of-contract notice on a durable medium within 24 hours** of an online cancellation, with the end date. *Stripe portal* (already configured: cancel at period end, no reason, no plan switching, email editing off) **behind sign-in** returns at B12-6; that is the mechanism. The 24-hour notice comes from **us**, because every Stripe customer email is off by choice.
- **Cooling-off (ss.264–266).** The initial 14 days stays. A new **renewal cooling-off period of 14 days** applies on renewal onto a 12-month-or-longer term, i.e. every yearly Citizen renewal, with a **cooling-off notice on its first day**. The refund is proportionate under the drafts. Row 26's voluntary 14-day refund becomes statutory for yearly. The CFO: "If we're offering it voluntarily already, offer it in full. It costs us at most £288 times the people who change their mind in a fortnight, and it's one less calculation to get wrong."
- **Breach consequences.** Miss the key information or a reminder, and the customer may get money back without proving any loss. The CMA enforces consumer law directly under the same Act, and the guidance says the early months will be about helping firms comply. General Counsel: "That's not a reason to be late. It's a reason not to be the egregious example."

The CTO connects it to item 3 before anyone else does. "Notice what's just happened. Our compliance with this Act now **runs on webhooks**. Reminder at 30 days, cooling-off notice on day one, end-of-contract notice within 24 hours: each one is triggered by a Stripe event reaching the Worker. Between 21 and 28 October every old-account webhook got 401 and nobody noticed for a week. Under this regime, a silent webhook isn't an outage. It's a missed statutory notice and a refund we owe without being asked." The room is quiet for a moment.

The draft guidance's line on in-app messages lands with the Head of Design, who is pleased. "Good. The reminder is an email, plain text part, no pixels, no tracked links, from a named human reply address. Row 26 already says so. The law and the house style agree." The CMO has her line, as always, in the margin: the reminder email is the only marketing a premium subscription should send, and it should read like a letter from someone who would rather you stayed but will not make it hard to leave. *"Your Citizen plan renews on 14 March for £288. If you'd rather it didn't, cancel here; it takes one click."* Seeds, not copy.

The Bitcoin & Lightning Advisor checks the other rail. "Sovereign, when it exists, is prepaid sats: no recurring liability, no automatic renewal. Outside Chapter 2 if it never auto-renews. Keep it that way, and don't build 'auto-top-up' without General Counsel." General Counsel: "Noted, and the exemptions list (financial services, utilities, telecoms, some charities) doesn't include us. Citizen is plainly in."

**The lesson:** The regime starts 1 Jan 2027 for new contracts, and Beta is after that, so Citizen is in from its first sale. Most of the design already exists in row 26; what's new is the **24-hour end-of-contract notice**, the **cooling-off notice on day one of an annual renewal**, the **reminder timing stated in the key information**, and the fact that all of it now depends on webhooks arriving.

**What not to copy:** Don't rely on Stripe's own customer emails to comply (they stay off; we send our own). Don't add "Are you sure? Here's 50% off" retention screens. Don't use in-app banners as reminders. Don't treat the drafts as final: re-check against the made Regulations and final guidance before B12-6 ships. Don't let this become solicitor-only work: the solicitor checks the copy, we build the mechanics.

---

## Item 2 — Hardware keys before income

**Relevance: high for the hardening block and the Beta gate. A small sum, a large decision about which gate moves.**

The CFO puts the numbers down first. "Nitrokey: two keys, €108 list, **€193 landed** after import fees and VAT. Order returned. YubiKey 5C NFC from UK stock: around **£55–60 each**; Currys lists a **pack of two for £109**. So the UK pair is cheaper than the Nitrokey pair was, delivered tomorrow, no customs." She lets that sit. "Now the bit nobody likes. The keys are a Beta gate. Beta is the first paid Citizen. 'Wait for income' means waiting for a paid Citizen, who can't exist until the keys are registered. That isn't an option, it's a circle. **Option three is really 'move the gate'**, and we should call it that."

The Head of Security takes the three options in turn. "**One key now.** Better than none, but a single key means the fallback on every account stays TOTP or recovery codes. Anyone who can phish a TOTP code goes round the key. One key is a lock with the back door open, slightly smaller. **Two UK YubiKeys.** One on the keyring, one in the drawer with the recovery codes; register both on Tuta, Proton Pass, Cloudflare, GitHub, Stripe, the registrar. Then TOTP can come off where the service allows. That's the whole point of the exercise: **phishing-resistant sign-in on the accounts that can deploy, bill or delete**. Since 22 October one of those accounts can delete files for good. **Wait and move the gate.** Then the first paying customer's data sits behind TOTP on the Cloudflare account that serves the code that encrypts it. Write that risk down and read it aloud, and nobody signs it."

The Bitcoin & Lightning Advisor raises the one honest difference. "Nitrokey's firmware is open and updatable. YubiKey's is closed and **can't be updated**. That matters once: in September 2024 the EUCLEAN side-channel affected YubiKey 5 firmware before **5.7**, and the fix was 'buy a new key'. It needed physical possession and lab equipment, so it isn't our threat model, but **check the firmware on arrival** (`ykman info`) and send back anything older than 5.7. For FIDO2 passkeys and `ed25519-sk` commit signing, both brands do the job. The open-firmware preference is a preference, not a requirement." The CTO agrees. "We're not choosing a religion. We're choosing whether the key arrives this week."

The CPO/DPO asks the question she always asks. "What does the key tell anyone about Rajesh?" Nothing new: FIDO2 attestation identifies the model, not the person, and Share's own sign-in uses attestation `none`. "Then I have no objection to either brand."

The Head of Product checks what's waiting on the keys. "Signed-Commits-1 waits on them. The Pixel 9a must-test in row 27 names a Nitrokey 3 over USB-C and NFC without Play; the YubiKey 5C NFC is the same test with a different key. H6 tomorrow records a 'Nitrokey slot planned' column: rename it **hardware-key slot**. Nothing else breaks."

**The lesson:** "Wait for income" is a gate move in disguise, because the keys gate the income. The cheapest honest option is two UK YubiKeys, cheaper landed than the Nitrokey pair, bought at the latest when the go-live checklist starts (~4 weeks before Beta) and better now, because the accounts already hold destructive power.

**Recommendation to Rajesh (his decision, not a lock):** buy the **pair** (~£109) now if the month allows; if not, put "two YubiKeys registered" on the go-live checklist's first line so they arrive four weeks before Beta. **Not one key on its own, and don't move the gate.** On arrival: `ykman info` firmware ≥ 5.7, register both everywhere, then remove TOTP where the service lets a key stand alone.

**What not to copy:** Don't buy from eBay or marketplace resellers (cheaper, but you can't vouch for where the key has been). Don't keep both keys on the same keyring. Don't register only one key on an account "for now"; the second registration is the session where people get locked out later.

---

## Item 3 — A failure nobody saw for a week

**Relevance: high. The first real operational miss, and the cheapest one we will ever get: it happened before anyone paid.**

The CTO tells it plainly, because the plainness is the point. "From 21 to 28 October every webhook from the old Stripe account to `api.share.refueler.io/webhook/stripe` got **401**: the production `STRIPE_WEBHOOK_SECRET` didn't match endpoint `we_1Ts8ep…`. We found it at the deploy sitting, by looking. Rajesh re-put the secret from the endpoint through a hidden prompt; a Resend of the stuck event returned 200. **Nobody was harmed**: the only subscriber is an old unpaid test subscription. The log doesn't record why the secret drifted on the 21st, and we won't guess. What we know is that the Worker did exactly the right thing, refusing an unverified event, and **told nobody**."

The Head of Security has been waiting for this one since Week 1. "Canary-based alerting is table stakes. We have none. The Worker rejects bad signatures correctly and silently; Stripe retries and then gives up; Stripe emails are off by choice; there's no browser analytics by principle. Every one of those is a good decision. Together they make a building with excellent locks and no doorbell." He's careful about the brief. "The question is what the **smallest** alerting is that a one-person company should run **without tracking anyone**. The answer is a rule, then three pieces. The rule: **we watch our own machinery, never our users.** Counts of outcomes, never who."

The table builds it, smallest first:

1. **Stripe's webhook-failure emails reaching Rajesh** (a dashboard check, today, both accounts). Stripe warns the account when an endpoint keeps failing and before it disables it; on 13 Oct it had already disabled this endpoint once. Confirm those notices go to an address Rajesh reads. These are notices *to Rajesh about our endpoint*, not emails to customers, so "Stripe emails off" stays true for customers. The CPO/DPO: "That's not tracking. That's Stripe telling us our door is stuck."
2. **The Worker counts its own outcomes and says so.** Per class, per hour: `webhook_ok`, `webhook_sig_fail`, `webhook_error`, `sweep_ok`, `sweep_fail`, `r2_error`, `email_send_fail`. Integers only: no IP, no transfer ID, no email, no customer ID. The hourly cron that already runs (`:15`) reads the counts, and if a rule trips (any `webhook_sig_fail` with no `webhook_ok` in 24 hours; a sweep that didn't run; any `email_send_fail` once the DMCC notices exist), it sends **one plain email to Rajesh** through the same Cloudflare Email Sending route the receipts will use. One email per problem per day, not one per event. The CTO: "Push, not pull. Navy Office already shows figures; nobody opens a dashboard to check that nothing is wrong."
3. **A dead man's switch from outside Cloudflare.** If the Worker is down, the Worker can't email. A scheduled GitHub Actions job (free) calls `/health` every hour; GitHub already emails the owner when a scheduled workflow fails. It sends nothing about users because it *is* the only user.

The CPO/DPO checks each line against her list and passes all three. "No personal data processed for monitoring. Nothing to add to /privacy/ beyond a sentence that we count our own errors, if the CMO wants one."

The second lesson is the one the Head of Product writes down twice. "**Record where each secret came from.** The inventory H6 builds tomorrow gets a column: for each Stripe secret, the account, sandbox or live, the endpoint ID or key name it came from, and the date it was put. And after any `wrangler secret put STRIPE_WEBHOOK_SECRET`, the same sitting sends a signed test event and sees 200 before anyone stands up." The CTO adds the obvious companion: "Stripe retries live events for up to three days. A week of 401s means some events are past retrying. Before the old account's webhook is archived, look at its failed deliveries and Resend anything that still matters. Five minutes."

General Counsel ties it back to item 1, briefly: "Under the subscription rules, this exact failure becomes a missed statutory notice. The alert isn't nice-to-have once Citizen is live. It's **a go-live gate**." Nobody argues.

The Head of Security names what not to do, because people always overbuild here. "No Sentry, no Datadog, no third-party error tracker that wants a script on the page or request bodies in its logs. No Logpush of IPs to find a webhook problem. No PagerDuty: a one-person company doesn't need to be woken at 3am by a webhook; it needs to know by breakfast. And the alert email contains counts and a route name, never a payload."

The Headhunter speaks once. "This is the capability gap with no hire attached. A one-person company's on-call rota is one name long. The only staffing answer is making the machine tell that one person, early and briefly. I'll note that this is the first item in four weeks that a second person *wouldn't* fix: they'd have been just as unaware."

**The lesson:** Good silent defaults add up to blindness. Watch the machinery, not the people: Stripe's own failure notices, the Worker counting and emailing its own failures, and one outside heartbeat. Record where every secret came from, and prove a webhook secret with a signed event the moment it's put.

**What not to copy:** Don't add a third-party error tracker or browser monitoring. Don't log payloads, IPs or IDs to diagnose delivery. Don't alert per event (one email per problem per day). Don't build a status dashboard and call it alerting.

---

## Action items

The Head of Product reads them back. Each one names its session.

1. **DMCC check written into B12-6 (row 26):** regime from **1 Jan 2027**, contracts entered on/after; Beta is after it, so every Citizen is in scope. B12-6 builds: key-information block + express acknowledgement on Plans (incl. **when reminders come**); reminders (yearly before each renewal, monthly once per six months) by email; **online cancel** via the portal behind sign-in; **end-of-contract notice within 24 h** of online cancellation; **cooling-off notice on day one** of each yearly renewal; refund in full within the renewal cooling-off (amends row 26's "voluntary" wording). *(Master Context row 26; B12-6.)*
2. **Stripe settings on the go-live list:** `invoice.upcoming` set 30 days ahead; customer emails stay off; portal cancel at period end, no retention offer, no reason required. Same in sandbox for B12-6 tests. *(Funnel plan §6 item 4; Stripe-Account plan §2.11.)*
3. **Re-check against the made Regulations and final guidance** before B12-6 ships (drafts laid 19 Oct, guidance 21 Oct 2026, subject to approval). *(B12-6 gate-in; General Counsel.)*
4. **Solicitor batch:** Plans key-information block, reminder and end-of-contract wording, and the immediate-start cooling-off wording go in the consumer-terms review. *(Funnel plan §6 item 6.)*
5. **Sovereign stays non-renewing** (prepaid sats, no auto-top-up) unless General Counsel reviews it under Chapter 2. *(B7-Opus note.)*
6. **Keys — Rajesh's decision:** recommended: two UK YubiKey 5C NFC (~£109 the pair), now if affordable, at the latest on the first line of the go-live checklist (~4 weeks before Beta). Not one key alone; don't move the gate. On arrival `ykman info` firmware ≥ 5.7; register both everywhere; TOTP off where allowed. *(Hardening plan v1.1 keys line; Tester-Programme Beta gate; Funnel plan §6.)*
7. **Rename "Nitrokey slot planned" → "hardware-key slot"** in H6's accounts table; row 27's Pixel 9a must-test reads "hardware key (Nitrokey 3 or YubiKey 5C NFC)". *(H6 tomorrow; Master Context row 27.)*
8. **Secret provenance column in H6's inventory:** for each Stripe secret, account (old / new sandbox / new live), source (endpoint `we_…` or key name), date put, who put it. *(H6 Accounts-Mac-1.)*
9. **Webhook-secret proof rule:** every `wrangler secret put STRIPE_WEBHOOK_SECRET` is followed in the same sitting by a signed test event → 200. Into the go-live cutover order and the H6 runbook. *(Funnel plan §6 item 4; H6.)*
10. **Old-account failed deliveries:** Rajesh checks the old endpoint's failed events from 21–28 Oct and resends any that still matter before it's archived. *(H6 carry-in; 5 min.)*
11. **Stripe webhook-failure notices** confirmed reaching Rajesh's address on both accounts (customer emails stay off). *(H6, dashboard step.)*
12. **New session Ops-Alerts-1 (Sonnet, small):** Worker outcome counters (integers only), rules checked by the existing hourly cron, one email per problem per day to Rajesh via Cloudflare Email Sending; GitHub Actions hourly `/health` heartbeat. **Gate: before the first paid Citizen** (go-live list). Slot: after H6a, before Supabase-Split-1. *(New Master Context row 30b; Funnel plan §6.)*
13. **SECURITY-RESEARCH-LOG entry:** research notes for items 1–3; the webhook miss logged as fixed (no customer affected). *(Informed by BOARDROOM-BRIEF-2026-10-30.md.)*

The Headhunter, for the record: **no item implies a hire.** Item 12 is what a one-person company has instead of a rota.

---

*We are not from Liverpool. But we'll write before we take your money, let you leave in one click, and hear the doorbell when nobody's at home.*

---

**Sources:** [legislation.gov.uk — DMCC Act 2024 Part 4 Chapter 2](https://www.legislation.gov.uk/ukpga/2024/13/part/4/chapter/2) · [TLT — regime brought forward by the PM](https://www.tlt.com/insights-and-events/insight/dmcc-act-subscription-contracts-regime-brought-forward-by-the-pm-what-do-businesses-need-to-know) · [Lewis Silkin — draft guidance and regulations, 21 Oct 2026](https://www.lewissilkin.com/insights/2026/10/21/uk-government-publishes-draft-guidance-and-regulations-for-new-subscription-contr-102o624) · [Lewis Silkin — January 2027](https://www.lewissilkin.com/insights/2026/09/15/key-takeaways-the-subscription-shake-up-are-you-ready-for-january-2027-102o14n) · [CMS — the missing detail](https://cms.law/en/gbr/legal-updates/uk-subscription-contracts-the-government-publishes-the-missing-detail) · [Draft guidance (PDF)](https://assets.publishing.service.gov.uk/media/6acf97da2de3184ccf8b814e/subscription-contracts-rules-guidance.pdf) · [Currys — YubiKey 5C NFC pack of 2](https://www.currys.co.uk/products/yubico-yubikey-5c-nfc-usb-security-key-pack-of-2-10308337.html) · [PriceSpy UK](https://pricespy.co.uk/s/usb-keys/). Deploy-Sitting-1 and the hardening plan v1.1 note (private).
