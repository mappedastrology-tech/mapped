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
    "Understand what essential oils are, what aromatherapy can and can't do, and how to dilute and use them safely around people and pets — with the math, the methods, and the honest evidence.",
  estMinutes: 70,
  status: "published",
  passThreshold: 0.8,
  finalTestSize: 12,
  safetyNote:
    "Essential oils must be diluted, some are phototoxic (citrus + sun), and many are toxic to cats and dogs. Never ingest without expert guidance. Not a substitute for medical care.",

  outline: [
    { module: "Basics", lessons: ["What essential oils are", "Carriers & dilution", "Dilution math made simple", "Methods: diffusion, topical & inhalation"] },
    { module: "Common Oils", lessons: ["Lavender & peppermint", "Tea tree, eucalyptus & citrus", "Quality, adulteration & the 'therapeutic grade' myth"] },
    { module: "Safety First", lessons: ["Phototoxicity & the sun", "Skin sensitization & patch testing", "\"Hot\" oils & where never to apply", "Oils toxic to cats & dogs", "Pregnancy, children & special cautions"] },
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
          estMinutes: 6,
          blocks: [
            { kind: "text", text: "An essential oil is a highly concentrated, volatile extract of a plant's aromatic compounds — the 'essence' of its scent. 'Essential' refers to that essence, not to the oil being necessary or nutritionally essential. Unlike a fixed (fatty) oil such as olive or almond, an essential oil evaporates and leaves no greasy stain; it is really a mixture of dozens to hundreds of small aromatic molecules." },
            { kind: "text", text: "Most are made by steam distillation; citrus oils are usually cold-pressed from the peel. Because they're concentrated, a tiny amount represents a large quantity of plant material — roughly 1 to several kilograms of rose petals for a single drop of rose oil. That concentration is exactly why oils must be respected and diluted." },
            { kind: "callout", tone: "history", title: "An old craft, a modern word", text: "Distillation of aromatic plants is ancient — refined by Persian scholars like Ibn Sina (Avicenna) around 1000 CE. But the word 'aromatherapy' is barely a century old: French chemist René-Maurice Gattefossé coined it in the 1920s after studying lavender oil on burns." },
            { kind: "callout", tone: "evidence", title: "Chemistry, not magic", text: "An oil's effects come from its chemistry: terpenes, esters, aldehydes, phenols and the like. The same molecules that make an oil smell pleasant can also irritate skin, react with sunlight, or harm pets — which is why 'natural' tells you nothing about 'safe.'" },
            { kind: "keyfacts", items: [
              "Essential oils are concentrated, volatile aromatic plant extracts — not fatty oils.",
              "Most are steam-distilled; citrus oils are cold-pressed from the peel.",
              "A single oil is a complex mix of many active chemical compounds.",
              "Concentrated = potent — they are not 'gentle because natural.'",
            ] },
            { kind: "table", headers: ["Term", "What it means"], rows: [
              ["Volatile", "Evaporates readily — gives the scent and means it won't leave a fatty stain"],
              ["Carrier (fixed) oil", "A non-volatile fatty oil used to dilute, e.g. jojoba, almond"],
              ["Distillation", "Steam separates the aromatic compounds from plant material"],
              ["Cold-pressing", "Mechanical squeezing of citrus peel — keeps reactive compounds"],
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "An essential oil is…", options: [
              { id: "a", text: "A concentrated, volatile extract of a plant's aromatic compounds", correct: true, explanation: "Correct — the plant's aromatic 'essence,' highly concentrated." },
              { id: "b", text: "A nutritionally essential fatty acid", correct: false, explanation: "No — 'essential' here means essence, not dietary necessity." },
              { id: "c", text: "A diluted herbal tea", correct: false, explanation: "It's the opposite — highly concentrated." },
              { id: "d", text: "A single pure chemical compound", correct: false, explanation: "No — each oil is a mix of many compounds." },
            ] },
            { id: "q2", type: "mcq", prompt: "Most essential oils are produced by…", options: [
              { id: "a", text: "Steam distillation (citrus oils are cold-pressed)", correct: true, explanation: "Yes — distillation, with citrus cold-pressed from peel." },
              { id: "b", text: "Freezing the whole plant", correct: false, explanation: "That's not how oils are extracted." },
              { id: "c", text: "Adding chemicals to water", correct: false, explanation: "They're physically extracted from plants." },
            ] },
            { id: "q4", type: "mcq", prompt: "How does an essential oil differ from a carrier oil like almond?", options: [
              { id: "a", text: "The essential oil is volatile and evaporates; the carrier is a fatty, non-volatile oil", correct: true, explanation: "Correct — essential oils evaporate and leave no greasy stain." },
              { id: "b", text: "They are the same thing", correct: false, explanation: "No — carriers are fatty oils used to dilute." },
              { id: "c", text: "Carrier oils are more concentrated", correct: false, explanation: "It's the reverse — essential oils are the concentrated ones." },
            ] },
            { id: "q3", type: "true-false", prompt: "Because essential oils are natural, they are automatically gentle and safe.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — they're concentrated and potent; natural ≠ safe." },
              { id: "f", text: "False", correct: true, explanation: "Correct — concentration demands respect and dilution." },
            ] },
            { id: "q5", type: "recall", prompt: "What single word describes an oil that evaporates readily and gives off scent?", options: [], answer: "volatile", accept: ["volatile", "volatility"], explanation: "Volatile compounds evaporate at room temperature — the source of an oil's aroma." },
          ],
        },
        {
          id: "l2-dilution",
          title: "Carriers & dilution",
          objective: "Apply safe dilution ratios for topical use and choose an appropriate carrier oil.",
          estMinutes: 6,
          blocks: [
            { kind: "callout", tone: "safety", title: "Dilute before skin contact", text: "Almost all essential oils should be diluted in a carrier oil (like jojoba, sweet almond, or fractionated coconut) before they touch skin. Applying them 'neat' (undiluted) risks irritation, burns, and sensitization — and the damage can be permanent." },
            { kind: "text", text: "A carrier oil is a non-volatile fatty oil that 'carries' a few drops of essential oil across a larger area of skin, slowing absorption and reducing irritation. Water is not a carrier — oil and water don't mix, so a drop of essential oil floating on water stays full-strength where it touches you." },
            { kind: "table", headers: ["Carrier oil", "Why people choose it"], rows: [
              ["Jojoba", "Technically a liquid wax; long shelf life, resists going rancid"],
              ["Fractionated coconut", "Light, non-greasy, very stable and long-lasting"],
              ["Sweet almond", "Inexpensive, mild; avoid with nut allergies"],
              ["Grapeseed", "Light and cheap, but oxidizes faster"],
            ] },
            { kind: "table", headers: ["Who", "Typical dilution"], rows: [
              ["Adults, general use", "1–3% (≈ 6–18 drops per ounce of carrier)"],
              ["Adults, body massage / larger area", "Often 1% to keep total exposure low"],
              ["Children, elderly, sensitive skin, face", "0.5–1% or lower"],
              ["Babies / infants under 2", "Avoid most oils — check a professional first"],
            ] },
            { kind: "callout", tone: "tip", title: "Always patch test", text: "Before using a new oil or blend, apply a small diluted amount to your inner forearm and wait 24 hours to check for a reaction. A reaction now is far better than one over a large area later." },
            { kind: "callout", tone: "evidence", title: "More is not better", text: "A higher concentration doesn't give a stronger 'benefit' — it mostly raises the odds of irritation and sensitization. The lowest effective dilution is the safest one." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "A typical dilution for general adult topical use is…", options: [
              { id: "a", text: "1–3% in a carrier oil", correct: true, explanation: "Correct — roughly 6–18 drops per ounce." },
              { id: "b", text: "100% (undiluted)", correct: false, explanation: "Never — neat application risks irritation/sensitization." },
              { id: "c", text: "50%", correct: false, explanation: "Far too strong for skin." },
              { id: "d", text: "Whatever smells strongest", correct: false, explanation: "Strength of scent is not a safety guide." },
            ] },
            { id: "q2", type: "mcq", prompt: "For children and sensitive skin, you should use…", options: [
              { id: "a", text: "A lower dilution (≤1%)", correct: true, explanation: "Yes — go gentler, and check oils are age-appropriate." },
              { id: "b", text: "A higher dilution than adults", correct: false, explanation: "The opposite — lower." },
              { id: "c", text: "The same as adults always", correct: false, explanation: "Children need extra caution." },
            ] },
            { id: "q4", type: "mcq", prompt: "Why is water NOT a substitute for a carrier oil?", options: [
              { id: "a", text: "Oil and water don't mix, so the drop stays full-strength where it touches skin", correct: true, explanation: "Correct — only a fatty carrier actually disperses the oil." },
              { id: "b", text: "Water makes oils stronger", correct: false, explanation: "It doesn't strengthen them; it just fails to dilute them." },
              { id: "c", text: "Water is a perfectly good carrier", correct: false, explanation: "It isn't — oils float on water undispersed." },
            ] },
            { id: "q3", type: "true-false", prompt: "You should patch test a new oil before broader use.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — apply diluted to the forearm and wait 24h." },
              { id: "f", text: "False", correct: false, explanation: "Patch testing is an important safety step." },
            ] },
            { id: "q5", type: "recall", prompt: "Fill in the blank: essential oils should always be ______ in a carrier oil before skin contact.", options: [], answer: "diluted", accept: ["diluted", "dilute"], explanation: "Dilution in a carrier oil is the core rule of safe topical use." },
          ],
        },
        {
          id: "l3-dilution-math",
          title: "Dilution math made simple",
          objective: "Calculate how many drops of essential oil to add for a target dilution percentage.",
          estMinutes: 6,
          blocks: [
            { kind: "text", text: "Dilution percentage is just the share of essential oil in the finished blend. The handy rule of thumb: there are about 20 drops of essential oil in 1 mL. So a 1% dilution is roughly 1 drop per 5 mL of carrier; double the drops to get 2%, and so on." },
            { kind: "callout", tone: "tip", title: "The drop rule", text: "For a 1% dilution, use about 1 drop of essential oil per 5 mL of carrier oil. 2% ≈ 2 drops per 5 mL. 3% ≈ 3 drops per 5 mL. (1 teaspoon ≈ 5 mL; 1 fluid ounce ≈ 30 mL.)" },
            { kind: "table", headers: ["Carrier amount", "1%", "2%", "3%"], rows: [
              ["5 mL (1 tsp)", "1 drop", "2 drops", "3 drops"],
              ["15 mL (1 tbsp)", "3 drops", "6 drops", "9 drops"],
              ["30 mL (1 oz)", "6 drops", "12 drops", "18 drops"],
            ] },
            { kind: "text", text: "Worked example: you want a 2% face serum in 10 mL of jojoba. 10 mL ÷ 5 = 2, and 2 × 2 drops = 4 drops total. For sensitive facial skin many people would drop to 1% (just 2 drops in 10 mL) instead." },
            { kind: "callout", tone: "safety", title: "Drops aren't exact — round down", text: "Drop size varies with the oil's viscosity and the orifice reducer, so treat drop counts as approximate. When in doubt, round down: under-diluting a little is far safer than over-diluting. Phototoxic and 'hot' oils have their own hard limits, covered later." },
            { kind: "keyfacts", items: [
              "~20 drops of essential oil ≈ 1 mL.",
              "1% ≈ 1 drop per 5 mL of carrier.",
              "Multiply drops by the percentage you want.",
              "Drop size varies — round down when unsure.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Roughly how many drops of essential oil are in 1 mL?", options: [
              { id: "a", text: "About 20", correct: true, explanation: "Correct — the standard rule of thumb is ~20 drops per mL." },
              { id: "b", text: "About 2", correct: false, explanation: "Far too few." },
              { id: "c", text: "About 200", correct: false, explanation: "Far too many." },
            ] },
            { id: "q2", type: "mcq", prompt: "For a 2% dilution in 30 mL (1 oz) of carrier, you'd add about…", options: [
              { id: "a", text: "12 drops", correct: true, explanation: "Correct — 6 drops per ounce is 1%, so 2% is 12." },
              { id: "b", text: "2 drops", correct: false, explanation: "That would be far below 1%." },
              { id: "c", text: "30 drops", correct: false, explanation: "That's well above 2%." },
              { id: "d", text: "60 drops", correct: false, explanation: "That would be roughly 10% — far too strong." },
            ] },
            { id: "q3", type: "mcq", prompt: "If a drop count comes out between two numbers, the safer choice is to…", options: [
              { id: "a", text: "Round down", correct: true, explanation: "Correct — under-diluting slightly is safer than over-diluting." },
              { id: "b", text: "Round up", correct: false, explanation: "That pushes concentration higher — riskier." },
              { id: "c", text: "Double it for good measure", correct: false, explanation: "Never — more is not better." },
            ] },
            { id: "q4", type: "true-false", prompt: "A higher dilution percentage simply gives a stronger benefit with no added risk.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — it mainly raises irritation and sensitization risk." },
              { id: "f", text: "False", correct: true, explanation: "Correct — the lowest effective dilution is the safest." },
            ] },
          ],
        },
        {
          id: "l4-methods",
          title: "Methods: diffusion, topical & inhalation",
          objective: "Compare diffusion, topical, and direct inhalation, and explain why ingestion is discouraged.",
          estMinutes: 5,
          blocks: [
            { kind: "table", headers: ["Method", "How to do it safely"], rows: [
              ["Diffusion (room inhalation)", "Use a diffuser in a ventilated room, in intervals (e.g. 30–60 min on/off), not continuously"],
              ["Direct inhalation", "A drop on a tissue or a personal inhaler held near the nose — keep it off skin and out of eyes"],
              ["Topical (on skin)", "Always diluted in a carrier; patch test; avoid eyes and mucous membranes"],
              ["Ingestion (swallowing)", "Discouraged — only under qualified professional guidance"],
            ] },
            { kind: "callout", tone: "evidence", title: "Match the method to the goal", text: "Inhalation (diffusion or a tissue) is the gentlest route and best for mood and a fresh-smelling room. Topical use suits localized aims like a diluted massage blend. There is no everyday reason to swallow essential oils." },
            { kind: "callout", tone: "safety", title: "Diffuser cautions", text: "Diffuse intermittently in a room people and pets can leave; continuous diffusion in a sealed space can trigger headaches, nausea, or breathing irritation — especially for children, pets, and those with asthma. Clean water diffusers regularly to avoid mold." },
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
            { id: "q4", type: "mcq", prompt: "The gentlest route for a simple mood lift or fresh room is…", options: [
              { id: "a", text: "Inhalation (a diffuser or a drop on a tissue)", correct: true, explanation: "Correct — inhalation is the lowest-exposure method." },
              { id: "b", text: "Drinking a few drops in water", correct: false, explanation: "Ingestion is discouraged and risky." },
              { id: "c", text: "Rubbing the neat oil on skin", correct: false, explanation: "Neat topical use risks irritation and sensitization." },
            ] },
            { id: "q3", type: "true-false", prompt: "Topical oils should be kept away from the eyes and mucous membranes.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — they can burn sensitive tissue." },
              { id: "f", text: "False", correct: false, explanation: "Keep them well away from eyes and mucous membranes." },
            ] },
            { id: "q5", type: "recall", prompt: "Essential oils should never be taken how (the route to avoid)?", options: [], answer: "ingested", accept: ["ingested", "ingestion", "internally", "swallowed", "orally", "by mouth", "eaten", "drunk"], explanation: "Never ingest essential oils without qualified professional guidance — swallowing them can damage the mouth, throat, and gut." },
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
          estMinutes: 5,
          blocks: [
            { kind: "table", headers: ["Oil", "Used for", "Evidence"], rows: [
              ["Lavender", "Relaxation, sleep, anxiety", "Modest evidence (inhaled and a standardized oral form) for anxiety/sleep"],
              ["Peppermint", "Alertness, tension headache, nausea", "Some evidence for tension headache and alertness; peppermint capsules (not the oil neat) studied for IBS"],
            ] },
            { kind: "callout", tone: "evidence", title: "What 'modest evidence' means", text: "Lavender is among the most-studied oils. Inhaled lavender and a standardized oral capsule (Silexan) show small effects on anxiety and sleep quality in some trials. That's genuinely promising for relaxation — but it is symptom support, not a treatment for an anxiety disorder or insomnia diagnosis." },
            { kind: "callout", tone: "history", title: "Gattefossé's burn", text: "The founding aromatherapy legend has chemist René-Maurice Gattefossé plunging a burned hand into lavender oil. The story is often embellished, but it cemented lavender as the field's signature oil — and a reminder that anecdotes are where evidence starts, not where it ends." },
            { kind: "callout", tone: "safety", title: "Peppermint caution", text: "Keep peppermint and other menthol-rich oils away from the faces of infants and young children — menthol and 1,8-cineole can slow or affect their breathing. Peppermint is also toxic to cats and a known skin irritant if used too strong (more on both later)." },
            { kind: "keyfacts", items: [
              "Lavender: best-supported oil for relaxation, sleep, and mild anxiety — supportive, not curative.",
              "Peppermint: studied for tension headache (applied diluted to the temples) and alertness.",
              "Neither is a substitute for medical treatment.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Lavender oil has modest evidence for…", options: [
              { id: "a", text: "Anxiety and sleep", correct: true, explanation: "Correct — its best-supported uses." },
              { id: "b", text: "Curing infections", correct: false, explanation: "Not its evidence base." },
              { id: "c", text: "Healing broken bones", correct: false, explanation: "No evidence for that." },
              { id: "d", text: "Reversing diabetes", correct: false, explanation: "No — it doesn't treat disease." },
            ] },
            { id: "q2", type: "mcq", prompt: "Peppermint oil should be kept away from…", options: [
              { id: "a", text: "The faces of infants and young children", correct: true, explanation: "Yes — menthol can affect their breathing." },
              { id: "b", text: "All adults", correct: false, explanation: "Adults can use it diluted and sensibly." },
              { id: "c", text: "Diffusers entirely", correct: false, explanation: "It can be diffused sensibly (just not toward babies/pets)." },
            ] },
            { id: "q4", type: "mcq", prompt: "Peppermint applied to the temples is sometimes used for…", options: [
              { id: "a", text: "Tension headache (diluted)", correct: true, explanation: "Correct — there's some evidence for tension-type headache." },
              { id: "b", text: "Curing migraines permanently", correct: false, explanation: "No — it's symptom support at best." },
              { id: "c", text: "Replacing pain medication", correct: false, explanation: "Never a substitute for medical care." },
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
          estMinutes: 5,
          blocks: [
            { kind: "sort", prompt: "Sort oils by their effect", instructions: "Tap an oil, then tap its common use", groups: [
              { name: "Calming", accent: "#8e6bb5", items: ["Lavender", "Chamomile", "Bergamot"] },
              { name: "Energizing", accent: "#c9881f", items: ["Peppermint", "Eucalyptus"] },
              { name: "Cleansing", accent: "#6a9a4a", items: ["Tea tree", "Lemon"] },
            ] },
            { kind: "table", headers: ["Oil", "Used for", "Key caution"], rows: [
              ["Tea tree", "Topical antimicrobial (acne, skin)", "Never ingest — toxic if swallowed; highly toxic to pets"],
              ["Eucalyptus", "Congestion, fresh scent", "Strong (1,8-cineole); keep from young children's faces; toxic to pets"],
              ["Citrus (lemon, bergamot, lime)", "Uplifting mood, fresh scent", "Cold-pressed citrus is phototoxic in sun (next lesson)"],
            ] },
            { kind: "callout", tone: "evidence", title: "Tea tree, honestly", text: "Tea tree (melaleuca) has real, if modest, topical antimicrobial evidence — it's been studied for mild acne and minor skin infections, usually diluted. But it must never be swallowed; even small amounts ingested have caused poisoning, especially in children." },
            { kind: "callout", tone: "safety", title: "Eucalyptus and small children", text: "Eucalyptus and rosemary are rich in 1,8-cineole, which can trigger breathing problems in infants and young children if applied near the face or used too strong. Keep them off children's faces and out of their chest rubs unless a product is specifically formulated and age-appropriate." },
            { kind: "callout", tone: "evidence", title: "What aromatherapy can do", text: "At best, these oils offer modest, mostly short-term effects — fresher air, a mood lift, mild symptom relief. They are not treatments for disease and cannot replace antibiotics or other medicine." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Tea tree oil…", options: [
              { id: "a", text: "Has topical antimicrobial uses but must never be ingested", correct: true, explanation: "Correct — useful on skin, toxic if swallowed." },
              { id: "b", text: "Is safe to drink daily", correct: false, explanation: "No — it's toxic if ingested." },
              { id: "c", text: "Cures internal infections when eaten", correct: false, explanation: "Never ingest it." },
              { id: "d", text: "Has no safety cautions at all", correct: false, explanation: "It is toxic if swallowed and dangerous to pets." },
            ] },
            { id: "q2", type: "mcq", prompt: "Aromatherapy's realistic benefits are…", options: [
              { id: "a", text: "Modest, mostly short-term (mood, freshness, mild relief)", correct: true, explanation: "Yes — helpful but not curative." },
              { id: "b", text: "Curing serious diseases", correct: false, explanation: "It can't do that." },
              { id: "c", text: "Replacing medication", correct: false, explanation: "Never a substitute for medical care." },
            ] },
            { id: "q4", type: "mcq", prompt: "Which compound makes eucalyptus risky near young children's faces?", options: [
              { id: "a", text: "1,8-cineole", correct: true, explanation: "Correct — cineole can cause breathing problems in small children." },
              { id: "b", text: "Water", correct: false, explanation: "Water isn't the concern." },
              { id: "c", text: "Vitamin C", correct: false, explanation: "Not present in any meaningful sense here." },
            ] },
            { id: "q3", type: "true-false", prompt: "Cold-pressed citrus oils need special care around sun exposure.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — they're phototoxic (covered next)." },
              { id: "f", text: "False", correct: false, explanation: "They are phototoxic and need sun caution." },
            ] },
            { id: "q5", type: "recall", prompt: "Tea tree oil is useful on skin but must never be done what to it?", options: [], answer: "ingested", accept: ["ingested", "swallowed", "ingestion", "eaten", "drunk", "taken internally", "ingest"], explanation: "Tea tree is topical-only; swallowing it has caused serious poisoning, especially in children." },
          ],
        },
        {
          id: "l7-quality",
          title: "Quality, adulteration & the 'therapeutic grade' myth",
          objective: "Judge essential-oil quality and recognize the 'therapeutic grade' marketing claim.",
          estMinutes: 6,
          blocks: [
            { kind: "callout", tone: "evidence", title: "There is no official 'grade'", text: "Phrases like 'therapeutic grade,' 'CPTG,' or 'medical grade' are marketing terms. No government body or independent standard certifies essential oils as a medical 'grade.' A high price and a confident label do not guarantee purity or safety." },
            { kind: "text", text: "Essential oils are commonly adulterated — stretched with cheaper oils, synthetic aroma chemicals, or vegetable oil — because pure oils are expensive to produce. Adulteration can change an oil's chemistry, making it more irritating or unpredictable, and it can hide what you're actually putting on your skin or breathing." },
            { kind: "list", ordered: false, items: [
              "Look for the Latin botanical name (e.g. Lavandula angustifolia), not just 'lavender.'",
              "Look for the country of origin and ideally the extraction method.",
              "Reputable sellers can provide a batch GC/MS report (a chemical fingerprint of the oil).",
              "Be wary of identical low prices across very different oils — true rose or melissa cannot be cheap.",
              "'100% pure' on the label is unverified marketing on its own.",
            ] },
            { kind: "callout", tone: "history", title: "Why the hype exists", text: "Much essential-oil marketing comes from multi-level-marketing companies whose claims (curing illness, ingesting oils, 'grades') outrun the evidence. Treat dramatic health claims and pressure to ingest as red flags, not selling points." },
            { kind: "callout", tone: "safety", title: "Storage protects quality", text: "Store oils in dark glass, tightly capped, away from heat and light. Oxidized (old, off-smelling) oils — especially citrus and pine — are more likely to irritate and sensitize skin. Most oils keep 1–3 years; citrus oils oxidize faster." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "'Therapeutic grade' on an essential-oil label means…", options: [
              { id: "a", text: "It's a marketing term — no official body certifies oil 'grades'", correct: true, explanation: "Correct — there is no regulated grading standard." },
              { id: "b", text: "A government agency tested and approved it as medicine", correct: false, explanation: "No such certification exists." },
              { id: "c", text: "The oil is guaranteed pure and safe", correct: false, explanation: "The phrase guarantees nothing." },
            ] },
            { id: "q2", type: "mcq", prompt: "A genuine sign of a quality oil is…", options: [
              { id: "a", text: "The Latin botanical name and an available GC/MS batch report", correct: true, explanation: "Correct — botanical name plus a chemical report shows transparency." },
              { id: "b", text: "The phrase '100% pure' alone", correct: false, explanation: "That's unverified marketing." },
              { id: "c", text: "A very low price across all oils", correct: false, explanation: "Suspiciously cheap oils are often adulterated." },
            ] },
            { id: "q3", type: "mcq", prompt: "Adulteration of essential oils can…", options: [
              { id: "a", text: "Change the chemistry and make an oil more irritating or unpredictable", correct: true, explanation: "Correct — fillers and synthetics alter how an oil behaves on skin." },
              { id: "b", text: "Always make oils safer", correct: false, explanation: "It does the opposite — it hides what you're using." },
              { id: "c", text: "Have no effect at all", correct: false, explanation: "It can meaningfully change safety and quality." },
            ] },
            { id: "q4", type: "true-false", prompt: "A high price and a 'medical grade' label prove an oil is pure and safe.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — neither price nor label guarantees purity." },
              { id: "f", text: "False", correct: true, explanation: "Correct — judge by botanical name, origin, and testing instead." },
            ] },
            { id: "q5", type: "true-false", prompt: "Oxidized, off-smelling oils are more likely to irritate and sensitize skin.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — discard old, oxidized oils, especially citrus and pine." },
              { id: "f", text: "False", correct: false, explanation: "Oxidation increases irritation and sensitization risk." },
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
          estMinutes: 6,
          blocks: [
            { kind: "callout", tone: "safety", title: "What phototoxicity is", text: "Some cold-pressed citrus oils contain compounds called furanocoumarins (notably bergapten) that react with UV light. After the oil is on skin, sun or a tanning bed can trigger burns, blistering, or long-lasting dark patches — sometimes hours after application, on skin that felt fine." },
            { kind: "text", text: "The classic culprit is bergamot; its furanocoumarin bergapten is so reactive that bergamot was once a sunscreen ingredient before its risk was understood. This is why the safe topical limits below are far lower than ordinary dilution percentages." },
            { kind: "table", headers: ["Oil (cold-pressed)", "Max skin dilution before sun", "Then avoid sun for"], rows: [
              ["Bergamot", "~0.4%", "12–18 hours"],
              ["Lime (cold-pressed)", "~0.7%", "12–18 hours"],
              ["Lemon (cold-pressed)", "~2%", "12–18 hours"],
              ["Grapefruit", "~4%", "12–18 hours"],
              ["Sweet orange", "Not phototoxic", "—"],
            ] },
            { kind: "callout", tone: "tip", title: "The easy outs", text: "Steam-distilled citrus oils, and bergamot labelled 'FCF' (furanocoumarin-free / bergapten-free), are essentially non-phototoxic. Oils used only in a diffuser — never on skin — aren't a phototoxic risk. If you do apply a phototoxic oil topically, keep that skin covered or out of the sun for 12–18 hours." },
            { kind: "callout", tone: "evidence", title: "Not every citrus is a culprit", text: "Phototoxicity depends on the specific oil and how it was made. Cold-pressed bergamot, lime, lemon, and bitter orange are the main concerns; steam-distilled versions and sweet orange are low-risk. When in doubt, check the bottle for 'expressed/cold-pressed' versus 'steam-distilled.'" },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Phototoxicity from citrus oils causes…", options: [
              { id: "a", text: "Skin burns or dark patches when exposed to UV after application", correct: true, explanation: "Correct — a reaction with sunlight." },
              { id: "b", text: "Improved tanning safely", correct: false, explanation: "No — it causes damage, not safe tanning." },
              { id: "c", text: "Nothing at all", correct: false, explanation: "It's a real skin hazard." },
              { id: "d", text: "Instant sunburn protection", correct: false, explanation: "The opposite — it makes UV damage worse." },
            ] },
            { id: "q2", type: "mcq", prompt: "Which is essentially NON-phototoxic?", options: [
              { id: "a", text: "Steam-distilled citrus, bergamot FCF, or any oil used only in a diffuser", correct: true, explanation: "Right — distillation/FCF removes the reactive compounds; diffusion isn't on skin." },
              { id: "b", text: "Cold-pressed bergamot on skin", correct: false, explanation: "That's one of the most phototoxic." },
              { id: "c", text: "Cold-pressed lime on skin", correct: false, explanation: "Also phototoxic." },
            ] },
            { id: "q4", type: "mcq", prompt: "Which compound is mainly responsible for bergamot's phototoxicity?", options: [
              { id: "a", text: "Bergapten (a furanocoumarin)", correct: true, explanation: "Correct — bergapten reacts with UV light on the skin." },
              { id: "b", text: "Menthol", correct: false, explanation: "Menthol is a peppermint compound, unrelated here." },
              { id: "c", text: "Vitamin D", correct: false, explanation: "Not involved in phototoxicity." },
            ] },
            { id: "q3", type: "true-false", prompt: "After applying a phototoxic citrus oil to skin, you should keep that skin out of the sun for several hours.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — roughly 12–18 hours." },
              { id: "f", text: "False", correct: false, explanation: "Sun exposure is exactly the risk to avoid." },
            ] },
            { id: "q5", type: "recall", prompt: "What family of UV-reactive compounds makes cold-pressed citrus oils phototoxic?", options: [], answer: "furanocoumarins", accept: ["furanocoumarins", "furanocoumarin", "furocoumarins", "furocoumarin", "bergapten"], explanation: "Furanocoumarins such as bergapten react with UV light, causing burns and dark patches." },
          ],
        },
        {
          id: "l7-sensitization",
          title: "Skin sensitization & patch testing",
          objective: "Explain sensitization and how to reduce the risk.",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "Sensitization is when repeated exposure trains your immune system to react to an oil — so a substance you once tolerated suddenly triggers rashes or allergy-like responses, sometimes permanently. It's different from simple irritation: irritation happens immediately to almost anyone at high enough strength, while sensitization is a learned allergic response unique to you that can flare from then on, even at tiny doses." },
            { kind: "table", headers: ["", "Irritation", "Sensitization"], rows: [
              ["What it is", "Direct chemical irritation of skin", "Immune system 'learns' to react (allergy)"],
              ["Who", "Anyone, if oil is strong enough", "Only people who become sensitized"],
              ["Onset", "Usually quick, on contact", "Builds over repeated exposures"],
              ["Reversible?", "Settles once oil is removed", "Often long-lasting or permanent"],
            ] },
            { kind: "callout", tone: "safety", title: "Lower the risk", text: "Always dilute, always patch test new oils, don't use the same oil at high strength every day, and discard oxidized (old, off-smelling) oils — oxidized citrus, pine, and tea tree oils are especially prone to sensitizing skin." },
            { kind: "callout", tone: "tip", title: "Known sensitizers to handle gently", text: "Oxidized citrus and pine, oakmoss, cinnamon bark, clove, lemongrass, and ylang-ylang are among the more sensitizing oils. Rotate oils, keep dilutions low, and store everything in dark glass away from heat to slow oxidation." },
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
            { id: "q4", type: "mcq", prompt: "How does sensitization differ from simple irritation?", options: [
              { id: "a", text: "Sensitization is a learned immune (allergic) response that can be long-lasting; irritation is direct and settles when the oil is removed", correct: true, explanation: "Correct — that's the key distinction." },
              { id: "b", text: "They are exactly the same thing", correct: false, explanation: "No — one is immune-mediated, the other direct." },
              { id: "c", text: "Irritation is permanent and sensitization is temporary", correct: false, explanation: "It's the reverse." },
            ] },
            { id: "q3", type: "true-false", prompt: "Oxidized (old, off-smelling) citrus and pine oils are more likely to sensitize skin.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — discard them." },
              { id: "f", text: "False", correct: false, explanation: "They are more sensitizing — discard them." },
            ] },
          ],
        },
        {
          id: "l10-hot-oils",
          title: "\"Hot\" oils & where never to apply",
          objective: "Identify 'hot' oils and the body areas where oils should never be applied.",
          estMinutes: 5,
          blocks: [
            { kind: "callout", tone: "safety", title: "What a 'hot' oil is", text: "'Hot' oils cause a burning or stinging sensation on skin even when diluted, because compounds like cinnamaldehyde, eugenol, and carvacrol activate the body's heat/pain receptors. They include cinnamon bark, clove, oregano, thyme, and lemongrass, with peppermint giving a related cooling-then-stinging effect." },
            { kind: "table", headers: ["Hot oil", "Active compound", "Rough dermal max"], rows: [
              ["Cinnamon bark", "Cinnamaldehyde", "~0.07%"],
              ["Oregano", "Carvacrol", "~1%"],
              ["Clove bud", "Eugenol", "~0.5%"],
              ["Thyme (thymol)", "Thymol", "~1.3%"],
              ["Lemongrass", "Citral", "~0.7%"],
            ] },
            { kind: "callout", tone: "tip", title: "If a hot oil stings", text: "Do not rinse with water — it doesn't mix with oil and can spread it. Instead apply more carrier oil (or whole milk) to dilute and lift it, then gently wipe away. The same trick helps if any oil gets somewhere it shouldn't." },
            { kind: "callout", tone: "safety", title: "Never apply oils to these areas", text: "Keep essential oils away from the eyes and the delicate skin around them, inside the ears, the nostrils, and other mucous membranes (mouth, genitals). Never put oils in the eyes or ears. If oil gets in an eye, flush with a carrier oil — not water — and seek care if it persists." },
            { kind: "keyfacts", items: [
              "Hot oils (cinnamon, clove, oregano, thyme, lemongrass) need very low dilutions.",
              "To remove a stinging oil, add carrier oil — not water.",
              "Never apply oils to eyes, ears, nostrils, or other mucous membranes.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "A 'hot' essential oil is one that…", options: [
              { id: "a", text: "Causes a burning/stinging sensation on skin even when diluted", correct: true, explanation: "Correct — cinnamon, clove, oregano and similar oils." },
              { id: "b", text: "Has been warmed before use", correct: false, explanation: "It refers to the skin sensation, not temperature." },
              { id: "c", text: "Is popular this season", correct: false, explanation: "No — 'hot' describes the irritant heat effect." },
            ] },
            { id: "q2", type: "mcq", prompt: "If a hot oil is stinging your skin, you should…", options: [
              { id: "a", text: "Apply more carrier oil to dilute and lift it off", correct: true, explanation: "Correct — oil dissolves oil; water does not." },
              { id: "b", text: "Rinse it with water", correct: false, explanation: "Water doesn't mix with oil and can spread it." },
              { id: "c", text: "Add a hotter oil", correct: false, explanation: "That makes it worse." },
            ] },
            { id: "q3", type: "mcq", prompt: "Compared with most oils, hot oils like cinnamon bark need…", options: [
              { id: "a", text: "A much lower dilution (often well under 1%)", correct: true, explanation: "Correct — cinnamon bark caps around 0.07%." },
              { id: "b", text: "A higher dilution than usual", correct: false, explanation: "The opposite — they're far more irritating." },
              { id: "c", text: "No dilution at all", correct: false, explanation: "Never neat — they can burn skin." },
            ] },
            { id: "q4", type: "true-false", prompt: "Essential oils can be safely placed directly in the eyes or ears.", options: [
              { id: "t", text: "True", correct: false, explanation: "Never — keep oils away from eyes, ears, and mucous membranes." },
              { id: "f", text: "False", correct: true, explanation: "Correct — never put oils in eyes or ears." },
            ] },
            { id: "q5", type: "recall", prompt: "To remove an essential oil that's stinging your skin, you add more ______ oil (not water).", options: [], answer: "carrier", accept: ["carrier", "carrier oil", "fixed", "vegetable", "fatty"], explanation: "Carrier (fatty) oil dilutes and lifts the essential oil; water won't mix with it." },
          ],
        },
        {
          id: "l8-pets",
          title: "Oils toxic to cats & dogs",
          objective: "Recognize which oils endanger pets and how to keep them safe.",
          estMinutes: 6,
          blocks: [
            { kind: "callout", tone: "safety", title: "Cats are especially vulnerable", text: "Cats lack key liver enzymes (glucuronyl transferases) needed to process many essential-oil compounds, especially phenols and the citrus compound d-limonene, so oils can build up to toxic levels. Dogs are somewhat more tolerant but still at real risk — and birds and small pets are extremely sensitive to airborne oils." },
            { kind: "text", text: "Pets are exposed three ways: licking spilled or applied oil, getting it on fur or paws (which they then groom off and swallow), and inhaling heavy diffuser output in a space they can't leave. Cats also self-groom constantly, so anything on their coat ends up ingested." },
            { kind: "table", headers: ["Risky for pets", "Includes"], rows: [
              ["Especially toxic", "Tea tree (melaleuca), wintergreen, pennyroyal, pine, sweet birch, citrus / d-limonene"],
              ["Also risky", "Peppermint, eucalyptus, clove, cinnamon, thyme, oregano, ylang-ylang"],
            ] },
            { kind: "callout", tone: "evidence", title: "Tea tree is a documented danger", text: "Tea tree oil poisoning in cats and dogs is well documented — even a small amount applied to skin or licked has caused tremors, weakness, and collapse. It is one of the clearest examples of 'natural' not meaning 'safe' for animals." },
            { kind: "callout", tone: "tip", title: "Keep pets safe", text: "Never apply essential oils to pets, don't let them lick or walk through oil, diffuse only in well-ventilated spaces the pet can freely leave, and store oils out of reach. Signs of poisoning — drooling, vomiting, tremors, wobbliness, difficulty breathing, lethargy — mean call a vet or pet poison line immediately and bring the bottle." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Why are cats especially vulnerable to essential oils?", options: [
              { id: "a", text: "They lack liver enzymes to process many oil compounds", correct: true, explanation: "Correct — so oils can reach toxic levels." },
              { id: "b", text: "They are allergic to all smells", correct: false, explanation: "It's a metabolism issue, not a smell allergy." },
              { id: "c", text: "They aren't — only dogs are at risk", correct: false, explanation: "Cats are actually more vulnerable than dogs." },
              { id: "d", text: "Their fur absorbs nothing", correct: false, explanation: "Oil on fur is groomed off and swallowed." },
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
            { id: "q4", type: "true-false", prompt: "Because cats groom themselves, oil that lands on their fur can end up swallowed.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — grooming turns skin contact into ingestion." },
              { id: "f", text: "False", correct: false, explanation: "Grooming means fur contact becomes ingestion." },
            ] },
            { id: "q5", type: "recall", prompt: "Name one species that is especially vulnerable to essential-oil toxicity due to a missing liver enzyme.", options: [], answer: "cats", accept: ["cats", "cat", "felines", "feline"], explanation: "Cats lack glucuronyl transferase enzymes, so many oil compounds accumulate to toxic levels." },
          ],
        },
        {
          id: "l9-special-cautions",
          title: "Pregnancy, children & special cautions",
          objective: "Apply extra caution for vulnerable groups and frame oils honestly.",
          estMinutes: 5,
          blocks: [
            { kind: "callout", tone: "safety", title: "Extra-careful groups", text: "Pregnancy and breastfeeding, infants and young children, people with asthma or epilepsy, and anyone on medication should be extra cautious — some oils are contraindicated for these groups. When in doubt, check with a doctor or a qualified aromatherapist before use." },
            { kind: "table", headers: ["Group", "Key cautions"], rows: [
              ["Pregnancy / breastfeeding", "Use sparingly if at all; avoid oils like sage, rosemary, clary sage, and others — check first"],
              ["Infants under 2", "Avoid most oils on skin entirely; very gentle, distant diffusion at most"],
              ["Children", "Lower dilutions (≤1%); avoid peppermint, eucalyptus, rosemary near the face"],
              ["Asthma / respiratory", "Strong aromas can trigger bronchospasm — introduce cautiously, ventilate"],
              ["Epilepsy", "Avoid oils high in camphor/eucalyptol (e.g. rosemary, eucalyptus, sage) — possible seizure risk"],
            ] },
            { kind: "callout", tone: "safety", title: "Children aren't small adults", text: "Children have thinner skin, faster absorption, and developing airways. Use the lowest dilutions, prefer gentle oils (like lavender or chamomile, sparingly), keep diffusion light and intermittent, and store every bottle locked away — childhood essential-oil poisonings, often from a swallowed bottle, are a leading cause of calls to poison centers." },
            { kind: "callout", tone: "tip", title: "The honest bottom line", text: "Used sensibly — diluted, ventilated, away from eyes, pets, and vulnerable people — essential oils can be a pleasant support for mood and relaxation. They are not a treatment for disease and never a substitute for medical care. If a symptom is serious or persistent, see a clinician." },
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
            { id: "q4", type: "mcq", prompt: "For young children, the safest approach is…", options: [
              { id: "a", text: "Lower dilutions, gentle oils, light intermittent diffusion, and bottles locked away", correct: true, explanation: "Correct — children absorb more and are at high poisoning risk." },
              { id: "b", text: "The same oils and strengths as adults", correct: false, explanation: "Children need extra caution." },
              { id: "c", text: "Strong oils on the chest and face", correct: false, explanation: "Avoid peppermint/eucalyptus near a child's face." },
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
    { id: "f17", type: "mcq", prompt: "Roughly how many drops of essential oil equal 1 mL?", options: [
      { id: "a", text: "About 20", correct: true },
      { id: "b", text: "About 2", correct: false },
      { id: "c", text: "About 100", correct: false },
      { id: "d", text: "About 500", correct: false },
    ] },
    { id: "f18", type: "mcq", prompt: "For a 2% dilution in 30 mL (1 oz) of carrier, you'd use about…", options: [
      { id: "a", text: "12 drops", correct: true },
      { id: "b", text: "2 drops", correct: false },
      { id: "c", text: "30 drops", correct: false },
      { id: "d", text: "60 drops", correct: false },
    ] },
    { id: "f19", type: "mcq", prompt: "If a 'hot' oil like cinnamon is stinging your skin, you should…", options: [
      { id: "a", text: "Apply more carrier oil to dilute and lift it", correct: true },
      { id: "b", text: "Rinse it off with water", correct: false },
      { id: "c", text: "Add another drop of the oil", correct: false },
      { id: "d", text: "Ignore it; the burn is harmless", correct: false },
    ] },
    { id: "f20", type: "mcq", prompt: "'Therapeutic grade' on an oil label means…", options: [
      { id: "a", text: "A marketing term — no official body certifies oil 'grades'", correct: true },
      { id: "b", text: "A government tested it as medicine", correct: false },
      { id: "c", text: "It is guaranteed pure", correct: false },
      { id: "d", text: "It is safe to drink", correct: false },
    ] },
    { id: "f21", type: "mcq", prompt: "Essential oils should never be applied to which of these?", options: [
      { id: "a", text: "The eyes, ears, and mucous membranes", correct: true },
      { id: "b", text: "A patch-tested forearm, diluted", correct: false },
      { id: "c", text: "A diffuser's water tank", correct: false },
      { id: "d", text: "A diluted massage blend on the back", correct: false },
    ] },
    { id: "f22", type: "mcq", prompt: "Which best describes a carrier oil?", options: [
      { id: "a", text: "A fatty, non-volatile oil (e.g. jojoba) used to dilute essential oils", correct: true },
      { id: "b", text: "A more concentrated essential oil", correct: false },
      { id: "c", text: "Plain water", correct: false },
      { id: "d", text: "A synthetic fragrance", correct: false },
    ] },
    { id: "f23", type: "mcq", prompt: "Which compound family makes cold-pressed citrus oils phototoxic?", options: [
      { id: "a", text: "Furanocoumarins (e.g. bergapten)", correct: true },
      { id: "b", text: "Carrier fatty acids", correct: false },
      { id: "c", text: "Menthol", correct: false },
      { id: "d", text: "Vitamin C", correct: false },
    ] },
    { id: "f24", type: "mcq", prompt: "How does sensitization differ from irritation?", options: [
      { id: "a", text: "Sensitization is a learned immune response that can be long-lasting", correct: true },
      { id: "b", text: "Sensitization is always temporary", correct: false },
      { id: "c", text: "They are identical", correct: false },
      { id: "d", text: "Irritation only affects pets", correct: false },
    ] },
    { id: "f25", type: "true-false", prompt: "Diffusing essential oils continuously in a sealed room a pet can't leave is safe for the pet.", options: [
      { id: "t", text: "True", correct: false },
      { id: "f", text: "False", correct: true },
    ] },
    { id: "f26", type: "true-false", prompt: "Essential oil bottles should be stored locked away from children.", options: [
      { id: "t", text: "True", correct: true },
      { id: "f", text: "False", correct: false },
    ] },
    { id: "f27", type: "true-false", prompt: "Steam-distilled and FCF (furanocoumarin-free) citrus oils are essentially non-phototoxic.", options: [
      { id: "t", text: "True", correct: true },
      { id: "f", text: "False", correct: false },
    ] },
  ],
};
