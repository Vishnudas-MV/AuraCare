export interface TenantContext {
  tenantId: string;
  subdomain?: string;
  name?: string;
  status?: 'active' | 'suspended' | 'trial';
}

export interface UserContext {
  userId: string;
  tenantId: string;
  email: string;
  role: 'super_admin' | 'clinical_director' | 'physician' | 'nurse' | 'billing' | 'patient';
  permissions: string[];
  sessionId?: string;
}

export interface AuditContext {
  requestId: string;
  timestamp: string;
  ipAddress: string;
  userAgent?: string;
  action: string;
  resource: string;
  resourceId?: string;
  status: 'SUCCESS' | 'DENIED' | 'FAILED';
  meta?: Record<string, unknown>;
}

declare global {
  namespace Express {
    interface Request {
      requestId: string;
      tenant?: TenantContext;
      user?: UserContext;
      audit?: Partial<AuditContext>;
    }
  }
}
