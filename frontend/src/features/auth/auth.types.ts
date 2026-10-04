import type { AuthUser, AuthTokens, LoginResult } from '@/types';

export type { AuthUser, AuthTokens, LoginResult };

export interface LoginCredentials {
  email: string;
  password: string;
  tenantId?: string;
}

export interface MfaVerificationInput {
  tempToken: string;
  totpCode: string;
}
