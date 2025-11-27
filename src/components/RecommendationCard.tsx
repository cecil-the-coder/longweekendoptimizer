// Recommendation Card Component
// Displays individual long weekend recommendation with holiday details and suggested day off
// Following component standards: React functional component with TypeScript

import React from 'react';
import { Recommendation } from '../utils/dateLogic';

interface RecommendationCardProps {
  recommendation: Recommendation;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation }) => {
  // Defensive checks for null/undefined recommendation
  if (!recommendation) {
    return (
      <div
        className="p-4 bg-red-50 border border-red-200 rounded-lg"
        role="article"
        aria-label="Invalid recommendation"
      >
        <div className="text-red-700">
          <h3 className="text-lg font-semibold mb-2">Invalid Recommendation</h3>
          <p className="text-sm">Recommendation data is missing or invalid.</p>
        </div>
      </div>
    );
  }

  // Format holiday date for readable display (e.g., "Thursday, Nov 27, 2025")
  const formatDate = (dateString: string): string => {
    if (!dateString) return 'Invalid Date';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';

    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear();

    return `${dayOfWeek}, ${month} ${day}, ${year}`;
  };

  // Format recommended date for readable display (e.g., "Friday, Nov 28, 2025")
  const formatRecommendedDate = (dateString: string): string => {
    if (!dateString) return 'Invalid Date';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';

    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const dayNum = date.getDate();
    const year = date.getFullYear();

    return `${dayOfWeek}, ${month} ${dayNum}, ${year}`;
  };

  // Safely extract recommendation properties with defaults
  const holidayName = recommendation.holidayName || 'Unknown Holiday';
  const holidayDate = recommendation.holidayDate || '';
  const recommendedDate = recommendation.recommendedDate || '';
  const explanation = recommendation.explanation || '';

  return (
    <div
      className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors duration-200"
      role="article"
      aria-label={`Recommendation for ${holidayName}`}
      data-testid={`recommendation-card-${holidayName}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-green-900 mb-2" data-testid={`recommendation-title-${holidayName}`}>
            For <strong>{holidayName}</strong>
          </h3>

          <div className="space-y-1 text-gray-700">
            <p className="text-sm" data-testid={`recommendation-holiday-${holidayName}`}>
              <span className="font-medium">Holiday:</span> {formatDate(holidayDate)}
            </p>

            <p className="text-sm" data-testid={`recommendation-takeoff-${holidayName}`}>
              <span className="font-medium">Take off:</span>{' '}
              <strong>{formatRecommendedDate(recommendedDate)}</strong>
            </p>

            <p className="text-base font-medium text-green-700" data-testid={`recommendation-explanation-${holidayName}`}>
              {explanation}
            </p>
          </div>
        </div>

        <div className="ml-4 flex-shrink-0">
          <div
            className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center"
            aria-hidden="true"
          >
            <svg
              className="w-5 h-5 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationCard;