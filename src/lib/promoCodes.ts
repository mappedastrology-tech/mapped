/**
 * Promo Code System — Validate and redeem promotional codes.
 *
 * Code types:
 *   - free_subscription: Grants full tier access for a duration (no payment)
 *   - discount_percent: Percentage off monthly price for a duration
 *   - extended_trial: Free trial period at a tier level
 *
 * Supabase table: `promo_codes`
 * Columns:
 *   id (uuid, primary key)
 *   code (text, unique, not null) — the code users enter (case-insensitive)
 *   type (text, not null) — "free_subscription" | "discount_percent" | "extended_trial"
 *   tier_granted (text) — which tier to grant: "mid" or "top"
 *   discount_percent (int) — for discount type, e.g. 50 = 50% off
 *   duration_days (int, not null) — how long the benefit lasts
 *   max_uses (int) — null = unlimited
 *   current_uses (int, default 0)
 *   expires_at (timestamptz) — null = never expires
 *   active (boolean, default true)
 *   created_at (timestamptz, default now())
 *   note (text) — internal note about who/why
 *
 * Supabase table: `promo_redemptions`
 * Columns:
 *   id (uuid, primary key)
 *   user_id (uuid, references auth.users)
 *   promo_code_id (uuid, references promo_codes)
 *   redeemed_at (timestamptz, default now())
 *   expires_at (timestamptz) — when this user's benefit expires
 *   type (text) — copied from promo_codes for quick access
 *   tier_granted (text)
 *   discount_percent (int)
 *
 * SQL to create these tables (run in Supabase SQL editor):
 *
 * CREATE TABLE promo_codes (
 *   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 *   code text UNIQUE NOT NULL,
 *   type text NOT NULL CHECK (type IN ('free_subscription', 'discount_percent', 'extended_trial')),
 *   tier_granted text CHECK (tier_granted IN ('mid', 'top')),
 *   discount_percent int CHECK (discount_percent > 0 AND discount_percent <= 100),
 *   duration_days int NOT NULL CHECK (duration_days > 0),
 *   max_uses int,
 *   current_uses int DEFAULT 0,
 *   expires_at timestamptz,
 *   active boolean DEFAULT true,
 *   created_at timestamptz DEFAULT now(),
 *   note text
 * );
 *
 * CREATE TABLE promo_redemptions (
 *   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 *   user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 *   promo_code_id uuid NOT NULL REFERENCES promo_codes(id),
 *   redeemed_at timestamptz DEFAULT now(),
 *   expires_at timestamptz NOT NULL,
 *   type text NOT NULL,
 *   tier_granted text,
 *   discount_percent int,
 *   UNIQUE(user_id, promo_code_id)
 * );
 *
 * -- Enable RLS
 * ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE promo_redemptions ENABLE ROW LEVEL SECURITY;
 *
 * -- Users can't read promo_codes directly (only via API)
 * -- Users can read their own redemptions
 * CREATE POLICY "Users can read own redemptions"
 *   ON promo_redemptions FOR SELECT
 *   USING (auth.uid() = user_id);
 */

import { type TierLevel } from "./tier";

/* ─── Types ─── */

export type PromoType = "free_subscription" | "discount_percent" | "extended_trial";

export interface PromoCode {
  id: string;
  code: string;
  type: PromoType;
  tier_granted: TierLevel | null;
  discount_percent: number | null;
  duration_days: number;
  max_uses: number | null;
  current_uses: number;
  expires_at: string | null;
  active: boolean;
  created_at: string;
  note: string | null;
}

export interface PromoRedemption {
  id: string;
  user_id: string;
  promo_code_id: string;
  redeemed_at: string;
  expires_at: string;
  type: PromoType;
  tier_granted: TierLevel | null;
  discount_percent: number | null;
}

export interface RedeemResult {
  success: boolean;
  error?: string;
  redemption?: PromoRedemption;
  message?: string;
}

/* ─── Validation ─── */

export function validatePromoCode(code: PromoCode): { valid: boolean; reason?: string } {
  if (!code.active) {
    return { valid: false, reason: "This code is no longer active." };
  }

  if (code.expires_at && new Date(code.expires_at) < new Date()) {
    return { valid: false, reason: "This code has expired." };
  }

  if (code.max_uses !== null && code.current_uses >= code.max_uses) {
    return { valid: false, reason: "This code has reached its maximum uses." };
  }

  return { valid: true };
}

/* ─── Display helpers ─── */

export function describePromo(code: PromoCode): string {
  switch (code.type) {
    case "free_subscription":
      return `Free ${code.tier_granted === "top" ? "Top" : "Mid"} access for ${code.duration_days} days`;
    case "discount_percent":
      return `${code.discount_percent}% off for ${code.duration_days} days`;
    case "extended_trial":
      return `${code.duration_days}-day free trial of ${code.tier_granted === "top" ? "Top" : "Mid"}`;
    default:
      return "Promotional offer";
  }
}

export function getExpirationDate(durationDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + durationDays);
  return d.toISOString();
}

/**
 * Check if the user has an active (non-expired) redemption that grants tier access.
 * Returns the highest active tier or null.
 */
export function getActivePromoTier(redemptions: PromoRedemption[]): TierLevel | null {
  const now = new Date();
  const active = redemptions.filter(r =>
    new Date(r.expires_at) > now &&
    (r.type === "free_subscription" || r.type === "extended_trial") &&
    r.tier_granted
  );

  if (active.length === 0) return null;

  // Return highest tier among active promos
  const hasTop = active.some(r => r.tier_granted === "top");
  if (hasTop) return "top";
  return "mid";
}

/**
 * Check if user has an active discount promo.
 */
export function getActiveDiscount(redemptions: PromoRedemption[]): { percent: number; expiresAt: string } | null {
  const now = new Date();
  const active = redemptions.find(r =>
    new Date(r.expires_at) > now &&
    r.type === "discount_percent" &&
    r.discount_percent
  );

  if (!active) return null;
  return { percent: active.discount_percent!, expiresAt: active.expires_at };
}
