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
- **Comprehensive Error Handling**: User-friendly error messages for:
  - Storage quota exceeded ("Storage is full. Please remove some holidays to free up space.")
  - Security access denied ("Unable to access storage. Please check your browser settings.")
  - Generic errors ("Unable to save holidays. Please try again later.")
- **Data Validation**: Prevents crashes from corrupted storage data
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

#### `loadHolidays(): Holiday[]`
Loads holidays from browser localStorage. Returns empty array if no data exists or if there's an error.

#### `saveHolidays(holidays: Holiday[]): StorageError | null`
Saves holidays to localStorage. Returns `null` on success or `StorageError` object on failure.

#### StorageError Interface
```typescript
interface StorageError {
  type: 'QUOTA_EXCEEDED' | 'SECURITY_ERROR' | 'GENERIC_ERROR';
  message: string;        // Technical message
  userMessage: string;    // User-friendly display message
}
```

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
Storage errors are handled gracefully with user feedback:
- **Form Errors**: Displayed as yellow warning messages in the form
- **Delete Errors**: Displayed as yellow warning messages below holiday items (auto-clear after 5 seconds)
- **Console Logging**: All errors logged for debugging

### Form Validation Errors
- Displayed as red error messages in the form
- Cleared on successful submission or input changes

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

## Browser Support

This application uses modern browser features:
- localStorage for data persistence
- HTML5 date input
- ES2020+ features (with Vite polyfills as needed)

## Data Privacy

- All data is stored locally in the user's browser
- No data is sent to external servers
- localStorage data persists until user clears browser data

## License

Initial commit
