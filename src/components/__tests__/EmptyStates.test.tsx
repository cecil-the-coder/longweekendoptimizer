// Empty State Handling Tests
// Following testing requirements: Vitest + React Testing Library
// Testing empty state messages, guidance, and first-time user experience

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HolidayList from '../HolidayList';
import RecommendationsSection from '../RecommendationsSection';
import { HolidayProvider } from '../../context/HolidayContext';

// Mock the useHolidays hook for empty state testing
const mockAddHoliday = vi.fn();
const mockDeleteHoliday = vi.fn();
const mockClearStorageError = vi.fn();
let mockHolidays: any[] = [];
let mockRecommendations: any[] = [];
let mockStorageError: any = null;
let mockIsLocalStorageAvailable = true;
let mockIsCalculating = false;

vi.mock('../../hooks/useHolidays', () => ({
  useHolidays: () => ({
    addHoliday: mockAddHoliday,
    deleteHoliday: mockDeleteHoliday,
    holidays: mockHolidays,
    recommendations: mockRecommendations,
    storageError: mockStorageError,
    clearStorageError: mockClearStorageError,
    isLocalStorageAvailable: mockIsLocalStorageAvailable,
    isCalculating: mockIsCalculating
  })
}));

vi.mock('../../hooks/useRecommendations', () => ({
  useRecommendations: () => ({
    recommendations: mockRecommendations,
    isCalculating: mockIsCalculating
  })
}));

// Helper function to render components with provider
const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <HolidayProvider>
      {component}
    </HolidayProvider>
  );
};

