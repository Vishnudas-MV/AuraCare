import Redis, { RedisOptions } from 'ioredis';
import { RedisStore } from 'connect-redis';
import session from 'express-session';
import { env } from '../config/env.config';
import { logger } from '../utils/logger.util';

const redisOptions: RedisOptions = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
  tls: env.REDIS_TLS ? {} : undefined,
  maxRetriesPerRequest: null, // Required by BullMQ
  enableReadyCheck: true,
  lazyConnect: true,
  retryStrategy(times) {
    const delay = Math.min(times * 100, 3000);
    logger.warn(`Redis reconnecting, attempt #${times}, delay: ${delay}ms`);
    return delay;
  },
};

// 1. Primary Redis Client (General purpose & caching)
export const redisClient = new Redis(redisOptions);

// 2. Dedicated Subscriber Client (For Redis Pub/Sub events)
export const redisSubscriber = new Redis(redisOptions);

// 3. Dedicated Publisher Client (For Redis Pub/Sub events)
export const redisPublisher = new Redis(redisOptions);

redisClient.on('connect', () => logger.info('Redis client connected'));
redisClient.on('ready', () => logger.info('Redis client ready for operations'));
redisClient.on('error', (err) => logger.error('Redis Client Error', { error: err.message }));

redisSubscriber.on('error', (err) => logger.error('Redis Subscriber Error', { error: err.message }));
redisPublisher.on('error', (err) => logger.error('Redis Publisher Error', { error: err.message }));

/**
 * Connect all Redis instances asynchronously at app boot
 */
export async function initializeRedis(): Promise<void> {
  try {
    await Promise.all([
      redisClient.connect().catch((err) => {
        logger.warn('Redis primary connect skipped/deferred:', { error: err.message });
      }),
      redisSubscriber.connect().catch((err) => {
        logger.warn('Redis subscriber connect skipped/deferred:', { error: err.message });
      }),
      redisPublisher.connect().catch((err) => {
        logger.warn('Redis publisher connect skipped/deferred:', { error: err.message });
      }),
    ]);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    logger.error('Failed to initialize Redis connections', { error: errorMsg });
  }
}

/**
 * Express session store configured with connect-redis
 */
export function createSessionStore(): session.Store {
  return new RedisStore({
    client: redisClient,
    prefix: 'auracare:sess:',
    ttl: 86400, // 24 hours in seconds
  });
}

/**
 * Cache Utilities for Static Clinical Data and Session/Permission Lookups
 */

export async function getFromCache<T = unknown>(key: string): Promise<T | null> {
  try {
    const data = await redisClient.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch (err) {
    logger.error(`Error reading key from cache: ${key}`, { error: String(err) });
    return null;
  }
}

export async function setInCache(
  key: string,
  value: unknown,
  ttlSeconds: number = 3600
): Promise<void> {
  try {
    const serialized = JSON.stringify(value);
    await redisClient.setex(key, ttlSeconds, serialized);
  } catch (err) {
    logger.error(`Error writing key to cache: ${key}`, { error: String(err) });
  }
}

export async function deleteFromCache(key: string): Promise<void> {
  try {
    await redisClient.del(key);
  } catch (err) {
    logger.error(`Error deleting key from cache: ${key}`, { error: String(err) });
  }
}

export async function setHashCache(
  hashKey: string,
  field: string,
  value: unknown
): Promise<void> {
  try {
    const serialized = JSON.stringify(value);
    await redisClient.hset(hashKey, field, serialized);
  } catch (err) {
    logger.error(`Error setting hash field: ${hashKey}.${field}`, { error: String(err) });
  }
}

export async function getHashCache<T = unknown>(
  hashKey: string,
  field: string
): Promise<T | null> {
  try {
    const data = await redisClient.hget(hashKey, field);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch (err) {
    logger.error(`Error getting hash field: ${hashKey}.${field}`, { error: String(err) });
    return null;
  }
}

/**
 * Redis Pub/Sub helper
 */
export async function publishEvent(channel: string, payload: unknown): Promise<void> {
  try {
    const message = JSON.stringify(payload);
    await redisPublisher.publish(channel, message);
  } catch (err) {
    logger.error(`Error publishing event on channel: ${channel}`, { error: String(err) });
  }
}
