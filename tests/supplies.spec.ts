import { test, expect } from '@playwright/test';

test('Поставки: карточки отображаются', async ({ page }) => {
  await page.goto('/supplies', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: /поставки/i })).toBeVisible();
});
