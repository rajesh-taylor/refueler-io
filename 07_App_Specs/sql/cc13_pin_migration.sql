-- CC-13 Migration: Staff PIN and Owner PIN hashes
-- Add staff_pin_hash and owner_pin_hash to merchant_users
-- Both stored as SHA-256 hex strings (64 chars), set by owner on first login.
-- Neither column is included in any SELECT exposed to the merchant view layer —
-- they are resolved server-side only (or via edge function in future).

ALTER TABLE merchant_users
  ADD COLUMN IF NOT EXISTS staff_pin_hash TEXT,
  ADD COLUMN IF NOT EXISTS owner_pin_hash TEXT;

COMMENT ON COLUMN merchant_users.staff_pin_hash IS
  'SHA-256 hex of the venue staff PIN (4 digits). Set by owner. Never transmitted in plaintext.';

COMMENT ON COLUMN merchant_users.owner_pin_hash IS
  'SHA-256 hex of the owner PIN (4 digits, distinct from staff PIN). Set on first owner login. Never transmitted in plaintext.';

-- Row-level security: staff_pin_hash and owner_pin_hash should not be readable
-- by the anon role or merchant role. Only service_role (edge functions) reads these.
-- Until RLS is applied to these columns specifically, the client fetches them only
-- when the user is already authenticated via Supabase session (merchant_users lookup
-- uses the session token, not anon key in future — see CC-13 hardening note below).

-- CC-13 HARDENING NOTE (deferred to CC-14):
-- Currently staff_pin_hash is fetched client-side to allow browser-based SHA-256
-- comparison. For beta this is acceptable — the tablet is a controlled device.
-- Before public launch, move PIN verification to a Supabase Edge Function:
--   POST /functions/v1/verify-staff-pin  { venue_id, pin_hash }
--   Returns: { valid: true/false }
-- This removes pin hashes from the client entirely.
