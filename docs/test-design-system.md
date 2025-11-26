# System-Level Test Design

**Date:** 2025-11-22
**Author:** BMad
**Project:** Long Weekend Optimizer
**Phase:** Phase 3 (Solutioning) - System-Level Testability Review
**Status:** Review Required

---

## Executive Summary

**Scope:** System-level testability assessment for greenfield React + TypeScript frontend application

**Overall Testability Rating:** ✅ **PASS with CONCERNS**

**High-Level Findings:**
- Architecture is highly testable with pure functions, React Context state, and no external dependencies
- 3 testability concerns identified (error handling, observability, browser compatibility)
- Recommended test split: 60% Unit / 10% Component / 30% E2E (unit-heavy due to 100% coverage mandate on date logic)

**Key Risks:**
- Medium (Score: 4): Local storage failures could lose user data without recovery path
- Low (Score: 2): Limited production observability for debugging user-reported issues
- Low (Score: 3): Browser compatibility assumptions for crypto.randomUUID()

---

## Testability Assessment

### Controllability: ✅ PASS

**Strengths:**
- **Pure client-side architecture** eliminates API mocking complexity (NFR1: 100% client-side, static site)
- **React Context for state** enables easy test isolation via provider wrapping
- **Local storage service abstracted** behind interface - mockable via `window.localStorage` API
- **Date logic as pure function** - `calculateRecommendations()` fully controllable with deterministic inputs
- **No authentication/authorization** complexity (NFR2: no login required)

**Evidence:**
- State management uses React Context pattern (architecture/state-management.md) - tests can inject controlled state
- Architecture specifies Vitest for unit testing with example pure function tests (architecture/testing-requirements.md)
- Date processing uses built-in JavaScript Date (NFR4) - deterministic with controlled inputs

**Test Seeding Strategy:**
- React Context providers can wrap test components with pre-populated holiday data
- localStorage can be mocked with `vi.spyOn(window.localStorage, 'getItem')` in Vitest
- Date calculations accept ISO date strings - easy to construct edge cases (leap years, year boundaries)

**Risk:** Low (Score: 1)
- **Category:** TECH
- **Probability:** 1 (Unlikely) - Well-architected for testability
- **Impact:** 1 (Minor) - No significant controllability gaps
- **Mitigation:** None required

---

### Observability: ✅ PASS

**Strengths:**
- **React component structure** provides clear DOM inspection points via `data-testid` attributes
- **Local storage state** observable via browser DevTools and localStorage API
- **Vitest coverage reporting** configured (testing-requirements.md targets 100% coverage on `dateLogic.ts`)
- **Simple UI with deterministic output** - recommendations display has no async complexity
- **No network calls** - eliminates observability challenges of distributed systems

**Concerns:**
- **No structured logging** or error tracking (Sentry, Datadog) mentioned in architecture
- **No telemetry** for performance monitoring (Core Web Vitals, bundle size tracking)
- **No health check endpoints** (not applicable for static site, but limits production observability)

**Recommendation:**
Add lightweight error boundary component to catch React errors with optional console logging in development mode. Consider Sentry integration for production error tracking (post-MVP enhancement).

**Risk:** Low (Score: 2)
- **Category:** OPS
- **Probability:** 1 (Unlikely) - Simple app with minimal failure modes
- **Impact:** 2 (Degraded) - Limited ability to debug user-reported issues without access to their localStorage
- **Mitigation:** Add error boundary + optional Sentry integration (post-MVP)

---

### Reliability: ✅ PASS with CONCERNS

**Strengths:**
- **No external API calls** = no network failure scenarios to handle
- **No database** = no data consistency issues
- **No authentication** = no session expiry or token refresh complexity
- **Pure frontend bundle** = no server outages
- **Deterministic date logic** = no race conditions or timing issues

**Concerns:**
- **No error handling specified** for localStorage failures:
  - `QuotaExceededError` when storage limit reached
  - `SecurityError` in private browsing mode
  - Corrupted data in localStorage (malformed JSON)
- **No fallback** if `crypto.randomUUID()` unavailable (Safari <15.4, Firefox <95, Chrome <92)
- **No retry logic** for date calculation errors (though pure function, edge cases possible)
- **No offline mode handling** (app requires initial bundle load but then works offline by default)

**Recommendation:**
1. Add try-catch around localStorage operations with user-friendly error messages
2. Add polyfill for `crypto.randomUUID()` or fallback to `Math.random()` + timestamp
3. Add error boundary for React errors
4. Consider in-memory fallback if localStorage unavailable

