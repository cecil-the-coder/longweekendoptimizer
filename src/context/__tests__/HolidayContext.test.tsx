// Holiday Context Tests
// Testing enhanced HolidayContext with persistence integration and error handling
// Following testing requirements: Vitest + React Testing Library for component testing

import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { vi, beforeEach, afterEach } from 'vitest';
import { HolidayProvider, HolidayContext } from '../HolidayContext';
import { Holiday } from '../HolidayContext';
import * as localStorageService from '../../services/localStorageService';

// Mock the localStorageService
vi.mock('../../services/localStorageService');

// Mock crypto.randomUUID for consistent test results
const mockUUID = 'test-uuid-12345';
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: vi.fn(() => mockUUID)
  },
  writable: true
});

// Mock timers for setTimeout tests
vi.useFakeTimers();

describe('HolidayContext', () => {
  const mockHolidays: Holiday[] = [
    { id: '1', name: 'Thanksgiving', date: '2025-11-27' },
    { id: '2', name: 'Christmas', date: '2025-12-25' }
  ];

  // Wrapper component to test context values
  const TestComponent: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    const context = React.useContext(HolidayContext);
    if (!context) {
      throw new Error('Test component must be used within HolidayProvider');
    }
    return (
      <div>
        <div data-testid="holidays-count">{context.holidays.length}</div>
        <div data-testid="storage-available">{context.isLocalStorageAvailable.toString()}</div>
        <div data-testid="storage-error">{context.storageError?.userMessage || 'no-error'}</div>
        {children}
      </div>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementations
    vi.mocked(localStorageService.isLocalStorageAvailable).mockReturnValue(true);
    vi.mocked(localStorageService.loadHolidays).mockReturnValue({
      holidays: mockHolidays,
      error: null,
      hadCorruption: false
    });
    vi.mocked(localStorageService.saveHolidays).mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllTimers();
  });

  describe('Initialization and Loading', () => {
    it('should load holidays from localStorage on mount', async () => {
      render(
        <HolidayProvider>
          <TestComponent />
        </HolidayProvider>
      );

      await waitFor(() => {
        expect(localStorageService.loadHolidays).toHaveBeenCalledTimes(1);
      });

      expect(screen.getByTestId('holidays-count')).toHaveTextContent('2');
      expect(screen.getByTestId('storage-available')).toHaveTextContent('true');
    });

    it('should handle empty holidays array from localStorage', async () => {
      vi.mocked(localStorageService.loadHolidays).mockReturnValue({
        holidays: [],
        error: null,
        hadCorruption: false
      });

      render(
        <HolidayProvider>
          <TestComponent />
        </HolidayProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('holidays-count')).toHaveTextContent('0');
      });
    });

    it('should handle localStorage unavailable scenario', async () => {
      vi.mocked(localStorageService.isLocalStorageAvailable).mockReturnValue(false);
      vi.mocked(localStorageService.loadHolidays).mockReturnValue({
        holidays: [],
        error: null,
        hadCorruption: false
      });

      render(
        <HolidayProvider>
          <TestComponent />
        </HolidayProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('storage-available')).toHaveTextContent('false');
      });

      expect(localStorageService.loadHolidays).toHaveBeenCalledTimes(1);
    });

    it('should handle corruption errors on load with auto-clear', async () => {
      const corruptionError = {
        type: 'CORRUPTION_ERROR' as const,
        message: 'Data corruption detected',
        userMessage: 'Saved holiday data was corrupted. Starting with an empty list.'
      };

      vi.mocked(localStorageService.loadHolidays).mockReturnValue({
        holidays: [],
        error: corruptionError,
        hadCorruption: true
      });

      render(
        <HolidayProvider>
          <TestComponent />
        </HolidayProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('storage-error')).toHaveTextContent(corruptionError.userMessage);
      });

      // Should auto-clear after 5 seconds
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(screen.getByTestId('storage-error')).toHaveTextContent('no-error');
      });
    });
  });

  describe('addHoliday', () => {
    it('should add holiday successfully and save to localStorage', async () => {
      let contextValue: any = null;

      const ContextConsumer: React.FC = () => {
        contextValue = React.useContext(HolidayContext);
        return null;
      };

      render(
        <HolidayProvider>
          <TestComponent />
          <ContextConsumer />
        </HolidayProvider>
      );

      await waitFor(() => {
        expect(contextValue).not.toBeNull();
      });

      act(() => {
        const result = contextValue.addHoliday('New Year', '2026-01-01');
        expect(result).toBeNull(); // Success
      });

      expect(localStorageService.saveHolidays).toHaveBeenCalledWith([
        ...mockHolidays,
        { id: mockUUID, name: 'New Year', date: '2026-01-01' }
      ]);
    });

    it('should handle save errors when adding holiday', async () => {
      const saveError = {
        type: 'QUOTA_EXCEEDED' as const,
        message: 'Storage quota exceeded',
        userMessage: 'Storage is full. Please clear some browser data or remove holidays to free up space.'
      };

      vi.mocked(localStorageService.saveHolidays).mockReturnValue(saveError);

      let contextValue: any = null;

      const ContextConsumer: React.FC = () => {
        contextValue = React.useContext(HolidayContext);
        return null;
      };

      render(
        <HolidayProvider>
          <TestComponent />
          <ContextConsumer />
        </HolidayProvider>
      );

      await waitFor(() => {
        expect(contextValue).not.toBeNull();
      });

      act(() => {
        const result = contextValue.addHoliday('New Year', '2026-01-01');
        expect(result).toEqual(saveError);
      });

      // Error should be set in context state
      await waitFor(() => {
        expect(screen.getByTestId('storage-error')).toHaveTextContent(saveError.userMessage);
      });

      // Should auto-clear after 5 seconds
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(screen.getByTestId('storage-error')).toHaveTextContent('no-error');
      });
    });

    it('should generate UUID with fallback when crypto.randomUUID fails', async () => {
      // Mock crypto.randomUUID to throw error
      vi.mocked(crypto.randomUUID).mockImplementation(() => {
        throw new Error('UUID not supported');
      });

      let contextValue: any = null;

      const ContextConsumer: React.FC = () => {
        contextValue = React.useContext(HolidayContext);
        return null;
      };

      render(
        <HolidayProvider>
          <TestComponent />
          <ContextConsumer />
        </HolidayProvider>
      );

      await waitFor(() => {
        expect(contextValue).not.toBeNull();
      });

      act(() => {
        contextValue.addHoliday('New Year', '2026-01-01');
      });

      expect(localStorageService.saveHolidays).toHaveBeenCalledTimes(1);

      // Check that fallback UUID was used (starts with 'id-')
      const savedHolidays = vi.mocked(localStorageService.saveHolidays).mock.calls[0][0];
      expect(savedHolidays[savedHolidays.length - 1].id).toMatch(/^id-\w+-\d+$/);
    });
  });

  describe('deleteHoliday', () => {
    it('should delete holiday successfully and save to localStorage', async () => {
      let contextValue: any = null;

      const ContextConsumer: React.FC = () => {
        contextValue = React.useContext(HolidayContext);
        return null;
      };

      render(
        <HolidayProvider>
          <TestComponent />
          <ContextConsumer />
        </HolidayProvider>
      );

      await waitFor(() => {
        expect(contextValue).not.toBeNull();
        expect(contextValue.holidays).toHaveLength(2);
      });

      act(() => {
        const result = contextValue.deleteHoliday('1');
        expect(result).toBeNull(); // Success
      });

      expect(localStorageService.saveHolidays).toHaveBeenCalledWith([
        { id: '2', name: 'Christmas', date: '2025-12-25' }
      ]);
    });

    it('should handle save errors when deleting holiday', async () => {
      const saveError = {
        type: 'SECURITY_ERROR' as const,
        message: 'Storage access denied',
        userMessage: 'Unable to access storage. Your browser may be in private mode or storage is disabled.'
      };

      vi.mocked(localStorageService.saveHolidays).mockReturnValue(saveError);

      let contextValue: any = null;

      const ContextConsumer: React.FC = () => {
        contextValue = React.useContext(HolidayContext);
        return null;
      };

      render(
        <HolidayProvider>
          <TestComponent />
          <ContextConsumer />
        </HolidayProvider>
      );

      await waitFor(() => {
        expect(contextValue).not.toBeNull();
      });

      act(() => {
        const result = contextValue.deleteHoliday('1');
        expect(result).toEqual(saveError);
      });

      // Error should be set in context state
      await waitFor(() => {
        expect(screen.getByTestId('storage-error')).toHaveTextContent(saveError.userMessage);
      });
    });
  });

  describe('clearStorageError', () => {
    it('should clear storage error when called', async () => {
      const saveError = {
        type: 'QUOTA_EXCEEDED' as const,
        message: 'Storage quota exceeded',
        userMessage: 'Storage is full. Please clear some browser data or remove holidays to free up space.'
      };

      vi.mocked(localStorageService.saveHolidays).mockReturnValue(saveError);

      let contextValue: any = null;

      const ContextConsumer: React.FC = () => {
        contextValue = React.useContext(HolidayContext);
        return null;
      };

      render(
        <HolidayProvider>
          <TestComponent />
          <ContextConsumer />
        </HolidayProvider>
      );

      await waitFor(() => {
        expect(contextValue).not.toBeNull();
      });

      // Trigger an error
      act(() => {
        contextValue.addHoliday('Test', '2025-01-01');
      });

      await waitFor(() => {
        expect(screen.getByTestId('storage-error')).toHaveTextContent(saveError.userMessage);
      });

      // Clear the error
      act(() => {
        contextValue.clearStorageError();
      });

      await waitFor(() => {
        expect(screen.getByTestId('storage-error')).toHaveTextContent('no-error');
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle localStorageService.loadHolidays throwing an error', async () => {
      vi.mocked(localStorageService.loadHolidays).mockImplementation(() => {
        throw new Error('Unexpected load error');
      });

      let consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      render(
        <HolidayProvider>
          <TestComponent />
        </HolidayProvider>
      );

      // Should not crash and should show empty state
      await waitFor(() => {
        expect(screen.getByTestId('holidays-count')).toHaveTextContent('0');
      });

      consoleSpy.mockRestore();
    });

    it('should maintain state integrity with rapid successive operations', async () => {
      let contextValue: any = null;

      const ContextConsumer: React.FC = () => {
        contextValue = React.useContext(HolidayContext);
        return null;
      };

      render(
        <HolidayProvider>
          <TestComponent />
          <ContextConsumer />
        </HolidayProvider>
      );

      await waitFor(() => {
        expect(contextValue).not.toBeNull();
      });

      // Rapidly add multiple holidays
      act(() => {
        contextValue.addHoliday('Holiday 1', '2025-01-01');
        contextValue.addHoliday('Holiday 2', '2025-01-02');
        contextValue.addHoliday('Holiday 3', '2025-01-03');
      });

      expect(localStorageService.saveHolidays).toHaveBeenCalledTimes(3);

      // Check that state is updated correctly
      expect(contextValue.holidays).toHaveLength(5); // 2 initial + 3 new
    });

    it('should handle corruption recovery logging', async () => {
      vi.mocked(localStorageService.loadHolidays).mockReturnValue({
        holidays: [],
        error: null,
        hadCorruption: true
      });

      let consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

      render(
        <HolidayProvider>
          <TestComponent />
        </HolidayProvider>
      );

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Holiday data corruption detected and recovered');
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Integration with localStorageService', () => {
    it('should integrate with isLocalStorageAvailable feature detection', async () => {
      vi.mocked(localStorageService.isLocalStorageAvailable).mockReturnValue(false);

      render(
        <HolidayProvider>
          <TestComponent />
        </HolidayProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('storage-available')).toHaveTextContent('false');
      });

      expect(localStorageService.isLocalStorageAvailable).toHaveBeenCalledTimes(1);
    });

    it('should propagate saveHolidays validation errors', async () => {
      const validationError = {
        type: 'GENERIC_ERROR' as const,
        message: 'Invalid holiday object detected',
        userMessage: 'Unable to save holidays due to invalid holiday data.'
      };

      vi.mocked(localStorageService.saveHolidays).mockReturnValue(validationError);

      let contextValue: any = null;

      const ContextConsumer: React.FC = () => {
        contextValue = React.useContext(HolidayContext);
        return null;
      };

      render(
        <HolidayProvider>
          <TestComponent />
          <ContextConsumer />
        </HolidayProvider>
      );

      await waitFor(() => {
        expect(contextValue).not.toBeNull();
      });

      const result = act(() => {
        return contextValue.addHoliday('', ''); // Invalid data that would trigger validation
      });

      await waitFor(() => {
        expect(screen.getByTestId('storage-error')).toHaveTextContent(validationError.userMessage);
      });
    });
  });
});