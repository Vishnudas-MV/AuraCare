import { z } from 'zod';

export const summarizeTranscriptSchema = z.object({
  patientId: z.string().uuid('Patient ID must be a valid UUID'),
  encounterId: z.string().uuid('Encounter ID must be a valid UUID'),
  rawText: z
    .string()
    .min(10, 'Transcript text must be at least 10 characters')
    .max(50000, 'Transcript text exceeds maximum limit (50,000 characters)'),
});

export const soapNoteSchema = z.object({
  subjective: z.string().min(1, 'Subjective section cannot be empty'),
  objective: z.string().min(1, 'Objective section cannot be empty'),
  assessment: z.string().min(1, 'Assessment section cannot be empty'),
  plan: z.string().min(1, 'Plan section cannot be empty'),
});

export const createEncounterSchema = z.object({
  patientId: z.string().uuid('Patient ID must be a valid UUID'),
  reason: z.string().optional(),
});

export const chartNoteIdParamSchema = z.object({
  id: z.string().uuid('Note ID must be a valid UUID'),
});

export type SummarizeTranscriptSchemaInput = z.infer<typeof summarizeTranscriptSchema>;
export type SoapNoteSchemaInput = z.infer<typeof soapNoteSchema>;
export type CreateEncounterSchemaInput = z.infer<typeof createEncounterSchema>;