**Risk:** Medium (Score: 4)
- **Category:** DATA
- **Probability:** 2 (Possible) - localStorage can fail in private browsing, quota exceeded, or browser bugs
- **Impact:** 2 (Degraded) - User loses holiday list, but app doesn't crash (if error handling added)
- **Mitigation:** Add error handling before Story 1.3 (localStorage persistence) - **REQUIRED**

---

## Architecturally Significant Requirements (ASRs)

### ASR-1: Pure Client-Side Architecture (NFR1)

**Quality Attribute:** Deployability, Testability
**Requirement:** "The application must be a 100% client-side application (static site)" (prd/requirements.md:18)
**Architecture Decision:** Vite build tool + React SPA deployed to static hosting (Netlify, Vercel, GitHub Pages)

**Testability Impact:** ✅ **Positive**
- Eliminates backend integration testing complexity
- Enables fast E2E tests with static file serving (no database seeding)
- No API mocking required
- CI/CD pipeline simplified (build → deploy static files)

**Testing Strategy:**
- E2E tests can run against local Vite dev server (`npm run dev`)
- No need for test database, API mocks, or complex environment setup

**Risk:** Low (Score: 1)
- **Category:** TECH
- **Probability:** 1 (Unlikely) - Well-supported pattern
- **Impact:** 1 (Minor) - Static sites are simple to test and deploy
- **Mitigation:** None required

---

### ASR-2: Sub-2-Second Load Time (NFR5)

**Quality Attribute:** Performance
**Requirement:** "The application's core interactive elements must load in under 2 seconds on a standard mobile connection" (prd/requirements.md:22)
**Architecture Decision:** Vite for optimized bundling, Tailwind CSS for minimal CSS payload, no heavy dependencies (React 18 + minimal libs)

**Testability Impact:** ✅ **Positive**
- Can validate with Lighthouse CI (automated in CI/CD)
- Playwright performance profiling via `page.waitForLoadState()` timing
- k6 smoke test for load time validation (if deployed to staging)

**Testing Strategy:**
```typescript
// Playwright performance test
test('should load core UI in under 2 seconds', async ({ page }) => {
  const startTime = Date.now();

  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  await expect(page.getByTestId('add-holiday-form')).toBeVisible();

  const loadTime = Date.now() - startTime;
  expect(loadTime).toBeLessThan(2000); // NFR5 threshold
});
```

**Lighthouse CI Integration:**
```yaml
# .github/workflows/performance.yml
- name: Run Lighthouse CI
  run: |
    npm install -g @lhci/cli
    lhci autorun --config=.lighthouserc.json
```

**`.lighthouserc.json` configuration:**
```json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:3000"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "interactive": ["error", { "maxNumericValue": 2000 }],
        "first-contentful-paint": ["error", { "maxNumericValue": 1500 }]
      }
    }
  }
}
```

**Risk:** Low (Score: 2)
- **Category:** PERF
- **Probability:** 1 (Unlikely to breach) - Simple app with minimal dependencies
- **Impact:** 2 (Degraded UX) - Slow load hurts mobile users
- **Mitigation:** Lighthouse CI in PR checks validates threshold automatically

---

### ASR-3: No PII Collection (NFR7)

**Quality Attribute:** Security, Privacy
**Requirement:** "The application must not collect or transmit any personally identifiable information (PII). All data (the holiday list) must remain in the user's browser" (prd/requirements.md:24)
**Architecture Decision:** No backend, no analytics SDK, no external API calls (all data stays in localStorage)

**Testability Impact:** ✅ **Positive**
- Easy to validate via network monitoring in E2E tests
- Assert zero outbound requests to external domains (except static assets)

**Testing Strategy:**
```typescript
test('should not transmit data to external servers', async ({ page, context }) => {
  const externalRequests: string[] = [];

  // Monitor all network requests
  context.route('**/*', (route) => {
    const url = route.request().url();
    if (!url.startsWith('http://localhost') && !url.startsWith('file://')) {
      externalRequests.push(url);
    }
    route.continue();
  });

  await page.goto('/');

  // Add holiday (should trigger localStorage, NOT network request)
  await page.fill('[data-testid="holiday-name"]', 'Christmas');
  await page.fill('[data-testid="holiday-date"]', '2025-12-25');
  await page.click('[data-testid="add-holiday"]');

  // Verify recommendations displayed (data processed locally)
  await expect(page.getByText(/take.*off/i)).toBeVisible();

  // CRITICAL: No external requests
  expect(externalRequests).toHaveLength(0);
});
```

