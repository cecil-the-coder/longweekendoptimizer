// Holiday Context for state management
// Based on architecture specification using React Context for centralized holiday list
// Enhanced with comprehensive persistence integration and error propagation
/* eslint-disable react-refresh/only-export-components */

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import * as storage from '../services/localStorageService';
import { StorageError } from '../services/localStorageService';
import { Recommendation, calculateRecommendations } from '../utils/dateLogic';

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
  recommendations: Recommendation[];
  isCalculating: boolean;
  recommendationsError: Error | null;
}

export const HolidayContext = createContext<HolidayContextType | undefined>(undefined);

export const HolidayProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [storageError, setStorageError] = useState<StorageError | null>(null);
  const [isLocalStorageAvailable, setIsLocalStorageAvailable] = useState(true);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [recommendationsError, setRecommendationsError] = useState<Error | null>(null);

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

  // Calculate recommendations whenever holidays change
  useEffect(() => {
    const calculateRecommendationsAsync = async () => {
      setIsCalculating(true);
      setRecommendationsError(null);

      try {
        // Add small delay to show loading state for better UX
        await new Promise(resolve => setTimeout(resolve, 500));

        const calculatedRecommendations = calculateRecommendations(holidays);

        // Sort recommendations chronologically by holiday date
        const sortedRecommendations = [...calculatedRecommendations].sort((a, b) => {
          return new Date(a.holidayDate).getTime() - new Date(b.holidayDate).getTime();
        });

        setRecommendations(sortedRecommendations);
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error calculating recommendations:', error);
        }
        setRecommendationsError(error instanceof Error ? error : new Error('Failed to calculate recommendations'));
        setRecommendations([]);
      } finally {
        setIsCalculating(false);
      }
    };

    calculateRecommendationsAsync();
  }, [holidays]); // Recalculate when holidays change

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
      isLocalStorageAvailable,
      recommendations,
      isCalculating,
      recommendationsError
    }}>
      {children}
    </HolidayContext.Provider>
  );
};