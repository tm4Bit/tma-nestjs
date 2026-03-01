import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { BlogPostsController } from './blog-posts.controller';
import { BlogPostsRepository } from './blog-posts.repository';
import { BlogPostsService } from './blog-posts.service';

@Module({
  imports: [DatabaseModule],
  controllers: [BlogPostsController],
  providers: [BlogPostsService, BlogPostsRepository],
})
export class BlogPostsModule {}
