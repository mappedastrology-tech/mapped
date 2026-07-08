"use client";

/**
 * Tabs Layout
 *
 * This wraps all the main tab pages (Home, You, Maps, Tarot, Dolly)
 * with the TopBar and BottomNav. Pages outside this group (like the
 * landing page, chart creation flow, and account settings) won't
 * have the nav bars.
 *
 * The (tabs) folder name uses Next.js "route groups" — the parentheses
 * mean it organizes files without affecting the URL. So /home, /you, etc.
 * work directly.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import SideNav from "@/components/SideNav";
import AppTour from "@/components/AppTour";
import BugReportButton from "@/components/BugReportButton";
import { TierProvider } from "@/components/TierProvider";
import { BirthTimeProvider } from "@/components/BirthTimeProvider";
import { supabase } from "@/lib/supabase";

export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [showTour, setShowTour] = useState(false);
  const [ready, setReady] = useState(false);

  const syncRan = useRef(false);

  // Onboarding gate: redirect to /onboarding if the user hasn't completed it
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) {
        // Not signed in — send to landing page
        router.replace("/");
        return;
      }
      try {
        const { data: profile, error: profileErr } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", session.user.id)
          .single();
        if (!profileErr && profile && profile.onboarding_completed === false) {
          router.replace("/onboarding");
          return;
        }
      } catch {
        // Supabase unreachable — let them through rather than blocking
      }
      setReady(true);
    }).catch(() => {
      // Can't reach Supabase — let them through
      setReady(true);
    });
  }, [router]);

  useEffect(() => {
    if (sessionStorage.getItem("showAppTour") === "true") {
      setShowTour(true);
    }
    // Sync completions + readings with Supabase on app startup (once)
    if (!syncRan.current) {
      syncRan.current = true;
      import("@/lib/completionSync").then((m) => m.syncAllData()).catch(() => {});
      // Pull/merge journal entries + custom rituals (no-ops when signed out)
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session?.user) return;
        import("@/lib/journal").then((m) => m.pullJournalEntries(session.user.id)).catch(() => {});
        import("@/lib/customRituals").then((m) => m.syncCustomRituals()).catch(() => {});
      }).catch(() => {});
      // Initialize push notifications if already permitted
      import("@/lib/notifications").then((m) => m.initPushNotifications()).catch(() => {});
    }
  }, []);

  const handleTourComplete = useCallback(() => {
    setShowTour(false);
  }, []);

  // Show a loading spinner while checking onboarding status
  if (!ready) {
    return (
      <div className="flex-1 flex items-center justify-center h-dvh bg-background">
        <div className="w-6 h-6 border-2 border-brass/30 border-t-brass rounded-full animate-spin" role="status" aria-label="Loading" />
      </div>
    );
  }

  return (
    <TierProvider>
      <BirthTimeProvider>
        {/* App shell. Mobile: TopBar + scrolling content + BottomNav (column).
            Desktop (lg+): a left SideNav rail beside the scrolling content. */}
        <div className="flex flex-col lg:flex-row h-dvh">
          <SideNav />
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
              <TopBar />
              <div className="pb-4 lg:pb-10">
                {children}
              </div>
            </div>
            <BottomNav />
          </div>
        </div>
        <BugReportButton />
        {showTour && <AppTour onComplete={handleTourComplete} />}
      </BirthTimeProvider>
    </TierProvider>
  );
}
