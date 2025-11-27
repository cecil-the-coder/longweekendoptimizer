/**
 * Component Test: HolidayForm (AC1 - Form Inputs)
 *
 * Tests the holiday form component with proper input fields
 *
 * Test ID: 1.2-COMP-001
 * Story: 1.2 - Holiday Input UI
 * Acceptance Criteria: 1
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HolidayForm from '../../src/components/HolidayForm';

// Mock HolidayContext for isolation
const mockAddHoliday = vi.fn();
vi.mock('../../src/hooks/useHolidays', () => ({
  useHolidays: () => ({
    addHoliday: mockAddHoliday,
    holidays: [],
  }),
}));

describe('HolidayForm Component', () => {
  beforeEach(() => {
    mockAddHoliday.mockClear();
    vi.clearAllMocks();
  });

  describe('AC1: Form Input Fields', () => {
    test('should render holiday name text input with proper label', () => {
      // GIVEN: HolidayForm component is rendered
      // WHEN: Component mounts
      // THEN: Should display "Holiday Name" text input with label

      render(<HolidayForm />);

      // Check for holiday name input
      const nameInput = screen.getByLabelText('Holiday Name');
      expect(nameInput).toBeInTheDocument();
      expect(nameInput).toHaveAttribute('type', 'text');
      expect(nameInput).toHaveAttribute('placeholder', 'Enter holiday name');
      expect(nameInput).toHaveAttribute('id', 'holiday-name');
    });

    test('should render holiday date input with date picker functionality', () => {
      // GIVEN: HolidayForm component is rendered
      // WHEN: Component mounts
      // THEN: Should display "Holiday Date" date input

      render(<HolidayForm />);

      // Check for holiday date input
      const dateInput = screen.getByLabelText('Holiday Date');
      expect(dateInput).toBeInTheDocument();
      expect(dateInput).toHaveAttribute('type', 'date');
      expect(dateInput).toHaveAttribute('id', 'holiday-date');
    });

    test('should render add holiday button', () => {
      // GIVEN: HolidayForm component is rendered
      // WHEN: Component mounts
      // THEN: Should display "Add Holiday" button

      render(<HolidayForm />);

      const addButton = screen.getByRole('button', { name: 'Add Holiday' });
      expect(addButton).toBeInTheDocument();
      expect(addButton).toHaveTextContent('Add Holiday');
      expect(addButton).toHaveAttribute('type', 'submit');
    });

    test('should have proper form structure with semantic HTML', () => {
      // GIVEN: HolidayForm should follow form best practices
      // WHEN: Component is rendered
      // THEN: Should use proper form structure

      render(<HolidayForm />);

      const form = screen.getByRole('form');
      expect(form).toBeInTheDocument();

      // Should have proper labels for accessibility
      expect(screen.getByLabelText('Holiday Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Holiday Date')).toBeInTheDocument();
    });
  });

  describe('Form Validation and Submission', () => {
    test('should show validation error for empty holiday name', async () => {
      // GIVEN: User submits form without holiday name
      // WHEN: Form is submitted with empty name
      // THEN: Should display validation error

      const user = userEvent.setup();
      render(<HolidayForm />);

      const addButton = screen.getByRole('button', { name: 'Add Holiday' });
      await user.click(addButton);

      // Should show validation error
      expect(screen.getByText('Holiday name is required')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toHaveTextContent('Holiday name is required');
    });

    test('should show validation error for empty holiday date', async () => {
      // GIVEN: User submits form without holiday date
      // WHEN: Form is submitted with empty date
      // THEN: Should display validation error

      const user = userEvent.setup();
      render(<HolidayForm />);

      const nameInput = screen.getByLabelText('Holiday Name');
      const addButton = screen.getByRole('button', { name: 'Add Holiday' });

      // Fill name but leave date empty
      await user.type(nameInput, 'Test Holiday');
      await user.click(addButton);

      // Should show validation error
      expect(screen.getByText('Holiday date is required')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toHaveTextContent('Holiday date is required');
    });

    test('should submit form successfully with valid inputs', async () => {
      // GIVEN: User fills in all required fields
      // WHEN: Form is submitted
      // THEN: Should call addHoliday with correct data

      const user = userEvent.setup();
      render(<HolidayForm />);

      const nameInput = screen.getByLabelText('Holiday Name');
      const dateInput = screen.getByLabelText('Holiday Date');
      const addButton = screen.getByRole('button', { name: 'Add Holiday' });

      // Fill in required fields
      await user.type(nameInput, 'Test Holiday');
      await user.type(dateInput, '2025-12-25');
      await user.click(addButton);

      // Should call addHoliday with trimmed name and date
      expect(mockAddHoliday).toHaveBeenCalledTimes(1);
      expect(mockAddHoliday).toHaveBeenCalledWith('Test Holiday', '2025-12-25');

      // Form should be reset
      expect(nameInput).toHaveValue('');
      expect(dateInput).toHaveValue('');
    });

    test('should trim whitespace from holiday name', async () => {
      // GIVEN: User enters holiday name with leading/trailing whitespace
      // WHEN: Form is submitted
      // THEN: Should call addHoliday with trimmed name

      const user = userEvent.setup();
      render(<HolidayForm />);

      const nameInput = screen.getByLabelText('Holiday Name');
      const dateInput = screen.getByLabelText('Holiday Date');
      const addButton = screen.getByRole('button', { name: 'Add Holiday' });

      // Fill in with extra whitespace
      await user.type(nameInput, '  Test Holiday  ');
      await user.type(dateInput, '2025-12-25');
      await user.click(addButton);

      // Should call addHoliday with trimmed name
      expect(mockAddHoliday).toHaveBeenCalledWith('Test Holiday', '2025-12-25');
    });

    test('should clear validation error when user types', async () => {
      // GIVEN: Validation error is showing
      // WHEN: User starts typing in form field
      // THEN: Should clear validation error

      const user = userEvent.setup();
      render(<HolidayForm />);

      const addButton = screen.getByRole('button', { name: 'Add Holiday' });
      const nameInput = screen.getByLabelText('Holiday Name');

      // Trigger validation error
      await user.click(addButton);
      expect(screen.getByText('Holiday name is required')).toBeInTheDocument();

      // Start typing should clear error
      await user.type(nameInput, 'Test');
      expect(screen.queryByText('Holiday name is required')).not.toBeInTheDocument();
    });
  });

  describe('Form Styling and Structure', () => {
    test('should have proper styling classes', () => {
      // GIVEN: HolidayForm should follow styling guidelines
      // WHEN: Component renders
      // THEN: Should have appropriate Tailwind classes

      render(<HolidayForm />);

      const form = screen.getByRole('form');
      expect(form).toHaveClass('space-y-4');

      const nameInput = screen.getByLabelText('Holiday Name');
      expect(nameInput).toHaveClass(
        'w-full',
        'px-3',
        'py-2',
        'border',
        'border-gray-300',
        'rounded-md',
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-blue-500',
        'focus:border-transparent'
      );

      const addButton = screen.getByRole('button', { name: 'Add Holiday' });
      expect(addButton).toHaveClass(
        'w-full',
        'bg-blue-600',
        'text-white',
        'py-2',
        'px-4',
        'rounded-md',
        'hover:bg-blue-700',
        'transition-colors',
        'duration-200',
        'font-medium'
      );
    });

    test('should have responsive form layout', () => {
      // GIVEN: Form should be responsive
      // WHEN: Component renders
      // THEN: Should have responsive container

      render(<HolidayForm />);

      const container = screen.getByRole('form').parentElement;
      expect(container).toHaveClass('w-full', 'max-w-md', 'mx-auto', 'p-4');
    });
  });
});