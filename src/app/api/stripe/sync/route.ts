/**
 * POST /api/stripe/sync — ask Stripe what this person actually has, and
 * write it down.
 *
 * Webhooks are the normal path and they are fine. This exists for the cases
 * where the normal path does not happen:
 *
 *   - **Checkout now finishes outside the app.** Apple's 3.1.1 means the
 *     native app hands the URL to the system browser (see lib/openCheckout),
 *     so someone pays in Safari and switches back. The app was never
 *     unmounted, nothing re-read the profile, and it still believed they were
 *     on the free tier. They paid and nothing happened, which is the worst
 *     thing a payment flow can do.
 *   - **A webhook can be missed.** A deploy mid-delivery, a bad signing
 *     secret, an endpoint that 500s past Stripe's retries — any of these
 *     leave a paying customer on free with no way back except support.
 *   - **Events can arrive out of order.** Stripe does not guarantee ordering,
 *     so a stale `subscription.updated` can land after a `deleted`.
 *
 * Reading the subscription directly sidesteps all three, because Stripe is
 * the source of truth rather than a stream of things that happened to it.
 *
 * Headers: Authorization: Bearer <supabase_access_token>
 * Returns: { tier, status } — what was written.
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

/**
 * Statuses that still entitle someone to what they paid for. Deliberately the
 * same list as the webhook's — past_due included, because Stripe spends about
 * three weeks retrying a failed card and the person is a customer throughout.
 */
const ENTITLED = new Set<Stripe.Subscription.Status>(["active", "trialing", "past_due"]);

function tierOf(sub: Stripe.Subscription): "mid" | "max" {
  return sub.metadata?.mapped_tier === "max" ? "max" : "mid";
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const { data: profile } = await admin
      .from("profiles")
      .select("stripe_customer_id, stripe_subscription_id, tier")
      .eq("id", user.id)
      .single();

    let customerId: string | null = profile?.stripe_customer_id ?? null;

    /**
     * No customer id yet is the common case right after a first purchase:
     * checkout.session.completed is what normally records it, and this may be
     * running precisely because that never arrived. Find them by the email on
     * the account rather than giving up.
     */
    if (!customerId && user.email) {
      const found = await stripe.customers.list({ email: user.email, limit: 1 });
      customerId = found.data[0]?.id ?? null;
      if (customerId) {
        await admin.from("profiles").update({ stripe_customer_id: customerId }).eq("id", user.id);
      }
    }

    if (!customerId) {
      // Genuinely never bought anything. Not an error.
      return NextResponse.json({ tier: "free", status: null, reason: "no_customer" });
    }

    const subs = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 10,
    });

    /**
     * The best subscription they hold, not merely the newest.
     *
     * Someone who upgraded mid-cycle can briefly have two rows, and an old
     * canceled one sorts unpredictably against a new active one. Picking by
     * entitlement and then by tier means an upgrade can never read as a
     * downgrade.
     */
    const RANK = { free: 0, mid: 1, max: 2 } as const;
    let best: Stripe.Subscription | null = null;
    for (const sub of subs.data) {
      if (!ENTITLED.has(sub.status)) continue;
      if (!best || RANK[tierOf(sub)] > RANK[tierOf(best)]) best = sub;
    }

    /**
     * Never downgrade somebody Stripe was never the source of truth for.
     *
     * Not every paid account came through checkout. A tier can be granted in
     * the database — a comp, a friend, a tester, support making something
     * right — and a promo code does the same thing. None of those have a
     * subscription, so Stripe correctly reports nothing entitled, and writing
     * "free" on the strength of that silently revokes a tier somebody
     * deliberately gave. This route runs on every app foreground, so the
     * revocation would land within a minute of them opening the app, with no
     * event and no record of why.
     *
     * A customer id alone is not evidence: anyone who ever opened checkout —
     * or who shares an email with a Stripe customer, which is how we match
     * when the id is missing — has one. The evidence that Stripe owns this
     * account's tier is a subscription: one live now, or one we recorded
     * earlier and that has since ended. That second case is the real lapse,
     * and it still downgrades.
     */
    const stripeOwnsTier = !!best || !!profile?.stripe_subscription_id;
    const tier = best ? tierOf(best) : stripeOwnsTier ? "free" : undefined;
    const status = best?.status ?? subs.data[0]?.status ?? null;

    /**
     * What they are actually paying, and when it renews.
     *
     * Read off the price rather than the metadata we stamped at checkout: a
     * plan changed later in the billing portal updates the price and not our
     * metadata, so metadata would drift into quoting the wrong figure.
     */
    const item = best?.items?.data?.[0];
    const interval = item?.price?.recurring?.interval === "year" ? "year"
      : item?.price?.recurring?.interval === "month" ? "month"
      : null;
    const periodEnd = typeof item?.current_period_end === "number"
      ? new Date(item.current_period_end * 1000).toISOString()
      : null;
    // Cancelled in the portal but still running: status stays "active" to the
    // end of the paid period, so only this flag tells a renewal from an expiry.
    const cancelAtPeriodEnd = best?.cancel_at_period_end === true;

    await admin
      .from("profiles")
      .update({
        // Omitted entirely, not set to null, when Stripe does not own this
        // account's tier — a key that is absent is a column left alone.
        ...(tier === undefined ? {} : { tier }),
        subscription_status: status,
        stripe_subscription_id: best?.id ?? null,
        subscription_interval: interval,
        subscription_period_end: periodEnd,
        subscription_cancel_at_period_end: cancelAtPeriodEnd,
      })
      .eq("id", user.id);

    // The caller compares this against what it is showing, so report the tier
    // the account actually has, not the one Stripe would have picked.
    return NextResponse.json({
      tier: tier ?? profile?.tier ?? "free",
      status,
      interval,
      periodEnd,
      cancelAtPeriodEnd,
    });
  } catch (err) {
    console.error("[stripe] sync failed:", err);
    // Deliberately vague: the reader cannot act on a Stripe API error, and
    // this is called in the background where a scary string helps nobody.
    return NextResponse.json({ error: "Could not check your subscription." }, { status: 502 });
  }
}
