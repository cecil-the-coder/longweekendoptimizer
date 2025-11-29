import { test, expect } from '@playwright/test';

test.describe('Story 1.1: Project Setup - E2E Tests', () => {
  test('should start Vite development server successfully', async ({ page }) => {
    // GIVEN: User wants to start the development environment
    // WHEN: Development server is accessed via baseURL
    // THEN: Server should respond without errors

    // This test verifies the Vite dev server is running
    const response = await page.goto('/', { waitUntil: 'networkidle' });

    expect(response?.status()).toBe(200);
    // Verify Vite-specific dev server headers or content
    const htmlContent = await page.content();
    expect(htmlContent).toContain('HolidayHacker');
  });

  test('should render HelloWorld component on main page', async ({ page }) => {
    // GIVEN: User navigates to the main application page
    // WHEN: Page loads completely
    // THEN: HelloWorld component should be visible with default greeting

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for HelloWorld component content
    await expect(page.locator('text=HolidayHacker')).toBeVisible();
    await expect(page.locator('text=Hello, World!')).toBeVisible();
    await expect(page.locator('[data-testid="welcome-message"]')).toContainText('Welcome to HolidayHacker');
  });

  test('should allow interaction with HelloWorld component', async ({ page }) => {
    // GIVEN: HelloWorld component is rendered on the page
    // WHEN: User clicks the count button
    // THEN: Count should increment in the component

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find and click the count button
    const countButton = page.locator('[data-testid="count-button"]');
    await expect(countButton).toBeVisible();

    // Get initial count
    const initialCountText = await page.locator('[data-testid="count-display"]').textContent();

    // Click button to increment count
    await countButton.click();

    // Verify count has incremented
    const newCountText = await page.locator('[data-testid="count-display"]').textContent();
    expect(newCountText).not.toBe(initialCountText);
    expect(newCountText).toContain('count is 1');
  });

  test('should render React + TypeScript application with proper structure', async ({ page }) => {
    // GIVEN: The project is set up as Vite + React + TypeScript
    // WHEN: The application loads
    // THEN: Proper React application structure should be evident

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify React app structure
    await expect(page.locator('#root')).toBeVisible();
    await expect(page.locator('#root > div')).toBeVisible(); // App wrapper

    // Verify no TypeScript compilation errors in console
    const consoleLogs: string[] = [];
    page.on('console', msg => consoleLogs.push(msg.text()));

    // Reload page to catch any runtime errors
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Check for TypeScript errors
    const hasErrors = consoleLogs.some(log => log.includes('error') || log.includes('Error'));
    expect(hasErrors).toBeFalsy();
  });
});