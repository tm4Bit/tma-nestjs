import { createZodDto } from 'nestjs-zod';
import {
  BlogPostIdParamsSchema,
  BlogPostResponseSchema,
  CreateBlogPostBodySchema,
  ListBlogPostsQuerySchema,
  UpdateBlogPostBodySchema,
} from './blog-posts.http.schemas';

export class BlogPostIdParamsDto extends createZodDto(BlogPostIdParamsSchema) {}

export class ListBlogPostsQueryDto extends createZodDto(
  ListBlogPostsQuerySchema,
) {}

export class CreateBlogPostBodyDto extends createZodDto(
  CreateBlogPostBodySchema,
) {}

export class UpdateBlogPostBodyDto extends createZodDto(
  UpdateBlogPostBodySchema,
) {}

export class BlogPostResponseDto extends createZodDto(BlogPostResponseSchema) {}
