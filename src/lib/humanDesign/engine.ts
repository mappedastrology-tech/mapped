/**
 * Human Design calculation engine.
 *
 * Turns birth data (date, local time, lat/long) into a full BodyGraph:
 * Personality (birth moment) + Design (88° of solar arc before birth)
 * activations across 13 bodies, mapped onto the Rave Mandala gate wheel, then
 * derived into type, strategy, authority, profile, definition, centers,
 * channels, incarnation cross, and the four variables.
 *
 * Reuses the app's astronomy-engine ephemeris (tropical ecliptic longitudes)
 * and the exact timezone/DST logic used for astrology charts.
 */

import { julday, getPlanetLongitude } from "@/lib/astro/ephemeris";
import { getUtcOffsetHours } from "@/lib/astro/calculateChart";
import {
  GATE_WHEEL,
  CHANNELS,
  CENTER_ORDER,
  MOTOR_CENTERS,
  TYPE_INFO,
  AUTHORITY_NAMES,
  PROFILE_NAMES,
  PROFILE_ANGLE,
  DEFINITION_NAMES,
  HD_BODIES,
  type CenterId,
  type ChannelDef,
  type HdType,
  type AuthorityId,
  type HdBody,
} from "./data";

// ── Wheel math ──────────────────────────────────────────────────────────────

export interface Activation {
  body: HdBody;
  longitude: number; // tropical ecliptic longitude 0–360
  gate: number;
  line: number; // 1–6
  color: number; // 1–6
  tone: number; // 1–6
  base: number; // 1–5
}

/** Map a tropical ecliptic longitude to its Rave Mandala gate/line/color/tone/base. */
export function longitudeToGate(longitude: number): Omit<Activation, "body" | "longitude"> {
  const x = (((longitude + 58) % 360) + 360) % 360; // Gate 41 anchor at 302° → +58° from 0° Aries
  const p = x / 360; // fraction around the wheel [0,1)
  const gate = GATE_WHEEL[Math.floor(p * 64)];
  const line = Math.floor((384 * p) % 6) + 1;
  const color = Math.floor((2304 * p) % 6) + 1;
  const tone = Math.floor((13824 * p) % 6) + 1;
  const base = Math.floor((69120 * p) % 5) + 1;
  return { gate, line, color, tone, base };
}

// ── Ephemeris helpers ───────────────────────────────────────────────────────

function bodyLongitudes(jd: number): Record<HdBody, number> {
  const lon = {} as Record<HdBody, number>;
  const direct: HdBody[] = [
    "Sun",
    "Moon",
    "Mercury",
    "Venus",
    "Mars",
    "Jupiter",
    "Saturn",
    "Uranus",
    "Neptune",
    "Pluto",
    "North Node",
  ];
  for (const b of direct) lon[b] = ((getPlanetLongitude(jd, b) % 360) + 360) % 360;
  lon["South Node"] = (lon["North Node"] + 180) % 360;
  lon["Earth"] = (lon["Sun"] + 180) % 360;
  return lon;
}

function activationsFor(jd: number): Activation[] {
  const lon = bodyLongitudes(jd);
  return HD_BODIES.map((body) => ({ body, longitude: lon[body], ...longitudeToGate(lon[body]) }));
}

/** Signed smallest angular difference a−target, in (−180, 180]. */
function signedDiff(a: number, target: number): number {
  return (((a - target) % 360) + 540) % 360 - 180;
}

/**
 * Find the Julian Day when the Sun's tropical longitude was exactly 88° of arc
 * before its birth value (the Design moment, ≈ 88–89 days earlier).
 */
