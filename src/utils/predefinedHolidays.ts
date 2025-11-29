// Predefined holidays for quick selection
// USA holidays are listed first, followed by other countries

export interface PredefinedHoliday {
  name: string;
  date: string; // Format: MM-DD (month-day)
  country: string;
}

export const PREDEFINED_HOLIDAYS: PredefinedHoliday[] = [
  // USA Holidays
  { name: "New Year's Day", date: "01-01", country: "USA" },
  { name: "Martin Luther King Jr. Day", date: "01-20", country: "USA" }, // Third Monday of January (approximate)
  { name: "Presidents' Day", date: "02-17", country: "USA" }, // Third Monday of February (approximate)
  { name: "Memorial Day", date: "05-26", country: "USA" }, // Last Monday of May (approximate)
  { name: "Juneteenth", date: "06-19", country: "USA" },
  { name: "Independence Day", date: "07-04", country: "USA" },
  { name: "Labor Day", date: "09-01", country: "USA" }, // First Monday of September (approximate)
  { name: "Columbus Day", date: "10-13", country: "USA" }, // Second Monday of October (approximate)
  { name: "Veterans Day", date: "11-11", country: "USA" },
  { name: "Thanksgiving", date: "11-27", country: "USA" }, // Fourth Thursday of November (approximate)
  { name: "Christmas Day", date: "12-25", country: "USA" },

  // Canada
  { name: "Canada Day", date: "07-01", country: "Canada" },
  { name: "Civic Holiday", date: "08-04", country: "Canada" },
  { name: "Remembrance Day", date: "11-11", country: "Canada" },

  // UK
  { name: "New Year's Day", date: "01-01", country: "UK" },
  { name: "Good Friday", date: "04-18", country: "UK" }, // Varies by year
  { name: "Easter Monday", date: "04-21", country: "UK" }, // Varies by year
  { name: "Early May Bank Holiday", date: "05-05", country: "UK" },
  { name: "Spring Bank Holiday", date: "05-26", country: "UK" },
  { name: "Summer Bank Holiday", date: "08-25", country: "UK" },
  { name: "Christmas Day", date: "12-25", country: "UK" },
  { name: "Boxing Day", date: "12-26", country: "UK" },

  // Australia
  { name: "Australia Day", date: "01-26", country: "Australia" },
  { name: "Anzac Day", date: "04-25", country: "Australia" },
  { name: "Queen's Birthday", date: "06-09", country: "Australia" }, // Varies by state
  { name: "Boxing Day", date: "12-26", country: "Australia" },

  // International
  { name: "International Women's Day", date: "03-08", country: "International" },
  { name: "Earth Day", date: "04-22", country: "International" },
  { name: "International Workers' Day", date: "05-01", country: "International" },
  { name: "Halloween", date: "10-31", country: "International" },
  { name: "New Year's Eve", date: "12-31", country: "International" },
];

/**
 * Get upcoming holidays starting from today for a specific year
 * @param year - The year to get holidays for
 * @returns Array of predefined holidays with full dates
 */
export function getUpcomingHolidays(year: number = new Date().getFullYear()) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day for comparison

  return PREDEFINED_HOLIDAYS.map(holiday => {
    const [month, day] = holiday.date.split('-').map(Number);
    const fullDate = new Date(year, month - 1, day);

    return {
      ...holiday,
      fullDate: fullDate.toISOString().split('T')[0], // YYYY-MM-DD format
      dateObj: fullDate,
    };
  })
  .filter(holiday => holiday.dateObj >= today)
  .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
}

/**
 * Get upcoming holidays within the next 365 days
 * @returns Array of predefined holidays with full dates
 */
export function getUpcomingHolidaysNext365Days() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const oneYearFromNow = new Date(today);
  oneYearFromNow.setDate(oneYearFromNow.getDate() + 365);

  const currentYear = today.getFullYear();
  const nextYear = oneYearFromNow.getFullYear();

  // Get holidays for current and next year
  const holidays = [];

  for (let year = currentYear; year <= nextYear; year++) {
    const yearHolidays = PREDEFINED_HOLIDAYS.map(holiday => {
      const [month, day] = holiday.date.split('-').map(Number);
      const fullDate = new Date(year, month - 1, day);

      return {
        ...holiday,
        fullDate: fullDate.toISOString().split('T')[0],
        dateObj: fullDate,
      };
    });

    holidays.push(...yearHolidays);
  }

  return holidays
    .filter(holiday => holiday.dateObj >= today && holiday.dateObj <= oneYearFromNow)
    .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
}

/**
 * Group holidays by country, with USA first
 * @param mode - 'thisYear' or 'next365Days'
 * @returns Map of country to holidays
 */
export function getUpcomingHolidaysByCountry(mode: 'thisYear' | 'next365Days' = 'thisYear') {
  const upcomingHolidays = mode === 'thisYear'
    ? getUpcomingHolidays()
    : getUpcomingHolidaysNext365Days();

  const grouped = new Map<string, typeof upcomingHolidays>();

  // Initialize with USA first
  grouped.set('USA', []);

  upcomingHolidays.forEach(holiday => {
    if (!grouped.has(holiday.country)) {
      grouped.set(holiday.country, []);
    }
    grouped.get(holiday.country)!.push(holiday);
  });

  // Remove USA if empty and re-add to maintain order
  const usaHolidays = grouped.get('USA') || [];
  grouped.delete('USA');

  // Return with USA first
  const result = new Map<string, typeof upcomingHolidays>();
  if (usaHolidays.length > 0) {
    result.set('USA', usaHolidays);
  }

  // Add other countries
  grouped.forEach((holidays, country) => {
    if (holidays.length > 0) {
      result.set(country, holidays);
    }
  });

  return result;
}
