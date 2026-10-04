import { Request, Response, NextFunction } from 'express';
import { pool } from '../database/pool';
import { logger } from '../utils/logger.util';

/**
 * HIPAA Compliance Asynchronous Audit Logger Middleware
 * Non-blocking logger that captures:
 * - Who (User ID, Email, Role)
 * - What (HTTP Method, Route, Resource Type, Resource ID)
 * - When (UTC Timestamp, Duration)
 * - Where (IP Address, User Agent)
 * - Outcome (SUCCESS, DENIED, FAILED)
 */
export function auditLogger(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - startTime;
    const tenantId = req.tenant?.tenantId;
    const userId = req.user?.userId;
    const userEmail = req.user?.email;

    // Determine status
    let status: 'SUCCESS' | 'DENIED' | 'FAILED' = 'SUCCESS';
    if (res.statusCode === 401 || res.statusCode === 403) {
      status = 'DENIED';
    } else if (res.statusCode >= 400) {
      status = 'FAILED';
    }

    const pathSegments = req.path.split('/').filter(Boolean);
    const resourceType = pathSegments[0] || 'root';
    const resourceId = (req.params?.id as string) || (req.body?.id as string) || undefined;

    const logDetails = {
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs,
      requestId: req.requestId,
      query: req.query,
      ip: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    };

    // Structured JSON log for real-time observability
    logger.audit(`[AUDIT] ${req.method} ${req.originalUrl} - ${status} (${res.statusCode})`, {
      tenantId,
      userId,
      userEmail,
      status,
      durationMs,
    });

    // Asynchronous database persistence into audit_logs (only if tenant is resolved)
    if (tenantId) {
      const insertSql = `
        INSERT INTO audit_logs (
          tenant_id, user_id, user_email, action, resource_type,
          resource_id, ip_address, user_agent, status, details
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `;

      pool.query(insertSql, [
        tenantId,
        userId || null,
        userEmail || null,
        `${req.method} ${req.path}`,
        resourceType,
        resourceId || null,
        req.ip || '127.0.0.1',
        req.headers['user-agent'] || null,
        status,
        JSON.stringify(logDetails),
      ]).catch((err) => {
        // Never fail the request if audit logging database write encounters an issue
        logger.error('Failed to persist audit log into database:', { error: String(err) });
      });
    }
  });

  next();
}
