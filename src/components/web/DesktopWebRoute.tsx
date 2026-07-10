"use client";

/**
 * DesktopWebRoute — renders the desktop `web` variant of a page on lg+ and the
 * existing mobile component below lg. Used for feature routes that live outside
 * the (tabs) group (e.g. /library), where the tabs layout's web branch can't
 * reach. SSR + first paint render the mobile component (no hydration mismatch);
 * the effect swaps to the web page on desktop.
 */

import { useEffect, useState } from "react";

export default function DesktopWebRoute({
  web,
  mobile,
}: {
  web: React.ReactNode;
  mobile: React.ReactNode;
}) {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const apply = () => setIsDesktop(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return <>{isDesktop ? web : mobile}</>;
}
