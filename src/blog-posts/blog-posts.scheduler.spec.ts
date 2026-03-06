import { BlogPostsScheduler } from './blog-posts.scheduler';
import { INTERVAL_SECONDS } from './blog-posts.constants';

describe('BlogPostsScheduler', () => {
  let scheduler: BlogPostsScheduler;
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    scheduler = new BlogPostsScheduler();
    logSpy = jest
      .spyOn(scheduler['logger'], 'log')
      .mockImplementation(() => undefined);
  });

  describe('logHeartbeat', () => {
    it('logs the interval and a heartbeat message', () => {
      scheduler.logHeartbeat();

      expect(logSpy).toHaveBeenCalledWith(INTERVAL_SECONDS);
      expect(logSpy).toHaveBeenCalledWith('blog-posts heartbeat');
    });
  });
});