**Risk:** Low (Score: 1)
- **Category:** SEC
- **Probability:** 1 (Unlikely) - No PII handling = no exposure risk
- **Impact:** 1 (Minor) - Compliance is easy (no data leaves browser)
- **Mitigation:** E2E test validates zero external requests on every commit

---

### ASR-4: 100% Coverage on Date Logic (NFR4 + Testing Requirement)

**Quality Attribute:** Maintainability, Correctness
**Requirement:** "All date-processing logic must be handled by the browser's built-in JavaScript Date objects" (NFR4) + "Aim for 100% coverage on `dateLogic.ts`" (architecture/testing-requirements.md:44)
**Architecture Decision:** `dateLogic.ts` as pure function module, Vitest for unit testing with coverage reporting

**Testability Impact:** ✅ **Positive**
- Pure functions are highly testable (no side effects)
- Deterministic output for given inputs
- Fast execution (milliseconds per test)

**Testing Strategy:**
```typescript
// Example from architecture/testing-requirements.md
describe('calculateRecommendations', () => {
  it('should recommend Friday for a Thursday holiday', () => {
    const holidays: Holiday[] = [
      { id: '1', name: 'Thanksgiving', date: '2025-11-27' } // Thursday
    ];
    const recs = calculateRecommendations(holidays);
    expect(recs.length).toBe(1);
    expect(recs[0].recommendation).toContain('Friday, Nov 28');
  });

  it('should recommend Monday for a Tuesday holiday', () => {
    const holidays: Holiday[] = [
      { id: '1', name: 'Holiday', date: '2025-12-02' } // Tuesday
    ];
    const recs = calculateRecommendations(holidays);
    expect(recs.length).toBe(1);
    expect(recs[0].recommendation).toContain('Monday, Dec 1');
  });

  it('should return no recommendations for a Wednesday holiday', () => {
    const holidays: Holiday[] = [
      { id: '1', name: 'Holiday', date: '2025-12-03' } // Wednesday
    ];
    const recs = calculateRecommendations(holidays);
    expect(recs.length).toBe(0);
  });

  // Edge cases for 100% coverage
  it('should handle leap year (Feb 29)', () => { /* ... */ });
  it('should handle year boundary (Dec 31 → Jan 1)', () => { /* ... */ });
  it('should handle consecutive holidays (no duplicate recommendation)', () => { /* ... */ });
  it('should handle empty holiday list', () => { /* ... */ });
});
```

**Coverage Enforcement in CI:**
```yaml
# .github/workflows/ci.yml
- name: Run tests with coverage
  run: npm run test:coverage

- name: Check coverage threshold
  run: |
    COVERAGE=$(jq '.total.lines.pct' coverage/coverage-summary.json)
    if (( $(echo "$COVERAGE < 100" | bc -l) )); then
      echo "❌ FAIL: dateLogic coverage $COVERAGE% below 100% threshold"
      exit 1
    fi
```

**Risk:** Low (Score: 1)
- **Category:** TECH
- **Probability:** 1 (Unlikely) - Pure function well-architected for testability
- **Impact:** 1 (Minor) - Easy to achieve 100% coverage with edge case tests
- **Mitigation:** None required

---

## Test Levels Strategy

### Recommended Split: **60% Unit / 10% Component / 30% E2E**

**Rationale:**
- **Unit (60%)**: Heavy focus on `dateLogic.ts` (100% coverage mandate) and `localStorageService.ts` (persistence logic)
- **Component (10%)**: Light component testing for React components (form inputs, holiday list rendering) using React Testing Library
- **E2E (30%)**: Critical user journeys (add holiday → see recommendation, delete holiday → recommendation updates, persistence across reload)

**Comparison to Standard Split:**
- **Typical React SPA:** 50% Unit / 20% Component / 30% E2E
- **This app:** More unit-heavy (60%) due to **PRD mandate** for 100% coverage on `dateLogic.ts`

**Anti-pattern to avoid:** Don't duplicate coverage (e.g., testing date logic via E2E when already covered by unit tests)

---

### Test Level Mapping

