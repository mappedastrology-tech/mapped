"use client";

/**
 * You Tab — your birth chart, all placements, and interpretations.
 *
 * Loads chart data from sessionStorage (after first calculation)
 * or from Supabase (if the user is logged in and has a saved chart).
 * Placements expand inline as accordions showing Dolly's interpretations.
 *
 * Now includes: Chart Ruler section, Stellium detection, and
 * Contradiction warnings for conflicting placements.
 */

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import ChartWheel, { SIGN_NAMES } from "@/components/ChartWheel";
import ChartWheelStar from "@/components/ChartWheelStar";
// Interpretations removed — Big 3 section no longer shown
import PlacementAccordion from "@/components/PlacementAccordion";
import InfoTip from "@/components/InfoTip";
import ShareCard from "@/components/ShareCard";
import { getGlossaryEntry } from "@/lib/glossary";
import { supabase } from "@/lib/supabase";
import { calculateChart } from "@/lib/astro/calculateChart";
import { getMeanLilithData } from "@/lib/astro/lilithClient";
import { SIGN_FULL } from "@/lib/knowledge";
import { getChartRuler } from "@/lib/chartRuler";
import { getSectLight, getLordOfTheYear, type SectLightInfo, type LordOfTheYearInfo } from "@/lib/rulers";
import { detectContradictions, detectStelliums, type Contradiction, type Stellium } from "@/lib/contradictions";
import { analyzeChart, type ChartAnalysis } from "@/lib/chartAnalysis";
import ChartInsightsPanel from "@/components/ChartInsightsPanel";

interface Planet {
  name: string;
  sign: string;
  signNum: number;
  position: number;
  absPosition: number;
  house: string | null;
  retrograde: boolean;
}

interface House {
  number: number;
  sign: string;
  signNum: number;
  position: number;
  absPosition: number;
}

interface RisingCusp {
  current: string;
  alternate: string;
  position: number;
  message: string;
}

interface ChartData {
  name: string;
  birthDate: string;
  birthTime: string;
  unknownTime: boolean;
  cityName: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  bigThree: { sun: string; moon: string; rising: string };
  planets: Planet[];
  houses: House[];
  aspects: Array<{
    p1Name: string;
    p2Name: string;
    aspect: string;
    orbit: number;
    aspectDegrees: number;
  }>;
  risingCusp?: RisingCusp | null;
  specialPoints?: Array<{
    name: string;
    sign: string;
    signNum: number;
    position: number;
    absPosition: number;
    house: string | null;
    retrograde: boolean;
  }>;
  midheaven?: {
    sign: string;
    signNum: number;
    position: number;
    absPosition: number;
  } | null;
}

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: "\u2609", Moon: "\u263D", Mercury: "\u263F", Venus: "\u2640",
  Mars: "\u2642", Jupiter: "\u2643", Saturn: "\u2644", Uranus: "\u2645",
  Neptune: "\u2646", Pluto: "\u2647",
};

const MC_DESCRIPTIONS: Record<string, { summary: string; career: string; shadow: string; advice: string }> = {
  Ari: { summary: "You're meant to be known for being first — a pioneer, an initiator, someone who starts things nobody else has the nerve to start. Your career thrives when you're leading, competing, or breaking new ground. Authority that tries to slow you down will always feel suffocating.", career: "Entrepreneurship, athletics, emergency services, surgery, military leadership, any field where you're the one making the first call. You need autonomy or you wilt. Roles that let you start things from scratch are where you shine brightest.", shadow: "Burning bridges by moving too fast, alienating collaborators with your impatience, or job-hopping before anything has time to grow. Your reputation can swing from 'trailblazer' to 'loose cannon' if you don't learn when to slow down.", advice: "Build something you'd be proud to put your name on. Channel your competitive fire into one thing at a time. You don't need to fight everyone — just the battles that actually matter to your legacy." },
  Tau: { summary: "You're meant to be known for building things of lasting value. Your career thrives when it involves beauty, resources, or tangible results. People trust your reliability and taste. Slow, steady career growth suits you better than overnight success.", career: "Finance, real estate, food and hospitality, luxury goods, agriculture, music, interior design — anything where you can build something beautiful and enduring. You're the person who makes things feel substantial and worth investing in.", shadow: "Getting so comfortable in a role that you stop growing. Resisting necessary career pivots because the unknown terrifies you. Staying in a well-paying job you hate because it funds the lifestyle you need.", advice: "Your career isn't a sprint — it's a vineyard. Plant now, tend patiently, and trust that compounding effort always pays off. Don't let comfort become the ceiling on your ambition." },
  Gem: { summary: "You're meant to be known for your mind — communication, ideas, versatility. Your career thrives when it involves writing, speaking, teaching, or connecting people and ideas. You may have multiple career paths and that's by design.", career: "Journalism, teaching, marketing, social media, translation, sales, podcasting, consulting — anything that lets you use your voice and make connections. You're the bridge between people, ideas, and industries.", shadow: "Spreading yourself so thin that you become a jack of all trades and master of none. Starting projects you don't finish. Being perceived as flaky or unreliable when you're actually just bored.", advice: "Your versatility is a feature, not a bug. But pick two or three lanes and go deep. The world needs your ideas packaged into something tangible — not just floating in conversation." },
  Can: { summary: "You're meant to be known for nurturing and protecting. Your career thrives when it involves caring for others, creating safe spaces, or building something that feels like home. Your public reputation is warm, trustworthy, and emotionally intelligent.", career: "Healthcare, therapy, education, real estate, food service, childcare, social work, hospitality — anywhere people need to feel held and safe. You build loyalty that money can't buy.", shadow: "Taking on everyone's emotions at work until you're burned out. Struggling to separate personal feelings from professional decisions. Avoiding leadership because vulnerability feels too exposed in public.", advice: "Your emotional intelligence is a career superpower — not a weakness. Lead with it. Build teams that feel like family, and people will follow you anywhere." },
  Leo: { summary: "You're meant to be known for your creative vision and leadership. Your career thrives when you're visible, expressive, and in charge of something that matters. You need recognition to stay motivated — a behind-the-scenes role will drain you.", career: "Entertainment, fashion, teaching, politics, creative direction, public speaking, management, luxury brands — anywhere you can put your stamp on something and be seen doing it. You're a natural on stage, literal or figurative.", shadow: "Needing applause so badly that you can't handle criticism. Dominating collaborative environments. Burning out because you can't delegate — nobody does it as well as you, right?", advice: "Your light isn't diminished by sharing the spotlight. The best Leo MC legacy isn't being the star — it's being the one who made everyone else shine brighter too." },
  Vir: { summary: "You're meant to be known for excellence, precision, and genuine competence. Your career thrives when it involves problem-solving, analysis, health, or service. People respect your work ethic and your eye for detail.", career: "Healthcare, data analysis, editing, nutrition, veterinary science, quality assurance, accounting, research — any field that rewards doing things right instead of doing them loudly. You're the person they call when it actually has to work.", shadow: "Perfectionism that paralyzes you from shipping anything. Underselling your accomplishments because nothing feels good enough. Becoming the office workhorse while others take credit.", advice: "Your standards are a gift. But done is better than perfect, and you deserve to be recognized for the work you do. Stop waiting until it's flawless to put your name on it." },
  Lib: { summary: "You're meant to be known for bringing people together and creating beauty. Your career thrives in partnerships, diplomacy, design, or justice. Your public image is charming and balanced — people see you as fair and aesthetically minded.", career: "Law, mediation, interior design, fashion, event planning, public relations, couples therapy, art curation — anywhere that needs someone to make things beautiful and fair simultaneously.", shadow: "Avoiding necessary conflict until it explodes. Being so focused on what others want that you lose your own professional identity. Choosing the pretty option over the right one.", advice: "Your gift for harmony is rare. Use it strategically — the world needs people who can hold opposing sides together. Just don't lose yourself in the middle." },
  Sco: { summary: "You're meant to be known for depth, transformation, and fearless truth-telling. Your career thrives when it involves research, psychology, investigation, or anything that requires seeing what others can't. Your public presence is magnetic and intense.", career: "Psychology, forensics, surgery, investigative journalism, crisis management, finance, hospice care, sex therapy — anywhere that requires going into the dark places other people avoid.", shadow: "Power struggles at work that consume you. Being so intense that colleagues find you intimidating. Holding grudges that torpedo professional relationships.", advice: "You see what others refuse to look at — that's your edge. Channel your intensity into transformation, not control. The career that makes you confront death, power, or hidden truth is the one that makes you feel alive." },
  Sag: { summary: "You're meant to be known for your vision, wisdom, and expansive worldview. Your career thrives in education, travel, publishing, philosophy, or anything that broadens horizons. People see you as inspiring and optimistic.", career: "Higher education, publishing, travel industry, international business, coaching, motivational speaking, religion, outdoor adventure — anything that lets you teach, explore, or expand someone's world.", shadow: "Overpromising and underdelivering because you got excited about the next thing. Being perceived as preachy or know-it-all. Resisting the boring operational work that actually makes visions real.", advice: "Your optimism is contagious — but pair it with follow-through. The teacher who changes lives isn't the one with the most ideas; it's the one who shows up every day." },
  Cap: { summary: "You're meant to be known for building something substantial and lasting. Your career is the backbone of your identity — you take your professional reputation extremely seriously. Authority, structure, and long-term achievement define your public life. You were built for leadership that earns respect over time.", career: "Corporate leadership, law, architecture, government, banking, engineering, anything with a clear hierarchy where hard work is rewarded with increasing authority. You're built for institutions and legacies.", shadow: "Workaholism that destroys your personal life. Measuring your worth entirely by your title. Being so focused on climbing that you forget to enjoy the view.", advice: "You'll get to the top — that was never in question. The real question is whether you'll have anyone left beside you when you arrive. Build the career AND the life." },
  Aqu: { summary: "You're meant to be known for innovation and doing things differently. Your career thrives when it involves technology, social change, community building, or disrupting outdated systems. People see you as ahead of your time.", career: "Tech, nonprofit leadership, scientific research, activism, aerospace, UX design, community organizing — any field that lets you reimagine how things are done and build something the future needs.", shadow: "Being so unconventional that no one takes you seriously. Alienating the very people you're trying to help because you refuse to play the game. Intellectualizing problems instead of solving them.", advice: "You're here to change systems, not just critique them. Find the institution most in need of disruption and plant yourself there. Your weirdness is your resume." },
  Pis: { summary: "You're meant to be known for your compassion, creativity, and spiritual depth. Your career thrives in art, healing, music, film, or any field that requires imagination and empathy. Your public image has an ethereal, otherworldly quality.", career: "Music, film, therapy, spiritual work, photography, hospice care, poetry, dance, nonprofit work — anywhere the currency is feeling, not logic. You're the artist, the healer, the one who makes people cry in a good way.", shadow: "Escapism that looks like a career crisis. Difficulty with the business side of your art. Absorbing other people's energy until you can't function in professional settings.", advice: "Your sensitivity is your career superpower — but you need structure to support it. Find a container for your gifts. The world needs what you make, but it needs you to show up consistently to receive it." }
};

const CHIRON_DESCRIPTIONS: Record<string, { wound: string; patterns: string; healing: string; advice: string }> = {
  Ari: { wound: "Your deepest wound is around your right to exist, to take up space, to assert yourself. At some point, being bold or putting yourself first was punished or shamed. You learned that wanting things for yourself was selfish, so you either overcompensate with aggression or shrink back entirely.", patterns: "You might swing between being overly assertive and completely passive. Starting things feels terrifying even though you're great at it. You may let others go first, speak first, take credit first — then resent them for it. Physical vitality can be an issue; headaches, jaw tension, or injuries to the head and face.", healing: "You become the person who gives others permission to be themselves unapologetically. Your courage in the face of self-doubt inspires people more than you know. The more you practice saying 'I want this' without apology, the more your wound becomes your medicine.", advice: "Start before you're ready. Speak before you're asked. Take up space before it's offered. Every time you choose yourself, you heal a little more. You don't need permission to exist loudly." },
  Tau: { wound: "Your deepest wound is around self-worth, security, and feeling like you're enough. Material stability may have been unreliable growing up, or your value was tied to what you produced. Somewhere you learned that love is conditional on what you provide.", patterns: "You may hoard resources, overwork to feel secure, or stay in situations that are stable but soul-crushing. Body image issues are common. You might overspend to soothe yourself or undercharge because you don't believe your work is worth more.", healing: "You help others find unshakeable self-worth that doesn't depend on external validation. You teach people that they are enough without the title, the body, the bank account. Your presence alone makes others feel grounded.", advice: "Practice receiving without earning it first. Let someone pay, let someone compliment you, let yourself rest without calling it lazy. Your worth was never up for negotiation — you just forgot." },
  Gem: { wound: "Your deepest wound is around your voice — being heard, being understood, being believed. Communication may have been dismissed or your intelligence questioned early on. You learned that your words don't matter, or worse, that they're dangerous.", patterns: "You might talk too much to overcompensate or go silent in the moments that matter most. You second-guess every word. You may have been the sibling who was ignored, the student who was told they were 'too much.' Learning disabilities or speech issues may have been part of your early story.", healing: "You become an extraordinary communicator who helps others find and trust their own voice. You're drawn to writing, teaching, or mentoring because you know what it's like to not be heard. Your words carry weight precisely because you earned them through silence.", advice: "Say the thing you're afraid to say. Write the piece you think nobody will read. Your voice is the exact medicine someone else needs — and using it is how you heal yourself." },
  Can: { wound: "Your deepest wound is around belonging, family, and feeling safe enough to be vulnerable. Home may have been unstable or emotionally unpredictable. You learned early that the people who should protect you couldn't, or wouldn't.", patterns: "You might mother everyone while secretly starving for nurturing yourself. You attract people who need caretaking but can't return it. You may have a complicated relationship with your actual mother or maternal figures. Stomach issues, emotional eating, and difficulty feeling 'at home' anywhere are common.", healing: "You create the emotional safety for others that you craved — you become the home people never had. Your empathy is hard-won and deeply real. People feel held by you in a way that transforms them.", advice: "Let yourself be taken care of. You don't always have to be the strong one. The home you're looking for isn't a place — it's the moment you stop performing strength and let someone see the real you." },
  Leo: { wound: "Your deepest wound is around being seen, celebrated, and creatively expressed. Your need for recognition may have been shamed as vanity, or your creative gifts were dismissed. You learned that wanting attention means you're self-centered.", patterns: "You might dim your light to make others comfortable, or swing into desperate attention-seeking. Creative blocks are your Chiron calling card — you have enormous creative potential but a voice in your head says it's not good enough. You may feel invisible in groups even when you're the most talented person in the room.", healing: "You help others shine without shame and give them the spotlight you were denied. You're the teacher, director, or mentor who sees someone's gift and says 'this matters — show the world.' Your generosity with praise heals because you know what it costs to never receive it.", advice: "Create without waiting for permission. Your art, your expression, your joy — none of it needs to be validated before it's valuable. The spotlight isn't vanity; for you, it's oxygen." },
  Vir: { wound: "Your deepest wound is around feeling flawed, imperfect, or never good enough. Criticism may have been constant, or you internalized the message that your best was never sufficient. Perfection became your armor against rejection.", patterns: "You critique yourself more harshly than anyone else ever could. You may have anxiety around health, cleanliness, or order. You apologize for things that aren't your fault. Digestive issues and nervous system problems are common. You might be drawn to self-improvement but never feel improved.", healing: "You help others see their worth beyond their flaws and find wholeness in imperfection. Your eye for what needs fixing becomes gentle and constructive rather than critical. People come to you because you see their potential without judgment.", advice: "You are not a project to be completed. The imperfections you're trying to fix are the most human parts of you. Practice saying 'this is good enough' and meaning it — because it is, and so are you." },
  Lib: { wound: "Your deepest wound is around relationships — rejection, imbalance, or losing yourself in others. You may have learned early that love required sacrificing your own needs. Harmony became more important than honesty.", patterns: "You attract partnerships where you give 80% and receive 20%. You may struggle to be alone, jumping from relationship to relationship because solitude feels like proof that you're unlovable. Codependency patterns run deep. You might avoid conflict so aggressively that you lose yourself.", healing: "You become a master of healthy relating, helping others build partnerships that honor both people. Your understanding of relationship dynamics is profound because you've lived the imbalance. You teach people that love doesn't require losing yourself.", advice: "The relationship that heals you is the one with yourself. Practice having needs, voicing them, and walking away from anyone who treats that as a problem. You don't need a partner to be whole — you need to know that first." },
  Sco: { wound: "Your deepest wound involves trust, betrayal, power, or loss. Something was taken from you — innocence, control, safety — in a way that cut deep. You learned that vulnerability is dangerous and that people will use your openness against you.", patterns: "You may test people's loyalty obsessively or refuse to let anyone close enough to hurt you again. Power dynamics in relationships are a recurring theme — you're either controlling or being controlled. You might be drawn to crisis, trauma work, or intensity because normal life feels too quiet.", healing: "You become fearless about emotional truth and help others face their own shadows without flinching. Your capacity to sit with darkness — grief, rage, betrayal — without running makes you an extraordinary healer, therapist, or guide.", advice: "The trust you're afraid to give is the exact thing that sets you free. Not everyone will betray you. Let one person in — all the way — and see what happens. Your power isn't in control; it's in surrender." },
  Sag: { wound: "Your deepest wound is around meaning, belief, and feeling like an outsider. Your worldview may have been invalidated, or you were made to feel foolish for your beliefs and dreams. You learned that hope is naive and vision is impractical.", patterns: "You may cycle between blind optimism and crushing disillusionment. Foreign cultures or philosophies attract you because you felt like a stranger in your own. You might preach what you haven't practiced or avoid commitment to any single belief system because the last one failed you.", healing: "You help others find their own truth and give them permission to believe in something bigger. Your faith, once healed, is the kind that moves mountains — not because it's naive, but because it survived the fire.", advice: "Believe in something again. Not blindly — but fiercely. The meaning you're searching for isn't in another country or another book. It's in the life you're already living, waiting for you to stop running long enough to see it." },
  Cap: { wound: "Your deepest wound is around achievement, authority, and the fear of failure. You may have been given too much responsibility too young, or success always came with strings attached. You learned that your worth is measured by your output.", patterns: "You work harder than everyone but feel like a fraud. Authority figures trigger you — you either resent them or desperately seek their approval. You may have had to be the 'adult' as a child. Bone and joint issues, teeth problems, and chronic tension from carrying too much are common.", healing: "You redefine success for others and show them that worth isn't measured by productivity alone. Your hard-won wisdom about achievement becomes gentle mentorship that helps people build careers without losing their souls.", advice: "Rest is not failure. Take the vacation, leave the office, say no to the extra project. The empire you're building means nothing if you're too exhausted to enjoy it. You've proven yourself enough — now prove that you believe it." },
  Aqu: { wound: "Your deepest wound is around belonging and being different. You may have felt like an outsider, too weird, or rejected by the group for being yourself. You learned that fitting in requires performing a version of yourself that isn't real.", patterns: "You might hold people at arm's length while desperately wanting connection. You intellectualize emotions because feeling them is too vulnerable. Group dynamics can trigger intense anxiety. You may reject communities before they can reject you.", healing: "You create spaces where misfits belong and show others that their uniqueness is their greatest strength. You're the one who builds the community that didn't exist when you needed it. Your outsider perspective becomes visionary leadership.", advice: "You don't need to earn belonging by being useful to the group. You belong because you exist. Let yourself need people — not just ideas, not just causes — actual humans who see the real you and stay." },
  Pis: { wound: "Your deepest wound involves boundaries, overwhelm, and the pain of feeling everything. You may have been told you're too sensitive, too much, or not tough enough. You learned that the world is too harsh for someone like you.", patterns: "You may use substances, fantasy, or dissociation to escape the intensity of being alive. Boundaries are nearly impossible — other people's pain becomes yours. You attract people who need saving because the role of martyr feels familiar. Sleep issues, immune system problems, and mysterious ailments are common.", healing: "You validate others' sensitivity as strength and show that empathy is a superpower, not a weakness. Your ability to feel what others feel makes you an extraordinary artist, healer, or spiritual guide. Your compassion is unlimited once you learn to protect it.", advice: "Your sensitivity is not a flaw to be toughened out of — it's a gift to be managed. Build the boundaries you need so you can keep your heart open without drowning. The world needs what you feel; it just doesn't need you to sacrifice yourself to feel it." }
};

