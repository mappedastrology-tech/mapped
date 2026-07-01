/**
 * Human Design content database — aggregator + typed accessors.
 * Ties together gates, channels, centers, lines, types, authorities, profiles,
 * and variables, plus the concept tooltips.
 */

import type {
  GateContent,
  ChannelContent,
  CenterContent,
  TypeContent,
  AuthorityContent,
  ProfileContent,
  LineContent,
  VariableContent,
} from "./content.types";
import { GATES_1_32 } from "./content.gates1";
import { GATES_33_64 } from "./content.gates2";
import { CHANNEL_CONTENT } from "./content.channels";
import { CENTER_CONTENT, LINE_CONTENT } from "./content.centers";
import { TYPE_CONTENT, AUTHORITY_CONTENT } from "./content.typesAuthorities";
import { PROFILE_CONTENT, VARIABLE_CONTENT } from "./content.profiles";
import { HD_CONCEPTS, getHdConcept } from "./concepts";

export const GATE_CONTENT: Record<number, GateContent> = { ...GATES_1_32, ...GATES_33_64 };

export {
  CHANNEL_CONTENT,
  CENTER_CONTENT,
  LINE_CONTENT,
  TYPE_CONTENT,
  AUTHORITY_CONTENT,
  PROFILE_CONTENT,
  VARIABLE_CONTENT,
  HD_CONCEPTS,
  getHdConcept,
};

export function getGate(n: number): GateContent | null {
  return GATE_CONTENT[n] ?? null;
}

/** Channel content by a gate pair, in any order. */
export function getChannel(a: number, b: number): ChannelContent | null {
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  return CHANNEL_CONTENT[`${lo}-${hi}`] ?? null;
}

export function getCenter(id: string): CenterContent | null {
  return CENTER_CONTENT[id] ?? null;
}

export function getLineArchetype(line: number): LineContent | null {
  return LINE_CONTENT[line] ?? null;
}

export function getTypeContent(type: string): TypeContent | null {
  return TYPE_CONTENT[type] ?? null;
}

export function getAuthorityContent(id: string): AuthorityContent | null {
  return AUTHORITY_CONTENT[id] ?? null;
}

export function getProfileContent(key: string): ProfileContent | null {
  return PROFILE_CONTENT[key] ?? null;
}

export function getVariableContent(key: string): VariableContent | null {
  return VARIABLE_CONTENT[key] ?? null;
}
