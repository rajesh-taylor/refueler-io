/* ─── navy-office.js — refueler-share · Navy Office admin ───────────────────
 * Last updated: Share-Dash-3
 *
 * Share-Dash-3 changes (this file):
 *   (1) Rename: dashboard → navy-office throughout. document.title set to
 *       "refueler-share · Navy Office".
 *   (2) Chambers rename: no JS in this file references harbourmaster.
 *   (3a) Client-errors modal: AE/KV source toggle above existing AE table.
 *        KV source: GET /admin/client-errors-log (X-Admin-Key).
 *        Toggle state: in-memory only (no cookie, no localStorage).
 *   (3b) API & MCP card (6th card row-3): replaces CPU-time stub.
 *        Source: GET /admin/api-stats (X-Admin-Key). Degrades gracefully.
 *        by_rail none → "Pro Bono" (carry-in from Share-Dash-2).
 *   (3c) Growth signal card: inline SVG sparkline. Three series (paid/free/api).
 *        Annotation ticks. Add-event form. Delete. Source: /admin/news-events.
 *   (4)  Execution Dock detail: size_bytes human-readable, rail label map,
 *        merkle_root "pending (available at Share-6-5)", download count pending.
 * ─────────────────────────────────────────────────────────────────────────── */

const WORKER = 'https://api.share.refueler.io';
let adminKey    = '';
let refreshTimer = null;
let countdown   = 60;
let lastMetrics  = null;
let lastAe       = null;
let lastSnapshot = null;
let clientErrorsDetail = []; // AE detail rows from /admin/ae-metrics
let kvErrorsCache = null;    // KV log rows from /admin/client-errors-log

// (3a) CE source toggle: 'ae' | 'kv' — in-memory only
let ceSource = 'ae';

// (B10-1) Growth chart caches. Fixed to the last 90 days — the maximum
// Analytics Engine retains — so there is no range toggle; archive via print.
let _growthRange    = 'Y';   // 'Y' = last ~90 days (AE retention ceiling)
let _growthSnapshot = null;  // GET /admin/growth-snapshot (three lines)
let _btcPrice       = null;  // GET /admin/btc-price (right-axis overlay)

// ── Theme ──────────────────────────────────────────────────────────────────
function getTheme() {
  const cookie = document.cookie.split(';').map(c => c.trim())
    .find(c => c.startsWith('rs-theme='));
  return cookie ? cookie.split('=')[1] : 'carbon';
}
function setTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  document.getElementById('theme-paper').classList.toggle('active', t === 'paper');
  document.getElementById('theme-carbon').classList.toggle('active', t === 'carbon');
  document.cookie = `rs-theme=${t};path=/;domain=.refueler.io;max-age=2592000;SameSite=Lax;Secure`;
  document.cookie = `rs-theme=;path=/;domain=refueler.io;max-age=0;SameSite=Lax`;
}
setTheme(getTheme());

// ── Sign out ───────────────────────────────────────────────────────────────
function signOut() {
  sessionStorage.removeItem('dash_key');
  location.reload();
}

// ── Gate ───────────────────────────────────────────────────────────────────
document.getElementById('key-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') tryUnlock();
});

function showDashboard() {
  document.getElementById('gate').style.display = 'none';
  document.getElementById('dashboard').style.display = 'block';
  document.title = 'refueler-share · Navy Office';
  initLightningToggle();
}

async function tryUnlock() {
  const input = document.getElementById('key-input').value.trim();
  if (!input) return;
  try {
    const res = await fetch(`${WORKER}/admin/metrics`, {
      headers: { 'X-Admin-Key': input }
    });
    if (res.status === 401) {
      document.getElementById('gate-error').textContent = 'Invalid key.';
      return;
    }
    adminKey = input;
    sessionStorage.setItem('dash_key', adminKey);
    showDashboard();
    await refreshAll();
    startTimer();
  } catch {
    document.getElementById('gate-error').textContent = 'Worker unreachable.';
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  const stored = sessionStorage.getItem('dash_key');
  if (stored) {
    adminKey = stored;
    try {
      const res = await fetch(`${WORKER}/admin/metrics`, {
        headers: { 'X-Admin-Key': adminKey }
      });
      if (res.status === 401) { sessionStorage.removeItem('dash_key'); return; }
      showDashboard();
      await refreshAll();
      startTimer();
    } catch {}
  }
});

// ── Refresh ────────────────────────────────────────────────────────────────
async function refreshAll() {
  clearInterval(refreshTimer);
  countdown = 60;
  updateCountdown();
  const [m, ae, snap, , hh, dock] = await Promise.all([
    fetchMetrics(),
    fetchAeMetrics(),
    fetchSnapshot(),
    fetchKvStats(),
    fetchHostnameHealth(),
    fetchExecutionDock(),
  ]);
  if (m)    { lastMetrics  = m;    renderMetrics(m); }
  if (ae)   { lastAe       = ae;   renderAeMetrics(ae); }
  if (snap) { lastSnapshot = snap; renderSnapshot(snap); }
  if (hh)   { renderHostnameHealth(hh); }
  if (dock) { renderExecutionDock(dock); }
  if (m || ae) renderFarming(lastMetrics, lastAe);
  // (3b) API & MCP card
  fetchApiStats();
  // (3c/B10-1) Growth card — annotations + AE lines + BTC overlay
  fetchGrowthAll();
  const ts = new Date();
  setText('refreshed-at', `Refreshed ${ts.toLocaleTimeString('en-GB')}`);
  document.getElementById('main').setAttribute('data-print-ts', ts.toUTCString());
  startTimer();
}

async function fetchMetrics() {
  try {
    const res = await fetch(`${WORKER}/admin/metrics`, { headers: { 'X-Admin-Key': adminKey } });
    if (res.status === 401) { sessionStorage.removeItem('dash_key'); location.reload(); return null; }
    return res.json();
  } catch (e) { showError(`/admin/metrics: ${e.message}`); return null; }
}
async function fetchAeMetrics() {
  try {
    const res = await fetch(`${WORKER}/admin/ae-metrics`, { headers: { 'X-Admin-Key': adminKey } });
    if (!res.ok) { showError(`/admin/ae-metrics ${res.status}`); return null; }
    return res.json();
  } catch (e) { showError(`/admin/ae-metrics: ${e.message}`); return null; }
}
async function fetchSnapshot() {
  try {
    const res = await fetch(`${WORKER}/admin/snapshot`, { headers: { 'X-Admin-Key': adminKey } });
    if (!res.ok) { showError(`/admin/snapshot ${res.status}`); return null; }
    return res.json();
  } catch (e) { showError(`/admin/snapshot: ${e.message}`); return null; }
}

// ── SW8: Hostname health ──────────────────────────────────────────────────
async function fetchHostnameHealth() {
  try {
    const res = await fetch(`${WORKER}/admin/hostname-health`, { headers: { 'X-Admin-Key': adminKey } });
    if (!res.ok) { showError(`/admin/hostname-health ${res.status}`); return null; }
    return res.json();
  } catch (e) { showError(`/admin/hostname-health: ${e.message}`); return null; }
}

function renderHostnameHealth(data) {
  const countEl   = document.getElementById('hh-count');
  const healthyEl = document.getElementById('hh-healthy');
  const tsEl      = document.getElementById('hh-checked-at');

  if (countEl)   countEl.textContent   = data.count   ?? 0;
  if (healthyEl) {
    const healthy = data.healthy ?? 0;
    const count   = data.count   ?? 0;
    healthyEl.textContent = `${healthy}/${count}`;
    healthyEl.className   = 'card-value ' + (
      count === 0         ? '' :
      healthy < count     ? 'val-warn' : 'val-green'
    );
  }
  if (tsEl) {
    tsEl.textContent = data.checked_at
      ? new Date(data.checked_at * 1000).toLocaleTimeString('en-GB', {
          hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short',
        })
      : 'never';
  }

  const tbody = document.getElementById('hh-tbody');
  if (!tbody) return;

  const results = Array.isArray(data.results) ? data.results : [];
  if (results.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="hh-empty">No custom hostnames provisioned yet.</td></tr>';
    return;
  }

  tbody.innerHTML = results.map(r => {
    const statusClass =
      r.status === 'ok'      ? 'hh-ok'      :
      r.status === 'timeout' ? 'hh-timeout' : 'hh-error';
    const httpCol = r.http_status > 0 ? String(r.http_status) : '—';
    const latCol  = r.latency_ms  > 0 ? `${r.latency_ms} ms` : '—';
    return `<tr>
      <td class="hh-host">${escHtml(r.hostname)}</td>
      <td class="${statusClass}">${r.status}</td>
      <td class="hh-http">${httpCol}</td>
      <td class="hh-lat">${latCol}</td>
    </tr>`;
  }).join('');
}

// ── Render: /admin/metrics ─────────────────────────────────────────────────
function renderMetrics(d) {
  const mrrEl = document.getElementById('snap-mrr');
  mrrEl.textContent = d.mrr_gbp !== null && d.mrr_gbp !== undefined ? `£${d.mrr_gbp}` : 'n/a';
  mrrEl.className = 'sm-value' + (d.mrr_gbp > 0 ? ' blue' : '');

  const paidEl = document.getElementById('snap-paid');
  paidEl.textContent = d.paid_total ?? 0;
  paidEl.className = 'sm-value' + (d.paid_total > 0 ? ' blue' : '');

  const rate = d.credential_uniqueness_rate;
  const uEl  = document.getElementById('snap-uniqueness');
  uEl.textContent = rate !== null && rate !== undefined ? `${(rate * 100).toFixed(2)}%` : 'n/a';
  uEl.className = 'sm-value' + (
    rate === null || rate === undefined ? '' :
    rate < 0.99  ? ' red'   :
    rate < 0.999 ? ' amber' : ' green'
  );

  const churn   = d.churn_rate_mtd_pct ?? 0;
  const churnEl = document.getElementById('snap-churn');
  churnEl.textContent = `${churn}%`;
  churnEl.className = 'sm-value' + (churn > 0 ? ' red' : ' green');

  const freeEl = document.getElementById('snap-free-users');
  freeEl.textContent = d.subscribers_by_tier?.free ?? 'n/a';
  freeEl.className = 'sm-value';

  lastMetrics = d;
}

