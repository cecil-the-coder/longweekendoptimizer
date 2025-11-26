# Project Structure

The project will follow a standard Vite + React + TS structure. All logic must be client-side.

```plaintext
/src
├── /components
│   ├── HolidayForm.tsx
│   ├── HolidayList.tsx
│   ├── HolidayListItem.tsx
│   └── RecommendationCard.tsx
├── /context
│   └── HolidayContext.tsx    # Manages the state of the holiday list
├── /hooks
│   └── useHolidays.ts        # Hook to interact with the context
├── /services
│   └── localStorageService.ts # Utility for saving/loading from local storage
├── /utils
│   └── dateLogic.ts          # Core logic for Story 1.4
├── App.tsx                   # Main app component
├── main.tsx                  # Root render
├── index.css                 # Tailwind global styles
└── tailwind.config.js        # Tailwind configuration
```
