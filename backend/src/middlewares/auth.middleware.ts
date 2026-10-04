import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.config';
import { getFromCache } from '../lib/redis';
import { UserContext } from '../context/request.context';

export interface JwtTokenPayload {
  userId: string;
  tenantId: string;
  email: string;
  role: 'super_admin' | 'clinical_director' | 'physician' | 'nurse' | 'billing' | 'patient';
  permissions: string[];
  sessionId?: string;
  iat?: number;
  exp?: number;
}

export async function authenticateJWT(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Missing or malformed Authorization header with Bearer token',
        timestamp: new Date().toISOString(),
        requestId: req.requestId,
      },
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    // 1. Verify cryptographic signature & expiration
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtTokenPayload;

    // 2. Check token revocation / session logout in Redis
    const isRevoked = await getFromCache<boolean>(`revoked:token:${token}`);
    if (isRevoked) {
      res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_REVOKED',
          message: 'The provided access token has been revoked or session terminated.',
          timestamp: new Date().toISOString(),
          requestId: req.requestId,
        },
      });
      return;
    }

    // 3. Prevent cross-tenant token impersonation
    if (req.tenant?.tenantId && req.tenant.tenantId !== decoded.tenantId) {
      res.status(403).json({
        success: false,
        error: {
          code: 'TENANT_MISMATCH',
          message: 'Security Violation: JWT tenant does not match requested tenant context.',
          timestamp: new Date().toISOString(),
          requestId: req.requestId,
        },
      });
      return;
    }

    // Ensure tenant context is set if not already present
    if (!req.tenant) {
      req.tenant = {
        tenantId: decoded.tenantId,
        status: 'active',
      };
    }

    // 4. Attach verified user context to request
    const userContext: UserContext = {
      userId: decoded.userId,
      tenantId: decoded.tenantId,
      email: decoded.email,
      role: decoded.role,
      permissions: decoded.permissions || [],
      sessionId: decoded.sessionId,
    };

    req.user = userContext;
    next();
  } catch (err: unknown) {
    const error = err as Error;
    const isExpired = error.name === 'TokenExpiredError';

    res.status(401).json({
      success: false,
      error: {
        code: isExpired ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN',
        message: isExpired
          ? 'Access token has expired. Please refresh token.'
          : 'Invalid or forged authentication token.',
        timestamp: new Date().toISOString(),
        requestId: req.requestId,
      },
    });
  }
}

/**
 * Optional authentication middleware for public endpoints with personalized response if authenticated
 */
export async function optionalAuthenticateJWT(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtTokenPayload;
    req.user = {
      userId: decoded.userId,
      tenantId: decoded.tenantId,
      email: decoded.email,
      role: decoded.role,
      permissions: decoded.permissions || [],
      sessionId: decoded.sessionId,
    };
    if (!req.tenant) {
      req.tenant = { tenantId: decoded.tenantId };
    }
  } catch {
    // Continue unauthenticated
  }
  next();
}
