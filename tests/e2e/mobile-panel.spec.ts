import { test, expect } from '@playwright/test';

test.describe('Mobile Panel View', () => {
  test('check Add Holidays panel on mobile', async ({ page }) => {
    const DEPLOYED_URL = 'https://cecil-the-coder.github.io/longweekendoptimizer/';

    // Set mobile viewport (iPhone 12 Pro)
    await page.setViewportSize({ width: 390, height: 844 });

    // Navigate to the deployed site
    await page.goto(DEPLOYED_URL);
    await page.waitForLoadState('networkidle');

    // Capture initial mobile view
    await page.screenshot({
      path: 'mobile-view-closed.png',
      fullPage: true
    });

    console.log('Mobile view captured (panel closed)');

    // Find and click the Add Holidays button
    const addButton = page.locator('button:has-text("Add Holidays")');
    await expect(addButton).toBeVisible();
    await addButton.click();

    // Wait for panel to appear
    await page.waitForTimeout(500); // Wait for animation

    // Capture mobile view with panel open
    await page.screenshot({
      path: 'mobile-view-panel-open.png',
      fullPage: true
    });

    console.log('Mobile view captured (panel open)');

    // Check panel is visible
    const panel = page.locator('text=Quick Add');
    await expect(panel).toBeVisible();

    // Check backdrop is present
    const backdrop = page.locator('div.backdrop-blur-sm');
    await expect(backdrop).toBeVisible();

    console.log('Panel and backdrop are visible on mobile');
  });

  test('check Add Holidays panel on tablet', async ({ page }) => {
    const DEPLOYED_URL = 'https://cecil-the-coder.github.io/longweekendoptimizer/';

    // Set tablet viewport (iPad)
    await page.setViewportSize({ width: 768, height: 1024 });

    await page.goto(DEPLOYED_URL);
    await page.waitForLoadState('networkidle');

    // Capture tablet view
    await page.screenshot({
      path: 'tablet-view-closed.png',
      fullPage: true
    });

    // Click Add Holidays button
    const addButton = page.locator('button:has-text("Add Holidays")');
    await addButton.click();
    await page.waitForTimeout(500);

    // Capture with panel open
    await page.screenshot({
      path: 'tablet-view-panel-open.png',
      fullPage: true
    });

    console.log('Tablet views captured');
  });
});
