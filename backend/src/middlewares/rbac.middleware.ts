import { Request, Response, NextFunction } from 'express';

const ROLE_PERMISSIONS: Record<string, string[]> = {
  super_admin: ['*'],
  clinical_director: [
    'provider:read',
    'provider:write',
    'patient:read',
    'patient:write',
    'patient:delete',
    'chart:read',
    'chart:write',
    'chart:approve',
    'audit:read',
  ],
  physician: [
    'provider:read',
    'provider:write',
    'patient:read',
    'patient:write',
    'chart:read',
    'chart:write',
  ],
  nurse: [
    'provider:read',
    'patient:read',
    'patient:write',
    'chart:read',
  ],
  billing: [
    'patient:read',
    'billing:read',
    'billing:write',
  ],
  patient: [
    'patient:read_self',
    'chart:read_self',
  ],
};

/**
 * Role-Based Access Control (RBAC) Guard Middleware
 * Evaluates requested permissions against user roles and custom permission claims.
 */
export function rbac(requiredPermission: string | string[]) {
  const permissionsNeeded = Array.isArray(requiredPermission)
    ? requiredPermission
    : [requiredPermission];

  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHENTICATED',
          message: 'Authentication is required before permission checks.',
          timestamp: new Date().toISOString(),
          requestId: req.requestId,
        },
      });
      return;
    }

    const userRole = req.user.role;
    const roleGrantedPerms = ROLE_PERMISSIONS[userRole] || [];
    const directUserPerms = req.user.permissions || [];
    const allUserPerms = new Set([...roleGrantedPerms, ...directUserPerms]);

    // Super admins bypass all permission checks
    if (allUserPerms.has('*')) {
      return next();
    }

    // Verify all needed permissions are satisfied
    const hasAllPermissions = permissionsNeeded.every(
      (perm) => allUserPerms.has(perm) || allUserPerms.has(perm.split(':')[0] + ':*')
    );

    if (!hasAllPermissions) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Forbidden: Insufficient privileges. Required: [${permissionsNeeded.join(', ')}]`,
          timestamp: new Date().toISOString(),
          requestId: req.requestId,
        },
      });
      return;
    }

    next();
  };
}
