/**
 * Recommendations Test Fixture
 *
 * Provides test fixtures for recommendations components
 * Follows fixture architecture patterns with auto-cleanup
 */

import { test as base } from 'vitest';
import {
  createRecommendation,
  createRecommendations,
  createSortedTestRecommendations,
  createTestScenarios,
  createExplanationTestRecommendations,
  createEmptyTestRecommendations
} from '../factories/recommendation.factory';

// Recommendation interface from dateLogic module
export interface Recommendation {
  holidayName: string;
  holidayDate: string;
  holidayDayOfWeek: string;
  recommendedDate: string;
  recommendedDay: string;
  explanation: string;
}

// Extended fixture type for recommendations testing
export interface RecommendationsFixture {
  // Data creation helpers
  createRecommendation: (overrides?: Partial<Recommendation>) => Recommendation;
  createRecommendations: (count: number, baseName?: string) => Recommendation[];
  createTestScenarios: () => ReturnType<typeof createTestScenarios>;
  createExplanationTestRecommendations: () => ReturnType<typeof createExplanationTestRecommendations>;
  createSortedTestRecommendations: () => Recommendation[];
  createEmptyTestRecommendations: () => ReturnType<typeof createEmptyTestRecommendations>;

  // Test scenario helpers
  thanksgivingRecommendation: Recommendation;
  laborDayRecommendation: Recommendation;
  christmasRecommendation: Recommendation;
  valentinesDayRecommendation: Recommendation;

  // Common test sets
  threeDayWeekendScenarios: Recommendation[];
  fourDayWeekendScenarios: Recommendation[];
  weekendExtendScenarios: Recommendation[];

  // Edge case data
  longNameRecommendation: Recommendation;
  emptyNameRecommendation: Recommendation;
  invalidRecommendation: Recommendation;
}

export const test = base.extend<RecommendationsFixture>({
  // Data creation helpers exposed in fixture
  createRecommendation: [async ({}, use) => {
    await use((overrides) => createRecommendation(overrides));
  }, { scope: 'test' }],

  createRecommendations: [async ({}, use) => {
    await use((count, baseName) => createRecommendations(count, baseName));
  }, { scope: 'test' }],

  createTestScenarios: [async ({}, use) => {
    await use(() => createTestScenarios());
  }, { scope: 'test' }],

  createExplanationTestRecommendations: [async ({}, use) => {
    await use(() => createExplanationTestRecommendations());
  }, { scope: 'test' }],

  createSortedTestRecommendations: [async ({}, use) => {
    await use(() => createSortedTestRecommendations());
  }, { scope: 'test' }],

  createEmptyTestRecommendations: [async ({}, use) => {
    await use(() => createEmptyTestRecommendations());
  }, { scope: 'test' }],

  // Pre-created common test scenarios
  thanksgivingRecommendation: [async ({}, use) => {
    const scenarios = createTestScenarios();
    await use(scenarios.thanksgiving2025);
  }, { scope: 'test' }],

  laborDayRecommendation: [async ({}, use) => {
    const scenarios = createTestScenarios();
    await use(scenarios.laborDay2025);
  }, { scope: 'test' }],

  christmasRecommendation: [async ({}, use) => {
    await use({
      holidayName: 'Christmas',
      holidayDate: '2025-12-25',
      holidayDayOfWeek: 'Thursday',
      recommendedDate: '2025-12-26',
      recommendedDay: 'Friday',
      explanation: 'Take Friday, Dec 26 off to make a 4-day weekend!'
    });
  }, { scope: 'test' }],

  valentinesDayRecommendation: [async ({}, use) => {
    const scenarios = createTestScenarios();
    await use(scenarios.valentinesDay2025);
  }, { scope: 'test' }],

  // Grouped test scenarios by weekend type
  threeDayWeekendScenarios: [async ({}, use) => {
    const scenarios = [
      {
        holidayName: 'Labor Day',
        holidayDate: '2025-09-01',
        holidayDayOfWeek: 'Monday',
        recommendedDate: '2025-08-29',
        recommendedDay: 'Friday',
        explanation: 'Take Friday, Aug 29 off to make a 3-day weekend!'
      },
      {
        holidayName: 'Veterans Day',
        holidayDate: '2025-11-11',
        holidayDayOfWeek: 'Tuesday',
        recommendedDate: '2025-11-10',
        recommendedDay: 'Monday',
        explanation: 'Take Monday, Nov 10 off to make a 3-day weekend!'
      }
    ];
    await use(scenarios);
  }, { scope: 'test' }],

  fourDayWeekendScenarios: [async ({}, use) => {
    const scenarios = [
      {
        holidayName: 'Thanksgiving',
        holidayDate: '2025-11-27',
        holidayDayOfWeek: 'Thursday',
        recommendedDate: '2025-11-28',
        recommendedDay: 'Friday',
        explanation: 'Take Friday, Nov 28 off to make a 4-day weekend!'
      },
      {
        holidayName: 'Christmas',
        holidayDate: '2025-12-25',
        holidayDayOfWeek: 'Thursday',
        recommendedDate: '2025-12-26',
        recommendedDay: 'Friday',
        explanation: 'Take Friday, Dec 26 off to make a 4-day weekend!'
      }
    ];
    await use(scenarios);
  }, { scope: 'test' }],

  weekendExtendScenarios: [async ({}, use) => {
    const scenarios = [
      {
        holidayName: 'Independence Day',
        holidayDate: '2025-07-04',
        holidayDayOfWeek: 'Friday',
        recommendedDate: '2025-07-07',
        recommendedDay: 'Monday',
        explanation: 'Consider taking Monday, Jul 7 off to extend your weekend.'
      },
      {
        holidayName: 'New Year\'s Eve',
        holidayDate: '2025-12-31',
        holidayDayOfWeek: 'Wednesday',
        holidayDate: '2026-01-01',
        recommendedDay: 'Thursday',
        explanation: 'Take Thursday, Jan 1 off to make a 3-day weekend!'
      }
    ];
    await use(scenarios);
  }, { scope: 'test' }],

  // Edge case data
  longNameRecommendation: [async ({}, use) => {
    await use({
      holidayName: 'Holiday with Very Long Name That Might Break Layout ifNotHandledProperly',
      holidayDate: '2025-12-25',
      holidayDayOfWeek: 'Thursday',
      recommendedDate: '2025-12-26',
      recommendedDay: 'Friday',
      explanation: 'Take Friday, Dec 26 off to make a 4-day weekend!'
    });
  }, { scope: 'test' }],

  emptyNameRecommendation: [async ({}, use) => {
    await use({
      holidayName: '',
      holidayDate: '2025-12-25',
      holidayDayOfWeek: 'Thursday',
      recommendedDate: '2025-12-26',
      recommendedDay: 'Friday',
      explanation: 'Take Friday, Dec 26 off to make a 4-day weekend!'
    });
  }, { scope: 'test' }],

  invalidRecommendation: [async ({}, use) => {
    await use({
      holidayName: null as any,
      holidayDate: 'invalid-date',
      holidayDayOfWeek: '',
      recommendedDate: '',
      recommendedDay: '',
      explanation: null as any
    });
  }, { scope: 'test' }],
});