const NORTH_NODE_DESCRIPTIONS: Record<string, { direction: string; comfort: string; patterns: string; advice: string }> = {
  Ari: { direction: "You're growing toward independence, courage, and putting yourself first. Your soul is learning to initiate, to lead, to say 'I need this' without apology. This is the lifetime where you stop waiting for permission and start creating your own path.", comfort: "Your South Node in Libra means you default to people-pleasing, partnership, and avoiding conflict. You came into this life already knowing how to compromise, mediate, and put others first. That skill isn't going anywhere — but it's no longer your growth edge.", patterns: "You might stay in relationships too long because leaving feels selfish. You ask everyone's opinion before making decisions. You avoid conflict even when it costs you your self-respect. You've been the peacekeeper so long you've forgotten what you actually want.", advice: "Take the solo risk. Be selfish sometimes. You've already mastered compromise — now master self-advocacy. The most loving thing you can do for the people around you is become a whole person on your own." },
  Tau: { direction: "You're growing toward stability, self-worth, and building something tangible. Your soul is learning that you are enough without the crisis, the intensity, the constant transformation. Peace is the destination, not a layover.", comfort: "Your South Node in Scorpio means you default to intensity, crisis, and emotional extremes. You came in knowing how to survive, how to transform, how to go to the darkest places. That depth isn't wasted — but you don't have to live there.", patterns: "You create chaos to feel alive. Calm relationships bore you. You mistake drama for passion and peace for complacency. You might sabotage good things because they feel 'too easy' or suspicious. You're addicted to transformation even when nothing needs to change.", advice: "This lifetime is about learning that peace isn't boring — it's the foundation for everything good. Simplify. Enjoy what you have. Stop creating drama to feel alive. The garden you tend quietly is worth more than the fire you keep restarting." },
  Gem: { direction: "You're growing toward curiosity, communication, and staying open to new information. Your soul is learning to listen, to ask questions, to admit when it doesn't know. Intellectual humility is your superpower in this lifetime.", comfort: "Your South Node in Sagittarius means you default to big-picture thinking, dogma, and assuming you already know. You came in with strong beliefs, bold opinions, and a tendency to preach. That conviction served you before — now it's time to learn.", patterns: "You lecture when you should listen. You dismiss details as beneath you. You might be drawn to philosophy, religion, or travel as a way to confirm what you already believe instead of discovering something new. You get frustrated when people don't see the 'big picture' you see.", advice: "This lifetime is about listening more than preaching. Ask questions. Stay a student. The details you've been dismissing contain the wisdom you need. The smartest thing you can say is 'I don't know — tell me more.'" },
  Can: { direction: "You're growing toward emotional vulnerability, nurturing, and creating genuine belonging. Your soul is learning that feelings aren't liabilities — they're data, they're power, they're the whole point of being human.", comfort: "Your South Node in Capricorn means you default to achievement, control, and emotional self-sufficiency. You came in knowing how to be responsible, disciplined, and strong. You can handle anything — but handling everything alone isn't the goal anymore.", patterns: "You work when you should rest. You achieve when you should feel. You keep people at arm's length because needing them feels weak. You might have a complicated relationship with your family or avoid building one because it requires too much vulnerability.", advice: "This lifetime is about learning that your feelings aren't weaknesses — they're your greatest source of power. Let people in. Build a home, not just a resume. The career will always be there; the connection won't wait forever." },
  Leo: { direction: "You're growing toward creative self-expression, joy, and the courage to be seen. Your soul is learning to step out of the crowd and say 'this is mine, I made it, and I'm proud.' Personal passion is your curriculum.", comfort: "Your South Node in Aquarius means you default to intellectualizing, hiding in groups, and playing it cool. You came in knowing how to think, analyze, and serve the collective. But you've been using 'the group' as a place to hide from your own heart.", patterns: "You stay in the audience when you should be on stage. You rationalize away your desire for recognition. You might pour yourself into causes or communities while neglecting your own creative fire. When someone compliments you, you deflect.", advice: "This lifetime is about stepping into the spotlight and letting your heart lead. Create something personal. Be generous with your warmth. Stop theorizing and start feeling. The world doesn't need another analyst — it needs your art." },
  Vir: { direction: "You're growing toward practical service, discernment, and mastering the details. Your soul is learning that showing up for the small, unglamorous work is the most spiritual thing you can do. Precision is your prayer.", comfort: "Your South Node in Pisces means you default to escapism, fantasy, and avoiding the mundane. You came in with enormous intuition, compassion, and spiritual sensitivity. But you've been using those gifts to float above reality instead of engaging with it.", patterns: "You avoid routine, structure, and anything that feels too 'boring.' You might use meditation, substances, or fantasy to check out of practical responsibilities. You have beautiful dreams but struggle to turn them into anything concrete. You feel everything but organize nothing.", advice: "This lifetime is about showing up for the small, unglamorous work that actually changes things. Get organized. Be helpful. Ground your dreams in reality. The most spiritual thing you can do right now is make a to-do list and finish it." },
  Lib: { direction: "You're growing toward partnership, diplomacy, and the art of genuine compromise. Your soul is learning that 'we' can be more powerful than 'I' without losing yourself in the process.", comfort: "Your South Node in Aries means you default to independence, impatience, and going it alone. You came in as a fighter, a pioneer, someone who charges ahead without looking back. That courage isn't going anywhere — but the lone wolf act has run its course.", patterns: "You push people away when they get too close. You make decisions without consulting anyone, then wonder why nobody supports you. You might start fights to maintain distance. Partnerships feel like constraints instead of collaborations.", advice: "This lifetime is about learning that you're stronger with the right person beside you. Collaborate. Listen. Let someone else lead sometimes. Interdependence isn't weakness — it's the advanced class." },
  Sco: { direction: "You're growing toward emotional depth, intimacy, and transformative vulnerability. Your soul is learning that the deepest power isn't in what you own — it's in what you're willing to let go of.", comfort: "Your South Node in Taurus means you default to comfort, security, and resisting change. You came in knowing how to build stability, accumulate resources, and plant roots. But you've been using that safety as a bunker against transformation.", patterns: "You cling to possessions, relationships, and habits past their expiration date. You avoid emotional intensity because it threatens your stability. You might choose financial security over passion every time. Change feels like loss, and loss feels unbearable.", advice: "This lifetime is about letting go of what feels safe to find what feels true. Merge with someone. Share your resources. Let things die so new things can grow. The comfort zone you're protecting is the cage you're living in." },
  Sag: { direction: "You're growing toward big-picture wisdom, adventure, and faith in the unknown. Your soul is learning to zoom out, to see the meaning behind the data, and to trust something bigger than your own mind.", comfort: "Your South Node in Gemini means you default to information-gathering, overthinking, and staying safely in your head. You came in as a communicator, a connector, a gatherer of facts. But you've been using information as a substitute for wisdom.", patterns: "You research instead of committing. You keep your options open so long that you never choose anything. You might collect degrees, read compulsively, or stay in your head to avoid the vulnerability of actually believing in something.", advice: "This lifetime is about committing to a belief and following it. Stop researching and start exploring. Trade facts for meaning. The answer isn't in the next book — it's in the leap you're afraid to take." },
  Cap: { direction: "You're growing toward ambition, discipline, and building something that matters in the world. Your soul is learning to step into authority and claim the public role it's been avoiding.", comfort: "Your South Node in Cancer means you default to emotional comfort, family dependency, and playing it safe. You came in knowing how to nurture, to create belonging, to make everyone feel at home. But you've been hiding in the nest.", patterns: "You put family obligations before your own ambitions. You stay small because success might change your relationships. You might use emotional needs as an excuse to avoid the harder work of building something in the world. Comfort feels non-negotiable.", advice: "This lifetime is about stepping into authority and taking your public role seriously. Build the career. Accept the responsibility. You're ready for more than you think. The family that truly loves you will celebrate your success, not resent it." },
  Aqu: { direction: "You're growing toward community, innovation, and contributing to something bigger than yourself. Your soul is learning that individual brilliance means nothing if it doesn't serve the collective.", comfort: "Your South Node in Leo means you default to personal drama, needing the spotlight, and making everything about you. You came in as a performer, a creative force, someone who knows how to command attention. That charisma isn't going anywhere — but the solo act is over.", patterns: "You make group situations about yourself. You struggle when you're not the center of attention. You might choose personal glory over the greater good. Your creative gifts are extraordinary but they stay self-serving.", advice: "This lifetime is about channeling your gifts toward the group. Find your cause. Join the movement. Your individuality matters more when it serves others. The standing ovation you're looking for comes from lifting everyone, not just yourself." },
  Pis: { direction: "You're growing toward spiritual surrender, compassion, and trusting the flow of life. Your soul is learning that some things can't be analyzed, optimized, or fixed — they can only be felt.", comfort: "Your South Node in Virgo means you default to analysis, control, and fixing everything. You came in as a problem-solver, an organizer, someone with impeccable standards. But you've been using perfection as a shield against the messiness of being human.", patterns: "You overanalyze your feelings instead of feeling them. You try to fix people instead of holding space for their pain. You might have anxiety around chaos, mess, or anything that can't be categorized. Spirituality feels uncomfortable because it can't be fact-checked.", advice: "This lifetime is about releasing the need to have all the answers. Meditate. Create art. Trust your intuition over your spreadsheets. Some things can't be optimized — they can only be felt. Let the mystery win." }
};

const RISING_DESCRIPTIONS: Record<string, { summary: string; appearance: string; relationships: string; shadow: string; advice: string }> = {
  Ari: { summary: "You walk into a room and people notice. Aries rising gives you a sharp, direct energy — you lead with action, not explanation. First impressions of you: bold, confident, maybe a little intimidating. You process life by doing, and hesitation feels like suffocation. Your body often moves before your mind catches up, and that's by design.", appearance: "Strong brow, athletic build or wiry energy, often a distinctive forehead or scar on the face. You look like someone who's about to do something. Your resting face might read as intense or confrontational even when you're relaxed. You tend to walk fast and gesture sharply.", relationships: "People either love your intensity or feel challenged by it. You come on strong in first meetings — which attracts bold people and intimidates cautious ones. You need partners and friends who can keep up, not ones who ask you to slow down. First dates with you are never boring.", shadow: "Impatience that reads as rudeness. Steamrolling people without realizing it. Starting conflicts because stillness feels like death. You can burn through relationships and opportunities by refusing to pause.", advice: "You're here to initiate — that's your cosmic job. But learn the difference between leading and bulldozing. The bravest thing an Aries rising can do isn't charge forward. It's stand still." },
  Tau: { summary: "You move through the world with a grounded, magnetic calm that draws people in. Taurus rising gives you a sensual, steady presence — people feel safe around you. First impressions: warm, attractive, unhurried. You need beauty, comfort, and stability in your environment or you can't think straight.", appearance: "Often strikingly attractive in a classic, earthy way. Strong neck and shoulders, soft skin, full lips. You dress well — nothing flashy, but everything quality. Your voice is usually your most notable feature: low, melodic, the kind people want to keep listening to.", relationships: "People gravitate to you because you feel like safety. You're the friend everyone wants to sit next to, the partner who makes chaos feel manageable. But you move slowly in relationships, and pushing you faster will backfire. Once you commit, you're immovable — for better and worse.", shadow: "Stubbornness that becomes self-sabotage. Staying in situations, jobs, and relationships way past their expiration because change terrifies you. Comfort-seeking that becomes avoidance. You can mistake stagnation for stability.", advice: "Change is hard for you, but once you decide to move, nothing stops you. Your body is your anchor — trust what it tells you. If your gut says go, go. The stability you need is inside you, not in your circumstances." },
  Gem: { summary: "You're the person everyone wants to talk to. Gemini rising gives you a quick, curious, adaptable energy that makes you endlessly interesting. First impressions: witty, youthful, a little scattered. You process life through conversation and information — you need to talk it out, read about it, ask questions.", appearance: "Animated face, expressive hands, youthful features regardless of age. You probably look younger than you are. Your eyes move quickly, always scanning. You might change your hair, style, or aesthetic frequently because one look could never capture all of you.", relationships: "You need mental stimulation in every relationship or you check out. You're the friend who always has a story, always knows what's happening, always has a recommendation. But you can be hard to pin down — not because you're flaky, but because you're genuinely pulled in twelve directions.", shadow: "Boredom is your enemy. You may come across as lighter than you actually are, which is both a gift and a frustration. People assume you're not deep because you're quick. Anxiety can spiral because your mind never stops. Gossip can become a coping mechanism.", advice: "Depth and breadth aren't opposites — you can have both. Pick the conversations, people, and interests that actually feed you, and let the rest go. Your mind is a superpower; just make sure it serves you instead of exhausting you." },
  Can: { summary: "You feel everything in a room the moment you walk in. Cancer rising gives you a soft, nurturing presence that makes people want to open up to you. First impressions: approachable, warm, emotionally intelligent. Your mood shifts with your environment, and you need to feel safe before you can be yourself.", appearance: "Round, soft features — especially around the face and eyes. You might have a notably warm or gentle expression. Moon-like quality to your face. Your body responds to emotions: bloating, flushing, tears that come easily. You probably look like someone people want to hug.", relationships: "Home isn't just a place — it's a state of being you carry everywhere. People underestimate your strength because of your softness. You attract people who need mothering, which is fine until it isn't. Your inner circle is small and fiercely protected — outsiders don't get in easily.", shadow: "Moodiness that controls your whole day. Taking everything personally. Retreating into your shell instead of communicating what's wrong. You can become so self-protective that you push away the very love you're craving.", advice: "Your sensitivity is strength, not weakness. But learn to feel your feelings without becoming them. You can hold space for others AND have boundaries. The people who matter will respect your shell — and wait for you to come out." },
  Leo: { summary: "You light up a room whether you're trying to or not. Leo rising gives you a warm, magnetic, creative presence that commands attention. First impressions: generous, dramatic, impossible to ignore. You need to be seen and appreciated — not out of ego, but because visibility is how you process your identity.", appearance: "Great hair — seriously. Strong features, warm coloring, a physical presence that takes up space in the best way. You walk with your chest up, your shoulders back. Even in casual clothes you look like someone. Your smile is your signature.", relationships: "Your hair, your style, your laugh — everything about you is expressive. You're the most loyal friend and the most generous partner when you feel appreciated. But withdraw attention and you'll spiral. You need people who celebrate you, not ones who compete with you or dim your light.", shadow: "The constant need for validation can become exhausting — for you and everyone around you. Dramatic reactions to minor slights. Struggling to be happy for others when you feel unseen. Jealousy disguised as pride.", advice: "You're here to create and to inspire. But your light comes from within, not from applause. Learn to shine for yourself first. The attention you give yourself is the foundation for everything else." },
  Vir: { summary: "You notice what everyone else misses. Virgo rising gives you a precise, thoughtful, quietly competent energy. First impressions: put-together, intelligent, maybe a little reserved. You process life through analysis — you need to understand before you can relax.", appearance: "Clean, put-together appearance — you look like you have your life together even when you don't. Delicate features, often youthful. Your hands are notable, expressive, always doing something. Neat handwriting. You probably have a very specific morning routine.", relationships: "You show love through acts of service — fixing things, remembering details, anticipating needs before they're voiced. You're the friend who texts 'did you eat today?' Your body is sensitive and your routines matter more than people realize. You come across as modest, but underneath that is a mind that's always working.", shadow: "Overthinking that paralyzes you. Criticizing yourself and others as a defense mechanism. Health anxiety. Difficulty relaxing because there's always something that could be improved. Your helpfulness can become controlling.", advice: "You come across as modest, but underneath that is a mind that's always working. Use it to help — not to judge. And please apply the same gentleness you give others to yourself. You deserve your own compassion." },
  Lib: { summary: "You make everything around you more beautiful just by being there. Libra rising gives you a charming, graceful, socially attuned presence. First impressions: attractive, diplomatic, easy to be around. You process life through relationships — other people are your mirror.", appearance: "Symmetrical features, dimples, an effortless attractiveness that has nothing to do with effort. You look approachable. Your aesthetic is balanced and intentional — you notice clashing colors the way others notice loud noises. You probably have a signature style that looks casual but isn't.", relationships: "You need harmony in your environment, and conflict physically unsettles you. You're the mediator, the peacekeeper, the one who makes group dynamics smooth. But you can lose yourself in who others want you to be. Your best relationships are with people who ask 'what do YOU want?'", shadow: "Your indecisiveness isn't weakness — it's because you genuinely see every side. But it can become paralysis. People-pleasing that erodes your identity. Avoiding conflict until it becomes an explosion. Using charm as armor.", advice: "You don't have to choose between being liked and being honest. The most beautiful thing about you isn't your face or your taste — it's your capacity to see both sides. Now pick one." },
  Sco: { summary: "You walk into a room and people feel it before they see you. Scorpio rising gives you an intense, magnetic, penetrating presence. First impressions: mysterious, powerful, hard to read. You process life through emotional depth — surface-level anything makes you restless.", appearance: "Piercing eyes — that's the trademark. Dark or intense coloring, sharp features, a look that makes people feel seen and slightly exposed. You might have a naturally intimidating resting face. Your gaze holds weight. People notice your eyes before anything else.", relationships: "You're always reading the room, noticing who's lying, who's afraid, who's attracted to you. Trust is everything, and you don't give it easily. You have very few close friends, but the ones you have would walk through fire for you because you'd do the same.", shadow: "Suspicion that poisons good things. Testing people until they fail. Holding grudges that outlast the relationship. You can become so guarded that you create the very loneliness you're trying to avoid.", advice: "Trust is everything, and you don't give it easily — but the wall you built to protect yourself is now the thing keeping love out. Let someone see you. Really see you. The vulnerability won't kill you; the isolation might." },
  Sag: { summary: "You bring the energy wherever you go. Sagittarius rising gives you an enthusiastic, open, adventurous presence that makes people feel optimistic. First impressions: fun, opinionated, restless. You process life through experience and philosophy — you need meaning, not just information.", appearance: "Athletic or tall, often with notable legs or hips. An open, expressive face that's easy to read. You smile big, laugh loud, and gesture expansively. You might have a slightly wild quality — untamed hair, traveled look, the face of someone with stories to tell.", relationships: "Routine bores you, small talk drains you, and you'd rather be somewhere you've never been. You need friends who can keep up with your energy and partners who don't try to cage you. Your honesty is refreshing and occasionally brutal — you don't mean to be blunt, but the truth just comes out.", shadow: "Commitment phobia disguised as freedom. Running from problems instead of facing them. Preachiness that alienates people. You can use adventure as escapism and philosophy as a shield against feeling.", advice: "Your honesty is refreshing and occasionally brutal. The adventure you're searching for isn't always in a new place — sometimes it's in going deeper where you already are. Stay long enough to find out." },
  Cap: { summary: "You carry an authority that goes beyond your years. Capricorn rising gives you a serious, ambitious, composed presence. First impressions: mature, capable, maybe a little intimidating. You process life through structure and achievement — you need to feel like you're building something.", appearance: "Defined bone structure — strong cheekbones, jaw, or brow. You might look older when you're young and younger when you're old. There's a gravity to your face even when you smile. You dress with intention and authority. People assume you're in charge whether you are or not.", relationships: "People respect you before they even know you. You attract people who need structure or leadership. But you can struggle to let your guard down — vulnerability feels like weakness. Your warmest relationships are with people who see past the competence to the person underneath.", shadow: "You age in reverse — life gets lighter and more joyful as you get older. The early years are the hardest. Workaholism, emotional suppression, and measuring every relationship by what it produces. You can become so focused on the climb that you forget to live.", advice: "You've been old your whole life. Give yourself permission to be young now. Play. Be frivolous. The structure you've built can hold the weight of joy — let it in." },
  Aqu: { summary: "You're the person in the room who doesn't quite fit in — and that's your superpower. Aquarius rising gives you an unconventional, intellectual, slightly detached presence. First impressions: unique, friendly but distant, hard to pin down.", appearance: "Something unusual about your appearance — asymmetric features, a unique style, or an overall vibe that's hard to categorize. You might have striking or unusual eyes. You don't look like you're trying to fit in, and that's magnetic. People can't quite figure out your aesthetic.", relationships: "You process life through ideas and ideals — you need to feel like you're contributing to something bigger. People find you fascinating but struggle to get close. That's partly by design. Your best relationships are with people who respect your need for space and share your vision for the world.", shadow: "Emotional detachment disguised as intellectual superiority. Keeping people at arm's length and calling it independence. You can be so focused on humanity that you neglect the actual humans in front of you.", advice: "People find you fascinating but struggle to get close. That's partly by design — and partly fear. The revolution you want to start in the world starts with one honest, vulnerable conversation." },
  Pis: { summary: "You absorb the world like a sponge. Pisces rising gives you a dreamy, empathic, ethereal presence that makes you seem like you're from another dimension. First impressions: gentle, artistic, a little otherworldly. You process life through feeling and intuition — logic alone will never satisfy you.", appearance: "Soft, dreamy eyes — often large or watery. An ethereal quality that's hard to pin down. You might shift how you present depending on who you're with; you're a chameleon without meaning to be. Your face reflects every emotion passing through the room.", relationships: "Boundaries are your biggest lesson because you feel everything around you. You attract people who need saving, which can become a pattern. Your best relationships are with grounded people who protect your energy without dimming your sensitivity. You love deeply and without reservation.", shadow: "Your sensitivity is your greatest gift and your greatest challenge. Escapism through substances, fantasy, or chronic dissociation. Losing yourself in other people's identities. Victim mentality that keeps you from owning your power.", advice: "You don't need to build walls — you need a filter. Learn which feelings are yours and which belong to someone else. Your empathy is a superpower, but only if you protect the person wielding it." }
};

function elementColor(sign: string): string {
  if (["Ari", "Leo", "Sag"].includes(sign)) return "text-terracotta";
  if (["Tau", "Vir", "Cap"].includes(sign)) return "text-sage";
  if (["Gem", "Lib", "Aqu"].includes(sign)) return "text-lavender";
  return "text-lavender-light";
}

// Maps Kerykeion house strings like "Fifth_House" to numbers
function houseToNum(house: string | number | null | undefined): number | null {
  if (house == null) return null;
  if (typeof house === "number") return house >= 1 && house <= 12 ? house : null;
  const map: Record<string, number> = {
    First: 1, Second: 2, Third: 3, Fourth: 4, Fifth: 5, Sixth: 6,
    Seventh: 7, Eighth: 8, Ninth: 9, Tenth: 10, Eleventh: 11, Twelfth: 12,
  };
  const word = String(house).split("_")[0];
  return map[word] || null;
}

const ORDINAL: Record<number, string> = {
  1: "1st", 2: "2nd", 3: "3rd", 4: "4th", 5: "5th", 6: "6th",
  7: "7th", 8: "8th", 9: "9th", 10: "10th", 11: "11th", 12: "12th",
};

const CHIRON_HOUSE: Record<number, string> = {
  1: "Your wound lives in the most visible place possible — your identity, your body, how you show up. You may have been told something was wrong with who you fundamentally are. The healing happens every time you walk into a room as yourself, unedited.",
  2: "Your wound lives in your sense of self-worth and material security. Money, possessions, or your own value may have felt unstable or conditional. The healing happens when you stop earning your worth and start claiming it.",
  3: "Your wound lives in communication, learning, and your relationship with siblings or neighbors. You may have struggled to be heard in your immediate environment. The healing happens through writing, teaching, or finally saying what you were never allowed to say.",
  4: "Your wound lives at the root — home, family, your emotional foundation. The place that should have been safest may have been the source of the most pain. The healing happens when you build the home you never had, for yourself first.",
  5: "Your wound lives in creativity, self-expression, romance, and your relationship with children or your inner child. Joy may have been punished or your creative instincts shut down early. The healing happens when you play, create, and love without calculating the risk.",
  6: "Your wound lives in your daily routines, health, and work habits. You may have a complicated relationship with your body or feel like no matter how hard you work, it's never enough. The healing happens through gentle discipline — service without self-sacrifice.",
  7: "Your wound lives in one-on-one relationships — romantic partners, close friends, business partners. Betrayal, abandonment, or chronic imbalance in partnerships may be a theme. The healing happens when you learn that you can be vulnerable with someone without losing yourself.",
  8: "Your wound lives in the deep end — intimacy, shared resources, power dynamics, loss, and transformation. Trust was likely broken in a way that changed you. The healing happens when you let someone see all of you, including the parts you think are unforgivable.",
  9: "Your wound lives in belief systems, higher education, travel, or religion. Your search for meaning may have been invalidated, or the worldview you were given collapsed. The healing happens when you build your own philosophy from the wreckage of the inherited one.",
  10: "Your wound lives in your career, public image, and relationship with authority. You may fear success as much as failure, or feel like the professional world demands you be someone you're not. The healing happens when you define achievement on your own terms.",
  11: "Your wound lives in community, friendship, and your sense of belonging to a group. You may have been the outsider, the one excluded, or the one who never felt like they fit. The healing happens when you stop trying to belong and start building the community that didn't exist.",
  12: "Your wound lives in the unconscious — hidden, spiritual, and deeply private. You may carry grief or trauma you can't name, inherited pain, or a sense of being lost in something bigger than yourself. The healing happens in solitude, meditation, therapy, or art that pulls from the unseen.",
};

const NODE_HOUSE: Record<number, string> = {
  1: "Your growth direction points to your identity and self-presentation. You're learning to define yourself on your own terms instead of through others. The lesson is radical self-authorship — becoming the person YOU decide to be.",
  2: "Your growth direction points to your values, resources, and self-worth. You're learning to build your own stability instead of relying on others' resources or emotional intensity. The lesson is that what you own and what you're worth are up to you alone.",
  3: "Your growth direction points to communication, learning, and your immediate environment. You're learning to be curious, to ask questions, and to connect locally instead of always reaching for the grand and distant. The lesson is that wisdom lives in the everyday conversation.",
  4: "Your growth direction points to home, family, and emotional roots. You're learning to build a private foundation instead of chasing public achievement. The lesson is that your inner life matters more than your outer reputation.",
  5: "Your growth direction points to creativity, joy, romance, and self-expression. You're learning to step out of the audience and onto the stage. The lesson is that your individual creative fire matters — stop hiding in the group.",
  6: "Your growth direction points to daily work, health, and service. You're learning to show up for the unglamorous routines that actually change your life. The lesson is that spiritual growth means nothing if you can't keep your life running.",
  7: "Your growth direction points to partnership and genuine collaboration. You're learning that interdependence is strength, not weakness. The lesson is letting someone in — really in — and discovering you're better together than alone.",
  8: "Your growth direction points to intimacy, transformation, and shared resources. You're learning to let go of what feels safe in order to find what's true. The lesson is that real power comes from vulnerability, not from what you accumulate.",
  9: "Your growth direction points to higher learning, travel, philosophy, and faith. You're learning to zoom out from the details and commit to a bigger vision. The lesson is that meaning requires a leap — you can't research your way to belief.",
  10: "Your growth direction points to career, public life, and claiming authority. You're learning to step into leadership and take your place in the world. The lesson is that ambition isn't abandoning your roots — it's honoring them by building something that lasts.",
  11: "Your growth direction points to community, innovation, and collective purpose. You're learning to channel your individual gifts toward something bigger than yourself. The lesson is that your uniqueness matters most when it serves others.",
  12: "Your growth direction points to spirituality, surrender, and the unseen. You're learning to trust what can't be measured, to let go of control, and to find peace in the mystery. The lesson is that not everything needs to be fixed — some things just need to be felt.",
};

