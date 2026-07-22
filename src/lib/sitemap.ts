import fs from 'fs';
import path from 'path';
import { unstable_noStore as noStore } from 'next/cache';
import type { MetadataRoute } from 'next';
import type { PrismaClient } from '@prisma/client';
import { SITE_URL } from '@/lib/site';
import { prisma as defaultPrisma } from '@/lib/prisma';
import {
  getAllPostsAllLocales as defaultGetAllPostsAllLocales,
  getPostAlternates as defaultGetPostAlternates,
} from '@/lib/blog/loader';
import { CATEGORY_IMAGE_MAP } from '@/constants/categories';
import type { ChangeFrequency, SitemapEntry, StaticRouteConfig } from '@/types/sitemap';

/** Keep in sync with `export const revalidate` in `src/app/sitemap.ts` (must be a literal there). */
export const SITEMAP_REVALIDATE_SECONDS = 3600;

const OGNETUSHITELI_TYPES = ['op', 'ou', 'mpp', 'recharge'] as const;

const STATIC_ROUTES: StaticRouteConfig[] = [
  // No image: /images/og-default.jpg is missing from public/
  { path: '/', priority: 1.0, changeFrequency: 'daily' },
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

export type SitemapLogger = {
  info: (message: string, meta?: Record<string, unknown>) => void;
  warn: (message: string, meta?: Record<string, unknown>) => void;
  error: (message: string, meta?: Record<string, unknown>) => void;
};

export type SitemapDeps = {
  prisma?: PrismaClient;
  siteUrl?: string;
  publicDir?: string;
  getAllPostsAllLocales?: typeof defaultGetAllPostsAllLocales;
  getPostAlternates?: typeof defaultGetPostAlternates;
  logger?: SitemapLogger;
  /** When true, skip next/cache noStore (for unit tests). */
  skipNoStore?: boolean;
};

const defaultLogger: SitemapLogger = {
  info: (message, meta) => {
    // warn survives next.config removeConsole in production (log does not)
    console.warn(`[sitemap] ${message}`, meta ?? '');
  },
  warn: (message, meta) => {
    console.warn(`[sitemap] ${message}`, meta ?? '');
  },
  error: (message, meta) => {
    console.error(`[sitemap] ${message}`, meta ?? '');
  },
};

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export function toAbsoluteUrl(pathOrUrl: string, siteUrl: string = SITE_URL): string {
  const raw = String(pathOrUrl || '').trim();
  if (!raw) return siteUrl;
  if (/^https?:\/\//i.test(raw)) return raw;
  const normalized = raw.startsWith('/') ? raw : `/${raw}`;
  return `${siteUrl}${normalized}`;
}

function hasWhitespace(value: string): boolean {
  return /\s/.test(value);
}

function resolvePublicFilePath(pathname: string, publicDir: string): string | null {
  const rel = pathname.replace(/^\/+/, '').replace(/\\/g, '/');
  if (!rel || rel.includes('..')) return null;
  const full = path.resolve(publicDir, rel);
  const root = path.resolve(publicDir);
  if (!full.startsWith(root + path.sep) && full !== root) return null;
  return full;
}

/**
 * Normalize and validate image paths for sitemap image:image entries.
 * Rejects empty values, whitespace, /api/ blobs, foreign origins, and missing public files.
 */
export function toPublicImageUrl(
  raw?: string | null,
  opts: { siteUrl?: string; publicDir?: string; requirePublicFile?: boolean } = {}
): string | null {
  const siteUrl = opts.siteUrl ?? SITE_URL;
  const publicDir = opts.publicDir ?? path.join(process.cwd(), 'public');
  const requirePublicFile = opts.requirePublicFile !== false;

  if (!raw) return null;
  let s = String(raw).trim();
  if (!s) return null;
  if (hasWhitespace(s)) return null;
  if (/^(data:|blob:)/i.test(s)) return null;
  if (/\/api\//i.test(s)) return null;

  if (/^https?:\/\//i.test(s)) {
    try {
      const u = new URL(s);
      if (u.origin.replace(/\/$/, '') !== siteUrl.replace(/\/$/, '')) return null;
      if (hasWhitespace(u.pathname)) return null;
      s = u.pathname;
    } catch {
      return null;
    }
  }

  s = s.replace(/^\.\/+/, '').replace(/^public[\\/]/i, '');
  if (!/[\\/]/.test(s)) s = `ProductImages/${s}`;
  if (!s.startsWith('/')) s = `/${s}`;
  if (hasWhitespace(s)) return null;
  if (/product2photo|placeholder/i.test(s)) return null;

  if (requirePublicFile) {
    const full = resolvePublicFilePath(s, publicDir);
    if (!full || !fs.existsSync(full)) return null;
  }

  return toAbsoluteUrl(s, siteUrl);
}

function entry(
  pathName: string,
  opts: {
    siteUrl: string;
    publicDir: string;
    lastModified?: string | Date;
    changeFrequency?: ChangeFrequency;
    priority?: number;
    images?: Array<string | null | undefined>;
    alternates?: SitemapEntry['alternates'];
  }
): SitemapEntry {
  const images = (opts.images || [])
    .map((img) =>
      toPublicImageUrl(img, { siteUrl: opts.siteUrl, publicDir: opts.publicDir })
    )
    .filter((img): img is string => Boolean(img));

  const uniqueImages = Array.from(new Set(images)).slice(0, 10);

  const result: SitemapEntry = {
    url: toAbsoluteUrl(pathName, opts.siteUrl),
    changeFrequency: opts.changeFrequency ?? 'weekly',
    priority: opts.priority ?? 0.5,
  };

  if (opts.lastModified != null) {
    const date =
      opts.lastModified instanceof Date
        ? opts.lastModified
        : new Date(opts.lastModified);
    if (!Number.isNaN(date.getTime())) {
      result.lastModified = date;
    }
  }

  if (opts.alternates) result.alternates = opts.alternates;
  if (uniqueImages.length > 0) result.images = uniqueImages;

  return result;
}

function getStaticPages(siteUrl: string, publicDir: string): SitemapEntry[] {
  const blogAlternates = {
    languages: {
      en: toAbsoluteUrl('/en/blog', siteUrl),
      uz: toAbsoluteUrl('/uz/blog', siteUrl),
      'x-default': toAbsoluteUrl('/en/blog', siteUrl),
    },
  };

  return STATIC_ROUTES.map((route) =>
    entry(route.path, {
      siteUrl,
      publicDir,
      priority: route.priority,
      changeFrequency: route.changeFrequency,
      images: route.images,
      ...(route.path === '/en/blog' || route.path === '/uz/blog'
        ? { alternates: blogAlternates }
        : {}),
    })
  );
}

function getOgnetushiteliTypePages(siteUrl: string, publicDir: string): SitemapEntry[] {
  const ogImage = CATEGORY_IMAGE_MAP['fire-extinguishers']
    ? `/CatalogImage/${CATEGORY_IMAGE_MAP['fire-extinguishers']}`
    : undefined;

  return OGNETUSHITELI_TYPES.map((type) =>
    entry(`/catalog/ognetushiteli/type/${type}`, {
      siteUrl,
      publicDir,
      // No synthetic lastModified — omit unless we have a real source
      priority: 0.8,
      changeFrequency: 'weekly',
      images: ogImage ? [ogImage] : undefined,
    })
  );
}

async function getCategoryPages(
  db: PrismaClient,
  siteUrl: string,
  publicDir: string,
  logger: SitemapLogger
): Promise<{ pages: SitemapEntry[]; error: string | null }> {
  try {
    const categories = await db.category.findMany({
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

    logger.info('categories query ok', { count: categories.length });

    const pages = categories
      .filter((c) => Boolean(c.slug))
      .map((category) => {
        const mapped = CATEGORY_IMAGE_MAP[category.slug];
        const catalogImage = mapped ? `/CatalogImage/${mapped}` : null;
        const dbImage = category.image;

        return entry(`/catalog/${category.slug}`, {
          siteUrl,
          publicDir,
          lastModified: category.products[0]?.updatedAt,
          changeFrequency: 'weekly',
          priority: 0.8,
          images: [catalogImage, dbImage],
        });
      });

    return { pages, error: null };
  } catch (error) {
    const msg = errorMessage(error);
    logger.error('categories query failed', {
      stage: 'getCategoryPages',
      selection: 'category.findMany(active products)',
      error: msg,
    });
    return { pages: [], error: msg };
  }
}

async function getProductPages(
  db: PrismaClient,
  siteUrl: string,
  publicDir: string,
  logger: SitemapLogger
): Promise<{ pages: SitemapEntry[]; error: string | null }> {
  try {
    const products = await db.product.findMany({
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

    logger.info('products query ok', { count: products.length });

    const pages = products
      .filter((p) => p.slug && p.category?.slug)
      .map((p) =>
        entry(`/catalog/${p.category!.slug}/${p.slug}`, {
          siteUrl,
          publicDir,
          lastModified: p.updatedAt,
          changeFrequency: 'weekly',
          priority: 0.7,
          images: p.images.map((img) => img.url),
        })
      );

    return { pages, error: null };
  } catch (error) {
    const msg = errorMessage(error);
    logger.error('products query failed', {
      stage: 'getProductPages',
      selection: 'product.findMany(active with category)',
      error: msg,
    });
    return { pages: [], error: msg };
  }
}

function getBlogPages(
  siteUrl: string,
  publicDir: string,
  getAllPostsAllLocales: typeof defaultGetAllPostsAllLocales,
  getPostAlternates: typeof defaultGetPostAlternates,
  logger: SitemapLogger
): SitemapEntry[] {
  try {
    const items = getAllPostsAllLocales();
    return items.map(({ locale, post }) => {
      const pathName = `/${locale}/blog/${post.slug}`;
      const alts = getPostAlternates(post.slug);
      const languages = Object.fromEntries(
        Object.entries(alts).map(([loc, p]) => [loc, toAbsoluteUrl(p, siteUrl)])
      );
      const xDefault = alts.en ?? alts.uz ?? pathName;
      languages['x-default'] = toAbsoluteUrl(xDefault, siteUrl);

      const rawDate = post.frontmatter.updated || post.frontmatter.date;
      const lastModified = rawDate ? new Date(rawDate) : undefined;

      return entry(pathName, {
        siteUrl,
        publicDir,
        lastModified:
          lastModified && !Number.isNaN(lastModified.getTime())
            ? lastModified
            : undefined,
        changeFrequency: 'monthly',
        priority: 0.65,
        images: post.frontmatter.cover ? [post.frontmatter.cover] : undefined,
        alternates: { languages },
      });
    });
  } catch (error) {
    logger.error('blog pages failed', {
      stage: 'getBlogPages',
      selection: 'getAllPostsAllLocales',
      error: errorMessage(error),
    });
    return [];
  }
}

export function isValidSitemapUrl(url: string, siteUrl: string = SITE_URL): boolean {
  if (!url.startsWith('http')) return false;
  if (url.includes('?') || url.includes('#')) return false;
  try {
    const parsed = new URL(url);
    return parsed.origin.replace(/\/$/, '') === siteUrl.replace(/\/$/, '');
  } catch {
    return false;
  }
}

function hasDatabaseUrl(): boolean {
  return Boolean(process.env.DATABASE_URL || process.env.MYSQL_URL);
}

/**
 * Build the full public sitemap for search engines.
 * Only indexable storefront URLs are included (no admin/cart/auth).
 */
export async function buildSitemap(
  deps: SitemapDeps = {}
): Promise<MetadataRoute.Sitemap> {
  const siteUrl = deps.siteUrl ?? SITE_URL;
  const publicDir = deps.publicDir ?? path.join(process.cwd(), 'public');
  const db = deps.prisma ?? defaultPrisma;
  const logger = deps.logger ?? defaultLogger;
  const getAllPostsAllLocales =
    deps.getAllPostsAllLocales ?? defaultGetAllPostsAllLocales;
  const getPostAlternates = deps.getPostAlternates ?? defaultGetPostAlternates;

  logger.info('generation started', {
    stage: 'buildSitemap',
    hasDatabaseUrl: hasDatabaseUrl(),
    // Never log connection strings — only presence flags
    hasMysqlUrl: Boolean(process.env.MYSQL_URL),
  });

  if (!hasDatabaseUrl()) {
    logger.error('database env missing', {
      stage: 'buildSitemap',
      selection: 'env',
      error: 'DATABASE_URL and MYSQL_URL are both unset',
    });
  }

  const [categoryResult, productResult] = await Promise.all([
    getCategoryPages(db, siteUrl, publicDir, logger),
    getProductPages(db, siteUrl, publicDir, logger),
  ]);

  const staticPages = getStaticPages(siteUrl, publicDir);
  const typePages = getOgnetushiteliTypePages(siteUrl, publicDir);
  const blogPages = getBlogPages(
    siteUrl,
    publicDir,
    getAllPostsAllLocales,
    getPostAlternates,
    logger
  );

  const dbFailed = Boolean(categoryResult.error || productResult.error);

  if (dbFailed && !deps.skipNoStore) {
    // Avoid ISR-caching an incomplete sitemap produced after a Prisma failure
    noStore();
    logger.warn('skipping cache after prisma failure', {
      stage: 'buildSitemap',
      categoryError: categoryResult.error,
      productError: productResult.error,
    });
  }

  const allPages: SitemapEntry[] = [
    ...staticPages,
    ...typePages,
    ...categoryResult.pages,
    ...productResult.pages,
    ...blogPages,
  ];

  const filtered = allPages.filter((page) => isValidSitemapUrl(page.url, siteUrl));
  const unique = Array.from(
    new Map(filtered.map((page) => [page.url, page])).values()
  );

  unique.sort((a, b) => {
    const pa = a.priority ?? 0;
    const pb = b.priority ?? 0;
    if (pb !== pa) return pb - pa;
    return a.url.localeCompare(b.url);
  });

  logger.info('generation completed', {
    stage: 'buildSitemap',
    categories: categoryResult.pages.length,
    products: productResult.pages.length,
    static: staticPages.length,
    types: typePages.length,
    blog: blogPages.length,
    totalUrls: unique.length,
    categoryError: categoryResult.error,
    productError: productResult.error,
  });

  return unique;
}
