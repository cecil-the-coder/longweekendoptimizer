// LoadingSpinner Component Tests
// Following testing requirements: Vitest + React Testing Library
// Testing spinner display, sizes, labels, and accessibility

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  describe('Default Rendering', () => {
    it('should render loading spinner with default settings', () => {
      render(<LoadingSpinner data-testid="loading-spinner" />);

      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveAttribute('role', 'status');
      expect(spinner).toHaveAttribute('aria-label', 'Loading...');
    });

    it('should display spinning animation element', () => {
      render(<LoadingSpinner data-testid="loading-spinner" />);

      // Should have the spinner element with animation classes
      const spinnerElement = screen.getByTestId('spinner-element');
      expect(spinnerElement).toBeInTheDocument();
      expect(spinnerElement).toHaveClass('animate-spin');
    });

    it('should have default medium size', () => {
      render(<LoadingSpinner data-testid="loading-spinner" />);

      const spinnerElement = screen.getByTestId('spinner-element');
      expect(spinnerElement).toHaveClass('w-8', 'h-8'); // Default medium size on SVG
    });
  });

  describe('Size Variations', () => {
    it('should render small sized spinner', () => {
      render(<LoadingSpinner size="small" data-testid="loading-spinner" />);

      const spinnerElement = screen.getByTestId('spinner-element');
      expect(spinnerElement).toHaveClass('w-4', 'h-4'); // Small size on SVG
    });

    it('should render medium sized spinner (default)', () => {
      render(<LoadingSpinner size="medium" data-testid="loading-spinner" />);

      const spinnerElement = screen.getByTestId('spinner-element');
      expect(spinnerElement).toHaveClass('w-8', 'h-8'); // Medium size on SVG
    });

    it('should render large sized spinner', () => {
      render(<LoadingSpinner size="large" data-testid="loading-spinner" />);

      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveClass('w-12', 'h-12'); // Large size
    });

    it('should render extra large sized spinner', () => {
      render(<LoadingSpinner size="xlarge" data-testid="loading-spinner" />);

      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveClass('w-16', 'h-16'); // Extra large size
    });

    it('should default to medium size for invalid size prop', () => {
      render(<LoadingSpinner size="invalid" as any data-testid="loading-spinner" />);

      // Should fallback to default medium size
      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveClass('w-8', 'h-8');
    });
  });

  describe('Custom Labels', () => {
    it('should display custom label when provided', () => {
      render(<LoadingSpinner label="Loading holidays..." data-testid="loading-spinner" />);

      expect(screen.getByText('Loading holidays...')).toBeInTheDocument();

      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveAttribute('aria-label', 'Loading holidays...');
    });

    it('should display empty label correctly', () => {
      render(<LoadingSpinner label="" data-testid="loading-spinner" />);

      // Should not display any text content
      expect(screen.queryByText(/\S/)).not.toBeInTheDocument();

      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveAttribute('aria-label', '');
    });

    it('should handle long labels by wrapping text', () => {
      const longLabel = 'Loading holiday recommendations and calculating optimal days off for your upcoming long weekends based on the holidays you have entered...';

      render(<LoadingSpinner label={longLabel} data-testid="loading-spinner" />);

      expect(screen.getByText(longLabel)).toBeInTheDocument();

      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveAttribute('aria-label', longLabel);
    });

    it('should escape HTML entities in labels', () => {
      render(<LoadingSpinner label="Loading & saving data..." data-testid="loading-spinner" />);

      expect(screen.getByText('Loading & saving data...')).toBeInTheDocument();

      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveAttribute('aria-label', 'Loading & saving data...');
    });
  });

  describe('Label Visibility', () => {
    it('should hide label text when showLabel is false', () => {
      render(
        <LoadingSpinner
          label="Hidden label"
          showLabel={false}
          data-testid="loading-spinner"
        />
      );

      // Label text should not be visible
      expect(screen.queryByText('Hidden label')).not.toBeInTheDocument();

      // But aria-label should still be set for accessibility
      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveAttribute('aria-label', 'Hidden label');
    });

    it('should show label text when showLabel is true (default)', () => {
      render(
        <LoadingSpinner
          label="Visible label"
          showLabel={true}
          data-testid="loading-spinner"
        />
      );

      // Label text should be visible
      expect(screen.getByText('Visible label')).toBeInTheDocument();

      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveAttribute('aria-label', 'Visible label');
    });

    it('should show label text when showLabel is not provided', () => {
      render(
        <LoadingSpinner
          label="Default visible label"
          data-testid="loading-spinner"
        />
      );

      // Label text should be visible by default
      expect(screen.getByText('Default visible label')).toBeInTheDocument();
    });
  });

  describe('Styling Variants', () => {
    it('should render default (primary) variant', () => {
      render(<LoadingSpinner variant="default" data-testid="loading-spinner" />);

      const spinnerElement = screen.getByTestId('spinner-element');
      expect(spinnerElement).toHaveClass('text-blue-600', 'fill-blue-200');
    });

    it('should render light variant', () => {
      render(<LoadingSpinner variant="light" data-testid="loading-spinner" />);

      const spinnerElement = screen.getByTestId('spinner-element');
      expect(spinnerElement).toHaveClass('text-white', 'fill-gray-200');
    });

    it('should render dark variant', () => {
      render(<LoadingSpinner variant="dark" data-testid="loading-spinner" />);

      const spinnerElement = screen.getByTestId('spinner-element');
      expect(spinnerElement).toHaveClass('text-gray-900', 'fill-gray-100');
    });

    it('should render success variant', () => {
      render(<LoadingSpinner variant="success" data-testid="loading-spinner" />);

      const spinnerElement = screen.getByTestId('spinner-element');
      expect(spinnerElement).toHaveClass('text-green-600', 'fill-green-200');
    });

    it('should render warning variant', () => {
      render(<LoadingSpinner variant="warning" data-testid="loading-spinner" />);

      const spinnerElement = screen.getByTestId('spinner-element');
      expect(spinnerElement).toHaveClass('text-yellow-600', 'fill-yellow-200');
    });

    it('should render error variant', () => {
      render(<LoadingSpinner variant="error" data-testid="loading-spinner" />);

      const spinnerElement = screen.getByTestId('spinner-element');
      expect(spinnerElement).toHaveClass('text-red-600', 'fill-red-200');
    });

    it('should default to default variant for invalid variant prop', () => {
      render(<LoadingSpinner variant="invalid" as any data-testid="loading-spinner" />);

      // Should fallback to default variant
      const spinnerElement = screen.getByTestId('spinner-element');
      expect(spinnerElement).toHaveClass('text-blue-600', 'fill-blue-200');
    });
  });

  describe('Custom Classes', () => {
    it('should accept custom className', () => {
      render(
        <LoadingSpinner
          className="custom-class another-class"
          data-testid="loading-spinner"
        />
      );

      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveClass('custom-class', 'another-class');
    });

    it('should merge custom classes with default classes', () => {
      render(
        <LoadingSpinner
          className="custom-class"
          size="large"
          data-testid="loading-spinner"
        />
      );

      const spinner = screen.getByTestId('loading-spinner');
      // Should have both custom classes and size classes
      expect(spinner).toHaveClass('custom-class', 'w-12', 'h-12');
    });
  });

  describe('Accessibility', () => {
    it('should have proper role and aria-live attributes', () => {
      render(<LoadingSpinner data-testid="loading-spinner" />);

      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveAttribute('role', 'status');
      expect(spinner).toHaveAttribute('aria-live', 'polite');
    });

    it('should have aria-label for screen readers', () => {
      render(<LoadingSpinner label="Processing holidays..." data-testid="loading-spinner" />);

      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveAttribute('aria-label', 'Processing holidays...');
    });

    it('should have default aria-label when no label provided', () => {
      render(<LoadingSpinner data-testid="loading-spinner" />);

      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveAttribute('aria-label', 'Loading...');
    });

    it('should not announce to screen readers when aria-hidden is true', () => {
      render(<LoadingSpinner aria-hidden={true} data-testid="loading-spinner" />);

      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveAttribute('aria-hidden', 'true');
      expect(spinner).not.toHaveAttribute('role', 'status');
      expect(spinner).not.toHaveAttribute('aria-live');
    });

    it('should be keyboard accessible when interactive', () => {
      render(<LoadingSpinner tabIndex={0} data-testid="loading-spinner" />);

      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Layout Behavior', () => {
    it('should have inline-flex display by default', () => {
      render(<LoadingSpinner data-testid="loading-spinner" />);

      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveClass('inline-flex');
    });

    it('should be centered with flex properties', () => {
      render(<LoadingSpinner data-testid="loading-spinner" />);

      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveClass('items-center', 'justify-center');
    });

    it('should not grow or shrink in flex layout', () => {
      render(<LoadingSpinner data-testid="loading-spinner" />);

      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveClass('flex-shrink-0');
    });

    it('should handle container overflow gracefully', () => {
      render(
        <div style={{ width: '20px', height: '20px' }}>
          <LoadingSpinner size="xlarge" data-testid="loading-spinner" />
        </div>
      );

      // Should still render without breaking layout
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  describe('Component Lifecycle', () => {
    it('should handle prop updates correctly', () => {
      const { rerender } = render(
        <LoadingSpinner
          label="Initial label"
          size="small"
          data-testid="loading-spinner"
        />
      );

      expect(screen.getByText('Initial label')).toBeInTheDocument();
      expect(screen.getByTestId('loading-spinner')).toHaveClass('w-4', 'h-4');

      rerender(
        <LoadingSpinner
          label="Updated label"
          size="large"
          data-testid="loading-spinner"
        />
      );

      expect(screen.getByText('Updated label')).toBeInTheDocument();
      expect(screen.getByTestId('loading-spinner')).toHaveClass('w-12', 'h-12');
    });

    it('should handle variant changes', () => {
      const { rerender } = render(
        <LoadingSpinner
          variant="success"
          data-testid="loading-spinner"
        />
      );

      const spinnerElement = screen.getByTestId('spinner-element');
      expect(spinnerElement).toHaveClass('text-green-600');

      rerender(
        <LoadingSpinner
          variant="error"
          data-testid="loading-spinner"
        />
      );

      expect(spinnerElement).toHaveClass('text-red-600');
    });
  });

  describe('Error Cases', () => {
    it('should handle missing testId gracefully', () => {
      expect(() => {
        render(<LoadingSpinner />);
      }).not.toThrow();

      // Should still render spinner
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should handle null/undefined props gracefully', () => {
      expect(() => {
        render(<LoadingSpinner label={null} className={undefined} />);
      }).not.toThrow();

      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });
});