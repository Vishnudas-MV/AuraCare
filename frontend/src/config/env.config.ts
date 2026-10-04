import { z } from 'zod';

/**
 * Strict Environment Configuration Schema validated at runtime startup using Zod.
 */
const envSchema = z.object({
  VITE_API_BASE_URL: z
    .string()
    .min(1, 'VITE_API_BASE_URL must not be empty')
    .default('http://localhost:5000/api/v1'),

  VITE_ENABLE_MOCK_API: z
    .union([z.boolean(), z.string()])
    .transform((val) => {
      if (typeof val === 'boolean') return val;
      return val.toLowerCase() === 'true' || val === '1';
    })
    .default(false),

  VITE_ENABLE_GEMINI_AMBIENT: z
    .union([z.boolean(), z.string()])
    .transform((val) => {
      if (typeof val === 'boolean') return val;
      return val.toLowerCase() === 'true' || val === '1';
    })
    .default(false),

  MODE: z.string().optional().default('development'),
  DEV: z.boolean().optional().default(true),
  PROD: z.boolean().optional().default(false),
});

export type EnvConfig = z.infer<typeof envSchema>;

function parseEnv(): EnvConfig {
  const rawEnv = {
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    VITE_ENABLE_MOCK_API: import.meta.env.VITE_ENABLE_MOCK_API,
    VITE_ENABLE_GEMINI_AMBIENT: import.meta.env.VITE_ENABLE_GEMINI_AMBIENT,
    MODE: import.meta.env.MODE,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD,
  };

  const parsed = envSchema.safeParse(rawEnv);

  if (!parsed.success) {
    const errorDetails = parsed.error.issues
      .map((issue) => ` - [${issue.path.join('.')}]: ${issue.message}`)
      .join('\n');

    console.error(
      `\n❌ [AuraCare Config Error] Invalid environment variables:\n${errorDetails}\n`
    );

    throw new Error(
      `Invalid AuraCare environment configuration. Check your .env file:\n${errorDetails}`
    );
  }

  return parsed.data;
}

export const env: EnvConfig = parseEnv();
