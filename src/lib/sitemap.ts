import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';
import { prisma } from '@/lib/prisma';
import { getAllPostsAllLocales, getPostAlternates } from '@/lib/blog/loader';
import { CATEGORY_IMAGE_MAP } from '@/constants/categories';
import type { ChangeFrequency, SitemapEntry, StaticRouteConfig } from '@/types/sitemap';

/** Keep in sync with `export const revalidate` in `src/app/sitemap.ts` (must be a literal there). */
export const SITEMAP_REVALIDATE_SECONDS = 3600;

const OGNETUSHITELI_TYPES = ['op', 'ou', 'mpp', 'recharge'] as const;

const STATIC_ROUTES: StaticRouteConfig[] = [
  { path: '/', priority: 1.0, changeFrequency: 'daily', images: ['/images/og-default.jpg'] },
  { path: '/catalog', priority: 0.9, changeFrequency: 'daily' },
  { path: '/promotions', priority: 0.8, changeFrequency: 'daily' },
  { path: '/about', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/contacts', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/documents', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/documents/certificates', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/guide', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/en/blog', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/uz/blog', priority: 0.7, changeFrequency: 'weekly' },
];

function toAbsoluteUrl(pathOrUrl: string): string {
  const raw = String(pathOrUrl || '').trim();
  if (!raw) return SITE_URL;
  if (/^https?:\/\//i.test(raw)) return raw.replace(/\/$/, '') === SITE_URL ? SITE_URL : raw;
  const path = raw.startsWith('/') ? raw : `/${raw}`;
  return `${SITE_URL}${path}`;
}

/**
 * Normalize image paths for sitemap image:image entries.
 * Skips admin/API blob URLs and placeholders that crawlers should not index.
 */
function toPublicImageUrl(raw?: string | null): string | null {
  if (!raw) return null;
  let s = String(raw).trim();
  if (!s) return null;
  if (/^(data:|blob:)/i.test(s)) return null;
  if (/\/api\//i.test(s)) return null;

  if (/^https?:\/\//i.test(s)) {
    try {
      const u = new URL(s);
      if (u.origin.replace(/\/$/, '') !== SITE_URL) return s;
      s = u.pathname;
    } catch {
      return null;
    }
  }

  s = s.replace(/^\.\/+/, '').replace(/^public[\\/]/i, '');
  if (!/[\\/]/.test(s)) s = `ProductImages/${s}`;
  if (!s.startsWith('/')) s = `/${s}`;

  // Skip known placeholders / empty fallbacks
  if (/product2photo|placeholder/i.test(s)) return null;

  return toAbsoluteUrl(s);
}

function entry(
  path: string,
  opts: {
    lastModified?: string | Date;
    changeFrequency?: ChangeFrequency;
    priority?: number;
    images?: Array<string | null | undefined>;
    alternates?: SitemapEntry['alternates'];
  } = {}
): SitemapEntry {
  const images = (opts.images || [])
    .map((img) => (img && /^https?:\/\//i.test(img) ? img : toPublicImageUrl(img)))
    .filter((img): img is string => Boolean(img));

  const uniqueImages = Array.from(new Set(images)).slice(0, 10);

  return {
    url: toAbsoluteUrl(path),
    lastModified: opts.lastModified ?? new Date(),
    changeFrequency: opts.changeFrequency ?? 'weekly',
    priority: opts.priority ?? 0.5,
    ...(opts.alternates ? { alternates: opts.alternates } : {}),
    ...(uniqueImages.length > 0 ? { images: uniqueImages } : {}),
  };
}

function getStaticPages(): SitemapEntry[] {
  const blogAlternates = {
    languages: {
      en: toAbsoluteUrl('/en/blog'),
      uz: toAbsoluteUrl('/uz/blog'),
      'x-default': toAbsoluteUrl('/en/blog'),
    },
  };

  return STATIC_ROUTES.map((route) =>
    entry(route.path, {
      priority: route.priority,
      changeFrequency: route.changeFrequency,
      images: route.images,
      ...(route.path === '/en/blog' || route.path === '/uz/blog'
        ? { alternates: blogAlternates }
        : {}),
    })
  );
}

function getOgnetushiteliTypePages(): SitemapEntry[] {
  const ogImage = CATEGORY_IMAGE_MAP['fire-extinguishers']
    ? `/CatalogImage/${CATEGORY_IMAGE_MAP['fire-extinguishers']}`
    : undefined;

  return OGNETUSHITELI_TYPES.map((type) =>
    entry(`/catalog/ognetushiteli/type/${type}`, {
      priority: 0.8,
      changeFrequency: 'weekly',
      images: ogImage ? [ogImage] : undefined,
    })
  );
}

async function getCategoryPages(): Promise<SitemapEntry[]> {
  try {
    const categories = await prisma.category.findMany({
      where: {
        products: { some: { isActive: true } },
      },
      select: {
        slug: true,
        image: true,
        products: {
          where: { isActive: true },
          select: { updatedAt: true },
          orderBy: { updatedAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { slug: 'asc' },
    });

    return categories
      .filter((c) => Boolean(c.slug))
      .map((category) => {
        const mapped = CATEGORY_IMAGE_MAP[category.slug];
        const catalogImage = mapped ? `/CatalogImage/${mapped}` : null;
        const dbImage = toPublicImageUrl(category.image);

        return entry(`/catalog/${category.slug}`, {
          lastModified: category.products[0]?.updatedAt ?? new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
          images: [catalogImage, dbImage],
        });
      });
  } catch (error) {
    console.error('[sitemap] Failed to load categories:', error);
    return [];
  }
}

async function getProductPages(): Promise<SitemapEntry[]> {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        category: { isNot: null },
      },
      select: {
        slug: true,
        updatedAt: true,
        category: { select: { slug: true } },
        images: {
          orderBy: { order: 'asc' },
          take: 5,
          select: { url: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return products
      .filter((p) => p.slug && p.category?.slug)
      .map((p) =>
        entry(`/catalog/${p.category!.slug}/${p.slug}`, {
          lastModified: p.updatedAt,
          changeFrequency: 'weekly',
          priority: 0.7,
          images: p.images.map((img) => img.url),
        })
      );
  } catch (error) {
    console.error('[sitemap] Failed to load products:', error);
    return [];
  }
}

function getBlogPages(): SitemapEntry[] {
  try {
    const items = getAllPostsAllLocales();
    return items.map(({ locale, post }) => {
      const path = `/${locale}/blog/${post.slug}`;
      const alts = getPostAlternates(post.slug);
      const languages = Object.fromEntries(
        Object.entries(alts).map(([loc, p]) => [loc, toAbsoluteUrl(p)])
      );
      const xDefault = alts.en ?? alts.uz ?? path;
      languages['x-default'] = toAbsoluteUrl(xDefault);

      const lastModified = post.frontmatter.date
        ? new Date(post.frontmatter.date)
        : new Date();

      return entry(path, {
        lastModified: Number.isNaN(lastModified.getTime()) ? new Date() : lastModified,
        changeFrequency: 'monthly',
        priority: 0.65,
        images: post.frontmatter.cover ? [post.frontmatter.cover] : undefined,
        alternates: { languages },
      });
    });
  } catch (error) {
    console.error('[sitemap] Failed to load blog posts:', error);
    return [];
  }
}

function isValidSitemapUrl(url: string): boolean {
  if (!url.startsWith('http')) return false;
  if (url.includes('?') || url.includes('#')) return false;
  try {
    const parsed = new URL(url);
    return parsed.origin.replace(/\/$/, '') === SITE_URL;
  } catch {
    return false;
  }
}

/**
 * Build the full public sitemap for search engines.
 * Only indexable storefront URLs are included (no admin/cart/auth).
 */
export async function buildSitemap(): Promise<MetadataRoute.Sitemap> {
  const [categoryPages, productPages] = await Promise.all([
    getCategoryPages(),
    getProductPages(),
  ]);

  const allPages: SitemapEntry[] = [
    ...getStaticPages(),
    ...getOgnetushiteliTypePages(),
    ...categoryPages,
    ...productPages,
    ...getBlogPages(),
  ];

  const filtered = allPages.filter((page) => isValidSitemapUrl(page.url));

  // Prefer first occurrence (static/higher-priority sections come first)
  const unique = Array.from(new Map(filtered.map((page) => [page.url, page])).values());

  return unique.sort((a, b) => {
    const pa = a.priority ?? 0;
    const pb = b.priority ?? 0;
    if (pb !== pa) return pb - pa;
    return a.url.localeCompare(b.url);
  });
}
