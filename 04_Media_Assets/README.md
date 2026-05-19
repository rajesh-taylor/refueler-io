# 04: Media Assets
**Focus:** Visual concepts and design evolution.

## Current State
- **Status:** Exploring UI/UX directions. Current screenshots are "Concepts," not final.
- **Goal:** Merge the functional logic of the current dashboards with the "Cartier-CarPlay" luxury aesthetic.

## Asset Folders
- `/Concepts`: Dashboard and mobile layouts for visual reference.
- `/Wireframes`: Early-stage structural plans.

## AI Visual Production Prompts
- **Watch UI:** "Apple Watch Ultra 2, custom mechanical chronograph, titanium textures, #000080 Navy Breguet hands, Bitcoin sub-dial, luxury automotive aesthetic."
- **CarPlay UI:** "Audi cockpit, CarPlay screen active, dark-mode 'Recommended' alert: 'Save £4.20: Divert to Sainsbury's', blurred London at dusk."

## High-End Utility Aesthetics
- **Watch UI:** "Sweeping" movements like a mechanical chronograph. Brushed titanium and International Orange accents.
- **Mobile UI:** HUD-inspired Glassmorphism. High-contrast Dark Mode for driver safety.

## Visual Psychology & Palette
- **Satoshi View (#F7931A):** "Growth" focus. Features glowing ₿ symbol and Lightning Pulse animations.
- **Cashback View (#2E5BFF):** "Stability" focus. Features brushed steel textures and minimalist £ insignia.
- **HUD Glassmorphism:** All UI elements should use semi-transparent layers to mimic high-end automotive "Heads Up Displays."

---

## Native OS Handshakes (Digital Assets)
- **Apple Wallet Integration:** 
    - Assets: Digital Nectar, Clubcard, and Refueler "Premium Pass" tokens.
    - Logic: Trigger an automatic "Coupon Push" to the Apple Watch upon arrival at geofenced coordinates.
- **Visual Feedback:** 
    - Provide a "Success" animation on the Watch/Phone when a digital loyalty card is successfully presented/scanned.
- **HUD Glassmorphism:**
    - All digital overlays must use semi-transparent "Heads Up Display" (HUD) layers to maintain the luxury automotive aesthetic.

---

## Luxury Motion & Feedback (The "Dopamine Loop")
- **The Orange Dial (Satoshi View):** 
    - **Animation:** Implement a "Mechanical Sweep" or "Spin Animation" that increments the balance dial in real-time.
    - **Logic:** Triggered via `WCSession` the moment the Lightning invoice is settled.
- **Audio Feedback (Audiophile Quality):**
    - **The "Cha-Ching":** A custom digital chime played through the car's speakers via `AVAudioSession`.
    - **Trigger:** Only after GPS confirms vehicle has moved >100m away from the station.
- **Visual Cues:**
    - **"S" Icon:** High-contrast Orange icon for `CPListTemplate` to denote "Verified Satoshi-back" eligibility.
    - **Haptic Pulse:** Double-tap `WKHapticType` on the wrist when a "Top-Tier Value Zone" is entered.

---

## First-Time User Experience (FTUE) Assets
- **The "Dopamine" Tutorial:**
    - **Visual:** A 15-second high-fidelity animation of the "Orange Chronograph" dial.
    - **Action:** Show the dial "sweeping" and incrementing with a Satoshi payout + a "Cha-ching" digital chime.
    - **Purpose:** Pre-wire the user's brain to expect a reward before their first real site visit.
- **Onboarding Segmentation UI:**
    - **"Tourist" vs. "Local" Screens:** Use distinct visual cues (e.g., a "Globe" icon for Travelers and a "House" icon for Residents) to guide the niche selection process.
- **Car Sticker Growth Hack:**
    - **Design:** High-end, minimalist QR code stickers for car bumpers/windows.
    - **Copy:** "Scan to Save £20" or "Refueler: Stacking Sats while Driving."

---

## Visual Branding: The "Cashback" Dial (B2C Legacy Path)
- **The Cobalt Dial:** 
    - **Color:** Electric Cobalt (#2E5BFF) on Charcoal Grey.
    - **Aesthetic:** Minimalist Serif font for GBP (£) balances. Uses "Brushed Steel" textures rather than the "Lightning Pulse" found in Satoshi mode.
- **Achievement States:**
    - **The Gold Transition:** Once a user hits the 1,000-point (£10) milestone, the dial should transition to a polished "Liquid Gold" texture with a haptic "celebration" pulse.
- **Redemption Interface:** 
    - **Tile Design:** Use high-end, glassmorphic tiles for merchant logos (Amazon, Sainsbury's, PayPal) to maintain the luxury HUD aesthetic even during the "fiat" payout process.
- **Camera Security UI:**
    - **Live Viewfinder:** Implement a high-tech "scanning" overlay that reinforces the "Metadata Stamped" security feel while the user takes the photo.

---

## High-End Utility Design Rules
- **Materialism:** Prioritize deep blacks (#121212), brushed titanium textures, and high-contrast "International Orange" (#F7931A) for Bitcoin accents.
- **The "HUD" Interface:** Mobile app must use **Glassmorphism** (semi-transparent layers) to mimic a modern car's "Heads Up Display."
- **Default State:** Always Dark Mode (Driver safety/Night-time legibility).

---

## Resident Watch Face: Predictive Iconography & Loops
- **The "Loyalty Loop" (Top Left):**
    - **Visual:** Use a high-fidelity circular progress ring (Activity Ring style).
    - **Branding:** Dynamic color states based on linked partner (e.g., #602D89 for Nectar Purple, #00539F for Tesco Blue).
- **The "Price-Trend" Indicators (Bottom Right):**
    - **Aesthetic:** Minimalist, "Weather-style" vector icons.
    - **Rising Sun Icon:** Indicates an imminent price hike (Trigger: "Fill Up Now" urgency).
    - **Falling Rain Icon:** Indicates a downward price trend (Trigger: "Wait to Fill" sentiment).
- **The "Satoshi Pulsar" (Bottom Left):**
    - **Animation:** A subtle, rhythmic pulse on the Bitcoin "₿" symbol when the Fountain V4V stream is active.
- **Typography (Data Layers):** 
    - Use sharp, high-contrast **SF Pro** for raw data (e.g., "+£18.40") to ensure instant glanceability against the Guilloché background.

## Visual Materials & Skeuomorphism
- **The "Resident" Bezel:** Use SVG gradients to simulate **Subtle Steel** or **Brushed Aluminum** textures for the outer ring of the watch face.
- **Instrument Aesthetic:** The UI should feel like a high-end dashboard gauge (e.g., Porsche or Audi), not a flat software interface.
- **Dynamic Complication Branding:** 
    - Match secondary colors for the "Loyalty Loop": 
    - **Sainsbury's:** #FF8200 (Orange) / #602D89 (Purple).
    - **Morrisons:** #00AB4E (Green) / #FFD200 (Yellow).

---

## The "Pump Chronograph" High-Fidelity Assets
- **The "Satoshi Pulsar" (Sub-Dial 3):**
    - **Visual:** A rhythmic, glowing animation of the Bitcoin "₿" symbol.
    - **Logic:** Animation activates automatically when the GPS enters a geofenced station, providing a visual "handshake" that rewards are active.
- **The "Smart Converter" (Sub-Dial 1):**
    - **Iconography:** Use crisp, high-resolution vector flag icons (🇺🇸, 🇪🇺) paired with sharp numerical data.
    - **Aesthetic:** Minimalist and high-contrast to ensure legibility during rapid "wrist-glances" while driving.
- **Dynamic Countdowns:**
    - **Time-to-Tank (Sub-Dial 2):** Use "International Orange" text that counts down in real-time as the vehicle approaches the optimal partner station.
    - **Return Deadline (Sub-Dial 4):** A ticking digital timer aesthetic, mirroring the urgency of high-end racing chronographs.
- **Haptic Texture:**
    - **The "Optimal Window" Tap:** Use `WKHapticTypeDirectional` to create a "sliding" haptic sensation when the user is within the perfect 10-mile refueling window before an airport hub.

---

## Production Pipeline: AI Image Generation
- **Strategy:** Utilize specialized AI engines to create "Luxury Automotive Brochure" quality visuals.
- **Toolbox:**
    - **Midjourney (The Gold Standard):** Use for high-fidelity "Luxury Chronograph" watch faces and cinematic CarPlay dashboard environment shots.
    - **Flux.1 (Precision Rendering):** Use for UI mockups that require realistic text rendering (e.g., ensuring the watch dial actually reads "PUMP" and shows real pricing numbers).
    - **Canva Magic Media:** Use for rapid mockups of physical branding, such as "Pump" QR stickers on petrol pumps or car windows.
- **Design Principle:** Maintain a consistent "Materials" look across all tools (Titanium, Deep Blacks, and International Orange).

---

## AI Visual Production: Master Prompts

### 1. The "Chronograph Elite" (Watch UI)
> **Prompt:** "Close-up shot of an Apple Watch Ultra 2 on a wrist, featuring a custom high-end mechanical chronograph interface. Dark mode UI with brushed titanium textures and international orange accents. Three sub-dials showing a Bitcoin symbol, a currency converter ($4.20/gal), and a petrol pump icon. 8k resolution, cinematic lighting, luxury automotive aesthetic."

### 2. The "Smart Diversion" (CarPlay UI)
> **Prompt:** "View from the driver's seat of a modern Audi cockpit. The CarPlay screen is active, showing a sleek dark-mode notification with a green 'Recommended' badge. The notification says 'Save £4.20: Divert to Sainsbury's nearby.' In the background, blurred London streets at dusk. High-end tech aesthetic."

### 3. Visual Style Guide (Global)
- **Primary Aesthetic:** Luxury Automotive / High-End Horology.
- **Lighting:** Cinematic, dusk/night-time with neon and titanium reflections.
- **Color Profile:** International Orange (#F7931A) highlights on Deep Charcoal (#121212).

---

## UI Palette: The Sovereign Dual-Mode
- **Mode A: The Satoshi View (Orange Dial)**
    - **Base:** Charcoal Grey (#121212) | **Accent:** International Orange (#F7931A).
    - **Visuals:** Glowing Bitcoin "₿" insignia with a rhythmic sub-dial pulse during active Lightning handshakes.
    - **Vibe:** High-energy, "Growth-mode" tech instrument.
- **Mode B: The Cashback View (Blue Dial)**
    - **Base:** Charcoal Grey (#121212) | **Accent:** Electric Cobalt (#2E5BFF) or Sterling Silver.
    - **Visuals:** Minimalist "£/$/€" insignia using **Brushed Steel** SVG textures that react to device tilt (gyroscope).
    - **Vibe:** Stable, high-trust, "Institutional Savings" instrument.

# Visual Identity: Breguet Luxury Aesthetic

## The "Static" View (Luxury/Watch)
- **Palette:** #FFFDD0 (Cream), #7097BB (Slate Blue).
- **Accents:** #B8D8BA (Sage), #F7CFD1 (Champagne Pink).
- **Style:** Navy Blue Breguet hands, Roman numerals (Serif), and Guilloché patterns.

## The "Active" Dashboard (Digital/HUD)
- **Satoshi Mode:** International Orange (#F7931A) on Charcoal.
- **Cashback Mode:** Electric Cobalt (#2E5BFF) on Charcoal.
- **Style:** Glassmorphism, SF Pro (Sans-serif) for data, and "Sweeping" mechanical second hands.
