/**
 * Component Test: RecommendationCard (Story 1.5)
 *
 * Tests the RecommendationCard component for individual recommendation display
 * These tests are designed to FAIL initially (RED phase of TDD)
 *
 * Test ID: 1.5-COMP-001
 * Story: 1.5 - Display Recommendations
 * Acceptance Criteria: 4, 6
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import RecommendationCard from '../../src/components/RecommendationCard';
import { createRecommendation, createTestScenarios, createExplanationTestRecommendations } from '../support/factories/recommendation.factory';

// Mock any dependencies we might have
vi.mock('../../src/hooks/useHolidays', () => ({
  useHolidays: () => ({
    addHoliday: vi.fn(),
    deleteHoliday: vi.fn(),
    holidays: [],
  }),
}));

describe('RecommendationCard Component', () => {
  const testRecommendations = createTestScenarios();

  describe('AC4: Clear Recommendation Display Format', () => {
    test('should display holiday name with emphasis (bold)', () => {
      // GIVEN: RecommendationCard with a recommendation containing holiday name
      // WHEN: Component renders
      // THEN: Holiday name should be emphasized/visible

      const recommendation = testRecommendations.thanksgiving2025;

      render(<RecommendationCard recommendation={recommendation} />);

      // Check if holiday name is displayed and emphasized
      const holidayNameElement = screen.getByText(/Thanksgiving/i);
      expect(holidayNameElement).toBeInTheDocument();

      // Should have visual emphasis (could be bold, strong tag, or styling)
      expect(holidayNameElement.tagName).toMatch(/(STRONG|B|SPAN)/);
    });

    test('should display holiday date with day of week', () => {
      // GIVEN: RecommendationCard with recommendation containing holiday date
      // WHEN: Component renders
      // THEN: Should display formatted date with day of week

      const recommendation = testRecommendations.thanksgiving2025;

      render(<RecommendationCard recommendation={recommendation} />);

      // Should display the formatted date as per example: "Thursday, Nov 27"
      expect(screen.getByText(/Thursday.*Nov 27/i)).toBeInTheDocument();
      expect(screen.getByText(/2025/)).toBeInTheDocument();
    });

    test('should display recommended day off with emphasis', () => {
      // GIVEN: RecommendationCard with recommendation data
      // WHEN: Component renders
      // THEN: Recommended day off should be emphasized

      const recommendation = testRecommendations.thanksgiving2025;

      render(<RecommendationCard recommendation={recommendation} />);

      // Should show the recommended day with emphasis
      const recommendedDayElement = screen.getByText(/Friday.*Nov 28/i);
      expect(recommendedDayElement).toBeInTheDocument();

      // Recommended day should have emphasis
      expect(recommendedDayElement.tagName).toMatch(/(STRONG|B|SPAN)/);
    });

    test('should display explanation text with weekend length info', () => {
      // GIVEN: RecommendationCard with explanation
      // WHEN: Component renders
      // THEN: Should show the explanation with weekend length

      const recommendation = testRecommendations.thanksgiving2025;

      render(<RecommendationCard recommendation={recommendation} />);

      // Should display the explanation
      expect(screen.getByText(/to make a 4-day weekend!/i)).toBeInTheDocument();

      // Explanation should contain the key information
      expect(screen.getByText(/4-day weekend/i)).toBeInTheDocument();
    });

    test('should format 3-day weekend recommendations correctly', () => {
      // GIVEN: RecommendationCard with 3-day weekend recommendation
      // WHEN: Component renders
      // THEN: Should format correctly for 3-day weekends

      const recommendation = testRecommendations.laborDay2025;

      render(<RecommendationCard recommendation={recommendation} />);

      expect(screen.getByText(/Labor Day/i)).toBeInTheDocument();
      expect(screen.getByText(/Monday.*Sep 1/i)).toBeInTheDocument();
      expect(screen.getByText(/Friday.*Aug 29/i)).toBeInTheDocument();
      expect(screen.getByText(/3-day weekend/i)).toBeInTheDocument();
    });

    test('should handle different explanation formats', () => {
      // GIVEN: Various recommendation scenarios
      // WHEN: Components render
      // THEN: Each should display appropriate explanation format

      const explanationTests = createExplanationTestRecommendations();

      explanationTests.forEach(({ recommendation, description, explanationType }) => {
        // Using renderWithCleanup since we might have multiple renders
        const { unmount } = render(<RecommendationCard recommendation={recommendation} />);

        // Check that appropriate weekend length is mentioned
        if (explanationType === '4-day-weekend') {
          expect(screen.getByText(/4-day weekend/i)).toBeInTheDocument();
        } else if (explanationType === '3-day-weekend') {
          expect(screen.getByText(/3-day weekend/i)).toBeInTheDocument();
        }

        // Clean up
        unmount();
      });
    });
  });

  describe('AC6: Responsive and Accessible Design', () => {
    test('should have proper ARIA labels and roles', () => {
      // GIVEN: RecommendationCard component
      // WHEN: Component renders
      // THEN: Should have proper ARIA attributes

      const recommendation = testRecommendations.thanksgiving2025;

      render(<RecommendationCard recommendation={recommendation} />);

      // Should be in a list item or have appropriate role
      const recommendationElement = screen.getByRole('listitem');
      expect(recommendationElement).toBeInTheDocument();

      // Should have appropriate aria-label for screen readers
      expect(recommendationElement).toHaveAttribute('aria-label');
      expect(recommendationElement.getAttribute('aria-label')).toContain('Thanksgiving');
      expect(recommendationElement.getAttribute('aria-label')).toContain('Friday');
      expect(recommendationElement.getAttribute('aria-label')).toContain('weekend');
    });

    test('should have accessible text for screen readers', () => {
      // GIVEN: RecommendationCard with recommendation
      // WHEN: Component renders
      // THEN: Should provide complete accessible text

      const recommendation = testRecommendations.thanksgiving2025;

      render(<RecommendationCard recommendation={recommendation} />);

      // Should be discoverable by screen readers
 expect(screen.getByText(/Thanksgiving.*Thursday.*Nov 27.*2025/i)).toBeInTheDocument();
      expect(screen.getByText(/Friday.*Nov 28.*4-day weekend/i)).toBeInTheDocument();
    });

    test('should be keyboard navigable', () => {
      // GIVEN: RecommendationCard in a list
      // WHEN: Component renders
      // THEN: Should have proper keyboard interaction support

      const recommendation = testRecommendations.thanksgiving2025;

      render(
        <ul>
          <RecommendationCard recommendation={recommendation} />
        </ul>
      );

      const listItem = screen.getByRole('listitem');

      // List items in recommendations should be focusable/navigable
      expect(listItem).toHaveAttribute('tabIndex', '0');
    });

    test('should have responsive design classes', () => {
      // GIVEN: RecommendationCard component
      // WHEN: Component renders
      // THEN: Should have responsive Tailwind classes

      const recommendation = testRecommendations.thanksgiving2025;

      render(<RecommendationCard recommendation={recommendation} />);

      const containerElement = screen.getByRole('listitem');

      // Should have responsive paddings and spacing
      expect(containerElement).toHaveClass(
        'p-4', // padding
        'md:p-6', // responsive padding for medium screens
        'border', // border for visual separation
        'rounded-lg' // rounded corners
      );
    });

    test('should have sufficient color contrast', () => {
      // GIVEN: RecommendationCard component
      // WHEN: Component renders
      // THEN: Should use text colors with good contrast

      const recommendation = testRecommendations.thanksgiving2025;

      render(<RecommendationCard recommendation={recommendation} />);

      const containerElement = screen.getByRole('listitem');

      // Should use text colors with good contrast (avoid gray-on-gray)
      expect(containerElement).toHaveClass(
        'text-gray-900', // dark text for contrast
        'bg-white' // light background
      );
    });

    test('should handle emphasis text accessibly', () => {
      // GIVEN: RecommendationCard with emphasized text
      // WHEN: Component renders
      // THEN: Should use semantic emphasis tags

      const recommendation = testRecommendations.thanksgiving2025;

      render(<RecommendationCard recommendation={recommendation} />);

      // Find emphasized elements (should use semantic tags, not just styling)
      const emphasizedElements = screen.getAllByRole('strong');

      // Should have at least some emphasized elements
      expect(emphasizedElements.length).toBeGreaterThan(0);

      // Emphasized content should be meaningful
      emphasizedElements.forEach(element => {
        expect(element.textContent).toMatch(/(Thanksgiving|Friday|4-day)/);
      });
    });
  });

  describe('Component Structure and Edge Cases', () => {
    test('should render without crashing with valid recommendation', () => {
      // GIVEN: RecommendationCard with valid recommendation
      // WHEN: Component renders
      // THEN: Should not throw errors

      const recommendation = createRecommendation();

      expect(() => {
        render(<RecommendationCard recommendation={recommendation} />);
      }).not.toThrow();
    });

    test('should handle missing optional fields gracefully', () => {
      // GIVEN: RecommendationCard with incomplete recommendation
      // WHEN: Component renders
      // THEN: Should handle gracefully

      const incompleteRecommendation = {
        holidayName: 'Test Holiday',
        holidayDate: '2025-12-25',
        holidayDayOfWeek: '',
        recommendedDate: '',
        recommendedDay: '',
        explanation: 'Test explanation'
      };

      render(<RecommendationCard recommendation={incompleteRecommendation} />);

      // Should still display the available information
      expect(screen.getByText(/Test Holiday/i)).toBeInTheDocument();
      expect(screen.getByText(/Test explanation/i)).toBeInTheDocument();
    });

    test('should use test-id attributes for test automation', () => {
      // GIVEN: RecommendationCard component
      // WHEN: Component renders
      // THEN: Should have proper test-id attributes

      const recommendation = testRecommendations.thanksgiving2025;

      render(<RecommendationCard recommendation={recommendation} />);

      // Should have data-testid for automation
      expect(screen.getByTestId('recommendation-card')).toBeInTheDocument();
      expect(screen.getByTestId('recommendation-holiday-name')).toBeInTheDocument();
      expect(screen.getByTestId('recommendation-holiday-date')).toBeInTheDocument();
      expect(screen.getByTestId('recommendation-explanation')).toBeInTheDocument();
    });

    test('should proper typography styling', () => {
      // GIVEN: RecommendationCard component
      // WHEN: Component renders
      // THEN: Should have appropriate text styling

      const recommendation = testRecommendations.thanksgiving2025;

      render(<RecommendationCard recommendation={recommendation} />);

      const containerElement = screen.getByRole('listitem');

      // Should have proper typography classes
      expect(containerElement).toHaveClass(
        'text-base', // base text size
        'leading-relaxed' // good line height for readability
      );
    });
  });

  describe('Visual Design and Layout', () => {
    test('should have proper layout structure', () => {
      // GIVEN: RecommendationCard component
      // WHEN: Component renders
      // THEN: Should have semantic layout

      const recommendation = testRecommendations.thanksgiving2025;

      render(
        <ul>
          <RecommendationCard recommendation={recommendation} />
        </ul>
      );

      // Should be properly structured as list item
      expect(screen.getByRole('listitem')).toBeInTheDocument();
      expect(screen.getByRole('list')).toBeInTheDocument();
    });

    test('should have visual separation from other cards', () => {
      // GIVEN: RecommendationCard in a list
      // WHEN: Component renders
      // THEN: Should have visual separation

      const recommendation1 = testRecommendations.thanksgiving2025;
      const recommendation2 = testRecommendations.laborDay2025;

      render(
        <ul>
          <RecommendationCard recommendation={recommendation1} />
          <RecommendationCard recommendation={recommendation2} />
        </ul>
      );

      // Should have border for separation
      const listItems = screen.getAllByRole('listitem');
      listItems.forEach(item => {
        expect(item).toHaveClass('border-b'); // or appropriate border class
      });
    });
  });
});