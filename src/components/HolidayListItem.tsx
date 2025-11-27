// Holiday List Item Component
// Displays individual holiday with delete functionality
// Enhanced with storage feedback and success messages
// Following component standards: React functional component with TypeScript

import React, { useState } from 'react';
import { Holiday } from '../context/HolidayContext';
import { useHolidays } from '../hooks/useHolidays';

interface HolidayListItemProps {
  holiday: Holiday;
}

const HolidayListItem: React.FC<HolidayListItemProps> = ({ holiday }) => {
  const { deleteHoliday, storageError: contextStorageError, clearStorageError, isLocalStorageAvailable } = useHolidays();
  const [storageError, setStorageError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${holiday.name}"?`)) {
      // Clear previous messages
      setStorageError('');
      setSuccessMessage('');

      const error = deleteHoliday(holiday.id);
      if (error) {
        setStorageError(error.userMessage);
        // Clear error after 5 seconds
        setTimeout(() => {
          setStorageError('');
          setSuccessMessage('');
        }, 5000);
      } else {
        // Show success message
        if (isLocalStorageAvailable) {
          setSuccessMessage(`Holiday deleted successfully!`);
          // Clear success message after 3 seconds
          setTimeout(() => {
            setSuccessMessage('');
            setStorageError('');
          }, 3000);
        } else {
          setSuccessMessage(`${holiday.name} has been deleted (storage not available)`);
          // Clear success message after 5 seconds for storage-unavailable case
          setTimeout(() => {
            setSuccessMessage('');
            setStorageError('');
          }, 5000);
        }
      }

      // Clear any existing context storage errors
      clearStorageError();
    }
  };

  // Format date for readable display (e.g., "Thanksgiving - Thursday, Nov 27, 2025")
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear();

    return `${holiday.name} - ${dayOfWeek}, ${month} ${day}, ${year}`;
  };

  return (
    <div className="space-y-2">
      {successMessage && (
        <div
          role="alert"
          aria-live="polite"
          className="text-green-600 bg-green-50 px-3 py-2 rounded text-sm"
        >
          {successMessage}
        </div>
      )}

      {(storageError || contextStorageError) && (
        <div
          role="alert"
          aria-live="polite"
          className="text-red-600 bg-red-50 px-3 py-2 rounded text-sm"
        >
          {storageError || contextStorageError?.userMessage}
        </div>
      )}

      <div className="flex items-center justify-between p-4 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
        <div className="flex-1">
          <p className="text-lg font-medium text-gray-900">{formatDate(holiday.date)}</p>
        </div>

        <button
          onClick={handleDelete}
          className="ml-4 px-3 py-1 text-sm text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors duration-200"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default HolidayListItem;