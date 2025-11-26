// Local Storage Service for Holiday persistence
// Based on architecture specifications for client-side storage

import { Holiday } from '../context/HolidayContext';

const HOLIDAYS_STORAGE_KEY = 'long-weekend-optimizer-holidays';

export interface StorageError {
  type: 'QUOTA_EXCEEDED' | 'SECURITY_ERROR' | 'GENERIC_ERROR';
  message: string;
  userMessage: string;
}

// Helper function to create user-friendly error messages
const createStorageError = (error: unknown): StorageError | null => {
  if (error instanceof DOMException) {
    if (error.name === 'QuotaExceededError') {
      return {
        type: 'QUOTA_EXCEEDED',
        message: 'Storage quota exceeded',
        userMessage: 'Storage is full. Please remove some holidays to free up space.'
      };
    }
    if (error.name === 'SecurityError') {
      return {
        type: 'SECURITY_ERROR',
        message: 'Storage access denied',
        userMessage: 'Unable to access storage. Please check your browser settings.'
      };
    }
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

export const loadHolidays = (): Holiday[] => {
  try {
    const stored = localStorage.getItem(HOLIDAYS_STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);
    // Data validation: ensure we always return an array
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to load holidays from localStorage:', error);
    // For loading errors, we return empty array and don't show user feedback
    // since this happens on app initialization and shouldn't block the user
    return [];
  }
};

export const saveHolidays = (holidays: Holiday[]): StorageError | null => {
  try {
    localStorage.setItem(HOLIDAYS_STORAGE_KEY, JSON.stringify(holidays));
    return null; // Success, no error
  } catch (error) {
    console.error('Failed to save holidays to localStorage:', error);
    const storageError = createStorageError(error);
    return storageError || {
      type: 'GENERIC_ERROR',
      message: 'Unknown error occurred',
      userMessage: 'Unable to save holidays. Please try again later.'
    };
  }
};