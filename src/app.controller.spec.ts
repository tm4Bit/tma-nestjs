import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppRepository } from './app.repository';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: AppRepository,
          useValue: {
            getDatabaseVersion: jest.fn().mockResolvedValue('test-version'),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return status ok', async () => {
      const result = await appController.checkhealth();

      expect(result.status).toBe('ok');
      expect(result.databaseVersion).toBe('test-version');
    });
  });
});
