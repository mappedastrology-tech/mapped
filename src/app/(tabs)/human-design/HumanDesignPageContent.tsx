"use client";

/**
 * Human Design — a personalized BodyGraph reading computed from the user's
 * birth date, exact time, and place. Follows the Claude Design "Human Design —
 * You" layout: a script-name header + type strip, the BodyGraph with Design /
 * Personality activation columns, then three tabs — Type, Centers, Gates.
 * Reached from the hamburger menu at /human-design.
 */

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/components/ThemeProvider";
import HdBodyGraph from "@/components/humanDesign/HdBodyGraph";
import { computeHumanDesign, type HumanDesignProfile, type Activation } from "@/lib/humanDesign/engine";
import { CENTER_NAMES, CENTER_ORDER, GATE_TO_CENTER, type CenterId } from "@/lib/humanDesign/data";
import {
  getGate,
  getChannel,
  getCenter,
  getTypeContent,
  getAuthorityContent,
  getProfileContent,
} from "@/lib/humanDesign/content";

interface ChartRow {
  birthDate: string;
  birthTime: string;
  latitude: number | null;
  longitude: number | null;
  unknownTime: boolean;
  name: string;
  place: string;
}

/** Astronomical glyphs for the Design / Personality activation columns.
 *  U+FE0E forces monochrome text presentation (not color-emoji). */
const PLANET_GLYPH: Record<string, string> = {
  Sun: "\u2609\uFE0E", Earth: "\u2295\uFE0E", "North Node": "\u260A\uFE0E", "South Node": "\u260B\uFE0E", Moon: "\u263D\uFE0E",
  Mercury: "\u263F\uFE0E", Venus: "\u2640\uFE0E", Mars: "\u2642\uFE0E", Jupiter: "\u2643\uFE0E", Saturn: "\u2644\uFE0E",
  Uranus: "\u2645\uFE0E", Neptune: "\u2646\uFE0E", Pluto: "\u2647\uFE0E",
};

/** Symbol font stack for line-art glyphs (matches ChartWheel / the design's --a-glyph). */
const GLYPH_FONT = "'Noto Sans Symbols', 'Noto Sans Symbols 2', 'Segoe UI Symbol', serif";

/** A little color per center so the Centers tab reads at a glance.
 *  These sit on theme-switching cards, so each theme gets its own set —
 *  night uses the design's night accents, day the darkened day equivalents. */
const CENTER_COLOR_DARK: Record<CenterId, string> = {
  head: "#d4a13a", ajna: "#8aa055", throat: "var(--brass)", g: "#d4a13a",
  heart: "#c07a52", sacral: "#c07a52", solarPlexus: "#9d8fd0", spleen: "#8aa055", root: "#8aa055",
};
const CENTER_COLOR_LIGHT: Record<CenterId, string> = {
  head: "#9a7322", ajna: "#5d7d3c", throat: "var(--brass)", g: "#9a7322",
  heart: "#a4502f", sacral: "#a4502f", solarPlexus: "#6a5aa0", spleen: "#5d7d3c", root: "#5d7d3c",
};

/** Population + energy descriptor chips per type, matching the design. */
const TYPE_CHIPS: Record<string, string[]> = {
  Generator: ["70% of people", "Sacral being"],
  "Manifesting Generator": ["70% of people", "Sacral being"],
  Projector: ["20% of people", "Non-energy being"],
  Manifestor: ["9% of people", "Initiating being"],
  Reflector: ["1% of people", "Lunar being"],
};

type PageTab = "type" | "centers" | "gates";

