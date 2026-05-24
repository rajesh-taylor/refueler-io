-- ─────────────────────────────────────────────────────────────────────────────
-- REFUELER — Session 8 Schema
-- FIFA World Cup 2026 · Duffel Travel · Field Observations · PostGIS
-- Run in Supabase SQL Editor after previous session schemas are applied
-- ─────────────────────────────────────────────────────────────────────────────


-- ─────────────────────────────────────────────────────────────────────────────
-- 0. POSTGIS EXTENSION
-- Enables geography types, ST_DWithin, ST_Distance, ST_MakePoint etc.
-- Safe to run multiple times — IF NOT EXISTS guard.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS postgis;


-- ─────────────────────────────────────────────────────────────────────────────
-- 1. WORLD CUP FIXTURES
-- Seeded with England's confirmed group stage venues.
-- england_playing flag drives skin activation logic.
-- location column is a PostGIS geography point — enables radius queries.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS world_cup_fixtures (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id         text UNIQUE NOT NULL,          -- e.g. "WC2026_B_ENG_TUN"
  home_team        text NOT NULL,
  away_team        text NOT NULL,
  venue_name       text NOT NULL,
  venue_city       text NOT NULL,
  venue_country    text NOT NULL DEFAULT 'USA',
  venue_lat        numeric(9,6) NOT NULL,
  venue_lng        numeric(9,6) NOT NULL,
  location         geography(POINT, 4326),        -- PostGIS point, auto-set by trigger
  kickoff_at       timestamptz NOT NULL,
  group_stage      bool DEFAULT true,
  england_playing  bool DEFAULT false,
  skin_active      bool DEFAULT false,
  geofence_radius_m int DEFAULT 50000,            -- 50 km default, tighten on match day
  created_at       timestamptz DEFAULT now()
);

-- Trigger: keep location in sync with lat/lng on insert or update
CREATE OR REPLACE FUNCTION sync_fixture_location()
RETURNS TRIGGER AS $$
BEGIN
  NEW.location = ST_SetSRID(ST_MakePoint(NEW.venue_lng, NEW.venue_lat), 4326)::geography;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_fixture_location ON world_cup_fixtures;
CREATE TRIGGER trg_fixture_location
  BEFORE INSERT OR UPDATE ON world_cup_fixtures
  FOR EACH ROW EXECUTE FUNCTION sync_fixture_location();

-- Index for fast geofence queries
CREATE INDEX IF NOT EXISTS idx_wc_fixtures_location
  ON world_cup_fixtures USING GIST (location);

-- Seed data: England group stage venues (venues confirmed, opponents TBC at draw)
-- Kickoff times are UTC placeholders — update when schedule is confirmed on FIFA.com
INSERT INTO world_cup_fixtures
  (match_id, home_team, away_team, venue_name, venue_city, venue_lat, venue_lng, kickoff_at, england_playing)
VALUES
  ('WC2026_ENG_G1', 'England', 'TBC', 'Hard Rock Stadium',      'Miami',    25.957919, -80.238842, '2026-06-16 00:00:00+00', true),
  ('WC2026_ENG_G2', 'England', 'TBC', 'MetLife Stadium',         'New York', 40.813556, -74.074294, '2026-06-21 00:00:00+00', true),
  ('WC2026_ENG_G3', 'England', 'TBC', 'Mercedes-Benz Stadium',  'Atlanta',  33.755488, -84.400972, '2026-06-25 00:00:00+00', true),
  -- Non-England fixtures at Refueler-active venues (geofences still useful)
  ('WC2026_MIA_01', 'TBC',     'TBC', 'Hard Rock Stadium',      'Miami',    25.957919, -80.238842, '2026-06-12 00:00:00+00', false),
  ('WC2026_NYJ_01', 'TBC',     'TBC', 'MetLife Stadium',         'New York', 40.813556, -74.074294, '2026-06-13 00:00:00+00', false),
  ('WC2026_ATL_01', 'TBC',     'TBC', 'Mercedes-Benz Stadium',  'Atlanta',  33.755488, -84.400972, '2026-06-14 00:00:00+00', false),
  ('WC2026_BOS_01', 'TBC',     'TBC', 'Gillette Stadium',        'Boston',   42.090947, -71.264344, '2026-06-15 00:00:00+00', false)
