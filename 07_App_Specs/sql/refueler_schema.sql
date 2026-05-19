-- ============================================================
-- REFUELER — Supabase Schema
-- Version: Session 2 / v1.0
-- Run in: Supabase SQL Editor (Project > SQL Editor > New query)
-- ============================================================

-- Enable UUID generation (already enabled on Supabase by default)
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLE: sessions
-- One row per field visit / recording session
-- ============================================================
CREATE TABLE IF NOT EXISTS sessions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  TEXT NOT NULL UNIQUE,   -- e.g. "S4F2A" (app-generated)
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  site_name   TEXT,                   -- e.g. "Lakeside — Tesla Superchargers"
  notes       TEXT                    -- session-level notes from the field
);

-- ============================================================
-- TABLE: log_entries
-- One row per timed event, observation, or site profile logged
-- entry_type values: WALK_TIMER | ORDER_OBSERVATION | SITE_PROFILE | VOIDED
-- log_key values: see route timer key list in spec (WALK_TESLA_TO_MAS etc.)
-- ============================================================
CREATE TABLE IF NOT EXISTS log_entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      TEXT NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
  entry_type      TEXT NOT NULL,          -- WALK_TIMER | ORDER_OBSERVATION | SITE_PROFILE
  log_key         TEXT,                   -- e.g. WALK_TESLA_TO_MAS
  label           TEXT,                   -- human-readable label
  duration_ms     INTEGER,                -- milliseconds (walk timers)
  duration_fmt    TEXT,                   -- formatted "m:ss"
  ts              TEXT,                   -- local timestamp string at log time
  voided          BOOLEAN DEFAULT FALSE,
  void_reason     TEXT,                   -- Interrupted | Wrong route | False start | Obstruction | Other
  tags            TEXT[],                 -- conditions tags array (charger_status, footfall, weather, etc.)
  notes           TEXT,
  -- Order observation fields
  vendor          TEXT,                   -- M&S Café | Costa | Café Nero | Pret | Greggs | Black Sheep
  queue_time      TEXT,                   -- formatted duration
  production_time TEXT,
  handover_time   TEXT,
  staff_count     INTEGER,
  -- Site profile fields
  site_name       TEXT,
  site_location   TEXT,                   -- floor / description
  lat             TEXT,
  lng             TEXT,
  potential       TEXT,                   -- High | Medium | Low | Unknown
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast session lookups
CREATE INDEX IF NOT EXISTS idx_log_entries_session_id ON log_entries(session_id);
CREATE INDEX IF NOT EXISTS idx_log_entries_log_key ON log_entries(log_key);
CREATE INDEX IF NOT EXISTS idx_log_entries_entry_type ON log_entries(entry_type);

-- ============================================================
-- TABLE: walk_stats
-- Derived summary per route key — updated via trigger on insert
-- ============================================================
CREATE TABLE IF NOT EXISTS walk_stats (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  log_key         TEXT NOT NULL UNIQUE,   -- matches log_entries.log_key
  sample_count    INTEGER DEFAULT 0,
  avg_duration_ms INTEGER,
  min_duration_ms INTEGER,
  max_duration_ms INTEGER,
  last_updated    TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- FUNCTION + TRIGGER: auto-update walk_stats on insert
-- Only fires for non-voided WALK_TIMER entries with a duration
-- ============================================================
CREATE OR REPLACE FUNCTION update_walk_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.entry_type = 'WALK_TIMER'
     AND NEW.voided = FALSE
     AND NEW.duration_ms IS NOT NULL
     AND NEW.log_key IS NOT NULL
  THEN
    INSERT INTO walk_stats (log_key, sample_count, avg_duration_ms, min_duration_ms, max_duration_ms, last_updated)
    SELECT
      NEW.log_key,
      COUNT(*)::INTEGER,
      AVG(duration_ms)::INTEGER,
      MIN(duration_ms)::INTEGER,
      MAX(duration_ms)::INTEGER,
      now()
    FROM log_entries
    WHERE log_key = NEW.log_key
      AND entry_type = 'WALK_TIMER'
      AND voided = FALSE
      AND duration_ms IS NOT NULL
    ON CONFLICT (log_key) DO UPDATE SET
      sample_count    = EXCLUDED.sample_count,
      avg_duration_ms = EXCLUDED.avg_duration_ms,
      min_duration_ms = EXCLUDED.min_duration_ms,
      max_duration_ms = EXCLUDED.max_duration_ms,
      last_updated    = EXCLUDED.last_updated;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER walk_stats_update_trigger
AFTER INSERT ON log_entries
FOR EACH ROW
EXECUTE FUNCTION update_walk_stats();

-- ============================================================
-- ROW-LEVEL SECURITY (enable after confirming anon key works)
-- Uncomment these once you've tested basic read/write via REST
-- ============================================================
-- ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE log_entries ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE walk_stats ENABLE ROW LEVEL SECURITY;

-- Allow anon reads (for Command Centre dashboard)
-- CREATE POLICY "anon_read_sessions"   ON sessions    FOR SELECT USING (true);
-- CREATE POLICY "anon_read_log"        ON log_entries FOR SELECT USING (true);
-- CREATE POLICY "anon_read_walk_stats" ON walk_stats  FOR SELECT USING (true);

-- Allow anon inserts (for Field Log App JSON import)
-- CREATE POLICY "anon_insert_sessions"   ON sessions    FOR INSERT WITH CHECK (true);
-- CREATE POLICY "anon_insert_log"        ON log_entries FOR INSERT WITH CHECK (true);

-- ============================================================
-- SEED: Lakeside site identity (optional reference row)
-- ============================================================
-- INSERT INTO sessions (session_id, site_name, notes)
-- VALUES ('LAKESIDE_V1', 'Lakeside — Tesla Superchargers, Car Park G', 'Seed row for Command Centre site identity')
-- ON CONFLICT (session_id) DO NOTHING;

-- ============================================================
-- VERIFY: check tables exist
-- ============================================================
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('sessions', 'log_entries', 'walk_stats')
ORDER BY table_name;
