// Holiday List Component
// Displays array of holidays using HolidayListItem components
// Following component standards: React functional component with TypeScript

import React from 'react';
import { Holiday } from '../context/HolidayContext';
import HolidayListItem from './HolidayListItem';
import { useHolidays } from '../hooks/useHolidays';

const HolidayList: React.FC = () => {
  const { holidays } = useHolidays();

  if (holidays.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No holidays added yet. Add your first holiday above!</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Holidays</h2>
      <div className="grid gap-4">
        {holidays.map((holiday: Holiday) => (
          <HolidayListItem key={holiday.id} holiday={holiday} />
        ))}
      </div>
    </div>
  );
};

export default HolidayList;