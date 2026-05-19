# Functional Specifications

## PART 1: CarPlay Dynamic Alerting Engine (CDAE)

### 1. Objective
To provide real-time, location-aware fuel and EV charging notifications directly to the vehicle's head unit, prioritising "Cheapest of 3" stations based on the user's current route.

### 2. Core Requirements
* **Entitlement:** App must implement the `CPStationCharging` or `CPFueling` entitlement from Apple.
* **Dynamic Geofencing:**
    * Monitor GPS coordinates against "Drop-off Database" (Top 10 London Hubs).
    * **Trigger A (Rental Mode):** Activate within 15 miles of a designated return hub.
    * **Trigger B (Resident Mode):** Activate based on fuel levels (25% and 15% thresholds) via OBD-II Bluetooth link or manual user "Low Fuel" toggle.
* **Selection Algorithm:**
    * Query UK Gov Fuel API every 30 minutes.
    * Filter by Distance < 5 miles and Price = ASCENDING.
    * Push to CarPlay showing the 3 cheapest options.

### 3. User Interface (Template Architecture)
* **CPListTemplate:** Display 3 stations with color-coded Price Indicators (Green/Yellow/Red).
* **CPPointOfInterestTemplate:** Display selected station on map with "Go" button for Apple/Google Maps navigation.

---

## PART 2: Master Loyalty Dashboard (MLD)

### 1. Objective
A cross-platform web and mobile portal for aggregating fuel savings, managing white-label coupons, and providing "Deep Data" visualisations.

### 2. Data Integration
* **User Account Sync:** OIDC (OpenID Connect) login via Google, Apple, or Partner (Duffel) accounts.
* **Loyalty API Connectors:** Secure storage for Nectar, Clubcard, and Shell Go+ digital tokens.
* **Savings Calculator:** Worker that compares "User Price Paid" against "Regional Average Price" to calculate "Lifetime Savings."

