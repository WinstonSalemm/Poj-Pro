import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3000';

test.describe('SEO: Home page', () => {
  test('has title, description, canonical and JSON-LD', async ({ page }) => {
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });

    // Title
    await expect(page).toHaveTitle(/POJ PRO/i);

    // Meta description
    const desc = await page.locator('head meta[name="description"]').first().getAttribute('content');
    expect(desc && desc.length).toBeGreaterThan(50);

    // Canonical
    const canonical = await page.locator('head link[rel="canonical"]').first().getAttribute('href');
    expect(canonical).toBeTruthy();

    // JSON-LD
    const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(ld.length).toBeGreaterThan(0);
    const hasOrg = ld.some(t => /"@type"\s*:\s*"Organization"/i.test(t));
    expect(hasOrg).toBeTruthy();
  });

  test('robots.txt and sitemap.xml respond 200', async ({ request }) => {
    const robots = await request.get(`${BASE}/robots.txt`);
    expect(robots.ok()).toBeTruthy();
    const sitemap = await request.get(`${BASE}/sitemap.xml`);
    expect(sitemap.ok()).toBeTruthy();
  });
});
