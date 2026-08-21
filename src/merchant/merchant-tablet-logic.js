// ─── CONSTANTS ─────────────────────────────────────────────────────────────
const SB_URL = 'https://tihgvdokeofnjxjkenmm.supabase.co';
// SB_KEY hardcoded — anon key, safe to ship in client JS (RLS enforces all access).
// Key rotation requires a manual edit here. Not a secret.
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpaGd2ZG9rZW9mbmp4amtlbm1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MTY2NDksImV4cCI6MjA5NDE5MjY0OX0.cRb94WeIP8yRfWd9s2XKmq2nqm1ov-sK1df6u8LNUbo';
const POLL_INTERVAL_MS   = 15000;
const DARWIN_INTERVAL_MS = 15000;

// ─── STATE ──────────────────────────────────────────────────────────────────
let _sbClient    = null;
let _currentUser = null;
let _venueId     = null;
let _venueName   = null;
let _venueData   = null;
let _orders      = [];
let _orderPollTimer  = null;
let _darwinTimer     = null;
let _lastPollTime    = null;
let _userRole        = null;
let _currentView     = 'queue'; // 'queue' | 'ops'
let _staffPinBuffer  = '';
let _ownerPinBuffer  = '';
let _darwinRowsCache = [];
let _staffAuthenticated = false;

// ─── HORIZON STRIP — SLOT-BASED ARRIVAL-INTELLIGENCE PRIMITIVE ──────────────
// Tenants provisioned at venue setup via mapbox_place_id proximity.
// TDP-B: only 'rail' (Darwin) is wired. 'fixtures' is a stub. 'pass' is a comment only.
// Fixture tenant: football-data.org API — wired in Events intelligence layer session.
// Pass tenant: pending dedicated Opus design session(s) before integration.
const HORIZON_TENANTS = ['rail']; // set at loadVenueDetails() based on mapbox_place_id field
// Future: if (venue.venue_type === 'stadium_adjacent') HORIZON_TENANTS.push('fixtures');
// Future pass tenant: // HORIZON_TENANTS.push('pass'); — NOT until Pass-A Opus session

// ─── PIN RATE LIMITING ─────────────────────────────────────────────────────
const _pinAttempts = { staff: 0, owner: 0 };
const _pinLocked   = { staff: false, owner: false };

function _startPinLockout(type) {
  _pinLocked[type] = true;
  _pinAttempts[type] = 0;
  const errId  = type === 'staff' ? 'pin-error'       : 'owner-pin-error';
  const dotsId = type === 'staff' ? 'pin-dots'        : 'owner-pin-dots';
  const errEl  = document.getElementById(errId);
  const dotsEl = document.getElementById(dotsId);
  if (dotsEl) { dotsEl.classList.add('shake'); setTimeout(() => dotsEl.classList.remove('shake'), 450); }
  let remaining = 30;
  function tick() {
    if (errEl) { errEl.textContent = `Too many attempts — wait ${remaining}s`; errEl.classList.add('show'); }
    if (remaining <= 0) {
      _pinLocked[type] = false;
      if (errEl) { errEl.classList.remove('show'); errEl.textContent = 'Incorrect PIN'; }
      return;
    }
    remaining--;
    setTimeout(tick, 1000);
  }
  tick();
}

// ─── THEME ─────────────────────────────────────────────────────────────────
// Terminal persists theme in localStorage (rfTheme) — app/terminal surface preference,
// not the public web rs-theme cookie. The two systems are intentionally separate.
// Font alias prefix divergence (--mono vs --font-mono) is a known doc; align later.
function setTheme(t) {
  document.documentElement.setAttribute('data-theme', t === 'carbon' ? 'carbon' : '');
  localStorage.setItem('rfTheme', t);
  ['pill-paper', 'owner-pill-paper'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('active', t === 'paper');
  });
  ['pill-carbon', 'owner-pill-carbon'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('active', t === 'carbon');
  });
}
(function initTheme() {
  const t = localStorage.getItem('rfTheme') || 'paper';
  document.documentElement.setAttribute('data-theme', t === 'carbon' ? 'carbon' : '');
  ['pill-paper'].forEach(id => { const el = document.getElementById(id); if (el) el.classList.toggle('active', t === 'paper'); });
  ['pill-carbon'].forEach(id => { const el = document.getElementById(id); if (el) el.classList.toggle('active', t === 'carbon'); });
})();

// ─── SUPABASE CLIENT ────────────────────────────────────────────────────────
function getSbClient() {
  if (_sbClient) return _sbClient;
  try { _sbClient = supabase.createClient(SB_URL, SB_KEY); } catch(e) {}
  return _sbClient;
}

// ─── TOAST ─────────────────────────────────────────────────────────────────
let _toastTimer = null;
function showToast(msg, type = '') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast show' + (type ? ' ' + type : '');
  if (_toastTimer) clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
}

// ─── GATE ROUTING ───────────────────────────────────────────────────────────
async function routeGate() {
  const client = getSbClient();
  const { data } = await client.auth.getSession();
  if (data?.session) {
    _currentUser = data.session.user;
    await resolveVenueAndPins(_currentUser);
    if (!_staffAuthenticated) showPinGate();
  } else {
    showMagicLinkGate();
  }
}

function showMagicLinkGate() {
  hidePinGate();
  const gate = document.getElementById('auth-gate');
  gate.style.display = '';
  setTimeout(() => gate.classList.add('visible'), 30);
}
function hideMagicLinkGate() {
  const gate = document.getElementById('auth-gate');
  gate.classList.remove('visible');
  setTimeout(() => { gate.style.display = 'none'; }, 350);
}
function showPinGate() {
  hideMagicLinkGate();
  _staffPinBuffer = '';
  updatePinDots('pin-dots', 'pd', 0);
  document.getElementById('pin-error').classList.remove('show');
  const gate = document.getElementById('pin-gate');
  gate.style.display = '';
  setTimeout(() => gate.classList.add('visible'), 30);
}
function hidePinGate() {
  const gate = document.getElementById('pin-gate');
  gate.classList.remove('visible');
  setTimeout(() => { gate.style.display = 'none'; }, 350);
}

// ─── STAFF PIN PAD ─────────────────────────────────────────────────────────
function updatePinDots(containerId, dotPrefix, count) {
  for (let i = 0; i < 4; i++) {
    const dot = document.getElementById(dotPrefix + i);
    if (dot) dot.classList.toggle('filled', i < count);
  }
}
function pinKey(val) {
  if (val === 'del') {
    _staffPinBuffer = _staffPinBuffer.slice(0, -1);
  } else if (val === 'clear') {
    _staffPinBuffer = '';
  } else if (_staffPinBuffer.length < 4) {
    _staffPinBuffer += val;
  }
  updatePinDots('pin-dots', 'pd', _staffPinBuffer.length);
  if (_staffPinBuffer.length === 4) verifyStaffPin(_staffPinBuffer);
}

