# REFUELER — Ideas & Brainstorm Log
**Living document. Add ideas as they come. No idea too rough.**
**Last updated:** 2026-05-19
**Structure:** Raw Ideas → Considered & Scoped → Parked → Visit Notes

---

## Raw Ideas — Unprocessed
*Add new ideas below this line*

---

## Considered Ideas — Scoped to Sessions

| Idea | Session | Status |
|---|---|---|
| Field Log App (timer, observe, notes, export) | 1 | ✅ Built |
| Command Centre dashboard | 2 | ✅ Built |
| Supabase schema (sessions, log_entries, walk_stats) | 2 | ✅ Built |
| Mapbox activation | 3 | ✅ Built |
| ETA dial thresholds (green/amber/red) | 3 | ✅ Documented |
| Watch UI countdown spec | 3 | ✅ Documented |
| Brand chip system (IP-safe, not logos) | 3 | ✅ Built |
| Carbon default, Paper toggle, live map style switch | 3 | ✅ Built |
| REFUELER.IO in nav (desktop only) | 3 | ✅ Built |
| M&S store marker on map | 3 | ✅ Built |
| Stats bar + console Paper mode (off-white, dark text) | 3 | ✅ Built |
| Supabase pipeline test + RLS | 4 | ✅ Built |
| Magic link auth + client login (nav top-right) | 4 | ✅ Built |
| User profile schema (payment_preference field) | 4 | ✅ Built |
| Watch UI build (`refueler_watch.html`) | 4 | ✅ Built |
| ETA dial recalibration in Field Log App | 4 | ✅ Built |
| Black Sheep Coffee INACTIVE/PENDING state | 4 | ✅ Built |
| NFC tap handover + QR fallback (always visible) | 5 | ✅ Built |
| Battery detection: <10% → solid colour, no haptics | 5 | ✅ Built |
| Mobile-first locate screen (`refueler_locate.html`) | 5 | ✅ Built |
| Fiat users: M&S green locate. Sats users: orange. | 5 | ✅ Built |
| Crowded area mode (steady colour regardless of battery) | 5 | ✅ Built |
| Zebedee payment layer + commission routing | 5 | ✅ Built |
| Sats + GBP revenue counter (admin only, orange) | 5 | ✅ Built |
| Sats-first rewards UX, giftcard secondary | 5 | ✅ Built |
| Minibits ecash reward issuance | 5 | ✅ Built |
| Runner tip in sats (optional, direct to runner Lightning address) | 5 | ✅ Built |
| Darwin as ordering infrastructure (not rewards) | 6a | ✅ Built |
| TfL API (DLR, Elizabeth Line, Overground) | 6a | ✅ Built |
| Predictive ordering: trigger station → notification → order ready at terminus | 6a | ✅ Built |
| Coffeeshop partner tablet app (order queue, arrival countdown, foot flow) | 6a | ✅ Built |
| Football fixture API → Match Day Mode advisory for partners | 6a | ✅ Built |
| Opening hours advisory from foot flow data | 6a | ✅ Built |
| Grays/Purfleet/Upminster same-owner cluster as anchor C2C partner | 6a | ✅ Documented |
| Limehouse as trigger station → Fenchurch Street order | 6a | ✅ Built |
| Costco Bulk Verification (barcode MVP) | 7 | Planned |
| IKEA receipt QR extension | 7 | Planned |
| M&S Sparks in-store rebate | 7 | Planned |
| Retailer-agnostic schema from day one | 7 | Planned |
| CFO-ready financial model (7-tab Excel) | 9 | ✅ Built |
| Expense log with session-tagged receipts | 9 | ✅ Built |
| 12-month rolling scenario model (conservative / base / bull) | 9 | ✅ Built |
| CAC / MAC / LTV acquisition model | 9 | ✅ Built |
| Sat float + liquidity cost formula | 9 | ✅ Documented |
| Finance folder structure (separate from refueler.io repo) | 9 | Planned — Session B |
| Haiku receipt logger (watchdog + CSV append) | 9 | Planned — Session B |
| Cloudflare R2 bucket: refueler-finance (private) | 9 | Planned — Session C |
| Analytics Engine: visitor source tracking | 9 | Planned — Session C |
| Moat + defensibility document | 9 | Planned — Session D |
| FIFA World Cup 2026 England skin | 8 | Planned |
| Duffel API: flights + car hire for England fans | 8 | Planned |
| Roadtrippers: inter-match day excursion itineraries | 8 | Planned |
| Stadium geofences (US venues: Miami, NY, Atlanta) | 8 | Planned |
| US EV charging (PlugShare API, NEVI network) | 8 | Planned |
| O2 Greenwich: car park EV bays + Levy Restaurants | 8 | Planned |
| TfL DLR: North Greenwich trigger for O2 pre-orders | 8 | Planned |

---

## Parked Ideas — Interesting, Not Yet Actionable

**Corporate B2B ordering:**
A PA or office manager orders 12 coffees for a 9am meeting, triggered by a calendar event or train departure. Group order feature + business account tier. High revenue per transaction. Session 9+.

**NHS / Hospital staff:**
Large hospitals near C2C (Basildon Hospital etc.). Staff with specific 15-minute break windows, high repeat frequency, strong loyalty if the app works. Reliable revenue, not glamorous. Session 9+.

**Crossrail / Elizabeth Line multi-stop ordering:**
Order at Paddington, collect at Liverpool Street (10 minutes). Cross-line ordering paradigm. Requires TfL real-time data and destination station partner. Session 9+.

