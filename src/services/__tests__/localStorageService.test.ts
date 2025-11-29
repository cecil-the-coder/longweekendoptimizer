// Local Storage Service Tests
// Following testing requirements: Vitest for utility functions
// Testing localStorage interactions and error handling
// Updated for enhanced localStorageService with feature detection and corruption recovery

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loadHolidays, saveHolidays, isLocalStorageAvailable, getStorageQuotaInfo } from '../localStorageService';
import { Holiday } from '../../context/HolidayContext';

describe('localStorageService', () => {
  // Mock localStorage
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

    vi.clearAllMocks();

    // Ensure mock methods return values that make localStorage appear available
    mockLocalStorage.setItem.mockImplementation(() => {});
    mockLocalStorage.removeItem.mockImplementation(() => {});
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === '__localStorage_test__') return null; // For feature detection
      return null; // Default for other keys
    });
    mockLocalStorage.key.mockImplementation((index) => {
      const keys = ['key1', 'key2'];
      return keys[index] || null;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('loadHolidays', () => {
    it('should return empty array when no holidays are stored', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = loadHolidays();

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('long-weekend-optimizer-holidays');
      expect(result).toEqual({
        holidays: [],
        error: null,
        hadCorruption: false
      });
    });

    it('should return parsed holidays when valid JSON string is stored', () => {
      const storedHolidays: Holiday[] = [
        { id: '1', name: 'Thanksgiving', date: '2025-11-27' },
        { id: '2', name: 'Christmas', date: '2025-12-25' }
      ];
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(storedHolidays));

      const result = loadHolidays();

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('long-weekend-optimizer-holidays');
      expect(result).toEqual({
        holidays: storedHolidays,
        error: null,
        hadCorruption: false
      });
    });

    it('should return corruption error when stored JSON is invalid', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json string');

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = loadHolidays();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to load holidays from localStorage:',
        expect.any(SyntaxError)
      );
      expect(result).toEqual({
        holidays: [],
        error: {
          type: 'CORRUPTION_ERROR',
          message: 'Data corruption detected',
          userMessage: 'Saved holiday data was corrupted. Starting with an empty list.'
        },
        hadCorruption: true
      });

      consoleSpy.mockRestore();
    });

    it('should return empty array when localStorage throws error', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('Storage access denied');
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = loadHolidays();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to load holidays from localStorage:',
        expect.any(Error)
      );
      expect(result.holidays).toEqual([]);
      expect(result.error).not.toBeNull();

      consoleSpy.mockRestore();
    });

    it('should handle empty string in localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue('');

      const result = loadHolidays();

      expect(result).toEqual({
        holidays: [],
        error: null,
        hadCorruption: false
      });
    });

    it('should handle data corruption by cleaning invalid entries', () => {
      const corruptedData = [
        { id: '1', name: 'Valid Holiday', date: '2025-01-01' },
        { id: '2', name: '', date: '2025-01-02' }, // invalid: empty name
        { id: '3', name: 'Valid Holiday 2', date: '2025-01-03' },
        { invalid: 'object' } // invalid: wrong structure
      ];

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(corruptedData));
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = loadHolidays();

      expect(result.holidays).toHaveLength(2); // Only valid entries
      expect(result.hadCorruption).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Data corruption detected: removed 2 invalid holiday entries out of 4 total'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('saveHolidays', () => {
    it('should save holidays to localStorage as JSON string and return null on success', () => {
      const holidaysToSave: Holiday[] = [
        { id: '1', name: 'Thanksgiving', date: '2025-11-27' }
      ];

      const result = saveHolidays(holidaysToSave);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'long-weekend-optimizer-holidays',
        JSON.stringify(holidaysToSave)
      );
      expect(result).toBeNull();
    });

    it('should save empty array to localStorage', () => {
      const result = saveHolidays([]);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'long-weekend-optimizer-holidays',
        '[]'
      );
      expect(result).toBeNull();
    });

    it('should return quota exceeded error when localStorage throws QuotaExceededError', () => {
      const quotaError = new DOMException('Storage quota exceeded', 'QuotaExceededError');
      mockLocalStorage.setItem.mockImplementation(() => {
        throw quotaError;
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const holidaysToSave: Holiday[] = [
        { id: '1', name: 'Thanksgiving', date: '2025-11-27' }
      ];

      const result = saveHolidays(holidaysToSave);

      expect(result).toEqual({
        type: 'QUOTA_EXCEEDED',
        message: 'Storage quota exceeded',
        userMessage: 'Storage is full. Please clear some browser data or remove holidays to free up space.'
      });
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to save holidays to localStorage:',
        quotaError
      );

      consoleSpy.mockRestore();
    });

    it('should return security error when localStorage throws SecurityError', () => {
      const securityError = new DOMException('Storage access denied', 'SecurityError');
      mockLocalStorage.setItem.mockImplementation(() => {
        throw securityError;
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = saveHolidays([{ id: '1', name: 'Test', date: '2025-01-01' }]);

      expect(result).toEqual({
        type: 'SECURITY_ERROR',
        message: 'Storage access denied',
        userMessage: 'Unable to access storage. Your browser may be in private mode or storage is disabled.'
      });

      consoleSpy.mockRestore();
    });

    it('should validate holiday objects and return error for invalid data', () => {
      const invalidHolidays = [
        { id: '', name: 'Test', date: '2025-01-01' } // invalid: empty id
      ] as Holiday[];

      const result = saveHolidays(invalidHolidays);

      expect(result).toEqual({
        type: 'GENERIC_ERROR',
        message: 'Invalid holiday object detected',
        userMessage: 'Unable to save holidays due to invalid holiday data.'
      });
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    });

    it('should validate array format and return error for non-array data', () => {
      const result = saveHolidays(null as any);

      expect(result).toEqual({
        type: 'GENERIC_ERROR',
        message: 'Invalid holiday data format',
        userMessage: 'Unable to save holidays due to a data format error.'
      });
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('isLocalStorageAvailable', () => {
    it('should return true when localStorage is available', () => {
      mockLocalStorage.setItem.mockReturnValue(undefined);
      mockLocalStorage.removeItem.mockReturnValue(undefined);

      const result = isLocalStorageAvailable();

      expect(result).toBe(true);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('__localStorage_test__', '__localStorage_test__');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('__localStorage_test__');
    });

    it('should return false when localStorage throws error', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage disabled');
      });

      const result = isLocalStorageAvailable();

      expect(result).toBe(false);
    });

    it('should return false when localStorage.removeItem throws error', () => {
      mockLocalStorage.setItem.mockReturnValue(undefined);
      mockLocalStorage.removeItem.mockImplementation(() => {
        throw new Error('Storage disabled');
      });

      const result = isLocalStorageAvailable();

      expect(result).toBe(false);
    });
  });

  describe('getStorageQuotaInfo', () => {
    it('should return storage information when localStorage is available', () => {
      // Mock localStorage with some data by setting length to simulate stored items
      Object.defineProperty(mockLocalStorage, 'length', { value: 2 });

      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'key1') return 'value1';
        if (key === 'key2') return 'value2';
        return null;
      });

      const result = getStorageQuotaInfo();

      expect(result).toHaveProperty('used');
      expect(result).toHaveProperty('available');
      expect(result).toHaveProperty('total');
      expect(typeof result.used).toBe('number');
      expect(typeof result.available).toBe('number');
      expect(typeof result.total).toBe('number');
      expect(result.used).toBeGreaterThan(0); // Should have some usage
    });

    it('should return zero usage when localStorage is not available', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage disabled');
      });
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('Storage disabled');
      });
      mockLocalStorage.removeItem.mockImplementation(() => {
        throw new Error('Storage disabled');
      });

      const result = getStorageQuotaInfo();

      expect(result).toEqual({ used: 0 });
    });
  });

  describe('Storage Key Consistency', () => {
    it('should use the same storage key for load and save operations', () => {
      const holidays: Holiday[] = [
        { id: '1', name: 'Test', date: '2025-01-01' }
      ];

      saveHolidays(holidays);
      loadHolidays();

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'long-weekend-optimizer-holidays',
        expect.any(String)
      );
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('long-weekend-optimizer-holidays');
    });
  });

  describe('Feature Detection Integration', () => {
    it('should handle loadHolidays when localStorage is unavailable', () => {
      // Simulate unavailable localStorage
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('Storage not available');
      });

      const result = loadHolidays();

      expect(result).toEqual({
        holidays: [],
        error: expect.objectContaining({
          type: expect.any(String),
          message: expect.any(String),
          userMessage: expect.any(String)
        }),
        hadCorruption: false
      });
    });

    it('should handle saveHolidays when localStorage is unavailable', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage not available');
      });

      const holidays: Holiday[] = [{ id: '1', name: 'Test', date: '2025-01-01' }];

      const result = saveHolidays(holidays);

      expect(result).toEqual(expect.objectContaining({
        type: expect.any(String),
        message: expect.any(String),
        userMessage: expect.any(String)
      }));
    });

    it('should gracefully handle localStorage completely missing', () => {
      // Remove localStorage completely
      delete (window as any).localStorage;

      expect(() => loadHolidays()).not.toThrow();
      expect(() => saveHolidays([])).not.toThrow();
    });
  });
});