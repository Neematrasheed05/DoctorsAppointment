import { Router, Request, Response } from 'express';
import { prisma } from '../lib/db';

const router = Router();

// GET /api/dashboard/stats
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const oneWeekFromNow = new Date(today);
    oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);

    const [
      totalAppointments, pendingAppointments, todayAppointments,
      upcomingAppointments, totalPatients, unreadMessages,
      completedAppointments, cancelledAppointments,
    ] = await Promise.all([
      prisma.appointment.count(),
      prisma.appointment.count({ where: { status: 'PENDING' } }),
      prisma.appointment.count({ where: { appointmentDate: { gte: today, lt: tomorrow }, status: { not: 'CANCELLED' } } }),
      prisma.appointment.count({ where: { appointmentDate: { gte: today, lt: oneWeekFromNow }, status: { not: 'CANCELLED' } } }),
      prisma.patient.count(),
      prisma.patientMessage.count({ where: { status: 'UNREAD' } }),
      prisma.appointment.count({ where: { status: 'COMPLETED' } }),
      prisma.appointment.count({ where: { status: 'CANCELLED' } }),
    ]);

    const recentAppointments = await prisma.appointment.findMany({
      take: 5,
      include: { patient: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      stats: {
        totalAppointments, pendingAppointments, todayAppointments,
        upcomingAppointments, totalPatients, unreadMessages,
        completedAppointments, cancelledAppointments,
      },
      recentAppointments,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

export default router;
