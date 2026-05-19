-- ============================================================
-- REFUELER — Session 6a Schema Additions
-- Run in: Supabase SQL Editor → New query
-- Adds: stations, station_vendors, rail_orders, fixtures,
--       rail_movement_log, push_subscription on user_profiles
-- ============================================================

-- ============================================================
-- TABLE: stations
-- C2C and future-network station registry
-- ============================================================
CREATE TABLE IF NOT EXISTS stations (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crs_code              VARCHAR(4) NOT NULL UNIQUE,   -- e.g. 'FST', 'LIM'
  name                  TEXT NOT NULL,
  network               TEXT NOT NULL DEFAULT 'c2c',  -- 'c2c' | 'tfl_dlr' | 'overground' etc.
  lat                   NUMERIC(9,6),
  lng                   NUMERIC(9,6),
  trigger_for_crs       VARCHAR(4),                   -- departure here triggers order for terminus
  terminus              BOOL DEFAULT FALSE,
  has_refueler_vendor   BOOL DEFAULT FALSE,
  notes                 TEXT
);

CREATE INDEX IF NOT EXISTS idx_stations_crs ON stations(crs_code);
CREATE INDEX IF NOT EXISTS idx_stations_network ON stations(network);

-- ============================================================
-- TABLE: station_vendors
-- Coffeeshop / food vendors at each station
-- ============================================================
CREATE TABLE IF NOT EXISTS station_vendors (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_crs     VARCHAR(4) REFERENCES stations(crs_code) ON DELETE CASCADE,
  vendor_name     TEXT NOT NULL,
  brand_chip_key  TEXT,           -- 'CC' | 'PA' | 'MS' | 'CN' | 'GG' | 'BS'
  floor_location  TEXT,           -- 'Platform level' | 'Level 2' | 'Concourse'
  lat             NUMERIC(9,6),
  lng             NUMERIC(9,6),
  active          BOOL DEFAULT TRUE,
  menu_url        TEXT,           -- optional deep-link to menu / ordering UI
  prep_time_mins  INTEGER DEFAULT 3,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_station_vendors_crs ON station_vendors(station_crs);

-- ============================================================
-- TABLE: rail_orders
-- One row per commuter order placed via predictive ordering
-- ============================================================
CREATE TABLE IF NOT EXISTS rail_orders (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  trigger_station_crs     VARCHAR(4) REFERENCES stations(crs_code),
  destination_station_crs VARCHAR(4) REFERENCES stations(crs_code),
  vendor_id               UUID REFERENCES station_vendors(id),
  darwin_train_uid        TEXT,                   -- Network Rail train UID
  estimated_arrival_at    TIMESTAMPTZ,
  actual_arrival_at       TIMESTAMPTZ,
  order_items             JSONB,                  -- [{name, qty, price_gbp}]
  order_value_gbp         NUMERIC(8,2),
  commission_pct          NUMERIC(4,2) DEFAULT 15.0,
  commission_gbp          NUMERIC(8,2),
  commission_sats         BIGINT,
  sats_rate               NUMERIC(12,2),
  reward_sats             BIGINT,
  status                  TEXT NOT NULL DEFAULT 'PLACED',
  -- status values: PLACED | MAKING | READY | COLLECTED | CANCELLED
  notified_at             TIMESTAMPTZ,
  placed_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  collected_at            TIMESTAMPTZ,
  partner_notes           TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rail_orders_user_id ON rail_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_rail_orders_status ON rail_orders(status);
CREATE INDEX IF NOT EXISTS idx_rail_orders_destination ON rail_orders(destination_station_crs);
CREATE INDEX IF NOT EXISTS idx_rail_orders_train_uid ON rail_orders(darwin_train_uid);

-- ============================================================
-- TABLE: fixtures
-- Football / events that trigger Match Day Mode
-- ============================================================
CREATE TABLE IF NOT EXISTS fixtures (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition           TEXT NOT NULL,           -- 'Premier League' | 'Championship' etc.
  home_team             TEXT NOT NULL,
  away_team             TEXT NOT NULL,
  venue                 TEXT,
  nearest_station_crs   VARCHAR(4) REFERENCES stations(crs_code),
  kickoff_at            TIMESTAMPTZ NOT NULL,
  match_day_mode_active BOOL DEFAULT FALSE,
  fetched_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  source_fixture_id     TEXT,                    -- football-data.org ID
  estimated_crowd       INTEGER                  -- optional for foot flow projections
);

CREATE INDEX IF NOT EXISTS idx_fixtures_kickoff ON fixtures(kickoff_at);
CREATE INDEX IF NOT EXISTS idx_fixtures_station ON fixtures(nearest_station_crs);

-- ============================================================
-- TABLE: rail_movement_log
-- Written by Darwin bridge service on every relevant STOMP event
-- ============================================================
CREATE TABLE IF NOT EXISTS rail_movement_log (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  train_uid           TEXT NOT NULL,
  operator            TEXT,                       -- 'HJ' = c2c
  event_type          TEXT NOT NULL,              -- 'DEPARTURE' | 'ARRIVAL' | 'CANCELLATION'
  crs_code            VARCHAR(4),
  timetable_ts        TIMESTAMPTZ,
  actual_ts           TIMESTAMPTZ,
  delay_mins          INTEGER DEFAULT 0,
  carriage_count      INTEGER,
  passenger_estimate  INTEGER,                    -- optional, from formation data
  notification_fired  BOOL DEFAULT FALSE,
  orders_triggered    INTEGER DEFAULT 0,          -- how many push notifs resulted in orders
  suppressed          BOOL DEFAULT FALSE,
  suppress_reason     TEXT,                       -- 'DELAY_THRESHOLD' | 'ALREADY_ORDERED' | 'CANCELLED'
  raw_payload         JSONB,                      -- store raw Darwin event for debugging
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rail_movement_log_train_uid ON rail_movement_log(train_uid);
CREATE INDEX IF NOT EXISTS idx_rail_movement_log_crs ON rail_movement_log(crs_code);
CREATE INDEX IF NOT EXISTS idx_rail_movement_log_created_at ON rail_movement_log(created_at DESC);

-- ============================================================
-- ALTER user_profiles: add push_subscription column
-- (safe — IF NOT EXISTS prevents error on re-run)
-- ============================================================
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS push_subscription JSONB;

-- ============================================================
-- FUNCTION: auto-compute commission on rail_orders insert
-- ============================================================
CREATE OR REPLACE FUNCTION compute_rail_order_commission()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.commission_gbp IS NULL
     AND NEW.order_value_gbp IS NOT NULL
     AND NEW.commission_pct IS NOT NULL
  THEN
    NEW.commission_gbp := ROUND(NEW.order_value_gbp * NEW.commission_pct / 100.0, 2);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER rail_orders_compute_commission
BEFORE INSERT ON rail_orders
FOR EACH ROW EXECUTE FUNCTION compute_rail_order_commission();

-- ============================================================
-- ROW-LEVEL SECURITY
-- ============================================================
ALTER TABLE stations            ENABLE ROW LEVEL SECURITY;
ALTER TABLE station_vendors     ENABLE ROW LEVEL SECURITY;
ALTER TABLE rail_orders         ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixtures            ENABLE ROW LEVEL SECURITY;
ALTER TABLE rail_movement_log   ENABLE ROW LEVEL SECURITY;

-- Stations + vendors: public read (partner tablet, command centre map, locate screen)
CREATE POLICY "public_read_stations"
  ON stations FOR SELECT USING (true);

CREATE POLICY "public_read_station_vendors"
  ON station_vendors FOR SELECT USING (true);

-- Fixtures: public read (partner tablet needs match day banner)
CREATE POLICY "public_read_fixtures"
  ON fixtures FOR SELECT USING (true);

-- Rail movement log: authenticated read only (command centre admin)
CREATE POLICY "auth_read_rail_movement_log"
  ON rail_movement_log FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Bridge service writes movement log via service role key (bypasses RLS)
-- Rail orders: users see their own orders; partner/admin see all (via service role)
CREATE POLICY "user_read_own_rail_orders"
  ON rail_orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_insert_rail_orders"
  ON rail_orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "auth_update_rail_orders"
  ON rail_orders FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- ============================================================
-- SEED: C2C stations
-- ============================================================
INSERT INTO stations (crs_code, name, network, lat, lng, trigger_for_crs, terminus, has_refueler_vendor) VALUES
  ('FST', 'London Fenchurch Street', 'c2c',  51.511811,  -0.078308, NULL,  TRUE,  TRUE),
  ('LIM', 'Limehouse',               'c2c',  51.511985,  -0.038550, 'FST', FALSE, FALSE),
  ('WHA', 'West Ham',                'c2c',  51.528700,   0.005200, 'FST', FALSE, FALSE),
  ('PFL', 'Purfleet',                'c2c',  51.477900,   0.237500, 'FST', FALSE, TRUE),
  ('GRY', 'Grays',                   'c2c',  51.476800,   0.325700, 'FST', FALSE, TRUE),
  ('UPM', 'Upminster',               'c2c',  51.557200,   0.250900, 'FST', FALSE, TRUE),
  ('SRA', 'Stratford',               'c2c',  51.541500,  -0.003600, 'FST', FALSE, FALSE),
  ('SOC', 'Southend Central',        'c2c',  51.536400,   0.712800, NULL,  TRUE,  FALSE)
ON CONFLICT (crs_code) DO NOTHING;

-- Seed Fenchurch Street vendors (confirm floor/coordinates on site visit)
INSERT INTO station_vendors (station_crs, vendor_name, brand_chip_key, floor_location, active, prep_time_mins)
VALUES
  ('FST', 'Costa Coffee',  'CC', 'Platform level', TRUE, 3),
  ('FST', 'Pret a Manger', 'PA', 'Platform level', TRUE, 2)
ON CONFLICT DO NOTHING;

-- ============================================================
-- VIEW: active_rail_orders_by_station
-- Powers the partner tablet order queue in real-time
-- ============================================================
CREATE OR REPLACE VIEW active_rail_orders_by_station AS
SELECT
  ro.id,
  ro.status,
  ro.order_items,
  ro.order_value_gbp,
  ro.estimated_arrival_at,
  ro.darwin_train_uid,
  ro.placed_at,
  ro.partner_notes,
  sv.vendor_name,
  sv.station_crs,
  s.name AS station_name
FROM rail_orders ro
JOIN station_vendors sv ON sv.id = ro.vendor_id
JOIN stations s ON s.crs_code = sv.station_crs
WHERE ro.status NOT IN ('COLLECTED', 'CANCELLED')
  AND ro.placed_at > now() - interval '4 hours'
ORDER BY ro.estimated_arrival_at ASC;

-- ============================================================
-- VERIFY
-- ============================================================
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'sessions', 'log_entries', 'walk_stats', 'orders',
    'stations', 'station_vendors', 'rail_orders',
    'fixtures', 'rail_movement_log'
  )
ORDER BY table_name;

SELECT view_name
FROM information_schema.views
WHERE table_schema = 'public'
  AND view_name IN (
    'revenue_by_session', 'revenue_totals',
    'active_rail_orders_by_station'
  );
