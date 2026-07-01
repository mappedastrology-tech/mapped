"use client";

/**
 * Numerology — a personalized readout of the user's core numbers, cycles, and
 * karmic layers, computed from their full birth name + birth date. Supports both
 * the Pythagorean and Chaldean letter systems via a toggle. Every concept has an
 * info tooltip (what it is) and value-specific "in daily life" application copy.
 * Reachable from the hamburger menu at /numerology.
 */

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  computeNumerology,
  type NumerologyProfile,
  type NumerologySystem,
} from "@/lib/numerology";
import {
  getArchetype,
  getMeaning,
  masterLabel,
  KARMIC_DEBT,
  SYSTEM_NOTES,
} from "@/lib/numerologyMeanings";
import { getConceptInfo } from "@/lib/numerologyConcepts";
import { getApplication } from "@/lib/numerologyApplications";

const NAME_KEY = "mapped:numerology-fullname";
const SYSTEM_KEY = "mapped:numerology-system";

const ORDINALS = ["First", "Second", "Third", "Fourth"];

export default function NumerologyPageContent() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [birthDate, setBirthDate] = useState<string | null>(null);
  const [profileName, setProfileName] = useState("");
  const [fullName, setFullName] = useState("");
  const [nameConfirmed, setNameConfirmed] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [system, setSystem] = useState<NumerologySystem>("pythagorean");
  const [openCard, setOpenCard] = useState<string | null>(null);
  const [systemInfoOpen, setSystemInfoOpen] = useState(false);
  const [now] = useState(() => new Date());

  useEffect(() => {
    async function load() {
      let storedName = "";
      try {
        storedName = localStorage.getItem(NAME_KEY) || "";
        const sys = localStorage.getItem(SYSTEM_KEY);
        if (sys === "chaldean" || sys === "pythagorean") setSystem(sys);
      } catch {
        /* ignore */
      }

      const { data: { session } } = await supabase.auth.getSession();
      let metaName = "";
      let date: string | null = null;

      if (session?.user) {
        metaName =
          (session.user.user_metadata?.full_name as string | undefined) ||
          (session.user.user_metadata?.name as string | undefined) ||
          "";
        const { data } = await supabase
          .from("charts")
          .select("name, birth_date")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
        if (data) {
          date = data.birth_date;
          if (!metaName && data.name) metaName = data.name;
        }
      }

      if (!date) {
        try {
          const stored = sessionStorage.getItem("chartResult");
          if (stored) {
            const parsed = JSON.parse(stored);
            date = parsed.birthDate || null;
            if (!metaName && parsed.name) metaName = parsed.name;
          }
        } catch {
          /* ignore */
        }
      }

      setProfileName(metaName);
      setBirthDate(date);

      if (storedName) {
        setFullName(storedName);
        setNameConfirmed(true);
      } else {
        setFullName(metaName);
        setNameDraft(metaName);
      }
      setIsLoading(false);
    }
    load();
  }, []);

  const profile: NumerologyProfile | null = useMemo(() => {
    if (!birthDate || !fullName.trim()) return null;
    return computeNumerology(fullName, birthDate, { system, now });
  }, [birthDate, fullName, system, now]);

  function chooseSystem(next: NumerologySystem) {
    setSystem(next);
    try {
      localStorage.setItem(SYSTEM_KEY, next);
    } catch {
      /* ignore */
    }
  }

  function saveName() {
    const cleaned = nameDraft.trim();
    if (!cleaned) return;
    setFullName(cleaned);
    setNameConfirmed(true);
    setEditingName(false);
    try {
      localStorage.setItem(NAME_KEY, cleaned);
    } catch {
      /* ignore */
    }
  }

  // ── Gated states ────────────────────────────────────────────────────────────
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

  if (!birthDate) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <p className="text-lg mb-6" style={{ color: "var(--foreground-secondary)" }}>
          Numerology starts with your birth date — add yours to see your numbers.
        </p>
        <button
          onClick={() => router.push("/chart/new")}
          className="px-8 py-3 rounded-full font-semibold text-sm tracking-wide active:scale-[0.98] transition-all"
          style={{ backgroundColor: "var(--brass)", color: "#1a1420" }}
        >
          Add my birth date
        </button>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col px-5 py-6 max-w-lg mx-auto w-full">
      {/* Header */}
      <div className="text-center mb-5">
        <p className="text-[9px] tracking-[0.25em] uppercase font-medium mb-3" style={{ color: "var(--brass)" }}>
          your numbers
        </p>
        <h1
          className="text-[26px] tracking-[0.18em] uppercase mb-1.5"
          style={{ fontFamily: "var(--font-display)", fontWeight: 400, color: "var(--foreground)" }}
        >
          Numerology
        </h1>
        <p className="text-[13px]" style={{ fontFamily: "var(--font-body)", color: "var(--foreground-secondary)" }}>
          {fullName || profileName} · {birthDate}
        </p>
      </div>

      {/* System toggle */}
      <div className="flex items-center justify-center gap-2 mb-5">
        <div
          className="inline-flex rounded-full p-0.5"
          style={{ border: "0.5px solid rgba(201,169,97,0.3)" }}
          role="group"
          aria-label="Numerology system"
        >
          {(["pythagorean", "chaldean"] as NumerologySystem[]).map((s) => (
            <button
              key={s}
              onClick={() => chooseSystem(s)}
              aria-pressed={system === s}
              className="px-4 py-1.5 rounded-full text-[11px] tracking-[0.12em] uppercase font-medium transition-all"
              style={
                system === s
                  ? { backgroundColor: "var(--brass)", color: "#1a1420" }
                  : { color: "var(--foreground-secondary)" }
              }
            >
              {s === "pythagorean" ? "Pythagorean" : "Chaldean"}
            </button>
          ))}
        </div>
        <InfoIconButton label="About the two systems" onClick={() => setSystemInfoOpen((v) => !v)} active={systemInfoOpen} />
      </div>
      {systemInfoOpen && <Tooltip>{SYSTEM_NOTES.pythagoreanVsChaldean}</Tooltip>}

      {/* Name confirmation */}
      {!nameConfirmed && !editingName && (
        <div
          className="rounded-2xl px-4 py-4 mb-5"
          style={{ backgroundColor: "var(--background-card)", border: "1px solid var(--border-card)" }}
        >
          <p className="text-[12px] leading-relaxed mb-3" style={{ color: "var(--foreground-secondary)" }}>
            Your name numbers use your <strong style={{ color: "var(--foreground)" }}>full birth name — first, middle,
            and last</strong>, exactly as it appears on your birth certificate. Leaving out a middle name will change
            your Expression, Soul Urge, and Personality numbers, so include it.
          </p>
          <NameInput value={nameDraft} onChange={setNameDraft} onSave={saveName} label="Confirm" />
        </div>
      )}

      {editingName && (
        <div
          className="rounded-2xl px-4 py-4 mb-5"
          style={{ backgroundColor: "var(--background-card)", border: "1px solid var(--border-card)" }}
        >
          <p className="text-[12px] leading-relaxed mb-3" style={{ color: "var(--foreground-secondary)" }}>
            Enter your <strong style={{ color: "var(--foreground)" }}>full birth name</strong> — first, middle, and
            last. Spelling and middle names both affect the result.
          </p>
          <NameInput value={nameDraft} onChange={setNameDraft} onSave={saveName} label="Save" />
        </div>
      )}

      {nameConfirmed && !editingName && (() => {
        const parts = fullName.trim().split(/\s+/).filter(Boolean);
        return (
          <div className="mb-5">
            <div className="flex items-center justify-center gap-2 text-[11px]" style={{ color: "var(--foreground-faint)" }}>
              <span>Name numbers from: {fullName}</span>
              <button
                onClick={() => {
                  setNameDraft(fullName);
                  setEditingName(true);
                }}
                className="underline"
                style={{ color: "var(--brass)" }}
              >
                edit
              </button>
            </div>
            {parts.length < 3 && (
              <p className="text-[11px] text-center mt-1.5 leading-relaxed" style={{ color: "var(--brass)" }}>
                {parts.length < 2
                  ? "Add your last name for accurate name numbers."
                  : "Looks like no middle name — add it if you have one, or these numbers won't match other calculators."}
              </p>
            )}
          </div>
        );
      })()}

      {profile && (
        <>
          {/* Core numbers */}
          <SectionLabel>Core numbers</SectionLabel>
          <div className="flex flex-col gap-2.5 mb-7">
            {[
              { key: "lifePath", label: "Life Path", value: profile.lifePath.value, master: profile.lifePath.isMaster, karmic: profile.lifePath.karmicDebt, position: "lifePath" as const, sub: "From your birth date — your central journey" },
              { key: "expression", label: "Expression", value: profile.expression.value, master: profile.expression.isMaster, karmic: profile.expression.karmicDebt, position: "expression" as const, sub: "From your full name — your talents & purpose" },
              { key: "soulUrge", label: "Soul Urge", value: profile.soulUrge.value, master: profile.soulUrge.isMaster, karmic: profile.soulUrge.karmicDebt, position: "soulUrge" as const, sub: "The vowels — what your heart wants" },
              { key: "personality", label: "Personality", value: profile.personality.value, master: profile.personality.isMaster, karmic: profile.personality.karmicDebt, position: "personality" as const, sub: "The consonants — how you come across" },
              { key: "birthday", label: "Birthday", value: profile.birthday.value, master: profile.birthday.isMaster, karmic: profile.birthday.karmicDebt, position: "birthday" as const, sub: `Day ${profile.birthday.day} — a specific gift` },
              { key: "maturity", label: "Maturity", value: profile.maturity.value, master: profile.maturity.isMaster, karmic: profile.maturity.karmicDebt, position: "maturity" as const, sub: "Ripens in the second half of life" },
            ].map((c) => (
              <NumberCard
                key={c.key}
                label={c.label}
                value={c.value}
                isMaster={c.master}
                karmic={c.karmic}
                sub={c.sub}
                conceptKey={c.position}
                meaning={getMeaning(c.position, c.value)}
                application={getApplication(c.position, c.value)}
                open={openCard === c.key}
                onToggle={() => setOpenCard(openCard === c.key ? null : c.key)}
              />
            ))}
          </div>

          {/* Live cycles */}
          <SectionLabel>Where you are now</SectionLabel>
          <div className="grid grid-cols-3 gap-2.5 mb-3">
            {[
              { label: "Year", value: profile.personalYear },
              { label: "Month", value: profile.personalMonth },
              { label: "Day", value: profile.personalDay },
            ].map((t) => (
              <div
                key={t.label}
                className="rounded-2xl px-3 py-4 text-center"
                style={{ backgroundColor: "var(--background-card)", border: "1px solid var(--border-card)" }}
              >
                <div className="text-[32px] leading-none mb-1" style={{ fontFamily: "var(--font-display)", color: "var(--brass)" }}>
                  {t.value}
                </div>
                <div className="text-[9px] tracking-[0.1em] uppercase" style={{ color: "var(--foreground-faint)" }}>
                  Personal {t.label}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2.5 mb-7">
            <CycleBlock
              title={`Today — Personal Day ${profile.personalDay}`}
              conceptKey="personalDay"
              application={getApplication("personalDay", profile.personalDay)}
              highlight
            />
            <CycleBlock
              title={`This month — Personal Month ${profile.personalMonth}`}
              conceptKey="personalMonth"
              application={getApplication("personalMonth", profile.personalMonth)}
            />
            <CycleBlock
              title={`This year — Personal Year ${profile.personalYear}`}
              conceptKey="personalYear"
              meaning={getMeaning("personalYear", profile.personalYear)}
              application={getApplication("personalYear", profile.personalYear)}
            />
          </div>

          {/* Pinnacles */}
          <SectionLabel>Pinnacles — your life chapters</SectionLabel>
          <div className="flex flex-col gap-2.5 mb-7">
            {profile.pinnacles.map((p, i) => (
              <NumberCard
                key={`pin-${p.index}`}
                label={`${ORDINALS[i]} Pinnacle`}
                value={p.value}
                isMaster={p.isMaster}
                karmic={null}
                sub={
                  p.endAge === null
                    ? `Age ${p.startAge}+${p.active ? " · happening now" : ""}`
                    : `Ages ${p.startAge}–${p.endAge}${p.active ? " · happening now" : ""}`
                }
                highlight={p.active}
                conceptKey="pinnacle"
                meaning={getMeaning("pinnacle", p.value)}
                application={getApplication("pinnacle", p.value)}
                open={openCard === `pin-${p.index}`}
                onToggle={() => setOpenCard(openCard === `pin-${p.index}` ? null : `pin-${p.index}`)}
              />
            ))}
          </div>

          {/* Challenges */}
          <SectionLabel>Challenges — your growth edges</SectionLabel>
          <div className="flex flex-col gap-2.5 mb-7">
            {profile.challenges.map((c) => (
              <NumberCard
                key={`ch-${c.index}`}
                label={c.label}
                value={c.value}
                isMaster={false}
                karmic={null}
                sub="A recurring lesson to work through"
                conceptKey="challenge"
                meaning={getMeaning("challenge", c.value)}
                application={getApplication("challenge", c.value)}
                open={openCard === `ch-${c.index}`}
                onToggle={() => setOpenCard(openCard === `ch-${c.index}` ? null : `ch-${c.index}`)}
              />
            ))}
          </div>

          {/* Karmic & hidden layers */}
          <SectionLabel>Karmic & hidden layers</SectionLabel>
          <div className="flex flex-col gap-2.5 mb-4">
            {profile.karmicDebts.length > 0 &&
              profile.karmicDebts.map((kd) => {
                const m = KARMIC_DEBT[kd.debt];
                if (!m) return null;
                return (
                  <InfoBlock
                    key={`kd-${kd.position}`}
                    title={`${m.title} · ${kd.position}`}
                    body={m.text}
                    application={getApplication("karmicDebt", kd.debt)}
                    conceptKey="karmicDebt"
                    tone="debt"
                  />
                );
              })}

            {profile.karmicLessons.length > 0 ? (
              profile.karmicLessons.map((d) => (
                <InfoBlock
                  key={`kl-${d}`}
                  title={`Karmic Lesson ${d}`}
                  body={getMeaning("karmicLesson", d)}
                  application={getApplication("karmicLesson", d)}
                  conceptKey="karmicLesson"
                />
              ))
            ) : (
              <InfoBlock
                title="No karmic lessons"
                body="Every number from 1 to 9 appears in your name — you arrive with a full set of tools, none conspicuously missing."
                conceptKey="karmicLesson"
              />
            )}

            {profile.hiddenPassion.map((d) => (
              <InfoBlock
                key={`hp-${d}`}
                title={`Hidden Passion ${d}`}
                body={getMeaning("hiddenPassion", d)}
                application={getApplication("hiddenPassion", d)}
                conceptKey="hiddenPassion"
              />
            ))}

            <InfoBlock
              title={`Balance Number ${profile.balance}`}
              body={getMeaning("balance", profile.balance)}
              application={getApplication("balance", profile.balance)}
              conceptKey="balance"
            />
            <InfoBlock
              title={`Subconscious Self ${profile.subconsciousSelf}`}
              body={getMeaning("subconsciousSelf", profile.subconsciousSelf)}
              application={getApplication("subconsciousSelf", profile.subconsciousSelf)}
              conceptKey="subconsciousSelf"
            />
            <InfoBlock
              title={`Bridge · Life Path & Expression (${profile.bridges.lifePathExpression})`}
              body={getMeaning("bridge", profile.bridges.lifePathExpression)}
              application={getApplication("bridge", profile.bridges.lifePathExpression)}
              conceptKey="bridge"
            />
            <InfoBlock
              title={`Bridge · Soul Urge & Personality (${profile.bridges.soulUrgePersonality})`}
              body={getMeaning("bridge", profile.bridges.soulUrgePersonality)}
              application={getApplication("bridge", profile.bridges.soulUrgePersonality)}
              conceptKey="bridge"
            />
          </div>

          <p className="text-[11px] text-center mt-2 mb-2" style={{ color: "var(--foreground-faint)" }}>
            Tap any number to read more · tap the ⓘ to learn what each one means.
          </p>
        </>
      )}
    </main>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[10px] tracking-[0.22em] uppercase font-semibold mb-3" style={{ color: "var(--brass)" }}>
      {children}
    </h2>
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

function ApplicationBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl px-3.5 py-3 mt-3" style={{ backgroundColor: "rgba(201,169,97,0.08)" }}>
      <div className="text-[9px] tracking-[0.18em] uppercase font-semibold mb-1" style={{ color: "var(--brass)" }}>
        In daily life
      </div>
      <p className="text-[12.5px] leading-relaxed" style={{ color: "var(--foreground-secondary)" }}>
        {children}
      </p>
    </div>
  );
}

function NameInput({
  value,
  onChange,
  onSave,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  onSave: () => void;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSave();
        }}
        placeholder="First Middle Last"
        className="flex-1 px-3 py-2 rounded-lg text-[14px] outline-none"
        style={{ backgroundColor: "var(--surface)", border: "0.5px solid var(--border)", color: "var(--foreground)" }}
      />
      <button
        onClick={onSave}
        className="px-4 py-2 rounded-lg text-[12px] font-semibold active:scale-[0.98] transition-all"
        style={{ backgroundColor: "var(--brass)", color: "#1a1420" }}
      >
        {label}
      </button>
    </div>
  );
}

