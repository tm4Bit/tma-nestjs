import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { BLOG_POST_JOB_NAME, BLOG_POSTS_QUEUE } from './blog-posts.constants';
import { NotificationEmailJobPayload } from './blog-posts.domain.types';

@Processor(BLOG_POSTS_QUEUE)
export class BlogPostsWorker extends WorkerHost {
  private readonly logger = new Logger(BlogPostsWorker.name);

  async process(job: Job): Promise<unknown> {
    switch (job.name) {
      case BLOG_POST_JOB_NAME.notificationEmail:
        return this.handleNotificationEmail(
          job.data as NotificationEmailJobPayload,
        );
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
        return null;
    }
  }

  private async handleNotificationEmail(
    data: NotificationEmailJobPayload,
  ): Promise<void> {
    this.logger.log(
      `Sending notification email for post "${data.title}" (id=${data.postId})`,
    );
    // TODO: inject and call an EmailService here
    await Promise.resolve();
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job): void {
    this.logger.log(`Job ${job.id} (${job.name}) completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error): void {
    this.logger.error(`Job ${job.id} (${job.name}) failed: ${error.message}`);
  }
}