const LILITH_DESCRIPTIONS: Record<string, { shadow: string; power: string; reclamation: string }> = {
  Ari: {
    shadow: "You were shamed for being too aggressive, too selfish, too loud. Somewhere you learned that wanting things for yourself was dangerous — so you either suppressed your fire or let it burn uncontrollably.",
    power: "Your raw, unapologetic desire to exist on your own terms. When you stop asking permission to take up space, you become magnetic. Your anger isn't a flaw — it's fuel.",
    reclamation: "Practice putting yourself first without guilt. Say 'I want' out loud. Let yourself be the main character. The people who can't handle your fire were never your people.",
  },
  Tau: {
    shadow: "You were made to feel guilty about pleasure, comfort, or wanting beautiful things. Maybe you were told you were too materialistic, too indulgent, too slow. So you either denied yourself or hoarded out of fear.",
    power: "Your sensuality, your relationship with the physical world, and your refusal to rush. You know that the body is wise and pleasure is sacred — not something to earn or apologize for.",
    reclamation: "Let yourself enjoy things fully without justifying it. Touch, taste, rest, beauty — these aren't rewards for productivity. They're your birthright. Build a life that feels as good as it looks.",
  },
  Gem: {
    shadow: "You were told you talk too much, think too fast, or can't be taken seriously. Your curiosity was treated as scattered. Your truth-telling made people uncomfortable, so you learned to filter yourself or stay quiet.",
    power: "Your mind moves like lightning and you see connections others miss. When you stop dumbing yourself down, your words become spells. You can name what everyone else is afraid to say.",
    reclamation: "Stop editing yourself for comfort. Say the thing. Write the thing. Let your mind wander where it wants. The people who call you 'too much' are really saying you make them feel like not enough.",
  },
  Can: {
    shadow: "Your need for emotional safety was used against you. You were called too sensitive, too clingy, too needy. So you either built walls or became the caretaker who never gets taken care of.",
    power: "Your emotional depth is supernatural. You feel what others can't even name. When you stop apologizing for your sensitivity, it becomes your greatest strength — you can hold space that heals people.",
    reclamation: "Let yourself need people. Let yourself be held. Your vulnerability isn't weakness — it's the bravest thing you do. Set boundaries around who gets access to your softness, but never stop being soft.",
  },
  Leo: {
    shadow: "You were shamed for wanting attention, recognition, or admiration. Someone made your light feel like a threat, so you either dimmed yourself or performed constantly to prove you deserved to be seen.",
    power: "Your creative fire and magnetic presence. When you stop performing for approval and start creating for joy, you become impossible to look away from. Your light isn't stealing anyone else's.",
    reclamation: "Create without permission. Be visible without apology. Let yourself be adored. The shame you feel about wanting to be seen is not yours — it was put there by someone who was afraid of their own light.",
  },
  Vir: {
    shadow: "You were criticized relentlessly, so you became your own harshest critic first — that way no one could hurt you worse than you hurt yourself. Your body, your work, your worth were never 'good enough.'",
    power: "Your discernment is razor-sharp and your devotion to craft is unmatched. When you turn that analytical mind toward building instead of destroying yourself, you create things that actually change people's lives.",
    reclamation: "Stop trying to be perfect. Let things be messy and still call them good. Your worth isn't measured by your usefulness. Rest is not laziness. You are allowed to be a work in progress.",
  },
  Lib: {
    shadow: "You were punished for having your own desires, so you became a mirror — reflecting what everyone else wanted to see. You lost yourself in relationships, kept the peace at the cost of your truth.",
    power: "You understand human dynamics at a level most people can't access. When you stop people-pleasing and start choosing yourself, your natural charm becomes a force of nature — not a survival strategy.",
    reclamation: "Disagree out loud. Choose your own preference. Let relationships be disrupted by your honesty. The right people will stay. The ones who only loved your compliance were never loving you.",
  },
  Sco: {
    shadow: "Your intensity scared people. Your emotions were 'too much,' your sexuality was dangerous, your knowing was unsettling. You learned to hide your power or weaponize it before anyone could use it against you.",
    power: "You see through everything and everyone. Your emotional and psychic depth is extraordinary. When you stop fearing your own darkness, you become a force of transformation — alchemizing pain into wisdom.",
    reclamation: "Stop hiding what you know. Let yourself be fully seen in your intensity. Your darkness is not a disease — it's depth. Trust your instincts, even when they make others uncomfortable. Especially then.",
  },
  Sag: {
    shadow: "Your wildness, your beliefs, your need for freedom were treated as irresponsible or dangerous. Someone tried to cage you — intellectually, spiritually, or literally — and part of you is still running from that cage.",
    power: "Your refusal to be confined by anyone's version of truth but your own. When you stop running and start standing in your beliefs, your vision becomes prophetic. You see futures others can't imagine.",
    reclamation: "Believe something unpopular. Go somewhere unfamiliar. Say what you actually think about God, meaning, and purpose. Your restlessness isn't a problem to solve — it's a compass pointing toward freedom.",
  },
  Cap: {
    shadow: "You were forced to grow up too fast, to be responsible before you were ready. Authority figures failed you, so you became your own authority — but the cost was joy, play, and softness.",
    power: "Your endurance and self-discipline are legendary. When you stop punishing yourself with productivity and start building from desire instead of duty, your ambition creates lasting legacy — not just exhaustion.",
    reclamation: "Let yourself be unproductive. Play without purpose. Admit you're tired. Your worth is not your output. You don't need to earn rest, love, or respect — you already deserve them by existing.",
  },
  Aqu: {
    shadow: "Your uniqueness was treated as a threat. You were excluded, ostracized, or made to feel alien for being different. So you either performed normalcy or doubled down on detachment as armor.",
    power: "Your ability to see systems that others are blind to and imagine alternatives that don't exist yet. When you stop performing belonging and start building it on your terms, you become a revolutionary.",
    reclamation: "Stop trying to fit in. Let yourself be the strange one. Your alienation isn't a wound to heal — it's a perspective that the world desperately needs. Build your own community if the existing ones don't fit.",
  },
  Pis: {
    shadow: "Your boundaries were dissolved before you could build them. You absorbed everyone's pain and lost track of where you end and others begin. Your spiritual gifts were dismissed as delusion or weakness.",
    power: "Your connection to the unseen world is real and extraordinary. When you stop drowning in everyone else's emotions and learn to channel that sensitivity, you become a visionary, a healer, a mystic.",
    reclamation: "Your feelings are not illusions. Your dreams are not escapism. Build boundaries not as walls but as containers for your gifts. You are not too much — the world is just not gentle enough for what you carry.",
  },
};

/* ═══════════════════════════════════════════
   Aspect interpretation data
   ═══════════════════════════════════════════ */

const ASPECT_SYMBOLS: Record<string, string> = {
  conjunction: "\u260C",
  opposition: "\u260D",
  trine: "\u25B3",
  square: "\u25A1",
  sextile: "\u2731",
  quintile: "Q",
  "bi-quintile": "bQ",
  "semi-sextile": "\u26BA",
  quincunx: "\u26BB",
  "semi-square": "\u2220",
  sesquiquadrate: "\u2A3E",
};

const ASPECT_TYPE_INFO: Record<string, { label: string; nature: string; color: string; beginnerDesc: string }> = {
  conjunction: { label: "Conjunction", nature: "fusion", color: "text-amber", beginnerDesc: "These two planets are fused together — their energies blend into one. It's intense and amplified, like two voices singing the same note." },
  trine: { label: "Trine", nature: "harmony", color: "text-sage", beginnerDesc: "These two planets flow together effortlessly — a natural gift or talent area. Things here come easy, almost too easy to notice." },
  sextile: { label: "Sextile", nature: "opportunity", color: "text-sage/70", beginnerDesc: "These two planets get along well and create opportunities — but you have to reach for them. Think of it as an open door you still need to walk through." },
  square: { label: "Square", nature: "tension", color: "text-terracotta", beginnerDesc: "These two planets are in conflict — they want different things and create inner tension. It's uncomfortable, but this friction is what drives your biggest growth." },
  opposition: { label: "Opposition", nature: "polarity", color: "text-terracotta/70", beginnerDesc: "These two planets sit on opposite sides, creating a tug-of-war. You might swing between them or project one side onto other people. Balance is the lesson." },
  quintile: { label: "Quintile", nature: "talent", color: "text-lavender", beginnerDesc: "A creative, somewhat rare aspect. These two planets connect through talent and unique expression — something you do that doesn't fit neatly into any category but is distinctly yours." },
  "bi-quintile": { label: "Bi-Quintile", nature: "talent", color: "text-lavender", beginnerDesc: "Like the quintile but deeper — a refined creative gift. These two planets produce something original when they work together. Think of it as a skill nobody taught you." },
  "semi-sextile": { label: "Semi-Sextile", nature: "adjustment", color: "text-lavender-light", beginnerDesc: "These two planets are neighbors that don't quite speak the same language. There's a subtle friction that asks you to make small adjustments — nothing dramatic, but a constant nudge toward integration." },
  quincunx: { label: "Quincunx", nature: "adjustment", color: "text-lavender-light", beginnerDesc: "Also called an inconjunct. These two planets have nothing in common and struggle to relate. It creates a blind spot — something you keep having to recalibrate because it never quite resolves." },
  "semi-square": { label: "Semi-Square", nature: "irritation", color: "text-terracotta/40", beginnerDesc: "A low-grade tension between these two planets — not as dramatic as a square, but a persistent itch. It creates minor frustrations that push you to deal with things you'd rather ignore." },
  sesquiquadrate: { label: "Sesquiquadrate", nature: "irritation", color: "text-terracotta/40", beginnerDesc: "Like a semi-square's older sibling. Persistent agitation between these two planets that builds slowly. It creates situations where you have to confront patterns you've been avoiding." },
};

/** Plain-English descriptions of what each planet governs */
const PLANET_GOVERNS: Record<string, string> = {
  Sun: "your core identity — who you are at your center",
  Moon: "your emotions, instincts, and what makes you feel safe",
  Mercury: "how you think, communicate, and process information",
  Venus: "what you love, value, and find beautiful",
  Mars: "your drive, ambition, anger, and how you take action",
  Jupiter: "where you grow, what you believe, and what brings luck",
  Saturn: "your responsibilities, fears, and where you're tested",
  Uranus: "where you break rules, rebel, and need freedom",
  Neptune: "your imagination, spirituality, and where you might be deceived",
  Pluto: "your deepest transformations, power, and what you can't control",
  Chiron: "your deepest wound and your ability to heal others",
  "North Node": "your life purpose — the direction your soul is growing toward",
  "South Node": "your comfort zone — patterns from the past you're moving beyond",
  "Lilith": "your wild, untamed side — where you refuse to be controlled and won't apologize for it",
  "Medium Coeli": "your career, public reputation, and legacy",
  "Imum Coeli": "your roots, home life, and inner private world",
};

/** Classify an aspect as strong/medium/mild based on orb tightness and planet importance */
function classifyAspectStrength(
  orbit: number,
  p1: string,
  p2: string,
  aspect: string
): "strong" | "medium" | "mild" {
  // Luminaries and personal planets carry more weight
  const PERSONAL = ["Sun", "Moon", "Mercury", "Venus", "Mars"];
  const LUMINARY = ["Sun", "Moon"];
  const bothPersonal = PERSONAL.includes(p1) && PERSONAL.includes(p2);
  const hasLuminary = LUMINARY.includes(p1) || LUMINARY.includes(p2);

  // Tight orb = strong, regardless of planets
  if (orbit <= 2) return "strong";
  // Luminary-to-luminary or luminary-to-personal within moderate orb
  if (orbit <= 4 && hasLuminary && bothPersonal) return "strong";
  // Personal planet aspects within moderate orb
  if (orbit <= 4 && bothPersonal) return "medium";
  // Any aspect involving a luminary within wider orb
  if (orbit <= 5 && hasLuminary) return "medium";
  // Wider orbs or outer planet-to-outer planet
  if (orbit <= 3) return "medium";
  return "mild";
}

/** Generate a unique key for a planet pair */
function aspectKey(p1: string, p2: string): string {
  return [p1, p2].sort().join("-");
}

