"use client";

/**
 * Swipe a bottom sheet down to close it.
 *
 * The home screen's reading sheets already drew the grab handle — the little
 * rounded bar every bottom sheet on a phone wears — but nothing was listening.
 * The only ways out were a 10px "collapse" link and tapping the backdrop
 * behind, so the one gesture the handle advertises did nothing, and a thumb
 * pushing the sheet down just scrolled the text inside it.
 *
 * The rules that make this feel right rather than twitchy:
 *
 *   - A drag only begins when the sheet is scrolled to its top. Otherwise
 *     pulling down means "scroll up through the reading", which is what a
 *     reader halfway down the text expects, and stealing it would be worse
 *     than not having the gesture at all.
 *   - Only downward movement counts. Dragging up does nothing rather than
 *     lifting the sheet off the bottom of the screen.
 *   - It closes on distance OR speed, so a short flick works like a long
 *     push. Matching one but not the other is what makes a sheet feel sticky.
 *   - Letting go short of either springs it back, with a transition that is
 *     removed again as soon as the next drag starts.
 */

import { useCallback, useRef } from "react";

/** How far down, in px, counts as "they meant it". */
const DISTANCE = 96;
/** Or how fast, in px per ms — a flick that never travels far. */
const VELOCITY = 0.45;
/**
 * The shortest flick that is allowed to count at all.
 *
 * Velocity on its own fires on a twitch: a 25px wobble over 50ms is 0.5px/ms
 * and would have thrown the reading away while somebody was only steadying
 * their thumb. A flick still has to go somewhere, just not the full distance.
 */
const FLICK_MIN = 44;

export function useSheetDismiss(onDismiss: () => void) {
  const el = useRef<HTMLDivElement | null>(null);
  const start = useRef<{ y: number; t: number } | null>(null);
  const dy = useRef(0);

  const setTransform = (px: number) => {
    if (el.current) el.current.style.transform = px ? `translateY(${px}px)` : "";
  };

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    // Mouse drags are not a thing on a sheet; let a cursor use the backdrop.
    if (e.pointerType === "mouse") return;
    const node = el.current;
    if (!node || node.scrollTop > 0) return;
    start.current = { y: e.clientY, t: Date.now() };
    dy.current = 0;
    node.style.transition = "";
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!start.current) return;
    const delta = e.clientY - start.current.y;
    if (delta <= 0) { dy.current = 0; setTransform(0); return; }
    dy.current = delta;
    setTransform(delta);
  }, []);

  const end = useCallback(() => {
    const began = start.current;
    start.current = null;
    if (!began) return;
    const travelled = dy.current;
    const speed = travelled / Math.max(1, Date.now() - began.t);
    dy.current = 0;
    if (travelled > DISTANCE || (travelled > FLICK_MIN && speed > VELOCITY)) {
      onDismiss();
      // Cleared so the sheet is not still shoved down when it reopens.
      setTransform(0);
      return;
    }
    if (el.current) {
      el.current.style.transition = "transform .22s cubic-bezier(.22,1,.36,1)";
      setTransform(0);
    }
  }, [onDismiss]);

  return {
    ref: el,
    /** Spread onto the sheet element. */
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: end,
      onPointerCancel: end,
    },
  };
}
