import { Router, Request, Response } from 'express';
import { prisma } from '../lib/db';
import {
  formatPhoneNumber,
  generateLocationSlots,
  getLocationByName,
  getLocationsForDate,
  isValidEmail,
  isValidPhone,
} from '../lib/utils';

const router = Router();

// GET /api/appointments
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, date, patientId } = req.query as Record<string, string>;
    const where: any = {};

    if (status) where.status = status;
    if (date) {
      const targetDate = new Date(date);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      where.appointmentDate = { gte: targetDate, lt: nextDay };
    }
    if (patientId) where.patientId = patientId;

    const appointments = await prisma.appointment.findMany({
      where,
      include: { patient: true },
      orderBy: [{ appointmentDate: 'asc' }, { appointmentTime: 'asc' }],
    });

    res.json({ appointments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// GET /api/appointments/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: req.params.id },
      include: { patient: true },
    });
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    res.json({ appointment });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch appointment' });
  }
});

// POST /api/appointments
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      fullName, dateOfBirth, phone, email, reasonForVisit,
      appointmentDate, appointmentTime, location, reminderConsent = false,
    } = req.body;

    if (!fullName || !dateOfBirth || !phone || !reasonForVisit || !appointmentDate || !appointmentTime || !location) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (!isValidPhone(phone)) return res.status(400).json({ error: 'Invalid phone number format' });
    if (email && !isValidEmail(email)) return res.status(400).json({ error: 'Invalid email format' });

    const locationSchedule = getLocationByName(location);
    if (!locationSchedule) return res.status(400).json({ error: `Invalid location: ${location}` });

    const formattedPhone = formatPhoneNumber(phone);
    const dobDate = new Date(dateOfBirth);
    const apptDate = new Date(appointmentDate);

    const openLocations = getLocationsForDate(apptDate);
    if (!openLocations.find((l) => l.id === locationSchedule.id)) {
      return res.status(400).json({ error: `${locationSchedule.name} is not open on the selected date` });
    }

    const validSlots = generateLocationSlots(locationSchedule);
    if (!validSlots.includes(appointmentTime)) {
      return res.status(400).json({ error: `Invalid time slot for ${locationSchedule.name}` });
    }

    const existingAppointment = await prisma.appointment.findFirst({
      where: { appointmentDate: apptDate, appointmentTime, location: locationSchedule.name, status: { not: 'CANCELLED' } },
    });
    if (existingAppointment) return res.status(400).json({ error: 'This time slot is not available' });

    let patient = await prisma.patient.findFirst({
      where: { fullName, dateOfBirth: dobDate, phone: formattedPhone },
    });
    if (!patient) {
      patient = await prisma.patient.create({
        data: { fullName, dateOfBirth: dobDate, phone: formattedPhone, email: email || null },
      });
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId: patient.id, fullName, dateOfBirth: dobDate,
        phone: formattedPhone, email: email || null, reasonForVisit,
        appointmentDate: apptDate, appointmentTime, location: locationSchedule.name,
        reminderConsent, paymentInstructions: 'Please contact the clinic at 0717333452 for payment details.',
      },
      include: { patient: true },
    });

    res.json({ appointment, message: 'Appointment booked successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

// PATCH /api/appointments/:id
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { status, notes, appointmentDate, appointmentTime } = req.body;
    const updateData: any = {};

    if (status) {
      if (!['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW', 'RESCHEDULED'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status value' });
      }
      updateData.status = status;
    }
    if (notes !== undefined) updateData.notes = notes;
    if (appointmentDate) updateData.appointmentDate = new Date(appointmentDate);
    if (appointmentTime) updateData.appointmentTime = appointmentTime;

    const appointment = await prisma.appointment.update({
      where: { id: req.params.id },
      data: updateData,
      include: { patient: true },
    });

    res.json({ appointment, message: 'Appointment updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

// DELETE /api/appointments/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.appointment.delete({ where: { id: req.params.id } });
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete appointment' });
  }
});

export default router;