### 3. Features
* **Time-Scale Visualisation:** Interactive charts for Weekly, Monthly, and Yearly savings.
* **Coupon Wallet:** Central hub for "White Label" partner QR codes (e.g., Sainsbury's).
* **The "SaaS Handover":** Duffel-branded registration transitions to core "Fuel-Watch" branding after 30 days.

### 4. Push Notification Engine
* Triggers "Weekend Price Forecasts" (e.g., "Prices are expected to rise on Monday; fill up now at [Station Name] to save £4").

---

## PART 3: HVT "Smart-Converter" & "Luxury UI" Engine

### 1. Objective
To deliver a high-fidelity visual experience automating complex conversions and traffic-aware station selection.

### 2. "Context-Aware" Conversion Engine
* **Inputs:** User's "Home Locale" (iOS settings) and Real-time FX Rates.
* **Logic:**
    * If `en_US`: GBP/Litre -> USD/Gallon.
    * If `en_EU`: GBP/Litre -> EUR/Litre.
* **Output:** Displayed on the 4th sub-dial of the Apple Watch "Chronograph" UI.

### 3. Traffic-Weighted Algorithm
* **Integration:** Google Maps Distance Matrix API.
* **Ranking Score:** `(Price Weight 60%) + (Traffic Delay Weight 40%)`.
* **Constraint:** Suggested stations must not increase total travel time to the "Drop-off Geofence" by more than 5 minutes.

### 4. Haptic Alert Layer
* **Type:** `WKHapticTypeDirectional`.
* **Trigger:** Unique vibration pattern upon reaching the "Optimal Refuel Window" (calculated via fuel level % and proximity to cheapest station before airport).

---

## PART 4: Integrated Technical Architecture & Sync

### 1. The "Cloud Brain" (Unified Backend)
* **Orchestrator Layer:** Server-side engine managing real-time data from UK Gov Fuel Finder, EV Charging APIs, and FX Rate providers.
* **Database:** PostgreSQL for secure storage of loyalty tokens (Nectar/Clubcard) and savings history.
* **Segmented Logic:**
    * **Traveler/Elite:** Triggers "Drop-off Geofences" and pushes high-priority (5-min) data refreshes.
    * **Resident:** Prioritizes Partner Stations based on linked loyalty cards.

### 2. Watch-to-CarPlay "Data Handshake"
* **Framework:** `WatchConnectivity` for instant state synchronization between devices.
* **"Flick to Car" Feature:** Allows station selection on the Watch to trigger a `CPPointOfInterestTemplate` update on the iPhone's CarPlay session.
* **Priority Handling:** iPhone identifies active CarPlay sessions to override background tasks for fuel alerts.

### 3. Core User Flow (Duffel Booking)
1. **Onboarding:** User selects home currency (e.g., USD) during app setup.
2. **Detection:** App monitors "Drop-off Geofences" (15-mile radius from Heathrow/LHR).
3. **Alert:** Watch triggers haptic tap and lights up Chronograph Dial.
4. **Activation:** Tapping the Watch notification automatically updates CarPlay with the "Top 3 Return Stations" list.
5. **Navigation:** One-tap navigation to the cheapest station via Apple/Google Maps.

---

## PART 5: Satoshi Rewards & Lightning Integration

### 1. Objective
To provide a driver-safe interface for managing fuel selection and providing instant visual/auditory confirmation of earned Bitcoin (Sats) rewards.

### 2. CarPlay Rewards UI (The "Cha-Ching" Flow)
* **Screen 1 (Selection):** `CPListTemplate` highlights "Sats-back eligible" stations with an Orange "₿" or "S" icon.
* **Screen 2 (Active):** Displays "Station Active" template while geofenced at coordinates.
* **Screen 3 (Confirmation):** Triggered when GPS shows movement **>100 meters** away from the station.
    * **Template:** `CPAlertTemplate` with Orange Bitcoin icon.
    * **Audio:** Trigger `AVAudioSession` digital chime (Success/Cha-ching).
    * **Data:** Displays Savings (£) and Streaming Satoshis (₿).

### 3. Watch Handshake (The "Orange Dial")
* **Trigger:** Silent push notification from Cloud Brain upon successful Lightning invoice settlement.
* **UI Animation:** The "Orange Sub-dial" performs a real-time spin/increment animation.
* **Logic:** `WCSession` syncs the new balance from iPhone to Watch in < 2 seconds.

### 4. Technical Payout Logic (Backend)
* **Detection:** iPhone app detects exit from POI geofence.
* **Verification:** Cloud Brain verifies transaction via UK Gov API fuel price match.
* **Payout:** Backend triggers API call to LSP (e.g., OpenNode/Breez) for instant settlement to user's Lightning Address.
* **Security:** Support for "Advanced Mode" (Non-custodial LNURL-withdraw).

---

## PART 6: Onboarding & Fraud Prevention

### 1. User Onboarding Flow (FTUE)
* **Archetype Selector:** User identifies as "Tourist" or "Local" to set data priority and UI skin.
* **Wallet Connection:** Handshake with LNURL or internal "PumpWallet" setup.
* **Permissions:** Request "Always-On" Location and CarPlay/Watch sync entitlements.
* **Tutorial:** Trigger "First Fill-up" animation showing the Orange Dial spin.

### 2. Triple-Verification Protocol
To prevent "Sats-Back" fraud, a payout is only triggered if:
1. **GPS:** Vehicle is within the station's geofence.
2. **Time Dwell:** Vehicle remains stationary for > 2 minutes (refuel duration).
3. **Telemetry:** Vehicle moves > 100 meters away from the geofence (trip resume).

---

## PART 7: Resident Prediction & OBD-II Integration

### 1. Price Trend Prediction (AI Layer)
* **Logic:** Batch process UK Gov API data at 04:00 AM daily to identify multi-day trends.
* **Alert Trigger:** Automatically notify users if regional average price increases for 3 consecutive days.

### 2. Route-Deviation Logic (The Detour Buffer)
* **Constraint:** Suggested fueling stations must add `< 3 minutes` or `< 1.5 miles` to the active navigation route.
* **UI:** Highlight the "Cheapest of 3" options with a "Recommended" star icon on the CarPlay display.

### 3. OBD-II Integration
* **Connectivity:** Implement a Bluetooth handshake for real-time vehicle telemetry using compatible adapters.
* **Features:**
    * Precise fuel level percentage triggers (25% and 15% thresholds).
    * Custom dashboards for fuel economy and "Lifetime Savings" metrics.

### 4. Apple Wallet Integration
* **Mechanism:** Use [PassKit](https://developer.apple.com/documentation/passkit) to push digital loyalty cards (Nectar/Clubcard) or coupons to the Apple Watch.
* **Handshake:** Automatically present the relevant pass when the vehicle arrives at geofenced station coordinates.

---

## PART 8: Mobile UI Sync & Calibration

### 1. Mobile-to-Vehicle Sync (OBD-II & CarPlay)
* **Live Telemetry Dashboard:** Display "Vehicle Connected" status and real-time Fuel % via the OBD-II Bluetooth handshake.
* **Calibration Module:** Dedicated button to "Test Handshake" between the Mobile App, Apple Watch, and CarPlay to verify `WCSession` and `CPTemplate` sync.
* **Geofence Toggles:** Granular user controls for 25% (Planning) and 15% (Urgent) notification thresholds.

### 2. Technical Onboarding Sequence
1. **Splash:** "Pump: Drive to Earn" branding.
2. **Wallet Provisioning:** Handshake for "Managed PumpWallet" (Instant) vs "Self-Custody" (Advanced LNURL-withdraw).
3. **Core Permissions:** Request "Always-On" Location access for geofence verification and automated rewards.
4. **Hardware Pairing:** Wizard for Apple Watch complication setup and CarPlay entitlement verification.

* **Reward Choice (The Fork):** 
    * **Option A (Standard):** Cashback/Vouchers (Blue UI).
    * **Option B (Digital Gold):** Satoshis via Lightning (Orange UI).
* **Bank Integration:** Optional Plaid/TrueLayer link for automated receipt verification.

---

## PART 9: Dual-Mode Aesthetic Sync & Device Mirroring

### 1. Adaptive Watch UI (Mirroring Logic)
* **Visual Sync:** The Apple Watch Chronograph must automatically mirror the active mode on the Mobile App (Satoshi/Orange vs. Cashback/Blue).
* **Color States:**
    - **Satoshi Mode:** Charcoal Grey (#121212) base with International Orange (#F7931A) accents.
    - **Cashback Mode:** Charcoal Grey (#121212) base with Electric Cobalt (#2E5BFF) accents.
* **Dial Interactions:**
    - **Satoshi View:** Implement a "Subtle Pulse" on sub-dials when a Lightning Network connection is active.
    - **Cashback View:** Implement a "Brushed Steel" texture that responds to digital light based on the watch's accelerometer/tilt.

### 2. The "Sovereign Toggle" (Mobile-to-Watch)
* **Mechanism:** A haptic-enabled toggle in the Mobile App header triggers an immediate `WCSession` update to the Watch.
* **Sub-Dial 4 (Adaptive Context):**
    - **Traveler Mode:** Displays Home Currency ($/Gal).
    - **Resident Mode:** Displays Loyalty Points (Nectar/Clubcard) or Weekly Savings Goal.

---

## PART 10: Elite Traveler (HVT) Technical Logic

### 1. The "Savings Trophy" System
* **Trigger:** Successful fill-up verification (Part 6).
* **Logic:** Calculate `(Regional Airport Price - Actual Price Paid) * Litres` + `Traffic Delay Avoided`.
* **Output:** A high-fidelity "Trophy" card on the Mobile App and a summary notification on the Watch.

### 2. One-Touch Export & VAT Engine
* **Format:** Generate a PDF receipt including: Merchant Name, Date, VAT Number (from OCR), and Total.
* **Integrations:** Handshake with Expensify/Concur APIs via OAuth.
* **VAT Logic:** Automatically separate 20% UK Fuel VAT for reclaim reporting.

### 3. Predictive Return Pathing (Traffic Delay weighting)
* **Algorithm:** Query Google Maps Distance Matrix.
* **Weighting:** 70% Price / 30% Traffic Delay. 
* **Rule:** Suggested stations must add **ZERO minutes** to the current journey time to be ranked #1 for HVTs.

---

## B2C Focus: The Connected Resident (UK Mass Market)
- **Persona:** Budget-conscious commuters and school-run parents in London/Home Counties.
- **Value Prop:** Eliminating the "Local Premium" via automated route-monitoring.
- **Key Features:**
    - **Pass-By Notifications:** CarPlay alerts for cheaper fuel on the *active* commute.
    - **Loyalty Stack Dial:** Real-time circular progress bar for Nectar/Clubcard on the Watch.
    - **Price Predictions:** AI-driven "Fill Up Today" alerts based on regional 3-day trends.
- **Monetization (Freemium):**
    - **Free Tier:** Basic mobile search.
    - **Power User (£1.99/mo):** CarPlay integration, AI predictions, and tax-return mileage tracking.

---

## PART 11: Resident "Daily Driver" & Prediction Engine

### 1. Price Trend Prediction (AI Layer)
* **Data Source:** Historical 3-day snapshots of UK Gov Fuel API.
* **Logic:** Trigger "Fill Up Today" notification if regional average rises for 3 consecutive days.
* **Batch Processing:** 04:00 AM daily.

### 2. CarPlay "Pass-By" Logic (The Detour Buffer)
* **Algorithm:** Query Google Maps Distance Matrix.
* **Detour Buffer:** Only suggest stations adding **< 3 minutes** or **< 1.5 miles** to the current active route.
* **UI:** Highlight "Cheapest of 3" with a "Recommended" star icon.

### 3. Apple Watch Loyalty Sub-Dial
* **Function:** Replace Currency Dial with "Points Progress" for Residents.
* **Visual:** Circular progress bar linked to Nectar/Clubcard digital tokens.

### 4. 25% and 15% Enhanced "Smart Alerts"
* **The Planner (25%):** Push notification listing top 4 partner stations on the active commute.
* **The Action (15%):** High-priority "Urgent Diversion" to the absolute nearest cheapest station (< 2 miles).
* **OBD-II Integration:** Optional Bluetooth handshake for real-time telemetry (reading exact fuel percentage).

### 5. Master Dashboard (Resident View)
* **Reporting:** Monthly CSV/PDF export tracking location, price, and "Saved Amount" for personal accounting.

---

## PART 12: Multi-Platform Handshake (Elite & Traveler)

### 1. Watch-to-CarPlay Sync (HVT Elite)
* **Framework:** Use `WatchConnectivity` for instant state synchronization between Watch, iPhone, and CarPlay.
* **"Flick to Car" Logic:** When a user selects a station on the Watch, the iPhone must immediately push a `CPPointOfInterestTemplate` to the CarPlay head unit.
* **Priority Handling:** Active CarPlay sessions must override background tasks to ensure "Return Mode" alerts are presented with zero latency.

### 2. Frontend Frameworks
* **Apple Watch:** Use `ClockKit` or `WidgetKit` for high-fidelity "Complication" rendering.
* **CarPlay:** Implement `CPFueling` entitlement for the "Top 3 Stations" list rendering.

---

## PART 13: CarPlay "Sats-Back" UI Framework

### 1. The "Cha-Ching" User Journey
* **Selection (CPListTemplate):** Highlight "Sats-back eligible" stations with an Orange "₿" or "S" icon.
* **Active Mode:** Display "Refuelling in progress... Rewards pending" template while geofenced at station coordinates.
* **Confirmation (CPAlertTemplate):** 
    * **Trigger:** GPS movement **>100 metres** away from station (trip resume).
    * **Visual:** Large Orange Bitcoin icon + Savings vs. Airport Price summary.
    * **Audio:** Trigger `AVAudioSession` digital chime upon payout confirmation.

### 2. Cross-Device Handshake
* **Visual Sync:** Successful Lightning settlement triggers a "Spin Animation" on the Apple Watch "Orange Dial."
* **Real-time Balance:** Watch sub-dial must increment from old to new balance via `WCSession` message.

---

## PART 14: Cross-Device Reward Handshake (Sequence)

### 1. Payout Trigger Sequence
1. **Movement Detection:** iPhone detects >100m movement away from Station POI.
2. **Verification:** iPhone calls "Cloud Brain" to verify Fill-up Logic (GPS Dwell + Telemetry).
3. **API Payout:** Cloud Brain instructs LSP (OpenNode/Breez) to settle the Lightning Invoice.
4. **Success Signal:** Backend sends a **Silent Push Notification** (Remote Notification) to the iPhone.

### 2. UI Synchronization
1. **CarPlay Update:** Upon receiving the Success Signal, iPhone immediately updates the `CPAlertTemplate` on the head unit.
2. **Watch Update:** iPhone sends a `WCSession` message to the Apple Watch.
3. **Animation:** Watch triggers the "Orange Dial" spin/increment animation instantly.

---

## PART 15: PumpWallet Strategy & User Sovereignty

### 1. The "Managed" Path (Onboarding)
* **Default:** Provide a "Managed/Shared" wallet for instant "Sats-back" gratification without requiring technical setup.
* **Goal:** Frictionless onboarding for the Mass Resident (B2C) segment.

### 2. The "Sovereign" Path (Bitcoin Maxis)
* **Advanced Toggle:** Allow users to input a custom Lightning Address (e.g., user@getalby.com) or LNURL-withdraw link.
* **Non-Custodial Logic:** The backend sends payment commands directly to the user's specified node/wallet without touching the funds.
* **Premium Utility:** Allow "Maxis" to pay for their £4.99/mo premium subscription directly via their earned Satoshi balance.

---

## PART 16: Security & "Proof-of-Refuel" Logic

### 1. Triple-Verification Protocol
To prevent GPS spoofing and fraudulent reward claims, all payouts must pass three checks:
1. **The "Stay" Check (Dwell Time):** Vehicle must remain stationary (speed < 2mph) within the geofence for a minimum of 3 minutes.
2. **The "Consumption" Check (Telemetry):** CarPlay/OBD-II must report a fuel level increase of at least 10% between the entry and exit of the geofence.
3. **The "Movement Vector" Check:** Reward is only triggered when the vehicle exits the geofence at a speed > 15mph heading *away* from the coordinates.

### 2. Anti-Gaming Constraints
* **Device Restriction:** Rewards are only eligible when the iPhone is actively connected to a CarPlay head unit or an OBD-II Bluetooth bridge.
* **Frequency Cap:** Limit of two "Verified Refuels" per 24-hour period per account to prevent commercial pump-farming.

* **Option C (Open Banking):** For non-crypto users, provide an optional link via **Plaid/TrueLayer** to automate receipt verification via bank transaction data, eliminating the need for manual OCR scanning.

---

## PART 17: User Onboarding Flow (FTUE)

### 1. Niche Selection (Segmenting)
* **Question:** "Are you a Tourist (Traveler) or a Local (Resident)?"
* **Action:** This selection sets the default Data Refresh priority (5-min vs 30-min) and the initial UI skin (FX Dial vs Loyalty Dial).

### 2. Wallet & Permission Handshake
* **Wallet Fork:**
    - **Pro:** Connect external LNURL/Lightning Address.
    - **Newbie:** Create a "Managed PumpWallet" (Instant setup).
    - **Legacy:** Skip to "Cashback Mode" (Traditional Vouchers).
* **System Permissions:** 
    - **Location:** Request "Always-On" (Required for background geofencing).
    - **Connectivity:** Request entitlements for **CarPlay** and **WatchConnectivity**.

### 3. The "Dopamine" Tutorial
* **Visual:** A 15-second "First Fill-up" animation.
* **Goal:** Demonstrate the "Orange Dial" spin and the "Cha-ching" audio chime to establish the reward loop before the user even gets in their car.

### 4. Traveler Hub Preparation
* **Logic:** Upon Duffel booking sync, the backend identifies the return hub coordinates.
* **Pre-fetching:** Activate UK Gov Fuel API queries for a 10-mile radius around the hub precisely 2 hours before the `deadline` timestamp.

---

## PART 18: Resident Commute Logic & Gamification

### 1. Route-Based "Opportunity" Alerts
* **Logic:** Backend monitors active navigation path; triggers a `CPAlertTemplate` if a station on the route is > 2p cheaper than the user's 7-day average price-paid.
* **UI:** The banner must display the "Instant Savings" amount (e.g., "Save £2.20 now") to drive immediate action.
* **One-Tap Diversion:** Selecting the alert must trigger a `CPPointOfInterestTemplate` update to reroute the vehicle with zero manual input.

### 2. The "Savings Streak" Engine
* **KPI:** "Smart Fill" count (Number of times the user chose a recommended station).
* **Watch Feedback:** Increment the "Weekly Savings" sub-dial upon successful 100m exit (Part 14).
* **Notification:** Trigger a "Daily Streak" summary on the Watch: "3rd Smart Fill this month! On track to save £30 by payday."

### 3. Subscription Gate (Power User)
* **Logic:** Verify active £4.99/mo subscription before enabling CarPlay "Commute Rerouting" and Price Prediction alerts.
* **Fallback:** Non-subscribers receive basic mobile map search but no proactive dashboard diversions.

---

## PART 19: OCR Receipt Verification (Legacy Path)

### 1. The "Scan & Verify" Workflow
* **Trigger:** GPS detects a dwell at station coordinates (Part 16); sends notification to verify the fill-up.
* **Capture Layer:** Custom camera interface optimized for "Point-and-Shoot" with edge detection for thermal receipts.
* **Verification Constraints:**
    * **Merchant Match:** Must align with GPS station name.
    * **Temporal Match:** Receipt timestamp must be within **15 minutes** of the GPS dwell exit.
    * **Price Match:** Unit Price (p/Litre) must match the "Deal" offered in the app to prevent users from scanning random high-price receipts.

### 2. Extraction Engine (Cloud Brain)
* **Integrations:** Handshake with **Google Document AI** or **AWS Textract**.
* **Key Fields:** Merchant Name, Date/Time, Total Amount (£), and Unit Price (p/L).

---

## PART 20: Camera Security & "Legacy" Redemption

### 1. "Live-Only" Capture Logic
* **Constraint:** The app must disable "Gallery Uploads" for receipt verification. 
* **Requirement:** Users must trigger a live camera session within the app to ensure the receipt is physically present.

### 2. EXIF Metadata Validation
* **Verification:** Every receipt photo must be "Metadata Stamped." 
* **Logic:** The backend must parse the EXIF data of the image. The `GPSLatitude` and `GPSLongitude` embedded in the photo file must match the station's geofence coordinates within a 50-meter tolerance.

### 3. The Blue "Cashback" Payout Loop
* **UI State:** For non-crypto users, display the **Electric Cobalt (#2E5BFF)** dial.
* **Milestones:** Implement a "Gold State" transition for the dial once 1,000 points (£10) are accrued.
* **Redemption:** Handshake with gift card APIs (Amazon/Sainsbury's) or PayPal for direct transfer.

---

## PART 21: Traveler Hub Preparation (B2B Logic)

### 1. The 120-Minute Alert Window
* **Trigger:** Logic activates exactly 2 hours prior to the `drop_off_datetime` provided by the Duffel API.
* **Pre-fetching Engine:** 
    * Backend identifies the return hub coordinates (e.g., LHR T5).
    * Backend executes a batch query of the **UK Gov Fuel API** for all stations within a 10-mile radius of those coordinates.
* **Watch Preparation:** The Apple Watch "Chronograph" sub-dial 4 is updated to show the destination hub name and the "Average Value" of that specific airport zone.

### 2. Geofence Active State
* **Radius:** A 15-mile "Active Geofence" is established around the hub.
* **CarPlay Handshake:** Upon entry into the 15-mile geofence, the iPhone automatically pushes the "Top 3 Return Stations" list to the CarPlay `CPListTemplate`.

---

## PART 22: "Sats Switch" Biometric Ignition Toggle

### 1. Objective
To provide a highly secure, luxury-grade biometric "Ignition" switch that authorizes the streaming of Satoshis upon completion of the "Proof-of-Refuel" cycle.

### 2. Biometric Handshake Logic
* **Framework:** Use Apple's [LocalAuthentication](https://apple.com) framework.
* **Requirements:**
    * **Biometric Mandatory:** Authentication must utilize FaceID or TouchID.
    * **No Passcode Fallback:** For the "Sovereign" path, the device passcode must not be permitted as a fallback to ensure 100% biometric integrity.
* **Verification:** Payout logic (Part 14) is only "Ignited" once the Secure Enclave confirms a successful biometric match.

### 3. Visual & Haptic Feedback
* **UI Element:** A large, skeuomorphic "Ignition Toggle" in the Mobile App (International Orange).
* **State Change:** Upon successful FaceID scan, the toggle slides to the "Active" position with a mechanical sweeping animation.
* **Haptics:** Trigger a "Heavy" haptic impact to simulate the engagement of a physical car relay.

---

## PART 23: High-End Utility & "Premium Delight" Motion

### 1. The "Sweeping" Chronograph Logic
* **Objective:** To simulate a high-end mechanical watch movement during data transitions.
* **Logic:** When the UK Gov Fuel API pushes a price update, the sub-dials must not "jump" to the new value. They must perform a **continuous sweep** (interpolation) from the current value to the target value.
* **Framework:** Use `react-native-reanimated` with a `linear` or `easy-in-out` easing function to ensure the "sweep" feels analog.

### 2. HUD Glassmorphism (Mobile UI)
* **Aesthetic:** Implement "Glassmorphism" for all active dashboard overlays.
* **Requirements:**
    * **Backdrop Blur:** Use `BlurView` (Expo) to create a semi-transparent, frosted-glass effect.
    * **Dynamic Layers:** UI elements should appear as if floating on a "Heads Up Display" (HUD), mirroring modern luxury automotive cockpits (e.g., Audi Virtual Cockpit).

### 3. Driver Safety (Dark Mode)
* **Requirement:** The app must utilize **High-Contrast Dark Mode** as the default system state to reduce eye strain and eliminate dashboard glare during night-time driving.
* **Accent Logic:** Use "International Orange" (#F7931A) exclusively for high-priority data points (Savings/Sats) to ensure glanceability at speed.

---

## PART 24: Personal Expenditure Portal (Web)

### 1. Data Visualization
* **Heatmaps:** Render geographic spending maps showing where the user spends the most on energy.
* **Inflation Tracker:** Chart "Price Paid" vs. "Last Year's Regional Average" to show the impact of inflation on the user's wallet.

### 2. Business Continuity & Tax
* **Tax-Ready Exports:** One-click generation of a "Business Mileage & Fuel" PDF/CSV, formatted for HMRC (UK) or IRS (USA) business expense claims.
* **Authentication:** Ensure seamless OIDC (Google/Apple) sync between the Mobile App and Web Portal.

---

## PART 22: "Sats Switch" Biometric Ignition Toggle

### 1. Objective
To provide a highly secure, luxury-grade biometric "Ignition" switch that authorizes the streaming of Satoshis upon completion of a verified "Proof-of-Refuel" cycle.

### 2. Biometric Handshake Logic
* **Framework:** Implement via Apple's [LocalAuthentication](https://apple.com) framework.
* **Biometric Mandatory:** Authentication must utilize FaceID or TouchID.
* **No Passcode Fallback:** For the "Sovereign" path, the device passcode is not permitted as a fallback, ensuring 100% biometric verification.
* **Verification:** The Payout Engine (Part 14) is only triggered once the Secure Enclave confirms a successful biometric match.

### 3. Visual & Haptic Feedback
* **UI Element:** A large, skeuomorphic "Ignition Toggle" using high-contrast International Orange.
* **Interaction:** Upon successful FaceID scan, the toggle slides to the "Active" position with a mechanical sweeping animation.
* **Haptics:** Trigger a "Heavy" haptic impact to simulate the physical feel of a luxury car's ignition relay.

---

## PART 25: Resident Watch Dial Configuration (The 4 Sub-Dials)

### 1. Dial A: The "Loyalty Loop" (Top Left)
* **Logic:** Tracks primary supermarket reward progress (Nectar/Clubcard).
* **Visual:** Circular progress ring using brand-specific hex codes (Purple/Blue).
* **Data:** Dynamic text displaying "Points" or "GBP Value" synced via Partner APIs.

### 2. Dial B: "Savings Momentum" (Top Right)
* **Logic:** Cumulative monthly savings total vs. regional average.
* **Visual:** GBP figure with a trend arrow (Upward/Growth).
* **Goal:** Drive subscription retention by visualizing real-world ROI.

### 3. Dial C: "The Orange Satoshi" (Bottom Left)
* **Logic:** Lifetime "Sats-back" balance from the PumpWallet.
* **Interaction:** Tapping triggers the **Fountain V4V Stream** (if enabled) to boost the current podcast.

### 4. Dial D: "Local Price-Trend" (Bottom Right)
* **Logic:** Predictive indicator based on 3-day regional backend analytics.
* **Visual:** Weather-style icons (e.g., Rising Sun = Price Spike, Falling Rain = Price Drop).
* **CTA:** Triggers a "Fill Up Now" alert if a spike is predicted within 24 hours.

---

## PART 26: HVT Trip Pass & Entitlement Logic

### 1. Trip Pass Activation (Time-Gating)
* **Logic:** Upon purchase of a "Quick Business" (£2.99) or "Explorer" (£7.99) pass, the backend must set a `pass_expiry_timestamp`.
* **Entitlement Check:** The Mobile App and Watch must verify the active status before rendering:
    * Real-time FX/Unit Conversion ($/Gal).
    * Priority Airport Geofence Alerts.
    * "Luxury Chronograph" interface skins.

### 2. Post-Trip Retention Flow
* **Trigger:** 24 hours after the `pass_expiry_timestamp`.
* **Action:** Trigger a "Trip Savings Summary" notification showing the total £ saved vs. the cost of the pass.
* **Conversion:** Offer a discounted upgrade to the "Resident Power User" (£1.99/mo) if the user's GPS data indicates they are a UK resident.

### 3. Regional FX Dial (API Handshake)
* **API:** Integration with a real-time currency API (e.g., Fixer.io or CurrencyLayer).
* **Update Frequency:** Fetch latest GBP/USD/EUR rates every 4 hours for active HVT pass-holders.
* **Watch Render:** Sub-dial 4 must display the $/Gal equivalent using the formula: `(Price per Litre * 3.785) * FX_Rate`.

---

## PART 27: Resident Retention UX (Watch Face)

### 1. The "Daily ROI" Handshake
* **Visual Rule:** Sub-dial B (Savings Momentum) and Sub-dial A (Loyalty Loop) must be presented as a paired "Value Set" for Resident users.
* **Logic:** The UI must prioritize the display of "Total Monthly Savings" (£) to reinforce the subscription ROI every time the user checks their watch.

### 2. Subscription Paywall Logic
* **Entitlements:** 
    * **Free:** Basic mobile search and static price maps.
    * **Premium (£4.99/mo):** Unlocks the "Daily Commute" background monitoring, CarPlay push notifications, and "Fill Up Today" AI price predictions.

---

## PART 28: "Pump Chronograph" Dial Configuration (Watch Ultra)

### 1. Sub-Dial 1: The "Smart Converter" (Top Left)
* **User:** Traveler/Elite.
* **Logic:** Real-time conversion of GBP/Litre to Home Currency/Unit (e.g., $4.20/gal).
* **Visual:** Tiny flag icon (🇺🇸/🇪🇺) with sharp data readout.

### 2. Sub-Dial 2: "Time-to-Tank" (Top Right)
* **User:** Traveler (Guided Return).
* **Logic:** Dynamic countdown showing distance/time (e.g., "12m" / "3.5mi") to the optimal partner station before the airport hub.

### 3. Sub-Dial 3: "The Orange Satoshi" (Bottom Left)
* **Logic:** Lifetime Satoshi balance with "Active Session" pulse.
* **Visual:** Glowing Bitcoin "₿" symbol. 
* **Trigger:** Pulsing animation activates when entering a geofenced station coordinates to signal reward eligibility.

### 4. Sub-Dial 4: Adaptive "Return Deadline" (Bottom Right)
* **User:** Traveler (Duffel API Link).
* **Logic:** Ticking digital timer linked to the car-rental return deadline.
* **Goal:** Eliminate "Late Fee" anxiety by visualizing the remaining window.

---

## PART 22: "Sats Switch" Biometric Ignition Toggle

### 1. Objective
Deliver a high-security biometric "Ignition" switch authorizing Satoshi streaming upon completion of a verified "Proof-of-Refuel" cycle.

### 2. Biometric Handshake Logic
* **Framework:** Implement via Apple's [LocalAuthentication framework](https://apple.com).
* **Constraints:**
    * **Mandatory Biometrics:** FaceID or TouchID required.
    * **Security Level:** `LAPolicyDeviceOwnerAuthenticationWithBiometrics` (Strictly forbids passcode fallback).
    * **Authorization:** Payout Engine (Part 14) is gated by Secure Enclave confirmation.

### 3. Visual & Haptic Feedback
* **UI Element:** Large, skeuomorphic "Ignition Toggle" in International Orange (#F7931A).
* **Interaction:** Toggle slides to "Active" position with a 150ms mechanical sweeping animation upon FaceID success.
* **Haptics:** Trigger `UIImpactFeedbackGenerator(style: .heavy)` to simulate the physical engagement of a car relay.

---

## PART 30: Wallet Redemption & "Legacy" Bridge

### 1. The Lightning Bridge (Satoshi Payout)
* **One-Tap Stream (Fountain):** 
    * Handshake: Call the Fountain/ZBD API to move Sats from the `PumpWallet` balance to the user's `FountainID`.
    * Feedback: Trigger a "Stream Successful" HUD overlay on the phone.
* **External Withdrawal:** 
    * Protocol: Support `LNURL-withdraw` for seamless transfers to nodes like Alby, Phoenix, or Strike.

### 2. The Legacy Loop (Fiat/Voucher Payout)
* **Voucher Provisioning:** 
    * Integration: Connect to a gift card API (e.g., Rybbon or Tango Card).
    * Threshold: Logic gate prevents redemption until the "Gold Milestone" (£10 / 1,000 points) is achieved (Part 20).
* **QR Handshake:** 
    * Display Logic: Render a high-contrast, scannable QR code for Nectar/Clubcard. 
    * Bracketing: Ensure screen brightness is automatically forced to 100% when the QR code is active for pump-scanner reliability.

### 3. Real-Time Valuation Engine
* **Logic:** Continuously fetch the BTC/GBP mid-market rate (via CoinGecko or Kraken API).
* **Display:** Update the "Approximate GBP" value on Screen 3 every 60 seconds while the app is in the foreground.

---

## PART 31: Device Calibration & Telemetry Sync

### 1. The "Test Handshake" Logic
* **Objective:** Allow the user to manually verify the three-way data link (Watch-Phone-Car).
* **Execution:** 
    - Trigger a test `WCSession` message to the Watch.
    - Result: Watch must perform a 1-second "Sweep" of all sub-dials.
    - Visual: Display a "Handshake Verified" HUD overlay on the phone.

### 2. OBD-II Persistence
* **Logic:** Maintain a background Bluetooth/WiFi handshake with the vehicle's ECU.
* **Fallback:** If OBD-II disconnects, the UI must automatically pivot to "GPS/Manual" mode and notify the user to verify fuel via OCR (Part 19).

---

## PART 32: Dual-Path Onboarding (Fiat vs. Crypto)

### 1. Identity & Niche Selection
* **UI Choice:** User selects between "Local Resident" (Daily Optimizer) or "Traveler" (Rental Guided Return).
* **Impact:** Determines the initial CarPlay template configuration and data refresh cycle (5-min vs. 30-min).

### 2. The "Fiat-First" Reward Fork
* **Option A: Standard Savings:** Default state for mass-market users. Focus on GBP Cashback, supermarket vouchers, and digital points.
* **Option B: Digital Gold:** Activates the "International Orange" UI, Satoshi counters, and Lightning Network payout engine.

### 3. "Zero-Friction" Verification (Optional)
* **API Integration:** Connect via **Plaid** or **TrueLayer** (Open Banking).
* **Logic:** Automatically verify refueling transactions via bank statement data (Merchant Name + Total) to eliminate the need for manual OCR scanning.

---

## PART 33: Verified Activity Feed & "Lead-Fee" Logic

### 1. The "Verified Transaction" Data Model
* **Logic:** An entry is only marked as "Verified" (Green Icon) once the following three-way handshake is complete:
    1. **GPS Dwell:** User remained at station coordinates for > 3 minutes.
    2. **Transaction Proof:** OCR Receipt scan or Open Banking (Plaid) confirms spend at that Merchant.
    3. **Postback Confirmation:** The Partner API (e.g., Sainsbury's) acknowledges the "Lead-Fee" trigger.
* **UI Detail:** Display "Lead-fee verified" in the transaction drill-down to build user trust in the financial accuracy of the platform.

### 2. Glassmorphic Feed UI
* **Aesthetic:** High-fidelity list cards using `BackdropFilter` (SwiftUI/React Native) for semi-transparent frosting.
* **Fiat Mode Indicators:** Display a bold **Green "£"** and the merchant’s secondary brand logo.
* **Satoshi Mode Indicators:** Display a pulsing **Orange "₿"** symbol.
* **"Smart Summary":** Each entry must clearly state: "Spent £X.XX | Saved £X.XX" to highlight the immediate ROI of the diversion.

### 3. The Growth Trigger (Referral Link)
* **Function:** Every transaction card features a "Share Victory" action.
* **Payload:** Generates a deep-linked URL containing the user’s referral ID and a summary of the savings (e.g., "Refueler just saved me £4.12 at Sainsbury’s! Use my link to save on your next tank: refueler.io/join/user123").

---

## PART 34: Auto-Transfer & Vault Logic (Plaid Integration)

### 1. The "Auto-Sweep" Engine
* **Logic:** If the user has an active **Plaid/TrueLayer** connection, enable an optional "Monthly Sweep."
* **Trigger:** On the 1st of every month, if the balance is > £10, initiate a transfer of the verified cashback amount to the user's designated "Savings Pot."
* **Notification:** Send a success alert: "Smart Move: £18.40 in fuel savings has been swept to your Monzo Pot."

### 2. Premium Payout Tiers
* **Logic:** Dynamically hide/show redemption tiles based on the user's current milestone (Part 20).
* **High-Luxe Provisioning:** For the "Elite" tier, offer exclusive redemption options (e.g., Airport Lounge Passes or Premium Rental Upgrades).

---

## PART 35: "Savings-First" Onboarding & Premium State Toggle

### 1. The "Fiat Baseline" (Default State)
* **Objective:** Ensure the app functions as a high-utility "Cashback" tool for zero-friction mass market entry.
* **Logic:** Upon first launch, the UI defaults to **Electric Cobalt (#2E5BFF)**. All rewards are denominated in GBP (£).
* **Entitlement:** Users in the "Baseline" state receive standard cashback offers and gift card redemption options only.

### 2. The "Sats Switch" (Premium Upgrade Flow)
* **Trigger:** A "Boost Your Savings" CTA (Call to Action) presented after the user's first verified £-based refuel.
* **The Transition:** 
    - **Visual:** The "Sovereign Toggle" (Part 30) animates to the Orange state.
    - **Haptics:** Trigger `UIImpactFeedbackGenerator(style: .heavy)` to signal a "Mechanical System Upgrade."
* **Bitcoin-as-a-Service (BaaS) Initialization:**
    - Background: Silently generate an LDK-based Lightning wallet address for the user.
    - User Action: No seed-phrase backup required for the "Custodial Alpha" phase to maintain the "Savings App" simplicity.

### 3. State-Persistence Rule
* **Memory:** The app must persist the user's chosen Mode (Fiat vs. Sats) across all sessions and device handshakes (Watch/CarPlay).
* **Handshake:** When the mode is switched on the Phone, an immediate `WCSession` message must force the Watch dial to update its "Materials" (Brushed Steel for Fiat vs. Digital Pulse for Sats).

---

## PART 36: Fiat Reward Engine (Instant Utility)

### 1. Reward Logic & Delivery
* **Objective:** Deliver immediate, tangible value to "Standard Savings" users upon verified Proof-of-Refuel.
* **Redemption Mechanics:**
    * **The Station Credit:** Deliver a unique QR/Barcode for "50p off next fill-up." Logic: Requires a 2nd visit, driving forecourt loyalty.
    * **The Traveler’s Perk:** Integration with coffee/food partner APIs (e.g., Costa) to deliver a "Free Drink" QR code instantly to the Watch/CarPlay screen.
    * **The Duffel Rebate:** Automatically trigger a `POST` request to the Duffel API to apply a £2.00 credit to the user's car hire order.

### 2. Multi-Device Display
* **CarPlay:** Render the reward notification as a `CPAlertTemplate` with a "View Voucher" button.
* **Apple Watch:** Store the barcode in the "Loyalty Loop" sub-dial for one-tap scanning at the pump.

---

## PART 37: Reward Delta & "Nudge" Logic

### 1. The Adoption Premium
* **Logic:** To incentivize the transition to the "Digital Gold" path, the system must apply a **10%–20% premium** to rewards settled via the Lightning Network compared to Fiat vouchers.
* **Dynamic Valuation:** The backend must fetch the real-time BTC/GBP rate to ensure the Satoshi "Nudge" always presents a higher perceived value than the fiat alternative.

### 2. The "One-Tap" Conversion
* **Action:** If the user selects the Satoshi option for the first time, trigger the **"Sats Switch" Flow (Part 35)** to initialize their LDK wallet instantly.

---

## PART 38: Fiat-to-V4V Tipping Handshake

### 1. The Fountain Fiat Bridge
* **API Integration:** Connect to the **Fountain/ZBD Fiat API** to facilitate sub-account funding.
* **Logic:** When a user selects "Tip via Cashback," the system deducts the amount from the `Refueler_Fiat_Vault` and executes a server-to-server credit to the user's Fountain account.
* **Psychology:** Present this as a "Zero-Cost Tip" – users are supporting artists using recovered "Convenience Tax," not their bank balance.

### 2. Back-end Conversion Transparency
* **User UI:** The user sees a "£1.00 Tip Sent" confirmation.
* **System Logic:** Fountain handles the conversion to Satoshis for the creator; Refueler maintains the "Fiat Baseline" for the sender to ensure zero technical friction.

---

## PART 39: Transactional Accounting & "Dust" Logic

### 1. Revenue Distribution (The Split)
* **Logic:** Upon verified Proof-of-Refuel, the backend must calculate the stakeholder split based on the user's active Mode (Fiat vs. Sats).
* **Transaction "Dust":** In the Satoshi path, fractional Sats (the "Dust") generated during the Lightning Network route-finding process are captured by the **REFUEL Routing Node** as secondary yield.

### 2. Marketing "Nudge" Allocation
* **Action:** For the Satoshi path, allocate a small "Bonus Sat" pool from the marketing budget to maintain the 10-20% "Nudge" delta (Part 37).

---

---

## PART 40: REFUEL Revenue Model (Per 50L Fill-Up)

### 1. The Financial Breakdown (Standard 50L Tank)
* **Retailer Commission:** REFUEL captures a flat commission (e.g., £0.50) from the supermarket for the verified "Conquest Sale."
* **Partner Share (Fountain):** 
    - **Fiat Path:** £0.50 is allocated to the user's Fiat Tip Jar.
    - **Satoshi Path:** £0.75 (equivalent) is "zapped" to the creator, incentivized by the Lightning Network's lower fees.
* **Platform Yield:** REFUEL retains the remainder + "Transaction Dust" from the Lightning routing.

### 2. Clearing House Logic
* **Logic:** The backend acts as a central clearing house, programmatically splitting the commission between the User (Reward), Partner (Fountain Tip), and Platform (Revenue) at the point of verification.

# Functional Specifications: Resident "Daily Driver" Logic

## CarPlay & Navigation Triggers
- **Detour Buffer:** Max 3-min or 1.5 miles added to active route.
- **Price Prediction:** Trigger "Fill Up Now" alerts if regional prices rise for 3 consecutive days.
- **HVT Scoring:** 60% Price / 40% Traffic Delay weighting.
- **Urgent Mode:** At 15% fuel, trigger "Urgent Diversion" (Absolute cheapest/nearest partner).

## Verification (The Triple-Handshake)
1. **GPS Geofence:** Intent (Divert tap) + Arrival at station.
2. **Dwell Time:** Must maintain 3-minute dwell at the station coordinates.
3. **Exit Vector:** Must detect a >15mph exit vector from the station to confirm the trip has resumed.

## Hardware & Sync
- **OBD-II Handshake:** Optional Bluetooth link for 100% fuel level accuracy.
- **Flick to Car:** Selection on Watch triggers `CPPointOfInterestTemplate` on CarPlay via `WCSession`.