// ── Render: /admin/ae-metrics ──────────────────────────────────────────────
function renderAeMetrics(d) {
  const iss      = d.credential_issuances_by_tier;
  const issTotal = iss ? (iss.free ?? 0) + (iss.creative ?? 0) + (iss.max ?? 0) : null;
  const issEl    = document.getElementById('snap-issuances');
  issEl.textContent = issTotal !== null ? issTotal : 'n/a';
  issEl.className = 'sm-value';

  const bytesEl = document.getElementById('snap-bytes');
  if (d.r2_bytes_uploaded !== null && d.r2_bytes_uploaded !== undefined) {
    const { val, unit } = formatBytes(d.r2_bytes_uploaded);
    bytesEl.textContent = `${val} ${unit}`;
  } else {
    bytesEl.textContent = 'n/a';
  }
  bytesEl.className = 'sm-value';

  const errs   = d.error_rate_by_endpoint;
  const errEl  = document.getElementById('snap-error-rate');
  if (errs && !d.error_rate_note) {
    let totalErrors = 0, totalReqs = 0;
    for (const ep of Object.values(errs)) {
      totalErrors += ep.error_count; totalReqs += ep.total_count;
    }
    const aggRate = totalReqs > 0 ? totalErrors / totalReqs : 0;
    errEl.textContent = `${(aggRate * 100).toFixed(2)}%`;
    errEl.className = 'sm-value' + (aggRate > 0.01 ? ' red' : aggRate > 0 ? ' amber' : ' green');
  } else {
    errEl.textContent = 'n/a'; errEl.className = 'sm-value';
  }

  const lat  = d.latency_by_endpoint;
  const ul   = lat?.upload;
  const dl   = lat?.download;

  const ulEl = document.getElementById('snap-upload-speed');
  if (ul) {
    ulEl.textContent = `${ul.p95_ms} ms`;
    ulEl.className = 'sm-value' + (ul.p95_ms > 500 ? ' red' : ul.p95_ms > 200 ? ' amber' : '');
  } else { ulEl.textContent = 'n/a'; ulEl.className = 'sm-value'; }

  const dlEl = document.getElementById('snap-download-speed');
  if (dl) {
    dlEl.textContent = `${dl.p95_ms} ms`;
    dlEl.className = 'sm-value' + (dl.p95_ms > 500 ? ' red' : dl.p95_ms > 200 ? ' amber' : '');
  } else { dlEl.textContent = 'n/a'; dlEl.className = 'sm-value'; }

  const ulP99El = document.getElementById('snap-upload-speed-p99');
  if (ul) {
    ulP99El.textContent = `${ul.p99_ms} ms`;
    ulP99El.className = 'sm-value' + (ul.p99_ms > 1000 ? ' red' : ul.p99_ms > 500 ? ' amber' : '');
  } else { ulP99El.textContent = 'n/a'; ulP99El.className = 'sm-value'; }

  const dlP99El = document.getElementById('snap-download-speed-p99');
  if (dl) {
    dlP99El.textContent = `${dl.p99_ms} ms`;
    dlP99El.className = 'sm-value' + (dl.p99_ms > 1000 ? ' red' : dl.p99_ms > 500 ? ' amber' : '');
  } else { dlP99El.textContent = 'n/a'; dlP99El.className = 'sm-value'; }

  const retEl    = document.getElementById('snap-retrieval');
  const ret      = d.r2_chunk_retrieval_success_rate;
  const retTotal = d.r2_chunk_total_chunks ?? 0;
  if (retTotal === 0) {
    retEl.textContent = 'n/a'; retEl.className = 'sm-value';
  } else if (ret !== null && ret !== undefined) {
    retEl.textContent = `${(ret * 100).toFixed(2)}%`;
    retEl.className = 'sm-value' + (ret < 0.99 ? ' red' : ret < 0.999 ? ' amber' : ' green');
  } else { retEl.textContent = 'n/a'; retEl.className = 'sm-value'; }

  const ceEl = document.getElementById('snap-client-errors');
  const ce   = d.client_errors_24h;
  if (ce !== null && ce !== undefined) {
    ceEl.textContent = ce;
    ceEl.className = 'sm-value' + (ce > 10 ? ' red' : ce > 0 ? ' amber' : '');
  } else { ceEl.textContent = 'n/a'; ceEl.className = 'sm-value'; }

  clientErrorsDetail = Array.isArray(d.client_errors_detail) ? d.client_errors_detail : [];

  lastAe = d;
}

// ── (3b) API & MCP card ───────────────────────────────────────────────────
// Source: GET /admin/api-stats (X-Admin-Key)
// Response shape: {
//   active_keys: { provisioned, active, by_plan: {...} },
//   requests_30d: { total, by_rail: { identity, anonymous, none } },
//   api_attach_rate: { api_transfers, total_transfers, rate },
//   sandbox_to_live: { available: false, reason: "..." },
//   ae_available: bool, kv_available: bool
// }
let _apiStatsCache = null;

async function fetchApiStats() {
  try {
    const res = await fetch(`${WORKER}/admin/api-stats`, { headers: { 'X-Admin-Key': adminKey } });
    if (!res.ok) { console.warn('[navy-office] /admin/api-stats', res.status); return; }
    const data = await res.json();
    _apiStatsCache = data;
    renderApiStatsCard(data);
  } catch (e) { console.warn('[navy-office] /admin/api-stats', e.message); }
}

function renderApiStatsCard(data) {
  const activeKeys = data?.active_keys?.active ?? null;
  const r30        = data?.requests_30d ?? null;

  const keysEl = document.getElementById('snap-api-keys');
  const reqsEl = document.getElementById('snap-api-reqs');

  if (keysEl) {
    keysEl.textContent = activeKeys !== null ? String(activeKeys) : 'n/a';
    keysEl.className   = 'sm-value';
  }
  if (reqsEl) {
    // B10-1: the headline request count is BILLABLE traffic only (Registered +
    // Bearer). `total` is dominated by Pro Bono and reads as if the API tier is
    // busy when it is not. Pro Bono is shown as a separate, muted sub-line.
    if (r30 && r30.ae_available !== false) {
      const billable = r30.billable ?? ((r30.by_rail?.identity ?? 0) + (r30.by_rail?.anonymous ?? 0));
      const proBono  = r30.pro_bono ?? (r30.by_rail?.none ?? 0);
      reqsEl.innerHTML =
        `${billable.toLocaleString('en-GB')} billable reqs (30d)` +
        `<br><span style="color:var(--text-tertiary)">+ ${proBono.toLocaleString('en-GB')} Pro Bono</span>`;
    } else {
      reqsEl.textContent = '';
    }
  }
}

// (3a) KV client errors log ──────────────────────────────────────────────
async function fetchKvErrorsLog() {
  try {
    const res = await fetch(`${WORKER}/admin/client-errors-log`, { headers: { 'X-Admin-Key': adminKey } });
    if (!res.ok) { return null; }
    return res.json();
  } catch { return null; }
}

// ── Render: farming signal ─────────────────────────────────────────────────
function renderFarming(m, ae) {
  const el = document.getElementById('snap-farming');
  if (!el) return;

  const iss    = ae?.credential_issuances_by_tier;
  const issued = iss ? (iss.free ?? 0) + (iss.creative ?? 0) + (iss.max ?? 0) : null;

  if (issued === null || issued === 0) {
    el.textContent = 'n/a'; el.className = 'sm-value'; return;
  }

  const completed = ae?.uploads_completed_24h ?? issued;
  const ratio     = completed > 0 ? issued / completed : null;

  if (ratio === null) {
    el.textContent = 'n/a'; el.className = 'sm-value'; return;
  }

  el.textContent = ratio.toFixed(2);
  el.className = 'sm-value' + (
    ratio > 3.0         ? ' red'   :
    ratio >= 1.2        ? ' amber' :
    ratio >= 0.5        ? ' green' : ' red'
  );
}

// ── Render: /admin/snapshot ────────────────────────────────────────────────
function renderSnapshot(d) { lastSnapshot = d; }

