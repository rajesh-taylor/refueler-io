-- Refueler — stations table migration
-- Session 17 · supabase/migrations/20260531_corridor_stations.sql
--
-- Creates the stations reference table for the full Fenchurch Street line corridor.
-- Used by: ambient awareness ETA chain, Darwin STOMP lookups, venue proximity,
--           Command Centre service pattern display.
--
-- TRADEMARK NOTE: "c2c" appears in this file for internal/Darwin reference only.
-- All public-facing copy uses "Fenchurch St line".

CREATE TABLE IF NOT EXISTS stations (
  id                          TEXT        PRIMARY KEY,
  name                        TEXT        NOT NULL,
  crs                         TEXT        NOT NULL UNIQUE,
  sequence                    INT         NOT NULL,

  -- Geography
  centroid_lat                FLOAT       NOT NULL,
  centroid_lng                FLOAT       NOT NULL,

  -- Fare/zone info
  travelcard_zone             INT,        -- NULL = beyond Zone 6 / Oyster not valid

  -- Service pattern
  service_patterns            TEXT[]      NOT NULL DEFAULT '{}',
  -- Values: 'main' | 'grays_branch' | 'basildon_line' | 'diversion' | 'junction'

  tph_to_london               INT,        -- off-peak trains per hour toward London. NULL = terminus/variable

  -- ETA / Darwin
  darwin_enabled              BOOLEAN     NOT NULL DEFAULT TRUE,
  avg_minutes_to_fenchurch    INT         NOT NULL DEFAULT 0,
  -- † Field-validate before investor use. Source: c2c-online.co.uk timetables.

  -- Metadata
  notes                       TEXT,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for CRS lookups (Darwin feed uses CRS)
CREATE UNIQUE INDEX IF NOT EXISTS stations_crs_idx ON stations (crs);

-- Index for service pattern queries (ambient expansion, venue proximity)
CREATE INDEX IF NOT EXISTS stations_service_patterns_idx ON stations USING GIN (service_patterns);

-- Bounding box index for geospatial proximity queries
CREATE INDEX IF NOT EXISTS stations_geo_idx ON stations (centroid_lat, centroid_lng);

-- ---------------------------------------------------------------------------
-- Seed data — all corridor stations
-- ---------------------------------------------------------------------------

INSERT INTO stations (
  id, name, crs, sequence, travelcard_zone, tph_to_london,
  service_patterns, centroid_lat, centroid_lng,
  darwin_enabled, avg_minutes_to_fenchurch, notes
) VALUES

  -- ── LONDON TERMINUS ──────────────────────────────────────────────────────
  ('fenchurch_street', 'Fenchurch Street', 'FST', 0,
   1, NULL, ARRAY['main'], 51.5117, -0.0784, TRUE, 0,
   'Main terminus. Tower Hill 150m, Tower Gateway DLR 200m.'),

  -- ── INNER LONDON ─────────────────────────────────────────────────────────
  ('limehouse', 'Limehouse', 'LHS', 1,
   2, 2, ARRAY['main'], 51.5131, -0.0381, TRUE, 4,
   'PRIMARY AMBIENT TRIGGER STATION. Step free access London-bound platform only. DLR interchange.'),

  ('west_ham', 'West Ham', 'WEH', 2,
   3, 2, ARRAY['main'], 51.5285, 0.0051, TRUE, 10,
   'Jubilee line + DLR interchange.'),

  -- ── EAST LONDON / ESSEX BORDER ───────────────────────────────────────────
  ('barking', 'Barking', 'BKG', 3,
   4, 4, ARRAY['main', 'junction'], 51.5396, 0.0808, TRUE, 17,
   'Major junction. District + Hammersmith & City + Overground interchange.'),

  ('upminster', 'Upminster', 'UPM', 4,
   6, 4, ARRAY['main', 'junction'], 51.5590, 0.2505, TRUE, 28,
   'District line terminus interchange. Zone 6 boundary.'),

  ('ockendon', 'Ockendon', 'OCK', 5,
   NULL, 2, ARRAY['main'], 51.5218, 0.2937, TRUE, 37,
   'Step free access by arrangement. Oyster/Contactless not valid.'),

  ('chafford_hundred', 'Chafford Hundred', 'CFH', 6,
   NULL, 2, ARRAY['main'], 51.4907, 0.3048, TRUE, 41, NULL),

  ('grays', 'Grays', 'GRY', 7,
   NULL, 4, ARRAY['main', 'junction'], 51.4773, 0.3232, TRUE, 44,
   'Junction: main line continues to Purfleet; Grays branch splits to Tilbury/Stanford-le-Hope.'),

  ('purfleet', 'Purfleet', 'PFL', 8,
   NULL, 2, ARRAY['main'], 51.4800, 0.2378, TRUE, 50, NULL),

  ('rainham', 'Rainham', 'RNH', 9,
   NULL, 2, ARRAY['main'], 51.5212, 0.1896, TRUE, 35, NULL),

  ('dagenham_dock', 'Dagenham Dock', 'DDK', 10,
   NULL, 2, ARRAY['main'], 51.5269, 0.1467, TRUE, 30, NULL),

  -- ── GRAYS BRANCH — Service 2 ─────────────────────────────────────────────
  ('tilbury_town', 'Tilbury Town', 'TIL', 71,
   NULL, 2, ARRAY['grays_branch'], 51.4612, 0.3574, TRUE, 52,
   'Ferry connection to Gravesend.'),

  ('east_tilbury', 'East Tilbury', 'ETL', 72,
   NULL, 2, ARRAY['grays_branch'], 51.4716, 0.4016, TRUE, 57, NULL),

  ('stanford_le_hope', 'Stanford-le-Hope', 'SFO', 73,
   NULL, 2, ARRAY['grays_branch'], 51.5124, 0.4218, TRUE, 63,
   'Terminus for Service 2. PlusBus available.'),

  -- ── BASILDON MAIN LINE — Service 4 ───────────────────────────────────────
  ('laindon', 'Laindon', 'LAI', 41,
   NULL, 4, ARRAY['basildon_line'], 51.5695, 0.4229, TRUE, 42,
   'Step free access Southend-bound platform only.'),

  ('basildon', 'Basildon', 'BSO', 42,
   NULL, 4, ARRAY['basildon_line'], 51.5705, 0.4579, TRUE, 46,
   'PlusBus available.'),

  ('pitsea', 'Pitsea', 'PSE', 43,
   NULL, 4, ARRAY['basildon_line'], 51.5617, 0.5049, TRUE, 50, NULL),

  ('benfleet', 'Benfleet', 'BEF', 44,
   NULL, 4, ARRAY['basildon_line'], 51.5463, 0.5601, TRUE, 54,
   'PlusBus available.'),

  ('leigh_on_sea', 'Leigh-on-Sea', 'LES', 45,
   NULL, 4, ARRAY['basildon_line'], 51.5388, 0.6487, TRUE, 61,
   'PlusBus available.'),

  ('chalkwell', 'Chalkwell', 'CHW', 46,
   NULL, 4, ARRAY['basildon_line'], 51.5381, 0.6719, TRUE, 64, NULL),

  ('westcliff', 'Westcliff', 'WCF', 47,
   NULL, 4, ARRAY['basildon_line'], 51.5375, 0.6887, TRUE, 66, NULL),

  ('southend_central', 'Southend Central', 'SOC', 48,
   NULL, 4, ARRAY['basildon_line'], 51.5358, 0.7100, TRUE, 68,
   'Major coastal hub. PlusBus available.'),

  ('southend_east', 'Southend East', 'SOE', 49,
   NULL, 4, ARRAY['basildon_line'], 51.5356, 0.7307, TRUE, 70,
   'Step free access London-bound platform only. PlusBus available.'),

  ('thorpe_bay', 'Thorpe Bay', 'TPB', 50,
   NULL, 4, ARRAY['basildon_line'], 51.5326, 0.7498, TRUE, 73,
   'No step free connection between platforms.'),

  ('shoeburyness', 'Shoeburyness', 'SRY', 51,
   NULL, 4, ARRAY['basildon_line'], 51.5308, 0.7893, TRUE, 78,
   'Far terminus. Eyebrow label origin station for Refueler copy.'),

  -- ── DIVERSION / LIMITED SERVICE ───────────────────────────────────────────
  ('stratford', 'Stratford', 'SAT', 91,
   3, NULL, ARRAY['diversion'], 51.5416, -0.0038, TRUE, 25,
   'Diversion/event service only. Overground + Elizabeth Line + Jubilee + DLR. Westfield Stratford City + Olympic Park.'),

  ('liverpool_street', 'Liverpool Street', 'LST', 92,
   1, NULL, ARRAY['diversion'], 51.5178, -0.0823, TRUE, 0,
   'Diversion terminus. Used when engineering works close Fenchurch Street.')

ON CONFLICT (id) DO UPDATE SET
  name                        = EXCLUDED.name,
  crs                         = EXCLUDED.crs,
  sequence                    = EXCLUDED.sequence,
  travelcard_zone             = EXCLUDED.travelcard_zone,
  tph_to_london               = EXCLUDED.tph_to_london,
  service_patterns            = EXCLUDED.service_patterns,
  centroid_lat                = EXCLUDED.centroid_lat,
  centroid_lng                = EXCLUDED.centroid_lng,
  darwin_enabled              = EXCLUDED.darwin_enabled,
  avg_minutes_to_fenchurch    = EXCLUDED.avg_minutes_to_fenchurch,
  notes                       = EXCLUDED.notes,
  updated_at                  = NOW();

-- Row count sanity check
DO $$
DECLARE station_count INT;
BEGIN
  SELECT COUNT(*) INTO station_count FROM stations;
  ASSERT station_count = 27,
    'Expected 27 corridor stations, got ' || station_count;
  RAISE NOTICE 'Corridor stations migration complete: % stations loaded.', station_count;
END $$;
