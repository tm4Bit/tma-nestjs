import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AppRepository } from './app.repository.js';

@Module({
  imports: [DatabaseModule],
  controllers: [AppController],
  providers: [AppService, AppRepository],
})
export class AppModule {}
