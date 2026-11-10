"use client";

/**
 * Stick-to-bottom scrolling for a streaming chat thread.
 *
 * The rule people expect from a chat: if you are already at the bottom, new
 * content follows you down; the moment you scroll up to re-read something, the
 * thread stays exactly where you put it — even while a reply is still
 * generating underneath.
 *
 * Two things make that work, and both matter:
 *
 * 1. We set `scrollTop` on ONE element. The obvious `ref.scrollIntoView()`
 *    cannot do this job: it walks up the tree and scrolls EVERY scrollable
 *    ancestor to bring the target into view, so in a page that has an outer
 *    scroller it drags the whole page down on every streamed token. That was
 *    the actual bug this replaces.
 * 2. We only scroll while `pinned` — recomputed from the user's own scrolling.
 *    Our programmatic scroll lands at distance ≈ 0, so it re-affirms `pinned`
 *    rather than fighting it, and no "ignore the next event" flag is needed.
 *
 * `pinned` lives in a ref (read during layout, never stale) and is mirrored
 * into state only so the "jump to latest" button can render.
 *
 * The returned `ref` is a CALLBACK ref, not a plain object ref, and that is
 * load-bearing. Dolly's thread is not mounted on the first render — the page
 * shows a spinner while it loads, and it swaps the whole thread out again
 * whenever the history list opens. With an object ref the effects below run
 * once, against a `ref.current` that is still null, and nothing ever
 * re-attaches: the scroll listener and the ResizeObserver were both dead for
 * the entire life of the screen, so `pinned` never went false, "jump to
 * latest" could never appear, and a reply that reflowed stopped being
 * followed. A callback ref re-runs them against each real node.
 */

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * How far from the bottom still counts as "at the bottom", in px.
 *
 * Two numbers, not one, because sticking and un-sticking are not the same
 * question and a single threshold answered neither well.
 *
 * `AT_BOTTOM` is tight: it is what re-pins you, so it has to mean you really
 * are at the end. It only has to absorb sub-pixel scrollHeight rounding and
 * the last frame of a flick.
 *
 * `FAR` is loose: it is the distance past which following you is obviously
 * wrong even if nothing registered as an upward scroll.
 *
 * With one 80px threshold doing both jobs, scrolling up two lines to re-read
 * a sentence left you still counted as "at the bottom" — so the next streamed
 * token hauled you back down to the very end, which is the thing people
 * actually complain about. Un-pinning is now decided by DIRECTION instead:
 * see the scroll listener.
 */
const AT_BOTTOM = 24;
const FAR = 80;

/**
 * Should the thread still be following the bottom?
 *
 * Exported and pure so the rule can be tested directly. It is the whole of the
 * behaviour people notice on this screen, and it is otherwise buried in a
 * scroll handler that needs a browser, a streaming reply and a stopwatch to
 * exercise.
 */
export function nextPin(opts: {
  /** The scrollTop we last saw, or null if we have not seen one. */
  prevTop: number | null;
  /** The scrollTop now. */
  top: number;
  /** How far the bottom of the content is below the bottom of the viewport. */
  distance: number;
  /** Whether we were following the bottom a moment ago. */
  pinned: boolean;
}): boolean {
  // At the end — including iOS rubber-band, where distance goes negative.
  if (opts.distance <= AT_BOTTOM) return true;
  // Moved up. The 1px slack is for fractional device pixels.
  if (opts.prevTop !== null && opts.top < opts.prevTop - 1) return false;
  // A long way from the bottom and still drifting: stop following whatever
  // we thought we were doing.
  if (opts.distance > FAR) return false;
  // Moving down, short of the end: hold what we had.
  return opts.pinned;
}

