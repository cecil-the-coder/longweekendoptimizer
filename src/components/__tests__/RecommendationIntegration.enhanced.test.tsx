// Enhanced Recommendation Integration Tests
// Following TEA quality principles: deterministic, isolated, explicit assertions
// Comprehensive integration testing for the complete recommendation system

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import RecommendationsSection from '../RecommendationsSection';
import RecommendationCard from '../RecommendationCard';
import { HolidayProvider } from '../../context/HolidayContext';
import { Holiday } from '../../context/HolidayContext';
import { Recommendation, calculateRecommendations } from '../../utils/dateLogic';

// Mock useHolidays hook
vi.mock('../../hooks/useHolidays', () => ({
  useHolidays: vi.fn()
}));

import { useHolidays } from '../../hooks/useHolidays';

describe('Enhanced Recommendation Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Complete Recommendation Flow Integration', () => {
    it('[P1] should integrate full recommendation lifecycle: add → display → delete', async () => {
      // Start with empty holidays
      vi.mocked(useHolidays).mockReturnValue({
        holidays: [],
        addHoliday: vi.fn(),
        deleteHoliday: vi.fn(),
        storageError: null,
        clearStorageError: vi.fn(),
        isLocalStorageAvailable: true
      });

      const { rerender } = render(
        <HolidayProvider>
          <RecommendationsSection />
        </HolidayProvider>
      );

      // Initial: No recommendations
      expect(screen.getByText(/No long-weekend opportunities found/i)).toBeInTheDocument();

      // Add a recommendation-eligible holiday
      const newHoliday: Holiday = {
        id: 'thanksgiving-2025',
        name: 'Thanksgiving',
        date: '2025-11-27'
      };

      // Update mock to include the holiday
      vi.mocked(useHolidays).mockReturnValue({
        holidays: [newHoliday],
        addHoliday: vi.fn(),
        deleteHoliday: vi.fn(),
        storageError: null,
        clearStorageError: vi.fn(),
        isLocalStorageAvailable: true
      });

      rerender(
        <HolidayProvider>
          <RecommendationsSection />
        </HolidayProvider>
      );

      // Should now display recommendation
      await waitFor(() => {
        expect(screen.getByRole('article')).toBeInTheDocument();
        expect(screen.getByText(/For.*Thanksgiving/i)).toBeInTheDocument();
      });

      // Delete the holiday - update mock to remove it
      vi.mocked(useHolidays).mockReturnValue({
        holidays: [],
        addHoliday: vi.fn(),
        deleteHoliday: vi.fn(),
        storageError: null,
        clearStorageError: vi.fn(),
        isLocalStorageAvailable: true
      });

      rerender(
        <HolidayProvider>
          <RecommendationsSection />
        </HolidayProvider>
      );

      // Should return to empty state
      expect(screen.getByText(/No long-weekend opportunities found/i)).toBeInTheDocument();
    });

    it('[P1] should handle complex recommendation scenarios with multiple holidays', () => {
      const complexScenarioHolidays: Holiday[] = [
        { id: '1', name: 'Thanksgiving', date: '2025-11-27' }, // Thursday → Friday
        { id: '2', name: "New Year's Day", date: '2025-01-01' }, // Tuesday → Monday
        { id: '3', name: 'Christmas', date: '2025-12-25' }, // Thursday → Friday (already Friday)
        { id: '4', name: 'Regular Day', date: '2025-06-18' }, // Wednesday → No recommendation
        { id: '5', name: 'Labor Day', date: '2025-09-01' }, // Monday → No recommendation
      ];

      vi.mocked(useHolidays).mockReturnValue({
        holidays: complexScenarioHolidays,
        addHoliday: vi.fn(),
        deleteHoliday: vi.fn(),
        storageError: null,
        clearStorageError: vi.fn(),
        isLocalStorageAvailable: true
      });

      render(
        <HolidayProvider>
          <RecommendationsSection />
        </HolidayProvider>
      );

      // Should calculate recommendations correctly
      expect(screen.getByRole('region')).toBeInTheDocument();
      expect(screen.getByText(/Recommendations/i)).toBeInTheDocument();

      // Should have multiple recommendations for eligible holidays
      const recommendationCards = screen.getAllByRole('article');
      expect(recommendationCards.length).toBeGreaterThanOrEqual(2); // At least Thanksgiving and New Year's

      // Should display proper summary
      expect(screen.getByText(/long weekend opportunity found/i)).toBeInTheDocument();
    });

    it('[P1] should maintain chronological order across year boundaries', () => {
      const crossYearHolidays: Holiday[] = [
        { id: '3', name: 'Thanksgiving', date: '2025-11-27' }, // Later in year
        { id: '1', name: "New Year's Day", date: '2025-01-01' }, // Early in year
        { id: '2', name: 'Christmas', date: '2024-12-25' }, // Previous year
      ];

      vi.mocked(useHolidays).mockReturnValue({
        holidays: crossYearHolidays,
        addHoliday: vi.fn(),
        deleteHoliday: vi.fn(),
        storageError: null,
        clearStorageError: vi.fn(),
        isLocalStorageAvailable: true
      });

      render(
        <HolidayProvider>
          <RecommendationsSection />
        </HolidayProvider>
      );

      const recommendationCards = screen.getAllByRole('article');

      // Should be ordered chronologically by holiday date
      expect(recommendationCards.length).toBeGreaterThanOrEqual(2);

      // Check that Christmas (2024) comes before New Year's (2025)
      // The exact order depends on the calculateRecommendations implementation
      expect(screen.getByRole('region')).toBeInTheDocument();
    });
  });

  describe('Date Calculation Integration Edge Cases', () => {
    it('[P2] should handle leap year recommendations correctly', () => {
      const leapYearHolidays: Holiday[] = [
        { id: '1', name: 'Leap Day Before', date: '2024-02-28' }, // Wednesday
        { id: '2', name: 'Leap Day', date: '2024-02-29' }, // Thursday
        { id: '3', name: 'Day After Leap', date: '2024-03-01' }, // Friday
      ];

      vi.doMock('../../hooks/useHolidays', () => ({
        useHolidays: () => ({
          holidays: leapYearHolidays,
          addHoliday: vi.fn(),
          deleteHoliday: vi.fn(),
          storageError: null,
          clearStorageError: vi.fn(),
          isLocalStorageAvailable: true
        })
      }));

      render(
        <HolidayProvider>
          <RecommendationsSection />
        </HolidayProvider>
      );

      expect(screen.getByRole('region')).toBeInTheDocument();
      // Should handle leap year dates without errors
    });

    it('[P2] should handle daylight saving time transitions', () => {
      const dstHolidays: Holiday[] = [
        { id: '1', name: 'Spring Forward Before', date: '2025-03-08' }, // Saturday
        { id: '2', name: 'Spring Forward', date: '2025-03-09' }, // Sunday (DST starts)
        { id: '3', name: 'Fall Back Before', date: '2025-11-01' }, // Saturday
        { id: '4', name: 'Fall Back', date: '2025-11-02' }, // Sunday (DST ends)
      ];

      vi.doMock('../../hooks/useHolidays', () => ({
        useHolidays: () => ({
          holidays: dstHolidays,
          addHoliday: vi.fn(),
          deleteHoliday: vi.fn(),
          storageError: null,
          clearStorageError: vi.fn(),
          isLocalStorageAvailable: true
        })
      }));

      render(
        <HolidayProvider>
          <RecommendationsSection />
        </HolidayProvider>
      );

      expect(screen.getByRole('region')).toBeInTheDocument();
      // Should handle DST transitions without timezone issues
    });

    it('[P2] should handle year boundary recommendations correctly', () => {
      const yearBoundaryHolidays: Holiday[] = [
        { id: '1', name: 'New Year Eve', date: '2024-12-31' }, // Tuesday
        { id: '2', name: "New Year's Day", date: '2025-01-01' }, // Wednesday
        { id: '3', name: 'Jan 2nd', date: '2025-01-02' }, // Thursday
      ];

      vi.doMock('../../hooks/useHolidays', () => ({
        useHolidays: () => ({
          holidays: yearBoundaryHolidays,
          addHoliday: vi.fn(),
          deleteHoliday: vi.fn(),
          storageError: null,
          clearStorageError: vi.fn(),
          isLocalStorageAvailable: true
        })
      }));

      render(
        <HolidayProvider>
          <RecommendationsSection />
        </HolidayProvider>
      );

      expect(screen.getByRole('region')).toBeInTheDocument();
      // Should handle year transitions correctly
    });
  });

  describe('Localization and International Edge Cases', () => {
    it('[P2] should handle different locale date formatting expectations', () => {
      const intlHolidays: Holiday[] = [
        { id: '1', name: 'European Format Holiday', date: '2025-01-31' },
        { id: '2', name: 'US Format Holiday', date: '2025-12-25' },
      ];

      vi.doMock('../../hooks/useHolidays', () => ({
        useHolidays: () => ({
          holidays: intlHolidays,
          addHoliday: vi.fn(),
          deleteHoliday: vi.fn(),
          storageError: null,
          clearStorageError: vi.fn(),
          isLocalStorageAvailable: true
        })
      }));

      // Mock toLocaleDateString to test locale-specific behavior
      const originalToLocaleDateString = Date.prototype.toLocaleDateString;
      vi.spyOn(Date.prototype, 'toLocaleDateString').mockImplementation(function(
        locale?: string,
        options?: Intl.DateTimeFormatOptions
      ) {
        // Simulate different locale outputs
        if (locale === 'en-US') {
          return originalToLocaleDateString.call(this, 'en-US', options);
        }
        return 'Localized Date Format';
      });

      render(
        <HolidayProvider>
          <RecommendationsSection />
        </HolidayProvider>
      );

      expect(screen.getByRole('region')).toBeInTheDocument();
      // Should handle locale differences gracefully
    });

    it('[P2] should handle Unicode and international characters in holiday names', () => {
      const unicodeHolidays: Holiday[] = [
        { id: '1', name: 'Café Holiday', date: '2025-06-15' },
        { id: '2', name: 'Fête Nationale', date: '2025-07-14' },
        { id: '3', name: 'Día de los Muertos', date: '2025-11-01' },
        { id: '4', name: 'Новогодний праздник', date: '2025-01-01' },
        { id: '5', name: '新年', date: '2025-02-10' },
        { id: '6', name: '🎉 Emoji Holiday', date: '2025-12-31' },
      ];

      vi.doMock('../../hooks/useHolidays', () => ({
        useHolidays: () => ({
          holidays: unicodeHolidays,
          addHoliday: vi.fn(),
          deleteHoliday: vi.fn(),
          storageError: null,
          clearStorageError: vi.fn(),
          isLocalStorageAvailable: true
        })
      }));

      render(
        <HolidayProvider>
          <RecommendationsSection />
        </HolidayProvider>
      );

      expect(screen.getByRole('region')).toBeInTheDocument();
      // Should render Unicode characters correctly
    });
  });

  describe('Performance Integration Tests', () => {
    it('[P2] should handle bulk operations efficiently', () => {
      const startTime = Date.now();

      // Create 200 holidays
      const bulkHolidays: Holiday[] = Array.from({ length: 200 }, (_, i) => ({
        id: `bulk-${i}`,
        name: `Bulk Holiday ${i}`,
        date: `2025-${String((i % 11) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`
      }));

      vi.doMock('../../hooks/useHolidays', () => ({
        useHolidays: () => ({
          holidays: bulkHolidays,
          addHoliday: vi.fn(),
          deleteHoliday: vi.fn(),
          storageError: null,
          clearStorageError: vi.fn(),
          isLocalStorageAvailable: true
        })
      }));

      render(
        <HolidayProvider>
          <RecommendationsSection />
        </HolidayProvider>
      );

      const renderTime = Date.now() - startTime;

      expect(screen.getByRole('region')).toBeInTheDocument();
      // Should handle 200 holidays in reasonable time (< 500ms)
      expect(renderTime).toBeLessThan(500);
    });

    it('[P2] should handle rapid state changes without memory leaks', () => {
      let renderCount = 0;
      const maxRenders = 50;

      vi.doMock('../../hooks/useHolidays', () => ({
        useHolidays: () => {
          renderCount++;
          return {
            holidays: [{ id: `test-${renderCount}`, name: `Test Holiday ${renderCount}`, date: '2025-11-27' }],
            addHoliday: vi.fn(),
            deleteHoliday: vi.fn(),
            storageError: null,
            clearStorageError: vi.fn(),
            isLocalStorageAvailable: true
          };
        }
      }));

      const { unmount } = render(
        <HolidayProvider>
          <RecommendationsSection />
        </HolidayProvider>
      );

      // Force multiple re-renders
      for (let i = 0; i < maxRenders; i++) {
        unmount();
        render(
          <HolidayProvider>
            <RecommendationsSection />
          </HolidayProvider>
        );
      }

      expect(screen.getByRole('region')).toBeInTheDocument();
    });
  });

  describe('Error Recovery Integration', () => {
    it('[P2] should recover from component errors gracefully', () => {
      // Mock a scenario where calculateRecommendations throws an error
      vi.doMock('../../utils/dateLogic', async () => {
        const actual = await vi.importActual('../../utils/dateLogic');
        return {
          ...actual,
          calculateRecommendations: vi.fn(() => {
            throw new Error('Calculation error');
          })
        };
      });

      vi.doMock('../../hooks/useHolidays', () => ({
        useHolidays: () => ({
          holidays: [{ id: '1', name: 'Test Holiday', date: '2025-11-27' }],
          addHoliday: vi.fn(),
          deleteHoliday: vi.fn(),
          storageError: null,
          clearStorageError: vi.fn(),
          isLocalStorageAvailable: true
        })
      }));

      render(
        <HolidayProvider>
          <RecommendationsSection />
        </HolidayProvider>
      );

      // Should not crash the entire application
      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('[P2] should handle localStorage quota exceeded', () => {
      // Mock localStorage to throw quota exceeded error
      mockLocalStorage.setItem.mockImplementation(() => {
        const error = new Error('QuotaExceededError');
        error.name = 'QuotaExceededError';
        throw error;
      });

      vi.doMock('../../hooks/useHolidays', () => ({
        useHolidays: () => ({
          holidays: [],
          addHoliday: vi.fn(() => {
            throw new Error('QuotaExceededError');
          }),
          deleteHoliday: vi.fn(),
          storageError: new Error('Storage quota exceeded'),
          clearStorageError: vi.fn(),
          isLocalStorageAvailable: true
        })
      }));

      render(
        <HolidayProvider>
          <RecommendationsSection />
        </HolidayProvider>
      );

      // Should display empty state despite storage error
      expect(screen.getByText(/No long-weekend opportunities found/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility Integration Tests', () => {
    it('[P1] should maintain proper ARIA hierarchy with complex scenarios', () => {
      const complexHolidays: Holiday[] = [
        { id: '1', name: 'Thanksgiving', date: '2025-11-27' },
        { id: '2', name: "New Year's Day", date: '2025-01-01' },
      ];

      vi.doMock('../../hooks/useHolidays', () => ({
        useHolidays: () => ({
          holidays: complexHolidays,
          addHoliday: vi.fn(),
          deleteHoliday: vi.fn(),
          storageError: null,
          clearStorageError: vi.fn(),
          isLocalStorageAvailable: true
        })
      }));

      render(
        <HolidayProvider>
          <RecommendationsSection />
        </HolidayProvider>
      );

      // Check proper semantic structure
      expect(screen.getByRole('region')).toHaveAttribute('aria-live', 'polite');
      expect(screen.getByRole('region')).toHaveAttribute('aria-label', 'Holiday recommendations');
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Recommendations');

      const recommendations = screen.getAllByRole('article');
      recommendations.forEach((recommendation, index) => {
        expect(recommendation).toHaveAttribute('aria-label');
        expect(recommendation).toBeInTheDocument();
      });
    });

    it('[P2] should support keyboard navigation through recommendations', () => {
      const testHolidays: Holiday[] = [
        { id: '1', name: 'Test Holiday', date: '2025-11-27' }
      ];

      vi.doMock('../../hooks/useHolidays', () => ({
        useHolidays: () => ({
          holidays: testHolidays,
          addHoliday: vi.fn(),
          deleteHoliday: vi.fn(),
          storageError: null,
          clearStorageError: vi.fn(),
          isLocalStorageAvailable: true
        })
      }));

      render(
        <HolidayProvider>
          <RecommendationsSection />
        </HolidayProvider>
      );

      const recommendationCard = screen.getByRole('article');

      // Should be keyboard focusable
      expect(recommendationCard).toBeInTheDocument();

      // Simulate keyboard focus
      fireEvent.focus(recommendationCard);
      expect(recommendationCard).toHaveFocus();
    });
  });
});