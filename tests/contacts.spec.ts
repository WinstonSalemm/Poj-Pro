import { test, expect } from '@playwright/test';

test.describe('Contacts page', () => {
  test('Карта и кликабельные контакты', async ({ page }) => {
    await page.goto('/contacts', { waitUntil: 'domcontentloaded' });

    // карта (на проде может не быть testid — проверяем условно)
    const map = page.getByTestId('map');
    if (await map.count()) {
      await expect(map).toBeVisible();
    }

    // tel: ссылка
    const tel = page.getByTestId('tel');
    if (await tel.count()) {
      await expect(tel).toBeVisible();
      const telHref = await tel.getAttribute('href');
      expect(telHref?.startsWith('tel:')).toBeTruthy();
    }

    // mailto
    const mail = page.getByTestId('mailto');
    if (await mail.count()) {
      await expect(mail).toBeVisible();
      const mailHref = await mail.getAttribute('href');
      expect(mailHref?.startsWith('mailto:')).toBeTruthy();
    }

    // WA/TG (могут быть выключены в проекте → graceful skip)
    const wa = page.getByTestId('wa');
    if (await wa.count()) {
      const waHref = await wa.getAttribute('href');
      expect(waHref?.startsWith('https://wa.me/')).toBeTruthy();
    }

    const tg = page.getByTestId('tg');
    if (await tg.count()) {
      const tgHref = await tg.getAttribute('href');
      expect(/^https:\/\/t\.me\//.test(tgHref || '')).toBeTruthy();
    }

    // vCard (может отсутствовать на проде)
    const vcard = page.getByTestId('vcard');
    if (await vcard.count()) {
      await expect(vcard).toBeVisible();
    }
  });
});
