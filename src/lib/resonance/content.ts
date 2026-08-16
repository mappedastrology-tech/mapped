/**
 * Archetype written content (spec §5). Composed from rich per-domain and
 * per-mode prose so all 96 archetypes get distinct essence / shadow / growth /
 * relationship / work text without 96×5 hand-authored blocks — and it's static,
 * so it's free at runtime and never regenerates. shadowSide is required (spec).
 *
 * The domain supplies the core self; the mode inflects every facet of it.
 */

import { ARCHETYPE_BY_ID, type DomainId, type ModeId } from "./archetypes";

export interface ArchetypeContent {
  essence: string;
  shadowSide: string;
  growthEdge: string;
  inRelationship: string;
  atWork: string;
}

interface DomainCopy {
  self: string; gift: string; shadow: string; growth: string; love: string; work: string;
}
interface ModeCopy {
  stance: string; gift: string; shadow: string; growth: string; love: string; work: string;
}

const DOMAIN: Record<DomainId, DomainCopy> = {
  flame: {
    self: "pure will — the drive to ignite, to move first, to make something happen where nothing was happening before",
    gift: "You bring heat: you start the fire other people warm themselves at, and stalled things move once you arrive.",
    shadow: "Left unchecked you burn what you meant to warm — you push past the point of usefulness, mistake intensity for progress, and scorch the people who couldn't keep your pace.",
    growth: "Your work is learning that fire needs tending, not just striking — that not everything is yours to ignite, and that rest is fuel, not weakness.",
    love: "You love hot and fast, and the practice is staying once the first blaze settles into embers.",
    work: "You do your best work at the ignition point — launches, turnarounds, the first push — and chafe at the long maintenance that follows.",
  },
  tide: {
    self: "feeling in motion — currents of emotion, empathy, and intuition that move beneath the surface and carry everything with them",
    gift: "You feel what a room is doing before anyone says it, and you can move with change instead of bracing against it.",
    shadow: "You flood. Other people's moods become yours, your boundaries dissolve, and you can drown in feeling you mistook for your own.",
    growth: "Your work is a shoreline — learning where you end and others begin, so your depth becomes a gift you give rather than a tide that takes you under.",
    love: "You merge easily and deeply, and the practice is keeping a self that doesn't wash away in the other person.",
    work: "You do your best work reading people and holding emotional weather; rigid, feelingless systems starve you.",
  },
  stone: {
    self: "endurance itself — patience, reliability, and the slow strength that outlasts every burst of enthusiasm around it",
    gift: "You are the thing others lean on: what you build holds, and what you promise arrives.",
    shadow: "You harden. You mistake stubbornness for strength, resist change long past its usefulness, and carry weight you were never meant to hold alone.",
    growth: "Your work is learning that endurance without flexibility becomes stone that cracks instead of bends — that yielding, sometimes, is the stronger move.",
    love: "You love steadily and for the long haul, and the practice is not confusing routine for intimacy.",
    work: "You do your best work where consistency and follow-through matter; chaos and constant pivots wear you thin.",
  },
  wind: {
    self: "the moving mind — ideas, language, and the restless travel between one thought and the next",
    gift: "You see the pattern, name the thing no one could name, and connect what looked unrelated.",
    shadow: "You scatter. You live in the plan instead of the act, talk the thing instead of doing it, and mistake understanding a problem for solving it.",
    growth: "Your work is landing — learning to let a single idea take root and be built rather than trading it for the next bright one.",
    love: "You bond through the mind first, and the practice is letting the body and the feeling in, not just the conversation.",
    work: "You do your best work analysing, writing, strategising, teaching; repetitive hands-on grind dulls you.",
  },
  root: {
    self: "what goes down rather than up — into the buried, the taboo, and the things most people step around",
    gift: "You are not afraid of the dark in yourself or anyone else, so you can go where others won't and bring back what's there.",
    shadow: "You can get lost below: you hide, you brood, you mistake depth for truth and keep company with your own darkness longer than it serves you.",
    growth: "Your work is surfacing — learning that what you dig up is meant to be brought into the light, not hoarded in the underworld.",
    love: "You want to be known all the way down, shadow included, and the practice is trusting someone with what you keep buried.",
    work: "You do your best work where honesty and the uncomfortable truth are the job; shallow, relentlessly cheerful places suffocate you.",
  },
  star: {
    self: "the reach upward and outward — toward meaning, the future, and something larger than the immediate and material",
    gift: "You hold a vision other people can orient by, and you see the possible where everyone else sees only the given.",
    shadow: "You float off. You mistake the ideal for the real, neglect the body and the practical, and can be so far ahead you leave people — and yourself — behind.",
    growth: "Your work is coming down to earth — learning to root the vision in a body, a day, a next concrete step.",
    love: "You love toward an ideal, and the practice is loving the actual, flawed person in front of you.",
    work: "You do your best work casting vision and meaning; soulless, purely transactional work empties you.",
  },
  thread: {
    self: "connection made visible — the bonds, loyalties, and care that tie people to one another",
    gift: "You weave people together: you remember who needs what, and you hold the relationships that hold a group up.",
    shadow: "You lose yourself in the weave. You over-give, tie yourself to people who drain you, and mistake being needed for being loved.",
    growth: "Your work is the boundary — learning you can hold the thread without letting it strangle you, and that some ties are meant to be cut.",
    love: "You love by belonging and tending, and the practice is receiving care, not only giving it.",
    work: "You do your best work connecting people, tending teams, and holding culture; cold, every-person-for-themselves places hurt you.",
  },
  crown: {
    self: "the will to hold authority — to rule the self, set the boundary, and take responsibility for the whole",
    gift: "You can carry weight others can't, hold the line, and pick up the responsibility no one else will.",
    shadow: "You harden into control. You defend the boundary past the point of sense, mistake dominance for leadership, and struggle to let anyone else hold anything.",
    growth: "Your work is sovereignty over yourself before others — learning that real authority serves and shares, and doesn't need to win.",
    love: "You protect fiercely, and the practice is letting yourself be led, held, and softened.",
    work: "You do your best work leading, deciding, and holding the boundary; being micromanaged or made powerless corrodes you.",
  },
  forge: {
    self: "the drive to make — to master a skill, shape raw material into form, and get the thing genuinely right",
    gift: "You turn raw material into something real and well-made, and your standards raise everything you touch.",
    shadow: "You grind. You mistake perfect for done, hide inside the work to avoid the world, and are harder on yourself than any craft requires.",
    growth: "Your work is releasing — learning that a thing finished and shared beats a thing perfected and hidden.",
    love: "You show love by making and doing for people, and the practice is saying it in words too, and letting yourself be tended.",
    work: "You do your best work with your hands on real material and a standard to meet; vague, quality-indifferent work frustrates you.",
  },
  path: {
    self: "motion itself — crossing thresholds, moving between worlds, at home in the in-between",
    gift: "You move between rooms, roles, and worlds that don't usually touch, and you help others cross over too.",
    shadow: "You never land. You leave before things get hard, mistake motion for growth, and run from the very rootedness you need.",
    growth: "Your work is arrival — learning that some thresholds are meant to be lived past, not just crossed and left behind.",
    love: "You love the adventure of a person, and the practice is staying once the newness wears off.",
    work: "You do your best work in change, transition, and bridging; static, unchanging roles cage you.",
  },
  bell: {
    self: "the need to be heard — voice, word, and the drive to name things and send the message",
    gift: "You give the thing a voice: you name what a group is feeling and make it carry, sound the alarm or the welcome.",
    shadow: "You perform instead of connect. You need to be heard more than you need to listen, and mistake being loud for being right.",
    growth: "Your work is silence — learning that the most powerful voice knows when to withhold, and that listening is half of speech.",
    love: "You bond through words and being heard, and the practice is the quiet, wordless kind of presence too.",
    work: "You do your best work speaking, writing, broadcasting, and naming; work that keeps you silent and unseen frustrates you.",
  },
  wheel: {
    self: "movement in cycles — attuned to timing, season, and the long turn of death and renewal",
    gift: "You know when: you feel the season a thing is in, and you can let what's ending end so the next thing can begin.",
    shadow: "You wait too long, or spin in place. You mistake cycling-through for progress, cling to what should be composted, and can 'wait for the timing' forever.",
    growth: "Your work is the deliberate act — learning that timing serves the will, and not everything is a season you must merely endure.",
    love: "You love in seasons and for the long turning, and the practice is showing up in the day, not only the arc.",
    work: "You do your best work with timing, cycles, and long transformation; rigid, seasonless deadlines fight your nature.",
  },
};

