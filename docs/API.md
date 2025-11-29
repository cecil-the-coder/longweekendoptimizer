# API Documentation

This document provides detailed API documentation for the Long Weekend Optimizer application, focusing on the localStorage service, recommendation engine, and component interfaces implemented through Story 1.5.

## Table of Contents

1. [localStorage Service API](#localstorage-service-api)
2. [Recommendation Engine API](#recommendation-engine-api)
3. [Holiday Context API](#holiday-context-api)
4. [Component Props and Interfaces](#component-props-and-interfaces)
5. [Error Handling](#error-handling)
6. [Data Types](#data-types)

## localStorage Service API

The localStorage service (`/src/services/localStorageService.ts`) provides a robust interface for managing holiday data persistence with comprehensive error handling.

### Functions

#### `loadHolidays(): Holiday[]`

**Description**: Loads holidays from browser localStorage.

**Returns**: `Holiday[]` - Array of holiday objects. Returns empty array if:
- No data exists in localStorage
- Data is corrupted/invalid (non-array)
- Storage access fails

**Error Handling**:
- Errors are logged to console for debugging
- Returns empty array to prevent application crashes
- No user feedback shown (occurs on app initialization)

**Example Usage**:
```typescript
import { loadHolidays } from '../services/localStorageService';

const savedHolidays = loadHolidays();
console.log('Loaded holidays:', savedHolidays);
```

#### `saveHolidays(holidays: Holiday[]): StorageError | null`

**Description**: Saves holidays to browser localStorage.

**Parameters**:
- `holidays: Holiday[]` - Array of holiday objects to persist

**Returns**: `StorageError | null`
- `null` on success
- `StorageError` object on failure

**Error Categories**:
1. **QuotaExceededError**: Storage quota exceeded
2. **SecurityError**: Browser security restrictions
3. **GenericError**: Other storage-related errors

**Example Usage**:
```typescript
import { saveHolidays } from '../services/localStorageService';

const newHolidays = [
  { id: '1', name: 'Thanksgiving', date: '2025-11-27' }
];

const error = saveHolidays(newHolidays);
if (error) {
  console.error('Storage error:', error.userMessage);
  // Show error to user
}
```

## Recommendation Engine API

The recommendation engine (`/src/utils/dateLogic.ts`) provides intelligent 4-day weekend calculation based on holiday dates analysis.

### Functions

#### `calculateRecommendations(holidays: Holiday[]): Recommendation[]`

**Description**: Analyzes holiday dates and returns recommendations for optimal vacation days to create 4-day weekends.

**Parameters**:
- `holidays: Holiday[]` - Array of holiday objects to analyze

**Returns**: `Recommendation[]` - Array of recommendation objects sorted chronologically by holiday date

**Algorithm Logic**:
1. **Input Validation**: Validates holiday array and individual holiday objects
2. **Date Processing**: Extracts day of week for each holiday
3. **Tuesday Detection**: For Tuesday holidays, checks if Monday before is already a holiday
4. **Thursday Detection**: For Thursday holidays, checks if Friday after is already a holiday
5. **Recommendation Generation**: Creates recommendation objects for qualifying holidays
6. **Duplicate Prevention**: Uses Set-based O(1) lookup to avoid duplicate recommendations
7. **Sorting**: Returns recommendations sorted by holiday date

**Performance**:
- O(n) algorithm for recommendation processing
- O(n log n) for chronological sorting
- Processes 50+ holidays in under 10ms

**Edge Cases Handled**:
- Empty or null input arrays → returns empty array
- Invalid holiday objects → filtered out and ignored
- Malformed dates → validation with graceful error handling
- Holidays on Monday/Wednesday/Friday → no recommendations generated
- Monday already holiday when Tuesday → no recommendation generated
- Friday already holiday when Thursday → no recommendation generated

**Example Usage**:
```typescript
import { calculateRecommendations } from '../utils/dateLogic';

const holidays = [
  { id: '1', name: 'Thanksgiving', date: '2025-11-27' }, // Thursday
  { id: '2', name: 'Independence Day', date: '2025-07-04' } // Friday (no recommendation)
];

const recommendations = calculateRecommendations(holidays);
console.log(recommendations);
// Output: [
//   {
//     holidayName: "Thanksgiving",
//     holidayDate: "2025-11-27",
//     holidayDayOfWeek: "Thursday",
//     recommendedDate: "2025-11-28",
//     recommendedDay: "Friday",
//     explanation: "→ 4-day weekend"
//   }
// ]
```

## Holiday Context API

The Holiday Context (`/src/context/HolidayContext.tsx`) provides centralized state management for holiday data.

### Context Value Type

```typescript
interface HolidayContextType {
  holidays: Holiday[];                    // Current holiday array
  addHoliday: (name: string, date: string) => StorageError | null;
  deleteHoliday: (id: string) => StorageError | null;
}
```

### Functions

#### `addHoliday(name: string, date: string): StorageError | null`

**Description**: Adds a new holiday to the collection.

**Parameters**:
- `name: string` - Holiday name (trimmed)
- `date: string` - Holiday date (YYYY-MM-DD format)

**Returns**: `StorageError | null` - Error from localStorage save operation

**Side Effects**:
- Generates UUID for new holiday
- Updates React state automatically
- Triggers localStorage save
- Auto-saves on state change

#### `deleteHoliday(id: string): StorageError | null`

**Description**: Removes a holiday by ID.

**Parameters**:
- `id: string` - Unique identifier of holiday to remove

**Returns**: `StorageError | null` - Error from localStorage save operation

**Side Effects**:
- Filters holiday from state
- Updates React state automatically
- Triggers localStorage save
- Auto-saves on state change

## Component Props and Interfaces

### RecommendationCard Component Props

```typescript
interface RecommendationCardProps {
  recommendation: Recommendation;  // Recommendation data to display
}
```

**Features**:
- Displays individual recommendation with formatted dates and explanations
- Defensive programming with null/undefined check and error state
- ARIA accessibility attributes: `role="article"`, `aria-label`, `data-testid`
- Responsive design with Tailwind CSS classes
- Hover effects and visual indicators
- Icon indicator showing successful recommendation

**Date Formatting Functions**:
- `formatDate()`: Converts YYYY-MM-DD to "DayOfWeek, Mon DD, YYYY" format
- `formatRecommendedDate()`: Same formatting for recommended dates
- Graceful handling of invalid dates with "Invalid Date" fallback

**Example Usage**:
```typescript
<RecommendationCard
  recommendation={{
    holidayName: "Thanksgiving",
    holidayDate: "2025-11-27",
    holidayDayOfWeek: "Thursday",
    recommendedDate: "2025-11-28",
    recommendedDay: "Friday",
    explanation: "→ 4-day weekend"
  }}
/>
```

### RecommendationsSection Component Props

```typescript
interface RecommendationsSectionProps {
  // No direct props - uses HolidayContext for data
}
```

**Features**:
- Container component with automatic updates when holiday list changes
- Real-time integration with HolidayContext via `useHolidays()` hook
- Chronological sorting of recommendations by holiday date
- Empty state handling with user-friendly messages
- Summary display showing total opportunities found
- Loading states and error handling
- ARIA accessibility: `role="region"`, `aria-live="polite"`
- Performance optimization with useMemo for re-calculations

**Internal Workflow**:
1. Fetch holidays from HolidayContext
2. Calculate recommendations using `calculateRecommendations(holidays)`
3. Sort chronologically by holiday date
4. Map each recommendation to RecommendationCard component
5. Display empty state or recommendations with summary

**Performance Optimizations**:
- `useMemo` with `[holidays]` dependency prevents unnecessary recalculations
- Efficient O(n log n) sorting algorithm
- Error handling prevents crashes on invalid data

**Example Usage**:
```typescript
// In App.tsx alongside other components
<RecommendationsSection />
```

### HolidayForm Component Props

The HolidayForm component doesn't accept props (uses context directly).

**Internal State**:
```typescript
interface HolidayFormState {
  holidayName: string;       // Form input for holiday name
  holidayDate: string;       // Form input for holiday date
  validationError: string;   // Validation error message
  storageError: string;      // Storage error message
}
```

**Validation Rules**:
1. Required field validation
2. Weekend prevention (no Saturday/Sunday)
3. Duplicate date detection
4. Storage error handling

### HolidayListItem Component Props

```typescript
interface HolidayListItemProps {
  holiday: Holiday;  // Holiday object to display
}
```

**Internal State**:
```typescript
interface HolidayListItemState {
  storageError: string;  // Delete operation error message
}
```

**Features**:
- Formatted date display: "Holiday Name - DayOfWeek, Mon DD, YYYY"
- Delete confirmation dialog
- Auto-clearing error messages (5 seconds)

## Error Handling

### StorageError Interface

```typescript
interface StorageError {
  type: 'QUOTA_EXCEEDED' | 'SECURITY_ERROR' | 'GENERIC_ERROR';
  message: string;        // Technical debugging message
  userMessage: string;    // User-friendly display message
}
```

### Error Types and Messages

| Type | Technical Message | User Message | When Occurs |
|------|-------------------|--------------|-------------|
| QUOTA_EXCEEDED | Storage quota exceeded | "Storage is full. Please remove some holidays to free up space." | localStorage quota reached |
| SECURITY_ERROR | Storage access denied | "Unable to access storage. Please check your browser settings." | Browser security restrictions |
| GENERIC_ERROR | [Error-specific] | "Unable to save holidays. Please try again later." | Other storage errors |

### Error Display Patterns

#### Form Errors
- **Location**: Yellow warning banner in HolidayForm
- **Duration**: Until user action or successful save
- **Trigger**: Storage save failures during add operations

#### Delete Errors
- **Location**: Yellow warning below HolidayListItem
- **Duration**: 5 seconds (auto-clear)
- **Trigger**: Storage save failures during delete operations

#### Validation Errors
- **Location**: Red error banner in HolidayForm
- **Duration**: Until input corrected
- **Types**: Required fields, weekend dates, duplicate dates

## Data Types

### Holiday Interface

```typescript
interface Holiday {
  id: string;      // UUID v4 format (crypto.randomUUID())
  name: string;    // Holiday display name
  date: string;    // ISO date format (YYYY-MM-DD)
}
```

### Recommendation Interface

```typescript
interface Recommendation {
  holidayName: string;      // Original holiday name
  holidayDate: string;      // Holiday date (YYYY-MM-DD)
  holidayDayOfWeek: string; // "Tuesday" or "Thursday"
  recommendedDate: string;  // Date to take off (YYYY-MM-DD)
  recommendedDay: string;   // "Monday" or "Friday"
  explanation: string;      // "→ 4-day weekend"
}
```

### Example Holiday Object

```typescript
{
  id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  name: "Thanksgiving",
  date: "2025-11-27"
}
```

### Example Recommendation Object

```typescript
{
  holidayName: "Thanksgiving",
  holidayDate: "2025-11-27",
  holidayDayOfWeek: "Thursday",
  recommendedDate: "2025-11-28",
  recommendedDay: "Friday",
  explanation: "→ 4-day weekend"
}
```

## Storage Implementation Details

### Storage Key
- **Key**: `long-weekend-optimizer-holidays`
- **Format**: JSON string array of Holiday objects
- **Environment**: Can be configured via `VITE_HOLIDAY_STORAGE_KEY`

### Data Retrieval Flow

1. **App Init**: Load holidays from localStorage
2. **Validation**: Ensure retrieved data is array
3. **Fallback**: Return empty array on corruption/errors
4. **State Update**: Initialize React state with loaded data

### Data Persistence Flow

1. **State Change**: Add/delete holiday updates state
2. **Auto-Save**: useEffect triggers on state change
3. **Manual Save**: Immediate save on add/delete operations
4. **Error Handling**: Return storage errors to caller

### Error Recovery

- **Load Errors**: Graceful fallback to empty array
- **Save Errors**: Return error object for user feedback
- **Data Corruption**: Array validation prevents crashes
- **Quota Issues**: User guidance provided via error messages

## Usage Examples

### Complete Holiday Management Workflow

```typescript
import React from 'react';
import { useHolidays } from '../hooks/useHolidays';
import { StorageError } from '../services/localStorageService';

const HolidayManager: React.FC = () => {
  const { holidays, addHoliday, deleteHoliday } = useHolidays();

  const handleAddHoliday = async (name: string, date: string) => {
    const error = addHoliday(name, date);
    if (error) {
      switch (error.type) {
        case 'QUOTA_EXCEEDED':
          alert('Please remove some holidays to free up space.');
          break;
        case 'SECURITY_ERROR':
          alert('Please check your browser settings to enable storage.');
          break;
        default:
          alert('An error occurred while saving your holiday.');
      }
    }
  };

  const handleDeleteHoliday = (id: string) => {
    if (window.confirm('Are you sure you want to delete this holiday?')) {
      const error = deleteHoliday(id);
      if (error) {
        console.error('Delete failed:', error.userMessage);
      }
    }
  };

  return (
    <div>
      {/* Render holiday list with delete functionality */}
      {holidays.map(holiday => (
        <div key={holiday.id}>
          {holiday.name} - {holiday.date}
          <button onClick={() => handleDeleteHoliday(holiday.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};
```

## Testing Considerations

### localStorage Mocking

For testing environments, use `VITE_MOCK_STORAGE_FOR_TESTS=true` to enable mock storage implementation.

### Error Scenario Testing

The localStorage service includes comprehensive test coverage for:
- Quota exceeded scenarios
- Security error conditions
- Data corruption handling
- Large dataset performance
- Array validation edge cases

### Component Testing

Component tests should verify:
- Form validation behavior
- Error message display
- User interaction flows
- Responsive design behavior
- Storage error handling
- Recommendation card rendering and formatting
- Recommendations section auto-update behavior
- Chronological sorting functionality
- Empty state handling for recommendations