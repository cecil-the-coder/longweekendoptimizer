/**
 * Vitest Test Setup
 *
 * Global test configuration and polyfills
 */

import { expect, afterEach, vi, beforeAll, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Cleanup after each test case (e.g., clearing jsdom)
afterEach(() => {
  cleanup();
});

// Enhanced localStorage mock with comprehensive error simulation
const createLocalStorageMock = (available: boolean = true, quotaExceeded: boolean = false) => {
  let store: Record<string, string> = {};

  const localStorageMock = {
    getItem: (key: string) => {
      if (!available) return null;
      return store[key] || null;
    },
    setItem: (key: string, value: string) => {
      if (!available) {
        throw new Error('localStorage is not available');
      }
      if (quotaExceeded) {
        const error = new Error('Storage quota exceeded') as any;
        error.name = 'QuotaExceededError';
        throw error;
      }
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      if (!available) return;
      delete store[key];
    },
    clear: () => {
      if (!available) return;
      store = {};
    },
    // Additional methods for testing
    get length() {
      if (!available) return 0;
      return Object.keys(store).length;
    },
    key: (index: number) => {
      if (!available) return null;
      return Object.keys(store)[index] || null;
    },
    // Test helper methods
    _getStore: () => ({ ...store }),
    _resetStore: () => { store = {} },
    _simulateQuotaExceeded: (simulate: boolean) => { quotaExceeded = simulate; },
    _simulateUnavailable: (simulate: boolean) => { available = simulate; }
  };

  return localStorageMock;
};

// Global localStorage setup with availability control
let localStorageInstance = createLocalStorageMock(true, false);

beforeAll(() => {
  // Reset and setup localStorage mock
  if (typeof window !== 'undefined') {
    delete (window as any).localStorage;
    Object.defineProperty(window, 'localStorage', {
      value: localStorageInstance,
      writable: true,
      configurable: true
    });

    // Mock window.confirm for delete confirmation dialogs
    Object.defineProperty(window, 'confirm', {
      value: vi.fn(() => true),
      writable: true,
      configurable: true
    });

    // Mock setTimeout and setTimeout for timer-based tests
    const originalSetTimeout = global.setTimeout;
    const originalSetInterval = global.setInterval;
    const originalClearTimeout = global.clearTimeout;
    const originalClearInterval = global.clearInterval;

    // Use fake timers for consistency
    vi.useFakeTimers();

    return () => {
      vi.useRealTimers();
    };
  }
});

beforeEach(() => {
  // Reset localStorage state before each test
  if (localStorageInstance._resetStore) {
    localStorageInstance._resetStore();
    localStorageInstance._simulateQuotaExceeded(false);
    localStorageInstance._simulateUnavailable(true); // By default, localStorage is available
  }

  // Clear window.confirm mock calls if it exists
  try {
    if (typeof window !== 'undefined' && window.confirm && vi.isMockFunction(window.confirm)) {
      vi.mocked(window.confirm).mockClear();
    }
  } catch (error) {
    // Ignore if window.confirm is not mocked
  }
});

// Export test utilities
export const testUtils = {
  simulateLocalStorageUnavailable: () => {
    localStorageInstance._simulateUnavailable(false);
  },
  simulateLocalStorageAvailable: () => {
    localStorageInstance._simulateUnavailable(true);
  },
  simulateQuotaExceeded: () => {
    localStorageInstance._simulateQuotaExceeded(true);
  },
  resetLocalStorage: () => {
    localStorageInstance._resetStore();
  },
  advanceTimersByTime: (ms: number) => {
    vi.advanceTimersByTime(ms);
  },
  advanceTimersToNextTimer: () => {
    vi.advanceTimersToNextTimer();
  }
};
