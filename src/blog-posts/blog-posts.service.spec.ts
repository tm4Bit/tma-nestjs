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
});
