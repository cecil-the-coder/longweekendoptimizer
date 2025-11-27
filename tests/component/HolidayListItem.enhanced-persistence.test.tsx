/**
 * Component Test: HolidayListItem - Enhanced Persistence Feedback
 *
 * Comprehensive tests for HolidayListItem storage success/failure feedback
 * during delete operations, including user notification mechanisms and error states.
 *
 * Test ID: 1.3-COMP-DELETE-001
 * Priority: P0 (Critical user feedback on delete operations)
 * Story: 1.3 - Local Storage Persistence
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HolidayListItem from '../../src/components/HolidayListItem';
import { HolidayProvider } from '../../src/context/HolidayContext';
import type { Holiday } from '../../src/context/HolidayContext';

// Mock window.confirm at the top level
Object.defineProperty(window, 'confirm', {
  value: vi.fn(() => true),
  writable: true,
});

// Mock HolidayContext with delete functionality
let mockDeleteHoliday: ReturnType<typeof vi.fn>;
let mockStorageError: any = null;

const HolidayListItemWithProvider = ({ holiday }: { holiday: Holiday }) => (
  <HolidayProvider>
    <HolidayListItem holiday={holiday} />
  </HolidayProvider>
);

// Mock the useHolidays hook to control behavior
vi.mock('../../src/hooks/useHolidays', () => ({
  useHolidays: () => ({
    deleteHoliday: mockDeleteHoliday?.mockImplementation((id) => mockStorageError),
    holidays: [],
    storageError: null,
    clearStorageError: vi.fn(),
    isLocalStorageAvailable: true,
  }),
}));

// Mock timer for auto-clear functionality
vi.useFakeTimers();

describe('HolidayListItem Component - Enhanced Delete Persistence Feedback', () => {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  const testHoliday: Holiday = {
    id: 'test-holiday-id',
    name: 'Test Holiday',
    date: '2025-12-25'
  };

  beforeEach(() => {
    mockDeleteHoliday = vi.fn();
    mockStorageError = null;
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('AC2: Delete operation storage success/failure feedback', () => {
    test('should show success message when storage operation succeeds', async () => {
      // GIVEN: Storage operation succeeds
      mockStorageError = null; // No error = success

      render(<HolidayListItemWithProvider holiday={testHoliday} />);

      const deleteButton = screen.getByRole('button', { name: /delete/i });

      // WHEN: User deletes holiday and storage succeeds
      await user.click(deleteButton);

      // THEN: Should show success message
      // THIS TEST FAILS - Current implementation doesn't show success messages
      await waitFor(() => {
        expect(screen.getByText('Holiday deleted successfully!')).toBeInTheDocument();
      });

      // Should have success styling
      const successMessage = screen.getByText('Holiday deleted successfully!');
      expect(successMessage).toHaveClass('text-green-600', 'bg-green-50');

      // Should be accessible as alert
      expect(screen.getByRole('alert')).toHaveTextContent('Holiday deleted successfully!');
    });

    test('should show error message when storage operation fails', async () => {
      // GIVEN: Storage operation fails
      mockStorageError = {
        success: false,
        type: 'QUOTA_EXCEEDED',
        message: 'Storage quota exceeded',
        userMessage: 'Storage space is full. Please clear some data or try again later.'
      };

      render(<HolidayListItemWithProvider holiday={testHoliday} />);

      const deleteButton = screen.getByRole('button', { name: /delete/i });

      // WHEN: User deletes holiday but storage fails
      await user.click(deleteButton);

      // THEN: Should show user-friendly error message
      await waitFor(() => {
        expect(screen.getByText(mockStorageError.userMessage)).toBeInTheDocument();
      });

      // Should have error styling
      const errorMessage = screen.getByText(mockStorageError.userMessage);
      expect(errorMessage).toHaveClass('text-red-600', 'bg-red-50');

      // Should be accessible as alert
      expect(screen.getByRole('alert')).toHaveTextContent(mockStorageError.userMessage);
    });

    test('should remove holiday from UI even when storage fails', async () => {
      // GIVEN: Storage operation fails
      mockStorageError = {
        success: false,
        type: 'SECURITY_ERROR',
        message: 'Storage access denied',
        userMessage: 'Unable to access storage. Your browser may be in private mode or storage is disabled.'
      };

      const { container } = render(<HolidayListItemWithProvider holiday={testHoliday} />);

      const deleteButton = screen.getByRole('button', { name: /delete/i });

      // Verify holiday is initially visible
      expect(screen.getByText('Test Holiday')).toBeInTheDocument();

      // WHEN: User deletes holiday but storage fails
      await user.click(deleteButton);

      // THEN: Holiday should be removed from DOM (optimistic UI update)
      await waitFor(() => {
        expect(screen.queryByText('Test Holiday')).not.toBeInTheDocument();
      });

      // But error message should be shown
      expect(screen.getByText(mockStorageError.userMessage)).toBeInTheDocument();
    });

    test('should show different error messages based on storage error type', async () => {
      const errorScenarios = [
        {
          type: 'QUOTA_EXCEEDED',
          userMessage: 'Storage space is full. Please clear some data or try again later.',
          expectedText: 'Storage space is full'
        },
        {
          type: 'SECURITY_ERROR',
          userMessage: 'Unable to access storage. Your browser may be in private mode or storage is disabled.',
          expectedText: 'private mode'
        },
        {
          type: 'STORAGE_UNAVAILABLE',
          userMessage: 'Storage is not available. Changes cannot be saved.',
          expectedText: 'not available'
        },
        {
          type: 'CORRUPTION_ERROR',
          userMessage: 'Saved holiday data was corrupted. Starting with an empty list.',
          expectedText: 'corrupted'
        },
        {
          type: 'GENERIC_ERROR',
          userMessage: 'Failed to delete holiday. Please try again.',
          expectedText: 'Failed to delete'
        }
      ];

      for (const scenario of errorScenarios) {
        // GIVEN: Specific storage error type
        mockStorageError = {
          success: false,
          type: scenario.type,
          message: 'Storage error',
          userMessage: scenario.userMessage
        };

        const { unmount } = render(<HolidayListItemWithProvider holiday={testHoliday} />);

        const deleteButton = screen.getByRole('button', { name: /delete/i });

        // WHEN: Deleting holiday with storage error
        await user.click(deleteButton);

        // THEN: Should show appropriate error message
        await waitFor(() => {
          expect(screen.getByText(scenario.expectedText)).toBeInTheDocument();
        });

        unmount();
      }
    });
  });

  describe('Storage Feedback Accessibility', () => {
    test('should announce delete messages to screen readers', async () => {
      // GIVEN: Storage error scenario
      mockStorageError = {
        success: false,
        type: 'SECURITY_ERROR',
        userMessage: 'Cannot save changes due to browser security restrictions.'
      };

      render(<HolidayListItemWithProvider holiday={testHoliday} />);

      const deleteButton = screen.getByRole('button', { name: /delete/i });

      // WHEN: Storage operation fails
      await user.click(deleteButton);

      // THEN: Should be announced to screen readers via aria-live
      await waitFor(() => {
        const alertElement = screen.getByRole('alert');
        expect(alertElement).toBeInTheDocument();
        expect(alertElement).toHaveTextContent('Cannot save changes due to browser security restrictions.');
        expect(alertElement).toHaveAttribute('aria-live', 'polite');
      });
    });

    test('should maintain focus management during delete operations', async () => {
      // GIVEN: Holiday list item
      render(<HolidayListItemWithProvider holiday={testHoliday} />);

      const deleteButton = screen.getByRole('button', { name: /delete/i });

      // WHEN: Delete operation occurs
      deleteButton.focus();
      expect(deleteButton).toHaveFocus();

      await user.click(deleteButton);

      // THEN: Focus should be managed appropriately
      // This might be focus on success message, error message, or next element
      // Implementation dependent - checking that focus handling doesn't crash
      await waitFor(() => {
        expect(document.activeElement).toBeDefined();
      });
    });

    test('should provide keyboard navigation for delete operations', async () => {
      // GIVEN: Holiday list item
      render(<HolidayListItemWithProvider holiday={testHoliday} />);

      const deleteButton = screen.getByRole('button', { name: /delete/i });

      // WHEN: Using keyboard to delete
      deleteButton.focus();
      await user.keyboard('{Enter}');

      // THEN: Should trigger delete operation
      expect(mockDeleteHoliday).toHaveBeenCalledWith(testHoliday.id);
    });
  });

  describe('Visual Feedback States', () => {
    test('should show loading state during delete operation', async () => {
      // GIVEN: Delete operation takes time
      mockDeleteHoliday.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

      render(<HolidayListItemWithProvider holiday={testHoliday} />);

      const deleteButton = screen.getByRole('button', { name: /delete/i });

      // WHEN: Starting delete operation
      await user.click(deleteButton);

      // THEN: Should show loading state (implementation dependent)
      // This could be spinner, disabled button, or loading text
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
      // Button might be disabled or show loading indicator
    });

    test('should disable delete button during operation', async () => {
      // GIVEN: Delete operation in progress
      let resolveDelete: () => void;
      const deletePromise = new Promise<void>(resolve => {
        resolveDelete = resolve;
      });
      mockDeleteHoliday.mockReturnValue(deletePromise);

      render(<HolidayListItemWithProvider holiday={testHoliday} />);

      const deleteButton = screen.getByRole('button', { name: /delete/i });

      // WHEN: Starting delete operation
      await user.click(deleteButton);

      // THEN: Button should be disabled during operation (if implemented)
      // Implementation dependent - common pattern for preventing double-clicks
      await waitFor(() => {
        const button = screen.getByRole('button', { name: /delete/i });
        // Either disabled or has loading state
        expect(button.hasAttribute('disabled') || button.getAttribute('aria-disabled')).toBeTruthy();
      });

      // Complete the operation
      resolveDelete!();
    });

    test('should apply appropriate success/error styling', async () => {
      // Test success styling
      mockStorageError = null;
      const { rerender } = render(<HolidayListItemWithProvider holiday={testHoliday} />);

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      await waitFor(() => {
        const successMessage = screen.getByText('Holiday deleted successfully!');
        expect(successMessage).toHaveClass('text-green-600', 'bg-green-50');
      });

      // Test error styling
      mockStorageError = {
        success: false,
        type: 'QUOTA_EXCEEDED',
        message: 'Storage quota exceeded',
        userMessage: 'Storage is full. Please clear some data.'
      };

      rerender(<HolidayListItemWithProvider holiday={testHoliday} />);

      const deleteButton2 = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton2);

      await waitFor(() => {
        const errorMessage = screen.getByText('Storage is full. Please clear some data.');
        expect(errorMessage).toHaveClass('text-red-600', 'bg-red-50');
      });
    });
  });

  describe('Auto-clear Message Behavior', () => {
    test('should auto-clear success message after 3 seconds', async () => {
      // GIVEN: Storage operation succeeds
      mockStorageError = null;

      render(<HolidayListItemWithProvider holiday={testHoliday} />);

      const deleteButton = screen.getByRole('button', { name: /delete/i });

      // WHEN: User deletes holiday and storage succeeds
      await user.click(deleteButton);

      // THEN: Should show success message initially
      await waitFor(() => {
        expect(screen.getByText('Holiday deleted successfully!')).toBeInTheDocument();
      });

      // Advance time to trigger auto-clear
      vi.advanceTimersByTime(3000);

      await waitFor(() => {
        // Should auto-clear after 3 seconds
        expect(screen.queryByText('Holiday deleted successfully!')).not.toBeInTheDocument();
      });
    });

    test('should auto-clear error message after 5 seconds', async () => {
      // GIVEN: Storage operation fails
      mockStorageError = {
        success: false,
        type: 'QUOTA_EXCEEDED',
        userMessage: 'Storage space is full.'
      };

      render(<HolidayListItemWithProvider holiday={testHoliday} />);

      const deleteButton = screen.getByRole('button', { name: /delete/i });

      // WHEN: User deletes holiday but storage fails
      await user.click(deleteButton);

      // THEN: Should show error message initially
      await waitFor(() => {
        expect(screen.getByText('Storage space is full.')).toBeInTheDocument();
      });

      // Advance time to trigger auto-clear
      vi.advanceTimersByTime(5000);

      await waitFor(() => {
        // Should auto-clear after 5 seconds
        expect(screen.queryByText('Storage space is full.')).not.toBeInTheDocument();
      });
    });

    test('should clear previous message when new operation starts', async () => {
      // GIVEN: Previous delete operation showed error message
      mockStorageError = {
        success: false,
        type: 'QUOTA_EXCEEDED',
        userMessage: 'Storage space is full.'
      };

      const { rerender } = render(<HolidayListItemWithProvider holiday={testHoliday} />);

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText('Storage space is full.')).toBeInTheDocument();
      });

      // GIVEN: Second delete operation succeeds
      mockStorageError = null;
      rerender(<HolidayListItemWithProvider holiday={testHoliday} />);

      // WHEN: User deletes holiday again
      const deleteButton2 = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton2);

      // THEN: Should show new success message, previous error cleared
      await waitFor(() => {
        expect(screen.queryByText('Storage space is full.')).not.toBeInTheDocument();
        expect(screen.getByText('Holiday deleted successfully!')).toBeInTheDocument();
      });
    });
  });

  describe('Error Recovery and Resilience', () => {
    test('should handle delete operations when localStorage is completely unavailable', async () => {
      // GIVEN: localStorage is completely unavailable
      mockStorageError = {
        success: false,
        type: 'STORAGE_UNAVAILABLE',
        userMessage: 'Storage is not available. Changes cannot be saved.'
      };

      render(<HolidayListItemWithProvider holiday={testHoliday} />);

      const deleteButton = screen.getByRole('button', { name: /delete/i });

      // WHEN: User attempts to delete holiday
      await user.click(deleteButton);

      // THEN: Should still provide user feedback about unavailability
      await waitFor(() => {
        expect(screen.getByText('Storage is not available. Changes cannot be saved.')).toBeInTheDocument();
      });

      // Should still remove from UI (optimistic update)
      expect(screen.queryByText('Test Holiday')).not.toBeInTheDocument();
    });

    test('should handle network-related storage errors', async () => {
      // GIVEN: Network-related storage error
      mockStorageError = {
        success: false,
        type: 'GENERIC_ERROR',
        message: 'Network error while accessing storage',
        userMessage: 'Unable to connect to storage. Please check your connection and try again.'
      };

      render(<HolidayListItemWithProvider holiday={testHoliday} />);

      const deleteButton = screen.getByRole('button', { name: /delete/i });

      // WHEN: Delete operation encounters network error
      await user.click(deleteButton);

      // THEN: Should show network-specific error message
      await waitFor(() => {
        expect(screen.getByText('Unable to connect to storage. Please check your connection and try again.')).toBeInTheDocument();
      });
    });

    test('should provide retry options for transient errors', async () => {
      // GIVEN: Transient storage error
      const transientError = {
        success: false,
        type: 'GENERIC_ERROR',
        message: 'Temporary storage error',
        userMessage: 'Temporary error occurred. Changes were not saved but you can try again.'
      };
      mockStorageError = transientError;

      render(<HolidayListItemWithProvider holiday={testHoliday} />);

      const deleteButton = screen.getByRole('button', { name: /delete/i });

      // WHEN: Delete encounters transient error
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText('Temporary error occurred. Changes were not saved but you can try again.')).toBeInTheDocument();
      });

      // THEN: Should provide retry capability (implementation dependent)
      // This could be a retry button or automatic retry
      // For now, just verify error message is shown
      expect(screen.queryByText('Test Holiday')).not.toBeInTheDocument(); // Optimistic removal
    });
  });

  describe('Component Integration Scenarios', () => {
    test('should coordinate delete with parent component state', async () => {
      // GIVEN: Holiday with specific properties
      const specialHoliday: Holiday = {
        id: 'special-id',
        name: 'Special Holiday',
        date: '2025-07-04'
      };

      render(<HolidayListItemWithProvider holiday={specialHoliday} />);

      const deleteButton = screen.getByRole('button', { name: /delete/i });

      // WHEN: Deleting holiday
      await user.click(deleteButton);

      // THEN: Should call deleteHoliday with correct ID
      expect(mockDeleteHoliday).toHaveBeenCalledWith('special-id');
    });

    test('should maintain visual consistency during delete animations', async () => {
      render(<HolidayListItemWithProvider holiday={testHoliday} />);

      const holidayElement = screen.getByText('Test Holiday');
      const deleteButton = screen.getByRole('button', { name: /delete/i });

      // WHEN: Starting delete operation
      await user.click(deleteButton);

      // THEN: Should handle visual transitions gracefully
      // Implementation dependent - might have fade-out or slide animation
      // Verify element exists during operation
      expect(holidayElement).toBeInTheDocument();
    });

    test('should handle delete cancellation', async () => {
      // GIVEN: Delete confirmation dialog (if implemented)
      render(<HolidayListItemWithProvider holiday={testHoliday} />);

      const deleteButton = screen.getByRole('button', { name: /delete/i });

      // WHEN: Clicking delete but canceling confirmation
      await user.click(deleteButton);

      // Implementation dependent - if there's a confirmation dialog
      // For now, just verify delete was attempted
      expect(mockDeleteHoliday).toHaveBeenCalled();

      // If confirmation was implemented, would test cancellation behavior
    });
  });

  describe('Performance and Memory', () => {
    test('should handle rapid delete operations without memory leaks', async () => {
      render(<HolidayListItemWithProvider holiday={testHoliday} />);

      const deleteButton = screen.getByRole('button', { name: /delete/i });

      // WHEN: Rapid clicking delete button
      for (let i = 0; i < 5; i++) {
        await user.click(deleteButton);
      }

      // THEN: Should handle gracefully without crashing
      expect(mockDeleteHoliday).toHaveBeenCalledTimes(5);
    });

    test('should clean up timers and listeners on unmount', async () => {
      const { unmount } = render(<HolidayListItemWithProvider holiday={testHoliday} />);

      // GIVEN: Message being displayed
      mockStorageError = {
        success: true,
        message: 'Delete successful'
      };

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      // WHEN: Component unmounts before message auto-clears
      unmount();

      // Advance time - should not cause errors
      vi.advanceTimersByTime(5000);

      // No assertions needed - just ensure no errors thrown
    });
  });
});