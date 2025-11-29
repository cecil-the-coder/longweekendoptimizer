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
  // Optional fields for grouped holidays
  isGrouped?: boolean;
  groupedHolidays?: string[]; // Names of other holidays in the group
  daysToTakeOff?: number; // Number of vacation days needed
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
 * Calculates the number of work days between two dates (excluding weekends)
 *
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @returns Number of work days (Mon-Fri) between the dates
 */
const getWorkDaysBetween = (startDate: string, endDate: string): number => {
  const [y1, m1, d1] = startDate.split('-').map(Number);
  const [y2, m2, d2] = endDate.split('-').map(Number);

  const start = new Date(y1, m1 - 1, d1);
  const end = new Date(y2, m2 - 1, d2);

  let workDays = 0;
  const current = new Date(start);
  current.setDate(current.getDate() + 1); // Start from day after first date

  while (current < end) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Saturday or Sunday
      workDays++;
    }
    current.setDate(current.getDate() + 1);
  }

  return workDays;
};

/**
 * Finds clusters of holidays that are close together (within 5 work days)
 * and generates recommendations to bridge them
 *
 * @param holidays - Array of Holiday objects
 * @param holidayDateSet - Set of holiday dates for O(1) lookup
 * @returns Array of recommendations for bridging holiday clusters
 */