async function verifyStaffPin(pin) {
  if (_pinLocked.staff) {
    _staffPinBuffer = '';
    updatePinDots('pin-dots', 'pd', 0);
    return;
  }
  const { data: sessionData } = await getSbClient().auth.getSession();
  const token = sessionData?.session?.access_token;
  if (!token) {
    console.error('[verifyStaffPin] No session token');
    _staffPinBuffer = '';
    updatePinDots('pin-dots', 'pd', 0);
    return;
  }
  let result;
  try {
    const res = await fetch(`${SB_URL}/functions/v1/verify-pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ pin_type: 'staff', pin })
    });
    if (res.status === 429) { _startPinLockout('staff'); _staffPinBuffer = ''; updatePinDots('pin-dots', 'pd', 0); return; }
    result = await res.json();
  } catch(e) {
    console.error('[verifyStaffPin] Network error:', e);
    _staffPinBuffer = '';
    updatePinDots('pin-dots', 'pd', 0);
    const errEl = document.getElementById('pin-error');
    errEl.textContent = 'Connection error — try again';
    errEl.classList.add('show');
    setTimeout(() => { errEl.classList.remove('show'); errEl.textContent = 'Incorrect PIN'; }, 2500);
    return;
  }
  if (result?.valid) {
    _pinAttempts.staff = 0;
    _staffAuthenticated = true;
    hidePinGate();
    onStaffAuthenticated();
  } else {
    _pinAttempts.staff++;
    _staffPinBuffer = '';
    updatePinDots('pin-dots', 'pd', 0);
    if (_pinAttempts.staff >= 5) {
      _startPinLockout('staff');
    } else {
      const dotsEl = document.getElementById('pin-dots');
      dotsEl.classList.add('shake');
      setTimeout(() => dotsEl.classList.remove('shake'), 450);
      const errEl = document.getElementById('pin-error');
      errEl.classList.add('show');
      setTimeout(() => errEl.classList.remove('show'), 2000);
    }
  }
}

// Called when staff PIN accepted
function onStaffAuthenticated() {
  document.getElementById('tablet-ui').style.display = '';
  renderMergedPill();
  showSignedInState();
  startOrderPoll();
  initHorizonToggle();
  maybeShowFirstLogin();
  loadMenuItems();
}

// ─── FIRST-LOGIN WELCOME ─────────────────────────────────────────────────────
// One-time screen on first terminal load at a provisioned venue.
// Key: rfFirstLogin_[venueId] in localStorage — absent = show once, set on dismiss.
// Shows only for independent_owner (the provisioning role). Staff do not see it.
function maybeShowFirstLogin() {
  if (!_venueId || _userRole !== 'independent_owner') return;
  const key = 'rfFirstLogin_' + _venueId;
  if (localStorage.getItem(key)) return; // already dismissed
  const nameEl = document.getElementById('first-login-venue-name');
  if (nameEl && _venueName) nameEl.textContent = _venueName;
  const overlay = document.getElementById('first-login-overlay');
  if (overlay) overlay.classList.add('open');
}

function dismissFirstLogin() {
  if (_venueId) localStorage.setItem('rfFirstLogin_' + _venueId, '1');
  const overlay = document.getElementById('first-login-overlay');
  if (overlay) overlay.classList.remove('open');
}

// ─── OWNER OVERLAY & PIN ────────────────────────────────────────────────────
function openOwnerOverlay() {
  _ownerPinBuffer = '';
  updatePinDots('owner-pin-dots', 'opd', 0);
  document.getElementById('owner-pin-error').classList.remove('show');
  document.getElementById('owner-overlay').classList.add('open');
}
function closeOwnerOverlay() {
  document.getElementById('owner-overlay').classList.remove('open');
  _ownerPinBuffer = '';
}
function ownerPinKey(val) {
  if (val === 'del') {
    _ownerPinBuffer = _ownerPinBuffer.slice(0, -1);
  } else if (val === 'clear') {
    _ownerPinBuffer = '';
  } else if (_ownerPinBuffer.length < 4) {
    _ownerPinBuffer += val;
  }
  updatePinDots('owner-pin-dots', 'opd', _ownerPinBuffer.length);
  if (_ownerPinBuffer.length === 4) verifyOwnerPin(_ownerPinBuffer);
}
async function verifyOwnerPin(pin) {
  if (_pinLocked.owner) {
    _ownerPinBuffer = '';
    updatePinDots('owner-pin-dots', 'opd', 0);
    return;
  }
  const { data: sessionData } = await getSbClient().auth.getSession();
  const token = sessionData?.session?.access_token;
  if (!token) {
    console.error('[verifyOwnerPin] No session token');
    _ownerPinBuffer = '';
    updatePinDots('owner-pin-dots', 'opd', 0);
    return;
  }
  let result;
  try {
    const res = await fetch(`${SB_URL}/functions/v1/verify-pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ pin_type: 'owner', pin })
    });
    if (res.status === 429) { _startPinLockout('owner'); _ownerPinBuffer = ''; updatePinDots('owner-pin-dots', 'opd', 0); return; }
    result = await res.json();
  } catch(e) {
    console.error('[verifyOwnerPin] Network error:', e);
    _ownerPinBuffer = '';
    updatePinDots('owner-pin-dots', 'opd', 0);
    const errEl = document.getElementById('owner-pin-error');
    errEl.textContent = 'Connection error — try again';
    errEl.classList.add('show');
    setTimeout(() => { errEl.classList.remove('show'); errEl.textContent = 'Incorrect PIN'; }, 2500);
    return;
  }
  if (result?.valid) {
    _pinAttempts.owner = 0;
    // If a pending LN change flow is waiting for owner PIN, open that overlay instead of owner panel
    if (_pendingLnChange) {
      _pendingLnChange = false;
      closeOwnerOverlay();
      openLnChangeOverlay();
    } else {
      closeOwnerOverlay();
      openOwnerPanel();
    }
  } else {
    _pinAttempts.owner++;
    _ownerPinBuffer = '';
    updatePinDots('owner-pin-dots', 'opd', 0);
    if (_pinAttempts.owner >= 5) {
      _startPinLockout('owner');
    } else {
      const dotsEl = document.getElementById('owner-pin-dots');
      dotsEl.classList.add('shake');
      setTimeout(() => dotsEl.classList.remove('shake'), 450);
      document.getElementById('owner-pin-error').classList.add('show');
      setTimeout(() => document.getElementById('owner-pin-error').classList.remove('show'), 2000);
    }
  }
}
async function openOwnerPanel() {
  await loadOwnerStats();
  loadMenuItems();
  const badge = document.getElementById('owner-venue-badge');
  if (badge && _venueName) badge.textContent = _venueName.toUpperCase();
  // Populate Lightning address in owner panel (behind owner PIN gate)
  const lnDisplay = document.getElementById('owner-ln-display');
  if (lnDisplay) lnDisplay.textContent = _venueData?.lightning_address || '—';
  // Populate on-chain address (loaded from venue_partners — display only, [R] to change)
  const onchainDisplay = document.getElementById('owner-onchain-display');
  if (onchainDisplay) onchainDisplay.textContent = _venueData?.onchain_address || '—';
  const t = localStorage.getItem('rfTheme') || 'paper';
  ['owner-pill-paper'].forEach(id => { const el = document.getElementById(id); if (el) el.classList.toggle('active', t === 'paper'); });
  ['owner-pill-carbon'].forEach(id => { const el = document.getElementById(id); if (el) el.classList.toggle('active', t === 'carbon'); });
  document.getElementById('owner-panel').classList.add('open');
}
function closeOwnerPanel() {
  document.getElementById('owner-panel').classList.remove('open');
  refreshOrders();
}

async function loadOwnerStats() {
  if (!_venueId) return;
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const session = await getSbClient().auth.getSession();
    const token = session?.data?.session?.access_token || SB_KEY;

    // Today's stats
    const res = await fetch(
      `${SB_URL}/rest/v1/merchant_orders?venue_id=eq.${_venueId}&created_at=gte.${todayStart.toISOString()}&payment_status=eq.paid&select=amount_gbp`,
      { headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + token } }
    );
    if (res.ok) {
      const rows = await res.json();
      const count = rows.length;
      const total = rows.reduce((s, r) => s + (parseFloat(r.amount_gbp) || 0), 0);
      const aov   = count > 0 ? (total / count) : 0;
      document.getElementById('owner-stat-orders').textContent  = count;
      document.getElementById('owner-stat-revenue').textContent = '£' + total.toFixed(2);
      document.getElementById('owner-stat-aov').textContent     = count > 0 ? '£' + aov.toFixed(2) : '—';
    }

    // All-time stats (Item 1)
    const resAll = await fetch(
      `${SB_URL}/rest/v1/merchant_orders?venue_id=eq.${_venueId}&status=in.(confirmed,fulfilled)&select=settled_sats`,
      { headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + token } }
    );
    if (resAll.ok) {
      const allRows = await resAll.json();
      const allCount = allRows.length;
      const allSats  = allRows.reduce((s, r) => s + (parseInt(r.settled_sats) || 0), 0);
      const elOrders = document.getElementById('owner-stat-alltime-orders');
      const elSats   = document.getElementById('owner-stat-alltime-sats');
      if (elOrders) elOrders.textContent = allCount.toLocaleString();
      if (elSats)   elSats.textContent   = allSats.toLocaleString() + ' sats';
    }

    // Last order timestamp (Item 2)
    const resLast = await fetch(
      `${SB_URL}/rest/v1/merchant_orders?venue_id=eq.${_venueId}&order=created_at.desc&limit=1&select=created_at`,
      { headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + token } }
    );
    if (resLast.ok) {
      const lastRows = await resLast.json();
      const elLast = document.getElementById('owner-last-order-ts');
      if (elLast && lastRows.length > 0) {
        const d = new Date(lastRows[0].created_at);
        const today = new Date();
        const sameDay = d.toDateString() === today.toDateString();
        elLast.textContent = 'Last order: ' + (sameDay
          ? d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
          : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }));
      } else if (elLast) {
        elLast.textContent = 'Last order: —';
      }
    }

    // Venue status toggle state (Item 3)
    const venueActive = _venueData?.active !== false;
    const toggle = document.getElementById('owner-venue-status-toggle');
    if (toggle) toggle.checked = venueActive;
    _updateVenueStatusLabel(venueActive);

  } catch(e) { console.warn('loadOwnerStats error:', e); }
}

