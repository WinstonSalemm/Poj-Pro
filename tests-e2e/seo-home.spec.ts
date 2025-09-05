import { test, expect } from '@playwright/test';

test.describe('SEO: Home Page', () => {
  const locales = ['ru', 'uz', 'en'];
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  locales.forEach(locale => {
    test(`[${locale.toUpperCase()}] should have valid SEO metadata`, async ({ page }) => {
      const url = `/${locale}`;
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      
      // Check page title
      await expect(page).toHaveTitle(/[\w\s-]+\| POJ-PRO\.UZ/);
      
      // Check meta description
      const metaDescription = page.locator('meta[name="description"]');
      await expect(metaDescription).toHaveAttribute('content', expect.stringMatching(/[\w\s-]+/));
      
      // Check canonical URL
      const canonical = page.locator('link[rel="canonical"]');
      await expect(canonical).toHaveAttribute('href', expect.stringContaining(url));
      
      // Check hreflang tags
      const hreflangs = page.locator('link[rel="alternate"][hreflang]');
      await expect(hreflangs).toHaveCount(locales.length);
      
      locales.forEach(async loc => {
        const hreflang = page.locator(`link[hreflang="${loc}"]`);
        await expect(hreflang).toHaveAttribute('href', expect.stringContaining(`/${loc}`));
      });
      
      // Check x-default hreflang
      const xDefault = page.locator('link[hreflang="x-default"]');
      await expect(xDefault).toHaveAttribute('href', expect.stringContaining('/ru'));
      
      // Check OpenGraph tags
      await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'website');
      await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', expect.stringContaining(url));
      await expect(page.locator('meta[property="og:title"]')).toBeVisible();
      await expect(page.locator('meta[property="og:description"]')).toBeVisible();
      await expect(page.locator('meta[property="og:image"]')).toBeVisible();
      
      // Check Twitter card
      await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
      await expect(page.locator('meta[name="twitter:title"]')).toBeVisible();
      await expect(page.locator('meta[name="twitter:description"]')).toBeVisible();
      
      // Check for main content sections
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(page.getByRole('heading', { level: 2 })).not.toHaveCount(0);
      
      // Check for featured categories
      const categoryLinks = page.locator('a[href*="/catalog/"]');
      await expect(categoryLinks).not.toHaveCount(0);
      
      // Verify all internal links have the correct locale prefix
      const internalLinks = page.locator('a[href^="/"]:not([href^="//"]):not([href^="http"])');
      const count = await internalLinks.count();
      
      for (let i = 0; i < Math.min(count, 10); i++) {
        const href = await internalLinks.nth(i).getAttribute('href');
        // Skip anchor links and data URLs
        if (href && !href.startsWith('#') && !href.startsWith('data:')) {
          // Check if link starts with locale or is a root path
          expect(href === '/' || href.startsWith(`/${locale}/`) || href.startsWith(`/${locale}?`)).toBeTruthy();
        }
      }
    });
  });

  test('should have valid JSON-LD for organization', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Get all JSON-LD scripts
    const scripts = await page.$$eval('script[type="application/ld+json"]', 
      (elements) => elements.map(el => JSON.parse(el.textContent || '{}'))
    );
    
    // Check Organization JSON-LD
    const orgData = scripts.find(script => script['@type'] === 'Organization');
    expect(orgData).toBeDefined();
    expect(orgData?.name).toBe('POJ-PRO.UZ');
    expect(orgData?.url).toBe(baseUrl);
    expect(orgData?.logo).toContain('/images/logo.png');
    
    // Check WebSite JSON-LD
    const websiteData = scripts.find(script => script['@type'] === 'WebSite');
    expect(websiteData).toBeDefined();
    expect(websiteData?.url).toBe(baseUrl);
    expect(websiteData?.name).toMatch(/POJ-PRO/);
  });
});
