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
    await page.goto('/');

    // Verify form is visible
    await expect(page.getByTestId('add-holiday-form')).toBeVisible();

    // Fill in holiday details
    await page.getByTestId('holiday-name').fill('Thanksgiving');
    await page.getByTestId('holiday-date').fill('2025-11-27');

    // Add holiday
    await page.getByTestId('add-holiday').click();

    // Verify holiday appears in list
    await expect(page.getByText('Thanksgiving')).toBeVisible();
    await expect(page.getByText(/Thursday.*Nov.*27.*2025/i)).toBeVisible();
  });

  test('should add multiple holidays', async ({ page }) => {
    await page.goto('/');

    // Add first holiday
    await page.getByTestId('holiday-name').fill('Thanksgiving');
    await page.getByTestId('holiday-date').fill('2025-11-27');
    await page.getByTestId('add-holiday').click();

    // Add second holiday
    await page.getByTestId('holiday-name').fill('Christmas');
    await page.getByTestId('holiday-date').fill('2025-12-25');
    await page.getByTestId('add-holiday').click();

    // Verify both holidays visible
    await expect(page.getByText('Thanksgiving')).toBeVisible();
    await expect(page.getByText('Christmas')).toBeVisible();
  });

  test('should clear form after adding holiday', async ({ page }) => {
    await page.goto('/');

    // Fill and submit
    await page.getByTestId('holiday-name').fill('New Year');
    await page.getByTestId('holiday-date').fill('2025-01-01');
    await page.getByTestId('add-holiday').click();

    // Verify form is cleared
    await expect(page.getByTestId('holiday-name')).toHaveValue('');
    await expect(page.getByTestId('holiday-date')).toHaveValue('');
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport (FR10: Responsive web)
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size

    await page.goto('/');

    // Form should still be visible and usable on mobile
    await expect(page.getByTestId('add-holiday-form')).toBeVisible();

    await page.getByTestId('holiday-name').fill('Mobile Holiday');
    await page.getByTestId('holiday-date').fill('2025-07-04');
    await page.getByTestId('add-holiday').click();

    await expect(page.getByText('Mobile Holiday')).toBeVisible();
  });
});
