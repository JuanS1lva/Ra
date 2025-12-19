import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .string({
      required_error: 'NODE_ENV is required',
    })
    .min(1, 'NODE_ENV is required'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z
    .string({
      required_error: 'DATABASE_URL is required',
    })
    .min(1, 'DATABASE_URL is required'),
  REDIS_URL: z.string().optional(),
  CORS_ORIGINS: z.string().optional(),
});

export type EnvSchema = z.infer<typeof envSchema>;

export const validateEnv = (config: Record<string, unknown>): EnvSchema => {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    const message = result.error.issues
      .map((issue) => issue.message)
      .join(', ');
    throw new Error(`Environment validation failed: ${message}`);
  }
  return result.data;
};
