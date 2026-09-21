"use client";

/**
 * /welcome — the front door for anyone who isn't signed in.
 *
 * The screen a normal app shows when it doesn't know who you are: the name, one
 * line, and two ways in. New people create a chart; people with an account
 * sign in right here, without being walked through a sign-up flow first.
 *
 * WHO LANDS HERE
 *   - everyone who signs out, on any device
 *   - anyone opening the installed app (Home Screen or native) while signed out
 *   - "Log in" from the website
 * The marketing page at "/" is still what a signed-out visitor sees on the
 * website in a browser. It is never what an app shows.
 *
 * Before this existed, signing in meant: website → "Log in" → the onboarding
 * welcome ("Hi. We're Mapped…") → Begin → the birth-data form → scroll to the
 * bottom → "Already have an account? Sign in" → a page titled "Account" with a
 * back arrow. Seven steps, through the sign-up flow, to get back into an
 * account you already had.
 */

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

/**
 * Onboarding opens on its own "Hi. We're Mapped" screen. This page already
 * said hello, so "Create my chart" drops the person on the next screen instead
 * of greeting them twice. Onboarding restores its place from this key; any
 * step below 2 is restored without needing chart data.
 */
const ONBOARDING_STEP_KEY = "mapped:onboarding-step";

const INPUT = `w-full px-4 py-3.5 rounded-xl bg-surface border border-foreground/18
               text-foreground placeholder:text-muted text-base
               focus:outline-none focus:border-terracotta/50 focus:ring-1 focus:ring-terracotta/25`;

const PRIMARY = {
  backgroundColor: "var(--brass)",
  color: "var(--terracotta-text)",
  boxShadow: "0 8px 20px -6px rgba(180, 81, 40, 0.4), 0 3px 8px -3px rgba(180, 81, 40, 0.25)",
};

export default function WelcomePageWrapper() {
  return (
    <Suspense fallback={<main className="min-h-dvh bg-background" />}>
      <WelcomePage />
    </Suspense>
  );
}

type View = "choose" | "signin" | "forgot";

