-- Remember that a subscription has been cancelled but is still running.
--
-- Cancelling in Stripe's billing portal does not end a subscription there and
-- then; it sets cancel_at_period_end and leaves the status "active" until the
-- paid-for period runs out. We store the status and the period end, so
-- account settings had everything it needed to be wrong: it read "active",
-- found a period end, and said "Renews 25 October 2026" to somebody who had
-- cancelled and whose access ENDS on that date. The one sentence they came
-- back to the screen to check was the one sentence it got backwards.
--
-- Nothing else distinguishes the two cases. "Active with a future period end"
-- is both a renewal and an expiry, and only this flag says which.
--
-- Billing column, so it joins the pinned set in the lock trigger. Stated as a
-- full replacement of the function, as in 20260925_subscription_interval.sql,
-- so the pinned set is always readable in one place.

alter table public.profiles
  add column if not exists subscription_cancel_at_period_end boolean not null default false;

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
    new.subscription_cancel_at_period_end := false;
    return new;
  end if;

  new.tier := old.tier;
  new.stripe_customer_id := old.stripe_customer_id;
  new.stripe_subscription_id := old.stripe_subscription_id;
  new.subscription_status := old.subscription_status;
  new.subscription_period_end := old.subscription_period_end;
  new.subscription_interval := old.subscription_interval;
  new.subscription_cancel_at_period_end := old.subscription_cancel_at_period_end;
  return new;
end;
$$;

drop trigger if exists profiles_lock_billing_columns on public.profiles;

create trigger profiles_lock_billing_columns
  before insert or update on public.profiles
  for each row execute function public.profiles_lock_billing_columns();
