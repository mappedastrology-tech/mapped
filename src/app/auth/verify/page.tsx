"use client";

/**
 * Auth verify page — client-side token exchange.
 *
 * Handles email confirmation links by exchanging the token for a session
 * using the browser's Supabase client (which has access to PKCE cookies).
 * Then redirects to the appropriate page.
 */

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Suspense } from "react";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function verify() {
      const tokenHash = searchParams.get("token_hash");
      const type = searchParams.get("type");
      const code = searchParams.get("code");

      // Password reset and email change finish on the account page, which runs
      // its own verifyOtp. Hand the token straight over without spending it —
      // a token can only be exchanged once, so verifying here would make the
      // account page's exchange fail.
      //
      // /auth/callback does this same routing server-side, but the native
      // build deletes that route (scripts/build-app.mjs), so in the app the
      // link has to land here instead. Doing it client-side works on all four
      // platforms.
      if (type === "recovery" || type === "email_change") {
        const params = new URLSearchParams();
        params.set(type === "recovery" ? "reset" : "emailChanged", "true");
        if (code) params.set("code", code);
        if (tokenHash) params.set("token_hash", tokenHash);
        params.set("type", type);
        router.replace(`/account?${params.toString()}`);
        return;
      }

      if (tokenHash && type) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type as "signup" | "recovery" | "email_change" | "email",
        });

        if (error) {
          setError("This link has expired or is invalid. Please try again.");
          return;
        }
      }

      // Check if we're now logged in
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // If there's a chart in sessionStorage, save it
        const stored = sessionStorage.getItem("chartResult");
        if (stored) {
          try {
            const chartData = JSON.parse(stored);
            const { saveChart } = await import("@/lib/saveChart");
            await saveChart(session.user.id, chartData);
            sessionStorage.removeItem("chartResult");
          } catch {
            // Chart save failed — not blocking
          }
        }
        router.replace("/home");
      } else {
        router.replace("/welcome?mode=signin");
      }
    }

    verify();
  }, [router, searchParams]);

  if (error) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="rounded-2xl bg-surface border border-foreground/15 p-6 max-w-sm w-full text-center">
          <p className="text-foreground text-sm mb-4">{error}</p>
          <button
            onClick={() => router.push("/welcome?mode=signin")}
            className="text-terracotta text-sm hover:text-terracotta-light transition-colors"
          >
            Back to sign in
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-6 h-6 border-2 border-terracotta/30 border-t-terracotta rounded-full animate-spin" role="status" aria-label="Loading" />
        <p className="text-muted text-sm">Verifying...</p>
      </div>
    </main>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <main className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-terracotta/30 border-t-terracotta rounded-full animate-spin" role="status" aria-label="Loading" />
      </main>
    }>
      <VerifyContent />
    </Suspense>
  );
}