function NumberCard({
  label,
  value,
  isMaster,
  karmic,
  sub,
  conceptKey,
  meaning,
  application,
  open,
  onToggle,
  highlight,
}: {
  label: string;
  value: number;
  isMaster: boolean;
  karmic: number | null;
  sub: string;
  conceptKey: string;
  meaning: string;
  application: string;
  open: boolean;
  onToggle: () => void;
  highlight?: boolean;
}) {
  const [infoOpen, setInfoOpen] = useState(false);
  const archetype = getArchetype(value);
  const conceptInfo = getConceptInfo(conceptKey);
  return (
    <div
      className="rounded-2xl overflow-hidden transition-all"
      style={{
        backgroundColor: "var(--background-card)",
        border: highlight ? "1px solid var(--brass)" : "1px solid var(--border-card)",
      }}
    >
      <div className="flex items-stretch">
        <button onClick={onToggle} aria-expanded={open} className="flex-1 flex items-center gap-4 pl-4 py-3.5 text-left">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-[24px]"
            style={{ backgroundColor: "rgba(201,169,97,0.12)", fontFamily: "var(--font-display)", color: "var(--brass)" }}
          >
            {value}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[14px] font-semibold" style={{ color: "var(--foreground)" }}>
                {label}
              </span>
              <span className="text-[12px]" style={{ color: "var(--foreground-faint)" }}>
                {masterLabel(value)}
              </span>
              {isMaster && <Tag>master</Tag>}
              {karmic != null && <Tag tone="debt">karmic {karmic}</Tag>}
            </div>
            <div className="text-[11px] mt-0.5" style={{ color: "var(--foreground-muted)" }}>
              {sub}
            </div>
          </div>
          <span
            className="text-[18px] shrink-0 pr-1 transition-transform"
            style={{ color: "var(--foreground-faint)", transform: open ? "rotate(45deg)" : "none" }}
            aria-hidden="true"
          >
            +
          </span>
        </button>
        <button
          onClick={() => setInfoOpen((v) => !v)}
          aria-label={`What is ${label}?`}
          aria-pressed={infoOpen}
          className="px-3.5 flex items-center justify-center text-[12px] italic"
          style={{ color: infoOpen ? "var(--brass)" : "var(--foreground-faint)", borderLeft: "0.5px solid var(--border-card)" }}
        >
          ⓘ
        </button>
      </div>

      {infoOpen && conceptInfo && (
        <p className="px-4 pb-3 -mt-1 text-[12px] leading-relaxed" style={{ color: "var(--foreground-muted)" }}>
          {conceptInfo}
        </p>
      )}

      {open && (
        <div className="px-4 pb-4 pt-0">
          {archetype && (
            <p className="text-[12px] mb-2" style={{ color: "var(--brass)" }}>
              {archetype.title} · {archetype.keyword}
            </p>
          )}
          {meaning && (
            <p className="text-[13px] leading-relaxed mb-2" style={{ color: "var(--foreground-secondary)" }}>
              {meaning}
            </p>
          )}
          {archetype && (
            <div className="flex flex-col gap-1.5 text-[12px]">
              <div style={{ color: "var(--foreground-secondary)" }}>
                <span className="font-semibold" style={{ color: "var(--foreground)" }}>
                  Strengths.{" "}
                </span>
                {archetype.strengths}
              </div>
              <div style={{ color: "var(--foreground-secondary)" }}>
                <span className="font-semibold" style={{ color: "var(--foreground)" }}>
                  Shadow.{" "}
                </span>
                {archetype.shadow}
              </div>
            </div>
          )}
          {application && <ApplicationBlock>{application}</ApplicationBlock>}
        </div>
      )}
    </div>
  );
}

