import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

// DELETE - remove an unavailability entry (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await prisma.doctorUnavailability.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Unavailability entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting unavailability:', error);
    return NextResponse.json(
      { error: 'Failed to delete unavailability entry' },
      { status: 500 }
    );
  }
}

// PUT - update an unavailability entry (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const data = await request.json();
    const { startDate, endDate, reason } = data;

    const updateData: Record<string, unknown> = {};
    if (startDate) {
      const s = new Date(startDate);
      s.setHours(0, 0, 0, 0);
      updateData.startDate = s;
    }
    if (endDate) {
      const e = new Date(endDate);
      e.setHours(0, 0, 0, 0);
      updateData.endDate = e;
    }
    if (reason !== undefined) updateData.reason = reason || null;

    const entry = await prisma.doctorUnavailability.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ entry, message: 'Unavailability updated successfully' });
  } catch (error) {
    console.error('Error updating unavailability:', error);
    return NextResponse.json(
      { error: 'Failed to update unavailability entry' },
      { status: 500 }
    );
  }
}
