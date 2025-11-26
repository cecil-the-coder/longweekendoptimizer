/**
 * Component Integration Tests: Holiday Management (AC2)
 *
 * Tests the complete holiday addition workflow and integration
 *
 * Test ID: 1.2-COMP-003
 * Story: 1.2 - Holiday Input UI
 * Acceptance Criteria: 2
 * Status: RED (failing - components not implemented)
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HolidayApp } from '../../src/components/HolidayApp';

// Mock holiday data and context
const mockHolidays = [];
const mockAddHoliday = vi.fn();
const mockDeleteHoliday = vi.fn();

vi.mock('../../src/hooks/useHolidays', () => ({
  useHolidays: () => ({
    addHoliday: mockAddHoliday,
    deleteHoliday: mockDeleteHoliday,
    holidays: mockHolidays,
  }),
}));

describe('Holiday Addition Integration Tests', () => {
  beforeEach(() => {
    mockAddHoliday.mockClear();
    mockDeleteHoliday.mockClear();
    mockHolidays.length = 0; // Clear array
  });

  describe('AC2: Holiday Addition Workflow', () => {
    test('should add holiday when form is submitted with valid data', async () => {
      // GIVEN: User has valid holiday data
      // WHEN: User fills form and clicks Add Holiday
      // THEN: Holiday should be added to the list

      const user = userEvent.setup();
      render(<HolidayApp />);

      // Check initial state - empty list
      expect(screen.getByTestId('empty-holiday-list')).toBeInTheDocument();

      // Fill in holiday form
      const nameInput = screen.getByTestId('holiday-name');
      const dateInput = screen.getByTestId('holiday-date');
      const addButton = screen.getByTestId('add-holiday');

      await user.type(nameInput, 'Thanksgiving');
      await user.type(dateInput, '2025-11-27');

      // Initially should mock empty holidays
      vi.mocked(require('../../src/hooks/useHolidays').useHolidays).mockReturnValue({
        addHoliday: mockAddHoliday,
        deleteHoliday: mockDeleteHoliday,
        holidays: mockHolidays,
      });

      // Submit form
      await user.click(addButton);

      // Should call addHoliday with correct data
      expect(mockAddHoliday).toHaveBeenCalledWith({
        name: 'Thanksgiving',
        date: '2025-11-27',
      });

      // Form should be cleared after submission
      await waitFor(() => {
        expect(screen.getByTestId('holiday-name')).toHaveValue('');
        expect(screen.getByTestId('holiday-date')).toHaveValue('');
      });
    });

    test('should display added holiday in the list immediately', async () => {
      // GIVEN: User adds a new holiday
      // WHEN: addHoliday is called with holiday data
      // THEN: Holiday should appear in the list

      const user = userEvent.setup();

      // Mock the updated holidays array after addition
      const updatedHolidays = [
        { id: 'test-1', name: 'Thanksgiving', date: '2025-11-27' }
      ];

      vi.mocked(require('../../src/hooks/useHolidays').useHolidays).mockReturnValue({
        addHoliday: mockAddHoliday,
        deleteHoliday: mockDeleteHoliday,
        holidays: updatedHolidays,
      });

      render(<HolidayApp />);

      // Wait for the holiday to appear in the list
      await waitFor(() => {
        expect(screen.getByText('Thanksgiving')).toBeInTheDocument();
      });

      // Should show formatted date
      expect(screen.getByText(/Thanksgiving - Thursday.*Nov.*27.*2025/i)).toBeInTheDocument();

      // Should not show empty message
      expect(screen.queryByTestId('empty-holiday-list')).not.toBeInTheDocument();
    });

    test('should add multiple holidays sequentially', async () => {
      // GIVEN: User adds multiple holidays
      // WHEN: Form is submitted multiple times
      // THEN: All holidays should be added and displayed

      const user = userEvent.setup();

      // Mock holiday addition sequence
      const holidaysAfterFirst = [
        { id: 'test-1', name: 'Thanksgiving', date: '2025-11-27' }
      ];

      const holidaysAfterSecond = [
        { id: 'test-1', name: 'Thanksgiving', date: '2025-11-27' },
        { id: 'test-2', name: 'Christmas', date: '2025-12-25' }
      ];

      render(<HolidayApp />);

      // Add first holiday
      vi.mocked(require('../../src/hooks/useHolidays').useHolidays).mockReturnValue({
        addHoliday: mockAddHoliday,
        deleteHoliday: mockDeleteHoliday,
        holidays: holidaysAfterFirst,
      });

      await waitFor(() => {
        expect(screen.getByText('Thanksgiving')).toBeInTheDocument();
      });

      // Add second holiday
      vi.mocked(require('../../src/hooks/useHolidays').useHolidays).mockReturnValue({
        addHoliday: mockAddHoliday,
        deleteHoliday: mockDeleteHoliday,
        holidays: holidaysAfterSecond,
      });

      await waitFor(() => {
        expect(screen.getByText('Christmas')).toBeInTheDocument();
      });

      // Both holidays should be visible
      expect(screen.getByText('Thanksgiving')).toBeInTheDocument();
      expect(screen.getByText('Christmas')).toBeInTheDocument();

      // Should have two holiday items
      const holidayItems = screen.getAllByTestId('holiday-item');
      expect(holidayItems).toHaveLength(2);
    });

    test('should handle holiday addition edge cases', async () => {
      // GIVEN: User adds holiday with special characters or edge cases
      // WHEN: Form is submitted with various input types
      // THEN: Should handle gracefully

      const user = userEvent.setup();
      render(<HolidayApp />);

      // Test case 1: Holiday name with special characters
      const nameInput = screen.getByTestId('holiday-name');
      const dateInput = screen.getByTestId('holiday-date');
      const addButton = screen.getByTestId('add-holiday');

      await user.clear(nameInput);
      await user.clear(dateInput);

      await user.type(nameInput, "St. Patrick's Day");
      await user.type(dateInput, '2025-03-17');
      await user.click(addButton);

      expect(mockAddHoliday).toHaveBeenCalledWith({
        name: "St. Patrick's Day",
        date: '2025-03-17',
      });

      mockAddHoliday.mockClear();

      // Test case 2: Holiday name with numbers
      await user.clear(nameInput);
      await user.clear(dateInput);

      await user.type(nameInput, 'July 4th');
      await user.type(dateInput, '2025-07-04');
      await user.click(addButton);

      expect(mockAddHoliday).toHaveBeenCalledWith({
        name: 'July 4th',
        date: '2025-07-04',
      });
    });

    test('should maintain form state during addition process', async () => {
      // GIVEN: User is in the middle of filling form
      // WHEN: User interacts with form partially
      // THEN: Form should maintain state until submission

      const user = userEvent.setup();
      render(<HolidayApp />);

      const nameInput = screen.getByTestId('holiday-name');
      const dateInput = screen.getByTestId('holiday-date');

      // Start filling form
      await user.type(nameInput, 'New Year');
      await user.type(nameInput, "'s");

      // Partial input should be preserved
      expect(nameInput).toHaveValue("New Year's");

      // Add date
      await user.type(dateInput, '2026');
      expect(dateInput).toHaveValue('2026');

      // Form should still be incomplete (button disabled)
      expect(screen.getByTestId('add-holiday')).toBeDisabled();
    });

    test('should handle form submission errors gracefully', async () => {
      // GIVEN: Form submission encounters an error
      // WHEN: addHoliday throws an error
      // THEN: Should display error message to user

      const user = userEvent.setup();

      const errorMessage = 'Failed to add holiday. Please try again.';
      mockAddHoliday.mockRejectedValue(new Error(errorMessage));

      // Mock error display component
      vi.mocked(console).error = vi.fn();

      render(<HolidayApp />);

      const nameInput = screen.getByTestId('holiday-name');
      const dateInput = screen.getByTestId('holiday-date');
      const addButton = screen.getByTestId('add-holiday');

      await user.type(nameInput, 'Error Holiday');
      await user.type(dateInput, '2025-12-25');
      await user.click(addButton);

      // Error should be caught and displayed
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
        expect(screen.getByTestId('error-message')).toHaveTextContent(/error/i);
      });

      expect(console.error).toHaveBeenCalled();
    });

    test('should prevent duplicate holiday submissions', async () => {
      // GIVEN: User tries to submit form multiple times quickly
      // WHEN: Add Holiday button is clicked rapidly
      // THEN: Should prevent duplicate submissions

      const user = userEvent.setup();
      render(<HolidayApp />);

      const nameInput = screen.getByTestId('holiday-name');
      const dateInput = screen.getByTestId('holiday-date');
      const addButton = screen.getByTestId('add-holiday');

      // Fill form
      await user.type(nameInput, 'Quick Submit');
      await user.type(dateInput, '2025-06-15');

      // Double-click rapidly
      await user.dblClick(addButton);

      // Should only call addHoliday once (debounced/controlled)
      expect(mockAddHoliday).toHaveBeenCalledTimes(1);
    });
  });

  describe('Form-List Integration', () => {
    test('should update UI immediately when holiday is added', async () => {
      // GIVEN: Connected form and list components
      // WHEN: Holiday is added through form
      // THEN: List should update without page refresh

      const user = userEvent.setup();

      // Start with empty holidays
      vi.mocked(require('../../src/hooks/useHolidays').useHolidays).mockReturnValue({
        addHoliday: mockAddHoliday,
        deleteHoliday: mockDeleteHoliday,
        holidays: [],
      });

      render(<HolidayApp />);

      // Should show empty state
      expect(screen.getByTestId('empty-holiday-list')).toBeInTheDocument();

      // Mock updated state after addition
      vi.mocked(require('../../src/hooks/useHolidays').useHolidays).mockReturnValue({
        addHoliday: mockAddHoliday,
        deleteHoliday: mockDeleteHoliday,
        holidays: [{ id: 'new-1', name: 'March Holiday', date: '2025-03-20' }],
      });

      await waitFor(() => {
        expect(screen.getByText('March Holiday')).toBeInTheDocument();
      });

      // Empty state should be gone
      expect(screen.queryByTestId('empty-holiday-list')).not.toBeInTheDocument();
    });

    test('should maintain focus order after holiday addition', async () => {
      // GIVEN: User adds holiday via keyboard
      // WHEN: Form is submitted and holiday appears
      // THEN: Focus should return to form for next entry

      const user = userEvent.setup();
      render(<HolidayApp />);

      const nameInput = screen.getByTestId('holiday-name');
      const dateInput = screen.getByTestId('holiday-date');
      const addButton = screen.getByTestId('add-holiday');

      // Tab through form and fill with keyboard
      await user.tab();
      expect(nameInput).toHaveFocus();

      await user.keyboard('Test Holiday');
      await user.tab();
      expect(dateInput).toHaveFocus();

      await user.keyboard('2025-05-15');
      await user.tab();
      expect(addButton).toHaveFocus();

      await user.keyboard('{Enter}');

      // After submission, focus should return to name input for next entry
      await waitFor(() => {
        expect(nameInput).toHaveFocus();
      });
    });
  });
});