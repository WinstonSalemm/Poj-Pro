import { test, expect } from '@playwright/test';
// Quarantine: /api/products is not available anymore
test.skip(true, 'Legacy /api/products tests are quarantined');

const LOCALE = process.env.TEST_LOCALE ?? 'ru';
const PER = Number(process.env.TEST_PER ?? 5);

test.describe('API /api/products', () => {
  test('list returns data', async ({ request }) => {
    const res = await request.get(`/api/products?locale=${LOCALE}&per=${PER}`);
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    expect(json).toHaveProperty('data');
    expect(Array.isArray(json.data)).toBeTruthy();
  });

  test('item returns full payload', async ({ request }) => {
    const resList = await request.get(`/api/products?locale=${LOCALE}&per=1`);
    const list = await resList.json();
    
    // Skip if no products found
    test.skip(!list.data?.length, 'No products found to test');
    
    const slug = list.data[0].slug;
    const resItem = await request.get(`/api/products/${slug}?locale=${LOCALE}`);
    
    expect(resItem.ok()).toBeTruthy();
    const item = await resItem.json();
    expect(item).toHaveProperty('slug', slug);
    expect(item).toHaveProperty('title');
  });
});
