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

export default function BugReportButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        data-bugreport-ignore
        onClick={() => setOpen(true)}
        aria-label="Report a bug"
        title="Report a bug"
        className="fixed bottom-24 right-4 z-40 flex items-center justify-center w-10 h-10 rounded-full
                   border border-foreground/10 bg-surface/80 text-muted shadow-sm backdrop-blur-sm
                   hover:text-terracotta hover:border-terracotta/30 active:scale-95 transition-all"
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
