export interface AuthUser {
  id: string;
  tenantId: string;
  email: string;
  role: 'super_admin' | 'clinical_director' | 'physician' | 'nurse' | 'billing' | 'patient';
  firstName: string;
  lastName: string;
  mfaEnabled: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
  tokenType: 'Bearer';
}

export interface LoginResult {
  requiresMfa?: boolean;
  tempToken?: string;
  user?: AuthUser;
  tokens?: AuthTokens;
}
