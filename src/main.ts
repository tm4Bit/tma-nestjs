import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { getEnv } from './config/env.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(getEnv().PORT);
}
void bootstrap();
