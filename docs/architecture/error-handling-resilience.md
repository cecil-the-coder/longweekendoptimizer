# Error Handling and Resilience

This document defines error handling strategies and resilience patterns for the HolidayHacker application.

## Principles

1. **Graceful Degradation**: App continues to function even when errors occur (e.g., localStorage fails → in-memory mode)
2. **User-Facing Error Messages**: Never show technical stack traces to users; provide actionable guidance
3. **Fail-Safe Defaults**: Return safe defaults (empty arrays, fallback values) rather than crashing
4. **Observable Failures**: Log errors to console for debugging (production observability optional post-MVP)

---

## React Error Boundary

**Purpose**: Catch React component errors and display fallback UI instead of white screen of death.

### Implementation

```typescript
// /src/components/ErrorBoundary.tsx
import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so next render shows fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error for debugging
    console.error('React Error Boundary caught an error:', error, errorInfo);

    // Optional: Send to error tracking service (Sentry, LogRocket, etc.)
    // if (import.meta.env.PROD) {
    //   Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
    // }

    this.setState({ error, errorInfo });
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h1 className="mt-4 text-xl font-semibold text-gray-900 text-center">
              Something went wrong
            </h1>

            <p className="mt-2 text-sm text-gray-600 text-center">
              We're sorry for the inconvenience. The application encountered an unexpected error.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <details className="mt-4 p-3 bg-gray-100 rounded text-xs">
                <summary className="cursor-pointer font-medium text-gray-700">
                  Error Details (Development Only)
                </summary>
                <pre className="mt-2 whitespace-pre-wrap text-red-600">
                  {this.state.error.toString()}
                </pre>
                {this.state.errorInfo && (
                  <pre className="mt-2 whitespace-pre-wrap text-gray-600">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </details>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Usage

```typescript
// /src/main.tsx or /src/App.tsx
import { ErrorBoundary } from './components/ErrorBoundary';
import { HolidayProvider } from './context/HolidayContext';

function App() {
  return (
    <ErrorBoundary>
      <HolidayProvider>
        {/* Your app components */}
      </HolidayProvider>
    </ErrorBoundary>
  );
}

export default App;
```

### Testing

```typescript
// /src/components/ErrorBoundary.test.tsx
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

const ThrowError = () => {
  throw new Error('Test error');
};

describe('ErrorBoundary', () => {
  it('should render children when no error', () => {
    render(
      <ErrorBoundary>
        <div>Child content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('should render fallback UI when error occurs', () => {
    // Suppress console.error for this test
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reload Page/i })).toBeInTheDocument();

    consoleError.mockRestore();
  });
});
```

---

## Browser Compatibility Polyfills

### crypto.randomUUID() Polyfill

**Problem**: `crypto.randomUUID()` not available in Safari <15.4, Firefox <95, Chrome <92

**Solution**: Fallback to timestamp + random string for older browsers

```typescript
// /src/utils/generateId.ts

/**
 * Generate a unique ID using crypto.randomUUID() when available,
 * with fallback for older browsers
 */
export function generateId(): string {
  // Use native crypto.randomUUID() if available (modern browsers)
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  // Fallback for Safari <15.4, Firefox <95, Chrome <92
  // Uses timestamp + random string (sufficient for client-side uniqueness)
  const timestamp = Date.now().toString(36); // Base36 timestamp
  const randomPart = Math.random().toString(36).substring(2, 11); // 9 random chars
  const randomPart2 = Math.random().toString(36).substring(2, 11); // 9 more random chars

  return `${timestamp}-${randomPart}-${randomPart2}`;
}
```

### Usage

```typescript
// /src/context/HolidayContext.tsx
import { generateId } from '../utils/generateId';

export const HolidayProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const addHoliday = (name: string, date: string) => {
    const newHoliday: Holiday = {
      id: generateId(), // Use polyfilled version instead of crypto.randomUUID()
      name,
      date,
    };
    setHolidays((prev) => [...prev, newHoliday]);
  };

  // ... rest of implementation
};
```

### Testing

```typescript
// /src/utils/generateId.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateId } from './generateId';

