/**
 * Single source of truth for everything that appears in more than one place:
 * URLs, contact details, nav, and the values Taylor still needs to supply.
 *
 * If you are looking for something to change, it is probably in this file.
 */

export const SITE_URL = 'https://sonoramethod.com';

export const SITE_NAME = 'Sonora';

export const SITE_TAGLINE =
  'Content and search strategy for companies that need to be found.';

export const EMAIL = 'hello@sonoramethod.com';

export const LOCATION = 'Texas Hill Country';

export const AUTHOR = {
  name: 'Taylor Corbett',
  jobTitle: 'Founder and Principal Strategist',
  bioShort:
    'Taylor Corbett runs Sonora, a content and search strategy practice for startups and B2B software companies.',
};

/**
 * ---------------------------------------------------------------------------
 * PLACEHOLDERS — replace these when Taylor sends the real values.
 * Each one is deliberately obvious so it cannot ship by accident. The build
 * prints a warning for every placeholder still in place.
 * ---------------------------------------------------------------------------
 */
export const PLACEHOLDERS = {
  /** Taylor's public LinkedIn profile URL. */
  linkedin: 'TAYLOR_TO_PROVIDE_LINKEDIN_URL',
  /**
   * The Cal.com booking link, in `username/event-slug` form.
   * Example: `sonora/intro-call`
   */
  calcom: 'TAYLOR_TO_PROVIDE_CALCOM_LINK',
  /** Plausible or Fathom site ID. See Base.astro for where it is used. */
  analyticsSiteId: 'TAYLOR_TO_PROVIDE_ANALYTICS_SITE_ID',
} as const;

export function isPlaceholder(value: string): boolean {
  return value.startsWith('TAYLOR_TO_PROVIDE');
}

/** Only real, resolvable profile URLs belong in JSON-LD `sameAs`. */
export const SAME_AS: string[] = [PLACEHOLDERS.linkedin].filter(
  (url) => !isPlaceholder(url)
);

export const NAV_LINKS = [
  { label: 'Method', href: '/method' },
  { label: 'Services', href: '/services' },
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
] as const;

/** Human-readable label for a path, used to build breadcrumbs. */
export const PAGE_LABELS: Record<string, string> = {
  '/method': 'Method',
  '/services': 'Services',
  '/about': 'About',
  '/blog': 'Writing',
  '/book': 'Book a call',
  '/contact': 'Contact',
  '/privacy': 'Privacy',
};

export const SERVICES = [
  {
    slug: 'visibility-audit',
    name: 'Visibility Audit',
    oneLiner:
      'A baseline of where you stand in AI and traditional search, and a prioritized roadmap for changing it.',
    description:
      'Where you stand right now in AI answers and traditional search, and what to do about it in what order. Covers the real query set your buyers use, an AI share-of-voice baseline against named competitors, a technical teardown of whether models can read your site at all, and the citation sources you are missing.',
  },
  {
    slug: 'fractional-head-of-content',
    name: 'Fractional Head of Content',
    oneLiner: 'Strategy, editorial direction, and standards. Ongoing.',
    description:
      'Content leadership without the hire. I own the strategy, the editorial standard, the measurement, and the vendors. Your team or your freelancers execute; I decide what gets made and hold the line on whether it is good enough.',
  },
  {
    slug: 'ai-visibility-monitoring',
    name: 'AI Visibility Monitoring',
    oneLiner:
      'Fixed prompt set, quarterly reporting, named competitors, comparable numbers.',
    description:
      'Ongoing measurement of how you appear in AI answers, on a fixed prompt set, against named competitors, on a set cadence. Most AI visibility reporting is unreliable because the measurement basis moves. This does not.',
  },
  {
    slug: 'original-research-programs',
    name: 'Original Research Programs',
    oneLiner:
      'Become the source that gets cited instead of the company chasing citations.',
    description:
      'The most reliable way to get cited is to be the source. I design the research, direct the analysis, shape the story, and manage production. Surveys, analysis of data you already have, or a recurring index that gives PR a news hook four times a year.',
  },
  {
    slug: 'roadmap-execution-management',
    name: 'Roadmap Execution Management',
    oneLiner:
      'Your team ships it. I write the tickets, brief the engineers, and verify it worked.',
    description:
      'The audit produces a roadmap. Most roadmaps do not get executed because nobody translates them into work an engineering team will actually prioritize. I write the tickets, brief the team, review what ships, and verify it did what it was supposed to.',
  },
] as const;
