import { Test } from '@nestjs/testing';
import { AppController } from './app.controller.js';
import { AppModule } from './app.module.js';
import { resetEnv } from './config/env.js';

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
