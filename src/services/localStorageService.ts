// Local Storage Service for Holiday persistence
// Based on architecture specifications for client-side storage
// Enhanced with comprehensive feature detection, corruption recovery, and quota handling

import { Holiday } from '../context/HolidayContext';

const HOLIDAYS_STORAGE_KEY = 'long-weekend-optimizer-holidays';

export interface StorageError {
  type: 'QUOTA_EXCEEDED' | 'SECURITY_ERROR' | 'GENERIC_ERROR' | 'CORRUPTION_ERROR';
  message: string;
  userMessage: string;
}

// Feature detection for localStorage availability
export const isLocalStorageAvailable = (): boolean => {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

// Helper function to create user-friendly error messages with enhanced handling
const createStorageError = (error: unknown, context: 'save' | 'load' = 'save'): StorageError | null => {
  if (error instanceof DOMException) {
    if (error.name === 'QuotaExceededError') {
      return {
        type: 'QUOTA_EXCEEDED',
        message: 'Storage quota exceeded',
        userMessage: 'Storage is full. Please clear some browser data or remove holidays to free up space.'
      };
    }
    if (error.name === 'SecurityError') {
      return {
        type: 'SECURITY_ERROR',
        message: 'Storage access denied',
        userMessage: 'Unable to access storage. Your browser may be in private mode or storage is disabled.'
      };
    }
  }

  // Handle JSON parsing errors (corruption)
  if (error instanceof SyntaxError && context === 'load') {
    return {
      type: 'CORRUPTION_ERROR',
      message: 'Data corruption detected',
      userMessage: 'Saved holiday data was corrupted. Starting with an empty list.'
    };
  }

  // Handle data validation errors (non-array data)
  if (error instanceof Error && error.message === 'Invalid data format: expected array') {
    return {
      type: 'GENERIC_ERROR',
      message: 'Invalid data format: expected array',
      userMessage: 'Unable to save holidays. Please try again later.'
    };
  }

  if (error instanceof Error) {
    return {
      type: 'GENERIC_ERROR',
      message: error.message,
      userMessage: 'Unable to save holidays. Please try again later.'
    };
  }

  return null;
};

// Enhanced data validation for Holiday objects
const isValidHoliday = (obj: any): obj is Holiday => {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.date === 'string' &&
    obj.id.length > 0 &&
    obj.name.length > 0 &&
    obj.date.length > 0
  );
};

// Validate and clean holiday array
const validateAndCleanHolidayArray = (data: any): Holiday[] => {
  if (!Array.isArray(data)) {
    throw new Error('Invalid data format: expected array');
  }

  const validHolidays: Holiday[] = [];
  const corruptedCount = data.length;

  for (const item of data) {
    if (isValidHoliday(item)) {
      validHolidays.push(item);
    }
  }

  // If we found corrupted items, log it but continue with valid ones
  if (validHolidays.length < corruptedCount) {
    console.warn(
      `Data corruption detected: removed ${corruptedCount - validHolidays.length} invalid holiday entries out of ${corruptedCount} total`
    );
  }

  return validHolidays;
};

// Check storage quota and return estimated available space
export const getStorageQuotaInfo = (): { used: number; available?: number; total?: number } => {
  if (!isLocalStorageAvailable()) {
    return { used: 0 };
  }

  try {
    // Estimate current usage
    let used = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        if (value) {
          used += value.length + key.length;
        }
      }
    }

    // Try to estimate total quota (rough approximation)
    let total = 5 * 1024 * 1024; // 5MB typical default
    let available = total - used;

    return { used, available, total };
  } catch {
    return { used: 0 };
  }
};

export const loadHolidays = (): { holidays: Holiday[]; error: StorageError | null; hadCorruption: boolean } => {
  // Feature detection: if localStorage is unavailable, return empty state
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage is not available, using in-memory state');
    return { holidays: [], error: null, hadCorruption: false };
  }

  try {
    const stored = localStorage.getItem(HOLIDAYS_STORAGE_KEY);
    if (!stored) {
      return { holidays: [], error: null, hadCorruption: false };
    }

    const parsed = JSON.parse(stored);

    // Enhanced validation with corruption detection
    const validHolidays = validateAndCleanHolidayArray(parsed);
    const hadCorruption = validHolidays.length !== parsed.length;

    return { holidays: validHolidays, error: null, hadCorruption };
  } catch (error) {
    console.error('Failed to load holidays from localStorage:', error);

    // Handle corruption errors specifically
    if (error instanceof SyntaxError) {
      const storageError = createStorageError(error, 'load');
      if (storageError?.type === 'CORRUPTION_ERROR') {
        // Clear corrupted data and reset to empty state
        try {
          localStorage.removeItem(HOLIDAYS_STORAGE_KEY);
        } catch {
          // Ignore cleanup errors
        }
        return { holidays: [], error: storageError, hadCorruption: true };
      }
    }

    // For other loading errors, return empty state with error info
    const storageError = createStorageError(error, 'load');
    return { holidays: [], error: storageError || null, hadCorruption: false };
  }
};

export const saveHolidays = (holidays: Holiday[]): StorageError | null => {
  // Pre-save validation
  if (!Array.isArray(holidays)) {
    return {
      type: 'GENERIC_ERROR',
      message: 'Invalid holiday data format',
      userMessage: 'Unable to save holidays due to a data format error.'
    };
  }

  // Validate each holiday before saving
  for (const holiday of holidays) {
    if (!isValidHoliday(holiday)) {
      return {
        type: 'GENERIC_ERROR',
        message: 'Invalid holiday object detected',
        userMessage: 'Unable to save holidays due to invalid holiday data.'
      };
    }
  }

  // Feature detection: if localStorage is unavailable, return structured error
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage is not available, changes will not persist');
    return {
      type: 'SECURITY_ERROR',
      message: 'Storage unavailable',
      userMessage: 'Unable to save holidays: browser storage is not available. Your browser may be in private mode or storage is disabled.'
    };
  }

  try {
    const dataToSave = JSON.stringify(holidays);

    // Check if we're approaching quota limits (warn at 80% usage)
    const quotaInfo = getStorageQuota();
    if (quotaInfo.available && dataToSave.length > quotaInfo.available * 0.8) {
      console.warn('Approaching storage quota limit');
    }

    localStorage.setItem(HOLIDAYS_STORAGE_KEY, dataToSave);
    return null; // Success, no error
  } catch (error) {
    console.error('Failed to save holidays to localStorage:', error);
    const storageError = createStorageError(error, 'save');
    return storageError || {
      type: 'GENERIC_ERROR',
      message: 'Unknown error occurred',
      userMessage: 'Unable to save holidays. Please try again later.'
    };
  }
};

// Helper alias for quota checking (maintains backward compatibility)
const getStorageQuota = getStorageQuotaInfo;