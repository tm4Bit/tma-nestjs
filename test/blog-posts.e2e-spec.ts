import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { BlogPostsController } from '../src/blog-posts/blog-posts.controller.js';
import { BlogPostsRepository } from '../src/blog-posts/blog-posts.repository.js';
import { BlogPostsService } from '../src/blog-posts/blog-posts.service.js';

describe('BlogPostsController (e2e)', () => {
  let app: INestApplication<App>;
  let repository: {
    create: jest.Mock;
    list: jest.Mock;
    findById: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      list: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [BlogPostsController],
      providers: [
        BlogPostsService,
        {
          provide: BlogPostsRepository,
          useValue: repository,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('POST /blog-posts creates a post', async () => {
    repository.create.mockResolvedValue({
      id: 1,
      title: 'Hello',
      slug: 'hello',
      content: 'Body',
      publishedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await request(app.getHttpServer())
      .post('/blog-posts')
      .send({
        title: 'Hello',
        slug: 'hello',
        content: 'Body',
      })
      .expect(201)
      .expect(({ body }) => {
        const response = body as { title?: string };
        expect(response.title).toBe('Hello');
      });
  });

  it('GET /blog-posts lists posts', async () => {
    repository.list.mockResolvedValue([{ id: 1 }]);

    await request(app.getHttpServer())
      .get('/blog-posts')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual([{ id: 1 }]);
      });
  });

  it('GET /blog-posts/:id returns a post', async () => {
    repository.findById.mockResolvedValue({ id: 2, title: 'Post' });

    await request(app.getHttpServer())
      .get('/blog-posts/2')
      .expect(200)
      .expect(({ body }) => {
        const response = body as { id?: number };
        expect(response.id).toBe(2);
      });
  });

  it('PATCH /blog-posts/:id updates a post', async () => {
    repository.update.mockResolvedValue({ id: 3, title: 'Updated' });

    await request(app.getHttpServer())
      .patch('/blog-posts/3')
      .send({ title: 'Updated' })
      .expect(200)
      .expect(({ body }) => {
        const response = body as { title?: string };
        expect(response.title).toBe('Updated');
      });
  });

  it('DELETE /blog-posts/:id deletes a post', async () => {
    repository.delete.mockResolvedValue(true);

    await request(app.getHttpServer())
      .delete('/blog-posts/4')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual({ status: 'ok' });
      });
  });
});
