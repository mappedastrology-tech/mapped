/**
 * Interpretive text for the "inner" chart positions:
 *   - Soul Urge (Heart's Desire)
 *   - Personality
 *   - Birthday
 *   - Maturity (Realization)
 *
 * VOICE: warm, literate, mystical-but-grounded, written for a smart adult.
 * Sincere about the tradition — confident, specific, never skeptical, never
 * hedging. Second person. A thoughtful numerologist, not a horoscope generator.
 */

import type { PositionMeanings } from "./numerologyMeanings.types";

/**
 * SOUL URGE — the Heart's Desire. Drawn from the vowels of the birth name,
 * this is the inner motivation: what the soul quietly craves and is drawn
 * toward, beneath what you show the world.
 */
export const SOUL_URGE: PositionMeanings = {
  1: "At your core you long to stand on your own ground. The soul here aches to lead, to originate, to feel the clean satisfaction of having done a thing your own way. You are quietly driven to be first, to be self-reliant, to leave a mark that is unmistakably yours — and you are restless whenever you sense you are merely following.",
  2: "Your deepest wish is for closeness, harmony, and the felt sense of being understood. The soul here is drawn toward partnership and gentle accord, longing to soothe what is jagged and to belong to someone or something fully. You crave peace not as absence of conflict but as a warm, mutual attunement — to love, and to be met in return.",
  3: "You are inwardly drawn to expression, delight, and the bright play of being alive. The soul here craves to create, to speak, to make others feel — and feels most itself when joy is moving through you and out into the world. Beneath any composure runs a wish to be seen, to be heard, and to scatter a little wonder wherever you go.",
  4: "At your center you long for solid ground beneath your feet. The soul here craves order, reliability, and the deep contentment of having built something that will hold. You are drawn toward usefulness and honest work, and you feel most at peace when life is structured, your word is kept, and the foundation you stand on is one you laid yourself.",
  5: "Your soul thirsts for freedom and the electricity of the new. You are inwardly drawn to motion, sensation, and experience for its own sake — to taste everything once and be bound by nothing. Beneath the surface runs a hunger for change, for the open road, for a life wide enough that no single room could ever contain the whole of you.",
  6: "You long, more than anything, to love and be needed. The soul here is drawn toward home, family, and the tender work of caring for what is yours. You crave beauty, harmony, and a circle to protect, and you feel most whole when you are giving — holding others steady, making a place warm, carrying the ones you love a little of the way.",
  7: "Your soul reaches for the truth beneath the surface of things. You are quietly drawn toward solitude, study, and the still inner places where understanding ripens. You crave meaning rather than noise, depth rather than display — and you feel most yourself in contemplation, following a private thread toward whatever is real, sacred, and not yet fully known.",
  8: "At your core you long for mastery in the visible world. The soul here is drawn toward achievement, abundance, and the deep satisfaction of seeing vision become substance. You crave to build something that holds weight and to wield real influence well. Beneath the ambition lies a wish to prove your own power — and to use it for more than yourself.",
  9: "Your soul aches toward something larger than your own life. You are drawn to compassion, beauty, and the wish to give yourself to a cause that matters. You crave to heal, to uplift, to love widely and without condition — and you feel most whole in those moments of release when you give freely, expecting nothing, and find you are made larger by it.",
  11: "Yours is an illumined heart, charged and finely tuned. The soul here craves inspiration, spiritual connection, and the chance to be a channel for something luminous moving through you. You long to lift others by your very presence and to live near the radiant edge of meaning. The current runs strong — a gift and a charge — and you feel its pull toward the light.",
  22: "Your soul carries an immense longing: to bring something visionary into form on the largest scale. You crave to build what serves the many — to take a luminous idea and lay it brick by brick into the world. This is the master builder's heart, ambitious and grounded at once, restless until the dream you carry is made real and standing where others can use it.",
  33: "Yours is the heart of the devoted teacher, the soul that longs to love without limit and to lift the whole through care. You crave to heal, to guide, to pour yourself out in service so wholehearted it borders on the sacred. The charge here is rare and demanding — a wish to embody compassion itself, and to leave the world gentler for your having loved it.",
};

/**
 * PERSONALITY — the outer self. Drawn from the consonants of the birth name,
 * this is the first impression, the "doorway" others walk through before they
 * know you: how you come across, the vibe you give off.
 */
