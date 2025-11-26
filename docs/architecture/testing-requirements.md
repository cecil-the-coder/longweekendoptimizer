# Testing Requirements

## Component Test Template

We will use **Vitest** and **React Testing Library** for all unit tests. [cite\_start]The primary focus is testing the core logic in `dateLogic.ts` (Story 1.4)[cite: 1, 538].

```typescript
// /src/utils/dateLogic.test.ts
import { describe, it, expect } from 'vitest';
import { calculateRecommendations } from './dateLogic';
import { Holiday } from '../context/HolidayContext';

describe('calculateRecommendations', () => {
  it('should recommend Friday for a Thursday holiday', () => {
    const holidays: Holiday[] = [
      { id: '1', name: 'Thanksgiving', date: '2025-11-27' } // This is a Thursday
    ];
    const recs = calculateRecommendations(holidays);
    expect(recs.length).toBe(1);
    expect(recs[0].recommendation).toContain('Friday, Nov 28');
  });

  it('should recommend Monday for a Tuesday holiday', () => {
    const holidays: Holiday[] = [
      { id: '1', name: 'Holiday', date: '2025-12-02' } // This is a Tuesday
    ];
    const recs = calculateRecommendations(holidays);
    expect(recs.length).toBe(1);
    expect(recs[0].recommendation).toContain('Monday, Dec 1');
  });

  it('should return no recommendations for a Wednesday holiday', () => {
    const holidays: Holiday[] = [
      { id: '1', name: 'Holiday', date: '2025-12-03' } // This is a Wednesday
    ];
    const recs = calculateRecommendations(holidays);
    expect(recs.length).toBe(0);
  });
});
```

## Testing Best Practices

  * **Unit Tests**: Test all utility functions (`dateLogic.ts`, `localStorageService.ts`) in isolation.
  * **Coverage Goals**: Aim for 100% coverage on `dateLogic.ts`.
  * **Test Structure**: Arrange-Act-Assert.
