# Frontend Developer Standards

These are the critical rules for the developer agent.

## Critical Coding Rules

1.  **NO API (Local Storage Only):** All data persistence *must* use the `localStorageService.ts` utility. Do not attempt to `fetch` or use `axios`.
2.  **Date Logic Isolation:** All logic for calculating recommendations (Story 1.4) *must* be implemented in `src/utils/dateLogic.ts` and be a pure function.
3.  **State Management:** All application state (the holiday list) *must* be managed via the `HolidayContext`. Do not use local component state for the main list.
4.  **Styling:** Use *only* Tailwind utility classes for styling. Do not write custom CSS files.
5.  **Dependencies:** Do not install any new `npm` packages without approval.

## Quick Reference

  * **Run Development:** `npm run dev`
  * **Run Tests:** `npm run test`
  * **Build Project:** `npm run build`