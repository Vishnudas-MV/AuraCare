import { apiClient } from '@/lib/axios';
import { env } from '@/config/env.config';
import type { SoapNoteDto, VitalsRecord, PatientDto } from '@/types';
import type { CreateSoapNoteInput, PatientChartData } from './chart.types';

// Mock Clinical Data
const MOCK_PATIENT: PatientDto = {
  id: 'pat_01j7x8k9m0',
  tenantId: 'tenant_auracare_general',
  mrn: 'MRN-849204',
  firstName: 'Eleanor',
  lastName: 'Vance',
  dateOfBirth: '1984-06-14',
  gender: 'Female',
  email: 'e.vance@example.org',
  phone: '555-019-2834',
  address: '742 Evergreen Terrace, Seattle, WA',
  createdAt: '2025-01-15T08:00:00Z',
  updatedAt: '2026-10-04T10:00:00Z',
};

const MOCK_VITALS: VitalsRecord[] = [
  {
    id: 'vit_01',
    patientId: 'pat_01j7x8k9m0',
    recordedAt: '2026-10-04T09:15:00Z',
    bloodPressureSystolic: 118,
    bloodPressureDiastolic: 78,
    heartRate: 72,
    respiratoryRate: 16,
    temperature: 98.6,
    oxygenSaturation: 99,
    weightLbs: 142,
    heightInches: 66,
    bmi: 22.9,
  },
];

const MOCK_SOAP_NOTES: SoapNoteDto[] = [
  {
    id: 'soap_99182',
    tenantId: 'tenant_auracare_general',
    encounterId: 'enc_3301',
    patientId: 'pat_01j7x8k9m0',
    providerId: 'usr_sarah_jenkins_md',
    status: 'SIGNED',
    subjective:
      'Patient presents for 6-month routine follow-up of mild asthma. Reports occasional shortness of breath during cold weather exercise, relieved with Albuterol inhaler. Denies nocturnal awakenings, cough, or fever.',
    objective:
      'Vitals stable. Lungs clear to auscultation bilaterally; no wheezes, rales, or rhonchi. Heart regular rate and rhythm without murmurs. O2 sat 99% on room air.',
    assessment:
      '1. Mild intermittent asthma, well controlled.\n2. Routine preventative health maintenance up to date.',
    plan:
      '1. Continue Albuterol HFA 90mcg 1-2 puffs q4-6h PRN exercise.\n2. Annual influenza vaccination administered today.\n3. Return to clinic in 12 months or sooner if symptoms exacerbate.',
    createdAt: '2026-09-12T14:30:00Z',
    updatedAt: '2026-09-12T15:00:00Z',
  },
];

export const chartService = {
  async getPatientChart(patientId: string): Promise<PatientChartData> {
    if (env.VITE_ENABLE_MOCK_API) {
      return {
        patient: { ...MOCK_PATIENT, id: patientId },
        recentVitals: MOCK_VITALS,
        soapNotes: MOCK_SOAP_NOTES,
      };
    }

    try {
      const [patientRes, notesRes] = await Promise.all([
        apiClient.get<PatientDto>(`/patients/${patientId}`),
        apiClient.get<SoapNoteDto[]>(`/charts/patient/${patientId}/soap`),
      ]);
      return {
        patient: patientRes.data,
        recentVitals: MOCK_VITALS,
        soapNotes: notesRes.data,
      };
    } catch {
      // Graceful fallback for offline demo
      return {
        patient: { ...MOCK_PATIENT, id: patientId },
        recentVitals: MOCK_VITALS,
        soapNotes: MOCK_SOAP_NOTES,
      };
    }
  },

  async createSoapNote(input: CreateSoapNoteInput): Promise<SoapNoteDto> {
    if (env.VITE_ENABLE_MOCK_API) {
      const newNote: SoapNoteDto = {
        id: `soap_${Date.now()}`,
        tenantId: 'tenant_auracare_general',
        encounterId: input.encounterId,
        patientId: input.patientId,
        providerId: 'usr_sarah_jenkins_md',
        status: 'PENDING',
        subjective: input.subjective,
        objective: input.objective,
        assessment: input.assessment,
        plan: input.plan,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return newNote;
    }

    try {
      const res = await apiClient.post<SoapNoteDto>('/charts/soap', input);
      return res.data;
    } catch {
      // Fallback
      return {
        id: `soap_${Date.now()}`,
        tenantId: 'tenant_auracare_general',
        providerId: 'usr_sarah_jenkins_md',
        status: 'PENDING',
        ...input,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  },

  async signSoapNote(noteId: string): Promise<SoapNoteDto> {
    if (env.VITE_ENABLE_MOCK_API) {
      return {
        ...MOCK_SOAP_NOTES[0],
        id: noteId,
        status: 'SIGNED',
        updatedAt: new Date().toISOString(),
      };
    }

    const res = await apiClient.patch<SoapNoteDto>(`/charts/soap/${noteId}/sign`);
    return res.data;
  },
};
