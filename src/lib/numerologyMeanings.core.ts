/**
 * Core numerology meanings: archetypes, Life Path, and Expression.
 *
 * VOICE: warm, literate, mystical-but-grounded, speaking to a smart adult.
 * Sincere about the symbolic tradition — confident and specific, never skeptical.
 * Second person for the personal positions. Written by a thoughtful numerologist.
 */

import type { Archetype, PositionMeanings } from "./numerologyMeanings.types";

export const CORE_ARCHETYPES: Record<number, Archetype> = {
  1: {
    number: 1,
    title: "The Leader",
    keyword: "initiative, independence, will, originality",
    essence:
      "The number of beginnings and the singular self. One carries the spark of initiative — the courage to stand alone and set something in motion.",
    strengths: "Pioneering drive, decisiveness, and the nerve to go first.",
    shadow: "Domineering, impatient, or isolated by its own self-reliance.",
  },
  2: {
    number: 2,
    title: "The Peacemaker",
    keyword: "harmony, partnership, diplomacy, sensitivity",
    essence:
      "The number of relationship and balance. Two senses what others feel and works quietly to bring opposing forces into accord.",
    strengths: "Tact, patience, and a gift for cooperation and gentle persuasion.",
    shadow: "Over-accommodation, indecision, or losing oneself to keep the peace.",
  },
  3: {
    number: 3,
    title: "The Communicator",
    keyword: "expression, creativity, joy, imagination",
    essence:
      "The number of self-expression and delight. Three turns feeling into language, color, and play, lifting the spirits of everyone nearby.",
    strengths: "Charm, artistry, optimism, and a natural gift for words.",
    shadow: "Scattered energy, superficiality, or moodiness when unexpressed.",
  },
  4: {
    number: 4,
    title: "The Builder",
    keyword: "structure, discipline, order, foundation",
    essence:
      "The number of form and foundation. Four makes ideas durable — laying brick on brick until something stands that will last.",
    strengths: "Reliability, diligence, and a steady hand with practical detail.",
    shadow: "Rigidity, stubbornness, or work that hardens into drudgery.",
  },
  5: {
    number: 5,
    title: "The Adventurer",
    keyword: "freedom, change, curiosity, sensation",
    essence:
      "The number of motion and freedom. Five craves experience and variety, restless to taste everything life can offer.",
    strengths: "Adaptability, magnetism, and fearless appetite for the new.",
    shadow: "Restlessness, excess, or scattering itself across too many doors.",
  },
  6: {
    number: 6,
    title: "The Nurturer",
    keyword: "love, responsibility, service, harmony",
    essence:
      "The number of care and responsibility. Six tends the home and the heart, holding family and community together with devotion.",
    strengths: "Warmth, loyalty, and a deep instinct to protect and provide.",
    shadow: "Self-sacrifice, meddling, or carrying burdens that aren't yours.",
  },
  7: {
    number: 7,
    title: "The Seeker",
    keyword: "wisdom, analysis, solitude, spirituality",
    essence:
      "The number of inner inquiry. Seven withdraws from noise to study the deeper pattern, seeking truth beneath the surface of things.",
    strengths: "Insight, discernment, and a contemplative, original mind.",
    shadow: "Aloofness, mistrust, or a loneliness that hardens into withdrawal.",
  },
  8: {
    number: 8,
    title: "The Powerhouse",
    keyword: "power, ambition, mastery, abundance",
    essence:
      "The number of worldly mastery. Eight understands power, money, and authority, and is built to manifest vision into tangible result.",
    strengths: "Executive drive, resilience, and a talent for material success.",
    shadow: "Control, workaholism, or measuring worth only in results.",
  },
  9: {
    number: 9,
    title: "The Humanitarian",
    keyword: "compassion, idealism, completion, generosity",
    essence:
      "The number of completion and broad love. Nine holds the whole of human experience and gives itself to causes larger than the self.",
    strengths: "Compassion, wisdom, and an open-handed, forgiving heart.",
    shadow: "Martyrdom, disillusionment, or difficulty letting go.",
  },
  11: {
    number: 11,
    title: "The Visionary",
    keyword: "intuition, illumination, inspiration, sensitivity",
    essence:
      "A master number charged with spiritual current. Eleven is a lightning rod for intuition, here to inspire and illuminate the way forward.",
    strengths: "Heightened intuition, charisma, and visionary inspiration.",
    shadow: "Nervous tension, self-doubt, or being overwhelmed by its own voltage.",
  },
  22: {
    number: 22,
    title: "The Master Builder",
    keyword: "vision, manifestation, mastery, legacy",
    essence:
      "The most powerful of the master numbers, joining vision with the means to build it. Twenty-two turns grand dreams into lasting structures.",
    strengths: "Practical genius, large-scale vision, and enduring achievement.",
    shadow: "Crushing pressure, or shrinking from the size of its own calling.",
  },
  33: {
    number: 33,
    title: "The Master Teacher",
    keyword: "compassion, healing, devotion, guidance",
    essence:
      "The rarest master number, the embodiment of selfless love. Thirty-three uplifts humanity through teaching, healing, and tireless devotion.",
    strengths: "Boundless compassion, spiritual wisdom, and the gift to heal.",
    shadow: "Self-neglect, or a sense of responsibility too vast to carry alone.",
  },
};