| Requirement | Test Level | Priority | Rationale |
|------------|------------|----------|-----------|
| **FR4**: Date calculation logic | Unit | P0 | Pure function, all edge cases testable in isolation |
| **FR5**: Recommend Friday for Thursday | Unit | P0 | Business logic in `calculateRecommendations()` |
| **FR6**: Recommend Monday for Tuesday | Unit | P0 | Business logic in `calculateRecommendations()` |
| **FR7**: No duplicate recommendation | Unit + E2E | P0 | Unit test logic, E2E validates UI displays correctly |
| **FR8**: Clear display | E2E | P1 | Visual validation, UI clarity (manual review or visual regression) |
| **FR3**: Local storage persistence | Unit + E2E | P0 | Unit test service interface, E2E validates across page reloads |
| **FR1**: Add holiday UI | E2E | P0 | User-facing workflow, validates form → state → UI update |
| **FR2**: Delete holiday | E2E | P0 | User-facing workflow, validates delete → state → UI update |
| **FR9**: Responsive web | E2E | P1 | Mobile viewport testing with Playwright |
| **NFR5**: Load time <2s | E2E | P1 | Lighthouse CI or timing assertion in E2E test |
| **NFR7**: No PII transmission | E2E | P0 | Network interception - assert no outbound requests |

**Test ID Format:** `{EPIC}.{STORY}-{LEVEL}-{SEQ}`
- Example: `1.4-UNIT-001` (Epic 1, Story 4, Unit Test 1)
- Example: `1.2-E2E-003` (Epic 1, Story 2, E2E Test 3)

---

## NFR Testing Approach

### Security (NFR7: No PII Transmission)

**NFR Criteria:** ✅ PASS
**Status:** Easy to validate - no backend, no analytics, no external APIs

**Approach:** Playwright E2E with network monitoring
**Tools:** Playwright route interception, network request assertions

**Test Strategy:**
```typescript
// tests/e2e/security/no-data-transmission.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Security NFR: No PII Transmission', () => {
  test('should not send data to external servers', async ({ page, context }) => {
    const externalRequests: string[] = [];

    // Capture all network requests
    context.route('**/*', (route) => {
      const url = route.request().url();

      // Allow localhost and file:// (local dev)
      if (!url.startsWith('http://localhost') && !url.startsWith('file://')) {
        externalRequests.push(url);
      }

      route.continue();
    });

    await page.goto('/');

    // Add multiple holidays
    await page.fill('[data-testid="holiday-name"]', 'Thanksgiving');
    await page.fill('[data-testid="holiday-date"]', '2025-11-27');
    await page.click('[data-testid="add-holiday"]');

    await page.fill('[data-testid="holiday-name"]', 'Christmas');
    await page.fill('[data-testid="holiday-date"]', '2025-12-25');
    await page.click('[data-testid="add-holiday"]');

    // Delete a holiday
    await page.click('[data-testid="delete-holiday-0"]');

    // Verify localStorage (local only)
    const holidays = await page.evaluate(() => localStorage.getItem('holidays'));
    expect(holidays).toBeTruthy(); // Data stored locally

    // CRITICAL: No external requests
    expect(externalRequests).toHaveLength(0);
  });
});
```

**Pass Criteria:**
- ✅ PASS: Zero outbound requests to external domains (non-localhost)
- ⚠️ CONCERNS: Optional analytics/error tracking detected but not sending PII
- ❌ FAIL: Any POST/PUT requests to external domains with user data

---

### Performance (NFR5: Load Time <2s)

**NFR Criteria:** ✅ PASS (expected)
**Status:** Simple app with minimal dependencies, likely well under 2s threshold

**Approach:** Lighthouse CI + Playwright performance profiling
**Tools:** Playwright + Lighthouse, optional k6 for smoke testing

**Test Strategy:**

**Option 1: Playwright Timing Assertion**
```typescript
// tests/e2e/performance/load-time.spec.ts
import { test, expect } from '@playwright/test';

test('should load core UI in under 2 seconds (NFR5)', async ({ page }) => {
  const startTime = Date.now();

  await page.goto('/');

  // Wait for critical UI elements (DOMContentLoaded + interactive)
  await page.waitForLoadState('domcontentloaded');
  await expect(page.getByTestId('add-holiday-form')).toBeVisible();

  const loadTime = Date.now() - startTime;

  console.log(`Page load time: ${loadTime}ms`);
  expect(loadTime).toBeLessThan(2000); // NFR5 requirement
});
```

**Option 2: Lighthouse CI (Recommended)**
```yaml
# .github/workflows/performance.yml
name: Performance Tests

on: [pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4

      - name: Install dependencies
        run: npm ci

      - name: Build production bundle
        run: npm run build

      - name: Serve production build
        run: npm run preview &

      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli
          lhci autorun --config=.lighthouserc.json
```

