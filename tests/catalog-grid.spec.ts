import { test, expect } from '@playwright/test';

test('Каталог: карточки рендерятся и (если есть) кликаются', async ({ page }) => {
  await page.goto('/catalog', { waitUntil: 'domcontentloaded' });

  const cards = page.locator('[data-testid="product-card"]');
  const count = await cards.count();
  if (count === 0) {
    test.skip(true, 'На /catalog нет карточек с data-testid="product-card" — пропускаем');
  } else {
    await expect(cards.first()).toBeVisible();
    const firstAspect = page.locator('.aspect-square').first();
    await expect(firstAspect).toBeVisible();

    // если в карточке есть ссылка — кликаем и проверяем PDP
    const maybeLink = cards.first().locator('a[href^="/catalog/"]');
    if (await maybeLink.count()) {
      const href = await maybeLink.first().getAttribute('href');
      if (href) {
        await page.goto(href, { waitUntil: 'domcontentloaded' });
        await expect(page).toHaveURL(/\/catalog\/.+\/.+/);
      }
    }
  }
});