export const LIFE_PATH: PositionMeanings = {
  1: "You are here to learn to stand on your own and lead. The 1 journey asks you to trust your instincts, claim your independence, and have the courage to begin things others wouldn't dare to start. Your gifts are initiative, originality, and a will that doesn't bend easily. The growth edge is learning that true strength includes others — that leading is not the same as going it alone, and confidence need not curdle into ego.",
  2: "Yours is the path of partnership, sensitivity, and quiet power. You read the emotional currents in any room and have a rare talent for bringing people into harmony. The 2 journey is about valuing your own gentleness as strength rather than weakness. Your gifts are diplomacy, patience, and devotion. The growth edge is learning to hold your own needs alongside everyone else's — to stand firm without losing the peace, and to choose rather than merely yield.",
  3: "You walk the path of expression and joy, here to give your inner world a voice. Words, color, music, and laughter move through you naturally, and your presence tends to lighten whatever it touches. The 3 journey asks you to take your creative gifts seriously and share them without apology. The growth edge is focus — gathering your bright, scattered energy into something finished, and letting your depth show beneath the sparkle.",
  4: "Yours is the path of the builder, here to create order, stability, and things that endure. You understand effort, structure, and the patient work that turns ideas into reality. The 4 journey rewards discipline and devotion, and asks you to trust process over shortcut. Your gifts are reliability and craft. The growth edge is flexibility — learning that not every wall needs to be load-bearing, and that rest and play are not betrayals of the work.",
  5: "You are here to taste freedom and experience life in its full variety. Change is your native element; you adapt quickly, charm easily, and are happiest when the road keeps unfolding. The 5 journey is about turning restlessness into genuine wisdom of the world. Your gifts are versatility, courage, and magnetism. The growth edge is commitment — learning that freedom deepens through devotion, and that not every door must be opened to live fully.",
  6: "Yours is the path of love and responsibility, the heart of family and community. You are drawn to care for others, to create beauty and harmony, and to be the one people lean on. The 6 journey asks you to give generously while keeping your own well full. Your gifts are warmth, loyalty, and a gift for making any place feel like home. The growth edge is boundaries — learning to serve without absorbing, and to let others carry their share.",
  7: "You walk the path of the seeker, here to look beneath the surface and find the deeper truth. Solitude restores you, and your mind moves toward the philosophical, the mystical, the precisely understood. The 7 journey is about trusting inner knowing over outer noise. Your gifts are insight, depth, and a refined, original intelligence. The growth edge is connection — learning to share your inner world and to trust, so that wisdom does not become isolation.",
  8: "Yours is the path of power and material mastery, here to understand how to manifest vision in the tangible world. You are built for achievement — money, authority, and large undertakings are yours to handle. The 8 journey asks you to wield power with integrity and to balance the outer and inner ledgers. Your gifts are ambition, resilience, and executive command. The growth edge is learning that worth is not measured in results, and that giving completes the cycle of receiving.",
  9: "You are here to love widely and give yourself to something larger than yourself. The 9 carries the wisdom of all the numbers before it; you feel the whole of human experience and are moved by compassion and ideals. Your journey is one of service, artistry, and learning to release. Your gifts are generosity, perspective, and a forgiving heart. The growth edge is letting go — completing what is finished, and giving without losing yourself in the giving.",
  11: "You walk a master path, the 11, a heightened octave of the 2. You are a channel for intuition and inspiration, attuned to subtle currents most people never sense, here to illuminate and uplift. Beneath the visionary charge runs the 2's gift for connection and harmony. The intensity is real: nervous sensitivity and self-doubt come with the voltage. Your journey is to steady yourself enough to carry the light — to trust your inner knowing and let it inspire others.",
  22: "Yours is the Master Builder path, the 22, the most powerful number to walk, a higher octave of the 4. You hold visionary scope and the practical genius to make it real — to build things that serve generations. Beneath it runs the 4's discipline and foundation-laying patience. The intensity is enormous, and the pressure of your own potential can feel overwhelming. Your journey is to trust the scale of your calling and ground vast dreams in steady, daily work.",
  33: "You walk the rarest master path, the 33, a higher octave of the 6 and the embodiment of selfless love. You are here to teach, heal, and uplift humanity through compassion that asks for nothing in return. Beneath it runs the 6's devotion to care and harmony. The intensity is profound; the responsibility can feel larger than one life. Your journey is to give from fullness rather than depletion, and to let your love become quiet guidance for the world.",
};

