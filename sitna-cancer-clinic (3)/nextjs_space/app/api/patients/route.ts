
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

// GET - Search patients or get individual patient details
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const search = searchParams.get('search');
    const phone = searchParams.get('phone');
    const dob = searchParams.get('dob');

    // If ID is provided, return single patient with full details
    if (id) {
      const patientRaw = await prisma.patient.findUnique({
        where: { id },
        include: {
          appointments: {
            orderBy: {
              appointmentDate: 'desc',
            },
          },
        },
      });

      if (!patientRaw) {
        return NextResponse.json(
          { error: 'Patient not found' },
          { status: 404 }
        );
      }

      const patient = {
        id: patientRaw.id,
        fullName: patientRaw.fullName,
        phone: patientRaw.phone,
        email: patientRaw.email,
        dateOfBirth: patientRaw.dateOfBirth?.toISOString(),
        appointments: patientRaw.appointments.length,
        lastVisit: patientRaw.appointments[0]?.appointmentDate?.toISOString() || new Date().toISOString(),
        appointmentsList: patientRaw.appointments.map(apt => ({
          id: apt.id,
          date: apt.appointmentDate.toISOString(),
          time: apt.appointmentTime,
          service: apt.reasonForVisit,
          status: apt.status,
          symptoms: apt.notes || '',
        })),
      };

      return NextResponse.json({ patient });
    }

    // Otherwise, return list of patients
    let where: any = {};

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (phone && dob) {
      // For patient verification
      where = {
        phone: phone,
        dateOfBirth: new Date(dob),
      };
    }

    const patientsRaw = await prisma.patient.findMany({
      where,
      include: {
        appointments: {
          orderBy: {
            appointmentDate: 'desc',
          },
        },
      },
      orderBy: {
        fullName: 'asc',
      },
    });

    // Format patients for frontend
    const patients = patientsRaw.map(patient => ({
      id: patient.id,
      fullName: patient.fullName,
      phone: patient.phone,
      email: patient.email,
      dateOfBirth: patient.dateOfBirth?.toISOString(),
      appointments: patient.appointments.length,
      lastVisit: patient.appointments[0]?.appointmentDate?.toISOString() || new Date().toISOString(),
    }));

    return NextResponse.json({ patients });
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patients' },
      { status: 500 }
    );
  }
}

// POST - Create new patient
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { fullName, dateOfBirth, phone, email } = data;

    const patient = await prisma.patient.create({
      data: {
        fullName,
        dateOfBirth: new Date(dateOfBirth),
        phone,
        email: email || null,
      },
    });

    return NextResponse.json({ patient });
  } catch (error) {
    console.error('Error creating patient:', error);
    return NextResponse.json(
      { error: 'Failed to create patient' },
      { status: 500 }
    );
  }
}
