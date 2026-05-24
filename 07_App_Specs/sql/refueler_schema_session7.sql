-- ============================================================
-- REFUELER — Session 7 Schema
-- Bulk Purchase Verification Layer
-- Run in: Supabase SQL Editor → New query
-- Adds: retailer_locations, bulk_purchases, bulk_config
-- Depends on: Sessions 1–6a schema (auth.users must exist)
-- ============================================================

-- ============================================================
-- TABLE: retailer_locations
-- Registered retail stores where bulk verification is live
-- One row per physical store. Seeded with Costco Lakeside MVP.
-- ============================================================
CREATE TABLE IF NOT EXISTS retailer_locations (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer              TEXT NOT NULL,              -- 'costco' | 'ikea' | 'ms_sparks'
  store_identifier      TEXT NOT NULL,              -- retailer's own store number (from receipt)
  name                  TEXT NOT NULL,              -- human-readable: 'Costco Lakeside'
  lat                   NUMERIC(9,6),
  lng                   NUMERIC(9,6),
  active                BOOL DEFAULT TRUE,
  partner_tier          TEXT DEFAULT 'standard',    -- 'mvp' | 'standard' | 'premium'
  giftcard_enabled      BOOL DEFAULT FALSE,         -- false until API partnership exists
  giftcard_api_endpoint TEXT,                       -- future: partner redemption endpoint
  receipt_barcode_type  TEXT DEFAULT 'CODE_128',    -- 'CODE_128' | 'QR' | 'PDF417' | 'CODE_39'
  membership_barcode_type TEXT DEFAULT 'CODE_39',   -- barcode format on membership card
  min_purchase_gbp      NUMERIC(10,2) DEFAULT 50.00,
  rebate_pct            NUMERIC(4,2)  DEFAULT 1.00, -- loaded from bulk_config on boot, stored here too
  notes                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(retailer, store_identifier)
);

CREATE INDEX IF NOT EXISTS idx_retailer_locations_retailer ON retailer_locations(retailer);
CREATE INDEX IF NOT EXISTS idx_retailer_locations_active   ON retailer_locations(active);

-- ============================================================
-- TABLE: bulk_purchases
-- One row per verified bulk purchase claim.
-- Unique index on (retailer, transaction_id) prevents double-claim.
-- ============================================================
CREATE TABLE IF NOT EXISTS bulk_purchases (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  retailer              TEXT NOT NULL,              -- 'costco' | 'ikea' | 'ms_sparks'
  transaction_id        TEXT NOT NULL,              -- extracted from receipt barcode
  store_identifier      TEXT,                       -- store number from receipt
  membership_number     TEXT NOT NULL,              -- extracted from membership barcode
  purchase_value_gbp    NUMERIC(10,2),
  rebate_pct            NUMERIC(4,2),
  rebate_gbp            NUMERIC(10,2),
  rebate_sats           BIGINT,
  sats_rate             NUMERIC(12,2),              -- GBP/BTC rate at time of issuance
  reward_type           TEXT DEFAULT 'sats',        -- 'sats' | 'giftcard'
  ecash_token_ref       TEXT,                       -- Minibits token reference
  giftcard_ref          TEXT,                       -- future: partner giftcard code
  verified              BOOL DEFAULT FALSE,
  verification_method   TEXT DEFAULT 'barcode_mvp', -- 'barcode_mvp' | 'api' | 'manual'
  verification_checks   JSONB,                      -- {membership_match, time_window, store_match, no_duplicate}
  scan_mode             TEXT DEFAULT 'live',        -- 'live' | 'simulation' — flag test scans
  receipt_raw           TEXT,                       -- raw barcode string from receipt (debug)
  membership_raw        TEXT,                       -- raw barcode string from membership card (debug)
  redeemed_at           TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(retailer, transaction_id)
);

