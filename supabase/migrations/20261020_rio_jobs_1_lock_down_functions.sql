-- RIO-Jobs-1 · 20 Oct 2026 · Supabase security advisors lock-down
-- Refueler.io functions only. Share's tables and functions (api_*, auth_*, quota_*,
-- chartered_orgs) are not touched.

-- 1. Vault encrypt/decrypt helpers: no caller (Edge Functions encrypt in Deno with
--    their own key). Callable by anon they are an open encrypt/decrypt service.
revoke execute on function public.decrypt_bolt11(text) from public, anon, authenticated;
revoke execute on function public.encrypt_bolt11(text) from public, anon, authenticated;

-- 2. pg_cron jobs: run as postgres, so no API role needs them.
revoke execute on function public.sweep_expired_invoices()    from public, anon, authenticated;
revoke execute on function public.reconcile_orphaned_orders() from public, anon, authenticated;
revoke execute on function public.trigger_rail_signal_poll()  from public, anon, authenticated;

-- 3. Trigger functions: EXECUTE is only checked at CREATE TRIGGER, not when they fire.
revoke execute on function public.handle_new_user()                 from public, anon, authenticated;
revoke execute on function public.franchise_hq_venue_update_guard() from public, anon, authenticated;
revoke execute on function public.set_updated_at()                  from public, anon, authenticated;
revoke execute on function public.set_menu_item_updated_at()        from public, anon, authenticated;

-- 4. Franchise dashboard: the page signs in (magic link) before calling it, and the
--    function scopes by auth.uid(). Signed-in only; stays SECURITY DEFINER.
revoke execute on function public.franchise_dashboard_summary(text) from public, anon;
grant  execute on function public.franchise_dashboard_summary(text) to authenticated;

-- 5. Fixed search_path on the updated_at triggers (body uses now() only).
alter function public.set_updated_at()           set search_path = '';
alter function public.set_menu_item_updated_at() set search_path = '';

-- 6. New functions in public: no automatic EXECUTE for API roles from now on.
alter default privileges for role postgres in schema public
  revoke execute on functions from anon, authenticated;
alter default privileges for role postgres
  revoke execute on functions from public;
