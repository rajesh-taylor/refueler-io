-- ============================================================
-- CC-20 Migration C: orders.payment_processor default → 'blink'
-- Target: Supabase project tihgvdokeofnjxjkenmm
-- Run via: Dashboard → SQL Editor or apply_migration MCP call
--
-- Context:
--   orders.payment_processor DEFAULT was set to 'zebedee' at table
--   creation (pre-CC-10 ZBD era). ZBD was permanently replaced by
--   Blink in CC-10. This migration corrects the schema drift flagged
--   in CC-17.
--
-- Effect:
--   1. Alters the column default — affects future inserts only.
--   2. Updates orphan rows (payment_ref IS NULL) from 'zebedee'
--      to 'blink' — these are test rows with no real ZBD transaction.
--   3. Any 'zebedee' row with a non-null payment_ref is LEFT UNTOUCHED
--      and flagged via RAISE NOTICE for manual review.
--      The 1 known test row falls into this category if it has a
--      payment_ref attached — inspect it manually before deciding
--      whether to update or leave as historical record.
--
-- Safe to re-run: ALTER COLUMN DEFAULT is idempotent; UPDATE affects
-- only rows matching the WHERE clause.
-- ============================================================

BEGIN;

-- ── 1. Change column default ──────────────────────────────────────────────
ALTER TABLE orders
  ALTER COLUMN payment_processor SET DEFAULT 'blink';

-- ── 2. Update orphan rows (no real ZBD transaction attached) ─────────────
UPDATE orders
   SET payment_processor = 'blink'
 WHERE payment_processor = 'zebedee'
   AND payment_ref IS NULL;

-- ── 3. Flag any remaining 'zebedee' rows for manual review ────────────────
DO $$
DECLARE
  v_count integer;
BEGIN
  SELECT COUNT(*) INTO v_count
    FROM orders
   WHERE payment_processor = 'zebedee'
     AND payment_ref IS NOT NULL;

  IF v_count > 0 THEN
    RAISE NOTICE
      '% order(s) have payment_processor = ''zebedee'' with a non-null payment_ref. '
      'These have NOT been updated — review manually before changing. '
      'Run: SELECT id, payment_ref, created_at FROM orders WHERE payment_processor = ''zebedee'' AND payment_ref IS NOT NULL;',
      v_count;
  ELSE
    RAISE NOTICE 'No zebedee rows with attached payment_ref found — migration clean.';
  END IF;
END $$;

COMMIT;
