# REFUELER — Project DNA
**Version:** v2.0 — Compiled 2026-05-16. Supersedes all previous versions.
**Domain:** refueler.io | **Stack:** React Native (Expo) | **Stage:** Alpha / Field Validation

---

## 1. Vision & Strategy

**Mission:** REFUEL is the Visual Intelligence Layer for the connected vehicle economy — eliminating the Friction of Movement by turning refueling into a high-utility event: Destination Optimization for the retail shopper, Tax Compliance for the tradesman, Rental Returns for the traveler, and Energy Arbitrage for the resident host.

**Core Identity:** World's first Lightning-Powered Energy Optimiser and Bitcoin-as-a-Service (BaaS) layer for drivers and enterprise retail.

**Tagline:** "Don't just drive. REFUEL."

**The Three-Market Engine:**
- **B2B (The Diplomat):** BaaS for fleet managers and site owners — Tax/VAT automation and Congestion Cooling.
- **B2C (The Resident):** Energy Arbitrage for home-hosts. Turning the driveway into a revenue node.
- **B2C (The Commuter/Traveler):** Destination Optimization for road-trips and daily high-mileage residents. Strategic alignment: Roadtrippers (discovery), Duffel (rental), Commuter Pass-By logic.

**The Circular Loop:** Arbitrage (find the money via price intelligence) → Accumulate (earn Fiat or Sats-Back) → Activate (stream value via Fountain V4V).

**Market Thesis (May 2026):** Fuel markets at 4-year highs (~£1.50/L UK | ~$3.50/gal US). REFUEL provides a critical financial buffer. Transitioning drivers from passive consumption to dynamic engagement.

**Strategic B2B Partners:**
- Wholesale/Retail (Costco): Queue-Busting predictive data + automated HMRC invoicing.
- Infrastructure (EV Networks/ChargePoints): Unified Aggregator solving Cable Anxiety.
- Hospitality (Independent Cafés, Plush Pubs): Token Givers capturing high-intent foot traffic via the Satoshi Path.

**B2B White-Label Value Prop:**
- Throughput Optimization: Convert Price Seekers into Pace Seekers via Peak→Off-Peak demand shifting.
- Frictionless Compliance: HMRC-compliant digital invoicing (MTD 2026) — the Compliance Hub.
- Retention Arbitrage: Loyalty in a global digital asset (Sats) that feels like a Savings Account, not an expiring coupon.

**International Reward Moat:** Satoshis are borderless — they travel home with the user, eliminating friction of expiring foreign loyalty currency. Ecosystem partners (e.g., Fountain) receive 20–30% higher payouts to drive creator-led acquisition.

---

## 2. Visual Identity & Palette