const MODE: Record<ModeId, ModeCopy> = {
  kindler: {
    stance: "and you meet it by igniting — you start, you spark, you get the thing moving.",
    gift: "Things begin because you struck the match.",
    shadow: "But you start more than you finish, and leave a trail of half-lit fires.",
    growth: "Learn to stay past the spark, into the tending.",
    love: "You ignite fast, and boredom is your enemy.",
    work: "You shine at beginnings, launches, and the zero-to-one.",
  },
  builder: {
    stance: "and you meet it by building — patiently, structurally, made to last.",
    gift: "You don't just start it; you construct something that lasts.",
    shadow: "But you can over-build, rigidly, long after the plan should have flexed.",
    growth: "Learn when to stop laying bricks and let it breathe.",
    love: "You build love slow and solid, brick by brick.",
    work: "You shine at systems, structure, and durable results.",
  },
  warden: {
    stance: "and you meet it by guarding — holding, preserving, keeping the thing safe.",
    gift: "You protect what matters and keep it from being lost.",
    shadow: "But you can hold too tightly, and guard against the very change that was needed.",
    growth: "Learn that some things are kept by letting them move.",
    love: "You are steadfast, protective, and hard to shake.",
    work: "You shine at stewardship, continuity, and keeping the standard.",
  },
  breaker: {
    stance: "and you meet it by breaking — overturning, refusing, clearing the false ground.",
    gift: "You end what needs to end and clear the way for what's next.",
    shadow: "But you can break for its own sake, and destroy things that were still holding.",
    growth: "Learn to build in the space you clear, not only to clear it.",
    love: "You are intense and transformative to be close to.",
    work: "You shine at disruption, turnarounds, and cutting dead weight.",
  },
  seer: {
    stance: "and you meet it by perceiving — reading, seeing, knowing before it's said.",
    gift: "You see what's actually there, under the surface everyone else takes at face value.",
    shadow: "But you can watch instead of act, and hide inside your own perception.",
    growth: "Learn to turn what you see into what you do.",
    love: "You are deeply attuned, sometimes more than a partner expects.",
    work: "You shine at insight, diagnosis, and reading the real situation.",
  },
  mender: {
    stance: "and you meet it by mending — tending, healing, making whole what was broken.",
    gift: "You repair what others wrote off and make the hurt thing usable again.",
    shadow: "But you can pour into others until you're empty, and tend everyone but yourself.",
    growth: "Learn that you are also someone who needs mending.",
    love: "You are nurturing, and safe to fall apart near.",
    work: "You shine at repair, care, and restoring what's damaged.",
  },
  trickster: {
    stance: "and you meet it by improvising — bending the rules, working the angles, making a way from what's at hand.",
    gift: "You find the path no one sanctioned and make mastery from scraps.",
    shadow: "But you can slip past the honest thing, and use the trick when the truth was needed.",
    growth: "Learn that the straight road is sometimes the clever one.",
    love: "You keep a partner surprised and rarely bored.",
    work: "You shine at improvisation, workarounds, and problems with no manual.",
  },
  sovereign: {
    stance: "and you meet it by ruling — taking the whole, holding the centre, owning the outcome.",
    gift: "You take full responsibility and hold the centre so others can act.",
    shadow: "But you can grip the crown too hard, and rule where you should have released.",
    growth: "Learn that the strongest authority hands power away.",
    love: "You are devoted and steady as bedrock.",
    work: "You shine at leadership, ownership, and holding the whole.",
  },
};

export function composeContent(domain: DomainId, mode: ModeId, name: string): ArchetypeContent {
  const d = DOMAIN[domain];
  const m = MODE[mode];
  return {
    essence: `${name} is ${d.self}, ${m.stance} ${d.gift} ${m.gift}`,
    shadowSide: `${d.shadow} ${m.shadow}`,
    growthEdge: `${d.growth} ${m.growth}`,
    inRelationship: `${d.love} ${m.love}`,
    atWork: `${d.work} ${m.work}`,
  };
}

/** Content for an archetype by its positional id (arch.flame.breaker). */
export function getArchetypeContent(id: string): ArchetypeContent | null {
  const a = ARCHETYPE_BY_ID[id];
  if (!a) return null;
  return composeContent(a.domain, a.mode, a.name);
}
