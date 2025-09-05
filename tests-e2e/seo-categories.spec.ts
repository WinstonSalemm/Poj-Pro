import { test, expect } from '@playwright/test';

test.describe('SEO: Categories', () => {
  const categories = ['ognetushiteli', 'pozharnye-krany', 'pozharnaia-bezopasnost'];
  const locales = ['ru', 'uz', 'en'];
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // Test each category in each locale
  locales.forEach(locale => {
    categories.forEach(category => {
      test(`[${locale.toUpperCase()}] should have valid SEO metadata for category: ${category}`, async ({ page }) => {
        const url = `/${locale}/catalog/${category}`;
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        
        // Check page title
        await expect(page).toHaveTitle(/[\w\s-]+\| POJ-PRO\.UZ/);
        
        // Check meta description
        const metaDescription = page.locator('meta[name="description"]');
        await expect(metaDescription).toHaveAttribute('content', expect.stringMatching(/[\w\s-]+/));
        
        // Check canonical URL
        const canonical = page.locator('link[rel="canonical"]');
        await expect(canonical).toHaveAttribute('href', expect.stringContaining(`/${locale}/catalog/${category}`));
        
        // Check hreflang tags
        locales.forEach(loc => {
          const hreflang = page.locator(`link[hreflang="${loc}"]`);
          expect(hreflang).toHaveAttribute('href', expect.stringContaining(`/${loc}/catalog/${category}`));
        });
        
        // Check OpenGraph tags
        await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'website');
        await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
          'content', 
          expect.stringContaining(`/${locale}/catalog/${category}`)
        );
        
        // Check Twitter card
        await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
        
        // Check for FAQ JSON-LD
        const faqScript = page.locator('script[type="application/ld+json"]:has-text("FAQPage")');
        await expect(faqScript).toBeVisible();
        
        // Check for Breadcrumb JSON-LD
        const breadcrumbScript = page.locator('script[type="application/ld+json"]:has-text("BreadcrumbList")');
        await expect(breadcrumbScript).toBeVisible();
        
        // Check CTA buttons are present and have correct links
        const buyNowButton = page.getByRole('link', { name: /buy now|купить|sotib olish/i });
        await expect(buyNowButton).toBeVisible();
        await expect(buyNowButton).toHaveAttribute('href', expect.stringContaining(`/${locale}/catalog/${category}?modal=order`));
        
        const consultButton = page.getByRole('link', { name: /get consultation|консультация|konsultatsiya/i });
        await expect(consultButton).toBeVisible();
        await expect(consultButton).toHaveAttribute('href', expect.stringContaining(`/${locale}/contacts?subject=`));
      });
    });
  });

  test('should have valid JSON-LD for FAQ and Breadcrumb', async ({ page }) => {
    const testCategory = categories[0];
    const testLocale = locales[0];
    
    await page.goto(`/${testLocale}/catalog/${testCategory}`, { waitUntil: 'domcontentloaded' });
    
    // Get all JSON-LD scripts
    const scripts = await page.$$eval('script[type="application/ld+json"]', 
      (elements) => elements.map(el => JSON.parse(el.textContent || '{}'))
    );
    
    // Check FAQ JSON-LD
    const faqData = scripts.find(script => script['@type'] === 'FAQPage');
    expect(faqData).toBeDefined();
    expect(Array.isArray(faqData?.mainEntity)).toBe(true);
    expect(faqData?.mainEntity.length).toBeGreaterThan(0);
    
    // Check Breadcrumb JSON-LD
    const breadcrumbData = scripts.find(script => script['@type'] === 'BreadcrumbList');
    expect(breadcrumbData).toBeDefined();
    expect(Array.isArray(breadcrumbData?.itemListElement)).toBe(true);
    expect(breadcrumbData?.itemListElement.length).toBeGreaterThan(0);
    
    // Check first breadcrumb is home
    expect(breadcrumbData?.itemListElement[0].name).toMatch(/home|главная|bosh sahifa/i);
    
    // Check last breadcrumb is current category
    const lastBreadcrumb = breadcrumbData?.itemListElement[breadcrumbData.itemListElement.length - 1];
    expect(lastBreadcrumb.item).toContain(`/${testLocale}/catalog/${testCategory}`);
  });
});
