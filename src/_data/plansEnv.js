// Plans' Stripe, Worker and Turnstile settings (Stripe-Account-1 · 27 Oct 2026).
// A production build (`eleventy`, Cloudflare Pages) always gets LIVE: the
// environment is never read. Only `eleventy --serve` on Rajesh's Mac may point
// Plans at the local sandbox Worker, for the Stripe-Account-2 test-through:
//   PLANS_WORKER_URL=http://localhost:8787 PLANS_STRIPE_PK=pk_test_… \
//   PLANS_TURNSTILE_SITEKEY=1x00000000000000000000AA PLANS_CITIZEN_OPEN=1 npm run dev
// A pk_live_ key is refused there, so a local page can never take a real payment.
const LIVE = {
  workerUrl:        "https://api.share.refueler.io",
  stripePk:         "pk_live_qTLdmzRXg6KHXtxbgGYQZc7L00Kl4saD2q",
  turnstileSitekey: "0x4AAAAAAFacLp0bLt3fdOP0",
  citizenOpen:      false,
};

module.exports = function () {
  if (process.env.ELEVENTY_RUN_MODE !== "serve" || !process.env.PLANS_STRIPE_PK) return LIVE;
  const local = {
    workerUrl:        process.env.PLANS_WORKER_URL || "http://localhost:8787",
    stripePk:         process.env.PLANS_STRIPE_PK,
    turnstileSitekey: process.env.PLANS_TURNSTILE_SITEKEY || "1x00000000000000000000AA",
    citizenOpen:      process.env.PLANS_CITIZEN_OPEN === "1",
  };
  if (!/^pk_test_[A-Za-z0-9]+$/.test(local.stripePk)) throw new Error("plansEnv: local Plans takes a pk_test_ key only");
  if (!/^http:\/\/localhost:\d+$/.test(local.workerUrl)) throw new Error("plansEnv: local Plans talks to http://localhost:<port> only");
  return local;
};
