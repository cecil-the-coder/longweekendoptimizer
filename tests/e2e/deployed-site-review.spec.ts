import { test, expect } from '@playwright/test';

/**
 * E2E Test Suite: Deployed Site Review
 *
 * This test suite reviews the deployed Long Weekend Optimizer application
 * at https://cecil-the-coder.github.io/longweekendoptimizer/
 *
 * Tests verify:
 * 1. Site accessibility and loading
 * 2. Core functionality working in production
 * 3. Responsive design across viewports
 * 4. localStorage persistence
 * 5. Error handling and user feedback
 */

test.describe('Deployed Site Review: Long Weekend Optimizer', () => {
  const DEPLOYED_URL = 'https://cecil-the-coder.github.io/longweekendoptimizer/';

  test.beforeEach(async ({ page }) => {
    // Navigate to the deployed site
    await page.goto(DEPLOYED_URL);
  });

  test('site loads successfully with proper page title', async ({ page }) => {
    await expect(page).toHaveTitle(/Long Weekend Optimizer/);

    // Check that the main application container is present
    await expect(page.locator('body')).toBeVisible();
  });

  test('main application interface is visible', async ({ page }) => {
    // Check for the main heading
    await expect(page.locator('h1')).toContainText('Long Weekend Optimizer');

    // Check for holiday input form
    await expect(page.locator('form')).toBeVisible();

    // Check for input fields (text and date inputs)
    await expect(page.locator('input[type="date"]')).toHaveCount(1);
    await expect(page.locator('input[type="text"]')).toHaveCount(1);

    // Check for submit button
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('form validation works correctly', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]');

    // Try to submit empty form
    await submitButton.click();

    // Should show validation messages (name validation comes first)
    await expect(page.locator('text=Holiday name is required')).toBeVisible({ timeout: 5000 });
  });

  test('holiday submission workflow functions', async ({ page }) => {
    // Get a future weekday date (avoid weekends)
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);

    // Ensure it's a weekday
    while (futureDate.getDay() === 0 || futureDate.getDay() === 6) {
      futureDate.setDate(futureDate.getDate() + 1);
    }

    const futureStr = futureDate.toISOString().split('T')[0];

    // Fill in the form with holiday name and date
    await page.fill('input#holiday-name', 'Test Holiday');
    await page.fill('input#holiday-date', futureStr);

    // Submit the form
    await page.click('button[type="submit"]');

    // Should show success message and recommendations section
    await expect(page.locator('text=has been added successfully')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('h2:has-text("Recommendations")')).toBeVisible({ timeout: 10000 });
  });

  test('localStorage persists data across page reloads', async ({ page }) => {
    // First, fill and submit the form
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);

    // Ensure it's a weekday
    while (futureDate.getDay() === 0 || futureDate.getDay() === 6) {
      futureDate.setDate(futureDate.getDate() + 1);
    }

    const futureStr = futureDate.toISOString().split('T')[0];

    await page.fill('input#holiday-name', 'Persistence Test Holiday');
    await page.fill('input#holiday-date', futureStr);
    await page.click('button[type="submit"]');

    // Wait for recommendations to appear
    await expect(page.locator('h2:has-text("Recommendations")')).toBeVisible({ timeout: 10000 });

    // Reload the page
    await page.reload();

    // Data should be persisted and recommendations should still be visible
    await expect(page.locator('h2:has-text("Recommendations")')).toBeVisible({ timeout: 10000 });

    // The holiday should be visible in the holiday list (look for the holiday list entry specifically)
    await expect(page.locator('text=Persistence Test Holiday - Thursday')).toBeVisible({ timeout: 5000 });
  });

  test('notifications display and dismiss correctly', async ({ page }) => {
    // Fill form with valid data
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 3);

    // Ensure it's a weekday
    while (futureDate.getDay() === 0 || futureDate.getDay() === 6) {
      futureDate.setDate(futureDate.getDate() + 1);
    }

    const futureStr = futureDate.toISOString().split('T')[0];

    await page.fill('input#holiday-name', 'Notification Test Holiday');
    await page.fill('input#holiday-date', futureStr);

    // Submit form to trigger success notification
    await page.click('button[type="submit"]');

    // Check for success notification (green background success message)
    const notification = page.locator('.bg-green-100').first();
    await expect(notification).toBeVisible({ timeout: 5000 });
    await expect(notification).toContainText('"Notification Test Holiday" has been added successfully!');

    // Wait for notification to auto-dismiss after 3 seconds (as per implementation)
    await page.waitForTimeout(4000);

    // Notification should be dismissed
    await expect(notification).not.toBeVisible();
  });

  test.describe('Responsive Design', () => {
    test('desktop layout displays correctly', async ({ page }) => {
      // Test desktop viewport
      await page.setViewportSize({ width: 1200, height: 800 });

      // Main layout should be properly structured
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('form')).toBeVisible();
    });

    test('mobile layout adapts correctly', async ({ page }) => {
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Mobile-specific layout considerations
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('form')).toBeVisible();

      // Check that form is usable on mobile
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('tablet layout functions properly', async ({ page }) => {
      // Test tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });

      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('form')).toBeVisible();
    });
  });

  test('error handling works gracefully', async ({ page }) => {
    // Test with weekend date (which should be rejected)
    const saturdayDate = new Date();
    saturdayDate.setDate(saturdayDate.getDate() + ((6 - saturdayDate.getDay() + 7) % 7 || 7));

    const saturdayStr = saturdayDate.toISOString().split('T')[0];

    await page.fill('input#holiday-name', 'Weekend Test Holiday');
    await page.fill('input#holiday-date', saturdayStr);

    // Submit invalid form
    await page.click('button[type="submit"]');

    // Should show weekend validation error
    await expect(page.locator('text=Holidays cannot be scheduled on weekends (Saturday or Sunday)')).toBeVisible({ timeout: 5000 });
  });

  test('asset loading and performance', async ({ page }) => {
    // Set up request monitoring before navigation
    const networkRequests = [];

    page.on('request', request => {
      networkRequests.push(request.url());
    });

    // Navigate to the page (since we're starting fresh)
    await page.goto('https://cecil-the-coder.github.io/longweekendoptimizer/');
    await page.waitForLoadState('networkidle');

    // Should have loaded bundled assets from the assets directory
    const cssRequests = networkRequests.filter(url => url.includes('.css'));
    const jsRequests = networkRequests.filter(url => url.includes('.js'));

    expect(cssRequests.length).toBeGreaterThan(0);
    expect(jsRequests.length).toBeGreaterThan(0);

    // Verify the app loads properly by checking for main content
    await expect(page.locator('h1')).toContainText('Long Weekend Optimizer');
  });

  test('accessibility features are functional', async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press('Tab');

    // Should focus on first interactive element
    const focusedElement = await page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // Test proper form labels are associated with inputs
    await expect(page.locator('label[for="holiday-name"]')).toBeVisible();
    await expect(page.locator('label[for="holiday-date"]')).toBeVisible();

    // Verify main heading exists (h1 doesn't need explicit role attribute)
    await expect(page.locator('h1')).toContainText('Long Weekend Optimizer');
  });

  // Cross-browser compatibility testing
  // This test suite automatically runs across Chromium, Firefox, and WebKit
  // verifying the application works consistently across browsers
  test.skip('cross-browser compatibility documentation', () => {
    // Documentation placeholder - cross-browser testing handled by Playwright config
  });
});