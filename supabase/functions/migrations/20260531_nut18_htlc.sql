-- Refueler — NUT-14 HTLC Order Escrow
-- Session 18 · supabase/migrations/20260531_nut18_htlc.sql
--
-- Wallet-side enforcement model:
--   The user's Minibits wallet monitors the HTLC and claims the refund
--   after expiry. Refueler's backend is passive — we record the secret
--   and expiry for audit, surface expired status to the UI, but never
--   trigger or arbitrate the refund.
--
-- Open: confirm with Minibits whether ippon supports wallet-side claiming
--   and what the claim window is post-expiry.

-- ---------------------------------------------------------------------------
-- 1. Extend nut18_orders with HTLC columns
-- ---------------------------------------------------------------------------

ALTER TABLE nut18_orders
  ADD COLUMN IF NOT EXISTS htlc_lock_secret  TEXT,
  ADD COLUMN IF NOT EXISTS htlc_expiry       TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS htlc_status       TEXT
    CHECK (htlc_status IN ('locked', 'fulfilled', 'expired', 'refunded'))
    DEFAULT 'locked';

COMMENT ON COLUMN nut18_orders.htlc_lock_secret IS
  'SHA-256 preimage used to lock the NUT-14 HTLC token. '
  'Stored for audit only. Never transmitted after payment. '
  'Wallet holds the preimage; refund is wallet-side on expiry.';

COMMENT ON COLUMN nut18_orders.htlc_expiry IS
  'UTC timestamp when the HTLC timeout fires. '
  'Derived from venues.htlc_timeout_seconds at order creation time. '
  'Default: payment time + 480s.';

COMMENT ON COLUMN nut18_orders.htlc_status IS
  'locked    — HTLC active, awaiting venue fulfilment
   fulfilled — venue claimed the token (order collected)
   expired   — timeout fired; wallet-side refund claimable
   refunded  — user wallet confirmed refund claimed (optional signal)';

-- ---------------------------------------------------------------------------
-- 2. Extend order status enum to include expired
-- ---------------------------------------------------------------------------
-- nut18_orders.status existing values: pending | paid | fulfilled | collected
-- | error | keyset_error
-- Add: expired

DO $$
BEGIN
  -- Only alter if the constraint exists and 'expired' is not already there
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'order_status' AND e.enumlabel = 'expired'
  ) THEN
    -- If status is a plain TEXT column with a CHECK constraint rather than
    -- an enum type, update the CHECK constraint instead.
    -- This migration assumes TEXT + CHECK; adjust if using a pg enum type.
    NULL;
  END IF;
END $$;

-- If status is TEXT with CHECK constraint, drop and recreate it:
ALTER TABLE nut18_orders
  DROP CONSTRAINT IF EXISTS nut18_orders_status_check;

ALTER TABLE nut18_orders
  ADD CONSTRAINT nut18_orders_status_check
    CHECK (status IN (
      'pending', 'paid', 'fulfilled', 'collected',
      'expired', 'error', 'keyset_error'
    ));

-- ---------------------------------------------------------------------------
-- 3. Index — efficient expiry sweep for background job (future)
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_nut18_orders_htlc_expiry
  ON nut18_orders (htlc_expiry)
  WHERE htlc_status = 'locked';

-- ---------------------------------------------------------------------------
-- 4. Row count assertion (mirrors Session 17 pattern)
-- ---------------------------------------------------------------------------

DO $$
DECLARE col_count INT;
BEGIN
  SELECT COUNT(*) INTO col_count
  FROM information_schema.columns
  WHERE table_name = 'nut18_orders'
    AND column_name IN ('htlc_lock_secret', 'htlc_expiry', 'htlc_status');

  IF col_count <> 3 THEN
    RAISE EXCEPTION 'NUT-14 migration incomplete — expected 3 new columns, found %', col_count;
  END IF;
END $$;
