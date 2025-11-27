/**
 * Recommendation Data Factory
 *
 * Provides factory functions for generating test recommendation data
 * Follows factory pattern with faker for unique, parallel-safe data
 */

import { faker } from '@faker-js/faker';

// Import Recommendation interface from dateLogic module
export interface Recommendation {
  holidayName: string;
  holidayDate: string;
  holidayDayOfWeek: string;
  recommendedDate: string;
  recommendedDay: string;
  explanation: string;
}

/**
 * Create a single recommendation with faker-generated default values
 * Supports overrides for specific test scenarios
 */
export const createRecommendation = (overrides: Partial<Recommendation> = {}): Recommendation => {
  const holidayDate = faker.date.future({ years: 2 });
  const holidayDateStr = holidayDate.toISOString().split('T')[0]; // YYYY-MM-DD format
  const holidayDayOfWeek = holidayDate.toLocaleDateString('en-US', { weekday: 'long' });

  // Generate recommendation based on holiday day of week
  const { recommendedDate, recommendedDay, explanation } = generateRecommendationFromHoliday(holidayDate);

  return {
    holidayName: faker.lorem.words({ min: 1, max: 2 }),
    holidayDate: holidayDateStr,
    holidayDayOfWeek,
    recommendedDate,
    recommendedDay,
    explanation,
    ...overrides,
  };
};

/**
 * Generate recommendation logic based on holiday day of week
 * This mimics the logic from calculateRecommendations function
 */
const generateRecommendationFromHoliday = (holidayDate: Date): {
  recommendedDate: string;
  recommendedDay: string;
  explanation: string;
} => {
  const dayOfWeek = holidayDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  if (dayOfWeek === 1) { // Monday
    // Take Friday before for 3-day weekend, or recommend next Tuesday for 4-day?
    const friday = new Date(holidayDate);
    friday.setDate(holidayDate.getDate() - 3);
    return {
      recommendedDate: friday.toISOString().split('T')[0],
      recommendedDay: friday.toLocaleDateString('en-US', { weekday: 'long' }),
      explanation: `Take ${friday.toLocaleDateString('en-US', { weekday: 'long' })}, ${friday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} off to make a 3-day weekend!`
    };
  } else if (dayOfWeek === 2) { // Tuesday
    // Take Monday before for 3-day weekend
    const monday = new Date(holidayDate);
    monday.setDate(holidayDate.getDate() - 1);
    return {
      recommendedDate: monday.toISOString().split('T')[0],
      recommendedDay: monday.toLocaleDateString('en-US', { weekday: 'long' }),
      explanation: `Take ${monday.toLocaleDateString('en-US', { weekday: 'long' })}, ${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} off to make a 3-day weekend!`
    };
  } else if (dayOfWeek === 3) { // Wednesday
    // Take Thursday after for 3-day weekend
    const thursday = new Date(holidayDate);
    thursday.setDate(holidayDate.getDate() + 1);
    return {
      recommendedDate: thursday.toISOString().split('T')[0],
      recommendedDay: thursday.toLocaleDateString('en-US', { weekday: 'long' }),
      explanation: `Take ${thursday.toLocaleDateString('en-US', { weekday: 'long' })}, ${thursday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} off to make a 3-day weekend!`
    };
  } else if (dayOfWeek === 4) { // Thursday
    // Take Friday after for 4-day weekend!
    const friday = new Date(holidayDate);
    friday.setDate(holidayDate.getDate() + 1);
    return {
      recommendedDate: friday.toISOString().split('T')[0],
      recommendedDay: friday.toLocaleDateString('en-US', { weekday: 'long' }),
      explanation: `Take ${friday.toLocaleDateString('en-US', { weekday: 'long' })}, ${friday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} off to make a 4-day weekend!`
    };
  } else {
    // Weekend or Friday - no good recommendation typically
    const nextDay = new Date(holidayDate);
    nextDay.setDate(holidayDate.getDate() + 1);
    return {
      recommendedDate: nextDay.toISOString().split('T')[0],
      recommendedDay: nextDay.toLocaleDateString('en-US', { weekday: 'long' }),
      explanation: `Consider taking ${nextDay.toLocaleDateString('en-US', { weekday: 'long' })}, ${nextDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} off to extend your weekend.`
    };
  }
};

/**
 * Create multiple recommendations with faker for bulk testing
 */
export const createRecommendations = (count: number, baseName?: string): Recommendation[] =>
  Array.from({ length: count }, (_, index) =>
    createRecommendation(baseName ? { holidayName: `${baseName} ${index + 1}` } : {})
  );

/**
 * Create recommendations with specific scenarios for testing
 */
