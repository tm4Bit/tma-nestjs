import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { BlogPostsController } from './blog-posts.controller';
import { BlogPostsRepository } from './blog-posts.repository';
import { BlogPostsService } from './blog-posts.service';
import { BlogPostsScheduler } from './blog-posts.scheduler';

@Module({
  imports: [DatabaseModule],
  controllers: [BlogPostsController],
  providers: [BlogPostsService, BlogPostsRepository, BlogPostsScheduler],
})
export class BlogPostsModule {}
