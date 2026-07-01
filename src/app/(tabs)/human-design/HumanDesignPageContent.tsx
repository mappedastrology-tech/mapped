"use client";

/**
 * Human Design — a personalized, digestible BodyGraph reading computed from the
 * user's birth date, exact time, and place. Shows the visual BodyGraph plus
 * broken-up cards for Type, Authority, Profile, Definition, Incarnation Cross,
 * Centers, Channels, Gates, and Variables — each with an info tooltip and
 * everyday application. Reached from the hamburger menu at /human-design.
 */

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import BodyGraph from "@/components/humanDesign/BodyGraph";
import { computeHumanDesign, type HumanDesignProfile, type Activation } from "@/lib/humanDesign/engine";
import { CENTER_NAMES, LINE_NAMES, type CenterId } from "@/lib/humanDesign/data";
import {
  getGate,
  getChannel,
  getCenter,
  getTypeContent,
  getAuthorityContent,
  getProfileContent,
  getVariableContent,
} from "@/lib/humanDesign/content";
import { getHdConcept } from "@/lib/humanDesign/concepts";

const PLANET_GLYPH: Record<string, string> = {
  Sun: "☉",
  Earth: "⊕",
  "North Node": "☊",
  "South Node": "☋",
  Moon: "☽",
  Mercury: "☿",
  Venus: "♀",
  Mars: "♂",
  Jupiter: "♃",
  Saturn: "♄",
  Uranus: "♅",
  Neptune: "♆",
  Pluto: "♇",
};

interface ChartRow {
  birthDate: string;
  birthTime: string;
  latitude: number | null;
  longitude: number | null;
  unknownTime: boolean;
  name: string;
}

