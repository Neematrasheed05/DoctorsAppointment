
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { LOCATION_SCHEDULES } from "./constants"

export type LocationSchedule = typeof LOCATION_SCHEDULES[number];

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function formatTime(time: string): string {
  return time;
}

export function formatDateTime(date: Date, time: string): string {
  return `${formatDate(date)} at ${time}`;
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  // Kenyan phone number validation
  const phoneRegex = /^(\+254|0)?[17][0-9]{8}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
}

export function formatPhoneNumber(phone: string): string {
  // Convert to international format
  const cleaned = phone.replace(/\s+/g, '');
  if (cleaned.startsWith('0')) {
    return '+254' + cleaned.substring(1);
  }
  if (cleaned.startsWith('254')) {
    return '+' + cleaned;
  }
  if (cleaned.startsWith('+254')) {
    return cleaned;
  }
  return phone;
}

export function generateTimeSlots(date: Date): string[] {
  // Legacy generic slot generator, kept for backward compatibility.
  const slots = [];
  const startHour = 8;
  const endHour = 17;
  const duration = 45; // minutes
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += duration) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const endMinute = minute + duration;
      
      if (endMinute <= 60 && (hour < endHour - 1 || endMinute <= 60)) {
        slots.push(time);
      }
    }
  }
  
  return slots;
}

export function isBusinessDay(date: Date): boolean {
  const day = date.getDay();
  return day >= 1 && day <= 6; // Monday to Saturday
}

/** Appointment length in minutes. */
export const APPOINTMENT_DURATION_MIN = 45;

/** Return all clinic locations that are open on the given date. */
export function getLocationsForDate(date: Date): LocationSchedule[] {
  const day = date.getDay();
  return LOCATION_SCHEDULES.filter((loc) =>
    (loc.days as readonly number[]).includes(day)
  );
}

/** Return a specific location by its id. */
export function getLocationById(id: string): LocationSchedule | undefined {
  return LOCATION_SCHEDULES.find((loc) => loc.id === id);
}

/** Return a specific location by its display name. */
export function getLocationByName(name: string): LocationSchedule | undefined {
  return LOCATION_SCHEDULES.find((loc) => loc.name === name);
}

/** Return true if at least one clinic location is open on the given date. */
export function hasAnyLocationOpen(date: Date): boolean {
  return getLocationsForDate(date).length > 0;
}

/**
 * Generate 45-minute appointment slot start times for a given location
 * (format HH:MM, 24h). Slots must end at or before the location's closing hour.
 */
export function generateLocationSlots(location: LocationSchedule): string[] {
  const slots: string[] = [];
  const duration = APPOINTMENT_DURATION_MIN;
  const startMin = location.startHour * 60;
  const endMin = location.endHour * 60;
  for (let min = startMin; min + duration <= endMin; min += duration) {
    const h = Math.floor(min / 60);
    const m = min % 60;
    slots.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
  }
  return slots;
}

/** Format HH:MM (24h) as a human label like "2:00 PM". */
export function formatTimeLabel(time: string): string {
  const [hStr, mStr] = time.split(":");
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  const suffix = h >= 12 ? "PM" : "AM";
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH}:${m.toString().padStart(2, "0")} ${suffix}`;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

/**
 * Return the next `count` calendar dates (starting from today) on which at
 * least one clinic location is open. Results respect the location schedules
 * defined in LOCATION_SCHEDULES (Mon, Tue, Thu, Fri for this clinic).
 */
export function getNextBusinessDays(count: number = 7): Date[] {
  const days: Date[] = [];
  let current = new Date();
  let safety = 0;

  while (days.length < count && safety < 90) {
    if (hasAnyLocationOpen(current)) {
      days.push(new Date(current));
    }
    current = addDays(current, 1);
    safety++;
  }

  return days;
}
