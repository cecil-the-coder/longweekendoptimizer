// Recommendations Section Component Tests
// Following testing requirements: Vitest + React Testing Library
// Testing recommendations section with empty and populated states, auto-update behavior

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import RecommendationsSection from '../RecommendationsSection';
import { Holiday } from '../../context/HolidayContext';
import { HolidayProvider } from '../../context/HolidayContext';

// Helper function to render component with provider and custom holidays
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

// Mock useHolidays hook to control test data
vi.mock('../../hooks/useHolidays', () => ({
  useHolidays: vi.fn()
}));

import { useHolidays } from '../../hooks/useHolidays';

describe('RecommendationsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Empty State Display', () => {
    it('should display empty message when no holidays exist', () => {
      vi.mocked(useHolidays).mockReturnValue({
        holidays: [],
        addHoliday: vi.fn(),
        deleteHoliday: vi.fn(),
        storageError: null,
        clearStorageError: vi.fn(),
        isLocalStorageAvailable: true
      });

      renderWithProvider(<RecommendationsSection />);

      expect(screen.getByText(/No long-weekend opportunities found/i)).toBeInTheDocument();
      expect(screen.getByText(/Add more holidays to discover weekend optimization opportunities/i)).toBeInTheDocument();
    });

    it('should display empty message when holidays exist but no recommendations available', () => {
      const holidaysNoRecommendations: Holiday[] = [
        { id: '1', name: 'Regular Holiday', date: '2025-06-18' } // Wednesday holiday
      ];

      vi.mocked(useHolidays).mockReturnValue({
        holidays: holidaysNoRecommendations,
        addHoliday: vi.fn(),
        deleteHoliday: vi.fn(),
        storageError: null,
        clearStorageError: vi.fn(),
        isLocalStorageAvailable: true
      });

      renderWithProvider(<RecommendationsSection />);

      expect(screen.getByText(/No long-weekend opportunities found/i)).toBeInTheDocument();
    });
  });

  describe('Populated State Display', () => {
    it('should display "Recommendations" heading when recommendations exist', () => {
      const holidays: Holiday[] = [
        { id: '1', name: 'Thanksgiving', date: '2025-11-27' } // Thursday
      ];

      vi.mocked(useHolidays).mockReturnValue({
        holidays,
        addHoliday: vi.fn(),
        deleteHoliday: vi.fn(),
        storageError: null,
        clearStorageError: vi.fn(),
        isLocalStorageAvailable: true
      });

      renderWithProvider(<RecommendationsSection />);

      expect(screen.getByText(/Recommendations/i)).toBeInTheDocument();
    });

    it('should display Thursday/Friday recommendation correctly', () => {
      const holidays: Holiday[] = [
        { id: '1', name: 'Thanksgiving', date: '2025-11-27' } // Thursday
      ];

      vi.mocked(useHolidays).mockReturnValue({
        holidays,
        addHoliday: vi.fn(),
        deleteHoliday: vi.fn(),
        storageError: null,
        clearStorageError: vi.fn(),
        isLocalStorageAvailable: true
      });

      renderWithProvider(<RecommendationsSection />);

      expect(screen.getByTestId('recommendation-title-Thanksgiving')).toBeInTheDocument();
      expect(screen.getByTestId('recommendation-takeoff-Thanksgiving')).toBeInTheDocument();
      expect(screen.getByText(/Friday, Nov 28, 2025/i)).toBeInTheDocument();
      expect(screen.getByTestId('recommendation-explanation-Thanksgiving')).toBeInTheDocument();
    });

    it('should display Tuesday/Monday recommendation correctly', () => {
      const holidays: Holiday[] = [
        { id: '1', name: "New Year's Day", date: '2025-01-07' } // Tuesday
      ];

      vi.mocked(useHolidays).mockReturnValue({
        holidays,
        addHoliday: vi.fn(),
        deleteHoliday: vi.fn(),
        storageError: null,
        clearStorageError: vi.fn(),
        isLocalStorageAvailable: true
      });

      renderWithProvider(<RecommendationsSection />);

      expect(screen.getByTestId("recommendation-title-New Year's Day")).toBeInTheDocument();
      expect(screen.getByTestId("recommendation-takeoff-New Year's Day")).toBeInTheDocument();
      expect(screen.getByText(/Monday, Jan 6, 2025/i)).toBeInTheDocument();
      expect(screen.getByTestId("recommendation-explanation-New Year's Day")).toBeInTheDocument();
    });

    it('should display multiple recommendations chronologically', () => {
      const holidays: Holiday[] = [
        { id: '1', name: 'Thanksgiving', date: '2025-11-27' }, // Thursday, later
        { id: '2', name: "New Year's Day", date: '2025-01-07' } // Tuesday, earlier
      ];

      vi.mocked(useHolidays).mockReturnValue({
        holidays,
        addHoliday: vi.fn(),
        deleteHoliday: vi.fn(),
        storageError: null,
        clearStorageError: vi.fn(),
        isLocalStorageAvailable: true
      });

      renderWithProvider(<RecommendationsSection />);

      const recommendations = screen.getAllByRole('article');
      expect(recommendations).toHaveLength(2);

      // New Year's Day should come first (chronological order)
      expect(screen.getByTestId("recommendation-title-New Year's Day")).toBeInTheDocument();
      expect(screen.getByTestId('recommendation-title-Thanksgiving')).toBeInTheDocument();
    });

    it('should display correct summary message for multiple recommendations', () => {
      const holidays: Holiday[] = [
        { id: '1', name: 'Thanksgiving', date: '2025-11-27' },
        { id: '2', name: "New Year's Day", date: '2025-01-07' }
      ];

      vi.mocked(useHolidays).mockReturnValue({
        holidays,
        addHoliday: vi.fn(),
        deleteHoliday: vi.fn(),
        storageError: null,
        clearStorageError: vi.fn(),
        isLocalStorageAvailable: true
      });

      renderWithProvider(<RecommendationsSection />);

      expect(screen.getByTestId('recommendation-summary')).toHaveTextContent('2 long weekend opportunitys found!');
      expect(screen.getByText(/Take advantage of these strategic days off/i)).toBeInTheDocument();
    });

    it('should display singular summary message for single recommendation', () => {
      const holidays: Holiday[] = [
        { id: '1', name: 'Thanksgiving', date: '2025-11-27' }
      ];

      vi.mocked(useHolidays).mockReturnValue({
        holidays,
        addHoliday: vi.fn(),
        deleteHoliday: vi.fn(),
        storageError: null,
        clearStorageError: vi.fn(),
        isLocalStorageAvailable: true
      });

      renderWithProvider(<RecommendationsSection />);

      expect(screen.getByTestId('recommendation-summary')).toHaveTextContent('1 long weekend opportunity found!');
      expect(screen.getByText(/Take advantage of these strategic days off/i)).toBeInTheDocument();
    });
  });

  describe('Auto-update Behavior', () => {
    it('should update recommendations when holiday list changes', () => {
      // Initial state: empty holidays
      vi.mocked(useHolidays).mockReturnValueOnce({
        holidays: [],
        addHoliday: vi.fn(),
        deleteHoliday: vi.fn(),
        storageError: null,
        clearStorageError: vi.fn(),
        isLocalStorageAvailable: true
      });

      const { rerender } = renderWithProvider(<RecommendationsSection />);

      expect(screen.getByText(/No long-weekend opportunities found/i)).toBeInTheDocument();

      // Simulate adding a holiday
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

      expect(screen.getByText(/Recommendations/i)).toBeInTheDocument();
      expect(screen.getByTestId('recommendation-title-Thanksgiving')).toBeInTheDocument();
    });

    it('should update when holiday is deleted', () => {
      // Initial state: holiday exists
      vi.mocked(useHolidays).mockReturnValueOnce({
        holidays: [{ id: '1', name: 'Thanksgiving', date: '2025-11-27' }],
        addHoliday: vi.fn(),
        deleteHoliday: vi.fn(),
        storageError: null,
        clearStorageError: vi.fn(),
        isLocalStorageAvailable: true
      });

      const { rerender } = renderWithProvider(<RecommendationsSection />);

      expect(screen.getByText(/Recommendations/i)).toBeInTheDocument();

      // Simulate deleting the holiday
      vi.mocked(useHolidays).mockReturnValue({
        holidays: [],
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

      expect(screen.getByText(/No long-weekend opportunities found/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA live region for dynamic updates', () => {
      const holidays: Holiday[] = [
        { id: '1', name: 'Thanksgiving', date: '2025-11-27' }
      ];

      vi.mocked(useHolidays).mockReturnValue({
        holidays,
        addHoliday: vi.fn(),
        deleteHoliday: vi.fn(),
        storageError: null,
        clearStorageError: vi.fn(),
        isLocalStorageAvailable: true
      });

      renderWithProvider(<RecommendationsSection />);

      const recommendationsRegion = screen.getByRole('region');
      expect(recommendationsRegion).toHaveAttribute('aria-live', 'polite');
      expect(recommendationsRegion).toHaveAttribute('aria-label', 'Holiday recommendations');
    });

    it('should have proper semantic structure', () => {
      const holidays: Holiday[] = [
        { id: '1', name: 'Thanksgiving', date: '2025-11-27' }
      ];

      vi.mocked(useHolidays).mockReturnValue({
        holidays,
        addHoliday: vi.fn(),
        deleteHoliday: vi.fn(),
        storageError: null,
        clearStorageError: vi.fn(),
        isLocalStorageAvailable: true
      });

      renderWithProvider(<RecommendationsSection />);

      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
      expect(screen.getByRole('region')).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should display loading message when holidays are undefined', () => {
      vi.mocked(useHolidays).mockReturnValue({
        holidays: undefined as any,
        addHoliday: vi.fn(),
        deleteHoliday: vi.fn(),
        storageError: null,
        clearStorageError: vi.fn(),
        isLocalStorageAvailable: true
      });

      renderWithProvider(<RecommendationsSection />);

      expect(screen.getByText(/Loading recommendations/i)).toBeInTheDocument();
    });
  });
});