import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { env } from '@/config/env.config';
import { STORAGE_KEYS } from '@/config/constants';
import { generateAuditClientReqId } from '@/utils/security';

/**
 * Preconfigured Axios instance with HIPAA client trace headers and JWT authentication.
 */
export const apiClient = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Inject Auth Token, Tenant Context, and Audit Trace ID
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 1. Bearer Token
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. Multi-tenant Header Context
    const tenantId = localStorage.getItem(STORAGE_KEYS.ACTIVE_TENANT) || 'tenant_default';
    if (config.headers) {
      config.headers['x-tenant-id'] = tenantId;
      config.headers['x-audit-client-req-id'] = generateAuditClientReqId();
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Centralized 401 handling & Error Normalization
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; errors?: Record<string, string[]> }>) => {
    if (error.response?.status === 401) {
      // Clear invalid credentials and notify application
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      window.dispatchEvent(new CustomEvent('auracare:unauthorized'));
    }

    const customMessage =
      error.response?.data?.message ||
      error.message ||
      'An unexpected clinical service error occurred';

    return Promise.reject(new Error(customMessage));
  }
);
