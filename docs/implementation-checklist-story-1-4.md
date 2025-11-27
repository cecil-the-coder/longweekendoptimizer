# Implementation Checklist - Story 1.4: Core Recommendation Logic

## Story Summary
**Title:** Core Recommendation Logic
**Status:** ATDD RED Phase Complete - Tests Failing
**Function:** `calculateRecommendations(holidays: Holiday[]): Recommendation[]`
**Target:** >95% code coverage

## Acceptance Criteria Mapping

### AC1: Tuesday Holiday Detection ✅ Tests Created
**Tests:** 2 tests
- `should recommend Monday off for a Tuesday holiday`
- `should handle multiple Tuesday holidays with separate Monday recommendations`

**Implementation Tasks:**
- [ ] Parse holiday date and detect if it falls on Tuesday
- [ ] Calculate Monday before Tuesday (date - 1 day)
- [ ] Format recommended date as YYYY-MM-DD string
- [ ] Set recommendedDay to "Monday"
- [ ] Handle multiple Tuesday holidays correctly

**Files to Modify:** `/src/utils/dateLogic.ts`

---

### AC2: Thursday Holiday Detection ✅ Tests Created
**Tests:** 2 tests
- `should recommend Friday off for a Thursday holiday`
- `should handle multiple Thursday holidays with separate Friday recommendations`

**Implementation Tasks:**
- [ ] Parse holiday date and detect if it falls on Thursday
- [ ] Calculate Friday after Thursday (date + 1 day)
- [ ] Format recommended date as YYYY-MM-DD string
- [ ] Set recommendedDay to "Friday"
- [ ] Handle multiple Thursday holidays correctly

**Files to Modify:** `/src/utils/dateLogic.ts`

---

### AC3: Structured Output Format ✅ Tests Created
**Tests:** 2 tests
- `should output complete recommendation objects with all required fields`
- `should maintain holiday name in recommendation output`

**Implementation Tasks:**
- [ ] Define Recommendation interface (already done in stub)
- [ ] Create Recommendation objects with all required fields:
  - holidayName: string (from input)
  - holidayDate: string (from input)
  - holidayDayOfWeek: string ("Tuesday" or "Thursday")
  - recommendedDate: string (calculated)
  - recommendedDay: string ("Monday" or "Friday")
  - explanation: string ("→ 4-day weekend")
- [ ] Ensure type safety for all fields

**Files to Modify:** `/src/utils/dateLogic.ts`

---

### AC4: Empty Array for Non-Qualifying Holidays ✅ Tests Created
**Tests:** 6 tests
- Monday holidays → no recommendation
- Wednesday holidays → no recommendation
- Friday holidays → no recommendation
- Weekend holidays → no recommendation
- Empty input → empty output

**Implementation Tasks:**
- [ ] Detect days that don't qualify (Mon, Wed, Fri, Sat, Sun)
- [ ] Return empty array for non-qualifying holidays
- [ ] Handle completely empty input array
- [ ] Ensure weekend holidays don't generate recommendations

**Files to Modify:** `/src/utils/dateLogic.ts`

---

### AC5: Duplicate Day Avoidance ✅ Tests Created
**Tests:** 3 tests
- Don't recommend Monday if Monday is already holiday
- Don't recommend Friday if Friday is already holiday
- Recommend normally when suggested day is not a holiday

**Implementation Tasks:**
- [ ] Create Set of all holiday dates for O(1) lookup
- [ ] Check if recommended date exists in holiday list
- [ ] Skip recommendation if day is already holiday
- [ ] Only recommend when available day is not already taken

**Files to Modify:** `/src/utils/dateLogic.ts`

---

### AC6: Edge Case Handling ✅ Tests Created
**Tests:** 8 tests
- Malformed date strings
- Null/undefined input
- Missing required fields
- Large arrays (performance)
- Leap year dates
- Year boundary transitions
- Mixed qualifying/non-qualifying holidays
- Order preservation

**Implementation Tasks:**
- [ ] Add input validation for null/undefined
- [ ] Add date parsing with error handling
- [ ] Handle malformed dates gracefully (return empty)
- [ ] Validate Holiday object structure
- [ ] Optimize for O(n) performance with large datasets
- [ ] Handle leap year date calculations correctly
- [ ] Handle year boundary transitions (Dec/Jan)
- [ ] Preserve original holiday order in output
- [ ] Add performance measurement (target <100ms for 100 holidays)

**Files to Modify:** `/src/utils/dateLogic.ts`

---

### AC7: Test Coverage ✅ Tests Created
**Tests:** 24 total tests (13 failing, 11 passing)
- Cover all acceptance criteria
- Edge cases and error conditions
- Performance scenarios

