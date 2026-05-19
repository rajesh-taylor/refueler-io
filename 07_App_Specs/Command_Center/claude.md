# REFUELER | Command Centre: Master Spec v1.0

## Project Overview
A high-end technical dashboard for retail site auditing, infrastructure management, and LDK (Lightning Development Kit) settlement. This spec covers the transition from a 2-panel telemetry view to an optional 3-window geospatial command centre.

## Core Visual Identity
- **Theme:** Carbon (Dark) by default; Paper (Light) as secondary.
- **Design Language:** Hairline dividers (0.5px), Bitcoin Orange (#F7931A), LDK Green (#30D158), and Teal (#008080).
- **Typography:** SF Pro Display / SF Mono for technical logs.

## 16-Point Master Logic List

1. Visual Language & UI Identity
* Theme: Deep Carbon / High Contrast.
* Colors: * Primary Background: #0C0C0C
    * Borders/Dividers: Hairline strokes (0.5px) using rgba(255, 255, 255, 0.1).
    * Accent Colors: Bitcoin Orange (#F7931A) for value, LDK Green (#30D158) for success, and Teal (#008080) for UI highlights.
* Typography: Premium Sans-Serif stack (Inter/SF Pro Display) with wide letter-spacing on headers and monospaced "SF Mono" for telemetry.
* Hairline Integrity: Ensure all new containers use 0.5px solid var(--border) to maintain the hairline aesthetic across both the 2-panel. This is the visual foundation for every window and sidebar."

2. Dashboard Architecture (The 2-Panel Core)
* Left Side (The Control Panel):
    * Top Navigation: Theme Toggle (L/D), Mode Toggle (Live/Retail), and View Toggle (Audit/Infra).
    * Site Identity: Displays the active site (e.g., Lakeside Car Park G) and geofence status.
    * The Verify Dial: A central, dashed-hairline circular element that pulses green upon a successful LDK session verification.
    * Primary Action: A full-width, high-contrast "VERIFY SESSION" button at the base.
* Right Side (The Results Viewport):
    * Header Status: Persistent display of active Coordinates and Network type (Encrypted LDK).
    * Live Telemetry: A scrolling log of system events, timestamped, and rendered in high-visibility green terminal text.
* Initialization Sequence:
 * The map.js loads the Mapbox GL instance into the #map div.
    * The map.resize() command is called immediately after the DOM loads to ensure the map recognizes the width of the Left Sidebar.
    * The Map style is set to dark-v11 by default but must listen for the .light-theme class to switch to light-v11.
* Marker Logic: On a successful verification, the map should execute a flyTo command to the specific site coordinates (e.g., Lakeside Car Park G) and drop a custom marker in --orange.
* Default Viewport Logic: By default, the #telemetry-console occupies 100% of the right-hand viewport height. The Mapbox container remains dormant/hidden until the optional transition is triggered. The Left Sidebar remains fixed at 380px regardless of right-hand layout shifts.

3. Logic & Interaction Flow
1. Initialization: System boots, connects to LDK Node, and renders the dark-v11 map (or telemetry field).
2. Verification Trigger: User initiates a session verify.
    * Step A: The Verify Dial on the left changes from a dashed border to a solid green glow.
    * Step B: A new entry is pushed to the Telemetry Log on the right with a real-time timestamp.
    * Step C: The right-hand viewport auto-scrolls to the latest entry.
3. Theme Logic: A global class switch handles the transition between Dark and Light themes for both the CSS variables and the Mapbox styles.
4. LDK Verification (The Trigger)
* Active Button States: A switchMode(this) function that removes the .active class from all siblings in a group and applies it to the clicked button (changing the background to --teal or --green). This provides immediate tactile feedback for Mode (Live/Retail) and View (Audit/Infra) changes."
This is where the actual code lives. You’ll add the logic that tells the browser: "When this button is clicked, start the dial animation and send data to the telemetry log."

4. Map Integration
* The system must be capable of transitioning from the 2-panel Telemetry view to a 3-window layout as an option later in future updates:
    * Window 1: Left Sidebar (Controls).
    * Window 2: Result from Verify button work.
    * When the "3-Window" option is toggled, the #results-viewport shifts to flex-direction: column. The #map-container and #telemetry-console split the vertical space exactly 50/50. Ensure a horizontal 0.5px solid var(--border) separates them.
    * Transition Handshake: Use a CSS transition on the height property to 'slide' the map into view. Immediately follow with map.resize() to prevent canvas stretching.

5. Partner & ROI Logic (The "Costco/Costa" Engine)
* Dynamic Partner Card:
    * Data Source: Each "Retail Site" (e.g., Lakeside Car Park G) is linked to an active_partner (e.g., Costa Coffee or Costco).
    * The "Satoshi Path": A live percentage value representing the progression of a Bitcoin transaction/reward.
    * UI Trigger: When Verify Session is successful, the partner-sub text should momentarily pulse orange to simulate a data refresh.
* The Multiplier Math:
    * Diversion Multiplier: A calculated value (e.g., 3.2x) representing the increased likelihood of a user visiting the partner store due to the LDK session.
    * Sats Velocity: A real-time metric (e.g., 120 s/z) measuring the speed of Satoshi transfers within the geofence.
* Mode-Based Content:
    * In AUDIT Mode: The card displays technical verification (Geofence, Dwell, Conquest).
    * In RETAIL Mode: The card swaps to display specific Partner ROI, such as "Projected Footfall" or "Redemption Rate."

6. The Update Logic
* Content: This file tracks:
    1. Current Build State: (e.g., "2-Panel Verified, Dial Active").
    2. Next Action Item: (e.g., "Implement Mapbox transition").
    3. Known Bugs: (e.g., "Sidebar order needs locking").
* Hairline Integrity: Ensure all new containers use 0.5px solid var(--border) to maintain the hairline aesthetic across both the 2-panel and 3-panel versions. This ensures the dashboard maintains its premium "technical" feel even as it scales.

7. Costco & Retail Mode Logic
* Mode Switch Trigger: Clicking the RETAIL toggle button.
* The "Costco Switch": * Context: While Costa is the default partner for the "Audit" phase, Costco represents the high-volume retail verification phase.
    * UI Update: The partner-name element transitions from "Costa Coffee" to "Costco Wholesale."
    * Logic Change: The "Satoshi Path" percentage should reflect actual redemption data (e.g., "Active Rebate: 4%") rather than session progression.
* Multiplier Pivot:
    * In RETAIL mode, the "Diversion Multiplier" changes from a theoretical projection to a "Live Capture Rate," showing how many verified LDK users are currently inside the Costco geofence.
* Verify Dial in Retail Mode:
    * Instead of just "VERIFIED_SUCCESS," the telemetry log on the right should print retail-specific strings: RETAIL_REDEEM_AUTH: costco_uk_082.

8. The "HUD" (Heads-Up Display) Logic
* Auto-Hide Behavior: The HUD (Coordinates/Network) should have a high z-index but should lower its opacity to 20% if the user starts dragging the map, then fade back to 100% after 2 seconds of inactivity.
* Dynamic Refresh: The coordinates shouldn't be static strings. The logic was planned so that if the map "FlyTo" executes, the HUD coordinates update in real-time to match the new center point of the map view.
* Theme Toggle: A single function toggleTheme() that toggles a .light-theme class on the <body>. All hairline dividers and text colors must respond via CSS variables to ensure a seamless transition between Carbon and Paper modes."
* Theme Toggle: A single function toggleTheme() that toggles a .light-theme class on the <body>. All hairline dividers, text colors, and Mapbox styles must respond via CSS variables to ensure a seamless transition between modes.

9. Sequential Boot Sequence (The "Handshake")
* Initialization Delay: On page load, the Javascript runs a setInterval that pushes the first 3 lines of telemetry with a 400ms staggered delay.
* Line 1: [SYSTEM] ACCESSING_LDK_KEY_VAULT...
* Line 2: [SYSTEM] GEOFENCE_SYNC_COMPLETE
* Line 3: [SYSTEM] STANDBY_FOR_VERIFICATION
* Purpose: This simulates a real-time connection to the Lightning Network node rather than just a static website load.
      Sequential Boot Sequence (The State)
The dial needs to know its "initial state." You'll add logic here so that when the system boots, the dial starts in a dimmed "Standby" or "Ready" mode before it ever turns green.

10. The "Conquest" Logic (Competitive Proximity)
* Logic: "Conquest" refers to detecting a user who is at a competitor site (e.g., a Starbucks nearby) and diverting them to the Partner site (Costa/Costco) via a Satoshi incentive.
* Visual Change: When a "Conquest" is detected, the status-card border should flash Bitcoin Orange briefly before the Telemetry log prints: CONQUEST_DETECTED: [competitor_id] -> DIVERSION_INITIATED.
* Metric Update: This event should trigger an incremental increase in the Diversion Multiplier value shown in the sidebar.

11. Fountain Logic (Podcasting 2.0 / Lightning Audio)
* The Context: Detects if the user is currently streaming or engaged with Fountain while in the geofence.
* The Logic:
    * Streaming Sats: When a user is verified, the telemetry should note: FOUNTAIN_STREAM_DETECTED: [12 sats/min].
    * The "Boostagram" Trigger: In the RETAIL mode, we planned a "Boost" feature where a partner (Costco/Costa) can "Boost" a user's Fountain stream with a Satoshi tip for entering the store.
    * Telemetry Entry: [SYSTEM] PARTNER_BOOST_SENT via FOUNTAIN_LDK.

12. Minibits Logic (eCash / Cashu Protocol)
* The Context: Handles the "Privacy" layer for users who want to remain anonymous while still receiving rebates.
* The Logic:
    * Ecash Minting: Instead of a direct LDK transaction, the system can "mint" a Minibits token as a rebate.
    * Visual Indicator: The Verify Dial would pulse Teal instead of Green when a Minibits/Cashu token is being issued.
    * Telemetry Entry: [SYSTEM] CASHU_MINT_SUCCESS: token_issued_minibits_v1.
* Privacy Toggle: A future planned logic where the user can choose "LDK Direct" or "Minibits Anonymous" for their payout.

13. CarPlay & OPC (Open Payments Cloud) Integration
* The "In-Car" Context: The dashboard isn't just for a laptop; it’s a "Command Centre" that pushes data to the vehicle’s head unit via CarPlay.
* Logic: The web dashboard acts as the Server that pushes "Near-Field Site Discovery" to the car.
* OPC Bridge: Uses Open Payments Cloud to bridge the gap between the car's identity and the user's LDK wallet, allowing for "Drive-through Verification" without touching a phone.

14. The "Handheld" (Merchant Terminal) Logic
* Hardware: A dedicated, ruggedized handheld device for coffee shop staff (baristas).
* Logic: When you click Verify Session on your dashboard, the barista's handheld vibrates and displays the user's "Satoshi Path" status.
* Two-Way Handshake: The merchant must "Approve" the verification on their handheld to release the Bitcoin rebate from the dashboard.

15. The "Flashing Phone" (Order Completion)
* Visual Logic: Once the "Verify Session" is 100% complete, the user's phone screen becomes a visual "pass" for the merchant.
* Color Coding:
    * Pulsing Orange: Indicates a Satoshi/Bitcoin settlement (Premium/Loyalty tier).
    * Waving Blue: Indicates a Fiat settlement (Standard/Legacy tier).
* Purpose: This allows for "Flash-and-Go" order collection in busy environments without scanning a QR code.

16. The Rail & Costco Strategic Partnerships
* Rail (Infrastructure): Logic for "Transit Mining." Users earn sats based on the distance traveled on specific rail lines, verified by the geofence on your dashboard.
* Costco (Volume): The logic for "Bulk Verification." Instead of a single coffee, this handles high-value rebates for wholesale purchases, often settling via Minibits (eCash) to keep high-frequency transactions off-chain until necessary.
