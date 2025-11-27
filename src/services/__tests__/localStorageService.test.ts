// Local Storage Service Tests
// Following testing requirements: Vitest for utility functions
// Testing localStorage interactions and error handling

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loadHolidays, saveHolidays } from '../localStorageService';
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
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('loadHolidays', () => {
    it('should return empty array when no holidays are stored', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = loadHolidays();

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('long-weekend-optimizer-holidays');
      expect(result).toEqual([]);
    });

    it('should return parsed holidays when valid JSON string is stored', () => {
      const storedHolidays: Holiday[] = [
        { id: '1', name: 'Thanksgiving', date: '2025-11-27' },
        { id: '2', name: 'Christmas', date: '2025-12-25' }
      ];
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(storedHolidays));

      const result = loadHolidays();

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('long-weekend-optimizer-holidays');
      expect(result).toEqual(storedHolidays);
    });

    it('should return empty array when stored JSON is invalid', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json string');

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = loadHolidays();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to load holidays from localStorage:',
        expect.any(Error)
      );
      expect(result).toEqual([]);

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
      expect(result).toEqual([]);

      consoleSpy.mockRestore();
    });

    it('should handle empty string in localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue('');

      const result = loadHolidays();

      expect(result).toEqual([]);
    });
  });

  describe('saveHolidays', () => {
    it('should save holidays to localStorage as JSON string', () => {
      const holidaysToSave: Holiday[] = [
        { id: '1', name: 'Thanksgiving', date: '2025-11-27' }
      ];

      saveHolidays(holidaysToSave);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'long-weekend-optimizer-holidays',
        JSON.stringify(holidaysToSave)
      );
    });

    it('should save empty array to localStorage', () => {
      saveHolidays([]);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'long-weekend-optimizer-holidays',
        '[]'
      );
    });

    it('should handle localStorage error gracefully', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const holidaysToSave: Holiday[] = [
        { id: '1', name: 'Thanksgiving', date: '2025-11-27' }
      ];

      // Should not throw error
      expect(() => saveHolidays(holidaysToSave)).not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to save holidays to localStorage:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('should handle invalid data gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const holidays = [{ id: '1', name: 'Test', date: '2025-01-01' }];

      // Mock Stringify to fail
      const originalStringify = JSON.stringify;
      JSON.stringify = vi.fn(() => {
        throw new Error('Circular reference');
      });

      expect(() => saveHolidays(holidays)).not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to save holidays to localStorage:',
        expect.any(Error)
      );

      // Restore original function
      JSON.stringify = originalStringify;
      consoleSpy.mockRestore();
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
});