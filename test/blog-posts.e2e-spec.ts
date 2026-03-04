import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';
import { getQueueToken } from '@nestjs/bullmq';
import request from 'supertest';
import { App } from 'supertest/types';
import { BlogPostsController } from '../src/blog-posts/blog-posts.controller';
import { BlogPostsRepository } from '../src/blog-posts/blog-posts.repository';
import { BlogPostsService } from '../src/blog-posts/blog-posts.service';
import { BLOG_POSTS_QUEUE } from '../src/blog-posts/blog-posts.domain.types';
import { configureHttpApp } from '../src/bootstrap/configure-http-app';
import { PROBLEM_JSON_CONTENT_TYPE } from '../src/errors/problem-details';

const problemJsonContentTypePattern = new RegExp(
  PROBLEM_JSON_CONTENT_TYPE.replace('+', '\\+'),
);

describe('BlogPostsController (e2e)', () => {
  let app: INestApplication<App>;
  let repository: {
    create: jest.Mock;
    list: jest.Mock;
    findById: jest.Mock;
    update: jest.Mock;
    publish: jest.Mock;
    delete: jest.Mock;
  };

  const buildPost = (overrides: Record<string, unknown> = {}) => ({
    id: 1,
    title: 'Hello',
    slug: 'hello',
    content: 'Body',
    publishedAt: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  });

  const expectProblemDetailsBase = (
    body: unknown,
    expectedStatus: number,
  ): void => {
    const response = body as {
      type?: string;
      title?: string;
      status?: number;
      detail?: string;
      instance?: string;
    };

    expect(typeof response.type).toBe('string');
    expect(typeof response.title).toBe('string');
    expect(response.status).toBe(expectedStatus);
    expect(typeof response.detail).toBe('string');
    expect(typeof response.instance).toBe('string');
  };

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      list: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      publish: jest.fn(),
      delete: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [BlogPostsController],
      providers: [
        BlogPostsService,
        { provide: APP_PIPE, useClass: ZodValidationPipe },
        { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },
        {
          provide: BlogPostsRepository,
          useValue: repository,
        },
        {
          provide: getQueueToken(BLOG_POSTS_QUEUE),
          useValue: { add: jest.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureHttpApp(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /blog-posts creates a post', async () => {
    repository.create.mockResolvedValue(
      buildPost({ internalTag: 'ignore-me' }),
    );

    await request(app.getHttpServer())
      .post('/blog-posts')
      .send({
        title: 'Hello',
        slug: 'hello',
        content: 'Body',
      })
      .expect(201)
      .expect(({ body }) => {
        const response = body as { title?: string; internalTag?: string };
        expect(response.title).toBe('Hello');
        expect(response.internalTag).toBeUndefined();
      });
  });

  it('GET /blog-posts lists posts', async () => {
    repository.list.mockResolvedValue([
      buildPost({ internalTag: 'list-extra' }),
    ]);

    await request(app.getHttpServer())
      .get('/blog-posts')
      .expect(200)
      .expect(({ body }) => {
        const response = body as Array<{ id?: number; internalTag?: string }>;
        expect(response).toHaveLength(1);
        expect(response[0]?.id).toBe(1);
        expect(response[0]?.internalTag).toBeUndefined();
      });

    expect(repository.list).toHaveBeenCalledWith(undefined);
  });

  it('GET /blog-posts supports validated query params', async () => {
    repository.list.mockResolvedValue([buildPost()]);

    await request(app.getHttpServer()).get('/blog-posts?limit=10').expect(200);

    expect(repository.list).toHaveBeenCalledWith(10);
  });

  it('GET /blog-posts rejects invalid query params', async () => {
    await request(app.getHttpServer())
      .get('/blog-posts?limit=0')
      .expect(400)
      .expect('Content-Type', problemJsonContentTypePattern)
      .expect(({ body }) => {
        const response = body as { type?: string };
        expect(response.type).toContain('/validation-error');
      });
  });

  it('GET /blog-posts/:id returns a post', async () => {
    repository.findById.mockResolvedValue(
      buildPost({ id: 2, title: 'Post', internalTag: 'hidden' }),
    );

    await request(app.getHttpServer())
      .get('/blog-posts/2')
      .expect(200)
      .expect(({ body }) => {
        const response = body as { id?: number; internalTag?: string };
        expect(response.id).toBe(2);
        expect(response.internalTag).toBeUndefined();
      });
  });

  it('GET /blog-posts/:id rejects invalid path params', async () => {
    await request(app.getHttpServer())
      .get('/blog-posts/abc')
      .expect(400)
      .expect('Content-Type', problemJsonContentTypePattern);
  });

  it('PUT /blog-posts/:id updates a post', async () => {
    repository.update.mockResolvedValue(buildPost({ id: 3, title: 'Updated' }));

    await request(app.getHttpServer())
      .put('/blog-posts/3')
      .send({ title: 'Updated' })
      .expect(200)
      .expect(({ body }) => {
        const response = body as { title?: string };
        expect(response.title).toBe('Updated');
      });

    expect(repository.update).toHaveBeenCalledWith(3, { title: 'Updated' });
  });

  it('PUT /blog-posts/:id allows partial update payload', async () => {
    repository.update.mockResolvedValue(
      buildPost({ id: 3, slug: 'updated-slug' }),
    );

    await request(app.getHttpServer())
      .put('/blog-posts/3')
      .send({ slug: 'updated-slug' })
      .expect(200)
      .expect(({ body }) => {
        const response = body as { slug?: string };
        expect(response.slug).toBe('updated-slug');
      });

    expect(repository.update).toHaveBeenCalledWith(3, { slug: 'updated-slug' });
  });

  it('POST /blog-posts/:id publishes a post', async () => {
    repository.publish.mockResolvedValue(
      buildPost({ id: 5, publishedAt: new Date('2026-01-02T00:00:00.000Z') }),
    );

    await request(app.getHttpServer())
      .post('/blog-posts/5')
      .expect(201)
      .expect(({ body }) => {
        const response = body as { id?: number; publishedAt?: string };
        expect(response.id).toBe(5);
        expect(typeof response.publishedAt).toBe('string');
      });

    expect(repository.publish).toHaveBeenCalledWith(5);
  });

  it('PUT /blog-posts/:id rejects empty object payload', async () => {
    await request(app.getHttpServer())
      .put('/blog-posts/3')
      .send({})
      .expect(400)
      .expect('Content-Type', problemJsonContentTypePattern)
      .expect(({ body }) => {
        expectProblemDetailsBase(body, 400);
        const response = body as { type?: string };
        expect(response.type).toContain('/validation-error');
      });
  });

  it('PUT /blog-posts/:id rejects null fields in payload', async () => {
    await request(app.getHttpServer())
      .put('/blog-posts/3')
      .send({ title: null })
      .expect(400)
      .expect('Content-Type', problemJsonContentTypePattern)
      .expect(({ body }) => {
        expectProblemDetailsBase(body, 400);
        const response = body as {
          type?: string;
          errors?: Array<{ path?: string }>;
        };
        expect(response.type).toContain('/validation-error');
        expect(response.errors?.some((issue) => issue.path === 'title')).toBe(
          true,
        );
      });
  });

  it('PUT /blog-posts/:id rejects invalid field types', async () => {
    await request(app.getHttpServer())
      .put('/blog-posts/3')
      .send({ title: 123 })
      .expect(400)
      .expect('Content-Type', problemJsonContentTypePattern)
      .expect(({ body }) => {
        expectProblemDetailsBase(body, 400);
        const response = body as { type?: string };
        expect(response.type).toContain('/validation-error');
      });
  });

  it('PUT /blog-posts/:id rejects invalid path params', async () => {
    await request(app.getHttpServer())
      .put('/blog-posts/abc')
      .send({ title: 'Updated' })
      .expect(400)
      .expect('Content-Type', problemJsonContentTypePattern)
      .expect(({ body }) => {
        expectProblemDetailsBase(body, 400);
      });
  });

  it('PUT /blog-posts/:id returns Problem Details for missing post', async () => {
    repository.update.mockResolvedValue(null);

    await request(app.getHttpServer())
      .put('/blog-posts/404')
      .send({ title: 'Updated' })
      .expect(404)
      .expect('Content-Type', problemJsonContentTypePattern)
      .expect(({ body }) => {
        expectProblemDetailsBase(body, 404);
        const response = body as {
          type?: string;
          title?: string;
          detail?: string;
        };
        expect(response.type).toContain('/http-exception');
        expect(response.title).toBe('Not Found');
        expect(response.detail).toBe('Blog post not found');
      });
  });

  it('DELETE /blog-posts/:id deletes a post', async () => {
    repository.delete.mockResolvedValue(true);

    await request(app.getHttpServer())
      .delete('/blog-posts/4')
      .expect(204)
      .expect(({ body }) => {
        expect(body).toEqual({});
      });
  });

  it('POST /blog-posts rejects invalid request body', async () => {
    await request(app.getHttpServer())
      .post('/blog-posts')
      .send({ title: '' })
      .expect(400)
      .expect('Content-Type', problemJsonContentTypePattern);
  });

  it('GET /blog-posts/:id returns Problem Details for HttpException', async () => {
    repository.findById.mockResolvedValue(null);

    await request(app.getHttpServer())
      .get('/blog-posts/404')
      .expect(404)
      .expect('Content-Type', problemJsonContentTypePattern)
      .expect(({ body }) => {
        expectProblemDetailsBase(body, 404);
        const response = body as {
          type?: string;
          title?: string;
          detail?: string;
        };
        expect(response.type).toContain('/http-exception');
        expect(response.title).toBe('Not Found');
        expect(response.detail).toBe('Blog post not found');
      });
  });

  it('POST /blog-posts maps duplicate key to 409 problem details', async () => {
    repository.create.mockRejectedValue({ code: 'ER_DUP_ENTRY', errno: 1062 });

    await request(app.getHttpServer())
      .post('/blog-posts')
      .send({ title: 'Hello', slug: 'hello', content: 'Body' })
      .expect(409)
      .expect('Content-Type', problemJsonContentTypePattern)
      .expect(({ body }) => {
        expectProblemDetailsBase(body, 409);
        const response = body as { type?: string };
        expect(response.type).toContain('/database-conflict');
      });
  });

  it('GET /blog-posts maps transient db failure to 503 problem details', async () => {
    repository.list.mockRejectedValue({ name: 'KnexTimeoutError' });

    await request(app.getHttpServer())
      .get('/blog-posts')
      .expect(503)
      .expect('Content-Type', problemJsonContentTypePattern)
      .expect(({ body }) => {
        expectProblemDetailsBase(body, 503);
        const response = body as { type?: string };
        expect(response.type).toContain('/database-unavailable');
      });
  });

  it('GET /blog-posts maps unknown errors to 500 problem details', async () => {
    repository.list.mockRejectedValue(new Error('unexpected failure'));

    await request(app.getHttpServer())
      .get('/blog-posts')
      .expect(500)
      .expect('Content-Type', problemJsonContentTypePattern)
      .expect(({ body }) => {
        expectProblemDetailsBase(body, 500);
        const response = body as { type?: string };
        expect(response.type).toContain('/unexpected-error');
      });
  });
});
