// ─── CONSTANTS ─────────────────────────────────────────────
const SB_URL = 'https://tihgvdokeofnjxjkenmm.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpaGd2ZG9rZW9mbmp4amtlbm1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MTY2NDksImV4cCI6MjA5NDE5MjY0OX0.cRb94WeIP8yRfWd9s2XKmq2nqm1ov-sK1df6u8LNUbo';
const POLL_INTERVAL_MS  = 15000;
const DARWIN_INTERVAL_MS = 15000;

// ─── STATE ─────────────────────────────────────────────────
let _sbClient    = null;
let _currentUser = null;
let _venueId     = null;
let _venueName   = null;
let _venueData   = null;
let _orders      = [];
let _orderPollTimer  = null;
let _darwinTimer     = null;
let _venueMap        = null;
let _lastPollTime    = null;
let _userRole        = null;
let _currentView     = 'queue'; // 'queue' | 'ops'
let _staffPinHash    = null;    // bcrypt/sha256 hash stored in merchant_users.staff_pin_hash
let _ownerPinHash    = null;    // bcrypt/sha256 hash stored in merchant_users.owner_pin_hash
let _staffPinBuffer  = '';      // current tap buffer (plain, never stored)
let _ownerPinBuffer  = '';
let _darwinRowsCache = [];      // last Darwin poll result — read by updateHorizonBand()

// ─── PIN HASHING (SHA-256, browser native) ─────────────────
async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ─── THEME ─────────────────────────────────────────────────
function setTheme(t) {
  document.documentElement.setAttribute('data-theme', t === 'carbon' ? 'carbon' : '');
  localStorage.setItem('rfTheme', t);
  document.getElementById('pill-paper').classList.toggle('active', t === 'paper');
  document.getElementById('pill-carbon').classList.toggle('active', t === 'carbon');
  if (_venueMap) {
    _venueMap.setStyle(t === 'carbon'
      ? 'mapbox://styles/mapbox/dark-v11'
      : 'mapbox://styles/mapbox/light-v11');
  }
}
(function initTheme() {
  const t = localStorage.getItem('rfTheme') || 'paper';
  document.documentElement.setAttribute('data-theme', t === 'carbon' ? 'carbon' : '');
  document.getElementById('pill-paper').classList.toggle('active', t === 'paper');
  document.getElementById('pill-carbon').classList.toggle('active', t === 'carbon');
})();

// ─── SUPABASE CLIENT ────────────────────────────────────────
function getSbClient() {
  if (_sbClient) return _sbClient;
  try { _sbClient = supabase.createClient(SB_URL, SB_KEY); } catch(e) {}
  return _sbClient;
}

// ─── TOAST ─────────────────────────────────────────────────
let _toastTimer = null;
function showToast(msg, type = '') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast show' + (type ? ' ' + type : '');
  if (_toastTimer) clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
}

// ─── GATE ROUTING ───────────────────────────────────────────
// Called on boot and after magic link auth.
// If we have a Supabase session → resolve venue/pins, then show PIN gate.
// If no session → show magic link gate.
async function routeGate() {
  const client = getSbClient();
  const { data } = await client.auth.getSession();
  if (data?.session) {
    _currentUser = data.session.user;
    await resolveVenueAndPins(_currentUser);
    showPinGate();
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
  const errEl = document.getElementById('pin-error');
  errEl.classList.remove('show');
  const gate = document.getElementById('pin-gate');
  gate.style.display = '';
  setTimeout(() => gate.classList.add('visible'), 30);
}

function hidePinGate() {
  const gate = document.getElementById('pin-gate');
  gate.classList.remove('visible');
  setTimeout(() => { gate.style.display = 'none'; }, 350);
}

// ─── STAFF PIN PAD ──────────────────────────────────────────
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
  if (_staffPinBuffer.length === 4) {
    verifyStaffPin(_staffPinBuffer);
  }
}

