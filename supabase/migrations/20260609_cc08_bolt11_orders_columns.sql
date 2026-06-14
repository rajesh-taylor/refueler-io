-- Refueler — Migration: BOLT11 payment columns
-- CC-08 · Session 16 · 9 June 2026
-- Apply via: supabase db push  OR  Supabase dashboard > SQL editor

-- ===========================================================================
-- 1. orders — add BOLT11 invoice columns
-- ===========================================================================
-- These columns are additive — no existing data affected.
-- bolt11_invoice is nullable so it can be cleared to NULL on settlement (data minimisation).
-- payment_status CHECK constraint enforces valid state machine values.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS bolt11_invoice      text         NULL,
  ADD COLUMN IF NOT EXISTS zebedee_charge_id   text         NULL,
  ADD COLUMN IF NOT EXISTS invoice_expires_at  timestamptz  NULL,
  ADD COLUMN IF NOT EXISTS payment_status      text         NOT NULL DEFAULT 'unpaid',
  ADD COLUMN IF NOT EXISTS sats_amount         integer      NULL,
  ADD COLUMN IF NOT EXISTS settled_at          timestamptz  NULL;

-- Enforce valid payment status values
ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_payment_status_check;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_payment_status_check
    CHECK (payment_status IN ('unpaid', 'paid', 'expired', 'refunded'));

-- Index for webhook correlation (bolt11-webhook looks up by zebedee_charge_id)
CREATE INDEX IF NOT EXISTS idx_orders_zebedee_charge_id
  ON public.orders (zebedee_charge_id);

-- Index for expiry cron sweep (filters unpaid + expired invoices)
CREATE INDEX IF NOT EXISTS idx_orders_invoice_expires_at
  ON public.orders (invoice_expires_at)
  WHERE payment_status = 'unpaid';

-- ===========================================================================
-- 2. merchant_orders — add awaiting_payment to status CHECK
-- ===========================================================================
-- Previous CHECK: pending | preparing | ready | collected | cancelled
-- New CHECK adds: awaiting_payment (pre-payment, hidden from merchant queue view)

ALTER TABLE public.merchant_orders
  DROP CONSTRAINT IF EXISTS merchant_orders_status_check;

ALTER TABLE public.merchant_orders
  ADD CONSTRAINT merchant_orders_status_check
    CHECK (status IN ('awaiting_payment', 'pending', 'preparing', 'ready', 'collected', 'cancelled'));

-- ===========================================================================
-- 3. RLS — ensure merchant SELECT policy excludes awaiting_payment rows
-- ===========================================================================
-- Merchants should not see orders that haven't been paid yet.
-- This DROP + CREATE replaces the existing merchant read policy.
-- Adjust policy name to match your actual policy name if different.

DROP POLICY IF EXISTS "merchant_read_own_venue" ON public.merchant_orders;

CREATE POLICY "merchant_read_own_venue"
  ON public.merchant_orders
  FOR SELECT
  TO authenticated
  USING (
    venue_id = (
      SELECT venue_id
      FROM public.merchant_users
      WHERE user_id = auth.uid()
      LIMIT 1
    )
    AND status != 'awaiting_payment'
  );

-- franchise_hq read policy (unchanged logic, recreated for completeness)
DROP POLICY IF EXISTS "franchise_hq_read_own_group" ON public.merchant_orders;

CREATE POLICY "franchise_hq_read_own_group"
  ON public.merchant_orders
  FOR SELECT
  TO authenticated
  USING (
    venue_id IN (
      SELECT id
      FROM public.venue_partners
      WHERE franchise_group_id = (
        SELECT franchise_group_id
        FROM public.merchant_users
        WHERE user_id = auth.uid()
        LIMIT 1
      )
    )
    AND status != 'awaiting_payment'
  );

-- admin read-all policy (unchanged)
DROP POLICY IF EXISTS "admin_read_all_merchant_orders" ON public.merchant_orders;

CREATE POLICY "admin_read_all_merchant_orders"
  ON public.merchant_orders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.merchant_users
      WHERE user_id = auth.uid()
        AND role = 'admin'
    )
  );

-- ===========================================================================
-- 4. updated_at trigger — ensure merchant_orders.updated_at fires on status change
-- ===========================================================================
-- Only add if not already present from CC-06.

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS merchant_orders_updated_at ON public.merchant_orders;

CREATE TRIGGER merchant_orders_updated_at
  BEFORE UPDATE ON public.merchant_orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ===========================================================================
-- Done.
-- CC-09 candidate: pg_cron sweep for expired unpaid orders.
-- Add when pg_cron extension is confirmed enabled on this project.
-- ===========================================================================
