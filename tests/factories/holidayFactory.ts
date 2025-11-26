/**
 * Test Data Factory for Holiday objects
 *
 * Provides controlled test data generation for unit and E2E tests.
 * Uses deterministic data for reproducible test scenarios.
 */

export interface Holiday {
  id: string;
  name: string;
  date: string; // ISO 8601 format (YYYY-MM-DD)
}

/**
 * Generate a unique ID (matches production implementation)
 * Uses timestamp + random string for test uniqueness
 */
function generateTestId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 11);
  return `test-${timestamp}-${randomPart}`;
}

/**
 * Create a holiday with default or override values
 */
export function createHoliday(overrides?: Partial<Holiday>): Holiday {
  return {
    id: generateTestId(),
    name: 'Test Holiday',
    date: '2025-11-27', // Default: Thanksgiving 2025 (Thursday)
    ...overrides,
  };
}

/**
 * Create a Thursday holiday (should recommend Friday)
 */
export function createThursdayHoliday(overrides?: Partial<Holiday>): Holiday {
  return createHoliday({
    name: 'Thanksgiving',
    date: '2025-11-27', // Thursday, November 27, 2025
    ...overrides,
  });
}

/**
 * Create a Tuesday holiday (should recommend Monday)
 */
export function createTuesdayHoliday(overrides?: Partial<Holiday>): Holiday {
  return createHoliday({
    name: 'Election Day',
    date: '2025-11-04', // Tuesday, November 4, 2025
    ...overrides,
  });
}

/**
 * Create a Wednesday holiday (no recommendation)
 */
export function createWednesdayHoliday(overrides?: Partial<Holiday>): Holiday {
  return createHoliday({
    name: 'Veterans Day',
    date: '2025-11-12', // Wednesday, November 12, 2025
    ...overrides,
  });
}

/**
 * Create a weekend holiday (Saturday - no recommendation)
 */
export function createSaturdayHoliday(overrides?: Partial<Holiday>): Holiday {
  return createHoliday({
    name: 'Saturday Holiday',
    date: '2025-11-29', // Saturday, November 29, 2025
    ...overrides,
  });
}

/**
 * Create a weekend holiday (Sunday - no recommendation)
 */
export function createSundayHoliday(overrides?: Partial<Holiday>): Holiday {
  return createHoliday({
    name: 'Sunday Holiday',
    date: '2025-11-30', // Sunday, November 30, 2025
    ...overrides,
  });
}

/**
 * Create a Monday holiday (no recommendation)
 */
export function createMondayHoliday(overrides?: Partial<Holiday>): Holiday {
  return createHoliday({
    name: 'Labor Day',
    date: '2025-09-01', // Monday, September 1, 2025
    ...overrides,
  });
}

/**
 * Create a Friday holiday (no recommendation)
 */
export function createFridayHoliday(overrides?: Partial<Holiday>): Holiday {
  return createHoliday({
    name: 'Good Friday',
    date: '2025-04-18', // Friday, April 18, 2025
    ...overrides,
  });
}

/**
 * Create consecutive holidays (Thursday + Friday)
 * Tests FR8: Should not recommend Friday if already a holiday
 */
export function createConsecutiveHolidays(): Holiday[] {
  return [
    createHoliday({
      name: 'Thanksgiving',
      date: '2025-11-27', // Thursday
    }),
    createHoliday({
      name: 'Day After Thanksgiving',
      date: '2025-11-28', // Friday (should NOT be recommended)
    }),
  ];
}

/**
 * Create leap year holiday (Feb 29)
 * Edge case for date calculation testing
 */
export function createLeapYearHoliday(overrides?: Partial<Holiday>): Holiday {
  return createHoliday({
    name: 'Leap Day',
    date: '2024-02-29', // Thursday, February 29, 2024 (leap year)
    ...overrides,
  });
}

/**
 * Create year boundary holiday (Dec 31)
 * Edge case for year transitions
 */
export function createYearBoundaryHoliday(overrides?: Partial<Holiday>): Holiday {
  return createHoliday({
    name: 'New Year Eve',
    date: '2025-12-31', // Wednesday, December 31, 2025
    ...overrides,
  });
}

/**
 * Create multiple holidays for bulk testing
 */
export function createHolidayList(count: number): Holiday[] {
  const holidays: Holiday[] = [];
  const baseDate = new Date('2025-01-01');

  for (let i = 0; i < count; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i * 7); // Weekly intervals

    holidays.push(
      createHoliday({
        name: `Holiday ${i + 1}`,
        date: date.toISOString().split('T')[0],
      })
    );
  }

  return holidays;
}

/**
 * Common test scenarios
 */
export const testScenarios = {
  /** Empty holiday list */
  empty: [],

  /** Single Thursday holiday (should recommend Friday) */
  singleThursday: [createThursdayHoliday()],

  /** Single Tuesday holiday (should recommend Monday) */
  singleTuesday: [createTuesdayHoliday()],

  /** Single Wednesday holiday (no recommendation) */
  singleWednesday: [createWednesdayHoliday()],

  /** Multiple holidays with mixed days */
  mixed: [
    createThursdayHoliday({ name: 'Thanksgiving' }),
    createTuesdayHoliday({ name: 'Election Day' }),
    createWednesdayHoliday({ name: 'Veterans Day' }),
  ],

  /** Consecutive holidays (no duplicate recommendation) */
  consecutive: createConsecutiveHolidays(),

  /** Edge cases */
  edgeCases: [
    createLeapYearHoliday(),
    createYearBoundaryHoliday(),
    createSaturdayHoliday(),
    createSundayHoliday(),
  ],
};
