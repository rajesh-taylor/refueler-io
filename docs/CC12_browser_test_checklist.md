# CC-12 Browser Test Checklist

Run in order. Each page: open in browser, open DevTools console (F12).

---

## 1. `command-centre.html` — Routing entry

- [ ] Page loads without console errors
- [ ] Auth gate / role selector displays correctly
- [ ] Role-based redirect fires for each role:
  - `merchant` / `franchise_branch` → `merchant-tablet.html`
  - `franchise_hq` → `franchise-dashboard.html`
  - `admin` → `dev-console.html`
  - `independent_owner` → `merchant-tablet.html`
- [ ] No `#F5820A` visible anywhere (inspect computed styles if unsure)
- [ ] Theme toggle (Carbon/Paper) works

---

## 2. `merchant-tablet.html` — Merchant / independent_owner POS

- [ ] Page loads without console errors
- [ ] Auth gate displays before session
- [ ] Magic link flow: enter `@refueler.io` email → button sends → notice appears
- [ ] After auth: role chip shows `independent_owner` (or correct role)
- [ ] QUEUE view loads and renders order cards
- [ ] OPS/QUEUE switcher toggles between views cleanly
- [ ] OPS panel: venue toggles render and respond
- [ ] Confirmation overlay appears on order action
- [ ] "Back to Queue" button returns to queue view
- [ ] No `#F5820A` anywhere
- [ ] Theme toggle works

---

## 3. `dev-console.html` — Admin telemetry

- [ ] Page loads without console errors
- [ ] Auth gate displays; auth-btn styled: outlined gold, transparent background, no orange fill
- [ ] Magic link flow fires correctly
- [ ] After auth: role chip shows `admin`
- [ ] Telemetry tiles load (may show `—` without live data — expected)
- [ ] Log filter buttons (All / Auth / Order / Geofence / Error / System) respond
- [ ] JSON import panel renders
- [ ] No `#F5820A` anywhere
- [ ] Theme toggle works

---

## 4. `franchise-dashboard.html` — Franchise HQ

- [ ] Page loads without console errors
- [ ] Auth gate displays; btn-primary styled: outlined gold, transparent background, no orange fill
- [ ] Magic link flow fires correctly
- [ ] After auth: role chip / header shows `franchise_hq`
- [ ] Dashboard panels render (may be empty without live data)
- [ ] No `#F5820A` anywhere
- [ ] Theme toggle works

---

## Console error categories to log

| Category | Notes |
|---|---|
| Supabase auth errors | Expected if no session; unexpected if page crashes |
| Missing env vars | SUPABASE_URL/ANON_KEY not injected in static file — use runtime config |
| 401 from edge functions | Expected without valid session |
| Any uncaught JS exceptions | Must be zero |

---

## Magic link email template

After pasting `magic-link-email-template.html` into Supabase:

- Dashboard → Authentication → Email Templates → Magic Link
- Subject: `Your Refueler sign-in link`
- From name: `Refueler`
- From address: `noreply@refueler.io`
- [ ] Send test to yourself
- [ ] Confirm renders correctly in email client (Carbon background, gold CTA)
- [ ] Click link → redirects to correct Command Centre page

---

## Sign-off criteria

All pages must pass before any live payment testing with Blink.
