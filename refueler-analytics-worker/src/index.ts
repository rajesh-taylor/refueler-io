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
 *   article_read     — editorial + Notes scroll depth proxy (25 / 50 / 75 / 100%)
 *   to_share         — a press on a link to share.refueler.io (page path + theme only)
 */

import {
  cleanReferrer,
  isValidEvent,
  notesSlug,
  sanitisePath,
  sanitiseString,
  type EventName,
} from "./sanitise";

export interface Env {
  ANALYTICS: AnalyticsEngineDataset;
  ALLOWED_ORIGIN: string; // e.g. "https://refueler.io"
}

// ── Types ────────────────────────────────────────────────────────────────────

interface BaseEvent {
  event: EventName;
  path: string;        // e.g. "/", "/editorial/the-float.html"
  referrer?: string;   // site name only: "direct", "internal" or e.g. "duckduckgo.com"
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
   *   [2] referrer (site name only; empty for to_share)
   *   [3] country (from CF-IPCountry header)
   *   [4] theme at time of event
   *   [5] extra_a (from/article_slug depending on event)
   *   [6] extra_b (to/depth_bucket depending on event)
   *   [7] user agent hint (mobile/desktop/bot)
   *
   * Double layout:
   *   [0] scroll depth (article_read only, else 0)
   */

  const path = sanitisePath(event.path);
  const referrerDomain =
    event.event === "to_share" ? "" : cleanReferrer((event as BaseEvent).referrer);

  let extra_a = "";
  let extra_b = "";
  let scrollDepth = 0;

  if (event.event === "theme_toggle") {
    const e = event as ThemeToggleEvent;
    extra_a = e.from;
    extra_b = e.to;
  } else if (event.event === "article_read") {
    const e = event as ArticleReadEvent;
    // Notes: the slug comes from the path, not the client
    extra_a = notesSlug(path) || sanitiseString(e.article_slug, 80);
    extra_b = String(e.depth);
    scrollDepth = typeof e.depth === "number" ? e.depth : 0;
  }

  dataset.writeDataPoint({
    blobs: [
      event.event,
      path,
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
