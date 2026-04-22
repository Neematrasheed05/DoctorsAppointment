import { LOCATION_SCHEDULES, LocationSchedule } from './constants';

export const APPOINTMENT_DURATION_MIN = 45;

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone: string): boolean {
  return /^(\+254|0)?[17][0-9]{8}$/.test(phone.replace(/\s+/g, ''));
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\s+/g, '');
  if (cleaned.startsWith('0')) return '+254' + cleaned.substring(1);
  if (cleaned.startsWith('254')) return '+' + cleaned;
  return cleaned;
}

export function getLocationsForDate(date: Date): LocationSchedule[] {
  const day = date.getDay();
  return LOCATION_SCHEDULES.filter((loc) =>
    (loc.days as readonly number[]).includes(day)
  );
}

export function getLocationById(id: string): LocationSchedule | undefined {
  return LOCATION_SCHEDULES.find((loc) => loc.id === id);
}

export function getLocationByName(name: string): LocationSchedule | undefined {
  return LOCATION_SCHEDULES.find((loc) => loc.name === name);
}

export function hasAnyLocationOpen(date: Date): boolean {
  return getLocationsForDate(date).length > 0;
}

export function generateLocationSlots(location: LocationSchedule): string[] {
  const slots: string[] = [];
  const startMin = location.startHour * 60;
  const endMin = location.endHour * 60;
  for (let min = startMin; min + APPOINTMENT_DURATION_MIN <= endMin; min += APPOINTMENT_DURATION_MIN) {
    const h = Math.floor(min / 60);
    const m = min % 60;
    slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
  }
  return slots;
}
