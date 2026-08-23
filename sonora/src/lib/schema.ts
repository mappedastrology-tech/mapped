/**
 * JSON-LD builders.
 *
 * Every graph node gets a stable @id so nodes can reference each other
 * instead of being repeated. `Organization` and `WebSite` are emitted on every
 * page; everything else is added per page.
 *
 * Deliberately absent, and they must stay absent:
 *   - `alumniOf` or any past employer on the Person node
 *   - `offers`, `price`, or any price field on the Service nodes
 */
import { SITE_URL, SITE_NAME, SITE_TAGLINE, EMAIL, AUTHOR, SAME_AS } from './site';

export const ORG_ID = `${SITE_URL}/#organization`;
export const SITE_ID = `${SITE_URL}/#website`;
export const PERSON_ID = `${SITE_URL}/about#person`;

export const abs = (path: string): string =>
  path.startsWith('http') ? path : `${SITE_URL}${path}`;

export function organizationSchema() {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_TAGLINE,
    email: EMAIL,
    logo: {
      '@type': 'ImageObject',
      url: abs('/brand/sonora-icon.png'),
    },
    founder: { '@id': PERSON_ID },
    areaServed: 'Worldwide',
    ...(SAME_AS.length ? { sameAs: SAME_AS } : {}),
  };
}

export function websiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': SITE_ID,
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: 'en-US',
    publisher: { '@id': ORG_ID },
  };
}

export function personSchema() {
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: AUTHOR.name,
    jobTitle: AUTHOR.jobTitle,
    description: AUTHOR.bioShort,
    url: abs('/about'),
    worksFor: { '@id': ORG_ID },
    ...(SAME_AS.length ? { sameAs: SAME_AS } : {}),
  };
}

export function breadcrumbSchema(
  trail: { name: string; path: string }[]
) {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${abs(trail[trail.length - 1].path)}#breadcrumbs`,
    itemListElement: trail.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: abs(crumb.path),
    })),
  };
}

export function faqSchema(
  faqs: { question: string; answer: string }[],
  path: string
) {
  return {
    '@type': 'FAQPage',
    '@id': `${abs(path)}#faq`,
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function serviceSchema(service: {
  slug: string;
  name: string;
  description: string;
}) {
  return {
    '@type': 'Service',
    '@id': `${abs('/services')}#${service.slug}`,
    name: service.name,
    description: service.description,
    serviceType: service.name,
    provider: { '@id': ORG_ID },
    areaServed: 'Worldwide',
    audience: {
      '@type': 'Audience',
      audienceType: 'Startups and B2B software companies',
    },
  };
}

export function blogPostingSchema(post: {
  path: string;
  title: string;
  description: string;
  date: Date;
  updated?: Date;
  author: string;
  image: string;
  imageAlt?: string;
}) {
  return {
    '@type': 'BlogPosting',
    '@id': `${abs(post.path)}#post`,
    headline: post.title,
    description: post.description,
    datePublished: post.date.toISOString(),
    dateModified: (post.updated ?? post.date).toISOString(),
    author: {
      '@type': 'Person',
      name: post.author,
      ...(post.author === AUTHOR.name ? { '@id': PERSON_ID } : {}),
    },
    publisher: { '@id': ORG_ID },
    image: {
      '@type': 'ImageObject',
      url: abs(post.image),
      ...(post.imageAlt ? { caption: post.imageAlt } : {}),
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': abs(post.path),
    },
    inLanguage: 'en-US',
  };
}

/** Wraps the per-page nodes into a single @graph document. */
export function buildGraph(nodes: object[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': [organizationSchema(), websiteSchema(), ...nodes],
  };
}
