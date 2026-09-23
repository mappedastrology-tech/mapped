/**
 * The opening questions offered on both Dolly screens.
 *
 * Shared because they had drifted apart, and desktop's had drifted into
 * being wrong: WebDolly hardcoded "What does my Cancer sun mean?" and
 * "Why do I feel so restless lately?" with pre-written mock answers attached,
 * left over from the design prototype. The Cancer line is wrong for about
 * eleven readers in twelve, and offering someone a question about a placement
 * they do not have is a worse first impression than offering nothing.
 *
 * These work for any chart, and each is tagged with where its answer would
 * come from, which is what colours the dot beside it.
 */

import type { DollyTagKind } from "@/lib/dollyReply";

export interface StarterPrompt {
  text: string;
  kind: DollyTagKind;
}

/**
 * Four, not six. At 390px roughly four and a half clear the composer, so a
 * longer list puts prompts below the fold with nothing to say they are there.
 * These four cover all three sources, so the colour key means something on
 * first sight.
 */
export const STARTER_PROMPTS: readonly StarterPrompt[] = [
  { text: "What should I know about myself right now?", kind: "chart" },
  { text: "What's the sky doing to me today?", kind: "sky" },
  { text: "What patterns do I keep repeating?", kind: "card" },
  { text: "What's my biggest blind spot?", kind: "chart" },
];
