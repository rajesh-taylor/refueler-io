/* ─────────────────────────────────────────────────────────────────────────────
   notes.js — Refueler /notes/ shared scripts
   Theme: rfTheme in localStorage, 'paper' | 'carbon'
   Modal: focus-trapped, Escape-dismissible, click-outside-dismissible
   ───────────────────────────────────────────────────────────────────────────── */

/* ── Theme ── */
const THEME_KEY = 'rfTheme';

function applyTheme(theme) {
  const root = document.documentElement;
  const pill = document.getElementById('theme-btn');
  if (theme === 'carbon') {
    root.setAttribute('data-theme', 'carbon');
    if (pill) pill.textContent = 'Carbon / Paper';
  } else {
    root.removeAttribute('data-theme');
    if (pill) pill.textContent = 'Paper / Carbon';
  }
}

function toggleTheme() {
  const next = (localStorage.getItem(THEME_KEY) || 'paper') === 'paper' ? 'carbon' : 'paper';
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
}

(function () { applyTheme(localStorage.getItem(THEME_KEY) || 'paper'); })();

/* ── Modal ── */
(function () {
  const FOCUSABLE = 'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])';
  let previousFocus = null;

  function trapFocus(modal) {
    const focusable = Array.from(modal.querySelectorAll(FOCUSABLE));
    if (!focusable.length) return;
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
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
    const overlay = document.getElementById(id);
    if (!overlay) return;
    previousFocus = document.activeElement;
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const box = overlay.querySelector('.modal-box');
    if (box) {
      trapFocus(box);
      const firstFocusable = box.querySelector(FOCUSABLE);
      if (firstFocusable) firstFocusable.focus();
    }
  };

  window.closeModal = function (id) {
    const overlay = document.getElementById(id);
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
})();
