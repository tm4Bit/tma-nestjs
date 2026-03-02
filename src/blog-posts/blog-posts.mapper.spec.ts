import type { BlogPost } from './blog-posts.domain.types';
import {
  toBlogPostResponse,
  toBlogPostResponseList,
  toCreateBlogPostInput,
  toUpdateBlogPostInput,
} from './blog-posts.mapper';

describe('blog-posts mapper', () => {
  describe('toCreateBlogPostInput', () => {
    it('maps create body and preserves publishedAt when present', () => {
      const input = toCreateBlogPostInput({
        title: 'Hello',
        slug: 'hello',
        content: 'Body',
        publishedAt: '2026-03-01T10:00:00.000Z',
      });

      expect(input).toEqual({
        title: 'Hello',
        slug: 'hello',
        content: 'Body',
        publishedAt: '2026-03-01T10:00:00.000Z',
      });
    });

    it('omits publishedAt when not provided', () => {
      const input = toCreateBlogPostInput({
        title: 'Hello',
        slug: 'hello',
        content: 'Body',
      });

      expect(input).toEqual({
        title: 'Hello',
        slug: 'hello',
        content: 'Body',
      });
      expect(Object.hasOwn(input, 'publishedAt')).toBe(false);
    });
  });

  describe('toUpdateBlogPostInput', () => {
    it('maps only provided update fields', () => {
      expect(
        toUpdateBlogPostInput({
          title: 'Updated',
          content: 'Updated body',
        }),
      ).toEqual({
        title: 'Updated',
        content: 'Updated body',
      });
    });
  });

  describe('toBlogPostResponse', () => {
    const post: BlogPost = {
      id: 1,
      title: 'Hello',
      slug: 'hello',
      content: 'Body',
      publishedAt: new Date('2026-03-01T08:00:00.000Z'),
      createdAt: new Date('2026-03-01T07:00:00.000Z'),
      updatedAt: new Date('2026-03-01T09:00:00.000Z'),
    };

    it('converts domain Date fields to ISO strings', () => {
      expect(toBlogPostResponse(post)).toEqual({
        id: 1,
        title: 'Hello',
        slug: 'hello',
        content: 'Body',
        publishedAt: '2026-03-01T08:00:00.000Z',
        createdAt: '2026-03-01T07:00:00.000Z',
        updatedAt: '2026-03-01T09:00:00.000Z',
      });
    });

    it('keeps nullable publishedAt as null', () => {
      expect(
        toBlogPostResponse({ ...post, publishedAt: null }).publishedAt,
      ).toBe(null);
    });

    it('maps lists consistently', () => {
      const result = toBlogPostResponseList([post, { ...post, id: 2 }]);

      expect(result).toHaveLength(2);
      expect(result[0]?.createdAt).toBe('2026-03-01T07:00:00.000Z');
      expect(result[1]?.id).toBe(2);
    });
  });
});
