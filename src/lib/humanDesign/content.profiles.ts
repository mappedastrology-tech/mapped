/**
 * Human Design content — Profiles and Variables.
 *
 * The twelve Profiles are drawn from the six lines of the hexagram, paired as
 * conscious (Personality) line over unconscious (Design) line. Each line is an
 * archetype: 1 Investigator, 2 Hermit, 3 Martyr, 4 Opportunist, 5 Heretic,
 * 6 Role Model. The four Variables (the arrows atop the chart) describe how you
 * best digest, where you thrive, what drives your mind, and how your awareness
 * takes in the world — each tuned left (active/focused) or right (receptive/open).
 *
 * VOICE: warm, literate, empowering, grounded, sincere. Second person. No hedging.
 */

import type { ProfileContent, VariableContent } from "./content.types";

export const PROFILE_CONTENT: Record<string, ProfileContent> = {
  "1/3": {
    key: "1/3",
    name: "Investigator / Martyr",
    description:
      "You need to understand before you can move, so you dig to the foundation of things — then you learn the rest by living it. Your conscious mind wants solid ground; your body learns through trial, error, and honest experiment. What doesn't work for you is never wasted. It becomes wisdom you can stand on and share.",
    application:
      "Give yourself permission to study deeply and to fail forward. Treat every dead end as data. Build your confidence on knowledge you've tested yourself, not borrowed certainty.",
  },
  "1/4": {
    key: "1/4",
    name: "Investigator / Opportunist",
    description:
      "You research life to the roots, then share what you've found through the people closest to you. Your foundation is inward and studious; your influence is warm and relational. Opportunities and next steps tend to arrive through your network, not from strangers, so who you know quietly shapes where you go and how your knowledge lands.",
    application:
      "Study until you feel secure, then talk about what you know with the people you trust. Tend your friendships. Let the right doors open through them rather than chasing cold ones.",
  },
  "2/4": {
    key: "2/4",
    name: "Hermit / Opportunist",
    description:
      "You carry a natural gift that flows best when you're left alone to do your thing — yet life keeps calling you out to share it. You need solitude to recharge and warm connection to thrive, so you live between the door closed and the door open. When you're called by the right people, you shine.",
    application:
      "Protect your alone time without guilt; it's where your talent lives. Then answer the genuine calls that come through your network. Wait to be recognized rather than pushing yourself forward.",
  },
  "2/5": {
    key: "2/5",
    name: "Hermit / Heretic",
    description:
      "You have a natural talent you'd rather practice in private, but the world projects onto you and calls you out to solve its problems. People see you as capable of more than you may feel, and you carry a practical, universalizing gift. You move between wanting to hide and being summoned to lead and deliver.",
    application:
      "Honor your need to retreat, then show up for the calls that are truly yours. Manage projections by being clear about what you can and can't deliver, and let your solutions speak.",
  },
  "3/5": {
    key: "3/5",
    name: "Martyr / Heretic",
    description:
      "You learn by bumping into life — trying, failing, discarding what doesn't work — and the wisdom you gather is exactly what others come to you for. People project a savior's competence onto you, expecting practical answers. Your resilience is real, and your value grows every time you turn a mistake into something useful for the rest of us.",
    application:
      "Experiment freely and don't fear being wrong; that's how you find what works. Offer your hard-won solutions where they're genuinely wanted, and step back from projections that don't fit.",
  },
  "3/6": {
    key: "3/6",
    name: "Martyr / Role Model",
    description:
      "The first part of your life is hands-on and experimental — you learn what works by living through what doesn't. Around your thirties you climb onto the roof to observe, and later you descend as a trusted example. You're building, across decades, a life of tested wisdom that others will look to and follow.",
    application:
      "In your early years, experiment without shame. In the middle, rest and watch rather than force. Later, embody what you've learned — you teach most powerfully by simply living it.",
  },
  "4/6": {
    key: "4/6",
    name: "Opportunist / Role Model",
    description:
      "You move through life on the strength of your relationships and your integrity. Your friendships and networks are where opportunity flows, and people watch how you carry yourself. Over time you grow into a dependable example — someone whose warmth, loyalty, and lived wisdom make others trust you and want to be near you.",
    application:
      "Invest in your closest bonds; they're your foundation and your future. Live with integrity, because people are watching and learning. Let the right opportunities reach you through the people you love.",
  },
  "4/1": {
    key: "4/1",
    name: "Opportunist / Investigator",
    description:
      "You are the most fixed of all profiles — you know who you are and what you're here to express, and you're not easily moved off it. Your knowledge runs deep and your influence flows through relationships. You transmit a fixed truth to the people around you, and your certainty becomes their anchor.",
    application:
      "Trust your inner sense of direction; it's remarkably stable. Share your fixed gift through warm relationships rather than chasing new paths. Let people come to you for the clarity you naturally hold.",
  },
  "5/1": {
    key: "5/1",
    name: "Heretic / Investigator",
    description:
      "You carry deep, foundational knowledge and a gift for practical solutions, so the world projects heavily onto you and calls on you in times of need. People expect you to fix things. Grounded by your investigative depth, you can meet that call — delivering universal, usable answers when you choose to step forward.",
    application:
      "Do your homework so your solutions are solid, then rise to the calls that are truly yours. Watch the projections carefully; deliver what you promise, and protect your reputation.",
  },
  "5/2": {
    key: "5/2",
    name: "Heretic / Hermit",
    description:
      "You're seen as a natural problem-solver, called out to help even when you'd rather be left alone. People project competence and expectation onto you, and you carry a gift that emerges when you're rightly summoned. You live between the pull to withdraw and the world's insistence that you come save the day.",
    application:
      "Guard your solitude and wait for the genuine call. When it comes and it fits, show up fully and deliver. Be honest about the projections so you're not shaped by what others merely imagine.",
  },
  "6/2": {
    key: "6/2",
    name: "Role Model / Hermit",
    description:
      "You live in three acts: an experimental beginning, a reflective middle spent watching from the roof, and a wise maturity as a trusted example. Underneath runs a natural talent that surfaces when you're rightly called. You need solitude to restore yourself, and over time you become someone others quietly aspire to be.",
    application:
      "Let each phase be what it is — messy early, observant in the middle, exemplary later. Protect your alone time, answer the true calls, and trust that living well is your greatest teaching.",
  },
  "6/3": {
    key: "6/3",
    name: "Role Model / Martyr",
    description:
      "You're here to become a living example, but you get there the hands-on way — through experiment, mistakes, and real experience. Your early life is full of trial and error, your middle years more watchful, and your maturity wise and tested. You blend the optimism of learning with the depth of having genuinely lived it.",
    application:
      "Experiment boldly in your early years and forgive your missteps. Use the middle phase to step back and integrate. In maturity, lead by example — your credibility comes from having lived through it all.",
  },
};

