import { test, expect } from '@playwright/test';
const routes = ['/', '/catalog', '/documents', '/contacts', '/supplies'];

for (const path of routes) {
  test(`Route ${path} открывается`, async ({ page }) => {
    const res = await page.goto(path, { waitUntil: 'domcontentloaded' });
    expect(res?.ok()).toBeTruthy();
  });
}
