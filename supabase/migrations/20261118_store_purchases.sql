-- In-app purchases through the App Store and Google Play (via RevenueCat).
--
-- The web keeps selling through Stripe. These columns record what the stores
-- grant on their own, so the two sources can be combined without either one
-- overwriting the other. profiles.tier stays the single column every gate
-- reads; the server writes it as the higher of the two (lib/storeEntitlements).
--
-- Apply after every earlier migration. Safe to run twice.

alter table public.profiles
  add column if not exists store_tier text not null default 'free',
  add column if not exists store_platform text,
  add column if not exists store_period_end timestamptz,
  add column if not exists store_will_renew boolean;

alter table public.profiles
  drop constraint if exists profiles_store_tier_check;
alter table public.profiles
  add constraint profiles_store_tier_check check (store_tier in ('free', 'mid', 'max'));

-- Decks bought in the stores. A store purchase has no Stripe session, so it
-- carries the store's transaction id instead.
alter table public.purchased_decks
  add column if not exists store_transaction_id text;

alter table public.purchased_decks
  drop constraint if exists purchased_decks_source_check;
alter table public.purchased_decks
  add constraint purchased_decks_source_check
  check (source in ('purchase', 'free_pick', 'store'));

-- The store columns are billing columns: only the server may write them.
-- Same rule, and the same reasoning, as profiles_lock_billing_columns
-- (20260922_lock_profile_tier_to_server.sql). A separate trigger so that
-- migration does not need to be re-run.
create or replace function public.profiles_lock_store_columns()
returns trigger
language plpgsql
as $$
begin
  if current_user in ('service_role', 'supabase_admin', 'postgres') then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.store_tier := 'free';
    new.store_platform := null;
    new.store_period_end := null;
    new.store_will_renew := null;
    return new;
  end if;

  new.store_tier := old.store_tier;
  new.store_platform := old.store_platform;
  new.store_period_end := old.store_period_end;
  new.store_will_renew := old.store_will_renew;
  return new;
end;
$$;

drop trigger if exists profiles_lock_store_columns on public.profiles;

create trigger profiles_lock_store_columns
  before insert or update on public.profiles
  for each row execute function public.profiles_lock_store_columns();