async function verifyStaffPin(pin) {
  const hash = await sha256(pin);
  if (_staffPinHash && hash === _staffPinHash) {
    // Correct — unlock
    hidePinGate();
    onStaffAuthenticated();
  } else {
    // Wrong
    _staffPinBuffer = '';
    updatePinDots('pin-dots', 'pd', 0);
    const dotsEl = document.getElementById('pin-dots');
    dotsEl.classList.add('shake');
    setTimeout(() => dotsEl.classList.remove('shake'), 450);
    const errEl = document.getElementById('pin-error');
    errEl.classList.add('show');
    setTimeout(() => errEl.classList.remove('show'), 2000);
  }
}

// Called when staff PIN is accepted
function onStaffAuthenticated() {
  renderAuthNav(_currentUser);
  showSignedInState();
  startOrderPoll();
  if (!_darwinTimer) {
    _darwinTimer = setInterval(pollDarwin, DARWIN_INTERVAL_MS);
    pollDarwin();
  }
}

// ─── OWNER AFFORDANCE & PIN ─────────────────────────────────
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
  if (_ownerPinBuffer.length === 4) {
    verifyOwnerPin(_ownerPinBuffer);
  }
}

async function verifyOwnerPin(pin) {
  const hash = await sha256(pin);
  if (_ownerPinHash && hash === _ownerPinHash) {
    closeOwnerOverlay();
    openOwnerPanel();
  } else {
    _ownerPinBuffer = '';
    updatePinDots('owner-pin-dots', 'opd', 0);
    const dotsEl = document.getElementById('owner-pin-dots');
    dotsEl.classList.add('shake');
    setTimeout(() => dotsEl.classList.remove('shake'), 450);
    document.getElementById('owner-pin-error').classList.add('show');
    setTimeout(() => document.getElementById('owner-pin-error').classList.remove('show'), 2000);
  }
}

async function openOwnerPanel() {
  // Populate stats
  await loadOwnerStats();
  // Venue badge
  const badge = document.getElementById('owner-venue-badge');
  if (badge && _venueName) badge.textContent = _venueName.toUpperCase();
  document.getElementById('owner-panel').classList.add('open');
}

function closeOwnerPanel() {
  document.getElementById('owner-panel').classList.remove('open');
  refreshOrders(); // refresh queue on return
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
  } catch(e) {
    console.warn('loadOwnerStats error:', e);
  }
}

async function ownerSignOut() {
  const client = getSbClient();
  if (client) await client.auth.signOut();
  // Full reset — redirect to Command Centre
  window.location.href = 'command-centre.html';
}

