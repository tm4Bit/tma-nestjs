import { NotFoundException } from '@nestjs/common';
import { BlogPostsController } from './blog-posts.controller.js';

describe('BlogPostsController', () => {
  const basePost = {
    id: 1,
    title: 'Hello',
    slug: 'hello',
    content: 'Body',
    publishedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('create', () => {
    it('forwards body to service and returns created post', async () => {
      const service = {
        create: jest.fn().mockResolvedValue(basePost),
      };
      const controller = new BlogPostsController(service as never);
      const body = { title: 'Hello', slug: 'hello', content: 'Body' };

      await expect(controller.create(body)).resolves.toEqual(basePost);
      expect(service.create).toHaveBeenCalledWith(body);
    });
  });

  describe('list', () => {
    it('calls service with query limit', async () => {
      const service = {
        list: jest.fn().mockResolvedValue([basePost]),
      };
      const controller = new BlogPostsController(service as never);

      await expect(controller.list({ limit: 10 })).resolves.toEqual([basePost]);
      expect(service.list).toHaveBeenCalledWith(10);
    });

    it('calls service with undefined when limit is omitted', async () => {
      const service = {
        list: jest.fn().mockResolvedValue([basePost]),
      };
      const controller = new BlogPostsController(service as never);

      await controller.list({} as { limit?: number });

      expect(service.list).toHaveBeenCalledWith(undefined);
    });
  });

  describe('get', () => {
    it('returns post from service', async () => {
      const service = {
        get: jest.fn().mockResolvedValue(basePost),
      };
      const controller = new BlogPostsController(service as never);

      await expect(controller.get({ id: 1 })).resolves.toEqual(basePost);
      expect(service.get).toHaveBeenCalledWith(1);
    });

    it('propagates not found errors', async () => {
      const service = {
        get: jest
          .fn()
          .mockRejectedValue(new NotFoundException('Blog post not found')),
      };
      const controller = new BlogPostsController(service as never);

      await expect(controller.get({ id: 2 })).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('forwards id and body to service', async () => {
      const updated = { ...basePost, title: 'Updated' };
      const service = {
        update: jest.fn().mockResolvedValue(updated),
      };
      const controller = new BlogPostsController(service as never);
      const body = { title: 'Updated' };

      await expect(controller.update({ id: 1 }, body)).resolves.toEqual(
        updated,
      );
      expect(service.update).toHaveBeenCalledWith(1, body);
    });
  });

  describe('pusblish', () => {
    it('forwards id to service publish action', async () => {
      const published = { ...basePost, publishedAt: new Date() };
      const service = {
        publish: jest.fn().mockResolvedValue(published),
      };
      const controller = new BlogPostsController(service as never);

      await expect(controller.pusblish({ id: 1 })).resolves.toEqual(published);
      expect(service.publish).toHaveBeenCalledWith(1);
    });
  });

  describe('remove', () => {
    it('calls service delete and returns void', async () => {
      const service = {
        delete: jest.fn().mockResolvedValue(undefined),
      };
      const controller = new BlogPostsController(service as never);

      await expect(controller.remove({ id: 1 })).resolves.toBeUndefined();
      expect(service.delete).toHaveBeenCalledWith(1);
    });

    it('propagates not found errors', async () => {
      const service = {
        delete: jest
          .fn()
          .mockRejectedValue(new NotFoundException('Blog post not found')),
      };
      const controller = new BlogPostsController(service as never);

      await expect(controller.remove({ id: 2 })).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