describe('generateId', () => {
  let originalCrypto: Crypto;

  beforeEach(() => {
    originalCrypto = global.crypto;
  });

  afterEach(() => {
    global.crypto = originalCrypto;
  });

  it('should use crypto.randomUUID when available', () => {
    const mockUUID = '123e4567-e89b-12d3-a456-426614174000';
    const mockRandomUUID = vi.fn(() => mockUUID);

    global.crypto = {
      ...global.crypto,
      randomUUID: mockRandomUUID,
    };

    const id = generateId();

    expect(mockRandomUUID).toHaveBeenCalled();
    expect(id).toBe(mockUUID);
  });

  it('should fallback when crypto.randomUUID unavailable', () => {
    // Simulate older browser
    global.crypto = {
      ...global.crypto,
      randomUUID: undefined as any,
    };

    const id = generateId();

    // Should generate a string with timestamp-random-random format
    expect(id).toBeTruthy();
    expect(typeof id).toBe('string');
    expect(id.split('-').length).toBe(3);
  });

  it('should generate unique IDs', () => {
    const ids = new Set();
    for (let i = 0; i < 1000; i++) {
      ids.add(generateId());
    }

    // All IDs should be unique
    expect(ids.size).toBe(1000);
  });
});
```

---

## localStorage Error Handling

See [API Integration](./api-integration.md) for full implementation.

**Summary:**
- **QuotaExceededError**: Show user-friendly message, suggest clearing storage
- **SecurityError**: Detect private browsing mode, warn user data won't persist
- **Corrupted Data**: Silently recover with empty array, log warning
- **Graceful Degradation**: App continues to function with in-memory data if localStorage fails

---

## State Management Error Handling

### Context Provider Error Handling

Update `HolidayContext.tsx` to handle localStorage errors:

```typescript
// /src/context/HolidayContext.tsx (updated)
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import * as storage from '../services/localStorageService';

export interface Holiday {
  id: string;
  name: string;
  date: string;
}

interface HolidayContextType {
  holidays: Holiday[];
  addHoliday: (name: string, date: string) => void;
  deleteHoliday: (id: string) => void;
  storageError: string | null; // NEW: Surface storage errors to UI
  clearStorageError: () => void; // NEW: Dismiss error message
}

export const HolidayContext = createContext<HolidayContextType | undefined>(undefined);

export const HolidayProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [storageError, setStorageError] = useState<string | null>(null);

  // Load from localStorage on mount (FR4)
  useEffect(() => {
    const savedHolidays = storage.loadHolidays();
    setHolidays(savedHolidays);
  }, []);

  // Save to localStorage on change (FR3)
  useEffect(() => {
    const result = storage.saveHolidays(holidays);
    if (!result.success && result.error) {
      setStorageError(result.error); // Show error to user
    }
  }, [holidays]);

  const addHoliday = (name: string, date: string) => {
    const newHoliday: Holiday = {
      id: generateId(),
      name,
      date,
    };
    setHolidays((prev) => [...prev, newHoliday]);
  };

  const deleteHoliday = (id: string) => {
    setHolidays((prev) => prev.filter((h) => h.id !== id));
  };

  const clearStorageError = () => {
    setStorageError(null);
  };

  return (
    <HolidayContext.Provider
      value={{
        holidays,
        addHoliday,
        deleteHoliday,
        storageError,
        clearStorageError,
      }}
    >
      {children}
    </HolidayContext.Provider>
  );
};
```

### Display Error to User

```typescript
// /src/App.tsx (example)
import { useContext } from 'react';
import { HolidayContext } from './context/HolidayContext';

function App() {
  const context = useContext(HolidayContext);

  if (!context) {
    throw new Error('HolidayContext must be used within HolidayProvider');
  }

  const { storageError, clearStorageError } = context;

  return (
    <div>
      {/* Error banner */}
      {storageError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg
                className="h-5 w-5 text-red-500 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm text-red-700">{storageError}</p>
            </div>
            <button
              onClick={clearStorageError}
              className="text-red-500 hover:text-red-700"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Your app content */}
    </div>
  );
}
```

---

## Error Handling Checklist

Before releasing each story, verify:

- [ ] **React Error Boundary**: Wraps entire app, catches component errors
- [ ] **localStorage Error Handling**: QuotaExceededError, SecurityError, corrupted data handled
- [ ] **crypto.randomUUID Polyfill**: Fallback for older browsers implemented
- [ ] **User-Facing Error Messages**: No technical stack traces, actionable guidance provided
- [ ] **Graceful Degradation**: App continues to function (e.g., in-memory mode if localStorage fails)
- [ ] **Console Logging**: Errors logged for debugging (development + production)
- [ ] **Error Recovery**: Users can dismiss errors and continue using app
- [ ] **Testing Coverage**: Unit tests + E2E tests for error scenarios

---

## Testing Requirements

### Unit Tests

```typescript
// localStorage error handling
- saveHolidays handles QuotaExceededError
- saveHolidays handles SecurityError
- loadHolidays handles corrupted JSON
- loadHolidays handles invalid data structure

// crypto.randomUUID polyfill
- generateId uses crypto.randomUUID when available
- generateId falls back when unavailable
- generateId generates unique IDs

// React Error Boundary
- ErrorBoundary renders children when no error
- ErrorBoundary renders fallback UI on error
```

### E2E Tests

```typescript
// Playwright E2E tests
- Error boundary displays fallback UI when component crashes
- Storage error message displayed to user (if QuotaExceededError simulated)
- App continues to function in private browsing mode (in-memory only)
```

---

**Related Documents:**
- [API Integration](./api-integration.md) - localStorage service implementation
- [Testing Requirements](./testing-requirements.md) - Test coverage strategy
- [Component Standards](./component-standards.md) - Component architecture
