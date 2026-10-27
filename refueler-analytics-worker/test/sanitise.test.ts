// Run: npm test (node --test; Node strips the types itself). Funnel-Count-1 · 27 Oct 2026.
import { test } from "node:test";
import assert from "node:assert/strict";
import { cleanReferrer, isValidEvent, notesSlug, sanitisePath } from "../src/sanitise.ts";

test("referrer: site names pass, full addresses are cut to the host", () => {
  assert.equal(cleanReferrer(""), "direct");
  assert.equal(cleanReferrer(undefined), "direct");
  assert.equal(cleanReferrer("direct"), "direct");
  assert.equal(cleanReferrer("internal"), "internal");
  assert.equal(cleanReferrer("duckduckgo.com"), "duckduckgo.com");
  assert.equal(cleanReferrer("www.Example.COM"), "example.com");
  assert.equal(cleanReferrer("https://news.example.org/item?id=1#x"), "news.example.org");
});

test("referrer: refueler.io and its subdomains are internal, lookalikes are not", () => {
  assert.equal(cleanReferrer("refueler.io"), "internal");
  assert.equal(cleanReferrer("share.refueler.io"), "internal");
  assert.equal(cleanReferrer("https://refueler.io/notes/"), "internal");
  assert.equal(cleanReferrer("refueler.io.evil.example"), "refueler.io.evil.example");
  assert.equal(cleanReferrer("notrefueler.io"), "notrefueler.io");
});

test("referrer: junk is unknown", () => {
  assert.equal(cleanReferrer("not a url <script>"), "unknown");
  assert.equal(cleanReferrer(42), "direct");
});

test("path keeps the path only, never query or fragment", () => {
  assert.equal(sanitisePath("/share/?uuid=abc#key"), "/share/");
  assert.equal(sanitisePath("https://refueler.io/share/plans/?x=1"), "/share/plans/");
  assert.equal(sanitisePath(null), "/unknown");
});

test("notes slug from the path; index and other paths give none", () => {
  assert.equal(notesSlug("/notes/what-share-keeps/"), "what-share-keeps");
  assert.equal(notesSlug("/notes/when-a-transfer-doesnt-work"), "when-a-transfer-doesnt-work");
  assert.equal(notesSlug("/notes/"), "");
  assert.equal(notesSlug("/notes/latest.json"), "");
  assert.equal(notesSlug("/editorial/the-float.html"), "");
});

test("to_share is an accepted event", () => {
  assert.ok(isValidEvent("to_share"));
  assert.ok(isValidEvent("page_view"));
  assert.ok(!isValidEvent("anything_else"));
});
