import {
  QueueEventsHost,
  QueueEventsListener,
  OnQueueEvent,
} from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { BLOG_POSTS_QUEUE } from './blog-posts.constants';

@QueueEventsListener(BLOG_POSTS_QUEUE)
export class BlogPostsEventsListener extends QueueEventsHost {
  private readonly logger = new Logger(BlogPostsEventsListener.name);

  @OnQueueEvent('active')
  onActive(job: { jobId: string }): void {
    this.logger.log(`Job ${job.jobId} became active`);
  }

  @OnQueueEvent('completed')
  onCompleted(job: { jobId: string; returnvalue: string }): void {
    this.logger.log(`Job ${job.jobId} completed`);
  }

  @OnQueueEvent('failed')
  onFailed(job: { jobId: string; failedReason: string }): void {
    this.logger.error(`Job ${job.jobId} failed: ${job.failedReason}`);
  }
}
