// Recommendations Integration Tests
// Following testing requirements: Vitest + React Testing Library
// Testing integration between recommendations and the main application

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import RecommendationsSection from '../RecommendationsSection';
import { Holiday } from '../../context/HolidayContext';
import { HolidayProvider, useHolidays } from '../../context/HolidayContext';

// Mock localStorage API
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock crypto.randomUUID for consistent test results
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'test-id-12345')
  }
});

describe('Recommendations Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  describe('Complete Holiday-Recommendation Flow', () => {
    it('should show no recommendations when app starts with empty holidays', () => {
      render(
        <HolidayProvider>
          <RecommendationsSection />
        </HolidayProvider>
      );

      expect(screen.getByText(/No long-weekend opportunities found/i)).toBeInTheDocument();
    });

    it('should automatically show recommendations when holidays are persisted', async () => {
      // Set up initial holidays in localStorage
      const initialHolidays = [
        { id: 'test-1', name: 'Thanksgiving', date: '2025-11-27' },
        { id: 'test-2', name: "New Year's Day", date: '2025-01-01' }
      ];

      localStorageMock.setItem('holidays', JSON.stringify(initialHolidays));

      render(
        <HolidayProvider>
          <RecommendationsSection />
        </HolidayProvider>
      );

      // Wait for localStorage loading and recommendation calculation
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(screen.getByText(/Recommendations/i)).toBeInTheDocument();
      expect(screen.getByText(/2 long weekend opportunities found/i)).toBeInTheDocument();
      expect(screen.getByText(/For.*Thanksgiving/i)).toBeInTheDocument();
      expect(screen.getByText(/For.*New Year's Day/i)).toBeInTheDocument();
    });

    it('should handle mixed holiday types correctly', async () => {
      const mixedHolidays = [
        { id: 'test-1', name: 'Thanksgiving', date: '2025-11-27' }, // Thursday - should recommend Friday
        { id: 'test-2', name: "New Year's Day", date: '2025-01-01' }, // Tuesday - should recommend Monday
        { id: 'test-3', name: 'Regular Monday', date: '2025-09-01' }, // Monday - no recommendation
        { id: 'test-4', name: 'Friday Meeting', date: '2025-07-04' }, // Friday - no recommendation
        { id: 'test-5', name: 'Wednesday Break', date: '2025-08-20' } // Wednesday - no recommendation
      ];

      localStorageMock.setItem('holidays', JSON.stringify(mixedHolidays));

      render(
        <HolidayProvider>
          <RecommendationsSection />
        </HolidayProvider>
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(screen.getByText(/2 long weekend opportunities found/i)).toBeInTheDocument();

      // Should recommend Monday for Tuesday New Year's
      expect(screen.getByText(/For.*New Year's Day/i)).toBeInTheDocument();
      expect(screen.getByText(/Take off:/i)).toBeInTheDocument();
      expect(screen.getByText(/Monday, Dec 31, 2024/i)).toBeInTheDocument();

      // Should recommend Friday for Thursday Thanksgiving
      expect(screen.getByText(/For.*Thanksgiving/i)).toBeInTheDocument();
      expect(screen.getByText(/Friday, Nov 28, 2025/i)).toBeInTheDocument();
    });

    it('should not recommend day if it\'s already a holiday', async () => {
      const holidayPair = [
        { id: 'test-1', name: 'Thanksgiving', date: '2025-11-27' }, // Thursday
        { id: 'test-2', name: 'Day After Thanksgiving', date: '2025-11-28' } // Friday - already a holiday
      ];

      localStorageMock.setItem('holidays', JSON.stringify(holidayPair));

      render(
        <HolidayProvider>
          <RecommendationsSection />
        </HolidayProvider>
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Should show no recommendations because Friday is already a holiday
      expect(screen.getByText(/No long-weekend opportunities found/i)).toBeInTheDocument();
    });

    it('should handle edge case with malformed localStorage data', async () => {
      // Store invalid JSON in localStorage
      localStorageMock.setItem('holidays', 'invalid json');

      render(
        <HolidayProvider>
          <RecommendationsSection />
        </HolidayProvider>
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Should recover gracefully and show empty state
      expect(screen.getByText(/No long-weekend opportunities found/i)).toBeInTheDocument();
    });
  });

  describe('Real-time Updates', () => {
    it('should update recommendations when new holiday is added', async () => {
      // Start empty
      localStorageMock.setItem('holidays', JSON.stringify([]));

      const App = () => {
        const { addHoliday } = useHolidays();

        return (
          <div>
            <button onClick={() => addHoliday('Thanksgiving', '2025-11-27')}>
              Add Holiday
            </button>
            <RecommendationsSection />
          </div>
        );
      };

      render(
        <HolidayProvider>
          <App />
        </HolidayProvider>
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(screen.getByText(/No long-weekend opportunities found/i)).toBeInTheDocument();

      // Add a holiday
      fireEvent.click(screen.getByText('Add Holiday'));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(screen.getByText(/Recommendations/i)).toBeInTheDocument();
      expect(screen.getByText(/For.*Thanksgiving/i)).toBeInTheDocument();
    });

    it('should handle concurrent holiday additions', async () => {
      localStorageMock.setItem('holidays', JSON.stringify([]));

      const App = () => {
        const { addHoliday } = useHolidays();

        const addMultipleHolidays = () => {
          addHoliday('Tuesday Holiday', '2025-01-07');
          addHoliday('Thursday Holiday', '2025-11-13');
        };

        return (
          <div>
            <button onClick={addMultipleHolidays}>
              Add Multiple Holidays
            </button>
            <RecommendationsSection />
          </div>
        );
      };

      render(
        <HolidayProvider>
          <App />
        </HolidayProvider>
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(screen.getByText(/No long-weekend opportunities found/i)).toBeInTheDocument();

      // Add multiple holidays at once
      fireEvent.click(screen.getByText('Add Multiple Holidays'));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(screen.getByText(/2 long weekend opportunities found/i)).toBeInTheDocument();
    });
  });

  describe('Error Recovery', () => {
    it('should continue showing recommendations even if localStorage becomes unavailable', async () => {
      const holidays = [
        { id: 'test-1', name: 'Thanksgiving', date: '2025-11-27' }
      ];

      localStorageMock.setItem('holidays', JSON.stringify(holidays));

      render(
        <HolidayProvider>
          <RecommendationsSection />
        </HolidayProvider>
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(screen.getByText(/Recommendations/i)).toBeInTheDocument();

      // Simulate localStorage becoming unavailable
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: vi.fn(() => { throw new Error('localStorage disabled'); }),
          setItem: vi.fn(() => { throw new Error('localStorage disabled'); }),
          removeItem: vi.fn(() => { throw new Error('localStorage disabled'); }),
        }
      });

      // Recommendations should continue to work from in-memory data
      expect(screen.getByText(/Recommendations/i)).toBeInTheDocument();
      expect(screen.getByText(/For.*Thanksgiving/i)).toBeInTheDocument();
    });
  });

  describe('Performance and Optimization', () => {
    it('should handle large number of holidays efficiently', async () => {
      // Create 50+ holidays to test performance claim
      const manyHolidays: Holiday[] = [];
      for (let i = 0; i < 60; i++) {
        const date = new Date(2025, 0, i * 6 + 1); // Every 6 days
        manyHolidays.push({
          id: `holiday-${i}`,
          name: `Holiday ${i}`,
          date: date.toISOString().split('T')[0]
        });
      }

      localStorageMock.setItem('holidays', JSON.stringify(manyHolidays));

      const startTime = performance.now();

      render(
        <HolidayProvider>
          <RecommendationsSection />
        </HolidayProvider>
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within reasonable time (less than 100ms for 60 holidays)
      expect(renderTime).toBeLessThan(100);

      // Should still show recommendations
      expect(screen.getByText(/long weekend opportunities found/i)).toBeInTheDocument();
    });
  });
});