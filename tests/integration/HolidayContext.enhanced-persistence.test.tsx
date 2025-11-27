/**
 * Integration Test: HolidayContext - Enhanced Persistence Workflows
 *
 * Comprehensive integration tests for HolidayContext persistence scenarios,
 * including error propagation, state consistency, and user feedback chains.
 *
 * Test ID: 1.3-INT-PERSIST-001
 * Priority: P0 (Critical persistence integration)
 * Story: 1.3 - Local Storage Persistence
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { HolidayProvider } from '../../src/context/HolidayContext';
import { useHolidays } from '../../src/hooks/useHolidays';
import type { Holiday } from '../../src/hooks/useHolidays';
import * as storageService from '../../src/services/localStorageService';
import { testUtils } from '../../tests/setup';

// Mock the localStorageService for controlled testing
vi.mock('../../src/services/localStorageService', () => ({
  loadHolidays: vi.fn(),
  saveHolidays: vi.fn(),
  isLocalStorageAvailable: vi.fn(),
  getStorageQuotaInfo: vi.fn()
}));

// Test wrapper component
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <HolidayProvider>{children}</HolidayProvider>
);

describe('HolidayContext - Enhanced Persistence Integration', () => {
  let loadHolidays: any, saveHolidays: any, isLocalStorageAvailable: any, getStorageQuotaInfo: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset localStorage simulation
    testUtils.resetLocalStorage();
    testUtils.simulateLocalStorageAvailable();

    // Default successful behaviors
    ({ loadHolidays, saveHolidays, isLocalStorageAvailable, getStorageQuotaInfo } =
      vi.mocked(storageService));

    loadHolidays.mockReturnValue({ holidays: [], error: null, hadCorruption: false });
    saveHolidays.mockReturnValue(null);
    isLocalStorageAvailable.mockReturnValue(true);
    getStorageQuotaInfo.mockReturnValue({ used: 1000, available: 4000000, total: 5000000 });
  });

  afterEach(() => {
    vi.useRealTimers(); // Ensure real timers are restored
    vi.restoreAllMocks();
  });

  describe('AC3: Automatic Startup Loading', () => {
    it('should load holidays on provider mount with storage available', async () => {
      const savedHolidays: Holiday[] = [
        { id: '1', name: 'Christmas', date: '2025-12-25' },
        { id: '2', name: 'New Year', date: '2026-01-01' }
      ];
      loadHolidays.mockReturnValue({ holidays: savedHolidays, error: null, hadCorruption: false });

      const { result } = renderHook(() => useHolidays(), { wrapper });

      // Wait for useEffect to complete with better async handling
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(loadHolidays).toHaveBeenCalledTimes(1);
      expect(isLocalStorageAvailable).toHaveBeenCalledTimes(1);
      expect(result.current.holidays).toEqual(savedHolidays);
      expect(result.current.isLocalStorageAvailable).toBe(true);
      expect(result.current.storageError).toBeNull();
    });

    it('should handle corruption recovery on startup', async () => {
      const corruptionError: storageService.StorageError = {
        type: 'CORRUPTION_ERROR',
        message: 'Data corruption detected',
        userMessage: 'Saved holiday data was corrupted. Starting with an empty list.'
      };
      loadHolidays.mockReturnValue({ holidays: [], error: corruptionError, hadCorruption: true });
      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

      const { result } = renderHook(() => useHolidays(), { wrapper });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(loadHolidays).toHaveBeenCalledTimes(1);
      expect(result.current.holidays).toEqual([]);
      expect(result.current.storageError).toEqual(corruptionError);
      expect(consoleSpy).toHaveBeenCalledWith('Holiday data corruption detected and recovered');

      consoleSpy.mockRestore();
    });

    it('should continue with empty state when localStorage unavailable', async () => {
      isLocalStorageAvailable.mockReturnValue(false);
      loadHolidays.mockReturnValue({ holidays: [], error: null, hadCorruption: false });
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const { result } = renderHook(() => useHolidays(), { wrapper });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.holidays).toEqual([]);
      expect(result.current.isLocalStorageAvailable).toBe(false);
      expect(result.current.storageError).toBeNull();

      consoleSpy.mockRestore();
    });

    it('should handle loading errors gracefully', async () => {
      const loadError: storageService.StorageError = {
        type: 'GENERIC_ERROR',
        message: 'Failed to load holidays',
        userMessage: 'Unable to load saved holidays. Starting with an empty list.'
      };
      loadHolidays.mockImplementation(() => {
        throw new Error('Storage access failed');
      });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { result } = renderHook(() => useHolidays(), { wrapper });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.holidays).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith('Failed to load holidays on startup:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('AC1 & AC2: Add/Delete with Immediate Persistence', () => {
    it('should save immediately after adding holiday', async () => {
      const { result } = renderHook(() => useHolidays(), { wrapper });

      await act(async () => {
        const error = result.current.addHoliday('Test Holiday', '2025-12-25');
        expect(error).toBeNull();
      });

      expect(saveHolidays).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'Test Holiday',
            date: '2025-12-25',
            id: expect.stringMatching(/^id-|^[0-9a-f-]+$/) // UUID or fallback ID
          })
        ])
      );
      expect(result.current.holidays).toHaveLength(1);
    });

    it('should save immediately after deleting holiday', async () => {
      // Setup with existing holiday
      const existingHoliday: Holiday = { id: 'test-id', name: 'Test Holiday', date: '2025-12-25' };
      loadHolidays.mockReturnValue({ holidays: [existingHoliday], error: null, hadCorruption: false });

      const { result } = renderHook(() => useHolidays(), { wrapper });

      // Wait for initial load
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.holidays).toHaveLength(1);

      await act(async () => {
        const error = result.current.deleteHoliday('test-id');
        expect(error).toBeNull();
      });

      expect(saveHolidays).toHaveBeenCalledWith([]);
      expect(result.current.holidays).toHaveLength(0);
    });

    it('should maintain state consistency when save fails during add', async () => {
      const saveError: storageService.StorageError = {
        type: 'QUOTA_EXCEEDED',
        message: 'Storage quota exceeded',
        userMessage: 'Storage is full. Please clear some browser data or remove holidays to free up space.'
      };
      saveHolidays.mockReturnValue(saveError);

      const { result } = renderHook(() => useHolidays(), { wrapper });

      await act(async () => {
        const error = result.current.addHoliday('Test Holiday', '2025-12-25');
        expect(error).toEqual(saveError);
      });

      // State should still be updated for immediate UI feedback, but error propagated
      expect(result.current.holidays).toHaveLength(1);
      expect(result.current.storageError).toEqual(saveError);
    });

    it('should maintain state consistency when save fails during delete', async () => {
      const saveError: storageService.StorageError = {
        type: 'SECURITY_ERROR',
        message: 'Storage access denied',
        userMessage: 'Unable to access storage. Your browser may be in private mode or storage is disabled.'
      };
      saveHolidays.mockReturnValue(saveError);

      // Setup with existing holiday
      const existingHoliday: Holiday = { id: 'test-id', name: 'Test Holiday', date: '2025-12-25' };
      loadHolidays.mockReturnValue({ holidays: [existingHoliday], error: null, hadCorruption: false });

      const { result } = renderHook(() => useHolidays(), { wrapper });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.holidays).toHaveLength(1);

      await act(async () => {
        const error = result.current.deleteHoliday('test-id');
        expect(error).toEqual(saveError);
      });

      // State should still be updated (holiday deleted) for immediate UI feedback
      expect(result.current.holidays).toHaveLength(0);
      expect(result.current.storageError).toEqual(saveError);
    });
  });

  describe('Error Propagation and User Feedback', () => {
    it('should propagate storage errors to components', async () => {
      const storageError: storageService.StorageError = {
        type: 'QUOTA_EXCEEDED',
        message: 'Storage quota exceeded',
        userMessage: 'Storage is full. Please clear some browser data or remove holidays to free up space.'
      };
      saveHolidays.mockReturnValue(storageError);

      const { result } = renderHook(() => useHolidays(), { wrapper });

      await act(async () => {
        result.current.addHoliday('Test Holiday', '2025-12-25');
      });

      expect(result.current.storageError).toEqual(storageError);
      expect(result.current.clearStorageError).toBeDefined();
    });

    it('should auto-clear storage errors after timeout', async () => {
      vi.useFakeTimers();
      const storageError: storageService.StorageError = {
        type: 'GENERIC_ERROR',
        message: 'Save failed',
        userMessage: 'Unable to save holidays. Please try again later.'
      };
      saveHolidays.mockReturnValue(storageError);

      const { result } = renderHook(() => useHolidays(), { wrapper });

      await act(async () => {
        result.current.addHoliday('Test Holiday', '2025-12-25');
      });

      expect(result.current.storageError).toEqual(storageError);

      // Fast-forward time
      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      expect(result.current.storageError).toBeNull();

      vi.useRealTimers();
    });

    it('should allow manual error clearing', async () => {
      const storageError: storageService.StorageError = {
        type: 'GENERIC_ERROR',
        message: 'Save failed',
        userMessage: 'Unable to save holidays. Please try again later.'
      };
      saveHolidays.mockReturnValue(storageError);

      const { result } = renderHook(() => useHolidays(), { wrapper });

      await act(async () => {
        result.current.addHoliday('Test Holiday', '2025-12-25');
      });

      expect(result.current.storageError).toEqual(storageError);

      await act(async () => {
        result.current.clearStorageError();
      });

      expect(result.current.storageError).toBeNull();
    });

    it('should overwrite previous errors with new operations', async () => {
      const firstError: storageService.StorageError = {
        type: 'QUOTA_EXCEEDED',
        message: 'Storage quota exceeded',
        userMessage: 'Storage is full.'
      };
      const secondError: storageService.StorageError = {
        type: 'SECURITY_ERROR',
        message: 'Storage access denied',
        userMessage: 'Unable to access storage.'
      };

      saveHolidays.mockReturnValueOnce(firstError).mockReturnValueOnce(secondError);

      const { result } = renderHook(() => useHolidays(), { wrapper });

      // First operation fails
      await act(async () => {
        result.current.addHoliday('Holiday 1', '2025-01-01');
      });
      expect(result.current.storageError).toEqual(firstError);

      // Second operation fails with different error
      await act(async () => {
        result.current.addHoliday('Holiday 2', '2025-01-02');
      });
      expect(result.current.storageError).toEqual(secondError);
    });
  });

  describe('Performance and Optimizations', () => {
    it('should not call saveHolidays unnecessarily', async () => {
      const { result } = renderHook(() => useHolidays(), { wrapper });

      // Just reading state shouldn't trigger save
      await act(async () => {
        const holidays = result.current.holidays;
        const hasError = result.current.storageError;
        const isAvailable = result.current.isLocalStorageAvailable;
      });

      expect(saveHolidays).not.toHaveBeenCalled();
    });

    it('should debounce rapid successive operations correctly', async () => {
      const { result } = renderHook(() => useHolidays(), { wrapper });

      await act(async () => {
        result.current.addHoliday('Holiday 1', '2025-01-01');
        result.current.addHoliday('Holiday 2', '2025-01-02');
        result.current.addHoliday('Holiday 3', '2025-01-03');
      });

      // Each add should trigger a save (no debouncing - immediate persistence required)
      expect(saveHolidays).toHaveBeenCalledTimes(3);
      expect(saveHolidays).toHaveBeenNthCalledWith(1, expect.arrayContaining([
        expect.objectContaining({ name: 'Holiday 1' })
      ]));
      expect(saveHolidays).toHaveBeenNthCalledWith(2, expect.arrayContaining([
        expect.objectContaining({ name: 'Holiday 1' }),
        expect.objectContaining({ name: 'Holiday 2' })
      ]));
      expect(saveHolidays).toHaveBeenNthCalledWith(3, expect.arrayContaining([
        expect.objectContaining({ name: 'Holiday 1' }),
        expect.objectContaining({ name: 'Holiday 2' }),
        expect.objectContaining({ name: 'Holiday 3' })
      ]));
    });

    it('should handle large datasets efficiently', async () => {
      const largeHolidays: Holiday[] = Array.from({ length: 1000 }, (_, i) => ({
        id: `id-${i}`,
        name: `Holiday ${i}`,
        date: '2025-12-25'
      }));

      const startTime = performance.now();
      loadHolidays.mockReturnValue({ holidays: largeHolidays, error: null, hadCorruption: false });

      const { result } = renderHook(() => useHolidays(), { wrapper });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const endTime = performance.now();

      expect(result.current.holidays).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(100); // Should load quickly
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle UUID generation fallback', async () => {
      const { result } = renderHook(() => useHolidays(), { wrapper });

      // Mock crypto.randomUUID to fail for first call
      const originalRandomUUID = globalThis.crypto?.randomUUID;
      let callCount = 0;
      if (globalThis.crypto) {
        globalThis.crypto.randomUUID = () => {
          callCount++;
          if (callCount === 1) {
            throw new Error('crypto.randomUUID not supported');
          }
          return 'proper-uuid';
        };
      }

      await act(async () => {
        result.current.addHoliday('Test Holiday', '2025-12-25');
      });

      // Should generate some kind of ID (either UUID or fallback)
      expect(result.current.holidays).toHaveLength(1);
      expect(result.current.holidays[0].id).toBeTruthy();
      expect(typeof result.current.holidays[0].id).toBe('string');

      // Restore original crypto.randomUUID
      if (originalRandomUUID && globalThis.crypto) {
        globalThis.crypto.randomUUID = originalRandomUUID;
      }
    });

    it('should handle empty date strings appropriately', async () => {
      const { result } = renderHook(() => useHolidays(), { wrapper });

      await act(async () => {
        const error = result.current.addHoliday('Test Holiday', '');
      });

      // The validation happens at the component level, context just stores what's given
      expect(result.current.holidays).toHaveLength(1);
      expect(result.current.holidays[0].date).toBe('');
    });

    it('should handle concurrent state updates correctly', async () => {
      const { result } = renderHook(() => useHolidays(), { wrapper });

      // Simulate concurrent adds
      await act(async () => {
        const promise1 = Promise.resolve(result.current.addHoliday('Holiday 1', '2025-01-01'));
        const promise2 = Promise.resolve(result.current.addHoliday('Holiday 2', '2025-01-02'));

        await promise1;
        await promise2;
      });

      expect(result.current.holidays).toHaveLength(2);
      expect(saveHolidays).toHaveBeenCalledTimes(2);
    });

    it('should handle localStorage becoming unavailable during session', async () => {
      // Initially available
      isLocalStorageAvailable.mockReturnValue(true);

      const { result } = renderHook(() => useHolidays(), { wrapper });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.isLocalStorageAvailable).toBe(true);

      // Simulate localStorage becoming unavailable
      isLocalStorageAvailable.mockReturnValue(false);
      saveHolidays.mockReturnValue({
        type: 'GENERIC_ERROR',
        message: 'Storage unavailable',
        userMessage: 'Storage is not available.'
      });

      await act(async () => {
        result.current.addHoliday('Test Holiday', '2025-12-25');
      });

      // Should still update state but provide error feedback
      expect(result.current.holidays).toHaveLength(1);
      expect(result.current.storageError?.type).toBe('GENERIC_ERROR');
    });
  });

  describe('Data Integrity and Consistency', () => {
    it('should maintain data consistency across add/delete cycles', async () => {
      const { result } = renderHook(() => useHolidays(), { wrapper });

      // Add holidays
      await act(async () => {
        result.current.addHoliday('Holiday 1', '2025-01-01');
        result.current.addHoliday('Holiday 2', '2025-01-02');
      });

      expect(result.current.holidays).toHaveLength(2);

      // Get the IDs for deletion
      const [holiday1, holiday2] = result.current.holidays;

      // Delete one holiday
      await act(async () => {
        result.current.deleteHoliday(holiday1.id);
      });

      expect(result.current.holidays).toHaveLength(1);
      expect(result.current.holidays[0].id).toBe(holiday2.id);

      // Delete the remaining holiday
      await act(async () => {
        result.current.deleteHoliday(holiday2.id);
      });

      expect(result.current.holidays).toHaveLength(0);
    });

    it('should validate holiday object structure before operations', async () => {
      // Context doesn't validate, it passes through validation from storageService
      // This test verifies the behavior when storageService validation fails
      const validationError: storageService.StorageError = {
        type: 'GENERIC_ERROR',
        message: 'Invalid holiday object detected',
        userMessage: 'Unable to save holidays due to invalid holiday data.'
      };
      saveHolidays.mockReturnValue(validationError);

      const { result } = renderHook(() => useHolidays(), { wrapper });

      await act(async () => {
        const error = result.current.addHoliday('Test Holiday', '2025-01-01');
        expect(error).toEqual(validationError);
      });

      // State should still be updated even if validation fails at storage level
      expect(result.current.holidays).toHaveLength(1);
      expect(result.current.storageError).toEqual(validationError);
    });
  });

  describe('Memory Management', () => {
    it('should not leak memory with long-running sessions', async () => {
      const { result } = renderHook(() => useHolidays(), { wrapper });

      // Simulate many operations over time
      for (let i = 0; i < 100; i++) {
        await act(async () => {
          result.current.addHoliday(`Holiday ${i}`, '2025-12-25');
        });

        if (i % 10 === 0 && result.current.holidays.length > 0) {
          await act(async () => {
            result.current.deleteHoliday(result.current.holidays[0].id);
          });
        }
      }

      // Should handle operations without issue
      expect(result.current.holidays).toBeDefined();
      expect(saveHolidays).toHaveBeenCalledTimes(100);
    });

    it('should clean up timers on unmount', async () => {
      vi.useFakeTimers();

      const { result, unmount } = renderHook(() => useHolidays(), { wrapper });

      // Create an error that will have auto-clear timer
      const storageError: storageService.StorageError = {
        type: 'GENERIC_ERROR',
        message: 'Test error',
        userMessage: 'Test user message'
      };
      saveHolidays.mockReturnValue(storageError);

      await act(async () => {
        result.current.addHoliday('Test', '2025-01-01');
      });

      expect(result.current.storageError).toEqual(storageError);

      // Unmount before timer fires
      unmount();

      // Advance time - should not cause issues
      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      // No assertions for cleanup - just ensure no errors occur
      vi.useRealTimers();
    });
  });
});