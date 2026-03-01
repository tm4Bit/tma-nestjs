import { LoggerService } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app.module';
import { getEnv } from './config/env';
import { configureHttpApp } from './bootstrap/configure-http-app';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const winstonLogger = app.get<LoggerService>(
    WINSTON_MODULE_NEST_PROVIDER as string,
  );
  app.useLogger(winstonLogger);
  configureHttpApp(app);
  await app.listen(getEnv().PORT);
}
void bootstrap();
