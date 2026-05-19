/**
 * REFUELER — Supabase Edge Function: darwin-webhook
 * Path: supabase/functions/darwin-webhook/index.ts
 *
 * Receives POST from Darwin bridge service.
 * Validates event → checks delay threshold → queries eligible users →
 * fires Web Push notifications → logs to rail_movement_log.
 *
 * Environment variables (set in Supabase dashboard → Edge Functions → Secrets):
 *   VAPID_PUBLIC_KEY    — generated with: npx web-push generate-vapid-keys
 *   VAPID_PRIVATE_KEY
 *   VAPID_SUBJECT       — mailto:rt@rajeshtaylor.com
 *   SUPABASE_SERVICE_KEY — service role key (already available as SUPABASE_SERVICE_ROLE_KEY)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import webpush from 'https://esm.sh/web-push@3.6.7';

// ── Constants ──────────────────────────────────────────────────────────────────

const DELAY_SUPPRESS_MINS = 10;  // suppress notification if train delayed more than this

const LEAD_TIMES: Record<string, number> = {
  LIM: 4,
  WHA: 8,
  GRY: 38,
  PFL: 32,
  UPM: 22,
  SOC: 65,
};

const NOTIFICATION_COPY: Record<string, { title: string; body: string }> = {
  LIM: {
    title: '⚡ Order ahead — 4 mins to Fenchurch St',
    body:  'Tap to order your coffee now. It\'ll be waiting when you arrive.',
  },
  WHA: {
    title: '⚡ Order ahead — 8 mins to Fenchurch St',
    body:  'Your train departs West Ham. Order now from Costa or Pret.',
  },
  GRY: {
    title: '⚡ Order ahead — 38 mins to Fenchurch St',
    body:  'Departing Grays. Order coffee for your arrival at Fenchurch Street.',
  },
  PFL: {
    title: '⚡ Order ahead — 32 mins to Fenchurch St',
    body:  'Departing Purfleet. Order ahead and skip the queue at Fenchurch Street.',
  },
  UPM: {
    title: '⚡ Order ahead — 22 mins to Fenchurch St',
    body:  'Departing Upminster. Your coffee will be ready on arrival.',
  },
  SOC: {
    title: '⚡ Order ahead — 65 mins to Fenchurch St',
    body:  'Departing Southend. Order now and collect from Fenchurch Street.',
  },
};

// ── Supabase client ────────────────────────────────────────────────────────────

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// ── VAPID setup ────────────────────────────────────────────────────────────────

function initVapid() {
  const pub     = Deno.env.get('VAPID_PUBLIC_KEY');
  const priv    = Deno.env.get('VAPID_PRIVATE_KEY');
  const subject = Deno.env.get('VAPID_SUBJECT');

  if (!pub || !priv || !subject) {
    throw new Error('VAPID keys not set. Run: npx web-push generate-vapid-keys');
  }

  webpush.setVapidDetails(subject, pub, priv);
}

// ── Push notification sender ───────────────────────────────────────────────────

async function sendPush(subscription: object, payload: object): Promise<boolean> {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    return true;
  } catch (err: any) {
    // 410 Gone = subscription expired / user unsubscribed
    if (err.statusCode === 410) {
      console.warn('[WEBHOOK] Push subscription expired — should be pruned');
    } else {
      console.error('[WEBHOOK] Push send error:', err.message);
    }
    return false;
  }
}

// ── Main handler ───────────────────────────────────────────────────────────────

serve(async (req: Request) => {
  // Auth: check bearer matches service key
  const auth = req.headers.get('Authorization') || '';
  if (!auth.startsWith('Bearer ') || auth.slice(7) !== Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')) {
    return new Response('Unauthorized', { status: 401 });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  let event: any;
  try {
    event = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  const {
    train_uid,
    operator,
    trigger_crs,
    destination_crs,
    departure_ts,
    delay_mins = 0,
    carriage_count,
    lead_time_mins,
    raw_event,
  } = event;

  // ── Validate ────────────────────────────────────────────────────────────────

  if (!train_uid || !trigger_crs) {
    return new Response('Missing train_uid or trigger_crs', { status: 400 });
  }

  const logBase = {
    train_uid,
    operator,
    event_type:     'DEPARTURE',
    crs_code:       trigger_crs,
    actual_ts:      departure_ts,
    delay_mins,
    carriage_count: carriage_count || null,
    raw_payload:    raw_event || null,
  };

  // ── Delay threshold check ───────────────────────────────────────────────────

  if (delay_mins > DELAY_SUPPRESS_MINS) {
    console.log(`[WEBHOOK] Suppressing — delay ${delay_mins}m > threshold ${DELAY_SUPPRESS_MINS}m`);
    await supabase.from('rail_movement_log').insert({
      ...logBase,
      suppressed:     true,
      suppress_reason: 'DELAY_THRESHOLD',
      notification_fired: false,
    });
    return new Response(JSON.stringify({ suppressed: true, reason: 'DELAY_THRESHOLD' }), { status: 200 });
  }

  // ── Find eligible users ─────────────────────────────────────────────────────
  // Users who:
  //   1. Have a push_subscription stored
  //   2. Have a preferred route matching trigger_crs → destination_crs
  //   3. Have NOT already placed an order for this train_uid

  // For MVP: notify all users with a push_subscription and no existing order for this train
  // Phase 2: add per-user route preference matching

  const { data: profiles, error: profileErr } = await supabase
    .from('user_profiles')
    .select('id, push_subscription')
    .not('push_subscription', 'is', null);

  if (profileErr) {
    console.error('[WEBHOOK] Profile query error:', profileErr.message);
    await supabase.from('rail_movement_log').insert({ ...logBase, notification_fired: false });
    return new Response('DB error', { status: 500 });
  }

  // Filter out users who already ordered for this train
  const { data: existingOrders } = await supabase
    .from('rail_orders')
    .select('user_id')
    .eq('darwin_train_uid', train_uid)
    .neq('status', 'CANCELLED');

  const alreadyOrderedUserIds = new Set((existingOrders || []).map((o: any) => o.user_id));
  const eligibleProfiles = (profiles || []).filter((p: any) => !alreadyOrderedUserIds.has(p.id));

  if (eligibleProfiles.length === 0) {
    console.log(`[WEBHOOK] No eligible users for train ${train_uid}`);
    await supabase.from('rail_movement_log').insert({
      ...logBase,
      notification_fired: false,
      suppressed: false,
    });
    return new Response(JSON.stringify({ eligible: 0 }), { status: 200 });
  }

  // ── Build notification payload ──────────────────────────────────────────────

  initVapid();

  const copy = NOTIFICATION_COPY[trigger_crs] || {
    title: '⚡ Order ahead',
    body:  `Your train departs ${trigger_crs}. Order coffee for Fenchurch Street.`,
  };

  const estimatedArrival = new Date(Date.now() + (lead_time_mins || LEAD_TIMES[trigger_crs] || 10) * 60 * 1000);

  const notifPayload = {
    title:              copy.title,
    body:               copy.body,
    order_url:          `https://refueler.io/order?train=${train_uid}&from=${trigger_crs}&to=${destination_crs}`,
    train_uid,
    trigger_crs,
    destination_crs,
    estimated_arrival:  estimatedArrival.toISOString(),
    lead_time_mins:     lead_time_mins || LEAD_TIMES[trigger_crs],
  };

  // ── Send pushes ─────────────────────────────────────────────────────────────

  let fired = 0;
  await Promise.all(
    eligibleProfiles.map(async (profile: any) => {
      const ok = await sendPush(profile.push_subscription, notifPayload);
      if (ok) fired++;
    })
  );

  console.log(`[WEBHOOK] train=${train_uid} crs=${trigger_crs} eligible=${eligibleProfiles.length} fired=${fired}`);

  // ── Log to rail_movement_log ─────────────────────────────────────────────────

  await supabase.from('rail_movement_log').insert({
    ...logBase,
    notification_fired:  fired > 0,
    orders_triggered:    0,  // updated later when orders are actually placed
    suppressed:          false,
  });

  return new Response(JSON.stringify({ fired, eligible: eligibleProfiles.length }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