/** Natal aspect interpretations keyed by "Planet1-Planet2" (alphabetical) */
const ASPECT_INTERPRETATIONS: Record<string, Record<string, string>> = {
  "Moon-Sun": {
    conjunction: "Your ego and your emotions are fused — what you want and what you feel are nearly indistinguishable. You come across as authentic and whole, but you may struggle to see yourself objectively. You are deeply unified but can be blind to your own patterns.",
    trine: "Your inner world and outer identity flow naturally together. You feel comfortable in your own skin, and people sense your emotional groundedness. This is a gift of self-acceptance that makes others feel at ease around you.",
    sextile: "There's a gentle harmony between who you are and how you feel. You have the opportunity to integrate your emotional needs with your ambitions — it takes some effort but comes more easily than for most.",
    square: "What you want and what you need are at war. Your conscious identity pulls one direction while your emotional instincts pull another. This creates restlessness and inner tension, but also remarkable drive — you're never complacent because some part of you is always unsatisfied.",
    opposition: "You're pulled between your sense of self and your emotional needs, often feeling like two different people depending on who you're with. Relationships become mirrors where this split plays out. The growth is in honoring both sides without letting either dominate.",
  },
  "Mercury-Sun": {
    conjunction: "Your mind and your identity are one — you think, therefore you are. Communication is central to your sense of self. You're articulate and mentally sharp, but can over-identify with your ideas and take intellectual disagreements personally.",
    trine: "Your mind serves your identity beautifully. You communicate who you are with ease and clarity. Ideas come naturally and you express yourself without overthinking it.",
    sextile: "You have a natural talent for putting your thoughts into words. With a little effort, your communication skills become a real asset to your goals and self-expression.",
    square: "Your mind races ahead of your identity, or your ego gets in the way of clear thinking. Internal dialogue can be restless or self-critical. The tension pushes you to refine how you think and communicate.",
    opposition: "You may feel a disconnect between what you think and who you are. Others might reflect back ideas that challenge your self-concept. Growth comes through integrating external perspectives with your inner voice.",
  },
  "Mercury-Moon": {
    conjunction: "Your thoughts and feelings are intertwined — you think emotionally and feel intellectually. This gives you powerful emotional intelligence but can make it hard to separate rational analysis from gut reactions.",
    trine: "Your mind and heart communicate effortlessly. You can articulate your feelings with unusual clarity, and your thinking is enriched by emotional depth. People trust your words because they feel genuine.",
    sextile: "You have a gift for understanding emotional nuance through conversation. Journaling, therapy, or simply talking things through helps you process feelings productively.",
    square: "Your head and heart frequently disagree. You might rationalize away feelings or let emotions cloud your judgment. This tension creates anxiety but also pushes you toward deeper emotional honesty.",
    opposition: "You swing between pure logic and pure emotion, struggling to hold both at once. Others may experience you as either too heady or too reactive depending on the day. Integration is the lifetime project.",
  },
  "Moon-Venus": {
    conjunction: "Feeling loved and feeling safe are the same thing for you. You have a natural warmth that draws people in — affection, comfort, and beauty are emotional necessities, not luxuries. The shadow side: you may avoid conflict to keep the peace, even when the peace isn't real.",
    trine: "Your heart and your affections flow in the same direction. You love easily, comfort naturally, and people relax around you without knowing why. Home, food, beauty, and tenderness are languages you speak fluently.",
    sextile: "There's a gentle rapport between what you need and what you love. When you let yourself enjoy things — good meals, soft evenings, people you trust — your emotional tank actually refills. Pleasure is genuinely restorative for you.",
    square: "What soothes you and what you desire don't always agree. You might crave closeness but choose partners who unsettle you, or eat your feelings instead of naming them. The friction teaches you to want what's actually good for you — slowly, honestly.",
    opposition: "You look for emotional security in one place and pleasure in another, and the two rarely sit in the same room. Relationships can feel like choosing between comfort and desire. The growth is realizing you're allowed to ask for both from the same person — starting with yourself.",
  },
  "Sun-Venus": {
    conjunction: "Love, beauty, and pleasure are core to your identity. You're naturally charming and aesthetically attuned. Relationships and creative expression feel essential to who you are — not extras, but the main event.",
    trine: "You attract love and beauty naturally. There's an ease to your relationships and creative life that others envy. You know what you like, and what you like tends to like you back.",
    sextile: "You have a talent for making things beautiful and harmonious. With intention, your relationships and creative pursuits flourish. You bring grace to everything you touch.",
    square: "What you want in love and what your ego needs don't always align. You might choose partners who look good but don't feel right, or struggle with self-worth in relationships. The tension refines your values over time.",
    opposition: "You project your desires onto partners, expecting them to embody the beauty and love you struggle to claim for yourself. Growth means learning that what you're attracted to is actually a mirror of your own unlived qualities.",
  },
  "Mars-Sun": {
    conjunction: "Your will and your drive are unified — you're a force of nature when motivated. Energy, ambition, and assertiveness are central to who you are. You can be domineering or inspiring depending on how conscious you are of this power.",
    trine: "Your energy flows naturally toward your goals. You assert yourself with confidence and take action without overthinking. Physical vitality supports your ambitions.",
    sextile: "You have access to a healthy assertiveness that serves your identity well. With effort, you channel your drive productively. Competition motivates rather than overwhelms you.",
    square: "Your drive and your ego clash — you want to act but something holds you back, or you act impulsively and regret it. Anger management is a theme. This tension creates enormous energy when channeled consciously.",
    opposition: "You may attract conflict with others that mirrors an internal battle between what you want to do and who you think you should be. Partners and rivals teach you about your own relationship with power and anger.",
  },
  "Mars-Moon": {
    conjunction: "Your emotions are intense and physically felt — anger, passion, and protectiveness run hot. You react before you think, and your instincts are powerful. This placement creates fierce emotional honesty but can lead to volatile reactions.",
    trine: "You act on your feelings with natural confidence. Emotional energy fuels your productivity, and you protect the people you love fiercely. Your instincts are reliable guides for action.",
    sextile: "You have a healthy outlet for emotional energy through physical activity or productive action. When you're upset, doing something about it comes more naturally than stewing.",
    square: "Your emotions and actions are in constant friction. You might suppress anger until it explodes, or act aggressively when you're actually hurt. This is one of the most volatile aspects in a chart, but also one of the most powerful when mastered.",
    opposition: "You swing between emotional passivity and sudden aggression. Others may trigger your anger in ways that feel disproportionate because they're tapping into deeper emotional wells. Learning when to fight and when to feel is the lesson.",
  },
  "Mars-Venus": {
    conjunction: "Desire and attraction are fused in you — you radiate sexual magnetism and creative passion. You know what you want and you go after it with charm. The line between love and lust can blur, which is both your gift and your complication.",
    trine: "Your romantic and sexual energies flow together harmoniously. You attract what you desire with relative ease and bring both tenderness and passion to relationships. Creativity is a natural outlet for this balanced energy.",
    sextile: "You have a talent for blending assertiveness with charm. In relationships, you know how to pursue without overwhelming. Creative collaboration comes naturally and feels energizing.",
    square: "What you desire and how you pursue it don't match up. You might come on too strong or send mixed signals. Sexual tension is high but so is frustration. This creates passionate but complicated relationships and fierce creative energy.",
    opposition: "You project desire outward — attracting intense relationships where push-pull dynamics dominate. Partners may embody either the Mars or Venus side while you play the other. The growth is in owning both your softness and your fire.",
  },
  "Jupiter-Sun": {
    conjunction: "You were born to expand. Optimism, generosity, and a sense of purpose define your identity. You aim big and often hit big. The risk is overconfidence or excess — but the rewards of your faith in life tend to justify the gambles.",
    trine: "Luck and opportunity flow toward you naturally. Your optimism is grounded and your ambitions tend to work out. You inspire others simply by believing that good things are possible.",
    sextile: "You have access to growth and expansion when you seek it out. Opportunities appear when you're open to learning, traveling, or taking calculated risks.",
    square: "Your ambitions may outpace your resources or your judgment. You overcommit, overpromise, or overindulge. But this same tension drives you to achieve things others wouldn't dare attempt.",
    opposition: "Others may challenge your beliefs or your growth path. You might project your ideals onto partners or authority figures. The growth is in learning that your philosophy of life needs to accommodate other perspectives.",
  },
  "Jupiter-Moon": {
    conjunction: "You feel everything on a grand scale — your emotional life is big, generous, and expansive. Nurturing comes naturally and abundantly. You need emotional freedom and can feel suffocated by small, routine emotional environments.",
    trine: "Emotional generosity flows from you naturally. You create warmth and optimism wherever you go. Your instincts about people and situations tend to be positive — and usually right.",
    sextile: "You have the ability to grow emotionally through new experiences. Travel, education, and cultural exposure feed your soul in ways that domestic routine cannot.",
    square: "Your emotional needs are at odds with your need for growth and freedom. You might overeat, overspend, or overcommit emotionally. Restlessness masks deeper emotional needs that need addressing.",
    opposition: "You swing between emotional security and the urge to expand beyond it. Settling down feels suffocating but rootlessness feels empty. Finding home within the adventure is the lesson.",
  },
  "Saturn-Sun": {
    conjunction: "Responsibility, discipline, and a sense of heaviness were woven into your identity from the start. You may have been an old soul as a child. Achievement is important to you, but so is the fear that you'll never be enough. Life gets better with age — you were built for the long game.",
    trine: "Discipline comes naturally to you. You take responsibility for your life without resentment and build things that last. Authority sits well on you, and people trust your judgment.",
    sextile: "You have the ability to structure your ambitions effectively. Hard work pays off more consistently for you than for most, especially when you commit to long-term goals.",
    square: "Authority, limitation, and self-doubt are constant themes. You feel blocked or tested by life in ways that seem unfair. But this aspect builds character like nothing else — every achievement you earn is real because nothing was handed to you.",
    opposition: "You project authority outward, often clashing with bosses, institutions, or partners who represent the structure you resist. The lesson is learning to become your own authority rather than fighting everyone else's.",
  },
  "Saturn-Moon": {
    conjunction: "Your emotional life was shaped by restriction — feelings may have been suppressed, denied, or punished early on. You're emotionally resilient but can struggle with vulnerability. Warmth is hard-won but deeply genuine when it finally flows.",
    trine: "You handle emotions with maturity and stability. You don't overreact and people rely on your emotional steadiness. Your feelings have depth and endurance rather than flash and drama.",
    sextile: "You can structure your emotional life productively. Therapy, journaling, and emotional discipline come more naturally to you than to most. You build emotional resilience through intentional practice.",
    square: "Your emotional needs and your sense of duty are in constant conflict. You may feel guilty for having needs or depressed when you can't meet your own impossible standards. This is one of the harder natal aspects, but it builds extraordinary emotional depth over time.",
    opposition: "You project your need for structure onto partners or family, creating dynamics where one person is the caretaker and the other the dependent. True emotional maturity means learning to hold both roles yourself.",
  },
  "Mars-Mercury": {
    conjunction: "Your mind is sharp, quick, and combative. You argue to think and think to argue. Words are weapons and tools — you can cut with precision or build with conviction. Mental restlessness and impulsive speech are the shadow.",
    trine: "Your thoughts translate into action smoothly. You communicate with directness and conviction. Debates energize you and your mind is naturally strategic.",
    sextile: "You can channel mental energy into productive action when motivated. Writing, debating, and persuasion are skills you can develop with relative ease.",
    square: "Your mind and your impulses clash. You speak before thinking, argue when you should listen, or overthink when you should act. This creates friction but also sharpens your intellect enormously.",
    opposition: "You may attract intellectual adversaries who force you to refine your thinking. Others challenge your ideas in ways that feel personal. Growth comes through learning to fight fair with words.",
  },
  "Jupiter-Venus": {
    conjunction: "Love, pleasure, and abundance flow together beautifully. You attract good things — people, money, experiences — with almost magnetic ease. Generosity is your default, though excess and indulgence are the shadow.",
    trine: "Relationships and finances tend to work out well for you. You have natural good taste and attract partners who expand your world. Gratitude comes easily.",
    sextile: "You have opportunities for abundance in love and finances when you reach for them. Social connections open doors that effort alone cannot.",
    square: "Your desire for pleasure and growth can lead to overindulgence. You want too much, love too hard, or spend too freely. The tension creates a rich but sometimes chaotic romantic and financial life.",
    opposition: "You may project your need for abundance onto partners, expecting them to provide what you haven't cultivated in yourself. Growth means generating your own joy and prosperity rather than seeking it through others.",
  },
  "Saturn-Venus": {
    conjunction: "Love comes with conditions, lessons, and delays. You may feel unlovable or attract partners who are unavailable. But the love you eventually build is the most enduring kind — tested, real, and deeply loyal.",
    trine: "You approach love with maturity and realism. Your relationships are built on substance, not infatuation. Loyalty and commitment come naturally, and you age beautifully in partnership.",
    sextile: "You can build lasting relationships through patience and effort. Romantic partnerships improve over time rather than burning out. You value quality over intensity in love.",
    square: "Love and duty are in constant tension. You may feel you have to earn love or that it always comes with sacrifice. This is one of the loneliest aspects to carry, but it eventually produces the deepest, most authentic love — once you stop settling.",
    opposition: "You project your fear of rejection onto partners, creating dynamics where love feels conditional or withheld. The lesson is learning that you don't have to be perfect to be loved.",
  },
  "Saturn-Mars": {
    conjunction: "Your drive is disciplined but frustrated. You have enormous endurance and can work tirelessly, but the start is always slow. Anger may be suppressed until it erupts. When you finally move, nothing can stop you.",
    trine: "Discipline and drive work together effectively. You take sustained, strategic action toward your goals. Physical endurance is notable, and your ambition has stamina.",
    sextile: "You can channel your energy productively with structure. Goals that require patience and persistence suit you better than quick wins.",
    square: "Frustration, blocked energy, and anger management are lifelong themes. You feel like you're driving with the brakes on. This is an incredibly difficult aspect, but it builds an iron will that others can't match.",
    opposition: "You swing between impulsive action and paralytic caution. Authority figures may block or frustrate your ambitions. The lesson is learning to be your own disciplinarian without becoming your own oppressor.",
  },
  "Neptune-Sun": {
    conjunction: "Your identity is fluid, imaginative, and spiritually attuned — but it's hard to pin down who you actually are. You may lose yourself in fantasies, creative visions, or other people's expectations. When grounded, you're profoundly inspiring.",
    trine: "Creativity and spiritual sensitivity flow naturally through your identity. You inspire others without trying and have access to intuitive wisdom that guides your life path.",
    sextile: "You can tap into creative and spiritual gifts when you intentionally cultivate them. Art, music, and compassion are accessible channels for your imagination.",
    square: "Your identity is confused by illusions, escapism, or unrealistic expectations. You may struggle with substance use, savior complexes, or chronic uncertainty about who you are. The growth is in learning to dream without disappearing.",
    opposition: "Others may project their fantasies onto you, or you may idealize partners to avoid seeing them clearly. Disillusionment in relationships teaches you to love what's real rather than what you imagined.",
  },
  "Neptune-Moon": {
    conjunction: "Your emotional life is oceanic — boundless compassion, psychic sensitivity, and a tendency to absorb everyone's feelings. You may have had an absent or idealized mother figure. Boundaries are essential or you'll drown in empathy.",
    trine: "Your emotional intuition is remarkably accurate. You sense what others feel before they say it. Creative expression and spiritual practice are natural emotional outlets.",
    sextile: "You have access to deep empathy and creative imagination when you cultivate it. Artistic and spiritual pursuits feed your emotional wellbeing.",
    square: "Confusion between your feelings and other people's is a constant challenge. You may use escapism — substances, fantasy, codependency — to manage emotional overwhelm. Clarity comes through learning what's yours and what isn't.",
    opposition: "You project your need for transcendence onto others, idealizing partners or losing yourself in relationships. The lesson is finding your own spiritual center rather than merging with everyone else's.",
  },
  "Pluto-Sun": {
    conjunction: "Power, transformation, and intensity define your identity. You may have experienced death, trauma, or radical change early in life. You're here to transform yourself and others — but the process isn't gentle. People either love you or fear you.",
    trine: "You access your personal power with relative ease. Transformation is a natural part of your life and you handle crisis better than most. Your influence on others is quiet but profound.",
    sextile: "You can tap into transformative power when circumstances call for it. Crisis management and depth psychology come more naturally to you than to others.",
    square: "Power struggles, control issues, and forced transformations are lifelong themes. You may attract controlling people or become one yourself. This aspect demands you confront your relationship with power — or power will confront you.",
    opposition: "Others embody the intensity and power you haven't claimed. Partners and adversaries force you into transformations you didn't choose. The lesson is taking ownership of your own depth instead of encountering it through others.",
  },
  "Pluto-Moon": {
    conjunction: "Your emotional life is volcanic — deep, transformative, and not for the faint of heart. Childhood may have involved loss, secrets, or emotional intensity beyond what a child should carry. Your emotional resilience is extraordinary because it had to be.",
    trine: "You process emotions at a depth that most people can't access. Emotional transformation comes naturally — you shed old patterns like skin. Your emotional honesty is magnetic.",
    sextile: "You can access emotional depth and transformation when needed. Therapy, shadow work, and honest self-examination are productive channels for your intensity.",
    square: "Emotional power struggles dominate your inner life. You may feel consumed by feelings you can't control, or you control them so tightly that you become emotionally armored. The tension creates extraordinary emotional strength once faced.",
    opposition: "Others trigger your deepest emotional patterns, especially around control and vulnerability. Intimate relationships become crucibles for transformation. The growth is in letting yourself be changed by love rather than hardened by it.",
  },
  "Pluto-Venus": {
    conjunction: "Your love life is intense, consuming, and transformative. You don't do casual — relationships are all or nothing. Obsession, jealousy, and profound bonding are all part of the package. Love literally transforms you every time.",
    trine: "You attract deep, transformative relationships naturally. Your love has a regenerative quality — people feel changed by knowing you. You handle emotional intensity in relationships with unusual grace.",
    sextile: "You have access to profound romantic and creative transformation when you open to it. Your capacity for deep love grows stronger each time you risk vulnerability.",
    square: "Love and power are tangled. You may attract obsessive relationships, jealous partners, or your own controlling tendencies. Healing comes through loving without possessing — which is the hardest thing this aspect asks of you.",
    opposition: "Partners embody the intensity you haven't claimed. You attract transformative, sometimes destructive relationships that force you to confront your relationship with love and power.",
  },
  "Uranus-Sun": {
    conjunction: "You're wired differently and you know it. Individuality, rebellion, and sudden change are central to your identity. You can't follow someone else's path — your life unfolds in unexpected lightning strikes that look chaotic from the outside but feel inevitable to you.",
    trine: "Your uniqueness flows naturally into your life path. Change and innovation come easily, and you adapt to new circumstances with excitement rather than fear.",
    sextile: "You can access innovation and original thinking when you seek it. Embracing change becomes easier over time and opens doors that conformity never could.",
    square: "Stability and freedom are at war inside you. You disrupt your own life when it gets too comfortable. Relationships, jobs, and identities can change suddenly. The tension creates originality but also chronic restlessness.",
    opposition: "Others represent the freedom or disruption you haven't claimed. Partners may be erratic or you may project your need for change onto them. The lesson is owning your unconventionality rather than encountering it through others.",
  },
  "Uranus-Moon": {
    conjunction: "Your emotional life is electric and unpredictable. You need freedom in your closest relationships and can't tolerate emotional claustrophobia. Your mother may have been unconventional or emotionally erratic. You process feelings through sudden insight rather than slow processing.",
    trine: "Emotional independence comes naturally. You handle change and instability with unusual resilience. Your intuitive flashes are often accurate and lead to creative breakthroughs.",
    sextile: "You can cultivate emotional freedom and independence with conscious effort. New emotional experiences energize rather than frighten you.",
    square: "Your need for emotional security and your need for freedom are in constant tension. You may sabotage comfortable relationships or feel trapped by domesticity. The tension creates emotional brilliance but also instability.",
    opposition: "Partners may represent the emotional freedom or instability you haven't integrated. Sudden changes in relationships force you to develop your own emotional independence rather than depending on others for stability.",
  },

  /* ─── Imum Coeli (IC) — 4th house cusp: home, roots, family, inner foundation ─── */

  "Imum Coeli-Sun": {
    conjunction: "Your identity is deeply tied to where you come from — family, home, and heritage shape who you are at the core. You find yourself through private life rather than public achievement. Creating a home that reflects your true self is essential.",
    trine: "Your sense of self is naturally supported by your roots and home life. You draw confidence from your family background and feel genuinely at ease in domestic spaces. Your inner foundation is solid.",
    sextile: "You can strengthen your identity by investing in your home life and exploring your family history. Roots give you grounding when the world feels chaotic.",
    square: "Your public ambitions and your need for a stable home life pull in opposite directions. You may feel torn between career success and family obligations, or struggle to feel settled no matter where you live.",
    opposition: "Your career and public life may overshadow your private needs. Others see your accomplishments but not the emptiness at home. The growth is in building an inner foundation that doesn't depend on external recognition.",
  },
  "Imum Coeli-Moon": {
    conjunction: "Your emotions are rooted in home and family in the deepest way. You feel most like yourself in private, and your inner world is rich and protected. The relationship with your mother or primary caretaker profoundly shapes your emotional patterns.",
    trine: "Home is where your heart literally heals. You have a natural gift for creating emotionally safe spaces, and your family connections — chosen or biological — nourish you deeply.",
    sextile: "You can build emotional security through intentional homemaking and family connection. Tending to your roots — cooking, decorating, visiting family — genuinely restores you.",
    square: "Your emotional needs and your home situation are frequently at odds. Family may have been a source of stress rather than comfort. You're learning to create the safety you didn't inherit.",
    opposition: "Your emotional life plays out publicly whether you want it to or not. You may struggle to keep your private feelings private, or feel exposed in career settings. Growth means building inner security that doesn't crumble under the spotlight.",
  },
  "Imum Coeli-Mercury": {
    conjunction: "Your thinking is shaped by your upbringing and family narratives. You may carry inherited beliefs or communication patterns from home. Your mind is most active and creative in private, familiar spaces.",
    trine: "Family conversations and stories from your past feed your intellect naturally. You communicate comfortably about personal and domestic matters and may have a talent for writing about home, memory, or family.",
    sextile: "You can develop your communication skills by exploring your family history or writing about your roots. Home is a productive space for intellectual work.",
    square: "The stories you were told growing up may conflict with what you actually think. Inherited family narratives — about money, love, or success — need to be examined and possibly rewritten.",
    opposition: "Your private thoughts and your public communications don't always match. You may say one thing professionally and think another at home. Integration means speaking the same truth in every room.",
  },
  "Imum Coeli-Venus": {
    conjunction: "Love and beauty are centered in your home life. You need your living space to be aesthetically pleasing and emotionally warm. Family relationships, especially with women, are central to your sense of love and belonging.",
    trine: "Your home life and relationships flow together beautifully. You attract love in domestic settings and your living space reflects your taste naturally. Family bonds are a source of joy.",
    sextile: "You can deepen your relationships by investing in your home and family life. Cooking for someone, redecorating together, or visiting family strengthens your romantic bonds.",
    square: "What you want in love and what you need at home don't easily align. Partners may clash with your family, or your domestic ideal may feel impossible to achieve. The tension refines what you truly value.",
    opposition: "You may prioritize how love looks publicly over how it feels privately. Relationships that impress others might not satisfy you at home. Growth means choosing partners who feel like home, not just look good beside you.",
  },
  "Imum Coeli-Mars": {
    conjunction: "Your drive and energy are rooted in your home and family — you may fight fiercely for your loved ones or experience conflict within the family itself. Home renovations, real estate, or protecting your private space may consume significant energy.",
    trine: "You channel your energy productively into home and family matters. You take action on behalf of your loved ones and have a natural drive to improve your living situation.",
    sextile: "You can build motivation from your roots — family legacy, childhood dreams, or a desire to create a better home than the one you grew up in.",
    square: "Home may have been a place of conflict, or your drive for independence clashes with family expectations. You might struggle with anger related to family dynamics that needs conscious processing.",
    opposition: "Your career ambition and your family needs compete for your energy. You may feel like you can never give enough to both. Success means finding a pace that honors your private life without abandoning your goals.",
  },
  "Imum Coeli-Jupiter": {
    conjunction: "Your roots are expansive — you may come from a large, multicultural, or well-traveled family. Home feels best when it's generous, open, and full of possibility. You need space, both physically and emotionally, in your private life.",
    trine: "Your home life is naturally abundant and growth-oriented. Family supports your expansion, and you feel lucky in matters related to home and property. Generosity flows easily in domestic settings.",
    sextile: "You can grow by investing in your home, exploring your heritage, or creating more spacious living conditions. Family connections open doors for expansion.",
    square: "Your desire for growth and adventure conflicts with your need for roots. You may feel restless at home or overextend yourself trying to create a bigger, better domestic life than is realistic.",
    opposition: "Your public philosophy or belief system may clash with your family's values. Growth means integrating where you came from with where you're going — honoring your roots while expanding beyond them.",
  },
  "Imum Coeli-Saturn": {
    conjunction: "Your home life and family carry a sense of heaviness or responsibility. You may have grown up fast, carried family burdens, or had a strict household. Building a solid home takes time, but what you build lasts. Home improves with age.",
    trine: "You approach home and family with maturity and responsibility. Your domestic life is structured and reliable. You may be the person your family depends on, and you handle that role with quiet strength.",
    sextile: "You can build lasting security through patient investment in your home and family relationships. Stability in your private life grows steadily when you commit to it.",
    square: "Family responsibilities feel crushing at times. You may feel trapped by domestic obligations or carry guilt about not doing enough for your family. The lesson is learning that duty and love aren't the same thing.",
    opposition: "Your career demands may feel like they come at the expense of your family life. Authority figures at work and family expectations at home create a squeeze. Growth means setting boundaries that protect both.",
  },
  "Imum Coeli-Uranus": {
    conjunction: "Your home life is unconventional or unpredictable. You may have moved frequently, had an unusual family structure, or need your living space to feel radically different from the norm. You redefine what 'home' means on your own terms.",
    trine: "You adapt to changes in your home life with natural ease. Unconventional living arrangements or family structures feel normal to you, and you innovate in domestic spaces instinctively.",
    sextile: "You can revitalize your home life by embracing change rather than resisting it. New living situations or fresh approaches to family dynamics energize you.",
    square: "Your need for emotional stability at home clashes with sudden disruptions — unexpected moves, family upheaval, or your own restlessness. You're learning to find inner security that doesn't depend on external consistency.",
    opposition: "Your public life may introduce sudden changes that uproot your private world. Career shifts, relocations, or social disruptions impact your home life dramatically. Stability comes from within, not from your address.",
  },
  "Imum Coeli-Neptune": {
    conjunction: "Your home and family life has a dreamlike, idealized quality — for better and worse. You may have felt emotionally lost in your family, or your home was a place of creativity, spirituality, and imagination. Boundaries at home need conscious effort.",
    trine: "Your private life is infused with creativity and spiritual sensitivity. Home feels like a sanctuary, and you have a natural gift for creating peaceful, beautiful domestic spaces.",
    sextile: "You can nurture your creative and spiritual gifts by cultivating a peaceful home environment. Your roots feed your imagination when you give them attention.",
    square: "Your family history may involve confusion, secrets, addiction, or idealization. The home you grew up in may not have been what it appeared. Healing means seeing your roots clearly — not as you wish they were, but as they actually are.",
    opposition: "Your public image may be at odds with the reality of your private life. You might project an idealized version of your home to the world while struggling behind closed doors. Growth means letting go of the fantasy and tending to what's real.",
  },
  "Imum Coeli-Pluto": {
    conjunction: "Your home and family history carries intensity — power dynamics, secrets, loss, or profound transformation. Where you come from fundamentally shaped who you became. Your private life is where your deepest healing and transformation happen.",
    trine: "You have a natural ability to transform your home life and heal family patterns. Your roots give you a quiet, profound power. You can renovate not just houses but entire family dynamics.",
    sextile: "You can access deep emotional healing by working through family patterns. Ancestral healing, therapy focused on childhood, and intentional home transformation are powerful paths for you.",
    square: "Power struggles within your family or around your home life are a major theme. You may feel controlled by family dynamics or attempt to control your domestic world too tightly. Liberation comes through facing what's buried.",
    opposition: "Your career or public role may involve confronting deep power dynamics that mirror your family patterns. What you experienced at home shows up in how you handle authority in the world. Growth means healing the root, not just managing the symptoms.",
  },

  /* ─── Medium Coeli (MC) — 10th house cusp: career, public reputation, life direction ─── */

  "Medium Coeli-Sun": {
    conjunction: "Your identity and your career are essentially the same thing — you're meant to be visible, recognized, and known for something. Professional achievement is deeply personal for you. You shine in public roles and leadership positions.",
    trine: "Your sense of self flows naturally into your career path. You don't have to pretend to be someone else at work — your professional life and your personality align. Success comes from being authentically you in public.",
    sextile: "You can strengthen your career by leaning into what makes you uniquely you. Opportunities for recognition come when you put your genuine personality into your professional work.",
    square: "Who you are and what the world expects of you are in tension. You may feel pressured to pursue a career that doesn't match your identity, or struggle to be seen accurately in professional settings. The friction pushes you to carve your own path.",
    opposition: "Your private needs and your career pull in opposite directions. Professional success may come at the cost of personal fulfillment, or you retreat into private life when the spotlight gets uncomfortable. Balance is the ongoing work.",
  },
  "Medium Coeli-Moon": {
    conjunction: "Your emotions are tied to your career and public reputation. You need to feel emotionally invested in your work or it drains you. The public sees your emotional nature — you can't hide how you feel in professional settings, which is either your superpower or your vulnerability.",
    trine: "Your emotional instincts guide your career naturally. You read the room well in professional settings and your public persona feels emotionally genuine. Work that involves caring for others suits you.",
    sextile: "You can advance your career by trusting your emotional intelligence. Work environments where empathy is valued bring out your best professional self.",
    square: "Your emotional needs and career demands frequently clash. You may feel emotionally exposed at work or choose jobs that provide security but no satisfaction. Finding work that honors your feelings and your ambitions is the challenge.",
    opposition: "Your home life and career compete for your emotional energy. You may pour everything into work and feel empty at home, or retreat into domestic comfort when professional pressure mounts. Integration means nurturing both.",
  },
  "Medium Coeli-Mercury": {
    conjunction: "Communication is central to your career and public identity. You're known for how you think and speak. Writing, teaching, media, or any field requiring intellectual agility could be your calling. Your ideas define your reputation.",
    trine: "Your intellect naturally supports your career trajectory. You communicate your professional vision with clarity and others respect your thinking. Ideas come easily in professional contexts.",
    sextile: "You can advance professionally by developing your communication skills. Writing, speaking, networking, and intellectual development open career doors.",
    square: "Your ideas and your career path don't easily align. You may have brilliant thoughts that don't fit your current field, or struggle to communicate your professional value clearly. The tension pushes you to find your true intellectual calling.",
    opposition: "Your private thinking and your public messaging may not match. You might say what the world wants to hear professionally while thinking differently at home. Growth means finding a career where you can speak your actual mind.",
  },
  "Medium Coeli-Venus": {
    conjunction: "Your career involves beauty, love, art, or making things pleasant. You're publicly charming and attract professional opportunities through likability and aesthetic sensibility. Your reputation is closely tied to your taste and your relationships.",
    trine: "Your social grace and aesthetic sense naturally support your career. Professional relationships come easily, and your work has an appealing quality that attracts opportunity and recognition.",
    sextile: "You can advance your career through creative work, social connections, and attention to beauty. Professional settings where art, design, or relationship-building matter suit you well.",
    square: "Your desire for a pleasant career and the reality of professional demands don't always match. You may avoid necessary conflict at work or choose charming but unfulfilling career paths. Growth means bringing beauty to hard work rather than avoiding the hard work.",
    opposition: "What you value privately may clash with your public career. Love life and professional life compete for attention. You might sacrifice relationships for career or vice versa. Balance means neither should always win.",
  },
  "Medium Coeli-Mars": {
    conjunction: "You bring fierce drive and energy to your career. You're known for your ambition, competitiveness, and willingness to fight for what you want professionally. You need a career that lets you take bold action — a desk job with no autonomy would suffocate you.",
    trine: "Your professional drive flows naturally and effectively. You take decisive action in your career and others respect your energy and initiative. Competition motivates rather than intimidates you.",
    sextile: "You can advance professionally through assertiveness and bold moves. Taking initiative at work pays off, and you have the energy to pursue ambitious career goals when you choose to.",
    square: "Your aggression and your career path clash. You may burn bridges professionally, fight with authority figures, or feel constantly frustrated at work. The tension creates extraordinary career drive when channeled into the right field.",
    opposition: "Your drive for action may conflict with your family life or private needs. You might bring work aggression home or feel that domestic responsibilities slow your career momentum. Balance means directing your energy without depleting every area of your life.",
  },
  "Medium Coeli-Jupiter": {
    conjunction: "Your career is expansive, optimistic, and growth-oriented. You aim high professionally and often achieve it. Fields involving education, travel, law, publishing, or philosophy suit you. Your public reputation is generous and inspiring.",
    trine: "Professional growth and opportunity come naturally to you. Your career benefits from lucky breaks, good timing, and a reputation for optimism. You inspire confidence in others through your work.",
    sextile: "You can expand your career through education, travel, or philosophical exploration. Professional opportunities grow when you invest in learning and broadening your horizons.",
    square: "Your ambitions may outpace your practical abilities, or you overcommit professionally. Saying yes to every opportunity leads to spreading yourself too thin. The tension pushes you to be strategic about which growth actually matters.",
    opposition: "Your belief system and your family values may pull your career in different directions. Public success might require compromising ideals you hold privately. Growth means finding a professional path that aligns with your deepest beliefs.",
  },
  "Medium Coeli-Saturn": {
    conjunction: "Your career is serious, structured, and slow-building. You may feel the weight of professional responsibility heavily. Success comes later in life but it's permanent — you build things that endure. People respect you for your discipline and reliability.",
    trine: "Professional discipline comes naturally. You build your career with patience and strategic planning, and your reputation for reliability is well-earned. Authority sits comfortably on you in work settings.",
    sextile: "You can build lasting professional success through consistent effort and long-term planning. Patience with your career trajectory pays off more for you than for most.",
    square: "Professional obstacles, delays, and authority conflicts are recurring themes. You may feel blocked or undervalued at work. This is one of the toughest career aspects to carry, but it builds the most enduring professional achievements.",
    opposition: "Your career demands and family responsibilities create a constant squeeze. You may feel like you're failing at both, or sacrifice one entirely for the other. The lesson is building a life structure that doesn't require choosing.",
  },
  "Medium Coeli-Uranus": {
    conjunction: "Your career path is unconventional, unpredictable, and uniquely yours. You may change fields suddenly or work in cutting-edge, unusual industries. You can't follow a traditional career path — and you shouldn't try. Your reputation is for being original.",
    trine: "Innovation and originality flow naturally into your career. You adapt to professional changes with excitement and your unconventional approach is an asset rather than a liability.",
    sextile: "You can advance professionally by embracing innovation and change. Careers in technology, social change, or any field that rewards original thinking suit you when you lean into them.",
    square: "Your career may involve sudden disruptions — unexpected job changes, industry upheaval, or your own restless need to start over. Stability in work is hard to maintain but each change brings you closer to your true calling.",
    opposition: "Your need for a stable home life clashes with a chaotic or unpredictable career. Professional changes may uproot your personal world. Growth means building inner stability that survives external career shifts.",
  },
  "Medium Coeli-Neptune": {
    conjunction: "Your career is infused with imagination, spirituality, or creative vision — but the path is foggy. You may struggle with professional direction or idealize careers that don't match reality. When you find your calling, your work inspires and heals others.",
    trine: "Creative and spiritual gifts flow naturally into your career. You work with intuition and your professional reputation has an ethereal, inspiring quality. Arts, healing, and service professions suit you.",
    sextile: "You can advance professionally by developing your creative or spiritual abilities. Careers that allow imagination and compassion to guide your work bring the most satisfaction.",
    square: "Confusion about your career direction is a persistent theme. You may chase idealized career fantasies, fall for professional illusions, or struggle to ground your creative visions into actual work. Clarity comes through experience, not daydreaming.",
    opposition: "Your private ideals and your public career may be in tension. The world sees a polished professional while you feel like a fraud, or your spiritual life and your career feel like separate worlds. Integration means doing work that reflects your inner truth.",
  },
  "Medium Coeli-Pluto": {
    conjunction: "Your career involves power, transformation, and depth. You're drawn to fields that deal with life's biggest forces — psychology, medicine, finance, politics, or crisis management. Your professional presence is intense and people feel it immediately.",
    trine: "You access professional power and influence naturally. Your career involves transformation, and you handle power dynamics at work with unusual skill. Your public impact is quiet but profound.",
    sextile: "You can develop professional influence by engaging with transformative work. Careers that involve helping others through crisis, managing resources, or uncovering hidden truths suit your strengths.",
    square: "Power struggles in your career are a lifelong theme. You may encounter controlling bosses, toxic workplaces, or your own compulsive ambition. The tension demands you develop a healthy relationship with professional power — or it will consume you.",
    opposition: "Family power dynamics replay in your career. Authority figures at work trigger deep patterns from home. Professional transformation requires facing personal demons. The growth is in using your intensity to create rather than control.",
  },

  /* ─── North Node aspects ─── */

  "Imum Coeli-North Node": {
    conjunction: "Your life purpose is deeply tied to home, family, and building inner security. You're meant to develop roots, not chase public recognition. Finding where you truly belong — emotionally and physically — is your soul's work.",
    trine: "Your life purpose naturally unfolds through cultivating home and family. Creating a safe foundation supports your growth path effortlessly.",
    sextile: "Investing in your home and family life moves you closer to your destiny. Roots and belonging are productive areas for soul growth.",
    square: "Your life purpose and your domestic life create tension. Family patterns may block your growth path, requiring you to consciously reshape your relationship with home.",
    opposition: "Your destiny pulls you toward public achievement, but your roots keep calling you back. Honoring both your ambitions and your need for home is the balancing act of your life.",
  },
  "Medium Coeli-North Node": {
    conjunction: "Your life purpose is tied to your career and public role. You're meant to step into visibility, leadership, and professional achievement. Hiding at home isn't an option — the world needs what you bring.",
    trine: "Your career naturally aligns with your soul's growth direction. Professional achievement and life purpose feel like the same path.",
    sextile: "Career development and professional visibility move you toward your destiny. Public roles and recognition are growth opportunities, not distractions.",
    square: "Your life purpose and career expectations are in tension. You may be called toward work that doesn't match society's definition of success. Trusting your own path over conventional career advice is the challenge.",
    opposition: "Your destiny pulls you toward home and inner life, but career obligations keep demanding attention. Your soul grows more through private reflection than public achievement — even if the world doesn't reward it.",
  },
  "Jupiter-Mercury": {
    conjunction: "Your mind thinks big. You're drawn to philosophy, the big picture, and grand ideas. You can be an incredible teacher or storyteller, but you might overpromise, exaggerate, or talk more than you listen. Details bore you — vision excites you.",
    trine: "Your thinking naturally gravitates toward wisdom, meaning, and the bigger picture. You're a natural teacher and communicator who makes complex ideas accessible. Learning comes easily and joyfully.",
    sextile: "You have a talent for connecting everyday thinking with larger meaning. Writing, teaching, and studying reward you more than most. Your curiosity has a philosophical bent.",
    square: "Your mind wants to go big but gets scattered. You might start a dozen books and finish none, or make promises your schedule can't keep. The tension between detail and vision is frustrating but pushes you to be both thorough and inspired.",
    opposition: "You swing between getting lost in details and getting lost in grand theories. Other people challenge your thinking in ways that sharpen it. The growth is in being both precise and expansive.",
  },
  "Jupiter-Mars": {
    conjunction: "You go big or go home — your energy, ambition, and drive are supercharged. You take risks that terrify others and often win. Overconfidence and burnout are real dangers, but so is the genuine heroism you're capable of.",
    trine: "Your drive and your sense of opportunity work together naturally. You take action at the right time, in the right amount. Competition and adventure energize rather than stress you. You're genuinely lucky when you're brave.",
    sextile: "You can channel your energy toward growth and expansion when you choose to. Physical challenges, entrepreneurial ventures, and calculated risks tend to pay off for you.",
    square: "Your ambition outpaces your judgment — or your judgment holds back your energy. You might push too hard, fight unnecessary battles, or take risks you shouldn't. The friction creates incredible drive once you learn when to charge and when to wait.",
    opposition: "You attract people who challenge your drive and ambition. Conflicts with others often teach you about your own relationship with risk, anger, and competition. Learning when to fight and when to grow is the lesson.",
  },
  "Jupiter-Saturn": {
    conjunction: "Expansion meets limitation in you. You dream big but plan carefully. This can feel like driving with one foot on the gas and one on the brake, but it actually gives you staying power that pure optimists lack. Your biggest achievements take time.",
    trine: "Your optimism and discipline work together naturally. You can dream big AND follow through. This is one of the best aspects for long-term success because you balance vision with patience.",
    sextile: "You can build structures that support your growth when you put in the effort. Long-term goals that combine ambition with realistic planning are your sweet spot.",
    square: "Hope and doubt alternate in your life like seasons. Just when things start expanding, limitation kicks in. Just when things feel stuck, a door opens. This cycle is frustrating but builds resilience and teaches you to trust your own timing.",
    opposition: "You swing between reckless optimism and paralyzing caution. Finding the middle ground — ambitious but realistic — is the work of your lifetime. Other people may represent whichever side you're currently ignoring.",
  },
  "Neptune-Venus": {
    conjunction: "You love with your whole imagination. Romance, art, and beauty move you to your core — but you might fall in love with fantasies rather than real people. You're an incredible artist or lover when you stay grounded, and a heartbroken idealist when you don't.",
    trine: "Your romantic and creative life is deeply inspired. You attract beauty and love naturally, and your artistic sensibilities are refined. You see the best in people — and usually bring it out of them.",
    sextile: "You have access to deep creative inspiration and romantic sensitivity when you open yourself to it. Music, art, and poetry nourish your soul in practical ways.",
    square: "You chase romantic and creative ideals that don't exist in the real world. Disillusionment in love is a recurring theme until you learn to love real people, not projections. Your creative vision is stunning but needs grounding to become real work.",
    opposition: "You project impossible romantic ideals onto partners, then feel betrayed when they turn out to be human. The growth is in finding the sacred in the ordinary — real love is messier and more beautiful than the fantasy.",
  },
  "Neptune-Mercury": {
    conjunction: "Your mind operates on intuition more than logic. You think in images, feelings, and poetry rather than facts and figures. You're incredibly creative but can struggle with details, deadlines, and telling the difference between imagination and reality.",
    trine: "Your intuition and intellect work together beautifully. You understand things without being told, pick up subtext effortlessly, and communicate with unusual sensitivity and creativity.",
    sextile: "You have access to creative, intuitive thinking when you slow down and listen to it. Journaling, meditation, and artistic expression help you think more clearly, not less.",
    square: "Your logical mind and your intuition confuse each other. You might second-guess clear facts because they don't feel right, or trust feelings that mislead you. Developing both sharp thinking AND intuitive sensitivity — rather than choosing one — is the work.",
    opposition: "You attract people who either think too rigidly or too dreamily. Conversations with others help you find the balance between hard facts and intuitive knowing. Neither pure logic nor pure imagination is enough on its own.",
  },
  "Pluto-Mars": {
    conjunction: "Your willpower is extraordinary — when you want something, you pursue it with obsessive intensity. This creates incredible power but also explosive anger and control issues. Learning to use this force constructively rather than destructively is your life challenge.",
    trine: "You have access to deep reserves of power and determination that you can channel constructively. When life gets hard, you dig deeper while others give up. Your strength is quiet but formidable.",
    sextile: "You can tap into intense focus and determination when the situation calls for it. Crisis brings out your best qualities — you become calm, decisive, and powerful under pressure.",
    square: "Power struggles dominate your life — with others, with circumstances, with yourself. You might suppress your anger until it erupts, or use force when diplomacy would work better. This aspect forges incredible strength through incredibly difficult experiences.",
    opposition: "You attract power struggles and intense confrontations with others. These aren't random — they mirror your internal relationship with control, anger, and vulnerability. Other people show you your own shadow.",
  },
  "Chiron-Sun": {
    conjunction: "There's a wound at the center of your identity — a feeling of being flawed, broken, or not enough. This isn't true, but it feels true. The gift hidden inside this pain is that your vulnerability makes you able to help others heal in ways that no one else can.",
    trine: "Your core wound and your identity work together in a healing way. You've integrated your pain into who you are, and it gives you unusual depth and compassion. People trust you with their own wounds because they sense you've survived yours.",
    sextile: "You can access your past pain as a source of wisdom and healing when you choose to. Helping others through similar struggles strengthens your own sense of self.",
    square: "Your identity and your deepest wound are in friction. You might overcompensate for feelings of inadequacy, or let old pain define you. The growth is in neither hiding from your wound nor being consumed by it.",
    opposition: "Other people trigger your deepest insecurities — not to hurt you, but to help you see what still needs healing. Relationships become mirrors for your core wound. The gift is that through loving others, you heal yourself.",
  },
  "Chiron-Moon": {
    conjunction: "There's a wound in your emotional foundation — early nurturing may have been insufficient, inconsistent, or painful. You feel things deeply but struggle to feel safe. The gift is extraordinary empathy: because you know what it's like to hurt, you can truly comfort others.",
    trine: "Your emotional wounds have been integrated into your instincts in a healing way. You nurture others naturally because you understand pain from the inside. Your sensitivity is a strength, not a weakness.",
    sextile: "You can access emotional healing when you create safe spaces for it. Therapy, deep friendships, and nurturing others all contribute to your own healing process.",
    square: "Your emotions and your deepest wound create ongoing friction. Old pain gets triggered by present situations, making your emotional reactions feel disproportionate. Understanding the source of the pain — rather than just reacting to it — is transformative.",
    opposition: "Partners and family trigger your deepest emotional wounds. This isn't cruel coincidence — it's how you grow. The people closest to you show you exactly where you still need healing.",
  },
  "North Node-Sun": {
    conjunction: "Your identity IS your life purpose. Simply being yourself — fully, authentically — is your soul's work. The challenge is that becoming who you really are requires leaving behind comfortable old patterns.",
    trine: "Your sense of self naturally supports your life direction. Being authentic moves you toward your destiny without much struggle. Trust your instincts about who you're becoming.",
    sextile: "Self-expression and personal development move you toward your purpose. When you invest in becoming a stronger, more authentic version of yourself, your life path unfolds.",
    square: "Your sense of self and your life purpose create friction. Who you think you are may not match who you're becoming. This tension is uncomfortable but productive — it keeps pushing you to evolve.",
    opposition: "Your comfort zone (South Node) is where your identity feels safest. Growing into your purpose means stepping away from familiar patterns and comfortable self-definitions. The old you served its purpose — now it's time to grow.",
  },
  "North Node-Moon": {
    conjunction: "Your emotional instincts align with your destiny. Following your feelings — what nurtures you, what feels like home — leads you toward your purpose. Trust your gut about what's right for your future.",
    trine: "Your emotional life naturally supports your soul's growth. The relationships and environments that comfort you also push you in the right direction. Home and purpose aren't in conflict.",
    sextile: "Emotional growth and self-care move you toward your life purpose. When you nurture yourself properly, you're better able to walk your destined path.",
    square: "Your emotions and your life purpose pull in different directions. What feels safe may not be what's right for your growth. Learning to honor your feelings while still moving forward is the challenge.",
    opposition: "Your emotional comfort zone holds you back from your destiny. Old patterns of safety and nurturing feel good but keep you stuck. The growth is in finding new sources of emotional security that support who you're becoming.",
  },
  "Mars-North Node": {
    conjunction: "Your drive and ambition are directly tied to your life purpose. Taking bold, decisive action is how you fulfill your destiny. Passivity is the trap; courage is the path.",
    trine: "Your energy and initiative naturally support your life direction. When you take action, you tend to move in the right direction. Trust your drive.",
    sextile: "Assertive action and healthy competition move you toward your purpose. When you push yourself physically or take initiative, your path becomes clearer.",
    square: "Your drive and your destiny are at cross purposes — you might be fighting hard for the wrong things, or hesitating when courage is needed. Redirecting your energy toward what truly matters is the work.",
    opposition: "Your comfort zone involves being passive or letting things happen to you. Your destiny requires you to fight, compete, and take initiative. Courage is the lesson.",
  },
  "Venus-North Node": {
    conjunction: "Love, beauty, and relationships are central to your life purpose. Your destiny unfolds through connecting with others, creating beauty, and following what you value. Your heart is your compass.",
    trine: "Your values and relationships naturally support your soul's growth. Loving well and appreciating beauty move you toward your destiny effortlessly.",
    sextile: "Investing in relationships and creative pursuits moves you toward your life purpose. When you follow what you love, good things follow.",
    square: "What you love and where you're headed create tension. You might cling to comfortable relationships that hold you back, or your values may need updating to match who you're becoming.",
    opposition: "Your comfort zone is self-sufficiency and going it alone. Your destiny requires partnership, vulnerability, and letting yourself be loved. Opening your heart is the growth path.",
  },
  "Mercury-Venus": {
    conjunction: "You think beautifully. Your mind is drawn to harmony, art, and pleasant ideas. You're a natural diplomat — you know how to say the right thing. The risk is valuing niceness over truth.",
    trine: "Your thinking and your values are naturally aligned. You communicate with grace and charm, and your aesthetic sensibility enriches your intellect. People enjoy listening to you.",
    sextile: "You can blend logic with beauty when you try. Writing, design, and any creative communication are natural outlets. You make ideas attractive.",
    square: "What you think and what you value don't always agree. You might say yes when you mean no, or intellectualize your feelings instead of expressing them. The tension pushes you toward more honest communication.",
    opposition: "Others reflect back the balance between your head and your heart. Relationships teach you whether you're overthinking love or under-thinking your values.",
  },
  "Saturn-Mercury": {
    conjunction: "Your mind is disciplined, serious, and thorough. You think carefully before speaking and your words carry weight. You might struggle with mental anxiety or a fear that you're not smart enough, but your thinking is actually sharper than most.",
    trine: "Mental discipline comes naturally. You're organized, thorough, and good at long-term planning. Your thinking improves with age — you're a lifelong learner who retains what matters.",
    sextile: "You can apply structure to your thinking productively. Study, research, and careful analysis reward you. You build knowledge methodically.",
    square: "Your mind feels heavy — you overthink, worry, and doubt yourself intellectually. Tests and deadlines stress you more than they should. But this friction builds mental toughness that eventually becomes your greatest asset.",
    opposition: "Authority figures challenge your thinking, or your own internal critic won't let you speak freely. Learning to trust your own mind despite external pressure is the growth path.",
  },
  "Uranus-Venus": {
    conjunction: "You love unconventionally. Traditional relationships bore you — you need excitement, freedom, and surprise in love. Your taste is ahead of its time. You attract unusual people and create art that breaks rules.",
    trine: "Your love life and creative expression benefit from originality. You attract interesting, independent people naturally. Your unconventional taste works in your favor.",
    sextile: "You can bring freshness and novelty into relationships and creative work when you try. Breaking small routines keeps your love life alive.",
    square: "You want stability in love but also crave excitement — and you can't seem to have both. Relationships start with electric chemistry and crash when routine sets in. Learning to find freedom within commitment is the work.",
    opposition: "Partners represent the freedom or unpredictability you won't claim for yourself. You attract people who shake up your world. The lesson is being your own source of excitement.",
  },
  "Uranus-Mars": {
    conjunction: "Your energy is electric and unpredictable. You act on sudden impulses and hate being told what to do. You're brilliant in a crisis but terrible with routine. Channel this energy into innovation rather than rebellion for its own sake.",
    trine: "You take bold, original action naturally. Your instincts are quick and inventive. You thrive in environments that reward thinking on your feet and doing things differently.",
    sextile: "You can channel your energy into innovative action when inspired. Physical activities that involve variety and surprise energize you.",
    square: "Your need for freedom and your drive clash violently. You rebel against authority, quit things impulsively, and your anger can be explosive and surprising. Learning to direct this volatile energy productively is the challenge.",
    opposition: "You attract unpredictable conflicts and sudden disruptions to your plans. Others may act out the rebellion you're suppressing. The lesson is expressing your need for freedom directly.",
  },
  "Uranus-Mercury": {
    conjunction: "Your mind is lightning-fast and unconventional. You have brilliant flashes of insight but struggle with sustained focus. You think in leaps, not steps. Traditional education might bore you, but your original ideas are genuinely ahead of their time.",
    trine: "Original, innovative thinking comes naturally. You grasp new technology and abstract concepts faster than most. Your communication style is unique and refreshing.",
    sextile: "You can access innovative thinking when you need it. New ideas and unconventional perspectives come to you when you break from routine.",
    square: "Your mind is restless and scattered. You have brilliant ideas but struggle to finish what you start. Nervous energy and mental overstimulation are constant themes. Structure and focus don't come naturally but are essential.",
    opposition: "Others challenge your thinking in ways that spark innovation. Debates and disagreements are where your best ideas come from. You need intellectual opposition to sharpen your mind.",
  },
  "Neptune-Mars": {
    conjunction: "Your drive is idealistic and inspired — or confused and directionless. You fight for dreams and causes, not personal glory. Physical energy comes in waves. You're capable of incredible sacrifice but also passive aggression when you won't admit you're angry.",
    trine: "You channel your energy toward inspired, compassionate action naturally. You're motivated by meaning rather than competition. Creative and spiritual pursuits energize you.",
    sextile: "You can direct your energy toward creative and spiritual goals when you choose to. Physical activities that involve flow states — dance, swimming, yoga — suit you.",
    square: "Your drive and your dreams are at cross purposes. You might fight for the wrong causes, get scammed by people you believe in, or struggle to assert yourself clearly. Learning to be both compassionate AND direct is the work.",
    opposition: "Partners may embody either your idealism or your anger. Relationships involve projection and confusion about who wants what. Clarity about your own desires is essential.",
  },
  "Jupiter-Uranus": {
    conjunction: "You're drawn to revolutionary ideas, sudden breakthroughs, and big changes. Lucky breaks come out of nowhere. You believe deeply in freedom and progress, sometimes to the point of restlessness. When you combine vision with spontaneity, remarkable things happen.",
    trine: "Opportunities for growth arrive through unexpected channels. You're naturally open to new perspectives and your optimism embraces change rather than fearing it.",
    sextile: "You can find growth in unconventional paths when you stay open. Taking calculated risks on unusual opportunities tends to pay off.",
    square: "Your desire to expand and your need for freedom clash. You might rebel against your own growth path, or chase so many opportunities that you finish nothing. Focus your revolutionary energy.",
    opposition: "Others represent the breakthrough or freedom you need. Relationships with unconventional thinkers expand your worldview in ways you couldn't achieve alone.",
  },
  "Jupiter-Neptune": {
    conjunction: "Your imagination is vast and your faith is deep. You believe in magic, meaning, and the best in people — sometimes to a fault. You're incredibly creative and spiritually attuned, but can be gullible, overindulgent, or lost in fantasy.",
    trine: "Spiritual growth and creative inspiration flow naturally. You attract beauty and meaning into your life without forcing it. Your intuition about the bigger picture is usually right.",
    sextile: "You can access deep inspiration and spiritual insight when you open yourself to it. Creative and spiritual retreats nourish you profoundly.",
    square: "Your faith and your fantasies blur together. You might believe things that aren't true, spend money you don't have, or escape into substances, spirituality, or fantasy instead of dealing with reality. Discernment is your lifelong lesson.",
    opposition: "You project your ideals onto others and feel disillusioned when reality hits. Spiritual teachers and creative partners may disappoint you until you develop your own inner wisdom.",
  },
  "Jupiter-Pluto": {
    conjunction: "Your ambition is enormous and your willpower is formidable. You're drawn to power, influence, and transformation on a grand scale. You can move mountains when motivated — but watch for obsessiveness and the temptation to manipulate.",
    trine: "You access power and influence naturally. Growth comes through depth and transformation. You have a gift for seeing what's beneath the surface and using that insight to expand your impact.",
    sextile: "You can tap into deep reserves of power and ambition when opportunities call for it. Transformation and growth are linked — you grow by going deeper.",
    square: "Your hunger for growth and your need for control battle each other. You might pursue power at the expense of wisdom, or your intensity sabotages your expansion. Learning to grow with integrity is the challenge.",
    opposition: "Others represent the power or depth you need to integrate. Intense relationships become the arena for your most significant growth and transformation.",
  },
  "Saturn-Uranus": {
    conjunction: "Structure and rebellion coexist inside you. You want to break free AND build something lasting. This creates an unusual ability to revolutionize systems from within rather than just tearing them down.",
    trine: "You balance innovation with discipline naturally. You can introduce change in a way that people accept because it's grounded in practical reality. Reform comes easier to you than revolution.",
    sextile: "You can blend tradition with innovation productively. Working within systems to improve them comes naturally when you choose to engage.",
    square: "The status quo and the future are at war inside you. You alternate between clinging to security and blowing everything up. This tension is generational — it shapes how your entire age group relates to authority and change.",
    opposition: "You attract situations that force you to choose between security and freedom, tradition and innovation. Relationships mirror this internal tug-of-war.",
  },
  "Saturn-Neptune": {
    conjunction: "Your dreams meet reality head-on. You either give form to your ideals through hard work, or you feel crushed by the gap between how things are and how you wish they were. Building something meaningful from your imagination is your life project.",
    trine: "You can make dreams real through disciplined effort. Your spiritual or creative life benefits from structure, and your practical life benefits from imagination. This is the architect's aspect.",
    sextile: "You can ground your ideals in practical action when you choose to. Blending creativity with discipline produces your best work.",
    square: "Your reality and your dreams are in painful friction. You might feel like a failure for not achieving impossible ideals, or dismiss your dreams as impractical. Neither cynicism nor fantasy serves you — find the middle ground.",
    opposition: "Others represent either the harsh reality or the beautiful dream you're avoiding. Relationships oscillate between disillusionment and inspiration.",
  },
  "Saturn-Pluto": {
    conjunction: "You were built for hard things. This is one of the heaviest conjunctions — it brings encounters with power, loss, and the structures of control. You understand how systems work at a fundamental level and have the endurance to outlast almost anything.",
    trine: "You handle power and responsibility with unusual depth. Crisis doesn't break you — it reveals your strength. You build things that survive because you don't shy away from what's difficult.",
    sextile: "You can access deep resilience and structural thinking when challenges arise. Hard times reveal your capability rather than destroying you.",
    square: "Power, control, and limitation are constant themes. You may feel trapped by systems, authority, or circumstances beyond your control. This aspect breaks you down and rebuilds you stronger — but the process is not gentle.",
    opposition: "Confrontations with power structures and authority figures define your life. Others represent the control you resist or the depth you avoid. Transformation through relationship with power is the lesson.",
  },
  "Uranus-Neptune": {
    conjunction: "You're part of a generational wave that blends innovation with spirituality. Old boundaries between science and mysticism, technology and imagination dissolve for your age group. You feel this tension between rational progress and intuitive knowing personally.",
    trine: "Your generation bridges the practical and the mystical naturally. Innovation and imagination support each other in your life without much friction.",
    sextile: "You can access the creative space where technology meets imagination when you choose to. Innovation serves your spiritual or creative growth.",
    square: "Your generation experiences tension between technological progress and spiritual meaning. You personally may feel torn between the rational and the mystical, struggling to integrate both.",
    opposition: "Your generation navigates the polarity between the material and the spiritual. Others mirror whichever side you're neglecting.",
  },
  "Uranus-Pluto": {
    conjunction: "You belong to a generation of radical transformation. The urge to overthrow what's broken and rebuild from scratch runs deep. You personally may experience sudden, transformative upheavals that change your life's direction entirely.",
    trine: "Transformation and innovation work together naturally in your life. When things need to change, they change powerfully but not destructively. You adapt to revolutions rather than being overwhelmed by them.",
    sextile: "You can harness transformative energy for innovative purposes. Change doesn't scare you — you see it as opportunity.",
    square: "Your generation experiences explosive tension between the need for change and the forces of entrenched power. You personally may feel caught between revolutionary impulses and fear of losing control.",
    opposition: "Your generation navigates intense polarities around power, freedom, and control. You attract situations that force transformation through confrontation.",
  },
  "Neptune-Pluto": {
    conjunction: "This is a rare generational aspect — it shapes entire eras. Your generation carries a deep, unconscious transformation of spirituality, imagination, and power structures that unfolds over lifetimes.",
    trine: "Spiritual transformation works quietly and naturally in your life. You have access to deep, unconscious wisdom that surfaces when you need it most.",
    sextile: "Your generation bridges the invisible and the powerful. You can access transformative spiritual insight when you're ready for it. Dreams, intuition, and psychological depth are resources, not threats.",
    square: "Spiritual and psychological forces create deep, often unconscious friction. Your generation wrestles with the shadow side of faith, imagination, and power at a collective level.",
    opposition: "This is extremely rare and not active in any living generation. If present, it represents a cosmic-scale tension between dissolution and transformation.",
  },
  "Pluto-Mercury": {
    conjunction: "Your mind goes deep — you see through lies, hidden motives, and surface explanations. You're drawn to taboo subjects, psychology, and what's really going on beneath the surface. Your words have power and intensity. You can be paranoid or manipulative if you're not conscious of this gift.",
    trine: "Your thinking naturally penetrates to the core of things. You're an excellent researcher, psychologist, or investigator. People trust you with their secrets because you handle depth well.",
    sextile: "You can access penetrating insight and psychological depth when you need it. Deep conversations and research energize rather than drain you.",
    square: "Obsessive thinking, paranoia, and mental power struggles are themes. You might fixate on dark subjects or use words as weapons. Learning to use your mental intensity for understanding rather than control is the work.",
    opposition: "Others provoke your deepest thinking and challenge your assumptions. Conversations with intense, powerful people transform how you understand the world.",
  },
  "Chiron-Venus": {
    conjunction: "There's a wound in how you love and feel loved. You may feel unworthy of love, attract painful relationships, or struggle with self-worth. But this wound gives you extraordinary compassion — you understand heartbreak in a way that lets you truly comfort others.",
    trine: "Your past pain in love has become a source of wisdom. You love gently because you know how much it hurts when love goes wrong. Your compassion in relationships is genuine and healing.",
    sextile: "You can transform romantic pain into artistic beauty or healing work. Creative expression helps you process wounds around love and self-worth.",
    square: "Love keeps reopening old wounds. Relationships trigger your deepest insecurities about being lovable. This is painful but ultimately pushes you toward a more authentic, less conditional kind of love.",
    opposition: "Partners reflect your wounds around love and self-worth. You attract people who need healing — or who wound you — until you learn that the love you're seeking needs to come from within first.",
  },
  "Chiron-Mars": {
    conjunction: "There's a wound in your ability to assert yourself. You may feel like your anger is dangerous, your ambition is selfish, or your strength is unwelcome. Learning to fight for yourself — without guilt — is your healing journey.",
    trine: "You've integrated past wounds around anger and assertion into constructive action. Your strength is tempered by understanding. You fight wisely, not recklessly.",
    sextile: "You can channel past pain into productive action and advocacy. Standing up for others comes more naturally than standing up for yourself, but both are possible.",
    square: "Anger and assertion trigger deep wounds. You might suppress your power or express it destructively. Learning that your strength is not the same as the strength that hurt you is the breakthrough.",
    opposition: "Others trigger your wounds around power and assertion. Conflicts in relationships force you to confront your relationship with your own anger and drive.",
  },
  "Chiron-Mercury": {
    conjunction: "There's a wound in how you communicate or think. You may have been told you were stupid, silenced, or misunderstood. Learning disabilities or speech difficulties might be part of your story. Your healing comes through finding your voice — and using it to help others find theirs.",
    trine: "Your past pain around communication has become wisdom. You speak with sensitivity because you know how words can hurt. Others trust your counsel.",
    sextile: "You can use writing, speaking, or teaching to heal yourself and others. Expressing your wounds through words is therapeutic and genuinely helps people.",
    square: "Communication triggers deep insecurity. You might overthink every word, fear being misunderstood, or avoid speaking your truth. The friction pushes you toward more authentic self-expression.",
    opposition: "Others challenge how you think and communicate in ways that reopen old wounds. Dialogue with others becomes the arena for your intellectual healing.",
  },
  "Lilith-Sun": {
    conjunction: "Your wild, untamed nature is central to your identity. You refuse to be diminished or controlled, and this can intimidate people. Your power lies in owning the parts of yourself that society tells you to hide.",
    trine: "Your authentic, unfiltered self-expression comes naturally. You embrace your shadow side without it consuming you, and this raw honesty is magnetic.",
    sextile: "You can access your wild, powerful side when you need it. Embracing what makes you different strengthens your sense of self.",
    square: "Your need to be authentic and your need to be accepted are at war. You might suppress your true nature to fit in, then erupt in ways that shock people. Learning to express your wildness without burning bridges is the work.",
    opposition: "Others embody the power and intensity you're afraid to own. Partners may be the 'wild ones' while you play it safe — until you reclaim that energy for yourself.",
  },
  "Lilith-Moon": {
    conjunction: "Your emotional instincts are fierce and primal. You feel things with an intensity that can scare others — and sometimes yourself. You may have been shamed for your emotions or your needs. Reclaiming your right to feel fully is your healing.",
    trine: "Your emotional intensity and your instincts work together powerfully. You trust your gut, even when it tells you uncomfortable truths. Your emotional honesty is striking.",
    sextile: "You can access deep emotional power when you need it. Honoring your instincts and your darker emotions makes you stronger, not weaker.",
    square: "Your emotions and your shadow side clash. You might suppress rage, jealousy, or desire out of shame, only to have them erupt in unhealthy ways. Accepting ALL your feelings — not just the pretty ones — is the work.",
    opposition: "Others trigger your deepest, most primal emotions. Relationships become arenas for confronting the feelings you've been taught to hide.",
  },
  "Lilith-Venus": {
    conjunction: "Your love nature is intense, magnetic, and unapologetic. You attract and repel with equal force. Conventional relationships may bore you — you need passion, depth, and authenticity. You refuse to be the 'nice' version of yourself in love.",
    trine: "Your raw authenticity in love is magnetic. You attract people who appreciate your depth and your refusal to play games. Your love style is powerful because it's genuine.",
    sextile: "You can bring depth and authenticity to relationships when you allow yourself to be vulnerable in your own fierce way.",
    square: "What you desire and what you're 'supposed' to want in love don't match. You might attract taboo relationships or feel ashamed of your desires. Owning what you truly want — without guilt — is transformative.",
    opposition: "Partners embody the wildness or intensity you've suppressed in yourself. Relationships force you to confront your true desires rather than performing what's expected.",
  },
  "Lilith-Mars": {
    conjunction: "Your drive is raw, powerful, and refuses to be tamed. You fight for what you want without apology. This can be incredibly empowering or destructive depending on how conscious you are. Your anger is a signal, not a flaw.",
    trine: "You channel your fierce energy naturally. Your assertiveness comes with an authenticity that people respect even when it's uncomfortable. You don't fight fair — you fight real.",
    sextile: "You can access your raw power and fighting spirit when the situation calls for it. Standing up for yourself and others comes from a genuine place.",
    square: "Your anger and your shadow side create explosive energy. You might suppress your power then overreact, or use aggression to cover vulnerability. Learning to wield your intensity with awareness is the challenge.",
    opposition: "Others provoke your most primal fighting instincts. Conflicts in relationships force you to confront what you really want and how far you'll go to get it.",
  },
};

