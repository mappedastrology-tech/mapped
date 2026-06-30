export interface BirdOracleCard {
  id: string;           // e.g. "bird-1"
  number: number;       // 1-72 (matches image filename)
  animal: string;       // the bird name e.g. "Northern Cardinal"
  keyword: string;      // from the keywords line — pick the first/primary keyword
  keywords: string[];   // 3-5 single-word associations drawn from the card's meaning
  meaning: string;      // the UPRIGHT meaning, condensed to 4-6 sentences
  reversed: string;     // the REVERSED meaning, condensed to 4-6 sentences
  suit: string;         // "The Heralds", "The Tricksters", etc.
  image: string;        // path "/oracle/bird/{number}.webp"
  media?: {
    book?: string;
    film?: string;
    song?: string;
  };
}

export interface BirdOracleDeckInfo {
  id: string;
  name: string;
  description: string;
  cardCount: number;
  coverImage: string;
  backImage: string;
  cards: BirdOracleCard[];
}

export const BIRD_ORACLE: BirdOracleDeckInfo = {
  id: "bird",
  name: "The Bird Oracle",
  description: "A 72-card oracle deck in seven suits, each bird carrying wisdom from observation and myth. Features both upright and reversed meanings.",
  cardCount: 72,
  coverImage: "/oracle/bird/1.webp",
  backImage: "/oracle/bird/cardback.webp",
  cards: [
    {
      id: "bird-1",
      number: 1,
      animal: "Northern Cardinal",
      keyword: "arrival",
      keywords: ["arrival", "recognition", "confirmation", "intuition"],
      meaning: "Something you have been quietly expecting is about to confirm itself, and the confirmation will feel like recognition rather than surprise. Trust the small lurch in your chest before you trust the explanation in your head. The cardinal is the card of being right about a thing you have not yet said out loud. Whatever you have been carrying as a private hypothesis is now allowed to become a sentence.",
      reversed: "You are dismissing a signal as coincidence because the meaning is inconvenient. The cardinal has come more than once and you have explained it away more than once. Pattern is information. The grief, the hunch, the suspicion you have been refusing to take seriously is asking for a hearing. You do not have to act on it yet, but you have to stop pretending it is not there.",
      suit: "The Heralds",
      image: "/oracle/bird/1.webp"
    },
    {
      id: "bird-2",
      number: 2,
      animal: "American Robin",
      keyword: "thaw",
      keywords: ["thaw", "beginning", "permission", "transition"],
      meaning: "Something in your life has already turned --- a decision already made internally, a relationship already shifted, a season already ending --- and you are waiting for a more official sign before you act. The sign is here. You do not need everyone else to acknowledge the change before you start moving inside it. The robin is the small, unimpressive proof that you are allowed to begin.",
      reversed: "False thaw. The conditions are not yet what they appear to be, and acting on the apparent shift will cost you. This is the warm February day that fools the buds into opening before the last hard freeze. Wait one more week. What you are about to launch, leave, or announce will land better if you let the actual ground warm up first.",
      suit: "The Heralds",
      image: "/oracle/bird/2.webp"
    },
    {
      id: "bird-3",
      number: 3,
      animal: "Common Raven",
      keyword: "prophecy",
      keywords: ["prophecy", "clarity", "truth", "revelation"],
      meaning: "The raven brings information you did not ask for and now cannot unhear. Receive it without flinching. The card honors a moment of clarity that arrives unsolicited: an overheard sentence, a document you were not supposed to read, a pattern you finally let yourself name. Knowing is not the same as doing. You do not have to act on this yet --- you only have to refuse to pretend you do not know.",
      reversed: "Rumor disguised as revelation. The thing you are calling truth arrived through too many mouths and too little verification. Consider the source and what the source had to gain from telling you. The intelligence of this card is in distinguishing actual information from charged narrative, and right now you are mistaking one for the other.",
      suit: "The Heralds",
      image: "/oracle/bird/3.webp"
    },
    {
      id: "bird-4",
      number: 4,
      animal: "Mourning Dove",
      keyword: "soft news",
      keywords: ["softness", "release", "gentle endings", "exhale"],
      meaning: "Some endings arrive cooing rather than crashing. The dove is the card of a departure that does not need to be a tragedy --- the friendship that fades rather than fractures, the job you leave well, the season that simply concludes. What is leaving your life right now is allowed to leave gently, and you are allowed to feel relief alongside the loss. The exhale is the real ritual.",
      reversed: "Avoidance dressed up as peace. You have decided you are fine about something you are not actually fine about, because the grief is inconvenient and the politeness is easier. The feeling is waiting and will return at odd hours until you sit with it on purpose. Give the small loss its small mourning before it becomes a larger one.",
      suit: "The Heralds",
      image: "/oracle/bird/4.webp"
    },
    {
      id: "bird-5",
      number: 5,
      animal: "Black-capped Chickadee",
      keyword: "small good news",
      keywords: ["curiosity", "investigation", "resilience", "levity"],
      meaning: "Chickadees do not panic; they investigate. The card arrives in the middle of something you have been treating as a crisis and asks you to handle it the way the chickadee handles a stranger at the feeder --- interested, undefended, brief. The situation is not as dangerous as the volume of your worry suggests. You have more information and more capability than the panic is letting you access. The fear was not warranted; the curiosity is.",
      reversed: "You are being too cheerful about something that warrants more weight. The chickadee reversed is forced lightness covering a real concern you have not yet let yourself feel. Not every situation is small. The card asks whether you are using brightness as armor, and gently suggests that the actual feeling, when you let it in, will be more manageable than the work of pretending you do not have it.",
      suit: "The Heralds",
      image: "/oracle/bird/5.webp"
    },
    {
      id: "bird-6",
      number: 6,
      animal: "European Magpie",
      keyword: "omen",
      keywords: ["omen", "fate", "signs", "synchronicity"],
      meaning: "The magpie asks you to notice the line you draw between fate and chance, and whether that line is honestly placed. You have just had a moment that felt meaningful --- a coincidence too coincidental, a recurrence too pointed --- and you are deciding whether to take it seriously. An omen is only useful if you let it change something. Read the sign, then do something differently. Otherwise it was just a bird.",
      reversed: "You are reading meaning into noise because the meaning would be more interesting than the noise. The magpie reversed is the spiral of finding signs everywhere, the apophenia that turns every cardinal and every license plate into personal correspondence from the universe. Some shiny things are just shiny. Some patterns are just statistics. Lower the volume on omen-hunting for a while.",
      suit: "The Heralds",
      image: "/oracle/bird/6.webp"
    },
    {
      id: "bird-7",
      number: 7,
      animal: "Hoopoe",
      keyword: "the unlikely messenger",
      keywords: ["messenger", "unexpected wisdom", "outsider", "insight"],
      meaning: "The hoopoe arrives crowned and absurd, carrying word from a place you have not been. The card describes advice or insight reaching you from a source that should not, by ordinary logic, have anything to teach you --- a person far outside your industry, a tradition far outside your culture, a discipline far outside your training. The strangeness of the messenger is not a reason to discount the message. It is the reason the message could reach you at all.",
      reversed: "You are taking advice from someone too far outside your situation to actually see it. The hoopoe reversed is the cosmopolitan friend confidently telling you what to do about a problem they have never had. The card asks whether the exoticness of the advice is what is making it appealing. Sometimes the boring local counsel is correct and the imported wisdom is just imported.",
      suit: "The Heralds",
      image: "/oracle/bird/8.webp"
    },
    {
      id: "bird-8",
      number: 8,
      animal: "Sandhill Crane",
      keyword: "ancient news",
      keywords: ["ancestry", "inheritance", "pattern", "continuity"],
      meaning: "Whatever you are going through --- the heartbreak, the career pivot, the new parenthood, the grief --- is not new. It is your turn. Stop treating your situation as unprecedented and start looking for the people who have already lived it. Their patterns are your map. There is real consolation in inheritance: in knowing the path is worn because it has been walked. The crane is the card of joining a line that began before you and will continue after.",
      reversed: "You are insisting your situation is unprecedented because being unprecedented relieves you of the obvious advice. Your version of this thing is not too unique for the existing wisdom to apply. The advice you have been resisting because it is generic is generic precisely because it has worked for a lot of people in your shoes. You can be a singular human and still benefit from the advice that got to be common honestly.",
      suit: "The Heralds",
      image: "/oracle/bird/7.webp"
    },
    {
      id: "bird-9",
      number: 9,
      animal: "Belted Kingfisher",
      keyword: "vigilance",
      keywords: ["alarm", "vigilance", "readiness", "warning"],
      meaning: "Something in your life is announcing itself with deliberate volume --- a recurring symptom, a recurring fight, a recurring late-night thought --- and you have been trying to focus on other things. The interruption is the instruction. The card lands when the universe has moved from subtle hint to overt rattling. Pay attention now, while attention is still cheap. Whatever the kingfisher is calling toward is the actual subject of this season.",
      reversed: "You are making more noise than the situation requires. The kingfisher reversed is the overcorrection --- the announcement, the email, the public statement, the dramatic exit --- when a quieter move would have done the work. Volume is not the same as urgency. The card asks whether the rattling is necessary or whether you are performing crisis to compel a response.",
      suit: "The Heralds",
      image: "/oracle/bird/10.webp"
    },
    {
      id: "bird-10",
      number: 10,
      animal: "Black-billed Cuckoo",
      keyword: "the storm-caller",
      keywords: ["storm", "catalyst", "disruption", "transformation"],
      meaning: "You are feeling a change before it arrives --- a tightness in a relationship, a shift at work, an instinct about a body or a project --- and the people around you do not yet feel it. This is not anxiety; this is accurate barometric reading. Prepare for what you are sensing without performing it. Stock the pantry, save the document, have the early conversation. When the storm comes, you will be the one who saw it coming.",
      reversed: "You are forecasting catastrophe out of normal atmospheric pressure. Not every shift in mood, every silence, every awkward exchange is the precursor to disaster. The card asks whether your weather sense has become miscalibrated by past storms, and whether the prediction you are about to act on is reading the present sky or the memory of an old one.",
      suit: "The Heralds",
      image: "/oracle/bird/9.webp"
    },
    {
      id: "bird-11",
      number: 11,
      animal: "American Crow",
      keyword: "cleverness",
      keywords: ["cleverness", "wit", "resourcefulness", "strategy"],
      meaning: "Crows remember faces, and so do you. Your sharpness is in full operation --- you have identified the slight, named the pattern, recognized who is actually who. The question is not whether your read is correct; it almost certainly is. The question is what your read is in service of. Is the intelligence solving a problem, or is it maintaining a grievance? The card honors the perception and asks you to put it to work.",
      reversed: "Cleverness curdled into cynicism. The crow reversed is too smart for its own good --- the running commentary that pre-debunks every offering, the worldliness that has nowhere left to go. You are too sharp to be this stuck. The card asks what would happen if you let one thing in without first running it through the analyst. Some intelligence is meant to be deployed; some is meant to be set down.",
      suit: "The Tricksters",
      image: "/oracle/bird/11.webp"
    },
    {
      id: "bird-12",
      number: 12,
      animal: "Blue Jay",
      keyword: "mimicry",
      keywords: ["mimicry", "adaptation", "performance", "versatility"],
      meaning: "Blue jays imitate hawks to clear the feeder. The card asks you to perform an authority you have not yet fully grown into --- to act the role before the role fits, to use the voice of the person you are becoming rather than the person you have been. The trick works because it works. You will feel like a fraud during the maneuver and will discover, in retrospect, that you were not. You are allowed to be louder than you feel.",
      reversed: "You are mimicking something you do not actually want to become. The jay reversed is the imitation drifting into identity --- the borrowed voice that is no longer borrowed, the act that has eaten the actor. Check the model. The person whose authority you are copying may not be someone whose life you actually want. If you stripped the mimicry, what version of you is underneath?",
      suit: "The Tricksters",
      image: "/oracle/bird/12.webp"
    },
    {
      id: "bird-13",
      number: 13,
      animal: "Loggerhead Shrike",
      keyword: "beautiful violence",
      keywords: ["duality", "hidden nature", "instinct", "precision"],
      meaning: "The shrike sings like a sparrow and hunts like a hawk. Your softness and your edge are not in conflict; they are the same tool used two ways. The card lands when you have been told you cannot be both --- too kind to be effective, too sharp to be likable --- and asks you to stop choosing. The contradiction is the design. Stop apologizing for either half. Use both.",
      reversed: "You are leading with the edge in a situation that needs the song. The shrike reversed is going to the butcher tools before you have tried diplomacy. Most situations do not require impalement. Try the warble first. The teeth are still there if you need them, but you do not need them yet.",
      suit: "The Tricksters",
      image: "/oracle/bird/14.webp"
    },
    {
      id: "bird-14",
      number: 14,
      animal: "Eurasian Jackdaw",
      keyword: "the watcher who collects",
      keywords: ["collection", "observation", "accumulation", "patience"],
      meaning: "You have been accumulating evidence --- about a friendship, a job, a habit, a story you tell yourself --- and the pile is now large enough to draw a conclusion from. Look at what you actually have, not what you wish you had. The case has been quietly built over many months. Stop adding data points to delay the decision. The jackdaw is the card of trusting your own long observation when the moment to act on it arrives.",
      reversed: "You are hoarding grievances. The jackdaw reversed is the collection that has become the problem --- the catalog of every slight, every disappointment, every moment a person let you down, kept in a drawer you visit when you need ammunition. The pile is no longer evidence; it is identity. The card asks what it would mean to let some of the bright objects go.",
      suit: "The Tricksters",
      image: "/oracle/bird/13.webp"
    },
    {
      id: "bird-15",
      number: 15,
      animal: "Greater Roadrunner",
      keyword: "improvisation",
      keywords: ["improvisation", "spontaneity", "adaptability", "play"],
      meaning: "The roadrunner survives by being faster than expected and stranger than necessary. The card lands when the orthodox approach is failing and you have a weird instinct you are second-guessing. Trust it. The unusual move --- the lateral pivot, the unexpected pitch, the answer no one in the meeting saw coming --- is the one suited to your particular terrain. You do not have to do this the way it is normally done.",
      reversed: "You are improvising past the point of usefulness. The roadrunner reversed is the person who has made unconventionality into a brand, who refuses the straightforward solution because the strange one is more on-brand. Sometimes the boring answer is the answer. The card asks whether your weirdness is actually serving the work or whether it has become the work.",
      suit: "The Tricksters",
      image: "/oracle/bird/18.webp"
    },
    {
      id: "bird-16",
      number: 16,
      animal: "Kea",
      keyword: "mischief",
      keywords: ["mischief", "rebellion", "provocation", "trickery"],
      meaning: "The kea takes apart windshield wipers to see how they work. The card arrives when you are about to mess with something on purpose --- a system, a relationship, a routine --- and the cautious part of you is asking if that is wise. The thing you are about to break is not a thing you needed intact. Play is a legitimate research method. You learn things by disassembly that you cannot learn by observation. The point is to find out what the parts do.",
      reversed: "Curiosity used as cover for sabotage. The kea reversed is the dismantling that is not actually exploration --- the relationship you keep poking at to see if it survives, the job you keep testing to see if they will fire you. Be honest about which one you are doing. The card asks whether you are breaking the thing because you want to understand it or because you want it broken.",
      suit: "The Tricksters",
      image: "/oracle/bird/17.webp"
    },
    {
      id: "bird-17",
      number: 17,
      animal: "Brown-headed Cowbird",
      keyword: "the brood parasite",
      keywords: ["parasitism", "exploitation", "displacement", "cunning"],
      meaning: "Someone is asking you to raise their problem as if it were your own --- a project, a feeling, a responsibility --- that they have quietly transferred into your nest while you were busy. The host bird often does not notice until the chick is bigger than its own offspring. The card grants permission to recognize the swap and decline it. You can love the person and still not raise their cowbird. The egg was never supposed to be yours.",
      reversed: "You are the one doing this to someone else. The cowbird reversed asks whether a burden you have placed on a friend, a partner, a sibling, a colleague was actually yours all along. The honest move is to take the egg back. Not dramatically --- quietly. Apologize once and reclaim the work. The relationship will be better for it.",
      suit: "The Tricksters",
      image: "/oracle/bird/15.webp"
    },
    {
      id: "bird-18",
      number: 18,
      animal: "Australian Bowerbird",
      keyword: "curated presentation",
      keywords: ["presentation", "curation", "display", "impression"],
      meaning: "The bowerbird builds a stage and decorates it. The card asks you to take your presentation seriously --- not because the substance is lacking, but because the substance deserves a frame. The way you package the thing is part of the thing. The composition is a real skill. The curation is itself the offering. Make the bower beautiful. The right audience will know what they are seeing.",
      reversed: "All bower, no bird. The bowerbird reversed is the presentation that has outpaced the substance --- the lookbook for a business that does not exist yet, the polished pitch deck for a product no one is building. The card asks you to put energy back into the actual work. The decorations are gorgeous. Now there needs to be something at the center of them.",
      suit: "The Tricksters",
      image: "/oracle/bird/16.webp"
    },
    {
      id: "bird-19",
      number: 19,
      animal: "Common Cuckoo",
      keyword: "deception",
      keywords: ["deception", "illusion", "masks", "concealment"],
      meaning: "Something in your life is announcing itself as one thing and behaving as another --- a friendship that is actually a transaction, a job that is actually an audition for a different role, an apology that is actually a deflection. The card is not asking you to become cynical. It is asking you to become literate. Read what the thing is doing, not what it is saying. The performance and the function are separate.",
      reversed: "You are being the cuckoo. There is a place where you are presenting yourself as one thing and operating as another --- accepting care you are not reciprocating, taking credit for work you did not do, holding a position you do not actually want. The card asks for a quiet realignment before someone else makes you align publicly. The fix is not dramatic; it is just honest.",
      suit: "The Tricksters",
      image: "/oracle/bird/21.webp"
    },
    {
      id: "bird-20",
      number: 20,
      animal: "Lyrebird",
      keyword: "perfect mimicry",
      keywords: ["mimicry", "identity", "imitation", "erasure"],
      meaning: "The lyrebird can imitate a chainsaw it has never met. You are very good at sounding like the room you are in --- at code-switching, at matching the tone of the meeting, the friend group, the platform. The skill is real and the card honors it. It also asks: when was the last time you used your own voice, on a topic no one had pre-defined for you? Find the source song. The mimicry is a tool; the original is the thing.",
      reversed: "You have mistaken the impression for the original. The lyrebird reversed is the moment of realizing the voice in your head --- the one you assumed was yours --- is actually composed entirely of older voices: a parent, a teacher, a person you used to date. The card asks you to notice which thoughts are recordings and which are live. Find the live one. Start there.",
      suit: "The Tricksters",
      image: "/oracle/bird/20.webp"
    },
    {
      id: "bird-21",
      number: 21,
      animal: "Red-tailed Hawk",
      keyword: "the wide view",
      keywords: ["perspective", "vision", "sovereignty", "overview"],
      meaning: "The hawk does not chase; it surveys, then commits. You have been working too close to the problem --- caught in the granular detail, exchanging emails, relitigating the conversation --- and the actual move is several feet of altitude away. Climb. The pattern is only visible from up there. Stop trying to solve from inside the tangle and step back until you can see the whole shape of it. The hawk waits and is correctly calibrated.",
      reversed: "Detachment masquerading as perspective. The hawk reversed is the person who has gone so high they have ceased to be in the situation --- observing themselves observing, performing the wide view as a way of not being inside any actual relationship. The card asks you to come back down. Some problems can only be solved at ground level. The bird's-eye is a tool, not a permanent address.",
      suit: "The Sentinels",
      image: "/oracle/bird/23.webp"
    },
    {
      id: "bird-22",
      number: 22,
      animal: "Bald Eagle",
      keyword: "claimed authority",
      keywords: ["authority", "dominance", "territory", "command"],
      meaning: "The eagle is not modest. The card asks whether your reluctance to claim your authority is genuine humility or sophisticated stalling. The role is yours; you have done the work; the discomfort is part of taking it. You will not feel ready. You will feel like an impostor for the first six months and then notice, in retrospect, that you stopped feeling that way. The card is the permission to take the seat now and grow into it from there.",
      reversed: "Authority performed without the work to back it. The eagle reversed is the person occupying a position they have not earned and bristling when anyone notices. The crown is borrowed and beginning to slip. The card requires you to do the work the position was supposed to represent. The discrepancy between title and substance is not invisible to the people around you.",
      suit: "The Sentinels",
      image: "/oracle/bird/22.webp"
    },
    {
      id: "bird-23",
      number: 23,
      animal: "Great Horned Owl",
      keyword: "the silent hunter",
      keywords: ["silence", "stealth", "precision", "focus"],
      meaning: "The great horned owl hunts the things other predators are afraid of. There is a difficult conversation, an unpleasant decision, an unsexy task in front of you, and you are looking around hoping someone else will pick it up. They will not. You are the one equipped for this. The owl is not eager, not enjoying this --- just the animal in this ecosystem that can actually take down the thing that needs taking down. Do the work quietly.",
      reversed: "You are picking fights to feel powerful. The owl reversed is the predator searching for prey rather than responding to need. The card asks whether the thing in front of you is a problem that requires your particular skill, or whether you are pattern-matching to your own competence. The owl hunts what it needs. It does not pose.",
      suit: "The Sentinels",
      image: "/oracle/bird/24.webp"
    },
    {
      id: "bird-24",
      number: 24,
      animal: "Peregrine Falcon",
      keyword: "decisive speed",
      keywords: ["speed", "decisiveness", "timing", "pursuit"],
      meaning: "The peregrine stoops at 240 miles per hour. There is no version of this where you ease into it. You have been negotiating with yourself about how much of yourself to commit --- to a job, a move, a relationship, a project --- and the answer is that you cannot do this halfway. When you go, go fully. The hesitation is what will hurt you, not the speed. Commit at the top of the dive and trust the body to do what it has been built to do.",
      reversed: "Speed without aim. The peregrine reversed is velocity that has become a substitute for direction --- the constant motion, the perpetual launch, the speed that prevents anyone from asking what the target is. The card asks you to stop diving for a minute. Land. Sit. Identify the prey before the next stoop. Going fast in the wrong direction is still going fast in the wrong direction.",
      suit: "The Sentinels",
      image: "/oracle/bird/25.webp"
    },
    {
      id: "bird-25",
      number: 25,
      animal: "Osprey",
      keyword: "the specialist",
      keywords: ["specialization", "mastery", "narrow focus", "expertise"],
      meaning: "The osprey eats almost nothing but fish, and it is extraordinary at catching them. The card affirms your narrowness. You do not need to be good at everything; you need to be undeniable at the one thing. The cultural pressure to be a generalist, to have side hustles in every direction --- the card calls that pressure off. Specialize. Get so good at the specific thing that the request comes to you.",
      reversed: "You are being asked to specialize before you have explored --- or you have specialized so long you have forgotten why. The osprey reversed is the narrowness that has become a cage rather than a discipline. The card asks: do you still love the fish, or have you just gotten so good at catching them that you cannot imagine any other diet? Permission to widen, briefly, and remember what you chose.",
      suit: "The Sentinels",
      image: "/oracle/bird/29.webp"
    },
    {
      id: "bird-26",
      number: 26,
      animal: "Northern Goshawk",
      keyword: "ferocious privacy",
      keywords: ["privacy", "ferocity", "boundaries", "solitude"],
      meaning: "Goshawks attack anything near the nest, including people they have known for years. The card affirms a boundary that is not negotiable. You have been softening a no that does not deserve softening, explaining a limit that does not require explanation. Some lines are not invitations to dialogue. The card supports the firmness you have been calling rude and reframes it as accurate. Defended territory is not aggression.",
      reversed: "You are defending a territory that is no longer yours to defend. The goshawk reversed is the parent still patrolling a child who has moved out, the partner still policing a relationship that has ended, the gatekeeper of a community that has changed. The card asks whether the nest is still occupied. Sometimes the right move is to stop guarding what is no longer there and turn around.",
      suit: "The Sentinels",
      image: "/oracle/bird/28.webp"
    },
    {
      id: "bird-27",
      number: 27,
      animal: "Secretary Bird",
      keyword: "swift justice",
      keywords: ["courage", "confrontation", "protection", "boldness"],
      meaning: "The secretary bird kills snakes by stepping on them --- deliberately, repeatedly, until the threat is gone. Stop avoiding the problem and start working it on a schedule. Not in a flourish, not in a single dramatic confrontation, but in a routine. Every day. Until it is finished. The card lands when the snake has been allowed to stay too long because dealing with it required a method that did not feel heroic. The secretary bird is not heroic; the secretary bird is correct.",
      reversed: "You are stomping something that was not actually a snake. The secretary bird reversed is methodical violence applied to a non-threat --- the perceived enemy who is just a neighbor, the perceived betrayal that was a misunderstanding. Identify the threat clearly before you commit to the slow work of eliminating it. Some things look like snakes and are sticks. Lift your foot.",
      suit: "The Sentinels",
      image: "/oracle/bird/27.webp"
    },
    {
      id: "bird-28",
      number: 28,
      animal: "Harpy Eagle",
      keyword: "rare power",
      keywords: ["power", "rarity", "majesty", "awe"],
      meaning: "Harpies live deep in the canopy and are almost never seen. The card honors a strength of yours that does not advertise itself --- a competence, a discipline, a knowledge --- that you have not made public because you have not needed to. You do not need to perform the power for it to be real. The people around you do not know what you can do, and that is fine. When the moment requires it, you will act.",
      reversed: "Power kept so private it has gone unused. The harpy reversed is the capacity that has atrophied through perfectionism, through fear of being judged, through waiting for a moment more deserving than the current one. The card asks you to take it out of the canopy. Use it now. Use it imperfectly. The talons need the work.",
      suit: "The Sentinels",
      image: "/oracle/bird/26.webp"
    },
    {
      id: "bird-29",
      number: 29,
      animal: "Barn Owl",
      keyword: "quiet witness",
      keywords: ["intuition", "darkness", "listening", "mystery"],
      meaning: "The barn owl hunts in total darkness by ear alone. You are picking up information no one else in the room is registering --- the tone underneath the polite words, the absence in someone's eyes, the silence in a thread that used to be loud. Trust the data even when you cannot point to its source. The card does not require you to prove the signal to anyone else. It requires you to take your own perception seriously.",
      reversed: "Picking up noise and calling it data. The barn owl reversed is the hyper-vigilant nervous system that has begun to triangulate threats out of ordinary motion --- every short reply a slight, every silence a verdict. The card asks whether your hearing has become miscalibrated. Some of what you are picking up is real; some is the echo of older predators. Not every rustle is a mouse.",
      suit: "The Sentinels",
      image: "/oracle/bird/19.webp"
    },
    {
      id: "bird-30",
      number: 30,
      animal: "Andean Condor",
      keyword: "stillness as strategy",
      keywords: ["stillness", "patience", "waiting", "ambush"],
      meaning: "The condor barely flaps; it uses what is already moving. The card asks whether you are trying to power through a situation that has a thermal you could be riding instead. There is a current in your life right now --- a friend with an opening, a season of cultural momentum, a wave you could catch --- and you are flapping past it because flapping is what you know. Stop. Find the current. Doing less is not the same as doing wrong.",
      reversed: "Coasting on momentum that is no longer there. The condor reversed is the bird gliding down because the thermal has died and the bird has not noticed. The card asks whether you are still being carried or just falling slowly. Sometimes you have to start flapping again. The previous current was real; it has expired. The work in front of you now requires more active effort.",
      suit: "The Sentinels",
      image: "/oracle/bird/30.webp"
    },
    {
      id: "bird-31",
      number: 31,
      animal: "Northern Mockingbird",
      keyword: "borrowed voices",
      keywords: ["voices", "channeling", "multiplicity", "absorption"],
      meaning: "The mockingbird does not invent songs; it arranges them. Your voice is allowed to be a curation of everyone who taught you. Stop apologizing for the lineage and start owning the arrangement. Originality in your line of work is not invention from nothing; it is sequence, emphasis, the willingness to repeat one influence three times and another only once. The card affirms the composite self. You do not have to be the source for the song to be yours.",
      reversed: "Your voice is so composed of other voices that yours has gone missing. The mockingbird reversed is the medley that has lost its center --- too many influences, too rapidly cited, no through-line. Stop adding new sources. Listen to what is left when the borrowing pauses. There is a pitch under all that arrangement that is yours, and you have not heard it in a while.",
      suit: "The Songweavers",
      image: "/oracle/bird/31.webp"
    },
    {
      id: "bird-32",
      number: 32,
      animal: "Wood Thrush",
      keyword: "the duet with yourself",
      keywords: ["partnership", "harmony", "duet", "cooperation"],
      meaning: "The wood thrush sings two notes at once because it has two voice boxes. The card affirms a contradiction inside you that is not actually a contradiction --- it is harmony. The two parts of yourself that you have been trying to reconcile are meant to coexist. Stop forcing yourself into a single resolved note. Sing both. The result is more beautiful than either part alone, and the audience that is for you will recognize the duet immediately.",
      reversed: "The two voices are fighting instead of harmonizing. The wood thrush reversed is internal dissonance --- the two halves of you locked in argument rather than chord. The card asks you to sit down with both of them rather than picking a winner. The fight is not the disagreement; the fight is the refusal to let both be true. Neither part of you is going to surrender. Find the chord.",
      suit: "The Songweavers",
      image: "/oracle/bird/32.webp"
    },
    {
      id: "bird-33",
      number: 33,
      animal: "Common Nightingale",
      keyword: "singing in the dark",
      keywords: ["persistence", "darkness", "faith", "endurance"],
      meaning: "The nightingale sings at night, when most birds are silent and most listeners are asleep. The card asks whether you are doing the work because of who is watching or because of who you are. If the audience disappeared tomorrow --- the followers, the metrics, the readers --- would you still make the thing? The card lands when you are at risk of letting external validation shape the song. Sing anyway. The dark is just the time you happen to sing.",
      reversed: "Performing solitude. The nightingale reversed is the artist who wants to be the unsung hero and also to be sung about for it --- the public privacy, the curated obscurity. Either you are making the work for its own sake or you are making it for the audience; the in-between is exhausting and a little dishonest. Pick. Both are legitimate. The hybrid is what is wearing you down.",
      suit: "The Songweavers",
      image: "/oracle/bird/33.webp"
    },
    {
      id: "bird-34",
      number: 34,
      animal: "Carolina Wren",
      keyword: "outsized",
      keywords: ["volume", "presence", "confidence", "assertion"],
      meaning: "The Carolina wren is tiny and impossibly loud. The card affirms that the size of your platform does not have to match the size of your statement. Say the thing. You do not need a bigger audience, a larger title, more credentials, or a better moment. The wren makes the sound it makes from wherever it is standing, and the sound carries. You are already a substantial person. Open the beak.",
      reversed: "Volume without substance. The wren reversed is the loud opinion delivered before the thinking is done --- the hot take, the announcement, the public declaration of a position you have not actually worked out yet. The card asks you to bring the decibels back down for a beat and develop the thought. The wren earns its volume by having something specific to say. Earn yours.",
      suit: "The Songweavers",
      image: "/oracle/bird/36.webp"
    },
    {
      id: "bird-35",
      number: 35,
      animal: "Hermit Thrush",
      keyword: "the flute in the forest",
      keywords: ["beauty", "solitude", "mystery", "depth"],
      meaning: "The hermit thrush sings something that sounds composed. The card asks you to refuse the obvious melody and reach for the strange one --- the line that is harder to write, the angle that is harder to find, the version of the thing that does not immediately read as commercial. The card lands when you have been about to settle for the workable version and asks whether you have time for the better one. Usually you do. The hermit thrush makes people stop walking.",
      reversed: "Aestheticizing privacy. The hermit thrush reversed is the artist who has made the seclusion itself the brand --- the elaborately reclusive identity that requires constant maintenance. The hermit thrush is not hiding; it just lives there. The card asks whether your privacy is a real condition or a curated one. Real hermits do not have to mention that they are hermits.",
      suit: "The Songweavers",
      image: "/oracle/bird/37.webp"
    },
    {
      id: "bird-36",
      number: 36,
      animal: "Common Loon",
      keyword: "the haunted call",
      keywords: ["haunting", "memory", "loss", "echo"],
      meaning: "The loon's cry is the sound of something true that words cannot reach. The card grants permission to feel a thing without explaining it --- to grieve, to long, to register a sadness that does not have a clear referent. The feeling does not require a justification to be valid. The card lands when you have been pressuring yourself to articulate what is going on. Cry. Sit by the water. Refuse to make it tidy. Some interior weather is simply weather.",
      reversed: "You are performing the grief. The loon reversed is the public mourning that has begun to organize itself for the audience --- the long, beautifully written posts about the difficult time. The loon does not perform; the loon calls into the lake because the lake is there. Find a real lake to call into, in private, and let the real feeling occur where no one is watching.",
      suit: "The Songweavers",
      image: "/oracle/bird/34.webp"
    },
    {
      id: "bird-37",
      number: 37,
      animal: "Eurasian Skylark",
      keyword: "vertical song",
      keywords: ["ascent", "effort", "climb", "devotion"],
      meaning: "The skylark climbs while it sings, sometimes for an hour, until it disappears into the sky. The card honors work that is also joy and asks you not to let anyone separate them. The cultural framing that real labor must be miserable, and that anything pleasurable cannot also be serious, is a misread. The song is the effort and the effort is the song. The card lands when you have been letting someone else define what counts as work and asks you to reclaim the version that lifts you while you do it.",
      reversed: "You have made the climb so effortful that the song has stopped. The skylark reversed is the work that started joyful and became grind --- the practice that lost its play, the project that lost its pulse. The card does not ask you to quit. It asks you to come back down for a minute. Land in the grass. Remember why you started ascending. Find the note before the next climb.",
      suit: "The Songweavers",
      image: "/oracle/bird/35.webp"
    },
    {
      id: "bird-38",
      number: 38,
      animal: "Indian Peafowl",
      keyword: "the unembarrassed display",
      keywords: ["display", "pride", "vulnerability", "honesty"],
      meaning: "The peacock does not whisper. The card asks whether your reluctance to be seen is modesty or fear of judgment. The display is a form of communication --- the bird saying, here is what I have. The card lands when you have something to show --- a body of work, a stage in your life, a new aesthetic --- and have been hesitating. Open the train. The people who matter will read it correctly. The people who call it vanity were never the audience.",
      reversed: "Display without content. The peacock reversed is the tail unfurled with nothing behind it --- the personal brand without the body of work, the visual identity without the substance, the costume without the bird. The card asks you to put down the train for a season and develop the thing it is supposed to display. The feathers will grow back. The problem is that they have started arriving before the bird.",
      suit: "The Songweavers",
      image: "/oracle/bird/39.webp"
    },
    {
      id: "bird-39",
      number: 39,
      animal: "Bell Miner",
      keyword: "the chorus",
      keywords: ["community", "chorus", "belonging", "unity"],
      meaning: "Bell miners call together; the forest rings. The card asks you to add your voice to a chorus rather than perform a solo. Some moments are not about your individual brilliance; they are about contributing a single steady note to a sound much larger than you. The card lands when you have been treating a collective effort as a place to differentiate yourself, and asks you to do the harder thing --- to disappear, briefly, into a sound that needs your pitch but does not need your name.",
      reversed: "Lost in the group. The bell miner reversed is the voice that has fully blended in and forgotten its own pitch. The card asks you to step out of the formation long enough to hear yourself alone. You may rejoin the chorus afterward. But know which note is yours. The chorus is the sum of distinct birds; it stops working when they all become the same one.",
      suit: "The Songweavers",
      image: "/oracle/bird/38.webp"
    },
    {
      id: "bird-40",
      number: 40,
      animal: "Black-capped Vireo",
      keyword: "the rare song",
      keywords: ["rarity", "uniqueness", "treasure", "fleeting"],
      meaning: "The card honors a way of speaking --- yours, or someone in your life --- that is becoming uncommon. Protect it. Repetition is the only thing standing between this voice and silence. The card lands when something specific to your region, your family, your tradition is at risk of fading not because it has been defeated but because no one has bothered to carry it forward. The black-capped vireo nearly disappeared and came back through deliberate, unglamorous, repeated work.",
      reversed: "Mourning a voice that is still alive. The black-capped vireo reversed is the premature eulogy --- the lament for a tradition or a relationship or a self that you have decided is already gone, when it actually is not. Stop performing the loss and use what is still here. Eulogies for the living are exhausting for everyone, including the supposedly deceased.",
      suit: "The Songweavers",
      image: "/oracle/bird/41.webp"
    },
    {
      id: "bird-41",
      number: 41,
      animal: "Arctic Tern",
      keyword: "the long migration",
      keywords: ["migration", "endurance", "journey", "faith"],
      meaning: "The arctic tern flies from one end of the earth to the other every year. The card affirms a long arc you are in the middle of. You are not lost; you are en route. The distance is the design. The card lands when you have been comparing yourself to people whose lives appear more stationary and feeling like you are doing it wrong. Some species are wayfarers by design. The destination is not a place; it is the perpetual motion between two summers.",
      reversed: "Movement for its own sake. The tern reversed is migration as escape --- you are not en route to anywhere, you are simply unwilling to land. The card asks you to check the difference between traveling and fleeing. Both produce the same flight patterns; only one knows where it is going. Pick a continent for a season. The card asks you to actually arrive somewhere occasionally.",
      suit: "The Wayfarers",
      image: "/oracle/bird/40.webp"
    },
    {
      id: "bird-42",
      number: 42,
      animal: "Bar-tailed Godwit",
      keyword: "the unbroken crossing",
      keywords: ["crossing", "determination", "stamina", "risk"],
      meaning: "The godwit flies for nine to eleven days without stopping. The card describes a stretch of your life you cannot rest in the middle of. You knew that at takeoff. Conserve. Do not waste energy on debate or second-guessing; you committed already, and the only way through is forward. Your body has stored what it needs. Trust the preparation. The crossing requires the crossing; there is no shortcut over open ocean.",
      reversed: "You have stopped to rest in a place that is not actually safe. The godwit reversed is the bird that has tried to land on the open Pacific and is exhausted and waterlogged. The crossing requires the crossing. You have to get up and fly again. Stopping in the middle is not an option, and pretending you are at a destination when you are not is what will harm you most.",
      suit: "The Wayfarers",
      image: "/oracle/bird/45.webp"
    },
    {
      id: "bird-43",
      number: 43,
      animal: "Ruby-throated Hummingbird",
      keyword: "the crossing",
      keywords: ["impossible", "courage", "miracle", "perseverance"],
      meaning: "The hummingbird crosses 500 miles of open water on stored fat. The card asks whether you have prepared enough before the attempt. The flight is doable; you have seen people smaller than you make it across. The part you can control is the preparation, not the crossing. Eat first. Save first. Build reserves first. The card lands when you are about to launch something with insufficient fuel and asks you to delay one more season to fatten up.",
      reversed: "You are trying the crossing on an empty tank. The hummingbird reversed is the launch made on insufficient preparation --- the business started without capital, the move made without savings, the relationship entered without resolution of the last one. There is no shame in delay. There is significant cost in the dramatic mid-crossing collapse you are setting yourself up for. Land. Eat. Try again next season.",
      suit: "The Wayfarers",
      image: "/oracle/bird/44.webp"
    },
    {
      id: "bird-44",
      number: 44,
      animal: "Snow Goose",
      keyword: "collective movement",
      keywords: ["formation", "cooperation", "rhythm", "trust"],
      meaning: "Geese fly in V's because each bird drafts on the next. The card asks you to accept the help --- and to take your turn at the front. The formation only works if everyone rotates. Right now you may be in the slipstream, benefiting from someone else's effort, and that is fine for a leg of the journey. But the card lands when it is your turn to lead. Move up. The headwind is real; so is the rest you will get when you drop back again.",
      reversed: "Coasting at the back of the V indefinitely. The snow goose reversed is the person who has been drafting so long they have started to believe the slipstream is the default. Eventually you have to lead. The card asks whether you have been avoiding the lead position because you cannot do it, or because you have not yet had to. You can. It is your turn.",
      suit: "The Wayfarers",
      image: "/oracle/bird/43.webp"
    },
    {
      id: "bird-45",
      number: 45,
      animal: "European Stork",
      keyword: "the return route",
      keywords: ["return", "memory", "homecoming", "instinct"],
      meaning: "Storks return to the same nest, sometimes for decades. The card describes a homecoming --- a return to a person, a place, a practice, a self --- that is not a regression but a re-arrival. Going back to a place you have been is not a failure to progress. Some structures are worth refurbishing rather than rebuilding from scratch. The card lands when you have been told that growth requires constant forward motion, and reframes: some growth is vertical, in a single nest, across years.",
      reversed: "Returning out of nostalgia to a nest that is no longer structurally sound. The stork reversed is the impulse to go back to the place that worked once, refusing to notice that the tree has rotted, the roof is gone, the village has moved. Check the nest before you settle in. Some returns are accurate; some are denial. Look honestly at what is still there before you commit another season.",
      suit: "The Wayfarers",
      image: "/oracle/bird/42.webp"
    },
    {
      id: "bird-46",
      number: 46,
      animal: "Albatross",
      keyword: "the open ocean",
      keywords: ["vastness", "freedom", "solitude", "exploration"],
      meaning: "Albatrosses sleep on the wing. The card describes a period of life where you are sustained without arriving anywhere --- a long stretch of solitude, of work without obvious milestones. The lack of landfall is not a problem; it is the design of this phase. The card lands when you have been feeling like nothing is happening --- and gently corrects: a great deal is happening, and the form of it is movement across distance you cannot easily measure. Trust the glide.",
      reversed: "You are looking for shore where there is none. The albatross reversed is the bird trying to land on water that will not hold it, demanding a destination from a phase of life that is structurally about being in motion. Make peace with the ocean for a while longer. The land is real. It is not yet. Conserve. Glide. Stop scanning the horizon for the island that is not coming this season.",
      suit: "The Wayfarers",
      image: "/oracle/bird/46.webp"
    },
    {
      id: "bird-47",
      number: 47,
      animal: "Whooping Crane",
      keyword: "the recovered migration",
      keywords: ["recovery", "restoration", "comeback", "renewal"],
      meaning: "Whooping cranes had to be re-taught their migration route by humans flying ultralights. Some knowledge needs to be deliberately transmitted; it does not survive on its own. The card lands when you are sitting on something --- a skill, a piece of family history, a craft --- that you have been assuming the next generation will pick up by osmosis. They will not. Write it. Teach it. Lead the flight. The route only survives because someone deliberately maintains it.",
      reversed: "You are waiting for inheritance that no one is going to hand you. The whooping crane reversed is the assumption that the elders, the institution, the family will eventually teach you what you need to know, when in fact the chain has been broken. Go learn it yourself. Find the elders who are still alive. Find the archives. Reconstruct the route.",
      suit: "The Wayfarers",
      image: "/oracle/bird/47.webp"
    },
    {
      id: "bird-48",
      number: 48,
      animal: "Common Swift",
      keyword: "life on the wing",
      keywords: ["flight", "freedom", "lightness", "motion"],
      meaning: "Swifts spend nearly their whole lives in flight. The card is for a period when rest looks different from what you were taught. You are not exhausted; you are airborne. The rules you absorbed about how recovery is supposed to feel may not apply to this phase of your life. Some seasons are recovered from in motion, in micro-naps, in moments rather than retreats. Stop measuring your rest against the wrong model. You are getting what you need; it just does not look like it does for the people on the ground.",
      reversed: "You have confused inability to stop with virtue. The swift reversed is the bird that has not chosen the airborne life --- it has simply forgotten how to land. The card asks whether you are choosing the perpetual motion or whether you are afraid of what stillness will bring up. Some birds do land. You are allowed to be one of those birds, even if you have been the swift for a while.",
      suit: "The Wayfarers",
      image: "/oracle/bird/48.webp"
    },
    {
      id: "bird-49",
      number: 49,
      animal: "Bohemian Waxwing",
      keyword: "irruption",
      keywords: ["eruption", "unpredictability", "surge", "wildness"],
      meaning: "Waxwings irrupt --- they appear far from their usual range when food is scarce up north. The card welcomes a move you are making that no one expected, including possibly yourself. The pattern is not breaking; it is finding new ground because the old ground stopped providing. The card validates the move. The flock is not lost; it is responding accurately to conditions. The new tree is a real tree.",
      reversed: "You are moving on impulse. The waxwing reversed is irruption as panic rather than response --- the sudden departure that is not actually about a failed berry crop but about an unwillingness to deal with whatever was happening at home. Check whether you are arriving or fleeing. Both produce the same flight pattern; only one ends well. Sit with the question for one more day before you leave.",
      suit: "The Wayfarers",
      image: "/oracle/bird/49.webp"
    },
    {
      id: "bird-50",
      number: 50,
      animal: "Demoiselle Crane",
      keyword: "the impossible route",
      keywords: ["altitude", "transcendence", "extremity", "triumph"],
      meaning: "Demoiselle cranes cross the Himalayas at 26,000 feet. The card affirms you have chosen the hardest version of the journey. It does not call this brave or admirable; it calls it accurate. You knew what you were choosing when you chose it. The card lands when you are in the middle of the difficult crossing and starting to second-guess whether you should have taken the easier route. You should not have. The thin air is the point. Conserve your breath. Make the pass.",
      reversed: "You are taking the hard route because the easy one feels suspicious. The demoiselle reversed is the conviction that anything pleasant must be a trick --- that real growth has to hurt, that real love has to be complicated, that real work has to deplete you. The card asks whether you are crossing the Himalayas because the route called for it or because you cannot trust a path without altitude sickness. Sometimes easy is just easy.",
      suit: "The Wayfarers",
      image: "/oracle/bird/53.webp"
    },
    {
      id: "bird-51",
      number: 51,
      animal: "Painted Bunting",
      keyword: "improbable beauty",
      keywords: ["beauty", "improbability", "wonder", "grace"],
      meaning: "The painted bunting looks like it was assembled by a committee that could not agree on a palette. You have been thinking of yourself as ordinary, forgetting that the version of you that exists in the world is, viewed from outside, deeply unusual. The improbability is the point. You do not have to make sense as a combination; the colors do not have to coordinate. Being a lot of things at once is the design. Someone is going to see you and have to stop walking.",
      reversed: "Beauty leveraged for approval. The painted bunting reversed is the bird that has begun to perform its own colors --- to manage them, to deploy them, to use them in trade. The bunting simply is the colors it is. When the beauty becomes a transaction, something true gets lost. Return to non-instrumental existence for a while. Be beautiful without being for sale.",
      suit: "The Bright Ones",
      image: "/oracle/bird/52.webp"
    },
    {
      id: "bird-52",
      number: 52,
      animal: "Blue Grosbeak",
      keyword: "deep color",
      keywords: ["depth", "richness", "saturation", "intensity"],
      meaning: "The blue grosbeak takes years to come into full color. The card is for someone who has been waiting to look like themselves. Patience with your own development is not the same as stalling. The molt has its own timeline. The version of you currently showing --- with brown patches not yet replaced --- is not a failure of becoming; it is the becoming. You have been comparing your unfinished self to other people's finished selves. Their birds got there; yours is on the way.",
      reversed: "Wearing the color before the season. The blue grosbeak reversed is the yearling claiming the full adult plumage it does not yet have --- the title, the expertise, the developed taste --- and being caught out by the brown patches still showing through. Let the molt happen on its actual schedule. The blue will come in. Putting on the costume of finished does not accelerate finishing.",
      suit: "The Bright Ones",
      image: "/oracle/bird/51.webp"
    },
    {
      id: "bird-53",
      number: 53,
      animal: "Scarlet Tanager",
      keyword: "the brief brilliance",
      keywords: ["brevity", "brilliance", "transience", "impact"],
      meaning: "Scarlet tanagers are red for only part of the year. The card honors a window of high visibility in your life --- a launch, a phase, a moment of attention --- and asks you to use it well. The red molts back. The opportunity to be brilliantly visible does not last forever. Do the work while you are red. Take the meetings, make the bid, publish the thing, be heard. The olive-green months will return; you can rest then.",
      reversed: "You are hiding in the canopy during your own season. The scarlet tanager reversed is the bird in its red plumage that has not come out where it can be seen --- the launch you postponed during the only quarter it would have landed. Come down to where the light hits. The molt is coming. Do not let the red months pass entirely in shadow.",
      suit: "The Bright Ones",
      image: "/oracle/bird/50.webp"
    },
    {
      id: "bird-54",
      number: 54,
      animal: "Western Tanager",
      keyword: "borrowed fire",
      keywords: ["borrowed", "reflected", "secondhand", "radiance"],
      meaning: "The western tanager's orange head comes from the insects it eats. The card asks what you have been consuming. Your color is downstream of your diet --- the media you take in, the conversations you keep, the books you read, the platforms you scroll, the people you spend the most hours near. The card lands when your fire feels dim and asks you to audit the inputs. The orange is not produced internally; it is collected. Adjust the source.",
      reversed: "Your fire is fading because the diet has degraded. The western tanager reversed is the bird that has noticed the color going gray and assumed it is aging, when in fact it is just hungry. Look at what you have been taking in lately --- the doomscroll, the gossip, the cynic friends, the content slop. The fix is not metaphysical; it is dietary. Find the brightly pigmented foods and eat them.",
      suit: "The Bright Ones",
      image: "/oracle/bird/54.webp"
    },
    {
      id: "bird-55",
      number: 55,
      animal: "Vermilion Flycatcher",
      keyword: "undeniable",
      keywords: ["visibility", "boldness", "declaration", "vitality"],
      meaning: "The vermilion flycatcher on a fencepost stops conversations. The card describes a moment when your presence is itself the message. You do not have to explain why you are here, what you do, how you should be understood. Being here is enough. The card lands when you have been rehearsing your own justification and asks you to drop it. Walk in. Sit on the fence post. The room will register what you are without you needing to narrate it.",
      reversed: "Insisting on being noticed in a setting that does not warrant it. The vermilion reversed is the bird that has chosen the wrong fencepost --- the room where the red is misread as showboating. The card asks you to read the setting. Not every event is your event. Save the flame for the fencepost where the flame belongs.",
      suit: "The Bright Ones",
      image: "/oracle/bird/55.webp"
    },
    {
      id: "bird-56",
      number: 56,
      animal: "Resplendent Quetzal",
      keyword: "sacred beauty",
      keywords: ["sacred", "devotion", "reverence", "splendor"],
      meaning: "Quetzals die in captivity. The card protects a part of you that cannot be domesticated for someone else's collection. The trailing feathers are not a flaw to be trimmed; they are the reason you exist. The card lands when someone is asking you to be smaller, more practical, more contained, and tells you gently and clearly: no. Some birds belong to the canopy. Captivity is not the price of being seen. The quetzal is sacred precisely because it does not negotiate.",
      reversed: "You have allowed yourself to be displayed in a cage. The quetzal reversed is the bird that has chosen the gilded enclosure --- the impressive job that has slowly clipped the tail, the relationship that insists on the smaller version of you. The card asks why. Often the cage door is only latched. The bird may still leave. The card is the moment of noticing the latch.",
      suit: "The Bright Ones",
      image: "/oracle/bird/57.webp"
    },
    {
      id: "bird-57",
      number: 57,
      animal: "Lilac-breasted Roller",
      keyword: "every color at once",
      keywords: ["abundance", "spectrum", "wholeness", "excess"],
      meaning: "The lilac-breasted roller does not commit to a palette. The card is for someone being told they are too much of too many things --- too varied in interests, too divided in pursuits, too maximalist in style --- and asked to choose one direction. The card refuses the framing. The variety is not a failure of focus; it is the bird. Your job is not to reduce yourself to a recognizable swatch. It is to wear all of the colors confidently enough that the observer accepts the inventory.",
      reversed: "Color hoarding. The roller reversed is maximalism that has become noise --- too many projects, too many aesthetics, too many side identities, none developed enough to be legible. The card asks you to edit. Not down to one, just down to a coherent few. The bird's colors look chaotic at first glance but are precisely arranged. Yours could be too. Take a season and figure out which colors actually go where.",
      suit: "The Bright Ones",
      image: "/oracle/bird/56.webp"
    },
    {
      id: "bird-58",
      number: 58,
      animal: "Mandarin Duck",
      keyword: "ornamental beauty",
      keywords: ["ornament", "cultivation", "artifice", "elegance"],
      meaning: "The mandarin duck looks like it is going somewhere. The card affirms the choice to present yourself with intention even when no occasion demands it --- to dress for the Tuesday, to keep the house in a state that does not require advance warning. Beauty is a form of attention to your own life. The card lands when you have been letting your presentation slide on the grounds that no one will see, and reframes: you will see. Being well-arranged is not for the audience; it is for the day.",
      reversed: "Costume as substitute for presence. The mandarin duck reversed is the elaborate outfit covering an interior that has gone unattended. The card asks whether the styling has become a way of avoiding the more difficult question of how you actually are. The arrangement is gorgeous and the bird has not arrived behind it. Some days are not about the costume; some days are about being present in a t-shirt.",
      suit: "The Bright Ones",
      image: "/oracle/bird/59.webp"
    },
    {
      id: "bird-59",
      number: 59,
      animal: "Greater Flamingo",
      keyword: "pink from the work",
      keywords: ["labor", "transformation", "diet", "becoming"],
      meaning: "Flamingos are pink because of what they eat. The card affirms that the visible result is downstream of an invisible discipline. People are seeing the pink --- your apparent ease, your obvious health, your finished work --- and they are not seeing the years of effort. That is fine. You do not owe them the documentation. The card lands when you have been frustrated that no one acknowledges the work behind the result. The pink is its own receipt. Keep eating the shrimp.",
      reversed: "Pink without the diet. The flamingo reversed is the manufactured appearance of a practice you are not actually doing --- the body without the training, the calm without the therapy, the expertise without the years. The color will fade quickly without the underlying intake. The card asks whether you would prefer to actually be pink or just appear pink for a season. Both are choices.",
      suit: "The Bright Ones",
      image: "/oracle/bird/60.webp"
    },
    {
      id: "bird-60",
      number: 60,
      animal: "Roseate Spoonbill",
      keyword: "strange grace",
      keywords: ["absurdity", "uniqueness", "comedy", "charm"],
      meaning: "The spoonbill is pink and has a spoon for a face. The card refuses the binary between elegant and weird --- you are allowed to be both. The card lands when you have been editing your strangeness out of public-facing versions of yourself and asks you to leave the spoon. The people who get it will get it immediately. The people who do not are not who you needed. The spoon is the point. It does not get less weird the longer they look; it just gets more correct.",
      reversed: "Editing out the weird in pursuit of the elegant. The spoonbill reversed is the bird that has tried to look like a flamingo, hiding the bill, presenting the pink without the spatula. The flamingo is fine; the spoonbill is also fine; what is not fine is the spoonbill performing as a flamingo and being miserable about it. Restore the bill. It is the part that distinguishes you.",
      suit: "The Bright Ones",
      image: "/oracle/bird/58.webp"
    },
    {
      id: "bird-61",
      number: 61,
      animal: "Atlantic Puffin",
      keyword: "seasonal beauty",
      keywords: ["seasons", "cycles", "timing", "change"],
      meaning: "Puffins grow their colorful bills only for breeding season. The card affirms that your most vivid self is allowed to be situational. You do not have to be at full brightness year-round. The card lands when you are exhausted by a self that has been turned all the way up for too long, and grants permission to shed the outer plates. There are seasons for the costume and seasons for the quieter version underneath. The audience that loves the bright bill will still recognize you in the winter.",
      reversed: "You are performing peak season in the off season. The puffin reversed is the breeding plumage maintained at all times, the bill that will not shed, the brilliant presentation that has been on so long the bird has forgotten what its actual face looks like. Let the molt happen. You are not less of yourself when you are not at peak. You are just in the part of the year where the outer plates rest.",
      suit: "The Bright Ones",
      image: "/oracle/bird/61.webp"
    },
    {
      id: "bird-62",
      number: 62,
      animal: "Gouldian Finch",
      keyword: "improbable palette",
      keywords: ["surprise", "contrast", "unexpected", "paradox"],
      meaning: "Gouldian finches come in different head colors with no clear reason. The card is for someone holding several versions of themselves and wondering which is the real one. They all are. The variation is the species, not an error within it. The card lands when you are exhausted by the demand to integrate yourself into a single coherent identity. The Gouldian finch contradicts the demand. You are allowed to be three head colors. The body underneath is the same bird.",
      reversed: "You are switching versions to avoid commitment to any of them. The Gouldian reversed is the polymorphism used as evasion --- moving between head colors so quickly that no one, including you, can pin down what you actually want. The card grants permission to be multiple but asks you to pick one for the current season and live there. The constant switching is not the species; it is just inability to land.",
      suit: "The Bright Ones",
      image: "/oracle/bird/65.webp"
    },
    {
      id: "bird-63",
      number: 63,
      animal: "Great Blue Heron",
      keyword: "stillness as strategy",
      keywords: ["stillness", "camouflage", "invisibility", "patience"],
      meaning: "The heron does not chase fish; it becomes invisible to them. Stop pursuing what you want and start positioning yourself where it has to pass. The work of getting what you want is often not the energetic chase; it is the unglamorous selection of the right shallows and the willingness to stand in them long enough. Patience is not passivity; it is method. Stand in the right place. Hold still. The opportunity will swim within range.",
      reversed: "You have been still so long you have forgotten to strike. The heron reversed has confused patience with paralysis, deliberation with delay. The card asks whether you are still waiting because the strike has not yet arrived, or whether you have simply stopped striking. The fish was right there and has now swum past. The card grants permission to move now, even imperfectly.",
      suit: "The Quiet Watchers",
      image: "/oracle/bird/64.webp"
    },
    {
      id: "bird-64",
      number: 64,
      animal: "American Bittern",
      keyword: "vanishing",
      keywords: ["disappearance", "hiding", "concealment", "adaptation"],
      meaning: "The bittern stands among reeds and points its beak skyward and ceases to exist. The card grants permission to go quiet --- to disappear from a feed, to stop explaining yourself, to let a long stretch of your life happen without commentary. Visibility is not always the goal. There are seasons when being seen costs more than it earns, and the right move is to become reeds for a while. You will not be forgotten. You will be missed, and miss is also a relationship.",
      reversed: "You are hiding in a place where you needed to be seen. The bittern reversed is the camouflage worn too long, in a setting where someone was actually trying to find you and you let them pass. Step out of the reeds. Not for the feed, not for the brand --- for the specific person, the specific room, the specific moment that requires your visible body in it. Invisibility is a tool, not a permanent location.",
      suit: "The Quiet Watchers",
      image: "/oracle/bird/63.webp"
    },
    {
      id: "bird-65",
      number: 65,
      animal: "Eastern Screech-Owl",
      keyword: "quiet surveillance",
      keywords: ["watching", "attention", "smallness", "alertness"],
      meaning: "Screech-owls live in suburban yards and are almost never seen. The card affirms a kind of intelligence that does not announce itself. You have been underestimated by people in your life and you have largely let them continue, which has worked out. Stay underestimated; it is an advantage. The card lands when you are tempted to start performing your competence and gently suggests not yet. The screech-owl gets more done from the unnoticed branch.",
      reversed: "You have been so quiet so long that you have started to believe you are small. The screech-owl reversed has confused not being noticed with not being capable. Your strategic invisibility was an advantage, not an identity. Some moments require you to come out into open light and be visible. Recognize when that moment has arrived.",
      suit: "The Quiet Watchers",
      image: "/oracle/bird/62.webp"
    },
    {
      id: "bird-66",
      number: 66,
      animal: "Brown Creeper",
      keyword: "patient ascent",
      keywords: ["patience", "thermals", "ascent", "trust"],
      meaning: "The brown creeper works its way up a tree in a slow spiral, then drops to the next tree and starts again. The card describes work that is unglamorous and effective. No one will write about your method; you will still arrive. The card lands when you have been resentful that the work you are doing is not being externally recognized. The creeper does not need an audience. The tree gets covered. The progress is real and the method is correct.",
      reversed: "You are seeking applause for a practice that was supposed to be private. The creeper reversed is the slow spiral made into a content series --- the unglamorous work that has begun to perform its unglamorousness for the audience. The card asks whether the documentation has begun to compromise the work. Some practices are meant to be quiet. Returning the practice to its actual privacy may restore it.",
      suit: "The Quiet Watchers",
      image: "/oracle/bird/66.webp"
    },
    {
      id: "bird-67",
      number: 67,
      animal: "Snowy Owl",
      keyword: "the visitor from elsewhere",
      keywords: ["visitation", "rarity", "otherworldly", "passage"],
      meaning: "Snowy owls come south in irruption years and sit on fenceposts looking like they do not belong. The card describes a perspective you currently have that the people around you do not --- a clarity that comes from being from somewhere else, having lived through something they have not. The strangeness is the value. The card lands when you have been told to assimilate, to file off the edges, and resists the pressure. Keep the gaze foreign. The owl's whole power is that it has not become local.",
      reversed: "You have started identifying with not belonging. The snowy owl reversed is the outsider position that has calcified into a personality --- that has begun to refuse belonging when belonging is available and offered. The card asks whether the foreignness is still serving the perception or whether it has become an aesthetic. Belonging is also available. You have not chosen it. You could.",
      suit: "The Quiet Watchers",
      image: "/oracle/bird/67.webp"
    },
    {
      id: "bird-68",
      number: 68,
      animal: "Nightjar",
      keyword: "invisible presence",
      keywords: ["hidden", "sound", "presence", "mystery"],
      meaning: "Nightjars call in the dark and are rarely seen. The card affirms a knowledge you have without external evidence --- a sense about a person, a project, a direction --- that you cannot demonstrate to anyone else. The card is not telling you to act on it yet; it is telling you it counts. The intuition is a real data source. Other people will require proof you cannot yet provide, and that is reasonable for them. But you do not need to wait for their proof to take your own perception seriously.",
      reversed: "You are demanding proof of an intuition that was never going to provide one. The nightjar reversed is the gut feeling that has been put through such an exhaustive forensic examination that the original signal has been lost. Stop trying to make the intuition justify itself. Either you accept the call as data or you do not. Both are choices. Endless interrogation of the call is the worst of both.",
      suit: "The Quiet Watchers",
      image: "/oracle/bird/68.webp"
    },
    {
      id: "bird-69",
      number: 69,
      animal: "Ruffed Grouse",
      keyword: "the drumming heart",
      keywords: ["drumming", "heartbeat", "persistence", "rhythm"],
      meaning: "The grouse drums by beating its wings against the air; the sound is a heartbeat. The card asks you to make your interior rhythm audible to the people who need to know it. Some things have to be drummed, not described --- the felt sense of how you are doing, the deep state of a friendship, the actual rhythm of a creative project. The card lands when you have been trying to explain a state of being and the explanation keeps failing. Stop describing. Drum. Make the rhythm itself the message.",
      reversed: "You are drumming for an audience that has stopped listening. The grouse reversed is the male still on his log, still beating his wings, still announcing himself to a forest that has moved on. Some performances continue past the point of their reception. Drum for yourself for a while; restore the heartbeat as a private practice. The audience will be there when you have something new to drum about.",
      suit: "The Quiet Watchers",
      image: "/oracle/bird/69.webp"
    },
    {
      id: "bird-70",
      number: 70,
      animal: "Whippoorwill",
      keyword: "the name that says itself",
      keywords: ["identity", "simplicity", "self-naming", "clarity"],
      meaning: "The whippoorwill calls its own name, over and over, until you cannot unhear it. The card describes a refrain in your life --- a worry, a hope, a person, a question --- that keeps returning. Listen to the repetition; the repetition is the message. The card lands when you have been trying to dismiss something that keeps coming back. Whatever returns this many times is not random. It is asking for a real response.",
      reversed: "You have made the refrain a personality. The whippoorwill reversed is the call that has become identity --- the grievance you have repeated so many times you have ceased to be the person experiencing it and have become the person reciting it. Let the call rest. The recitation, beyond a certain point, does not produce new information. Sit quietly with the silence for a season.",
      suit: "The Quiet Watchers",
      image: "/oracle/bird/72.webp"
    },
    {
      id: "bird-71",
      number: 71,
      animal: "Killdeer",
      keyword: "the feint",
      keywords: ["sacrifice", "protection", "deception", "devotion"],
      meaning: "The killdeer fakes an injury to lead predators away from its nest. The card is about the soft front protecting the hard center. You are allowed to seem more fragile than you are if it keeps what matters safe. The card lands when you have been making yourself look smaller or more confused than you really are, in order to redirect a difficult person away from something you do not want them anywhere near. This is not weakness; it is sophisticated misdirection. The wing is not actually broken.",
      reversed: "The broken wing has become real. The killdeer reversed is the deception that has lasted so long the bird has begun to actually believe it. You have performed vulnerability so often, so convincingly, that it is now your operating mode rather than your strategy. Remember the difference. The wing was a lie told to protect the nest. You can fly. Try.",
      suit: "The Quiet Watchers",
      image: "/oracle/bird/71.webp"
    },
    {
      id: "bird-72",
      number: 72,
      animal: "Tawny Frogmouth",
      keyword: "the perfect stillness",
      keywords: ["stillness", "perfect", "composure", "waiting"],
      meaning: "The frogmouth is not camouflaged; it is integrated. It does not hide; it becomes context. The card asks you to stop opposing your environment and start belonging in it so completely that it cannot tell you apart from itself. The card lands at the end of a long journey of trying to stand out and offers the next move. The final move is not resistance; it is integration. Becoming the branch is not the death of the self. It is the self at home enough to disappear into the place it lives.",
      reversed: "You have integrated so thoroughly you have disappeared. The frogmouth reversed is the bird that has become so much branch it can no longer remember being a bird --- the person who has assimilated so completely that the original self has stopped being available. The card asks you to become legible again. Move. Open your eyes. Show the yellow. The tree is not actually you. You are visiting.",
      suit: "The Quiet Watchers",
      image: "/oracle/bird/70.webp"
    }
  ]
};

export function getAllOracleDecks(): BirdOracleDeckInfo[] {
  return [BIRD_ORACLE];
}
