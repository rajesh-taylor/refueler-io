/* ─── dock-view.js — Navy Office → Data → Execution Dock (OSA-Tools-4 · 23 Oct 2026) ─────
 * Was in navy-office.js (Share-Dash-1/2/3). Design: private docs/OSA-Tools-plan-v1.md §7
 * "Execution Dock redesign". Worker answers: refueler-share worker/src/handlers/execution_dock.js
 * (the list, from the dock index in KV) and handlers/reports.js (GET /admin/reports/lookup, the
 * live R2 record — the source of truth).
 *
 *   • eight columns at most: Transfer ID · Tier · Status · Upload · Created · Expires · Left · Collected;
 *     anything more is in the card. Ten rows, then "Show more" as the table's last row.
 *   • one card for a row click and for the header look-up. A transfer not in the list opens filled
 *     from the live record. The card's "Check live record" re-reads it and marks every field
 *     where the dock index disagrees.
 *   • "Admin only" marks fields only Refueler staff will ever see (tier, rail), so the same card can
 *     serve the company view later (Harbourmaster). No size (never kept, B12-SR X4), no download
 *     count (it would record recipient activity), no merkle root (withheld, Share-Dash-2).
 *   • a pasted link is cut at the # before anything runs (NavyReports.guard), so the key part
 *     after the # is never in a field or a request; the transfer ID travels in X-Transfer-UUID only
 *   • strict CSP, as navy-office.js: no inline handlers, no style=; every Worker value in an HTML
 *     string passes esc() or is a Number; times in London time
 * ─────────────────────────────────────────────────────────────────────────── */
'use strict';

