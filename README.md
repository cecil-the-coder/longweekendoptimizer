# HolidayHacker

A React TypeScript application that helps you hack your calendar to maximize time off by managing company holidays and finding optimal vacation opportunities.

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

### 🧠 Smart Recommendation Engine
- **4-Day Weekend Detection**: Automatically identifies optimal vacation days
  - Analyzes Tuesday holidays to recommend Monday off for 4-day weekends
  - Analyzes Thursday holidays to recommend Friday off for 4-day weekends
  - Intelligent duplicate avoidance (won't recommend days already in holiday list)
  - Comprehensive input validation and edge case handling
- **Structured Recommendations**: Returns detailed recommendation objects
  - Holiday name and date information
  - Recommended day off with explanation
  - Sorted by holiday date for organized planning
  - 100% test coverage with comprehensive edge case handling

### 🛡️ Comprehensive Error Handling & User Feedback

- **ErrorBoundary Component**: React error boundary with graceful fallback UI
  - Catches JavaScript errors in component tree and prevents app crashes
  - Recovery options: "Try Again" (with retry limit) and "Reload Page"
  - Development-mode error details display for debugging
  - Accessible ARIA labels and semantic HTML
  - Maximum retry attempts with automatic page reload fallback
- **Smart Notification System**: User feedback for all application events
  - Success notifications (green styling) - 3-second auto-dismiss
  - Error notifications (red styling) - 5-second auto-dismiss
  - Warning notifications (yellow styling) for storage issues
  - Info notifications (blue styling) for general guidance
  - Manual dismiss button with keyboard accessibility
  - Screen reader support with role="alert" and aria-live="polite"
- **LoadingSpinner Component**: Consistent loading indicators throughout app
  - Multiple sizes: small, medium, large, xlarge
  - Color variants: default, light, dark, success, warning, error
  - Customizable labels and show/hide label options
  - Accessible with ARIA live regions and semantic markup
  - Smooth CSS animations with proper performance optimization

### 📋 Enhanced Form Validation & Error States
- **Real-time Input Validation**: Immediate feedback on form fields
  - Holiday name validation: non-empty, reasonable length checks
  - Holiday date validation: valid date format, not in distant past
  - Weekend prevention: blocks Saturday/Sunday holiday dates
  - Duplicate prevention: one holiday per date with clear error messages
  - Field-specific error messages with actionable guidance
- **Enhanced Empty State Handling**: Helpful guidance for first-time users
  - Holiday list empty state with clear call-to-action guidance
  - Recommendations empty state with explanation of how to add holidays
  - Visually distinct empty state presentations with icons and helpful text
  - ARIA accessibility for screen readers with proper semantic markup

### 💾 Resilient Storage System with Error Recovery
- **Advanced Storage Error Handling**: Comprehensive error management
  - QuotaExceededError: User guidance when storage is full with clear actions
  - SecurityError: Private browsing mode detection and alternative explanations
  - CorruptionError: Automatic recovery from corrupted localStorage data
  - GenericError: Fallback handling for unexpected storage issues
- **Graceful Degradation Patterns**: App continues functioning in degraded mode
  - In-memory fallback when localStorage unavailable
  - Session-only data persistence with clear user notifications
  - Non-blocking error handling allows continued app usage
  - Recovery options: "Try Again" and "Clear All Data" for quota issues
- **Storage Quota Management**: Preventative quota monitoring
  - Storage usage estimation and quota tracking
  - Warning thresholds to prevent quota exceeded errors
  - Clear user guidance when storage limits are approached

### 💾 Local Storage Persistence
- **Automatic Data Persistence**: All holidays automatically saved to browser localStorage
- **Feature Detection**: Automatically detects localStorage availability with graceful degradation
- **Data Corruption Recovery**: Detects and recovers from corrupted storage data automatically
- **Storage Quota Management**: Monitors storage usage and provides quota warnings
- **Comprehensive Error Handling**: User-friendly error messages for all failure scenarios
- **Automatic Loading**: Loads saved holiday list on application startup
- **Success Feedback**: User confirmation when operations succeed
- **Storage Key**: `holidayhacker-holidays`

### 📱 Responsive Design
- Mobile-friendly interface with proper touch targets
- Adaptive layout for different screen sizes
- Cross-browser compatibility

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **State Management**: React Context (HolidayContext)
- **Error Handling**: React Error Boundaries, Custom Notification System
- **Styling**: Tailwind CSS with responsive design
- **Testing**: Vitest + React Testing Library
- **Build Tool**: Vite
- **Data Storage**: Browser localStorage with error recovery

## Project Structure

```
src/
├── components/           # React UI components
│   ├── HolidayForm.tsx         # Holiday input form with enhanced validation
│   ├── HolidayList.tsx         # List display with empty states & error handling
│   ├── HolidayListItem.tsx     # Individual holiday item with delete
│   ├── RecommendationCard.tsx  # Individual recommendation display
│   ├── RecommendationsSection.tsx # Recommendations with loading & errors
│   ├── ErrorBoundary.tsx       # React error boundary with recovery UI
│   ├── Notification.tsx        # User feedback notification system
│   ├── LoadingSpinner.tsx      # Accessible loading indicators
│   └── __tests__/              # Component tests (including error handling tests)
├── context/            # React Context for state management
│   └── HolidayContext.tsx   # Enhanced context with error states & loading
├── hooks/              # Custom React hooks
│   ├── useHolidays.ts      # Main holiday operations hook
│   └── useRecommendations.ts # Recommendations state management hook
├── services/           # Business logic services
│   ├── localStorageService.ts  # Storage service with comprehensive error handling
│   └── __tests__/            # Service tests
├── utils/              # Utility functions and business logic
│   ├── dateLogic.ts         # Recommendation engine for 4-day weekends
│   └── __tests__/           # Utility function tests
└── App.tsx             # Main application with error boundaries
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

### Recommendation Engine API

#### Core Function

**`calculateRecommendations(holidays: Holiday[]): Recommendation[]`**
Analyzes holiday dates and returns recommendations for optimal vacation days to create 4-day weekends:
- Processes Tuesday holidays to recommend Monday off
- Processes Thursday holidays to recommend Friday off
- Avoids recommending days already in the holiday list
- Returns sorted recommendations by holiday date
- Handles malformed dates and invalid input gracefully
- O(n) performance for processing large datasets (50+ holidays in <10ms)

#### Recommendation Interface
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

### Error Handling Components API

#### ErrorBoundary Component

**Props Interface**
```typescript
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  'data-testid'?: string;
}
```

**Features**
- Catches JavaScript errors in child component tree
- Provides recovery options: "Try Again" (with retry limit) and "Reload Page"
- Development-mode error details display for debugging
- Accessible ARIA labels and semantic HTML
- Maximum 3 retry attempts before automatic page reload
- Custom fallback UI support via props

**Error Recovery Behavior**
- **Try Again**: Resets error state and re-renders child components (max 3 attempts)
- **Reload Page**: Hard refreshes the page to reset application state
- **Development Details**: Shows error message and component stack in development mode

**Usage Example**
```typescript
<ErrorBoundary
  onError={(error, errorInfo) => {
    console.error('Caught error:', error, errorInfo);
  }}
  data-testid="app-error-boundary"
