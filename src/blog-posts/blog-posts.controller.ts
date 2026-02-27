import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { BlogPostsService } from './blog-posts.service.js';
import {
  blogPostIdSchema,
  createBlogPostSchema,
  updateBlogPostSchema,
} from './blog-posts.schemas.js';

@Controller('blog-posts')
export class BlogPostsController {
  constructor(private readonly service: BlogPostsService) {}

  @Post()
  async create(@Body() body: unknown) {
    const input = createBlogPostSchema.parse(body);
    return this.service.create(input);
  }

  @Get()
  async list() {
    return this.service.list();
  }

  @Get(':id')
  async get(@Param() params: unknown) {
    const { id } = blogPostIdSchema.parse(params);
    return this.service.get(id);
  }

  @Patch(':id')
  async update(@Param() params: unknown, @Body() body: unknown) {
    const { id } = blogPostIdSchema.parse(params);
    const input = updateBlogPostSchema.parse(body);
    return this.service.update(id, input);
  }

  @Delete(':id')
  async remove(@Param() params: unknown) {
    const { id } = blogPostIdSchema.parse(params);
    await this.service.delete(id);
    return { status: 'ok' };
  }
}
