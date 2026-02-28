import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppController } from '../src/app.controller.js';
import { AppService } from '../src/app.service.js';
import { AppRepository } from '../src/app.repository.js';
import { configureHttpApp } from '../src/bootstrap/configure-http-app.js';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: AppRepository,
          useValue: {
            getDatabaseVersion: jest.fn().mockResolvedValue('test-db'),
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureHttpApp(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect((response: { body: { status?: string } }) => {
        expect(response.body.status).toBe('ok');
      });
  });
});
