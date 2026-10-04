export interface PatientRecord {
  id: string;
  tenant_id: string;
  mrn: string;
  first_name: string;
  last_name: string;
  dob_encrypted: string;
  ssn_encrypted: string | null;
  insurance_id_encrypted: string | null;
  gender: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface PatientDto {
  id: string;
  tenantId: string;
  mrn: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // Plaintext decrypted for authorized view
  ssn?: string;         // Plaintext decrypted for authorized view
  insuranceId?: string; // Plaintext decrypted for authorized view
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
  dateOfBirth: string; // Plaintext ISO YYYY-MM-DD
  ssn?: string;
  insuranceId?: string;
  gender?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface UpdatePatientInput {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  ssn?: string;
  insuranceId?: string;
  gender?: string;
  email?: string;
  phone?: string;
  address?: string;
}