**`.lighthouserc.json`:**
```json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:4173"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "interactive": ["error", { "maxNumericValue": 2000 }],
        "first-contentful-paint": ["error", { "maxNumericValue": 1500 }],
        "speed-index": ["warn", { "maxNumericValue": 2500 }]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

**Pass Criteria:**
- ✅ PASS: Time to Interactive (TTI) <2s (median across 3 runs)
- ⚠️ CONCERNS: TTI 1.8-2.0s (approaching limit, needs optimization)
- ❌ FAIL: TTI >2s on standard mobile connection (3G simulation)

---

### Reliability (Error Handling, Graceful Degradation)

**NFR Criteria:** ⚠️ CONCERNS
**Status:** Error handling not specified in current architecture

**Approach:** Unit tests + E2E error simulation
**Tools:** Vitest for unit tests, Playwright for E2E error scenarios

**Test Strategy:**

**1. Local Storage Error Handling**
```typescript
// tests/unit/localStorageService.test.ts
import { describe, it, expect, vi } from 'vitest';
import { saveHolidays, loadHolidays } from '../src/services/localStorageService';

describe('localStorage error handling', () => {
  it('should handle QuotaExceededError gracefully', () => {
    const mockSetItem = vi.spyOn(window.localStorage, 'setItem');
    mockSetItem.mockImplementation(() => {
      throw new DOMException('QuotaExceededError');
    });

    const consoleErrorSpy = vi.spyOn(console, 'error');

    // Should not crash
    expect(() => saveHolidays([/* large list */])).not.toThrow();

    // Should log error
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('quota')
    );
  });

  it('should return empty array when localStorage unavailable', () => {
    const mockGetItem = vi.spyOn(window.localStorage, 'getItem');
    mockGetItem.mockImplementation(() => {
      throw new Error('SecurityError: localStorage disabled');
    });

    const holidays = loadHolidays();

    // Graceful degradation: return empty list
    expect(holidays).toEqual([]);
  });

  it('should handle corrupted localStorage data', () => {
    const mockGetItem = vi.spyOn(window.localStorage, 'getItem');
    mockGetItem.mockReturnValue('invalid JSON {]');

    const holidays = loadHolidays();

    // Graceful degradation: return empty list, don't crash
    expect(holidays).toEqual([]);
  });
});
```

**2. Browser Compatibility (crypto.randomUUID polyfill)**
```typescript
// tests/unit/polyfills.test.ts
import { describe, it, expect, vi } from 'vitest';

describe('crypto.randomUUID polyfill', () => {
  it('should use crypto.randomUUID when available', () => {
    const id = generateId(); // Helper using crypto or fallback
    expect(id).toMatch(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/);
  });

  it('should fallback when crypto.randomUUID unavailable', () => {
    const originalCrypto = global.crypto;

    // @ts-ignore - Simulate old browser
    global.crypto = { randomUUID: undefined };

    const id = generateId(); // Should use Math.random fallback
    expect(id).toBeTruthy();
    expect(id.length).toBeGreaterThan(10);

    global.crypto = originalCrypto;
  });
});
```

**3. React Error Boundary**
```typescript
// tests/e2e/reliability/error-boundary.spec.ts
import { test, expect } from '@playwright/test';

test('should show error UI when component crashes', async ({ page }) => {
  // Inject error into component (simulate bug)
  await page.route('**/api/holidays', (route) => {
    route.fulfill({ status: 500, body: 'Internal Error' });
  });

  await page.goto('/');

  // Trigger error (if component has error handling)
  await page.click('[data-testid="trigger-error"]');

  // Should show error boundary UI (not white screen of death)
  await expect(page.getByText(/Something went wrong/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /Reload/i })).toBeVisible();
});
```

**Pass Criteria:**
- ✅ PASS: Error handling, graceful degradation, polyfills tested
- ⚠️ CONCERNS: Partial coverage (missing error boundary or localStorage fallback)
- ❌ FAIL: No recovery path (localStorage failure crashes app)

**Current Status:** ⚠️ **CONCERNS** - Error handling not specified in architecture (see Testability Concerns section)

---

### Maintainability (Coverage, Code Quality)

**NFR Criteria:** ✅ PASS (expected)
**Status:** ESLint + Prettier configured (Story 1.1), Vitest coverage configured

**Approach:** CI-based tooling (NOT Playwright)
**Tools:** Vitest coverage report, ESLint, Prettier

**Test Strategy:**
```yaml
# .github/workflows/quality.yml
name: Code Quality

on: [push, pull_request]

