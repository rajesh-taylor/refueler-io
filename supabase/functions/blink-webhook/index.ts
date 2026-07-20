// blink-webhook v12 — Supabase Edge Function
// Receives Blink payment callbacks directly (no Svix).
// Blink registers endpoint via callbackEndpointAdd GraphQL mutation.
// Payload: { accountId, eventType: "receive.lightning", transaction: { settlementAmount, settlementFee, initiationVia: { paymentHash } } }
// Duplicate delivery handled gracefully — second call finds no awaiting_payment row, returns 200.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async (req) => {
  try {
    const payload = await req.json();
    console.log("blink-webhook v12 received:", JSON.stringify(payload));

    const eventType = payload?.eventType;
    if (eventType !== "receive.lightning") {
      console.log("Ignoring event type:", eventType);
      return new Response("ignored", { status: 200 });
    }

    const paymentHash = payload?.transaction?.initiationVia?.paymentHash;
    const settlementAmount = payload?.transaction?.settlementAmount;
    const settlementFee = payload?.transaction?.settlementFee ?? 0;

    if (!paymentHash) {
      console.error("No paymentHash in payload");
      return new Response("missing paymentHash", { status: 400 });
    }

    // Look up merchant_order by payment hash — must be awaiting_payment
    const { data: merchantOrder, error: moErr } = await supabase
      .from("merchant_orders")
      .select("id, order_id, bolt11_payment_hash, status")
      .eq("bolt11_payment_hash", paymentHash)
      .eq("status", "awaiting_payment")
      .maybeSingle();

    if (moErr) {
      console.error("merchant_orders lookup error:", moErr);
      return new Response("db error", { status: 500 });
    }

    if (!merchantOrder) {
      console.warn("No awaiting_payment row for paymentHash:", paymentHash, "— duplicate delivery or unknown hash, returning 200");
      return new Response("ok", { status: 200 });
    }

    const orderId = merchantOrder.order_id;

    // Update merchant_orders
    const { error: moUpdateErr } = await supabase
      .from("merchant_orders")
      .update({
        status: "pending",
        payment_status: "paid",
        paid_at: new Date().toISOString(),
      })
      .eq("id", merchantOrder.id);

    if (moUpdateErr) {
      console.error("merchant_orders update error:", moUpdateErr);
      return new Response("db error", { status: 500 });
    }

    // Update orders
    const { error: orderUpdateErr } = await supabase
      .from("orders")
      .update({
        status: "confirmed",
        payment_status: "paid",
        settled_sats: settlementAmount,
        routing_fee_sats: settlementFee,
        bolt11_invoice: null,
        settled_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (orderUpdateErr) {
      console.error("orders update error:", orderUpdateErr);
      return new Response("db error", { status: 500 });
    }

    console.log("blink-webhook v12: order", orderId, "settled —", settlementAmount, "sats, fee", settlementFee, "sats");
    return new Response("ok", { status: 200 });

  } catch (err) {
    console.error("blink-webhook v12 unhandled error:", err);
    return new Response("error", { status: 500 });
  }
});