// ── Snapshot copy ──────────────────────────────────────────────────────────
async function copySnapshot() {
  const btn = document.getElementById('snapshot-copy-btn');
  try {
    await navigator.clipboard.writeText(JSON.stringify(lastSnapshot ?? {}, null, 2));
    const prev = btn.innerHTML;
    btn.innerHTML = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="2,8 6,12 14,4"/></svg> Copied`;
    btn.classList.add('copied');
    setTimeout(() => { btn.innerHTML = prev; btn.classList.remove('copied'); }, 2000);
  } catch {
    showError('Clipboard write failed');
  }
}

// ── Modal ──────────────────────────────────────────────────────────────────
const MODAL_DEFS = {
  mrr:                  { label: 'Monthly run rate',          plain: 'Revenue this month' },
  paid:                 { label: 'Paid subscribers',          plain: 'Paying customers' },
  uniqueness:           { label: 'Credential uniqueness rate',plain: 'Upload tokens used only once' },
  issuances:            { label: 'Credential issuances (30d)',plain: 'Uploads started in 30 days' },
  storage:              { label: 'Data stored (90d)',         plain: 'Total encrypted data uploaded' },
  errors:               { label: 'Server errors',             plain: 'Worker error rate across all endpoints' },
  'upload-speed':       { label: 'Upload speed · p95',        plain: 'p95 latency on uploads' },
  'upload-speed-p99':   { label: 'Upload speed · p99',        plain: 'Worst-case upload tail latency' },
  'download-speed':     { label: 'Download speed · p95',      plain: 'p95 latency on downloads' },
  'download-speed-p99': { label: 'Download speed · p99',      plain: 'Worst-case download tail latency' },
  retrieval:            { label: 'Download success rate',     plain: 'Chunk retrieval success in last 24h' },
  churn:                { label: 'Churn rate',                plain: 'Cancellations' },
  'free-users':         { label: 'Free users',                plain: 'Total accounts on free tier' },
  'client-errors':      { label: 'Client errors',             plain: 'Browser-side and Worker-observed failures' },
  farming:              { label: 'Farming signal',            plain: 'Credential-to-upload ratio (normal: 0.8–1.2 · alarm: >3.0)' },
  lightning:            { label: 'Lightning settlement',      plain: 'Sats vs fiat payment mix' },
  'kv-monitor':         { label: 'KV quota monitor',         plain: 'Cloudflare Workers KV free-plan usage' },
  'api-mcp':            { label: 'Requests (all tiers)',                plain: 'API keys and request volumes' },
};

let _modalTrigger = null;

function openModal(key, triggerEl) {
  const def = MODAL_DEFS[key];
  if (!def) return;
  _modalTrigger = triggerEl ?? document.activeElement;
  if (_modalTrigger) _modalTrigger.classList.add('modal-active');

  setText('modal-label', def.label);
  setText('modal-plain', def.plain);

  const deferredNote = document.getElementById('modal-deferred-note');
  const isLightning  = key === 'lightning';
  deferredNote.style.display = isLightning ? '' : 'none';
  if (isLightning) {
    deferredNote.innerHTML = '<strong>B7</strong><span class="deferred-badge">deferred</span><br><br>This metric is live at Block 7 when Lightning/Blink integration ships.';
  }

  const mv = document.getElementById('modal-value');
  const ms = document.getElementById('modal-sub');
  if (lastMetrics === null && lastAe === null && key !== 'lightning' && key !== 'api-mcp') {
    mv.textContent = '\u00A0';
    mv.className = 'modal-value skeleton';
    ms.textContent = '\u00A0';
    ms.className = 'modal-sub skeleton';
    _openModalShell();
    return;
  }

  const m  = lastMetrics ?? {};
  const ae = lastAe ?? {};
  let value, sub = '', colorClass = '', isNA = false;

  switch (key) {
    case 'mrr': {
      const v = m.mrr_gbp;
      if (v !== null && v !== undefined) { value = `£${v}`; colorClass = v > 0 ? ' blue' : ''; }
      else { value = 'n/a'; isNA = true; }
      sub = 'Gross MRR from Stripe active subscriptions';
      break;
    }
    case 'paid': {
      const v = m.paid_total;
      if (v !== null && v !== undefined) { value = String(v); colorClass = v > 0 ? ' blue' : ''; }
      else { value = 'n/a'; isNA = true; }
      const tiers   = m.subscribers_by_tier ?? {};
      const tierStr = Object.entries(tiers).filter(([t]) => t !== 'free')
        .map(([t, n]) => `${n} ${t}`).join(' · ');
      const conv = m.free_to_paid_conversion_rate;
      sub = [tierStr, conv != null ? `${conv}% conversion` : ''].filter(Boolean).join(' · ');
      break;
    }
    case 'uniqueness': {
      const r = m.credential_uniqueness_rate;
      if (r !== null && r !== undefined) {
        value = `${(r * 100).toFixed(2)}%`;
        colorClass = r < 0.99 ? ' red' : r < 0.999 ? ' amber' : ' green';
      } else { value = 'n/a'; isNA = true; }
      sub = `${m.credential_uniqueness_total_melts ?? 0} melts · ${m.credential_uniqueness_total_attempts ?? 0} replays`;
      break;
    }
    case 'issuances': {
      const iss   = ae.credential_issuances_by_tier;
      const total = iss ? (iss.free ?? 0) + (iss.creative ?? 0) + (iss.max ?? 0) : null;
      if (total !== null) { value = String(total); }
      else { value = 'n/a'; isNA = true; }
      sub = iss ? `free ${iss.free ?? 0} · creative ${iss.creative ?? 0} · max ${iss.max ?? 0}` : 'No AE data';
      // B10-1: replace the placeholder Trend stub with a real daily line graph.
      const sparkEl = document.getElementById('modal-sparkline');
      if (sparkEl) {
        sparkEl.classList.remove('modal-sparkline-stub');
        sparkEl.innerHTML = '<div style="font-family:var(--mono);font-size:11px;color:var(--text-tertiary)">Loading daily trend…</div>';
        _renderIssuanceTrend(sparkEl);
      }
      break;
    }
    case 'storage': {
      const bytes = ae.r2_bytes_uploaded;
      if (bytes !== null && bytes !== undefined) {
        const { val, unit } = formatBytes(bytes);
        value = `${val} ${unit}`;
      } else { value = 'n/a'; isNA = true; }
      sub = 'Rolling 90 days — encrypted ciphertext bytes';
      break;
    }
    case 'errors': {
      const errs = ae.error_rate_by_endpoint;
      if (errs) {
        let te = 0, tr = 0;
        for (const ep of Object.values(errs)) { te += ep.error_count; tr += ep.total_count; }
        const ag = tr > 0 ? te / tr : 0;
        value = `${(ag * 100).toFixed(2)}%`;
        sub = `${te} errors · ${tr.toLocaleString()} total requests`;
        colorClass = ag > 0.01 ? ' red' : ag > 0 ? ' amber' : ' green';
      } else { value = 'n/a'; isNA = true; sub = 'No AE data'; }
      break;
    }
    case 'upload-speed': {
      const ul = ae.latency_by_endpoint?.upload;
      if (ul) {
        value = `${ul.p95_ms} ms`;
        sub = `${ul.requests?.toLocaleString()} requests in last 24h`;
        colorClass = ul.p95_ms > 500 ? ' red' : ul.p95_ms > 200 ? ' amber' : '';
      } else { value = 'n/a'; isNA = true; sub = 'No data in last 24h'; }
      break;
    }
    case 'upload-speed-p99': {
      const ul = ae.latency_by_endpoint?.upload;
      if (ul) {
        value = `${ul.p99_ms} ms`;
        sub = `p95: ${ul.p95_ms} ms · ${ul.requests?.toLocaleString()} requests`;
        colorClass = ul.p99_ms > 1000 ? ' red' : ul.p99_ms > 500 ? ' amber' : '';
      } else { value = 'n/a'; isNA = true; sub = 'No data in last 24h'; }
      break;
    }
    case 'download-speed': {
      const dl = ae.latency_by_endpoint?.download;
      if (dl) {
        value = `${dl.p95_ms} ms`;
        sub = `${dl.requests?.toLocaleString()} requests in last 24h`;
        colorClass = dl.p95_ms > 500 ? ' red' : dl.p95_ms > 200 ? ' amber' : '';
      } else { value = 'n/a'; isNA = true; sub = 'No data in last 24h'; }
      break;
    }
    case 'download-speed-p99': {
      const dl = ae.latency_by_endpoint?.download;
      if (dl) {
        value = `${dl.p99_ms} ms`;
        sub = `p95: ${dl.p95_ms} ms · ${dl.requests?.toLocaleString()} requests`;
        colorClass = dl.p99_ms > 1000 ? ' red' : dl.p99_ms > 500 ? ' amber' : '';
      } else { value = 'n/a'; isNA = true; sub = 'No data in last 24h'; }
      break;
    }
    case 'retrieval': {
      const ret   = ae.r2_chunk_retrieval_success_rate;
      const total = ae.r2_chunk_total_chunks ?? 0;
      if (total === 0) {
        value = 'n/a'; isNA = true;
        sub = 'No downloads in the last 24h — nothing to measure yet';
      } else if (ret !== null && ret !== undefined) {
        value = `${(ret * 100).toFixed(2)}%`;
        sub = `${ae.r2_chunk_successful_chunks ?? 0} / ${total} chunks`;
        colorClass = ret < 0.99 ? ' red' : ret < 0.999 ? ' amber' : ' green';
      } else { value = 'n/a'; isNA = true; sub = 'No R2 retrieval data in AE'; }
      break;
    }
    case 'churn': {
      const pct = m.churn_rate_mtd_pct ?? 0;
      value = `${pct}%`;
      sub = `${m.cancelled_mtd ?? 0} cancelled this month`;
      colorClass = pct > 0 ? ' red' : ' green';
      break;
    }
    case 'free-users': {
      const v = m.subscribers_by_tier?.free;
      if (v !== null && v !== undefined) { value = String(v); }
      else { value = 'n/a'; isNA = true; }
      sub = 'Supabase · subscribers where tier = free';
      break;
    }

    // ── (3a) Client errors modal with AE/KV toggle ─────────────────────
    case 'client-errors': {
      // Build the value from the current ceSource
      const ceAeVal = ae.client_errors_24h;
      if (ceAeVal !== null && ceAeVal !== undefined) {
        value = String(ceAeVal);
        colorClass = ceAeVal > 10 ? ' red' : ceAeVal > 0 ? ' amber' : ' green';
      } else { value = 'n/a'; isNA = true; }

      // Hide standard Trend / Export chrome — this modal owns its layout
      const sparkEl = document.getElementById('modal-sparkline');
      sparkEl.classList.remove('modal-sparkline-stub');
      sparkEl.closest('.modal-body').querySelectorAll('.modal-section-title').forEach(el => {
        el.style.display = 'none';
      });
      document.getElementById('modal-csv-btn').style.display  = 'none';
      document.getElementById('modal-csv-note').style.display = 'none';

      // Render the toggle + content
      _renderCeModalContent(sparkEl, ae);
      sub = ceSource === 'ae'
        ? `Reported by browser (24h) · /log/error`
        : `Observed by Worker (90d) · /admin/client-errors-log`;
      break;
    }

    case 'farming': {
      const farmIss      = ae.credential_issuances_by_tier;
      const farmIssued   = farmIss ? (farmIss.free ?? 0) + (farmIss.creative ?? 0) + (farmIss.max ?? 0) : null;
      const farmCompleted = ae.uploads_completed_24h ?? farmIssued;
      const ratio        = farmIssued !== null && farmCompleted > 0 ? farmIssued / farmCompleted : null;
      if (ratio !== null) {
        value = ratio.toFixed(2);
        sub = `${farmIssued} issued · ${farmCompleted} uploads completed · proxy — B6`;
        colorClass = ratio > 3.0 || ratio < 0.5 ? ' red' : ratio >= 1.2 ? ' amber' : ' green';
      } else { value = 'n/a'; isNA = true; sub = 'No credential issuances in last 24h'; }
      break;
    }
    case 'lightning': {
      value = '—'; sub = 'Deferred to Block 7'; isNA = true;
      break;
    }
    case 'kv-monitor': {
      const kv = window._kvCache ?? {};
      const writes   = kv.writes_today   ?? 0;
      const reads    = kv.reads_today    ?? 0;
      const storage  = kv.storage_bytes  ?? 0;
      const keys     = kv.key_count      ?? 0;
      const W_LIMIT = 1_000;
      const R_LIMIT = 100_000;
      const S_LIMIT = 1_073_741_824;

      const writePct   = Math.min((writes  / W_LIMIT)  * 100, 100);
      const readPct    = Math.min((reads   / R_LIMIT)   * 100, 100);
      const storagePct = Math.min((storage / S_LIMIT)   * 100, 100);

      function _barClass(pct) { return pct >= 90 ? 'danger' : pct >= 70 ? 'warn' : ''; }
      function _fmtBytes(b) {
        if (b >= 1_073_741_824) return (b / 1_073_741_824).toFixed(2) + ' GB';
        if (b >= 1_048_576)     return (b / 1_048_576).toFixed(1) + ' MB';
        if (b >= 1024)          return (b / 1024).toFixed(0) + ' KB';
        return b + ' B';
      }

      const sparkEl = document.getElementById('modal-sparkline');
      sparkEl.classList.remove('modal-sparkline-stub');
      sparkEl.closest('.modal-body').querySelectorAll('.modal-section-title').forEach(el => {
        el.style.display = 'none';
      });
      document.getElementById('modal-csv-btn').style.display  = 'none';
      document.getElementById('modal-csv-note').style.display = 'none';

      value = keys.toLocaleString('en-GB');
      sub   = 'Keys stored (no cap — Cloudflare does not limit key count)';

      sparkEl.innerHTML = `
        <div class="kv-bars">
          <div class="kv-bar-row">
            <div class="kv-bar-header">
              <span class="kv-bar-label">Writes today</span>
              <span class="kv-bar-figure">${writes.toLocaleString('en-GB')} / ${W_LIMIT.toLocaleString('en-GB')}</span>
            </div>
            <div class="kv-bar-track">
              <div class="kv-bar-fill ${_barClass(writePct)}" style="width:${writePct.toFixed(1)}%"></div>
            </div>
            <div class="kv-bar-caption">${writePct.toFixed(1)}% of daily free-plan allowance · resets midnight UTC</div>
          </div>
          <div class="kv-bar-row">
            <div class="kv-bar-header">
              <span class="kv-bar-label">Reads today</span>
              <span class="kv-bar-figure">${reads.toLocaleString('en-GB')} / ${R_LIMIT.toLocaleString('en-GB')}</span>
            </div>
            <div class="kv-bar-track">
              <div class="kv-bar-fill ${_barClass(readPct)}" style="width:${readPct.toFixed(1)}%"></div>
            </div>
            <div class="kv-bar-caption">${readPct.toFixed(1)}% of daily free-plan allowance · resets midnight UTC</div>
          </div>
          <div class="kv-bar-row">
            <div class="kv-bar-header">
              <span class="kv-bar-label">Storage</span>
              <span class="kv-bar-figure">${_fmtBytes(storage)} / 1 GB</span>
            </div>
            <div class="kv-bar-track">
              <div class="kv-bar-fill ${_barClass(storagePct)}" style="width:${storagePct.toFixed(1)}%"></div>
            </div>
            <div class="kv-bar-caption">${storagePct.toFixed(2)}% of 1 GB cap · persistent</div>
          </div>
        </div>
        <div class="kv-keys-row">
          <span class="kv-keys-label">Keys stored</span>
          <span class="kv-keys-value">${keys.toLocaleString('en-GB')}</span>
        </div>
        <div class="kv-plan-note">
          Plan: FREE · Ops limits reset DAILY at midnight UTC.<br>
          Upgrade to Workers Paid ($5/mo) to move to MONTHLY accrual with 10× higher allowances.<br>
          Flip <code>PLAN='paid'</code> in navy-office.js after upgrade — no GraphQL auto-detect yet.
        </div>`;
      break;
    }

    // ── (3b) API & MCP modal ──────────────────────────────────────────────
    case 'api-mcp': {
      const d = _apiStatsCache;
      const activeCount = d?.active_keys?.active ?? null;
      value = activeCount !== null ? String(activeCount) : 'n/a';
      isNA  = activeCount === null;
      sub   = 'Active API keys · all plans';

      const sparkEl = document.getElementById('modal-sparkline');
      sparkEl.classList.remove('modal-sparkline-stub');
      sparkEl.closest('.modal-body').querySelectorAll('.modal-section-title').forEach(el => {
        el.style.display = 'none';
      });
      document.getElementById('modal-csv-btn').style.display  = 'none';
      document.getElementById('modal-csv-note').style.display = 'none';

      sparkEl.innerHTML = _buildApiMcpModalHtml(d);
      break;
    }

    default:
      value = 'n/a'; isNA = true; sub = 'Unknown metric key';
  }

  mv.textContent = value;
  mv.className   = 'modal-value' + (isNA ? ' na' : colorClass);
  ms.textContent = sub;
  ms.className   = 'modal-sub';
  _openModalShell();
}

// ── (3b) API & MCP modal HTML builder ─────────────────────────────────────
// by_rail none → "Pro Bono" (carry-in Share-Dash-2)
function _railLabel(rail) {
  if (rail === 'identity')  return 'Registered';
  if (rail === 'anonymous') return 'Bearer';
  if (rail === 'none')      return 'Pro Bono';
  return escHtml(String(rail ?? '—'));
}

function _apiRow(k, v, cls) {
  return `<div class="api-row"><span class="api-row-k">${escHtml(k)}</span><span class="api-row-v${cls ? ' ' + cls : ''}">${v}</span></div>`;
}

function _buildApiMcpModalHtml(d) {
  if (!d) {
    return `<div class="api-modal-section"><p style="font-family:var(--mono);font-size:12px;color:var(--text-tertiary)">No data — /admin/api-stats not yet reached.</p></div>`;
  }

  const aeWarn  = d.ae_available  === false ? '<span class="api-row-v unavail">AE unavailable</span>' : null;
  const kvWarn  = d.kv_available  === false ? '<span class="api-row-v unavail">KV unavailable</span>' : null;

  // Section 1: Active keys
  const ak = d.active_keys ?? {};
  const byPlan = ak.by_plan ?? {};
  const keyRows = [
    _apiRow('Provisioned', ak.provisioned ?? '—'),
    _apiRow('Active',      ak.active      ?? '—'),
    ...Object.entries(byPlan).map(([plan, n]) => _apiRow(`  ${escHtml(plan)}`, String(n))),
  ];

  // Section 2: Requests 30d — B10-1: lead with billable (Registered + Bearer),
  // then the rail breakdown, then Pro Bono and the all-in total for reference.
  const r30 = d.requests_30d ?? {};
  const byRail = r30.by_rail ?? {};
  const billable = r30.billable ?? ((byRail.identity ?? 0) + (byRail.anonymous ?? 0));
  const proBono  = r30.pro_bono ?? (byRail.none ?? 0);
  const reqRows = (r30.ae_available === false)
    ? [ _apiRow('Requests (30d)', aeWarn || 'Analytics Engine unavailable') ]
    : [
        _apiRow('Billable (30d)', billable.toLocaleString('en-GB')),
        _apiRow('  Registered',   String(byRail.identity ?? 0)),
        _apiRow('  Bearer',       String(byRail.anonymous ?? 0)),
        _apiRow('Pro Bono',       proBono.toLocaleString('en-GB')),
        _apiRow('All requests',   (r30.total ?? 0).toLocaleString('en-GB')),
      ];

  // Section 3: Attach rate
  const ar = d.api_attach_rate ?? {};
  const ratePct = ar.rate != null ? `${(ar.rate * 100).toFixed(1)}%` : (kvWarn ? kvWarn : '—');
  const attachRows = [
    _apiRow('API transfers',   ar.api_transfers?.toLocaleString('en-GB') ?? '—'),
    _apiRow('Total transfers', ar.total_transfers?.toLocaleString('en-GB') ?? '—'),
    _apiRow('Attach rate',     ratePct),
  ];

  // Section 4: Sandbox → live
  const s2l = d.sandbox_to_live ?? {};
  const s2lVal = s2l.available === false
    ? `<span class="api-row-v pending">pending — ${escHtml(s2l.reason ?? 'no reason given')}</span>`
    : `<span class="api-row-v">available</span>`;

  return `
    <div class="api-modal-section">
      <div class="api-modal-section-title">Active keys</div>
      ${keyRows.join('')}
    </div>
    <div class="api-modal-section">
      <div class="api-modal-section-title">Requests · 30d</div>
      ${reqRows.join('')}
    </div>
    <div class="api-modal-section">
      <div class="api-modal-section-title">API attach rate</div>
      ${attachRows.join('')}
    </div>
    <div class="api-modal-section">
      <div class="api-modal-section-title">Sandbox → live</div>
      ${_apiRow('Status', s2lVal)}
    </div>
  `;
}

// ── (3a) CE modal content renderer ────────────────────────────────────────
// Builds the toggle + whichever table is active, into the given sparkEl.
function _renderCeModalContent(sparkEl, ae) {
  const toggleHtml = `
    <div class="ce-source-toggle">
      <button class="ce-source-btn${ceSource === 'ae' ? ' active' : ''}" onclick="_setCeSource('ae')">
        Reported by browser (24h)
      </button>
      <button class="ce-source-btn${ceSource === 'kv' ? ' active' : ''}" onclick="_setCeSource('kv')">
        Observed by Worker (90d)
      </button>
    </div>`;

  if (ceSource === 'ae') {
    const count = clientErrorsDetail.length;
    if (count === 0) {
      sparkEl.innerHTML = toggleHtml + '<div class="ce-empty">No errors in the last 24 hours.</div>';
      return;
    }
    const rows = clientErrorsDetail.map(r => {
      const ts = r.ts
        ? new Date(r.ts).toLocaleString('en-GB', {
            day: '2-digit', month: 'short',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            hour12: false
          })
        : '—';
      const context = escHtml(r.context || '—');
      const msg     = r.message
        ? escHtml(r.message.slice(0, 80)) + (r.message.length > 80 ? '&hellip;' : '')
        : '—';
      // B10-1: Browser (UA) column dropped — mostly Unknown and not worth a column.
      return `<tr>
        <td class="ce-ts">${ts}</td>
        <td class="ce-ctx">${context}</td>
        <td class="ce-msg">${msg}</td>
      </tr>`;
    }).join('');
    sparkEl.innerHTML = toggleHtml + `
      <div class="modal-section-title">Detail</div>
      <div class="ce-table-wrap">
        <table class="ce-table">
          <thead><tr>
            <th>Time</th><th>Context</th><th>Message</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  } else {
    // KV source — fetch if not cached, then render
    sparkEl.innerHTML = toggleHtml + '<div class="ce-empty" style="color:var(--text-tertiary)">Loading Worker log…</div>';
    fetchKvErrorsLog().then(data => {
      kvErrorsCache = data;
      if (!data) {
        sparkEl.innerHTML = toggleHtml + '<div class="ce-empty" style="color:var(--c-amber)">Worker log unavailable — /admin/client-errors-log returned an error.</div>';
        return;
      }
      const entries = Array.isArray(data.entries) ? data.entries : [];
      if (entries.length === 0) {
        sparkEl.innerHTML = toggleHtml + '<div class="ce-empty">No Worker-observed errors in the last 90 days.</div>';
        return;
      }
      const summary = `${data.total ?? entries.length} total · ${data.count_4xx ?? 0}× 4xx · ${data.count_5xx ?? 0}× 5xx · ${data.window_days ?? 90}d window`;
      const rows = entries.map(r => {
        const ts = r.ts
          ? new Date(r.ts).toLocaleString('en-GB', {
              day: '2-digit', month: 'short',
              hour: '2-digit', minute: '2-digit', second: '2-digit',
              hour12: false
            })
          : '—';
        const statusCls = r.status >= 500 ? 'ce-status" style="color:var(--c-red)' :
                          r.status >= 400 ? 'ce-status" style="color:var(--c-amber)' :
                          'ce-status';
        // B10-1: Message column removed — the Worker-observed KV log records
        // status/endpoint/path but not a message body (appendClientError is
        // called without errorMsg on the 4xx/5xx egress path), so the column
        // was always empty. Endpoint + path + status carry the signal here.
        return `<tr>
          <td class="ce-ts">${ts}</td>
          <td class="${statusCls}">${r.status ?? '—'}</td>
          <td class="ce-ep">${escHtml(r.endpoint ?? '—')}</td>
          <td class="ce-path">${escHtml(r.path ?? '—')}</td>
        </tr>`;
      }).join('');
      sparkEl.innerHTML = toggleHtml + `
        <div class="modal-section-title">Worker-observed errors</div>
        <div class="ce-table-wrap">
          <table class="ce-table">
            <thead><tr>
              <th>Time</th><th>Status</th><th>Endpoint</th><th>Path</th>
            </tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        <p class="ce-provenance-note">${escHtml(summary)}</p>`;
    });
  }
}

