import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { getEnv } from '../config/env';

@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: () => {
        const env = getEnv();
        return {
          connection: {
            host: env.REDIS_HOST,
            port: env.REDIS_PORT,
            password: env.REDIS_PASSWORD,
          },
        };
      },
    }),
  ],
})
export class QueueModule {}
