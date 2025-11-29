// Predefined Holidays Component
// Displays a list of upcoming holidays that users can quickly add
// Features country selector with flags for filtering

import React, { useState } from 'react';
import { useHolidays } from '../hooks/useHolidays';
import { getUpcomingHolidaysByCountry } from '../utils/predefinedHolidays';

// Country metadata with flag emojis
const COUNTRY_INFO: Record<string, { flag: string; name: string }> = {
  'USA': { flag: '🇺🇸', name: 'United States' },
  'Canada': { flag: '🇨🇦', name: 'Canada' },
  'UK': { flag: '🇬🇧', name: 'United Kingdom' },
  'Australia': { flag: '🇦🇺', name: 'Australia' },
  'International': { flag: '🌍', name: 'International' },
};

const PredefinedHolidays: React.FC = () => {
  const { addHoliday, holidays } = useHolidays();
  const [selectedCountries, setSelectedCountries] = useState<Set<string>>(new Set(['USA', 'International']));
  const [dateMode, setDateMode] = useState<'thisYear' | 'next365Days'>('next365Days');
  const currentYear = new Date().getFullYear();
  const holidaysByCountry = getUpcomingHolidaysByCountry(dateMode);

  const toggleCountry = (country: string) => {
    setSelectedCountries(prev => {
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

  // Get all available countries
  const availableCountries = Array.from(holidaysByCountry.keys());

  // Filter holidays based on selected countries
  const filteredHolidays = Array.from(holidaysByCountry.entries())
    .filter(([country]) => selectedCountries.has(country))
    .flatMap(([country, countryHolidays]) =>
      countryHolidays.map(holiday => ({ ...holiday, country }))
    )
    .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Quick Add Holidays</h3>
        <p className="text-sm text-gray-600">Select countries and add holidays instantly</p>
      </div>

      {/* Date Range Toggle */}
      <div className="mb-4 flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <label htmlFor="date-mode-toggle" className="text-sm font-medium text-gray-700 cursor-pointer">
          Show holidays
        </label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDateMode('thisYear')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              dateMode === 'thisYear'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            This Year
          </button>
          <button
            onClick={() => setDateMode('next365Days')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              dateMode === 'next365Days'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Next 365 Days
          </button>
        </div>
      </div>

      {/* Country Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Country
        </label>
        <div className="flex flex-wrap gap-2">
          {availableCountries.map(country => {
            const info = COUNTRY_INFO[country] || { flag: '🏳️', name: country };
            const isSelected = selectedCountries.has(country);
            const count = holidaysByCountry.get(country)?.length || 0;

            return (
              <button
                key={country}
                onClick={() => toggleCountry(country)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white ring-2 ring-blue-600 ring-offset-1'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title={`${info.name} - ${count} upcoming holidays`}
              >
                <span className="text-base">{info.flag}</span>
                <span>{country}</span>
                <span className={`text-xs ${isSelected ? 'text-blue-200' : 'text-gray-500'}`}>
                  ({count})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Holidays List */}
      {filteredHolidays.length > 0 ? (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredHolidays.map((holiday, index) => {
            const added = isHolidayAdded(holiday.fullDate);
            const dateObj = new Date(holiday.fullDate);
            const formattedDate = dateObj.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              weekday: 'short'
            });
            const countryInfo = COUNTRY_INFO[holiday.country] || { flag: '🏳️', name: holiday.country };

            return (
              <div
                key={`${holiday.country}-${index}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm">{countryInfo.flag}</span>
                    <span className="font-medium text-gray-900 truncate">{holiday.name}</span>
                  </div>
                  <div className="text-sm text-gray-500">{formattedDate}</div>
                </div>
                <button
                  onClick={() => handleAddHoliday(holiday.name, holiday.fullDate)}
                  disabled={added}
                  className={`ml-3 px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex-shrink-0 ${
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
      ) : (
        <div className="text-center py-8 text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm">Select a country to see upcoming holidays</p>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500 text-center">
        Showing {filteredHolidays.length} upcoming holiday{filteredHolidays.length !== 1 ? 's' : ''}
        {dateMode === 'thisYear' ? ` for ${currentYear}` : ' within the next 365 days'}
      </div>
    </div>
  );
};

export default PredefinedHolidays;
