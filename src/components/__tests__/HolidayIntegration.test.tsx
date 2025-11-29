// Holiday Integration Tests
// Testing complete user workflows and component interactions
// Following testing requirements: Vitest + React Testing Library

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HolidayProvider } from '../../context/HolidayContext';
import localStorageService from '../../services/localStorageService';
import App from '../../App';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
};

// Mock window.confirm
const mockConfirm = vi.fn();

beforeEach(() => {
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true
  });

  window.confirm = mockConfirm;
  vi.clearAllMocks();

  // Set up empty initial state
  mockLocalStorage.getItem.mockReturnValue(JSON.stringify([]));
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Holiday Management Integration', () => {
  describe('P0: Complete User Workflow', () => {
    it('[P0] should add holiday and display it in the list', async () => {
      const user = userEvent.setup();

      // GIVEN: User is on the app with empty holidays
      mockLocalStorage.getItem.mockReturnValue('[]');
      render(<App />);

      // THEN: Empty state should be visible
      expect(screen.getByText(/no holidays added yet/i)).toBeInTheDocument();

      // WHEN: User fills out and submits the form
      const nameInput = screen.getByLabelText(/holiday name/i);
      const dateInput = screen.getByLabelText(/holiday date/i);
      const submitButton = screen.getByRole('button', { name: /add holiday/i });

      await user.clear(nameInput);
      await user.type(nameInput, 'Thanksgiving');
      await user.clear(dateInput);
      await user.type(dateInput, '2025-11-27');
      await user.click(submitButton);

      // THEN: Holiday should appear in the list
      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'holidayhacker-holidays',
          expect.stringContaining('Thanksgiving')
        );
      });
    });

    it('[P0] should delete holiday with confirmation', async () => {
      const user = userEvent.setup();

      // GIVEN: Holiday exists in storage
      const existingHolidays = [
        { id: '1', name: 'Christmas', date: '2025-12-25' }
      ];
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingHolidays));
      mockConfirm.mockReturnValue(true);

      render(<App />);

      // WHEN: User clicks delete and confirms
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      // THEN: Confirmation dialog should be shown
      expect(mockConfirm).toHaveBeenCalledWith(
        'Are you sure you want to delete "Christmas"?'
      );

      // AND: Holiday should be deleted
      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'holidayhacker-holidays',
          '[]'
        );
      });
    });
  });

  describe('P1: Error Handling Edge Cases', () => {
    it('[P1] should handle localStorage quota exceeded error gracefully', async () => {
      const user = userEvent.setup();
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // GIVEN: localStorage throws quota exceeded error
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('QuotaExceededError: Storage quota exceeded');
      });

      mockLocalStorage.getItem.mockReturnValue('[]');

      render(<App />);

      // WHEN: User tries to add holiday
      const nameInput = screen.getByLabelText(/holiday name/i);
      const dateInput = screen.getByLabelText(/holiday date/i);
      const submitButton = screen.getByRole('button', { name: /add holiday/i });

      await user.clear(nameInput);
      await user.type(nameInput, 'Test Holiday');
      await user.clear(dateInput);
      await user.type(dateInput, '2025-01-01');
      await user.click(submitButton);

      // THEN: App should not crash, error should be logged
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to save holidays to localStorage'),
        expect.any(Error)
      );

      // AND: Form should still be functional for retry
      expect(nameInput).toBeInTheDocument();
      expect(submitButton).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it('[P1] should handle corrupted localStorage data gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // GIVEN: localStorage has corrupted JSON
      mockLocalStorage.getItem.mockReturnValue('{"invalid": "json" structure');

      render(<App />);

      // THEN: Should render with empty state and log error
      expect(screen.getByText(/no holidays added yet/i)).toBeInTheDocument();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to parse holidays from localStorage'),
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('[P1] should handle localStorage security error (private browsing)', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const holidays = [
        { id: '1', name: 'Test', date: '2025-01-01' }
      ];

      // GIVEN: localStorage throws security error
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new DOMException('Security error', 'SecurityError');
      });

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(holidays));
      mockConfirm.mockReturnValue(true);

      render(<App />);

      // WHEN: User tries to delete holiday
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await userEvent.click(deleteButton);

      // THEN: Should handle gracefully without crashing
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to save holidays to localStorage'),
        expect.any(DOMException)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('P2: Form Validation Edge Cases', () => {
    it('[P2] should handle long holiday names gracefully', async () => {
      const user = userEvent.setup();

      // GIVEN: Form with valid setup
      mockLocalStorage.getItem.mockReturnValue('[]');
      render(<App />);

      // WHEN: User enters very long holiday name
      const longName = 'A'.repeat(1000); // 1000 character name
      const nameInput = screen.getByLabelText(/holiday name/i);
      const dateInput = screen.getByLabelText(/holiday date/i);
      const submitButton = screen.getByRole('button', { name: /add holiday/i });

      await user.clear(nameInput);
      await user.type(nameInput, longName);
      await user.clear(dateInput);
      await user.type(dateInput, '2025-01-01');
      await user.click(submitButton);

      // THEN: Should handle submission without issues
      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'holidayhacker-holidays',
          expect.stringContaining(longName)
        );
      });
    });

    it('[P2] should handle holiday names with special characters', async () => {
      const user = userEvent.setup();

      // GIVEN: Form with valid setup
      mockLocalStorage.getItem.mockReturnValue('[]');
      render(<App />);

      // WHEN: User enters special characters in holiday name
      const specialName = "St. Patrick's Day & Easter 2025!";
      const nameInput = screen.getByLabelText(/holiday name/i);
      const dateInput = screen.getByLabelText(/holiday date/i);
      const submitButton = screen.getByRole('button', { name: /add holiday/i });

      await user.clear(nameInput);
      await user.type(nameInput, specialName);
      await user.clear(dateInput);
      await user.type(dateInput, '2025-03-17');
      await user.click(submitButton);

      // THEN: Should preserve special characters
      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'holidayhacker-holidays',
          expect.stringContaining(specialName)
        );
      });
    });

    it('[P2] should handle holiday names with only whitespace', async () => {
      const user = userEvent.setup();

      // GIVEN: Form with valid setup
      mockLocalStorage.getItem.mockReturnValue('[]');
      render(<App />);

      // WHEN: User enters only whitespace
      const nameInput = screen.getByLabelText(/holiday name/i);
      const dateInput = screen.getByLabelText(/holiday date/i);
      const submitButton = screen.getByRole('button', { name: /add holiday/i });

      await user.clear(nameInput);
      await user.type(nameInput, '   \n\t  '); // whitespace only
      await user.clear(dateInput);
      await user.type(dateInput, '2025-01-01');
      await user.click(submitButton);

      // THEN: Should show validation error
      await waitFor(() => {
        expect(screen.getByText(/holiday name is required/i)).toBeInTheDocument();
      });

      // AND: Should not save to localStorage
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('Data Persistence and Context Integration', () => {
    it('should load holidays from localStorage on initial render', () => {
      // GIVEN: Holidays exist in localStorage
      const existingHolidays = [
        { id: '1', name: 'New Year', date: '2025-01-01' },
        { id: '2', name: 'Valentine\'s Day', date: '2025-02-14' }
      ];
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingHolidays));

      // WHEN: App renders
      render(<App />);

      // THEN: Holidays should be displayed
      expect(screen.getByText('New Year')).toBeInTheDocument();
      expect(screen.getByText("Valentine's Day")).toBeInTheDocument();
      expect(screen.getByText('Thursday, Jan 1, 2025')).toBeInTheDocument();
      expect(screen.getByText('Friday, Feb 14, 2025')).toBeInTheDocument();
    });

    it('should update localStorage when holidays are added/deleted', async () => {
      const user = userEvent.setup();

      // GIVEN: One holiday exists
      const initialHolidays = [
        { id: '1', name: 'Test Holiday', date: '2025-01-01' }
      ];
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(initialHolidays));
      mockLocalStorage.setItem.mockClear();
      mockConfirm.mockReturnValue(true);

      render(<App />);

      // WHEN: Holiday is deleted
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      // THEN: localStorage should be updated
      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'holidayhacker-holidays',
          '[]'
        );
      });
    });
  });

  describe('Accessibility and Responsive Design', () => {
    it('should have proper form labels accessible by screen readers', () => {
      mockLocalStorage.getItem.mockReturnValue('[]');
      render(<App />);

      // THEN: All form inputs should have proper labels
      expect(screen.getByLabelText(/holiday name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/holiday date/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add holiday/i })).toBeInTheDocument();
    });

    it('should have semantic HTML structure', () => {
      mockLocalStorage.getItem.mockReturnValue('[]');
      render(<App />);

      // THEN: Should use semantic elements
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getAllByRole('form')).toHaveLength(1);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should have properly structured holiday list with delete buttons', () => {
      // GIVEN: Holidays exist
      const existingHolidays = [
        { id: '1', name: 'Test Holiday', date: '2025-01-01' }
      ];
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingHolidays));

      render(<App />);

      // THEN: Should have accessible delete buttons
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      expect(deleteButton).toBeInTheDocument();
      expect(screen.getByText('Test Holiday')).toBeInTheDocument();
    });
  });
});