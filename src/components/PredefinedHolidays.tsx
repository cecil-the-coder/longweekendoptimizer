// Predefined Holidays Component
// Displays a list of upcoming holidays that users can quickly add
// Organized by country with USA holidays shown first

import React, { useState } from 'react';
import { useHolidays } from '../hooks/useHolidays';
import { getUpcomingHolidaysByCountry } from '../utils/predefinedHolidays';

const PredefinedHolidays: React.FC = () => {
  const { addHoliday, holidays } = useHolidays();
  const [expandedCountries, setExpandedCountries] = useState<Set<string>>(new Set(['USA']));
  const currentYear = new Date().getFullYear();
  const holidaysByCountry = getUpcomingHolidaysByCountry(currentYear);

  const toggleCountry = (country: string) => {
    setExpandedCountries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(country)) {
        newSet.delete(country);
      } else {
        newSet.add(country);
      }
      return newSet;
    });
  };

  const handleAddHoliday = (name: string, date: string) => {
    // Check if holiday already exists
    const exists = holidays.some(h => h.date === date);
    if (exists) {
      return; // Silently ignore if already added
    }

    addHoliday(name, date);
  };

  const isHolidayAdded = (date: string) => {
    return holidays.some(h => h.date === date);
  };

  if (holidaysByCountry.size === 0) {
    return null; // No upcoming holidays to show
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-white rounded-lg border border-gray-200">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Quick Add Holidays</h3>
        <p className="text-sm text-gray-600">Select from common holidays to add instantly</p>
      </div>

      <div className="space-y-3">
        {Array.from(holidaysByCountry.entries()).map(([country, countryHolidays]) => (
          <div key={country} className="border border-gray-200 rounded-md overflow-hidden">
            {/* Country Header */}
            <button
              onClick={() => toggleCountry(country)}
              className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
              aria-expanded={expandedCountries.has(country)}
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{country}</span>
                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                  {countryHolidays.length} upcoming
                </span>
              </div>
              <svg
                className={`w-5 h-5 text-gray-600 transition-transform ${
                  expandedCountries.has(country) ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Holidays List */}
            {expandedCountries.has(country) && (
              <div className="divide-y divide-gray-200">
                {countryHolidays.map((holiday, index) => {
                  const added = isHolidayAdded(holiday.fullDate);
                  const dateObj = new Date(holiday.fullDate);
                  const formattedDate = dateObj.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  });

                  return (
                    <div
                      key={`${country}-${index}`}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">{holiday.name}</div>
                        <div className="text-sm text-gray-500">{formattedDate}</div>
                      </div>
                      <button
                        onClick={() => handleAddHoliday(holiday.name, holiday.fullDate)}
                        disabled={added}
                        className={`ml-3 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                          added
                            ? 'bg-green-100 text-green-700 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                        title={added ? 'Already added' : `Add ${holiday.name}`}
                      >
                        {added ? (
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Added
                          </span>
                        ) : (
                          'Add'
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Showing holidays for {currentYear}. Dates are approximate for some floating holidays.
      </div>
    </div>
  );
};

export default PredefinedHolidays;
