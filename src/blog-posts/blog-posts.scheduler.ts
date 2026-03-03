import { Injectable, Logger } from '@nestjs/common';
// import { Interval } from '@nestjs/schedule';

@Injectable()
export class BlogPostsScheduler {
  private readonly logger = new Logger(BlogPostsScheduler.name);

  //////////////////////////////////////////////////////////////////////////////
  // NOTE: Uncomment the following line and the import statement
  // to test the scheduler functionality.
  // This method will log a heartbeat message every 15 seconds.
  //////////////////////////////////////////////////////////////////////////////
  // @Interval(15000)
  logHeartbeat(): void {
    this.logger.log('blog-posts heartbeat');
  }
}
