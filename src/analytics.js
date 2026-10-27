/**
 * Refueler Analytics Client
 * Loaded as /analytics.js on refueler.io pages, including Share's landing page /share/ and
 * Plans (Funnel-Count-1 · 27 Oct 2026). Never on share.refueler.io.
 *
 * Zero cookies. Zero localStorage or sessionStorage. No PII.
 * The referrer goes out as a site name only ("direct" when none, "internal" for refueler.io).
 * Sends events to https://analytics.refueler.io/event
 */

(function () {
  "use strict";

  const ENDPOINT = "https://analytics.refueler.io/event";

  // /share/ and /share/signin/ may be carrying an old Share link (?uuid=…#key) on its way to
  // share.refueler.io (share/forward.js). Any query or fragment there → no event at all.
  // Only emptiness is checked: neither part is ever read or sent.
  var path = location.pathname;
  var forwardPage = path === "/share/" || path === "/share/index.html" ||
    path.indexOf("/share/signin") === 0;
  if (forwardPage && (location.search !== "" || location.hash !== "")) return;

  // Current theme — read from canonical dataset.theme attribute (CSS-6 fix)
  // Replaces abolished localStorage key rfTheme
  function currentTheme() {
    try {
      return document.documentElement.dataset.theme || "paper";
    } catch {
      return "unknown";
    }
  }

  // Site name of the page that sent the visitor, never the full address
  function referrerSite() {
    if (!document.referrer) return "direct";
    try {
      var host = new URL(document.referrer).hostname.replace(/^www\./, "");
      if (host === "refueler.io" || host.endsWith(".refueler.io")) return "internal";
      return host || "unknown";
    } catch {
      return "unknown";
    }
  }

  var referrer = referrerSite();

  // Fire-and-forget POST — never blocks the page
  function send(payload) {
    fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(function () {
      // Silent — analytics must never error the page
    });
  }

  // ── 1. Page view ────────────────────────────────────────────────────────────
  send({
    event: "page_view",
    path: path,
    referrer: referrer,
    theme: currentTheme(),
  });

  // ── 2. Pressed through to Share ─────────────────────────────────────────────
  // A press on any link to https://share.refueler.io. Page path and theme only.
  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
    if (!a || a.origin !== "https://share.refueler.io") return;
    send({
      event: "to_share",
      path: path,
      theme: currentTheme(),
    });
  });

  // ── 3. Sign-up form submission (homepage only) ──────────────────────────────
  // Looks for a form or button with data-analytics="signup"
  document.addEventListener("DOMContentLoaded", function () {
    var signupEl = document.querySelector("[data-analytics='signup']");
    if (signupEl) {
      signupEl.addEventListener("submit", function () {
        send({
          event: "signup_submit",
          path: path,
          referrer: referrer,
          theme: currentTheme(),
        });
      });
      // Also catch button clicks inside the form (magic link button)
      var btn = signupEl.querySelector("button[type='submit'], button");
      if (btn) {
        btn.addEventListener("click", function () {
          send({
            event: "signup_submit",
            path: path,
            referrer: referrer,
            theme: currentTheme(),
          });
        });
      }
    }

    // ── 4. Theme toggle ────────────────────────────────────────────────────────
    // Works with both id="themePill" (homepage/privacy/complaints)
    // and id="theme-btn" (editorial)
    var toggleEl =
      document.getElementById("themePill") ||
      document.getElementById("theme-btn");

    if (toggleEl) {
      toggleEl.addEventListener("click", function () {
        var before = currentTheme();
        // Fire after the theme script has had a tick to update dataset.theme
        setTimeout(function () {
          var after = currentTheme();
          if (before !== after) {
            send({
              event: "theme_toggle",
              path: path,
              referrer: referrer,
              theme: after,
              from: before,
              to: after,
            });
          }
        }, 50);
      });
    }

    // ── 5. Article read — scroll depth ─────────────────────────────────────────
    // Editorial articles (/editorial/the-float.html → "the-float") and Notes articles
    // (/notes/what-share-keeps/ → "what-share-keeps"); never the two index pages.
    var slug = "";
    var notes = /^\/notes\/([a-z0-9-]+)\/?$/.exec(path);
    if (notes) {
      slug = notes[1];
    } else if (
      path.includes("/editorial/") &&
      !path.endsWith("/editorial/") &&
      !path.endsWith("index.html")
    ) {
      slug = path.split("/").pop().replace(".html", "") || "unknown";
    }

    if (slug) {
      var fired = { 25: false, 50: false, 75: false, 100: false };

      function scrollDepth() {
        var doc = document.documentElement;
        var scrolled = doc.scrollTop || document.body.scrollTop;
        var total = doc.scrollHeight - doc.clientHeight;
        if (total <= 0) return 0;
        return Math.round((scrolled / total) * 100);
      }

      window.addEventListener("scroll", function () {
        var depth = scrollDepth();
        [25, 50, 75, 100].forEach(function (milestone) {
          if (!fired[milestone] && depth >= milestone) {
            fired[milestone] = true;
            send({
              event: "article_read",
              path: path,
              referrer: referrer,
              theme: currentTheme(),
              depth: milestone,
              article_slug: slug,
            });
          }
        });
      }, { passive: true });
    }
  });
})();
