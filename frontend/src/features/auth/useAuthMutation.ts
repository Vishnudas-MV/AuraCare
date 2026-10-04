import { useMutation } from '@tanstack/react-query';
import { authService } from './auth.service';
import { useAuth } from '@/context/AuthContext';
import type { LoginCredentials, MfaVerificationInput } from './auth.types';
import { toast } from 'sonner';

export function useLoginMutation() {
  const { setSession } = useAuth();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (data) => {
      if (data.requiresMfa) {
        toast.info('Multi-Factor Authentication required. Enter your 6-digit code.');
      } else if (data.user && data.tokens) {
        setSession(data.user, data.tokens);
        toast.success(`Welcome back, Dr. ${data.user.lastName}`);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Login failed. Please verify credentials.');
    },
  });
}

export function useMfaMutation() {
  const { setSession } = useAuth();

  return useMutation({
    mutationFn: (payload: MfaVerificationInput) => authService.verifyMfa(payload),
    onSuccess: (data) => {
      if (data.user && data.tokens) {
        setSession(data.user, data.tokens);
        toast.success('MFA verification successful');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'MFA verification failed');
    },
  });
}
