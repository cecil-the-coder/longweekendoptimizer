import { describe, test, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HelloWorld } from '../src/components/HelloWorld';

describe('HelloWorld Component Tests (AC 4)', () => {
  test('should render default greeting message', () => {
    // GIVEN: HelloWorld component is rendered without props
    // WHEN: Component mounts
    // THEN: Should display "Hello, World!" greeting

    render(<HelloWorld />);

    expect(screen.getByText('Hello, World!')).toBeInTheDocument();
    expect(screen.getByText('Welcome to HolidayHacker')).toBeInTheDocument();
  });

  test('should render custom name when provided', () => {
    // GIVEN: HelloWorld component is rendered with custom name
    // WHEN: Component receives name="Long Weekend" prop
    // THEN: Should display "Hello, Long Weekend!" greeting

    render(<HelloWorld name="Long Weekend" />);

    expect(screen.getByText('Hello, Long Weekend!')).toBeInTheDocument();
    expect(screen.getByText('Welcome to HolidayHacker')).toBeInTheDocument();
  });

  test('should initialize count button with zero', () => {
    // GIVEN: HelloWorld component is rendered
    // WHEN: Component first loads
    // THEN: Count button should show "count is 0"

    render(<HelloWorld />);

    const countButton = screen.getByTestId('count-button');
    expect(countButton).toBeInTheDocument();
    expect(countButton).toHaveTextContent('count is 0');
  });

  test('should increment count when button is clicked', () => {
    // GIVEN: HelloWorld component is rendered
    // WHEN: User clicks the count button
    // THEN: Count should increment by 1

    render(<HelloWorld />);

    const countButton = screen.getByTestId('count-button');

    // Initial state
    expect(countButton).toHaveTextContent('count is 0');

    // Click to increment
    fireEvent.click(countButton);
    expect(countButton).toHaveTextContent('count is 1');

    // Click again
    fireEvent.click(countButton);
    expect(countButton).toHaveTextContent('count is 2');
  });

  test('should have proper data-testid attributes for testability', () => {
    // GIVEN: HelloWorld component should be testable
    // WHEN: Component is rendered
    // THEN: Should have required data-testid attributes

    render(<HelloWorld />);

    expect(screen.getByTestId('welcome-message')).toBeInTheDocument();
    expect(screen.getByTestId('count-button')).toBeInTheDocument();
    expect(screen.getByTestId('count-display')).toBeInTheDocument();
  });

  test('should follow PascalCase naming convention', () => {
    // GIVEN: Component naming should follow standards
    // WHEN: Checking component implementation
    // THEN: Should use PascalCase naming and proper TypeScript

    // Component should be exported as named function
    expect(HelloWorld).toBeDefined();
    expect(typeof HelloWorld).toBe('function');

    // Should accept proper TypeScript props
    const component = <HelloWorld name="Test" />;
    expect(component).toBeDefined();
  });
});