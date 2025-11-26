import { faker } from '@faker-js/faker';

// Factory for creating test component props
export type HelloWorldProps = {
  name?: string;
};

export const createHelloWorldProps = (overrides: Partial<HelloWorldProps> = {}): HelloWorldProps => ({
  name: faker.person.firstName(),
  ...overrides,
});

export const createHelloWorldPropsWithString = (name: string): HelloWorldProps => ({
  name,
});

// Specialized factories for edge cases
export const createEmptyNameProps = (): HelloWorldProps => ({
  name: '',
});

export const createLongNameProps = (): HelloWorldProps => ({
  name: faker.string.alpha({ length: 100 }),
});

export const createSpecialCharNameProps = (): HelloWorldProps => ({
  name: 'José!@#$%^&*()',
});

// Factory for creating test scenarios
export type ComponentTestScenario = {
  props: HelloWorldProps;
  expectedGreeting: string;
  description: string;
};

export const createTestScenarios = (): ComponentTestScenario[] => [
  {
    props: createHelloWorldPropsWithString('Alice'),
    expectedGreeting: 'Hello, Alice!',
    description: 'Simple greeting with name',
  },
  {
    props: createEmptyNameProps(),
    expectedGreeting: 'Hello, World!', // Expected fallback
    description: 'Empty name should fallback to World',
  },
  {
    props: createLongNameProps(),
    expectedGreeting: 'Hello, ', // Just check prefix
    description: 'Long name should be handled gracefully',
  },
  {
    props: createSpecialCharNameProps(),
    expectedGreeting: 'Hello, José!@#$%^&*()!',
    description: 'Special characters should be preserved',
  },
];