// Custom hook for accessing recommendations from Holiday Context
// Follows naming convention: useCamelCase
// Provides recommendations, loading state, and error handling

import { useContext } from 'react';
import { HolidayContext } from '../context/HolidayContext';

export const useRecommendations = () => {
  const context = useContext(HolidayContext);

  if (context === undefined) {
    throw new Error('useRecommendations must be used within a HolidayProvider');
  }

  const { recommendations, isCalculating, recommendationsError } = context;

  return {
    recommendations,
    isCalculating,
    recommendationsError
  };
};