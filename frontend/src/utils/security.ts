/**
 * HIPAA & Security compliance utility helpers.
 */

/**
 * Mask Social Security Number: shows only last 4 digits (e.g., "***-**-1234")
 */
export function maskSSN(ssn: string | null | undefined): string {
  if (!ssn) return '—';
  const clean = ssn.replace(/\D/g, '');
  if (clean.length === 9) {
    return `***-**-${clean.slice(-4)}`;
  }
  return '***-**-****';
}

/**
 * Generates a unique HIPAA audit client request ID for header tracing.
 */
export function generateAuditClientReqId(): string {
  return `audit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Sanitizes and strips sensitive payload data from client logs.
 */
export function sanitizeForAudit(obj: Record<string, unknown>): Record<string, unknown> {
  const sanitized = { ...obj };
  const sensitiveKeys = ['password', 'ssn', 'token', 'accessToken', 'refreshToken', 'secret'];
  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
      sanitized[key] = '[REDACTED_HIPAA]';
    }
  }
  return sanitized;
}
