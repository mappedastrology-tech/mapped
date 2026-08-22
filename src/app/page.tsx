"use client";

// Landing page — first thing users see.
// Signed-in users skip straight to /home. Signed-out users see the web
// marketing landing (design_handoff_mapped_web) — except inside the native
// app, which goes to /onboarding instead. See the redirect below for why.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import WebLanding from "@/components/web/WebLanding";
import { isNativeApp } from "@/lib/isNativeApp";

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
      } else if (isNativeApp()) {
        // The app's start URL is "/", so this is its first screen. On the web
        // that should be the marketing page; inside the app it must not be.
        // Someone who has already downloaded and opened the app does not need
        // to be sold it, and a native app that opens on a website — site nav,
        // "Log in / Start free", press badges, a footer with a Contact link —
        // is the precise shape App Review rejects under Guideline 4.2. Send
        // them to the actual first run instead.
        router.replace("/onboarding");
      } else {
        setChecked(true);
      }
    }).catch(() => {
      // Can't reach Supabase at all. Same split: the app still has an
      // onboarding flow to show, the web has its landing page.
      if (isNativeApp()) router.replace("/onboarding");
      else setChecked(true);
    });
  }, [router]);

  if (!checked) {
    return (
      <main className="flex-1 flex items-center justify-center bg-background">
        <div className="w-6 h-6 border-2 border-brass/30 border-t-brass rounded-full animate-spin" role="status" aria-label="Loading" />
      </main>
    );
  }

  return <WebLanding />;
}
