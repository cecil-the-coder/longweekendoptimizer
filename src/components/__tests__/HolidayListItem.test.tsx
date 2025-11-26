// Holiday List Item Component Tests
// Following testing requirements: Vitest + React Testing Library
// Testing individual holiday display, formatting, and delete functionality

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HolidayListItem from '../HolidayListItem';
import { Holiday } from '../../context/HolidayContext';
import { HolidayProvider } from '../../context/HolidayContext';

// Mock the useHolidays hook
const mockDeleteHoliday = vi.fn();
vi.mock('../../hooks/useHolidays', () => ({
  useHolidays: () => ({
    deleteHoliday: mockDeleteHoliday,
    holidays: []
  })
}));

// Helper function to render component with provider
const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <HolidayProvider>
      {component}
    </HolidayProvider>
  );
};

describe('HolidayListItem', () => {
  const mockHoliday: Holiday = {
    id: '1',
    name: 'Thanksgiving',
    date: '2025-11-27'
  };

  beforeEach(() => {
    mockDeleteHoliday.mockClear();
    // Mock window.confirm to return true by default
    window.confirm = vi.fn(() => true);
  });

  describe('Holiday Display', () => {
    it('should display holiday name and formatted date', () => {
      renderWithProvider(<HolidayListItem holiday={mockHoliday} />);

      // Since the format is now "Thanksgiving - Thursday, Nov 27, 2025"
      expect(screen.getByText('Thanksgiving - Thursday, Nov 27, 2025')).toBeInTheDocument();
    });

    it('should format different dates correctly', () => {
      const christmasHoliday: Holiday = {
        id: '2',
        name: 'Christmas',
        date: '2025-12-25'
      };

      renderWithProvider(<HolidayListItem holiday={christmasHoliday} />);

      // Since the format is now "Christmas - Thursday, Dec 25, 2025"
      expect(screen.getByText('Christmas - Thursday, Dec 25, 2025')).toBeInTheDocument();
    });

    it('should have correct styling classes', () => {
      renderWithProvider(<HolidayListItem holiday={mockHoliday} />);

      const container = document.querySelector('.text-lg').parentElement.parentElement;
      expect(container).toHaveClass('flex', 'items-center', 'justify-between');
    });
  });

  describe('Delete Functionality', () => {
    it('should render delete button', () => {
      renderWithProvider(<HolidayListItem holiday={mockHoliday} />);

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      expect(deleteButton).toBeInTheDocument();
      expect(deleteButton).toHaveTextContent('Delete');
    });

    it('should show confirmation dialog when delete is clicked', () => {
      renderWithProvider(<HolidayListItem holiday={mockHoliday} />);

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(deleteButton);

      expect(window.confirm).toHaveBeenCalledWith(
        'Are you sure you want to delete "Thanksgiving"?'
      );
    });

    it('should call deleteHoliday when confirmed', async () => {
      window.confirm = vi.fn(() => true);
      renderWithProvider(<HolidayListItem holiday={mockHoliday} />);

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(mockDeleteHoliday).toHaveBeenCalledWith('1');
      });
    });

    it('should not call deleteHoliday when cancelled', () => {
      window.confirm = vi.fn(() => false);
      renderWithProvider(<HolidayListItem holiday={mockHoliday} />);

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(deleteButton);

      expect(mockDeleteHoliday).not.toHaveBeenCalled();
    });

    it('should include correct holiday name in confirmation message', () => {
      const newYearsHoliday: Holiday = {
        id: '3',
        name: "New Year's Day",
        date: '2026-01-01'
      };

      renderWithProvider(<HolidayListItem holiday={newYearsHoliday} />);

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(deleteButton);

      expect(window.confirm).toHaveBeenCalledWith(
        'Are you sure you want to delete "New Year\'s Day"?'
      );
    });
  });

  describe('Date Formatting Edge Cases', () => {
    it('should handle leap year dates correctly', () => {
      const leapDayHoliday: Holiday = {
        id: '4',
        name: 'Leap Day',
        date: '2024-02-29'
      };

      renderWithProvider(<HolidayListItem holiday={leapDayHoliday} />);

      expect(screen.getByText(/Thursday, Feb 29, 2024/i)).toBeInTheDocument();
    });

    it('should handle holidays at the start of year', () => {
      const newYearsHoliday: Holiday = {
        id: '5',
        name: 'New Year\'s Day',
        date: '2025-01-01'
      };

      renderWithProvider(<HolidayListItem holiday={newYearsHoliday} />);

      expect(screen.getByText(/Wednesday, Jan 1, 2025/i)).toBeInTheDocument();
    });

    it('should handle holidays at the end of year', () => {
      const newYearsEveHoliday: Holiday = {
        id: '6',
        name: 'New Year\'s Eve',
        date: '2025-12-31'
      };

      renderWithProvider(<HolidayListItem holiday={newYearsEveHoliday} />);

      expect(screen.getByText(/Wednesday, Dec 31, 2025/i)).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('should have proper accessibility attributes', () => {
      renderWithProvider(<HolidayListItem holiday={mockHoliday} />);

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      expect(deleteButton).toBeInTheDocument();
    });

    it('should render as a single complete component', () => {
      const { container } = renderWithProvider(<HolidayListItem holiday={mockHoliday} />);

 expect(container.firstChild).toBeInTheDocument();
    });
  });
});