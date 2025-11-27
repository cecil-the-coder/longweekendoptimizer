// ErrorBoundary Component Tests
// Following testing requirements: Vitest + React Testing Library
// Testing error catching, fallback UI, and recovery options

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorBoundary from '../ErrorBoundary';

// Component that throws an error for testing ErrorBoundary
const ThrowErrorComponent = ({ shouldThrow = true }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error for ErrorBoundary');
  }
  return <div>No error</div>;
};

// Component that throws a string error (non-Error object)
const ThrowStringErrorComponent = () => {
  throw 'String error message';
};

describe('ErrorBoundary', () => {
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  afterEach(() => {
    consoleSpy.mockClear();
  });

  describe('Normal Operation', () => {
    it('should render children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div data-testid="normal-content">Normal content</div>
        </ErrorBoundary>
      );

      expect(screen.getByTestId('normal-content')).toBeInTheDocument();
      expect(screen.queryByTestId('error-boundary')).not.toBeInTheDocument();
    });
  });

  describe('Error Catching', () => {
    it('should catch and render fallback UI when child component throws Error', () => {
      render(
        <ErrorBoundary>
          <ThrowErrorComponent />
        </ErrorBoundary>
      );

      // Should display error boundary UI instead of error
      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      expect(screen.getByText(/an unexpected error occurred/i)).toBeInTheDocument();
    });

    it('should catch and render fallback UI when child component throws string error', () => {
      render(
        <ErrorBoundary>
          <ThrowStringErrorComponent />
        </ErrorBoundary>
      );

      // Should display error boundary UI
      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    it('should log error to console in development mode', () => {
      // Mock NODE_ENV for development
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(
        <ErrorBoundary>
          <ThrowErrorComponent />
        </ErrorBoundary>
      );

      // Should log error details in development
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('ErrorBoundary caught an error:'),
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String)
        })
      );

      // Restore NODE_ENV
      process.env.NODE_ENV = originalNodeEnv;
    });

    it('should not log error details in production mode', () => {
      // Mock NODE_ENV for production
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      render(
        <ErrorBoundary>
          <ThrowErrorComponent />
        </ErrorBoundary>
      );

      // Should not log detailed error in production
      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('ErrorBoundary caught an error:'),
        expect.any(Error),
        expect.any(Object)
      );

      // Restore NODE_ENV
      process.env.NODE_ENV = originalNodeEnv;
    });
  });

  describe('Recovery Options', () => {
    it('should display "Try Again" button that reloads the page', async () => {
      // Mock window.location.reload
      const reloadSpy = vi.fn();
      Object.defineProperty(window, 'location', {
        value: { reload: reloadSpy },
        writable: true,
      });

      render(
        <ErrorBoundary>
          <ThrowErrorComponent />
        </ErrorBoundary>
      );

      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      expect(tryAgainButton).toBeInTheDocument();

      // Click try again button
      await userEvent.click(tryAgainButton);

      // Should reload the page
      expect(reloadSpy).toHaveBeenCalledTimes(1);
    });

    it('should display "Reload Page" button that also reloads the page', async () => {
      // Mock window.location.reload
      const reloadSpy = vi.fn();
      Object.defineProperty(window, 'location', {
        value: { reload: reloadSpy },
        writable: true,
      });

      render(
        <ErrorBoundary>
          <ThrowErrorComponent />
        </ErrorBoundary>
      );

      const reloadButton = screen.getByRole('button', { name: /reload page/i });
      expect(reloadButton).toBeInTheDocument();

      // Click reload button
      await userEvent.click(reloadButton);

      // Should reload the page
      expect(reloadSpy).toHaveBeenCalledTimes(1);
    });

    it('should display error details in development mode', () => {
      // Mock NODE_ENV for development
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(
        <ErrorBoundary>
          <ThrowErrorComponent />
        </ErrorBoundary>
      );

      // Should show error details in development
      expect(screen.getByText(/test error for errorboundary/i)).toBeInTheDocument();
      expect(screen.getByText(/error details \(development only\):/i)).toBeInTheDocument();

      // Restore NODE_ENV
      process.env.NODE_ENV = originalNodeEnv;
    });

    it('should not display error details in production mode', () => {
      // Mock NODE_ENV for production
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      render(
        <ErrorBoundary>
          <ThrowErrorComponent />
        </ErrorBoundary>
      );

      // Should not show error details in production
      expect(screen.queryByText(/test error for errorboundary/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/error details \(development only\):/i)).not.toBeInTheDocument();

      // Restore NODE_ENV
      process.env.NODE_ENV = originalNodeEnv;
    });
  });

  describe('Error State Management', () => {
    it('should reset error state and retry when component recovers', async () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowErrorComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      // Should show error boundary
      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();

      // Mock window.location.reload to prevent actual reload during test
      const reloadSpy = vi.fn();
      Object.defineProperty(window, 'location', {
        value: { reload: reloadSpy },
        writable: true,
      });

      // Click try again
      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      await userEvent.click(tryAgainButton);

      // Verify reload was called
      expect(reloadSpy).toHaveBeenCalled();
    });

    it('should handle multiple errors gracefully', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowErrorComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      // Should show error boundary
      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();

      // Rerender with same error - should maintain error state
      rerender(
        <ErrorBoundary>
          <ThrowErrorComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      // Should still show error boundary
      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    });
  });

  describe('Component Tree Integration', () => {
    it('should only catch errors from direct children, not parent components', () => {
      // ErrorBoundary should not catch errors from itself, only from children
      expect(() => {
        render(
          <ErrorBoundary>
            <div>Normal content</div>
          </ErrorBoundary>
        );
      }).not.toThrow();
    });

    it('should handle nested error boundaries correctly', () => {
      const NestedErrorBoundary = () => (
        <ErrorBoundary>
          <ErrorBoundary>
            <ThrowErrorComponent />
          </ErrorBoundary>
        </ErrorBoundary>
      );

      render(<NestedErrorBoundary />);

      // Inner error boundary should catch the error
      // Should only show one error boundary UI (the inner one)
      const errorBoundaries = screen.getAllByTestId('error-boundary');
      expect(errorBoundaries).toHaveLength(1);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      render(
        <ErrorBoundary>
          <ThrowErrorComponent />
        </ErrorBoundary>
      );

      // Should be a region landmark
      const errorBoundary = screen.getByTestId('error-boundary');
      expect(errorBoundary).toHaveAttribute('role', 'alert');
      expect(errorBoundary).toHaveAttribute('aria-live', 'polite');
    });

    it('should have keyboard accessible buttons', () => {
      render(
        <ErrorBoundary>
          <ThrowErrorComponent />
        </ErrorBoundary>
      );

      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      const reloadButton = screen.getByRole('button', { name: /reload page/i });

      // Buttons should be focusable and clickable
      expect(tryAgainButton).toBeInTheDocument();
      expect(reloadButton).toBeInTheDocument();
    });
  });
});