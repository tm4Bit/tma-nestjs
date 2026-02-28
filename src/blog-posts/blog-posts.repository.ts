import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { KNEX_CONNECTION } from '../database/knex.config.js';
import { Repository } from '../database/repository.js';
import type {
  BlogPost,
  CreateBlogPostInput,
  UpdateBlogPostInput,
} from './blog-posts.types.js';

@Injectable()
export class BlogPostsRepository extends Repository {
  constructor(@Inject(KNEX_CONNECTION) db: Knex) {
    super(db);
  }

  async create(input: CreateBlogPostInput): Promise<BlogPost | null> {
    const [id] = await this.db('blog_posts').insert({
      title: input.title,
      slug: input.slug,
      content: input.content,
      published_at: input.publishedAt ?? null,
    });

    return this.findById(Number(id));
  }

  async list(limit?: number): Promise<BlogPost[]> {
    const query = this.db('blog_posts')
      .select(
        'id',
        'title',
        'slug',
        'content',
        'published_at as publishedAt',
        'created_at as createdAt',
        'updated_at as updatedAt',
      )
      .orderBy('created_at', 'desc');

    if (limit !== undefined) {
      query.limit(limit);
    }

    return query as Promise<BlogPost[]>;
  }

  async findById(id: number): Promise<BlogPost | null> {
    const post = (await this.db('blog_posts')
      .select(
        'id',
        'title',
        'slug',
        'content',
        'published_at as publishedAt',
        'created_at as createdAt',
        'updated_at as updatedAt',
      )
      .where({ id })
      .first()) as BlogPost | undefined;

    return post ?? null;
  }

  async update(
    id: number,
    input: UpdateBlogPostInput,
  ): Promise<BlogPost | null> {
    const updated = await this.db('blog_posts').where({ id }).update(input);

    if (!updated) {
      return null;
    }

    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const deleted = await this.db('blog_posts').where({ id }).del();

    return deleted > 0;
  }

  async publish(id: number): Promise<BlogPost | null> {
    const updated = await this.db('blog_posts')
      .where({ id })
      .update({ published_at: new Date() });

    return updated ? this.findById(id) : null;
  }
}
