import { Router, Request, Response } from 'express';
import { prisma } from '../lib/db';
import { formatPhoneNumber, isValidEmail } from '../lib/utils';

const router = Router();

// GET /api/messages
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status } = req.query as Record<string, string>;
    const where: any = {};
    if (status) where.status = status;

    const messages = await prisma.patientMessage.findMany({
      where,
      include: { patient: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ messages });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// POST /api/messages
router.post('/', async (req: Request, res: Response) => {
  try {
    const { fullName, phone, email, subject, message } = req.body;

    if (!fullName || !phone || !subject || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (email && !isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const formattedPhone = formatPhoneNumber(phone);
    const patient = await prisma.patient.findFirst({ where: { phone: formattedPhone } });

    const newMessage = await prisma.patientMessage.create({
      data: {
        patientId: patient?.id || null,
        fullName, phone: formattedPhone,
        email: email || null, subject, message,
      },
      include: { patient: true },
    });

    res.json({ message: newMessage, success: 'Message sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// PATCH /api/messages/:id
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const message = await prisma.patientMessage.update({
      where: { id: req.params.id },
      data: { status },
    });
    res.json({ message, success: 'Message status updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update message status' });
  }
});

// PUT /api/messages/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { status, response, respondedBy } = req.body;
    const updateData: any = {};
    if (status) updateData.status = status;
    if (response) {
      updateData.response = response;
      updateData.respondedBy = respondedBy;
      updateData.respondedAt = new Date();
      updateData.status = 'RESPONDED';
    }

    const message = await prisma.patientMessage.update({
      where: { id: req.params.id },
      data: updateData,
      include: { patient: true },
    });
    res.json({ message, success: 'Message updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update message' });
  }
});

// DELETE /api/messages/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.patientMessage.delete({ where: { id: req.params.id } });
    res.json({ success: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

export default router;
