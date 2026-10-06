"use client";

/**
 * Library layout — wraps all /library/* screens (Learn + the lookup Library) in
 * the same app shell as the main tabs.
 *
 * The top bar lives here rather than in each page. It used to be rendered by
 * Library Home and the reference screen only, so a course, a lesson and the
 * final test each dropped it — you tapped into a lesson and the app's own
 * header vanished, leaving a bare close button on a page that no longer looked
 * like Mapped. The bottom navigation was always here; now both bars are, on
 * every screen under /library, the same as every other page in the app.
 *
 * Inside the scroll container, exactly as in (tabs)/layout: TopBar is
 * `sticky top-0` and stays put while the lesson scrolls under it.
 */

import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";

export default function LibraryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-dvh">
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        <TopBar />
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
