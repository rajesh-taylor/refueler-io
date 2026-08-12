// ─── CONSTANTS ─────────────────────────────────────────────
const SB_URL = 'https://tihgvdokeofnjxjkenmm.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpaGd2ZG9rZW9mbmp4amtlbm1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MTY2NDksImV4cCI6MjA5NDE5MjY0OX0.cRb94WeIP8yRfWd9s2XKmq2nqm1ov-sK1df6u8LNUbo';
const POLL_INTERVAL_MS   = 15000;
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
let _staffPinHash    = null;
let _ownerPinHash    = null;
let _staffPinBuffer  = '';
let _ownerPinBuffer  = '';
let _darwinRowsCache = [];
let _staffAuthenticated = false;

// ─── PIN HASHING (SHA-256, browser native) ─────────────────
async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ─── THEME ─────────────────────────────────────────────────
// Terminal uses localStorage/rfTheme — this is the app/terminal surface, not public web.
// rs-theme cookie governs public web; rfTheme governs terminal per-shift preference.
function setTheme(t) {
  document.documentElement.setAttribute('data-theme', t === 'carbon' ? 'carbon' : '');
  localStorage.setItem('rfTheme', t);
  // Sync all theme pill instances (main nav + owner panel)
  ['pill-paper', 'owner-pill-paper'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('active', t === 'paper');
  });
  ['pill-carbon', 'owner-pill-carbon'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('active', t === 'carbon');
  });
  if (_venueMap) {
    _venueMap.setStyle(t === 'carbon'
      ? 'mapbox://styles/mapbox/dark-v11'
      : 'mapbox://styles/mapbox/light-v11');
  }
}
(function initTheme() {
  const t = localStorage.getItem('rfTheme') || 'paper';
  document.documentElement.setAttribute('data-theme', t === 'carbon' ? 'carbon' : '');
  ['pill-paper'].forEach(id => { const el = document.getElementById(id); if (el) el.classList.toggle('active', t === 'paper'); });
  ['pill-carbon'].forEach(id => { const el = document.getElementById(id); if (el) el.classList.toggle('active', t === 'carbon'); });
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
  if (_staffPinBuffer.length === 4) verifyStaffPin(_staffPinBuffer);
}

async function verifyStaffPin(pin) {
  const hash = await sha256(pin);
  if (_staffPinHash && hash === _staffPinHash) {
    _staffAuthenticated = true;
    hidePinGate();
    onStaffAuthenticated();
  } else {
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
}

// ─── OWNER OVERLAY & PIN ─────────────────────────────────────
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
  await loadOwnerStats();
  const badge = document.getElementById('owner-venue-badge');
  if (badge && _venueName) badge.textContent = _venueName.toUpperCase();
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

// ─── MAGIC LINK (owner gate) ─────────────────────────────────
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

// ─── SIGN OUT ────────────────────────────────────────────────
async function signOut() {
  _staffAuthenticated = false;
  document.getElementById('tablet-ui').style.display = 'none';
  const client = getSbClient();
  if (client) await client.auth.signOut();
  window.location.href = '/command-centre/';
}
async function opsSignOut() { await signOut(); }

// ─── NAV — MERGED PILL & IDENTITY BLOCK ──────────────────────
// CC-83b: replaces role-chip + venue-badge-slot pattern.
//
// Identity block (nav-left):
//   No logo_url → Refueler wordmark (existing .nav-logo) + divider + "MERCHANT TERMINAL"
//   logo_url    → 32×32 img + divider + "MERCHANT TERMINAL"
//
// Merged pill (nav-right, before theme pill):
//   All roles:              QUEUE segment visible
//   independent_owner only: QUEUE + OPS + OWNER segments visible
//   Active segment highlighted. QUEUE/OPS → direct view switch. OWNER → PIN overlay.
//
// No confirmation overlay needed — segmented control is self-explanatory.

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
    // Plain staff — single QUEUE segment (pill stays visually present but minimal)
    pillEl.innerHTML = `
      <button class="mp-seg mp-queue mp-active" id="mp-queue">QUEUE</button>`;
    pillEl.style.display = '';
  }
}

function pillQueue() {
  if (_currentView === 'queue') return;
  switchToQueueView();
}
function pillOps() {
  if (_currentView === 'ops') return;
  switchToOpsView();
}

