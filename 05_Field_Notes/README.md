# 05: Field Notes (Site Visits & UX Research)
**Focus:** Real-world observational data, physical location audits, and competitor UX/UI design research feeding into the Refueler mobile app design process.

---

## Directory Structure

```
05_Field_Notes/
├── README.md                          ← This file
│
├── 04_Costa-Coffee_Lakeside/
│   ├── Costa_Coffee_app_UX.md         ← UX/UI analysis: ordering flow, loyalty, design patterns
│   └── Costa_Coffee_App_UX_Images/    ← Screenshot archive (compressed reference sheets preferred)
│
├── 05_Starbucks_Lakeside/
│   ├── Starbucks_app_UX.md            ← UX/UI analysis: Deep Brew AI, Smart Queue, hyper-personalisation
│   └── Starbucks_App_UX_Images/
│
├── 06_Greggs_Lakeside/
│   ├── Greggs_app_UX.md               ← UX/UI analysis: One-Scan mechanic, Bitesize format, roadside strategy
│   └── Greggs_App_UX_Images/
│
├── 07_Cafe_Nero_Lakeside/
│   ├── Cafe_Nero_app_UX.md            ← UX/UI analysis: round-the-clock bundling, drive-thru gap
│   └── Cafe_Nero_App_UX_Images/
│
├── 08_Bonnet_Lakeside/
│   └── Bonnet_App_UX_Images/          ← EV infrastructure UX research (ongoing)
│
├── [EV_Infrastructure]/               ← EV charge point operators & hardware research (ongoing)
│   └── *.md                           ← In progress
│
└── Lakeside_Audit/
    └── lakeside_audit.md              ← Physical site audit: EV bay, runner route, connectivity
```

---

## Section A: UX & UI Design Research

### Purpose
This section captures competitive intelligence and design pattern analysis from the UK's leading coffee shop mobile apps. The research directly informs the Refueler.io mobile ordering flow (iOS primary, with Apple Watch, CarPlay, and Android to follow).

### Brands Researched

| Brand | File | Status | Key Design Insight |
|---|---|---|---|
| Costa Coffee | `Costa_Coffee_app_UX.md` | ✅ Complete | Bottom-tab nav, Bean Counter loyalty loop, geofencing on open |
| Starbucks | `Starbucks_app_UX.md` | ✅ Complete | Deep Brew AI, Smart Queue, real-time wait estimates per store |
| Greggs | `Greggs_app_UX.md` | ✅ Complete | One-Scan masterclass, Bitesize format, roadside/EV gap |
| Café Nero | `Cafe_Nero_app_UX.md` | ✅ Complete | Round-the-clock challenger, high-volume bundling |
| Pret A Manger | `Pret_app_UX.md` | ✅ Complete | Club Pret subscription UX, Watch complication, zero-decision flow |
| Costco | — | 🔄 Ongoing | Mobile app research in progress |
| Bonnet (EV) | — | 🔄 Ongoing | EV infrastructure UX/UI research in progress |

### Screenshot Management Convention
Raw PNGs are stored in each brand's `_App_UX_Images/` folder. To keep prompt context manageable:
- **Preferred format for AI sessions:** Compressed composite reference sheets (one image per brand, key screens in a grid, <1MB).
- **Annotation rule:** Each screenshot should have a one-line observation logged in the corresponding `.md` file referencing the filename. The `.md` file is the primary design reference — images are supporting evidence only.
- **Selective attachment rule:** When working with Claude, attach only the 2–3 screenshots directly relevant to the flow being discussed in that session.

---

## Section B: Physical Site Audits

### Active Sites

| Site | File | Status | Focus |
|---|---|---|---|
| Lakeside EV Charging (Car Park G) | `lakeside_audit.md` | 🔄 In Progress | Wait-time economy, runner logistics, connectivity |
| Costco Wholesale (Lakeside) | — | 🔄 Planned | Concierge pivot, diversion flow, Bulk Verification logic |
| Notting Hill | — | 🔄 Planned | Luxury backdrop audit, brand aesthetic reference |

### Site Visit Protocol (The Audit Checklist)
Every physical site visit should capture the following before leaving:

**Connectivity**
- [ ] Speed test at the EV bay (target: min 10Mbps). Record: _____ Mbps up / _____ Mbps down.
- [ ] 4G or 5G confirmed at bay: [ ] 4G [ ] 5G
- [ ] Signal drop points noted on the path from bay to vendor.
- [ ] Public Wi-Fi available at vendor: [ ] Yes [ ] No. Login required: [ ] Yes [ ] No.

**Physical Layout**
- [ ] QR visibility: flat, eye-level surface available for CarPlay/Widget link? [ ] Yes [ ] No.
- [ ] Lighting: glare or shadow issues for camera scanning? Notes: _____
- [ ] Pedestrian flow: time from "Car Door Open" to "Vendor Counter." Result: _____ mins.
- [ ] Covered/dry path available: [ ] Yes [ ] No.

**Timing (The "Wizard of Oz" Run)**
- [ ] Queue wait time at counter: _____ mins.
- [ ] Order-to-handover production time: _____ mins.
- [ ] Runner walk time (vendor → bay): _____ mins.
- [ ] Calculated slack (walk time − 2:00 prep): _____ mins.

**Brand & Aesthetic**
- [ ] High-luxury backdrop potential: [ ] Yes [ ] No. Notes: _____
- [ ] Signage opportunity (line-of-sight from exit to EV bay): [ ] Yes [ ] No.

---

## Design Research Principles (Cross-Brand Synthesis)

Drawn from the UX research above, these are the non-negotiable design standards for the Refueler mobile ordering flow:

1. **Speed over depth.** Greggs and Costa both prove: the fewer taps to a confirmed order, the higher the conversion. Target: order placed in ≤ 3 taps from app open.
2. **Context-first home screen.** Starbucks Deep Brew demonstrates that a home screen personalised to time, location, and history outperforms a static menu every time.
3. **Bottom-sheet navigation.** Costa and Pret both confirm bottom-tab / bottom-sheet as the gold standard for one-handed use. All primary CTAs must sit in thumb reach.
4. **The "Zero-Decision" loyalty trigger.** Pret's subscription model shows that removing the payment decision moment is the most powerful retention mechanic. SATS-back should feel automatic, not earned.
5. **Live wait time before checkout.** Starbucks Smart Queue: show the real-time wait at the specific store *before* the user pays, not after. This is table stakes for 2026.
6. **Haptic handoff hierarchy.** Solid thump = charging started / order confirmed. Light click = QR ready. Silent = background SATS credit. Never use haptics for errors — use them only for positive state changes.
7. **Watch-first for the handover moment.** Pret's Watch complication and Costa's Bean Counter both point to the same conclusion: the final 10 yards of the order journey should be completable on the wrist, without touching the phone.