function _updateVenueStatusLabel(active) {
  const label = document.getElementById('owner-venue-status-label');
  if (label) label.textContent = active ? 'Open — accepting orders' : 'Paused — not accepting orders';
}

async function toggleVenueStatus(active) {
  if (!_venueId) return;
  try {
    const session = await getSbClient().auth.getSession();
    const token = session?.data?.session?.access_token;
    if (!token) { showToast('Session expired — sign in again', 'err'); return; }
    const res = await fetch(
      `${SB_URL}/rest/v1/venue_partners?id=eq.${_venueId}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': SB_KEY,
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ active })
      }
    );
    if (res.ok) {
      if (_venueData) _venueData.active = active;
      _updateVenueStatusLabel(active);
      showToast(active ? 'Venue reopened' : 'Venue paused', active ? 'ok' : 'warn');
    } else {
      showToast('Could not update venue status', 'err');
      // Revert toggle
      const toggle = document.getElementById('owner-venue-status-toggle');
      if (toggle) toggle.checked = !active;
    }
  } catch(e) {
    console.warn('toggleVenueStatus error:', e);
    showToast('Could not update venue status', 'err');
  }
}

// Item 4 — Darwin/fixtures horizon toggle
function initHorizonToggle() {
  const stored = localStorage.getItem('refueler_horizon_visible');
  const visible = stored === null ? true : stored === 'true';
  _applyHorizonVisibility(visible);
  const toggle = document.getElementById('owner-horizon-toggle');
  if (toggle) toggle.checked = visible;
}

function toggleHorizonVisibility(visible) {
  localStorage.setItem('refueler_horizon_visible', visible);
  _applyHorizonVisibility(visible);
}

function _applyHorizonVisibility(visible) {
  const main   = document.getElementById('horizon-band');
  const owner  = document.getElementById('owner-horizon-band');
  const display = visible ? '' : 'none';
  if (main)  main.style.display  = display;
  if (owner) owner.style.display = display;
  if (!visible && _darwinTimer) {
    clearInterval(_darwinTimer);
    _darwinTimer = null;
  } else if (visible && !_darwinTimer) {
    _darwinTimer = setInterval(pollDarwin, DARWIN_INTERVAL_MS);
    pollDarwin();
  }
}

async function ownerSignOut() {
  _staffAuthenticated = false;
  document.getElementById('tablet-ui').style.display = 'none';
  const client = getSbClient();
  if (client) await client.auth.signOut();
  window.location.href = '/command-centre/';
}

// ─── MAGIC LINK (owner gate) ─────────────────────────────────────────────────
async function sendGateMagicLink() {
  const email = document.getElementById('gate-email').value.trim();
  if (!email || !email.includes('@')) { showToast('Enter a valid email', 'err'); return; }
  const client = getSbClient();
  const btn = document.getElementById('gate-btn');
  btn.textContent = 'Sending…'; btn.disabled = true;
  try {
    const redirectTo = window.location.origin.startsWith('https://')
      ? window.location.origin + '/merchant/'
      : 'https://refueler.io/merchant/';
    const { error } = await client.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo }
    });
    btn.textContent = 'Send Sign-in Link'; btn.disabled = false;
    if (error) {
      showToast('Error: ' + error.message, 'err');
    } else {
      const el = document.getElementById('gate-sent');
      el.textContent = '✓ Check your inbox for a sign-in link';
      el.style.color = 'var(--c-green)';
      el.classList.add('show');
    }
  } catch(e) {
    btn.textContent = 'Send Sign-in Link'; btn.disabled = false;
    showToast('Network error', 'err');
  }
}

// ─── SIGN OUT ────────────────────────────────────────────────────────────────
async function signOut() {
  _staffAuthenticated = false;
  document.getElementById('tablet-ui').style.display = 'none';
  const client = getSbClient();
  if (client) await client.auth.signOut();
  window.location.href = '/command-centre/';
}
async function opsSignOut() { await signOut(); }

// ─── NAV — MERGED PILL & IDENTITY BLOCK ──────────────────────────────────────
function renderNavIdentity() {
  const leftBlock = document.getElementById('nav-identity-left');
  if (!leftBlock) return;
  const logoUrl = _venueData?.logo_url;
  if (logoUrl) {
    leftBlock.innerHTML = `
      <img class="nav-venue-logo" src="${logoUrl}" alt="venue logo" onerror="this.parentElement.innerHTML=navWordmarkHTML()">
      <div class="nav-divider"></div>
      <div class="nav-terminal-lbl">MERCHANT TERMINAL</div>`;
  } else {
    leftBlock.innerHTML = `
      <div class="nav-logo">Refueler</div>
      <div class="nav-divider"></div>
      <div class="nav-terminal-lbl">MERCHANT TERMINAL</div>`;
  }
}
function navWordmarkHTML() {
  return `<div class="nav-logo">Refueler</div><div class="nav-divider"></div><div class="nav-terminal-lbl">MERCHANT TERMINAL</div>`;
}

function renderMergedPill() {
  const pillEl = document.getElementById('merged-pill');
  if (!pillEl) return;
  const isOwner = (_userRole === 'independent_owner');
  if (isOwner) {
    pillEl.innerHTML = `
      <button class="mp-seg mp-queue ${_currentView === 'queue' ? 'mp-active' : ''}" id="mp-queue" onclick="pillQueue()">QUEUE</button>
      <div class="mp-seg-divider"></div>
      <button class="mp-seg mp-ops ${_currentView === 'ops' ? 'mp-active' : ''}" id="mp-ops" onclick="pillOps()">OPS</button>
      <div class="mp-seg-divider"></div>
      <button class="mp-seg mp-owner" id="mp-owner" onclick="openOwnerOverlay()">OWNER</button>`;
    pillEl.style.display = '';
  } else {
    pillEl.innerHTML = `<button class="mp-seg mp-queue mp-active" id="mp-queue">QUEUE</button>`;
    pillEl.style.display = '';
  }
}

function pillQueue() { if (_currentView !== 'queue') switchToQueueView(); }
function pillOps()   { if (_currentView !== 'ops')   switchToOpsView();   }

function updateMergedPillActive() {
  const q = document.getElementById('mp-queue');
  const o = document.getElementById('mp-ops');
  if (q) q.classList.toggle('mp-active', _currentView === 'queue');
  if (o) o.classList.toggle('mp-active', _currentView === 'ops');
}

// ─── VENUE RESOLUTION & PIN LOADING ──────────────────────────────────────────
async function resolveVenueAndPins(user) {
  if (!user?.id) { console.error('[resolveVenueAndPins] No authenticated user id'); return; }
  try {
    const { data: sessionData } = await getSbClient().auth.getSession();
    const token = sessionData?.session?.access_token;
    if (!token) { console.error('[resolveVenueAndPins] No active session token'); return; }
    const res = await fetch(
      `${SB_URL}/rest/v1/merchant_users_safe?user_id=eq.${encodeURIComponent(user.id)}&select=venue_id,role&limit=1`,
      { headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + token } }
    );
    if (!res.ok) { console.error('[resolveVenueAndPins] merchant_users_safe fetch failed — HTTP', res.status); return; }
    const rows = await res.json();
    if (!rows || rows.length === 0) { console.error('[resolveVenueAndPins] No row for user_id:', user.id); return; }
    _venueId  = rows[0].venue_id || null;
    _userRole = rows[0].role     || null;
    if (!_venueId) { console.error('[resolveVenueAndPins] No venue_id for user_id:', user.id); return; }
    await loadVenueDetails(_venueId);
  } catch(e) { console.error('[resolveVenueAndPins] Unexpected error:', e); }
}

async function loadVenueDetails(venueId) {
  if (!venueId) return;
  try {
    const { data: sessionData } = await getSbClient().auth.getSession();
    const token = sessionData?.session?.access_token;
    if (!token) { console.error('[loadVenueDetails] No session token'); return; }
    const res = await fetch(
      `${SB_URL}/rest/v1/venue_partners?id=eq.${venueId}&select=id,name,address_line1,coords_lat,coords_lng,active,brand_primary,brand_secondary,venue_type,franchise_group_id,logo_url,lightning_address,onchain_address&limit=1`,
      { headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + token } }
    );
    if (!res.ok) { console.error('[loadVenueDetails] venue_partners fetch failed — HTTP', res.status); return; }
    const rows = await res.json();
    if (rows && rows.length > 0) {
      _venueName = rows[0].name;
      _venueData = rows[0];
      renderNavIdentity();
      // Horizon strip: provision tenants based on venue type
      // (In TDP-B, rail is always the first tenant for Fenchurch St corridor venues)
      // Future: HORIZON_TENANTS = ['rail'] or ['rail','fixtures'] based on mapbox_place_id proximity
    }
  } catch(e) { console.warn('[loadVenueDetails] error:', e); }
}

// ─── TIME HELPERS ─────────────────────────────────────────────────────────────
function minutesAgo(isoString) {
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 60000);
  if (diff < 1) return 'just now';
  if (diff === 1) return '1 min ago';
  return diff + ' mins ago';
}

// ─── ORDER TILE ───────────────────────────────────────────────────────────────
// Status: PENDING gold · IN PREP #7899D4 · READY #3DCA7A.
// Status always doubled by word and position — never colour alone.
// Identifier ≥18px (accessibility floor, locked TDP-B).
// Stamp glyph: calm ✦ settles onto tile on READY. Plumbing-agnostic.
function badgeClassForStatus(status) {
  if (status === 'ready')   return ['badge-ready',   'READY'];
  if (status === 'in_prep') return ['badge-inprep',  'IN PREP'];
  return                           ['badge-pending',  'PENDING'];
}

function renderOrderTile(order) {
  const tile = document.createElement('div');
  const isReady  = order.status === 'ready';
  const [badgeClass, badgeText] = badgeClassForStatus(order.status);
  const identifier = order.identifier || ('#' + (order.id || '').slice(0, 6).toUpperCase());
  const itemName   = order.item_name  || order.product_name || order.item_summary || 'Order';
  const itemMods   = order.modifiers  || order.notes || '';

  tile.className = 'order-tile' + (isReady ? ' tile-stamp-issued' : '');
  tile.id = 'order-' + order.id;
  tile.innerHTML = `
    <div class="order-tile-head">
      <div class="order-tile-identity">
        <span class="order-identifier">${identifier}</span>
        <span class="order-id-sep">·</span>
        <span class="order-item-text">${itemName}${itemMods ? ' · ' + itemMods : ''}</span>
      </div>
      <div class="order-status-badge ${badgeClass}">${badgeText}</div>
    </div>
    <div class="order-tile-time">${minutesAgo(order.created_at)}</div>
    <div class="order-actions">
      ${isReady
        ? `<button class="btn-mark-ready already-ready" disabled>✓ READY FOR COLLECTION</button>
           <button class="btn-dismiss" onclick="dismissOrder('${order.id}')">DISMISS</button>`
        : `<button class="btn-mark-ready" onclick="markOrderReady('${order.id}', this)">✓ MARK READY</button>`
      }
    </div>
    <span class="tile-stamp-glyph" aria-hidden="true">✦</span>`;
  return tile;
}

function renderOrders(orders) {
  const queue = document.getElementById('order-queue');
  queue.querySelectorAll('.order-tile').forEach(el => el.remove());
  const signInPrompt = document.getElementById('queue-signin-prompt');
  if (signInPrompt) signInPrompt.style.display = 'none';

  if (!orders || orders.length === 0) {
    let emptyEl = queue.querySelector('.queue-empty');
    if (!emptyEl) {
      emptyEl = document.createElement('div');
      emptyEl.className = 'queue-empty';
      emptyEl.innerHTML = `
        <div class="queue-empty-icon">✓</div>
        <div class="queue-empty-title">Queue is clear</div>
        <div class="queue-empty-sub">No pending or ready orders</div>`;
      queue.appendChild(emptyEl);
    }
    emptyEl.style.display = '';
    return;
  }
  const emptyEl = queue.querySelector('.queue-empty');
  if (emptyEl) emptyEl.style.display = 'none';

  const sorted = [...orders].sort((a, b) => {
    const rank = o => o.status === 'ready' ? 1 : 0;
    return rank(a) - rank(b);
  });
  sorted.forEach(order => queue.appendChild(renderOrderTile(order)));
  const pending = orders.filter(o => o.status === 'pending' || o.status === 'in_prep').length;
  const ready   = orders.filter(o => o.status === 'ready').length;
  updateQueueStats(pending, ready, null);
}

function updateQueueStats(pending, ready, today) {
  const els = { 'qs-pending': pending, 'qs-ready': ready };
  for (const [id, val] of Object.entries(els)) {
    const el = document.getElementById(id);
    if (el) el.textContent = val !== null ? val : '—';
  }
  if (today !== null) {
    const el = document.getElementById('qs-today');
    if (el) el.textContent = today;
  }
}

async function refreshOrders() {
  if (!_currentUser || !_venueId) return;
  const pollStatus = document.getElementById('queue-poll-status');
  if (pollStatus) pollStatus.textContent = 'Refreshing…';
  try {
    const session = await getSbClient().auth.getSession();
    const token = session?.data?.session?.access_token || SB_KEY;
    const res = await fetch(
      `${SB_URL}/rest/v1/merchant_orders?venue_id=eq.${_venueId}&status=in.(pending,in_prep,ready)&order=created_at.asc&limit=50`,
      { headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + token } }
    );
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const orders = await res.json();
    _orders = orders;
    renderOrders(orders);

    const todayStart = new Date(); todayStart.setHours(0,0,0,0);
    const todayRes = await fetch(
      `${SB_URL}/rest/v1/merchant_orders?venue_id=eq.${_venueId}&created_at=gte.${todayStart.toISOString()}&select=id`,
      { headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + token } }
    );
    if (todayRes.ok) {
      const todayOrders = await todayRes.json();
      const pending = orders.filter(o => o.status === 'pending' || o.status === 'in_prep').length;
      const ready   = orders.filter(o => o.status === 'ready').length;
      updateQueueStats(pending, ready, todayOrders.length);
    }

    _lastPollTime = new Date();
    const timeStr = _lastPollTime.toLocaleTimeString('en-GB', { hour12: false });
    if (pollStatus) pollStatus.textContent = 'Polled ' + timeStr;
  } catch(e) {
    if (pollStatus) pollStatus.textContent = 'Poll error';
    showToast('Could not load orders: ' + e.message, 'err');
  }
}

function startOrderPoll() {
  refreshOrders();
  _orderPollTimer = setInterval(refreshOrders, POLL_INTERVAL_MS);
  document.getElementById('poll-dot').style.display = 'inline-block';
}
function stopOrderPoll() {
  if (_orderPollTimer) { clearInterval(_orderPollTimer); _orderPollTimer = null; }
  document.getElementById('poll-dot').style.display = 'none';
}

// ─── MARK READY / DISMISS ─────────────────────────────────────────────────────
async function markOrderReady(orderId, btn) {
  if (btn) { btn.disabled = true; btn.textContent = 'UPDATING…'; }
  try {
    const session = await getSbClient().auth.getSession();
    const token = session?.data?.session?.access_token || SB_KEY;
    const res = await fetch(`${SB_URL}/rest/v1/merchant_orders?id=eq.${orderId}`, {
      method: 'PATCH',
      headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + token,
                 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
      body: JSON.stringify({ status: 'ready', updated_at: new Date().toISOString() })
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const ref = '#' + orderId.slice(0, 6).toUpperCase();
    showToast('Order ' + ref + ' ready', 'ok');
    // Update tile in-place (stamp glyph settles on status→ready)
    const tile = document.getElementById('order-' + orderId);
    if (tile) {
      const badge = tile.querySelector('.order-status-badge');
      if (badge) { badge.className = 'order-status-badge badge-ready'; badge.textContent = 'READY'; }
      const actions = tile.querySelector('.order-actions');
      if (actions) {
        actions.innerHTML = `
          <button class="btn-mark-ready already-ready" disabled>✓ READY FOR COLLECTION</button>
          <button class="btn-dismiss" onclick="dismissOrder('${orderId}')">DISMISS</button>`;
      }
      // Stamp glyph: settle onto tile (plumbing-agnostic — triggered by status, not payment)
      tile.classList.add('tile-stamp-issued');
    }
    await refreshOrders();
  } catch(e) {
    showToast('Error: ' + e.message, 'err');
    if (btn) { btn.disabled = false; btn.textContent = '✓ MARK READY'; }
  }
}

async function dismissOrder(orderId) {
  try {
    const session = await getSbClient().auth.getSession();
    const token = session?.data?.session?.access_token || SB_KEY;
    await fetch(`${SB_URL}/rest/v1/merchant_orders?id=eq.${orderId}`, {
      method: 'PATCH',
      headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + token,
                 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
      body: JSON.stringify({ status: 'collected', updated_at: new Date().toISOString() })
    });
    const tile = document.getElementById('order-' + orderId);
    if (tile) {
      tile.style.opacity = '0';
      tile.style.transform = 'translateX(20px)';
      tile.style.transition = 'opacity 0.3s, transform 0.3s';
      setTimeout(() => tile.remove(), 300);
    }
    showToast('Order dismissed', 'ok');
    await refreshOrders();
  } catch(e) {
    showToast('Dismiss error: ' + e.message, 'err');
  }
}

// ─── SIGNED OUT / IN STATE ──────────────────────────────────────────────────
function showSignedOutState() {
  document.getElementById('queue-stats-strip').style.display = 'none';
  document.getElementById('poll-dot').style.display = 'none';
  const queue = document.getElementById('order-queue');
  queue.querySelectorAll('.order-tile, .queue-empty').forEach(el => el.remove());
  const prompt = document.getElementById('queue-signin-prompt');
  if (prompt) prompt.style.display = '';
  const pillEl = document.getElementById('merged-pill');
  if (pillEl) pillEl.style.display = 'none';
  const nob = document.getElementById('new-order-bar');
  if (nob) nob.style.display = 'none';
}

function showSignedInState() {
  document.getElementById('queue-stats-strip').style.display = '';
  const prompt = document.getElementById('queue-signin-prompt');
  if (prompt) prompt.style.display = 'none';
  const nob = document.getElementById('new-order-bar');
  if (nob) nob.style.display = '';
  renderMergedPill();
}

// ─── DARWIN FEED ─────────────────────────────────────────────────────────────
const DARWIN_STATION_LABELS = {
  'FST': 'Fenchurch Street', 'LIM': 'Limehouse', 'WHA': 'West Ham',
  'BFR': 'Barking',          'UPM': 'Upminster',  'SHO': 'Shoeburyness',
  'PFL': 'Pitsea',           'GRY': 'Grays'
};

async function pollDarwin() {
  try {
    const { data: sessionData } = await getSbClient().auth.getSession();
    const token = sessionData?.session?.access_token || SB_KEY;
    const res = await fetch(
      `${SB_URL}/rest/v1/rail_signal_current?feed=eq.departure_board_staff&feed_key=eq.FST&select=details,fetched_at&limit=1`,
      { headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + token } }
    );
    if (!res.ok) { setDarwinConnected(false); return; }
    const rows = await res.json();
    if (!rows || rows.length === 0 || !rows[0].details) { setDarwinConnected(false); return; }
    const details  = typeof rows[0].details === 'string' ? JSON.parse(rows[0].details) : rows[0].details;
    const services = Array.isArray(details) ? details : [];
    _darwinRowsCache = services
      .filter(s => !s.is_cancelled)
      .slice(0, 3)
      .map(s => ({ crs: 'FST', actual_timestamp: s.etd || s.atd || s.std }));
    setDarwinConnected(true);
    updateHorizonBand();
  } catch(e) {
    console.warn('[pollDarwin] error:', e);
    setDarwinConnected(false);
  }
}

function setDarwinConnected(connected) {
  const node = document.getElementById('hb-beck-node');
  const label = document.getElementById('hb-darwin-label');
  if (node)  node.style.background  = connected ? '#3DCA7A' : '#5A5751';
  if (label) label.textContent = connected ? 'DARWIN · LIVE' : 'DARWIN · OFFLINE';
}

// ─── HORIZON BAND — slot rendering ───────────────────────────────────────────
// Renders each provisioned tenant slot. In TDP-B: 'rail' only.
// 'fixtures' tenant stub is present but not rendered (no data).
// Pass tenant is a JS comment — no code, no design.
function updateHorizonBand() {
  if (HORIZON_TENANTS.includes('rail')) {
    renderRailTenant();
  }
  // Fixture tenant: stub — wired in Events intelligence layer session
  // if (HORIZON_TENANTS.includes('fixtures')) renderFixturesTenant();
  //
  // Pass tenant: pending dedicated Opus design session(s) before integration
  // if (HORIZON_TENANTS.includes('pass')) renderPassTenant();
}

function renderRailTenant() {
  const rows = _darwinRowsCache;
  const darwinSection = document.getElementById('hb-darwin');
  const label = document.getElementById('hb-darwin-label');

  if (!rows || rows.length === 0) {
    darwinSection.classList.add('hb-darwin-offline');
    document.getElementById('hb-station-name').textContent  = 'OFFLINE';
    document.getElementById('hb-station-eta').textContent   = '—';
    document.getElementById('hb-station-name-2').textContent = '—';
    document.getElementById('hb-station-eta-2').textContent  = '—';
    if (label) label.textContent = 'DARWIN · OFFLINE';
    _horizonClearWindows();
    return;
  }

  darwinSection.classList.remove('hb-darwin-offline');
  if (label) label.textContent = 'DARWIN · LIVE';

  const primary   = rows[0];
  const primaryTs = primary.actual_timestamp ? new Date(primary.actual_timestamp) : null;
  const primaryEta = primaryTs
    ? primaryTs.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
    : '—';
  document.getElementById('hb-station-name').textContent = DARWIN_STATION_LABELS[primary.crs] || primary.crs;
  document.getElementById('hb-station-eta').textContent  = primaryEta;

  if (rows.length > 1) {
    const secondary   = rows[1];
    const secondaryTs = secondary.actual_timestamp ? new Date(secondary.actual_timestamp) : null;
    const secondaryEta = secondaryTs
      ? secondaryTs.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
      : '—';
    document.getElementById('hb-station-name-2').textContent = DARWIN_STATION_LABELS[secondary.crs] || secondary.crs;
    document.getElementById('hb-station-eta-2').textContent  = secondaryEta;
  }

  // Passenger counts: unavailable (no clean join key to historical loadings)
  ['hb-count-0', 'hb-count-3', 'hb-count-7'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '—';
  });
  _horizonSetWindowTints(primaryTs);

  // Mirror to owner horizon strip (same data, no extra fetch)
  _mirrorHorizonToOwner(rows, primaryEta, primaryTs);
}

function _mirrorHorizonToOwner(rows, primaryEta, primaryTs) {
  const ownerNode  = document.getElementById('owner-hb-beck-node');
  const ownerLabel = document.getElementById('owner-hb-darwin-label');
  const ownerName  = document.getElementById('owner-hb-station-name');
  const ownerEta   = document.getElementById('owner-hb-station-eta');
  const ownerName2 = document.getElementById('owner-hb-station-name-2');
  const ownerEta2  = document.getElementById('owner-hb-station-eta-2');
  if (!ownerName) return; // owner panel not open / not in DOM yet — no-op

  if (!rows || rows.length === 0) {
    if (ownerNode)  ownerNode.style.background  = '#5A5751';
    if (ownerLabel) ownerLabel.textContent = 'DARWIN · OFFLINE';
    if (ownerName)  ownerName.textContent  = 'OFFLINE';
    if (ownerEta)   ownerEta.textContent   = '—';
    return;
  }

  if (ownerNode)  ownerNode.style.background  = '#3DCA7A';
  if (ownerLabel) ownerLabel.textContent = 'DARWIN · LIVE';
  if (ownerName)  ownerName.textContent  = DARWIN_STATION_LABELS[rows[0].crs] || rows[0].crs;
  if (ownerEta)   ownerEta.textContent   = primaryEta;

  if (rows.length > 1) {
    const sec   = rows[1];
    const secTs = sec.actual_timestamp ? new Date(sec.actual_timestamp) : null;
    const secEta = secTs
      ? secTs.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
      : '—';
    if (ownerName2) ownerName2.textContent = DARWIN_STATION_LABELS[sec.crs] || sec.crs;
    if (ownerEta2)  ownerEta2.textContent  = secEta;
  }

  // Window tints
  const w0 = document.getElementById('owner-hb-win-0');
  const w3 = document.getElementById('owner-hb-win-3');
  const w7 = document.getElementById('owner-hb-win-7');
  if (w0) w0.style.background = 'rgba(255,255,255,0.07)';
  if (w3) w3.style.background = 'rgba(255,255,255,0.03)';
  if (w7) w7.style.background = 'transparent';
}

function _horizonClearWindows() {
  ['hb-win-0','hb-win-3','hb-win-7'].forEach(wid => {
    const el = document.getElementById(wid);
    if (el) el.style.background = 'transparent';
  });
}
function _horizonSetWindowTints(primaryTs) {
  const win0 = document.getElementById('hb-win-0');
  const win3 = document.getElementById('hb-win-3');
  const win7 = document.getElementById('hb-win-7');
  if (!win0 || !win3 || !win7) return;
  win0.style.background = 'rgba(255,255,255,0.07)';
  win3.style.background = 'rgba(255,255,255,0.03)';
  win7.style.background = 'transparent';
}

// ─── VIEW SWITCHER ────────────────────────────────────────────────────────────
function switchToOpsView() {
  _currentView = 'ops';
  document.getElementById('order-queue').style.display  = 'none';
  document.getElementById('queue-header').style.display = 'none';
  document.getElementById('ops-panel').classList.add('visible');
  // btn-back-queue removed CC-104 — nav pill handles navigation
  const nob = document.getElementById('new-order-bar');
  if (nob) nob.style.display = 'none';
  // Populate ops card values
  if (_venueData) {
    const t = document.getElementById('ops-toggle-open');
    if (t) t.checked = _venueData.active === true;
    updateTradingStatusText(_venueData.active === true);
    const lnDisplay = document.getElementById('ops-lightning-display');
    if (lnDisplay) lnDisplay.textContent = _venueData.lightning_address || '—';
  }
  updateMergedPillActive();
}
function switchToQueueView() {
  closeMenuOverlay();
  _currentView = 'queue';
  document.getElementById('order-queue').style.display  = '';
  document.getElementById('queue-header').style.display = '';
  document.getElementById('ops-panel').classList.remove('visible');
  const nob = document.getElementById('new-order-bar');
  if (nob) nob.style.display = '';
  updateMergedPillActive();
  refreshOrders();
}

// ─── OPS TOGGLE — single honest Open/Closed ──────────────────────────────────
function updateTradingStatusText(isOpen) {
  const text = document.getElementById('ops-trading-status-text');
  const copy = document.getElementById('ops-trading-honest-copy');
  if (text) {
    text.textContent = isOpen ? 'Open' : 'Closed';
    text.style.color = isOpen ? 'var(--c-green)' : 'var(--c-red)';
  }
  if (copy) copy.classList.toggle('visible', !isOpen);
}

async function opsToggleVenueOpen(checked) {
  if (!_venueId) return;
  try {
    const session = await getSbClient().auth.getSession();
    const token = session?.data?.session?.access_token || SB_KEY;
    const res = await fetch(`${SB_URL}/rest/v1/venue_partners?id=eq.${_venueId}`, {
      method: 'PATCH',
      headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + token,
                 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
      body: JSON.stringify({ active: checked })
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    if (_venueData) _venueData.active = checked;
    updateTradingStatusText(checked);
    showToast(
      checked ? 'Accepting orders' : 'Closed — no new orders. Your current queue is unaffected.',
      checked ? 'ok' : 'warn'
    );
  } catch(e) {
    showToast('Update failed: ' + e.message, 'err');
    const t = document.getElementById('ops-toggle-open');
    if (t) t.checked = !checked;
    updateTradingStatusText(!checked);
  }
}

// ─── LIGHTNING ADDRESS CHANGE FLOW ───────────────────────────────────────────
// Owner must re-authenticate via owner PIN before reaching the change overlay.
// On save: PATCH venue_partners.lightning_address (S-27 grants allow this column? 
// Note: S-27 restricts to active + pause_reason only. Lightning address change requires
// service_role path — this is a [R] dashboard operation for now, or requires a
// dedicated Edge Function. The UI is present; the save is gated until an Edge Function
// is added. The overlay prompts the owner correctly; save is disabled with explanation.
let _pendingLnChange = false;

function openLnChangeFlow() {
  // Owner PIN re-auth gate before Lightning address change
  _pendingLnChange = true;
  openOwnerOverlay();
}

function openLnChangeOverlay() {
  const input = document.getElementById('ops-ln-change-input');
  const errEl = document.getElementById('ops-ln-change-error');
  const prompt = document.getElementById('ops-reprint-prompt');
  if (input)  { input.value = _venueData?.lightning_address || ''; }
  if (errEl)  errEl.classList.remove('show');
  if (prompt) prompt.classList.remove('visible');
  const overlay = document.getElementById('ops-ln-change-overlay');
  if (overlay) overlay.classList.add('open');
  setTimeout(() => { if (input) input.focus(); }, 200);
}

function closeLnChangeOverlay() {
  _pendingLnChange = false;
  const overlay = document.getElementById('ops-ln-change-overlay');
  if (overlay) overlay.classList.remove('open');
}

async function saveLightningAddress() {
  const input  = document.getElementById('ops-ln-change-input');
  const errEl  = document.getElementById('ops-ln-change-error');
  const saveBtn = document.getElementById('ops-ln-change-save-btn');
  const prompt  = document.getElementById('ops-reprint-prompt');
  if (!input) return;
  const newAddress = input.value.trim();
  // Basic Lightning address format check
  if (!newAddress || !newAddress.includes('@') || newAddress.split('@').length !== 2) {
    if (errEl) { errEl.textContent = 'Enter a valid Lightning address (e.g. you@walletofsatoshi.com)'; errEl.classList.add('show'); }
    input.focus();
    return;
  }
  if (errEl) errEl.classList.remove('show');
  if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'Saving…'; }
  try {
    // Note: S-27 restricts authenticated UPDATE to active + pause_reason only.
    // Lightning address update requires service_role — this will fail until a dedicated
    // Edge Function (update-lightning-address) is deployed. This is a [R] operation for now.
    // The UI is complete; the Edge Function is scoped for a future short session.
    const session = await getSbClient().auth.getSession();
    const token = session?.data?.session?.access_token || SB_KEY;
    const res = await fetch(`${SB_URL}/rest/v1/venue_partners?id=eq.${_venueId}`, {
      method: 'PATCH',
      headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + token,
                 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
      body: JSON.stringify({ lightning_address: newAddress })
    });
    if (!res.ok) {
      // Expected to fail with 42501 (permission denied) until Edge Function is deployed
      const body = await res.text();
      if (res.status === 403 || body.includes('42501')) {
        if (errEl) { errEl.textContent = 'Lightning address update requires the admin dashboard for now. Contact support@refueler.io.'; errEl.classList.add('show'); }
      } else {
        throw new Error('HTTP ' + res.status);
      }
      if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'Save'; }
      return;
    }
    if (_venueData) _venueData.lightning_address = newAddress;
    const lnDisplay = document.getElementById('ops-lightning-display');
    if (lnDisplay) lnDisplay.textContent = newAddress;
    if (prompt) prompt.classList.add('visible');
    showToast('Lightning address updated', 'ok');
    if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'Save'; }
  } catch(e) {
    if (errEl) { errEl.textContent = 'Save failed: ' + e.message; errEl.classList.add('show'); }
    if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'Save'; }
  }
}

// ─── INIT AUTH ───────────────────────────────────────────────────────────────
async function initAuth() {
  const client = getSbClient();
  if (!client) return;

  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  if (code) {
    try {
      await client.auth.exchangeCodeForSession(code);
      history.replaceState({}, '', window.location.pathname);
    } catch(e) { console.warn('PKCE exchange error:', e); }
  }

  client.auth.onAuthStateChange(async (event, session) => {
    if (session) {
      _currentUser = session.user;
      await resolveVenueAndPins(_currentUser);
      if (!_staffAuthenticated) {
        hideMagicLinkGate();
        showPinGate();
      }
    }
  });

  await routeGate();
}

// ─── WALK-IN ORDER OVERLAY ────────────────────────────────────────────────────
// No Lightning invoice — payment handled by NumoPay fork or cash.
// Inserts into merchant_orders with order_source='walkin'.
function openWalkinOverlay() {
  const overlay = document.getElementById('walkin-overlay');
  if (!overlay) return;
  const idInput   = document.getElementById('walkin-identifier');
  const itemInput = document.getElementById('walkin-item');
  const noteInput = document.getElementById('walkin-notes');
  const errEl     = document.getElementById('walkin-error');
  if (idInput)   idInput.value   = '';
  if (itemInput) itemInput.value = '';
  if (noteInput) noteInput.value = '';
  if (errEl)     errEl.classList.remove('show');
  overlay.classList.add('open');
  setTimeout(() => { if (idInput) idInput.focus(); }, 220);
}
function closeWalkinOverlay() {
  const overlay = document.getElementById('walkin-overlay');
  if (overlay) overlay.classList.remove('open');
}

async function submitWalkinOrder() {
  const idInput   = document.getElementById('walkin-identifier');
  const itemInput = document.getElementById('walkin-item');
  const noteInput = document.getElementById('walkin-notes');
  const errEl     = document.getElementById('walkin-error');
  const submitBtn = document.getElementById('walkin-submit-btn');
  const identifier = idInput   ? idInput.value.trim()   : '';
  const itemName   = itemInput ? itemInput.value.trim()  : '';
  const notes      = noteInput ? noteInput.value.trim()  : '';
  if (!identifier) {
    if (errEl) { errEl.textContent = 'Enter a table number or name.'; errEl.classList.add('show'); }
    if (idInput) idInput.focus();
    return;
  }
  if (!itemName) {
    if (errEl) { errEl.textContent = 'Enter at least one item.'; errEl.classList.add('show'); }
    if (itemInput) itemInput.focus();
    return;
  }
  if (errEl) errEl.classList.remove('show');
  if (!_venueId) { showToast('Venue not loaded — try refreshing.', 'err'); return; }
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'ADDING ORDER…'; }
  try {
    const session = await getSbClient().auth.getSession();
    const token   = session?.data?.session?.access_token;
    if (!token) throw new Error('No session token');
    const itemSummary = notes ? itemName + ' · ' + notes : itemName;
    const res = await fetch(`${SB_URL}/rest/v1/merchant_orders`, {
      method: 'POST',
      headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + token,
                 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
      body: JSON.stringify({
        venue_id: _venueId, status: 'pending', payment_status: 'walkin',
        order_source: 'walkin', identifier, item_name: itemName,
        item_summary: itemSummary,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString()
      })
    });
    if (!res.ok) { const body = await res.text(); throw new Error('HTTP ' + res.status + ' — ' + body); }
    closeWalkinOverlay();
    showToast('Walk-in order added — ' + identifier, 'ok');
    await refreshOrders();
  } catch(e) {
    console.error('[submitWalkinOrder]', e);
    if (errEl) { errEl.textContent = 'Could not add order. Try again.'; errEl.classList.add('show'); }
  } finally {
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Add to Queue'; }
  }
}

// ─── BOOT ────────────────────────────────────────────────────────────────────
initAuth();


// ─── MENU MANAGEMENT — CC-104 ────────────────────────────────────────────────

let _menuItems    = [];
let _menuExpanded = false;

// ── Load & render ─────────────────────────────────────────────────────────────

async function loadMenuItems() {
  if (!_venueId) return;
  try {
    const session = await getSbClient().auth.getSession();
    const token   = session?.data?.session?.access_token || SB_KEY;
    const res = await fetch(
      `${SB_URL}/rest/v1/merchant_menu_items?venue_id=eq.${_venueId}&order=category.asc,position.asc,name.asc&select=id,name,price_gbp,category,available,unavailable_since`,
      { headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + token } }
    );
    if (!res.ok) throw new Error('HTTP ' + res.status);
    _menuItems = await res.json();
    _renderMenuChips();
    _renderMenuOverlayList();
    _renderMenuOpsCard();
    _renderTopItemsToday();
    _renderUnavailableCard();
  } catch(e) {
    console.warn('[loadMenuItems]', e);
  }
}

function _groupByCategory(items) {
  const map = {};
  items.forEach(item => {
    const cat = item.category || 'Uncategorised';
    if (!map[cat]) map[cat] = [];
    map[cat].push(item);
  });
  return map;
}

// ── Chip panel (queue view) ───────────────────────────────────────────────────

function _renderMenuChips() {
  const panel = document.getElementById('menu-chip-panel');
  if (!panel) return;
  if (!_menuItems.length) {
    panel.innerHTML = '<div class="menu-chip-empty">No menu items — add via Owner → Menu</div>';
    return;
  }
  const grouped = _groupByCategory(_menuItems);
  let html = '';
  Object.entries(grouped).forEach(([cat, items]) => {
    html += `<div class="menu-chip-cat">
      <span class="menu-chip-cat-label">${cat}</span>
      <div class="menu-chip-row">`;
    items.forEach(item => {
      const off = !item.available;
      html += `<div class="menu-chip${off ? ' menu-chip--off' : ''}">
        <span class="menu-chip-dot${off ? ' menu-chip-dot--off' : ''}"></span>
        <span class="menu-chip-name">${item.name}</span>
        <span class="menu-chip-price">£${parseFloat(item.price_gbp).toFixed(2)}</span>
      </div>`;
    });
    html += '</div></div>';
  });
  panel.innerHTML = html;
}

function toggleMenuPanel() {
  _menuExpanded = !_menuExpanded;
  const panel = document.getElementById('menu-chip-panel');
  const btn   = document.getElementById('menu-toggle-btn');
  if (panel) panel.classList.toggle('menu-chip-panel--open', _menuExpanded);
  if (btn)   btn.textContent = _menuExpanded ? 'MENU ▴' : 'MENU ▾';
}

// ── Ops card ─────────────────────────────────────────────────────────────────

function _renderMenuOpsCard() {
  const card = document.getElementById('ops-card-menu');
  if (!card) return;
  const total   = _menuItems.length;
  const cats    = new Set(_menuItems.map(i => i.category || 'Uncategorised')).size;
  const unavail = _menuItems.filter(i => !i.available).length;
  if (total === 0) {
    card.innerHTML = `
      <div class="ops-card-label">Menu</div>
      <div class="ops-card-content">
        <div class="ops-menu-empty">No items yet</div>
        <button class="ops-menu-manage-btn" onclick="openMenuOverlay()">Add Menu ↗</button>
      </div>`;
  } else {
    card.innerHTML = `
      <div class="ops-card-label">Menu</div>
      <div class="ops-card-content">
        <div class="ops-menu-count">${total} item${total !== 1 ? 's' : ''}</div>
        <div class="ops-menu-meta">${cats} categor${cats !== 1 ? 'ies' : 'y'}${unavail > 0 ? ` · <span class="ops-menu-unavail">${unavail} unavailable</span>` : ''}</div>
        <button class="ops-menu-manage-btn" onclick="openMenuOverlay()">Manage ↗</button>
      </div>`;
  }
  card.classList.remove('ops-card-placeholder');
}

// ── Menu overlay ──────────────────────────────────────────────────────────────

function openMenuOverlay() {
  const overlay = document.getElementById('menu-overlay');
  if (overlay) overlay.classList.add('open');
  _renderMenuOverlayList();
  _renderTopItemsToday();
  _renderUnavailableCard();
  _renderLastImportCard();
}

function closeMenuOverlay() {
  const overlay = document.getElementById('menu-overlay');
  if (overlay) overlay.classList.remove('open');
}

function _renderMenuOverlayList() {
  const list = document.getElementById('menu-overlay-list');
  if (!list) return;
  if (!_menuItems.length) {
    list.innerHTML = '<div class="menu-overlay-empty">Upload a CSV to add items</div>';
    return;
  }
  const grouped = _groupByCategory(_menuItems);
  let html = '';
  Object.entries(grouped).forEach(([cat, items]) => {
    html += `<div class="mo-cat-label">${cat}</div>`;
    items.forEach(item => {
      const on = item.available;
      html += `<div class="mo-item-row">
        <div class="mo-item-left">
          <span class="mo-item-name">${item.name}</span>
          <span class="mo-item-price">£${parseFloat(item.price_gbp).toFixed(2)}</span>
        </div>
        <label class="owner-toggle" aria-label="${on ? 'Mark unavailable' : 'Mark available'}">
          <input type="checkbox" ${on ? 'checked' : ''} onchange="toggleItemAvailable('${item.id}', this.checked)">
          <span class="owner-toggle-track"></span>
        </label>
      </div>`;
    });
  });
  list.innerHTML = html;
}

// ── Right panel cards ─────────────────────────────────────────────────────────

async function _renderTopItemsToday() {
  const card = document.getElementById('menu-card-top-items');
  if (!card) return;
  if (!_venueId) return;
  try {
    const session = await getSbClient().auth.getSession();
    const token   = session?.data?.session?.access_token || SB_KEY;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const res = await fetch(
      `${SB_URL}/rest/v1/merchant_orders?venue_id=eq.${_venueId}&created_at=gte.${todayStart.toISOString()}&payment_status=eq.paid&select=item_name`,
      { headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + token } }
    );
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const rows = await res.json();
    if (!rows.length) {
      card.innerHTML = '<div class="mc-eyebrow">Top items today</div><div class="mc-empty">No paid orders yet today</div>';
      return;
    }
    const counts = {};
    rows.forEach(r => {
      const name = (r.item_name || 'Unknown').trim();
      counts[name] = (counts[name] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 4);
    const max    = sorted[0][1];
    let html = '<div class="mc-eyebrow">Top items today</div>';
    sorted.forEach(([name, count]) => {
      const pct = Math.round((count / max) * 100);
      html += `<div class="mc-top-row">
        <span class="mc-top-name">${name}</span>
        <div class="mc-top-bar-wrap"><div class="mc-top-bar" style="width:${pct}%"></div></div>
        <span class="mc-top-count">${count}</span>
      </div>`;
    });
    card.innerHTML = html;
  } catch(e) {
    console.warn('[_renderTopItemsToday]', e);
  }
}

function _renderUnavailableCard() {
  const card = document.getElementById('menu-card-unavailable');
  if (!card) return;
  const unavail = _menuItems.filter(i => !i.available);
  let html = '<div class="mc-eyebrow">Currently unavailable</div>';
  if (!unavail.length) {
    html += '<div class="mc-empty">All items available</div>';
  } else {
    unavail.forEach(item => {
      let since = '';
      if (item.unavailable_since) {
        const d = new Date(item.unavailable_since);
        since = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      }
      html += `<div class="mc-unavail-row">
        <span class="mc-unavail-dot"></span>
        <span class="mc-unavail-name">${item.name}</span>
        <span class="mc-unavail-since">${since ? 'since ' + since : ''}</span>
      </div>`;
    });
  }
  card.innerHTML = html;
}

function _renderLastImportCard() {
  const card = document.getElementById('menu-card-last-import');
  if (!card) return;
  const key  = `menu_last_import_${_venueId}`;
  const data = JSON.parse(localStorage.getItem(key) || 'null');
  let html = '<div class="mc-eyebrow">Last import</div>';
  if (!data) {
    html += '<div class="mc-empty">No import recorded</div>';
  } else {
    const d     = new Date(data.ts);
    const label = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    html += `
      <div class="mc-import-row"><span class="mc-import-label">Date</span><span class="mc-import-val">${label}</span></div>
      <div class="mc-import-row"><span class="mc-import-label">Items loaded</span><span class="mc-import-val">${data.count}</span></div>
      <div class="mc-import-row"><span class="mc-import-label">Categories</span><span class="mc-import-val">${data.cats}</span></div>
      <div class="mc-import-row"><span class="mc-import-label">Unavailable</span><span class="mc-import-val${data.unavail > 0 ? ' mc-import-val--warn' : ''}">${data.unavail}</span></div>`;
  }
  card.innerHTML = html;
}

// ── CSV import ────────────────────────────────────────────────────────────────

function triggerMenuFileInput() {
  const input = document.getElementById('menu-csv-input');
  if (input) input.click();
}

async function handleMenuCSV(input) {
  const file = input.files[0];
  if (!file) return;
  const statusEl = document.getElementById('menu-import-status');
  if (statusEl) { statusEl.textContent = 'Parsing…'; statusEl.className = 'menu-import-status'; }

  const text  = await file.text();
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) {
    if (statusEl) { statusEl.textContent = 'CSV must have a header row and at least one item.'; statusEl.className = 'menu-import-status menu-import-status--err'; }
    input.value = '';
    return;
  }

  const headers  = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/^"|"$/g, ''));
  const nameIdx  = headers.indexOf('name');
  const priceIdx = headers.indexOf('price_gbp');
  const catIdx   = headers.indexOf('category');
  const descIdx  = headers.indexOf('description');

  if (nameIdx === -1 || priceIdx === -1 || catIdx === -1) {
    if (statusEl) { statusEl.textContent = 'CSV must include columns: name, price_gbp, category'; statusEl.className = 'menu-import-status menu-import-status--err'; }
    input.value = '';
    return;
  }

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols  = _parseCSVLine(lines[i]);
    const name  = (cols[nameIdx]  || '').replace(/^"|"$/g, '').trim();
    const price = parseFloat((cols[priceIdx] || '').replace(/^"|"$/g, '').trim());
    const cat   = (cols[catIdx]   || '').replace(/^"|"$/g, '').trim();
    const desc  = descIdx >= 0 ? (cols[descIdx] || '').replace(/^"|"$/g, '').trim() : '';
    if (!name || isNaN(price)) continue;
    rows.push({ venue_id: _venueId, name, description: desc || null, price_gbp: price, category: cat, position: i - 1 });
  }

  if (!rows.length) {
    if (statusEl) { statusEl.textContent = 'No valid rows found. Check name and price_gbp columns.'; statusEl.className = 'menu-import-status menu-import-status--err'; }
    input.value = '';
    return;
  }
  if (rows.length > 100) {
    if (statusEl) { statusEl.textContent = `Too many items (${rows.length}). Maximum 100 per import.`; statusEl.className = 'menu-import-status menu-import-status--err'; }
    input.value = '';
    return;
  }

  if (statusEl) statusEl.textContent = `Importing ${rows.length} items…`;

  try {
    const session = await getSbClient().auth.getSession();
    const token   = session?.data?.session?.access_token;
    if (!token) throw new Error('Not authenticated');

    const delRes = await fetch(
      `${SB_URL}/rest/v1/merchant_menu_items?venue_id=eq.${_venueId}`,
      { method: 'DELETE', headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + token, 'Prefer': 'return=minimal' } }
    );
    if (!delRes.ok) throw new Error('Delete failed: HTTP ' + delRes.status);

    const insRes = await fetch(
      `${SB_URL}/rest/v1/merchant_menu_items`,
      {
        method: 'POST',
        headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
        body: JSON.stringify(rows)
      }
    );
    if (!insRes.ok) throw new Error('Insert failed: HTTP ' + insRes.status);

    const cats = new Set(rows.map(r => r.category)).size;
    localStorage.setItem(`menu_last_import_${_venueId}`, JSON.stringify({ ts: new Date().toISOString(), count: rows.length, cats, unavail: 0 }));

    if (statusEl) { statusEl.textContent = `${rows.length} items imported.`; statusEl.className = 'menu-import-status menu-import-status--ok'; }
    showToast(`Menu updated — ${rows.length} items`, 'ok');
    await loadMenuItems();
    _renderLastImportCard();
  } catch(e) {
    console.error('[handleMenuCSV]', e);
    if (statusEl) { statusEl.textContent = 'Import failed: ' + e.message; statusEl.className = 'menu-import-status menu-import-status--err'; }
    showToast('Menu import failed', 'err');
  }
  input.value = '';
}

function _parseCSVLine(line) {
  const result = [];
  let cur = '', inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"')              { inQuote = !inQuote; }
    else if (ch === ',' && !inQuote) { result.push(cur); cur = ''; }
    else                         { cur += ch; }
  }
  result.push(cur);
  return result;
}

// ── Toggle item available — immediate save ────────────────────────────────────

async function toggleItemAvailable(id, available) {
  if (!_venueId) return;
  try {
    const session = await getSbClient().auth.getSession();
    const token   = session?.data?.session?.access_token;
    if (!token) throw new Error('Not authenticated');
    const res = await fetch(
      `${SB_URL}/rest/v1/merchant_menu_items?id=eq.${id}`,
      {
        method: 'PATCH',
        headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
        body: JSON.stringify({ available })
      }
    );
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const item = _menuItems.find(i => i.id === id);
    if (item) {
      item.available        = available;
      item.unavailable_since = available ? null : new Date().toISOString();
    }
    _renderMenuChips();
    _renderUnavailableCard();
    const key  = `menu_last_import_${_venueId}`;
    const data = JSON.parse(localStorage.getItem(key) || 'null');
    if (data) {
      data.unavail = _menuItems.filter(i => !i.available).length;
      localStorage.setItem(key, JSON.stringify(data));
      _renderLastImportCard();
    }
    _renderMenuOpsCard();
  } catch(e) {
    console.warn('[toggleItemAvailable]', e);
    showToast('Update failed', 'err');
    await loadMenuItems();
  }
}
