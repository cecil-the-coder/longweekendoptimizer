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
import { saveHolidays, loadHolidays, clearHolidays } from '../../src/services/localStorageService';
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

      const result = saveHolidays(holidays);

      expect(result.success).toBe(true);

      const stored = localStorage.getItem('longWeekendApp:holidays');
      expect(stored).toBeTruthy();
      expect(JSON.parse(stored!)).toEqual(holidays);
    });

    it('should save empty array', () => {
      const result = saveHolidays([]);

      expect(result.success).toBe(true);

      const stored = localStorage.getItem('longWeekendApp:holidays');
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
      const result = saveHolidays(holidays);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Storage limit reached');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('quota exceeded'),
        expect.any(Error)
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
      const result = saveHolidays(holidays);

      expect(result.success).toBe(false);
      expect(result.error).toContain('private browsing mode');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('access denied'),
        expect.any(Error)
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
      const result = saveHolidays(holidays);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to save holidays');

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

      localStorage.setItem('longWeekendApp:holidays', JSON.stringify(holidays));

      const loaded = loadHolidays();

      expect(loaded).toEqual(holidays);
    });

    it('should return empty array when no data stored', () => {
      const loaded = loadHolidays();

      expect(loaded).toEqual([]);
    });

    it('should handle corrupted JSON data gracefully', () => {
      localStorage.setItem('longWeekendApp:holidays', 'invalid JSON {]');

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const loaded = loadHolidays();

      expect(loaded).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Corrupted localStorage data'),
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

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const loaded = loadHolidays();

      expect(loaded).toEqual([]);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('localStorage access denied')
      );

      consoleWarnSpy.mockRestore();
      mockGetItem.mockRestore();
    });

    it('should validate data structure and filter invalid entries', () => {
      const mixedData = [
        { id: '1', name: 'Valid Holiday', date: '2025-11-27' }, // Valid
        { name: 'Missing ID', date: '2025-12-25' }, // Invalid: no id
        { id: '3', date: '2025-01-01' }, // Invalid: no name
        { id: '4', name: 'Valid Holiday 2', date: '2025-07-04' }, // Valid
        'not an object', // Invalid
      ];

      localStorage.setItem('longWeekendApp:holidays', JSON.stringify(mixedData));

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const loaded = loadHolidays();

      // Should only load valid entries
      expect(loaded).toHaveLength(2);
      expect(loaded[0].name).toBe('Valid Holiday');
      expect(loaded[1].name).toBe('Valid Holiday 2');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Filtered 3 invalid holidays')
      );

      consoleWarnSpy.mockRestore();
    });

    it('should handle non-array data gracefully', () => {
      localStorage.setItem('longWeekendApp:holidays', JSON.stringify({ not: 'an array' }));

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const loaded = loadHolidays();

      expect(loaded).toEqual([]);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('not an array')
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe('clearHolidays', () => {
    it('should clear holidays from localStorage', () => {
      const holidays: Holiday[] = [createHoliday()];
      localStorage.setItem('longWeekendApp:holidays', JSON.stringify(holidays));

      clearHolidays();

      const stored = localStorage.getItem('longWeekendApp:holidays');
      expect(stored).toBeNull();
    });

    it('should handle errors gracefully', () => {
      const mockRemoveItem = vi.spyOn(Storage.prototype, 'removeItem');
      mockRemoveItem.mockImplementation(() => {
        throw new Error('Remove error');
      });

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => clearHolidays()).not.toThrow();
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
      mockRemoveItem.mockRestore();
    });
  });
});
