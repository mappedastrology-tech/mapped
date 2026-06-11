-- Stripe subscription columns for the profiles table.
-- Run this migration against your Supabase database.

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tier text DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'none';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_period_end timestamptz;
