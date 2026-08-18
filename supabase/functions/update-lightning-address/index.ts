// update-lightning-address v1 — Refueler Edge Function
// Allows an authenticated merchant (independent_owner) to update their venue's
// Lightning address from the Owner tab on the merchant terminal.
//
// Security model:
//   - JWT is validated server-side via getUser() (verify_jwt: true on deploy)
//   - Owner PIN is verified server-side via bcrypt (same bcryptjs pattern as verify-pin v2)
//   - venue_id is derived from the authenticated user — never accepted from the request body
//   - Write uses service_role (authenticated role blocked from lightning_address by S-27, CC-97)
//   - New address is reachability-checked via LNURL-pay step 1 before any write (fail-closed)
//   - Post-write: re-select confirms stored value matches what was written (rule 4j)
//
// Rate limit: 5 attempts per 5-minute window per user_id (in-memory, resets on cold start)
//
// POST { owner_pin: string, lightning_address: string }
// Returns { ok: true, lightning_address: string } on success
// Returns { ok: false, error: 'invalid_pin' | 'unresolvable_address' | string } on failure
//
// User Guide update — flagged for September:
//   After saving a new Lightning address, the AM sends 21 sats from Blink to confirm
//   the address is live before the next real order. On-chain address changes are [R] only.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import bcrypt from 'npm:bcryptjs@2.4.3';

const SUPABASE_URL     = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SERVICE_ROLE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const RATE_LIMIT_MAX    = 5;
const RATE_LIMIT_WINDOW = 5 * 60 * 1000; // 5 minutes in ms
const LNURL_TIMEOUT_MS  = 5000;

// In-memory rate limit store: user_id → { count, windowStart }
const rateLimitStore = new Map<string, { count: number; windowStart: number }>();

function checkRateLimit(userId: string): boolean {
  const now   = Date.now();
  const entry = rateLimitStore.get(userId);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW) {
    rateLimitStore.set(userId, { count: 1, windowStart: now });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

function resetRateLimit(userId: string): void {
  rateLimitStore.delete(userId);
}

// Validate and normalise a Lightning address, then check LNURL-pay step 1 reachability.
// Returns the normalised address on success; throws a descriptive error on failure.
async function validateAndCheckAddress(raw: string): Promise<string> {
  const addr = raw.trim().toLowerCase();
  const parts = addr.split('@');

  if (parts.length !== 2 || !parts[0] || !parts[1] || !parts[1].includes('.')) {
    throw new Error('Address must be in user@domain format');
  }

  const [user, domain] = parts;
  const metaUrl = `https://${domain}/.well-known/lnurlp/${user}`;

  let meta: Record<string, unknown>;
  try {
    const controller = new AbortController();
    const timeout    = setTimeout(() => controller.abort(), LNURL_TIMEOUT_MS);
    const res = await fetch(metaUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`LNURL metadata returned HTTP ${res.status} — address may not exist`);
    }

    meta = await res.json();
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(`LNURL check timed out after ${LNURL_TIMEOUT_MS / 1000}s — confirm the address is reachable`);
    }
    throw err;
  }

  if (meta.status === 'ERROR') {
    throw new Error(`LNURL error from provider: ${meta.reason ?? 'unknown'}`);
  }

  if (!meta.callback) {
    throw new Error(`LNURL response from ${domain} has no callback — address may be misconfigured`);
  }

  return addr;
}

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== 'POST')    return json({ error: 'Method not allowed' }, 405);

  // ── 1. JWT validation ────────────────────────────────────────────────────────
  const authHeader = req.headers.get('Authorization') ?? '';
  const token      = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) return json({ error: 'Unauthorized' }, 401);

  const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data: { user }, error: userError } = await anonClient.auth.getUser(token);

  if (userError || !user?.id) return json({ error: 'Unauthorized' }, 401);

  const userId = user.id;

  // ── 2. Rate limit ────────────────────────────────────────────────────────────
  if (!checkRateLimit(userId)) {
    return json({ error: 'Too many attempts. Wait 5 minutes and try again.' }, 429);
  }

  // ── 3. Parse body ────────────────────────────────────────────────────────────
  let body: { owner_pin?: string; lightning_address?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const { owner_pin, lightning_address } = body;

  if (typeof owner_pin !== 'string' || owner_pin.length === 0) {
    return json({ error: 'owner_pin required' }, 400);
  }
  if (typeof lightning_address !== 'string' || lightning_address.trim().length === 0) {
    return json({ error: 'lightning_address required' }, 400);
  }

  // ── 4. Resolve venue_id and owner_pin_bcrypt from authenticated user ─────────
  // Never accept venue_id from the caller — derive it from the auth chain.
  const serviceClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const { data: merchantRow, error: merchantErr } = await serviceClient
    .from('merchant_users')
    .select('venue_id, owner_pin_bcrypt')
    .eq('user_id', userId)
    .limit(1)
    .single();

  if (merchantErr || !merchantRow) {
    console.error('[update-lightning-address] merchant_users lookup failed:', merchantErr);
    return json({ error: 'Merchant account not found' }, 404);
  }

  const { venue_id, owner_pin_bcrypt } = merchantRow;

  if (!owner_pin_bcrypt) {
    // Owner PIN not yet seeded for this merchant — fail safe
    console.warn('[update-lightning-address] owner_pin_bcrypt not set for user:', userId);
    return json({ ok: false, error: 'Owner PIN not configured. Contact support.' }, 409);
  }

  // ── 5. Verify Owner PIN via bcrypt ───────────────────────────────────────────
  const pinValid = await bcrypt.compare(owner_pin, owner_pin_bcrypt);

  if (!pinValid) {
    console.warn('[update-lightning-address] Invalid owner PIN attempt for user:', userId);
    return json({ ok: false, error: 'invalid_pin' }, 200);
  }

  // PIN verified — reset rate limit (mirrors verify-pin v2 behaviour)
  resetRateLimit(userId);

  // ── 6. Validate and reachability-check the new Lightning address ──────────────
  let normalisedAddress: string;
  try {
    normalisedAddress = await validateAndCheckAddress(lightning_address);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.warn('[update-lightning-address] Address validation failed:', detail);
    return json({ ok: false, error: 'unresolvable_address', detail }, 200);
  }

  // ── 7. Write via service_role ────────────────────────────────────────────────
  // authenticated role is blocked from writing lightning_address by S-27 (CC-97)
  const { error: updateErr } = await serviceClient
    .from('venue_partners')
    .update({ lightning_address: normalisedAddress })
    .eq('id', venue_id);

  if (updateErr) {
    console.error('[update-lightning-address] venue_partners update failed:', updateErr);
    return json({ error: 'Failed to update Lightning address', detail: updateErr.message }, 500);
  }

  // ── 8. Post-write verification (rule 4j) ────────────────────────────────────
  const { data: confirmed, error: confirmErr } = await serviceClient
    .from('venue_partners')
    .select('lightning_address')
    .eq('id', venue_id)
    .single();

  if (confirmErr || confirmed?.lightning_address !== normalisedAddress) {
    console.error('[update-lightning-address] Post-write verification failed. Stored:',
      confirmed?.lightning_address, 'Expected:', normalisedAddress);
    return json({ error: 'Write verification failed — contact support' }, 500);
  }

  console.log(`[update-lightning-address] v1 success user=${userId} venue=${venue_id} address=${normalisedAddress}`);

  return json({ ok: true, lightning_address: normalisedAddress });
});
