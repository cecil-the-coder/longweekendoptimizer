/**
 * Date Logic Module - Story 1.4 Implementation
 *
 * Core recommendation engine for Long Weekend Optimizer
 *
 * Analyzes holiday dates and recommends optimal days off to create 4-day weekends.
 * Implements O(n) algorithm for processing 50+ holidays in under 10ms.
 */

import { Holiday } from '../context/HolidayContext';

// Recommendation interface as defined in technical specification
export interface Recommendation {
  holidayName: string;
  holidayDate: string;
  holidayDayOfWeek: string;
  recommendedDate: string;
  recommendedDay: string;
  explanation: string;
}

/**
 * Validates if a date string is in valid YYYY-MM-DD format and represents a real date
 *
 * @param dateString - Date string to validate
 * @returns true if valid date, false otherwise
 */
const isValidDateString = (dateString: string): boolean => {
  if (typeof dateString !== 'string' || !dateString.trim()) {
    return false;
  }

  // Check basic YYYY-MM-DD format using regex
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) {
    return false;
  }

  const date = new Date(dateString);
  const timestamp = date.getTime();

  // Check if the date is invalid (NaN) or if parsing created a different date
  return !isNaN(timestamp) && date.toISOString().slice(0, 10) === dateString;
};

/**
 * Validates if an object conforms to the Holiday interface
 *
 * @param obj - Object to validate
 * @returns true if valid Holiday object, false otherwise
 */
const isValidHoliday = (obj: unknown): obj is Holiday => {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.date === 'string' &&
    obj.id.length > 0 &&
    obj.name.length > 0 &&
    isValidDateString(obj.date)
  );
};

/**
 * Gets the day of week name for a date string
 * Uses local timezone for consistent behavior with user's location
 *
 * @param dateString - Date in YYYY-MM-DD format
 * @returns Day of week name (Monday, Tuesday, etc.)
 */
const getDayOfWeek = (dateString: string): string => {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', { weekday: 'long' });
};

/**
 * Formats a date by adding days to it
 * Uses local timezone for consistency with user's location
 *
 * @param dateString - Base date in YYYY-MM-DD format
 * @param days - Number of days to add (can be negative)
 * @returns New date string in YYYY-MM-DD format
 */
const addDays = (dateString: string, days: number): string => {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);

  // Format to YYYY-MM-DD using local timezone
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * Creates a Set of holiday dates for efficient lookup
 *
 * @param holidays - Array of Holiday objects
 * @returns Set of date strings in YYYY-MM-DD format
 */
const createHolidayDateSet = (holidays: Holiday[]): Set<string> => {
  const dateSet = new Set<string>();
  for (const holiday of holidays) {
    if (isValidHoliday(holiday)) {
      dateSet.add(holiday.date);
    }
  }
  return dateSet;
};

/**
 * Main recommendation engine - analyzes holidays to create 4-day weekend opportunities
 *
 * Algorithm Flow:
 * For each holiday in input array:
 * 1. Validate holiday and check if it falls on Tuesday or Thursday
 * 2. If Tuesday, check if Monday before is already a holiday
 * 3. If Thursday, check if Friday after is already a holiday
 * 4. Generate recommendation if adjacent day is not already a holiday
 * 5. Return sorted array of recommendations
 *
 * Performance: O(n) time complexity for processing n holidays
 * Memory: O(n) for storing holiday date lookup set
 *
 * @param holidays - Array of Holiday objects
 * @returns Array of Recommendation objects for optimal vacation days
 */
export function calculateRecommendations(holidays: Holiday[]): Recommendation[] {
  // Input validation - handle null, undefined, non-array input
  if (!Array.isArray(holidays)) {
    return [];
  }

  // Filter out invalid holidays and create lookup set for O(1) date checking
  const validHolidays = holidays.filter(isValidHoliday);
  if (validHolidays.length === 0) {
    return [];
  }

  const holidayDateSet = createHolidayDateSet(validHolidays);
  const recommendations: Recommendation[] = [];

  // Process each holiday
  for (const holiday of validHolidays) {
    const dayOfWeek = getDayOfWeek(holiday.date);

    // Handle Tuesday holidays - recommend Monday off
    if (dayOfWeek === 'Tuesday') {
      const mondayDate = addDays(holiday.date, -1); // Monday before
      const mondayDayOfWeek = getDayOfWeek(mondayDate);

      // Only recommend if Monday is not already a holiday
      if (!holidayDateSet.has(mondayDate)) {
        recommendations.push({
          holidayName: holiday.name,
          holidayDate: holiday.date,
          holidayDayOfWeek: dayOfWeek,
          recommendedDate: mondayDate,
          recommendedDay: mondayDayOfWeek,
          explanation: '→ 4-day weekend'
        });
      }
    }

    // Handle Thursday holidays - recommend Friday off
    else if (dayOfWeek === 'Thursday') {
      const fridayDate = addDays(holiday.date, 1); // Friday after
      const fridayDayOfWeek = getDayOfWeek(fridayDate);

      // Only recommend if Friday is not already a holiday
      if (!holidayDateSet.has(fridayDate)) {
        recommendations.push({
          holidayName: holiday.name,
          holidayDate: holiday.date,
          holidayDayOfWeek: dayOfWeek,
          recommendedDate: fridayDate,
          recommendedDay: fridayDayOfWeek,
          explanation: '→ 4-day weekend'
        });
      }
    }

    // Monday, Wednesday, Friday holidays don't generate recommendations
    // (no action needed - skip these)
  }

  // Sort recommendations by holiday date for consistent output
  recommendations.sort((a, b) => a.holidayDate.localeCompare(b.holidayDate));

  return recommendations;
}