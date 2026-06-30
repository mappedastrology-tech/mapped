/**
 * Karmic and hidden-layer numerology meanings for the Mapped app.
 *
 * These positions sit beneath the core chart: the debts carried forward, the
 * lessons a name leaves unwritten, the passion it repeats, the way a person
 * rebalances, the instinct that meets the unexpected, and the bridges that
 * close the distance between core numbers. The tone throughout is warm and
 * unflinching — karmic and shadow material is named honestly, but always as a
 * living growth theme, never as a verdict.
 *
 * VOICE: warm, literate, mystical-but-grounded, speaking to a smart adult.
 * Sincere about the symbolic tradition, confident, specific, compassionate.
 */

import type { PositionMeanings, KarmicDebtMeaning } from "./numerologyMeanings.types";

/**
 * The four karmic debts. Each is a doubled number (13, 14, 16, 19) that reduces
 * to a core number but carries the memory of how that energy was once misused.
 * They are invitations to complete unfinished work, not punishments.
 */
export const KARMIC_DEBT: Record<number, KarmicDebtMeaning> = {
  13: {
    title: "13/4 — The Debt of Work",
    text: "In another season this energy looked for the shortcut, leaning on others and skirting the effort the work deserved. Now the path asks for discipline, focus, and a steady hand. The reward is real: when you give yourself fully to a task, labor stops feeling like burden and becomes a quiet, durable joy that nothing can take from you.",
  },
  14: {
    title: "14/5 — The Debt of Freedom",
    text: "This carries the echo of freedom taken too far — appetite without measure, change for its own sake, the senses indulged until they ruled. The work now is moderation that doesn't cage you. Learn to bend without breaking, to choose your liberties, and freedom becomes constructive rather than scattering, a wind you steer instead of one that simply blows you about.",
  },
  16: {
    title: "16/7 — The Debt of Love",
    text: "Here the old self once stood on pride, and what was built on ego eventually falls so something truer can rise. Expect the ground to shift more than once. Each collapse clears room for humility and sincere connection. Out of the rubble comes a spiritual rebirth — a love no longer about being seen, but about meeting another, and yourself, with open hands.",
  },
  19: {
    title: "19/1 — The Debt of Independence",
    text: "This remembers strength turned inward — power used for the self alone, help refused, others overlooked on the climb. The lesson is independence that still leaves room for others. Stand on your own feet, yes, and also let yourself need and be needed. True self-reliance, you'll find, is generous; it lifts rather than guards, and asks for help without shame.",
  },
};

/**
 * KARMIC_LESSON[n] — digit n is entirely absent from the name. The capacity it
 * governs didn't arrive pre-installed; this lifetime is the workshop where you
 * build it from scratch.
 */
export const KARMIC_LESSON: PositionMeanings = {
  1: "Self-assertion didn't come naturally, so you tend to defer when you might lead. The lesson is to trust your own voice — to start things, hold a position, and stand alone without waiting for permission. Independence is yours to earn, deliberately, one decision at a time.",
  2: "Tact and patience are skills here rather than instincts; you may push when you might pause. This lifetime teaches the slow art of cooperation — listening, easing tension, working beside others rather than around them. You learn that yielding is sometimes the stronger move.",
  3: "Self-expression can feel locked behind a door you weren't handed the key to. The work is to speak, create, and share your inner world out loud, even imperfectly. Joy and creativity are muscles; the more you use your voice, the more it becomes yours.",
  4: "Order and follow-through weren't givens, so structure can feel foreign or confining. The lesson is patience with process — building foundations, keeping commitments, doing the unglamorous work that lasts. You're learning that discipline isn't a cage but a kind of freedom.",
  5: "Change and adaptability may unsettle rather than excite you; routine feels safer than it should. This lifetime asks you to embrace freedom, take the leap, and let experience teach you. Flexibility is the gift waiting on the far side of your hesitation.",
  6: "Responsibility for others is something you're meant to grow into, not retreat from. The lesson lives in family, service, and care freely given — learning to show up for the people who lean on you. Devotion, you discover, deepens rather than depletes you.",
  7: "Depth and inner quiet didn't come automatically; the surface can feel easier than the search. This lifetime invites you inward — to study, reflect, and trust what can't be proven. Faith and wisdom are built in solitude you must learn to seek out.",
  8: "Power, money, and the material world may intimidate or elude you. The lesson is to claim your authority — to handle abundance without fear or guilt, to lead and be paid your worth. Mastery here means meeting the practical world as an equal.",
  9: "Compassion on the wide scale is something you're meant to cultivate. The work is to give without expecting return, to forgive, to hold concern for those beyond your own circle. A generous, open heart is the capacity this lifetime is asking you to build.",
};

