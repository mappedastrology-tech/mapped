/**
 * Shared content types for the Human Design meanings database.
 *
 * VOICE: warm, literate, empowering, and grounded. Human Design is presented
 * sincerely as a map for living — never as fixed fate or a verdict. Second
 * person ("you"). Confident, specific, no skeptical hedging, no emoji. Speak
 * to a smart adult who wants to understand themselves, not be flattered.
 */

export interface GateContent {
  number: number;
  name: string; // e.g. "Gate 1 — Self-Expression"
  keynote: string; // 3–6 words
  description: string; // ~35–55 words
  lines: Record<number, string>; // lines 1–6, one line each (~12–20 words)
}

export interface ChannelContent {
  key: string; // "1-8" (lower gate first)
  name: string; // e.g. "The Channel of Inspiration"
  description: string; // ~30–45 words
}

export interface CenterContent {
  id: string;
  name: string;
  role: string; // what this center governs, ~15–25 words
  defined: string; // what it means when DEFINED (consistent), ~30–45 words
  open: string; // what it means when OPEN/undefined (wisdom + not-self), ~30–45 words
  whenDefinedApp: string; // how to live it well when defined, ~25–35 words
  whenOpenApp: string; // how to live it well when open, ~25–35 words
}

export interface TypeContent {
  type: string;
  description: string; // ~50–70 words
  strategyDetail: string; // how to live the strategy, ~35–50 words
  signatureDetail: string; // the aligned feeling, ~20–30 words
  notSelfDetail: string; // the off-track feeling + what it signals, ~20–30 words
  application: string; // concrete daily practice, ~30–45 words
}

export interface AuthorityContent {
  id: string;
  name: string;
  description: string; // what this authority is, ~35–50 words
  howToDecide: string; // the practical decision method, ~30–45 words
}

export interface ProfileContent {
  key: string; // "1/3"
  name: string; // "Investigator / Martyr"
  description: string; // ~40–55 words
  application: string; // how to live it, ~25–35 words
}

export interface LineContent {
  line: number; // 1–6
  name: string; // "Investigator"
  description: string; // ~25–35 words
}

export interface VariableContent {
  key: string; // determination | environment | motivation | perspective
  name: string;
  description: string; // what this variable governs, ~30–45 words
  leftMeaning: string; // what a LEFT arrow (active/focused/strategic) means here, ~18–28 words
  rightMeaning: string; // what a RIGHT arrow (passive/receptive/peripheral) means here, ~18–28 words
}
