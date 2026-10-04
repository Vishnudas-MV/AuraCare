import { Request, Response, NextFunction } from 'express';
import { PatientRepository } from './patient.repository';
import { CreatePatientSchemaInput, UpdatePatientSchemaInput } from './patient.schemas';
import { ApiResponse, PaginatedResult } from '../../types';
import { PatientDto } from './patient.types';

export class PatientController {
  public async getPatient(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.tenant!.tenantId;
      const patientId = req.params.id;

      const repo = new PatientRepository(tenantId);
      const patient = await repo.findById(patientId);

      if (!patient) {
        res.status(404).json({
          success: false,
          error: {
            code: 'PATIENT_NOT_FOUND',
            message: `Patient with ID ${patientId} not found in this organization.`,
            timestamp: new Date().toISOString(),
            requestId: req.requestId,
          },
        });
        return;
      }

      const response: ApiResponse<PatientDto> = {
        success: true,
        data: patient,
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public async listPatients(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.tenant!.tenantId;
      const page = parseInt((req.query.page as string) || '1', 10);
      const limit = parseInt((req.query.limit as string) || '20', 10);
      const search = (req.query.search as string) || undefined;
      const offset = (page - 1) * limit;

      const repo = new PatientRepository(tenantId);
      const { items, total } = await repo.findAll(limit, offset, search);

      const paginatedResult: PaginatedResult<PatientDto> = {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };

      const response: ApiResponse<PaginatedResult<PatientDto>> = {
        success: true,
        data: paginatedResult,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasMore: page * limit < total,
        },
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public async createPatient(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.tenant!.tenantId;
      const input = req.body as CreatePatientSchemaInput;

      const repo = new PatientRepository(tenantId);

      // Check for MRN duplicate in tenant
      const existing = await repo.findByMrn(input.mrn);
      if (existing) {
        res.status(409).json({
          success: false,
          error: {
            code: 'MRN_CONFLICT',
            message: `A patient with MRN ${input.mrn} already exists in this practice.`,
            timestamp: new Date().toISOString(),
            requestId: req.requestId,
          },
        });
        return;
      }

      const created = await repo.create(input);

      const response: ApiResponse<PatientDto> = {
        success: true,
        message: 'Patient record registered successfully',
        data: created,
      };

      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  }

  public async updatePatient(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.tenant!.tenantId;
      const patientId = req.params.id;
      const input = req.body as UpdatePatientSchemaInput;

      const repo = new PatientRepository(tenantId);
      const updated = await repo.update(patientId, input);

      if (!updated) {
        res.status(404).json({
          success: false,
          error: {
            code: 'PATIENT_NOT_FOUND',
            message: `Patient with ID ${patientId} not found.`,
            timestamp: new Date().toISOString(),
            requestId: req.requestId,
          },
        });
        return;
      }

      const response: ApiResponse<PatientDto> = {
        success: true,
        message: 'Patient record updated successfully',
        data: updated,
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }
}

export const patientController = new PatientController();
