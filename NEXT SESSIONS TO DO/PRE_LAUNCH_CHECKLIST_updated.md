# REFUELER — Pre-Launch Checklist
**Purpose:** Everything that must be done before refueler.io is live and testable end-to-end.
**Last updated:** 2026-05-20

---

## Phase 0 — Financial Infrastructure (Session 9 — do before investor conversations)

### Financial model
- [x] 7-tab Excel model built: `refueler_financial_model.xlsx`
- [x] Tab 1: Assumptions (all inputs in one place — blue text = hardcoded)
- [x] Tab 2: Revenue model (4 rails: Lightning, FX spread, Fiat, Duffel)
- [x] Tab 3: Cost model (infra, liquidity, API tiers, MAC, CAC)
- [x] Tab 4: Acquisition model (CAC, MAC, LTV, LTV:CAC ratios)
- [x] Tab 5: 12-month scenario model (conservative / base / bull)
- [x] Tab 6: Expense log (live ledger — actuals logged to date)
- [x] Tab 7: Investor summary (print-ready, one page)
- [ ] Update Tab 1 commission rate from 1% placeholder before any investor share
- [ ] Update BTC/GBP rate cell monthly (1_Assumptions!B24)
- [ ] Fill founder bio in DUFFEL_PITCH.md before sending

### Finance folder (Session B — separate from refueler.io repo)
- [ ] Create `/Finance/` folder on MacBook — NOT inside REFUELER.IO project folder
- [ ] Subdirectories: `/receipts/` · `/exports/` · `/ledger/` · `/reports/`
- [ ] Naming convention: `YYYY-MM-DD_vendor_amount_GBP.jpg`
- [ ] Add existing receipts: domain (£50), Costa Coffee Lakeside (£4.50)
- [ ] Private Git repo for Finance folder (no connection to refueler-io repo)
- [ ] Build Haiku watcher script: monitors `/Finance/receipts/`, extracts → `ledger.csv`

### Cloudflare R2 — finance bucket (Session C)
- [ ] Create R2 bucket: `refueler-finance` (private, not public)
- [ ] Upload receipts to R2 (free: 10 GB, 1M Class A ops, zero egress)
- [ ] Enable Analytics Engine on landing page Worker (one line)

---

## Phase 1 — Infrastructure (do this week)

### GitHub
- [ ] Create private GitHub repo: `refueler-io`
- [ ] Push entire local REFUELER.IO folder to repo
- [ ] Confirm `sw.js` is at repo root (not in a subfolder)
- [ ] Confirm `index.html` (landing page) is at repo root

### Supabase — schema
- [ ] Run `refueler_schema.sql` (base schema — if not already done)
- [ ] Run `refueler_schema_session5.sql` (orders, revenue views)
- [ ] Run `refueler_schema_session6a.sql` (stations, rail_orders, fixtures, movement_log)
- [ ] Verify all tables exist: sessions, log_entries, walk_stats, orders, stations, station_vendors, rail_orders, fixtures, rail_movement_log
- [ ] Confirm `user_profiles` table has `push_subscription` column
- [ ] Remove trailing dot from redirect URL if still present: `https://refueler.io/auth/callback` (no dot)

### Supabase — Edge Function
- [ ] Generate VAPID keys: run `npx web-push generate-vapid-keys` locally, save output
- [ ] In Supabase dashboard → Edge Functions → Secrets, add:
  - `VAPID_PUBLIC_KEY`
  - `VAPID_PRIVATE_KEY`
  - `VAPID_SUBJECT` = `mailto:rt@refueler.io`
- [ ] Deploy Edge Function: `supabase functions deploy darwin-webhook`
- [ ] Test webhook manually with a curl POST (see test command below)

```bash
# Test darwin-webhook manually (replace with your actual URL and service key)
curl -X POST https://tihgvdokeofnjxjkenmm.supabase.co/functions/v1/darwin-webhook \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "train_uid": "TEST001",
    "operator": "HJ",
    "trigger_crs": "LIM",
    "destination_crs": "FST",
    "departure_ts": "2026-05-19T10:00:00Z",
    "delay_mins": 0,
    "lead_time_mins": 4
  }'
```