export function findDesignJd(jdBirth: number): number {
  const sunBirth = getPlanetLongitude(jdBirth, "Sun");
  const target = (((sunBirth - 88) % 360) + 360) % 360;
  const lo = jdBirth - 95;
  const hi = jdBirth - 82;
  const step = 0.5;
  let prev = lo;
  let prevF = signedDiff(getPlanetLongitude(lo, "Sun"), target);
  for (let jd = lo + step; jd <= hi + 1e-9; jd += step) {
    const f = signedDiff(getPlanetLongitude(jd, "Sun"), target);
    if (Math.sign(f) !== Math.sign(prevF) && Math.abs(prevF) < 90 && Math.abs(f) < 90) {
      let a = prev;
      let b = jd;
      let fa = prevF;
      for (let i = 0; i < 44; i++) {
        const m = (a + b) / 2;
        const fm = signedDiff(getPlanetLongitude(m, "Sun"), target);
        if (Math.sign(fm) === Math.sign(fa)) {
          a = m;
          fa = fm;
        } else {
          b = m;
        }
      }
      return (a + b) / 2;
    }
    prev = jd;
    prevF = f;
  }
  // Fallback linear estimate (Sun ≈ 0.9856°/day).
  return jdBirth - 88 / 0.9856473;
}

// ── Derivations ─────────────────────────────────────────────────────────────

function connectedComponents(centers: Set<CenterId>, channels: ChannelDef[]): CenterId[][] {
  const adj: Partial<Record<CenterId, Set<CenterId>>> = {};
  for (const c of centers) adj[c] = new Set();
  for (const ch of channels) {
    const [a, b] = ch.centers;
    if (centers.has(a) && centers.has(b) && a !== b) {
      adj[a]!.add(b);
      adj[b]!.add(a);
    }
  }
  const seen = new Set<CenterId>();
  const comps: CenterId[][] = [];
  for (const c of centers) {
    if (seen.has(c)) continue;
    const comp: CenterId[] = [];
    const stack: CenterId[] = [c];
    seen.add(c);
    while (stack.length) {
      const cur = stack.pop()!;
      comp.push(cur);
      for (const n of adj[cur]!) {
        if (!seen.has(n)) {
          seen.add(n);
          stack.push(n);
        }
      }
    }
    comps.push(comp);
  }
  return comps;
}

export interface HumanDesignProfile {
  type: HdType;
  strategy: string;
  signature: string;
  notSelf: string;
  aura: string;
  authority: AuthorityId;
  authorityName: string;
  profile: string; // e.g. "1/3"
  profileName: string;
  profileLines: [number, number];
  definition: number; // count of components
  definitionName: string;
  definedCenters: CenterId[];
  openCenters: CenterId[];
  definedChannels: { gates: [number, number]; centers: [CenterId, CenterId] }[];
  activeGates: number[];
  personality: Activation[];
  design: Activation[];
  incarnationCross: {
    angle: "Right Angle" | "Left Angle" | "Juxtaposition";
    gates: [number, number, number, number]; // persSun, persEarth, designSun, designEarth
    label: string;
  };
  variables: { key: string; label: string; arrow: "left" | "right"; tone: number; color: number }[];
  birthJd: number;
  designJd: number;
}

export interface HdInput {
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:MM (local)
  latitude: number;
  longitude: number;
}

