/**
 * The four FAQs on /method.
 *
 * These are written to be extracted. The first sentence of every answer is a
 * complete, standalone response to the question — an answer engine that lifts
 * one sentence still lifts something true and useful.
 *
 * The same strings feed the visible page and the FAQPage JSON-LD, so the two
 * can never disagree.
 */
export const FAQS = [
  {
    question: 'What is answer engine optimization?',
    answer:
      'Answer engine optimization, or AEO, is the practice of getting a company named and cited inside the answers AI assistants generate, rather than ranked in a list of links. It covers three things: the questions buyers actually ask, whether a model can read your site at all, and which third-party sources it pulls from when it answers those questions.',
  },
  {
    question: 'How is AEO different from SEO?',
    answer:
      'AEO competes to be one of the few sources a model cites inside an answer; SEO competes for a position among ten links on a results page. The technical foundations overlap almost entirely, so good SEO work is rarely wasted. What changes is the target and the measurement: there is no position one in an answer, only whether you are in it.',
  },
  {
    question: 'How long does it take to see results in AI search?',
    answer:
      'Expect the first measurable movement within a quarter and a defensible position in three to four. Technical fixes register fastest, because they change what a crawler can read on the next pass. Citation patterns move slowly, because models reflect sources that have been published, indexed, and repeated over time. Anyone promising faster is measuring something that was never comparable.',
  },
  {
    question: 'Do you write the content?',
    answer:
      'No. Sonora sets strategy and direction and manages whoever executes. Your team, your freelancers, or an agency produce the work; I decide what should be made, set the standard it has to meet, review what comes back, and say whether it is good enough to ship. If you need someone to execute, I will tell you honestly and help you find them.',
  },
] as const;