export const createTestScenarios = () => ({
  thanksgiving2025: createRecommendation({
    holidayName: 'Thanksgiving',
    holidayDate: '2025-11-27',
    holidayDayOfWeek: 'Thursday',
    recommendedDate: '2025-11-28',
    recommendedDay: 'Friday',
    explanation: 'Take Friday, Nov 28 off to make a 4-day weekend!'
  }),

  laborDay2025: createRecommendation({
    holidayName: 'Labor Day',
    holidayDate: '2025-09-01',
    holidayDayOfWeek: 'Monday',
    recommendedDate: '2025-08-29',
    recommendedDay: 'Friday',
    explanation: 'Take Friday, Aug 29 off to make a 3-day weekend!'
  }),

  independenceDay2025: createRecommendation({
    holidayName: 'Independence Day',
    holidayDate: '2025-07-04',
    holidayDayOfWeek: 'Friday',
    recommendedDate: '2025-07-07',
    recommendedDay: 'Monday',
    explanation: 'Consider taking Monday, Jul 7 off to extend your weekend.'
  }),

  valentinesDay2025: createRecommendation({
    holidayName: 'Valentine\'s Day',
    holidayDate: '2025-02-14',
    holidayDayOfWeek: 'Friday',
    recommendedDate: '2025-02-17',
    recommendedDay: 'Monday',
    explanation: 'Consider taking Monday, Feb 17 off to extend your weekend.'
  })
});

/**
 * Create recommendations for testing sorting by date
 */
export const createSortedTestRecommendations = (): Recommendation[] => {
  const scenarios = createTestScenarios();
  return [
    scenarios.valentinesDay2025,
    scenarios.independenceDay2025,
    scenarios.laborDay2025,
    scenarios.thanksgiving2025
  ].sort((a, b) => new Date(a.holidayDate).getTime() - new Date(b.holidayDate).getTime());
};

/**
 * Create recommendations for testing different explanation formats
 */
export const createExplanationTestRecommendations = (): Array<{
  recommendation: Recommendation;
  description: string;
  explanationType: '4-day-weekend' | '3-day-weekend' | 'weekend-extend';
}> => [
  {
    recommendation: createRecommendation({
      holidayName: 'Thanksgiving',
      holidayDate: '2025-11-27',
      holidayDayOfWeek: 'Thursday',
      recommendedDate: '2025-11-28',
      recommendedDay: 'Friday',
      explanation: 'Take Friday, Nov 28 off to make a 4-day weekend!'
    }),
    description: '4-day weekend recommendation for Thursday holiday',
    explanationType: '4-day-weekend'
  },
  {
    recommendation: createRecommendation({
      holidayName: 'Labor Day',
      holidayDate: '2025-09-01',
      holidayDayOfWeek: 'Monday',
      recommendedDate: '2025-08-29',
      recommendedDay: 'Friday',
      explanation: 'Take Friday, Aug 29 off to make a 3-day weekend!'
    }),
    description: '3-day weekend recommendation for Monday holiday',
    explanationType: '3-day-weekend'
  },
  {
    recommendation: createRecommendation({
      holidayName: 'Christmas',
      holidayDate: '2025-12-25',
      holidayDayOfWeek: 'Thursday',
      recommendedDate: '2025-12-26',
      recommendedDay: 'Friday',
      explanation: 'Take Friday, Dec 26 off to make a 4-day weekend!'
    }),
    description: '4-day weekend recommendation for Christmas',
    explanationType: '4-day-weekend'
  }
];

/**
 * Create recommendations for testing empty scenarios
 */
export const createEmptyTestRecommendations = () => ({
  emptyArray: [],
  noRecommendations: [] as Recommendation[],
  singleRecommendation: createRecommendation({
    holidayName: 'Test Holiday',
    holidayDate: '2025-12-25',
    holidayDayOfWeek: 'Thursday',
    recommendedDate: '2025-12-26',
    recommendedDay: 'Friday',
    explanation: 'Take Friday, Dec 26 off to make a 4-day weekend!'
  })
});

/**
 * Bulk create recommendations for testing pagination or large lists
 */
export const createManyRecommendations = (count: number): Recommendation[] => {
  if (count === 0) return [];
  if (count <= 10) {
    return createRecommendations(count);
  }

  // For larger counts, create sorted recommendations
  const recommendations = createRecommendations(count);
  return recommendations.sort((a, b) => new Date(a.holidayDate).getTime() - new Date(b.holidayDate).getTime());
};

/**
 * Create recommendations for testing accessibility scenarios
 */
export const createAccessibilityTestRecommendations = (): Recommendation[] => {
  const scenarios = createTestScenarios();
  return [
    scenarios.thanksgiving2025, // Has "4-day weekend" text
    scenarios.laborDay2025,    // Has "3-day weekend" text
  ];
};