/**
 * /llms.txt — a plain-text map of the site for language models.
 *
 * Generated as a route rather than a static file so the Writing section lists
 * every published post automatically. Nothing to update by hand when a post
 * ships.
 */
import type { APIRoute } from 'astro';
import { getPublishedPosts, postPath } from '../lib/posts';
import { SITE_URL, EMAIL } from '../lib/site';

const url = (path: string) => `${SITE_URL}${path}`;

export const GET: APIRoute = async () => {
  const posts = await getPublishedPosts();

  const writing = posts
    .map((post) => `- [${post.data.title}](${url(postPath(post))}): ${post.data.description}`)
    .join('\n');

  const body = `# Sonora

> Sonora is a strategic consultancy run by Taylor Corbett. It provides content
> strategy, AI search visibility (answer engine optimization), SEO, and category
> positioning for startups and B2B software companies. Sonora sells strategy and
> direction only and does not produce content or engineering work.

## Core pages

- [The Sonora Method](${url('/method')}): A four-stage framework — Listen, Locate, Saturate, Sustain.
- [Services](${url('/services')}): Visibility audits, fractional content leadership, AI visibility monitoring, original research programs, roadmap execution management.
- [About](${url('/about')}): Background of Taylor Corbett, founder.

## Writing

- [Blog](${url('/blog')}): Notes on AI search, SEO, and category strategy.
${writing}

## Contact

- [Book a call](${url('/book')})
- ${EMAIL}
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
