import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const dateTimeStringSchema = z.preprocess(
  (value) => (value instanceof Date ? value.toISOString() : value),
  z.string().datetime(),
);

const nullableDateTimeStringSchema = z.preprocess(
  (value) => (value instanceof Date ? value.toISOString() : value),
  z.string().datetime().nullable(),
);

export const blogPostIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const listBlogPostsQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const createBlogPostSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  content: z.string().min(1),
  publishedAt: z.string().datetime().optional().nullable(),
});

export const updateBlogPostSchema = z
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

export const blogPostResponseSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1),
  slug: z.string().min(1),
  content: z.string().min(1),
  publishedAt: nullableDateTimeStringSchema,
  createdAt: dateTimeStringSchema,
  updatedAt: dateTimeStringSchema,
});

export class BlogPostIdParamsDto extends createZodDto(blogPostIdSchema) {}

export class ListBlogPostsQueryDto extends createZodDto(
  listBlogPostsQuerySchema,
) {}

export class CreateBlogPostBodyDto extends createZodDto(createBlogPostSchema) {}

export class UpdateBlogPostBodyDto extends createZodDto(updateBlogPostSchema) {}

export class BlogPostResponseDto extends createZodDto(blogPostResponseSchema) {}