CREATE INDEX IF NOT EXISTS idx_bulk_purchases_user_id       ON bulk_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_bulk_purchases_retailer      ON bulk_purchases(retailer);
CREATE INDEX IF NOT EXISTS idx_bulk_purchases_verified      ON bulk_purchases(verified);
CREATE INDEX IF NOT EXISTS idx_bulk_purchases_created_at    ON bulk_purchases(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bulk_purchases_txn_retailer  ON bulk_purchases(retailer, transaction_id);

-- ============================================================
-- TABLE: bulk_config
-- Runtime config key-value store.
-- All monetary thresholds and rebate percentages live here.
-- Edit values here — app reads on boot.
-- ============================================================
CREATE TABLE IF NOT EXISTS bulk_config (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO bulk_config (key, value) VALUES
  ('costco_rebate_pct',         '1.0'),
  ('ikea_rebate_pct',           '1.0'),
  ('ms_sparks_rebate_pct',      '0.5'),
  ('min_purchase_gbp',          '50'),
  ('max_rebate_sats',           '50000'),
  ('sweep_threshold_sats',      '10000'),
  ('redemption_window_hours',   '24'),
  ('simulation_mode_enabled',   'true'),   -- set to 'false' after live Costco receipt verified
  ('btc_gbp_rate_fallback',     '85000')   -- fallback if live rate unavailable
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- FUNCTION: auto-compute rebate_gbp and note sats_rate
-- Fires BEFORE INSERT on bulk_purchases
-- ============================================================
CREATE OR REPLACE FUNCTION compute_bulk_rebate()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-compute rebate_gbp if not provided
  IF NEW.rebate_gbp IS NULL
     AND NEW.purchase_value_gbp IS NOT NULL
     AND NEW.rebate_pct IS NOT NULL
  THEN
    NEW.rebate_gbp := ROUND(NEW.purchase_value_gbp * NEW.rebate_pct / 100.0, 2);
  END IF;

  -- Auto-compute rebate_sats from rebate_gbp + sats_rate
  -- sats_rate = satoshis per GBP (derived from BTC/GBP rate)
  -- e.g. BTC/GBP = 85000 → 1 GBP = 100,000,000 / 85,000 ≈ 1176 sats
  IF NEW.rebate_sats IS NULL
     AND NEW.rebate_gbp IS NOT NULL
     AND NEW.sats_rate IS NOT NULL
  THEN
    NEW.rebate_sats := FLOOR(NEW.rebate_gbp * NEW.sats_rate)::BIGINT;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER bulk_purchases_compute_rebate
BEFORE INSERT ON bulk_purchases
FOR EACH ROW EXECUTE FUNCTION compute_bulk_rebate();

-- ============================================================
-- ROW-LEVEL SECURITY
-- ============================================================
ALTER TABLE retailer_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_purchases     ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_config        ENABLE ROW LEVEL SECURITY;

-- Retailer locations: public read (scanner needs store list to validate)
CREATE POLICY "public_read_retailer_locations"
  ON retailer_locations FOR SELECT USING (true);

-- Bulk config: public read (scanner reads rebate rates + simulation flag)
CREATE POLICY "public_read_bulk_config"
  ON bulk_config FOR SELECT USING (true);

-- Bulk purchases: users see only their own
CREATE POLICY "user_read_own_bulk_purchases"
  ON bulk_purchases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_insert_bulk_purchases"
  ON bulk_purchases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Service role (Command Centre admin) can update status fields
CREATE POLICY "auth_update_bulk_purchases"
  ON bulk_purchases FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- ============================================================
-- SEED: retailer_locations
-- Costco Lakeside is MVP. store_identifier is PLACEHOLDER —
-- MUST be replaced with the actual store number from a live
-- Costco Lakeside receipt before going live.
-- IKEA and M&S rows seeded as inactive — activate when confirmed.
-- ============================================================
INSERT INTO retailer_locations (
  retailer, store_identifier, name,
  lat, lng,
  active, partner_tier,
  receipt_barcode_type, membership_barcode_type,
  min_purchase_gbp, rebate_pct,
  notes
) VALUES
  (
    'costco',
    'COSTCO_LAKESIDE_STORE_NUMBER_TBC',  -- ⚠ REPLACE after site visit
    'Costco Lakeside',
    51.4822, 0.2882,                     -- approximate — re-pin on site visit
    TRUE, 'mvp',
    'CODE_128', 'CODE_39',
    50.00, 1.00,
    'Pre-session: store_identifier is placeholder. Capture from live receipt at Costco Lakeside before Session 7 build goes live. Test zxing-js on iPhone Safari with real receipt.'
  ),
  (
    'ikea',
    'IKEA_LAKESIDE_STORE_NUMBER_TBC',
    'IKEA Lakeside',
    51.4803, 0.2845,
    FALSE, 'standard',                   -- inactive until confirmed
    'QR', 'QR',
    50.00, 1.00,
    'IKEA Family card QR. Inactive — activate after Costco MVP confirmed. Same session or Session 8.'
  ),
  (
    'ms_sparks',
    'MS_LAKESIDE_STORE_NUMBER_TBC',
    'M&S Lakeside (Sparks)',
    51.4888, 0.2836,
    FALSE, 'standard',                   -- inactive until confirmed
    'QR', 'QR',
    50.00, 0.50,
    'M&S Sparks app QR. 0.5% rebate. Inactive — activate after Costco MVP. Note: M&S Café is Tier 1 partner separately.'
  )
ON CONFLICT (retailer, store_identifier) DO NOTHING;

-- ============================================================
-- VIEW: bulk_verification_summary
-- Powers Command Centre Bulk Verification view
-- ============================================================
CREATE OR REPLACE VIEW bulk_verification_summary AS
SELECT
  bp.id,
  bp.retailer,
  bp.store_identifier,
  rl.name                  AS store_name,
  bp.transaction_id,
  bp.purchase_value_gbp,
  bp.rebate_gbp,
  bp.rebate_sats,
  bp.reward_type,
  bp.verified,
  bp.verification_method,
  bp.scan_mode,
  bp.ecash_token_ref,
  bp.created_at,
  bp.redeemed_at
FROM bulk_purchases bp
LEFT JOIN retailer_locations rl
  ON rl.retailer = bp.retailer
 AND rl.store_identifier = bp.store_identifier
ORDER BY bp.created_at DESC;

-- ============================================================
-- VIEW: bulk_stats_by_retailer
-- Aggregated totals per retailer — Command Centre stats strip
-- ============================================================
CREATE OR REPLACE VIEW bulk_stats_by_retailer AS
SELECT
  retailer,
  COUNT(*)                                     AS total_claims,
  COUNT(*) FILTER (WHERE verified = TRUE)      AS verified_claims,
  COUNT(*) FILTER (WHERE scan_mode = 'simulation') AS simulation_claims,
  SUM(purchase_value_gbp)                      AS total_spend_gbp,
  SUM(rebate_gbp)                              AS total_rebate_gbp,
  SUM(rebate_sats)                             AS total_rebate_sats,
  AVG(purchase_value_gbp)                      AS avg_basket_gbp,
  MIN(created_at)                              AS first_claim_at,
  MAX(created_at)                              AS latest_claim_at
FROM bulk_purchases
GROUP BY retailer
ORDER BY total_claims DESC;

-- ============================================================
-- VERIFY
-- ============================================================
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'retailer_locations', 'bulk_purchases', 'bulk_config'
  )
ORDER BY table_name;

SELECT view_name
FROM information_schema.views
WHERE table_schema = 'public'
  AND view_name IN (
    'bulk_verification_summary', 'bulk_stats_by_retailer'
  );

SELECT key, value FROM bulk_config ORDER BY key;
SELECT retailer, store_identifier, name, active FROM retailer_locations ORDER BY retailer;
