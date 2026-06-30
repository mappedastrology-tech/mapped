/**
 * Cyclical and chapter-based numerology meanings: the Personal Year within the
 * nine-year cycle, the long Pinnacle chapters, and the recurring Challenge edges.
 *
 * VOICE: warm, literate, mystical-but-grounded — written for a smart adult by a
 * thoughtful numerologist. Sincere, specific, never skeptical.
 */

import type { PositionMeanings } from "./numerologyMeanings.types";

/**
 * PERSONAL_YEAR — your place within the recurring nine-year cycle. Each year
 * carries a distinct task; together they form one full turn of growth, from the
 * fresh seed of 1 to the long exhale of 9.
 */
export const PERSONAL_YEAR: PositionMeanings = {
  1: "This is the seed year, the first breath of a new nine-year cycle. The ground is freshly turned and everything you plant now sets the tone for what follows. Lean into beginnings, independence, and bold first steps. Expect doors to open and the pull to lead yourself somewhere new.",
  2: "After the rush of beginnings, this year asks you to slow down and let things take root. The work is quieter now — partnership, patience, and listening. Tend relationships, cooperate, and trust gentle timing over force. What felt stalled is often only ripening beneath the surface.",
  3: "A year of expression, color, and social warmth. The seeds you planted want to flower, and you are meant to enjoy them. Create, speak, gather, and play. Scattered energy is the only real risk; pour it into something you love and this becomes one of your brightest, most generous years.",
  4: "The year of foundations and honest labor. Joy gives way to structure as you build the framework that will hold everything you want. Tend to discipline, systems, and the unglamorous details. The effort feels heavy, but you are laying stone you will stand on for years. Show up steadily.",
  5: "After the steady walls of four, the windows fly open. This is a year of movement, change, and unexpected turns — travel, new people, fresh appetites. Stay flexible and curious rather than gripping the familiar. Embrace freedom without scattering it, and life rewards you with vivid, expanding experience.",
  6: "The heart of the cycle turns toward home, love, and responsibility. People lean on you now, and you are asked to answer with care. Tend family, commitments, and your own nest. Beauty, healing, and devotion flourish here. Give generously, but remember that you, too, belong among those you nurture.",
  7: "A year that draws you inward toward reflection, study, and quiet. The outer world matters less than the questions stirring beneath. Rest, read, retreat, and listen. Forcing visible progress only frustrates; this is a season of depth, not display. Trust what the silence is teaching and let understanding ripen.",
  8: "The harvest year of power and reward. The inner work of seven becomes outer momentum — money, recognition, and tangible results. Step into your authority and make decisive moves. Handle resources with integrity and ambition with grace. What you have built through the cycle now returns to you, often abundantly.",
  9: "The closing year, a long exhale before the next beginning. This is for completion, release, and gratitude — clearing what is finished to make room for what comes. Let go of what no longer fits and forgive what lingers. Endings here are tender, generous, and quietly clarifying. Honor the whole journey.",
};

/**
 * PINNACLE — a long chapter of life, lasting years to decades, lived under the
 * tone of a single number. A pinnacle is less an event than a climate: the
 * dominant opportunities, lessons, and energies that shape an entire era.
 */
