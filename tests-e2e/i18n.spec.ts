import { test, expect } from '@playwright/test';

// Internationalization tests
// Run with: npm run test:i18n (grep @i18n)
test.describe('Internationalization @i18n', () => {
  const locales = ['ru', 'uz', 'en'] as const;

  test('home pages have correct hreflang and lang attributes', async ({ page }) => {
    for (const locale of locales) {
      await test.step(`Check locale home: /${locale}`, async () => {
        const response = await page.goto(`/${locale}`, { waitUntil: 'domcontentloaded' });
        expect(response?.ok()).toBeTruthy();

        // html lang attribute should reflect current locale
        const htmlLang = await page.locator('html').getAttribute('lang');
        expect(htmlLang?.toLowerCase()).toContain(locale);

        // hreflang links should exist for all locales
        for (const loc of locales) {
          await expect(page.locator(`head link[rel="alternate"][hreflang="${loc}"]`))
            .toHaveAttribute('href', expect.stringContaining(`/${loc}`));
        }

        // x-default should point to default locale (usually ru)
        await expect(page.locator('head link[rel="alternate"][hreflang="x-default"]'))
          .toHaveAttribute('href', expect.stringContaining('/ru'));
      });
    }
  });

  test('category routes are localized and internal links keep locale prefix', async ({ page }) => {
    const category = 'ognetushiteli';
    for (const locale of locales) {
      await test.step(`Check category in ${locale}`, async () => {
        const url = `/${locale}/catalog/${category}`;
        const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
        expect(response?.ok()).toBeTruthy();

        // Canonical should include current locale path
        const canonical = await page.locator('head link[rel="canonical"]').getAttribute('href');
        expect(canonical && canonical.includes(url)).toBeTruthy();

        // Internal links should either be root or keep current locale prefix
        const internalLinks = page.locator('a[href^="/"]:not([href^="//"])');
        const count = await internalLinks.count();
        for (let i = 0; i < Math.min(count, 20); i++) {
          const href = await internalLinks.nth(i).getAttribute('href');
          if (!href) continue;
          if (href.startsWith('#') || href.startsWith('data:')) continue;
          expect(href === '/' || href.startsWith(`/${locale}/`) || href.startsWith(`/${locale}?`)).toBeTruthy();
        }

        // hreflang for all locales for category page
        for (const loc of locales) {
          await expect(page.locator(`head link[rel="alternate"][hreflang="${loc}"]`))
            .toHaveAttribute('href', expect.stringContaining(`/${loc}/catalog/${category}`));
        }
      });
    }
  });
});
