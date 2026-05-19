# REFUELER — Session 5 Planning Document
**Status:** Pre-session. Open after Session 4 is complete.
**Version:** v1.1 — updated with locate screen spec, NFC handover, battery logic, giftcard vs sats nudge, retailer rewards strategy.
**Focus:** Payment layer (Zebedee MVP), sats counter, commission routing, locate/handover screen, rewards logic.

---

## Session 5 Objective

Three parallel workstreams:
1. **Payment layer** — Zebedee API, commission routing, sats + fiat revenue counters in Command Centre
2. **Locate + handover screen** — `refueler_locate.html`, NFC confirmation, QR fallback, battery logic
3. **Rewards logic** — sats-back default, giftcard alternative, sats-first nudge UX

---

## Workstream 1 — Payment Layer

### Core payment flow
```
Customer pays for coffee → goes to partner (M&S till / app)
        ↓
Zebedee API generates Lightning invoice for Refueler service fee
        ↓
Customer or partner settles invoice (depending on commercial agreement)
        ↓
Webhook fires on settlement → Supabase Edge Function
        ↓
Commission split: partner share sent, Refueler commission retained
        ↓
Supabase orders table updated → Command Centre revenue counter increments
        ↓
Reward logic runs: sats-back token issued (Minibits) or giftcard credit queued
```

### Zebedee integration
- **Account:** Zebedee developer account + API key needed before session
- **Invoice generation:** `POST /v0/charges` → returns Lightning invoice
- **Webhook:** Zebedee calls Supabase Edge Function on settlement
- **Split:** Edge Function sends partner share via `POST /v0/keysend`, retains commission

### Commission model
```
Order value: £4.50
Refueler service fee: 15% = £0.675
Partner receives: £3.825
Refueler commission: £0.675 → converted to sats at settlement rate

At 100,000 sats = £23:
£0.675 → ~2,934 sats per order
```

### Supabase schema addition
```sql
CREATE TABLE orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id text REFERENCES sessions(session_id),
  user_id uuid REFERENCES auth.users(id),
  partner text NOT NULL,
  order_value_gbp numeric(8,2),
  commission_pct numeric(4,2) DEFAULT 15.0,
  commission_gbp numeric(8,2),
  commission_sats bigint,
  sats_rate numeric(12,2),
  reward_type text DEFAULT 'sats', -- 'sats' | 'giftcard' | 'none'
  reward_sats bigint,
  reward_giftcard_value_gbp numeric(8,2),
  payment_processor text DEFAULT 'zebedee',
  payment_ref text,
  settled_at timestamptz,
  created_at timestamptz DEFAULT now()
);
```

### Command Centre — revenue counter tiles (admin view only)
Two new tiles in stats bar, visible only to admin-authenticated users:
- **⚡ SATS EARNED** — running total, `#F7931A` orange, live from Supabase `orders`
- **£ GBP** — fiat equivalent at settlement rate, secondary

Tap either tile → console expands with per-session breakdown:
```
[REVENUE] 2026-05-16 · S4F2A · M&S Bay 1A · 3 orders · 8,802 sats · £2.02
[REVENUE] 2026-05-17 · S5C3B · M&S Bay 1A · 7 orders · 20,538 sats · £4.72
[TOTAL]   Running total: 29,340 sats · £6.74
```

---

## Workstream 2 — Locate + Handover Screen

### `refueler_locate.html` — standalone file, mobile-first

**Purpose:** Customer opens this screen when their order is on the way. Runner sees the screen from a distance and confirms delivery via NFC tap or QR scan.

**Screen layout:**
- Top 75%: full-screen colour field (brand colour or Bitcoin orange)
- Bottom 25%: QR code (always visible, always rendered), order summary text

**Colour logic (from `user_profiles.payment_preference`):**
| User type | Colour | Hex |
|---|---|---|
| Fiat / standard | M&S green | `#006B3C` |
| Sats / Bitcoin | Bitcoin orange | `#F7931A` |
| Hybrid | Alternating M&S green + orange, 2s cycle |

**Flash pattern (normal battery):**
- 1.5s on / 0.5s off, 3 cycles → then steady colour
- High screen brightness forced on load (`screen.orientation.lock` + max brightness request)

**Battery logic (`navigator.getBattery()`):**
```javascript
navigator.getBattery().then(battery => {
  if (battery.level < 0.10) {
    // Low battery mode
    suppressFlash();
    showSteadyColour();
    showBottomMessage("Wave your screen at the delivery person — they're nearby");
  }
});
```
- Battery < 10%: no flash, solid colour, bottom message
- Battery event listener: if battery drops below 10% while screen is open, switch to low-battery mode immediately

**Crowded area mode:**
- "I'm in a crowd" button visible in bottom bar
- Tap → immediately switches to steady colour + bottom message regardless of battery
- Useful in busy food courts, bus stations, crowded car parks

