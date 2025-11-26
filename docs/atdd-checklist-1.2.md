# ATDD Implementation Checklist - Story 1.2: Holiday Input UI

**Generated**: 2025-11-26
**Test Architect**: Murat
**Status**: RED Phase - Tests Failing (Ready for Development)

---

## Story Overview

**As a user, I want to add and see a list of my company's holidays, so that the app has the data it needs to find my long weekends.**

**Epic**: 1 - Foundation & Core Functionality
**Primary Test Level**: Component Tests (React + Vitest + React Testing Library)

---

## Acceptance Criteria Coverage

| AC | Acceptance Criteria | Test Files | Status |
|----|-------------------|------------|---------|
| AC1 | Simple form with "Holiday Name" text input and "Holiday Date" date picker | `HolidayForm.test.tsx` | ✅ Covered |
| AC2 | When "Add Holiday" button clicked, holiday added to visible list | `HolidayIntegration.test.tsx` | ✅ Covered |
| AC3 | Holiday list displays name and formatted date ("Thanksgiving - Thursday, Nov 27, 2025") | `HolidayList.test.tsx` | ✅ Covered |
| AC4 | Delete button removes holiday from list | `HolidayList.test.tsx` | ✅ Covered |
| AC5 | UI is responsive and usable on mobile | `HolidayForm.test.tsx`, `HolidayList.test.tsx` | ✅ Covered |

---

## Failing Tests Created

### Component Tests

1. **`tests/component/HolidayForm.test.tsx`** (6 test cases)
   - Form input fields and labels (AC1)
   - Form validation and error handling
   - Button state management
   - Responsive design

2. **`tests/component/HolidayList.test.tsx`** (13 test cases)
   - Holiday display and formatting (AC3)
   - Delete functionality with confirmation (AC4)
   - Empty state handling
   - Mobile responsiveness (AC5)

3. **`tests/component/HolidayIntegration.test.tsx`** (8 test cases)
   - Complete holiday addition workflow (AC2)
   - Form-list integration
   - Error handling scenarios
   - Edge cases and validation

**Total Test Files**: 3
**Total Test Cases**: 27

---

## Data Infrastructure Built

### Factories Created

1. **`tests/support/factories/holiday.factory.ts`** (270 lines)
   - `createHoliday()` - Generate single holiday with faker
   - `createHolidays()` - Bulk holiday generation
   - `createCommonHoliday()` - Realistic holiday data
   - `createDateFormattingTestHolidays()` - Date formatting edge cases
   - `createValidationTestHolidays()` - Validation scenario data

### Fixtures Created

1. **`tests/support/fixtures/holiday.fixture.ts`** (350+ lines)
   - Extended vitest fixtures with holiday context
   - Composable test utilities
   - Mock HolidayContext setup
   - Mobile simulation helpers
   - Accessibility testing helpers
   - Specialized test scenarios

### Test Infrastructure Features

- **Auto-cleanup**: All fixtures automatically clean up state
- **Parallel-safe**: Faker-generated data prevents test collisions
- **Composable**: Fixtures can be mixed and matched
- **Type-safe**: Full TypeScript support with proper typing
- **Accessibility**: Built-in accessibility assertions

---

## Required Data-TestID Attributes

### Form Components (HolidayForm)

| data-testid | Element | Required for Tests |
|-------------|---------|-------------------|
| `add-holiday-form` | Form container | ✅ Form visibility and structure |
| `holiday-name` | Name input field | ✅ Form filling and validation |
| `holiday-date` | Date input field | ✅ Form filling and validation |
| `add-holiday` | Submit button | ✅ Form submission and state |

### Validation Elements

| data-testid | Element | Purpose |
|-------------|---------|---------|
| `name-error` | Name validation error | ✅ Empty name validation |
| `date-error` | Date validation error | ✅ Empty date validation |

### List Components (HolidayList)

| data-testid | Element | Required for Tests |
|-------------|---------|-------------------|
| `holiday-list` | List container | ✅ List visibility |
| `holiday-item` | Individual holiday item | ✅ Item counting and structure |
| `holiday-formatted-date` | Formatted date display | ✅ Date formatting verification |
| `holiday-delete-button` | Delete action button | ✅ Delete functionality |

| data-holiday-id | Attribute | Purpose |
|----------------|-----------|---------|
| `data-holiday-id` | Delete button attribute | ✅ Identify specific holiday for deletion |

### Empty State

| data-testid | Element | Purpose |
|-------------|---------|---------|
| `empty-holiday-list` | Empty state container | ✅ Empty state visibility |

### Error Handling

