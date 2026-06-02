-- =============================================================
-- Refueler · Match Day Mode — Session 21
-- 20260601_match_day.sql
-- =============================================================
-- Creates:
--   match_day_grounds   — static ground registry (3 grounds MVF)
--   match_day_state     — live flag written by detector, read by app
--   match_day_surge     — surge message slot (copy null for now,
--                         condition ready for future use)
-- =============================================================

-- ─── Ground registry ─────────────────────────────────────────

create table if not exists match_day_grounds (
  id              text primary key,           -- 'west_ham' | 'spurs' | 'arsenal'
  team_name       text        not null,        -- display: "West Ham", "Tottenham", "Arsenal"
  stadium_name    text        not null,        -- "London Stadium", "Tottenham Hotspur Stadium", "Emirates Stadium"
  interchange_tip text        not null,        -- shown in push + ETA widget
  football_data_team_id integer not null,      -- football-data.org team ID
  active          boolean     not null default true,
  created_at      timestamptz not null default now()
);

comment on table match_day_grounds is
  'Static registry of grounds in the Fenchurch St line catchment. '
  'One row per club. football_data_team_id maps to football-data.org /teams/{id}.';

-- Seed: three MVF grounds
insert into match_day_grounds
  (id, team_name, stadium_name, interchange_tip, football_data_team_id)
values
  (
    'west_ham',
    'West Ham',
    'London Stadium',
    'Change at Stratford — DLR or Overground to Stratford International.',
    65
  ),
  (
    'spurs',
    'Tottenham',
    'Tottenham Hotspur Stadium',
    'Change at Fenchurch St → tube to Seven Sisters, then Victoria line to Tottenham Hale.',
    73
  ),
  (
    'arsenal',
    'Arsenal',
    'Emirates Stadium',
    'Change at Tower Hill → Piccadilly line to Arsenal station.',
    57
  )
on conflict (id) do nothing;


-- ─── Live match day state ─────────────────────────────────────
-- One row maximum. Upserted by the detector, deleted at T+2h.
-- The app reads this on launch and foreground return.

create table if not exists match_day_state (
  id              integer     primary key default 1
                              check (id = 1),          -- singleton row
  ground_id       text        not null
                              references match_day_grounds(id),
  team_name       text        not null,
  stadium_name    text        not null,
  interchange_tip text        not null,
  kickoff_utc     timestamptz not null,
  window_start    timestamptz not null,                -- kickoff − 3h
  window_end      timestamptz not null,                -- kickoff + 2h
  -- Skin gate: true = England national team playing today (Euros/WC/NL/Qual).
  -- England skin (#CF3030) activates ONLY when this is true AND locale = en-GB.
  -- Club matches always false — no supporter allegiance assumption.
  is_national_team_fixture boolean not null default false,
  activated_at    timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table match_day_state is
  'Singleton row: present = match day active, absent = default Carbon mode. '
  'Written by the detector Edge Function, cleared at window_end.';

-- Auto-update updated_at
create or replace function match_day_state_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_match_day_state_updated_at on match_day_state;
create trigger trg_match_day_state_updated_at
  before update on match_day_state
  for each row execute function match_day_state_updated_at();


-- ─── Surge message slot ───────────────────────────────────────
-- Condition ready. surge_copy null = feature off (no UI shown).
-- To activate: update match_day_surge set surge_copy = 'Expect longer queues today.'
--   where ground_id = 'west_ham';

create table if not exists match_day_surge (
  ground_id       text        primary key
                              references match_day_grounds(id),
  surge_copy      text        default null,   -- null = feature off
  updated_at      timestamptz not null default now()
);

comment on column match_day_surge.surge_copy is
  'Null = surge awareness disabled (MVF default). '
  'Set a non-null string to activate the surge message for that ground. '
  'Shown in ETA widget below the interchange tip when active.';

-- Seed one row per ground (all null copy = off)
insert into match_day_surge (ground_id)
values ('west_ham'), ('spurs'), ('arsenal')
on conflict (ground_id) do nothing;


-- ─── RLS ─────────────────────────────────────────────────────
-- match_day_grounds: public read (no PII)
alter table match_day_grounds enable row level security;
create policy "public read grounds"
  on match_day_grounds for select
  using (true);

-- match_day_state: public read; write = service role only (Edge Function)
alter table match_day_state enable row level security;
create policy "public read state"
  on match_day_state for select
  using (true);

-- match_day_surge: public read; write = service role only
alter table match_day_surge enable row level security;
create policy "public read surge"
  on match_day_surge for select
  using (true);
