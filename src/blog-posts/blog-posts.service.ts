import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { BlogPostsRepository } from './blog-posts.repository';
import type {
  BlogPost,
  CreateBlogPostInput,
  UpdateBlogPostInput,
  SendWelcomeEmailJobPayload,
} from './blog-posts.domain.types';
import { BLOG_POSTS_QUEUE, BlogPostsJobName } from './blog-posts.domain.types';

@Injectable()
export class BlogPostsService {
  constructor(
    private readonly repository: BlogPostsRepository,
    @InjectQueue(BLOG_POSTS_QUEUE) private readonly queue: Queue,
  ) {}

  async create(input: CreateBlogPostInput): Promise<BlogPost> {
    const post = await this.repository.create(input);

    if (!post) {
      throw new InternalServerErrorException('Failed to create blog post');
    }

    await this.queue.add(BlogPostsJobName.SendWelcomeEmail, {
      postId: post.id,
      title: post.title,
      slug: post.slug,
    } satisfies SendWelcomeEmailJobPayload);

    return post;
  }

  async list(limit?: number): Promise<BlogPost[]> {
    return this.repository.list(limit);
  }

  async get(id: number): Promise<BlogPost> {
    const post = await this.repository.findById(id);

    if (!post) {
      throw new NotFoundException('Blog post not found');
    }

    return post;
  }

  async update(id: number, input: UpdateBlogPostInput): Promise<BlogPost> {
    const post = await this.repository.update(id, input);

    if (!post) {
      throw new NotFoundException('Blog post not found');
    }

    return post;
  }

  async publish(id: number): Promise<BlogPost> {
    const post = await this.repository.publish(id);

    if (!post) {
      throw new NotFoundException('Blog post not found');
    }

    return post;
  }

  async delete(id: number): Promise<void> {
    const deleted = await this.repository.delete(id);

    if (!deleted) {
      throw new NotFoundException('Blog post not found');
    }
  }
}
