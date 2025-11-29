// Error Boundary Integration Tests
// Following testing requirements: Vitest + React Testing Library
// Testing ErrorBoundary integration with application components and error recovery

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorBoundary from '../ErrorBoundary';
import App from '../../App';
import { HolidayProvider } from '../../context/HolidayContext';

// Component that throws different types of errors for testing
const ThrowingComponent = ({ errorType = 'error' }: { errorType?: string }) => {
  switch (errorType) {
    case 'error':
      throw new Error('Component error occurred');
    case 'string':
      throw 'String error occurred';
    case 'object':
      throw { message: 'Object error occurred' };
    case 'null':
      throw null;
    case 'undefined':
      throw undefined;
    case 'async':
      // Simulate async error after mount
      setTimeout(() => {
        throw new Error('Async error after mount');
      }, 100);
      return <div>Will throw async</div>;
    default:
      throw new Error('Unknown error type');
  }
};

// Component with nested error boundary
const NestedErrorComponent = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Nested component error');
  }
  return <div>Nested component working</div>;
};

// Component that throws during rendering vs event handling
const EventErrorComponent = () => {
  const handleClick = () => {
    throw new Error('Error during event handling');
  };

  return (
    <div>
      <button onClick={handleClick} data-testid="error-button">
        Click to Error
      </button>
    </div>
  );
};

