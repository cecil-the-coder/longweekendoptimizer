/**
 * ATDD Unit Tests: Date Logic - Story 1.4
 *
 * These tests are written to FAIL (RED phase) before implementation.
 * Following TDD red-green-refactor cycle.
 *
 * Story: 1.4 - Core Recommendation Logic
 * Target: >95% code coverage
 * Framework: Vitest
 */

import { describe, it, expect } from 'vitest';
import { calculateRecommendations } from '../dateLogic';
import type { Holiday } from '../../context/HolidayContext';

// Recommendation interface is exported from dateLogic module

describe('calculateRecommendations - Story 1.4 Core Recommendation Logic', () => {

  // AC1: Function correctly identifies holidays falling on Tuesday
  describe('AC1: Tuesday Holiday Detection', () => {
    it('should recommend Monday off for a Tuesday holiday', () => {
      // GIVEN: A holiday falling on Tuesday
      const holidays: Holiday[] = [
        { id: '1', name: 'New Year Day', date: '2025-01-07' } // Tuesday
      ];

      // WHEN: Calculate recommendations
      const recommendations = calculateRecommendations(holidays);

      // THEN: Should recommend Monday off
      expect(recommendations).toHaveLength(1);
      expect(recommendations[0]).toMatchObject({
        holidayName: 'New Year Day',
        holidayDate: '2025-01-07',
        holidayDayOfWeek: 'Tuesday',
        recommendedDate: '2025-01-06',
        recommendedDay: 'Monday',
        explanation: '→ 4-day weekend'
      });
    });

    it('should handle multiple Tuesday holidays with separate Monday recommendations', () => {
      // GIVEN: Multiple Tuesday holidays
      const holidays: Holiday[] = [
        { id: '1', name: 'Tuesday Holiday 1', date: '2025-01-07' }, // Tuesday
        { id: '2', name: 'Tuesday Holiday 2', date: '2025-01-14' }, // Tuesday
      ];

      // WHEN: Calculate recommendations
      const recommendations = calculateRecommendations(holidays);

      // THEN: Should have Monday recommendations for each
      expect(recommendations).toHaveLength(2);
      expect(recommendations[0]).toMatchObject({
        recommendedDay: 'Monday',
        recommendedDate: '2025-01-06'
      });
      expect(recommendations[1]).toMatchObject({
        recommendedDay: 'Monday',
        recommendedDate: '2025-01-13'
      });
    });
  });

  // AC2: Function correctly identifies holidays falling on Thursday
  describe('AC2: Thursday Holiday Detection', () => {
    it('should recommend Friday off for a Thursday holiday', () => {
      // GIVEN: A holiday falling on Thursday
      const holidays: Holiday[] = [
        { id: '1', name: 'Thanksgiving', date: '2025-11-27' } // Thursday
      ];

      // WHEN: Calculate recommendations
      const recommendations = calculateRecommendations(holidays);

      // THEN: Should recommend Friday off
      expect(recommendations).toHaveLength(1);
      expect(recommendations[0]).toMatchObject({
        holidayName: 'Thanksgiving',
        holidayDate: '2025-11-27',
        holidayDayOfWeek: 'Thursday',
        recommendedDate: '2025-11-28',
        recommendedDay: 'Friday',
        explanation: '→ 4-day weekend'
      });
    });

    it('should handle multiple Thursday holidays with separate Friday recommendations', () => {
      // GIVEN: Multiple Thursday holidays
      const holidays: Holiday[] = [
        { id: '1', name: 'Thanksgiving', date: '2025-11-27' }, // Thursday
        { id: '2', name: 'Thursday Holiday 2', date: '2025-12-04' }, // Thursday
      ];

      // WHEN: Calculate recommendations
      const recommendations = calculateRecommendations(holidays);

      // THEN: Should have Friday recommendations for each
      expect(recommendations).toHaveLength(2);
      expect(recommendations[0]).toMatchObject({
        recommendedDay: 'Friday',
        recommendedDate: '2025-11-28'
      });
      expect(recommendations[1]).toMatchObject({
        recommendedDay: 'Friday',
        recommendedDate: '2025-12-05'
      });
    });
  });

  // AC3: Function outputs structured recommendations with holiday name and recommended date off
  describe('AC3: Structured Output Format', () => {
    it('should output complete recommendation objects with all required fields', () => {
      // GIVEN: A qualifying holiday
      const holidays: Holiday[] = [
        { id: '1', name: 'Test Holiday', date: '2025-01-07' } // Tuesday
      ];

      // WHEN: Calculate recommendations
      const recommendations = calculateRecommendations(holidays);

      // THEN: Should have all required fields with correct types
      expect(recommendations).toHaveLength(1);
      expect(recommendations[0]).toHaveProperty('holidayName');
      expect(recommendations[0]).toHaveProperty('holidayDate');
      expect(recommendations[0]).toHaveProperty('holidayDayOfWeek');
      expect(recommendations[0]).toHaveProperty('recommendedDate');
      expect(recommendations[0]).toHaveProperty('recommendedDay');
      expect(recommendations[0]).toHaveProperty('explanation');

      // Verify types
      expect(typeof recommendations[0].holidayName).toBe('string');
      expect(typeof recommendations[0].holidayDate).toBe('string');
      expect(typeof recommendations[0].holidayDayOfWeek).toBe('string');
      expect(typeof recommendations[0].recommendedDate).toBe('string');
      expect(typeof recommendations[0].recommendedDay).toBe('string');
      expect(typeof recommendations[0].explanation).toBe('string');
    });

    it('should maintain holiday name in recommendation output', () => {
      // GIVEN: Holiday with specific name
      const holidays: Holiday[] = [
        { id: '1', name: 'Independence Day', date: '2025-07-03' } // Thursday
      ];

      // WHEN: Calculate recommendations
      const recommendations = calculateRecommendations(holidays);

      // THEN: Should preserve original holiday name
      expect(recommendations[0].holidayName).toBe('Independence Day');
    });
  });

  // AC4: Function returns empty array when input contains no qualifying holidays
  describe('AC4: Empty Array for Non-Qualifying Holidays', () => {
    it('should return empty array for Monday holidays', () => {
      // GIVEN: Monday holiday (non-qualifying)
      const holidays: Holiday[] = [
        { id: '1', name: 'Monday Holiday', date: '2025-01-06' } // Monday
      ];

      // WHEN: Calculate recommendations
      const recommendations = calculateRecommendations(holidays);

      // THEN: Should return empty array
      expect(recommendations).toHaveLength(0);
    });

    it('should return empty array for Wednesday holidays', () => {
      // GIVEN: Wednesday holiday (non-qualifying)
      const holidays: Holiday[] = [
        { id: '1', name: 'Wednesday Holiday', date: '2025-01-08' } // Wednesday
      ];

      // WHEN: Calculate recommendations
      const recommendations = calculateRecommendations(holidays);

      // THEN: Should return empty array
      expect(recommendations).toHaveLength(0);
    });

    it('should return empty array for Friday holidays', () => {
      // GIVEN: Friday holiday (non-qualifying)
      const holidays: Holiday[] = [
        { id: '1', name: 'Friday Holiday', date: '2025-01-10' } // Friday
      ];

      // WHEN: Calculate recommendations
      const recommendations = calculateRecommendations(holidays);

      // THEN: Should return empty array
      expect(recommendations).toHaveLength(0);
    });

    it('should return empty array for completely empty input', () => {
      // GIVEN: Empty holiday array
      const holidays: Holiday[] = [];

      // WHEN: Calculate recommendations
      const recommendations = calculateRecommendations(holidays);

      // THEN: Should return empty array
      expect(recommendations).toHaveLength(0);
    });

    it('should return empty array for weekend holidays', () => {
      // GIVEN: Weekend holidays (non-qualifying)
      const holidays: Holiday[] = [
        { id: '1', name: 'Saturday Holiday', date: '2025-01-11' }, // Saturday
        { id: '2', name: 'Sunday Holiday', date: '2025-01-12' }, // Sunday
      ];

      // WHEN: Calculate recommendations
      const recommendations = calculateRecommendations(holidays);

      // THEN: Should return empty array
      expect(recommendations).toHaveLength(0);
    });
  });

  // AC5: Function does not recommend days that are already in the holiday list
  describe('AC5: Duplicate Day Avoidance', () => {
    it('should not recommend Monday if Monday is already a holiday', () => {
      // GIVEN: Tuesday holiday with Monday already as holiday
      const holidays: Holiday[] = [
        { id: '1', name: 'Monday Holiday', date: '2025-01-06' }, // Monday
        { id: '2', name: 'Tuesday Holiday', date: '2025-01-07' }, // Tuesday
      ];

      // WHEN: Calculate recommendations
      const recommendations = calculateRecommendations(holidays);

      // THEN: Should not recommend Monday (already holiday)
      expect(recommendations).toHaveLength(0);
    });

    it('should not recommend Friday if Friday is already a holiday', () => {
      // GIVEN: Thursday holiday with Friday already as holiday
      const holidays: Holiday[] = [
        { id: '1', name: 'Friday Holiday', date: '2025-01-10' }, // Friday
        { id: '2', name: 'Thursday Holiday', date: '2025-01-09' }, // Thursday
      ];

      // WHEN: Calculate recommendations
      const recommendations = calculateRecommendations(holidays);

      // THEN: Should not recommend Friday (already holiday)
      expect(recommendations).toHaveLength(0);
    });

    it('should recommend for qualifying holiday when recommended day is not already a holiday', () => {
      // GIVEN: Tuesday holiday with different day already as holiday
      const holidays: Holiday[] = [
        { id: '1', name: 'Wednesday Holiday', date: '2025-01-08' }, // Wednesday (not Monday)
        { id: '2', name: 'Tuesday Holiday', date: '2025-01-07' }, // Tuesday
      ];

      // WHEN: Calculate recommendations
      const recommendations = calculateRecommendations(holidays);

      // THEN: Should still recommend Monday (not a holiday)
      expect(recommendations).toHaveLength(1);
      expect(recommendations[0].recommendedDay).toBe('Monday');
      expect(recommendations[0].recommendedDate).toBe('2025-01-06');
    });
  });

  // AC6: Function handles edge cases (empty input, malformed dates) gracefully
  describe('AC6: Edge Case Handling', () => {
    it('should handle malformed date strings gracefully', () => {
      // GIVEN: Holiday with malformed date
      const holidays: Holiday[] = [
        { id: '1', name: 'Invalid Date Holiday', date: 'not-a-valid-date' }
      ];

      // WHEN: Calculate recommendations
      const recommendations = calculateRecommendations(holidays);

      // THEN: Should handle gracefully (not crash) and return empty array
      expect(recommendations).toHaveLength(0);
      // Should not throw exception
      expect(() => calculateRecommendations(holidays)).not.toThrow();
    });

    it('should handle null/undefined input gracefully', () => {
      // GIVEN: Invalid input types
      const invalidInputs: unknown[] = [null, undefined];

      // WHEN: Calculate recommendations
      invalidInputs.forEach(input => {
        // THEN: Should handle gracefully without crashing
        expect(() => calculateRecommendations(input)).not.toThrow();
        const result = calculateRecommendations(input);
        expect(Array.isArray(result)).toBe(true);
      });
    });

    it('should handle holidays with missing required fields gracefully', () => {
      // GIVEN: Incomplete holiday objects
      const incompleteHolidays = [
        { id: '1' }, // missing name and date
        { name: 'No Date' }, // missing date and id
        { date: '2025-01-07' }, // missing id and name
      ] as Holiday[];

      // WHEN: Calculate recommendations
      incompleteHolidays.forEach(holidays => {
        // THEN: Should handle gracefully without crashing
        expect(() => calculateRecommendations(holidays)).not.toThrow();
        const result = calculateRecommendations(holidays);
        expect(Array.isArray(result)).toBe(true);
      });
    });

    it('should handle very large holiday arrays efficiently', () => {
      // GIVEN: Large array of holidays (performance test)
      const holidays: Holiday[] = [];
      for (let i = 0; i < 100; i++) {
        holidays.push({
          id: `holiday-${i}`,
          name: `Holiday ${i}`,
          date: '2025-01-07' // All Tuesday
        });
      }

      // WHEN: Calculate recommendations
      const startTime = performance.now();
      const recommendations = calculateRecommendations(holidays);
      const endTime = performance.now();

      // THEN: Should handle efficiently and return all recommendations
      expect(recommendations).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
    });
  });

  // Additional comprehensive test cases for coverage
  describe('Comprehensive Coverage Tests', () => {
    it('should handle mixed qualifying and non-qualifying holidays', () => {
      // GIVEN: Mixed holiday types
      const holidays: Holiday[] = [
        { id: '1', name: 'Tuesday Holiday', date: '2025-01-07' }, // Tuesday - qualifies
        { id: '2', name: 'Monday Holiday', date: '2025-01-13' }, // Monday - doesn't qualify
        { id: '3', name: 'Thursday Holiday', date: '2025-01-09' }, // Thursday - qualifies
        { id: '4', name: 'Friday Holiday', date: '2025-01-17' }, // Friday - doesn't qualify
      ];

      // WHEN: Calculate recommendations
      const recommendations = calculateRecommendations(holidays);

      // THEN: Should only recommend for Tuesday and Thursday
      expect(recommendations).toHaveLength(2);

      const tuesdayRec = recommendations.find(r => r.holidayDayOfWeek === 'Tuesday');
      const thursdayRec = recommendations.find(r => r.holidayDayOfWeek === 'Thursday');

      expect(tuesdayRec?.recommendedDay).toBe('Monday');
      expect(thursdayRec?.recommendedDay).toBe('Friday');
    });

    it('should handle leap year Tuesday dates correctly', () => {
      // GIVEN: Tuesday holiday on leap year
      const holidays: Holiday[] = [
        { id: '1', name: 'Leap Year Tuesday', date: '2024-02-27' } // Tuesday in leap year
      ];

      // WHEN: Calculate recommendations
      const recommendations = calculateRecommendations(holidays);

      // THEN: Should recommend Monday before Feb 27
      expect(recommendations).toHaveLength(1);
      expect(recommendations[0]).toMatchObject({
        holidayDate: '2024-02-27',
        holidayDayOfWeek: 'Tuesday',
        recommendedDate: '2024-02-26',
        recommendedDay: 'Monday'
      });
    });

    it('should handle leap year Thursday dates correctly', () => {
      // GIVEN: Thursday holiday on leap year (Feb 29, 2024 is Thursday)
      const holidays: Holiday[] = [
        { id: '1', name: 'Leap Year Thursday', date: '2024-02-29' } // Thursday in leap year
      ];

      // WHEN: Calculate recommendations
      const recommendations = calculateRecommendations(holidays);

      // THEN: Should recommend Friday after Feb 29
      expect(recommendations).toHaveLength(1);
      expect(recommendations[0]).toMatchObject({
        holidayDate: '2024-02-29',
        holidayDayOfWeek: 'Thursday',
        recommendedDate: '2024-03-01',
        recommendedDay: 'Friday'
      });
    });

    it('should handle year boundary transitions correctly', () => {
      // GIVEN: Tuesday holiday at year end
      const holidays: Holiday[] = [
        { id: '1', name: 'New Years Eve Tuesday', date: '2025-12-30' } // Tuesday
      ];

      // WHEN: Calculate recommendations
      const recommendations = calculateRecommendations(holidays);

      // THEN: Should recommend Monday in same year
      expect(recommendations).toHaveLength(1);
      expect(recommendations[0]).toMatchObject({
        holidayDate: '2025-12-30',
        holidayDayOfWeek: 'Tuesday',
        recommendedDate: '2025-12-29',
        recommendedDay: 'Monday'
      });
    });

    it('should preserve original holiday order in recommendations', () => {
      // Given: Qualifying holidays in specific order
      const holidays: Holiday[] = [
        { id: '1', name: 'First Tuesday', date: '2025-01-07' }, // Tuesday
        { id: '2', name: 'First Thursday', date: '2025-01-09' }, // Thursday
        { id: '3', name: 'Second Tuesday', date: '2025-01-14' }, // Tuesday
      ];

      // WHEN: Calculate recommendations
      const recommendations = calculateRecommendations(holidays);

      // THEN: Should preserve original order
      expect(recommendations).toHaveLength(3);
      expect(recommendations[0].holidayName).toBe('First Tuesday');
      expect(recommendations[1].holidayName).toBe('First Thursday');
      expect(recommendations[2].holidayName).toBe('Second Tuesday');
    });
  });

  // Additional Edge Case Tests for Enhanced Coverage
  describe('Enhanced Edge Case Coverage', () => {
    it('should handle date strings with invalid months', () => {
      // GIVEN: Holiday with invalid month
      const holidays: Holiday[] = [
        { id: '1', name: 'Invalid Month Holiday', date: '2025-13-01' } // Invalid month 13
      ];

      // WHEN: Calculate recommendations
      const recommendations = calculateRecommendations(holidays);

      // THEN: Should handle gracefully and return empty array
      expect(recommendations).toHaveLength(0);
    });

    it('should handle date strings with invalid days', () => {
      // GIVEN: Holiday with invalid day
      const holidays: Holiday[] = [
        { id: '1', name: 'Invalid Day Holiday', date: '2025-02-30' } // Feb 30 doesn't exist
      ];

      // WHEN: Calculate recommendations
      const recommendations = calculateRecommendations(holidays);

      // THEN: Should handle gracefully and return empty array
      expect(recommendations).toHaveLength(0);
    });

    it('should handle negative year dates gracefully', () => {
      // GIVEN: Holiday with negative year
      const holidays: Holiday[] = [
        { id: '1', name: 'Ancient Holiday', date: '-100-01-07' } // Negative year
      ];

      // WHEN: Calculate recommendations
      const recommendations = calculateRecommendations(holidays);

      // THEN: Should handle gracefully and return empty array
      expect(recommendations).toHaveLength(0);
    });

    it('should handle extremely far future dates', () => {
      // GIVEN: Holiday with extremely far future date
      const holidays: Holiday[] = [
        { id: '1', name: 'Future Holiday', date: '9999-12-31' } // Far future
      ];

      // WHEN: Calculate recommendations
      const recommendations = calculateRecommendations(holidays);

      // THEN: Should handle gracefully
      expect(Array.isArray(recommendations)).toBe(true);
      expect(() => calculateRecommendations(holidays)).not.toThrow();
    });

    it('should handle whitespace-only string dates', () => {
      // GIVEN: Holiday with whitespace-only date
      const holidays: Holiday[] = [
        { id: '1', name: 'Whitespace Date', date: '   ' } // Whitespace only
      ];

      // WHEN: Calculate recommendations
      const recommendations = calculateRecommendations(holidays);

      // THEN: Should handle gracefully and return empty array
      expect(recommendations).toHaveLength(0);
    });

    it('should handle empty string IDs and names', () => {
      // GIVEN: Holidays with empty ID and name
      const holidays: Holiday[] = [
        { id: '', name: '', date: '2025-01-07' } // Empty strings
      ];

      // WHEN: Calculate recommendations
      const recommendations = calculateRecommendations(holidays);

      // THEN: Should handle gracefully and return empty array due to validation
      expect(recommendations).toHaveLength(0);
    });

    it('should handle non-string ID and name types', () => {
      // GIVEN: Holidays with non-string types
      const holidays = [
        { id: 123, name: 456, date: '2025-01-07' } as unknown as Holiday
      ];

      // WHEN: Calculate recommendations
      const recommendations = calculateRecommendations(holidays);

      // THEN: Should handle gracefully and return empty array
      expect(recommendations).toHaveLength(0);
    });

    it('should handle string-like objects that are not strings', () => {
      // GIVEN: Date that's a String object (not primitive string)
      const holidays: Holiday[] = [
        { id: '1', name: 'Test Holiday', date: new String('2025-01-07') as string }
      ];

      // WHEN: Calculate recommendations
      const recommendations = calculateRecommendations(holidays);

      // THEN: Should handle gracefully
      expect(Array.isArray(recommendations)).toBe(true);
    });

    it('should handle malformed date regex patterns', () => {
      // GIVEN: Dates that don't match YYYY-MM-DD pattern
      const holidays: Holiday[] = [
        { id: '1', name: 'Wrong Format 1', date: '2025/01/07' }, // Wrong separators
        { id: '2', name: 'Wrong Format 2', date: '25-01-07' }, // Missing century
        { id: '3', name: 'Wrong Format 3', date: '2025-1-7' }   // Missing leading zeros
      ];

      // WHEN: Calculate recommendations
      const recommendations = calculateRecommendations(holidays);

      // THEN: Should handle gracefully and return empty array
      expect(recommendations).toHaveLength(0);
    });

    it('should handle date edge cases around DST transitions', () => {
      // GIVEN: Holiday around DST transition (assuming US DST)
      const holidays: Holiday[] = [
        { id: '1', name: 'Spring Forward', date: '2025-03-11' }, // Tuesday after spring forward
        { id: '2', name: 'Fall Back', date: '2025-11-06' }    // Thursday before fall back
      ];

      // WHEN: Calculate recommendations
      const recommendations = calculateRecommendations(holidays);

      // THEN: Should handle DST correctly
      expect(recommendations).toHaveLength(2);
      expect(recommendations[0].recommendedDay).toBe('Monday');
      expect(recommendations[1].recommendedDay).toBe('Friday');
    });

    it('should handle objects with prototype pollution attempts', () => {
      // GIVEN: Object with prototype pollution attempt
      const maliciousHoliday = {
        id: '1',
        name: 'Malicious Holiday',
        date: '2025-01-07',
        __proto__: { polluted: true }
      } as unknown as Holiday;

      // WHEN: Calculate recommendations
      const recommendations = calculateRecommendations([maliciousHoliday]);

      // THEN: Should handle without prototype pollution
      expect(recommendations).toHaveLength(1);
      expect(({} as any).polluted).toBeUndefined();
    });

    it('should handle cyclic object references', () => {
      // GIVEN: Object with cyclic reference
      const cyclicHoliday: any = { id: '1', name: 'Cyclic Holiday', date: '2025-01-07' };
      cyclicHoliday.self = cyclicHoliday;

      // WHEN: Calculate recommendations
      const recommendations = calculateRecommendations(cyclicHoliday);

      // THEN: Should handle gracefully (treat as invalid input)
      expect(Array.isArray(recommendations)).toBe(true);
    });
  });

  // Performance and Stress Tests
  describe('Performance and Stress Testing', () => {
    it('should handle very large holiday arrays efficiently (1000+ holidays)', () => {
      // GIVEN: Very large array of holidays
      const holidays: Holiday[] = [];
      for (let i = 0; i < 1000; i++) {
        holidays.push({
          id: `holiday-${i}`,
          name: `Holiday ${i}`,
          date: '2025-01-07' // All Tuesday
        });
      }

      // WHEN: Calculate recommendations
      const startTime = performance.now();
      const recommendations = calculateRecommendations(holidays);
      const endTime = performance.now();

      // THEN: Should handle efficiently within reasonable time
      expect(recommendations).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(200); // Should complete within 200ms
    });

    it('should handle mixed validation efficiently', () => {
      // GIVEN: Array with mix of valid and invalid holidays
      const holidays: Holiday[] = [];
      for (let i = 0; i < 500; i++) {
        if (i % 3 === 0) {
          holidays.push({ id: `valid-${i}`, name: `Valid Holiday ${i}`, date: '2025-01-07' });
        } else if (i % 3 === 1) {
          holidays.push({ id: `invalid-date-${i}`, name: `Invalid Date ${i}`, date: 'invalid-date' });
        } else {
          holidays.push({ id: '', name: `Empty ID ${i}`, date: '2025-01-07' });
        }
      }

      // WHEN: Calculate recommendations
      const startTime = performance.now();
      const recommendations = calculateRecommendations(holidays);
      const endTime = performance.now();

      // THEN: Should handle efficiently and only process valid holidays
      expect(recommendations).toHaveLength(Math.floor(500 / 3) + 1); // Only valid ones
      expect(endTime - startTime).toBeLessThan(150);
    });
  });

  // Verification: GREEN phase verification - tests should now pass
  describe('GREEN Phase Verification', () => {
    it('should work correctly - implementation complete', () => {
      // This test verifies implementation is working correctly

      const holidays: Holiday[] = [
        { id: '1', name: 'Test Tuesday', date: '2025-01-07' }
      ];

      expect(() => {
        const result = calculateRecommendations(holidays);
        console.log('Current result:', result);
      }).not.toThrow();

      // Implementation should now return correct recommendation
      const result = calculateRecommendations(holidays);
      expect(result).toHaveLength(1); // Should work now (GREEN phase)
      expect(result[0]).toMatchObject({
        holidayName: 'Test Tuesday',
        holidayDate: '2025-01-07',
        holidayDayOfWeek: 'Tuesday',
        recommendedDate: '2025-01-06',
        recommendedDay: 'Monday',
        explanation: '→ 4-day weekend'
      });
    });
  });
});