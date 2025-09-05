import { test, expect } from '@playwright/test';

test.describe('SEO Implementation', () => {
  const categories = ['ognetushiteli', 'siz', 'pozharnaia-bezopasnost'];
  const locales = ['ru', 'uz', 'en'];

  // Test setup can be added here if needed

  test('should have valid JSON-LD for FAQ', async ({ page }) => {
    for (const locale of locales) {
      for (const category of categories) {
        await page.goto(`http://localhost:3000/${locale === 'ru' ? '' : `${locale}/`}catalog/${category}`);
        
        // Check for FAQ JSON-LD
        const faqJsonLd = await page.locator('script[type="application/ld+json"]')
          .filter({ hasText: 'FAQPage' })
          .first()
          .textContent();
        
        expect(faqJsonLd).toBeTruthy();
        const faqData = JSON.parse(faqJsonLd || '{}');
        expect(faqData['@type']).toBe('FAQPage');
        expect(Array.isArray(faqData.mainEntity)).toBe(true);
        expect(faqData.mainEntity.length).toBeGreaterThan(0);
      }
    }
  });

  test('should have valid BreadcrumbList JSON-LD', async ({ page }) => {
    for (const locale of locales) {
      for (const category of categories) {
        await page.goto(`http://localhost:3000/${locale === 'ru' ? '' : `${locale}/`}catalog/${category}`);
        
        // Check for BreadcrumbList JSON-LD
        const breadcrumbJsonLd = await page.locator('script[type="application/ld+json"]')
          .filter({ hasText: 'BreadcrumbList' })
          .first()
          .textContent();
        
        expect(breadcrumbJsonLd).toBeTruthy();
        const breadcrumbData = JSON.parse(breadcrumbJsonLd || '{}');
        expect(breadcrumbData['@type']).toBe('BreadcrumbList');
        expect(Array.isArray(breadcrumbData.itemListElement)).toBe(true);
        expect(breadcrumbData.itemListElement.length).toBeGreaterThanOrEqual(2);
      }
    }
  });

  test('should have correct metadata', async ({ page }) => {
    for (const locale of locales) {
      for (const category of categories) {
        await page.goto(`http://localhost:3000/${locale === 'ru' ? '' : `${locale}/`}catalog/${category}`);
        
        // Check title and description
        const title = await page.title();
        const description = await page.locator('meta[name="description"]').getAttribute('content');
        const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
        
        expect(title).toBeTruthy();
        expect(description).toBeTruthy();
        expect(canonical).toBeTruthy();
        expect(canonical).toContain(`/catalog/${category}`);
        
        // Check OpenGraph tags
        const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
        const ogDescription = await page.locator('meta[property="og:description"]').getAttribute('content');
        const ogUrl = await page.locator('meta[property="og:url"]').getAttribute('content');
        
        expect(ogTitle).toBe(title);
        expect(ogDescription).toBe(description);
        expect(ogUrl).toContain(`/catalog/${category}`);
      }
    }
  });

  test('should have working CTA buttons', async ({ page }) => {
    for (const locale of locales) {
      for (const category of categories) {
        await page.goto(`http://localhost:3000/${locale === 'ru' ? '' : `${locale}/`}catalog/${category}`);
        
        // Test Buy Now button
        const buyNowButton = page.getByRole('link', { name: /buy now|купить сейчас|sotib olish/i });
        await expect(buyNowButton).toBeVisible();
        await buyNowButton.click();
        await expect(page).toHaveURL(new RegExp(`/${locale === 'ru' ? '' : `${locale}/`}catalog/${category}`));
        
        await page.goBack();
        
        // Test Consult button
        const consultButton = page.getByRole('link', { name: /consult|консультация|maslahat/i });
        await expect(consultButton).toBeVisible();
        await consultButton.click();
        await expect(page).toHaveURL(new RegExp(`/${locale === 'ru' ? '' : `${locale}/`}contacts`));
      }
    }
  });
});
