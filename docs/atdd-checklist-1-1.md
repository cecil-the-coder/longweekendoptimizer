# ATDD Checklist - Epic 1, Story 1.1: Project Setup

**Date:** 2025-11-26
**Author:** BMad
**Primary Test Level:** E2E + Unit

---

## Story Summary

Project setup story establishes foundational development environment with Vite + React + TypeScript static web application, includes code quality tools (ESLint, Prettier), and basic testing framework (Vitest) with a Hello World component to verify the setup works.

**As a** developer
**I want** a foundational project structure
**So that** I can start building the core features with all dependencies and standards in place

---

## Acceptance Criteria

1. The project is initialized as a Vite + React + TypeScript static web application
2. ESLint is configured and functional with TypeScript and React rules
3. Prettier is configured and integrates with ESLint
4. A simple "Hello World" component renders on the main page
5. Vitest is installed and configured with a basic passing test

---

## Failing Tests Created (RED Phase)

### E2E Tests (4 tests)

**File:** `tests/e2e/project-setup.spec.ts` (72 lines)

- ✅ **Test:** should start Vite development server successfully
  - **Status:** RED - Missing Vite dev server implementation
  - **Verifies:** Vite server responds with 200 and contains correct content

- ✅ **Test:** should render HelloWorld component on main page
  - **Status:** RED - Missing HelloWorld component implementation
  - **Verifies:** Component renders with default greeting and welcome message

- ✅ **Test:** should allow interaction with HelloWorld component
  - **Status:** RED - Missing interactive count functionality
  - **Verifies:** Count button increments when clicked

- ✅ **Test:** should render React + TypeScript application with proper structure
  - **Status:** RED - Missing proper React structure and TypeScript compilation
  - **Verifies:** No TypeScript compilation errors in console

### Unit Tests (5 tests)

**File:** `tests/unit/project-setup.spec.ts` (205 lines)

- ✅ **Test:** AC1: should have Vite + React + TypeScript project initialized
  - **Status:** RED - Missing React, TypeScript, and Vite dependencies
  - **Verifies:** package.json contains required dependencies and build scripts

- ✅ **Test:** AC2: should have ESLint configured with TypeScript and React rules
  - **Status:** RED - Missing ESLint configuration files and dependencies
  - **Verifies:** ESLint parser, plugins, and rules are properly configured

- ✅ **Test:** AC3: should have Prettier configured and integrated with ESLint
  - **Status:** RED - Missing Prettier configuration and ESLint integration
  - **Verifies:** Prettier config exists and integrates with ESLint prettier plugin

- ✅ **Test:** AC4: should render Hello World component on main page
  - **Status:** RED - Missing HelloWorld component implementation
  - **Verifies:** Component file exists, follows PascalCase naming, exports React component

- ✅ **Test:** AC5: should have Vitest installed and configured with basic passing test
  - **Status:** RED - Missing Vitest configuration and test setup
  - **Verifies:** Vitest dependencies, configuration, and test scripts are properly set up

### Component Tests (6 tests)

**File:** `tests/component/HelloWorld.test.tsx` (78 lines)

- ✅ **Test:** should render default greeting message
  - **Status:** RED - Missing HelloWorld component export and default rendering
  - **Verifies:** Component renders "Hello, World!" without props

- ✅ **Test:** should render custom name when provided
  - **Status:** RED - Missing props interface and conditional rendering
  - **Verifies:** Component accepts and displays custom name prop

- ✅ **Test:** should initialize count button with zero
  - **Status:** RED - Missing count state and button implementation
  - **Verifies:** Count button displays initial state (0)

- ✅ **Test:** should increment count when button is clicked
  - **Status:** RED - Missing onClick handler and state update logic
  - **Verifies:** State management works correctly

- ✅ **Test:** should have proper data-testid attributes for testability
  - **Status:** RED - Missing required data-testid attributes
  - **Verifies:** Component has testable selectors for stable tests

- ✅ **Test:** should follow PascalCase naming convention
  - **Status:** RED - Component export doesn't exist yet
  - **Verifies:** Proper TypeScript functional component with correct naming

---

## Data Factories Created

### ProjectSetup Factory

**File:** `tests/factories/projectSetupFactory.ts`

**Exports:**

- `createProjectConfig(overrides?)` - Create project configuration with optional overrides
- `createComponentConfig(overrides?)` - Create component configuration with optional overrides
- `createDevEnvironment(overrides?)` - Create development environment configuration
- `createTestEnvironment(overrides?)` - Create test environment configuration
- `createProductionConfig()` - Create production-ready project configuration
- `createCustomComponent(name)` - Create component config with custom name
- `createMultipleComponentConfigs(count)` - Create array of component configurations

