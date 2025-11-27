/**
 * Test Constants for dateLogic Unit Tests
 *
 * Centralized constants to avoid magic strings and improve maintainability
 */

export const EXPLANATION_TEXT = '→ 4-day weekend';

export const RECOMMENDED_DAYS = {
  MONDAY: 'Monday',
  FRIDAY: 'Friday',
} as const;

export const HOLIDAY_DAYS = {
  MONDAY: 'Monday',
  TUESDAY: 'Tuesday',
  WEDNESDAY: 'Wednesday',
  THURSDAY: 'Thursday',
  FRIDAY: 'Friday',
  SATURDAY: 'Saturday',
  SUNDAY: 'Sunday',
} as const;

export const TEST_DATES = {
  // 2025 dates
  JAN_6_2025: '2025-01-06', // Monday
  JAN_7_2025: '2025-01-07', // Tuesday
  JAN_8_2025: '2025-01-08', // Wednesday
  JAN_9_2025: '2025-01-09', // Thursday
  JAN_10_2025: '2025-01-10', // Friday
  JAN_11_2025: '2025-01-11', // Saturday
  JAN_12_2025: '2025-01-12', // Sunday

  // Year boundaries
  DEC_29_2025: '2025-12-29', // Monday
  DEC_30_2025: '2025-12-30', // Tuesday

  // Leap year
  FEB_26_2024: '2024-02-26', // Monday
  FEB_27_2024: '2024-02-27', // Tuesday
  FEB_29_2024: '2024-02-29', // Thursday
  MAR_1_2024: '2024-03-01',  // Friday
} as const;

export const ERROR_MESSAGES = {
  INVALID_INPUT: 'Invalid input provided',
  MALFORMED_DATE: 'Malformed date detected',
} as const;