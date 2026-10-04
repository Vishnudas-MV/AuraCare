import { Queue, QueueEvents, ConnectionOptions } from 'bullmq';
import { env } from '../config/env.config';
import { logger } from '../utils/logger.util';

export const QUEUE_NAME_CHART_SUMMARY = 'chart-summary-queue';

export interface ChartSummaryJobData {
  patientId: string;
  encounterId: string;
  noteId: string;
  tenantId: string;
  rawText: string;
  requestedByUserId?: string;
}

export interface ChartSummaryJobResult {
  noteId: string;
  status: 'COMPLETED' | 'FAILED';
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  errorMessage?: string;
  processedAt: string;
}

export const bullmqConnectionConfig: ConnectionOptions = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
  tls: env.REDIS_TLS ? {} : undefined,
  maxRetriesPerRequest: null,
};

export const chartSummaryQueue = new Queue<ChartSummaryJobData, ChartSummaryJobResult>(
  QUEUE_NAME_CHART_SUMMARY,
  {
    connection: bullmqConnectionConfig,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: {
        count: 500,
        age: 3600 * 24, // Keep 1 day
      },
      removeOnFail: {
        count: 1000,
        age: 3600 * 24 * 7, // Keep 7 days for audit/investigation
      },
    },
  }
);

export const chartSummaryQueueEvents = new QueueEvents(QUEUE_NAME_CHART_SUMMARY, {
  connection: bullmqConnectionConfig,
});

chartSummaryQueue.on('error', (err) => {
  logger.error('BullMQ Chart Summary Queue Error:', { error: err.message });
});

export async function addChartSummaryJob(
  data: ChartSummaryJobData
): Promise<string> {
  const job = await chartSummaryQueue.add('summarize-transcript', data, {
    jobId: `summary-${data.noteId}`,
  });
  logger.info(`BullMQ Job queued: summarize-transcript`, {
    jobId: job.id,
    noteId: data.noteId,
    tenantId: data.tenantId,
  });
  return job.id as string;
}
