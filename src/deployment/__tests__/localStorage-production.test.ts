// LocalStorage Production Environment Tests
// Story 1.7: GitHub Pages Deployment Pipeline
// These tests validate that localStorage functionality works correctly in deployed environment
// ATDD Approach: Tests will FAIL until production deployment is implemented

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';
import { loadHolidays, saveHolidays, isLocalStorageAvailable, getStorageQuotaInfo } from '../../services/localStorageService';
import { Holiday } from '../../context/HolidayContext';

describe('AC5: Local storage functionality works in deployed environment', () => {
  let dom: JSDOM;
  let localStorageSpy: any;

  beforeEach(() => {
    // Set up JSDOM environment simulating production deployment
    dom = new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>', {
      url: 'https://username.github.io/repository/',
      pretendToBeVisual: true,
      resources: 'usable'
    });

    // Mock localStorage with production environment characteristics
    localStorageSpy = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn()
    };

    global.window = dom.window as any;
    global.document = dom.window.document;
    global.localStorage = localStorageSpy;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('HTTPS Environment LocalStorage Access', () => {
    it('should detect localStorage availability in HTTPS production environment', () => {
      // This test will FAIL until proper HTTPS detection is implemented
      localStorageSpy.setItem.mockImplementation(() => {});
      localStorageSpy.removeItem.mockImplementation(() => {});
      localStorageSpy.getItem.mockReturnValue(null);

      const isAvailable = isLocalStorageAvailable();

      expect(isAvailable).toBe(true);
      expect(window.location.protocol).toBe('https:');
    });

    it('should operate correctly with HTTPS security context', () => {
      // Test that localStorage works within HTTPS security constraints
      localStorageSpy.setItem.mockImplementation((key: string, value: string) => {
        // Simulate successful storage in HTTPS context
        localStorageSpy.setItem.mockReturnValue(undefined);
      });

      const holidays: Holiday[] = [
        { id: '1', name: 'Thanksgiving', date: '2025-11-27' }
      ];

      const result = saveHolidays(holidays);

      expect(result).toBeNull();
      expect(localStorageSpy.setItem).toHaveBeenCalledWith(
        'holidayhacker-holidays',
        JSON.stringify(holidays)
      );
    });

    it('should handle secure context restrictions properly', () => {
      // This test will FAIL until secure context handling is implemented
      // Simulate scenario where localStorage might be restricted in some HTTPS contexts
      localStorageSpy.setItem.mockImplementation(() => {
        throw new DOMException('Storage access denied', 'SecurityError');
      });

      const holidays: Holiday[] = [{ id: '1', name: 'Test', date: '2025-01-01' }];
      const result = saveHolidays(holidays);

      expect(result).toEqual({
        type: 'SECURITY_ERROR',
        message: 'Storage access denied',
        userMessage: 'Unable to access storage. Your browser may be in private mode or storage is disabled.'
      });
    });
  });

  describe('Cross-Origin and iframe Context Handling', () => {
    it('should detect when running in iframe context', () => {
      // This test will FAIL until iframe detection is implemented
      // Simulate iframe deployment scenario
      Object.defineProperty(window, 'top', {
        value: undefined,
        writable: true
      });

      Object.defineProperty(window, 'self', {
        value: dom.window,
        writable: true
      });

      // Application should detect iframe context and handle storage accordingly
      const isInIframe = window.top !== window.self;

      expect(isInIframe).toBe(false); // Default to false for direct GitHub Pages access
    });

    it('should handle storage access in third-party context restrictions', () => {
      // This test will FAIL until third-party cookie restrictions are handled
      // Simulate Safari ITP scenario or similar restrictions
      localStorageSpy.setItem.mockImplementation(() => {
        throw new DOMException('Storage access denied', 'SecurityError');
      });

      const result = saveHolidays([]);

      expect(result).not.toBeNull();
      expect(result?.type).toBe('SECURITY_ERROR');
    });
  });

  describe('Storage Persistence and Data Integrity', () => {
    it('should maintain data persistence across page reloads in production', () => {
      // This test will FAIL until production environment testing is possible
      // Simulate saving and then loading the same data
      const holidays: Holiday[] = [
        { id: '1', name: 'Christmas', date: '2025-12-25' },
        { id: '2', name: 'New Year', date: '2026-01-01' }
      ];

      // Simulate successful save
      localStorageSpy.setItem.mockImplementation(() => {});

      // Simulate retrieving the same data on reload
      localStorageSpy.getItem.mockReturnValue(JSON.stringify(holidays));

      // Save the data
      const saveResult = saveHolidays(holidays);
      expect(saveResult).toBeNull();

      // Load it back (simulating page reload)
      const loadResult = loadHolidays();

      expect(loadResult.holidays).toEqual(holidays);
      expect(loadResult.error).toBeNull();
      expect(loadResult.hadCorruption).toBe(false);
    });

    it('should handle storage quota limitations in production browser contexts', () => {
      // This test will FAIL until quota management is tested in production
      localStorageSpy.setItem.mockImplementation(() => {
        const quotaError = new DOMException('Storage quota exceeded', 'QuotaExceededError');
        throw quotaError;
      });

      const holidays: Holiday[] = Array.from({ length: 1000 }, (_, i) => ({
        id: `holiday-${i}`,
        name: `Holiday ${i}`,
        date: `2025-12-${i.toString().padStart(2, '0')}`
      }));

      const result = saveHolidays(holidays);

      expect(result).toEqual({
        type: 'QUOTA_EXCEEDED',
        message: 'Storage quota exceeded',
        userMessage: 'Storage is full. Please clear some browser data or remove holidays to free up space.'
      });
    });

    it('should detect and handle storage corruption in production', () => {
      // This test will FAIL until corruption handling is production-tested
      // Simulate corrupted data in storage
      localStorageSpy.getItem.mockReturnValue('{"invalid": json structure');

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = loadHolidays();

      expect(result.holidays).toEqual([]);
      expect(result.error).not.toBeNull();
      expect(result.hadCorruption).toBe(true);
      expect(result.error?.type).toBe('CORRUPTION_ERROR');

      consoleSpy.mockRestore();
    });
  });

  describe('Storage Performance in Production', () => {
    it('should optimize storage operations for production performance', async () => {
      // This test will FAIL until performance optimization is implemented
      const holidays: Holiday[] = Array.from({ length: 100 }, (_, i) => ({
        id: `holiday-${i}`,
        name: `Performance Test Holiday ${i}`,
        date: `2025-12-${(i % 28 + 1).toString().padStart(2, '0')}`
      }));

      // Mock successful storage operations
      localStorageSpy.setItem.mockImplementation(() => {});
      localStorageSpy.getItem.mockReturnValue(JSON.stringify(holidays));

      const startTime = performance.now();

      // Test save performance
      const saveResult = saveHolidays(holidays);
      expect(saveResult).toBeNull();

      // Test load performance
      const loadResult = loadHolidays();
      expect(loadResult.holidays).toHaveLength(100);

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Operations should complete within reasonable time
      expect(duration).toBeLessThan(100); // 100ms threshold
    });

    it('should batch storage operations for better performance', () => {
      // This test will FAIL until batching is implemented
      const operations: Array<() => void> = [];
      const originalSetItem = localStorageSpy.setItem;
      const originalGetItem = localStorageSpy.getItem;

      // Mock batched operations
      localStorageSpy.setItem.mockImplementation((key: string, value: string) => {
        operations.push(() => originalSetItem(key, value));
      });

      const holidays: Holiday[] = [
        { id: '1', name: 'Holiday 1', date: '2025-01-01' },
        { id: '2', name: 'Holiday 2', date: '2025-01-02' }
      ];

      saveHolidays(holidays);

      // Should batch operations (this is a conceptual test)
      expect(operations).toHaveLength(1); // One batched operation
    });
  });

  describe('Storage Quota Management in Production', () => {
    it('should provide accurate storage quota information', () => {
      // This test will FAIL until quota estimation is production-ready
      localStorageSpy.getItem.mockImplementation((key) => {
        if (key.includes('test')) return null;
        return 'sample-data';
      });
      localStorageSpy.setItem.mockReturnValue(undefined);
      localStorageSpy.removeItem.mockReturnValue(undefined);

      // Mock storage with some data
      Object.defineProperty(localStorageSpy, 'length', { value: 5 });

      const quotaInfo = getStorageQuotaInfo();

      expect(quotaInfo).toHaveProperty('used');
      expect(quotaInfo).toHaveProperty('available');
      expect(quotaInfo).toHaveProperty('total');
      expect(typeof quotaInfo.used).toBe('number');
      expect(quotaInfo.used).toBeGreaterThanOrEqual(0);
    });

    it('should warn when approaching storage limits', () => {
      // This test will FAIL until quota warnings are implemented
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Simulate nearly full storage
      localStorageSpy.getItem.mockImplementation(() => {
        // Return large data to simulate near-full storage
        return 'x'.repeat(5000000); // 5MB of data
      });

      const quotaInfo = getStorageQuotaInfo();

      // Should warn when usage is high
      if (quotaInfo.used > 4000000) { // 4MB threshold
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('Storage usage is high')
        );
      }

      consoleSpy.mockRestore();
    });
  });

  describe('Production Storage Security', () => {
    it('should not store sensitive information in localStorage', () => {
      // This test will FAIL until security validation is implemented
      const holidays: Holiday[] = [
        { id: '1', name: 'Test Holiday', date: '2025-01-01' }
      ];

      localStorageSpy.setItem.mockImplementation((key: string, value: string) => {
        // Validate that no sensitive data is being stored
        const sensitivePatterns = [
          /password/i,
          /token/i,
          /secret/i,
          /api[_-]?key/i
        ];

        const containsSensitive = sensitivePatterns.some(pattern =>
          pattern.test(key) || pattern.test(value)
        );

        expect(containsSensitive).toBe(false);
      });

      saveHolidays(holidays);

      expect(localStorageSpy.setItem).toHaveBeenCalledWith(
        'holidayhacker-holidays',
        expect.stringContaining('Test Holiday')
      );
    });

    it('should sanitize data before storage', () => {
      // This test will FAIL until data sanitization is implemented
      const holidaysWithXss = [
        {
          id: '1',
          name: '<script>alert("xss")</script>Holiday',
          date: '2025-01-01'
        }
      ];

      localStorageSpy.setItem.mockImplementation((key: string, value: string) => {
        // Data should be sanitized before storage
        expect(value).not.toContain('<script>');
        expect(value).not.toContain('alert("xss")');
      });

      const result = saveHolidays(holidaysWithXss);

      // Should either sanitize and save, or reject as invalid
      if (result === null) {
        // Data was accepted and should be sanitized
        expect(localStorageSpy.setItem).toHaveBeenCalled();
      } else {
        // Data was rejected as invalid
        expect(result.type).toBe('GENERIC_ERROR');
      }
    });
  });

  describe('Browser Compatibility in Production', () => {
    it('should work with different browser storage implementations', () => {
      // This test will FAIL until cross-browser compatibility is tested
      // Test with various localStorage behaviors
      const browserTests = [
        {
          name: 'Standard localStorage',
          implementation: {
            getItem: vi.fn(),
            setItem: vi.fn(),
            removeItem: vi.fn(),
            clear: vi.fn(),
            length: 0,
            key: vi.fn()
          }
        },
        {
          name: 'Safari Private Mode',
          implementation: {
            getItem: vi.fn(() => { throw new Error('Storage disabled'); }),
            setItem: vi.fn(() => { throw new Error('Storage disabled'); }),
            removeItem: vi.fn(() => { throw new Error('Storage disabled'); }),
            clear: vi.fn(() => { throw new Error('Storage disabled'); }),
            length: 0,
            key: vi.fn()
          }
        }
      ];

      browserTests.forEach(browserTest => {
        global.localStorage = browserTest.implementation;

        const isAvailable = isLocalStorageAvailable();
        const result = loadHolidays();

        if (browserTest.name === 'Standard localStorage') {
          expect(isAvailable).toBe(true);
        } else {
          expect(isAvailable).toBe(false);
        }

        // Should not throw errors in any scenario
        expect(() => {
          loadHolidays();
          saveHolidays([]);
        }).not.toThrow();
      });
    });
  });
});