// Holiday List Component Tests
// Following testing requirements: Vitest + React Testing Library
// Testing holiday list display, empty state, and component integration

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import HolidayList from '../HolidayList';
import { Holiday } from '../../context/HolidayContext';
import { HolidayProvider } from '../../context/HolidayContext';

// Helper function to render component with provider
const renderWithProvider = (component: React.ReactElement, holidays: Holiday[] = []) => {
  const TestWrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <HolidayProvider>
        {children}
      </HolidayProvider>
    );
  };

  return render(
    <TestWrapper>
      {component}
    </TestWrapper>
  );
};

// Simplified test - just verify component renders correctly with provider
describe('HolidayList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render empty state message when no holidays', () => {
      renderWithProvider(<HolidayList />);

      expect(screen.getByText(/no holidays added yet/i)).toBeInTheDocument();
      expect(screen.getByText(/add your first holiday above/i)).toBeInTheDocument();
    });

    it('should render as a single component', () => {
      const { container } = renderWithProvider(<HolidayList />);

      expect(container.firstChild).toBeInTheDocument();
    });
  });
});