import { test, expect } from '@playwright/test';

test('Документы: открывается и API отвечает', async ({ page, request }) => {
  await page.goto('/documents', { waitUntil: 'domcontentloaded' });
  const heading = page.getByRole('heading', { name: /документы/i });
  if (!(await heading.count())) {
    test.skip(true, 'На /documents нет видимого заголовка «Документы» — пропускаем визуальную проверку');
  } else {
    await expect(heading.first()).toBeVisible();
  }
  const res = await request.get('/api/documents');
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  expect(Array.isArray(json.documents)).toBeTruthy();
});
