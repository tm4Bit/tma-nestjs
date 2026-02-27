import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { BlogPostsService } from './blog-posts.service.js';
import {
  BlogPostIdParamsDto,
  CreateBlogPostBodyDto,
  ListBlogPostsQueryDto,
  UpdateBlogPostBodyDto,
} from './blog-posts.schemas.js';
import {
  zodBodyValidationPipe,
  zodParamsValidationPipe,
  zodQueryValidationPipe,
} from '../validation/zod-validation.js';

@Controller('blog-posts')
export class BlogPostsController {
  constructor(private readonly service: BlogPostsService) {}

  @Post()
  async create(@Body(zodBodyValidationPipe) body: CreateBlogPostBodyDto) {
    return this.service.create(body);
  }

  @Get()
  async list(@Query(zodQueryValidationPipe) query: ListBlogPostsQueryDto) {
    return this.service.list(query.limit);
  }

  @Get(':id')
  async get(@Param(zodParamsValidationPipe) params: BlogPostIdParamsDto) {
    return this.service.get(params.id);
  }

  @Patch(':id')
  async update(
    @Param(zodParamsValidationPipe) params: BlogPostIdParamsDto,
    @Body(zodBodyValidationPipe) body: UpdateBlogPostBodyDto,
  ) {
    return this.service.update(params.id, body);
  }

  @Delete(':id')
  async remove(@Param(zodParamsValidationPipe) params: BlogPostIdParamsDto) {
    await this.service.delete(params.id);
    return { status: 'ok' };
  }
}