/** Ascendant/Descendant interpretations */
const ANGLE_INTERPRETATIONS: Record<string, Record<string, string>> = {
  "Ascendant-Jupiter": {
    conjunction: "You come across as generous, optimistic, and larger than life. People immediately sense your warmth and enthusiasm. You might gain weight easily or take up a lot of space — physically or energetically — but your presence is genuinely uplifting.",
    trine: "Your natural personality and your growth instincts work together beautifully. You come across as wise, open-minded, and adventurous without trying. Opportunities tend to find you because people like being around you.",
    sextile: "You have an approachable quality that invites good things into your life. When you lean into your natural optimism and generosity, doors open. Travel and learning enhance your sense of self.",
    square: "Your outward personality clashes with your need to grow and expand. You might overcommit, overpromise, or come across as more confident than you feel. The tension pushes you to back up your big energy with real substance.",
    opposition: "Other people — especially partners — embody the expansiveness and optimism you struggle to own yourself. You attract big personalities and teachers. The lesson is realizing that the growth you admire in others already lives in you.",
  },
  "Ascendant-Saturn": {
    conjunction: "You come across as serious, mature, and responsible — even as a child, people probably treated you like a little adult. There's a heaviness to your presence that earns trust but can feel isolating. You age beautifully in every sense.",
    trine: "Discipline and maturity come naturally to how you present yourself. People respect you instinctively because you carry yourself with quiet authority. You build credibility effortlessly over time.",
    sextile: "You have access to a grounded, responsible energy that serves you well in professional settings. With effort, your natural seriousness becomes an asset rather than a burden.",
    square: "You feel held back by your own self-image, or by authority figures who tell you who you should be. Self-doubt is a constant companion, but every time you push through it, you become stronger. Your confidence is hard-won but real.",
    opposition: "Partners and close others represent the structure and discipline you struggle with internally. You might attract controlling relationships or reject all authority. The lesson is becoming your own steady foundation.",
  },
  "Ascendant-Mars": {
    conjunction: "You radiate energy, assertiveness, and physical vitality. People notice you immediately — you have a competitive, action-oriented presence. You might come across as aggressive or intimidating even when you don't intend to.",
    trine: "Your assertiveness and physical energy express themselves naturally and attractively. You take initiative easily and people follow your lead without you having to push. Sports, fitness, and physical challenges energize rather than drain you.",
    sextile: "You have a healthy assertive streak that serves you well when you lean into it. Taking action comes more naturally than overthinking, and people respond well to your directness.",
    square: "Your energy and your self-image are in friction. You might come across as either too aggressive or too passive, struggling to find the right level of assertion. This tension creates a powerful drive once you learn to channel it.",
    opposition: "You attract bold, assertive, sometimes combative people into your life — especially as partners. They mirror the fighting spirit you may not express directly. The lesson is learning to assert yourself rather than outsourcing your fire.",
  },
  "Ascendant-Venus": {
    conjunction: "You're naturally charming, attractive, and socially graceful. Beauty and harmony are part of how you move through the world. People are drawn to you aesthetically and socially — you make things look easy even when they're not.",
    trine: "Charm and social grace come effortlessly to you. You attract positive attention and create harmony in your environment naturally. Your aesthetic sense is strong and people trust your taste.",
    sextile: "You have a gift for making good impressions and creating pleasant social experiences. When you lean into your natural warmth and appreciation for beauty, relationships flourish.",
    square: "What you value and how you present yourself don't always align. You might prioritize looking good over feeling good, or struggle with self-worth despite being attractive to others. The tension refines your relationship with beauty and love.",
    opposition: "Partners represent the beauty, charm, and social grace you struggle to own yourself. You attract artistic, attractive people and might put them on a pedestal. The lesson is recognizing your own lovability.",
  },
  "Ascendant-Uranus": {
    conjunction: "You come across as unconventional, unpredictable, and electrically alive. People either love your originality or find you unsettling. You need to be authentically yourself above all else — conformity feels physically painful.",
    trine: "Your uniqueness expresses itself naturally without alienating people. You're the interesting one in any group, and your unconventional ideas land well because they come packaged in authenticity.",
    sextile: "You have access to an innovative, original energy that makes you stand out when you lean into it. Change and novelty energize rather than stress you.",
    square: "Your need to be different clashes with how you're perceived. You might rebel just for rebellion's sake, or feel like you can never fit in no matter how hard you try. The growth is in being genuinely yourself, not just oppositionally different.",
    opposition: "You attract wild, unpredictable, freedom-loving people as partners. Relationships feel electric but unstable. The lesson is allowing space for both independence and intimacy.",
  },
  "Ascendant-Neptune": {
    conjunction: "You come across as dreamy, ethereal, and hard to pin down. People project their fantasies onto you — you might seem like a mystery even to yourself. Boundaries are a lifelong lesson, but your sensitivity is also your superpower.",
    trine: "Your intuition and creativity express themselves naturally through your personality. You pick up on atmospheres and emotions without trying, and your compassion draws people to you.",
    sextile: "You have access to deep empathy and creative inspiration when you open yourself to it. Artistic and spiritual pursuits enhance your sense of identity.",
    square: "Your self-image is foggy — you struggle to see yourself clearly, and others may misread you. You might escape into fantasy, substances, or people-pleasing to avoid facing who you really are. Clarity about your identity is the lifetime project.",
    opposition: "You attract dreamy, artistic, or escapist partners who embody the imagination you may not express directly. Be careful of savior dynamics — you can't rescue someone who mirrors your own avoidance.",
  },
  "Ascendant-Pluto": {
    conjunction: "You have an intense, magnetic presence that people can't ignore. You transform environments just by walking into them. Power dynamics follow you everywhere — learning to wield your intensity consciously rather than reactively is key.",
    trine: "Your personal power expresses itself naturally and persuasively. You're deeply perceptive about people and situations, and you handle crises with unusual calm because transformation doesn't scare you.",
    sextile: "You have access to a depth and intensity that serves you well in situations requiring courage and honesty. You can handle hard truths that others avoid.",
    square: "Power struggles color your self-image. You might feel powerless and overcompensate, or fear your own intensity and suppress it. This aspect creates a pressure-cooker dynamic that forges incredible personal strength once you stop fighting yourself.",
    opposition: "You attract powerful, intense, sometimes controlling partners. Relationships become the arena for your deepest transformations. The lesson is owning your own power rather than giving it to — or taking it from — others.",
  },
  "Ascendant-Moon": {
    conjunction: "Your emotions are written on your face — you can't hide how you feel, and your mood shapes how everyone around you experiences you. You're deeply attuned to the emotional temperature of any room. Vulnerability is your strength.",
    trine: "Your emotional life and your outward personality flow together naturally. People feel comfortable around you because your warmth is genuine. Your instincts about people and situations are reliable.",
    sextile: "You connect emotionally with others easily when you open up. Your intuition about social situations serves you well, and nurturing relationships come naturally.",
    square: "How you feel inside and how you come across to others don't match. You might seem calm when you're falling apart, or emotional when you intend to be composed. This gap creates misunderstandings but also emotional resilience.",
    opposition: "You look to partners for emotional security and nurturing. Close relationships become the place where you process your feelings — for better and worse. The lesson is learning to mother yourself rather than seeking it externally.",
  },
  "Ascendant-Sun": {
    conjunction: "Your identity and how you present yourself are perfectly aligned — what you see is what you get. You have strong presence and natural leadership, but you may struggle to see yourself from anyone else's perspective.",
    trine: "Who you are and who you appear to be match naturally. This creates confidence and consistency that people trust. You express your authentic self without effort.",
    sextile: "You can align your inner identity with your outward expression with a little conscious effort. When you do, people respond positively because you come across as genuine.",
    square: "There's friction between who you really are and how the world perceives you. You might feel misunderstood or like you're performing a version of yourself. The tension pushes you toward more authentic self-expression.",
    opposition: "You discover who you are through other people — partners, rivals, and close relationships mirror back parts of yourself you can't see directly. Identity is a collaborative project for you.",
  },
  "Ascendant-Mercury": {
    conjunction: "Communication defines how people experience you. You're quick-witted, talkative, and mentally alert — people know you by what you say and how you think. Your mind never stops, and everyone around you can tell.",
    trine: "You express your ideas naturally and people follow your thinking easily. Communication is a strength that enhances everything you do — writing, speaking, and connecting come effortlessly.",
    sextile: "You have a gift for making your thoughts accessible to others. With intention, your communication skills become a real asset in both personal and professional life.",
    square: "Your mind and your presentation don't align smoothly. You might talk too fast, say the wrong thing, or overthink how you come across. The friction creates a sharpness that improves your communication over time.",
    opposition: "You learn and communicate best through dialogue — bouncing ideas off others sharpens your thinking. Partners may challenge how you think, which frustrates you but ultimately makes you smarter.",
  },
};

