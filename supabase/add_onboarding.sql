-- Add onboarding_completed flag to profiles
-- Run this against your Supabase SQL editor

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;

-- Set existing users as onboarded (they've already been using the app)
UPDATE profiles SET onboarding_completed = true WHERE onboarding_completed IS NULL OR onboarding_completed = false;

-- For brand new users the default is false, so they'll go through onboarding.
-- To re-trigger onboarding for a user: UPDATE profiles SET onboarding_completed = false WHERE id = '<user_id>';
