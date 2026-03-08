import { buildKnexConfig } from './knex.config';
import { resetEnv } from '../config/env';

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
  ...overrides,
});

describe('buildKnexConfig', () => {
  beforeEach(() => {
    resetEnv();
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
    resetEnv();
  });

  it('builds config from environment', () => {
    process.env = buildEnv({});

    const config = buildKnexConfig();

    expect(config.client).toBe('mysql2');
    expect(config.connection).toMatchObject({
      host: 'localhost',
      port: 3306,
      database: 'app',
      user: 'user',
      password: 'pass',
    });
  });
});
