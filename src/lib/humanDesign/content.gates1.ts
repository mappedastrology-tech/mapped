import type { GateContent } from "./content.types";

/**
 * Human Design gates 1–32, drawn from the 64 hexagrams of the I Ching and
 * named in the Ra Uru Hu / Jovian Archive tradition.
 *
 * Each gate is a specific creative frequency. Its six lines follow the
 * universal profile archetypes — 1 the foundation-seeking Investigator,
 * 2 the natural Hermit, 3 the trial-and-error Martyr, 4 the relational
 * Opportunist, 5 the projected-upon Heretic, 6 the transitioning Role
 * Model — each colored by the theme of the gate it belongs to.
 */
export const GATES_1_32: Record<number, GateContent> = {
  1: {
    number: 1,
    name: "Gate 1 — Self-Expression",
    keynote: "The creative spark",
    description:
      "You carry the raw creative impulse that turns inner life into form. This is the drive to express something singular — art, presence, a way of being — that could not exist without you. When you honor it, your originality becomes a contribution the world receives.",
    lines: {
      1: "You need a solid, self-contained inner foundation before your creativity is ready to meet an audience.",
      2: "Creativity flows through you naturally and effortlessly, best expressed when you are simply left alone to it.",
      3: "You discover your voice through experiment and misfire, refining the work by living its failures firsthand.",
      4: "Your expression finds its home through the right people and networks who carry it outward for you.",
      5: "Others project leadership onto your creativity, expecting your originality to rescue and inspire the collective.",
      6: "You move from raw self-expression through withdrawal toward becoming a living example of authentic creation.",
    },
  },
  2: {
    number: 2,
    name: "Gate 2 — Direction of the Self",
    keynote: "The keeper of direction",
    description:
      "You hold an inner compass that knows where things belong and where they are headed. This is receptive, magnetic knowing rather than force — you set direction by attracting the right drivers and resources toward a course only you can sense.",
    lines: {
      1: "Your sense of direction rests on a quiet, intuitive foundation you cannot fully explain but deeply trust.",
      2: "You know the way naturally, and life responds by placing the vehicles and people your direction needs.",
      3: "You find true north through wrong turns, learning your orientation by testing paths that don't hold.",
      4: "Your direction is realized through the specific allies and relationships drawn into your magnetic field.",
      5: "People look to you to steer them, projecting onto you a leadership your knowing may or may not want.",
      6: "You mature from setting your own course into modeling wise, grounded direction for those who follow.",
    },
  },
  3: {
    number: 3,
    name: "Gate 3 — Ordering",
    keynote: "Order out of newness",
    description:
      "You carry the pulse of new beginnings and the struggle to bring them into workable order. Innovation arrives through you as raw, sometimes chaotic mutation. Your gift is the patience to endure the difficulty of the start until fresh life takes stable form.",
    lines: {
      1: "You build order from a stable base, holding steady while the new struggles to establish itself.",
      2: "Order emerges through you naturally when you retreat and let readiness ripen in its own time.",
      3: "You establish the new through repeated trial, learning what works only by pushing against what doesn't.",
      4: "You bring order into being through the right connections who help stabilize what you begin.",
      5: "Others lean on you to organize the chaos, expecting your innovation to deliver a workable structure.",
      6: "You move from wrestling with beginnings toward embodying a settled, generative order others can trust.",
    },
  },
  4: {
    number: 4,
    name: "Gate 4 — Formulization",
    keynote: "Answers and mental solutions",
    description:
      "You are wired to formulate answers, to reach for logical solutions to the doubts and questions life poses. Your mind wants to resolve confusion into understanding. The gift matures when you let answers be tested by time rather than rushed into certainty.",
    lines: {
      1: "You ground your answers in a tested foundation, unwilling to offer a solution you haven't secured.",
      2: "Solutions arrive through you naturally, clearest when you follow your own rhythm rather than pressure.",
      3: "You reach understanding through trial, discarding the formulas that fail until a workable answer remains.",
      4: "Your answers land through relationship, shared with the specific people ready to receive and apply them.",
      5: "People project the role of problem-solver onto you, expecting your logic to resolve their uncertainty.",
      6: "You grow from chasing answers toward becoming a settled, trustworthy source of tested understanding.",
    },
  },
  5: {
    number: 5,
    name: "Gate 5 — Fixed Rhythms",
    keynote: "Natural timing and patterns",
    description:
      "You carry a deep, fixed rhythm — the body's need for its own patterns and timing. Rituals, routines, and cycles ground you and, through you, help others attune to natural time. Honoring your rhythm keeps you steady and in flow with life's larger pulse.",
    lines: {
      1: "Your rhythm rests on a reliable foundation of habits that keep you rooted and ready for anything.",
      2: "Your natural timing flows best when honored simply, without others interfering in your rituals.",
      3: "You discover your true rhythm by breaking it and feeling the cost of patterns that don't fit.",
      4: "Your rhythm syncs with the right people, and shared timing becomes a bond of belonging.",
      5: "Others rely on your steadiness, projecting onto your rhythm a stability they want to lean into.",
      6: "You move from rigidly holding your patterns toward modeling a flexible, life-affirming timing.",
    },
  },
  6: {
    number: 6,
    name: "Gate 6 — Friction",
    keynote: "Emotional friction and intimacy",
    description:
      "You are the gatekeeper of emotional friction — the charged boundary that decides who and what gets close. This gate governs conflict, intimacy, and receptivity in cycles. Your feeling-driven timing shapes relationships, turning friction into the doorway to real connection.",
    lines: {
      1: "You need a secure inner base before you open the gate, testing whether closeness is truly safe.",
      2: "Your emotional boundaries respond naturally, opening and closing without needing to justify themselves.",
      3: "You learn intimacy through clashes, discovering what connection means by living its conflicts.",
      4: "Your receptivity is shaped by relationship, deepening with the specific people who earn your closeness.",
      5: "Others project a peacemaker onto you, expecting your emotional field to reconcile their differences.",
      6: "You mature from reactive friction toward embodying wise, well-timed intimacy and true acceptance.",
    },
  },
  7: {
    number: 7,
    name: "Gate 7 — The Role of the Self",
    keynote: "Leadership through influence",
    description:
      "You carry the capacity to guide the collective into the future — leadership expressed not through force but through the right influence at the right time. Your gift is direction that serves the whole, offered so others can move forward together toward what's next.",
    lines: {
      1: "You lead from a grounded foundation, an authoritative guide whose direction rests on solid conviction.",
      2: "Your leadership is natural and democratic, most effective when you are simply called upon to serve.",
      3: "You learn to lead through trial, refining your influence by living the failures of misjudged direction.",
      4: "You guide through relationship and alliance, leading best behind the scenes with trusted others.",
      5: "The collective projects general and rescuer onto you, expecting your leadership to save the situation.",
      6: "You move from actively leading toward becoming a role model whose example quietly sets direction.",
    },
  },
  8: {
    number: 8,
    name: "Gate 8 — Contribution",
    keynote: "Making a difference",
    description:
      "You hold the drive to contribute your individuality in service of something worthwhile — to stand behind what matters and make a difference through authentic expression. Your gift is inspiring others to bring their creativity forward by championing what deserves to be seen.",
    lines: {
      1: "You contribute from a foundation of integrity, unwilling to stand behind anything you don't believe.",
      2: "Your contribution flows naturally, most powerful when you express your individuality without pretense.",
      3: "You learn how to make a difference through trial, refining your offering by what fails to land.",
      4: "Your contribution reaches the world through the right people who amplify what you champion.",
      5: "Others project a spokesperson onto you, expecting your voice to represent and rally the collective.",
      6: "You grow from asserting your contribution toward modeling authentic, quietly influential presence.",
    },
  },
  9: {
    number: 9,
    name: "Gate 9 — Focus",
    keynote: "The power of detail",
    description:
      "You carry the energy to focus — to concentrate on the details that make a larger vision actually work. This is the gift of sustained attention, the patience to attend to the small things that fuel and complete what matters. Your focus makes big things possible.",
    lines: {
      1: "Your focus rests on a foundation of what genuinely matters, filtering distraction before you commit.",
      2: "You concentrate naturally on the right details, most effective when left to your own absorption.",
      3: "You learn what deserves your focus through trial, discovering priorities by chasing the wrong ones first.",
      4: "Your focus is directed through relationship, attending to what the right people help you see matters.",
      5: "Others project efficiency onto you, expecting your concentration to deliver results they can rely on.",
      6: "You mature from scattered attention toward modeling disciplined, well-chosen focus for others.",
    },
  },
  10: {
    number: 10,
    name: "Gate 10 — Behavior of the Self",
    keynote: "Love of self, authentic behavior",
    description:
      "You carry the principle of loving yourself and behaving as your true nature dictates. This gate is about self-acceptance expressed through conduct — living your own way without apology. When you honor it, your authenticity gives others permission to be themselves too.",
    lines: {
      1: "Your authentic behavior rests on self-acceptance, a foundation of loving yourself exactly as you are.",
      2: "You behave naturally as yourself, at your best when free to follow your own way undisturbed.",
      3: "You find authentic conduct through trial, learning who you are by living behaviors that don't fit.",
      4: "Your self-expression is shaped by relationship, your authenticity finding love through the right people.",
      5: "Others project a model of behavior onto you, expecting your conduct to teach them how to live.",
      6: "You move from perfecting your own behavior toward becoming a living example of authentic living.",
    },
  },
  11: {
    number: 11,
    name: "Gate 11 — Ideas",
    keynote: "A wealth of ideas",
    description:
      "You are a vessel for ideas — a mind rich with concepts, images, and stories seeking expression. These ideas are meant to stimulate and be shared, not necessarily acted upon by you. Your gift is offering thought that inspires others to find their own meaning.",
    lines: {
      1: "Your ideas rest on a foundation of harmony and values, grounded in what feels right and true.",
      2: "Ideas arise in you naturally and abundantly, flowing best when you aren't pressured to explain them.",
      3: "You test your ideas through experience, learning which concepts hold by living the ones that don't.",
      4: "Your ideas find their audience through relationship, shared with the right people who carry them.",
      5: "Others project a teacher onto you, expecting your ideas to enlighten and resolve their confusion.",
      6: "You grow from generating ideas toward modeling a wise, discerning relationship with your own mind.",
    },
  },
  12: {
    number: 12,
    name: "Gate 12 — Caution",
    keynote: "Expression in the right moment",
    description:
      "You carry a discerning, moody voice that speaks with power only in the right moment. This gate weighs caution against expression, waiting for the mood and timing that let your words truly move people. When aligned, your articulation is transformative and deeply felt.",
    lines: {
      1: "You express from a considered foundation, cautious with your voice until the ground feels secure.",
      2: "Your expression flows naturally when the mood is right, best when you speak without being pushed.",
      3: "You learn the power of timing through trial, discovering when to speak by misjudging the moment.",
      4: "Your voice lands through relationship, its impact shaped by the specific people ready to hear it.",
      5: "Others project eloquence onto you, expecting your words to articulate what they cannot say themselves.",
      6: "You mature from cautious expression toward modeling articulate, well-timed, transformative speech.",
    },
  },
  13: {
    number: 13,
    name: "Gate 13 — The Listener",
    keynote: "Keeper of secrets and stories",
    description:
      "You are the one others confide in — the listener who holds the stories, secrets, and history of those around you. This gate gathers experience and reflects it back as meaning and direction. Your gift is witnessing life so its lessons can guide the way forward.",
    lines: {
      1: "You listen from a foundation of empathy, a confidant whose steadiness makes others feel safe.",
      2: "You hold others' stories naturally, drawing confidences to you simply by being present and open.",
      3: "You learn the weight of what you carry through trial, discovering discretion by mishandling trust.",
      4: "You become a keeper of stories through relationship, entrusted by the specific people who need you.",
      5: "Others project a savior onto you, expecting your listening to redeem and make sense of their past.",
      6: "You grow from absorbing every story toward modeling wise, discerning witness to human experience.",
    },
  },
  14: {
    number: 14,
    name: "Gate 14 — Power Skills",
    keynote: "Power of the life force",
    description:
      "You carry a powerful life force and the resources to direct it toward meaningful work. This gate fuels your capacity to generate abundance through what you love. When you follow what lights you up, your energy attracts the means to make it prosper.",
    lines: {
      1: "Your power rests on a grounded foundation, directing your force only toward what genuinely matters.",
      2: "Your life force flows naturally into work you love, most abundant when you follow your own energy.",
      3: "You learn to steward your power through trial, discovering right direction by burning through the wrong.",
      4: "Your resources multiply through relationship, your power finding fertile ground with the right people.",
      5: "Others project provider onto you, expecting your abundance to fund and sustain the collective's needs.",
      6: "You mature from wielding raw power toward modeling generous, purposeful stewardship of resources.",
    },
  },
  15: {
    number: 15,
    name: "Gate 15 — Extremes",
    keynote: "Love of humanity, embracing extremes",
    description:
      "You hold a love for the full range of human life — the rhythms, the extremes, the outliers others reject. This gate embraces diversity without judgment, flowing between poles rather than fixing on one. Your gift is a humanity wide enough to include everyone.",
    lines: {
      1: "Your acceptance rests on a humble foundation, embracing extremes without needing to stand above them.",
      2: "You move through life's rhythms naturally, flowing between extremes best when left to your own tempo.",
      3: "You learn the range of humanity through trial, embracing diversity by living its uncomfortable extremes.",
      4: "Your inclusive love is expressed through relationship, embracing the specific people life brings you.",
      5: "Others project a humanitarian onto you, expecting your acceptance to hold space for the whole spectrum.",
      6: "You grow from swinging through extremes toward modeling a grounded, all-embracing love of humanity.",
    },
  },
  16: {
    number: 16,
    name: "Gate 16 — Skills",
    keynote: "Enthusiasm and mastery",
    description:
      "You carry the enthusiasm that fuels skill and mastery. This gate is the leap into experimentation — the excitement that drives you to practice, refine, and become genuinely good at what you love. Your zeal is contagious, inspiring others to develop their own talents.",
    lines: {
      1: "Your enthusiasm rests on a foundation of readiness, refusing to leap until your skill is truly prepared.",
      2: "Your talent expresses naturally, at its best when you're free to practice and play without pressure.",
      3: "You reach mastery through trial, developing real skill by living the failures that teach you.",
      4: "Your enthusiasm finds its outlet through relationship, your talents amplified by the right people.",
      5: "Others project expertise onto you, expecting your skill to deliver the mastery they're counting on.",
      6: "You mature from raw enthusiasm toward modeling accomplished, well-honed mastery for others to follow.",
    },
  },
  17: {
    number: 17,
    name: "Gate 17 — Opinions",
    keynote: "Logical opinions and insight",
    description:
      "You carry structured opinions born of logic — a mind that organizes observation into perspectives worth sharing. This gate wants to offer viewpoints that make sense of patterns. Your gift is well-formed insight that, when welcomed, guides others toward clearer thinking.",
    lines: {
      1: "Your opinions rest on a tested foundation, unwilling to voice a perspective you haven't examined.",
      2: "Your viewpoints form naturally from clear seeing, strongest when you share them without pressure.",
      3: "You refine your opinions through trial, discarding the perspectives that fail against experience.",
      4: "Your opinions land through relationship, shared with the specific people who value your perspective.",
      5: "Others project authority onto you, expecting your opinions to settle their questions with certainty.",
      6: "You grow from asserting opinions toward modeling balanced, well-considered perspective for others.",
    },
  },
  18: {
    number: 18,
    name: "Gate 18 — Correction",
    keynote: "The drive to improve",
    description:
      "You carry a sharp eye for what could be better — the instinct to correct flaws and restore what has been compromised. This gate is the drive to improve patterns for the good of all. Directed well, your critical gift becomes a force for genuine repair.",
    lines: {
      1: "Your corrections rest on a principled foundation, addressing flaws from a place of real integrity.",
      2: "You spot what needs mending naturally, most effective when trusted to fix things your own way.",
      3: "You learn discerning correction through trial, refining your judgment by overreaching and pulling back.",
      4: "Your improvements are welcomed through relationship, offered to the specific people ready for them.",
      5: "Others project a reformer onto you, expecting your correction to fix what's broken in the collective.",
      6: "You mature from compulsive fault-finding toward modeling wise, well-aimed improvement of what matters.",
    },
  },
  19: {
    number: 19,
    name: "Gate 19 — Wanting",
    keynote: "Sensitivity to needs",
    description:
      "You are exquisitely attuned to needs — your own and others', material and emotional. This gate senses what the community requires to feel resourced and connected. Your gift is a sensitivity that gathers people and provisions, ensuring no one is left wanting.",
    lines: {
      1: "Your sensitivity rests on a foundation of self-sufficiency, meeting your own needs before others'.",
      2: "You sense what's needed naturally, attuned to the community best when you honor your own rhythm.",
      3: "You learn the balance of needs through trial, discovering healthy interdependence by overgiving.",
      4: "Your attunement works through relationship, meeting needs through the specific people you bond with.",
      5: "Others project a provider onto you, expecting your sensitivity to anticipate and satisfy their needs.",
      6: "You grow from reactive wanting toward modeling grounded, discerning care for what people truly need.",
    },
  },
  20: {
    number: 20,
    name: "Gate 20 — The Now",
    keynote: "Presence and being",
    description:
      "You carry the power of the present moment — the capacity to be fully here and to act, or speak, from immediate awareness. This gate is aliveness expressed in the now. Your gift is presence that meets life directly, without hesitation or delay.",
    lines: {
      1: "Your presence rests on a foundation of self-awareness, rooted in knowing yourself in the moment.",
      2: "You inhabit the now naturally, most alive when free to be present without demand or distraction.",
      3: "You learn true presence through trial, discovering aliveness by living moments you handled wrongly.",
      4: "Your presence is expressed through relationship, meeting the now most fully with the right people.",
      5: "Others project immediacy onto you, expecting your presence to act decisively in the moment for them.",
      6: "You mature from grasping at the now toward modeling effortless, embodied presence for others.",
    },
  },
  21: {
    number: 21,
    name: "Gate 21 — The Hunter/Huntress",
    keynote: "Control and rightful authority",
    description:
      "You carry the drive to be in charge of your own domain — the rightful, necessary use of control over what falls under your care. This gate is the hunter who manages resources and territory. Your gift is leadership that governs well what genuinely belongs to you.",
    lines: {
      1: "Your authority rests on a secure foundation, taking control only where your ground is truly your own.",
      2: "You govern naturally, exercising control most effectively when left to manage in your own way.",
      3: "You learn rightful control through trial, discovering what you can and cannot govern by overreaching.",
      4: "Your authority operates through relationship, your control accepted by the specific people you lead.",
      5: "Others project a leader onto you, expecting your control to organize and secure their resources.",
      6: "You grow from grasping for control toward modeling measured, rightful authority over what's yours.",
    },
  },
  22: {
    number: 22,
    name: "Gate 22 — Openness",
    keynote: "Grace and social openness",
    description:
      "You carry grace — a moody, emotional openness that draws people in and softens hard moments. This gate meets the social world with charm and receptivity, in its own rhythm. When your timing is right, your presence lends beauty and dignity to any encounter.",
    lines: {
      1: "Your grace rests on a foundation of composure, meeting others openly from settled inner ground.",
      2: "Your charm flows naturally in the right mood, most graceful when you aren't forced to perform.",
      3: "You learn social grace through trial, refining your openness by living the moments you misread.",
      4: "Your grace works through relationship, its beauty expressed with the specific people you welcome.",
      5: "Others project charm onto you, expecting your openness to ease and elevate the social atmosphere.",
      6: "You mature from moody openness toward modeling gracious, emotionally attuned presence with others.",
    },
  },
  23: {
    number: 23,
    name: "Gate 23 — Assimilation",
    keynote: "Individual knowing, simplifying",
    description:
      "You carry the gift of translating complex, individual insight into simple, understandable language. This gate assimilates knowing and delivers it as clarity — the right words that make the unfamiliar make sense. Voiced at the right moment, your insight can shift understanding entirely.",
    lines: {
      1: "Your knowing rests on a solid foundation, translating insight only when you're sure of the ground.",
      2: "Your clarity flows naturally, simplifying the complex best when you speak in your own time.",
      3: "You learn effective translation through trial, refining your words by the times they don't land.",
      4: "Your insight is shared through relationship, offered to the specific people ready to understand.",
      5: "Others project a knower onto you, expecting your clarity to resolve their confusion with certainty.",
      6: "You grow from voicing raw insight toward modeling clear, well-timed simplification of the complex.",
    },
  },
  24: {
    number: 24,
    name: "Gate 24 — Rationalization",
    keynote: "Returning and reflection",
    description:
      "You carry the mind that returns again and again to a question until understanding arrives. This gate rationalizes, reflects, and reworks a thought until it resolves into insight. Your gift is the patience to sit with mystery until it yields real clarity.",
    lines: {
      1: "Your reflection rests on a foundation of solitude, returning to your questions from quiet inner ground.",
      2: "Understanding returns to you naturally, arriving best when you're left to your own contemplation.",
      3: "You reach clarity through trial, working a question over by living the answers that don't hold.",
      4: "Your insight is refined through relationship, your reflections sharpened by the right conversations.",
      5: "Others project a wise mind onto you, expecting your reflection to deliver the understanding they seek.",
      6: "You mature from restless rethinking toward modeling patient, settled understanding of life's questions.",
    },
  },
  25: {
    number: 25,
    name: "Gate 25 — The Spirit of the Self",
    keynote: "Universal love, innocence",
    description:
      "You carry the spirit of universal love — an innocent, impartial love that extends to all of life without condition. This gate is the higher self expressed through pure being. Your gift is a love that isn't personal or earned, but simply given, from the heart.",
    lines: {
      1: "Your love rests on a foundation of innocence, extending unconditionally from a pure and open heart.",
      2: "Universal love flows through you naturally, purest when you're free to be innocent without demand.",
      3: "You learn true love through trial, your innocence tempered and deepened by the wounds you survive.",
      4: "Your love is expressed through relationship, given freely to the specific people life brings near.",
      5: "Others project a healer onto you, expecting your love to redeem and restore what they've lost.",
      6: "You grow from tested innocence toward modeling a mature, unconditional love of the whole of life.",
    },
  },
  26: {
    number: 26,
    name: "Gate 26 — The Egoist",
    keynote: "Willpower and persuasion",
    description:
      "You carry the will to persuade and the ego strength to make things happen. This gate is the salesperson and transmitter — able to convey a truth compellingly and turn effort into reward. Used with integrity, your influence moves people toward what genuinely serves.",
    lines: {
      1: "Your persuasion rests on a foundation of integrity, willing only to sell what you truly believe.",
      2: "Your influence flows naturally, most convincing when you follow your own will rather than pressure.",
      3: "You learn honest persuasion through trial, refining your pitch by the times it rings false.",
      4: "Your will works through relationship, your persuasion landing with the specific people you engage.",
      5: "Others project a closer onto you, expecting your willpower to deliver the results they need.",
      6: "You mature from egoic pushing toward modeling honest, well-earned influence and rightful reward.",
    },
  },
  27: {
    number: 27,
    name: "Gate 27 — Caring",
    keynote: "Nourishment and responsibility",
    description:
      "You carry the instinct to care — to nourish, protect, and take responsibility for the wellbeing of others. This gate feeds the community, materially and emotionally. Your gift is a nurturing that sustains life, offered rightly when you tend yourself as well as others.",
    lines: {
      1: "Your care rests on a foundation of self-nourishment, giving fully only when you're resourced yourself.",
      2: "You nurture naturally, caring for others best when free to give in your own instinctive way.",
      3: "You learn healthy caregiving through trial, finding the line between nourishing and depleting yourself.",
      4: "Your care works through relationship, your nourishment directed toward the specific people you tend.",
      5: "Others project a caretaker onto you, expecting your nurturing to sustain and protect them.",
      6: "You grow from over-responsibility toward modeling balanced, sustainable care for self and community.",
    },
  },
  28: {
    number: 28,
    name: "Gate 28 — The Game Player",
    keynote: "The struggle for meaning",
    description:
      "You carry the drive to find purpose worth living for — a willingness to take risks and struggle in search of meaning. This gate wrestles with mortality and value, testing what makes life count. Your gift is the courage to fight for what truly matters.",
    lines: {
      1: "Your search for meaning rests on a foundation of preparation, refusing to risk without solid footing.",
      2: "You find purpose naturally, sensing what's worth the struggle best when you follow your own instinct.",
      3: "You discover meaning through trial, learning what matters by risking and losing and trying again.",
      4: "Your purpose is found through relationship, meaning revealed alongside the specific people you fight beside.",
      5: "Others project a risk-taker onto you, expecting your courage to fight the battles they can't.",
      6: "You mature from reckless struggle toward modeling meaningful, well-chosen risk in service of value.",
    },
  },
  29: {
    number: 29,
    name: "Gate 29 — Perseverance",
    keynote: "Commitment and saying yes",
    description:
      "You carry the power to commit fully — to say yes and see a thing through with unwavering perseverance. This gate is devotion to the experience once entered. Your gift is a reliability that discovers depth by staying, so long as you say yes only when it's truly right.",
    lines: {
      1: "Your commitment rests on a considered foundation, saying yes only when the ground is genuinely sound.",
      2: "You persevere naturally, most devoted when you commit in your own rhythm rather than under pressure.",
      3: "You learn wise commitment through trial, discovering what to say yes to by enduring the wrong yeses.",
      4: "Your devotion works through relationship, your commitment deepened by the specific people you serve.",
      5: "Others project reliability onto you, expecting your perseverance to carry the commitment through.",
      6: "You grow from overcommitting toward modeling discerning, wholehearted devotion to the right things.",
    },
  },
  30: {
    number: 30,
    name: "Gate 30 — Feelings",
    keynote: "Desire and yearning",
    description:
      "You carry the fire of desire — a passionate yearning for experience that drives you toward what you long for. This gate feels life intensely, fueled by the dream of what could be. Your gift is a longing that lights up life, tempered by learning which desires to follow.",
    lines: {
      1: "Your desire rests on a foundation of composure, feeling deeply without being swept entirely away.",
      2: "Your yearning burns naturally, brightest when you follow your own longing free of outside pressure.",
      3: "You learn which desires to trust through trial, discovering fulfillment by chasing the wrong ones first.",
      4: "Your passion is expressed through relationship, your yearning shared with the specific people you desire.",
      5: "Others project intensity onto you, expecting your fire to spark the passion they can't reach alone.",
      6: "You mature from being ruled by desire toward modeling a wise, discerning relationship with longing.",
    },
  },
  31: {
    number: 31,
    name: "Gate 31 — Influence",
    keynote: "Leadership through influence",
    description:
      "You carry the voice of influence — the natural leader whose words guide the collective toward the future. This gate leads by being chosen, speaking for those who follow. Your gift is influence that serves the group, offered when others genuinely recognize and invite it.",
    lines: {
      1: "Your influence rests on a foundation of preparation, leading only when your position is truly earned.",
      2: "You lead naturally, your influence most effective when you're recognized rather than self-appointed.",
      3: "You learn true leadership through trial, refining your influence by the times you overstep or fail.",
      4: "Your influence works through relationship, your leadership carried by the specific people who support you.",
      5: "Others project a leader onto you, expecting your influence to represent and guide them forward.",
      6: "You grow from asserting influence toward modeling wise, invited leadership that serves the collective.",
    },
  },
  32: {
    number: 32,
    name: "Gate 32 — Continuity",
    keynote: "Instinct for what lasts",
    description:
      "You carry an instinct for what will endure — the discernment to sense which ventures, people, and changes have lasting value. This gate protects continuity by knowing what to keep and what to let go. Your gift is a fear-tempered wisdom about how things succeed over time.",
    lines: {
      1: "Your instinct rests on a foundation of conservatism, protecting what lasts by valuing proven ground.",
      2: "You sense enduring value naturally, most discerning when trusted to read the future your own way.",
      3: "You learn what endures through trial, discovering lasting worth by backing the things that fail.",
      4: "Your discernment works through relationship, sensing lasting value alongside the right people.",
      5: "Others project foresight onto you, expecting your instinct to safeguard what the group builds.",
      6: "You mature from anxious clinging toward modeling grounded, far-seeing wisdom about what truly lasts.",
    },
  },
};
