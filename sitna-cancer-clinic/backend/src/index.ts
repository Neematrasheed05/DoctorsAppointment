import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import appointmentsRouter from './routes/appointments';
import patientsRouter from './routes/patients';
import messagesRouter from './routes/messages';
import availabilityRouter from './routes/availability';
import authRouter from './routes/auth';
import unavailabilityRouter from './routes/unavailability';
import dashboardRouter from './routes/dashboard';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/appointments', appointmentsRouter);
app.use('/api/patients', patientsRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/availability', availabilityRouter);
app.use('/api/auth', authRouter);
app.use('/api/unavailability', unavailabilityRouter);
app.use('/api/dashboard', dashboardRouter);

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