export function computeHumanDesign(input: HdInput): HumanDesignProfile | null {
  const dm = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input.birthDate.trim());
  const tm = /^(\d{1,2}):(\d{2})$/.exec(input.birthTime.trim());
  if (!dm || !tm) return null;
  const year = Number(dm[1]);
  const month = Number(dm[2]);
  const day = Number(dm[3]);
  const decimalHour = Number(tm[1]) + Number(tm[2]) / 60;

  const tzOffset = getUtcOffsetHours(input.latitude, input.longitude, year, month, day);
  const jdBirth = julday(year, month, day, decimalHour - tzOffset);
  const jdDesign = findDesignJd(jdBirth);

  const personality = activationsFor(jdBirth);
  const design = activationsFor(jdDesign);

  // Pool all activated gates.
  const activeGateSet = new Set<number>();
  for (const a of personality) activeGateSet.add(a.gate);
  for (const a of design) activeGateSet.add(a.gate);
  const activeGates = [...activeGateSet].sort((a, b) => a - b);

  // Defined channels: both gates activated.
  const definedChannels = CHANNELS.filter((ch) => activeGateSet.has(ch.gates[0]) && activeGateSet.has(ch.gates[1]));

  // Defined centers: any center touched by a defined channel.
  const definedSet = new Set<CenterId>();
  for (const ch of definedChannels) {
    definedSet.add(ch.centers[0]);
    definedSet.add(ch.centers[1]);
  }
  const definedCenters = CENTER_ORDER.filter((c) => definedSet.has(c));
  const openCenters = CENTER_ORDER.filter((c) => !definedSet.has(c));

  const comps = connectedComponents(definedSet, definedChannels);

  // Type.
  const sacralDefined = definedSet.has("sacral");
  const throatComp = comps.find((c) => c.includes("throat"));
  const motorToThroat = !!throatComp && throatComp.some((c) => MOTOR_CENTERS.includes(c));
  let type: HdType;
  if (definedSet.size === 0) type = "Reflector";
  else if (sacralDefined) type = motorToThroat ? "Manifesting Generator" : "Generator";
  else type = motorToThroat ? "Manifestor" : "Projector";

  // Authority (strict precedence).
  let authority: AuthorityId;
  if (type === "Reflector") authority = "lunar";
  else if (definedSet.has("solarPlexus")) authority = "emotional";
  else if (definedSet.has("sacral")) authority = "sacral";
  else if (definedSet.has("spleen")) authority = "splenic";
  else if (definedSet.has("heart")) authority = "ego";
  else if (definedSet.has("g")) authority = "selfProjected";
  else authority = "mental";

  // Profile (Personality Sun line / Design Sun line).
  const persSun = personality.find((a) => a.body === "Sun")!;
  const desSun = design.find((a) => a.body === "Sun")!;
  const persEarth = personality.find((a) => a.body === "Earth")!;
  const desEarth = design.find((a) => a.body === "Earth")!;
  const desNode = design.find((a) => a.body === "North Node")!;
  const persNode = personality.find((a) => a.body === "North Node")!;
  const profileKey = `${persSun.line}/${desSun.line}`;

  // Definition.
  const definition = comps.length;

  // Incarnation cross.
  const angle = PROFILE_ANGLE[profileKey] ?? "Right Angle";
  const cross = {
    angle,
    gates: [persSun.gate, persEarth.gate, desSun.gate, desEarth.gate] as [number, number, number, number],
    label: `${angle} Cross (${persSun.gate}/${persEarth.gate} | ${desSun.gate}/${desEarth.gate})`,
  };

  // Variables (arrow: tone 1–3 → left, 4–6 → right).
  const arrow = (t: number): "left" | "right" => (t <= 3 ? "left" : "right");
  const variables = [
    { key: "determination", label: "Digestion", arrow: arrow(desSun.tone), tone: desSun.tone, color: desSun.color },
    { key: "environment", label: "Environment", arrow: arrow(desNode.tone), tone: desNode.tone, color: desNode.color },
    { key: "motivation", label: "Motivation", arrow: arrow(persSun.tone), tone: persSun.tone, color: persSun.color },
    { key: "perspective", label: "Perspective", arrow: arrow(persNode.tone), tone: persNode.tone, color: persNode.color },
  ];

  const info = TYPE_INFO[type];
  return {
    type,
    strategy: info.strategy,
    signature: info.signature,
    notSelf: info.notSelf,
    aura: info.aura,
    authority,
    authorityName: AUTHORITY_NAMES[authority],
    profile: profileKey,
    profileName: PROFILE_NAMES[profileKey] ?? profileKey,
    profileLines: [persSun.line, desSun.line],
    definition,
    definitionName: DEFINITION_NAMES[definition] ?? `${definition}-part Definition`,
    definedCenters,
    openCenters,
    definedChannels: definedChannels.map((ch) => ({ gates: ch.gates, centers: ch.centers })),
    activeGates,
    personality,
    design,
    incarnationCross: cross,
    variables,
    birthJd: jdBirth,
    designJd: jdDesign,
  };
}