**Implementation Tasks:**
- [ ] Run tests: `npm test -- src/utils/__tests__/dateLogic.test.ts --run`
- [ ] Verify all 13 failing tests now pass
- [ ] Check code coverage: `npm run test:coverage`
- [ ] Ensure >95% line coverage on dateLogic.ts
- [ ] Fix any uncovered edge cases

**Files to Check:** `/src/utils/dateLogic.ts`

---

## Implementation Order (RED → GREEN)

### Phase 1: Basic Logic (Core Requirements)
1. **Implement date checking logic**
   - Get day of week from Date object
   - Check for Tuesday/Thursday
   - Handle non-qualifying days

2. **Implement recommendation calculation**
   - Monday before Tuesday (-1 day)
   - Friday after Thursday (+1 day)
   - Date formatting to YYYY-MM-DD

3. **Implement output structure**
   - Create Recommendation objects
   - Fill all required fields
   - Return array

**After Phase 1:** Tuesday/Thursday detection tests should pass

### Phase 2: Duplicate Avoidance
1. **Implement conflict detection**
   - Create Set of holiday dates
   - Check for conflicts
   - Skip conflicting recommendations

**After Phase 2:** Duplicate avoidance tests should pass

### Phase 3: Edge Case Handling
1. **Add input validation**
   - Handle null/undefined
   - Validate date strings
   - Handle malformed data

2. **Add performance optimization**
   - Use Set for O(1) lookups
   - Optimize date calculations
   - Preserve input order

3. **Add special date handling**
   - Leap year calculations
   - Year boundary transitions
   - Large dataset handling

**After Phase 3:** All tests should pass, coverage achieved

---

## Red-Green-Refactor Workflow

### ✅ RED Phase (Complete)
- [x] All tests written and failing
- [x] Test factories created
- [x] Infrastructure ready
- [x] 13 tests failing, 11 tests passing

### 🟢 GREEN Phase (DEV Team)
1. Run test watch mode: `npm test -- src/utils/__tests__/dateLogic.test.ts`
2. Implement Phase 1 tasks
3. Verify tests passing one by one
4. Proceed to Phase 2
5. Continue until all tests pass

### 🔧 REFACTOR Phase (DEV Team)
1. All tests passing (GREEN)
2. Improve code quality
3. Extract helper functions
4. Optimize performance
5. Ensure tests still pass

---

## Running Tests

### Development Mode (Recommended)
```bash
npm test -- src/utils/__tests__/dateLogic.test.ts
```
* Watches for changes and runs tests automatically*

### Single Run
```bash
npm test -- src/utils/__tests__/dateLogic.test.ts --run
```
*Runs tests once and exits*

### Coverage Report
```bash
npm run test:coverage
```
*Shows detailed coverage report*

### Coverage Report for dateLogic Only
```bash
npm run test:coverage -- src/utils/dateLogic.ts
```
*Focuses on the implementation file*

---

## Test Files Summary

| File | Tests | Status | Purpose |
|------|-------|--------|---------|
| `/src/utils/__tests__/dateLogic.test.ts` | 24 | RED Phase | Main acceptance tests |
| `/src/utils/__tests__/factories/holidayFactory.ts` | - | Complete | Test data generation |
| `/src/utils/__tests__/constants/testConstants.ts` | - | Complete | Shared test constants |

**Failing Tests:** 13 (expecting implementation)
**Passing Tests:** 11 (edge cases, error handling)
**Coverage Target:** >95% on dateLogic.ts

---

## Required data-testid Attributes

None needed for this story (unit test only - no UI components).

---

## Mock Requirements

None needed for this story (pure function - no external dependencies).

---

## Implementation Notes

### Performance Requirements
- Target: O(n) algorithm
- Process 100+ holidays in <100ms
- Use Set for O(1) conflict checking

### Date Handling
- Use user's local timezone
- Consistent YYYY-MM-DD format
- Handle leap years correctly
- Handle year boundaries (Dec/Jan)

### Error Handling
- Graceful degradation for invalid input
- No exceptions thrown for malformed data
- Return empty array for unprocessable input

### Code Organization
- Pure function design
- No side effects
- TypeScript strict typing
- Helper functions for date calculations

---

## Success Criteria

1. ✅ **All 24 tests pass**
2. ✅ **>95% code coverage on dateLogic.ts**
3. ✅ **Performance meets requirements (<100ms for 100 holidays)**
4. ✅ **All acceptance criteria implemented**
5. ✅ **No test infrastructure changes needed**

**Ready for GREEN phase implementation.**