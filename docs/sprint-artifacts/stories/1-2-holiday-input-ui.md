# Story 1.2: Holiday Input UI

Status: drafted

## Story

As a user,
I want to add holidays to a list through an intuitive form interface,
so that I can build my holiday list to receive long weekend recommendations.

## Acceptance Criteria

1. A form contains a "Holiday Name" text input and "Holiday Date" date picker [Source: docs/sprint-artifacts/tech-spec-epic-1.md#Story-1.2-Holiday-Input-UI]
2. Clicking "Add Holiday" button validates input and adds holiday to the list [Source: docs/sprint-artifacts/tech-spec-epic-1.md#Story-1.2-Holiday-Input-UI]
3. The holiday list displays both name and formatted date (e.g., "Thanksgiving - Thursday, Nov 27, 2025") [Source: docs/sprint-artifacts/tech-spec-epic-1.md#Story-1.2-Holiday-Input-UI]
4. Each holiday list item has a "Delete" button that removes the holiday [Source: docs/sprint-artifacts/tech-spec-epic-1.md#Story-1.2-Holiday-Input-UI]
5. The UI is responsive and usable on mobile devices (minimum 44px touch targets) [Source: docs/sprint-artifacts/tech-spec-epic-1.md#Story-1.2-Holiday-Input-UI]
6. Form validation prevents adding weekend dates with clear error messages [Source: docs/sprint-artifacts/tech-spec-epic-1.md#Story-1.2-Holiday-Input-UI]
7. Form validation prevents adding duplicate dates with clear error messages [Source: docs/sprint-artifacts/tech-spec-epic-1.md#Story-1.2-Holiday-Input-UI]

## Tasks / Subtasks

- [ ] Create HolidayForm component with name and date inputs (AC: 1)
  - [ ] Implement HolidayForm.tsx using functional component pattern with TypeScript [Source: docs/architecture/component-standards.md]
  - [ ] Add "Holiday Name" text input field with placeholder and label
  - [ ] Add "Holiday Date" date picker component with proper date type
  - [ ] Implement "Add Holiday" button with submit handler
  - [ ] Style form with responsive design patterns following shadcn/ui standards
- [ ] Implement form validation and holiday addition logic (AC: 2, 6, 7)
  - [ ] Create validation functions for weekend date detection
  - [ ] Create validation functions for duplicate holiday detection
  - [ ] Implement error state management with clear user messages
  - [ ] Add input validation on form submission with user feedback
  - [ ] Test validation edge cases (empty inputs, invalid dates, duplicates)
- [ ] Create HolidayList and HolidayListItem components (AC: 3, 4)
  - [ ] Implement HolidayList.tsx for displaying holiday array
  - [ ] Implement HolidayListItem.tsx for individual holiday display
  - [ ] Format holiday dates for display (e.g., "Thanksgiving - Thursday, Nov 27, 2025")
  - [ ] Add "Delete" button to each HolidayListItem with confirmation
  - [ ] Style list items with proper spacing and typography
- [ ] Implement responsive design and mobile optimization (AC: 5)
  - [ ] Ensure minimum 44px touch targets for mobile usability
  - [ ] Add responsive breakpoints for mobile, tablet, and desktop views
  - [ ] Test interface on mobile device sizes and touch interactions
  - [ ] Optimize form layout for mobile screens with proper input sizing
- [ ] Create comprehensive component tests (AC: 1-7)
  - [ ] Write unit tests for HolidayForm component using React Testing Library
  - [ ] Write unit tests for HolidayList and HolidayListItem components
  - [ ] Test form validation scenarios (weekend dates, duplicates, empty inputs)
  - [ ] Test holiday addition and deletion workflows
  - [ ] Verify responsive design behavior at different screen sizes

## Dev Notes

**Architecture Patterns and Constraints:**
- React 18 + TypeScript functional components with strict prop typing [Source: docs/architecture/component-standards.md]
- Component-based structure following established patterns in `/src/components` directory [Source: docs/architecture/project-structure.md]
- State management through React Context (HolidayContext) for centralized holiday list [Source: docs/sprint-artifacts/tech-spec-epic-1.md#Services-and-Modules]
- Client-side form validation with user-friendly error messaging
- Mobile-first responsive design with minimum 44px touch targets [Source: docs/sprint-artifacts/tech-spec-epic-1.md#Story-1.2-Holiday-Input-UI]

**Source Tree Components to Touch:**
- `/src/components/HolidayForm.tsx` - Form component with validation
- `/src/components/HolidayList.tsx` - List display component
- `/src/components/HolidayListItem.tsx` - Individual holiday item with delete
- `/src/context/HolidayContext.tsx` - Update context interface if needed
- `/src/hooks/useHolidays.ts` - Hook for interacting with holiday context

**Testing Standards Summary:**
- Vitest + React Testing Library for component testing [Source: docs/architecture/testing-requirements.md]
- Component interaction testing with user event simulation
- Form validation testing with error scenarios
- Responsive design testing at different viewport sizes
- Access to date formatting utilities for proper date display

### Project Structure Notes

**Alignment with unified project structure:**
- Follow `/src/components` organization for all UI components [Source: docs/architecture/project-structure.md]
- Component naming convention: PascalCase (e.g., HolidayForm.tsx) [Source: docs/architecture/component-standards.md]
- Props interfaces use TypeScript for strict typing and better developer experience
- Form components follow established patterns for user input handling

**Detected conflicts or variances:**
- No conflicts detected - form components align with established React + TypeScript patterns [Source: docs/sprint-artifacts/tech-spec-epic-1.md#System-Architecture-Alignment]
- Date handling will use browser native Date API as specified in technical requirements

### Learnings from Previous Story

**From Story 1-1-project-setup (Status: ready-for-dev)**

- **Project Structure**: Vite + React + TypeScript foundation established, use existing `/src/components` structure
- **Development Tools**: ESLint and Prettier configured for code quality, maintain consistent formatting
- **Testing Framework**: Vitest is installed and configured - use patterns established in initial setup
- **Component Patterns**: Basic HelloWorld component established as reference for TypeScript functional components

[Source: stories/1-1-project-setup.md#Dev-Agent-Record]

### References

- [Source: docs/sprint-artifacts/tech-spec-epic-1.md#Acceptance-Criteria-Authoritative]
- [Source: docs/sprint-artifacts/tech-spec-epic-1.md#Story-1.2-Holiday-Input-UI]
- [Source: docs/sprint-artifacts/tech-spec-epic-1.md#Services-and-Modules]
- [Source: docs/architecture/project-structure.md]
- [Source: docs/architecture/component-standards.md]
- [Source: docs/architecture/testing-requirements.md]

---

## Change Log

**Story Created**: 2025-11-26
**Status**: drafted (workflow executed as requested)
**Story ID**: 1.2
**Epic**: 1 - Foundation & Core Functionality

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List