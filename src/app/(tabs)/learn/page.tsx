"use client";

/**
 * Ritual page — daily rituals and moon work.
 *
 * This route used to be "Practice": the ritual content behind a Rituals|Tarot
 * pill toggle that mounted the ENTIRE tarot page as its second mode. That was a
 * duplicate — Tarot has its own bottom-nav tab at /tarot — and it contradicted
 * every entry point into this route, all of which call it "Rituals" (the
 * hamburger menu, the side nav, the web shell). The toggle is gone; the tab is
 * one thing again.
 *
 * Rituals still USE tarot — a moon ritual may ask you to sit with The Hermit,
 * and "Tarot / Oracle Deck" remains in the tools list. That is a ritual
 * ingredient, not a second feature bolted onto the page, so it stays.
 *
 * Kept as a thin dynamic wrapper: RitualPageContent is large, and loading it
 * on demand is why this file exists at all.
 */

import dynamic from "next/dynamic";

const RitualPageContent = dynamic(() => import("./RitualPageContent"), {
  ssr: false,
  loading: () => <div className="flex-1" />,
});

export default function RitualPage() {
  return <RitualPageContent />;
}
