/**
 * Component Test: HolidayListItem - Delete Persistence Feedback
 *
 * Tests the holiday list item component's handling of storage success/failure
 * feedback for delete operations and auto-clear message functionality.
 *
 * Test ID: 1.3-COMP-002
 * Priority: P0 (Delete feedback critical)
 * Story: 1.3 - Local Storage Persistence
 *
 * THIS FILE CONTAINS FAILING TESTS - RED PHASE
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HolidayListItem from '../../src/components/HolidayListItem';
import type { Holiday } from '../../src/context/HolidayContext';

// Mock HolidayContext hook with delete storage error tracking
const mockDeleteHoliday = vi.fn();
let mockStorageError: any = null;

vi.mock('../../src/hooks/useHolidays', () => ({
  useHolidays: () => ({
    deleteHoliday: mockDeleteHoliday.mockImplementation((id) => {
      return mockStorageError; // Returns storage error or null
    }),
    holidays: [],
    clearStorageError: vi.fn(),
    storageError: null,
    isLocalStorageAvailable: true,
  }),
}));

// Mock timer for auto-clear functionality tests
vi.useFakeTimers();

describe('HolidayListItem Component - Delete Persistence Feedback', () => {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

  const mockHoliday: Holiday = {
    id: 'test-holiday-id',
    name: 'Test Holiday',
    date: '2025-12-25'
  };

  beforeEach(() => {
    mockDeleteHoliday.mockClear();
    mockStorageError = null;
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('AC2: Storage success/failure feedback on delete', () => {
    test('should show success message when delete operation succeeds', async () => {
      // GIVEN: Delete operation succeeds
      mockStorageError = null; // No error = success

      render(<HolidayListItem holiday={mockHoliday} />);

      const deleteButton = screen.getByRole('button', { name: /delete/i });

      // WHEN: User clicks delete button and storage succeeds
      await user.click(deleteButton);
      // Confirm delete in confirmation dialog
      await user.click(screen.getByRole('button', { name: /delete/i }));

      // THEN: Should show success message
      // THIS TEST FAILS - Current implementation doesn't show delete success messages
      await waitFor(() => {
        expect(screen.getByText('Holiday deleted successfully!')).toBeInTheDocument();
      });

      // Should have success styling
      expect(screen.getByText('Holiday deleted successfully!')).toHaveClass(
        'text-green-600',
        'bg-green-50'
      );
    });

    test('should show error message when delete operation fails', async () => {
      // GIVEN: Delete operation fails
      mockStorageError = {
        success: false,
        type: 'QUOTA_EXCEEDED',
        message: 'Storage quota exceeded',
        userMessage: 'Storage space is full. Please clear some data or try again later.'
      };

      render(<HolidayListItem holiday={mockHoliday} />);

      const deleteButton = screen.getByRole('button', { name: /delete/i });

      // WHEN: User clicks delete button but storage fails
      await user.click(deleteButton);
      await user.click(screen.getByRole('button', { name: /delete/i }));

      // THEN: Should show user-friendly error message
      await waitFor(() => {
        expect(screen.getByText(mockStorageError.userMessage)).toBeInTheDocument();
      });

      // Should have error styling
      expect(screen.getByText(mockStorageError.userMessage)).toHaveClass(
        'text-red-600',
        'bg-red-50'
      );

      // Should be accessible as alert
      expect(screen.getByRole('alert')).toHaveTextContent(mockStorageError.userMessage);
    });

    test('should show different error messages based on delete storage error type', async () => {
      const errorScenarios = [
        {
          type: 'QUOTA_EXCEEDED',
          userMessage: 'Storage space is full. Please clear some data or try again later.',
          expectedText: 'Storage space is full'
        },
        {
          type: 'SECURITY_ERROR',
          userMessage: 'Cannot delete due to browser security restrictions.',
          expectedText: 'browser security restrictions'
        },
        {
          type: 'STORAGE_UNAVAILABLE',
          userMessage: 'Storage is not available. Changes cannot be saved.',
          expectedText: 'not available'
        },
        {
          type: 'GENERIC_ERROR',
          userMessage: 'Failed to delete holiday. Please try again.',
          expectedText: 'Failed to delete'
        }
      ];

      for (const scenario of errorScenarios) {
        // GIVEN: Specific storage error type for delete
        mockStorageError = {
          success: false,
          type: scenario.type,
          message: 'Storage error',
          userMessage: scenario.userMessage
        };

        const { unmount } = render(<HolidayListItem holiday={mockHoliday} />);

        const deleteButton = screen.getByRole('button', { name: /delete/i });

        // WHEN: Deleting holiday with storage error
        await user.click(deleteButton);
        await user.click(screen.getByRole('button', { name: /delete/i }));

        // THEN: Should show appropriate error message
        await waitFor(() => {
          expect(screen.getByText(scenario.expectedText)).toBeInTheDocument();
        });

        unmount();
      }
    });
  });

  describe('AC6: Auto-clear delete messages (5 seconds)', () => {
    test('should auto-clear delete success message after 5 seconds', async () => {
      // GIVEN: Delete operation succeeds
      mockStorageError = null;

      render(<HolidayListItem holiday={mockHoliday} />);

      const deleteButton = screen.getByRole('button', { name: /delete/i });

      // WHEN: User deletes holiday successfully
      await user.click(deleteButton);
      await user.click(screen.getByRole('button', { name: /delete/i }));

      // THEN: Should show success message initially
      await waitFor(() => {
        expect(screen.getByText('Holiday deleted successfully!')).toBeInTheDocument();
      });

      // Advance time to trigger auto-clear
      vi.advanceTimersByTime(5000);

      await waitFor(() => {
        // Should auto-clear after 5 seconds
        expect(screen.queryByText('Holiday deleted successfully!')).not.toBeInTheDocument();
      });
    });

    test('should auto-clear delete error message after 5 seconds', async () => {
      // GIVEN: Delete operation fails
      mockStorageError = {
        success: false,
        type: 'QUOTA_EXCEEDED',
        message: 'Storage quota exceeded',
        userMessage: 'Storage space is full. Please clear some data or try again later.'
      };

      render(<HolidayListItem holiday={mockHoliday} />);

      const deleteButton = screen.getByRole('button', { name: /delete/i });

      // WHEN: User deletes holiday but storage fails
      await user.click(deleteButton);
      await user.click(screen.getByRole('button', { name: /delete/i }));

      // THEN: Should show error message initially
      await waitFor(() => {
        expect(screen.getByText(mockStorageError.userMessage)).toBeInTheDocument();
      });

      // Advance time to trigger auto-clear
      vi.advanceTimersByTime(5000);

      await waitFor(() => {
        // Should auto-clear after 5 seconds
        expect(screen.queryByText(mockStorageError.userMessage)).not.toBeInTheDocument();
      });
    });

    test('should clear previous delete message when new delete operation starts', async () => {
      // GIVEN: Previous delete operation showed error message
      mockStorageError = {
        success: false,
        type: 'QUOTA_EXCEEDED',
        userMessage: 'Storage space is full. Please clear some data or try again later.'
      };

      render(<HolidayListItem holiday={mockHoliday} />);

      const deleteButton = screen.getByRole('button', { name: /delete/i });

      // First operation: failed delete
      await user.click(deleteButton);
      await user.click(screen.getByRole('button', { name: /delete/i }));

      await waitFor(() => {
        expect(screen.getByText(mockStorageError.userMessage)).toBeInTheDocument();
      });

      // GIVEN: Second delete operation succeeds
      mockStorageError = null;

      // WHEN: User performs another delete operation
      // Since we can't delete again (item should be gone), we need to re-mount with a new item
      const newHoliday = { ...mockHoliday, id: 'new-holiday-id', name: 'New Holiday' };
      const { rerender } = render(<HolidayListItem holiday={newHoliday} />);

      const newDeleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(newDeleteButton);
      await user.click(screen.getByRole('button', { name: /delete/i }));

      // THEN: Should show new success message, previous error cleared
      await waitFor(() => {
        expect(screen.queryByText(mockStorageError.userMessage)).not.toBeInTheDocument();
        expect(screen.getByText('Holiday deleted successfully!')).toBeInTheDocument();
      });
    });
  });

  describe('Delete Feedback Accessibility', () => {
    test('should announce delete messages to screen readers', async () => {
      // GIVEN: Delete operation fails
      mockStorageError = {
        success: false,
        type: 'SECURITY_ERROR',
        userMessage: 'Cannot delete due to browser security restrictions.'
      };

      render(<HolidayListItem holiday={mockHoliday} />);

      const deleteButton = screen.getByRole('button', { name: /delete/i });

      // WHEN: Delete operation fails
      await user.click(deleteButton);
      await user.click(screen.getByRole('button', { name: /delete/i }));

      // THEN: Should be announced to screen readers via aria-live
      await waitFor(() => {
        const alertElement = screen.getByRole('alert');
        expect(alertElement).toBeInTheDocument();
        expect(alertElement).toHaveTextContent('Cannot delete due to browser security restrictions.');
        expect(alertElement).toHaveAttribute('aria-live', 'polite');
      });
    });

    test('should maintain button focus during error states', async () => {
      // GIVEN: Delete operation fails
      mockStorageError = {
        success: false,
        type: 'GENERIC_ERROR',
        userMessage: 'Failed to delete holiday. Please try again.'
      };

      render(<HolidayListItem holiday={mockHoliday} />);

      const deleteButton = screen.getByRole('button', { name: /delete/i });

      // WHEN: User clicks delete button and storage fails
      await user.click(deleteButton);
      await user.click(screen.getByRole('button', { name: /delete/i });

      // THEN: Delete button should remain focused for retry
      await waitFor(() => {
        expect(deleteButton).toHaveFocus();
        expect(screen.getByText(mockStorageError.userMessage)).toBeInTheDocument();
      });
    });
  });

  describe('Delete Confirmation Integration', () => {
    test('should not show storage message if user cancels delete confirmation', async () => {
      // GIVEN: User cancels delete confirmation
      render(<HolidayListItem holiday={mockHoliday} />);

      const deleteButton = screen.getByRole('button', { name: /delete/i });

      // WHEN: User clicks delete but cancels confirmation
      await user.click(deleteButton);
      await user.click(screen.getByRole('button', { name: /cancel/i }));

      // THEN: Should not show any storage messages
      expect(screen.queryByText('Holiday deleted successfully!')).not.toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();

      // Delete function should not have been called
      expect(mockDeleteHoliday).not.toHaveBeenCalled();
    });

    test('should show storage message only after confirmed delete', async () => {
      // GIVEN: Delete succeeds
      mockStorageError = null;

      render(<HolidayListItem holiday={mockHoliday} />);

      const deleteButton = screen.getByRole('button', { name: /delete/i });

      // WHEN: User confirms delete
      await user.click(deleteButton);

      // Should show confirmation dialog first
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Then confirm delete
      await user.click(screen.getByRole('button', { name: /delete/i }));

      // THEN: Should show storage success message
      await waitFor(() => {
        expect(screen.getByText('Holiday deleted successfully!')).toBeInTheDocument();
      });
    });
  });

  describe('Multiple Delete Operations', () => {
    test('should handle rapid successive delete operations on different items', async () => {
      // GIVEN: Multiple holiday items
      const holiday1 = { ...mockHoliday, id: 'holiday-1', name: 'Holiday 1' };
      const holiday2 = { ...mockHoliday, id: 'holiday-2', name: 'Holiday 2' };

      mockStorageError = null;

      const { rerender } = render(<HolidayListItem holiday={holiday1} />);

      // First delete
      const deleteButton1 = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton1);
      await user.click(screen.getByRole('button', { name: /delete/i }));

      await waitFor(() => {
        expect(screen.getByText('Holiday deleted successfully!')).toBeInTheDocument();
      });

      // Second delete on different item
      rerender(<HolidayListItem holiday={holiday2} />);
      const deleteButton2 = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton2);
      await user.click(screen.getByRole('button', { name: /delete/i }));

      // Should update with second success message
      await waitFor(() => {
        expect(screen.getByText('Holiday deleted successfully!')).toBeInTheDocument();
      });
    });
  });

  describe('Holiday Information Display', () => {
    test('should display holiday information correctly', () => {
      // GIVEN: A holiday with specific data
      const testHoliday = {
        id: 'test-123',
        name: 'Christmas',
        date: '2025-12-25'
      };

      // WHEN: Rendering the component
      render(<HolidayListItem holiday={testHoliday} />);

      // THEN: Should display holiday information
      expect(screen.getByText('Christmas')).toBeInTheDocument();
      expect(screen.getByText('2025-12-25')).toBeInTheDocument();

      // Should have delete button
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      expect(deleteButton).toBeInTheDocument();
    });

    test('should have proper accessibility attributes', () => {
      // GIVEN: A holiday item
      render(<HolidayListItem holiday={mockHoliday} />);

      // THEN: Should have proper structure for accessibility
      const listItem = screen.getByRole('listitem');
      expect(listItem).toBeInTheDocument();

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      expect(deleteButton).toHaveAttribute('aria-label', expect.stringContaining('Delete Test Holiday'));
    });
  });
});