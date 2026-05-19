# Field Audit: Lakeside (Retail / EV Hub)
**Site:** Lakeside Shopping Centre, Car Park G — EV Charging Cluster and report on other charging cluster
**Version:** v1.2 — Coordinate capture fields added (Google Maps using Sun Seeker)
---

## Audit Objectives (This Visit)

1. **Timer App — Design Flow Validation:** Capture the real-world timing data that drives the Costa Coffee runner timer logic (order-placed → drink-in-hand → delivered to bay).
2. **EV Bay Survey:** Physical, connectivity, and UX data from Car Park G Bay 4 to inform Command Centre geofence logic.
3. **Route Profiling:** Walk and time the Marks & Spencer (M&S) → Bay 4 runner route in both directions.
4. **Wizard of Oz Simulation:** Full end-to-end timed run to calculate the "Investor Stat" transit figure.
5. **Coordinate Capture:** Google Maps (using Sun Seeker app) at Bay 4 and key route points.
---

## 1. Costa Coffee (Inside Next Store 2nd Fl) — Timer App Flow Audit

### 1a. Order Flow Observation
Walk through a full order end-to-end. Time each stage separately.

| Stage | Target | Measured |
| Queue wait (join queue → order placed) | Baseline | 0:20 mins |
| Production time (order placed → name called) | Baseline | 1:30 mins |
| Handover friction (name called → drink in hand) | < 30 secs | 0.10 secs |
| **Total "Coffee Gap"** | < 8 mins | 2:00 mins |
> **Timer App Trigger:** If Total Coffee Gap > 8 mins → flag "Parking Overstay" risk in Watch UI.

### 1b. The Handover Zone
- [ ] Is there a dedicated mobile order collection shelf? [Y] Yes
- [ ] Location of shelf/handover point: Counter right [Y] Separate shelf
- [ ] Can a Runner wait without obstructing counter flow? [Y] Yes
- [ ] Is verbal confirmation required with staff to collect, or silent self-service? [Y] Verbal
- Notes: About 100 setas and 26 tables, moix of table of and table 4. Chair very comfaortable, layout is paced out. Power pug sockets for around 50% of tables. 

### 1c. The "Final 10 Yards" — Wayfinding
- [ ] Line-of-sight to counter from entrance: Clear [Y] Yes
- [ ] Is the collection shelf visible immediately on entry? [N] No
- [ ] Noise level (relevant for Watch haptic vs. visual alert): [Y] Yes
- [ ] Screen glare issues at handover point (relevant for QR scan): [N] No
- Notes: The till area is at the back of the coffeeshop, on the shelf next to serving stations. The Next instore music, though not loud, may haptics definitely needed at this location. 

### 1d. Connectivity (Costa Interior)
- [ ] Public Wi-Fi available: [Y] Yes
- [ ] Network name: Next-Guest
- [ ] Login splash page required: [N] No
- [ ] Speed test result (seating area): 6.07 Mbps down / 1.94 Mbps up
- [ ] Signal type in seating area:[Y] 5G Yes [Y] Wi-Fi only Yes

### 1e. Staff & Kitchen Metrics
- [ ] Queue Latency (avg): 0.20 mins. Threshold: >5 mins = High Risk flag in Command Centre.
- [ ] Production Speed (order to handover): 1.37 mins.
- [ ] Staff count observed during visit: 2
- [ ] Estimated peak shift change time: Don't know (feeds Command Centre staffing update logic)
- [ ] Is there a "Quick-Grab" shelf for pre-confirmed orders? [N] No
---

## 2. The Runner Route — Costa (Next) → Car Park G (Bay 4)

### 2a. Walk Timing

| Pace | Direction | Time | Notes |
|---|---|---|---|
| Normal | Costa → Bay 4 | ___:___ | |
| Brisk | Costa → Bay 4 | ___:___ | |
| Normal | Bay 4 → Costa | ___:___ | (Runner return) |

- **Target Normal:** < 5:00
- **Target Brisk:** < 3:30

### 2b. Route Obstacles
- [ ] Kerbs requiring step-up/down (tray viability risk): [Y] None
- [ ] Stairs on route: [Y] Yes. Location: No stairs to outdoor entry, but Next store has 2 levels, This Costa inside Next is on the 2nd floor, same level to get to adjacent multi-storey car parks and uncovered outdoor car parks and en- route coffeeshop to train station.
- [ ] Covered/dry path available (rainy day route): [N] No
- [ ] Alternative dry route: From iside the store into multi storey through other store exits.
- [ ] Pinch points / pedestrian flow bottlenecks: No, store very sparse.
- [ ] Any locked gates, barriers, or restricted zones on route: [N] No

### 2c. The Handoff Point Car Park G (Note, upon site visit found Car Parks have been re-named) G is closer to Marks & Spencer.
- [ ] Is Bay 4 clearly numbered/signed? [N] No (One sign elevated on major lampost, but on sat nav instructions under Tesla Charging Station)
- [ ] Natural meeting point at car: [N] No (car park is well away from shopping centre, about 5 minutes gentle walk from Marks & Spencer)
- [ ] Flat surface near charger for placing a drink safely: [N] No
- [ ] Car Park G visible from path before reaching it: [N] No (not clear view of bay, have to walk through a car park, cross zebra crossing and into cra park G)
- [ ] Distance from main path to Car Park G: 805 metres (approx)
---

## 3. EV Charging Bay (Car Park G) — Command Centre Data

