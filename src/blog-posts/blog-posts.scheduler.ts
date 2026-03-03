import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';

@Injectable()
export class BlogPostsScheduler {
  private readonly logger = new Logger(BlogPostsScheduler.name);

  @Interval(15000)
  logHeartbeat(): void {
    this.logger.log('blog-posts heartbeat');
  }
}
