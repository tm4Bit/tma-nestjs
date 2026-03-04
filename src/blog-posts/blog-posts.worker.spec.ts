import { BlogPostsWorker } from './blog-posts.worker';
import { BlogPostsJobName } from './blog-posts.domain.types';
import type { SendWelcomeEmailJobPayload } from './blog-posts.domain.types';
import { Job } from 'bullmq';

const makeJob = (name: string, data: unknown): Job =>
  ({ id: '1', name, data }) as unknown as Job;

describe('BlogPostsWorker', () => {
  let worker: BlogPostsWorker;
  let logSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    worker = new BlogPostsWorker();
    logSpy = jest
      .spyOn(worker['logger'], 'log')
      .mockImplementation(() => undefined);
    warnSpy = jest
      .spyOn(worker['logger'], 'warn')
      .mockImplementation(() => undefined);
  });

  describe('process', () => {
    it('handles send-welcome-email job', async () => {
      const payload: SendWelcomeEmailJobPayload = {
        postId: 1,
        title: 'Hello',
        slug: 'hello',
      };
      const job = makeJob(BlogPostsJobName.SendWelcomeEmail, payload);

      await expect(worker.process(job)).resolves.toBeUndefined();
      expect(logSpy).toHaveBeenCalledWith(
        `Sending welcome email for post "${payload.title}" (id=${payload.postId})`,
      );
    });

    it('warns and returns null for unknown job names', async () => {
      const job = makeJob('unknown-job', {});

      await expect(worker.process(job)).resolves.toBeNull();
      expect(warnSpy).toHaveBeenCalledWith('Unknown job name: unknown-job');
    });
  });

  describe('onCompleted', () => {
    it('logs job completion', () => {
      const job = makeJob(BlogPostsJobName.SendWelcomeEmail, {});

      worker.onCompleted(job);

      expect(logSpy).toHaveBeenCalledWith(
        `Job ${job.id} (${job.name}) completed`,
      );
    });
  });

  describe('onFailed', () => {
    it('logs job failure', () => {
      const errorSpy = jest
        .spyOn(worker['logger'], 'error')
        .mockImplementation(() => undefined);
      const job = makeJob(BlogPostsJobName.SendWelcomeEmail, {});
      const error = new Error('something went wrong');

      worker.onFailed(job, error);

      expect(errorSpy).toHaveBeenCalledWith(
        `Job ${job.id} (${job.name}) failed: ${error.message}`,
      );
    });
  });
});
