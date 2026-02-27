import { BlogPostsRepository } from './blog-posts.repository.js';
import type { BlogPost } from './blog-posts.types.js';

type Builder = {
  select: jest.Mock;
  where: jest.Mock;
  orderBy: jest.Mock;
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
  first: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  del: jest.fn(),
});

describe('BlogPostsRepository', () => {
  it('creates a blog post and returns it', async () => {
    const builder = createBuilder();
    const created: BlogPost = {
      id: 1,
      title: 'Hello',
      slug: 'hello',
      content: 'Content',
      publishedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    builder.insert.mockResolvedValue([1]);
    builder.first.mockResolvedValue(created);

    const db = createDbMock(builder);
    const repository = new BlogPostsRepository(db as never);

    const result = await repository.create({
      title: 'Hello',
      slug: 'hello',
      content: 'Content',
    });

    expect(db).toHaveBeenCalledWith('blog_posts');
    expect(builder.insert).toHaveBeenCalledWith({
      title: 'Hello',
      slug: 'hello',
      content: 'Content',
      published_at: null,
    });
    expect(result).toEqual(created);
  });

  it('lists blog posts ordered by creation date', async () => {
    const builder = createBuilder();
    const posts: BlogPost[] = [];
    builder.orderBy.mockResolvedValue(posts);

    const db = createDbMock(builder);
    const repository = new BlogPostsRepository(db as never);

    const result = await repository.list();

    expect(builder.select).toHaveBeenCalled();
    expect(builder.orderBy).toHaveBeenCalledWith('created_at', 'desc');
    expect(result).toBe(posts);
  });

  it('returns null when updating a missing blog post', async () => {
    const builder = createBuilder();
    builder.update.mockResolvedValue(0);

    const db = createDbMock(builder);
    const repository = new BlogPostsRepository(db as never);

    const result = await repository.update(10, { title: 'Updated' });

    expect(builder.update).toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it('deletes blog posts by id', async () => {
    const builder = createBuilder();
    builder.del.mockResolvedValue(1);

    const db = createDbMock(builder);
    const repository = new BlogPostsRepository(db as never);

    const result = await repository.delete(5);

    expect(builder.del).toHaveBeenCalled();
    expect(result).toBe(true);
  });
});
