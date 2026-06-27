import type { Course } from "../types";

/** FLAGSHIP #6 — Herbalism, taught evidence-first and safety-first. */
export const herbalismFoundations: Course = {
  id: "herbalism-foundations",
  domain: "herbalism",
  title: "Herbalism: Tradition, Evidence & Safety",
  subtitle: "Folk wisdom meets the evidence",
  level: "foundations",
  icon: "🌿",
  summary:
    "Learn common herbs and their traditional and evidence-based uses — and, above all, how to use them safely alongside modern medicine.",
  estMinutes: 45,
  status: "published",
  passThreshold: 0.8,
  finalTestSize: 10,
  safetyNote:
    "Herbs can interact dangerously with medications (e.g. St John's wort with birth control and antidepressants) and some are unsafe in pregnancy. This course leads with safety, and is not a substitute for professional medical care.",

  outline: [
    { module: "Foundations", lessons: ["What herbalism is — and the regulatory reality", "Preparations: teas, tinctures & more"] },
    { module: "Common Herbs (Tradition vs Evidence)", lessons: ["Calming herbs", "Digestive herbs", "Immune & inflammatory herbs", "St John's wort & its interactions"] },
    { module: "Safety First", lessons: ["Herb–drug interactions", "Pregnancy & breastfeeding", "When to see a clinician, not a herb"] },
  ],

  modules: [
    {
      id: "m1",
      title: "Foundations",
      lessons: [
        {
          id: "l1-what-herbalism-is",
          title: "What herbalism is — and the regulatory reality",
          objective: "Explain what herbalism is and how herbal products are (and aren't) regulated.",
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "Herbalism is the use of plants for wellbeing — a practice found in nearly every culture, with a mix of genuine pharmacology and folk tradition. Many modern drugs (aspirin, digoxin, morphine) began as plant medicines." },
            { kind: "callout", tone: "safety", title: "The regulatory reality", text: "In the US, herbal supplements are regulated as foods, not drugs. They are NOT FDA-approved for safety or effectiveness before sale, and products are not standardized — the actual dose and purity can vary a lot between brands and even bottles. 'Natural' does not mean safe, regulated, or effective." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "In the US, herbal supplements are…", options: [
              { id: "a", text: "Regulated as foods, not FDA-approved like drugs", correct: true, explanation: "Correct — they aren't pre-approved for safety/efficacy." },
              { id: "b", text: "Approved by the FDA before sale", correct: false, explanation: "They are not pre-approved like drugs." },
              { id: "c", text: "Banned", correct: false, explanation: "They're legal but lightly regulated." },
            ] },
            { id: "q2", type: "true-false", prompt: "'Natural' reliably means safe and standardized.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — natural products can be potent, variable, and risky." },
              { id: "f", text: "False", correct: true, explanation: "Correct — natural ≠ safe or standardized." },
            ] },
            { id: "q3", type: "mcq", prompt: "Which is true of herbal product strength?", options: [
              { id: "a", text: "It can vary between brands and batches", correct: true, explanation: "Right — they aren't standardized like drugs." },
              { id: "b", text: "It is identical everywhere", correct: false, explanation: "No — potency varies." },
              { id: "c", text: "It is set by the FDA", correct: false, explanation: "The FDA doesn't pre-set supplement doses." },
            ] },
          ],
        },
        {
          id: "l2-preparations",
          title: "Preparations: teas, tinctures & more",
          objective: "Distinguish the main ways herbs are prepared.",
          estMinutes: 4,
          blocks: [
            { kind: "table", headers: ["Preparation", "What it is"], rows: [
              ["Infusion (tea)", "Steeping soft parts (leaves, flowers) in hot water"],
              ["Decoction", "Simmering tough parts (roots, bark) in water"],
              ["Tincture", "Extracting a herb in alcohol (concentrated, long-lasting)"],
              ["Infused oil / salve", "Steeping a herb in oil for topical use"],
              ["Capsule / powder", "Dried, ground herb in a measured dose"],
            ] },
            { kind: "callout", tone: "tip", title: "Concentration matters", text: "A cup of chamomile tea and a concentrated tincture or extract are very different doses. Most safety issues come with concentrated forms, not culinary amounts." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "A decoction is made by…", options: [
              { id: "a", text: "Simmering tough parts like roots and bark in water", correct: true, explanation: "Correct — heat extracts the tougher material." },
              { id: "b", text: "Steeping leaves briefly in cool water", correct: false, explanation: "That's closer to an infusion." },
              { id: "c", text: "Extracting in alcohol", correct: false, explanation: "That's a tincture." },
            ] },
            { id: "q2", type: "mcq", prompt: "A tincture extracts a herb in…", options: [
              { id: "a", text: "Alcohol", correct: true, explanation: "Yes — concentrated and shelf-stable." },
              { id: "b", text: "Hot water only", correct: false, explanation: "That's a tea/infusion." },
              { id: "c", text: "Sunlight", correct: false, explanation: "Not a preparation method." },
            ] },
            { id: "q3", type: "true-false", prompt: "A concentrated extract and a cup of tea are roughly the same dose.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — concentrates are far stronger." },
              { id: "f", text: "False", correct: true, explanation: "Correct — concentration changes the dose a lot." },
            ] },
          ],
        },
      ],
    },
    {
      id: "m2",
      title: "Common Herbs (Tradition vs Evidence)",
      lessons: [
        {
          id: "l3-calming",
          title: "Calming herbs",
          objective: "Summarize the evidence for common calming herbs.",
          estMinutes: 4,
          blocks: [
            { kind: "table", headers: ["Herb", "Traditional use", "Evidence"], rows: [
              ["Chamomile", "Calm, sleep, digestion", "Modest evidence for mild anxiety/sleep; generally gentle"],
              ["Valerian", "Sleep, anxiety", "Mixed evidence for sleep; can cause drowsiness"],
              ["Lemon balm", "Calm, mood", "Limited but promising evidence for stress/sleep"],
            ] },
            { kind: "callout", tone: "safety", title: "Watch the sedation", text: "Calming/sedating herbs (especially valerian) can add to the effect of alcohol, sleep aids, and anti-anxiety medication. Don't combine without medical advice, and don't drive if drowsy." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Valerian is mainly used traditionally for…", options: [
              { id: "a", text: "Sleep and anxiety", correct: true, explanation: "Correct — a sedating herb." },
              { id: "b", text: "Boosting energy", correct: false, explanation: "It's calming, not stimulating." },
              { id: "c", text: "Healing wounds", correct: false, explanation: "That's not its traditional use." },
            ] },
            { id: "q2", type: "mcq", prompt: "A key safety concern with sedating herbs is…", options: [
              { id: "a", text: "Added drowsiness with alcohol or sleep/anxiety meds", correct: true, explanation: "Right — effects can stack dangerously." },
              { id: "b", text: "They make you radioactive", correct: false, explanation: "Not a real concern." },
              { id: "c", text: "They cure infections", correct: false, explanation: "Unrelated and unproven." },
            ] },
            { id: "q3", type: "true-false", prompt: "Chamomile has modest evidence for mild anxiety and sleep.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — modest but real, and it's gentle." },
              { id: "f", text: "False", correct: false, explanation: "There is modest supporting evidence." },
            ] },
          ],
        },
        {
          id: "l4-digestive",
          title: "Digestive herbs",
          objective: "Summarize the evidence for ginger and peppermint.",
          estMinutes: 4,
          blocks: [
            { kind: "table", headers: ["Herb", "Use", "Evidence"], rows: [
              ["Ginger", "Nausea (motion, pregnancy, chemo)", "Good evidence it helps nausea"],
              ["Peppermint", "IBS, indigestion", "Good evidence (enteric-coated oil) for IBS symptoms"],
            ] },
            { kind: "callout", tone: "tip", title: "Two of the better-evidenced herbs", text: "Ginger and peppermint are among the herbs with solid clinical support — a good reminder that 'herbal' isn't automatically 'unproven.' Even so, peppermint can worsen reflux in some people, and very high ginger doses can thin the blood slightly." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Ginger has good evidence for…", options: [
              { id: "a", text: "Reducing nausea", correct: true, explanation: "Correct — including motion and pregnancy nausea." },
              { id: "b", text: "Curing infections", correct: false, explanation: "Not its evidence base." },
              { id: "c", text: "Improving eyesight", correct: false, explanation: "No evidence for that." },
            ] },
            { id: "q2", type: "mcq", prompt: "Enteric-coated peppermint oil has evidence for…", options: [
              { id: "a", text: "Irritable bowel syndrome (IBS) symptoms", correct: true, explanation: "Yes — a well-studied use." },
              { id: "b", text: "Healing broken bones", correct: false, explanation: "No evidence for that." },
              { id: "c", text: "Lowering cholesterol", correct: false, explanation: "Not an established use." },
            ] },
            { id: "q3", type: "true-false", prompt: "All herbal remedies are unproven by definition.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — some, like ginger and peppermint, have solid evidence." },
              { id: "f", text: "False", correct: true, explanation: "Correct — evidence varies by herb." },
            ] },
          ],
        },
        {
          id: "l5-immune",
          title: "Immune & inflammatory herbs",
          objective: "Summarize the (mixed) evidence for echinacea and turmeric.",
          estMinutes: 4,
          blocks: [
            { kind: "sort", prompt: "Sort herbs by traditional use", instructions: "Tap a herb, then tap its category", groups: [
              { name: "Calming", accent: "#8e6bb5", items: ["Chamomile", "Lemon balm", "Lavender"] },
              { name: "Digestive", accent: "#6a9a4a", items: ["Peppermint", "Ginger", "Fennel"] },
              { name: "Immune", accent: "#c9881f", items: ["Echinacea", "Elderberry", "Astragalus"] },
            ] },
            { kind: "table", headers: ["Herb", "Use", "Evidence"], rows: [
              ["Echinacea", "Colds", "Mixed/weak — may slightly shorten colds at best"],
              ["Turmeric (curcumin)", "Inflammation, joints", "Some evidence; poorly absorbed on its own"],
            ] },
            { kind: "callout", tone: "evidence", title: "Read claims critically", text: "Popular herbs are often oversold. Echinacea's cold benefit is weak and inconsistent; turmeric shows promise for inflammation but curcumin is poorly absorbed and high-dose supplements can upset the stomach or interact with blood thinners." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "The evidence for echinacea preventing colds is…", options: [
              { id: "a", text: "Weak and inconsistent", correct: true, explanation: "Correct — at best it may slightly shorten a cold." },
              { id: "b", text: "Strong and conclusive", correct: false, explanation: "No — the evidence is mixed/weak." },
              { id: "c", text: "Proof it cures the flu", correct: false, explanation: "There's no such proof." },
            ] },
            { id: "q2", type: "mcq", prompt: "A practical issue with turmeric/curcumin is…", options: [
              { id: "a", text: "It's poorly absorbed on its own", correct: true, explanation: "Right — bioavailability is low." },
              { id: "b", text: "It's radioactive", correct: false, explanation: "Not a real concern." },
              { id: "c", text: "It's illegal", correct: false, explanation: "It's a common spice/supplement." },
            ] },
            { id: "q3", type: "true-false", prompt: "Popular herbs are sometimes oversold relative to the evidence.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — read claims critically." },
              { id: "f", text: "False", correct: false, explanation: "Marketing often outpaces the evidence." },
            ] },
          ],
        },
        {
          id: "l6-st-johns-wort",
          title: "St John's wort & its interactions",
          objective: "Explain why St John's wort is a major interaction risk.",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "St John's wort has some evidence for mild-to-moderate depression — but it is also the most important herb–drug interaction to know about." },
            { kind: "callout", tone: "safety", title: "Why it's risky", text: "St John's wort speeds up liver enzymes (CYP3A4) and a drug pump (P-glycoprotein), which can REDUCE the effectiveness of many medications — including hormonal birth control (risking breakthrough bleeding and contraceptive failure), blood thinners, transplant anti-rejection drugs, HIV and cancer medicines, and more. Combined with antidepressants (SSRIs) it can cause dangerous serotonin syndrome." },
            { kind: "callout", tone: "tip", title: "The takeaway", text: "Never start St John's wort without checking with a pharmacist or doctor about everything else you take — including the pill." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "St John's wort can dangerously REDUCE the effect of…", options: [
              { id: "a", text: "Hormonal birth control and many other drugs", correct: true, explanation: "Correct — it speeds their breakdown." },
              { id: "b", text: "Nothing — it has no interactions", correct: false, explanation: "It's a major interaction risk." },
              { id: "c", text: "Only vitamins", correct: false, explanation: "It affects many prescription drugs." },
            ] },
            { id: "q2", type: "mcq", prompt: "Combining St John's wort with SSRIs risks…", options: [
              { id: "a", text: "Serotonin syndrome", correct: true, explanation: "Right — a potentially dangerous reaction." },
              { id: "b", text: "Improved sleep only", correct: false, explanation: "The real concern is serotonin syndrome." },
              { id: "c", text: "No effect", correct: false, explanation: "It can be dangerous." },
            ] },
            { id: "q3", type: "true-false", prompt: "It's fine to start St John's wort without telling your doctor or pharmacist.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — always check for interactions first." },
              { id: "f", text: "False", correct: true, explanation: "Correct — check first, especially re: the pill." },
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
          id: "l7-interactions",
          title: "Herb–drug interactions",
          objective: "Recognize common herb–drug interaction patterns.",
          estMinutes: 5,
          blocks: [
            { kind: "callout", tone: "safety", title: "Patterns to know", text: "Several common herbs increase BLEEDING risk when combined with blood thinners (warfarin, aspirin, etc.): ginkgo, garlic, ginger (high dose), and fish oil. St John's wort reduces the effect of many drugs. And grapefruit (not a herb, but worth knowing) does the opposite — it raises drug levels by blocking the same enzyme St John's wort speeds up." },
            { kind: "callout", tone: "tip", title: "The safe habit", text: "Before combining any herb with a prescription medication, ask a pharmacist — they can check interactions in seconds. Always tell your doctors which supplements you take." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Which herbs can increase bleeding risk with blood thinners?", options: [
              { id: "a", text: "Ginkgo, garlic, and high-dose ginger", correct: true, explanation: "Correct — they can add to anticoagulant effects." },
              { id: "b", text: "Only chamomile", correct: false, explanation: "The bleeding-risk group is ginkgo/garlic/ginger/fish oil." },
              { id: "c", text: "No herbs affect bleeding", correct: false, explanation: "Several do." },
            ] },
            { id: "q2", type: "mcq", prompt: "The safest habit before combining a herb with medication is to…", options: [
              { id: "a", text: "Ask a pharmacist to check for interactions", correct: true, explanation: "Yes — quick and reliable." },
              { id: "b", text: "Guess based on a blog", correct: false, explanation: "Not safe or reliable." },
              { id: "c", text: "Take double the dose", correct: false, explanation: "Never — that increases risk." },
            ] },
            { id: "q3", type: "true-false", prompt: "You should tell your doctors which supplements you take.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — it helps them keep you safe." },
              { id: "f", text: "False", correct: false, explanation: "Always disclose supplements." },
            ] },
          ],
        },
        {
          id: "l8-pregnancy",
          title: "Pregnancy & breastfeeding",
          objective: "Apply extra caution with herbs during pregnancy and breastfeeding.",
          estMinutes: 4,
          blocks: [
            { kind: "callout", tone: "safety", title: "Pregnancy cautions", text: "Some herbs can stimulate the uterus or affect a pregnancy and should be avoided in medicinal amounts — for example blue cohosh, black cohosh, pennyroyal, mugwort, rue, tansy, and wormwood. Many other herbs simply haven't been studied in pregnancy, so caution is the default." },
            { kind: "callout", tone: "tip", title: "Dose matters", text: "Culinary amounts of common herbs and spices in food are generally fine. The concern is concentrated medicinal doses, supplements, and strong teas. When pregnant or breastfeeding, clear any herbal remedy with your doctor or midwife first." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Which class of herbs is a particular concern in pregnancy?", options: [
              { id: "a", text: "Uterine stimulants like pennyroyal and blue cohosh", correct: true, explanation: "Correct — avoid these in medicinal amounts." },
              { id: "b", text: "All culinary spices in food", correct: false, explanation: "Food amounts are generally fine; concentrates are the concern." },
              { id: "c", text: "None — anything goes", correct: false, explanation: "Several herbs are unsafe in pregnancy." },
            ] },
            { id: "q2", type: "mcq", prompt: "During pregnancy, the safest approach to herbal remedies is to…", options: [
              { id: "a", text: "Clear them with a doctor or midwife first", correct: true, explanation: "Yes — caution is the default." },
              { id: "b", text: "Assume all are safe", correct: false, explanation: "Many are untested or unsafe." },
              { id: "c", text: "Take the strongest dose", correct: false, explanation: "Never — that raises risk." },
            ] },
            { id: "q3", type: "true-false", prompt: "Concentrated medicinal doses carry more risk in pregnancy than culinary amounts.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — dose matters." },
              { id: "f", text: "False", correct: false, explanation: "Concentrated doses are the concern." },
            ] },
          ],
        },
        {
          id: "l9-clinician",
          title: "When to see a clinician, not a herb",
          objective: "Recognize when to seek medical care rather than self-treat.",
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "Herbalism can support everyday wellbeing, but it has limits. Some situations need a professional, not a tea." },
            { kind: "callout", tone: "safety", title: "See a clinician for", text: "Severe, persistent, or worsening symptoms; high fever; chest pain or trouble breathing; a suspected infection; anything affecting a baby or young child; mental-health crises; or any serious or chronic medical condition. Herbs are not a substitute for diagnosis and treatment." },
            { kind: "callout", tone: "tip", title: "Use both wisely", text: "The healthiest approach treats herbs as a complement to — not a replacement for — professional care, and keeps your medical team in the loop." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Which situation calls for a clinician rather than self-treating with herbs?", options: [
              { id: "a", text: "Chest pain or trouble breathing", correct: true, explanation: "Correct — that needs urgent medical care." },
              { id: "b", text: "Wanting a calming evening tea", correct: false, explanation: "That's a fine everyday use." },
              { id: "c", text: "Mild seasonal sniffles you're managing", correct: false, explanation: "Not necessarily urgent." },
            ] },
            { id: "q2", type: "mcq", prompt: "The healthiest role for herbalism is as…", options: [
              { id: "a", text: "A complement to professional care, not a replacement", correct: true, explanation: "Yes — use both, and keep your team informed." },
              { id: "b", text: "A full replacement for doctors", correct: false, explanation: "Herbs can't replace medical care." },
              { id: "c", text: "A cure for everything", correct: false, explanation: "No remedy cures everything." },
            ] },
            { id: "q3", type: "true-false", prompt: "Herbs are an appropriate substitute for diagnosing a serious condition.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — serious symptoms need a professional." },
              { id: "f", text: "False", correct: true, explanation: "Correct — see a clinician for those." },
            ] },
          ],
        },
      ],
    },
  ],

  finalTest: [
    { id: "f1", type: "mcq", prompt: "In the US, herbal supplements are…", options: [
      { id: "a", text: "Regulated as foods, not FDA-approved like drugs", correct: true },
      { id: "b", text: "Pre-approved by the FDA for safety", correct: false },
      { id: "c", text: "Illegal", correct: false },
      { id: "d", text: "Standardized to exact doses by law", correct: false },
    ] },
    { id: "f2", type: "mcq", prompt: "'Natural' means…", options: [
      { id: "a", text: "Not necessarily safe, standardized, or effective", correct: true },
      { id: "b", text: "Always safe", correct: false },
      { id: "c", text: "Always effective", correct: false },
      { id: "d", text: "FDA-approved", correct: false },
    ] },
    { id: "f3", type: "mcq", prompt: "A tincture extracts a herb in…", options: [
      { id: "a", text: "Alcohol", correct: true },
      { id: "b", text: "Hot water", correct: false },
      { id: "c", text: "Oil", correct: false },
      { id: "d", text: "Vinegar only", correct: false },
    ] },
    { id: "f4", type: "mcq", prompt: "Ginger has good evidence for…", options: [
      { id: "a", text: "Reducing nausea", correct: true },
      { id: "b", text: "Curing infections", correct: false },
      { id: "c", text: "Improving vision", correct: false },
      { id: "d", text: "Healing bones", correct: false },
    ] },
    { id: "f5", type: "mcq", prompt: "Enteric-coated peppermint oil is evidenced for…", options: [
      { id: "a", text: "IBS symptoms", correct: true },
      { id: "b", text: "Lowering cholesterol", correct: false },
      { id: "c", text: "Curing colds", correct: false },
      { id: "d", text: "Bone healing", correct: false },
    ] },
    { id: "f6", type: "mcq", prompt: "The evidence for echinacea against colds is…", options: [
      { id: "a", text: "Weak and inconsistent", correct: true },
      { id: "b", text: "Strong and conclusive", correct: false },
      { id: "c", text: "Proof it cures flu", correct: false },
      { id: "d", text: "Nonexistent in every study", correct: false },
    ] },
    { id: "f7", type: "mcq", prompt: "St John's wort can REDUCE the effectiveness of…", options: [
      { id: "a", text: "Hormonal birth control and many drugs", correct: true },
      { id: "b", text: "Nothing", correct: false },
      { id: "c", text: "Only food", correct: false },
      { id: "d", text: "Water", correct: false },
    ] },
    { id: "f8", type: "mcq", prompt: "St John's wort + SSRIs risks…", options: [
      { id: "a", text: "Serotonin syndrome", correct: true },
      { id: "b", text: "Better sleep only", correct: false },
      { id: "c", text: "No effect", correct: false },
      { id: "d", text: "Improved vision", correct: false },
    ] },
    { id: "f9", type: "mcq", prompt: "Which herbs increase bleeding risk with blood thinners?", options: [
      { id: "a", text: "Ginkgo, garlic, high-dose ginger", correct: true },
      { id: "b", text: "Only chamomile", correct: false },
      { id: "c", text: "None", correct: false },
      { id: "d", text: "Only peppermint", correct: false },
    ] },
    { id: "f10", type: "mcq", prompt: "Which is a uterine-stimulant herb to avoid in pregnancy?", options: [
      { id: "a", text: "Pennyroyal", correct: true },
      { id: "b", text: "Culinary basil in food", correct: false },
      { id: "c", text: "Chamomile tea", correct: false },
      { id: "d", text: "Peppermint", correct: false },
    ] },
    { id: "f11", type: "mcq", prompt: "Before combining a herb with medication, you should…", options: [
      { id: "a", text: "Ask a pharmacist to check interactions", correct: true },
      { id: "b", text: "Double the dose", correct: false },
      { id: "c", text: "Guess", correct: false },
      { id: "d", text: "Stop all your medications", correct: false },
    ] },
    { id: "f12", type: "mcq", prompt: "Which calls for a clinician, not herbs?", options: [
      { id: "a", text: "Chest pain or trouble breathing", correct: true },
      { id: "b", text: "Wanting a calming tea", correct: false },
      { id: "c", text: "Mild sniffles", correct: false },
      { id: "d", text: "Curiosity about herbs", correct: false },
    ] },
    { id: "f13", type: "true-false", prompt: "Sedating herbs like valerian can add to the effect of alcohol and sleep meds.", options: [
      { id: "t", text: "True", correct: true },
      { id: "f", text: "False", correct: false },
    ] },
    { id: "f14", type: "true-false", prompt: "Culinary amounts of herbs in food carry the same risk as concentrated extracts.", options: [
      { id: "t", text: "True", correct: false },
      { id: "f", text: "False", correct: true },
    ] },
    { id: "f15", type: "true-false", prompt: "Herbs can substitute for diagnosing and treating a serious condition.", options: [
      { id: "t", text: "True", correct: false },
      { id: "f", text: "False", correct: true },
    ] },
    { id: "f16", type: "true-false", prompt: "You should tell your doctors which supplements you take.", options: [
      { id: "t", text: "True", correct: true },
      { id: "f", text: "False", correct: false },
    ] },
  ],
};
