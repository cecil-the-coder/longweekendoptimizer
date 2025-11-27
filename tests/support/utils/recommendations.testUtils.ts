/**
 * Recommendations Test Utilities
 *
 * Provides helper functions and utilities for recommendations testing
 * Supports various test scenarios and assertions
 */

import { Recommendation } from '../fixtures/recommendations.fixture';

/**
 * Test utility for assertions on recommendation data
 */
export class RecommendationAssertions {
  /**
   * Assert that a recommendation has valid structure
   */
  static assertValidRecommendation(recommendation: Recommendation) {
    expect(recommendation).toHaveProperty('holidayName');
    expect(recommendation).toHaveProperty('holidayDate');
    expect(recommendation).toHaveProperty('holidayDayOfWeek');
    expect(recommendation).toHaveProperty('recommendedDate');
    expect(recommendation).toHaveProperty('recommendedDay');
    expect(recommendation).toHaveProperty('explanation');

    expect(typeof recommendation.holidayName).toBe('string');
    expect(typeof recommendation.holidayDate).toBe('string');
    expect(typeof recommendation.holidayDayOfWeek).toBe('string');
    expect(typeof recommendation.recommendedDate).toBe('string');
    expect(typeof recommendation.recommendedDay).toBe('string');
    expect(typeof recommendation.explanation).toBe('string');
  }

  /**
   * Assert that recommendations are sorted chronologically by holiday date
   */
  static assertChronologicalSort(recommendations: Recommendation[]) {
    if (recommendations.length <= 1) {
      return; // No need to sort single or empty arrays
    }

    for (let i = 1; i < recommendations.length; i++) {
      const prevDate = new Date(recommendations[i - 1].holidayDate);
      const currDate = new Date(recommendations[i].holidayDate);

      expect(prevDate.getTime()).toBeLessThanOrEqual(currDate.getTime());
    }
  }

  /**
   * Assert that a recommendation mentions weekend type in explanation
   */
  static assertWeekendTypeInExplanation(recommendation: Recommendation, expectedType: '3-day' | '4-day' | 'weekend') {
    const explanation = recommendation.explanation.toLowerCase();

    if (expectedType === '3-day') {
      expect(explanation).toContain('3-day weekend');
    } else if (expectedType === '4-day') {
      expect(explanation).toContain('4-day weekend');
    } else {
      expect(explanation).toMatch(/(weekend|extend)/);
    }
  }

  /**
   * Assert that date format matches expected pattern
   */
  static assertDateFormat(dateString: string, expectedPattern: RegExp) {
    expect(dateString).toMatch(expectedPattern);
  }

  /**
   * Assert that day of week matches holiday date
   */
  static assertDayOfWeekMatch(holidayDate: string, expectedDayOfWeek: string) {
    const actualDayOfWeek = new Date(holidayDate).toLocaleDateString('en-US', { weekday: 'long' });
    expect(actualDayOfWeek).toBe(expectedDayOfWeek);
  }
}

/**
 * Test utility for creating test scenarios
 */
export class RecommendationTestScenarios {
  /**
   * Create a complete set of test recommendations covering all scenarios
   */
  static createCompleteTestSet() {
    return {
      thanksgiving2025: {
        holidayName: 'Thanksgiving',
        holidayDate: '2025-11-27',
        holidayDayOfWeek: 'Thursday',
        recommendedDate: '2025-11-28',
        recommendedDay: 'Friday',
        explanation: 'Take Friday, Nov 28 off to make a 4-day weekend!'
      },

      laborDay2025: {
        holidayName: 'Labor Day',
        holidayDate: '2025-09-01',
        holidayDayOfWeek: 'Monday',
        recommendedDate: '2025-08-29',
        recommendedDay: 'Friday',
        explanation: 'Take Friday, Aug 29 off to make a 3-day weekend!'
      },

      valentinesDay2025: {
        holidayName: 'Valentine\'s Day',
        holidayDate: '2025-02-14',
        holidayDayOfWeek: 'Friday',
        recommendedDate: '2025-02-17',
        recommendedDay: 'Monday',
        explanation: 'Consider taking Monday, Feb 17 off to extend your weekend.'
      },

      independenceDay2025: {
        holidayName: 'Independence Day',
        holidayDate: '2025-07-04',
        holidayDayOfWeek: 'Friday',
        recommendedDate: '2025-07-07',
        recommendedDay: 'Monday',
        explanation: 'Consider taking Monday, Jul 7 off to extend your weekend.'
      }
    };
  }