**Fountain podcast sponsorship:**
Fountain users (Bitcoin-native podcast listeners) as a marketing channel. Sponsor copy: "Earn sats redeemable for coffee at EV charging bays." Low cost, high brand fit. Not a payment processor — a customer acquisition channel. Marketing budget decision, Session 9+.

**Stadium partnerships — wider UK:**
Chelsea (District Line), Crystal Palace (Overground), Brentford (South Western Railway). Each has a catchment line with identifiable match day flows. Long-term "Stadium Mode" feature across UK football. Session 9+.

**International expansion:**
The EV + coffee model works anywhere with Supercharger density and café culture. Amsterdam, Oslo, Berlin — high EV adoption, Bitcoin-friendly, dense rail. Year 2 investor conversation.

**Duffel + future tournaments:**
Euro 2028 (UK-hosted), Women's World Cup, Champions League finals. The England skin system generalises to any national team for any tournament. Architecture is theme-key based.

**Carriage exit prediction:**
Darwin + train formation data → predict which carriages passengers exit from at terminus → runner meets them at the right point on the platform. Reduces handover time by 30–60 seconds. Data science layer, Session 9+.

**Southend United / lower league clubs:**
Less glamorous than Premier League but highly loyal fanbase, C2C line direct. Could be the first football club partnership — easier to approach than West Ham, similar route.

---

## Decisions Locked — Do Not Revisit

| Decision | Locked in |
|---|---|
| No Transit Mining (sats for travelling) | Session 3 discussion |
| Darwin/TfL = ordering infrastructure only, not rewards | Session 3 discussion |
| Sats earned by buying only, never by passive behaviour | Session 3 discussion |
| Carbon is default, Paper is toggle only | Session 2 |
| M&S Café is primary partner | Session 1 |
| Investor Stat: 4:22 | Session 1 |
| NFC = primary handover, QR = fallback always visible | Session 3 discussion |
| Mobile = primary locate surface, Watch = secondary countdown | Session 3 discussion |
| Battery <10%: solid colour, no flash, no haptics, wave message | Session 3 discussion |
| Fiat users: M&S green locate. Sats users: Bitcoin orange | Session 3 discussion |
| Brand chips not logos (IP-safe) | Session 2 |
| JSON export shape locked | Session 2 |
| West-side Lakeside vendors are Tier 2 | Session 1 |
| Bus station delivery not primary use case | Session 1 |
| Zebedee MVP → Zeus Phase 2 → Minibits rewards layer | Session 5 plan |
| Darwin STOMP bridge on Railway.app (not inside Supabase) | Session 6a |
| Web Push via VAPID, sw.js at repo root | Session 6a |
| Cloudflare Pages for hosting (not Netlify) | Session 6a infrastructure |
| Block AI training bots on all pages | Session 6a infrastructure |
| DMARC p=none monitoring → escalate to p=reject after clean data | Session 6a infrastructure |
| sw.js served from https://refueler.io/sw.js (repo root) | Session 6a infrastructure |
| Merchants named by session number: M01 M&S Café (S1), M02 Black Sheep (S4), M03 C2C cluster (S6a), M08 Duffel travel | Session 9 |
| Financial model lives outside refueler.io repo — never on GitHub | Session 9 |
| Excel (.xlsx) locally on MacBook — not Google Sheets | Session 9 |
| Investor share = PDF of Tab 7 only unless raw workbook explicitly requested | Session 9 |

---

## Visit Notes — Ideas Captured In The Field

**Lakeside Visit 1 (2026-05-16):**
- M&S Café map chip needs re-pinning — currently near TGI Fridays, should be Level 2 near bus station
- Black Sheep Coffee not yet open
- Zebra crossing is primary ETA variable — peak adds ~1:30
- 5 staff at M&S Café at 2:40pm, 60 seats at Costa Level 2

**Central London trip (2026-05-17) — observation checklist:**
- [ ] Fenchurch Street: Costa/Pret queue length at various times. Where exactly are they on Level 2 / platform level?
- [ ] Which end of the train do most passengers exit at Fenchurch Street? (Platform layout observation)
- [ ] Limehouse: confirm no coffeeshop. Confirm it's a viable trigger station (platform layout, dwell time).
- [ ] O2 Greenwich area: which restaurants are outside the AEG exclusivity zone on Greenwich Peninsula?
- [ ] Any independent coffeeshops near City stations (Cannon Street, Fenchurch Street, Liverpool Street) worth noting?
- [ ] Elizabeth Line: observe passenger behaviour at interchange points (Liverpool Street, Paddington)
- [ ] Canary Wharf DLR: foot flow observation, any Refueler-viable venues in the station or immediate surroundings?
- [ ] Note any EV charging in central London car parks (for future non-retail-park activation)
- [ ] Grays/Purfleet if passing through: observe coffeeshop, note if owner is present

**Visit 2 — Lakeside (date TBC):**
- Re-pin M&S Café coordinates (Apple Maps long-press at till/pickup point, not GPS)
- Pin all Tier 1 vendor coordinates at till/pickup point
- Pin Black Sheep Coffee when open
- Bay 4 EV connectivity speed test
- Evening lighting check
- Zebra crossing peak-time data (observe 08:00–09:30)

**Pre-Session 7 — Costco Lakeside (book this week):**
- Capture store number from a live receipt
- Test barcode scan on iPhone (test zxing-js before session — known iOS Safari quirks)
- Note if Costco membership card is physical card or digital app QR

## Ecosystem — wallets to watch"
- They're a potential integration partner (accept Kute wallet payments at Refueler vendors). Incubated by Antidote. Make money by charging fee's when a user send Solana, possibly others using partnerships and affiliates, and charge fee's when making a bet/predictin on Polymarket. Not charging fee's on sending or recieving of bitcoin.
