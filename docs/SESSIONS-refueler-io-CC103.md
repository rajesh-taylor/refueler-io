# SESSIONS — refueler-io
*Last updated: CC-103 · 2026-08-20 — build fix, Darwin RLS, Owner tab enrichment, warm carbon, product naming, Owner tab redesign spec, G-3 cleared.*

---

## Session allocation
Primary: 500 · Buffer: 50 · Total: 550. Planning/Opus uncounted.
Sessions used to CC-103: ~99 counted + uncounted planning.

---

## Block map

| Block | Status |
|---|---|
| Block 0–4, Block M | ✅ Complete |
| Block 3 | ✅ CC-81 |
| Block 5 + Sim-Close | ✅ Complete 2026-08-17 |
| Hardening-A · TDP-A · TDP-philosophy · TDP-B · TDP-C | ✅ CC-94–98 |
| NumoPay-A · B · C | ✅ CC-99–101 |
| CC-102 | ✅ Superseded by CC-103 |
| CSS-1 through CSS-7b | ✅ Complete |
| **CC-103** | ✅ CLOSED |
| **CC-104 — Menu Management v1** | 🟡 Next |
| **Web-Touch-1** | 🟡 After CC-104 |
| Block 8 · Pass-A/B · Block 9 | 🟡/⚪ Queued/Deferred |

---

## CC-103 — 2026-08-20 · CLOSED

**Commits:**
| Repo | Commit | What |
|---|---|---|
| `numo-fork` | `54b15de` | fix: Theme_Numo symbol collision — dot-notation aliases only |
| `refueler-io` | `9a2ea73` | feat: Owner tab enrichment Items 0–4 + Darwin RLS fix |
| `refueler-io` | `01cebc2` | feat: Owner tab enrichment CSS |
| `refueler-io` | `67afc2e` | design: warm carbon — #1A1917 replaces #1A1A1A for Carbon bg |
| `refueler-io` | `039962e` | docs: MasterContext + SESSIONS CC-103 (first close, pre-extended session) |

**Decisions locked this session:**
- Product names: floor staff app = **Relay**, consumer app = **Refill**
- Carbon bg token: `#1A1917` (warm) — 2-week trial
- Terminal orientation confirmed: landscape for counter tablet, portrait for Relay
- G-3 cleared: iPad physical check done at Apple Store
- Owner tab redesign spec locked (S-32) — see MasterContext for full layout spec
- Shutdown merchant terminal: local `_terminalShutdown` flag, not `venue_partners.active`
- Toggle spec: green `#3DCA7A` on, amber `#C8943A` off, both themes
- Lightning address: single line, ellipsis, gold lock icon → owner PIN re-auth
- PAPER/CARBON pill: always far right of owner nav, Back to Queue left of it

**Snags logged:**
- S-28: Privacy page right-edge padding (portrait/narrow)
- S-29: Share nav wordmark/breadcrumb separator
- S-32: Owner tab full redesign

**Darwin diagnosis deferred:** Anon policy live but terminal still shows offline. Diagnose at CC-104 open.

---

## Opening prompt for CC-104

```
CC-104 — Menu Management v1
Type: Sonnet counted
Context files: refueler-io/docs/MasterContext_IO_CC103.md · SESSIONS-refueler-io-CC103.md

OPEN FIRST — Darwin diagnosis (5 min max):
  execute_sql: SELECT COUNT(*), MAX(fetched_at) FROM rail_signal_current WHERE feed = 'departure_board_staff' AND feed_key = 'FST';
  If 0 rows: cron hasn't run. Check pg_cron job status.
  If rows present but terminal shows offline: JS issue — note and defer.
  Do not spend more than 2 prompts on this before moving to Menu Management.

MAIN SCOPE — Menu Management v1 (G-2, hard blocker):
  1. apply_migration: merchant_menu_items table
     Columns: id (uuid pk), venue_id (uuid fk venue_partners), name (text), description (text),
     price_gbp (numeric(10,2)), category (text), available (bool default true),
     position (int default 0), created_at, updated_at
     RLS: authenticated SELECT (own venue), service_role INSERT/UPDATE/DELETE
  2. CSV import path: owner uploads CSV in Owner tab → parse client-side →
     POST via authenticated PostgREST INSERT (batch). Max 100 items.
     CSV columns: name, description, price_gbp, category
  3. Terminal UI: item list in queue view (or separate tab) grouped by category,
     available toggle per item. Read-only on Relay (already wired NumoPay-C).
     Write side (toggle available, add/edit/delete) is terminal Owner tab only.

Read live files from GitHub before writing any code.
Present full plan before writing any code.
```
