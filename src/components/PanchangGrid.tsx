"use client";

/**
 * Today's panchang — tithi, nakshatra, yoga, karana, vara — as a compact list.
 * Used in the home Nakshatra card and the Nakshatra widget.
 *
 * Calculated for the moment the screen opened (lib/astro/vedic/panchang.ts),
 * with the time the current tithi and nakshatra end. Lahiri ayanamsa, the
 * standard for Indian almanacs.
 */

import { useMemo } from "react";
import { getPanchang } from "@/lib/astro/vedic/panchang";

function endsLabel(end: Date | null, from: Date): string | null {
  if (!end) return null;
  const sameDay = end.toDateString() === from.toDateString();
  const time = end.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return sameDay ? `until ${time}` : `until ${end.toLocaleDateString([], { weekday: "short" })} ${time}`;
}

const TONES = {
  // Default app surfaces.
  plain: { label: "var(--foreground-muted)", value: "var(--foreground)", note: "var(--foreground-faint)", rule: "var(--border-card)" },
  // The home page's folder cards, which have their own text colours.
  card: { label: "var(--foreground-on-card-muted)", value: "var(--foreground-on-card)", note: "var(--foreground-on-card-faint)", rule: "var(--border-card)" },
  // Desktop web screens (WebShell's variables).
  web: { label: "var(--muted)", value: "var(--fg)", note: "var(--faint)", rule: "var(--line)" },
} as const;

export default function PanchangGrid({ at, tone = "plain" }: { at: Date; tone?: keyof typeof TONES }) {
  const p = useMemo(() => getPanchang(at), [at]);
  const colors = TONES[tone];

  const rows: { label: string; value: string; detail?: string | null }[] = [
    { label: "Tithi", value: p.tithi.name, detail: endsLabel(p.tithi.endsAt, at) },
    { label: "Nakshatra", value: `${p.nakshatra.name} · pada ${p.nakshatra.pada}`, detail: endsLabel(p.nakshatra.endsAt, at) },
    { label: "Yoga", value: p.yoga.name },
    { label: "Karana", value: p.karana.name },
    { label: "Vara", value: p.vara.name, detail: `${p.vara.ruler}'s day` },
  ];

  return (
    <div>
      <p className="text-[9px] uppercase tracking-[0.18em] font-bold mb-1" style={{ color: colors.label }}>Panchang today</p>
      <dl>
        {rows.map((r) => (
          <div key={r.label} className="flex items-baseline justify-between gap-3 py-1.5" style={{ borderTop: `0.5px solid ${colors.rule}` }}>
            <dt className="text-[11px] shrink-0" style={{ color: colors.label }}>{r.label}</dt>
            <dd className="text-right">
              <span className="text-[13px] font-semibold" style={{ color: colors.value }}>{r.value}</span>
              {r.detail && <span className="block text-[10px]" style={{ color: colors.label }}>{r.detail}</span>}
            </dd>
          </div>
        ))}
      </dl>
      <p className="text-[10px] mt-1.5 leading-relaxed" style={{ color: colors.note }}>
        The five limbs of the Hindu almanac, for right now (Lahiri). Printed panchangs list what holds at local sunrise, so they can differ near a changeover.
      </p>
    </div>
  );
}
