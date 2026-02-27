import { z } from 'zod';

export const blogPostIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const createBlogPostSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  content: z.string().min(1),
  publishedAt: z.coerce.date().optional().nullable(),
});

export const updateBlogPostSchema = z
  .object({
    title: z.string().min(1).optional(),
    slug: z.string().min(1).optional(),
    content: z.string().min(1).optional(),
    publishedAt: z.coerce.date().optional().nullable(),
  })
  .refine(
    (data) =>
      data.title !== undefined ||
      data.slug !== undefined ||
      data.content !== undefined ||
      data.publishedAt !== undefined,
    {
      message: 'At least one field must be provided',
    },
  );
