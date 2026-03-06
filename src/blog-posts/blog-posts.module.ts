import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { DatabaseModule } from '../database/database.module';
import { BlogPostsController } from './blog-posts.controller';
import { BlogPostsRepository } from './blog-posts.repository';
import { BlogPostsService } from './blog-posts.service';
import { BlogPostsScheduler } from './blog-posts.scheduler';
import { BlogPostsWorker } from './blog-posts.worker';
import { BlogPostsEventsListener } from './blog-posts.events';
import { BLOG_POSTS_QUEUE } from './blog-posts.constants';

@Module({
  imports: [
    DatabaseModule,
    BullModule.registerQueue({ name: BLOG_POSTS_QUEUE }),
  ],
  controllers: [BlogPostsController],
  providers: [
    BlogPostsService,
    BlogPostsRepository,
    BlogPostsScheduler,
    BlogPostsWorker,
    BlogPostsEventsListener,
  ],
})
export class BlogPostsModule {}
