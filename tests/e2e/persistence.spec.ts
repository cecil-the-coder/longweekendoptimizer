/**
 * E2E Test: Local Storage Persistence (FR3, FR4)
 *
 * Tests data persistence across page reloads
 *
 * Test ID: 1.3-E2E-001
 * Priority: P0 (Data persistence critical)
 * Story: 1.3 - Local Storage Persistence
 */

import { test, expect } from '@playwright/test';

test.describe('Data Persistence', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should persist holidays across page reload (FR3, FR4)', async ({ page }) => {
    // Add holiday
    await page.getByTestId('holiday-name').fill('Thanksgiving');
    await page.getByTestId('holiday-date').fill('2025-11-27');
    await page.getByTestId('add-holiday').click();

    // Verify holiday visible
    await expect(page.getByText('Thanksgiving')).toBeVisible();

    // Reload page
    await page.reload();

    // Verify holiday still visible (loaded from localStorage)
    await expect(page.getByText('Thanksgiving')).toBeVisible();
  });

  test('should load empty state when no saved data (FR4)', async ({ page }) => {
    await page.goto('/');

    // Verify empty state
    await expect(page.getByText(/no holidays/i)).toBeVisible();
  });

  test('should persist after delete operation', async ({ page }) => {
    // Add two holidays
    await page.getByTestId('holiday-name').fill('First Holiday');
    await page.getByTestId('holiday-date').fill('2025-06-15');
    await page.getByTestId('add-holiday').click();

    await page.getByTestId('holiday-name').fill('Second Holiday');
    await page.getByTestId('holiday-date').fill('2025-07-20');
    await page.getByTestId('add-holiday').click();

    // Delete first holiday
    await page.getByTestId('delete-holiday-0').click();

    // Reload page
    await page.reload();

    // Verify only second holiday persisted
    await expect(page.getByText('First Holiday')).not.toBeVisible();
    await expect(page.getByText('Second Holiday')).toBeVisible();
  });

  test('should persist recommendations across reload', async ({ page }) => {
    // Add Thursday holiday
    await page.getByTestId('holiday-name').fill('Thanksgiving');
    await page.getByTestId('holiday-date').fill('2025-11-27');
    await page.getByTestId('add-holiday').click();

    // Verify recommendation
    await expect(page.getByTestId('recommendations')).toContainText(/Friday.*Nov.*28/i);

    // Reload page
    await page.reload();

    // Verify recommendation still displayed
    await expect(page.getByTestId('recommendations')).toContainText(/Friday.*Nov.*28/i);
  });
});