/**
 * HIDDEN_PASSION[n] — the number that appears most often in the name. A
 * concentrated, almost compulsive talent that wants out into the world.
 */
export const HIDDEN_PASSION: PositionMeanings = {
  1: "Leadership lives close to the surface in you — a drive to originate, to be first, to do it your own way. You're happiest at the front, building something that bears your signature. This is a strong, individual current; let it pull you toward purpose rather than mere willfulness.",
  2: "A gift for connection runs deep here — sensitivity, diplomacy, the instinct to harmonize what's at odds. You read rooms and mend rifts almost without trying. Your passion is partnership itself; give it somewhere worthy to land and your quiet talent becomes a real and lasting force.",
  3: "Expression is your engine — words, color, performance, the irrepressible urge to create and delight. You light up when you're making something or making people smile. This is a luminous talent; the only danger is scattering it, so aim that brightness and let it carry.",
  4: "You're built to build — order, reliability, and the patient assembly of things that endure. Where others lose interest, you finish. This steady, capable drive is rare and trusted; honor it without letting it harden into rigidity, and you become the foundation others rely on.",
  5: "Restless, magnetic curiosity drives you toward freedom, experience, and the next horizon. You learn fast, adapt faster, and crave variety like air. This is a vivid, versatile talent; channel it toward something that holds your attention and your wide-ranging energy turns into genuine reach.",
  6: "A profound capacity for love and responsibility concentrates here — the urge to nurture, beautify, and care for your own. Home and the people in it are your center of gravity. This is a warm, devoted talent; given an outlet, it makes you the heart that others gather around.",
  7: "You're drawn inexorably toward depth — analysis, mystery, the truth beneath appearances. Solitude and study feel like home. This is a rare contemplative gift; let it pull you into real mastery of something, and your quiet insight becomes a kind of authority all its own.",
  8: "Ambition and capability cluster strongly in you — a talent for power, organization, and the material game played well. You see how things could scale and want to make them. This is a potent, executive drive; aimed with integrity, it builds things of real and lasting worth.",
  9: "A wide, generous heart is your strongest current — the pull toward compassion, art, and service to something larger than yourself. You feel the world's needs personally. This is a noble talent; give it a cause and your idealism becomes more than feeling, it becomes contribution.",
};

/**
 * BALANCE[n] — how you best regain equilibrium when stress or emotional
 * upheaval knocks you off center. The medicine that brings you home.
 */
export const BALANCE: PositionMeanings = {
  1: "When you're thrown, you steady yourself by standing on your own two feet — deciding, acting, trusting your instinct rather than waiting to be rescued. A clear choice, made and owned, is what brings you back.",
  2: "You find your footing through gentleness — by talking it through with someone you trust, easing the tension instead of forcing it. Connection and a little patience restore you faster than any confrontation could.",
  3: "Equilibrium returns when you express what's roiling inside — through words, art, or simple laughter. Bottling it up is what undoes you; letting it out, in whatever form, is how you lighten and come right again.",
  4: "You rebalance through order and the practical. Make a plan, tend the basics, do one solid useful thing. Structure is your ground; when the world tilts, putting something back in its place steadies the whole of you.",
  5: "Movement and change are your reset — a walk, a trip, a shift in scenery. When stress closes in, you regain yourself by widening the frame, getting some air and some distance until perspective returns.",
  6: "You come back to center by caring for someone or something — tending home, helping a person you love, restoring beauty around you. Turning toward responsibility, rather than away, is what quiets the storm in you.",
  7: "Solitude is your medicine. You regain equilibrium by withdrawing into quiet — to think, reflect, or simply be alone with your own mind. Given enough stillness, you reliably find your way back to yourself.",
  8: "You steady yourself by taking command of the situation — assessing clearly, making a plan, restoring control where things felt chaotic. Decisive, capable action is what returns your sense of solid ground.",
  9: "Balance comes when you lift your eyes from your own trouble to the larger picture — giving, helping, remembering what matters most. Perspective and a generous act dissolve the upheaval better than dwelling ever could.",
};

/**
 * SUBCONSCIOUS_SELF[n] — how reliably you meet the unexpected before thought
 * catches up. Higher numbers (range 3–9) move with more self-assurance under
 * surprise; lower ones are more easily thrown, and that too can be tended.
 */
