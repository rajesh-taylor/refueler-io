# REFUELER — Command Centre Session 5 Patch
## What to add to `refueler_command_centre.html`

---

## 1. CSS — add inside `<style>` block, before `</style>`

```css
/* ─── REVENUE TILES (admin only) ─── */
.stat-tile.revenue {
  cursor: pointer;
  transition: background 0.2s;
  position: relative;
}
.stat-tile.revenue:hover {
  background: rgba(247, 147, 26, 0.06);
}
.stat-tile.revenue .stat-tile-label { color: #F7931A; }
.stat-tile.revenue .stat-tile-value { color: #F7931A; }
.stat-tile.revenue .stat-tile-sub   { color: rgba(247,147,26,0.55); }
.stat-tile.revenue .stat-tile-lock {
  position: absolute;
  top: 10px; right: 12px;
  font-size: 10px;
  opacity: 0.35;
}

/* Revenue breakdown in console */
.console-revenue-block {
  margin: 4px 0 8px;
  border-left: 2px solid rgba(247,147,26,0.40);
  padding-left: 12px;
}
.console-revenue-row {
  display: flex; gap: 12px;
  font-family: var(--mono);
  font-size: 11px;
  color: rgba(247,147,26,0.80);
  line-height: 1.9;
}
.console-revenue-row.total {
  color: #F7931A;
  font-weight: 500;
  border-top: 1px solid rgba(247,147,26,0.20);
  margin-top: 4px;
  padding-top: 4px;
}
.console-revenue-ts { color: rgba(247,147,26,0.45); flex-shrink: 0; }
```

---

## 2. HTML — replace the `.stats-bar` div entirely

Find:
```html
    <!-- Stats bar -->
    <div class="stats-bar">
```

Replace with:
```html
    <!-- Stats bar -->
    <div class="stats-bar">
      <div class="stat-tile">
        <div class="stat-tile-label">Best-case ETA</div>
        <div class="stat-tile-value" id="stat-eta">4:22</div>
        <div class="stat-tile-sub">Queue+Walk · Bay 1A</div>
      </div>
      <div class="stat-tile">
        <div class="stat-tile-label">Active Bays</div>
        <div class="stat-tile-value" id="stat-bays">16</div>
        <div class="stat-tile-sub">V3 CCS · May 2026</div>
      </div>
      <div class="stat-tile">
        <div class="stat-tile-label">Sessions logged</div>
        <div class="stat-tile-value" id="stat-sessions">—</div>
        <div class="stat-tile-sub">From Supabase</div>
      </div>
      <div class="stat-tile">
        <div class="stat-tile-label">Walk samples</div>
        <div class="stat-tile-value" id="stat-walks">—</div>
        <div class="stat-tile-sub">WALK_TESLA_TO_MAS</div>
      </div>
      <!-- Revenue tiles — admin only, hidden until authenticated -->
      <div class="stat-tile revenue" id="tile-sats" style="display:none"
           onclick="toggleRevenueBreakdown()" title="Tap to expand breakdown">
        <div class="stat-tile-lock">🔒</div>
        <div class="stat-tile-label">⚡ SATS EARNED</div>
        <div class="stat-tile-value" id="stat-sats">—</div>
        <div class="stat-tile-sub" id="stat-sats-sub">Loading…</div>
      </div>
      <div class="stat-tile revenue" id="tile-gbp" style="display:none"
           onclick="toggleRevenueBreakdown()" title="Tap to expand breakdown">
        <div class="stat-tile-lock">🔒</div>
        <div class="stat-tile-label">£ GBP</div>
        <div class="stat-tile-value" id="stat-gbp">—</div>
        <div class="stat-tile-sub" id="stat-gbp-sub">At settlement rate</div>
      </div>
    </div>
```

---

## 3. JavaScript — add these functions inside the `<script>` block

Add after the `initAuth()` function (around line 1324):

