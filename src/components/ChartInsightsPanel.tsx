"use client";

/**
 * ChartInsightsPanel — the chart's analysis, grouped and collapsible.
 *
 * Nine sections used to render expanded and stacked: 13.6 screens of scroll and
 * ~2,700 words with no contents, no way to skip, and no sense of position. They
 * are now three named groups of collapsed rows, each row carrying a count, so
 * the tab opens as something you can read in one look and choose from.
 */

import { useState } from "react";

import {
  type ChartAnalysis,
  type ChartPattern,
  type CriticalDegree,
  type PlanetDignity,
  type TightAspect,
  type RetrogradeMarker,
  type Singleton,
  type MutualReception,
  type CombustStatus,
  type Planet,
} from "@/lib/chartAnalysis";
import {
  getPatternInterpretation,
  getCriticalDegreeInterpretation,
  getDignityInterpretation,
  getMoonPhaseInterpretation,
  getSectInterpretation,
  getElementBalanceInterpretation,
  getModalityBalanceInterpretation,
  getHouseEmphasisInterpretation,
  getAngularPlanetInterpretation,
  getRetrogradeInterpretation,
  getMutualReceptionInterpretation,
  getFinalDispositorInterpretation,
  getSingletonInterpretation,
  getUnaspectedInterpretation,
} from "@/lib/chartInsights";
import { SIGN_FULL } from "@/lib/knowledge";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ChartInsightsPanelProps {
  analysis: ChartAnalysis;
  planets: Planet[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert aspect type codes to plain English */
function aspectName(aspect: string): string {
  const map: Record<string, string> = {
    conjunction: "together",
    opposition: "opposite",
    trine: "flowing",
    square: "friction",
    sextile: "cooperative",
    quincunx: "awkward angle",
    semisquare: "mild friction",
    sesquiquadrate: "building tension",
    quintile: "creative link",
    biquintile: "creative talent",
  };
  return map[aspect.toLowerCase()] || aspect;
}

/** What a specific planet represents in one short phrase */
const PLANET_THEME: Record<string, string> = {
  Sun: "your identity",
  Moon: "your emotions",
  Mercury: "how you think and communicate",
  Venus: "what you love and value",
  Mars: "your drive and anger",
  Jupiter: "your sense of growth and luck",
  Saturn: "your discipline and fears",
  Uranus: "your need for freedom",
  Neptune: "your imagination and illusions",
  Pluto: "your deepest transformations",
  Chiron: "your core wound and healing gift",
  "North Node": "where you're growing toward",
  "South Node": "what you're growing away from",
  "Ascendant": "how people first see you",
  "Midheaven": "your public reputation",
};

/** Get a specific, meaningful description for a planet pair + aspect type */
function pairDescription(p1: string, p2: string, aspect: string): string {
  const key = [p1, p2].sort().join("+");
  const asp = aspect.toLowerCase();

  // Planet-pair specific descriptions — concrete, behavioral, recognizable
  const PAIR_DESCRIPTIONS: Record<string, Record<string, string>> = {
    "Mars+Sun": {
      conjunction: "You don't deliberate — you decide and move. People notice your energy the moment you walk into a room. You'd rather apologize later than ask permission first.",
      opposition: "You want things but then sabotage yourself chasing them the wrong way. You might start a project with fire and then pick a fight that derails it.",
      trine: "When you want something, you just go get it. There's no gap between deciding and doing — you make it look easy even when it's not.",
      square: "You get in your own way. You'll commit to something and then do the exact thing that makes it harder — like snapping at the person you need on your side.",
      sextile: "You're good at backing up your intentions with action, but only when you actually pause and think about your approach first.",
    },
    "Mercury+Moon": {
      conjunction: "You process feelings by talking them out. You might call a friend at midnight to untangle how you feel, or write in your notes app when you can't sleep. Your mood changes how you think.",
      opposition: "Your gut says one thing and your brain says another. You'll feel strongly about something but then talk yourself out of it — or vice versa. Decision-making gets exhausting.",
      trine: "People come to you when they need to feel heard, because you naturally put emotions into words. You're the friend who texts exactly the right thing.",
      square: "You say the wrong thing when you're emotional. Your mouth runs ahead of your feelings, and you end up explaining yourself a lot — \"that's not what I meant.\"",
      sextile: "You can talk through how you feel, but it takes conscious effort. Journaling or voice memos help you connect what you're thinking to what you're actually feeling.",
    },
    "Moon+Sun": {
      conjunction: "What you feel is what people see — you can't fake it. When you're happy it's obvious, when you're upset everyone knows. There's no poker face here.",
      opposition: "The person you are at work and the person you are at home feel like different people. You might feel one way inside but perform something completely different.",
      trine: "You're emotionally consistent — people trust you because your outside matches your inside. You don't have a lot of internal conflict about who you are.",
      square: "What you need to feel safe and what you're trying to become keep bumping into each other. Growth feels uncomfortable because it means leaving your comfort zone.",
      sextile: "You're mostly at peace with yourself, but you do your best when you actively check in with how you're feeling instead of just pushing through.",
    },
    "Mercury+Sun": {
      conjunction: "You identify with your ideas — when someone disagrees with your opinion, it can feel personal. You're probably known for being articulate or having strong takes.",
      opposition: "You sometimes say things that don't represent who you actually are. Or you'll have a clear thought but struggle to express it in a way that lands.",
      trine: "Explaining yourself comes naturally. You can usually find the right words, and people tend to understand what you're about pretty quickly.",
      square: "There's a gap between what you mean and what you say. Misunderstandings happen more than they should, and you spend energy clarifying yourself.",
      sextile: "You communicate well when you take a beat before speaking. Your best writing and conversations happen when you're intentional, not reactive.",
    },
    "Sun+Venus": {
      conjunction: "People are drawn to you — there's a warmth that makes others want to be around you. You probably care a lot about aesthetics, whether that's how you dress, your space, or your Instagram.",
      opposition: "What you find beautiful and what you project outward don't always match. You might attract people who like a version of you that isn't the real one.",
      trine: "You have good taste and it shows without you trying. People find you likeable and you make spaces, outfits, and playlists that just work.",
      square: "You want to be liked so badly it sometimes costs you. You might agree with people you don't actually agree with, or buy things you can't afford to look a certain way.",
      sextile: "Your charm comes through when you relax. You have taste and warmth, but it shows best when you stop trying to perform and just be yourself.",
    },
    "Moon+Venus": {
      conjunction: "Comfort and beauty are the same thing for you. A messy room genuinely affects your mood. You probably have a very specific way you like your bed, your coffee, your space.",
      opposition: "What makes you feel safe and what you're attracted to are different things. You might pick partners who excite you but don't comfort you, or vice versa.",
      trine: "You create warmth wherever you go. Your home probably feels inviting, you give thoughtful gifts, and people relax around you.",
      square: "Your emotional needs and your romantic desires don't always agree. You might crave closeness but then feel suffocated, or want independence but feel lonely.",
      sextile: "Your relationships and emotional life support each other when you put care into both. Date nights, cooking together, shared rituals — small things matter a lot.",
    },
    "Jupiter+Saturn": {
      conjunction: "You dream big but always have a plan B. You're the person who researches every angle before committing, then goes all in. Cautious optimism is your default.",
      opposition: "Part of you wants to take the leap and part of you is making a spreadsheet about why you shouldn't. Every big decision feels like a tug-of-war.",
      trine: "You're naturally good at turning big ideas into real things. You can see the vision AND the steps to get there, which makes you surprisingly effective.",
      square: "You either overcommit and burn out, or overthink and miss the window. Finding the sweet spot between ambition and realism is your ongoing project.",
      sextile: "When you deliberately balance your optimism with your planning, you're unstoppable. But you have to consciously bring both to the table.",
    },
    "Neptune+Uranus": {
      conjunction: "This is a generational marker — your age group shares a blend of idealism and disruption. You grew up questioning systems and imagining alternatives that older generations hadn't considered.",
      opposition: "Your generation feels pulled between radical change and dreamy idealism. You want to fix the world but can't always agree on the vision.",
      trine: "Your generation combines innovation with imagination in a way that feels natural. New technology and creative vision go hand in hand for your age group.",
      square: "Your generation inherited tension between idealism and rebellion. You want change but the direction isn't always clear, which creates collective restlessness.",
      sextile: "Your generation has an easier time blending tech-forward thinking with compassion when you're intentional about it.",
    },
    "Chiron+Venus": {
      conjunction: "Love is where your biggest hurt lives. You might pick people who confirm your worst fears about yourself, or avoid vulnerability entirely because it costs too much.",
      opposition: "You're drawn to people or things that trigger your oldest wound. The partner you can't stop thinking about is usually the one who pokes at something unresolved.",
      trine: "Art, beauty, and genuine connection are how you heal. A good song, a kind gesture, or a moment of real intimacy can undo years of guardedness for you.",
      square: "Relationships bring up old pain whether you want them to or not. You might push people away when they get close, or stay in bad situations too long because leaving feels worse.",
      sextile: "Love can be genuinely healing for you, but only when you choose people who are safe enough to be vulnerable with. It doesn't happen by accident.",
    },
    "Mars+Venus": {
      conjunction: "When you want someone or something, you go after it hard. There's no slow burn for you — attraction and action happen at the same time.",
      opposition: "What you want and how you pursue it are at odds. You might come on too strong when you should be gentle, or hold back when you should make a move.",
      trine: "Your romantic and sexual energy are aligned. You flirt naturally, pursue gracefully, and generally know when to push and when to pull back.",
      square: "Passion creates drama in your love life. Arguments that turn into makeups, attractions that don't make logical sense, relationships that run hot and cold.",
      sextile: "When you balance desire with tenderness, your relationships thrive. The effort is in remembering that what you want and what you need aren't always the same.",
    },
    "North Node+South Node": {
      opposition: "This is built into every chart — it's the tension between your familiar patterns and where life is pushing you to grow. The South Node is your comfort zone, the North Node is your homework.",
      conjunction: "Your past and future direction are unusually aligned. The skills you already have are pointing you where you need to go.",
    },
    "Mars+Saturn": {
      conjunction: "You have incredible endurance but you feel blocked a lot. It's like driving with the parking brake on — all that power, held back. When you finally let it go, you're unstoppable.",
      opposition: "You alternate between forcing things and giving up. The middle ground — steady, patient effort — is what works best but feels hardest.",
      trine: "You're naturally disciplined about effort. You can train for months, grind through tedious work, and still show up the next day. Other people burn out where you keep going.",
      square: "You feel frustrated constantly — like everything takes twice as long as it should. Authority figures push your buttons. But this friction builds real toughness over time.",
      sextile: "You work best with structure. Give yourself deadlines, routines, and clear goals and your energy flows. Without them you feel scattered.",
    },
    "Jupiter+Sun": {
      conjunction: "You naturally take up space. People see you as confident, generous, maybe a little much. You think big and expect things to work out — and they often do.",
      opposition: "You inflate yourself in some areas and deflate in others. You might oversell your abilities, or feel like a fraud despite real accomplishments.",
      trine: "Good things tend to find you. Not because you're lucky, but because your optimism makes you say yes to things others pass on — and it pays off.",
      square: "You overcommit, overpromise, or overestimate what you can handle. Your ambition writes checks your schedule can't cash, and you end up stretched thin.",
      sextile: "Opportunities come when you actively put yourself out there. You have to show up for the luck to find you, but when you do, things tend to expand.",
    },
    "Moon+Saturn": {
      conjunction: "You learned early that feelings weren't always welcome. You're probably the one who holds it together while everyone else falls apart — but it costs you.",
      opposition: "You feel guilty about your own needs. Taking a sick day, asking for help, crying in front of someone — it all feels like weakness, even though it isn't.",
      trine: "You handle hard times better than most. While others spiral, you get quiet and figure it out. People trust you in a crisis because you're steady.",
      square: "You suppress your feelings until they come out sideways — as control, criticism, or withdrawing. Learning to say 'I need something' is your ongoing edge.",
      sextile: "You can access your emotions when you create space for them. Therapy, journaling, long walks — you need a structured container to let yourself feel.",
    },
    "Mercury+Venus": {
      conjunction: "You have a way with words when it comes to aesthetics, compliments, and smoothing things over. Your texts are well-crafted. You probably agonize over the right emoji.",
      opposition: "What you think is right and what you want are in tension. You'll know a relationship isn't working but keep it going because it feels good.",
      trine: "You say sweet things naturally and mean them. You're good at making people feel appreciated, and your taste in music, art, and words tends to be solid.",
      square: "You sugarcoat things when you should be honest, or blurt out something harsh when you meant to be kind. Diplomacy is a skill you're still sharpening.",
      sextile: "When you take time to choose your words, you communicate with both honesty and grace. Writing a card, picking the right song — small gestures are your strength.",
    },
    "Pluto+Sun": {
      conjunction: "You're intense and people feel it. You don't do small talk well, but you're the person others come to when they need someone who won't flinch at the hard stuff.",
      opposition: "Power dynamics follow you. You either take control or give it away completely — finding equal footing is the work.",
      trine: "You reinvent yourself periodically and it doesn't break you. Where others fear change, you shed old versions of yourself and keep going.",
      square: "Control is your thing. You either grip too tight or rebel against anyone who tries to control you. Trust doesn't come easy, but when it does it's total.",
      sextile: "You handle deep change well when you see it coming. Planned transitions — new city, new career, ending something that isn't working — suit you.",
    },
    "Moon+Pluto": {
      conjunction: "Your feelings don't have a dimmer switch — they're either off or all the way up. You notice what people aren't saying, you sense the undercurrent in a room, and you can't do surface-level anything.",
      opposition: "You swing between needing intense closeness and needing total space. Partners may feel like you're pulling them in and then shutting them out.",
      trine: "You recover from emotional hits that would flatten other people. Breakups, loss, betrayal — you go deep into the pain and come back stronger.",
      square: "Jealousy, possessiveness, or fear of abandonment come up more than you'd like. The feelings are real but they can take over if you don't catch them.",
      sextile: "Deep emotional processing comes naturally when you give yourself the tools — therapy, honest conversations, sitting with discomfort instead of running from it.",
    },
    "Mars+Pluto": {
      conjunction: "When you commit to something, your intensity is almost scary. You don't half-do anything. This makes you incredibly effective but can intimidate people around you.",
      opposition: "You clash with authority or anyone who tries to control you. Power struggles at work, with family, in relationships — they keep showing up until you find a healthier way to handle them.",
      trine: "You can endure things that would break most people. Long-haul projects, grueling physical challenges, emotional endurance — you have reserves others don't.",
      square: "Rage lives closer to the surface than you'd like. You may not show it, but when you finally blow up, it surprises everyone including you.",
      sextile: "Your intensity is an asset when channeled deliberately. High-stakes situations, competitive environments, and difficult projects actually bring out your best.",
    },
    "Neptune+Sun": {
      conjunction: "You're highly empathetic but your sense of self can be slippery. You absorb other people's moods, and sometimes you're not sure which feelings are yours.",
      opposition: "You idealize things — people, jobs, places — and then feel crushed when reality doesn't match. Learning to love what's real instead of what's imagined is key.",
      trine: "You're naturally creative and spiritually attuned. Music, art, nature, meditation — these aren't hobbies for you, they're how you stay connected to yourself.",
      square: "You struggle with escapism. Whether it's daydreaming, scrolling, drinking, or just checking out — you retreat when reality gets uncomfortable.",
      sextile: "Your imagination enhances your life when you ground it in something real — a creative project, a spiritual practice, helping someone tangibly.",
    },
    "Moon+Neptune": {
      conjunction: "You feel everything — other people's sadness, the mood of a room, the energy of a song. It's beautiful but exhausting. You need a lot of alone time to decompress.",
      opposition: "You confuse your feelings with other people's feelings, or with what you wish you felt. Figuring out what YOU actually need, separate from everyone else, is ongoing work.",
      trine: "Your intuition is genuinely useful. You get gut feelings about people and situations that usually turn out right. Trusting that instinct serves you well.",
      square: "You absorb emotions like a sponge and then don't know why you're anxious or sad. Boundaries — emotional ones, not just physical — are essential for you.",
      sextile: "Your intuition works well when you pair it with something grounding — a walk, a journal entry, a conversation with someone practical.",
    },
    "Saturn+Sun": {
      conjunction: "You had to grow up fast. You might have been the responsible kid, the one who held things together. You're capable as hell but you rarely feel like it's enough.",
      opposition: "You want to be taken seriously but feel like the rules are stacked against you. Authority figures are either mentors or obstacles — rarely neutral.",
      trine: "You build things that last. Your work ethic is quiet and steady, and by 40 you'll have something to show for all those years of showing up.",
      square: "You're your own harshest critic. No matter what you accomplish, there's a voice that says it should have been more, sooner, better. That voice is lying.",
      sextile: "Discipline and ambition serve you when you use them consciously, but you have to actively choose rest too. You're not a machine, even if you sometimes try to be.",
    },
    "Mercury+Mars": {
      conjunction: "You're sharp-tongued and quick. You win arguments, finish other people's sentences, and get impatient when someone takes forever to make their point.",
      opposition: "You think one thing and do another. Or you'll have a plan and then act impulsively in the opposite direction. Your brain and your body are on different schedules.",
      trine: "You think fast and act fast. You're good in emergencies, great at debates, and you can make decisions under pressure without freezing.",
      square: "You argue. A lot. Not always out loud — sometimes it's internal — but your mind is always sparring with something. Learning when to engage and when to let it go is key.",
      sextile: "You communicate best when the stakes are real. Small talk bores you, but give you something meaningful to debate or solve and you come alive.",
    },
    "Jupiter+Venus": {
      conjunction: "You love big. Big gestures, big pleasures, big generosity. You're the one who picks up the check, plans the party, and gives gifts people actually want.",
      opposition: "You want everything and struggle to prioritize. The fancy dinner AND the savings account, the exciting person AND the stable one. Choosing feels like losing.",
      trine: "Good things come to you in love and money more easily than most. Not because you're passive, but because you attract abundance naturally.",
      square: "You overdo it. Too much spending, too much eating, too much saying yes. Moderation isn't fun for you, but it's the thing that keeps the good stuff sustainable.",
      sextile: "Generosity pays off for you when it's deliberate. Random acts of kindness, thoughtful gifts, hosting friends — putting love into action brings it back to you.",
    },
    "Chiron+Sun": {
      conjunction: "Your wound is visible — it's part of how people know you. You might be the person who overcame something hard and now others come to you because they can tell you've been there.",
      opposition: "You attract situations that poke at your oldest insecurity. Jobs, people, and challenges keep circling back to the same sore spot until you deal with it.",
      trine: "Your pain made you wise. Not in a 'suffering is good' way, but in a real way — you understand something about life that people who've had it easy just don't.",
      square: "Your wound and your ambitions keep colliding. You'll be about to level up and then the old story kicks in — 'who am I to do this?' It's the wall you have to keep climbing.",
      sextile: "Healing happens through conscious effort — therapy, honest reflection, creative work that processes what you've been through.",
    },
    "Chiron+Moon": {
      conjunction: "There's an old ache in how you were nurtured — or weren't. You might over-give to others because no one gave that to you, or you might struggle to accept care because it feels unsafe.",
      opposition: "Your emotional needs and your pain are tangled together. You want comfort but the act of asking for it triggers the wound.",
      trine: "Caring for others is how you heal. You're naturally good at emotional support, and giving it repairs something in you too.",
      square: "Vulnerability feels dangerous. Being seen when you're not okay, crying in front of someone, admitting you need help — it all feels like exposure.",
      sextile: "You heal through emotional honesty, but you have to choose it actively. Safe relationships and intentional emotional risks are what move you forward.",
    },
    "Saturn+Venus": {
      conjunction: "You take love seriously — maybe too seriously. You might feel like you have to earn affection, or that relationships require constant work to be real.",
      opposition: "You want connection but duty keeps getting in the way. You cancel plans for work, choose responsibility over fun, and then wonder why you feel lonely.",
      trine: "You build real, lasting relationships. Not the flashy kind — the kind where someone shows up for you at 3am or stays through the boring years.",
      square: "You feel unlovable sometimes, even when evidence says otherwise. You might stay in bad relationships too long because you think you can't do better, or avoid them entirely.",
      sextile: "Love gets better as you get older. Your relationships improve with time and intention — the steady, reliable kind of love suits you.",
    },
    "Uranus+Sun": {
      conjunction: "You can't do normal. The 9-to-5, the expected path, the way everyone else does it — it physically doesn't work for you. You need your own lane.",
      opposition: "You want freedom AND belonging, which creates whiplash. You commit to something and then feel trapped, or you stay free and feel untethered.",
      trine: "Your weirdness is your strength. The things that made you feel different growing up become your biggest assets as an adult.",
      square: "You blow things up when they get too stable. Quitting a good job, ending a fine relationship, moving across the country on a whim — you disrupt your own life.",
      sextile: "You thrive when you build some freedom into your structure. Freelance schedules, unconventional arrangements, flex time — you need room to breathe.",
    },
    "Mercury+Saturn": {
      conjunction: "You think carefully and thoroughly. You're not the fastest speaker but when you talk, it's well-considered. You might have felt like a slow learner early on, but you outpace everyone over time.",
      opposition: "Doubt undercuts your ideas. You'll have a good thought and then immediately find three reasons it won't work. Analysis paralysis is real for you.",
      trine: "You're a natural planner. Lists, outlines, pro-con charts — you think in organized structures and it serves you well in school, work, and life.",
      square: "You second-guess yourself constantly. Your inner critic edits every thought before it leaves your mouth, which makes you careful but also exhaustingly cautious.",
      sextile: "Clear thinking comes when you give yourself structure — time-blocking, outlines, studying. An organized environment unlocks your best ideas.",
    },
    "Jupiter+Moon": {
      conjunction: "You feel everything BIG. Joy is ecstatic, sadness is devastating, hope is boundless. Your emotional range is wider than most people's and you need room for all of it.",
      opposition: "You swing between emotional excess and emotional distance. One day you're adopting every stray cat, the next you need everyone to leave you alone.",
      trine: "You bounce back from hard times better than most. Your emotional resilience is genuine — you grieve, then find something to be grateful for, then keep going.",
      square: "You make emotional promises you can't keep. You'll commit to helping everyone and then feel overwhelmed, or your optimism covers up real problems that need attention.",
      sextile: "Your emotional life expands when you actively nurture it — travel, new experiences, learning. Stagnation is what makes you moody, not the hard stuff.",
    },
  };

  const pairDesc = PAIR_DESCRIPTIONS[key]?.[asp];
  if (pairDesc) return pairDesc;

  // Fallback: build a planet-specific description with concrete language
  const t1 = PLANET_THEME[p1] || p1.toLowerCase();
  const t2 = PLANET_THEME[p2] || p2.toLowerCase();

  const aspectVerbs: Record<string, string> = {
    conjunction: `The part of you that handles ${t1} and the part that handles ${t2} are wired together — you can't activate one without the other showing up.`,
    opposition: `${capitalize(t1)} and ${t2} are on opposite ends of your chart. In practice, you swing between the two — leaning into one means neglecting the other for a while.`,
    trine: `${capitalize(t1)} and ${t2} work together without you having to think about it. This is a natural strength you probably take for granted.`,
    square: `${capitalize(t1)} and ${t2} are in constant friction. It's uncomfortable but it's also what pushes you to actually do something about both.`,
    sextile: `${capitalize(t1)} and ${t2} can support each other, but only when you actively bring them together. It's a skill, not an accident.`,
    quincunx: `${capitalize(t1)} and ${t2} don't naturally understand each other. You have to keep making small adjustments — it never fully clicks, but you get better at it.`,
  };

  return aspectVerbs[asp] || `${capitalize(t1)} and ${t2} are linked in your chart — each one colors how the other shows up in your life.`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function elementColor(element: string): string {
  switch (element) {
    case "fire": return "text-terracotta";
    case "earth": return "text-sage";
    case "air": return "text-amber";
    case "water": return "text-lavender";
    default: return "text-foreground";
  }
}

function signElement(sign: string): string {
  if (["Ari", "Leo", "Sag"].includes(sign)) return "fire";
  if (["Tau", "Vir", "Cap"].includes(sign)) return "earth";
  if (["Gem", "Lib", "Aqu"].includes(sign)) return "air";
  return "water";
}

function ordinalHouse(n: number): string {
  const ordinals: Record<number, string> = {
    1: "1st", 2: "2nd", 3: "3rd", 4: "4th", 5: "5th", 6: "6th",
    7: "7th", 8: "8th", 9: "9th", 10: "10th", 11: "11th", 12: "12th",
  };
  return ordinals[n] || `${n}th`;
}

function signName(abbr: string): string {
  return SIGN_FULL[abbr] || abbr;
}

// ─── Section Header ───────────────────────────────────────────────────────────

/**
 * The explanatory line under a section's title.
 *
 * It no longer renders the title. Each section is now inside an accordion whose
 * button IS the heading — printing the title again a few pixels below it read
 * as a mistake. `title` stays in the signature because it is what the accordion
 * is labelled with at the call site in the panel below, and keeping the two in
 * one place is what stops them drifting apart.
 */
function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  void title;
  if (!subtitle) return null;
  return (
    <p className="text-sm mb-4" style={{ color: "var(--insight-muted)" }}>
      {subtitle}
    </p>
  );
}

/**
 * One collapsible section.
 *
 * Insights used to render all nine sections expanded, one after another: 13.6
 * screens of continuous scroll and about 2,700 words, with no way to see what
 * was in it, skip ahead, or tell how far in you were. Closed by default turns
 * that into a one-screen contents page you choose from.
 *
 * The count on the right is what makes a closed row worth reading — "3
 * patterns", "2 retrograde" tells you whether it is worth opening. A section
 * with nothing in it never gets rendered at all, so a row on screen always has
 * something behind it.
 */
function InsightSection({
  title,
  count,
  defaultOpen = false,
  children,
}: {
  title: string;
  count?: string | null;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="mb-2.5">
      <h2>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="w-full flex items-center gap-3 text-left transition-colors"
          style={{
            padding: "14px 16px",
            borderRadius: 14,
            background: "var(--background-card)",
            border: "0.5px solid var(--border-card)",
          }}
        >
          <span
            className="flex-1 min-w-0 text-balance"
            style={{ fontFamily: "var(--font-heading)", fontSize: 17, color: "var(--foreground)" }}
          >
            {title}
          </span>
          {count ? (
            <span
              className="shrink-0 text-[10px] font-semibold uppercase"
              style={{ letterSpacing: "0.08em", color: "var(--brass)" }}
            >
              {count}
            </span>
          ) : null}
          <svg
            aria-hidden="true"
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="var(--foreground-muted)" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
            className="shrink-0 transition-transform"
            style={{ transform: open ? "rotate(180deg)" : "none" }}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </h2>
      {open ? <div className="pt-4 px-0.5">{children}</div> : null}
    </section>
  );
}

// ─── Insight Card ─────────────────────────────────────────────────────────────

function InsightCard({ tone, eyebrow, title, subtitle, children }: {
  tone: "harmony" | "tension" | "neutral";
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const accent = tone === "harmony" ? "var(--insight-harmony)" : tone === "tension" ? "var(--insight-tension)" : "var(--insight-neutral)";
  return (
    <div style={{ background: "var(--insight-card)", borderRadius: 16, borderLeft: `3px solid ${accent}`, boxShadow: "var(--insight-shadow)", padding: "18px 20px", marginBottom: 14 }}>
      <p style={{ color: accent, fontFamily: "var(--font-ui)", fontSize: 11, letterSpacing: "0.12em", fontWeight: 700, textTransform: "uppercase", margin: 0, marginBottom: 8 }}>{eyebrow}</p>
      <div style={{ marginBottom: 8, lineHeight: 1.2 }}>
        <span style={{ fontFamily: "var(--font-heading)", fontSize: 21, color: "var(--insight-ink)" }}>{title}</span>
        {subtitle ? <span style={{ marginLeft: 8, fontSize: 13, color: "var(--insight-muted)" }}>{subtitle}</span> : null}
      </div>
      <div style={{ color: "var(--insight-body)", fontSize: 14.5, lineHeight: 1.6, whiteSpace: "pre-line" }}>{children}</div>
    </div>
  );
}

// ─── 1. Chart Patterns ────────────────────────────────────────────────────────

/* ─── Plain-language glossaries ─── */

const PLANET_MEANING: Record<string, string> = {
  "Sun": "your core identity and ego",
  "Moon": "your emotions and inner needs",
  "Mercury": "how you think and communicate",
  "Venus": "how you love and what you value",
  "Mars": "your drive, anger, and ambition",
  "Jupiter": "where you seek growth and abundance",
  "Saturn": "where you face limits and build discipline",
  "Uranus": "where you rebel and seek freedom",
  "Neptune": "your imagination, spirituality, and blind spots",
  "Pluto": "where you transform and confront power",
  "Chiron": "your deepest wound and how you heal others through it",
  "North Node": "the direction your life is growing toward",
  "South Node": "old patterns you're learning to move beyond",
  "Lilith": "your raw, unfiltered side that refuses to conform",
};

const SIGN_MEANING: Record<string, string> = {
  "Aries": "bold, impulsive, action-first energy",
  "Taurus": "steady, sensual, security-seeking energy",
  "Gemini": "curious, restless, quick-thinking energy",
  "Cancer": "nurturing, protective, emotionally deep energy",
  "Leo": "expressive, proud, attention-seeking energy",
  "Virgo": "analytical, service-oriented, perfectionist energy",
  "Libra": "harmonizing, relationship-focused, justice-seeking energy",
  "Scorpio": "intense, secretive, all-or-nothing energy",
  "Sagittarius": "adventurous, philosophical, freedom-loving energy",
  "Capricorn": "ambitious, disciplined, legacy-building energy",
  "Aquarius": "unconventional, humanitarian, big-picture energy",
  "Pisces": "intuitive, compassionate, boundary-dissolving energy",
};

const HOUSE_MEANING: Record<number, string> = {
  1: "your identity and how you present yourself",
  2: "your money, possessions, and self-worth",
  3: "your communication, siblings, and daily environment",
  4: "your home, family, and emotional roots",
  5: "your creativity, romance, and self-expression",
  6: "your daily routines, health, and work habits",
  7: "your partnerships and one-on-one relationships",
  8: "shared resources, intimacy, and transformation",
  9: "your beliefs, higher learning, and long-distance travel",
  10: "your career, public reputation, and legacy",
  11: "your friendships, communities, and hopes for the future",
  12: "your subconscious, solitude, and hidden patterns",
};

/** What does it mean to have no planets in this house? */
function emptyHouseFeeling(house: number): string {
  const feelings: Record<number, string> = {
    1: "You probably don't overthink how you come across — your self-image isn't a constant source of stress. You just are who you are without obsessing over first impressions.",
    2: "Money and possessions aren't a major psychological battleground for you. You handle finances without it dominating your emotional world.",
    3: "Everyday communication and sibling dynamics aren't where your big life lessons show up. You talk, text, and get around your neighborhood without much inner turmoil about it.",
    4: "Home and family life may feel relatively straightforward. That doesn't mean no family drama — but it's not the central stage where your deepest growth happens.",
    5: "Romance, creativity, and fun aren't areas of intense inner conflict. You enjoy them when they show up, but they don't consume you or create constant tension.",
    6: "Your daily routines and health habits probably run on autopilot. You're not someone who agonizes endlessly over diet, exercise, or work systems — you just do them.",
    7: "Partnerships aren't the area where your chart piles on the pressure. Relationships still matter, but they're not the arena of your biggest life lessons.",
    8: "Deep intimacy, shared money, and transformation don't demand constant attention. You can navigate vulnerable moments without it feeling like your entire world is shifting.",
    9: "Big-picture beliefs, travel, and higher learning aren't where your chart focuses its energy. You explore ideas and places without it becoming an existential quest.",
    10: "Career and public image aren't your chart's main event. You can build a professional life without it becoming the defining drama of your existence.",
    11: "Friendships and community involvement flow without a lot of inner conflict. You connect with groups naturally, without it being a major source of anxiety or striving.",
    12: "Your subconscious and inner world aren't where the chart piles on complexity. You sleep, dream, and process emotions without being constantly pulled into deep psychological territory.",
  };
  return feelings[house] || "";
}

/** What does a wound (Chiron) in this sign actually feel like? */
const CHIRON_IN_SIGN: Record<string, string> = {
  "Aries": "you doubt your right to take up space, assert yourself, or put yourself first — so you either hold back entirely or overcompensate with aggression",
  "Taurus": "you feel insecure about your worth, your body, or your ability to provide for yourself — no amount of money or stability fully quiets that anxiety",
  "Gemini": "you feel like your ideas aren't smart enough or your voice doesn't matter — you might over-explain, go quiet in groups, or feel misunderstood when you speak",
  "Cancer": "you feel like you never quite had a safe emotional home — so you either over-nurture everyone else or struggle to let people take care of you",
  "Leo": "you're terrified of being seen AND terrified of being invisible — you want recognition but feel deeply vulnerable when you get it",
  "Virgo": "you're a perfectionist who's never satisfied with your own work — you hold yourself to impossible standards and beat yourself up for every flaw",
  "Libra": "you bend over backward to keep the peace and make others happy, often at the cost of your own needs — relationships feel like the place where you lose yourself",
  "Scorpio": "you've been hurt by betrayal or loss and now you struggle to trust — you want deep connection but you also guard yourself intensely",
  "Sagittarius": "you question whether life has meaning, or whether your beliefs are right — you might swing between blind faith and total cynicism",
  "Capricorn": "you feel like you're never successful enough, never taken seriously enough — you work twice as hard as everyone else and still feel like a fraud",
  "Aquarius": "you feel like you don't fit in anywhere — you want community but you also feel fundamentally different from everyone around you",
  "Pisces": "your boundaries dissolve too easily — you absorb other people's pain, escape into fantasy, or feel overwhelmed by the suffering in the world",
};

/** What does a wound (Chiron) showing up in this house look like in daily life? */
const CHIRON_IN_HOUSE: Record<number, string> = {
  1: "This shows up in how you present yourself to the world — you might feel fundamentally flawed in some visible way, or like people see through you.",
  2: "This shows up around money and self-worth — you might undercharge, feel guilty about wanting nice things, or tie your value to what you earn.",
  3: "This shows up in everyday conversations — you might feel talked over, misunderstood, or like your ideas aren't taken seriously by siblings or peers.",
  4: "This shows up in your home and family life — there may be old family pain you carry, or you struggle to feel truly at home anywhere.",
  5: "This shows up when you try to create, perform, or fall in love — you hold back because you're afraid it won't be good enough, or that you'll be rejected for who you really are.",
  6: "This shows up in your daily work and health — you might overwork yourself, obsess over health anxieties, or feel like you're never doing enough.",
  7: "This shows up in your closest relationships — you might attract partners who mirror your wound, or struggle with the fear that you're too much or not enough for someone.",
  8: "This shows up around intimacy, shared finances, and deep trust — you might struggle to fully let someone in, or have complicated dynamics around owing and being owed.",
  9: "This shows up around belief systems, education, and travel — you might feel like you missed out on something others got, or question whether your worldview is valid.",
  10: "This shows up in your career and public reputation — you might feel like an imposter, or like your achievements never fully count.",
  11: "This shows up in friendships and group settings — you might feel like the outsider, or struggle to believe you truly belong.",
  12: "This shows up in your inner life — you might carry unnamed grief, feel haunted by something you can't quite identify, or struggle with self-sabotage.",
};

/** What does a specific planet feel like when it's under pressure (as a t-square apex)? Keyed by planet, uses sign+house for specificity. */
function apexFeeling(planet: string, sign: string, house: number | null): string {
  if (planet === "Chiron") {
    const signFeel = CHIRON_IN_SIGN[sign] || "you carry a wound that's hard to name but always present";
    const houseFeel = CHIRON_IN_HOUSE[house || 0] || "";
    return `Because Chiron is your apex, the core of this pattern is a wound: ${signFeel}. ${houseFeel} The push-pull from the other two planets keeps poking this sore spot — but that constant pressure is also what forces you to heal. And once you work through it, you become the person others come to when they're struggling with the same thing.`;
  }
  if (planet === "Moon") {
    const hm = house ? HOUSE_MEANING[house] : "";
    return `Because your Moon is the apex, your emotional life absorbs all the pressure. You might feel emotionally squeezed — like your needs are always complicated by competing demands${hm ? `, especially around ${hm}` : ""}. ${sign === "Scorpio" ? "With Moon in Scorpio, you feel everything intensely and don't let anyone see it." : sign === "Cancer" ? "With Moon in Cancer, you absorb everyone else's emotions on top of your own." : sign === "Capricorn" ? "With Moon in Capricorn, you try to tough it out and handle your feelings like a task — but they don't work that way." : sign === "Aries" ? "With Moon in Aries, you react first and process later — the emotional pressure comes out as flashes of anger or impatience." : `With Moon in ${sign}, your emotional responses take on a ${(SIGN_MEANING[sign] || "").split(",")[0] || sign.toLowerCase()} quality.`} You need to actively protect your peace because this pattern won't give it to you for free.`;
  }
  if (planet === "Sun") {
    const hm = house ? HOUSE_MEANING[house] : "";
    return `Because your Sun is the apex, your identity is under constant pressure. You might struggle with who you really are versus who the competing demands in your life want you to be${hm ? `, especially around ${hm}` : ""}. It's exhausting — but it forges an unusually strong, tested sense of self. People who haven't earned their identity the hard way can't always relate to the depth you bring.`;
  }
  if (planet === "Mars") {
    const hm = house ? HOUSE_MEANING[house] : "";
    return `Because Mars is the apex, your drive and temper take the hit. You might swing between pushing too hard and burning out, or between aggression and paralysis${hm ? `, particularly around ${hm}` : ""}. ${sign === "Scorpio" ? "Mars in Scorpio means this pressure goes underground — you hold it in until it erupts." : sign === "Aries" ? "Mars in Aries means you act first and deal with consequences later — the pressure makes you impulsive but also incredibly fast." : sign === "Capricorn" ? "Mars in Capricorn means you channel the pressure into relentless ambition — you won't stop until you've built something undeniable." : `Mars in ${sign} colors this with ${(SIGN_MEANING[sign] || "").split(",")[0] || sign.toLowerCase()} energy.`} The friction makes you restless but also genuinely driven in a way that coasters never are.`;
  }
  if (planet === "Venus") {
    const hm = house ? HOUSE_MEANING[house] : "";
    return `Because Venus is the apex, your relationships and values absorb all the tension. You might feel like love is always complicated — like you're choosing between what you want and what you think you should want${hm ? `, especially in ${hm}` : ""}. The friction refines your taste and deepens your capacity for love, but it rarely feels easy.`;
  }
  if (planet === "Mercury") {
    const hm = house ? HOUSE_MEANING[house] : "";
    return `Because Mercury is the apex, your mind never rests. You might overthink, second-guess yourself, or feel like your words are always being tested${hm ? `, particularly around ${hm}` : ""}. The upside: the constant pressure makes you a sharper, more nuanced communicator and thinker than most people will ever be.`;
  }
  if (planet === "Saturn") {
    const hm = house ? HOUSE_MEANING[house] : "";
    return `Because Saturn is the apex, you feel like you're always hitting walls and having to prove yourself${hm ? `, especially around ${hm}` : ""}. The pressure from the other two planets makes you disciplined out of necessity, not choice. It's heavy — but it builds real, lasting competence that people who had it easy simply don't have.`;
  }
  if (planet === "Jupiter") {
    const hm = house ? HOUSE_MEANING[house] : "";
    return `Because Jupiter is the apex, your sense of meaning and growth absorbs the pressure. You might overcommit, over-promise, or feel like you can never expand enough${hm ? ` in the area of ${hm}` : ""}. The friction pushes you toward genuine wisdom rather than surface-level optimism — you earn your beliefs.`;
  }
  if (planet === "Pluto") {
    const hm = house ? HOUSE_MEANING[house] : "";
    return `Because Pluto is the apex, power dynamics and transformation are your pressure point${hm ? `, concentrated around ${hm}` : ""}. You might feel like you're constantly being forced to let go of control or confront uncomfortable truths. The friction gives you unusual psychological depth — you understand what most people avoid looking at.`;
  }
  if (planet === "Neptune") {
    const hm = house ? HOUSE_MEANING[house] : "";
    return `Because Neptune is the apex, your ideals and imagination absorb the hit${hm ? `, especially around ${hm}` : ""}. You might struggle with disillusionment when reality doesn't match your vision, or escape into fantasy when the tension gets too much. But the friction also gives you extraordinary creative sensitivity and spiritual depth.`;
  }
  if (planet === "Uranus") {
    const hm = house ? HOUSE_MEANING[house] : "";
    return `Because Uranus is the apex, your need for freedom and independence takes the pressure${hm ? `, especially in ${hm}` : ""}. You might feel like you're constantly being forced to break free or do things differently, even when you'd rather fit in. The friction makes you a natural innovator who can't settle for conventional.`;
  }
  if (planet === "North Node") {
    const hm = house ? HOUSE_MEANING[house] : "";
    return `Because your North Node is the apex, your life direction is being constantly pushed by the other two planets${hm ? `, pulling you toward growth in ${hm}` : ""}. It can feel like the universe won't let you stay comfortable — every time you settle, something disrupts it and nudges you forward.`;
  }
  if (planet === "South Node") {
    const hm = house ? HOUSE_MEANING[house] : "";
    return `Because your South Node is the apex, old habits and patterns absorb the tension${hm ? `, particularly around ${hm}` : ""}. You might keep falling back into familiar behaviors even as life pressures you to evolve. The friction is ultimately trying to move you beyond what's comfortable.`;
  }
  return `The tension concentrates here — it's uncomfortable, but it's where you develop real competence and depth over time.`;
}

/** What does having a pile-up of planets in this sign actually feel like in daily life? */
function stelliumSignFeeling(sign: string, planets: string[]): string {
  const count = planets.length;
  const SIGN_FEEL: Record<string, string> = {
    "Aries": `Having ${count} planets in Aries means you're wired to go first, move fast, and figure things out by doing — not planning. You're impatient with slowness and hate being told to wait. You probably start a lot of projects, speak before you think, and get bored once the novelty wears off. But you also have incredible courage and an ability to act when everyone else is frozen.`,
    "Taurus": `Having ${count} planets in Taurus means comfort, stability, and the physical world are absolutely central to who you are. You need things you can touch, taste, and rely on. Change makes you anxious, not because you're weak, but because your entire system is built for consistency. You're probably stubborn in ways that frustrate people — but also loyal and dependable in ways they can't live without.`,
    "Gemini": `Having ${count} planets in Gemini means your mind is always running. You're curious about everything, bored by repetition, and probably juggling multiple interests, projects, or conversations at once. People might call you scattered — but you're actually processing more information than most people can handle. You learn by talking, and you need constant mental stimulation or you check out.`,
    "Cancer": `Having ${count} planets in Cancer means your emotional life runs the show. You feel things deeply, remember everything, and your home and family are the center of your universe. You might come across as tough or funny on the outside, but inside you're processing everyone's emotions — including your own. You need a safe space to retreat to, and you'll build one no matter where you are.`,
    "Leo": `Having ${count} planets in Leo means self-expression, recognition, and creativity are non-negotiable for you. You need to be seen, appreciated, and doing something that feels meaningful and special. This isn't vanity — it's your actual life force. When you're not creating or performing or leading, something dies inside. You're generous, dramatic, and impossible to ignore.`,
    "Virgo": `Having ${count} planets in Virgo means your mind is always analyzing, organizing, and trying to improve things. You notice what's wrong before you notice what's right. You hold yourself to impossibly high standards, and you probably do the same to others (even if you don't say it out loud). You're the person who quietly fixes things, notices the details, and feels guilty when you rest.`,
    "Libra": `Having ${count} planets in Libra means relationships and fairness are the center of your world. You think in pairs, you hate conflict, and you can see every side of every argument — which makes decisions agonizing. You need beauty, harmony, and partnership to feel whole. People might think you're indecisive, but really you're weighing every option because you genuinely care about getting it right.`,
    "Scorpio": `Having ${count} planets in Scorpio means you experience life at maximum intensity. You don't do anything halfway — when you're in, you're ALL in, and when you're done, you're gone. You see through people's facades and you can't stand anything fake or shallow. Trust is everything to you, and betrayal is unforgivable. You're private, powerful, and transforming constantly — even when it hurts.`,
    "Sagittarius": `Having ${count} planets in Sagittarius means freedom, meaning, and adventure are what you live for. You need a big-picture reason for everything — routine without purpose makes you restless. You're probably blunt, optimistic, and always looking at the next horizon. You'd rather be uncomfortably free than comfortably trapped. Rules feel like suggestions, and you learn by living, not studying.`,
    "Capricorn": `Having ${count} planets in Capricorn means ambition, structure, and achievement define you. You're playing a long game that most people can't even see. You take responsibility seriously — maybe too seriously. You probably started acting like an adult before you were one. Success matters to you, not for status, but because you need to build something that proves you earned your place.`,
    "Aquarius": `Having ${count} planets in Aquarius means you think differently from almost everyone around you. You see systems, patterns, and possibilities that others miss. You care deeply about fairness and the bigger picture, sometimes at the expense of personal warmth. You probably felt like an outsider growing up — and part of you still does. You don't follow trends; you accidentally start them.`,
    "Pisces": `Having ${count} planets in Pisces means you feel everything — yours, theirs, the room's, the world's. Your boundaries are thin and your imagination is enormous. You might escape into art, music, daydreaming, or substances when reality gets too heavy. You understand suffering intuitively, and people come to you when they need someone who truly gets it. You're more perceptive than people realize.`,
  };
  return (SIGN_FEEL[sign] || `Having ${count} planets in ${sign} means this sign's energy dominates your personality in a way that's hard to miss.`) + "\n\n";
}

/** What does having a pile-up of planets in this house actually feel like? */
function stelliumHouseFeeling(house: number, planets: string[]): string {
  const count = planets.length;
  const HOUSE_FEEL: Record<number, string> = {
    1: `Having ${count} planets in your 1st house means everything starts with YOU. Your personality, appearance, and first impressions dominate your life. You're someone people notice immediately — for better or worse, you can't blend in. Your sense of self is complex because so many different parts of your psyche are fighting to define "who you are."`,
    2: `Having ${count} planets in your 2nd house means money, possessions, and self-worth are central to your story. You probably think about finances and security more than most people. Your relationship with what you own and what you're worth (not just financially, but as a person) is intense and complicated.`,
    3: `Having ${count} planets in your 3rd house means your mind and your words are where all the action is. You're probably always reading, writing, texting, talking, or learning something. Siblings, neighbors, and your immediate environment play outsized roles in your life. Your brain never really shuts off.`,
    4: `Having ${count} planets in your 4th house means home and family are everything to you. Your childhood, your parents, and your emotional roots shape every other part of your life. You need a home base that feels safe — without it, nothing else works. Family dynamics (whether loving or complicated) are the story of your life.`,
    5: `Having ${count} planets in your 5th house means creativity, romance, and self-expression are your whole world. You need to create, perform, or play to feel alive. Love affairs, children, hobbies, art — these aren't side activities for you, they're the main event. You probably fall hard and create obsessively.`,
    6: `Having ${count} planets in your 6th house means daily routines, work, and health consume your attention. You're probably very particular about how you do things — your system for getting through the day matters more to you than most people would understand. You show love through service and you feel best when you're useful.`,
    7: `Having ${count} planets in your 7th house means relationships are the center of your universe. You discover who you are through other people — partners, close friends, even rivals. Being alone for long stretches probably feels wrong. Your partnerships are intense and complicated because so much of your energy pours into them. The people you choose to be with define your life more than almost anything else.`,
    8: `Having ${count} planets in your 8th house means you live in the deep end. Intimacy, shared money, psychological intensity, power dynamics, death and rebirth — these aren't topics you avoid, they're your daily reality. You've probably been through more transformative experiences than most people your age. Nothing about your inner life is surface-level.`,
    9: `Having ${count} planets in your 9th house means meaning, truth, and the big picture are what drive you. You need a philosophy, a belief system, or a quest. Travel, higher education, and exposure to different cultures and ideas aren't luxuries — they're necessities for your sanity. You're always asking "why" and "what does this all mean."`,
    10: `Having ${count} planets in your 10th house means career, reputation, and legacy are where your energy concentrates. You're ambitious — probably more than you let on. What you're known for publicly matters deeply to you. You've probably been thinking about your "life's work" since you were young, even if you couldn't name it.`,
    11: `Having ${count} planets in your 11th house means community, friendship, and the future are your world. You're drawn to groups, causes, and big-picture visions. Your friend circle isn't casual — it's central to who you are. You probably care more about making the world better than about personal glory, even though that's also complicated.`,
    12: `Having ${count} planets in your 12th house means your inner life is enormous — and mostly invisible to others. You're processing things beneath the surface that most people never access: subconscious patterns, spiritual experiences, hidden grief, transcendent creativity. You need solitude to function, and you're more psychically sensitive than you might admit.`,
  };
  return (HOUSE_FEEL[house] || `Having ${count} planets in your ${ordinalHouse(house)} house means this area of life dominates your chart in an extremely concentrated way.`) + "\n\n";
}

/** Look up a planet's sign + house from the planets array, with plain-language meanings */
function planetInfo(planets: Planet[], name: string): {
  sign: string; house: number | null; planetMeaning: string; signMeaning: string; houseMeaning: string;
} {
  const p = planets.find((pl) => pl.name === name);
  const sign = p ? signName(p.sign) : "";
  const house = p?.house ? parseInt(p.house, 10) : null;
  return {
    sign,
    house,
    planetMeaning: PLANET_MEANING[name] || name.toLowerCase(),
    signMeaning: SIGN_MEANING[sign] || "",
    houseMeaning: house ? (HOUSE_MEANING[house] || "") : "",
  };
}

/** Generate a personalized, beginner-friendly interpretation for a chart pattern */
function personalizePattern(pattern: ChartPattern, planets: Planet[]): string {
  const type = pattern.type;

  if (type === "t-square") {
    const apex = pattern.details.apex;
    const others = pattern.planets.filter((p) => p !== apex);
    const apexInfo = planetInfo(planets, apex);
    const p1Info = planetInfo(planets, others[0]);
    const p2Info = planetInfo(planets, others[1]);

    // Build a narrative synthesis, not a glossary
    let text = "";

    // Explain what a t-square IS first
    text += `A t-square means three planets are locked in a triangle of friction — two are in opposition (pulling you in opposite directions) and both square a third planet (the apex), which bears the brunt of the pressure.\n\n`;

    // Now explain THEIR specific one as a story
    text += `In your chart, the two opposing forces are:\n\n`;
    text += `• ${others[0]} in ${p1Info.sign || "your chart"}`;
    if (p1Info.house) text += `, ${ordinalHouse(p1Info.house)} house`;
    text += ` — this is ${p1Info.planetMeaning}`;
    if (p1Info.signMeaning) text += `, filtered through ${p1Info.signMeaning}`;
    if (p1Info.houseMeaning) text += `. It plays out in the area of ${p1Info.houseMeaning}`;
    text += `.\n\n`;

    text += `• ${others[1]} in ${p2Info.sign || "your chart"}`;
    if (p2Info.house) text += `, ${ordinalHouse(p2Info.house)} house`;
    text += ` — this is ${p2Info.planetMeaning}`;
    if (p2Info.signMeaning) text += `, filtered through ${p2Info.signMeaning}`;
    if (p2Info.houseMeaning) text += `. It plays out in the area of ${p2Info.houseMeaning}`;
    text += `.\n\n`;

    text += `These two are in opposition — they want different things and you feel pulled between them.\n\n`;

    text += `All that tension funnels into ${apex}`;
    if (apexInfo.sign) text += ` in ${apexInfo.sign}`;
    if (apexInfo.house) text += `, ${ordinalHouse(apexInfo.house)} house`;
    text += ` — ${apexInfo.planetMeaning}`;
    if (apexInfo.houseMeaning) text += `, specifically in the area of ${apexInfo.houseMeaning}`;
    text += `.\n\n`;

    // Synthesize what it actually FEELS like — using sign+house-specific descriptions
    text += `What this feels like: `;
    text += apexFeeling(apex, apexInfo.sign, apexInfo.house);

    return text;
  }

  if (type === "stellium") {
    const isSign = pattern.details.locationType === "sign";
    const houseNum = !isSign ? parseInt(pattern.details.location.replace(/\D/g, ""), 10) || null : null;
    const houseMeaning = houseNum ? (HOUSE_MEANING[houseNum] || "") : "";
    const signFull = isSign ? signName(pattern.details.location) : "";
    // Friendly display name — "Scorpio" for sign, "your 7th house" for house
    const locDisplay = isSign ? signFull : `your ${ordinalHouse(houseNum || 0)} house`;

    const planetDescs = pattern.planets.map((p) => {
      const info = planetInfo(planets, p);
      return `• ${p} — ${info.planetMeaning}`;
    });

    let text = `Most people have their planets scattered around the chart. You have ${pattern.planets.length} all packed into ${locDisplay}`;
    if (houseNum && houseMeaning) text += ` (the area of ${houseMeaning})`;
    text += ` — that's extremely rare.\n\n`;

    // Explain what it FEELS like in concrete terms
    if (isSign && signFull) {
      text += stelliumSignFeeling(signFull, pattern.planets);
    } else if (houseNum) {
      text += stelliumHouseFeeling(houseNum, pattern.planets);
    }

    text += `Here's what each planet brings to this pile-up:\n\n${planetDescs.join("\n")}\n\n`;

    // Blend the actual planets' themes so a Sun/Mercury/Pluto stellium reads
    // differently from a Moon/Venus/Jupiter one in the same sign.
    const meanings = pattern.planets
      .map((p) => PLANET_MEANING[p])
      .filter((m): m is string => Boolean(m));
    const blendList =
      meanings.length >= 2
        ? meanings.length === 2
          ? `${meanings[0]} and ${meanings[1]}`
          : `${meanings.slice(0, -1).join(", ")}, and ${meanings[meanings.length - 1]}`
        : "";

    text += `What this means in practice: `;
    if (blendList) {
      text += `it's specifically ${blendList} that are all wired into ${locDisplay}. These aren't separate dials you can adjust one at a time — turn one and the others move with it. `;
    } else {
      text += `imagine ${pattern.planets.length} people all trying to talk at once in the same room — that's your inner life around ${(houseNum ? houseMeaning : signFull) || "this area"}. `;
    }
    text += `You have extraordinary depth here that most people can't match. `;
    text += `But it also means other parts of life can feel underdeveloped by comparison. `;
    text += `The key is to lean into this as your superpower while deliberately giving attention to the areas that don't come as naturally.`;
    return text;
  }

  if (type === "grand-trine") {
    const element = pattern.details.element || "the same element";
    const ELEMENT_FEEL: Record<string, string> = {
      fire: "action, inspiration, and confidence. Things you try in these areas tend to work without much struggle — you have natural charisma, enthusiasm, and the ability to motivate yourself and others",
      earth: "practical matters, material stability, and getting things done. You have a natural ability to build, earn, and create tangible results without overthinking it",
      air: "thinking, communicating, and connecting with people. Ideas come easily to you, social situations feel natural, and you can see patterns and connections that others miss",
      water: "emotions, intuition, and deep understanding. You read people effortlessly, feel your way through situations accurately, and have a natural emotional intelligence that others envy",
    };

    const planetDescs = pattern.planets.map((p) => {
      const info = planetInfo(planets, p);
      let desc = `• ${p} (${info.planetMeaning})`;
      if (info.sign) desc += ` in ${info.sign}`;
      if (info.house) desc += `, ${ordinalHouse(info.house)} house — ${info.houseMeaning}`;
      return desc;
    });

    let text = `A grand trine means three planets form a perfect flowing triangle — energy circulates easily between them with no friction. It's a rare gift.\n\n`;
    text += `Yours is in ${element}:\n\n${planetDescs.join("\n")}\n\n`;
    text += `What this feels like: ${ELEMENT_FEEL[element.toLowerCase()] || "things flow naturally in this area"}. `;
    text += `The risk with a grand trine is complacency — because it comes so easily, you might never push yourself to fully develop this talent. `;
    text += `If you deliberately invest in these areas, what's already effortless becomes extraordinary.`;
    return text;
  }

  if (type === "grand-cross") {
    const planetDescs = pattern.planets.map((p) => {
      const info = planetInfo(planets, p);
      let desc = `• ${p} (${info.planetMeaning})`;
      if (info.sign) desc += ` in ${info.sign}`;
      if (info.house) desc += `, ${ordinalHouse(info.house)} house — ${info.houseMeaning}`;
      return desc;
    });
    let text = `A grand cross is one of the most intense patterns possible — four planets are locked in a box of tension, each one pulling against all the others. No matter which direction you turn, something pushes back.\n\n`;
    text += `Your four points:\n\n${planetDescs.join("\n")}\n\n`;
    text += `What this feels like: every time you resolve one problem, another flares up. ${pattern.planets[0]} and ${pattern.planets[2]} pull you one way, ${pattern.planets[1]} and ${pattern.planets[3]} pull the other — and all four create friction with each other. `;
    text += `There's no easy release valve. It's genuinely exhausting, and people who don't have this pattern can't fully understand the pressure. `;
    text += `But grand cross people develop extraordinary resilience and multi-dimensional competence. You learn to hold contradictions because you have no other choice — and that ability is rare and powerful.`;
    return text;
  }

  if (type === "yod") {
    const apex = pattern.details.apex;
    const others = pattern.planets.filter((p) => p !== apex);
    const apexInfo = planetInfo(planets, apex);
    const p1Info = planetInfo(planets, others[0]);
    const p2Info = planetInfo(planets, others[1]);

    let text = `A yod is called the "finger of fate." Two planets work together easily and both point their energy at a third planet from awkward angles. That third planet feels a persistent, nagging compulsion to act, change, or evolve — like fate keeps tapping you on the shoulder.\n\n`;
    text += `The finger points at: ${apex} (${apexInfo.planetMeaning})`;
    if (apexInfo.sign) text += ` in ${apexInfo.sign}`;
    if (apexInfo.house) text += `, ${ordinalHouse(apexInfo.house)} house — ${apexInfo.houseMeaning}`;
    text += `.\n\n`;
    text += `Pushing it forward:\n`;
    text += `• ${others[0]} (${p1Info.planetMeaning})`;
    if (p1Info.sign) text += ` in ${p1Info.sign}`;
    if (p1Info.house) text += `, ${ordinalHouse(p1Info.house)} house — ${p1Info.houseMeaning}`;
    text += `\n`;
    text += `• ${others[1]} (${p2Info.planetMeaning})`;
    if (p2Info.sign) text += ` in ${p2Info.sign}`;
    if (p2Info.house) text += `, ${ordinalHouse(p2Info.house)} house — ${p2Info.houseMeaning}`;
    text += `\n\n`;
    text += `What this feels like: you have a persistent, hard-to-explain sense that something about ${apexInfo.houseMeaning || apexInfo.planetMeaning} needs to change. `;
    text += `It's not a crisis — it's more like a quiet, lifelong redirect. People with yods often feel drawn toward a specific calling or mission that they can't easily articulate but can't ignore either.`;
    return text;
  }

  if (type === "kite") {
    const planetDescs = pattern.planets.map((p) => {
      const info = planetInfo(planets, p);
      let desc = `• ${p} (${info.planetMeaning})`;
      if (info.sign) desc += ` in ${info.sign}`;
      if (info.house) desc += `, ${ordinalHouse(info.house)} house — ${info.houseMeaning}`;
      return desc;
    });
    let text = `A kite is one of the best patterns you can have. Three of your planets flow together effortlessly (natural talent), and a fourth planet adds just enough tension to give that talent a purpose and a direction. Talent + motivation in one package.\n\n`;
    text += `Your kite:\n\n${planetDescs.join("\n")}\n\n`;
    text += `What this feels like: you have genuine natural ability in these areas AND a built-in drive to actually use it. `;
    text += `Many naturally talented people coast because nothing pushes them. You have the push built in — a specific goal, tension, or relationship that channels all that effortless ability into real results.`;
    return text;
  }

  if (type === "mystic-rectangle") {
    const planetDescs = pattern.planets.map((p) => {
      const info = planetInfo(planets, p);
      let desc = `• ${p} (${info.planetMeaning})`;
      if (info.sign) desc += ` in ${info.sign}`;
      if (info.house) desc += `, ${ordinalHouse(info.house)} house — ${info.houseMeaning}`;
      return desc;
    });
    let text = `A mystic rectangle is a balanced structure — it has real tension (planets pulling in opposite directions) but also natural outlets (planets that help resolve that tension). Think of it as a bridge that holds weight precisely because the forces balance each other.\n\n`;
    text += `Your rectangle:\n\n${planetDescs.join("\n")}\n\n`;
    text += `What this feels like: you have real tensions in your life — genuine push-pull between competing needs — but you also have natural channels for resolving them. `;
    text += `Where other people get stuck in conflict, you find practical, creative solutions almost instinctively. `;
    text += `This pattern gives you an unusual ability to turn friction into something productive rather than destructive.`;
    return text;
  }

  // Fallback to generic
  return getPatternInterpretation(type)?.detail || "";
}

const HARD_PATTERNS = new Set(["t-square", "grand-cross", "yod"]);
const FLOWING_PATTERNS = new Set(["grand-trine", "kite", "mystic-rectangle"]);

function PatternsSection({
  patterns,
  planets,
}: {
  patterns: ChartPattern[];
  planets: Planet[];
}) {
  if (patterns.length === 0) return null;

  return (
    <section className="mb-10">
      <SectionHeader
        title="Your chart patterns"
        subtitle="When planets form specific shapes in your chart, they create themes that run through your whole life."
      />
      {patterns.map((pattern, i) => {
        const interp = getPatternInterpretation(pattern.type);
        const id = `pattern-${i}`;

        let subtitle = pattern.planets.join(", ");
        if (pattern.type === "stellium") {
          const loc = pattern.details.locationType === "sign"
            ? `in ${signName(pattern.details.location)}`
            : `in the ${ordinalHouse(parseInt(pattern.details.location.replace(/\D/g, ""), 10) || 0)} house`;
          subtitle = `${pattern.planets.join(", ")} ${loc}`;
        } else if (pattern.type === "t-square") {
          subtitle = `Apex: ${pattern.details.apex} | ${pattern.planets.join(", ")}`;
        } else if (pattern.type === "grand-trine") {
          subtitle = `${pattern.planets.join(", ")} in ${pattern.details.element}`;
        }

        const personalDetail = personalizePattern(pattern, planets);

        let tone: "harmony" | "tension" | "neutral" = "neutral";
        let eyebrow = "CONCENTRATION";
        if (HARD_PATTERNS.has(pattern.type)) {
          tone = "tension";
          eyebrow = "HARD PATTERN";
        } else if (FLOWING_PATTERNS.has(pattern.type)) {
          tone = "harmony";
          eyebrow = "FLOWING PATTERN";
        }

        const body = interp?.summary ? `${interp.summary}\n\n${personalDetail}` : personalDetail;

        return (
          <InsightCard
            key={id}
            tone={tone}
            eyebrow={eyebrow}
            title={interp?.title || pattern.type}
            subtitle={subtitle}
          >
            {body}
          </InsightCard>
        );
      })}
    </section>
  );
}

// ─── 2. Essential Dignities ───────────────────────────────────────────────────

function DignitiesSection({ dignities, planets }: { dignities: PlanetDignity[]; planets: Planet[] }) {
  const notable = dignities.filter((d) => d.dignity !== "peregrine");
  if (notable.length === 0) return null;

  const dignityMeta: Record<string, { eyebrow: string; tone: "harmony" | "tension" | "neutral" }> = {
    domicile: { eyebrow: "AT HOME", tone: "harmony" },
    exaltation: { eyebrow: "EXALTED", tone: "harmony" },
    detriment: { eyebrow: "IN DETRIMENT", tone: "tension" },
    fall: { eyebrow: "IN FALL", tone: "tension" },
  };

  return (
    <section className="mb-10">
      <SectionHeader
        title="Planet strengths"
        subtitle="Some signs make a planet stronger or weaker — like a fish in water vs. a fish on land."
      />
      {notable.map((d) => {
        const interp = getDignityInterpretation(d.planet, d.dignity, signName(d.sign));
        const info = planetInfo(planets, d.planet);
        const meta = dignityMeta[d.dignity] || { eyebrow: interp.label, tone: "neutral" as const };
        return (
          <InsightCard
            key={`${d.planet}-${d.dignity}`}
            tone={meta.tone}
            eyebrow={meta.eyebrow}
            title={`${d.planet} in ${signName(d.sign)}`}
          >
            <p style={{ margin: 0, marginBottom: 10 }}>
              <strong>{d.planet}</strong> is {info.planetMeaning}. Yours is in{" "}
              <strong>{signName(d.sign)}</strong>
              {info.signMeaning ? ` — ${info.signMeaning}` : ""}
              {info.house ? (
                <>
                  , sitting in your <strong>{ordinalHouse(info.house)} house</strong>
                  {info.houseMeaning ? ` (${info.houseMeaning})` : ""}
                </>
              ) : null}.
            </p>
            <p style={{ margin: 0 }}>{interp.summary}</p>
          </InsightCard>
        );
      })}
    </section>
  );
}

// ─── 3 & 4. Critical Degrees + Combust/Cazimi ────────────────────────────────

function CriticalDegreesSection({
  criticalDegrees,
  combustPlanets,
  planets,
}: {
  criticalDegrees: CriticalDegree[];
  combustPlanets: CombustStatus[];
  planets: Planet[];
}) {
  if (criticalDegrees.length === 0 && combustPlanets.length === 0) return null;

  return (
    <section className="mb-10">
      <SectionHeader
        title="Notable degrees"
        subtitle="Each sign spans 30°. Planets at the very start, end, or certain critical points carry extra weight."
      />
      {criticalDegrees.map((cd, i) => {
        const interp = getCriticalDegreeInterpretation(cd.type, cd.planet, signName(cd.sign));
        const info = planetInfo(planets, cd.planet);
        return (
          <InsightCard
            key={`cd-${i}`}
            tone="neutral"
            eyebrow={interp.title.toUpperCase()}
            title={cd.planet}
            subtitle={`${cd.position.toFixed(0)}° ${signName(cd.sign)}`}
          >
            <p style={{ margin: 0, marginBottom: 10 }}>
              <strong>{cd.planet}</strong> is {info.planetMeaning}.
              {info.house ? (
                <> It sits in your <strong>{ordinalHouse(info.house)} house</strong>
                {info.houseMeaning ? ` (${info.houseMeaning})` : ""}.</>
              ) : null}
            </p>
            <p style={{ margin: 0 }}>{interp.summary}</p>
          </InsightCard>
        );
      })}

      {combustPlanets.map((cp) => {
        const interp = getCriticalDegreeInterpretation(cp.type, cp.planet, "");
        const info = planetInfo(planets, cp.planet);
        const eyebrow = cp.type === "cazimi" ? "CAZIMI" : "UNDER THE BEAMS";
        return (
          <InsightCard
            key={`combust-${cp.planet}`}
            tone="neutral"
            eyebrow={eyebrow}
            title={cp.planet}
            subtitle={`${cp.distanceFromSun.toFixed(1)}° from the Sun`}
          >
            <p style={{ margin: 0, marginBottom: 10 }}>
              <strong>{cp.planet}</strong> is {info.planetMeaning}.
            </p>
            <p style={{ margin: 0 }}>{interp.summary}</p>
          </InsightCard>
        );
      })}
    </section>
  );
}

// ─── 5. Moon Phase ────────────────────────────────────────────────────────────

function MoonPhaseSection({ moonPhase }: { moonPhase: ChartAnalysis["moonPhase"] }) {
  const interp = getMoonPhaseInterpretation(moonPhase.phase);

  return (
    <section className="mb-10">
      <SectionHeader title="Your birth moon" subtitle="" />
      <InsightCard
        tone="neutral"
        eyebrow="LUNAR PHASE"
        title={interp?.title || moonPhase.phase}
        subtitle={`${moonPhase.angle.toFixed(0)}° past the Sun`}
      >
        {interp?.summary || moonPhase.description}
      </InsightCard>
    </section>
  );
}

// ─── 6. Sect ──────────────────────────────────────────────────────────────────

function SectSection({ sect }: { sect: ChartAnalysis["sect"] }) {
  const interp = getSectInterpretation(sect.isDayChart);

  return (
    <section className="mb-10">
      <SectionHeader title="Day or night person" subtitle="Were you born while the Sun was up or down? This changes which planets help you most." />
      <InsightCard
        tone="neutral"
        eyebrow="SECT"
        title={sect.isDayChart ? "A Day Chart" : "A Night Chart"}
        subtitle={sect.isDayChart ? "Born during the day" : "Born after sunset"}
      >
        {interp.summary}
      </InsightCard>
    </section>
  );
}

// ─── 7. Element & Modality Balance ────────────────────────────────────────────

function BalanceBar({
  label,
  value,
  max,
  colorClass,
}: {
  label: string;
  value: number;
  max: number;
  colorClass: string;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-2 mb-1">
      <span className="text-xs w-16 text-right capitalize" style={{ color: "var(--insight-body)" }}>
        {label}
      </span>
      <div className="flex-1 h-3 rounded-full bg-foreground/10 overflow-hidden">
        <div
          className={`h-full rounded-full ${colorClass} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs w-4" style={{ color: "var(--insight-ink)" }}>{value}</span>
    </div>
  );
}

function BalanceSection({
  elementBalance,
  modalityBalance,
}: {
  elementBalance: ChartAnalysis["elementBalance"];
  modalityBalance: ChartAnalysis["modalityBalance"];
}) {
  const maxEl = Math.max(elementBalance.fire, elementBalance.earth, elementBalance.air, elementBalance.water, 1);
  const maxMod = Math.max(modalityBalance.cardinal, modalityBalance.fixed, modalityBalance.mutable, 1);

  const elInterp = getElementBalanceInterpretation({
    dominant: elementBalance.dominant,
    lacking: elementBalance.lacking ?? undefined,
  });
  const modInterp = getModalityBalanceInterpretation({
    dominant: modalityBalance.dominant,
  });

  return (
    <section className="mb-10">
      <SectionHeader
        title="Your chart balance"
        subtitle="Every sign belongs to an element (fire, earth, air, water) and a mode (starter, sustainer, adapter). Here's your mix."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Elements */}
        <div style={{ background: "var(--insight-card)", borderRadius: 16, borderLeft: "3px solid var(--insight-neutral)", boxShadow: "var(--insight-shadow)", padding: "18px 20px" }}>
          <p
            className="text-[11px] uppercase tracking-widest font-semibold mb-3"
            style={{ color: "var(--insight-neutral)", letterSpacing: "0.12em" }}
          >
            Elements
          </p>
          <BalanceBar label="Fire" value={elementBalance.fire} max={maxEl} colorClass="bg-terracotta" />
          <BalanceBar label="Earth" value={elementBalance.earth} max={maxEl} colorClass="bg-sage" />
          <BalanceBar label="Air" value={elementBalance.air} max={maxEl} colorClass="bg-amber" />
          <BalanceBar label="Water" value={elementBalance.water} max={maxEl} colorClass="bg-lavender" />
          <p className="mt-3 text-xs leading-relaxed" style={{ color: "var(--insight-body)" }}>
            {elInterp.summary}
          </p>
        </div>

        {/* Modality */}
        <div style={{ background: "var(--insight-card)", borderRadius: 16, borderLeft: "3px solid var(--insight-neutral)", boxShadow: "var(--insight-shadow)", padding: "18px 20px" }}>
          <p
            className="text-[11px] uppercase tracking-widest font-semibold mb-3"
            style={{ color: "var(--insight-neutral)", letterSpacing: "0.12em" }}
          >
            Mode · How you act
          </p>
          <BalanceBar label="Starters" value={modalityBalance.cardinal} max={maxMod} colorClass="bg-terracotta/70" />
          <BalanceBar label="Sustainers" value={modalityBalance.fixed} max={maxMod} colorClass="bg-sage/70" />
          <BalanceBar label="Adapters" value={modalityBalance.mutable} max={maxMod} colorClass="bg-amber/70" />
          <p className="mt-3 text-xs leading-relaxed" style={{ color: "var(--insight-body)" }}>
            {modInterp.summary}
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── 8. House Markers ─────────────────────────────────────────────────────────

/** Which angular house is this planet in? Returns readable label. */
const ANGULAR_HOUSE_ROLE: Record<number, string> = {
  1: "your 1st house — how you present yourself and your identity",
  4: "your 4th house — home, family, and emotional foundations",
  7: "your 7th house — partnerships and close relationships",
  10: "your 10th house — career, reputation, and public life",
};

/** Cadent house meaning for beginner context */
const CADENT_HOUSE_ROLE: Record<number, string> = {
  3: "your 3rd house — everyday communication, siblings, and learning",
  6: "your 6th house — daily routines, health habits, and work ethic",
  9: "your 9th house — beliefs, higher education, and exploration",
  12: "your 12th house — your inner world, dreams, and subconscious",
};

function HouseMarkersSection({
  angularPlanets,
  cadentPlanets,
  houseEmphasis,
  emptyHouses,
  planets,
}: {
  angularPlanets: string[];
  cadentPlanets: string[];
  houseEmphasis: ChartAnalysis["houseEmphasis"];
  emptyHouses: number[];
  planets: Planet[];
}) {
  if (
    angularPlanets.length === 0 &&
    cadentPlanets.length === 0 &&
    houseEmphasis.length === 0 &&
    emptyHouses.length === 0
  ) {
    return null;
  }

  // Group empty houses by life-area theme so the section reads as a cohesive list
  function groupEmptyHouses(houses: number[]): { label: string; houses: number[]; explanation: string }[] {
    const groups: { label: string; nums: number[]; soloExplanations: Record<number, string>; pairExplanation: string }[] = [
      { label: "Identity & self-expression", nums: [1, 5],
        pairExplanation: "How you see yourself and express your creativity aren't areas of major internal conflict. You can just be yourself and enjoy life without overthinking it.",
        soloExplanations: { 1: emptyHouseFeeling(1), 5: emptyHouseFeeling(5) } },
      { label: "Security & resources", nums: [2, 8],
        pairExplanation: "Money, possessions, and shared resources don't dominate your inner world. You handle finances and deep intimacy without them becoming your central life drama.",
        soloExplanations: { 2: emptyHouseFeeling(2), 8: emptyHouseFeeling(8) } },
      { label: "Communication & learning", nums: [3, 9],
        pairExplanation: "Everyday conversations and big-picture beliefs flow naturally. You exchange ideas and explore philosophies without existential crisis.",
        soloExplanations: { 3: emptyHouseFeeling(3), 9: emptyHouseFeeling(9) } },
      { label: "Home & career", nums: [4, 10],
        pairExplanation: "The push-pull between private life and public ambition isn't a core source of tension. You move between home and work without constant inner friction.",
        soloExplanations: { 4: emptyHouseFeeling(4), 10: emptyHouseFeeling(10) } },
      { label: "Relationships & community", nums: [7, 11],
        pairExplanation: "Partnerships and friendships don't generate the heaviest life lessons for you. You connect with people without relationships becoming your primary battleground.",
        soloExplanations: { 7: emptyHouseFeeling(7), 11: emptyHouseFeeling(11) } },
      { label: "Daily life & inner world", nums: [6, 12],
        pairExplanation: "Your routines and subconscious patterns run relatively smoothly. Health habits and inner processing happen without dominating your attention.",
        soloExplanations: { 6: emptyHouseFeeling(6), 12: emptyHouseFeeling(12) } },
    ];

    const result: { label: string; houses: number[]; explanation: string }[] = [];
    const placed = new Set<number>();

    for (const g of groups) {
      const matching = houses.filter((h) => g.nums.includes(h) && !placed.has(h));
      if (matching.length >= 2) {
        // Both houses in the pair are empty — use the combined explanation
        matching.forEach((h) => placed.add(h));
        result.push({ label: g.label, houses: matching, explanation: g.pairExplanation });
      } else if (matching.length === 1) {
        // Only one house from the pair — still group under the theme label
        const h = matching[0];
        placed.add(h);
        result.push({ label: g.label, houses: [h], explanation: g.soloExplanations[h] });
      }
    }

    return result;
  }

  const emptyGroups = emptyHouses.length > 0 ? groupEmptyHouses(emptyHouses) : [];

  return (
    <section className="mb-10">
      <SectionHeader
        title="House patterns"
        subtitle="Your chart has 12 houses — each one represents a different area of life (career, love, home, etc). Some houses are packed with planets, making those areas extra active. Others are empty, meaning those parts of life tend to run on autopilot."
      />
      {angularPlanets.length > 0 && (
        <InsightCard tone="neutral" eyebrow="FRONT AND CENTER" title="Angular planets">
          <p style={{ margin: 0, marginBottom: 12, color: "var(--insight-muted)" }}>
            These planets sit at the four most powerful positions in any chart — the angles. Think of these as the four corners of your life: identity, home, relationships, and career. Planets here are loud. Other people notice them in you right away.
          </p>
          {angularPlanets.map((p) => {
            const info = planetInfo(planets, p);
            const houseRole = info.house ? ANGULAR_HOUSE_ROLE[info.house] || `your ${ordinalHouse(info.house)} house` : "";
            return (
              <div key={p} style={{ marginBottom: 12 }}>
                <span style={{ color: "var(--insight-ink)", fontWeight: 600 }}>{p}</span>
                {houseRole && (
                  <span style={{ color: "var(--insight-muted)", marginLeft: 4, fontSize: 13 }}>in {houseRole}</span>
                )}
                <p style={{ margin: 0, marginTop: 2, color: "var(--insight-body)" }}>
                  {info.planetMeaning ? `${p} represents ${info.planetMeaning}. ` : ""}Because it&apos;s at an angle, this part of you is immediately visible to everyone around you — it shapes first impressions and can&apos;t be hidden.
                </p>
              </div>
            );
          })}
        </InsightCard>
      )}

      {cadentPlanets.length > 0 && (
        <InsightCard tone="neutral" eyebrow="BEHIND THE SCENES" title="Cadent planets">
          <p style={{ margin: 0, marginBottom: 12, color: "var(--insight-muted)" }}>
            Cadent houses (3rd, 6th, 9th, 12th) are the quieter corners of your chart. Planets here work internally — shaping your thoughts, habits, beliefs, and subconscious patterns rather than being obvious to the outside world.
          </p>
          {cadentPlanets.map((p) => {
            const info = planetInfo(planets, p);
            const houseRole = info.house ? CADENT_HOUSE_ROLE[info.house] || `your ${ordinalHouse(info.house)} house` : "";
            return (
              <div key={p} style={{ marginBottom: 10 }}>
                <span style={{ color: "var(--insight-ink)", fontWeight: 600 }}>{p}</span>
                {houseRole && (
                  <span style={{ color: "var(--insight-muted)", marginLeft: 4, fontSize: 13 }}>in {houseRole}</span>
                )}
                <p style={{ margin: 0, marginTop: 2, color: "var(--insight-body)" }}>
                  {info.planetMeaning ? `${p} represents ${info.planetMeaning}. ` : ""}You experience this more privately — it influences how you think and process rather than how others perceive you.
                </p>
              </div>
            );
          })}
        </InsightCard>
      )}

      {houseEmphasis.length > 0 && (
        <InsightCard tone="neutral" eyebrow="CROWDED HOUSES" title="Stacked with planets">
          <p style={{ margin: 0, marginBottom: 12, color: "var(--insight-muted)" }}>
            When multiple planets pile into the same house, that area of life gets extra attention, complexity, and energy. It becomes a central theme you can&apos;t ignore.
          </p>
          {houseEmphasis.map((he) => {
            const interp = getHouseEmphasisInterpretation(he.house);
            return (
              <div key={he.house} style={{ marginBottom: 12 }}>
                <span style={{ color: "var(--insight-ink)", fontWeight: 600 }}>
                  {ordinalHouse(he.house)} House
                </span>
                <span style={{ color: "var(--insight-muted)", marginLeft: 6, fontSize: 13 }}>
                  ({he.planets.join(", ")})
                </span>
                <p style={{ margin: 0, marginTop: 2, color: "var(--insight-body)" }}>
                  {interp.summary}
                </p>
              </div>
            );
          })}
        </InsightCard>
      )}

      {emptyGroups.length > 0 && (
        <InsightCard tone="neutral" eyebrow="EMPTY HOUSES" title="Running on autopilot">
          <p style={{ margin: 0, marginBottom: 12, color: "var(--insight-muted)" }}>
            No planets landed in these houses. That doesn&apos;t mean these areas are missing from your life — just that they tend to run on autopilot without generating as much inner drama or growth pressure.
          </p>
          {emptyGroups.map((group) => (
            <div key={group.houses.join("-")} style={{ marginBottom: 12 }}>
              <span style={{ color: "var(--insight-ink)", fontWeight: 600 }}>{group.label}</span>
              <span style={{ color: "var(--insight-muted)", marginLeft: 6, fontSize: 13 }}>
                ({group.houses.map((h) => `${ordinalHouse(h)} house`).join(" & ")})
              </span>
              <p style={{ margin: 0, marginTop: 2, color: "var(--insight-body)" }}>
                {group.explanation}
              </p>
            </div>
          ))}
        </InsightCard>
      )}
    </section>
  );
}

// ─── 9. Retrogrades ───────────────────────────────────────────────────────────

function RetrogradesSection({ retrogradePlanets }: { retrogradePlanets: RetrogradeMarker[] }) {
  if (retrogradePlanets.length === 0) return null;

  return (
    <section className="mb-10">
      <SectionHeader
        title="Retrograde planets"
        subtitle="These planets appeared to move backward when you were born. Their energy turns inward — you experience their themes more privately and on your own terms."
      />
      {retrogradePlanets.map((rp) => {
        const interp = getRetrogradeInterpretation(rp.planet);
        return (
          <InsightCard
            key={rp.planet}
            tone="neutral"
            eyebrow={rp.isPersonal ? "STRONGLY FELT" : "RETROGRADE"}
            title={rp.planet}
            subtitle="Retrograde"
          >
            {interp.summary}
          </InsightCard>
        );
      })}
    </section>
  );
}

// ─── 10. Special Findings ─────────────────────────────────────────────────────

function SpecialFindingsSection({
  mutualReceptions,
  finalDispositor,
  singletons,
  unaspectedPlanets,
  tightAspects,
}: {
  mutualReceptions: MutualReception[];
  finalDispositor: string | null;
  singletons: Singleton[];
  unaspectedPlanets: string[];
  tightAspects: TightAspect[];
}) {
  const hasAnything =
    mutualReceptions.length > 0 ||
    finalDispositor !== null ||
    singletons.length > 0 ||
    unaspectedPlanets.length > 0 ||
    tightAspects.length > 0;

  if (!hasAnything) return null;

  return (
    <section className="mb-10">
      <SectionHeader
        title="Rare findings"
        subtitle="Most people don't have these. They make your chart distinctive."
      />
      {finalDispositor && (() => {
        const interp = getFinalDispositorInterpretation(finalDispositor);
        return (
          <InsightCard tone="neutral" eyebrow="FINAL DISPOSITOR" title={interp.title} subtitle={finalDispositor}>
            {interp.summary}
          </InsightCard>
        );
      })()}

      {mutualReceptions.map((mr) => {
        const interp = getMutualReceptionInterpretation(
          mr.planet1,
          signName(mr.sign1),
          mr.planet2,
          signName(mr.sign2)
        );
        return (
          <InsightCard
            key={`mr-${mr.planet1}-${mr.planet2}`}
            tone="neutral"
            eyebrow="MUTUAL RECEPTION"
            title={interp.title}
            subtitle={`${mr.planet1} ↔ ${mr.planet2}`}
          >
            {interp.summary}
          </InsightCard>
        );
      })}

      {singletons.map((s, i) => {
        const interp = getSingletonInterpretation(s.planet, s.type);
        return (
          <InsightCard
            key={`singleton-${i}`}
            tone="neutral"
            eyebrow={`${s.value.toUpperCase()} SINGLETON`}
            title={interp.title}
            subtitle={`${s.planet} — only ${s.value} ${s.type === "element" ? "sign" : s.type === "hemisphere" ? "placement" : "energy"} in your chart`}
          >
            {interp.summary}
          </InsightCard>
        );
      })}

      {unaspectedPlanets.map((p) => {
        const interp = getUnaspectedInterpretation(p);
        return (
          <InsightCard key={`unasp-${p}`} tone="neutral" eyebrow="UNASPECTED" title={interp.title} subtitle={p}>
            {interp.summary}
          </InsightCard>
        );
      })}

      {tightAspects.length > 0 && (
        <>
          <p className="text-xs mb-2" style={{ color: "var(--insight-muted)" }}>
            These planet pairs are locked tightly together — their themes are inseparable in your life.
          </p>
          {tightAspects.map((ta, i) => (
            <InsightCard
              key={`tight-${i}`}
              tone="tension"
              eyebrow={ta.isExact ? `EXACT · ${ta.orb.toFixed(1)}° ORB` : `${ta.orb.toFixed(1)}° ORB`}
              title={`${ta.p1} ↔ ${ta.p2}`}
              subtitle={aspectName(ta.aspect)}
            >
              {pairDescription(ta.p1, ta.p2, ta.aspect)}
            </InsightCard>
          ))}
        </>
      )}
    </section>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-[10px] font-bold uppercase mt-7 mb-2.5 first:mt-0"
      style={{ letterSpacing: "0.18em", color: "var(--foreground-muted)" }}
    >
      {children}
    </p>
  );
}

const n = (count: number, one: string, many = `${one}s`) =>
  `${count} ${count === 1 ? one : many}`;

export default function ChartInsightsPanel({ analysis, planets }: ChartInsightsPanelProps) {
  // A section is listed only when it has something in it. Each section already
  // returns null when empty; the same condition decides whether its row exists,
  // so a row on screen is never a dead end.
  const notableDignities = analysis.dignities.filter((d) => d.dignity !== "peregrine");
  const hasHouseMarkers =
    analysis.angularPlanets.length > 0 ||
    analysis.cadentPlanets.length > 0 ||
    analysis.houseEmphasis.length > 0 ||
    analysis.emptyHouses.length > 0;
  const rareCount =
    analysis.mutualReceptions.length +
    (analysis.finalDispositor ? 1 : 0) +
    analysis.singletons.length +
    analysis.unaspectedPlanets.length +
    analysis.tightAspects.length;
  const degreeCount = analysis.criticalDegrees.length + analysis.combustPlanets.length;

  return (
    <div className="w-full">
      {/* Ordered by the question a person actually arrives with: what is unusual
          about me, then how is this chart put together, then what was the sky
          doing. The distinctive findings come first because they are the reason
          to open the tab at all. */}
      <GroupLabel>What stands out</GroupLabel>

      {rareCount > 0 && (
        <InsightSection title="Rare findings" count={n(rareCount, "finding")}>
          <SpecialFindingsSection
            mutualReceptions={analysis.mutualReceptions}
            finalDispositor={analysis.finalDispositor}
            singletons={analysis.singletons}
            unaspectedPlanets={analysis.unaspectedPlanets}
            tightAspects={analysis.tightAspects}
          />
        </InsightSection>
      )}

      {analysis.patterns.length > 0 && (
        <InsightSection title="Your chart patterns" count={n(analysis.patterns.length, "pattern")}>
          <PatternsSection patterns={analysis.patterns} planets={planets} />
        </InsightSection>
      )}

      {degreeCount > 0 && (
        <InsightSection title="Notable degrees" count={n(degreeCount, "planet")}>
          <CriticalDegreesSection
            criticalDegrees={analysis.criticalDegrees}
            combustPlanets={analysis.combustPlanets}
            planets={planets}
          />
        </InsightSection>
      )}

      <GroupLabel>How your chart is built</GroupLabel>

      <InsightSection title="Your chart balance" count="the mix">
        <BalanceSection
          elementBalance={analysis.elementBalance}
          modalityBalance={analysis.modalityBalance}
        />
      </InsightSection>

      {notableDignities.length > 0 && (
        <InsightSection title="Planet strengths" count={n(notableDignities.length, "planet")}>
          <DignitiesSection dignities={analysis.dignities} planets={planets} />
        </InsightSection>
      )}

      {hasHouseMarkers && (
        <InsightSection
          title="House patterns"
          count={analysis.emptyHouses.length > 0 ? n(analysis.emptyHouses.length, "empty house") : "houses"}
        >
          <HouseMarkersSection
            angularPlanets={analysis.angularPlanets}
            cadentPlanets={analysis.cadentPlanets}
            houseEmphasis={analysis.houseEmphasis}
            emptyHouses={analysis.emptyHouses}
            planets={planets}
          />
        </InsightSection>
      )}

      <GroupLabel>The sky you were born under</GroupLabel>

      <InsightSection title="Your birth moon" count={analysis.moonPhase?.phase ?? null}>
        <MoonPhaseSection moonPhase={analysis.moonPhase} />
      </InsightSection>

      <InsightSection
        title="Day or night person"
        count={analysis.sect.isDayChart ? "day" : "night"}
      >
        <SectSection sect={analysis.sect} />
      </InsightSection>

      {analysis.retrogradePlanets.length > 0 && (
        <InsightSection
          title="Retrograde planets"
          count={n(analysis.retrogradePlanets.length, "planet")}
        >
          <RetrogradesSection retrogradePlanets={analysis.retrogradePlanets} />
        </InsightSection>
      )}
    </div>
  );
}
