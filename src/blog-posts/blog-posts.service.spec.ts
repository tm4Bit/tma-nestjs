import { NotFoundException } from '@nestjs/common';
import { BlogPostsService } from './blog-posts.service.js';
import type { BlogPost } from './blog-posts.types.js';

describe('BlogPostsService', () => {
  const post: BlogPost = {
    id: 1,
    title: 'Hello',
    slug: 'hello',
    content: 'Body',
    publishedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('returns a post when found', async () => {
    const repository = {
      findById: jest.fn().mockResolvedValue(post),
    };
    const service = new BlogPostsService(repository as never);

    await expect(service.get(1)).resolves.toEqual(post);
  });

  it('throws when a post is missing', async () => {
    const repository = {
      findById: jest.fn().mockResolvedValue(null),
    };
    const service = new BlogPostsService(repository as never);

    await expect(service.get(2)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws when delete cannot find a post', async () => {
    const repository = {
      delete: jest.fn().mockResolvedValue(false),
    };
    const service = new BlogPostsService(repository as never);

    await expect(service.delete(3)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('updates a post', async () => {
    const updatedPost = { ...post, title: 'Updated' };
    const repository = {
      update: jest.fn().mockResolvedValue(updatedPost),
    };
    const service = new BlogPostsService(repository as never);

    await expect(service.update(4, { title: 'Updated' })).resolves.toEqual(
      updatedPost,
    );
  });

  it('does not update title when not provided', async () => {
    const updatedPost = { ...post, title: 'Hello' };
    const repository = {
      update: jest.fn().mockResolvedValue(updatedPost),
    };
    const service = new BlogPostsService(repository as never);

    await expect(
      service.update(4, { content: 'New content' }),
    ).resolves.toEqual(updatedPost);
  });

  it('does not update a fiel send as null', async () => {
    const updatedPost = { ...post, title: 'Hello', publishedAt: null };
    const repository = {
      update: jest.fn().mockResolvedValue(updatedPost),
    };
    const service = new BlogPostsService(repository as never);

    await expect(service.update(4, { title: null })).resolves.toEqual(
      updatedPost,
    );
  });

  it('publishes a post', async () => {
    const publishedPost = { ...post, publishedAt: new Date() };
    const repository = {
      publish: jest.fn().mockResolvedValue(publishedPost),
    };
    const service = new BlogPostsService(repository as never);

    await expect(service.publish(4)).resolves.toEqual(publishedPost);
  });
});
