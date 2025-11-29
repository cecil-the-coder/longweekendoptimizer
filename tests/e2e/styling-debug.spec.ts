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
                       }) ||
                       await page.evaluate(() => {
                         // Check for the presence of Tailwind utilities in the CSS
                         const cssLink = document.querySelector('link[href*="index-"]');
                         if (!cssLink) return false;

                         // Check if specific Tailwind classes exist in the DOM
                         const hasContainerClasses = document.querySelector('.container') !== null;
                         const hasFlexClasses = document.querySelector('.flex') !== null;
                         const hasBasicUtilities = document.querySelector('.mx-auto') !== null;

                         return hasContainerClasses || hasFlexClasses || hasBasicUtilities;
                       });

    console.log(`Has Tailwind CSS: ${hasTailwind}`);

    // Also check the actual CSS content to verify Tailwind is loaded
    const cssContent = await page.evaluate(() => {
      const cssLink = document.querySelector('link[href*="index-"]');
      if (!cssLink) return 'No CSS link found';

      return fetch(cssLink.href)
        .then(response => response.text())
        .then(css => css.includes('tailwindcss') ? 'Contains Tailwind' : 'No Tailwind found')
        .catch(() => 'Failed to fetch CSS');
    });

    console.log(`CSS Content Check: ${cssContent}`);

    // Take a screenshot of just the form area
    const formElement = page.locator('form').first();
    if (await formElement.isVisible()) {
      await formElement.screenshot({
        path: 'deployed-site-form.png'
      });
    }
  });
});