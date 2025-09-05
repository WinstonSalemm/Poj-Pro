import { test, expect, Page } from '@playwright/test';

// Env-configurable URLs
const BASE = process.env.E2E_BASE_URL || 'http://localhost:3000';
const PRODUCT_URL = process.env.E2E_PRODUCT_URL; // e.g. http://localhost:3000/catalog/ognetushiteli/123
const CATEGORY_URL = process.env.E2E_CATEGORY_URL; // e.g. http://localhost:3000/catalog/ognetushiteli

// Utility to wait for a dataLayer event
type DLItem = Record<string, unknown>;
type DLEvent = { event?: string } & DLItem;

async function waitForEvent(page: Page, eventName: string, timeout = 5000) {
  return await page.waitForFunction(
    (name: string) => {
      const w = window as unknown as { __pushedEvents?: DLEvent[] };
      return Array.isArray(w.__pushedEvents) && w.__pushedEvents.some((e) => e && e.event === name);
    },
    eventName,
    { timeout }
  );
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const ww = window as unknown as { dataLayer?: unknown[]; __pushedEvents?: DLEvent[] };
    ww.dataLayer = ww.dataLayer || [];
    const dl = ww.dataLayer as unknown[];
    const origPush = (dl as unknown[] & { push?: (v: unknown) => number }).push?.bind(dl) || ((_: unknown) => dl.push(_));
    ww.__pushedEvents = [] as DLEvent[];
    (dl as unknown[] & { push: (arg: unknown) => number }).push = function (arg: unknown) {
      try {
        (ww.__pushedEvents as DLEvent[]).push((arg || {}) as DLEvent);
      } catch {}
      return origPush(arg);
    };
  });
});

test.describe('Analytics via dataLayer', () => {
  test('view_item_list fires on category page', async ({ page }) => {
    test.skip(!CATEGORY_URL, 'Set E2E_CATEGORY_URL to run this test');
    await page.goto(CATEGORY_URL || BASE);
    await waitForEvent(page, 'view_item_list');

    const events = await page.evaluate(() => (window as unknown as { __pushedEvents?: DLEvent[] }).__pushedEvents || []);
    const ev = events.find((e) => e.event === 'view_item_list');
    expect(ev).toBeTruthy();
    const e = ev as unknown as { items: unknown[]; ecomm_pagetype?: string; ecomm_prodid?: unknown; ecomm_totalvalue?: unknown };
    expect(Array.isArray(e.items)).toBeTruthy();
    expect(e.items.length).toBeGreaterThan(0);
    // remarketing fields
    expect(e.ecomm_pagetype).toBe('category');
    expect(Array.isArray(e.ecomm_prodid)).toBeTruthy();
  });

  test('view_item fires on product page', async ({ page }) => {
    test.skip(!PRODUCT_URL, 'Set E2E_PRODUCT_URL to run this test');
    await page.goto(PRODUCT_URL || BASE);
    await waitForEvent(page, 'view_item');

    const events = await page.evaluate(() => (window as unknown as { __pushedEvents?: DLEvent[] }).__pushedEvents || []);
    const ev = events.find((e) => e.event === 'view_item');
    expect(ev).toBeTruthy();
    const e = ev as unknown as { items: unknown[]; ecomm_pagetype?: string; ecomm_prodid?: unknown; ecomm_totalvalue?: unknown };
    expect(Array.isArray(e.items)).toBeTruthy();
    expect(e.items.length).toBe(1);
    // remarketing fields
    expect(e.ecomm_pagetype).toBe('product');
    expect(typeof e.ecomm_prodid === 'string').toBeTruthy();
    // currency might be undefined if not provided
  });

  test('does not fire purchase on category or product views', async ({ page }) => {
    test.skip(!CATEGORY_URL || !PRODUCT_URL, 'Set E2E_CATEGORY_URL and E2E_PRODUCT_URL to run this test');
    await page.goto(CATEGORY_URL!);
    await page.waitForTimeout(500); // allow initial pushes
    let events = await page.evaluate(() => (window as unknown as { __pushedEvents?: DLEvent[] }).__pushedEvents || []);
    expect(events.find((e) => e.event === 'purchase')).toBeFalsy();

    await page.goto(PRODUCT_URL!);
    await waitForEvent(page, 'view_item');
    events = await page.evaluate(() => (window as unknown as { __pushedEvents?: DLEvent[] }).__pushedEvents || []);
    expect(events.find((e) => e.event === 'purchase')).toBeFalsy();
  });

  test('add_to_cart fires when adding from category page', async ({ page }) => {
    test.skip(!CATEGORY_URL, 'Set E2E_CATEGORY_URL to run this test');
    await page.goto(CATEGORY_URL || BASE);
    // wait initial list event
    await waitForEvent(page, 'view_item_list');
    // click first add button on product card
    const addButtons = page.locator('[data-testid="product-card-add"]');
    await expect(addButtons.first()).toBeVisible();
    await addButtons.first().click();
    // expect add_to_cart
    await waitForEvent(page, 'add_to_cart');
    const events = await page.evaluate(() => (window as unknown as { __pushedEvents?: DLEvent[] }).__pushedEvents || []);
    const ev = events.find((e) => e.event === 'add_to_cart');
    expect(ev).toBeTruthy();
  });
});