// ─── MAGIC LINK (owner gate) ─────────────────────────────────
async function sendGateMagicLink() {
  const email = document.getElementById('gate-email').value.trim();
  if (!email || !email.includes('@')) { showToast('Enter a valid email', 'err'); return; }
  const client = getSbClient();
  const btn = document.getElementById('gate-btn');
  btn.textContent = 'Sending…'; btn.disabled = true;
  try {
    // emailRedirectTo must resolve to a valid https:// URL that exactly matches
    // an entry in Supabase Auth → URL Configuration → Redirect URLs.
    // When opened as a local file, window.location.origin is 'null' or 'file://'
    // — Supabase rejects both and silently falls back to Site URL (the homepage).
    // Always hard-fall to the production URL when not running on https.
    const redirectTo = window.location.origin.startsWith('https://')
      ? window.location.origin + '/merchant-tablet.html'
      : 'https://refueler.io/merchant-tablet.html';
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

// ─── SIGN OUT (from nav / OPS panel) ─────────────────────────
// Full sign-out → back to Command Centre
async function signOut() {
  const client = getSbClient();
  if (client) await client.auth.signOut();
  window.location.href = 'command-centre.html';
}

// ─── AUTH NAV ────────────────────────────────────────────────
function renderAuthNav(user) {
  const slot = document.getElementById('nav-auth-slot');
  const badgeSlot = document.getElementById('venue-badge-slot');
  if (user) {
    const name = user.user_metadata?.display_name || user.email.split('@')[0];
    if (_userRole === 'independent_owner') {
      const viewLabel = _currentView === 'ops' ? 'OPS' : 'QUEUE';
      slot.innerHTML = `
        <div class="role-chip" id="role-chip" onclick="openViewConfirm()" title="Tap to switch view">
          <span class="role-chip-label">${name.toUpperCase()}</span>
          <span style="font-family:var(--mono);font-size:9px;color:var(--border);">|</span>
          <span class="role-chip-view">${viewLabel}</span>
        </div>`;
    } else {
      slot.innerHTML = `
        <div class="nav-auth-chip" onclick="signOut()" title="Click to sign out">
          <span class="nav-auth-name">${name.toUpperCase()}</span>
          <span class="nav-auth-logout">SIGN OUT</span>
        </div>`;
    }
    if (_venueName) {
      badgeSlot.innerHTML = `<div class="venue-badge">${_venueName.toUpperCase()}</div>`;
    }
  } else {
    slot.innerHTML = '';
    badgeSlot.innerHTML = '';
  }
}

// ─── VENUE RESOLUTION & PIN LOADING ─────────────────────────
// Resolution path (locked §4g / CC-06):
//   auth.users (session user.id) → merchant_users.user_id → merchant_users.venue_id → venue_partners
// Direct venue_partners.contact_email lookup is DEPRECATED — do not restore.
async function resolveVenueAndPins(user) {
  if (!user?.id) {
    console.error('[resolveVenueAndPins] No authenticated user id — cannot resolve venue');
    return;
  }
  try {
    // Step 1: look up merchant_users by user_id (auth.users UUID), not email
    const res = await fetch(
      `${SB_URL}/rest/v1/merchant_users?user_id=eq.${encodeURIComponent(user.id)}&select=venue_id,role,staff_pin_hash,owner_pin_hash&limit=1`,
      { headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY } }
    );
    if (!res.ok) {
      console.error('[resolveVenueAndPins] merchant_users fetch failed — HTTP', res.status);
      return;
    }
    const rows = await res.json();
    if (!rows || rows.length === 0) {
      console.error('[resolveVenueAndPins] No merchant_users row found for user_id:', user.id);
      return;
    }
    // Step 2: populate module state from merchant_users row
    _venueId      = rows[0].venue_id   || null;
    _userRole     = rows[0].role       || null;
    _staffPinHash = rows[0].staff_pin_hash || null;
    _ownerPinHash = rows[0].owner_pin_hash || null;

    if (!_venueId) {
      console.error('[resolveVenueAndPins] merchant_users row has no venue_id for user_id:', user.id);
      return;
    }
    // Step 3: fetch full venue_partners row via venue_id
    await loadVenueDetails(_venueId);
  } catch(e) {
    console.error('[resolveVenueAndPins] Unexpected error:', e);
  }
}

async function loadVenueDetails(venueId) {
  if (!venueId) return;
  try {
    // Include brand_primary + brand_secondary for ETA widget accent colours
    const res = await fetch(
      `${SB_URL}/rest/v1/venue_partners?id=eq.${venueId}&select=id,name,address,lat,lng,active,brand_primary,brand_secondary,venue_type,franchise_group_id&limit=1`,
      { headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY } }
    );
    if (!res.ok) {
      console.error('[loadVenueDetails] venue_partners fetch failed — HTTP', res.status);
      return;
    }
    const rows = await res.json();
    if (rows && rows.length > 0) {
      _venueName = rows[0].name;
      _venueData = rows[0];
      renderVenueCard(rows[0]);
    }
  } catch(e) { console.warn('[loadVenueDetails] error:', e); }
}

function renderVenueCard(venue) {
  document.getElementById('site-name').textContent = venue.name || '—';
  document.getElementById('site-address').textContent = venue.address || '—';
  const dot   = document.getElementById('site-status-dot');
  const label = document.getElementById('site-status-label');
  if (venue.active) {
    dot.className = 'site-status-dot';
    label.textContent = 'Open — accepting orders';
    label.style.color = 'var(--c-green)';
  } else {
    dot.className = 'site-status-dot closed';
    label.textContent = 'Closed';
    label.style.color = 'var(--c-red)';
  }
  const badgeSlot = document.getElementById('venue-badge-slot');
  badgeSlot.innerHTML = `<div class="venue-badge">${venue.name.toUpperCase()}</div>`;
  if (venue.lat && venue.lng) initVenueMap(venue.lng, venue.lat, venue.name);
}

