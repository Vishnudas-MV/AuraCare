import { apiClient } from '@/lib/axios';
import { env } from '@/config/env.config';
import type { LoginResult } from '@/types';
import type { LoginCredentials, MfaVerificationInput } from './auth.types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResult> {
    if (env.VITE_ENABLE_MOCK_API) {
      // Mocked login flow for offline testing
      return {
        requiresMfa: false,
        user: {
          id: 'usr_sarah_jenkins_md',
          tenantId: 'tenant_auracare_general',
          email: credentials.email,
          role: 'physician',
          firstName: 'Sarah',
          lastName: 'Jenkins, M.D.',
          mfaEnabled: true,
        },
        tokens: {
          accessToken: 'mock_jwt_access_token_12345',
          refreshToken: 'mock_jwt_refresh_token_67890',
          expiresIn: 3600,
          tokenType: 'Bearer',
        },
      };
    }

    const response = await apiClient.post<LoginResult>('/auth/login', credentials);
    return response.data;
  },

  async verifyMfa(payload: MfaVerificationInput): Promise<LoginResult> {
    if (env.VITE_ENABLE_MOCK_API) {
      return {
        user: {
          id: 'usr_sarah_jenkins_md',
          tenantId: 'tenant_auracare_general',
          email: 'sjenkins@auracarehealth.org',
          role: 'physician',
          firstName: 'Sarah',
          lastName: 'Jenkins, M.D.',
          mfaEnabled: true,
        },
        tokens: {
          accessToken: 'mock_jwt_access_token_verified',
          refreshToken: 'mock_jwt_refresh_token_verified',
          expiresIn: 3600,
          tokenType: 'Bearer',
        },
      };
    }

    const response = await apiClient.post<LoginResult>('/auth/mfa/verify', payload);
    return response.data;
  },
};
