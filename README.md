# Long Weekend Optimizer

A React TypeScript application that helps users plan long weekends by managing company holidays and finding optimal break opportunities.

## Features

### 🎉 Holiday Management
- **Holiday Input Form**: Add company holidays with comprehensive validation
  - Holiday name and date picker inputs
  - Weekend prevention (no holidays on Saturdays/Sundays)
  - Duplicate date detection (one holiday per date)
  - Form validation with clear error messages
- **Holiday List**: View all added holidays in a formatted display
  - Shows "Holiday Name - DayOfWeek, Mon DD, YYYY" format
  - Delete functionality with confirmation dialog
  - Individual holiday removal with error handling

### 💾 Local Storage Persistence
- **Automatic Data Persistence**: All holidays automatically saved to browser localStorage
- **Feature Detection**: Automatically detects localStorage availability with graceful degradation
- **Data Corruption Recovery**: Detects and recovers from corrupted storage data automatically
- **Storage Quota Management**: Monitors storage usage and provides quota warnings
- **Comprehensive Error Handling**: User-friendly error messages for all failure scenarios
- **Automatic Loading**: Loads saved holiday list on application startup
- **Success Feedback**: User confirmation when operations succeed
- **Storage Key**: `long-weekend-optimizer-holidays`

### 📱 Responsive Design
- Mobile-friendly interface with proper touch targets
- Adaptive layout for different screen sizes
- Cross-browser compatibility

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **State Management**: React Context (HolidayContext)
- **Styling**: Tailwind CSS
- **Testing**: Vitest + React Testing Library
- **Build Tool**: Vite
- **Data Storage**: Browser localStorage

## Project Structure

```
src/
├── components/           # React UI components
│   ├── HolidayForm.tsx      # Holiday input form with validation
│   ├── HolidayList.tsx      # List display container
│   ├── HolidayListItem.tsx  # Individual holiday item with delete
│   └── __tests__/           # Component tests
├── context/            # React Context for state management
│   └── HolidayContext.tsx   # Holiday data context
├── hooks/              # Custom React hooks
│   └── useHolidays.ts      # Hook for holiday operations
├── services/           # Business logic services
│   ├── localStorageService.ts  # Storage service with error handling
│   └── __tests__/            # Service tests
└── App.tsx             # Main application component
```

## API Documentation

### localStorage Service API

#### Core Storage Functions

**`loadHolidays(): { holidays: Holiday[]; error: StorageError | null; hadCorruption: boolean }`**
Loads holidays from browser localStorage with advanced error handling:
- Returns empty array if no data exists or localStorage is unavailable
- Automatically detects and recovers from corrupted data
- Returns error information and corruption status for user feedback
- Gracefully handles localStorage unavailability

**`saveHolidays(holidays: Holiday[]): StorageError | null`
Saves holidays to localStorage with comprehensive validation:
- Validates holiday data structure before saving
- Monitors storage quota and provides warnings
- Returns null on success or detailed error information
- Handles all storage exceptions gracefully

**`isLocalStorageAvailable(): boolean`**
Feature detection function to check localStorage availability:
- Tests actual localStorage functionality
- Returns false for private browsing mode or disabled storage
- Enables graceful degradation when unavailable

**`getStorageQuotaInfo(): { used: number; available?: number; total?: number }`**
Provides storage usage estimation:
- Calculates current localStorage usage
- Estimates available space and total quota
- Helps prevent quota exceeded errors

#### StorageError Interface
```typescript
interface StorageError {
  type: 'QUOTA_EXCEEDED' | 'SECURITY_ERROR' | 'GENERIC_ERROR' | 'CORRUPTION_ERROR';
  message: string;        // Technical error message
  userMessage: string;    // User-friendly display message
}
```

#### Error Types and User Messages
- **QUOTA_EXCEEDED**: "Storage is full. Please clear some browser data or remove holidays to free up space."
- **SECURITY_ERROR**: "Unable to access storage. Your browser may be in private mode or storage is disabled."
- **CORRUPTION_ERROR**: "Saved holiday data was corrupted. Starting with an empty list."
- **GENERIC_ERROR**: "Unable to save holidays. Please try again later."

### Holiday Data Structure

