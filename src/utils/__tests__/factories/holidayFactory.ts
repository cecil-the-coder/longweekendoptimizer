/**
 * Holiday Factory for Unit Tests - Story 1.4 ATDD
 *
 * Lightweight factory for dateLogic unit tests.
 * Uses deterministic data for reproducible test results.
 */

import type { Holiday } from '../../../context/HolidayContext';

/**
 * Generate a deterministic test ID
 */
function generateTestId(): string {
  return `test-id-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Basic holiday factory with overrides
 */
export function createHoliday(overrides?: Partial<Holiday>): Holiday {
  return {
    id: generateTestId(),
    name: 'Test Holiday',
    date: '2025-01-07', // Default: Tuesday (qualifying)
    ...overrides,
  };
}

/**
 * Create a Tuesday holiday (should recommend Monday)
 */
export function createTuesdayHoliday(overrides?: Partial<Holiday>): Holiday {
  return createHoliday({
    name: 'Tuesday Holiday',
    date: '2025-01-07', // Tuesday
    ...overrides,
  });
}

/**
 * Create a Thursday holiday (should recommend Friday)
 */
export function createThursdayHoliday(overrides?: Partial<Holiday>): Holiday {
  return createHoliday({
    name: 'Thursday Holiday',
    date: '2025-01-09', // Thursday
    ...overrides,
  });
}

/**
 * Create a Monday holiday (no recommendation)
 */
export function createMondayHoliday(overrides?: Partial<Holiday>): Holiday {
  return createHoliday({
    name: 'Monday Holiday',
    date: '2025-01-06', // Monday
    ...overrides,
  });
}

/**
 * Create a Wednesday holiday (no recommendation)
 */
export function createWednesdayHoliday(overrides?: Partial<Holiday>): Holiday {
  return createHoliday({
    name: 'Wednesday Holiday',
    date: '2025-01-08', // Wednesday
    ...overrides,
  });
}

/**
 * Create a Friday holiday (no recommendation)
 */
export function createFridayHoliday(overrides?: Partial<Holiday>): Holiday {
  return createHoliday({
    name: 'Friday Holiday',
    date: '2025-01-10', // Friday
    ...overrides,
  });
}

/**
 * Create a Saturday holiday (no recommendation)
 */
export function createSaturdayHoliday(overrides?: Partial<Holiday>): Holiday {
  return createHoliday({
    name: 'Saturday Holiday',
    date: '2025-01-11', // Saturday
    ...overrides,
  });
}

/**
 * Create a Sunday holiday (no recommendation)
 */
export function createSundayHoliday(overrides?: Partial<Holiday>): Holiday {
  return createHoliday({
    name: 'Sunday Holiday',
    date: '2025-01-12', // Sunday
    ...overrides,
  });
}

/**
 * Create consecutive holidays (Thursday + Friday)
 * Used to test duplicate day avoidance
 */
export function createConsecutiveHolidays(): Holiday[] {
  return [
    createHoliday({
      name: 'Thursday Holiday',
      date: '2025-01-09', // Thursday
    }),
    createHoliday({
      name: 'Friday Holiday',
      date: '2025-01-10', // Friday (should NOT be recommended)
    }),
  ];
}

/**
 * Create leap year holiday (Feb 29)
 * Edge case testing
 */
export function createLeapYearHoliday(overrides?: Partial<Holiday>): Holiday {
  return createHoliday({
    name: 'Leap Year Holiday',
    date: '2024-02-29', // Thursday in leap year
    ...overrides,
  });
}

/**
 * Create year boundary holiday (Dec 31)
 * Edge case testing
 */
export function createYearBoundaryHoliday(overrides?: Partial<Holiday>): Holiday {
  return createHoliday({
    name: 'Year Boundary Holiday',
    date: '2025-12-31', // Wednesday
    ...overrides,
  });
}

/**
 * Create holidays with malformed dates for edge case testing
 */
export function createMalformedHoliday(overrides?: Partial<Holiday>): Holiday {
  return {
    id: generateTestId(),
    name: 'Malformed Date Holiday',
    date: 'not-a-valid-date',
    ...overrides,
  };
}