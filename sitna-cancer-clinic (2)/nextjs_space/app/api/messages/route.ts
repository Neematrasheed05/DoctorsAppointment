
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { formatPhoneNumber, isValidEmail } from '@/lib/utils';

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

// GET - Fetch messages (admin only)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let where: any = {};

    if (status) {
      where.status = status;
    }

    const messages = await prisma.patientMessage.findMany({
      where,
      include: {
        patient: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST - Create new message
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { fullName, phone, email, subject, message } = data;

    if (!fullName || !phone || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (email && !isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const formattedPhone = formatPhoneNumber(phone);

    // Try to find existing patient
    const patient = await prisma.patient.findFirst({
      where: {
        phone: formattedPhone,
      },
    });

    const newMessage = await prisma.patientMessage.create({
      data: {
        patientId: patient?.id || null,
        fullName,
        phone: formattedPhone,
        email: email || null,
        subject,
        message,
      },
      include: {
        patient: true,
      },
    });

    return NextResponse.json({
      message: newMessage,
      success: 'Message sent successfully',
    });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
