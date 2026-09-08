import type { ReferenceEntry } from "../types";

/** Quick-reference for the 24 runes of the Elder Futhark (conventional meanings). */

function rune(id: string, name: string, symbol: string, aett: string, sound: string, summary: string, upright: string): ReferenceEntry {
  return {
    domain: "runes",
    id: `rune-${id}`,
    // Unconditional, unlike the other domains' plate sets: the Elder Futhark is
    // closed and all 24 are painted, so a rune without a plate would be a rune
    // that shouldn't be here. tests/referenceArt.test.ts catches a missing file.
    image: `/images/learn/rune-${id}.webp`,
    name: `${name} ${symbol}`,
    aka: [name, symbol],
    category: `Elder Futhark · ${aett} Aett`,
    summary,
    fields: [
      { label: "Meaning", value: upright },
      { label: "Sound", value: sound },
      { label: "Aett", value: `${aett} Aett` },
    ],
    tags: ["rune", "elder futhark", aett.toLowerCase()],
  };
}

export const runeReference: ReferenceEntry[] = [
  // ── First Aett ──
  rune("fehu", "Fehu", "ᚠ", "First", "F", "Fehu means cattle, the movable wealth that measured a household's prosperity in the old Norse world. As a reflective tool it invites you to consider the resources you have earned, how you tend them, and what abundance and security mean to you now.", "Wealth and abundance — resources earned and the energy of prosperity."),
  rune("uruz", "Uruz", "ᚢ", "First", "U", "Uruz denotes the aurochs, the powerful wild ox whose untamed vigor symbolized raw, primal life-force. It asks you to reflect on your own physical and inner strength, your resilience, and the wild energy you might channel toward growth and challenge.", "Raw strength, vitality, and untamed energy (the aurochs)."),
  rune("thurisaz", "Thurisaz", "ᚦ", "First", "Th", "Thurisaz means thorn, and by extension the giants (thurses), a sharp and reactive force that can wound or defend. It invites reflection on conflict, friction, and protective boundaries, and on how a disruptive jolt might be handled wisely rather than rashly.", "A catalyst — conflict, a defensive thorn, or a reactive force to handle with care."),
  rune("ansuz", "Ansuz", "ᚨ", "First", "A", "Ansuz means a god, associated with Odin and the breath of inspired speech, wisdom, and divine communication. It invites you to reflect on the messages reaching you, the words you speak, and the insight or counsel that helps you understand your situation.", "Communication, wisdom, and insight — messages and the voice of the divine (Odin)."),
  rune("raidho", "Raidho", "ᚱ", "First", "R", "Raidho means riding, the wheel and the journey, evoking travel, movement, and the steady rhythm of a ride. It invites you to reflect on the path you are taking, whether your course feels right, and how to move through life in tune with its natural cadence.", "A journey, travel, and being in right rhythm with life's movement."),
  rune("kenaz", "Kenaz", "ᚲ", "First", "K", "Kenaz means the torch, a controlled flame that brings light, warmth, and the craft of the forge. It invites you to reflect on insight and creative fire, the knowledge that illuminates a problem, and what you are learning, making, or bringing into the light.", "The torch — knowledge, creativity, insight, and inspiration lighting the way."),
  rune("gebo", "Gebo", "ᚷ", "First", "G", "Gebo means a gift, embodying the bond created by giving and the reciprocity of exchange. It invites you to reflect on generosity and partnership in your life, the balance between giving and receiving, and the gifts and obligations that connect you to others.", "A gift and exchange — generosity, partnership, and balanced giving and receiving."),
  rune("wunjo", "Wunjo", "ᚹ", "First", "W", "Wunjo means joy, the glad fellowship and shared delight of a community at ease with itself. It invites you to reflect on contentment and belonging, on what brings you genuine happiness, and on the harmony that arises when things and people come together well.", "Joy, harmony, and contentment — things coming together well."),
  // ── Second Aett ──
  rune("hagalaz", "Hagalaz", "ᚺ", "Second", "H", "Hagalaz means hail, the icy storm that falls suddenly and batters the crops yet melts into water that nourishes the soil. It invites reflection on disruption beyond your control, the upheavals that clear the ground, and the renewal that can follow a hard, transformative shock.", "Hail — a disruptive, clearing storm; sudden change beyond your control."),
  rune("nauthiz", "Nauthiz", "ᚾ", "Second", "N", "Nauthiz means need, the bleak of necessity and the friction of want, traditionally the need-fire kindled by hard effort. It invites you to reflect on constraint and hardship, on patience under pressure, and on the resilience and self-knowledge that scarcity and resistance can teach.", "Need and constraint — resistance, hardship, and the lessons they teach."),
  rune("isa", "Isa", "ᛁ", "Second", "I", "Isa means ice, the single frozen stave that halts movement and locks the world in stillness. It invites you to reflect on pauses and stasis, on where things have frozen or stalled in your life, and on the patience and clarity that a deliberate standstill can offer.", "Ice — stillness, stasis, and a necessary pause or freeze."),
  rune("jera", "Jera", "ᛃ", "Second", "J / Y", "Jera means year or harvest, the turning of the seasons that rewards patient labor with ripened fruit. It invites you to reflect on natural cycles and right timing, on the slow work you have put in, and on trusting that effort sown in season will come to fruition.", "Harvest — cycles, right timing, and the reward that comes from patient effort."),
  rune("eihwaz", "Eihwaz", "ᛇ", "Second", "Ei", "Eihwaz means the yew, the evergreen tree of death and rebirth often linked to the world-axis Yggdrasil. It invites you to reflect on endurance and resilience, on standing steady through difficulty, and on the deep transformation found at the threshold between endings and beginnings.", "The yew tree — endurance, the axis between worlds, and deep transformation."),
  rune("perthro", "Perthro", "ᛈ", "Second", "P", "Perthro is often read as the dice-cup or lot-box, an emblem of chance, fate, and the hidden workings of wyrd. It invites you to reflect on mystery and the unknown, on what is still concealed or coming to light, and on your relationship with luck, secrets, and the unfolding of fate. It is one of the reversible runes.", "The dice-cup — fate, chance, mystery, and what is hidden or yet to be revealed."),
  rune("algiz", "Algiz", "ᛉ", "Second", "Z", "Algiz is associated with the elk and the protective, upraised shape of antlers or a sheltering hand. It invites you to reflect on protection and boundaries, on what shields you and what you safeguard, and on your connection to something higher that guides and watches over you.", "Protection — a shield, defense, and connection to something higher."),
  rune("sowilo", "Sowilo", "ᛊ", "Second", "S", "Sowilo means the sun, the life-giving light that guides sailors and ripens the land. It invites you to reflect on vitality, success, and wholeness, on the clarity and warmth lighting your way, and on the energy that helps you steer confidently toward your goals.", "The sun — success, vitality, wholeness, and guidance."),
  // ── Third Aett ──
  rune("tiwaz", "Tiwaz", "ᛏ", "Third", "T", "Tiwaz is named for Tyr, the sky-god of law and war who sacrificed his hand to bind the wolf Fenrir. It invites you to reflect on justice, honor, and courage, on standing by your principles, and on the disciplined self-sacrifice that doing the right thing can demand.", "The god Tyr — justice, honor, courage, and principled sacrifice."),
  rune("berkano", "Berkano", "ᛒ", "Third", "B", "Berkano means the birch, the first tree to green after winter and a symbol of the nurturing, fertile mother. It invites you to reflect on growth, birth, and new beginnings, on what you are tending or bringing into being, and on the gentle care that helps fresh starts take root.", "The birch — growth, birth, nurturing, and new beginnings."),
  rune("ehwaz", "Ehwaz", "ᛖ", "Third", "E", "Ehwaz means the horse, the trusted mount whose bond with its rider depends on mutual loyalty and cooperation. It invites you to reflect on partnership and trust, on the relationships that carry you forward, and on the steady, harmonious teamwork that lets you make progress together.", "The horse — partnership, trust, teamwork, and moving forward together."),
  rune("mannaz", "Mannaz", "ᛗ", "Third", "M", "Mannaz means humankind, the human being set within the web of family and society. It invites you to reflect on the self and your sense of identity, on your place within community, and on the shared humanity, support, and understanding that connect you to others.", "Humankind — the self, community, and our shared humanity."),
  rune("laguz", "Laguz", "ᛚ", "Third", "L", "Laguz means water, the lake or sea whose depths suggest the flowing, ungraspable realm of feeling and the unconscious. It invites you to reflect on intuition and emotion, on going with the current rather than against it, and on what your dreams and inner tides are trying to tell you.", "Water — intuition, flow, emotion, and the unconscious."),
  rune("ingwaz", "Ingwaz", "ᛜ", "Third", "Ng", "Ingwaz is named for Ing (Freyr), the fertility god whose seed is stored and gestated before it springs forth. It invites you to reflect on potential being quietly developed, on the patient gestation a goal needs, and on the moment when inner work is ready to be released into fruition.", "The god Ing — fertility, gestation, and potential ripening into fruition."),
  rune("dagaz", "Dagaz", "ᛞ", "Third", "D", "Dagaz means day, the dawn that breaks the darkness and the turning point between night and light. It invites you to reflect on breakthrough and awakening, on the hopeful shift in perspective that changes everything, and on the clarity that arrives as a new day begins.", "Day — breakthrough, awakening, a turning point, and hope."),
  rune("othala", "Othala", "ᛟ", "Third", "O", "Othala means the ancestral estate, the inherited homeland and property passed down through a family line. It invites you to reflect on heritage, ancestry, and home, on the values and legacy you have received, and on what is truly your own and worth preserving.", "Inheritance — heritage, ancestry, home, and what is truly yours."),
];
