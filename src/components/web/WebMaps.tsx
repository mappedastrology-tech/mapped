"use client";

/**
 * WebMaps — the Maps tab on desktop: the real map, inside the web shell.
 *
 * This used to be its own screen — a pannable constellation built for the web
 * design — and it was a picture of a map rather than a map. It had no way to
 * add anyone and no way to edit anyone, so on a laptop the people in your life
 * could only be looked at, never changed. It read your people through a
 * lighter scoring pass of its own (useConstellation), so the same person could
 * score differently on your phone and your laptop, and it showed nobody at all
 * whenever your chart wasn't already in this tab's sessionStorage. Before
 * that, it filled an empty map with eight invented people.
 *
 * The phone's Maps tab already does all of it properly: it loads only the
 * signed-in person's connections, starts empty when there are none, adds and
 * edits people (with the paywall limit and the one-partner rule), runs the
 * full synastry engine, and has its own moveable constellation. So desktop
 * shows that, the same way the Chart, Numerology and Profile routes do. One
 * implementation of who is on your map means one place for it to be wrong.
 *
 * Always the night shell. Maps has no light mode — MapsTab forces the app's
 * html data-theme to dark while it is mounted — so a day shell around it put
 * dark-mode ink (cream names, cream tab labels) on a cream page. This is
 * WebEmbed with the theme pinned, rather than a theme option on WebEmbed that
 * only one page would ever pass.
 */

import WebShell, { useWebTheme } from "./WebShell";
import MapsTab from "@/app/(tabs)/maps/page";

export default function WebMaps() {
  const { toggle } = useWebTheme();
  return (
    <WebShell current="maps" theme="night" onToggleTheme={toggle} footerTagline="The people in your orbit.">
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "8px 20px 48px" }}>
        <MapsTab />
      </div>
    </WebShell>
  );
}
