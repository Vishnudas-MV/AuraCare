import { QueryClient, type DefaultOptions } from '@tanstack/react-query';

/**
 * Enterprise Production-Grade QueryClient Configuration
 * Optimized for sub-second clinical UI responsiveness and optimistic updates.
 */
const queryConfig: DefaultOptions = {
  queries: {
    staleTime: 1000 * 60 * 2, // 2 minutes before marking queries stale
    gcTime: 1000 * 60 * 10, // 10 minutes cache garbage collection
    refetchOnWindowFocus: false, // Prevent jarring chart refetches while editing notes
    refetchOnReconnect: true,
    retry: (failureCount, error) => {
      // Don't retry on 401 or 403 unauthorized client errors
      if (error && 'status' in error && (error.status === 401 || error.status === 403)) {
        return false;
      }
      return failureCount < 2;
    },
  },
  mutations: {
    retry: 0,
  },
};

export const queryClient = new QueryClient({
  defaultOptions: queryConfig,
});

/**
 * Hierarchical Query Keys Factory for AuraCare Domain Entities
 * Guarantees type-safe invalidation and optimistic rollbacks.
 */
export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    currentUser: () => [...queryKeys.auth.all, 'me'] as const,
  },
  patients: {
    all: ['patients'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.patients.all, 'list', filters ?? {}] as const,
    detail: (id: string) => [...queryKeys.patients.all, 'detail', id] as const,
    vitals: (patientId: string) =>
      [...queryKeys.patients.detail(patientId), 'vitals'] as const,
  },
  charts: {
    all: ['charts'] as const,
    byPatient: (patientId: string) =>
      [...queryKeys.charts.all, 'patient', patientId] as const,
    soapNote: (id: string) => [...queryKeys.charts.all, 'soap', id] as const,
    encounters: (patientId: string) =>
      [...queryKeys.charts.all, 'encounters', patientId] as const,
  },
  scheduler: {
    all: ['scheduler'] as const,
    appointments: (dateOrRange?: string) =>
      [...queryKeys.scheduler.all, 'appointments', dateOrRange ?? 'today'] as const,
  },
} as const;
