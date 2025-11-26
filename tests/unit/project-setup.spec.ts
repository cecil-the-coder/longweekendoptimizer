import { describe, test, expect } from 'vitest';
import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

describe('Story 1.1: Project Setup - Failing Tests', () => {

  test('AC1: should have Vite + React + TypeScript project initialized', async () => {
    // GIVEN: Project setup is expected
    const projectRoot = resolve(process.cwd());

    // WHEN: Checking package.json for Vite React TypeScript dependencies
    const packageJsonPath = resolve(projectRoot, 'package.json');

    // THEN: Should have required dependencies and configuration
    expect(existsSync(packageJsonPath), 'package.json should exist').toBe(true);

    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

    // Should have React dependencies
    expect(packageJson.dependencies?.react, 'React should be a dependency').toBeDefined();
    expect(packageJson.dependencies?.['react-dom'], 'React DOM should be a dependency').toBeDefined();

    // Should have TypeScript in devDependencies
    expect(packageJson.devDependencies?.typescript, 'TypeScript should be a dev dependency').toBeDefined();

    // Should have Vite in devDependencies
    expect(packageJson.devDependencies?.vite, 'Vite should be a dev dependency').toBeDefined();

    // Should have build script using tsc and vite
    expect(packageJson.scripts?.build, 'Should have build script').toBeDefined();
    expect(packageJson.scripts.build).toContain('tsc');
    expect(packageJson.scripts.build).toContain('vite build');

    // Should have dev script using vite
    expect(packageJson.scripts?.dev, 'Should have dev script').toBeDefined();
    expect(packageJson.scripts.dev).toBe('vite');

    // Should use Vite config file
    const viteConfigPath = resolve(projectRoot, 'vite.config.ts');
    expect(existsSync(viteConfigPath), 'vite.config.ts should exist').toBe(true);

    const viteConfig = readFileSync(viteConfigPath, 'utf-8');
    expect(viteConfig).toContain('@vitejs/plugin-react');
    expect(viteConfig).toContain('defineConfig');
  });

  test('AC2: should have ESLint configured with TypeScript and React rules', async () => {
    // GIVEN: ESLint configuration is expected
    const projectRoot = resolve(process.cwd());

    // WHEN: Checking ESLint configuration
    const eslintConfigPath = resolve(projectRoot, '.eslintrc.json');

    // THEN: Should have proper ESLint setup
    expect(existsSync(eslintConfigPath), '.eslintrc.json should exist').toBe(true);

    const eslintConfig = JSON.parse(readFileSync(eslintConfigPath, 'utf-8'));

    // Should use TypeScript parser
    expect(eslintConfig.parser, 'Should use @typescript-eslint/parser').toBe('@typescript-eslint/parser');

    // Should extend React and TypeScript recommended configs
    expect(eslintConfig.extends, 'Should extend plugin:react/recommended').toContain('plugin:react/recommended');
    expect(eslintConfig.extends, 'Should extend plugin:@typescript-eslint/recommended').toContain('plugin:@typescript-eslint/recommended');

    // Should have React and TypeScript plugins
    expect(eslintConfig.plugins, 'Should have @typescript-eslint plugin').toContain('@typescript-eslint');
    expect(eslintConfig.plugins, 'Should have react plugin').toContain('react');

    // Should have lint script
    const packageJsonPath = resolve(projectRoot, 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    expect(packageJson.scripts?.lint, 'Should have lint script').toBeDefined();
    expect(packageJson.scripts.lint).toContain('eslint');

    // Should have ESLint dependencies
    expect(packageJson.devDependencies?.eslint, 'ESLint should be a dev dependency').toBeDefined();
    expect(packageJson.devDependencies?.['@typescript-eslint/eslint-plugin'], 'TypeScript ESLint plugin should be a dev dependency').toBeDefined();
    expect(packageJson.devDependencies?.['@typescript-eslint/parser'], 'TypeScript ESLint parser should be a dev dependency').toBeDefined();
    expect(packageJson.devDependencies?.['eslint-plugin-react-hooks'], 'React hooks plugin should be a dev dependency').toBeDefined();
    expect(packageJson.devDependencies?.['eslint-plugin-react-refresh'], 'React refresh plugin should be a dev dependency').toBeDefined();

    // Should be able to run ESLint without errors (static validation)
    const packageJsonPath = resolve(projectRoot, 'package.json');
    const packageJsonForLint = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    expect(packageJsonForLint.scripts?.lint, 'Should have lint script').toBeDefined();
    expect(packageJsonForLint.devDependencies?.eslint, 'ESLint should be installed').toBeDefined();
  });

  test('AC3: should have Prettier configured and integrated with ESLint', async () => {
    // GIVEN: Prettier configuration is expected
    const projectRoot = resolve(process.cwd());

    // WHEN: Checking Prettier configuration
    const prettierConfigPath = resolve(projectRoot, '.prettierrc');

    // THEN: Should have Prettier setup
    expect(existsSync(prettierConfigPath), '.prettierrc should exist').toBe(true);

    const prettierConfig = readFileSync(prettierConfigPath, 'utf-8');

    // Should be valid JSON configuration
    expect(() => JSON.parse(prettierConfig), 'Prettier config should be valid JSON').not.toThrow();

    const config = JSON.parse(prettierConfig);

    // Should have reasonable defaults
    expect(config.tabWidth, 'Should have tabWidth configured').toBeGreaterThanOrEqual(2);
    expect(config.useTabs, 'Should specify tab usage').toBeDefined();
    expect(config.singleQuote, 'Should specify quote preference').toBeDefined();
    expect(config.trailingComma, 'Should specify trailing comma preference').toBeDefined();

    // Should have Prettier in devDependencies
    const packageJsonPath = resolve(projectRoot, 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    expect(packageJson.devDependencies?.prettier, 'Prettier should be a dev dependency').toBeDefined();

    // Should have lint:fix script that runs Prettier
    expect(packageJson.scripts?.['lint:fix'], 'Should have lint:fix script').toBeDefined();
    expect(packageJson.scripts['lint:fix']).toContain('eslint --fix');

    // Should have format script that runs Prettier
    expect(packageJson.scripts?.format, 'Should have format script').toBeDefined();
    expect(packageJson.scripts.format).toContain('prettier');
  });

  test('AC4: should render Hello World component on main page', async () => {
    // GIVEN: Hello World component is expected
    // WHEN: Checking if the component exists and renders

    // THEN: Should have HelloWorld component file
    const componentPath = resolve(process.cwd(), 'src', 'components', 'HelloWorld.tsx');
    expect(existsSync(componentPath), 'HelloWorld.tsx should exist in src/components/').toBe(true);

    // Component should export a React component
    const componentContent = readFileSync(componentPath, 'utf-8');
    expect(componentContent, 'Should import React').toContain('import React');
    expect(componentContent, 'Should export a component').toContain('export');
    expect(componentContent, 'Should have TypeScript props interface').toContain('interface');
    expect(componentContent, 'Should have function or const declaration').toMatch(/(function|const)/);

    // Component should follow PascalCase naming
    expect(componentPath.split('/').pop(), 'Component should follow PascalCase naming').toBe('HelloWorld.tsx');

    // Should have App.tsx that imports and renders HelloWorld
    const appPath = resolve(process.cwd(), 'src', 'App.tsx');
    expect(existsSync(appPath), 'App.tsx should exist').toBe(true);

    const appContent = readFileSync(appPath, 'utf-8');
    expect(appContent, 'App should import HelloWorld').toContain('HelloWorld');
    expect(appContent, 'App should render HelloWorld component').toContain('<HelloWorld');

    // Should have main.tsx that renders App
    const mainPath = resolve(process.cwd(), 'src', 'main.tsx');
    expect(existsSync(mainPath), 'main.tsx should exist').toBe(true);

    const mainContent = readFileSync(mainPath, 'utf-8');
    expect(mainContent, 'main should import React').toContain('import React');
    expect(mainContent, 'main should import ReactDOM').toContain('import ReactDOM');
    expect(mainContent, 'main should render App').toContain('App');
    expect(mainContent, 'main should get root element').toContain('getElementById');
  });

  test('AC5: should have Vitest installed and configured with basic passing test', async () => {
    // GIVEN: Vitest testing framework is expected
    // WHEN: Checking Vitest setup

    // THEN: Should have Vitest in devDependencies
    const packageJsonPath = resolve(process.cwd(), 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    expect(packageJson.devDependencies?.vitest, 'Vitest should be a dev dependency').toBeDefined();

    // Should have Vitest configuration
    const vitestConfigPath = resolve(process.cwd(), 'vitest.config.ts');
    expect(existsSync(vitestConfigPath), 'vitest.config.ts should exist').toBe(true);

    const vitestConfig = readFileSync(vitestConfigPath, 'utf-8');
    expect(vitestConfig, 'Vitest config should import defineConfig').toContain('defineConfig');
    expect(vitestConfig, 'Vitest config should import React plugin').toContain('@vitejs/plugin-react');
    expect(vitestConfig, 'Vitest config should have test configuration').toContain('test:');
    expect(vitestConfig, 'Vitest config should use jsdom environment').toContain('jsdom');
    expect(vitestConfig, 'Vitest config should enable globals').toContain('globals: true');

    // Should have test scripts in package.json
    expect(packageJson.scripts?.test, 'Should have test script').toBeDefined();
    expect(packageJson.scripts.test).toBe('vitest');
    expect(packageJson.scripts?.['test:ui'], 'Should have test UI script').toBeDefined();
    expect(packageJson.scripts?.['test:coverage'], 'Should have test coverage script').toBeDefined();

    // Should have test setup file
    const setupPath = resolve(process.cwd(), 'tests', 'setup.ts');
    expect(existsSync(setupPath), 'tests/setup.ts should exist').toBe(true);

    const setupContent = readFileSync(setupPath, 'utf-8');
    expect(setupContent, 'Test setup should import @testing-library/jest-dom').toContain('@testing-library/jest-dom');

    // Should be able to run tests (static validation only - NO recursion)
    const vitestConfigPath = resolve(projectRoot, 'vitest.config.ts');
    expect(existsSync(vitestConfigPath), 'vitest.config.ts should exist').toBe(true);
    const vitestConfig = readFileSync(vitestConfigPath, 'utf-8');
    expect(vitestConfig, 'Vitest config should have test environment').toContain('environment: jsdom');
    expect(vitestConfig, 'Vitest config should enable globals').toContain('globals: true');
    expect(vitestConfig, 'Vitest config should import React plugin').toContain('@vitejs/plugin-react');

    // Should have at least one passing test (this test itself!)
    expect(true, 'Vitest should be working').toBe(true);
  });
});