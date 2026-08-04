/* ─────────────────────────────────────────────────────────────────────────────
   notes.js — Refueler /notes/ shared scripts
   Theme: rs-theme cookie scoped to .refueler.io — same as head.njk and global
   Modal: focus-trapped, Escape-dismissible, click-outside-dismissible
   ───────────────────────────────────────────────────────────────────────────── */

/* ── Theme ── */
function getCookie(name) {
  var m = document.cookie.match('(?:^|; )' + name + '=([^;]*)');
  return m ? decodeURIComponent(m[1]) : null;
}

function setCookie(name, value) {
  var expires = new Date(Date.now() + 30 * 864e5).toUTCString();
  document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/; domain=.refueler.io; SameSite=Lax';
}

function applyTheme(theme) {
  var root = document.documentElement;
  var pill = document.getElementById('theme-btn');
  if (theme === 'carbon') {
    root.setAttribute('data-theme', 'carbon');
    if (pill) pill.textContent = 'Carbon / Paper';
  } else {
    root.removeAttribute('data-theme');
    if (pill) pill.textContent = 'Paper / Carbon';
  }
}

function toggleTheme() {
  var current = getCookie('rs-theme') || 'paper';
  var next = current === 'paper' ? 'carbon' : 'paper';
  setCookie('rs-theme', next);
  applyTheme(next);
}

/* head.njk already applied the theme before first paint.
   notes.js re-reads the same cookie and re-applies — no conflict,
   no localStorage read, no overwrite of head.njk's work. */
(function () { applyTheme(getCookie('rs-theme') || 'paper'); }());

/* ── Modal ── */
(function () {
  var FOCUSABLE = 'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])';
  var previousFocus = null;

  function trapFocus(modal) {
    var focusable = Array.from(modal.querySelectorAll(FOCUSABLE));
    if (!focusable.length) return;
    var first = focusable[0];
    var last  = focusable[focusable.length - 1];
    modal.addEventListener('keydown', function trap(e) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  window.openModal = function (id) {
    var overlay = document.getElementById(id);
    if (!overlay) return;
    previousFocus = document.activeElement;
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    var box = overlay.querySelector('.modal-box');
    if (box) {
      trapFocus(box);
      var firstFocusable = box.querySelector(FOCUSABLE);
      if (firstFocusable) firstFocusable.focus();
    }
  };

  window.closeModal = function (id) {
    var overlay = document.getElementById(id);
    if (!overlay) return;
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (previousFocus) { previousFocus.focus(); previousFocus = null; }
  };

  // Click outside (on overlay itself) closes
  document.addEventListener('click', function (e) {
    if (e.target.classList.contains('modal-overlay') && e.target.classList.contains('open')) {
      closeModal(e.target.id);
    }
  });

  // Escape closes any open modal
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('.modal-overlay.open').forEach(function (overlay) {
      closeModal(overlay.id);
    });
  });
}());
