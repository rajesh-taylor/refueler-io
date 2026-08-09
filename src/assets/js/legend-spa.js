/**
 * legend-spa.js — Legend private Bitcoin block explorer
 * Phase 1, Multi-7: mount point and shell only. No query logic.
 *
 * Owns everything inside #legend-spa-mount.
 * Theme detection: document.documentElement.dataset.theme === 'carbon'
 * Never: classList.contains('carbon-mode')
 * No localStorage for any Legend state.
 */

(function () {
  'use strict';

  // ─── Mount ──────────────────────────────────────────────────────────────
  const mount = document.getElementById('legend-spa-mount');
  if (!mount) return;

  // ─── Render shell ────────────────────────────────────────────────────────
  mount.innerHTML = `
    <span class="legend-wordmark">Legend</span>

    <div class="legend-input-wrap">
      <input
        class="legend-input"
        id="legend-input"
        type="text"
        placeholder="Address, transaction ID, or block height"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="none"
        spellcheck="false"
        aria-label="Bitcoin address, transaction ID, or block height"
      />
      <button
        class="legend-batch-btn"
        id="legend-batch-btn"
        title="Check multiple addresses"
        aria-label="Check multiple addresses"
      >
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <rect x="1" y="1" width="6" height="6" rx="1"/>
          <rect x="9" y="1" width="6" height="6" rx="1"/>
          <rect x="1" y="9" width="6" height="6" rx="1"/>
          <rect x="9" y="9" width="6" height="6" rx="1"/>
        </svg>
      </button>
    </div>

    <p class="legend-tagline">Private query. No logs. No tracking.</p>

    <div id="legend-result" role="region" aria-live="polite" aria-label="Query result"></div>
  `;

  // ─── Input focus — show/hide batch icon ─────────────────────────────────
  const input = document.getElementById('legend-input');
  const batchBtn = document.getElementById('legend-batch-btn');

  if (input && batchBtn) {
    input.addEventListener('focus', function () {
      batchBtn.classList.add('visible');
    });

    input.addEventListener('blur', function () {
      // Small delay so a click on the batch button registers before hide
      setTimeout(function () {
        batchBtn.classList.remove('visible');
      }, 150);
    });

    // Enter key — placeholder for query handler (Multi-8)
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        // query handler wires in here at Multi-8
      }
    });

    // Batch button — placeholder for batch modal (Multi-8)
    batchBtn.addEventListener('click', function () {
      // batch modal wires in here at Multi-8
    });
  }

})();
