import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const locales = ['ru', 'uz', 'en'] as const;

function withLocale(path: string, locale: string) {
  // assumes i18n prefix in path like /ru/...; adjust if your routing differs
  if (!path.startsWith('/')) path = `/${path}`;
  if (path.startsWith(`/${locale}/`)) return path;
  if (path === '/') return `/${locale}`;
  return `/${locale}${path}`;
}

test.describe('SEO JSON-LD and Meta @seo', () => {
  for (const locale of locales) {
    test(`Category JSON-LD present and valid (${locale}) @seo`, async ({ page }) => {
      const url = `${BASE_URL}${withLocale('/catalog/ognetushiteli', locale)}`;
      await page.goto(url, { waitUntil: 'domcontentloaded' });

      // Wait for JSON-LD scripts to appear
      const scripts = page.locator('script[type="application/ld+json"]');
      expect(await scripts.count()).toBeGreaterThan(0);

      const jsons = await scripts.allTextContents();
      const parsed = jsons.map((t) => {
        try {
          return JSON.parse(t);
        } catch {
          return null;
        }
      }).filter(Boolean) as Array<Record<string, unknown>>;

      // Find ItemList and BreadcrumbList
      const itemList = parsed.find((j) => (j as Record<string, unknown>)['@type'] === 'ItemList') as unknown as { itemListElement?: unknown[] } | undefined;
      const breadcrumb = parsed.find((j) => (j as Record<string, unknown>)['@type'] === 'BreadcrumbList');
      expect(itemList).toBeTruthy();
      expect(breadcrumb).toBeTruthy();
      if (!itemList) throw new Error('ItemList JSON-LD missing');
      expect(Array.isArray(itemList.itemListElement)).toBeTruthy();
      expect((itemList.itemListElement as unknown[]).length).toBeGreaterThan(0);

      // Basic meta checks
      await expect(page).toHaveTitle(/.+/);
      const desc = await page.locator('head meta[name="description"]').getAttribute('content');
      expect(desc && desc.length > 0).toBeTruthy();
      const canonical = await page.locator('head link[rel="canonical"]').getAttribute('href');
      expect(canonical && canonical.startsWith('http')).toBeTruthy();
      const hreflangs = await page.locator('head link[rel="alternate"][hreflang]').all();
      expect(hreflangs.length).toBeGreaterThan(0);
    });

    test(`Product JSON-LD present and valid (${locale}) @seo`, async ({ page }) => {
      // pick a known product slug for each locale if different
      const productSlug = 'op-5';
      const url = `${BASE_URL}${withLocale(`/catalog/ognetushiteli/${productSlug}`, locale)}`;
      await page.goto(url, { waitUntil: 'domcontentloaded' });

      const scripts = page.locator('script[type="application/ld+json"]');
      expect(await scripts.count()).toBeGreaterThan(0);
      const jsons = await scripts.allTextContents();
      const parsed = jsons.map((t) => {
        try { return JSON.parse(t); } catch { return null; }
      }).filter(Boolean) as Array<Record<string, unknown>>;

      const product = parsed.find((j) => (j as Record<string, unknown>)['@type'] === 'Product') as unknown as { name?: unknown; offers?: { price?: number; priceCurrency?: string; availability?: string; url?: string } } | undefined;
      expect(product).toBeTruthy();
      if (!product) throw new Error('Product JSON-LD missing');
      expect(typeof product.name).toBe('string');
      expect(product.offers).toBeTruthy();
      const offers = product.offers!;
      expect(offers.price!).toBeGreaterThan(0);
      expect(offers.priceCurrency).toBe('UZS');
      expect(['https://schema.org/InStock','https://schema.org/OutOfStock','https://schema.org/PreOrder']).toContain(offers.availability);
      expect(typeof offers.url).toBe('string');

      // Meta
      await expect(page).toHaveTitle(/.+/);
      const canonical = await page.locator('head link[rel="canonical"]').getAttribute('href');
      expect(canonical && canonical.startsWith('http')).toBeTruthy();
      const hreflangs = await page.locator('head link[rel="alternate"][hreflang]').all();
      expect(hreflangs.length).toBeGreaterThan(0);
    });
  }
});
