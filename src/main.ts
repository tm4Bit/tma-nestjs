import { LoggerService } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { cleanupOpenApiDoc } from 'nestjs-zod';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app.module';
import { getEnv } from './config/env';
import { configureHttpApp } from './bootstrap/configure-http-app';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // === logger ===
  const winstonLogger = app.get<LoggerService>(
    WINSTON_MODULE_NEST_PROVIDER as string,
  );
  app.useLogger(winstonLogger);

  // === http app configuration ===
  configureHttpApp(app);

  // === swagger setup ===
  const openApiDoc = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('TMA NestJS API')
      .setDescription('API documentation')
      .setVersion('1.0')
      .build(),
  );
  SwaggerModule.setup('swagger', app, cleanupOpenApiDoc(openApiDoc));

  await app.listen(getEnv().PORT);
}
void bootstrap();
