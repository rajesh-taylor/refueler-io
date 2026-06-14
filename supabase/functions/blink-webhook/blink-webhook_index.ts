// blink-webhook — Supabase Edge Function
// Receives Blink payment callbacks via Svix webhook relay.
// Verifies Svix signature before processing any payload.
// Ref: https://docs.svix.com/receiving/verifying-payloads/how

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL              = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const BLINK_WEBHOOK_SECRET      = Deno.env.get("BLINK_WEBHOOK_SECRET")!; // whsec_...

// ---------------------------------------------------------------------------
// Svix signature verification
// Signed payload: "{svix-id}.{svix-timestamp}.{raw-body}"
// Secret: base64-decode the whsec_ suffix, use as HMAC-SHA256 key
// Signature: one or more "v1,<base64>" values in svix-signature (space-sep)
// ---------------------------------------------------------------------------
async function verifySvixSignature(req: Request, rawBody: string): Promise<boolean> {
  const svixId        = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    console.error("blink-webhook: missing Svix headers");
    return false;
  }

  // Reject replays older than 5 minutes
  const ts = parseInt(svixTimestamp, 10);
  if (isNaN(ts) || Math.abs(Date.now() / 1000 - ts) > 300) {
    console.error("blink-webhook: timestamp out of tolerance:", svixTimestamp);
    return false;
  }

  // Decode whsec_ secret
  const secretBase64 = BLINK_WEBHOOK_SECRET.startsWith("whsec_")
    ? BLINK_WEBHOOK_SECRET.slice(6)
    : BLINK_WEBHOOK_SECRET;

  const secretBytes = Uint8Array.from(atob(secretBase64), c => c.charCodeAt(0));

  const toSign  = `${svixId}.${svixTimestamp}.${rawBody}`;
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    "raw", secretBytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );

  const sigBuffer  = await crypto.subtle.sign("HMAC", key, encoder.encode(toSign));
  const computedSig = btoa(String.fromCharCode(...new Uint8Array(sigBuffer)));

  // svix-signature may contain multiple "v1,<sig>" entries (space-separated)
  const entries = svixSignature.split(" ");
  for (const entry of entries) {
    const [version, sig] = entry.split(",");
    if (version === "v1" && sig === computedSig) {
      return true;
    }
  }

  console.error("blink-webhook: signature mismatch. computed:", computedSig);
  return false;
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------
serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // Read body once — required before any header inspection
  const rawBody = await req.text();

  const verified = await verifySvixSignature(req, rawBody);
  if (!verified) {
    return new Response("Unauthorized", { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  // Blink wraps events in a Svix envelope.
  // Relevant event: type = "payment.received" or "transaction.received"
  const eventType = payload.type as string | undefined;
  console.log("blink-webhook: event type:", eventType);

  if (eventType === "payment.received" || eventType === "transaction.received") {
    const data        = payload.data as Record<string, unknown> | undefined;
    const paymentHash = (data?.paymentHash ?? data?.payment_hash) as string | undefined;

    if (!paymentHash) {
      console.warn("blink-webhook: no paymentHash in payload");
      return new Response("OK", { status: 200 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { error } = await supabase
      .from("merchant_orders")
      .update({
        payment_status: "paid",
        paid_at: new Date().toISOString(),
      })
      .eq("bolt11_payment_hash", paymentHash)
      .eq("payment_status", "awaiting_payment");

    if (error) {
      console.error("blink-webhook: supabase update error:", error.message);
      return new Response("DB error", { status: 500 });
    }

    console.log("blink-webhook: order marked paid, paymentHash:", paymentHash);
  } else {
    console.log("blink-webhook: unhandled event type, acknowledging:", eventType);
  }

  return new Response("OK", { status: 200 });
});