// Toggle handler — in-memory only
function _setCeSource(src) {
  ceSource = src;
  // Re-render modal content in place without closing
  const sparkEl = document.getElementById('modal-sparkline');
  if (sparkEl) _renderCeModalContent(sparkEl, lastAe ?? {});
  // Update sub text
  const ms = document.getElementById('modal-sub');
  if (ms) ms.textContent = src === 'ae'
    ? `Reported by browser (24h) · /log/error`
    : `Observed by Worker (90d) · /admin/client-errors-log`;
}

function _openModalShell() {
  const modal = document.getElementById('modal');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => { document.getElementById('modal-close').focus(); });
  modal.addEventListener('keydown', _trapFocus);
}

function _trapFocus(e) {
  if (e.key !== 'Tab') return;
  const modal    = document.getElementById('modal');
  const focusable = Array.from(modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )).filter(el => !el.disabled && el.offsetParent !== null);
  if (!focusable.length) { e.preventDefault(); return; }
  const first = focusable[0], last = focusable[focusable.length - 1];
  if (e.shiftKey) {
    if (document.activeElement === first) { e.preventDefault(); last.focus(); }
  } else {
    if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
  }
}

function onCsvClick() {
  document.getElementById('modal-csv-note').style.display = '';
}

function closeModal() {
  const modal = document.getElementById('modal');
  modal.classList.remove('open');
  modal.removeEventListener('keydown', _trapFocus);
  document.body.style.overflow = '';
  document.getElementById('modal-csv-note').style.display = 'none';

  // Restore elements hidden by client-errors / kv-monitor / api-mcp modals
  const sparkEl = document.getElementById('modal-sparkline');
  if (sparkEl) {
    sparkEl.classList.add('modal-sparkline-stub');
    sparkEl.innerHTML = 'Trend history — coming B5 polish pass';
    sparkEl.closest('.modal-body').querySelectorAll('.modal-section-title').forEach(el => {
      el.style.display = '';
    });
    const csvBtn = document.getElementById('modal-csv-btn');
    if (csvBtn) csvBtn.style.display = '';
    const csvNote = document.getElementById('modal-csv-note');
    if (csvNote) csvNote.style.display = 'none';
  }

  if (_modalTrigger) {
    _modalTrigger.classList.remove('modal-active');
    const t = _modalTrigger;
    requestAnimationFrame(() => { if (typeof t.focus === 'function') t.focus(); });
  }
  _modalTrigger = null;
  // Reset CE source toggle to AE on close so next open is fresh
  ceSource = 'ae';
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeSoonModal(); closeDockModal(); } });

