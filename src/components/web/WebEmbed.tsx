"use client";

/**
 * WebEmbed — wraps an existing mobile page component in the shared web shell
 * for the desktop experience. The wrapped content keeps its own real data and
 * logic; it themes correctly because the app's --background/--foreground tokens
 * follow the same html data-theme the web shell is unified with.
 *
 * Used for the "fill-in" routes (Chart, Numerology, Human Design, Palmistry,
 * Rituals, Profile) that aren't part of the web design's seven-item top nav.
 */

import WebShell, { useWebTheme, type WebNavKey } from "./WebShell";

export default function WebEmbed({
  current = "none",
  maxWidth = 900,
  footerTagline,
  children,
}: {
  current?: WebNavKey | "none";
  maxWidth?: number;
  footerTagline?: string;
  children: React.ReactNode;
}) {
  const { theme, toggle } = useWebTheme();
  return (
    <WebShell current={current as WebNavKey} theme={theme} onToggleTheme={toggle} footerTagline={footerTagline}>
      <div style={{ maxWidth, margin: "0 auto", padding: "8px 20px 48px" }}>{children}</div>
    </WebShell>
  );
}
