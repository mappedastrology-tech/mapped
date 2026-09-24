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
/**
 * Accepts null because an Invoice's customer can be null, unlike a
 * Subscription's. Returns "" rather than null so every call site's existing
 * truthiness check keeps working.
 */
function getCustomerId(
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null | undefined,
): string {
  if (!customer) return "";
  return typeof customer === "string" ? customer : customer.id;
}

/**
 * Which tier a subscription grants.
 *
 * /api/stripe/checkout stamps `mapped_tier` onto both the session and the
 * subscription. Defaulting to "mid" rather than "free" matters: subscriptions
 * sold before this metadata existed carry none, and reading them as free would
 * cancel paying customers the first time Stripe sent an update about them.
 */
function tierFromMetadata(metadata: Stripe.Metadata | null | undefined): "mid" | "max" {
  return metadata?.mapped_tier === "max" ? "max" : "mid";
}

/**
 * Which subscription statuses still entitle someone to what they paid for.
 *
 * `past_due` is the important one, and it used to be missing. When a renewal
 * payment fails, Stripe sets the subscription to past_due and then spends
 * about three weeks retrying the card — that is what dunning IS. The
 * subscriber is still a customer the whole time, and most failures are a
 * card that expired or a bank that declined once.
 *
 * Treating anything outside active/trialing as "free" therefore cut off
 * paying customers the instant a card blipped: Dolly gone, the map gone,
 * everything gone, with no explanation anywhere, while Stripe was still
 * trying to charge them. A person who opens the app to find they have been
 * silently demoted does not go and fix their card; they conclude the app took
 * their money and broke, and they leave. Involuntary churn like that is a
 * large share of consumer subscription churn, and it is the cheapest kind to
 * prevent.
 *
 * `unpaid` is NOT here: Stripe sets it once retries are exhausted and it has
 * given up, which is a genuine end of the relationship.
 */
const ENTITLED_STATUSES = new Set<Stripe.Subscription.Status>([
  "active",
  "trialing",
  "past_due",
]);

function isEntitled(status: Stripe.Subscription.Status): boolean {
  return ENTITLED_STATUSES.has(status);
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

        // ── One-time DECK purchase (store) ──────────────────────────────
        // mode=payment sessions with a deck_id are deck-store orders. They
        // must NOT fall through to the subscription branch below (which
        // would wrongly set tier="mid" for a $4.99 deck).
        const deckId = session.metadata?.deck_id;
        if (session.mode === "payment" && deckId) {
          if (userId) {
            await supabaseAdmin.from("purchased_decks").upsert(
              {
                user_id: userId,
                deck_id: deckId,
                stripe_session_id: session.id,
                stripe_payment_intent:
                  typeof session.payment_intent === "string"
                    ? session.payment_intent
                    : session.payment_intent?.id ?? null,
                amount_cents: session.amount_total ?? null,
                currency: session.currency ?? "usd",
              },
              { onConflict: "user_id,deck_id" },
            );
            // Remember the Stripe customer for future purchases.
            if (session.customer) {
              await supabaseAdmin
                .from("profiles")
                .update({
                  stripe_customer_id: getCustomerId(
                    session.customer as string | Stripe.Customer | Stripe.DeletedCustomer,
                  ),
                })
                .eq("id", userId)
                .is("stripe_customer_id", null);
            }
          }
          break;
        }

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
                  tier: tierFromMetadata(subscription.metadata),
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
            tier: tierFromMetadata(session.metadata),
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
            await supabaseAdmin
              .from("profiles")
              .update({
                tier: isEntitled(subscription.status) ? tierFromMetadata(subscription.metadata) : "free",
                subscription_status: subscription.status,
              })
              .eq("id", profile.id);
          }
          break;
        }

        await supabaseAdmin
          .from("profiles")
          .update({
            tier: isEntitled(subscription.status) ? tierFromMetadata(subscription.metadata) : "free",
            subscription_status: subscription.status,
          })
          .eq("id", userId);

        break;
      }

      /**
       * A renewal failed. Stripe will keep retrying for about three weeks.
       *
       * Neither of these was handled at all, so the app had no idea a payment
       * had failed or later succeeded — subscription_status was written to
       * the profile and read nowhere. Recording it is what lets the account
       * screen say "your card needs attention" instead of the subscriber
       * finding out by things quietly not working.
       */
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = getCustomerId(invoice.customer);
        if (customerId) {
          await supabaseAdmin
            .from("profiles")
            .update({ subscription_status: "past_due" })
            .eq("stripe_customer_id", customerId);
          console.info(`[stripe] payment failed for customer ${customerId} — in dunning, access kept`);
        }
        break;
      }

      /**
       * A retry succeeded, or a normal renewal went through. Clears the
       * warning without waiting for a subscription.updated to arrive.
       */
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = getCustomerId(invoice.customer);
        if (customerId) {
          await supabaseAdmin
            .from("profiles")
            .update({ subscription_status: "active" })
            .eq("stripe_customer_id", customerId);
        }
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
