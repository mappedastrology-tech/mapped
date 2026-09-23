"use client";

/**
 * Escape-to-close, a Tab loop, and focus handed back — for a sheet that is
 * already rendered conditionally by its parent.
 *
 * Any overlay that covers the page needs all three. Without them Tab walks
 * straight out of the panel into the controls underneath, which are still
 * focusable and now invisible behind a scrim: you press Enter on something you
 * cannot see. On Dolly's "Save this reading?" sheet the next stop past
 * "Discard" was the thread and then the composer, so the sheet could be
 * dismissed by a keystroke that looked like it was typing a message.
 *
 * Deliberately a hook rather than a wrapper component: these sheets have very
 * different markup and animations, and wrapping them would mean rewriting each
 * one. This attaches to whatever element the caller already has.
 */

import { useEffect, type RefObject } from "react";

const FOCUSABLE =
  'button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

export function useDialogKeys(
  open: boolean,
  ref: RefObject<HTMLElement | null>,
  onClose: () => void,
) {
  useEffect(() => {
    // Above any early return in the caller's render, and gated here instead:
    // a hook that only runs while the sheet is open changes the hook count
    // between renders, which is what React means by "rendered more hooks than
    // during the previous render".
    if (!open) return;
    const dialog = ref.current;
    if (!dialog) return;

    // Whatever opened this, so closing doesn't dump the reader at the top of
    // the page with no idea where they are.
    const opener = document.activeElement as HTMLElement | null;

    // Queried per keystroke rather than captured once: these sheets swap their
    // contents between phases, and a list taken at mount points at buttons
    // that no longer exist.
    const items = (): HTMLElement[] => {
      const out: HTMLElement[] = [];
      dialog.querySelectorAll(FOCUSABLE).forEach((node: Element) => {
        const el = node as HTMLElement;
        if (el.offsetParent !== null) out.push(el);
      });
      return out;
    };

    // Move focus in. Otherwise focus is still on the button behind the scrim
    // and the first Tab goes to whatever follows it on the page, not into the
    // sheet at all.
    items()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const list = items();
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      else if (!dialog.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      opener?.focus?.();
    };
  }, [open, ref, onClose]);
}
