import { z } from 'zod';

export const BlogPostIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const ListBlogPostsQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const CreateBlogPostBodySchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  content: z.string().min(1),
  publishedAt: z.string().optional().nullable(),
});

export const UpdateBlogPostBodySchema = z
  .object({
    title: z.string().min(1).optional(),
    slug: z.string().min(1).optional(),
    content: z.string().min(1).optional(),
  })
  .refine(
    (data) =>
      data.title !== undefined ||
      data.slug !== undefined ||
      data.content !== undefined,
    {
      message: 'At least one field must be provided',
    },
  );

export const BlogPostResponseSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1),
  slug: z.string().min(1),
  content: z.string().min(1),
  publishedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const ListBlogPostsResponseSchema = z.array(BlogPostResponseSchema);

export type CreateBlogPostBody = z.infer<typeof CreateBlogPostBodySchema>;
export type UpdateBlogPostBody = z.infer<typeof UpdateBlogPostBodySchema>;
export type BlogPostResponse = z.infer<typeof BlogPostResponseSchema>;
