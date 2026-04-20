
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const oneWeekFromNow = new Date(today);
    oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);

    // Get various statistics
    const [
      totalAppointments,
      pendingAppointments,
      todayAppointments,
      upcomingAppointments,
      totalPatients,
      unreadMessages,
      completedAppointments,
      cancelledAppointments,
    ] = await Promise.all([
      prisma.appointment.count(),
      prisma.appointment.count({
        where: { status: 'PENDING' }
      }),
      prisma.appointment.count({
        where: {
          appointmentDate: {
            gte: today,
            lt: tomorrow,
          },
          status: { not: 'CANCELLED' }
        }
      }),
      prisma.appointment.count({
        where: {
          appointmentDate: {
            gte: today,
            lt: oneWeekFromNow,
          },
          status: { not: 'CANCELLED' }
        }
      }),
      prisma.patient.count(),
      prisma.patientMessage.count({
        where: { status: 'UNREAD' }
      }),
      prisma.appointment.count({
        where: { status: 'COMPLETED' }
      }),
      prisma.appointment.count({
        where: { status: 'CANCELLED' }
      }),
    ]);

    // Get recent appointments
    const recentAppointments = await prisma.appointment.findMany({
      take: 5,
      include: {
        patient: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      stats: {
        totalAppointments,
        pendingAppointments,
        todayAppointments,
        upcomingAppointments,
        totalPatients,
        unreadMessages,
        completedAppointments,
        cancelledAppointments,
      },
      recentAppointments,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
