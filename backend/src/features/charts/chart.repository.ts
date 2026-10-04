import { BaseRepository } from '../../database/base.repository';
import {
  SoapNoteRecord,
  SoapNoteDto,
  SoapStructuredOutput,
  EncounterRecord,
} from './chart.types';

export class ChartRepository extends BaseRepository {
  private mapSoapRecordToDto(row: SoapNoteRecord): SoapNoteDto {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      encounterId: row.encounter_id,
      patientId: row.patient_id,
      providerId: row.provider_id,
      status: row.status,
      subjective: row.subjective || undefined,
      objective: row.objective || undefined,
      assessment: row.assessment || undefined,
      plan: row.plan || undefined,
      rawTranscript: row.raw_transcript || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  /**
   * Creates a new pending SOAP note record in PostgreSQL before queueing background AI job.
   */
  public async createPendingSoapNote(
    encounterId: string,
    patientId: string,
    providerId: string,
    rawTranscript: string
  ): Promise<SoapNoteDto> {
    const sql = `
      INSERT INTO soap_notes (
        tenant_id, encounter_id, patient_id, provider_id, status, raw_transcript
      ) VALUES ($1, $2, $3, $4, 'PENDING', $5)
      RETURNING id, tenant_id, encounter_id, patient_id, provider_id, status,
                subjective, objective, assessment, plan, raw_transcript,
                created_at, updated_at
    `;

    const res = await this.query<SoapNoteRecord>(sql, [
      this.tenantId,
      encounterId,
      patientId,
      providerId,
      rawTranscript,
    ]);

    return this.mapSoapRecordToDto(res.rows[0]);
  }

  /**
   * Updates an existing note with generated SOAP structured content and marks as COMPLETED.
   */
  public async updateCompletedSoapNote(
    noteId: string,
    data: SoapStructuredOutput
  ): Promise<SoapNoteDto | null> {
    const sql = `
      UPDATE soap_notes
      SET status = 'COMPLETED',
          subjective = $1,
          objective = $2,
          assessment = $3,
          plan = $4,
          updated_at = NOW()
      WHERE id = $5
      RETURNING id, tenant_id, encounter_id, patient_id, provider_id, status,
                subjective, objective, assessment, plan, raw_transcript,
                created_at, updated_at
    `;

    const res = await this.query<SoapNoteRecord>(sql, [
      data.subjective,
      data.objective,
      data.assessment,
      data.plan,
      noteId,
    ]);

    if (res.rows.length === 0) return null;
    return this.mapSoapRecordToDto(res.rows[0]);
  }

  /**
   * Marks a note as FAILED if AI processing or validation encounters an unrecoverable error.
   */
  public async updateFailedSoapNote(noteId: string): Promise<void> {
    const sql = `
      UPDATE soap_notes
      SET status = 'FAILED',
          updated_at = NOW()
      WHERE id = $1
    `;
    await this.query(sql, [noteId]);
  }

  /**
   * Retrieves a SOAP note by UUID.
   */
  public async findNoteById(noteId: string): Promise<SoapNoteDto | null> {
    const sql = `
      SELECT id, tenant_id, encounter_id, patient_id, provider_id, status,
             subjective, objective, assessment, plan, raw_transcript,
             created_at, updated_at
      FROM soap_notes
      WHERE id = $1
      LIMIT 1
    `;

    const res = await this.query<SoapNoteRecord>(sql, [noteId]);
    if (res.rows.length === 0) return null;
    return this.mapSoapRecordToDto(res.rows[0]);
  }

  /**
   * Creates an Encounter for a patient.
   */
  public async createEncounter(
    patientId: string,
    providerId: string,
    reason?: string
  ): Promise<EncounterRecord> {
    const sql = `
      INSERT INTO encounters (
        tenant_id, patient_id, provider_id, reason, status
      ) VALUES ($1, $2, $3, $4, 'IN_PROGRESS')
      RETURNING id, tenant_id, patient_id, provider_id, encounter_date, status, reason, created_at, updated_at
    `;

    const res = await this.query<EncounterRecord>(sql, [
      this.tenantId,
      patientId,
      providerId,
      reason || null,
    ]);

    return res.rows[0];
  }

  /**
   * Finds an Encounter by ID.
   */
  public async findEncounterById(encounterId: string): Promise<EncounterRecord | null> {
    const sql = `
      SELECT id, tenant_id, patient_id, provider_id, encounter_date, status, reason, created_at, updated_at
      FROM encounters
      WHERE id = $1
      LIMIT 1
    `;

    const res = await this.query<EncounterRecord>(sql, [encounterId]);
    if (res.rows.length === 0) return null;
    return res.rows[0];
  }
}