function WelcomePage() {
  const router = useRouter();
  const params = useSearchParams();
  const [checking, setChecking] = useState(true);
  const [view, setView] = useState<View>(params.get("mode") === "signin" ? "signin" : "choose");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);

  // Already signed in? Then this isn't the right screen.
  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (session?.user) router.replace("/home");
        else setChecking(false);
      })
      .catch(() => setChecking(false));
  }, [router]);

  function createChart() {
    try { localStorage.setItem(ONBOARDING_STEP_KEY, "1"); } catch { /* starts at the greeting instead */ }
    router.push("/onboarding");
  }

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { data, error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (err) throw err;
      if (data.user) {
        // The tab layout sends anyone who never finished onboarding back into
        // it, so /home is the right target for everyone.
        router.replace("/home");
        return;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      setError(
        msg.includes("Invalid login") ? "Wrong email or password."
          : msg.includes("Email not confirmed") ? "Check your inbox — you need to confirm your email first."
            : /fetch|network/i.test(msg) ? "Can't reach the server. Check your connection."
              : msg || "Couldn't sign you in.",
      );
    }
    setBusy(false);
  }

  async function google() {
    setError("");
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (err) setError(err.message);
  }

  async function sendReset(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    });
    setBusy(false);
    if (err) setError(err.message);
    else setResetSent(true);
  }

  if (checking) {
    return (
      <main className="min-h-dvh flex items-center justify-center bg-background">
        <div className="w-6 h-6 border-2 border-brass/30 border-t-brass rounded-full animate-spin" role="status" aria-label="Loading" />
      </main>
    );
  }

  return (
    <main
      className="min-h-dvh flex flex-col bg-background px-6"
      style={{ paddingTop: "max(env(safe-area-inset-top), 1.5rem)", paddingBottom: "max(env(safe-area-inset-bottom), 1.5rem)" }}
    >
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm mx-auto">
        <h1 className="text-[52px] leading-none tracking-tight text-foreground" aria-label="Mapped">
          <span style={{ fontFamily: "'Bodoni Moda', serif", fontStyle: "italic", fontWeight: 400 }}>mapp</span>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, letterSpacing: "-0.02em" }}>ed.</span>
        </h1>

        {view === "choose" && (
          <>
            <p className="mt-6 text-center text-secondary text-base leading-relaxed">
              Astrology for your actual life.
            </p>
            <div className="mt-12 w-full flex flex-col gap-3">
              <button
                onClick={createChart}
                className="w-full py-3.5 rounded-full font-bold text-sm tracking-wide active:scale-[0.98] transition-all"
                style={PRIMARY}
              >
                Create my chart
              </button>
              <button
                onClick={() => { setView("signin"); setError(""); }}
                className="w-full py-3.5 rounded-full border border-foreground/20 text-foreground font-semibold text-sm active:scale-[0.98] transition-all"
              >
                I already have an account
              </button>
            </div>
          </>
        )}

        {view === "signin" && (
          <div className="mt-10 w-full">
            <h2 className="text-xl text-foreground text-center" style={{ fontFamily: "var(--font-display)" }}>Welcome back</h2>

            <button
              onClick={google}
              className="mt-6 w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-card border border-foreground/15 text-foreground text-sm font-medium active:scale-[0.98] transition-all"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-foreground/10" />
              <span className="text-muted text-xs">or</span>
              <div className="flex-1 h-px bg-foreground/10" />
            </div>

            <form onSubmit={signIn} className="flex flex-col gap-3">
              <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" aria-label="Email" className={INPUT} />
              <input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" aria-label="Password" className={INPUT} />
              <button type="button" onClick={() => { setView("forgot"); setError(""); setResetSent(false); }} className="text-xs text-terracotta/80 self-end -mt-1">
                Forgot password?
              </button>
              {error && <p className="text-terracotta text-xs" role="alert">{error}</p>}
              <button
                type="submit"
                disabled={busy}
                className="w-full py-3.5 rounded-full font-bold text-sm tracking-wide active:scale-[0.98] transition-all disabled:opacity-50"
                style={PRIMARY}
              >
                {busy ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <p className="mt-6 text-center text-muted text-xs">
              New here?{" "}
              <button onClick={createChart} className="text-terracotta underline underline-offset-2">Create your chart</button>
            </p>
          </div>
        )}

        {view === "forgot" && (
          <div className="mt-10 w-full">
            <h2 className="text-xl text-foreground text-center" style={{ fontFamily: "var(--font-display)" }}>Reset your password</h2>
            {resetSent ? (
              <p className="mt-6 text-center text-secondary text-sm leading-relaxed">
                If there&rsquo;s an account for {email.trim() || "that email"}, a reset link is on its way. Open it on this device.
              </p>
            ) : (
              <form onSubmit={sendReset} className="mt-6 flex flex-col gap-3">
                <p className="text-muted text-sm text-center">We&rsquo;ll email you a link to set a new one.</p>
                <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" aria-label="Email" className={INPUT} />
                {error && <p className="text-terracotta text-xs" role="alert">{error}</p>}
                <button type="submit" disabled={busy} className="w-full py-3.5 rounded-full font-bold text-sm tracking-wide disabled:opacity-50" style={PRIMARY}>
                  {busy ? "Sending…" : "Send reset link"}
                </button>
              </form>
            )}
            <p className="mt-6 text-center text-xs">
              <button onClick={() => { setView("signin"); setError(""); }} className="text-terracotta">Back to sign in</button>
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-4 text-[11px]">
        <Link href="/privacy" className="text-muted/70">Privacy</Link>
        <span className="text-muted/40">&middot;</span>
        <Link href="/terms" className="text-muted/70">Terms</Link>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}
