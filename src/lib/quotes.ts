export interface Quote {
  id: number;
  text: string;
  author: string;
  source?: string;
  category: QuoteCategory;
  tags: TransitTag[];
}

export type QuoteCategory =
  | "literature"
  | "interview"
  | "essay"
  | "poetry"
  | "observation"
  | "memoir";

// Broad string type — quotes use freeform tags that get matched to planetary transits
export type TransitTag = string;

// Core transit-relevant tags for matching logic
export const CORE_TRANSIT_TAGS = [
  "transformation", "new-beginnings", "endings", "love", "loss",
  "courage", "fear", "wisdom", "patience", "ambition",
  "freedom", "discipline", "creativity", "intuition", "communication",
  "power", "vulnerability", "growth", "change", "destiny",
  "self-discovery", "relationships", "solitude", "joy", "grief",
  "truth", "illusion", "rebellion", "duty", "surrender",
  "abundance", "scarcity", "home", "adventure", "balance",
  "passion", "detachment", "identity", "legacy", "healing",
] as const;

export const QUOTES: Quote[] = [
  // ─── JOAN DIDION ──────────────────────────────────────────────────────────
  {
    id: 1,
    text: "I write entirely to find out what I'm thinking, what I'm looking at, what I see and what it means.",
    author: "Joan Didion",
    source: "Why I Write",
    category: "essay",
    tags: ["self-discovery", "truth", "creativity", "intuition"]
  },
  {
    id: 2,
    text: "We tell ourselves stories in order to live.",
    author: "Joan Didion",
    source: "The White Album",
    category: "essay",
    tags: ["truth", "identity", "courage", "vulnerability"]
  },
  {
    id: 3,
    text: "Life changes in the instant. The ordinary instant.",
    author: "Joan Didion",
    source: "The Year of Magical Thinking",
    category: "memoir",
    tags: ["change", "loss", "transformation", "vulnerability"]
  },
  {
    id: 4,
    text: "I have already lost touch with a couple of people I used to be.",
    author: "Joan Didion",
    source: "Slouching Towards Bethlehem",
    category: "essay",
    tags: ["identity", "change", "self-discovery", "growth"]
  },
  {
    id: 5,
    text: "Character — the willingness to accept responsibility for one's own life — is the source from which self-respect springs.",
    author: "Joan Didion",
    source: "Slouching Towards Bethlehem",
    category: "essay",
    tags: ["discipline", "identity", "courage", "self-discovery"]
  },
  {
    id: 6,
    text: "To cure jealousy is to see it for what it is, a dissatisfaction with self.",
    author: "Joan Didion",
    source: "Slouching Towards Bethlehem",
    category: "essay",
    tags: ["self-discovery", "truth", "healing", "relationships"]
  },
  {
    id: 7,
    text: "Was it only by dreaming or writing that I could find out what I thought?",
    author: "Joan Didion",
    source: "The Year of Magical Thinking",
    category: "memoir",
    tags: ["creativity", "intuition", "self-discovery", "solitude"]
  },
  {
    id: 8,
    text: "Grief turns out to be a place none of us know until we reach it.",
    author: "Joan Didion",
    source: "The Year of Magical Thinking",
    category: "memoir",
    tags: ["grief", "loss", "vulnerability", "truth"]
  },

  // ─── NORA EPHRON ──────────────────────────────────────────────────────────
  {
    id: 9,
    text: "Above all, be the heroine of your life, not the victim.",
    author: "Nora Ephron",
    source: "Wellesley Commencement Speech, 1996",
    category: "essay",
    tags: ["courage", "identity", "power", "self-discovery"]
  },
  {
    id: 10,
    text: "I try to write parts for women that are as complicated and interesting as women actually are.",
    author: "Nora Ephron",
    category: "interview",
    tags: ["creativity", "truth", "identity", "rebellion"]
  },
  {
    id: 11,
    text: "Insane people are always sure that they are fine. It is only the sane people who are willing to admit that they are crazy.",
    author: "Nora Ephron",
    source: "Heartburn",
    category: "literature",
    tags: ["wisdom", "truth", "vulnerability", "self-discovery"]
  },
  {
    id: 12,
    text: "Reading is everything. Reading makes me feel like I've accomplished something, learned something, become a better person.",
    author: "Nora Ephron",
    source: "I Feel Bad About My Neck",
    category: "memoir",
    tags: ["growth", "wisdom", "solitude", "discipline"]
  },
  {
    id: 13,
    text: "Whatever you choose, however many roads you travel, I hope that you choose not to be a lady.",
    author: "Nora Ephron",
    source: "Wellesley Commencement Speech, 1996",
    category: "essay",
    tags: ["rebellion", "freedom", "courage", "identity"]
  },
  {
    id: 14,
    text: "When you slip on a banana peel, people laugh at you. But when you tell people you slipped on a banana peel, it's your laugh.",
    author: "Nora Ephron",
    category: "interview",
    tags: ["creativity", "power", "healing", "joy"]
  },
  {
    id: 15,
    text: "Be the heroine of your life, not the victim. Because you don't have the alibi my class had — this is one of the great achievements and mixed blessings you inherit: unlike us, you can't pretend you didn't know.",
    author: "Nora Ephron",
    source: "Wellesley Commencement Speech, 1996",
    category: "essay",
    tags: ["courage", "duty", "truth", "legacy"]
  },

  // ─── FRAN LEBOWITZ ────────────────────────────────────────────────────────
  {
    id: 16,
    text: "The best fame is a writer's fame. It's enough to get a table at a good restaurant but not enough to get you interrupted when you eat.",
    author: "Fran Lebowitz",
    category: "interview",
    tags: ["wisdom", "solitude", "joy", "balance"]
  },
  {
    id: 17,
    text: "Think before you speak. Read before you think.",
    author: "Fran Lebowitz",
    category: "interview",
    tags: ["wisdom", "discipline", "communication", "patience"]
  },
  {
    id: 18,
    text: "Great people talk about ideas, average people talk about things, and small people talk about wine.",
    author: "Fran Lebowitz",
    category: "interview",
    tags: ["wisdom", "truth", "ambition", "communication"]
  },
  {
    id: 19,
    text: "Your life story would not make a good book. Don't even try.",
    author: "Fran Lebowitz",
    category: "interview",
    tags: ["truth", "rebellion", "wisdom", "detachment"]
  },
  {
    id: 20,
    text: "In the Soviet Union, capitalism triumphed over communism. In this country, capitalism triumphed over democracy.",
    author: "Fran Lebowitz",
    source: "Pretend It's a City",
    category: "observation",
    tags: ["truth", "rebellion", "power", "wisdom"]
  },
  {
    id: 21,
    text: "I never took hallucinogenic drugs because I never wanted my consciousness expanded one unnecessary iota.",
    author: "Fran Lebowitz",
    category: "interview",
    tags: ["solitude", "identity", "rebellion", "wisdom"]
  },
  {
    id: 22,
    text: "The opposite of talking isn't listening. The opposite of talking is waiting.",
    author: "Fran Lebowitz",
    category: "interview",
    tags: ["communication", "truth", "relationships", "patience"]
  },

  // ─── MARY OLIVER ──────────────────────────────────────────────────────────
  {
    id: 23,
    text: "Tell me, what is it you plan to do with your one wild and precious life?",
    author: "Mary Oliver",
    source: "The Summer Day",
    category: "poetry",
    tags: ["destiny", "courage", "new-beginnings", "freedom"]
  },
  {
    id: 24,
    text: "Someone I loved once gave me a box full of darkness. It took me years to understand that this too, was a gift.",
    author: "Mary Oliver",
    source: "Thirst",
    category: "poetry",
    tags: ["grief", "healing", "transformation", "love"]
  },
  {
    id: 25,
    text: "You do not have to be good. You do not have to walk on your knees for a hundred miles through the desert, repenting.",
    author: "Mary Oliver",
    source: "Wild Geese",
    category: "poetry",
    tags: ["freedom", "surrender", "healing", "self-discovery"]
  },
  {
    id: 26,
    text: "Attention is the beginning of devotion.",
    author: "Mary Oliver",
    source: "Upstream",
    category: "essay",
    tags: ["discipline", "love", "intuition", "wisdom"]
  },
  {
    id: 27,
    text: "Keep some room in your heart for the unimaginable.",
    author: "Mary Oliver",
    source: "Evidence",
    category: "poetry",
    tags: ["new-beginnings", "intuition", "surrender", "courage"]
  },
  {
    id: 28,
    text: "Instructions for living a life: Pay attention. Be astonished. Tell about it.",
    author: "Mary Oliver",
    source: "Sometimes",
    category: "poetry",
    tags: ["joy", "creativity", "wisdom", "truth"]
  },

  // ─── TONI MORRISON ────────────────────────────────────────────────────────
  {
    id: 29,
    text: "If you surrendered to the air, you could ride it.",
    author: "Toni Morrison",
    source: "Song of Solomon",
    category: "literature",
    tags: ["surrender", "freedom", "courage", "transformation"]
  },
  {
    id: 30,
    text: "You wanna fly, you got to give up the shit that weighs you down.",
    author: "Toni Morrison",
    source: "Song of Solomon",
    category: "literature",
    tags: ["freedom", "endings", "courage", "transformation"]
  },
  {
    id: 31,
    text: "Freeing yourself was one thing, claiming ownership of that freed self was another.",
    author: "Toni Morrison",
    source: "Beloved",
    category: "literature",
    tags: ["freedom", "identity", "courage", "self-discovery"]
  },
  {
    id: 32,
    text: "At some point in life the world's beauty becomes enough. You don't need to photograph, paint, or even remember it. It is enough.",
    author: "Toni Morrison",
    source: "Tar Baby",
    category: "literature",
    tags: ["surrender", "joy", "wisdom", "detachment"]
  },
  {
    id: 33,
    text: "If there's a book that you want to read, but it hasn't been written yet, then you must write it.",
    author: "Toni Morrison",
    category: "interview",
    tags: ["creativity", "courage", "new-beginnings", "destiny"]
  },
  {
    id: 34,
    text: "Don't let anybody, anybody convince you this is the way the world is and therefore must be. It must be the way it ought to be.",
    author: "Toni Morrison",
    category: "interview",
    tags: ["rebellion", "courage", "truth", "power"]
  },

  // ─── MAGGIE SMITH (poet) ──────────────────────────────────────────────────
  {
    id: 35,
    text: "Life is short, though I keep this from my children.",
    author: "Maggie Smith",
    source: "Good Bones",
    category: "poetry",
    tags: ["truth", "vulnerability", "love", "legacy"]
  },
  {
    id: 36,
    text: "Any decent realtor, walking you through a real shithole, chirps on about good bones: This place could be beautiful, right? You could make this place beautiful.",
    author: "Maggie Smith",
    source: "Good Bones",
    category: "poetry",
    tags: ["new-beginnings", "courage", "healing", "truth"]
  },
  {
    id: 37,
    text: "The world is at least fifty percent terrible, and that's a conservative estimate, though I keep this from my children.",
    author: "Maggie Smith",
    source: "Good Bones",
    category: "poetry",
    tags: ["truth", "vulnerability", "love", "courage"]
  },
  {
    id: 38,
    text: "You keep this from your children because you want them to believe the world is worth the work of making it better.",
    author: "Maggie Smith",
    source: "Keep Moving",
    category: "essay",
    tags: ["courage", "legacy", "love", "new-beginnings"]
  },

  // ─── OCEAN VUONG ──────────────────────────────────────────────────────────
  {
    id: 39,
    text: "The most beautiful part of your body is where it's headed.",
    author: "Ocean Vuong",
    source: "On Earth We're Briefly Gorgeous",
    category: "literature",
    tags: ["destiny", "new-beginnings", "courage", "growth"]
  },
  {
    id: 40,
    text: "Let me begin again. Dear Ma, I am writing to reach you — even if each word I put down is one word further from where you are.",
    author: "Ocean Vuong",
    source: "On Earth We're Briefly Gorgeous",
    category: "literature",
    tags: ["love", "communication", "vulnerability", "grief"]
  },
  {
    id: 41,
    text: "I am thinking of beauty again, how some things are hunted because we have deemed them beautiful.",
    author: "Ocean Vuong",
    source: "On Earth We're Briefly Gorgeous",
    category: "literature",
    tags: ["truth", "vulnerability", "power", "wisdom"]
  },
  {
    id: 42,
    text: "Maybe to be good is simply to bury your face in someone's chest and breathe in and have the person who is holding you understand that this is the most important part of the world.",
    author: "Ocean Vuong",
    source: "On Earth We're Briefly Gorgeous",
    category: "literature",
    tags: ["love", "vulnerability", "surrender", "relationships"]
  },

  // ─── REBECCA SOLNIT ───────────────────────────────────────────────────────
  {
    id: 43,
    text: "Leaving is not the same as being left. Walking away is not the same as being abandoned.",
    author: "Rebecca Solnit",
    source: "A Field Guide to Getting Lost",
    category: "essay",
    tags: ["freedom", "endings", "courage", "identity"]
  },
  {
    id: 44,
    text: "Lost is not a place. It is a state of mind, and it has a population of one.",
    author: "Rebecca Solnit",
    source: "A Field Guide to Getting Lost",
    category: "essay",
    tags: ["solitude", "self-discovery", "adventure", "fear"]
  },
  {
    id: 45,
    text: "The things we want are transformative, and we don't know or only half know what is on the other side of that transformation.",
    author: "Rebecca Solnit",
    source: "A Field Guide to Getting Lost",
    category: "essay",
    tags: ["transformation", "courage", "destiny", "new-beginnings"]
  },
  {
    id: 46,
    text: "To hope is to give yourself to the future, and that commitment to the future makes the present inhabitable.",
    author: "Rebecca Solnit",
    source: "Hope in the Dark",
    category: "essay",
    tags: ["courage", "new-beginnings", "patience", "destiny"]
  },
  {
    id: 47,
    text: "A labyrinth is not a maze. A maze is a puzzle to be solved. A labyrinth is a contemplation.",
    author: "Rebecca Solnit",
    source: "Wanderlust",
    category: "essay",
    tags: ["wisdom", "patience", "intuition", "solitude"]
  },

  // ─── JENNY ODELL ──────────────────────────────────────────────────────────
  {
    id: 48,
    text: "Nothing is harder to do than nothing.",
    author: "Jenny Odell",
    source: "How to Do Nothing",
    category: "essay",
    tags: ["solitude", "patience", "surrender", "discipline"]
  },
  {
    id: 49,
    text: "Attention is the most basic form of love.",
    author: "Jenny Odell",
    source: "How to Do Nothing",
    category: "essay",
    tags: ["love", "discipline", "relationships", "wisdom"]
  },
  {
    id: 50,
    text: "To do nothing is to hold yourself still so that you can perceive what is actually there.",
    author: "Jenny Odell",
    source: "How to Do Nothing",
    category: "essay",
    tags: ["solitude", "intuition", "truth", "patience"]
  },

  // ─── DOLLY PARTON ─────────────────────────────────────────────────────────
  {
    id: 51,
    text: "Find out who you are and do it on purpose.",
    author: "Dolly Parton",
    category: "interview",
    tags: ["identity", "self-discovery", "courage", "destiny"]
  },
  {
    id: 52,
    text: "It costs a lot of money to look this cheap.",
    author: "Dolly Parton",
    category: "interview",
    tags: ["identity", "rebellion", "joy", "truth"]
  },
  {
    id: 53,
    text: "I'm not offended by all the dumb blonde jokes because I know I'm not dumb. And I also know that I'm not blonde.",
    author: "Dolly Parton",
    category: "interview",
    tags: ["identity", "wisdom", "rebellion", "power"]
  },
  {
    id: 54,
    text: "If you want the rainbow, you gotta put up with the rain.",
    author: "Dolly Parton",
    category: "interview",
    tags: ["patience", "courage", "growth", "healing"]
  },
  {
    id: 55,
    text: "We cannot direct the wind, but we can adjust the sails.",
    author: "Dolly Parton",
    category: "interview",
    tags: ["change", "wisdom", "courage", "surrender"]
  },
  {
    id: 56,
    text: "Storms make trees take deeper roots.",
    author: "Dolly Parton",
    category: "interview",
    tags: ["growth", "courage", "transformation", "healing"]
  },
  {
    id: 57,
    text: "The way I see it, if you want the rainbow, you gotta put up with the rain. But I also think God is funny sometimes — he'll throw a thunderstorm when you just got your hair done.",
    author: "Dolly Parton",
    category: "interview",
    tags: ["surrender", "joy", "patience", "wisdom"]
  },

  // ─── DIANA VREELAND ───────────────────────────────────────────────────────
  {
    id: 58,
    text: "Pink is the navy blue of India.",
    author: "Diana Vreeland",
    category: "observation",
    tags: ["creativity", "adventure", "joy", "truth"]
  },
  {
    id: 59,
    text: "The eye has to travel.",
    author: "Diana Vreeland",
    category: "observation",
    tags: ["adventure", "creativity", "growth", "curiosity"]
  },
  {
    id: 60,
    text: "You don't have to be born beautiful to be wildly attractive.",
    author: "Diana Vreeland",
    category: "observation",
    tags: ["identity", "power", "self-discovery", "rebellion"]
  },
  {
    id: 61,
    text: "There's only one very good life and that's the life you know you want and you make it yourself.",
    author: "Diana Vreeland",
    category: "observation",
    tags: ["destiny", "courage", "freedom", "identity"]
  },

  // ─── SYLVIA PLATH ─────────────────────────────────────────────────────────
  {
    id: 62,
    text: "I took a deep breath and listened to the old brag of my heart. I am, I am, I am.",
    author: "Sylvia Plath",
    source: "The Bell Jar",
    category: "literature",
    tags: ["identity", "courage", "vulnerability", "self-discovery"]
  },
  {
    id: 63,
    text: "I saw my life branching out before me like the green fig tree in the story.",
    author: "Sylvia Plath",
    source: "The Bell Jar",
    category: "literature",
    tags: ["destiny", "fear", "ambition", "self-discovery"]
  },
  {
    id: 64,
    text: "Perhaps when we find ourselves wanting everything, it is because we are dangerously close to wanting nothing.",
    author: "Sylvia Plath",
    source: "The Bell Jar",
    category: "literature",
    tags: ["truth", "vulnerability", "change", "fear"]
  },
  {
    id: 65,
    text: "I can never read all the books I want; I can never be all the people I want and live all the lives I want.",
    author: "Sylvia Plath",
    source: "Journals",
    category: "memoir",
    tags: ["ambition", "destiny", "freedom", "vulnerability"]
  },

  // ─── PARIS REVIEW INTERVIEWS & LITERARY ───────────────────────────────────
  {
    id: 66,
    text: "If I waited for perfection, I would never write a word.",
    author: "Margaret Atwood",
    source: "The Paris Review",
    category: "interview",
    tags: ["courage", "creativity", "new-beginnings", "discipline"]
  },
  {
    id: 67,
    text: "A word after a word after a word is power.",
    author: "Margaret Atwood",
    category: "interview",
    tags: ["power", "creativity", "discipline", "patience"]
  },
  {
    id: 68,
    text: "The only way you can write the truth is to assume that what you set down will never be read.",
    author: "Margaret Atwood",
    category: "interview",
    tags: ["truth", "courage", "vulnerability", "creativity"]
  },
  {
    id: 69,
    text: "I went to collect the few personal belongings which I held to be invaluable: my cat, my resolve to travel, and my solitude.",
    author: "Colette",
    source: "Break of Day",
    category: "literature",
    tags: ["solitude", "freedom", "identity", "new-beginnings"]
  },
  {
    id: 70,
    text: "Write what disturbs you, what you fear, what you have not been willing to speak about. Be willing to be split open.",
    author: "Natalie Goldberg",
    source: "Writing Down the Bones",
    category: "essay",
    tags: ["courage", "vulnerability", "creativity", "truth"]
  },
  {
    id: 71,
    text: "I must not fear. Fear is the mind-killer.",
    author: "Frank Herbert",
    source: "Dune",
    category: "literature",
    tags: ["courage", "fear", "power", "discipline"]
  },
  {
    id: 72,
    text: "The writer's duty is to keep on writing.",
    author: "James Baldwin",
    source: "The Paris Review",
    category: "interview",
    tags: ["discipline", "creativity", "duty", "courage"]
  },
  {
    id: 73,
    text: "Not everything that is faced can be changed, but nothing can be changed until it is faced.",
    author: "James Baldwin",
    category: "essay",
    tags: ["truth", "courage", "transformation", "self-discovery"]
  },
  {
    id: 74,
    text: "Love takes off the masks we fear we cannot live without and know we cannot live within.",
    author: "James Baldwin",
    source: "The Fire Next Time",
    category: "essay",
    tags: ["love", "vulnerability", "truth", "identity"]
  },
  {
    id: 75,
    text: "You think your pain and your heartbreak are unprecedented in the history of the world, but then you read.",
    author: "James Baldwin",
    category: "interview",
    tags: ["grief", "wisdom", "healing", "solitude"]
  },
  {
    id: 76,
    text: "There is never a time in the future in which we will work out our salvation. The challenge is in the moment; the time is always now.",
    author: "James Baldwin",
    category: "essay",
    tags: ["courage", "discipline", "new-beginnings", "truth"]
  },
  {
    id: 77,
    text: "One can never consent to creep when one feels an impulse to soar.",
    author: "Helen Keller",
    source: "The Story of My Life",
    category: "memoir",
    tags: ["ambition", "freedom", "courage", "rebellion"]
  },
  {
    id: 78,
    text: "In a real dark night of the soul, it is always three o'clock in the morning, day after day.",
    author: "F. Scott Fitzgerald",
    source: "The Crack-Up",
    category: "essay",
    tags: ["grief", "vulnerability", "solitude", "truth"]
  },
  {
    id: 79,
    text: "There are all kinds of love in this world but never the same love twice.",
    author: "F. Scott Fitzgerald",
    source: "The Great Gatsby",
    category: "literature",
    tags: ["love", "loss", "truth", "change"]
  },

  // ─── ZADIE SMITH ──────────────────────────────────────────────────────────
  {
    id: 80,
    text: "The past is always tense, the future perfect.",
    author: "Zadie Smith",
    source: "White Teeth",
    category: "literature",
    tags: ["wisdom", "change", "truth", "destiny"]
  },
  {
    id: 81,
    text: "Every moment happens twice: inside and outside, and they are two different histories.",
    author: "Zadie Smith",
    source: "White Teeth",
    category: "literature",
    tags: ["truth", "self-discovery", "identity", "wisdom"]
  },
  {
    id: 82,
    text: "Tell the truth through whichever veil comes to hand — but tell it.",
    author: "Zadie Smith",
    source: "Feel Free",
    category: "essay",
    tags: ["truth", "courage", "creativity", "vulnerability"]
  },

  // ─── MIRANDA JULY ─────────────────────────────────────────────────────────
  {
    id: 83,
    text: "All I ever wanted was to know what to do.",
    author: "Miranda July",
    source: "No One Belongs Here More Than You",
    category: "literature",
    tags: ["vulnerability", "truth", "fear", "self-discovery"]
  },
  {
    id: 84,
    text: "I was not a girl who could be gotten on the phone.",
    author: "Miranda July",
    source: "No One Belongs Here More Than You",
    category: "literature",
    tags: ["solitude", "identity", "rebellion", "power"]
  },
  {
    id: 85,
    text: "It was the kind of love you can only feel toward someone you don't actually know.",
    author: "Miranda July",
    source: "The First Bad Man",
    category: "literature",
    tags: ["love", "illusion", "vulnerability", "relationships"]
  },

  // ─── PATTI SMITH ──────────────────────────────────────────────────────────
  {
    id: 86,
    text: "Where does it all lead? What will become of us? These were our young questions, and young answers were revealed.",
    author: "Patti Smith",
    source: "Just Kids",
    category: "memoir",
    tags: ["destiny", "new-beginnings", "courage", "adventure"]
  },
  {
    id: 87,
    text: "I learned from him that often contradiction is the clearest way to truth.",
    author: "Patti Smith",
    source: "Just Kids",
    category: "memoir",
    tags: ["truth", "wisdom", "balance", "growth"]
  },
  {
    id: 88,
    text: "Nobody ever told me I was pretty when I was a little girl. All little girls should be told they're pretty, even if they aren't.",
    author: "Patti Smith",
    source: "Just Kids",
    category: "memoir",
    tags: ["vulnerability", "love", "identity", "healing"]
  },

  // ─── RACHEL CUSK ──────────────────────────────────────────────────────────
  {
    id: 89,
    text: "Sometimes it seemed that other people's lives were a fiction I had subscribed to, like a magazine.",
    author: "Rachel Cusk",
    source: "Outline",
    category: "literature",
    tags: ["solitude", "truth", "identity", "detachment"]
  },
  {
    id: 90,
    text: "Fate is not just what happens to you but what it does to you, the meaning you make of it.",
    author: "Rachel Cusk",
    source: "Transit",
    category: "literature",
    tags: ["destiny", "transformation", "identity", "wisdom"]
  },

  // ─── ADRIENNE RICH ────────────────────────────────────────────────────────
  {
    id: 91,
    text: "The moment of change is the only poem.",
    author: "Adrienne Rich",
    category: "poetry",
    tags: ["change", "creativity", "transformation", "new-beginnings"]
  },
  {
    id: 92,
    text: "Lying is done with words, and also with silence.",
    author: "Adrienne Rich",
    source: "Women and Honor",
    category: "essay",
    tags: ["truth", "communication", "courage", "relationships"]
  },

  // ─── ANAÏS NIN ────────────────────────────────────────────────────────────
  {
    id: 93,
    text: "We don't see things as they are. We see them as we are.",
    author: "Anaïs Nin",
    source: "Seduction of the Minotaur",
    category: "literature",
    tags: ["truth", "self-discovery", "wisdom", "intuition"]
  },
  {
    id: 94,
    text: "And the day came when the risk to remain tight in a bud was more painful than the risk it took to blossom.",
    author: "Anaïs Nin",
    category: "literature",
    tags: ["courage", "growth", "transformation", "new-beginnings"]
  },
  {
    id: 95,
    text: "Life shrinks or expands in proportion to one's courage.",
    author: "Anaïs Nin",
    source: "Diary",
    category: "memoir",
    tags: ["courage", "freedom", "growth", "ambition"]
  },

  // ─── CHERYL STRAYED ───────────────────────────────────────────────────────
  {
    id: 96,
    text: "You don't have a right to the cards you believe you should have been dealt. You have an obligation to play the hell out of the ones you're holding.",
    author: "Cheryl Strayed",
    source: "Tiny Beautiful Things",
    category: "essay",
    tags: ["courage", "destiny", "discipline", "transformation"]
  },
  {
    id: 97,
    text: "The useless days will add up to something. The shitty waitressing jobs. The hours writing in your journal. These things are your becoming.",
    author: "Cheryl Strayed",
    source: "Tiny Beautiful Things",
    category: "essay",
    tags: ["patience", "growth", "destiny", "self-discovery"]
  },
  {
    id: 98,
    text: "Most things will be okay eventually, but not everything will be. Sometimes you'll put up a good fight and lose. Sometimes you'll hold on really hard and realize there is no choice but to let go.",
    author: "Cheryl Strayed",
    source: "Tiny Beautiful Things",
    category: "essay",
    tags: ["surrender", "grief", "truth", "healing"]
  },
  {
    id: 99,
    text: "Acceptance is a small, quiet room.",
    author: "Cheryl Strayed",
    source: "Tiny Beautiful Things",
    category: "essay",
    tags: ["surrender", "healing", "solitude", "patience"]
  },
  {
    id: 100,
    text: "Be brave enough to break your own heart.",
    author: "Cheryl Strayed",
    source: "Tiny Beautiful Things",
    category: "essay",
    tags: ["courage", "vulnerability", "endings", "truth"]
  },

  // ─── VIRGINIA WOOLF ───────────────────────────────────────────────────────
  {
    id: 101,
    text: "You cannot find peace by avoiding life.",
    author: "Virginia Woolf",
    source: "The Hours",
    category: "literature",
    tags: ["courage", "truth", "healing", "self-discovery"]
  },
  {
    id: 102,
    text: "No need to hurry. No need to sparkle. No need to be anybody but oneself.",
    author: "Virginia Woolf",
    source: "A Room of One's Own",
    category: "essay",
    tags: ["identity", "solitude", "freedom", "surrender"]
  },
  {
    id: 103,
    text: "One cannot think well, love well, sleep well, if one has not dined well.",
    author: "Virginia Woolf",
    source: "A Room of One's Own",
    category: "essay",
    tags: ["wisdom", "balance", "abundance", "joy"]
  },
  {
    id: 104,
    text: "Arrange whatever pieces come your way.",
    author: "Virginia Woolf",
    source: "The Waves",
    category: "literature",
    tags: ["surrender", "creativity", "patience", "wisdom"]
  },

  // ─── ZORA NEALE HURSTON ───────────────────────────────────────────────────
  {
    id: 105,
    text: "There are years that ask questions and years that answer.",
    author: "Zora Neale Hurston",
    source: "Their Eyes Were Watching God",
    category: "literature",
    tags: ["patience", "wisdom", "transformation", "destiny"]
  },
  {
    id: 106,
    text: "If you are silent about your pain, they'll kill you and say you enjoyed it.",
    author: "Zora Neale Hurston",
    category: "interview",
    tags: ["truth", "courage", "vulnerability", "rebellion"]
  },
  {
    id: 107,
    text: "Love makes your soul crawl out from its hiding place.",
    author: "Zora Neale Hurston",
    source: "Their Eyes Were Watching God",
    category: "literature",
    tags: ["love", "vulnerability", "transformation", "courage"]
  },

  // ─── URSULA K. LE GUIN ───────────────────────────────────────────────────
  {
    id: 108,
    text: "The only thing that makes life possible is permanent, intolerable uncertainty; not knowing what comes next.",
    author: "Ursula K. Le Guin",
    source: "The Left Hand of Darkness",
    category: "literature",
    tags: ["courage", "surrender", "truth", "destiny"]
  },
  {
    id: 109,
    text: "We live in capitalism. Its power seems inescapable. So did the divine right of kings.",
    author: "Ursula K. Le Guin",
    category: "interview",
    tags: ["rebellion", "power", "truth", "courage"]
  },
  {
    id: 110,
    text: "It is good to have an end to journey toward, but it is the journey that matters in the end.",
    author: "Ursula K. Le Guin",
    source: "The Left Hand of Darkness",
    category: "literature",
    tags: ["patience", "wisdom", "adventure", "growth"]
  },

  // ─── AUDRE LORDE ──────────────────────────────────────────────────────────
  {
    id: 111,
    text: "When I dare to be powerful — to use my strength in the service of my vision — then it becomes less and less important whether I am afraid.",
    author: "Audre Lorde",
    source: "The Cancer Journals",
    category: "memoir",
    tags: ["courage", "power", "fear", "identity"]
  },
  {
    id: 112,
    text: "Your silence will not protect you.",
    author: "Audre Lorde",
    source: "The Cancer Journals",
    category: "memoir",
    tags: ["courage", "truth", "communication", "vulnerability"]
  },
  {
    id: 113,
    text: "The master's tools will never dismantle the master's house.",
    author: "Audre Lorde",
    category: "essay",
    tags: ["rebellion", "power", "truth", "transformation"]
  },

  // ─── ANNE LAMOTT ──────────────────────────────────────────────────────────
  {
    id: 114,
    text: "Almost everything will work again if you unplug it for a few minutes, including you.",
    author: "Anne Lamott",
    category: "essay",
    tags: ["healing", "solitude", "patience", "surrender"]
  },
  {
    id: 115,
    text: "Lighthouses don't go running all over an island looking for boats to save; they just stand there shining.",
    author: "Anne Lamott",
    source: "Bird by Bird",
    category: "essay",
    tags: ["identity", "patience", "wisdom", "power"]
  },
  {
    id: 116,
    text: "Hope begins in the dark, the stubborn hope that if you just show up and try to do the right thing, the dawn will come.",
    author: "Anne Lamott",
    source: "Bird by Bird",
    category: "essay",
    tags: ["courage", "patience", "new-beginnings", "healing"]
  },

  // ─── RACHEL SYME / ESSAY WRITERS ──────────────────────────────────────────
  {
    id: 117,
    text: "Style is a way of saying who you are without having to speak.",
    author: "Rachel Zoe",
    category: "observation",
    tags: ["identity", "creativity", "communication", "power"]
  },
  {
    id: 118,
    text: "The thing about chaos, is that while it disturbs us, it too, forces our hearts to roar in a way we secretly find magnificent.",
    author: "Christopher Poindexter",
    category: "poetry",
    tags: ["transformation", "courage", "passion", "surrender"]
  },

  // ─── IRIS APFEL ───────────────────────────────────────────────────────────
  {
    id: 119,
    text: "When you don't dress like everybody else, you don't have to think like everybody else.",
    author: "Iris Apfel",
    category: "interview",
    tags: ["rebellion", "identity", "freedom", "creativity"]
  },
  {
    id: 120,
    text: "I don't feel comfortable being prim and proper and trying to be what I'm not.",
    author: "Iris Apfel",
    category: "interview",
    tags: ["identity", "rebellion", "truth", "freedom"]
  },

  // ─── ANDRÉ LEON TALLEY ────────────────────────────────────────────────────
  {
    id: 121,
    text: "Fashion is a shield to survive the reality of everyday life.",
    author: "André Leon Talley",
    category: "interview",
    tags: ["identity", "courage", "creativity", "power"]
  },
  {
    id: 122,
    text: "If you can't go grand, don't go at all.",
    author: "André Leon Talley",
    category: "interview",
    tags: ["ambition", "identity", "creativity", "passion"]
  },

  // ─── DEBORAH EISENBERG ────────────────────────────────────────────────────
  {
    id: 123,
    text: "You can't see what you can't see. It's not that you're blind, it's that you haven't turned around yet.",
    author: "Deborah Eisenberg",
    source: "The Paris Review",
    category: "interview",
    tags: ["truth", "self-discovery", "transformation", "wisdom"]
  },

  // ─── ANNIE DILLARD ────────────────────────────────────────────────────────
  {
    id: 124,
    text: "How we spend our days is, of course, how we spend our lives.",
    author: "Annie Dillard",
    source: "The Writing Life",
    category: "essay",
    tags: ["destiny", "discipline", "wisdom", "legacy"]
  },
  {
    id: 125,
    text: "The interior life is often stupid. Its egoism blinds it and deafens it; its imagination spins out ignorant tales, fascinated.",
    author: "Annie Dillard",
    source: "Teaching a Stone to Talk",
    category: "essay",
    tags: ["truth", "self-discovery", "illusion", "wisdom"]
  },
  {
    id: 126,
    text: "You can't test courage cautiously.",
    author: "Annie Dillard",
    source: "An American Childhood",
    category: "memoir",
    tags: ["courage", "ambition", "new-beginnings", "passion"]
  },

  // ─── LEONARD COHEN ────────────────────────────────────────────────────────
  {
    id: 127,
    text: "There is a crack in everything. That's how the light gets in.",
    author: "Leonard Cohen",
    source: "Anthem",
    category: "poetry",
    tags: ["healing", "vulnerability", "transformation", "truth"]
  },
  {
    id: 128,
    text: "Ring the bells that still can ring. Forget your perfect offering.",
    author: "Leonard Cohen",
    source: "Anthem",
    category: "poetry",
    tags: ["surrender", "courage", "new-beginnings", "healing"]
  },

  // ─── CLARICE LISPECTOR ────────────────────────────────────────────────────
  {
    id: 129,
    text: "I want to feel what I feel. What's mine. Even if it's not a happy feeling.",
    author: "Clarice Lispector",
    source: "Near to the Wild Heart",
    category: "literature",
    tags: ["truth", "vulnerability", "identity", "self-discovery"]
  },
  {
    id: 130,
    text: "Don't be afraid of the world, the worst that can happen is that the world will be afraid of you.",
    author: "Clarice Lispector",
    category: "literature",
    tags: ["courage", "power", "fear", "identity"]
  },

  // ─── MARILYNNE ROBINSON ───────────────────────────────────────────────────
  {
    id: 131,
    text: "It has seemed to me sometimes as though the Lord breathes on this poor gray ember of Creation and it turns to radiance momentarily.",
    author: "Marilynne Robinson",
    source: "Gilead",
    category: "literature",
    tags: ["joy", "wisdom", "surrender", "intuition"]
  },
  {
    id: 132,
    text: "There are a thousand thousand reasons to live this life, every one of them sufficient.",
    author: "Marilynne Robinson",
    source: "Gilead",
    category: "literature",
    tags: ["joy", "abundance", "wisdom", "gratitude"]
  },

  // ─── ROXANE GAY ───────────────────────────────────────────────────────────
  {
    id: 133,
    text: "I learned that I needed to be my own hero because I sure as hell wasn't going to find one elsewhere.",
    author: "Roxane Gay",
    source: "Hunger",
    category: "memoir",
    tags: ["identity", "courage", "self-discovery", "power"]
  },
  {
    id: 134,
    text: "How do you get the world to see you as human when they've already decided you are not?",
    author: "Roxane Gay",
    source: "Hunger",
    category: "memoir",
    tags: ["identity", "truth", "rebellion", "vulnerability"]
  },

  // ─── BELL HOOKS ───────────────────────────────────────────────────────────
  {
    id: 135,
    text: "Rarely, if ever, are any of us healed in isolation. Healing is an act of communion.",
    author: "bell hooks",
    source: "All About Love",
    category: "essay",
    tags: ["healing", "love", "relationships", "vulnerability"]
  },
  {
    id: 136,
    text: "The moment we choose to love we begin to move against domination, against oppression. The moment we choose to love we begin to move towards freedom.",
    author: "bell hooks",
    source: "Outlaw Culture",
    category: "essay",
    tags: ["love", "freedom", "rebellion", "courage"]
  },
  {
    id: 137,
    text: "Knowing how to be solitary is central to the art of loving. When we can be alone, we can be with others without using them as a means of escape.",
    author: "bell hooks",
    source: "All About Love",
    category: "essay",
    tags: ["solitude", "love", "relationships", "self-discovery"]
  },

  // ─── JENNY SLATE ──────────────────────────────────────────────────────────
  {
    id: 138,
    text: "My whole life I've tried to act like stuff doesn't affect me, but it turns out everything affects me.",
    author: "Jenny Slate",
    source: "Little Weirds",
    category: "memoir",
    tags: ["vulnerability", "truth", "identity", "self-discovery"]
  },

  // ─── EILEEN MYLES ─────────────────────────────────────────────────────────
  {
    id: 139,
    text: "An artist is someone who listens to their own weird and follows it wherever it goes.",
    author: "Eileen Myles",
    category: "interview",
    tags: ["creativity", "identity", "rebellion", "intuition"]
  },

  // ─── ELIZABETH BISHOP ─────────────────────────────────────────────────────
  {
    id: 140,
    text: "The art of losing isn't hard to master; so many things seem filled with the intent to be lost that their loss is no disaster.",
    author: "Elizabeth Bishop",
    source: "One Art",
    category: "poetry",
    tags: ["loss", "grief", "surrender", "wisdom"]
  },

  // ─── LORRIE MOORE ─────────────────────────────────────────────────────────
  {
    id: 141,
    text: "People who were coloring their hair to look like they weren't coloring their hair: what was it all for?",
    author: "Lorrie Moore",
    source: "A Gate at the Stairs",
    category: "literature",
    tags: ["truth", "identity", "illusion", "wisdom"]
  },
  {
    id: 142,
    text: "All love is true love — even the kind that makes you stupid.",
    author: "Lorrie Moore",
    category: "literature",
    tags: ["love", "vulnerability", "truth", "relationships"]
  },

  // ─── OTTESSA MOSHFEGH ─────────────────────────────────────────────────────
  {
    id: 143,
    text: "I had a feeling that by sleeping long enough I might find a way to a better life.",
    author: "Ottessa Moshfegh",
    source: "My Year of Rest and Relaxation",
    category: "literature",
    tags: ["solitude", "healing", "surrender", "transformation"]
  },

  // ─── SHEILA HETI ──────────────────────────────────────────────────────────
  {
    id: 144,
    text: "Doing anything with your life is hard. Having a purpose that you care about is hard.",
    author: "Sheila Heti",
    source: "How Should a Person Be?",
    category: "literature",
    tags: ["truth", "ambition", "discipline", "vulnerability"]
  },

  // ─── JENNY ZHANG ──────────────────────────────────────────────────────────
  {
    id: 145,
    text: "There's something about telling yourself that you can do it that makes you believe you can.",
    author: "Jenny Zhang",
    source: "Sour Heart",
    category: "literature",
    tags: ["courage", "self-discovery", "new-beginnings", "power"]
  },

  // ─── HEATHER HAVRILESKY (Ask Polly) ───────────────────────────────────────
  {
    id: 146,
    text: "You have to learn to say, This is who I am. This is what I want. Even when it makes you feel pathetic.",
    author: "Heather Havrilesky",
    source: "How to Be a Person in the World",
    category: "essay",
    tags: ["identity", "courage", "vulnerability", "truth"]
  },
  {
    id: 147,
    text: "Feel your feelings. Don't fix them. Don't replace them with better ones. Just feel the ones you have.",
    author: "Heather Havrilesky",
    source: "How to Be a Person in the World",
    category: "essay",
    tags: ["vulnerability", "surrender", "healing", "truth"]
  },

  // ─── RACHEL KUSHNER ───────────────────────────────────────────────────────
  {
    id: 148,
    text: "Some people have a way of getting under your skin not by being interesting but by being interested.",
    author: "Rachel Kushner",
    source: "The Flamethrowers",
    category: "literature",
    tags: ["relationships", "love", "truth", "communication"]
  },

  // ─── LESLIE JAMISON ───────────────────────────────────────────────────────
  {
    id: 149,
    text: "Empathy isn't just something that happens to us. It's something we can cultivate.",
    author: "Leslie Jamison",
    source: "The Empathy Exams",
    category: "essay",
    tags: ["love", "relationships", "growth", "wisdom"]
  },
  {
    id: 150,
    text: "Pain that gets performed is still pain.",
    author: "Leslie Jamison",
    source: "The Empathy Exams",
    category: "essay",
    tags: ["truth", "vulnerability", "healing", "identity"]
  },

  // ─── SARAH MANGUSO ────────────────────────────────────────────────────────
  {
    id: 151,
    text: "The best thing about time passing is the privilege of running out of it, of watching the wave of mortality break over me and everyone I know.",
    author: "Sarah Manguso",
    source: "Ongoingness",
    category: "memoir",
    tags: ["truth", "legacy", "surrender", "wisdom"]
  },

  // ─── EMILY DICKINSON ──────────────────────────────────────────────────────
  {
    id: 152,
    text: "I dwell in Possibility.",
    author: "Emily Dickinson",
    category: "poetry",
    tags: ["new-beginnings", "creativity", "freedom", "intuition"]
  },
  {
    id: 153,
    text: "Tell all the truth but tell it slant.",
    author: "Emily Dickinson",
    category: "poetry",
    tags: ["truth", "creativity", "wisdom", "communication"]
  },
  {
    id: 154,
    text: "If I can stop one heart from breaking, I shall not live in vain.",
    author: "Emily Dickinson",
    category: "poetry",
    tags: ["love", "duty", "legacy", "healing"]
  },
  {
    id: 155,
    text: "Forever is composed of nows.",
    author: "Emily Dickinson",
    category: "poetry",
    tags: ["wisdom", "patience", "destiny", "truth"]
  },

  // ─── RAINER MARIA RILKE ───────────────────────────────────────────────────
  {
    id: 156,
    text: "Let everything happen to you. Beauty and terror. Just keep going. No feeling is final.",
    author: "Rainer Maria Rilke",
    source: "The Book of Hours",
    category: "poetry",
    tags: ["courage", "surrender", "transformation", "healing"]
  },
  {
    id: 157,
    text: "Perhaps all the dragons in our lives are princesses who are only waiting to see us act, just once, with beauty and courage.",
    author: "Rainer Maria Rilke",
    source: "Letters to a Young Poet",
    category: "literature",
    tags: ["courage", "fear", "transformation", "self-discovery"]
  },
  {
    id: 158,
    text: "The purpose of life is to be defeated by greater and greater things.",
    author: "Rainer Maria Rilke",
    category: "literature",
    tags: ["growth", "surrender", "ambition", "wisdom"]
  },
  {
    id: 159,
    text: "I want to unfold. I don't want to stay folded anywhere, because where I am folded, there I am a lie.",
    author: "Rainer Maria Rilke",
    category: "poetry",
    tags: ["truth", "identity", "growth", "vulnerability"]
  },

  // ─── SIMONE DE BEAUVOIR ───────────────────────────────────────────────────
  {
    id: 160,
    text: "I am too intelligent, too demanding, and too resourceful for anyone to be able to take charge of me entirely.",
    author: "Simone de Beauvoir",
    category: "memoir",
    tags: ["identity", "power", "rebellion", "self-discovery"]
  },
  {
    id: 161,
    text: "One's life has value so long as one attributes value to the life of others.",
    author: "Simone de Beauvoir",
    category: "essay",
    tags: ["love", "relationships", "wisdom", "legacy"]
  },
  {
    id: 162,
    text: "Change your life today. Don't gamble on the future, act now, without delay.",
    author: "Simone de Beauvoir",
    category: "essay",
    tags: ["courage", "new-beginnings", "discipline", "ambition"]
  },

  // ─── YOKO ONO ─────────────────────────────────────────────────────────────
  {
    id: 163,
    text: "A dream you dream alone is only a dream. A dream you dream together is reality.",
    author: "Yoko Ono",
    category: "observation",
    tags: ["love", "relationships", "creativity", "destiny"]
  },

  // ─── VIVIAN GORNICK ───────────────────────────────────────────────────────
  {
    id: 164,
    text: "What happened didn't matter. It's what you make of what happened that matters.",
    author: "Vivian Gornick",
    source: "The Situation and the Story",
    category: "essay",
    tags: ["transformation", "identity", "creativity", "wisdom"]
  },

  // ─── JESMYN WARD ──────────────────────────────────────────────────────────
  {
    id: 165,
    text: "We are here. We are not nothing. We made something of ourselves.",
    author: "Jesmyn Ward",
    source: "Men We Reaped",
    category: "memoir",
    tags: ["identity", "legacy", "courage", "truth"]
  },

  // ─── CARMEN MARIA MACHADO ─────────────────────────────────────────────────
  {
    id: 166,
    text: "What I was learning was that there is always a gap between what you intend and what you do.",
    author: "Carmen Maria Machado",
    source: "In the Dream House",
    category: "memoir",
    tags: ["truth", "vulnerability", "self-discovery", "relationships"]
  },

  // ─── KIESE LAYMON ─────────────────────────────────────────────────────────
  {
    id: 167,
    text: "I wanted to be the kind of person who could hold all the terrible truths about our country and still love the people in it.",
    author: "Kiese Laymon",
    source: "Heavy",
    category: "memoir",
    tags: ["love", "truth", "vulnerability", "courage"]
  },

  // ─── MAGGIE NELSON ────────────────────────────────────────────────────────
  {
    id: 168,
    text: "Is there something inherently queer about pregnancy itself, insofar as it profoundly alters one's 'normal' state?",
    author: "Maggie Nelson",
    source: "The Argonauts",
    category: "memoir",
    tags: ["transformation", "identity", "truth", "vulnerability"]
  },
  {
    id: 169,
    text: "The pleasure of recognizing that one may have to undergo the same realization more than once.",
    author: "Maggie Nelson",
    source: "Bluets",
    category: "essay",
    tags: ["patience", "wisdom", "growth", "self-discovery"]
  },

  // ─── CLAUDIA RANKINE ──────────────────────────────────────────────────────
  {
    id: 170,
    text: "You are in the dark, in the car, watching the men ahead of you, in the headlights. What you know is this: you will have to wait.",
    author: "Claudia Rankine",
    source: "Citizen",
    category: "poetry",
    tags: ["patience", "truth", "vulnerability", "power"]
  },

  // ─── HANIF ABDURRAQIB ─────────────────────────────────────────────────────
  {
    id: 171,
    text: "I am most interested in people who have figured out a way to keep the door open even as the world demands they close it.",
    author: "Hanif Abdurraqib",
    source: "They Can't Kill Us Until They Kill Us",
    category: "essay",
    tags: ["courage", "vulnerability", "rebellion", "love"]
  },

  // ─── ELIZABETH ACEVEDO ────────────────────────────────────────────────────
  {
    id: 172,
    text: "I know enough of the world to know that nothing is ever as simple as one reason.",
    author: "Elizabeth Acevedo",
    source: "The Poet X",
    category: "poetry",
    tags: ["wisdom", "truth", "self-discovery", "patience"]
  },

  // ─── ROSS GAY ─────────────────────────────────────────────────────────────
  {
    id: 173,
    text: "It astonishes me sometimes — though it shouldn't, I know — how a delight can be complicated or tethered to sorrow.",
    author: "Ross Gay",
    source: "The Book of Delights",
    category: "essay",
    tags: ["joy", "grief", "truth", "wisdom"]
  },
  {
    id: 174,
    text: "Delight, it turns out, grows only in the garden of sorrow, or at least is nourished there.",
    author: "Ross Gay",
    source: "The Book of Delights",
    category: "essay",
    tags: ["joy", "grief", "growth", "transformation"]
  },

  // ─── SAMANTHA IRBY ────────────────────────────────────────────────────────
  {
    id: 175,
    text: "I am too old and too smart and my knees hurt too much to pretend that I don't know exactly what I want.",
    author: "Samantha Irby",
    source: "Wow, No Thank You.",
    category: "memoir",
    tags: ["identity", "truth", "rebellion", "wisdom"]
  },

  // ─── CATHERINE LACEY ──────────────────────────────────────────────────────
  {
    id: 176,
    text: "Sometimes the hardest thing is not getting what you want. And sometimes the hardest thing is getting it.",
    author: "Catherine Lacey",
    source: "Nobody Is Ever Missing",
    category: "literature",
    tags: ["truth", "ambition", "vulnerability", "wisdom"]
  },

  // ─── LIDIA YUKNAVITCH ─────────────────────────────────────────────────────
  {
    id: 177,
    text: "Let the story of you come out of your body. It's the only story that matters.",
    author: "Lidia Yuknavitch",
    source: "The Misfit's Manifesto",
    category: "memoir",
    tags: ["identity", "courage", "creativity", "truth"]
  },

  // ─── YIYUN LI ─────────────────────────────────────────────────────────────
  {
    id: 178,
    text: "A person's life, I have learned, is an accumulation of hesitations.",
    author: "Yiyun Li",
    source: "Where Reasons End",
    category: "literature",
    tags: ["truth", "patience", "fear", "self-discovery"]
  },

  // ─── ADA LIMÓN ────────────────────────────────────────────────────────────
  {
    id: 179,
    text: "I want to be so bright that the dark that swallows me entire can't tell the difference between eating and being.",
    author: "Ada Limón",
    source: "Bright Dead Things",
    category: "poetry",
    tags: ["courage", "identity", "passion", "transformation"]
  },

  // ─── NAYYIRAH WAHEED ──────────────────────────────────────────────────────
  {
    id: 180,
    text: "You do not have to be a fire for every mountain blocking you. You could be a water and go around.",
    author: "Nayyirah Waheed",
    source: "Salt",
    category: "poetry",
    tags: ["patience", "wisdom", "surrender", "courage"]
  },

  // ─── NATASHA TRETHEWEY ────────────────────────────────────────────────────
  {
    id: 181,
    text: "What is evidence but the weight of the world? I've carried mine.",
    author: "Natasha Trethewey",
    source: "Memorial Drive",
    category: "memoir",
    tags: ["truth", "grief", "identity", "legacy"]
  },

  // ─── JENNY OFFILL ─────────────────────────────────────────────────────────
  {
    id: 182,
    text: "My plan was to never get married. I was going to be an art monster instead.",
    author: "Jenny Offill",
    source: "Dept. of Speculation",
    category: "literature",
    tags: ["ambition", "identity", "creativity", "rebellion"]
  },
  {
    id: 183,
    text: "Imagine someone so steadfast and kind and good that they make you want to be better just by loving them back.",
    author: "Jenny Offill",
    source: "Dept. of Speculation",
    category: "literature",
    tags: ["love", "relationships", "growth", "vulnerability"]
  },

  // ─── ELIF BATUMAN ─────────────────────────────────────────────────────────
  {
    id: 184,
    text: "I thought about how I seemed to live by the rhythm of accumulating enough dread to force me to act.",
    author: "Elif Batuman",
    source: "The Idiot",
    category: "literature",
    tags: ["self-discovery", "fear", "truth", "courage"]
  },

  // ─── PATRICIA LOCKWOOD ────────────────────────────────────────────────────
  {
    id: 185,
    text: "The portal, she thought, was a place where you could be yourself precisely because it was a place where nobody was.",
    author: "Patricia Lockwood",
    source: "No One Is Talking About This",
    category: "literature",
    tags: ["identity", "solitude", "truth", "illusion"]
  },

  // ─── MARGO JEFFERSON ─────────────────────────────────────────────────────
  {
    id: 186,
    text: "Privilege is something you have to learn to perceive. Power is something you have to be willing to question.",
    author: "Margo Jefferson",
    source: "Negroland",
    category: "memoir",
    tags: ["truth", "power", "self-discovery", "wisdom"]
  },

  // ─── HILTON ALS ───────────────────────────────────────────────────────────
  {
    id: 187,
    text: "The danger of loving someone is loving them too much and being afraid to tell them so.",
    author: "Hilton Als",
    source: "White Girls",
    category: "essay",
    tags: ["love", "fear", "vulnerability", "relationships"]
  },

  // ─── COLM TÓIBÍN ─────────────────────────────────────────────────────────
  {
    id: 188,
    text: "She thought how strange it was that she could not cry in the place where she had been most happy.",
    author: "Colm Tóibín",
    source: "Brooklyn",
    category: "literature",
    tags: ["grief", "home", "love", "change"]
  },

  // ─── RACHEL CARSON ────────────────────────────────────────────────────────
  {
    id: 189,
    text: "Those who contemplate the beauty of the earth find reserves of strength that will endure as long as life lasts.",
    author: "Rachel Carson",
    source: "The Sense of Wonder",
    category: "essay",
    tags: ["joy", "wisdom", "healing", "abundance"]
  },

  // ─── EXTRA LITERARY / ESSAY ───────────────────────────────────────────────
  {
    id: 190,
    text: "The things that we love tell us what we are.",
    author: "Thomas Aquinas",
    category: "observation",
    tags: ["identity", "love", "self-discovery", "truth"]
  },
  {
    id: 191,
    text: "What a liberation to realize that the 'voice in my head' is not who I am.",
    author: "Eckhart Tolle",
    source: "The Power of Now",
    category: "essay",
    tags: ["self-discovery", "healing", "freedom", "truth"]
  },
  {
    id: 192,
    text: "We are not trapped or locked up in these bones. No, no. We are free to change. And love changes us. And if we can love one another, we can break open the sky.",
    author: "Walter Mosley",
    category: "literature",
    tags: ["love", "freedom", "transformation", "courage"]
  },
  {
    id: 193,
    text: "The human heart is a strange vessel. Love and hatred can exist side by side.",
    author: "Scott Westerfeld",
    category: "literature",
    tags: ["truth", "love", "vulnerability", "balance"]
  },
  {
    id: 194,
    text: "In any given moment we have two options: to step forward into growth or to step back into safety.",
    author: "Abraham Maslow",
    category: "observation",
    tags: ["courage", "growth", "new-beginnings", "fear"]
  },
  {
    id: 195,
    text: "I have been bent and broken, but — I hope — into a better shape.",
    author: "Charles Dickens",
    source: "Great Expectations",
    category: "literature",
    tags: ["healing", "transformation", "growth", "vulnerability"]
  },
  {
    id: 196,
    text: "I am deliberate and afraid of nothing.",
    author: "Audre Lorde",
    category: "poetry",
    tags: ["courage", "identity", "power", "self-discovery"]
  },
  {
    id: 197,
    text: "If they don't give you a seat at the table, bring a folding chair.",
    author: "Shirley Chisholm",
    category: "observation",
    tags: ["rebellion", "courage", "power", "ambition"]
  },
  {
    id: 198,
    text: "No one can make you feel inferior without your consent.",
    author: "Eleanor Roosevelt",
    category: "observation",
    tags: ["power", "identity", "courage", "self-discovery"]
  },
  {
    id: 199,
    text: "You own everything that happened to you. Tell your stories. If people wanted you to write warmly about them, they should have behaved better.",
    author: "Anne Lamott",
    source: "Bird by Bird",
    category: "essay",
    tags: ["truth", "courage", "creativity", "identity"]
  },
  {
    id: 200,
    text: "I belong deeply to myself.",
    author: "Warsan Shire",
    category: "poetry",
    tags: ["identity", "self-discovery", "love", "freedom"]
  },
];
