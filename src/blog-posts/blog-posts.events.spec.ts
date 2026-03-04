import { BlogPostsEventsListener } from './blog-posts.events';

describe('BlogPostsEventsListener', () => {
  let listener: BlogPostsEventsListener;
  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    listener = new BlogPostsEventsListener();
    logSpy = jest
      .spyOn(listener['logger'], 'log')
      .mockImplementation(() => undefined);
    errorSpy = jest
      .spyOn(listener['logger'], 'error')
      .mockImplementation(() => undefined);
  });

  describe('onActive', () => {
    it('logs when a job becomes active', () => {
      listener.onActive({ jobId: '42' });

      expect(logSpy).toHaveBeenCalledWith('Job 42 became active');
    });
  });

  describe('onCompleted', () => {
    it('logs when a job completes', () => {
      listener.onCompleted({ jobId: '42', returnvalue: '{}' });

      expect(logSpy).toHaveBeenCalledWith('Job 42 completed');
    });
  });

  describe('onFailed', () => {
    it('logs when a job fails', () => {
      listener.onFailed({ jobId: '42', failedReason: 'timeout' });

      expect(errorSpy).toHaveBeenCalledWith('Job 42 failed: timeout');
    });
  });
});
