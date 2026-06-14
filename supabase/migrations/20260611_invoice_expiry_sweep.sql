-- Invoice expiry sweep — pg_cron job
-- Runs every 5 minutes; marks awaiting_payment orders as expired
-- when bolt11_expires_at has passed.
-- Requires pg_cron extension enabled in Supabase.

-- Enable extension if not already present
create extension if not exists pg_cron schema extensions;

-- Remove existing job if redeploying
select cron.unschedule('refueler-invoice-expiry-sweep')
  where exists (
    select 1 from cron.job where jobname = 'refueler-invoice-expiry-sweep'
  );

-- Schedule sweep every 5 minutes
select cron.schedule(
  'refueler-invoice-expiry-sweep',
  '*/5 * * * *',
  $$
    update public.merchant_orders
    set payment_status = 'expired'
    where payment_status = 'awaiting_payment'
      and bolt11_expires_at is not null
      and bolt11_expires_at < now();
  $$
);
