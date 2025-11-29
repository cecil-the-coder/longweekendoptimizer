# Test Infrastructure

This directory contains the test suite for the HolidayHacker application.

## Test Strategy

**Test Levels:**
- **Unit (60%)**: Pure functions (dateLogic, localStorage service, utilities)
- **Component (10%)**: React components with Testing Library
- **E2E (30%)**: Critical user journeys with Playwright

**Coverage Targets:**
- Overall: ≥80%
- `dateLogic.ts`: 100% (PRD requirement)

## Directory Structure

```
tests/
├── e2e/                    # Playwright E2E tests
│   ├── add-holiday.spec.ts
│   ├── delete-holiday.spec.ts
│   ├── recommendations.spec.ts
│   ├── persistence.spec.ts
│   └── nfr/                # Non-functional requirement tests
│       ├── performance.spec.ts
│       └── security.spec.ts
├── unit/                   # Vitest unit tests
│   ├── dateLogic.test.ts
│   ├── localStorageService.test.ts
│   └── generateId.test.ts
├── factories/              # Test data factories
│   └── holidayFactory.ts
├── fixtures/               # Reusable test fixtures (future)
├── setup.ts                # Vitest global setup
└── README.md               # This file
```

## Running Tests

### Unit Tests (Vitest)

```bash
# Run all unit tests
npm run test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run specific test file
npm run test tests/unit/dateLogic.test.ts
```

### E2E Tests (Playwright)

```bash
# Run all E2E tests (all browsers)
npm run test:e2e

# Run in headed mode (see browser)
npm run test:e2e -- --headed

# Run specific browser
npm run test:e2e -- --project=chromium

# Run specific test file
npm run test:e2e tests/e2e/recommendations.spec.ts

# Debug mode
npm run test:e2e -- --debug
```

### Cross-Browser Testing

Playwright is configured to test on:
- **Desktop**: Chromium, Firefox, WebKit (Safari)
- **Mobile**: Pixel 5 (Android), iPhone 13 (iOS)

### Performance Testing

```bash
# Run performance NFR tests
npm run test:e2e tests/e2e/nfr/performance.spec.ts

# Run with Lighthouse CI (requires setup)
npx lhci autorun --config=.lighthouserc.json
```

## Test Data Factories

Located in `tests/factories/holidayFactory.ts`, provides controlled test data:

```typescript
import { createThursdayHoliday, createTuesdayHoliday } from '../factories/holidayFactory';

// Use in tests
const thursday = createThursdayHoliday(); // Should recommend Friday
const tuesday = createTuesdayHoliday();   // Should recommend Monday
```

## Writing Tests

### Unit Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { calculateRecommendations } from '../../src/utils/dateLogic';
import { createThursdayHoliday } from '../factories/holidayFactory';

describe('dateLogic', () => {
  it('should recommend Friday for Thursday holiday', () => {
    const holidays = [createThursdayHoliday()];
    const recs = calculateRecommendations(holidays);

    expect(recs).toHaveLength(1);
    expect(recs[0].recommendation).toContain('Friday');
  });
});
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test';

test('should add holiday', async ({ page }) => {
  await page.goto('/');

  await page.getByTestId('holiday-name').fill('Thanksgiving');
  await page.getByTestId('holiday-date').fill('2025-11-27');
  await page.getByTestId('add-holiday').click();

  await expect(page.getByText('Thanksgiving')).toBeVisible();
});
```

## Test Quality Standards

All tests must follow these standards:

- ✅ **No Hard Waits**: Use `waitForLoadState()`, `waitForResponse()`, not `waitForTimeout()`
- ✅ **No Conditionals**: Tests execute same path every time (no if/else, try/catch for flow control)
- ✅ **< 300 Lines**: Keep tests focused
- ✅ **< 1.5 Minutes**: Optimize with factories, avoid UI setup when possible
- ✅ **Explicit Assertions**: Keep `expect()` calls in test bodies, not hidden in helpers
- ✅ **Unique Data**: Use factories for dynamic data, never hardcode IDs
- ✅ **Self-Cleaning**: E2E tests clear localStorage in `beforeEach()`

## Coverage Reports

After running `npm run test:coverage`:

```bash
# View HTML report
open coverage/index.html

# Check coverage thresholds
cat coverage/coverage-summary.json | jq '.total.lines.pct'
```

## CI Integration

Tests run automatically on:
- Every commit (unit tests)
- Pull requests to main (unit + E2E + performance)

See `.github/workflows/ci.yml` for CI configuration.

## Troubleshooting

### Unit Tests Failing

- Ensure dependencies installed: `npm install`
- Check Vitest config: `vitest.config.ts`
- Clear cache: `npm run test -- --clearCache`

### E2E Tests Failing

- Ensure Playwright browsers installed: `npx playwright install`
- Check dev server running: `npm run dev`
- Check Playwright config: `playwright.config.ts`
- View traces: `npx playwright show-trace test-results/.../trace.zip`

### localStorage Tests Failing

- Ensure `tests/setup.ts` is loaded (mocks localStorage for jsdom)
- Check browser context in Playwright tests

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library React](https://testing-library.com/docs/react-testing-library/intro/)
- [Test Design Document](../docs/test-design-system.md)
