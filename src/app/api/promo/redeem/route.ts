/**
 * POST /api/promo/redeem — Validate and redeem a promo code.
 *
 * Body: { code: string }
 * Returns: { success, message, redemption } or { success: false, error }
 *
 * Flow:
 * 1. Look up code (case-insensitive)
 * 2. Validate (active, not expired, not maxed out)
 * 3. Check user hasn't already redeemed this code
 * 4. Create redemption record
 * 5. Increment usage count
 * 6. If free_subscription or extended_trial, update user's tier in profiles
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { validatePromoCode, getExpirationDate, describePromo, getHardcodedPromo, type PromoCode } from "@/lib/promoCodes";

export async function POST(request: Request) {
  try {
    // Get the user's auth token from the request
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    const token = authHeader.slice(7);

    // Create Supabase client with user's token for auth
    const supabaseUser = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    // Get current user
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    // Parse body
    const { code } = await request.json();
    if (!code || typeof code !== "string") {
      return NextResponse.json({ success: false, error: "Please enter a promo code." }, { status: 400 });
    }

    // Use service role for promo operations (users can't read promo_codes directly)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Check hardcoded promo codes first (no database entry needed)
    const hardcoded = getHardcodedPromo(code);
    if (hardcoded) {
      // For hardcoded codes, store the code name in the user's profile metadata
      // instead of promo_redemptions (which has a FK to promo_codes table)
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("tier")
        .eq("id", user.id)
        .single();

      // Check if already redeemed by looking at tier + a metadata column
      // Simple approach: just check if they already have the tier
      if (profile?.tier === "mid") {
        return NextResponse.json({ success: false, error: "You already have Mapped+ access." }, { status: 400 });
      }

      // Update user's profile tier directly
      const { error: updateError } = await supabaseAdmin
        .from("profiles")
        .update({ tier: hardcoded.tier_granted })
        .eq("id", user.id);

      if (updateError) {
        console.error("[promo/redeem] hardcoded update error:", updateError);
        return NextResponse.json({ success: false, error: "Failed to redeem code. Try again." }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: describePromo(hardcoded),
      });
    }

    // Look up code in database (case-insensitive)
    const { data: promoCode, error: lookupError } = await supabaseAdmin
      .from("promo_codes")
      .select("*")
      .ilike("code", code.trim())
      .single();

    if (lookupError || !promoCode) {
      return NextResponse.json({ success: false, error: "Invalid promo code." }, { status: 404 });
    }

    const promo = promoCode as PromoCode;

    // Validate
    const { valid, reason } = validatePromoCode(promo);
    if (!valid) {
      return NextResponse.json({ success: false, error: reason }, { status: 400 });
    }

    // Check if user already redeemed this code
    const { data: existing } = await supabaseAdmin
      .from("promo_redemptions")
      .select("id")
      .eq("user_id", user.id)
      .eq("promo_code_id", promo.id)
      .single();

    if (existing) {
      return NextResponse.json({ success: false, error: "You've already used this code." }, { status: 400 });
    }

    // Compute expiration
    const expiresAt = getExpirationDate(promo.duration_days);

    // Create redemption
    const { data: redemption, error: redeemError } = await supabaseAdmin
      .from("promo_redemptions")
      .insert({
        user_id: user.id,
        promo_code_id: promo.id,
        expires_at: expiresAt,
        type: promo.type,
        tier_granted: promo.tier_granted,
        discount_percent: promo.discount_percent,
      })
      .select()
      .single();

    if (redeemError) {
      console.error("[promo/redeem] insert error:", redeemError);
      return NextResponse.json({ success: false, error: "Failed to redeem code. Try again." }, { status: 500 });
    }

    // Increment usage count
    await supabaseAdmin
      .from("promo_codes")
      .update({ current_uses: promo.current_uses + 1 })
      .eq("id", promo.id);

    // If it grants tier access, update the user's profile
    if ((promo.type === "free_subscription" || promo.type === "extended_trial") && promo.tier_granted) {
      await supabaseAdmin
        .from("profiles")
        .update({ tier: promo.tier_granted })
        .eq("id", user.id);
    }

    return NextResponse.json({
      success: true,
      message: describePromo(promo),
      redemption,
      expiresAt,
    });
  } catch (err) {
    console.error("[promo/redeem] error:", err);
    return NextResponse.json({ success: false, error: "Something went wrong." }, { status: 500 });
  }
}
