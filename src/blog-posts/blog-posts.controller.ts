import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { BlogPostsService } from './blog-posts.service';
import {
  BlogPostResponseDto,
  BlogPostIdParamsDto,
  CreateBlogPostBodyDto,
  ListBlogPostsQueryDto,
  UpdateBlogPostBodyDto,
} from './blog-posts.schemas';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ZodResponse } from 'nestjs-zod';

@ApiTags('Blog Posts')
@Controller('blog-posts')
export class BlogPostsController {
  constructor(private readonly service: BlogPostsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a blog post' })
  @ZodResponse({ status: 201, type: BlogPostResponseDto })
  async create(@Body() body: CreateBlogPostBodyDto) {
    return this.service.create(body);
  }

  @Get()
  @ApiOperation({ summary: 'List blog posts' })
  @ZodResponse({ status: 200, type: [BlogPostResponseDto] })
  async list(@Query() query: ListBlogPostsQueryDto) {
    return this.service.list(query.limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get blog post by id' })
  @ZodResponse({ status: 200, type: BlogPostResponseDto })
  async get(@Param() params: BlogPostIdParamsDto) {
    return this.service.get(params.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update blog post by id' })
  @ZodResponse({ status: 200, type: BlogPostResponseDto })
  async update(
    @Param() params: BlogPostIdParamsDto,
    @Body() body: UpdateBlogPostBodyDto,
  ) {
    return this.service.update(params.id, body);
  }

  @Post(':id')
  @ApiOperation({ summary: 'Publish blog post by id' })
  @ZodResponse({ status: 201, type: BlogPostResponseDto })
  async pusblish(@Param() params: BlogPostIdParamsDto) {
    return this.service.publish(params.id);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param() params: BlogPostIdParamsDto) {
    await this.service.delete(params.id);
  }
}
