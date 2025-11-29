// Add Holidays Floating Panel Component
// Displays a slide-in panel with both predefined and manual holiday input

import React, { useEffect } from 'react';
import HolidayForm from './HolidayForm';
import PredefinedHolidays from './PredefinedHolidays';

interface AddHolidaysPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddHolidaysPanel: React.FC<AddHolidaysPanelProps> = ({ isOpen, onClose }) => {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-white bg-opacity-40 backdrop-blur-sm z-40 transition-all"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-gray-50 shadow-2xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Add Holidays</h2>
            <p className="text-sm text-gray-600 mt-1">Quick add or manually enter holidays</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close panel"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-8 space-y-8">
          {/* Manual Entry - Collapsible */}
          <div>
            <details className="group" open>
              <summary className="cursor-pointer list-none mb-4">
                <div className="flex items-center justify-between px-4 py-2 bg-white rounded-lg hover:bg-gray-50 transition-colors">
                  <h3 className="text-lg font-semibold text-gray-900">Manual Entry</h3>
                  <svg
                    className="w-5 h-5 text-gray-600 transition-transform group-open:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </summary>
              <div className="mt-4">
                <HolidayForm />
              </div>
            </details>
          </div>

          {/* Quick Add - Always visible */}
          <div className="border-t border-gray-300 pt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 px-4">Quick Add</h3>
            <PredefinedHolidays />
          </div>
        </div>

        {/* Footer with close button */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </>
  );
};

export default AddHolidaysPanel;