function updateMergedPillActive() {
  const q = document.getElementById('mp-queue');
  const o = document.getElementById('mp-ops');
  if (q) q.classList.toggle('mp-active', _currentView === 'queue');
  if (o) o.classList.toggle('mp-active', _currentView === 'ops');
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
    const { data: sessionData } = await getSbClient().auth.getSession();
    const token = sessionData?.session?.access_token;
    if (!token) {
      console.error('[resolveVenueAndPins] No active session token — cannot proceed with RLS');
      return;
    }
    // Step 1: merchant_users by user_id (UUID), not email
    const res = await fetch(
      `${SB_URL}/rest/v1/merchant_users?user_id=eq.${encodeURIComponent(user.id)}&select=venue_id,role,staff_pin_hash,owner_pin_hash&limit=1`,
      { headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + token } }
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
    _venueId      = rows[0].venue_id        || null;
    _userRole     = rows[0].role            || null;
    _staffPinHash = rows[0].staff_pin_hash  || null;
    _ownerPinHash = rows[0].owner_pin_hash  || null;

    if (!_venueId) {
      console.error('[resolveVenueAndPins] merchant_users row has no venue_id for user_id:', user.id);
      return;
    }
    // Step 2: venue_partners via venue_id
    await loadVenueDetails(_venueId);
  } catch(e) {
    console.error('[resolveVenueAndPins] Unexpected error:', e);
  }
}

async function loadVenueDetails(venueId) {
  if (!venueId) return;
  try {
    const { data: sessionData } = await getSbClient().auth.getSession();
    const token = sessionData?.session?.access_token;
    // S-2 fix (CC-83b): use correct column names — address_line1, coords_lat, coords_lng.
    // logo_url added in CC-83b Migration 1.
    // Never fall back to anon SB_KEY here — partners_public_read is dropped; anon returns empty.
    if (!token) {
      console.error('[loadVenueDetails] No session token — cannot fetch venue with RLS');
      return;
    }
    const res = await fetch(
      `${SB_URL}/rest/v1/venue_partners?id=eq.${venueId}&select=id,name,address_line1,coords_lat,coords_lng,active,brand_primary,brand_secondary,venue_type,franchise_group_id,logo_url&limit=1`,
      { headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + token } }
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
      renderNavIdentity();
    }
  } catch(e) { console.warn('[loadVenueDetails] error:', e); }
}

function renderVenueCard(venue) {
  document.getElementById('site-name').textContent    = venue.name        || '—';
  document.getElementById('site-address').textContent = venue.address_line1 || '—';
  const dot   = document.getElementById('site-status-dot');
  const label = document.getElementById('site-status-label');
  if (venue.active) {
    dot.className    = 'site-status-dot';
    label.textContent = 'Open — accepting orders';
    label.style.color = 'var(--c-green)';
  } else {
    dot.className    = 'site-status-dot closed';
    label.textContent = 'Closed';
    label.style.color = 'var(--c-red)';
  }
  // Map: only if coordinates are present (steakhouse has none until CC-84 onboarding)
  if (venue.coords_lat && venue.coords_lng) {
    initVenueMap(venue.coords_lng, venue.coords_lat, venue.name);
  }
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

// ─── TIME HELPERS ────────────────────────────────────────────
function minutesAgo(isoString) {
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 60000);
  if (diff < 1) return 'just now';
  if (diff === 1) return '1 min ago';
  return diff + ' mins ago';
}

// ─── ORDER TILE ──────────────────────────────────────────────
// CC-83 locked design:
//   - [ID] · [items] on one line: identifier IBM Plex Mono 15px, separator · gold, items DM Sans 14px
//   - Status badge: right side only (left colour bar removed — colour-blind concern, logged CC-83)
//   - Badge: IBM Plex Mono 10px, padding 6px 14px, border-radius 4px
//   - PENDING → gold · IN PREP → #7899D4 · READY → #3DCA7A
//   - Tile: background #26282C, border 0.5px solid #35373B, border-radius 7px, padding 12px 16px
//
// 8-minute URGENT rule retired for this iteration (logged for future):
//   When distance-to-venue data is available (merchant-configurable, varies by station/town),
//   urgency windows can be re-wired with per-merchant parameters. TfL data path noted for
//   tube-line expansion. The horizon strip urgency signal is the intended vehicle for this.

