-- ─── CC-02: merchant_users migration ────────────────────────────────────────
-- Creates the merchant_users table for venue staff authentication.
-- Each row binds a Supabase auth user (email) to a venue_id + role.
-- 
-- This table is the production auth path. Fallback: contact_email on venue_partners.
-- Run in Supabase SQL Editor against project: tihgvdokeofnjxjkenmm

-- 1. Create table
CREATE TABLE IF NOT EXISTS public.merchant_users (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id     uuid NOT NULL REFERENCES public.venue_partners(id) ON DELETE CASCADE,
  email        text NOT NULL,
  role         text NOT NULL DEFAULT 'staff',
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT merchant_users_role_check CHECK (role IN ('staff', 'manager', 'owner')),
  CONSTRAINT merchant_users_email_check CHECK (email ~* '^[^@]+@[^@]+\.[^@]+$'),
  UNIQUE (email) -- one venue per email; adjust if multi-venue staff needed
);

-- 2. Enable RLS
ALTER TABLE public.merchant_users ENABLE ROW LEVEL SECURITY;

-- 3. Policies
-- Staff can only read their own row
CREATE POLICY "merchant_users_own_read"
  ON public.merchant_users
  FOR SELECT
  TO authenticated
  USING (email = auth.email());

-- Refueler admin can read all rows
CREATE POLICY "merchant_users_admin_read"
  ON public.merchant_users
  FOR SELECT
  TO authenticated
  USING (auth.email() ILIKE '%@refueler.io');

-- Refueler admin can insert/update/delete
CREATE POLICY "merchant_users_admin_write"
  ON public.merchant_users
  FOR ALL
  TO authenticated
  USING (auth.email() ILIKE '%@refueler.io')
  WITH CHECK (auth.email() ILIKE '%@refueler.io');

-- 4. Index on email for fast lookup at login
CREATE INDEX IF NOT EXISTS merchant_users_email_idx ON public.merchant_users (email);

-- 5. Index on venue_id for queue scoping
CREATE INDEX IF NOT EXISTS merchant_users_venue_idx ON public.merchant_users (venue_id);

-- 6. updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'set_merchant_users_updated_at'
      AND tgrelid = 'public.merchant_users'::regclass
  ) THEN
    CREATE TRIGGER set_merchant_users_updated_at
      BEFORE UPDATE ON public.merchant_users
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

-- 7. Seed example rows (comment out before running in production)
-- INSERT INTO public.merchant_users (venue_id, email, role)
-- VALUES
--   ('REPLACE_WITH_REAL_UUID', 'manager@costafenchurchst.example', 'manager'),
--   ('REPLACE_WITH_REAL_UUID', 'staff@monikercoffe.example', 'staff');

-- ─── End of migration ─────────────────────────────────────────────────────────
