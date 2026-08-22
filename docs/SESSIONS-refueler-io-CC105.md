# SESSIONS — refueler-io
*Last updated: CC-105 · 2026-08-22 — Web-Touch-1 closed: hamburger nav, S-32 owner two-col, S-33 ops sign-out, S-29 nav portrait, S-28 privacy padding, S-34 CHANGE button Carbon contrast.*

---

## Session allocation
Primary: 500 · Buffer: 50 · Total: 550. Planning/Opus uncounted.
Sessions used to CC-105: ~101 counted + uncounted planning.

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
| **CC-105 / Web-Touch-1** | ✅ CLOSED |
| Darwin-A · B · C · D · Strip-Design | 🟡 Next |
| Block 8 · Pass-A/B · Block 9 | ⚪ Deferred |

---

## CC-105 / Web-Touch-1 — 2026-08-22 · CLOSED

**Commits:**
| Repo | Commit | What |
|---|---|---|
| `refueler-io` | `63e19a9` | fix: Web-Touch-1b — hamburger nav, S-32 owner two-col, S-33 ops sign-out, S-28 privacy padding, S-29 nav portrait |
| `refueler-io` | `6cc7cce` | chore: remove superseded session docs CC99–CC103 |
| `refueler-io` | `577de20` | fix: S-28 privacy grid narrower sidebar, S-34 CHANGE button Carbon contrast |

**Decisions locked this session:**
- Hamburger nav: appears ≤960px, drawer opens below header with all six links, closes on outside tap
- 960px breakpoint: Editorial/Support/Privacy hidden from nav bar, accessible via hamburger and footer
- Active page links never hidden regardless of width
- S-33 resolved: second sign-out removed from OPS view
- S-32 resolved: owner tab two-column grid — left (Lightning, On-Chain, toggles), right (Sign Out, Stamps placeholder)
- S-29 resolved: wordmark-divider opacity 0.5, pill flex-shrink:0, nav-secondary class
- S-28 partially resolved: privacy sidebar 20%/80%, 960px intermediate breakpoint added
- S-34 resolved: CHANGE button 1px solid gold (#C8A96E), legible in both themes
- S-35 logged: sign-out to move from Queue → OPS only (next terminal session)
- Darwin strip showing OFFLINE on live terminal — further diagnosis needed in Darwin-A

**Snag list — active post CC-105:**
| ID | Item | Priority | Target |
|---|---|---|---|
| S-22 | Email button spacing / iOS border | Low | Future email session |
| S-25 | Order tile background hardcoded Carbon | Low | Future |
| S-35 | Sign-out move from Queue → OPS only | Medium | Next terminal session |
| S-numo-v31 | numo_navy refs in Relay | Low | Next Relay session |

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

## Opening prompt for Darwin-A

```
Darwin-A — Arrivals feed: FST/SRY/SOC, 4-tile strip redesign
Type: Sonnet counted
Context files: refueler-io/docs/MasterContext_IO_CC105.md · SESSIONS-refueler-io-CC105.md

SCOPE:
Darwin strip currently shows departures from FST (outbound).
FST, SRY, SOC are end-of-line venues — they need ARRIVALS (trains coming in carrying customers).

Darwin API endpoint to investigate:
  huxley2.unop.uk — check if arrivals board exists alongside departures board.
  Current feed: departure_board_staff / feed_key=FST in rail_signal_current.
  New feed needed: arrivals at FST (and SRY, SOC when those venues exist).

TARGET:
  Strip redesign: up to 4 arrival tiles.
  Each tile: origin station · platform · ETA (minutes until arrival).
  Green dot = imminent (0-3 min) · amber = arriving (3-7 min) · default = horizon (7-15 min).
  Venue type field on venue_partners or derived from CRS — end-of-line venues get arrivals feed.

Read all live files from GitHub before writing any code.
Present full plan before writing any code.

---