// ─── VENUE MAP ───────────────────────────────────────────────
function initVenueMap(lng, lat, name) {
  const theme = document.documentElement.getAttribute('data-theme') === 'carbon'
    ? 'mapbox://styles/mapbox/dark-v11'
    : 'mapbox://styles/mapbox/light-v11';
  if (typeof mapboxgl === 'undefined') return;
  _venueMap = new mapboxgl.Map({
    container: 'venue-map',
    style: theme,
    center: [lng, lat],
    zoom: 16,
    interactive: false,
    attributionControl: false
  });
  _venueMap.on('load', () => {
    new mapboxgl.Marker({ color: '#C8A96E' })
      .setLngLat([lng, lat])
      .setPopup(new mapboxgl.Popup({ offset: 10 }).setHTML(`<strong>${name}</strong>`))
      .addTo(_venueMap);
  });
}

// ─── ORDER QUEUE ─────────────────────────────────────────────
function minutesAgo(isoString) {
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 60000);
  if (diff < 1) return 'just now';
  if (diff === 1) return '1 min ago';
  return diff + ' mins ago';
}
function orderTimeClass(isoString) {
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 60000);
  if (diff >= 8) return 'urgent';
  if (diff >= 4) return 'warning';
  return 'normal';
}
function badgeForStatus(status, createdAt) {
  const diff = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
  if (status === 'ready') return ['badge-ready', 'READY'];
  if (diff >= 8) return ['badge-urgent', 'URGENT'];
  return ['badge-pending', 'PENDING'];
}

function renderOrderTile(order) {
  const tile = document.createElement('div');
  const diff = Math.floor((Date.now() - new Date(order.created_at).getTime()) / 60000);
  const isUrgent = diff >= 8 && order.status === 'pending';
  const isReady  = order.status === 'ready';
  const tileClass = isReady ? 'ready' : (isUrgent ? 'urgent' : 'pending');
  const [badgeClass, badgeText] = badgeForStatus(order.status, order.created_at);
  const timeClass = orderTimeClass(order.created_at);
  const ref      = '#' + (order.id || '').slice(0, 8).toUpperCase();
  const itemName = order.item_name || order.product_name || 'Order';
  const itemMods = order.modifiers || order.notes || '';
  tile.className = `order-tile ${tileClass}`;
  tile.id = 'order-' + order.id;
  tile.innerHTML = `
    <div class="order-tile-head">
      <div>
        <div class="order-item-name">${itemName}</div>
        ${itemMods ? `<div class="order-item-mods">${itemMods}</div>` : ''}
      </div>
      <div class="order-status-badge ${badgeClass}">${badgeText}</div>
    </div>
    <div class="order-meta">
      <div class="order-ref">${ref}</div>
      <div class="order-time ${timeClass}">${minutesAgo(order.created_at)}</div>
    </div>
    <div class="order-actions">
      ${isReady
        ? `<button class="btn-mark-ready already-ready" disabled>✓ READY FOR COLLECTION</button>`
        : `<button class="btn-mark-ready" onclick="markOrderReady('${order.id}', this)">✓ MARK READY</button>`
      }
      ${isReady ? `<button class="btn-dismiss" onclick="dismissOrder('${order.id}')">DISMISS</button>` : ''}
    </div>`;
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
    const rank = o => o.status === 'pending' ? 0 : 1;
    return rank(a) - rank(b);
  });
  sorted.forEach(order => queue.appendChild(renderOrderTile(order)));

  const pending = orders.filter(o => o.status === 'pending').length;
  const ready   = orders.filter(o => o.status === 'ready').length;
  updateQueueStats(pending, ready, null);
}

