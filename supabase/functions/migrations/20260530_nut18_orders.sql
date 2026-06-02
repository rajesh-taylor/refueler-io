-- Refueler — NUT-18 database migration
-- Session 14 · 30 May 2026
--
-- Tables:
--   orders                   Order state machine (pending → paid → fulfilled → collected)
--   venue_notifications      Realtime channel for both terminal tracks
--   customer_notifications   Realtime channel for ETA widget + NUT-17 push
--   webhook_security_log     HMAC failure audit trail (GDPR / ICO compliance)
--   webhook_failures         Retry tracking, NUT-07 fallback trigger log
--
-- Design principles:
--   • No user PII stored in orders — user_id references Supabase auth.users only
--   • amount stored in both pence (GBP) and sats — rate snapshot for audit
--   • anomaly_flag column feeds Command Centre griefing detection dashboard
--   • settlement_method distinguishes webhook vs NUT-07 fallback for ICO audit
--   • All timestamps UTC


-- ---------------------------------------------------------------------------
-- orders
-- ---------------------------------------------------------------------------

create table if not exists public.orders (
  -- Identity
  id                          uuid primary key default gen_random_uuid(),
  user_id                     uuid not null references auth.users(id),
  venue_id                    uuid not null references public.venues(id),

  -- Payment amounts
  amount_pence                integer not null check (amount_pence > 0),
  amount_sats                 integer not null check (amount_sats > 0),
  gbp_rate_snapshot           numeric(18, 8) not null,  -- sats per GBP at time of order

  -- NUT-18 request
  encoded_request             text not null,
  mint_url                    text not null,
  mint_quote_id               text,                     -- set on settlement

  -- State machine
  -- pending: NUT-18 request issued, awaiting payment
  -- paid:    Webhook received (or NUT-07 fallback), mint settled
  -- fulfilled: Venue terminal marked order ready
  -- collected: Customer collected (ETA widget arc → Collected state)
  -- expired:   NUT-18 validity window elapsed, HTLC auto-refunded
  -- error:     Non-recoverable error (see error_code)
  -- keyset_error: NUT-02 rotation mid-payment — token safe, retry possible
  status                      text not null default 'pending'
                                check (status in (
                                  'pending','paid','fulfilled','collected',
                                  'expired','error','keyset_error'
                                )),

  -- Settlement audit
  settlement_method           text check (settlement_method in ('WEBHOOK','NUT07_FALLBACK')),
  settled_at                  timestamptz,

  -- Error detail
  error_code                  text,
  error_detail                text,

  -- HTLC config (per-venue, set at order creation)
  htlc_timeout_seconds        integer not null default 480,

  -- Preparation gate (sabotage/no-show defence)
  -- Terminal MUST NOT show "make now" until customer ETA ≤ this value.
  -- Session 9 geofence feeds the ETA signal.
  preparation_window_seconds  integer not null default 240,

  -- Wallet identity (optional — only if customer links NWC wallet)
  -- Never used for profiling. Stored for NUT-11 P2PK handoff only.
  wallet_pubkey               text,

  -- Griefing / sabotage anomaly flag
  -- Set true by Command Centre anomaly detection (high refund rate per pubkey).
  -- Aggregate only, no identity linkage. GDPR-clean.
  anomaly_flag                boolean not null default false,

  -- Expiry
  expires_at                  timestamptz not null,

  -- Timestamps
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

-- Index: venue dashboard queries (Command Centre Track 2)
create index if not exists orders_venue_id_status_idx
  on public.orders (venue_id, status, created_at desc);

-- Index: customer order history
create index if not exists orders_user_id_created_idx
  on public.orders (user_id, created_at desc);

-- Index: griefing detection — pending orders per user in time window
create index if not exists orders_user_pending_idx
  on public.orders (user_id, status, created_at desc)
  where status = 'pending';

-- RLS: users can only read their own orders
alter table public.orders enable row level security;

create policy "Users read own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Service role full access"
  on public.orders for all
  using (auth.role() = 'service_role');


-- ---------------------------------------------------------------------------
-- venue_notifications
-- Realtime channel consumed by:
--   Track 1: Numo-fork APK (subscribes on venue_id)
--   Track 2: Command Centre API (webhook push on insert)
-- ---------------------------------------------------------------------------

create table if not exists public.venue_notifications (
  id                          uuid primary key default gen_random_uuid(),
  venue_id                    uuid not null references public.venues(id),
  order_ref                   uuid not null references public.orders(id),
  event                       text not null
                                check (event in ('ORDER_PAID','ORDER_FULFILLED','ORDER_EXPIRED','ORDER_ERROR')),
  amount_sats                 integer,
  -- Preparation gate passed through to terminal
  preparation_window_seconds  integer not null default 240,
  htlc_timeout_seconds        integer not null default 480,
  created_at                  timestamptz not null default now()
);

create index if not exists venue_notifications_venue_id_idx
  on public.venue_notifications (venue_id, created_at desc);

alter table public.venue_notifications enable row level security;

create policy "Service role full access"
  on public.venue_notifications for all
  using (auth.role() = 'service_role');


-- ---------------------------------------------------------------------------
-- customer_notifications
-- Realtime channel consumed by the mobile app ETA widget.
-- NUT-17 push triggers arc animation state change.
-- ---------------------------------------------------------------------------

create table if not exists public.customer_notifications (
  id                          uuid primary key default gen_random_uuid(),
  user_id                     uuid not null references auth.users(id),
  order_ref                   uuid not null references public.orders(id),
  event                       text not null
                                check (event in ('ORDER_PAID','ORDER_FULFILLED','ORDER_COLLECTED','ORDER_EXPIRED')),
  created_at                  timestamptz not null default now()
);

alter table public.customer_notifications enable row level security;

create policy "Users read own notifications"
  on public.customer_notifications for select
  using (auth.uid() = user_id);

create policy "Service role full access"
  on public.customer_notifications for all
  using (auth.role() = 'service_role');


-- ---------------------------------------------------------------------------
-- webhook_security_log
-- HMAC signature failure audit trail.
-- Required for ICO/GDPR compliance — demonstrates active monitoring of
-- unauthorised access attempts to payment event endpoints.
-- ---------------------------------------------------------------------------

create table if not exists public.webhook_security_log (
  id                          uuid primary key default gen_random_uuid(),
  order_ref                   text,           -- may not match a real order (spoofed)
  failure_reason              text not null
                                check (failure_reason in (
                                  'missing_headers','replay_attack','signature_mismatch'
                                )),
  -- NOTE: source_ip stored only in this security log, not in orders.
  -- Retained for 90 days per ICO guidance on security event logs.
  -- Not used for user profiling. Not linked to user identity.
  source_ip                   text,
  received_at                 timestamptz not null default now()
);

comment on column public.webhook_security_log.source_ip is
  'Retained 90 days for security audit only. Not linked to user identity. Not used for profiling.';

alter table public.webhook_security_log enable row level security;

create policy "Service role full access"
  on public.webhook_security_log for all
  using (auth.role() = 'service_role');


-- ---------------------------------------------------------------------------
-- webhook_failures
-- Retry tracking. After 3 failures + 2-min timeout:
--   1. Support auto-notified
--   2. NUT-07 fallback triggered (@gdpr-flag — server-side only)
-- ---------------------------------------------------------------------------

create table if not exists public.webhook_failures (
  id                          uuid primary key default gen_random_uuid(),
  order_ref                   uuid not null references public.orders(id),
  attempt_number              integer not null,
  failure_reason              text,
  next_retry_at               timestamptz,
  -- Set true when NUT-07 fallback is triggered
  nut07_fallback_triggered    boolean not null default false,
  -- @gdpr-flag: if NUT-07 fallback was used, log it for ICO audit trail
  nut07_fallback_at           timestamptz,
  support_notified_at         timestamptz,
  created_at                  timestamptz not null default now()
);

alter table public.webhook_failures enable row level security;

create policy "Service role full access"
  on public.webhook_failures for all
  using (auth.role() = 'service_role');


-- ---------------------------------------------------------------------------
-- venues table additions (alter, not create — venues table pre-exists)
-- ---------------------------------------------------------------------------

alter table public.venues
  add column if not exists htlc_timeout_seconds        integer not null default 480,
  add column if not exists preparation_window_seconds  integer not null default 240,
  -- BOLT12 / NUT-25 upgrade path: per-venue Lightning ramp version
  -- 'bolt11' = current; 'bolt12' = when Minibits ship NUT-25
  add column if not exists lightning_ramp_version      text not null default 'bolt11'
                                                         check (lightning_ramp_version in ('bolt11','bolt12'));

comment on column public.venues.preparation_window_seconds is
  'Terminal must not show "make now" until customer ETA <= this value. Primary defence against no-show waste and griefing.';

comment on column public.venues.lightning_ramp_version is
  'Swap to bolt12 per-venue when Minibits ship NUT-25. Zero migration needed elsewhere.';


-- ---------------------------------------------------------------------------
-- updated_at trigger (orders)
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();
