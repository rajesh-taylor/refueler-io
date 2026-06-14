# CC-20 Session Delivery

## Outputs

| # | Deliverable | File | Status |
|---|---|---|---|
| A | merchant-tablet.html — CSS Grid applied to order queue | `merchant-tablet.html` | ✅ Complete |
| B | merchant_users test row migration | `cc20_merchant_users_test_row.sql` | ✅ Complete |
| C | payment_processor default migration | `cc20_payment_processor_default.sql` | ✅ Complete |
| D | Git command — v7 monolith deletion | See below | ✅ Complete |

---

## D — Git command: delete refueler_command_centre_v7.html

```bash
git rm refueler_command_centre_v7.html
git commit -m "chore: remove superseded CC-v7 monolith (pre-CC-10, ZBD wiring)"
```

Run from repo root (`refueler.io/`). Confirm the file is tracked before running:
```bash
git ls-files refueler_command_centre_v7.html
```
If the output is empty, the file was already removed or never tracked — no action needed.

---

## A — CSS Grid changes summary

**What changed in merchant-tablet.html:**

`.order-queue` — was single-column scroll, now CSS Grid:
```css
.order-queue {
  flex: 1;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(var(--tile-cols), 1fr);
  gap: 12px;
  align-content: start;
  padding: 16px;
}
```

`.order-tile` — `margin-bottom: 10px` removed (gap handles spacing); `min-height: var(--tile-h)` and `min-width: 160px` added:
```css
.order-tile {
  min-height: var(--tile-h);
  min-width: 160px;
  /* margin-bottom removed */
}
```

`.queue-empty` and `.queue-signed-out` — `grid-column: 1 / -1` added so they span the full width rather than sitting in a single cell.

**Portrait (default):** 2 columns, 180px tile min-height.  
**Landscape (@media orientation:landscape and min-width:600px):** 3 columns, 140px tile min-height — driven by the `--tile-cols: 3` and `--tile-h: 140px` already set in the CC-19 landscape breakpoint block (unchanged).

**JS impact:** Zero. `renderOrders()` appends `.order-tile` divs directly into `#order-queue` — grid parent is transparent to this. `switchToOpsView()` uses `style.display = 'none'` which overrides `display: grid`; `switchToQueueView()` restores with `style.display = ''` which reverts to the CSS-defined `display: grid`. ✅

---

## B — merchant_users migration notes

- Uses a `DO $$` block to resolve `auth.users.id` by email before inserting.
- If magic link has not yet been clicked (auth.users row does not exist), the block exits with a `RAISE NOTICE` rather than throwing an error.
- **Re-run after first magic link login** if it silently no-ops.
- Venue lookup: first tries `venue_type = 'independent'`; falls back to `costa-fenchurch-st` as a dev stand-in. Replace with real independent venue `merchant_id` when first partner is onboarded.
- `ON CONFLICT DO NOTHING` — safe to re-run.
- Pins: staff=`2580`, owner=`1379`.

---

## C — payment_processor migration notes

- `ALTER TABLE orders ALTER COLUMN payment_processor SET DEFAULT 'blink'` — affects future inserts only.
- `UPDATE orders SET payment_processor = 'blink' WHERE payment_processor = 'zebedee' AND payment_ref IS NULL` — updates orphan rows only.
- Any `zebedee` rows with a non-null `payment_ref` are **flagged via RAISE NOTICE** and left untouched. The 1 known test row falls into this category if it has a payment_ref — review manually before updating.
- Safe to re-run.

---

## Gates — both still LOCKED

**Gate 1:** Horizon Strip position = Option A (persistent header). ✅  
**Gate 2:** Landscape breakpoint = `@media (orientation: landscape) and (min-width: 600px)`. Portrait: 2-col / 180px. Landscape: 3-col / 140px. ✅

---

## Carry-forward (no change this session)

- `bolt11_encryption_key` Vault placeholder — replace before live invoice processing 🔴
- Horizon passenger window counts = mock (12/34/67) — real aggregation future session
- Ben Cousins outreach — FCA pre-application / loyalty stamp PII question
- Costa Coffee partnership — Head of Partnerships to initiate
- ICO registration — submit when first merchant confirmed
- React Native shell — July 2026
- Supabase PKCE — React Native build start
- Minibits NUT-18 dev call — critical path for ecash send
