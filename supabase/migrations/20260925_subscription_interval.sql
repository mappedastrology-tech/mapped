-- Remember whether a subscription is billed monthly or yearly.
--
-- Account settings quoted every paying subscriber "$11.11/month", because
-- that is what TIERS[tier].price says and nothing recorded which plan they
-- actually bought. Since annual billing shipped, someone paying $100 a year
-- was shown a monthly price they are not paying — which is the shape of
-- thing that produces "why was I charged $100?" support mail, and reads as
-- careless on the one screen where money is discussed.
--
-- subscription_period_end already existed (stripe-migration.sql) and was
-- likewise never written by anything. Both are needed to say the true
-- sentence: "$100 a year — renews 25 September 2027."
--
-- Both are billing columns, so both join the set that
-- profiles_lock_billing_columns pins to the server. Adding a column without
-- adding it there would leave a hole in a guard that exists precisely because
-- "Users can update own profile" has no WITH CHECK: any authenticated client
-- could PATCH its own row and change what the app believes about its billing.

alter table public.profiles
  add column if not exists subscription_interval text
    check (subscription_interval in ('month', 'year'));

-- Same function, two more pinned columns. Kept as a full replacement rather
-- than a patch so the pinned set can be read in one place.
create or replace function public.profiles_lock_billing_columns()
returns trigger
language plpgsql
-- SECURITY INVOKER (the default) is deliberate: the guard reads current_user,
-- which under SECURITY DEFINER would always report the function's owner and
-- so would wave every caller through.
as $$
begin
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
    new.subscription_interval := null;
    return new;
  end if;

  new.tier := old.tier;
  new.stripe_customer_id := old.stripe_customer_id;
  new.stripe_subscription_id := old.stripe_subscription_id;
  new.subscription_status := old.subscription_status;
  new.subscription_period_end := old.subscription_period_end;
  new.subscription_interval := old.subscription_interval;
  return new;
end;
$$;

drop trigger if exists profiles_lock_billing_columns on public.profiles;

create trigger profiles_lock_billing_columns
  before insert or update on public.profiles
  for each row execute function public.profiles_lock_billing_columns();
