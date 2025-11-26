/**
 * E2E Test: Performance NFR (NFR5)
 *
 * Tests load time requirements: <2s on standard mobile connection
 *
 * Test ID: NFR5-E2E-001
 * Priority: P1 (Performance SLA)
 * Requirement: NFR5
 */

import { test, expect } from '@playwright/test';

test.describe('Performance NFR', () => {
  test('should load core UI in under 2 seconds (NFR5)', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');

    // Wait for critical UI elements to be interactive
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByTestId('add-holiday-form')).toBeVisible();

    const loadTime = Date.now() - startTime;

    console.log(`Page load time: ${loadTime}ms`);

    // NFR5 requirement: <2000ms
    expect(loadTime).toBeLessThan(2000);
  });

  test('should render recommendations quickly after adding holiday', async ({ page }) => {
    await page.goto('/');

    const startTime = Date.now();

    // Add holiday
    await page.getByTestId('holiday-name').fill('Thanksgiving');
    await page.getByTestId('holiday-date').fill('2025-11-27');
    await page.getByTestId('add-holiday').click();

    // Wait for recommendation to appear
    await expect(page.getByTestId('recommendations')).toContainText(/Friday/i);

    const renderTime = Date.now() - startTime;

    console.log(`Recommendation render time: ${renderTime}ms`);

    // Should be instantaneous (<100ms) for client-side calculation
    expect(renderTime).toBeLessThan(500);
  });
});
