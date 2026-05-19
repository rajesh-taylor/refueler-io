# REFUELER Timer App v2 & Command Centre — Design Decisions Log

**File purpose:** Running record of design thinking, decisions, and rationale for the Timer app (v2) and the Command Centre merchant dashboard. Used as context for Claude AI sessions — paste the "Session Prompt" at the bottom when starting a new build session.

**Last updated:** 2026-05-16 (post 1st Lakeside site visit)

---

## 4. Merchant Menu Ownership — Command Centre Architecture

**Decision:** Merchant partners (Costa, other coffee shops, future businesses) have full, self-serve control over their menu in the Command Centre. REFUEL does not own or hardcode menu content.

**Rationale:** Menus change constantly — seasonally, daily, by staff availability, by stock. A hardcoded menu creates a support burden and erodes partner trust. The Command Centre must function as a genuine SaaS tool, not a glorified static page.

**What this means for the build:**

- Each merchant account has a **Menu Manager** section in the Command Centre dashboard.
- Items are created, edited, archived (not deleted — for order history integrity), and toggled live/hidden by the merchant directly.
- Each item has: name, description (optional), price, category (drink / food / add-on), image (optional), and availability toggle.
- **Seasonal logic:** Merchants can schedule items as "Available from [date] to [date]" — e.g. a Christmas menu that auto-activates and expires.
- **Staff/stock toggle:** A simple "Pause this item" switch for when an ingredient runs out or a machine is down. No explanation required — it just disappears from the customer-facing menu until re-enabled.
- **Menu versioning:** The system logs when a menu was last changed. This protects against disputed orders ("I ordered X but it wasn't available") by timestamping menu state at point of order.

**Customer-facing impact:**
- The Timer app menu screen (MENU state) pulls live from the merchant's Command Centre menu.
- If a merchant marks an item unavailable mid-session, it greyed out / removed on next menu refresh (max 60-second polling).

**Future partners this architecture supports:**
- Independent cafés
- Plush pub food menus (the "Sats-to-Stout" B2B vertical)
- Petrol station forecourt shops
- Any F&B partner in the Concierge Mode ecosystem

---

## 5. Pre-Visit Menu Placeholder (Costa — Lakeside Test)

**Status:** No confirmed menu list yet. Will be provided on return from Lakeside site visit.

**Interim approach:** Timer app build uses a placeholder menu with generic categories (Hot Drinks / Cold Drinks / Food) to validate the MENU state UX flow. Real Costa items will be populated into the Command Centre merchant panel once the menu list is provided post-visit.

**Items to confirm on-site:**
- Does Costa (Next, Lakeside) operate the full seasonal menu or a reduced kiosk range?
- Are food items available throughout the day or cut off before a certain time?
- Is there a "most popular" order that should be surfaced as a default/hero item?

---

## 6. Design Principles Summary (v2 Baseline)

| Principle | Decision |
|---|---|
| Default theme | Light mode |
| Order waiting screen | QR code dominant, no chrono dial |
| Customer language | Calm, ambient — no operational jargon |
| Menu ownership | Merchant-controlled via Command Centre |
| Code philosophy | Less is more — remove complexity that doesn't serve the 30-second flow |
| Handover UX | QR "Flash-and-Go" — no scanning required from customer side |

---

## 7. Open Questions (Resolve Post-Site Visit)

- [ ] Exact walk time: Costa (Next) → Bay 4. Normal and brisk. Measured to the second.
- [ ] Is there a dedicated handover zone at Costa or does the customer collect from the main counter?
- [ ] Signal quality at Bay 4 — does the QR screen load reliably without Wi-Fi fallback?
- [ ] Costa menu range available at this location (full / reduced / kiosk).
- [ ] Dry path confirmed between Costa and Bay 4? Any obstacles for a runner carrying a tray?
- [ ] What is the correct calm language for the waiting screen? ("Your order is being prepared" / "Won't be long" / something warmer?)

---

## SESSION PROMPT — Paste This at the Start of Your Next Claude Build Session

```
We're continuing the REFUELER Timer app (v2) and Command Centre build after a Lakeside site visit.

**Project context file:** timerv2.md — read this first for all design decisions made pre-visit.

**Site visit data collected today:**
[PASTE YOUR NOTES HERE — walk times, signal readings, menu items, obstacles, photos/observations]

**What I need from this session:**
1. Update the Timer app (index.tsx) based on site visit findings — specifically calibrate ETA dial values, confirm QR-dominant order screen is correct, and add the real Costa menu items to the MENU state.
2. Begin the initial Command Centre build — Light mode default, merchant Menu Manager panel, and Mapbox flyTo using the real Bay 4 coordinates captured today.
3. Any design language changes based on what felt right or wrong in the field.

**Key decisions already locked (do not revisit unless site data contradicts):**
- Light mode is default
- Chrono dial removed from order/waiting screen — QR code takes dominance
- "Dwell time" banned from all customer-facing copy
- Merchant owns their own menu in the Command Centre
- Menu items will be confirmed post-visit from the Costa menu list I'll provide

Ready to build. Start with [Timer app / Command Centre / whichever makes sense given the data].
```

---

*This file lives in /05_Field_Notes alongside the Lakeside audit log. Update after every site visit and major design decision.*

## Rail Extension — Fenchurch Street Corridor (Parking)

**Known station cafés:**
- Fenchurch Street (exit closest to Tower Hill)
- Grays
- Purfleet
- Upminster

**Order trigger logic:**
- Limehouse has no café — this is the "one stop before" trigger point
- Customer boards at Limehouse, order placed in app
- Ready for collection at Fenchurch Street platform café on arrival

**Local context:**
- West Ham United and Arsenal supporter base on this corridor
- Fixture list API integration → café owner schedules Matchday Menu in Command Centre
- Same seasonal scheduling logic as Lakeside — different data source (football calendar vs. Christmas)

**Status:** Parked — review after Lakeside build is stable
