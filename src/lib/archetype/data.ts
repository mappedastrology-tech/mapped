import type { ArchetypeContent } from "./types";

export const ARCHETYPES: Record<string, ArchetypeContent> = {
  "fire-initiator": {
    id: "fire-initiator",
    name: "The Trailblazer",
    tagline: "First through the fire, always",
    element: "fire",
    stance: "initiator",
    description:
      "You carry a spark that refuses to wait for permission. Where others see a closed door, you see the ignition point, and you move first because standing still would cost you your fire. Bold, self-directed, and impossible to ignore, you turn raw courage into momentum and leave a lit path behind you for everyone brave enough to follow.",
    traits: [
      "Fearless starter",
      "Moves before doubt does",
      "Magnetic under pressure",
      "Turns vision into action",
      "Unafraid to go first",
    ],
  },
  "fire-cultivator": {
    id: "fire-cultivator",
    name: "The Flamekeeper",
    tagline: "Tends the fire that lasts",
    element: "fire",
    stance: "cultivator",
    description:
      "Your passion is not a flash but a steady blaze you feed daily. You respond to what genuinely lights you up, then master it through devoted practice until your craft glows. Others burn out; you burn on. Warm, disciplined, and quietly relentless, you build heat that outlasts every trend, becoming the reliable fire the whole room gathers around.",
    traits: [
      "Sustains a slow burn",
      "Masters through repetition",
      "Devoted to the craft",
      "Warm and dependable",
      "Passion with staying power",
    ],
  },
  "fire-catalyst": {
    id: "fire-catalyst",
    name: "The Wildfire",
    tagline: "Everything you touch ignites",
    element: "fire",
    stance: "catalyst",
    description:
      "You are motion made of light, leaping between passions and setting each one ablaze before racing to the next. Fast, multi-gifted, and electric, you fuse unlikely paths into something nobody expected. People feel more alive in your presence, energized by your heat. You don't finish everything you start, but everything you touch keeps burning long after you've moved on.",
    traits: [
      "Ignites everyone nearby",
      "Multi-passionate and fast",
      "Combines paths brilliantly",
      "Radiates contagious energy",
      "Thrives on momentum",
    ],
  },
  "fire-guide": {
    id: "fire-guide",
    name: "The Beacon",
    tagline: "The light others steer by",
    element: "fire",
    stance: "guide",
    description:
      "Your fire rises high enough to be seen for miles. You perceive the whole terrain, the people and the patterns, and you point the way with a warmth that draws rather than commands. Wise, visionary, and quietly commanding, you turn courage into clear direction. When others lose their bearings, they look for your light, and it is always burning.",
    traits: [
      "Sees the whole landscape",
      "Directs with warmth",
      "Recognized for vision",
      "Steadies people in the dark",
      "Turns insight into direction",
    ],
  },
  "fire-mirror": {
    id: "fire-mirror",
    name: "The Aurora",
    tagline: "Reflects the fire of a room",
    element: "fire",
    stance: "mirror",
    description:
      "You are a rare, luminous lens, taking in the fire around you and casting it back transformed and impossibly vivid. Attuned to timing and mood, you sample the energy of a room and reveal its true color. Sensitive, discerning, and dazzling when the moment is right, you show people the brilliance they carry but could never quite see on their own.",
    traits: [
      "Reads the room instantly",
      "Reflects hidden brilliance",
      "Exquisitely attuned to timing",
      "A rare, clear lens",
      "Sees the truth of a mood",
    ],
  },
  "earth-initiator": {
    id: "earth-initiator",
    name: "The Founder",
    tagline: "Breaks ground, builds to last",
    element: "earth",
    stance: "initiator",
    description:
      "You turn ideas into foundations. Grounded and self-starting, you break the first ground while others are still sketching, planting stakes in real soil and making the abstract solid. Practical, resolute, and independent, you begin what will still be standing decades from now. You don't chase the spark; you lay the cornerstone, and the whole structure rises from where you chose to begin.",
    traits: [
      "Lays the cornerstone",
      "Turns ideas into structures",
      "Self-directed and grounded",
      "Builds for the long haul",
      "Makes the abstract solid",
    ],
  },
  "earth-cultivator": {
    id: "earth-cultivator",
    name: "The Cultivator",
    tagline: "Patient hands, abundant harvest",
    element: "earth",
    stance: "cultivator",
    description:
      "You are the steady hand that tends what it plants. Responding to what the moment truly needs, you build slowly and surely, mastering your work through patient, embodied practice. Where others rush, you ripen. Grounded, reliable, and deeply present, you understand that the richest harvests come from soil worked with care, and everything you nurture grows stronger for your patience.",
    traits: [
      "Endless patience",
      "Masters through steady practice",
      "Deeply grounded",
      "Nurtures growth in others",
      "Builds slow and sure",
    ],
  },
  "earth-catalyst": {
    id: "earth-catalyst",
    name: "The Builder",
    tagline: "Many hands, one rising structure",
    element: "earth",
    stance: "catalyst",
    description:
      "You are practical energy in perpetual motion, raising several structures at once with hands that never rest. Fast, embodied, and multi-skilled, you weave separate crafts into one working whole. You energize every project you join, turning scattered materials into something real. Others marvel at how much you build, but for you it's simply the natural rhythm of a life that loves to make.",
    traits: [
      "Builds many things at once",
      "Practical and fast",
      "Combines skills seamlessly",
      "Energizes every project",
      "Turns materials into results",
    ],
  },
  "earth-guide": {
    id: "earth-guide",
    name: "The Mountain",
    tagline: "Unmoved, and impossible to miss",
    element: "earth",
    stance: "guide",
    description:
      "You are bedrock with a view. Rooted and unshakeable, you see the systems and the people from a height earned by patience, and you guide with a steadiness nothing rattles. Wise, grounded, and quietly authoritative, you offer direction others can lean their full weight on. When the ground shifts for everyone else, you are the fixed point they navigate by.",
    traits: [
      "Unshakeable steadiness",
      "Sees systems clearly",
      "Guides with calm authority",
      "A fixed point in chaos",
      "Grounded wisdom",
    ],
  },
  "earth-mirror": {
    id: "earth-mirror",
    name: "The Grove",
    tagline: "Reflects the health of the land",
    element: "earth",
    stance: "mirror",
    description:
      "You are living ground that shows a place its true condition. Deeply embodied and attuned to your surroundings, you sample the health of your community and reflect it back with honest clarity. Sensitive to timing and rooted in the real, you sense what is thriving and what is depleted long before anyone names it, becoming a quiet, trustworthy barometer for everyone around you.",
    traits: [
      "Senses the health of a space",
      "Deeply embodied",
      "Reflects honest truth",
      "Attuned to community and timing",
      "A grounded, clear lens",
    ],
  },
  "air-initiator": {
    id: "air-initiator",
    name: "The Herald",
    tagline: "Speaks the new idea first",
    element: "air",
    stance: "initiator",
    description:
      "You are the first voice to name what's coming. Quick-minded and independent, you catch the fresh idea on the wind and announce it before the world is ready. Articulate, original, and self-propelled, you set conversations in motion and shift how people think. Where there was silence or stale consensus, you introduce the new thought, and the whole climate changes around your words.",
    traits: [
      "Names ideas first",
      "Sharp, original mind",
      "Sparks new conversations",
      "Independent thinker",
      "Shifts how people see",
    ],
  },
  "air-cultivator": {
    id: "air-cultivator",
    name: "The Weaver",
    tagline: "Threads minds into one cloth",
    element: "air",
    stance: "cultivator",
    description:
      "You connect thoughts and people into something whole. Responding to the threads life offers, you patiently weave ideas, conversations, and relationships into an intricate fabric that only strengthens over time. Communicative, perceptive, and steady, you master the art of connection through practice. What begins as scattered strands becomes, in your hands, a tapestry everyone recognizes but no one else could have made.",
    traits: [
      "Connects ideas and people",
      "Masters connection over time",
      "Perceptive listener",
      "Weaves lasting relationships",
      "Sees the whole pattern",
    ],
  },
  "air-catalyst": {
    id: "air-catalyst",
    name: "The Current",
    tagline: "Carries ideas at high speed",
    element: "air",
    stance: "catalyst",
    description:
      "You are fast-moving air that carries ideas everywhere at once. Multi-curious and electric, you leap between subjects and fuse them into fresh insight, energizing every mind you pass through. Quick, connective, and impossible to pin down, you keep the whole conversation moving. People catch your momentum and think faster around you, swept up in the bright, restless current of your attention.",
    traits: [
      "Thinks at high speed",
      "Endlessly curious",
      "Fuses ideas into insight",
      "Energizes every discussion",
      "Keeps momentum moving",
    ],
  },
  "air-guide": {
    id: "air-guide",
    name: "The Oracle",
    tagline: "Sees the pattern behind it all",
    element: "air",
    stance: "guide",
    description:
      "You see the pattern beneath the noise. Perceptive and far-seeing, you rise above the details to read the systems and the people with startling clarity, then translate what you see into guidance others can use. Wise, articulate, and sought-after, you name the truth that reorients a room. People come to you not for answers but for the perspective only you can offer.",
    traits: [
      "Sees the deeper pattern",
      "Reads systems and people",
      "Translates insight clearly",
      "Recognized for perspective",
      "Reorients with a word",
    ],
  },
  "air-mirror": {
    id: "air-mirror",
    name: "The Prism",
    tagline: "Splits the room into truth",
    element: "air",
    stance: "mirror",
    description:
      "You take in the light of a room and reveal every color hidden inside it. A rare, clear lens, you sample the ideas and moods around you and refract them into distinct, visible truths. Perceptive, discerning, and attuned to timing, you show a group the full spectrum of what it actually contains, naming distinctions others sensed but could never quite bring into focus.",
    traits: [
      "Refracts hidden truths",
      "Reads the room's spectrum",
      "A rare, clear lens",
      "Attuned to timing",
      "Names subtle distinctions",
    ],
  },
  "water-initiator": {
    id: "water-initiator",
    name: "The Tidecaller",
    tagline: "Moves first from deep feeling",
    element: "water",
    stance: "initiator",
    description:
      "You move first from the depths of feeling. Intuitive and self-directed, you sense the emotional current before anyone else and act on it, initiating shifts that others only feel later. Deep, courageous, and independent, you trust the tide within you and let it move you into motion. Where the room is stuck, you name the feeling and set the whole emotional weather turning.",
    traits: [
      "Moves from intuition",
      "Senses the current first",
      "Emotionally courageous",
      "Self-directed and deep",
      "Sets feeling in motion",
    ],
  },
  "water-cultivator": {
    id: "water-cultivator",
    name: "The Wellspring",
    tagline: "A deep source, always giving",
    element: "water",
    stance: "cultivator",
    description:
      "You are a deep source that renews everyone who draws from it. Responding to the emotional needs around you, you offer care and healing that only deepens with time as you master the art of tending feeling. Intuitive, patient, and quietly abundant, you replenish others without running dry. What flows from you is steady and true, a wellspring people return to again and again.",
    traits: [
      "A deep, renewing source",
      "Heals through patient care",
      "Emotionally intuitive",
      "Masters the art of tending",
      "Abundant without draining",
    ],
  },
  "water-catalyst": {
    id: "water-catalyst",
    name: "The Rainmaker",
    tagline: "Brings feeling to a parched world",
    element: "water",
    stance: "catalyst",
    description:
      "You bring rain wherever it's needed, moving fast between people and drawing feeling to the surface. Intuitive, multi-hearted, and energizing, you fuse emotional currents into sudden release, and things long dry begin to bloom around you. You feel many things at once and carry that abundance from place to place, quickening whatever has gone still and stirring the world back to life.",
    traits: [
      "Brings feeling to the surface",
      "Fast and emotionally attuned",
      "Multi-hearted",
      "Energizes and revives",
      "Stirs the stagnant to life",
    ],
  },
  "water-guide": {
    id: "water-guide",
    name: "The Seer",
    tagline: "Reads the depths others miss",
    element: "water",
    stance: "guide",
    description:
      "You see into the depths where others only skim. Deeply intuitive, you read the unspoken feeling in a person or a system and offer guidance drawn from that hidden knowing. Wise, perceptive, and trusted, you name what the heart already sensed but couldn't say. People come to you when they need to be truly seen, and they leave feeling understood to the core.",
    traits: [
      "Reads unspoken feeling",
      "Deeply intuitive",
      "Guides from hidden knowing",
      "Trusted with the heart",
      "Sees people to the core",
    ],
  },
  "water-mirror": {
    id: "water-mirror",
    name: "The Moonpool",
    tagline: "Reflects the true face of things",
    element: "water",
    stance: "mirror",
    description:
      "You are still, deep water that reflects the true face of everything above it. A rare, clear lens, you sample the emotional field around you and mirror it back with luminous honesty. Sensitive, intuitive, and attuned to timing, you let people and communities see their real feeling, undistorted. When someone gazes into you at the right moment, they finally recognize themselves.",
    traits: [
      "Reflects true feeling",
      "Still, deep, and clear",
      "Attuned to emotional timing",
      "A rare, honest lens",
      "Helps others recognize themselves",
    ],
  },
};
