# ATDD Checklist: Story 1.5 - Display Recommendations

**Story**: 1.5 - Display Recommendations
**Status**: Tests in RED Phase (Failing)
**Primary Test Level**: Component Tests
**Generated**: 2025-11-27

---

## Story Summary

**As a user, I want to see the long-weekend recommendations clearly, so that I can get the value I came for.**

This story focuses on creating the user-facing display for long weekend recommendations by implementing RecommendationCard and RecommendationsSection components that present the calculateRecommendations output in an accessible and responsive interface.

---

## Acceptance Criteria Coverage

| AC | Requirement | Test Coverage | Status |
|----|-------------|---------------|--------|
| **AC1** | Dedicated "Recommendations" area visible on page | ✅ RecommendationsSection.test.tsx - AC1 tests | ❌ Failing |
| **AC2** | Auto-update when holiday list changes (add/delete) | ✅ RecommendationsSection.test.tsx - AC2 tests | ❌ Failing |
| **AC3** | Clear empty state message when no opportunities | ✅ RecommendationsSection.test.tsx - AC3 tests | ❌ Failing |
| **AC4** | Clear, readable list display with formatting | ✅ RecommendationCard.test.tsx - AC4 tests | ❌ Failing |
| **AC5** | Chronological sorting by holiday date | ✅ RecommendationsSection.test.tsx - AC5 tests | ❌ Failing |
| **AC6** | Responsive and accessible design with ARIA labels | ✅ Both components - AC6 tests | ❌ Failing |

---

## Test Files Created (RED Phase)

### Component Tests
- **`tests/component/RecommendationCard.test.tsx`** - Individual recommendation display tests
  - 25 test cases covering AC4 and AC6
  - Tests structured display format, emphasis, accessibility
  - Coverage of 3-day vs 4-day weekend explanations

- **`tests/component/RecommendationsSection.test.tsx`** - Recommendations container tests
  - 30+ test cases covering AC1, AC2, AC3, AC5
  - Tests section structure, empty states, auto-update behavior
  - Chronological sorting and response to prop changes

- **`tests/component/RecommendationsIntegration.test.tsx`** - Complete workflow tests
  - 15 integration test cases covering end-to-end scenarios
  - Tests holiday→recommendations workflow, accessibility integration
  - Performance and error handling validation

### Test Infrastructure Created
- **`tests/support/factories/recommendation.factory.ts`** - Recommendation data factory (185 lines)
- **`tests/support/fixtures/recommendations.fixture.ts`** - Test fixtures with auto-cleanup (220 lines)
- **`tests/support/utils/recommendations.testUtils.ts`** - Test utilities and assertions (280 lines)

---

## Failed Test Summary

**Total Tests**: 70+ tests across 3 test files
**Current Status**: ALL FAILING (Red Phase Confirmed) ✅