export const PINNACLE: PositionMeanings = {
  1: "Under this pinnacle you are being forged into your own person. The era favors independence, initiative, and the courage to stand apart and lead. You learn to trust your instincts and start things without waiting for permission. The lesson is self-reliance — leaning on others less and on your own will more.",
  2: "This is a chapter of relationship, sensitivity, and patient cooperation. You grow through partnership rather than solo effort, learning the quiet power of diplomacy and timing. Emotional attunement deepens. The era rewards those who listen, support, and build with others — and teaches you that gentleness is its own kind of strength.",
  3: "A long season of creative flowering and self-expression. Your voice, imagination, and capacity for joy come into their own, and the era opens doors through words, art, and connection. Social life blossoms. The opportunity is to share your gifts generously; the lesson is to focus your energy rather than scatter its brightness.",
  4: "This pinnacle is built of work, order, and steady construction. You are meant to establish something lasting — a career, a home, a foundation that holds. The era asks for discipline and patience, rewarding effort over flash. The lesson is to find freedom inside structure and to trust that diligence quietly compounds.",
  5: "An era of change, freedom, and wide experience. Life accelerates, offering travel, variety, and unexpected turns that ask you to stay adaptable. You grow through movement and encounter rather than routine. The opportunity is vivid expansion; the lesson is to wield freedom with purpose so it liberates you rather than scattering you.",
  6: "This chapter centers on love, responsibility, and service. Family, community, and the people in your care become the gravity of the era, and you grow by giving and creating beauty and harmony around you. The opportunity is deep belonging; the lesson is to carry duty without losing yourself, nurturing others and your own heart alike.",
  7: "A contemplative pinnacle of depth, study, and inner refinement. The era turns you toward wisdom, spiritual seeking, and mastery of a chosen field, often in quieter, more solitary terms. Outer noise recedes. The opportunity is genuine understanding; the lesson is to let faith and reflection guide you, trusting what cannot always be seen.",
  8: "An era of power, achievement, and material mastery. You are called to build, lead, and handle resources at scale, learning the responsibilities that come with influence. Ambition finds real traction here. The opportunity is abundance and accomplishment; the lesson is to wed power to integrity, letting success serve more than yourself.",
  9: "This pinnacle is wide-hearted and humanitarian, asking you to live for something larger than your own gains. Compassion, artistry, and service to the world define the era, and you grow through giving and letting go. The opportunity is profound generosity; the lesson is to release attachment, loving without clutching what cannot be kept.",
  11: "A luminous, demanding chapter lived under a master number. You are sensitized to inspiration, intuition, and the unseen, and the era calls you to illuminate and uplift others. The current runs high and can feel like too much. The opportunity is to become a channel for vision; the lesson is to ground that voltage in steady, useful service.",
  22: "The master builder's pinnacle — an era to turn grand vision into lasting form. You carry the rare capacity to manifest something of real magnitude in the world: an institution, a body of work, a legacy that serves many. The opportunity is enormous reach; the lesson is to pair towering ambition with patient, practical, grounded execution.",
  33: "A pinnacle of the master teacher, devoted to compassionate service and the uplift of others. The era asks you to heal, guide, and love at a scale beyond the personal, holding high ideals while staying tender and present. The opportunity is to embody selfless devotion; the lesson is to give from fullness, sustaining yourself as you sustain others.",
};

/**
 * CHALLENGE — a recurring growth-edge, the area of friction your life keeps
 * returning you to until you meet it. A challenge is not a curse but a teacher:
 * the very tension that, worked through, becomes one of your deepest strengths.
 */
export const CHALLENGE: PositionMeanings = {
  0: "The challenge of zero is the challenge of choice. You arrive with a wide range of gifts and few fixed limits, which can mean facing all the other challenges at once or none in particular. Your work is to choose consciously and align with what you most value, trusting your own wisdom to give your freedom direction and shape.",
  1: "Your growth-edge is becoming truly your own person. You may struggle with asserting yourself, standing firm, or trusting your judgment over others' opinions. The friction pushes you toward authentic independence — neither dominating nor disappearing. As you learn to lead yourself and speak your truth without apology, this edge becomes quiet, durable strength.",
  2: "This challenge lives in sensitivity and relationship. You may be easily wounded, overly attuned to others' moods, or prone to losing yourself in the desire to keep peace. The work is to honor your feelings without being ruled by them, building confidence and balance so closeness strengthens you rather than dissolving your sense of self.",
  3: "Your edge concerns expression and self-worth. You may scatter your gifts, dim your voice from self-criticism, or hide real feeling behind lightness. The friction invites you to take your creativity seriously and speak honestly. As you focus your energy and trust what you have to say, joy and expression become genuine sources of power.",
  4: "This challenge centers on work, discipline, and limitation. You may resist structure, feel boxed in by obligation, or struggle to finish what you begin. The growth lies in patient, steady effort and in seeing constraints as scaffolding rather than cages. Met fully, this edge gives you the rare gift of building things that truly last.",
  5: "Your growth-edge is freedom and restraint. You may chase change, novelty, or escape — overindulging or scattering yourself across too many appetites. The work is to enjoy life's variety without being driven by it, finding the discipline that makes freedom meaningful. Balanced, this edge becomes a gift for vivid living grounded in genuine self-command.",
  6: "This challenge gathers around responsibility and ideals. You may hold yourself or others to impossible standards, over-give to the point of depletion, or confuse control with care. The work is to serve and love without martyrdom or perfectionism. As you accept imperfection in yourself and others, your devotion becomes warm, sustainable, and freely given.",
  7: "Your edge is trust — in yourself, in others, in life's deeper order. You may retreat into isolation, skepticism, or analysis that keeps the heart at a distance. The friction draws you toward faith and openness without abandoning your discernment. Met well, this challenge ripens into genuine wisdom and a quiet, unshakable inner peace.",
  8: "This challenge concerns power, money, and self-worth measured by results. You may swing between overreach and avoidance, or tie your value too tightly to achievement. The work is to handle ambition and resources with balance and integrity, neither grasping nor shrinking. Mastered, this edge gives you sound judgment and a grounded, honest relationship with success.",
};
