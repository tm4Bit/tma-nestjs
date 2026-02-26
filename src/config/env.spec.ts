import { getEnv, resetEnv } from './env.js';

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
  });

  it('throws when required values are missing', () => {
    process.env = buildEnv({ DB_HOST: '' });

    expect(() => getEnv()).toThrow();
  });
});
