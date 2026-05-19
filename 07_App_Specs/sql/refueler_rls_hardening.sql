-- ============================================================
-- REFUELER — RLS Hardening
-- Run in: Supabase SQL Editor → New query
-- Covers: sessions, log_entries, walk_stats (original 3 tables)
-- Plus: user_profiles source column, orders RLS verify
-- ============================================================

-- ============================================================
-- 1. SESSIONS
-- ============================================================
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Anon can read (Command Centre dashboard, unauthenticated view)
CREATE POLICY "anon_read_sessions"
  ON sessions FOR SELECT
  USING (true);

-- Only authenticated users can insert sessions
CREATE POLICY "auth_insert_sessions"
  ON sessions FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Only authenticated users can update sessions
CREATE POLICY "auth_update_sessions"
  ON sessions FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- ============================================================
-- 2. LOG_ENTRIES
-- ============================================================
ALTER TABLE log_entries ENABLE ROW LEVEL SECURITY;

-- Anon can read log entries (walk stats, Command Centre)
CREATE POLICY "anon_read_log_entries"
  ON log_entries FOR SELECT
  USING (true);

-- Only authenticated users can insert log entries
CREATE POLICY "auth_insert_log_entries"
  ON log_entries FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Only authenticated users can update log entries
CREATE POLICY "auth_update_log_entries"
  ON log_entries FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- ============================================================
-- 3. WALK_STATS
-- ============================================================
ALTER TABLE walk_stats ENABLE ROW LEVEL SECURITY;

-- Anon can read walk stats (Command Centre live tiles)
CREATE POLICY "anon_read_walk_stats"
  ON walk_stats FOR SELECT
  USING (true);

-- Walk stats are written by trigger function only (SECURITY DEFINER)
-- No direct insert/update policy needed for anon or auth users
-- The trigger runs as the table owner and bypasses RLS automatically

-- ============================================================
-- 4. ORDERS — verify existing RLS is correct
-- (already enabled in Session 5 — this just confirms and fills gaps)
-- ============================================================

-- Anon can insert orders (delivery confirmation from locate screen)
-- Already exists from Session 5 — skip if already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'orders' AND policyname = 'anon_insert_orders'
  ) THEN
    CREATE POLICY "anon_insert_orders"
      ON orders FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;

-- Auth users can read orders (Command Centre revenue view)
-- Already exists from Session 5 — skip if already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'orders' AND policyname = 'auth_read_orders'
  ) THEN
    CREATE POLICY "auth_read_orders"
      ON orders FOR SELECT
      USING (auth.uid() IS NOT NULL);
  END IF;
END $$;

-- Auth users can update their own orders (status changes)
CREATE POLICY "auth_update_own_orders"
  ON orders FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================
-- 5. USER_PROFILES — add source column for signup tracking
-- ============================================================
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS
  signup_source text DEFAULT 'unknown';
  -- Values: 'homepage' | 'invite' | 'partner_onboarding' | 'magic_link_direct' | 'unknown'

COMMENT ON COLUMN user_profiles.signup_source IS
  'How the user arrived: homepage | invite | partner_onboarding | magic_link_direct | unknown';

-- ============================================================
-- 6. REVENUE VIEWS — confirm accessible to auth users only
-- Views inherit RLS from their underlying tables.
-- revenue_totals and revenue_by_session both query orders table
-- which has auth_read_orders policy — so they are already protected.
-- No additional policy needed on the views themselves.
-- ============================================================

-- ============================================================
-- VERIFY — check all RLS is enabled
-- ============================================================
SELECT
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('sessions', 'log_entries', 'walk_stats', 'orders', 'user_profiles')
ORDER BY tablename;

-- Check all policies are in place
SELECT
  tablename,
  policyname,
  cmd AS operation,
  qual AS using_expression
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('sessions', 'log_entries', 'walk_stats', 'orders', 'user_profiles')
ORDER BY tablename, cmd;
