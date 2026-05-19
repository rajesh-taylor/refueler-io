# UI Animation Specs: The "Sats Switch" Ignition

## 1. The Mechanical Sweep (SVG/Reanimated)
- **Component:** Breguet Second Hand (Navy Blue).
- **Trigger:** Biometric (FaceID) success.
- **Action:** 
    - Perform a 1080-degree (3 full rotations) "Clearance Sweep."
    - Duration: 1.2 seconds.
    - Easing: `Easing.bezier(0.4, 0, 0.2, 1)` (Mechanical recoil feel).
- **Settlement:** After the sweep, the hand enters a "Live Pulse" state (1Hz vibration at 0.5-degree amplitude) to signal an active Lightning channel.

## 2. Haptic Escapement (Expo-Haptics)
- **Logic:** Sync haptics with the SVG rotation.
- **Pattern:** `Haptic.impactAsync(Haptic.ImpactFeedbackStyle.Light)` triggered every 30 degrees of rotation.
- **Sensation:** This mimics the physical "tick" of a mechanical escapement during the high-speed sweep.

## 3. The "Orange Transition" (State Shift)
- **Transition:** Upon settlement, the UI palette shifts:
    - **From:** Cream (#FFFDD0) / Slate Blue (#7097BB)
    - **To:** International Orange (#F7931A) / Charcoal (#121212)
- **CarPlay Sync:** Use `WCSession` to trigger a `CPAlertTemplate` on the vehicle display with a pulsing "₿" icon.

## 4. The "In-Car Handshake" (Costco Protocol)
- **Safety Standard:** Zone 2 Authorization (Sitting inside the vehicle).
- **Process:** User authorizes pump via CarPlay/Watch while stationary in the queue; Phone remains in-vehicle during physical refueling.
- **Universal QR Code:** Programmatic generation of a single 'Composite QR' (Membership ID + Payment Token) for Watch/CarPlay display.
- **Goal:** Eliminate the 'Two-Card Fumble' (Plastic membership + Credit card).

## 5. The "Passive Watch" Constraint (Safety Compliance)
- **Station Behavior:** UK attendants are trained to deactivate pumps if active device interaction is detected.
- **Watch State (Zone 1 - Outside):** Strictly passive. Display a static "Ready to Fuel" Green Ring/Breguet Dial. Disable all buttons to prevent accidental interaction.
- **Handshake (Zone 2 - Inside):** All pump selection (e.g., "Pump 4") and authorization must happen on the CarPlay/iPhone screen before the driver exits.
- **Post-Refuel Loop:** Watch triggers `WKHapticTypeSuccess` and displays the receipt only once the "Exit Vector" (>15mph) is detected.

## 6. Adaptive State Machine: The "Pit Stop" Mode
- **Geofence Trigger:** Detect entrance to Partner Store ID (e.g., Costco Watford).
- **UI Transformation (The "Action Swap"):**
    - **Primary Action:** Replace 'Navigation' with a high-contrast 'Universal QR' (Speed priority).
    - **Secondary Data:** Replace 'Price Delta' with 'Queue Timer' (e.g., "Pump 4 opening in 30s").
- **Haptic Feedback:** Trigger `WKHapticTypeSuccess` upon 100% nozzle-return detection to confirm transaction completion.
- **Post-Refuel State:** Revert to 'Standard Mode' once the Exit Vector (>15mph) is confirmed.

## 7. Adaptive State Machine: The "Valet" Mode (EV/Retail)
- **Trigger:** Geofence entry to Shopping/Hub IDs (e.g., Lakeside).
- **Live Activity (Dynamic Island):** 
    - **Display:** Active Charge Progress Ring + Shopping Timer.
    - **Proximity Note:** "Walk to [Retail Partner]: 3 mins."
- **Nudge Logic:** Trigger 'Early Departure' reward (50 Sats) if the vehicle is moved within 5 mins of reaching 80% SoC.
- **Haptic Alerts:** Utilize `WKHapticTypeDirectional` for "Idle Fee" warnings to ensure the user is notified without looking at their phone.

## 8. The "Golden Path" Prototype (30-Second UVP)
- **Constraint:** Zero focus on Settings/Auth; 100% focus on the 'Frictionless Flow.'
- **Sequence 1: The Trigger (Lock Screen/CarPlay)**
    - Costco: "Queue Alert: Pump 4 is open. Save 15 mins."
    - Lakeside: "Charge Status: 80%. Move car to earn 50 Sats."
- **Sequence 2: The Action (The 'Hero' Interaction)**
    - **Visual:** High-contrast 'Universal QR' on Watch/CarPlay.
    - **Haptic:** Mechanical 'click' sync upon pump ignition.
- **Sequence 3: The Payoff (Dopamine Loop)**
    - **Visual:** The 'Sats Counter' spinning animation (Orange #F7931A).
    - **Utility:** "HMRC VAT Invoice generated & synced to Xero."

## 9. Hero Card Architecture (Contextual Swaps)
- **Framework:** Utilize a 'Card-Based' UI where the top 50% of the screen is a dynamic 'Hero Component.'
- **States:**
    - **Cruising:** Default 'Breguet Radar' view for discovery.
    - **Refueling (Costco):** Automatic swap to 'Universal QR' + 'Pump ID' upon pump authorization.
    - **Charging (Lakeside):** Automatic swap to 'Dwell Progress Ring' with 'Idle Fee' warnings.
    - **Hosting (Station Master):** Manual or Geofenced toggle to 'Revenue Ticker' and 'Driveway Status.'
- **Transitions:** Use `react-native-reanimated` for 'Card Flip' or 'Cross-Fade' transitions (Duration: 300ms) to ensure the swap feels fluid and premium.

## 11. Prototype Script: Destination OS (Lakeside Path)
- **Primary Goal:** Prove Bay Turnover (Revenue) via 'Unplug' Gamification.
- **Scene 1 (Entry):** Geofence trigger -> 'Universal Key' prompt on Watch.
- **Scene 2 (The Shop):** Dynamic Island 'Shopping Timer' (BMS Sync).
- **Scene 3 (The Payoff):** 'Overstay Bounty' alert (500 Sats nudge) triggered at 80% SoC.
- **Technical Requirement:** Seamless transition from 'Radar Mode' to 'Valet Mode' based on Mall Geofencing.

## 12. The App Clip "Universal Handshake" (Lakeside Path)
- **Trigger:** NFC Tap/QR Scan on generic charging post.
- **Action:** Launch iOS App Clip (zero-download binary).
- **Process:** Instant Apple Pay 'Hold' Sheet (£30) -> Auto-unlock charger.
- **Goal:** "Zero Friction. Zero Accounts. 10 Seconds to Charge."

## 13. The "Concierge" Timer (Shop & Forget)
- **Constraint:** Replace all kW/h metrics with 'Shopping Time Remaining.'
- **Watch UI:** Reverse countdown ring with high-fidelity Breguet aesthetic.
- **Sub-text:** "Car will reach 80% at [Target Time]."
- **Goal:** Shift user mindset from 'Charging Technicals' to 'Retail Leisure.'

## 14. The "Bounty" Nudge (Loss Aversion Loop)
- **Trigger:** Battery SoC > 80% OR High Regional Demand detected.
- **UI Element:** 10-minute high-visibility countdown timer (International Orange #F7931A).
- **Incentive:** "Unplug in [Time] to earn [Starbucks Voucher/Sats Reward]."
- **Psychology:** Utilize 'Loss Aversion'—if the timer hits zero, the reward is rescinded.

## 15. The "Exit" (Smart Reroute Upsell)
- **Trigger:** Connector removal detected via BMS/Network status.
- **Final Payoff:** Display 'Session Summary' + 'Voucher/Reward' saved to Apple Wallet.
- **Navigation Pivot:** Automatic 'Smart Prompt' for the homeward journey: "M25 Heavy. Rerouting via A13 (Savings: 8 mins)."

## 16. Prototype Script: Resident Mode (The Smart Commute)
- **Primary Goal:** Break 'Autopilot' habits via gamified arbitrage and time-value logic.
- **Scene 1 (The Pass-By):** 
    - **Trigger:** Fuel < 30% + Regional Price Delta > 5p/litre.
    - **UI (CarPlay):** 'Flash Opportunity' alert with Green 'Asda/Sainsbury' highlight.
    - **Data Nudge:** Display 'Cash Saved' vs 'Time Cost' (e.g., "Save £4.20 vs. Shell / +3 mins detour").
- **Scene 2 (Loyalty Aggregation):** 
    - **Visual:** Consolidate fragmented cards into a single 'Progress Ring' on the Watch face.
    - **Vibe:** 'Thrifty/Efficient' aesthetic using Electric Cobalt (#2E5BFF).

## 17. The "Combo Breaker" (Loyalty + Payment Merge)
- **Trigger:** Engine Off + Verified Geofence (Partner Station).
- **Watch UI:** 'Stack' animation where Payment (Apple Pay) and Loyalty (e.g., Nectar) layers merge into a single scanable 'Universal Code.'
- **Goal:** Eliminate the 'Two-Card Fumble' and ensure 100% loyalty attribution.

## 18. The "Weekly Goal" (Gamified Resident Logic)
- **Live Activity:** Persistent circular progress bar tracking 'Weekly Savings Goal.'
- **Dopamine Loop:** Instant haptic and visual feedback post-transaction: "You saved £4.20 today."
- **Sats Transition:** Provide a 1-tap 'Convert to Sats' nudge to shift fiat savings into the V4V ecosystem.

## 19. Prototype Script: Diplomat Mode (The Universal Translator)
- **Primary Goal:** Eliminate international travel anxiety via unit and currency normalization.
- **Scene 1 (The Translator):** 
    - **Watch UI:** Real-time conversion of local pricing (e.g., $3.80/Gal) to home units (e.g., £0.79/Litre).
    - **Indicator:** Minimalist 'Green Dot' (Cheap) vs 'Red Dot' (Tourist Trap) based on regional benchmarks.
- **Scene 2 (The Safety Net):** 
    - **Trigger:** 15-mile proximity to Airport/Rental Return Geofence.
    - **UI (CarPlay):** 'Rental Return Mode' active; provide guidance to compliant fuel stations to ensure 'Full-to-Full' handoff.
- **Scene 3 (The Proof):** 
    - **Payload:** Generate an 'Empty Tank Dispute Protection' card upon engine-off at Return Center.

## 20. Prototype Script: Station Master Mode (The Power Plant)
- **Primary Goal:** Visualize passive income through energy arbitrage (Buy Low / Sell High).
- **Scene 1 (The Setup):** 
    - **UI (Mobile):** Dual-slider 'Spread' graph (e.g., 7.5p Buy vs. 45p Sell). 
    - **Logic:** Forecast 'Monthly Profit' based on Octopus Intelligent/Agile tariff sync.
- **Scene 2 (The Handshake):** 
    - **Watch UI:** 'Incoming Pit Stop' alert; Smart Lock/Gate integration (Approve & Open).
    - **Visual:** High-fidelity vehicle profile (e.g., 'Blue Tesla Model 3').
- **Scene 3 (The Ledger):** 
    - **UI (Earnings):** Breakdown of Energy Profit vs. Parking Fees.
    - **Compliance:** Track 'HMRC Tax-Free Allowance' status (£1,000 threshold).
    - **Payout:** Dual-track option: 'Cash Out (GBP)' or 'Stack (Bitcoin)'.
