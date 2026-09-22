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
import {
  ensureAccountIsolation,
  isolateFromStoredSession,
  storedUserId,
  lastUserId,
} from "@/lib/accountIsolation";
import { installScopedStorage, migrateLegacyKeys } from "@/lib/scopedStorage";
import { invalidateProfile } from "@/lib/profileCache";

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
    // Order matters. The namespace has to exist before any module reads a
    // cached value, and the record of who was last here has to be read before
    // the isolation check overwrites it — otherwise migration cannot tell a
    // returning user's own raw keys from a previous account's.
    const previous = lastUserId();
    installScopedStorage(storedUserId);

    const uid = storedUserId();
    if (uid) migrateLegacyKeys(uid, previous);

    if (isolateFromStoredSession()) void revokeDevicePush();
  } catch {
    // never block the app from starting over this
  }
}

export default function AccountIsolation() {
  useEffect(() => {
    // Catch a sign-in that happens without a page load.
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      // Storage is cleared around a switch, but this module's MEMORY is not:
      // signing in is a client-side navigation, not a page load, so anything
      // cached in a module variable outlives the account it was read for. The
      // profile row is the one that matters — entitlements resolve through it.
      // Dropped on every auth event, including signing out.
      invalidateProfile();

      const id = session?.user?.id;
      if (!id) return;
      // Someone signing in without a reload has been writing to raw keys up to
      // this moment (onboarding does a lot of that); those follow them in.
      migrateLegacyKeys(id, lastUserId());
      if (ensureAccountIsolation(id)) void revokeDevicePush();
    });

    /**
     * A tab the previous account left open is still holding their data in
     * React state. Clearing storage does not touch that, so the screen would
     * keep showing one person's chart and journal to the next.
     *
     * The storage event fires in OTHER tabs when a different one writes, so a
     * change of account id is the signal to start over. Reloading is blunt,
     * but a stale tab showing someone else's data is not a thing to be subtle
     * about, and it only happens on a genuine switch.
     */
    const onStorage = (e: StorageEvent) => {
      if (e.key !== "mapped:last-user") return;
      if (!e.newValue || e.newValue === e.oldValue) return;
      window.location.reload();
    };
    window.addEventListener("storage", onStorage);

    return () => {
      data.subscription.unsubscribe();
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return null;
}
