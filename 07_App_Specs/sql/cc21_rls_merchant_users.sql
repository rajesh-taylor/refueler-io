-- CC-21 — Re-enable RLS on merchant_users with correct authenticated policy
-- Apply via: Supabase MCP → apply_migration (project: tihgvdokeofnjxjkenmm)

-- 1. Re-enable Row Level Security
ALTER TABLE merchant_users ENABLE ROW LEVEL SECURITY;

-- 2. Drop any stale/permissive policies from the CC-20c unblock
DROP POLICY IF EXISTS "allow_all_merchant_users" ON merchant_users;
DROP POLICY IF EXISTS "temp_disable_rls"         ON merchant_users;

-- 3. Authenticated users can only read their own row
--    auth.uid() matches merchant_users.user_id — the FK to auth.users
CREATE POLICY "merchant_users_self_read"
  ON merchant_users
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 4. No direct INSERT/UPDATE/DELETE from the client — all mutations go via
--    service-role edge functions. No additional policies needed.

-- Verification query (run via execute_sql after applying):
-- SELECT policyname, cmd, roles, qual FROM pg_policies WHERE tablename = 'merchant_users';
