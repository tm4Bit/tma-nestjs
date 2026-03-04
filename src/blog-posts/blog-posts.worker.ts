import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import {
  BLOG_POSTS_QUEUE,
  BlogPostsJobName,
  SendWelcomeEmailJobPayload,
} from './blog-posts.domain.types';

@Processor(BLOG_POSTS_QUEUE)
export class BlogPostsWorker extends WorkerHost {
  private readonly logger = new Logger(BlogPostsWorker.name);

  async process(job: Job): Promise<unknown> {
    switch (job.name) {
      case BlogPostsJobName.SendWelcomeEmail:
        return this.handleSendWelcomeEmail(
          job.data as SendWelcomeEmailJobPayload,
        );
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
        return null;
    }
  }

  private async handleSendWelcomeEmail(
    data: SendWelcomeEmailJobPayload,
  ): Promise<void> {
    this.logger.log(
      `Sending welcome email for post "${data.title}" (id=${data.postId})`,
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
