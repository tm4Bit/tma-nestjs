import { Test } from '@nestjs/testing';
import { Knex } from 'knex';
import { DatabaseModule } from './database.module.js';
import { KNEX_CONNECTION } from './knex.config.js';
import { resetEnv } from '../config/env.js';

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
  ...overrides,
});

describe('DatabaseModule', () => {
  beforeEach(() => {
    process.env = buildEnv({});
    resetEnv();
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
    resetEnv();
  });

  it('creates a shared Knex instance', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [DatabaseModule],
    }).compile();

    const knex = moduleRef.get<Knex>(KNEX_CONNECTION);

    expect(knex).toBeDefined();

    await moduleRef.close();
  });

  it('skips connection ping in test environment', async () => {
    const raw = jest.fn();
    const destroy = jest.fn();
    const moduleInstance = new DatabaseModule({
      raw,
      destroy,
    } as unknown as Knex);

    await moduleInstance.onModuleInit();

    expect(raw).not.toHaveBeenCalled();
  });

  it('destroys the connection on shutdown', async () => {
    const raw = jest.fn();
    const destroy = jest.fn().mockResolvedValue(undefined);
    const moduleInstance = new DatabaseModule({
      raw,
      destroy,
    } as unknown as Knex);

    await moduleInstance.onModuleDestroy();

    expect(destroy).toHaveBeenCalled();
  });
});
