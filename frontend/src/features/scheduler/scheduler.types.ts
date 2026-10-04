import type { AppointmentDto, AppointmentStatus } from '@/types';

export type { AppointmentDto, AppointmentStatus };

export interface CreateAppointmentInput {
  patientId: string;
  patientName: string;
  patientMrn: string;
  providerId: string;
  appointmentTime: string;
  durationMinutes: number;
  reason: string;
  room?: string;
}