```javascript
// ─── REVENUE COUNTERS (admin only) ───────────────────────
let _revenueExpanded = false;

function showRevenueTiles() {
  document.getElementById('tile-sats').style.display = '';
  document.getElementById('tile-gbp').style.display  = '';
  // Remove lock icon once admin verified
  document.querySelectorAll('.stat-tile-lock').forEach(el => el.remove());
}

async function loadRevenueTotals() {
  const client = getSbClient();
  if (!client || !_currentUser) return;

  try {
    // Fetch from revenue_totals view (auth-gated by RLS)
    const { data, error } = await client
      .from('revenue_totals')
      .select('*')
      .single();

    if (error) {
      logLine('warn', 'REVENUE_LOAD_ERROR: ' + error.message, 'warn');
      return;
    }

    const sats = data?.total_commission_sats ?? 0;
    const gbp  = parseFloat(data?.total_commission_gbp ?? 0).toFixed(2);
    const orders = data?.total_orders ?? 0;

    document.getElementById('stat-sats').textContent = sats.toLocaleString();
    document.getElementById('stat-sats-sub').textContent = `${orders} order${orders !== 1 ? 's' : ''} settled`;
    document.getElementById('stat-gbp').textContent  = '£' + gbp;
    document.getElementById('stat-gbp-sub').textContent = `${orders} order${orders !== 1 ? 's' : ''} total`;

    logLine('ok', `REVENUE_LOADED · ${sats.toLocaleString()} sats · £${gbp} GBP · ${orders} orders`, 'ok');
    showRevenueTiles();
  } catch(e) {
    logLine('err', 'REVENUE_FETCH_EXCEPTION: ' + e.message, 'err');
  }
}

async function toggleRevenueBreakdown() {
  const client = getSbClient();
  if (!client || !_currentUser) return;

  _revenueExpanded = !_revenueExpanded;

  if (!_revenueExpanded) {
    // Remove existing breakdown block
    document.querySelectorAll('.console-revenue-block').forEach(el => el.remove());
    return;
  }

  // Fetch per-session breakdown
  try {
    const { data, error } = await client
      .from('revenue_by_session')
      .select('*')
      .limit(10);

    if (error || !data) {
      logLine('warn', 'REVENUE_BREAKDOWN_ERROR: ' + (error?.message || 'No data'), 'warn');
      return;
    }

    // Render breakdown block in console
    const con = document.getElementById('console');
    const block = document.createElement('div');
    block.className = 'console-revenue-block';

    let totalSats = 0, totalGbp = 0, totalOrders = 0;

    data.forEach(row => {
      const date = row.session_date || '—';
      const sid  = row.session_id  || '—';
      const partner = row.site_name || 'Lakeside';
      const orders  = row.order_count || 0;
      const sats    = row.total_commission_sats || 0;
      const gbp     = parseFloat(row.total_commission_gbp || 0).toFixed(2);
      totalSats += sats; totalGbp += parseFloat(gbp); totalOrders += orders;

      const rowEl = document.createElement('div');
      rowEl.className = 'console-revenue-row';
      rowEl.innerHTML = `
        <span class="console-revenue-ts">[REVENUE]</span>
        <span>${date} · ${sid} · ${partner} · ${orders} order${orders!==1?'s':''} · ${sats.toLocaleString()} sats · £${gbp}</span>`;
      block.appendChild(rowEl);
    });

    // Total row
    const totalRow = document.createElement('div');
    totalRow.className = 'console-revenue-row total';
    totalRow.innerHTML = `
      <span class="console-revenue-ts">[TOTAL]  </span>
      <span>Running total: ${totalSats.toLocaleString()} sats · £${totalGbp.toFixed(2)}</span>`;
    block.appendChild(totalRow);

    con.appendChild(block);
    block.scrollIntoView({ behavior: 'smooth', block: 'end' });
  } catch(e) {
    logLine('err', 'REVENUE_BREAKDOWN_EXCEPTION: ' + e.message, 'err');
  }
}
```

---

## 4. Wire loadRevenueTotals() into auth callback

In the `onAuthStateChange` callback, add after the existing `SIGNED_IN` block:

```javascript
    if (event === 'SIGNED_IN') {
      logLine('ok', 'AUTH_SIGNED_IN · ' + (_currentUser?.email || ''), 'ok');
      showToast('Signed in as ' + (_currentUser?.email || ''), 'ok');
      // Load revenue counters on sign-in
      loadRevenueTotals();  // ← ADD THIS LINE
    }
```

Also add to the session restore block at the end of `initAuth()`:

```javascript
  if (session?.user) {
    _currentUser = session.user;
    renderAuthNav(_currentUser);
    logLine('ok', 'AUTH_SESSION_RESTORED · ' + _currentUser.email, 'ok');
    loadRevenueTotals();  // ← ADD THIS LINE
  }
```

---

## Notes

- Revenue tiles are **hidden by default** and only appear after `initAuth()` confirms a valid session.
- `revenue_totals` and `revenue_by_session` are Supabase views — run `refueler_schema_session5.sql` first.
- The RLS policy `auth_read_orders` ensures only authenticated users can read revenue data.
- Tiles use `#F7931A` Bitcoin orange per spec. They sit right of the existing 4 tiles in the stats bar.
- Tap either tile → `toggleRevenueBreakdown()` → console renders per-session revenue rows.
