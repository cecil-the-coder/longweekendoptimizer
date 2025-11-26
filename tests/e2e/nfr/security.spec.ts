/**
 * E2E Test: Security NFR (NFR7)
 *
 * Tests no PII transmission requirement
 *
 * Test ID: NFR7-E2E-001
 * Priority: P0 (Privacy/Security critical)
 * Requirement: NFR7
 */

import { test, expect } from '@playwright/test';

test.describe('Security NFR: No PII Transmission', () => {
  test('should not transmit data to external servers (NFR7)', async ({ page, context }) => {
    const externalRequests: string[] = [];

    // Monitor all network requests
    context.route('**/*', (route) => {
      const url = route.request().url();

      // Allow localhost (dev server) and file:// (if applicable)
      if (!url.startsWith('http://localhost') && !url.startsWith('file://')) {
        externalRequests.push(url);
      }

      route.continue();
    });

    await page.goto('/');

    // Add holiday (triggers localStorage, should NOT trigger network request)
    await page.getByTestId('holiday-name').fill('Thanksgiving');
    await page.getByTestId('holiday-date').fill('2025-11-27');
    await page.getByTestId('add-holiday').click();

    // Verify recommendations displayed (data processed locally)
    await expect(page.getByTestId('recommendations')).toContainText(/Friday/i);

    // Delete holiday
    await page.getByTestId('delete-holiday-0').click();

    // CRITICAL: No external requests should have been made
    expect(externalRequests).toHaveLength(0);
  });

  test('should store data only in localStorage, not send to server', async ({ page }) => {
    await page.goto('/');

    // Add holiday
    await page.getByTestId('holiday-name').fill('Personal Holiday');
    await page.getByTestId('holiday-date').fill('2025-08-15');
    await page.getByTestId('add-holiday').click();

    // Verify data is in localStorage
    const storedData = await page.evaluate(() => {
      return localStorage.getItem('longWeekendApp:holidays');
    });

    expect(storedData).toBeTruthy();
    expect(storedData).toContain('Personal Holiday');
    expect(storedData).toContain('2025-08-15');
  });
});
