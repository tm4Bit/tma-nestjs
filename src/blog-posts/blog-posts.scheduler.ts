import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { INTERVAL_SECONDS } from './blog-posts.constants';

@Injectable()
export class BlogPostsScheduler {
  private readonly logger = new Logger(BlogPostsScheduler.name);

  //////////////////////////////////////////////////////////////////////////////
  // NOTE: Uncomment the following line and the import statement
  // to test the scheduler functionality.
  // This method will log a heartbeat message every 15 seconds.
  //////////////////////////////////////////////////////////////////////////////
  @Interval(INTERVAL_SECONDS)
  logHeartbeat(): void {
    this.logger.log(INTERVAL_SECONDS);
    this.logger.log('blog-posts heartbeat');
  }
}