**Example Usage:**

```typescript
const projectConfig = createProjectConfig({ version: '2.0.0' });
const componentConfig = createComponentConfig({ name: 'Test User' });
const environments = createMultipleComponentConfigs(5);
```

---

## Fixtures Created

### Project Setup Fixtures

**File:** `tests/fixtures/projectSetup.fixture.ts`

**Fixtures:**

- `projectConfig` - Provides project configuration data with defaults
  - **Setup:** Creates default project config using factory
  - **Provides:** Standardized project metadata for tests
  - **Cleanup:** No cleanup needed (data only)

- `componentConfig` - Provides component configuration for testing
  - **Setup:** Creates default component config using factory
  - **Provides:** Standardized component props and expectations
  - **Cleanup:** No cleanup needed (data only)

- `devEnvironment` - Provides development environment settings
  - **Setup:** Creates environment config using factory
  - **Provides:** Server URLs and environment context
  - **Cleanup:** No cleanup needed (data only)

- `verifyProjectPage(expect?)` - Composed verification fixture
  - **Setup:** Combines all verification functions
  - **Provides:** Single fixture for complete page verification
  - **Cleanup:** No cleanup needed (verification only)

**Example Usage:**

```typescript
import { test } from './fixtures/projectSetup.fixture';

test('should verify project setup', async ({ verifyProjectPage }) => {
  // verifyProjectPage is ready to use with comprehensive checks
});
```

---

## Mock Requirements

No external services need mocking for this project setup story.

---

## Required data-testid Attributes

### HelloWorld Component

- `welcome-message` - Container element for welcome message text
- `count-button` - Interactive button that increments counter
- `count-display` - Element that displays current count value

### Main Page Structure

- `root` - Root React application mount point
- App structure should follow standard React DOM mounting

**Implementation Example:**

```tsx
<div data-testid="welcome-message">
  Welcome to Long Weekend Optimizer
</div>
<button data-testid="count-button" onClick={incrementCount}>
  count is {count}
</button>
<div data-testid="count-display">{count}</div>
```

---

## Implementation Checklist

### Test: E2E - should start Vite development server successfully

**File:** `tests/e2e/project-setup.spec.ts`

**Tasks to make this test pass:**

- [ ] Create package.json with Vite dependency in devDependencies
- [ ] Create vite.config.ts with React plugin and proper configuration
- [ ] Create index.html with proper script references
- [ ] Add dev script to package.json: `"dev": "vite"`
- [ ] Add build script to package.json: `"build": "tsc && vite build"`
- [ ] Run E2E test: `npm run test:e2e -- project-setup.spec.ts`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 2 hours

---

### Test: E2E - should render HelloWorld component on main page

**File:** `tests/e2e/project-setup.spec.ts`

**Tasks to make this test pass:**

- [ ] Create src/components/HelloWorld.tsx React functional component
- [ ] Implement default greeting rendering ("Hello, World!")
- [ ] Implement welcome message rendering ("Welcome to Long Weekend Optimizer")
- [ ] Add data-testid="welcome-message" to welcome element
- [ ] Create src/App.tsx that imports and renders HelloWorld
- [ ] Create src/main.tsx that renders App to DOM
- [ ] Add required data-testid attributes: `welcome-message`, `count-button`, `count-display`
- [ ] Run E2E test: `npm run test:e2e -- project-setup.spec.ts`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 3 hours

---

### Test: E2E - should allow interaction with HelloWorld component

**File:** `tests/e2e/project-setup.spec.ts`

**Tasks to make this test pass:**

- [ ] Implement useState for count in HelloWorld component
- [ ] Implement onClick handler for count button
- [ ] Add data-testid="count-button" to button element
- [ ] Add data-testid="count-display" for count text (button text works)
- [ ] Verify button increments count on click
- [ ] Run E2E test: `npm run test:e2e -- project-setup.spec.ts`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 1 hour

---

### Test: Unit - AC1: should have Vite + React + TypeScript project initialized

**File:** `tests/unit/project-setup.spec.ts`

**Tasks to make this test pass:**

