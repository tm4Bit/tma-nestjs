import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module.js';
import { BlogPostsController } from './blog-posts.controller.js';
import { BlogPostsRepository } from './blog-posts.repository.js';
import { BlogPostsService } from './blog-posts.service.js';

@Module({
  imports: [DatabaseModule],
  controllers: [BlogPostsController],
  providers: [BlogPostsService, BlogPostsRepository],
})
export class BlogPostsModule {}