| data-testid | Element | Purpose |
|-------------|---------|---------|
| `error-message` | Error display | ✅ Error scenario testing |

---

## Implementation Checklist

### Epic 1 - Foundation & Core Functionality: Story 1.2

#### Phase 1: Data Structure and Context
- [ ] **Create Holiday type definition**
  ```typescript
  // src/types/holiday.ts
  export interface Holiday {
    id: string;
    name: string;
    date: string;
  }
  ```

- [ ] **Update HolidayContext.tsx**
  - Add `addHoliday` function: `(holiday: Omit<Holiday, 'id'>) => Promise<void>`
  - Add `deleteHoliday` function: `(id: string) => Promise<void>`
  - Ensure state persistence with localStorage
  - Add proper error handling and loading states

#### Phase 2: HolidayForm Component (AC1)

**Test**: `tests/component/HolidayForm.test.tsx`

- [ ] **Create `src/components/HolidayForm.tsx`**
  ```typescript
  // Required structure based on failing tests
  import { useState } from 'react';
  import { useHolidays } from '../hooks/useHolidays';

  export const HolidayForm = () => {
    // Form validation logic
    // Handle form submission
    // Clear form after submission
    // Loading states
  };
  ```

- [ ] **Implement form structure**
  - Form container with `data-testid="add-holiday-form"`
  - Name input: `type="text"`, `data-testid="holiday-name"`, `aria-label="Holiday Name"`, `placeholder="Enter holiday name"`
  - Date input: `type="date"`, `data-testid="holiday-date"`, `aria-label="Holiday Date"`
  - Submit button: `type="button"`, `data-testid="add-holiday"`, default text "Add Holiday"

- [ ] **Add form validation**
  - Required field validation for both inputs
  - Display `data-testid="name-error"` when name empty
  - Display `data-testid="date-error"` when date empty
  - Disable submit button when form invalid

- [ ] **Implement responsive design**
  - Add mobile-friendly CSS classes
  - Use Tailwind responsive utilities
  - Ensure touch targets meet accessibility standards (44px minimum)

#### Phase 3: HolidayList Component (AC3, AC4)

**Test**: `tests/component/HolidayList.test.tsx`

- [ ] **Create `src/components/HolidayList.tsx`**
  ```typescript
  export const HolidayList = () => {
    // Display holidays from context
    // Render HolidayListItem for each
    // Show empty state when no holidays
  };
  ```

- [ ] **Create `src/components/HolidayListItem.tsx`**
  ```typescript
  export const HolidayListItem = ({ holiday }) => {
    // Display formatted date
    // Delete button with confirmation
    // Responsive design
  };
  ```

- [ ] **Implement date formatting**
  ```typescript
  // Utility function matching format: "Thanksgiving - Thursday, Nov 27, 2025"
  const formatHolidayDate = (dateString: string, name: string): string => {
    // Format logic to match test expectations
  };
  ```

- [ ] **Add delete functionality**
  - Delete button with `data-testid="holiday-delete-button"`
  - `data-holiday-id` attribute for holiday identification
  - `window.confirm()` dialog before deletion
  - Call `deleteHoliday` from context on confirmation

- [ ] **Implement empty state**
  - Container with `data-testid="empty-holiday-list"`
  - Informative message for user guidance

#### Phase 4: Integration Component (AC2)

**Test**: `tests/component/HolidayIntegration.test.tsx`

- [ ] **Create `src/components/HolidayApp.tsx`**
  ```typescript
  export const HolidayApp = () => {
    return (
      <div>
        <HolidayForm />
        <HolidayList />
      </div>
    );
  };
  ```

- [ ] **Connect form and list through shared context**
  - Ensure form updates list via HolidayContext
  - Test immediate UI updates without page refresh

- [ ] **Add error handling**
  - Error container with `data-testid="error-message"`
  - Graceful error display when add/delete fails
  - Console error logging

#### Phase 5: Mobile Responsiveness (AC5)

- [ ] **Implement responsive Tailwind classes**
  ```css
  /* Mobile-first responsive design */
  .holiday-form {
    /* Mobile styles */
  }

  @media (min-width: 768px) {
    .holiday-form {
      /* Desktop styles */
    }
  }
  ```

- [ ] **Add mobile-specific test attributes**
  - Mobile-friendly CSS classes for testing
  - Touch-friendly delete buttons (44px minimum)

- [ ] **Test viewport compatibility**
  - iPhone SE (375x667) viewport
  - Ensure all interactions work on mobile devices

---

## Red-Green-Refactor Workflow

### ✅ RED Phase Complete (TEA Responsibility)

