/**
 * Test Fixture for localStorage Scenarios
 *
 * Provides controlled localStorage mocking for comprehensive
 * testing of localStorage persistence scenarios.
 */

import { vi, beforeEach, afterEach } from 'vitest';

export interface LocalStorageScenario {
  name: string;
  setup: () => () => void; // Returns cleanup function
}

/**
 * Fixture that provides localStorage setup and cleanup
 */
export class LocalStorageScenarioFixture {
  private cleanup: (() => void) | null = null;

  /**
   * Setup specific localStorage scenario
   * Returns cleanup function that should be called in afterEach
   */
  setupScenario(scenarioSetup: () => () => void): void {
    this.cleanup?.(); // Clean up previous scenario
    this.cleanup = scenarioSetup();
  }

  /**
   * Clean up current scenario
   */
  cleanupCurrentScenario(): void {
    if (this.cleanup) {
      this.cleanup();
      this.cleanup = null;
    }
  }

  /**
   * Available localStorage testing scenarios
   */
  static scenarios = {
    /** Normal localStorage availability */
    normal: (): LocalStorageScenario => ({
      name: 'Normal localStorage available',
      setup: () => {
        localStorage.clear();
        // Create spy for debugging but don't change behavior
        const spy = vi.spyOn(Storage.prototype, 'setItem');
        return () => {
          spy.mockRestore();
          localStorage.clear();
        };
      },
    }),

    /** localStorage completely unavailable (AC4) */
    unavailable: (): LocalStorageScenario => ({
      name: 'localStorage unavailable',
      setup: () => {
        const originalLocalStorage = (window as any).localStorage;
        Object.defineProperty(window, 'localStorage', {
          value: undefined,
          configurable: true,
          writable: true,
        });

        return () => {
          Object.defineProperty(window, 'localStorage', {
            value: originalLocalStorage,
            configurable: true,
            writable: true,
          });
        };
      },
    }),

    /** Quota exceeded error scenario (AC6) */
    quotaExceeded: (): LocalStorageScenario => ({
      name: 'localStorage quota exceeded',
      setup: () => {
        const originalSetItem = Storage.prototype.setItem;
        const mockSetItem = vi.fn();
        mockSetItem.mockImplementation(() => {
          const error: Error & { name?: string } = new Error('QuotaExceededError');
          error.name = 'QuotaExceededError';
          throw error;
        });

        Storage.prototype.setItem = mockSetItem;

        return () => {
          Storage.prototype.setItem = originalSetItem;
        };
      },
    }),

    /** Security error scenario (AC6) */
    securityError: (): LocalStorageScenario => ({
      name: 'localStorage security error',
      setup: () => {
        const originalSetItem = Storage.prototype.setItem;
        const mockSetItem = vi.fn();
        mockSetItem.mockImplementation(() => {
          const error: Error & { name?: string } = new Error('SecurityError');
          error.name = 'SecurityError';
          throw error;
        });

        Storage.prototype.setItem = mockSetItem;

        return () => {
          Storage.prototype.setItem = originalSetItem;
        };
      },
    }),

    /** Read-only storage scenario */
    readOnly: (): LocalStorageScenario => ({
      name: 'localStorage read-only',
      setup: () => {
        const originalSetItem = Storage.prototype.setItem;
        const mockSetItem = vi.fn();
        mockSetItem.mockImplementation(() => {
          const error: Error & { name?: string } = new Error('SecurityError: Write permission denied');
          error.name = 'SecurityError';
          throw error;
        });

        Storage.prototype.setItem = mockSetItem;

        return () => {
          Storage.prototype.setItem = originalSetItem;
        };
      },
    }),

    /** Private browsing simulation */
    privateBrowsing: (): LocalStorageScenario => ({
      name: 'Private browsing mode',
      setup: () => {
        const originalSetItem = Storage.prototype.setItem;
        const originalGetItem = Storage.prototype.getItem;

        const mockSetItem = vi.fn();
        const mockGetItem = vi.fn();

        mockSetItem.mockImplementation(() => {
          const error: Error & { name?: string } = new Error('SecurityError');
          error.name = 'SecurityError';
          throw error;
        });

        mockGetItem.mockImplementation(() => {
          const error: Error & { name?: string } = new Error('SecurityError');
          error.name = 'SecurityError';
          throw error;
        });

        Storage.prototype.setItem = mockSetItem;
        Storage.prototype.getItem = mockGetItem;

        return () => {
          Storage.prototype.setItem = originalSetItem;
          Storage.prototype.getItem = originalGetItem;
        };
      },
    }),

    /** Corrupted data scenario for getItem (AC5) */
    corruptedDataLoad: (corruptedData: string): LocalStorageScenario => ({
      name: `Corrupted data in localStorage: ${corruptedData}`,
      setup: () => {
        localStorage.clear();
        localStorage.setItem('holidayhacker-holidays', corruptedData);
        return () => {
          localStorage.clear();
        };
      },
    }),

    /** Mixed scenario: corrupted data on load, error on save */
    corruptedLoadWithErrorSave: (
      corruptedData: string,
      saveError: string
    ): LocalStorageScenario => ({
      name: `Corrupted data load + ${saveError} save error`,
      setup: () => {
        // Set up corrupted data
        localStorage.setItem('holidayhacker-holidays', corruptedData);

        // Set up save error
        const originalSetItem = Storage.prototype.setItem;
        const mockSetItem = vi.fn();
        mockSetItem.mockImplementation(() => {
          const error: Error & { name?: string } = new Error(saveError);
          error.name = saveError;
          throw error;
        });

        Storage.prototype.setItem = mockSetItem;

        return () => {
          Storage.prototype.setItem = originalSetItem;
          localStorage.clear();
        };
      },
    }),

    /** Large data scenario (potential quota issues) */
    largeDataset: (): LocalStorageScenario => ({
      name: 'Large dataset',
      setup: () => {
        const largeData = JSON.stringify(
          Array.from({ length: 10000 }, (_, i) => ({
            id: `holiday-${i}`,
            name: `Holiday ${i}`,
            date: `2025-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
          }))
        );
        localStorage.setItem('holidayhacker-holidays', largeData);
        return () => {
          localStorage.clear();
        };
      },
    }),
  };
}

/**
 * Vitest fixture helper for localStorage scenarios
 */
export function useLocalStorageScenario() {
  let fixture = new LocalStorageScenarioFixture();

  beforeEach(() => {
    fixture.cleanupCurrentScenario();
  });

  afterEach(() => {
    fixture.cleanupCurrentScenario();
  });

  return {
    /**
     * Setup localStorage scenario for current test
     */
    setup: (scenario: LocalStorageScenario | (() => LocalStorageScenario)) => {
      const scenarioSetup = typeof scenario === 'function' ? scenario() : scenario;
      fixture.setupScenario(scenarioSetup.setup);
    },

    /**
     * Access to all available scenarios
     */
    scenarios: LocalStorageScenarioFixture.scenarios,
  };
}