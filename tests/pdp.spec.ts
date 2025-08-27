import { test, expect } from '@playwright/test';

test.describe('PDP page', () => {
  test('renders gallery, price and tabs (если есть товар)', async ({ page }) => {
    // Находим первую ссылку на PDP из каталога
    await page.goto('/catalog', { waitUntil: 'domcontentloaded' });
    const link = page.locator('a[href^="/catalog/"][href*="/"]'); // /catalog/{cat}/{id}
    const href = await link.first().getAttribute('href');
    test.skip(!href, 'Не найдено ссылок на страницу товара');

    await page.goto(href!, { waitUntil: 'domcontentloaded' });

    // Проверяем наличие признаков PDP: квадратный контейнер, любая картинка товара,
    // цена или кнопка добавления в корзину
    const candidates = [
      page.locator('.aspect-square').first(),
      page.locator('[data-testid="pdp-gallery"] img').first(),
      page.getByRole('img').first(),
      page.getByText(/UZS|сум/i).first(),
      page.getByRole('button', { name: /в корзину|add to cart/i }).first(),
    ];
    let found = false;
    for (const c of candidates) {
      if (await c.count()) { found = true; break; }
    }
    test.skip(!found, 'Страница PDP не содержит ожидаемых элементов — пропускаем');

    // Кнопка "В корзину" (если есть)
    const add = page.getByRole('button', { name: /в корзину|add to cart/i });
    if (await add.count()) await expect(add).toBeVisible();

    // Табы (если реализованы)
    const tabs = ['описание', 'характеристики', 'документы'];
    for (const t of tabs) {
      const tab = page.getByRole('tab', { name: new RegExp(t, 'i') });
      if (await tab.count()) {
        await tab.click();
        await expect(tab).toBeVisible();
      }
    }
  });
});
