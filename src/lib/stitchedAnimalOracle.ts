export interface OracleCard {
  id: string;           // e.g. "sa-1" (stitched-animal-1)
  number: number;       // 1-36 (matches image filename)
  animal: string;       // e.g. "Rabbit"
  keyword: string;      // e.g. "Sensitivity"
  meaning: string;      // 4-6 sentence reading
  image: string;        // path e.g. "/oracle/stitched-animal/1.webp"
  media?: {
    book?: string;
    film?: string;
    song?: string;
  };
}

export interface OracleDeckInfo {
  id: string;
  name: string;
  description: string;
  cardCount: number;
  coverImage: string;  // use first card image
  backImage: string;   // card back image
  cards: OracleCard[];
}

export const STITCHED_ANIMAL_ORACLE: OracleDeckInfo = {
  id: "stitched-animal",
  name: "Stitched Animal Oracle",
  description: "A 36-card oracle deck featuring hand-stitched animals, each offering wisdom and guidance. Read upright only—no reversed meanings.",
  cardCount: 36,
  coverImage: "/oracle/stitched-animal/1.webp",
  backImage: "/oracle/stitched-animal/back of deck.webp",
  cards: [
    {
      id: "sa-1",
      number: 1,
      animal: "Rabbit",
      keyword: "Sensitivity",
      meaning: "Your sensitivity is not a weakness—it is your ability to perceive what others miss. You may be picking up on subtle shifts in energy, emotion, or environment. Right now, your receptiveness is an asset, allowing you to navigate your surroundings with care and awareness. Trust what you sense, even if you cannot yet explain it. This is a time to honor your emotional intelligence and move gently through the world.",
      image: "/oracle/stitched-animal/1.webp",
      media: {
        book: "The Highly Sensitive Person by Elaine N. Aron",
        film: "Watership Down",
        song: "Sensitive by The Pains of Being Pure at Heart"
      }
    },
    {
      id: "sa-2",
      number: 2,
      animal: "Fox",
      keyword: "Instinct",
      meaning: "Your gut knows something your mind has not yet caught up with. The fox trusts its inner knowing, moving with alertness and perception. You are being invited to rely more on your instincts and less on logic alone. There may be a situation where you need to trust your initial impression or act on intuition. Pay attention to what feels true beneath the surface.",
      image: "/oracle/stitched-animal/2.webp",
      media: {
        book: "The Only Astrology Book You'll Ever Need by Stefanie Iris Weiss",
        film: "Fantastic Mr. Fox",
        song: "Cunning by Christine Lavin"
      }
    },
    {
      id: "sa-3",
      number: 3,
      animal: "Chicks",
      keyword: "Nurture",
      meaning: "Growth is happening, but it needs tending. The chicks represent new life that requires care, warmth, and attention. You may be nurturing something precious—a project, a relationship, or an aspect of yourself that is still vulnerable. This card reminds you that protection and nourishment go hand in hand. Show up consistently for what needs your care right now.",
      image: "/oracle/stitched-animal/3.webp",
      media: {
        book: "The Gifts of Imperfect Parenting by Brené Brown",
        film: "Charlotte's Web",
        song: "Grow Old With You by Adam Sandler"
      }
    },
    {
      id: "sa-4",
      number: 4,
      animal: "Swan",
      keyword: "Transformation",
      meaning: "You are in the midst of becoming something new. The swan knows that true transformation requires surrendering the old form. What you are moving through may feel uncomfortable or uncertain, but it is part of a deeper unfolding. Trust the process of change, even when you cannot see the final form. You are not breaking—you are evolving into something more aligned with who you truly are.",
      image: "/oracle/stitched-animal/4.webp",
      media: {
        book: "The Year of Magical Thinking by Joan Didion",
        film: "Black Swan",
        song: "The Swan by Saint-Saëns"
      }
    },
    {
      id: "sa-5",
      number: 5,
      animal: "Moth",
      keyword: "Attraction",
      meaning: "You are drawn toward something that calls to your inner light. The moth follows what attracts it, moving toward illumination and meaning. This card suggests that your desires are valid and that you should pay attention to what naturally pulls you forward. Something is calling you—a person, a path, or a possibility. Move toward it with awareness and trust what magnetizes you.",
      image: "/oracle/stitched-animal/5.webp",
      media: {
        book: "Desire: The Untold Story by Daniel Bergman",
        film: "The Mothman Prophecies",
        song: "Drawn to You by Miyuki Nakajima"
      }
    },
    {
      id: "sa-6",
      number: 6,
      animal: "Fawn",
      keyword: "Newness",
      meaning: "You are at the beginning of something, even if it feels uncertain. The fawn represents softness, vulnerability, and new experiences. You may feel unsteady or unsure, but that is part of starting something new. This card encourages you to move gently with yourself as you step into unfamiliar space.",
      image: "/oracle/stitched-animal/6.webp",
      media: {
        book: "The Courage to Be Disliked by Ichiro Kishimi",
        film: "Bambi",
        song: "New Beginning by Ysabelle Cuevas"
      }
    },
    {
      id: "sa-7",
      number: 7,
      animal: "Dog",
      keyword: "Loyalty",
      meaning: "True loyalty is a gift that asks for presence and consistency. The dog shows up, again and again, without question. This card speaks to the power of showing up for what matters and for the people you care about. It may also be asking you to examine where your loyalties truly lie. Are you giving your devotion to what deserves it? Trust in those who have proven themselves faithful.",
      image: "/oracle/stitched-animal/7.webp",
      media: {
        book: "The Art of Racing in the Rain by Garth Stein",
        film: "Hachi: A Dog's Tale",
        song: "Man's Best Friend by Don Henley"
      }
    },
    {
      id: "sa-8",
      number: 8,
      animal: "Cat",
      keyword: "Independence",
      meaning: "You are exactly where you need to be, on your own terms. The cat answers to no one but itself, moving with grace and intention. This card reminds you that independence is not isolation—it is self-knowing. You do not need permission to make decisions that are right for you. Trust your own judgment and honor your need for autonomy. Your path does not have to look like anyone else's.",
      image: "/oracle/stitched-animal/8.webp",
      media: {
        book: "Eat, Pray, Love by Elizabeth Gilbert",
        film: "The Aristocats",
        song: "Independent Woman Part I by Destiny's Child"
      }
    },
    {
      id: "sa-9",
      number: 9,
      animal: "Stag",
      keyword: "Grace",
      meaning: "Move through this moment with quiet dignity. The stag embodies grace—not perfection, but a kind of natural elegance that comes from knowing yourself. You may be navigating something challenging, but you have the capacity to do so with poise. Grace is not about being flawless; it is about moving through difficulty without losing your center. You are more capable than you realize.",
      image: "/oracle/stitched-animal/9.webp",
      media: {
        book: "The Power of Now by Eckhart Tolle",
        film: "The Lion King",
        song: "Graceful by Sara Bareilles"
      }
    },
    {
      id: "sa-10",
      number: 10,
      animal: "Butterfly",
      keyword: "Renewal",
      meaning: "Something is being restored within you or your life. The butterfly emerges from its cocoon fundamentally changed, yet itself. This is not starting over—this is renewal. An old pattern may be falling away, making space for fresh energy. You are shedding what no longer serves you and stepping into a version of yourself that feels more alive. This transformation is gentle and natural.",
      image: "/oracle/stitched-animal/10.webp",
      media: {
        book: "The Very Hungry Caterpillar by Eric Carle",
        film: "Papillon",
        song: "Butterfly by Crazy Town"
      }
    },
    {
      id: "sa-11",
      number: 11,
      animal: "Owl",
      keyword: "Wisdom",
      meaning: "You already know what you need to know. The owl sees in darkness, perceiving truth beneath the surface. This card invites you to trust the wisdom you have gathered from your experiences. You do not need to look elsewhere for answers—look within. Pay attention to your intuition, your experience, and the quiet knowing that lives inside you. You are wiser than you give yourself credit for.",
      image: "/oracle/stitched-animal/11.webp",
      media: {
        book: "Man's Search for Meaning by Viktor Frankl",
        film: "Legend of the Guardians",
        song: "Knowledge is Power by Sam Cooke"
      }
    },
    {
      id: "sa-12",
      number: 12,
      animal: "Wolf",
      keyword: "Guidance",
      meaning: "There is a path ahead, and you are not alone. The wolf moves with purpose and community, guided by something larger than itself. You may be seeking direction or feeling unsure of your next steps. This card suggests that guidance is available—through your inner knowing, through the people around you, or through following signs that resonate. Trust that you are being guided, even when the path is not fully visible.",
      image: "/oracle/stitched-animal/12.webp",
      media: {
        book: "The Hero with a Thousand Faces by Joseph Campbell",
        film: "Princess Mononoke",
        song: "Runaway by AURORA"
      }
    },
    {
      id: "sa-13",
      number: 13,
      animal: "Bat",
      keyword: "Rebirth",
      meaning: "You are being reborn. The bat navigates through darkness using inner senses and emerging stronger. This card speaks to death and renewal on a deep level—the ending of something old and the emergence of something new. You may be in a period of darkness or transition that feels disorienting. Trust that you are moving toward your own rebirth. What is ending is necessary for what wants to begin.",
      image: "/oracle/stitched-animal/13.webp",
      media: {
        book: "When Things Fall Apart by Pema Chödrön",
        film: "Batman Begins",
        song: "Rebirth by One Less Lonely Girl"
      }
    },
    {
      id: "sa-14",
      number: 14,
      animal: "Snake",
      keyword: "Shedding",
      meaning: "You are ready to release something that no longer fits. The snake sheds its skin completely, making room for new growth. What you are letting go of may have served you once, but its time has passed. This process may feel vulnerable—like you are exposing something tender beneath. Trust this shedding. What remains is more aligned with who you are becoming. The old form is no longer needed.",
      image: "/oracle/stitched-animal/14.webp",
      media: {
        book: "Letting Go by David R. Hawkins",
        film: "The Jungle Book",
        song: "Shed Your Skin by Metric"
      }
    },
    {
      id: "sa-15",
      number: 15,
      animal: "Hawk",
      keyword: "Awareness",
      meaning: "There is clarity available if you step back and look at the bigger picture. The hawk represents perspective and sharp awareness. You may be too close to something to see it clearly. This card invites you to widen your view. What you are looking for may already be visible—you just need distance to recognize it.",
      image: "/oracle/stitched-animal/15.webp",
      media: {
        book: "The Gifts of Imperfect Parenting by Brené Brown",
        film: "Top Gun",
        song: "Perspective by Ethan Bortnick"
      }
    },
    {
      id: "sa-16",
      number: 16,
      animal: "Lamb",
      keyword: "Innocence",
      meaning: "There is a part of you that remains untouched and pure, regardless of what you have been through. The lamb represents innocence—not naïveté, but the capacity to see with wonder and openness. This card invites you to reconnect with that part of yourself. You may need to soften your defenses and trust again. Innocence is not weakness; it is a form of strength that allows you to remain open to beauty.",
      image: "/oracle/stitched-animal/16.webp",
      media: {
        book: "The Lion, the Witch and the Wardrobe by C.S. Lewis",
        film: "Bambi",
        song: "Innocent Man by Billy Joel"
      }
    },
    {
      id: "sa-17",
      number: 17,
      animal: "Cow",
      keyword: "Nourishment",
      meaning: "You are being asked to nourish yourself and others. The cow represents abundance, generosity, and the capacity to give freely. You may have more than you realize—time, energy, love, or resources. This card invites you to share what you have and to receive nourishment in return. Taking care of yourself is not selfish; it allows you to continue giving to the world. Feed what matters.",
      image: "/oracle/stitched-animal/17.webp",
      media: {
        book: "The Art of Nourishing by Anita Moorjani",
        film: "Home on the Range",
        song: "Nourish by Sylvia Plath"
      }
    },
    {
      id: "sa-18",
      number: 18,
      animal: "Hen",
      keyword: "Protection",
      meaning: "Your protective instinct is strong, and it comes from love. The hen gathers her chicks beneath her wings, creating a safe space for what is precious. This is maternal protection—the kind that keeps what you love close and safe. You may be called to protect something or someone right now, or to allow yourself to be protected. This protection comes from care, not fear. Keep close what matters most.",
      image: "/oracle/stitched-animal/18.webp",
      media: {
        book: "Daring Greatly by Brené Brown",
        film: "Charlotte's Web",
        song: "Protective by Jessie J"
      }
    },
    {
      id: "sa-19",
      number: 19,
      animal: "Hen",
      keyword: "Protection",
      meaning: "Your protective instinct is strong, and it comes from love. The hen gathers her chicks beneath her wings, creating a safe space for what is precious. This is maternal protection—the kind that keeps what you love close and safe. You may be called to protect something or someone right now, or to allow yourself to be protected. This protection comes from care, not fear. Keep close what matters most.",
      image: "/oracle/stitched-animal/19.webp",
      media: {
        book: "Daring Greatly by Brené Brown",
        film: "Charlotte's Web",
        song: "Protective by Jessie J"
      }
    },
    {
      id: "sa-20",
      number: 20,
      animal: "Seal",
      keyword: "Playfulness",
      meaning: "There is a lightness available to you that you may be overlooking. The seal moves easily between depth and surface, reminding you that not everything needs to feel heavy or serious. You may have been holding tension—emotionally or mentally—and this card invites you to soften your grip. Play is not a distraction; it is a way of reconnecting with yourself. Let yourself experience moments of ease without questioning their value.",
      image: "/oracle/stitched-animal/20.webp",
      media: {
        book: "The Artist's Way by Julia Cameron",
        film: "Seal Team",
        song: "Playful by Pharrell Williams"
      }
    },
    {
      id: "sa-21",
      number: 21,
      animal: "Turtle",
      keyword: "Patience",
      meaning: "Things are moving, even if you cannot see it yet. The turtle reminds you that progress does not need to be fast to be meaningful. You may feel frustration around timing, especially if you are comparing your pace to others. This card invites you to trust your own rhythm. What is unfolding in your life is doing so with intention, even if it feels slow.",
      image: "/oracle/stitched-animal/21.webp",
      media: {
        book: "Slow: Living the Slow Life by Carl Honoré",
        film: "Finding Nemo",
        song: "Slow It Down by The Lumineers"
      }
    },
    {
      id: "sa-22",
      number: 22,
      animal: "Bear",
      keyword: "Strength",
      meaning: "You are stronger than you may feel right now, but this strength does not require constant action. The bear represents grounded, internal power—the kind that exists even in stillness. This card may be asking you to pause, to rest, or to conserve your energy rather than pushing forward. Strength is not always visible; sometimes it is the quiet decision to endure, to wait, or to take care of yourself.",
      image: "/oracle/stitched-animal/22.webp",
      media: {
        book: "Rising Strong by Brené Brown",
        film: "The Bear",
        song: "Strength by Kendrick Lamar"
      }
    },
    {
      id: "sa-23",
      number: 23,
      animal: "Otter",
      keyword: "Delight",
      meaning: "Joy exists in small, shared moments. The otter represents connection through ease—laughter, closeness, and simple presence. You may be searching for something bigger when what you need is already available in subtle ways. This card encourages you to notice what feels warm, what feels light, and what brings you back into your body. Delight is not something you earn—it is something you allow.",
      image: "/oracle/stitched-animal/23.webp",
      media: {
        book: "The Book of Joy by Dalai Lama and Desmond Tutu",
        film: "Ring of Bright Water",
        song: "Walking on Sunshine by Katrina and The Waves"
      }
    },
    {
      id: "sa-24",
      number: 24,
      animal: "Horse",
      keyword: "Freedom",
      meaning: "There is a pull toward movement—toward something that offers more space, more possibility, or more truth. The horse represents expansion and independence. You may be feeling restricted or held in place by something that no longer fits. This card encourages you to listen to that internal urge to move forward. You are allowed to choose freedom, even if it requires change.",
      image: "/oracle/stitched-animal/24.webp",
      media: {
        book: "The Anatomy of Peace by The Arbinger Institute",
        film: "Spirit: Stallion of the Cimarron",
        song: "I'm Free by The Who"
      }
    },
    {
      id: "sa-25",
      number: 25,
      animal: "Elephant",
      keyword: "Memory",
      meaning: "There is something from the past asking to be understood more deeply. The elephant represents memory, emotional depth, and the weight of experience. You may be revisiting something—not to stay in it, but to learn from it. This card encourages reflection with compassion. What you have lived through holds meaning, but it does not need to define your future.",
      image: "/oracle/stitched-animal/25.webp",
      media: {
        book: "Educated by Tara Westover",
        film: "Dumbo",
        song: "The Memory Remains by Metallica"
      }
    },
    {
      id: "sa-26",
      number: 26,
      animal: "Dove",
      keyword: "Peace",
      meaning: "There is an opportunity for calm, even if things have felt unsettled. The dove represents resolution, softness, and emotional clarity. You may be ready to release tension, forgive, or step away from something that no longer serves you. Peace is not something you have to wait for—it is something you can choose.",
      image: "/oracle/stitched-animal/26.webp",
      media: {
        book: "The Book of Awakening by Mark Nepo",
        film: "Cinderella",
        song: "Imagine by John Lennon"
      }
    },
    {
      id: "sa-27",
      number: 27,
      animal: "Ant",
      keyword: "Discipline",
      meaning: "The ant reminds you that small actions accumulate. You may be focused on the end result, overlooking the importance of consistent effort. This card invites you to return to structure—habits, routines, or small steps that support long-term growth. You do not need to do everything at once. What matters is that you continue.",
      image: "/oracle/stitched-animal/27.webp",
      media: {
        book: "Atomic Habits by James Clear",
        film: "Antz",
        song: "Work It Out by A Tribe Called Quest"
      }
    },
    {
      id: "sa-28",
      number: 28,
      animal: "Peacock",
      keyword: "Expression",
      meaning: "There is something within you that wants to be seen. The peacock represents authenticity and self-expression—not for approval, but for alignment. You may be holding back or minimizing yourself. This card encourages you to step into visibility in a way that feels true to you. You do not need to become anything new—you only need to allow yourself to be seen.",
      image: "/oracle/stitched-animal/28.webp",
      media: {
        book: "The Gifts of Imperfect Parenting by Brené Brown",
        film: "The Nutcracker and the Four Realms",
        song: "Born This Way by Lady Gaga"
      }
    },
    {
      id: "sa-29",
      number: 29,
      animal: "Jellyfish",
      keyword: "Boundaries",
      meaning: "Boundaries are not walls—they are permeable and protective. The jellyfish has a clear edge that allows it to sense the water while remaining itself. You may need to define what belongs to you and what does not. This card invites you to establish healthy limits without closing yourself off completely. Know where you end and others begin. Boundaries allow connection to be real and sustainable.",
      image: "/oracle/stitched-animal/29.webp",
      media: {
        book: "Set Boundaries, Find Peace by Nedra Glover Tawwab",
        film: "Finding Nemo",
        song: "No More Mr. Nice Guy by Alice Cooper"
      }
    },
    {
      id: "sa-30",
      number: 30,
      animal: "Lovebirds",
      keyword: "Devotion",
      meaning: "Connection is being emphasized in your life right now. This may be a relationship, or it may be your relationship with yourself. Lovebirds represent closeness, presence, and emotional attention. This card invites you to nurture connection through small, consistent acts rather than waiting for something dramatic.",
      image: "/oracle/stitched-animal/30.webp",
      media: {
        book: "The Language of Letting Go by Melody Beattie",
        film: "The Lovebirds",
        song: "Devoted to You by Everly Brothers"
      }
    },
    {
      id: "sa-31",
      number: 31,
      animal: "Firefly",
      keyword: "Hope",
      meaning: "Even a small light can guide you forward. The firefly represents quiet hope—something subtle but steady. You may not have all the answers, but there is enough here to keep moving. This card encourages you to pay attention to what gently pulls you forward rather than waiting for certainty.",
      image: "/oracle/stitched-animal/31.webp",
      media: {
        book: "Man's Search for Meaning by Viktor Frankl",
        film: "Fireflies in the Garden",
        song: "Don't Give Up by Peter Gabriel & Kate Bush"
      }
    },
    {
      id: "sa-32",
      number: 32,
      animal: "Crab",
      keyword: "Protection",
      meaning: "You may need to protect your energy right now. The crab represents boundaries and emotional safety. You may be feeling sensitive or exposed, and this card encourages you to create space where needed. Protection is not avoidance—it is care. Just be mindful not to close yourself off completely.",
      image: "/oracle/stitched-animal/32.webp",
      media: {
        book: "The Courage to Be Disliked by Ichiro Kishimi",
        film: "The Little Mermaid",
        song: "Fortress by Claudio Sanchez"
      }
    },
    {
      id: "sa-33",
      number: 33,
      animal: "Whale",
      keyword: "Depth",
      meaning: "There is something beneath the surface asking for your attention. The whale represents emotional depth and intuition. You may be avoiding something that feels too large or too complex. This card invites you to go deeper—not to overwhelm yourself, but to understand more fully. There is meaning in what you feel.",
      image: "/oracle/stitched-animal/33.webp",
      media: {
        book: "The Deep by Rivers Solomon",
        film: "Moby Dick",
        song: "Depth Over Distance by We Are the Fallen"
      }
    },
    {
      id: "sa-34",
      number: 34,
      animal: "Koi",
      keyword: "Flow",
      meaning: "There is resistance where there could be ease. The koi moves with the current, not against it. This card appears when you may be forcing something—an outcome, a timeline, or a decision. Flow does not mean doing nothing; it means aligning with what is already unfolding. Let things move naturally.",
      image: "/oracle/stitched-animal/34.webp",
      media: {
        book: "Flow by Mihaly Csikszentmihalyi",
        film: "Spirited Away",
        song: "Go with the Flow by The Queens of the Stone Age"
      }
    },
    {
      id: "sa-35",
      number: 35,
      animal: "Starling",
      keyword: "Alignment",
      meaning: "Things may begin to feel more synchronized. The starling represents harmony—within yourself or with others. You may find that what once felt forced now feels more natural. This card can also point to connection and community. You are not meant to do everything alone.",
      image: "/oracle/stitched-animal/35.webp",
      media: {
        book: "The Astonishing Power of Emotions by Esther Hicks",
        film: "Murmuration",
        song: "Alignment by The Japanese House"
      }
    },
    {
      id: "sa-36",
      number: 36,
      animal: "Spider",
      keyword: "Weaving",
      meaning: "You are creating something through your actions, whether you realize it or not. The spider represents intention and design—the patterns that form through repeated choices. This card invites you to become aware of what you are building. Your life is being shaped in small, consistent ways.",
      image: "/oracle/stitched-animal/36.webp",
      media: {
        book: "The Subtle Art of Not Giving a F*ck by Mark Manson",
        film: "Charlotte's Web",
        song: "Web of Life by Adrian McNally"
      }
    }
  ]
};
