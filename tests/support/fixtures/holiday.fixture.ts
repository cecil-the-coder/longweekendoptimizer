/**
 * Holiday Test Fixtures
 *
 * Provides composable test fixtures for holiday-related tests
 * Follows fixture architecture patterns with pure functions + auto-cleanup
 */

import { test as base } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Holiday, createHoliday, createHolidays, createDateFormattingTestHolidays } from '../factories/holiday.factory';

// Mock HolidayContext functions
export type HolidayContextValue = {
  holidays: Holiday[];
  addHoliday: vi.MockedFunction<(holiday: Omit<Holiday, 'id'>) => Promise<void>>;
  deleteHoliday: vi.MockedFunction<(id: string) => Promise<void>>;
  isLoading: boolean;
  error: string | null;
};

// Base test context with holiday fixtures
export interface HolidayTestContext {
  holidays: Holiday[];
  user: ReturnType<typeof userEvent.setup>;
  renderHolidayApp: (contextOverrides?: Partial<HolidayContextValue>) => ReturnType<typeof render>;
  createMockHolidayContext: (overrides?: Partial<HolidayContextValue>) => HolidayContextValue;
  addHolidayToUI: (holiday: Omit<Holiday, 'id'>) => Promise<void>;
  deleteHolidayFromUI: (holidayId: string) => Promise<void>;
  fillHolidayForm: (name: string, date: string) => Promise<void>;
  getHolidayFormElements: () => {
    nameInput: HTMLElement;
    dateInput: HTMLElement;
    addButton: HTMLElement;
  };
  getHolidayListElements: () => {
    list: HTMLElement | null;
    items: HTMLElement[];
    deleteButtons: HTMLElement[];
  };
}

// Mock the useHolidays hook
export const createMockHolidayContext = (overrides: Partial<HolidayContextValue> = {}): HolidayContextValue => ({
  holidays: [],
  addHoliday: vi.fn().mockResolvedValue(undefined),
  deleteHoliday: vi.fn().mockResolvedValue(undefined),
  isLoading: false,
  error: null,
  ...overrides,
});

// Helper to mock the useHolidays hook in tests
export const mockUseHolidays = (contextValue: Partial<HolidayContextValue> = {}) => {
  const mockContext = createMockHolidayContext(contextValue);

  vi.doMock('../../src/hooks/useHolidays', () => ({
    useHolidays: () => mockContext,
  }));

  return mockContext;
};

// Extend test fixture with holiday-specific utilities
export const test = base.extend<HolidayTestContext>({
  // Default test holidays
  holidays: [createHoliday(), createHoliday(), createHoliday()],

  // User event setup
  user: async ({}, use) => {
    const user = userEvent.setup();
    await use(user);
  },

  // Render holiday app with mock context
  renderHolidayApp: async ({ holidays, user }, use) => {
    const renderWithMockContext = (contextOverrides?: Partial<HolidayContextValue>) => {
      const mockContext = createMockHolidayContext({
        holidays,
        ...contextOverrides,
      });

      vi.doMock('../../src/hooks/useHolidays', () => ({
        useHolidays: () => mockContext,
      }));

      // Dynamic import after mocking
      const { HolidayApp } = require('../../src/components/HolidayApp');
      return render(<HolidayApp />);
    };

    await use(renderWithMockContext);
  },

  // Create mock context helper
  createMockHolidayContext: async ({}, use) => {
    const factory = createMockHolidayContext;
    await use(factory);
  },

  // Helper to add holiday through UI
  addHolidayToUI: async ({ user, fillHolidayForm }, use) => {
    const addHoliday = async (holiday: Omit<Holiday, 'id'>) => {
      await fillHolidayForm(holiday.name, holiday.date);
      // Find and click the add button
      const addButton = screen.getByTestId('add-holiday');
      await user.click(addButton);
    };

    await use(addHoliday);
  },

  // Helper to delete holiday through UI
  deleteHolidayFromUI: async ({ user }, use) => {
    const deleteHoliday = async (holidayId: string) => {
      const deleteButton = screen.getByTestId(`holiday-delete-${holidayId}`)
        || screen.queryByTestId(`holiday-delete-button`); // Fallback

      if (deleteButton) {
        await user.click(deleteButton);
      } else {
        // Find by holiday ID data attribute
        const button = screen.getByTestId('holiday-delete-button');
        if (button.getAttribute('data-holiday-id') === holidayId) {
          await user.click(button);
        }
      }
    };

    await use(deleteHoliday);
  },

  // Helper to fill holiday form
  fillHolidayForm: async ({ user }, use) => {
    const fillForm = async (name: string, date: string) => {
      const { nameInput, dateInput } = getHolidayFormElements();

      // Clear existing values
      await user.clear(nameInput);
      await user.clear(dateInput);

      // Type new values
      await user.type(nameInput, name);
      await user.type(dateInput, date);
    };

    await use(fillForm);
  },

  // Helper to get form elements
  getHolidayFormElements: () => {
    return {
      nameInput: screen.getByTestId('holiday-name'),
      dateInput: screen.getByTestId('holiday-date'),
      addButton: screen.getByTestId('add-holiday'),
    };
  },

  // Helper to get list elements
  getHolidayListElements: () => {
    const list = screen.queryByTestId('holiday-list');
    const items = screen.queryAllByTestId('holiday-item');
    const deleteButtons = screen.queryAllByTestId('holiday-delete-button');

    return { list, items, deleteButtons };
  },
});