```typescript
interface Holiday {
  id: string;      // Unique identifier (UUID)
  name: string;    // Holiday name
  date: string;    // ISO date string (YYYY-MM-DD)
}
```

## Form Validation Rules

### Input Validation
- **Holiday Name**: Required, non-empty string (trimmed)
- **Holiday Date**: Required, valid date

### Business Logic Validation
1. **Weekend Prevention**: Holidays cannot be scheduled on Saturday or Sunday
   - Error: "Holidays cannot be scheduled on weekends (Saturday or Sunday)"
2. **Duplicate Prevention**: Cannot have multiple holidays on the same date
   - Error: "A holiday already exists for this date"

## Error Handling

### Storage Errors
Storage errors are handled gracefully with comprehensive user feedback:

**Success Messages:**
- Green highlighted messages with 3-second auto-clear
- Confirms successful save operations for add/delete actions
- Uses accessible `role="alert"` and `aria-live="polite"` attributes

**Error Messages:**
- Red highlighted messages with 5-second auto-clear
- Differentiated error types with specific user guidance:
  - **QUOTA_EXCEEDED**: "Storage is full. Please clear some browser data or remove holidays to free up space."
  - **SECURITY_ERROR**: "Unable to access storage. Your browser may be in private mode or storage is disabled."
  - **CORRUPTION_ERROR**: "Saved holiday data was corrupted. Starting with an empty list."
  - **GENERIC_ERROR**: "Unable to save holidays. Please try again later."

**Storage Unavailability:**
- Persistent informational notice when localStorage is disabled
- Non-blocking error handling allows continued app use with in-memory state
- Graceful degradation when in private browsing mode

**Error Recovery:**
- Automatic cleanup of corrupted data
- Re-initialization to empty state on severe corruption
- Detailed console logging for debugging (development mode)

### Form Validation Errors
- Displayed as red error messages in the form
- Cleared on successful submission or input changes
- Real-time validation feedback
- Accessibility-compliant error announcement

### Error Propagation Flow
Storage errors follow a hierarchical flow:
1. **localStorageService** detects and categorizes errors
2. **HolidayContext** manages state and timing of error messages
3. **Components** display user-friendly feedback with auto-clear
4. **Console logging** provides debugging information for developers

## Development

### Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

### Testing
The application includes comprehensive test coverage:
- **Component Tests**: React Testing Library tests for UI components
- **Service Tests**: localStorage service functionality and error scenarios
- **Integration Tests**: User workflow validation
- **Responsive Design Tests**: Mobile compatibility verification

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173) in your browser

## Persistence Architecture

### Data Flow
1. **Application Startup**: Automatically loads saved holidays from localStorage
2. **User Actions**: Add/delete operations immediately update UI state
3. **Background Persistence**: Changes are saved to localStorage with user feedback
4. **Error Handling**: Graceful degradation when storage unavailable

### Browser Compatibility

**localStorage Feature Detection:**
- Automatic detection of localStorage availability
- Graceful degradation in private browsing mode
- Fallback to in-memory state when storage disabled

**Modern Browser Features:**
- localStorage for data persistence (with feature detection)
- HTML5 date input
- ES2020+ features (with Vite polyfills as needed)
- crypto.randomUUID with fallback for older browsers

**Compatibility Notes:**
- Works in all modern browsers with localStorage support
- Handles private browsing mode gracefully
- Degrades gracefully when storage features are unavailable

### Data Privacy & Security

**Local Storage Only:**
- All data is stored locally in the user's browser
- No data is sent to external servers
- localStorage data persists until user clears browser data

**Security Considerations:**
- Input validation prevents XSS attacks
- Data corruption detection prevents malicious data issues
- Secure error handling prevents information disclosure
- Feature detection prevents errors in restricted environments

### Storage Management

**Quota Management:**
- Monitors localStorage usage to prevent quota exceeded errors
- Provides user guidance when storage is full
- Warns when approaching storage limits (80% threshold)

**Data Integrity:**
- Validates holiday object structure before saving
- Detects and recovers from corrupted data automatically
- Maintains clean storage by removing invalid entries

**Backup and Recovery:**
- Automatic corruption recovery with empty state fallback
- User notification when data corruption is detected
- Clear error messages guide users to understand issues

## License

Initial commit
