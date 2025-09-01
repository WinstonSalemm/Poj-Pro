import { test, expect } from '@playwright/test';

const pages = ['/', '/contacts', '/documents'];

test.describe('Smoke: core pages respond and render', () => {
  for (const path of pages) {
    test(`GET ${path} renders`, async ({ page }) => {
      const res = await page.goto(`http://localhost:3000${path}`, { waitUntil: 'domcontentloaded' });
      expect(res?.ok()).toBeTruthy();
      // Basic content checks (non-strict to avoid locale variance)
      const bodyText = await page.locator('body').innerText();
      expect(bodyText.length).toBeGreaterThan(10);
    });
  }
});