export const PERSONALITY: PositionMeanings = {
  1: "You come across as someone in charge of yourself — upright, capable, a little out in front. People sense initiative and independence before they know anything else about you, and they tend to look to you to set the direction. There is a clean, confident edge to your presence that reads as strength and quietly invites others to follow.",
  2: "You give off a gentle, approachable warmth that puts people at ease. Others meet someone tactful and attentive, a good listener who seems unhurried and kind. There is a softness to your presence that draws confidences and lowers defenses — people feel, before they can say why, that with you they are safe and that you are on their side.",
  3: "You come across as bright, charming, and easy to be around. People meet your wit and warmth first, the quick smile and the lively turn of phrase, and they tend to find you delightful company. There is a glow to your presence, an air of optimism and play, that lifts a room simply by your having walked into it.",
  4: "You present as steady, grounded, and thoroughly dependable. People meet someone solid and unpretentious, the sort you can count on to mean what they say and do what they promise. There is a no-nonsense reliability in how you carry yourself — an air of competence and quiet order that makes others trust you with what matters.",
  5: "You give off a quick, magnetic, alive energy that draws people in. Others meet someone curious, adaptable, and a little unpredictable — the spark in the room who seems to have been everywhere and tried everything. There is a freedom in your presence that feels exciting and faintly contagious, and people sense that to be near you is to be near possibility.",
  6: "You come across as warm, responsible, and reassuring — the one others instinctively turn to. People meet a caretaker's heart and an even temperament, a presence that feels like home. There is a generous, harmonizing quality to how you carry yourself that makes others feel looked after, and you radiate the sense that here, things will be all right.",
  7: "You present as composed, thoughtful, and a touch mysterious. People meet a quiet intelligence and a certain reserve, a sense that more is going on beneath the surface than you let show. There is a dignified, observing quality to your presence — you seem to watch and weigh the world, and that depth makes others curious to know what you are thinking.",
  8: "You come across as capable, confident, and quietly commanding. People meet an air of authority and competence, a sense that you know your worth and how things get done. There is a polished, substantial quality to your presence — you seem built for responsibility and the larger arena, and others tend to defer to the strength they sense in you.",
  9: "You give off a gracious, worldly warmth, the air of someone who has seen much and judges little. People meet a wide, compassionate presence — magnetic, a little aristocratic, openhearted toward strangers. There is a glow of generosity and breadth about you that draws people from all walks, who sense in you someone who will understand.",
  11: "You carry an unmistakable charge — a presence others find luminous, intense, and quietly inspiring. People meet a sensitivity and an inner light that sets you slightly apart, as though you are tuned to a higher frequency. There is something charismatic and a little electric about how you come across, and others feel uplifted, sometimes without knowing why.",
  22: "You present with a rare blend of vision and solidity — someone who seems both to dream large and to get things done. People sense a quiet, capable authority about you, an air of someone meant for substantial work. There is a grounded grandeur to your presence; others feel they are in the company of a builder, and instinctively take you seriously.",
  33: "You radiate a warm, almost luminous benevolence that others feel as comfort. People meet a presence of deep care and calm, the unmistakable sense of someone here to help and to heal. There is a selfless, elevated quality to how you come across — gentle yet commanding in its compassion — and others are drawn to be near the steadiness you give off.",
};

/**
 * BIRTHDAY — the special gift the day of birth lends to the chart. A more
 * specific, secondary note layered atop the Life Path. (No 33: a calendar day
 * can reduce to master 11 or 22, but never to 33.)
 */
export const BIRTHDAY: PositionMeanings = {
  1: "Your day of birth gives you a gift for standing alone and leading from the front. You carry an innate independence and originality — the will to begin things and the nerve to do them your own way. When others hesitate, something in you steps forward, ready to pioneer what hasn't been tried.",
  2: "Your day of birth lends you a gift for sensitivity and partnership. You read the emotional currents of a room with uncommon accuracy and know instinctively how to bring people together. This is a quiet talent for diplomacy and tenderness — the art of cooperation, and of making others feel genuinely understood.",
  3: "Your day of birth blesses you with expression and charm. Words, color, humor, performance — the creative gifts come easily, and you have a knack for lifting spirits. This is a talent for delight: the ability to communicate, to entertain, and to remind the people around you that life is meant to be enjoyed.",
  4: "Your day of birth gives you a gift for building and order. You bring patience, discipline, and a practical, methodical mind to whatever you take on, and you can be trusted to see it through. This is the talent of the craftsman — the steady hands and reliable heart that turn good intentions into lasting things.",
  5: "Your day of birth grants you versatility and an adventurer's spirit. You adapt quickly, learn on the move, and meet change with appetite rather than fear. This is a gift for freedom and resourcefulness — a quick wit, a love of new experience, and an ease with people that lets you flourish almost anywhere.",
  6: "Your day of birth gives you a gift for nurturing and responsibility. You carry a natural warmth and an eye for harmony, and others sense they can lean on you. This is the talent of the caretaker — devotion to home and family, a love of beauty, and the instinct to mend what is broken and comfort what is hurting.",
  7: "Your day of birth blesses you with depth and a searching mind. You think more deeply than most, drawn to analysis, mystery, and the quiet places where insight forms. This is a gift for understanding — the patience to study, the intuition to sense what lies beneath, and a wisdom that ripens in solitude.",
  8: "Your day of birth lends you a gift for ambition and good judgment in the material world. You grasp how things work — money, power, organization — and have the drive to make them work for you. This is the talent of the executive: vision paired with the stamina and shrewdness to turn it into real, substantial results.",
  9: "Your day of birth gives you a gift for compassion and broad vision. You feel for people beyond your own circle and are moved to give, to heal, to make things more just. This is the talent of the humanitarian — an open heart, a generous spirit, and the artistry to touch many lives at once.",
  11: "Your day of birth carries the heightened charge of a master number. You are gifted with keen intuition and a kind of inner illumination — flashes of insight that arrive before logic can explain them. This is a sensitivity that can inspire others, a talent for sensing the unseen, lived at a higher and more demanding voltage than most.",
  22: "Your day of birth carries the heightened charge of a master number — the master builder's gift. You can hold a vast vision and the practical means to realize it in the same mind. This is a rare talent for turning grand ideas into concrete, enduring achievement, lived at an elevated and exacting intensity.",
};

