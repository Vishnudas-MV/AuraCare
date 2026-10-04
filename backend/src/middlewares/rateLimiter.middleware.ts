import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../lib/redis';
import { logger } from '../utils/logger.util';

export interface RateLimiterOptions {
  windowMs?: number; // Time window in milliseconds (default: 60s)
  max?: number;      // Max allowed requests in the sliding window (default: 100)
}

/**
 * Enterprise Redis-Backed Sliding Window Rate Limiter
 * Uses Redis Sorted Sets (ZADD/ZREMRANGEBYSCORE/ZCARD) to accurately calculate
 * request frequency over a moving sliding time window.
 */
export function createRateLimiter(options: RateLimiterOptions = {}) {
  const windowMs = options.windowMs || 60 * 1000;
  const maxRequests = options.max || 120;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Identifier combines tenant and IP address (or fallback IP)
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    const tenantIdentifier = req.tenant?.tenantId || 'global';
    const key = `ratelimit:${tenantIdentifier}:${clientIp}`;

    const now = Date.now();
    const clearBefore = now - windowMs;

    try {
      const pipeline = redisClient.pipeline();
      // 1. Remove timestamps older than the sliding window
      pipeline.zremrangebyscore(key, 0, clearBefore);
      // 2. Add current request timestamp
      pipeline.zadd(key, now, `${now}-${Math.random()}`);
      // 3. Count requests within sliding window
      pipeline.zcard(key);
      // 4. Set expiry to auto-clean idle keys
      pipeline.expire(key, Math.ceil(windowMs / 1000));

      const results = await pipeline.exec();

      if (!results || results.length < 3) {
        return next();
      }

      const zcardResult = results[2][1] as number;
      const currentCount = typeof zcardResult === 'number' ? zcardResult : 0;

      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - currentCount));

      if (currentCount > maxRequests) {
        res.setHeader('Retry-After', Math.ceil(windowMs / 1000));
        res.status(429).json({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests. Please slow down and try again later.',
            timestamp: new Date().toISOString(),
            requestId: req.requestId,
          },
        });
        return;
      }

      next();
    } catch (err: unknown) {
      // High-availability fail-open: If Redis is temporarily unreachable, do not hard-block traffic
      const errorMsg = err instanceof Error ? err.message : String(err);
      logger.warn('Rate limiter Redis error, failing open to maintain service uptime:', {
        error: errorMsg,
      });
      next();
    }
  };
}

export const requestLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 120,
});
