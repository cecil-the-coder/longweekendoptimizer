// Holiday Form Component
// Provides input fields for adding holidays with validation
// Following component standards: React functional component with TypeScript

import React, { useState, FormEvent } from 'react';
import { useHolidays } from '../hooks/useHolidays';
import { StorageError } from '../services/localStorageService';

const HolidayForm: React.FC = () => {
  const { addHoliday, holidays } = useHolidays();
  const [holidayName, setHolidayName] = useState('');
  const [holidayDate, setHolidayDate] = useState('');
  const [validationError, setValidationError] = useState('');
  const [storageError, setStorageError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setValidationError('');
    setStorageError('');

    // Form validation for empty inputs
    if (!holidayName.trim()) {
      setValidationError('Holiday name is required');
      return;
    }

    if (!holidayDate) {
      setValidationError('Holiday date is required');
      return;
    }

    // Validate weekend dates (prevent weekend holidays)
    const date = new Date(holidayDate);
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      setValidationError('Holidays cannot be scheduled on weekends (Saturday or Sunday)');
      return;
    }

    // Validate duplicate dates
    const duplicateExists = holidays.some(holiday => holiday.date === holidayDate);
    if (duplicateExists) {
      setValidationError('A holiday already exists for this date');
      return;
    }

    // Add holiday and handle storage errors
    const storageErrorResult = addHoliday(holidayName.trim(), holidayDate);
    if (storageErrorResult) {
      setStorageError(storageErrorResult.userMessage);
      return;
    }

    // Reset form fields on successful submission
    setHolidayName('');
    setHolidayDate('');
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {validationError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
            {validationError}
          </div>
        )}

        {storageError && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded">
            {storageError}
          </div>
        )}

        <div>
          <label htmlFor="holiday-name" className="block text-sm font-medium text-gray-700 mb-2">
            Holiday Name
          </label>
          <input
            type="text"
            id="holiday-name"
            value={holidayName}
            onChange={(e) => setHolidayName(e.target.value)}
            placeholder="Enter holiday name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="holiday-date" className="block text-sm font-medium text-gray-700 mb-2">
            Holiday Date
          </label>
          <input
            type="date"
            id="holiday-date"
            value={holidayDate}
            onChange={(e) => setHolidayDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium"
        >
          Add Holiday
        </button>
      </form>
    </div>
  );
};

export default HolidayForm;