>
  <App />
</ErrorBoundary>
```

#### Notification Component

**Props Interface**
```typescript
interface NotificationProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  dismissible?: boolean;
  autoDismiss?: number | boolean;
  onDismiss?: () => void;
  className?: string;
  'data-testid'?: string;
}
```

**Features**
- Support for four notification types with distinct styling and icons
- Auto-dismiss functionality with configurable timing (default 5 seconds)
- Manual dismiss button with keyboard accessibility
- Screen reader support with `role="alert"` and `aria-live="polite"`
- Custom styling via className prop
- TypeScript interface with comprehensive prop options

**Notification Types**
- **Success**: Green styling with checkmark icon (3-second default dismiss)
- **Error**: Red styling with X icon (5-second default dismiss)
- **Warning**: Yellow styling with warning icon
- **Info**: Blue styling with info icon

**Usage Example**
```typescript
<Notification
  type="success"
  message="Holiday added successfully!"
  autoDismiss={3000}
  dismissible={true}
  onDismiss={() => console.log('Notification dismissed')}
  data-testid="success-notification"
/>
```

#### LoadingSpinner Component

**Props Interface**
```typescript
interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  variant?: 'default' | 'light' | 'dark' | 'success' | 'warning' | 'error';
  label?: string;
  showLabel?: boolean;
  className?: string;
  'aria-hidden'?: boolean;
  tabIndex?: number;
  'data-testid'?: string;
}
```

**Features**
- Multiple size variants: small (w-4), medium (w-8), large (w-12), xlarge (w-16)
- Color variants for different contexts: default, light, dark, success, warning, error
- Customizable labels with show/hide options
- Full accessibility support with ARIA live regions
- Semantic HTML with proper role="status" attributes
- Smooth CSS animations with optimized performance

**Size Options**
- **small**: 16x16px (w-4 h-4) - For inline loading indicators
- **medium**: 32x32px (w-8 h-8) - Default size for most use cases
- **large**: 48x48px (w-12 h-12) - For prominent loading states
- **xlarge**: 64x64px (w-16 h-16) - For full-page loading screens

**Usage Example**
```typescript
<LoadingSpinner
  size="large"
  variant="default"
  label="Calculating recommendations..."
  showLabel={true}
  data-testid="recommendations-loading"
