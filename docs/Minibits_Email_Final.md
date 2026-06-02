### Email draft to Minibits

Hi,

I've been lurking on the monthly Cashu dev calls for a while — the ones Calle moderates. I'm Rajesh. I don't speak much on them but I learn a lot.

I wanted to reach out because I'm working on a test project called Refueler — a pre-order app for commuters on the Fenchurch Street line in London. The idea is simple: you order your flat white before your train arrives, pay in ecash sats, collect without queuing. Bitcoin-native rewards at the core, not as an afterthought.

I should be upfront — this is early stage. I'm speccing the architecture, not shipping yet. I'm a solo founder figuring this out as I go, and I'm genuinely looking for advice from people who know this stack properly. I've been using Minibits as my primary soft wallet for a few months and made around 100 transactions without a single issue — it's by far the most solid ecash wallet I've used. I pulled the ippon and minibits_wallet repos and read through them properly, which is what prompted me to reach out.
A few specific questions I'd love your thoughts on:

NUT-18 — our core payment flow relies on Refueler generating a payment request that the customer's wallet settles. The decode side looks solid in ippon, but paying NUT-18 requests throws "not yet supported" in the send route. Is that on your near-term roadmap?

NUT-17 — we want to push an "order almost ready" notification when the venue marks complete. I noticed poller.ts in the wallet repo — is WebSocket push something you're working toward, or is polling the current model?

GDPR / logging — the application code is clean, no IPs anywhere in the DB or app logs. Our only remaining question is whether Fastify or nginx access logs capture IPs in production and what the retention looks like. UK GDPR compliance means we need to be able to account for both sides of the data flow.

NUT-11 order handoff — your lock_to_pubkey is exactly what we need for a feature where dad orders from the car, locks the token to his son's wallet pubkey, son collects at the venue. Would love to build this on top of what you've already shipped.

Exchange rate — noticed GBP in the supported currencies on /v1/rate/:currency. Is that stable enough for production use?

Longer term I'd want to think about running ippon as a Refueler-branded mint instance, but that's a future conversation once I understand the architecture better.

If you have 20 minutes for a call at some point I'd really appreciate it. No agenda beyond picking your brain — you clearly know this space better than most.

Thanks,
Rajesh

