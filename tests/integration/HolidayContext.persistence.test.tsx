/**
 * Integration Test: HolidayContext - Enhanced Persistence
 *
 * Tests the integration between HolidayContext and localStorageService
 * for automatic persistence and error propagation.
 *
 * Test ID: 1.3-INT-001
 * Priority: P0 (Persistence integration critical)
 * Story: 1.3 - Local Storage Persistence
 *
 * THIS FILE CONTAINS FAILING TESTS - RED PHASE
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { HolidayProvider, useHolidays } from '../../src/context/HolidayContext';
import type { Holiday } from '../../src/context/HolidayContext';

// Mock localStorageService
const mockLoadHolidays = vi.fn();
const mockSaveHolidays = vi.fn();

vi.mock('../../src/services/localStorageService', () => ({
  loadHolidays: mockLoadHolidays,
  saveHolidays: mockSaveHolidays,
}));

// Test wrapper component for context
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <HolidayProvider>{children}</HolidayProvider>
);

describe('HolidayContext - Enhanced Persistence Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('AC1: Adding holiday triggers immediate save with feedback', () => {
    it('should call saveHolidays when addHoliday is called', async () => {
      // GIVEN: Context provider is rendered
      mockSaveHolidays.mockReturnValue({ success: true });
      const { result } = renderHook(() => useHolidays(), { wrapper });

      // WHEN: Adding a holiday
      await act(async () => {
        const error = result.current.addHoliday('Test Holiday', '2025-12-25');

        // THEN: Should call saveHolidays with updated holiday list
        expect(error).toBeNull(); // Success case
        expect(mockSaveHolidays).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              name: 'Test Holiday',
              date: '2025-12-25'
            })
          ])
        );
      });
    });

    it('should return StorageError when save fails during addHoliday', async () => {
      // GIVEN: saveHolidays fails
      const mockError = {
        success: false,
        type: 'QUOTA_EXCEEDED',
        message: 'Storage quota exceeded',
        userMessage: 'Storage space is full. Please clear some data or try again later.'
      };
      mockSaveHolidays.mockReturnValue(mockError);

      const { result } = renderHook(() => useHolidays(), { wrapper });

      // WHEN: Adding a holiday with storage failure
      await act(async () => {
        const error = result.current.addHoliday('Test Holiday', '2025-12-25');

        // THEN: Should return the StorageError
        expect(error).toEqual(mockError);
        expect(mockSaveHolidays).toHaveBeenCalledTimes(1);
      });
    });

    it('should not add holiday to local state if save fails', async () => {
      // GIVEN: saveHolidays fails
      const mockError = {
        success: false,
        type: 'QUOTA_EXCEEDED',
        message: 'Storage quota exceeded',
        userMessage: 'Storage space is full. Please clear some data or try again later.'
      };
      mockSaveHolidays.mockReturnValue(mockError);

      const { result } = renderHook(() => useHolidays(), { wrapper });

      // WHEN: Attempting to add holiday with storage failure
      await act(async () => {
        result.current.addHoliday('Test Holiday', '2025-12-25');
      });

      // THEN: Holiday should not be added to local state
      expect(result.current.holidays).toHaveLength(0);
    });
  });

  describe('AC2: Deleting holiday triggers immediate save with feedback', () => {
    it('should call saveHolidays when deleteHoliday is called', async () => {
      // GIVEN: Context with existing holidays
      const initialHoliday: Holiday = {
        id: 'test-id-1',
        name: 'Test Holiday',
        date: '2025-12-25'
      };

      mockLoadHolidays.mockReturnValue([initialHoliday]);
      mockSaveHolidays.mockReturnValue({ success: true });

      const { result } = renderHook(() => useHolidays(), { wrapper });

      // Initialize with holiday
      await act(async () => {
        // Context should load initial holidays on mount
        expect(mockLoadHolidays).toHaveBeenCalled();
      });

      // WHEN: Deleting the holiday
      await act(async () => {
        const error = result.current.deleteHoliday('test-id-1');

        // THEN: Should call saveHolidays with empty array
        expect(error).toBeNull(); // Success case
        expect(mockSaveHolidays).toHaveBeenCalledWith([]);
        expect(result.current.holidays).toHaveLength(0);
      });
    });

    it('should return StorageError when save fails during deleteHoliday', async () => {
      // GIVEN: Context with existing holiday and save fails
      const initialHoliday: Holiday = {
        id: 'test-id-1',
        name: 'Test Holiday',
        date: '2025-12-25'
      };

      mockLoadHolidays.mockReturnValue([initialHoliday]);
      const mockError = {
        success: false,
        type: 'SECURITY_ERROR',
        message: 'Cannot write to storage',
        userMessage: 'Cannot save changes at this time.'
      };
      mockSaveHolidays.mockReturnValue(mockError);

      const { result } = renderHook(() => useHolidays(), { wrapper });

      // WHEN: Attempting to delete holiday with storage failure
      await act(async () => {
        const error = result.current.deleteHoliday('test-id-1');

        // THEN: Should return the StorageError
        expect(error).toEqual(mockError);
        // Holiday should remain in local state
        expect(result.current.holidays).toHaveLength(1);
      });
    });
  });

  describe('AC3: Automatic loading on application startup', () => {
    it('should load holidays from localStorage on provider mount', async () => {
      // GIVEN: localStorage has saved holidays
      const savedHolidays: Holiday[] = [
        {
          id: 'test-id-1',
          name: 'Saved Holiday 1',
          date: '2025-12-25'
        },
        {
          id: 'test-id-2',
          name: 'Saved Holiday 2',
          date: '2025-01-01'
        }
      ];

      mockLoadHolidays.mockReturnValue(savedHolidays);

      const { result } = renderHook(() => useHolidays(), { wrapper });

      // WHEN: Provider mounts
      await act(async () => {
        // Wait for useEffect to run
      });

      // THEN: Should load holidays from localStorage
      expect(mockLoadHolidays).toHaveBeenCalledTimes(1);
      expect(result.current.holidays).toEqual(savedHolidays);
    });

    it('should handle loading errors gracefully', async () => {
      // GIVEN: loadHolidays fails
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockLoadHolidays.mockImplementation(() => {
        throw new Error('Failed to load holidays');
      });

      const { result } = renderHook(() => useHolidays(), { wrapper });

      // WHEN: Provider mounts with loading error
      await act(async () => {
        // Wait for useEffect to run
      });

      // THEN: Should handle error and start with empty array
      expect(result.current.holidays).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to load holidays on startup:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should continue with empty state when localStorage unavailable', async () => {
      // GIVEN: localStorage is not available
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      mockLoadHolidays.mockReturnValue([]); // Should return empty array when unavailable

      const { result } = renderHook(() => useHolidays(), { wrapper });

      // WHEN: Provider mounts with unavailable storage
      await act(async () => {
        // Wait for useEffect to run
      });

      // THEN: Should start with empty holidays and continue normally
      expect(result.current.holidays).toEqual([]);
      // Enhanced version should warn about unavailability
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'localStorage is not available, starting with empty state'
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe('Error Propagation Chain', () => {
    it('should propagate storage errors to components for user feedback', async () => {
      // GIVEN: Various storage error scenarios
      const errorScenarios = [
        {
          name: 'Quota Exceeded',
          storageError: {
            success: false,
            type: 'QUOTA_EXCEEDED',
            message: 'Storage quota exceeded',
            userMessage: 'Storage space is full. Please clear some data or try again later.'
          }
        },
        {
          name: 'Security Error',
          storageError: {
            success: false,
            type: 'SECURITY_ERROR',
            message: 'Security error accessing storage',
            userMessage: 'Cannot save changes due to browser security restrictions.'
          }
        },
        {
          name: 'Storage Unavailable',
          storageError: {
            success: false,
            type: 'STORAGE_UNAVAILABLE',
            message: 'localStorage is not available',
            userMessage: 'Storage is not available. Changes cannot be saved.'
          }
        }
      ];

      errorScenarios.forEach(scenario => {
        mockSaveHolidays.mockReturnValue(scenario.storageError);

        const { result } = renderHook(() => useHolidays(), { wrapper });

        // WHEN: Adding holiday with storage error
        act(async () => {
          const error = result.current.addHoliday('Test Holiday', '2025-12-25');

          // THEN: Should propagate error to UI layer
          expect(error).toEqual(scenario.storageError);
          `expect(error.userMessage).toBe("${scenario.storageError.userMessage}")`;
        });
      });
    });

    it('should maintain data consistency when storage operations fail', async () => {
      // GIVEN: Existing holidays and storage save fails
      const initialHolidays: Holiday[] = [
        {
          id: 'existing-id',
          name: 'Existing Holiday',
          date: '2025-01-01'
        }
      ];

      mockLoadHolidays.mockReturnValue(initialHolidays);
      mockSaveHolidays.mockReturnValue({
        success: false,
        type: 'GENERIC_ERROR',
        message: 'Save failed',
        userMessage: 'Failed to save changes.'
      });

      const { result } = renderHook(() => useHolidays(), { wrapper });

      // WHEN: Attempting to add holiday with storage failure
      await act(async () => {
        result.current.addHoliday('New Holiday', '2025-12-25');
      });

      // THEN: Should maintain existing holidays state
      expect(result.current.holidays).toEqual(initialHolidays);
      // Should not add the new holiday
      expect(result.current.holidays).toHaveLength(1);
      expect(result.current.holidays[0].id).toBe('existing-id');
    });
  });

  describe('Persistence State Management', () => {
    it('should handle rapid successive add/delete operations correctly', async () => {
      // GIVEN: Context provider
      mockSaveHolidays.mockReturnValue({ success: true });
      const { result } = renderHook(() => useHolidays(), { wrapper });

      // WHEN: Performing rapid operations
      await act(async () => {
        // Add holiday 1
        result.current.addHoliday('Holiday 1', '2025-01-01');

        // Add holiday 2
        result.current.addHoliday('Holiday 2', '2025-12-25');

        // Delete holiday 1
        if (result.current.holidays.length > 0) {
          result.current.deleteHoliday(result.current.holidays[0].id);
        }
      });

      // THEN: Should maintain correct state and save appropriately
      expect(mockSaveHolidays).toHaveBeenCalledTimes(3); // add1 + add2 + delete1
      expect(result.current.holidays).toHaveLength(1);
      expect(result.current.holidays[0].name).toBe('Holiday 2');
    });

    it('should not call save if no changes made', async () => {
      // GIVEN: Context provider
      mockSaveHolidays.mockReturnValue({ success: true });
      const { result } = renderHook(() => useHolidays(), { wrapper });

      // WHEN: Not making any changes
      await act(async () => {
        // Just access the state, no mutations
        const holidays = result.current.holidays;
      });

      // THEN: Should not call saveHolidays
      expect(mockSaveHolidays).not.toHaveBeenCalled();
    });
  });
});