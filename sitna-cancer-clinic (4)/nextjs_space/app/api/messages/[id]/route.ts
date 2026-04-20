
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

// PATCH - Update message status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const { status } = data;

    const message = await prisma.patientMessage.update({
      where: {
        id: params.id,
      },
      data: {
        status: status,
      },
    });

    return NextResponse.json({
      message,
      success: 'Message status updated successfully',
    });
  } catch (error) {
    console.error('Error updating message status:', error);
    return NextResponse.json(
      { error: 'Failed to update message status' },
      { status: 500 }
    );
  }
}

// PUT - Update message (mark as read, respond)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const { status, response, respondedBy } = data;

    let updateData: any = {};

    if (status) updateData.status = status;
    if (response) {
      updateData.response = response;
      updateData.respondedBy = respondedBy;
      updateData.respondedAt = new Date();
      updateData.status = 'RESPONDED';
    }

    const message = await prisma.patientMessage.update({
      where: {
        id: params.id,
      },
      data: updateData,
      include: {
        patient: true,
      },
    });

    return NextResponse.json({
      message,
      success: 'Message updated successfully',
    });
  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json(
      { error: 'Failed to update message' },
      { status: 500 }
    );
  }
}

// DELETE - Delete message
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.patientMessage.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({
      success: 'Message deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    );
  }
}