export default function HumanDesignPageContent() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [row, setRow] = useState<ChartRow | null>(null);
  const [name, setName] = useState("");

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
          .select("name, birth_date, birth_time, latitude, longitude, unknown_time")
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

  return (
    <main className="flex-1 flex flex-col px-5 py-6 max-w-lg mx-auto w-full">
      {/* Header */}
      <div className="text-center mb-4">
        <p className="text-[9px] tracking-[0.25em] uppercase font-medium mb-3" style={{ color: "var(--brass)" }}>
          your bodygraph
        </p>
        <h1
          className="text-[26px] tracking-[0.18em] uppercase mb-1.5"
          style={{ fontFamily: "var(--font-display)", fontWeight: 400, color: "var(--foreground)" }}
        >
          Human Design
        </h1>
        <p className="text-[13px]" style={{ fontFamily: "var(--font-body)", color: "var(--foreground-secondary)" }}>
          {name} · {hd.type}
        </p>
      </div>

      {row?.unknownTime && (
        <Tooltip>
          Your birth time is marked unknown. Human Design is exquisitely time-sensitive — your Type, Authority, and
          Profile can shift with a few minutes, so treat this reading as approximate until you add an exact time.
        </Tooltip>
      )}

      {/* BodyGraph */}
      <div className="mb-6">
        <BodyGraph definedCenters={hd.definedCenters} definedChannels={hd.definedChannels} />
      </div>

      {/* Snapshot pills */}
      <div className="grid grid-cols-2 gap-2.5 mb-7">
        <Pill label="Type" value={hd.type} />
        <Pill label="Strategy" value={hd.strategy} />
        <Pill label="Authority" value={hd.authorityName.split(" — ")[0]} />
        <Pill label="Profile" value={`${hd.profile} · ${hd.profileName.split(" / ")[0]}`} />
      </div>

      {/* TYPE */}
      <SectionLabel>Your Type</SectionLabel>
      {(() => {
        const tc = getTypeContent(hd.type);
        return (
          <ExpandCard
            id="type"
            title={hd.type}
            subtitle={`Aura: ${hd.aura}`}
            conceptKey="type"
            badge={hd.strategy}
          >
            {tc && <Body>{tc.description}</Body>}
            <MiniRow label="Strategy" value={hd.strategy} note={tc?.strategyDetail} conceptKey="strategy" />
            <MiniRow label="Signature" value={hd.signature} note={tc?.signatureDetail} conceptKey="signature" />
            <MiniRow label="Not-Self" value={hd.notSelf} note={tc?.notSelfDetail} conceptKey="notSelf" />
            {tc && <Application>{tc.application}</Application>}
          </ExpandCard>
        );
      })()}

      {/* AUTHORITY */}
      <SectionLabel>Your Authority</SectionLabel>
      {(() => {
        const ac = getAuthorityContent(hd.authority);
        return (
          <ExpandCard id="authority" title={ac?.name ?? hd.authorityName} conceptKey="authority">
            {ac && <Body>{ac.description}</Body>}
            {ac && <Application label="How to decide">{ac.howToDecide}</Application>}
          </ExpandCard>
        );
      })()}

      {/* PROFILE */}
      <SectionLabel>Your Profile</SectionLabel>
      {(() => {
        const pc = getProfileContent(hd.profile);
        return (
          <ExpandCard
            id="profile"
            title={`${hd.profile} — ${hd.profileName}`}
            subtitle={`Conscious line ${hd.profileLines[0]} · Unconscious line ${hd.profileLines[1]}`}
            conceptKey="profile"
          >
            {pc && <Body>{pc.description}</Body>}
            {pc && <Application>{pc.application}</Application>}
          </ExpandCard>
        );
      })()}

      {/* DEFINITION + CROSS */}
      <SectionLabel>Definition & Purpose</SectionLabel>
      <div className="flex flex-col gap-2.5 mb-7">
        <InfoBlock title={hd.definitionName} body={definitionBlurb(hd.definition)} conceptKey="definition" />
        <InfoBlock
          title={hd.incarnationCross.angle + " Incarnation Cross"}
          body={crossBlurb(hd)}
          conceptKey="incarnationCross"
        />
      </div>

      {/* CENTERS */}
      <SectionLabel>The 9 Centers</SectionLabel>
      <div className="flex flex-col gap-2.5 mb-7">
        {(Object.keys(CENTER_NAMES) as CenterId[]).map((id) => {
          const defined = hd.definedCenters.includes(id);
          const cc = getCenter(id);
          return (
            <ExpandCard
              key={id}
              id={`center-${id}`}
              title={CENTER_NAMES[id]}
              subtitle={cc?.role}
              conceptKey="center"
              badge={defined ? "Defined" : "Open"}
              badgeTone={defined ? "gold" : "muted"}
            >
              {cc && <Body>{defined ? cc.defined : cc.open}</Body>}
              {cc && <Application>{defined ? cc.whenDefinedApp : cc.whenOpenApp}</Application>}
            </ExpandCard>
          );
        })}
      </div>

      {/* CHANNELS */}
      <SectionLabel>Your Channels ({hd.definedChannels.length})</SectionLabel>
      <div className="flex flex-col gap-2.5 mb-7">
        {hd.definedChannels.length === 0 && (
          <InfoBlock
            title="No defined channels"
            body="With no channels wired, you're a Reflector — a rare, sampling design that mirrors your community. Your consistency comes from the moon's cycle rather than fixed circuitry."
            conceptKey="channel"
          />
        )}
        {hd.definedChannels.map((ch) => {
          const cc = getChannel(ch.gates[0], ch.gates[1]);
          return (
            <InfoBlock
              key={`${ch.gates[0]}-${ch.gates[1]}`}
              title={`${ch.gates[0]}–${ch.gates[1]}${cc ? " · " + cc.name : ""}`}
              body={cc?.description ?? `Connects the ${CENTER_NAMES[ch.centers[0]]} and ${CENTER_NAMES[ch.centers[1]]}.`}
              conceptKey={hd.definedChannels.length ? undefined : "channel"}
            />
          );
        })}
      </div>

      {/* GATES */}
      <SectionLabel>Your Gates</SectionLabel>
      <div
        className="rounded-2xl px-4 py-4 mb-2"
        style={{ backgroundColor: "var(--background-card)", border: "1px solid var(--border-card)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] leading-relaxed" style={{ color: "var(--foreground-muted)" }}>
            {getHdConcept("personalityDesign")}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-4">
          <GateColumn title="Personality" hint="conscious" activations={hd.personality} />
          <GateColumn title="Design" hint="unconscious" activations={hd.design} />
        </div>
      </div>

      {/* VARIABLES */}
      <SectionLabel>Variables</SectionLabel>
      <div className="flex flex-col gap-2.5 mb-6">
        {hd.variables.map((v) => {
          const vc = getVariableContent(v.key);
          return (
            <InfoBlock
              key={v.key}
              title={`${vc?.name ?? v.label} · ${v.arrow === "left" ? "◀ Left" : "Right ▶"}`}
              body={vc?.description ?? ""}
              application={v.arrow === "left" ? vc?.leftMeaning : vc?.rightMeaning}
              conceptKey="variables"
            />
          );
        })}
      </div>

      <p className="text-[11px] text-center mt-2 mb-2" style={{ color: "var(--foreground-faint)" }}>
        Tap any card to open it · tap the ⓘ to learn what each piece means.
      </p>
    </main>
  );
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

// ── Sub-components ──────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[10px] tracking-[0.22em] uppercase font-semibold mb-3" style={{ color: "var(--brass)" }}>
      {children}
    </h2>
  );
}

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-2xl px-3.5 py-3"
      style={{ backgroundColor: "var(--background-card)", border: "1px solid var(--border-card)" }}
    >
      <div className="text-[9px] tracking-[0.16em] uppercase mb-0.5" style={{ color: "var(--foreground-faint)" }}>
        {label}
      </div>
      <div className="text-[14px] font-semibold leading-tight" style={{ color: "var(--foreground)" }}>
        {value}
      </div>
    </div>
  );
}

