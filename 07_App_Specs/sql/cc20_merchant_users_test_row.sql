-- ============================================================
-- CC-20 Migration B: merchant_users test row
-- Target: Supabase project tihgvdokeofnjxjkenmm
-- Run via: Dashboard → SQL Editor (if apply_migration blocked by FK)
--
-- Context:
--   merchant_users.user_id has FK → auth.users.id
--   This FK blocks direct inserts before the magic link flow completes.
--
--   Strategy: use a DO block to resolve auth.users.id by email.
--   If the magic link has not yet been clicked (auth entry absent),
--   the block exits with RAISE NOTICE rather than throwing an error.
--   Re-run this migration AFTER clicking the first magic link.
--
-- Pins:
--   staff_pin_hash  = SHA-256('2580') = 5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5
--   owner_pin_hash  = SHA-256('1379') = b17ef6d19c7a5b1ee83b907c595526dcb1eb06db8227d650d5dda0a9f4ce8cd9
--
-- Venue lookup:
--   First tries venue_type = 'independent' in venue_partners.
--   Falls back to 'costa-fenchurch-st' as a dev stand-in if no
--   independent venue exists yet.
--   Replace with the real independent merchant_id when first partner
--   is onboarded.
-- ============================================================

DO $$
DECLARE
  v_user_id        uuid;
  v_venue_id       uuid;
  v_target_email   text := 'rt@rajeshtaylor.com';
BEGIN

  -- ── 1. Resolve auth.users entry by email ──────────────────────────────
  -- auth.users is in the auth schema, accessible via service role.
  SELECT id INTO v_user_id
    FROM auth.users
   WHERE email = v_target_email
   LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE NOTICE
      'auth.users entry not found for %. '
      'Magic link has not yet been clicked. '
      'Re-run this migration after first sign-in.',
      v_target_email;
    RETURN;  -- exit cleanly — no error, FK constraint not violated
  END IF;

  -- ── 2. Resolve venue_id ───────────────────────────────────────────────
  -- Prefer an independent venue; fall back to costa-fenchurch-st for dev.
  SELECT id INTO v_venue_id
    FROM venue_partners
   WHERE venue_type = 'independent'
   LIMIT 1;

  IF v_venue_id IS NULL THEN
    -- Dev stand-in: costa-fenchurch-st while no independent partner exists
    SELECT id INTO v_venue_id
      FROM venue_partners
     WHERE merchant_id = 'costa-fenchurch-st'
     LIMIT 1;

    IF v_venue_id IS NULL THEN
      RAISE NOTICE
        'No suitable venue found in venue_partners. '
        'Insert a venue row first, then re-run this migration.';
      RETURN;
    END IF;

    RAISE NOTICE
      'No independent venue found — using costa-fenchurch-st as dev stand-in. '
      'Replace venue_id when first independent partner is onboarded.';
  END IF;

  -- ── 3. Insert merchant_users test row ─────────────────────────────────
  INSERT INTO merchant_users (
    id,
    user_id,
    email,
    role,
    venue_id,
    franchise_group_id,
    staff_pin_hash,
    owner_pin_hash,
    created_at
  )
  VALUES (
    gen_random_uuid(),
    v_user_id,
    v_target_email,
    'independent_owner',          -- role: full OPS/QUEUE access + owner panel
    v_venue_id,
    NULL,                         -- no franchise_group for independent owner
    '5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5', -- SHA-256('2580')
    'b17ef6d19c7a5b1ee83b907c595526dcb1eb06db8227d650d5dda0a9f4ce8cd9', -- SHA-256('1379')
    now()
  )
  ON CONFLICT DO NOTHING;  -- safe to re-run; won't error if row already exists

  RAISE NOTICE
    'merchant_users row inserted for % (user_id: %, venue_id: %)',
    v_target_email, v_user_id, v_venue_id;

END $$;
