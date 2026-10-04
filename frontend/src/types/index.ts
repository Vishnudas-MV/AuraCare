/**
 * AuraCare Global Interface Definitions
 * Synchronized with backend PERN services and HIPAA compliance specs.
 */

// --- Base API Types ---
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  errors?: Record<string, string[]>;
}

// --- Auth Types ---
export type UserRole =
  | 'super_admin'
  | 'clinical_director'
  | 'physician'
  | 'nurse'
  | 'billing'
  | 'patient';

export interface AuthUser {
  id: string;
  tenantId: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  mfaEnabled: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface LoginResult {
  requiresMfa?: boolean;
  tempToken?: string;
  user?: AuthUser;
  tokens?: AuthTokens;
}

// --- Patient Types ---
export interface PatientDto {
  id: string;
  tenantId: string;
  mrn: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // Plaintext ISO YYYY-MM-DD
  ssn?: string;
  insuranceId?: string;
  gender?: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePatientInput {
  mrn: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  ssn?: string;
  insuranceId?: string;
  gender?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface UpdatePatientInput extends Partial<CreatePatientInput> {}

// --- Clinical Chart & SOAP Types ---
export type SoapNoteStatus = 'PENDING' | 'COMPLETED' | 'SIGNED' | 'FAILED';

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
  tenantId: string;
  patientId: string;
  providerId: string;
  encounterDate: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  reason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VitalsRecord {
  id: string;
  patientId: string;
  recordedAt: string;
  bloodPressureSystolic: number; // e.g. 120
  bloodPressureDiastolic: number; // e.g. 80
  heartRate: number; // bpm
  respiratoryRate: number; // bpm
  temperature: number; // Fahrenheit
  oxygenSaturation: number; // %
  weightLbs?: number;
  heightInches?: number;
  bmi?: number;
}

// --- Scheduler Types ---
export type AppointmentStatus =
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'IN_EXAM'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export interface AppointmentDto {
  id: string;
  tenantId: string;
  patientId: string;
  patientName: string;
  patientMrn: string;
  providerId: string;
  providerName: string;
  appointmentTime: string; // ISO
  durationMinutes: number;
  reason: string;
  status: AppointmentStatus;
  room?: string;
}