jobs:
  coverage:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4

      - name: Install dependencies
        run: npm ci

      - name: Run tests with coverage
        run: npm run test:coverage

      - name: Check coverage threshold (80% overall, 100% dateLogic)
        run: |
          TOTAL_COVERAGE=$(jq '.total.lines.pct' coverage/coverage-summary.json)
          DATELOGIC_COVERAGE=$(jq '.["src/utils/dateLogic.ts"].lines.pct' coverage/coverage-summary.json)

          echo "Total coverage: $TOTAL_COVERAGE%"
          echo "dateLogic coverage: $DATELOGIC_COVERAGE%"

          # Overall: ≥80%
          if (( $(echo "$TOTAL_COVERAGE < 80" | bc -l) )); then
            echo "❌ FAIL: Total coverage $TOTAL_COVERAGE% below 80% threshold"
            exit 1
          fi

          # dateLogic: 100% (PRD requirement)
          if (( $(echo "$DATELOGIC_COVERAGE < 100" | bc -l) )); then
            echo "❌ FAIL: dateLogic coverage $DATELOGIC_COVERAGE% below 100% threshold"
            exit 1
          fi

          echo "✅ PASS: Coverage meets thresholds"

  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Check formatting (Prettier)
        run: npm run format:check
```

**Pass Criteria:**
- ✅ PASS: Coverage ≥80% overall, 100% on dateLogic, no ESLint errors, Prettier formatted
- ⚠️ CONCERNS: Coverage 60-79%, minor linting issues
- ❌ FAIL: Coverage <60%, critical linting errors

---

## Test Environment Requirements

### Local Development
- **Runtime:** Node.js 18+ (for Vite + Vitest)
- **Browser:** Chromium (Playwright), or native browser (manual testing)
- **Storage:** Browser localStorage enabled (not private browsing mode)
- **Tools:** npm/yarn for package management

### CI/CD Pipeline
- **Environment:** Ubuntu latest (GitHub Actions)
- **Browser:** Playwright Chromium (headless mode)
- **Node:** 18.x or 20.x
- **Artifacts:**
  - Test reports (Playwright HTML reporter)
  - Coverage reports (Vitest JSON + HTML)
  - Lighthouse reports (HTML + JSON)

### Deployment Target
- **Hosting:** Static file hosting (Netlify, Vercel, GitHub Pages)
- **Requirements:**
  - HTTPS enabled (best practice, not strictly required)
  - No server-side logic required
  - CDN optional (for performance)

**Staging Environment:** Not required - static site can be tested via:
- Local Vite dev server (`npm run dev`)
- Vite preview server (`npm run preview`)
- Netlify/Vercel preview deployments (PR-based)

---

## Testability Concerns

### 1. ⚠️ Limited Error Handling (Score: 4 - MEDIUM PRIORITY)

**Category:** DATA
**Risk ID:** R-001

**Issue:** No error handling specified for localStorage failures
- `QuotaExceededError` when storage limit reached (rare but possible)
- `SecurityError` in private browsing mode (localStorage disabled)
- Corrupted data in localStorage (malformed JSON, browser bug)

**Impact:** User loses holiday list if storage fails, no recovery path
- **Probability:** 2 (Possible) - Private browsing mode common, quota exceeded rare
- **Impact:** 2 (Degraded) - User loses data but app doesn't crash (if error handling added)
- **Score:** 2 × 2 = **4 (Medium)**

**Mitigation:**
1. Add try-catch around localStorage operations in `localStorageService.ts`
2. Show user-friendly error message: "Unable to save holidays. Try clearing browser storage."
3. Optional: In-memory fallback if localStorage unavailable (data lost on refresh)
4. Optional: Export/import feature for data portability

**Owner:** TBD (Dev Team)
**Deadline:** Before Story 1.3 implementation (localStorage persistence)
**Status:** OPEN

**Test Coverage Required:**
- Unit test: `QuotaExceededError` handling
- Unit test: `SecurityError` handling (private browsing)
- Unit test: Corrupted JSON parsing
- E2E test: Error message displayed to user

---

### 2. ⚠️ No Production Observability (Score: 2 - LOW PRIORITY)

**Category:** OPS
**Risk ID:** R-002

**Issue:** No error tracking (Sentry), logging, or telemetry for production debugging
- No way to diagnose user-reported bugs without access to their browser
- No visibility into real-world performance (actual load times, browser versions)
- No crash reporting

**Impact:** User-reported bugs difficult to reproduce without user's localStorage state
- **Probability:** 1 (Unlikely) - Simple app with minimal failure modes
- **Impact:** 2 (Degraded) - Debugging harder, slower bug resolution
- **Score:** 1 × 2 = **2 (Low)**

**Mitigation (Optional - Post-MVP):**
1. Add lightweight error boundary with console logging (development mode)
2. Consider Sentry for production error tracking (free tier available)
3. Consider Google Analytics or Plausible for usage analytics (respecting NFR7: no PII)

**Owner:** TBD (Product Team decision)
**Deadline:** Post-MVP enhancement (not blocking release)
**Status:** OPEN (Optional)

**Test Coverage Required:**
- Unit test: Error boundary catches React errors
- E2E test: Error boundary displays fallback UI

---

### 3. ⚠️ Browser Compatibility Assumptions (Score: 3 - LOW-MEDIUM PRIORITY)

**Category:** TECH
**Risk ID:** R-003

**Issue:** `crypto.randomUUID()` not available in older browsers
- Safari <15.4 (released March 2022)
- Firefox <95 (released December 2021)
- Chrome <92 (released July 2021)
- No polyfill specified in architecture

**Impact:** App breaks in older browsers (holiday IDs cannot be generated)
- **Probability:** 1 (Unlikely) - Most users on modern browsers, but edge cases exist
- **Impact:** 3 (Critical) - App completely broken for affected users (cannot add holidays)
- **Score:** 1 × 3 = **3 (Low-Medium)**

**Mitigation:**
1. Add polyfill or fallback for `crypto.randomUUID()`
2. Option A: Use `uuid` npm package (adds 5KB to bundle)
3. Option B: Fallback to `Math.random()` + timestamp (less collision-safe but sufficient for local use)

**Example Fallback:**
```typescript
// src/utils/generateId.ts
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback for older browsers
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}
```

**Owner:** TBD (Dev Team)
**Deadline:** Before Story 1.2 implementation (holiday ID generation)
**Status:** OPEN

**Test Coverage Required:**
- Unit test: `crypto.randomUUID()` used when available
- Unit test: Fallback used when unavailable
- E2E test: Cross-browser testing (Playwright projects: chromium, firefox, webkit)

---

## Recommendations for Sprint 0

### 1. Initialize Test Framework (*framework workflow)

**Action:** Run `*framework` workflow to scaffold Playwright + Vitest test structure

**Deliverables:**
- Playwright E2E test structure (`tests/e2e/`)
- Vitest unit test configuration (already specified in tech stack)
- Test data factories (`tests/factories/holidayFactory.ts`)
- Shared fixtures for React Context providers

**Example Factory:**
```typescript
// tests/factories/holidayFactory.ts
import { faker } from '@faker-js/faker';
import type { Holiday } from '../src/context/HolidayContext';

