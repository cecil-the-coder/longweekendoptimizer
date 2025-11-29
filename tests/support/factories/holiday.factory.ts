/**
 * Holiday Data Factory
 *
 * Provides factory functions for generating test holiday data
 * Follows factory pattern with faker for unique, parallel-safe data
 */

import { faker } from '@faker-js/faker';

export type Holiday = {
  id: string;
  name: string;
  date: string;
  formattedDate?: string;
};

/**
 * Create a single holiday with faker-generated default values
 * Supports overrides for specific test scenarios
 */
export const createHoliday = (overrides: Partial<Holiday> = {}): Holiday => {
  const date = faker.date.future({ years: 2 });
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format

  return {
    id: faker.string.uuid(),
    name: faker.lorem.words({ min: 1, max: 3 }), // Holiday names like "Thanksgiving", "Christmas Day"
    date: dateStr,
    formattedDate: formatHolidayDate(dateStr, faker.lorem.words(1)), // Will be overridden by component
    ...overrides,
  };
};

/**
 * Create multiple holidays with faker for bulk testing
 */
export const createHolidays = (count: number, baseName?: string): Holiday[] =>
  Array.from({ length: count }, (_, index) =>
    createHoliday(baseName ? { name: `${baseName} ${index + 1}` } : {})
  );

/**
 * Create holidays with specific dates (useful for date formatting tests)
 */
export const createHolidaysWithDates = (dateNamePairs: Array<{ date: string; name?: string }>): Holiday[] =>
  dateNamePairs.map(({ date, name }) =>
    createHoliday({
      name: name || faker.lorem.words({ min: 1, max: 2 }),
      date,
    })
  );

/**
 * Specialized factory for common holidays (for realistic test data)
 */
export const createCommonHoliday = (year = new Date().getFullYear()): Holiday => {
  const commonHolidays = [
    { name: 'New Year\'s Day', month: 1, day: 1 },
    { name: 'Valentine\'s Day', month: 2, day: 14 },
    { name: 'St. Patrick\'s Day', month: 3, day: 17 },
    { name: 'July 4th', month: 7, day: 4 },
    { name: 'Thanksgiving', month: 11, day: faker.number.int({ min: 22, max: 28 }) }, // Approximate
    { name: 'Christmas', month: 12, day: 25 },
    { name: 'New Year\'s Eve', month: 12, day: 31 },
  ];

  const selectedHoliday = faker.helpers.arrayElement(commonHolidays);
  const date = new Date(year, selectedHoliday.month - 1, selectedHoliday.day);

  return createHoliday({
    name: selectedHoliday.name,
    date: date.toISOString().split('T')[0],
  });
};

/**
 * Create holidays for testing date formatting edge cases
 */
export const createDateFormattingTestHolidays = (): Holiday[] => {
  const testYear = 2025;

  return [
    createHoliday({
      name: 'January Holiday',
      date: `${testYear}-01-15`
    }),
    createHoliday({
      name: 'Leap Day Special',
      date: `${testYear}-02-29` // Note: 2025 is not a leap year, will test error handling
    }),
    createHoliday({
      name: 'Month Start',
      date: `${testYear}-06-01`
    }),
    createHoliday({
      name: 'Month End',
      date: `${testYear}-12-31`
    }),
    createHoliday({
      name: 'Single Digit Day',
      date: `${testYear}-07-04`
    }),
    createHoliday({
      name: 'Double Digit Day',
      date: `${testYear}-12-25`
    }),
  ];
};

/**
 * Create holidays for testing validation edge cases
 */
export const createValidationTestHolidays = (): Array<{ holiday: Holiday; description: string }> => [
  {
    holiday: createHoliday({ name: 'Normal Holiday' }),
    description: 'Valid holiday for positive test cases'
  },
  {
    holiday: createHoliday({
      name: 'Holiday with Special Characters! @#$%',
      date: '2025-12-25'
    }),
    description: 'Holiday with special characters in name'
  },
  {
    holiday: createHoliday({
      name: 'Very Long Holiday Name That Exceeds Normal Length Limits'
    }),
    description: 'Holiday with excessively long name'
  },
  {
    holiday: { id: 'test-1', name: '', date: '2025-12-25' },
    description: 'Holiday with empty name (invalid)'
  },
  {
    holiday: { id: 'test-2', name: 'Valid Holiday', date: '' },
    description: 'Holiday with empty date (invalid)'
  },
  {
    holiday: { id: 'test-3', name: 'Invalid Date', date: 'not-a-date' },
    description: 'Holiday with invalid date format'
  },
];

/**
 * Helper function to format date as expected by components
 * This matches the format mentioned in AC3: "Thanksgiving - Thursday, Nov 27, 2025"
 */
export const formatHolidayDate = (dateString: string, holidayName: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return `${holidayName} - Invalid Date`;
    }

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const dayOfWeek = daysOfWeek[date.getDay()];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();

    return `${holidayName} - ${dayOfWeek}, ${month} ${day}, ${year}`;
  } catch (error) {
    return `${holidayName} - Date Error`;
  }
};

/**
 * Holiday factory with feature flags for testing different scenarios
 */
export const createHolidayWithFlags = (
  overrides: Partial<Holiday> = {},
  flags: Record<string, boolean> = {}
): Holiday & { flags: Record<string, boolean> } => ({
  ...createHoliday(overrides),
  flags: {
    'is-highlighted': false,
    'is-editable': false,
    'has-special-formatting': false,
    ...flags,
  },
});

/**
 * Bulk create holidays for testing pagination or large lists
 */
export const createManyHolidays = (count: number): Holiday[] => {
  if (count === 0) return [];
  if (count <= 50) {
    return createHolidays(count);
  }

  // For large counts, use a more efficient approach
  const holidays: Holiday[] = [];
  for (let i = 0; i < count; i++) {
    holidays.push(createHoliday({
      name: `Holiday ${i + 1}`,
      date: faker.date.future({ years: 2 }).toISOString().split('T')[0],
    }));
  }
  return holidays;
};