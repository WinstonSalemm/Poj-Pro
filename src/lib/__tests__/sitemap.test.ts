import fs from 'fs';
import os from 'os';
import path from 'path';
import type { PrismaClient } from '@prisma/client';

jest.mock('next/cache', () => ({
  unstable_noStore: jest.fn(),
}));

jest.mock('@/lib/blog/loader', () => ({
  getAllPostsAllLocales: jest.fn(() => []),
  getPostAlternates: jest.fn(() => ({})),
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {},
}));

import {
  buildSitemap,
  isValidSitemapUrl,
  toPublicImageUrl,
} from '@/lib/sitemap';

const { unstable_noStore } = jest.requireMock('next/cache') as {
  unstable_noStore: jest.Mock;
};

function makeLogger() {
  return {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
}

function makePublicDir(files: string[]): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sitemap-public-'));
  for (const rel of files) {
    const full = path.join(dir, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, 'x');
  }
  return dir;
}

describe('toPublicImageUrl', () => {
  const siteUrl = 'https://www.poj-pro.uz';

  test('excludes image URL with whitespace', () => {
    const publicDir = makePublicDir(['images/blog/cover.jpg']);
    expect(
      toPublicImageUrl('/images/blog/ cover.jpg', { siteUrl, publicDir })
    ).toBeNull();
  });

  test('excludes /api/ image URLs', () => {
    const publicDir = makePublicDir([]);
    expect(
      toPublicImageUrl('/api/admin/image/abc', { siteUrl, publicDir })
    ).toBeNull();
  });

  test('excludes foreign origin', () => {
    const publicDir = makePublicDir([]);
    expect(
      toPublicImageUrl('https://cdn.example.com/a.jpg', { siteUrl, publicDir })
    ).toBeNull();
  });

  test('keeps valid same-origin public image', () => {
    const publicDir = makePublicDir(['CatalogImage/ognetushiteli.png']);
    expect(
      toPublicImageUrl('/CatalogImage/ognetushiteli.png', { siteUrl, publicDir })
    ).toBe('https://www.poj-pro.uz/CatalogImage/ognetushiteli.png');
  });

  test('excludes missing public file', () => {
    const publicDir = makePublicDir([]);
    expect(
      toPublicImageUrl('/images/og-default.jpg', { siteUrl, publicDir })
    ).toBeNull();
  });
});

describe('isValidSitemapUrl', () => {
  const siteUrl = 'https://www.poj-pro.uz';

  test('rejects query and hash', () => {
    expect(isValidSitemapUrl(`${siteUrl}/catalog?x=1`, siteUrl)).toBe(false);
    expect(isValidSitemapUrl(`${siteUrl}/catalog#x`, siteUrl)).toBe(false);
  });

  test('rejects foreign origin', () => {
    expect(isValidSitemapUrl('https://evil.example/catalog', siteUrl)).toBe(false);
  });
});

