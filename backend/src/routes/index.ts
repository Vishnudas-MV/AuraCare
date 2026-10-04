import { Router, Request, Response } from 'express';
import authRouter from '../features/auth/auth.routes';
import patientRouter from '../features/patients/patient.routes';
import chartRouter from '../features/charts/chart.routes';
import { pool } from '../database/pool';
import { redisClient } from '../lib/redis';
import { chartSummaryQueue } from '../lib/bullmq';

const router = Router();

/**
 * Health check & readiness probe for Kubernetes / cloud orchestrators
 */
router.get('/health', async (_req: Request, res: Response) => {
  let dbStatus = 'healthy';
  let redisStatus = 'healthy';
  let bullmqStatus = 'healthy';

  try {
    await pool.query('SELECT 1');
  } catch {
    dbStatus = 'unreachable';
  }

  try {
    const ping = await redisClient.ping();
    if (ping !== 'PONG') redisStatus = 'degraded';
  } catch {
    redisStatus = 'unreachable';
  }

  try {
    const jobCounts = await chartSummaryQueue.getJobCounts();
    if (!jobCounts) bullmqStatus = 'degraded';
  } catch {
    bullmqStatus = 'unreachable';
  }

  const isHealthy = dbStatus === 'healthy' && redisStatus === 'healthy';

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    services: {
      database: dbStatus,
      redis: redisStatus,
      bullmq: bullmqStatus,
    },
    uptime: process.uptime(),
  });
});

// Feature routes mounted under /api/v1/...
router.use('/auth', authRouter);
router.use('/patients', patientRouter);
router.use('/charts', chartRouter);

export default router;