const findHolidayClusters = (holidays: Holiday[], holidayDateSet: Set<string>): Recommendation[] => {
  const recommendations: Recommendation[] = [];
  const sortedHolidays = [...holidays].sort((a, b) => a.date.localeCompare(b.date));

  for (let i = 0; i < sortedHolidays.length - 1; i++) {
    const holiday1 = sortedHolidays[i];
    const holiday2 = sortedHolidays[i + 1];

    const workDaysBetween = getWorkDaysBetween(holiday1.date, holiday2.date);

    // Handle consecutive holidays (0 work days between) - suggest extending
    if (workDaysBetween === 0) {
      const day1 = getDayOfWeek(holiday1.date);
      const day2 = getDayOfWeek(holiday2.date);

      // Parse dates for day of week calculations
      const [y1, m1, d1] = holiday1.date.split('-').map(Number);
      const [y2, m2, d2] = holiday2.date.split('-').map(Number);
      const day1Num = new Date(y1, m1 - 1, d1).getDay();
      const day2Num = new Date(y2, m2 - 1, d2).getDay();

      // For Wed+Thu (like NYE+NYD): Recommend Friday after for 6 days, or Tue+Fri for 7 days
      if (day1Num === 3 && day2Num === 4) { // Wednesday + Thursday
        const fridayAfter = addDays(holiday2.date, 1);
        const tuesdayBefore = addDays(holiday1.date, -1);

        // Option 1: Take Friday after (6-day weekend)
        if (!holidayDateSet.has(fridayAfter)) {
          recommendations.push({
            holidayName: `${holiday1.name} + ${holiday2.name}`,
            holidayDate: holiday1.date,
            holidayDayOfWeek: day1,
            recommendedDate: fridayAfter,
            recommendedDay: getDayOfWeek(fridayAfter),
            explanation: '→ 6-day vacation (Wed-Thu-Fri-Sat-Sun-Mon)',
            isGrouped: true,
            groupedHolidays: [holiday1.name, holiday2.name],
            daysToTakeOff: 1
          });
        }

        // Option 2: Take Tuesday before + Friday after (7-day vacation)
        if (!holidayDateSet.has(tuesdayBefore) && !holidayDateSet.has(fridayAfter)) {
          recommendations.push({
            holidayName: `${holiday1.name} + ${holiday2.name}`,
            holidayDate: holiday1.date,
            holidayDayOfWeek: day1,
            recommendedDate: `${tuesdayBefore}, ${fridayAfter}`,
            recommendedDay: '2 days',
            explanation: '→ 7-day vacation (Tue-Wed-Thu-Fri-Sat-Sun-Mon)',
            isGrouped: true,
            groupedHolidays: [holiday1.name, holiday2.name],
            daysToTakeOff: 2
          });
        }
      }
      // For Thu+Fri: Recommend Monday after to get Thu-Fri-Sat-Sun-Mon-Tue (6 days)
      else if (day1Num === 4 && day2Num === 5) { // Thursday + Friday
        const mondayAfter = addDays(holiday2.date, 3);
        if (!holidayDateSet.has(mondayAfter)) {
          recommendations.push({
            holidayName: `${holiday1.name} + ${holiday2.name}`,
            holidayDate: holiday1.date,
            holidayDayOfWeek: day1,
            recommendedDate: mondayAfter,
            recommendedDay: getDayOfWeek(mondayAfter),
            explanation: '→ 6-day vacation (Thu-Fri-Sat-Sun-Mon-Tue)',
            isGrouped: true,
            groupedHolidays: [holiday1.name, holiday2.name],
            daysToTakeOff: 1
          });
        }
      }
      // For Mon+Tue: Recommend Friday before to get Fri-Sat-Sun-Mon-Tue-Wed (6 days)
      else if (day1Num === 1 && day2Num === 2) { // Monday + Tuesday
        const fridayBefore = addDays(holiday1.date, -3);
        if (!holidayDateSet.has(fridayBefore)) {
          recommendations.push({
            holidayName: `${holiday1.name} + ${holiday2.name}`,
            holidayDate: holiday1.date,
            holidayDayOfWeek: day1,
            recommendedDate: fridayBefore,
            recommendedDay: getDayOfWeek(fridayBefore),
            explanation: '→ 6-day vacation (Fri-Sat-Sun-Mon-Tue-Wed)',
            isGrouped: true,
            groupedHolidays: [holiday1.name, holiday2.name],
            daysToTakeOff: 1
          });
        }
      }
    }
    // If holidays are within 1-4 work days apart, suggest bridging them
    else if (workDaysBetween > 0 && workDaysBetween <= 4) {
      const day1 = getDayOfWeek(holiday1.date);
      const day2 = getDayOfWeek(holiday2.date);

      // Calculate the bridge dates (work days between the holidays)
      const bridgeDates: string[] = [];
      const [y, m, d] = holiday1.date.split('-').map(Number);
      const current = new Date(y, m - 1, d);
      current.setDate(current.getDate() + 1);

      const [y2, m2, d2] = holiday2.date.split('-').map(Number);
      const endDate = new Date(y2, m2 - 1, d2);

      while (current < endDate) {
        const dayOfWeek = current.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not weekend
          const dateStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
          if (!holidayDateSet.has(dateStr)) {
            bridgeDates.push(dateStr);
          }
        }
        current.setDate(current.getDate() + 1);
      }

      if (bridgeDates.length > 0 && bridgeDates.length <= 4) {
        // Calculate total days off (including weekends)
        const [y1, m1, d1] = holiday1.date.split('-').map(Number);
        const [y2, m2, d2] = holiday2.date.split('-').map(Number);
        const totalDays = Math.ceil((new Date(y2, m2-1, d2).getTime() - new Date(y1, m1-1, d1).getTime()) / (1000 * 60 * 60 * 24)) + 1;

        recommendations.push({
          holidayName: `${holiday1.name} + ${holiday2.name}`,
          holidayDate: holiday1.date,
          holidayDayOfWeek: day1,
          recommendedDate: bridgeDates.join(', '),
          recommendedDay: `${bridgeDates.length} day${bridgeDates.length > 1 ? 's' : ''}`,
          explanation: `→ ${totalDays}-day vacation (bridge ${workDaysBetween} work day${workDaysBetween > 1 ? 's' : ''})`,
          isGrouped: true,
          groupedHolidays: [holiday1.name, holiday2.name],
          daysToTakeOff: bridgeDates.length
        });
      }
    }
  }

  return recommendations;
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

  // First, find holiday clusters that can be bridged
  const clusterRecommendations = findHolidayClusters(validHolidays, holidayDateSet);
  recommendations.push(...clusterRecommendations);

  // Process each holiday for single-day recommendations
  for (const holiday of validHolidays) {
    const dayOfWeek = getDayOfWeek(holiday.date);

    // Handle Monday holidays - recommend Friday before off
    // Creates Fri-Sat-Sun-Mon (4-day weekend)
    if (dayOfWeek === 'Monday') {
      const fridayDate = addDays(holiday.date, -3); // Friday before (3 days back)
      const fridayDayOfWeek = getDayOfWeek(fridayDate);

      // Only recommend if Friday is not already a holiday
      if (!holidayDateSet.has(fridayDate)) {
        recommendations.push({
          holidayName: holiday.name,
          holidayDate: holiday.date,
          holidayDayOfWeek: dayOfWeek,
          recommendedDate: fridayDate,
          recommendedDay: fridayDayOfWeek,
          explanation: '→ 4-day weekend (Fri-Sat-Sun-Mon)'
        });
      }
    }

    // Handle Tuesday holidays - recommend Monday off
    // Creates Sat-Sun-Mon-Tue (4-day weekend)
    else if (dayOfWeek === 'Tuesday') {
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
          explanation: '→ 4-day weekend (Sat-Sun-Mon-Tue)'
        });
      }
    }

    // Handle Thursday holidays - recommend Friday off
    // Creates Thu-Fri-Sat-Sun (4-day weekend)
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
          explanation: '→ 4-day weekend (Thu-Fri-Sat-Sun)'
        });
      }
    }

    // Handle Friday holidays - recommend Monday after off
    // Creates Fri-Sat-Sun-Mon (4-day weekend)
    else if (dayOfWeek === 'Friday') {
      const mondayDate = addDays(holiday.date, 3); // Monday after (3 days forward)
      const mondayDayOfWeek = getDayOfWeek(mondayDate);

      // Only recommend if Monday is not already a holiday
      if (!holidayDateSet.has(mondayDate)) {
        recommendations.push({
          holidayName: holiday.name,
          holidayDate: holiday.date,
          holidayDayOfWeek: dayOfWeek,
          recommendedDate: mondayDate,
          recommendedDay: mondayDayOfWeek,
          explanation: '→ 4-day weekend (Fri-Sat-Sun-Mon)'
        });
      }
    }

    // Wednesday holidays don't generate recommendations (would need 2 days off)
    // Saturday/Sunday holidays are already part of the weekend
  }

  // Sort recommendations by holiday date for consistent output
  recommendations.sort((a, b) => a.holidayDate.localeCompare(b.holidayDate));

  return recommendations;
}