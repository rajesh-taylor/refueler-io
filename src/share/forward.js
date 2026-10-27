// share/forward.js — sends old Share links to Share's own address (X5-2 · 15 Oct 2026).
// Share moved from refueler.io/share/ to https://share.refueler.io. Links made before the move
// look like refueler.io/share/?uuid=…#… (and sign-in emails like refueler.io/share/signin/#t=…).
// This script runs first on those two pages and, if the address carries a link, moves the
// visitor to the same link on the new address.
//
// Rules (docs/X5-plan-v1.md §3 step 4, in refueler-share):
// - The destination is fixed: always https://share.refueler.io. Nothing in the address can
//   change where it goes (no open redirect).
// - The part after # holds the file key. It is passed along as it is: never read, parsed,
//   stored, logged or sent anywhere else. The browser never sends it to any server.
// - Remove on 12 Jan 2027, the day old (v0/v1) links stop opening anyway.
(function () {
  var search = location.search;
  var hash = location.hash;
  var signin = location.pathname.indexOf('/share/signin') === 0;
  // Every old Share link carries ?uuid=; sign-in emails carry only #t=…. On /share/ a bare #
  // (the homepage's /share/#alpha) is an anchor on this page, not a link (Funnel-Count-1).
  if (search.indexOf('uuid=') === -1 && (!signin || hash.length <= 1)) return; // plain visit: show the landing page
  var path = signin ? '/signin/' : '/';
  location.replace('https://share.refueler.io' + path + search + hash);
})();
