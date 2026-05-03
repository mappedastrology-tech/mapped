export type TriggerType = "lord_of_year" | "transit" | "natal" | "sky";

export interface RightNowTrigger {
  type: TriggerType;
  condition: string;
  contextHeader: string;
  whyCopy: string;
}

export interface RightNowPhrase {
  id: string;
  phrase: string;
  triggers: RightNowTrigger[];
  cta?: { label: string; action: "ritual_filter" | "journal" | "dolly"; param?: string };
}

export const RIGHT_NOW_PHRASES: RightNowPhrase[] = [
  // ─────────────────────────────────────────────────────────────────
  // SATURNIAN (12 phrases, S01–S12)
  // ─────────────────────────────────────────────────────────────────
  {
    id: "S01",
    phrase: "More 9pm bedtimes, less doomscrolling",
    triggers: [
      {
        type: "lord_of_year",
        condition: "saturn",
        contextHeader: "Your Lord of the Year is Saturn",
        whyCopy:
          "Saturn years reward structure over stimulation. Your nervous system is asking for a tighter container right now. You get to decide what that container looks like.",
      },
    ],
    cta: { label: "Show me Saturnian rituals →", action: "ritual_filter", param: "saturnian" },
  },
  {
    id: "S02",
    phrase: "More finishing what you started, less buying a new project",
    triggers: [
      {
        type: "natal",
        condition: "strong_saturn",
        contextHeader: "Saturn is prominent in your chart",
        whyCopy:
          "With Saturn strongly placed natally, your growth happens through completion, not novelty. The dopamine of starting something new is a familiar escape hatch. You already know what actually needs finishing.",
      },
    ],
  },
  {
    id: "S03",
    phrase: "More saying no without the explainer, less the polite essay",
    triggers: [
      {
        type: "transit",
        condition: "saturn_aspecting_personal_planet",
        contextHeader: "Saturn is aspecting a personal planet",
        whyCopy:
          "When Saturn touches your personal planets by transit, boundaries stop being optional. The long explanation is a form of asking permission you already have. A full sentence is generous enough.",
      },
    ],
    cta: { label: "Journal on this →", action: "journal", param: "boundaries" },
  },
  {
    id: "S04",
    phrase: "More therapy, less your friends as your therapist",
    triggers: [
      {
        type: "lord_of_year",
        condition: "saturn",
        contextHeader: "Your Lord of the Year is Saturn",
        whyCopy:
          "Saturn years ask you to professionalize your support system. Your friends love you and they are not trained for this. Paying someone to hold the container is a Saturnian move.",
      },
    ],
  },
  {
    id: "S05",
    phrase: "More boring routines, less moving across the country",
    triggers: [
      {
        type: "natal",
        condition: "strong_saturn",
        contextHeader: "Saturn is prominent in your chart",
        whyCopy:
          "Saturn-dominant charts thrive in repetition. The fantasy of geographic cure is often avoidance wearing adventure clothing. The boring thing is frequently the brave thing.",
      },
    ],
    cta: { label: "Show me Saturnian rituals →", action: "ritual_filter", param: "saturnian" },
  },
  {
    id: "S06",
    phrase: "More leaving the group chat, less muting it for the third time",
    triggers: [
      {
        type: "transit",
        condition: "saturn_aspecting_personal_planet",
        contextHeader: "Saturn is aspecting a personal planet",
        whyCopy:
          "Saturn transits to personal planets compress your social bandwidth. Muting is a half-measure that keeps you tethered to something you have already outgrown. Leaving is cleaner than lingering.",
      },
    ],
  },
  {
    id: "S07",
    phrase: "More writing the email and waiting til morning, less hitting send angry",
    triggers: [
      {
        type: "lord_of_year",
        condition: "saturn",
        contextHeader: "Your Lord of the Year is Saturn",
        whyCopy:
          "Saturn rewards the delay between impulse and action. The draft folder is a Saturnian technology. Morning-you has information that midnight-you does not.",
      },
    ],
    cta: { label: "Journal on this →", action: "journal", param: "impulse_control" },
  },
  {
    id: "S08",
    phrase: "More not having to explain yourself, less performing authenticity",
    triggers: [
      {
        type: "natal",
        condition: "strong_saturn",
        contextHeader: "Saturn is prominent in your chart",
        whyCopy:
          "A strong natal Saturn gives you permission to be opaque. Performing vulnerability for an audience is still a performance. Silence is a complete statement.",
      },
    ],
  },
  {
    id: "S09",
    phrase: "More letting people be wrong about you, less correcting them",
    triggers: [
      {
        type: "transit",
        condition: "saturn_aspecting_personal_planet",
        contextHeader: "Saturn is aspecting a personal planet",
        whyCopy:
          "Saturn transits teach you that reputation management is exhausting and ultimately futile. Other people's narratives about you are their project, not yours. You can let the wrong story stand.",
      },
    ],
  },
  {
    id: "S10",
    phrase: "More deleting the app entirely, less setting a screen time limit",
    triggers: [
      {
        type: "lord_of_year",
        condition: "saturn",
        contextHeader: "Your Lord of the Year is Saturn",
        whyCopy:
          "Saturn years favor elimination over moderation. The screen time limit is a negotiation with a thing that does not negotiate back. Deletion is the only boundary an algorithm respects.",
      },
    ],
    cta: { label: "Show me Saturnian rituals →", action: "ritual_filter", param: "saturnian" },
  },
  {
    id: "S11",
    phrase: "More going to bed angry and waking up fine, less processing at 2am",
    triggers: [
      {
        type: "natal",
        condition: "strong_saturn",
        contextHeader: "Saturn is prominent in your chart",
        whyCopy:
          "Strong Saturn placements understand that not everything requires immediate resolution. Sleep is a processing tool. Most 2am revelations are just cortisol wearing a mask.",
      },
    ],
  },
  {
    id: "S12",
    phrase: "More doing the boring thing, less manifesting the exciting one",
    triggers: [
      {
        type: "transit",
        condition: "saturn_aspecting_personal_planet",
        contextHeader: "Saturn is aspecting a personal planet",
        whyCopy:
          "Saturn transits are anti-manifestation weather. They reward the unsexy labor that nobody posts about. The boring thing is already working; it just does not have a vision board.",
      },
    ],
    cta: { label: "Journal on this →", action: "journal", param: "discipline" },
  },

  // ─────────────────────────────────────────────────────────────────
  // PLUTONIAN (12 phrases, P01–P12)
  // ─────────────────────────────────────────────────────────────────
  {
    id: "P01",
    phrase: "More outgrowing people quietly, less the dramatic exit",
    triggers: [
      {
        type: "transit",
        condition: "pluto_aspecting_personal_planet",
        contextHeader: "Pluto is aspecting a personal planet",
        whyCopy:
          "Pluto transits to personal planets dissolve connections that no longer match your frequency. The urge to torch things on the way out is Pluto being theatrical. Quiet departure is still total.",
      },
    ],
    cta: { label: "Show me Plutonian rituals →", action: "ritual_filter", param: "plutonian" },
  },
  {
    id: "P02",
    phrase: "More sitting with the uncomfortable truth, less researching it into a comfortable one",
    triggers: [
      {
        type: "natal",
        condition: "pluto_prominent",
        contextHeader: "Pluto is prominent in your chart",
        whyCopy:
          "Natal Pluto prominence gives you an unusual tolerance for darkness, but also an impulse to intellectualize it away. The research is a control strategy. The truth does not need to be comfortable to be survivable.",
      },
    ],
  },
  {
    id: "P03",
    phrase: "More letting it be ruined, less trying to save it",
    triggers: [
      {
        type: "transit",
        condition: "pluto_aspecting_personal_planet",
        contextHeader: "Pluto is aspecting a personal planet",
        whyCopy:
          "Pluto transits are demolition, not renovation. Trying to save something Pluto has already condemned is like redecorating a building mid-earthquake. You can let the rubble settle before deciding what to rebuild.",
      },
    ],
    cta: { label: "Journal on this →", action: "journal", param: "release" },
  },
  {
    id: "P04",
    phrase: "More admitting you wanted it to end, less pretending you did not",
    triggers: [
      {
        type: "lord_of_year",
        condition: "pluto",
        contextHeader: "Your Lord of the Year is Pluto",
        whyCopy:
          "Pluto years surface the desires you kept underground. Admitting complicity in an ending is not the same as causing harm. You are allowed to have wanted out.",
      },
    ],
  },
  {
    id: "P05",
    phrase: "More acknowledging your power, less pretending you do not have it",
    triggers: [
      {
        type: "natal",
        condition: "pluto_prominent",
        contextHeader: "Pluto is prominent in your chart",
        whyCopy:
          "Prominent Pluto in the birth chart comes with intensity that others notice before you do. Playing small does not make you safer; it just makes your influence less conscious. You already have the power; the question is whether you wield it deliberately.",
      },
    ],
    cta: { label: "Show me Plutonian rituals →", action: "ritual_filter", param: "plutonian" },
  },
  {
    id: "P06",
    phrase: "More choosing what dies on purpose, less letting it rot",
    triggers: [
      {
        type: "transit",
        condition: "pluto_aspecting_personal_planet",
        contextHeader: "Pluto is aspecting a personal planet",
        whyCopy:
          "Pluto transits bring endings regardless. The difference is whether you participate or spectate. Conscious pruning is less painful than unconscious decay.",
      },
    ],
  },
  {
    id: "P07",
    phrase: "More looking at the bank account, less the vague dread of not looking",
    triggers: [
      {
        type: "lord_of_year",
        condition: "pluto",
        contextHeader: "Your Lord of the Year is Pluto",
        whyCopy:
          "Pluto years demand you look at what you have been avoiding. Financial avoidance is a control issue disguised as a comfort strategy. The number is less frightening than the not-knowing.",
      },
    ],
    cta: { label: "Journal on this →", action: "journal", param: "shadow_finances" },
  },
  {
    id: "P08",
    phrase: "More grieving the version of you that did not make it, less pretending she never existed",
    triggers: [
      {
        type: "natal",
        condition: "pluto_prominent",
        contextHeader: "Pluto is prominent in your chart",
        whyCopy:
          "Natal Pluto knows about the selves you have shed. Denying previous versions does not make the current one more real. Grief for who you were is not regression; it is integration.",
      },
    ],
  },
  {
    id: "P09",
    phrase: "More being the one who changed, less blaming them for not keeping up",
    triggers: [
      {
        type: "transit",
        condition: "pluto_aspecting_personal_planet",
        contextHeader: "Pluto is aspecting a personal planet",
        whyCopy:
          "Pluto transits transform you at a rate others cannot match. The story that they failed you is easier than the truth that you left first, energetically. Both things can be true and only one gives you agency.",
      },
    ],
  },
  {
    id: "P10",
    phrase: "More telling the whole truth in therapy, less the curated version",
    triggers: [
      {
        type: "lord_of_year",
        condition: "pluto",
        contextHeader: "Your Lord of the Year is Pluto",
        whyCopy:
          "Pluto years strip away the performance of self-improvement. If you are editing the story for your therapist, you are paying someone to validate a fiction. The ugly version is the useful one.",
      },
    ],
    cta: { label: "Show me Plutonian rituals →", action: "ritual_filter", param: "plutonian" },
  },
  {
    id: "P11",
    phrase: "More accepting that some things cannot be fixed, only left",
    triggers: [
      {
        type: "transit",
        condition: "pluto_aspecting_personal_planet",
        contextHeader: "Pluto is aspecting a personal planet",
        whyCopy:
          "Pluto does not repair. It replaces. The compulsion to fix is often a refusal to grieve. Some situations only have an exit, not a solution.",
      },
    ],
  },
  {
    id: "P12",
    phrase: "More noticing who you become around them, less blaming them for it",
    triggers: [
      {
        type: "natal",
        condition: "pluto_prominent",
        contextHeader: "Pluto is prominent in your chart",
        whyCopy:
          "Natal Pluto gives you access to intense relational dynamics. The person who triggers your worst self is showing you something, not causing it. The information is yours to use or ignore.",
      },
    ],
    cta: { label: "Journal on this →", action: "journal", param: "projection" },
  },

  // ─────────────────────────────────────────────────────────────────
  // MARTIAN (10 phrases, M01–M10)
  // ─────────────────────────────────────────────────────────────────
  {
    id: "M01",
    phrase: "More picking the fight on purpose, less being passive-aggressive about it",
    triggers: [
      {
        type: "transit",
        condition: "mars_in_1st",
        contextHeader: "Mars is transiting your 1st house",
        whyCopy:
          "Mars in your 1st house puts your anger on the surface where everyone can see it. Passive aggression is anger that lost its nerve. Direct conflict, chosen deliberately, is actually kinder.",
      },
    ],
    cta: { label: "Show me Martian rituals →", action: "ritual_filter", param: "martian" },
  },
  {
    id: "M02",
    phrase: "More the hard workout, less the anxious pacing",
    triggers: [
      {
        type: "lord_of_year",
        condition: "mars",
        contextHeader: "Your Lord of the Year is Mars",
        whyCopy:
          "Mars years give you excess energy that will find an outlet whether you choose one or not. Anxiety is often undischarged Mars. Physical exhaustion is a legitimate regulation strategy.",
      },
    ],
  },
  {
    id: "M03",
    phrase: "More quitting the thing that makes you resentful, less noble suffering",
    triggers: [
      {
        type: "transit",
        condition: "mars_in_7th",
        contextHeader: "Mars is transiting your 7th house",
        whyCopy:
          "Mars transiting your 7th house illuminates where you are overextending in relationships. Resentment is a delayed no. The nobility of suffering is a story other people benefit from more than you do.",
      },
    ],
    cta: { label: "Journal on this →", action: "journal", param: "resentment" },
  },
  {
    id: "M04",
    phrase: "More asking for the raise directly, less hinting and hoping",
    triggers: [
      {
        type: "transit",
        condition: "mars_in_10th",
        contextHeader: "Mars is transiting your 10th house",
        whyCopy:
          "Mars in your 10th house is direct professional energy. Hints are requests wearing camouflage. The direct ask might not land, but it gives them something clear to respond to.",
      },
    ],
  },
  {
    id: "M05",
    phrase: "More walking out of the room mid-argument, less saying something you will regret",
    triggers: [
      {
        type: "sky",
        condition: "mars_retrograde",
        contextHeader: "Mars is retrograde",
        whyCopy:
          "Mars retrograde turns your aggression inward and makes it harder to calibrate. Walking away is not weakness; it is recognizing that your instrument is temporarily out of tune. You can come back when you trust your own volume.",
      },
    ],
    cta: { label: "Show me Martian rituals →", action: "ritual_filter", param: "martian" },
  },
  {
    id: "M06",
    phrase: "More doing the scary thing first thing in the morning, less letting dread build all day",
    triggers: [
      {
        type: "lord_of_year",
        condition: "mars",
        contextHeader: "Your Lord of the Year is Mars",
        whyCopy:
          "Mars years reward initiative over deliberation. Dread compounds hourly. The task itself almost never takes as long as the anxiety about it did.",
      },
    ],
  },
  {
    id: "M07",
    phrase: "More ending the date early, less being polite for two more hours",
    triggers: [
      {
        type: "transit",
        condition: "mars_in_7th",
        contextHeader: "Mars is transiting your 7th house",
        whyCopy:
          "Mars in your 7th house gives you a shorter fuse for relational obligations that are going nowhere. Politeness that costs you two hours is not actually polite. You can leave and still be a good person.",
      },
    ],
  },
  {
    id: "M08",
    phrase: "More blocking without the explanation, less the closure conversation",
    triggers: [
      {
        type: "sky",
        condition: "mars_retrograde",
        contextHeader: "Mars is retrograde",
        whyCopy:
          "Mars retrograde makes direct confrontation unreliable. The closure conversation is often a reopening disguised as an ending. The block button is a complete sentence during this transit.",
      },
    ],
    cta: { label: "Journal on this →", action: "journal", param: "closure" },
  },
  {
    id: "M09",
    phrase: "More competitive energy channeled into your own work, less comparing timelines",
    triggers: [
      {
        type: "transit",
        condition: "mars_in_10th",
        contextHeader: "Mars is transiting your 10th house",
        whyCopy:
          "Mars in the 10th gives you drive that can easily become comparison. Competition is useful fuel when pointed at your own output. Other people's timelines contain information you do not have.",
      },
    ],
  },
  {
    id: "M10",
    phrase: "More starting before you are ready, less researching how to start",
    triggers: [
      {
        type: "lord_of_year",
        condition: "mars",
        contextHeader: "Your Lord of the Year is Mars",
        whyCopy:
          "Mars years penalize over-preparation. Research is sometimes a sophisticated form of procrastination. The messy first attempt teaches more than the perfect plan.",
      },
    ],
    cta: { label: "Show me Martian rituals →", action: "ritual_filter", param: "martian" },
  },

  // ─────────────────────────────────────────────────────────────────
  // VENUSIAN (10 phrases, V01–V10)
  // ─────────────────────────────────────────────────────────────────
  {
    id: "V01",
    phrase: "More buying the expensive candle, less the fifth cheap one that smells wrong",
    triggers: [
      {
        type: "lord_of_year",
        condition: "venus",
        contextHeader: "Your Lord of the Year is Venus",
        whyCopy:
          "Venus years teach you the economics of taste. Five mediocre purchases cost more than one good one, financially and energetically. You are allowed to just get the nice thing.",
      },
    ],
    cta: { label: "Show me Venusian rituals →", action: "ritual_filter", param: "venusian" },
  },
  {
    id: "V02",
    phrase: "More telling them what you actually want, less being the low-maintenance one",
    triggers: [
      {
        type: "sky",
        condition: "venus_retrograde",
        contextHeader: "Venus is retrograde",
        whyCopy:
          "Venus retrograde reviews your relational contracts. Being low-maintenance is often being low-priority by choice. Stating a preference is not the same as being difficult.",
      },
    ],
    cta: { label: "Journal on this →", action: "journal", param: "desire" },
  },
  {
    id: "V03",
    phrase: "More texting back when you feel like it, less performing availability",
    triggers: [
      {
        type: "transit",
        condition: "venus_aspecting_natal_venus",
        contextHeader: "Venus is aspecting your natal Venus",
        whyCopy:
          "When transiting Venus touches your natal Venus, your relationship to reciprocity gets recalibrated. Performing availability is a relational labor that nobody asked for. Responding on your timeline is honest, not rude.",
      },
    ],
  },
  {
    id: "V04",
    phrase: "More outfits that make you feel something, less dressing for the algorithm",
    triggers: [
      {
        type: "lord_of_year",
        condition: "venus",
        contextHeader: "Your Lord of the Year is Venus",
        whyCopy:
          "Venus years sharpen your aesthetics for an audience of one: you. Dressing for documentation is dressing for strangers. The outfit that makes you walk different is the one that matters.",
      },
    ],
  },
  {
    id: "V05",
    phrase: "More choosing partners who are actually available, less romanticizing the almost",
    triggers: [
      {
        type: "natal",
        condition: "venus_7th_house",
        contextHeader: "Venus is in your 7th house",
        whyCopy:
          "Natal Venus in the 7th house craves partnership deeply but can confuse potential with presence. The almost-relationship gives you a story without requiring you to be fully seen. Availability is not boring; it is the prerequisite.",
      },
    ],
    cta: { label: "Show me Venusian rituals →", action: "ritual_filter", param: "venusian" },
  },
  {
    id: "V06",
    phrase: "More the solo dinner out, less waiting for someone to go with",
    triggers: [
      {
        type: "sky",
        condition: "venus_retrograde",
        contextHeader: "Venus is retrograde",
        whyCopy:
          "Venus retrograde is your relationship with pleasure minus an audience. Waiting for company is sometimes waiting for permission. The solo dinner is practice in finding yourself sufficient.",
      },
    ],
  },
  {
    id: "V07",
    phrase: "More flowers for no reason, less waiting for them to earn the gesture",
    triggers: [
      {
        type: "transit",
        condition: "venus_aspecting_natal_venus",
        contextHeader: "Venus is aspecting your natal Venus",
        whyCopy:
          "Venus-Venus transits amplify your capacity for generosity without transaction. Gifts tied to deserving are wages, not love. The unreasonable gesture is the Venusian one.",
      },
    ],
  },
  {
    id: "V08",
    phrase: "More rest that actually feels restful, less rest that looks productive",
    triggers: [
      {
        type: "lord_of_year",
        condition: "venus",
        contextHeader: "Your Lord of the Year is Venus",
        whyCopy:
          "Venus years confront your inability to receive without earning. Productive rest is still production. Actual restoration often looks like nothing from the outside, and that is the point.",
      },
    ],
    cta: { label: "Journal on this →", action: "journal", param: "rest" },
  },
  {
    id: "V09",
    phrase: "More saying 'this is not what I ordered' at the restaurant, less eating it anyway",
    triggers: [
      {
        type: "natal",
        condition: "venus_7th_house",
        contextHeader: "Venus is in your 7th house",
        whyCopy:
          "Venus in the 7th can over-prioritize harmony to the point of self-erasure. Sending food back is a micro-practice in asking for what you actually wanted. The server is not going to cry.",
      },
    ],
  },
  {
    id: "V10",
    phrase: "More investing in the friendship that shows up, less chasing the one that does not",
    triggers: [
      {
        type: "sky",
        condition: "venus_retrograde",
        contextHeader: "Venus is retrograde",
        whyCopy:
          "Venus retrograde reviews where your relational energy is going. Chasing unavailability is a pattern, not a passion. The friendship that shows up consistently is worth more of your attention.",
      },
    ],
    cta: { label: "Show me Venusian rituals →", action: "ritual_filter", param: "venusian" },
  },

  // ─────────────────────────────────────────────────────────────────
  // MERCURIAL (8 phrases, ME01–ME08)
  // ─────────────────────────────────────────────────────────────────
  {
    id: "ME01",
    phrase: "More rereading the message once before spiraling, less inventing subtext",
    triggers: [
      {
        type: "sky",
        condition: "mercury_retrograde",
        contextHeader: "Mercury is retrograde",
        whyCopy:
          "Mercury retrograde increases the noise in your communication channels. The subtext you are reading is often static, not signal. One re-read before reacting costs you ten seconds and saves you hours.",
      },
    ],
    cta: { label: "Show me Mercurial rituals →", action: "ritual_filter", param: "mercurial" },
  },
  {
    id: "ME02",
    phrase: "More saying 'I do not understand' instead of nodding, less faking comprehension",
    triggers: [
      {
        type: "lord_of_year",
        condition: "mercury",
        contextHeader: "Your Lord of the Year is Mercury",
        whyCopy:
          "Mercury years reward precision over politeness in communication. Nodding when confused creates compound confusion. Admitting you do not understand is the fastest route to actually understanding.",
      },
    ],
  },
  {
    id: "ME03",
    phrase: "More one tab open, less forty-seven tabs as a personality",
    triggers: [
      {
        type: "transit",
        condition: "mercury_aspecting_natal",
        contextHeader: "Mercury is aspecting your natal Mercury",
        whyCopy:
          "Mercury-Mercury transits amplify your mental bandwidth but also your scatter. Forty-seven tabs is not curiosity; it is avoidance distributed across a browser. One tab is a commitment to actually reading it.",
      },
    ],
    cta: { label: "Journal on this →", action: "journal", param: "focus" },
  },
  {
    id: "ME04",
    phrase: "More voice memos, less perfecting the text for twenty minutes",
    triggers: [
      {
        type: "sky",
        condition: "mercury_retrograde",
        contextHeader: "Mercury is retrograde",
        whyCopy:
          "Mercury retrograde makes written precision harder to achieve. Your voice carries tone that text cannot. The imperfect voice memo communicates more accurately than the over-edited paragraph.",
      },
    ],
  },
  {
    id: "ME05",
    phrase: "More admitting you changed your mind, less defending the old position",
    triggers: [
      {
        type: "lord_of_year",
        condition: "mercury",
        contextHeader: "Your Lord of the Year is Mercury",
        whyCopy:
          "Mercury years value intellectual honesty over consistency. Defending a position you no longer hold is exhausting theater. Changing your mind publicly is a Mercurial superpower, not a weakness.",
      },
    ],
    cta: { label: "Show me Mercurial rituals →", action: "ritual_filter", param: "mercurial" },
  },
  {
    id: "ME06",
    phrase: "More writing it down somewhere you will find it, less trusting your memory",
    triggers: [
      {
        type: "transit",
        condition: "mercury_aspecting_natal",
        contextHeader: "Mercury is aspecting your natal Mercury",
        whyCopy:
          "Mercury transits speed up your mental processing but also increase the rate things slip through. Your memory is a sieve, not a vault. The note you can find later is worth more than the thought you definitely will not remember.",
      },
    ],
  },
  {
    id: "ME07",
    phrase: "More asking the clarifying question, less assuming the worst interpretation",
    triggers: [
      {
        type: "sky",
        condition: "mercury_retrograde",
        contextHeader: "Mercury is retrograde",
        whyCopy:
          "Mercury retrograde amplifies misunderstanding in both directions. Your worst-case interpretation is a story you wrote, not information you received. The clarifying question is cheaper than the fallout.",
      },
    ],
    cta: { label: "Journal on this →", action: "journal", param: "communication" },
  },
  {
    id: "ME08",
    phrase: "More reading the whole article, less sharing based on the headline",
    triggers: [
      {
        type: "lord_of_year",
        condition: "mercury",
        contextHeader: "Your Lord of the Year is Mercury",
        whyCopy:
          "Mercury years ask you to be rigorous about what you circulate. The headline is designed to provoke, not inform. Reading the whole piece before sharing is a micro-integrity practice.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // LUNAR (8 phrases, L01–L08)
  // ─────────────────────────────────────────────────────────────────
  {
    id: "L01",
    phrase: "More crying in the car and then going in, less pretending you are fine all day",
    triggers: [
      {
        type: "sky",
        condition: "full_moon",
        contextHeader: "The Full Moon is illuminating",
        whyCopy:
          "Full moons surface what you have been compressing. The car cry is efficient emotional hygiene. Pretending you are fine takes more energy than the five minutes of honest release.",
      },
    ],
    cta: { label: "Show me Lunar rituals →", action: "ritual_filter", param: "lunar" },
  },
  {
    id: "L02",
    phrase: "More canceling plans because you genuinely need to, less the excuse text",
    triggers: [
      {
        type: "sky",
        condition: "new_moon",
        contextHeader: "The New Moon is seeding",
        whyCopy:
          "New moons support withdrawal and inwardness. The elaborate excuse protects people from a truth they can handle: you need to be alone tonight. Canceling honestly is kinder than canceling elaborately.",
      },
    ],
  },
  {
    id: "L03",
    phrase: "More eating the meal at the table, less standing over the counter scrolling",
    triggers: [
      {
        type: "natal",
        condition: "cancer_emphasis",
        contextHeader: "Cancer is emphasized in your chart",
        whyCopy:
          "Cancer emphasis in the chart ties your emotional regulation to how you nourish yourself. Standing over the counter is feeding the body and starving the ritual. The table is a small act of self-parenting.",
      },
    ],
    cta: { label: "Journal on this →", action: "journal", param: "nourishment" },
  },
  {
    id: "L04",
    phrase: "More calling your mother (or not), less feeling guilty either way",
    triggers: [
      {
        type: "sky",
        condition: "full_moon",
        contextHeader: "The Full Moon is illuminating",
        whyCopy:
          "Full moons activate maternal and family dynamics. The guilt exists whether you call or not, so it is not useful decision-making data. Choose based on desire, not obligation, and let the guilt pass through.",
      },
    ],
  },
  {
    id: "L05",
    phrase: "More letting the mood pass through, less making a life decision based on it",
    triggers: [
      {
        type: "natal",
        condition: "cancer_emphasis",
        contextHeader: "Cancer is emphasized in your chart",
        whyCopy:
          "Strong Cancer placements experience moods as total environments. The mood feels permanent while it is happening, and it is not. Major decisions made inside a mood have a short shelf life.",
      },
    ],
    cta: { label: "Show me Lunar rituals →", action: "ritual_filter", param: "lunar" },
  },
  {
    id: "L06",
    phrase: "More the nap, less the third coffee",
    triggers: [
      {
        type: "sky",
        condition: "new_moon",
        contextHeader: "The New Moon is seeding",
        whyCopy:
          "New moon phases lower your available energy by design. The third coffee borrows from tomorrow. The twenty-minute nap is a deposit, not a withdrawal.",
      },
    ],
  },
  {
    id: "L07",
    phrase: "More acknowledging you are homesick for a place that does not exist, less trying to recreate it",
    triggers: [
      {
        type: "sky",
        condition: "full_moon",
        contextHeader: "The Full Moon is illuminating",
        whyCopy:
          "Full moons can trigger nostalgia for an idealized past. The place you miss may never have existed as you remember it. Naming the homesickness accurately frees you from the doomed recreation project.",
      },
    ],
    cta: { label: "Journal on this →", action: "journal", param: "nostalgia" },
  },
  {
    id: "L08",
    phrase: "More asking for help before you are desperate, less the crisis-mode request",
    triggers: [
      {
        type: "natal",
        condition: "cancer_emphasis",
        contextHeader: "Cancer is emphasized in your chart",
        whyCopy:
          "Cancer emphasis can create a pattern of self-sufficiency until collapse. Asking early feels vulnerable but produces better help. People respond more generously to a request than to an emergency.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // SOLAR (8 phrases, SO01–SO08)
  // ─────────────────────────────────────────────────────────────────
  {
    id: "SO01",
    phrase: "More doing it because you want to, less because it will look good",
    triggers: [
      {
        type: "lord_of_year",
        condition: "sun",
        contextHeader: "Your Lord of the Year is the Sun",
        whyCopy:
          "Sun years clarify your relationship to recognition. Doing things for the optics is a leak in your creative energy. The work that matters most often has no audience at all.",
      },
    ],
    cta: { label: "Show me Solar rituals →", action: "ritual_filter", param: "solar" },
  },
  {
    id: "SO02",
    phrase: "More taking up space without apologizing, less shrinking to fit",
    triggers: [
      {
        type: "natal",
        condition: "leo_emphasis",
        contextHeader: "Leo is emphasized in your chart",
        whyCopy:
          "Leo emphasis gives you a natural magnetism that can feel socially dangerous. Shrinking does not make others more comfortable; it just makes you less visible. Taking space without apology is not arrogance; it is accuracy.",
      },
    ],
  },
  {
    id: "SO03",
    phrase: "More making the thing you want to exist, less waiting for permission to start",
    triggers: [
      {
        type: "transit",
        condition: "sun_aspecting_natal",
        contextHeader: "The Sun is aspecting a natal planet",
        whyCopy:
          "Sun transits illuminate what you already know you want to make. Permission is a resource for employees, not creators. The thing you are waiting to be invited to make is something you can just begin.",
      },
    ],
    cta: { label: "Journal on this →", action: "journal", param: "creative_authority" },
  },
  {
    id: "SO04",
    phrase: "More celebrating your wins out loud, less the humble deflection",
    triggers: [
      {
        type: "lord_of_year",
        condition: "sun",
        contextHeader: "Your Lord of the Year is the Sun",
        whyCopy:
          "Sun years reward self-acknowledgment. The humble deflection is not modesty; it is a pre-emptive defense against envy. You did the work. Saying so is not bragging; it is accurate reporting.",
      },
    ],
  },
  {
    id: "SO05",
    phrase: "More main character energy, less narrator of everyone else's story",
    triggers: [
      {
        type: "natal",
        condition: "leo_emphasis",
        contextHeader: "Leo is emphasized in your chart",
        whyCopy:
          "Leo in the chart gives you protagonist energy that can get redirected into supporting roles. Narrating other people's stories is a way to stay visible without being vulnerable. Your story is the one that needs your attention.",
      },
    ],
    cta: { label: "Show me Solar rituals →", action: "ritual_filter", param: "solar" },
  },
  {
    id: "SO06",
    phrase: "More letting your work speak without the disclaimer, less pre-apologizing",
    triggers: [
      {
        type: "transit",
        condition: "sun_aspecting_natal",
        contextHeader: "The Sun is aspecting a natal planet",
        whyCopy:
          "Sun transits boost your confidence in what you have created. The disclaimer before showing work is a request for gentleness you may not need. Let it land without the cushion and see what happens.",
      },
    ],
  },
  {
    id: "SO07",
    phrase: "More being the one who decides, less polling everyone for consensus",
    triggers: [
      {
        type: "lord_of_year",
        condition: "sun",
        contextHeader: "Your Lord of the Year is the Sun",
        whyCopy:
          "Sun years develop your decision-making sovereignty. Polling for consensus distributes the risk but also dilutes the vision. Some decisions only need one vote: yours.",
      },
    ],
    cta: { label: "Journal on this →", action: "journal", param: "authority" },
  },
  {
    id: "SO08",
    phrase: "More saying your name first in the introduction, less letting them guess",
    triggers: [
      {
        type: "natal",
        condition: "leo_emphasis",
        contextHeader: "Leo is emphasized in your chart",
        whyCopy:
          "Leo placements can paradoxically under-introduce themselves, expecting to be recognized without declaration. Saying your name first is not ego; it is social clarity. You can make it easy for people to know you.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // JUPITERIAN (6 phrases, J01–J06)
  // ─────────────────────────────────────────────────────────────────
  {
    id: "J01",
    phrase: "More saying yes to the thing that scares you in a good way, less the safe yes",
    triggers: [
      {
        type: "lord_of_year",
        condition: "jupiter",
        contextHeader: "Your Lord of the Year is Jupiter",
        whyCopy:
          "Jupiter years expand through risk, not repetition. The safe yes keeps you comfortable and stagnant. The scary yes with excitement underneath it is Jupiter's preferred growth vector.",
      },
    ],
    cta: { label: "Show me Jupiterian rituals →", action: "ritual_filter", param: "jupiterian" },
  },
  {
    id: "J02",
    phrase: "More trusting that you will figure it out en route, less needing the full map first",
    triggers: [
      {
        type: "transit",
        condition: "jupiter_aspecting_natal",
        contextHeader: "Jupiter is aspecting a natal planet",
        whyCopy:
          "Jupiter transits reward faith in your own resourcefulness. Needing the full map is Saturn logic applied to a Jupiter moment. You have solved harder problems with less information than you have right now.",
      },
    ],
  },
  {
    id: "J03",
    phrase: "More generous interpretations of other people, less assuming malice",
    triggers: [
      {
        type: "lord_of_year",
        condition: "jupiter",
        contextHeader: "Your Lord of the Year is Jupiter",
        whyCopy:
          "Jupiter years soften your threat detection. Most people are operating from their own confusion, not from a plan to harm you. The generous interpretation costs you nothing and is right more often than the suspicious one.",
      },
    ],
    cta: { label: "Journal on this →", action: "journal", param: "trust" },
  },
  {
    id: "J04",
    phrase: "More spending on the experience, less on the thing",
    triggers: [
      {
        type: "transit",
        condition: "jupiter_aspecting_natal",
        contextHeader: "Jupiter is aspecting a natal planet",
        whyCopy:
          "Jupiter transits make experiences more growth-producing than acquisitions. The thing depreciates; the experience compounds. Jupiter wants you expanded, not decorated.",
      },
    ],
  },
  {
    id: "J05",
    phrase: "More applying even though you are underqualified, less self-selecting out",
    triggers: [
      {
        type: "lord_of_year",
        condition: "jupiter",
        contextHeader: "Your Lord of the Year is Jupiter",
        whyCopy:
          "Jupiter years reward overreach. Self-selecting out is a decision made on incomplete data about your own capability. The application costs you fifteen minutes; the self-rejection costs you a possible future.",
      },
    ],
    cta: { label: "Show me Jupiterian rituals →", action: "ritual_filter", param: "jupiterian" },
  },
  {
    id: "J06",
    phrase: "More laughing at yourself mid-crisis, less taking every setback as a sign",
    triggers: [
      {
        type: "transit",
        condition: "jupiter_aspecting_natal",
        contextHeader: "Jupiter is aspecting a natal planet",
        whyCopy:
          "Jupiter transits give you philosophical distance from your own drama. The setback is data, not prophecy. The ability to laugh mid-disaster is a form of spiritual leverage.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // NEPTUNIAN (not originally listed in distribution but rounding out)
  // ─────────────────────────────────────────────────────────────────

  // ─────────────────────────────────────────────────────────────────
  // SKY EVENTS (6 phrases, SK01–SK06)
  // ─────────────────────────────────────────────────────────────────
  {
    id: "SK01",
    phrase: "More accepting that nothing is clear right now, less forcing a decision in the fog",
    triggers: [
      {
        type: "sky",
        condition: "eclipse_season",
        contextHeader: "Eclipse season is active",
        whyCopy:
          "Eclipse seasons scramble your usual clarity by design. Decisions made during eclipses often get revised once the dust settles. Waiting is not passivity right now; it is the only honest response to incomplete information.",
      },
    ],
    cta: { label: "Ask Dolly about this →", action: "dolly", param: "eclipse_season" },
  },
  {
    id: "SK02",
    phrase: "More noticing what feels suddenly non-negotiable, less ignoring the shift",
    triggers: [
      {
        type: "sky",
        condition: "eclipse_season",
        contextHeader: "Eclipse season is active",
        whyCopy:
          "Eclipses accelerate changes that were already in motion underground. The thing that suddenly became non-negotiable was probably approaching that status for months. The eclipse just removed the option to keep pretending.",
      },
    ],
    cta: { label: "Journal on this →", action: "journal", param: "non_negotiables" },
  },
  {
    id: "SK03",
    phrase: "More patience with the transition period, less rushing to the new normal",
    triggers: [
      {
        type: "sky",
        condition: "saturn_ingress",
        contextHeader: "Saturn is changing signs",
        whyCopy:
          "Saturn ingresses mark a collective shift in what feels structurally stable. The transition between old rules and new ones is uncomfortable by nature. Rushing to establish a new normal before the ground stops moving wastes energy.",
      },
    ],
  },
  {
    id: "SK04",
    phrase: "More updating your ambitions to match who you actually are now, less chasing the 2019 version",
    triggers: [
      {
        type: "sky",
        condition: "saturn_ingress",
        contextHeader: "Saturn is changing signs",
        whyCopy:
          "Saturn sign changes mark a new developmental chapter for everyone. The ambitions you set under the previous Saturn sign may no longer fit the person you have become. You are allowed to want different things now.",
      },
    ],
    cta: { label: "Ask Dolly about this →", action: "dolly", param: "saturn_ingress" },
  },
  {
    id: "SK05",
    phrase: "More paying attention to what is beginning, less mourning what ended",
    triggers: [
      {
        type: "sky",
        condition: "major_conjunction",
        contextHeader: "A major conjunction is forming",
        whyCopy:
          "Major conjunctions seed new cycles that take years to fully unfold. The ending that preceded this moment was making room. What is quietly beginning now may not be visible for months, but it is already real.",
      },
    ],
  },
  {
    id: "SK06",
    phrase: "More collective patience, less personal blame for collective problems",
    triggers: [
      {
        type: "sky",
        condition: "major_conjunction",
        contextHeader: "A major conjunction is forming",
        whyCopy:
          "Major planetary conjunctions affect everyone simultaneously. The difficulty you are experiencing may not be personal failure; it may be the weather. Distinguishing between your stuff and the collective stuff is a skill worth practicing.",
      },
    ],
    cta: { label: "Ask Dolly about this →", action: "dolly", param: "major_conjunction" },
  },
];
