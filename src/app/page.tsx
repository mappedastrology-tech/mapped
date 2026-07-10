"use client";

// Landing page — first thing users see.
// Signed-in users skip straight to /home; signed-out users see the web
// marketing landing (design_handoff_mapped_web).

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import WebLanding from "@/components/web/WebLanding";

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

  return <WebLanding />;
}
