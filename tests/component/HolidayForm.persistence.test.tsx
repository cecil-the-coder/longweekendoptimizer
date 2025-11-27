/**
 * Component Test: HolidayForm - Persistence Feedback
 *
 * Tests the holiday form component's handling of storage success/failure
 * feedback and user notification mechanisms.
 *
 * Test ID: 1.3-COMP-001
 * Priority: P0 (User feedback critical)
 * Story: 1.3 - Local Storage Persistence
 *
 * THIS FILE CONTAINS FAILING TESTS - RED PHASE
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HolidayForm from '../../src/components/HolidayForm';

// Mock HolidayContext hook with storage error tracking
const mockAddHoliday = vi.fn();
let mockStorageError: any = null;

vi.mock('../../src/hooks/useHolidays', () => ({
  useHolidays: () => ({
    addHoliday: mockAddHoliday.mockImplementation((name, date) => {
      return mockStorageError; // Returns storage error or null
    }),
    holidays: [],
  }),
}));

// Mock timer for auto-clear functionality tests
vi.useFakeTimers();

describe('HolidayForm Component - Persistence Feedback', () => {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

  beforeEach(() => {
    mockAddHoliday.mockClear();
    mockStorageError = null;
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('AC1 & AC2: Storage success/failure feedback on add', () => {
    test('should show success message when storage operation succeeds', async () => {
      // GIVEN: Storage operation succeeds
      mockStorageError = null; // No error = success

      render(<HolidayForm />);

      const nameInput = screen.getByLabelText('Holiday Name');
      const dateInput = screen.getByLabelText('Holiday Date');
      const addButton = screen.getByRole('button', { name: 'Add Holiday' });

      // WHEN: User submits valid form and storage succeeds
      await user.type(nameInput, 'Test Holiday');
      await user.type(dateInput, '2025-12-25');
      await user.click(addButton);

      // THEN: Should show success message
      // THIS TEST FAILS - Current implementation doesn't show success messages
      await waitFor(() => {
        expect(screen.getByText('Holiday added successfully!')).toBeInTheDocument();
      });

      // Should have success styling
      expect(screen.getByText('Holiday added successfully!')).toHaveClass(
        'text-green-600',
        'bg-green-50'
      );
    });

    test('should show error message when storage operation fails', async () => {
      // GIVEN: Storage operation fails
      mockStorageError = {
        success: false,
        type: 'QUOTA_EXCEEDED',
        message: 'Storage quota exceeded',
        userMessage: 'Storage space is full. Please clear some data or try again later.'
      };

      render(<HolidayForm />);

      const nameInput = screen.getByLabelText('Holiday Name');
      const dateInput = screen.getByLabelText('Holiday Date');
      const addButton = screen.getByRole('button', { name: 'Add Holiday' });

      // WHEN: User submits valid form but storage fails
      await user.type(nameInput, 'Test Holiday');
      await user.type(dateInput, '2025-12-25');
      await user.click(addButton);

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

    test('should show different error messages based on storage error type', async () => {
      const errorScenarios = [
        {
          type: 'QUOTA_EXCEEDED',
          userMessage: 'Storage space is full. Please clear some data or try again later.',
          expectedText: 'Storage space is full'
        },
        {
          type: 'SECURITY_ERROR',
          userMessage: 'Cannot save changes due to browser security restrictions.',
          expectedText: 'browser security restrictions'
        },
        {
          type: 'STORAGE_UNAVAILABLE',
          userMessage: 'Storage is not available. Changes cannot be saved.',
          expectedText: 'not available'
        },
        {
          type: 'GENERIC_ERROR',
          userMessage: 'Failed to save holiday. Please try again.',
          expectedText: 'Failed to save'
        }
      ];

      errorScenarios.forEach(scenario => {
        // GIVEN: Specific storage error type
        mockStorageError = {
          success: false,
          type: scenario.type,
          message: 'Storage error',
          userMessage: scenario.userMessage
        };

        const { unmount } = render(<HolidayForm />);

        const nameInput = screen.getByLabelText('Holiday Name');
        const dateInput = screen.getByLabelText('Holiday Date');
        const addButton = screen.getByRole('button', { name: 'Add Holiday' });

        // WHEN: Submitting form with storage error
        user.type(nameInput, 'Test Holiday');
        user.type(dateInput, '2025-12-25');
        user.click(addButton);

        // THEN: Should show appropriate error message
        waitFor(() => {
          expect(screen.getByText(scenario.expectedText)).toBeInTheDocument();
        });

        unmount();
      });
    });
  });

  describe('AC6: Auto-clear storage messages (5 seconds)', () => {
    test('should auto-clear success message after 5 seconds', async () => {
      // GIVEN: Storage operation succeeds
      mockStorageError = null;

      render(<HolidayForm />);

      const nameInput = screen.getByLabelText('Holiday Name');
      const dateInput = screen.getByLabelText('Holiday Date');
      const addButton = screen.getByRole('button', { name: 'Add Holiday' });

      // WHEN: User submits form and storage succeeds
      await user.type(nameInput, 'Test Holiday');
      await user.type(dateInput, '2025-12-25');
      await user.click(addButton);

      // THEN: Should show success message initially
      await waitFor(() => {
        expect(screen.getByText('Holiday added successfully!')).toBeInTheDocument();
      });

      // Advance time to trigger auto-clear
      vi.advanceTimersByTime(5000);

      await waitFor(() => {
        // Should auto-clear after 5 seconds
        expect(screen.queryByText('Holiday added successfully!')).not.toBeInTheDocument();
      });
    });

    test('should auto-clear error message after 5 seconds', async () => {
      // GIVEN: Storage operation fails
      mockStorageError = {
        success: false,
        type: 'QUOTA_EXCEEDED',
        message: 'Storage quota exceeded',
        userMessage: 'Storage space is full. Please clear some data or try again later.'
      };

      render(<HolidayForm />);

      const nameInput = screen.getByLabelText('Holiday Name');
      const dateInput = screen.getByLabelText('Holiday Date');
      const addButton = screen.getByRole('button', { name: 'Add Holiday' });

      // WHEN: User submits form but storage fails
      await user.type(nameInput, 'Test Holiday');
      await user.type(dateInput, '2025-12-25');
      await user.click(addButton);

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

    test('should clear previous message when new operation starts', async () => {
      // GIVEN: Previous operation showed error message
      mockStorageError = {
        success: false,
        type: 'QUOTA_EXCEEDED',
        userMessage: 'Storage space is full. Please clear some data or try again later.'
      };

      render(<HolidayForm />);

      const nameInput = screen.getByLabelText('Holiday Name');
      const dateInput = screen.getByLabelText('Holiday Date');
      const addButton = screen.getByRole('button', { name: 'Add Holiday' });

      // First operation: failed storage
      await user.type(nameInput, 'Test Holiday 1');
      await user.type(dateInput, '2025-12-25');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText(mockStorageError.userMessage)).toBeInTheDocument();
      });

      // GIVEN: Second operation succeeds
      mockStorageError = null;

      // WHEN: User submits another holiday
      await user.clear(nameInput);
      await user.clear(dateInput);
      await user.type(nameInput, 'Test Holiday 2');
      await user.type(dateInput, '2025-01-01');
      await user.click(addButton);

      // THEN: Should show new success message, previous error cleared
      await waitFor(() => {
        expect(screen.queryByText(mockStorageError.userMessage)).not.toBeInTheDocument();
        expect(screen.getByText('Holiday added successfully!')).toBeInTheDocument();
      });
    });
  });

  describe('Storage Feedback Accessibility', () => {
    test('should announce storage messages to screen readers', async () => {
      // GIVEN: Storage operation fails
      mockStorageError = {
        success: false,
        type: 'SECURITY_ERROR',
        userMessage: 'Cannot save changes due to browser security restrictions.'
      };

      render(<HolidayForm />);

      const nameInput = screen.getByLabelText('Holiday Name');
      const dateInput = screen.getByLabelText('Holiday Date');
      const addButton = screen.getByRole('button', { name: 'Add Holiday' });

      // WHEN: Storage operation fails
      await user.type(nameInput, 'Test Holiday');
      await user.type(dateInput, '2025-12-25');
      await user.click(addButton);

      // THEN: Should be announced to screen readers via aria-live
      await waitFor(() => {
        const alertElement = screen.getByRole('alert');
        expect(alertElement).toBeInTheDocument();
        expect(alertElement).toHaveTextContent('Cannot save changes due to browser security restrictions.');
        expect(alertElement).toHaveAttribute('aria-live', 'polite');
      });
    });

    test('should not show storage messages for form validation errors', async () => {
      // GIVEN: Form validation error (not storage error)
      render(<HolidayForm />);

      const addButton = screen.getByRole('button', { name: 'Add Holiday' });

      // WHEN: Submitting empty form (validation error)
      await user.click(addButton);

      // THEN: Should show validation error, but not storage message
      expect(screen.getByText('Holiday name is required')).toBeInTheDocument();
      // Should not show any storage success/error messages
      expect(screen.queryByText('Holiday added successfully!')).not.toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('Form State with Storage Operations', () => {
    test('should clear form on successful storage operation', async () => {
      // GIVEN: Storage operation succeeds
      mockStorageError = null;

      render(<HolidayForm />);

      const nameInput = screen.getByLabelText('Holiday Name');
      const dateInput = screen.getByLabelText('Holiday Date');
      const addButton = screen.getByRole('button', { name: 'Add Holiday' });

      // WHEN: User submits form successfully
      await user.type(nameInput, 'Test Holiday');
      await user.type(dateInput, '2025-12-25');
      await user.click(addButton);

      // THEN: Should clear form fields AND show success message
      await waitFor(() => {
        expect(nameInput).toHaveValue('');
        expect(dateInput).toHaveValue('');
        expect(screen.getByText('Holiday added successfully!')).toBeInTheDocument();
      });
    });

    test('should keep form values on storage operation failure', async () => {
      // GIVEN: Storage operation fails
      mockStorageError = {
        success: false,
        type: 'QUOTA_EXCEEDED',
        userMessage: 'Storage space is full. Please clear some data or try again later.'
      };

      render(<HolidayForm />);

      const nameInput = screen.getByLabelText('Holiday Name');
      const dateInput = screen.getByLabelText('Holiday Date');
      const addButton = screen.getByRole('button', { name: 'Add Holiday' });

      // WHEN: User submits form but storage fails
      await user.type(nameInput, 'Test Holiday');
      await user.type(dateInput, '2025-12-25');
      await user.click(addButton);

      // THEN: Should keep form values AND show error message
      await waitFor(() => {
        expect(nameInput).toHaveValue('Test Holiday');
        expect(dateInput).toHaveValue('2025-12-25');
        expect(screen.getByText(mockStorageError.userMessage)).toBeInTheDocument();
      });
    });
  });

  describe('Multiple Storage Operations', () => {
    test('should handle rapid successive storage operations', async () => {
      // GIVEN: Storage succeeds
      mockStorageError = null;

      render(<HolidayForm />);

      const nameInput = screen.getByLabelText('Holiday Name');
      const dateInput = screen.getByLabelText('Holiday Date');
      const addButton = screen.getByRole('button', { name: 'Add Holiday' });

      // WHEN: User submits multiple holidays rapidly
      await user.type(nameInput, 'Holiday 1');
      await user.type(dateInput, '2025-12-25');
      await user.click(addButton);

      // Should show first success message
      await waitFor(() => {
        expect(screen.getByText('Holiday added successfully!')).toBeInTheDocument();
      });

      // Submit second holiday before first message clears
      await user.clear(nameInput);
      await user.type(nameInput, 'Holiday 2');
      await user.clear(dateInput);
      await user.type(dateInput, '2025-01-01');
      await user.click(addButton);

      // Should update with second success message
      await waitFor(() => {
        expect(screen.getByText('Holiday added successfully!')).toBeInTheDocument();
      });
    });
  });
});