  /**
   * Create recommendations for testing different explanation formats
   */
  static createExplanationTestCases() {
    return [
      {
        type: '4-day-weekend',
        recommendation: {
          holidayName: 'Thanksgiving',
          holidayDate: '2025-11-27',
          holidayDayOfWeek: 'Thursday',
          recommendedDate: '2025-11-28',
          recommendedDay: 'Friday',
          explanation: 'Take Friday, Nov 28 off to make a 4-day weekend!'
        }
      },
      {
        type: '3-day-weekend',
        recommendation: {
          holidayName: 'Labor Day',
          holidayDate: '2025-09-01',
          holidayDayOfWeek: 'Monday',
          recommendedDate: '2025-08-29',
          recommendedDay: 'Friday',
          explanation: 'Take Friday, Aug 29 off to make a 3-day weekend!'
        }
      },
      {
        type: 'weekend-extend',
        recommendation: {
          holidayName: 'Christmas',
          holidayDate: '2025-12-25',
          holidayDayOfWeek: 'Thursday',
          recommendedDate: '2025-12-26',
          recommendedDay: 'Friday',
          explanation: 'Take Friday, Dec 26 off to make a 4-day weekend!'
        }
      }
    ];
  }
}

/**
 * Test utility for DOM assertions
 */
export class DOMAssertions {
  /**
   * Assert that element has specific accessibility attributes
   */
  static assertAccessibilityAttributes(element: HTMLElement, expectedAttributes: Record<string, string>) {
    Object.entries(expectedAttributes).forEach(([attr, value]) => {
      expect(element).toHaveAttribute(attr, value);
    });
  }

  /**
   * Assert that element has proper semantic structure
   */
  static assertSemanticStructure(container: HTMLElement, expectedRoles: string[]) {
    expectedRoles.forEach(role => {
      const element = container.querySelector(`[role="${role}"]`);
      expect(element).toBeInTheDocument();
    });
  }

  /**
   * Assert that text content contains expected segments
   */
  static assertTextContent(element: HTMLElement, expectedSegments: string[]) {
    const content = element.textContent || '';
    expectedSegments.forEach(segment => {
      expect(content).toContain(segment);
    });
  }

  /**
   * Assert that element has responsive design classes
   */
  static assertResponsiveClasses(element: HTMLElement, baseClasses: string[], responsiveClasses: string[]) {
    // Check base classes
    baseClasses.forEach(baseClass => {
      expect(element).toHaveClass(baseClass);
    });

    // Check that at least some responsive classes are present
    const hasResponsiveClass = responsiveClasses.some(responsiveClass =>
      element.className.includes(responsiveClass)
    );
    expect(hasResponsiveClass).toBe(true);
  }
}

/**
 * Test utility for performance testing
 */
export class PerformanceTestUtils {
  /**
   * Measure render time for a component
   */
  static async measureRenderTime(renderFunction: () => Promise<any>): Promise<number> {
    const start = performance.now();
    await renderFunction();
    const end = performance.now();
    return end - start;
  }

  /**
   * Assert that render time is within acceptable limits
   */
  static assertRenderTimeBelow(renderTime: number, maxTime: number) {
    expect(renderTime).toBeLessThan(maxTime);
  }

