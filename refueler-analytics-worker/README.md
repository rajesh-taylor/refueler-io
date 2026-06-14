# Refueler Analytics Worker

Standalone Cloudflare Worker. Receives events from refueler.io pages,
writes to Cloudflare Analytics Engine. Zero cookies, zero PII.

## Events captured

| Event | Trigger | Key dimensions |
|---|---|---|
| `page_view` | Every page load | path, referrer domain, country, theme |
| `signup_submit` | Homepage magic link form | path, theme |
| `theme_toggle` | Paper ↔ Carbon switch | from, to, path |
| `article_read` | Scroll milestone on editorial pages | slug, depth (25/50/75/100%) |

## Deploy steps

### 1. Create Analytics Engine dataset

Cloudflare dashboard → Workers & Pages → Analytics Engine → Create dataset
Name: `refueler_analytics`

This must exist before deploying or the binding will fail.

### 2. Install and authenticate wrangler

```bash
npm install
npx wrangler login
```

### 3. Deploy the Worker

```bash
npm run deploy
```

Deploys to `refueler-analytics.workers.dev` and routes `analytics.refueler.io/event`.

### 4. Add DNS record in Cloudflare

Cloudflare DNS → Add record:
- Type: `CNAME`
- Name: `analytics`
- Target: `refueler-analytics.workers.dev`
- Proxy: **Proxied** (orange cloud)

### 5. Add client snippet to all HTML pages

Copy `public/analytics.js` to your Pages repo at `/analytics.js` (served from root).

Then add to each HTML page before `</body>`:

```html
<script src="/analytics.js" defer></script>
```

For the homepage sign-up form, add the data attribute to the form element:

```html
<form data-analytics="signup" ...>
```

### 6. Verify

Open any refueler.io page → DevTools Network tab → look for POST to
`analytics.refueler.io/event` returning 204.

Then check Cloudflare dashboard → Workers & Pages → refueler-analytics
→ Analytics Engine → query `refueler_analytics` dataset.

### Sample Analytics Engine query

```sql
SELECT
  blob1 AS event,
  blob2 AS path,
  blob3 AS referrer,
  blob4 AS country,
  count() AS hits
FROM refueler_analytics
WHERE timestamp > NOW() - INTERVAL '7' DAY
GROUP BY event, path, referrer, country
ORDER BY hits DESC
```

## Local dev

```bash
npm run dev
```

Runs on `localhost:8787`. Client snippet automatically allows localhost origins.

## Architecture notes

- Worker never stores IP addresses — country is derived from CF-IPCountry header
  (Cloudflare's own lookup, not transmitted to Analytics Engine as-is — only the
  country code, not the IP)
- Bot traffic is detected via UA hint and silently dropped (204 returned, not written)
- Analytics errors never propagate to the client — catch-all in writeEvent
- CORS locked to refueler.io + localhost (dev only)
- sendBeacon not used (requires text/plain, not JSON) — fetch with keepalive instead,
  which survives page unload in modern browsers
