import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  const hasSite = Boolean(SITE_URL);
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Disallow hidden admin Products area from indexing
      disallow: ['/adminProducts'],
    },
    ...(hasSite ? { sitemap: `${SITE_URL}/sitemap.xml`, host: SITE_URL } : {}),
  };
}
