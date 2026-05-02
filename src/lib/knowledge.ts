/**
 * Knowledge base queries — fetches Dolly's interpretations from Supabase.
 *
 * Tables:
 *   kb_planet_in_sign  — what a planet means in a sign
 *   kb_planet_in_house — what a planet means in a house
 *   kb_sign_on_house   — what a sign means ruling a house cusp
 *   kb_dignities       — domicile / exalted / detriment / fall
 *   kb_life_markers    — fame, fortune, marriage, psychic, etc.
 *   kb_retrogrades     — natal retrograde interpretations
 */

import { supabase } from "./supabase";

/* ─── Sign abbreviation → full name ─── */
export const SIGN_FULL: Record<string, string> = {
  Ari: "Aries", Tau: "Taurus", Gem: "Gemini", Can: "Cancer",
  Leo: "Leo", Vir: "Virgo", Lib: "Libra", Sco: "Scorpio",
  Sag: "Sagittarius", Cap: "Capricorn", Aqu: "Aquarius", Pis: "Pisces",
};

/* ─── House word → number ─── */
const HOUSE_NUM: Record<string, number> = {
  First: 1, Second: 2, Third: 3, Fourth: 4,
  Fifth: 5, Sixth: 6, Seventh: 7, Eighth: 8,
  Ninth: 9, Tenth: 10, Eleventh: 11, Twelfth: 12,
};

/** Parse "First_House" → 1, or return null */
export function parseHouseNumber(house: string | number | null): number | null {
  if (house == null) return null;
  if (typeof house === "number") return house >= 1 && house <= 12 ? house : null;
  const word = String(house).split("_")[0];
  return HOUSE_NUM[word] ?? null;
}

/* ─── Return types ─── */

export interface PlanetInSign {
  planet: string;
  sign: string;
  summary: string;
  life_patterns: string;
  relationships: string;
  challenges: string;
  growth: string;
  book_references: string[];
}

export interface PlanetInHouse {
  planet: string;
  house_number: number;
  summary: string;
  life_patterns: string;
  strengths: string;
  challenges: string;
  book_references: string[];
}

export interface SignOnHouse {
  sign: string;
  house_number: number;
  summary: string;
  approach: string;
}

export interface Dignity {
  planet: string;
  sign: string;
  dignity_type: "domicile" | "exalted" | "detriment" | "fall";
  summary: string;
  what_it_means: string;
}

export interface LifeMarker {
  marker_type: string;
  label: string;
  summary: string;
}

export interface Retrograde {
  planet: string;
  summary: string;
  life_patterns: string;
  growth: string;
}

/* ─── Core queries ─── */

export async function fetchPlanetInSign(
  planet: string,
  signAbbr: string
): Promise<PlanetInSign | null> {
  const sign = SIGN_FULL[signAbbr] || signAbbr;
  const { data, error } = await supabase
    .from("kb_planet_in_sign")
    .select("planet, sign, summary, life_patterns, relationships, challenges, growth, book_references")
    .eq("planet", planet)
    .eq("sign", sign)
    .single();

  if (error || !data) return null;
  return data as PlanetInSign;
}

export async function fetchPlanetInHouse(
  planet: string,
  houseNumber: number
): Promise<PlanetInHouse | null> {
  const { data, error } = await supabase
    .from("kb_planet_in_house")
    .select("planet, house_number, summary, life_patterns, strengths, challenges, book_references")
    .eq("planet", planet)
    .eq("house_number", houseNumber)
    .single();

  if (error || !data) return null;
  return data as PlanetInHouse;
}

export async function fetchSignOnHouse(
  signAbbr: string,
  houseNumber: number
): Promise<SignOnHouse | null> {
  const sign = SIGN_FULL[signAbbr] || signAbbr;
  const { data, error } = await supabase
    .from("kb_sign_on_house")
    .select("sign, house_number, summary, approach")
    .eq("sign", sign)
    .eq("house_number", houseNumber)
    .single();

  if (error || !data) return null;
  return data as SignOnHouse;
}

/* ─── Special placement queries ─── */

export async function fetchDignity(
  planet: string,
  signAbbr: string
): Promise<Dignity | null> {
  const sign = SIGN_FULL[signAbbr] || signAbbr;
  const { data, error } = await supabase
    .from("kb_dignities")
    .select("planet, sign, dignity_type, summary, what_it_means")
    .eq("planet", planet)
    .eq("sign", sign)
    .single();

  if (error || !data) return null;
  return data as Dignity;
}

export async function fetchLifeMarkers(
  planet: string,
  signAbbr: string,
  houseNumber: number | null
): Promise<LifeMarker[]> {
  const sign = SIGN_FULL[signAbbr] || signAbbr;
  const markers: LifeMarker[] = [];

  // Check planet_in_sign markers
  const { data: pisMarkers } = await supabase
    .from("kb_life_markers")
    .select("marker_type, label, summary")
    .eq("condition_type", "planet_in_sign")
    .eq("planet", planet)
    .eq("sign", sign);

  if (pisMarkers) markers.push(...(pisMarkers as LifeMarker[]));

  if (houseNumber) {
    // Check planet_in_house markers
    const { data: pihMarkers } = await supabase
      .from("kb_life_markers")
      .select("marker_type, label, summary")
      .eq("condition_type", "planet_in_house")
      .eq("planet", planet)
      .eq("house_number", houseNumber);

    if (pihMarkers) markers.push(...(pihMarkers as LifeMarker[]));

    // Check sign_on_house markers
    const { data: sohMarkers } = await supabase
      .from("kb_life_markers")
      .select("marker_type, label, summary")
      .eq("condition_type", "sign_on_house")
      .eq("sign", sign)
      .eq("house_number", houseNumber);

    if (sohMarkers) markers.push(...(sohMarkers as LifeMarker[]));
  }

  return markers;
}

export async function fetchRetrograde(
  planet: string
): Promise<Retrograde | null> {
  const { data, error } = await supabase
    .from("kb_retrogrades")
    .select("planet, summary, life_patterns, growth")
    .eq("planet", planet)
    .single();

  if (error || !data) return null;
  return data as Retrograde;
}

/* ─── Combined fetch for a single placement ─── */

export async function fetchPlacementKnowledge(
  planet: string,
  signAbbr: string,
  houseWord: string | number | null,
  isRetrograde: boolean = false
) {
  const houseNumber = parseHouseNumber(houseWord);

  const [planetInSign, planetInHouse, signOnHouse, dignity, lifeMarkers, retrograde] =
    await Promise.all([
      fetchPlanetInSign(planet, signAbbr),
      houseNumber ? fetchPlanetInHouse(planet, houseNumber) : Promise.resolve(null),
      houseNumber ? fetchSignOnHouse(signAbbr, houseNumber) : Promise.resolve(null),
      fetchDignity(planet, signAbbr),
      fetchLifeMarkers(planet, signAbbr, houseNumber),
      isRetrograde ? fetchRetrograde(planet) : Promise.resolve(null),
    ]);

  return { planetInSign, planetInHouse, signOnHouse, houseNumber, dignity, lifeMarkers, retrograde };
}
