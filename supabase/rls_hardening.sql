-- ─────────────────────────────────────────────────────────────────────────────
-- RLS HARDENING for tables that were created in the dashboard (no committed
-- schema): horoscope_cache, push_subscriptions, promo_codes, promo_redemptions.
--
-- WHY THIS MATTERS: the Supabase anon key is shipped to the browser
-- (NEXT_PUBLIC_*). ANY table without Row Level Security is therefore readable
-- AND writable by anyone on the internet through Supabase's REST API, bypassing
-- the app entirely. Every user-data table MUST have RLS enabled with correct
-- policies.
--
-- Run this in the Supabase SQL editor. It is idempotent (safe to re-run).
-- If a column name below doesn't match your table, adjust it — these assume a
-- `user_id uuid` column where applicable.
--
-- First, confirm current status:
--   select c.relname, c.relrowsecurity as rls_on,
--          (select count(*) from pg_policies p where p.tablename = c.relname) as policies
--   from pg_class c join pg_namespace n on n.oid = c.relnamespace
--   where n.nspname = 'public' and c.relkind = 'r'
--   order by rls_on, relname;
-- Any row with rls_on = false that holds user data is exposed — fix it.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── horoscope_cache ──────────────────────────────────────────────────────────
-- ⚠️ ORDERING: run this block ONLY AFTER you have deployed the horoscope route
-- change that switches the cache to the service-role client (`npm run deploy`).
-- Until that deploy is live, the route still reads/writes this table with the
-- public anon key — so enabling RLS now would break the cache (horoscopes would
-- just regenerate each time, costing more). Deploy first, then run this line.
-- After deploy: the route uses the service role (bypasses RLS), and enabling RLS
-- with NO client policies stops the public anon key from dumping cached horoscopes.
ALTER TABLE public.horoscope_cache ENABLE ROW LEVEL SECURITY;
-- (intentionally no anon/authenticated policies — service role only)

-- ── promo_codes ──────────────────────────────────────────────────────────────
-- Accessed only via the service role in the redeem route. Lock out all client
-- access so promo codes can never be enumerated with the public anon key.
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
-- (intentionally no anon/authenticated policies — service role only)

-- ── promo_redemptions ────────────────────────────────────────────────────────
-- Inserted via the service role (redeem route); read by the client (TierProvider)
-- with the user's session. Users may read only their OWN redemptions.
ALTER TABLE public.promo_redemptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own redemptions" ON public.promo_redemptions;
CREATE POLICY "Users read own redemptions"
  ON public.promo_redemptions FOR SELECT
  USING (auth.uid() = user_id);

-- ── push_subscriptions ───────────────────────────────────────────────────────
-- Written by the client (lib/notifications.ts) with the user's session; read &
-- pruned by the cron/notifications routes via the service role. Users may manage
-- only their own subscription rows.
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users manage own push subscriptions"
  ON public.push_subscriptions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- AFTER RUNNING: re-run the status query at the top and confirm every public
-- table that holds user data shows rls_on = true. Also spot-check from a browser
-- with only the anon key that you CANNOT select from these tables.
-- ─────────────────────────────────────────────────────────────────────────────
