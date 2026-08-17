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
import { useRouter, usePathname } from "next/navigation";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import SideNav from "@/components/SideNav";
import AppTour from "@/components/AppTour";
import BugReportButton from "@/components/BugReportButton";
import { TierProvider } from "@/components/TierProvider";
import { BirthTimeProvider } from "@/components/BirthTimeProvider";
import { supabase } from "@/lib/supabase";
import { useIsDesktop } from "@/lib/useIsDesktop";
import WebToday from "@/components/web/WebToday";
import WebAlmanac from "@/components/web/WebAlmanac";
import WebTarot from "@/components/web/WebTarot";
import WebJournal from "@/components/web/WebJournal";
import WebMaps from "@/components/web/WebMaps";
import WebDolly from "@/components/web/WebDolly";
import WebLibrary from "@/components/web/WebLibrary";
import WebNumerology from "@/components/web/WebNumerology";
import WebChart from "@/components/web/WebChart";
import WebHumanDesign from "@/components/web/WebHumanDesign";
import WebPalmistry from "@/components/web/WebPalmistry";
import WebRitual from "@/components/web/WebRitual";
import WebProfile from "@/components/web/WebProfile";

// Routes (inside this group) with a desktop "web" experience
// (design_handoff_mapped_web). On lg+ these render the web page and the mobile
// chrome is hidden; on phones the mobile app shows. /library lives outside
// (tabs) and wires its own desktop branch via DesktopWebRoute.
const WEB_PAGES: Record<string, React.ComponentType> = {
  "/home": WebToday,
  "/almanac": WebAlmanac,
  "/tarot": WebTarot,
  "/journal": WebJournal,
  "/maps": WebMaps,
  "/dolly": WebDolly,
  "/library": WebLibrary,
  // "Fill-in" routes: the shared web shell wrapping each page's real content.
  "/numerology": WebNumerology,
  "/you": WebChart,
  "/human-design": WebHumanDesign,
  "/palmistry": WebPalmistry,
  "/learn": WebRitual,
  "/profile": WebProfile,
};

export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const WebPage = WEB_PAGES[pathname];
  const [showTour, setShowTour] = useState(false);
  const [ready, setReady] = useState(false);
  // Desktop web pages replace the mobile app entirely on lg+. We resolve the
  // breakpoint after mount (during the auth spinner) so the mobile page is
  // never mounted on desktop — its onboarding/chart redirects must not fire
  // underneath the web layout.
  // (NEXT_PUBLIC_FORCE_MOBILE=1 forces the mobile layout everywhere — see useIsDesktop.)
  const isDesktop = useIsDesktop();
  const showWeb = !!WebPage && isDesktop;

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
        {/* Desktop web pages take over the whole viewport with their own
            top-nav shell. Otherwise: mobile TopBar + scrolling content +
            BottomNav (column), with a left SideNav rail on lg+. */}
        {showWeb ? (
          <div className="h-dvh overflow-y-auto overscroll-contain">
            <WebPage />
          </div>
        ) : (
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
        )}
        <BugReportButton />
        {showTour && <AppTour onComplete={handleTourComplete} />}
      </BirthTimeProvider>
    </TierProvider>
  );
}