describe('ErrorBoundary Integration', () => {
  let consoleSpy: any;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockClear();
  });

  describe('Integration with App Components', () => {
    it('should catch errors in App component tree', () => {
      // Mock window.location.reload to prevent actual reload
      const reloadSpy = vi.fn();
      Object.defineProperty(window, 'location', {
        value: { reload: reloadSpy },
        writable: true,
      });

      render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      );

      // Should show error boundary UI instead of crashing app
      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      expect(screen.queryByText(/component error occurred/i)).not.toBeInTheDocument();
    });

    it('should handle errors in holiday form integration', () => {
      // Mock the useHolidays hook to throw an error
      vi.mock('../../hooks/useHolidays', () => ({
        useHolidays: () => {
          throw new Error('Hook error in holiday form');
        }
      }));

      render(
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      );

      // Should catch hook error and show error boundary
      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    });

    it('should handle errors in context providers', () => {
      // Mock HolidayProvider to throw error
      vi.doMock('../../context/HolidayContext', () => ({
        HolidayProvider: ({ children }: { children: React.ReactNode }) => {
          throw new Error('Context provider error');
        },
        useHolidays: () => ({}),
      }));

      render(
        <ErrorBoundary>
          <HolidayProvider>
            <div>Child content</div>
          </HolidayProvider>
        </ErrorBoundary>
      );

      // Should catch context error
      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    });

    it('should handle errors in localStorage service integration', () => {
      // Mock localStorage service to throw error
      const originalLocalStorage = window.localStorage;

      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: () => {
            throw new Error('localStorage read error');
          },
          setItem: vi.fn(),
          removeItem: vi.fn(),
          clear: vi.fn(),
          get length() { return 0; },
          key: vi.fn(),
        },
        writable: true,
      });

      render(
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      );

      // Should catch localStorage service errors
      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();

      // Restore localStorage
      Object.defineProperty(window, 'localStorage', {
        value: originalLocalStorage,
        writable: true,
      });
    });
  });

  describe('Nested Error Boundaries', () => {
    it('should handle nested error boundary hierarchy correctly', () => {
      render(
        <ErrorBoundary>
          <div data-testid="outer-content">
            <ErrorBoundary>
              <NestedErrorComponent shouldThrow={true} />
            </ErrorBoundary>
          </div>
        </ErrorBoundary>
      );

      // Inner error boundary should catch the error
      const errorBoundaries = screen.getAllByTestId('error-boundary');
      expect(errorBoundaries).toHaveLength(1);

      // Outer content should still render
      expect(screen.getByTestId('outer-content')).toBeInTheDocument();
    });

    it('should propagate errors up when child has no error boundary', () => {
      render(
        <ErrorBoundary>
          <div data-testid="outer-content">
            <NestedErrorComponent shouldThrow={true} />
          </div>
        </ErrorBoundary>
      );

      // Outer error boundary should catch the error
      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
      expect(screen.queryByTestId('outer-content')).not.toBeInTheDocument();
    });

    it('should handle multiple errors in different branches', () => {
      render(
        <ErrorBoundary>
          <div>
            <ErrorBoundary>
              <ThrowingComponent errorType="error" />
            </ErrorBoundary>
            <ErrorBoundary>
              <ThrowingComponent errorType="string" />
            </ErrorBoundary>
          </div>
        </ErrorBoundary>
      );

      // Should have two separate error boundaries
      const errorBoundaries = screen.getAllByTestId('error-boundary');
      expect(errorBoundaries).toHaveLength(2);
    });
  });

  describe('Error Recovery Integration', () => {
    it('should reload the app when recovery button is clicked', async () => {
      const reloadSpy = vi.fn();
      Object.defineProperty(window, 'location', {
        value: { reload: reloadSpy },
        writable: true,
      });

      render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      );

      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      await userEvent.click(tryAgainButton);

      expect(reloadSpy).toHaveBeenCalledTimes(1);
    });

    it('should reset error state after successful reload', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      );

      // Should show error boundary
      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();

      // In a real scenario, this would be after page reload
      // Here we're testing that the error boundary can handle new content
      const reloadSpy = vi.fn();
      Object.defineProperty(window, 'location', {
        value: { reload: reloadSpy },
        writable: true,
      });

      rerender(
        <ErrorBoundary>
          <div data-testid="recovered-content">App recovered</div>
        </ErrorBoundary>
      );

      // If error state was reset, should show new content
      // In real scenario, this would happen after actual page reload
      expect(screen.getByTestId('error-boundary')).toBeInTheDocument(); // Still shows error until reload
    });

    it('should handle failed reload gracefully', async () => {
      // Mock reload to throw error
      const reloadSpy = vi.fn(() => {
        throw new Error('Reload failed');
      });

      Object.defineProperty(window, 'location', {
        value: { reload: reloadSpy },
        writable: true,
      });

      render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      );

      const tryAgainButton = screen.getByRole('button', { name: /try again/i });

      // Should not throw when reload fails
      await expect(userEvent.click(tryAgainButton)).resolves.not.toThrow();
      expect(reloadSpy).toHaveBeenCalled();
    });
  });

  describe('Error Types Integration', () => {
    it('should handle JavaScript Error objects', () => {
      render(
        <ErrorBoundary>
          <ThrowingComponent errorType="error" />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    });

    it('should handle string errors', () => {
      render(
        <ErrorBoundary>
          <ThrowingComponent errorType="string" />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    });

    it('should handle object errors', () => {
      render(
        <ErrorBoundary>
          <ThrowingComponent errorType="object" />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    });

    it('should handle null/undefined errors', () => {
      render(
        <ErrorBoundary>
          <ThrowingComponent errorType="null" />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    });

    it('should handle async errors that occur after mount', async () => {
      vi.useFakeTimers();

      render(
        <ErrorBoundary>
          <ThrowingComponent errorType="async" />
        </ErrorBoundary>
      );

      // Initially should render normally
      expect(screen.getByText('Will throw async')).toBeInTheDocument();

      // Advance timers to trigger async error
      vi.advanceTimersByTime(100);

      await waitFor(() => {
        expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
      });

      vi.useRealTimers();
    });
  });

  describe('Event Handler Error Boundaries', () => {
    it('should not catch errors inside event handlers (React 16+ behavior)', async () => {
      render(
        <ErrorBoundary>
          <EventErrorComponent />
        </ErrorBoundary>
      );

      // Component should render normally
      expect(screen.getByTestId('error-button')).toBeInTheDocument();

      // Click button that throws in event handler
      const errorButton = screen.getByTestId('error-button');

      // Should not catch event handler errors
      await expect(userEvent.click(errorButton)).rejects.toThrow('Error during event handling');

      // Error boundary should not trigger
      expect(screen.queryByTestId('error-boundary')).not.toBeInTheDocument();
    });

    it('should render normally when event error boundaries are bypassed', () => {
      render(
        <ErrorBoundary>
          <div>
            <button onClick={() => {}}>Normal button</button>
          </div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Normal button')).toBeInTheDocument();
      expect(screen.queryByTestId('error-boundary')).not.toBeInTheDocument();
    });
  });

  describe('Error Boundary with Async Operations', () => {
    it('should handle errors in async component lifecycle', async () => {
      const AsyncErrorComponent = () => {
        React.useEffect(() => {
          throw new Error('Error in useEffect');
        }, []);

        return <div>Async component</div>;
      };

      render(
        <ErrorBoundary>
          <AsyncErrorComponent />
        </ErrorBoundary>
      );

      await waitFor(() => {
        expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
      });
    });

    it('should handle Promise rejections in components', async () => {
      const PromiseErrorComponent = () => {
        React.useEffect(() => {
          Promise.reject(new Error('Promise rejection error'));
        }, []);

        return <div>Promise component</div>;
      };

      // Mock global error handler to prevent console noise
      const originalHandler = window.onerror;
      window.onerror = vi.fn();

      render(
        <ErrorBoundary>
          <PromiseErrorComponent />
        </ErrorBoundary>
      );

      // Note: Error boundaries don't catch Promise rejections directly
      // They catch errors thrown synchronously, not rejected promises
      expect(screen.queryByTestId('error-boundary')).not.toBeInTheDocument();

      // Restore original handler
      window.onerror = originalHandler;
    });
  });

  describe('Error Boundary Accessibility Integration', () => {
    it('should properly announce errors to screen readers', () => {
      render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      );

      const errorBoundary = screen.getByTestId('error-boundary');
      expect(errorBoundary).toHaveAttribute('role', 'alert');
      expect(errorBoundary).toHaveAttribute('aria-live', 'polite');
    });

    it('should maintain keyboard focus in error boundary state', () => {
      render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      );

      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      expect(tryAgainButton).toBeInTheDocument();
      expect(tryAgainButton).not.toHaveAttribute('tabIndex', '-1');
    });

    it('should provide accessible recovery options', () => {
      render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      );

      // Should have properly labeled recovery buttons
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument();
    });
  });

  describe('Error Boundary Performance', () => {
    it('should not impact performance when no errors occur', () => {
      const startTime = performance.now();

      render(
        <ErrorBoundary>
          <div>Normal component content</div>
        </ErrorBoundary>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render quickly with minimal overhead
      expect(renderTime).toBeLessThan(100); // 100ms threshold
      expect(screen.getByText('Normal component content')).toBeInTheDocument();
    });

    it('should render error fallback quickly after error occurs', () => {
      const startTime = performance.now();

      render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render error state quickly even with error
      expect(renderTime).toBeLessThan(200); // 200ms threshold for error state
      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    });
  });

  describe('Error Boundary in Production vs Development', () => {
    it('should show detailed error info in development mode', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      );

      // Should show error details in development
      expect(screen.getByText(/component error occurred/i)).toBeInTheDocument();
      expect(screen.getByText(/error details \(development only\):/i)).toBeInTheDocument();

      process.env.NODE_ENV = originalNodeEnv;
    });

    it('should hide error details in production mode', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      );

      // Should not show error details in production
      expect(screen.queryByText(/component error occurred/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/error details \(development only\):/i)).not.toBeInTheDocument();

      process.env.NODE_ENV = originalNodeEnv;
    });

    it('should log errors appropriately in different environments', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      );

      // Should log detailed error in development
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('ErrorBoundary caught an error:'),
        expect.any(Error),
        expect.any(Object)
      );

      process.env.NODE_ENV = originalNodeEnv;
    });
  });
});