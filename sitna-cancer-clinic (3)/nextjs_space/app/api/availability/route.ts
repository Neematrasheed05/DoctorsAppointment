
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import {
  generateLocationSlots,
  getLocationById,
  getLocationsForDate,
  hasAnyLocationOpen,
} from '@/lib/utils';

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    const locationParam = searchParams.get('location'); // optional: filter by location id

    // If no date parameter, return weekly availability settings
    if (!dateParam) {
      // Note: this is used by the admin availability page to display the weekly overview.
      // Clinic is closed on Wednesday, Saturday and Sunday (no location open).
      const defaultAvailability = [
        { day: 'Monday', enabled: true, startTime: '10:00', endTime: '18:00' },
        { day: 'Tuesday', enabled: true, startTime: '10:00', endTime: '13:00' },
        { day: 'Wednesday', enabled: false, startTime: '00:00', endTime: '00:00' },
        { day: 'Thursday', enabled: true, startTime: '14:00', endTime: '18:00' },
        { day: 'Friday', enabled: true, startTime: '10:00', endTime: '13:00' },
        { day: 'Saturday', enabled: false, startTime: '00:00', endTime: '00:00' },
        { day: 'Sunday', enabled: false, startTime: '00:00', endTime: '00:00' },
      ];

      return NextResponse.json({ availability: defaultAvailability });
    }

    const requestedDate = new Date(dateParam);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Don't allow booking for past dates
    if (requestedDate < today) {
      return NextResponse.json({
        availableSlots: [],
        locations: [],
        message: 'Cannot book appointments for past dates',
      });
    }

    // Check if any location is open on this weekday
    if (!hasAnyLocationOpen(requestedDate)) {
      return NextResponse.json({
        availableSlots: [],
        locations: [],
        message: 'Clinic is closed on this day',
      });
    }

    // Check if the doctor is unavailable on this date
    const unavailability = await prisma.doctorUnavailability.findFirst({
      where: {
        startDate: { lte: requestedDate },
        endDate: { gte: requestedDate },
      },
    });

    if (unavailability) {
      return NextResponse.json({
        availableSlots: [],
        locations: [],
        message: unavailability.reason
          ? `Dr. Sitna is unavailable: ${unavailability.reason}`
          : 'Dr. Sitna is unavailable on this date',
        isUnavailable: true,
      });
    }

    // Figure out which locations are open on this weekday
    let locationsForDay = getLocationsForDate(requestedDate);

    // Optional filter by location id
    if (locationParam) {
      const requested = getLocationById(locationParam);
      if (!requested) {
        return NextResponse.json(
          { error: `Unknown location id: ${locationParam}` },
          { status: 400 }
        );
      }
      locationsForDay = locationsForDay.filter((l) => l.id === requested.id);
      if (locationsForDay.length === 0) {
        return NextResponse.json({
          availableSlots: [],
          locations: [],
          message: `${requested.name} is not open on this day`,
        });
      }
    }

    // Fetch booked and blocked slots for this date (one DB round-trip each)
    const bookedAppointments = await prisma.appointment.findMany({
      where: {
        appointmentDate: requestedDate,
        status: { not: 'CANCELLED' },
      },
      select: { appointmentTime: true, location: true },
    });

    const blockedSlots = await prisma.availabilitySlot.findMany({
      where: {
        date: requestedDate,
        isBlocked: true,
      },
      select: { startTime: true },
    });
    const blockedTimes = blockedSlots.map((slot) => slot.startTime);

    // Build per-location slot lists, filtering out booked (scoped to that location)
    // and globally blocked times.
    const locations = locationsForDay.map((loc) => {
      const allSlots = generateLocationSlots(loc);
      const bookedTimesForLoc = bookedAppointments
        .filter((apt) => apt.location === loc.name)
        .map((apt) => apt.appointmentTime);

      const slots = allSlots
        .filter((time) => !bookedTimesForLoc.includes(time))
        .filter((time) => !blockedTimes.includes(time))
        .map((time) => ({ time, available: true }));

      return {
        id: loc.id,
        name: loc.name,
        fullName: loc.fullName,
        address: loc.address,
        hoursLabel: loc.hoursLabel,
        timeRangeLabel: loc.timeRangeLabel,
        slots,
      };
    });

    // Also return a flat availableSlots list (concatenated across locations) for
    // backward compatibility with any callers that don't handle per-location data.
    const availableSlots = locations.flatMap((l) =>
      l.slots.map((s) => ({ time: s.time, available: s.available, location: l.name }))
    );

    return NextResponse.json({
      availableSlots,
      locations,
      date: dateParam,
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    );
  }
}

// POST - Save availability settings or block time slots (admin only)
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Check if this is a weekly availability update
    if (data.availability && Array.isArray(data.availability)) {
      // In a real implementation, this would save to a settings table
      // For now, just return success
      return NextResponse.json({
        success: true,
        message: 'Availability settings saved successfully',
        availability: data.availability,
      });
    }

    // Otherwise, handle blocking specific time slots
    const { date, startTime, endTime, reason, isBlocked = true } = data;

    if (!date || !startTime) {
      return NextResponse.json(
        { error: 'Date and start time are required' },
        { status: 400 }
      );
    }

    const slot = await prisma.availabilitySlot.upsert({
      where: {
        date_startTime: {
          date: new Date(date),
          startTime,
        },
      },
      update: {
        isBlocked,
        reason: reason || null,
      },
      create: {
        date: new Date(date),
        startTime,
        endTime: endTime || startTime,
        isBlocked,
        reason: reason || null,
      },
    });

    return NextResponse.json({
      slot,
      message: `Time slot ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
    });
  } catch (error) {
    console.error('Error managing availability:', error);
    return NextResponse.json(
      { error: 'Failed to manage availability' },
      { status: 500 }
    );
  }
}
