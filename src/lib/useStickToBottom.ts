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
 */

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

/** How close to the bottom still counts as "at the bottom", in px. */
const THRESHOLD = 80;

export function useStickToBottom<T extends HTMLElement>(dep: unknown) {
  const ref = useRef<T | null>(null);
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
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      lastTopRef.current = el.scrollTop;
      setPin(el.scrollHeight - el.scrollTop - el.clientHeight <= THRESHOLD);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [setPin]);

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
    if (!pinnedRef.current) return;

    el.scrollTop = el.scrollHeight;
    lastTopRef.current = el.scrollTop;
  }, [dep]);

  // A reply can also grow without `dep` changing (an image loading, a font
  // swapping, the bubble reflowing). Keep following those too, while pinned.
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      const node = ref.current;
      if (!pinnedRef.current || !node) return;
      node.scrollTop = node.scrollHeight;
      lastTopRef.current = node.scrollTop;
    });
    // Observing the inner content is what reports growth; observing the
    // scroller itself only reports viewport changes.
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => ro.disconnect();
  }, []);

  return { ref, pinned, scrollToBottom };
}
