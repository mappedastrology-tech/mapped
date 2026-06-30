"use client";

/**
 * Palmistry Tab — palm profiles.
 *
 * The landing lists people (You first, then friends you've added). Each person
 * has a Right and Left hand reading. First time you open a person with no
 * readings, it guides you through scanning both hands, then builds their page.
 * You can add a friend's palm, reopen any reading, re-scan, and share a reading
 * as an image.
 *
 * The photo is analyzed in-memory and discarded — never stored. Reading TEXT is
 * saved to local storage (instant) and synced to Supabase (across devices).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { authedFetch } from "@/lib/authedFetch";
import { sharePalmReadingAsImage } from "@/lib/shareCard";
import {
  SECTION_ORDER,
  type Hand,
  type PalmReading,
  type ReadingSection,
} from "@/lib/palmistry";

type View =
  | "people" | "person" | "addPerson"
  | "handoff" | "camera" | "preview" | "loading" | "unreadable";

interface Palm {
  hand: Hand;
  reading: PalmReading;
  savedAt: string;
}
interface Person {
  id: string;
  name: string;
  isSelf: boolean;
  hands: { right: Palm | null; left: Palm | null };
}

const SELF_ID = "self";
const storageKey = (uid: string | null) => `mapped:palmPeople:${uid || "anon"}`;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const handMeaning = (h: Hand) =>
  h === "right" ? "Active, present self" : "Inner, inherited self";
const newId = () =>
  (globalThis.crypto?.randomUUID?.() as string | undefined) || `p${Date.now()}`;

// Theme-aware accent per reading section (CSS vars adapt to dark/light).
const SECTION_COLOR: Record<string, string> = {
  handShape: "--brass",
  heartLine: "--terracotta",
  headLine: "--lavender",
  lifeLine: "--sage",
  fateLine: "--terracotta",
  mounts: "--lavender",
};
const colorFor = (key: string) => SECTION_COLOR[key] || "--brass";

// Theme-aware tints (color-mix keeps the accent but adapts to dark/light bg).
const tint = (cssVar: string, pct: number) => `color-mix(in srgb, var(${cssVar}) ${pct}%, transparent)`;
const handColor = (h: Hand) => (h === "right" ? "--terracotta" : "--lavender");
const PERSON_COLORS = ["--terracotta", "--sage", "--lavender", "--brass"];
const personColor = (i: number) => PERSON_COLORS[i % PERSON_COLORS.length];

// Top-insight derivation
const INSIGHT_KEYS = ["heartLine", "headLine", "lifeLine", "fateLine"];
const SHORT_LABEL: Record<string, string> = {
  heartLine: "Heart", headLine: "Mind", lifeLine: "Vitality", fateLine: "Path",
};
function firstSentence(t: string): string {
  const m = t.match(/^[^.!?]*[.!?]/);
  return (m ? m[0] : t).trim();
}

function orderedSections(r: PalmReading): ReadingSection[] {
  const byKey = new Map(r.sections.map((s) => [s.key, s]));
  const ordered = SECTION_ORDER.map(({ key }) => byKey.get(key)).filter(
    (s): s is ReadingSection => Boolean(s),
  );
  const extra = r.sections.filter((s) => !SECTION_ORDER.some((o) => o.key === s.key));
  return [...ordered, ...extra];
}

function ensureSelf(list: Person[], name: string): Person[] {
  const self = list.find((p) => p.isSelf);
  if (self) {
    if (name && (!self.name || self.name === "You")) self.name = name;
    return list;
  }
  return [{ id: SELF_ID, name: name || "You", isSelf: true, hands: { right: null, left: null } }, ...list];
}
function sortPeople(list: Person[]): Person[] {
  return [...list].sort((a, b) =>
    a.isSelf === b.isSelf ? a.name.localeCompare(b.name) : a.isSelf ? -1 : 1,
  );
}
function statusText(p: Person): string {
  const r = !!p.hands.right, l = !!p.hands.left;
  if (r && l) return "Both hands read";
  if (r) return "Right hand read";
  if (l) return "Left hand read";
  return "Not read yet";
}

export default function PalmistryTab() {
  const [view, setView] = useState<View>("person");
  const [people, setPeople] = useState<Person[]>([]);
  const [selectedPersonId, setSelectedPersonId] = useState<string>(SELF_ID);
  const [activeHand, setActiveHand] = useState<Hand>("right"); // dashboard hero hand
  const [openSections, setOpenSections] = useState<string[]>([]); // accordion: which sections are open
  const [focusKey, setFocusKey] = useState<string | null>(null); // section to scroll to

  // Scan session
  const [scanPersonId, setScanPersonId] = useState<string>(SELF_ID);
  const [scanHand, setScanHand] = useState<Hand>("right");
  const [guided, setGuided] = useState(false);
  const [newPersonName, setNewPersonName] = useState("");

  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [photo, setPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [unreadableReason, setUnreadableReason] = useState<string>("");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ─── Auth / name ─── */
  useEffect(() => {
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;
        setUserId(session.user.id);
        const metaName =
          (session.user.user_metadata?.full_name as string | undefined) ||
          (session.user.user_metadata?.name as string | undefined) ||
          "";
        if (metaName) setUserName(metaName);
        if (!metaName) {
          const { data } = await supabase
            .from("charts").select("name").eq("user_id", session.user.id)
            .order("created_at", { ascending: false }).limit(1).single();
          if (data?.name) setUserName(data.name);
        }
      } catch {
        /* name optional */
      }
    })();
  }, []);

  const persistPeople = useCallback(
    (list: Person[]) => {
      try {
        localStorage.setItem(storageKey(userId), JSON.stringify(list));
      } catch {
        /* storage unavailable */
      }
    },
    [userId],
  );

  /* ─── Load: local registry first, then merge cloud readings ─── */
  useEffect(() => {
    let local: Person[] = [];
    try {
      const raw = localStorage.getItem(storageKey(userId));
      if (raw) local = JSON.parse(raw) as Person[];
    } catch {
      /* ignore */
    }
    local = sortPeople(ensureSelf(local, userName));
    setPeople(local);

    if (!userId) return;
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("palm_readings")
          .select("person_id, person_name, is_self, hand, reading, updated_at")
          .eq("user_id", userId);
        if (error || !data || cancelled) return;
        const map = new Map<string, Person>();
        for (const p of local) map.set(p.id, { ...p, hands: { ...p.hands } });
        for (const row of data as {
          person_id: string; person_name: string; is_self: boolean;
          hand: string; reading: PalmReading; updated_at: string;
        }[]) {
          let person = map.get(row.person_id);
          if (!person) {
            person = { id: row.person_id, name: row.person_name, isSelf: row.is_self, hands: { right: null, left: null } };
            map.set(row.person_id, person);
          }
          person.name = row.person_name || person.name;
          person.isSelf = row.is_self ?? person.isSelf;
          if (row.hand === "right" || row.hand === "left") {
            person.hands[row.hand] = { hand: row.hand, reading: row.reading, savedAt: row.updated_at };
          }
        }
        const merged = sortPeople(ensureSelf(Array.from(map.values()), userName));
        if (cancelled) return;
        setPeople(merged);
        persistPeople(merged);
      } catch {
        /* offline — local stands */
      }
    })();
    return () => { cancelled = true; };
  }, [userId, userName, persistPeople]);

  const saveToCloud = useCallback(
    async (person: { id: string; name: string; isSelf: boolean }, h: Hand, reading: PalmReading) => {
      if (!userId) return;
      try {
        await supabase.from("palm_readings").upsert(
          {
            user_id: userId, person_id: person.id, person_name: person.name,
            is_self: person.isSelf, hand: h, reading, updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,person_id,hand" },
        );
      } catch {
        /* local holds it */
      }
    },
    [userId],
  );

  const deletePersonCloud = useCallback(
    async (personId: string) => {
      if (!userId) return;
      try {
        await supabase.from("palm_readings").delete().eq("user_id", userId).eq("person_id", personId);
      } catch {
        /* ignore */
      }
    },
    [userId],
  );

  /* ─── Camera ─── */
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async (mode: "user" | "environment") => {
    setCameraError(null);
    stopCamera();
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setCameraError("unsupported");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (err) {
      const n = err instanceof Error ? err.name : "";
      if (n === "NotAllowedError" || n === "SecurityError") setCameraError("denied");
      else if (n === "NotFoundError" || n === "OverconstrainedError") setCameraError("notfound");
      else setCameraError("unknown");
    }
  }, [stopCamera]);

  useEffect(() => {
    if (view !== "camera") stopCamera();
    return () => stopCamera();
  }, [view, stopCamera]);

  // When a quadrant opens a section, scroll it into view.
  useEffect(() => {
    if (!focusKey) return;
    const t = setTimeout(() => {
      document.querySelector(`[data-section="${focusKey}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 140);
    return () => clearTimeout(t);
  }, [focusKey]);

  const openCamera = useCallback(() => {
    setError(null);
    setView("camera");
    void startCamera(facingMode);
  }, [facingMode, startCamera]);

  const flipCamera = useCallback(() => {
    const next = facingMode === "user" ? "environment" : "user";
    setFacingMode(next);
    void startCamera(next);
  }, [facingMode, startCamera]);

  const downscaleToDataUrl = useCallback(
    (source: HTMLVideoElement | HTMLImageElement, sw: number, sh: number): string | null => {
      const maxDim = 1024;
      const scale = Math.min(1, maxDim / Math.max(sw, sh));
      const w = Math.round(sw * scale);
      const h = Math.round(sh * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      ctx.drawImage(source, 0, 0, w, h);
      return canvas.toDataURL("image/jpeg", 0.85);
    },
    [],
  );

  const capture = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const dataUrl = downscaleToDataUrl(video, video.videoWidth, video.videoHeight);
    if (!dataUrl) return;
    setPhoto(dataUrl);
    stopCamera();
    setView("preview");
  }, [downscaleToDataUrl, stopCamera]);

  const onFilePicked = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const dataUrl = downscaleToDataUrl(img, img.naturalWidth, img.naturalHeight);
          if (dataUrl) { setPhoto(dataUrl); setView("preview"); }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    },
    [downscaleToDataUrl],
  );

  /* ─── Submit ─── */
  const submit = useCallback(async () => {
    if (!photo) return;
    setError(null);
    setView("loading");
    const person = people.find((p) => p.id === scanPersonId);
    const personName = person?.name || (scanPersonId === SELF_ID ? userName || "You" : "Friend");
    try {
      const res = await authedFetch("/api/palmistry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: photo, hand: scanHand, userName: personName }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          res.status === 401
            ? "Please sign in again to get a reading."
            : data?.error || `Something went wrong (${res.status}). Please try again.`;
        if (data?.detail) console.error("[palmistry] server detail:", data.detail);
        setError(data?.detail ? `${msg} (${data.detail})` : msg);
        setView("preview");
        return;
      }
      if (data.ok === false) {
        setUnreadableReason(data.reason || "Couldn't read that one clearly.");
        setView("unreadable");
        return;
      }
      const newReading = data.reading as PalmReading;
      const leftDone = !!person?.hands.left;
      const meta = { id: scanPersonId, name: personName, isSelf: !!person?.isSelf };

      setPeople((prev) => {
        const next = prev.map((p) =>
          p.id === scanPersonId
            ? { ...p, hands: { ...p.hands, [scanHand]: { hand: scanHand, reading: newReading, savedAt: new Date().toISOString() } } }
            : p,
        );
        persistPeople(next);
        return next;
      });
      void saveToCloud(meta, scanHand, newReading);
      setPhoto(null);

      if (guided && scanHand === "right" && !leftDone) {
        setScanHand("left");
        setView("handoff");
      } else if (guided) {
        setGuided(false);
        setSelectedPersonId(scanPersonId);
        setActiveHand("right");
        setOpenSections([]);
        setView("person");
      } else {
        setSelectedPersonId(scanPersonId);
        setActiveHand(scanHand);
        setOpenSections([]);
        setFocusKey(null);
        setView("person");
      }
    } catch {
      setError("Network error. Please try again.");
      setView("preview");
    }
  }, [photo, scanHand, scanPersonId, people, userName, guided, persistPeople, saveToCloud]);

  /* ─── Navigation ─── */
  const goPeople = useCallback(() => {
    stopCamera();
    setPhoto(null); setError(null); setUnreadableReason(""); setGuided(false);
    setView("people");
  }, [stopCamera]);

  const openPerson = useCallback((id: string) => {
    const p = people.find((x) => x.id === id);
    setActiveHand(p && !p.hands.right && p.hands.left ? "left" : "right");
    setSelectedPersonId(id);
    setOpenSections([]);
    setFocusKey(null);
    setView("person");
  }, [people]);

  // Accordion: toggle a section open/closed in place.
  const toggleSection = useCallback((key: string) => {
    setOpenSections((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }, []);
  // Open a specific section (e.g. tapping a quadrant) and scroll to it.
  const openSectionKey = useCallback((key: string) => {
    setOpenSections((prev) => (prev.includes(key) ? prev : [...prev, key]));
    setFocusKey(key);
  }, []);
  const switchHand = useCallback((h: Hand) => {
    setActiveHand(h);
    setOpenSections([]);
    setFocusKey(null);
  }, []);

  const startGuidedFor = useCallback((p: Person) => {
    setScanPersonId(p.id); setGuided(true); setScanHand("right"); setError(null);
    setView("handoff");
  }, []);

  const startSingle = useCallback((p: Person, h: Hand) => {
    setScanPersonId(p.id); setGuided(false); setScanHand(h); setError(null);
    setView("handoff");
  }, []);

  const createPersonAndScan = useCallback(() => {
    const name = newPersonName.trim() || "Friend";
    const person: Person = { id: newId(), name, isSelf: false, hands: { right: null, left: null } };
    setPeople((prev) => {
      const next = sortPeople([...prev, person]);
      persistPeople(next);
      return next;
    });
    setNewPersonName("");
    startGuidedFor(person);
  }, [newPersonName, persistPeople, startGuidedFor]);

  const deletePerson = useCallback((p: Person) => {
    setPeople((prev) => {
      const next = prev.filter((x) => x.id !== p.id);
      persistPeople(next);
      return next;
    });
    void deletePersonCloud(p.id);
    setView("people");
  }, [persistPeople, deletePersonCloud]);

  const doShare = useCallback(async (person: Person, palm: Palm) => {
    setSharing(true);
    try {
      const highlights = orderedSections(palm.reading).slice(0, 3).map((s) => ({ title: s.title, text: s.meaning }));
      const who = person.isSelf ? (person.name && person.name !== "You" ? person.name : "My") : `${person.name}'s`;
      const fallback = `${who} ${palm.hand} hand palm reading — ${palm.reading.summary} (via Mapped)`;
      await sharePalmReadingAsImage(
        {
          personName: person.isSelf && (!person.name || person.name === "You") ? "Your palm" : person.name,
          handLabel: `${cap(palm.hand)} hand · ${handMeaning(palm.hand)}`,
          summary: palm.reading.summary,
          highlights,
        },
        fallback,
      );
    } finally {
      setSharing(false);
    }
  }, []);

  const selectedPerson = people.find((p) => p.id === selectedPersonId) || null;
  const scanPerson = people.find((p) => p.id === scanPersonId) || null;
  const scanName = scanPerson?.isSelf ? "your" : (scanPerson?.name ? `${scanPerson.name}’s` : "their");
  const stepLabel = guided ? (scanHand === "right" ? "Step 1 of 2" : "Step 2 of 2") : null;

  // Dashboard: the active hand drives the hero + top insights.
  const activePalm = selectedPerson ? selectedPerson.hands[activeHand] : null;
  const insights = activePalm
    ? orderedSections(activePalm.reading)
        .filter((s) => INSIGHT_KEYS.includes(s.key))
        .map((s) => ({
          key: s.key,
          label: SHORT_LABEL[s.key] || s.title,
          // Only true short adjective tags become chips; long phrases are dropped.
          adjectives: (s.keywords || [])
            .map((k) => k.trim())
            .filter((k) => k && k.length <= 16 && k.split(/\s+/).length <= 2)
            .slice(0, 3),
          headline: s.headline || firstSentence(s.meaning),
          hand: activeHand,
        }))
    : [];
  const personHasReading = !!selectedPerson && (!!selectedPerson.hands.right || !!selectedPerson.hands.left);

  /* ════════════════ RENDER ════════════════ */
  return (
    <div className="max-w-lg mx-auto px-5 py-6 pb-28">
      {/* ─── PEOPLE (friends list) ─── */}
      {view === "people" && (
        <div className="space-y-3">
          <button onClick={() => openPerson(SELF_ID)} className="flex items-center gap-1.5 text-secondary text-[14px] -ml-1 mb-2">
            <span className="text-lg leading-none">‹</span> Your palms
          </button>
          <h1 className="text-foreground text-[24px] font-semibold mb-1" style={{ fontFamily: "var(--font-display)" }}>Palms</h1>
          {people.map((p, i) => (
            <PersonCard key={p.id} person={p} accent={personColor(i)} onOpen={() => openPerson(p.id)} />
          ))}
          <button
            onClick={() => setView("addPerson")}
            className="w-full py-3.5 rounded-2xl border-2 border-dashed border-foreground/25 text-secondary text-[15px] font-medium hover:bg-foreground/5 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <span className="text-[18px] leading-none">+</span> Add a person&apos;s palm
          </button>
          <p className="text-muted text-[11px] text-center leading-relaxed pt-2">
            Photos are read in the moment and never saved — only the reading text.
          </p>
        </div>
      )}

      {/* ─── ADD PERSON ─── */}
      {view === "addPerson" && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-foreground/15 bg-card/60 p-5">
            <p className="text-foreground text-[15px] font-medium mb-1">Add someone&apos;s palm</p>
            <p className="text-secondary text-[13px] leading-relaxed">
              Read a friend or family member&apos;s palms and keep their reading here too.
            </p>
          </div>
          <div>
            <p className="text-secondary text-[13px] mb-2">Their name</p>
            <input
              type="text"
              value={newPersonName}
              onChange={(e) => setNewPersonName(e.target.value)}
              placeholder="e.g. Alex"
              maxLength={40}
              className="w-full px-4 py-3 rounded-xl border border-foreground/15 bg-card/60 text-foreground text-[14px] placeholder:text-muted focus:outline-none focus:border-terracotta/60"
            />
          </div>
          <div className="space-y-2">
            <button
              onClick={createPersonAndScan}
              className="w-full py-3.5 rounded-2xl bg-terracotta text-white font-medium text-[15px] active:scale-[0.98] transition-transform"
            >
              Continue — scan both hands
            </button>
            <button onClick={goPeople} className="w-full py-2 text-muted text-[13px]">Cancel</button>
          </div>
        </div>
      )}

      {/* ─── PERSON (dashboard) ─── */}
      {view === "person" && selectedPerson && (
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            {selectedPerson.isSelf ? (
              <h1 className="text-[21px] font-semibold text-foreground flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
                <PalmIcon />
                {selectedPerson.name && selectedPerson.name !== "You" ? selectedPerson.name : "Your palms"}
              </h1>
            ) : (
              <button onClick={() => setView("people")} className="flex items-center gap-1.5 text-foreground text-[21px] font-semibold" style={{ fontFamily: "var(--font-display)" }}>
                <span className="text-xl leading-none text-secondary">‹</span> {selectedPerson.name}
              </button>
            )}
            <button
              onClick={() => setView("people")}
              aria-label="All palms"
              className="w-9 h-9 rounded-full bg-foreground/8 flex items-center justify-center active:scale-95 transition-transform"
            >
              <PeopleIcon />
            </button>
          </div>

          {personHasReading ? (
            <>
              {/* Hand toggle */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-foreground/5">
                {(["left", "right"] as Hand[]).map((h) => {
                  const on = activeHand === h;
                  return (
                    <button
                      key={h}
                      onClick={() => switchHand(h)}
                      className="py-2 rounded-xl text-[14px] font-medium transition-colors"
                      style={on ? { background: tint(handColor(h), 22), color: `var(${handColor(h)})` } : { color: "var(--muted, #999)" }}
                    >
                      {cap(h)} hand
                    </button>
                  );
                })}
              </div>

              {/* Hero: the hand image */}
              <div
                className="rounded-3xl border p-4 pb-4"
                style={{ background: tint(handColor(activeHand), 10), borderColor: tint(handColor(activeHand), 26) }}
              >
                <p className="text-center text-[12px] mb-1" style={{ color: `var(${handColor(activeHand)})` }}>
                  {handMeaning(activeHand)}
                </p>
                {activePalm ? (
                  <PalmImage hand={activeHand} />
                ) : (
                  <div className="text-center">
                    <PalmImage hand={activeHand} dim />
                    <button
                      onClick={() => startSingle(selectedPerson, activeHand)}
                      className="mt-2 px-5 py-2.5 rounded-xl bg-terracotta text-white font-medium text-[14px]"
                    >
                      Scan {activeHand} hand
                    </button>
                  </div>
                )}
              </div>

              {/* Top insights — tapping opens that section in the accordion below */}
              {insights.length > 0 && (
                <div>
                  <p className="text-secondary text-[13px] font-medium mb-2">Top insights</p>
                  <div className="grid grid-cols-2 gap-2.5">
                    {insights.map((ins) => {
                      const v = colorFor(ins.key);
                      const c = `var(${v})`;
                      return (
                        <button
                          key={ins.key}
                          onClick={() => openSectionKey(ins.key)}
                          className="rounded-2xl p-3.5 text-left active:scale-[0.98] transition-transform"
                          style={{ background: tint(v, 12), border: `1px solid ${tint(v, 28)}` }}
                        >
                          <div className="w-8 h-8 rounded-full flex items-center justify-center mb-2" style={{ background: tint(v, 24) }}>
                            <SectionIcon k={ins.key} color={c} />
                          </div>
                          <p className="text-[12px] font-semibold mb-1.5" style={{ color: c }}>{ins.label}</p>
                          {ins.adjectives.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {ins.adjectives.map((adj) => (
                                <span key={adj} className="text-[11px] px-2 py-0.5 rounded-full capitalize" style={{ background: tint(v, 22), color: c }}>
                                  {adj}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[12px] font-medium" style={{ color: c }}>Tap to read ›</p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* The full reading, inline as an accordion (no page change) */}
              {activePalm && (
                <ReadingPanel
                  palm={activePalm}
                  openSections={openSections}
                  onToggle={toggleSection}
                  sharing={sharing}
                  onShare={() => doShare(selectedPerson, activePalm)}
                  onRescan={() => startSingle(selectedPerson, activeHand)}
                />
              )}

              {!selectedPerson.isSelf && (
                <button
                  onClick={() => deletePerson(selectedPerson)}
                  className="w-full py-3 rounded-2xl border border-foreground/15 text-muted text-[13px] hover:bg-foreground/5"
                >
                  Remove {selectedPerson.name}
                </button>
              )}
            </>
          ) : (
            /* No readings yet — guided intro */
            <div className="space-y-5">
              <div className="rounded-2xl border border-foreground/15 bg-card/60 p-5">
                <p className="text-foreground text-[15px] font-medium mb-2">
                  {selectedPerson.isSelf ? "Read your palms" : `Read ${selectedPerson.name}'s palms`}
                </p>
                <p className="text-secondary text-[14px] leading-relaxed">
                  We&apos;ll scan both hands once and build the reading. The{" "}
                  <span className="text-foreground">right hand</span> shows the active,
                  present self; the <span className="text-foreground">left</span> reveals
                  the inner, inherited self.
                </p>
              </div>
              <button
                onClick={() => startGuidedFor(selectedPerson)}
                className="w-full py-3.5 rounded-2xl bg-terracotta text-white font-medium text-[15px] active:scale-[0.98] transition-transform"
              >
                Scan both hands
              </button>
              {!selectedPerson.isSelf && (
                <button
                  onClick={() => deletePerson(selectedPerson)}
                  className="w-full py-3 rounded-2xl border border-foreground/15 text-muted text-[13px] hover:bg-foreground/5"
                >
                  Remove {selectedPerson.name}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── HANDOFF ─── */}
      {view === "handoff" && (
        <div className="space-y-5">
          {stepLabel && (
            <div className="flex items-center gap-2">
              <div className="h-1.5 flex-1 rounded-full bg-terracotta" />
              <div className={`h-1.5 flex-1 rounded-full ${scanHand === "left" ? "bg-terracotta" : "bg-foreground/15"}`} />
            </div>
          )}
          <div className="rounded-2xl border border-foreground/15 bg-card/60 p-6 text-center">
            <div className="flex justify-center mb-3"><HandGlyph hand={scanHand} size={44} /></div>
            {stepLabel && <p className="text-terracotta text-[11px] uppercase tracking-widest mb-1">{stepLabel}</p>}
            <p className="text-foreground text-[18px] font-semibold mb-1" style={{ fontFamily: "var(--font-display)" }}>
              {guided && scanHand === "right" ? `First, ${scanName} right hand`
                : guided && scanHand === "left" ? `Now ${scanName} left hand`
                : `Scan ${scanName} ${scanHand} hand`}
            </p>
            <p className="text-muted text-[13px] leading-relaxed">
              {handMeaning(scanHand)}. Hold it flat, palm to the camera, in good light.
            </p>
          </div>
          <div className="space-y-2">
            <button onClick={openCamera} className="w-full py-3.5 rounded-2xl bg-terracotta text-white font-medium text-[15px] active:scale-[0.98] transition-transform">Open camera</button>
            <button onClick={() => fileInputRef.current?.click()} className="w-full py-3 rounded-2xl border border-foreground/15 text-secondary text-[14px] hover:bg-foreground/5">Upload a photo instead</button>
            <button onClick={() => openPerson(scanPersonId)} className="w-full py-2 text-muted text-[13px]">Cancel</button>
          </div>
        </div>
      )}

      {/* ─── CAMERA ─── */}
      {view === "camera" && (
        <div className="space-y-4">
          {cameraError ? (
            <div className="rounded-2xl border border-foreground/15 bg-card/60 p-5 text-center">
              <p className="text-foreground text-[14px] font-medium mb-1">
                {cameraError === "denied" ? "Camera access blocked"
                  : cameraError === "notfound" ? "No camera found"
                  : cameraError === "unsupported" ? "Camera not available"
                  : "Couldn't start the camera"}
              </p>
              <p className="text-muted text-[12px] mb-4">
                {cameraError === "denied"
                  ? "Allow camera access in your browser settings, or upload a photo instead."
                  : "You can upload a photo of the palm instead."}
              </p>
              <button onClick={() => fileInputRef.current?.click()} className="w-full py-3 rounded-xl bg-terracotta text-white text-[14px] font-medium">Upload a photo</button>
            </div>
          ) : (
            <>
              <p className="text-secondary text-[13px] text-center capitalize">{scanHand} hand</p>
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-[3/4]">
                <video ref={videoRef} playsInline muted className="w-full h-full object-cover"
                  style={{ transform: facingMode === "user" ? "scaleX(-1)" : undefined }} />
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-3/5 h-3/4 border-2 border-white/50 rounded-[40%] border-dashed" />
                </div>
                <button onClick={flipCamera} aria-label="Flip camera"
                  className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/45 backdrop-blur-sm flex items-center justify-center active:scale-90 transition-transform">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M11 4H7a2 2 0 0 0-2 2v9" /><path d="m8 7-3-3-3 3" />
                    <path d="M13 20h4a2 2 0 0 0 2-2V9" /><path d="m16 17 3 3 3-3" />
                  </svg>
                </button>
                <p className="absolute bottom-3 inset-x-0 text-center text-white/90 text-[12px] px-4">Center the palm in the outline</p>
              </div>
              <button onClick={capture} className="w-full py-3.5 rounded-2xl bg-terracotta text-white font-medium text-[15px] active:scale-[0.98] transition-transform">Capture</button>
              <button onClick={() => setView("handoff")} className="w-full py-2 text-muted text-[13px]">Cancel</button>
            </>
          )}
        </div>
      )}

      {/* ─── PREVIEW ─── */}
      {view === "preview" && photo && (
        <div className="space-y-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo} alt="Palm" className="w-full rounded-2xl border border-foreground/15" />
          {error && <p className="text-[13px] text-center" style={{ color: "var(--terracotta)" }}>{error}</p>}
          <button onClick={submit} className="w-full py-3.5 rounded-2xl bg-terracotta text-white font-medium text-[15px] active:scale-[0.98] transition-transform">Read this palm</button>
          <button onClick={openCamera} className="w-full py-3 rounded-2xl border border-foreground/15 text-secondary text-[14px] hover:bg-foreground/5">Retake</button>
        </div>
      )}

      {/* ─── LOADING ─── */}
      {view === "loading" && (
        <div className="space-y-4">
          {photo ? (
            <div className="relative rounded-2xl overflow-hidden border border-foreground/15 aspect-[3/4] bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo} alt="Scanning palm" className="w-full h-full object-cover opacity-90" />
              <div className="absolute top-4 left-4 w-7 h-7 border-t-2 border-l-2 border-white/70 rounded-tl-md" />
              <div className="absolute top-4 right-4 w-7 h-7 border-t-2 border-r-2 border-white/70 rounded-tr-md" />
              <div className="absolute bottom-16 left-4 w-7 h-7 border-b-2 border-l-2 border-white/70 rounded-bl-md" />
              <div className="absolute bottom-16 right-4 w-7 h-7 border-b-2 border-r-2 border-white/70 rounded-br-md" />
              <div className="palm-scan-bar" />
              <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/70 to-transparent text-center">
                <p className="text-white text-[14px] font-medium">Reading the {scanHand} hand…</p>
                <p className="text-white/70 text-[12px] mt-0.5">Tracing the heart, head, life &amp; fate lines.</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-10 h-10 rounded-full border-2 border-terracotta/30 border-t-terracotta animate-spin mb-4" />
              <p className="text-secondary text-[14px]">Reading the lines…</p>
            </div>
          )}
          <style>{`
            .palm-scan-bar { position:absolute; left:0; right:0; height:2px;
              background: linear-gradient(90deg, transparent, var(--terracotta, #c96f4c), transparent);
              box-shadow: 0 0 14px 2px var(--terracotta, #c96f4c);
              animation: palmScan 2.2s ease-in-out infinite; }
            @keyframes palmScan { 0%{top:4%} 50%{top:94%} 100%{top:4%} }
            @media (prefers-reduced-motion: reduce) { .palm-scan-bar { animation:none; top:50%; } }
          `}</style>
        </div>
      )}

      {/* ─── UNREADABLE ─── */}
      {view === "unreadable" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-foreground/15 bg-card/60 p-5 text-center">
            <p className="text-foreground text-[15px] font-medium mb-1">Couldn&apos;t quite read that one</p>
            <p className="text-muted text-[13px]">{unreadableReason}</p>
          </div>
          <button onClick={openCamera} className="w-full py-3.5 rounded-2xl bg-terracotta text-white font-medium text-[15px]">Try again</button>
          <button onClick={() => openPerson(scanPersonId)} className="w-full py-3 rounded-2xl border border-foreground/15 text-secondary text-[14px] hover:bg-foreground/5">Back</button>
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={onFilePicked} className="hidden" />
    </div>
  );
}

/* ─── Inline reading: summary + rare markings + an accordion of sections ─── */
function ReadingPanel({
  palm, openSections, onToggle, sharing, onShare, onRescan,
}: {
  palm: Palm;
  openSections: string[];
  onToggle: (key: string) => void;
  sharing: boolean;
  onShare: () => void;
  onRescan: () => void;
}) {
  const markings = palm.reading.notableMarkings || [];
  return (
    <div className="space-y-2.5">
      {/* Summary */}
      <div className="rounded-2xl border border-brass/30 bg-brass/5 p-4">
        <p className="text-foreground/90 text-[14px] leading-relaxed">{palm.reading.summary}</p>
      </div>

      {/* Rare / notable markings */}
      {markings.length > 0 && (
        <div className="rounded-2xl p-4" style={{ background: tint("--brass", 14), border: `1px solid ${tint("--brass", 34)}` }}>
          <div className="flex items-center gap-2 mb-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brass)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z" />
            </svg>
            <p className="text-[12px] uppercase tracking-wide font-semibold" style={{ color: "var(--brass)" }}>Rare &amp; notable markings</p>
          </div>
          <div className="space-y-2">
            {markings.map((m, i) => (
              <div key={i}>
                <p className="text-foreground text-[14px] font-medium">{m.name}</p>
                <p className="text-secondary text-[12px] leading-relaxed">{m.meaning}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-secondary text-[13px] font-medium pt-1">The lines</p>

      {/* Accordion of sections — open/close in place */}
      {orderedSections(palm.reading).map((s) => {
        const v = colorFor(s.key);
        const c = `var(${v})`;
        const open = openSections.includes(s.key);
        return (
          <div
            key={s.key}
            data-section={s.key}
            className="rounded-2xl overflow-hidden"
            style={{ background: tint(v, 12), border: `1px solid ${tint(v, open ? 45 : 26)}` }}
          >
            <button
              onClick={() => onToggle(s.key)}
              className="w-full flex items-center gap-2.5 p-3.5 text-left"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: tint(v, 24) }}>
                <SectionIcon k={s.key} color={c} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] uppercase tracking-wide font-semibold" style={{ color: c }}>{s.title}</p>
                {s.headline && <p className="text-foreground text-[14px] font-medium leading-snug truncate">{s.headline}</p>}
              </div>
              <span className="flex-shrink-0 transition-transform" style={{ color: c, transform: open ? "rotate(90deg)" : undefined }}>›</span>
            </button>
            {open && (
              <div className="px-3.5 pb-4 -mt-0.5">
                {s.keywords && s.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    {s.keywords.map((kw) => (
                      <span key={kw} className="text-[11px] px-2.5 py-1 rounded-full" style={{ background: tint(v, 20), color: c }}>{kw}</span>
                    ))}
                  </div>
                )}
                <p className="text-secondary text-[13px] leading-relaxed">{s.meaning}</p>
                {s.observed && (
                  <p className="text-muted text-[12px] leading-relaxed mt-2 pt-2 border-t" style={{ borderColor: tint(v, 20) }}>
                    <span className="font-medium" style={{ color: c }}>In this hand: </span>{s.observed}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}

      {palm.reading.closing && (
        <div className="rounded-2xl border border-foreground/15 bg-card/60 p-4">
          <p className="text-secondary text-[13px] leading-relaxed italic">{palm.reading.closing}</p>
        </div>
      )}

      <p className="text-muted text-[11px] text-center leading-relaxed">
        Palmistry is a centuries-old art of reading the hand — offered here for reflection and insight.
      </p>

      <button
        onClick={onShare}
        disabled={sharing}
        className="w-full py-3.5 rounded-2xl bg-terracotta text-white font-medium text-[15px] disabled:opacity-60 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
      >
        <ShareIcon /> {sharing ? "Preparing…" : "Share reading"}
      </button>
      <button onClick={onRescan} className="w-full py-3 rounded-2xl border border-foreground/15 text-secondary text-[14px] hover:bg-foreground/5">Re-scan this hand</button>
    </div>
  );
}

/* ─── Person card (home) ─── */
function PersonCard({ person, accent, onOpen }: { person: Person; accent: string; onOpen: () => void }) {
  const title = person.isSelf
    ? person.name && person.name !== "You" ? person.name : "You"
    : person.name;
  return (
    <button
      onClick={onOpen}
      className="w-full flex items-center gap-3.5 rounded-2xl p-4 text-left active:scale-[0.99] transition-transform"
      style={{ background: tint(accent, 12), border: `1px solid ${tint(accent, 28)}` }}
    >
      <Avatar person={person} accent={accent} />
      <div className="flex-1 min-w-0">
        <p className="text-foreground text-[15px] font-medium truncate">
          {title} {person.isSelf && <span className="text-muted text-[11px] font-normal">· you</span>}
        </p>
        <p className="text-muted text-[12px]">{statusText(person)}</p>
      </div>
      <span className="text-lg flex-shrink-0 self-center" style={{ color: `var(${accent})` }}>›</span>
    </button>
  );
}

/* ─── Avatar: initial in a tinted circle ─── */
function Avatar({ person, accent = "--terracotta" }: { person: Person; accent?: string }) {
  const letter = (person.isSelf ? (person.name && person.name !== "You" ? person.name : "Y") : person.name || "?")
    .trim().charAt(0).toUpperCase();
  return (
    <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: tint(accent, 22) }}>
      <span className="text-[16px] font-semibold" style={{ color: `var(${accent})` }}>{letter}</span>
    </div>
  );
}

/* ─── Hand glyph (mirrors for the left hand) ─── */
function HandGlyph({ hand, size = 24 }: { hand: Hand; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="var(--brass)"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      style={{ transform: hand === "left" ? "scaleX(-1)" : undefined }}>
      <path d="M18 11V6a1.5 1.5 0 0 0-3 0M15 6V4.5a1.5 1.5 0 0 0-3 0V6M12 6V5a1.5 1.5 0 0 0-3 0v7" />
      <path d="M9 12V8.5a1.5 1.5 0 0 0-3 0V14c0 3.5 2.5 6.5 6 6.5s6-2.8 6-6.5v-3" />
    </svg>
  );
}

/* ─── Per-section icon for the colorful reading tiles ─── */
function SectionIcon({ k, color }: { k: string; color: string }) {
  const p = {
    width: 18, height: 18, viewBox: "0 0 24 24", fill: "none",
    stroke: color, strokeWidth: 1.7, strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const, "aria-hidden": true,
  };
  switch (k) {
    case "heartLine":
      return (<svg {...p}><path d="M19 14c1.5-1.5 3-3.2 3-5.5A3.5 3.5 0 0 0 12 6 3.5 3.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z" /></svg>);
    case "headLine":
      return (<svg {...p}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M8 8c2 2 6 2 8 0M8 16c2-2 6-2 8 0" /></svg>);
    case "lifeLine":
      return (<svg {...p}><path d="M12 22s-6-4-6-10a6 6 0 0 1 12 0c0 6-6 10-6 10Z" /><path d="M12 11v0" /></svg>);
    case "fateLine":
      return (<svg {...p}><circle cx="12" cy="12" r="9" /><path d="m15 9-4 1.5L9.5 15 13.5 13.5 15 9Z" /></svg>);
    case "mounts":
      return (<svg {...p}><path d="m3 18 5-8 4 5 3-4 6 7Z" /></svg>);
    default: // handShape
      return (<svg {...p}><path d="M18 11V6a1.5 1.5 0 0 0-3 0M15 6V4.5a1.5 1.5 0 0 0-3 0V6M12 6V5a1.5 1.5 0 0 0-3 0v7" /><path d="M9 12V8.5a1.5 1.5 0 0 0-3 0V14c0 3.5 2.5 6.5 6 6.5s6-2.8 6-6.5v-3" /></svg>);
  }
}

/* ─── Real hand image (mirrors for the left hand) ─── */
function PalmImage({ hand, dim = false }: { hand: Hand; dim?: boolean }) {
  return (
    <div className="relative mx-auto" style={{ maxWidth: 230, transform: hand === "left" ? "scaleX(-1)" : undefined }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/hand-cutout.png" alt="" draggable={false} className="w-full h-auto select-none" style={{ opacity: dim ? 0.4 : 1 }} />
    </div>
  );
}

/* ─── People icon ─── */
function PeopleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--foreground)"
      strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ opacity: 0.7 }}>
      <circle cx="9" cy="8" r="3" /><path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
      <path d="M16 5.5a3 3 0 0 1 0 5.5M17 20a5.5 5.5 0 0 0-3-4.9" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <path d="M16 6l-4-4-4 4" /><path d="M12 2v14" />
    </svg>
  );
}

function PalmIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--terracotta)"
      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 11V6a1.5 1.5 0 0 0-3 0M15 6V4.5a1.5 1.5 0 0 0-3 0V6M12 6V5a1.5 1.5 0 0 0-3 0v7" />
      <path d="M9 12V8.5a1.5 1.5 0 0 0-3 0V14c0 3.5 2.5 6.5 6 6.5s6-2.8 6-6.5v-3" />
    </svg>
  );
}
