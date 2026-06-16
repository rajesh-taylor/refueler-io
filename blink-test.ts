// CC-22 — blink-webhook signature verification test
// Run: BLINK_WEBHOOK_SECRET=whsec_xxx deno run --allow-env --allow-net blink-test.ts

const WEBHOOK_URL = "https://tihgvdokeofnjxjkenmm.supabase.co/functions/v1/blink-webhook";
const secret = Deno.env.get("BLINK_WEBHOOK_SECRET") ?? "";

async function computeHmac(secret: string, body: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
}

const body = JSON.stringify({
  type: "transaction.settled",
  data: {
    transaction: {
      id: "test-tx-001",
      status: "SUCCESS",
      settlementAmount: 1000,
      initiationVia: { paymentHash: "abc123testpaymenthash" },
    },
  },
});

const validSig = await computeHmac(secret, body);
const badSig   = "0".repeat(64); // 64 hex zeros — valid hex, wrong signature

console.log("── Test 1: Valid signature (expect 200 or 500 on DB miss) ──");
const r1 = await fetch(WEBHOOK_URL, {
  method: "POST",
  headers: { "Content-Type": "application/json", "X-Blink-Signature": validSig },
  body,
});
console.log(`Status: ${r1.status}`, await r1.text());

console.log("\n── Test 2: Bad signature (expect 401) ──");
const r2 = await fetch(WEBHOOK_URL, {
  method: "POST",
  headers: { "Content-Type": "application/json", "X-Blink-Signature": badSig },
  body,
});
console.log(`Status: ${r2.status}`, await r2.text());

console.log("\n── Test 3: Missing signature header (expect 401) ──");
const r3 = await fetch(WEBHOOK_URL, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body,
});
console.log(`Status: ${r3.status}`, await r3.text());
