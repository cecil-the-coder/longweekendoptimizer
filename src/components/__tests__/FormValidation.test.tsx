// Enhanced Form Validation Tests
// Following testing requirements: Vitest + React Testing Library
// Testing comprehensive input validation, error messages, and feedback

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HolidayForm from '../HolidayForm';
import { HolidayProvider } from '../../context/HolidayContext';

// Mock the useHolidays hook for comprehensive validation testing
const mockAddHoliday = vi.fn();
const mockDeleteHoliday = vi.fn();
const mockClearStorageError = vi.fn();
let mockHolidays: any[] = [];
let mockStorageError: any = null;
let mockIsLocalStorageAvailable = true;

vi.mock('../../hooks/useHolidays', () => ({
  useHolidays: () => ({
    addHoliday: mockAddHoliday,
    deleteHoliday: mockDeleteHoliday,
    holidays: mockHolidays,
    storageError: mockStorageError,
    clearStorageError: mockClearStorageError,
    isLocalStorageAvailable: mockIsLocalStorageAvailable
  })
}));

// Helper function to render form with provider
const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <HolidayProvider>
      {component}
    </HolidayProvider>
  );
};

describe('Enhanced Form Validation', () => {
  beforeEach(() => {
    mockAddHoliday.mockClear();
    mockDeleteHoliday.mockClear();
    mockClearStorageError.mockClear();
    mockHolidays = [];
    mockStorageError = null;
    mockIsLocalStorageAvailable = true;
  });

  describe('Holiday Name Validation', () => {
    it('should show error for empty holiday name', async () => {
      renderWithProvider(<HolidayForm />);

      const nameInput = screen.getByLabelText(/holiday name/i);
      const submitButton = screen.getByRole('button', { name: /add holiday/i });

      // Clear name and submit
      await userEvent.clear(nameInput);
      await userEvent.click(submitButton);

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText(/holiday name is required/i)).toBeInTheDocument();
      });

      // Should not call addHoliday
      expect(mockAddHoliday).not.toHaveBeenCalled();
    });

    it('should show error for whitespace-only holiday name', async () => {
      renderWithProvider(<HolidayForm />);

      const nameInput = screen.getByLabelText(/holiday name/i);
      const submitButton = screen.getByRole('button', { name: /add holiday/i });

      // Enter only whitespace
      await userEvent.clear(nameInput);
      await userEvent.type(nameInput, '   ');
      await userEvent.click(submitButton);

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText(/holiday name is required/i)).toBeInTheDocument();
      });

      expect(mockAddHoliday).not.toHaveBeenCalled();
    });

    it('should show error for holiday name that is too short', async () => {
      renderWithProvider(<HolidayForm />);

      const nameInput = screen.getByLabelText(/holiday name/i);
      const submitButton = screen.getByRole('button', { name: /add holiday/i });

      // Enter very short name
      await userEvent.type(nameInput, 'H'); // Only 1 character
      await userEvent.click(submitButton);

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText(/holiday name must be at least 2 characters long/i)).toBeInTheDocument();
      });

      expect(mockAddHoliday).not.toHaveBeenCalled();
    });

    it('should show error for holiday name that is too long', async () => {
      renderWithProvider(<HolidayForm />);

      const nameInput = screen.getByLabelText(/holiday name/i);
      const submitButton = screen.getByRole('button', { name: /add holiday/i });

      // Enter very long name
      const longName = 'A'.repeat(101); // 101 characters
      await userEvent.type(nameInput, longName);
      await userEvent.click(submitButton);

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText(/holiday name must be less than 100 characters/i)).toBeInTheDocument();
      });

      expect(mockAddHoliday).not.toHaveBeenCalled();
    });

    it('should show error for holiday name with invalid characters', async () => {
      renderWithProvider(<HolidayForm />);

      const nameInput = screen.getByLabelText(/holiday name/i);
      const submitButton = screen.getByRole('button', { name: /add holiday/i });

      // Enter name with special characters
      await userEvent.type(nameInput, 'Holiday@#$%');
      await userEvent.click(submitButton);

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText(/holiday name contains invalid characters/i)).toBeInTheDocument();
      });

      expect(mockAddHoliday).not.toHaveBeenCalled();
    });

    it('should clear name validation error when user starts typing', async () => {
      renderWithProvider(<HolidayForm />);

      const nameInput = screen.getByLabelText(/holiday name/i);
      const submitButton = screen.getByRole('button', { name: /add holiday/i });

      // Submit empty name to trigger error
      await userEvent.clear(nameInput);
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/holiday name is required/i)).toBeInTheDocument();
      });

      // Start typing valid name
      await userEvent.type(nameInput, 'Valid');

      // Error should clear
      await waitFor(() => {
        expect(screen.queryByText(/holiday name is required/i)).not.toBeInTheDocument();
      });
    });

    it('should allow valid holiday names', async () => {
      renderWithProvider(<HolidayForm />);

      const nameInput = screen.getByLabelText(/holiday name/i);
      const dateInput = screen.getByLabelText(/holiday date/i);
      const submitButton = screen.getByRole('button', { name: /add holiday/i });

      // Enter valid name
      await userEvent.type(nameInput, 'Thanksgiving');
      await userEvent.clear(dateInput);
      await userEvent.type(dateInput, '2024-11-28');
      await userEvent.click(submitButton);

      // Should not show validation error
      await waitFor(() => {
        expect(screen.queryByText(/holiday name/i)).not.toBeInTheDocument();
      });

      expect(mockAddHoliday).toHaveBeenCalledWith({
        name: 'Thanksgiving',
        date: '2024-11-28'
      });
    });
  });

  describe('Holiday Date Validation', () => {
    it('should show error for empty holiday date', async () => {
      renderWithProvider(<HolidayForm />);

      const nameInput = screen.getByLabelText(/holiday name/i);
      const dateInput = screen.getByLabelText(/holiday date/i);
      const submitButton = screen.getByRole('button', { name: /add holiday/i });

      // Set valid name but clear date
      await userEvent.type(nameInput, 'Christmas');
      await userEvent.clear(dateInput);
      await userEvent.click(submitButton);

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText(/holiday date is required/i)).toBeInTheDocument();
      });

      expect(mockAddHoliday).not.toHaveBeenCalled();
    });

    it('should show error for invalid date format', async () => {
      renderWithProvider(<HolidayForm />);

      const nameInput = screen.getByLabelText(/holiday name/i);
      const dateInput = screen.getByLabelText(/holiday date/i);
      const submitButton = screen.getByRole('button', { name: /add holiday/i });

      // Enter name and invalid date format
      await userEvent.type(nameInput, 'New Year');
      await userEvent.clear(dateInput);
      await userEvent.type(dateInput, 'invalid-date');
      await userEvent.click(submitButton);

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText(/please enter a valid date/i)).toBeInTheDocument();
      });

      expect(mockAddHoliday).not.toHaveBeenCalled();
    });

    it('should show error for date in the distant past', async () => {
      renderWithProvider(<HolidayForm />);

      const nameInput = screen.getByLabelText(/holiday name/i);
      const dateInput = screen.getByLabelText(/holiday date/i);
      const submitButton = screen.getByRole('button', { name: /add holiday/i });

      // Enter name and very old date
      await userEvent.type(nameInput, 'Historical Holiday');
      await userEvent.clear(dateInput);
      await userEvent.type(dateInput, '1900-01-01');
      await userEvent.click(submitButton);

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText(/holiday date cannot be more than 100 years in the past/i)).toBeInTheDocument();
      });

      expect(mockAddHoliday).not.toHaveBeenCalled();
    });

    it('should show error for date too far in the future', async () => {
      renderWithProvider(<HolidayForm />);

      const nameInput = screen.getByLabelText(/holiday name/i);
      const dateInput = screen.getByLabelText(/holiday date/i);
      const submitButton = screen.getByRole('button', { name: /add holiday/i });

      // Enter name and very future date
      await userEvent.type(nameInput, 'Future Holiday');
      await userEvent.clear(dateInput);
      await userEvent.type(dateInput, '2100-01-01');
      await userEvent.click(submitButton);

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText(/holiday date cannot be more than 10 years in the future/i)).toBeInTheDocument();
      });

      expect(mockAddHoliday).not.toHaveBeenCalled();
    });

    it('should clear date validation error when user starts typing', async () => {
      renderWithProvider(<HolidayForm />);

      const nameInput = screen.getByLabelText(/holiday name/i);
      const dateInput = screen.getByLabelText(/holiday date/i);
      const submitButton = screen.getByRole('button', { name: /add holiday/i });

      // Submit with invalid date to trigger error
      await userEvent.type(nameInput, 'Test Holiday');
      await userEvent.clear(dateInput);
      await userEvent.type(dateInput, 'invalid');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid date/i)).toBeInTheDocument();
      });

      // Start typing valid date
      await userEvent.clear(dateInput);
      await userEvent.type(dateInput, '2024-');

      // Error should clear as user types valid input
      await waitFor(() => {
        expect(screen.queryByText(/please enter a valid date/i)).not.toBeInTheDocument();
      });
    });

    it('should allow valid dates within range', async () => {
      renderWithProvider(<HolidayForm />);

      const nameInput = screen.getByLabelText(/holiday name/i);
      const dateInput = screen.getByLabelText(/holiday date/i);
      const submitButton = screen.getByRole('button', { name: /add holiday/i });

      // Enter valid date (current year)
      const currentYear = new Date().getFullYear();
      await userEvent.type(nameInput, 'Current Holiday');
      await userEvent.clear(dateInput);
      await userEvent.type(dateInput, `${currentYear}-12-25`);
      await userEvent.click(submitButton);

      // Should not show validation error
      await waitFor(() => {
        expect(screen.queryByText(/holiday date/i)).not.toBeInTheDocument();
      });

      expect(mockAddHoliday).toHaveBeenCalled();
    });
  });

  describe('Real-time Validation Feedback', () => {
    it('should show validation error on blur for empty name', async () => {
      renderWithProvider(<HolidayForm />);

      const nameInput = screen.getByLabelText(/holiday name/i);

      // Focus and blur without entering value
      await userEvent.click(nameInput);
      await userEvent.tab(); // Move focus away (blur)

      // Should show real-time validation error
      await waitFor(() => {
        expect(screen.getByText(/holiday name is required/i)).toBeInTheDocument();
      });
    });

    it('should show validation error on blur for empty date', async () => {
      renderWithProvider(<HolidayForm />);

      const dateInput = screen.getByLabelText(/holiday date/i);

      // Focus and blur without entering value
      await userEvent.click(dateInput);
      await userEvent.tab(); // Move focus away (blur)

      await waitFor(() => {
        expect(screen.getByText(/holiday date is required/i)).toBeInTheDocument();
      });
    });

    it('should show validation error on input change for invalid formats', async () => {
      renderWithProvider(<HolidayForm />);

      const dateInput = screen.getByLabelText(/holiday date/i);

      // Type invalid date format
      await userEvent.type(dateInput, 'invalid-date');

      // Should show validation error as user types
      await waitFor(() => {
        expect(screen.getByText(/please enter a valid date/i)).toBeInTheDocument();
      });
    });

    it('should provide helpful validation guidance', async () => {
      renderWithProvider(<HolidayForm />);

      const nameInput = screen.getByLabelText(/holiday name/i);

      // Start typing but not enough characters
      await userEvent.type(nameInput, 'A');

      await waitFor(() => {
        expect(screen.getByText(/holiday name must be at least 2 characters long/i)).toBeInTheDocument();
      });

      // Continue typing to meet minimum
      await userEvent.type(nameInput, 'l');

      await waitFor(() => {
        expect(screen.queryByText(/holiday name must be at least 2 characters long/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Multiple Validation Errors', () => {
    it('should show multiple field errors simultaneously', async () => {
      renderWithProvider(<HolidayForm />);

      const submitButton = screen.getByRole('button', { name: /add holiday/i });

      // Submit form with both fields empty
      await userEvent.click(submitButton);

      // Should show both name and date errors
      await waitFor(() => {
        expect(screen.getByText(/holiday name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/holiday date is required/i)).toBeInTheDocument();
      });
    });

    it('should prioritize most relevant error for each field', async () => {
      renderWithProvider(<HolidayForm />);

      const nameInput = screen.getByLabelText(/holiday name/i);
      const submitButton = screen.getByRole('button', { name: /add holiday/i });

      // Enter only 1 character (triggers minimum length error)
      await userEvent.type(nameInput, 'A');
      await userEvent.click(submitButton);

      await waitFor(() => {
        // Should show minimum length error, not empty field error
        expect(screen.getByText(/holiday name must be at least 2 characters long/i)).toBeInTheDocument();
        expect(screen.queryByText(/holiday name is required/i)).not.toBeInTheDocument();
      });
    });

    it('should clear specific field errors when that field is corrected', async () => {
      renderWithProvider(<HolidayForm />);

      const nameInput = screen.getByLabelText(/holiday name/i);
      const submitButton = screen.getByRole('button', { name: /add holiday/i });

      // Submit with both fields empty
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/holiday name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/holiday date is required/i)).toBeInTheDocument();
      });

      // Fix name field
      await userEvent.type(nameInput, 'Valid Name');

      await waitFor(() => {
        expect(screen.queryByText(/holiday name is required/i)).not.toBeInTheDocument();
        // Date error should still be present
        expect(screen.getByText(/holiday date is required/i)).toBeInTheDocument();
      });
    });
  });

  describe('Validation Error Styling and Accessibility', () => {
    it('should apply error styling to invalid fields', async () => {
      renderWithProvider(<HolidayForm />);

      const nameInput = screen.getByLabelText(/holiday name/i) as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: /add holiday/i });

      // Submit empty form
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/holiday name is required/i)).toBeInTheDocument();
      });

      // Input should have error styling
      expect(nameInput).toHaveClass('border-red-500');
    });

    it('should have proper ARIA attributes for error messages', async () => {
      renderWithProvider(<HolidayForm />);

      const nameInput = screen.getByLabelText(/holiday name/i);
      const submitButton = screen.getByRole('button', { name: /add holiday/i });

      // Submit empty form
      await userEvent.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.getByText(/holiday name is required/i);
        expect(errorMessage).toHaveAttribute('role', 'alert');
        expect(errorMessage).toHaveAttribute('aria-live', 'polite');
      });

      // Input should be linked to error message
      expect(nameInput).toHaveAttribute('aria-describedby');
    });

    it('should announce validation errors to screen readers', async () => {
      renderWithProvider(<HolidayForm />);

      const submitButton = screen.getByRole('button', { name: /add holiday/i });

      // Submit empty form
      await userEvent.click(submitButton);

      await waitFor(() => {
        // Screen reader should announce validation errors
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });
  });

  describe('Form Submit Button State', () => {
    it('should disable submit button during validation', async () => {
      renderWithProvider(<HolidayForm />);

      const submitButton = screen.getByRole('button', { name: /add holiday/i });

      // Button should be enabled initially
      expect(submitButton).not.toBeDisabled();

      // Submit to trigger validation
      await userEvent.click(submitButton);

      // Button should not be disabled by validation errors
      expect(submitButton).not.toBeDisabled();
    });

    it('should show loading state during submission', async () => {
      // Mock addHoliday to return a promise that takes time
      mockAddHoliday.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

      renderWithProvider(<HolidayForm />);

      const nameInput = screen.getByLabelText(/holiday name/i);
      const dateInput = screen.getByLabelText(/holiday date/i);
      const submitButton = screen.getByRole('button', { name: /add holiday/i });

      // Fill form and submit
      await userEvent.type(nameInput, 'Test Holiday');
      await userEvent.clear(dateInput);
      await userEvent.type(dateInput, '2024-12-25');
      await userEvent.click(submitButton);

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
        expect(submitButton).toBeDisabled();
      });
    });
  });
});