/**
 * Some interpretation keys were hand-written out of alphabetical order
 * (e.g. "Saturn-Mercury", "Pluto-Moon"). aspectKey() always sorts, so
 * normalize every key once at module load — otherwise that copy silently
 * never matches and falls through to the generated fallback.
 */
function normalizeAspectKeys(
  table: Record<string, Record<string, string>>
): Record<string, Record<string, string>> {
  const out: Record<string, Record<string, string>> = {};
  for (const [key, value] of Object.entries(table)) {
    // Planet names never contain "-" (spaces only, e.g. "North Node")
    const parts = key.split("-");
    out[parts.length === 2 ? aspectKey(parts[0], parts[1]) : key] = value;
  }
  return out;
}

/**
 * Theme fragments for composing pair-specific aspect copy.
 * `noun` is a possessive noun phrase; `wants` completes "the part of you that …".
 */
const PLANET_THEMES: Record<string, { noun: string; wants: string }> = {
  Sun: { noun: "your core identity", wants: "wants to be seen and taken seriously" },
  Moon: { noun: "your emotional needs", wants: "needs to feel safe before anything else" },
  Mercury: { noun: "your thinking", wants: "wants to name things and understand them" },
  Venus: { noun: "what you love and value", wants: "wants pleasure, beauty, and real connection" },
  Mars: { noun: "your drive", wants: "wants to act now and explain later" },
  Jupiter: { noun: "your appetite for growth", wants: "wants more room, more meaning, more yes" },
  Saturn: { noun: "your discipline", wants: "wants rules, proof, and a margin of safety" },
  Uranus: { noun: "your rebellious streak", wants: "wants to break whatever feels too settled" },
  Neptune: { noun: "your imagination", wants: "wants to soften the edges and drift past the literal" },
  Pluto: { noun: "your transformative intensity", wants: "wants to go all the way down or not at all" },
  Chiron: { noun: "your oldest wound", wants: "aches to be acknowledged so it can finally heal" },
  Lilith: { noun: "your untamed side", wants: "refuses to be managed or made polite" },
  "North Node": { noun: "your growth direction", wants: "keeps pulling you toward unfamiliar ground" },
  "South Node": { noun: "your old comfort zone", wants: "keeps offering the familiar way out" },
  Ascendant: { noun: "the way you come across", wants: "shapes every first impression you make" },
  Descendant: { noun: "what you look for in others", wants: "seeks completion through partnership" },
  "Medium Coeli": { noun: "your public direction", wants: "wants to be known for something that lasts" },
  "Imum Coeli": { noun: "your roots", wants: "needs somewhere safe to land" },
};

function capFirst(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Compose an interpretation from both planets' themes so every
 * pair × aspect combination reads differently. Three sentence structures
 * per aspect nature (picked deterministically per pair) keep adjacent
 * list items from opening the same way.
 */
function composeAspectText(p1: string, p2: string, nature: string, aspect: string): string {
  const t1 = PLANET_THEMES[p1] || { noun: `your ${p1}`, wants: "moves to its own rhythm" };
  const t2 = PLANET_THEMES[p2] || { noun: `your ${p2}`, wants: "moves to its own rhythm" };
  const a = t1.noun;
  const b = t2.noun;
  const w1 = t1.wants;
  const w2 = t2.wants;

  const hash = (p1 + p2 + aspect).split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);

  const TEMPLATES: Record<string, string[]> = {
    fusion: [
      `${capFirst(a)} and ${b} are welded together in you. The part of you that ${w1} and the part that ${w2} fire at the same moment, every time — there's no doing one without the other coming along. That gives you a concentrated, unmistakable intensity here; the catch is that you don't get a dimmer switch.`,
      `In your chart, ${a} and ${b} run on a single circuit. Whatever touches one lights up the other — so the side of you that ${w1} is permanently tangled with the side that ${w2}. People feel this fusion in you even when they can't name it.`,
      `${capFirst(a)} and ${b} act as one force in you. Where most people keep these separate, yours merged early — and the combination is stronger than either piece alone. Your job isn't to untangle them; it's to point the whole thing somewhere worth the voltage.`,
    ],
    harmony: [
      `${capFirst(a)} and ${b} cooperate without being asked. The part of you that ${w1} genuinely feeds the part that ${w2} — a truce most people have to negotiate, handed to you at birth. Gifts this quiet are easy to overlook; use this one on purpose.`,
      `There's an easy current between ${a} and ${b}. When one moves, the other moves with it — no friction, no committee meeting. Because it's always been this smooth, you may not realize how rare it is. Lean on it deliberately and it gets even stronger.`,
      `Some planets argue; in your chart, ${a} and ${b} finish each other's sentences. The instinct that ${w1} and the instinct that ${w2} pull in the same direction here, which makes this one of the low-maintenance strengths you can build a life on.`,
    ],
    opportunity: [
      `${capFirst(a)} and ${b} are on friendly terms, but the connection isn't automatic — you have to make the introduction. When you consciously bring the part of you that ${w1} together with the part that ${w2}, the result is better than either alone. This is a door that opens every time you knock.`,
      `There's an open channel between ${a} and ${b} that rewards attention. Left alone, nothing happens; actively worked, the side of you that ${w2} becomes a real ally to the side that ${w1}. Think of it as a skill you were pre-approved for but still have to practice.`,
      `When you deliberately connect ${a} with ${b}, things click. It's not a freebie like a trine — it's a standing invitation. The more often you let these two work a problem together, the more natural the partnership becomes.`,
    ],
    tension: [
      `${capFirst(a)} and ${b} are in a standing argument. One side of you ${w1}; another side ${w2} — and satisfying one usually shortchanges the other. It's uncomfortable by design: the friction won't let you go numb in either area, and over the years it builds a depth here that easier charts never develop.`,
      `You can feel the grind between ${a} and ${b} — two parts of you that want different things and refuse to pretend otherwise. Most days you manage it; some days it manages you. The way through isn't picking a winner. It's building a life with room for the part that ${w1} and the part that ${w2}.`,
      `${capFirst(a)} works against ${b} in your chart, the way a whetstone works against a blade. The part of you that ${w1} keeps colliding with the part that ${w2}, and every collision sharpens both. People with this aspect tend to earn real mastery here — precisely because nothing about it came free.`,
    ],
    polarity: [
      `${capFirst(a)} and ${b} hold opposite ends of a rope in your chart. Lean too far into one and the other yanks back — often through other people, who show up embodying whichever end you've been ignoring. The point isn't a permanent balance; it's noticing which end you're gripping right now.`,
      `Your chart stretches a line between ${a} and ${b}, and you live somewhere along it. Seasons of your life favor the part that ${w1}; others favor the part that ${w2}. Partners and close friends tend to mirror whichever side you've disowned — that's the opposition doing its teaching.`,
      `${capFirst(a)} faces off against ${b} across your chart. You'll be tempted to pick a side and outsource the other to someone close to you, but the assignment is harder and better: own both. The part of you that ${w2} isn't the enemy of the part that ${w1} — it's the other half of the same question.`,
    ],
    talent: [
      `${capFirst(a)} and ${b} link up at an unusual angle — and it works. You do something instinctive with this combination that other people would need a manual for: the part of you that ${w1} borrows tricks from the part that ${w2} without asking permission. It comes so easily you probably undervalue it. Don't.`,
      `There's a streak of originality where ${a} meets ${b} in your chart. The blend doesn't follow anyone's standard recipe, which is exactly why it's yours — an offbeat skill or perspective that shows up when you stop trying to do things the official way.`,
      `${capFirst(a)} and ${b} make an odd couple that happens to be productive. What ${w1} and what ${w2} shouldn't combine this smoothly, but in you they do — a quiet creative signature that nobody taught you and nobody else can quite copy.`,
    ],
    adjustment: [
      `${capFirst(a)} and ${b} never quite settle into a rhythm. Give the part of you that ${w1} what it asks for, and the part that ${w2} feels shortchanged — then vice versa. This isn't something you fix once; it's a calibration you'll keep refining, and you genuinely get better at it with age.`,
      `There's a persistent mismatch between ${a} and ${b} — not a war, just two instincts speaking different dialects. Neither is wrong. You manage this one with small, frequent adjustments rather than grand resolutions, like tuning an instrument that drifts a little every week.`,
      `${capFirst(a)} and ${b} sit at an awkward angle to each other — close enough to interact, too different to merge. The result is a blind spot you keep rediscovering: just when one side feels handled, the other needs attention. Awareness, not perfection, is the win condition here.`,
    ],
    irritation: [
      `${capFirst(a)} and ${b} rub against each other quietly — not a crisis, an itch. Small mismatches between what ${w1} and what ${w2} pile up until you finally address the pattern underneath. Pay attention to what specifically bugs you here; it's more informative than it looks.`,
      `There's a low-grade static between ${a} and ${b}. It won't ruin your day, but it shapes your habits — you may catch yourself overcompensating toward one side without noticing. Naming the friction out loud is most of the cure.`,
      `${capFirst(a)} and ${b} nag at each other in the background of your chart. This aspect whispers instead of shouting, so it's easy to dismiss — but the recurring little frustrations are pointing at a real pattern worth a closer look.`,
    ],
  };

  const variants = TEMPLATES[nature] || TEMPLATES["polarity"];
  return variants[hash % variants.length];
}

const NORMALIZED_ASPECT_INTERPRETATIONS = normalizeAspectKeys(ASPECT_INTERPRETATIONS);
const NORMALIZED_ANGLE_INTERPRETATIONS = normalizeAspectKeys(ANGLE_INTERPRETATIONS);

/** Get interpretation for an aspect, with composed pair-specific fallback */
function getAspectInterpretation(p1: string, p2: string, aspect: string): string {
  const key = aspectKey(p1, p2);
  const entry = NORMALIZED_ASPECT_INTERPRETATIONS[key];
  if (entry && entry[aspect]) return entry[aspect];

  // Check angle interpretations (Ascendant/Descendant)
  // Descendant is opposite Ascendant, so Descendant conjunction = Ascendant opposition, etc.
  const ASPECT_FLIP: Record<string, string> = { conjunction: "opposition", opposition: "conjunction", trine: "sextile", sextile: "trine", square: "square" };
  const other1 = p1 === "Ascendant" || p1 === "Descendant" ? p2 : p1;
  const angle1 = p1 === "Ascendant" || p1 === "Descendant" ? p1 : (p2 === "Ascendant" || p2 === "Descendant" ? p2 : null);
  if (angle1) {
    const ascKey = aspectKey("Ascendant", other1);
    const angleEntry = NORMALIZED_ANGLE_INTERPRETATIONS[ascKey];
    if (angleEntry) {
      const lookupAspect = angle1 === "Descendant" ? (ASPECT_FLIP[aspect] || aspect) : aspect;
      if (angleEntry[lookupAspect]) return angleEntry[lookupAspect];
    }
  }

  // Composed fallback — blend both planets' themes into aspect-specific prose
  // so every uncovered pair × aspect combination reads differently.
  const typeInfo = ASPECT_TYPE_INFO[aspect];
  if (!typeInfo) return "";
  return composeAspectText(p1, p2, typeInfo.nature, aspect);
}


