"use client";

/**
 * The working half of /delete-account: sign in, then delete.
 *
 * Signing in reuses the app's own sign-in screen (/welcome) with `next` set
 * back to this page, rather than a second sign-in form to keep in step.
 * Deleting calls the same /api/account/delete the Account screen calls,
 * behind the same ConfirmDialog, and clears this device afterwards the same
 * way (see handleDeleteAccount in app/account/page.tsx).
 */

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { authedFetch } from "@/lib/authedFetch";
import { clearOnSignOut } from "@/lib/accountIsolation";
import { invalidateProfile } from "@/lib/profileCache";
import ConfirmDialog from "@/components/ConfirmDialog";

type State =
  | { kind: "checking" }
  | { kind: "signedOut" }
  | { kind: "signedIn"; email: string | null }
  | { kind: "deleted" };

const SIGN_IN_HREF = `/welcome?mode=signin&next=${encodeURIComponent("/delete-account")}`;

export default function DeleteAccountPanel() {
  const [state, setState] = useState<State>({ kind: "checking" });
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (!alive) return;
        setState(session?.user ? { kind: "signedIn", email: session.user.email ?? null } : { kind: "signedOut" });
      })
      // A stale stored session can make getSession throw; that is "signed out".
      .catch(() => { if (alive) setState({ kind: "signedOut" }); });
    return () => { alive = false; };
  }, []);

  async function signOut() {
    await supabase.auth.signOut().catch(() => {});
    clearOnSignOut();
    invalidateProfile();
    setState({ kind: "signedOut" });
  }

  async function deleteAccount() {
    setDeleting(true);
    setError(null);
    try {
      const res = await authedFetch("/api/account/delete", { method: "DELETE" });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof result.error === "string" && result.error ? result.error : "We couldn't delete your account just now. Please try again.");

      // Take this device's copy with it, as the Account screen does.
      await supabase.auth.signOut().catch(() => {});
      clearOnSignOut();
      invalidateProfile();
      try { sessionStorage.clear(); } catch { /* private mode */ }
      setConfirming(false);
      setState({ kind: "deleted" });
    } catch (err) {
      setConfirming(false);
      setError(err instanceof Error ? err.message : "We couldn't delete your account just now. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  const box = "rounded-2xl border border-foreground/15 p-5";

  if (state.kind === "checking") {
    return <div className={box} aria-busy="true"><p className="text-muted text-sm">Checking whether you&rsquo;re signed in&hellip;</p></div>;
  }

  if (state.kind === "deleted") {
    return (
      <div className={box} role="status">
        <p className="text-foreground">Your Mapped account has been deleted.</p>
        <p className="text-muted text-sm mt-2">
          If you subscribed through the App Store or Google Play, remember to cancel it in your phone&rsquo;s
          subscription settings.
        </p>
      </div>
    );
  }

  if (state.kind === "signedOut") {
    return (
      <div className={box}>
        <p>Sign in to the account you want to delete. You&rsquo;ll come back here to confirm.</p>
        <a
          href={SIGN_IN_HREF}
          className="inline-flex items-center justify-center mt-4 px-5 rounded-full bg-terracotta font-semibold text-sm hover:bg-terracotta-light transition-colors"
          style={{ color: "var(--on-brass)", minHeight: 44 }}
        >
          Sign in
        </a>
        <p className="text-muted text-xs mt-3">
          If you sign in with Apple or Google and land on the Mapped home screen instead, open this page again
          and you&rsquo;ll be signed in here.
        </p>
      </div>
    );
  }

  return (
    <div className={box}>
      <p>
        You&rsquo;re signed in{state.email ? <> as <strong>{state.email}</strong></> : null}.{" "}
        <button onClick={signOut} className="text-terracotta hover:text-terracotta-light underline underline-offset-2">
          Not you? Sign out
        </button>
      </p>
      <button
        onClick={() => { setError(null); setConfirming(true); }}
        className="mt-4 px-5 rounded-full text-sm font-semibold transition-all"
        style={{
          color: "var(--danger-text)",
          border: "1px solid color-mix(in srgb, var(--danger-text) 45%, transparent)",
          minHeight: 44,
        }}
      >
        Delete my account
      </button>
      {error && (
        <p role="alert" className="text-sm mt-3" style={{ color: "var(--danger-text)" }}>{error}</p>
      )}

      {confirming && (
        <ConfirmDialog
          title="Delete your account?"
          message={
            "This will permanently delete your account, your birth chart, journal entries, Dolly conversations, and all other data. This can't be undone."
            + " A subscription bought on the Mapped website is cancelled with it; one bought through the App Store or Google Play is not, so cancel that in your phone's settings."
          }
          confirmLabel="Delete everything"
          confirmDestructive
          onConfirm={deleteAccount}
          onCancel={() => setConfirming(false)}
          isLoading={deleting}
        />
      )}
    </div>
  );
}
