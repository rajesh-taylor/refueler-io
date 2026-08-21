# SESSIONS — refueler-io
*Last updated: CC-104 · 2026-08-21 — Menu Management v1, G-2 cleared, Darwin fixed, nav/toggle fixes, station labels, finger-friendly sizing.*

---

## Session allocation
Primary: 500 · Buffer: 50 · Total: 550. Planning/Opus uncounted.
Sessions used to CC-104: ~100 counted + uncounted planning.

---

## Block map

| Block | Status |
|---|---|
| Block 0–4, Block M | ✅ Complete |
| Block 3 | ✅ CC-81 |
| Block 5 + Sim-Close | ✅ Complete 2026-08-17 |
| Hardening-A · TDP-A · TDP-philosophy · TDP-B · TDP-C | ✅ CC-94–98 |
| NumoPay-A · B · C | ✅ CC-99–101 |
| CSS-1 through CSS-7b | ✅ Complete |
| CC-102 | ✅ Superseded by CC-103 |
| CC-103 | ✅ CLOSED |
| CC-104 | ✅ CLOSED |
| **Web-Touch-1** | 🟡 Next |
| Darwin-A · B · C · D · Strip-Design | 🟡 Queued |
| Block 8 · Pass-A/B · Block 9 | ⚪ Deferred |

---

## CC-104 — 2026-08-21 · CLOSED

**Commits:**
| Repo | Commit | What |
|---|---|---|
| `refueler-io` | `d2ae2ac` | feat: Menu Management v1 — G-2 cleared |
| `refueler-io` | `ac68e8c` | fix: Darwin select column, CRS mapping, pillQueue nav, toggle colours |
| `refueler-io` | `30adeba` | fix: menu overlay nav header, finger-friendly sizing throughout |
| `refueler-io` | `603733f` | fix: Darwin station labels, CSV error message, remove ops sign-out section |

**Decisions locked this session:**
- Menu Management v1 complete — CSV replace flow, chip panel, landscape two-pane overlay, ops card
- Menu overlay: 40% left (import + list), 60% right (2×2 grid: top items today, last import, currently unavailable, reserved)
- `unavailable_since` column on `merchant_menu_items` — trigger-managed
- Last import metadata: localStorage keyed to venue_id
- Menu v2 deferred: images, stock counts, supplier ordering, previous versions, table/seat layout
- Darwin data confirmed live — `source_updated_at` column (not `fetched_at`)
- Darwin CRS fix: `destination_crs` used (not hardcoded `FST`)
- Full Fenchurch St line station labels map added
- Owner toggle colours: solid green on, solid amber off — both themes
- `pillQueue()`/`pillOps()` now call `closeOwnerPanel()` first
- Menu overlay gets full nav bar with `← Back` button
- Darwin venue type architecture locked: end-of-line needs arrivals feed; mid-line needs departures + calling points
- Darwin session plan locked: Darwin-A → B/C → Strip-Design → D
- S-33 logged: second "Sign out" instance in OPS — fix at Web-Touch-1 open

**Gates cleared:**
- G-2 ✅ Menu Management v1 — all five gates now cleared

---

## Opening prompt for Web-Touch-1

```
Web-Touch-1 — Snag clearance: S-33, S-28, S-29, S-32
Type: Sonnet counted
Context files: refueler-io/docs/MasterContext_IO_CC104.md · SESSIONS-refueler-io-CC104.md

OPEN FIRST — S-33 (2 min max):
  Remove second "Sign out to return to the Command Centre." instance from OPS view.
  grep index.html for "ops-account" or "Sign out to return" — one line delete.

THEN — four snags, one pass:

S-28: Privacy page right-edge padding missing on narrow/portrait viewports.
  Read live src/privacy/ CSS before touching.

S-29: Share nav — wordmark and breadcrumb have no separator.
  Read live refueler-share frontend nav CSS before touching.

S-32: Owner tab full redesign per spec in MasterContext.
  Current owner panel is vertical scroll list. Target: two-column split below stats.
  Full spec in MasterContext_IO_CC104.md — read before writing any code.
  Files: src/merchant/index.html, merchant-tablet-logic.js, merchant-tablet-styles.css

Read all live files from GitHub before writing any code.
Present full plan before writing any code.
Run all in one pass.
```
