# Component Standards

## Component Template

All components should be React functional components using TypeScript.

```typescript
import React from 'react';

type MyComponentProps = {
  title: string;
};

const MyComponent: React.FC<MyComponentProps> = ({ title }) => {
  return (
    <div>
      <h2>{title}</h2>
    </div>
  );
};

export default MyComponent;
```

## Naming Conventions

  * **Components:** `PascalCase` (e.g., `HolidayForm.tsx`)
  * **Hooks:** `useCamelCase` (e.g., `useHolidays.ts`)
  * **Utilities/Services:** `camelCase` (e.g., `dateLogic.ts`)
