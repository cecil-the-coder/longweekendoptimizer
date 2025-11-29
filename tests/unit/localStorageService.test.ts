/**
 * Unit Test: Local Storage Service
 *
 * Tests error handling and data persistence logic
 *
 * Test ID: 1.3-UNIT-001
 * Priority: P0 (Data persistence critical)
 * Story: 1.3 - Local Storage Persistence
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createHoliday, type Holiday } from '../factories/holidayFactory';

// Import first
import * as localStorageModule from '../../src/services/localStorageService';

describe('localStorageService', () => {
  // Mock localStorage to be available for tests
  const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn()
  };

  beforeEach(() => {
    // Replace global localStorage with mock
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    });

    // Mock isLocalStorageAvailable to always return true
    vi.spyOn(localStorageModule, 'isLocalStorageAvailable').mockReturnValue(true);

    // Clear all mocks
    vi.clearAllMocks();

    // Keep isLocalStorageAvailable mocked to true
    vi.spyOn(localStorageModule, 'isLocalStorageAvailable').mockReturnValue(true);

    // Default mock implementations
    mockLocalStorage.setItem.mockImplementation(() => {});
    mockLocalStorage.removeItem.mockImplementation(() => {});
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === '__localStorage_test__') return '__localStorage_test__';
      return null;
    });
    mockLocalStorage.clear.mockImplementation(() => {});
    mockLocalStorage.key.mockImplementation(() => null);
    Object.defineProperty(mockLocalStorage, 'length', { value: 0 });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('saveHolidays', () => {
    it('should save holidays to localStorage and return null on success', () => {
      const holidays: Holiday[] = [createHoliday({ name: 'Test Holiday' })];

      const result = localStorageModule.saveHolidays(holidays);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'holidayhacker-holidays',
        JSON.stringify(holidays)
      );
      expect(result).toBeNull();
    });

    it('should save empty array and return null on success', () => {
      const result = localStorageModule.saveHolidays([]);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'holidayhacker-holidays',
        '[]'
      );
      expect(result).toBeNull();
    });

    it('should return quota exceeded error structured object', () => {
      // Reset to proper available state first
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === '__localStorage_test__') return '__localStorage_test__';
        return null;
      });

      // Then mock setItem to throw error
      mockLocalStorage.setItem.mockImplementation(() => {
        const error = new DOMException('QuotaExceededError', 'QuotaExceededError');
        throw error;
      });

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const holidays: Holiday[] = [createHoliday()];

      const result = localStorageModule.saveHolidays(holidays);

      expect(result).toEqual({
        type: 'QUOTA_EXCEEDED',
        message: 'Storage quota exceeded',
        userMessage: 'Storage is full. Please clear some browser data or remove holidays to free up space.'
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to save holidays to localStorage:',
        expect.any(DOMException)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should return security error structured object', () => {
      // Reset to proper available state first
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === '__localStorage_test__') return '__localStorage_test__';
        return null;
      });

      // Then mock setItem to throw error
      mockLocalStorage.setItem.mockImplementation(() => {
        const error = new DOMException('SecurityError', 'SecurityError');
        throw error;
      });

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const holidays: Holiday[] = [createHoliday()];

      const result = localStorageModule.saveHolidays(holidays);

      expect(result).toEqual({
        type: 'SECURITY_ERROR',
        message: 'Storage access denied',
        userMessage: 'Unable to access storage. Your browser may be in private mode or storage is disabled.'
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to save holidays to localStorage:',
        expect.any(DOMException)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should return generic error structured object', () => {
      // Reset to proper available state first
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === '__localStorage_test__') return '__localStorage_test__';
        return null;
      });

      // Then mock setItem to throw error
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Generic error');
      });

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const holidays: Holiday[] = [createHoliday()];

      const result = localStorageModule.saveHolidays(holidays);

      expect(result).toEqual({
        type: 'GENERIC_ERROR',
        message: 'Generic error',
        userMessage: 'Unable to save holidays. Please try again later.'
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to save holidays to localStorage:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('loadHolidays', () => {
    it('should load holidays from localStorage and return structured result', () => {
      const holidays: Holiday[] = [
        createHoliday({ name: 'Holiday 1' }),
        createHoliday({ name: 'Holiday 2' }),
      ];

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(holidays));

      const loaded = localStorageModule.loadHolidays();

      expect(loaded).toEqual({
        holidays: holidays,
        error: null,
        hadCorruption: false
      });
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('holidayhacker-holidays');
    });

    it('should return empty array structure when no data stored', () => {
      const loaded = localStorageModule.loadHolidays();

      expect(loaded).toEqual({
        holidays: [],
        error: null,
        hadCorruption: false
      });
    });

    it('should handle corrupted JSON data gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid JSON {]');

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const loaded = localStorageModule.loadHolidays();

      expect(loaded.holidays).toEqual([]);
      expect(loaded.error).toEqual({
        type: 'CORRUPTION_ERROR',
        message: 'Data corruption detected',
        userMessage: 'Saved holiday data was corrupted. Starting with an empty list.'
      });
      expect(loaded.hadCorruption).toBe(true);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to load holidays from localStorage:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle SecurityError gracefully (private browsing)', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        const error = new DOMException('SecurityError', 'SecurityError');
        throw error;
      });

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const loaded = localStorageModule.loadHolidays();

      expect(loaded.holidays).toEqual([]);
      expect(loaded.error).toEqual({
        type: 'SECURITY_ERROR',
        message: 'Storage access denied',
        userMessage: 'Unable to access storage. Your browser may be in private mode or storage is disabled.'
      });
      expect(loaded.hadCorruption).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to load holidays from localStorage:',
        expect.any(DOMException)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle non-array data gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({ not: 'an array' }));

      const loaded = localStorageModule.loadHolidays();

      expect(loaded.holidays).toEqual([]);
      expect(loaded.error).toEqual({
        type: 'GENERIC_ERROR',
        message: 'Invalid data format: expected array',
        userMessage: 'Unable to save holidays. Please try again later.'
      });
      expect(loaded.hadCorruption).toBe(false);
    });

    it('should handle null data gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(null));

      const loaded = localStorageModule.loadHolidays();

      expect(loaded.holidays).toEqual([]);
      expect(loaded.error).toEqual({
        type: 'GENERIC_ERROR',
        message: 'Invalid data format: expected array',
        userMessage: 'Unable to save holidays. Please try again later.'
      });
      expect(loaded.hadCorruption).toBe(false);
    });

    it('should handle undefined data gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(undefined));

      const loaded = localStorageModule.loadHolidays();

      expect(loaded.holidays).toEqual([]);
      expect(loaded.error).toEqual({
        type: 'GENERIC_ERROR',
        message: 'Invalid data format: expected array',
        userMessage: 'Unable to save holidays. Please try again later.'
      });
      expect(loaded.hadCorruption).toBe(false);
    });

    it('should handle string data gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify('not an array'));

      const loaded = localStorageModule.loadHolidays();

      expect(loaded.holidays).toEqual([]);
      expect(loaded.error).toEqual({
        type: 'GENERIC_ERROR',
        message: 'Invalid data format: expected array',
        userMessage: 'Unable to save holidays. Please try again later.'
      });
      expect(loaded.hadCorruption).toBe(false);
    });

    it('should handle number data gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(123));

      const loaded = localStorageModule.loadHolidays();

      expect(loaded.holidays).toEqual([]);
      expect(loaded.error).toEqual({
        type: 'GENERIC_ERROR',
        message: 'Invalid data format: expected array',
        userMessage: 'Unable to save holidays. Please try again later.'
      });
      expect(loaded.hadCorruption).toBe(false);
    });
  });

  describe('Integration: save and load', () => {
    it('should round-trip holidays correctly', () => {
      const originalHolidays: Holiday[] = [
        createHoliday({ name: 'Thanksgiving', date: '2025-11-27' }),
        createHoliday({ name: 'Christmas', date: '2025-12-25' }),
      ];

      // Save holidays
      localStorageModule.saveHolidays(originalHolidays);

      // Mock getItem to return what we just saved
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(originalHolidays));

      // Load holidays
      const result = localStorageModule.loadHolidays();

      expect(result.holidays).toEqual(originalHolidays);
      expect(result.error).toBeNull();
      expect(result.hadCorruption).toBe(false);
    });

    it('should handle empty data round-trip', () => {
      // Save empty array
      localStorageModule.saveHolidays([]);

      // Mock getItem to return empty array
      mockLocalStorage.getItem.mockReturnValue('[]');

      // Load holidays
      const result = localStorageModule.loadHolidays();

      expect(result.holidays).toEqual([]);
      expect(result.error).toBeNull();
      expect(result.hadCorruption).toBe(false);
    });

    it('should handle large holiday list', () => {
      const largeHolidayList: Holiday[] = Array.from({ length: 1000 }, (_, i) =>
        createHoliday({
          name: `Holiday ${i + 1}`,
          date: `2025-${String(Math.floor((i % 12) + 1)).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
        })
      );

      // Save large list
      localStorageModule.saveHolidays(largeHolidayList);

      // Mock getItem to return the large list
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(largeHolidayList));

      // Load holidays
      const result = localStorageModule.loadHolidays();

      expect(result.holidays).toHaveLength(1000);
      expect(result.holidays[0].name).toBe('Holiday 1');
      expect(result.holidays[999].name).toBe('Holiday 1000');
      expect(result.error).toBeNull();
      expect(result.hadCorruption).toBe(false);
    });
  });
});