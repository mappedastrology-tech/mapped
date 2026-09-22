"use client";

/**
 * Guarantees that one account's cached data never reaches the next account,
 * on every route.
 *
 * This is mounted in the ROOT layout, and the first thing it does happens at
 * module scope — before React renders anything at all. Both details are the
 * fix for how the previous attempt failed:
 *
 *   - It was hooked into the (tabs) layout, but /account (where signing in
 *     actually happens), /onboarding, /library, /chart and /rectification all
 *     sit outside that group, so on those routes it never ran.
 *   - It awaited supabase.auth.getSession(). Effects run child-first, and a
 *     promise resolves later still, so pages had already read the previous
 *     account's cache by the time the check happened.
 *
 * The listener below then covers everything after first paint: signing in
 * without a reload, and a session restored asynchronously.
 *
 * SIGNED_OUT is deliberately not handled here. Explicit sign-out clears up
 * after itself, and supabase also emits SIGNED_OUT when a refresh token simply
 * expires — wiping the device's cache for someone whose session timed out
 * would be destroying their data to solve a problem they do not have. Only a
 * DIFFERENT account arriving triggers a wipe.
 */

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ensureAccountIsolation, isolateFromStoredSession } from "@/lib/accountIsolation";

/**
 * A switch also has to give up this device's push subscription.
 *
 * push_subscriptions is unique per endpoint and carries a user id, so the row
 * the previous account left behind would keep delivering their notifications
 * to a phone that now belongs to someone else. The new account cannot delete
 * that row — RLS scopes it to its owner — but revoking the subscription in the
 * browser kills the endpoint, so the next send gets a 410 and the existing
 * prune path removes it.
 */
async function revokeDevicePush() {
  try {
    const { unsubscribeFromPush } = await import("@/lib/notifications");
    await unsubscribeFromPush();
  } catch {
    // best effort
  }
}

// Module scope: runs on import, before the first render.
if (typeof window !== "undefined") {
  try {
    if (isolateFromStoredSession()) void revokeDevicePush();
  } catch {
    // never block the app from starting over this
  }
}

export default function AccountIsolation() {
  useEffect(() => {
    // Catch a sign-in that happens without a page load.
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const id = session?.user?.id;
      if (id && ensureAccountIsolation(id)) void revokeDevicePush();
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return null;
}
