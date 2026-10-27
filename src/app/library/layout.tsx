"use client";

/**
 * Library layout — wraps all /library/* screens (Learn + the lookup Library) in
 * the same app shell as the main tabs, so navigation is present here too.
 * Each Library page renders its own top header (TopBar / LibraryHeader), so
 * this layout adds only the scroll container and the navigation around it:
 * BottomNav on phones, and the SideNav rail from lg up — without which these
 * pages would have no way out on a desktop window.
 */

import BottomNav from "@/components/BottomNav";
import SideNav from "@/components/SideNav";

export default function LibraryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col lg:flex-row h-dvh">
      <SideNav />
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
          {children}
        </div>
        <BottomNav />
      </div>
    </div>
  );
}
