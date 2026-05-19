-- ─────────────────────────────────────────────────────────────────
-- REFUELER — user_profiles schema
-- Session 4 · Task 3
-- Run in Supabase SQL editor at:
-- https://tihgvdokeofnjxjkenmm.supabase.co
-- ─────────────────────────────────────────────────────────────────

-- Profiles table — one row per auth user
CREATE TABLE IF NOT EXISTS user_profiles (
  id                  uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name        text,
  payment_preference  text NOT NULL DEFAULT 'fiat'
                        CHECK (payment_preference IN ('fiat', 'sats', 'hybrid')),
  lightning_address   text,
  minibits_wallet_id  text,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS user_profiles_updated_at ON user_profiles;
CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create a profile row when a new auth user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── RLS ─────────────────────────────────────────────────
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile only
CREATE POLICY "profile_select_own"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile only
CREATE POLICY "profile_update_own"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Service role (admin) can read all profiles
-- (no extra policy needed — service role bypasses RLS)

-- ─── NOTES ───────────────────────────────────────────────
-- payment_preference drives Session 5 handover screen:
--   'fiat'   → M&S green locate screen
--   'sats'   → Bitcoin orange (#F7931A) locate screen
--   'hybrid' → M&S green locate, sats revenue counter visible
--
-- lightning_address    → e.g. user@getalby.com   (Session 5 routing)
-- minibits_wallet_id   → Minibits cashu wallet ID (Session 5 ecash)
