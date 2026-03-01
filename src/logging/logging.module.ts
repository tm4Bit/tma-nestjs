import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { getEnv } from '../config/env';
import { buildWinstonModuleOptions } from './winston.factory';

@Module({
  imports: [
    WinstonModule.forRootAsync({
      useFactory: () => buildWinstonModuleOptions(getEnv()),
    }),
  ],
})
export class LoggingModule {}
