/**
 * E2E Test: Recommendation Display (FR5-FR9)
 *
 * Tests the core value proposition: showing long weekend recommendations
 *
 * Test ID: 1.5-E2E-001
 * Priority: P0 (Core feature validation)
 * Story: 1.5 - Display Recommendations
 */

import { test, expect } from '@playwright/test';

test.describe('Long Weekend Recommendations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should recommend Friday for Thursday holiday (FR6)', async ({ page }) => {
    // Add Thursday holiday
    await page.getByTestId('holiday-name').fill('Thanksgiving');
    await page.getByTestId('holiday-date').fill('2025-11-27'); // Thursday
    await page.getByTestId('add-holiday').click();

    // Verify recommendation displays
    const recommendation = page.getByTestId('recommendations');
    await expect(recommendation).toBeVisible();
    await expect(recommendation).toContainText(/Friday.*Nov.*28/i);
    await expect(recommendation).toContainText(/4-day weekend/i);
  });

  test('should recommend Monday for Tuesday holiday (FR7)', async ({ page }) => {
    // Add Tuesday holiday
    await page.getByTestId('holiday-name').fill('Election Day');
    await page.getByTestId('holiday-date').fill('2025-11-04'); // Tuesday
    await page.getByTestId('add-holiday').click();

    // Verify recommendation displays
    const recommendation = page.getByTestId('recommendations');
    await expect(recommendation).toBeVisible();
    await expect(recommendation).toContainText(/Monday.*Nov.*3/i);
    await expect(recommendation).toContainText(/4-day weekend/i);
  });

  test('should not recommend for Wednesday holiday', async ({ page }) => {
    // Add Wednesday holiday
    await page.getByTestId('holiday-name').fill('Veterans Day');
    await page.getByTestId('holiday-date').fill('2025-11-12'); // Wednesday
    await page.getByTestId('add-holiday').click();

    // Verify no recommendation
    const recommendation = page.getByTestId('recommendations');
    await expect(recommendation).toContainText(/no long-weekend opportunities/i);
  });

  test('should not recommend day that is already a holiday (FR8)', async ({ page }) => {
    // Add Thanksgiving (Thursday)
    await page.getByTestId('holiday-name').fill('Thanksgiving');
    await page.getByTestId('holiday-date').fill('2025-11-27'); // Thursday
    await page.getByTestId('add-holiday').click();

    // Add Day After Thanksgiving (Friday)
    await page.getByTestId('holiday-name').fill('Day After Thanksgiving');
    await page.getByTestId('holiday-date').fill('2025-11-28'); // Friday
    await page.getByTestId('add-holiday').click();

    // Verify Friday is NOT recommended (already a holiday)
    const recommendation = page.getByTestId('recommendations');
    await expect(recommendation).not.toContainText(/Friday.*Nov.*28/i);
  });

  test('should update recommendations when holiday deleted', async ({ page }) => {
    // Add Thursday holiday
    await page.getByTestId('holiday-name').fill('Thanksgiving');
    await page.getByTestId('holiday-date').fill('2025-11-27');
    await page.getByTestId('add-holiday').click();

    // Verify recommendation exists
    await expect(page.getByTestId('recommendations')).toContainText(/Friday.*Nov.*28/i);

    // Delete holiday
    await page.getByTestId('delete-holiday-0').click();

    // Verify recommendation removed
    await expect(page.getByTestId('recommendations')).toContainText(
      /no long-weekend opportunities/i
    );
  });

  test('should display multiple recommendations clearly (FR9)', async ({ page }) => {
    // Add Thursday holiday
    await page.getByTestId('holiday-name').fill('Thanksgiving');
    await page.getByTestId('holiday-date').fill('2025-11-27');
    await page.getByTestId('add-holiday').click();

    // Add Tuesday holiday
    await page.getByTestId('holiday-name').fill('Election Day');
    await page.getByTestId('holiday-date').fill('2025-11-04');
    await page.getByTestId('add-holiday').click();

    // Verify both recommendations visible and clear
    const recommendations = page.getByTestId('recommendations');
    await expect(recommendations).toContainText(/Thanksgiving/i);
    await expect(recommendations).toContainText(/Friday.*Nov.*28/i);
    await expect(recommendations).toContainText(/Election Day/i);
    await expect(recommendations).toContainText(/Monday.*Nov.*3/i);
  });
});
