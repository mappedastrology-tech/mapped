-- Lock the billing columns on public.profiles to the server.
--
-- Before this, "Users can update own profile" was the only thing between a
-- signed-in user and a paid account. That policy is
--     USING (auth.uid() = id)   with no WITH CHECK
-- and Postgres falls back to USING for the check, so it only ever restricted
-- WHICH ROW you may write, never WHICH COLUMNS. Any authenticated user could
-- PATCH their own profiles row with {"tier":"mid"} and become a paying
-- customer for free.
--
-- Column privileges (REVOKE UPDATE (tier) ...) are not usable here: PostgREST
-- sends one UPDATE carrying every column the client mentioned, and the
-- legitimate writers -- the Stripe webhook and promo redemption -- go through
-- the service role against this same table. So the guard is a BEFORE trigger
-- that pins the billing columns for everyone except the server.
--
-- It reverts silently instead of raising. Raising would turn any client that
-- merely echoes tier back inside a profile save into a hard failure; pinning
-- the value keeps honest writes working and makes the dishonest one a no-op.
--
-- Two details this landed on rather than the obvious alternatives:
--
--   * The check reads current_user, not the 'role' claim inside
--     request.jwt.claims. Reading the claim needs a fallback for requests that
--     carry no claims at all, and "no claims" is the easiest state for a caller
--     to arrive in, so that fallback has to be deny -- at which point it is
--     simpler to ask Postgres who the caller actually is. PostgREST issues
--     SET LOCAL ROLE from the verified JWT, so current_user is always set and
--     is not something a client can talk its way out of.
--
--   * It fires on INSERT as well as UPDATE. Profile rows are normally created
--     by the SECURITY DEFINER handle_new_user trigger on auth.users, which runs
--     as the owner and passes straight through -- but "Users can insert own
--     profile" is a live policy, so an INSERT is a second door into the same
--     columns and is worth closing while we are here.

create or replace function public.profiles_lock_billing_columns()
returns trigger
language plpgsql
-- SECURITY INVOKER (the default) is deliberate: the guard reads current_user,
-- which under SECURITY DEFINER would always report the function's owner and
-- so would wave every caller through.
as $$
begin
  -- PostgREST issues SET LOCAL ROLE per request, so current_user is the
  -- caller's Postgres role: 'authenticated'/'anon' for end users, and
  -- 'service_role' for the API routes that are allowed to sell things.
  -- Profile rows created by the SECURITY DEFINER signup trigger run as the
  -- trigger's owner, which is covered here too.
  if current_user in ('service_role', 'supabase_admin', 'postgres') then
    return new;
  end if;

  if tg_op = 'INSERT' then
    -- A fresh profile always starts unpaid, whatever the client asked for.
    new.tier := 'free';
    new.stripe_customer_id := null;
    new.stripe_subscription_id := null;
    new.subscription_status := 'none';
    new.subscription_period_end := null;
    return new;
  end if;

  new.tier := old.tier;
  new.stripe_customer_id := old.stripe_customer_id;
  new.stripe_subscription_id := old.stripe_subscription_id;
  new.subscription_status := old.subscription_status;
  new.subscription_period_end := old.subscription_period_end;
  return new;
end;
$$;

drop trigger if exists profiles_lock_billing_columns on public.profiles;

create trigger profiles_lock_billing_columns
  before insert or update on public.profiles
  for each row execute function public.profiles_lock_billing_columns();
