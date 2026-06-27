import type { Course } from "../types";

/** FLAGSHIP #5 — Chakras, taught faithfully with true origins, evidence, and cultural respect. */
export const chakrasFoundations: Course = {
  id: "chakras-foundations",
  domain: "chakras",
  title: "Chakras: Origins & Practice",
  subtitle: "The subtle body, faithfully taught",
  level: "foundations",
  icon: "🌀",
  summary:
    "Explore the chakra system from its true tantric origins through the modern Western version, learn the seven centers, and hold it all with honest evidence and cultural respect.",
  estMinutes: 40,
  status: "published",
  passThreshold: 0.8,
  finalTestSize: 10,

  outline: [
    { module: "Real Origins", lessons: ["The subtle body: nadis, prana, kundalini", "Six centers, not seven", "How the Western rainbow was built"] },
    { module: "The Seven Chakras", lessons: ["Root, Sacral & Solar Plexus", "Heart, Throat, Third Eye & Crown", "Balancing practices"] },
    { module: "Context", lessons: ["What the evidence says", "Respect & cultural appropriation"] },
  ],

  modules: [
    {
      id: "m1",
      title: "Real Origins",
      lessons: [
        {
          id: "l1-subtle-body",
          title: "The subtle body: nadis, prana, kundalini",
          objective: "Describe the subtle-body model the chakras belong to.",
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "The chakra system is part of a larger 'subtle body' model from Indian yogic and tantric traditions — a map of energy, not anatomy." },
            { kind: "list", items: [
              "**Prana** — the life-force or breath-energy said to animate the body.",
              "**Nadis** — channels through which prana flows (texts describe thousands; three are principal).",
              "**Kundalini** — an energy pictured as 'coiled' at the base of the spine, which practices aim to awaken and raise.",
              "**Chakras** — 'wheels' or centers along the spine where these channels meet.",
            ] },
            { kind: "callout", tone: "tradition", title: "A map of experience", text: "Treat the subtle body as a contemplative, experiential map — a way of working with breath, attention, and sensation — rather than a claim about physical organs." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "In the subtle-body model, 'nadis' are…", options: [
              { id: "a", text: "Channels through which prana flows", correct: true, explanation: "Correct — energy channels." },
              { id: "b", text: "Physical blood vessels", correct: false, explanation: "They're an energetic map, not anatomy." },
              { id: "c", text: "The seven colors", correct: false, explanation: "Colors are a later Western addition." },
            ] },
            { id: "q2", type: "mcq", prompt: "'Kundalini' is pictured as…", options: [
              { id: "a", text: "An energy coiled at the base of the spine", correct: true, explanation: "Yes — practices aim to raise it." },
              { id: "b", text: "A type of food", correct: false, explanation: "No — it's an energy concept." },
              { id: "c", text: "A Western psychologist", correct: false, explanation: "It's a tantric concept." },
            ] },
            { id: "q3", type: "mcq", prompt: "The chakra system originates in…", options: [
              { id: "a", text: "Indian yogic and tantric traditions", correct: true, explanation: "Correct — its true cultural home." },
              { id: "b", text: "Ancient Egypt", correct: false, explanation: "No — that's a common mix-up with other systems." },
              { id: "c", text: "19th-century America", correct: false, explanation: "The West adapted it much later." },
            ] },
          ],
        },
        {
          id: "l2-six-centers",
          title: "Six centers, not seven",
          objective: "Recognize that classical sources varied and the key text described six centers.",
          estMinutes: 4,
          blocks: [
            { kind: "callout", tone: "history", title: "A surprising fact", text: "The single most influential classical source, the Ṣaṭ-cakra-nirūpaṇa (1577), literally means 'Description of the SIX Centers.' Many tantric systems used different numbers of chakras entirely — four, five, six, even twenty-one." },
            { kind: "text", text: "In other words, there was never one fixed 'seven chakra' canon in classical India. The neat seven-chakra model most people know today is a later standardization, not the original tradition." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "The influential 1577 text describes how many centers?", options: [
              { id: "a", text: "Six", correct: true, explanation: "Correct — 'Ṣaṭ' means six." },
              { id: "b", text: "Seven", correct: false, explanation: "The seven-chakra model is a later standard." },
              { id: "c", text: "Twelve", correct: false, explanation: "No — the key text describes six." },
            ] },
            { id: "q2", type: "true-false", prompt: "Classical Indian systems all agreed on exactly seven chakras.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — different texts used different numbers." },
              { id: "f", text: "False", correct: true, explanation: "Correct — the count varied widely." },
            ] },
            { id: "q3", type: "mcq", prompt: "The familiar 'seven chakra' model is best described as…", options: [
              { id: "a", text: "A later standardization, not the single original system", correct: true, explanation: "Right — it's a modern fixing of a varied tradition." },
              { id: "b", text: "The only system ever used", correct: false, explanation: "Many systems existed." },
              { id: "c", text: "An ancient Egyptian invention", correct: false, explanation: "It's Indian in origin, later standardized." },
            ] },
          ],
        },
        {
          id: "l3-western-rainbow",
          title: "How the Western rainbow was built",
          objective: "Explain where the seven rainbow colors and gland associations came from.",
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "The version with seven centers in rainbow order (red root → violet crown) is a modern synthesis, assembled in the late 1800s to early 1900s." },
            { kind: "list", items: [
              "**Sir John Woodroffe** ('Arthur Avalon') translated the key Sanskrit text in *The Serpent Power* (1919), bringing it to English readers.",
              "**The Theosophical Society** — especially **Charles Leadbeater**, in *The Chakras* (1927) — fixed the now-standard rainbow colors and linked chakras to nerve plexuses and endocrine glands.",
            ] },
            { kind: "callout", tone: "history", title: "Not in the originals", text: "The rainbow colors and gland associations were Leadbeater's additions. They aren't found in the original Sanskrit texts — so when you see the familiar color chart, you're looking at the Western, Theosophical version." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "The standard rainbow colors of the chakras were fixed by…", options: [
              { id: "a", text: "Charles Leadbeater (Theosophy), 1927", correct: true, explanation: "Correct — a 20th-century addition." },
              { id: "b", text: "Ancient tantric texts", correct: false, explanation: "The colors aren't in the originals." },
              { id: "c", text: "Pythagoras", correct: false, explanation: "Unrelated." },
            ] },
            { id: "q2", type: "true-false", prompt: "The rainbow colors and gland links appear in the original Sanskrit texts.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — they're modern Western additions." },
              { id: "f", text: "False", correct: true, explanation: "Correct — they came from Theosophy." },
            ] },
            { id: "q3", type: "mcq", prompt: "Who brought the key chakra text to English readers in 1919?", options: [
              { id: "a", text: "Sir John Woodroffe ('Arthur Avalon')", correct: true, explanation: "Yes — in *The Serpent Power*." },
              { id: "b", text: "Anodea Judith", correct: false, explanation: "She's a later (1980s+) figure." },
              { id: "c", text: "Carl Jung", correct: false, explanation: "Not Jung." },
            ] },
          ],
        },
      ],
    },
    {
      id: "m2",
      title: "The Seven Chakras",
      lessons: [
        {
          id: "l4-lower-chakras",
          title: "Root, Sacral & Solar Plexus",
          objective: "Recall the lower three chakras and their themes.",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "The lower three centers (in the Western system) deal with foundation, feeling, and personal power." },
            { kind: "table", headers: ["Chakra", "Location", "Color", "Theme"], rows: [
              ["Root (Muladhara)", "Base of spine", "Red", "Safety, grounding, survival"],
              ["Sacral (Svadhisthana)", "Lower abdomen", "Orange", "Emotion, creativity, sexuality"],
              ["Solar Plexus (Manipura)", "Navel", "Yellow", "Will, confidence, power"],
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "The Root chakra (Muladhara) is associated with…", options: [
              { id: "a", text: "Safety and grounding", correct: true, explanation: "Correct — the foundation center." },
              { id: "b", text: "Communication", correct: false, explanation: "That's the Throat chakra." },
              { id: "c", text: "Intuition", correct: false, explanation: "That's the Third Eye." },
            ] },
            { id: "q2", type: "mcq", prompt: "Which chakra is linked to creativity and emotion?", options: [
              { id: "a", text: "Sacral (orange)", correct: true, explanation: "Yes — the Sacral chakra." },
              { id: "b", text: "Root (red)", correct: false, explanation: "Root is grounding/survival." },
              { id: "c", text: "Crown (violet)", correct: false, explanation: "Crown is spiritual connection." },
            ] },
            { id: "q3", type: "mcq", prompt: "The Solar Plexus chakra governs…", options: [
              { id: "a", text: "Will, confidence, and personal power", correct: true, explanation: "Correct — Manipura, the power center." },
              { id: "b", text: "Love", correct: false, explanation: "That's the Heart chakra." },
              { id: "c", text: "Survival", correct: false, explanation: "That's the Root." },
            ] },
          ],
        },
        {
          id: "l5-upper-chakras",
          title: "Heart, Throat, Third Eye & Crown",
          objective: "Recall the upper four chakras and their themes.",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "The upper four centers move from connection and expression toward insight and spirit." },
            { kind: "table", headers: ["Chakra", "Location", "Color", "Theme"], rows: [
              ["Heart (Anahata)", "Center of chest", "Green", "Love, compassion"],
              ["Throat (Vishuddha)", "Throat", "Blue", "Communication, truth"],
              ["Third Eye (Ajna)", "Brow", "Indigo", "Intuition, insight"],
              ["Crown (Sahasrara)", "Top of head", "Violet / white", "Spiritual connection"],
            ] },
            { kind: "callout", tone: "tip", title: "The bridge", text: "The Heart chakra sits between the lower (earthly) and upper (spiritual) centers — often described as where the two meet." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "The Heart chakra (Anahata) is associated with…", options: [
              { id: "a", text: "Love and compassion", correct: true, explanation: "Correct — green, center of the chest." },
              { id: "b", text: "Survival", correct: false, explanation: "That's the Root." },
              { id: "c", text: "Willpower", correct: false, explanation: "That's the Solar Plexus." },
            ] },
            { id: "q2", type: "mcq", prompt: "Communication and truth belong to which chakra?", options: [
              { id: "a", text: "Throat (Vishuddha)", correct: true, explanation: "Yes — the blue throat center." },
              { id: "b", text: "Crown", correct: false, explanation: "Crown is spiritual connection." },
              { id: "c", text: "Sacral", correct: false, explanation: "Sacral is creativity/emotion." },
            ] },
            { id: "q3", type: "mcq", prompt: "The Crown chakra (Sahasrara) sits…", options: [
              { id: "a", text: "At the top of the head", correct: true, explanation: "Correct — violet/white, spiritual connection." },
              { id: "b", text: "At the navel", correct: false, explanation: "That's the Solar Plexus." },
              { id: "c", text: "At the base of the spine", correct: false, explanation: "That's the Root." },
            ] },
          ],
        },
        {
          id: "l6-balancing",
          title: "Balancing practices",
          objective: "Name the practices used to 'balance' chakras and their real benefits.",
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "Traditional practices to work with the chakras include pranayama (breath control), seated meditation and visualization, bija ('seed') mantras like LAM or OM, yoga postures, and sound." },
            { kind: "callout", tone: "evidence", title: "The real benefit", text: "Frame these honestly: breathwork, focused attention, and relaxation have genuine, measurable effects on stress and mood — independent of whether a literal 'wheel' is being unblocked. That's the substance behind the practice." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "A 'bija mantra' is…", options: [
              { id: "a", text: "A seed sound (like LAM or OM) used in practice", correct: true, explanation: "Correct — seed syllables for each center." },
              { id: "b", text: "A yoga mat", correct: false, explanation: "No — it's a sound/mantra." },
              { id: "c", text: "A crystal", correct: false, explanation: "Unrelated." },
            ] },
            { id: "q2", type: "mcq", prompt: "The measurable benefit of chakra practices comes mainly from…", options: [
              { id: "a", text: "Breathwork, attention, and relaxation", correct: true, explanation: "Yes — well-studied effects on stress and mood." },
              { id: "b", text: "Physically spinning energy wheels", correct: false, explanation: "There's no measurable wheel; the benefit is in the practice." },
              { id: "c", text: "Taking medication", correct: false, explanation: "These are contemplative practices, not drugs." },
            ] },
            { id: "q3", type: "true-false", prompt: "Pranayama means breath control.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — regulated breathing." },
              { id: "f", text: "False", correct: false, explanation: "It does mean breath control." },
            ] },
          ],
        },
      ],
    },
    {
      id: "m3",
      title: "Context",
      lessons: [
        {
          id: "l7-evidence",
          title: "What the evidence says",
          objective: "State the scientific status of chakras honestly.",
          estMinutes: 4,
          blocks: [
            { kind: "callout", tone: "evidence", title: "The bottom line", text: "There is no scientific evidence that chakras exist as physical or energetic structures, and no reliable way to measure them. When treated as literal physiology, the concept is considered pseudoscience." },
            { kind: "text", text: "Western writers noted that chakra locations roughly line up with nerve plexuses and glands — but that's an anatomical coincidence used as metaphor, not a measurement of an energy center. The honest value is as a focusing map for breath, attention, and emotion." },
            { kind: "callout", tone: "safety", title: "No medical claims", text: "'Balancing' a chakra is a contemplative practice, not a treatment. Never use it in place of medical or mental-health care. Note too that intense kundalini/breathwork can occasionally cause anxiety or dizziness — go gently." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "The scientific status of chakras as physical structures is…", options: [
              { id: "a", text: "No evidence they exist or can be measured", correct: true, explanation: "Correct — treat them as metaphor/map." },
              { id: "b", text: "Fully proven by MRI scans", correct: false, explanation: "No such evidence exists." },
              { id: "c", text: "Confirmed organs", correct: false, explanation: "They aren't anatomical organs." },
            ] },
            { id: "q2", type: "mcq", prompt: "The overlap between chakra locations and nerve plexuses is…", options: [
              { id: "a", text: "A loose coincidence used as metaphor, not proof", correct: true, explanation: "Right — location overlap isn't a measurement." },
              { id: "b", text: "Proof that chakras are glands", correct: false, explanation: "It's metaphor, not identity." },
              { id: "c", text: "Evidence of measurable energy", correct: false, explanation: "No energy has been measured." },
            ] },
            { id: "q3", type: "true-false", prompt: "Chakra balancing is an appropriate replacement for medical care.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — it's a contemplative practice, not treatment." },
              { id: "f", text: "False", correct: true, explanation: "Correct — never substitute it for medical care." },
            ] },
          ],
        },
        {
          id: "l8-respect",
          title: "Respect & cultural appropriation",
          objective: "Engage with the chakra system respectfully.",
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "Chakras are a living sacred tradition rooted in Hindu and Buddhist tantra, historically passed from teacher to student. The popular Western form often strips away the deities, mantras, and context and sells it as generic 'self-care.'" },
            { kind: "callout", tone: "culture", title: "How to engage respectfully", text: "Credit the Indian/tantric origins explicitly, keep the classical tradition distinct from the Theosophical/Western synthesis, use the Sanskrit terms accurately, and avoid treating sacred symbols as mere aesthetic props." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "The chakra system is rooted in…", options: [
              { id: "a", text: "Hindu and Buddhist tantra", correct: true, explanation: "Correct — credit these origins." },
              { id: "b", text: "Greek philosophy", correct: false, explanation: "No — it's from Indian traditions." },
              { id: "c", text: "Norse mythology", correct: false, explanation: "Unrelated." },
            ] },
            { id: "q2", type: "mcq", prompt: "Respectful engagement includes…", options: [
              { id: "a", text: "Crediting origins and keeping tradition distinct from the Western version", correct: true, explanation: "Yes — accuracy and credit." },
              { id: "b", text: "Treating sacred symbols as fashion props", correct: false, explanation: "That's the appropriation to avoid." },
              { id: "c", text: "Claiming it cures disease", correct: false, explanation: "Never make medical claims." },
            ] },
            { id: "q3", type: "true-false", prompt: "The chakra system is a living sacred tradition, not just a wellness trend.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — engage with respect." },
              { id: "f", text: "False", correct: false, explanation: "It is a living sacred tradition." },
            ] },
          ],
        },
      ],
    },
  ],

  finalTest: [
    { id: "f1", type: "mcq", prompt: "The chakra system originates in…", options: [
      { id: "a", text: "Indian yogic and tantric traditions", correct: true },
      { id: "b", text: "Ancient Egypt", correct: false },
      { id: "c", text: "19th-century America", correct: false },
      { id: "d", text: "Greek philosophy", correct: false },
    ] },
    { id: "f2", type: "mcq", prompt: "'Nadis' are…", options: [
      { id: "a", text: "Energy channels for prana", correct: true },
      { id: "b", text: "Blood vessels", correct: false },
      { id: "c", text: "Colors", correct: false },
      { id: "d", text: "Glands", correct: false },
    ] },
    { id: "f3", type: "mcq", prompt: "The key 1577 text describes how many centers?", options: [
      { id: "a", text: "Six", correct: true },
      { id: "b", text: "Seven", correct: false },
      { id: "c", text: "Twelve", correct: false },
      { id: "d", text: "Three", correct: false },
    ] },
    { id: "f4", type: "mcq", prompt: "The rainbow colors of the chakras were fixed by…", options: [
      { id: "a", text: "Charles Leadbeater (Theosophy), 1927", correct: true },
      { id: "b", text: "Ancient Sanskrit texts", correct: false },
      { id: "c", text: "Pythagoras", correct: false },
      { id: "d", text: "Carl Jung", correct: false },
    ] },
    { id: "f5", type: "mcq", prompt: "The Root chakra governs…", options: [
      { id: "a", text: "Safety and grounding", correct: true },
      { id: "b", text: "Communication", correct: false },
      { id: "c", text: "Intuition", correct: false },
      { id: "d", text: "Love", correct: false },
    ] },
    { id: "f6", type: "mcq", prompt: "The Sacral chakra is associated with…", options: [
      { id: "a", text: "Creativity and emotion", correct: true },
      { id: "b", text: "Willpower", correct: false },
      { id: "c", text: "Spiritual connection", correct: false },
      { id: "d", text: "Survival", correct: false },
    ] },
    { id: "f7", type: "mcq", prompt: "The Solar Plexus chakra governs…", options: [
      { id: "a", text: "Will, confidence, and power", correct: true },
      { id: "b", text: "Love", correct: false },
      { id: "c", text: "Communication", correct: false },
      { id: "d", text: "Intuition", correct: false },
    ] },
    { id: "f8", type: "mcq", prompt: "The Heart chakra is associated with…", options: [
      { id: "a", text: "Love and compassion", correct: true },
      { id: "b", text: "Survival", correct: false },
      { id: "c", text: "Power", correct: false },
      { id: "d", text: "Truth", correct: false },
    ] },
    { id: "f9", type: "mcq", prompt: "The Throat chakra governs…", options: [
      { id: "a", text: "Communication and truth", correct: true },
      { id: "b", text: "Grounding", correct: false },
      { id: "c", text: "Love", correct: false },
      { id: "d", text: "Creativity", correct: false },
    ] },
    { id: "f10", type: "mcq", prompt: "The Crown chakra sits…", options: [
      { id: "a", text: "At the top of the head", correct: true },
      { id: "b", text: "At the navel", correct: false },
      { id: "c", text: "At the throat", correct: false },
      { id: "d", text: "At the base of the spine", correct: false },
    ] },
    { id: "f11", type: "mcq", prompt: "A bija mantra is…", options: [
      { id: "a", text: "A seed sound used in practice", correct: true },
      { id: "b", text: "A crystal", correct: false },
      { id: "c", text: "A gland", correct: false },
      { id: "d", text: "A color", correct: false },
    ] },
    { id: "f12", type: "mcq", prompt: "The scientific status of chakras is…", options: [
      { id: "a", text: "No evidence they exist as measurable structures", correct: true },
      { id: "b", text: "Proven by brain scans", correct: false },
      { id: "c", text: "Confirmed organs", correct: false },
      { id: "d", text: "Visible on X-ray", correct: false },
    ] },
    { id: "f13", type: "mcq", prompt: "The real benefit of chakra practice comes from…", options: [
      { id: "a", text: "Breathwork, attention, and relaxation", correct: true },
      { id: "b", text: "Spinning physical wheels", correct: false },
      { id: "c", text: "Taking supplements", correct: false },
      { id: "d", text: "Nothing", correct: false },
    ] },
    { id: "f14", type: "true-false", prompt: "Classical Indian systems all used exactly seven chakras.", options: [
      { id: "t", text: "True", correct: false },
      { id: "f", text: "False", correct: true },
    ] },
    { id: "f15", type: "true-false", prompt: "Chakra balancing can replace medical care.", options: [
      { id: "t", text: "True", correct: false },
      { id: "f", text: "False", correct: true },
    ] },
    { id: "f16", type: "true-false", prompt: "Chakras are a living sacred tradition deserving cultural respect.", options: [
      { id: "t", text: "True", correct: true },
      { id: "f", text: "False", correct: false },
    ] },
  ],
};
