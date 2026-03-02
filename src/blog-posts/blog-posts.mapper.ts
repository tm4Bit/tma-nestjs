import type {
  BlogPost,
  CreateBlogPostInput,
  UpdateBlogPostInput,
} from './blog-posts.domain.types';
import type {
  BlogPostResponse,
  CreateBlogPostBody,
  UpdateBlogPostBody,
} from './blog-posts.http.schemas';

export const toCreateBlogPostInput = (
  body: CreateBlogPostBody,
): CreateBlogPostInput => {
  return {
    title: body.title,
    slug: body.slug,
    content: body.content,
    ...(body.publishedAt !== undefined
      ? { publishedAt: body.publishedAt }
      : {}),
  };
};

export const toUpdateBlogPostInput = (
  body: UpdateBlogPostBody,
): UpdateBlogPostInput => {
  return {
    ...(body.title !== undefined ? { title: body.title } : {}),
    ...(body.slug !== undefined ? { slug: body.slug } : {}),
    ...(body.content !== undefined ? { content: body.content } : {}),
  };
};

export const toBlogPostResponse = (post: BlogPost): BlogPostResponse => {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    content: post.content,
    publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  };
};

export const toBlogPostResponseList = (
  posts: BlogPost[],
): BlogPostResponse[] => {
  return posts.map(toBlogPostResponse);
};
