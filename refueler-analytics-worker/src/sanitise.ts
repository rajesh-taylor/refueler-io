/**
 * Input cleaning for the analytics Worker. Pure functions, no Worker types, so
 * test/sanitise.test.ts runs them with plain `node --test` (Funnel-Count-1 · 27 Oct 2026).
 */

export const EVENT_NAMES = [
  "page_view",
  "signup_submit",
  "theme_toggle",
  "article_read",
  "to_share",
] as const;

export type EventName = (typeof EVENT_NAMES)[number];

export function isValidEvent(name: unknown): name is EventName {
  return (EVENT_NAMES as readonly string[]).includes(name as string);
}

export function sanitisePath(raw: unknown): string {
  if (typeof raw !== "string") return "/unknown";
  // Strip query strings and fragments — we only want the path
  try {
    const u = new URL(raw, "https://refueler.io");
    return u.pathname.slice(0, 200);
  } catch {
    return "/unknown";
  }
}

export function sanitiseString(raw: unknown, maxLen = 100): string {
  if (typeof raw !== "string") return "";
  return raw.slice(0, maxLen).replace(/[^\w\s\-./:#@]/g, "");
}

function isInternal(host: string): boolean {
  return host === "refueler.io" || host.endsWith(".refueler.io");
}

/**
 * Referrer → site name only. The client sends "direct", "internal" or a bare host name;
 * a full address (an older cached analytics.js) is cut down to its host here.
 */
export function cleanReferrer(raw: unknown): string {
  if (typeof raw !== "string" || raw === "") return "direct";
  if (raw === "direct" || raw === "internal") return raw;
  let host: string;
  if (/^[a-z0-9.-]{1,253}$/i.test(raw)) {
    host = raw.toLowerCase();
  } else {
    try {
      host = new URL(raw).hostname.toLowerCase();
    } catch {
      return "unknown";
    }
  }
  host = host.replace(/^www\./, "");
  if (!host) return "unknown";
  return isInternal(host) ? "internal" : host;
}

/** Notes article slug from a cleaned path: /notes/what-share-keeps/ → "what-share-keeps". */
export function notesSlug(path: string): string {
  const m = /^\/notes\/([a-z0-9-]{1,80})\/?$/.exec(path);
  return m ? m[1] : "";
}
