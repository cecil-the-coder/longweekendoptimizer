import { test, expect } from '@playwright/test';

test.describe('Styling Investigation', () => {
  test('capture screenshot of deployed site', async ({ page }) => {
    const DEPLOYED_URL = 'https://cecil-the-coder.github.io/longweekendoptimizer/';

    // Navigate to the deployed site
    await page.goto(DEPLOYED_URL);

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Capture full page screenshot
    await page.screenshot({
      path: 'deployed-site-styling.png',
      fullPage: true
    });

    // Check for CSS assets
    const cssLinks = await page.locator('link[rel="stylesheet"]').count();
    console.log(`Number of CSS links found: ${cssLinks}`);

    // Check for any style加载 issues in console
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Console error:', msg.text());
      }
    });

    // Get computed styles for main container
    const bodyStyles = await page.evaluate(() => {
      const body = document.body;
      const computedStyles = window.getComputedStyle(body);
      return {
        backgroundColor: computedStyles.backgroundColor,
        fontFamily: computedStyles.fontFamily,
        color: computedStyles.color,
        margin: computedStyles.margin,
        padding: computedStyles.padding
      };
    });

    console.log('Body styles:', bodyStyles);

    // Check if Tailwind classes are being applied
    const hasTailwind = await page.locator('#tailwind-css').count() > 0 ||
                       await page.evaluate(() => {
                         return !!document.querySelector('link[href*="tailwind"]');
                       });

    console.log(`Has Tailwind CSS: ${hasTailwind}`);

    // Take a screenshot of just the form area
    const formElement = page.locator('form').first();
    if (await formElement.isVisible()) {
      await formElement.screenshot({
        path: 'deployed-site-form.png'
      });
    }
  });
});