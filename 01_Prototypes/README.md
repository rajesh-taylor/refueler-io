# 01: Core Prototypes
**Focus:** Technical execution of the "Cartier-CarPlay" UI/UX.
- **Goal:** High-fidelity skeuomorphic React Native components.
- **Key Files:** 
  - `refuel-watch-v2.html`: Current iteration of the Cartier Watch Face.
  - `03-carplay-refuel.html`: Current CarPlay Dashboard Widget build.
- **Tech Rules:** Maintain #FFFDD0 / #7097BB palette and Roman numerals.

## Mobile App Wireframe Specs
- **Screen 1 (Home):** "Savings Chronograph" dial. Swipe to toggle Sats/Cashback. Summary cards for Lifetime Savings and Milestones.
- **Screen 2 (Activity):** List of "Smart Transactions" with verification status (GPS/Telemetry vs. OCR).
- **Screen 3 (Wallet):** "Lightning Bridge" for Fountain/External node and "Legacy Loop" for QR-based voucher redemption.
- **Screen 4 (Sync):** Live OBD-II dashboard (Fuel %) and CarPlay/Watch handshake calibration.

## Final Layout: Adaptive Chronograph
- **Header:** Haptic toggle [ Fiat | Sats ]. Left: Profile. Right: Settings.
- **Central Dial:** Interactive wheel tracking £10 payout progress (Fiat) or Satoshi balance (Orange).
- **Activity Feed:** Glassmorphic cards with merchant logos and verification status.
- **Vault:** Premium tiles for Amazon/PayPal or Lightning QR for Satoshi withdraw.

---

## Mobile UI: Screen 1 (The Command Center)
- **Header:** 
    - Left: Profile (Nectar/Clubcard/PumpWallet sync).
    - Right: Settings (CarPlay/Watch pairing and notification thresholds).
- **Central Visual: The "Savings Chronograph":**
    - **Digital Twin:** A high-fidelity mobile version of the Apple Watch Dial.
    - **Interaction:** Swipe left/right on the dial to toggle between **Satoshi View** (Orange) and **Cashback View** (Blue).
- **Summary Cards (Dopamine Layer):**
    - **Lifetime Savings:** Cumulative £ saved.
    - **Current Balance:** Sats or Pump Points ready for redemption.
    - **Milestone Tracker:** "£1.60 more to your next £5 Sainsbury’s voucher."

---

## Mobile UI: Screen 2 (The Activity Feed)
- **Concept:** A list of "Smart Transactions" detailing every verified refuel.
- **List Item Architecture:** 
    - **Branding:** Station Logo (Sainsbury's, BP, etc.) + Date.
    - **Value:** Total Saved (£) and Reward Earned (Sats/Points).
    - **Verification Status:** Green Tick (GPS + Telemetry) vs. Amber Clock (OCR Pending).
- **Detail View (Drill-Down):** 
    - Geographic map of the specific transaction.
    - **Growth Trigger:** "Share" button linked to the **Car Sticker Growth Hack** (Individual referral link).

---

## Mobile UI: Screen 3 (Wallet & Rewards)
- **Balance Header:** High-visibility Satoshi balance with real-time **GBP conversion** (e.g., 15,000 Sats ≈ £8.50).
- **The "Lightning Bridge" (Sats Path):**
    - **One-Tap Stream:** Dedicated "Send to Fountain" button for V4V podcasting.
    - **Self-Custody:** "Withdraw to External Node" for manual LNURL/Lightning address transfers.
- **The "Legacy Loop" (Fiat Path):**
    - **Digital Loyalty:** QR code display for Nectar/Clubcard (fallback for no-Watch scenarios).
    - **Voucher Menu:** Integrated marketplace for Amazon, Morrisons, and supermarket gift cards.

---

## Mobile UI: Screen 4 (Sync & Calibration)
- **Vehicle Status:** 
    - **Live Telemetry:** Display "Vehicle Connected" (e.g., Audi A4) with a green status LED.
    - **Fuel Level:** Real-time percentage readout (e.g., 42%) pulled via OBD-II/CarPlay.
- **Notification Control:** 
    - Granular toggles for 25% (Planner) and 15% (Urgent) geofence alerts.
- **The "Test Handshake":** 
    - **Calibration Button:** Manual trigger to verify `WCSession` (Watch) and `CPTemplate` (Car) are perfectly mirrored.

---

## Mobile UI Architecture: The Adaptive Chronograph
- **Header:** A sleek, haptic toggle at the top of the screen: **[ Fiat | Sats ]**.
- **Central Interactive Dial:** 
    - **Fiat Mode:** Outer ring tracks progress toward the **£10 "Gold State" payout**.
    - **Sub-Dial A:** Current Regional Price (Real-time average).
    - **Sub-Dial B:** Monthly Saved Total (The "Dopamine" figure).
    - **Sub-Dial C:** Active Loyalty Points (Nectar/Clubcard progress).
- **Glance Stat:** Bold readout below the dial: *"You are currently saving X.Xp/L vs. your local average."*
- **Activity Feed (Glassmorphism):** High-fidelity cards with semi-transparent backgrounds for "Verified Transactions."

---

## Mobile UI: The "Payout & Vault" Screen
- **Fiat Path (Cashback):**
    - **Aesthetic:** Clean, high-contrast Serif font for the GBP balance to convey "Institutional Stability."
    - **Redemption Grid:** Premium glassmorphic tiles for **Amazon, John Lewis, and PayPal**.
    - **Auto-Transfer:** A dedicated toggle to "Sweep" monthly savings directly into a connected bank "Pot" (Plaid/TrueLayer).
- **Sats Path (Digital Gold):**
    - **Visual:** Large Satoshi count in International Orange.
    - **Actions:** 
        - **"Stream to Fountain":** Instant V4V podcasting transfer.
        - **"Lightning QR":** On-screen QR generation for external wallet withdrawals.

---

## Mobile UI: The "Dual-Track" Reward Choice
- **Goal:** Nudge "Fiat-First" users toward the Satoshi ecosystem via Value Anchoring.
- **The Prompt:** 
    - **Header:** "You've saved £[X.XX]! Choose your reward:"
    - **Option A (Fiat):** Standard Cashback Voucher (e.g., £0.50).
    - **Option B (Sats):** Premium Satoshi Reward (e.g., 2,000 Sats / ~£1.20 value).
- **Visuals:** Highlight the Satoshi option with a subtle "High-Value" glow to emphasize the 2x reward delta.
