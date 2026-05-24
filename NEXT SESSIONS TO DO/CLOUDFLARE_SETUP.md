# REFUELER — Cloudflare Setup Log
**Domain:** refueler.io
**Account:** Rt@rajeshtaylor.com
**Plan:** Free
**DNS Setup:** Full (proxied through Cloudflare)
**Last updated:** 2026-05-19

---

## Status: Active & Protected

Domain is live on Cloudflare. All traffic proxies through Cloudflare CDN.
SSL certificate issued automatically. DDoS protection active by default.

---

## DNS Records (confirmed 2026-05-19)

| Type | Name | Purpose | Status |
|---|---|---|---|
| MX | refueler.io | Email routing — route1/2/3.mx.cloudflare... | ✅ Active |
| TXT | cf2024-1._domai... | DKIM email signing key | ✅ Active |
| TXT | _dmarc | DMARC policy — `v=DMARC1; p=none` (monitoring) | ✅ Active |
| TXT | refueler.io | SPF record — `v=spf1 include:_spf.m...` | ✅ Active |

**Email authentication:** SPF + DKIM + DMARC all configured. Monitoring mode (`p=none`).
When ready to enforce (after 4–8 weeks of monitoring with zero failures): edit `_dmarc` TXT record, change `p=none` to `p=quarantine`, then later `p=reject`.

**To add when Cloudflare Pages is deployed:**
- CNAME or A record pointing root domain to Pages deployment
- Cloudflare handles this automatically when you add the custom domain inside Pages settings

---

## Email Routing (confirmed working 2026-05-19)

- `rt@refueler.io` → forwards to personal inbox
- Test sent and received successfully
- **Do not delete the MX records** — they power email routing

---

## Security Settings (confirmed 2026-05-19)

| Setting | Location | State | Notes |
|---|---|---|---|
| Block AI training bots | Overview → Control AI crawlers | **Block on all pages** | Blocks OpenAI, Anthropic, Common Crawl scrapers |
| Bot Fight Mode | Overview → Security tab | **ON** | Challenges known malicious bots |
| Leaked Credentials Mitigation | Overview → Security tab | **Already deployed** | Rate-limits stolen credential attempts |
| Client-side Security | Overview → Security tab | OFF | Enable post-launch once third-party scripts stable |
| Under Attack Mode | Overview → Quick Actions | OFF | Emergency only — blocks all visitors with JS challenge |
| Development Mode | Overview → Quick Actions | OFF | 3-hour cache bypass — use briefly when debugging deploys only |

---

## Performance Settings (confirmed 2026-05-19)

| Setting | Location | State |
|---|---|---|
| Speed Optimizations | Overview → Performance tab | **ON** — prefetch + resumed connections |
| CDN/Caching | Default | ON by default on Free plan |
| DDoS Protection | Default | ON by default on Free plan |
| WAF (basic) | Default | ON by default on Free plan |
| SSL/TLS | Default | Universal cert, auto-renewed |

---

## Cloudflare Pages — TODO (pre-launch)

**Not yet configured.** Requires GitHub repo to be connected.

Steps when ready:
1. Left sidebar → **Workers & Pages** → **Create application** → **Pages** tab
2. Click **Connect to Git** → authorise GitHub → select refueler.io repo
3. Set **Build output directory** to `/` (root) or wherever `index.html` will live
4. Leave build command blank (static HTML, no build step needed)
5. Click **Save and Deploy**
6. After first deploy: go into Pages project → **Custom domains** → add `refueler.io` and `www.refueler.io`
7. Cloudflare auto-updates DNS — do not manually add CNAME records first

**Critical:** `sw.js` must be at the repo root before deploying. It will then be served at `https://refueler.io/sw.js` automatically.

---

## Cache Rule for sw.js — TODO (add after Pages deploy)

Service workers must not be aggressively cached or browsers will serve stale versions.

After Pages is deployed, go to **Rules** → **Cache Rules** → **Create rule**:

- Rule name: `sw.js no-cache`
- When: URI path equals `/sw.js`
- Then: Cache eligibility → **Bypass cache**
- Also set Edge Cache TTL → **Respect origin**

This ensures browsers always check for the latest `sw.js`.

---

## Workers — not yet used

Workers & Pages dashboard shows 0 projects. 100,000 free requests/day available.
Possible future use: lightweight proxy to hide Supabase URL, custom auth middleware.
Not needed for Sessions 6–8.

---

## AI Crawl Control

- **Block AI training bots:** Block on all pages ✅
- **robots.txt:** Content Signals Policy (Cloudflare-managed) — switch to custom robots.txt post-launch to explicitly disallow `/command`, `/partner`, `/order` paths

Custom robots.txt to add post-launch:
```
User-agent: *
Disallow: /command
Disallow: /partner
Disallow: /order
Disallow: /auth/

User-agent: GPTBot
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: CCBot
Disallow: /
```

---

## DMARC Management

Enabled. `_dmarc` TXT record present. Currently `p=none` (monitoring, not enforcing).
Check DMARC Management dashboard monthly. Once 4+ weeks of clean data: escalate to `p=quarantine`.

---

## Costs

Everything above is on the **Free plan**. Current monthly cost: **£0**.

Future paid considerations (not yet needed):
- Cloudflare Pro: $25/month — adds advanced WAF, better bot analytics. Revisit at 100+ users.
- R2 Object Storage: $0.015/GB/month after 10GB free — relevant for Session 7 receipt image storage.
- Workers paid: $5/month — removes 100k/day cap. Not needed until Workers are actually used.
