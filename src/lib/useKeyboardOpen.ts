"use client";

/**
 * Is the on-screen keyboard up right now?
 *
 * Different question from useKeyboardInset, which asks HOW MUCH of the screen
 * the keyboard is covering. That one only has an answer on iOS Safari, because
 * it is the only platform where the keyboard overlaps the layout viewport
 * instead of shrinking it. Everywhere else the viewport shrinks, the inset is
 * correctly 0, and anything that needs to know a keyboard is up — to get out
 * of its way rather than to pad around it — had nothing to go on.
 *
 * What needs to know: the bottom tab bar. On a phone the keyboard already
 * takes roughly half the screen; the nav then holds another ~60px of what is
 * left, for six destinations nobody is navigating to mid-sentence. On Dolly
 * that left the thread about two lines tall, with a strip of dead nav wedged
 * between the composer and the keyboard. The nav stands down while you type
 * and comes back when you are done.
 *
 * Three signals, because no single one covers four platforms:
 *
 *   1. **The iOS/Android app.** @capacitor/keyboard dispatches
 *      `keyboardWillShow` / `keyboardWillHide` on window. That is the native
 *      truth, so once it speaks it is believed over any measurement. No import:
 *      these are plain DOM events, so the web build pays nothing for them.
 *   2. **Focus.** A keyboard only ever opens because something that takes
 *      typing has focus. This is what stops a pinch-zoom (which also shrinks
 *      the visual viewport, a lot) from reading as a keyboard.
 *   3. **A shrunken viewport**, measured against the tallest we have seen
 *      while nothing was focused. Covers iOS Safari (visual viewport shrinks,
 *      layout viewport does not) and Android (both shrink).
 *
 * Returns false on desktop, during SSR, and in any browser without
 * visualViewport — so a caller can use it unconditionally.
 */

import { useEffect, useState } from "react";

/** Below this, it is browser chrome moving, not a keyboard. */
const MIN_KEYBOARD = 120;

/**
 * Moving focus from one field to the next passes through <body> for a frame or
 * two. Concluding "keyboard closed" there would flash the nav back in between
 * two fields of the same form.
 */
const BLUR_GRACE_MS = 140;

/** Input types that open a keyboard, a picker, or anything else that covers the screen. */
const NOT_TEXT_ENTRY = new Set([
  "button", "checkbox", "color", "file", "hidden",
  "image", "radio", "range", "reset", "submit",
]);

/**
 * Does focusing this element summon a keyboard (or a picker wheel, which
 * covers just as much of the screen)?
 *
 * Exported for the test: the rest of the hook needs a visual viewport and a
 * real keyboard to exercise, but this is the part that decides whether the
 * nav disappears, and getting it wrong in either direction is visible.
 */
export function takesTyping(el: Element | null): boolean {
  if (!el) return false;
  const node = el as HTMLElement;
  if (node.isContentEditable) return true;
  if (node.tagName === "TEXTAREA") return true;
  if (node.tagName !== "INPUT") return false;
  // `type` is normalised by the DOM, so an unknown or missing type reads as
  // "text" here rather than as the raw attribute.
  return !NOT_TEXT_ENTRY.has((node as HTMLInputElement).type);
}

/** What the hook remembers between measurements. */
export interface KeyboardBaseline {
  /** The tallest viewport seen at `width` with nothing focused. */
  base: number;
  /** The width that baseline was taken at. */
  width: number;
}

/**
 * One measurement: baseline in, baseline and answer out.
 *
 * Pure, and exported, because this is the whole of the detection and it is
 * otherwise only reachable with a real phone, a real keyboard and a real
 * rotation. The three sequences it has to get right — iOS Safari, Android, and
 * the native app — are three different shapes of the same numbers, and a test
 * can walk all three in a few lines.
 */
export function measureKeyboard(
  prev: KeyboardBaseline,
  now: { width: number; height: number; focused: boolean; native?: boolean | null },
): { baseline: KeyboardBaseline; open: boolean } {
  // Rotating is a different screen; the two orientations have nothing to say
  // about each other, so the baseline starts again.
  const rotated = Math.abs(now.width - prev.width) > 1;
  const baseline: KeyboardBaseline = rotated
    ? { base: now.height, width: now.width }
    : { ...prev };

  // The baseline only ever grows, and it grows whatever has focus.
  //
  // Growing it is safe even mid-keyboard, because a keyboard can only ever
  // make the viewport SHORTER — no measurement taken while one is up can beat
  // the full height. And refusing to grow it while something is focused turns
  // out to be the bug, not the guard: on Android the back button dismisses the
  // keyboard WITHOUT moving focus, so a baseline frozen at the shrunken height
  // would then read the next keyboard as no keyboard, and the nav would stay
  // gone for the rest of the session.
  baseline.base = Math.max(baseline.base, now.height);

  // The native plugin knows for certain.
  if (now.native !== null && now.native !== undefined) {
    return { baseline, open: now.native };
  }
  // A keyboard only ever opens because something that takes typing has focus.
  if (!now.focused) return { baseline, open: false };
  return { baseline, open: baseline.base - now.height > MIN_KEYBOARD };
}

export function useKeyboardOpen(): boolean {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const vv = window.visualViewport;

    const height = () => (vv ? vv.height : window.innerHeight);
    const width = () => (vv ? vv.width : window.innerWidth);

    let baseline: KeyboardBaseline = { base: height(), width: width() };
    /** Set once the native plugin has spoken; from then on it decides. */
    let native: boolean | null = null;
    let blurTimer: number | undefined;

    const apply = () => {
      const result = measureKeyboard(baseline, {
        width: width(),
        height: height(),
        focused: takesTyping(document.activeElement),
        native,
      });
      baseline = result.baseline;
      setOpen(result.open);
    };

    const applyNow = () => {
      window.clearTimeout(blurTimer);
      apply();
    };
    const applySoon = () => {
      window.clearTimeout(blurTimer);
      blurTimer = window.setTimeout(apply, BLUR_GRACE_MS);
    };

    const onNativeShow = () => { native = true; applyNow(); };
    const onNativeHide = () => { native = false; applyNow(); };

    apply();
    document.addEventListener("focusin", applyNow);
    document.addEventListener("focusout", applySoon);
    window.addEventListener("keyboardWillShow", onNativeShow);
    window.addEventListener("keyboardWillHide", onNativeHide);
    // Without visualViewport (older browsers, jsdom) the measurement falls back
    // to window.innerHeight. That still moves on Android, and does not move on
    // iOS Safari — so the worst case there is the old behaviour, a nav that
    // keeps its space, rather than a nav that vanishes under a mouse.
    vv?.addEventListener("resize", applyNow);
    // iOS slides the visual viewport rather than resizing it when focus moves
    // between fields, and only a scroll event reports that.
    vv?.addEventListener("scroll", applyNow);
    window.addEventListener("orientationchange", applyNow);

    return () => {
      window.clearTimeout(blurTimer);
      document.removeEventListener("focusin", applyNow);
      document.removeEventListener("focusout", applySoon);
      window.removeEventListener("keyboardWillShow", onNativeShow);
      window.removeEventListener("keyboardWillHide", onNativeHide);
      vv?.removeEventListener("resize", applyNow);
      vv?.removeEventListener("scroll", applyNow);
      window.removeEventListener("orientationchange", applyNow);
    };
  }, []);

  return open;
}