### 3a. Physical Layout
- [ ] Total EV bays in cluster: 16
- [ ] Tesla-specific bays: No  Universal bays: Yes (as of May 2026)
- [ ] Bay 4 confirmed location: Yes
- [ ] Charger unit brand/operator: Tesla
- [ ] Charger screen: None
- [ ] QR code currently on charger: [N] No
- [ ] Flat eye-level surface available for Refueler QR/sticker: [Y] Yes
- [ ] Existing "while you charge" signage: [N] No. Notes: No signage or stickers (see attached tesla charger image.)

### 3b. Coordinate Capture — Bay 4 (Primary Geofence Centre)

**Step 1 — Sun Seeker Compass (Ground Truth)**

```
Sun Seeker (using Google Maps) coordinates (decimal degrees):
Middle of 16 bays
  Latitude:  51.489452 N
  Longitude: 0.286680 E
  Captured at: 6:04pm (time)
  Stability: [N] Stable [Y] Fluctuating (re-check if fluctuating)
```

**Step 3 — Deviation Check**

**Command Centre Geofence Settings (to be set on build):**
```
Centre point:  Compass latitude / longitude above
Initial radius: 15 metres (bay cluster)
Tight radius: 5 metres (single bay trigger)

15 metre radius would encompass bay cluster, 16 bays in total.

### 3c. Connectivity at the Bay
- [ ] Speed test at Bay 4: _____ Mbps down / _____ Mbps up (To be check on future visit)
- [ ] Signal type: [Y] Yes, 5G
- [ ] Meets 10Mbps OCR/LDK Sync target: To be checked on future visit.

### 3d. Physical Environment
- [ ] Shelter at bay: [N] Full [N] Partial [Y] None
- [ ] Lighting quality (day): [Y] Y, trees planted behind charging station block daytime glare in Sun is visible.
- [ ] Lighting quality (evening/night): [ ] Good [ ] Poor [ ] Dark
- [ ] EVs observed "hogging" (100% charged, still plugged in): [Y] Yes Count: 2
- [ ] Costco queue visible from Bay 4: [N] No
- [ ] Costco queue visible from main road: [N] No

### 3e. "Mode C" Vehicle Observation (B&Q / Screwfix)
- [ ] Vans/pickups observed parking near EV hub: [Y] Yes, Count approx: 1
- [ ] Line-of-sight from B&Q exit to EV bay cluster: [N] No

---

## 4. The "Wizard of Oz" Simulation — Full Timer Run

**This is the most important data point of the visit. Do this at least once.**

| Step | Action | Time |
|---|---|---|
| T+0:00 | Start stopwatch at Costa counter (notional order placed) | 00:00 |
| T0:20 | Arrive at Bay 4 bumper (normal runner pace) | 6:00 |
| — | Standard prep time (fixed) | 02:00 |
| — | **Calculated Slack** = Walk Time − 02:00 | 5:00 |
| — | **Result** | [Y] Acceptable [N] System Failure (Runner too fast) |

> **Investor Stat:** "Coffee arrives at 58°C based on a ___:___ minute transit."
> Record the transit time here and confirm temperature claim is supportable.

Upon site visit, I would now not use this Coasta. The Marks & Spencer cafe (on 2nd floor) is clsoer to the Tesla car charger bays. I have logged results in ad_hoc_ev_sites_visit1.md from the cafe pick up point to the tesla's bays of which there are 16. 

---

## 5. Retail Moat & Destination OS Checks

### 5a. Shopping Timer (Watch UI Logic)
- [ ] Walk from Tesla bays to main Lakeside entrance: about 3 mins aprrox at steady walk, not brisk.
  > Used for: "42 mins of shopping left" Watch UI countdown logic.

### 5b. Exit Vector
- [ ] Exit roundabout — congestion observed: [Y] Yes Free-flowing at time of logging.
- [ ] Typical dwell time at roundabout (estimate): < 1 min.
  > Used for: 15mph Exit Vector geofence trigger calibration.
- [ ] Locked gates or ticket barriers on exit path: [N] No but 2 zebra crossings on road dividing the Tesla car park to the car park next to M&S and other Lakeside shopping centre retail units.

### 5c. The Costco Diversion Audit
- [ ] Costco queue length observed: 20+ cars waiting to enter petrol forecourt.
- [ ] Estimated Costco wait time: 5-10 mins
- [ ] Drivers exiting Costco — can they see the Lakeside/Refueler path? [N] No
- [ ] **Nudge Efficiency check:** If Costco Wait > REFUEL Walk time → Nudge efficiency = 100%. Result: [N] No there are other options the customer could use, a TGI Fraidays is located next to Costco and the adjacent reatils park has Tim Hortons, McDonald's (which has 4 charging stations). People visiting Coscto coudl also be using the in store coffeeshop for food/drink before getting into their car for a possible fuel purchase. Plus after a long shop at Costcos drivers want to head back home.

### 5d. Peak Shifting
- [ ] Time of "Green Window" (EV queue < 2 cars): _____ (observe or ask staff)
- [ ] Time of peak congestion at forecourt: _____

Not recorded, forecourt too busy and staff heling customers. Not approriate to take recordings.
---
## 6. Post-Visit: Next Steps

On return from site visit, the following will be built using data captured above:

- [ ] **Timer App Logic:** Set the ETA Dial thresholds using measured Coffee Gap and runner times.
- [ ] **Watch UI:** Confirm "42 mins shopping left" countdown start value from §5a.
- [ ] **Command Centre Build (Initial):** Begin first build using Lakeside Car Park G as the active site, geofence centred on Bay 4 Compass coordinates from §3b.
- [ ] **Wizard of Oz Stat:** Lock in the transit time for investor-facing copy and 58°C delivery claim.
- [ ] **Merge any ad hoc EV site data** from `ad_hoc_ev_sites_visit1.md` into master site registry.
- [ ] **Update `05_Field_Notes/README.md`** with completed audit status and any new site observations.
