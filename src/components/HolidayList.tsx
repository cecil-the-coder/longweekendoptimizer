// Holiday List Component
// Displays array of holidays using HolidayListItem components
// Enhanced with comprehensive empty states and loading indicators
// Following component standards: React functional component with TypeScript

import React, { useRef } from 'react';
import { Holiday } from '../context/HolidayContext';
import HolidayListItem from './HolidayListItem';
import { useHolidays } from '../hooks/useHolidays';
import LoadingSpinner from './LoadingSpinner';
import Notification from './Notification';

const HolidayList: React.FC = () => {
  const {
    holidays,
    isCalculating,
    storageError,
    isLocalStorageAvailable,
    clearStorageError
  } = useHolidays();
  const formRef = useRef<HTMLDivElement>(null);

  // Storage error state
  if (storageError) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Holidays</h2>

        <div
          data-testid="storage-error-state"
          className="text-center py-8 px-4"
          role="alert"
          aria-live="polite"
        >
          {/* Storage Error Icon */}
          <div
            data-testid="storage-error-icon"
            className="mx-auto h-12 w-12 text-red-500 mb-4"
            aria-hidden="true"
          >
            <svg className="h-full w-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          <h3 className="text-lg font-medium text-gray-900 mb-2">Storage Error</h3>
          <p className="text-red-600 mb-6">{storageError.userMessage}</p>

          {/* Recovery Actions */}
          <div className="space-y-3">
            <button
              data-testid="try-again-button"
              onClick={clearStorageError}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 font-medium"
            >
              Try Again
            </button>

            {storageError.type === 'QUOTA_EXCEEDED' && (
              <button
                data-testid="clear-all-data-button"
                onClick={() => {
                  // Clear only our app's localStorage data
                  localStorage.removeItem('long-weekend-optimizer-holidays');
                  clearStorageError();
                  window.location.reload();
                }}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200 font-medium"
              >
                Clear All Data
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Storage unavailable state
  if (!isLocalStorageAvailable) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Holidays</h2>

        <div
          data-testid="storage-unavailable-state"
          className="text-center py-8 px-4"
          role="status"
          aria-live="polite"
        >
          {/* Storage Warning Icon */}
          <div
            data-testid="storage-unavailable-icon"
            className="mx-auto h-12 w-12 text-yellow-500 mb-4"
            aria-hidden="true"
          >
            <svg className="h-full w-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          <h3 className="text-lg font-medium text-gray-900 mb-2">Storage Unavailable</h3>
          <p className="text-gray-600 mb-2">
            Local storage is not available in your browser.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Your holidays will only be saved during this session and will be lost when you close the browser.
          </p>

          {/* Explanation */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> You can still use the app, but your data won't persist. This usually happens when:
            </p>
            <ul className="text-sm text-blue-700 mt-2 list-disc list-inside">
              <li>Your browser is in private/incognito mode</li>
              <li>Storage is disabled by browser settings</li>
              <li>You're using a browser with limited storage support</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Loading/calculating state
  if (isCalculating && holidays.length > 0) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Holidays</h2>

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
          <p className="text-gray-600 mt-4">Analyzing holiday patterns to find optimal days off...</p>

          <div data-testid="loading-progress" className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Analyzing holiday patterns</p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state (no holidays)
  if (holidays.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Holidays</h2>

        <div
          data-testid="empty-holidays-state"
          className="text-center py-8 px-4 w-full max-w-md mx-auto"
          role="status"
          aria-live="polite"
        >
          {/* Empty State Icon */}
          <div
            data-testid="empty-holidays-icon"
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
            aria-hidden="true"
          >
            <svg className="h-full w-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 mb-2">No holidays found</h3>
          <p className="text-gray-600 mt-2 mb-6">
            Start by adding your first holiday to discover long weekend opportunities!
          </p>

          {/* Helpful guidance */}
          <div className="mt-8 text-left">
            <h4 className="text-sm font-medium text-gray-900 mb-3">💡 Tips for getting started:</h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Add company holidays like Christmas, New Year's, etc.</li>
              <li>• Weekends are automatically calculated for you</li>
              <li>• We'll recommend the best days to take off for long weekends</li>
              <li>• Your data is saved locally in your browser</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Normal state - display holidays
  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Holidays</h2>

      {/* Recommendations loading indicator */}
      {isCalculating && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <LoadingSpinner size="small" label="Finding recommendations..." showLabel />
            <span className="ml-2 text-sm text-blue-700">Finding long weekend opportunities...</span>
          </div>
        </div>
      )}

      <div className="grid gap-4" role="region" aria-label="Holiday list">
        {holidays.map((holiday: Holiday) => (
          <HolidayListItem key={holiday.id} holiday={holiday} />
        ))}
      </div>
    </div>
  );
};

export default HolidayList;