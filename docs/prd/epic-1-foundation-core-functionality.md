# Epic 1: Foundation & Core Functionality

This epic covers the entire MVP. It will establish the project, allow users to input and manage their holidays, and provide the core value by recommending long weekends.

## Story 1.1: Project Setup

* **As a** developer,
* **I want** a foundational project structure,
* **so that** I can start building the core features with all dependencies and standards in place.
* **Acceptance Criteria:**
    1.  The project is initialized as a static web application (e.g., using Vite + React/Svelte).
    2.  A linter (ESLint) and formatter (Prettier) are configured and functional.
    3.  A simple "Hello World" or placeholder component is rendering on the main page.
    4.  A basic unit testing framework (e.g., Vitest) is installed and configured.

## Story 1.2: Holiday Input UI

* **As a** user,
* **I want** to add and see a list of my company's holidays,
* **so that** the app has the data it needs to find my long weekends.
* **Acceptance Criteria:**
    1.  I can see a simple form with a "Holiday Name" text input and a "Holiday Date" date picker.
    2.  When I click an "Add Holiday" button, the holiday is added to a list visible on the page.
    3.  The list of holidays is clearly visible and displays both the name and the formatted date (e.g., "Thanksgiving - Thursday, Nov 27, 2025").
    4.  I can click a "Delete" button next to any holiday in the list to remove it.
    5.  The UI is responsive and usable on mobile.

## Story 1.3: Local Storage Persistence

* **As a** user,
* **I want** the app to remember my holiday list,
* **so that** I don't have to re-enter it every time I open the app.
* **Acceptance Criteria:**
    1.  When I add a holiday, the updated list is saved to the browser's local storage.
    2.  When I delete a holiday, the updated list is saved to local storage.
    3.  When I reload the application, my saved holiday list is automatically loaded and displayed.
    4.  If no list is in local storage, the app loads with an empty state.

## Story 1.4: Core Recommendation Logic

* **As a** developer,
* **I want** a "recommendation engine" function,
* **so that** I can process the holiday list and identify all long-weekend opportunities.
* **Acceptance Criteria:**
    1.  A pure function (e.g., `calculateRecommendations(holidays)`) is created.
    2.  The function correctly identifies holidays that fall on a Tuesday.
    3.  The function correctly identifies holidays that fall on a Thursday.
    4.  The function's output is a structured list of recommendations (e.g., `{ holidayName: 'Thanksgiving', recommendation: 'Take Friday, Nov 28 off' }`).
    5.  The function correctly handles an empty list (returns no recommendations).
    6.  The function *does not* recommend a day off if that day is already in the holiday list (e.g., if "Day after Thanksgiving" is entered, it won't be recommended).
    7.  All logic is covered by unit tests.

## Story 1.5: Display Recommendations

* **As a** user,
* **I want** to see the long-weekend recommendations clearly,
* **so that** I can get the value I came for.
* **Acceptance Criteria:**
    1.  A dedicated "Recommendations" area is visible on the page.
    2.  This area updates automatically whenever the holiday list changes (add/delete).
    3.  If no opportunities are found, it displays a clear message (e.g., "No long-weekend opportunities found.").
    4.  If opportunities are found, they are displayed in a clear, readable list (e.g., "For **Thanksgiving** (Thursday, Nov 27), we recommend taking **Friday, Nov 28** off to make a 4-day weekend!").
