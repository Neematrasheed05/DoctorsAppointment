// Detailed clinic location schedules used for booking slot generation.
// days: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
export const LOCATION_SCHEDULES = [
  {
    id: 'pmc',
    name: 'PMC Building',
    fullName: 'PMC Building, 6th Floor, Room 608',
    address: 'PMC Building, 6th Floor, Room 608, 3rd Parklands, Nairobi',
    days: [1, 4], // Monday & Thursday
    startHour: 14,
    endHour: 18,
    daysLabel: 'Monday & Thursday',
    hoursLabel: 'Monday & Thursday: 2:00 PM - 6:00 PM',
    timeRangeLabel: '2:00 PM - 6:00 PM',
  },
  {
    id: 'knh',
    name: 'KNH Doctors Plaza',
    fullName: 'KNH Doctors Plaza, Room 26',
    address: 'KNH Doctors Plaza, Room 26, Nairobi',
    days: [1, 2, 5], // Monday, Tuesday, Friday
    startHour: 10,
    endHour: 13,
    daysLabel: 'Monday, Tuesday & Friday',
    hoursLabel: 'Monday, Tuesday & Friday: 10:00 AM - 1:00 PM',
    timeRangeLabel: '10:00 AM - 1:00 PM',
  },
] as const;

export type LocationSchedule = typeof LOCATION_SCHEDULES[number];
