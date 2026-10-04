import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Tenant Context Extraction Middleware
 * Identifies the tenant from:
 * 1. Explicit 'x-tenant-id' header
 * 2. Host Subdomain (e.g. apex-clinic.auracare.health)
 * 3. Request body/query fallback for early authentication or registration
 */
export function tenantContext(req: Request, res: Response, next: NextFunction): void {
  // Ensure request has a unique trace ID for HIPAA audit tracking
  const requestId = (req.headers['x-request-id'] as string) || uuidv4();
  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);

  let tenantId: string | undefined = req.headers['x-tenant-id'] as string;
  let subdomain: string | undefined;

  // Check Host subdomain if header is not present
  const host = req.headers.host;
  if (!tenantId && host) {
    const hostWithoutPort = host.split(':')[0];
    const parts = hostWithoutPort.split('.');
    if (parts.length > 2 && parts[0] !== 'www' && parts[0] !== 'api') {
      subdomain = parts[0];
      // In production, this can resolve from Redis cache `tenant:subdomain:<subdomain>`
      tenantId = subdomain;
    }
  }

  // Fallback to body or query for public auth endpoints (e.g. login)
  if (!tenantId) {
    if (req.body && typeof req.body === 'object' && req.body.tenantId) {
      tenantId = String(req.body.tenantId);
    } else if (req.query && req.query.tenantId) {
      tenantId = String(req.query.tenantId);
    }
  }

  if (tenantId) {
    req.tenant = {
      tenantId,
      subdomain,
      status: 'active',
    };
  }

  next();
}

/**
 * Route guard that mandates tenant identification
 */
export function requireTenant(req: Request, res: Response, next: NextFunction): void {
  if (!req.tenant?.tenantId) {
    res.status(400).json({
      success: false,
      error: {
        code: 'TENANT_IDENTIFIER_MISSING',
        message: 'A valid Tenant Identifier (x-tenant-id header or subdomain) is required.',
        timestamp: new Date().toISOString(),
        requestId: req.requestId,
      },
    });
    return;
  }
  next();
}
