/**
 * Stripe server client — lazily initialized with the secret key.
 *
 * Import this in API routes only (never in client components).
 *
 * The client is created on FIRST USE (not at module load), so a missing
 * STRIPE_SECRET_KEY fails the individual request rather than crashing the whole
 * production build when Next.js collects page data for every route.
 */

import Stripe from "stripe";

let client: Stripe | null = null;

function getStripe(): Stripe {
  if (!client) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("Missing STRIPE_SECRET_KEY environment variable");
    client = new Stripe(key, {
      apiVersion: "2026-05-27.dahlia",
      typescript: true,
    });
  }
  return client;
}

/**
 * Drop-in Stripe client. Property access is proxied to a lazily-created
 * instance, so `import { stripe } from "@/lib/stripe"` keeps working unchanged.
 */
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop, receiver) {
    const instance = getStripe();
    const value = Reflect.get(instance, prop, receiver);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
