/**
 * Blog content collection.
 *
 * Posts are markdown files in src/content/blog/. The filename becomes the URL
 * slug: `the-sonora-method.md` is served at /blog/the-sonora-method.
 *
 * `description` is required because it is the page's meta description. A post
 * without one fails the build rather than shipping an empty tag.
 */
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    author: z.string().default('Taylor Corbett'),
    draft: z.boolean().default(false),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
  }),
});

export const collections = { blog };