// ── Helpers ────────────────────────────────────────────────────────────────
function parseUA(ua) {
  if (!ua || ua.length < 4) return '—';
  let browser = 'Unknown', os = 'Unknown';

  if      (/Edg\/(\d+)/.test(ua))                   browser = 'Edge '    + ua.match(/Edg\/(\d+)/)[1];
  else if (/OPR\/(\d+)/.test(ua))                   browser = 'Opera '   + ua.match(/OPR\/(\d+)/)[1];
  else if (/Firefox\/(\d+)/.test(ua))               browser = 'Firefox ' + ua.match(/Firefox\/(\d+)/)[1];
  else if (/Chrome\/(\d+)/.test(ua))                browser = 'Chrome '  + ua.match(/Chrome\/(\d+)/)[1];
  else if (/Version\/(\d+)[^)]*Safari/.test(ua))    browser = 'Safari '  + ua.match(/Version\/(\d+)/)[1];
  else if (/Safari\//.test(ua))                     browser = 'Safari';
  else if (/Trident\//.test(ua))                    browser = 'IE';

  if      (/Windows NT 10/.test(ua))  os = 'Windows 10/11';
  else if (/Windows NT/.test(ua))     os = 'Windows';
  else if (/iPhone/.test(ua))         os = 'iOS';
  else if (/iPad/.test(ua))           os = 'iPadOS';
  else if (/Android/.test(ua))        os = 'Android';
  else if (/CrOS/.test(ua))           os = 'ChromeOS';
  else if (/Mac OS X/.test(ua))       os = 'macOS';
  else if (/Linux/.test(ua))          os = 'Linux';

  return `${browser} / ${os}`;
}

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text ?? '';
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return { val: '0', unit: 'B' };
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const raw = bytes / Math.pow(1024, i);
  const val = parseFloat(raw.toFixed(i >= 4 ? 2 : 1)).toString();
  return { val, unit: units[i] };
}

// Human-readable bytes for dock detail — (4)
function fmtSizeBytes(n) {
  if (n == null) return '—';
  const { val, unit } = formatBytes(n);
  return `${val} ${unit}`;
}

function showError(msg) {
  const el = document.querySelector('#error-banner');
  if (!el) return;
  el.style.display = 'block'; el.textContent = msg;
  setTimeout(() => { el.style.display = 'none'; }, 8000);
}

function startTimer() {
  clearInterval(refreshTimer);
  countdown = 60;
  refreshTimer = setInterval(() => {
    countdown--;
    updateCountdown();
    if (countdown <= 0) refreshAll();
  }, 1000);
}

function updateCountdown() {
  const el = document.getElementById('countdown');
  if (el) el.textContent = `↻ ${countdown}s`;
}

// ── Lightning availability toggle (S71) ────────────────────────────────────
const LIGHTNING_STATE_LABELS = {
  phoenixd: { display: 'Phoenixd', sub: 'Lightning live — Phoenixd backend active' },
  true:     { display: 'On',       sub: 'Lightning live — all backends accepted' },
  false:    { display: 'Off',      sub: 'Lightning hidden — Stripe path only' },
};

function renderLightningToggle(val) {
  const info    = LIGHTNING_STATE_LABELS[val] ?? { display: val, sub: '' };
  const stateEl = document.getElementById('lightning-toggle-state');
  const subEl   = document.getElementById('lightning-toggle-sub');
  if (!stateEl) return;
  stateEl.textContent = info.display;
  stateEl.className   = 'card-value ' + (val === 'false' ? 'val-warn' : 'val-green');
  subEl.textContent   = info.sub;
  document.querySelectorAll('#card-lightning-toggle .toggle-btn').forEach(btn => {
    btn.classList.toggle('toggle-btn--active', btn.dataset.value === val);
  });
}

async function loadLightningToggleState() {
  try {
    const res  = await fetch(`${WORKER}/status`);
    const data = await res.json();
    const val  = String(data.lightning_available ?? 'phoenixd');
    renderLightningToggle(val);
  } catch {
    const subEl = document.getElementById('lightning-toggle-sub');
    if (subEl) subEl.textContent = 'error reading state';
  }
}

async function setLightningAvailability(value) {
  try {
    const res = await fetch(`${WORKER}/admin/status`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Key': adminKey },
      body:    JSON.stringify({ lightning_available: value }),
    });
    if (!res.ok) throw new Error(`${res.status}`);
    renderLightningToggle(value);
  } catch (err) {
    showError(`Lightning toggle: ${err.message}`);
  }
}

function initLightningToggle() {
  document.querySelectorAll('#card-lightning-toggle .toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => setLightningAvailability(btn.dataset.value));
  });
  loadLightningToggleState();
}

// ── Smoke test ─────────────────────────────────────────────────────────────
window.smokeTest = async function() {
  console.group('11-metric smoke test');
  const [m, ae] = await Promise.all([
    fetch(`${WORKER}/admin/metrics`,    { headers: { 'X-Admin-Key': adminKey } }).then(r => r.json()),
    fetch(`${WORKER}/admin/ae-metrics`, { headers: { 'X-Admin-Key': adminKey } }).then(r => r.json()),
  ]);
  const iss          = ae.credential_issuances_by_tier;
  const farmIssued   = iss ? (iss.free ?? 0) + (iss.creative ?? 0) + (iss.max ?? 0) : null;
  const farmCompleted = ae.uploads_completed_24h ?? farmIssued;
  const farmRatio    = farmIssued !== null && farmCompleted > 0 ? farmIssued / farmCompleted : null;
  const checks = [
    { id: 1,  label: 'Credential uniqueness rate',    val: m.credential_uniqueness_rate },
    { id: 2,  label: 'Credential issuances (30d)',    val: farmIssued },
    { id: 3,  label: 'R2 bytes uploaded (90d)',       val: ae.r2_bytes_uploaded },
    { id: 4,  label: 'Chunk retrieval success (24h)', val: ae.r2_chunk_retrieval_success_rate },
    { id: 5,  label: 'p95 upload latency',            val: ae.latency_by_endpoint?.upload?.p95_ms },
    { id: 6,  label: 'p99 download latency',          val: ae.latency_by_endpoint?.download?.p99_ms },
    { id: 7,  label: 'Worker error rate',             val: (() => { const e = ae.error_rate_by_endpoint; if (!e) return null; let err=0,tot=0; for (const ep of Object.values(e)){err+=ep.error_count;tot+=ep.total_count;} return tot>0?err/tot:0; })() },
    { id: 8,  label: 'Lightning vs Stripe mix',       val: null, deferred: 'B7' },
    { id: 9,  label: 'Free-to-paid conversion rate',  val: m.free_to_paid_conversion_rate },
    { id: 10, label: 'MRR (GBP floor)',               val: m.mrr_gbp },
    { id: 11, label: 'Farming signal ratio',          val: farmRatio },
  ];
  let pass = 0, deferred = 0, fail = 0;
  for (const c of checks) {
    if (c.deferred)                              { console.log(`⏸  [${c.id}] ${c.label} — deferred (${c.deferred})`); deferred++; }
    else if (c.val !== null && c.val !== undefined) { console.log(`✅ [${c.id}] ${c.label} → ${c.val}`); pass++; }
    else                                           { console.warn(`❌ [${c.id}] ${c.label} — null`); fail++; }
  }
  console.log(`Result: ${pass} pass · ${deferred} deferred · ${fail} fail`);
  console.groupEnd();
  return { pass, deferred, fail };
};

// ─── Sandbox card ────────────────────────────────────────────────────────────