/**
 * Specialized fixtures for different test scenarios
 */

export const testWithEmptyHolidays = test.extend({
  holidays: [],
});

export const testWithManyHolidays = test.extend({
  holidays: createHolidays(50), // Large list for performance/responsiveness tests
});

export const testWithDateFormattingEdgeCases = test.extend({
  holidays: createDateFormattingTestHolidays(),
});

export const testWithValidationErrorScenarios = test.extend({
  holidays: [],
  mockContext: async ({}, use) => {
    const context = createMockHolidayContext({
      addHoliday: vi.fn().mockRejectedValue(new Error('Validation failed')),
    });
    await use(context);
  },
});

/**
 * Async test utilities
 */
export const waitForHolidayToAppear = async (holidayName: string) => {
  await waitFor(() => {
    expect(screen.getByText(holidayName)).toBeInTheDocument();
  });
};

export const waitForHolidayToDisappear = async (holidayName: string) => {
  await waitFor(() => {
    expect(screen.queryByText(holidayName)).not.toBeInTheDocument();
  });
};

export const waitForEmptyState = async () => {
  await waitFor(() => {
    expect(screen.getByTestId('empty-holiday-list')).toBeInTheDocument();
  });
};

export const waitForErrorMessage = async (expectedMessage?: string) => {
  await waitFor(() => {
    const errorElement = screen.getByTestId('error-message');
    expect(errorElement).toBeInTheDocument();

    if (expectedMessage) {
      expect(errorElement).toHaveTextContent(expectedMessage);
    }
  });
};

/**
 * Form validation helpers
 */
export const expectFormToBeValid = () => {
  const { nameInput, dateInput, addButton } = getHolidayFormElements();
  expect(nameInput).toBeValid();
  expect(dateInput).toBeValid();
  expect(addButton).toBeEnabled();
};

export const expectFormToBeInvalid = () => {
  const { addButton } = getHolidayFormElements();
  expect(addButton).toBeDisabled();
};

export const expectFieldError = (fieldType: 'name' | 'date', expectedMessage?: string) => {
  const errorElement = screen.getByTestId(`${fieldType}-error`);
  expect(errorElement).toBeInTheDocument();

  if (expectedMessage) {
    expect(errorElement).toHaveTextContent(expectedMessage);
  }
};

/**
 * Mobile/responsive testing helpers
 */
export const simulateMobileViewport = () => {
  // In a real test environment, you'd use the testing library's viewport utilities
  // For Vitest component tests, we simulate by adding CSS classes or data attributes
  document.body.classList.add('mobile-viewport');
};

export const simulateDesktopViewport = () => {
  document.body.classList.remove('mobile-viewport');
};

/**
 * Accessibility testing helpers
 */
export const expectAccessibleForm = () => {
  const { nameInput, dateInput, addButton } = getHolidayFormElements();

  expect(nameInput).toHaveAttribute('aria-label', 'Holiday Name');
  expect(nameInput).toHaveAttribute('aria-required', 'true');
  expect(dateInput).toHaveAttribute('aria-label', 'Holiday Date');
  expect(dateInput).toHaveAttribute('aria-required', 'true');
  expect(addButton).toHaveAttribute('aria-label', 'Add Holiday');
};

export const expectAccessibleList = () => {
  const { list, items, deleteButtons } = getHolidayListElements();

  if (list) {
    expect(list).toHaveAttribute('role', 'list');
  }

  items.forEach((item, index) => {
    expect(item).toHaveAttribute('role', 'listitem');
  });

  deleteButtons.forEach((button) => {
    expect(button).toHaveAttribute('aria-label', expect.stringContaining('Delete'));
  });
};

export { expect };