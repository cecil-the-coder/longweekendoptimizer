# State Management

We will use React Context for state, as the only shared state is the holiday list.

## Store Structure

The `HolidayContext.tsx` file will define the `HolidayProvider` and the context itself.

## State Management Template

This provides the state and the functions to modify it (add/delete), and it handles persistence to local storage by calling our service.

```typescript
// /src/context/HolidayContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import * as storage from '../services/localStorageService';

// Define the Holiday type
export interface Holiday {
  id: string; // Use a simple ID for the key
  name: string;
  date: string; // Store date as ISO string (e.g., '2025-11-27')
}

interface HolidayContextType {
  holidays: Holiday[];
  addHoliday: (name: string, date: string) => void;
  deleteHoliday: (id: string) => void;
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
    storage.saveHolidays(holidays);
  }, [holidays]);

  const addHoliday = (name: string, date: string) => {
    const newHoliday: Holiday = { id: crypto.randomUUID(), name, date };
    setHolidays(prev => [...prev, newHoliday]);
  };

  const deleteHoliday = (id: string) => {
    setHolidays(prev => prev.filter(h => h.id !== id));
  };

  return (
    <HolidayContext.Provider value={{ holidays, addHoliday, deleteHoliday }}>
      {children}
    </HolidayContext.Provider>
  );
};
```
