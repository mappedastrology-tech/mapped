import type { LearnDomain, ReferenceEntry } from "../types";
import { astrologyReference } from "./astrology";
import { crystalReference } from "./crystals";
import { tarotReference } from "./tarot";
import { herbReference } from "./herbs";
import { essentialOilReference } from "./essentialOils";
import { runeReference } from "./runes";
import { numerologyReference } from "./numerology";
import { chakraReference } from "./chakras";
import { dreamReference } from "./dreams";
import { almanacReference } from "./almanac";
import { meditationReference } from "./meditation";
import { ingestedReference } from "./ingested";

/** All quick-reference entries across domains. */
export const ALL_REFERENCE: ReferenceEntry[] = [
  ...astrologyReference,
  ...crystalReference,
  ...tarotReference,
  ...herbReference,
  ...essentialOilReference,
  ...runeReference,
  ...numerologyReference,
  ...chakraReference,
  ...dreamReference,
  ...almanacReference,
  ...meditationReference,
  ...ingestedReference,
];

export function referenceByDomain(domain: LearnDomain): ReferenceEntry[] {
  return ALL_REFERENCE.filter((e) => e.domain === domain).sort((a, b) => a.name.localeCompare(b.name));
}

/** Domains that currently have reference content. */
export function domainsWithReference(): Set<LearnDomain> {
  return new Set(ALL_REFERENCE.map((e) => e.domain));
}

export function getReferenceEntry(id: string): ReferenceEntry | undefined {
  return ALL_REFERENCE.find((e) => e.id === id);
}

/**
 * Find an entry whose name (or alias) exactly matches `name` — used to turn a
 * field value like a ruling planet or element into a tappable cross-link.
 * Scoped to a domain when given, and never returns the entry you came from.
 */
export function findEntryByName(name: string, domain?: LearnDomain, excludeId?: string): ReferenceEntry | undefined {
  const n = name.trim().toLowerCase();
  if (!n) return undefined;
  return ALL_REFERENCE.find(
    (e) =>
      e.id !== excludeId &&
      (domain ? e.domain === domain : true) &&
      (e.name.toLowerCase() === n || (e.aka ?? []).some((a) => a.toLowerCase() === n)),
  );
}

function haystack(e: ReferenceEntry): string {
  return [e.name, ...(e.aka ?? []), e.category ?? "", e.summary, ...(e.tags ?? [])].join(" ").toLowerCase();
}

/**
 * Rank a reference entry against a query. Returns a score (higher = better) or
 * -1 for no match. Name/aka prefix matches rank highest, then word/substring.
 */
export function scoreEntry(e: ReferenceEntry, q: string): number {
  const query = q.trim().toLowerCase();
  if (!query) return 0;
  const name = e.name.toLowerCase();
  const aka = (e.aka ?? []).map((a) => a.toLowerCase());

  if (name === query || aka.includes(query)) return 100;
  if (name.startsWith(query) || aka.some((a) => a.startsWith(query))) return 80;
  if (name.includes(query) || aka.some((a) => a.includes(query))) return 60;
  if ((e.category ?? "").toLowerCase().includes(query)) return 40;
  if ((e.tags ?? []).some((t) => t.toLowerCase().includes(query))) return 30;
  if (e.summary.toLowerCase().includes(query)) return 20;
  // token fallback: all query words appear somewhere
  const hay = haystack(e);
  if (query.split(/\s+/).every((w) => hay.includes(w))) return 10;
  return -1;
}

export function searchReference(query: string, domain?: LearnDomain): ReferenceEntry[] {
  const pool = domain ? referenceByDomain(domain) : ALL_REFERENCE;
  if (!query.trim()) return [...pool].sort((a, b) => a.name.localeCompare(b.name));
  return pool
    .map((e) => ({ e, s: scoreEntry(e, query) }))
    .filter((x) => x.s >= 0)
    .sort((a, b) => b.s - a.s || a.e.name.localeCompare(b.e.name))
    .map((x) => x.e);
}
