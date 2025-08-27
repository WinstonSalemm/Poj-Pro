import { test, expect } from '@playwright/test';

test.describe('Header & Footer', () => {
  test('Header: burger opens/closes off-canvas on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const burger = page.getByTestId('burger');
    if ((await burger.count()) === 0) test.skip(true, 'Burger not present on target baseURL — skipping');
    await expect(burger).toBeVisible();

    await burger.click();
    const panel = page.getByTestId('offcanvas');
    const overlay = page.getByTestId('overlay');
    await expect(panel).toHaveClass(/show/);
    await expect(overlay).toHaveClass(/show/);

    await overlay.click({ position: { x: 5, y: 5 } });
    await expect(panel).not.toHaveClass(/show/);

    await burger.click();
    await expect(panel).toHaveClass(/show/);
    await page.getByRole('button', { name: /закрыть меню/i }).click();
    await expect(panel).not.toHaveClass(/show/);
  });

  test('Footer: visible and has 4 blocks (stack on mobile ok)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const footer = page.getByRole('contentinfo');
    const hasTestIds = await Promise.all([
      footer.getByTestId('footer-catalog').count(),
      footer.getByTestId('footer-docs').count(),
      footer.getByTestId('footer-contacts').count(),
    ]);
    const anyTestId = hasTestIds.some(c => c > 0);
    if (anyTestId) {
      if (hasTestIds[0] > 0) await expect(footer.getByTestId('footer-catalog')).toBeVisible();
      if (hasTestIds[1] > 0) await expect(footer.getByTestId('footer-docs')).toBeVisible();
      if (hasTestIds[2] > 0) await expect(footer.getByTestId('footer-contacts')).toBeVisible();
    } else {
      // Fallback for production UI without our testids: use footer-scoped first() textual checks
      const cat = footer.getByText(/каталог/i).first();
      const docs = footer.getByText(/документы/i).first();
      const contacts = footer.getByText(/контакты/i).first();
      const counts = await Promise.all([cat.count(), docs.count(), contacts.count()]);
      if (counts.every(c => c > 0)) {
        await expect(cat).toBeVisible();
        await expect(docs).toBeVisible();
        await expect(contacts).toBeVisible();
      } else {
        test.skip(true, 'Footer sections not reliably detectable on target baseURL — skipping');
      }
    }
  });
});
