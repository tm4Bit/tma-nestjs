import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { BlogPostsController } from '../src/blog-posts/blog-posts.controller.js';
import { BlogPostsRepository } from '../src/blog-posts/blog-posts.repository.js';
import { BlogPostsService } from '../src/blog-posts/blog-posts.service.js';
import { configureHttpApp } from '../src/bootstrap/configure-http-app.js';
import { PROBLEM_JSON_CONTENT_TYPE } from '../src/errors/problem-details.js';

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
    delete: jest.Mock;
  };

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
    configureHttpApp(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
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

    expect(repository.list).toHaveBeenCalledWith(undefined);
  });

  it('GET /blog-posts supports validated query params', async () => {
    repository.list.mockResolvedValue([{ id: 1 }]);

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
    repository.findById.mockResolvedValue({ id: 2, title: 'Post' });

    await request(app.getHttpServer())
      .get('/blog-posts/2')
      .expect(200)
      .expect(({ body }) => {
        const response = body as { id?: number };
        expect(response.id).toBe(2);
      });
  });

  it('GET /blog-posts/:id rejects invalid path params', async () => {
    await request(app.getHttpServer())
      .get('/blog-posts/abc')
      .expect(400)
      .expect('Content-Type', problemJsonContentTypePattern);
  });

  it('PUT /blog-posts/:id updates a post', async () => {
    repository.update.mockResolvedValue({ id: 3, title: 'Updated' });

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
    repository.update.mockResolvedValue({ id: 3, slug: 'updated-slug' });

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
