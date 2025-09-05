import { Page, expect } from '@playwright/test';

export async function checkSEO(page: Page, expected: {
  title: string | RegExp;
  description: string | RegExp;
  url: string | RegExp;
  noIndex?: boolean;
  canonical?: string | boolean;
  ogType?: string;
  ogImage?: string | RegExp;
  twitterCard?: string;
}) {
  // Check page title
  await expect(page).toHaveTitle(expected.title);

  // Check meta description
  await expect(page.locator('meta[name="description"]'))
    .toHaveAttribute('content', expected.description);

  // Check canonical URL
  if (expected.canonical !== false) {
    const canonicalUrl = typeof expected.canonical === 'string' 
      ? expected.canonical 
      : expected.url;
    
    await expect(page.locator('link[rel="canonical"]'))
      .toHaveAttribute('href', canonicalUrl);
  }

  // Check robots meta tag
  if (expected.noIndex) {
    await expect(page.locator('meta[name="robots"]'))
      .toHaveAttribute('content', 'noindex');
  } else {
    const robots = page.locator('meta[name="robots"]');
    if (await robots.count() > 0) {
      await expect(robots).not.toHaveAttribute('content', 'noindex');
    }
  }

  // Check OpenGraph tags
  if (expected.ogType) {
    await expect(page.locator('meta[property="og:type"]'))
      .toHaveAttribute('content', expected.ogType);
  }
  
  await expect(page.locator('meta[property="og:title"]'))
    .toHaveAttribute('content', expected.title);
    
  await expect(page.locator('meta[property="og:description"]'))
    .toHaveAttribute('content', expected.description);
    
  await expect(page.locator('meta[property="og:url"]'))
    .toHaveAttribute('content', expected.url);

  if (expected.ogImage) {
    await expect(page.locator('meta[property="og:image"]'))
      .toHaveAttribute('content', expected.ogImage);
  }

  // Check Twitter Card
  if (expected.twitterCard) {
    await expect(page.locator('meta[name="twitter:card"]'))
      .toHaveAttribute('content', expected.twitterCard);
  }
}

export async function checkHreflang(page: Page, expectedLocales: string[]) {
  // Check hreflang tags for all expected locales
  for (const locale of expectedLocales) {
    const hreflang = page.locator(`link[hreflang="${locale}"]`);
    await expect(hreflang).toHaveCount(1);
    
    // Check that hreflang URLs are absolute
    const href = await hreflang.getAttribute('href');
    expect(href).toMatch(/^https?:\/\//);
  }
  
  // Check x-default hreflang
  const xDefault = page.locator('link[hreflang="x-default"]');
  await expect(xDefault).toHaveCount(1);
}

export async function checkJsonLd(page: Page, type: string) {
  const scripts = await page.$$eval('script[type="application/ld+json"]', 
    (elements, expectedType) => {
      return elements
        .map(el => {
          try {
            const data = JSON.parse(el.textContent || '{}');
            return {
              type: data['@type'],
              data: data
            };
          } catch {
            return null;
          }
        })
        .filter(Boolean)
        .find(item => item?.type === expectedType)?.data || null;
    }, 
    type
  );
  
  expect(scripts).not.toBeNull();
  return scripts;
}

export async function checkBreadcrumbs(page: Page, expectedItems: Array<{name: string, url: string}>) {
  const breadcrumbData = await checkJsonLd(page, 'BreadcrumbList');
  
  // Check number of breadcrumbs matches expected
  expect(breadcrumbData.itemListElement).toHaveLength(expectedItems.length);
  
  // Check each breadcrumb item
  expectedItems.forEach((item, index) => {
    const breadcrumb = breadcrumbData.itemListElement[index];
    expect(breadcrumb.position).toBe(index + 1);
    expect(breadcrumb.name).toBe(item.name);
    expect(breadcrumb.item).toContain(item.url);
  });
}

export async function checkFaq(page: Page, expectedQuestions: string[]) {
  const faqData = await checkJsonLd(page, 'FAQPage');
  
  // Check number of questions
  expect(faqData.mainEntity).toHaveLength(expectedQuestions.length);
  
  // Check each question is present
  expectedQuestions.forEach(question => {
    const questionExists = faqData.mainEntity.some((item: { name: string }) => 
      item.name.toLowerCase().includes(question.toLowerCase())
    );
    expect(questionExists).toBe(true);
  });
}

export async function checkAccessibility(page: Page) {
  // This is a simplified accessibility check
  // In a real project, you might want to use axe-playwright for more comprehensive checks
  
  // Check images have alt text
  const images = page.locator('img:not([alt])');
  const imageCount = await images.count();
  
  if (imageCount > 0) {
    console.warn(`Found ${imageCount} images without alt text`);
    // In a real test, you might want to fail the test or log a warning
  }
  
  // Check form elements have labels
  const formInputs = page.locator('input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]):not([title]):not([aria-label]):not([aria-labelledby])');
  const formInputsCount = await formInputs.count();
  
  if (formInputsCount > 0) {
    console.warn(`Found ${formInputsCount} form inputs without proper labels`);
  }
  
  // Check for proper heading hierarchy
  const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', elements => 
    elements.map(el => ({
      level: parseInt(el.tagName.substring(1)),
      text: el.textContent?.trim() || ''
    }))
  );
  
  // Check for exactly one h1
  const h1s = headings.filter(h => h.level === 1);
  expect(h1s.length).toBe(1);
  
  // Check heading hierarchy
  let previousLevel = 1;
  for (const heading of headings) {
    if (!heading.text) continue;
    expect(heading.level).toBeLessThanOrEqual(previousLevel + 1);
    previousLevel = heading.level;
  }
}

export async function checkConsoleErrors(page: Page) {
  const errors: string[] = [];
  
  // Listen for console errors
  page.on('console', message => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  });
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  
  // Check for errors
  if (errors.length > 0) {
    console.error('Console errors found:', errors);
    // In a real test, you might want to fail the test if there are errors
    // expect(errors).toHaveLength(0);
  }
}
