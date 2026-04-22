import { Router, Request, Response } from 'express';
import { prisma } from '../lib/db';

const router = Router();

// GET /api/unavailability
router.get('/', async (req: Request, res: Response) => {
  try {
    const includeAll = req.query.all === 'true';
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const unavailability = await prisma.doctorUnavailability.findMany({
      where: includeAll ? {} : { endDate: { gte: today } },
      orderBy: { startDate: 'asc' },
    });

    res.json({ unavailability });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch unavailability' });
  }
});

// POST /api/unavailability
router.post('/', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, reason } = req.body;
    if (!startDate || !endDate) return res.status(400).json({ error: 'Start and end date are required' });

    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    if (end < start) return res.status(400).json({ error: 'End date must be after start date' });

    const entry = await prisma.doctorUnavailability.create({
      data: { startDate: start, endDate: end, reason: reason || null },
    });

    res.json({ entry, message: 'Unavailability added successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create unavailability entry' });
  }
});

// DELETE /api/unavailability/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.doctorUnavailability.delete({ where: { id: req.params.id } });
    res.json({ message: 'Unavailability entry deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete unavailability entry' });
  }
});

export default router;