const SANDBOX_TOKEN_COUNT = 10;

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function scrollToCard(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── Coming-soon micro-modal (Share-Dash-1) ────────────────────────────────
const SOON_COPY = {
  'Subscribers':      'A dedicated subscriber view — per-tier lists, lifecycle and Stripe status. Paying-customer counts are already live in System Summary.',
  'Maintenance mode': 'A one-switch maintenance banner for the public Share pages, driven from here.',
  'Rate limits':      'Live per-endpoint rate-limit thresholds and current usage, editable from the dashboard.',
};

function openSoonModal(feature) {
  document.getElementById('soon-modal-title').textContent = feature;
  document.getElementById('soon-modal-body').innerHTML =
    `${escHtml(SOON_COPY[feature] ?? 'A dedicated view for this section.')}` +
    `<br><br><span style="opacity:.6">Coming in a future session.</span>`;
  document.getElementById('soon-modal').classList.add('open');
}
function closeSoonModal() {
  document.getElementById('soon-modal').classList.remove('open');
}

function updateSandboxState(label) {
  const el = document.getElementById('sandbox-state');
  if (!el) return;
  el.textContent = label;
  el.style.color = label === 'Active' ? 'var(--green,#5cb85c)' : label === 'Error' ? '#e05353' : '';
}

async function sandboxActivate() {
  if (!adminKey) { alert('Not authenticated — unlock the Navy Office first.'); return; }

  const rail = document.getElementById('sandbox-rail-select').value;
  const ref  = (document.getElementById('sandbox-ref-input').value || 'sandbox').trim();
  const btn  = document.getElementById('btn-sandbox-activate');
  btn.disabled = true; btn.textContent = 'Issuing…';

  try {
    const res  = await fetch(`${WORKER}/api/v1/sandbox/activate`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Key': adminKey },
      body:    JSON.stringify({ rail, transfer_ref_prefix: ref }),
    });
    const data = await res.json();
    const resultEl = document.getElementById('sandbox-result');
    resultEl.style.display = 'block';

    if (!res.ok) {
      resultEl.innerHTML = `<span style="color:#e05353">Error ${res.status}: ${escapeHtml(data.error ?? 'Unknown error')}</span>`;
      updateSandboxState('Error');
      return;
    }

    const lines = [
      `<strong style="color:var(--fg,#F5F0E8)">✓ Sandbox client issued</strong>`,
      ``,
      `Rail:      <strong>${escapeHtml(data.rail)}</strong>`,
      `Live key:  <span style="color:#C8A96E">${escapeHtml(data.live_key)}</span>`,
      `Sign key:  <span style="color:#C8A96E">${escapeHtml(data.sign_key)}</span>  ← shown once`,
      data.credits !== null
        ? `Credits:   ${data.credits}`
        : `Tokens:    ${data.test_tokens?.length ?? 0} test tokens issued`,
      `Expires:   ${new Date(data.expires_at * 1000).toISOString()}`,
      ``,
      `<span style="opacity:.5;font-size:10px">Full response (copy before timer clears):</span>`,
      `<span style="opacity:.7">${escapeHtml(JSON.stringify(data, null, 2))}</span>`,
    ];
    window._sandboxRaw = data;
    resultEl.innerHTML =
      `<div class="sandbox-result-head"><button class="ghost-btn" onclick="copySandboxResult(this)">Copy JSON</button></div>` +
      lines.join('<br>');

    updateSandboxState('Active');
    document.getElementById('sandbox-sub').textContent =
      `${data.rail} rail · ${data.credits !== null ? data.credits + ' credits' : SANDBOX_TOKEN_COUNT + ' test tokens'} · expires ${new Date(data.expires_at * 1000).toLocaleDateString()}`;

    setTimeout(() => {
      resultEl.innerHTML = '<span style="opacity:.4">Result cleared after 5 min — record credentials immediately next time.</span>';
    }, 5 * 60 * 1000);

  } catch (e) {
    const resultEl = document.getElementById('sandbox-result');
    resultEl.style.display = 'block';
    resultEl.innerHTML = `<span style="color:#e05353">Network error: ${escapeHtml(String(e))}</span>`;
  } finally {
    btn.disabled = false; btn.textContent = 'Issue keypair';
  }
}

async function sandboxReset() {
  if (!adminKey) { alert('Not authenticated — unlock the Navy Office first.'); return; }

  const liveKey = (document.getElementById('sandbox-reset-key-input').value ?? '').trim();
  if (!liveKey.startsWith('rfs_test_live_')) {
    alert('Paste an rfs_test_live_ key into the reset field first.');
    return;
  }

  const btn = document.getElementById('btn-sandbox-reset');
  btn.disabled = true; btn.textContent = 'Resetting…';

  try {
    const res  = await fetch(`${WORKER}/api/v1/sandbox/reset`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Key': adminKey },
      body:    JSON.stringify({ live_key: liveKey }),
    });
    const data     = await res.json();
    const resultEl = document.getElementById('sandbox-result');
    resultEl.style.display = 'block';

    if (!res.ok) {
      resultEl.innerHTML = `<span style="color:#e05353">Error ${res.status}: ${escapeHtml(data.error ?? 'Unknown error')}</span>`;
      return;
    }

    const lines = [
      `<strong style="color:var(--fg,#F5F0E8)">✓ Sandbox reset</strong>`,
      `Rail:     ${escapeHtml(data.rail)}`,
      data.credits !== null
        ? `Credits reissued: ${data.credits}`
        : `Test tokens reissued: ${data.test_tokens?.length ?? 0}`,
      `Reset at: ${new Date(data.reset_at * 1000).toISOString()}`,
    ];
    if (data.test_tokens?.length) {
      lines.push(``, `<span style="opacity:.7">${escapeHtml(JSON.stringify(data.test_tokens, null, 2))}</span>`);
    }
    window._sandboxRaw = data;
    resultEl.innerHTML =
      `<div class="sandbox-result-head"><button class="ghost-btn" onclick="copySandboxResult(this)">Copy JSON</button></div>` +
      lines.join('<br>');

  } catch (e) {
    const resultEl = document.getElementById('sandbox-result');
    resultEl.style.display = 'block';
    resultEl.innerHTML = `<span style="color:#e05353">Network error: ${escapeHtml(String(e))}</span>`;
  } finally {
    btn.disabled = false; btn.textContent = 'Reset credits';
  }
}

// ── KV monitor card ───────────────────────────────────────────────────────────
async function fetchKvStats() {
  try {
    const res  = await fetch(`${WORKER}/admin/kv-stats`, { headers: { 'X-Admin-Key': adminKey } });
    const data = await res.json();
    const el   = document.getElementById('snap-kv-keys');
    if (!el) return;
    const count = data.key_count ?? 0;
    el.textContent = count.toLocaleString('en-GB');
    el.style.color = count > 500_000 ? 'var(--c-red)' : count > 100_000 ? 'var(--c-amber)' : '';
    window._kvCache = data;
  } catch (e) { console.warn('[kv-stats]', e); }
}

// ── Execution Dock (Share-Dash-1/2/3) ─────────────────────────────────────
let dockTransfers = [];

async function fetchExecutionDock() {
  try {
    const res = await fetch(`${WORKER}/admin/execution-dock`, { headers: { 'X-Admin-Key': adminKey } });
    if (!res.ok) { showError(`/admin/execution-dock ${res.status}`); return null; }
    return res.json();
  } catch (e) { showError(`/admin/execution-dock: ${e.message}`); return null; }
}

const DOCK_PILL = {
  active:       { cls: 'active',    label: 'active'    },
  active_nudge: { cls: 'nudge',     label: 'nudge'     },
  collected:    { cls: 'collected', label: 'collected' },
  expired:      { cls: 'expired',   label: 'expired'   },
};

function fmtDockDate(unixSeconds) {
  if (!unixSeconds) return '—';
  return new Date(unixSeconds * 1000).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
  });
}

function renderExecutionDock(data) {
  dockTransfers = Array.isArray(data.transfers) ? data.transfers : [];
  const tbody = document.getElementById('dock-tbody');
  const badge = document.getElementById('dock-badge');
  if (!tbody) return;

  const badgeCount = data.badge_count ?? 0;
  if (badge) {
    if (badgeCount > 0) {
      badge.style.display = '';
      badge.textContent = `${badgeCount} need${badgeCount === 1 ? 's' : ''} a nudge`;
    } else { badge.style.display = 'none'; }
  }

  if (dockTransfers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="dock-empty">No transfers on the dock.</td></tr>';
    return;
  }

  tbody.innerHTML = dockTransfers.slice(0, 10).map((t, i) => {
    const pill  = DOCK_PILL[t.status] ?? { cls: 'expired', label: t.status ?? '—' };
    const short = t.uuid ? `${escHtml(t.uuid.slice(0, 8))}…${escHtml(t.uuid.slice(-4))}` : '—';
    return `<tr onclick="openDockModal(${i})">
      <td class="dock-uuid">${short}</td>
      <td>${escHtml(t.tier ?? '—')}</td>
      <td><span class="dock-pill ${pill.cls}">${escHtml(pill.label)}</span></td>
      <td>${fmtDockDate(t.created_at)}</td>
      <td>${fmtDockDate(t.expiry_timestamp)}</td>
    </tr>`;
  }).join('');
}

function _dockDetailRow(k, v, deferred) {
  return `<div class="dock-detail-row">
    <span class="dock-detail-k">${escHtml(k)}</span>
    <span class="dock-detail-v${deferred ? ' deferred-field' : ''}">${v}</span>
  </div>`;
}

// (4) Rail label map — matches share-sessions spec
const RAIL_LABEL = {
  identity:  'Registered',
  anonymous: 'Bearer',
};

function openDockModal(idx) {
  const t = dockTransfers[idx];
  if (!t) return;
  const pill = DOCK_PILL[t.status] ?? { cls: 'expired', label: t.status ?? '—' };
  const days = t.collected
    ? 'collected'
    : (t.days_remaining != null ? `${t.days_remaining} day${t.days_remaining === 1 ? '' : 's'} left` : '—');

  // (4) size_bytes — human-readable; rail — label map; merkle_root — pending note; download count — pending
  const sizeVal  = t.size_bytes != null ? fmtSizeBytes(t.size_bytes) : '—';
  const railVal  = t.rail ? (RAIL_LABEL[t.rail] ?? escHtml(t.rail)) : '—';

  document.getElementById('dock-modal-title').textContent = 'Transfer';
  document.getElementById('dock-modal-body').innerHTML = [
    _dockDetailRow('UUID',               escHtml(t.uuid ?? '—')),
    _dockDetailRow('Status',             `<span class="dock-pill ${pill.cls}">${escHtml(pill.label)}</span>`),
    _dockDetailRow('Tier',               escHtml(t.tier ?? '—')),
    _dockDetailRow('Created',            fmtDockDate(t.created_at)),
    _dockDetailRow('Expires',            fmtDockDate(t.expiry_timestamp)),
    _dockDetailRow('Remaining',          escHtml(days)),
    _dockDetailRow('Collected at',       t.collected_at ? fmtDockDate(t.collected_at) : '—'),
    _dockDetailRow('Size',               sizeVal),
    _dockDetailRow('Rail',               railVal),
    _dockDetailRow('Download count',     'pending', true),
    _dockDetailRow('BLAKE3 merkle root', 'pending (available at Share-6-5)', true),
  ].join('');
  document.getElementById('dock-modal').classList.add('open');
}
function closeDockModal() {
  document.getElementById('dock-modal').classList.remove('open');
}

// ── Sandbox result copy (Share-Dash-1) ────────────────────────────────────
async function copySandboxResult(btn) {
  try {
    await navigator.clipboard.writeText(JSON.stringify(window._sandboxRaw ?? {}, null, 2));
    if (btn) {
      const prev = btn.textContent;
      btn.textContent = 'Copied';
      btn.classList.add('copied');
      setTimeout(() => { btn.textContent = prev; btn.classList.remove('copied'); }, 1500);
    }
  } catch { showError('Clipboard write failed'); }
}