/**
 * MATURITY — the Realization number: the theme that ripens in the second half
 * of life, roughly after the mid-thirties, once Life Path and Expression have
 * had time to integrate into a deeper sense of who you are.
 */
export const MATURITY: PositionMeanings = {
  1: "As you mature, life calls you toward independence and self-trust. The later chapters reward you for standing on your own conviction, leading where you once deferred, and claiming the authority you spent years earning. A new confidence ripens — a willingness to be the author of your own path and to walk it without waiting for permission.",
  2: "As you mature, the theme that ripens is connection, peace, and quiet wisdom. The second half of life softens you toward cooperation and draws you into the role of the diplomat and confidant. You grow more attuned to others, more at home in partnership, and you find a deep contentment in harmony, patience, and the gentle work of bringing people together.",
  3: "As you mature, joy and self-expression come into full flower. The later years invite you to share your voice freely — to create, to speak, to lighten the lives around you without the old self-consciousness. A creative second spring opens up, and you find that the gift for delight you may have held back is meant, now, to be given away.",
  4: "As you mature, life asks you to build something lasting and to stand on solid ground. The later chapters reward discipline, patience, and the careful construction of order and security. You grow into a steadying presence — the dependable foundation for others — and you find deep satisfaction in the structures, the legacy, and the honest work you leave behind.",
  5: "As you mature, an unexpected freedom opens before you. The second half of life loosens old constraints and invites adventure, change, and new experience just when others are settling. You grow more adaptable and more alive to the world's variety, and you find that this later season is meant to be tasted widely — that your story is far from finished.",
  6: "As you mature, the theme that ripens is love, responsibility, and care for your community. The later years draw you toward home, family, and the role of the one others rely upon. You grow into a nurturer and counselor, finding deep fulfillment in service and devotion — in beauty, in harmony, and in being the heart that holds your circle together.",
  7: "As you mature, life turns you inward toward wisdom and meaning. The second half of life rewards reflection, study, and the patient search for truth, and a natural spiritual deepening unfolds. You grow more comfortable in solitude and more trusting of your inner knowing, and you come into a quiet, hard-won understanding of what your life has truly been about.",
  8: "As you mature, you come into your power in the visible world. The later chapters bring recognition, abundance, and the authority to lead on a larger scale, often after years of building. You grow into mastery — of money, of influence, of vision realized — and you find fulfillment in wielding that strength wisely and in seeing your labor bear substantial fruit.",
  9: "As you mature, your life widens toward compassion and a sense of the universal. The second half draws you beyond personal concerns into service, generosity, and a wish to give back to the world. You grow more tolerant, more openhearted, more moved by the whole of humanity — and you find your deepest fulfillment in what you offer freely to others.",
  11: "As you mature, the heightened charge of the 11 comes into its own. The later years call you to be a source of inspiration and spiritual light, to live by intuition and to lift others through your presence. This is a luminous, demanding ripening — a summons to channel something higher — and you grow into the rare role of one who illuminates the way.",
  22: "As you mature, the master builder's power fully awakens. The second half of life calls you to bring a great vision into concrete form for the benefit of many, joining lofty ideals to practical mastery. This is an elevated and exacting ripening — you grow into the capacity to build something enduring, leaving a structure the world can stand on.",
  33: "As you mature, you ripen into the master teacher's calling — to love, heal, and uplift on the largest scale. The later years ask you to give yourself in service so wholehearted it becomes a kind of devotion. This is the rarest and most demanding ripening, a summons to embody compassion itself and to leave the world gentler for your care.",
};
