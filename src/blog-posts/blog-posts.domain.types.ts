export type BlogPost = {
  id: number;
  title: string;
  slug: string;
  content: string;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateBlogPostInput = {
  title: string;
  slug: string;
  content: string;
  publishedAt?: Date | string | null;
};

export type UpdateBlogPostInput = {
  title?: string;
  slug?: string;
  content?: string;
};

// Queue

export const BLOG_POSTS_QUEUE = 'blog-posts' as const;

export const BlogPostsJobName = {
  SendWelcomeEmail: 'send-welcome-email',
} as const;

export type SendWelcomeEmailJobPayload = {
  postId: number;
  title: string;
  slug: string;
};