// Component-specific fixture for RecommendationCard
export interface RecommendationCardFixture extends RecommendationsFixture {
  renderRecommendationCard: (recommendation: Recommendation) => Promise<any>;
}

export const recommendationCardTest = base.extend<RecommendationCardFixture>({
  ...test,

  renderRecommendationCard: [async ({}, use) => {
    await use(async (recommendation) => {
      // Dynamic import to avoid circular dependencies
      const { render } = await import('@testing-library/react');
      const RecommendationCard = (await import('../../src/components/RecommendationCard')).default;

      return render(<RecommendationCard recommendation={recommendation} />);
    });
  }, { scope: 'test' }],
});

// Component-specific fixture for RecommendationsSection
export interface RecommendationsSectionFixture extends RecommendationsFixture {
  renderRecommendationsSection: (recommendations: Recommendation[], props?: any) => Promise<any>;
}

export const recommendationsSectionTest = base.extend<RecommendationsSectionFixture>({
  ...test,

  renderRecommendationsSection: [async ({}, use) => {
    await use(async (recommendations, props = {}) => {
      const { render } = await import('@testing-library/react');
      const RecommendationsSection = (await import('../../src/components/RecommendationsSection')).default;

      return render(<RecommendationsSection recommendations={recommendations} {...props} />);
    });
  }, { scope: 'test' }],
});

// Export default test and component-specific fixtures
export { test as default };
export { recommendationCardTest, recommendationsSectionTest };

// Helper functions for test setup
export const setupRecommendationsTest = (recommendationCount: number = 3) => {
  return {
    recommendations: createRecommendations(recommendationCount),
    emptyRecommendations: [],
    singleRecommendation: createRecommendation(),
    sortedRecommendations: createSortedTestRecommendations()
  };
};

export const setupAccessibilityTest = () => {
  return {
    recommendations: createSortedTestRecommendations(),
    threeDayRecommendations: [
      {
        holidayName: 'Labor Day',
        holidayDate: '2025-09-01',
        holidayDayOfWeek: 'Monday',
        recommendedDate: '2025-08-29',
        recommendedDay: 'Friday',
        explanation: 'Take Friday, Aug 29 off to make a 3-day weekend!'
      }
    ],
    fourDayRecommendation: {
      holidayName: 'Thanksgiving',
      holidayDate: '2025-11-27',
      holidayDayOfWeek: 'Thursday',
      recommendedDate: '2025-11-28',
      recommendedDay: 'Friday',
      explanation: 'Take Friday, Nov 28 off to make a 4-day weekend!'
    }
  };
};

export const setupEdgeCaseTest = () => {
  return {
    longNameRecommendation: {
      holidayName: 'Holiday with Very Long Name That Might Break Layout ifNotHandledProperly',
      holidayDate: '2025-12-25',
      holidayDayOfWeek: 'Thursday',
      recommendedDate: '2025-12-26',
      recommendedDay: 'Friday',
      explanation: 'Take Friday, Dec 26 off to make a 4-day weekend!'
    },
    emptyFieldsRecommendation: {
      holidayName: '',
      holidayDate: '2025-12-25',
      holidayDayOfWeek: 'Thursday',
      recommendedDate: '2025-12-26',
      recommendedDay: 'Friday',
      explanation: 'Take Friday, Dec 26 off to make a 4-day weekend!'
    },
    invalidRecommendation: {
      holidayName: null as any,
      holidayDate: 'invalid-date',
      holidayDayOfWeek: '',
      recommendedDate: '',
      recommendedDay: '',
      explanation: null as any
    }
  };
};