export function useStickToBottom<T extends HTMLElement>(dep: unknown, active = true) {
  // The live node, as state so the effects below re-run when it changes, and
  // mirrored into a ref so the layout effect and the observer can read it
  // without being re-created.
  const [node, setNode] = useState<T | null>(null);
  const ref = useRef<T | null>(null);
  const setRef = useCallback((el: T | null) => {
    ref.current = el;
    setNode(el);
  }, []);
  const pinnedRef = useRef(true);
  const [pinned, setPinned] = useState(true);
  // The scrollTop we last set ourselves. Anything else moved it — see below.
  const lastTopRef = useRef<number | null>(null);

  // Always writes both. Guarding on the ref would let the two diverge — the
  // layout effect below drops the ref on its own, and a guard keyed to the ref
  // would then swallow the scroll event that should reveal "jump to latest".
  // React bails out of an unchanged setState, so this is cheap to call often.
  const setPin = useCallback((next: boolean) => {
    pinnedRef.current = next;
    setPinned(next);
  }, []);

  /** Jump to the newest message and re-pin (the "jump to latest" control). */
  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    const el = ref.current;
    if (!el) return;
    setPin(true);
    lastTopRef.current = null;
    el.scrollTo({ top: el.scrollHeight, behavior });
  }, [setPin]);

  // Watch the user's own scrolling. Passive: we never preventDefault here.
  useEffect(() => {
    if (!node) return;
    // A fresh node starts empty and scrolled to the top, which is also "at the
    // bottom" — re-pin, or a thread reopened from the history list comes back
    // already unpinned and refuses to follow the next reply. The ref is what
    // decides, so it is set now; the state only draws "jump to latest" and is
    // deferred, as elsewhere in this file, to keep setState out of the effect
    // body and off the render cascade.
    pinnedRef.current = true;
    lastTopRef.current = null;
    queueMicrotask(() => setPinned(true));

    // Direction decides, not distance.
    //
    // Scrolling UP is a person saying "stop, I'm reading this" — at any
    // distance, including two lines from the end. Nothing in the code scrolls
    // up: our own writes only ever move scrollTop towards the bottom, and the
    // layout effect records every one of them in lastTopRef. So a scrollTop
    // lower than the last one we saw can only be the reader, and it un-pins
    // immediately rather than waiting to clear a threshold.
    //
    // Re-pinning is the reverse: it needs them actually AT the end, which a
    // flick down reaches on its own (the browser clamps it there) and the
    // "Latest" button reaches on purpose.
    const onScroll = () => {
      const prevTop = lastTopRef.current;
      const top = node.scrollTop;
      lastTopRef.current = top;
      setPin(nextPin({
        prevTop,
        top,
        distance: node.scrollHeight - top - node.clientHeight,
        pinned: pinnedRef.current,
      }));
    };
    node.addEventListener("scroll", onScroll, { passive: true });
    return () => node.removeEventListener("scroll", onScroll);
  }, [node, setPin]);

  // Follow new content only while pinned. Layout effect so the scroll lands in
  // the same frame the content paints — otherwise each streamed token shows a
  // visible one-frame jump.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Scroll events are asynchronous, and a fast stream re-renders far more
    // often than they are delivered. So between the user flicking up and their
    // scroll event landing, this effect would still read `pinned` as true and
    // drag them straight back down — the exact "I can't scroll while it's
    // typing" symptom. Appending content never changes scrollTop (only
    // scrollHeight), so a scrollTop that differs from the one we last wrote can
    // only be the user, and we can honour it now instead of a frame late.
    if (lastTopRef.current !== null && Math.abs(el.scrollTop - lastTopRef.current) > 1) {
      // The ref decides whether we scroll, so drop it NOW — that is what stops
      // the yank. The matching React state (which only draws "jump to latest")
      // is deferred out of the layout phase rather than set synchronously here,
      // to avoid a setState cascade on every streamed token. It is not left to
      // the incoming scroll event: programmatic and coalesced scrolls do not
      // reliably deliver one, and the control would silently never appear.
      pinnedRef.current = false;
      queueMicrotask(() => setPinned(false));
    }
    if (!pinnedRef.current || !active) return;

    el.scrollTop = el.scrollHeight;
    lastTopRef.current = el.scrollTop;
    // `active` exists for the empty state. Dolly's greeting and her six
    // starter prompts are taller than the viewport, so following to the
    // bottom on mount scrolled the greeting — the first thing anyone is meant
    // to read — off the top of the screen before they had seen it.
  }, [dep, active]);

  // A reply can also grow without `dep` changing (an image loading, a font
  // swapping, the bubble reflowing). Keep following those too, while pinned.
  useEffect(() => {
    const el = node;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      const node = ref.current;
      if (!pinnedRef.current || !active || !node) return;
      node.scrollTop = node.scrollHeight;
      lastTopRef.current = node.scrollTop;
    });
    // Two subjects, two different kinds of growth.
    //
    // The inner content reports a reply getting longer. The scroller itself
    // reports its own viewport SHRINKING — which is what happens the moment a
    // phone keyboard comes up and the composer grows to clear it. That used to
    // go unnoticed: scrollTop does not change when a scroller gets shorter, so
    // a pinned reader was silently left a keyboard's height from the bottom,
    // and the next token then jumped the whole thread down to catch up. Now
    // the thread moves with the keyboard, in the same frame, and there is
    // nothing left to catch up on.
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    ro.observe(el);
    return () => ro.disconnect();
  }, [node, active]);

  return { ref: setRef, pinned, scrollToBottom };
}