function badgeClassForStatus(status) {
  if (status === 'ready')   return ['badge-ready',   'READY'];
  if (status === 'in_prep') return ['badge-inprep',  'IN PREP'];
  return                           ['badge-pending',  'PENDING'];
}

function renderOrderTile(order) {
  const tile = document.createElement('div');
  const isReady  = order.status === 'ready';
  const isInPrep = order.status === 'in_prep';
  const [badgeClass, badgeText] = badgeClassForStatus(order.status);

  // Identifier: app ref, table number, or staff-assigned text
  const identifier = order.identifier || ('#' + (order.id || '').slice(0, 6).toUpperCase());
  const itemName   = order.item_name  || order.product_name || 'Order';
  const itemMods   = order.modifiers  || order.notes        || '';

  tile.className = 'order-tile';
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

  // Sort: pending/in_prep first, ready last
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
    // CC-20: merchants read from merchant_orders only — never the orders table directly
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
    // CC-20: write status to merchant_orders — never orders directly
    const res = await fetch(`${SB_URL}/rest/v1/merchant_orders?id=eq.${orderId}`, {
      method: 'PATCH',
      headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + token,
                 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
      body: JSON.stringify({ status: 'ready', updated_at: new Date().toISOString() })
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const ref = '#' + orderId.slice(0, 6).toUpperCase();
    showToast('Order ' + ref + ' marked ready', 'ok');
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
    // CC-20: write status to merchant_orders — never orders directly
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

// ─── SIGNED OUT / IN STATE ───────────────────────────────────
function showSignedOutState() {
  document.getElementById('queue-stats-strip').style.display   = 'none';
  document.getElementById('card-queue-summary').style.display  = 'none';
  document.getElementById('poll-dot').style.display            = 'none';
  const queue = document.getElementById('order-queue');
  queue.querySelectorAll('.order-tile, .queue-empty').forEach(el => el.remove());
  const prompt = document.getElementById('queue-signin-prompt');
  if (prompt) prompt.style.display = '';
  document.getElementById('site-name').textContent    = '—';
  document.getElementById('site-address').textContent = 'Waiting for owner sign-in…';
  document.getElementById('site-status-label').textContent = '—';
  document.getElementById('site-status-dot').className = 'site-status-dot';
  // Hide merged pill until staff sign in
  const pillEl = document.getElementById('merged-pill');
  if (pillEl) pillEl.style.display = 'none';
}

function showSignedInState() {
  document.getElementById('queue-stats-strip').style.display  = '';
  document.getElementById('card-queue-summary').style.display = '';
  const prompt = document.getElementById('queue-signin-prompt');
  if (prompt) prompt.style.display = 'none';
  // Render merged pill (role now known)
  renderMergedPill();
}

// ─── DARWIN FEED ─────────────────────────────────────────────
const DARWIN_STATION_LABELS = {
  'FST': 'Fenchurch Street', 'LIM': 'Limehouse', 'WHA': 'West Ham',
  'BFR': 'Barking',          'UPM': 'Upminster',  'SHO': 'Shoeburyness',
  'PFL': 'Pitsea',           'GRY': 'Grays'
};

/**
 * pollDarwin()
 * Real data source: rail_signal_current, feed='departure_board_staff', feed_key='FST'.
 * details column is a JSONB array of upcoming c2c service events.
 */
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
    const details = typeof rows[0].details === 'string' ? JSON.parse(rows[0].details) : rows[0].details;
    const services = Array.isArray(details) ? details : [];
    // Map to {crs, actual_timestamp} shape expected by updateHorizonBand
    _darwinRowsCache = services
      .filter(s => !s.is_cancelled)
      .slice(0, 3)
      .map(s => ({ crs: 'FST', actual_timestamp: s.etd || s.atd || s.std }));
    setDarwinConnected(true);
    renderDarwinRows(services.slice(0, 6));
    updateHorizonBand();
  } catch(e) {
    console.warn('[pollDarwin] error:', e);
    setDarwinConnected(false);
  }
}

function setDarwinConnected(connected) {
  const dot  = document.getElementById('darwin-dot');
  const text = document.getElementById('darwin-status-text');
  if (dot)  dot.className  = 'darwin-dot ' + (connected ? 'online' : 'offline');
  if (text) text.textContent = connected ? 'Live — Fenchurch Street' : 'Signal lost';
}

function renderDarwinRows(services) {
  const container = document.getElementById('darwin-rows');
  if (!container) return;
  if (!services || services.length === 0) {
    container.innerHTML = `<div class="darwin-row" style="justify-content:center;padding:12px 0;">
      <span style="font-family:var(--mono);font-size:10px;color:var(--text-tertiary);letter-spacing:0.06em;">NO SERVICES</span>
    </div>`;
    return;
  }
  container.innerHTML = services.map(s => {
    const time = s.etd || s.atd || s.std || '—';
    const dest = s.destination_name || 'Fenchurch Street';
    const isLate = s.etd && s.std && s.etd > s.std;
    return `<div class="darwin-row">
      <span class="darwin-dest">${dest}</span>
      <span class="darwin-time${isLate ? ' late' : ''}">${time}</span>
    </div>`;
  }).join('');
}

// ─── HORIZON BAND ─────────────────────────────────────────────
// CC-83 locked spec:
//   - Height 64px, background #1A1A1A hardcoded (always dark, both themes)
//   - Station name: IBM Plex Mono 15px #E4E2DC
//   - ETA: IBM Plex Mono 14px #C8A96E (gold)
//   - "DARWIN · LIVE" label: IBM Plex Mono 10px #5A5751
//   - "ARRIVALS" label: IBM Plex Mono 10px #8A8680
//   - All arrival counts: #A8A4A0 uniform — no gold on any count
//   - Window urgency: 0–3 min rgba(255,255,255,0.07) · 3–7 min rgba(255,255,255,0.03) · 7–15 min transparent
//   - Gold active-highlight (.hb-active) retired — urgency signal is background tint only
//
// 8-minute rule retirement note (logged CC-83b for future iteration):
//   Urgency windows with per-merchant configurable walk time (station→venue distance varies
//   by town/venue). TfL data path for tube lines noted. Horizon strip is a key sales pitch
//   asset — wire urgency back with merchant-specific parameters when data is available.
function updateHorizonBand() {
  const rows = _darwinRowsCache;
  const darwinSection = document.getElementById('hb-darwin');
  const label = document.getElementById('hb-darwin-label');

  if (!rows || rows.length === 0) {
    darwinSection.classList.add('hb-darwin-offline');
    document.getElementById('hb-station-name').textContent  = 'OFFLINE';
    document.getElementById('hb-station-eta').textContent   = '—';
    document.getElementById('hb-station-name-2').textContent = '—';
    document.getElementById('hb-station-eta-2').textContent  = '—';
    label.textContent = 'DARWIN · OFFLINE';
    _horizonClearWindows();
    return;
  }

  darwinSection.classList.remove('hb-darwin-offline');
  label.textContent = 'DARWIN · LIVE';

  // Primary window
  const primary    = rows[0];
  const primaryTs  = primary.actual_timestamp ? new Date(primary.actual_timestamp) : null;
  const primaryEta = primaryTs
    ? primaryTs.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
    : '—';
  document.getElementById('hb-station-name').textContent = DARWIN_STATION_LABELS[primary.crs] || primary.crs;
  document.getElementById('hb-station-eta').textContent  = primaryEta;

  // Secondary window (landscape only)
  if (rows.length > 1) {
    const secondary    = rows[1];
    const secondaryTs  = secondary.actual_timestamp ? new Date(secondary.actual_timestamp) : null;
    const secondaryEta = secondaryTs
      ? secondaryTs.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
      : '—';
    document.getElementById('hb-station-name-2').textContent = DARWIN_STATION_LABELS[secondary.crs] || secondary.crs;
    document.getElementById('hb-station-eta-2').textContent  = secondaryEta;
  }

  // Passenger counts remain unavailable (no clean join key to historical loadings — see CC-48)
  ['hb-count-0', 'hb-count-3', 'hb-count-7'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '—';
  });

  // Window urgency: background tint by proximity. No gold active-highlight.
  _horizonSetWindowTints(primaryTs);
}

