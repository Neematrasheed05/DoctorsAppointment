import { Router, Request, Response } from 'express';
import { prisma } from '../lib/db';

const router = Router();

// GET /api/patients
router.get('/', async (req: Request, res: Response) => {
  try {
    const { id, search, phone, dob } = req.query as Record<string, string>;

    if (id) {
      const patientRaw = await prisma.patient.findUnique({
        where: { id },
        include: { appointments: { orderBy: { appointmentDate: 'desc' } } },
      });
      if (!patientRaw) return res.status(404).json({ error: 'Patient not found' });

      const patient = {
        id: patientRaw.id,
        fullName: patientRaw.fullName,
        phone: patientRaw.phone,
        email: patientRaw.email,
        dateOfBirth: patientRaw.dateOfBirth?.toISOString(),
        appointments: patientRaw.appointments.length,
        lastVisit: patientRaw.appointments[0]?.appointmentDate?.toISOString() || null,
        appointmentsList: patientRaw.appointments.map((apt) => ({
          id: apt.id,
          date: apt.appointmentDate.toISOString(),
          time: apt.appointmentTime,
          service: apt.reasonForVisit,
          status: apt.status,
          notes: apt.notes || '',
        })),
      };
      return res.json({ patient });
    }

    let where: any = {};
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (phone && dob) {
      where = { phone, dateOfBirth: new Date(dob) };
    }

    const patientsRaw = await prisma.patient.findMany({
      where,
      include: { appointments: { orderBy: { appointmentDate: 'desc' } } },
      orderBy: { fullName: 'asc' },
    });

    const patients = patientsRaw.map((p) => ({
      id: p.id,
      fullName: p.fullName,
      phone: p.phone,
      email: p.email,
      dateOfBirth: p.dateOfBirth?.toISOString(),
      appointments: p.appointments.length,
      lastVisit: p.appointments[0]?.appointmentDate?.toISOString() || null,
    }));

    res.json({ patients });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

// POST /api/patients
router.post('/', async (req: Request, res: Response) => {
  try {
    const { fullName, dateOfBirth, phone, email } = req.body;
    const patient = await prisma.patient.create({
      data: { fullName, dateOfBirth: new Date(dateOfBirth), phone, email: email || null },
    });
    res.json({ patient });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create patient' });
  }
});

export default router;