ON CONFLICT (match_id) DO NOTHING;


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. TRAVEL BOOKINGS
-- Records every Duffel flight, car hire, Roadtrippers activity.
-- Links to auth.users — one row per booking leg, not per trip.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS travel_bookings (
  id                  uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  booking_type        text NOT NULL
                        CHECK (booking_type IN ('flight','car_hire','activity','hotel','transfer')),
  provider            text NOT NULL
                        CHECK (provider IN ('duffel','roadtrippers','booking_com','other')),
  provider_ref        text,                        -- Duffel order ID or Roadtrippers booking ref
  origin_city         text,
  destination_city    text,
  travel_date         date,
  return_date         date,
  value_gbp           numeric(10,2),
  commission_gbp      numeric(8,2),
  commission_sats     bigint,
  sats_rate           numeric(12,2),               -- GBP/BTC rate at time of booking
  rebate_pct          numeric(5,4) DEFAULT 0.01,   -- 1% default — update from 1_Assumptions!B16
  world_cup_trip      bool DEFAULT false,
  fixture_id          uuid REFERENCES world_cup_fixtures(id) ON DELETE SET NULL,
  booking_status      text DEFAULT 'confirmed'
                        CHECK (booking_status IN ('pending','confirmed','cancelled','refunded')),
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_travel_bookings_user
  ON travel_bookings (user_id);

CREATE INDEX IF NOT EXISTS idx_travel_bookings_fixture
  ON travel_bookings (fixture_id);

CREATE INDEX IF NOT EXISTS idx_travel_bookings_type
  ON travel_bookings (booking_type, provider);


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. FIELD OBSERVATIONS
-- Ingestion target for refueler_field_log_v2.html JSON exports.
-- Drop a saved JSON file into Command Centre → it parses to this table.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS field_observations (
  id                  uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  observed_at         timestamptz NOT NULL DEFAULT now(),
  venue_name          text NOT NULL,
  observation_mode    text NOT NULL
                        CHECK (observation_mode IN ('WALK','SERVE','QUEUE','OBSERVE','EV')),
  location            geography(POINT, 4326),      -- from coords tab
  coords_lat          numeric(9,6),
  coords_lng          numeric(9,6),
  walk_time_seconds   int,                         -- from TIMER_STOP log entry
  serve_time_seconds  int,
  staff_count         int,
  queue_length        int,
  seats_available     int,
  ev_bays_occupied    int,
  ev_bays_total       int,
  notes               text,
  raw_log             jsonb,                       -- full log array from JSON export
  session_start       timestamptz,
  exported_at         timestamptz,
  schema_version      text DEFAULT 'refueler_field_log_v2',
  created_at          timestamptz DEFAULT now()
);

-- Trigger: keep location in sync with lat/lng
CREATE OR REPLACE FUNCTION sync_observation_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.coords_lat IS NOT NULL AND NEW.coords_lng IS NOT NULL THEN
    NEW.location = ST_SetSRID(ST_MakePoint(NEW.coords_lng, NEW.coords_lat), 4326)::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_observation_location ON field_observations;
CREATE TRIGGER trg_observation_location
  BEFORE INSERT OR UPDATE ON field_observations
  FOR EACH ROW EXECUTE FUNCTION sync_observation_location();

CREATE INDEX IF NOT EXISTS idx_field_obs_location
  ON field_observations USING GIST (location);

CREATE INDEX IF NOT EXISTS idx_field_obs_venue
  ON field_observations (venue_name);


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. VENUE PARTNERS (upgrade existing or create)
-- Adds PostGIS location column to any existing partners/merchants table.
-- If you already have a merchants or station_vendors table, add location there.
-- This creates a unified partner registry with spatial indexing.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS venue_partners (
  id                  uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_id         text UNIQUE NOT NULL,        -- e.g. 'ms_cafe_lakeside'
  name                text NOT NULL,
  category            text NOT NULL,               -- 'coffee' | 'food' | 'ev' | 'retail' | 'travel'
  site                text,                        -- 'lakeside' | 'fenchurch_st' | 'o2' etc.
  coords_lat          numeric(9,6),
  coords_lng          numeric(9,6),
  location            geography(POINT, 4326),
  address_line1       text,
  city                text,
  country             text DEFAULT 'GB',
  pickup_note         text,                        -- e.g. "Level 2, near bus station entrance"
  exclusivity_radius_m int DEFAULT 500,            -- ordering exclusion zone
  active              bool DEFAULT true,
  session_added       int,                         -- which build session added this partner
  created_at          timestamptz DEFAULT now()
);

-- Trigger for location sync
CREATE OR REPLACE FUNCTION sync_partner_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.coords_lat IS NOT NULL AND NEW.coords_lng IS NOT NULL THEN
    NEW.location = ST_SetSRID(ST_MakePoint(NEW.coords_lng, NEW.coords_lat), 4326)::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_partner_location ON venue_partners;
CREATE TRIGGER trg_partner_location
  BEFORE INSERT OR UPDATE ON venue_partners
  FOR EACH ROW EXECUTE FUNCTION sync_partner_location();

CREATE INDEX IF NOT EXISTS idx_venue_partners_location
  ON venue_partners USING GIST (location);

-- Seed known Refueler partners (coords to be updated from field log observations)
INSERT INTO venue_partners
  (merchant_id, name, category, site, session_added)
VALUES
  ('ms_cafe_lakeside',        'M&S Café',           'food',    'lakeside',       1),
  ('costa_lakeside',          'Costa Coffee',        'coffee',  'lakeside',       1),
  ('black_sheep_lakeside',    'Black Sheep Coffee',  'coffee',  'lakeside',       4),
  ('costco_lakeside',         'Costco',              'retail',  'lakeside',       7),
  ('chargepoint_g4',          'ChargePoint Bay 4',   'ev',      'lakeside',       1),
  ('costa_fenchurch',         'Costa Coffee',        'coffee',  'fenchurch_st',   6),
  ('pret_fenchurch',          'Pret A Manger',       'coffee',  'fenchurch_st',   6),
  ('c2c_grays',               'Grays Coffeeshop',    'coffee',  'c2c_grays',      6),
  ('c2c_purfleet',            'Purfleet Coffeeshop', 'coffee',  'c2c_purfleet',   6)
ON CONFLICT (merchant_id) DO NOTHING;


-- ─────────────────────────────────────────────────────────────────────────────
-- 5. POSTGIS UTILITY VIEWS
-- Pre-built spatial queries you'll call from Edge Functions and Command Centre.
-- ─────────────────────────────────────────────────────────────────────────────

-- 5a. Find all active partners within N metres of a given point
-- Usage: SELECT * FROM partners_near_point(51.5116, -0.0783, 500);
CREATE OR REPLACE FUNCTION partners_near_point(
  lat  double precision,
  lng  double precision,
  radius_m int DEFAULT 500
)
RETURNS TABLE (
  merchant_id text,
  name        text,
  category    text,
  distance_m  double precision
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    vp.merchant_id,
    vp.name,
    vp.category,
    ST_Distance(
      vp.location,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
    ) AS distance_m
  FROM venue_partners vp
  WHERE
    vp.active = true
    AND ST_DWithin(
      vp.location,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
      radius_m
    )
  ORDER BY distance_m ASC;
END;
$$ LANGUAGE plpgsql;

-- 5b. Check if a point is within a stadium geofence
-- Usage: SELECT * FROM point_in_stadium_geofence(25.9200, -80.2100);
CREATE OR REPLACE FUNCTION point_in_stadium_geofence(
  lat double precision,
  lng double precision
)
RETURNS TABLE (
  fixture_id      uuid,
  venue_name      text,
  venue_city      text,
  england_playing bool,
  kickoff_at      timestamptz,
  distance_m      double precision
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    wf.id,
    wf.venue_name,
    wf.venue_city,
    wf.england_playing,
    wf.kickoff_at,
    ST_Distance(
      wf.location,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
    ) AS distance_m
  FROM world_cup_fixtures wf
  WHERE ST_DWithin(
    wf.location,
    ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
    wf.geofence_radius_m
  )
  ORDER BY wf.kickoff_at ASC;
END;
$$ LANGUAGE plpgsql;

-- 5c. England skin activation check — call this from the app on location update
-- Returns true if user is within 50km of any England fixture venue
-- OR an England game kicks off within 6 hours
CREATE OR REPLACE FUNCTION should_activate_england_skin(
  lat         double precision,
  lng         double precision,
  check_time  timestamptz DEFAULT now()
)
RETURNS bool AS $$
DECLARE
  location_match bool;
  time_match     bool;
BEGIN
  -- Check proximity to England venue
  SELECT EXISTS(
    SELECT 1 FROM world_cup_fixtures
    WHERE england_playing = true
    AND ST_DWithin(
      location,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
      50000  -- 50 km
    )
  ) INTO location_match;

  -- Check time window: England game within 6 hours
  SELECT EXISTS(
    SELECT 1 FROM world_cup_fixtures
    WHERE england_playing = true
    AND kickoff_at BETWEEN check_time AND check_time + interval '6 hours'
  ) INTO time_match;

  RETURN location_match OR time_match;
END;
$$ LANGUAGE plpgsql;


-- ─────────────────────────────────────────────────────────────────────────────
-- 6. REVENUE VIEW — SESSION 8 EXTENSION
-- Extends the existing revenue model to include Duffel travel commissions.
-- Assumes a revenue_summary view or table exists from previous sessions.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW travel_revenue_summary AS
SELECT
  date_trunc('day', created_at)         AS day,
  provider,
  booking_type,
  COUNT(*)                               AS bookings,
  SUM(value_gbp)                         AS gross_value_gbp,
  SUM(commission_gbp)                    AS commission_gbp,
  SUM(commission_sats)                   AS commission_sats,
  AVG(value_gbp)                         AS avg_booking_value_gbp,
  COUNT(*) FILTER (WHERE world_cup_trip) AS world_cup_bookings
FROM travel_bookings
WHERE booking_status = 'confirmed'
GROUP BY 1, 2, 3
ORDER BY 1 DESC, commission_gbp DESC;


-- ─────────────────────────────────────────────────────────────────────────────
-- 7. ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────────────────────

-- world_cup_fixtures — public read, admin write
ALTER TABLE world_cup_fixtures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fixtures_public_read" ON world_cup_fixtures
  FOR SELECT USING (true);

CREATE POLICY "fixtures_service_write" ON world_cup_fixtures
  FOR ALL USING (auth.role() = 'service_role');

-- travel_bookings — users see own bookings only
ALTER TABLE travel_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "travel_own_bookings" ON travel_bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "travel_service_all" ON travel_bookings
  FOR ALL USING (auth.role() = 'service_role');

-- field_observations — service role only (founder data, not user-facing)
ALTER TABLE field_observations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "obs_service_only" ON field_observations
  FOR ALL USING (auth.role() = 'service_role');

-- venue_partners — public read
ALTER TABLE venue_partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "partners_public_read" ON venue_partners
  FOR SELECT USING (true);

CREATE POLICY "partners_service_write" ON venue_partners
  FOR ALL USING (auth.role() = 'service_role');


-- ─────────────────────────────────────────────────────────────────────────────
-- 8. VERIFICATION QUERIES
-- Run these after applying the schema to confirm everything landed correctly.
-- ─────────────────────────────────────────────────────────────────────────────

-- Should return 7 fixtures (3 England + 4 others)
-- SELECT count(*) FROM world_cup_fixtures;

-- Should return 9 partners
-- SELECT count(*) FROM venue_partners;

-- PostGIS smoke test — should return a valid geography value
-- SELECT ST_AsText(location) FROM world_cup_fixtures WHERE venue_city = 'Miami';

-- England skin test (user near MetLife, no time constraint)
-- SELECT should_activate_england_skin(40.813556, -74.074294, now());

-- Nearest partner to Fenchurch Street station
-- SELECT * FROM partners_near_point(51.5116, -0.0783, 1000);
