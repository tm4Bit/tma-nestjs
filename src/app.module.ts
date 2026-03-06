import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';
import { DatabaseModule } from './database/database.module';
import { BlogPostsModule } from './blog-posts/blog-posts.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppRepository } from './app.repository';
import { LoggingModule } from './logging/logging.module';
import { SchedulingModule } from './scheduling/scheduling.module';
import { QueueModule } from './queue/queue.module';

@Module({
  imports: [
    // Core modules
    LoggingModule,
    DatabaseModule,
    SchedulingModule,
    QueueModule,

    // Feature modules
    BlogPostsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AppRepository,
    { provide: APP_PIPE, useClass: ZodValidationPipe },
    { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },
  ],
})
export class AppModule {}
