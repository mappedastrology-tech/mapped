/**
 * POST /api/stripe/webhook — Handle Stripe webhook events.
 *
 * Events handled:
 *   - checkout.session.completed → set tier = "mid", save Stripe IDs
 *   - customer.subscription.updated → sync tier based on subscription status
 *   - customer.subscription.deleted → set tier = "free"
 *
 * IMPORTANT: This route reads the raw request body for signature verification.
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

/**
 * Extract a string customer ID from a Stripe customer field
 * (can be string | Customer | DeletedCustomer).
 */
function getCustomerId(customer: string | Stripe.Customer | Stripe.DeletedCustomer): string {
  return typeof customer === "string" ? customer : customer.id;
}

export async function POST(request: Request) {
  try {
    // Read raw body for signature verification
    const body = await request.text();
    const sig = request.headers.get("stripe-signature");

    if (!sig) {
      return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Admin client for writing to profiles
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;

        if (!userId) {
          // Try to get user ID from subscription metadata
          if (session.subscription) {
            const subscription = await stripe.subscriptions.retrieve(
              typeof session.subscription === "string"
                ? session.subscription
                : session.subscription.id
            );
            const subUserId = subscription.metadata?.supabase_user_id;
            if (subUserId) {
              await supabaseAdmin
                .from("profiles")
                .update({
                  tier: "mid",
                  stripe_customer_id: session.customer
                    ? getCustomerId(session.customer as string | Stripe.Customer | Stripe.DeletedCustomer)
                    : null,
                  stripe_subscription_id: subscription.id,
                  subscription_status: "active",
                })
                .eq("id", subUserId);
            }
          }
          break;
        }

        const subscriptionId = session.subscription
          ? typeof session.subscription === "string"
            ? session.subscription
            : session.subscription.id
          : null;

        await supabaseAdmin
          .from("profiles")
          .update({
            tier: "mid",
            stripe_customer_id: session.customer
              ? getCustomerId(session.customer as string | Stripe.Customer | Stripe.DeletedCustomer)
              : null,
            stripe_subscription_id: subscriptionId,
            subscription_status: "active",
          })
          .eq("id", userId);

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.supabase_user_id;

        if (!userId) {
          // Look up user by stripe_customer_id
          const customerId = getCustomerId(subscription.customer);
          const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("id")
            .eq("stripe_customer_id", customerId)
            .single();

          if (profile) {
            const isActive = subscription.status === "active" || subscription.status === "trialing";
            await supabaseAdmin
              .from("profiles")
              .update({
                tier: isActive ? "mid" : "free",
                subscription_status: subscription.status,
              })
              .eq("id", profile.id);
          }
          break;
        }

        const isActive = subscription.status === "active" || subscription.status === "trialing";
        await supabaseAdmin
          .from("profiles")
          .update({
            tier: isActive ? "mid" : "free",
            subscription_status: subscription.status,
          })
          .eq("id", userId);

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.supabase_user_id;

        if (!userId) {
          // Look up user by stripe_customer_id
          const customerId = getCustomerId(subscription.customer);
          const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("id")
            .eq("stripe_customer_id", customerId)
            .single();

          if (profile) {
            await supabaseAdmin
              .from("profiles")
              .update({
                tier: "free",
                subscription_status: "canceled",
                stripe_subscription_id: null,
              })
              .eq("id", profile.id);
          }
          break;
        }

        await supabaseAdmin
          .from("profiles")
          .update({
            tier: "free",
            subscription_status: "canceled",
            stripe_subscription_id: null,
          })
          .eq("id", userId);

        break;
      }

      default:
        // Unhandled event type — acknowledge receipt
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