function _horizonClearWindows() {
  ['hb-win-0','hb-win-3','hb-win-7'].forEach(wid => {
    const el = document.getElementById(wid);
    if (el) { el.classList.remove('hb-active'); el.style.background = 'transparent'; }
  });
}

function _horizonSetWindowTints(primaryTs) {
  // Static tints per CC-83 lock — urgency via background only, not text colour.
  // Active highlight class removed; tints always applied by arrival window position.
  const win0 = document.getElementById('hb-win-0');
  const win3 = document.getElementById('hb-win-3');
  const win7 = document.getElementById('hb-win-7');
  if (!win0 || !win3 || !win7) return;
  // Remove any old active class (transitioning from old code)
  [win0,win3,win7].forEach(el => el.classList.remove('hb-active'));
  win0.style.background = 'rgba(255,255,255,0.07)';
  win3.style.background = 'rgba(255,255,255,0.03)';
  win7.style.background = 'transparent';
}

// ─── VIEW SWITCHER (independent_owner) ───────────────────────
// CC-83b: direct switch via merged pill — no confirm overlay needed.
// Confirm overlay HTML retained in index.html for graceful no-op if clicked externally.
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
  updateMergedPillActive();
}
function switchToQueueView() {
  _currentView = 'queue';
  document.getElementById('order-queue').style.display  = '';
  document.getElementById('queue-header').style.display = '';
  document.getElementById('ops-panel').classList.remove('visible');
  document.getElementById('btn-back-queue').classList.remove('visible');
  updateMergedPillActive();
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
    const dot   = document.getElementById('site-status-dot');
    const label = document.getElementById('site-status-label');
    if (dot)   dot.className    = 'site-status-dot' + (checked ? '' : ' closed');
    if (label) { label.textContent = checked ? 'Open — accepting orders' : 'Closed'; label.style.color = checked ? 'var(--c-green)' : 'var(--c-red)'; }
  } catch(e) {
    showToast('Update failed: ' + e.message, 'err');
    const t = document.getElementById('ops-toggle-open');
    if (t) t.checked = !checked;
  }
}
async function opsTogglePreorder(checked) {
  console.info('[CC-21] opsTogglePreorder called but toggle removed from UI — CPO decision pending');
}
async function opsTogglePause(checked) {
  if (!_venueId) return;
  try {
    const session = await getSbClient().auth.getSession();
    const token = session?.data?.session?.access_token || SB_KEY;
    const body = checked
      ? { active: false, pause_reason: 'Paused by operator' }
      : { active: true,  pause_reason: null };
    const res = await fetch(`${SB_URL}/rest/v1/venue_partners?id=eq.${_venueId}`, {
      method: 'PATCH',
      headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + token,
                 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    if (_venueData) {
      _venueData.active       = !checked;
      _venueData.pause_reason = body.pause_reason;
    }
    const openToggle = document.getElementById('ops-toggle-open');
    if (openToggle) openToggle.checked = !checked;
    const dot   = document.getElementById('site-status-dot');
    const label = document.getElementById('site-status-label');
    if (dot)   dot.className   = 'site-status-dot' + (checked ? ' closed' : '');
    if (label) {
      label.textContent = checked ? 'Paused — no new orders' : 'Open — accepting orders';
      label.style.color = checked ? 'var(--c-warn)' : 'var(--c-green)';
    }
    showToast(checked ? 'New orders paused' : 'Accepting new orders', checked ? 'warn' : 'ok');
  } catch(e) {
    showToast('Pause update failed: ' + e.message, 'err');
    const t = document.getElementById('ops-toggle-pause');
    if (t) t.checked = !checked;
  }
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
      await resolveVenueAndPins(_currentUser);
      if (!_staffAuthenticated) {
        hideMagicLinkGate();
        showPinGate();
      }
    }
  });

  // Boot routing
  await routeGate();
}

// ─── MAPBOX TOKEN ─────────────────────────────────────────────
mapboxgl.accessToken = 'pk.eyJ1IjoicmFqZXNodGF5bG9yIiwiYSI6ImNtcDM3cXZhZjA2anYycHNnNWRsZDQ2MHAifQ.ZSJ06D0jSp-YwwN-IqPtTg';

// ─── BOOT ─────────────────────────────────────────────────────
initAuth();
