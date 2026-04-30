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
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import AppTour from "@/components/AppTour";

export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showTour, setShowTour] = useState(false);

  const syncRan = useRef(false);

  useEffect(() => {
    if (sessionStorage.getItem("showAppTour") === "true") {
      setShowTour(true);
    }
    // Sync completions + readings with Supabase on app startup (once)
    if (!syncRan.current) {
      syncRan.current = true;
      import("@/lib/completionSync").then((m) => m.syncAllData()).catch(() => {});
    }
  }, []);

  const handleTourComplete = useCallback(() => {
    setShowTour(false);
  }, []);

  return (
    <>
      <TopBar />
      {/* flex-1 fills height, min-h-0 allows flex child to shrink & scroll */}
      <div className="flex-1 min-h-0 pb-28">
        {children}
      </div>
      <BottomNav />
      {showTour && <AppTour onComplete={handleTourComplete} />}
    </>
  );
}
