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
  estMinutes: 62,
  status: "published",
  passThreshold: 0.8,
  finalTestSize: 10,

  outline: [
    { module: "Real Origins", lessons: ["The subtle body: nadis, prana, kundalini", "Six centers, not seven", "How the Western rainbow was built", "From tantra to the modern model"] },
    { module: "The Seven Chakras", lessons: ["Root, Sacral & Solar Plexus", "Heart, Throat, Third Eye & Crown", "Colors, elements & correspondences", "Balancing practices: breath, sound & movement"] },
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
          estMinutes: 6,
          blocks: [
            { kind: "text", text: "The chakra system is part of a larger 'subtle body' model from Indian yogic and tantric traditions — a map of energy, not anatomy. The Sanskrit word *sūkṣma śarīra* ('subtle body') names a layer of the self that classical texts placed between gross physical flesh and the formless spirit." },
            { kind: "list", items: [
              "**Prana** — the life-force or breath-energy said to animate the body; cognate ideas appear as *qi* in China and *pneuma* in Greece.",
              "**Nadis** — channels through which prana flows (texts describe 72,000; three are principal: *ida*, *pingala*, and the central *sushumna*).",
              "**Kundalini** — an energy pictured as a serpent 'coiled' three-and-a-half times at the base of the spine, which practices aim to awaken and raise.",
              "**Chakras** — 'wheels' or centers strung along the sushumna where the channels meet and prana is said to concentrate.",
            ] },
            { kind: "table", headers: ["Principal nadi", "Side / quality", "Associated with"], rows: [
              ["Ida", "Left, cooling, lunar", "Calm, receptivity, the parasympathetic mood"],
              ["Pingala", "Right, heating, solar", "Drive, activity, the sympathetic mood"],
              ["Sushumna", "Central channel", "The path kundalini rises through when ida and pingala balance"],
            ] },
            { kind: "callout", tone: "tradition", title: "A map of experience", text: "Treat the subtle body as a contemplative, experiential map — a way of working with breath, attention, and sensation — rather than a claim about physical organs. Practitioners report *feeling* energy move; the model gives that felt experience a vocabulary." },
            { kind: "callout", tone: "history", title: "Why 'wheel'?", text: "*Cakra* literally means 'wheel' or 'disk' in Sanskrit. Classical texts describe each center as a lotus with a set number of petals, often spinning — imagery of motion and unfolding, not a mechanical part." },
            { kind: "keyfacts", items: [
              "Subtle body = *sūkṣma śarīra*, a layer between flesh and spirit.",
              "Three principal nadis: ida (left), pingala (right), sushumna (central).",
              "Kundalini is the serpent-energy practices aim to raise up the sushumna.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "In the subtle-body model, 'nadis' are…", options: [
              { id: "a", text: "Channels through which prana flows", correct: true, explanation: "Correct — energy channels." },
              { id: "b", text: "Physical blood vessels", correct: false, explanation: "They're an energetic map, not anatomy." },
              { id: "c", text: "The seven colors", correct: false, explanation: "Colors are a later Western addition." },
              { id: "d", text: "Endocrine glands", correct: false, explanation: "Glands are a later metaphor, not the nadis." },
            ] },
            { id: "q2", type: "mcq", prompt: "'Kundalini' is pictured as…", options: [
              { id: "a", text: "A serpent-energy coiled at the base of the spine", correct: true, explanation: "Yes — practices aim to raise it up the sushumna." },
              { id: "b", text: "A type of food", correct: false, explanation: "No — it's an energy concept." },
              { id: "c", text: "A Western psychologist", correct: false, explanation: "It's a tantric concept." },
            ] },
            { id: "q3", type: "mcq", prompt: "The central channel that kundalini is said to rise through is the…", options: [
              { id: "a", text: "Sushumna", correct: true, explanation: "Correct — the central nadi, between ida and pingala." },
              { id: "b", text: "Ida", correct: false, explanation: "Ida is the left, lunar channel." },
              { id: "c", text: "Pingala", correct: false, explanation: "Pingala is the right, solar channel." },
            ] },
            { id: "q4", type: "recall", prompt: "What Sanskrit word, meaning 'wheel' or 'disk,' gives us the English word 'chakra'?", options: [], answer: "cakra", accept: ["chakra", "cakra", "chakara"], explanation: "*Cakra* means wheel — each center is pictured as a spinning lotus." },
            { id: "q5", type: "true-false", prompt: "The subtle body is best understood as a contemplative map rather than a claim about physical organs.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — it gives felt experience a vocabulary." },
              { id: "f", text: "False", correct: false, explanation: "It is a map of experience, not anatomy." },
            ] },
          ],
        },
        {
          id: "l2-six-centers",
          title: "Six centers, not seven",
          objective: "Recognize that classical sources varied and the key text described six centers.",
          estMinutes: 5,
          blocks: [
            { kind: "callout", tone: "history", title: "A surprising fact", text: "The single most influential classical source, the Ṣaṭ-cakra-nirūpaṇa (1577), literally means 'Description of the SIX Centers.' Many tantric systems used different numbers of chakras entirely — four, five, six, even twenty-one." },
            { kind: "text", text: "In other words, there was never one fixed 'seven chakra' canon in classical India. The neat seven-chakra model most people know today is a later standardization, not the original tradition." },
            { kind: "text", text: "The number reflects each lineage's purpose. A system built around a particular meditation might map five centers; another, tracking the rise of kundalini through finer and finer stages, might map far more. The chakras were tools of practice, shaped to fit the practice." },
            { kind: "table", headers: ["Source / tradition", "Number of centers"], rows: [
              ["Some early tantric texts", "Four or five"],
              ["Ṣaṭ-cakra-nirūpaṇa (1577)", "Six (plus the crown as a seventh 'beyond')"],
              ["Various Buddhist tantras", "Four or five"],
              ["Some later/folk systems", "Up to twenty-one or more"],
            ] },
            { kind: "callout", tone: "tradition", title: "The seventh as 'beyond'", text: "Even in the six-center text, the crown (Sahasrara) sits *above* the counted six — a 'thousand-petalled' goal beyond the body's centers. The modern habit of counting it as a flat 'seventh chakra' flattens that distinction." },
            { kind: "keyfacts", items: [
              "Ṣaṭ-cakra-nirūpaṇa = 'Description of the Six Centers' (1577).",
              "Classical counts ranged from four to twenty-one-plus.",
              "The crown was traditionally framed as 'beyond,' not simply chakra number seven.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "The influential 1577 text describes how many centers?", options: [
              { id: "a", text: "Six", correct: true, explanation: "Correct — 'Ṣaṭ' means six." },
              { id: "b", text: "Seven", correct: false, explanation: "The seven-chakra model is a later standard." },
              { id: "c", text: "Twelve", correct: false, explanation: "No — the key text describes six." },
              { id: "d", text: "Three", correct: false, explanation: "No — the key text describes six." },
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
            { id: "q4", type: "mcq", prompt: "In the six-center text, the crown (Sahasrara) was framed as…", options: [
              { id: "a", text: "A goal 'beyond' the counted centers, not simply chakra seven", correct: true, explanation: "Correct — the thousand-petalled beyond." },
              { id: "b", text: "The lowest of the centers", correct: false, explanation: "It sits above, not below." },
              { id: "c", text: "Identical to the root chakra", correct: false, explanation: "No — they are opposite poles." },
            ] },
            { id: "q5", type: "recall", prompt: "What number does the Sanskrit prefix 'ṣaṭ' (as in Ṣaṭ-cakra-nirūpaṇa) mean?", options: [], answer: "six", accept: ["6", "six"], explanation: "'Ṣaṭ' = six; the title means 'Description of the Six Centers.'" },
          ],
        },
        {
          id: "l3-western-rainbow",
          title: "How the Western rainbow was built",
          objective: "Explain where the seven rainbow colors and gland associations came from.",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "The version with seven centers in rainbow order (red root → violet crown) is a modern synthesis, assembled in the late 1800s to early 1900s as Indian texts met Western occultism and early psychology." },
            { kind: "list", items: [
              "**Sir John Woodroffe** ('Arthur Avalon') translated the key Sanskrit text in *The Serpent Power* (1919), bringing it to English readers with the original symbolism largely intact.",
              "**The Theosophical Society** — especially **Charles Leadbeater**, in *The Chakras* (1927) — fixed the now-standard rainbow colors and linked chakras to nerve plexuses and endocrine glands.",
              "**Carl Jung** lectured on kundalini yoga (1932), reframing the chakras as stages of psychological development — a reading that shaped how the West sees them as 'inner growth.'",
            ] },
            { kind: "callout", tone: "history", title: "Not in the originals", text: "The rainbow colors and gland associations were Leadbeater's additions. They aren't found in the original Sanskrit texts — classical sources gave each lotus its own traditional color (the root, for instance, is often described as crimson or yellow, not a fixed 'red'). So when you see the familiar color chart, you're looking at the Western, Theosophical version." },
            { kind: "callout", tone: "tip", title: "Two layers, kept distinct", text: "It helps to hold two layers at once: the *classical* tantric system (deities, mantras, petal-counts) and the *modern Western* synthesis (rainbow colors, glands, psychology). Both are worth knowing — just don't mistake the second for the first." },
            { kind: "table", headers: ["Figure", "Year", "Contribution"], rows: [
              ["Woodroffe / 'Avalon'", "1919", "First major English translation (*The Serpent Power*)"],
              ["Charles Leadbeater", "1927", "Fixed rainbow colors; linked chakras to glands"],
              ["Carl Jung", "1932", "Psychological reading of kundalini"],
            ] },
            { kind: "keyfacts", items: [
              "Rainbow order (red → violet) is a 20th-century Theosophical addition.",
              "Woodroffe (1919) translated; Leadbeater (1927) colorized; Jung (1932) psychologized.",
              "Classical lotuses had their own colors, not the modern rainbow.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "The standard rainbow colors of the chakras were fixed by…", options: [
              { id: "a", text: "Charles Leadbeater (Theosophy), 1927", correct: true, explanation: "Correct — a 20th-century addition." },
              { id: "b", text: "Ancient tantric texts", correct: false, explanation: "The colors aren't in the originals." },
              { id: "c", text: "Pythagoras", correct: false, explanation: "Unrelated." },
              { id: "d", text: "Sir John Woodroffe", correct: false, explanation: "Woodroffe translated; Leadbeater added the colors." },
            ] },
            { id: "q2", type: "true-false", prompt: "The rainbow colors and gland links appear in the original Sanskrit texts.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — they're modern Western additions." },
              { id: "f", text: "False", correct: true, explanation: "Correct — they came from Theosophy." },
            ] },
            { id: "q3", type: "mcq", prompt: "Who brought the key chakra text to English readers in 1919?", options: [
              { id: "a", text: "Sir John Woodroffe ('Arthur Avalon')", correct: true, explanation: "Yes — in *The Serpent Power*." },
              { id: "b", text: "Anodea Judith", correct: false, explanation: "She's a later (1980s+) figure." },
              { id: "c", text: "Carl Jung", correct: false, explanation: "Jung lectured on it in 1932 but didn't translate it." },
            ] },
            { id: "q4", type: "mcq", prompt: "Carl Jung's main contribution to the Western chakra picture was…", options: [
              { id: "a", text: "Reading the chakras as stages of psychological development", correct: true, explanation: "Correct — his 1932 lectures shaped the 'inner growth' framing." },
              { id: "b", text: "Translating the Sanskrit text", correct: false, explanation: "That was Woodroffe." },
              { id: "c", text: "Inventing the rainbow colors", correct: false, explanation: "That was Leadbeater." },
            ] },
            { id: "q5", type: "true-false", prompt: "It's accurate to keep the classical tantric system and the modern Western synthesis as distinct layers.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — both are worth knowing; don't mistake one for the other." },
              { id: "f", text: "False", correct: false, explanation: "They are genuinely different layers." },
            ] },
          ],
        },
        {
          id: "l9-tantra-to-modern",
          title: "From tantra to the modern model",
          objective: "Trace the chakra system's journey from medieval tantra to today's wellness culture.",
          estMinutes: 6,
          blocks: [
            { kind: "text", text: "Chakras didn't travel in a straight line from ancient India to the yoga studio. The journey runs through medieval tantra, colonial-era translation, Western occultism, mid-century psychology, and finally the New Age and wellness movements — each stage reshaping the model." },
            { kind: "callout", tone: "history", title: "Origins in tantra", text: "Chakra ideas crystallized in the tantric and haṭha-yoga texts of roughly the 8th–16th centuries CE — practical manuals for working with breath, posture, and visualization to raise kundalini. They were esoteric, transmitted from guru to initiated student, not public knowledge." },
            { kind: "list", ordered: true, items: [
              "**Medieval tantra (c. 8th–16th c.)** — chakra systems develop within haṭha-yoga lineages; counts and colors vary by school.",
              "**Colonial translation (late 1800s–1919)** — Western scholars and theosophists encounter the texts; Woodroffe publishes *The Serpent Power*.",
              "**Theosophy & occultism (1920s)** — Leadbeater fixes the rainbow and gland map for a Western audience.",
              "**Psychology (1930s+)** — Jung and successors read the chakras as a map of the psyche.",
              "**New Age & wellness (1970s–today)** — chakras merge with crystals, color therapy, and self-help; Anodea Judith's *Wheels of Life* (1987) popularizes the modern synthesis.",
            ] },
            { kind: "callout", tone: "culture", title: "What gets lost in transit", text: "Each Westward step tended to drop the deities, seed-mantras, and initiatory context and keep the parts that fit Western tastes — colors, psychology, self-improvement. That's why the studio version can feel so different from the tantric source." },
            { kind: "callout", tone: "evidence", title: "Why the lineage matters", text: "Knowing this history is the honest antidote to two errors: pretending the rainbow model is 'ancient,' and dismissing the whole thing as 'made up in the 1970s.' Both are wrong. It's a genuinely old contemplative tradition that was repeatedly reinterpreted." },
            { kind: "keyfacts", items: [
              "Chakra systems crystallized in haṭha-yoga/tantra c. 8th–16th c. CE.",
              "The modern synthesis was built in stages: 1919 → 1927 → 1932 → 1987.",
              "Anodea Judith's *Wheels of Life* (1987) cemented the popular Western model.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Chakra systems mainly crystallized in which kind of texts?", options: [
              { id: "a", text: "Medieval tantric and haṭha-yoga manuals", correct: true, explanation: "Correct — roughly the 8th–16th centuries CE." },
              { id: "b", text: "Ancient Greek philosophy", correct: false, explanation: "No — they are Indian." },
              { id: "c", text: "19th-century American self-help", correct: false, explanation: "That's only the latest layer." },
            ] },
            { id: "q2", type: "mcq", prompt: "Which book (1987) helped cement the popular modern Western chakra model?", options: [
              { id: "a", text: "Anodea Judith's *Wheels of Life*", correct: true, explanation: "Correct — a key New Age popularizer." },
              { id: "b", text: "Woodroffe's *The Serpent Power*", correct: false, explanation: "That's the 1919 translation." },
              { id: "c", text: "Leadbeater's *The Chakras*", correct: false, explanation: "That's the 1927 Theosophical text." },
            ] },
            { id: "q3", type: "true-false", prompt: "It's accurate to say chakras were simply 'invented in the 1970s.'", options: [
              { id: "t", text: "True", correct: false, explanation: "No — the tradition is genuinely old, just repeatedly reinterpreted." },
              { id: "f", text: "False", correct: true, explanation: "Correct — old tradition, modern synthesis." },
            ] },
            { id: "q4", type: "mcq", prompt: "What tended to get dropped as the system moved West?", options: [
              { id: "a", text: "The deities, seed-mantras, and initiatory context", correct: true, explanation: "Correct — the parts that didn't fit Western tastes." },
              { id: "b", text: "The rainbow colors", correct: false, explanation: "Those were *added* in the West." },
              { id: "c", text: "The psychological readings", correct: false, explanation: "Those were also added in the West." },
            ] },
            { id: "q5", type: "recall", prompt: "In one word, what kind of yoga produced many of the medieval texts that crystallized the chakra system (___-yoga)?", options: [], answer: "hatha", accept: ["hatha", "haṭha", "hatha yoga", "haṭha yoga"], explanation: "Haṭha-yoga manuals worked with breath, posture, and kundalini." },
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
          estMinutes: 6,
          blocks: [
            { kind: "text", text: "The lower three centers (in the Western system) deal with foundation, feeling, and personal power — the chakras most tied to the body and to our place in the material world." },
            { kind: "table", headers: ["Chakra", "Sanskrit", "Location", "Color", "Element", "Theme"], rows: [
              ["Root", "Muladhara", "Base of spine", "Red", "Earth", "Safety, grounding, survival"],
              ["Sacral", "Svadhisthana", "Lower abdomen", "Orange", "Water", "Emotion, creativity, sexuality"],
              ["Solar Plexus", "Manipura", "Navel", "Yellow", "Fire", "Will, confidence, power"],
            ] },
            { kind: "callout", tone: "tradition", title: "Ascending elements", text: "The lower centers follow the classical element ladder — earth (densest), water, then fire — mirroring a movement from solid ground up toward energy and transformation." },
            { kind: "list", items: [
              "**Root** — when themes here feel 'settled,' people describe feeling safe, present, and resourced; the focus is on the body and basic needs.",
              "**Sacral** — the seat of pleasure, desire, and creative flow; associated with the felt life of emotion.",
              "**Solar Plexus** — the 'fire in the belly': agency, boundaries, and self-esteem.",
            ] },
            { kind: "callout", tone: "evidence", title: "How to read these themes", text: "Treat the themes as a reflective vocabulary, not a diagnosis. 'My root feels shaky' is a useful way to name 'I feel unsafe and ungrounded' — it's a prompt for self-reflection, not a measurable condition." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "The Root chakra (Muladhara) is associated with…", options: [
              { id: "a", text: "Safety and grounding", correct: true, explanation: "Correct — the foundation center." },
              { id: "b", text: "Communication", correct: false, explanation: "That's the Throat chakra." },
              { id: "c", text: "Intuition", correct: false, explanation: "That's the Third Eye." },
              { id: "d", text: "Compassion", correct: false, explanation: "That's the Heart." },
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
            { id: "q4", type: "mcq", prompt: "The element traditionally paired with the Sacral chakra is…", options: [
              { id: "a", text: "Water", correct: true, explanation: "Correct — water, fitting its themes of flow and emotion." },
              { id: "b", text: "Earth", correct: false, explanation: "Earth belongs to the Root." },
              { id: "c", text: "Fire", correct: false, explanation: "Fire belongs to the Solar Plexus." },
            ] },
            { id: "q5", type: "recall", prompt: "What is the Sanskrit name of the Root chakra?", options: [], answer: "Muladhara", accept: ["muladhara", "mooladhara", "mūlādhāra"], explanation: "Muladhara — 'root-support,' at the base of the spine." },
            { id: "q6", type: "true-false", prompt: "The chakra 'themes' are best used as a reflective vocabulary, not a medical diagnosis.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — they prompt self-reflection, not diagnosis." },
              { id: "f", text: "False", correct: false, explanation: "They are a reflective tool, not a clinical measure." },
            ] },
          ],
        },
        {
          id: "l5-upper-chakras",
          title: "Heart, Throat, Third Eye & Crown",
          objective: "Recall the upper four chakras and their themes.",
          estMinutes: 6,
          blocks: [
            { kind: "sort", prompt: "Lower vs upper chakras", instructions: "Tap a centre, then tap where it sits", groups: [
              { name: "Lower (body)", accent: "#c0392b", items: ["Root", "Sacral", "Solar Plexus"] },
              { name: "Upper (spirit)", accent: "#8e6bb5", items: ["Heart", "Throat", "Third Eye", "Crown"] },
            ] },
            { kind: "text", text: "The upper four centers move from connection and expression toward insight and spirit — the chakras most tied to relationship, mind, and the transpersonal." },
            { kind: "table", headers: ["Chakra", "Sanskrit", "Location", "Color", "Theme"], rows: [
              ["Heart", "Anahata", "Center of chest", "Green", "Love, compassion"],
              ["Throat", "Vishuddha", "Throat", "Blue", "Communication, truth"],
              ["Third Eye", "Ajna", "Brow", "Indigo", "Intuition, insight"],
              ["Crown", "Sahasrara", "Top of head", "Violet / white", "Spiritual connection"],
            ] },
            { kind: "callout", tone: "tip", title: "The bridge", text: "The Heart chakra sits between the lower (earthly) and upper (spiritual) centers — often described as where the two meet, turning self-concern into care for others." },
            { kind: "callout", tone: "tradition", title: "Beyond the elements", text: "Where the lower chakras map to earth, water, and fire, the upper centers move past dense matter: the Heart is paired with air, the Throat with ether/sound, and the Ajna and Sahasrara with mind and pure consciousness — increasingly subtle 'elements.'" },
            { kind: "list", items: [
              "**Heart (Anahata)** — *anahata* means 'unstruck' (a sound made without two things striking), an image of inner stillness.",
              "**Throat (Vishuddha)** — 'especially pure'; the center of authentic voice.",
              "**Third Eye (Ajna)** — 'command' or 'perceiving'; insight and the inner witness.",
              "**Crown (Sahasrara)** — the 'thousand-petalled' lotus; union and pure awareness.",
            ] },
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
            { id: "q4", type: "mcq", prompt: "The Third Eye is traditionally named…", options: [
              { id: "a", text: "Ajna", correct: true, explanation: "Correct — 'command/perceiving,' at the brow." },
              { id: "b", text: "Vishuddha", correct: false, explanation: "Vishuddha is the Throat." },
              { id: "c", text: "Anahata", correct: false, explanation: "Anahata is the Heart." },
            ] },
            { id: "q5", type: "true-false", prompt: "The Heart chakra is often described as the bridge between the lower and upper centers.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — where earthly and spiritual meet." },
              { id: "f", text: "False", correct: false, explanation: "It is the classic 'bridge' center." },
            ] },
          ],
        },
        {
          id: "l10-correspondences",
          title: "Colors, elements & correspondences",
          objective: "Lay out the standard seven-chakra correspondences and know which are classical vs. modern.",
          estMinutes: 6,
          blocks: [
            { kind: "text", text: "Modern chakra charts pack each center with a stack of correspondences: a color, an element, a seed sound, a number of lotus petals, and a body region. Some of these are genuinely classical; others (notably the rainbow colors and gland links) are the Western additions you met earlier. Here is the standard, accepted seven." },
            { kind: "table", headers: ["Chakra", "Color", "Element", "Bija (seed) mantra", "Petals"], rows: [
              ["Root (Muladhara)", "Red", "Earth", "LAM", "4"],
              ["Sacral (Svadhisthana)", "Orange", "Water", "VAM", "6"],
              ["Solar Plexus (Manipura)", "Yellow", "Fire", "RAM", "10"],
              ["Heart (Anahata)", "Green", "Air", "YAM", "12"],
              ["Throat (Vishuddha)", "Blue", "Ether / sound", "HAM", "16"],
              ["Third Eye (Ajna)", "Indigo", "Mind / light", "OM", "2"],
              ["Crown (Sahasrara)", "Violet / white", "Consciousness", "OM / silence", "1,000"],
            ] },
            { kind: "callout", tone: "tradition", title: "Classical vs. modern", text: "The Sanskrit names, the bija mantras, the petal-counts, and the lower elements (earth/water/fire/air/ether) are genuinely classical. The neat rainbow color order is the modern Theosophical layer. Mixing them is fine — just know which is which." },
            { kind: "callout", tone: "tip", title: "Why these correspondences are useful", text: "A correspondence is a memory hook and a focus aid, not a measured fact. Picturing a warm red glow at the base of the spine while chanting LAM gives attention something concrete to rest on — that's the practical point of the chart." },
            { kind: "match", prompt: "Match each chakra to its seed sound", instructions: "Tap a chakra, then tap its bija mantra", pairs: [
              { cue: "🔴 Root", match: "LAM — earth, base of spine" },
              { cue: "🟠 Sacral", match: "VAM — water, lower belly" },
              { cue: "🟡 Solar Plexus", match: "RAM — fire, navel" },
              { cue: "🟢 Heart", match: "YAM — air, center of chest" },
              { cue: "🔵 Throat", match: "HAM — ether, throat" },
              { cue: "🟣 Third Eye", match: "OM — light, brow" },
              { cue: "⚪ Crown", match: "OM / silence — consciousness, crown" },
            ] },
            { kind: "keyfacts", items: [
              "Lower-to-upper elements: earth, water, fire, air, ether, mind, consciousness.",
              "Bija mantras: LAM, VAM, RAM, YAM, HAM, OM, OM/silence.",
              "Petal counts rise toward the crown's 'thousand-petalled' lotus.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "The bija (seed) mantra traditionally paired with the Root chakra is…", options: [
              { id: "a", text: "LAM", correct: true, explanation: "Correct — LAM for the earth-element root." },
              { id: "b", text: "HAM", correct: false, explanation: "HAM belongs to the Throat." },
              { id: "c", text: "YAM", correct: false, explanation: "YAM belongs to the Heart." },
              { id: "d", text: "VAM", correct: false, explanation: "VAM belongs to the Sacral." },
            ] },
            { id: "q2", type: "mcq", prompt: "Which element is paired with the Heart chakra?", options: [
              { id: "a", text: "Air", correct: true, explanation: "Correct — the Heart's element is air." },
              { id: "b", text: "Fire", correct: false, explanation: "Fire is the Solar Plexus." },
              { id: "c", text: "Water", correct: false, explanation: "Water is the Sacral." },
            ] },
            { id: "q3", type: "mcq", prompt: "Which correspondence is the modern (Theosophical) layer rather than classical?", options: [
              { id: "a", text: "The neat rainbow color order", correct: true, explanation: "Correct — the rainbow is the modern Western addition." },
              { id: "b", text: "The bija mantras", correct: false, explanation: "Seed mantras are classical." },
              { id: "c", text: "The petal counts", correct: false, explanation: "Petal counts are classical." },
            ] },
            { id: "q4", type: "true-false", prompt: "A correspondence (like a color or seed sound) is best treated as a focus aid, not a measured physical fact.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — it's a memory hook and attention anchor." },
              { id: "f", text: "False", correct: false, explanation: "These are focusing aids, not measurements." },
            ] },
            { id: "q5", type: "recall", prompt: "Which chakra is the 'thousand-petalled' lotus?", options: [], answer: "Crown", accept: ["crown", "sahasrara", "crown chakra"], explanation: "Sahasrara, the Crown — *sahasra* means 'thousand.'" },
          ],
        },
        {
          id: "l6-balancing",
          title: "Balancing practices: breath, sound & movement",
          objective: "Name the practices used to 'balance' chakras and their real benefits.",
          estMinutes: 6,
          blocks: [
            { kind: "explore", prompt: "The seven chakras", instructions: "Tap a centre to learn it", items: [
              { glyph: "🔴", name: "Root", meta: "Muladhara · base of spine", accent: "#c0392b", blurb: "Safety, grounding and the body. Governs our sense of security." },
              { glyph: "🟠", name: "Sacral", meta: "Svadhisthana · lower belly", accent: "#d35400", blurb: "Pleasure, creativity and emotion — the flow of feeling and desire." },
              { glyph: "🟡", name: "Solar Plexus", meta: "Manipura · upper belly", accent: "#c9a227", blurb: "Will, confidence and personal power. The seat of self-esteem." },
              { glyph: "🟢", name: "Heart", meta: "Anahata · centre of chest", accent: "#6a9a4a", blurb: "Love and compassion — the bridge between lower and upper centres." },
              { glyph: "🔵", name: "Throat", meta: "Vishuddha · throat", accent: "#2e86c1", blurb: "Voice, truth and expression — speaking and being heard." },
              { glyph: "🟣", name: "Third Eye", meta: "Ajna · brow", accent: "#6c5ce7", blurb: "Insight, intuition and imagination. Seeing clearly within." },
              { glyph: "⚪", name: "Crown", meta: "Sahasrara · top of head", accent: "#b8a0d2", blurb: "Connection to the whole — meaning, awareness and the transpersonal." },
            ] },
            { kind: "text", text: "Traditional practices to work with the chakras fall into a few families: breath, sound, movement, and focused attention. None of them require believing in a literal spinning wheel to be worth doing." },
            { kind: "table", headers: ["Family", "Example practice", "What you actually do"], rows: [
              ["Breath", "Pranayama (e.g. nadi shodhana, alternate-nostril)", "Slow, regulated breathing that settles the nervous system"],
              ["Sound", "Bija mantras (LAM, VAM, OM…)", "Chant a seed syllable while attending to the matching center"],
              ["Movement", "Yoga asana, gentle spinal movement", "Postures linked to each center to release tension"],
              ["Attention", "Visualization & meditation", "Rest attention on a color/location with focused, relaxed awareness"],
            ] },
            { kind: "callout", tone: "evidence", title: "The real benefit", text: "Frame these honestly: slow breathwork, focused attention, gentle movement, and relaxation have genuine, measurable effects on stress and mood — independent of whether a literal 'wheel' is being unblocked. That's the substance behind the practice, and it's nothing to apologize for." },
            { kind: "callout", tone: "tip", title: "A simple sequence to try", text: "Sit comfortably. Take ten slow breaths, exhaling a little longer than you inhale. Then rest attention at the base of the spine and silently sound 'LAM' on each exhale for a minute. Notice how you feel. You're practicing focused attention and breath regulation — the genuinely useful core." },
            { kind: "callout", tone: "safety", title: "Go gently", text: "Intense or forceful breathwork (rapid 'breath of fire,' long breath-holds) can cause dizziness, tingling, or anxiety. Keep it gentle, stop if you feel lightheaded, and don't practice forceful pranayama if you're pregnant or have a heart or seizure condition without professional guidance." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "A 'bija mantra' is…", options: [
              { id: "a", text: "A seed sound (like LAM or OM) used in practice", correct: true, explanation: "Correct — seed syllables for each center." },
              { id: "b", text: "A yoga mat", correct: false, explanation: "No — it's a sound/mantra." },
              { id: "c", text: "A crystal", correct: false, explanation: "Unrelated." },
              { id: "d", text: "A breathing posture", correct: false, explanation: "No — it's a chanted seed syllable." },
            ] },
            { id: "q2", type: "mcq", prompt: "The measurable benefit of chakra practices comes mainly from…", options: [
              { id: "a", text: "Breathwork, attention, movement, and relaxation", correct: true, explanation: "Yes — well-studied effects on stress and mood." },
              { id: "b", text: "Watching a video about chakras", correct: false, explanation: "The benefit comes from doing the practice, not from passive viewing." },
              { id: "c", text: "Taking medication", correct: false, explanation: "These are contemplative practices, not drugs." },
            ] },
            { id: "q3", type: "true-false", prompt: "Pranayama means breath control.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — regulated breathing." },
              { id: "f", text: "False", correct: false, explanation: "It does mean breath control." },
            ] },
            { id: "q4", type: "mcq", prompt: "Why should forceful breathwork be approached cautiously?", options: [
              { id: "a", text: "It can cause dizziness, tingling, or anxiety", correct: true, explanation: "Correct — go gently and stop if lightheaded." },
              { id: "b", text: "It permanently blocks the chakras", correct: false, explanation: "That's not the concern; the concern is real physical effects." },
              { id: "c", text: "It is illegal", correct: false, explanation: "No — it's simply a physical-safety caution." },
            ] },
            { id: "q5", type: "recall", prompt: "What is the general term for yogic breath-control practices?", options: [], answer: "pranayama", accept: ["pranayama", "prāṇāyāma", "prana yama"], explanation: "Pranayama — regulated, intentional breathing." },
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
          title: "The chakras as an inner map",
          objective: "Understand the chakra system as a contemplative map of the inner life.",
          estMinutes: 5,
          blocks: [
            { kind: "callout", tone: "tradition", title: "A map of the inner life", text: "The chakra system is a contemplative map of the subtle body — a centuries-old way of charting the inner life from root to crown. Each center names a layer of human experience: security, feeling, will, love, voice, insight, and transcendence. Held this way, it's a remarkably rich framework for bringing attention to where you are within yourself." },
            { kind: "text", text: "Western writers have often noted that the chakra centers sit near the body's nerve plexuses and glands — a resonance that helps explain why working with each center can feel so embodied. The system's real gift is as a focusing map: a guide for directing breath, attention, and emotion through the layers of the self." },
            { kind: "callout", tone: "tip", title: "Why the practices feel good", text: "The practices built around the chakras — slow breathing, meditation, gentle yoga — have a well-documented effect on calming the nervous system and improving mood and focus. So a chakra practice gives you both: a meaningful symbolic map and an embodied set of techniques that genuinely steady the body and mind." },
            { kind: "table", headers: ["Center", "Layer of experience it maps"], rows: [
              ["Root", "Safety, grounding, the body"],
              ["Heart", "Love, compassion, connection"],
              ["Throat", "Voice, expression, truth"],
              ["Crown", "Insight, meaning, transcendence"],
            ] },
            { kind: "callout", tone: "safety", title: "No medical claims", text: "Working with a chakra is a contemplative practice, not a treatment. Never use it in place of medical or mental-health care. Note too that intense kundalini/breathwork can occasionally cause anxiety or dizziness — go gently." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "The chakra system is best understood as…", options: [
              { id: "a", text: "A contemplative map of the inner life and subtle body", correct: true, explanation: "Correct — it charts layers of human experience from root to crown." },
              { id: "b", text: "A set of confirmed anatomical organs", correct: false, explanation: "It's a symbolic map of experience, not a list of organs." },
              { id: "c", text: "A diagnostic medical tool", correct: false, explanation: "It makes no medical claims." },
              { id: "d", text: "A modern fitness regimen", correct: false, explanation: "It's an ancient contemplative framework." },
            ] },
            { id: "q2", type: "mcq", prompt: "The chakra centers sitting near the body's nerve plexuses helps explain…", options: [
              { id: "a", text: "Why working with each center can feel so embodied", correct: true, explanation: "Right — the resonance grounds the practice in the body." },
              { id: "b", text: "That chakras are literally glands", correct: false, explanation: "It's a resonance, not an identity." },
              { id: "c", text: "Nothing about the practice", correct: false, explanation: "The embodied resonance is part of why the work lands." },
            ] },
            { id: "q3", type: "true-false", prompt: "Chakra work is a contemplative practice, not a replacement for medical care.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — never substitute it for medical or mental-health care." },
              { id: "f", text: "False", correct: false, explanation: "It's a reflective practice — keep medical care separate." },
            ] },
            { id: "q4", type: "mcq", prompt: "Alongside the symbolic map, chakra practices offer…", options: [
              { id: "a", text: "Breathwork and meditation that calm the nervous system", correct: true, explanation: "Correct — well-documented effects on stress and focus." },
              { id: "b", text: "A cure for disease", correct: false, explanation: "Never a medical claim." },
              { id: "c", text: "A substitute for therapy", correct: false, explanation: "Contemplative practice complements care; it doesn't replace it." },
            ] },
            { id: "q5", type: "true-false", prompt: "The chakra system charts layers of inner experience, from grounding at the root to insight at the crown.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — that ascent through the layers of the self is the heart of the map." },
              { id: "f", text: "False", correct: false, explanation: "Mapping experience from root to crown is exactly what the system does." },
            ] },
          ],
        },
        {
          id: "l8-respect",
          title: "Respect & cultural appropriation",
          objective: "Engage with the chakra system respectfully.",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "Chakras are a living sacred tradition rooted in Hindu and Buddhist tantra, historically passed from teacher to student through initiation. The popular Western form often strips away the deities, mantras, and context and sells it as generic 'self-care.'" },
            { kind: "callout", tone: "culture", title: "How to engage respectfully", text: "Credit the Indian/tantric origins explicitly, keep the classical tradition distinct from the Theosophical/Western synthesis, use the Sanskrit terms accurately, and avoid treating sacred symbols as mere aesthetic props." },
            { kind: "list", items: [
              "**Name the source.** Say 'this comes from Indian tantric tradition,' not 'ancient wisdom' in the abstract.",
              "**Separate the layers.** Be clear when you're using the modern rainbow/psychology version versus the classical system.",
              "**Use terms with care.** Sanskrit names (Muladhara, Anahata…) carry meaning; learn them rather than flattening everything to colors.",
              "**Avoid sacred-as-decoration.** Deity images and yantras are objects of devotion for living communities, not just pretty patterns.",
            ] },
            { kind: "callout", tone: "tip", title: "Appreciation vs. appropriation", text: "The line isn't 'only insiders may engage.' It's about *how*: appreciation credits sources, learns context, and stays humble; appropriation extracts the marketable parts, erases the origin, and profits while the source community is ignored." },
            { kind: "callout", tone: "evidence", title: "Honesty is part of respect", text: "Being clear that chakras aren't verified physical structures isn't disrespectful — it's accurate. You can hold deep respect for a contemplative tradition *and* be honest about what science can and can't show. The two go together." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "The chakra system is rooted in…", options: [
              { id: "a", text: "Hindu and Buddhist tantra", correct: true, explanation: "Correct — credit these origins." },
              { id: "b", text: "Greek philosophy", correct: false, explanation: "No — it's from Indian traditions." },
              { id: "c", text: "Norse mythology", correct: false, explanation: "Unrelated." },
              { id: "d", text: "Modern American self-help", correct: false, explanation: "That's only the latest layer." },
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
            { id: "q4", type: "mcq", prompt: "The clearest difference between appreciation and appropriation is…", options: [
              { id: "a", text: "Whether you credit sources, learn context, and stay humble", correct: true, explanation: "Correct — it's about *how* you engage." },
              { id: "b", text: "Whether you were born in a particular country", correct: false, explanation: "It's about conduct, not birthplace." },
              { id: "c", text: "Whether you use the color charts", correct: false, explanation: "Color charts aren't the deciding factor." },
            ] },
            { id: "q5", type: "true-false", prompt: "Being honest that chakras aren't verified physical structures is incompatible with respecting the tradition.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — honesty and respect go together." },
              { id: "f", text: "False", correct: true, explanation: "Correct — you can respect the tradition and be accurate about the science." },
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
    { id: "f12", type: "mcq", prompt: "The chakra system is best understood as…", options: [
      { id: "a", text: "A contemplative map of the inner life and subtle body", correct: true },
      { id: "b", text: "A set of confirmed anatomical organs", correct: false },
      { id: "c", text: "A diagnostic medical tool", correct: false },
      { id: "d", text: "A modern fitness trend", correct: false },
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
    { id: "f17", type: "mcq", prompt: "The central channel kundalini is said to rise through is the…", options: [
      { id: "a", text: "Sushumna", correct: true },
      { id: "b", text: "Ida", correct: false },
      { id: "c", text: "Pingala", correct: false },
      { id: "d", text: "Anahata", correct: false },
    ] },
    { id: "f18", type: "mcq", prompt: "Who first brought the key chakra text to English readers (1919)?", options: [
      { id: "a", text: "Sir John Woodroffe ('Arthur Avalon')", correct: true },
      { id: "b", text: "Charles Leadbeater", correct: false },
      { id: "c", text: "Anodea Judith", correct: false },
      { id: "d", text: "Carl Jung", correct: false },
    ] },
    { id: "f19", type: "mcq", prompt: "Carl Jung's main contribution to the Western chakra picture was…", options: [
      { id: "a", text: "Reading the chakras as stages of psychological development", correct: true },
      { id: "b", text: "Translating the Sanskrit", correct: false },
      { id: "c", text: "Inventing the rainbow colors", correct: false },
      { id: "d", text: "Discovering chakras on scans", correct: false },
    ] },
    { id: "f20", type: "mcq", prompt: "The element traditionally paired with the Root chakra is…", options: [
      { id: "a", text: "Earth", correct: true },
      { id: "b", text: "Water", correct: false },
      { id: "c", text: "Fire", correct: false },
      { id: "d", text: "Air", correct: false },
    ] },
    { id: "f21", type: "mcq", prompt: "The element traditionally paired with the Heart chakra is…", options: [
      { id: "a", text: "Air", correct: true },
      { id: "b", text: "Earth", correct: false },
      { id: "c", text: "Fire", correct: false },
      { id: "d", text: "Water", correct: false },
    ] },
    { id: "f22", type: "mcq", prompt: "The Sanskrit name of the Heart chakra is…", options: [
      { id: "a", text: "Anahata", correct: true },
      { id: "b", text: "Muladhara", correct: false },
      { id: "c", text: "Vishuddha", correct: false },
      { id: "d", text: "Sahasrara", correct: false },
    ] },
    { id: "f23", type: "mcq", prompt: "Which book (1987) helped cement the popular Western chakra model?", options: [
      { id: "a", text: "Anodea Judith's *Wheels of Life*", correct: true },
      { id: "b", text: "Woodroffe's *The Serpent Power*", correct: false },
      { id: "c", text: "Leadbeater's *The Chakras*", correct: false },
      { id: "d", text: "Jung's collected works", correct: false },
    ] },
    { id: "f24", type: "mcq", prompt: "Which seed mantra is traditionally paired with the Root chakra?", options: [
      { id: "a", text: "LAM", correct: true },
      { id: "b", text: "YAM", correct: false },
      { id: "c", text: "HAM", correct: false },
      { id: "d", text: "VAM", correct: false },
    ] },
    { id: "f25", type: "true-false", prompt: "The rainbow color order is a classical feature found in the original Sanskrit texts.", options: [
      { id: "t", text: "True", correct: false },
      { id: "f", text: "False", correct: true },
    ] },
    { id: "f26", type: "true-false", prompt: "Slow breathing and meditation have a real evidence base for reducing stress.", options: [
      { id: "t", text: "True", correct: true },
      { id: "f", text: "False", correct: false },
    ] },
    { id: "f27", type: "mcq", prompt: "Chakra systems mainly crystallized in which texts?", options: [
      { id: "a", text: "Medieval tantric and haṭha-yoga manuals", correct: true },
      { id: "b", text: "Ancient Greek treatises", correct: false },
      { id: "c", text: "Norse sagas", correct: false },
      { id: "d", text: "Victorian medical journals", correct: false },
    ] },
    { id: "f28", type: "mcq", prompt: "Forceful breathwork should be approached cautiously because it can cause…", options: [
      { id: "a", text: "Dizziness, tingling, or anxiety", correct: true },
      { id: "b", text: "Permanent chakra damage", correct: false },
      { id: "c", text: "Legal trouble", correct: false },
      { id: "d", text: "Nothing at all", correct: false },
    ] },
  ],
};