export const SUBCONSCIOUS_SELF: PositionMeanings = {
  3: "The unexpected can rattle you — surprise tends to scatter your focus before you've gathered yourself. This isn't weakness; it's a nervous system that feels first and steadies after. Lean on the people around you and let your response form, and your footing will come.",
  4: "Sudden disruption unsettles you more than most, because you trust the plan and the unplanned feels like the ground giving way. Give yourself a beat to absorb the shock; once you've found something solid to stand on, your steady nature reasserts itself and you recover well.",
  5: "You meet the unexpected with real adaptability — change doesn't frighten you the way it does others, and you can improvise on your feet. There's a workable balance here: enough composure to act, enough flexibility to bend with whatever the moment hands you.",
  6: "You respond to emergencies with a grounded, caring steadiness, especially when others are involved — looking after people gives you focus. Your instinct under pressure is to hold things together, and more often than not, you do exactly that.",
  7: "When the unexpected lands, you tend to step back and assess rather than panic. That contemplative reflex serves you; you read the situation before you move. Self-assured in your own quiet way, you rarely lose your head when the ground shifts.",
  8: "You're well-equipped for the unforeseen — crisis tends to sharpen rather than scatter you, and you take charge almost reflexively. Composed and decisive under pressure, you're the one others instinctively look to when things go sideways.",
  9: "You meet the unexpected with notable poise, holding a wide view even as events move fast. Little truly throws you; you draw on deep reserves of composure and perspective, responding to the surprising and the urgent with calm, capable self-assurance.",
};

/**
 * BRIDGE[n] — a bridge number is the gap between two of your core numbers. It
 * names the quality that, when cultivated, narrows that distance and lets the
 * two energies cooperate instead of pulling against each other.
 */
export const BRIDGE: PositionMeanings = {
  0: "These two core numbers already speak the same language. There's little tension to reconcile — the energies flow into each other naturally, reinforcing rather than competing. Your work isn't to bridge a gap but to trust the harmony you already carry, and to let these aligned forces move as one.",
  1: "Close this gap with a touch more independence and initiative. When the two numbers strain against each other, the remedy is to lead — make the decision, take the first step, trust your own direction. A little decisive self-trust knits these energies together.",
  2: "Narrow the distance here with patience and tact. When these two pull apart, gentleness reconciles them — listening more, forcing less, letting cooperation do what willpower can't. Sensitivity to timing and to others is the thread that draws them close.",
  3: "Bridge these numbers through expression and lightness. When they conflict, the medicine is to speak, create, and let some joy back in. Sharing what you feel, rather than guarding it, releases the tension and lets these energies find an easy, creative rhythm together.",
  4: "Close this gap with structure and steady effort. When the two numbers clash, order reconciles them — a plan, a routine, the patient work of building something solid. Grounding yourself in the practical gives these energies the common foundation they need.",
  5: "Bridge these numbers with flexibility and a willingness to change. When they strain, the remedy is to loosen up — adapt, embrace variety, let go of the rigid expectation. A more open, freedom-loving stance lets these two energies breathe and move together.",
  6: "Narrow this distance through love and responsibility. When the two numbers pull apart, caring reconciles them — showing up for others, tending what matters, accepting the weight you're meant to carry. Warmth and devotion are the bridge between them.",
  7: "Close this gap with reflection and depth. When these energies conflict, the answer is to go inward — to study, contemplate, and seek the quiet understanding beneath the surface. A little solitude and trust in your own wisdom draws the two together.",
  8: "Bridge these numbers through confident, capable action in the material world. When they strain, the remedy is to take charge — manage, organize, claim your authority. Meeting the practical world with strength and balance is what closes the distance between them.",
};

/**
 * SYSTEM_NOTES — short explanatory strings for UI info popovers.
 */
export const SYSTEM_NOTES: {
  pythagoreanVsChaldean: string;
  masterNumbers: string;
  karmicDebt: string;
} = {
  pythagoreanVsChaldean:
    "Two systems assign numbers to letters. Pythagorean is sequential — A through I map to 1 through 9, then the pattern repeats. Chaldean is older and follows the sound and vibration of each letter, never assigning 9 to a name. Because the letter values differ, the same name can reduce to a different number in each system.",
  masterNumbers:
    "Most numbers reduce to a single digit, but 11, 22, and 33 are held as master numbers and left unreduced. They carry a heightened, more demanding charge — 11 the inspired visionary, 22 the master builder, 33 the master teacher. Their power is real but asks more of the person who carries it.",
  karmicDebt:
    "When a core number arrives by way of 13, 14, 16, or 19, it carries a karmic debt — the memory of an energy once misused and now offered back for completion. Each debt names a specific theme: 13 the debt of work, 14 of freedom, 16 of love, 19 of independence. They are unfinished lessons, not sentences.",
};
