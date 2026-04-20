import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

// GET - fetch all unavailability entries (public for booking, filtered by future dates)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeAll = searchParams.get('all') === 'true';

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const unavailability = await prisma.doctorUnavailability.findMany({
      where: includeAll ? {} : { endDate: { gte: today } },
      orderBy: { startDate: 'asc' },
    });

    return NextResponse.json({ unavailability });
  } catch (error) {
    console.error('Error fetching unavailability:', error);
    return NextResponse.json(
      { error: 'Failed to fetch unavailability' },
      { status: 500 }
    );
  }
}

// POST - create a new unavailability entry (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { startDate, endDate, reason } = data;

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    if (end < start) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    const entry = await prisma.doctorUnavailability.create({
      data: {
        startDate: start,
        endDate: end,
        reason: reason || null,
      },
    });

    return NextResponse.json({ entry, message: 'Unavailability added successfully' });
  } catch (error) {
    console.error('Error creating unavailability:', error);
    return NextResponse.json(
      { error: 'Failed to create unavailability entry' },
      { status: 500 }
    );
  }
}