export const EXPRESSION: PositionMeanings = {
  1: "Your name encodes the talents of the leader: independence, originality, and the drive to initiate. You are equipped to pioneer, to stand at the front, and to bring fresh ideas into being. Your outward purpose is to develop genuine self-reliance and the courage to act on your own vision — to lead by example, and to let your boldness open doors that others can walk through.",
  2: "Your name carries the gifts of the diplomat: sensitivity, cooperation, and a fine attunement to other people. You are equipped to mediate, to partner, and to bring opposing forces into harmony. Your outward purpose is to develop these gentle talents into real influence — to become the steadying presence in any group, and to show that patience and tact are forms of quiet, lasting power.",
  3: "Your name is rich with creative and communicative gifts: words, imagination, charm, and an instinct for delight. You are equipped to express, perform, and inspire joy in others. Your outward purpose is to develop your voice with discipline and share it generously — to turn raw talent into finished work, and to let your natural optimism brighten the lives of everyone within reach.",
  4: "Your name encodes the talents of the builder: discipline, organization, and a gift for turning ideas into solid form. You are equipped to manage, construct, and create reliable systems that endure. Your outward purpose is to develop patience and craft into mastery — to be the dependable foundation others build upon, and to leave behind work that proves the worth of steady, honest effort.",
  5: "Your name carries the gifts of versatility, adaptability, and magnetic communication. You are equipped to embrace change, connect with all kinds of people, and thrive amid variety and motion. Your outward purpose is to channel this restless energy into freedom that actually liberates — to be a bridge between worlds, and to use your wide experience to teach others how richly life can be lived.",
  6: "Your name is rich with the gifts of care: responsibility, warmth, and a talent for healing and harmony. You are equipped to nurture, counsel, and create beauty in your surroundings. Your outward purpose is to develop your loving nature into wise service — to support others without losing yourself, and to be the heart that holds a family, a circle, or a community together.",
  7: "Your name encodes the talents of the seeker: a penetrating mind, intuition, and a gift for analysis and depth. You are equipped to research, investigate, and uncover truths hidden from plain view. Your outward purpose is to develop your inner knowing into shared wisdom — to refine your craft or field with precision, and to bring the fruits of your solitude back to a world that needs them.",
  8: "Your name carries the gifts of authority and material mastery: ambition, organization, and a sense for power and abundance. You are equipped to lead enterprises, manage resources, and achieve on a large scale. Your outward purpose is to develop this drive with integrity — to build real and lasting value, and to learn that true power balances the material and the spiritual in everything you create.",
  9: "Your name is rich with the gifts of the humanitarian: compassion, breadth of vision, and an artist's sensitivity. You are equipped to serve, to create, and to love on a wide and generous scale. Your outward purpose is to develop this idealism into meaningful contribution — to give your talents to causes larger than yourself, and to teach by example the grace of compassion and release.",
  11: "Your name carries the heightened gifts of the 11: intuition, inspiration, and an almost electric sensitivity to the unseen. You are equipped to illuminate, to uplift, and to channel insight that others cannot reach. Beneath it lie the 2's talents for harmony and partnership. Your outward purpose is to steady this powerful current and become a source of light — inspiring others through the truth you so clearly perceive.",
  22: "Your name encodes the Master Builder's gifts: visionary scope joined to the practical genius that makes vision real. You are equipped to conceive and construct on a grand scale, building what serves many. Beneath it run the 4's discipline and reliability. Your outward purpose is to ground your enormous potential in patient work — to turn far-reaching dreams into structures that outlast you and benefit generations.",
  33: "Your name carries the Master Teacher's gifts: boundless compassion, healing presence, and the devotion to uplift others. You are equipped to teach, mend, and guide through selfless love. Beneath it runs the 6's nurturing care and sense of responsibility. Your outward purpose is to develop this rare capacity into wise, sustainable service — giving from fullness, and letting your love become quiet, lasting guidance for the world.",
};
