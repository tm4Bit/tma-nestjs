import { BlogPostsRepository } from './blog-posts.repository.js';
import type { BlogPost } from './blog-posts.types.js';

type Builder = {
  select: jest.Mock;
  where: jest.Mock;
  orderBy: jest.Mock;
  limit: jest.Mock;
  first: jest.Mock;
  insert: jest.Mock;
  update: jest.Mock;
  del: jest.Mock;
};

const createDbMock = (builder: Builder) => jest.fn().mockReturnValue(builder);

const createBuilder = (): Builder => ({
  select: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  first: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  del: jest.fn(),
});

const post: BlogPost = {
  id: 1,
  title: 'Hello',
  slug: 'hello',
  content: 'Content',
  publishedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('BlogPostsRepository', () => {
  describe('create', () => {
    it('creates a blog post and returns it', async () => {
      const builder = createBuilder();
      builder.insert.mockResolvedValue([1]);
      builder.first.mockResolvedValue(post);

      const db = createDbMock(builder);
      const repository = new BlogPostsRepository(db as never);

      const result = await repository.create({
        title: 'Hello',
        slug: 'hello',
        content: 'Content',
      });

      expect(builder.insert).toHaveBeenCalledWith({
        title: 'Hello',
        slug: 'hello',
        content: 'Content',
        published_at: null,
      });
      expect(result).toEqual(post);
    });

    it('uses provided publishedAt value', async () => {
      const builder = createBuilder();
      const publishedAt = new Date('2026-01-01T00:00:00.000Z');
      builder.insert.mockResolvedValue([1]);
      builder.first.mockResolvedValue({ ...post, publishedAt });

      const db = createDbMock(builder);
      const repository = new BlogPostsRepository(db as never);

      await repository.create({
        title: 'Hello',
        slug: 'hello',
        content: 'Content',
        publishedAt,
      });

      expect(builder.insert).toHaveBeenCalledWith({
        title: 'Hello',
        slug: 'hello',
        content: 'Content',
        published_at: publishedAt,
      });
    });
  });

  describe('list', () => {
    it('lists blog posts ordered by creation date', async () => {
      const builder = createBuilder();
      const posts: BlogPost[] = [];
      builder.orderBy.mockResolvedValue(posts);

      const db = createDbMock(builder);
      const repository = new BlogPostsRepository(db as never);

      const result = await repository.list();

      expect(builder.select).toHaveBeenCalled();
      expect(builder.orderBy).toHaveBeenCalledWith('created_at', 'desc');
      expect(builder.limit).not.toHaveBeenCalled();
      expect(result).toBe(posts);
    });

    it('applies limit when provided', async () => {
      const builder = createBuilder();

      const db = createDbMock(builder);
      const repository = new BlogPostsRepository(db as never);

      await repository.list(5);

      expect(builder.limit).toHaveBeenCalledWith(5);
    });
  });

  describe('findById', () => {
    it('returns blog post when found', async () => {
      const builder = createBuilder();
      builder.first.mockResolvedValue(post);

      const db = createDbMock(builder);
      const repository = new BlogPostsRepository(db as never);

      await expect(repository.findById(1)).resolves.toEqual(post);
      expect(builder.where).toHaveBeenCalledWith({ id: 1 });
    });

    it('returns null when post does not exist', async () => {
      const builder = createBuilder();
      builder.first.mockResolvedValue(undefined);

      const db = createDbMock(builder);
      const repository = new BlogPostsRepository(db as never);

      await expect(repository.findById(999)).resolves.toBeNull();
    });
  });

  describe('update', () => {
    it('returns null when updating a missing blog post', async () => {
      const builder = createBuilder();
      builder.update.mockResolvedValue(0);

      const db = createDbMock(builder);
      const repository = new BlogPostsRepository(db as never);

      const result = await repository.update(10, { title: 'Updated' });

      expect(builder.update).toHaveBeenCalledWith({ title: 'Updated' });
      expect(result).toBeNull();
    });

    it('returns updated post when update succeeds', async () => {
      const builder = createBuilder();
      builder.update.mockResolvedValue(1);
      builder.first.mockResolvedValue({ ...post, title: 'Updated' });

      const db = createDbMock(builder);
      const repository = new BlogPostsRepository(db as never);

      await expect(repository.update(1, { title: 'Updated' })).resolves.toEqual(
        {
          ...post,
          title: 'Updated',
        },
      );
    });

    it('returns current post when no fields are provided', async () => {
      const builder = createBuilder();

      const db = createDbMock(builder);
      const repository = new BlogPostsRepository(db as never);
      const findByIdSpy = jest
        .spyOn(repository, 'findById')
        .mockResolvedValue(post);

      await expect(repository.update(1, {})).resolves.toEqual(post);
      expect(findByIdSpy).toHaveBeenCalledWith(1);
      expect(builder.update).not.toHaveBeenCalled();
    });
  });

  describe('publish', () => {
    it('returns null when publishing missing post', async () => {
      const builder = createBuilder();
      builder.update.mockResolvedValue(0);

      const db = createDbMock(builder);
      const repository = new BlogPostsRepository(db as never);

      await expect(repository.publish(10)).resolves.toBeNull();
    });

    it('returns post when publish succeeds', async () => {
      const builder = createBuilder();
      const published = { ...post, publishedAt: new Date() };
      builder.update.mockResolvedValue(1);
      builder.first.mockResolvedValue(published);

      const db = createDbMock(builder);
      const repository = new BlogPostsRepository(db as never);

      await expect(repository.publish(1)).resolves.toEqual(published);
      expect(builder.update).toHaveBeenCalledWith({
        published_at: expect.any(Date),
      });
    });
  });

  describe('delete', () => {
    it('deletes blog posts by id', async () => {
      const builder = createBuilder();
      builder.del.mockResolvedValue(1);

      const db = createDbMock(builder);
      const repository = new BlogPostsRepository(db as never);

      const result = await repository.delete(5);

      expect(builder.del).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('returns false when nothing is deleted', async () => {
      const builder = createBuilder();
      builder.del.mockResolvedValue(0);

      const db = createDbMock(builder);
      const repository = new BlogPostsRepository(db as never);

      await expect(repository.delete(5)).resolves.toBe(false);
    });
  });
});
