"use client";

/**
 * Numerology — a personalized set of numbers computed from the user's full
 * birth name and birth date. Follows the Claude Design "Numerology — You"
 * layout: a script-name header + number strip, an animated orbit hero (Life
 * Path at the centre, the other core numbers orbiting), then three tabs —
 * Core, Cycles, and Name. Reached from the hamburger menu at /numerology.
 */

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  computeNumerology,
  pythagoreanValue,
  type NumerologyProfile,
  type NumerologySystem,
} from "@/lib/numerology";
import {
  getArchetype,
  getMeaning,
  KARMIC_DEBT,
  type PositionKey,
} from "@/lib/numerologyMeanings";
import { getConceptInfo } from "@/lib/numerologyConcepts";
import { fetchSetting, saveSetting } from "@/lib/syncedSettings";
import { getApplication } from "@/lib/numerologyApplications";
import NmOrbit from "@/components/numerology/NmOrbit";

const NAME_KEY = "mapped:numerology-fullname";
const SYSTEM_KEY = "mapped:numerology-system";

const NUM_WORD: Record<number, string> = {
  11: "Eleven", 22: "Twenty-Two", 33: "Thirty-Three",
  13: "Thirteen", 14: "Fourteen", 16: "Sixteen", 19: "Nineteen",
};
function numWord(n: number): string {
  return NUM_WORD[n] ?? String(n);
}
function formatNmDate(iso: string | null): string {
  if (!iso) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

type PageTab = "core" | "cycles" | "name";

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
  const [openCard, setOpenCard] = useState<string | null>("lifepath");
  const [pageTab, setPageTab] = useState<PageTab>("core");
  const [now] = useState(() => new Date());
  const [userId, setUserId] = useState<string | null>(null);

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
        setUserId(session.user.id);
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
        // Account-synced numerology name wins over the local value / metadata.
        const acctName = await fetchSetting(session.user.id, "numerology-fullname");
        if (acctName) {
          storedName = acctName;
          try { localStorage.setItem(NAME_KEY, acctName); } catch { /* ignore */ }
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
    if (userId) saveSetting(userId, "numerology-fullname", cleaned);
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

  const firstName = ((profileName || fullName).trim().split(/\s+/)[0]) || "You";
  const birthLine = formatNmDate(birthDate);
  const badgeFor = (n: { isMaster: boolean; karmicDebt: number | null }) =>
    n.isMaster ? "Master" : n.karmicDebt ? `Karmic ${n.karmicDebt}` : null;
  const keywordsOf = (n: number) => (getArchetype(n)?.keyword || "").split(/,\s*/).filter(Boolean);

  return (
    <main className="flex-1 flex flex-col px-5 pt-5 lg:pt-8 pb-8 max-w-lg lg:max-w-2xl mx-auto w-full">
      {/* Header */}
      <div className="text-center pb-1">
        <p className="text-[9px] tracking-[0.28em] uppercase font-bold" style={{ color: "var(--brass)" }}>
          Your numbers
        </p>
        <p className="mt-1.5" style={{ fontFamily: "var(--font-script)", fontSize: 50, lineHeight: 1, color: "var(--foreground)" }}>
          {firstName}
        </p>
        {birthLine && (
          <p className="text-[11.5px] mt-2" style={{ color: "var(--foreground-muted)" }}>{birthLine}</p>
        )}
      </div>

      {profile && (
        <div className="flex justify-center flex-wrap gap-[7px] mt-3.5 mb-1">
          {[`Life Path ${profile.lifePath.value}`, `Expression ${profile.expression.value}`, `Personal Year ${profile.personalYear}`].map((t, i) => (
            <span
              key={i}
              className="text-[9.5px] tracking-[0.14em] uppercase font-bold px-3 py-[5px] rounded-full"
              style={{ color: "var(--brass)", border: "0.5px solid var(--border-card)", background: "var(--background-card)" }}
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Name entry — needed to compute name numbers */}
      {!profile && (
        <div className="rounded-2xl px-4 py-4 mt-5" style={{ backgroundColor: "var(--background-card)", border: "1px solid var(--border-card)" }}>
          <p className="text-[12px] leading-relaxed mb-3" style={{ color: "var(--foreground-secondary)" }}>
            Your name numbers use your <strong style={{ color: "var(--foreground)" }}>full birth name — first, middle, and last</strong>, exactly as on your birth certificate. Add it to see your numbers.
          </p>
          <NameInput value={nameDraft} onChange={setNameDraft} onSave={saveName} label="See my numbers" />
        </div>
      )}

      {profile && (() => {
        const lp = profile.lifePath, ex = profile.expression, su = profile.soulUrge, pe = profile.personality;
        const lpArch = getArchetype(lp.value);

        const coreDefs: { id: string; kicker: string; value: number; badge: string | null; position: PositionKey; meta: string }[] = [
          { id: "lifepath", kicker: "Life Path", value: lp.value, badge: badgeFor(lp), position: "lifePath", meta: "Reduced from your full birth date" },
          { id: "expression", kicker: "Expression", value: ex.value, badge: badgeFor(ex), position: "expression", meta: "From every letter of your full name" },
          { id: "soul", kicker: "Soul Urge", value: su.value, badge: badgeFor(su), position: "soulUrge", meta: "From the vowels in your name" },
          { id: "personality", kicker: "Personality", value: pe.value, badge: badgeFor(pe), position: "personality", meta: "From the consonants in your name" },
          { id: "birthday", kicker: "Birthday", value: profile.birthday.value, badge: badgeFor(profile.birthday), position: "birthday", meta: "The day of the month you were born" },
        ];

        const callouts: { num: number; kicker: string; title: string; body: string }[] = [];
        coreDefs.forEach((d) => {
          if ([11, 22, 33].includes(d.value)) {
            callouts.push({ num: d.value, kicker: "Master Number", title: `${numWord(d.value)}, in your ${d.kicker}`, body: getArchetype(d.value)?.essence || "" });
          }
        });
        profile.karmicDebts.forEach((kd) => {
          const m = KARMIC_DEBT[kd.debt];
          if (m) callouts.push({ num: kd.debt, kicker: "Karmic Debt", title: `${numWord(kd.debt)}, in your ${kd.position}`, body: m.text });
        });

        // Name letters
        const V = new Set(["A", "E", "I", "O", "U"]);
        const words = fullName.toUpperCase().split(/\s+/).filter(Boolean).map((w) => {
          const letters = w.split("").filter((ch) => /[A-Z]/.test(ch)).map((ch) => ({ c: ch, n: pythagoreanValue(ch), vowel: V.has(ch) }));
          const sum = letters.reduce((s, l) => s + l.n, 0);
          return { word: w, letters, red: `sums to ${sum}` };
        });
        const sumSet = (pick: (l: { vowel: boolean }) => boolean) => words.flatMap((w) => w.letters).filter(pick).reduce((s, l) => s + l.n, 0);
        const nameResults: { id: string; num: number; title: string; from: string; math: string; position: PositionKey }[] = [
          { id: "r-expr", num: ex.value, title: "Expression", from: "All letters", math: `${sumSet(() => true)} → ${ex.value}`, position: "expression" },
          { id: "r-soul", num: su.value, title: "Soul Urge", from: "Vowels only", math: `${sumSet((l) => l.vowel)} → ${su.value}`, position: "soulUrge" },
          { id: "r-pers", num: pe.value, title: "Personality", from: "Consonants only", math: `${sumSet((l) => !l.vowel)} → ${pe.value}`, position: "personality" },
        ];

        const stages = profile.pinnacles.map((p, i) => {
          const ch = profile.challenges[i];
          return {
            id: `st-${p.index}`,
            age: p.endAge === null ? `Age ${p.startAge}+` : `${p.startAge} – ${p.endAge}`,
            pinnacle: String(p.value),
            challenge: ch ? String(ch.value) : "—",
            current: p.active,
            body: getMeaning("pinnacle", p.value),
            theme: ch ? getMeaning("challenge", ch.value) : "",
            lesson: getApplication("pinnacle", p.value),
          };
        });

        return (
          <>
            {/* Hero orbit */}
            <div className="mt-4">
              <NmOrbit
                lifePath={lp.value}
                title={lpArch?.title || `Life Path ${lp.value}`}
                subtitle={`Life Path ${lp.value} · ${(lpArch?.keyword || "").toLowerCase()}`}
                top={{ num: ex.value, label: "EXPRESSION", master: ex.isMaster }}
                right={{ num: su.value, label: "SOUL URGE", master: su.isMaster }}
                bottom={{ num: pe.value, label: "PERSONALITY", master: pe.isMaster }}
                left={{ num: profile.birthday.value, label: "BIRTHDAY" }}
              />
            </div>

            {/* Tabs */}
            <div className="sticky top-0 z-[5] py-2 mt-5 mb-4" style={{ background: "var(--background)" }}>
              <div className="flex gap-[5px] p-1 rounded-[13px]" style={{ background: "var(--background-card)" }}>
                {(["core", "cycles", "name"] as PageTab[]).map((t) => {
                  const active = pageTab === t;
                  return (
                    <button
                      key={t}
                      onClick={() => { setPageTab(t); setOpenCard(null); }}
                      className="flex-1 py-[11px] rounded-[10px] text-[10px] tracking-[0.1em] uppercase font-bold transition-colors"
                      style={{ background: active ? "var(--brass)" : "transparent", color: active ? "#1a1230" : "var(--foreground-muted)" }}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CORE TAB */}
            {pageTab === "core" && (
              <>
                <p className="mb-1" style={{ fontFamily: "var(--font-heading)", fontSize: 22, color: "var(--foreground)" }}>Your core numbers</p>
                <p className="text-[12.5px] leading-relaxed mb-4" style={{ color: "var(--foreground-muted)" }}>
                  Five numbers do most of the work in a chart — two from your birth date, three from the letters of your name. Tap any one to read it.
                </p>
                <div className="flex flex-col gap-2 mb-6">
                  {coreDefs.map((d) => (
                    <NmCoreCard
                      key={d.id}
                      num={d.value}
                      kicker={d.kicker}
                      title={getArchetype(d.value)?.title || ""}
                      meta={d.meta}
                      badge={d.badge}
                      def={getConceptInfo(d.position)}
                      body={getMeaning(d.position, d.value)}
                      best={getArchetype(d.value)?.strengths || ""}
                      growth={getArchetype(d.value)?.shadow || ""}
                      keywords={keywordsOf(d.value)}
                      open={openCard === d.id}
                      onToggle={() => setOpenCard(openCard === d.id ? null : d.id)}
                      tipOpen={openCard === `tip-${d.id}`}
                      onTip={() => setOpenCard(openCard === `tip-${d.id}` ? null : `tip-${d.id}`)}
                    />
                  ))}
                </div>

                {callouts.length > 0 && (
                  <>
                    <p className="mb-1" style={{ fontFamily: "var(--font-heading)", fontSize: 22, color: "var(--foreground)" }}>Debts &amp; master numbers</p>
                    <p className="text-[12.5px] leading-relaxed mb-3.5" style={{ color: "var(--foreground-muted)" }}>
                      Special numbers that surface as your figures reduce — each raises the stakes of the number it sits inside.
                    </p>
                    <div className="flex flex-col gap-[9px] mb-2">
                      {callouts.map((c, i) => <NmCallout key={i} num={c.num} kicker={c.kicker} title={c.title} body={c.body} />)}
                    </div>
                  </>
                )}
              </>
            )}

            {/* CYCLES TAB */}
            {pageTab === "cycles" && (
              <>
                <div className="rounded-[20px] p-5 mb-5" style={{ background: "linear-gradient(165deg, #4a2540, #15101c)", border: "0.5px solid rgba(201,169,97,0.16)" }}>
                  <div className="flex items-center gap-3.5">
                    <span
                      className="shrink-0 flex items-center justify-center"
                      style={{ width: 58, height: 58, borderRadius: "50%", fontFamily: "var(--font-heading)", fontSize: 30, color: "var(--brass)", background: "rgba(201,169,97,0.1)", border: "1px solid rgba(201,169,97,0.4)" }}
                    >
                      {profile.personalYear}
                    </span>
                    <span>
                      <span className="block text-[9px] tracking-[0.2em] uppercase font-bold" style={{ color: "var(--brass)" }}>Personal Year · {now.getFullYear()}</span>
                      <span className="block mt-0.5" style={{ fontFamily: "var(--font-heading)", fontSize: 20, color: "#f0e6d2" }}>{getArchetype(profile.personalYear)?.title || `Year ${profile.personalYear}`}</span>
                    </span>
                  </div>
                  <p className="text-[13px] mt-3.5" style={{ lineHeight: 1.7, color: "rgba(240,230,210,0.82)" }}>{getMeaning("personalYear", profile.personalYear)}</p>
                </div>

                <p className="mb-1" style={{ fontFamily: "var(--font-heading)", fontSize: 22, color: "var(--foreground)" }}>Pinnacles &amp; challenges</p>
                <p className="text-[12.5px] leading-relaxed mb-4" style={{ color: "var(--foreground-muted)" }}>
                  Your life divides into four long chapters, each ruled by a pinnacle — its opportunity — and shadowed by a challenge.
                </p>
                <div className="relative flex flex-col gap-2.5">
                  <div aria-hidden="true" className="absolute" style={{ left: 9, top: 16, bottom: 16, width: 1.5, background: "var(--border-card)" }} />
                  {stages.map((s) => (
                    <NmStage key={s.id} stage={s} open={openCard === s.id} onToggle={() => setOpenCard(openCard === s.id ? null : s.id)} />
                  ))}
                </div>
              </>
            )}

            {/* NAME TAB */}
            {pageTab === "name" && (
              <>
                <p className="mb-1" style={{ fontFamily: "var(--font-heading)", fontSize: 22, color: "var(--foreground)" }}>Your name in numbers</p>
                <p className="text-[12.5px] leading-relaxed mb-3.5" style={{ color: "var(--foreground-muted)" }}>
                  Each letter carries a number, 1 through 9. Add the vowels for your Soul Urge, the consonants for your Personality, and all of them for your Expression.
                </p>
                <div className="flex items-center justify-center gap-2 text-[11px] mb-4" style={{ color: "var(--foreground-faint)" }}>
                  <span>From: {fullName}</span>
                  <button onClick={() => { setNameDraft(fullName); setEditingName(true); }} className="underline" style={{ color: "var(--brass)" }}>edit</button>
                </div>
                {editingName && (
                  <div className="mb-4">
                    <NameInput value={nameDraft} onChange={setNameDraft} onSave={saveName} label="Save" />
                  </div>
                )}

                <div className="flex flex-col gap-4 mb-5">
                  {words.map((w, wi) => (
                    <div key={wi}>
                      <div className="flex flex-wrap gap-1.5 justify-center">
                        {w.letters.map((l, li) => (
                          <span
                            key={li}
                            className="flex flex-col items-center"
                            style={{ width: 38, padding: "7px 0 5px", borderRadius: 9, background: l.vowel ? "rgba(212,161,58,0.18)" : "var(--background-card)", border: `0.5px solid ${l.vowel ? "rgba(212,161,58,0.4)" : "var(--border-card)"}` }}
                          >
                            <span style={{ fontFamily: "var(--font-heading)", fontSize: 19, lineHeight: 1, color: "var(--foreground)" }}>{l.c}</span>
                            <span className="mt-1 text-[11px] font-bold" style={{ color: l.vowel ? "var(--brass)" : "var(--foreground-muted)" }}>{l.n}</span>
                          </span>
                        ))}
                      </div>
                      <p className="text-center text-[10.5px] mt-1.5" style={{ color: "var(--foreground-muted)" }}>{w.word} · {w.red}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-center gap-4 mb-5">
                  <span className="flex items-center gap-1.5 text-[10px]" style={{ color: "var(--foreground-secondary)" }}>
                    <span style={{ width: 11, height: 11, borderRadius: 3, background: "rgba(212,161,58,0.22)", border: "0.5px solid var(--brass)" }} />Vowel
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px]" style={{ color: "var(--foreground-secondary)" }}>
                    <span style={{ width: 11, height: 11, borderRadius: 3, background: "var(--background-card)", border: "0.5px solid var(--border-card)" }} />Consonant
                  </span>
                </div>

                <div className="flex flex-col gap-[9px]">
                  {nameResults.map((r) => (
                    <NmNameResult
                      key={r.id}
                      num={r.num}
                      title={r.title}
                      from={r.from}
                      math={r.math}
                      body={getMeaning(r.position, r.num)}
                      open={openCard === r.id}
                      onToggle={() => setOpenCard(openCard === r.id ? null : r.id)}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        );
      })()}
    </main>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function NameInput({ value, onChange, onSave, label }: { value: string; onChange: (v: string) => void; onSave: () => void; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") onSave(); }}
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

function NmCoreCard({
  num, kicker, title, meta, badge, def, body, best, growth, keywords, open, onToggle, tipOpen, onTip,
}: {
  num: number; kicker: string; title: string; meta: string; badge: string | null; def: string;
  body: string; best: string; growth: string; keywords: string[]; open: boolean; onToggle: () => void; tipOpen: boolean; onTip: () => void;
}) {
  return (
    <div className="relative rounded-[15px]" style={{ zIndex: tipOpen ? 50 : "auto", border: "0.5px solid var(--border-card)", background: "var(--background-card)" }}>
      <div className="flex items-center gap-[13px] px-4 py-[13px] cursor-pointer" onClick={onToggle}>
        <span
          className="shrink-0 flex items-center justify-center"
          style={{ width: 40, height: 40, borderRadius: "50%", fontFamily: "var(--font-heading)", fontSize: 20, color: "var(--brass)", background: "var(--background)", border: "1px solid var(--border-card)" }}
        >
          {num}
        </span>
        <span className="flex-1 min-w-0">
          <span className="flex items-center text-[8.5px] tracking-[0.18em] uppercase font-bold" style={{ color: "var(--brass)" }}>
            {kicker}
            <span
              role="button"
              aria-label="What is this?"
              onClick={(e) => { e.stopPropagation(); onTip(); }}
              className="ml-1.5 inline-flex items-center justify-center cursor-pointer"
              style={{ width: 15, height: 15, borderRadius: "50%", fontSize: 9, fontWeight: 700, letterSpacing: 0, textTransform: "none", color: "var(--foreground-muted)", background: "var(--background)", border: "0.5px solid var(--border-card)" }}
            >
              i
            </span>
          </span>
          <span className="block" style={{ fontFamily: "var(--font-heading)", fontSize: 16, color: "var(--foreground)", lineHeight: 1.2, marginTop: 1 }}>{title}</span>
        </span>
        {badge && (
          <span className="shrink-0 text-[8px] tracking-[0.08em] uppercase font-bold px-2 py-1 rounded-full" style={{ color: "var(--amber, #d4a13a)", background: "rgba(212,161,58,0.12)", border: "0.5px solid rgba(212,161,58,0.3)" }}>{badge}</span>
        )}
        <span className="shrink-0 text-[13px] transition-transform" style={{ color: "var(--brass)", transform: open ? "rotate(90deg)" : "none" }}>›</span>
      </div>
      {tipOpen && def && (
        <div className="px-4 pb-3 -mt-1">
          <p className="text-[11.5px] leading-relaxed rounded-[11px] px-3 py-2.5" style={{ color: "var(--foreground-secondary)", background: "var(--background)", border: "0.5px solid var(--border-card)" }}>{def}</p>
        </div>
      )}
      {open && (
        <div className="px-4 pb-[18px]">
          <div className="h-px mb-3.5" style={{ background: "var(--border-card)" }} />
          <p className="text-[10.5px] mb-2.5" style={{ color: "var(--foreground-faint)" }}>{meta}</p>
          <p className="text-[14px] leading-[1.7]" style={{ color: "var(--foreground)" }}>{body}</p>
          <div className="flex gap-3 mt-4">
            <div className="flex-1 min-w-0">
              <p className="text-[9px] tracking-[0.16em] uppercase font-bold mb-1.5" style={{ color: "var(--brass)" }}>At its best</p>
              <p className="text-[12px] leading-[1.55]" style={{ color: "var(--foreground-secondary)" }}>{best}</p>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] tracking-[0.16em] uppercase font-bold mb-1.5" style={{ color: "var(--amber, #d4a13a)" }}>Growth edge</p>
              <p className="text-[12px] leading-[1.55]" style={{ color: "var(--foreground-secondary)" }}>{growth}</p>
            </div>
          </div>
          {keywords.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {keywords.map((k, i) => (
                <span key={i} className="text-[10px] font-semibold px-[11px] py-[5px] rounded-full" style={{ color: "var(--foreground-secondary)", background: "var(--background)", border: "0.5px solid var(--border-card)" }}>{k}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NmCallout({ num, kicker, title, body }: { num: number; kicker: string; title: string; body: string }) {
  return (
    <div className="rounded-[15px] px-[17px] py-[15px]" style={{ border: "0.5px solid rgba(212,161,58,0.28)", background: "linear-gradient(165deg, rgba(212,161,58,0.10), var(--background-card))", borderLeft: "2.5px solid var(--amber, #d4a13a)" }}>
      <div className="flex items-center gap-2.5 mb-1.5">
        <span className="shrink-0 flex items-center justify-center" style={{ width: 34, height: 34, borderRadius: "50%", fontFamily: "var(--font-heading)", fontSize: 17, color: "var(--amber, #d4a13a)", background: "rgba(212,161,58,0.12)", border: "1px solid rgba(212,161,58,0.35)" }}>{num}</span>
        <span>
          <span className="block text-[8.5px] tracking-[0.16em] uppercase font-bold" style={{ color: "var(--amber, #d4a13a)" }}>{kicker}</span>
          <span className="block" style={{ fontFamily: "var(--font-heading)", fontSize: 16, color: "var(--foreground)", marginTop: 1 }}>{title}</span>
        </span>
      </div>
      <p className="text-[13px] leading-[1.65]" style={{ color: "var(--foreground-secondary)" }}>{body}</p>
    </div>
  );
}

function NmStage({
  stage, open, onToggle,
}: {
  stage: { age: string; pinnacle: string; challenge: string; current: boolean; body: string; theme: string; lesson: string };
  open: boolean; onToggle: () => void;
}) {
  return (
    <div className="relative z-[1] flex gap-3.5 items-start">
      <div className="flex justify-center pt-4" style={{ flex: "0 0 20px" }}>
        <span
          style={{
            width: stage.current ? 15 : 12,
            height: stage.current ? 15 : 12,
            borderRadius: "50%",
            background: stage.current ? "var(--amber, #d4a13a)" : "var(--background)",
            border: `1.5px solid ${stage.current ? "var(--amber, #d4a13a)" : "var(--brass)"}`,
            boxShadow: stage.current ? "0 0 0 4px rgba(212,161,58,0.16), 0 0 10px rgba(212,161,58,0.6)" : "none",
          }}
        />
      </div>
      <div
        className="flex-1 min-w-0 rounded-[15px] overflow-hidden"
        style={{ border: `0.5px solid ${stage.current ? "rgba(212,161,58,0.32)" : "var(--border-card)"}`, background: stage.current ? "linear-gradient(165deg, rgba(212,161,58,0.10), var(--background-card))" : "var(--background-card)" }}
      >
        <button onClick={onToggle} className="w-full text-left px-4 py-3.5" style={{ border: "none", background: "none", cursor: "pointer" }}>
          <div className="flex items-center gap-2.5 mb-[11px]">
            <span className="text-[9px] tracking-[0.18em] uppercase font-bold" style={{ color: stage.current ? "var(--amber, #d4a13a)" : "var(--foreground-faint)" }}>{stage.age}</span>
            {stage.current && <span className="text-[8px] tracking-[0.12em] uppercase font-bold" style={{ color: "var(--amber, #d4a13a)" }}>• Now</span>}
            <span className="ml-auto text-[13px] transition-transform" style={{ color: "var(--brass)", transform: open ? "rotate(90deg)" : "none" }}>›</span>
          </div>
          <div className="flex gap-5">
            <span className="flex items-baseline gap-1.5">
              <span style={{ fontFamily: "var(--font-heading)", fontSize: 26, color: "var(--brass)", lineHeight: 1 }}>{stage.pinnacle}</span>
              <span className="text-[9px] tracking-[0.1em] uppercase" style={{ color: "var(--foreground-muted)" }}>Pinnacle</span>
            </span>
            <span className="flex items-baseline gap-1.5">
              <span style={{ fontFamily: "var(--font-heading)", fontSize: 26, color: "var(--foreground-secondary)", lineHeight: 1 }}>{stage.challenge}</span>
              <span className="text-[9px] tracking-[0.1em] uppercase" style={{ color: "var(--foreground-muted)" }}>Challenge</span>
            </span>
          </div>
        </button>
        {open && (
          <div className="px-4 pb-4">
            <p className="text-[13px] leading-[1.65] mb-3.5" style={{ color: "var(--foreground-secondary)" }}>{stage.body}</p>
            {stage.theme && (
              <>
                <p className="text-[9px] tracking-[0.16em] uppercase font-bold mb-1" style={{ color: "var(--amber, #d4a13a)" }}>Watch out for</p>
                <p className="text-[12.5px] leading-[1.6] mb-3" style={{ color: "var(--foreground)" }}>{stage.theme}</p>
              </>
            )}
            {stage.lesson && (
              <>
                <p className="text-[9px] tracking-[0.16em] uppercase font-bold mb-1" style={{ color: "var(--brass)" }}>The lesson</p>
                <p className="text-[12.5px] leading-[1.6]" style={{ color: "var(--foreground)" }}>{stage.lesson}</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function NmNameResult({
  num, title, from, math, body, open, onToggle,
}: {
  num: number; title: string; from: string; math: string; body: string; open: boolean; onToggle: () => void;
}) {
  return (
    <div className="rounded-[14px] overflow-hidden" style={{ border: "0.5px solid var(--border-card)", background: "var(--background-card)" }}>
      <button onClick={onToggle} className="w-full flex items-center gap-[13px] px-4 py-[13px] text-left" style={{ border: "none", background: "none", cursor: "pointer" }}>
        <span className="shrink-0 flex items-center justify-center" style={{ width: 40, height: 40, borderRadius: "50%", fontFamily: "var(--font-heading)", fontSize: 20, color: "var(--brass)", background: "var(--background)", border: "1px solid var(--border-card)" }}>{num}</span>
        <span className="flex-1 min-w-0">
          <span className="block" style={{ fontFamily: "var(--font-heading)", fontSize: 16, color: "var(--foreground)", lineHeight: 1.15 }}>{title}</span>
          <span className="block text-[10.5px] mt-0.5" style={{ color: "var(--foreground-muted)" }}>{from}</span>
        </span>
        <span className="shrink-0 text-[11px]" style={{ fontFamily: "var(--font-heading)", color: "var(--brass)" }}>{math}</span>
        <span className="shrink-0 text-[13px] transition-transform" style={{ color: "var(--brass)", transform: open ? "rotate(90deg)" : "none" }}>›</span>
      </button>
      {open && (
        <div className="px-4 pb-4">
          <div className="h-px mb-3.5" style={{ background: "var(--border-card)" }} />
          <p className="text-[13px] leading-[1.7]" style={{ color: "var(--foreground)" }}>{body}</p>
        </div>
      )}
    </div>
  );
}
