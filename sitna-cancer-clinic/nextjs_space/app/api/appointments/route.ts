
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import {
  formatPhoneNumber,
  generateLocationSlots,
  getLocationByName,
  getLocationsForDate,
  isValidEmail,
  isValidPhone,
} from '@/lib/utils';

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

// GET - Fetch appointments (admin only)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const date = searchParams.get('date');
    const patientId = searchParams.get('patientId');

    let where: any = {};

    if (status) {
      where.status = status;
    }

    if (date) {
      const targetDate = new Date(date);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      where.appointmentDate = {
        gte: targetDate,
        lt: nextDay,
      };
    }

    if (patientId) {
      where.patientId = patientId;
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: true,
      },
      orderBy: [
        { appointmentDate: 'asc' },
        { appointmentTime: 'asc' },
      ],
    });

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

// POST - Create new appointment
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const {
      fullName,
      dateOfBirth,
      phone,
      email,
      reasonForVisit,
      appointmentDate,
      appointmentTime,
      location,
      reminderConsent = false,
    } = data;

    // Validation
    if (!fullName || !dateOfBirth || !phone || !reasonForVisit || !appointmentDate || !appointmentTime || !location) {
      return NextResponse.json(
        { error: 'Missing required fields (location is required)' },
        { status: 400 }
      );
    }

    if (!isValidPhone(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    if (email && !isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate location
    const locationSchedule = getLocationByName(location);
    if (!locationSchedule) {
      return NextResponse.json(
        { error: `Invalid location: ${location}` },
        { status: 400 }
      );
    }

    const formattedPhone = formatPhoneNumber(phone);
    const dobDate = new Date(dateOfBirth);
    const apptDate = new Date(appointmentDate);

    // Validate location is open on this date (right weekday)
    const openLocations = getLocationsForDate(apptDate);
    if (!openLocations.find((l) => l.id === locationSchedule.id)) {
      return NextResponse.json(
        { error: `${locationSchedule.name} is not open on the selected date` },
        { status: 400 }
      );
    }

    // Validate time slot falls within this location's schedule
    const validSlots = generateLocationSlots(locationSchedule);
    if (!validSlots.includes(appointmentTime)) {
      return NextResponse.json(
        { error: `Invalid time slot for ${locationSchedule.name}. Hours: ${locationSchedule.timeRangeLabel}` },
        { status: 400 }
      );
    }

    // Check if appointment slot is available at this specific location
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        appointmentDate: apptDate,
        appointmentTime,
        location: locationSchedule.name,
        status: {
          not: 'CANCELLED',
        },
      },
    });

    if (existingAppointment) {
      return NextResponse.json(
        { error: 'This time slot is not available at this location' },
        { status: 400 }
      );
    }

    // Create or find patient
    let patient = await prisma.patient.findFirst({
      where: {
        fullName,
        dateOfBirth: dobDate,
        phone: formattedPhone,
      },
    });

    if (!patient) {
      patient = await prisma.patient.create({
        data: {
          fullName,
          dateOfBirth: dobDate,
          phone: formattedPhone,
          email: email || null,
        },
      });
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        patientId: patient.id,
        fullName,
        dateOfBirth: dobDate,
        phone: formattedPhone,
        email: email || null,
        reasonForVisit,
        appointmentDate: apptDate,
        appointmentTime,
        location: locationSchedule.name,
        reminderConsent,
        paymentInstructions: 'Please contact the clinic at 0717333452 for payment details.',
      },
      include: {
        patient: true,
      },
    });

    return NextResponse.json({ 
      appointment,
      message: 'Appointment booked successfully' 
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
}
