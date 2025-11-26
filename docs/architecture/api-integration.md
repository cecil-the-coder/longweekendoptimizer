# API Integration

There is **no external API**. All "API" integration is handled by the `localStorageService.ts`.

## Service Template (Local Storage)

This service abstracts the local storage logic with robust error handling for production reliability.

```typescript
// /src/services/localStorageService.ts
import { Holiday } from '../context/HolidayContext';

const STORAGE_KEY = 'longWeekendApp:holidays';

/**
 * Error types that can occur during localStorage operations
 */
export class StorageError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'StorageError';
  }
}

/**
 * Save holidays to localStorage with robust error handling
 * Handles QuotaExceededError, SecurityError, and other storage failures
 */
export const saveHolidays = (holidays: Holiday[]): { success: boolean; error?: string } => {
  try {
    const data = JSON.stringify(holidays);
    localStorage.setItem(STORAGE_KEY, data);
    return { success: true };
  } catch (error) {
    // Handle specific localStorage errors
    if (error instanceof DOMException) {
      if (error.name === 'QuotaExceededError') {
        console.error('localStorage quota exceeded:', error);
        return {
          success: false,
          error: 'Storage limit reached. Please delete some holidays or clear browser storage.',
        };
      } else if (error.name === 'SecurityError') {
        console.error('localStorage access denied (private browsing?):', error);
        return {
          success: false,
          error: 'Cannot save data in private browsing mode. Your holidays will be lost when you close this tab.',
        };
      }
    }

    // Generic error fallback
    console.error('Failed to save holidays to localStorage:', error);
    return {
      success: false,
      error: 'Failed to save holidays. Please try again.',
    };
  }
};

/**
 * Load holidays from localStorage with graceful degradation
 * Returns empty array on any error (corrupted data, SecurityError, etc.)
 */
export const loadHolidays = (): Holiday[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    const parsed = JSON.parse(data);

    // Validate structure
    if (!Array.isArray(parsed)) {
      console.warn('localStorage data is not an array, resetting to empty');
      return [];
    }

    // Validate each holiday has required fields
    const validated = parsed.filter((holiday: any) => {
      return (
        typeof holiday === 'object' &&
        typeof holiday.id === 'string' &&
        typeof holiday.name === 'string' &&
        typeof holiday.date === 'string'
      );
    });

    if (validated.length !== parsed.length) {
      console.warn(
        `Filtered ${parsed.length - validated.length} invalid holidays from localStorage`
      );
    }

    return validated as Holiday[];
  } catch (error) {
    // Handle SecurityError (private browsing), JSON parse errors, etc.
    if (error instanceof DOMException && error.name === 'SecurityError') {
      console.warn('localStorage access denied (private browsing mode)');
    } else if (error instanceof SyntaxError) {
      console.error('Corrupted localStorage data, resetting to empty:', error);
    } else {
      console.error('Failed to load holidays from localStorage:', error);
    }

    // Graceful degradation: return empty array
    return [];
  }
};

/**
 * Clear all holidays from localStorage
 * Used for testing or user-initiated reset
 */
export const clearHolidays = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear holidays from localStorage:', error);
  }
};
```

## Error Handling Strategy

**QuotaExceededError:**
- User sees: "Storage limit reached. Please delete some holidays or clear browser storage."
- Mitigation: Unlikely for small holiday lists, but handled gracefully

**SecurityError (Private Browsing):**
- User sees: "Cannot save data in private browsing mode. Your holidays will be lost when you close this tab."
- Mitigation: App still functions, data is in-memory only

**Corrupted Data:**
- User sees: Silent recovery (empty array returned, console warning logged)
- Mitigation: Graceful degradation, doesn't crash app

**Testing Requirements:**
- Unit test: QuotaExceededError handling
- Unit test: SecurityError handling
- Unit test: Corrupted JSON parsing
- Unit test: Invalid data structure validation
- E2E test: Error message displayed to user (if error occurs)