function InfoIconButton({ label, onClick, active }: { label: string; onClick: () => void; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] shrink-0 italic"
      style={
        active
          ? { backgroundColor: "var(--brass)", color: "#1a1420" }
          : { border: "0.5px solid rgba(201,169,97,0.45)", color: "var(--brass)" }
      }
    >
      i
    </button>
  );
}

function Tooltip({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl px-4 py-3 mb-5 text-[12px] leading-relaxed"
      style={{
        backgroundColor: "var(--plum)",
        border: "0.5px solid rgba(201,169,97,0.25)",
        color: "var(--foreground-secondary)",
      }}
    >
      {children}
    </div>
  );
}

function Body({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[13px] leading-relaxed mb-2" style={{ color: "var(--foreground-secondary)" }}>
      {children}
    </p>
  );
}

function Application({ children, label = "In daily life" }: { children: React.ReactNode; label?: string }) {
  return (
    <div className="rounded-xl px-3.5 py-3 mt-2" style={{ backgroundColor: "rgba(201,169,97,0.08)" }}>
      <div className="text-[9px] tracking-[0.18em] uppercase font-semibold mb-1" style={{ color: "var(--brass)" }}>
        {label}
      </div>
      <p className="text-[12.5px] leading-relaxed" style={{ color: "var(--foreground-secondary)" }}>
        {children}
      </p>
    </div>
  );
}

function MiniRow({
  label,
  value,
  note,
  conceptKey,
}: {
  label: string;
  value: string;
  note?: string;
  conceptKey?: string;
}) {
  const [open, setOpen] = useState(false);
  const concept = conceptKey ? getHdConcept(conceptKey) : "";
  return (
    <div className="border-t pt-2 mt-2" style={{ borderColor: "var(--border-card)" }}>
      <div className="flex items-center gap-2">
        <span className="text-[11px] tracking-[0.12em] uppercase" style={{ color: "var(--foreground-faint)" }}>
          {label}
        </span>
        <span className="text-[13px] font-semibold flex-1" style={{ color: "var(--foreground)" }}>
          {value}
        </span>
        {concept && <InfoIconButton label={`What is ${label}?`} onClick={() => setOpen((v) => !v)} active={open} />}
      </div>
      {open && concept && (
        <p className="text-[11.5px] leading-relaxed mt-1" style={{ color: "var(--foreground-muted)" }}>
          {concept}
        </p>
      )}
      {note && (
        <p className="text-[12px] leading-relaxed mt-1" style={{ color: "var(--foreground-secondary)" }}>
          {note}
        </p>
      )}
    </div>
  );
}

