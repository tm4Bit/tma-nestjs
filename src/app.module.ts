import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { BlogPostsModule } from './blog-posts/blog-posts.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppRepository } from './app.repository';
import { LoggingModule } from './logging/logging.module';

@Module({
  imports: [LoggingModule, DatabaseModule, BlogPostsModule],
  controllers: [AppController],
  providers: [AppService, AppRepository],
})
export class AppModule {}