- [x] **All 27 test cases written and failing**
- [x] **Component tests cover all acceptance criteria**
- [x] **Data factories created with faker for parallel safety**
- [x] **Fixtures created with auto-cleanup**
- [x] **Mock requirements documented for DEV team**
- [x] **Required data-testid attributes listed**

### 🔄 GREEN Phase (DEV Team Responsibility)

**Development Tasks:**

1. **Run tests to verify RED phase**
   ```bash
   npm run test tests/component/HolidayForm.test.tsx
   npm run test tests/component/HolidayList.test.tsx
   npm run test tests/component/HolidayIntegration.test.tsx
   ```

2. **Implement one feature at a time**
   - Start with HolidayForm basic structure
   - Add validation logic
   - Create HolidayList with basic display
   - Add delete functionality
   - Implement integration

3. **Make tests pass incrementally**
   - Each implementation should make corresponding tests green
   - Verify passing after each major feature

### 🔄 REFACTOR Phase (DEV Team Responsibility)

**After all tests GREEN:**

- [ ] **Extract reusable utilities**
  - Date formatting function
  - Form validation helpers
  - Error handling utilities

- [ ] **Optimize component structure**
  - Split large components if needed
  - Extract custom hooks for logic
  - Improve TypeScript types

- [ ] **Performance optimization**
  - Review re-renders
  - Optimize context usage
  - Add React.memo where needed

---

## Running Tests

### Execute All Holiday Tests
```bash
# Run component tests for holiday functionality
npm run test tests/component/Holiday*.test.tsx

# Run with coverage
npm run test tests/component/Holiday*.test.tsx -- --coverage

# Watch mode for development
npm run test tests/component/Holiday*.test.tsx -- --watch
```

### Run Specific Test Files
```bash
# Form component tests
npm run test tests/component/HolidayForm.test.tsx

# List component tests
npm run test tests/component/HolidayList.test.tsx

# Integration tests
npm run test tests/component/HolidayIntegration.test.tsx
```

### Debug Mode
```bash
# Run tests with VSCode debugging
npm run test tests/component/HolidayForm.test.tsx -- --run --inspect=9229
```

---

## Mock Requirements for DEV Team

### Holiday Context

```javascript
// Mock context structure expected by tests
const mockHolidayContext = {
  holidays: Holiday[],
  addHoliday: (holiday: { name: string; date: string }) => Promise<void>,
  deleteHoliday: (id: string) => Promise<void>,
  isLoading: boolean,
  error: string | null,
};
```

### Browser APIs

- **`window.confirm()`**: Used for delete confirmation dialog
- **`localStorage`**: Required for holiday persistence
- **Date API**: For date formatting logic

---

## Knowledge Base Patterns Applied

### Fixture Architecture
- ✅ Pure functions → fixture → composable pattern
- ✅ Auto-cleanup in fixture teardown
- ✅ Framework-agnostic helper functions

### Data Factories
- ✅ Faker-generated data for collision safety
- ✅ Override support for specific test scenarios
- ✅ Complete valid objects with sensible defaults

### Component TDD
- ✅ Red-Green-Refactor cycle structure
- ✅ Provider isolation for context testing
- ✅ Accessibility assertions alongside functionality

### Test Quality
- ✅ Atomic tests (one assertion per test)
- ✅ Deterministic test execution
- ✅ No recursive test execution prevention

---

## Implementation Estimates

**Total Development Tasks**: 25
**Estimated Effort**: 12-16 hours

| Component | Estimated Hours |
|-----------|----------------|
| HolidayForm | 4-5 hours |
| HolidayList + HolidayListItem | 5-6 hours |
| HolidayContext updates | 2-3 hours |
| HolidayApp integration | 1-2 hours |
| Responsive design polish | 2-3 hours |

---

## Success Criteria

### Test Coverage
- [ ] All 27 component tests passing
- [ ] Code coverage ≥ 90% for new components
- [ ] No console errors in test output

### Functionality
- [ ] All acceptance criteria working per tests
- [ ] Form validation working correctly
- [ ] Holiday addition, display, and deletion functional
- [ ] Mobile responsive behavior
- [ ] Accessibility features working

### Technical Quality
- [ ] TypeScript strict mode compliance
- [ ] No eslint warnings/errors
- [ ] Proper error handling throughout
- [ ] Clean, maintainable code structure

---

## Next Steps for DEV Team

1. **Start GREEN Phase**: Run failing tests to confirm RED phase
2. **Implement incrementally**: One component at a time
3. **Verify after each feature**: Corresponding tests should turn green
4. **Complete REFACTOR phase**: Once all tests pass
5. **Share progress**: Update in daily standup with test status

**Tests are ready for development. Begin with HolidayForm component implementation.**