export const VARIABLE_CONTENT: Record<string, VariableContent> = {
  determination: {
    key: "determination",
    name: "Digestion / Determination",
    description:
      "Determination governs how you best take in food and, more broadly, energy — the conditions under which your body digests and thrives. Getting this right steadies your mood, focus, and vitality, because how you consume shapes how clearly you can think and feel.",
    leftMeaning:
      "A left arrow points to focused, specific intake: fewer things at a time, cleaner conditions, one flavor or task fully attended to before the next.",
    rightMeaning:
      "A right arrow points to open, varied intake: many flavors, changing conditions, and a relaxed, receptive way of taking things in without rigid rules.",
  },
  environment: {
    key: "environment",
    name: "Environment",
    description:
      "Environment governs the physical settings where you thrive — the kinds of spaces, surroundings, and rhythms that let your body feel at ease. Being in the right environment quietly supports every decision you make and how well your design can function.",
    leftMeaning:
      "A left arrow means you do best when you actively choose and shape your surroundings, seeking out specific spaces that hold and focus you.",
    rightMeaning:
      "A right arrow means you thrive by being open to your surroundings, absorbing the setting and letting the right environment find and settle you.",
  },
  motivation: {
    key: "motivation",
    name: "Motivation",
    description:
      "Motivation governs what drives your mind — the underlying reason behind your thinking and what you communicate. When you're aligned with your true motivation, your words and choices carry a clarity that others feel; when you're not, your mind pulls you off course.",
    leftMeaning:
      "A left arrow means your mind is driven in a strategic, purposeful direction — focused on a specific aim and moving deliberately toward it.",
    rightMeaning:
      "A right arrow means your mind is driven in a receptive, peripheral way — open to the bigger picture and led by what unfolds around you.",
  },
  perspective: {
    key: "perspective",
    name: "Perspective / View",
    description:
      "Perspective governs the lens your awareness takes — the angle from which you naturally observe and make sense of the world. Trusting your correct way of seeing sharpens your insight and keeps your outer awareness working the way it was designed to.",
    leftMeaning:
      "A left arrow means your awareness is focused and specific — zeroing in on details and particular points with precision and directed attention.",
    rightMeaning:
      "A right arrow means your awareness is open and peripheral — taking in the wide field, the surroundings, and the whole scene at once.",
  },
};