export function createHoliday(overrides?: Partial<Holiday>): Holiday {
  return {
    id: crypto.randomUUID(),
    name: faker.commerce.productName(),
    date: '2025-11-27', // Default: Thanksgiving (Thursday)
    ...overrides,
  };
}

export function createThursdayHoliday(): Holiday {
  return createHoliday({ date: '2025-11-27' }); // Recommend Friday
}

export function createTuesdayHoliday(): Holiday {
  return createHoliday({ date: '2025-12-02' }); // Recommend Monday
}

export function createWednesdayHoliday(): Holiday {
  return createHoliday({ date: '2025-12-03' }); // No recommendation
}

export function createConsecutiveHolidays(): Holiday[] {
  return [
    createHoliday({ name: 'Thanksgiving', date: '2025-11-27' }), // Thursday
    createHoliday({ name: 'Day After Thanksgiving', date: '2025-11-28' }), // Friday (duplicate rec)
  ];
}
```

---

### 2. Define Test Data Strategy

**Action:** Create data factories for edge cases

**Deliverables:**
- Holiday factory with controlled dates
- Edge case factories:
  - Leap year holidays (Feb 29, 2024)
  - Year boundary holidays (Dec 31 → Jan 1)
  - Consecutive holidays (Thanksgiving + Black Friday)
  - Weekend holidays (Saturday, Sunday - no recommendation)
  - Invalid dates (Feb 30, negative years)

**Example Edge Cases:**
```typescript
// tests/factories/holidayFactory.ts (continued)
export function createLeapYearHoliday(): Holiday {
  return createHoliday({ name: 'Leap Day', date: '2024-02-29' }); // Thursday
}

export function createYearBoundaryHoliday(): Holiday {
  return createHoliday({ name: 'New Year Eve', date: '2025-12-31' }); // Wednesday (no rec)
}