**NFC handover (primary):**
- Runner's device initiates NFC write with `{order_id, runner_id, ts}`
- Customer phone reads via Web NFC API (`NDEFReader`)
- On successful read → delivery confirmed → order status updated in Supabase → sats reward triggered
- Success state: screen shows "✓ Delivered" + sats earned (if sats user) in partner brand colour

**QR fallback (always visible):**
- Bottom 25% of screen shows QR at all times
- Encodes: `{order_id, session_id, customer_id, ts}`
- Runner scans with their Field Log App camera → confirms delivery
- Same post-confirmation flow as NFC

**Post-handover screen:**
- Fiat user: "Your M&S order has arrived! ☕" in M&S green
- Sats user: "Your order has arrived + you stacked X sats ⚡" in Bitcoin orange
- Both: order summary, tap to dismiss

**Watch integration:**
- On handover confirmed (via mobile): watch receives signal → shows "✓ Delivered" briefly → returns to idle
- Watch does NOT show the locate screen (screen too small to be a useful visual signal)

---

## Workstream 3 — Rewards Logic

### Sats-back (default)
- 1% of order value in sats, issued as Minibits ecash token
- Displayed prominently: "You stacked 45 sats ⚡"
- Accumulated in Minibits wallet, sweeps to Lightning at user threshold (default 10,000 sats)

### Giftcard alternative
- Partner-funded (M&S credit, Costa credit etc.)
- Offered as secondary option — less prominent in UI
- UX principle: sats is the default, giftcard requires a deliberate tap to choose

### Sats-first nudge design
- Order completion screen: large "⚡ +45 sats stacked" in orange (primary)
- Small text below: "Prefer M&S credit instead?" (secondary, smaller font, grey)
- Over time: "You've stacked 4,200 sats this month — that's £0.97 and growing" progress card in app home
- Never push giftcard proactively — only show when user explicitly asks or has opted in

### Retailer giftcard commercial logic
- M&S / IKEA prefer giftcard (keeps spend in-store)
- Refueler offers both: retailer funds giftcard option (their marketing budget), Refueler funds sats option
- Frame to retailer: "We handle the sats layer — you don't touch Bitcoin. Your credit stays on your platform."
- Net Refueler cost for sats option: ~£0.045 per £4.50 order (1% of order value)

---

## Pre-session actions (user)
1. Create Zebedee developer account: https://dashboard.zebedee.io
2. Generate API key in Zebedee dashboard
3. Note API key — needed for Supabase Edge Function config
4. Confirm Minibits MCP server actions: `issue_token`, `get_balance`, `trigger_sweep`

---

## Session 5 build checklist
- [ ] Zebedee API key in Supabase environment variables
- [ ] Supabase `orders` table (schema above)
- [ ] Supabase Edge Function: order event → Zebedee invoice → webhook → split
- [ ] Command Centre: sats + GBP tiles (admin view only, `#F7931A` orange)
- [ ] Command Centre: tap-to-expand revenue breakdown in console
- [ ] `refueler_locate.html`: full-screen colour, flash logic, battery check, crowded mode
- [ ] `refueler_locate.html`: NFC handover via Web NFC API
- [ ] `refueler_locate.html`: QR fallback (always visible bottom 25%)
- [ ] `refueler_locate.html`: post-handover screen (fiat vs sats variant)
- [ ] Minibits ecash reward issuance on confirmed handover
- [ ] Rewards UI: sats-first, giftcard secondary
- [ ] Test end-to-end: order → invoice → settle → counter increments → reward issued

---

## Open questions for Session 5
1. Zebedee account — created before session?
2. Commission rate — 15% confirmed?
3. Minibits MCP server — confirm available actions
4. Reward rate — 1% sats-back confirmed?
5. Who initiates the Zebedee invoice — Refueler app, or partner till integration?
6. HMRC: sats commission treated as GBP-equivalent trading income at receipt — confirm with accountant before going live

---

## Payment processor long-term strategy

| Phase | Processor | Why |
|---|---|---|
| 1 — MVP | Zebedee API | Fastest to production, managed infrastructure, UK-present |
| 2 — Scale | Zeus / self-hosted Lightning node (Phoenixd) | Full custody, node-level split routing, no custodial risk |
| 3 — Rewards | Minibits ecash mint (Refueler-operated) | Privacy-preserving reward tokens, MCP server integration, off-chain until sweep threshold |

---

## Version history
| Version | Date | Notes |
|---|---|---|
| v1.0 | 2026-05-17 | Initial plan — payment layer, processor evaluation, sats counter |
| v1.1 | 2026-05-17 | Added locate screen spec, NFC handover, battery logic, giftcard vs sats nudge, retailer commercial logic |


---

Domain refueler.io being purchased tomorrow — Supabase redirect URL to be updated then
Rate limit will reset overnight — auth fully confirmed working
user_profiles table created, trigger in place, RLS enabled
Double-connect on boot fixed in latest file
Black Sheep PENDING, M&S ACTIVE — partners card in place
Session 5 priority: handover screen (fiat=green / sats=bitcoin orange), admin vs partner data scope, revenue counters, RLS filtering by auth.uid()