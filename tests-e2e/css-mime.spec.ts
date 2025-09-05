import { test, expect } from '@playwright/test';

// Helper: find all CSS links in head
async function getCssHrefs(page: import('@playwright/test').Page): Promise<string[]> {
  const hrefs = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('link[rel="stylesheet"][href]')) as HTMLLinkElement[];
    return links.map(l => l.href);
  });
  return hrefs;
}

// Ensure CSS is never referenced as a script or preloaded with as="script"
test('no CSS loaded as <script> or preload(as="script")', async ({ page }) => {
  await page.goto('/');

  const cssScripts = page.locator('script[src$=".css" i]');
  await expect(cssScripts).toHaveCount(0);

  const wrongPreloads = page.locator('link[rel="preload"][href$=".css" i][as="script" i]');
  await expect(wrongPreloads).toHaveCount(0);
});

// Ensure served CSS has correct Content-Type
// We HEAD/GET the first CSS href and verify Content-Type
test('served CSS responds with text/css', async ({ page, request, baseURL }) => {
  await page.goto('/');

  const hrefs = await getCssHrefs(page);
  expect(hrefs.length).toBeGreaterThan(0);

  const target = hrefs[0];
  const url = target.startsWith('http') ? target : `${baseURL?.replace(/\/$/, '') || ''}${target}`;

  const res = await request.get(url);
  expect(res.ok()).toBeTruthy();
  const ct = res.headers()['content-type'] || res.headers()['Content-Type'];
  expect(ct).toBeTruthy();
  expect(ct.toLowerCase()).toContain('text/css');
});
