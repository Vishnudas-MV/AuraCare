export type SoapNoteStatus = 'PENDING' | 'COMPLETED' | 'SIGNED' | 'FAILED';

export interface SoapNoteRecord {
  id: string;
  tenant_id: string;
  encounter_id: string;
  patient_id: string;
  provider_id: string;
  status: SoapNoteStatus;
  subjective: string | null;
  objective: string | null;
  assessment: string | null;
  plan: string | null;
  raw_transcript: string | null;
  created_at: string;
  updated_at: string;
}

export interface SoapNoteDto {
  id: string;
  tenantId: string;
  encounterId: string;
  patientId: string;
  providerId: string;
  status: SoapNoteStatus;
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  rawTranscript?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SoapStructuredOutput {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface EncounterRecord {
  id: string;
  tenant_id: string;
  patient_id: string;
  provider_id: string;
  encounter_date: string;
  status: string;
  reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface SummarizeTranscriptInput {
  patientId: string;
  encounterId: string;
  rawText: string;
}
