import { BaseRepository } from '../../database/base.repository';
import { encryptPII, decryptPII } from '../../utils/encryption.util';
import {
  PatientRecord,
  PatientDto,
  CreatePatientInput,
  UpdatePatientInput,
} from './patient.types';

export class PatientRepository extends BaseRepository {
  /**
   * Helper to transform encrypted database record to decrypted PatientDto
   */
  private mapRecordToDto(row: PatientRecord): PatientDto {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      mrn: row.mrn,
      firstName: row.first_name,
      lastName: row.last_name,
      dateOfBirth: decryptPII(row.dob_encrypted) || '',
      ssn: decryptPII(row.ssn_encrypted) || undefined,
      insuranceId: decryptPII(row.insurance_id_encrypted) || undefined,
      gender: row.gender || undefined,
      email: row.email || undefined,
      phone: row.phone || undefined,
      address: row.address || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  /**
   * Finds a patient by primary UUID.
   * NOTE: PostgreSQL Row Level Security (RLS) automatically ensures that patients
   * belonging to other tenants are completely invisible to this query without explicit tenant_id SQL filter.
   */
  public async findById(id: string): Promise<PatientDto | null> {
    const sql = `
      SELECT id, tenant_id, mrn, first_name, last_name,
             dob_encrypted, ssn_encrypted, insurance_id_encrypted,
             gender, email, phone, address, created_at, updated_at
      FROM patients
      WHERE id = $1
      LIMIT 1
    `;

    const res = await this.query<PatientRecord>(sql, [id]);
    if (res.rows.length === 0) return null;
    return this.mapRecordToDto(res.rows[0]);
  }

  /**
   * Finds a patient by Medical Record Number (MRN).
   * RLS automatically isolates lookup within the active tenant.
   */
  public async findByMrn(mrn: string): Promise<PatientDto | null> {
    const sql = `
      SELECT id, tenant_id, mrn, first_name, last_name,
             dob_encrypted, ssn_encrypted, insurance_id_encrypted,
             gender, email, phone, address, created_at, updated_at
      FROM patients
      WHERE mrn = $1
      LIMIT 1
    `;

    const res = await this.query<PatientRecord>(sql, [mrn]);
    if (res.rows.length === 0) return null;
    return this.mapRecordToDto(res.rows[0]);
  }

  /**
   * Lists patients with pagination and optional search filter.
   */
  public async findAll(
    limit: number = 20,
    offset: number = 0,
    search?: string
  ): Promise<{ items: PatientDto[]; total: number }> {
    let whereClause = '';
    const params: unknown[] = [];

    if (search) {
      params.push(`%${search}%`);
      whereClause = `WHERE (first_name ILIKE $1 OR last_name ILIKE $1 OR mrn ILIKE $1)`;
    }

    const countSql = `SELECT COUNT(*)::int as count FROM patients ${whereClause}`;
    const countRes = await this.query<{ count: number }>(countSql, params);
    const total = countRes.rows[0]?.count || 0;

    const dataSql = `
      SELECT id, tenant_id, mrn, first_name, last_name,
             dob_encrypted, ssn_encrypted, insurance_id_encrypted,
             gender, email, phone, address, created_at, updated_at
      FROM patients
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const dataRes = await this.query<PatientRecord>(dataSql, [...params, limit, offset]);
    const items = dataRes.rows.map((r) => this.mapRecordToDto(r));

    return { items, total };
  }

  /**
   * Inserts a new patient record with AES-256-GCM encrypted PII fields.
   */
  public async create(data: CreatePatientInput): Promise<PatientDto> {
    const encryptedDob = encryptPII(data.dateOfBirth);
    const encryptedSsn = encryptPII(data.ssn);
    const encryptedInsurance = encryptPII(data.insuranceId);

    if (!encryptedDob) {
      throw new Error('Date of birth encryption failed or value missing');
    }

    const sql = `
      INSERT INTO patients (
        tenant_id, mrn, first_name, last_name,
        dob_encrypted, ssn_encrypted, insurance_id_encrypted,
        gender, email, phone, address
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, tenant_id, mrn, first_name, last_name,
                dob_encrypted, ssn_encrypted, insurance_id_encrypted,
                gender, email, phone, address, created_at, updated_at
    `;

    const params = [
      this.tenantId,
      data.mrn,
      data.firstName,
      data.lastName,
      encryptedDob,
      encryptedSsn,
      encryptedInsurance,
      data.gender || null,
      data.email || null,
      data.phone || null,
      data.address || null,
    ];

    const res = await this.query<PatientRecord>(sql, params);
    return this.mapRecordToDto(res.rows[0]);
  }

  /**
   * Updates an existing patient record.
   */
  public async update(id: string, data: UpdatePatientInput): Promise<PatientDto | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const updates: string[] = [];
    const params: unknown[] = [];
    let pIdx = 1;

    if (data.firstName !== undefined) {
      updates.push(`first_name = $${pIdx++}`);
      params.push(data.firstName);
    }
    if (data.lastName !== undefined) {
      updates.push(`last_name = $${pIdx++}`);
      params.push(data.lastName);
    }
    if (data.dateOfBirth !== undefined) {
      updates.push(`dob_encrypted = $${pIdx++}`);
      params.push(encryptPII(data.dateOfBirth));
    }
    if (data.ssn !== undefined) {
      updates.push(`ssn_encrypted = $${pIdx++}`);
      params.push(encryptPII(data.ssn));
    }
    if (data.insuranceId !== undefined) {
      updates.push(`insurance_id_encrypted = $${pIdx++}`);
      params.push(encryptPII(data.insuranceId));
    }
    if (data.gender !== undefined) {
      updates.push(`gender = $${pIdx++}`);
      params.push(data.gender);
    }
    if (data.email !== undefined) {
      updates.push(`email = $${pIdx++}`);
      params.push(data.email);
    }
    if (data.phone !== undefined) {
      updates.push(`phone = $${pIdx++}`);
      params.push(data.phone);
    }
    if (data.address !== undefined) {
      updates.push(`address = $${pIdx++}`);
      params.push(data.address);
    }

    if (updates.length === 0) {
      return existing;
    }

    updates.push(`updated_at = NOW()`);
    params.push(id);

    const sql = `
      UPDATE patients
      SET ${updates.join(', ')}
      WHERE id = $${pIdx}
      RETURNING id, tenant_id, mrn, first_name, last_name,
                dob_encrypted, ssn_encrypted, insurance_id_encrypted,
                gender, email, phone, address, created_at, updated_at
    `;

    const res = await this.query<PatientRecord>(sql, params);
    if (res.rows.length === 0) return null;
    return this.mapRecordToDto(res.rows[0]);
  }

  /**
   * Deletes a patient by ID.
   */
  public async delete(id: string): Promise<boolean> {
    const sql = `DELETE FROM patients WHERE id = $1`;
    const res = await this.query(sql, [id]);
    return (res.rowCount ?? 0) > 0;
  }
}
