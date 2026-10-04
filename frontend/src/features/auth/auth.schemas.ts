import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Clinical email address is required')
    .email('Please enter a valid healthcare institutional email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long'),
  tenantId: z.string().optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const mfaSchema = z.object({
  totpCode: z
    .string()
    .length(6, 'TOTP code must be exactly 6 digits')
    .regex(/^\d+$/, 'Code must contain only digits'),
});

export type MfaFormValues = z.infer<typeof mfaSchema>;
