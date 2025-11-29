/**
 * E2E Test: Add Holiday Workflow (FR1)
 *
 * Tests the core user journey: adding a holiday and seeing it in the list
 *
 * Test ID: 1.2-E2E-001
 * Priority: P0 (Critical user journey)
 * Story: 1.2 - Holiday Input UI
 */

import { test, expect } from '@playwright/test';

test.describe('Add Holiday', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test (isolation)
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should add a holiday and display it in the list', async ({ page }) => {
    await page.goto('https://cecil-the-coder.github.io/longweekendoptimizer/');

    // Verify form is visible using correct selector
    await expect(page.locator('form')).toBeVisible();

    // Fill in holiday details using correct IDs
    await page.fill('input#holiday-name', 'Thanksgiving');
    await page.fill('input#holiday-date', '2025-11-27');

    // Add holiday using submit button
    await page.click('button[type="submit"]');

    // Wait for holiday to be added and recommendations to appear
    await expect(page.locator('h2:has-text("Recommendations")')).toBeVisible({ timeout: 10000 });

    // Verify holiday appears in list (look for the correctly formatted holiday entry)
    await expect(page.locator('text=Thanksgiving - Thursday')).toBeVisible({ timeout: 5000 });
  });

  test('should add multiple holidays', async ({ page }) => {
    await page.goto('https://cecil-the-coder.github.io/longweekendoptimizer/');

    // Add first holiday
    await page.fill('input#holiday-name', 'Thanksgiving');
    await page.fill('input#holiday-date', '2025-11-27');
    await page.click('button[type="submit"]');
    await expect(page.locator('h2:has-text("Recommendations")')).toBeVisible({ timeout: 10000 });

    // Add second holiday
    await page.fill('input#holiday-name', 'Christmas');
    await page.fill('input#holiday-date', '2025-12-25');
    await page.click('button[type="submit"]');
    await expect(page.locator('h2:has-text("Recommendations")')).toBeVisible({ timeout: 10000 });

    // Verify both holidays visible
    await expect(page.locator('text=Thanksgiving - Thursday')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Christmas - Thursday')).toBeVisible({ timeout: 5000 });
  });

  test('should clear form after adding holiday', async ({ page }) => {
    await page.goto('https://cecil-the-coder.github.io/longweekendoptimizer/');

    // Fill and submit
    await page.fill('input#holiday-name', 'New Year');
    await page.fill('input#holiday-date', '2025-01-01');
    await page.click('button[type="submit"]');

    // Wait for form submission to complete
    await expect(page.locator('h2:has-text("Recommendations")')).toBeVisible({ timeout: 10000 });

    // Verify form is cleared
    await expect(page.locator('input#holiday-name')).toHaveValue('');
    await expect(page.locator('input#holiday-date')).toHaveValue('');
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport (FR10: Responsive web)
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size

    await page.goto('https://cecil-the-coder.github.io/longweekendoptimizer/');

    // Form should still be visible and usable on mobile
    await expect(page.locator('form')).toBeVisible();

    await page.fill('input#holiday-name', 'Mobile Holiday');
    await page.fill('input#holiday-date', '2025-07-04');
    await page.click('button[type="submit"]');

    await expect(page.locator('h2:has-text("Recommendations")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Mobile Holiday - Friday')).toBeVisible({ timeout: 5000 });
  });
});
