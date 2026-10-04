import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Valid work email required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  tenantId: z.string().optional(),
  mfaCode: z.string().length(6, 'MFA Code must be 6 digits').optional(),
});

export const mfaVerifySchema = z.object({
  tempToken: z.string().min(1, 'Temporary MFA verification token required'),
  code: z.string().length(6, '6-digit MFA code required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token required'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type MfaVerifyInput = z.infer<typeof mfaVerifySchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
