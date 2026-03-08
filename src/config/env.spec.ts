import { getEnv, resetEnv } from './env';

const ORIGINAL_ENV = process.env;

const buildEnv = (
  overrides: Partial<NodeJS.ProcessEnv>,
): NodeJS.ProcessEnv => ({
  ...ORIGINAL_ENV,
  NODE_ENV: 'test',
  PORT: '3000',
  DB_HOST: 'localhost',
  DB_PORT: '3306',
  DB_NAME: 'app',
  DB_USER: 'user',
  DB_PASSWORD: 'pass',
  REDIS_HOST: 'localhost',
  REDIS_PORT: '6379',
  REDIS_PASSWORD: '',
  JWT_SECRET: 'test-secret',
  LOG_DIR: '/app/.logs',
  LOG_LEVEL: 'info',
  LOG_MAX_FILES: '14d',
  LOG_MAX_SIZE: '20m',
  LOG_DATE_PATTERN: 'YYYY-MM-DD',
  LOG_ZIPPED_ARCHIVE: 'false',
  ...overrides,
});

describe('env config', () => {
  beforeEach(() => {
    resetEnv();
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
    resetEnv();
  });

  it('parses required database settings', () => {
    process.env = buildEnv({});

    const env = getEnv();

    expect(env.DB_HOST).toBe('localhost');
    expect(env.DB_PORT).toBe(3306);
    expect(env.DB_NAME).toBe('app');
    expect(env.DB_USER).toBe('user');
    expect(env.DB_PASSWORD).toBe('pass');
    expect(env.REDIS_HOST).toBe('localhost');
    expect(env.REDIS_PORT).toBe(6379);
    expect(env.REDIS_PASSWORD).toBe('');
    expect(env.LOG_DIR).toBe('/app/.logs');
    expect(env.LOG_LEVEL).toBe('info');
    expect(env.LOG_MAX_FILES).toBe('14d');
    expect(env.LOG_MAX_SIZE).toBe('20m');
    expect(env.LOG_DATE_PATTERN).toBe('YYYY-MM-DD');
    expect(env.LOG_ZIPPED_ARCHIVE).toBe(false);
  });

  it('throws when required values are missing', () => {
    process.env = buildEnv({ DB_HOST: '' });

    expect(() => getEnv()).toThrow();
  });

  it('throws when required redis values are missing', () => {
    process.env = buildEnv({ REDIS_HOST: '' });

    expect(() => getEnv()).toThrow();
  });

  it('defaults LOG_ZIPPED_ARCHIVE to true in production', () => {
    process.env = buildEnv({
      NODE_ENV: 'production',
      LOG_ZIPPED_ARCHIVE: undefined,
      LOG_LEVEL: undefined,
    });

    const env = getEnv();

    expect(env.LOG_ZIPPED_ARCHIVE).toBe(true);
    expect(env.LOG_LEVEL).toBe('info');
  });

  it('defaults LOG_LEVEL to debug in development', () => {
    process.env = buildEnv({
      NODE_ENV: 'development',
      LOG_LEVEL: undefined,
    });

    const env = getEnv();

    expect(env.LOG_LEVEL).toBe('debug');
  });

  it('parses LOG_ZIPPED_ARCHIVE from string values', () => {
    process.env = buildEnv({ LOG_ZIPPED_ARCHIVE: 'true' });

    const env = getEnv();

    expect(env.LOG_ZIPPED_ARCHIVE).toBe(true);
  });

  it('accepts a boolean value directly for LOG_ZIPPED_ARCHIVE', () => {
    process.env = buildEnv({
      LOG_ZIPPED_ARCHIVE: true as unknown as string,
    });

    const env = getEnv();

    expect(env.LOG_ZIPPED_ARCHIVE).toBe(true);
  });

  it('throws when LOG_ZIPPED_ARCHIVE is a non-string non-boolean value', () => {
    process.env = buildEnv({
      LOG_ZIPPED_ARCHIVE: 42 as unknown as string,
    });

    expect(() => getEnv()).toThrow();
  });

  it('throws when LOG_ZIPPED_ARCHIVE is an unrecognized string', () => {
    process.env = buildEnv({ LOG_ZIPPED_ARCHIVE: 'maybe' });

    expect(() => getEnv()).toThrow();
  });
});