function updateQueueStats(pending, ready, today) {
  const els = {
    'qs-pending': pending, 'qs-ready': ready,
    'sb-pending-count': pending, 'sb-ready-count': ready
  };
  for (const [id, val] of Object.entries(els)) {
    const el = document.getElementById(id);
    if (el) el.textContent = val !== null ? val : '—';
  }
  if (today !== null) {
    ['qs-today','sb-today-count'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = today;
    });
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
      `${SB_URL}/rest/v1/orders?venue_id=eq.${_venueId}&status=in.(pending,ready)&order=created_at.asc&limit=50`,
      { headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + token } }
    );
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const orders = await res.json();
    _orders = orders;
    renderOrders(orders);

    const todayStart = new Date(); todayStart.setHours(0,0,0,0);
    const todayRes = await fetch(
      `${SB_URL}/rest/v1/orders?venue_id=eq.${_venueId}&created_at=gte.${todayStart.toISOString()}&select=id`,
      { headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + token } }
    );
    if (todayRes.ok) {
      const todayOrders = await todayRes.json();
      const pending = orders.filter(o => o.status === 'pending').length;
      const ready   = orders.filter(o => o.status === 'ready').length;
      updateQueueStats(pending, ready, todayOrders.length);
    }

    _lastPollTime = new Date();
    const timeStr = _lastPollTime.toLocaleTimeString('en-GB', { hour12: false });
    if (pollStatus) pollStatus.textContent = 'Polled ' + timeStr;
    const sbRefresh = document.getElementById('sb-last-refresh');
    if (sbRefresh) sbRefresh.textContent = timeStr;
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

