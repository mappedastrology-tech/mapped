/**
 * DELETE /api/account/delete
 *
 * Deletes a user's account: cancels any billing, removes their data, then
 * deletes their Supabase auth account.
 *
 * Requires the Supabase service role key (server-side only) to delete auth
 * users — the anon key can't do that.
 *
 * The user must be authenticated (we verify via their JWT).
 *
 * ORDER MATTERS. Billing is cancelled FIRST, while the profile still holds the
 * Stripe ids. Deleting the profile first would strand the subscription: Stripe
 * would keep charging a card every month for an account that no longer exists,
 * the person would have no way to reach the billing portal to stop it, and the
 * renewal webhooks would silently do nothing because they look the customer up
 * by a profile row that has been deleted. That is a chargeback and a support
 * nightmare, and it is invisible from inside the app.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function DELETE(request: NextRequest) {
  try {
    // Get the user's auth token from the request
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];

    // Create a client with the user's token to verify identity
    const supabaseUser = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    // Create admin client with service role key to delete data and auth user
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      console.error("SUPABASE_SERVICE_ROLE_KEY not configured");
      return NextResponse.json(
        { error: "Account deletion is not configured. Please contact support." },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    );

    // ── 1. Stop the money ────────────────────────────────────────────────
    // Read the billing ids before anything is deleted.
    const { data: billing } = await supabaseAdmin
      .from("profiles")
      .select("stripe_subscription_id, stripe_customer_id")
      .eq("id", user.id)
      .maybeSingle();

    if (billing?.stripe_subscription_id) {
      try {
        // Cancelled outright rather than at period end: the account is being
        // deleted, so there is nothing left to keep paying for.
        await stripe.subscriptions.cancel(billing.stripe_subscription_id);
      } catch (err) {
        // A subscription that is already cancelled or unknown to Stripe is
        // fine — that is the state we wanted. Anything else must stop the
        // deletion, because deleting the account would strand a live
        // subscription with no way to reach it.
        const code = (err as { code?: string })?.code;
        const type = (err as { type?: string })?.type;
        const alreadyGone = code === "resource_missing" || type === "StripeInvalidRequestError";
        if (!alreadyGone) {
          console.error("Failed to cancel subscription before deletion:", err);
          return NextResponse.json(
            {
              error:
                "We couldn't cancel your subscription just now, so we've left your account alone rather than risk billing you for an account you can't reach. Please try again in a minute.",
            },
            { status: 502 },
          );
        }
      }
    }

    // ── 2. Scrub what does not cascade ───────────────────────────────────
    // bug_reports keeps its user_id ON DELETE SET NULL so the report survives
    // its author, which is useful — but the row also carries their email
    // address and a screenshot that may show their chart or journal. Those are
    // personal data and have to go, even though the report itself stays.
    const { data: reports } = await supabaseAdmin
      .from("bug_reports")
      .select("id, screenshot_path")
      .eq("user_id", user.id);

    const shots = (reports ?? [])
      .map((r) => r.screenshot_path)
      .filter((p): p is string => typeof p === "string" && p.length > 0);

    if (shots.length > 0) {
      try {
        await supabaseAdmin.storage.from("bug-screenshots").remove(shots);
      } catch (err) {
        // Non-fatal: the rows are still scrubbed below, and a stranded file
        // should not block someone deleting their account.
        console.error("Failed to remove bug screenshots:", err);
      }
    }

    await supabaseAdmin
      .from("bug_reports")
      .update({ user_email: null, screenshot_path: null })
      .eq("user_id", user.id);

    // ── 3. Delete the data ───────────────────────────────────────────────
    // Everything else user-scoped cascades from auth.users (verified against
    // the live schema: 24 of 25 user tables carry ON DELETE CASCADE; the one
    // exception is bug_reports, handled above). These three are explicit
    // because they are the ones that matter most if a cascade is ever dropped.
    await supabaseAdmin.from("journal_entries").delete().eq("user_id", user.id);
    await supabaseAdmin.from("charts").delete().eq("user_id", user.id);
    await supabaseAdmin.from("profiles").delete().eq("id", user.id);

    // Delete the auth user
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

    if (deleteError) {
      console.error("Failed to delete auth user:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete account. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Account deletion error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
