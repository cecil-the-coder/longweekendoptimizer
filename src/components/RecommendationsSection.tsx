// Recommendations Section Component
// Displays long weekend recommendations with automatic updates when holiday list changes
// Enhanced with comprehensive empty states and loading indicators
// Following component standards: React functional component with TypeScript

import React from 'react';
import { useHolidays } from '../hooks/useHolidays';
import { useRecommendations } from '../hooks/useRecommendations';
import RecommendationCard from './RecommendationCard';
import LoadingSpinner from './LoadingSpinner';

const RecommendationsSection: React.FC = () => {
  const { holidays } = useHolidays();
  const { recommendations, isCalculating, recommendationsError } = useRecommendations();

  // Loading/calculating state
  if (isCalculating) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recommendations</h2>

        <div
          data-testid="calculating-recommendations"
          className="text-center py-8 px-4"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <LoadingSpinner
            data-testid="loading-spinner"
            size="large"
            label="Calculating recommendations..."
            showLabel
          />
          <p className="text-gray-600 mt-4">Calculating optimal days off for long weekends...</p>

          <div data-testid="loading-progress" className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Analyzing holiday patterns</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (recommendationsError) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recommendations</h2>

        <div
          data-testid="recommendations-error-state"
          className="text-center py-8 px-4"
          role="alert"
          aria-live="polite"
        >
          {/* Error Icon */}
          <div className="mx-auto h-12 w-12 text-red-500 mb-4" aria-hidden="true">
            <svg className="h-full w-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          <h3 className="text-lg font-medium text-gray-900 mb-2">Calculation Error</h3>
          <p className="text-red-600 mb-6">
            Unable to calculate recommendations. Please try again later.
          </p>

          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state - no holidays added
  if (!holidays || holidays.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recommendations</h2>

        <div
          data-testid="empty-recommendations-state"
          className="text-center py-8 px-4 w-full max-w-md mx-auto"
          role="status"
          aria-live="polite"
        >
          {/* Empty State Icon */}
          <div
            data-testid="empty-recommendations-icon"
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
            aria-hidden="true"
          >
            <svg className="h-full w-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 mb-2">No recommendations available</h3>
          <p className="text-gray-600 mt-2 mb-6">
            Add some holidays to see recommendations for optimal days off.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            We'll suggest the best days to take off to create amazing long weekends!
          </p>

          {/* Call to action guidance */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
            <p className="text-sm text-blue-800">
              <strong>🎯 How it works:</strong>
            </p>
            <ul className="text-sm text-blue-700 mt-2 list-disc list-inside">
              <li>Add your company holidays above</li>
              <li>We analyze their proximity to weekends</li>
              <li>Get recommendations for strategic days off</li>
              <li>Create the perfect long weekend getaways!</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Empty state - holidays exist but no recommendations
  if (recommendations.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recommendations</h2>

        <div
          data-testid="empty-recommendations-state"
          className="text-center py-8 px-4 w-full max-w-md mx-auto"
          role="status"
          aria-live="polite"
        >
          {/* Positive Empty State Icon */}
          <div className="mx-auto h-12 w-12 text-green-500 mb-4" aria-hidden="true">
            <svg className="h-full w-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 mb-2">Perfect timing!</h3>
          <p className="text-green-600 mt-2 mb-6">
            Good news! All your holidays already fall nicely.
          </p>
          <p className="text-gray-500 mb-6">
            No additional recommendations are needed - your current holiday setup is already optimized for great weekends!
          </p>

          {/* Positive feedback */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left">
            <p className="text-sm text-green-800">
              <strong>✨ You're all set!</strong>
            </p>
            <ul className="text-sm text-green-700 mt-2 list-disc list-inside">
              <li>Your holidays are well-positioned</li>
              <li>Weekend opportunities look great</li>
              <li>Consider adding more holidays for future planning</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Normal state - display recommendations
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
        <p className="text-sm text-blue-800" data-testid="recommendation-summary">
          <strong>{recommendations.length}</strong> long weekend opportunity{recommendations.length !== 1 ? 's' : ''} found!
          {recommendations.length > 0 && ' Take advantage of these strategic days off.'}
        </p>
      </div>
    </div>
  );
};

export default RecommendationsSection;