// ─── MARK READY / DISMISS ─────────────────────────────────
async function markOrderReady(orderId, btn) {
  if (btn) { btn.disabled = true; btn.textContent = 'UPDATING…'; }
  try {
    const session = await getSbClient().auth.getSession();
    const token = session?.data?.session?.access_token || SB_KEY;
    const res = await fetch(`${SB_URL}/rest/v1/orders?id=eq.${orderId}`, {
      method: 'PATCH',
      headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + token,
                 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
      body: JSON.stringify({ status: 'ready', updated_at: new Date().toISOString() })
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const ref = '#' + orderId.slice(0, 8).toUpperCase();
    showToast('Order ' + ref + ' marked ready', 'ok');
    const tile = document.getElementById('order-' + orderId);
    if (tile) {
      tile.className = 'order-tile ready';
      const badge = tile.querySelector('.order-status-badge');
      if (badge) { badge.className = 'order-status-badge badge-ready'; badge.textContent = 'READY'; }
      const actions = tile.querySelector('.order-actions');
      if (actions) {
        actions.innerHTML = `
          <button class="btn-mark-ready already-ready" disabled>✓ READY FOR COLLECTION</button>
          <button class="btn-dismiss" onclick="dismissOrder('${orderId}')">DISMISS</button>`;
      }
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
    await fetch(`${SB_URL}/rest/v1/orders?id=eq.${orderId}`, {
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

// ─── SIGNED OUT / IN STATE ───────────────────────────────────
function showSignedOutState() {
  document.getElementById('queue-stats-strip').style.display = 'none';
  document.getElementById('card-queue-summary').style.display = 'none';
  document.getElementById('poll-dot').style.display = 'none';
  const queue = document.getElementById('order-queue');
  queue.querySelectorAll('.order-tile, .queue-empty').forEach(el => el.remove());
  const prompt = document.getElementById('queue-signin-prompt');
  if (prompt) prompt.style.display = '';
  document.getElementById('site-name').textContent = '—';
  document.getElementById('site-address').textContent = 'Waiting for owner sign-in…';
  document.getElementById('site-status-label').textContent = '—';
  document.getElementById('site-status-dot').className = 'site-status-dot';
  document.getElementById('owner-affordance').classList.remove('visible');
}

function showSignedInState() {
  document.getElementById('queue-stats-strip').style.display = '';
  document.getElementById('card-queue-summary').style.display = '';
  const prompt = document.getElementById('queue-signin-prompt');
  if (prompt) prompt.style.display = 'none';
  // Show owner affordance only for owner roles
  if (_userRole === 'independent_owner' || _userRole === 'merchant') {
    document.getElementById('owner-affordance').classList.add('visible');
  }
}

// ─── DARWIN FEED ─────────────────────────────────────────────
const DARWIN_STATION_LABELS = {
  'FST': 'Fenchurch Street', 'LIM': 'Limehouse', 'WHA': 'West Ham',
  'BFR': 'Barking', 'UPM': 'Upminster', 'SHO': 'Shoeburyness',
  'PFL': 'Pitsea', 'GRY': 'Grays'
};

async function pollDarwin() {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/rail_movement_log?select=crs,event_type,actual_timestamp,planned_timestamp,delay_minutes&order=actual_timestamp.desc&limit=6`,
      { headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY } }
    );
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const rows = await res.json();
    if (rows && rows.length > 0) {
      setDarwinConnected(true);
      renderDarwinRows(rows.slice(0, 3));
    } else {
      setDarwinConnected(false);
    }
  } catch(e) { setDarwinConnected(false); }
}

function setDarwinConnected(connected) {
  const dot  = document.getElementById('darwin-dot');
  const text = document.getElementById('darwin-status-text');
  if (connected) {
    dot.className = 'darwin-dot';
    text.textContent = 'Bridge connected · live movements';
  } else {
    dot.className = 'darwin-dot offline';
    text.textContent = 'Bridge offline';
  }
}

function renderDarwinRows(rows) {
  _darwinRowsCache = rows; // cache for updateHorizonBand()
  const container = document.getElementById('darwin-rows');
  container.innerHTML = '';
  rows.forEach(row => {
    const stationName = DARWIN_STATION_LABELS[row.crs] || row.crs;
    const ts = row.actual_timestamp ? new Date(row.actual_timestamp) : null;
    const timeStr = ts ? ts.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }) : '—';
    const delay = row.delay_minutes || 0;
    const div = document.createElement('div');
    div.className = 'darwin-row';
    div.innerHTML = `
      <div class="darwin-crs">${row.crs}</div>
      <div class="darwin-name">${stationName}</div>
      <div class="darwin-eta">${timeStr}</div>
      <div class="${delay <= 1 ? 'darwin-ontime' : 'darwin-late'}">${delay <= 1 ? 'ON TIME' : '+' + delay + 'm'}</div>`;
    container.appendChild(div);
  });
  if (rows.length > 0) {
    const next = rows[0];
    const ts = next.actual_timestamp ? new Date(next.actual_timestamp) : null;
    const timeStr = ts ? ts.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }) : '—';
    const nextEl = document.getElementById('qs-next-train');
    if (nextEl) nextEl.textContent = timeStr;
    const stEl = document.getElementById('qs-next-station');
    if (stEl) stEl.textContent = DARWIN_STATION_LABELS[next.crs] || next.crs;
  }
  updateHorizonBand(); // sync Horizon Strip from same data
}

// ─── HORIZON BAND UPDATE ──────────────────────────────────────
/**
 * updateHorizonBand()
 * Reads from _darwinRowsCache (populated by renderDarwinRows — no second Darwin poll).
 * Updates:
 *   - Darwin section: next train station name + ETA (primary window)
 *     Landscape: also shows second arrival (hb-station-secondary)
 *   - Horizon section: passenger count per arrival window (mock values until
 *     real aggregation is wired in a future session)
 *   - Active window highlight: gold accent on 0–3 min window if a train is
 *     within 3 minutes, otherwise highlights the soonest non-zero window.
 *   - Offline state: dims Darwin section if no data available.
 *
 * Mock passenger counts (realistic shape for beta):
 *   0–3 min:  12  (imminent — commuters already at platform)
 *   3–7 min:  34  (inbound — on train, preparing to disembark)
 *   7–15 min: 67  (horizon — still boarding or on earlier segments)
 */
function updateHorizonBand() {
  const rows = _darwinRowsCache;
  const darwinSection = document.getElementById('hb-darwin');
  const beckNode      = document.getElementById('hb-beck-node');
  const label         = document.getElementById('hb-darwin-label');

  if (!rows || rows.length === 0) {
    // Offline — dim Darwin section
    darwinSection.classList.add('hb-darwin-offline');
    document.getElementById('hb-station-name').textContent  = 'OFFLINE';
    document.getElementById('hb-station-eta').textContent   = '—';
    document.getElementById('hb-station-name-2').textContent = '—';
    document.getElementById('hb-station-eta-2').textContent  = '—';
    label.textContent = 'DARWIN · OFFLINE';
    // Default to no active window highlight when offline
    _horizonSetActiveWindow(null);
    return;
  }

  darwinSection.classList.remove('hb-darwin-offline');
  label.textContent = 'DARWIN · LIVE';

  // Primary window — next arrival (rows[0])
  const primary = rows[0];
  const primaryName = DARWIN_STATION_LABELS[primary.crs] || primary.crs;
  const primaryTs   = primary.actual_timestamp ? new Date(primary.actual_timestamp) : null;
  const primaryEta  = primaryTs
    ? primaryTs.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
    : '—';
  document.getElementById('hb-station-name').textContent = primaryName;
  document.getElementById('hb-station-eta').textContent  = primaryEta;

  // Secondary window — next-next arrival (rows[1]) — visible in landscape only
  if (rows.length > 1) {
    const secondary     = rows[1];
    const secondaryName = DARWIN_STATION_LABELS[secondary.crs] || secondary.crs;
    const secondaryTs   = secondary.actual_timestamp ? new Date(secondary.actual_timestamp) : null;
    const secondaryEta  = secondaryTs
      ? secondaryTs.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
      : '—';
    document.getElementById('hb-station-name-2').textContent = secondaryName;
    document.getElementById('hb-station-eta-2').textContent  = secondaryEta;
  }

  // ── Horizon passenger windows (mock values until real aggregation) ──
  // These values are intentionally realistic shape for the merchant's UX.
  // Real aggregation from Supabase / Darwin passenger counts wired in a future session.
  const mockCounts = { w0: 12, w3: 34, w7: 67 };
  document.getElementById('hb-count-0').textContent = mockCounts.w0;
  document.getElementById('hb-count-3').textContent = mockCounts.w3;
  document.getElementById('hb-count-7').textContent = mockCounts.w7;

  // ── Active window highlight logic ──
  // If primary arrival is within 3 minutes → highlight 0–3 window.
  // Otherwise → highlight 3–7 window (soonest meaningful horizon).
  // If no timestamp available → highlight 3–7 by default.
  let activeWindowId = 'hb-win-3'; // default: highlight 3–7
  if (primaryTs) {
    const nowMs   = Date.now();
    const etaMs   = primaryTs.getTime();
    const diffMin = (etaMs - nowMs) / 60000;
    if (diffMin >= 0 && diffMin <= 3) {
      activeWindowId = 'hb-win-0'; // imminent — light up 0–3
    } else if (diffMin > 3 && diffMin <= 7) {
      activeWindowId = 'hb-win-3'; // 3–7 window is next
    } else {
      activeWindowId = 'hb-win-7'; // longer horizon
    }
  }
  _horizonSetActiveWindow(activeWindowId);
}

/**
 * _horizonSetActiveWindow(id)
 * Applies/removes .hb-active on the three passenger window divs.
 * @param {string|null} id  — element id of the window to highlight, or null for none.
 */
function _horizonSetActiveWindow(id) {
  ['hb-win-0', 'hb-win-3', 'hb-win-7'].forEach(wid => {
    const el = document.getElementById(wid);
    if (el) el.classList.toggle('hb-active', wid === id);
  });
}

// ─── OPS / QUEUE VIEW SWITCHER (independent_owner) ───────────
let _pendingView = null;

function openViewConfirm() {
  if (_userRole !== 'independent_owner') return;
  _pendingView = _currentView === 'queue' ? 'ops' : 'queue';
  const title = document.getElementById('view-confirm-title');
  const sub   = document.getElementById('view-confirm-sub');
  if (_pendingView === 'ops') {
    title.textContent = 'Switch to OPS view?';
    sub.textContent   = 'Operational controls. Queue continues — use Back to Queue to return.';
  } else {
    title.textContent = 'Back to Queue view?';
    sub.textContent   = 'Returns to the live order queue.';
  }
  document.getElementById('view-confirm-overlay').classList.add('open');
}
function cancelViewSwitch() {
  _pendingView = null;
  document.getElementById('view-confirm-overlay').classList.remove('open');
}
function confirmViewSwitch() {
  document.getElementById('view-confirm-overlay').classList.remove('open');
  if (_pendingView === 'ops') switchToOpsView();
  else switchToQueueView();
  _pendingView = null;
}
function switchToOpsView() {
  _currentView = 'ops';
  document.getElementById('order-queue').style.display  = 'none';
  document.getElementById('queue-header').style.display = 'none';
  document.getElementById('ops-panel').classList.add('visible');
  document.getElementById('btn-back-queue').classList.add('visible');
  if (_venueData) {
    const t = document.getElementById('ops-toggle-open');
    if (t) t.checked = _venueData.active === true;
  }
  renderAuthNav(_currentUser);
}
function switchToQueueView() {
  _currentView = 'queue';
  document.getElementById('order-queue').style.display  = '';
  document.getElementById('queue-header').style.display = '';
  document.getElementById('ops-panel').classList.remove('visible');
  document.getElementById('btn-back-queue').classList.remove('visible');
  renderAuthNav(_currentUser);
  refreshOrders();
}

// ─── OPS TOGGLE HANDLERS ─────────────────────────────────────
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
    showToast(checked ? 'Venue open — accepting orders' : 'Venue closed', checked ? 'ok' : 'warn');
    const dot = document.getElementById('site-status-dot');
    const label = document.getElementById('site-status-label');
    if (dot) dot.className = 'site-status-dot' + (checked ? '' : ' closed');
    if (label) { label.textContent = checked ? 'Open — accepting orders' : 'Closed'; label.style.color = checked ? 'var(--c-green)' : 'var(--c-red)'; }
  } catch(e) {
    showToast('Update failed: ' + e.message, 'err');
    const t = document.getElementById('ops-toggle-open');
    if (t) t.checked = !checked;
  }
}
async function opsTogglePreorder(checked) {
  showToast(checked ? 'Pre-orders only mode on' : 'Pre-orders only mode off', 'ok');
}
async function opsTogglePause(checked) {
  showToast(checked ? 'New orders paused' : 'Accepting new orders', checked ? 'warn' : 'ok');
}

// ─── INIT AUTH ───────────────────────────────────────────────
async function initAuth() {
  const client = getSbClient();
  if (!client) return;

  // Handle PKCE code= callback
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  if (code) {
    try {
      await client.auth.exchangeCodeForSession(code);
      history.replaceState({}, '', window.location.pathname);
    } catch(e) { console.warn('PKCE exchange error:', e); }
  }

  // Auth state change: owner magic link arriving
  client.auth.onAuthStateChange(async (event, session) => {
    if (session) {
      _currentUser = session.user;
      // Owner just clicked magic link — resolve venue + pins, then show PIN gate
      await resolveVenueAndPins(_currentUser);
      hideMagicLinkGate();
      showPinGate();
    }
  });

  // Boot routing
  await routeGate();
}

// ─── MAPBOX TOKEN ─────────────────────────────────────────
mapboxgl.accessToken = 'pk.eyJ1IjoicmFqZXNodGF5bG9yIiwiYSI6ImNtcDM3cXZhZjA2anYycHNnNWRsZDQ2MHAifQ.ZSJ06D0jSp-YwwN-IqPtTg';

// ─── BOOT ─────────────────────────────────────────────────
initAuth();
