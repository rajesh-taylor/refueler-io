// verify-pin v2 — Refueler Edge Function
// Verifies staff or owner PIN against bcrypt hash stored in merchant_users.
// Called by merchant terminal after magic-link auth. verify_jwt: false — JWT validated manually.
//
// POST { pin_type: "staff" | "owner", pin: "1234" }
// Returns { valid: true } or { valid: false }
// Returns 429 if rate limit exceeded (5 attempts per 5-minute window per user_id)
//
// Rate limit map is in-memory — resets on cold start.
// Hardening note (post-Sim-Close): replace with Redis or Supabase KV when available
// to survive cold starts and scale across multiple Edge Function instances.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import bcrypt from 'npm:bcryptjs@2.4.3';

const SUPABASE_URL      = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SERVICE_ROLE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const RATE_LIMIT_MAX     = 5;
const RATE_LIMIT_WINDOW  = 5 * 60 * 1000; // 5 minutes in ms

// In-memory rate limit store: user_id → { count, windowStart }
const rateLimitStore = new Map<string, { count: number; windowStart: number }>();

function checkRateLimit(userId: string): { allowed: boolean } {
  const now   = Date.now();
  const entry = rateLimitStore.get(userId);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW) {
    rateLimitStore.set(userId, { count: 1, windowStart: now });
    return { allowed: true };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false };
  }

  entry.count++;
  return { allowed: true };
}

function resetRateLimit(userId: string): void {
  rateLimitStore.delete(userId);
}

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // ── 1. Extract and verify JWT ───────────────────────────────────────────────
  const authHeader = req.headers.get('Authorization') ?? '';
  const token      = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Use anon client to verify the user token — getUser() validates signature
  const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data: { user }, error: userError } =
    await anonClient.auth.getUser(token);

  if (userError || !user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const userId = user.id;

  // ── 2. Rate limit check ────────────────────────────────────────────────────
  const { allowed } = checkRateLimit(userId);
  if (!allowed) {
    return new Response(JSON.stringify({ error: 'Too many attempts' }), {
      status: 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // ── 3. Parse request body ──────────────────────────────────────────────────
  let body: { pin_type?: string; pin?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { pin_type, pin } = body;

  if ((pin_type !== 'staff' && pin_type !== 'owner') || typeof pin !== 'string' || pin.length === 0) {
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // ── 4. Fetch bcrypt hash via service role (bypasses RLS) ──────────────────
  const serviceClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const column        = pin_type === 'staff' ? 'staff_pin_bcrypt' : 'owner_pin_bcrypt';

  const { data: rows, error: dbError } = await serviceClient
    .from('merchant_users')
    .select(column)
    .eq('user_id', userId)
    .limit(1);

  if (dbError || !rows || rows.length === 0) {
    return new Response(JSON.stringify({ valid: false }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const storedHash: string | null = rows[0][column] ?? null;

  if (!storedHash) {
    // bcrypt column not yet seeded for this row — fail safe
    return new Response(JSON.stringify({ valid: false }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // ── 5. bcrypt compare ─────────────────────────────────────────────────────
  const valid = await bcrypt.compare(pin, storedHash);

  if (valid) {
    resetRateLimit(userId);
  }

  return new Response(JSON.stringify({ valid }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
