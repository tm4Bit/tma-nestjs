import { z } from 'zod';

const LOG_LEVELS = [
  'error',
  'warn',
  'info',
  'http',
  'verbose',
  'debug',
  'silly',
] as const;

const booleanFromEnv = z.preprocess((value) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value !== 'string') {
    return value;
  }

  const normalized = value.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) {
    return true;
  }

  if (['0', 'false', 'no', 'off', ''].includes(normalized)) {
    return false;
  }

  return value;
}, z.boolean());

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().positive().default(3306),
  DB_NAME: z.string().min(1),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  REDIS_HOST: z.string().min(1),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  LOG_DIR: z.string().min(1).default('/app/.logs'),
  LOG_LEVEL: z.enum(LOG_LEVELS).optional(),
  LOG_MAX_FILES: z.string().min(1).default('14d'),
  LOG_MAX_SIZE: z.string().min(1).default('20m'),
  LOG_DATE_PATTERN: z.string().min(1).default('YYYY-MM-DD'),
  LOG_ZIPPED_ARCHIVE: booleanFromEnv.optional(),
});

type ParsedEnv = z.infer<typeof envSchema>;

export type Env = Omit<ParsedEnv, 'LOG_LEVEL' | 'LOG_ZIPPED_ARCHIVE'> & {
  LOG_LEVEL: (typeof LOG_LEVELS)[number];
  LOG_ZIPPED_ARCHIVE: boolean;
};

let cachedEnv: Env | null = null;

export const getEnv = (): Env => {
  if (!cachedEnv) {
    const parsed = envSchema.parse(process.env);
    const defaultLevel = parsed.NODE_ENV === 'development' ? 'debug' : 'info';

    cachedEnv = {
      ...parsed,
      LOG_LEVEL: parsed.LOG_LEVEL ?? defaultLevel,
      LOG_ZIPPED_ARCHIVE:
        parsed.LOG_ZIPPED_ARCHIVE ?? parsed.NODE_ENV === 'production',
    };
  }

  return cachedEnv;
};

export const resetEnv = (): void => {
  cachedEnv = null;
};
