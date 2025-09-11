import { test, expect, type Page } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:3000';

// Helper to parse all JSON-LD scripts on page
async function getJsonLdTypes(page: Page) {
  const types = await page.$$eval('script[type="application/ld+json"]', (nodes: Element[]) => {
    const result: string[] = [];
    for (const n of nodes as HTMLScriptElement[]) {
      try {
        const data = JSON.parse((n as HTMLScriptElement).textContent || 'null');
        if (!data) continue;
        const collect = (obj: any) => {
          if (!obj) return;
          if (typeof obj === 'object') {
            if (obj['@type']) result.push(String(obj['@type']));
            for (const v of Object.values(obj)) collect(v as any);
          }
        };
        collect(data);
      } catch {}
    }
    return result;
  });
  return types;
}

// This suite assumes the app is running on BASE

test.describe('LP removed and category hard-refresh works', () => {
  test('GET /lp/ognetushiteli-tashkent redirects to /catalog', async ({ page }) => {
    await page.goto(`${BASE}/lp/ognetushiteli-tashkent`, { waitUntil: 'domcontentloaded' });
    expect(page.url()).toContain('/catalog');
  });

  test('Category /catalog/ognetushiteli renders content and JSON-LD; no vite artifacts', async ({ page }) => {
    await page.goto(`${BASE}/catalog/ognetushiteli`, { waitUntil: 'domcontentloaded' });

    // H1 check
    const h1 = await page.locator('h1').first().innerText();
    expect(h1.toLowerCase()).toContain('огнетушители');

    // No vite/dev server markers
    const html = await page.content();
    expect(html).not.toMatch(/localhost:5173|\bvite\b|vite\/deps|react_refresh/i);

    // JSON-LD presence
    const types = await getJsonLdTypes(page);
    expect(types.join(',')).toMatch(/BreadcrumbList/);
    expect(types.join(',')).toMatch(/FAQPage/);
  });
});
