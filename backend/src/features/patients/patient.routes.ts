import { Router } from 'express';
import { patientController } from './patient.controller';
import { requireTenant } from '../../middlewares/tenantContext.middleware';
import { authenticateJWT } from '../../middlewares/auth.middleware';
import { rbac } from '../../middlewares/rbac.middleware';
import { auditLogger } from '../../middlewares/auditLogger.middleware';
import { validateZod } from '../../middlewares/validateZod.middleware';
import {
  createPatientSchema,
  updatePatientSchema,
  patientIdParamSchema,
} from './patient.schemas';

const router = Router();

// All patient endpoints require valid tenant, JWT authentication, and audit logging
router.use(requireTenant, authenticateJWT, auditLogger);

// GET /api/v1/patients - List patients (Paginated)
router.get('/', rbac('patient:read'), patientController.listPatients);

// GET /api/v1/patients/:id - Retrieve patient MPI demographics
router.get(
  '/:id',
  rbac('patient:read'),
  validateZod({ params: patientIdParamSchema }),
  patientController.getPatient
);

// POST /api/v1/patients - Register new patient
router.post(
  '/',
  rbac('patient:write'),
  validateZod(createPatientSchema),
  patientController.createPatient
);

// PUT /api/v1/patients/:id - Update existing patient
router.put(
  '/:id',
  rbac('patient:write'),
  validateZod({ params: patientIdParamSchema, body: updatePatientSchema }),
  patientController.updatePatient
);

export default router;
