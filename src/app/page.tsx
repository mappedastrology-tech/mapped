"use client";

// Landing page — first thing users see.
// Signed-in users skip straight to /home.
//
// Uses the new "mapped." logo and the plum/brass/forest design system.

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Logo from "@/components/Logo";

export default function Home() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        try {
          const { data: profile, error: profileErr } = await supabase
            .from("profiles")
            .select("onboarding_completed")
            .eq("id", session.user.id)
            .single();
          if (profileErr || profile?.onboarding_completed !== false) {
            router.replace("/home");
          } else {
            router.replace("/onboarding");
          }
        } catch {
          // Supabase unreachable but user has a session — send to home
          router.replace("/home");
        }
      } else {
        setChecked(true);
      }
    }).catch(() => {
      // Can't reach Supabase at all — show landing page
      setChecked(true);
    });
  }, [router]);

  if (!checked) {
    return (
      <main className="flex-1 flex items-center justify-center bg-background">
        <div className="w-6 h-6 border-2 border-brass/30 border-t-brass rounded-full animate-spin" role="status" aria-label="Loading" />
      </main>
    );
  }

  return (
    <main
      className="flex-1 flex flex-col relative overflow-hidden"
      style={{
        background: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      {/* Subtle grain texture */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(var(--foreground) 0.5px, transparent 0.5px)",
          backgroundSize: "4px 4px",
        }}
      />

      {/* Decorative accent — soft brass sparkles */}
      <div className="absolute top-[18%] right-[14%] text-brass/20 text-2xl rotate-12 select-none" aria-hidden="true">&#x2726;</div>
      <div className="absolute top-[28%] left-[10%] text-brass/15 text-lg -rotate-6 select-none" aria-hidden="true">&#x2726;</div>
      <div className="absolute bottom-[28%] right-[10%] text-brass/10 text-xl rotate-45 select-none" aria-hidden="true">&#x2726;</div>

      {/* ─── Hero ─── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
        {/* Logo — rendered as styled text, no image dependency */}
        <div className="mb-12">
          <h2 className="text-[64px] leading-none tracking-tight" aria-label="Mapped">
            <span style={{ fontFamily: "'Bodoni Moda', serif", fontStyle: "italic", fontWeight: 400 }}>mapp</span>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, letterSpacing: "-0.02em" }}>ed.</span>
          </h2>
        </div>

        {/* Tagline */}
        <h1
          className="text-[26px] tracking-tight text-foreground mb-2 leading-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Your chart called.
        </h1>

        {/* Subline */}
        <p className="text-secondary text-sm mb-14 tracking-wide">
          It has notes.
        </p>

        {/* Primary CTA */}
        <Link
          href="/onboarding"
          className="w-full max-w-[280px] inline-flex items-center justify-center gap-2
                     px-8 py-5 rounded-full
                     font-semibold text-base tracking-wide
                     active:scale-[0.98]
                     transition-all duration-200 ease-out"
          style={{
            backgroundColor: "var(--brass)",
            color: "var(--btn-primary-text)",
            boxShadow:
              "0 12px 24px -8px rgba(201, 169, 97, 0.35), 0 4px 8px -4px rgba(201, 169, 97, 0.2)",
          }}
        >
          Get started
          <span className="text-lg">&#x2192;</span>
        </Link>

        {/* Sign in */}
        <Link
          href="/account?mode=signin"
          className="mt-6 text-secondary text-sm hover:text-foreground transition-colors"
        >
          Already have an account?{" "}
          <span className="underline decoration-brass decoration-2 underline-offset-4 font-medium">
            Sign in
          </span>
        </Link>
      </div>

      {/* ─── Footer strip ─── */}
      <div className="relative z-10 px-6 pb-8">
        <div className="flex items-center justify-center gap-3">
          <div className="h-px flex-1 bg-foreground/15" />
          <span className="text-brass/60 text-sm">&#x2726;</span>
          <p className="text-muted text-[10px] tracking-[0.25em] uppercase font-semibold whitespace-nowrap">
            Astrology that actually does something
          </p>
          <span className="text-brass/60 text-sm">&#x2726;</span>
          <div className="h-px flex-1 bg-foreground/15" />
        </div>
        <div className="flex items-center justify-center gap-4 mt-4">
          <Link href="/privacy" className="text-muted/70 hover:text-foreground text-[11px] transition-colors">Privacy</Link>
          <span className="text-muted/40 text-[11px]">&middot;</span>
          <Link href="/terms" className="text-muted/70 hover:text-foreground text-[11px] transition-colors">Terms</Link>
        </div>
      </div>
    </main>
  );
}
