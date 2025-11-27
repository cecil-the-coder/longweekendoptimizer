// Holiday Form Component
// Provides input fields for adding holidays with validation
// Enhanced with storage feedback and success messages
// Following component standards: React functional component with TypeScript

import React, { useState, FormEvent } from 'react';
import { useHolidays } from '../hooks/useHolidays';
import { StorageError } from '../services/localStorageService';

const HolidayForm: React.FC = () => {
  const { addHoliday, holidays, storageError: contextStorageError, clearStorageError, isLocalStorageAvailable } = useHolidays();
  const [holidayName, setHolidayName] = useState('');
  const [holidayDate, setHolidayDate] = useState('');
  const [validationError, setValidationError] = useState('');
  const [storageError, setStorageError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setValidationError('');
    setStorageError('');
    setSuccessMessage('');

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

    // Add holiday and handle storage errors/success
    const storageErrorResult = addHoliday(holidayName.trim(), holidayDate);
    if (storageErrorResult) {
      setStorageError(storageErrorResult.userMessage);
      // Clear error after 5 seconds
      setTimeout(() => setStorageError(''), 5000);
      return;
    }

    // Show success message for feedback
    if (isLocalStorageAvailable) {
      setSuccessMessage(`"${holidayName.trim()}" has been added successfully!`);
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } else {
      setSuccessMessage(`"${holidayName.trim()}" has been added (storage not available)`);
      // Clear success message after 5 seconds for storage-unavailable case
      setTimeout(() => setSuccessMessage(''), 5000);
    }

    // Reset form fields on successful submission
    setHolidayName('');
    setHolidayDate('');

    // Clear any existing context storage errors
    clearStorageError();
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {validationError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
            {validationError}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded">
            {successMessage}
          </div>
        )}

        {(storageError || contextStorageError) && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded">
            {storageError || contextStorageError?.userMessage}
          </div>
        )}

        {!isLocalStorageAvailable && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-2 rounded">
            <strong>Note:</strong> Browser storage is not available. Your holidays will be saved temporarily only.
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