const DockView = (() => {
  const S = { worker: '', key: '', rows: [], shown: 10, card: null };
  const PAGE = 10;

  // One display for the table and the card (wire value → name; B12-4a-2: wire max = Citizen).
  const TIER   = { free: 'Pro Bono', max: 'Citizen', api: 'Chartered' };
  const RAIL   = { identity: 'Registered', anonymous: 'Bearer' };
  const STATUS = {
    active:       { cls: 'active',    label: 'active'    },
    active_nudge: { cls: 'active',    label: 'active'    },   // B12-2: nudge retired (spec §2.3 — not outreach)
    collected:    { cls: 'collected', label: 'collected' },
    expired:      { cls: 'expired',   label: 'expired'   },
    purged:       { cls: 'expired',   label: 'purged'    },
  };
  // The live record's states, in the words Reports uses.
  const LIVE = {
    live: 'Live', expired: 'Time ran out — parts not yet cleared', gone: 'Gone',
    removed: 'Removed after a report', not_found: 'No such link',
  };
  // Which live states each index status agrees with.
  const AGREES = { active: ['live'], active_nudge: ['live'], expired: ['expired'], collected: ['gone'], purged: ['gone', 'not_found'] };

  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const fmt = (opts) => new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', hour12: false, ...opts });
  const F_ROW   = fmt({ day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  const F_FULL  = fmt({ weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const F_CLOCK = fmt({ hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const t = (f, s) => (Number.isFinite(s) && s > 0 ? f.format(new Date(s * 1000)) : '—');
  const tierName = (k) => TIER[k] ?? k ?? '—';
  const upload = (v) => (v === true ? 'complete' : v === false ? 'in progress' : '—');
  const left = (n) => (Number.isFinite(n) ? `${n} d` : '—');

  // ── Table ─────────────────────────────────────────────────────────────────
  function render(data) {
    S.rows = Array.isArray(data?.transfers) ? data.transfers : [];
    draw();
  }

  function draw() {
    const tb = $('dock-tbody');
    if (!tb) return;
    const n = Math.min(S.shown, S.rows.length);
    $('dock-title').textContent = `Execution Dock · last ${n || PAGE} transfers`;
    if (!S.rows.length) { tb.innerHTML = '<tr><td colspan="8" class="dock-empty">No transfers on the dock.</td></tr>'; return; }
    const rows = S.rows.slice(0, S.shown).map((r, i) => {
      const pill = STATUS[r.status] ?? { cls: 'expired', label: r.status ?? '—' };
      return `<tr data-dock-idx="${i}" tabindex="0">
        <td class="dock-uuid">${r.uuid ? esc(r.uuid.slice(0, 8)) : '—'}</td>
        <td>${esc(tierName(r.tier))}</td>
        <td><span class="dock-pill ${pill.cls}">${esc(pill.label)}</span></td>
        <td>${upload(r.upload_complete)}</td>
        <td class="dock-col-created">${t(F_ROW, r.created_at)}</td>
        <td>${t(F_ROW, r.expiry_timestamp)}</td>
        <td>${r.collected ? '—' : left(r.days_remaining)}</td>
        <td class="dock-col-collected">${t(F_ROW, r.collected_at)}</td>
      </tr>`;
    });
    if (S.rows.length > S.shown) {
      rows.push(`<tr class="dock-more" data-dock-more tabindex="0"><td colspan="8">Show more · ${n} of ${S.rows.length}</td></tr>`);
    }
    tb.innerHTML = rows.join('');
  }

  function more() {
    S.shown += PAGE;
    draw();
    $('dock-tbody').querySelector(`tr[data-dock-idx="${S.shown - PAGE}"]`)?.focus();
  }

  // ── The card ──────────────────────────────────────────────────────────────
  // card = { uuid, index (the dock row or null), live (the look-up answer or null), at, diffs }
  function open(idx) {
    const r = S.rows[idx];
    if (!r?.uuid) return;
    S.card = { uuid: r.uuid, index: r, live: null, at: 0, diffs: new Set() };
    drawCard();
    show();
  }

  function openLive(uuid, live, at) {
    S.card = { uuid, index: null, live, at, diffs: new Set() };
    drawCard();
    show();
  }

  function show() {
    $('dock-modal').classList.add('open');
    requestAnimationFrame(() => $('dock-card-lookup').focus());
  }
  function close() { $('dock-modal')?.classList.remove('open'); }

  const chip = '<span class="dock-chip">Admin only</span>';
  function line(k, v, { admin = false, field = null } = {}) {
    const C = S.card;
    const differs = field && C.diffs.has(field);
    const liveV = differs ? `<span class="dock-diff">⚑ live record: ${esc(liveValue(field))}</span>` : '';
    return `<div class="dock-detail-row${differs ? ' dock-differs' : ''}">
      <span class="dock-detail-k">${esc(k)}${admin ? chip : ''}</span>
      <span class="dock-detail-v">${v}${liveV}</span>
    </div>`;
  }

  function liveValue(field) {
    const L = S.card.live;
    switch (field) {
      case 'status':  return LIVE[L.state] ?? L.state;
      case 'tier':    return tierName(L.tier);
      case 'created': return t(F_FULL, L.created_at);
      case 'expires': return t(F_FULL, L.expires_at);
      case 'upload':  return L.upload_complete ? 'Yes' : 'No — still uploading';
      default:        return '—';
    }
  }

  function drawCard() {
    const C = S.card, r = C.index, L = C.live;
    $('dock-modal-title').innerHTML = `<span class="dock-u8">${esc(C.uuid.slice(0, 8))}</span>`;
    const rows = [];
    if (r) {
      const pill = STATUS[r.status] ?? { cls: 'expired', label: r.status ?? '—' };
      const remaining = r.collected ? 'collected'
        : Number.isFinite(r.days_remaining) ? `${r.days_remaining} day${r.days_remaining === 1 ? '' : 's'} left` : '—';
      rows.push(
        line('Status', `<span class="dock-pill ${pill.cls}">${esc(pill.label)}</span>`, { field: 'status' }),
        line('Tier', esc(tierName(r.tier)), { admin: true, field: 'tier' }),
        line('Created', esc(t(F_FULL, r.created_at)), { field: 'created' }),
        line('Expires', esc(t(F_FULL, r.expiry_timestamp)), { field: 'expires' }),
        line('Remaining', esc(remaining)),
        line('Upload complete', r.upload_complete === true ? 'Yes' : r.upload_complete === false ? 'No — still uploading' : '—', { field: 'upload' }),
        line('Collected at', esc(t(F_FULL, r.collected_at))),
        line('Rail', esc(r.rail ? (RAIL[r.rail] ?? r.rail) : '—'), { admin: true }),
      );
    } else {
      const has = L.state === 'live' || L.state === 'expired';
      rows.push(line('Status', `<strong>${esc(LIVE[L.state] ?? L.state)}</strong>`));
      if (has) {
        rows.push(
          line('Tier', esc(tierName(L.tier)), { admin: true }),
          line('Created', esc(t(F_FULL, L.created_at))),
          line('Expires', esc(t(F_FULL, L.expires_at))),
          line('Upload complete', L.upload_complete ? 'Yes' : 'No — still uploading'),
          line('Downloaded and closed', L.consumed ? 'Yes' : 'No'),
        );
      }
    }
    $('dock-modal-body').innerHTML = rows.join('');
    $('dock-modal-note').textContent = note();
  }

  function note() {
    const C = S.card;
    if (!C.live) return 'This card is the dock’s own list entry. Check live record reads the transfer’s record itself and marks anything that differs.';
    const when = `Live record read at ${t(F_CLOCK, C.at)} (London).`;
    if (!C.index) return `Not in the dock list (older than the list, or never indexed). Filled from the live record. ${when}`;
    if (!C.diffs.size) return `${when} It agrees with the dock index.`;
    return `${when} ${C.diffs.size === 1 ? '1 field differs' : `${C.diffs.size} fields differ`} from the dock index (marked ⚑). The live record is the one to trust.`;
  }

  // Index vs live record. Times within a minute count as the same (the index and the manifest
  // are written a moment apart at initiate).
  function compare(r, L) {
    const d = new Set();
    if (!(AGREES[r.status] ?? []).includes(L.state)) d.add('status');
    if (L.state === 'live' || L.state === 'expired') {
      if (L.tier !== r.tier) d.add('tier');
      if (Math.abs((L.created_at ?? 0) - (r.created_at ?? 0)) > 60) d.add('created');
      if (Math.abs((L.expires_at ?? 0) - (r.expiry_timestamp ?? 0)) > 60) d.add('expires');
      if (typeof r.upload_complete === 'boolean' && r.upload_complete !== L.upload_complete) d.add('upload');
    }
    return d;
  }

  async function lookupLive(uuid) {
    try {
      const res = await fetch(`${S.worker}/admin/reports/lookup`, {
        headers: { 'X-Admin-Key': S.key, 'X-Transfer-UUID': uuid }, cache: 'no-store',
      });
      let data = {};
      try { data = await res.json(); } catch { /* not JSON */ }
      return { status: res.status, data };
    } catch { return { status: 0, data: {} }; }
  }
  function failed(status) {
    if (status === 0)   return 'Could not reach Share (network, or Mullvad?). Nothing was looked up.';
    if (status === 401) return 'The key was not accepted. Nothing was looked up.';
    if (status === 429) return 'Too many look-ups. Wait a minute and try again.';
    return `Share answered with an error (${status}). Try again shortly.`;
  }

  // Check live record: re-read the live record and mark the differences.
  async function relook() {
    const C = S.card, btn = $('dock-card-lookup');
    btn.disabled = true; btn.textContent = 'Checking…';
    const r = await lookupLive(C.uuid);
    btn.disabled = false; btn.textContent = 'Check live record';
    if (r.status !== 200) { $('dock-modal-note').textContent = failed(r.status); return; }
    C.live = r.data;
    C.at = Math.floor(Date.now() / 1000);
    C.diffs = C.index ? compare(C.index, C.live) : new Set();
    drawCard();
  }

  async function copyId(e) {
    const btn = e.currentTarget;
    try { await navigator.clipboard.writeText(S.card.uuid); btn.textContent = 'Copied'; }
    catch { btn.textContent = 'Copy failed'; }
    setTimeout(() => { btn.textContent = 'Copy full ID'; }, 2000);
  }

  // ── Header look-up ────────────────────────────────────────────────────────
  async function go() {
    const input = $('dock-lookup-input'), msg = $('dock-lookup-msg');
    const text = input.value.trim();
    msg.textContent = '';
    if (!text) return;
    const uuid = NavyReports.uuidIn(text);
    if (!uuid) {
      msg.textContent = /^[0-9a-f]{8}$/i.test(text) ? NavyReports.ONLY_8
        : 'That is not a Share link or transfer ID (UUID). Nothing was looked up.';
      return;
    }
    input.value = uuid;   // only the transfer ID part, whatever came with it
    const idx = S.rows.findIndex((r) => r.uuid === uuid);
    if (idx >= 0) return open(idx);
    msg.textContent = 'Looking up…';
    const r = await lookupLive(uuid);
    if (r.status !== 200) { msg.textContent = failed(r.status); return; }
    msg.textContent = '';
    openLive(uuid, r.data, Math.floor(Date.now() / 1000));
  }

  let wired = false;
  function mount({ worker, key }) {
    Object.assign(S, { worker, key });
    if (wired) return;
    wired = true;
    const input = $('dock-lookup-input');
    NavyReports.guard(input, go);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
    $('dock-lookup-go').addEventListener('click', go);
    $('dock-card-lookup').addEventListener('click', relook);
    $('dock-copy-id').addEventListener('click', copyId);
  }

  return { mount, render, open, more, close };
})();
