/**
 * Refueler Analytics Client
 * Paste minified version into each HTML page before </body>
 * or load as /analytics.js from Cloudflare Pages.
 *
 * Zero cookies. Zero localStorage. No PII.
 * Sends events to https://analytics.refueler.io/event
 */

(function () {
  "use strict";

  const ENDPOINT = "https://analytics.refueler.io/event";

  // Current theme — read from localStorage key rfTheme
  function currentTheme() {
    try {
      return localStorage.getItem("rfTheme") || "paper";
    } catch {
      return "unknown";
    }
  }

  // Fire-and-forget POST — never blocks the page
  function send(payload) {
    if (navigator.sendBeacon) {
      // sendBeacon: survives page unload, no CORS preflight for text/plain
      // We need JSON so we use fetch with keepalive instead
    }
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
    path: location.pathname,
    referrer: document.referrer,
    theme: currentTheme(),
  });

  // ── 2. Sign-up form submission (homepage only) ──────────────────────────────
  // Looks for a form or button with data-analytics="signup"
  document.addEventListener("DOMContentLoaded", function () {
    var signupEl = document.querySelector("[data-analytics='signup']");
    if (signupEl) {
      signupEl.addEventListener("submit", function () {
        send({
          event: "signup_submit",
          path: location.pathname,
          referrer: document.referrer,
          theme: currentTheme(),
        });
      });
      // Also catch button clicks inside the form (magic link button)
      var btn = signupEl.querySelector("button[type='submit'], button");
      if (btn) {
        btn.addEventListener("click", function () {
          send({
            event: "signup_submit",
            path: location.pathname,
            referrer: document.referrer,
            theme: currentTheme(),
          });
        });
      }
    }

    // ── 3. Theme toggle ────────────────────────────────────────────────────────
    // Works with both id="themePill" (homepage/privacy/complaints)
    // and id="theme-btn" (editorial)
    var toggleEl =
      document.getElementById("themePill") ||
      document.getElementById("theme-btn");

    if (toggleEl) {
      toggleEl.addEventListener("click", function () {
        var before = currentTheme();
        // Fire after the IIFE has had a tick to update localStorage
        setTimeout(function () {
          var after = currentTheme();
          if (before !== after) {
            send({
              event: "theme_toggle",
              path: location.pathname,
              referrer: document.referrer,
              theme: after,
              from: before,
              to: after,
            });
          }
        }, 50);
      });
    }

    // ── 4. Article read — scroll depth ─────────────────────────────────────────
    // Only fires on editorial article pages
    // Derive slug from URL: /editorial/the-float.html → "the-float"
    var isArticle =
      location.pathname.includes("/editorial/") &&
      !location.pathname.endsWith("/editorial/") &&
      !location.pathname.endsWith("index.html");

    if (isArticle) {
      var slug = location.pathname
        .split("/")
        .pop()
        .replace(".html", "") || "unknown";

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
              path: location.pathname,
              referrer: document.referrer,
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
