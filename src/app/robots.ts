import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

// List of paths that should not be indexed
const DISALLOWED_PATHS = [
  '/admin',
  '/admin/*',
  '/api/*',
  '/_next/*',
  '/404',
  '/500',
  '/_error',
  '/cart',
  '/checkout/*',
  '/account/*',
  '/login',
  '/register',
  '/password-reset'
];

// List of allowed sitemaps
const SITEMAPS = [
  `${SITE_URL}/sitemap.xml`,
  // Add more sitemaps if you have them, e.g.:
  // `${SITE_URL}/sitemap-pages.xml`,
  // `${SITE_URL}/sitemap-products.xml`,
  // `${SITE_URL}/sitemap-categories.xml`,
];

export default function robots(): MetadataRoute.Robots {
  const isProduction = process.env.NODE_ENV === 'production';
  const hasSite = Boolean(SITE_URL);

  // In development or if no SITE_URL, disallow all
  if (!isProduction || !hasSite) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    };
  }

  // Production rules
  return {
    rules: [
      // Global allow all
      {
        userAgent: '*',
        allow: '/',
      },
      // Disallow specific paths
      ...DISALLOWED_PATHS.map(path => ({
        userAgent: '*',
        disallow: path,
      })),
      // Allow media files
      {
        userAgent: 'Googlebot-Image',
        allow: '/*',
      },
    ],
    // Add sitemaps
    sitemap: SITEMAPS,
    // Host directive (helps with domain variants)
    host: SITE_URL.replace(/^https?:\/\//, ''),
  };
}
