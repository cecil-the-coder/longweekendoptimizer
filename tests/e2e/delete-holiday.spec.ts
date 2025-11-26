/**
 * E2E Test: Delete Holiday Workflow (FR2)
 *
 * Tests removing holidays from the list
 *
 * Test ID: 1.2-E2E-002
 * Priority: P0 (Critical user journey)
 * Story: 1.2 - Holiday Input UI
 */

import { test, expect } from '@playwright/test';

test.describe('Delete Holiday', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Add a holiday via UI
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    await page.getByTestId('holiday-name').fill('Test Holiday');
    await page.getByTestId('holiday-date').fill('2025-06-15');
    await page.getByTestId('add-holiday').click();
  });

  test('should delete a holiday from the list', async ({ page }) => {
    // Verify holiday exists
    await expect(page.getByText('Test Holiday')).toBeVisible();

    // Delete holiday
    await page.getByTestId('delete-holiday-0').click();

    // Verify holiday removed
    await expect(page.getByText('Test Holiday')).not.toBeVisible();
  });

  test('should delete correct holiday when multiple exist', async ({ page }) => {
    // Add second holiday
    await page.getByTestId('holiday-name').fill('Second Holiday');
    await page.getByTestId('holiday-date').fill('2025-07-20');
    await page.getByTestId('add-holiday').click();

    // Verify both exist
    await expect(page.getByText('Test Holiday')).toBeVisible();
    await expect(page.getByText('Second Holiday')).toBeVisible();

    // Delete first holiday
    await page.getByTestId('delete-holiday-0').click();

    // Verify only second remains
    await expect(page.getByText('Test Holiday')).not.toBeVisible();
    await expect(page.getByText('Second Holiday')).toBeVisible();
  });

  test('should show empty state after deleting all holidays', async ({ page }) => {
    // Delete the only holiday
    await page.getByTestId('delete-holiday-0').click();

    // Verify empty state message
    await expect(page.getByText(/no holidays/i)).toBeVisible();
  });
});
