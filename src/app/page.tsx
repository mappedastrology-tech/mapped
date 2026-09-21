"use client";

// Landing page — first thing users see.
// Signed-in users skip straight to /home. Signed-out users see the web
// marketing landing (design_handoff_mapped_web) — except inside the app
// (native or Home Screen), which goes to /welcome. See the redirect below.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import WebLanding from "@/components/web/WebLanding";
import { isInstalledApp } from "@/lib/isNativeApp";

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
      } else if (isInstalledApp()) {
        // Inside the app — native, or opened from the Home Screen — this must
        // never be the marketing page. Someone who has the app open doesn't
        // need to be sold it, and a native app that opens on a website (site
        // nav, "Start free", a footer) is the shape App Review rejects under
        // Guideline 4.2. They get the app's own front door: create a chart,
        // or sign in.
        router.replace("/welcome");
      } else {
        setChecked(true);
      }
    }).catch(() => {
      // Can't reach Supabase at all. Same split: the app still has an
      // onboarding flow to show, the web has its landing page.
      if (isInstalledApp()) router.replace("/welcome");
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
