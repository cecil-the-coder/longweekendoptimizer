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
import { saveHolidays, loadHolidays } from '../../src/services/localStorageService';
import type { Holiday } from '../../src/context/HolidayContext';
import { createHoliday } from '../factories/holidayFactory';

describe('localStorageService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('saveHolidays', () => {
    it('should save holidays to localStorage', () => {
      const holidays: Holiday[] = [createHoliday({ name: 'Test Holiday' })];

      // The current API doesn't return anything, so we just check localStorage
      saveHolidays(holidays);

      const stored = localStorage.getItem('long-weekend-optimizer-holidays');
      expect(stored).toBeTruthy();
      expect(JSON.parse(stored!)).toEqual(holidays);
    });

    it('should save empty array', () => {
      saveHolidays([]);

      const stored = localStorage.getItem('long-weekend-optimizer-holidays');
      expect(stored).toBeTruthy();
      expect(JSON.parse(stored!)).toEqual([]);
    });

    it('should handle QuotaExceededError gracefully', () => {
      const mockSetItem = vi.spyOn(Storage.prototype, 'setItem');
      mockSetItem.mockImplementation(() => {
        const error = new DOMException('QuotaExceededError');
        error.name = 'QuotaExceededError';
        throw error;
      });

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const holidays: Holiday[] = [createHoliday()];

      // Should not throw, but should log error
      expect(() => saveHolidays(holidays)).not.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to save holidays to localStorage:',
        expect.any(DOMException)
      );

      consoleErrorSpy.mockRestore();
      mockSetItem.mockRestore();
    });

    it('should handle SecurityError gracefully (private browsing)', () => {
      const mockSetItem = vi.spyOn(Storage.prototype, 'setItem');
      mockSetItem.mockImplementation(() => {
        const error = new DOMException('SecurityError');
        error.name = 'SecurityError';
        throw error;
      });

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const holidays: Holiday[] = [createHoliday()];

      // Should not throw, but should log error
      expect(() => saveHolidays(holidays)).not.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to save holidays to localStorage:',
        expect.any(DOMException)
      );

      consoleErrorSpy.mockRestore();
      mockSetItem.mockRestore();
    });

    it('should handle generic errors', () => {
      const mockSetItem = vi.spyOn(Storage.prototype, 'setItem');
      mockSetItem.mockImplementation(() => {
        throw new Error('Generic error');
      });

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const holidays: Holiday[] = [createHoliday()];

      // Should not throw, but should log error
      expect(() => saveHolidays(holidays)).not.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to save holidays to localStorage:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
      mockSetItem.mockRestore();
    });
  });

  describe('loadHolidays', () => {
    it('should load holidays from localStorage', () => {
      const holidays: Holiday[] = [
        createHoliday({ name: 'Holiday 1' }),
        createHoliday({ name: 'Holiday 2' }),
      ];

      localStorage.setItem('long-weekend-optimizer-holidays', JSON.stringify(holidays));

      const loaded = loadHolidays();

      expect(loaded).toEqual(holidays);
    });

    it('should return empty array when no data stored', () => {
      const loaded = loadHolidays();

      expect(loaded).toEqual([]);
    });

    it('should handle corrupted JSON data gracefully', () => {
      localStorage.setItem('long-weekend-optimizer-holidays', 'invalid JSON {]');

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const loaded = loadHolidays();

      expect(loaded).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to load holidays from localStorage:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle SecurityError gracefully (private browsing)', () => {
      const mockGetItem = vi.spyOn(Storage.prototype, 'getItem');
      mockGetItem.mockImplementation(() => {
        const error = new DOMException('SecurityError');
        error.name = 'SecurityError';
        throw error;
      });

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const loaded = loadHolidays();

      expect(loaded).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to load holidays from localStorage:',
        expect.any(DOMException)
      );

      consoleErrorSpy.mockRestore();
      mockGetItem.mockRestore();
    });

    it('should handle non-array data gracefully', () => {
      localStorage.setItem('long-weekend-optimizer-holidays', JSON.stringify({ not: 'an array' }));

      const loaded = loadHolidays();

      expect(loaded).toEqual([]);
    });

    it('should handle null data gracefully', () => {
      localStorage.setItem('long-weekend-optimizer-holidays', JSON.stringify(null));

      const loaded = loadHolidays();

      expect(loaded).toEqual([]);
    });

    it('should handle undefined data gracefully', () => {
      localStorage.setItem('long-weekend-optimizer-holidays', JSON.stringify(undefined));

      const loaded = loadHolidays();

      expect(loaded).toEqual([]);
    });

    it('should handle string data gracefully', () => {
      localStorage.setItem('long-weekend-optimizer-holidays', JSON.stringify('not an array'));

      const loaded = loadHolidays();

      expect(loaded).toEqual([]);
    });

    it('should handle number data gracefully', () => {
      localStorage.setItem('long-weekend-optimizer-holidays', JSON.stringify(123));

      const loaded = loadHolidays();

      expect(loaded).toEqual([]);
    });
  });

  describe('Integration: save and load', () => {
    it('should round-trip holidays correctly', () => {
      const originalHolidays: Holiday[] = [
        createHoliday({ name: 'Thanksgiving', date: '2025-11-27' }),
        createHoliday({ name: 'Christmas', date: '2025-12-25' }),
      ];

      // Save holidays
      saveHolidays(originalHolidays);

      // Load holidays
      const loadedHolidays = loadHolidays();

      expect(loadedHolidays).toEqual(originalHolidays);
    });

    it('should handle empty data round-trip', () => {
      // Save empty array
      saveHolidays([]);

      // Load holidays
      const loadedHolidays = loadHolidays();

      expect(loadedHolidays).toEqual([]);
    });

    it('should handle large holiday list', () => {
      const largeHolidayList: Holiday[] = Array.from({ length: 1000 }, (_, i) =>
        createHoliday({
          name: `Holiday ${i + 1}`,
          date: `2025-${String(Math.floor((i % 12) + 1)).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
        })
      );

      // Save large list
      saveHolidays(largeHolidayList);

      // Load holidays
      const loadedHolidays = loadHolidays();

      expect(loadedHolidays).toHaveLength(1000);
      expect(loadedHolidays[0].name).toBe('Holiday 1');
      expect(loadedHolidays[999].name).toBe('Holiday 1000');
    });
  });
});