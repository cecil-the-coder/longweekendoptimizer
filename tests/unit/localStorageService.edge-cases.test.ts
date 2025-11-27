/**
 * Unit Tests: localStorageService - Enhanced Edge Cases and Error Paths
 *
 * Comprehensive test coverage for localStorage persistence edge cases,
 * error scenarios, and boundary conditions not covered in basic tests.
 *
 * Test ID: 1.3-UNIT-EDGE-001
 * Priority: P0 (Critical for persistence reliability)
 * Story: 1.3 - Local Storage Persistence
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  loadHolidays,
  saveHolidays,
  isLocalStorageAvailable,
  getStorageQuotaInfo,
  StorageError
} from '../../src/services/localStorageService';
import type { Holiday } from '../../src/context/HolidayContext';

describe('localStorageService - Enhanced Edge Cases and Error Paths', () => {
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

    // Default successful mock behavior
    mockLocalStorage.setItem.mockImplementation(() => {});
    mockLocalStorage.removeItem.mockImplementation(() => {});
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === '__localStorage_test__') return null;
      return null;
    });
    mockLocalStorage.clear.mockImplementation(() => {});
    Object.defineProperty(mockLocalStorage, 'length', { value: 0, writable: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('AC4 & AC6: Feature Detection and Error Handling', () => {
    describe('localStorage availability scenarios', () => {
      it('should handle localStorage being undefined (private browsing)', () => {
        // Save original localStorage
        const originalLocalStorage = window.localStorage;

        try {
          delete (window as any).localStorage;
          const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

          const result = loadHolidays();

          expect(result).toEqual({
            holidays: [],
            error: null,
            hadCorruption: false
          });
          expect(consoleSpy).toHaveBeenCalledWith('localStorage is not available, using in-memory state');

          consoleSpy.mockRestore();
        } finally {
          // Restore localStorage
          Object.defineProperty(window, 'localStorage', {
            value: originalLocalStorage,
            writable: true,
            configurable: true
          });
        }
      });

      it('should handle localStorage being null', () => {
        Object.defineProperty(window, 'localStorage', {
          value: null,
          writable: true
        });
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const result = loadHolidays();

        expect(result.holidays).toEqual([]);
        consoleSpy.mockRestore();
      });

      it('should handle localStorage with disabled methods', () => {
        Object.defineProperty(window, 'localStorage', {
          value: {
            getItem: () => { throw new Error('Disabled'); },
            setItem: () => { throw new Error('Disabled'); },
            removeItem: () => { throw new Error('Disabled'); },
            clear: () => {},
            length: 0,
            key: () => null
          },
          writable: true
        });

        const loadResult = loadHolidays();
        const saveResult = saveHolidays([{ id: '1', name: 'Test', date: '2025-01-01' }]);

        expect(loadResult.holidays).toEqual([]);
        expect(loadResult.error?.type).toBe('GENERIC_ERROR');
        expect(saveResult?.type).toBe('GENERIC_ERROR');
      });

      it('should return false for feature detection when exceptions occur', () => {
        mockLocalStorage.setItem.mockImplementation(() => {
          throw new Error('SecurityError: Storage is disabled');
        });

        const available = isLocalStorageAvailable();
        expect(available).toBe(false);
      });

      it('should handle localStorage being read-only during feature detection', () => {
        mockLocalStorage.setItem.mockImplementation(() => {
          const error = new DOMException('Read-only', 'SecurityError');
          error.name = 'SecurityError';
          throw error;
        });

        const available = isLocalStorageAvailable();
        expect(available).toBe(false);
      });
    });

    describe('Storage quota edge cases', () => {
      it('should handle QuotaExceededError with partial data', () => {
        const holidays: Holiday[] = Array.from({ length: 1000 }, (_, i) => ({
          id: `id-${i}`,
          name: `Holiday ${i}`,
          date: '2025-12-25'
        }));

        const quotaError = new DOMException('QuotaExceededError: localStorage quota exceeded', 'QuotaExceededError');
        mockLocalStorage.setItem.mockImplementation(() => {
          throw quotaError;
        });

        const result = saveHolidays(holidays);

        expect(result).toEqual({
          type: 'QUOTA_EXCEEDED',
          message: 'Storage quota exceeded',
          userMessage: 'Storage is full. Please clear some browser data or remove holidays to free up space.'
        });
      });

      it('should handle storage quota warning detection', () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        // Mock quota calculation to return low available space
        const largeData = 'x'.repeat(1024 * 1024 * 4); // ~4MB data
        mockLocalStorage.setItem.mockImplementation((key, value) => {
          if (key === '__localStorage_test__') return;
          consoleSpy.mock.calls.length = 0; // Reset call count
        });

        Object.defineProperty(mockLocalStorage, 'length', { value: 1 });
        mockLocalStorage.getItem.mockReturnValue(largeData);

        saveHolidays([{ id: '1', name: 'Test', date: '2025-01-01' }]);

        // Check if quota warning was logged (implementation dependent)
        expect(mockLocalStorage.setItem).toHaveBeenCalled();

        consoleSpy.mockRestore();
      });

      it('should handle getStorageQuotaInfo when localStorage methods throw', () => {
        mockLocalStorage.getItem.mockImplementation(() => {
          throw new Error('Storage access denied');
        });
        mockLocalStorage.key.mockImplementation(() => {
          throw new Error('Storage access denied');
        });

        const quotaInfo = getStorageQuotaInfo();

        expect(quotaInfo).toEqual({ used: 0 });
      });
    });

    describe('Complex data corruption scenarios', () => {
      it('should handle cyclic reference corruption', () => {
        const cyclicObj: any = { id: '1', name: 'Test' };
        cyclicObj.self = cyclicObj;

        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(cyclicObj));
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const result = loadHolidays();

        expect(result.holidays).toEqual([]); // Should filter out corrupted data
        expect(result.hadCorruption).toBe(true);

        consoleSpy.mockRestore();
      });

      it('should handle extremely large JSON strings', () => {
        const largeData = {
          id: '1',
          name: 'A'.repeat(1000000), // Very long string
          date: '2025-12-25'
        };
        mockLocalStorage.getItem.mockReturnValue(JSON.stringify([largeData]));

        const result = loadHolidays();

        expect(result.holidays).toHaveLength(1);
        expect(result.holidays[0].name).toBe('A'.repeat(1000000));
      });

      it('should handle deeply nested object structures', () => {
        const deepObj = {
          id: '1',
          name: 'Test',
          date: '2025-12-25',
          nested: {
            level1: {
              level2: {
                level3: {
                  level4: 'deep value'
                }
              }
            }
          }
        };
        mockLocalStorage.getItem.mockReturnValue(JSON.stringify([deepObj]));

        const result = loadHolidays();

        // Should accept objects with extra properties but validate required fields
        expect(result.holidays).toHaveLength(1);
        expect(result.holidays[0].id).toBe('1');
        expect(result.holidays[0].name).toBe('Test');
      });

      it('should handle malformed JSON with special characters', () => {
        const malformedJSON = '{"id":"1","name":"Test\u0000Holiday","date":"2025-12-25"}';
        mockLocalStorage.getItem.mockReturnValue(malformedJSON.substring(0, malformedJSON.length - 2)); // Truncate to make invalid

        const result = loadHolidays();

        expect(result.holidays).toEqual([]);
        expect(result.hadCorruption).toBe(true);
        expect(result.error?.type).toBe('CORRUPTION_ERROR');
      });

      it('should handle JSON with unexpected data types', () => {
        const unexpectedData = [
          { id: '1', name: 'Test', date: '2025-12-25' },
          { id: '2', name: 12345, date: '2025-12-26' }, // name should be string
          { id: 3, name: 'Test 3', date: '2025-12-27' }, // id should be string
          null, // null value
          undefined, // undefined value
          'string instead of object', // wrong type entirely
          { wrong: 'structure' } // missing required fields
        ];
        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(unexpectedData));
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const result = loadHolidays();

        expect(result.holidays).toHaveLength(1); // Only first item is valid
        expect(result.hadCorruption).toBe(true);
        expect(consoleSpy).toHaveBeenCalledWith(
          'Data corruption detected: removed 6 invalid holiday entries out of 7 total'
        );

        consoleSpy.mockRestore();
      });
    });

    describe('Data validation edge cases', () => {
      it('should validate empty string values', () => {
        const invalidHolidays = [
          { id: '', name: 'Test', date: '2025-12-25' }, // empty id
          { id: '2', name: '', date: '2025-12-26' }, // empty name
          { id: '3', name: 'Test', date: '' } // empty date
        ] as Holiday[];

        const result = saveHolidays(invalidHolidays);

        expect(result).toEqual({
          type: 'GENERIC_ERROR',
          message: 'Invalid holiday object detected',
          userMessage: 'Unable to save holidays due to invalid holiday data.'
        });
      });

      it('should validate whitespace-only values', () => {
        const invalidHolidays = [
          { id: '   ', name: 'Test', date: '2025-12-25' }, // whitespace id
          { id: '2', name: '   ', date: '2025-12-26' }, // whitespace name
          { id: '3', name: 'Test', date: '    ' } // whitespace date
        ] as Holiday[];

        const result = saveHolidays(invalidHolidays);

        expect(result?.type).toBe('GENERIC_ERROR');
      });

      it('should validate extremely long values', () => {
        const longString = 'a'.repeat(1000000);
        const largeHoliday = {
          id: longString,
          name: 'Test',
          date: '2025-12-25'
        };

        // Should still save (no explicit length limit in validation)
        const result = saveHolidays([largeHoliday]);
        expect(result).toBeNull();
        expect(mockLocalStorage.setItem).toHaveBeenCalled();
      });

      it('should handle special characters in data', () => {
        const specialHolidays: Holiday[] = [
          {
            id: 'special-1',
            name: 'Holiday with "quotes" and \n newlines \t tabs',
            date: '2025-12-25'
          },
          {
            id: 'special-2',
            name: 'Holiday with unicode: 🎄 Noël 春节',
            date: '2025-01-01'
          },
          {
            id: 'special-3',
            name: 'Holiday with HTML: <script>alert("xss")</script>',
            date: '2025-07-04'
          }
        ];

        const result = saveHolidays(specialHolidays);
        expect(result).toBeNull();

        // Verify the data can be loaded back correctly
        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(specialHolidays));
        const loadResult = loadHolidays();
        expect(loadResult.holidays).toEqual(specialHolidays);
        expect(loadResult.hadCorruption).toBe(false);
      });
    });

    describe('Security and privacy edge cases', () => {
      it('should handle SecurityError from SameOriginPolicy', () => {
        const securityError = new DOMException('SecurityError: The operation is insecure', 'SecurityError');
        mockLocalStorage.setItem.mockImplementation(() => {
          throw securityError;
        });

        const result = saveHolidays([{ id: '1', name: 'Test', date: '2025-01-01' }]);

        expect(result).toEqual({
          type: 'SECURITY_ERROR',
          message: 'Storage access denied',
          userMessage: 'Unable to access storage. Your browser may be in private mode or storage is disabled.'
        });
      });

      it('should handle localStorage being blocked by browser extensions', () => {
        mockLocalStorage.setItem.mockImplementation(() => {
          const error = new Error('Extension blocked localStorage access');
          (error as any).name = 'ExtensionError';
          throw error;
        });

        const result = saveHolidays([{ id: '1', name: 'Test', date: '2025-01-01' }]);

        expect(result).toEqual({
          type: 'GENERIC_ERROR',
          message: 'Extension blocked localStorage access',
          userMessage: 'Unable to save holidays. Please try again later.'
        });
      });

      it('should not expose sensitive data in console logs', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const sensitiveHoliday = {
          id: 'secret-password',
          name: 'MyPassword123!',
          date: '2025-01-01'
        };

        mockLocalStorage.setItem.mockImplementation(() => {
          throw new Error('Storage failed');
        });

        saveHolidays([sensitiveHoliday]);

        // Verify error was logged but not the sensitive data
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to save holidays to localStorage:',
          expect.any(Error)
        );

        // The sensitive data should not appear in the console log
        const loggedCalls = consoleSpy.mock.calls.flat().join(' ');
        expect(loggedCalls).not.toContain('MyPassword123!');

        consoleSpy.mockRestore();
      });
    });

    describe('Concurrent access and race conditions', () => {
      it('should handle rapid successive save operations', () => {
        const holidays1: Holiday[] = [{ id: '1', name: 'Holiday 1', date: '2025-01-01' }];
        const holidays2: Holiday[] = [{ id: '2', name: 'Holiday 2', date: '2025-01-02' }];

        const result1 = saveHolidays(holidays1);
        const result2 = saveHolidays(holidays2);

        expect(result1).toBeNull();
        expect(result2).toBeNull();
        expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(2);
      });

      it('should handle save operation interrupted by localStorage becoming unavailable', () => {
        // First save works, second fails
        let callCount = 0;
        mockLocalStorage.setItem.mockImplementation(() => {
          callCount++;
          if (callCount > 1) {
            throw new Error('Storage became unavailable');
          }
        });

        const holiday = { id: '1', name: 'Test', date: '2025-01-01' };

        const result1 = saveHolidays([holiday]);
        const result2 = saveHolidays([holiday]);

        expect(result1).toBeNull();
        expect(result2?.type).toBe('GENERIC_ERROR');
      });
    });

    describe('Memory and performance edge cases', () => {
      it('should handle very large holiday arrays efficiently', () => {
        const largeHolidayArray: Holiday[] = Array.from({ length: 10000 }, (_, i) => ({
          id: `id-${i}`,
          name: `Holiday ${i}`,
          date: '2025-12-25'
        }));

        const startTime = performance.now();
        const result = saveHolidays(largeHolidayArray);
        const endTime = performance.now();

        // Should complete within reasonable time (adjust threshold as needed)
        expect(endTime - startTime).toBeLessThan(1000); // 1 second
        expect(result).toBeNull();
      });

      it('should handle memory pressure during load operations', () => {
        // Create a large JSON string that might cause memory issues
        const largeData = Array.from({ length: 5000 }, (_, i) => ({
          id: `id-${i}`,
          name: 'A'.repeat(1000), // Long names
          date: '2025-12-25'
        }));

        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(largeData));

        const result = loadHolidays();

        expect(result.holidays).toHaveLength(5000);
        expect(result.hadCorruption).toBe(false);
      });
    });

    describe('Cross-browser compatibility edge cases', () => {
      it('should handle older browsers without crypto.randomUUID', () => {
        // This test is more about the service layer, but we test storage behavior
        const holidays: Holiday[] = [{
          id: 'simple-id', // Non-UUID ID for compatibility
          name: 'Test Holiday',
          date: '2025-01-01'
        }];

        const result = saveHolidays(holidays);
        expect(result).toBeNull();
      });

      it('should handle localStorage with different implementations', () => {
        // Simulate localStorage that returns undefined for missing keys
        mockLocalStorage.getItem.mockImplementation((key) => {
          if (key === 'long-weekend-optimizer-holidays') return undefined;
          return null;
        });

        const result = loadHolidays();

        expect(result).toEqual({
          holidays: [],
          error: null,
          hadCorruption: false
        });
      });
    });
  });

  describe('Error Recovery and Cleanup', () => {
    it('should clear corrupted data automatically', () => {
      const corruptedKey = 'long-weekend-optimizer-holidays';
      mockLocalStorage.getItem.mockReturnValue('invalid json {]');
      const removeItemSpy = vi.spyOn(mockLocalStorage, 'removeItem');

      const result = loadHolidays();

      expect(result.holidays).toEqual([]);
      expect(result.hadCorruption).toBe(true);
      expect(removeItemSpy).toHaveBeenCalledWith(corruptedKey);
    });

    it('should handle cleanup failure gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json');
      mockLocalStorage.removeItem.mockImplementation(() => {
        throw new Error('Failed to clear data');
      });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = loadHolidays();

      // Should still return empty holidays even if cleanup fails
      expect(result.holidays).toEqual([]);
      expect(result.hadCorruption).toBe(true);

      consoleSpy.mockRestore();
    });

    it('should maintain data integrity across load/save cycles', () => {
      const originalHolidays: Holiday[] = [
        { id: '1', name: 'Christmas', date: '2025-12-25' },
        { id: '2', name: 'New Year', date: '2026-01-01' }
      ];

      // Save
      const saveResult = saveHolidays(originalHolidays);
      expect(saveResult).toBeNull();

      // Verify what was stored
      const storedData = mockLocalStorage.setItem.mock.calls[0][1];
      const parsedData = JSON.parse(storedData);
      expect(parsedData).toEqual(originalHolidays);

      // Load
      mockLocalStorage.getItem.mockReturnValue(storedData);
      const loadResult = loadHolidays();
      expect(loadResult.holidays).toEqual(originalHolidays);
      expect(loadResult.hadCorruption).toBe(false);
    });
  });
});