export default function HumanDesignPageContent() {
  const router = useRouter();
  const { theme } = useTheme();
  const isLight = theme === "light";
  const centerColor = isLight ? CENTER_COLOR_LIGHT : CENTER_COLOR_DARK;
  const [isLoading, setIsLoading] = useState(true);
  const [row, setRow] = useState<ChartRow | null>(null);
  const [name, setName] = useState("");
  const [pageTab, setPageTab] = useState<PageTab>("type");
  const [openCenter, setOpenCenter] = useState<CenterId | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      let metaName = "";
      if (session?.user) {
        metaName =
          (session.user.user_metadata?.full_name as string | undefined) ||
          (session.user.user_metadata?.name as string | undefined) ||
          "";
        const { data } = await supabase
          .from("charts")
          .select("name, birth_date, birth_time, latitude, longitude, unknown_time, city_name")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
        if (data) {
          setRow({
            birthDate: data.birth_date,
            birthTime: data.birth_time || "12:00",
            latitude: data.latitude,
            longitude: data.longitude,
            unknownTime: !!data.unknown_time,
            name: data.name,
            place: (data.city_name as string) || "",
          });
          setName(metaName || data.name || "");
          setIsLoading(false);
          return;
        }
      }
      try {
        const stored = sessionStorage.getItem("chartResult");
        if (stored) {
          const p = JSON.parse(stored);
          setRow({
            birthDate: p.birthDate,
            birthTime: p.birthTime || "12:00",
            latitude: p.latitude,
            longitude: p.longitude,
            unknownTime: !!p.unknownTime,
            name: p.name,
            place: p.cityName || p.city_name || p.place || "",
          });
          setName(metaName || p.name || "");
        }
      } catch {
        /* ignore */
      }
      setIsLoading(false);
    }
    load();
  }, []);

  const hd: HumanDesignProfile | null = useMemo(() => {
    if (!row || row.latitude == null || row.longitude == null) return null;
    return computeHumanDesign({
      birthDate: row.birthDate,
      birthTime: row.birthTime,
      latitude: row.latitude,
      longitude: row.longitude,
    });
  }, [row]);

  if (isLoading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div
          className="w-6 h-6 border-2 rounded-full animate-spin"
          style={{ borderColor: "rgba(201,169,97,0.3)", borderTopColor: "var(--brass)" }}
          role="status"
          aria-label="Loading"
        />
      </main>
    );
  }

  if (!hd) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <p className="text-lg mb-6" style={{ color: "var(--foreground-secondary)" }}>
          Human Design needs your birth date, exact time, and place to draw your BodyGraph.
        </p>
        <button
          onClick={() => router.push("/chart/new")}
          className="px-8 py-3 rounded-full font-semibold text-sm tracking-wide active:scale-[0.98] transition-all"
          style={{ backgroundColor: "var(--brass)", color: "#1a1420" }}
        >
          Add my birth details
        </button>
      </main>
    );
  }

  const firstName = (name || row?.name || "").split(" ")[0];
  const birthLine = formatBirthLine(row);
  const authorityShort = hd.authorityName.replace(/\s*[—·-].*$/, "").replace(/\s*Authority$/i, "").trim();
  const typeStrip = [hd.type, `${hd.profile} Profile`, `${authorityShort} Authority`];

  const tc = getTypeContent(hd.type);
  const ac = getAuthorityContent(hd.authority);
  const pc = getProfileContent(hd.profile);

  return (
    <main className="flex-1 flex flex-col px-5 pt-5 lg:pt-8 pb-8 max-w-lg lg:max-w-2xl mx-auto w-full">
      {/* Header */}
      <div className="text-center pb-1">
        <p className="text-[9px] tracking-[0.28em] uppercase font-bold" style={{ color: "var(--brass)" }}>
          Your design
        </p>
        <p className="mt-1.5" style={{ fontFamily: "var(--font-script)", fontSize: 50, lineHeight: 1, color: "var(--foreground)" }}>
          {firstName || "You"}
        </p>
        {birthLine && (
          <p className="text-[11.5px] mt-2" style={{ color: "var(--foreground-muted)" }}>
            {birthLine}
          </p>
        )}
      </div>

      {/* Type strip */}
      <div className="flex justify-center flex-wrap gap-[7px] mt-3.5 mb-1">
        {typeStrip.map((t, i) => (
          <span
            key={i}
            className="text-[9.5px] tracking-[0.14em] uppercase font-bold px-3 py-[5px] rounded-full"
            style={{ color: "var(--brass)", border: "0.5px solid var(--border-card)", background: "var(--background-card)" }}
          >
            {t}
          </span>
        ))}
      </div>

      {row?.unknownTime && (
        <div
          className="rounded-xl px-4 py-3 mt-3 text-[12px] leading-relaxed"
          style={{ backgroundColor: "var(--plum)", border: "0.5px solid rgba(201,169,97,0.25)", color: "var(--foreground-secondary)" }}
        >
          Your birth time is marked unknown. Human Design is exquisitely time-sensitive — your Type, Authority, and
          Profile can shift with a few minutes, so treat this reading as approximate until you add an exact time.
        </div>
      )}

      {/* BodyGraph with activation columns inside the plum card */}
      <div className="mt-4 mb-1">
        <HdBodyGraph definedCenters={hd.definedCenters} definedChannels={hd.definedChannels} activeGates={hd.activeGates}>
          <div className="flex gap-2.5 mt-3.5">
            <ActivationColumn title="Design" tone="design" activations={hd.design} />
            <ActivationColumn title="Personality" tone="personality" activations={hd.personality} />
          </div>
        </HdBodyGraph>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 z-[5] py-2 mt-4 mb-4" style={{ background: "var(--background)" }}>
        <div className="flex gap-[5px] p-1 rounded-[13px]" style={{ background: "var(--background-card)" }}>
          {(["type", "centers", "gates"] as PageTab[]).map((t) => {
            const active = pageTab === t;
            return (
              <button
                key={t}
                onClick={() => { setPageTab(t); setOpenCenter(null); }}
                className="flex-1 py-[11px] rounded-[10px] text-[10px] tracking-[0.1em] uppercase font-bold transition-colors"
                style={{ background: active ? "var(--brass)" : "transparent", color: active ? "#1a1230" : "var(--foreground-muted)" }}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── TYPE TAB ── */}
      {pageTab === "type" && (
        <>
          <div className="flex flex-col gap-3 mb-4">
            <GradientCard glyph={"\u2699\uFE0E"} kicker="Your type" title={hd.type} body={tc?.description ?? ""} chips={TYPE_CHIPS[hd.type] ?? [`${hd.aura} aura`]} />
            <GradientCard glyph={"\u21BB\uFE0E"} kicker="Your strategy" title={hd.strategy} body={tc?.strategyDetail ?? ""} chips={[hd.strategy]} />
            <GradientCard glyph={"\u25D1\uFE0E"} kicker="Your authority" title={ac?.name ?? hd.authorityName} body={ac?.description ?? ""} chips={[`${authorityShort} authority`]} />
            <GradientCard glyph={"\u2725\uFE0E"} kicker="Your profile" title={`${hd.profile} · ${hd.profileName}`} body={pc?.description ?? ""} chips={hd.profileName.split(" / ")} />
          </div>
          <div className="flex flex-col gap-[9px] mb-2">
            <MechCard kicker="Signature" title={hd.signature} body={tc?.signatureDetail ?? ""} accent={isLight ? "#5d7d3c" : "#7ba055"} />
            <MechCard kicker="Not-self theme" title={hd.notSelf} body={tc?.notSelfDetail ?? ""} accent="var(--hold)" />
            <MechCard kicker="Definition" title={hd.definitionName} body={definitionBlurb(hd.definition)} accent="var(--brass)" />
            <MechCard
              kicker="Incarnation cross"
              title={`${hd.incarnationCross.angle} Cross`}
              meta={`Gates ${hd.incarnationCross.gates.join(" / ")}`}
              body={crossBlurb(hd)}
              accent={isLight ? "#9a7322" : "#d4a13a"}
            />
          </div>
        </>
      )}

      {/* ── CENTERS TAB ── */}
      {pageTab === "centers" && (
        <>
          <p className="mb-1" style={{ fontFamily: "var(--font-heading)", fontSize: 22, color: "var(--foreground)" }}>
            Your nine centers
          </p>
          <p className="text-[12.5px] leading-relaxed mb-4" style={{ color: "var(--foreground-muted)" }}>
            Defined centers are fixed, reliable energy you can lean on. Open centers are where you take in the world —
            wise, but easily overwhelmed.
          </p>
          <div className="flex flex-col gap-2 mb-2">
            {CENTER_ORDER.map((id) => {
              const defined = hd.definedCenters.includes(id);
              const cc = getCenter(id);
              const color = centerColor[id];
              return (
                <CenterRow
                  key={id}
                  name={CENTER_NAMES[id]}
                  meta={cc?.role ?? ""}
                  defined={defined}
                  color={color}
                  open={openCenter === id}
                  onToggle={() => setOpenCenter(openCenter === id ? null : id)}
                  heroBody={cc ? (defined ? cc.defined : cc.open) : ""}
                  sections={cc ? [
                    { label: "What it governs", text: cc.role },
                    { label: defined ? "Living it well" : "The gift", text: defined ? cc.whenDefinedApp : cc.whenOpenApp },
                  ] : []}
                />
              );
            })}
          </div>
        </>
      )}

      {/* ── GATES TAB ── */}
      {pageTab === "gates" && (
        <>
          <p className="mb-1" style={{ fontFamily: "var(--font-heading)", fontSize: 22, color: "var(--foreground)" }}>
            Your channels
          </p>
          <p className="text-[12.5px] leading-relaxed mb-4" style={{ color: "var(--foreground-muted)" }}>
            A channel forms when both its gates are active, wiring two centers together — the fixed circuitry of who you are.
          </p>
          <div className="flex flex-col gap-3 mb-7">
            {hd.definedChannels.length === 0 && (
              <div className="rounded-[15px] px-4 py-3.5" style={{ background: "var(--background-card)", border: "0.5px solid var(--border-card)" }}>
                <p className="text-[13px] leading-relaxed" style={{ color: "var(--foreground-secondary)" }}>
                  With no channels wired, you&apos;re a Reflector — a rare, sampling design that mirrors your community.
                </p>
              </div>
            )}
            {hd.definedChannels.map((ch) => {
              const cc = getChannel(ch.gates[0], ch.gates[1]);
              return (
                <div key={`${ch.gates[0]}-${ch.gates[1]}`} className="rounded-[15px] overflow-hidden" style={{ background: "var(--background-card)", border: "0.5px solid var(--border-card)" }}>
                  <div className="px-4 py-3" style={{ background: "rgba(201,169,97,0.06)", borderBottom: "0.5px solid var(--border-card)" }}>
                    <div className="flex items-center gap-2.5">
                      <span className="text-[11px] font-bold tracking-[0.04em]" style={{ color: "var(--brass)" }}>{ch.gates[0]} — {ch.gates[1]}</span>
                      {cc && <span style={{ fontFamily: "var(--font-heading)", fontSize: 16, color: "var(--foreground)" }}>{cc.name}</span>}
                    </div>
                    <p className="text-[10.5px] mt-1" style={{ color: "var(--foreground-muted)" }}>
                      {CENTER_NAMES[ch.centers[0]]} ↔ {CENTER_NAMES[ch.centers[1]]}
                    </p>
                  </div>
                  <p className="text-[13px] leading-relaxed px-4 py-3.5" style={{ color: "var(--foreground-secondary)" }}>
                    {cc?.description ?? `Connects the ${CENTER_NAMES[ch.centers[0]]} and ${CENTER_NAMES[ch.centers[1]]}.`}
                  </p>
                </div>
              );
            })}
          </div>

          <p className="mb-1" style={{ fontFamily: "var(--font-heading)", fontSize: 22, color: "var(--foreground)" }}>
            Signature gates
          </p>
          <p className="text-[12.5px] leading-relaxed mb-3.5" style={{ color: "var(--foreground-muted)" }}>
            Standout active gates — specific gifts switched on in your design.
          </p>
          <div className="flex flex-col gap-2 mb-2">
            {signatureGates(hd).map((num) => {
              const g = getGate(num);
              const center = GATE_TO_CENTER[num];
              if (!g) return null;
              return (
                <div key={num} className="rounded-[14px] px-4 py-3.5" style={{ background: "var(--background-card)", border: "0.5px solid var(--border-card)" }}>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span
                      className="shrink-0 w-[30px] h-[30px] rounded-full flex items-center justify-center text-[12px] font-bold"
                      style={{ color: "var(--brass)", background: "rgba(201,169,97,0.08)", border: "0.5px solid var(--border-card)" }}
                    >
                      {num}
                    </span>
                    <span style={{ fontFamily: "var(--font-heading)", fontSize: 16, color: "var(--foreground)" }}>
                      {g.name.replace(/^Gate \d+ — /, "")}
                    </span>
                    {center && (
                      <span className="ml-auto text-[9px] tracking-[0.1em] uppercase" style={{ color: "var(--foreground-faint)" }}>
                        {CENTER_NAMES[center]}
                      </span>
                    )}
                  </div>
                  <p className="text-[12.5px] leading-relaxed" style={{ color: "var(--foreground-secondary)" }}>
                    {g.description}
                  </p>
                </div>
              );
            })}
          </div>
        </>
      )}
    </main>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatBirthLine(row: ChartRow | null): string {
  if (!row) return "";
  const parts: string[] = [];
  const dm = /^(\d{4})-(\d{2})-(\d{2})$/.exec(row.birthDate || "");
  if (dm) {
    const d = new Date(Number(dm[1]), Number(dm[2]) - 1, Number(dm[3]));
    parts.push(d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }));
  }
  if (row.birthTime && !row.unknownTime) {
    const tm = /^(\d{1,2}):(\d{2})$/.exec(row.birthTime);
    if (tm) {
      let h = Number(tm[1]);
      const m = tm[2];
      const ampm = h >= 12 ? "PM" : "AM";
      h = h % 12 || 12;
      parts.push(`${h}:${m} ${ampm}`);
    }
  }
  if (row.place) parts.push(row.place);
  return parts.join(" · ");
}

/** The four defining incarnation-cross gates, de-duplicated in order. */
function signatureGates(hd: HumanDesignProfile): number[] {
  const seen = new Set<number>();
  const out: number[] = [];
  for (const g of hd.incarnationCross.gates) {
    if (!seen.has(g)) { seen.add(g); out.push(g); }
  }
  return out;
}

function definitionBlurb(n: number): string {
  switch (n) {
    case 0:
      return "None of your centers link up — the Reflector's open, sampling design that reflects the health of your surroundings.";
    case 1:
      return "All of your defined centers are connected in one flow — a self-contained, consistent inner wiring.";
    case 2:
      return "Your defined centers form two separate groups. You may feel a subtle inner gap you look to others (or the right circumstances) to bridge.";
    case 3:
      return "Three separate groups of definition — a busy inner landscape that finds coherence through several kinds of connection.";
    default:
      return "Four separate groups of definition — the rarest wiring, rich and multi-faceted, integrated slowly over time.";
  }
}

function crossBlurb(hd: HumanDesignProfile): string {
  const [pS, pE, dS, dE] = hd.incarnationCross.gates;
  const name = (g: number) => getGate(g)?.name.replace(/^Gate \d+ — /, "") ?? `Gate ${g}`;
  return `Built from your conscious Sun (Gate ${pS} — ${name(pS)}) and Earth (Gate ${pE}), and your unconscious Sun (Gate ${dS}) and Earth (Gate ${dE}). A ${hd.incarnationCross.angle} cross points to ${hd.incarnationCross.angle === "Right Angle" ? "a personal journey focused on your own unfolding" : hd.incarnationCross.angle === "Left Angle" ? "a transpersonal journey bound up with others" : "a fixed, singular fate all its own"}.`;
}

// ── Sub-components ──────────────────────────────────────────────────────────

function ActivationColumn({ title, tone, activations }: { title: string; tone: "design" | "personality"; activations: Activation[] }) {
  const isDesign = tone === "design";
  // Fixed colors — these sit on the plum bodygraph card, so they don't follow the theme.
  const header = isDesign ? "#d4a13a" : "rgba(232,236,251,0.75)";
  const rowBg = isDesign ? "rgba(212,161,58,0.10)" : "rgba(232,236,251,0.06)";
  const rowBd = isDesign ? "rgba(212,161,58,0.24)" : "rgba(232,236,251,0.14)";
  const glyphColor = isDesign ? "#d4a13a" : "rgba(232,236,251,0.9)";
  const valueColor = isDesign ? "#f0e6d2" : "rgba(240,244,255,0.92)";
  return (
    <div className="flex-1 min-w-0">
      <p className="text-[8.5px] tracking-[0.22em] uppercase font-bold text-center mb-[7px]" style={{ color: header }}>
        {title}
      </p>
      <div className="flex flex-col gap-[3px]">
        {activations.map((a) => (
          <div
            key={a.body}
            className="flex items-center gap-[7px] px-[9px] py-[3px] rounded-[7px]"
            style={{ background: rowBg, border: `0.5px solid ${rowBd}` }}
          >
            <span className="text-[12px] w-[14px] text-center shrink-0" style={{ color: glyphColor, fontFamily: GLYPH_FONT }}>
              {PLANET_GLYPH[a.body] ?? "•"}
            </span>
            <span className="text-[10.5px] font-semibold tabular-nums" style={{ color: valueColor }}>
              {a.gate}.{a.line}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function GradientCard({ glyph, kicker, title, body, chips }: { glyph: string; kicker: string; title: string; body: string; chips?: string[] }) {
  return (
    <div className="rounded-[20px] p-5" style={{ background: "#342440", border: "0.5px solid rgba(201,169,97,0.16)" }}>
      <div className="flex items-center gap-[11px] mb-3">
        <span className="text-[22px]" style={{ color: "var(--brass)", fontFamily: GLYPH_FONT }}>{glyph}</span>
        <span>
          <span className="block text-[9px] tracking-[0.2em] uppercase font-bold" style={{ color: "var(--brass)" }}>{kicker}</span>
          <span className="block mt-0.5" style={{ fontFamily: "var(--font-heading)", fontSize: 19, color: "#f0e6d2" }}>{title}</span>
        </span>
      </div>
      <p className="text-[13px] leading-[1.7] m-0" style={{ color: "rgba(240,230,210,0.82)" }}>{body}</p>
      {chips && chips.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {chips.map((ch, i) => (
            <span key={i} className="text-[10px] font-semibold px-[11px] py-[5px] rounded-full" style={{ color: "#f0e6d2", background: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(201,169,97,0.16)" }}>
              {ch}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function MechCard({ kicker, title, meta, body, accent }: { kicker: string; title: string; meta?: string; body: string; accent: string }) {
  return (
    <div className="rounded-[15px] px-[17px] py-[15px]" style={{ background: "var(--background-card)", border: "0.5px solid var(--border-card)", borderLeft: `2.5px solid ${accent}` }}>
      <span className="inline-block text-[8.5px] tracking-[0.16em] uppercase font-bold mb-[7px]" style={{ color: accent }}>{kicker}</span>
      <div className="flex items-baseline gap-2.5 flex-wrap mb-1.5">
        <span style={{ fontFamily: "var(--font-heading)", fontSize: 16, color: "var(--foreground)", lineHeight: 1.2 }}>{title}</span>
        {meta && <span className="text-[11px]" style={{ color: "var(--foreground-muted)" }}>{meta}</span>}
      </div>
      <p className="text-[13px] leading-[1.65] m-0" style={{ color: "var(--foreground-secondary)" }}>{body}</p>
    </div>
  );
}

function CenterRow({
  name, meta, defined, color, open, onToggle, heroBody, sections,
}: {
  name: string; meta: string; defined: boolean; color: string; open: boolean;
  onToggle: () => void; heroBody: string; sections: { label: string; text: string }[];
}) {
  return (
    <div className="rounded-[15px] overflow-hidden" style={{ background: "var(--background-card)", border: "0.5px solid var(--border-card)" }}>
      <button onClick={onToggle} aria-expanded={open} className="w-full flex items-center gap-[13px] px-4 py-3.5 text-left">
        <span
          className="shrink-0 w-[34px] h-[34px] rounded-[9px]"
          style={defined ? { background: color, border: `1.4px solid ${color}` } : { background: "transparent", border: "1.4px solid var(--foreground-faint)" }}
        />
        <span className="flex-1 min-w-0">
          <span className="block" style={{ fontFamily: "var(--font-heading)", fontSize: 16, color: "var(--foreground)", lineHeight: 1.15 }}>{name}</span>
          <span className="block text-[11px] mt-0.5" style={{ color: "var(--foreground-muted)" }}>{meta}</span>
        </span>
        <span
          className="shrink-0 text-[8px] tracking-[0.1em] uppercase font-bold px-2 py-1 rounded-full"
          style={{ color: defined ? color : "var(--foreground-muted)", background: "var(--background)", border: "0.5px solid var(--border-card)" }}
        >
          {defined ? "Defined" : "Open"}
        </span>
        <span className="shrink-0 text-[13px] transition-transform" style={{ color: "var(--brass)", transform: open ? "rotate(90deg)" : "none" }} aria-hidden="true">›</span>
      </button>
      {open && (
        <div className="px-4 pb-[18px]">
          <div className="h-px mb-3.5" style={{ background: "var(--border-card)" }} />
          <p className="text-[9px] tracking-[0.2em] uppercase font-semibold mb-1.5" style={{ color: "var(--foreground-faint)" }}>
            {defined ? "A defined center" : "An open center"}
          </p>
          <p className="mb-[11px]" style={{ fontFamily: "var(--font-heading)", fontSize: 21, color }}>
            {defined ? "Defined" : "Open"} {name}
          </p>
          <p className="text-[14px] leading-[1.7]" style={{ color: "var(--foreground)" }}>{heroBody}</p>
          {sections.map((s, i) => (
            <div key={i} className="mt-4">
              <p className="text-[10px] tracking-[0.12em] uppercase font-bold mb-1.5" style={{ color }}>{s.label}</p>
              <p className="text-[13px] leading-[1.65]" style={{ color: "var(--foreground-secondary)" }}>{s.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
