import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.config';
import { logger } from '../utils/logger.util';

export function errorHandler(
  err: Error & { statusCode?: number; code?: string },
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || (statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : 'APPLICATION_ERROR');

  logger.error('Unhandled Application Exception:', {
    message: err.message,
    stack: err.stack,
    requestId: req.requestId,
    tenantId: req.tenant?.tenantId,
    path: req.originalUrl,
  });

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message:
        env.NODE_ENV === 'production' && statusCode === 500
          ? 'An internal server error occurred. Our engineering and compliance team has been notified.'
          : err.message,
      timestamp: new Date().toISOString(),
      requestId: req.requestId,
      ...(env.NODE_ENV !== 'production' ? { stack: err.stack } : {}),
    },
  });
}
