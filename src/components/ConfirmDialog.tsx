"use client";

/**
 * A yes/no confirmation over a scrim — Escape to cancel, Tab kept inside,
 * focus handed back on close.
 *
 * Moved out of app/account/page.tsx unchanged so the public /delete-account
 * page asks "Delete your account?" exactly the way the Account screen does.
 */

import { useEffect, useId, useRef } from "react";

export default function ConfirmDialog({
  title,
  message,
  confirmLabel,
  confirmDestructive,
  onConfirm,
  onCancel,
  isLoading,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  confirmDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  // Keyboard accessibility: close on Escape, focus the dialog on open, and trap
  // Tab focus inside it while it's up.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    // Remembered so closing returns you where you were, rather than dumping
    // you at the top of a very long settings page.
    const opener = document.activeElement as HTMLElement | null;
    const focusable = dialog.querySelectorAll<HTMLElement>("button:not([disabled])");
    (focusable[0] ?? dialog).focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onCancel(); return; }
      if (e.key !== "Tab" || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      opener?.focus?.();
    };
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div aria-hidden="true" className="absolute inset-0 backdrop-blur-[2px]" style={{ backgroundColor: "var(--modal-overlay)" }} onClick={onCancel} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative bg-background rounded-2xl border border-foreground/15 p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200 outline-none"
      >
        <h3
          id={titleId}
          className="text-[19px] font-semibold tracking-[-0.01em] text-foreground mb-2"
        >
          {title}
        </h3>
        <p className="text-secondary text-sm mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 py-2.5 rounded-full border border-foreground/18 text-secondary text-sm
                       hover:border-foreground/25 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all disabled:opacity-50
              ${confirmDestructive
                ? "bg-red-500/90 text-white hover:bg-red-500"
                : "bg-terracotta text-cream hover:bg-terracotta-light"
              }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" role="status" aria-label="Loading" />
              </span>
            ) : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
