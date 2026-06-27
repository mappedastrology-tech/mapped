import type { Course } from "../types";

/** FLAGSHIP #7 — Essential oils, taught evidence-first and safety-first. */
export const essentialOilsFoundations: Course = {
  id: "essential-oils-foundations",
  domain: "essential-oils",
  title: "Essential Oils: Safe & Effective Use",
  subtitle: "Aromatherapy done responsibly",
  level: "foundations",
  icon: "🪔",
  summary:
    "Understand what essential oils are, what aromatherapy can and can't do, and how to dilute and use them safely around people and pets.",
  estMinutes: 40,
  status: "published",
  passThreshold: 0.8,
  finalTestSize: 10,
  safetyNote:
    "Essential oils must be diluted, some are phototoxic (citrus + sun), and many are toxic to cats and dogs. Never ingest without expert guidance. Not a substitute for medical care.",

  outline: [
    { module: "Basics", lessons: ["What essential oils are", "Carriers & dilution", "Methods: diffusion vs topical"] },
    { module: "Common Oils", lessons: ["Lavender & peppermint", "Tea tree, eucalyptus & citrus"] },
    { module: "Safety First", lessons: ["Phototoxicity & the sun", "Skin sensitization & patch testing", "Oils toxic to cats & dogs", "Pregnancy, children & special cautions"] },
  ],

  modules: [
    {
      id: "m1",
      title: "Basics",
      lessons: [
        {
          id: "l1-what-they-are",
          title: "What essential oils are",
          objective: "Explain what an essential oil is and how it's made.",
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "An essential oil is a highly concentrated, volatile extract of a plant's aromatic compounds — the 'essence' of its scent. 'Essential' refers to that essence, not to the oil being necessary or nutritionally essential." },
            { kind: "text", text: "Most are made by steam distillation; citrus oils are usually cold-pressed from the peel. Because they're concentrated, a tiny amount represents a large quantity of plant material — which is exactly why they must be respected and diluted." },
            { kind: "keyfacts", items: [
              "Essential oils are concentrated aromatic plant extracts.",
              "Most are steam-distilled; citrus oils are cold-pressed.",
              "Concentrated = potent — they are not 'gentle because natural.'",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "An essential oil is…", options: [
              { id: "a", text: "A concentrated, volatile extract of a plant's aromatic compounds", correct: true, explanation: "Correct — the plant's aromatic 'essence,' highly concentrated." },
              { id: "b", text: "A nutritionally essential fatty acid", correct: false, explanation: "No — 'essential' here means essence, not dietary necessity." },
              { id: "c", text: "A diluted herbal tea", correct: false, explanation: "It's the opposite — highly concentrated." },
            ] },
            { id: "q2", type: "mcq", prompt: "Most essential oils are produced by…", options: [
              { id: "a", text: "Steam distillation (citrus oils are cold-pressed)", correct: true, explanation: "Yes — distillation, with citrus cold-pressed from peel." },
              { id: "b", text: "Freezing the whole plant", correct: false, explanation: "That's not how oils are extracted." },
              { id: "c", text: "Adding chemicals to water", correct: false, explanation: "They're physically extracted from plants." },
            ] },
            { id: "q3", type: "true-false", prompt: "Because essential oils are natural, they are automatically gentle and safe.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — they're concentrated and potent; natural ≠ safe." },
              { id: "f", text: "False", correct: true, explanation: "Correct — concentration demands respect and dilution." },
            ] },
          ],
        },
        {
          id: "l2-dilution",
          title: "Carriers & dilution",
          objective: "Apply safe dilution ratios for topical use.",
          estMinutes: 5,
          blocks: [
            { kind: "callout", tone: "safety", title: "Dilute before skin contact", text: "Almost all essential oils should be diluted in a carrier oil (like jojoba, sweet almond, or fractionated coconut) before they touch skin. Applying them 'neat' (undiluted) risks irritation and sensitization." },
            { kind: "table", headers: ["Who", "Typical dilution"], rows: [
              ["Adults, general use", "1–3% (≈ 6–18 drops per ounce of carrier)"],
              ["Children, elderly, sensitive skin, face", "0.5–1% or lower"],
              ["Babies / infants", "Avoid most oils — check a professional first"],
            ] },
            { kind: "callout", tone: "tip", title: "Always patch test", text: "Before using a new oil or blend, apply a small diluted amount to your inner forearm and wait 24 hours to check for a reaction." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "A typical dilution for general adult topical use is…", options: [
              { id: "a", text: "1–3% in a carrier oil", correct: true, explanation: "Correct — roughly 6–18 drops per ounce." },
              { id: "b", text: "100% (undiluted)", correct: false, explanation: "Never — neat application risks irritation/sensitization." },
              { id: "c", text: "50%", correct: false, explanation: "Far too strong for skin." },
            ] },
            { id: "q2", type: "mcq", prompt: "For children and sensitive skin, you should use…", options: [
              { id: "a", text: "A lower dilution (≤1%)", correct: true, explanation: "Yes — go gentler, and check oils are age-appropriate." },
              { id: "b", text: "A higher dilution than adults", correct: false, explanation: "The opposite — lower." },
              { id: "c", text: "The same as adults always", correct: false, explanation: "Children need extra caution." },
            ] },
            { id: "q3", type: "true-false", prompt: "You should patch test a new oil before broader use.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — apply diluted to the forearm and wait 24h." },
              { id: "f", text: "False", correct: false, explanation: "Patch testing is an important safety step." },
            ] },
          ],
        },
        {
          id: "l3-methods",
          title: "Methods: diffusion vs topical",
          objective: "Compare diffusion and topical use, and explain why ingestion is discouraged.",
          estMinutes: 4,
          blocks: [
            { kind: "table", headers: ["Method", "How to do it safely"], rows: [
              ["Diffusion (inhalation)", "Use a diffuser in a ventilated room, in intervals (e.g. 30–60 min on/off), not continuously"],
              ["Topical (on skin)", "Always diluted in a carrier; patch test; avoid eyes and mucous membranes"],
              ["Ingestion (swallowing)", "Discouraged — only under qualified professional guidance"],
            ] },
            { kind: "callout", tone: "safety", title: "Don't ingest casually", text: "Swallowing essential oils can irritate or damage the mouth, throat, and gut, and even small amounts of some oils are toxic. Never drink them or add them to water without expert supervision, and keep all oils away from children and pets." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "When diffusing essential oils, you should…", options: [
              { id: "a", text: "Use a ventilated room and intervals, not continuous diffusion", correct: true, explanation: "Yes — give the air a break and ventilate." },
              { id: "b", text: "Run the diffuser nonstop in a sealed room", correct: false, explanation: "That over-concentrates the air and can irritate." },
              { id: "c", text: "Point it directly at a baby or pet", correct: false, explanation: "Never — they're far more sensitive." },
            ] },
            { id: "q2", type: "mcq", prompt: "Ingesting essential oils is…", options: [
              { id: "a", text: "Discouraged except under qualified professional guidance", correct: true, explanation: "Correct — it carries real risk of harm." },
              { id: "b", text: "Always safe in water", correct: false, explanation: "No — oils don't mix with water and can harm the gut." },
              { id: "c", text: "Recommended daily", correct: false, explanation: "Definitely not." },
            ] },
            { id: "q3", type: "true-false", prompt: "Topical oils should be kept away from the eyes and mucous membranes.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — they can burn sensitive tissue." },
              { id: "f", text: "False", correct: false, explanation: "Keep them well away from eyes and mucous membranes." },
            ] },
          ],
        },
      ],
    },
    {
      id: "m2",
      title: "Common Oils",
      lessons: [
        {
          id: "l4-lavender-peppermint",
          title: "Lavender & peppermint",
          objective: "Summarize the evidence and cautions for lavender and peppermint.",
          estMinutes: 4,
          blocks: [
            { kind: "table", headers: ["Oil", "Used for", "Evidence"], rows: [
              ["Lavender", "Relaxation, sleep, anxiety", "Modest evidence (inhaled and a standardized oral form) for anxiety/sleep"],
              ["Peppermint", "Alertness, tension headache, nausea", "Some evidence for tension headache and alertness"],
            ] },
            { kind: "callout", tone: "safety", title: "Peppermint caution", text: "Keep peppermint (and other strong oils) away from the faces of infants and young children — the menthol can affect their breathing. And peppermint oil is toxic to cats (more on pets later)." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Lavender oil has modest evidence for…", options: [
              { id: "a", text: "Anxiety and sleep", correct: true, explanation: "Correct — its best-supported uses." },
              { id: "b", text: "Curing infections", correct: false, explanation: "Not its evidence base." },
              { id: "c", text: "Healing broken bones", correct: false, explanation: "No evidence for that." },
            ] },
            { id: "q2", type: "mcq", prompt: "Peppermint oil should be kept away from…", options: [
              { id: "a", text: "The faces of infants and young children", correct: true, explanation: "Yes — menthol can affect their breathing." },
              { id: "b", text: "All adults", correct: false, explanation: "Adults can use it diluted and sensibly." },
              { id: "c", text: "Diffusers entirely", correct: false, explanation: "It can be diffused sensibly (just not toward babies/pets)." },
            ] },
            { id: "q3", type: "true-false", prompt: "Aromatherapy with lavender is a proven cure for medical conditions.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — the evidence is modest and symptom-focused, not curative." },
              { id: "f", text: "False", correct: true, explanation: "Correct — it can help relaxation, not cure disease." },
            ] },
          ],
        },
        {
          id: "l5-tea-tree-citrus",
          title: "Tea tree, eucalyptus & citrus",
          objective: "Recall key uses and cautions for tea tree, eucalyptus, and citrus oils.",
          estMinutes: 4,
          blocks: [
            { kind: "sort", prompt: "Sort oils by their effect", instructions: "Tap an oil, then tap its common use", groups: [
              { name: "Calming", accent: "#8e6bb5", items: ["Lavender", "Chamomile", "Bergamot"] },
              { name: "Energizing", accent: "#c9881f", items: ["Peppermint", "Eucalyptus"] },
              { name: "Cleansing", accent: "#6a9a4a", items: ["Tea tree", "Lemon"] },
            ] },
            { kind: "table", headers: ["Oil", "Used for", "Key caution"], rows: [
              ["Tea tree", "Topical antimicrobial (acne, skin)", "Never ingest — it's toxic if swallowed; toxic to pets"],
              ["Eucalyptus", "Congestion, fresh scent", "Strong; keep from young children's faces; toxic to pets"],
              ["Citrus (lemon, bergamot, lime)", "Uplifting mood, fresh scent", "Cold-pressed citrus is phototoxic in sun (next lesson)"],
            ] },
            { kind: "callout", tone: "evidence", title: "What aromatherapy can do", text: "At best, these oils offer modest, mostly short-term effects — fresher air, a mood lift, mild symptom relief. They are not treatments for disease. Tea tree has some topical antimicrobial evidence but must never be swallowed." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Tea tree oil…", options: [
              { id: "a", text: "Has topical antimicrobial uses but must never be ingested", correct: true, explanation: "Correct — useful on skin, toxic if swallowed." },
              { id: "b", text: "Is safe to drink daily", correct: false, explanation: "No — it's toxic if ingested." },
              { id: "c", text: "Cures internal infections when eaten", correct: false, explanation: "Never ingest it." },
            ] },
            { id: "q2", type: "mcq", prompt: "Aromatherapy's realistic benefits are…", options: [
              { id: "a", text: "Modest, mostly short-term (mood, freshness, mild relief)", correct: true, explanation: "Yes — helpful but not curative." },
              { id: "b", text: "Curing serious diseases", correct: false, explanation: "It can't do that." },
              { id: "c", text: "Replacing medication", correct: false, explanation: "Never a substitute for medical care." },
            ] },
            { id: "q3", type: "true-false", prompt: "Cold-pressed citrus oils need special care around sun exposure.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — they're phototoxic (covered next)." },
              { id: "f", text: "False", correct: false, explanation: "They are phototoxic and need sun caution." },
            ] },
          ],
        },
      ],
    },
    {
      id: "m3",
      title: "Safety First",
      lessons: [
        {
          id: "l6-phototoxicity",
          title: "Phototoxicity & the sun",
          objective: "Explain phototoxicity and which citrus oils require sun caution.",
          estMinutes: 5,
          blocks: [
            { kind: "callout", tone: "safety", title: "What phototoxicity is", text: "Some cold-pressed citrus oils contain compounds (furanocoumarins) that react with UV light, causing burns, blistering, or dark patches on skin exposed to sun or tanning beds after application." },
            { kind: "table", headers: ["Oil (cold-pressed)", "Max skin dilution before sun", "Then avoid sun for"], rows: [
              ["Bergamot", "~0.4%", "12–18 hours"],
              ["Lime (cold-pressed)", "~0.7%", "12–18 hours"],
              ["Lemon (cold-pressed)", "~2%", "12–18 hours"],
              ["Grapefruit", "~4%", "12–18 hours"],
            ] },
            { kind: "callout", tone: "tip", title: "The easy outs", text: "Steam-distilled citrus oils are essentially non-phototoxic, and oils used only in a diffuser (not on skin) aren't a phototoxic risk. If you apply a phototoxic oil topically, keep that skin out of the sun." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Phototoxicity from citrus oils causes…", options: [
              { id: "a", text: "Skin burns or dark patches when exposed to UV after application", correct: true, explanation: "Correct — a reaction with sunlight." },
              { id: "b", text: "Improved tanning safely", correct: false, explanation: "No — it causes damage, not safe tanning." },
              { id: "c", text: "Nothing at all", correct: false, explanation: "It's a real skin hazard." },
            ] },
            { id: "q2", type: "mcq", prompt: "Which is essentially NON-phototoxic?", options: [
              { id: "a", text: "Steam-distilled citrus, or any oil used only in a diffuser", correct: true, explanation: "Right — distillation removes the reactive compounds; diffusion isn't on skin." },
              { id: "b", text: "Cold-pressed bergamot on skin", correct: false, explanation: "That's one of the most phototoxic." },
              { id: "c", text: "Cold-pressed lime on skin", correct: false, explanation: "Also phototoxic." },
            ] },
            { id: "q3", type: "true-false", prompt: "After applying a phototoxic citrus oil to skin, you should keep that skin out of the sun for several hours.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — roughly 12–18 hours." },
              { id: "f", text: "False", correct: false, explanation: "Sun exposure is exactly the risk to avoid." },
            ] },
          ],
        },
        {
          id: "l7-sensitization",
          title: "Skin sensitization & patch testing",
          objective: "Explain sensitization and how to reduce the risk.",
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "Sensitization is when repeated exposure trains your immune system to react to an oil — so a substance you once tolerated suddenly triggers rashes or allergy-like responses, sometimes permanently." },
            { kind: "callout", tone: "safety", title: "Lower the risk", text: "Always dilute, always patch test new oils, don't use the same oil at high strength every day, and discard oxidized (old, off-smelling) oils — oxidized citrus and pine oils are especially prone to sensitizing skin." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Sensitization is…", options: [
              { id: "a", text: "When repeated exposure makes your body react to an oil it once tolerated", correct: true, explanation: "Correct — and it can be long-lasting." },
              { id: "b", text: "A way oils become stronger over time", correct: false, explanation: "No — it's an immune reaction in you, not the oil." },
              { id: "c", text: "Harmless and temporary always", correct: false, explanation: "It can be persistent." },
            ] },
            { id: "q2", type: "mcq", prompt: "Which reduces sensitization risk?", options: [
              { id: "a", text: "Diluting, patch testing, rotating oils, and discarding oxidized oils", correct: true, explanation: "Yes — all good habits." },
              { id: "b", text: "Using oils neat and daily at high strength", correct: false, explanation: "That increases the risk." },
              { id: "c", text: "Keeping old, oxidized oils for years", correct: false, explanation: "Oxidized oils sensitize more." },
            ] },
            { id: "q3", type: "true-false", prompt: "Oxidized (old, off-smelling) citrus and pine oils are more likely to sensitize skin.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — discard them." },
              { id: "f", text: "False", correct: false, explanation: "They are more sensitizing — discard them." },
            ] },
          ],
        },
        {
          id: "l8-pets",
          title: "Oils toxic to cats & dogs",
          objective: "Recognize which oils endanger pets and how to keep them safe.",
          estMinutes: 5,
          blocks: [
            { kind: "callout", tone: "safety", title: "Cats are especially vulnerable", text: "Cats lack key liver enzymes to process many essential-oil compounds, so oils can build up to toxic levels. Dogs are somewhat more tolerant but still at risk. Diffusing in a room a pet can't leave, or getting oil on their fur or paws, can cause harm." },
            { kind: "table", headers: ["Risky for pets", "Includes"], rows: [
              ["Especially toxic", "Tea tree (melaleuca), wintergreen, pennyroyal, pine, citrus / d-limonene"],
              ["Also risky", "Peppermint, eucalyptus, clove, cinnamon, ylang-ylang"],
            ] },
            { kind: "callout", tone: "tip", title: "Keep pets safe", text: "Never apply essential oils to pets, don't let them lick or walk through oil, diffuse only in well-ventilated spaces the pet can freely leave, and store oils out of reach. Signs of poisoning — drooling, vomiting, tremors, wobbliness, difficulty breathing, lethargy — mean call a vet or pet poison line immediately." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Why are cats especially vulnerable to essential oils?", options: [
              { id: "a", text: "They lack liver enzymes to process many oil compounds", correct: true, explanation: "Correct — so oils can reach toxic levels." },
              { id: "b", text: "They are allergic to all smells", correct: false, explanation: "It's a metabolism issue, not a smell allergy." },
              { id: "c", text: "They aren't — only dogs are at risk", correct: false, explanation: "Cats are actually more vulnerable than dogs." },
            ] },
            { id: "q2", type: "mcq", prompt: "Which oil is notably toxic to pets?", options: [
              { id: "a", text: "Tea tree (melaleuca)", correct: true, explanation: "Yes — one of the most dangerous for cats and dogs." },
              { id: "b", text: "None — all oils are pet-safe", correct: false, explanation: "Many oils are dangerous to pets." },
              { id: "c", text: "Only synthetic oils", correct: false, explanation: "Natural oils like tea tree are the concern." },
            ] },
            { id: "q3", type: "mcq", prompt: "To keep pets safe you should…", options: [
              { id: "a", text: "Never apply oils to pets and diffuse only where they can leave", correct: true, explanation: "Correct — ventilation and an escape route, never on the animal." },
              { id: "b", text: "Apply diluted oil to their fur", correct: false, explanation: "Never apply oils to pets." },
              { id: "c", text: "Diffuse heavily in a closed room with them", correct: false, explanation: "That's dangerous for pets." },
            ] },
          ],
        },
        {
          id: "l9-special-cautions",
          title: "Pregnancy, children & special cautions",
          objective: "Apply extra caution for vulnerable groups and frame oils honestly.",
          estMinutes: 4,
          blocks: [
            { kind: "callout", tone: "safety", title: "Extra-careful groups", text: "Pregnancy and breastfeeding, infants and young children, people with asthma or epilepsy, and anyone on medication should be extra cautious — some oils are contraindicated for these groups. When in doubt, check with a doctor or a qualified aromatherapist before use." },
            { kind: "callout", tone: "tip", title: "The honest bottom line", text: "Used sensibly — diluted, ventilated, away from eyes, pets, and vulnerable people — essential oils can be a pleasant support for mood and relaxation. They are not a treatment for disease and never a substitute for medical care." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Who should be extra cautious with essential oils?", options: [
              { id: "a", text: "Pregnant/breastfeeding people, young children, and those with asthma or epilepsy", correct: true, explanation: "Correct — some oils are contraindicated for these groups." },
              { id: "b", text: "Nobody — oils are universally safe", correct: false, explanation: "Several groups need caution." },
              { id: "c", text: "Only professional aromatherapists", correct: false, explanation: "It's the vulnerable groups who need extra care." },
            ] },
            { id: "q2", type: "mcq", prompt: "The honest role of essential oils is…", options: [
              { id: "a", text: "A pleasant support for mood and relaxation, used safely", correct: true, explanation: "Yes — supportive, not curative." },
              { id: "b", text: "A replacement for medical treatment", correct: false, explanation: "Never a substitute for medical care." },
              { id: "c", text: "A cure for disease", correct: false, explanation: "They don't cure disease." },
            ] },
            { id: "q3", type: "true-false", prompt: "When unsure about an oil's safety for a vulnerable group, you should check with a professional first.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — when in doubt, ask." },
              { id: "f", text: "False", correct: false, explanation: "Checking first is the safe choice." },
            ] },
          ],
        },
      ],
    },
  ],

  finalTest: [
    { id: "f1", type: "mcq", prompt: "An essential oil is…", options: [
      { id: "a", text: "A concentrated, volatile plant extract", correct: true },
      { id: "b", text: "A dietary essential fatty acid", correct: false },
      { id: "c", text: "A diluted tea", correct: false },
      { id: "d", text: "A synthetic fragrance only", correct: false },
    ] },
    { id: "f2", type: "mcq", prompt: "Most essential oils are made by…", options: [
      { id: "a", text: "Steam distillation (citrus is cold-pressed)", correct: true },
      { id: "b", text: "Freezing", correct: false },
      { id: "c", text: "Fermentation", correct: false },
      { id: "d", text: "Boiling in milk", correct: false },
    ] },
    { id: "f3", type: "mcq", prompt: "A typical adult topical dilution is…", options: [
      { id: "a", text: "1–3% in a carrier oil", correct: true },
      { id: "b", text: "100% neat", correct: false },
      { id: "c", text: "50%", correct: false },
      { id: "d", text: "It doesn't matter", correct: false },
    ] },
    { id: "f4", type: "mcq", prompt: "For children and sensitive skin, dilution should be…", options: [
      { id: "a", text: "Lower (≤1%)", correct: true },
      { id: "b", text: "Higher than adults", correct: false },
      { id: "c", text: "Always neat", correct: false },
      { id: "d", text: "Identical to adults", correct: false },
    ] },
    { id: "f5", type: "mcq", prompt: "Ingesting essential oils is…", options: [
      { id: "a", text: "Discouraged except under professional guidance", correct: true },
      { id: "b", text: "Always safe", correct: false },
      { id: "c", text: "Recommended daily", correct: false },
      { id: "d", text: "Required for benefit", correct: false },
    ] },
    { id: "f6", type: "mcq", prompt: "Lavender oil is best supported for…", options: [
      { id: "a", text: "Anxiety and sleep", correct: true },
      { id: "b", text: "Curing infection", correct: false },
      { id: "c", text: "Bone healing", correct: false },
      { id: "d", text: "Weight loss", correct: false },
    ] },
    { id: "f7", type: "mcq", prompt: "Tea tree oil…", options: [
      { id: "a", text: "Is topical-only and must never be ingested", correct: true },
      { id: "b", text: "Is safe to drink", correct: false },
      { id: "c", text: "Cures colds when eaten", correct: false },
      { id: "d", text: "Has no cautions", correct: false },
    ] },
    { id: "f8", type: "mcq", prompt: "Phototoxic citrus oils cause…", options: [
      { id: "a", text: "Skin burns/dark patches with UV after application", correct: true },
      { id: "b", text: "Safe, even tanning", correct: false },
      { id: "c", text: "Nothing", correct: false },
      { id: "d", text: "Improved eyesight", correct: false },
    ] },
    { id: "f9", type: "mcq", prompt: "Which is essentially non-phototoxic?", options: [
      { id: "a", text: "Steam-distilled citrus, or oils used only in a diffuser", correct: true },
      { id: "b", text: "Cold-pressed bergamot on skin", correct: false },
      { id: "c", text: "Cold-pressed lime on skin", correct: false },
      { id: "d", text: "Cold-pressed lemon on skin", correct: false },
    ] },
    { id: "f10", type: "mcq", prompt: "Sensitization is…", options: [
      { id: "a", text: "Your body learning to react to an oil it once tolerated", correct: true },
      { id: "b", text: "Oils getting stronger with age", correct: false },
      { id: "c", text: "A harmless smell change", correct: false },
      { id: "d", text: "A type of dilution", correct: false },
    ] },
    { id: "f11", type: "mcq", prompt: "Why are cats especially vulnerable to essential oils?", options: [
      { id: "a", text: "They lack liver enzymes to process many oil compounds", correct: true },
      { id: "b", text: "They dislike all scents", correct: false },
      { id: "c", text: "They aren't vulnerable", correct: false },
      { id: "d", text: "They have thick fur", correct: false },
    ] },
    { id: "f12", type: "mcq", prompt: "Which oil is notably toxic to pets?", options: [
      { id: "a", text: "Tea tree (melaleuca)", correct: true },
      { id: "b", text: "None are toxic", correct: false },
      { id: "c", text: "Only synthetic oils", correct: false },
      { id: "d", text: "Carrier oils", correct: false },
    ] },
    { id: "f13", type: "mcq", prompt: "To keep pets safe, you should…", options: [
      { id: "a", text: "Never apply oils to pets; diffuse only where they can leave", correct: true },
      { id: "b", text: "Apply oil to their fur", correct: false },
      { id: "c", text: "Diffuse heavily in a closed room with them", correct: false },
      { id: "d", text: "Let them lick the bottle", correct: false },
    ] },
    { id: "f14", type: "mcq", prompt: "Aromatherapy's realistic benefit is…", options: [
      { id: "a", text: "Modest support for mood and relaxation", correct: true },
      { id: "b", text: "Curing serious disease", correct: false },
      { id: "c", text: "Replacing medication", correct: false },
      { id: "d", text: "Diagnosing illness", correct: false },
    ] },
    { id: "f15", type: "true-false", prompt: "Essential oils should be patch-tested and diluted before skin use.", options: [
      { id: "t", text: "True", correct: true },
      { id: "f", text: "False", correct: false },
    ] },
    { id: "f16", type: "true-false", prompt: "Essential oils are a substitute for medical care.", options: [
      { id: "t", text: "True", correct: false },
      { id: "f", text: "False", correct: true },
    ] },
  ],
};
