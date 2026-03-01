import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { BlogPostsService } from './blog-posts.service';
import type { BlogPost } from './blog-posts.types';

describe('BlogPostsService', () => {
  const basePost: BlogPost = {
    id: 1,
    title: 'Hello',
    slug: 'hello',
    content: 'Body',
    publishedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('create', () => {
    it('returns created post', async () => {
      const repository = {
        create: jest.fn().mockResolvedValue(basePost),
      };
      const service = new BlogPostsService(repository as never);

      await expect(
        service.create({ title: 'Hello', slug: 'hello', content: 'Body' }),
      ).resolves.toEqual(basePost);
      expect(repository.create).toHaveBeenCalledWith({
        title: 'Hello',
        slug: 'hello',
        content: 'Body',
      });
    });

    it('throws when repository returns null', async () => {
      const repository = {
        create: jest.fn().mockResolvedValue(null),
      };
      const service = new BlogPostsService(repository as never);

      await expect(
        service.create({ title: 'Hello', slug: 'hello', content: 'Body' }),
      ).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });

  describe('list', () => {
    it('returns posts from repository', async () => {
      const posts = [basePost];
      const repository = {
        list: jest.fn().mockResolvedValue(posts),
      };
      const service = new BlogPostsService(repository as never);

      await expect(service.list(10)).resolves.toEqual(posts);
      expect(repository.list).toHaveBeenCalledWith(10);
    });
  });

  describe('get', () => {
    it('returns a post when found', async () => {
      const repository = {
        findById: jest.fn().mockResolvedValue(basePost),
      };
      const service = new BlogPostsService(repository as never);

      await expect(service.get(1)).resolves.toEqual(basePost);
    });

    it('throws when a post is missing', async () => {
      const repository = {
        findById: jest.fn().mockResolvedValue(null),
      };
      const service = new BlogPostsService(repository as never);

      await expect(service.get(2)).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('update', () => {
    it('returns updated post', async () => {
      const updatedPost = { ...basePost, title: 'Updated' };
      const repository = {
        update: jest.fn().mockResolvedValue(updatedPost),
      };
      const service = new BlogPostsService(repository as never);

      await expect(service.update(4, { title: 'Updated' })).resolves.toEqual(
        updatedPost,
      );
      expect(repository.update).toHaveBeenCalledWith(4, { title: 'Updated' });
    });

    it('throws when update target is missing', async () => {
      const repository = {
        update: jest.fn().mockResolvedValue(null),
      };
      const service = new BlogPostsService(repository as never);

      await expect(
        service.update(99, { title: 'Updated' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('publish', () => {
    it('returns published post', async () => {
      const publishedPost = { ...basePost, publishedAt: new Date() };
      const repository = {
        publish: jest.fn().mockResolvedValue(publishedPost),
      };
      const service = new BlogPostsService(repository as never);

      await expect(service.publish(4)).resolves.toEqual(publishedPost);
    });

    it('throws when publish target is missing', async () => {
      const repository = {
        publish: jest.fn().mockResolvedValue(null),
      };
      const service = new BlogPostsService(repository as never);

      await expect(service.publish(4)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('completes when repository deletes post', async () => {
      const repository = {
        delete: jest.fn().mockResolvedValue(true),
      };
      const service = new BlogPostsService(repository as never);

      await expect(service.delete(3)).resolves.toBeUndefined();
      expect(repository.delete).toHaveBeenCalledWith(3);
    });

    it('throws when delete cannot find a post', async () => {
      const repository = {
        delete: jest.fn().mockResolvedValue(false),
      };
      const service = new BlogPostsService(repository as never);

      await expect(service.delete(3)).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