**Luxury Aesthetic (Horology/Breguet) — Watch faces and premium Static views:**
- Palette: #FFFDD0 (Cream/Milk), #7097BB (Slate Blue)
- Accents: #B8D8BA (Sage Green), #F7CFD1 (Champagne Pink)
- Style: Breguet hands (#000080 Navy), Roman numerals (must be serif), Guilloché SVG patterns

**Digital Interface (Active Dashboard — CarPlay, Mobile Home, Savings UI):**
- Satoshi Mode: International Orange (#F7931A) on Charcoal Grey (#121212)
- Cashback Mode: Electric Cobalt (#2E5BFF) on Charcoal Grey (#121212)
- Style: HUD Glassmorphism, default Dark Mode, sweeping mechanical hands (no jumping digits)

**Contextual Mode Palettes:**
- Resident/Savings: Electric Green
- Diplomat/Alerts: International Orange
- Station Master/Yield: Cyber Purple
- Lakeside/Retail Mode: Lakeside Teal (#008080) + lifestyle iconography (Shopping Bags/Coffee)
- Tradesman (Mode C): Safety Orange (#FF5F00) hazards, Accounting Blue (#0047AB) VAT data

**Sovereign Color States:** Satoshi Mode = #F7931A · Cashback Mode = #2E5BFF. Watch dial syncs color state with mobile app in real time via WCSession.

**Watch Face Materials:** Deep blacks, brushed titanium textures. Sub-Dial 3 (Bitcoin) pulses when a reward session is active. Sub-dials sweep mechanically — never jump.

**Voice & Tone:** Luxury automotive register (Mercedes/Breguet), not a gas-savings app. Use sophisticated language: "Operational Alpha," "Tactical Engagement," "Liquidating Friction." Always use "Satoshis" as unit of account.

---

## 3. Core Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native (Expo) with CarPlay-native integration |
| Visuals | `react-native-svg` (SVG `<Pattern>` for Guilloché) |
| Motion | `react-native-reanimated` + `expo-haptics` (mechanical tick sync) |
| Financials | LDK (Lightning Dev Kit) — Sats splits + automated micro-payments |
| Database | PostgreSQL — secure loyalty token storage |
| Watch/Car sync | `WatchConnectivity` / `WCSession` ("Flick to Car" data transfer) |
| CarPlay | `CPStationCharging`, `CPFueling` entitlements; `WidgetKit`, `ClockKit` |
| Auth | `LocalAuthentication` (FaceID/TouchID) — Secure Enclave only, no passcode fallback |
| OCR | Live Camera Only — EXIF metadata cross-referenced for location sync |
| Field logging | Supabase (PostgreSQL) — sessions, log_entries, walk_stats tables |
| Command Centre | Standalone HTML dashboard — Light (Paper) default, Dark (Carbon) toggle |
| Field Log App | Mobile HTML — timer buttons, voice transcription, JSON/MD export |

---

## 4. Security & Verification Protocols

**Triple-Verification (Proof-of-Refuel) — mandatory before any payout:**
1. GPS Geofence: 3-min Dwell at station
2. Telemetry: 10% fuel level increase (or BMS/OBD-II confirmation)
3. Exit Vector: 15mph movement away from station

**Sats Switch (Biometric Ignition):** FaceID/TouchID via `LocalAuthentication`. Transaction authorization signed within Secure Enclave. Heavy haptic "Click" via `impactOccurred` simulates physical automotive relay. No passcode fallback for Pro users.

**OCR Verification:** Receipt data (Merchant/Time/Price) must match GPS and app-suggested pricing within 15-minute window. Unique SHA-256 hash (Merchant + Date + Total) prevents double-scanning. Gallery uploads disabled — live camera only with EXIF location check.

**Anti-Fraud:** Never trigger payout without full Triple-Verification. Fiat-First rewards undergo same Triple-Verification before QR provisioning.

**Passive-Watch Rule:** Watch interaction disabled during active refueling. Watch remains in Static/Passive state for UK safety compliance. App triggers Locked/Black Screen state during nozzle-lift with 30-second Auto-Auth logic.

---

## 5. Logic & Integration Rules

**CarPlay Alert Triggers (CDAE — CarPlay Dynamic Alerting Engine):**
- 25% Fuel: "Value Finder" — top 3 cheapest within 10 miles
- 15% Fuel: "Urgent Diversion" — absolute cheapest/nearest partner
- Detour buffer: max 3 mins or 1.5 miles added to active route
- Rental Mode: active within 15 miles of Top 10 London Hubs (geofenced)

**Reward Delivery Logic (Fiat-First):**
- Non-crypto users: immediate QR/Barcode delivery (Station Credit, Traveler Perks)
- Duffel Handshake: automated car rental rebates via Duffel API post-refuel
- CPAlertTemplate: "View Voucher" action for immediate in-car scanning
- Watch Complications: Loyalty Loop sub-dials for scannable reward barcodes

**Reward Nudge Strategy:**
- Present Bitcoin rewards at 10–20% higher perceived value than Fiat to nudge toward Digital Gold track
- Loss Aversion: UI frames Satoshi reward as standard; Fiat as "Partial Claim"
- First Satoshi selection triggers Sats Switch biometric initialization automatically
- Combo Breaker: automate Payment + Loyalty merge into single UI element — 100% point capture

**Lightning Network:**
- Payout trigger: GPS Exit Geofence (>100m from station) — must be < 2 seconds settlement
- LSP: OpenNode/Breez for liquidity. Scale to proprietary routing node for fee capture.
- Dynamic Split: all LDK distributions peg reward values to £1.00 GBP to insulate from BTC volatility
- LNURL-withdraw / Lightning Addresses supported for Advanced Mode (non-custodial)
- Watch "Orange Dial" performs real-time spin/increment animation upon Lightning settlement

**Overstay Bounty:** 5-min countdown reward (500 Sats) for EV departure post-80% charge. BMS sync calculates real Shopping Time intervals.

**HVT Scoring Algorithm:** 60% Price / 40% Traffic Delay. Suggested stations must not add >5 mins total travel time. Elite segment: 5-min data refresh. Standard: 30-min.

**Costco B2B Logic:** Queue-Buster predictive dwell alerts. HMRC-compliant digital invoice generation for Trade members. Avoid crypto terminology in B2B specs.

**Inter-Partner Redirect:** Magnet Map logic detects infrastructure gaps (e.g., no-EV Costco) and redirects traffic to active partner hubs (e.g., Lakeside Car Park G).

**Backend:**
- PostgreSQL for loyalty token storage
- Middleware aggregation of bp pulse, GRIDSERVE, Pod Point — REFUEL as Universal Key
- CLO detection: passive MCC 5542 webhook transaction detection; real-time Arbitrage Delta calculation without retailer POS access
- Zero-Touch Card-Linked Offer (CLO) for enterprise pilots — no Day-1 POS/hardware modifications

---

## 6. Mode Protocols

### Mode B: The Resident (Daily Driver)
- Detour Buffer: max 3 min / 1.5 miles on active route
- Price Prediction: "Fill Up Now" alert if regional prices rise 3 consecutive days
- OBD-II: optional Bluetooth link for 100% fuel level accuracy
- Apple Wallet: auto-push loyalty cards (Nectar/Clubcard) on geofence arrival
- Legacy Path: OCR Receipt Scan + Blue "Cashback" Dial for non-Sats users
- Habit-Breaker: "Flash Opportunity" alerts with Cash vs. Time comparisons (e.g., £4.20 Saved / +3 mins)
- Post-Refuel: Smart Rerouting for immediate return-journey value

### Mode C: The Tradesman (Industrial Protocol)
- Vehicle Intelligence: DVLA/SMMT Reg API auto-fetches dimensions. Clearance Engine filters by canopy height (>2.6m for Transits) and turning circle. Van-Friendly OSM routing.
- Tax Shield: Automated VAT extraction (£ total ÷ 6). Direct Xero/QuickBooks injection on GPS Exit Geofence. "Clean" vs "⚠️ Review" dashboard.
- UI: Safety Orange (#FF5F00) hazards / Accounting Blue (#0047AB) VAT. JetBrains Mono typography. 64pt minimum touch targets for gloved use.
- Dual-Pay Switch: "Personal Debit" vs "Fleet/Allstar Card" for HMRC-compliant reporting.
- HMRC MTD 2026: Compliance Hub positioning. Strict no-crypto language in B2B comms.

### Mode D: The Diplomat (Corporate Shield)
- MANDATORY Fiat-only reporting by default. Bitcoin/Satoshi mechanics abstracted behind "Ecosystem Rewards" or "Digital Credit" unless crypto-fluency is confirmed.
- Congestion Cooling: >85% occupancy triggers "Cooldown" state — lowers landlord payout cost while protecting site logistics.
- Yield: Focus on Attach Rate (% of drivers spending in tenant stores).
- Dynamic Pricing narratives explain reward fluctuations as Supply and Demand Management.
- Rental Return Protection: "Safety Net" guidance for Full-to-Full policy compliance. GPS/Fuel/Time "Return Certificate" protects against rental agency disputes.
- Diplomat Mode: real-time Gallon-to-Litre and USD-to-GBP conversions with "Tourist Trap" indicators.

---

## 7. Lakeside — Active Test Site (Updated Post-Visit 1, May 2026)

**Active EV charging:** Tesla Superchargers, Car Park G — 16 V3 bays, CCS compatible. All other bays shown on Google/Apple Maps are inactive or removed. Confirmed May 2026.

**Primary Partner: M&S Café, Level 2** ← updated. Costa (inside Next) demoted to Tier 2 (west-side, lake routing barrier).

**Investor Stat:** Queue 0:20 + Production 1:30 + Walk 2:32 = **4:22 total** (join-queue → drink at Bay 1A, off-peak crossing).

**Geofence:** Centre 51.489452°N, 0.286680°E · Outer 15m (cluster) · Inner 5m (single bay).

**Zebra crossing:** Primary ETA variable. Off-peak: +0:15. Peak: +1:30. Total ETA range Bay 4D: 2:47–4:42.

**Coffeeshop tiers:**
- Tier 1 (east side, viable): M&S Café L2, Costa L2 (near M&S), Café Nero L1, Pret L1, Greggs L2, Black Sheep Coffee L1 (opening soon — flag for partner outreach)
- Tier 2 (west side, lake barrier): Costa/Next, Starbucks, Greggs/Next, Pret/Next
- Tier 3 (perimeter/separate geofence): Tim Hortons, McDonald's (4 InstaVolt bays), IKEA (1 Gridserve bay)

**Runner Logic — confirmed field data:**
- Bay 4D → M&S Café: 3:12 (off-peak) / ~4:52 (peak crossing)
- Bay 1A → M&S Café: 2:32
- M&S Café → Bay 4D: 3:12
- M&S Café → furthest bus station bay: 3:10
- "Bumper" metric: standardise End of Mission as physical touch of vehicle bumper, not geofence entry

**Wizard of Oz protocol (no need to buy coffees):**
1. Record real customer order times in-store (Queue/Production/Handover timers)
2. Separately record walk times (route timer buttons)
3. Total = queue + production + walk. Apply conditions tags to flag variables.

**Thermal Integrity:** Target arrival temperature 58°C. Use simulation walk time to justify "Freshness Guarantee" in pitch materials.

**Simulation Protocol — Prep/Walk Ratio:**
- Positive Slack: Walk > Prep (+60s to +120s for handover prep) = desired
- System Failure: Walk < Prep = automated delay needed in "Out for Delivery" notification

**Temperature Guardrail:** If brisk walk > 5 mins, UI must flag "Delivery Heat Loss" risk.

**The "Costco Bridge":** App calculates "Queue Wait (Costco)" vs "Walk + Reward Time (Lakeside)." If Costco Wait > Lakeside Walk → high-priority Nudge notification.

**Customer Segmentation:**
- "The Prisoners": charging but not leaving vehicle. Target with "Walk & Earn" Satoshi prompts.
- "The Walkers": existing high-value users. Target with Runner tray viability alerts.

---

## 8. Field Tooling (Session Status)

**Field Log App** ✅ Session 1 complete — mobile HTML, white background, voice transcription (Web Speech API, en-GB), route timer buttons, abort/void, JSON + Markdown export. Bottom tabs: Timer / Observe / Notes / Log / Export.

**Command Centre** ✅ Session 2 complete — standalone HTML dashboard. Light (Paper) default / Dark (Carbon) toggle. Boot telemetry sequence, Verify Dial (dashed → solid green), partner card with live Supabase walk_stats, JSON import via drag-drop, Mapbox ready (commented out, token needed).

**Supabase schema** ✅ Session 2 complete — `sessions`, `log_entries`, `walk_stats` + auto-update trigger. Run `refueler_schema.sql` in Supabase SQL Editor.

**Session 3 scope:** Mapbox activation guide, ETA dial threshold spec, Watch UI "shopping time remaining" countdown logic.

**Expo Timer App** — React Native / Expo Go. Stable on device. State machine: SPLASH → HUB → MENU → CHECKOUT → PAYMENT → CHRONOGRAPH. 30-second refund window. Pre-order and evening discount logic (>19:00). Light/Dark toggle in NavBar. `react-native-svg` installed for Chronograph Dial. `index.tsx` ~1,129 lines (modularisation needed).

**Key field data files:**
- `field_log_app_spec_v1_3.md` — Lakeside walk times, geofence, partner tiers, Supabase schema, Session 3 scope
- `lakeside_audit.md` — full site audit with route timings and observations
- `ad_hoc_ev_sites_visit1.md` — IKEA, McDonald's, B&Q, mer charger notes

---

## 9. Revenue & Unit Economics

**Revenue Streams:**
- B2C Power User: £1.99–£4.99/mo (CarPlay alerts, Price Trend Predictions, Tax-Ready export)
- B2B Pro SaaS: £2.99/mo (Digital Glovebox, OCR, Van-Height routing)
- Conquesting Fees: £0.50 per lead from supermarket diversion
- Station Master Rake: 12% on peer-to-peer driveway charging sessions
- Lightning Network Routing Yield: micro-fees as proprietary node scales
- Traveler Trip Pass: £2.99/£7.99 short-term for international visitors

**Unit Economics (per 50L fill-up):**

| Component | Fiat Path | Bitcoin Nudge |
|---|---|---|
| Gross Fee | £2.50 | £2.50 |
| User Reward | (£0.50) | (£1.00) |
| Partner Share | (£0.50) | (£0.75) |
| Net Margin | **£1.50** | **£0.75** |

Higher Satoshi reward drives 20% higher retention at lower network fees (~2% vs ~8% fiat).

**Operational Constraints:**
- 210 daily diversions = 100% operational sustainability target
- Minimum £1.50 net contribution per 50L fill-up — all reward nudges calculated against this
- Monthly operational overhead target: below £500
- 1.2x reward-to-consumption sustainability ratio (diversion time vs reward value)

**Commercial Logic:** Every £7.50 saved (15p/L on 50L) split: User 85% / Partner 7–10% / Platform 3–5% + routing dust.

**Sats Pricing:** Display rewards as whole-number Satoshis. 1,500 Sats = primary unit of account. Target 10 sats/minute V4V engagement.

---

## 10. Partnerships & Scaling

**Triple-Win Partners:** Roadtrippers (5M+ users, "Value Finder" API hooks) · Fountain (LDK node, V4V creator streaming) · Duffel (rental API, traveler capture at booking).

**Strategic Moat:** Exclusive "UK Local Expert" layer for Roadtrippers, bridging their 38M+ US members to UK energy market via Duffel API.

**V4V Media Funnel:** 100% of audience tips bypass REFUEL → go directly to artists via Fountain. REFUEL positioned as Pure Funnel for Lightning ecosystem entry. "Sats-to-Stout": partnerships with plush pubs for V4V live sessions.

**Exit Strategy:**
- Phase 1 (UK Alpha): Prove Supermarket Diversion + V4V model. Partners: Sainsbury's, Morrisons, Fountain.
- Phase 2 (US Growth): Launch via Duffel for UK travelers in the US. Target: Wawa, Sheetz, Global Partners.
- Phase 3 (USA National): Full Connected Car integration. Target: ExxonMobil, 7-Eleven, GasBuddy.
- Exit Profile: Acquisition by Energy Giants (Shell/BP) or Travel Platforms (Expedia/TripAdvisor).

**US Scaling:** 158M monthly US podcast listeners. Universal Sats-Back scaling to 65,000+ US gas station companies. Real-time $/Gal data feeds.

**Notting Hill Pilot (High-Margin Luxury Vertical):**
- Target luxury bundles (£125–£600+): Fortnum & Mason hampers, "Royal Picnic" logistics
- Affiliate: 5–10% on high-ticket items · Concierge Fee: £45 flat · SaaS POS via Square/Shopify
- 3-month high-season activation. Success metric: 500+ bookings via 5 Plush Pub hubs.

---

## 11. Marketing & Growth

**Phase 1 — Trade-Counter Funnel:**
- Zero-LinkedIn policy. Focus on physical Trade Hub proximity (B&Q, Screwfix, Toolstation).
- Geofence Conquesting: B&Q/Screwfix entry triggers "Trade-Counter Alert: Bay 4 (Lakeside) open. 10min diversion = 5hrs streaming + VAT automation."
- Referral: "Refer a Mate" bonus for Mode C (Tradesman).
- CAC must stay below £1.50 net margin — high-intent geofencing over broad SEO/social spend.

**The "B&Q" Hook:** Position Lakeside Car Park G as the "Executive Lounge" for tradesmen waiting on orders.

**The Four-Way Friction (Market Problems):**
1. Local Premium: Mass consumers losing £300/yr to information overload and habitual high-price filling.
2. The Rental Trap: International travelers facing Refueling Anxiety and 20–30% hub premiums.
3. The Compliance Gap: 4.6M UK tradesmen facing HMRC MTD 2026 mandates. Existing apps ignore van height/clearance.
4. Cable Anxiety: 40% of London residents in terraced housing forced into 80p/kWh public rates.

**Web Platform:** National Fuel Map (SEO + price authority) + Personal Expenditure Portal (heatmaps, tax export). Primary domain: refueler.io.

**App Clip Strategy:** QR/NFC triggered iOS App Clips for Tier-3 universal access — zero-download flow with instant Apple Pay auth.

**Zero-Anxiety Mall Branding:** "Don't let the car park dictate the shopping trip." / "Turning 'Waiting for a Charge' into 'Time for Lunch'." / "The Digital Valet that clears your bays automatically."

---

## 12. Dev Protocols (Claude-Specific)

- **Plan Mode First:** Output a `[PLAN]` block for any SVG coordinate math before coding.
- **Typography:** Roman numerals must be serif. Data displays must be sharp sans-serif (SF Pro).
- **CarPlay Standard:** All interactions must adhere to Apple Human Interface Guidelines for CarPlay. Prioritize scannability and high-contrast HUD elements.
- **Golden Path Priority:** Focus all initial prototypes on the 30-second frictionless flow (Trigger → Action → Payoff). Strictly deprioritize settings/auth menus during Alpha.
- **Mobile UI:** Large touch targets (min 44px standard, 64pt for Mode C gloved use). "Sovereign Toggle" = swipe to switch Satoshi/Cashback views. Toggle must immediately sync WCSession Watch color state.
- **Live Activity:** iOS Dynamic Island and Live Activities for persistent Pit Stop and Valet state tracking.
- **Hero Card:** Contextual top-50% component swaps based on geofence state (Radar → QR → Timer → Graph).
- **Field tooling:** Light mode default for outdoor legibility. Supabase REST for data. JSON export shape defined in `field_log_app_spec_v1_3.md`.

---

## 13. Sprint Roadmap

| Sprint | Focus | Status |
|---|---|---|
| Field Validation | Field Log App + Command Centre (Lakeside) | ✅ Sessions 1 & 2 complete |
| Session 3 | Mapbox, ETA dial thresholds, Watch UI spec | 🔲 Next |
| Sprint 1 | ChronographFace (Watch Ultra Style) + DashboardQR (CarPlay) | 🔲 |
| Sprint 2 | Sats Switch Biometric Ignition (FaceID/SecureStore) | 🔲 |
| Sprint 3 | V4V Merchant/Artist Funnel (Fountain LSP integration) | 🔲 |
| Sprint 4 | Merchant ROI Dashboard (Sats-to-Stout analytics) | 🔲 |
| M1–M2 | API Foundation + Human API validation (5 test users) | 🔲 |
| M3–M4 | CarPlay/Watch integration + London Beta (100 Power Users) | 🔲 |
| M5–M6 | Duffel Handshake + B2B Pilot (Supermarket Lead-Gen) | 🔲 |

---

## 14. Project File Structure

```
/01_Prototypes      — React Native & HTML/CSS UI components
  functional_specs.md       (Daily Driver logic, Triple-Verification)
  ui_animation_specs.md     (Sats Switch mechanical + haptic logic)
/02_B2C_Markets     — Consumer strategy: Notting Hill, Essex, USA
  tourist_journey_narrative.md  (500-mile Satoshi case study)
/03_B2B_Partnerships
  merchant_roi_logic.md     (Sats-to-Stout analytics, Conquest logic)
  triple_win_strategy.md    (Roadtrippers, Fountain, Duffel)
  partner_attribution.py    (Postbacks: Sainsbury's/Morrisons)
/04_Media_Assets    — Visual concepts, wireframes, branding
  branding_guide.md         (Luxury horology palette, B2B state colors)
  photography_creative_brief.md
  pitch_deck_narrative.md
/05_Field_Notes     — Physical site audit logs and photos
/06_Benchmarks      — Timing validation, V4V ecosystem analysis
  revenue_engine_specs.md   (Unit economics, LDK efficiency math)
```