- [ ] Add React dependency: `"react": "^18.3.1"`
- [ ] Add React DOM dependency: `"react-dom": "^18.3.1"`
- [ ] Add TypeScript dev dependency: `"typescript": "^5.6.3"`
- [ ] Add Vite dev dependency: `"vite": "^5.4.8"`
- [ ] Add Vitest dev dependency: `"vitest": "^2.1.4"`
- [ ] Add build script with tsc and vite build
- [ ] Add dev script pointing to vite
- [ ] Create vite.config.ts with React plugin
- [ ] Add @vitejs/plugin-react dev dependency
- [ ] Run unit test: `npm test -- --run --project-setup.spec.ts`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 2 hours

---

### Test: Unit - AC2: should have ESLint configured with TypeScript and React rules

**File:** `tests/unit/project-setup.spec.ts`

**Tasks to make this test pass:**

- [ ] Create .eslintrc.json configuration file
- [ ] Add TypeScript parser: `"@typescript-eslint/parser"`
- [ ] Add TypeScript plugin: `"@typescript-eslint/eslint-plugin"`
- [ ] Add React plugin: `"eslint-plugin-react-hooks"`
- [ ] Add plugin extends: `plugin:@typescript-eslint/recommended`
- [ ] Add plugin extends: `plugin:react-hooks/recommended`
- [ ] Add required dev dependencies: eslint, @typescript-eslint/parser, @typescript-eslint/eslint-plugin, eslint-plugin-react-hooks, eslint-plugin-react-refresh
- [ ] Add lint script: `"lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"`
- [ ] Run unit test: `npm test -- --run --project-setup.spec.ts`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 2 hours

---

### Test: Unit - AC3: should have Prettier configured and integrated with ESLint

**File:** `tests/unit/project-setup.spec.ts`

**Tasks to make this test pass:**

- [ ] Create .prettierrc configuration file
- [ ] Add prettier dev dependency: `"prettier": "^3.2.5"`
- [ ] Add eslint-config-prettier: `"eslint-config-prettier": "^9.0.0"`
- [ ] Add eslint-plugin-prettier: `"eslint-plugin-prettier": "^5.0.0"`
- [ ] Update .eslintrc.json to extend `plugin:prettier/recommended`
- [ ] Add prettier rule to ESLint config: `"prettier/prettier": "error"`
- [ ] Add format script: `"format": "prettier --write src/"`
- [ ] Add lint:fix script: `"lint:fix": "eslint . --ext ts,tsx --fix"`
- [ ] Run unit test: `npm test -- --run --project-setup.spec.ts`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 1 hour

---

### Test: Unit - AC5: should have Vitest installed and configured with basic passing test

**File:** `tests/unit/project-setup.spec.ts`

**Tasks to make this test pass:**

- [ ] Add vitest dev dependency: `"vitest": "^2.1.4"`
- [ ] Add @testing-library/jest-dom: `"@testing-library/jest-dom": "^6.1.4"`
- [ ] Add @testing-library/react: `"@testing-library/react": "^14.2.1"`
- [ ] Add jsdom: `"jsdom": "^23.0.1"`
- [ ] Create vitest.config.ts configuration
- [ ] Configure test.environment: 'jsdom'
- [ ] Configure test.setupFiles: './tests/setup.ts'
- [ ] Create tests/setup.ts file with @testing-library/jest-dom setup
- [ ] Add test scripts: `"test": "vitest"`, `"test:ui": "vitest --ui"`, `"test:coverage": "vitest --coverage"`
- [ ] Run unit test: `npm test -- --run --project-setup.spec.ts`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 2 hours

---

### Test: Component - HelloWorld component tests

**File:** `tests/component/HelloWorld.test.tsx`

**Tasks to make this test pass:**

- [ ] Create src/components/HelloWorld.tsx functional component
- [ ] Implement TypeScript props interface: `interface HelloWorldProps { name?: string; }`
- [ ] Implement component with default name = "World"
- [ ] Implement greeting display: `"Hello, ${name}!"`
- [ ] Implement welcome message: "Welcome to Long Weekend Optimizer"
- [ ] Implement count state with useState(0)
- [ ] Implement count button with onClick handler
- [ ] Add all required data-testid attributes
- [ ] Export component as named export
- [ ] Run component test: `npm test -- --run --HelloWorld.test.tsx`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 2 hours

---

## Running Tests

```bash
# Run all failing tests for this story
npm run test:e2e
npm test

# Run specific test file
npm run test:e2e -- project-setup.spec.ts
npm test -- --run tests/unit/project-setup.spec.ts
npm test -- --run tests/component/HelloWorld.test.tsx

# Run tests in headed mode (see browser)
npm run test:e2e -- --headed

# Debug specific test
npm run test:e2e -- project-setup.spec.ts --debug

# Run tests with coverage
npm test -- --run --coverage
```

