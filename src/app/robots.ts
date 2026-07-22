import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

// Paths that should not be crawled (private, auth, admin, transactional)
const DISALLOWED_PATHS = [
  '/api',
  '/api/*',
  '/debug',
  '/debug/*',
  '/admin',
  '/admin/*',
  '/admin-console',
  '/admin-products',
  '/admin-products-add',
  '/admin-categories-add',
  '/admin-popular-products',
  '/adminProducts',
  '/cart',
  '/cart/*',
  '/login',
  '/register',
  '/profile',
  '/Pbase',
  '/lp',
  '/lp/*',
];

// Crawl delay for different bots (in seconds)
const CRAWL_DELAY = {
  '*': 0.5, // Default delay
  'Googlebot': 0.1,
  'Bingbot': 0.2,
};

// List of allowed sitemaps
const SITEMAPS = [
  `${SITE_URL}/sitemap.xml`,
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
      // Googlebot - optimized rules
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: DISALLOWED_PATHS,
        crawlDelay: CRAWL_DELAY.Googlebot,
      },
      // Bingbot
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: DISALLOWED_PATHS,
        crawlDelay: CRAWL_DELAY.Bingbot,
      },
      // Yandex
      {
        userAgent: 'Yandex',
        allow: '/',
        disallow: DISALLOWED_PATHS,
      },
      // Global allow all with restrictions
      {
        userAgent: '*',
        allow: '/',
        disallow: DISALLOWED_PATHS,
        crawlDelay: CRAWL_DELAY['*'],
      },
      // Allow media files for image bots
      {
        userAgent: 'Googlebot-Image',
        allow: ['/ProductImages/*', '/OtherPics/*', '/CatalogImage/*', '/certificates/*', '/brands/*'],
      },
      {
        userAgent: 'Bingbot-Image',
        allow: ['/ProductImages/*', '/OtherPics/*', '/CatalogImage/*', '/certificates/*', '/brands/*'],
      },
      {
        userAgent: 'YandexImages',
        allow: ['/ProductImages/*', '/OtherPics/*', '/CatalogImage/*', '/certificates/*', '/brands/*'],
      },
    ],
    // Add sitemaps
    sitemap: SITEMAPS,
    // Host directive (helps with domain variants)
    host: SITE_URL.replace(/^https?:\/\//, ''),
  };
}
