import { Request, Response, NextFunction } from 'express';
import { ChartRepository } from './chart.repository';
import { addChartSummaryJob } from '../../lib/bullmq';
import { SummarizeTranscriptSchemaInput, CreateEncounterSchemaInput } from './chart.schemas';
import { ApiResponse } from '../../types';
import { SoapNoteDto } from './chart.types';

export class ChartController {
  /**
   * Asynchronous Gemini Clinical AI Transcript Summarization
   * Flow:
   * 1. Receive raw clinical encounter transcript
   * 2. Insert PENDING note record into PostgreSQL
   * 3. Dispatch task to BullMQ Redis Queue
   * 4. Return HTTP 202 Accepted immediately with pending record
   */
  public async summarizeTranscript(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const tenantId = req.tenant!.tenantId;
      const providerId = req.user?.userId || '00000000-0000-0000-0000-000000000000';
      const { patientId, encounterId, rawText } = req.body as SummarizeTranscriptSchemaInput;

      const repo = new ChartRepository(tenantId);

      // 1. Create Pending summary record in PostgreSQL under tenant's RLS
      const pendingNote = await repo.createPendingSoapNote(
        encounterId,
        patientId,
        providerId,
        rawText
      );

      // 2. Push job to BullMQ Redis queue
      const jobId = await addChartSummaryJob({
        noteId: pendingNote.id,
        patientId,
        encounterId,
        tenantId,
        rawText,
        requestedByUserId: providerId,
      });

      // 3. Immediately return HTTP 202 Accepted
      const response: ApiResponse<{ note: SoapNoteDto; jobId: string }> = {
        success: true,
        message: 'Clinical transcript accepted for asynchronous AI SOAP summarization.',
        data: {
          note: pendingNote,
          jobId,
        },
      };

      res.status(202).json(response);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Retrieves status and content of a SOAP note
   */
  public async getNote(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.tenant!.tenantId;
      const noteId = req.params.id;

      const repo = new ChartRepository(tenantId);
      const note = await repo.findNoteById(noteId);

      if (!note) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOTE_NOT_FOUND',
            message: `SOAP note with ID ${noteId} not found.`,
            timestamp: new Date().toISOString(),
            requestId: req.requestId,
          },
        });
        return;
      }

      const response: ApiResponse<SoapNoteDto> = {
        success: true,
        data: note,
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Creates a new Encounter for a patient
   */
  public async createEncounter(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const tenantId = req.tenant!.tenantId;
      const providerId = req.user?.userId || '00000000-0000-0000-0000-000000000000';
      const { patientId, reason } = req.body as CreateEncounterSchemaInput;

      const repo = new ChartRepository(tenantId);
      const encounter = await repo.createEncounter(patientId, providerId, reason);

      res.status(201).json({
        success: true,
        message: 'Encounter initialized',
        data: encounter,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const chartController = new ChartController();