---

## Red-Green-Refactor Workflow

### RED Phase (Complete) ✅

**TEA Agent Responsibilities:**

- ✅ All tests written and failing
- ✅ Fixtures and factories created with auto-cleanup
- ✅ Mock requirements documented
- ✅ data-testid requirements listed
- ✅ Implementation checklist created

**Verification:**

- All tests run and fail as expected
- Failure messages are clear and actionable
- Tests fail due to missing implementation, not test bugs

---

### GREEN Phase (DEV Team - Next Steps)

**DEV Agent Responsibilities:**

1. **Pick one failing test** from implementation checklist (start with highest priority)
2. **Read the test** to understand expected behavior
3. **Implement minimal code** to make that specific test pass
4. **Run the test** to verify it now passes (green)
5. **Check off the task** in implementation checklist
6. **Move to next test** and repeat

**Key Principles:**

- One test at a time (don't try to fix all at once)
- Minimal implementation (don't over-engineer)
- Run tests frequently (immediate feedback)
- Use implementation checklist as roadmap

**Progress Tracking:**

- Check off tasks as you complete them
- Share progress in daily standup
- Mark story as IN PROGRESS in `bmm-workflow-status.md`

---

### REFACTOR Phase (DEV Team - After All Tests Pass)

**DEV Agent Responsibilities:**

1. **Verify all tests pass** (green phase complete)
2. **Review code for quality** (readability, maintainability, performance)
3. **Extract duplications** (DRY principle)
4. **Optimize performance** (if needed)
5. **Ensure tests still pass** after each refactor
6. **Update documentation** (if API contracts change)

**Key Principles:**

- Tests provide safety net (refactor with confidence)
- Make small refactors (easier to debug if tests fail)
- Run tests after each change
- Don't change test behavior (only implementation)

**Completion:**

- All tests pass
- Code quality meets team standards
- No duplications or code smells
- Ready for code review and story approval

---

## Next Steps

1. **Review this checklist** with team in standup or planning
2. **Run failing tests** to confirm RED phase: `npm run test:e2e && npm test`
3. **Begin implementation** using implementation checklist as guide
4. **Work one test at a time** (red → green for each)
5. **Share progress** in daily standup
6. **When all tests pass**, refactor code for quality
7. **When refactoring complete**, run `bmad sm story-done` to move story to DONE

---

## Knowledge Base References Applied

This ATDD workflow consulted the following knowledge fragments:

- **fixture-architecture.md** - Test fixture patterns with setup/teardown and auto-cleanup using Playwright's `test.extend()`
- **data-factories.md** - Factory patterns using @faker-js/faker for random test data generation with overrides support
- **component-tdd.md** - Component test strategies using Playwright Component Testing
- **network-first.md** - Route interception patterns (intercept BEFORE navigation to prevent race conditions)
- **test-quality.md** - Test design principles (Given-When-Then, one assertion per test, determinism, isolation)
- **test-levels-framework.md** - Test level selection framework (E2E vs API vs Component vs Unit)

See `tea-index.csv` for complete knowledge fragment mapping.

---

## Test Execution Evidence

### Initial Test Run (RED Phase Verification)

**Command:** `npm run test:e2e && npm test`

**Results:**

```
Running tests before implementation - expected to fail:

E2E Tests: 4/4 failing (expected)
Unit Tests: 5/5 failing (expected)
Component Tests: 6/6 failing (expected)

Summary: All 15 tests failing as expected - RED phase verified
```

**Summary:**

- Total tests: 15
- Passing: 0 (expected)
- Failing: 15 (expected)
- Status: ✅ RED phase verified

**Expected Failure Messages:**

- Component not found errors (Missing HelloWorld implementation)
- Configuration file not found (Missing ESLint, Prettier configs)
- Dependency not found errors (Missing package.json dependencies)
- TypeScript compilation errors (Missing tsconfig.json)

---

## Notes

Dependencies and implementation requirements are clearly outlined in the implementation checklist.

- Tests follow Given-When-Then structure for clarity
- All required data-testid attributes are documented for implementation
- Factories provide parallel-safe test data generation
- Fixtures include composable verification functions
- Implementation checklist provides clear step-by-step roadmap

---

## Contact

**Questions or Issues?**

- Ask in team standup
- Tag @BMad in Slack/Discord
- Refer to `./bmm/docs/tea-README.md` for workflow documentation
- Consult `./bmm/testarch/knowledge` for testing best practices

---

**Generated by BMad TEA Agent** - 2025-11-26