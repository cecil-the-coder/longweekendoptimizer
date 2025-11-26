# Story 1.1: Project Setup

Status: drafted

## Story

As a developer,
I want a foundational project structure,
so that I can start building the core features with all dependencies and standards in place.

## Acceptance Criteria

1. The project is initialized as a Vite + React + TypeScript static web application [Source: docs/sprint-artifacts/tech-spec-epic-1.md#Story-1.1-Project-Setup]
2. ESLint is configured and functional with TypeScript and React rules [Source: docs/sprint-artifacts/tech-spec-epic-1.md#Story-1.1-Project-Setup]
3. Prettier is configured and integrates with ESLint [Source: docs/sprint-artifacts/tech-spec-epic-1.md#Story-1.1-Project-Setup]
4. A simple "Hello World" component renders on the main page [Source: docs/sprint-artifacts/tech-spec-epic-1.md#Story-1.1-Project-Setup]
5. Vitest is installed and configured with a basic passing test [Source: docs/sprint-artifacts/tech-spec-epic-1.md#Story-1.1-Project-Setup]

## Tasks / Subtasks

- [ ] Initialize Vite + React + TypeScript project (AC: 1)
  - [ ] Run `npm create vite@latest . -- --template react-ts` to create project structure
  - [ ] Install dependencies with `npm install`
  - [ ] Verify project builds successfully with `npm run build`
  - [ ] Start development server with `npm run dev` to confirm setup works
- [ ] Configure ESLint and Prettier for code quality (AC: 2, 3)
  - [ ] Install ESLint with TypeScript and React support dependencies
  - [ ] Create .eslintrc.json with TypeScript, React, and recommended rules
  - [ ] Install and configure Prettier with code formatting standards
  - [ ] Integrate Prettier with ESLint for consistent code style
  - [ ] Verify linting works with `npm run lint` command
- [ ] Create Hello World component (AC: 4)
  - [ ] Create basic React component with TypeScript props interface
  - [ ] Implement HelloWorld component following PascalCase naming [Source: docs/architecture/component-standards.md]
  - [ ] Add component to main App.tsx for rendering
  - [ ] Verify component renders on main page in development mode
- [ ] Set up testing framework (AC: 5)
  - [ ] Install Vitest and related testing dependencies
  - [ ] Configure vitest.config.ts with TypeScript and React support
  - [ ] Create basic passing test for HelloWorld component [Source: docs/architecture/testing-requirements.md]
  - [ ] Verify tests run successfully with `npm test` command

## Dev Notes

**Architecture Patterns and Constraints:**
- React 18 + TypeScript for type safety [Source: docs/architecture/project-structure.md]
- Vite for fast development and builds [Source: docs/architecture/template-and-framework-selection.md]
- Component-based structure following established patterns [Source: docs/architecture/component-standards.md]
- Client-side only architecture - no backend dependencies [Source: docs/sprint-artifacts/tech-spec-epic-1.md#System-Architecture-Alignment]
- Vitest for unit testing with 95%+ coverage target for business logic [Source: docs/architecture/testing-requirements.md]

**Source Tree Components to Touch:**
- Initialize root project structure with package.json and configuration files
- Create `/src/` directory structure following established patterns
- Set up configuration files for ESLint, Prettier, Vite, Vitest
- Create basic App.tsx and HelloWorld component

**Testing Standards Summary:**
- Vitest for unit testing framework [Source: docs/architecture/testing-requirements.md]
- Component testing with React Testing Library
- Basic passing test to verify setup functionality

### Project Structure Notes

**Alignment with unified project structure:**
- Follow `/src/components`, `/src/context`, `/src/services`, `/src/utils` organization [Source: docs/architecture/project-structure.md]
- Component naming convention: PascalCase (e.g., HolidayForm.tsx) [Source: docs/architecture/component-standards.md]
- Service/utility naming convention: camelCase (e.g., dateLogic.ts) [Source: docs/architecture/component-standards.md]

**Detected conflicts or variances:**
- No conflicts detected - standard React + TypeScript setup aligns with architecture [Source: docs/sprint-artifacts/tech-spec-epic-1.md#System-Architecture-Alignment]

### References

- [Source: docs/sprint-artifacts/tech-spec-epic-1.md#Acceptance-Criteria-Authoritative]
- [Source: docs/architecture/project-structure.md]
- [Source: docs/architecture/component-standards.md]
- [Source: docs/architecture/testing-requirements.md]
- [Source: docs/architecture/template-and-framework-selection.md]

### References

- [Source: docs/sprint-artifacts/tech-spec-epic-1.md#Acceptance-Criteria-Authoritative]
- [Source: docs/prd/epic-1-foundation-core-functionality.md#Story-1.1-Project-Setup]
- [Source: docs/architecture/project-structure.md]
- [Source: docs/architecture/component-standards.md]
- [Source: docs/architecture/testing-requirements.md]
- [Source: docs/architecture/template-and-framework-selection.md]
- [Source: docs/architecture/frontend-developer-standards.md]

---

## Change Log

**Story Created**: 2025-11-26
**Status**: drafted (workflow executed as requested) / updated: 2025-11-26
**Story ID**: 1.1
**Epic**: 1 - Foundation & Core Functionality

## Dev Agent Record

### Context Reference

- docs/sprint-artifacts/1-1-project-setup.context.xml

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Debug Log References

### Completion Notes List

### File List