**Failure Categories**:
- Component import failures (components don't exist yet)
- Missing `data-testid` attributes not implemented
- ARIA labels and semantic structure not implemented
- Sorting logic not implemented
- Responsive styling classes not implemented
- Auto-update behavior not implemented

**Expected Failure Behavior**: ✅ Tests fail due to missing implementation, not test bugs

---

## Supporting Infrastructure Built

### Data Factories
- **Recommendation Factory**: Creates test recommendations with faker-generated data
- **Test Scenarios Factory**: Provides Thanksgiving, Labor Day, Christmas scenarios
- **Explanation Type Factory**: 3-day vs 4-day weekend recommendation scenarios
- **Edge Case Factory**: Long names, special characters, invalid data

### Test Fixtures
- **Pure Functions**: Factory functions usable in unit tests without framework overhead
- **Composable Fixtures**: mergeTests pattern for combining capabilities
- **Auto-Cleanup**: All created data tracked and cleaned up automatically
- **Provider Isolation**: Fresh providers per test to prevent state pollution

### Test Utilities
- **RecommendationAssertions**: Structural and chronological validation
- **DOMAssertions**: Accessibility and semantic structure verification
- **PerformanceTestUtils**: Render time measurement utilities
- **ErrorTestUtils**: Malformed data and edge case generation

---

## Implementation Checklist

### Epic 1 - Core Functionality
#### Story 1.5 - Display Recommendations

### 🔧 **Step 1: Create RecommendationCard Component (AC4, AC6)**

**File**: `src/components/RecommendationCard.tsx`
- [ ] **Set up component structure**
  - [ ] Import React and necessary types
  - [ ] Define `RecommendationCardProps` interface
  - [ ] Create functional component with props typing
  - [ ] Add `data-testid="recommendation-card"` to root element

- [ ] **Display holiday name with emphasis**
  - [ ] Render holiday name in emphasized text (strong/b tag)
  - [ ] Add `data-testid="recommendation-holiday-name"`
  - [ ] Ensure holiday name is visually prominent

- [ ] **Display holiday date with day of week**
  - [ ] Format date display as "Thursday, Nov 27, 2025"
  - [ ] Add `data-testid="recommendation-holiday-date"`
  - [ ] Include day of week in readable format

- [ ] **Display recommended day off with emphasis**
  - [ ] Show recommended date with emphasis styling
  - [ ] Format as "Friday, Nov 28"
  - [ ] Add appropriate visual emphasis

- [ ] **Display explanation text**
  - [ ] Render complete explanation including weekend type
  - [ ] Support "3-day weekend" and "4-day weekend" explanations
  - [ ] Add `data-testid="recommendation-explanation"`

- [ ] **Add accessibility features**
  - [ ] Use semantic HTML (li element for list item)
  - [ ] Add `role="listitem"` attribute
  - [ ] Include comprehensive `aria-label` with key info
  - [ ] Set `tabIndex="0"` for keyboard navigation
  - [ ] Use semantic emphasis tags (strong/b) over styling only

- [ ] **Apply responsive styling**
  - [ ] Add Tailwind classes for responsive design
  - [ ] Use `p-4 md:p-6` for responsive padding
  - [ ] Add border and visual separation
  - [ ] Ensure proper text contrast (text-gray-900 on bg-white)
  - [ ] Apply proper typography classes (text-base, leading-relaxed)

- [ ] **Handle edge cases**
  - [ ] Handle missing/empty holiday names gracefully
  - [ ] Handle missing/empty dates gracefully
  - [ ] Render without crashing with incomplete data

### 🔧 **Step 2: Create RecommendationsSection Component (AC1, AC2, AC3, AC5)**

**File**: `src/components/RecommendationsSection.tsx`
- [ ] **Set up component structure**
  - [ ] Import React and necessary types
  - [ ] Define `RecommendationsSectionProps` interface
  - [ ] Create functional component with props: `recommendations`, `isLoading?`, `hasError?`
  - [ ] Add `data-testid="recommendations-section"`

- [ ] **Create dedicated "Recommendations" area (AC1)**
  - [ ] Add semantic `role="region"` with label
  - [ ] Render H2 heading: "Recommendations" with `data-testid="recommendations-heading"`
  - [ ] Ensure section is visible and properly contained
  - [ ] Apply semantic HTML structure (section > h2 + ul)

- [ ] **Implement empty state handling (AC3)**
  - [ ] Show "No long-weekend opportunities found." when recommendations array is empty
  - [ ] Use appropriate styling for empty state (muted text, centered, italic)
  - [ ] Do not render recommendation list when empty
  - [ ] Keep heading visible even in empty state

- [ ] **Add recommendation list structure**
  - [ ] Render `ul` element with `role="list"` and `data-testid="recommendations-list"`
  - [ ] Map over recommendations array to render RecommendationCard components
  - [ ] Pass each recommendation as prop to RecommendationCard

- [ ] **Implement chronological sorting (AC5)**
  - [ ] Sort recommendations by holiday date chronologically
  - [ ] Use `new Date(holidayDate).getTime()` for reliable sorting
  - [ ] Maintain stable sort for same-date recommendations
  - [ ] Handle empty arrays gracefully

- [ ] **Add loading and error states**
  - [ ] Show loading indicator when `isLoading={true}`
  - [ ] Display error message when `hasError={true}`
  - [ ] Use appropriate `data-testid` attributes for testing
  - [ ] Ensure states are properly accessible

- [ ] **Implement auto-update behavior (AC2)**
  - [ ] Ensure component re-renders when props change
  - [ ] Handle transitions between empty/populated states
  - [ ] Handle rapid prop changes without errors
  - [ ] Use React's default prop change detection

- [ ] **Apply section styling and structure**
  - [ ] Add responsive Tailwind classes (`w-full`, `max-w-4xl`, `mx-auto`)
  - [ ] Use responsive padding (`p-4 md:p-6 lg:px-8`)
  - [ ] Ensure proper semantic relationships
  - [ ] Add border and visual styling

### 🔧 **Step 3: Integrate Recommendation Display (AC2, AC4, AC5)**

**Integration Points**:
- [ ] **Hook up HolidayContext integration**
  - [ ] Import and use `useHolidays` hook
  - [ ] Get holidays array from context
  - [ ] Pass holidays to `calculateRecommendations` function
  - [ ] Use result as recommendations prop

- [ ] **Implement real-time updates**
  - [ ] Set up effect to recalculate when holidays change
  - [ ] Use `useMemo` to optimize recommendation calculation
  - [ ] Ensure component updates on holiday add/delete
  - [ ] Handle async recommendation calculation if needed

- [ ] **Connect to existing app structure**
  - [ ] Add RecommendationsSection to App.tsx
  - [ ] Position appropriately alongside HolidayForm and HolidayList
  - [ ] Ensure proper data flow from context to components

### 🔧 **Step 4: Add Accessibility and Responsive Design (AC6)**

**Accessibility Implementation**:
- [ ] **ARIA Implementation**
  - [ ] Add proper `aria-label` to recommendation cards with key info
  - [ ] Use `role="region"` for main section with descriptive label
  - [ ] Add `aria-live="polite"` for dynamic content updates
  - [ ] Ensure all interactive elements have accessible names

- [ ] **Screen Reader Support**
  - [ ] Provide complete text descriptions for screen readers
  - [ ] Use semantic HTML (strong, em) for emphasis over styling only
  - [ ] Ensure announcement of list changes
  - [ ] Add skip links if needed for navigation

- [ ] **Keyboard Navigation**
  - [ ] Make recommendation cards focusable (`tabIndex="0"`)
  - [ ] Ensure proper tab order through recommendations
  - [ ] Add focus indicators for keyboard users
  - [ ] Test keyboard-only navigation

**Responsive Design Implementation**:
- [ ] **Mobile Optimization**
  - [ ] Ensure readability on small screens
  - [ ] Use appropriate text sizes and spacing
  - [ ] Test horizontal scroll prevention
  - [ ] Ensure touch targets are appropriately sized

- [ ] **Breakpoint Strategy**
  - [ ] Use Tailwind responsive prefixes (sm:, md:, lg:)
  - [ ] Optimize layout for different screen sizes
  - [ ] Test on tablets and large screens
  - [ ] Ensure all content is accessible on mobile

---

## Data and Mock Requirements

### Required Mock Services

**No external service mocking required** - all functionality is client-side with existing HolidayContext and calculateRecommendations function.

### Required Data-testid Attributes

**RecommendationCard Component**:
- `data-testid="recommendation-card"` - Root element
- `data-testid="recommendation-holiday-name"` - Holiday name element
- `data-testid="recommendation-holiday-date"` - Holiday date element
- `data-testid="recommendation-explanation"` - Explanation text

**RecommendationsSection Component**:
- `data-testid="recommendations-section"` - Root section element
- `data-testid="recommendations-heading"` - Main heading
- `data-testid="recommendations-list"` - Recommendations list
- `data-testid="recommendations-loading"` - Loading indicator
- `data-testid="recommendations-error"` - Error message

---

## Red-Green-Refactor Workflow

### ✅ **RED Phase Complete** (Current Status)

**All Tests Failing Successfully**:
- ✅ Component tests fail due to missing components
- ✅ Import errors confirm components don't exist
- ✅ data-testid errors verify missing attributes
- ✅ Accessibility tests fail for missing ARIA implementation
- ✅ Styling tests fail for missing responsive classes

### 🔄 **GREEN Phase** (DEV Team - Next Steps)

**Implementation Priority Order**:

1. **Start with RecommendationCard** - Smallest component, easier to get green
   - Implement basic structure and display
   - Run tests: `npm run test -- RecommendationCard.test.tsx`
   - Focus on AC4 functionality first

2. **Add RecommendationsSection** - Container logic
   - Implement section structure, heading, empty state
   - Run tests: `npm run test -- RecommendationsSection.test.tsx`
   - Focus on AC1, AC3 functionality

3. **Add Sorting and List Logic**
   - Implement chronological sorting
   - Complete AC5 functionality
   - Run integration tests

4. **Add Auto-update Integration**
   - Integrate with HolidayContext
   - Complete AC2 functionality
   - Run full integration tests

5. **Complete Accessibility and Responsive Design**
   - Implement all AC6 requirements
   - Run comprehensive accessibility tests

### 🔧 **REFACTOR Phase** (DEV Team - After GREEN)

**Post-Green Improvements**:
- Extract common styling patterns
- Optimize performance for large recommendation lists
- Add smooth transitions for state changes
- Enhance accessibility compliance
- Add visual polish and micro-interactions

---

## Execution Commands

### Running the Tests

```bash
# Run all failing tests (should all fail)
npm run test

# Run specific test files
npm run test -- RecommendationCard.test.tsx
npm run test -- RecommendationsSection.test.tsx
npm run test -- RecommendationsIntegration.test.tsx

# Run with coverage
npm run test -- --coverage

# Run in watch mode during development
npm run test:dev

# Run only failing tests
npm run test -- --run
```

### Debugging Failed Tests

```bash
# Run specific failing test with detailed output
npm run test -- RecommendationCard.test.tsx --reporter=verbose

# Run tests in UI mode (if setup)
npm run test:ui

# Check test coverage for specific files
npm run test -- --coverage --coverageReporters=text
```

---

## Quality Gates

### Before Moving to GREEN Phase, Verify:

- [ ] All 70+ tests are failing with expected errors
- [ ] No infinite test execution loops
- [ ] Test failures are due to missing implementation, not test bugs
- [ ] All test infrastructure (factories, fixtures) is working
- [ ] CI/CD pipeline runs tests successfully (showing failures)

### GREEN Phase Completion Criteria:

- [ ] All RecommendationCard tests pass
- [ ] All RecommendationsSection tests pass
- [ ] All integration tests pass
- [ ] Accessibility tests pass
- [ ] Component renders in browser without console errors
- [ ] Real-time updates work with HolidayContext

---

## Success Metrics

**Test Coverage Target**: 95%+ for new components
**Performance Target**: Render <50ms for 25 recommendations
**Accessibility Target**: WCAG 2.1 AA compliance
**UX Goal**: Clear, readable recommendation display with proper visual hierarchy

---

## Next Steps for DEV Team

1. **Start RED→GREEN phase**: Begin with RecommendationCard implementation
2. **Run tests frequently**: Use `npm run test:dev` to watch progress
3. **Implement step-by-step**: Follow the ordered implementation checklist
4. **Test accessibility early**: Use screen reader and keyboard navigation testing
5. **Validate real integration**: Test with actual HolidayContext once components pass unit tests
6. **Share progress**: Update daily standup on test completion status

**Remember**: Tests define the expected behavior. If tests seem too strict, discuss with TEA team before modifying. The goal is confidence that the implementation meets all acceptance criteria.

---

## Knowledge Base References Applied

- ✅ **Fixture Architecture**: Pure functions → fixtures pattern with auto-cleanup
- ✅ **Data Factories**: Faker-generated data with overrides and specialized scenarios
- ✅ **Component TDD**: Red-Green-Refactor with provider isolation and Given-When-Then structure
- ✅ **Network-First**: Not required (no external APIs in this story)
- ✅ **Test Quality**: Atomic tests, proper cleanup, explicit assertions, <100 lines per test file
- ✅ **Selector Resilience**: data-testid attributes for stable test selectors
- ✅ **Accessibility Testing**: ARIA labels, keyboard navigation, screen reader support

---

**Status**: ✅ **ATDD Complete - Tests in RED Phase**
**Ready for**: DEV Team GREEN Phase Implementation
**Estimated GREEN Phase Time**: 6-10 hours based on component complexity
**Risk Level**: Low (well-defined acceptance criteria, comprehensive test coverage)