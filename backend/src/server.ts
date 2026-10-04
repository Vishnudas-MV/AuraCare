import http from 'http';
import { createApp } from './app';
import { env } from './config/env.config';
import { pool, verifyDbConnection } from './database/pool';
import { initializeRedis, redisClient, redisPublisher, redisSubscriber } from './lib/redis';
import { chartSummaryQueue } from './lib/bullmq';
import { logger } from './utils/logger.util';

async function bootstrap() {
  logger.info(`Starting AuraCare Backend in [${env.NODE_ENV}] mode...`);

  // 1. Initialize Redis connection pool
  await initializeRedis();

  // 2. Verify PostgreSQL Database connectivity
  await verifyDbConnection();

  // 3. Build Express application instance
  const app = createApp();
  const server = http.createServer(app);

  server.listen(env.PORT, () => {
    logger.info(`⚡ AuraCare Enterprise Server is listening on http://localhost:${env.PORT}`);
    logger.info(`📋 API Version: /api/${env.API_VERSION}`);
  });

  // Graceful Shutdown Handler
  async function gracefulShutdown(signal: string) {
    logger.info(`Received ${signal}. Initiating graceful shutdown sequence...`);

    // Stop accepting new connections
    server.close(async () => {
      logger.info('HTTP server closed.');

      try {
        // Close BullMQ Queues
        await chartSummaryQueue.close();
        logger.info('BullMQ queues closed.');

        // Disconnect Redis Clients
        await Promise.all([
          redisClient.quit().catch(() => {}),
          redisPublisher.quit().catch(() => {}),
          redisSubscriber.quit().catch(() => {}),
        ]);
        logger.info('Redis connections cleanly disconnected.');

        // Drain PostgreSQL Pool
        await pool.end();
        logger.info('PostgreSQL connection pool drained.');

        logger.info('AuraCare Backend successfully terminated.');
        process.exit(0);
      } catch (err: unknown) {
        logger.error('Error encountered during graceful shutdown:', { error: String(err) });
        process.exit(1);
      }
    });

    // Forced shutdown timer if graceful exit hangs
    setTimeout(() => {
      logger.error('Shutdown timed out after 10s. Forcing process exit.');
      process.exit(1);
    }, 10000);
  }

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Catch unexpected unhandled rejections
  process.on('unhandledRejection', (reason: unknown) => {
    logger.error('Unhandled Promise Rejection detected:', { reason: String(reason) });
  });

  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception detected:', { error: error.message, stack: error.stack });
    process.exit(1);
  });
}

bootstrap().catch((err) => {
  logger.error('Fatal failure during AuraCare startup bootstrap:', { error: String(err) });
  process.exit(1);
});
