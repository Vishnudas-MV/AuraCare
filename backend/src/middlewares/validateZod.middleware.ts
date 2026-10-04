import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

interface ValidationTargets {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

/**
 * Zod Schema Request Validation Middleware
 * Supports validating request body directly or target specific scopes (body, query, params)
 */
export function validateZod(schemaOrTargets: ZodSchema | ValidationTargets) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if ('parse' in schemaOrTargets && typeof schemaOrTargets.parse === 'function') {
        // Direct schema validation against req.body
        req.body = await schemaOrTargets.parseAsync(req.body);
      } else {
        const targets = schemaOrTargets as ValidationTargets;
        if (targets.body) {
          req.body = await targets.body.parseAsync(req.body);
        }
        if (targets.query) {
          req.query = await targets.query.parseAsync(req.query);
        }
        if (targets.params) {
          req.params = await targets.params.parseAsync(req.params);
        }
      }
      next();
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        const errors = err.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
          code: issue.code,
        }));

        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request payload or parameters',
            details: errors,
            timestamp: new Date().toISOString(),
            requestId: req.requestId,
          },
        });
        return;
      }

      next(err);
    }
  };
}
