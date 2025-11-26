/**
 * Unit Test: Date Calculation Logic (FR5-FR8)
 *
 * Tests the core recommendation engine
 * TARGET: 100% coverage (architecture requirement)
 *
 * Test ID: 1.4-UNIT-001
 * Priority: P0 (Business logic critical)
 * Story: 1.4 - Core Recommendation Logic
 */

import { describe, it, expect } from 'vitest';
import { calculateRecommendations } from '../../src/utils/dateLogic';
import type { Holiday } from '../../src/context/HolidayContext';
import {
  createThursdayHoliday,
  createTuesdayHoliday,
  createWednesdayHoliday,
  createConsecutiveHolidays,
  createLeapYearHoliday,
  createYearBoundaryHoliday,
  createSaturdayHoliday,
  createSundayHoliday,
  createMondayHoliday,
  createFridayHoliday,
} from '../factories/holidayFactory';

describe('calculateRecommendations', () => {
  describe('Thursday holidays (FR6)', () => {
    it('should recommend Friday for a Thursday holiday', () => {
      const holidays: Holiday[] = [createThursdayHoliday()];

      const recs = calculateRecommendations(holidays);

      expect(recs).toHaveLength(1);
      expect(recs[0].holidayName).toBe('Thanksgiving');
      expect(recs[0].recommendation).toContain('Friday');
      expect(recs[0].recommendation).toContain('Nov 28');
    });

    it('should recommend Friday for multiple Thursday holidays', () => {
      const holidays: Holiday[] = [
        createThursdayHoliday({ name: 'Thanksgiving', date: '2025-11-27' }),
        { id: '2', name: 'Another Thursday', date: '2025-12-04' }, // Thursday
      ];

      const recs = calculateRecommendations(holidays);

      expect(recs).toHaveLength(2);
      expect(recs[0].recommendation).toContain('Friday, Nov 28');
      expect(recs[1].recommendation).toContain('Friday, Dec 5');
    });
  });

  describe('Tuesday holidays (FR7)', () => {
    it('should recommend Monday for a Tuesday holiday', () => {
      const holidays: Holiday[] = [createTuesdayHoliday()];

      const recs = calculateRecommendations(holidays);

      expect(recs).toHaveLength(1);
      expect(recs[0].holidayName).toBe('Election Day');
      expect(recs[0].recommendation).toContain('Monday');
      expect(recs[0].recommendation).toContain('Nov 3');
    });

    it('should recommend Monday for multiple Tuesday holidays', () => {
      const holidays: Holiday[] = [
        createTuesdayHoliday({ name: 'Election Day', date: '2025-11-04' }),
        { id: '2', name: 'Another Tuesday', date: '2025-12-02' }, // Tuesday
      ];

      const recs = calculateRecommendations(holidays);

      expect(recs).toHaveLength(2);
      expect(recs[0].recommendation).toContain('Monday, Nov 3');
      expect(recs[1].recommendation).toContain('Monday, Dec 1');
    });
  });

  describe('Other weekdays (no recommendation)', () => {
    it('should return no recommendations for a Wednesday holiday', () => {
      const holidays: Holiday[] = [createWednesdayHoliday()];

      const recs = calculateRecommendations(holidays);

      expect(recs).toHaveLength(0);
    });

    it('should return no recommendations for a Monday holiday', () => {
      const holidays: Holiday[] = [createMondayHoliday()];

      const recs = calculateRecommendations(holidays);

      expect(recs).toHaveLength(0);
    });

    it('should return no recommendations for a Friday holiday', () => {
      const holidays: Holiday[] = [createFridayHoliday()];

      const recs = calculateRecommendations(holidays);

      expect(recs).toHaveLength(0);
    });

    it('should return no recommendations for a Saturday holiday', () => {
      const holidays: Holiday[] = [createSaturdayHoliday()];

      const recs = calculateRecommendations(holidays);

      expect(recs).toHaveLength(0);
    });

    it('should return no recommendations for a Sunday holiday', () => {
      const holidays: Holiday[] = [createSundayHoliday()];

      const recs = calculateRecommendations(holidays);

      expect(recs).toHaveLength(0);
    });
  });

  describe('Consecutive holidays (FR8)', () => {
    it('should not recommend a day that is already a holiday', () => {
      const holidays = createConsecutiveHolidays();
      // holidays[0]: Thursday Nov 27
      // holidays[1]: Friday Nov 28

      const recs = calculateRecommendations(holidays);

      // Should NOT recommend Friday (already a holiday)
      expect(recs).toHaveLength(0);
    });

    it('should not recommend Monday if both Tuesday and Monday are holidays', () => {
      const holidays: Holiday[] = [
        { id: '1', name: 'Monday Holiday', date: '2025-11-03' }, // Monday
        { id: '2', name: 'Tuesday Holiday', date: '2025-11-04' }, // Tuesday
      ];

      const recs = calculateRecommendations(holidays);

      // Should NOT recommend Monday (already a holiday)
      expect(recs).toHaveLength(0);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty holiday list', () => {
      const holidays: Holiday[] = [];

      const recs = calculateRecommendations(holidays);

      expect(recs).toHaveLength(0);
    });

    it('should handle leap year dates (Feb 29)', () => {
      const holidays: Holiday[] = [createLeapYearHoliday()];
      // Feb 29, 2024 is a Thursday

      const recs = calculateRecommendations(holidays);

      expect(recs).toHaveLength(1);
      expect(recs[0].recommendation).toContain('Friday');
      expect(recs[0].recommendation).toContain('Mar 1'); // Day after Feb 29
    });

    it('should handle year boundary (Dec 31 → Jan 1)', () => {
      const holidays: Holiday[] = [
        { id: '1', name: 'New Year Eve', date: '2025-12-30' }, // Tuesday
      ];

      const recs = calculateRecommendations(holidays);

      expect(recs).toHaveLength(1);
      expect(recs[0].recommendation).toContain('Monday');
      expect(recs[0].recommendation).toContain('Dec 29');
    });

    it('should handle year boundary for Thursday (Dec 31 → Jan 1)', () => {
      const holidays: Holiday[] = [
        { id: '1', name: 'Some Thursday', date: '2026-12-31' }, // Thursday
      ];

      const recs = calculateRecommendations(holidays);

      expect(recs).toHaveLength(1);
      expect(recs[0].recommendation).toContain('Friday');
      expect(recs[0].recommendation).toContain('Jan 1, 2027'); // Next year
    });

    it('should handle invalid date gracefully', () => {
      const holidays: Holiday[] = [
        { id: '1', name: 'Invalid', date: 'not-a-date' },
      ];

      // Should not crash, return empty array
      expect(() => calculateRecommendations(holidays)).not.toThrow();
      const recs = calculateRecommendations(holidays);
      expect(recs).toHaveLength(0);
    });
  });

  describe('Mixed scenarios', () => {
    it('should handle mix of Tuesday, Thursday, and other days', () => {
      const holidays: Holiday[] = [
        createThursdayHoliday({ name: 'Thanksgiving', date: '2025-11-27' }),
        createTuesdayHoliday({ name: 'Election Day', date: '2025-11-04' }),
        createWednesdayHoliday({ name: 'Veterans Day', date: '2025-11-12' }),
      ];

      const recs = calculateRecommendations(holidays);

      // Should have 2 recommendations (Thu + Tue only)
      expect(recs).toHaveLength(2);

      const thanksgivingRec = recs.find((r) => r.holidayName === 'Thanksgiving');
      expect(thanksgivingRec?.recommendation).toContain('Friday, Nov 28');

      const electionRec = recs.find((r) => r.holidayName === 'Election Day');
      expect(electionRec?.recommendation).toContain('Monday, Nov 3');
    });
  });
});
