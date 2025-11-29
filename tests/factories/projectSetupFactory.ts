/**
 * Data Factory for Project Setup Tests
 *
 * This factory creates test data for project setup scenarios,
 * following the faker-based pattern for parallel-safe testing.
 */

export interface ProjectConfig {
  projectName: string;
  version: string;
  description: string;
  author: string;
  language: string;
}

export interface ComponentConfig {
  name: string;
  greeting: string;
  welcomeMessage: string;
  initialCount: number;
}

export interface DevEnvironment {
  port: number;
  baseUrl: string;
  environment: 'development' | 'test' | 'production';
}

export const createProjectConfig = (overrides: Partial<ProjectConfig> = {}): ProjectConfig => ({
  projectName: 'HolidayHacker',
  version: '1.0.0',
  description: 'A React application for optimizing long weekends',
  author: 'Development Team',
  language: 'TypeScript',
  ...overrides,
});

export const createComponentConfig = (overrides: Partial<ComponentConfig> = {}): ComponentConfig => ({
  name: 'World',
  greeting: 'Hello',
  welcomeMessage: 'Welcome to HolidayHacker',
  initialCount: 0,
  ...overrides,
});

export const createDevEnvironment = (overrides: Partial<DevEnvironment> = {}): DevEnvironment => ({
  port: 5173,
  baseUrl: 'http://localhost:5173',
  environment: 'development',
  ...overrides,
});

export const createTestEnvironment = (overrides: Partial<DevEnvironment> = {}): DevEnvironment => ({
  port: 3000,
  baseUrl: 'http://localhost:3000',
  environment: 'test',
  ...overrides,
});

// Specialized factories for common test scenarios
export const createProductionConfig = (): ProjectConfig =>
  createProjectConfig({
    version: '2.0.0',
    author: 'Production Team',
  });

export const createCustomComponent = (name: string): ComponentConfig =>
  createComponentConfig({
    name,
    greeting: `Hello, ${name}!`,
  });

// Factory for creating multiple test scenarios
export const createMultipleComponentConfigs = (count: number): ComponentConfig[] =>
  Array.from({ length: count }, (_, index) =>
    createComponentConfig({
      name: `User${index + 1}`,
      greeting: `Hello, User${index + 1}!`,
    })
  );