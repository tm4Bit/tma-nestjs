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
  BlogPostIdParamsDto,
  BlogPostResponseDto,
  CreateBlogPostBodyDto,
  ListBlogPostsQueryDto,
  UpdateBlogPostBodyDto,
} from './blog-posts.http.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ZodResponse } from 'nestjs-zod';
import {
  toBlogPostResponse,
  toBlogPostResponseList,
  toCreateBlogPostInput,
  toUpdateBlogPostInput,
} from './blog-posts.mapper';

@ApiTags('Blog Posts')
@Controller('blog-posts')
export class BlogPostsController {
  constructor(private readonly service: BlogPostsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a blog post' })
  @ZodResponse({ status: 201, type: BlogPostResponseDto })
  async create(@Body() body: CreateBlogPostBodyDto) {
    const post = await this.service.create(toCreateBlogPostInput(body));

    return toBlogPostResponse(post);
  }

  @Get()
  @ApiOperation({ summary: 'List blog posts' })
  @ZodResponse({ status: 200, type: [BlogPostResponseDto] })
  async list(@Query() query: ListBlogPostsQueryDto) {
    const posts = await this.service.list(query.limit);

    return toBlogPostResponseList(posts);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get blog post by id' })
  @ZodResponse({ status: 200, type: BlogPostResponseDto })
  async get(@Param() params: BlogPostIdParamsDto) {
    const post = await this.service.get(params.id);

    return toBlogPostResponse(post);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update blog post by id' })
  @ZodResponse({ status: 200, type: BlogPostResponseDto })
  async update(
    @Param() params: BlogPostIdParamsDto,
    @Body() body: UpdateBlogPostBodyDto,
  ) {
    const post = await this.service.update(
      params.id,
      toUpdateBlogPostInput(body),
    );

    return toBlogPostResponse(post);
  }

  @Post(':id')
  @ApiOperation({ summary: 'Publish blog post by id' })
  @ZodResponse({ status: 201, type: BlogPostResponseDto })
  async pusblish(@Param() params: BlogPostIdParamsDto) {
    const post = await this.service.publish(params.id);

    return toBlogPostResponse(post);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param() params: BlogPostIdParamsDto) {
    await this.service.delete(params.id);
  }
}
