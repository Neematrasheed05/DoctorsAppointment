
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

// POST - Verify patient identity for self-service
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { fullName, dateOfBirth } = data;

    if (!fullName || !dateOfBirth) {
      return NextResponse.json(
        { error: 'Full name and date of birth are required' },
        { status: 400 }
      );
    }

    const patient = await prisma.patient.findFirst({
      where: {
        fullName: {
          equals: fullName,
          mode: 'insensitive',
        },
        dateOfBirth: new Date(dateOfBirth),
      },
      include: {
        appointments: {
          where: {
            status: {
              in: ['PENDING', 'CONFIRMED'],
            },
          },
          orderBy: {
            appointmentDate: 'asc',
          },
        },
      },
    });

    if (!patient) {
      return NextResponse.json(
        { error: 'No matching patient record found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ patient });
  } catch (error) {
    console.error('Error looking up patient:', error);
    return NextResponse.json(
      { error: 'Failed to look up patient' },
      { status: 500 }
    );
  }
}