describe('buildSitemap', () => {
  const siteUrl = 'https://www.poj-pro.uz';

  beforeEach(() => {
    unstable_noStore.mockClear();
  });

  test('includes categories and products on successful Prisma queries', async () => {
    const publicDir = makePublicDir(['CatalogImage/ognetushiteli.png']);
    const logger = makeLogger();
    const updatedAt = new Date('2026-01-15T12:00:00.000Z');

    const prisma = {
      category: {
        findMany: jest.fn().mockResolvedValue([
          {
            slug: 'ognetushiteli',
            image: null,
            products: [{ updatedAt }],
          },
        ]),
      },
      product: {
        findMany: jest.fn().mockResolvedValue([
          {
            slug: 'op-5',
            updatedAt,
            category: { slug: 'ognetushiteli' },
            images: [{ url: '/api/admin/image/1' }],
          },
        ]),
      },
    } as unknown as PrismaClient;

    const pages = await buildSitemap({
      prisma,
      siteUrl,
      publicDir,
      logger,
      skipNoStore: true,
      getAllPostsAllLocales: () => [],
      getPostAlternates: () => ({}),
    });

    const urls = pages.map((p) => p.url);
    expect(urls).toContain(`${siteUrl}/catalog/ognetushiteli`);
    expect(urls).toContain(`${siteUrl}/catalog/ognetushiteli/op-5`);
    expect(new Set(urls).size).toBe(urls.length);

    const product = pages.find((p) => p.url.endsWith('/op-5'));
    expect(product?.lastModified).toEqual(updatedAt);

    const category = pages.find((p) => p.url.endsWith('/catalog/ognetushiteli'));
    expect(category?.lastModified).toEqual(updatedAt);

    // /api image excluded; CatalogImage kept on type/category if mapped
    expect(product?.images ?? []).not.toEqual(
      expect.arrayContaining([expect.stringContaining('/api/')])
    );
  });

  test('keeps static URLs and logs when Prisma fails', async () => {
    const publicDir = makePublicDir([]);
    const logger = makeLogger();

    const prisma = {
      category: {
        findMany: jest.fn().mockRejectedValue(new Error('db down categories')),
      },
      product: {
        findMany: jest.fn().mockRejectedValue(new Error('db down products')),
      },
    } as unknown as PrismaClient;

    const pages = await buildSitemap({
      prisma,
      siteUrl,
      publicDir,
      logger,
      skipNoStore: false,
      getAllPostsAllLocales: () => [],
      getPostAlternates: () => ({}),
    });

    const urls = pages.map((p) => p.url);
    expect(urls).toContain(`${siteUrl}/`);
    expect(urls).toContain(`${siteUrl}/catalog`);
    expect(urls).toContain(`${siteUrl}/about`);
    expect(urls.some((u) => /\/catalog\/[^/]+\/[^/]+$/.test(u))).toBe(false);

    expect(logger.error).toHaveBeenCalled();
    const errorMsgs = logger.error.mock.calls.map((c) => String(c[0]));
    expect(errorMsgs.some((m) => m.includes('categories query failed'))).toBe(true);
    expect(errorMsgs.some((m) => m.includes('products query failed'))).toBe(true);
    expect(unstable_noStore).toHaveBeenCalled();
  });

  test('static pages do not receive generation-time lastModified', async () => {
    const publicDir = makePublicDir([]);
    const logger = makeLogger();
    const prisma = {
      category: { findMany: jest.fn().mockResolvedValue([]) },
      product: { findMany: jest.fn().mockResolvedValue([]) },
    } as unknown as PrismaClient;

    const pages = await buildSitemap({
      prisma,
      siteUrl,
      publicDir,
      logger,
      skipNoStore: true,
      getAllPostsAllLocales: () => [],
      getPostAlternates: () => ({}),
    });

    const home = pages.find((p) => p.url === `${siteUrl}/`);
    const about = pages.find((p) => p.url === `${siteUrl}/about`);
    const typePage = pages.find((p) => p.url.includes('/type/op'));

    expect(home?.lastModified).toBeUndefined();
    expect(about?.lastModified).toBeUndefined();
    expect(typePage?.lastModified).toBeUndefined();
  });

  test('blog prefers frontmatter.updated over date for lastModified', async () => {
    const publicDir = makePublicDir(['CatalogImage/ognetushiteli.png']);
    const logger = makeLogger();
    const prisma = {
      category: { findMany: jest.fn().mockResolvedValue([]) },
      product: { findMany: jest.fn().mockResolvedValue([]) },
    } as unknown as PrismaClient;

    const pages = await buildSitemap({
      prisma,
      siteUrl,
      publicDir,
      logger,
      skipNoStore: true,
      getAllPostsAllLocales: () => [
        {
          locale: 'en',
          post: {
            slug: 'vybor-ognetushitelya',
            locale: 'en',
            frontmatter: {
              title: 'Test',
              date: '2025-01-01T00:00:00.000Z',
              updated: '2025-06-01T00:00:00.000Z',
              cover: '/CatalogImage/ognetushiteli.png',
            },
            content: '',
            readingTimeMinutes: 1,
            toc: [],
          },
        },
      ],
      getPostAlternates: () => ({
        en: '/en/blog/vybor-ognetushitelya',
        uz: '/uz/blog/vybor-ognetushitelya',
      }),
    });

    const blog = pages.find((p) => p.url.endsWith('/en/blog/vybor-ognetushitelya'));
    expect(blog?.lastModified).toEqual(new Date('2025-06-01T00:00:00.000Z'));
    expect(blog?.images).toEqual([
      `${siteUrl}/CatalogImage/ognetushiteli.png`,
    ]);
  });

  test('final URLs are unique and exclude query/hash', async () => {
    const publicDir = makePublicDir([]);
    const logger = makeLogger();
    const prisma = {
      category: {
        findMany: jest.fn().mockResolvedValue([
          { slug: 'ognetushiteli', image: null, products: [] },
          { slug: 'ognetushiteli', image: null, products: [] },
        ]),
      },
      product: { findMany: jest.fn().mockResolvedValue([]) },
    } as unknown as PrismaClient;

    const pages = await buildSitemap({
      prisma,
      siteUrl,
      publicDir,
      logger,
      skipNoStore: true,
      getAllPostsAllLocales: () => [],
      getPostAlternates: () => ({}),
    });

    const urls = pages.map((p) => p.url);
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls.every((u) => !u.includes('?') && !u.includes('#'))).toBe(true);
  });
});
