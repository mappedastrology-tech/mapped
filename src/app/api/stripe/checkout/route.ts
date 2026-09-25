/**
 * POST /api/stripe/checkout — Create a Stripe Checkout Session for subscription.
 *
 * Body: (none required — uses STRIPE_PRICE_ID env var)
 * Headers: Authorization: Bearer <supabase_access_token>
 * Returns: { url: string } — the Stripe Checkout URL to redirect to
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { stripe } from "@/lib/stripe";
import { returnBaseUrl } from "@/lib/siteUrl";

export async function POST(request: Request) {
  try {
    // Authenticate the user via Supabase
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Check if user already has a stripe_customer_id
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    // Which plan is being bought. Anything unrecognised is treated as the
    // $11.11 tier rather than rejected, so an older client that posts no body
    // still checks out at the price it was showing.
    let plan: "mid" | "max" = "mid";
    /**
     * Monthly unless asked otherwise. An older client that posts no interval
     * gets the monthly price it was showing, rather than being billed a year
     * up front for a button that said $11.11.
     */
    let interval: "month" | "year" = "month";
    try {
      const body = await request.json();
      if (body?.plan === "max") plan = "max";
      if (body?.interval === "year") interval = "year";
    } catch { /* no body — keep the defaults */ }

    // Build checkout session params
    // Not the raw Origin header: inside the app that is https://localhost,
    // and checkout now opens in the system browser, which cannot reach it.
    const origin = returnBaseUrl(request.headers.get("origin"));
    /**
     * Never sell a second subscription to somebody who already has one.
     *
     * Checkout creates a NEW subscription every time. Account settings now
     * offers a Mapped+ subscriber a "Compare with Mapped Complete" button,
     * and the plans sheet put a "Subscribe — $22.22/month" under it — so one
     * tap billed them for Complete WITHOUT ending Mapped+, and they paid
     * $33.33 a month for one account until somebody noticed. Stripe will
     * happily do this; nothing about a second subscription looks like an
     * error to it.
     *
     * A plan change is a different operation from a purchase, and Stripe has
     * a screen for it: the portal's subscription_update flow, which prorates
     * the difference and replaces the plan rather than adding one. Sending
     * them there is both the correct billing and the honest one.
     */
    if (profile?.stripe_customer_id) {
      const existing = await stripe.subscriptions.list({
        customer: profile.stripe_customer_id,
        status: "all",
        limit: 10,
      });
      // Same entitled set as the webhook and the sync route: past_due counts,
      // because Stripe is still retrying and the subscription is still live.
      const live = existing.data.find((s) =>
        s.status === "active" || s.status === "trialing" || s.status === "past_due",
      );
      if (live) {
        try {
          const flow = await stripe.billingPortal.sessions.create({
            customer: profile.stripe_customer_id,
            return_url: `${origin}/account`,
            flow_data: {
              type: "subscription_update",
              subscription_update: { subscription: live.id },
            },
          });
          return NextResponse.json({ url: flow.url, mode: "portal" });
        } catch (err) {
          /**
           * The update flow needs the portal configuration to have plan
           * switching turned on with the products listed. If it is not, this
           * throws — and the one thing we must not do then is fall through to
           * creating a second subscription. A plain portal session still lets
           * them change or cancel; it just costs them a click.
           */
          console.error("[stripe] subscription_update flow unavailable:", err);
          const plain = await stripe.billingPortal.sessions.create({
            customer: profile.stripe_customer_id,
            return_url: `${origin}/account`,
          });
          return NextResponse.json({ url: plain.url, mode: "portal" });
        }
      }
    }

    /**
     * Four prices: two tiers times two billing intervals. Each is its own
     * Stripe Price object, so each needs its own env var.
     *
     * An unconfigured ANNUAL price falls back to the monthly one rather than
     * 500ing — but that would silently charge a month for a button that said
     * a year, which is worse than failing. So it refuses instead, and says
     * which variable is missing in the log.
     */
    const PRICE_ENV: Record<"mid" | "max", Record<"month" | "year", string>> = {
      mid: { month: "STRIPE_PRICE_ID", year: "STRIPE_PRICE_ID_ANNUAL" },
      max: { month: "STRIPE_PRICE_ID_MAX", year: "STRIPE_PRICE_ID_MAX_ANNUAL" },
    };
    const envName = PRICE_ENV[plan][interval];
    const priceId = process.env[envName];
    if (!priceId) {
      console.error(`[stripe] no price configured for plan "${plan}" ${interval}ly — set ${envName}`);
      return NextResponse.json({ error: "Stripe price not configured" }, { status: 500 });
    }

    const sessionParams: Record<string, unknown> = {
      mode: "subscription" as const,
      payment_method_types: ["card"] as const,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${origin}/home?upgraded=true`,
      cancel_url: `${origin}/home`,
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
          // The webhook reads this to decide which tier to grant. It rides on
          // the subscription, not just the session, so renewals and plan
          // changes still say which tier they are for.
          mapped_tier: plan,
          mapped_interval: interval,
        },
      },
      metadata: {
        supabase_user_id: user.id,
        mapped_tier: plan,
        mapped_interval: interval,
      },
    };

    // Reuse existing Stripe customer if we have one
    if (profile?.stripe_customer_id) {
      sessionParams.customer = profile.stripe_customer_id;
    } else {
      sessionParams.customer_email = user.email;
    }

    const session = await stripe.checkout.sessions.create(
      sessionParams as Parameters<typeof stripe.checkout.sessions.create>[0]
    );

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
