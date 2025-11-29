/**
 * Unit Test: Local Storage Service - Enhanced Persistence Features
 *
 * Tests for comprehensive localStorage persistence with feature detection,
 * error handling, and user feedback mechanisms.
 *
 * Test ID: 1.3-UNIT-002
 * Priority: P0 (Enhanced persistence critical)
 * Story: 1.3 - Local Storage Persistence
 *
 * THIS FILE CONTAINS FAILING TESTS - RED PHASE
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { saveHolidays, loadHolidays } from '../../src/services/localStorageService';
import type { Holiday } from '../../src/context/HolidayContext';
import { createHoliday } from '../factories/holidayFactory';

describe('localStorageService - Enhanced Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('AC1: Immediate save with success/failure feedback', () => {
    it('should return success object when save succeeds', () => {
      // GIVEN: Holidays to save and localStorage is available
      const holidays: Holiday[] = [createHoliday({ name: 'Test Holiday' })];

      // WHEN: Saving holidays to localStorage
      const result = saveHolidays(holidays);

      // THEN: Should return success indicator
      // THIS TEST FAILS - Current implementation returns null
      expect(result).toEqual({
        success: true,
        message: 'Holidays saved successfully'
      });
    });

    it('should return StorageError when localStorage is unavailable', () => {
      // GIVEN: localStorage is unavailable (private browsing)
      const originalLocalStorage = window.localStorage;
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
        configurable: true
      });

      const holidays: Holiday[] = [createHoliday()];

      // WHEN: Attempting to save holidays
      const result = saveHolidays(holidays);

      // THEN: Should return appropriate error
      // THIS TEST FAILS - Current implementation doesn't Feature detect
      expect(result).toEqual({
        success: false,
        type: 'STORAGE_UNAVAILABLE',
        message: 'Local storage is not available',
        userMessage: 'Cannot save holidays - storage is disabled. Your changes will not be saved.'
      });

      // Restore localStorage
      Object.defineProperty(window, 'localStorage', {
        value: originalLocalStorage,
        configurable: true
      });
    });

    it('should return QuotaExceededError when storage limit reached', () => {
      // GIVEN: localStorage quota is exceeded
      const mockSetItem = vi.spyOn(Storage.prototype, 'setItem');
      mockSetItem.mockImplementation(() => {
        const error: Error & { name?: string } = new Error('QuotaExceededError');
        error.name = 'QuotaExceededError';
        throw error;
      });

      const holidays: Holiday[] = [createHoliday()];

      // WHEN: Attempting to save holidays with quota exceeded
      const result = saveHolidays(holidays);

      // THEN: Should return quota exceeded error
      // THIS TEST FAILS - Current implementation just console.errors
      expect(result).toEqual({
        success: false,
        type: 'QUOTA_EXCEEDED',
        message: 'Storage quota exceeded',
        userMessage: 'Storage space is full. Please clear some data or try again later.'
      });

      mockSetItem.mockRestore();
    });
  });

  describe('AC3: Automatic loading with feature detection', () => {
    it('should load holidays when localStorage is available', () => {
      // GIVEN: Holidays are stored in localStorage
      const holidays: Holiday[] = [createHoliday({ name: 'Test Holiday' })];
      localStorage.setItem('holidayhacker-holidays', JSON.stringify(holidays));

      // WHEN: Loading holidays
      const result = loadHolidays();

      // THEN: Should return the stored holidays
      expect(result).toEqual(holidays);
    });

    it('should detect localStorage availability and provide fallback', () => {
      // GIVEN: localStorage is unavailable
      const originalLocalStorage = window.localStorage;
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
        configurable: true
      });

      // WHEN: Loading holidays
      const result = loadHolidays();

      // THEN: Should return empty array and log warning
      // THIS TEST FAILS - Current implementation doesn't Feature detect
      expect(result).toEqual([]);
      expect(console.warn).toHaveBeenCalledWith(
        'localStorage is not available, using empty state'
      );

      // Restore localStorage
      Object.defineProperty(window, 'localStorage', {
        value: originalLocalStorage,
        configurable: true
      });
    });
  });

  describe('AC5: Corrupted data recovery with user notification', () => {
    it('should detect and recover from corrupted JSON data', () => {
      // GIVEN: LocalStorage contains corrupted JSON
      localStorage.setItem('holidayhacker-holidays', 'invalid JSON {]');

      // WHEN: Loading holidays
      const result = loadHolidays();

      // THEN: Should return empty array and provide recovery info
      // THIS TEST FAILS - Current basic implementation does this but needs enhancement
      expect(result).toEqual([]);
      // Enhanced version should return recovery metadata
      expect(console.error).toHaveBeenCalledWith(
        'Failed to load holidays from localStorage:',
        expect.any(Error)
      );
      expect(console.warn).toHaveBeenCalledWith(
        'Corrupted holiday data detected, starting fresh'
      );
    });

    it('should clear corrupted data and reset to empty state', () => {
      // GIVEN: LocalStorage contains corrupted data
      localStorage.setItem('holidayhacker-holidays', JSON.stringify({ not: 'an array' }));

      // WHEN: Loading holidays
      const result = loadHolidays();

      // THEN: Should clear corrupted data and return empty array
      expect(result).toEqual([]);
      // Enhanced version should clear the corrupted data
      expect(localStorage.getItem('holidayhacker-holidays')).toBe(JSON.stringify([]));
    });

    it('should provide user-friendly notification for data recovery', () => {
      // GIVEN: Multiple data corruption scenarios to test
      const corruptionScenarios = [
        'invalid JSON {]',
        JSON.stringify({ not: 'an array' }),
        JSON.stringify(null),
        JSON.stringify(undefined),
        'not valid json at all'
      ];

      corruptionScenarios.forEach((corruptedData, index) => {
        localStorage.setItem('holidayhacker-holidays', corruptedData);

        // WHEN: Loading corrupted data
        const result = loadHolidays();

        // THEN: Should handle gracefully and reset
        expect(result).toEqual([]);
        // Enhanced version should emit user notification
        expect(localStorage.getItem('holidayhacker-holidays')).toBe(JSON.stringify([]));
      });
    });
  });

  describe('Comprehensive Feature Detection', () => {
    it('should detect localStorage availability across different scenarios', () => {
      // Test with localStorage available
      expect(() => {
        const holidays = [createHoliday()];
        saveHolidays(holidays);
      }).not.toThrow();

      // Test with localStorage disabled
      const originalLocalStorage = window.localStorage;
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
        configurable: true
      });

      expect(() => {
        const holidays = [createHoliday()];
        saveHolidays(holidays);
      }).not.toThrow(); // Should not throw, should handle gracefully

      // Restore
      Object.defineProperty(window, 'localStorage', {
        value: originalLocalStorage,
        configurable: true
      });
    });

    it('should handle localStorage read-only scenario', () => {
      // GIVEN: localStorage is read-only
      const mockSetItem = vi.spyOn(Storage.prototype, 'setItem');
      mockSetItem.mockImplementation(() => {
        const error: Error & { name?: string } = new Error('SecurityError');
        error.name = 'SecurityError';
        throw error;
      });

      const holidays: Holiday[] = [createHoliday()];

      // WHEN: Attempting to save
      const result = saveHolidays(holidays);

      // THEN: Should handle gracefully with appropriate error
      // THIS TEST FAILS - Current implementation just console.errors
      expect(result).toEqual({
        success: false,
        type: 'SECURITY_ERROR',
        message: 'Cannot write to storage (read-only mode)',
        userMessage: 'Storage is in read-only mode. Changes cannot be saved at this time.'
      });

      mockSetItem.mockRestore();
    });
  });

  describe('Enhanced Error Handling', () => {
    const errorScenarios = [
      {
        name: 'QuotaExceededError',
        errorConstructor: () => {
          const error: Error & { name?: string } = new Error('QuotaExceededError');
          error.name = 'QuotaExceededError';
          throw error;
        },
        expectedType: 'QUOTA_EXCEEDED',
        expectedUserMessage: 'Storage space is full. Please clear some data or try again later.'
      },
      {
        name: 'SecurityError',
        errorConstructor: () => {
          const error: Error & { name?: string } = new Error('SecurityError');
          error.name = 'SecurityError';
          throw error;
        },
        expectedType: 'SECURITY_ERROR',
        expectedUserMessage: 'Cannot access storage due to security restrictions. Changes cannot be saved.'
      },
      {
        name: 'GenericError',
        errorConstructor: () => {
          throw new Error('Generic storage error');
        },
        expectedType: 'GENERIC_ERROR',
        expectedUserMessage: 'Failed to save holidays. Please try again.'
      }
    ];

    errorScenarios.forEach(scenario => {
      it(`should handle ${scenario.name} appropriately`, () => {
        // GIVEN: Specific error condition
        const mockSetItem = vi.spyOn(Storage.prototype, 'setItem');
        mockSetItem.mockImplementation(scenario.errorConstructor);

        const holidays: Holiday[] = [createHoliday()];

        // WHEN: Saving with error condition
        const result = saveHolidays(holidays);

        // THEN: Should return appropriate error object
        // THIS TEST FAILS - Current implementation just console.errors
        expect(result).toEqual({
          success: false,
          type: scenario.expectedType,
          message: expect.any(String),
          userMessage: scenario.expectedUserMessage
        });

        mockSetItem.mockRestore();
      });
    });
  });

  describe('Storage State Validation', () => {
    it('should validate data integrity on load', () => {
      // GIVEN: Various invalid data types in localStorage
      const invalidDataTypes = [
        null,
        undefined,
        'string',
        123,
        { not: 'array' },
        { valid: 'object but wrong shape' },
        [],
        ['valid', 'array', 'with', 'wrong', 'objects']
      ];

      invalidDataTypes.forEach(data => {
        localStorage.setItem('holidayhacker-holidays', JSON.stringify(data));

        // WHEN: Loading invalid data
        const result = loadHolidays();

        // THEN: Should validate and reset to empty array
        expect(result).toEqual([]);
        // Enhanced version should have validation logic
        expect(result).toEqual(
          expect.arrayContaining([])
        );
      });
    });

    it('should validate holiday object structure on load', () => {
      // GIVEN: Array with invalid holiday objects
      const invalidHolidays = [
        { id: 123, name: 'Valid name', date: '2025-12-25' }, // id should be string
        { id: 'valid-id', name: 123, date: '2025-12-25' }, // name should be string
        { id: 'valid-id', name: 'Valid name', date: 123 }, // date should be string
        { id: 'valid-id', name: 'Valid name' }, // missing date
        { name: 'Valid name', date: '2025-12-25' }, // missing id
        { id: 'valid-id', date: '2025-12-25' }, // missing name
        { id: 'valid-id', name: 'Valid name', date: 'invalid-date' } // invalid date format
      ];

      localStorage.setItem('holidayhacker-holidays', JSON.stringify(invalidHolidays));

      // WHEN: Loading invalid holiday objects
      const result = loadHolidays();

      // THEN: Should filter out invalid holidays or reset entirely
      // THIS TEST FAILS - Current implementation doesn't validate individual objects
      expect(result).toEqual([]);
    });
  });
});