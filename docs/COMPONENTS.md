# Component Documentation

This document provides detailed documentation for all React components implemented in Story 1.2 - Holiday Input UI.

## Table of Contents

1. [HolidayForm Component](#holidayform-component)
2. [HolidayListItem Component](#holidaylistitem-component)
3. [HolidayList Component](#holidaylist-component)
4. [HolidayContext Provider](#holidaycontext-provider)
5. [useHolidays Hook](#useholidays-hook)

## HolidayForm Component

**File**: `/src/components/HolidayForm.tsx`

### Description

The HolidayForm component provides a user interface for adding new holidays to the application. It includes comprehensive validation, error handling, and responsive design.

### Features

- **Input Fields**: Holiday name (text) and holiday date (date picker)
- **Validation**: Required fields, weekend prevention, duplicate detection
- **Error Handling**: Form validation errors and storage error feedback
- **Responsive Design**: Mobile-friendly with proper touch targets
- **Accessibility**: Proper labels, ARIA attributes, and keyboard navigation

### Props

This component does not accept props. It uses the `useHolidays` hook to access holiday state management.

### State Management

```typescript
const HolidayForm: React.FC = () => {
  const [holidayName, setHolidayName] = useState('');
  const [holidayDate, setHolidayDate] = useState('');
  const [validationError, setValidationError] = useState('');
  const [storageError, setStorageError] = useState('');
  // ...
};
```

### Validation Logic

#### Required Field Validation
```typescript
if (!holidayName.trim()) {
  setValidationError('Holiday name is required');
  return;
}

if (!holidayDate) {
  setValidationError('Holiday date is required');
  return;
}
```

#### Weekend Prevention
```typescript
const date = new Date(holidayDate);
const dayOfWeek = date.getDay();
if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday = 0, Saturday = 6
  setValidationError('Holidays cannot be scheduled on weekends (Saturday or Sunday)');
  return;
}
```

#### Duplicate Detection
```typescript
const duplicateExists = holidays.some(holiday => holiday.date === holidayDate);
if (duplicateExists) {
  setValidationError('A holiday already exists for this date');
  return;
}
```

### Error Display

#### Validation Errors
- **Styling**: Red background with red text
- **Classes**: `bg-red-100 border-red-400 text-red-700`
- **Duration**: Until input is corrected

#### Storage Errors
- **Styling**: Yellow background with yellow text
- **Classes**: `bg-yellow-100 border-yellow-400 text-yellow-700`
- **Duration**: Until successful operation or user action

### Responsive Design

```jsx
<div className="w-full max-w-md mx-auto p-4">
  {/* Form content */}
</div>
```

- **Mobile**: Full width with centered layout
- **Desktop**: Maximum width of 28rem with centering
- **Touch Targets**: Proper sizing for mobile interaction

### Accessibility Features

- **Label Association**: `htmlFor` and `id` attributes for form labels
- **Semantic HTML**: Proper form and input elements
- **Keyboard Navigation**: Native browser keyboard support
- **Screen Reader**: Descriptive labels and error messages

### CSS Classes Used

#### Container
- `w-full max-w-md mx-auto p-4` - Responsive container with padding

#### Form Layout
- `space-y-4` - Vertical spacing between form elements

#### Input Fields
- `w-full px-3 py-2` - Full width with padding
- `border border-gray-300` - Gray border styling
- `rounded-md` - Rounded corners
- `focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent` - Focus states

#### Labels
- `block text-sm font-medium text-gray-700 mb-2` - Label styling

#### Button
- `w-full bg-blue-600 text-white` - Full width blue button
- `hover:bg-blue-700 transition-colors duration-200` - Hover animation

## HolidayListItem Component

**File**: `/src/components/HolidayListItem.tsx`

### Description

The HolidayListItem component displays an individual holiday with formatted date and delete functionality. It handles storage errors and provides responsive design.

### Features

- **Formatted Display**: "Holiday Name - DayOfWeek, Mon DD, YYYY" format
- **Delete Functionality**: Confirmation dialog with storage error handling
- **Error Display**: Auto-clearing storage error messages
- **Responsive Design**: Mobile-friendly with hover effects
- **Accessibility**: Proper button semantics and confirmation dialog

### Props

```typescript
interface HolidayListItemProps {
  holiday: Holiday;  // Holiday object to display
}
```

### Holiday Interface

```typescript
interface Holiday {
  id: string;      // Unique identifier (UUID)
  name: string;    // Holiday name
  date: string;    // ISO date string (YYYY-MM-DD)
}
```

### Date Formatting

```typescript
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();
  const year = date.getFullYear();

  return `${holiday.name} - ${dayOfWeek}, ${month} ${day}, ${year}`;
};
```

**Example Output**: "Thanksgiving - Thursday, Nov 27, 2025"

### Delete Functionality

```typescript
const handleDelete = () => {
  if (window.confirm(`Are you sure you want to delete "${holiday.name}"?`)) {
    const error = deleteHoliday(holiday.id);
    if (error) {
      setStorageError(error.userMessage);
      setTimeout(() => setStorageError(''), 5000); // Auto-clear after 5 seconds
    }
  }
};
```

### Error Handling

- **Storage Errors**: Displayed as yellow warning below holiday item
- **Auto-clear**: Error messages disappear after 5 seconds
- **User Feedback**: Clear, actionable error messages

### Responsive Design

```jsx
<div className="flex items-center justify-between p-4 bg-gray-100">
  {/* Content */}
</div>
```

- **Layout**: Flexbox with space between holiday info and delete button
- **Hover**: `hover:bg-gray-50` for visual feedback
- **Mobile**: Optimized spacing and touch targets

### CSS Classes Used

#### Container
- `space-y-2` - Vertical spacing between error and content
- `flex items-center justify-between` - Flexbox layout
- `p-4` - Padding
- `bg-gray-100 border border-gray-300 rounded-lg` - Gray card styling
- `hover:bg-gray-50 transition-colors duration-200` - Hover effects

#### Error Message
- `bg-yellow-100 border-yellow-400 text-yellow-700` - Yellow warning styling
- `px-3 py-2 rounded text-sm` - Compact error message

#### Holiday Info
- `flex-1` - Takes remaining space
- `text-lg font-medium text-gray-900` - Holiday text styling

#### Delete Button
- `ml-4` - Left margin
- `px-3 py-1 text-sm` - Compact button size
- `text-white bg-red-600 hover:bg-red-700 rounded-md` - Red button styling

## HolidayList Component

**File**: `/src/components/HolidayList.tsx`

### Description

The HolidayList component displays a collection of holiday items and handles empty state scenarios.

### Features

- **List Rendering**: Maps over holidays array to render HolidayListItems
- **Empty State**: Friendly message when no holidays exist
- **Responsive Design**: Proper spacing and layout

### Props

This component does not accept props. It uses the `useHolidays` hook to access holiday data.

### Empty State Handling

```typescript
if (holidays.length === 0) {
  return (
    <div className="text-center py-8 text-gray-500">
      <p>Your Holidays</p>
      <p>No holidays added yet. Add your first holiday above!</p>
    </div>
  );
}
```

### List Rendering

```typescript
return (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold text-gray-800">Your Holidays</h2>
    {holidays.map(holiday => (
      <HolidayListItem key={holiday.id} holiday={holiday} />
    ))}
  </div>
);
```

### CSS Classes Used

#### Container
- `space-y-4` - Vertical spacing between list items

#### Heading
- `text-xl font-semibold text-gray-800` - List title styling

#### Empty State
- `text-center py-8 text-gray-500` - Centered empty state styling

## HolidayContext Provider

**File**: `/src/context/HolidayContext.tsx`

### Description

The HolidayProvider manages global holiday state and localStorage persistence.

### Features

- **State Management**: Centralized holiday data
- **Persistence**: Automatic localStorage sync
- **Error Handling**: Storage error logging
- **Performance**: Debounced saves and optimized re-renders

### Context Value

```typescript
interface HolidayContextType {
  holidays: Holiday[];
  addHoliday: (name: string, date: string) => StorageError | null;
  deleteHoliday: (id: string) => StorageError | null;
}
```

### useEffect Hooks

#### Load on Mount
```typescript
useEffect(() => {
  const savedHolidays = storage.loadHolidays();
  setHolidays(savedHolidays);
}, []);
```

#### Auto-save on Change
```typescript
useEffect(() => {
  const error = storage.saveHolidays(holidays);
  if (error) {
    console.error('Storage error on auto-save:', error);
  }
}, [holidays]);
```

### Error Handling Strategy

- **Load Errors**: Silent fallback to empty array
- **Save Errors**: Console logging for debugging
- **User Feedback**: Handled by components with user-friendly messages

## useHolidays Hook

**File**: `/src/hooks/useHolidays.ts`

### Description

The useHolidays hook provides a convenient interface for components to interact with holiday state management.

### Features

- **Type Safety**: Full TypeScript support
- **Error Handling**: Proper error type returns
- **Context Access**: Safe context consumption with error checking

### Hook Signature

```typescript
const useHolidays = (): HolidayContextType => {
  const context = useContext(HolidayContext);
  if (context === undefined) {
    throw new Error('useHolidays must be used within a HolidayProvider');
  }
  return context;
};
```

### Usage Example

```typescript
const MyComponent = () => {
  const { holidays, addHoliday, deleteHoliday } = useHolidays();

  const handleAdd = () => {
    const error = addHoliday('New Holiday', '2025-12-25');
    if (error) {
      console.error('Failed to add holiday:', error.userMessage);
    }
  };

  return (
    <div>
      {holidays.map(holiday => (
        <div key={holiday.id}>
          {holiday.name}
          <button onClick={() => deleteHoliday(holiday.id)}>
            Delete
          </button>
        </div>
      ))}
      <button onClick={handleAdd}>Add Holiday</button>
    </div>
  );
};
```

## Component Integration

### Data Flow

1. **HolidayForm** → `useHolidays.addHoliday()` → **HolidayContext** → **localStorage**
2. **HolidayListItem** → `useHolidays.deleteHoliday()` → **HolidayContext** → **localStorage**
3. **localStorage** → **HolidayContext** → **HolidayList** → **HolidayListItem**

### Error Propagation

1. **Storage Error** → **localStorageService** → **HolidayContext** → **Component**
2. **Component** displays user-friendly error message
3. **Auto-clear** mechanisms prevent error message buildup

### Performance Optimizations

- **Context Memoization**: Prevents unnecessary re-renders
- **Debounce Patterns**: Efficient localStorage saves
- **Conditional Rendering**: Optimized list rendering

## Testing Considerations

### Component Testing Strategy

- **Unit Tests**: Individual component behavior
- **Integration Tests**: Component interaction workflows
- **Accessibility Tests**: Screen reader and keyboard navigation
- **Responsive Tests**: Mobile and desktop layouts

### Common Test Scenarios

#### HolidayForm Tests
- Form validation (required fields, weekends, duplicates)
- Error message display and clearing
- Responsive design verification
- Accessibility compliance

#### HolidayListItem Tests
- Delete confirmation and execution
- Date formatting accuracy
- Error message handling
- Hover effects and responsive behavior

#### HolidayList Tests
- Empty state rendering
- List item rendering
- Holiday data integration

### Mock Strategies

```typescript
// Mock localStorage for testing
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock useHolidays hook
const mockAddHoliday = vi.fn();
const mockDeleteHoliday = vi.fn();
vi.mock('../hooks/useHolidays', () => ({
  useHolidays: () => ({
    holidays: mockHolidays,
    addHoliday: mockAddHoliday,
    deleteHoliday: mockDeleteHoliday,
  }),
}));
```

## Browser Compatibility

### Supported Features

- **localStorage**: All modern browsers
- **Date Input**: HTML5 date input support
- **CSS Grid/Flexbox**: Modern layout systems
- **ES6+ Features**: Compiled by Babel in Vite

### Fallbacks

- **Date Input**: Text input with validation fallback
- **localStorage**: Graceful error handling
- **CSS**: Progressive enhancement approach

This component documentation provides comprehensive guidance for developers working with the Holiday Input UI implementation in Story 1.2.