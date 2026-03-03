import { Test } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppModule } from './app.module';
import { resetEnv } from './config/env';

jest.mock('winston-daily-rotate-file', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
  const Transport = require('winston-transport');
  return class DailyRotateFile extends Transport {
    log(_info: unknown, callback: () => void) {
      callback();
    }
  };
});

describe('AppModule wiring', () => {
  const envSnapshot = { ...process.env };

  beforeEach(() => {
    process.env = {
      ...envSnapshot,
      NODE_ENV: 'test',
      DB_HOST: 'localhost',
      DB_PORT: '3306',
      DB_NAME: 'app',
      DB_USER: 'app',
      DB_PASSWORD: 'app',
      REDIS_HOST: 'localhost',
      REDIS_PORT: '6379',
      REDIS_PASSWORD: '',
    };
    resetEnv();
  });

  afterEach(() => {
    process.env = envSnapshot;
    resetEnv();
  });

  it('compiles the root module and resolves key wiring', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    expect(moduleRef.get(AppController, { strict: false })).toBeDefined();

    await moduleRef.close();
  });
});
