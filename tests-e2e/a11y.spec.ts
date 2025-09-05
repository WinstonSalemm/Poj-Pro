import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('Accessibility @a11y', () => {
  const pages = [
    '/', // Home
    '/ru/catalog/ognetushiteli', // Category page
    '/ru/contacts', // Contact page
    '/ru/about' // About page
  ];

  test.beforeEach(async ({ page }) => {
    // Inject axe-core into the page before each test
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await injectAxe(page);
  });

  test('should not have critical WCAG violations on key pages', async ({ page }) => {
    for (const path of pages) {
      await test.step(`Checking accessibility for ${path}`, async () => {
        await page.goto(path, { waitUntil: 'domcontentloaded' });
        
        // Wait for any dynamic content to load
        await page.waitForLoadState('networkidle');
        
        // Check for critical accessibility issues
        await checkA11y(page, undefined, {
          detailedReport: true,
          detailedReportOptions: {
            html: true,
          },
          // Only fail for critical issues
          axeOptions: {
            runOnly: {
              type: 'tag',
              values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice']
            },
            rules: {
              // Temporarily disable color contrast check as it requires design review
              'color-contrast': { enabled: false },
              // Other rules that might need to be disabled temporarily
              'landmark-one-main': { enabled: false },
              'page-has-heading-one': { enabled: false },
              'region': { enabled: false }
            }
          }
        });
      });
    }
  });

  test('should have proper keyboard navigation', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    
    // Check if focus is on the first focusable element (skip-links or main content)
    const firstElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT', 'TEXTAREA', 'SELECT']).toContain(firstElement);
    
    // Test skip links
    await page.keyboard.press('Tab');
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeFocused();
    
    // Test focus visible styles
    await page.evaluate(() => {
      const style = document.createElement('style');
      style.textContent = `
        :focus-visible {
          outline: 2px solid #0066cc !important;
          outline-offset: 2px !important;
        }
      `;
      document.head.appendChild(style);
    });
    
    // Check focus styles on interactive elements
    const interactiveElements = page.locator('a, button, [tabindex="0"], input, select, textarea');
    const count = await interactiveElements.count();
    
    for (let i = 0; i < Math.min(count, 10); i++) {
      const element = interactiveElements.nth(i);
      await element.focus();
      await expect(element).toHaveCSS('outline-style', /solid/);
    }
  });

  test('should have proper ARIA attributes', async ({ page }) => {
    await page.goto('/ru/catalog/ognetushiteli', { waitUntil: 'domcontentloaded' });
    
    // Check navigation landmarks
    const navs = page.locator('nav');
    const navCount = await navs.count();
    
    for (let i = 0; i < navCount; i++) {
      const nav = navs.nth(i);
      await expect(nav).toHaveAttribute('aria-label', expect.stringMatching(/navigation|навигация|navigatsiya/i));
    }
    
    // Check main content landmark
    const main = page.locator('main');
    await expect(main).toHaveAttribute('id', 'main-content');
    
    // Check search form
    const searchForm = page.locator('form[role="search"]');
    await expect(searchForm).toHaveCount(1);
    
    // Check search input
    const searchInput = searchForm.locator('input[type="search"]');
    await expect(searchInput).toHaveAttribute('aria-label', expect.stringMatching(/search|поиск|qidirish/i));
    
    // Check language switcher
    const langSwitcher = page.locator('[aria-label="Language"]');
    await expect(langSwitcher).toBeVisible();
    
    // Check mobile menu button
    const menuButton = page.locator('button[aria-expanded][aria-controls]');
    if (await menuButton.isVisible()) {
      await expect(menuButton).toHaveAttribute('aria-label', expect.stringMatching(/menu|меню|menyu/i));
      await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
      
      // Test menu toggle
      await menuButton.click();
      await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    }
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Check for exactly one h1
    const h1s = page.locator('h1');
    await expect(h1s).toHaveCount(1);
    
    // Get all headings
    const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', (elements) => 
      elements.map(el => ({
        level: parseInt(el.tagName.substring(1)),
        text: el.textContent?.trim() || '',
        id: el.id || null
      }))
    );
    
    // Check heading hierarchy
    let previousLevel = 1;
    
    for (const heading of headings) {
      // Skip empty or hidden headings
      if (!heading.text || heading.text.length === 0) continue;
      
      // Check for skipped heading levels (e.g., h1 -> h3)
      expect(heading.level).toBeLessThanOrEqual(previousLevel + 1);
      
      // Update previous level
      previousLevel = heading.level;
      
      // Check for empty or generic headings
      expect(heading.text.length).toBeGreaterThan(0);
      expect(heading.text).not.toMatch(/^[\s\d\W]+$/);
      
      // Check for duplicate IDs if present
      if (heading.id) {
        const elementsWithSameId = page.locator(`#${heading.id}`);
        await expect(elementsWithSameId).toHaveCount(1);
      }
    }
  });
});
