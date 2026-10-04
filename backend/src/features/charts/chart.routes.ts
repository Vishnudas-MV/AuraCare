import { Router } from 'express';
import { chartController } from './chart.controller';
import { requireTenant } from '../../middlewares/tenantContext.middleware';
import { authenticateJWT } from '../../middlewares/auth.middleware';
import { rbac } from '../../middlewares/rbac.middleware';
import { auditLogger } from '../../middlewares/auditLogger.middleware';
import { validateZod } from '../../middlewares/validateZod.middleware';
import {
  summarizeTranscriptSchema,
  createEncounterSchema,
  chartNoteIdParamSchema,
} from './chart.schemas';

const router = Router();

// Clinical charting operations require tenant identification, JWT, and HIPAA audit logging
router.use(requireTenant, authenticateJWT, auditLogger);

// POST /api/v1/charts/summarize-transcript - Asynchronous BullMQ AI worker offload (Returns 202)
router.post(
  '/summarize-transcript',
  rbac('provider:write'),
  validateZod(summarizeTranscriptSchema),
  chartController.summarizeTranscript
);

// GET /api/v1/charts/notes/:id - Get SOAP note by ID
router.get(
  '/notes/:id',
  rbac('chart:read'),
  validateZod({ params: chartNoteIdParamSchema }),
  chartController.getNote
);

// POST /api/v1/charts/encounters - Initialize a clinical encounter
router.post(
  '/encounters',
  rbac('provider:write'),
  validateZod(createEncounterSchema),
  chartController.createEncounter
);

export default router;
