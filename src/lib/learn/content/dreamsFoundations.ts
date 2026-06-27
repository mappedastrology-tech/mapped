import type { Course } from "../types";

/** FLAGSHIP #10 — Dreamwork: the sleep science plus the symbolism. */
export const dreamsFoundations: Course = {
  id: "dreams-foundations",
  domain: "dreams",
  title: "Dreamwork & Dream Journaling",
  subtitle: "The science and symbolism of dreams",
  level: "foundations",
  icon: "💤",
  summary:
    "Learn why we dream (the real sleep science) and how to keep a dream journal and work with dream symbolism for reflection.",
  estMinutes: 35,
  status: "published",
  passThreshold: 0.8,
  finalTestSize: 10,
  safetyNote:
    "If nightmares are frequent, distressing, or tied to trauma, treat that as a reason to reach out to a doctor or therapist — effective treatments exist. Dreamwork here is for reflection, not diagnosis.",

  outline: [
    { module: "The Science", lessons: ["Sleep cycles & REM", "What dreams are (and aren't)"] },
    { module: "Working With Dreams", lessons: ["Keeping a dream journal", "Symbols & personal meaning", "Recurring dreams & nightmares", "Lucid dreaming basics"] },
  ],

  modules: [
    {
      id: "m1",
      title: "The Science",
      lessons: [
        {
          id: "l1-sleep-cycles",
          title: "Sleep cycles & REM",
          objective: "Explain when dreaming happens during sleep.",
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "Sleep isn't uniform — it moves through stages in cycles of about 90 minutes, several times a night. Each cycle passes through lighter and deeper non-REM sleep and then into REM (rapid eye movement) sleep." },
            { kind: "callout", tone: "history", title: "REM is prime dreaming time", text: "The most vivid, story-like dreams happen in REM sleep, when the brain is highly active but the body is temporarily paralyzed (so you don't act dreams out). REM periods get longer toward morning — which is why you often wake from a vivid dream. You can dream in other stages too, but REM dreams are the memorable ones." },
            { kind: "keyfacts", items: [
              "Sleep cycles last about 90 minutes and repeat through the night.",
              "Vivid dreams happen mostly in REM (rapid eye movement) sleep.",
              "Everyone dreams multiple times a night, even if they don't remember it.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "The most vivid, story-like dreams happen during…", options: [
              { id: "a", text: "REM (rapid eye movement) sleep", correct: true, explanation: "Correct — the brain is very active in REM." },
              { id: "b", text: "The deepest non-REM sleep only", correct: false, explanation: "Vivid dreams are mainly a REM phenomenon." },
              { id: "c", text: "Only when you're awake", correct: false, explanation: "Dreams happen during sleep." },
            ] },
            { id: "q2", type: "mcq", prompt: "A full sleep cycle lasts roughly…", options: [
              { id: "a", text: "90 minutes, repeating through the night", correct: true, explanation: "Yes — several cycles per night." },
              { id: "b", text: "8 hours, just once", correct: false, explanation: "Cycles are ~90 minutes and repeat." },
              { id: "c", text: "10 seconds", correct: false, explanation: "Far too short for a cycle." },
            ] },
            { id: "q3", type: "true-false", prompt: "People who 'never dream' actually don't dream at all.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — nearly everyone dreams nightly; they just don't recall it." },
              { id: "f", text: "False", correct: true, explanation: "Correct — it's a recall difference, not an absence of dreaming." },
            ] },
          ],
        },
        {
          id: "l2-what-dreams-are",
          title: "What dreams are (and aren't)",
          objective: "Summarize leading theories of why we dream and what dreams aren't.",
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "Science doesn't have one final answer for why we dream, but several well-supported ideas overlap:" },
            { kind: "list", items: [
              "**Memory consolidation** — sleep and dreaming help the brain sort, store, and connect memories.",
              "**Emotional processing** — dreams seem to help work through feelings and stressful experiences.",
              "**Simulation** — dreams may rehearse situations (including threats), like a safe practice space.",
            ] },
            { kind: "callout", tone: "evidence", title: "What dreams aren't", text: "There's no scientific evidence that dreams predict the future or carry literal messages decoded by a universal 'dream dictionary.' Dream images are deeply personal and shaped by your own life — which is exactly what makes reflecting on them useful." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Which is a leading scientific idea about why we dream?", options: [
              { id: "a", text: "Memory consolidation and emotional processing", correct: true, explanation: "Correct — well-supported overlapping theories." },
              { id: "b", text: "Receiving messages from the future", correct: false, explanation: "No evidence supports prediction." },
              { id: "c", text: "Nothing happens in the brain during dreams", correct: false, explanation: "The brain is highly active, especially in REM." },
            ] },
            { id: "q2", type: "mcq", prompt: "A universal 'dream dictionary' where each symbol has one fixed meaning is…", options: [
              { id: "a", text: "Not supported — dream symbols are personal", correct: true, explanation: "Right — your associations matter most." },
              { id: "b", text: "Scientifically proven and reliable", correct: false, explanation: "There's no evidence for fixed universal meanings." },
              { id: "c", text: "The only valid way to read dreams", correct: false, explanation: "Personal meaning is more useful than a fixed code." },
            ] },
            { id: "q3", type: "true-false", prompt: "There is good evidence that dreams predict future events.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — there's no scientific support for dream prediction." },
              { id: "f", text: "False", correct: true, explanation: "Correct — dreams are reflective, not predictive." },
            ] },
          ],
        },
      ],
    },
    {
      id: "m2",
      title: "Working With Dreams",
      lessons: [
        {
          id: "l3-dream-journal",
          title: "Keeping a dream journal",
          objective: "Set up a dream-journaling habit that improves recall.",
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "Dreams fade within minutes of waking, so the key is to capture them immediately. A dream journal both preserves dreams and, over time, noticeably improves how much you remember." },
            { kind: "list", ordered: true, items: [
              "Keep a notebook or your phone within reach of the bed.",
              "Before sleep, set an intention to remember your dreams.",
              "On waking, stay still for a moment and let the dream come back before you move or check your phone.",
              "Write down whatever you can — images, feelings, fragments — even just a few words.",
              "Note the emotion of the dream, not only the events.",
            ] },
            { kind: "callout", tone: "tip", title: "Recall grows with practice", text: "Don't worry if early entries are sparse. Simply trying to recall dreams trains your brain to hold onto them, and recall usually improves within a week or two." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Why record dreams immediately on waking?", options: [
              { id: "a", text: "Dreams fade within minutes of waking", correct: true, explanation: "Correct — capture them fast before they vanish." },
              { id: "b", text: "Dreams only exist if written down", correct: false, explanation: "They happen regardless; writing preserves recall." },
              { id: "c", text: "It's required by law", correct: false, explanation: "It's just practical for memory." },
            ] },
            { id: "q2", type: "mcq", prompt: "A good first step on waking is to…", options: [
              { id: "a", text: "Stay still and let the dream return before moving", correct: true, explanation: "Yes — movement and screens scatter the memory." },
              { id: "b", text: "Immediately check social media", correct: false, explanation: "That erases the fragile dream memory." },
              { id: "c", text: "Jump out of bed quickly", correct: false, explanation: "Sudden movement makes recall harder." },
            ] },
            { id: "q3", type: "true-false", prompt: "Simply trying to recall dreams tends to improve dream recall over time.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — it trains the habit; recall grows." },
              { id: "f", text: "False", correct: false, explanation: "Recall genuinely improves with practice." },
            ] },
          ],
        },
        {
          id: "l4-symbols",
          title: "Symbols & personal meaning",
          objective: "Interpret a dream symbol through personal association.",
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "Dream symbols are best read through your own associations, not a one-size-fits-all dictionary. A dog might mean loyalty to one person and fear to another, depending on their life." },
            { kind: "callout", tone: "tip", title: "How to question a symbol", text: "When a striking image appears, ask yourself: What does this remind me of in my waking life? What was I feeling toward it in the dream? What's going on right now that this could mirror? The answers — not a generic meaning — are where the insight lives." },
            { kind: "callout", tone: "tradition", title: "Themes can rhyme", text: "Some broad themes do recur across people (falling, being chased, losing teeth, being unprepared for a test). These often connect to common feelings — loss of control, anxiety, pressure — but the specific meaning is still personal to you." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "The best way to interpret a dream symbol is…", options: [
              { id: "a", text: "Through your own associations and current life", correct: true, explanation: "Correct — personal meaning beats a fixed dictionary." },
              { id: "b", text: "By looking up its one 'true' meaning online", correct: false, explanation: "Symbols aren't universal codes." },
              { id: "c", text: "By ignoring it entirely", correct: false, explanation: "Striking images are worth reflecting on." },
            ] },
            { id: "q2", type: "mcq", prompt: "Common themes like being chased or unprepared often connect to…", options: [
              { id: "a", text: "Feelings like anxiety, pressure, or loss of control", correct: true, explanation: "Yes — though the specifics stay personal." },
              { id: "b", text: "A guaranteed future event", correct: false, explanation: "Dreams aren't predictive." },
              { id: "c", text: "Nothing at all", correct: false, explanation: "They usually mirror real feelings." },
            ] },
            { id: "q3", type: "true-false", prompt: "The same dream symbol means exactly the same thing for everyone.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — meaning depends on your associations." },
              { id: "f", text: "False", correct: true, explanation: "Correct — symbols are personal." },
            ] },
          ],
        },
        {
          id: "l5-nightmares",
          title: "Recurring dreams & nightmares",
          objective: "Understand recurring dreams and when nightmares warrant support.",
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "Recurring dreams — the same scenario returning — often track an unresolved stress or theme in waking life; they tend to fade once the underlying issue is addressed or acknowledged." },
            { kind: "callout", tone: "safety", title: "When to seek help", text: "Occasional nightmares are normal. But if nightmares are frequent, intensely distressing, disrupting your sleep, or connected to a trauma, that's a sign to talk to a doctor or therapist — not to push through alone. Effective treatments exist (for example, a technique called imagery rehearsal therapy). Dreamwork journaling is for reflection, not a treatment for these." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Recurring dreams often reflect…", options: [
              { id: "a", text: "An unresolved stress or theme in waking life", correct: true, explanation: "Correct — they tend to ease once it's addressed." },
              { id: "b", text: "A prophecy of the future", correct: false, explanation: "Dreams aren't predictive." },
              { id: "c", text: "A glitch with no meaning ever", correct: false, explanation: "They usually mirror something real." },
            ] },
            { id: "q2", type: "mcq", prompt: "Frequent, distressing, or trauma-related nightmares are a sign to…", options: [
              { id: "a", text: "Talk to a doctor or therapist", correct: true, explanation: "Yes — effective treatments exist; don't tough it out alone." },
              { id: "b", text: "Ignore them indefinitely", correct: false, explanation: "Persistent distressing nightmares deserve support." },
              { id: "c", text: "Stop sleeping", correct: false, explanation: "That's harmful; seek help instead." },
            ] },
            { id: "q3", type: "true-false", prompt: "Dream journaling is an appropriate treatment for trauma-related nightmares.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — those warrant professional care, not just journaling." },
              { id: "f", text: "False", correct: true, explanation: "Correct — journaling is for reflection, not treatment." },
            ] },
          ],
        },
        {
          id: "l6-lucid",
          title: "Lucid dreaming basics",
          objective: "Explain lucid dreaming and a common technique to encourage it.",
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "A lucid dream is one in which you realize, while dreaming, that you're dreaming. Some people can then influence the dream. It's a real, studied phenomenon — though it takes practice and doesn't come easily to everyone." },
            { kind: "list", items: [
              "**Reality checks** — through the day, ask 'Am I dreaming?' and test (e.g., try to push a finger through your palm). The habit can carry into dreams.",
              "**Dream journaling** — better recall and noticing recurring 'dream signs' makes lucidity more likely.",
              "**Wake-and-return** — briefly waking during the night and returning to sleep with the intention to recognize a dream raises the odds.",
            ] },
            { kind: "callout", tone: "tip", title: "Keep it light", text: "Lucid dreaming is a fun skill to explore, not a goal to stress over. If chasing it ever disrupts your sleep, ease off — good rest matters more." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "A lucid dream is one where…", options: [
              { id: "a", text: "You realize you're dreaming while still in the dream", correct: true, explanation: "Correct — awareness within the dream." },
              { id: "b", text: "You sleep more deeply than usual", correct: false, explanation: "It's about awareness, not depth." },
              { id: "c", text: "You don't dream at all", correct: false, explanation: "The opposite — you're aware you're dreaming." },
            ] },
            { id: "q2", type: "mcq", prompt: "A 'reality check' to encourage lucidity is…", options: [
              { id: "a", text: "Regularly asking 'Am I dreaming?' and testing it", correct: true, explanation: "Yes — the habit can carry into dreams." },
              { id: "b", text: "Drinking caffeine before bed", correct: false, explanation: "That harms sleep, not helps lucidity." },
              { id: "c", text: "Never sleeping", correct: false, explanation: "You need sleep to dream." },
            ] },
            { id: "q3", type: "true-false", prompt: "If pursuing lucid dreaming disrupts your sleep, it's wise to ease off.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — good rest matters more than lucidity." },
              { id: "f", text: "False", correct: false, explanation: "Protect your sleep first." },
            ] },
          ],
        },
      ],
    },
  ],

  finalTest: [
    { id: "f1", type: "mcq", prompt: "Vivid, story-like dreams happen mostly during…", options: [
      { id: "a", text: "REM sleep", correct: true },
      { id: "b", text: "Deep non-REM only", correct: false },
      { id: "c", text: "Wakefulness", correct: false },
      { id: "d", text: "Naps only", correct: false },
    ] },
    { id: "f2", type: "mcq", prompt: "A sleep cycle lasts about…", options: [
      { id: "a", text: "90 minutes, repeating", correct: true },
      { id: "b", text: "8 hours, once", correct: false },
      { id: "c", text: "5 seconds", correct: false },
      { id: "d", text: "A whole day", correct: false },
    ] },
    { id: "f3", type: "mcq", prompt: "People who think they 'never dream' usually…", options: [
      { id: "a", text: "Dream but don't recall it", correct: true },
      { id: "b", text: "Truly never dream", correct: false },
      { id: "c", text: "Are always awake", correct: false },
      { id: "d", text: "Have no REM sleep", correct: false },
    ] },
    { id: "f4", type: "mcq", prompt: "A leading theory of dreaming is…", options: [
      { id: "a", text: "Memory consolidation and emotional processing", correct: true },
      { id: "b", text: "Messages from the future", correct: false },
      { id: "c", text: "Nothing happens in the brain", correct: false },
      { id: "d", text: "A universal symbol code", correct: false },
    ] },
    { id: "f5", type: "mcq", prompt: "A universal 'dream dictionary' is…", options: [
      { id: "a", text: "Not supported — symbols are personal", correct: true },
      { id: "b", text: "Scientifically proven", correct: false },
      { id: "c", text: "The only valid method", correct: false },
      { id: "d", text: "Required for journaling", correct: false },
    ] },
    { id: "f6", type: "mcq", prompt: "Why record dreams right on waking?", options: [
      { id: "a", text: "They fade within minutes", correct: true },
      { id: "b", text: "They don't exist otherwise", correct: false },
      { id: "c", text: "It's legally required", correct: false },
      { id: "d", text: "To avoid sleeping", correct: false },
    ] },
    { id: "f7", type: "mcq", prompt: "On waking, you should first…", options: [
      { id: "a", text: "Stay still and let the dream return", correct: true },
      { id: "b", text: "Check social media", correct: false },
      { id: "c", text: "Leap out of bed", correct: false },
      { id: "d", text: "Turn on bright lights", correct: false },
    ] },
    { id: "f8", type: "mcq", prompt: "Dream symbols are best read through…", options: [
      { id: "a", text: "Your own associations and current life", correct: true },
      { id: "b", text: "A single fixed online meaning", correct: false },
      { id: "c", text: "Ignoring them", correct: false },
      { id: "d", text: "A random guess", correct: false },
    ] },
    { id: "f9", type: "mcq", prompt: "Recurring dreams often reflect…", options: [
      { id: "a", text: "An unresolved waking-life stress or theme", correct: true },
      { id: "b", text: "A guaranteed prophecy", correct: false },
      { id: "c", text: "Nothing meaningful", correct: false },
      { id: "d", text: "A brain defect", correct: false },
    ] },
    { id: "f10", type: "mcq", prompt: "Frequent, distressing, trauma-related nightmares are a sign to…", options: [
      { id: "a", text: "Talk to a doctor or therapist", correct: true },
      { id: "b", text: "Ignore them", correct: false },
      { id: "c", text: "Stop sleeping", correct: false },
      { id: "d", text: "Just journal harder", correct: false },
    ] },
    { id: "f11", type: "mcq", prompt: "A lucid dream is…", options: [
      { id: "a", text: "Realizing you're dreaming while in the dream", correct: true },
      { id: "b", text: "Sleeping more deeply", correct: false },
      { id: "c", text: "Not dreaming at all", correct: false },
      { id: "d", text: "A nightmare", correct: false },
    ] },
    { id: "f12", type: "mcq", prompt: "A reality check for lucidity is…", options: [
      { id: "a", text: "Asking 'Am I dreaming?' and testing it during the day", correct: true },
      { id: "b", text: "Drinking caffeine at bedtime", correct: false },
      { id: "c", text: "Never sleeping", correct: false },
      { id: "d", text: "Staring at a wall", correct: false },
    ] },
    { id: "f13", type: "true-false", prompt: "Nearly everyone dreams multiple times a night.", options: [
      { id: "t", text: "True", correct: true },
      { id: "f", text: "False", correct: false },
    ] },
    { id: "f14", type: "true-false", prompt: "There is good evidence dreams predict the future.", options: [
      { id: "t", text: "True", correct: false },
      { id: "f", text: "False", correct: true },
    ] },
    { id: "f15", type: "true-false", prompt: "Dream recall tends to improve with practice.", options: [
      { id: "t", text: "True", correct: true },
      { id: "f", text: "False", correct: false },
    ] },
    { id: "f16", type: "true-false", prompt: "If chasing lucid dreams disrupts your sleep, you should ease off.", options: [
      { id: "t", text: "True", correct: true },
      { id: "f", text: "False", correct: false },
    ] },
  ],
};
