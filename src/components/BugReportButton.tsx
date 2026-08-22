"use client";

/**
 * BugReportButton — a subtle, always-available "Report a bug" affordance.
 *
 * Mounted once in the tabs layout so it appears on every screen. It's just the
 * floating trigger; the actual capture/submit flow lives in BugReportModal,
 * shared with the Account screen so the experience is identical everywhere.
 */

import { useState } from "react";
import BugReportModal from "@/components/BugReportModal";

export default function BugReportButton({ liftAboveComposer = false }: { liftAboveComposer?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/*
        Bottom-LEFT on purpose. The bottom-right lane above the tab bar is the
        app's floating-action-button lane — the journal's voice-to-text mic sits
        there (right-[18px], bottom 98, 56px hit area). This button is z-40 and
        that mic is z-30, so sharing the corner meant a global, secondary
        affordance silently swallowing a screen's primary action.

        `liftAboveComposer` is for screens with a PINNED bottom composer (chat).
        There the bottom-left lane is occupied for the whole session, and
        elementFromPoint at the input's left edge returns this button rather
        than the input — the same class of bug as above.

        108px centres it on the composer's input pill, and those screens leave a
        matching left gutter for it, so it sits BESIDE the input rather than on
        top of it or on top of the thread. (Anywhere higher is inside the
        scrolling thread, where it would cover whatever happens to scroll under
        it — on Dolly, the tappable follow-up chips.)
      */}
      <button
        type="button"
        data-bugreport-ignore
        onClick={() => setOpen(true)}
        aria-label="Report a bug"
        title="Report a bug"
        className={`fixed ${liftAboveComposer ? "bottom-[108px]" : "bottom-24"} left-4 z-40 flex items-center justify-center w-10 h-10 rounded-full
                   border border-foreground/10 bg-surface/80 text-muted shadow-sm backdrop-blur-sm
                   hover:text-terracotta hover:border-terracotta/30 active:scale-95 transition-all`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M8 2l1.5 2.5M16 2l-1.5 2.5" />
          <rect x="8" y="6" width="8" height="12" rx="4" />
          <path d="M8 11H4M16 11h4M8 15H4M16 15h4M9 18l-2 3M15 18l2 3M12 6V4" />
        </svg>
      </button>

      <BugReportModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