export function createWeekendHoliday(): Holiday {
  return createHoliday({ name: 'Saturday Holiday', date: '2025-11-29' }); // Saturday (no rec)
}
```

---

### 3. Set Up CI Pipeline (*ci workflow)

**Action:** Run `*ci` workflow to scaffold GitHub Actions

**Deliverables:**
```yaml
# .github/workflows/ci.yml
name: CI Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests with coverage
        run: npm run test:coverage

      - name: Check coverage thresholds
        run: |
          # Overall: ≥80%, dateLogic: 100%
          npm run coverage:check

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Build production bundle
        run: npm run build

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/

  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4

      - name: Install dependencies
        run: npm ci

      - name: Build production bundle
        run: npm run build

      - name: Start preview server
        run: npm run preview &

      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli
          lhci autorun --config=.lighthouserc.json

  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Check Prettier formatting
        run: npm run format:check
```

**Quality Gates:**
- Unit tests pass with ≥80% coverage (100% on dateLogic)
- E2E tests pass (all P0 scenarios)
- Lighthouse CI validates <2s load time
- ESLint + Prettier checks pass

---

### 4. Add Error Handling Specification

**Action:** Update architecture to include error handling requirements

**Deliverables:**
1. **Error Boundary Component**
```typescript
// src/components/ErrorBoundary.tsx
import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('React Error Boundary caught:', error, errorInfo);
    // Optional: Send to Sentry
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h1>Something went wrong</h1>
          <p>We're sorry for the inconvenience. Please reload the page.</p>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

2. **localStorage Error Handling**
```typescript
// src/services/localStorageService.ts (updated)
export function saveHolidays(holidays: Holiday[]): void {
  try {
    const serialized = JSON.stringify(holidays);
    window.localStorage.setItem('holidays', serialized);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded:', error);
      alert('Unable to save holidays. Please clear browser storage and try again.');
    } else {
      console.error('Failed to save holidays:', error);
    }
  }
}

export function loadHolidays(): Holiday[] {
  try {
    const serialized = window.localStorage.getItem('holidays');
    if (!serialized) return [];

    const holidays = JSON.parse(serialized);
    return Array.isArray(holidays) ? holidays : [];
  } catch (error) {
    console.error('Failed to load holidays:', error);
    return []; // Graceful degradation
  }
}
```

3. **crypto.randomUUID Polyfill**
```typescript
// src/utils/generateId.ts
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback for Safari <15.4, Firefox <95, Chrome <92
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}
```

---

### 5. Clarify Browser Support

**Action:** Update technical assumptions to specify browser compatibility

**Deliverables:**

**Update `prd/technical-assumptions.md`:**
```markdown
## Supported Browsers

**Minimum Versions:**
- Chrome 92+ (July 2021)
- Firefox 95+ (December 2021)
- Safari 15.4+ (March 2022)
- Edge 92+ (July 2021)

**Rationale:**
- `crypto.randomUUID()` availability (with polyfill fallback)
- Modern JavaScript features (ES2021)
- CSS Grid and Flexbox support

**Testing Strategy:**
- Playwright cross-browser testing (chromium, firefox, webkit)
- Manual QA on Safari (Mac/iOS) and Chrome (Android)
```

**Update Playwright Config:**
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'] },
    },
  ],
});
```

---

## Summary

### Overall Testability Rating: ✅ PASS with CONCERNS

**Strengths:**
- Pure client-side architecture eliminates backend complexity
- Pure function date logic highly testable (100% coverage achievable)
- React Context state easily mockable for tests
- No external dependencies = no integration testing complexity

**Concerns:**
- 3 testability issues identified (error handling, observability, browser compatibility)
- All concerns have clear mitigation plans with owners and deadlines

**Recommendation:**
Address 3 testability concerns (R-001, R-002, R-003) before proceeding to implementation. Run `*framework` and `*ci` workflows to scaffold test infrastructure. Proceed to Implementation Readiness gate check when concerns resolved.

---

**Next Steps:**

1. ✅ Review this testability assessment with team
2. ⚠️ Address 3 testability concerns (R-001, R-002, R-003)
3. 🚀 Run `*framework` to scaffold test structure
4. 🚀 Run `*ci` to set up CI/CD pipeline
5. ✅ Proceed to `*implementation-readiness` gate check when ready

**Gate Decision:** ⚠️ **CONCERNS** - Resolve 3 medium/low priority concerns before implementation.

---

**Generated by:** BMad TEA Agent - Test Architect Module
**Workflow:** `.bmad/bmm/testarch/test-design`
**Version:** 4.0 (BMad v6)
**Mode:** System-Level (Phase 3 - Solutioning)
