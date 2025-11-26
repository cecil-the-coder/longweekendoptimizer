import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HelloWorld } from '../src/components/HelloWorld';

describe('HelloWorld Component - Failing Tests', () => {

  test('should render with default greeting', () => {
    // GIVEN: HelloWorld component is mounted
    // WHEN: Rendering without any props
    render(<HelloWorld />);

    // THEN: Should display default greeting
    expect(screen.getByTestId('hello-world')).toBeInTheDocument();
    expect(screen.getByText('Hello, World!')).toBeInTheDocument();
  });

  test('should render with custom name prop', () => {
    // GIVEN: HelloWorld component is mounted with custom name
    const customName = 'Alice';

    // WHEN: Rendering with name prop
    render(<HelloWorld name={customName} />);

    // THEN: Should display custom greeting
    expect(screen.getByTestId('hello-world')).toBeInTheDocument();
    expect(screen.getByText(`Hello, ${customName}!`)).toBeInTheDocument();
  });

  test('should follow TypeScript prop interface', () => {
    // GIVEN: TypeScript prop interface is defined
    // WHEN: Component accepts string name prop
    const testProps = {
      name: 'Test User'
    };

    // THEN: Should not have TypeScript errors and render correctly
    expect(() => {
      render(<HelloWorld {...testProps} />);
    }).not.toThrow();

    expect(screen.getByTestId('hello-world')).toBeInTheDocument();
    expect(screen.getByText('Hello, Test User!')).toBeInTheDocument();
  });

  test('should have appropriate data-testid for testing', () => {
    // GIVEN: HelloWorld component is mounted
    // WHEN: Rendering the component
    render(<HelloWorld />);

    // THEN: Should have data-testid attribute for test selection
    const helloWorldElement = screen.getByTestId('hello-world');
    expect(helloWorldElement).toBeInTheDocument();
    expect(helloWorldElement.tagName).toBe('DIV'); // Should be a semantic HTML element
  });

  test('should handle empty name gracefully', () => {
    // GIVEN: HelloWorld component is mounted with empty name
    // WHEN: Rendering with empty string
    render(<HelloWorld name="" />);

    // THEN: Should handle gracefully (fallback to "World" or show empty greeting)
    const component = screen.getByTestId('hello-world');
    expect(component).toBeInTheDocument();

    // Should either show fallback or empty greeting - implementation dependent
    const greeting = component.textContent;
    expect(greeting).toContain('Hello');
    expect(greeting).toContain('!');
  });
});