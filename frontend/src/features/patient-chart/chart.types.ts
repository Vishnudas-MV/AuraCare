import type {
  PatientDto,
  SoapNoteDto,
  SoapNoteStatus,
  SoapStructuredOutput,
  VitalsRecord,
  EncounterRecord,
} from '@/types';

export type {
  PatientDto,
  SoapNoteDto,
  SoapNoteStatus,
  SoapStructuredOutput,
  VitalsRecord,
  EncounterRecord,
};

export interface CreateSoapNoteInput {
  patientId: string;
  encounterId: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface PatientChartData {
  patient: PatientDto;
  recentVitals: VitalsRecord[];
  soapNotes: SoapNoteDto[];
}
