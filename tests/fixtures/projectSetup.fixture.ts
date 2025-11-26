/**
 * Project Setup Test Fixture
 *
 * Provides composable fixture for project setup testing,
 * following the pure function → fixture → merge pattern.
 */

import { test as base, expect } from '@playwright/test';
import {
  ProjectConfig,
  ComponentConfig,
  DevEnvironment,
  createProjectConfig,
  createComponentConfig,
  createDevEnvironment
} from '../factories/projectSetupFactory';

// Pure helper functions for project setup testing
export async function verifyProjectStructure(page: any, config: ProjectConfig): Promise<void> {
  // Verify basic HTML structure
  await expect(page.locator('html')).toBeVisible();
  await expect(page.locator('head')).toBeVisible();
  await expect(page.locator('body')).toBeVisible();

  // Verify application title
  const title = await page.title();
  expect(title).toContain(config.projectName);
}

export async function verifyComponentRendering(page: any, config: ComponentConfig): Promise<void> {
  // Verify welcome message
  const welcomeElement = page.locator('[data-testid="welcome-message"]');
  await expect(welcomeElement).toBeVisible();
  await expect(welcomeElement).toContainText(config.welcomeMessage);

  // Verify greeting
  const greetingElement = page.locator('text=' + config.greeting);
  await expect(greetingElement).toBeVisible();
}

export async function verifyComponentInteraction(page: any, config: ComponentConfig): Promise<void> {
  // Verify count button exists and is interactive
  const countButton = page.locator('[data-testid="count-button"]');
  await expect(countButton).toBeVisible();
  await expect(countButton).toBeEnabled();

  // Verify initial count
  await expect(countButton).toContainText(`count is ${config.initialCount}`);

  // Click and verify increment
  await countButton.click();
  await expect(countButton).toContainText(`count is ${config.initialCount + 1}`);
}

export async function verifyDevServerResponse(page: any, env: DevEnvironment): Promise<void> {
  // Verify server is running and responding
  const response = await page.goto(env.baseUrl);
  expect(response?.status()).toBe(200);

  // Verify no server errors in console
  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  await page.reload();
  expect(consoleErrors.length).toBe(0);
}

// Fixture composition using mergeTests pattern
export const test = base.extend<{
  projectConfig: ProjectConfig;
  componentConfig: ComponentConfig;
  devEnvironment: DevEnvironment;
  verifyProjectPage: (expect?: boolean) => Promise<void>;
}>({
  // Configuration fixtures
  projectConfig: async ({}, use) => {
    const config = createProjectConfig();
    await use(config);
  },

  componentConfig: async ({}, use) => {
    const config = createComponentConfig();
    await use(config);
  },

  devEnvironment: async ({}, use) => {
    const env = createDevEnvironment();
    await use(env);
  },

  // Composed verification fixture
  verifyProjectPage: async ({ page, projectConfig, componentConfig, devEnvironment }, use) => {
    const verifyPage = async (shouldExpect = true) => {
      if (shouldExpect) {
        await verifyProjectStructure(page, projectConfig);
        await verifyComponentRendering(page, componentConfig);
        await verifyComponentInteraction(page, componentConfig);
        await verifyDevServerResponse(page, devEnvironment);
      } else {
        // For testing failure scenarios
        try {
          await verifyProjectStructure(page, projectConfig);
        } catch {
          // Expected to fail in RED phase
        }
      }
    };

    await use(verifyPage);
  },
});

// Export specialized fixture for error scenarios
export const testForErrors = base.extend<{
  projectConfig: ProjectConfig;
  componentConfig: ComponentConfig;
  expectErrors: () => Promise<void>;
}>({
  projectConfig: async ({}, use) => {
    const config = createProjectConfig({
      projectName: 'Test Project With Errors',
    });
    await use(config);
  },

  componentConfig: async ({}, use) => {
    const config = createComponentConfig({
      name: 'ErrorTest',
      greeting: 'Hello, ErrorTest!',
    });
    await use(config);
  },

  expectErrors: async ({ page }, use) => {
    const checkForErrors = async () => {
      // Listen for console errors
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
      });

      // Listen for uncaught JavaScript errors
      page.on('pageerror', error => errors.push(error.message));

      // Give time for errors to occur
      await page.waitForTimeout(1000);

      // In RED phase, we expect errors (missing implementation)
      return errors;
    };

    await use(checkForErrors);
  },
});

export { expect };