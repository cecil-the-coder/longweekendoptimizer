// Holiday List Item Component
// Displays individual holiday with delete functionality
// Following component standards: React functional component with TypeScript

import React, { useState } from 'react';
import { Holiday } from '../context/HolidayContext';
import { useHolidays } from '../hooks/useHolidays';

interface HolidayListItemProps {
  holiday: Holiday;
}

const HolidayListItem: React.FC<HolidayListItemProps> = ({ holiday }) => {
  const { deleteHoliday } = useHolidays();
  const [storageError, setStorageError] = useState('');

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${holiday.name}"?`)) {
      const error = deleteHoliday(holiday.id);
      if (error) {
        setStorageError(error.userMessage);
        // Clear error after 5 seconds
        setTimeout(() => setStorageError(''), 5000);
      }
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
      {storageError && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 py-2 rounded text-sm">
          {storageError}
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