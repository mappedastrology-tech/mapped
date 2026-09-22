"use client";

/**
 * "Happening now" — the celestial event the sky is currently in, kept in the
 * almanac for as long as it lasts.
 *
 * The home screen shows these same events as a banner you can dismiss, and
 * dismissing it there hides it for the rest of that day. That is right for an
 * uninvited banner on the screen you open every morning, but it also meant the
 * event became unreachable the moment you closed it: the takeover screen with
 * the lore, the ritual and the artwork had exactly one entrance, and it was the
 * thing you had just swiped away.
 *
 * So this exists, and it deliberately does NOT read the home screen's dismissal
 * keys (mapped:moon-banner-dismissed-*, mapped:solar-banner-dismissed-*). The
 * almanac is where someone goes to look something up on purpose; nothing they
 * dismissed elsewhere should be missing from it.
 *
 * "Until it is over" means different things for the two kinds, and both come
 * from celestialCalendar rather than being re-decided here:
 *
 *   - A moon event runs the whole window the moon reads as new or full, which
 *     is roughly three days. getTodaysMoonEvent returns it for all of them and
 *     flags the exact day with isPeak.
 *   - A solstice or equinox is an instant, so getTodaysSolarEvent returns it
 *     only on the calendar day that holds it. The day is the event.
 *
 * Eclipses are not a third case — an eclipse IS a new or full moon, and arrives
 * flagged on the moon event.
 */

import { useEffect, useMemo, useState } from "react";
import MoonEventScreen from "@/components/MoonEventScreen";
import SolarEventScreen from "@/components/SolarEventScreen";
import {
  getTodaysMoonEvent,
  getTodaysSolarEvent,
  type TodaysSolarEvent,
} from "@/lib/celestialCalendar";

export default function HappeningNow() {
  const [openMoon, setOpenMoon] = useState(false);
  const [openSolar, setOpenSolar] = useState<TodaysSolarEvent | null>(null);

  /**
   * The clock is read after mount, not during render.
   *
   * Both almanacs are prerendered into the static export, so a date computed
   * while rendering is the BUILD date on the server and the viewer's date on
   * the client — which is a hydration mismatch, and on a card whose whole
   * subject is "what is happening today" it would also be wrong for however
   * long the build is old. Waiting a frame costs nothing here.
   */
  const [today, setToday] = useState<Date | null>(null);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setToday(new Date()); }, []);

  const moon = useMemo(() => (today ? getTodaysMoonEvent(today) : null), [today]);
  const solar = useMemo(() => (today ? getTodaysSolarEvent(today) : null), [today]);

  if (!moon && !solar) return null;

  return (
    <section className="mb-6" aria-labelledby="happening-now-heading">
      <h2
        id="happening-now-heading"
        className="text-[11px] uppercase tracking-widest text-muted mb-2"
        style={{ fontFamily: "var(--font-ui)" }}
      >
        Happening now
      </h2>

      <div className="space-y-2.5">
        {solar && (
          <EventRow
            emoji={null}
            image="/images/learn/almanac-sunday-sun.webp"
            eyebrow={solar.dayType}
            title={solar.name}
            blurb={`The Sun enters ${solar.sign}.`}
            background={
              solar.kind === "winter-solstice"
                ? "linear-gradient(135deg, #161334 0%, #0a0a18 100%)"
                : "linear-gradient(135deg, #3a2410 0%, #1f1408 100%)"
            }
            onOpen={() => setOpenSolar(solar)}
          />
        )}

        {moon && (
          <EventRow
            emoji={moon.lore?.emoji || (moon.kind === "new" ? "🌑" : "🌕")}
            image={null}
            // isPeak is the difference between "this is tonight" and "the moon
            // is in this phase for a few days" — saying "tonight" on all three
            // would be wrong on two of them.
            eyebrow={
              moon.isEclipse
                ? (moon.kind === "new" ? "Solar eclipse" : "Lunar eclipse")
                : moon.isPeak ? "Tonight" : "These few nights"
            }
            title={
              moon.kind === "new"
                ? `New Moon in ${moon.zodiacSign}`
                : moon.moonName || `Full Moon in ${moon.zodiacSign}`
            }
            blurb={moon.lore?.energy || ""}
            background={
              moon.kind === "new"
                ? "linear-gradient(135deg, #1a1528 0%, #0e0a14 100%)"
                : "linear-gradient(135deg, #2a1f0e 0%, #1a1528 100%)"
            }
            onOpen={() => setOpenMoon(true)}
          />
        )}
      </div>

      {openMoon && <MoonEventScreen onClose={() => setOpenMoon(false)} />}
      {openSolar && (
        <SolarEventScreen event={openSolar} onClose={() => setOpenSolar(null)} />
      )}
    </section>
  );
}

/**
 * A whole-card button rather than a card with a "Read more" inside it: the
 * entire row does one thing, and a tap target the size of the card is easier
 * to hit than a link at the bottom of it.
 */
function EventRow({
  emoji,
  image,
  eyebrow,
  title,
  blurb,
  background,
  onOpen,
}: {
  emoji: string | null;
  image: string | null;
  eyebrow: string;
  title: string;
  blurb: string;
  background: string;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full text-left rounded-2xl px-4 py-4 flex items-center gap-3.5 active:scale-[0.99] transition-transform"
      style={{ background, border: "1px solid rgba(255,255,255,0.08)" }}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          aria-hidden="true"
          width={40}
          height={40}
          style={{ width: 40, height: 40, objectFit: "contain", flexShrink: 0 }}
        />
      ) : (
        <span className="text-[26px] shrink-0" aria-hidden="true">{emoji}</span>
      )}

      <span className="flex-1 min-w-0">
        <span
          className="block text-[10px] uppercase tracking-[0.14em] mb-0.5"
          style={{ color: "rgba(255,255,255,0.42)", fontFamily: "var(--font-ui)" }}
        >
          {eyebrow}
        </span>
        <span
          className="block text-[16px] font-medium truncate"
          style={{ color: "#f0e6d2", fontFamily: "var(--font-heading)" }}
        >
          {title}
        </span>
        {blurb && (
          <span
            className="block text-[12px] leading-[1.5] mt-1 line-clamp-2"
            style={{ color: "rgba(240,230,210,0.7)", fontFamily: "var(--font-body)" }}
          >
            {blurb}
          </span>
        )}
      </span>

      <svg
        width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="rgba(240,230,210,0.5)" strokeWidth="2" strokeLinecap="round"
        className="shrink-0" aria-hidden="true"
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
  );
}
