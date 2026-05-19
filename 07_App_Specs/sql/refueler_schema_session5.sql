-- ============================================================
-- REFUELER — Session 5 Schema Additions
-- Run in: Supabase SQL Editor → New query
-- Adds: orders table, revenue view, RLS policies for admin
-- ============================================================

-- ============================================================
-- TABLE: orders
-- One row per completed delivery / commission event
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id              TEXT REFERENCES sessions(session_id) ON DELETE SET NULL,
  user_id                 UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  partner                 TEXT NOT NULL,                       -- 'M&S Café' | 'Costa' | etc.
  bay_label               TEXT,                               -- 'Bay 1A' | 'Bay 4D' etc.
  order_value_gbp         NUMERIC(8,2),
  commission_pct          NUMERIC(4,2) DEFAULT 15.0,
  commission_gbp          NUMERIC(8,2),                       -- order_value_gbp * commission_pct / 100
  commission_sats         BIGINT,                             -- commission_gbp converted at settlement rate
  sats_rate               NUMERIC(12,2),                      -- GBP/sats rate at settlement moment
  reward_type             TEXT DEFAULT 'sats',                -- 'sats' | 'giftcard' | 'none'
  reward_sats             BIGINT,                             -- 1% of order value in sats (default)
  reward_giftcard_value_gbp NUMERIC(8,2),                     -- if reward_type = 'giftcard'
  handover_method         TEXT,                               -- 'nfc' | 'qr' | 'manual'
  payment_processor       TEXT DEFAULT 'zebedee',
  payment_ref             TEXT,                               -- Zebedee charge ID / payment ref
  zebedee_charge_id       TEXT,
  settled_at              TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for Command Centre revenue queries
CREATE INDEX IF NOT EXISTS idx_orders_session_id ON orders(session_id);
CREATE INDEX IF NOT EXISTS idx_orders_settled_at ON orders(settled_at);
CREATE INDEX IF NOT EXISTS idx_orders_partner    ON orders(partner);
CREATE INDEX IF NOT EXISTS idx_orders_user_id    ON orders(user_id);

-- ============================================================
-- VIEW: revenue_by_session
-- Powers the Command Centre revenue breakdown tiles
-- Returns per-session revenue totals in GBP + sats
-- ============================================================
CREATE OR REPLACE VIEW revenue_by_session AS
SELECT
  o.session_id,
  s.site_name,
  DATE(o.settled_at)             AS session_date,
  COUNT(*)                       AS order_count,
  SUM(o.commission_gbp)          AS total_commission_gbp,
  SUM(o.commission_sats)         AS total_commission_sats,
  SUM(o.reward_sats)             AS total_reward_sats_issued,
  MAX(o.settled_at)              AS last_settlement
FROM orders o
LEFT JOIN sessions s ON s.session_id = o.session_id
WHERE o.settled_at IS NOT NULL
GROUP BY o.session_id, s.site_name, DATE(o.settled_at)
ORDER BY session_date DESC;

-- ============================================================
-- VIEW: revenue_totals
-- Single-row running total for Command Centre stat tiles
-- ============================================================
CREATE OR REPLACE VIEW revenue_totals AS
SELECT
  COUNT(*)                       AS total_orders,
  COALESCE(SUM(commission_gbp),  0) AS total_commission_gbp,
  COALESCE(SUM(commission_sats), 0) AS total_commission_sats,
  COALESCE(SUM(reward_sats),     0) AS total_reward_sats_issued
FROM orders
WHERE settled_at IS NOT NULL;

-- ============================================================
-- FUNCTION: compute_commission
-- Auto-fills commission_gbp on insert if not provided
-- ============================================================
CREATE OR REPLACE FUNCTION compute_order_commission()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.commission_gbp IS NULL AND NEW.order_value_gbp IS NOT NULL AND NEW.commission_pct IS NOT NULL THEN
    NEW.commission_gbp := ROUND(NEW.order_value_gbp * NEW.commission_pct / 100.0, 2);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER orders_compute_commission
BEFORE INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION compute_order_commission();

-- ============================================================
-- ROW-LEVEL SECURITY — orders table
-- Anon (field app / locate screen): can INSERT only
-- Authenticated admin: full SELECT
-- ============================================================
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Partners/runners can insert orders (delivery confirmation hook)
CREATE POLICY "anon_insert_orders"
  ON orders FOR INSERT
  WITH CHECK (true);

-- Only authenticated users can read revenue data
-- (Command Centre admin view — filtered in app by role check)
CREATE POLICY "auth_read_orders"
  ON orders FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- ============================================================
-- SAMPLE DATA — test revenue tiles in Command Centre
-- Remove / comment out before going live
-- ============================================================
/*
INSERT INTO orders (session_id, partner, bay_label, order_value_gbp, commission_pct, commission_gbp, commission_sats, sats_rate, reward_type, reward_sats, handover_method, settled_at)
VALUES
  ('S4F2A', 'M&S Café', 'Bay 1A', 4.50, 15.0, 0.675, 2934, 4347826.09, 'sats', 1957, 'nfc', now() - interval '2 hours'),
  ('S4F2A', 'M&S Café', 'Bay 1A', 3.85, 15.0, 0.578, 2511, 4347826.09, 'sats', 1674, 'qr',  now() - interval '1 hour 30 minutes'),
  ('S4F2A', 'M&S Café', 'Bay 4D', 5.10, 15.0, 0.765, 3326, 4347826.09, 'sats', 2217, 'nfc', now() - interval '45 minutes')
ON CONFLICT DO NOTHING;
*/

-- ============================================================
-- VERIFY
-- ============================================================
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('sessions', 'log_entries', 'walk_stats', 'orders')
ORDER BY table_name;

SELECT view_name FROM information_schema.views
WHERE table_schema = 'public'
  AND view_name IN ('revenue_by_session', 'revenue_totals');