function elementBg(sign: string): string {
  if (["Ari", "Leo", "Sag"].includes(sign)) return "bg-terracotta/15 border-terracotta/25";
  if (["Tau", "Vir", "Cap"].includes(sign)) return "bg-sage/15 border-sage/25";
  if (["Gem", "Lib", "Aqu"].includes(sign)) return "bg-amber/15 border-amber/25";
  return "bg-lavender/15 border-lavender/25";
}

export default function YouTab() {
  const router = useRouter();
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [openPlanet, setOpenPlanet] = useState<string | null>(null);
  const [openRuler, setOpenRuler] = useState<string | null>(null);
  const [risingOverride, setRisingOverride] = useState<string | null>(null);
  const [cuspDismissed, setCuspDismissed] = useState(false);
  const [openAspect, setOpenAspect] = useState<string | null>(null);
  const [aspectTab, setAspectTab] = useState<"strong" | "medium" | "mild">("strong");
  const [pageTab, setPageTab] = useState<"placements" | "aspects" | "insights">("placements");
  const [accountName, setAccountName] = useState<string | null>(null);

  useEffect(() => {
    async function loadChart() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Grab the user's actual name from their account
        const metaName = session.user.user_metadata?.name || null;
        if (metaName) setAccountName(metaName);

        const { data } = await supabase
          .from("charts")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (data) {
          // Recalculate client-side — no API call, no serverless dependency.
          // This runs the exact same calculateChart() in the browser.
          try {
            const recalc = calculateChart({
              name: data.name,
              birthDate: data.birth_date,
              birthTime: data.birth_time,
              unknownTime: data.unknown_time,
              latitude: data.latitude,
              longitude: data.longitude,
              cityName: data.city_name,
              zodiacSystem: data.zodiac_system || "tropical",
              ...(data.zodiac_system === "sidereal" ? { ayanamsa: data.ayanamsa || "lahiri" } : {}),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            }) as any;

            setChartData({
              name: metaName || data.name,
              birthDate: data.birth_date,
              birthTime: data.birth_time,
              unknownTime: data.unknown_time,
              cityName: data.city_name,
              latitude: data.latitude,
              longitude: data.longitude,
              timezone: data.timezone,
              bigThree: recalc.bigThree,
              planets: recalc.planets,
              houses: recalc.houses,
              aspects: recalc.aspects,
              specialPoints: recalc.specialPoints || [],
              midheaven: recalc.midheaven || null,
            });
          } catch (err) {
            console.error("[recalc] Client-side calculation failed:", err);
            // Fall back to stored data
            setChartData({
              name: metaName || data.name,
              birthDate: data.birth_date,
              birthTime: data.birth_time,
              unknownTime: data.unknown_time,
              cityName: data.city_name,
              latitude: data.latitude,
              longitude: data.longitude,
              timezone: data.timezone,
              bigThree: data.big_three,
              planets: data.planets,
              houses: data.houses,
              aspects: data.aspects,
              specialPoints: data.special_points || [],
              midheaven: data.midheaven || null,
            });
          }
          setIsLoading(false);
          return;
        }
      }

      const stored = sessionStorage.getItem("chartResult");
      if (stored) {
        setChartData(JSON.parse(stored));
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
    }

    loadChart();
  }, []);

  // Backfill specialPoints (including Lilith) + midheaven for older saved charts
  const [backfillDone, setBackfillDone] = useState(false);
  useEffect(() => {
    if (!chartData || backfillDone) return;
    const hasLilith = chartData.specialPoints?.some((p) => p.name === "Lilith");
    if (hasLilith && chartData.midheaven) return;
    if (!chartData.birthDate || !chartData.birthTime) return;
    if (!chartData.latitude || !chartData.longitude) return;

    setBackfillDone(true);
    let cancelled = false;
    console.log("[You] Backfilling chart data (Lilith missing or midheaven missing)...");
    fetch("/api/chart/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: chartData.name,
        birthDate: chartData.birthDate,
        birthTime: chartData.birthTime,
        latitude: chartData.latitude,
        longitude: chartData.longitude,
        timezone: chartData.timezone || "UTC",
      }),
    })
      .then((r) => {
        if (!r.ok) { console.error("[You] Backfill API returned", r.status); return null; }
        return r.json();
      })
      .then((fresh) => {
        if (cancelled || !fresh) return;
        console.log("[You] Backfill succeeded, specialPoints:", fresh.specialPoints?.map((p: { name: string }) => p.name));
        setChartData((prev) =>
          prev ? { ...prev, specialPoints: fresh.specialPoints || prev.specialPoints, midheaven: fresh.midheaven || prev.midheaven } : prev
        );
      })
      .catch((err) => { console.error("[You] Backfill failed:", err); });

    return () => { cancelled = true; };
  }, [chartData, backfillDone]);

  // Compute effective houses/bigThree with cusp override BEFORE useMemo that needs them
  const effectiveHouses = useMemo(() => {
    if (!chartData) return [];
    return risingOverride
      ? chartData.houses.map((h, i) => i === 0 ? { ...h, sign: risingOverride } : h)
      : chartData.houses;
  }, [chartData, risingOverride]);

  const effectiveBigThree = useMemo(() => {
    if (!chartData) return { sun: "", moon: "", rising: "" };
    return risingOverride
      ? { ...chartData.bigThree, rising: risingOverride }
      : chartData.bigThree;
  }, [chartData, risingOverride]);

  // Compute chart ruler, contradictions, and stelliums
  const chartRuler = useMemo(() => {
    if (!chartData) return null;
    return getChartRuler(chartData.planets, effectiveHouses, effectiveBigThree?.rising);
  }, [chartData, effectiveHouses, effectiveBigThree]);

  // Compute Sect Light (day/night chart)
  const sectLight = useMemo<SectLightInfo | null>(() => {
    if (!chartData) return null;
    return getSectLight(chartData.planets, effectiveHouses);
  }, [chartData, effectiveHouses]);

  // Compute Lord of the Year (annual profection)
  const lordOfTheYear = useMemo<LordOfTheYearInfo | null>(() => {
    if (!chartData?.birthDate) return null;
    return getLordOfTheYear(chartData.birthDate, chartData.planets, effectiveHouses);
  }, [chartData, effectiveHouses]);

  const contradictions = useMemo<Contradiction[]>(() => {
    if (!chartData) return [];
    return detectContradictions(chartData.planets);
  }, [chartData]);

  const stelliums = useMemo<Stellium[]>(() => {
    if (!chartData) return [];
    return detectStelliums(chartData.planets);
  }, [chartData]);

  // Ensure Lilith is always present — calculate client-side if missing from saved data
  const lilithFallback = useMemo(() => {
    if (!chartData) return null;
    const sp = chartData.specialPoints || [];
    const hasLilith = sp.some((p: { name: string }) => p.name === "Lilith");
    if (hasLilith) return null; // already have it
    if (!chartData.birthDate) return null;
    try {
      return getMeanLilithData(chartData.birthDate, chartData.birthTime || undefined);
    } catch {
      return null;
    }
  }, [chartData]);

  // Comprehensive chart analysis (patterns, dignities, balance, etc.)
  const chartAnalysis = useMemo<ChartAnalysis | null>(() => {
    if (!chartData) return null;
    const noTime = chartData.unknownTime;
    const sp = chartData.specialPoints || [];
    const allPointsRaw = lilithFallback
      ? [...sp, { ...lilithFallback, house: lilithFallback.house != null ? String(lilithFallback.house) : null }]
      : sp;
    // With no accurate birth time, houses and angles are unreliable — strip them
    // so house-emphasis / angular / sect insights don't surface (consistent with
    // the rest of the chart hiding houses for unknown-time charts).
    const allPoints = noTime ? allPointsRaw.map((p) => ({ ...p, house: null })) : allPointsRaw;
    const planetsForAnalysis = noTime ? chartData.planets.map((p) => ({ ...p, house: null })) : chartData.planets;
    const housesForAnalysis = noTime ? [] : chartData.houses;
    const mhAbsPos = noTime ? undefined : (chartData.midheaven?.absPosition ?? undefined);
    return analyzeChart(planetsForAnalysis, housesForAnalysis, chartData.aspects, allPoints, mhAbsPos);
  }, [chartData, lilithFallback]);

  if (isLoading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-terracotta/30 border-t-terracotta rounded-full animate-spin" role="status" aria-label="Loading" />
      </main>
    );
  }

  if (!chartData) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <p className="text-secondary text-lg mb-6">You haven&apos;t calculated your chart yet.</p>
        <button
          onClick={() => router.push("/chart/new")}
          className="px-8 py-3 rounded-full bg-terracotta text-cream font-semibold text-sm
                     tracking-wide hover:bg-terracotta-light active:scale-[0.98] transition-all"
        >
          Calculate my chart
        </button>
      </main>
    );
  }

  const { name, bigThree, planets, houses, unknownTime, risingCusp, specialPoints: rawSpecialPoints = [], midheaven } = chartData;
  const specialPointsBuilt = lilithFallback ? [...rawSpecialPoints, lilithFallback] : rawSpecialPoints;
  // Without an accurate birth time, the Ascendant, houses, and angles can't be
  // calculated reliably. We strip house data from points so the UI never
  // asserts an unreliable house placement as fact for unknown-time charts.
  const specialPoints = unknownTime
    ? specialPointsBuilt.map((p) => ({ ...p, house: null }))
    : specialPointsBuilt;

  return (
    <main className="flex-1 flex flex-col px-5 py-6 lg:pt-8 max-w-lg lg:max-w-2xl mx-auto w-full">
      {/* Header */}
      <div className="text-center mb-1 pt-1">
        <p className="text-[9px] tracking-[0.28em] uppercase font-bold mb-1.5" style={{ color: "var(--brass)" }}>
          Your chart
        </p>
        <h1
          style={{ fontFamily: "var(--font-script)", fontSize: 50, lineHeight: 1, fontWeight: 400, color: "var(--foreground)" }}
        >
          {name.split(" ")[0]}
        </h1>
        <p className="text-[11.5px] mt-2" style={{ color: "var(--foreground-muted)" }}>
          {chartData.birthDate} · {chartData.birthTime}
          {unknownTime && " (approx)"}
          {chartData.cityName ? ` · ${chartData.cityName}` : ""}
        </p>
        <button
          onClick={() => router.push("/chart/new?edit=true")}
          className="mt-3 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full
                     text-[10px] tracking-[0.15em] uppercase font-medium
                     active:scale-[0.98] transition-all"
          style={{
            border: "0.5px solid rgba(201, 169, 97, 0.3)",
            color: "var(--brass)",
          }}
        >
          Edit chart
        </button>
      </div>

      {/* Chart Wheel — plum star-map */}
      <div className="mt-4 mb-2">
        <ChartWheelStar planets={planets} houses={unknownTime ? [] : effectiveHouses} aspects={chartData.aspects || []} />
      </div>

      {/* Aspect legend */}
      <div className="flex justify-center items-center flex-wrap gap-4 mt-2.5 mb-1">
        <span className="inline-flex items-center gap-1.5 text-[9px] tracking-[0.14em] uppercase" style={{ color: "var(--foreground-faint)" }}>
          <span style={{ width: 16, borderTop: "2px solid #79aee0" }} />Harmonious
        </span>
        <span className="inline-flex items-center gap-1.5 text-[9px] tracking-[0.14em] uppercase" style={{ color: "var(--foreground-faint)" }}>
          <span style={{ width: 16, borderTop: "2px dashed #e08c7a" }} />Challenging
        </span>
        <span className="inline-flex items-center gap-1.5 text-[9px] tracking-[0.14em] uppercase" style={{ color: "var(--foreground-faint)" }}>
          <span style={{ width: 16, borderTop: "2px solid #e6cf8c" }} />Conjunction
        </span>
      </div>

      {/* Big 3 — Sun / Moon / Rising (Rising hidden when birth time is unknown) */}
      <div className="flex justify-center mt-3.5 mb-4">
        {[
          { label: "Sun", sign: effectiveBigThree.sun, glyph: "☉" },
          { label: "Moon", sign: effectiveBigThree.moon, glyph: "☽" },
          ...(unknownTime ? [] : [{ label: "Rising", sign: effectiveBigThree.rising, glyph: "↑" }]),
        ].map(({ label, sign, glyph }, i) => (
          <div
            key={label}
            className="flex-1 text-center px-1.5"
            style={{ borderLeft: i === 0 ? "none" : "1px solid var(--border-card)", maxWidth: 130 }}
          >
            <span className="block leading-none" style={{ fontFamily: "var(--font-glyph, serif)", fontSize: 19, color: "var(--brass)" }}>{glyph}</span>
            <span className="block mt-1.5" style={{ fontFamily: "var(--font-heading)", fontSize: 20, letterSpacing: "0.03em", color: "var(--foreground)" }}>{SIGN_NAMES[sign] || sign}</span>
            <span className="block mt-1 text-[8.5px] tracking-[0.2em] uppercase font-semibold" style={{ color: "var(--foreground-faint)" }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Birth time unknown — explain what can't be shown */}
      {unknownTime && (
        <div
          className="rounded-xl px-4 py-3 mb-4 text-center"
          style={{ backgroundColor: "var(--plum)", border: "0.5px solid rgba(201, 169, 97, 0.25)" }}
        >
          <p className="text-[11px] leading-relaxed" style={{ color: "var(--foreground-secondary)" }}>
            Your birth time is unknown, so your rising sign, houses, and angles
            (like the Midheaven) can&apos;t be calculated accurately — they&apos;re hidden
            here. Your Sun, Moon, and planetary signs are still accurate.
          </p>
          <button
            onClick={() => router.push("/chart/new?edit=true")}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] tracking-[0.15em] uppercase font-medium active:scale-[0.98] transition-all"
            style={{ border: "0.5px solid rgba(201, 169, 97, 0.4)", color: "var(--brass)" }}
          >
            Add your birth time
          </button>
        </div>
      )}

      {/* Share as branded image */}
      <div className="flex justify-center mb-4">
        <ShareCard
          type="natal"
          name={name}
          subtitle={unknownTime
            ? `${SIGN_FULL[effectiveBigThree.sun] || effectiveBigThree.sun} Sun · ${SIGN_FULL[effectiveBigThree.moon] || effectiveBigThree.moon} Moon`
            : `${SIGN_FULL[effectiveBigThree.sun] || effectiveBigThree.sun} Sun · ${SIGN_FULL[effectiveBigThree.moon] || effectiveBigThree.moon} Moon · ${SIGN_FULL[effectiveBigThree.rising] || effectiveBigThree.rising} Rising`}
          highlights={planets?.slice(0, 6).map((p: any) => ({
            label: p.name,
            value: `${SIGN_FULL[p.sign] || p.sign}`,
          }))}
        />
      </div>

      {/* ═══ PAGE TAB SWITCHER ═══ */}
      <div className="sticky top-0 z-[5] py-2 mb-4" style={{ background: "var(--background)" }}>
        <div className="flex gap-[5px] p-1 rounded-[13px]" style={{ background: "var(--background-card)" }}>
          {([
            { key: "placements" as const, label: "Placements" },
            { key: "aspects" as const, label: "Aspects" },
            { key: "insights" as const, label: "Insights" },
          ]).map((tab) => {
            const active = pageTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setPageTab(tab.key)}
                className="flex-1 py-[11px] rounded-[10px] text-[10px] tracking-[0.1em] uppercase font-bold transition-colors"
                style={{ background: active ? "var(--brass)" : "transparent", color: active ? "#1a1230" : "var(--foreground-muted)" }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══ INSIGHTS TAB ═══ */}
      {pageTab === "insights" && chartAnalysis && (
        <ChartInsightsPanel analysis={chartAnalysis} planets={[...chartData.planets, ...(chartData.specialPoints || []).map(sp => ({ ...sp, house: sp.house != null ? String(sp.house) : null }))]} />
      )}

      {/* ═══ PLACEMENTS TAB ═══ */}
      {pageTab === "placements" && (<>

      {/* ═══ CHART RULER (needs an accurate birth time) ═══ */}
      {!unknownTime && chartRuler && (
        <div className="rounded-xl px-4 py-4 mb-8" style={{ backgroundColor: "var(--plum)", border: "0.5px solid rgba(201, 169, 97, 0.2)" }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg" style={{ fontFamily: "var(--font-heading)", color: "var(--brass)" }}>
              {PLANET_SYMBOLS[chartRuler.planet] || "?"}
            </span>
            <span className="text-[9px] tracking-[0.25em] uppercase font-medium" style={{ color: "var(--brass)" }}>
              Your chart is ruled by {chartRuler.planet}
            </span>
            <InfoTip
              term="Chart Ruler"
              explanation="The planet that rules your Rising sign. It's the single most important planet in your chart — it colors how you approach everything in life. Whatever this planet touches in your chart, amplify it. It's more true for you than for most people."
            />
          </div>
          <h3
            className="text-lg mb-2"
            style={{ fontFamily: "var(--font-heading)", color: "#f0e6d2" }}
          >
            {chartRuler.planet} in {SIGN_FULL[chartRuler.rulerSign] || chartRuler.rulerSign}
            {chartRuler.coRuler && (
              <span className="text-sm font-normal ml-2" style={{ color: "rgba(240, 230, 210, 0.6)" }}>
                + {chartRuler.coRuler}
              </span>
            )}
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: "rgba(240, 230, 210, 0.75)" }}>
            {chartRuler.summary}
          </p>
        </div>
      )}

      {/* ═══ STELLIUMS ═══ */}
      {stelliums.length > 0 && (
        <div className="flex flex-col gap-2 mb-8">
          {stelliums.map((s) => (
            <div
              key={s.sign}
              className={`rounded-xl border px-4 py-3 ${elementBg(s.sign).replace("border-", "border-").replace("/25", "/15")}`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`text-[10px] uppercase tracking-widest font-bold ${elementColor(s.sign)}`}>
                  {SIGN_FULL[s.sign] || s.sign} Stellium · {s.planets.length} planets
                </span>
                <InfoTip
                  term="Stellium"
                  explanation={getGlossaryEntry("Stellium")?.short || "Three or more planets in the same sign — a massive concentration of energy."}
                />
              </div>
              <p className="text-secondary text-sm leading-relaxed">
                {s.summary}
              </p>
            </div>
          ))}
        </div>
      )}


      {/* ═══ SECT LIGHT (collapsible) ═══ */}
      {!unknownTime && sectLight && (
        <div className="placement-card transition-colors duration-200 mb-3">
          <button
            onClick={() => setOpenRuler(openRuler === "sect" ? null : "sect")}
            className="flex items-center justify-between py-3 px-4 w-full text-left active:scale-[0.99] transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="text-amber text-lg" style={{ fontFamily: "var(--font-heading)" }}>
                {sectLight.sectLight === "Sun" ? "☉" : "☽"}
              </span>
              <div>
                <span className="placement-card-text text-sm font-medium">
                  Your sect light
                </span>
                <span className="placement-card-text-secondary text-xs ml-2">
                  {sectLight.sect === "day" ? "Day" : "Night"} chart · {sectLight.sectLight}
                </span>
              </div>
              <InfoTip
                term="Sect Light"
                explanation="Sect divides charts into day and night teams. Your sect light is the leader of your team — the Sun for day charts, the Moon for night charts. It's the planet with the most natural authority in your chart. Most apps ignore sect entirely, but it changes how every other planet performs."
              />
            </div>
            <svg aria-hidden="true" className={`w-4 h-4 placement-card-text-muted flex-shrink-0 transition-transform duration-200 ${openRuler === "sect" ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div className={`overflow-hidden transition-all duration-300 ease-out ${openRuler === "sect" ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"}`}>
            <div className="px-4 pb-4 border-t" style={{ borderColor: "var(--border-card)" }}>
              <h3
                className="text-lg placement-card-text mt-3 mb-2"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {sectLight.sect === "day" ? "Day" : "Night"} chart · {sectLight.sectLight} in {SIGN_FULL[sectLight.sectLightSign] || sectLight.sectLightSign}
              </h3>
              <p className="placement-card-text-secondary text-sm leading-relaxed">
                {sectLight.summary}
              </p>
              <div className="mt-3 flex gap-3 text-xs placement-card-text-secondary">
                <span>Benefic: <span className="placement-card-text">{sectLight.benefic}</span></span>
                <span>Malefic: <span className="placement-card-text">{sectLight.malefic}</span></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ LORD OF THE YEAR (collapsible) ═══ */}
      {!unknownTime && lordOfTheYear && (
        <div className="placement-card transition-colors duration-200 mb-8">
          <button
            onClick={() => setOpenRuler(openRuler === "loy" ? null : "loy")}
            className="flex items-center justify-between py-3 px-4 w-full text-left active:scale-[0.99] transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="text-lavender text-lg" style={{ fontFamily: "var(--font-heading)" }}>
                {PLANET_SYMBOLS[lordOfTheYear.lordPlanet] || "★"}
              </span>
              <div>
                <span className="placement-card-text text-sm font-medium">
                  Lord of the Year
                </span>
                <span className="placement-card-text-secondary text-xs ml-2">
                  {lordOfTheYear.lordPlanet} · {ORDINAL[lordOfTheYear.profectionHouse] || lordOfTheYear.profectionHouse + "th"} house
                </span>
              </div>
              <InfoTip
                term="Lord of the Year"
                explanation="Every birthday, your chart 'profects' — advancing one house. The planet that rules the sign on that house becomes your Lord of the Year. It's the planet running the show for the next 12 months. Transits to this planet hit harder, returns of this planet mark turning points, and its natal condition describes your year's flavor."
              />
            </div>
            <svg aria-hidden="true" className={`w-4 h-4 placement-card-text-muted flex-shrink-0 transition-transform duration-200 ${openRuler === "loy" ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div className={`overflow-hidden transition-all duration-300 ease-out ${openRuler === "loy" ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"}`}>
            <div className="px-4 pb-4 border-t" style={{ borderColor: "var(--border-card)" }}>
              <h3
                className="text-lg placement-card-text mt-3 mb-2"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {lordOfTheYear.lordPlanet} · {ORDINAL[lordOfTheYear.profectionHouse] || lordOfTheYear.profectionHouse + "th"} house year
              </h3>
              <p className="placement-card-text-secondary text-sm leading-relaxed">
                {lordOfTheYear.summary}
              </p>
              <p className="mt-2 text-xs placement-card-text-secondary">
                Changes on your next birthday · {lordOfTheYear.nextBirthday}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex-1 h-px bg-foreground/10" />
        <span className="text-lavender/40 text-lg">&#x2609;</span>
        <div className="flex-1 h-px bg-foreground/10" />
      </div>

      {/* Planetary placements — accordion style */}
      <h2
        className="text-xl text-foreground mb-4"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Your placements
      </h2>

      <div className="flex flex-col gap-2 mb-8">
        {planets.map((planet) => {
          const rulerTags: string[] = [];
          if (chartRuler && planet.name === chartRuler.planet) rulerTags.push("CHART RULER");
          if (sectLight && planet.name === sectLight.sectLight) rulerTags.push("SECT LIGHT");
          if (lordOfTheYear && planet.name === lordOfTheYear.lordPlanet) rulerTags.push("LORD OF THE YEAR");
          return (
            <PlacementAccordion
              key={planet.name}
              planetName={planet.name}
              planetSymbol={PLANET_SYMBOLS[planet.name] || "?"}
              sign={planet.sign}
              position={planet.position}
              house={unknownTime ? null : planet.house}
              retrograde={planet.retrograde}
              isOpen={openPlanet === planet.name}
              onToggle={() =>
                setOpenPlanet(openPlanet === planet.name ? null : planet.name)
              }
              tags={rulerTags.length > 0 ? rulerTags : undefined}
            />
          );
        })}

        {/* ═══ RISING SIGN ═══ */}
        {!unknownTime && effectiveBigThree.rising && (
          <div className="placement-card transition-colors duration-200">
            <button
              onClick={(e) => {
                const opening = openPlanet !== "_Rising";
                setOpenPlanet(opening ? "_Rising" : null);
                if (opening) { const el = e.currentTarget; setTimeout(() => el?.scrollIntoView({ behavior: "smooth", block: "start" }), 100); }
              }}
              className="flex items-center justify-between py-3 px-4 w-full text-left active:scale-[0.99] transition-all"
            >
              <div className="flex items-center gap-3">
                <span className={`text-lg ${elementColor(effectiveBigThree.rising)}`} style={{ fontFamily: "var(--font-heading)" }}>ASC</span>
                <span className="placement-card-text text-sm font-medium">Rising Sign</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${elementColor(effectiveBigThree.rising)}`}>
                  {SIGN_NAMES[effectiveBigThree.rising] || effectiveBigThree.rising}
                </span>
                <svg aria-hidden="true" className={`w-4 h-4 placement-card-text-muted flex-shrink-0 transition-transform duration-200 ${openPlanet === "_Rising" ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-out ${openPlanet === "_Rising" ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"}`}>
              <div className="px-4 pb-5 pt-1">
                <div className="h-px bg-lavender/15 mb-5" />
                {(() => {
                  const r = RISING_DESCRIPTIONS[effectiveBigThree.rising];
                  const color = elementColor(effectiveBigThree.rising);
                  if (!r) return <p className="placement-card-text-secondary text-sm">No interpretation available.</p>;
                  return (
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="placement-card-text-secondary text-[10px] uppercase tracking-widest">Your Rising Sign</span>
                        <InfoTip term="Rising Sign" explanation="Your Rising sign (or Ascendant) is the sign that was on the eastern horizon when you were born. It's your first impression, your physical energy, and the lens through which you experience life. It's arguably the most personal point in your chart." />
                      </div>
                      <h3 className={`text-xl ${color} mb-3`} style={{ fontFamily: "var(--font-heading)" }}>
                        {SIGN_FULL[effectiveBigThree.rising] || effectiveBigThree.rising} Rising
                      </h3>
                      <p className="placement-card-text text-[15px] leading-relaxed mb-5">{r.summary}</p>
                      <div className="mb-4">
                        <p className={`${color} text-[11px] uppercase tracking-widest mb-1.5 font-semibold opacity-80`}>How you look and move</p>
                        <p className="placement-card-text-secondary text-sm leading-relaxed">{r.appearance}</p>
                      </div>
                      <div className="mb-4">
                        <p className={`${color} text-[11px] uppercase tracking-widest mb-1.5 font-semibold opacity-80`}>In relationships</p>
                        <p className="placement-card-text-secondary text-sm leading-relaxed">{r.relationships}</p>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <p className="text-secondary text-[11px] uppercase tracking-widest mb-1.5 font-semibold">The shadow</p>
                          <p className="placement-card-text-secondary text-sm leading-relaxed">{r.shadow}</p>
                        </div>
                        <div>
                          <p className={`${color} text-[11px] uppercase tracking-widest mb-1.5 font-semibold opacity-80`}>Where you grow</p>
                          <p className="placement-card-text-secondary text-sm leading-relaxed">{r.advice}</p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* ═══ MIDHEAVEN ═══ */}
        {!unknownTime && midheaven && (
          <div className="placement-card transition-colors duration-200">
            <button
              onClick={(e) => { const o = openPlanet !== "_MC"; setOpenPlanet(o ? "_MC" : null); if (o) { const el = e.currentTarget; setTimeout(() => el?.scrollIntoView({ behavior: "smooth", block: "start" }), 100); } }}
              className="flex items-center justify-between py-3 px-4 w-full text-left active:scale-[0.99] transition-all"
            >
              <div className="flex items-center gap-3">
                <span className={`text-lg ${elementColor(midheaven.sign)}`} style={{ fontFamily: "var(--font-heading)" }}>MC</span>
                <span className="placement-card-text text-sm font-medium">Midheaven</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${elementColor(midheaven.sign)}`}>
                  {SIGN_NAMES[midheaven.sign] || midheaven.sign}
                </span>
                <svg aria-hidden="true" className={`w-4 h-4 placement-card-text-muted flex-shrink-0 transition-transform duration-200 ${openPlanet === "_MC" ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-out ${openPlanet === "_MC" ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"}`}>
              <div className="px-4 pb-5 pt-1">
                <div className="h-px bg-lavender/15 mb-5" />
                {(() => {
                  const mc = MC_DESCRIPTIONS[midheaven.sign];
                  const color = elementColor(midheaven.sign);
                  if (!mc) return <p className="placement-card-text-secondary text-sm">No interpretation available.</p>;
                  return (
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="placement-card-text-secondary text-[10px] uppercase tracking-widest">Your Midheaven</span>
                        <InfoTip term="Midheaven" explanation="Your Midheaven (MC) is the highest point in your chart — it represents your career path, public reputation, and what you're known for in the world." />
                      </div>
                      <h3 className={`text-xl ${color} mb-3`} style={{ fontFamily: "var(--font-heading)" }}>
                        Midheaven in {SIGN_FULL[midheaven.sign] || midheaven.sign}
                      </h3>
                      <p className="placement-card-text text-[15px] leading-relaxed mb-5">{mc.summary}</p>
                      <div className="mb-4">
                        <p className={`${color} text-[11px] uppercase tracking-widest mb-1.5 font-semibold opacity-80`}>Career paths</p>
                        <p className="placement-card-text-secondary text-sm leading-relaxed">{mc.career}</p>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <p className="text-secondary text-[11px] uppercase tracking-widest mb-1.5 font-semibold">The shadow</p>
                          <p className="placement-card-text-secondary text-sm leading-relaxed">{mc.shadow}</p>
                        </div>
                        <div>
                          <p className={`${color} text-[11px] uppercase tracking-widest mb-1.5 font-semibold opacity-80`}>Where you grow</p>
                          <p className="placement-card-text-secondary text-sm leading-relaxed">{mc.advice}</p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* ═══ CHIRON ═══ */}
        {(() => {
          const chiron = specialPoints.find((p) => p.name === "Chiron");
          if (!chiron) return null;
          return (
            <div className="placement-card transition-colors duration-200">
              <button
                onClick={(e) => { const o = openPlanet !== "_Chiron"; setOpenPlanet(o ? "_Chiron" : null); if (o) { const el = e.currentTarget; setTimeout(() => el?.scrollIntoView({ behavior: "smooth", block: "start" }), 100); } }}
                className="flex items-center justify-between py-3 px-4 w-full text-left active:scale-[0.99] transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className={`text-lg ${elementColor(chiron.sign)}`} style={{ fontFamily: "var(--font-heading)" }}>{"\u26B7"}</span>
                  <span className="placement-card-text text-sm font-medium">Chiron</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className={`text-sm font-medium ${elementColor(chiron.sign)}`}>
                      {SIGN_NAMES[chiron.sign] || chiron.sign}
                    </span>
                    <span className="placement-card-text-secondary text-xs ml-2">
                      {chiron.position.toFixed(0)}&deg;
                      {chiron.house && ` · ${ORDINAL[houseToNum(chiron.house) || 0] || ""} House`}
                    </span>
                  </div>
                  <svg aria-hidden="true" className={`w-4 h-4 placement-card-text-muted flex-shrink-0 transition-transform duration-200 ${openPlanet === "_Chiron" ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ease-out ${openPlanet === "_Chiron" ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"}`}>
                <div className="px-4 pb-5 pt-1">
                  <div className="h-px bg-lavender/15 mb-5" />
                  {(() => {
                    const ch = CHIRON_DESCRIPTIONS[chiron.sign];
                    const color = elementColor(chiron.sign);
                    if (!ch) return <p className="placement-card-text-secondary text-sm">No interpretation available.</p>;
                    return (
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="placement-card-text-secondary text-[10px] uppercase tracking-widest">The Wounded Healer</span>
                          <InfoTip term="Chiron" explanation="Chiron is the 'wounded healer' — it shows your deepest wound and, paradoxically, the area where you become the greatest healer for others. It's not something to fix; it's something to work with." />
                        </div>
                        <h3 className={`text-xl ${color} mb-3`} style={{ fontFamily: "var(--font-heading)" }}>
                          Chiron in {SIGN_FULL[chiron.sign] || chiron.sign}
                        </h3>
                        <p className="placement-card-text text-[15px] leading-relaxed mb-5">{ch.wound}</p>
                        <div className="mb-4">
                          <p className={`${color} text-[11px] uppercase tracking-widest mb-1.5 font-semibold opacity-80`}>Life patterns</p>
                          <p className="placement-card-text-secondary text-sm leading-relaxed">{ch.patterns}</p>
                        </div>
                        <div className="mb-4">
                          <p className={`${color} text-[11px] uppercase tracking-widest mb-1.5 font-semibold opacity-80`}>Your healing gift</p>
                          <p className="placement-card-text-secondary text-sm leading-relaxed">{ch.healing}</p>
                        </div>
                        <div className="mb-4">
                          <p className={`${color} text-[11px] uppercase tracking-widest mb-1.5 font-semibold opacity-80`}>Working with it</p>
                          <p className="placement-card-text-secondary text-sm leading-relaxed">{ch.advice}</p>
                        </div>
                        {(() => {
                          const hNum = houseToNum(chiron.house);
                          if (!hNum || !CHIRON_HOUSE[hNum]) return null;
                          return (
                            <div className="mt-2 pt-5 border-t border-lavender/15">
                              <span className="placement-card-text-secondary text-[10px] uppercase tracking-widest mb-2 block">
                                Where it plays out · {ORDINAL[hNum]} house
                              </span>
                              <p className="placement-card-text-secondary text-sm leading-relaxed">{CHIRON_HOUSE[hNum]}</p>
                            </div>
                          );
                        })()}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          );
        })()}

        {/* ═══ NORTH/SOUTH NODE ═══ */}
        {(() => {
          const northNode = specialPoints.find((p) => p.name === "North Node");
          const southNode = specialPoints.find((p) => p.name === "South Node");
          if (!northNode) return null;
          return (
            <div className="placement-card transition-colors duration-200">
              <button
                onClick={(e) => { const o = openPlanet !== "_Nodes"; setOpenPlanet(o ? "_Nodes" : null); if (o) { const el = e.currentTarget; setTimeout(() => el?.scrollIntoView({ behavior: "smooth", block: "start" }), 100); } }}
                className="flex items-center justify-between py-3 px-4 w-full text-left active:scale-[0.99] transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className={`text-lg ${elementColor(northNode.sign)}`} style={{ fontFamily: "var(--font-heading)" }}>{"\u260A"}</span>
                  <span className="placement-card-text text-sm font-medium">Nodal Axis</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${elementColor(northNode.sign)}`}>
                    {SIGN_NAMES[northNode.sign] || northNode.sign}
                  </span>
                  <span className="placement-card-text-secondary text-xs mx-1">/</span>
                  <span className={`text-sm font-medium ${elementColor(southNode?.sign || "")}`}>
                    {southNode ? SIGN_NAMES[southNode.sign] || southNode.sign : ""}
                  </span>
                  <svg aria-hidden="true" className={`w-4 h-4 placement-card-text-muted flex-shrink-0 transition-transform duration-200 ${openPlanet === "_Nodes" ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ease-out ${openPlanet === "_Nodes" ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"}`}>
                <div className="px-4 pb-5 pt-1">
                  <div className="h-px bg-lavender/15 mb-5" />
                  {(() => {
                    const nd = NORTH_NODE_DESCRIPTIONS[northNode.sign];
                    const color = elementColor(northNode.sign);
                    if (!nd) return <p className="placement-card-text-secondary text-sm">No interpretation available.</p>;
                    return (
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="placement-card-text-secondary text-[10px] uppercase tracking-widest">Your Nodal Axis</span>
                          <InfoTip term="Nodal Axis" explanation="The North Node is your soul's growth direction — what you're here to learn in this lifetime. The South Node is your comfort zone — talents you came in with but need to grow beyond. Think of it as 'where you've been vs. where you're going.'" />
                        </div>
                        <div className="flex items-center gap-2 mb-4 mt-2">
                          <div className="flex-1">
                            <p className="placement-card-text-secondary text-[10px] uppercase tracking-widest font-semibold mb-1">Growing Toward</p>
                            <p className={`text-sm font-semibold ${color}`}>
                              {SIGN_FULL[northNode.sign] || northNode.sign}
                            </p>
                          </div>
                          <div className="w-px h-12 bg-foreground/10" />
                          <div className="flex-1">
                            <p className="placement-card-text-secondary text-[10px] uppercase tracking-widest font-semibold mb-1">Coming From</p>
                            <p className={`text-sm font-semibold ${elementColor(southNode?.sign || "")}`}>
                              {southNode ? SIGN_FULL[southNode.sign] || southNode.sign : "\u2014"}
                            </p>
                          </div>
                        </div>
                        <p className="placement-card-text text-[15px] leading-relaxed mb-5">{nd.direction}</p>
                        <div className="mb-4">
                          <p className={`${color} text-[11px] uppercase tracking-widest mb-1.5 font-semibold opacity-80`}>Your comfort zone</p>
                          <p className="placement-card-text-secondary text-sm leading-relaxed">{nd.comfort}</p>
                        </div>
                        <div className="mb-4">
                          <p className="text-secondary text-[11px] uppercase tracking-widest mb-1.5 font-semibold">Patterns to notice</p>
                          <p className="placement-card-text-secondary text-sm leading-relaxed">{nd.patterns}</p>
                        </div>
                        <div className="mb-4">
                          <p className={`${color} text-[11px] uppercase tracking-widest mb-1.5 font-semibold opacity-80`}>The lesson</p>
                          <p className="placement-card-text-secondary text-sm leading-relaxed">{nd.advice}</p>
                        </div>
                        {(() => {
                          const hNum = houseToNum(northNode.house);
                          if (!hNum || !NODE_HOUSE[hNum]) return null;
                          return (
                            <div className="mt-2 pt-5 border-t border-lavender/15">
                              <span className="placement-card-text-secondary text-[10px] uppercase tracking-widest mb-2 block">
                                Where it plays out · {ORDINAL[hNum]} house
                              </span>
                              <p className="placement-card-text-secondary text-sm leading-relaxed">{NODE_HOUSE[hNum]}</p>
                            </div>
                          );
                        })()}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          );
        })()}

        {/* ═══ BLACK MOON LILITH ═══ */}
        {(() => {
          const lilith = specialPoints.find((p) => p.name === "Lilith");
          if (!lilith) return null;
          return (
            <div className="placement-card transition-colors duration-200">
              <button
                onClick={(e) => { const o = openPlanet !== "_Lilith"; setOpenPlanet(o ? "_Lilith" : null); if (o) { const el = e.currentTarget; setTimeout(() => el?.scrollIntoView({ behavior: "smooth", block: "start" }), 100); } }}
                className="flex items-center justify-between py-3 px-4 w-full text-left active:scale-[0.99] transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className={`text-lg ${elementColor(lilith.sign)}`} style={{ fontFamily: "var(--font-heading)" }}>{"⚸"}</span>
                  <span className="placement-card-text text-sm font-medium">Black Moon Lilith</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${elementColor(lilith.sign)}`}>
                    {SIGN_NAMES[lilith.sign] || lilith.sign}
                  </span>
                  <svg aria-hidden="true" className={`w-4 h-4 placement-card-text-muted flex-shrink-0 transition-transform duration-200 ${openPlanet === "_Lilith" ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ease-out ${openPlanet === "_Lilith" ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"}`}>
                <div className="px-4 pb-5 pt-1">
                  <div className="h-px bg-lavender/15 mb-5" />
                  {(() => {
                    const li = LILITH_DESCRIPTIONS[lilith.sign];
                    const color = elementColor(lilith.sign);
                    if (!li) return <p className="placement-card-text-secondary text-sm">No interpretation available.</p>;
                    return (
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="placement-card-text-secondary text-[10px] uppercase tracking-widest">The Dark Feminine</span>
                          <InfoTip term="Black Moon Lilith" explanation="Lilith represents your wild, untamed energy — the parts of you that society tried to suppress. It shows where you were shamed, what you buried, and the raw power you reclaim when you stop apologizing for who you are." />
                        </div>
                        <h3 className={`text-xl ${color} mb-3`} style={{ fontFamily: "var(--font-heading)" }}>
                          Lilith in {SIGN_FULL[lilith.sign] || lilith.sign}
                        </h3>
                        <p className="placement-card-text text-[15px] leading-relaxed mb-5">{li.shadow}</p>
                        <div className="mb-4">
                          <p className={`${color} text-[11px] uppercase tracking-widest mb-1.5 font-semibold opacity-80`}>Your raw power</p>
                          <p className="placement-card-text-secondary text-sm leading-relaxed">{li.power}</p>
                        </div>
                        <div className="mb-4">
                          <p className={`${color} text-[11px] uppercase tracking-widest mb-1.5 font-semibold opacity-80`}>Reclaiming it</p>
                          <p className="placement-card-text-secondary text-sm leading-relaxed">{li.reclamation}</p>
                        </div>
                        {(() => {
                          const hNum = houseToNum(lilith.house);
                          if (!hNum) return null;
                          return (
                            <div className="mt-2 pt-5 border-t border-lavender/15">
                              <span className="placement-card-text-secondary text-[10px] uppercase tracking-widest mb-2 block">
                                Where it plays out · {ORDINAL[hNum]} house
                              </span>
                              <p className="placement-card-text-secondary text-sm leading-relaxed">
                                Lilith in the {ORDINAL[hNum]} house means this energy shows up in your {
                                  hNum === 1 ? "identity and first impressions" :
                                  hNum === 2 ? "finances, self-worth, and values" :
                                  hNum === 3 ? "communication and daily interactions" :
                                  hNum === 4 ? "home, family, and inner world" :
                                  hNum === 5 ? "creativity, romance, and self-expression" :
                                  hNum === 6 ? "daily routines, health, and work" :
                                  hNum === 7 ? "partnerships and close relationships" :
                                  hNum === 8 ? "intimacy, shared resources, and transformation" :
                                  hNum === 9 ? "beliefs, travel, and higher learning" :
                                  hNum === 10 ? "career, public image, and authority" :
                                  hNum === 11 ? "friendships, community, and future vision" :
                                  "spirituality, solitude, and the unconscious"
                                }.
                              </p>
                            </div>
                          );
                        })()}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          );
        })()}
      </div>
      </>)}

      {/* ═══ ASPECTS TAB (tensions + aspects) ═══ */}
      {pageTab === "aspects" && (<>

      {/* ═══ TENSIONS ═══ */}
      {contradictions.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <h2
              className="text-xl text-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Your tensions
            </h2>
            <InfoTip
              term="Tensions"
              explanation="Contradictions between your placements aren't mistakes — they're where your complexity lives. These tensions create inner friction, but they also create depth. Most interesting people have at least a few."
            />
          </div>
          <p className="text-secondary text-sm mb-6">
            Your chart has placements that pull in opposite directions. That&apos;s not a flaw — it&apos;s complexity.
          </p>

          <div className="flex flex-col gap-4">
            {contradictions.map((c, i) => (
              <div
                key={i}
                className="rounded-xl border border-foreground/15 bg-surface/60 overflow-hidden"
              >
                {/* Theme banner */}
                <div className="px-4 py-3 bg-foreground/[0.03] border-b border-foreground/15">
                  <p
                    className="text-foreground text-base font-medium"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {c.theme}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs font-semibold ${elementColor(c.sign1)}`}>
                      {c.planet1} in {SIGN_FULL[c.sign1]}
                    </span>
                    <span className="text-secondary text-[10px]">vs</span>
                    <span className={`text-xs font-semibold ${elementColor(c.sign2)}`}>
                      {c.planet2} in {SIGN_FULL[c.sign2]}
                    </span>
                  </div>
                </div>
                {/* Body */}
                <div className="px-4 py-4">
                  <p className="text-secondary text-sm leading-relaxed">
                    {c.summary}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ ASPECTS ═══ */}
      {chartData.aspects && chartData.aspects.length > 0 && (() => {
        const classified = chartData.aspects.map((a) => ({
          ...a,
          strength: classifyAspectStrength(a.orbit, a.p1Name, a.p2Name, a.aspect),
          interpretation: getAspectInterpretation(a.p1Name, a.p2Name, a.aspect),
        }));

        const tabs: { key: "strong" | "medium" | "mild"; label: string; items: typeof classified; description: string }[] = [
          { key: "strong", label: "Strong", items: classified.filter((a) => a.strength === "strong"), description: "The dominant forces in your chart — tight orbs between personal planets that shape your core personality. You feel these every day." },
          { key: "medium", label: "Medium", items: classified.filter((a) => a.strength === "medium"), description: "Clear but less intense influences. They color your personality and show up in recurring patterns, especially under stress or growth." },
          { key: "mild", label: "Mild", items: classified.filter((a) => a.strength === "mild"), description: "Background hums — subtle influences you might only notice in specific situations or over long periods. They add texture but don't dominate." },
        ];

        const active = tabs.find((t) => t.key === aspectTab) || tabs[0];

        return (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <h2
                className="text-xl text-foreground"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Your aspects
              </h2>
              <InfoTip
                term="Aspects"
                explanation="Aspects are angles between planets in your chart. They describe how different parts of your personality interact — whether they flow together (trines, sextiles), create friction (squares, oppositions), or fuse into one force (conjunctions). The tighter the angle, the stronger the effect."
              />
            </div>
            <p className="text-secondary text-sm mb-5">
              How the planets in your chart talk to each other.
            </p>

            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-xl bg-lavender/[0.06] mb-4">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => { setAspectTab(tab.key); setOpenAspect(null); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                    aspectTab === tab.key
                      ? "placement-card shadow-sm"
                      : "placement-card-text-secondary hover:text-foreground"
                  }`}
                >
                  {tab.label}
                  <span className={`ml-1.5 ${aspectTab === tab.key ? "placement-card-text-secondary" : "placement-card-text-muted"}`}>
                    {tab.items.length}
                  </span>
                </button>
              ))}
            </div>

            {/* Tab description */}
            <p className="placement-card-text-secondary text-xs leading-relaxed mb-4">
              {active.description}
            </p>

            {/* Aspect list */}
            {active.items.length === 0 ? (
              <p className="placement-card-text-secondary text-sm text-center py-6">No {active.key} aspects in your chart.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {active.items.map((a, i) => {
                  const typeInfo = ASPECT_TYPE_INFO[a.aspect] || { label: a.aspect, nature: "", color: "text-secondary" };
                  const uid = `${active.key}-${i}`;
                  const isOpen = openAspect === uid;

                  return (
                    <div key={uid} className="placement-card overflow-hidden">
                      <button
                        onClick={(e) => { const el = e.currentTarget; setOpenAspect(isOpen ? null : uid); if (!isOpen) setTimeout(() => el?.scrollIntoView({ behavior: "smooth", block: "start" }), 100); }}
                        className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-lavender/[0.04] transition-colors"
                      >
                        <span className={`text-base ${typeInfo.color}`}>
                          {ASPECT_SYMBOLS[a.aspect] || "·"}
                        </span>
                        <div className="flex-1 min-w-0">
                          <span className="placement-card-text text-sm font-medium">
                            {a.p1Name}
                          </span>
                          <span className={`text-xs mx-1.5 ${typeInfo.color}`}>
                            {typeInfo.label.toLowerCase()}
                          </span>
                          <span className="placement-card-text text-sm font-medium">
                            {a.p2Name}
                          </span>
                        </div>
                        <span className="placement-card-text-secondary text-[10px]">
                          {a.orbit}&deg;
                        </span>
                        <svg aria-hidden="true"
                          width="14" height="14" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2"
                          className={`placement-card-text-muted transition-transform duration-200 flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {isOpen && (
                        <div className="placement-card-expanded px-4 pb-4 pt-1 border-t border-lavender/15 space-y-3 mx-1 mb-1">
                          {/* What this aspect type means */}
                          <div className="rounded-lg bg-lavender/[0.06] px-3 py-2.5">
                            <p className="placement-card-text-secondary text-[9px] uppercase tracking-widest mb-1">
                              What&apos;s a {typeInfo.label.toLowerCase()}?
                            </p>
                            <p className="placement-card-text-secondary text-[12px] leading-relaxed">
                              {typeInfo.beginnerDesc}
                            </p>
                          </div>

                          {/* What each planet does */}
                          <div className="flex flex-col gap-1.5">
                            {PLANET_GOVERNS[a.p1Name] && (
                              <p className="placement-card-text-secondary text-[11px] leading-relaxed">
                                <span className="placement-card-text font-medium">{a.p1Name}</span> governs {PLANET_GOVERNS[a.p1Name]}.
                              </p>
                            )}
                            {PLANET_GOVERNS[a.p2Name] && (
                              <p className="placement-card-text-secondary text-[11px] leading-relaxed">
                                <span className="placement-card-text font-medium">{a.p2Name}</span> governs {PLANET_GOVERNS[a.p2Name]}.
                              </p>
                            )}
                          </div>

                          {/* The actual interpretation */}
                          {a.interpretation && (
                            <div>
                              <p className="placement-card-text-secondary text-[9px] uppercase tracking-widest mb-1">
                                What this means for you
                              </p>
                              <p className="placement-card-text text-sm leading-relaxed">
                                {a.interpretation}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

      </>)}

      <div className="h-8" />
    </main>
  );
}
