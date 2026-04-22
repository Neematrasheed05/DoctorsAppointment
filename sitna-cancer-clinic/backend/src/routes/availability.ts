import { Router, Request, Response } from 'express';
import { prisma } from '../lib/db';
import {
  generateLocationSlots,
  getLocationById,
  getLocationsForDate,
  hasAnyLocationOpen,
} from '../lib/utils';

const router = Router();

// GET /api/availability
router.get('/', async (req: Request, res: Response) => {
  try {
    const { date: dateParam, location: locationParam } = req.query as Record<string, string>;

    if (!dateParam) {
      return res.json({
        availability: [
          { day: 'Monday', enabled: true, startTime: '10:00', endTime: '18:00' },
          { day: 'Tuesday', enabled: true, startTime: '10:00', endTime: '13:00' },
          { day: 'Wednesday', enabled: false, startTime: '00:00', endTime: '00:00' },
          { day: 'Thursday', enabled: true, startTime: '14:00', endTime: '18:00' },
          { day: 'Friday', enabled: true, startTime: '10:00', endTime: '13:00' },
          { day: 'Saturday', enabled: false, startTime: '00:00', endTime: '00:00' },
          { day: 'Sunday', enabled: false, startTime: '00:00', endTime: '00:00' },
        ],
      });
    }

    const requestedDate = new Date(dateParam);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (requestedDate < today) {
      return res.json({ availableSlots: [], locations: [], message: 'Cannot book for past dates' });
    }

    if (!hasAnyLocationOpen(requestedDate)) {
      return res.json({ availableSlots: [], locations: [], message: 'Clinic is closed on this day' });
    }

    const unavailability = await prisma.doctorUnavailability.findFirst({
      where: { startDate: { lte: requestedDate }, endDate: { gte: requestedDate } },
    });
    if (unavailability) {
      return res.json({
        availableSlots: [], locations: [], isUnavailable: true,
        message: unavailability.reason ? `Dr. Sitna is unavailable: ${unavailability.reason}` : 'Dr. Sitna is unavailable on this date',
      });
    }

    let locationsForDay = getLocationsForDate(requestedDate);
    if (locationParam) {
      const requested = getLocationById(locationParam);
      if (!requested) return res.status(400).json({ error: `Unknown location id: ${locationParam}` });
      locationsForDay = locationsForDay.filter((l) => l.id === requested.id);
      if (locationsForDay.length === 0) {
        return res.json({ availableSlots: [], locations: [], message: `${requested.name} is not open on this day` });
      }
    }

    const bookedAppointments = await prisma.appointment.findMany({
      where: { appointmentDate: requestedDate, status: { not: 'CANCELLED' } },
      select: { appointmentTime: true, location: true },
    });

    const blockedSlots = await prisma.availabilitySlot.findMany({
      where: { date: requestedDate, isBlocked: true },
      select: { startTime: true },
    });
    const blockedTimes = blockedSlots.map((s) => s.startTime);

    const locations = locationsForDay.map((loc) => {
      const allSlots = generateLocationSlots(loc);
      const bookedTimesForLoc = bookedAppointments
        .filter((apt) => apt.location === loc.name)
        .map((apt) => apt.appointmentTime);

      const slots = allSlots
        .filter((t) => !bookedTimesForLoc.includes(t))
        .filter((t) => !blockedTimes.includes(t))
        .map((t) => ({ time: t, available: true }));

      return { id: loc.id, name: loc.name, fullName: loc.fullName, address: loc.address, slots };
    });

    const availableSlots = locations.flatMap((l) =>
      l.slots.map((s) => ({ time: s.time, available: s.available, location: l.name }))
    );

    res.json({ availableSlots, locations, date: dateParam });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check availability' });
  }
});

// POST /api/availability  (block/unblock a slot)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { date, startTime, endTime, reason, isBlocked = true, availability } = req.body;

    if (availability && Array.isArray(availability)) {
      return res.json({ success: true, message: 'Availability settings saved', availability });
    }

    if (!date || !startTime) return res.status(400).json({ error: 'Date and start time are required' });

    const slot = await prisma.availabilitySlot.upsert({
      where: { date_startTime: { date: new Date(date), startTime } },
      update: { isBlocked, reason: reason || null },
      create: { date: new Date(date), startTime, endTime: endTime || startTime, isBlocked, reason: reason || null },
    });

    res.json({ slot, message: `Time slot ${isBlocked ? 'blocked' : 'unblocked'} successfully` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to manage availability' });
  }
});

export default router;
