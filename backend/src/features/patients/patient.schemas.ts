import { z } from 'zod';

export const createPatientSchema = z.object({
  mrn: z.string().min(3, 'Medical Record Number (MRN) is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of Birth must be in YYYY-MM-DD format'),
  ssn: z
    .string()
    .regex(/^\d{3}-\d{2}-\d{4}$/, 'SSN must follow standard format (XXX-XX-XXXX)')
    .optional(),
  insuranceId: z.string().optional(),
  gender: z.enum(['male', 'female', 'other', 'unknown']).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const updatePatientSchema = createPatientSchema.partial().omit({ mrn: true });

export const patientIdParamSchema = z.object({
  id: z.string().uuid('Patient ID must be a valid UUID'),
});

export type CreatePatientSchemaInput = z.infer<typeof createPatientSchema>;
export type UpdatePatientSchemaInput = z.infer<typeof updatePatientSchema>;