// ── (3c) Growth signal card ────────────────────────────────────────────────
// Source: GET /admin/news-events (X-Admin-Key)
// Response: { events: [{ id, date, label?, note?, free?, paid?, api? }] }
// POST /admin/news-events  { date, label?, note?, free?, paid?, api? }
// DELETE /admin/news-events/:id

let _growthEvents = [];

// ── (B10-1) Growth data fetchers ───────────────────────────────────────────
// Three sources, one render:
//   · annotations   — GET /admin/news-events   (vertical tick marks)
//   · the lines     — GET /admin/growth-snapshot?range= (AE, cumulative/tier)
//   · BTC overlay   — GET /admin/btc-price      (single spot value)

async function fetchGrowthEvents() {
  try {
    const res = await fetch(`${WORKER}/admin/news-events`, { headers: { 'X-Admin-Key': adminKey } });
    if (!res.ok) { console.warn('[navy-office] /admin/news-events', res.status); return; }
    const data = await res.json();
    _growthEvents = Array.isArray(data.events) ? data.events : [];
  } catch (e) { console.warn('[navy-office] /admin/news-events', e.message); }
}

async function fetchGrowthSnapshot() {
  try {
    const res = await fetch(`${WORKER}/admin/growth-snapshot?range=${encodeURIComponent(_growthRange)}`,
      { headers: { 'X-Admin-Key': adminKey } });
    if (!res.ok) { console.warn('[navy-office] /admin/growth-snapshot', res.status); _growthSnapshot = null; return; }
    _growthSnapshot = await res.json();
  } catch (e) { console.warn('[navy-office] /admin/growth-snapshot', e.message); _growthSnapshot = null; }
}

async function fetchBtcPrice() {
  try {
    const res = await fetch(`${WORKER}/admin/btc-price`, { headers: { 'X-Admin-Key': adminKey } });
    if (!res.ok) { _btcPrice = null; return; }        // 503 = unavailable; overlay hidden
    _btcPrice = await res.json();
  } catch (e) { console.warn('[navy-office] /admin/btc-price', e.message); _btcPrice = null; }
}

// Orchestrator — load all three in parallel, then render once.
async function fetchGrowthAll() {
  await Promise.all([fetchGrowthEvents(), fetchGrowthSnapshot(), fetchBtcPrice()]);
  renderGrowth();
}

// Print / archive just the growth chart as a one-card PDF. @media print in the
// stylesheet isolates #card-growth while body carries .printing-growth.
function printGrowthChart() {
  document.body.classList.add('printing-growth');
  window.print();
}
window.addEventListener('afterprint', () => document.body.classList.remove('printing-growth'));

// Nominal window in seconds per range — fixes the x-axis to the selected window
// so the axis and annotation ticks are stable even when AE has sparse buckets.
const _GROWTH_WINDOW_SEC = { D: 86400, W: 7 * 86400, M: 30 * 86400, Y: 90 * 86400 };

function renderGrowth() {
  const svg  = document.getElementById('growth-svg');
  const list = document.getElementById('growth-events-list');
  const body = document.getElementById('growth-events-body');
  const noteEl = document.getElementById('growth-range-note');
  if (!svg) return;

  const annotations = _growthEvents.filter(e => e.label);
  const snap   = _growthSnapshot;
  const series = Array.isArray(snap?.series) ? snap.series : [];

  // Range note — flags AE unavailability and the truncated Year view.
  if (noteEl) {
    noteEl.textContent = (snap && snap.ae_available === false) ? '· Analytics Engine unavailable' : '';
  }

  const W = 800, H = 120, PAD_L = 0, PAD_R = 0, PAD_T = 12, PAD_B = 20;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;

  // x domain: fixed to the selected window ending now.
  const nowSec = Math.floor(Date.now() / 1000);
  const t1 = nowSec;
  const t0 = nowSec - (_GROWTH_WINDOW_SEC[_growthRange] ?? _GROWTH_WINDOW_SEC.M);
  function xOfT(t) {
    if (t1 === t0) return PAD_L + chartW / 2;
    const frac = Math.max(0, Math.min(1, (t - t0) / (t1 - t0)));
    return PAD_L + frac * chartW;
  }

  // Theme-aware colours (SVG strokes can't resolve CSS vars).
  const isPaper    = document.documentElement.getAttribute('data-theme') !== 'carbon';
  const goldColor  = '#C8A96E';                          // Free
  const greenColor = isPaper ? '#1C7C4A' : '#3DCA7A';    // Paid
  const amberColor = isPaper ? '#B85C00' : '#E8A23A';    // API
  const mutedColor = isPaper ? '#9A948D' : '#5A5751';    // BTC overlay
  const bgStroke   = isPaper ? '#E8E2D8' : '#1A1A1A';

  // Empty / degraded state — no AE line data. Still draw annotation ticks.
  if (series.length === 0) {
    const emptyMsg = (snap && snap.ae_available === false)
      ? 'Analytics Engine unavailable — lines cannot be drawn.'
      : 'No credentials issued in this range yet.';
    const ticks = _growthTickMarks(annotations, xOfT, t0, t1, PAD_T, H, PAD_B, [], null);
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.innerHTML = ticks +
      `<text x="400" y="64" text-anchor="middle" font-family="var(--mono)" font-size="11" fill="${mutedColor}">${escHtml(emptyMsg)}</text>`;
    _wireGrowthTicks(svg);
    _renderGrowthList(list, body, annotations);
    return;
  }

  // y domain (left axis): cumulative credentials issued.
  const maxVal = Math.max(1, ...series.flatMap(p => [p.free_cum ?? 0, p.paid_cum ?? 0, p.api_cum ?? 0]));
  function yOf(v) { return PAD_T + chartH - ((v ?? 0) / maxVal) * chartH; }

  function polyPoints(key) {
    return series.map(p => `${xOfT(p.t).toFixed(1)},${yOf(p[key] ?? 0).toFixed(1)}`).join(' ');
  }
  function lastDot(key, fill) {
    const p = series[series.length - 1];
    if (!p) return '';
    return `<circle cx="${xOfT(p.t).toFixed(1)}" cy="${yOf(p[key] ?? 0).toFixed(1)}" r="3" fill="${fill}" stroke="${bgStroke}" stroke-width="1.5"/>`;
  }

  // BTC/GBP overlay — a single spot value (no historical series exists), drawn as
  // a horizontal reference line near the top of the right axis with a label. It is
  // deliberately NOT a curve: we do not fabricate price history we do not store.
  let btcOverlay = '';
  if (_btcPrice && typeof _btcPrice.price_gbp === 'number') {
    const yBtc = (PAD_T + chartH * 0.10).toFixed(1);
    const priceStr = '£' + Math.round(_btcPrice.price_gbp).toLocaleString('en-GB');
    const staleTag = _btcPrice.stale ? ' (cached)' : '';
    btcOverlay = `
      <line x1="0" y1="${yBtc}" x2="${W}" y2="${yBtc}" stroke="${mutedColor}" stroke-width="1" stroke-dasharray="2,3" opacity="0.8"/>
      <text x="${W - 4}" y="${(PAD_T + chartH * 0.10 - 4).toFixed(1)}" text-anchor="end" font-family="var(--mono)" font-size="9" fill="${mutedColor}">BTC ${escHtml(priceStr)}${escHtml(staleTag)}</text>`;
  }

  // y-max label (left) for the cumulative axis.
  const yMaxLabel = `<text x="2" y="${(PAD_T + 8).toFixed(1)}" text-anchor="start" font-family="var(--mono)" font-size="9" fill="${mutedColor}">${maxVal.toLocaleString('en-GB')}</text>`;

  const ticks = _growthTickMarks(annotations, xOfT, t0, t1, PAD_T, H, PAD_B, series, yOf);

  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.innerHTML = `
    ${btcOverlay}
    ${ticks}
    <polyline points="${polyPoints('free_cum')}" fill="none" stroke="${goldColor}"  stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>
    <polyline points="${polyPoints('paid_cum')}" fill="none" stroke="${greenColor}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>
    <polyline points="${polyPoints('api_cum')}"  fill="none" stroke="${amberColor}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>
    ${lastDot('free_cum', goldColor)}
    ${lastDot('paid_cum', greenColor)}
    ${lastDot('api_cum',  amberColor)}
    ${yMaxLabel}
  `;

  _wireGrowthTicks(svg);
  _renderGrowthList(list, body, annotations);
}

// Annotation FLAG markers, mapped by date onto the fixed time x-axis and seated
// on the Free line (interpolated). A faint guide drops to the x-axis. Hovering a
// flag shows its tooltip and highlights the matching row in the list below (and
// vice-versa). Annotations outside the current window are skipped.
function _growthTickMarks(annotations, xOfT, t0, t1, PAD_T, H, PAD_B, series, yOf) {
  const baseY = H - PAD_B;
  const hasLine = Array.isArray(series) && series.length > 0 && typeof yOf === 'function';

  // Interpolate the Free cumulative line's y at time t (so the flag sits on it).
  function lineY(t) {
    if (!hasLine) return PAD_T + 18;
    const s = series;
    if (t <= s[0].t) return yOf(s[0].free_cum ?? 0);
    if (t >= s[s.length - 1].t) return yOf(s[s.length - 1].free_cum ?? 0);
    for (let i = 1; i < s.length; i++) {
      if (t <= s[i].t) {
        const a = s[i - 1], b = s[i];
        const f = (t - a.t) / ((b.t - a.t) || 1);
        const va = a.free_cum ?? 0, vb = b.free_cum ?? 0;
        return yOf(va + (vb - va) * f);
      }
    }
    return yOf(s[s.length - 1].free_cum ?? 0);
  }

  return annotations.map(ev => {
    if (!ev.date) return '';
    const t = Math.floor(Date.parse(`${ev.date}T00:00:00Z`) / 1000);
    if (!Number.isFinite(t) || t < t0 || t > t1) return '';
    const x  = xOfT(t);
    const y  = lineY(t);
    const xs = x.toFixed(1), ys = y.toFixed(1);
    const poleTop = (y - 17).toFixed(1);
    // Pennant points LEFT (toward earlier dates) so right-edge flags don't clip.
    const pennant = `M ${xs} ${poleTop} L ${(x - 12).toFixed(1)} ${(y - 14).toFixed(1)} L ${xs} ${(y - 10).toFixed(1)} Z`;
    const data = `data-annot-id="${escHtml(ev.id ?? '')}" data-tick-date="${escHtml(ev.date)}" data-tick-label="${escHtml(ev.label ?? '')}" data-tick-note="${escHtml(ev.note ?? '')}"`;
    return `<g class="growth-flag" ${data} style="cursor:pointer;">
      <line x1="${xs}" y1="${ys}" x2="${xs}" y2="${baseY}" stroke="#C8A96E" stroke-width="0.75" stroke-dasharray="2,3" opacity="0.45"/>
      <line class="growth-flag-pole" x1="${xs}" y1="${ys}" x2="${xs}" y2="${poleTop}" stroke="#C8A96E" stroke-width="1.25"/>
      <path class="growth-flag-pennant" d="${pennant}" fill="#C8A96E"/>
      <circle cx="${xs}" cy="${ys}" r="3" fill="#C8A96E"/>
      <circle cx="${xs}" cy="${ys}" r="9" fill="transparent"/>
    </g>`;
  }).join('');
}

