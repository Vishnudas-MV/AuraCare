import { apiClient } from '@/lib/axios';
import { env } from '@/config/env.config';
import type { AppointmentDto } from '@/types';
import type { CreateAppointmentInput } from './scheduler.types';

const MOCK_APPOINTMENTS: AppointmentDto[] = [
  {
    id: 'apt_01',
    tenantId: 'tenant_auracare_general',
    patientId: 'pat_01j7x8k9m0',
    patientName: 'Eleanor Vance',
    patientMrn: 'MRN-849204',
    providerId: 'usr_sarah_jenkins_md',
    providerName: 'Dr. Sarah Jenkins',
    appointmentTime: '2026-10-04T09:00:00Z',
    durationMinutes: 30,
    reason: 'Asthma follow-up & Spirometry review',
    status: 'IN_EXAM',
    room: 'Exam Room 3B',
  },
  {
    id: 'apt_02',
    tenantId: 'tenant_auracare_general',
    patientId: 'pat_02k9y1m2n3',
    patientName: 'Marcus Holloway',
    patientMrn: 'MRN-102948',
    providerId: 'usr_sarah_jenkins_md',
    providerName: 'Dr. Sarah Jenkins',
    appointmentTime: '2026-10-04T10:00:00Z',
    durationMinutes: 45,
    reason: 'Annual Comprehensive Physical Exam',
    status: 'CHECKED_IN',
    room: 'Waiting Room A',
  },
  {
    id: 'apt_03',
    tenantId: 'tenant_auracare_general',
    patientId: 'pat_03l4z5o6p7',
    patientName: 'Amara Chen',
    patientMrn: 'MRN-554912',
    providerId: 'usr_sarah_jenkins_md',
    providerName: 'Dr. Sarah Jenkins',
    appointmentTime: '2026-10-04T11:15:00Z',
    durationMinutes: 15,
    reason: 'Acute Sore Throat & Fever evaluation',
    status: 'SCHEDULED',
    room: 'Exam Room 1A',
  },
  {
    id: 'apt_04',
    tenantId: 'tenant_auracare_general',
    patientId: 'pat_04m8q9r0s1',
    patientName: 'David K. Miller',
    patientMrn: 'MRN-339102',
    providerId: 'usr_sarah_jenkins_md',
    providerName: 'Dr. Sarah Jenkins',
    appointmentTime: '2026-10-04T13:30:00Z',
    durationMinutes: 30,
    reason: 'Hypertension titration follow-up',
    status: 'SCHEDULED',
    room: 'Exam Room 2',
  },
];

export const schedulerService = {
  async getTodayAppointments(): Promise<AppointmentDto[]> {
    if (env.VITE_ENABLE_MOCK_API) {
      return MOCK_APPOINTMENTS;
    }

    try {
      const res = await apiClient.get<AppointmentDto[]>('/scheduler/appointments?date=today');
      return res.data;
    } catch {
      return MOCK_APPOINTMENTS;
    }
  },

  async createAppointment(input: CreateAppointmentInput): Promise<AppointmentDto> {
    if (env.VITE_ENABLE_MOCK_API) {
      const newApt: AppointmentDto = {
        id: `apt_${Date.now()}`,
        tenantId: 'tenant_auracare_general',
        providerName: 'Dr. Sarah Jenkins',
        ...input,
        status: 'SCHEDULED',
      };
      return newApt;
    }

    try {
      const res = await apiClient.post<AppointmentDto>('/scheduler/appointments', input);
      return res.data;
    } catch {
      return {
        id: `apt_${Date.now()}`,
        tenantId: 'tenant_auracare_general',
        providerName: 'Dr. Sarah Jenkins',
        ...input,
        status: 'SCHEDULED',
      };
    }
  },
};
