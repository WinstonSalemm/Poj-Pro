import type { MetadataRoute } from 'next';
import { buildSitemap, SITEMAP_REVALIDATE_SECONDS } from '@/lib/sitemap';
import { SITE_URL } from '@/lib/site';

export const revalidate = SITEMAP_REVALIDATE_SECONDS;

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
