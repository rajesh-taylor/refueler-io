/**
 * Refueler Analytics Worker
 * Deployed as a standalone Cloudflare Worker (not Pages function)
 * Routes: POST /event
 * Writes to Cloudflare Analytics Engine dataset: refueler_analytics
 *
 * Events captured:
 *   page_view        — all pages, with referrer + country
 *   signup_submit    — homepage magic link form submission
 *   theme_toggle     — Paper ↔ Carbon switch (product signal)
 *   article_read     — editorial scroll depth proxy (25 / 50 / 75 / 100%)
 */

export interface Env {
  ANALYTICS: AnalyticsEngineDataset;
  ALLOWED_ORIGIN: string; // e.g. "https://refueler.io"
}

// ── Types ────────────────────────────────────────────────────────────────────

type EventName =
  | "page_view"
  | "signup_submit"
  | "theme_toggle"
  | "article_read";

interface BaseEvent {
  event: EventName;
  path: string;        // e.g. "/", "/editorial/the-float.html"
  referrer?: string;   // document.referrer (empty string if direct)
  theme?: string;      // "paper" | "carbon" — current theme at time of event
}

interface ThemeToggleEvent extends BaseEvent {
  event: "theme_toggle";
  from: string;        // "paper" | "carbon"
  to: string;          // "paper" | "carbon"
}

interface ArticleReadEvent extends BaseEvent {
  event: "article_read";
  depth: number;       // 25 | 50 | 75 | 100
  article_slug: string; // e.g. "nothing-to-collect-nothing-to-hide"
}

type RefuelerEvent = BaseEvent | ThemeToggleEvent | ArticleReadEvent;

// ── CORS helpers ─────────────────────────────────────────────────────────────

function corsHeaders(origin: string): HeadersInit {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

function isAllowedOrigin(requestOrigin: string | null, allowed: string): boolean {
  if (!requestOrigin) return false;
  // Allow exact match or localhost for dev
  return requestOrigin === allowed || requestOrigin.startsWith("http://localhost");
}

// ── Sanitise & validate ───────────────────────────────────────────────────────

function sanitisePath(raw: unknown): string {
  if (typeof raw !== "string") return "/unknown";
  // Strip query strings and fragments — we only want the path
  try {
    const u = new URL(raw, "https://refueler.io");
    return u.pathname.slice(0, 200);
  } catch {
    return "/unknown";
  }
}

function sanitiseString(raw: unknown, maxLen = 100): string {
  if (typeof raw !== "string") return "";
  return raw.slice(0, maxLen).replace(/[^\w\s\-./:#@]/g, "");
}

function isValidEvent(name: unknown): name is EventName {
  return ["page_view", "signup_submit", "theme_toggle", "article_read"].includes(name as string);
}

// ── Analytics Engine writer ───────────────────────────────────────────────────

function writeEvent(
  dataset: AnalyticsEngineDataset,
  event: RefuelerEvent,
  country: string,
  userAgentHint: string,
): void {
  /*
   * Analytics Engine data point structure:
   *   blobs  — string dimensions (indexed, searchable)
   *   doubles — numeric metrics
   *
   * Blob layout (positional — fixed, do not reorder):
   *   [0] event name
   *   [1] path
   *   [2] referrer (cleaned — domain only, not full URL)
   *   [3] country (from CF-IPCountry header)
   *   [4] theme at time of event
   *   [5] extra_a (from/article_slug depending on event)
   *   [6] extra_b (to/depth_bucket depending on event)
   *   [7] user agent hint (mobile/desktop/bot)
   *
   * Double layout:
   *   [0] scroll depth (article_read only, else 0)
   */

  const referrerDomain = cleanReferrer(
    (event as BaseEvent).referrer ?? ""
  );

  let extra_a = "";
  let extra_b = "";
  let scrollDepth = 0;

  if (event.event === "theme_toggle") {
    const e = event as ThemeToggleEvent;
    extra_a = e.from;
    extra_b = e.to;
  } else if (event.event === "article_read") {
    const e = event as ArticleReadEvent;
    extra_a = sanitiseString(e.article_slug, 80);
    extra_b = String(e.depth);
    scrollDepth = typeof e.depth === "number" ? e.depth : 0;
  }

  dataset.writeDataPoint({
    blobs: [
      event.event,
      sanitisePath(event.path),
      referrerDomain,
      country,
      sanitiseString(event.theme, 10) || "unknown",
      extra_a,
      extra_b,
      userAgentHint,
    ],
    doubles: [scrollDepth],
    indexes: [event.event], // partition key for AE queries
  });
}

function cleanReferrer(raw: string): string {
  if (!raw || raw === "") return "direct";
  try {
    const u = new URL(raw);
    // Drop refueler.io self-referrals
    if (u.hostname.includes("refueler.io")) return "internal";
    return u.hostname.replace(/^www\./, "");
  } catch {
    return "unknown";
  }
}

function uaHint(ua: string | null): string {
  if (!ua) return "unknown";
  const s = ua.toLowerCase();
  if (s.includes("bot") || s.includes("spider") || s.includes("crawl")) return "bot";
  if (s.includes("mobile") || s.includes("android") || s.includes("iphone")) return "mobile";
  return "desktop";
}

// ── Main handler ─────────────────────────────────────────────────────────────

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const requestOrigin = request.headers.get("Origin");
    const allowed = env.ALLOWED_ORIGIN ?? "https://refueler.io";
    const originOk = isAllowedOrigin(requestOrigin, allowed);

    // Preflight
    if (request.method === "OPTIONS") {
      if (!originOk) return new Response(null, { status: 403 });
      return new Response(null, { status: 204, headers: corsHeaders(requestOrigin!) });
    }

    // Only POST /event
    const url = new URL(request.url);
    if (request.method !== "POST" || url.pathname !== "/event") {
      return new Response("Not found", { status: 404 });
    }

    if (!originOk) {
      return new Response("Forbidden", { status: 403 });
    }

    // Parse body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return new Response("Bad request", { status: 400 });
    }

    const payload = body as Record<string, unknown>;

    if (!isValidEvent(payload.event)) {
      return new Response("Invalid event", { status: 422 });
    }

    // Country from Cloudflare header (free — no IP stored)
    const country = request.headers.get("CF-IPCountry") ?? "XX";
    const ua = request.headers.get("User-Agent");

    // Drop bot traffic silently
    if (uaHint(ua) === "bot") {
      return new Response(null, { status: 204, headers: corsHeaders(requestOrigin!) });
    }

    try {
      writeEvent(
        env.ANALYTICS,
        payload as unknown as RefuelerEvent,
        country,
        uaHint(ua),
      );
    } catch (err) {
      console.error("Analytics write error:", err);
      // Never fail the client for analytics errors
    }

    return new Response(null, {
      status: 204,
      headers: corsHeaders(requestOrigin!),
    });
  },
};
