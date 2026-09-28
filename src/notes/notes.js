/* ─────────────────────────────────────────────────────────────────────────────
   notes.js — Refueler /notes/ shared scripts
   Theme: none here. head.njk applies it and owns toggleTheme() (Share-Cleanup-1:
   the copy that lived here replaced the site toggle and never updated the pill).
   Modal: focus-trapped, Escape-dismissible, click-outside-dismissible
   ───────────────────────────────────────────────────────────────────────────── */

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
