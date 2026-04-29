"use client";

// Landing page — first thing users see.
// Signed-in users skip straight to /home.
//
// Aesthetic: warm paper background, bold serif display type,
// circle letter badges, decorative starbursts, terracotta CTA.
// Blends Music OS bold blocks + restaurant/editorial paper feel.

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
        <div className="w-6 h-6 border-2 border-terracotta/30 border-t-terracotta rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main
      className="flex-1 flex flex-col relative overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at top, var(--background) 0%, var(--background-card) 50%, var(--background-elevated) 100%)",
        color: "var(--foreground)",
      }}
    >
      {/* Paper grain overlay */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none mix-blend-multiply"
        style={{
          backgroundImage:
            "radial-gradient(var(--foreground) 0.5px, transparent 0.5px)",
          backgroundSize: "3px 3px",
        }}
      />

      {/* Decorative starbursts — scattered sparkles */}
      <div className="absolute top-[14%] right-[12%] text-terracotta/40 text-3xl rotate-12 select-none">✦</div>
      <div className="absolute top-[22%] left-[10%] text-amber/50 text-xl -rotate-6 select-none">✦</div>
      <div className="absolute bottom-[30%] right-[8%] text-terracotta/30 text-2xl rotate-45 select-none">✦</div>
      <div className="absolute top-[45%] left-[6%] text-sage/30 text-lg select-none">✦</div>

      {/* ─── Top bar: issue tag + circle badge ─── */}
      <div className="relative z-10 px-6 pt-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-px w-6 bg-foreground/40" />
          <div className="text-[10px] uppercase tracking-[0.3em] text-foreground/60 font-medium">
            Vol. 01 · Est. 2026
          </div>
        </div>
        <div
          className="w-11 h-11 rounded-full bg-foreground text-background flex items-center justify-center text-xl leading-none"
          style={{ fontFamily: "var(--font-display)" }}
        >
          M
        </div>
      </div>

      {/* ─── Hero ─── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center -mt-6">
        {/* Logo — big, terracotta-tinted, sitting directly on paper */}
        <div className="mb-10 w-full flex justify-center relative">
          <img
            src="/logo-terracotta-cropped.png"
            alt="Mapped"
            className="w-[280px] max-w-[75vw] h-auto object-contain"
            style={{
              filter:
                "drop-shadow(0 2px 6px rgba(42, 31, 24, 0.12))",
            }}
          />
        </div>

        {/* Tagline — Ahsing display */}
        <h1
          className="text-[26px] tracking-tight text-foreground mb-2 leading-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Your chart called.
        </h1>

        {/* Subline */}
        <p className="text-foreground/60 text-sm mb-12 tracking-wide">
          It has notes.
        </p>

        {/* Primary CTA — big pill button */}
        <Link
          href="/onboarding"
          className="w-full max-w-[280px] inline-flex items-center justify-center gap-2
                     px-8 py-5 rounded-full
                     bg-terracotta text-cream font-semibold text-base tracking-wide
                     hover:bg-terracotta-light active:scale-[0.98]
                     transition-all duration-200 ease-out"
          style={{
            boxShadow:
              "0 12px 24px -8px rgba(180, 81, 40, 0.4), 0 4px 8px -4px rgba(180, 81, 40, 0.25)",
          }}
        >
          Get started
          <span className="text-lg">→</span>
        </Link>

        {/* Sign in */}
        <Link
          href="/account?mode=signin"
          className="mt-6 text-foreground/70 text-sm hover:text-foreground transition-colors"
        >
          Already have an account?{" "}
          <span className="underline decoration-terracotta decoration-2 underline-offset-4 font-medium">
            Sign in
          </span>
        </Link>
      </div>

      {/* ─── Footer strip ─── */}
      <div className="relative z-10 px-6 pb-8">
        <div className="flex items-center justify-center gap-3">
          <div className="h-px flex-1 bg-foreground/20" />
          <span className="text-terracotta text-sm">✦</span>
          <p className="text-foreground/55 text-[10px] tracking-[0.25em] uppercase font-semibold whitespace-nowrap">
            Astrology that actually does something
          </p>
          <span className="text-terracotta text-sm">✦</span>
          <div className="h-px flex-1 bg-foreground/20" />
        </div>
      </div>
    </main>
  );
}
