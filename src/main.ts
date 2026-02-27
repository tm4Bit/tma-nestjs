import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { getEnv } from './config/env.js';
import { configureHttpApp } from './bootstrap/configure-http-app.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureHttpApp(app);
  await app.listen(getEnv().PORT);
}
void bootstrap();