/>
```

### Recommendation Display Components API

#### RecommendationCard Component

**Props Interface**
```typescript
interface RecommendationCardProps {
  recommendation: Recommendation;  // Recommendation data to display
}
```

**Features**
- Displays individual recommendation with formatted dates and explanations
- Defensive programming with null/undefined check and error state
- ARIA accessibility attributes: `role="article"`, `aria-label`, `data-testid`
- Responsive design with Tailwind CSS classes
- Hover effects and visual indicators
- Icon indicator showing successful recommendation

**Date Formatting Functions**
- `formatDate()`: Converts YYYY-MM-DD to "DayOfWeek, Mon DD, YYYY" format
- `formatRecommendedDate()`: Same formatting for recommended dates
- Graceful handling of invalid dates with "Invalid Date" fallback

**Usage Example**
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

#### RecommendationsSection Component

**Props Interface**
```typescript
interface RecommendationsSectionProps {
  // No direct props - uses HolidayContext for data
}
```

**Features**
- Container component with automatic updates when holiday list changes
- Real-time integration with HolidayContext via `useHolidays()` hook
- Chronological sorting of recommendations by holiday date
- Empty state handling with user-friendly messages
- Summary display showing total opportunities found
- Loading states and error handling
- ARIA accessibility: `role="region"`, `aria-live="polite"`
- Performance optimization with useMemo for re-calculations

**Internal Workflow**
1. Fetch holidays from HolidayContext
2. Calculate recommendations using `calculateRecommendations(holidays)`
3. Sort chronologically by holiday date
4. Map each recommendation to RecommendationCard component
5. Display empty state or recommendations with summary

**Performance Optimizations**
- `useMemo` with `[holidays]` dependency prevents unnecessary recalculations
- Efficient O(n log n) sorting algorithm
- Error handling prevents crashes on invalid data

**Usage Example**
```typescript
// In App.tsx alongside other components
<RecommendationsSection />
```

#### Algorithm Logic
1. **Input Validation**: Validates holiday array and individual holiday objects
2. **Date Processing**: Extracts day of week for each holiday
3. **Tuesday Detection**: For Tuesday holidays, checks if Monday before is already a holiday
4. **Thursday Detection**: For Thursday holidays, checks if Friday after is already a holiday
5. **Recommendation Generation**: Creates recommendation objects for qualifying holidays
6. **Duplicate Prevention**: Uses Set-based O(1) lookup to avoid duplicate recommendations
7. **Sorting**: Returns recommendations sorted by holiday date

#### Edge Cases Handled
- Empty or null input arrays → returns empty array
- Invalid holiday objects → filtered out and ignored
- Malformed dates → validation with graceful error handling
- Holidays on Monday/Wednesday/Friday → no recommendations generated
- Monday already holiday when Tuesday → no recommendation generated
- Friday already holiday when Thursday → no recommendation generated

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

### Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173) in your browser

### Deployment

The application is configured for automatic deployment to GitHub Pages via GitHub Actions.

#### Quick Setup

1. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Click **Settings** → **Pages**
   - Set **Source** to "GitHub Actions"

2. **Automatic Deployment**:
   - Push to `main` branch triggers automatic build and deployment
   - Application will be available at `https://holidayhacker.app/`

3. **Test Deployment**:
   ```bash
   npm run build
   npm run preview
   ```

#### Detailed Instructions

📖 **Complete deployment guide**: [docs/deployment.md](./docs/deployment.md)

#### Live Demo

Once deployed, the application is accessible at:
```
https://holidayhacker.app/
```

**Features in Production:**
- ✅ Automated GitHub Actions deployment
- ✅ Optimized static asset loading
- ✅ SPA routing with 404.html fallback
- ✅ Responsive design for all devices
- ✅ HTTPS hosting via GitHub Pages
- ✅ Error handling for production environment

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
