import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { BlogPostsRepository } from './blog-posts.repository.js';
import type {
  BlogPost,
  CreateBlogPostInput,
  UpdateBlogPostInput,
} from './blog-posts.types.js';

@Injectable()
export class BlogPostsService {
  constructor(private readonly repository: BlogPostsRepository) {}

  async create(input: CreateBlogPostInput): Promise<BlogPost> {
    const post = await this.repository.create(input);

    if (!post) {
      throw new InternalServerErrorException('Failed to create blog post');
    }

    return post;
  }

  async list(): Promise<BlogPost[]> {
    return this.repository.list();
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

  async delete(id: number): Promise<void> {
    const deleted = await this.repository.delete(id);

    if (!deleted) {
      throw new NotFoundException('Blog post not found');
    }
  }
}
