import type { MetadataRoute } from 'next';
import { buildSitemap } from '@/lib/sitemap';
import { SITE_URL } from '@/lib/site';

// Must be a literal — Next.js statically analyzes segment config exports.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    return await buildSitemap();
  } catch (error) {
    console.error('[sitemap] Generation failed, returning homepage fallback:', error);
    return [
      {
        url: SITE_URL,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
    ];
  }
}
