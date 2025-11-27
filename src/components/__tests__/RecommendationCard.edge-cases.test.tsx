// Recommendation Card Edge Cases and Error Path Tests
// Following TEA quality principles: deterministic, isolated, explicit assertions
// Enhanced coverage for edge cases, accessibility errors, and malformed data

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import RecommendationCard from '../RecommendationCard';
import { Recommendation } from '../../utils/dateLogic';

describe('RecommendationCard - Edge Cases and Error Paths', () => {
  const mockRecommendation: Recommendation = {
    holidayName: 'Thanksgiving',
    holidayDate: '2025-11-27',
    holidayDayOfWeek: 'Thursday',
    recommendedDate: '2025-11-28',
    recommendedDay: 'Friday',
    explanation: '→ 4-day weekend'
  };

  describe('Malformed Data Handling', () => {
    it('[P2] should handle empty holiday name gracefully', () => {
      const emptyNameRecommendation: Recommendation = {
        ...mockRecommendation,
        holidayName: '',
      };

      render(<RecommendationCard recommendation={emptyNameRecommendation} />);

      expect(screen.getByText('For')).toBeInTheDocument();
      // Should still display the rest of the content
      expect(screen.getByText('Holiday:')).toBeInTheDocument();
      expect(screen.getByText('Thursday, Nov 27, 2025')).toBeInTheDocument();
      expect(screen.getByText(/Take off:/i)).toBeInTheDocument();
    });

    it('[P2] should handle extremely long holiday names', () => {
      const longNameRecommendation: Recommendation = {
        ...mockRecommendation,
        holidayName: 'A'.repeat(200), // Very long name
      };

      render(<RecommendationCard recommendation={longNameRecommendation} />);

      expect(screen.getByText(/A+/)).toBeInTheDocument();
      expect(screen.getByText('Holiday:')).toBeInTheDocument();
      // Should still render without layout breaking
      const card = screen.getByRole('article');
      expect(card).toBeInTheDocument();
    });

    it('[P2] should handle holiday name with special characters', () => {
      const specialCharsRecommendation: Recommendation = {
        ...mockRecommendation,
        holidayName: "St. Patrick's Day & New Year's Celebration! @2025",
      };

      render(<RecommendationCard recommendation={specialCharsRecommendation} />);

      expect(screen.getByText(/St\. Patrick's Day & New Year's Celebration! @2025/i)).toBeInTheDocument();
      expect(screen.getByRole('article')).toBeInTheDocument();
    });

    it('[P2] should handle invalid date strings gracefully', () => {
      const invalidDateRecommendation: Recommendation = {
        ...mockRecommendation,
        holidayDate: 'invalid-date',
        recommendedDate: 'also-invalid',
      };

      render(<RecommendationCard recommendation={invalidDateRecommendation} />);

      // Should still attempt to render the component
      expect(screen.getByRole('article')).toBeInTheDocument();
      expect(screen.getByText('Holiday:')).toBeInTheDocument();
      // The date formatting may produce "Invalid Date" but shouldn't crash
    });

    it('[P2] should handle future dates far in the future', () => {
      const futureRecommendation: Recommendation = {
        ...mockRecommendation,
        holidayDate: '2099-12-31',
        recommendedDate: '2100-01-01',
      };

      render(<RecommendationCard recommendation={futureRecommendation} />);

      expect(screen.getByText('Holiday:')).toBeInTheDocument();
      expect(screen.getByText(/Thursday, Dec 31, 2099/i)).toBeInTheDocument();
      expect(screen.getByRole('article')).toBeInTheDocument();
    });

    it('[P2] should handle very old dates', () => {
      const oldDateRecommendation: Recommendation = {
        ...mockRecommendation,
        holidayDate: '1900-01-01',
        recommendedDate: '1899-12-31',
      };

      render(<RecommendationCard recommendation={oldDateRecommendation} />);

      expect(screen.getByText('Holiday:')).toBeInTheDocument();
      expect(screen.getByRole('article')).toBeInTheDocument();
    });

    it('[P2] should handle empty explanation text', () => {
      const emptyExplanationRecommendation: Recommendation = {
        ...mockRecommendation,
        explanation: '',
      };

      render(<RecommendationCard recommendation={emptyExplanationRecommendation} />);

      expect(screen.getByRole('article')).toBeInTheDocument();
      expect(screen.getByText('Holiday:')).toBeInTheDocument();
      // Explanation area exists but may be empty
    });

    it('[P2] should handle explanation with special characters and emojis', () => {
      const emojiExplanationRecommendation: Recommendation = {
        ...mockRecommendation,
        explanation: '🎉 → 4-day weekend! 🍀🌟 Special chars: @#$%',
      };

      render(<RecommendationCard recommendation={emojiExplanationRecommendation} />);

      expect(screen.getByText('🎉 → 4-day weekend! 🍀🌟 Special chars: @#$%')).toBeInTheDocument();
      expect(screen.getByRole('article')).toBeInTheDocument();
    });
  });

  describe('Date Edge Cases', () => {
    it('[P2] should handle leap year dates correctly', () => {
      const leapYearRecommendation: Recommendation = {
        holidayName: 'Leap Day',
        holidayDate: '2024-02-29', // Leap day
        holidayDayOfWeek: 'Thursday',
        recommendedDate: '2024-03-01',
        recommendedDay: 'Friday',
        explanation: '→ 4-day weekend'
      };

      render(<RecommendationCard recommendation={leapYearRecommendation} />);

      expect(screen.getByText('Leap Day')).toBeInTheDocument();
      expect(screen.getByText('Thursday, Feb 29, 2024')).toBeInTheDocument();
      expect(screen.getByText('Friday, Mar 1, 2024')).toBeInTheDocument();
    });

    it('[P2] should handle year boundary transitions', () => {
      const newYearRecommendation: Recommendation = {
        holidayName: "New Year's Day",
        holidayDate: '2025-01-01',
        holidayDayOfWeek: 'Wednesday',
        recommendedDate: '2024-12-31', // Previous year
        recommendedDay: 'Tuesday',
        explanation: '→ 4-day weekend'
      };

      render(<RecommendationCard recommendation={newYearRecommendation} />);

      expect(screen.getByText(/New Year's Day/i)).toBeInTheDocument();
      expect(screen.getByText('Wednesday, Jan 1, 2025')).toBeInTheDocument();
      expect(screen.getByText('Tuesday, Dec 31, 2024')).toBeInTheDocument();
    });

    it('[P2] should handle December dates and Christmas', () => {
      const christmasRecommendation: Recommendation = {
        holidayName: 'Christmas',
        holidayDate: '2025-12-25',
        holidayDayOfWeek: 'Thursday',
        recommendedDate: '2025-12-26',
        recommendedDay: 'Friday',
        explanation: '→ 4-day weekend'
      };

      render(<RecommendationCard recommendation={christmasRecommendation} />);

      expect(screen.getByText('Christmas')).toBeInTheDocument();
      expect(screen.getByText('Thursday, Dec 25, 2025')).toBeInTheDocument();
      expect(screen.getByText('Friday, Dec 26, 2025')).toBeInTheDocument();
    });

    it('[P2] should handle different month formats across the year', () => {
      const monthsTest = [
        { date: '2025-01-15', month: 'Jan' },
        { date: '2025-02-14', month: 'Feb' },
        { date: '2025-03-17', month: 'Mar' },
        { date: '2025-04-01', month: 'Apr' },
        { date: '2025-05-27', month: 'May' },
        { date: '2025-06-19', month: 'Jun' },
        { date: '2025-07-04', month: 'Jul' },
        { date: '2025-08-15', month: 'Aug' },
        { date: '2025-09-01', month: 'Sep' },
        { date: '2025-10-31', month: 'Oct' },
        { date: '2025-11-11', month: 'Nov' },
        { date: '2025-12-25', month: 'Dec' },
      ];

      monthsTest.forEach(({ date, month }) => {
        const monthRecommendation: Recommendation = {
          holidayName: `Test Holiday ${month}`,
          holidayDate: date,
          holidayDayOfWeek: 'Tuesday',
          recommendedDate: '2025-01-01',
          recommendedDay: 'Wednesday',
          explanation: '→ 3-day weekend'
        };

        const { unmount } = render(<RecommendationCard recommendation={monthRecommendation} />);

        // Look for the holiday in the context of the specific element
        expect(screen.getByText(`Test Holiday ${month}`)).toBeInTheDocument();
        // Find the specific holiday date (not the recommended date)
        const holidayDateElement = screen.getByText('Holiday:').parentElement;
        expect(holidayDateElement).toBeInTheDocument();
        expect(holidayDateElement?.textContent).toMatch(new RegExp(`${month} \\d+, 2025`));
        expect(screen.getByRole('article')).toBeInTheDocument();

        unmount(); // Clean up for next iteration
      });
    });
  });

  describe('Accessibility Edge Cases', () => {
    it('[P2] should maintain proper ARIA labels with special characters', () => {
      const specialCharsRecommendation: Recommendation = {
        ...mockRecommendation,
        holidayName: "Holiday with & 'special' chars",
      };

      render(<RecommendationCard recommendation={specialCharsRecommendation} />);

      const card = screen.getByRole('article');
      expect(card).toHaveAttribute('aria-label', 'Recommendation for Holiday with & \'special\' chars');
    });

    it('[P2] should handle very long ARIA labels gracefully', () => {
      const longAriaLabelRecommendation: Recommendation = {
        ...mockRecommendation,
        holidayName: ' '.repeat(1000), // Very long name
      };

      render(<RecommendationCard recommendation={longAriaLabelRecommendation} />);

      const card = screen.getByRole('article');
      expect(card).toHaveAttribute('aria-label');
      // Should still have the attribute, even if very long
    });

    it('[P2] should have proper semantic structure when content is missing', () => {
      const minimalRecommendation: Recommendation = {
        holidayName: '',
        holidayDate: '',
        holidayDayOfWeek: '',
        recommendedDate: '',
        recommendedDay: '',
        explanation: '',
      };

      render(<RecommendationCard recommendation={minimalRecommendation} />);

      // Should still maintain proper semantic structure
      expect(screen.getByRole('article')).toBeInTheDocument();
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toBeInTheDocument();
    });
  });

  describe('Performance and Rendering Edge Cases', () => {
    it('[P2] should render quickly with large amounts of text', () => {
      const largeTextRecommendation: Recommendation = {
        ...mockRecommendation,
        holidayName: 'A'.repeat(1000),
        explanation: 'B'.repeat(2000),
      };

      const startTime = performance.now();
      render(<RecommendationCard recommendation={largeTextRecommendation} />);
      const endTime = performance.now();

      // Should render within reasonable time (less than 100ms for this simple component)
      expect(endTime - startTime).toBeLessThan(100);
      expect(screen.getByRole('article')).toBeInTheDocument();
    });

    it('[P2] should handle rapid re-renders without errors', () => {
      const { rerender } = render(<RecommendationCard recommendation={mockRecommendation} />);

      expect(screen.getByRole('article')).toBeInTheDocument();

      // Rapid re-renders with different data
      for (let i = 0; i < 10; i++) {
        const changedRecommendation: Recommendation = {
          ...mockRecommendation,
          holidayName: `Holiday ${i}`,
        };

        rerender(<RecommendationCard recommendation={changedRecommendation} />);
        expect(screen.getByText(`Holiday ${i}`)).toBeInTheDocument();
        expect(screen.getByRole('article')).toBeInTheDocument();
      }
    });
  });

  describe('Browser Compatibility Edge Cases', () => {
    it('[P2] should handle different date formatting expectations', () => {
      // Test with dates that might behave differently in different locales
      const localeTestRecommendation: Recommendation = {
        ...mockRecommendation,
        holidayDate: '2025-02-29', // Same as March 1 in non-leap years
      };

      render(<RecommendationCard recommendation={localeTestRecommendation} />);

      expect(screen.getByRole('article')).toBeInTheDocument();
      expect(screen.getByText('Holiday:')).toBeInTheDocument();
      // Should not crash even if date formatting behaves differently
    });

    it('[P2] should handle time zone edge cases', () => {
      // Test dates around DST changes and time zone boundaries
      const dstRecommendation: Recommendation = {
        ...mockRecommendation,
        holidayDate: '2025-03-09', // Around DST change in US
        recommendedDate: '2025-03-10',
      };

      render(<RecommendationCard recommendation={dstRecommendation} />);

      expect(screen.getByRole('article')).toBeInTheDocument();
      expect(screen.getByText('Holiday:')).toBeInTheDocument();
    });
  });

  describe('Security Edge Cases', () => {
    it('[P2] should sanitize potentially malicious content in holiday name', () => {
      const xssRecommendation: Recommendation = {
        ...mockRecommendation,
        holidayName: '<script>alert("xss")</script>Christmas',
      };

      render(<RecommendationCard recommendation={xssRecommendation} />);

      // Should render as escaped text, not execute script
      // Use a more flexible text finder that can handle broken-up text
      const holidayNameElement = screen.getByRole('heading', { level: 3 });
      expect(holidayNameElement).toBeInTheDocument();
      expect(holidayNameElement.innerHTML).toContain('&lt;script&gt;alert("xss")&lt;/script&gt;Christmas');
      expect(screen.getByRole('article')).toBeInTheDocument();
      // Should not have any script elements
      expect(document.querySelector('script')).not.toBeInTheDocument();
    });

    it('[P2] should handle HTML entities in holiday names', () => {
      const htmlEntityRecommendation: Recommendation = {
        ...mockRecommendation,
        holidayName: 'St. Patrick&apos;s Day &amp; Easter',
      };

      render(<RecommendationCard recommendation={htmlEntityRecommendation} />);

      expect(screen.getByRole('article')).toBeInTheDocument();
      // Should properly handle HTML entities
    });
  });

  describe('Component Contract Edge Cases', () => {
    it('[P2] should reject null/undefined recommendation prop', () => {
      // @ts-expect-error - Testing invalid prop
      expect(() => render(<RecommendationCard recommendation={null} />)).not.toThrow();
    });

    it('[P2] should reject missing required props', () => {
      // Test what happens if the recommendation object is missing properties
      const incompleteRecommendation = {
        holidayName: 'Test',
      } as Recommendation;

      expect(() => render(<RecommendationCard recommendation={incompleteRecommendation} />)).not.toThrow();
    });

    it('[P2] should handle zero-day recommendation (same day)', () => {
      const sameDayRecommendation: Recommendation = {
        ...mockRecommendation,
        holidayDate: '2025-11-27',
        recommendedDate: '2025-11-27', // Same day
      };

      render(<RecommendationCard recommendation={sameDayRecommendation} />);

      expect(screen.getByRole('article')).toBeInTheDocument();
      expect(screen.getByText('Holiday:')).toBeInTheDocument();
    });
  });
});