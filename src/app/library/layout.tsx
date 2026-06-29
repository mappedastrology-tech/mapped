"use client";

/**
 * Library layout — wraps all /library/* screens (Learn + the lookup Library) in
 * the same app shell as the main tabs so the bottom navigation is present here
 * too. Each Library page renders its own top header (TopBar / LibraryHeader),
 * so this layout only adds the scroll container + BottomNav at the bottom.
 */

import BottomNav from "@/components/BottomNav";

export default function LibraryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-dvh">
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
