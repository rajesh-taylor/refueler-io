Costa Coffee

Design Aesthetic
Costa uses a rich, "maroon and cream" palette that feels cozy but functional.
* The Bean Counter: Their primary loyalty mechanic is a circular progress bar for "Beans" (stamps). Highly visual and centered.
* The Flow uses a bottom-tab navigation which is the gold standard for one-handed use (perfect for someone walking into a station).
* Micro-animations: When you earn a "Bean," there’s a subtle haptic and visual "pop." This is what keeps users coming back.
2. The "Order & Pay" Flow (The Gold Standard)
Costa’s "Order" flow is highly optimized for low friction:
* Geofencing: As soon as you open the app, it suggests the nearest shop.
* Customization: Their "Build your drink" UI is a vertical scroll with large, clear icons for milk types, syrups, and sizes. It prevents "Choice Paralysis."
* The "Reorder" Shortcut: This is their "High-End" feature. If you usually get a Large Latte at 8:00 AM, the app puts that exact order on the home screen as a one-tap button.
3. The "Store Locator" (Your Direct Competition)
Costa’s map is functional but standard. It shows pins on a map with "Click & Collect" availability.
* Where they fall short is their map doesn't care about your car. It doesn't know if you're an EV driver looking for a charger and a coffee.
* Opportunity: While their app is "Store-First," yours is "Journey-First." You can integrate their "Bean" logic into your CarPlay/Landscape view.
4. Capturing the "Non-Car" Market (Watch & Mobile)
* What about commuters and tourists not in a car? By making Refueler an iOS Watch app, I capture the "Transit" market (train stations, airports).
* The Watch Flow: A tourist walking past a Costa Express machine (which has no screen) sees a notification on their Apple Watch: "Refueler Deal: Tap to unlock your morning coffee."
* The Advantage: Your app becomes a "Universal Proximity Key." It doesn't matter if they are in a Tesla or on a train—Refueler identifies the coffee machine via Bluetooth/Geofence and pushes the reward.
* The "Silent" Sale: They scan their watch at machine, sale goes through my API, and I collect your commission.
* Could also sell Costa white label integration. 
* Walkers and tourists don’t have to download an UK app and enter credit card details. I support Apple Pay and sats natively. 

Comparison: Costa vs. Your "Refueler" App
Feature	Costa App	Your Refueler App
Loyalty Style	Stamp Card (10th Free)	Dynamic Deals (Shop-driven)
Navigation	Mobile First	CarPlay + Landscape Mobile
Ordering	Full Menu	Quick-Redeem QR / One-Tap Reorder
Context	"I want coffee"	"I'm charging, what can I do now?"

How to Build better for Refueler
To make your app feel as "High-End" better, focus on these 3 UX pillars:
1. The "Glanceable" Dashboard: In Landscape mode, use large, bold typography. Drivers shouldn't have to squint.
2. For phone /iOS watch commuters (walkers) what should I focus on?
3. The "Seamless Authorization": Costa requires you to open the app, go to "Loyalty," and scan. Your OCPP 1.6 "DataTransfer" hack means the charger screen tells the user they have a reward before they even touch their phone. That feels like "Magic."
4. Haptic Feedback: Use the phone's Taptic Engine. When the charging starts, give a solid "thump" via the phone; when the coffee QR is generated, give a lighter "click.” For no car users what to do?
Can build in choice for customer if many coffeeshops are near:
Mobile & Watch
When a user (walker/tourist) enters "Partnership Zone" with multiple options, can send one Refueler card that aggregates the deals. Or has it ready when apps is opened, auto refresh if possible.
* The UX Flow: A single notification pops up: "Refueler Rewards Nearby: 3 deals available."
* The Choice Card: Upon opening, they see a horizontal scroll (the "Carousel"):
    * Card 1: Costa Logo | "Available at Costa" | 250 SATS Reward | 5 min walk
    * Card 2: Independent Deli | "Partner Shop" | 15% Discount | 4 min walk
    * Card 3: Starbucks | "Available at Starbucks" | Free Pastry | 6 min walk