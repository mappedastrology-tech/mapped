import rss from '@astrojs/rss';
import { getPublishedPosts, postPath } from '../lib/posts';
import { SITE_URL } from '../lib/site';

export async function GET(context) {
  const posts = await getPublishedPosts();

  return rss({
    title: 'Sonora — Writing',
    description:
      'Notes on AI search, content strategy, and building a category. From Taylor Corbett.',
    site: context.site ?? SITE_URL,
    // The site is built with trailingSlash: 'never'. Without this the feed
    // would advertise a different URL than the sitemap and the canonical tag.
    trailingSlash: false,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      author: post.data.author,
      link: postPath(post),
    })),
    customData: '<language>en-us</language>',
  });
}
