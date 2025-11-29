/**
 * Test Data Factory for Storage Error objects
 *
 * Provides controlled test data generation for storage error scenarios
 * in localStorage persistence testing.
 */

export interface StorageError {
  success: false;
  type: 'QUOTA_EXCEEDED' | 'SECURITY_ERROR' | 'STORAGE_UNAVAILABLE' | 'GENERIC_ERROR';
  message: string;
  userMessage: string;
}

/**
 * Create a quota exceeded error (AC6)
 */
export function createQuotaExceededError(overrides?: Partial<StorageError>): StorageError {
  return {
    success: false,
    type: 'QUOTA_EXCEEDED',
    message: 'Storage quota exceeded',
    userMessage: 'Storage space is full. Please clear some data or try again later.',
    ...overrides,
  };
}

/**
 * Create a security error (AC6)
 */
export function createSecurityError(overrides?: Partial<StorageError>): StorageError {
  return {
    success: false,
    type: 'SECURITY_ERROR',
    message: 'Security error accessing storage',
    userMessage: 'Cannot save changes due to browser security restrictions.',
    ...overrides,
  };
}

/**
 * Create a storage unavailable error (AC4)
 */
export function createStorageUnavailableError(overrides?: Partial<StorageError>): StorageError {
  return {
    success: false,
    type: 'STORAGE_UNAVAILABLE',
    message: 'localStorage is not available',
    userMessage: 'Storage is not available. Changes cannot be saved.',
    ...overrides,
  };
}

/**
 * Create a generic storage error (AC6)
 */
export function createGenericStorageError(overrides?: Partial<StorageError>): StorageError {
  return {
    success: false,
    type: 'GENERIC_ERROR',
    message: 'Failed to save data',
    userMessage: 'Failed to save changes. Please try again.',
    ...overrides,
  };
}

/**
 * Create a success response object
 */
export function createStorageSuccess(message?: string) {
  return {
    success: true,
    message: message || 'Holidays saved successfully',
  };
}

/**
 * Create storage error for specific test scenarios
 */
export const storageErrorScenarios = {
  /** Storage is completely unavailable (AC4) */
  storageUnavailable: createStorageUnavailableError(),

  /** Storage quota exceeded (AC6) */
  quotaExceeded: createQuotaExceededError(),

  /** Security restriction preventing access (AC6) */
  securityError: createSecurityError(),

  /** Generic unknown error (AC6) */
  genericError: createGenericStorageError(),

  /** Private browsing scenario */
  privateBrowsing: createSecurityError({
    message: 'localStorage is disabled in private browsing',
    userMessage: 'Cannot save changes in private browsing mode.'
  }),

  /** Read-only storage scenario */
  readOnly: createSecurityError({
    message: 'Storage is in read-only mode',
    userMessage: 'Storage is read-only. Changes cannot be saved.'
  }),
};

/**
 * Create a list of all error types for comprehensive testing
 */
export function createAllStorageErrors(): StorageError[] {
  return Object.values(storageErrorScenarios);
}

/**
 * Create corrupted data scenarios for data recovery testing (AC5)
 */
export const corruptedDataScenarios = {
  invalidJson: 'invalid JSON {]',
  wrongType: JSON.stringify({ not: 'an array' }),
  nullValue: JSON.stringify(null),
  undefinedValue: JSON.stringify(undefined),
  stringValue: JSON.stringify('not an array'),
  numberValue: JSON.stringify(123),
  booleanValue: JSON.stringify(false),
  objectValue: JSON.stringify({ holidays: 'wrong structure' }),
  mixedArray: JSON.stringify([
    { id: 'valid', name: 'Valid Holiday', date: '2025-12-25' },
    { id: 123, name: 456, date: 'invalid' }, // Invalid objects
    'not an object' // Non-object in array
  ]),
  emptyString: '',
  whitespace: '   ',
  partialJson: '{"incomplete": json',
  extraCharacters: '[]{}invalid',
};

/**
 * Create localStorage feature detection scenarios (AC4)
 */
export const localStorageScenarios = {
  /** Normal localStorage available */
  available: () => {
    // Default behavior
  },

  /** localStorage completely absent */
  absent: () => {
    const originalLocalStorage = (window as any).localStorage;
    Object.defineProperty(window, 'localStorage', {
      value: undefined,
      configurable: true,
      writable: true
    });
    return () => {
      Object.defineProperty(window, 'localStorage', {
        value: originalLocalStorage,
        configurable: true,
        writable: true
      });
    };
  },

  /** localStorage available but setItem throws */
  setItemError: (errorName: string = 'QuotaExceededError') => {
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = vi.fn(() => {
      const error: Error & { name?: string } = new Error(`${errorName} simulated`);
      error.name = errorName;
      throw error;
    });
    return () => {
      Storage.prototype.setItem = originalSetItem;
    };
  },

  /** localStorage available but getItem throws */
  getItemError: (errorName: string = 'SecurityError') => {
    const originalGetItem = Storage.prototype.getItem;
    Storage.prototype.getItem = vi.fn(() => {
      const error: Error & { name?: string } = new Error(`${errorName} simulated`);
      error.name = errorName;
      throw error;
    });
    return () => {
      Storage.prototype.getItem = originalGetItem;
    };
  },
};