function _wireGrowthTicks(svg) {
  svg.querySelectorAll('.growth-flag').forEach(flag => {
    const id = flag.getAttribute('data-annot-id');
    flag.addEventListener('mouseenter', e => { _showGrowthTooltip(e, flag); _setAnnotHi(id, true); });
    flag.addEventListener('mouseleave', ()  => { _hideGrowthTooltip();      _setAnnotHi(id, false); });
    flag.addEventListener('click',      e => _showGrowthTooltip(e, flag));
  });
}

// Two-way highlight between a flag marker and its list row.
function _setAnnotHi(id, on) {
  if (!id) return;
  let sel;
  try { sel = CSS.escape(id); } catch { sel = id.replace(/"/g, '\\"'); }
  const row = document.querySelector(`.growth-event-row[data-annot-id="${sel}"]`);
  if (row) row.classList.toggle('growth-annot-hi', on);
  document.querySelectorAll(`.growth-flag[data-annot-id="${sel}"]`)
    .forEach(f => f.classList.toggle('growth-flag-hi', on));
}

function _renderGrowthList(list, body, annotations) {
  if (!list || !body) return;
  if (annotations.length > 0) {
    list.style.display = '';
    body.innerHTML = _buildEventListHtml(annotations);
    // Row hover → highlight the flag on the chart.
    body.querySelectorAll('.growth-event-row').forEach(row => {
      const id = row.getAttribute('data-annot-id');
      row.addEventListener('mouseenter', () => _setAnnotHi(id, true));
      row.addEventListener('mouseleave', () => _setAnnotHi(id, false));
    });
  } else {
    list.style.display = 'none';
  }
}

// (B10-1) Credential Issuances card modal — daily line graph. Sources the same
// AE data as the growth chart (range=M, daily buckets) and plots NEW issuances
// per day (free + paid + api), replacing the old "coming B5" placeholder stub.
async function _renderIssuanceTrend(sparkEl) {
  let snap;
  try {
    const res = await fetch(`${WORKER}/admin/growth-snapshot?range=M`, { headers: { 'X-Admin-Key': adminKey } });
    if (!res.ok) { sparkEl.innerHTML = `<div class="ce-empty">Daily trend unavailable (${res.status}).</div>`; return; }
    snap = await res.json();
  } catch { sparkEl.innerHTML = '<div class="ce-empty">Daily trend unavailable.</div>'; return; }

  if (snap && snap.ae_available === false) {
    sparkEl.innerHTML = '<div class="ce-empty">Analytics Engine unavailable — trend cannot be drawn.</div>';
    return;
  }
  const series = Array.isArray(snap?.series) ? snap.series : [];
  if (series.length === 0) {
    sparkEl.innerHTML = '<div class="ce-empty">No credential issuances in the last 30 days.</div>';
    return;
  }

  const pts = series.map(p => ({ t: p.t, n: (p.free ?? 0) + (p.paid ?? 0) + (p.api ?? 0) }));
  const totalNew = pts.reduce((s, p) => s + p.n, 0);
  const t0 = pts[0].t, t1 = pts[pts.length - 1].t;
  const maxN = Math.max(1, ...pts.map(p => p.n));

  // Chart box with gutters for a Y-axis (count/day) and an X-axis (date).
  const W = 480, H = 180;
  const PAD_L = 42, PAD_R = 16, PAD_T = 16, PAD_B = 34;
  const plotW = W - PAD_L - PAD_R, plotH = H - PAD_T - PAD_B;
  const xOf = t => (t1 === t0) ? PAD_L + plotW / 2 : PAD_L + ((t - t0) / (t1 - t0)) * plotW;
  const yOf = n => PAD_T + plotH - (n / maxN) * plotH;

  const stroke  = '#C8A96E';
  const isPaper = document.documentElement.getAttribute('data-theme') !== 'carbon';
  const muted   = isPaper ? '#9A948D' : '#5A5751';
  const axis    = isPaper ? '#7A746D' : '#6A675F';

  const poly  = pts.map(p => `${xOf(p.t).toFixed(1)},${yOf(p.n).toFixed(1)}`).join(' ');
  const baseY = yOf(0);
  const dfmt  = t => new Date(t * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

  // Y ticks: 0, mid, max (deduped) — gridline + left-aligned count label.
  const yTicks = [...new Set([0, Math.round(maxN / 2), maxN])];
  const yGrid = yTicks.map(v => {
    const y = yOf(v).toFixed(1);
    return `<line x1="${PAD_L}" y1="${y}" x2="${W - PAD_R}" y2="${y}" stroke="${muted}" stroke-width="0.5" stroke-opacity="0.25"/>` +
           `<text x="${PAD_L - 6}" y="${(parseFloat(y) + 3).toFixed(1)}" text-anchor="end" font-family="var(--mono)" font-size="10" fill="${muted}">${v}</text>`;
  }).join('');

  sparkEl.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block;height:auto">
      ${yGrid}
      <!-- axes -->
      <line x1="${PAD_L}" y1="${PAD_T}" x2="${PAD_L}" y2="${baseY.toFixed(1)}" stroke="${axis}" stroke-width="0.75"/>
      <line x1="${PAD_L}" y1="${baseY.toFixed(1)}" x2="${W - PAD_R}" y2="${baseY.toFixed(1)}" stroke="${axis}" stroke-width="0.75"/>
      <!-- data -->
      <polyline points="${poly}" fill="none" stroke="${stroke}" stroke-width="1.75" stroke-linejoin="round" stroke-linecap="round"/>
      <!-- axis titles -->
      <text transform="rotate(-90)" x="${(-(PAD_T + plotH / 2)).toFixed(1)}" y="12" text-anchor="middle" font-family="var(--mono)" font-size="9" fill="${muted}">issued / day</text>
      <!-- x labels -->
      <text x="${PAD_L}" y="${(baseY + 16).toFixed(1)}" text-anchor="start" font-family="var(--mono)" font-size="10" fill="${muted}">${dfmt(t0)}</text>
      <text x="${((PAD_L + W - PAD_R) / 2).toFixed(1)}" y="${(baseY + 16).toFixed(1)}" text-anchor="middle" font-family="var(--mono)" font-size="9" fill="${muted}">date</text>
      <text x="${W - PAD_R}" y="${(baseY + 16).toFixed(1)}" text-anchor="end" font-family="var(--mono)" font-size="10" fill="${muted}">${dfmt(t1)}</text>
    </svg>
    <div style="font-family:var(--mono);font-size:10px;color:var(--text-tertiary);margin-top:4px">Credentials issued per day · last 30 days · ${totalNew.toLocaleString('en-GB')} total · peak ${maxN.toLocaleString('en-GB')}/day</div>`;
}

function _buildEventListHtml(events) {
  return [...events].sort((a, b) => a.date < b.date ? 1 : -1).map(ev => `
    <div class="growth-event-row" data-annot-id="${escHtml(ev.id ?? '')}">
      <span class="growth-event-date">${escHtml(ev.date ?? '—')}</span>
      ${ev.label ? `<span class="growth-event-label">${escHtml(ev.label)}</span>` : ''}
      <span class="growth-event-note">${escHtml(ev.note ?? '')}</span>
      <button class="growth-event-delete" onclick="growthDeleteEvent('${escHtml(ev.id)}', this)" title="Delete">✕</button>
    </div>`
  ).join('');
}

function _showGrowthTooltip(e, line) {
  const tip   = document.getElementById('growth-tooltip');
  if (!tip) return;
  const label = line.dataset.tickLabel || '';
  const note  = line.dataset.tickNote  || '';
  const date  = line.dataset.tickDate  || '';
  tip.textContent = [date, label, note].filter(Boolean).join('\n');
  tip.style.display = 'block';
  // Position relative to growth-chart-wrap
  const wrap = line.closest('.growth-chart-wrap') ?? document.body;
  const wRect = wrap.getBoundingClientRect();
  const x = e.clientX - wRect.left + 10;
  const y = e.clientY - wRect.top  - 8;
  tip.style.left = `${x}px`;
  tip.style.top  = `${y}px`;
}
function _hideGrowthTooltip() {
  const tip = document.getElementById('growth-tooltip');
  if (tip) tip.style.display = 'none';
}

async function growthAddEvent() {
  if (!adminKey) { alert('Not authenticated.'); return; }
  const date   = (document.getElementById('growth-date').value ?? '').trim();
  const label  = (document.getElementById('growth-label').value ?? '').trim() || undefined;
  const note   = (document.getElementById('growth-note').value ?? '').trim() || undefined;

  if (!date) { alert('Date is required.'); return; }
  if (!label && !note) { alert('Add a label or a note for the annotation.'); return; }

  // B10-1: annotations only. The three lines come from Analytics Engine, so the
  // manual free/paid/api count fields were removed. (The endpoint still accepts
  // them for backward compatibility, but this form no longer sends them.)
  const body = { date };
  if (label) body.label = label;
  if (note)  body.note  = note;

  const statusEl = document.getElementById('growth-form-status');
  statusEl.style.display = '';
  statusEl.textContent = 'Saving…';

  try {
    const res = await fetch(`${WORKER}/admin/news-events`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Key': adminKey },
      body:    JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      statusEl.textContent = `Error ${res.status}: ${err.error ?? 'unknown'}`;
      statusEl.style.color = 'var(--c-red)';
      return;
    }
    statusEl.textContent = '✓ Saved.';
    statusEl.style.color = 'var(--c-green)';
    // Clear fields
    ['growth-date','growth-label','growth-note']
      .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    setTimeout(() => { statusEl.style.display = 'none'; statusEl.style.color = ''; }, 3000);
    // Re-fetch (annotations + lines + overlay)
    await fetchGrowthAll();
  } catch (e) {
    statusEl.textContent = `Network error: ${e.message}`;
    statusEl.style.color = 'var(--c-red)';
  }
}

async function growthDeleteEvent(id, btn) {
  if (!adminKey) { alert('Not authenticated.'); return; }
  if (!id) return;
  const orig = btn ? btn.textContent : '';
  if (btn) { btn.disabled = true; btn.textContent = '…'; }
  try {
    const res = await fetch(`${WORKER}/admin/news-events/${encodeURIComponent(id)}`, {
      method:  'DELETE',
      headers: { 'X-Admin-Key': adminKey },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      showError(`Delete failed ${res.status}: ${err.error ?? 'unknown'}`);
      if (btn) { btn.disabled = false; btn.textContent = orig; }
      return;
    }
    await fetchGrowthAll();
  } catch (e) {
    showError(`Delete error: ${e.message}`);
    if (btn) { btn.disabled = false; btn.textContent = orig; }
  }
}
