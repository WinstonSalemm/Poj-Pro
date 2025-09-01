import { test, expect } from '@playwright/test';

// Minimal happy-path smoke: success page renders and tracks purchase safely
// This avoids coupling to cart UI while still exercising the success flow.

test('Cart success page renders with params', async ({ page }) => {
  const url = 'http://localhost:3000/cart/success?orderId=ORDER-123&total=100000';
  const res = await page.goto(url, { waitUntil: 'domcontentloaded' });
  expect(res?.ok()).toBeTruthy();
  await expect(page.getByText('Order placed')).toBeVisible();
  await expect(page.getByText('ORDER-123')).toBeVisible();
  // currency text should appear in UZS
  await expect(page.getByText(/UZS/)).toBeVisible();
});
