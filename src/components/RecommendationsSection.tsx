// Recommendations Section Component
// Displays long weekend recommendations with automatic updates when holiday list changes
// Following component standards: React functional component with TypeScript

import React, { useMemo } from 'react';
import { calculateRecommendations } from '../utils/dateLogic';
import { useHolidays } from '../hooks/useHolidays';
import RecommendationCard from './RecommendationCard';

const RecommendationsSection: React.FC = () => {
  const { holidays } = useHolidays();

  // Calculate recommendations whenever holidays change
  const recommendations = useMemo(() => {
    return calculateRecommendations(holidays);
  }, [holidays]);

  // Loading state (though holidays are already loaded from context)
  if (!holidays) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="text-center py-8 text-gray-500">
          <p>Loading recommendations...</p>
        </div>
      </div>
    );
  }

  // Empty state when no recommendations found
  if (recommendations.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="text-center py-8 text-gray-500">
          <p>No long-weekend opportunities found.</p>
          <p className="text-sm mt-2">Add more holidays to discover weekend optimization opportunities!</p>
        </div>
      </div>
    );
  }

  // Display recommendations
  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Recommendations</h2>

      <div className="space-y-4" role="region" aria-live="polite" aria-label="Holiday recommendations">
        {recommendations.map((recommendation, index) => (
          <RecommendationCard
            key={`${recommendation.holidayDate}-${index}`}
            recommendation={recommendation}
          />
        ))}
      </div>

      {/* Summary message */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>{recommendations.length}</strong> long weekend opportunity{recommendations.length !== 1 ? 's' : ''} found!
          {recommendations.length > 0 && ' Take advantage of these strategic days off.'}
        </p>
      </div>
    </div>
  );
};

export default RecommendationsSection;