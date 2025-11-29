// Custom hook for accessing Holiday Context
// Follows naming convention: useCamelCase

import { useContext } from 'react';
import { HolidayContext } from '../context/HolidayContext';

// Re-export Holiday type for consumers
export type { Holiday } from '../context/HolidayContext';

export const useHolidays = () => {
  const context = useContext(HolidayContext);

  if (context === undefined) {
    throw new Error('useHolidays must be used within a HolidayProvider');
  }

  return context;
};