function ExpandCard({
  id,
  title,
  subtitle,
  badge,
  badgeTone = "gold",
  conceptKey,
  children,
}: {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeTone?: "gold" | "muted";
  conceptKey?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const concept = conceptKey ? getHdConcept(conceptKey) : "";
  return (
    <div
      className="rounded-2xl overflow-hidden mb-2.5"
      style={{ backgroundColor: "var(--background-card)", border: "1px solid var(--border-card)" }}
    >
      <div className="flex items-stretch">
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={`${id}-body`}
          className="flex-1 flex items-center gap-3 pl-4 py-3.5 text-left"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[15px] font-semibold" style={{ color: "var(--foreground)" }}>
                {title}
              </span>
              {badge && (
                <span
                  className="text-[9px] tracking-[0.08em] uppercase px-1.5 py-0.5 rounded-full font-semibold"
                  style={
                    badgeTone === "gold"
                      ? { backgroundColor: "rgba(201,169,97,0.18)", color: "var(--brass)" }
                      : { backgroundColor: "rgba(255,255,255,0.06)", color: "var(--foreground-faint)" }
                  }
                >
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <div className="text-[11px] mt-0.5" style={{ color: "var(--foreground-muted)" }}>
                {subtitle}
              </div>
            )}
          </div>
          <span
            className="text-[18px] shrink-0 pr-1 transition-transform"
            style={{ color: "var(--foreground-faint)", transform: open ? "rotate(45deg)" : "none" }}
            aria-hidden="true"
          >
            +
          </span>
        </button>
        {concept && (
          <button
            onClick={() => setInfoOpen((v) => !v)}
            aria-label={`What is ${title}?`}
            aria-pressed={infoOpen}
            className="px-3.5 flex items-center justify-center text-[12px] italic"
            style={{ color: infoOpen ? "var(--brass)" : "var(--foreground-faint)", borderLeft: "0.5px solid var(--border-card)" }}
          >
            ⓘ
          </button>
        )}
      </div>
      {infoOpen && concept && (
        <p className="px-4 pb-3 -mt-1 text-[12px] leading-relaxed" style={{ color: "var(--foreground-muted)" }}>
          {concept}
        </p>
      )}
      {open && (
        <div id={`${id}-body`} className="px-4 pb-4 pt-0">
          {children}
        </div>
      )}
    </div>
  );
}

function InfoBlock({
  title,
  body,
  application,
  conceptKey,
}: {
  title: string;
  body: string;
  application?: string;
  conceptKey?: string;
}) {
  const [infoOpen, setInfoOpen] = useState(false);
  const concept = conceptKey ? getHdConcept(conceptKey) : "";
  return (
    <div
      className="rounded-2xl px-4 py-3.5"
      style={{ backgroundColor: "var(--background-card)", border: "1px solid var(--border-card)" }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[13px] font-semibold flex-1" style={{ color: "var(--foreground)" }}>
          {title}
        </span>
        {concept && <InfoIconButton label={`What is this?`} onClick={() => setInfoOpen((v) => !v)} active={infoOpen} />}
      </div>
      {infoOpen && concept && (
        <p className="text-[12px] leading-relaxed mb-2" style={{ color: "var(--foreground-muted)" }}>
          {concept}
        </p>
      )}
      {body && (
        <p className="text-[12px] leading-relaxed" style={{ color: "var(--foreground-secondary)" }}>
          {body}
        </p>
      )}
      {application && (
        <p className="text-[12px] leading-relaxed mt-2" style={{ color: "var(--foreground-secondary)" }}>
          <span className="text-[9px] tracking-[0.16em] uppercase font-semibold mr-1.5" style={{ color: "var(--brass)" }}>
            The gift
          </span>
          {application}
        </p>
      )}
    </div>
  );
}

function GateColumn({ title, hint, activations }: { title: string; hint: string; activations: Activation[] }) {
  const [openBody, setOpenBody] = useState<string | null>(null);
  return (
    <div>
      <div className="mb-2">
        <span className="text-[11px] font-semibold" style={{ color: "var(--foreground)" }}>
          {title}
        </span>
        <span className="text-[9px] ml-1.5 tracking-[0.1em] uppercase" style={{ color: "var(--foreground-faint)" }}>
          {hint}
        </span>
      </div>
      <div className="flex flex-col">
        {activations.map((a) => {
          const gate = getGate(a.gate);
          const key = `${title}-${a.body}`;
          const open = openBody === key;
          return (
            <div key={key}>
              <button
                onClick={() => setOpenBody(open ? null : key)}
                className="w-full flex items-center gap-2 py-1 text-left"
              >
                <span className="text-[13px] w-4 text-center" style={{ color: "var(--foreground-faint)" }} aria-hidden="true">
                  {PLANET_GLYPH[a.body] ?? "•"}
                </span>
                <span className="text-[11px] flex-1 truncate" style={{ color: "var(--foreground-muted)" }}>
                  {a.body}
                </span>
                <span className="text-[12px] font-semibold tabular-nums" style={{ color: "var(--brass)" }}>
                  {a.gate}.{a.line}
                </span>
              </button>
              {open && gate && (
                <div className="pl-6 pb-2">
                  <p className="text-[11px] font-semibold" style={{ color: "var(--foreground)" }}>
                    {gate.name}
                  </p>
                  <p className="text-[11px] leading-relaxed mt-0.5" style={{ color: "var(--foreground-secondary)" }}>
                    {gate.description}
                  </p>
                  <p className="text-[11px] leading-relaxed mt-1" style={{ color: "var(--foreground-secondary)" }}>
                    <span style={{ color: "var(--brass)" }}>
                      Line {a.line} · {LINE_NAMES[a.line]}.{" "}
                    </span>
                    {gate.lines[a.line]}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
