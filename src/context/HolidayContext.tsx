// Holiday Context for state management
// Based on architecture specification using React Context for centralized holiday list
// Enhanced with comprehensive persistence integration and error propagation
/* eslint-disable react-refresh/only-export-components */

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import * as storage from '../services/localStorageService';
import { StorageError } from '../services/localStorageService';

// Define the Holiday type
export interface Holiday {
  id: string; // Use a simple ID for the key
  name: string;
  date: string; // Store date as ISO string (e.g., '2025-11-27')
}

interface HolidayContextType {
  holidays: Holiday[];
  addHoliday: (name: string, date: string) => StorageError | null;
  deleteHoliday: (id: string) => StorageError | null;
  storageError: StorageError | null;
  clearStorageError: () => void;
  isLocalStorageAvailable: boolean;
}

export const HolidayContext = createContext<HolidayContextType | undefined>(undefined);

export const HolidayProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [storageError, setStorageError] = useState<StorageError | null>(null);
  const [isLocalStorageAvailable, setIsLocalStorageAvailable] = useState(true);

  // Load from local storage on mount with enhanced error handling
  useEffect(() => {
    const loadInitialData = () => {
      const storageAvailable = storage.isLocalStorageAvailable();
      setIsLocalStorageAvailable(storageAvailable);

      const { holidays: loadedHolidays, error: loadError, hadCorruption } = storage.loadHolidays();

      if (loadError) {
        setStorageError(loadError);
        // Auto-clear error after 5 seconds for corruption errors
        if (loadError.type === 'CORRUPTION_ERROR') {
          setTimeout(() => setStorageError(null), 5000);
        }
      }

      setHolidays(loadedHolidays);

      // Log corruption recovery for debugging
      if (hadCorruption) {
        console.info('Holiday data corruption detected and recovered');
      }
    };

    loadInitialData();
  }, []); // Only run once on mount

  // Manual save function to prevent infinite loops
  const saveToStorage = (holidayData: Holiday[]): StorageError | null => {
    const error = storage.saveHolidays(holidayData);
    return error;
  };

  const addHoliday = (name: string, date: string): StorageError | null => {
    // Generate UUID with fallback for older browsers
    let id: string;
    try {
      id = crypto.randomUUID();
    } catch {
      // Fallback for browsers without crypto.randomUUID
      id = 'id-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
    }

    const newHoliday: Holiday = { id, name, date };
    const updatedHolidays = [...holidays, newHoliday];

    // Update state first for immediate UI feedback
    setHolidays(updatedHolidays);

    // Then save to storage and handle any errors
    const saveError = saveToStorage(updatedHolidays);
    if (saveError) {
      setStorageError(saveError);
      // Auto-clear error after 5 seconds
      setTimeout(() => setStorageError(null), 5000);
    }

    return saveError;
  };

  const deleteHoliday = (id: string): StorageError | null => {
    const updatedHolidays = holidays.filter(h => h.id !== id);

    // Update state first for immediate UI feedback
    setHolidays(updatedHolidays);

    // Then save to storage and handle any errors
    const saveError = saveToStorage(updatedHolidays);
    if (saveError) {
      setStorageError(saveError);
      // Auto-clear error after 5 seconds
      setTimeout(() => setStorageError(null), 5000);
    }

    return saveError;
  };

  const clearStorageError = () => {
    setStorageError(null);
  };

  return (
    <HolidayContext.Provider value={{
      holidays,
      addHoliday,
      deleteHoliday,
      storageError,
      clearStorageError,
      isLocalStorageAvailable
    }}>
      {children}
    </HolidayContext.Provider>
  );
};