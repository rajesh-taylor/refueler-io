# REFUEL | Tactical Field Timer (Expo Go)

## Overview
This is the specialized validation rig for the REFUEL ecosystem. While the main app focuses on the luxury "Chronograph" experience, this Expo-based tool is used by founders and field agents to calibrate the real-world physical triggers for the **Lakeside Protocol**.

## Primary Field Objectives
1. **The "Coffee Gap" Calibration:** - Use the internal timer to measure the duration between "Nozzle Holstered" (Trigger 1) and "First Sip of Coffee" (Target Dwell).
   - Results are used to set the `Dwell_Timeout` constants in the main WatchOS app.
2. **Signal Mapping (The Tech Audit):**
   - Log cellular signal strength (dBm) and speed (Mbps) at specific bay coordinates (e.g., Lakeside Car Park G).
   - Identifies where the app must switch to "Offline-First" LDK settlement.
3. **Barrier Friction Log:**
   - Record time lost at security gates or roundabout congestion to fine-tune the 15mph "Exit Vector" logic.

## Technical Configuration
- **Framework:** Expo (File-based routing).
- **Mode:** Development Build / Expo Go.
- **Critical Directory:** `app/` (Contains the tactical logging UI).

## Field Instructions
1. **Initialize:** Open the app via Expo Go upon arrival at a test site.
2. **Zone Check:** Stand at the designated EV/Fuel bay (e.g., Bay 4).
3. **Start Timer:** Tap "Start Refuel Session" and proceed with the "Human Audit" (walking to the retail point).
4. **Log Data:** Enter signal strength and walk-time notes directly into the interface.

## Sync Protocol
Data captured here is used to update the `05_Field_Notes/lakeside_audit.md` and calibrate the constants in `06_Benchmarks/revenue_engine_specs.md`.