import { z } from 'zod';

export const soapNoteSchema = z.object({
  subjective: z
    .string()
    .min(5, 'Subjective narrative must have at least 5 characters')
    .max(5000, 'Subjective section exceeds length limit'),
  objective: z
    .string()
    .min(5, 'Objective examination findings are required')
    .max(5000, 'Objective section exceeds length limit'),
  assessment: z
    .string()
    .min(5, 'Clinical assessment and diagnosis are required')
    .max(5000, 'Assessment section exceeds length limit'),
  plan: z
    .string()
    .min(5, 'Clinical treatment & care plan is required')
    .max(5000, 'Plan section exceeds length limit'),
});

export type SoapNoteFormValues = z.infer<typeof soapNoteSchema>;

export const vitalsSchema = z.object({
  bloodPressureSystolic: z.number().min(60).max(250),
  bloodPressureDiastolic: z.number().min(30).max(150),
  heartRate: z.number().min(30).max(220),
  respiratoryRate: z.number().min(8).max(50),
  temperature: z.number().min(90).max(110),
  oxygenSaturation: z.number().min(50).max(100),
});

export type VitalsFormValues = z.infer<typeof vitalsSchema>;