### Railway.app — Darwin Bridge
- [ ] Create Railway.app account at railway.app
- [ ] New project → Deploy from GitHub → select `darwin_bridge/` subfolder (or set root dir)
- [ ] Add environment variables in Railway dashboard:
  - `DARWIN_USERNAME` — Network Rail datafeed account username
  - `DARWIN_PASSWORD` — Network Rail datafeed account password
  - `SUPABASE_WEBHOOK_URL` = `https://tihgvdokeofnjxjkenmm.supabase.co/functions/v1/darwin-webhook`
  - `SUPABASE_SERVICE_KEY` — Supabase service role key
- [ ] Register for Network Rail Open Data: https://opendata.nationalrail.co.uk/
  - Register → Data Feeds → subscribe to **Train Movements** feed
  - Credentials emailed within 1–2 working days
- [ ] Confirm Railway deployment is running (logs show `Connected to Darwin STOMP feed`)

### Cloudflare Pages
- [ ] Workers & Pages → Create application → Pages tab → Connect to Git
- [ ] Select repo, set build output to `/` (root), no build command
- [ ] First deploy completes
- [ ] Add custom domain `refueler.io` in Pages → Custom domains
- [ ] Add `www.refueler.io` as well (redirect to root)
- [ ] Confirm `https://refueler.io/sw.js` is accessible in browser
- [ ] Add Cache Rule: `/sw.js` → Bypass cache (see CLOUDFLARE_SETUP.md)

---

## Phase 2 — End-to-End Test

- [ ] Open `https://refueler.io/partner` in a tablet browser (landscape)
- [ ] Open `https://refueler.io/command` in a desktop browser
- [ ] Sign in to Command Centre with magic link → revenue tiles load once (not twice)
- [ ] Confirm Darwin status tile shows "awaiting first event"
- [ ] Manually POST a test event to darwin-webhook (curl command above)
- [ ] Confirm `rail_movement_log` gets a new row in Supabase
- [ ] Confirm Command Centre console shows the DARWIN log line
- [ ] Confirm LIM station dot pulses in the Rail card
- [ ] Register a push subscription in a test browser (requires `sw.js` live at root)
- [ ] Trigger webhook again → push notification appears on test device
- [ ] Tap notification → opens order URL
- [ ] Place a test order → appears in partner tablet queue
- [ ] Toggle order through PLACED → MAKING → READY → COLLECTED

---

## Phase 3 — Soft Launch Readiness

- [ ] Landing page (`index.html`) live at `https://refueler.io`
- [ ] `https://refueler.io/command` — Command Centre (auth-gated)
- [ ] `https://refueler.io/partner` — Partner tablet (auth or PIN-gated)
- [ ] `https://refueler.io/locate` — Customer locate/handover screen
- [ ] DMARC monitoring showing clean passes (check Email → DMARC Management)
- [ ] Supabase RLS policies confirmed (anon cannot read orders or revenue)
- [ ] Mapbox token restricted to `refueler.io` domain only (Mapbox dashboard → token scopes)
- [ ] Remove any hardcoded test data from SQL seed blocks

---

## Credentials to keep secure (never commit to GitHub)

| Credential | Where stored | Notes |
|---|---|---|
| Supabase anon key | In HTML files (OK for client-side) | Restrict with RLS |
| Supabase service role key | Railway env vars + Supabase secrets only | Never in HTML |
| VAPID private key | Supabase Edge Function secrets only | Never in HTML |
| Darwin username/password | Railway env vars only | Never in HTML |
| Mapbox token | In HTML (OK — restrict by domain in Mapbox dashboard) | |
| TfL API key | Supabase Edge Function secrets or Railway env | |

---

## Network Rail datafeed registration

URL: https://opendata.nationalrail.co.uk/
- Register for a free account
- Under **Data Feeds** → subscribe to **Train Movements** (the STOMP feed)
- Credentials arrive by email (usually same day or next working day)
- Darwin bridge needs: `DARWIN_USERNAME` and `DARWIN_PASSWORD`
- The feed is the C2C operator code `HJ` — already hardcoded in `darwin_bridge.js`
