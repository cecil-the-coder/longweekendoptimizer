// Holiday Context for state management
// Based on architecture specification using React Context for centralized holiday list
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
}

export const HolidayContext = createContext<HolidayContextType | undefined>(undefined);

export const HolidayProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);

  // Load from local storage on mount (FR4)
  useEffect(() => {
    const savedHolidays = storage.loadHolidays();
    setHolidays(savedHolidays);
  }, []);

  // Save to local storage on change (FR3)
  useEffect(() => {
    const error = storage.saveHolidays(holidays);
    if (error) {
      console.error('Storage error on auto-save:', error);
    }
  }, [holidays]);

  const addHoliday = (name: string, date: string): StorageError | null => {
    const newHoliday: Holiday = { id: crypto.randomUUID(), name, date };
    const updatedHolidays = [...holidays, newHoliday];
    setHolidays(updatedHolidays);

    // Immediately try to save and return any error
    return storage.saveHolidays(updatedHolidays);
  };

  const deleteHoliday = (id: string): StorageError | null => {
    const updatedHolidays = holidays.filter(h => h.id !== id);
    setHolidays(updatedHolidays);

    // Immediately try to save and return any error
    return storage.saveHolidays(updatedHolidays);
  };

  return (
    <HolidayContext.Provider value={{ holidays, addHoliday, deleteHoliday }}>
      {children}
    </HolidayContext.Provider>
  );
};