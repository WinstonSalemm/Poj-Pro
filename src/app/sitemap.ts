import type { MetadataRoute } from 'next';
import { buildSitemap } from '@/lib/sitemap';
import { SITE_URL } from '@/lib/site';

// Prisma requires Node.js (not Edge).
export const runtime = 'nodejs';

// Must be a literal — Next.js statically analyzes segment config exports.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    return await buildSitemap();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    // warn/error survive production removeConsole
    console.error('[sitemap] Generation failed, returning static fallback:', message);
    return [
      {
        url: SITE_URL,
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${SITE_URL}/catalog`,
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${SITE_URL}/about`,
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${SITE_URL}/contacts`,
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${SITE_URL}/promotions`,
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: `${SITE_URL}/documents`,
        changeFrequency: 'monthly',
        priority: 0.6,
      },
      {
        url: `${SITE_URL}/documents/certificates`,
        changeFrequency: 'monthly',
        priority: 0.6,
      },
      {
        url: `${SITE_URL}/guide`,
        changeFrequency: 'monthly',
        priority: 0.6,
      },
      {
        url: `${SITE_URL}/en/blog`,
        changeFrequency: 'weekly',
        priority: 0.7,
      },
      {
        url: `${SITE_URL}/uz/blog`,
        changeFrequency: 'weekly',
        priority: 0.7,
      },
    ];
  }
}
