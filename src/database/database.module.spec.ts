import { Test } from '@nestjs/testing';
import { Knex } from 'knex';
import { DatabaseModule } from './database.module';
import { KNEX_CONNECTION } from './knex.config';
import { resetEnv } from '../config/env';

jest.mock('knex', () => ({
  knex: jest.fn().mockReturnValue({
    raw: jest.fn().mockResolvedValue(undefined),
    destroy: jest.fn().mockResolvedValue(undefined),
  }),
}));

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

  it('creates a knex connection via the module factory', async () => {
    const { knex } = jest.requireMock('knex') as { knex: jest.Mock };

    const module = await Test.createTestingModule({
      imports: [DatabaseModule],
    }).compile();

    expect(knex).toHaveBeenCalled();
    expect(module.get(KNEX_CONNECTION)).toBeDefined();

    await module.close();
  });

  it('pings database on init when not in test environment', async () => {
    process.env = buildEnv({ NODE_ENV: 'development' });
    resetEnv();

    const raw = jest.fn().mockResolvedValue(undefined);
    const moduleInstance = new DatabaseModule({
      raw,
      destroy: jest.fn(),
    } as unknown as Knex);

    await moduleInstance.onModuleInit();

    expect(raw).toHaveBeenCalledWith('select 1');
  });
});