describe('Empty State Handling', () => {
  beforeEach(() => {
    mockAddHoliday.mockClear();
    mockDeleteHoliday.mockClear();
    mockClearStorageError.mockClear();
    mockHolidays = [];
    mockRecommendations = [];
    mockStorageError = null;
    mockIsLocalStorageAvailable = true;
    mockIsCalculating = false;
  });

  describe('Holiday List Empty State', () => {
    it('should display empty state when no holidays exist', () => {
      mockHolidays = []; // Empty holidays array

      renderWithProvider(<HolidayList />);

      // Should show empty state message
      expect(screen.getByTestId('empty-holidays-state')).toBeInTheDocument();
      expect(screen.getByText(/no holidays found/i)).toBeInTheDocument();
    });

    it('should show helpful guidance for first-time users', () => {
      mockHolidays = [];

      renderWithProvider(<HolidayList />);

      // Should include guidance text
      expect(screen.getByText(/start by adding your first holiday/i)).toBeInTheDocument();
      expect(screen.getByText(/enter the holiday name and date/i)).toBeInTheDocument();
    });

    it('should provide clear call-to-action to add holiday', () => {
      mockHolidays = [];

      renderWithProvider(<HolidayList />);

      // Should have prominent CTA
      const addButton = screen.getByRole('button', { name: /add your first holiday/i });
      expect(addButton).toBeInTheDocument();
      expect(addButton).toHaveClass('bg-blue-600', 'text-white'); // Prominent styling
    });

    it('should show different empty state when holidays exist but recommendations are being calculated', () => {
      mockHolidays = [
        { id: 1, name: 'Test Holiday', date: '2024-12-25' }
      ];
      mockIsCalculating = true;

      renderWithProvider(<HolidayList />);

      // Should show calculating state, not empty state
      expect(screen.getByTestId('calculating-recommendations')).toBeInTheDocument();
      expect(screen.getByText(/calculating your recommendations/i)).toBeInTheDocument();
      expect(screen.queryByTestId('empty-holidays-state')).not.toBeInTheDocument();
    });

    it('should show empty state with loading spinner when initial load is happening', () => {
      mockIsCalculating = true;

      renderWithProvider(<HolidayList />);

      // Should show loading state during initial calculation
      expect(screen.getByTestId('calculating-recommendations')).toBeInTheDocument();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.getByText(/calculating recommendations/i)).toBeInTheDocument();
    });

    it('should display appropriate icon for empty holidays state', () => {
      mockHolidays = [];

      renderWithProvider(<HolidayList />);

      // Should have relevant empty state icon
      expect(screen.getByTestId('empty-holidays-icon')).toBeInTheDocument();
      expect(screen.getByTestId('empty-holidays-icon')).toHaveAttribute('aria-hidden', 'true');
    });

    it('should have proper accessibility attributes for empty state', () => {
      mockHolidays = [];

      renderWithProvider(<HolidayList />);

      const emptyState = screen.getByTestId('empty-holidays-state');
      expect(emptyState).toHaveAttribute('role', 'status');
      expect(emptyState).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Recommendations Empty State', () => {
    it('should display empty state when no recommendations exist', () => {
      mockRecommendations = [];

      renderWithProvider(<RecommendationsSection />);

      // Should show recommendations empty state
      expect(screen.getByTestId('empty-recommendations-state')).toBeInTheDocument();
      expect(screen.getByText(/no recommendations available/i)).toBeInTheDocument();
    });

    it('should show helpful message when holidays exist but no recommendations can be made', () => {
      mockHolidays = [
        { id: 1, name: 'Monday Holiday', date: '2024-12-23' }
      ];
      mockRecommendations = [];

      renderWithProvider(<RecommendationsSection />);

      // Should show contextual empty state
      expect(screen.getByText(/good news! all your holidays already fall nicely/i)).toBeInTheDocument();
      expect(screen.getByText(/no additional recommendations are needed/i)).toBeInTheDocument();
    });

    it('should provide guidance on how to get recommendations', () => {
      mockHolidays = [];
      mockRecommendations = [];

      renderWithProvider(<RecommendationsSection />);

      // Should guide user to add holidays first
      expect(screen.getByText(/add some holidays to see recommendations/i)).toBeInTheDocument();
      expect(screen.getByText(/we'll suggest the best days to take off/i)).toBeInTheDocument();
    });

    it('should show proper icon for recommendations empty state', () => {
      mockRecommendations = [];

      renderWithProvider(<RecommendationsSection />);

      // Should have relevant icon
      expect(screen.getByTestId('empty-recommendations-icon')).toBeInTheDocument();
      expect(screen.getByTestId('empty-recommendations-icon')).toHaveAttribute('aria-hidden', 'true');
    });

    it('should have accessibility attributes for recommendations empty state', () => {
      mockRecommendations = [];

      renderWithProvider(<RecommendationsSection />);

      const emptyState = screen.getByTestId('empty-recommendations-state');
      expect(emptyState).toHaveAttribute('role', 'status');
      expect(emptyState).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Storage Unavailable Empty State', () => {
    it('should show empty state with storage warning when localStorage is unavailable', () => {
      mockHolidays = [];
      mockIsLocalStorageAvailable = false;

      renderWithProvider(<HolidayList />);

      // Should show storage unavailable message
      expect(screen.getByTestId('storage-unavailable-state')).toBeInTheDocument();
      expect(screen.getByText(/storage unavailable/i)).toBeInTheDocument();
      expect(screen.getByText(/your holidays will only be saved during this session/i)).toBeInTheDocument();
    });

    it('should provide clear guidance about storage limitations', () => {
      mockHolidays = [];
      mockIsLocalStorageAvailable = false;

      renderWithProvider(<HolidayList />);

      // Should explain the limitation
      expect(screen.getByText(/local storage is not available in your browser/i)).toBeInTheDocument();
      expect(screen.getByText(/you can still use the app, but your data won't persist/i)).toBeInTheDocument();
    });

    it('should show empty state when storage error occurs', () => {
      mockHolidays = [];
      mockStorageError = {
        type: 'QUOTA_EXCEEDED',
        userMessage: 'Storage quota exceeded. Please clear some data.'
      };

      renderWithProvider(<HolidayList />);

      // Should show storage error state
      expect(screen.getByTestId('storage-error-state')).toBeInTheDocument();
      expect(screen.getByText(/storage error/i)).toBeInTheDocument();
      expect(screen.getByText(/storage quota exceeded/i)).toBeInTheDocument();
    });

    it('should provide recovery options for storage errors', () => {
      mockHolidays = [];
      mockStorageError = {
        type: 'QUOTA_EXCEEDED',
        userMessage: 'Storage quota exceeded. Please clear some data.'
      };

      renderWithProvider(<HolidayList />);

      // Should have recovery options
      expect(screen.getByRole('button', { name: /clear all data/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should show loading state when calculating recommendations', () => {
      mockHolidays = [
        { id: 1, name: 'Test Holiday', date: '2024-12-25' }
      ];
      mockIsCalculating = true;

      renderWithProvider(<RecommendationsSection />);

      // Should show calculating state
      expect(screen.getByTestId('calculating-recommendations')).toBeInTheDocument();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.getByText(/calculating optimal days off/i)).toBeInTheDocument();
    });

    it('should show loading state with progress indicator for long calculations', async () => {
      mockHolidays = [
        { id: 1, name: 'Test Holiday', date: '2024-12-25' }
      ];
      mockIsCalculating = true;

      renderWithProvider(<RecommendationsSection />);

      // Should show progress indicator
      expect(screen.getByTestId('loading-progress')).toBeInTheDocument();
      expect(screen.getByText(/analyzing holiday patterns/i)).toBeInTheDocument();
    });

    it('should show loading state when saving to localStorage', async () => {
      // Mock addHoliday to return a promise that takes time
      mockAddHoliday.mockImplementation(() => new Promise(resolve => {
        setTimeout(() => resolve({}), 1000);
      }));

      renderWithProvider(<HolidayList />);

      // Simulate adding a holiday
      await userEvent.click(screen.getByRole('button', { name: /add your first holiday/i }));

      // Should show saving indicator
      await waitFor(() => {
        expect(screen.getByTestId('saving-indicator')).toBeInTheDocument();
        expect(screen.getByText(/saving holiday/i)).toBeInTheDocument();
      });
    });

    it('should have proper accessibility for loading states', () => {
      mockIsCalculating = true;

      renderWithProvider(<RecommendationsSection />);

      const loadingState = screen.getByTestId('calculating-recommendations');
      expect(loadingState).toHaveAttribute('role', 'status');
      expect(loadingState).toHaveAttribute('aria-live', 'polite');
      expect(loadingState).toHaveAttribute('aria-busy', 'true');
    });
  });

  describe('Empty State Transitions', () => {
    it('should transition from empty to content when holidays are added', async () => {
      mockHolidays = [];

      const { rerender } = renderWithProvider(<HolidayList />);

      // Initially should show empty state
      expect(screen.getByTestId('empty-holidays-state')).toBeInTheDocument();

      // Simulate adding a holiday
      mockHolidays = [
        { id: 1, name: 'New Holiday', date: '2024-12-25' }
      ];

      // Rerender with holiday
      renderWithProvider(<HolidayList />);

      // Should now show content, not empty state
      expect(screen.queryByTestId('empty-holidays-state')).not.toBeInTheDocument();
      expect(screen.getByText('New Holiday')).toBeInTheDocument();
    });

    it('should transition from empty to loading state when calculation starts', () => {
      mockHolidays = [];
      mockIsCalculating = false;

      const { rerender } = renderWithProvider(<RecommendationsSection />);

      // Initially show empty state
      expect(screen.getByTestId('empty-recommendations-state')).toBeInTheDocument();

      // Start calculation
      mockIsCalculating = true;
      renderWithProvider(<RecommendationsSection />);

      // Should show loading state, not empty state
      expect(screen.getByTestId('calculating-recommendations')).toBeInTheDocument();
      expect(screen.queryByTestId('empty-recommendations-state')).not.toBeInTheDocument();
    });

    it('should transition back to empty state when all holidays are deleted', async () => {
      mockHolidays = [
        { id: 1, name: 'Holiday to Delete', date: '2024-12-25' }
      ];

      const { rerender } = renderWithProvider(<HolidayList />);

      // Initially show content
      expect(screen.queryByTestId('empty-holidays-state')).not.toBeInTheDocument();

      // Delete all holidays
      mockHolidays = [];
      renderWithProvider(<HolidayList />);

      // Should show empty state again
      expect(screen.getByTestId('empty-holidays-state')).toBeInTheDocument();
    });
  });

  describe('Empty State Content and Styling', () => {
    it('should use consistent styling across all empty states', () => {
      mockHolidays = [];
      mockRecommendations = [];

      renderWithProvider(<HolidayList />);

      const holidaysEmptyState = screen.getByTestId('empty-holidays-state');
      expect(holidaysEmptyState).toHaveClass('text-center', 'py-8', 'px-4');

      renderWithProvider(<RecommendationsSection />);

      const recommendationsEmptyState = screen.getByTestId('empty-recommendations-state');
      expect(recommendationsEmptyState).toHaveClass('text-center', 'py-8', 'px-4');
    });

    it('should use appropriate colors and icons for different empty states', () => {
      mockHolidays = [];
      mockRecommendations = [];

      renderWithProvider(<HolidayList />);

      const holidaysIcon = screen.getByTestId('empty-holidays-icon');
      expect(holidaysIcon).toHaveClass('text-gray-400');

      renderWithProvider(<RecommendationsSection />);

      const recommendationsIcon = screen.getByTestId('empty-recommendations-icon');
      expect(recommendationsIcon).toHaveClass('text-gray-400');
    });

    it('should have appropriate spacing and typography', () => {
      mockHolidays = [];

      renderWithProvider(<HolidayList />);

      // Check typography
      const title = screen.getByText(/no holidays found/i);
      expect(title).toHaveClass('text-xl', 'font-semibold');

      const description = screen.getByText(/start by adding your first holiday/i);
      expect(description).toHaveClass('text-gray-600', 'mt-2');
    });

    it('should be responsive on different screen sizes', () => {
      mockHolidays = [];

      renderWithProvider(<HolidayList />);

      const emptyState = screen.getByTestId('empty-holidays-state');
      expect(emptyState).toHaveClass('w-full', 'max-w-md', 'mx-auto');
    });
  });

  describe('Empty State User Interactions', () => {
    it('should allow user to navigate to add holiday form from empty state', async () => {
      mockHolidays = [];

      renderWithProvider(<HolidayList />);

      const addButton = screen.getByRole('button', { name: /add your first holiday/i });
      await userEvent.click(addButton);

      // Should focus on the holiday name input in the form
      await waitFor(() => {
        expect(screen.getByLabelText(/holiday name/i)).toHaveFocus();
      });
    });

    it('should handle storage error recovery actions', async () => {
      mockHolidays = [];
      mockStorageError = {
        type: 'QUOTA_EXCEEDED',
        userMessage: 'Storage quota exceeded. Please clear some data.'
      };

      renderWithProvider(<HolidayList />);

      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      await userEvent.click(tryAgainButton);

      // Should call clearStorageError function
      expect(mockClearStorageError).toHaveBeenCalledTimes(1);
    });

    it('should provide helpful tooltips and hover states', async () => {
      mockHolidays = [];

      renderWithProvider(<HolidayList />);

      const addButton = screen.getByRole('button', { name: /add your first holiday/i });

      // Should have tooltip on hover (assuming tooltip implementation)
      await userEvent.hover(addButton);

      // Check for accessible description
      expect(addButton).toHaveAttribute('aria-label');
    });
  });
});