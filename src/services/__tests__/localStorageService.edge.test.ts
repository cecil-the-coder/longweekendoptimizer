// Local Storage Service Edge Case Tests
// Advanced edge cases and error scenarios beyond basic functionality

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loadHolidays, saveHolidays } from '../localStorageService';
import { Holiday } from '../../context/HolidayContext';

describe('localStorageService Advanced Edge Cases', () => {
  // Enhanced localStorage mock with more realistic behavior
  const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn()
  };

  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('P2: Data Structure Edge Cases', () => {
    it('should handle null and undefined values in holiday objects', () => {
      const holidaysWithNulls: Holiday[] = [
        { id: '1', name: null as any, date: '2025-01-01' },
        { id: '2', name: 'Valid Holiday', date: null as any },
        { id: '3', name: 'Another Valid', date: '2025-03-15' }
      ];

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(holidaysWithNulls));

      const result = loadHolidays();

      // Should still return the array (service doesn't validate data structure)
      expect(result).toEqual(holidaysWithNulls);
    });

    it('should handle holidays with missing required fields', () => {
      const incompleteHolidays = [
        { id: '1' } as any, // missing name and date
        { name: 'No ID' } as any, // missing id and date
        { date: '2025-01-01' } as any, // missing id and name
        { id: '2', name: null, date: undefined } as any
      ];

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(incompleteHolidays));

      const result = loadHolidays();

      // Should return what it finds (validation is at higher level)
      expect(result).toEqual(incompleteHolidays);
    });

    it('should handle circular references in holiday objects', () => {
      const circularHoliday: any = { id: '1', name: 'Test', date: '2025-01-01' };
      circularHoliday.self = circularHoliday; // Create circular reference

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => saveHolidays([circularHoliday])).not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to save holidays to localStorage:',
        expect.any(TypeError)
      );

      consoleSpy.mockRestore();
    });

    it('should handle extremely large holiday lists', () => {
      const massiveHolidays: Holiday[] = Array.from({ length: 10000 }, (_, i) => ({
        id: `holiday-${i}`,
        name: `Holiday ${i}`,
        date: `2025-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`
      }));

      // Mock quota exceeded for massive data
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('QuotaExceededError: Storage quota exceeded');
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => saveHolidays(massiveHolidays)).not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to save holidays to localStorage:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('P2: Browser Environment Edge Cases', () => {
    it('should handle when localStorage is completely disabled', () => {
      // Simulate disabled localStorage
      delete (window as any).localStorage;

      const result = loadHolidays();

      expect(result).toEqual([]);
    });

    it('should handle localStorage in privacy mode with SecurityError', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new DOMException('Security: localStorage is disabled', 'SecurityError');
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = loadHolidays();

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to load holidays from localStorage:',
        expect.any(DOMException)
      );

      consoleSpy.mockRestore();
    });

    it('should handle when localStorage only returns strings (not null)', () => {
      // Some browsers return empty string instead of null for missing keys
      mockLocalStorage.getItem.mockReturnValue('');

      const result = loadHolidays();

      expect(result).toEqual([]);
    });

    it('should handle localStorage that throws on getItem', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('Storage access denied');
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = loadHolidays();

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to load holidays from localStorage:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('P3: Data Corruption Scenarios', () => {
    it('should handle malformed JSON with unicode characters', () => {
      const malformedJSON = '{"id":"1","name":"Christmas\\u0026New Year"';
      mockLocalStorage.getItem.mockReturnValue(malformedJSON);

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = loadHolidays();

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to load holidays from localStorage:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('should handle JSON with comment syntax (invalid but common)', () => {
      const jsonWithComments = `
        [
          // Christmas holiday
          {"id":"1","name":"Christmas","date":"2025-12-25"},
          {"id":"2","name":"New Year","date":"2026-01-01"}
        ]
      `;
      mockLocalStorage.getItem.mockReturnValue(jsonWithComments);

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = loadHolidays();

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to load holidays from localStorage:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('should handle data that is not an array', () => {
      const nonArrayData = '{"id":"1","name":"Single holiday","date":"2025-01-01"}';
      mockLocalStorage.getItem.mockReturnValue(nonArrayData);

      // Should return empty array for non-array data
      const result = loadHolidays();
      expect(result).toEqual([]);
    });

    it('should handle data with prototype pollution', () => {
      const maliciousData = JSON.stringify({
        id: '1',
        name: 'Normal Holiday',
        date: '2025-01-01',
        __proto__: { polluted: true }
      });

      mockLocalStorage.getItem.mockReturnValue(maliciousData);

      const result = loadHolidays();

      // Should handle without prototype pollution
      expect((result as any).polluted).toBeUndefined();
    });
  });

  describe('P2: Performance and Memory Edge Cases', () => {
    it('should handle rapid successive save operations', () => {
      const holidays: Holiday[] = [
        { id: '1', name: 'Test Holiday', date: '2025-01-01' }
      ];

      // Simulate rapid saves
      for (let i = 0; i < 100; i++) {
        saveHolidays([...holidays, { id: `${i}`, name: `Holiday ${i}`, date: '2025-01-01' }]);
      }

      // Should complete all operations without error
      expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(100);
    });

    it('should handle memory pressure scenarios', () => {
      const largeHoliday = {
        id: '1',
        name: 'A'.repeat(10000), // Very large name
        date: '2025-01-01'.repeat(1000) // Very large date string
      };

      expect(() => saveHolidays([largeHoliday as Holiday])).not.toThrow();
    });
  });

  describe('P1: Data Loss Prevention', () => {
    it('should handle save errors without losing existing data in memory', () => {
      const existingHolidays: Holiday[] = [
        { id: '1', name: 'Important Holiday', date: '2025-01-01' }
      ];

      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Write failed');
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Should not throw error
      expect(() => saveHolidays(existingHolidays)).not.toThrow();

      // Should log error but not crash
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to save holidays to localStorage:',
        expect.any(Error)
      );

      // Original data should still be intact
      expect(existingHolidays[0].name).toBe('Important Holiday');

      consoleSpy.mockRestore();
    });

    it('should handle concurrent save/load operations safely', async () => {
      const holidays1: Holiday[] = [{ id: '1', name: 'Holiday 1', date: '2025-01-01' }];
      const holidays2: Holiday[] = [{ id: '2', name: 'Holiday 2', date: '2025-02-01' }];

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(holidays1));

      // Simulate concurrent operations
      const loadPromise = Promise.resolve(loadHolidays());
      const savePromise = Promise.resolve(saveHolidays(holidays2));

      await Promise.all([loadPromise, savePromise]);

      expect(mockLocalStorage.getItem).toHaveBeenCalled();
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('Storage Key Management Edge Cases', () => {
    it('should verify storage key consistency across operations', () => {
      const holidays: Holiday[] = [
        { id: '1', name: 'Test Holiday', date: '2025-01-01' }
      ];

      saveHolidays(holidays);
      loadHolidays();

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'holidayhacker-holidays',
        expect.any(String)
      );

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(
        'holidayhacker-holidays'
      );
    });

    it('should handle when storage key contains special characters', () => {
      // This tests that our hardcoded storage key doesn't have issues
      const holidays: Holiday[] = [
        { id: '1', name: 'Test', date: '2025-01-01' }
      ];

      expect(() => saveHolidays(holidays)).not.toThrow();
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'holidayhacker-holidays',
        expect.any(String)
      );
    });
  });
});