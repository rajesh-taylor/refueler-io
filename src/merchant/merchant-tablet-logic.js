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
  if (!_darwinTimer) {
    _darwinTimer = setInterval(pollDarwin, DARWIN_INTERVAL_MS);
    pollDarwin();
  }
  maybeShowFirstLogin();
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
  } catch(e) { console.warn('loadOwnerStats error:', e); }
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
  document.getElementById('btn-back-queue').classList.add('visible');
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
  _currentView = 'queue';
  document.getElementById('order-queue').style.display  = '';
  document.getElementById('queue-header').style.display = '';
  document.getElementById('ops-panel').classList.remove('visible');
  document.getElementById('btn-back-queue').classList.remove('visible');
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
