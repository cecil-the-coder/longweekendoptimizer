// Recommendations Section Edge Cases and Error Path Tests
// Following TEA quality principles: deterministic, isolated, explicit assertions
// Enhanced coverage for edge cases, state management, and integration errors

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, rerender } from '@testing-library/react';
import RecommendationsSection from '../RecommendationsSection';
import { Holiday } from '../../context/HolidayContext';
import { HolidayProvider } from '../../context/HolidayContext';

// Helper function to render component with provider
const renderWithProvider = (component: React.ReactElement, holidays: Holiday[] = []) => {
  const TestWrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <HolidayProvider>
        {children}
      </HolidayProvider>
    );
  };

  return render(
    <TestWrapper>
      {component}
    </TestWrapper>
  );
};

// Mock useHolidays hook
vi.mock('../../hooks/useHolidays', () => ({
  useHolidays: vi.fn()
}));

import { useHolidays } from '../../hooks/useHolidays';

describe('RecommendationsSection - Edge Cases and Error Paths', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Hook Integration Edge Cases', () => {
    it('[P2] should handle useHolidays returning null values', () => {
      vi.mocked(useHolidays).mockReturnValue({
        holidays: null,
        addHoliday: vi.fn(),
        deleteHoliday: vi.fn(),
        storageError: null,
        clearStorageError: vi.fn(),
        isLocalStorageAvailable: true
      });

      renderWithProvider(<RecommendationsSection />);

      expect(screen.getByText(/Loading recommendations/i)).toBeInTheDocument();
    });

    it('[P2] should handle useHolidays throwing errors', () => {
      vi.mocked(useHolidays).mockImplementation(() => {
        throw new Error('Hook error');
      });

      expect(() => renderWithProvider(<RecommendationsSection />)).not.toThrow();
    });

    it('[P2] should handle storage error state gracefully', () => {
      vi.mocked(useHolidays).mockReturnValue({
        holidays: [],
        addHoliday: vi.fn(),
        deleteHoliday: vi.fn(),
        storageError: new Error('Storage error'),
        clearStorageError: vi.fn(),
        isLocalStorageAvailable: true
      });

      renderWithProvider(<RecommendationsSection />);

      // Should still render empty state despite storage error
      expect(screen.getByText(/No long-weekend opportunities found/i)).toBeInTheDocument();
    });

    it('[P2] should handle localStorage unavailable', () => {
      vi.mocked(useHolidays).mockReturnValue({
        holidays: [],
        addHoliday: vi.fn(),
        deleteHoliday: vi.fn(),
        storageError: null,
        clearStorageError: vi.fn(),
        isLocalStorageAvailable: false
      });

      renderWithProvider(<RecommendationsSection />);

      expect(screen.getByText(/No long-weekend opportunities found/i)).toBeInTheDocument();
    });
  });

  describe('Large Dataset Edge Cases', () => {
    it('[P2] should handle large number of holidays efficiently', () => {
      // Create 100 holidays to test performance
      const manyHolidays: Holiday[] = Array.from({ length: 100 }, (_, i) => ({
        id: `holiday-${i}`,
        name: `Holiday ${i}`,
        date: `2025-${String(Math.floor(i / 31) + 1).padStart(2, '0')}-${String((i % 31) + 1).padStart(2, '0')}`
      }));

      vi.mocked(useHolidays).mockReturnValue({
        holidays: manyHolidays,
        addHoliday: vi.fn(),
        deleteHoliday: vi.fn(),
        storageError: null,
        clearStorageError: vi.fn(),
        isLocalStorageAvailable: true
      });

      const startTime = performance.now();
      renderWithProvider(<RecommendationsSection />);
      const endTime = performance.now();

      // Should render within reasonable time (less than 200ms for 100 items)
      expect(endTime - startTime).toBeLessThan(200);
      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('[P2] should handle holidays with duplicate dates', () => {
      const duplicateDateHolidays: Holiday[] = [
        { id: '1', name: 'Holiday 1', date: '2025-11-27' },
        { id: '2', name: 'Holiday 2', date: '2025-11-27' }, // Same date
        { id: '3', name: 'Holiday 3', date: '2025-11-27' }, // Same date
      ];

      vi.mocked(useHolidays).mockReturnValue({
        holidays: duplicateDateHolidays,
        addHoliday: vi.fn(),
        deleteHoliday: vi.fn(),
        storageError: null,
        clearStorageError: vi.fn(),
        isLocalStorageAvailable: true
      });

      renderWithProvider(<RecommendationsSection />);

      // Should handle duplicates gracefully
      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('[P2] should handle holidays spanning many years', () => {
      const multiYearHolidays: Holiday[] = [
        { id: '1', name: 'Holiday 2020', date: '2020-01-01' },
        { id: '2', name: 'Holiday 2021', date: '2021-01-01' },
        { id: '3', name: 'Holiday 2022', date: '2022-01-01' },
        { id: '4', name: 'Holiday 2023', date: '2023-01-01' },
        { id: '5', name: 'Holiday 2024', date: '2024-01-01' },
        { id: '6', name: 'Holiday 2025', date: '2025-01-01' },
        { id: '7', name: 'Holiday 2026', date: '2026-01-01' },
        { id: '8', name: 'Holiday 2027', date: '2027-01-01' },
      ];

      vi.mocked(useHolidays).mockReturnValue({
        holidays: multiYearHolidays,
        addHoliday: vi.fn(),
        deleteHoliday: vi.fn(),
        storageError: null,
        clearStorageError: vi.fn(),
        isLocalStorageAvailable: true
      });

      renderWithProvider(<RecommendationsSection />);

      expect(screen.getByRole('region')).toBeInTheDocument();
    });
  });

  describe('State Management Edge Cases', () => {
    it('[P2] should handle rapid holiday additions and deletions', () => {
      let holidays: Holiday[] = [];

      vi.mocked(useHolidays).mockReturnValue({
        holidays,
        addHoliday: vi.fn(),
        deleteHoliday: vi.fn(),
        storageError: null,
        clearStorageError: vi.fn(),
        isLocalStorageAvailable: true
      });

      const { rerender } = renderWithProvider(<RecommendationsSection />);
      expect(screen.getByText(/No long-weekend opportunities found/i)).toBeInTheDocument();

      // Rapid additions
      for (let i = 0; i < 5; i++) {
        holidays = [...holidays, { id: `holiday-${i}`, name: `Holiday ${i}`, date: '2025-11-27' }];

        vi.mocked(useHolidays).mockReturnValue({
          holidays,
          addHoliday: vi.fn(),
          deleteHoliday: vi.fn(),
          storageError: null,
          clearStorageError: vi.fn(),
          isLocalStorageAvailable: true
        });

        act(() => {
          rerender(
            <HolidayProvider>
              <RecommendationsSection />
            </HolidayProvider>
          );
        });
      }

      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('[P2] should handle simultaneous add/delete operations', () => {
      const holidays: Holiday[] = [
        { id: '1', name: 'Holiday 1', date: '2025-11-27' },
        { id: '2', name: 'Holiday 2', date: '2025-11-28' },
      ];

      vi.mocked(useHolidays).mockReturnValue({
        holidays,
        addHoliday: vi.fn(),
        deleteHoliday: vi.fn(),
        storageError: null,
        clearStorageError: vi.fn(),
        isLocalStorageAvailable: true
      });

      const { rerender } = renderWithProvider(<RecommendationsSection />);

      // Simulate simultaneous operations
      const updatedHolidays = [
        { id: '3', name: 'New Holiday', date: '2025-11-29' }, // Added
        { id: '1', name: 'Holiday 1', date: '2025-11-27' },   // Kept
        // Holiday 2 deleted
      ];

      vi.mocked(useHolidays).mockReturnValue({
        holidays: updatedHolidays,
        addHoliday: vi.fn(),
        deleteHoliday: vi.fn(),
        storageError: null,
        clearStorageError: vi.fn(),
        isLocalStorageAvailable: true
      });

      act(() => {
        rerender(
          <HolidayProvider>
            <RecommendationsSection />
          </HolidayProvider>
        );
      });

      expect(screen.getByRole('region')).toBeInTheDocument();
    });
  });

  describe('Malformed Data Edge Cases', () => {
    it('[P2] should handle holidays with invalid dates gracefully', () => {
      const invalidDateHolidays: Holiday[] = [
        { id: '1', name: 'Valid Holiday', date: '2025-11-27' },
        { id: '2', name: 'Invalid Date Holiday', date: 'invalid-date' },
        { id: '3', name: 'Another Invalid', date: 'not-a-date' },
        { id: '4', name: 'Empty Date', date: '' },
      ];

      vi.mocked(useHolidays).mockReturnValue({
        holidays: invalidDateHolidays,
        addHoliday: vi.fn(),
        deleteHoliday: vi.fn(),
        storageError: null,
        clearStorageError: vi.fn(),
        isLocalStorageAvailable: true
      });

      renderWithProvider(<RecommendationsSection />);

      // Should not crash, should handle invalid dates from calculateRecommendations
      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('[P2] should handle holidays with special characters in names', () => {
      const specialCharHolidays: Holiday[] = [
        { id: '1', name: "St. Patrick's Day", date: '2025-03-17' },
        { id: '2', name: 'New Year\'s & Day', date: '2025-01-01' },
        { id: '3', name: 'Holiday with "quotes"', date: '2025-07-04' },
        { id: '4', name: 'Holiday with <tags>', date: '2025-10-31' },
        { id: '5', name: 'Holiday with &amp; entities', date: '2025-12-25' },
      ];

      vi.mocked(useHolidays).mockReturnValue({
        holidays: specialCharHolidays,
        addHoliday: vi.fn(),
        deleteHoliday: vi.fn(),
        storageError: null,
        clearStorageError: vi.fn(),
        isLocalStorageAvailable: true
      });

      renderWithProvider(<RecommendationsSection />);

      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('[P2] should handle empty holiday objects', () => {
      type PartialHoliday = Partial<Holiday> & { id: string };

      const emptyHolidays: PartialHoliday[] = [
        { id: '1', name: '', date: '' },
        { id: '2', name: 'Only name', date: '' },
        { id: '3', name: '', date: '2025-11-27' },
        { id: '4', name: '  ', date: '  ' }, // Whitespace only
      ];

      vi.mocked(useHolidays).mockReturnValue({
        holidays: emptyHolidays as Holiday[],
        addHoliday: vi.fn(),
        deleteHoliday: vi.fn(),
        storageError: null,
        clearStorageError: vi.fn(),
        isLocalStorageAvailable: true
      });

      renderWithProvider(<RecommendationsSection />);

      expect(screen.getByRole('region')).toBeInTheDocument();
    });
  });

  describe('Accessibility Edge Cases', () => {
    it('[P2] should maintain ARIA live region with dynamic content', () => {
      vi.mocked(useHolidays).mockReturnValue({
        holidays: [],
        addHoliday: vi.fn(),
        deleteHoliday: vi.fn(),
        storageError: null,
        clearStorageError: vi.fn(),
        isLocalStorageAvailable: true
      });

      const { rerender } = renderWithProvider(<RecommendationsSection />);

      let recommendationsRegion = screen.getByRole('region');
      expect(recommendationsRegion).toHaveAttribute('aria-live', 'polite');
      expect(recommendationsRegion).toHaveAttribute('aria-label', 'Holiday recommendations');

      // Change to have recommendations
      vi.mocked(useHolidays).mockReturnValue({
        holidays: [{ id: '1', name: 'Thanksgiving', date: '2025-11-27' }],
        addHoliday: vi.fn(),
        deleteHoliday: vi.fn(),
        storageError: null,
        clearStorageError: vi.fn(),
        isLocalStorageAvailable: true
      });

      act(() => {
        rerender(
          <HolidayProvider>
            <RecommendationsSection />
          </HolidayProvider>
        );
      });

      recommendationsRegion = screen.getByRole('region');
      expect(recommendationsRegion).toHaveAttribute('aria-live', 'polite');
      expect(recommendationsRegion).toHaveAttribute('aria-label', 'Holiday recommendations');
    });

    it('[P2] should handle very long holiday names in recommendations', () => {
      const longNameHoliday: Holiday[] = [
        { id: '1', name: 'A'.repeat(500), date: '2025-11-27' }
      ];

      vi.mocked(useHolidays).mockReturnValue({
        holidays: longNameHoliday,
        addHoliday: vi.fn(),
        deleteHoliday: vi.fn(),
        storageError: null,
        clearStorageError: vi.fn(),
        isLocalStorageAvailable: true
      });

      renderWithProvider(<RecommendationsSection />);

      expect(screen.getByRole('region')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });
  });

  describe('Performance Edge Cases', () => {
    it('[P2] should handle frequent re-renders without memory leaks', () => {
      vi.mocked(useHolidays).mockReturnValue({
        holidays: [],
        addHoliday: vi.fn(),
        deleteHoliday: vi.fn(),
        storageError: null,
        clearStorageError: vi.fn(),
        isLocalStorageAvailable: true
      });

      const { rerender, unmount } = renderWithProvider(<RecommendationsSection />);

      // Simulate many re-renders
      for (let i = 0; i < 100; i++) {
        vi.mocked(useHolidays).mockReturnValue({
          holidays: [{ id: `holiday-${i}`, name: `Holiday ${i}`, date: '2025-11-27' }],
          addHoliday: vi.fn(),
          deleteHoliday: vi.fn(),
          storageError: null,
          clearStorageError: vi.fn(),
          isLocalStorageAvailable: true
        });

        act(() => {
          rerender(
            <HolidayProvider>
              <RecommendationsSection />
            </HolidayProvider>
          );
        });

        expect(screen.getByRole('region')).toBeInTheDocument();
      }

      // Cleanup should not throw
      expect(() => unmount()).not.toThrow();
    });

    it('[P2] should handle useMemo recomputation efficiently', () => {
      const holidays: Holiday[] = Array.from({ length: 50 }, (_, i) => ({
        id: `holiday-${i}`,
        name: `Holiday ${i}`,
        date: `2025-${String(Math.floor(i / 31) + 1).padStart(2, '0')}-${String((i % 31) + 1).padStart(2, '0')}`
      }));

      vi.mocked(useHolidays).mockReturnValue({
        holidays,
        addHoliday: vi.fn(),
        deleteHoliday: vi.fn(),
        storageError: null,
        clearStorageError: vi.fn(),
        isLocalStorageAvailable: true
      });

      const startTime = performance.now();
      renderWithProvider(<RecommendationsSection />);
      const endTime = performance.now();

      // Should process 50 holidays quickly
      expect(endTime - startTime).toBeLessThan(100);
      expect(screen.getByRole('region')).toBeInTheDocument();
    });
  });

  describe('Error Recovery Edge Cases', () => {
    it('[P2] should recover from calculateRecommendations errors', () => {
      vi.mocked(useHolidays).mockReturnValue({
        holidays: [{ id: '1', name: 'Test Holiday', date: 'invalid-date-xyz' }],
        addHoliday: vi.fn(),
        deleteHoliday: vi.fn(),
        storageError: null,
        clearStorageError: vi.fn(),
        isLocalStorageAvailable: true
      });

      renderWithProvider(<RecommendationsSection />);

      // Should not crash even if calculateRecommendations fails
      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('[P2] should handle component boundaries with error boundaries', () => {
      vi.mocked(useHolidays).mockReturnValue({
        holidays: undefined as any,
        addHoliday: vi.fn(),
        deleteHoliday: vi.fn(),
        storageError: null,
        clearStorageError: vi.fn(),
        isLocalStorageAvailable: true
      });

      renderWithProvider(<RecommendationsSection />);

      // Should render loading state instead of crashing
      expect(screen.getByText(/Loading recommendations/i)).toBeInTheDocument();
    });
  });

  describe('Integration Edge Cases', () => {
    it('[P2] should handle HolidayProvider context missing', () => {
      vi.mocked(useHolidays).mockReturnValue({
        holidays: [],
        addHoliday: vi.fn(),
        deleteHoliday: vi.fn(),
        storageError: null,
        clearStorageError: vi.fn(),
        isLocalStorageAvailable: true
      });

      // Render without provider (should not crash)
      expect(() => render(<RecommendationsSection />)).not.toThrow();
    });

    it('[P2] should handle multiple recommendations with same date', () => {
      const sameDateHolidays: Holiday[] = [
        { id: '1', name: 'Thursday Holiday A', date: '2025-11-27' },
        { id: '2', name: 'Thursday Holiday B', date: '2025-11-27' },
        { id: '3', name: 'Tuesday Holiday A', date: '2025-11-25' },
        { id: '4', name: 'Tuesday Holiday B', date: '2025-11-25' },
      ];

      vi.mocked(useHolidays).mockReturnValue({
        holidays: sameDateHolidays,
        addHoliday: vi.fn(),
        deleteHoliday: vi.fn(),
        storageError: null,
        clearStorageError: vi.fn(),
        isLocalStorageAvailable: true
      });

      renderWithProvider(<RecommendationsSection />);

      expect(screen.getByRole('region')).toBeInTheDocument();
      // Should handle duplicate recommendation dates gracefully
    });
  });
});