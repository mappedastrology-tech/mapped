"use client";

/**
 * How much of the screen the on-screen keyboard is covering, in CSS pixels.
 *
 * Three platforms, three different behaviours, and only one of them is
 * handled by configuration:
 *
 *   - **Android WebView / Chrome** obey `interactive-widget: resizes-content`
 *     in the viewport, which shrinks the layout viewport. Nothing more needed.
 *   - **The iOS app** is handled by @capacitor/keyboard's native resize mode,
 *     configured in capacitor.config.ts.
 *   - **iOS Safari — mobile web — obeys neither.** `interactive-widget` is
 *     not supported there, and there is no plugin in a browser. The layout
 *     viewport keeps its full height, the keyboard is drawn over the bottom of
 *     it, and a composer pinned to the bottom of a `dvh` column is simply
 *     underneath it. You tap the box to type and the box vanishes.
 *
 * `visualViewport` is the only thing that reports this in a browser. The
 * overlap is the difference between the layout viewport's bottom edge and the
 * visual viewport's, which accounts for the page also being scrolled.
 *
 * Returns 0 everywhere the keyboard is closed, on desktop, during SSR, and in
 * any browser without the API — so a caller can add it unconditionally.
 */

import { useEffect, useState } from "react";

/** Below this, it is browser chrome moving, not a keyboard. */
const MIN_KEYBOARD = 120;

export function useKeyboardInset(): number {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    const vv = typeof window !== "undefined" ? window.visualViewport : undefined;
    if (!vv) return;

    const update = () => {
      // offsetTop matters: when the page itself has been scrolled by the
      // browser to reveal the focused field, the visual viewport's top is no
      // longer at the layout viewport's top, and ignoring it double-counts.
      const overlap = window.innerHeight - vv.height - vv.offsetTop;
      setInset(overlap > MIN_KEYBOARD ? Math.round(overlap) : 0);
    };

    update();
    vv.addEventListener("resize", update);
    // Scroll too: on iOS the visual viewport slides rather than resizing when
    // focus moves between fields, and only a scroll event reports it.
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  return inset;
}