  /**
   * Measure time for rendering multiple recommendations
   */
  static async measureManyRecommendationsRender(
    recommendations: Recommendation[],
    renderFunction: (recs: Recommendation[]) => Promise<any>
  ): Promise<number> {
    const start = performance.now();
    await renderFunction(recommendations);
    const end = performance.now();
    return end - start;
  }
}

/**
 * Test utility for error scenarios
 */
export class ErrorTestUtils {
  /**
   * Create malformed recommendation data for error testing
   */
  static createMalformedRecommendations() {
    return [
      {
        // Missing fields
        holidayName: 'Incomplete',
        holidayDate: '2025-12-25'
      } as Recommendation,

      {
        // Invalid types
        holidayName: null as any,
        holidayDate: 123 as any,
        holidayDayOfWeek: undefined as any,
        recommendedDate: [],
        recommendedDay: {},
        explanation: () => 'function'
      } as any,

      {
        // Invalid date
        holidayName: 'Invalid Date',
        holidayDate: 'not-a-date',
        holidayDayOfWeek: 'Neverday',
        recommendedDate: '2025-99-99',
        recommendedDay: 'Notaday',
        explanation: 'This has invalid data'
      }
    ];
  }

  /**
   * Create edge case recommendations
   */
  static createEdgeCaseRecommendations() {
    return {
      veryLongName: {
        holidayName: 'A'.repeat(200), // Very long name
        holidayDate: '2025-12-25',
        holidayDayOfWeek: 'Thursday',
        recommendedDate: '2025-12-26',
        recommendedDay: 'Friday',
        explanation: 'Take Friday, Dec 26 off to make a 4-day weekend!'
      },

      emptyName: {
        holidayName: '',
        holidayDate: '2025-12-25',
        holidayDayOfWeek: 'Thursday',
        recommendedDate: '2025-12-26',
        recommendedDay: 'Friday',
        explanation: 'Take Friday, Dec 26 off to make a 4-day weekend!'
      },

      specialCharacters: {
        holidayName: 'Holiday with Special Characters! @#$%^&*()_+-={}[]|\\:";\'<>?,./',
        holidayDate: '2025-12-25',
        holidayDayOfWeek: 'Thursday',
        recommendedDate: '2025-12-26',
        recommendedDay: 'Friday',
        explanation: 'Take Friday, Dec 26 off to make a 4-day weekend!'
      },

      unicodeCharacters: {
        holidayName: 'Célébration de Noël 🎄',
        holidayDate: '2025-12-25',
        holidayDayOfWeek: 'Thursday',
        recommendedDate: '2025-12-26',
        recommendedDay: 'Friday',
        explanation: 'Take Friday, Dec 26 off to make a 4-day weekend!'
      }
    };
  }
}

/**
 * Test utility for mocking and cleanup
 */
export class TestUtils {
  /**
   * Create mock component render function
   */
  static createMockRender(renderFunction: (props: any) => any) {
    return {
      render: renderFunction,
      cleanup: () => {
        // Cleanup logic if needed
      }
    };
  }

  /**
   * Setup and cleanup test environment
   */
  static setupTestEnvironment() {
    // Setup any global test environment needs
    const originalConsoleError = console.error;

    // Suppress expected React warnings during tests
    console.error = (...args: any[]) => {
      const [message] = args;
      if (
        typeof message === 'string' &&
        (message.includes('Warning:') || message.includes('validateDOMNesting'))
      ) {
        return;
      }
      originalConsoleError(...args);
    };

    // Return cleanup function
    return () => {
      console.error = originalConsoleError;
    };
  }

  /**
   * Wait for component to update
   */
  static async waitForUpdate(waitTime: number = 0): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, waitTime));
  }
}

export default {
  RecommendationAssertions,
  RecommendationTestScenarios,
  DOMAssertions,
  PerformanceTestUtils,
  ErrorTestUtils,
  TestUtils
};