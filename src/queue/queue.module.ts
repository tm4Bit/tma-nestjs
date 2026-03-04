import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { getEnv } from '../config/env';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: getEnv().REDIS_HOST,
        port: getEnv().REDIS_PORT,
        password: getEnv().REDIS_PASSWORD,
      },
    }),
  ],
})
export class QueueModule {}
