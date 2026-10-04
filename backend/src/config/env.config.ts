import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load environment variables from .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  API_VERSION: z.string().default('v1'),

  // Security
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters for cryptographically secure signing'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  ENCRYPTION_KEY_PII: z
    .string()
    .regex(
      /^[0-9a-fA-F]{64}$/,
      'ENCRYPTION_KEY_PII must be a 64-character hexadecimal string (32 bytes for AES-256-GCM)'
    ),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  // PostgreSQL Configuration
  PGHOST: z.string().min(1, 'PGHOST is required'),
  PGPORT: z.coerce.number().int().default(5432),
  PGDATABASE: z.string().min(1, 'PGDATABASE is required'),
  PGUSER: z.string().min(1, 'PGUSER is required'),
  PGPASSWORD: z.string().default(''),
  PG_SSL_CA_CERT_PATH: z.string().optional().default(''),

  // Connection Pool Settings
  PG_POOL_MAX: z.coerce.number().int().positive().default(20),
  PG_POOL_IDLE_TIMEOUT: z.coerce.number().int().positive().default(30000),

  // Redis Configuration
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),
  REDIS_PASSWORD: z.string().optional().default(''),
  REDIS_TLS: z
    .string()
    .default('false')
    .transform((val) => val === 'true'),

  // Third-Party Integrations
  GEMINI_API_KEY: z.string().default('placeholder_gemini_key'),
  AWS_SES_KEY: z.string().optional().default('placeholder_aws_ses_key'),
});

export type EnvConfig = z.infer<typeof envSchema>;

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ FATAL: Invalid application environment configuration:');
  console.error(JSON.stringify(parsedEnv.error.format(), null, 2));
  process.exit(1);
}

export const env: EnvConfig = parsedEnv.data;
