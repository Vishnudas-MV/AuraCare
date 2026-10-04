import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import cors, { CorsOptions } from 'cors';
import compression from 'compression';
import session from 'express-session';

import { env } from './config/env.config';
import { requestLimiter } from './middlewares/rateLimiter.middleware';
import { tenantContext } from './middlewares/tenantContext.middleware';
import { errorHandler } from './middlewares/errorHandler.middleware';
import { createSessionStore } from './lib/redis';
import apiRouter from './routes';

export function createApp(): Application {
  const app = express();

  // 1. Set secure security headers (HIPAA Compliant CSP & Headers)
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    })
  );

  // 2. Configure Origin locking (Strict CORS)
  const allowedOrigins = env.CORS_ORIGIN.split(',').map((origin) => origin.trim());
  const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, server-to-server, curl) in development
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy blocked access from origin: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Tenant-Id',
      'X-Request-Id',
      'X-Requested-With',
      'Accept',
    ],
    exposedHeaders: ['X-Request-Id', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'],
    maxAge: 86400, // 24 hours preflight cache
  };
  app.use(cors(corsOptions));

  // 3. Body Parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // 4. Gzip/Brotli compression
  app.use(compression());

  // 5. Rate Limiting (Redis-backed, sliding window)
  app.use(requestLimiter);

  // 6. Extract TenantID from host or request headers/body early
  app.use(tenantContext);

  // Redis Session Store hook for horizontal stateless scaling
  app.use(
    session({
      store: createSessionStore(),
      secret: env.JWT_SECRET,
      resave: false,
      saveUninitialized: false,
      name: 'auracare.sid',
      cookie: {
        secure: env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
      },
    })
  );

  // Root welcome / version probe
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      name: 'AuraCare EHR API',
      version: '1.0.0',
      status: 'operational',
      environment: env.NODE_ENV,
      documentation: `/api/${env.API_VERSION}/docs`,
    });
  });

  // Aggregated API v1 Router:
  // Step 7 (authenticateJWT), Step 8 (rbac), Step 9 (auditLogger), and Step 10 (validateZod)
  // are strictly orchestrated across the respective protected endpoints inside this router tree.
  app.use(`/api/${env.API_VERSION}`, apiRouter);

  // 404 Route Handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'ROUTE_NOT_FOUND',
        message: `The requested endpoint ${req.method} ${req.originalUrl} does not exist.`,
        timestamp: new Date().toISOString(),
        requestId: req.requestId,
      },
    });
  });

  // Global Centralized Error Handler (Masks stacks in production)
  app.use(errorHandler);

  return app;
}
