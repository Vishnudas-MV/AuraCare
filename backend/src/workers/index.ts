import { chartSummaryWorker } from './chartSummaryWorker';
import { logger } from '../utils/logger.util';
import { redisClient, redisPublisher, redisSubscriber } from '../lib/redis';

logger.info('🚀 AuraCare Background Workers initiated.');
logger.info('Listening for BullMQ jobs on chart-summary-queue...');

async function gracefulWorkerShutdown(signal: string) {
  logger.info(`Received ${signal}. Gracefully stopping background workers...`);
  try {
    await chartSummaryWorker.close();
    await Promise.all([
      redisClient.quit(),
      redisPublisher.quit(),
      redisSubscriber.quit(),
    ]);
    logger.info('Background workers and Redis connections closed cleanly.');
    process.exit(0);
  } catch (err) {
    logger.error('Error during worker graceful shutdown:', { error: String(err) });
    process.exit(1);
  }
}

process.on('SIGTERM', () => gracefulWorkerShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulWorkerShutdown('SIGINT'));