function CycleBlock({
  title,
  conceptKey,
  meaning,
  application,
  highlight,
}: {
  title: string;
  conceptKey: string;
  meaning?: string;
  application: string;
  highlight?: boolean;
}) {
  const [infoOpen, setInfoOpen] = useState(false);
  const conceptInfo = getConceptInfo(conceptKey);
  return (
    <div
      className="rounded-2xl px-4 py-3.5"
      style={{
        backgroundColor: "var(--background-card)",
        border: highlight ? "1px solid var(--brass)" : "1px solid var(--border-card)",
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[13px] font-semibold flex-1" style={{ color: "var(--foreground)" }}>
          {title}
        </span>
        <InfoIconButton label={`What is a ${conceptKey} number?`} onClick={() => setInfoOpen((v) => !v)} active={infoOpen} />
      </div>
      {infoOpen && conceptInfo && (
        <p className="text-[12px] leading-relaxed mb-2" style={{ color: "var(--foreground-muted)" }}>
          {conceptInfo}
        </p>
      )}
      {meaning && (
        <p className="text-[12.5px] leading-relaxed mb-1" style={{ color: "var(--foreground-secondary)" }}>
          {meaning}
        </p>
      )}
      <p className="text-[12.5px] leading-relaxed" style={{ color: "var(--foreground-secondary)" }}>
        {application}
      </p>
    </div>
  );
}

function InfoBlock({
  title,
  body,
  application,
  conceptKey,
  tone,
}: {
  title: string;
  body: string;
  application?: string;
  conceptKey?: string;
  tone?: "debt";
}) {
  const [infoOpen, setInfoOpen] = useState(false);
  const conceptInfo = conceptKey ? getConceptInfo(conceptKey) : "";
  return (
    <div
      className="rounded-2xl px-4 py-3.5"
      style={{
        backgroundColor: "var(--background-card)",
        border: tone === "debt" ? "1px solid rgba(201,169,97,0.4)" : "1px solid var(--border-card)",
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[13px] font-semibold flex-1" style={{ color: "var(--foreground)" }}>
          {title}
        </span>
        {conceptInfo && (
          <InfoIconButton label={`What is this?`} onClick={() => setInfoOpen((v) => !v)} active={infoOpen} />
        )}
      </div>
      {infoOpen && conceptInfo && (
        <p className="text-[12px] leading-relaxed mb-2" style={{ color: "var(--foreground-muted)" }}>
          {conceptInfo}
        </p>
      )}
      <p className="text-[12px] leading-relaxed" style={{ color: "var(--foreground-secondary)" }}>
        {body}
      </p>
      {application && (
        <p className="text-[12px] leading-relaxed mt-2" style={{ color: "var(--foreground-secondary)" }}>
          <span className="text-[9px] tracking-[0.16em] uppercase font-semibold mr-1.5" style={{ color: "var(--brass)" }}>
            Try this
          </span>
          {application}
        </p>
      )}
    </div>
  );
}

function Tag({ children, tone }: { children: React.ReactNode; tone?: "debt" }) {
  return (
    <span
      className="text-[9px] tracking-[0.08em] uppercase px-1.5 py-0.5 rounded-full font-semibold"
      style={
        tone === "debt"
          ? { backgroundColor: "rgba(122,48,40,0.25)", color: "var(--brass-light)" }
          : { backgroundColor: "rgba(201,169,97,0.18)", color: "var(--brass)" }
      }
    >
      {children}
    </span>
  );
}
